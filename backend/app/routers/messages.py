"""
Messages API Router.

WHAT THIS MODULE DOES:
Exposes HTTP REST routes for fetching/posting channel messages, thread replies, soft-deleting messages, and text search.
Triggers WebSocket broadcasts on creation or deletion.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.message import MessageCreate, MessageResponse, MessageSearchResponse
from app.services import message_service
from app.websocket.connection_manager import manager

router = APIRouter(prefix="/api/v1", tags=["Messages"])


@router.get("/channels/{channel_id}/messages", response_model=List[MessageResponse])
def list_messages(
    channel_id: UUID,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/channels/{channel_id}/messages
    
    Purpose: Retrieve non-threaded messages for a given channel stream.
    """
    return message_service.get_channel_messages(db, channel_id, current_user_id=x_user_id)


@router.post("/channels/{channel_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def post_message(
    channel_id: UUID,
    message_in: MessageCreate,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    POST /api/v1/channels/{channel_id}/messages
    
    Purpose: Post a new message or thread reply to a channel. Broadcasts NEW_MESSAGE event via WebSockets.
    """
    msg = message_service.create_message(db, channel_id, x_user_id, message_in)
    hydrated = message_service.hydrate_message_response(db, msg, current_user_id=x_user_id)
    
    # Serialized JSON response
    response_data = MessageResponse.model_validate(hydrated).model_dump(mode="json")
    
    # Broadcast to all connected WebSockets
    await manager.broadcast(
        event_type="NEW_MESSAGE",
        channel_id=str(channel_id),
        data=response_data
    )
    
    return response_data


@router.get("/messages/{message_id}/thread")
def get_thread(
    message_id: UUID,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/messages/{message_id}/thread
    
    Purpose: Fetch parent message and all reply thread items.
    """
    return message_service.get_thread_messages(db, message_id, current_user_id=x_user_id)


@router.delete("/messages/{message_id}", status_code=status.HTTP_200_OK)
async def delete_message(
    message_id: UUID,
    x_user_id: str = Header(..., alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    DELETE /api/v1/messages/{message_id}
    
    Purpose: Soft-delete own message. Broadcasts MESSAGE_DELETED event via WebSockets.
    """
    try:
        msg = message_service.soft_delete_message(db, message_id, x_user_id)
        if not msg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        
        await manager.broadcast(
            event_type="MESSAGE_DELETED",
            channel_id=str(msg.channel_id),
            data={"message_id": str(message_id), "channel_id": str(msg.channel_id)}
        )
        return {"status": "success", "message_id": message_id}
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))


@router.get("/messages/search", response_model=List[MessageSearchResponse])
def search(
    q: str = Query(..., min_length=1),
    channel_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/messages/search?q=...&channel_id=...
    
    Purpose: Text search across non-deleted messages.
    """
    return message_service.search_messages(db, query_text=q, channel_id=channel_id)
