"""
Channel Pydantic Schemas Module.

WHAT THIS MODULE DOES:
Defines data structures for reading channels and unread message indicators.

WHY IT'S STRUCTURED THIS WAY:
1. `ChannelResponse` includes `unread_count` so the frontend sidebar can render unread badges without needing separate HTTP requests per channel.
"""

from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ChannelCreate(BaseModel):
    """Payload for creating a custom channel (if needed)."""
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None


class ChannelResponse(BaseModel):
    """JSON response schema representing a workspace channel with unread badge metrics."""
    id: UUID
    name: str
    description: Optional[str] = None
    is_default: bool
    created_at: datetime
    unread_count: int = 0

    class Config:
        from_attributes = True
