"""
User ORM Model Module.

WHAT THIS MODULE DOES:
Defines the `User` database table structure using SQLAlchemy ORM.

WHY IT'S STRUCTURED THIS WAY:
1. UUID primary key ensures globally unique identifiers across distributed systems.
2. `avatar_url` defaults to automated avatar generation via DiceBear API.
3. Relationships cleanly map messages, reactions, and unread states created by this user.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    """
    User Table Entity.

    Represents a workspace member in Mini Slack. Stores identity, display attributes,
    and online presence status.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=False)
    status = Column(String(100), default="Online")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    messages = relationship("Message", back_populates="author", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")
    message_reads = relationship("MessageRead", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User username='{self.username}' display_name='{self.display_name}'>"
