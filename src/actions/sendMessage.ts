import type React from "react";
import type { Message, AssistantMessage } from "../types/Message";
import { model } from "../config/model";
import { streamText, type ModelMessage, stepCountIs } from "ai";
import { tools } from "../tools";
import { SYSTEM_PROMPT } from "../config/systemPrompt";

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

  // ユーザーメッセージをメッセージリストに追加して画面へ表示
  setMessages((prev) => {
    const next = [...prev, userMessage];
    if (messagesRef.current) messagesRef.current = next;
    return next;
  });

  // プロンプトの整形 (CoreMessage形式に変換)
  const prompts: ModelMessage[] = (messagesRef.current ?? []).map((msg) => {
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
            output: c.output, // Note: some versions of the SDK use 'result' instead of 'output'
          })),
        };

      default:
        // Fallback for safety
        return { role: "user", content: "" };
    }
  });

  // アシスタントメッセージの器を事前に作成（あるいは最初のレスポンス時に作成）
  let currentAssistantMessageId = crypto.randomUUID();
  let hasCreatedAssistantMessage = false;

  // AIモデルを呼び出してメッセージを受け取る
  const result = streamText({
    ...model,
    system: SYSTEM_PROMPT,
    messages: prompts,
    providerOptions: model.providerOptions,
    stopWhen: stepCountIs(10),
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
