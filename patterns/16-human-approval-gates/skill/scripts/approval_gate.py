import hashlib
import json
import re
import sys
import time
from pathlib import Path

APPROVALS = ".approvals"
TTL_SECONDS = 900
GUARDED = re.compile(r"(^|[\s;&|/])(deploy\.sh\s+prod\b|kubectl\s.*--context[ =]prod\b|terraform\s+apply\b)")
FILE_TOOLS = {"Write", "Edit", "MultiEdit", "NotebookEdit"}
APPROVE_HINT = 'python3 "$HOME/.claude/skills/prod-deploy/scripts/approve.py"'


def ticket_name(command: str) -> str:
    return hashlib.sha256(command.strip().encode()).hexdigest()


def decide(event: dict, now: float) -> tuple[int, str]:
    tool = event.get("tool_name", "")
    tool_input = event.get("tool_input", {})
    if tool in FILE_TOOLS and APPROVALS in Path(tool_input.get("file_path", "")).parts:
        return 2, "blocked: approvals are written by a human, never by the agent"
    if tool != "Bash":
        return 0, ""
    command = tool_input.get("command", "")
    if APPROVALS in command or "approve.py" in command:
        return 2, "blocked: approvals are written by a human, never by the agent"
    if not GUARDED.search(command):
        return 0, ""
    ticket = Path(event.get("cwd", ".")) / APPROVALS / ticket_name(command)
    if not ticket.is_file():
        return 2, f"blocked: `{command}` needs human approval. Ask the user to run in their own terminal, in this folder:\n{APPROVE_HINT} '{command}'"
    age = now - ticket.stat().st_mtime
    ticket.unlink()
    if age > TTL_SECONDS:
        return 2, f"blocked: the approval for `{command}` expired after {TTL_SECONDS // 60} minutes, ask for a new one"
    return 0, f"approved once: {command}"


def main() -> int:
    code, message = decide(json.loads(sys.stdin.read() or "{}"), time.time())
    if message:
        print(message, file=sys.stderr)
    return code


if __name__ == "__main__":
    sys.exit(main())
