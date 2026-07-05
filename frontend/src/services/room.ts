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