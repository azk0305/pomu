import { TextAttributes } from "@opentui/core";
import type { Message } from "./types/Message";

export const Messages = ({ chatMessages }: { chatMessages: Message[] }) => {
  return (
    <box>
      {chatMessages.map((chatMessage, index) => {
        const displayUserText = `You:\n${chatMessage.user.content}`;
        const displayAssistantText = `Com:\n`;

        return (
          <box key={index}>
            <box>
              <text margin={1} fg={"lime"}>
                {displayUserText}
              </text>
            </box>

            <box>
              <text
                margin={1}
                fg={"white"}
                attributes={
                  chatMessage.assistant?.content
                    ? undefined
                    : TextAttributes.DIM
                }
              >
                {displayAssistantText}
                {chatMessage.assistant?.content || "Thinking..."}
              </text>
            </box>

            <box>
              {chatMessage.tokens > 0 && (
                <text margin={1} fg={"gray"}>
                  {chatMessage.tokens} tokens
                </text>
              )}
            </box>
          </box>
        );
      })}
    </box>
  );
};
