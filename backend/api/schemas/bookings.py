from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date
from typing import Optional

class BookingBase(BaseModel):
    guest_id: int
    room_id: int
    check_in: date
    check_out: date
    guest_count: int = Field(..., gt=0, example=2)
    status: str = Field('confirmed', example="confirmed")

    @field_validator('check_out')

    def check_dates(cls, check_out, info):
        if 'check_in' in info.data and check_out <= info.data['check_in']:
            raise ValueError('check_out date must be strictly after check_in date')
        return check_out

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    guest_id: Optional[int] = None
    room_id: Optional[int] = None
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    guest_count: Optional[int] = Field(None, gt=0)
    status: Optional[str] = None

class BookingResponse(BookingBase):
    booking_id: int
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    property_name: Optional[str] = None
    room_number: Optional[str] = None
    room_type_name: Optional[str] = None
    nights_count: int = 0
    total_paid: float = 0.0

    model_config = ConfigDict(from_attributes=True)
