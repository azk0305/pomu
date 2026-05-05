import type { Command } from "./types";

export const exitCommand: Command = {
  name: "exit",
  description: "Exit the application",
  execute: async (_args, context) => {
    context.exit();
  },
};
