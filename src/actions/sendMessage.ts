import type React from "react";
import type { Message } from "../types/Message";
import { getModel } from "../providers";
import { streamText, type ModelMessage } from "ai";

const SYSTEM_PROMPT =
  "You are a helpful coding assistant. Provide clear and concise answers.";

interface SendMessageOptions {
  userContent: string;
  messagesRef: React.RefObject<Message[]>;
  setMessages: (messages: (prev: Message[]) => Message[]) => void;
}

export async function sendMessage({
  userContent,
  messagesRef,
  setMessages,
}: SendMessageOptions) {
  // 新しいメッセージの受け口を作成する
  const newMessageId = crypto.randomUUID();

  const newMessage: Message = {
    id: newMessageId,
    user: {
      id: `${newMessageId}-u`,
      content: userContent,
      role: "user",
    },
    assistant: {
      id: `${newMessageId}-a`,
      content: "",
      reasoning: "",
      role: "assistant",
    },
    tokens: 0,
  };
  setMessages((prev) => [...prev, newMessage]);

  // プロンプトを整形する
  const prompts: ModelMessage[] = [
    ...(messagesRef.current ?? []).flatMap((msg) => [
      {
        role: msg.user.role,
        content: msg.user.content,
      } as ModelMessage,
      {
        role: msg.assistant.role,
        content: msg.assistant.content,
      } as ModelMessage,
    ]),
    {
      role: "user",
      content: userContent,
    } as ModelMessage,
  ];

  // AIモデルを呼び出す
  // const model = getModel("lmstudio", "qwen3.5-9b-ud-japanese-imatrix", {
  //   maxOutputTokens: 32768,
  //   temperature: 1.0,
  // });
  const model = getModel("google", "gemma-4-31b-it", {
    maxOutputTokens: 65536,
    temperature: 1.0,
    topP: 0.95,
    topK: 64,
  });

  const result = streamText({
    ...model,
    system: SYSTEM_PROMPT,
    messages: prompts,
    onFinish: (result) => {
      const tokens = result.usage.totalTokens ?? 0;
      setMessages((prev) => {
        const next = prev.map((msg) => {
          if (msg.id === newMessageId) {
            return { ...msg, tokens };
          }
          return msg;
        });
        if (messagesRef.current) {
          messagesRef.current = next;
        }
        return next;
      });
    },
  });

  // ストリームからテキストを取得し、メッセージを更新する
  for await (const part of result.fullStream) {
    setMessages((prev) => {
      const next = prev.map((msg) => {
        if (msg.id === newMessageId && msg.assistant) {
          if (part.type === "text-delta") {
            return {
              ...msg,
              assistant: {
                ...msg.assistant,
                content: msg.assistant.content + part.text,
              },
            };
          } else if (part.type === "reasoning-delta") {
            return {
              ...msg,
              assistant: {
                ...msg.assistant,
                reasoning: (msg.assistant.reasoning ?? "") + part.text,
              },
            };
          }
        }
        return msg;
      });
      if (messagesRef.current) {
        messagesRef.current = next;
      }
      return next;
    });
  }
}
