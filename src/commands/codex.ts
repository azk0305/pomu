import type { Command } from "./types";
import { spawn } from "bun";
import type { Message } from "../types/Message";

export const codexCommand: Command = {
  name: "codex",
  description: "Delegate a command to Codex",
  execute: async (args, context) => {
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: "/codex " + args.join(" "),
    };

    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      reasoning: "",
      tokens: 0,
    };

    context.setMessages((prev) => {
      const next = [...prev, userMessage, assistantMessage];
      if (context.messagesRef.current) {
        context.messagesRef.current = next;
      }
      return next;
    });

    // Codexにdelegate
    const proc = spawn(["codex", "exec", "--yolo", args.join(" ")], {
      cwd: process.cwd(),
      stdout: "pipe",
      stderr: "pipe",
    });
    const text = await proc.stdout.text();

    // Assistant Messageを表示
    context.setMessages((prev) => {
      const next = prev.map((msg) => {
        if (msg.id === assistantMessageId && msg.role === "assistant") {
          return { ...msg, content: text };
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
