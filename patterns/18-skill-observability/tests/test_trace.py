import json
import os
import subprocess
from pathlib import Path

from trace_hook import record
from trace_summary import render, summarize

HOOK = Path(__file__).resolve().parent.parent / "skill" / "scripts" / "trace_hook.py"


def event(name: str, tool: str, tool_input: dict, use_id: str) -> dict:
    return {"hook_event_name": name, "session_id": "s1", "tool_name": tool, "tool_input": tool_input, "tool_use_id": use_id}


def test_secrets_in_commands_never_reach_the_trace() -> None:
    entry = record(event("PreToolUse", "Bash", {"command": "curl -H 'Authorization: Bearer sk-live-123' api"}, "t1"), 0)
    assert entry["program"] == "curl"
    assert "sk-live-123" not in json.dumps(entry)


def test_summary_shows_skills_files_and_the_slowest_call() -> None:
    entries = [
        record(event("PreToolUse", "Skill", {"skill": "log-triage"}, "a"), 0.0),
        record(event("PostToolUse", "Skill", {"skill": "log-triage"}, "a"), 0.1),
        record(event("PreToolUse", "Read", {"file_path": "/repo/app.log"}, "b"), 1.0),
        record(event("PostToolUse", "Read", {"file_path": "/repo/app.log"}, "b"), 1.5),
        record(event("PreToolUse", "Bash", {"command": "pytest -q"}, "c"), 2.0),
        record(event("PostToolUse", "Bash", {"command": "pytest -q"}, "c"), 9.0),
        record(event("PreToolUse", "Bash", {"command": "rm -rf /"}, "d"), 10.0),
    ]
    summary = summarize(entries)
    assert summary["skills"] == {"log-triage": 1}
    assert summary["files"] == ["/repo/app.log"]
    assert summary["slowest"][0] == ("Bash", 7.0)
    assert summary["unfinished"] == 1
    assert "| Bash | 2 | 7.00 |" in render(summary)


def test_the_hook_appends_one_line_per_event_and_never_blocks(tmp_path: Path) -> None:
    trace = tmp_path / "trace.jsonl"
    env = {**os.environ, "SKILL_TRACE_FILE": str(trace)}
    for name in ("PreToolUse", "PostToolUse"):
        payload = json.dumps(event(name, "Read", {"file_path": "/x"}, "r1"))
        assert subprocess.run(["python3", str(HOOK)], input=payload, text=True, env=env, timeout=30).returncode == 0
    lines = [json.loads(line) for line in trace.read_text().splitlines()]
    assert [line["event"] for line in lines] == ["PreToolUse", "PostToolUse"]


def test_a_broken_trace_file_is_reported_without_blocking_the_tool(tmp_path: Path) -> None:
    env = {**os.environ, "SKILL_TRACE_FILE": str(tmp_path)}
    result = subprocess.run(["python3", str(HOOK)], input="{}", capture_output=True, text=True, env=env, timeout=30)
    assert result.returncode == 1
    assert "could not record" in result.stderr
