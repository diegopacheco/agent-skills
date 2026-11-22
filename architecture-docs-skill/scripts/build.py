import datetime
import json
import os
import re
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import loc

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, "template", "site.html")
LOGOS = os.path.join(ROOT, "template", "logos.json")
STATUSES = {"present", "partial", "missing", "n/a"}
KINDS = {"actor", "edge", "core", "data", "external"}
TEST_KINDS = ["Unit", "Integration", "Mocks / fakes", "Database", "E2E / UI", "Contract", "Property based", "Stress / load", "Chaos", "CSS / visual", "Fuzz / security"]


class DataError(Exception):
    pass


def read(path):
    with open(path) as f:
        return f.read()


def need(cond, msg):
    if not cond:
        raise DataError(msg)


def between(items, low, high, what):
    need(isinstance(items, list) and low <= len(items) <= high, f"{what}: expected {low}-{high} entries, got {len(items) if isinstance(items, list) else 'none'}")


def short(text, limit, what):
    need(len(text or "") <= limit, f"{what}: \"{text}\" is {len(text)} characters, at most {limit}")


def exists(project, rel, what):
    path = os.path.join(project, rel.split(":")[0])
    need(os.path.exists(path), f"{what}: {rel} does not exist under {project}")


def validate(doc):
    for key in ["project", "path", "tagline", "summary", "stack", "arch", "sequences", "components", "tests"]:
        need(key in doc, f"missing field: {key}")
    project = doc["path"]
    need(os.path.isabs(project) and os.path.isdir(project), f"path must be an absolute directory: {project}")
    between(doc["summary"], 3, 5, "summary")
    need(len(doc["stack"]) > 0, "stack is empty")
    for s in doc["stack"]:
        for key in ["layer", "name", "why"]:
            need(s.get(key), f"stack {s.get('name', '?')}: missing {key}")
    nodes = doc["arch"]["nodes"]
    between(nodes, 6, 12, "arch.nodes")
    ids = {n["id"] for n in nodes}
    need(len(ids) == len(nodes), "arch: node ids must be unique")
    seen = set()
    for n in nodes:
        need(n.get("kind") in KINDS, f"arch node {n['id']}: kind must be one of {sorted(KINDS)}")
        need(isinstance(n.get("col"), (int, float)) and isinstance(n.get("row"), (int, float)), f"arch node {n['id']}: col and row are required")
        need((n["col"], n["row"]) not in seen, f"arch node {n['id']}: another node already sits at col {n['col']} row {n['row']}")
        seen.add((n["col"], n["row"]))
        need(0 <= n["col"] <= 5 and 0 <= n["row"] <= 4, f"arch node {n['id']}: col must be 0-5 and row 0-4")
        short(n["label"], 16, f"arch node {n['id']} label")
        short(n.get("sub", ""), 21, f"arch node {n['id']} sub")
    for a, b, *rest in doc["arch"]["edges"]:
        need(a in ids and b in ids, f"arch edge {a} -> {b}: unknown node")
        short(rest[0] if rest else "", 10, f"arch edge {a} -> {b} label")
    between(doc["sequences"], 3, 5, "sequences")
    for s in doc["sequences"]:
        need(len(s["actors"]) <= 6, f"sequence {s['id']}: at most 6 actors")
        between(s["steps"], 4, 10, f"sequence {s['id']} steps")
        between(s.get("notes", []), 2, 6, f"sequence {s['id']} notes")
        for step in s["steps"]:
            need(isinstance(step, list) and len(step) == 4, f"sequence {s['id']}: every step is [from, to, label, why], got {step}")
            f, t, label, why = step
            short(label, 40, f"sequence {s['id']} step")
            need(why and len(why) <= 400, f"sequence {s['id']} step \"{label}\": why is required, at most 400 characters")
            need(f in s["actors"] and t in s["actors"], f"sequence {s['id']}: step {f} -> {t} uses an actor not in actors")
        for rel in s.get("code", []):
            exists(project, rel, f"sequence {s['id']}")
    between(doc["components"], 5, 7, "components")
    for c in doc["components"]:
        exists(project, c["path"], f"component {c['id']}")
        for key in ["one", "problem", "naive", "instead", "clever", "better", "terms"]:
            need(c.get(key), f"component {c['id']}: missing {key}")
        short(c["one"], 160, f"component {c['id']} one")
        between(c["better"], 1, 3, f"component {c['id']} better")
        between(c["terms"], 3, 6, f"component {c['id']} terms")
        words = set()
        for t in c["terms"]:
            need(isinstance(t, list) and len(t) == 2 and t[0] and t[1], f"component {c['id']}: every term is [word, meaning], got {t}")
            words.add(t[0].lower())
        for text in [c["problem"], c["naive"], c["instead"], c["clever"], *c["better"]]:
            for word in re.findall(r"\[([^\]]+)\]", re.sub(r"`[^`]*`", "", text)):
                need(word.lower() in words, f"component {c['id']}: [{word}] is marked in the text but is not in terms")
    names = [t.get("kind") for t in doc["tests"]["kinds"]]
    need(names[:len(TEST_KINDS)] == TEST_KINDS, f"tests.kinds must start with {TEST_KINDS}, got {names[:len(TEST_KINDS)]}")
    for t in doc["tests"]["kinds"]:
        need(t.get("status") in STATUSES, f"test kind {t.get('kind')}: status must be one of {sorted(STATUSES)}")
        need(isinstance(t.get("count"), int) and t["count"] >= 0, f"test kind {t.get('kind')}: count must be a non-negative integer")
        need(t["status"] not in ("missing", "n/a") or t["count"] == 0, f"test kind {t['kind']}: {t['status']} with count {t['count']}")


