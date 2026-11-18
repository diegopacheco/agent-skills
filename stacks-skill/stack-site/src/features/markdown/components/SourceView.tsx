type SourceViewProps = { readonly source: string };

export function SourceView({ source }: SourceViewProps) {
  return (
    <pre className="source">
      {source.split("\n").map((line, i) => (
        <span key={i} className="source-line">
          <span className="ln">{i + 1}</span>
          {line}
          {"\n"}
        </span>
      ))}
    </pre>
  );
}
