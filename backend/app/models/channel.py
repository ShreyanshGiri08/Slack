"""
Channel ORM Model Module.

WHAT THIS MODULE DOES:
Defines the `Channel` database table structure representing workspace chat rooms (#general, #engineering, etc.).

WHY IT'S STRUCTURED THIS WAY:
1. `name` is unique to prevent duplicate channel names.
2. `is_default` identifies fixed system channels created upon database initialization.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Channel(Base):
    """
    Channel Table Entity.

    Represents a conversation room in Mini Slack (e.g. #general, #engineering).
    """
    __tablename__ = "channels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    messages = relationship("Message", back_populates="channel", cascade="all, delete-orphan")
    message_reads = relationship("MessageRead", back_populates="channel", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Channel name='#{self.name}'>"
