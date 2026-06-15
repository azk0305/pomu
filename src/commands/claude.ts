import type { Command } from "./types";
import { executeDelegationCommand } from "../utils/subagentLauncher";

// Claudeコマンドの実装
export const claudeCommand: Command = {
  name: "claude",
  description: "Delegate a command to Claude",
  execute: async (args, context) => {
    await executeDelegationCommand("claude", args, context);
  },
};

