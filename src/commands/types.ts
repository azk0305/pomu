import type React from "react";
import type { Message } from "../types/Message";

export interface CommandContext {
  messagesRef: React.RefObject<Message[]>;
  setMessages: (messages: (prev: Message[]) => Message[]) => void;
  exit: () => void;
  commands: Command[];
}

export interface Command {
  name: string;
  description: string;
  execute: (args: string[], context: CommandContext) => Promise<void> | void;
}
