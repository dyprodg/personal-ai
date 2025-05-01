export type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  role: "user" | "assistant" | "system";
};

export type ChatHistory = {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  isPrivate?: boolean;
};

export type ChatHistoryPreview = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: string;
}; 