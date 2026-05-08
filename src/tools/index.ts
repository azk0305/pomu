import { tool } from "ai";
import { z } from "zod";
import { getCurrentTime } from "./getCurrentTime";
import { listFilesTool } from "./listFiles";
import { grepFilesTool } from "./grepFiles";

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
      dir: z.string().optional().describe("Directory to search in. Defaults to current directory."),
      glob: z.string().optional().describe("Glob pattern to filter files (e.g., '*.ts')."),
    }),
    execute: async ({ keyword, dir, glob }: { keyword: string; dir?: string; glob?: string }) => {
      return grepFilesTool(keyword, dir, glob);
    },
  }),
};
