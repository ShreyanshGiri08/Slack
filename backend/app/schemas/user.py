"""
User Pydantic Schemas Module.
"""

from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserSignup(BaseModel):
    """Payload for registering a new user account."""
    username: str = Field(..., min_length=2, max_length=50)
    display_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=4, max_length=100)
    bio: Optional[str] = Field("Team Member", max_length=500)


class UserLogin(BaseModel):
    """Payload sent by client when authenticating."""
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=4, max_length=100)


class UserUpdate(BaseModel):
    """Payload for updating user profile."""
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    status: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    """JSON response schema representing a user profile."""
    id: UUID
    username: str
    display_name: str
    # ✅ FIX: avatar_url is Optional so that legacy DB rows without it don't 500
    avatar_url: Optional[str] = "https://api.dicebear.com/7.x/bottts/svg?seed=default"
    status: Optional[str] = "Online"
    bio: Optional[str] = "Team Member"
    created_at: datetime

    class Config:
        from_attributes = True
