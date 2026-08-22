"""
WebSocket Router Module.

WHAT THIS MODULE DOES:
Handles `/ws/workspace/{user_id}` upgrades, client SUBSCRIBE/UNSUBSCRIBE messages,
and routes typing events. Channel subscription tracking enables targeted delivery.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import manager
import json

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/workspace/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket Connection Endpoint.

    Client messages supported:
      { "type": "SUBSCRIBE",   "channel_id": "..." }  — join channel room
      { "type": "UNSUBSCRIBE", "channel_id": "..." }  — leave channel room
      { "type": "TYPING",      "channel_id": "...", "username": "...", "is_typing": true }
    """
    await manager.connect(user_id, websocket)
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
                msg_type = data.get("type")

                if msg_type == "SUBSCRIBE":
                    # Opt 2: Register user into channel room for targeted delivery
                    channel_id = data.get("channel_id")
                    if channel_id:
                        manager.subscribe_to_channel(user_id, channel_id)

                elif msg_type == "UNSUBSCRIBE":
                    channel_id = data.get("channel_id")
                    if channel_id:
                        manager.unsubscribe_from_channel(user_id, channel_id)

                elif msg_type == "TYPING":
                    await manager.broadcast_to_channel(
                        event_type="TYPING_INDICATOR",
                        channel_id=data.get("channel_id", ""),
                        data={
                            "user_id": user_id,
                            "username": data.get("username"),
                            "is_typing": data.get("is_typing", True)
                        }
                    )

            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
