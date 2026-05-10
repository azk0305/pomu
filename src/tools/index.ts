import { tool } from "ai";
import { z } from "zod";
import { confirmStore } from "../utils/confirmStore";
import { getCurrentTime } from "./getCurrentTime";
import { listFilesTool } from "./listFiles";
import { grepFilesTool } from "./grepFiles";
import { readFileTool } from "./readFile";
import { makeDirTool } from "./makeDir";
import { writeFileTool } from "./writeFile";

export const tools = {
  get_current_time: tool({
    description: "Get the current date and time in the specified locale",
    inputSchema: z.object({
      locale: z.string().optional(),
    }),
    execute: async ({ locale }: { locale?: string }) => {
      return getCurrentTime(locale);
    },
  }),
  list_files: tool({
    description: "Get a list of files in the specified directory",
    inputSchema: z.object({
      dir: z.string().default("."),
    }),
    execute: async ({ dir }: { dir: string }) => {
      return listFilesTool(dir);
    },
  }),
  grep_files: tool({
    description: "Search for a keyword in files using ripgrep",
    inputSchema: z.object({
      keyword: z.string().describe("The search term or regular expression"),
      dir: z
        .string()
        .optional()
        .describe("Directory to search in. Defaults to current directory."),
      glob: z
        .string()
        .optional()
        .describe("Glob pattern to filter files (e.g., '*.ts')."),
    }),
    execute: async ({
      keyword,
      dir,
      glob,
    }: {
      keyword: string;
      dir?: string;
      glob?: string;
    }) => {
      return grepFilesTool(keyword, dir, glob);
    },
  }),
  read_file: tool({
    description:
      "Read the content of a file with line numbers. Supports reading specific line ranges.",
    inputSchema: z.object({
      filename: z.string().describe("The path to the file to read"),
      start_line: z
        .number()
        .optional()
        .default(1)
        .describe("1-based start line number"),
      end_line: z
        .number()
        .optional()
        .describe("1-based end line number (inclusive)"),
    }),
    execute: async ({
      filename,
      start_line,
      end_line,
    }: {
      filename: string;
      start_line: number;
      end_line?: number;
    }) => {
      return readFileTool(filename, start_line, end_line);
    },
  }),
  make_dir: tool({
    description: "Create a new directory",
    inputSchema: z.object({
      dir: z.string().describe("The path to the directory to create"),
    }),
    execute: async ({ dir }: { dir: string }) => {
      const confirmed = await confirmStore.ask(`Create directory: ${dir}?`);
      if (!confirmed) {
        return { type: "text", value: "Directory creation cancelled by user." };
      }
      return makeDirTool(dir);
    },
  }),
  write_file: tool({
    description: "Write content to a file",
    inputSchema: z.object({
      filename: z.string().describe("The path to the file to write to"),
      content: z.string().describe("The content to write to the file"),
    }),
    execute: async ({ filename, content }: { filename: string; content: string }) => {
      const confirmed = await confirmStore.ask(`Write to file: ${filename}?`);
      if (!confirmed) {
        return { type: "text", value: "Write operation cancelled by user." };
      }
      return writeFileTool(filename, content);
    },
  }),
};
