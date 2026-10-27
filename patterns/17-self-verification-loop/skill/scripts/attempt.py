import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

GREEN, RETRY, STOP, USAGE = 0, 1, 3, 2
TAIL = 30


def load(state: Path, command: str) -> list[dict]:
    if not state.exists():
        return []
    saved = json.loads(state.read_text())
    if saved["command"] != command:
        raise ValueError(f"{state} belongs to `{saved['command']}`, finish or delete it first")
    return saved["attempts"]


def report(path: Path, command: str, attempts: list[dict], why: str, tail: str) -> None:
    rows = "".join(f"| {a['n']} | {a['exit_code']} | {a['output_sha256'][:12]} |\n" for a in attempts)
    path.write_text(
        f"# Not green\n\nCommand: `{command}`\n\nStopped: {why}\n\n| Attempt | Exit code | Output sha256 |\n|---|---|---|\n{rows}\n"
        f"## Last output\n\n```\n{tail}\n```\n"
    )


def run(command: str, limit: int, state: Path, failure_report: Path) -> tuple[int, str]:
    attempts = load(state, command)
    if len(attempts) >= limit:
        return STOP, f"budget spent: {limit} attempts already used, read {failure_report} and stop"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    output = result.stdout + result.stderr
    tail = "\n".join(output.splitlines()[-TAIL:])
    attempt = {"n": len(attempts) + 1, "exit_code": result.returncode, "output_sha256": hashlib.sha256(output.encode()).hexdigest()}
    attempts.append(attempt)
    if result.returncode == 0:
        state.unlink(missing_ok=True)
        return GREEN, f"{tail}\ngreen on attempt {attempt['n']}/{limit}"
    state.write_text(json.dumps({"command": command, "attempts": attempts}))
    if len(attempts) > 1 and attempts[-2]["output_sha256"] == attempt["output_sha256"]:
        why = f"no progress, attempt {attempt['n']} failed exactly like attempt {attempt['n'] - 1}"
    elif attempt["n"] == limit:
        why = f"budget spent, {limit} of {limit} attempts failed"
    else:
        return RETRY, f"{tail}\nattempt {attempt['n']}/{limit} failed, fix the cause and run again"
    report(failure_report, command, attempts, why, tail)
    return STOP, f"{tail}\nstop: {why}, wrote {failure_report}"


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="attempt")
    parser.add_argument("--max", type=int, default=3)
    parser.add_argument("--state", type=Path, default=Path(".fix-until-green.json"))
    parser.add_argument("--report", type=Path, default=Path("fix-until-green-report.md"))
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    words = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not words or args.max < 1:
        print("usage: attempt.py [--max N] -- <test command...>", file=sys.stderr)
        return USAGE
    try:
        code, message = run(" ".join(words), args.max, args.state, args.report)
    except ValueError as error:
        print(f"attempt refused: {error}", file=sys.stderr)
        return USAGE
    print(message)
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
