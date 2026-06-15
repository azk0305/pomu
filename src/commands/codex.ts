import type { Command } from "./types";
import { executeDelegationCommand } from "../utils/subagentLauncher";

// Codexコマンドの実装
export const codexCommand: Command = {
  name: "codex",
  description: "Delegate a command to Codex",
  execute: async (args, context) => {
    await executeDelegationCommand("codex", args, context);
  },
};

