// ファイルへの書き込み
import { file, write } from "bun";
import { isSafePath } from "../utils/pathUtils";

export const writeFileTool = async (filename: string, content: string): Promise<any> => {
  if (!isSafePath(filename)) {
    return {
      type: "error",
      value: `Access denied: ${filename} is outside the workspace.`,
    };
  }

  try {
    const target_file = file(filename);
    const writer = target_file.writer({ highWaterMark: 1024 * 1024 });

    writer.write(content);
    await writer.end();
  } catch (error) {
    return {
      type: "error",
      value: `Failed to write file: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  return {
    type: "text",
    value: `File written: ${filename}`,
  };
};

if (process.argv[1] === __filename) {
  const filename = process.argv[2] ?? "";
  const content = process.argv[3] ?? "";

  if (!filename || !content) {
    console.error("Usage: bun src/tools/writeFile.ts <filename> <content>");
    process.exit(1);
  }

  console.log(await writeFileTool(filename, content));
}
