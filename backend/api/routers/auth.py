from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from api.dependencies.auth import (
    DEMO_USERS,
    verify_password,
    create_access_token,
    get_current_user,
    TokenData
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str
    email: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = DEMO_USERS.get(form_data.username.lower())
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={
        "sub": user["username"],
        "role": user["role"],
        "email": user["email"],
        "guest_id": user.get("guest_id")
    })
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        role=user["role"],
        email=user["email"]
    )

@router.post("/login", response_model=TokenResponse)
def login_json(credentials: LoginRequest):
    user = DEMO_USERS.get(credentials.username.lower())
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(data={
        "sub": user["username"],
        "role": user["role"],
        "email": user["email"],
        "guest_id": user.get("guest_id")
    })
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        role=user["role"],
        email=user["email"]
    )

@router.get("/me", response_model=TokenData)
def read_users_me(current_user: TokenData = Depends(get_current_user)):
    return current_user
