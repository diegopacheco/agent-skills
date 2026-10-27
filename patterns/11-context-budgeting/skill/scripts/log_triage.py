import argparse
import json
import re
import sys
from collections import Counter
from collections.abc import Iterable
from dataclasses import dataclass, field
from pathlib import Path

LEVEL = re.compile(r"\b(FATAL|ERROR|WARN(?:ING)?|INFO|DEBUG)\b")
PROBLEM = re.compile(r"\b(FATAL|ERROR|WARN(?:ING)?|Exception|Traceback)\b")
VARIABLE = [
    (re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.IGNORECASE), "<uuid>"),
    (re.compile(r"\b0x[0-9a-f]+\b", re.IGNORECASE), "<hex>"),
    (re.compile(r"\d+(?:\.\d+)*"), "<n>"),
]
EDGE_LINES = 5
LINE_CHARS = 200


@dataclass
class Scan:
    lines: int = 0
    levels: Counter[str] = field(default_factory=Counter)
    groups: Counter[str] = field(default_factory=Counter)
    first_seen: dict[str, int] = field(default_factory=dict)
    head: list[str] = field(default_factory=list)
    tail: list[str] = field(default_factory=list)


def signature(line: str) -> str:
    for pattern, placeholder in VARIABLE:
        line = pattern.sub(placeholder, line)
    return line.strip()[:LINE_CHARS]


def scan(lines: Iterable[str]) -> Scan:
    result = Scan()
    for number, raw in enumerate(lines, start=1):
        line = raw.rstrip("\n")
        result.lines = number
        if len(result.head) < EDGE_LINES:
            result.head.append(line[:LINE_CHARS])
        result.tail = (result.tail + [line[:LINE_CHARS]])[-EDGE_LINES:]
        level = LEVEL.search(line)
        if level:
            result.levels[level.group(1)] += 1
        if PROBLEM.search(line):
            key = signature(line)
            result.groups[key] += 1
            result.first_seen.setdefault(key, number)
    return result


def summarize(result: Scan, budget: int) -> dict[str, object]:
    groups = [{"signature": key, "count": count, "first_line": result.first_seen[key]} for key, count in result.groups.most_common()]
    summary: dict[str, object] = {
        "lines": result.lines,
        "levels": dict(result.levels),
        "groups": groups,
        "groups_omitted": 0,
        "head": result.head,
        "tail": result.tail,
    }
    while len(json.dumps(summary)) > budget and groups:
        groups.pop()
        summary["groups_omitted"] = len(result.groups) - len(groups)
    if len(json.dumps(summary)) > budget:
        raise ValueError(f"budget of {budget} characters cannot hold even the counts, head and tail")
    return summary


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="log_triage")
    parser.add_argument("log", type=Path)
    parser.add_argument("--budget", type=int, default=4000, help="maximum characters of JSON allowed into the context")
    args = parser.parse_args(argv)
    try:
        with args.log.open(errors="replace") as handle:
            summary = summarize(scan(handle), args.budget)
    except (OSError, ValueError) as error:
        print(f"log_triage failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(summary))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
