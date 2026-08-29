import { useEffect, useState } from "react";
import { getRoom } from "../services/room";
import { getToken } from "../services/storage";
import { useRoom } from "./useRoom";

export function useRoomLoader(roomCode: string) {
  const {
    room,
    setRoom,
    refreshParticipants,
    connectSocket,
    disconnectSocket,
  } = useRoom();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomCode) return;

    async function loadRoom() {
      try {
        const roomData = await getRoom(roomCode);

        setRoom(roomData);

        await refreshParticipants(roomCode);

        const token = getToken();

        if (token) {
          connectSocket(roomCode, token);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadRoom();

    return () => {
      disconnectSocket();
    };
  }, [roomCode]);

  return {
    room,
    loading,
  };
}