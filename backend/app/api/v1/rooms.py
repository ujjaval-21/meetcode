from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.room import CreateRoomRequest, RoomResponse
from app.schemas.room import RoomDetailResponse
from app.services.room_service import RoomService
from app.services.room_file_service import RoomFileService
from app.schemas.room_file import (
    RoomFileResponse,
    UpdateRoomFileContentRequest,
    RenameRoomFileRequest,
    DeleteRoomFileResponse,
)
from app.schemas.room import (
    CreateRoomRequest,
    RoomResponse,
    JoinRoomRequest,
    ParticipantResponse,
    RoomDetailResponse,
    LeaveRoomRequest,
    MessageResponse,
    RoomParticipantsResponse,
)


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


@router.post(
    "/join",
    response_model=ParticipantResponse
)
async def join_room(
    payload: JoinRoomRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    room_service = RoomService(db)

    participant = await room_service.join_room(
        payload.room_code,
        current_user
    )

    return participant


@router.get(
    "/{room_code}",
    response_model=RoomDetailResponse
)
async def get_room(
    room_code: str,
    db: AsyncSession = Depends(get_db)
):
    room_service = RoomService(db)

    room = await room_service.get_room_by_code(
        room_code
    )

    return room


@router.delete(
    "/leave",
    response_model=MessageResponse,
    summary="Leave a coding room",
)
async def leave_room(
    payload: LeaveRoomRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """
    Leave a collaborative coding room.
    """

    room_service = RoomService(db)

    return await room_service.leave_room(
        payload.room_code,
        current_user,
    )


@router.put(
    "/files/{file_id}",
    response_model=RoomFileResponse,
    summary="Update file content",
)
async def update_file_content(
    file_id: str,
    payload: UpdateRoomFileContentRequest,
    db: AsyncSession = Depends(get_db),
):

    file_service = RoomFileService(db)

    return await file_service.update_file_content(
        file_id=file_id,
        content=payload.content,
    )



@router.get(
    "/{room_code}/participants",
    response_model=RoomParticipantsResponse,
    summary="List room participants",
)
async def get_room_participants(
    room_code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RoomParticipantsResponse:
    """
    Return all participants currently inside a room.
    """

    room_service = RoomService(db)

    return await room_service.get_room_participants(
    room_code,
    current_user,
    )


@router.get(
    "/{room_code}/files",
    response_model=list[RoomFileResponse],
    summary="Get room file tree",
)
async def get_room_files(
    room_code: str,
    db: AsyncSession = Depends(get_db),
):
    room_service = RoomService(db)
    room = await room_service.get_room_by_code(room_code)

    file_service = RoomFileService(db)

    return await file_service.get_room_files(room["id"])


@router.patch(
    "/{room_code}/files/{file_id}",
    response_model=RoomFileResponse,
    summary="Rename a room file",
)
async def rename_room_file(
    room_code: str,
    file_id: str,
    payload: RenameRoomFileRequest,
    db: AsyncSession = Depends(get_db),
):

    file_service = RoomFileService(db)

    return await file_service.rename_file(
        file_id=file_id,
        new_name=payload.name,
    )


@router.delete(
    "/{room_code}/files/{file_id}",
    response_model=DeleteRoomFileResponse,
    summary="Delete a room file",
)
async def delete_room_file(
    room_code: str,
    file_id: str,
    db: AsyncSession = Depends(get_db),
):

    file_service = RoomFileService(db)

    await file_service.delete_file(file_id)

    return DeleteRoomFileResponse(
        message="File deleted successfully",
    )


