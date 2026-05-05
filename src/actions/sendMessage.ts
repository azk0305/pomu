import type React from "react";
import type { Message } from "../types/Message";
import { model } from "../config/model";
import { streamText, type ModelMessage, tool, type ToolResultPart, stepCountIs } from "ai";
import { getCurrentTime } from "../tools/getCurrentTime";
import { z } from "zod";

const SYSTEM_PROMPT = `
You are a helpful assistant operating inside 'pomu', an agent harness. You provide clear and concise answers.
`;

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
    tools: {
      id: `${newMessageId}-t`,
      content: [],
    },
    tokens: 0,
  };
  setMessages((prev) => [...prev, newMessage]);

  // プロンプトを整形する
  const prompts: ModelMessage[] = [];
  (messagesRef.current ?? []).forEach((msg) => {
    // User
    prompts.push(
      {
        role: "user",
        content: msg.user.content,
      },
    );
    // Tool
    if (msg.tools?.content) {
      const toolCalls: ToolResultPart[] = [];
      for (const tool of msg.tools?.content) {
        toolCalls.push({
          toolCallId: tool.toolCallId,
          toolName: tool.toolName,
          type: "tool-result",
          output: {
            type: "text",
            value: tool.output.value,
          },
        })
        prompts.push(
          {
            role: "tool",
            content: toolCalls,
          }
        );
      }
    }
    // Assistant
    prompts.push(
      {
        role: "assistant",
        content: msg.assistant.content,
      },
    );
  });
  // new user message
  prompts.push(
    {
      role: "user",
      content: userContent,
    }
  );

  // AIモデルを呼び出す
  const result = streamText({
    ...model,
    system: SYSTEM_PROMPT,
    messages: prompts,
    providerOptions: model.providerOptions,
    stopWhen: stepCountIs(10),
    tools: {
      getCurrentTime: tool({
        description: "Get the current time",
        inputSchema: z.object({
          timezone: z.string().optional(),
        }),
        execute: async ({ timezone }) => {
          return getCurrentTime(timezone);
        },
      }),
    },
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
        if (msg.id === newMessageId) {
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
          } else if (part.type === "tool-result") {
            return {
              ...msg,
              tools: {
                ...msg.tools,
                content: [
                  ...msg.tools?.content ?? [],
                  {
                    toolCallId: part.toolCallId,
                    toolName: part.toolName,
                    type: part.type,
                    output: {
                      type: "text",
                      value: part.output,
                    },
                  }
                ]
              }
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
