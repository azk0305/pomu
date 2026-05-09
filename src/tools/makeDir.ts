// ディレクトリの作成
import { mkdir } from "node:fs/promises";

export const makeDirTool = async (dir: string): Promise<any> => {
  await mkdir(dir, { recursive: true });
  return {
    type: "text",
    value: `Directory created: ${dir}`,
  };
};

if (process.argv[1] === __filename) {
  console.log(await makeDirTool(process.argv[2] ?? "."));
}
