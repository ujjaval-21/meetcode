import sys
import bcrypt

print("=" * 60)
print("Python:", sys.executable)
print("bcrypt:", bcrypt.__version__)
print("bcrypt file:", bcrypt.__file__)
print("=" * 60)

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.session import get_db
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Points clients to POST /api/v1/auth/login for the token request flow.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain-text password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str | Any, expires_minutes: int | None = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject: value to place in the "sub" claim (typically the user id).
        expires_minutes: override for token lifetime; falls back to
            settings.ACCESS_TOKEN_EXPIRE_MINUTES when not provided.

    Returns:
        Encoded JWT as a string.
    """
    expire_delta = timedelta(
        minutes=expires_minutes
        if expires_minutes is not None
        else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    expire_at = datetime.now(timezone.utc) + expire_delta

    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "exp": expire_at,
    }

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.

    Verifies the signature (using SECRET_KEY / ALGORITHM) and expiration.

    Raises:
        HTTPException(401): if the token is invalid, malformed, or expired.

    Returns:
        The decoded token payload.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        raise credentials_exception

    return payload


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Resolve the currently authenticated user from a Bearer JWT.

    Raises:
        HTTPException(401): if the token is missing, invalid, expired,
            has no "sub" claim, or does not match an existing user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user
