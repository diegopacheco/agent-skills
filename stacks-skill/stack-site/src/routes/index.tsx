import { createFileRoute } from "@tanstack/react-router";
import { StackCard } from "../features/catalog/components/StackCard";
import { stacks } from "../features/catalog/source";
import { SearchResults } from "../features/search/components/SearchResults";

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>): { q?: string } => (typeof raw.q === "string" && raw.q !== "" ? { q: raw.q } : {}),
  component: CatalogPage,
});

function CatalogPage() {
  const { q } = Route.useSearch();
  if (q && q.trim() !== "") return <SearchResults query={q} />;
  const samples = stacks.reduce((sum, s) => sum + s.samples, 0);
  return (
    <section className="catalog">
      <div className="hero">
        <h1>Pick a stack</h1>
        <p>
          {stacks.length} stacks with fixed versions, idioms, principles and {samples} bad vs good samples. Read them rendered, read the raw
          markdown, or search across all of them.
        </p>
      </div>
      <div className="grid">
        {stacks.map((s) => (
          <StackCard key={s.id} stack={s} />
        ))}
      </div>
    </section>
  );
}
