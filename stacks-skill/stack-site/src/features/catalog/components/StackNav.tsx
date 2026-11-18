import { Link } from "@tanstack/react-router";
import { accentOf } from "../accent";
import { stacks } from "../source";

export function StackNav() {
  return (
    <nav className="stack-nav">
      <span className="nav-label">Stacks</span>
      {stacks.map((s) => (
        <Link key={s.id} to="/stacks/$stackId" params={{ stackId: s.id }} className="nav-item" activeProps={{ className: "nav-item active" }}>
          <span className="dot" style={{ background: accentOf(s.id) }} />
          {s.id}
        </Link>
      ))}
      <span className="nav-label">Skill</span>
      <Link to="/rules" className="nav-item" activeProps={{ className: "nav-item active" }}>
        <span className="dot" />
        rules and principles
      </Link>
    </nav>
  );
}
