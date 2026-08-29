import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RoomFileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    room_id: uuid.UUID
    parent_id: uuid.UUID | None

    name: str
    type: str
    content: str | None

    created_at: datetime
    updated_at: datetime


class RenameRoomFileRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )


class UpdateRoomFileContentRequest(BaseModel):
    content: str


class DeleteRoomFileResponse(BaseModel):
    message: str



