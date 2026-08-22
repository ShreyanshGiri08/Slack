"""
Channels API Router.

WHAT THIS MODULE DOES:
Exposes HTTP REST routes for listing channels with live unread indicators and updating read status.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.channel import ChannelResponse
from app.services import channel_service

router = APIRouter(prefix="/api/v1/channels", tags=["Channels"])


@router.get("", response_model=List[ChannelResponse])
def get_channels(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/channels
    
    Purpose: List all workspace channels with live unread counts for the requesting user (via X-User-Id header).
    """
    return channel_service.get_channels_with_unread(db, x_user_id)


@router.post("/{channel_id}/read", status_code=status.HTTP_200_OK)
def mark_read(
    channel_id: UUID,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    POST /api/v1/channels/{channel_id}/read
    
    Purpose: Update channel read timestamp for the requesting user, resetting the unread badge.
    """
    channel_service.mark_channel_as_read(db, x_user_id, channel_id)
    return {"status": "success", "channel_id": channel_id}
