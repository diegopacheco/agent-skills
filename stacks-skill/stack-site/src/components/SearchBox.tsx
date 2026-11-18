import { useEffect, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

export function SearchBox() {
  const query = useSearch({ strict: false, select: (s) => ("q" in s && typeof s.q === "string" ? s.q : "") });
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== input.current) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <label className="search">
      <input
        ref={input}
        type="search"
        placeholder="Search every stack: logging, http client, unwrap..."
        value={query}
        onChange={(e) => navigate({ to: "/", search: { q: e.target.value }, replace: true })}
      />
      <kbd>/</kbd>
    </label>
  );
}
