export type Inline =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "code"; readonly text: string }
  | { readonly kind: "strong"; readonly text: string }
  | { readonly kind: "link"; readonly text: string; readonly href: string };

export type Verdict = "bad" | "good";

export type Block =
  | { readonly kind: "heading"; readonly level: number; readonly text: string; readonly id: string }
  | { readonly kind: "paragraph"; readonly inlines: readonly Inline[] }
  | { readonly kind: "verdict"; readonly verdict: Verdict }
  | { readonly kind: "code"; readonly lang: string; readonly code: string; readonly verdict: Verdict | undefined }
  | { readonly kind: "list"; readonly ordered: boolean; readonly items: readonly (readonly Inline[])[] }
  | { readonly kind: "table"; readonly header: readonly (readonly Inline[])[]; readonly rows: readonly (readonly (readonly Inline[])[])[] };

export type Document = {
  readonly frontmatter: Readonly<Record<string, string>>;
  readonly blocks: readonly Block[];
};
