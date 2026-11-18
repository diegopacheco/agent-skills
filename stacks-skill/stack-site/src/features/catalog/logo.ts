const logos = import.meta.glob<string>("../../assets/logos/*.svg", { query: "?url", import: "default", eager: true });

export function logoOf(id: string): string | undefined {
  return logos[`../../assets/logos/${id}.svg`];
}
