from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.room import CreateRoomRequest, RoomResponse
from app.services.room_service import RoomService

router = APIRouter(prefix="/api/v1/rooms", tags=["rooms"])


@router.post(
    "/create",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new coding room",
)
async def create_room(
    payload: CreateRoomRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RoomResponse:
    """
    Create a new collaborative coding room.

    The authenticated user becomes the room's host. A unique 8-character
    uppercase `room_code` is generated automatically and returned in the
    response — share it with others so they can join the room.
    """
    room_service = RoomService(db)
    new_room = await room_service.create_room(current_user, payload)
    return new_room