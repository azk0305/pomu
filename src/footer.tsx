import type { TextareaRenderable } from "@opentui/core";
import { useRef } from "react";
import type { Message } from "./types/Message";
import { getModel } from "./providers";

import { streamText, type ModelMessage } from "ai";

const SYSTEM_PROMPT =
  "You are a helpful coding assistant. Provide clear and concise answers.";

export const Footer = ({
  messagesRef,
  setMessages,
}: {
  messagesRef: React.RefObject<Message[]>;
  setMessages: (messages: (prev: Message[]) => Message[]) => void;
}) => {
  const textareaRef = useRef<TextareaRenderable>(null);

  return (
    <box width="100%" height={6} backgroundColor="#222222">
      <textarea
        ref={textareaRef}
        width="100%"
        height={6}
        backgroundColor="#222222"
        textColor="white"
        cursorColor="white"
        placeholder="Type a message here..."
        keyBindings={[
          {
            name: "return",
            ctrl: false,
            action: "submit",
          },
        ]}
        onSubmit={async () => {
          // 新しいメッセージの受け口を作成する
          const newMessageId = crypto.randomUUID();
          const userContent = textareaRef.current?.plainText.trim() ?? "";
          if (!userContent) return;

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
              role: "assistant",
            },
            tokens: 0,
          };
          setMessages((prev) => [...prev, newMessage]);

          // テキストエリアを初期化する
          textareaRef.current?.clear();

          // プロンプトを整形する
          const prompts: ModelMessage[] = [
            ...messagesRef.current.flatMap((msg) => [
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
          // const model = getModel("google", "gemma-4-31b-it", {
          //   maxOutputTokens: 65536,
          //   temperature: 1.0,
          //   topP: 0.95,
          //   topK: 64,
          // });
          const model = getModel("lmstudio", "qwen3.5-9b-ud-japanese-imatrix", {
            maxOutputTokens: 32768,
            temperature: 1.0,
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
                messagesRef.current = next;
                return next;
              });
            },
          });

          // ストリームからテキストを取得し、メッセージを更新する
          for await (const textPart of result.textStream) {
            setMessages((prev) => {
              const next = prev.map((msg) => {
                if (msg.id === newMessageId && msg.assistant) {
                  return {
                    ...msg,
                    assistant: {
                      ...msg.assistant,
                      content: msg.assistant.content + textPart,
                    },
                  };
                }
                return msg;
              });
              messagesRef.current = next;
              return next;
            });
          }
        }}
        focused
      />
    </box>
  );
};
