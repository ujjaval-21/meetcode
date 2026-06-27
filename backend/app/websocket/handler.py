from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.ws import ErrorMessage
from app.websocket.auth import authenticate_websocket
from app.websocket.events import WebSocketEvent
from app.websocket.manager import manager


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
                    "username": user.username,
                },
            )

            while True:
                data = await websocket.receive_json()

                # Temporary: broadcast every message
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
                    "username": user.username,
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