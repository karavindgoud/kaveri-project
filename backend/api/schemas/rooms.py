from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal

class RoomTypeBase(BaseModel):
    type_name: str = Field(..., max_length=20, example="Deluxe")
    max_occupancy: int = Field(..., gt=0, example=2)

class RoomTypeCreate(RoomTypeBase):
    pass

class RoomTypeResponse(RoomTypeBase):
    room_type_id: int

    model_config = ConfigDict(from_attributes=True)

class RoomBase(BaseModel):
    property_id: int
    room_number: str = Field(..., max_length=10, example="101")
    room_type_id: int

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    property_id: Optional[int] = None
    room_number: Optional[str] = Field(None, max_length=10)
    room_type_id: Optional[int] = None

class RoomResponse(RoomBase):
    room_id: int
    property_name: Optional[str] = None
    room_type_name: Optional[str] = None
    max_occupancy: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class AvailableRoomResponse(BaseModel):
    room_id: int
    property_id: int
    property_name: str
    property_city: str
    room_number: str
    room_type_id: int
    type_name: str
    max_occupancy: int
    nightly_rate: float
    total_rate: float

    model_config = ConfigDict(from_attributes=True)
