from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from payments.models import Payment
from bookings.models import Booking
from api.schemas.payments import PaymentCreate, PaymentResponse
from api.dependencies.auth import get_current_user, TokenData

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.get("", response_model=List[PaymentResponse])
def get_payments(
    booking_id: Optional[int] = None,
    method: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user)
):
    queryset = Payment.objects.select_related('booking__guest').all()
    if booking_id:
        queryset = queryset.filter(booking_id=booking_id)
    if method:
        queryset = queryset.filter(method=method)

    results = []
    for p in queryset:
        results.append(PaymentResponse(
            payment_id=p.payment_id,
            booking_id=p.booking_id,
            amount=p.amount,
            method=p.method,
            payment_date=p.payment_date,
            guest_name=p.booking.guest.name if p.booking and p.booking.guest else None
        ))
    return results

@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        booking = Booking.objects.select_related('guest').get(pk=payload.booking_id)
        p = Payment.objects.create(
            booking=booking,
            amount=payload.amount,
            method=payload.method,
            payment_date=payload.payment_date
        )
        return PaymentResponse(
            payment_id=p.payment_id,
            booking_id=p.booking_id,
            amount=p.amount,
            method=p.method,
            payment_date=p.payment_date,
            guest_name=booking.guest.name if booking.guest else None
        )
    except Booking.DoesNotExist:
        raise HTTPException(status_code=400, detail="Booking not found")
