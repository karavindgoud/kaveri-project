from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from rooms.models import Room
from room_types.models import RoomType
from properties.models import Property
from api.schemas.rooms import RoomCreate, RoomUpdate, RoomResponse, RoomTypeCreate, RoomTypeResponse
from api.dependencies.auth import get_current_user, require_role, TokenData

router = APIRouter(prefix="/api/rooms", tags=["Rooms & Room Types"])

@router.get("/types", response_model=List[RoomTypeResponse])
def get_room_types(current_user: TokenData = Depends(get_current_user)):
    types = RoomType.objects.all()
    return [RoomTypeResponse.model_validate(rt) for rt in types]

@router.post("/types", response_model=RoomTypeResponse, status_code=status.HTTP_201_CREATED)
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

@router.get("", response_model=List[RoomResponse])
def get_rooms(
    property_id: Optional[int] = None,
    room_type_id: Optional[int] = None,
    current_user: TokenData = Depends(get_current_user)
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

@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, current_user: TokenData = Depends(get_current_user)):
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

@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
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
