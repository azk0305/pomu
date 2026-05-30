import { streamText, stepCountIs } from "ai";
import { model } from "../config/model";
import { tools } from "../tools";
import { SYSTEM_PROMPT } from "../config/systemPrompt";
import { getDynamicSystemPrompt } from "../utils/skillManager";

// Headlessモードを実行
export async function runHeadless(prompt: string) {
  const initialMessages = [
    { id: crypto.randomUUID(), role: "user" as const, content: prompt },
  ];
  const result = streamText({
    ...model,
    system: getDynamicSystemPrompt(SYSTEM_PROMPT, initialMessages),
    messages: initialMessages,
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
        // Reasoningの表示の実装については後日検討（DIMスタイルでの表示など）するため一旦非表示
        // 下記は表示する場合の一例
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
