// メッセージの型定義
export type Role = "user" | "assistant" | "tool";

export interface BaseMessage {
  id: string;
  role: Role;
}

export interface UserMessage extends BaseMessage {
  role: "user";
  content: string;
}

export interface AssistantMessage extends BaseMessage {
  role: "assistant";
  content: string;
  reasoning?: string;
  toolCalls?: Array<{
    toolCallId: string;
    toolName: string;
    input: any;
  }>;
  tokens?: number;
}

export interface ToolMessage extends BaseMessage {
  role: "tool";
  content: Array<{
    toolCallId: string;
    toolName: string;
    type: string;
    output: any;
  }>;
}

export type Message = UserMessage | AssistantMessage | ToolMessage;
