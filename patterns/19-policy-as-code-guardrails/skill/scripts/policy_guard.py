import json
import re
import sys
from pathlib import Path, PurePath

DEFAULT_POLICY = Path(__file__).resolve().parent.parent / "policy.json"


def matches_path(path: str, pattern: str) -> bool:
    return PurePath(path).full_match(pattern) or PurePath(path).full_match(pattern.removeprefix("**/"))


def violation(rule: dict, tool: str, tool_input: dict) -> bool:
    if tool not in rule["tools"]:
        return False
    if "deny_command" in rule:
        return re.search(rule["deny_command"], tool_input.get("command", "")) is not None
    path = tool_input.get("file_path", "")
    if not path or not matches_path(path, rule["deny_path"]):
        return False
    return not (rule.get("allow_new_files") and tool == "Write" and not Path(path).exists())


def decide(policy: dict, event: dict) -> tuple[int, str]:
    tool, tool_input = event.get("tool_name", ""), event.get("tool_input") or {}
    broken = [rule for rule in policy["rules"] if violation(rule, tool, tool_input)]
    if not broken:
        return 0, ""
    return 2, "\n".join(f"blocked by policy {rule['id']}: {rule['reason']}" for rule in broken)


def main(argv: list[str]) -> int:
    policy_file = Path(argv[0]) if argv else DEFAULT_POLICY
    try:
        policy = json.loads(policy_file.read_text())
        code, message = decide(policy, json.loads(sys.stdin.read() or "{}"))
    except (OSError, ValueError, KeyError, re.error) as error:
        print(f"blocked: policy-guard cannot evaluate {policy_file}: {error}", file=sys.stderr)
        return 2
    if message:
        print(message, file=sys.stderr)
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
