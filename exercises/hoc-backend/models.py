from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class User(BaseModel):
    firebase_uid: str
    email: EmailStr
    name: Optional[str] = None
    photo_url: Optional[str] = None
    provider: str = "google"
    role: UserRole = UserRole.USER  # Default role is user
    created_at: datetime = datetime.now(timezone.utc)
    last_login: datetime = datetime.now(timezone.utc)

class UserResponse(BaseModel):
    uid: str
    email: str
    name: Optional[str] = None
    photo_url: Optional[str] = None
    role: str  # Include role in response