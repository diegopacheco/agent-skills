import { plainText } from "../markdown/inline";
import { parseMarkdown } from "../markdown/parse";
import type { Block } from "../markdown/types";
import type { Section, Stack } from "./types";

function fileId(path: string): string {
  return path.split("/").at(-1)?.replace(/\.md$/, "") ?? path;
}

function sectionBlocks(blocks: readonly Block[], title: string): readonly Block[] {
  const start = blocks.findIndex((b) => b.kind === "heading" && b.level === 2 && b.text.toLowerCase() === title);
  if (start < 0) return [];
  const end = blocks.findIndex((b, i) => i > start && b.kind === "heading" && b.level <= 2);
  return blocks.slice(start + 1, end < 0 ? undefined : end);
}

export function toStack(id: string, source: string): Stack {
  const doc = parseMarkdown(source);
  const sections: Section[] = doc.blocks.flatMap((b) =>
    b.kind === "heading" && b.level >= 2 && b.level <= 3 ? [{ id: b.id, title: b.text, level: b.level }] : [],
  );
  const h1 = doc.blocks.find((b) => b.kind === "heading" && b.level === 1);
  const tools = sectionBlocks(doc.blocks, "stack").flatMap((b) => (b.kind === "list" ? b.items.map(plainText) : []));
  const samples = sectionBlocks(doc.blocks, "bad vs good").filter((b) => b.kind === "heading" && b.level === 3).length;
  return {
    id,
    title: h1?.kind === "heading" ? h1.text : id,
    source,
    doc,
    tools,
    sections,
    samples,
    lines: source.split("\n").length,
  };
}

export function buildCatalog(files: Readonly<Record<string, string>>): readonly Stack[] {
  return Object.entries(files)
    .map(([path, source]) => toStack(fileId(path), source))
    .sort((a, b) => a.id.localeCompare(b.id));
}
