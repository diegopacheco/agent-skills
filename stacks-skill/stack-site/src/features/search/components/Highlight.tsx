type HighlightProps = { readonly text: string; readonly terms: readonly string[] };

function escape(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function Highlight({ text, terms }: HighlightProps) {
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map(escape).join("|")})`, "gi");
  return text.split(pattern).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>));
}
