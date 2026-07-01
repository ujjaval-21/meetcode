import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class UserSignupRequest(BaseModel):
    """Payload required to register a new user."""
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Unique username for the account.",
    )
    user_id: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Unique public identifier for the user.",
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
    user_id: str
    created_at: datetime

class UserLoginRequest(BaseModel):
    """Payload required to authenticate an existing user."""
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Username of the account.",
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