import { Link } from "@tanstack/react-router";
import { accentOf, monogramOf } from "../accent";
import type { Stack } from "../types";

type StackCardProps = { readonly stack: Stack };

export function StackCard({ stack }: StackCardProps) {
  return (
    <Link to="/stacks/$stackId" params={{ stackId: stack.id }} className="card" style={{ "--accent": accentOf(stack.id) }}>
      <div className="card-head">
        <span className="monogram">{monogramOf(stack.id)}</span>
        <div>
          <h2>{stack.id}</h2>
          <span className="muted">{stack.title}</span>
        </div>
      </div>
      <ul className="tools">
        {stack.tools.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>
      <div className="card-foot">
        <span>{stack.samples} bad vs good samples</span>
        <span>{stack.lines} lines</span>
      </div>
    </Link>
  );
}
