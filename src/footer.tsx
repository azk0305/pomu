import type { TextareaRenderable } from "@opentui/core";
import { useRef } from "react";
import type { Message } from "./types/Message";
import { sendMessage } from "./actions/sendMessage";

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
          const userContent = textareaRef.current?.plainText.trim() ?? "";
          if (!userContent) return;

          // テキストエリアを初期化する
          textareaRef.current?.clear();

          // LLMへの問い合わせとストリーミングを開始する
          await sendMessage({
            userContent,
            messagesRef,
            setMessages,
          });
        }}
        focused
      />
    </box>
  );
};
