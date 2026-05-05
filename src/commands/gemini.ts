import type { Command } from "./types";
import { spawn } from "bun";

export const geminiCommand: Command = {
  name: "gemini",
  description: "Delegate a command to Gemini",
  execute: async (args, context) => {
    // User Messageを表示
    const newMessageId = crypto.randomUUID();
    const newMessage = {
      id: newMessageId,
      user: {
        id: `${newMessageId}-u`,
        content: "/gemini " + args.join(" "),
        role: "user" as const,
      },
      assistant: {
        id: `${newMessageId}-a`,
        content: "",
        reasoning: "",
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

    // Geminiにdelegate
    const proc = spawn(["gemini", "-p", args.join(" ")], {
      cwd: process.cwd(),
      stdout: "pipe",
      stderr: "pipe",
    });
    const text = await proc.stdout.text();

    // Assistant Messageを表示
    context.setMessages((prev) => {
      const next = prev.map((msg) => {
        if (msg.id === newMessageId) {
          return { ...msg, assistant: { ...msg.assistant, content: text } };
        }
        return msg;
      });
      if (context.messagesRef.current) {
        context.messagesRef.current = next;
      }
      return next;
    });
  },
};