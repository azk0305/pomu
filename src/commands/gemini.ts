import type { Command } from "./types";
import { spawn } from "bun";
import type { Message } from "../types/Message";

// Geminiコマンドの実装
export const geminiCommand: Command = {
  name: "gemini",
  description: "Delegate a command to Gemini",
  execute: async (args, context) => {
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: "/gemini " + args.join(" "),
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

    // Gemini(Antigravity)にdelegate
    const proc = spawn({
      cmd: ["agy", "--dangerously-skip-permissions", "-p", args.join(" ")],
      cwd: process.cwd(),
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
      detached: true,
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
