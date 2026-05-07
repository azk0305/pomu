import { TextAttributes } from "@opentui/core";
import type {
  Message,
  UserMessage,
  AssistantMessage,
  ToolMessage,
} from "./types/Message";

const UserMessageView = ({ message }: { message: UserMessage }) => (
  <box>
    <text margin={1} fg={"lime"}>
      {`You:\n\n${message.content}`}
    </text>
  </box>
);

const AssistantMessageView = ({ message }: { message: AssistantMessage }) => (
  <box>
    <text marginX={1} marginTop={1} fg={"white"}>
      {`Com:`}
    </text>

    {message.reasoning && (
      <text margin={1} fg={"gray"} attributes={TextAttributes.DIM}>
        {`Thinking:\n${message.reasoning}`}
      </text>
    )}

    {message.toolCalls?.map((tool, index) => (
      <text key={index} margin={1} fg={"cyan"} attributes={TextAttributes.DIM}>
        {`Tool Call: ${tool.toolName}(${JSON.stringify(tool.input)})`}
      </text>
    ))}

    <text
      margin={1}
      fg={"white"}
      attributes={message.content ? undefined : TextAttributes.DIM}
    >
      {message.content || (message.reasoning ? "Responding..." : "Thinking...")}
    </text>

    {message.tokens !== undefined && message.tokens > 0 && (
      <text margin={1} fg={"gray"}>
        {message.tokens} tokens
      </text>
    )}
  </box>
);

const ToolMessageView = ({ message }: { message: ToolMessage }) => (
  <box>
    {message.content.map((tool, index) => (
      <text key={index} margin={1} fg={"cyan"} attributes={TextAttributes.DIM}>
        {`Tool Result: ${tool.toolName} -> ${JSON.stringify(tool.output)}`}
      </text>
    ))}
  </box>
);

export const Messages = ({ chatMessages }: { chatMessages: Message[] }) => {
  return (
    <box>
      {chatMessages.map((msg) => {
        switch (msg.role) {
          case "user":
            return <UserMessageView key={msg.id} message={msg} />;
          case "assistant":
            return <AssistantMessageView key={msg.id} message={msg} />;
          case "tool":
            return <ToolMessageView key={msg.id} message={msg} />;
          default:
            return null;
        }
      })}
    </box>
  );
};
