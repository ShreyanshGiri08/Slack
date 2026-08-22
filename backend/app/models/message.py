"""
Message ORM Model Module.

WHAT THIS MODULE DOES:
Defines the `Message` database table structure for channel messages, thread replies, and private Direct Messages (DMs).

WHY IT'S STRUCTURED THIS WAY:
1. `parent_id`: Self-referential foreign key for threaded replies.
2. `recipient_id`: Nullable foreign key to `users.id` for private 1-on-1 DMs between two members.
3. `is_deleted`: Soft-deletion flag preserving message history and thread integrity.
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

    Represents a posted chat message, threaded reply, or private Direct Message.
    """
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=True, index=True)
    content = Column(Text, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", foreign_keys=[user_id], back_populates="messages")
    recipient = relationship("User", foreign_keys=[recipient_id])
    channel = relationship("Channel", back_populates="messages")
    parent = relationship("Message", remote_side=[id], back_populates="replies")
    replies = relationship("Message", back_populates="parent", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message id='{self.id}' author='{self.user_id}' recipient='{self.recipient_id}'>"
