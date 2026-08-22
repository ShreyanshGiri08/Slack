"""
Message Pydantic Schemas Module.

WHAT THIS MODULE DOES:
Defines input/output serialization structures for channel chat messages, threaded replies, and private Direct Messages.

WHY IT'S STRUCTURED THIS WAY:
1. `MessageCreate`: Includes optional `recipient_id` for posting 1-on-1 private DMs.
2. `MessageResponse`: Includes `recipient_id` so frontend can filter DM streams from public channels.
"""

from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.user import UserResponse
from app.schemas.reaction import ReactionGroup


class MessageCreate(BaseModel):
    """Payload to post a message, thread reply, or private DM."""
    content: str = Field(..., min_length=1, description="Message text content")
    parent_id: Optional[UUID] = Field(None, description="Optional parent message ID if this is a thread reply")
    recipient_id: Optional[UUID] = Field(None, description="Optional recipient user ID for private DM")


class MessageResponse(BaseModel):
    """Full message JSON model returned to clients."""
    id: UUID
    channel_id: UUID
    user_id: UUID
    recipient_id: Optional[UUID] = None
    parent_id: Optional[UUID] = None
    content: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    author: Optional[UserResponse] = None
    recipient: Optional[UserResponse] = None
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
