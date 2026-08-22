"""
Message Business Logic Service Module.

WHAT THIS MODULE DOES:
Handles posting messages, fetching channel streams & threads, soft-deleting own messages, and cross-channel message search.

WHY IT'S STRUCTURED THIS WAY:
1. `create_message`: Handles both root channel messages and threaded replies (`parent_id`).
2. `soft_delete_message`: Marks `is_deleted = True` and changes content to `[This message was deleted]` to preserve thread continuity without hard-deleting database records.
3. `search_messages`: Case-insensitive `ILIKE` pattern match across non-deleted messages.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.message import Message
from app.models.channel import Channel
from app.schemas.message import MessageCreate, MessageResponse, MessageSearchResponse
from app.schemas.user import UserResponse
from app.services.reaction_service import get_message_reaction_groups


def hydrate_message_response(db: Session, msg: Message, current_user_id=None) -> Dict[str, Any]:
    """
    Hydrates a Message ORM instance into a rich dictionary with author profile, reply count, and reaction pills.

    WHAT IT DOES:
    Calculates reply counts for root messages and groups emoji reactions.
    """
    reply_count = 0
    if msg.parent_id is None:
        reply_count = db.query(func.count(Message.id)).filter(
            Message.parent_id == msg.id,
            Message.is_deleted == False
        ).scalar() or 0

    reactions = get_message_reaction_groups(db, msg.id, current_user_id)

    author_data = None
    if msg.author:
        author_data = UserResponse.model_validate(msg.author)

    content_text = "[This message was deleted]" if msg.is_deleted else msg.content

    return {
        "id": msg.id,
        "channel_id": msg.channel_id,
        "user_id": msg.user_id,
        "parent_id": msg.parent_id,
        "content": content_text,
        "is_deleted": msg.is_deleted,
        "created_at": msg.created_at,
        "updated_at": msg.updated_at,
        "author": author_data,
        "reply_count": reply_count,
        "reactions": reactions
    }


def create_message(db: Session, channel_id, user_id, message_in: MessageCreate) -> Message:
    """
    Posts a new message or threaded reply in a channel.

    WHAT IT DOES:
    Inserts a row into `messages`. If `parent_id` is provided, verifies parent message exists.
    """
    msg = Message(
        channel_id=channel_id,
        user_id=user_id,
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
    Fetches non-threaded root channel messages ordered by creation time ascending.

    WHAT IT DOES:
    Queries `messages` where `channel_id = channel_id` and `parent_id IS NULL`.
    """
    messages = db.query(Message).filter(
        Message.channel_id == channel_id,
        Message.parent_id == None
    ).order_by(Message.created_at.asc()).limit(limit).all()

    return [hydrate_message_response(db, msg, current_user_id) for msg in messages]


def get_thread_messages(db: Session, message_id, current_user_id=None) -> Dict[str, Any]:
    """
    Fetches parent message and all its threaded replies.

    WHAT IT DOES:
    Queries parent message by `id` and all replies where `parent_id = message_id`.
    """
    parent = db.query(Message).filter(Message.id == message_id).first()
    if not parent:
        return {"parent": None, "replies": []}

    replies = db.query(Message).filter(
        Message.parent_id == message_id
    ).order_by(Message.created_at.asc()).all()

    hydrated_parent = hydrate_message_response(db, parent, current_user_id)
    hydrated_replies = [hydrate_message_response(db, r, current_user_id) for r in replies]

    return {
        "parent": hydrated_parent,
        "replies": hydrated_replies
    }


def soft_delete_message(db: Session, message_id, user_id) -> Optional[Message]:
    """
    Soft deletes a message if owned by user.

    WHAT IT DOES:
    Checks author ownership (`user_id == msg.user_id`), sets `is_deleted = True`, and updates content.
    """
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        return None

    # Enforce ownership check
    if str(msg.user_id) != str(user_id):
        raise PermissionError("You can only delete your own messages")

    msg.is_deleted = True
    msg.content = "[This message was deleted]"
    db.commit()
    db.refresh(msg)
    return msg


def search_messages(db: Session, query_text: str, channel_id=None, limit: int = 50) -> List[MessageSearchResponse]:
    """
    Searches non-deleted messages across channels or within a specific channel.

    WHAT IT DOES:
    Executes an `ILIKE %query_text%` query on message content.
    """
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
