from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.ws import ErrorMessage
from app.websocket.auth import authenticate_websocket
from app.websocket.events import WebSocketEvent
from app.websocket.manager import manager
from app.utils.participant_colors import get_participant_color


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