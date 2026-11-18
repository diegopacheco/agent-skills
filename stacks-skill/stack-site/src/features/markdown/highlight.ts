export type TokenKind = "plain" | "comment" | "string" | "keyword" | "literal" | "type" | "fn" | "number" | "annotation";

export type Token = { readonly kind: TokenKind; readonly text: string };

type Grammar = {
  readonly comment: string;
  readonly string: string;
  readonly keywords: ReadonlySet<string>;
  readonly literals: ReadonlySet<string>;
};

const words = (list: string) => new Set(list.split(" "));

const C_COMMENT = String.raw`//[^\n]*|/\*[\s\S]*?(?:\*/|$)`;
const HASH_COMMENT = String.raw`#[^\n]*`;
const DOUBLE = String.raw`"(?:\\[\s\S]|[^"\\\n])*"?`;
const SINGLE = String.raw`'(?:\\[\s\S]|[^'\\\n])*'?`;
const CHAR = String.raw`'(?:\\[\s\S][^']*|[^'\\\n])'`;
const TRIPLE = String.raw`"""[\s\S]*?(?:"""|$)`;
const TRIPLE_SINGLE = String.raw`'''[\s\S]*?(?:'''|$)`;
const BACKTICK = String.raw`\x60(?:\\[\s\S]|[^\x60\\])*\x60?`;

const JVM_LITERALS = words("true false null this super");
const TS_KEYWORDS = words(
  "abstract as async await break case catch class const continue declare default delete do else enum export extends finally for from function get if implements import in infer instanceof interface keyof let namespace new of private protected public readonly return satisfies set static switch throw try type typeof var void while yield",
);
const TS_LITERALS = words("true false null undefined this super");

const grammars: Readonly<Record<string, Grammar>> = {
  java: {
    comment: C_COMMENT,
    string: [TRIPLE, DOUBLE, CHAR].join("|"),
    keywords: words(
      "abstract assert break case catch class const continue default do else enum extends final finally for if implements import instanceof interface native new package permits private protected public record return sealed static switch synchronized throw throws transient try var void volatile when while yield boolean byte char double float int long short",
    ),
    literals: JVM_LITERALS,
  },
  kotlin: {
    comment: C_COMMENT,
    string: [TRIPLE, DOUBLE, CHAR].join("|"),
    keywords: words(
      "abstract annotation as break by catch class companion const constructor continue data do else enum external final finally for fun get if import in infix init inline inner interface internal is lateinit object open operator out override package private protected public reified return sealed set suspend throw try typealias val value var vararg when where while",
    ),
    literals: JVM_LITERALS,
  },
  scala: {
    comment: C_COMMENT,
    string: [TRIPLE, DOUBLE, CHAR].join("|"),
    keywords: words(
      "abstract case catch class def derives do else end enum export extends extension final finally for given if implicit import inline lazy match new object opaque override package private protected return sealed then throw trait transparent try type using val var while with yield",
    ),
    literals: words("true false null this super None Nil"),
  },
  rust: {
    comment: C_COMMENT,
    string: [DOUBLE, CHAR].join("|"),
    keywords: words(
      "as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return static struct trait type unsafe use where while",
    ),
    literals: words("true false self Self super None Some Ok Err"),
  },
  go: {
    comment: C_COMMENT,
    string: [DOUBLE, CHAR, BACKTICK].join("|"),
    keywords: words(
      "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var",
    ),
    literals: words("true false nil iota"),
  },
  python: {
    comment: HASH_COMMENT,
    string: [TRIPLE, TRIPLE_SINGLE, DOUBLE, SINGLE].join("|"),
    keywords: words(
      "and as assert async await break case class continue def del elif else except finally for from global if import in is lambda match nonlocal not or pass raise return try type while with yield",
    ),
    literals: words("True False None self cls"),
  },
  ts: { comment: C_COMMENT, string: [DOUBLE, SINGLE, BACKTICK].join("|"), keywords: TS_KEYWORDS, literals: TS_LITERALS },
  bash: {
    comment: String.raw`(?<![\w$\{])#[^\n]*`,
    string: [DOUBLE, SINGLE].join("|"),
    keywords: words("if then else elif fi for while until do done case esac in function return local export source set exit"),
    literals: words("true false"),
  },
};

const aliases: Readonly<Record<string, string>> = {
  tsx: "ts",
  typescript: "ts",
  js: "ts",
  javascript: "ts",
  kt: "kotlin",
  rs: "rust",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
};

const grammarFor = (lang: string): Grammar | undefined => grammars[aliases[lang] ?? lang];

const tokenPattern = (g: Grammar) =>
  new RegExp(
    [
      `(?<comment>${g.comment})`,
      `(?<string>${g.string})`,
      String.raw`(?<annotation>@[A-Za-z_][\w.]*|#!?\[[^\]\n]*\])`,
      String.raw`(?<number>\b(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)[a-zA-Z]*\b)`,
      String.raw`(?<word>\$?[A-Za-z_]\w*!?)`,
      String.raw`(?<other>[\s\S])`,
    ].join("|"),
    "g",
  );

const wordKind = (g: Grammar, word: string, rest: string): TokenKind => {
  if (word.startsWith("$")) return "literal";
  if (g.keywords.has(word)) return "keyword";
  if (g.literals.has(word)) return "literal";
  if (word.endsWith("!")) return "fn";
  if (/^\s*\(/.test(rest)) return "fn";
  if (/^[A-Z]/.test(word)) return "type";
  return "plain";
};

const push = (tokens: Token[], kind: TokenKind, text: string) => {
  const last = tokens.at(-1);
  if (last && last.kind === kind) tokens[tokens.length - 1] = { kind, text: last.text + text };
  else tokens.push({ kind, text });
};

export function highlight(code: string, lang: string): readonly Token[] {
  const g = grammarFor(lang.toLowerCase());
  if (!g || code === "") return code === "" ? [] : [{ kind: "plain", text: code }];
  const tokens: Token[] = [];
  for (const m of code.matchAll(tokenPattern(g))) {
    const groups = m.groups ?? {};
    const text = m[0];
    if (groups.word !== undefined) push(tokens, wordKind(g, text, code.slice(m.index + text.length, m.index + text.length + 3)), text);
    else if (groups.comment !== undefined) push(tokens, "comment", text);
    else if (groups.string !== undefined) push(tokens, "string", text);
    else if (groups.annotation !== undefined) push(tokens, "annotation", text);
    else if (groups.number !== undefined) push(tokens, "number", text);
    else push(tokens, "plain", text);
  }
  return tokens;
}

export function toLines(tokens: readonly Token[]): readonly (readonly Token[])[] {
  const lines: Token[][] = [[]];
  for (const token of tokens) {
    token.text.split("\n").forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part !== "") lines.at(-1)?.push({ kind: token.kind, text: part });
    });
  }
  return lines;
}
