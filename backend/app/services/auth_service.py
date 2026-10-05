import secrets

from passlib.context import CryptContext
from sqlalchemy import select, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.security import create_access_token, verify_password
from app.core.oauth.google import get_profile_from_code, OAuthProfile
from app.models.user import User
from app.models.oauth_account import OAuthAccount
from app.schemas.auth import TokenResponse, UserLoginRequest, UserSignupRequest

from app.models.oauth_account import OAuthAccount


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

    async def _get_user_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def _get_oauth_account(
        self, provider: str, provider_user_id: str
    ) -> OAuthAccount | None:
        result = await self.db.execute(
            select(OAuthAccount).where(
                OAuthAccount.provider == provider,
                OAuthAccount.provider_user_id == provider_user_id,
            )
        )
        return result.scalar_one_or_none()

    async def _generate_unique_username(self, base: str) -> str:
        base = base.lower().replace(" ", "")[:40] or "user"
        candidate = base
        while await self._get_user_by_username(candidate):
            candidate = f"{base}_{secrets.token_hex(3)}"
        return candidate

    async def signup(self, payload: UserSignupRequest) -> User:
        """
        Register a new user.

        Raises:
            HTTPException(409): if username or email already exists.
            HTTPException(500): if the user could not be persisted.
        """

        # Validate unique username
        if await self._get_user_by_username(payload.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken.",
            )

        # Validate unique email
        if await self._get_user_by_email(payload.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered.",
            )

        new_user = User(
            username=payload.username,
            email=payload.email,
            hashed_password=self._hash_password(payload.password),
        )

        self.db.add(new_user)

        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email is already registered."
            )

        await self.db.refresh(new_user)
        return new_user

    async def login(self, payload: UserLoginRequest) -> TokenResponse:
        """
        Authenticate a user and issue a JWT access token.

        Raises:
            HTTPException(401): if the username or email does not exist or the
                password does not match.
        """

        result = await self.db.execute(
            select(User).where(
                or_(
                    User.username == payload.identifier,
                    User.email == payload.identifier,
                )
            )
        )

        user = result.scalar_one_or_none()

        if user is None or user.hashed_password is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        access_token = create_access_token(subject=user.id)

        return TokenResponse(access_token=access_token, token_type="bearer")

    async def oauth_login(self, provider: str, code: str) -> TokenResponse:
        """
        Generic OAuth login/signup entry point. Provider-specific code-exchange
        happens in app.core.oauth.<provider>; everything below this line is
        identical regardless of which provider was used.

        Raises:
            HTTPException(400): if the provider is not supported.
            HTTPException(409): on an account conflict during persistence.
        """
        if provider == "google":
            profile: OAuthProfile = await get_profile_from_code(code)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported OAuth provider: {provider}",
            )

        oauth_account = await self._get_oauth_account(
            profile["provider"], profile["provider_user_id"]
        )

        if oauth_account is not None:
            result = await self.db.execute(
                select(User).where(User.id == oauth_account.user_id)
            )
            user = result.scalar_one()

            oauth_account.email = profile["email"]
            oauth_account.avatar_url = profile["avatar_url"]

        else:
            user = await self._get_user_by_email(profile["email"])

            if user is None:
                # Brand new user via this provider.
                username = await self._generate_unique_username(
                    profile["email"].split("@")[0]
                )
                user = User(
                    username=username,
                    email=profile["email"],
                    hashed_password=None,
                    profile_picture=profile["avatar_url"],
                )
                self.db.add(user)
                await self.db.flush()  # populate user.id before linking

            # Link this provider to the (existing or new) user.
            oauth_account = OAuthAccount(
                user_id=user.id,
                provider=profile["provider"],
                provider_user_id=profile["provider_user_id"],
                email=profile["email"],
                avatar_url=profile["avatar_url"],
            )
            self.db.add(oauth_account)

        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Account conflict during OAuth sign-in.",
            )

        await self.db.refresh(user)

        access_token = create_access_token(subject=user.id)
        return TokenResponse(access_token=access_token, token_type="bearer")

