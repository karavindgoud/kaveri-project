from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class PropertyBase(BaseModel):
    name: str = Field(..., max_length=100, example="Kaveri Grand Hyderabad")
    city: str = Field(..., max_length=50, example="Hyderabad")
    stars: Optional[int] = Field(None, ge=1, le=5, example=5)

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=50)
    stars: Optional[int] = Field(None, ge=1, le=5)

class PropertyResponse(PropertyBase):
    property_id: int
    total_rooms: int = 0

    model_config = ConfigDict(from_attributes=True)
