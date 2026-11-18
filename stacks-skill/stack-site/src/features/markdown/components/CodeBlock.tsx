import { useMemo, useState } from "react";
import type { Verdict } from "../types";
import { highlight, toLines } from "../highlight";

type CodeBlockProps = {
  readonly code: string;
  readonly lang: string;
  readonly verdict: Verdict | undefined;
};

export function CodeBlock({ code, lang, verdict }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => toLines(highlight(code, lang)), [code, lang]);
  const copy = () =>
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  return (
    <figure className={`code ${verdict ?? ""}`}>
      <figcaption>
        <span>{lang || "text"}</span>
        <button type="button" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre>
        <code>
          {lines.map((tokens, i) => (
            <span key={i} className="code-line">
              <span className="ln">{i + 1}</span>
              {tokens.map((t, j) => (t.kind === "plain" ? t.text : <span key={j} className={`tk-${t.kind}`}>{t.text}</span>))}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
