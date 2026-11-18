import type { Section } from "../types";

type TocProps = { readonly sections: readonly Section[] };

export function Toc({ sections }: TocProps) {
  return (
    <aside className="toc">
      <span className="nav-label">On this page</span>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={s.level === 3 ? "toc-item sub" : "toc-item"}>
          {s.title}
        </a>
      ))}
    </aside>
  );
}
