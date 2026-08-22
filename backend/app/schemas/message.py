"""
Message Pydantic Schemas Module.

WHAT THIS MODULE DOES:
Defines input/output serialization structures for channel chat messages, thread replies, and message search.

WHY IT'S STRUCTURED THIS WAY:
1. `MessageResponse` attaches author profile details, thread reply counts, and aggregated reaction pills for instant, efficient client rendering.
2. Handles soft-deleted messages by returning placeholder text if `is_deleted` is True.
"""

from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.user import UserResponse
from app.schemas.reaction import ReactionGroup


class MessageCreate(BaseModel):
    """Payload to post a message or thread reply."""
    content: str = Field(..., min_length=1, description="Message text content")
    parent_id: Optional[UUID] = Field(None, description="Optional parent message ID if this is a thread reply")


class MessageResponse(BaseModel):
    """Full message JSON model returned to clients."""
    id: UUID
    channel_id: UUID
    user_id: UUID
    parent_id: Optional[UUID] = None
    content: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    author: Optional[UserResponse] = None
    reply_count: int = 0
    reactions: List[ReactionGroup] = []

    class Config:
        from_attributes = True


class MessageSearchResponse(BaseModel):
    """Search query response model with channel metadata attached."""
    id: UUID
    channel_id: UUID
    channel_name: str
    user_id: UUID
    author: Optional[UserResponse] = None
    content: str
    created_at: datetime
