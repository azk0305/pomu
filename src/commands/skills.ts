import type { Command } from "./types";
import type { Message } from "../types/Message";
import { scanSkills, getActiveSkillsFromHistory } from "../utils/skillManager";

export const skillsCommand: Command = {
  name: "skills",
  description: "List all scanned skills and their activation status",
  execute: async (_args, context) => {
    const scannedSkills = scanSkills(true);
    const activeSkills = getActiveSkillsFromHistory(context.messagesRef.current ?? [], scannedSkills);

    let content = "";
    if (scannedSkills.length === 0) {
      content = "No skills found. Place a `SKILL.md` file in `./.pomu/skills/<name>/` or `~/.pomu/skills/<name>/` to define a skill.";
    } else {
      content = "Available Skills:\n";
      for (const skill of scannedSkills) {
        const isActive = activeSkills.some((s) => s.name === skill.name);
        const status = isActive ? "[Active]" : "[Inactive]";
        content += `\n- **${skill.name}** ${status}\n  Description: ${skill.description}\n  Path: ${skill.location}\n`;
      }
    }

    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: "/skills",
    };

    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content,
    };

    context.setMessages((prev) => {
      const next = [...prev, userMessage, assistantMessage];
      if (context.messagesRef.current) {
        context.messagesRef.current = next;
      }
      return next;
    });
  },
};
