import { runSubagent } from "../utils/subagentLauncher";

/**
 * サブエージェントを呼び出すツール
 * @param agentName エージェント名 (gemini, claude, codex, pomu 等)
 * @param prompt エージェントに渡すプロンプト
 */
export const invokeAgentTool = async (
  agentName: string,
  prompt: string,
): Promise<any> => {
  const result = await runSubagent(agentName, prompt);
  return {
    type: "text",
    value: result.output,
  };
};

