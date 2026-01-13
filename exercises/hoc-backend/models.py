from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
from enum import Enum

class UserRole(str, Enum):
    """
    User role hierarchy for fintech application.
    
    Role Hierarchy:
    - SUPERADMIN: Full system access, can manage all admins and users
    - ADMIN: Can manage users and access admin features
    - USER: Standard user access
    """
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    USER = "user"
    
    @classmethod
    def get_hierarchy_level(cls, role: str) -> int:
        """Get numerical hierarchy level for role comparison"""
        hierarchy = {
            cls.SUPERADMIN.value: 3,
            cls.ADMIN.value: 2,
            cls.USER.value: 1
        }
        return hierarchy.get(role, 0)
    
    @classmethod
    def can_manage_role(cls, manager_role: str, target_role: str) -> bool:
        """Check if manager_role can manage target_role"""
        return cls.get_hierarchy_level(manager_role) > cls.get_hierarchy_level(target_role)

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
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None