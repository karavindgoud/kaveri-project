from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from django.db import IntegrityError
from rate_plans.models import Rate
from properties.models import Property
from room_types.models import RoomType
from api.schemas.rate_plans import RateCreate, RateResponse
from api.dependencies.auth import get_current_user, require_role, TokenData

router = APIRouter(prefix="/api/rates", tags=["Rate Plans"])

@router.get("", response_model=List[RateResponse])
def get_rate_plans(
    property_id: Optional[int] = None,
    room_type_id: Optional[int] = None,
    current_user: TokenData = Depends(get_current_user)
):
    queryset = Rate.objects.select_related('property', 'room_type').all()
    if property_id:
        queryset = queryset.filter(property_id=property_id)
    if room_type_id:
        queryset = queryset.filter(room_type_id=room_type_id)

    results = []
    for r in queryset:
        results.append(RateResponse(
            rate_id=r.rate_id,
            property_id=r.property_id,
            room_type_id=r.room_type_id,
            start_date=r.start_date,
            end_date=r.end_date,
            nightly_rate=r.nightly_rate,
            property_name=r.property.name if r.property else None,
            room_type_name=r.room_type.type_name if r.room_type else None
        ))
    return results

@router.post("", response_model=RateResponse, status_code=status.HTTP_201_CREATED)
def create_rate_plan(
    payload: RateCreate,
    current_user: TokenData = Depends(require_role(["Admin", "Manager"]))
):
    try:
        prop = Property.objects.get(pk=payload.property_id)
        rt = RoomType.objects.get(pk=payload.room_type_id)
        r = Rate.objects.create(
            property=prop,
            room_type=rt,
            start_date=payload.start_date,
            end_date=payload.end_date,
            nightly_rate=payload.nightly_rate
        )
        return RateResponse(
            rate_id=r.rate_id,
            property_id=r.property_id,
            room_type_id=r.room_type_id,
            start_date=r.start_date,
            end_date=r.end_date,
            nightly_rate=r.nightly_rate,
            property_name=prop.name,
            room_type_name=rt.type_name
        )
    except (Property.DoesNotExist, RoomType.DoesNotExist):
        raise HTTPException(status_code=400, detail="Invalid property_id or room_type_id")
    except IntegrityError as err:
        if "no_overlapping_rates" in str(err):
            raise HTTPException(
                status_code=400,
                detail=f"Rate date overlap error: Rates for {rt.type_name} at {prop.name} already exist within range ({payload.start_date} to {payload.end_date})"
            )
        raise HTTPException(status_code=400, detail=str(err))
