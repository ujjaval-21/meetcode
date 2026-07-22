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


class JoinRoomRequest(BaseModel):
    room_code: str


class ParticipantResponse(BaseModel):
    id: uuid.UUID
    room_id: uuid.UUID
    user_id: uuid.UUID
    is_host: bool

    model_config = ConfigDict(from_attributes=True)


class RoomDetailResponse(BaseModel):
    id: uuid.UUID
    room_code: str
    title: str
    description: str | None
    is_private: bool
    max_participants: int
    participant_count: int
    host_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class LeaveRoomRequest(BaseModel):
    """Request payload for leaving a room."""

    room_code: str = Field(
        ...,
        min_length=8,
        max_length=8,
        pattern=r"^[A-Z0-9]{8}$",
        description="8-character uppercase room code.",
    )

class MessageResponse(BaseModel):
    """Response returned after successfully leaving a room."""

    message: str = Field(
        ...,
        description="Confirmation message.",
    )
    room_code: str = Field(
        ...,
        description="Room that the user left.",
    )
    user_id: uuid.UUID = Field(
        ...,
        description="User who left the room.",
    )

class RoomParticipantResponse(BaseModel):
    """Information about a participant inside a room."""

    user_id: uuid.UUID
    username: str
    is_host: bool
    color: str

    model_config = ConfigDict(from_attributes=True)


class RoomParticipantsResponse(BaseModel):
    """List of all participants in a room."""

    room_code: str
    participant_count: int
    participants: list[RoomParticipantResponse]

    