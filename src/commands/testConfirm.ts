import type { Command } from "./types";
import { confirmStore } from "../utils/confirmStore";

export const testConfirmCommand: Command = {
  name: "test-confirm",
  description: "Tests the confirmation dialog",
  execute: async (args, { setMessages }) => {
    const message =
      args.join(" ") || "This is a test confirmation. Do you agree?";

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Requesting confirmation for: "${message}"...`,
      },
    ]);

    const confirmed = await confirmStore.ask(message);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: confirmed ? "✅ Confirmed!" : "❌ Cancelled.",
      },
    ]);
  },
};
