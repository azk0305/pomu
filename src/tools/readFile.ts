// ファイル本文を読み込み（行指定・行番号付き・1000行制限）
import { file } from "bun";

const MAX_LINES = 1000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const readFileTool = async (
  filename: string = "notfound.txt",
  startLine: number = 1,
  endLine?: number,
): Promise<any> => {
  const content = file(filename);
  const isFileExists = await content.exists();

  // ファイルが存在するか確認
  if (!isFileExists) {
    return {
      type: "error",
      value: `File not found: ${filename}`,
    };
  }

  // ファイルサイズチェック
  if (content.size > MAX_FILE_SIZE) {
    return {
      type: "error",
      value: `File is too large (${(content.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 5MB.`,
    };
  }

  try {
    const text = await content.text();
    const allLines = text.split(/\r?\n/);
    const totalLines = allLines.length;

    // 1-based index を 0-based に変換
    const startIdx = Math.max(0, startLine - 1);
    const endIdx = endLine ? Math.min(totalLines, endLine) : totalLines;

    let lines = allLines.slice(startIdx, endIdx);
    let isTruncated = false;

    if (lines.length > MAX_LINES) {
      lines = lines.slice(0, MAX_LINES);
      isTruncated = true;
    }

    // 行番号を付与して結合
    const formattedLines = lines.map((line, index) => {
      const currentLineNumber = startIdx + index + 1;
      return `${currentLineNumber.toString().padStart(4, " ")} | ${line}`;
    });

    let resultValue = formattedLines.join("\n");

    if (isTruncated) {
      resultValue += `\n\n... (Truncated: reached 1000 lines limit. Use start_line/end_line to read other parts)`;
    }

    return {
      type: "text",
      value: resultValue,
    };
  } catch (error) {
    return {
      type: "error",
      value: `Failed to read file as text. It might be a binary file.`,
    };
  }
};

if (process.argv[1] === __filename) {
  const filename = process.argv[2] ?? "notfound.txt";
  const start = process.argv[3] ? parseInt(process.argv[3]) : 1;
  const end = process.argv[4] ? parseInt(process.argv[4]) : undefined;
  console.log(
    JSON.stringify(await readFileTool(filename, start, end), null, 2),
  );
}
