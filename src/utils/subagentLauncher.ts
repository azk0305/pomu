import { spawn } from "bun";
import type React from "react";
import type { Message } from "../types/Message";

export interface SubagentExecutionResult {
  success: boolean;
  output: string;
}

/**
 * Resolves the system-specific CLI command array for a subagent.
 */
export const getSubagentCommand = (agentName: string, prompt: string): string[] => {
  const name = agentName.toLowerCase();
  switch (name) {
    case "pomu":
      return ["bun", "run", "src/index.ts", "--yolo", "-p", prompt];
    case "claude":
      return ["claude", "--permission-mode", "bypassPermissions", "-p", prompt];
    case "codex":
      return ["codex", "exec", "--yolo", prompt];
    case "gemini":
      return ["agy", "--dangerously-skip-permissions", "-p", prompt];
    default:
      return [agentName, "--yolo", "-p", prompt];
  }
};

/**
 * Spawns a subagent process, awaits its exit, and returns the output/errors.
 */
export const runSubagent = async (
  agentName: string,
  prompt: string
): Promise<SubagentExecutionResult> => {
  const command = getSubagentCommand(agentName, prompt);
  const proc = spawn(command, {
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
    detached: true,
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode === 0) {
    return {
      success: true,
      output: stdout.trim(),
    };
  } else {
    const errorOutput = stderr.trim() || stdout.trim() || "No output provided.";
    return {
      success: false,
      output: `Agent '${agentName}' failed with exit code ${exitCode}:\n${errorOutput}`,
    };
  }
};

/**
 * Consolidated runner for TUI-based slash commands (/claude, /gemini, /codex).
 * Handles user prompt parsing, UI state updates (message placeholders), and process execution.
 */
export const executeDelegationCommand = async (
  agentName: string,
  args: string[],
  context: {
    messagesRef: React.RefObject<Message[]>;
    setMessages: (messages: (prev: Message[]) => Message[]) => void;
  }
): Promise<void> => {
  const prompt = args.join(" ");
  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  const userMessage: Message = {
    id: userMessageId,
    role: "user",
    content: `/${agentName} ${prompt}`,
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

  const result = await runSubagent(agentName, prompt);

  context.setMessages((prev) => {
    const next = prev.map((msg) => {
      if (msg.id === assistantMessageId && msg.role === "assistant") {
        return { ...msg, content: result.output };
      }
      return msg;
    });
    if (context.messagesRef.current) {
      context.messagesRef.current = next;
    }
    return next;
  });
};
