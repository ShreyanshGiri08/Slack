"""
Message ORM Model Module.

WHAT THIS MODULE DOES:
Defines the `Message` database table structure for channel messages and threaded replies.

WHY IT'S STRUCTURED THIS WAY:
1. `parent_id` self-referential foreign key allows infinite-depth threaded message replies.
2. `is_deleted` flag implements soft-deletion so message history and thread integrity remain intact while masking content.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Message(Base):
    """
    Message Table Entity.

    Represents a posted chat message or threaded reply in a channel.
    """
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=True, index=True)
    content = Column(Text, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", back_populates="messages")
    channel = relationship("Channel", back_populates="messages")
    parent = relationship("Message", remote_side=[id], back_populates="replies")
    replies = relationship("Message", back_populates="parent", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message id='{self.id}' author='{self.user_id}' content='{self.content[:20]}...'>"
