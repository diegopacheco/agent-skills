const ACCENTS: Readonly<Record<string, string>> = {
  java: "#e76f00",
  scala: "#dc322f",
  kotlin: "#7f52ff",
  ts: "#3178c6",
  nodejs: "#3c873a",
  rust: "#b7410e",
  go: "#00add8",
  python: "#3776ab",
};

export function accentOf(id: string): string {
  return ACCENTS[id] ?? "#475569";
}

export function monogramOf(id: string): string {
  return id.slice(0, 2).toUpperCase();
}
