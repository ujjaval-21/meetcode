export interface UserChatMessage {
  id: string;
  type: "user";

  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;

  text: string;
  time: string;
}

export interface SystemChatMessage {
  id: string;
  type: "system";

  text: string;
  time: string;
}

export type ChatMessage =
  | UserChatMessage
  | SystemChatMessage;