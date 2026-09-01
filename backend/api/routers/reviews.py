from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from reviews.models import Review
from bookings.models import Booking
from api.schemas.reviews import ReviewCreate, ReviewResponse
from api.dependencies.auth import get_current_user, TokenData

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("", response_model=List[ReviewResponse])
def get_reviews(
    rating: Optional[int] = None,
    property_id: Optional[int] = None,
    current_user: TokenData = Depends(get_current_user)
):
    queryset = Review.objects.select_related('booking__guest', 'booking__room__property').all()
    if rating:
        queryset = queryset.filter(rating=rating)
    if property_id:
        queryset = queryset.filter(booking__room__property_id=property_id)

    results = []
    for r in queryset:
        results.append(ReviewResponse(
            review_id=r.review_id,
            booking_id=r.booking_id,
            rating=r.rating,
            comment=r.comment,
            review_date=r.review_date,
            guest_name=r.booking.guest.name if r.booking and r.booking.guest else None,
            property_name=r.booking.room.property.name if r.booking and r.booking.room and r.booking.room.property else None
        ))
    return results

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        booking = Booking.objects.select_related('guest', 'room__property').get(pk=payload.booking_id)
        
        # Enforce check-out business rule before allowing review submission
        if booking.status != 'checked_out':
            raise HTTPException(
                status_code=400,
                detail=f"Review allowed only after checkout. Current booking status: {booking.status}"
            )

        if Review.objects.filter(booking_id=payload.booking_id).exists():
            raise HTTPException(status_code=400, detail="A review has already been submitted for this booking")

        r = Review.objects.create(
            booking=booking,
            rating=payload.rating,
            comment=payload.comment,
            review_date=payload.review_date
        )
        return ReviewResponse(
            review_id=r.review_id,
            booking_id=r.booking_id,
            rating=r.rating,
            comment=r.comment,
            review_date=r.review_date,
            guest_name=booking.guest.name if booking.guest else None,
            property_name=booking.room.property.name if booking.room and booking.room.property else None
        )
    except Booking.DoesNotExist:
        raise HTTPException(status_code=400, detail="Booking not found")
