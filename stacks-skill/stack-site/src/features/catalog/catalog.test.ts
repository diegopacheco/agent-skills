import { describe, expect, test } from "bun:test";
import { buildCatalog } from "./catalog";

const RUST = `# rust stack

## Stack
* Rust 1.99.x
* Tokio

## Idioms
* use Result

## Bad vs Good

### 1. unwrap
Bad
\`\`\`rust
x.unwrap()
\`\`\`

### 2. clone
Good
\`\`\`rust
x
\`\`\`
`;

describe("buildCatalog", () => {
  const rust = buildCatalog({ "../stacks/rust.md": RUST, "../stacks/go.md": "# go stack\n" }).find((s) => s.id === "rust");

  test("stack id comes from the file name so routes match the skill table", () => {
    expect(buildCatalog({ "a/b/rust.md": RUST, "a/b/go.md": "# go\n" }).map((s) => s.id)).toEqual(["go", "rust"]);
  });

  test("tools come only from the Stack section so cards show versions, not idioms", () => {
    expect(rust?.tools).toEqual(["Rust 1.99.x", "Tokio"]);
  });

  test("samples count only the h3 entries under Bad vs Good", () => {
    expect(rust?.samples).toBe(2);
  });

  test("table of contents holds h2 and h3, never the h1 title", () => {
    expect(rust?.sections.map((s) => s.id)).toEqual(["stack", "idioms", "bad-vs-good", "1-unwrap", "2-clone"]);
    expect(rust?.title).toBe("rust stack");
  });

  test("a file without a Stack section has no tools and no samples", () => {
    const go = buildCatalog({ "go.md": "# go stack\n" })[0];
    expect(go?.tools).toEqual([]);
    expect(go?.samples).toBe(0);
  });
});
