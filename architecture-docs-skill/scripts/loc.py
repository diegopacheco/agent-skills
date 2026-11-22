import fnmatch
import json
import os
import subprocess
import sys

LANGS = {
    "rs": ("Rust", "rust"), "ts": ("TypeScript", "typescript"), "tsx": ("TypeScript", "typescript"),
    "mts": ("TypeScript", "typescript"), "cts": ("TypeScript", "typescript"),
    "js": ("JavaScript", "javascript"), "jsx": ("JavaScript", "javascript"), "mjs": ("JavaScript", "javascript"),
    "cjs": ("JavaScript", "javascript"), "py": ("Python", "python"), "java": ("Java", "openjdk"),
    "kt": ("Kotlin", "kotlin"), "kts": ("Kotlin", "kotlin"), "scala": ("Scala", "scala"), "sc": ("Scala", "scala"),
    "go": ("Go", "go"), "rb": ("Ruby", "ruby"), "php": ("PHP", "php"), "cs": ("C#", "dotnet"),
    "c": ("C", "c"), "h": ("C", "c"), "cpp": ("C++", "cplusplus"), "cc": ("C++", "cplusplus"),
    "cxx": ("C++", "cplusplus"), "hpp": ("C++", "cplusplus"), "swift": ("Swift", "swift"), "dart": ("Dart", "dart"),
    "ex": ("Elixir", "elixir"), "exs": ("Elixir", "elixir"), "erl": ("Erlang", "erlang"), "hs": ("Haskell", "haskell"),
    "clj": ("Clojure", "clojure"), "cljs": ("Clojure", "clojure"), "cljc": ("Clojure", "clojure"),
    "ml": ("OCaml", "ocaml"), "lua": ("Lua", "lua"), "zig": ("Zig", "zig"), "nim": ("Nim", "nim"),
    "jl": ("Julia", "julia"), "r": ("R", "r"), "pl": ("Perl", "perl"),
    "sh": ("Shell", "gnubash"), "bash": ("Shell", "gnubash"), "zsh": ("Shell", "gnubash"),
    "css": ("CSS", "css"), "scss": ("Sass", "sass"), "sass": ("Sass", "sass"), "less": ("Less", "less"),
    "html": ("HTML", "html5"), "htm": ("HTML", "html5"), "vue": ("Vue", "vuedotjs"), "svelte": ("Svelte", "svelte"),
    "astro": ("Astro", "astro"), "sql": ("SQL", ""), "toml": ("TOML", "toml"), "yaml": ("YAML", "yaml"),
    "yml": ("YAML", "yaml"), "gradle": ("Gradle", "gradle"), "tf": ("Terraform", "terraform"),
    "proto": ("Protobuf", ""), "graphql": ("GraphQL", "graphql"), "gql": ("GraphQL", "graphql"),
}
NAMES = {"Containerfile": ("Containerfile", "podman"), "Dockerfile": ("Dockerfile", "docker"), "Makefile": ("Make", "")}
DOCS = {"md", "mdx"}
SKIP_DIRS = {".git", "node_modules", "target", "dist", "build", "out", ".next", ".venv", "venv", "__pycache__", "vendor", ".gradle", ".idea", "coverage", "test-results"}
MAX_BYTES = 2_000_000


def tracked_files(root):
    try:
        out = subprocess.run(["git", "-C", root, "ls-files", "-z"], capture_output=True, check=True).stdout
        return [f for f in out.decode().split("\0") if f], True
    except (subprocess.CalledProcessError, FileNotFoundError):
        files = []
        for base, dirs, names in os.walk(root):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            files += [os.path.relpath(os.path.join(base, n), root) for n in names]
        return files, False


def language(rel):
    name = os.path.basename(rel)
    if name in NAMES:
        return NAMES[name]
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext in DOCS:
        return ("docs", "")
    return LANGS.get(ext)


def count_lines(path):
    try:
        if os.path.getsize(path) > MAX_BYTES:
            return None
        with open(path, "rb") as f:
            data = f.read()
    except OSError:
        return None
    if b"\0" in data:
        return None
    return sum(1 for line in data.decode("utf-8", "replace").splitlines() if line.strip())


def excluded(rel, exclude):
    return any(rel == e.rstrip("/") or rel.startswith(e.rstrip("/") + "/") or fnmatch.fnmatch(rel, e) for e in exclude)


def count(root, exclude=()):
    files, from_git = tracked_files(root)
    langs, docs = {}, 0
    for rel in files:
        if excluded(rel, exclude):
            continue
        lang = language(rel)
        if not lang:
            continue
        lines = count_lines(os.path.join(root, rel))
        if lines is None:
            continue
        if lang[0] == "docs":
            docs += lines
            continue
        entry = langs.setdefault(lang[0], {"name": lang[0], "logo": lang[1], "lines": 0, "files": 0})
        entry["lines"] += lines
        entry["files"] += 1
    source = "files tracked by git" if from_git else "files on disk (no git, build and dependency folders skipped)"
    skipped = f" Excluded as generated or copies: {', '.join(exclude)}." if exclude else ""
    note = f"Non-blank lines in {source}. Images, lock files, JSON and SVG are not counted.{skipped}"
    return {"note": note, "docs": docs, "langs": sorted(langs.values(), key=lambda l: -l["lines"])}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: loc.py <project-dir>")
    print(json.dumps(count(os.path.abspath(sys.argv[1])), indent=2))
