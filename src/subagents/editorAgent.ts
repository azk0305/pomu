import { ToolLoopAgent, tool } from "ai";
import { models } from "../models/models.js";
import { WRITING_RULES } from "../prompts/writingRules.js";

export const createEditorAgent = (model_name: string): ToolLoopAgent => {
  return new ToolLoopAgent({
    ...models[model_name as keyof typeof models],
    instructions: WRITING_RULES,
    telemetry: {
      functionId: "editor-agent",
    },
  });
};
