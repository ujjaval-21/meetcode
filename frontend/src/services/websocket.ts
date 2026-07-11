export class RoomSocket {
  private socket: WebSocket | null = null;

  private listeners: Array<(data: any) => void> = [];

  connect(roomCode: string, token: string) {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      return;
    }

    this.socket = new WebSocket(
      `ws://localhost:8000/ws/${roomCode}?token=${token}`
    );

    this.socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      this.listeners.forEach((listener) =>
        listener(data)
      );
    };

    this.socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    this.socket.onerror = (err) => {
      console.error(err);
    };
  }

  addListener(listener: (data: any) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (data: any) => void) {
    this.listeners =
      this.listeners.filter(
        (l) => l !== listener
      );
  }

  send(data: any) {
    this.socket?.send(JSON.stringify(data));
  }

  disconnect() {
    this.listeners = [];
    this.socket?.close();
    this.socket = null;
  }
}

export const roomSocket = new RoomSocket();