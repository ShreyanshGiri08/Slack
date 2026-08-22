"""
WebSocket Payload Schemas Module.

WHAT THIS MODULE DOES:
Defines structured JSON message formats sent over real-time WebSockets.

WHY IT'S STRUCTURED THIS WAY:
1. `event_type` string (`NEW_MESSAGE`, `MESSAGE_DELETED`, `REACTION_UPDATED`, `TYPING_INDICATOR`) provides predictable event dispatching on the frontend.
"""

from typing import Any, Dict, Optional
from pydantic import BaseModel


class WSEvent(BaseModel):
    """Real-time event packet broadcasted across connected client sockets."""
    event_type: str
    channel_id: Optional[str] = None
    data: Dict[str, Any]
