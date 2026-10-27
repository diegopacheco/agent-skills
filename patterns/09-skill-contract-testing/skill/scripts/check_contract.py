import re
import sys

TYPES = ("feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert")
HEADER = re.compile(rf"^(?P<type>{'|'.join(TYPES)})(\((?P<scope>[a-z0-9-]+)\))?(?P<bang>!)?: (?P<subject>.+)$")
MAX_HEADER = 72
MAX_BODY_LINE = 100


def violations(message: str) -> list[str]:
    lines = message.strip("\n").split("\n")
    header = lines[0]
    match = HEADER.match(header)
    if not match:
        return [f"header must be '<type>(<scope>): <subject>' with type in {', '.join(TYPES)}"]
    problems: list[str] = []
    subject = match.group("subject")
    if len(header) > MAX_HEADER:
        problems.append(f"header is {len(header)} characters, max {MAX_HEADER}")
    if subject[0].isupper():
        problems.append("subject must start lowercase")
    if subject.endswith("."):
        problems.append("subject must not end with a period")
    if len(lines) > 1 and lines[1] != "":
        problems.append("a blank line must separate header and body")
    problems += [f"body line {i} is longer than {MAX_BODY_LINE}" for i, line in enumerate(lines[2:], 3) if len(line) > MAX_BODY_LINE]
    if match.group("bang") and not any(line.startswith("BREAKING CHANGE: ") for line in lines):
        problems.append("a '!' header needs a 'BREAKING CHANGE: ' footer")
    return problems


def commit_type(message: str) -> str | None:
    match = HEADER.match(message.strip("\n").split("\n")[0])
    return match.group("type") if match else None


def main() -> int:
    problems = violations(sys.stdin.read())
    for problem in problems:
        print(problem, file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
