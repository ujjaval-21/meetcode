from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLoginRequest, UserSignupRequest

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service layer for authentication-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _hash_password(password: str) -> str:
        return pwd_context.hash(password)

    async def _get_user_by_username(self, username: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def _get_user_by_user_id(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def signup(self, payload: UserSignupRequest) -> User:
        """
        Register a new user.

        Raises:
            HTTPException(409): if username or user_id already exists.
            HTTPException(500): if the user could not be persisted.
        """

        # Validate unique username
        if await self._get_user_by_username(payload.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken.",
            )

        # Validate unique user_id
        if await self._get_user_by_user_id(payload.user_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User ID is already taken.",
            )

        new_user = User(
            username=payload.username,
            user_id=payload.user_id,
            hashed_password=self._hash_password(payload.password),
        )

        self.db.add(new_user)

        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or User ID is already taken.",
            )

        await self.db.refresh(new_user)
        return new_user

    async def login(self, payload: UserLoginRequest) -> TokenResponse:
        """
        Authenticate a user and issue a JWT access token.

        Raises:
            HTTPException(401): if the username does not exist or the
                password does not match.
        """

        user = await self._get_user_by_username(payload.username)

        if user is None or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        access_token = create_access_token(subject=user.id)

        return TokenResponse(access_token=access_token, token_type="bearer")