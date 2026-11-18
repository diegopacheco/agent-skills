import type { Block, Document } from "../types";
import { CodeBlock } from "./CodeBlock";
import { InlineText } from "./InlineText";

function Heading({ level, text, id }: { readonly level: number; readonly text: string; readonly id: string }) {
  const content = (
    <a href={`#${id}`} className="anchor">
      {text}
    </a>
  );
  switch (level) {
    case 1:
      return <h1 id={id}>{content}</h1>;
    case 2:
      return <h2 id={id}>{content}</h2>;
    case 3:
      return <h3 id={id}>{content}</h3>;
    default:
      return <h4 id={id}>{content}</h4>;
  }
}

function BlockView({ block }: { readonly block: Block }) {
  switch (block.kind) {
    case "heading":
      return <Heading level={block.level} text={block.text} id={block.id} />;
    case "paragraph":
      return (
        <p>
          <InlineText inlines={block.inlines} />
        </p>
      );
    case "verdict":
      return <span className={`verdict ${block.verdict}`}>{block.verdict === "bad" ? "Bad" : "Good"}</span>;
    case "code":
      return <CodeBlock code={block.code} lang={block.lang} verdict={block.verdict} />;
    case "list": {
      const items = block.items.map((item, i) => (
        <li key={i}>
          <InlineText inlines={item} />
        </li>
      ));
      return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case "table":
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {block.header.map((cell, i) => (
                  <th key={i}>
                    <InlineText inlines={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>
                      <InlineText inlines={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default: {
      const unreachable: never = block;
      return unreachable;
    }
  }
}

type MarkdownProps = { readonly doc: Document };

export function Markdown({ doc }: MarkdownProps) {
  return (
    <div className="markdown">
      {doc.blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
