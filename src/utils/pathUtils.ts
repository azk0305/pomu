import path from "node:path";

/**
 * Checks if the target path is safe (i.e., inside the root directory).
 * This prevents directory traversal attacks like "../../etc/passwd".
 */
export function isSafePath(targetPath: string, rootDir: string = process.cwd()): boolean {
  const absoluteRoot = path.resolve(rootDir);
  const absoluteTarget = path.resolve(rootDir, targetPath);
  return absoluteTarget.startsWith(absoluteRoot);
}
