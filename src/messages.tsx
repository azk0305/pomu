import { TextAttributes } from "@opentui/core";
import type { Message } from "./types/Message";

export const Messages = ({ chatMessages }: { chatMessages: Message[] }) => {
  return (
    <box>
      {chatMessages.map((chatMessage, index) => {
        const displayUserText = `You:\n\n${chatMessage.user.content}`;
        const displayAssistantName = `Com:`;
        const displayAssistantText = "";

        return (
          <box key={index}>
            <box>
              <text margin={1} fg={"lime"}>
                {displayUserText}
              </text>
            </box>

            <box>
              <text marginX={1} marginTop={1} fg={"white"}>
                {displayAssistantName}
              </text>

              {chatMessage.assistant?.reasoning && (
                <text margin={1} fg={"gray"} attributes={TextAttributes.DIM}>
                  {`Thinking:\n${chatMessage.assistant.reasoning}`}
                </text>
              )}
              {chatMessage.tools?.content.map((tool, toolIndex) => (
                <text key={toolIndex} margin={1} fg={"cyan"} attributes={TextAttributes.DIM}>
                  {`Tool: ${tool.toolName}(${tool.type === "call" ? tool.output.value : "..."}) ${tool.type === "result" ? `-> ${tool.output.value}` : ""
                    }`}
                </text>
              ))}
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
                {chatMessage.assistant?.content ||
                  (chatMessage.assistant?.reasoning
                    ? "Responding..."
                    : "Thinking...")}
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
