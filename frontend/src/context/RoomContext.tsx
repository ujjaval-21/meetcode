import {
  createContext,
  useContext,
  useState,
} from "react";

import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";

import type {
  RoomDetailResponse,
  RoomParticipant,
} from "../services/room";

import {
  getParticipants,
} from "../services/room";

import { roomSocket } from "../services/websocket";



interface RoomContextType {
  room: RoomDetailResponse | null;
  participants: RoomParticipant[];

  setRoom: Dispatch<
  SetStateAction<RoomDetailResponse | null>
  >;

  setParticipants: Dispatch<
  SetStateAction<RoomParticipant[]>
  >;

  refreshParticipants: (
    roomCode: string
  ) => Promise<void>;

  connectSocket: (
    roomCode: string,
    token: string
  ) => void;

  disconnectSocket: () => void;
  
}

const RoomContext = createContext<
  RoomContextType | undefined
>(undefined);

interface Props {
  children: ReactNode;
}

export function RoomProvider({
  children,
}: Props) {
  const [room, setRoom] =
    useState<RoomDetailResponse | null>(null);

  const [participants, setParticipants] =
    useState<RoomParticipant[]>([]);

  async function refreshParticipants(roomCode: string) {
    const data = await getParticipants(roomCode);
      setParticipants(data.participants);
  }

  function connectSocket(
    roomCode: string,
    token: string
  ) {
    roomSocket.connect(
      roomCode,
      token,
      async (message) => {
        console.log("WS:", message);

        if (
          message.type === "user_joined" ||
          message.type === "user_left"
        ) {
          await refreshParticipants(roomCode);
        }
      }
    );
  }

  function disconnectSocket() {
    roomSocket.disconnect();
  }



  return (
    <RoomContext.Provider
      value={{
        room,
        participants,
        setRoom,
        setParticipants,
        refreshParticipants,
        connectSocket,
        disconnectSocket,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error(
      "useRoom must be used inside RoomProvider"
    );
  }

  return context;
}