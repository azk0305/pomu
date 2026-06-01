import type React from "react";
import type { Message, AssistantMessage, ToolMessage } from "../types/Message";
import { model } from "../config/model";
import { streamText, type ModelMessage, stepCountIs } from "ai";
import { tools } from "../tools";
import { SYSTEM_PROMPT } from "../config/systemPrompt";
import { getDynamicSystemPrompt } from "../utils/skillManager";

interface SendMessageOptions {
  userContent: string;
  messagesRef: React.RefObject<Message[]>;
  setMessages: (messages: (prev: Message[]) => Message[]) => void;
}

// ユーザーメッセージを送信し、AIの応答を取得する関数
export async function sendMessage({
  userContent,
  messagesRef,
  setMessages,
}: SendMessageOptions) {
  // ユーザーメッセージを追加
  const userMessageId = crypto.randomUUID();
  const userMessage: Message = {
    id: userMessageId,
    role: "user",
    content: userContent,
  };

  // messagesRef.current を同期的に更新し、ステートを更新する準備
  const currentMessages = messagesRef.current ?? [];
  const updatedMessages = [...currentMessages, userMessage];

  if (messagesRef) {
    (messagesRef as any).current = updatedMessages;
  }

  // ユーザーメッセージをメッセージリストに追加して画面へ表示
  setMessages(() => updatedMessages);

  // --- メッセージ履歴の不整合（tool-callに対するtool-resultの欠落）を検出して補正 ---
  // すべての tool メッセージから toolCallId を収集
  const toolResultsMap = new Map<string, { toolName: string; output: any }>();
  for (const msg of updatedMessages) {
    if (msg.role === "tool") {
      for (const item of msg.content) {
        toolResultsMap.set(item.toolCallId, {
          toolName: item.toolName,
          output: item.output,
        });
      }
    }
  }

  const normalizedMessages: Message[] = [];
  let historyChanged = false;

  for (let i = 0; i < updatedMessages.length; i++) {
    const msg = updatedMessages[i];
    if (!msg) continue;

    if (msg.role === "tool") {
      // すでに normalizedMessages に追加されている（前の assistant 処理で補正マージされた）可能性がある
      const lastMsg = normalizedMessages[normalizedMessages.length - 1];
      if (lastMsg && lastMsg.role === "tool" && lastMsg.id === msg.id) {
        continue;
      }
      normalizedMessages.push(msg);
      continue;
    }

    normalizedMessages.push(msg);

    if (msg.role === "assistant" && msg.toolCalls && msg.toolCalls.length > 0) {
      const nextMsg = updatedMessages[i + 1];
      const missingResults = msg.toolCalls.filter(
        (tc: { toolCallId: string; toolName: string }) => !toolResultsMap.has(tc.toolCallId)
      );

      if (missingResults.length > 0) {
        historyChanged = true;

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
          normalizedMessages.push(updatedNextMsg);
        } else {
          const newToolMsg: ToolMessage = {
            id: crypto.randomUUID(),
            role: "tool",
            content: dummyResults,
          };
          normalizedMessages.push(newToolMsg);
        }
      } else if (nextMsg && nextMsg.role === "tool") {
        normalizedMessages.push(nextMsg);
      }
    }
  }

  // もし不整合が検出されて補正が行われた場合、状態も更新する
  if (historyChanged) {
    if (messagesRef) {
      (messagesRef as any).current = normalizedMessages;
    }
    setMessages(() => normalizedMessages);
  }

  // プロンプトの整形 (CoreMessage形式に変換)
  const prompts: ModelMessage[] = normalizedMessages.map((msg) => {
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

  // AIモデルを呼び出してメッセージを受け取る
  const result = streamText({
    ...model,
    system: getDynamicSystemPrompt(SYSTEM_PROMPT, normalizedMessages),
    messages: prompts,
    providerOptions: model.providerOptions,
    stopWhen: stepCountIs(10),
    experimental_telemetry: { isEnabled: true },
    tools,
    onFinish: (result) => {
      const tokens = result.usage.totalTokens ?? 0;
      setMessages((prev) => {
        const next = prev.map((msg) => {
          if (
            msg.id === currentAssistantMessageId &&
            msg.role === "assistant"
          ) {
            return { ...msg, tokens };
          }
          return msg;
        });
        if (messagesRef.current) messagesRef.current = next;
        return next;
      });
    },
  });

  // ストリームでの処理
  let currentAssistantMessageId = crypto.randomUUID();
  let hasCreatedAssistantMessage = false;

  for await (const part of result.fullStream) {
    setMessages((prev) => {
      let next = [...prev];

      // アシスタントメッセージが必要なタイプの場合、まだなければ作成
      if (
        !hasCreatedAssistantMessage &&
        (part.type === "text-delta" ||
          part.type === "reasoning-delta" ||
          part.type === "tool-call")
      ) {
        currentAssistantMessageId = crypto.randomUUID();
        const newAssistantMsg: AssistantMessage = {
          id: currentAssistantMessageId,
          role: "assistant",
          content: "",
          reasoning: "",
          toolCalls: [],
        };
        next.push(newAssistantMsg);
        hasCreatedAssistantMessage = true;
      }

      // 各パートに応じて更新
      next = next.map((msg) => {
        if (msg.id === currentAssistantMessageId && msg.role === "assistant") {
          if (part.type === "text-delta") {
            return { ...msg, content: msg.content + part.text };
          }
          if (part.type === "reasoning-delta") {
            return { ...msg, reasoning: (msg.reasoning ?? "") + part.text };
          }
          if (part.type === "tool-call") {
            return {
              ...msg,
              toolCalls: [
                ...(msg.toolCalls ?? []),
                {
                  type: "tool-call" as const,
                  toolCallId: part.toolCallId,
                  toolName: part.toolName,
                  input: part.input,
                },
              ],
            };
          }
        }
        return msg;
      });

      // Tool Result は新しいメッセージとして追加
      if (part.type === "tool-result") {
        const toolMsg: Message = {
          id: crypto.randomUUID(),
          role: "tool",
          content: [
            {
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              type: part.type,
              output: part.output,
            },
          ],
        };
        next.push(toolMsg);
        // 次のアシスタントの回答のためにフラグをリセット（必要なら新しいIDを発行）
        // ここでは AI SDK の maxSteps により次のターンが自動で始まるため、
        // 次の text-delta などが来た時に新しい AssistantMessage を作るようにする
        hasCreatedAssistantMessage = false;
      }

      if (messagesRef.current) messagesRef.current = next;
      return next;
    });
  }
}
