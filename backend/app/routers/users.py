"""
Users API Router.

WHAT THIS MODULE DOES:
Exposes HTTP REST routes for signup registration, password login, profile retrieval, and bio updates.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserSignup, UserLogin, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(signup_data: UserSignup, db: Session = Depends(get_db)):
    """
    POST /api/v1/users/signup
    
    Purpose: Registers a new user account with username, password, display name, and bio.
    """
    try:
        return user_service.register_user(db, signup_data)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.post("/login", response_model=UserResponse, status_code=status.HTTP_200_OK)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    POST /api/v1/users/login
    
    Purpose: Authenticates user credentials and returns full user profile with bio.
    """
    try:
        return user_service.authenticate_user(db, login_data)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(ve))


@router.get("", response_model=List[UserResponse])
def list_workspace_users(db: Session = Depends(get_db)):
    """
    GET /api/v1/users
    
    Purpose: Retrieve all workspace members.
    """
    return user_service.get_all_users(db)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: UUID, db: Session = Depends(get_db)):
    """
    GET /api/v1/users/{user_id}
    
    Purpose: Fetch a specific member profile by UUID.
    """
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_profile(user_id: UUID, update_data: UserUpdate, db: Session = Depends(get_db)):
    """
    PATCH /api/v1/users/{user_id}
    
    Purpose: Update display name, status, bio, or avatar URL.
    """
    updated = user_service.update_user_profile(db, user_id, update_data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated
