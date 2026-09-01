from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from django.db import IntegrityError, DatabaseError
from bookings.models import Booking
from guests.models import Guest
from rooms.models import Room
from api.schemas.bookings import BookingCreate, BookingUpdate, BookingResponse
from api.dependencies.auth import get_current_user, TokenData

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

def format_booking_response(b: Booking) -> BookingResponse:
    return BookingResponse(
        booking_id=b.booking_id,
        guest_id=b.guest_id,
        room_id=b.room_id,
        check_in=b.check_in,
        check_out=b.check_out,
        guest_count=b.guest_count,
        status=b.status,
        guest_name=b.guest.name if b.guest else None,
        guest_email=b.guest.email if b.guest else None,
        property_name=b.room.property.name if b.room and b.room.property else None,
        room_number=b.room.room_number if b.room else None,
        room_type_name=b.room.room_type.type_name if b.room and b.room.room_type else None,
        nights_count=b.nights_count,
        total_paid=float(b.total_paid)
    )

@router.get("", response_model=List[BookingResponse])
def get_bookings(
    status_filter: Optional[str] = None,
    guest_id: Optional[int] = None,
    room_id: Optional[int] = None,
    current_user: TokenData = Depends(get_current_user)
):
    queryset = Booking.objects.select_related('guest', 'room__property', 'room__room_type').prefetch_related('payments').all()
    if current_user.role == 'Guest':
        if current_user.guest_id:
            queryset = queryset.filter(guest_id=current_user.guest_id)
        elif current_user.email:
            queryset = queryset.filter(guest__email__iexact=current_user.email)
    elif guest_id:
        queryset = queryset.filter(guest_id=guest_id)
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    if room_id:
        queryset = queryset.filter(room_id=room_id)

    return [format_booking_response(b) for b in queryset]

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, current_user: TokenData = Depends(get_current_user)):
    try:
        b = Booking.objects.select_related('guest', 'room__property', 'room__room_type').prefetch_related('payments').get(pk=booking_id)
        return format_booking_response(b)
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        guest = Guest.objects.get(pk=payload.guest_id)
        room = Room.objects.select_related('room_type', 'property').get(pk=payload.room_id)

        # Enforce check-in/check-out validity
        if payload.check_out <= payload.check_in:
            raise HTTPException(status_code=400, detail="check_out date must be after check_in date")

        # Save to database to trigger PostgreSQL constraints/triggers
        b = Booking.objects.create(
            guest=guest,
            room=room,
            check_in=payload.check_in,
            check_out=payload.check_out,
            guest_count=payload.guest_count,
            status=payload.status
        )
        return format_booking_response(b)

    except (Guest.DoesNotExist, Room.DoesNotExist):
        raise HTTPException(status_code=400, detail="Invalid guest_id or room_id")
    except (IntegrityError, DatabaseError) as db_err:
        err_msg = str(db_err)
        if "exceeds maximum occupancy" in err_msg:
            raise HTTPException(
                status_code=400,
                detail=f"Room capacity exceeded: Guest count ({payload.guest_count}) exceeds maximum occupancy for room {room.room_number}"
            )
        if "no_overlapping_bookings" in err_msg or "conflicting key value violates exclusion constraint" in err_msg:
            raise HTTPException(
                status_code=400,
                detail=f"Double booking error: Room {room.room_number} is already booked for the selected dates ({payload.check_in} to {payload.check_out})"
            )
        raise HTTPException(status_code=400, detail=f"Database constraint violation: {err_msg}")

@router.patch("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    payload: BookingUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        b = Booking.objects.select_related('guest', 'room__property', 'room__room_type').get(pk=booking_id)
        if payload.guest_id is not None:
            b.guest = Guest.objects.get(pk=payload.guest_id)
        if payload.room_id is not None:
            b.room = Room.objects.get(pk=payload.room_id)
        if payload.check_in is not None:
            b.check_in = payload.check_in
        if payload.check_out is not None:
            b.check_out = payload.check_out
        if payload.guest_count is not None:
            b.guest_count = payload.guest_count
        if payload.status is not None:
            b.status = payload.status

        b.save()
        return format_booking_response(b)
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")
    except (IntegrityError, DatabaseError) as db_err:
        err_msg = str(db_err)
        if "exceeds maximum occupancy" in err_msg:
            raise HTTPException(status_code=400, detail="Room capacity exceeded for update")
        if "no_overlapping_bookings" in err_msg:
            raise HTTPException(status_code=400, detail="Double booking conflict on update")
        raise HTTPException(status_code=400, detail=err_msg)

@router.delete("/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_booking(booking_id: int, current_user: TokenData = Depends(get_current_user)):
    try:
        b = Booking.objects.get(pk=booking_id)
        b.status = 'cancelled'
        b.save()
        return {"message": f"Booking #{booking_id} status set to cancelled"}
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")
