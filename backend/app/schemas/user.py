"""
User Pydantic Schemas Module.

WHAT THIS MODULE DOES:
Defines input validation schemas for Login, Signup, Profile Updates, and User Responses.

WHY IT'S STRUCTURED THIS WAY:
1. `UserSignup`: Validates credentials (username, password, display name) during registration.
2. `UserResponse`: Includes `bio` so user profile cards display personal bios.
"""

from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserSignup(BaseModel):
    """Payload for registering a new user account."""
    username: str = Field(..., min_length=2, max_length=50, description="Unique username handle")
    display_name: str = Field(..., min_length=2, max_length=100, description="Full display name")
    password: str = Field(..., min_length=4, max_length=100, description="Account password")
    bio: Optional[str] = Field("Software Engineer & Team Collaborator", max_length=500)


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
    avatar_url: str
    status: str
    bio: Optional[str] = "Software Engineer & Team Collaborator"
    created_at: datetime

    class Config:
        from_attributes = True
