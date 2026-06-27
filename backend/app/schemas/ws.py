from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.websocket.events import WebSocketEvent


class BaseWSMessage(BaseModel):
    """
    Base model for every websocket message.
    """

    type: WebSocketEvent

    model_config = ConfigDict(use_enum_values=True)


class ChatMessage(BaseWSMessage):
    type: WebSocketEvent = WebSocketEvent.CHAT

    username: str
    message: str


class JoinMessage(BaseWSMessage):
    type: WebSocketEvent = WebSocketEvent.USER_JOINED

    username: str


class LeaveMessage(BaseWSMessage):
    type: WebSocketEvent = WebSocketEvent.USER_LEFT

    username: str


class CodeChangeMessage(BaseWSMessage):
    type: WebSocketEvent = WebSocketEvent.CODE_CHANGE

    language: str
    code: str


class CursorMessage(BaseWSMessage):
    type: WebSocketEvent = WebSocketEvent.CURSOR_MOVE

    username: str

    line: int = Field(..., ge=1)

    column: int = Field(..., ge=1)


class ErrorMessage(BaseWSMessage):
    type: WebSocketEvent = WebSocketEvent.ERROR

    message: str


class PingMessage(BaseWSMessage):
    type: WebSocketEvent = WebSocketEvent.PING


class PongMessage(BaseWSMessage):
    type: WebSocketEvent = WebSocketEvent.PONG


class BroadcastMessage(BaseModel):
    """
    Generic wrapper for future websocket payloads.
    """

    event: WebSocketEvent

    payload: dict[str, Any]

    timestamp: datetime