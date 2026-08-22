"""
Reaction Business Logic Service Module.

WHAT THIS MODULE DOES:
Handles creating/removing emoji reactions and aggregating reaction counts per message.

WHY IT'S STRUCTURED THIS WAY:
1. `get_message_reaction_groups`: Groups reactions by emoji symbol, counting total reactions and building a list of user IDs who reacted (enables `has_reacted` highlight in UI).
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.reaction import Reaction
from app.schemas.reaction import ReactionGroup, ReactionCreate


def add_reaction(db: Session, message_id, user_id, reaction_in: ReactionCreate) -> Reaction:
    """
    Adds an emoji reaction to a message. If the reaction already exists for user, returns existing.

    WHAT IT DOES:
    Checks unique constraint `(message_id, user_id, emoji)` before inserting a new Reaction row.
    """
    existing = db.query(Reaction).filter(
        Reaction.message_id == message_id,
        Reaction.user_id == user_id,
        Reaction.emoji == reaction_in.emoji
    ).first()

    if existing:
        return existing

    reaction = Reaction(
        message_id=message_id,
        user_id=user_id,
        emoji=reaction_in.emoji
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    return reaction


def remove_reaction(db: Session, message_id, user_id, emoji: str) -> bool:
    """
    Removes a user's emoji reaction from a message.

    WHAT IT DOES:
    Deletes the matching `Reaction` row if present.
    """
    reaction = db.query(Reaction).filter(
        Reaction.message_id == message_id,
        Reaction.user_id == user_id,
        Reaction.emoji == emoji
    ).first()

    if reaction:
        db.delete(reaction)
        db.commit()
        return True
    return False


def get_message_reaction_groups(db: Session, message_id, current_user_id=None) -> List[ReactionGroup]:
    """
    Aggregates message reactions into grouped UI pill counters.

    WHAT IT DOES:
    Queries all reactions for `message_id`, groups by emoji, builds `user_ids` array, and computes `has_reacted`.
    """
    reactions = db.query(Reaction).filter(Reaction.message_id == message_id).all()
    grouped: Dict[str, Dict[str, Any]] = {}

    for r in reactions:
        if r.emoji not in grouped:
            grouped[r.emoji] = {"emoji": r.emoji, "count": 0, "user_ids": []}
        grouped[r.emoji]["count"] += 1
        grouped[r.emoji]["user_ids"].append(r.user_id)

    result = []
    for emoji_str, data in grouped.items():
        has_reacted = bool(current_user_id and current_user_id in data["user_ids"])
        result.append(ReactionGroup(
            emoji=emoji_str,
            count=data["count"],
            user_ids=data["user_ids"],
            has_reacted=has_reacted
        ))

    return result
