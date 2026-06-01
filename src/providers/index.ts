import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import dotenv from "dotenv";
import path from "path";
import { BasicTracerProvider, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { trace } from "@opentelemetry/api";

// 環境変数（.env）の読み込み
dotenv.config({ path: path.resolve(__dirname, "../../", ".env") });

let activeProvider: BasicTracerProvider | null = null;

export async function shutdownTelemetry() {
  if (activeProvider) {
    try {
      await activeProvider.shutdown();
    } catch (e) {
      console.error("Failed to shutdown telemetry provider:", e);
    }
  }
}

// AIモデルを取得する関数
export const getModel = (
  provider: string,
  name: string | null,
  modelId: string,
  options: any,
): any => {
  const USE_WEAVE: string = process.env.USE_WEAVE!;
  const WANDB_API_KEY: string = process.env.WANDB_API_KEY!;
  const WANDB_PROJECT_NAME: string = process.env.WANDB_PROJECT_NAME!;
  const WANDB_TEAM_NAME: string = process.env.WANDB_TEAM_NAME!;

  // W&B Weave
  if (USE_WEAVE === "true" && !activeProvider) {
    const exporter = new OTLPTraceExporter({
      url: "https://trace.wandb.ai/otel/v1/traces",
      headers: {
        "wandb-api-key": WANDB_API_KEY,
      },
    });

    const wandbProvider = new BasicTracerProvider({
      resource: resourceFromAttributes({
        "wandb.entity": WANDB_TEAM_NAME,
        "wandb.project": WANDB_PROJECT_NAME,
      }),
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });

    trace.setGlobalTracerProvider(wandbProvider);
    activeProvider = wandbProvider;
  }

  // LLM Provider
  if (provider === "openai-compatible") {
    return {
      model: createOpenAICompatible({
        name: name ?? "lmstudio",
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_BASE_URL ?? "http://localhost:8080/v1",
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
