import { createWriterAgent } from "./writerAgent.js";
import { createEditorAgent } from "./editorAgent.js";

export const subagents: Record<string, any> = {
  writer_agent: createWriterAgent("plamo_nonthink"),
  editor_agent: createEditorAgent("plamo_think"),
};
