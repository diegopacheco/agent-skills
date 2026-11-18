import { Link } from "@tanstack/react-router";
import { accentOf } from "../../catalog/accent";
import { stacks } from "../../catalog/source";
import { search, terms } from "../search";
import { Highlight } from "./Highlight";

const LIMIT = 60;

type SearchResultsProps = { readonly query: string };

export function SearchResults({ query }: SearchResultsProps) {
  const hits = search(stacks, query);
  const wanted = terms(query);
  const perStack = stacks.map((s) => ({ id: s.id, count: hits.filter((h) => h.stackId === s.id).length })).filter((s) => s.count > 0);
  return (
    <section className="results">
      <div className="results-head">
        <h2>
          {hits.length} {hits.length === 1 ? "match" : "matches"} for <q>{query}</q>
        </h2>
        <div className="chips">
          {perStack.map((s) => (
            <span key={s.id} className="chip" style={{ "--accent": accentOf(s.id) }}>
              {s.id} {s.count}
            </span>
          ))}
        </div>
      </div>
      {hits.length === 0 && <p className="muted">Nothing found. Try a stack name, a tool or a rule such as logging, http client or immutability.</p>}
      {hits.slice(0, LIMIT).map((hit) => (
        <Link
          key={`${hit.stackId}-${hit.sectionId}`}
          to="/stacks/$stackId"
          params={{ stackId: hit.stackId }}
          hash={hit.sectionId}
          className="hit"
          style={{ "--accent": accentOf(hit.stackId) }}
        >
          <div className="hit-head">
            <span className="chip">{hit.stackId}</span>
            <strong>
              <Highlight text={hit.sectionTitle} terms={wanted} />
            </strong>
          </div>
          <p>
            <Highlight text={hit.snippet} terms={wanted} />
          </p>
        </Link>
      ))}
    </section>
  );
}
