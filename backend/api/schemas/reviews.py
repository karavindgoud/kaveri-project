from pydantic import BaseModel, Field, ConfigDict
from datetime import date
from typing import Optional

class ReviewBase(BaseModel):
    booking_id: int
    rating: Optional[int] = Field(None, ge=1, le=5, example=5)
    comment: Optional[str] = Field(None, example="Excellent stay and great room service!")
    review_date: Optional[date] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    review_id: int
    guest_name: Optional[str] = None
    property_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
