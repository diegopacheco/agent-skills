import { parseInline } from "./inline";
import { uniqueSlugger } from "./slug";
import type { Block, Document, Inline, Verdict } from "./types";

const HEADING = /^(#{1,6})\s+(.*)$/;
const FENCE = /^```(\S*)\s*$/;
const LIST_ITEM = /^\s*(?:([*-])|(\d+)\.)\s+(.*)$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_DIVIDER = /^\s*\|[\s|:-]+\|\s*$/;
const VERDICTS: Readonly<Record<string, Verdict>> = { bad: "bad", good: "good" };

export function splitFrontmatter(source: string): { frontmatter: Record<string, string>; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match || match[1] === undefined) return { frontmatter: {}, body: source };
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const at = line.indexOf(":");
    if (at > 0) frontmatter[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return { frontmatter, body: source.slice(match[0].length) };
}

function cells(row: string): readonly (readonly Inline[])[] {
  return row.trim().replace(/^\||\|$/g, "").split("|").map((c) => parseInline(c.trim()));
}

function startsBlock(line: string): boolean {
  return HEADING.test(line) || FENCE.test(line) || LIST_ITEM.test(line) || TABLE_ROW.test(line);
}

export function parseMarkdown(source: string): Document {
  const { frontmatter, body } = splitFrontmatter(source.replace(/\r\n/g, "\n"));
  const lines = body.split("\n");
  const slug = uniqueSlugger();
  const blocks: Block[] = [];
  let verdict: Verdict | undefined;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.trim() === "") {
      i++;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading?.[1] && heading[2] !== undefined) {
      verdict = undefined;
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2].trim(), id: slug(heading[2]) });
      i++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? "")) code.push(lines[i++] ?? "");
      i++;
      blocks.push({ kind: "code", lang: fence[1] ?? "", code: code.join("\n"), verdict });
      continue;
    }

    if (TABLE_ROW.test(line) && TABLE_DIVIDER.test(lines[i + 1] ?? "")) {
      const header = cells(line);
      const rows: (readonly (readonly Inline[])[])[] = [];
      i += 2;
      while (i < lines.length && TABLE_ROW.test(lines[i] ?? "")) rows.push(cells(lines[i++] ?? ""));
      blocks.push({ kind: "table", header, rows });
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      const ordered = item[2] !== undefined;
      const items: (readonly Inline[])[] = [];
      while (i < lines.length) {
        const next = LIST_ITEM.exec(lines[i] ?? "");
        if (!next || (next[2] !== undefined) !== ordered) break;
        items.push(parseInline(next[3] ?? ""));
        i++;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    const text: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() !== "" && !startsBlock(lines[i] ?? "")) text.push((lines[i++] ?? "").trim());
    const joined = text.join(" ");
    const found = VERDICTS[joined.toLowerCase()];
    if (found) {
      verdict = found;
      blocks.push({ kind: "verdict", verdict: found });
    } else {
      blocks.push({ kind: "paragraph", inlines: parseInline(joined) });
    }
  }

  return { frontmatter, blocks };
}
