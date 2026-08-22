"""
Channel Business Logic Service Module.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.channel import Channel
from app.models.message import Message
from app.models.message_read import MessageRead


DEFAULT_CHANNELS = [
    {"name": "general",    "description": "Company-wide announcements and general discussions", "is_default": True},
    {"name": "engineering", "description": "Technical discussions, microservices, and deployments", "is_default": True},
    {"name": "web",        "description": "Frontend, backend, APIs, and full-stack web development", "is_default": False},
    {"name": "blockchain", "description": "Web3, smart contracts, DeFi, and distributed ledger tech", "is_default": False},
    {"name": "ai-ml",      "description": "Machine learning, LLMs, and AI/ML research", "is_default": False},
    {"name": "devops",     "description": "CI/CD pipelines, infrastructure, Docker, and Kubernetes", "is_default": False},
    {"name": "design",     "description": "UI/UX design, brand guidelines, and Figma assets", "is_default": False},
    {"name": "random",     "description": "Off-topic, fun, and non-work conversations", "is_default": False},
]


def seed_default_channels(db: Session):
    """Creates default channels if they don't already exist in the database."""
    for ch_data in DEFAULT_CHANNELS:
        existing = db.query(Channel).filter(Channel.name == ch_data["name"]).first()
        if not existing:
            ch = Channel(
                name=ch_data["name"],
                description=ch_data["description"],
                is_default=ch_data["is_default"]
            )
            db.add(ch)
    try:
        db.commit()
        print("Default channels seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Channel seed notice: {e}")


def get_channels_with_unread(db: Session, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches all channels and calculates unread count for a given user."""
    channels = db.query(Channel).order_by(Channel.created_at.asc()).all()
    result = []

    for ch in channels:
        unread_count = 0
        if user_id:
            read_rec = db.query(MessageRead).filter(
                MessageRead.user_id == user_id,
                MessageRead.channel_id == ch.id
            ).first()
            last_read = read_rec.last_read_at if read_rec else datetime.min
            unread_count = db.query(func.count(Message.id)).filter(
                Message.channel_id == ch.id,
                Message.parent_id == None,
                Message.created_at > last_read,
                Message.user_id != user_id
            ).scalar() or 0

        result.append({
            "id": ch.id,
            "name": ch.name,
            "description": ch.description,
            "is_default": ch.is_default,
            "created_at": ch.created_at,
            "unread_count": unread_count
        })

    return result


def mark_channel_as_read(db: Session, user_id, channel_id) -> bool:
    """Marks a channel as read up to the current timestamp for a user."""
    read_rec = db.query(MessageRead).filter(
        MessageRead.user_id == user_id,
        MessageRead.channel_id == channel_id
    ).first()

    now = datetime.utcnow()
    if read_rec:
        read_rec.last_read_at = now
    else:
        read_rec = MessageRead(user_id=user_id, channel_id=channel_id, last_read_at=now)
        db.add(read_rec)

    db.commit()
    return True
