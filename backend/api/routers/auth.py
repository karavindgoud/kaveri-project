from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from api.dependencies.auth import (
    DEMO_USERS,
    find_user_by_credential,
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
    guest_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = ""

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = find_user_by_credential(form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # If password is provided and not demo bypass, verify it
    if form_data.password and form_data.password not in ("guest123", "admin123", "manager123", "receptionist123", "password", "password123"):
        if not verify_password(form_data.password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
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
        email=user["email"],
        guest_id=user.get("guest_id")
    )

@router.post("/login", response_model=TokenResponse)
def login_json(credentials: LoginRequest):
    user = find_user_by_credential(credentials.username)
    if not user:
        # If user typed an unknown name, default to Guest Member with guest_id 1
        user = {
            "username": credentials.username.strip(),
            "role": "Guest",
            "email": f"{credentials.username.lower().replace(' ', '.')}@example.com",
            "guest_id": 1
        }
    elif credentials.password and credentials.password not in ("guest123", "admin123", "manager123", "receptionist123", "password", "password123", ""):
        if "password_hash" in user and not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
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
        email=user["email"],
        guest_id=user.get("guest_id")
    )

@router.get("/me", response_model=TokenData)
def read_users_me(current_user: TokenData = Depends(get_current_user)):
    return current_user
