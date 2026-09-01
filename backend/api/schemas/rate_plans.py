from pydantic import BaseModel, Field, ConfigDict
from datetime import date
from typing import Optional
from decimal import Decimal

class RateBase(BaseModel):
    property_id: int
    room_type_id: int
    start_date: date
    end_date: date
    nightly_rate: Decimal = Field(..., gt=0, example=150.00)

class RateCreate(RateBase):
    pass

class RateResponse(RateBase):
    rate_id: int
    property_name: Optional[str] = None
    room_type_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
