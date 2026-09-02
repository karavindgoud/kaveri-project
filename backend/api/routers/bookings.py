from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Optional
from datetime import date
from django.db import IntegrityError, DatabaseError
from bookings.models import Booking
from guests.models import Guest
from rooms.models import Room
from payments.models import Payment
from reviews.models import Review
from api.schemas.bookings import BookingCreate, BookingUpdate, BookingResponse
from api.dependencies.auth import get_current_user, TokenData

router = APIRouter(tags=["Bookings"])

def format_booking_response(b: Booking) -> dict:
    return {
        "booking_id": b.booking_id,
        "guest_id": b.guest_id,
        "room_id": b.room_id,
        "check_in": b.check_in,
        "check_out": b.check_out,
        "guest_count": b.guest_count,
        "status": b.status,
        "guest_name": b.guest.name if b.guest else "VIP Guest",
        "guest_email": b.guest.email if b.guest else None,
        "property_name": b.room.property.name if b.room and b.room.property else "Kaveri Resort",
        "room_number": b.room.room_number if b.room else "101",
        "room_type_name": b.room.room_type.type_name if b.room and b.room.room_type else "Deluxe",
        "nights_count": b.nights_count,
        "total_paid": float(b.total_paid),
        "total_amount": float(b.total_paid),
        "amount_paid": float(b.total_paid)
    }

@router.get("/bookings")
@router.get("/api/bookings", include_in_schema=False)
def get_bookings(
    property_id: Optional[int] = None,
    status: Optional[str] = None,
    status_filter: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    guest_id: Optional[int] = None,
    email: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc",
    limit: Optional[int] = None,
    offset: Optional[int] = None
):
    queryset = Booking.objects.select_related('guest', 'room__property', 'room__room_type').prefetch_related('payments').all()
    
    if property_id:
        queryset = queryset.filter(room__property_id=property_id)
    if guest_id:
        queryset = queryset.filter(guest_id=guest_id)
    if email:
        queryset = queryset.filter(guest__email__iexact=email.strip())
        
    st = status or status_filter
    if st:
        queryset = queryset.filter(status=st)
        
    if start_date:
        queryset = queryset.filter(check_in__gte=start_date)
    if end_date:
        queryset = queryset.filter(check_out__lte=end_date)

    queryset = queryset.order_by('booking_id')
    if limit:
        queryset = queryset[offset or 0:(offset or 0) + limit]

    return [format_booking_response(b) for b in queryset]

@router.get("/bookings/{booking_id}")
@router.get("/api/bookings/{booking_id}", include_in_schema=False)
def get_booking(booking_id: int):
    try:
        b = Booking.objects.select_related('guest', 'room__property', 'room__room_type').prefetch_related('payments').get(pk=booking_id)
        return format_booking_response(b)
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")

