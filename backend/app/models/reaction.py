"""
Reaction ORM Model Module.

WHAT THIS MODULE DOES:
Defines the `Reaction` database table structure for emoji reactions appended to messages.

WHY IT'S STRUCTURED THIS WAY:
1. Unique constraint `(message_id, user_id, emoji)` ensures a user cannot add duplicate identical reactions to the same message.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Reaction(Base):
    """
    Reaction Table Entity.

    Represents a user's emoji reaction on a message.
    """
    __tablename__ = "reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    emoji = Column(String(32), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    message = relationship("Message", back_populates="reactions")
    user = relationship("User", back_populates="reactions")

    __table_args__ = (
        UniqueConstraint("message_id", "user_id", "emoji", name="uq_user_message_emoji"),
    )

    def __repr__(self):
        return f"<Reaction emoji='{self.emoji}' message='{self.message_id}' user='{self.user_id}'>"
