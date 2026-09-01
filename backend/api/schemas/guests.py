from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional

class GuestBase(BaseModel):
    name: str = Field(..., max_length=100, example="John Doe")
    email: str = Field(..., max_length=255, example="john.doe@example.com")
    phone: Optional[str] = Field(None, max_length=20, example="+1234567890")
    city: Optional[str] = Field(None, max_length=50, example="Bangalore")

class GuestCreate(GuestBase):
    pass

class GuestUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, max_length=50)

class GuestResponse(GuestBase):
    guest_id: int
    total_bookings: int = 0

    model_config = ConfigDict(from_attributes=True)
