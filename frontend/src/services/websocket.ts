export class RoomSocket {
  private socket: WebSocket | null = null;

  connect(
    roomCode: string,
    token: string,
    onMessage: (data: any) => void
  ) {
    this.socket = new WebSocket(
      `ws://localhost:8000/ws/${roomCode}?token=${token}`
    );

    this.socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    this.socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    this.socket.onerror = (err) => {
      console.error(err);
    };
  }

  send(data: any) {
    this.socket?.send(JSON.stringify(data));
  }

  disconnect() {
    this.socket?.close();
  }
}
export const roomSocket = new RoomSocket();