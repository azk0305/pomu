import { useSyncExternalStore, useRef } from "react";
import { confirmStore } from "../utils/confirmStore";
import { bold, TextAttributes, type TextareaRenderable } from "@opentui/core";

/**
 * A dialog overlay that asks the user for confirmation (Y/n).
 */
export const ConfirmDialog = () => {
  const request = useSyncExternalStore(
    (l) => confirmStore.subscribe(l),
    () => confirmStore.getSnapshot(),
  );
  const textareaRef = useRef<TextareaRenderable>(null);

  if (!request) return null;

  return (
    <box
      position="absolute"
      top="30%"
      left="10%"
      width="80%"
      height={10}
      backgroundColor="#333333"
      borderStyle="rounded"
      borderColor="yellow"
      flexDirection="column"
    >
      <box flexGrow={1} padding={1} flexDirection="column">
        <text fg="yellow" attributes={TextAttributes.BOLD}>
          ⚠️ Action Confirmation Required
        </text>
        <box height={1} />
        <text>{request.message}</text>
      </box>

      <box
        height={3}
        flexDirection="row"
        alignItems="center"
        paddingX={1}
        backgroundColor="#444444"
      >
        <text>Confirm? [y/N]: </text>
        <textarea
          ref={textareaRef}
          width={10}
          height={1}
          focused={true}
          backgroundColor="#222222"
          keyBindings={[
            {
              name: "return",
              ctrl: false,
              action: "submit",
            },
          ]}
          onSubmit={() => {
            const input =
              textareaRef.current?.plainText.trim().toLowerCase() || "n";
            textareaRef.current?.clear();
            const confirmed = input === "y" || input === "yes";
            request.resolve(confirmed);
          }}
        />
        <text fg="#888888"> (Press Enter to submit)</text>
      </box>
    </box>
  );
};
