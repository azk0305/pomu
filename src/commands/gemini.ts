import type { Command } from "./types";
import { executeDelegationCommand } from "../utils/subagentLauncher";

// Geminiコマンドの実装
export const geminiCommand: Command = {
  name: "gemini",
  description: "Delegate a command to Gemini",
  execute: async (args, context) => {
    await executeDelegationCommand("gemini", args, context);
  },
};

