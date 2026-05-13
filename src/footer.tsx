import type { TextareaRenderable } from "@opentui/core";
import { useRef } from "react";
import type { Message } from "./types/Message";
import { sendMessage } from "./actions/sendMessage";
import { handleCommand } from "./commands";

// 画面下部に表示するUserメッセージ用のテキストエリア
export const Footer = ({
  messagesRef,
  setMessages,
  onExit,
}: {
  messagesRef: React.RefObject<Message[]>;
  setMessages: (messages: (prev: Message[]) => Message[]) => void;
  onExit: () => void;
}) => {
  const textareaRef = useRef<TextareaRenderable>(null);
  const cwd = useRef<string>(process.cwd());
  return (
    <box width="100%" height={7}>
      <box>
        <text fg="#aaaaaa">cwd: {cwd.current}</text>
      </box>
      <box height={6} backgroundColor="#222222">
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

            // スラッシュコマンドの処理
            if (userContent.startsWith("/")) {
              const handled = await handleCommand(userContent, {
                messagesRef,
                setMessages,
                exit: onExit,
              });

              // コマンドが見つかったらコマンドを実行する
              if (handled) return;
            }

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
    </box>
  );
};
