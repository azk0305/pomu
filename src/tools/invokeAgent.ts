import { spawn } from "bun";

/**
 * サブエージェントを呼び出すツール
 * @param agentName エージェント名 (gemini, claude, codex, pomu 等)
 * @param prompt エージェントに渡すプロンプト
 */
export const invokeAgentTool = async (
  agentName: string,
  prompt: string,
): Promise<any> => {
  let command: string[];

  const name = agentName.toLowerCase();

  switch (name) {
    case "pomu":
      command = ["bun", "run", "src/index.ts", "--yolo", "-p", prompt];
      break;
    case "claude":
      // Claude Code uses --permission-mode bypassPermissions for automation
      command = ["claude", "--permission-mode", "bypassPermissions", "-p", prompt];
      break;
    case "codex":
      // Codex uses 'exec' subcommand and --yolo
      command = ["codex", "exec", "--yolo", prompt];
      break;
    case "gemini":
      // Gemini CLI uses --yolo and -p
      command = ["gemini", "--yolo", "-p", prompt];
      break;
    default:
      // Default fallback (trying to be generic)
      command = [agentName, "--yolo", "-p", prompt];
      break;
  }

  const proc = spawn(command);

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode === 0) {
    return {
      type: "text",
      value: stdout.trim(),
    };
  } else {
    const errorOutput = stderr.trim() || stdout.trim() || "No output provided.";
    return {
      type: "text",
      value: `Agent '${agentName}' failed with exit code ${exitCode}:\n${errorOutput}`,
    };
  }
};
