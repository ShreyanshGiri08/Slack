"""
Reaction Pydantic Schemas Module.

WHAT THIS MODULE DOES:
Defines models for adding reactions and presenting aggregated reaction pills on messages.

WHY IT'S STRUCTURED THIS WAY:
1. `ReactionGroup`: Aggregates identical emojis on a message (count + list of user IDs who reacted) to mirror Slack's UI reaction pills.
"""

from uuid import UUID
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field


class ReactionCreate(BaseModel):
    """Payload to add an emoji reaction to a message."""
    emoji: str = Field(..., max_length=32, description="Unicode emoji or shortcode string")


class ReactionResponse(BaseModel):
    """JSON representation of an individual reaction entity."""
    id: UUID
    message_id: UUID
    user_id: UUID
    emoji: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReactionGroup(BaseModel):
    """Aggregated emoji reaction pill count for frontend rendering."""
    emoji: str
    count: int
    user_ids: List[UUID]
    has_reacted: bool = False
