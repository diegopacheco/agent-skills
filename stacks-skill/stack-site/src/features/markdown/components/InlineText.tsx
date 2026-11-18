import { Link } from "@tanstack/react-router";
import type { Inline } from "../types";

const STACK_LINK = /^stacks\/([a-z0-9]+)\.md$/;

function InlineLink({ text, href }: { readonly text: string; readonly href: string }) {
  const stack = STACK_LINK.exec(href)?.[1];
  if (stack) {
    return (
      <Link to="/stacks/$stackId" params={{ stackId: stack }}>
        {text}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {text}
    </a>
  );
}

type InlineTextProps = { readonly inlines: readonly Inline[] };

export function InlineText({ inlines }: InlineTextProps) {
  return inlines.map((inline, i) => {
    switch (inline.kind) {
      case "text":
        return <span key={i}>{inline.text}</span>;
      case "code":
        return <code key={i}>{inline.text}</code>;
      case "strong":
        return <strong key={i}>{inline.text}</strong>;
      case "link":
        return <InlineLink key={i} text={inline.text} href={inline.href} />;
      default: {
        const unreachable: never = inline;
        return unreachable;
      }
    }
  });
}
