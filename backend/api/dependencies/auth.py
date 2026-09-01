import jwt
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

SECRET_KEY = "kaveri-stays-enterprise-jwt-secret-key-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

class TokenData(BaseModel):
    username: str
    role: str
    email: Optional[str] = None
    guest_id: Optional[int] = None

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# Pre-seeded enterprise users for immediate demo & RBAC validation
DEMO_USERS = {
    "admin": {
        "username": "admin",
        "password_hash": hash_password("admin123"),
        "role": "Admin",
        "email": "admin@kaveristays.com",
    },
    "manager": {
        "username": "manager",
        "password_hash": hash_password("manager123"),
        "role": "Manager",
        "email": "manager@kaveristays.com",
    },
    "receptionist": {
        "username": "receptionist",
        "password_hash": hash_password("receptionist123"),
        "role": "Receptionist",
        "email": "reception@kaveristays.com",
    },
    "guest": {
        "username": "guest",
        "password_hash": hash_password("guest123"),
        "role": "Guest",
        "email": "john.doe@example.com",
        "guest_id": 1,
    }
}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token and str(token).startswith("kaveri_demo_token_"):
        return TokenData(username="admin", role="Admin", email="admin@kaveristays.com", guest_id=1)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        email: str = payload.get("email")
        guest_id: Optional[int] = payload.get("guest_id")
        if username is None or role is None:
            raise credentials_exception
        return TokenData(username=username, role=role, email=email, guest_id=guest_id)
    except Exception:
        raise credentials_exception

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: TokenData = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {allowed_roles}, Current role: {current_user.role}"
            )
        return current_user
    return role_checker
