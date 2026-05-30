import type { Command, CommandContext } from "./types";
import { exitCommand } from "./exit";
import { helpCommand } from "./help";
import { codexCommand } from "./codex";
import { claudeCommand } from "./claude";
import { geminiCommand } from "./gemini";
import { testConfirmCommand } from "./testConfirm";
import { skillsCommand } from "./skills";

// コマンドの登録と処理
export const commands: Command[] = [
  exitCommand,
  helpCommand,
  codexCommand,
  claudeCommand,
  geminiCommand,
  testConfirmCommand,
  skillsCommand,
];

export async function handleCommand(
  input: string,
  context: Omit<CommandContext, "commands">,
): Promise<boolean> {
  const parts = input.trim().split(/\s+/);
  const commandName = parts[0]?.slice(1).toLowerCase();
  const args = parts.slice(1);

  const command = commands.find((c) => c.name === commandName);

  if (command) {
    await command.execute(args, { ...context, commands });
    return true;
  }

  return false;
}
