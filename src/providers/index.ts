import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import dotenv from "dotenv";
import type { ModelOptions } from "../types/ModelOptions";

dotenv.config();

export const getModel = (
  provider: string,
  modelId: string,
  options: Partial<ModelOptions>,
): ModelOptions => {
  if (provider === "lmstudio") {
    return {
      model: createOpenAICompatible({
        name: "lmstudio",
        baseURL: "http://localhost:1234/v1",
      })(modelId),
      maxOutputTokens: options.maxOutputTokens ?? 8192,
      temperature: options.temperature ?? 1.0,
    };
  } else if (provider === "google") {
    return {
      model: google(modelId),
      maxOutputTokens: options.maxOutputTokens ?? 65536,
      temperature: options.temperature ?? 1.0,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 64,
    };
  }
  throw new Error(`Unknown provider or modelId: ${provider}, ${modelId}`);
};
