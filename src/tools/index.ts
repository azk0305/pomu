import { tool } from "ai";
import { z } from "zod";
import { getCurrentTime } from "./getCurrentTime";
import { listFilesTool } from "./listFiles";

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
};
