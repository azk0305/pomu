// 既存のファイルの一部を編集（文字列置換）
import { file, write } from "bun";
import { isSafePath } from "../utils/pathUtils";

export const editFileTool = async (
  filename: string,
  old_string: string,
  new_string: string,
): Promise<any> => {
  if (!isSafePath(filename)) {
    return {
      type: "error",
      value: `Access denied: ${filename} is outside the workspace.`,
    };
  }

  try {
    const target_file = file(filename);
    const exists = await target_file.exists();
    if (!exists) {
      return {
        type: "error",
        value: `File not found: ${filename}`,
      };
    }

    const current_content = await target_file.text();

    // 置換対象の文字列が含まれているかチェック
    if (!current_content.includes(old_string)) {
      return {
        type: "error",
        value: `The string to be replaced (old_string) was not found in the file: ${filename}`,
      };
    }

    // 置換対象の文字列が複数存在しないかチェック
    const occurrences = current_content.split(old_string).length - 1;
    if (occurrences > 1) {
      return {
        type: "error",
        value: `Multiple occurrences of old_string found (${occurrences}). Please provide a more specific old_string to avoid ambiguity.`,
      };
    }

    // 文字列を置換
    const new_content = current_content.replace(old_string, new_string);

    // ファイルを書き込み
    await write(filename, new_content);
  } catch (error) {
    return {
      type: "error",
      value: `Failed to edit file: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  return {
    type: "text",
    value: `File edited successfully: ${filename}`,
  };
};

// 直接実行時のデバッグ用
if (process.argv[1] === __filename) {
  const filename = process.argv[2] ?? "";
  const old_string = process.argv[3] ?? "";
  const new_string = process.argv[4] ?? "";

  if (!filename || !old_string || !new_string) {
    console.error(
      "Usage: bun src/tools/editFile.ts <filename> <old_string> <new_string>",
    );
    process.exit(1);
  }

  console.log(await editFileTool(filename, old_string, new_string));
}
