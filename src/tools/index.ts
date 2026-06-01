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
import { invokeAgentTool } from "./invokeAgent";
import { activateSkillTool } from "./activateSkill";


// エラーハンドリングラッパー：ツールの実行中に発生した例外をキャッチして、エラー結果オブジェクトを返す
const safeExecute = <I, O>(
  name: string,
  fn: (input: I) => Promise<O> | O,
) => {
  return async (input: I) => {
    try {
      return await fn(input);
    } catch (error: any) {
      return {
        type: "error",
        value: `Error executing tool '${name}': ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  };
};

// AIツールの集合
export const tools = {
  get_current_time: tool({
    description: "Get the current date and time in the specified locale",
    inputSchema: z.object({
      locale: z.string().optional(),
    }),
    execute: safeExecute("get_current_time", async ({ locale }: { locale?: string }) => {
      return getCurrentTime(locale);
    }),
  }),
  list_files: tool({
    description: "Get a list of files in the specified directory",
    inputSchema: z.object({
      dir: z.string().default("."),
    }),
    execute: safeExecute("list_files", async ({ dir }: { dir: string }) => {
      return listFilesTool(dir);
    }),
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
    execute: safeExecute("grep_files", async ({
      keyword,
      dir,
      glob,
    }: {
      keyword: string;
      dir?: string;
      glob?: string;
    }) => {
      return grepFilesTool(keyword, dir, glob);
    }),
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
    execute: safeExecute("read_file", async ({
      filename,
      start_line,
      end_line,
    }: {
      filename: string;
      start_line: number;
      end_line?: number;
    }) => {
      return readFileTool(filename, start_line, end_line);
    }),
  }),
  make_dir: tool({
    description: "Create a new directory",
    inputSchema: z.object({
      dir: z.string().describe("The path to the directory to create"),
    }),
    execute: safeExecute("make_dir", async ({ dir }: { dir: string }) => {
      // const confirmed = await confirmStore.ask(`Create directory: ${dir}?`);
      // if (!confirmed) {
      //   return { type: "text", value: "Directory creation cancelled by user." };
      // }
      return makeDirTool(dir);
    }),
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
    execute: safeExecute("edit_file", async ({
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
    }),
  }),
  write_file: tool({
    description: "Write content to a file",
    inputSchema: z.object({
      filename: z.string().describe("The path to the file to write to"),
      content: z.string().describe("The content to write to the file"),
    }),
    execute: safeExecute("write_file", async ({
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
    }),
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
    execute: safeExecute("run_command", async ({ command, args }: { command: string; args: string[] }) => {
      const confirmed = await confirmStore.ask(`Run command: ${command}?`);
      if (!confirmed) {
        return { type: "text", value: "Command execution cancelled by user." };
      }
      return runCommandTool(command, args);
    }),
  }),
  invoke_agent: tool({
    description:
      "Delegate a task to a specialized sub-agent (gemini, claude, codex, or pomu). The sub-agent runs in a separate process.",
    inputSchema: z.object({
      agent_name: z
        .string()
        .describe("The name of the agent to invoke (e.g., 'gemini', 'pomu')"),
      prompt: z.string().describe("The prompt or task to delegate"),
    }),
    execute: safeExecute("invoke_agent", async ({
      agent_name,
      prompt,
    }: {
      agent_name: string;
      prompt: string;
    }) => {
      const confirmed = await confirmStore.ask(
        `Invoke sub-agent: ${agent_name}?`,
      );
      if (!confirmed) {
        return { type: "text", value: "Agent invocation cancelled by user." };
      }
      return invokeAgentTool(agent_name, prompt);
    }),
  }),
  activate_skill: tool({
    description:
      "Activate an available skill to load its instructions/rules into the session. Use this tool if the skill is relevant to the task.",
    inputSchema: z.object({
      name: z
        .string()
        .describe("The name of the skill to activate (e.g., 'git-helper')"),
    }),
    execute: safeExecute("activate_skill", async ({ name }: { name: string }) => {
      return activateSkillTool(name);
    }),
  }),
};
