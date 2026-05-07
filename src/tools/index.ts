import { tool } from "ai";
import { z } from "zod";
import { getCurrentTime } from "./getCurrentTime";

export const tools = {
  get_current_time: tool({
    description: "Get the current date and time in the specified locale",
    inputSchema: z.object({
      locale: z.string().optional(),
    }),
    execute: async ({ locale }) => {
      return getCurrentTime(locale);
    },
  }),
};
