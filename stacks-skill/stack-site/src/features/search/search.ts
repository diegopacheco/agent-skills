import { plainText } from "../markdown/inline";
import type { Block } from "../markdown/types";
import type { Stack } from "../catalog/types";

export type Hit = {
  readonly stackId: string;
  readonly sectionId: string;
  readonly sectionTitle: string;
  readonly snippet: string;
  readonly score: number;
};

type Chunk = { readonly stackId: string; readonly sectionId: string; readonly title: string; readonly text: string };

const SNIPPET_RADIUS = 70;

function blockText(block: Block): string {
  switch (block.kind) {
    case "heading":
      return block.text;
    case "paragraph":
      return plainText(block.inlines);
    case "verdict":
      return "";
    case "code":
      return block.code;
    case "list":
      return block.items.map(plainText).join(" ");
    case "table":
      return [block.header, ...block.rows].map((row) => row.map(plainText).join(" ")).join(" ");
    default: {
      const unreachable: never = block;
      return unreachable;
    }
  }
}

export function chunk(stack: Stack): readonly Chunk[] {
  const chunks: Chunk[] = [];
  let sectionId = "";
  let title = stack.title;
  let text: string[] = [];
  const flush = () => {
    if (text.some((t) => t !== "")) chunks.push({ stackId: stack.id, sectionId, title, text: text.join("\n") });
  };
  for (const block of stack.doc.blocks) {
    if (block.kind === "heading" && block.level >= 2 && block.level <= 3) {
      flush();
      sectionId = block.id;
      title = block.text;
      text = [];
    } else {
      text.push(blockText(block));
    }
  }
  flush();
  return chunks;
}

export function terms(query: string): readonly string[] {
  return query.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
}

function count(haystack: string, needle: string): number {
  let n = 0;
  let at = haystack.indexOf(needle);
  while (at >= 0) {
    n++;
    at = haystack.indexOf(needle, at + needle.length);
  }
  return n;
}

function snippet(text: string, term: string): string {
  const flat = text.replace(/\s+/g, " ");
  const at = flat.toLowerCase().indexOf(term);
  const start = Math.max(0, at - SNIPPET_RADIUS);
  const end = Math.min(flat.length, at + term.length + SNIPPET_RADIUS);
  return `${start > 0 ? "..." : ""}${flat.slice(start, end)}${end < flat.length ? "..." : ""}`;
}

export function search(stacks: readonly Stack[], query: string): readonly Hit[] {
  const wanted = terms(query);
  if (wanted.length === 0) return [];
  return stacks
    .flatMap(chunk)
    .flatMap((c) => {
      const title = c.title.toLowerCase();
      const text = c.text.toLowerCase();
      if (!wanted.every((t) => text.includes(t) || title.includes(t) || c.stackId === t)) return [];
      const score = wanted.reduce((s, t) => s + count(text, t) + (title.includes(t) ? 10 : 0) + (c.stackId === t ? 5 : 0), 0);
      const first = wanted.find((t) => text.includes(t)) ?? wanted[0] ?? "";
      return [{ stackId: c.stackId, sectionId: c.sectionId, sectionTitle: c.title, snippet: snippet(c.text, first), score }];
    })
    .sort((a, b) => b.score - a.score);
}
