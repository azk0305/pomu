import { expect, test, describe } from "bun:test";
import { isSafePath } from "./pathUtils";
import path from "node:path";

describe("isSafePath", () => {
  const rootDir = process.cwd();

  test("should allow relative paths inside the root", () => {
    expect(isSafePath("src/index.tsx", rootDir)).toBe(true);
    expect(isSafePath("./README.md", rootDir)).toBe(true);
  });

  test("should allow absolute paths inside the root", () => {
    const absPath = path.resolve(rootDir, "src/index.tsx");
    expect(isSafePath(absPath, rootDir)).toBe(true);
  });

  test("should deny paths outside the root using ..", () => {
    expect(isSafePath("../outside.txt", rootDir)).toBe(false);
    expect(isSafePath("../../etc/passwd", rootDir)).toBe(false);
  });

  test("should deny absolute paths outside the root", () => {
    const outsidePath = path.resolve(rootDir, "..", "outside.txt");
    expect(isSafePath(outsidePath, rootDir)).toBe(false);
  });

  test("should deny system paths", () => {
    expect(isSafePath("/etc/passwd", rootDir)).toBe(false);
    expect(isSafePath("C:\\Windows\\System32", rootDir)).toBe(false);
  });
});
