from collections import defaultdict
from typing import Dict
from uuid import UUID

from fastapi import WebSocket


class ConnectionManager:
    """
    Manages active WebSocket connections grouped by room.
    """

    def __init__(self) -> None:
        # room_code -> {user_id: websocket}
        self.active_connections: Dict[str, Dict[UUID, WebSocket]] = defaultdict(dict)

    async def connect(
        self,
        room_code: str,
        user_id: UUID,
        websocket: WebSocket,
    ) -> None:
        """
        Accept a WebSocket connection and register it.
        """
        await websocket.accept()

        self.active_connections[room_code][user_id] = websocket

    def disconnect(
        self,
        room_code: str,
        user_id: UUID,
    ) -> None:
        """
        Remove a disconnected user.
        """
        if room_code not in self.active_connections:
            return

        self.active_connections[room_code].pop(user_id, None)

        if not self.active_connections[room_code]:
            del self.active_connections[room_code]

    async def send_personal_message(
        self,
        websocket: WebSocket,
        message: dict,
    ) -> None:
        await websocket.send_json(message)

    async def broadcast(
        self,
        room_code: str,
        message: dict,
    ) -> None:
        """
        Broadcast a JSON message to everyone in the room.
        """
        if room_code not in self.active_connections:
            return

        disconnected_users = []

        for user_id, websocket in self.active_connections[room_code].items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected_users.append(user_id)

        for user_id in disconnected_users:
            self.disconnect(room_code, user_id)

    def get_room_users(self, room_code: str) -> list[UUID]:
        """
        Return all connected users in a room.
        """
        return list(self.active_connections.get(room_code, {}).keys())


manager = ConnectionManager()