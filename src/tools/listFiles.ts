// ファイル一覧を取得
import { readdir } from "node:fs/promises";

export const listFilesTool = async (dir: string = "."): Promise<any> => {
  const files = await readdir(dir, { recursive: true });
  return {
    type: "json",
    value: JSON.stringify(files),
  };
};

if (process.argv[1] === __filename) {
  console.log(await listFilesTool(process.argv[2] ?? "."));
}
