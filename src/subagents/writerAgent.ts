import { ToolLoopAgent, tool } from "ai";
import { models } from "../models/models.js";
import { WRITING_GUIDELINES } from "../prompts/writingGuidelines.js";

export const createWriterAgent = (model_name: string): ToolLoopAgent => {
  return new ToolLoopAgent({
    ...models[model_name as keyof typeof models],
    instructions: WRITING_GUIDELINES,
    telemetry: {
      functionId: "writer-agent",
    },
  });
};
