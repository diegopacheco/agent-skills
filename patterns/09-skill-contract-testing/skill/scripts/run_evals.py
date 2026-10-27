import argparse
import json
import subprocess
import sys
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from check_contract import commit_type, violations

SKILL_DIR = Path(__file__).resolve().parent.parent
TIMEOUT_SECONDS = 120

Runner = Callable[[list[str]], str]

COMMANDS: dict[str, Callable[[str, str], list[str]]] = {
    "claude": lambda model, prompt: ["claude", "-p", "--model", model, prompt],
    "codex": lambda model, prompt: ["codex", "exec", "--skip-git-repo-check", "--model", model, prompt],
}
DEFAULT_MODELS = {"claude": "claude-haiku-5-5", "codex": "gpt-5.6-luna"}


@dataclass(frozen=True)
class Result:
    name: str
    problems: list[str]
    message: str


def process_runner(command: list[str]) -> str:
    proc = subprocess.run(command, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=TIMEOUT_SECONDS)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or f"exit {proc.returncode}")
    return proc.stdout


def prompt_for(change: str) -> str:
    skill = (SKILL_DIR / "SKILL.md").read_text()
    return f"Follow this skill. Reply with only the commit message, nothing else.\n\n{skill}\n\nChange:\n{change}"


def run_case(case: dict[str, str], runner: Runner, provider: str, model: str) -> Result:
    message = runner(COMMANDS[provider](model, prompt_for(case["change"]))).strip().strip("`").strip()
    problems = violations(message)
    if commit_type(message) != case["expect_type"]:
        problems.append(f"expected type {case['expect_type']}, got {commit_type(message)}")
    return Result(case["name"], problems, message)


def main(argv: list[str], runner: Runner = process_runner) -> int:
    parser = argparse.ArgumentParser(prog="run_evals")
    parser.add_argument("--provider", choices=sorted(COMMANDS), default="claude")
    parser.add_argument("--model")
    args = parser.parse_args(argv)
    model = args.model or DEFAULT_MODELS[args.provider]
    cases = json.loads((SKILL_DIR / "evals" / "behavior.json").read_text())
    results = [run_case(case, runner, args.provider, model) for case in cases]
    for result in results:
        print(f"{'PASS' if not result.problems else 'FAIL'} {result.name}: {result.message.splitlines()[0] if result.message else ''}")
        for problem in result.problems:
            print(f"     {problem}")
    failed = sum(1 for r in results if r.problems)
    print(f"{len(results) - failed}/{len(results)} cases passed with {args.provider} {model}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
