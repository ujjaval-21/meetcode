from uuid import UUID

from fastapi import HTTPException, WebSocket
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.models.participant import Participant
from app.models.room import Room
from app.models.user import User


async def authenticate_websocket(
    websocket: WebSocket,
    room_code: str,
    db: AsyncSession,
) -> tuple[User, Room]:
    """
    Authenticate a websocket connection.

    Validates:
    - JWT token
    - User exists
    - Room exists
    - User is a participant in the room
    """

    token = websocket.query_params.get("token")

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token",
        )

    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user_result = await db.execute(
        select(User).where(User.id == UUID(user_id))
    )

    user = user_result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    room_result = await db.execute(
        select(Room).where(Room.room_code == room_code)
    )

    room = room_result.scalar_one_or_none()

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    participant_result = await db.execute(
        select(Participant).where(
            Participant.room_id == room.id,
            Participant.user_id == user.id,
        )
    )

    participant = participant_result.scalar_one_or_none()

    if participant is None:
        raise HTTPException(
            status_code=403,
            detail="You must join the room first",
        )

    return user, room