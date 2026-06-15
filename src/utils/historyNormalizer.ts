import type { Message, ToolMessage } from "../types/Message";
import type { ModelMessage } from "ai";

/**
 * Normalizes message history to prevent W&B Weave telemetry failures.
 * Patches any tool-call missing a matching tool-result with a dummy error result.
 */
export function normalizeHistory(messages: Message[]): {
  normalized: Message[];
  changed: boolean;
} {
  // すべての tool メッセージから toolCallId を収集
  const toolResultsMap = new Map<string, { toolName: string; output: any }>();
  for (const msg of messages) {
    if (msg.role === "tool") {
      for (const item of msg.content) {
        toolResultsMap.set(item.toolCallId, {
          toolName: item.toolName,
          output: item.output,
        });
      }
    }
  }

  const normalized: Message[] = [];
  let changed = false;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg) continue;

    if (msg.role === "tool") {
      // すでに normalized に追加されている（前の assistant 処理で補正マージされた）可能性がある
      const lastMsg = normalized[normalized.length - 1];
      if (lastMsg && lastMsg.role === "tool" && lastMsg.id === msg.id) {
        continue;
      }
      normalized.push(msg);
      continue;
    }

    normalized.push(msg);

    if (msg.role === "assistant" && msg.toolCalls && msg.toolCalls.length > 0) {
      const nextMsg = messages[i + 1];
      const missingResults = msg.toolCalls.filter(
        (tc: { toolCallId: string; toolName: string }) => !toolResultsMap.has(tc.toolCallId)
      );

      if (missingResults.length > 0) {
        changed = true;

        // ダミーのエラー結果を生成
        const dummyResults = missingResults.map((tc: { toolCallId: string; toolName: string }) => ({
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          type: "tool-result" as const,
          output: {
            type: "error",
            value: `Error: Tool execution failed or did not return a result.`,
          },
        }));

        if (nextMsg && nextMsg.role === "tool") {
          const updatedNextMsg: ToolMessage = {
            ...nextMsg,
            content: [...nextMsg.content, ...dummyResults],
          };
          normalized.push(updatedNextMsg);
        } else {
          const newToolMsg: ToolMessage = {
            id: crypto.randomUUID(),
            role: "tool",
            content: dummyResults,
          };
          normalized.push(newToolMsg);
        }
      } else if (nextMsg && nextMsg.role === "tool") {
        normalized.push(nextMsg);
      }
    }
  }

  return { normalized, changed };
}

/**
 * Translates application messages into Vercel AI SDK CoreMessage/ModelMessage structure.
 */
export function formatToModelMessages(messages: Message[]): ModelMessage[] {
  return messages.map((msg) => {
    switch (msg.role) {
      case "user":
        return { role: "user", content: msg.content };

      case "assistant":
        // If there are tool calls, content MUST be an array of parts
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          return {
            role: "assistant",
            content: [
              { type: "text", text: msg.content || "" },
              ...msg.toolCalls.map((tc) => ({
                type: "tool-call" as const,
                toolCallId: tc.toolCallId,
                toolName: tc.toolName,
                input: tc.input,
              })),
            ],
          };
        }
        // Otherwise, content can just be a string
        return { role: "assistant", content: msg.content };

      case "tool":
        return {
          role: "tool",
          content: msg.content.map((c) => ({
            type: "tool-result",
            toolCallId: c.toolCallId,
            toolName: c.toolName,
            result: c.output,
            output: { type: "text" as const, value: String(c.output) },
          })),
        };

      default:
        // Fallback for safety
        return { role: "user", content: "" };
    }
  });
}
