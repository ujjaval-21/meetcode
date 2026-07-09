import api from "./api";

export interface CreateRoomRequest {
  title: string;
  description?: string;
  is_private: boolean;
  max_participants: number;
}

export interface RoomResponse {
  id: string;
  room_code: string;
  title: string;
  description: string | null;
  host_id: string;
  is_private: boolean;
  max_participants: number;
  created_at: string;
}

export async function createRoom(
  data: CreateRoomRequest
): Promise<RoomResponse> {

  const response = await api.post<RoomResponse>(
    "/rooms/create",
    data
  );

  return response.data;
}



export interface RoomDetailResponse {
  id: string;
  room_code: string;
  title: string;
  description: string | null;
  is_private: boolean;
  max_participants: number;
  participant_count: number;
  host_id: string;
}

export async function getRoom(
  roomCode: string
): Promise<RoomDetailResponse> {

  const response = await api.get<RoomDetailResponse>(
    `/rooms/${roomCode}`
  );

  return response.data;
}


export interface JoinRoomRequest {
  room_code: string;
}

export interface ParticipantResponse {
  id: string;
  room_id: string;
  user_id: string;
  is_host: boolean;
}

export async function joinRoom(
  data: JoinRoomRequest
): Promise<ParticipantResponse> {
  const response = await api.post<ParticipantResponse>(
    "/rooms/join",
    data
  );

  return response.data;
}



export interface RoomParticipant {
  user_id: string;
  username: string;
  is_host: boolean;
}

export interface RoomParticipantsResponse {
  room_code: string;
  participant_count: number;
  participants: RoomParticipant[];
}

export async function getParticipants(
  roomCode: string
): Promise<RoomParticipantsResponse> {

  const response = await api.get<RoomParticipantsResponse>(
    `/rooms/${roomCode}/participants`
  );

  return response.data;
}


export interface LeaveRoomRequest {
  room_code: string;
}

export interface LeaveRoomResponse {
  message: string;
  room_code: string;
  user_id: string;
}

export async function leaveRoom(
  roomCode: string
): Promise<LeaveRoomResponse> {

  const response = await api.delete<LeaveRoomResponse>(
    "/rooms/leave",
    {
      data: {
        room_code: roomCode,
      },
    }
  );

  return response.data;
}