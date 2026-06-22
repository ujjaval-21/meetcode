import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CreateRoomRequest(BaseModel):
    """Payload required to create a new coding room."""

    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Display name for the room.",
    )
    description: str | None = Field(
        default=None,
        max_length=2000,
        description="Optional longer description of the room's purpose.",
    )
    is_private: bool = Field(
        default=False,
        description="Whether the room requires a password to join.",
    )
    max_participants: int = Field(
        default=10,
        ge=2,
        le=100,
        description="Maximum number of participants allowed (2-100).",
    )


class RoomResponse(BaseModel):
    """Room data returned to the client after creation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    room_code: str
    title: str
    description: str | None
    host_id: uuid.UUID
    is_private: bool
    max_participants: int
    created_at: datetime