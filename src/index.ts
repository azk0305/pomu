#!/usr/bin/env node

import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

import { Command } from "commander";

import { runAgentTUI } from "@ai-sdk/tui";
import { ToolLoopAgent, tool, registerTelemetry } from "ai";

import { LegacyOpenTelemetry } from "@ai-sdk/otel";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";

import { models } from "./models/models.js";
import { SYSTEM_PROMPT } from "./prompts/systemPrompt.js";
import { pomu_tools } from "./tools/index.js";

import { subagents } from "./subagents/index.js";

import dotenv from "dotenv";

// 環境変数（.env）の読み込み
const envPath = path.resolve(import.meta.dirname, "../", ".env");
dotenv.config({ path: envPath });

const pomu_model = process.env.POMU_AGENT_MAIN_MODEL
  ? process.env.POMU_AGENT_MAIN_MODEL
  : "gemma";

// Langfuse setup
const nodeSdk = new NodeSDK({
  spanProcessors: [new LangfuseSpanProcessor()],
});
nodeSdk.start();
registerTelemetry(new LegacyOpenTelemetry());

// 起動処理
function main() {
  const program = new Command();
  program
    .name("pomu")
    .description(
      "pomu - Perfectly Operational Multipurpose Unit, my personal AI assistant",
    )
    .version("2.0.0")
    .option(
      "-p, --prompt <string>",
      "Run in headless mode with the given prompt",
    )
    .option(
      "--writing",
      "Run in writing mode. Write texts according to user instructions.",
    )
    .option(
      "--editing",
      "Run in editing mode. Polish and edit texts according to user instructions.",
    )
    .action(async (options) => {
      // ~/.pomu を作成
      fs.mkdir(path.resolve(os.homedir(), ".pomu"), { recursive: true });

      // モードによってメインエージェントを変える
      let pomuAgent: ToolLoopAgent;
      if (options.writing) {
        pomuAgent = subagents.writer_agent;
      } else if (options.editing) {
        pomuAgent = subagents.editor_agent;
      } else {
        pomuAgent = new ToolLoopAgent({
          ...models[pomu_model as keyof typeof models],
          instructions: SYSTEM_PROMPT,
          telemetry: {
            functionId: "pomu-agent",
          },
          tools: pomu_tools,
        });
      }

      if (options.prompt) {
        // Headlessで実行
        const result = await pomuAgent.generate({
          prompt: options.prompt,
        });

        console.log(result.text);
      } else {
        await runAgentTUI({
          title: "Pomu Agent",
          agent: pomuAgent as any,
          tools: "full",
          reasoning: "full",
          responseStatistics: "outputTokenCount",
          contextSize: 256_000,
        });
      }

      // Flushes the trace to Langfuse
      await nodeSdk.shutdown();
    });

  program.parse();
}

main();
