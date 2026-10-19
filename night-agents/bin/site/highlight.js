(function (root) {
  const C_LIKE = ["js", "mjs", "cjs", "jsx", "ts", "tsx", "java", "kt", "kts", "scala", "go", "rs", "c", "h", "cpp", "hpp", "cs", "swift", "php", "dart", "css", "scss", "less", "groovy", "gradle", "zig"];
  const HASH = ["py", "rb", "sh", "bash", "zsh", "yaml", "yml", "toml", "properties", "ini", "conf", "env", "r", "pl", "makefile", "containerfile", "dockerfile", "gitignore"];
  const MARKUP = ["html", "htm", "xml", "svg", "vue", "svelte"];

  const KEYWORDS = new Set(
    (
      "abstract as async await break case catch class const continue def default defer del delete do elif else enum export extends " +
      "false final finally fn for from func function go if impl implements import in instanceof interface is lambda let loop match " +
      "mod module mut new nil none not null object of or and override package pass private protected pub public raise return self " +
      "static struct super switch this throw throws trait true try type typeof use val var void when where while with yield " +
      "select insert update delete into values create table index on primary key references join left right inner outer group by " +
      "order limit offset having distinct union alter drop not exists unique default integer text real boolean varchar"
    ).split(" ")
  );

  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function span(cls, text) {
    return `<span class="tk-${cls}">${escapeHtml(text)}</span>`;
  }

  function languageOf(file) {
    const base = file.split("/").pop().toLowerCase();
    if (base === "makefile" || base === "containerfile" || base === "dockerfile") return "hash";
    const ext = base.includes(".") ? base.split(".").pop() : "";
    if (ext === "json" || ext === "lock") return "json";
    if (ext === "md" || ext === "markdown") return "md";
    if (ext === "sql") return "sql";
    if (MARKUP.includes(ext)) return "markup";
    if (C_LIKE.includes(ext)) return "c";
    if (HASH.includes(ext)) return "hash";
    return "plain";
  }

  function rules(lang) {
    if (lang === "c") return { line: "//", open: "/*", close: "*/", quotes: "\"'`" };
    if (lang === "hash") return { line: "#", open: null, close: null, quotes: "\"'" };
    if (lang === "sql") return { line: "--", open: "/*", close: "*/", quotes: "\"'" };
    if (lang === "markup") return { line: null, open: "<!--", close: "-->", quotes: "\"'" };
    if (lang === "json") return { line: null, open: null, close: null, quotes: "\"" };
    return null;
  }

  function markdownLine(line) {
    if (/^\s*#{1,6}\s/.test(line)) return span("heading", line);
    if (/^\s*```/.test(line)) return span("comment", line);
    return escapeHtml(line).replace(/`([^`]+)`/g, '<span class="tk-string">`$1`</span>');
  }

  function codeLine(line, r, state, lang) {
    let out = "";
    let i = 0;
    while (i < line.length) {
      if (state.block) {
        const end = line.indexOf(r.close, i);
        const stop = end === -1 ? line.length : end + r.close.length;
        out += span("comment", line.slice(i, stop));
        i = stop;
        if (end !== -1) state.block = false;
        continue;
      }
      const rest = line.slice(i);
      if (r.line && rest.startsWith(r.line)) {
        out += span("comment", rest);
        break;
      }
      if (r.open && rest.startsWith(r.open)) {
        state.block = true;
        out += span("comment", r.open);
        i += r.open.length;
        continue;
      }
      const ch = line[i];
      if (r.quotes.includes(ch)) {
        let j = i + 1;
        while (j < line.length && line[j] !== ch) j += line[j] === "\\" ? 2 : 1;
        const text = line.slice(i, Math.min(j + 1, line.length));
        const isKey = lang === "json" && /^\s*:/.test(line.slice(j + 1));
        out += span(isKey ? "attr" : "string", text);
        i += text.length;
        continue;
      }
      if (lang === "markup" && ch === "<") {
        const tag = /^<\/?[\w:-]+/.exec(rest);
        if (tag) {
          out += span("keyword", tag[0]);
          i += tag[0].length;
          continue;
        }
      }
      const number = /^\d[\w.]*/.exec(rest);
      if (number && !/[\w$]/.test(line[i - 1] || "")) {
        out += span("number", number[0]);
        i += number[0].length;
        continue;
      }
      const word = /^[A-Za-z_$][\w$-]*/.exec(rest);
      if (word) {
        const text = lang === "markup" ? word[0] : word[0].replace(/-.*$/, "");
        const next = line.slice(i + text.length).trimStart()[0];
        if (lang === "markup") out += next === "=" ? span("attr", text) : escapeHtml(text);
        else if (KEYWORDS.has(lang === "sql" ? text.toLowerCase() : text)) out += span("keyword", text);
        else if (next === "(") out += span("function", text);
        else if (/^[A-Z][a-z0-9]/.test(text) && lang !== "json") out += span("type", text);
        else out += escapeHtml(text);
        i += text.length;
        continue;
      }
      out += escapeHtml(ch);
      i++;
    }
    return out;
  }

  function highlightLines(text, file) {
    const lang = languageOf(file || "");
    const lines = text.split("\n");
    if (lang === "md") return lines.map(markdownLine);
    const r = rules(lang);
    if (!r) return lines.map(escapeHtml);
    const state = { block: false };
    return lines.map((line) => codeLine(line, r, state, lang));
  }

  const api = { highlightLines, languageOf, escapeHtml };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NightHighlight = api;
})(typeof window !== "undefined" ? window : globalThis);
