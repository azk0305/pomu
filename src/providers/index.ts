import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../', '.env') });

export const getModel = (
  provider: string,
  name: string | null,
  modelId: string,
  options: any,
): any => {
  if (provider === "openai-compatible") {
    return {
      model: createOpenAICompatible({
        name: name ?? "lmstudio",
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_BASE_URL ?? "http://localhost:1234/v1",
        includeUsage: true,
      })(modelId),
      ...options,
    };
  } else if (provider === "google") {
    return {
      model: google(modelId),
      ...options,
    };
  }
  throw new Error(`Unknown provider or modelId: ${provider}, ${modelId}`);
};
