import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { highlight, toLines, type TokenKind } from "./highlight";
import { parseMarkdown } from "./parse";

const kindOf = (code: string, lang: string, text: string): TokenKind | undefined =>
  highlight(code, lang).find((t) => t.text === text)?.kind;

describe("highlight", () => {
  test("every code sample in the stacks keeps its exact text so Copy and the rendered view never differ", () => {
    const dir = new URL("../../../../stacks/", import.meta.url);
    const codes = readdirSync(dir).flatMap((f) =>
      parseMarkdown(readFileSync(new URL(f, dir), "utf8")).blocks.flatMap((b) => (b.kind === "code" ? [b] : [])),
    );
    expect(codes.length).toBeGreaterThan(200);
    for (const c of codes) expect(highlight(c.code, c.lang).map((t) => t.text).join("")).toBe(c.code);
  });

  test("every language used by the stacks gets real colors, not a plain fallback", () => {
    const samples: Record<string, string> = {
      java: "public class A {}",
      kotlin: "fun a() {}",
      scala: "def a = 1",
      rust: "fn a() {}",
      go: "func a() {}",
      python: "def a(): pass",
      ts: "const a = 1",
      tsx: "const a = <B />",
      bash: "if true; then echo; fi",
    };
    for (const [lang, code] of Object.entries(samples)) {
      expect(highlight(code, lang).some((t) => t.kind === "keyword")).toBe(true);
    }
  });

  test("keywords inside comments and strings stay comment and string so samples are not miscolored", () => {
    expect(highlight("// return null", "java")).toEqual([{ kind: "comment", text: "// return null" }]);
    expect(highlight('"if // not a comment"', "go")).toEqual([{ kind: "string", text: '"if // not a comment"' }]);
    expect(kindOf("x = 1  # def", "python", "# def")).toBe("comment");
  });

  test("python and bash use # for comments while ts private fields are not comments", () => {
    expect(kindOf("echo $# ok", "bash", "# ok")).toBeUndefined();
    expect(kindOf("this.#secret", "ts", "#secret")).toBeUndefined();
  });

  test("calls, types, annotations and numbers each get their own color", () => {
    const tokens = highlight("@Test void run(User u) { retry(3); }", "java");
    const kinds = Object.fromEntries(tokens.map((t) => [t.text, t.kind]));
    expect(kinds["@Test"]).toBe("annotation");
    expect(kinds["User"]).toBe("type");
    expect(kinds["retry"]).toBe("fn");
    expect(kinds["3"]).toBe("number");
    expect(kindOf('println!("hi")', "rust", "println!")).toBe("fn");
    expect(kindOf("#[derive(Debug)]", "rust", "#[derive(Debug)]")).toBe("annotation");
  });

  test("rust lifetimes are not mistaken for an unterminated char string", () => {
    expect(highlight("fn a<'a>(x: &'a str) {}", "rust").some((t) => t.kind === "string")).toBe(false);
  });

  test("unknown languages render as plain text instead of guessing", () => {
    expect(highlight("# title", "md")).toEqual([{ kind: "plain", text: "# title" }]);
  });
});

describe("toLines", () => {
  test("a block comment spanning lines keeps its color on every line so line numbers line up", () => {
    const lines = toLines(highlight("/* a\nb */\nx", "ts"));
    expect(lines).toHaveLength(3);
    expect(lines[0]).toEqual([{ kind: "comment", text: "/* a" }]);
    expect(lines[1]).toEqual([{ kind: "comment", text: "b */" }]);
  });
});
