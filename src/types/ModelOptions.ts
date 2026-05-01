import type { LanguageModel } from "ai";

// streamTextに指定するオプション値の型
export interface ModelOptions {
  model: LanguageModel;
  maxOutputTokens: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}
