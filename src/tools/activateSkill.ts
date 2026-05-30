// Skillをアクティベートする
import { scanSkills } from "../utils/skillManager";

export const activateSkillTool = async (name: string): Promise<any> => {
  const scannedSkills = scanSkills();
  const skill = scannedSkills.find((s) => s.name === name);
  if (!skill) {
    return {
      type: "text",
      value: `Error: Skill "${name}" not found. Available skills: ${scannedSkills.map((s) => s.name).join(", ")}`,
    };
  }
  return {
    type: "text",
    value: `<skill name="${skill.name}">\n${skill.content}\n</skill>`,
  };
};

if (process.argv[1] === __filename) {
  const name = process.argv[2] ?? "";
  activateSkillTool(name).then(console.log);
}
