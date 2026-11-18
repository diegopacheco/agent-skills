import { describe, expect, test } from "bun:test";
import { parseMarkdown } from "./parse";
import { parseInline } from "./inline";

describe("parseMarkdown", () => {
  test("code after a Bad or Good label carries that verdict so the site can color wrong and right samples", () => {
    const doc = parseMarkdown("### 1. any\nBad\n```ts\nlet a: any;\n```\nGood\n```ts\nlet a: number;\n```\n```ts\nlet b = 1;\n```\n");
    const codes = doc.blocks.filter((b) => b.kind === "code");
    expect(codes.map((c) => c.verdict)).toEqual(["bad", "good", "good"]);
  });

  test("a new heading resets the verdict so plain snippets are never shown as bad or good", () => {
    const doc = parseMarkdown("Bad\n```ts\nx\n```\n## Next\n```ts\ny\n```\n");
    const last = doc.blocks.at(-1);
    expect(last?.kind === "code" && last.verdict).toBeUndefined();
  });

  test("duplicate headings get unique ids so table of contents links land on the right section", () => {
    const doc = parseMarkdown("## Stack\n## Stack\n");
    const ids = doc.blocks.flatMap((b) => (b.kind === "heading" ? [b.id] : []));
    expect(ids).toEqual(["stack", "stack-1"]);
  });

  test("code fences keep markdown-looking lines as code instead of parsing them", () => {
    const doc = parseMarkdown("```md\n# not a heading\n* not a list\n```\n");
    expect(doc.blocks).toEqual([{ kind: "code", lang: "md", code: "# not a heading\n* not a list", verdict: undefined }]);
  });

  test("tables become header plus rows", () => {
    const doc = parseMarkdown("| Stack | File |\n|---|---|\n| `java` | [j](stacks/java.md) |\n");
    const table = doc.blocks[0];
    expect(table?.kind).toBe("table");
    if (table?.kind !== "table") return;
    expect(table.rows[0]?.[1]).toEqual([{ kind: "link", text: "j", href: "stacks/java.md" }]);
  });

  test("frontmatter is split out so the skill header never renders as text", () => {
    const doc = parseMarkdown("---\nname: stacks-skill\ndescription: a: b\n---\n# Title\n");
    expect(doc.frontmatter).toEqual({ name: "stacks-skill", description: "a: b" });
    expect(doc.blocks).toHaveLength(1);
  });

  test("bullet and ordered lists are kept apart", () => {
    const doc = parseMarkdown("* a\n* b\n1. c\n");
    expect(doc.blocks.map((b) => b.kind === "list" && b.ordered)).toEqual([false, true]);
  });
});

describe("parseInline", () => {
  test("mixes text, code, strong and links in order", () => {
    expect(parseInline("use `bun` and **never** [npm](x)")).toEqual([
      { kind: "text", text: "use " },
      { kind: "code", text: "bun" },
      { kind: "text", text: " and " },
      { kind: "strong", text: "never" },
      { kind: "text", text: " " },
      { kind: "link", text: "npm", href: "x" },
    ]);
  });
});
