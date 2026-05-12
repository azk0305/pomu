import {
  createCliRenderer,
  TextAttributes,
  ConsolePosition,
} from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useState, useRef } from "react";
import { Footer } from "./footer";
import { Messages } from "./messages";
import type { Message } from "./types/Message";
import { ConfirmDialog } from "./components/ConfirmDialog";

export const App = ({ onExit }: { onExit: () => void }) => {
  // チャットの画面を表示するために使うState
  const [messages, setMessages] = useState<Message[]>([]);

  // メッセージを保持するためのRef
  const messagesRef = useRef<Message[]>([]);

  return (
    <box>
      <scrollbox
        width="100%"
        height="100%"
        stickyScroll={true}
        stickyStart="bottom"
      >
        <box alignItems="center" justifyContent="center" flexGrow={1}>
          <box justifyContent="center" alignItems="center">
            <ascii-font font="tiny" text="pomu" color="yellow" />
            <text attributes={TextAttributes.DIM}>peace.</text>
          </box>
        </box>

        {/* チャットの履歴を表示する */}
        <Messages chatMessages={messages} />
      </scrollbox>

      {/* フッター部分（プロンプト入力用のテキストエリア） */}
      <Footer
        messagesRef={messagesRef}
        setMessages={setMessages}
        onExit={onExit}
      />

      {/* 確認ダイアログ */}
      <ConfirmDialog />
    </box>
  );
};
