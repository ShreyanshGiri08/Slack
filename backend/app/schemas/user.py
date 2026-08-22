"""
User Pydantic Schemas Module.

WHAT THIS MODULE DOES:
Defines input validation schemas and response serialization models for User API operations.

WHY IT'S STRUCTURED THIS WAY:
1. `UserLogin`: Auto-registers or authenticates users by display name.
2. `UserResponse`: Controls which fields are safely returned to clients (avoiding internal leakages).
"""

from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserLogin(BaseModel):
    """Payload sent by client when logging into or joining the workspace."""
    username: str = Field(..., min_length=2, max_length=50, description="Unique handle or username")
    display_name: str = Field(..., min_length=2, max_length=100, description="Human-readable full name")
    status: Optional[str] = Field("Online", max_length=100)


class UserUpdate(BaseModel):
    """Payload for updating active user profile."""
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    status: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    """JSON response schema representing a user profile."""
    id: UUID
    username: str
    display_name: str
    avatar_url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
