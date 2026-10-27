import hashlib
import json
import os
import sys
import time
from pathlib import Path

DEFAULT_TRACE = Path.home() / ".skill-trace" / "trace.jsonl"


def call_id(event: dict) -> str:
    if event.get("tool_use_id"):
        return event["tool_use_id"]
    payload = json.dumps([event.get("session_id"), event.get("tool_name"), event.get("tool_input")], sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


def record(event: dict, now: float) -> dict:
    tool_input = event.get("tool_input") or {}
    entry = {
        "ts": now,
        "event": event.get("hook_event_name", ""),
        "session": event.get("session_id", ""),
        "tool": event.get("tool_name", ""),
        "id": call_id(event),
    }
    if entry["tool"] == "Skill":
        entry["skill"] = tool_input.get("skill", "")
    if "file_path" in tool_input:
        entry["file"] = tool_input["file_path"]
    if entry["tool"] == "Bash":
        entry["program"] = (tool_input.get("command", "").split() or [""])[0]
    return entry


def main() -> int:
    trace = Path(os.environ.get("SKILL_TRACE_FILE", DEFAULT_TRACE))
    try:
        entry = record(json.loads(sys.stdin.read() or "{}"), time.time())
        trace.parent.mkdir(parents=True, exist_ok=True)
        with trace.open("a") as handle:
            handle.write(json.dumps(entry) + "\n")
    except (OSError, ValueError) as error:
        print(f"skill-trace could not record: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
