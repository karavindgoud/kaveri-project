from pydantic import BaseModel, Field, ConfigDict
from datetime import date
from typing import Optional
from decimal import Decimal

class PaymentBase(BaseModel):
    booking_id: int
    amount: Decimal = Field(..., gt=0, example=250.00)
    method: str = Field(..., example="credit_card")
    payment_date: date

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    payment_id: int
    guest_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
