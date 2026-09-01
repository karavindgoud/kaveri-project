from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from guests.models import Guest
from api.schemas.guests import GuestCreate, GuestUpdate, GuestResponse
from api.dependencies.auth import get_current_user, require_role, TokenData

router = APIRouter(prefix="/api/guests", tags=["Guests"])

@router.get("", response_model=List[GuestResponse])
def get_guests(
    email: Optional[str] = None,
    name: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user)
):
    queryset = Guest.objects.all()
    if email:
        queryset = queryset.filter(email__icontains=email)
    if name:
        queryset = queryset.filter(name__icontains=name)

    results = []
    for g in queryset:
        results.append(GuestResponse(
            guest_id=g.guest_id,
            name=g.name,
            email=g.email,
            phone=g.phone,
            city=g.city,
            total_bookings=g.bookings.count()
        ))
    return results

@router.get("/{guest_id}", response_model=GuestResponse)
def get_guest(guest_id: int, current_user: TokenData = Depends(get_current_user)):
    try:
        g = Guest.objects.get(pk=guest_id)
        return GuestResponse(
            guest_id=g.guest_id,
            name=g.name,
            email=g.email,
            phone=g.phone,
            city=g.city,
            total_bookings=g.bookings.count()
        )
    except Guest.DoesNotExist:
        raise HTTPException(status_code=404, detail="Guest not found")

@router.post("", response_model=GuestResponse, status_code=status.HTTP_201_CREATED)
def create_guest(
    payload: GuestCreate,
    current_user: TokenData = Depends(get_current_user)
):
    if Guest.objects.filter(email=payload.email).exists():
        raise HTTPException(status_code=400, detail=f"Guest with email '{payload.email}' already exists")
    
    g = Guest.objects.create(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        city=payload.city
    )
    return GuestResponse(
        guest_id=g.guest_id,
        name=g.name,
        email=g.email,
        phone=g.phone,
        city=g.city,
        total_bookings=0
    )

@router.patch("/{guest_id}", response_model=GuestResponse)
def update_guest(
    guest_id: int,
    payload: GuestUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        g = Guest.objects.get(pk=guest_id)
        if payload.name is not None:
            g.name = payload.name
        if payload.email is not None:
            if Guest.objects.filter(email=payload.email).exclude(pk=guest_id).exists():
                raise HTTPException(status_code=400, detail=f"Email '{payload.email}' is already in use")
            g.email = payload.email
        if payload.phone is not None:
            g.phone = payload.phone
        if payload.city is not None:
            g.city = payload.city
        g.save()
        return GuestResponse(
            guest_id=g.guest_id,
            name=g.name,
            email=g.email,
            phone=g.phone,
            city=g.city,
            total_bookings=g.bookings.count()
        )
    except Guest.DoesNotExist:
        raise HTTPException(status_code=404, detail="Guest not found")
