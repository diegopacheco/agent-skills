import json
import os
import subprocess
from collections.abc import Callable
from pathlib import Path

Runner = Callable[[list[str]], str]

TIMEOUT_SECONDS = 120


def command_environment(command: str) -> dict[str, str]:
    environment = dict(os.environ)
    home = Path.home()
    paths = [str(Path(command).parent)] if os.sep in command else []
    paths.extend(str(path) for path in [home / ".local" / "bin", home / ".bun" / "bin", Path("/opt/homebrew/bin"), Path("/usr/local/bin")])
    paths.extend(str(path) for path in sorted((home / ".nvm" / "versions" / "node").glob("*/bin"), reverse=True))
    paths.extend(environment.get("PATH", "").split(os.pathsep))
    environment["PATH"] = os.pathsep.join(dict.fromkeys(path for path in paths if path))
    return environment


def process_runner(command: list[str]) -> str:
    result = subprocess.run(
        command,
        stdin=subprocess.DEVNULL,
        capture_output=True,
        text=True,
        check=False,
        timeout=TIMEOUT_SECONDS,
        env=command_environment(command[0]),
    )
    if result.returncode != 0:
        raise RuntimeError(f"Command failed with exit code {result.returncode}: {(result.stderr or result.stdout).strip()}")
    return result.stdout


def json_object(output: str) -> dict[str, object]:
    start = output.find("{")
    end = output.rfind("}")
    if start < 0 or end < start:
        return {}
    try:
        value = json.loads(output[start : end + 1])
    except json.JSONDecodeError:
        return {}
    return value if isinstance(value, dict) else {}


class Agent:
    default_model = ""

    def __init__(self, runner: Runner = process_runner) -> None:
        self._runner = runner

    def call(self, model: str, prompt: str, args: list[str] | None = None) -> str:
        if not model.strip():
            raise ValueError("model is required")
        if not prompt.strip():
            raise ValueError("prompt is required")
        return self._runner(self._command(model, prompt, list(args or [])))

    def _command(self, model: str, prompt: str, args: list[str]) -> list[str]:
        raise NotImplementedError


class ClaudeCodeAgent(Agent):
    default_model = "claude-haiku-5-5"

    def _command(self, model: str, prompt: str, args: list[str]) -> list[str]:
        return ["claude", "-p", "--model", model, *args, prompt]


class CodexAgent(Agent):
    default_model = "gpt-5.6-luna"

    def _command(self, model: str, prompt: str, args: list[str]) -> list[str]:
        return ["codex", "exec", "--skip-git-repo-check", "--model", model, *args, prompt]


PROVIDERS: dict[str, type[Agent]] = {"claude": ClaudeCodeAgent, "codex": CodexAgent}
