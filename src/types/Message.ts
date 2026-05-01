// メッセージの型定義
export interface Message {
  id: string;
  user: User;
  assistant: Assistant;
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
  role: string;
}
