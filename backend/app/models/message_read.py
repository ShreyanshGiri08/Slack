"""
MessageRead ORM Model Module.

WHAT THIS MODULE DOES:
Defines the `MessageRead` database table structure that tracks when a user last viewed a channel.

WHY IT'S STRUCTURED THIS WAY:
1. Comparing `last_read_at` against message `created_at` timestamps enables calculation of real-time unread message counts per channel.
2. Unique constraint `(user_id, channel_id)` prevents duplicate records for a single user-channel pair.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class MessageRead(Base):
    """
    MessageRead Table Entity.

    Stores the timestamp when a user last opened a specific channel.
    """
    __tablename__ = "message_reads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False, index=True)
    last_read_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="message_reads")
    channel = relationship("Channel", back_populates="message_reads")

    __table_args__ = (
        UniqueConstraint("user_id", "channel_id", name="uq_user_channel_read"),
    )

    def __repr__(self):
        return f"<MessageRead user='{self.user_id}' channel='{self.channel_id}' last_read_at='{self.last_read_at}'>"
