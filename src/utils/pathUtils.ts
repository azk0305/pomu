import path from "node:path";

// ディレクトリトラバーサルを防ぐため指定された場所が安全かを確認する
export function isSafePath(
  targetPath: string,
  rootDir: string = process.cwd(),
): boolean {
  const absoluteRoot = path.resolve(rootDir);
  const absoluteTarget = path.resolve(rootDir, targetPath);
  return absoluteTarget.startsWith(absoluteRoot);
}
