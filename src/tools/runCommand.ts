// spawnを使って任意のコマンドを実行
import { spawn } from "bun";

export const runCommandTool = async (
  command: string,
  args: string[],
): Promise<any> => {
  const run_command = [command, ...args];

  const proc = spawn(run_command);

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
      value: `Command failed with exit code ${exitCode}:\n${errorOutput}`,
    };
  }
};

if (process.argv[1] === __filename) {
  const command = process.argv[2] ?? "";
  const args = process.argv.slice(3);
  if (!command) {
    console.error("Usage: bun src/tools/runCommand.ts <command> [args]");
    process.exit(1);
  }

  console.log(await runCommandTool(command, args));
}
