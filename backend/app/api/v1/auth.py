from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserResponse,
    UserSignupRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(
    payload: UserSignupRequest,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Create a new user account.

    - **username**: must be unique
    - **user_id**: must be unique
    - **password**: hashed with bcrypt before storage
    """
    auth_service = AuthService(db)
    new_user = await auth_service.signup(payload)
    return new_user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate a user and issue a JWT access token",
)
async def login(
    payload: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate with username and password.

    - **username**: existing account username
    - **password**: plain-text password, verified against the stored hash

    Returns a JWT **access_token** (type `bearer`) on success.
    Responds with **401 Unauthorized** if the credentials are invalid.
    """
    auth_service = AuthService(db)
    return await auth_service.login(payload)