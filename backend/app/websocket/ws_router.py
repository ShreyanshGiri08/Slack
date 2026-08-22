"""
WebSocket Router Module.

WHAT THIS MODULE DOES:
Handles `/ws/workspace/{user_id}` upgrades and routes incoming socket messages (e.g. typing events).
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import manager
import json

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/workspace/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket Connection Endpoint.
    
    Path: /ws/workspace/{user_id}
    Purpose: Establish real-time persistent bi-directional connection for live updates.
    """
    await manager.connect(user_id, websocket)
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
                # Handle client incoming socket commands (e.g., typing indicators)
                if data.get("type") == "TYPING":
                    await manager.broadcast(
                        event_type="TYPING_INDICATOR",
                        channel_id=data.get("channel_id"),
                        data={"user_id": user_id, "username": data.get("username"), "is_typing": data.get("is_typing", True)}
                    )
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
