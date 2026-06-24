import { tool } from "ai";
import { z } from "zod";

import { getCurrentTime } from "./getCurrentTime.js";

// エラーハンドリングラッパー：ツールの実行中に発生した例外をキャッチして、エラー結果オブジェクトを返す
const safeExecute = <I, O>(name: string, fn: (input: I) => Promise<O> | O) => {
  return async (input: I) => {
    try {
      return await fn(input);
    } catch (error: any) {
      return {
        type: "error",
        value: `Error executing tool '${name}': ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  };
};

// AIツールの集合
export const pomu_tools: Record<string, any> = {
  get_current_time: tool({
    description: "Get the current date and time in the jst locale",
    inputSchema: z.object({}),
    execute: safeExecute("get_current_time", async () => {
      return getCurrentTime();
    }),
  }),
};
