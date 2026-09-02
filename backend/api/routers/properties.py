from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from properties.models import Property
from room_types.models import RoomType
from api.schemas.properties import PropertyCreate, PropertyUpdate, PropertyResponse
from api.dependencies.auth import get_current_user, require_role, TokenData

router = APIRouter(tags=["Properties"])

@router.get("/properties", response_model=List[PropertyResponse])
@router.get("/api/properties", response_model=List[PropertyResponse], include_in_schema=False)
def get_properties(
    city: Optional[str] = None,
    stars: Optional[int] = None
):
    queryset = Property.objects.all()
    if city:
        queryset = queryset.filter(city__icontains=city)
    if stars:
        queryset = queryset.filter(stars=stars)
    
    results = []
    for prop in queryset:
        results.append(PropertyResponse(
            property_id=prop.property_id,
            name=prop.name,
            city=prop.city,
            stars=prop.stars,
            total_rooms=prop.rooms.count()
        ))
    return results

@router.get("/properties/{property_id}", response_model=PropertyResponse)
@router.get("/api/properties/{property_id}", response_model=PropertyResponse, include_in_schema=False)
def get_property(property_id: int):
    try:
        prop = Property.objects.get(pk=property_id)
        return PropertyResponse(
            property_id=prop.property_id,
            name=prop.name,
            city=prop.city,
            stars=prop.stars,
            total_rooms=prop.rooms.count()
        )
    except Property.DoesNotExist:
        raise HTTPException(status_code=404, detail="Property not found")

@router.post("/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_property(
    payload: PropertyCreate,
    current_user: TokenData = Depends(require_role(["Admin", "Manager"]))
):
    prop = Property.objects.create(
        name=payload.name,
        city=payload.city,
        stars=payload.stars
    )
    return PropertyResponse(
        property_id=prop.property_id,
        name=prop.name,
        city=prop.city,
        stars=prop.stars,
        total_rooms=0
    )

@router.patch("/properties/{property_id}", response_model=PropertyResponse)
@router.patch("/api/properties/{property_id}", response_model=PropertyResponse, include_in_schema=False)
def update_property(
    property_id: int,
    payload: PropertyUpdate,
    current_user: TokenData = Depends(require_role(["Admin", "Manager"]))
):
    try:
        prop = Property.objects.get(pk=property_id)
        if payload.name is not None:
            prop.name = payload.name
        if payload.city is not None:
            prop.city = payload.city
        if payload.stars is not None:
            prop.stars = payload.stars
        prop.save()
        return PropertyResponse(
            property_id=prop.property_id,
            name=prop.name,
            city=prop.city,
            stars=prop.stars,
            total_rooms=prop.rooms.count()
        )
    except Property.DoesNotExist:
        raise HTTPException(status_code=404, detail="Property not found")
