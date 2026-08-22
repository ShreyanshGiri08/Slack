"""
User Business Logic Service Module.

WHAT THIS MODULE DOES:
Implements core business operations for users (registration, login lookup, profile edits, avatar assignment).

WHY IT'S STRUCTURED THIS WAY:
1. Keeps database queries and business policies completely out of FastAPI route handlers.
2. Uses the free public DiceBear API (`https://api.dicebear.com/7.x/bottts/svg?seed=...`) to auto-generate crisp modern avatars based on usernames.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserLogin, UserUpdate


def get_or_create_user(db: Session, login_data: UserLogin) -> User:
    """
    Finds an existing user by username or creates a new user with an auto-generated DiceBear avatar.

    WHAT IT DOES:
    Queries the `users` table for `username`. If found, updates display name & status.
    If not found, generates an avatar URL and inserts a new `User` record.

    WHY IT'S NEEDED:
    Provides frictionless login/onboarding without requiring complex password authentication for hackathons.
    """
    user = db.query(User).filter(User.username == login_data.username).first()
    
    if user:
        # Update existing user profile attributes
        user.display_name = login_data.display_name
        if login_data.status:
            user.status = login_data.status
        db.commit()
        db.refresh(user)
        return user

    # Generate modern robot/person avatar via DiceBear API
    avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={login_data.username}"
    
    new_user = User(
        username=login_data.username,
        display_name=login_data.display_name,
        avatar_url=avatar_url,
        status=login_data.status or "Online"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def get_user_by_id(db: Session, user_id) -> Optional[User]:
    """
    Fetches a user profile by UUID.

    WHAT IT DOES:
    Executes a single primary key lookup on the `users` table.
    """
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session) -> List[User]:
    """
    Lists all workspace members.

    WHAT IT DOES:
    Returns all rows in the `users` table ordered by display name.
    """
    return db.query(User).order_by(User.display_name.asc()).all()


def update_user_profile(db: Session, user_id, update_data: UserUpdate) -> Optional[User]:
    """
    Updates profile attributes for an existing user.

    WHAT IT DOES:
    Applies non-null patch values to user record and persists changes.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    if update_data.display_name is not None:
        user.display_name = update_data.display_name
    if update_data.status is not None:
        user.status = update_data.status
    if update_data.avatar_url is not None:
        user.avatar_url = update_data.avatar_url

    db.commit()
    db.refresh(user)
    return user
