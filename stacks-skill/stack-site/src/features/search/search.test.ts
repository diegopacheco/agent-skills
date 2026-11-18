import { describe, expect, test } from "bun:test";
import { buildCatalog } from "../catalog/catalog";
import { search } from "./search";

const stacks = buildCatalog({
  "go.md": "# go stack\n\n## Stack\n* Go 1.26\n\n## Logging\nUse slog for logs.\n\n## Errors\nWrap errors with context.\n",
  "rust.md": "# rust stack\n\n## Stack\n* Rust 1.99\n\n## Logging\nUse tracing for logs, tracing everywhere.\n",
});

describe("search", () => {
  test("an empty query returns nothing instead of the whole catalog", () => {
    expect(search(stacks, "   ")).toEqual([]);
  });

  test("every term must match so multi word queries narrow results", () => {
    const hits = search(stacks, "logs tracing");
    expect(hits.map((h) => h.stackId)).toEqual(["rust"]);
  });

  test("hits point at the section so the result link scrolls to it", () => {
    const [hit] = search(stacks, "wrap");
    expect(hit).toMatchObject({ stackId: "go", sectionId: "errors", sectionTitle: "Errors" });
  });

  test("a stack name as a term filters to that stack", () => {
    const hits = search(stacks, "go logging");
    expect(hits.map((h) => h.stackId)).toEqual(["go"]);
  });

  test("title matches rank above body matches", () => {
    const hits = search(stacks, "logging");
    expect(hits[0]?.sectionId).toBe("logging");
  });

  test("matching is case insensitive", () => {
    expect(search(stacks, "SLOG")).toHaveLength(1);
  });

  test("snippet shows the text around the match", () => {
    const [hit] = search(stacks, "slog");
    expect(hit?.snippet).toContain("Use slog for logs.");
  });
});

describe("snippet", () => {
  test("snippet is body text only so the title is not shown twice", () => {
    const [hit] = search(stacks, "errors");
    expect(hit?.snippet.startsWith("Errors")).toBe(false);
  });
});
