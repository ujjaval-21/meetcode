import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.models.room_file import RoomFile
from fastapi import HTTPException, status


class RoomFileService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_file(
        self,
        room: Room,
        parent_id: str | None,
        name: str,
        type: str,
        content: str | None = "",
    ) -> RoomFile:

        room_file = RoomFile(
            room_id=room.id,
            parent_id=uuid.UUID(parent_id)
            if parent_id
            else None,
            name=name,
            type=type,
            content=content,
        )

        self.db.add(room_file)

        await self.db.commit()
        await self.db.refresh(room_file)

        return room_file


    async def get_room_files(
        self,
        room_id: uuid.UUID,
    ) -> list[RoomFile]:

        result = await self.db.execute(
            select(RoomFile).where(
                RoomFile.room_id == room_id
            )
        )

        return result.scalars().all()


    async def get_file(
        self,
        file_id: str,
    ) -> RoomFile:

        result = await self.db.execute(
            select(RoomFile).where(
                RoomFile.id == uuid.UUID(file_id)
            )
        )

        room_file = result.scalar_one_or_none()

        if room_file is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found",
            )

        return room_file


    async def rename_file(
        self,
        file_id: str,
        new_name: str,
    ) -> RoomFile:

        room_file = await self.get_file(file_id)

        room_file.name = new_name

        await self.db.commit()
        await self.db.refresh(room_file)

        return room_file


    async def delete_file(
        self,
        file_id: str,
    ) -> None:

        room_file = await self.get_file(file_id)

        await self.db.delete(room_file)
        await self.db.commit()


    async def update_file_content(
        self,
        file_id: str,
        content: str,
    ) -> RoomFile:

        room_file = await self.get_file(file_id)

        room_file.content = content

        await self.db.commit()
        await self.db.refresh(room_file)

        return room_file


    