// ファイル一覧を取得
import { readdir } from "node:fs/promises";

export const listFilesTool = async (dir: string = "."): Promise<any> => {
  // node_modules や .git を除外するフィルタリングを追加
  const allFiles = await readdir(dir, { recursive: true });
  const files = allFiles.filter(f => !f.includes('node_modules') && !f.includes('.git'));

  return {
    type: "json",
    value: JSON.stringify(files),
  };
};

if (process.argv[1] === __filename) {
  console.log(await listFilesTool(process.argv[2] ?? "."));
}