def github_url(remote, prefix, branch):
    m = re.match(r"^(?:git@github\.com:|https?://(?:[^@/]+@)?github\.com/|ssh://git@github\.com/)([^/]+)/(.+?)(?:\.git)?/?$", remote.strip())
    if not m:
        return ""
    url = f"https://github.com/{m.group(1)}/{m.group(2)}"
    prefix = prefix.strip().strip("/")
    return f"{url}/tree/{branch}/{prefix}" if prefix else url


def repo_url(project):
    def git(*args):
        return subprocess.run(["git", "-C", project, *args], capture_output=True, text=True, check=True).stdout.strip()
    try:
        remote = git("remote", "get-url", "origin")
        prefix = git("rev-parse", "--show-prefix")
        branch = git("rev-parse", "--abbrev-ref", "HEAD")
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""
    return github_url(remote, prefix, "main" if branch == "HEAD" else branch)


def used_logos(doc):
    keys = {"github"} | {s["logo"] for s in doc["stack"] if s.get("logo")} | {l["logo"] for l in doc["loc"]["langs"] if l["logo"]}
    every = json.loads(read(LOGOS))
    unknown = sorted(k for k in keys if k not in every)
    return {k: every[k] for k in sorted(keys) if k in every}, unknown


def script_json(value):
    return json.dumps(value, ensure_ascii=False).replace("</", "<\\/").replace("<!--", "<\\!--")


def render(doc, logos):
    html = read(TEMPLATE)
    title = doc["project"].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return html.replace("__TITLE__", title).replace("/*__DOC__*/null", script_json(doc)).replace("/*__LOGOS__*/null", script_json(logos))


RUN = """#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$DIR")"
APP="$(basename "$DIR")"
PID_FILE="$ROOT/.server.pid"
PORT_FILE="$ROOT/.server.port"
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  URL="http://127.0.0.1:$(cat "$PORT_FILE")/$APP/"
  echo "already running: $URL"
else
  PORT="${PORT:-8790}"
  while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT + 1)); done
  nohup python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT" >/dev/null 2>&1 &
  echo $! > "$PID_FILE"
  echo "$PORT" > "$PORT_FILE"
  URL="http://127.0.0.1:$PORT/$APP/"
  for _ in $(seq 1 25); do
    lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1 && break
    sleep 0.2
  done
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1 || { echo "server did not start on $PORT" >&2; exit 1; }
  echo "running: $URL"
fi
if command -v open >/dev/null 2>&1; then open "$URL"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"; fi
"""

STOP = """#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$DIR")"
PID_FILE="$ROOT/.server.pid"
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  kill "$(cat "$PID_FILE")"
  echo "stopped"
else
  echo "not running"
fi
rm -f "$PID_FILE" "$ROOT/.server.port"
"""


def apps_index(root):
    apps = []
    for name in sorted(os.listdir(root)):
        data = os.path.join(root, name, "data.json")
        if not os.path.isfile(data) or not os.path.isfile(os.path.join(root, name, "index.html")):
            continue
        try:
            doc = json.loads(read(data))
        except ValueError:
            continue
        if isinstance(doc, dict) and "generated" in doc and "project" in doc:
            apps.append({"dir": name, "project": doc["project"], "path": doc.get("path", ""), "tagline": doc.get("tagline", "")})
    return apps


def write(path, text, mode=0o644):
    with open(path, "w") as f:
        f.write(text)
    os.chmod(path, mode)


def build(data_path, out_dir=None):
    doc = json.loads(read(data_path))
    validate(doc)
    project = doc["path"].rstrip("/")
    doc["path"] = project
    doc["loc"] = loc.count(project, doc.get("loc_exclude", []))
    if "repo" not in doc:
        doc["repo"] = repo_url(project)
    doc["generated"] = datetime.date.today().isoformat()
    logos, unknown = used_logos(doc)
    out_dir = out_dir or os.path.join(os.path.expanduser("~"), "architecture-docs", os.path.basename(project))
    os.makedirs(out_dir, exist_ok=True)
    write(os.path.join(out_dir, "index.html"), render(doc, logos))
    write(os.path.join(out_dir, "data.json"), json.dumps(doc, indent=2, ensure_ascii=False))
    write(os.path.join(out_dir, "run.sh"), RUN, 0o755)
    write(os.path.join(out_dir, "stop.sh"), STOP, 0o755)
    root = os.path.dirname(os.path.abspath(out_dir))
    write(os.path.join(root, "apps.js"), f"window.ADOCS_APPS = {script_json(apps_index(root))};\n")
    return out_dir, unknown


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit("usage: build.py <data.json> [out-dir]")
    try:
        out, unknown = build(sys.argv[1], sys.argv[2] if len(sys.argv) == 3 else None)
    except DataError as e:
        sys.exit(f"invalid data: {e}")
    if unknown:
        print(f"logos not in the set, shown as letters: {', '.join(unknown)}")
    print(f"built {os.path.join(out, 'index.html')}")
    print(f"run:  {os.path.join(out, 'run.sh')}")
    print(f"stop: {os.path.join(out, 'stop.sh')}")
