from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import date, datetime
from rooms.models import Room
from room_types.models import RoomType
from properties.models import Property
from rate_plans.models import Rate
from bookings.models import Booking
from api.schemas.rooms import RoomCreate, RoomUpdate, RoomResponse, RoomTypeCreate, RoomTypeResponse, AvailableRoomResponse
from api.dependencies.auth import get_current_user, require_role, TokenData

router = APIRouter(tags=["Rooms & Room Types"])

DEFAULT_RATES = {
    "Deluxe": 4500.0,
    "Suite": 8200.0,
    "Standard": 3200.0
}

@router.get("/rooms/availability", response_model=List[AvailableRoomResponse])
@router.get("/api/rooms/availability", response_model=List[AvailableRoomResponse], include_in_schema=False)
def get_room_availability(
    property_id: Optional[int] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    room_type_id: Optional[int] = None
):
    try:
        queryset = Room.objects.select_related('property', 'room_type').all()
        if property_id:
            queryset = queryset.filter(property_id=property_id)
        if room_type_id:
            queryset = queryset.filter(room_type_id=room_type_id)

        # If check_in and check_out provided, filter out conflicting bookings
        if check_in and check_out:
            if check_out <= check_in:
                raise HTTPException(status_code=400, detail="check_out must be after check_in")
            
            # Find occupied room IDs for this date window
            occupied_room_ids = Booking.objects.filter(
                status__in=['confirmed', 'checked_in'],
                check_in__lt=check_out,
                check_out__gt=check_in
            ).values_list('room_id', flat=True)
            
            queryset = queryset.exclude(room_id__in=occupied_room_ids)

        nights = max(1, (check_out - check_in).days) if check_in and check_out else 1

        results = []
        for r in queryset:
            # Look up rate in Rate table or fallback
            rate_obj = Rate.objects.filter(
                property=r.property,
                room_type=r.room_type
            ).first()
            
            if rate_obj:
                nightly_val = float(rate_obj.nightly_rate)
            else:
                nightly_val = DEFAULT_RATES.get(r.room_type.type_name, 4500.0)
                if r.property.city == "Ooty":
                    nightly_val += 1500.0
                elif r.property.city == "Alleppey":
                    nightly_val += 600.0

            total_val = nightly_val * nights

            results.append(AvailableRoomResponse(
                room_id=r.room_id,
                property_id=r.property_id,
                property_name=r.property.name,
                property_city=r.property.city,
                room_number=r.room_number,
                room_type_id=r.room_type_id,
                type_name=r.room_type.type_name,
                max_occupancy=r.room_type.max_occupancy,
                nightly_rate=nightly_val,
                total_rate=total_val
            ))

        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rooms/types", response_model=List[RoomTypeResponse])
@router.get("/api/rooms/types", response_model=List[RoomTypeResponse], include_in_schema=False)
def get_room_types():
    types = RoomType.objects.all()
    return [RoomTypeResponse.model_validate(rt) for rt in types]

@router.post("/rooms/types", response_model=RoomTypeResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/rooms/types", response_model=RoomTypeResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_room_type(
    payload: RoomTypeCreate,
    current_user: TokenData = Depends(require_role(["Admin", "Manager"]))
):
    try:
        rt = RoomType.objects.create(
            type_name=payload.type_name,
            max_occupancy=payload.max_occupancy
        )
        return RoomTypeResponse.model_validate(rt)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/rooms", response_model=List[RoomResponse])
@router.get("/api/rooms", response_model=List[RoomResponse], include_in_schema=False)
def get_rooms(
    property_id: Optional[int] = None,
    room_type_id: Optional[int] = None
):
    queryset = Room.objects.select_related('property', 'room_type').all()
    if property_id:
        queryset = queryset.filter(property_id=property_id)
    if room_type_id:
        queryset = queryset.filter(room_type_id=room_type_id)

    results = []
    for r in queryset:
        results.append(RoomResponse(
            room_id=r.room_id,
            property_id=r.property_id,
            room_number=r.room_number,
            room_type_id=r.room_type_id,
            property_name=r.property.name,
            room_type_name=r.room_type.type_name,
            max_occupancy=r.room_type.max_occupancy
        ))
    return results

@router.get("/rooms/{room_id}", response_model=RoomResponse)
@router.get("/api/rooms/{room_id}", response_model=RoomResponse, include_in_schema=False)
def get_room(room_id: int):
    try:
        r = Room.objects.select_related('property', 'room_type').get(pk=room_id)
        return RoomResponse(
            room_id=r.room_id,
            property_id=r.property_id,
            room_number=r.room_number,
            room_type_id=r.room_type_id,
            property_name=r.property.name,
            room_type_name=r.room_type.type_name,
            max_occupancy=r.room_type.max_occupancy
        )
    except Room.DoesNotExist:
        raise HTTPException(status_code=404, detail="Room not found")

@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_room(
    payload: RoomCreate,
    current_user: TokenData = Depends(require_role(["Admin", "Manager"]))
):
    try:
        prop = Property.objects.get(pk=payload.property_id)
        rt = RoomType.objects.get(pk=payload.room_type_id)
        r = Room.objects.create(
            property=prop,
            room_number=payload.room_number,
            room_type=rt
        )
        return RoomResponse(
            room_id=r.room_id,
            property_id=r.property_id,
            room_number=r.room_number,
            room_type_id=r.room_type_id,
            property_name=prop.name,
            room_type_name=rt.type_name,
            max_occupancy=rt.max_occupancy
        )
    except (Property.DoesNotExist, RoomType.DoesNotExist):
        raise HTTPException(status_code=400, detail="Invalid property_id or room_type_id")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
