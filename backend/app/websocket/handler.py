from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.schemas.ws import ErrorMessage
from app.websocket.auth import authenticate_websocket
from app.websocket.events import WebSocketEvent
from app.websocket.manager import manager
from app.utils.participant_colors import get_participant_color
from app.services.room_file_service import RoomFileService


class WebSocketHandler:
    """
    Handles authenticated websocket connections.
    """

    async def handle_connection(
        self,
        websocket: WebSocket,
        room_code: str,
        db: AsyncSession,
    ) -> None:

        try:
            # Authenticate user and verify room membership
            user, room = await authenticate_websocket(
                websocket,
                room_code,
                db,
            )
            participant_color = get_participant_color(user.id)

            # Register connection
            await manager.connect(
                room_code=room.room_code,
                user_id=user.id,
                websocket=websocket,
            )

            # Notify everyone
            await manager.broadcast(
                room.room_code,
                {
                    "type": WebSocketEvent.USER_JOINED,
                    "user_id": str(user.id),
                    "username": user.username,
                    "color": participant_color,
                },
            )

            await manager.broadcast(
                room.room_code,
                {
                    "type": WebSocketEvent.SYSTEM_MESSAGE,
                    "message": f"{user.username} joined the room",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )


            while True:
                data = await websocket.receive_json()
                print("Received:", data)
                message_type = data.get("type")

                if message_type == WebSocketEvent.CODE_CHANGE:
                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.CODE_CHANGE,
                            "user_id": str(user.id),
                            "username": user.username,
                            "changes": data.get("changes", []),
                        },
                        exclude_user=user.id,
                    )

                elif message_type == WebSocketEvent.CURSOR_MOVE:
                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.CURSOR_MOVE,
                            "user_id": str(user.id),
                            "username": user.username,
                            "color": participant_color,
                            "position": data.get("position"),
                        },
                        exclude_user=user.id,
                    )

                elif message_type == WebSocketEvent.LANGUAGE_CHANGE:
                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.LANGUAGE_CHANGE,
                            "user_id": str(user.id),
                            "username": user.username,
                            "language": data.get("language"),
                        },
                        exclude_user=user.id,
                    )

                elif message_type == WebSocketEvent.FILE_CREATE:

                    room_file_service = RoomFileService(db)
                    room_file = await room_file_service.create_file(
                        room=room,
                        parent_id=data.get("parentId"),
                        name=data["node"]["name"],
                        type=data["node"]["type"],
                        content=data["node"].get("content", ""),
                    )

                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.FILE_CREATE,
                            "parentId": data.get("parentId"),
                            "node": {
                                "id": str(room_file.id),
                                "name": room_file.name,
                                "type": room_file.type,
                                "content": room_file.content,
                            },
                        },
                    )

                elif message_type == WebSocketEvent.FILE_RENAME:          
                    room_file_service = RoomFileService(db)

                    room_file = await room_file_service.rename_file(
                        file_id=data["id"],
                        new_name=data["name"],
                    )
                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.FILE_RENAME,
                            "id": str(room_file.id),
                            "name": room_file.name,
                        },
                    )

                elif message_type == WebSocketEvent.FILE_DELETE:
                    room_file_service = RoomFileService(db)

                    await room_file_service.delete_file(
                        file_id=data["id"],
                    )
                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.FILE_DELETE,
                            "id": data["id"],
                        },
                    )

                elif message_type == WebSocketEvent.FILE_OPEN:
                    await manager.broadcast(
                        room.room_code,
                        data,
                        exclude_user=user.id,
                    )

                elif message_type == WebSocketEvent.CHAT_MESSAGE:
                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.CHAT_MESSAGE,
                            "user_id": str(user.id),
                            "username": user.username,
                            "color": participant_color,
                            "message": data.get("message"),
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        },
                    )

                elif message_type == WebSocketEvent.TYPING:
                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.TYPING,
                            "user_id": str(user.id),
                            "username": user.username,
                        },
                        exclude_user=user.id,
                    )

                elif message_type == WebSocketEvent.STOP_TYPING:
                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.STOP_TYPING,
                            "user_id": str(user.id),
                            "username": user.username,
                        },
                        exclude_user=user.id,
                    )

                elif message_type == WebSocketEvent.FILE_CONTENT_UPDATE:
                    room_file_service = RoomFileService(db)

                    room_file = await room_file_service.update_file_content(
                        file_id=data["fileId"],
                        content=data["content"],
                    )

                    await manager.broadcast(
                        room.room_code,
                        {
                            "type": WebSocketEvent.FILE_CONTENT_UPDATE,
                            "fileId": str(room_file.id),
                            "content": room_file.content,
                        },
                        exclude_user=user.id,
                    )
                
                else:
                    await manager.broadcast(
                        room.room_code,
                        data,
                    )

        except WebSocketDisconnect:

            manager.disconnect(
                room.room_code,
                user.id,
            )

            await manager.broadcast(
                room.room_code,
                {
                    "type": WebSocketEvent.USER_LEFT,
                    "user_id": str(user.id),
                    "username": user.username,
                    "color": participant_color,
                },
            )

            await manager.broadcast(
                room.room_code,
                {
                    "type": WebSocketEvent.SYSTEM_MESSAGE,
                    "message": f"{user.username} left the room",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

        except Exception as exc:

            try:
                await websocket.send_json(
                    ErrorMessage(
                        message=str(exc),
                    ).model_dump()
                )
            except Exception:
                pass

            await websocket.close()


handler = WebSocketHandler()

