// ファイル本文を検索（grep）
import { spawn } from "bun";

export const grepFilesTool = async (
  keyword: string,
  dir: string = ".",
  glob?: string,
): Promise<any> => {
  const args = ["rg", "-n", "--no-heading", "--with-filename"];

  // グロブのパターンを追加
  if (glob) {
    args.push("-g", glob);
  }

  args.push(keyword);
  args.push(dir);

  const proc = spawn(args);

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode === 0) {
    return {
      type: "text",
      value: stdout.trim(),
    };
  } else {
    const errorOutput = stderr.trim() || stdout.trim() || "No matches found.";
    return {
      type: "text",
      value: `Ripgrep failed with exit code ${exitCode}:\n${errorOutput}`,
    };
  }
};

if (process.argv[1] === __filename) {
  const keyword = process.argv[2];
  const dir = process.argv[3] ?? ".";
  const glob = process.argv[4];

  if (!keyword) {
    console.error("Usage: bun src/tools/grepFiles.ts <keyword> [dir] [glob]");
    process.exit(1);
  }

  try {
    const result = await grepFilesTool(keyword, dir, glob);
    console.log(result.value);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}
