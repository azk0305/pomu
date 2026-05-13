import type { Command } from "./types";

// Exitコマンド（アプリケーション終了）の実装
export const exitCommand: Command = {
  name: "exit",
  description: "Exit the application",
  execute: async (_args, context) => {
    context.exit();
  },
};
