import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import dotenv from "dotenv";
import path from "path";

// 環境変数（.env）の読み込み
const envPath = path.resolve(import.meta.dirname, "../../", ".env");
dotenv.config({ path: envPath });

// AIモデルを取得する関数
export const getModel = (
  provider: string,
  name: string | null,
  modelId: string,
  options: any,
): any => {
  // LLM Provider
  if (provider === "openai-compatible") {
    if (name === "xiaomi") {
      return {
        model: createOpenAICompatible({
          name: name,
          apiKey: process.env.MIMO_API_KEY,
          baseURL:
            process.env.MIMO_API_BASE_URL ?? "https://api.xiaomimimo.com/v1",
          includeUsage: true,
        })(modelId),
        ...options,
      };
    } else if (name === "plamo") {
      return {
        model: createOpenAICompatible({
          name: name ?? "lmstudio",
          apiKey: process.env.PLAMO_API_KEY,
          baseURL:
            process.env.PLAMO_API_BASE_URL ??
            "https://api.platform.preferredai.jp/v1",
          includeUsage: true,
        })(modelId),
        ...options,
      };
    } else {
      return {
        model: createOpenAICompatible({
          name: name ?? "lmstudio",
          apiKey: process.env.OPENAI_API_KEY,
          baseURL:
            process.env.OPENAI_API_BASE_URL ?? "http://localhost:8080/v1",
          includeUsage: true,
        })(modelId),
        ...options,
      };
    }
  } else if (provider === "google") {
    return {
      model: google(modelId),
      ...options,
    };
  }
  throw new Error(`Unknown provider or modelId: ${provider}, ${modelId}`);
};
