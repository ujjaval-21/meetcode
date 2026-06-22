import secrets
import string

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.models.user import User
from app.schemas.room import CreateRoomRequest

ROOM_CODE_LENGTH = 8
ROOM_CODE_ALPHABET = string.ascii_uppercase + string.digits
MAX_ROOM_CODE_ATTEMPTS = 10


class RoomService:
    """Service layer for room-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _room_code_exists(self, room_code: str) -> bool:
        result = await self.db.execute(
            select(Room.id).where(Room.room_code == room_code)
        )
        return result.scalar_one_or_none() is not None

    async def _generate_unique_room_code(self) -> str:
        """
        Generate an 8-character uppercase alphanumeric room code,
        retrying until a unique value is found.

        Raises:
            RuntimeError: if a unique code could not be generated
                after MAX_ROOM_CODE_ATTEMPTS attempts.
        """
        for _ in range(MAX_ROOM_CODE_ATTEMPTS):
            candidate = "".join(
                secrets.choice(ROOM_CODE_ALPHABET) for _ in range(ROOM_CODE_LENGTH)
            )
            if not await self._room_code_exists(candidate):
                return candidate

        raise RuntimeError(
            "Failed to generate a unique room code after "
            f"{MAX_ROOM_CODE_ATTEMPTS} attempts."
        )

    async def create_room(self, current_user: User, payload: CreateRoomRequest) -> Room:
        """
        Create a new room hosted by the current user.

        Generates a unique room_code with retry-on-collision, both at
        generation time and at insert time (in case of a race condition).
        """
        for _ in range(MAX_ROOM_CODE_ATTEMPTS):
            room_code = await self._generate_unique_room_code()

            new_room = Room(
                room_code=room_code,
                title=payload.title,
                description=payload.description,
                host_id=current_user.id,
                is_private=payload.is_private,
                max_participants=payload.max_participants,
            )

            self.db.add(new_room)

            try:
                await self.db.commit()
            except IntegrityError:
                await self.db.rollback()
                # Extremely unlikely collision between the existence check
                # and the insert — retry with a freshly generated code.
                continue

            await self.db.refresh(new_room)
            return new_room

        raise RuntimeError(
            "Failed to create room due to repeated room_code collisions."
        )