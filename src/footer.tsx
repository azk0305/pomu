import type { TextareaRenderable } from "@opentui/core";
import { useRef } from "react";
import type { Message } from "./types/Message";
import { sendMessage } from "./actions/sendMessage";
import { handleCommand } from "./commands";

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
  console.log(process.cwd());
  return (
    <box width="100%" height={6} backgroundColor="#222222">
      <text>{process.cwd()}</text>
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

            // // コマンドが見つからない場合
            // const newMessageId = crypto.randomUUID();
            // const newMessage: Message = {
            //   id: newMessageId,
            //   user: {
            //     id: `${newMessageId}-u`,
            //     content: userContent,
            //     role: "user",
            //   },
            //   assistant: {
            //     id: `${newMessageId}-a`,
            //     content: `Command not found: ${userContent.split(/\s+/)[0]}\nType /help to see available commands.`,
            //     role: "assistant",
            //   },
            //   tokens: 0,
            // };
            // setMessages((prev) => {
            //   const next = [...prev, newMessage];
            //   if (messagesRef.current) {
            //     messagesRef.current = next;
            //   }
            //   return next;
            // });
            // return;
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
  );
};
