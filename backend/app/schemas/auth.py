import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class UserSignupRequest(BaseModel):
    """Payload required to register a new user."""
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Unique username for the account.",
    )
    email: EmailStr = Field(
        ...,
        description="Unique email address.",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Plain-text password (will be hashed before storage).",
    )

class UserResponse(BaseModel):
    """User data returned to the client after signup."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    email: EmailStr
    created_at: datetime

class UserLoginRequest(BaseModel):
    """Payload required to authenticate an existing user."""
    identifier: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Username or email.",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Plain-text password to verify against the stored hash.",
    )

class TokenResponse(BaseModel):
    """JWT access token returned after successful login."""
    access_token: str
    token_type: str = "bearer"


class GoogleAuthRequest(BaseModel):
    """Authorization code returned by @react-oauth/google (auth-code flow)."""
    code: str = Field(
        ...,
        description="One-time authorization code from Google, exchanged server-side for tokens.",
    )

    