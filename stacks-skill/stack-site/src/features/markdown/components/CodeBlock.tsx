import { useState } from "react";
import type { Verdict } from "../types";

type CodeBlockProps = {
  readonly code: string;
  readonly lang: string;
  readonly verdict: Verdict | undefined;
};

export function CodeBlock({ code, lang, verdict }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
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
        <code>{code}</code>
      </pre>
    </figure>
  );
}
