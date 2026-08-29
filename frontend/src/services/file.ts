import api from "./api";

export interface UpdateFileContentRequest {
  content: string;
}

export interface RoomFileResponse {
  id: string;
  room_id: string;
  parent_id: string | null;

  name: string;
  type: "file" | "folder";
  content: string | null;

  created_at: string;
  updated_at: string;
}

export async function updateFileContent(
  fileId: string,
  content: string
): Promise<RoomFileResponse> {

  const response = await api.put<RoomFileResponse>(
    `/rooms/files/${fileId}`,
    {
      content,
    }
  );

  return response.data;
}
