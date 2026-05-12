import { streamText, stepCountIs } from "ai";
import { model } from "../config/model";
import { tools } from "../tools";
import { SYSTEM_PROMPT } from "../config/systemPrompt";

export async function runHeadless(prompt: string) {
  const result = streamText({
    ...model,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    providerOptions: model.providerOptions,
    stopWhen: stepCountIs(10),
    tools,
  });

  for await (const part of result.fullStream) {
    switch (part.type) {
      case "text-delta":
        process.stdout.write(part.text);
        break;
      case "reasoning-delta":
        // Reasoning can be printed or hidden; let's print it in a dim style if possible
        // but for now, just skip or print as is.
        // process.stdout.write(part.text);
        break;
      case "tool-call":
        process.stdout.write(`\n[Tool Call: ${part.toolName}]\n`);
        break;
      case "tool-result":
        process.stdout.write(`[Tool Result: ${part.toolName}]\n`);
        break;
      case "error":
        process.stderr.write(`\nError: ${part.error}\n`);
        break;
    }
  }

  process.stdout.write("\n");
}