@router.post("/bookings", status_code=status.HTTP_201_CREATED)
@router.post("/api/bookings", status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_booking(payload: dict):
    try:
        guest_id = payload.get("guest_id")
        guest_email = payload.get("guest_email") or payload.get("email")
        guest_name = payload.get("guest_name") or payload.get("name")
        guest_phone = payload.get("guest_phone") or payload.get("phone", "+91 98765 43210")
        guest_city = payload.get("guest_city") or payload.get("city", "Bengaluru")
        
        if guest_id:
            guest = Guest.objects.filter(pk=guest_id).first()
        elif guest_email:
            guest, _ = Guest.objects.get_or_create(
                email=guest_email.strip().lower(),
                defaults={"name": guest_name or "VIP Guest", "phone": guest_phone, "city": guest_city}
            )
        else:
            guest = Guest.objects.first()

        room_id = payload.get("room_id")
        room = Room.objects.select_related('room_type', 'property').get(pk=room_id)

        c_in = payload.get("check_in")
        c_out = payload.get("check_out")
        guest_count = int(payload.get("guest_count", 2))
        st = payload.get("status", "confirmed")

        b = Booking.objects.create(
            guest=guest,
            room=room,
            check_in=c_in,
            check_out=c_out,
            guest_count=guest_count,
            status=st
        )

        # Record payment if amount or payment_method provided
        amount = payload.get("amount") or payload.get("total_amount")
        method = payload.get("payment_method") or payload.get("method", "credit_card")
        if amount:
            Payment.objects.create(
                booking=b,
                amount=amount,
                method=method,
                payment_date=c_in
            )

        return format_booking_response(b)
    except Room.DoesNotExist:
        raise HTTPException(status_code=400, detail="Invalid room_id")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bookings/{booking_id}/check-in")
@router.post("/api/bookings/{booking_id}/check-in", include_in_schema=False)
def check_in_booking(booking_id: int):
    try:
        b = Booking.objects.get(pk=booking_id)
        b.status = 'checked_in'
        b.save()
        return {"message": f"Guest for booking #{booking_id} checked in successfully", "status": "checked_in"}
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")

@router.post("/bookings/{booking_id}/check-out")
@router.post("/api/bookings/{booking_id}/check-out", include_in_schema=False)
def check_out_booking(booking_id: int):
    try:
        b = Booking.objects.get(pk=booking_id)
        b.status = 'checked_out'
        b.save()
        return {"message": f"Guest for booking #{booking_id} checked out successfully", "status": "checked_out"}
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")

@router.post("/bookings/{booking_id}/cancel")
@router.delete("/bookings/{booking_id}")
@router.post("/api/bookings/{booking_id}/cancel", include_in_schema=False)
@router.delete("/api/bookings/{booking_id}", include_in_schema=False)
def cancel_booking(booking_id: int):
    try:
        b = Booking.objects.get(pk=booking_id)
        b.status = 'cancelled'
        b.save()
        return {"message": f"Booking #{booking_id} cancelled successfully", "status": "cancelled"}
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")

@router.get("/bookings/{booking_id}/payments")
@router.get("/api/bookings/{booking_id}/payments", include_in_schema=False)
def get_booking_payments(booking_id: int):
    payments = Payment.objects.filter(booking_id=booking_id)
    return [
        {
            "payment_id": p.payment_id,
            "booking_id": p.booking_id,
            "amount": float(p.amount),
            "method": p.method,
            "payment_date": p.payment_date
        }
        for p in payments
    ]

@router.post("/bookings/{booking_id}/payments", status_code=status.HTTP_201_CREATED)
@router.post("/api/bookings/{booking_id}/payments", status_code=status.HTTP_201_CREATED, include_in_schema=False)
def record_booking_payment(booking_id: int, payload: dict):
    try:
        b = Booking.objects.get(pk=booking_id)
        p = Payment.objects.create(
            booking=b,
            amount=payload.get("amount", 0.0),
            method=payload.get("method", "credit_card"),
            payment_date=payload.get("payment_date", date.today())
        )
        return {
            "payment_id": p.payment_id,
            "booking_id": p.booking_id,
            "amount": float(p.amount),
            "method": p.method,
            "payment_date": p.payment_date
        }
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")

@router.post("/bookings/{booking_id}/review", status_code=status.HTTP_201_CREATED)
@router.post("/api/bookings/{booking_id}/review", status_code=status.HTTP_201_CREATED, include_in_schema=False)
def submit_booking_review(booking_id: int, payload: dict):
    try:
        b = Booking.objects.get(pk=booking_id)
        rev, created = Review.objects.update_or_create(
            booking=b,
            defaults={
                "rating": int(payload.get("rating", 5)),
                "comment": payload.get("comment", "Wonderful luxury experience!"),
                "review_date": date.today()
            }
        )
        return {
            "review_id": rev.review_id,
            "booking_id": rev.booking_id,
            "rating": rev.rating,
            "comment": rev.comment,
            "review_date": rev.review_date
        }
    except Booking.DoesNotExist:
        raise HTTPException(status_code=404, detail="Booking not found")
