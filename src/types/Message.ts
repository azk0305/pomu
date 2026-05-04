// メッセージの型定義
export interface Message {
  id: string;
  user: User;
  assistant: Assistant;
  tools: Tools;
  tokens: number;
}

// ユーザーの型定義
export interface User {
  id: string;
  content: string;
  role: string;
}

// アシスタントの型定義
export interface Assistant {
  id: string;
  content: string;
  reasoning?: string;
  role: string;
}

// ツールの型定義
export interface Tools {
  id: string;
  content: Tool[];
}

// ツールの内容の型定義
export interface Tool {
  toolCallId: string;
  toolName: string;
  type: string;
  output: {
    type: string;
    value: string;
  }
}

// メッセージのアイテムの種類
export type MessageItemType = User | Assistant | Tool;
