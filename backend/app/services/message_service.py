"""
Message Business Logic Service Module.

WHAT THIS MODULE DOES:
Handles posting channel messages, isolated private Direct Messages (DMs), thread replies, soft-deletes, and search.

WHY IT'S STRUCTURED THIS WAY:
1. `get_channel_messages`: Explicitly filters out DMs (`recipient_id IS NULL`) so private DMs never leak into public channels.
2. `get_direct_messages`: Queries private messages exchanged between two specific workspace members.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from app.models.message import Message
from app.models.channel import Channel
from app.schemas.message import MessageCreate, MessageSearchResponse
from app.schemas.user import UserResponse
from app.services.reaction_service import get_message_reaction_groups


def hydrate_message_response(db: Session, msg: Message, current_user_id=None) -> Dict[str, Any]:
    """Hydrates Message ORM model into JSON dict with author/recipient profiles and reaction pills."""
    reply_count = 0
    if msg.parent_id is None and msg.recipient_id is None:
        reply_count = db.query(func.count(Message.id)).filter(
            Message.parent_id == msg.id,
            Message.is_deleted == False
        ).scalar() or 0

    reactions = get_message_reaction_groups(db, msg.id, current_user_id)

    author_data = UserResponse.model_validate(msg.author) if msg.author else None
    recipient_data = UserResponse.model_validate(msg.recipient) if msg.recipient else None

    content_text = "[This message was deleted]" if msg.is_deleted else msg.content

    return {
        "id": msg.id,
        "channel_id": msg.channel_id,
        "user_id": msg.user_id,
        "recipient_id": msg.recipient_id,
        "parent_id": msg.parent_id,
        "content": content_text,
        "is_deleted": msg.is_deleted,
        "created_at": msg.created_at,
        "updated_at": msg.updated_at,
        "author": author_data,
        "recipient": recipient_data,
        "reply_count": reply_count,
        "reactions": reactions
    }


def create_message(db: Session, channel_id, user_id, message_in: MessageCreate) -> Message:
    """Posts a message, thread reply, or isolated private DM."""
    msg = Message(
        channel_id=channel_id,
        user_id=user_id,
        recipient_id=message_in.recipient_id,
        parent_id=message_in.parent_id,
        content=message_in.content,
        is_deleted=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_channel_messages(db: Session, channel_id, current_user_id=None, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Fetches non-threaded public channel messages.
    IMPORTANT: Excludes private DMs (`recipient_id IS NULL`).
    """
    messages = db.query(Message).filter(
        Message.channel_id == channel_id,
        Message.parent_id == None,
        Message.recipient_id == None  # Exclude private DMs from public channels
    ).order_by(Message.created_at.asc()).limit(limit).all()

    return [hydrate_message_response(db, msg, current_user_id) for msg in messages]


def get_direct_messages(db: Session, user1_id, user2_id, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Fetches private 1-on-1 Direct Messages exchanged between user1 and user2.
    """
    messages = db.query(Message).filter(
        Message.recipient_id != None,
        or_(
            and_(Message.user_id == user1_id, Message.recipient_id == user2_id),
            and_(Message.user_id == user2_id, Message.recipient_id == user1_id)
        )
    ).order_by(Message.created_at.asc()).limit(limit).all()

    return [hydrate_message_response(db, msg, current_user_id=user1_id) for msg in messages]


def get_thread_messages(db: Session, message_id, current_user_id=None) -> Dict[str, Any]:
    """Fetches parent message and all thread replies."""
    parent = db.query(Message).filter(Message.id == message_id).first()
    if not parent:
        return {"parent": None, "replies": []}

    replies = db.query(Message).filter(
        Message.parent_id == message_id
    ).order_by(Message.created_at.asc()).all()

    return {
        "parent": hydrate_message_response(db, parent, current_user_id),
        "replies": [hydrate_message_response(db, r, current_user_id) for r in replies]
    }


def soft_delete_message(db: Session, message_id, user_id) -> Optional[Message]:
    """Soft deletes a message if owned by user."""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        return None

    if str(msg.user_id) != str(user_id):
        raise PermissionError("You can only delete your own messages")

    msg.is_deleted = True
    msg.content = "[This message was deleted]"
    db.commit()
    db.refresh(msg)
    return msg


def search_messages(db: Session, query_text: str, channel_id=None, limit: int = 50) -> List[MessageSearchResponse]:
    """Searches non-deleted messages."""
    query = db.query(Message, Channel.name.label("channel_name")).join(
        Channel, Message.channel_id == Channel.id
    ).filter(
        Message.is_deleted == False,
        Message.content.ilike(f"%{query_text}%")
    )

    if channel_id:
        query = query.filter(Message.channel_id == channel_id)

    results = query.order_by(Message.created_at.desc()).limit(limit).all()

    output = []
    for msg, channel_name in results:
        author_data = UserResponse.model_validate(msg.author) if msg.author else None
        output.append(MessageSearchResponse(
            id=msg.id,
            channel_id=msg.channel_id,
            channel_name=channel_name,
            user_id=msg.user_id,
            author=author_data,
            content=msg.content,
            created_at=msg.created_at
        ))

    return output
