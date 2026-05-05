import type { Command } from "./types";

export const helpCommand: Command = {
  name: "help",
  description: "Show available commands",
  execute: async (_args, context) => {
    const helpMessage = context.commands
      .map((c) => `/${c.name}: ${c.description}`)
      .join("\n");

    const newMessageId = crypto.randomUUID();
    const newMessage = {
      id: newMessageId,
      user: {
        id: `${newMessageId}-u`,
        content: "/help",
        role: "user" as const,
      },
      assistant: {
        id: `${newMessageId}-a`,
        content: `Available commands:\n${helpMessage}`,
        role: "assistant" as const,
      },
      tools: {
        id: `${newMessageId}-t`,
        content: [],
      },
      tokens: 0,
    };

    context.setMessages((prev) => {
      const next = [...prev, newMessage];
      if (context.messagesRef.current) {
        context.messagesRef.current = next;
      }
      return next;
    });
  },
};
