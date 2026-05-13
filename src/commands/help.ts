import type { Command } from "./types";
import type { Message } from "../types/Message";

// Helpコマンドの実装
export const helpCommand: Command = {
  name: "help",
  description: "Show available commands",
  execute: async (_args, context) => {
    const helpMessage = context.commands
      .map((c) => `/${c.name}: ${c.description}`)
      .join("\n");

    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: "/help",
    };

    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: `Available commands:\n${helpMessage}`,
    };

    context.setMessages((prev) => {
      const next = [...prev, userMessage, assistantMessage];
      if (context.messagesRef.current) {
        context.messagesRef.current = next;
      }
      return next;
    });
  },
};
