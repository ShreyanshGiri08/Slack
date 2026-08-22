"""
User ORM Model Module.

WHAT THIS MODULE DOES:
Defines the `User` database table structure using SQLAlchemy ORM, including personal bio and password fields.

WHY IT'S STRUCTURED THIS WAY:
1. `bio` field enables rich user profiles.
2. `password` field supports credential authentication for registration and login.
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

    Represents a workspace member in Mini Slack with profile identity and status details.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=False)
    status = Column(String(100), default="Online")
    bio = Column(Text, default="Software Engineer & Team Collaborator")
    password = Column(String(255), default="password123")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    messages = relationship("Message", back_populates="author", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")
    message_reads = relationship("MessageRead", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User username='{self.username}' display_name='{self.display_name}'>"
