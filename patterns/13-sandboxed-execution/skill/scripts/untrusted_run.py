import argparse
import subprocess
import sys
from pathlib import Path

IMAGE = "docker.io/library/python:3.15-alpine"
TIMED_OUT = 124


def refuse_reason(workdir: Path, home: Path) -> str | None:
    if not workdir.is_dir():
        return f"{workdir} is not a directory"
    if workdir == Path("/") or workdir == home or workdir in home.parents:
        return f"{workdir} would expose the home folder and its credentials, mount a project folder instead"
    return None


def podman_args(workdir: Path, command: list[str], image: str = IMAGE) -> list[str]:
    return [
        "podman", "run", "--rm",
        "--network", "none",
        "--read-only",
        "--cap-drop", "all",
        "--security-opt", "no-new-privileges",
        "--memory", "512m",
        "--pids-limit", "128",
        "--tmpfs", "/tmp:rw,size=64m",
        "--volume", f"{workdir}:/work:ro",
        "--workdir", "/work",
        image,
        *command,
    ]


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="untrusted_run")
    parser.add_argument("workdir", type=Path)
    parser.add_argument("--image", default=IMAGE)
    parser.add_argument("--timeout", type=int, default=120)
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        parser.error("missing command after --")
    workdir = args.workdir.resolve()
    reason = refuse_reason(workdir, Path.home().resolve())
    if reason:
        print(f"untrusted_run refused: {reason}", file=sys.stderr)
        return 2
    try:
        return subprocess.run(podman_args(workdir, command, args.image), timeout=args.timeout).returncode
    except subprocess.TimeoutExpired:
        print(f"untrusted_run killed the sandbox after {args.timeout}s", file=sys.stderr)
        return TIMED_OUT
    except FileNotFoundError:
        print("untrusted_run failed: podman is not installed", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
