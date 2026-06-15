import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { Message } from "../types/Message";

export interface Skill {
  name: string;
  description: string;
  location: string;
  content: string;
}

/**
 * Markdownファイル内から frontmatter を抽出する
 * （`---` と `---` で挟まれている部分）
 */
export function parseSkillContent(
  fileContent: string,
): { metadata: Record<string, string>; content: string } | null {
  const normalized = fileContent.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return null;
  }
  const endMarkerIndex = normalized.indexOf("\n---\n", 4);
  if (endMarkerIndex === -1) {
    return null;
  }
  const yamlText = normalized.slice(4, endMarkerIndex);
  const content = normalized.slice(endMarkerIndex + 5).trim();

  const metadata: Record<string, string> = {};
  const lines = yamlText.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const val = line.slice(colonIndex + 1).trim();
      metadata[key] = val.replace(/^["']|["']$/g, "");
    }
  }

  return { metadata, content };
}

/**
 * 指定されれたファイルパスからSkillをロードする
 */
function loadSkillFile(filePath: string): Skill | null {
  try {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const parsed = parseSkillContent(rawContent);
    if (!parsed || !parsed.metadata.name || !parsed.metadata.description) {
      return null;
    }
    return {
      name: parsed.metadata.name,
      description: parsed.metadata.description,
      location: path.resolve(filePath),
      content: parsed.content,
    };
  } catch (e) {
    console.error(`Error loading skill file at ${filePath}: ${e}`);
    return null;
  }
}

let cachedSkills: Skill[] | null = null;

/**
 * Invalidate the memory cache for scanned skills.
 */
export function clearSkillCache(): void {
  cachedSkills = null;
}

/**
 * `skills` サブディレクトリ内の SKILL.md をスキャンする（ユーザレベル/プロジェクトレベル）
 * 両方に同名のスキルがある場合はプロジェクトレベルのものを優先し、ログに警告を表示する
 */
export function scanSkills(bypassCache = false): Skill[] {
  if (cachedSkills && !bypassCache) {
    return cachedSkills;
  }

  const skillsMap = new Map<string, Skill>();

  // 1. User-level skills (e.g. ~/.pomu/skills/*)
  const userSkillsDir = path.resolve(os.homedir(), ".pomu", "skills");
  if (fs.existsSync(userSkillsDir)) {
    try {
      const subdirs = fs.readdirSync(userSkillsDir, { withFileTypes: true });
      for (const subdir of subdirs) {
        if (subdir.isDirectory()) {
          const skillFilePath = path.join(
            userSkillsDir,
            subdir.name,
            "SKILL.md",
          );
          if (fs.existsSync(skillFilePath)) {
            const skill = loadSkillFile(skillFilePath);
            if (skill) {
              skillsMap.set(skill.name, skill);
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning user-level skills: ${e}`);
    }
  }

  // 2. Project-level skills (e.g. ./.pomu/skills/*)
  const projectSkillsDir = path.resolve(process.cwd(), ".pomu", "skills");
  if (fs.existsSync(projectSkillsDir)) {
    try {
      const subdirs = fs.readdirSync(projectSkillsDir, { withFileTypes: true });
      for (const subdir of subdirs) {
        if (subdir.isDirectory()) {
          const skillFilePath = path.join(
            projectSkillsDir,
            subdir.name,
            "SKILL.md",
          );
          if (fs.existsSync(skillFilePath)) {
            const skill = loadSkillFile(skillFilePath);
            if (skill) {
              if (skillsMap.has(skill.name)) {
                console.warn(
                  `[Pomu Skill Collision] Project-level skill "${skill.name}" overrides user-level skill at "${skillsMap.get(skill.name)?.location}".`,
                );
              }
              skillsMap.set(skill.name, skill);
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning project-level skills: ${e}`);
    }
  }

  cachedSkills = Array.from(skillsMap.values());
  return cachedSkills;
}

/**
 * アクティベートできたSkillをメッセージ履歴から抽出する
 */
export function getActiveSkillsFromHistory(
  messages: Message[],
  scannedSkills: Skill[],
): Skill[] {
  const activeNames = new Set<string>();
  const callIdToSkillName = new Map<string, string>();

  for (const msg of messages) {
    if (msg.role === "assistant" && msg.toolCalls) {
      for (const call of msg.toolCalls) {
        if (
          call.toolName === "activate_skill" &&
          call.input &&
          typeof call.input.name === "string"
        ) {
          callIdToSkillName.set(call.toolCallId, call.input.name);
        }
      }
    }
  }

  for (const msg of messages) {
    if (msg.role === "tool") {
      for (const result of msg.content) {
        if (result.toolName === "activate_skill") {
          const skillName = callIdToSkillName.get(result.toolCallId);
          if (skillName) {
            const outputValue =
              typeof result.output === "object" &&
              result.output !== null &&
              "value" in result.output
                ? (result.output as any).value
                : result.output;
            const isError =
              typeof outputValue === "string" &&
              outputValue.startsWith("Error:");
            if (!isError) {
              activeNames.add(skillName);
            }
          }
        }
      }
    }
  }

  return scannedSkills.filter((s) => activeNames.has(s.name));
}

/**
 * システムプロンプトにSkillの情報を追加する
 */
export function buildSystemPromptCatalog(
  basePrompt: string,
  scannedSkills: Skill[],
): string {
  if (scannedSkills.length === 0) {
    return basePrompt;
  }

  let catalogPrompt = `${basePrompt}\n\n# Available Skills\n\n`;
  catalogPrompt += `You have access to the following skills. If a skill is relevant to the user's request or current tasks, you MUST activate it using the \`activate_skill\` tool before proceeding:\n\n`;
  for (const skill of scannedSkills) {
    catalogPrompt += `- **${skill.name}**: ${skill.description}\n`;
  }
  return catalogPrompt;
}

/**
 * システムプロンプトにSkillの内容を追加する
 */
export function buildSystemPromptWithSkills(
  basePrompt: string,
  activeSkills: Skill[],
): string {
  if (activeSkills.length === 0) {
    return basePrompt;
  }

  let skillPrompt = `${basePrompt}\n\n# Active Skills\n\n`;
  skillPrompt += `The following skills are currently active in this session. You MUST follow their instructions and guidelines strictly:\n\n`;
  for (const skill of activeSkills) {
    skillPrompt += `<skill name="${skill.name}">\n${skill.content}\n</skill>\n\n`;
  }
  return skillPrompt;
}

/**
 * アクティベートされたSkillで構成される動的なシステムプロンプトのエントリーポイント
 */
export function getDynamicSystemPrompt(
  basePrompt: string,
  messages: Message[],
): string {
  const scannedSkills = scanSkills();
  const catalogPrompt = buildSystemPromptCatalog(basePrompt, scannedSkills);
  const activeSkills = getActiveSkillsFromHistory(messages, scannedSkills);
  return buildSystemPromptWithSkills(catalogPrompt, activeSkills);
}
