import { Link } from "@tanstack/react-router";
import { Markdown } from "../../markdown/components/Markdown";
import { SourceView } from "../../markdown/components/SourceView";
import type { Stack } from "../types";
import { StackNav } from "./StackNav";
import { Toc } from "./Toc";

export type View = "rendered" | "source";

type DocPageProps = {
  readonly stack: Stack;
  readonly view: View;
  readonly from: "/stacks/$stackId" | "/rules";
};

export function DocPage({ stack, view, from }: DocPageProps) {
  return (
    <div className="doc-layout">
      <StackNav />
      <article className="doc">
        <div className="view-toggle">
          <Link from={from} to="." search={{}} className={view === "rendered" ? "on" : ""}>
            Rendered
          </Link>
          <Link from={from} to="." search={{ view: "source" }} className={view === "source" ? "on" : ""}>
            Markdown
          </Link>
        </div>
        {view === "rendered" && stack.doc.frontmatter.description && <p className="lead">{stack.doc.frontmatter.description}</p>}
        {view === "rendered" ? <Markdown doc={stack.doc} /> : <SourceView source={stack.source} />}
      </article>
      {view === "rendered" ? <Toc sections={stack.sections} /> : <aside className="toc" />}
    </div>
  );
}

export function parseView(raw: Record<string, unknown>): { view?: View } {
  return raw.view === "source" ? { view: "source" } : {};
}
