from enum import StrEnum

class WebSocketEvent(StrEnum):
    """
    Supported WebSocket event types.
    """

    # Connection events
    CONNECT = "connect"
    DISCONNECT = "disconnect"
    JOIN = "join"
    LEAVE = "leave"


    # Chat
    CHAT_MESSAGE = "chat_message"
    SYSTEM_MESSAGE = "system_message"
    TYPING = "typing"
    STOP_TYPING = "stop_typing"


    # Code editor
    CODE_CHANGE = "code_change"
    CURSOR_MOVE = "cursor_move"
    LANGUAGE_CHANGE = "language_change"


    # Presence
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"


    # Heartbeat
    PING = "ping"
    PONG = "pong"


    # Errors
    ERROR = "error"


