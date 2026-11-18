import { buildCatalog, toStack } from "./catalog";

const stackFiles = import.meta.glob<string>("../../../../stacks/*.md", { query: "?raw", import: "default", eager: true });
const skillFiles = import.meta.glob<string>("../../../../SKILL.md", { query: "?raw", import: "default", eager: true });

export const stacks = buildCatalog(stackFiles);

export const skill = toStack("skill", Object.values(skillFiles)[0] ?? "");

export function findStack(id: string) {
  return stacks.find((s) => s.id === id);
}
