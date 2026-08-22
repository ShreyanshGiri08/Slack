"""
User ORM Model Module.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=True, default="https://api.dicebear.com/7.x/bottts/svg?seed=default")
    status = Column(String(100), default="Online")
    bio = Column(Text, default="Team Member")
    password = Column(String(255), default="password123")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # ✅ FIX: Explicitly declare foreign_keys to resolve ambiguous multi-FK path
    # Message has BOTH user_id and recipient_id pointing to users.id
    messages = relationship(
        "Message",
        foreign_keys="[Message.user_id]",
        back_populates="author",
        cascade="all, delete-orphan"
    )
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")
    message_reads = relationship("MessageRead", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User username='{self.username}' display_name='{self.display_name}'>"
