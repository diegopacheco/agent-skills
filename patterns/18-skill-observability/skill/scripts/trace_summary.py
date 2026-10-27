import argparse
import json
import sys
from collections import Counter
from pathlib import Path

from trace_hook import DEFAULT_TRACE


def summarize(entries: list[dict]) -> dict:
    started = {e["id"]: e for e in entries if e["event"] == "PreToolUse"}
    durations: dict[str, list[float]] = {}
    for end in (e for e in entries if e["event"] == "PostToolUse" and e["id"] in started):
        durations.setdefault(end["tool"], []).append(end["ts"] - started[end["id"]]["ts"])
    calls = [e for e in entries if e["event"] == "PreToolUse"]
    return {
        "sessions": len({e["session"] for e in entries}),
        "skills": Counter(e["skill"] for e in calls if e.get("skill")),
        "files": sorted({e["file"] for e in calls if e.get("file")}),
        "tools": Counter(e["tool"] for e in calls),
        "unfinished": len(started) - sum(len(v) for v in durations.values()),
        "slowest": sorted(((tool, max(times)) for tool, times in durations.items()), key=lambda pair: -pair[1]),
    }


def render(summary: dict) -> str:
    lines = [f"sessions: {summary['sessions']}", "", "| Skill | Runs |", "|---|---|"]
    lines += [f"| {name} | {count} |" for name, count in summary["skills"].most_common()] or ["| none | 0 |"]
    lines += ["", "| Tool | Calls | Slowest s |", "|---|---|---|"]
    slowest = dict(summary["slowest"])
    lines += [f"| {tool} | {count} | {slowest.get(tool, 0):.2f} |" for tool, count in summary["tools"].most_common()]
    lines += ["", f"files loaded: {len(summary['files'])}", *[f"* {path}" for path in summary["files"]]]
    lines += ["", f"calls with no finish event: {summary['unfinished']}"]
    return "\n".join(lines) + "\n"


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="trace_summary")
    parser.add_argument("trace", type=Path, nargs="?", default=DEFAULT_TRACE)
    parser.add_argument("--session")
    args = parser.parse_args(argv)
    try:
        entries = [json.loads(line) for line in args.trace.read_text().splitlines() if line.strip()]
    except (OSError, ValueError) as error:
        print(f"trace_summary failed: {error}", file=sys.stderr)
        return 1
    if args.session:
        entries = [e for e in entries if e["session"] == args.session]
    print(render(summarize(entries)), end="")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
