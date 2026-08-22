"""
User Business Logic Service Module.

WHAT THIS MODULE DOES:
Implements signup registration, password login authentication, profile bio updates, and DiceBear avatar generation.

WHY IT'S STRUCTURED THIS WAY:
1. `register_user`: Checks username uniqueness and assigns DiceBear avatar.
2. `authenticate_user`: Verifies credentials for user login.
3. `update_user_profile`: Handles bio and display name modifications.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserSignup, UserLogin, UserUpdate


def register_user(db: Session, signup_data: UserSignup) -> User:
    """
    Registers a new workspace member account.

    WHAT IT DOES:
    Verifies username is unique, auto-generates DiceBear avatar URL, and creates a User row.
    """
    existing = db.query(User).filter(User.username == signup_data.username).first()
    if existing:
        raise ValueError("Username is already taken")

    avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={signup_data.username}"
    
    new_user = User(
        username=signup_data.username,
        display_name=signup_data.display_name,
        password=signup_data.password,
        bio=signup_data.bio or "Software Engineer & Team Collaborator",
        avatar_url=avatar_url,
        status="Online"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, login_data: UserLogin) -> User:
    """
    Authenticates an existing user by username and password.

    WHAT IT DOES:
    Queries user by username and validates password.
    """
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user:
        raise ValueError("Invalid username or password")
    if user.password != login_data.password:
        raise ValueError("Invalid username or password")
    return user


def get_user_by_id(db: Session, user_id) -> Optional[User]:
    """Fetches user profile by UUID."""
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session) -> List[User]:
    """Lists all workspace members."""
    return db.query(User).order_by(User.display_name.asc()).all()


def update_user_profile(db: Session, user_id, update_data: UserUpdate) -> Optional[User]:
    """Updates display name, status, bio, or avatar URL."""
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    if update_data.display_name is not None:
        user.display_name = update_data.display_name
    if update_data.status is not None:
        user.status = update_data.status
    if update_data.bio is not None:
        user.bio = update_data.bio
    if update_data.avatar_url is not None:
        user.avatar_url = update_data.avatar_url

    db.commit()
    db.refresh(user)
    return user
