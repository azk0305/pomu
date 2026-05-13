import { tool } from "ai";
import { z } from "zod";
import { confirmStore } from "../utils/confirmStore";
import { getCurrentTime } from "./getCurrentTime";
import { listFilesTool } from "./listFiles";
import { grepFilesTool } from "./grepFiles";
import { readFileTool } from "./readFile";
import { makeDirTool } from "./makeDir";
import { writeFileTool } from "./writeFile";
import { editFileTool } from "./editFile";
import { runCommandTool } from "./runCommand";

// AIツールの集合
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
      // const confirmed = await confirmStore.ask(`Create directory: ${dir}?`);
      // if (!confirmed) {
      //   return { type: "text", value: "Directory creation cancelled by user." };
      // }
      return makeDirTool(dir);
    },
  }),
  edit_file: tool({
    description:
      "Edit a part of an existing file by replacing a specific string.",
    inputSchema: z.object({
      filename: z.string().describe("The path to the file to edit"),
      old_string: z
        .string()
        .describe(
          "The exact string to be replaced (provide enough context to be unique)",
        ),
      new_string: z.string().describe("The new string to replace with"),
    }),
    execute: async ({
      filename,
      old_string,
      new_string,
    }: {
      filename: string;
      old_string: string;
      new_string: string;
    }) => {
      const confirmed = await confirmStore.ask(`Edit file: ${filename}?`);
      if (!confirmed) {
        return { type: "text", value: "Edit operation cancelled by user." };
      }
      return editFileTool(filename, old_string, new_string);
    },
  }),
  write_file: tool({
    description: "Write content to a file",
    inputSchema: z.object({
      filename: z.string().describe("The path to the file to write to"),
      content: z.string().describe("The content to write to the file"),
    }),
    execute: async ({
      filename,
      content,
    }: {
      filename: string;
      content: string;
    }) => {
      const confirmed = await confirmStore.ask(`Write to file: ${filename}?`);
      if (!confirmed) {
        return { type: "text", value: "Write operation cancelled by user." };
      }
      return writeFileTool(filename, content);
    },
  }),
  run_command: tool({
    description: "Run a shell command",
    inputSchema: z.object({
      command: z.string().describe("The command to run"),
      args: z
        .string()
        .array()
        .describe("Optional arguments to pass to the command"),
    }),
    execute: async ({ command, args }: { command: string; args: string[] }) => {
      const confirmed = await confirmStore.ask(`Run command: ${command}?`);
      if (!confirmed) {
        return { type: "text", value: "Command execution cancelled by user." };
      }
      return runCommandTool(command, args);
    },
  }),
};
