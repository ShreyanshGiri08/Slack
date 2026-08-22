"""
Reactions API Router.

WHAT THIS MODULE DOES:
Exposes HTTP REST routes for adding and removing emoji reactions on messages.
Triggers REACTION_UPDATED WebSocket broadcasts.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.reaction import ReactionCreate
from app.services import reaction_service, message_service
from app.websocket.connection_manager import manager

router = APIRouter(prefix="/api/v1/messages", tags=["Reactions"])


@router.post("/{message_id}/reactions", status_code=status.HTTP_201_CREATED)
async def add_emoji_reaction(
    message_id: UUID,
    reaction_in: ReactionCreate,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    POST /api/v1/messages/{message_id}/reactions
    
    Purpose: Add an emoji reaction to a message. Broadcasts REACTION_UPDATED event.
    """
    reaction = reaction_service.add_reaction(db, message_id, x_user_id, reaction_in)
    groups = reaction_service.get_message_reaction_groups(db, message_id, current_user_id=x_user_id)
    
    # Broadcast reaction change
    await manager.broadcast(
        event_type="REACTION_UPDATED",
        data={
            "message_id": str(message_id),
            "reactions": [g.model_dump(mode="json") for g in groups]
        }
    )
    
    return {"status": "success", "reactions": groups}


@router.delete("/{message_id}/reactions/{emoji}", status_code=status.HTTP_200_OK)
async def remove_emoji_reaction(
    message_id: UUID,
    emoji: str,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    DELETE /api/v1/messages/{message_id}/reactions/{emoji}
    
    Purpose: Remove an emoji reaction. Broadcasts REACTION_UPDATED event.
    """
    removed = reaction_service.remove_reaction(db, message_id, x_user_id, emoji)
    groups = reaction_service.get_message_reaction_groups(db, message_id, current_user_id=x_user_id)
    
    await manager.broadcast(
        event_type="REACTION_UPDATED",
        data={
            "message_id": str(message_id),
            "reactions": [g.model_dump(mode="json") for g in groups]
        }
    )
    
    return {"status": "success", "removed": removed, "reactions": groups}
