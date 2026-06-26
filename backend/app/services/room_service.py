import secrets
import string
from unittest import result

from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.room import Room
from app.models.user import User
from app.models.participant import Participant
from app.schemas.room import CreateRoomRequest, MessageResponse
from app.schemas.room import RoomParticipantsResponse, RoomParticipantResponse


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
        """
        for _ in range(MAX_ROOM_CODE_ATTEMPTS):
            candidate = "".join(
                secrets.choice(ROOM_CODE_ALPHABET)
                for _ in range(ROOM_CODE_LENGTH)
            )

            if not await self._room_code_exists(candidate):
                return candidate

        raise RuntimeError(
            f"Failed to generate a unique room code after "
            f"{MAX_ROOM_CODE_ATTEMPTS} attempts."
        )


    async def create_room(
        self,
        current_user: User,
        payload: CreateRoomRequest
    ) -> Room:
        """
        Create a new room and automatically add the host
        as the first participant.
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
                await self.db.refresh(new_room)

                host_participant = Participant(
                    room_id=new_room.id,
                    user_id=current_user.id,
                    is_host=True,
                )

                self.db.add(host_participant)

                await self.db.commit()

                return new_room

            except IntegrityError:
                await self.db.rollback()
                continue

            except Exception:
                await self.db.rollback()
                raise

        raise RuntimeError(
            "Failed to create room due to repeated room_code collisions."
        )
    
    
    async def join_room(
        self,
        room_code: str,
        current_user: User
    ) -> Participant:

        result = await self.db.execute(
            select(Room).where(Room.room_code == room_code)
        )

        room = result.scalar_one_or_none()

        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )

        existing_participant = await self.db.execute(
            select(Participant).where(
                Participant.room_id == room.id,
                Participant.user_id == current_user.id
            )
        )

        if existing_participant.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already joined this room"
            )

        count_result = await self.db.execute(
            select(Participant).where(
                Participant.room_id == room.id
            )
        )

        participants = count_result.scalars().all()

        if len(participants) >= room.max_participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room is full"
            )

        participant = Participant(
            room_id=room.id,
            user_id=current_user.id,
            is_host=False
        )

        self.db.add(participant)

        await self.db.commit()

        await self.db.refresh(participant)

        return participant
   
    
    async def get_room_by_code(
        self,
        room_code: str
    ):
        result = await self.db.execute(
            select(Room).where(Room.room_code == room_code)
        )

        room = result.scalar_one_or_none()

        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )

        participant_result = await self.db.execute(
            select(Participant).where(
                Participant.room_id == room.id
            )
        )

        participants = participant_result.scalars().all()

        return {
            "id": room.id,
            "room_code": room.room_code,
            "title": room.title,
            "description": room.description,
            "is_private": room.is_private,
            "max_participants": room.max_participants,
            "participant_count": len(participants),
            "host_id": room.host_id,
        }
    

    async def leave_room(self, room_code: str, current_user: User, ) -> MessageResponse:
        
        room_result = await self.db.execute(
            select(Room).where(Room.room_code == room_code)
        )
        room = room_result.scalar_one_or_none()

        if room is None:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )

        participant_result = await self.db.execute(
            select(Participant).where(
            Participant.room_id == room.id,
            Participant.user_id == current_user.id,
            )
        )

        participant = participant_result.scalar_one_or_none()

        if participant is None:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not a participant in this room",
        )

        await self.db.delete(participant)
        await self.db.commit()

        remaining_result = await self.db.execute(
            select(Participant).where(
            Participant.room_id == room.id
            )
        )
        remaining_participants = remaining_result.scalars().all()

        if len(remaining_participants) == 0:
            await self.db.delete(room)
            await self.db.commit()  
        
        return MessageResponse(
            message="You have successfully left the room.",
            room_code=room_code,
            user_id=current_user.id
        ) 
    

    async def get_room_participants(
    self,
    room_code: str,
    current_user: User,
    ) -> RoomParticipantsResponse:
        """
        Return all participants currently inside a room.
        """
        # Check whether room exists
        room_result = await self.db.execute(
            select(Room).where(Room.room_code == room_code)
        )
        room = room_result.scalar_one_or_none()
        if room is None:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )

        participant_result = await self.db.execute(
            select(Participant).where(
            Participant.room_id == room.id,
            Participant.user_id == current_user.id,
            )
        )

        participant = participant_result.scalar_one_or_none()
        if participant is None:
            raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must join the room first",
        )

        # Fetch all participants with their usernames
        result = await self.db.execute(
        select(Participant, User)
        .join(User, Participant.user_id == User.id)
        .where(Participant.room_id == room.id)
        )

        rows = result.all()

        participants = [
            RoomParticipantResponse(
            user_id=user.id,
            username=user.username,
            is_host=participant.is_host,
            )
            for participant, user in rows
        ]
        
        return RoomParticipantsResponse(
            room_code=room.room_code,
            participant_count=len(participants),
            participants=participants,
        )

