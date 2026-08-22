"""
Channel Business Logic Service Module.

WHAT THIS MODULE DOES:
Retrieves channel lists, calculates per-user unread message counts, and updates channel read timestamps.

WHY IT'S STRUCTURED THIS WAY:
1. `get_channels_with_unread`: Compares message `created_at` timestamps against the user's `last_read_at` in `message_reads` table.
2. `mark_channel_as_read`: Upserts a row in `message_reads` table so badges clear instantly.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.channel import Channel
from app.models.message import Message
from app.models.message_read import MessageRead
from app.schemas.channel import ChannelResponse


def get_channels_with_unread(db: Session, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetches all channels and calculates unread count for a given user.

    WHAT IT DOES:
    Queries channels and counts messages created after the user's last_read_at timestamp.

    WHY IT'S NEEDED:
    Provides live unread count badges in the Slack sidebar without client-side heavy lifting.
    """
    channels = db.query(Channel).order_by(Channel.created_at.asc()).all()
    result = []

    for ch in channels:
        unread_count = 0
        if user_id:
            # Get user's last read record for this channel
            read_rec = db.query(MessageRead).filter(
                MessageRead.user_id == user_id,
                MessageRead.channel_id == ch.id
            ).first()

            last_read = read_rec.last_read_at if read_rec else datetime.min

            # Count non-deleted root channel messages posted after last_read
            unread_count = db.query(func.count(Message.id)).filter(
                Message.channel_id == ch.id,
                Message.parent_id == None,  # Main channel stream only
                Message.created_at > last_read,
                Message.user_id != user_id  # Don't count own sent messages as unread
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
    """
    Marks a channel as read up to the current timestamp for a user.

    WHAT IT DOES:
    Upserts a record in `message_reads` setting `last_read_at = NOW()`.
    """
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
