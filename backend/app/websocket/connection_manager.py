"""
WebSocket Connection Manager.

WHAT THIS MODULE DOES:
Maintains active WebSocket connections per user ID and broadcasts real-time events.
"""

from typing import Dict, List
from fastapi import WebSocket
import json


class ConnectionManager:
    """Manages connected user sockets and room broadcasts."""

    def __init__(self):
        # user_id -> List of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast(self, event_type: str, data: dict, channel_id: str = None):
        """Broadcasts an event JSON payload to all active client connections."""
        payload = json.dumps({
            "event_type": event_type,
            "channel_id": channel_id,
            "data": data
        })

        for user_id, sockets in list(self.active_connections.items()):
            for socket in list(sockets):
                try:
                    await socket.send_text(payload)
                except Exception:
                    self.disconnect(user_id, socket)


manager = ConnectionManager()
