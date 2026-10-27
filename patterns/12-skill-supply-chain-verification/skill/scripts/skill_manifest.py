import argparse
import hashlib
import sys
from pathlib import Path

MANIFEST = "MANIFEST.sha256"
IGNORED = {"__pycache__", ".DS_Store"}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def files(skill: Path) -> list[str]:
    return sorted(
        str(p.relative_to(skill))
        for p in skill.rglob("*")
        if p.is_file() and p.name != MANIFEST and not IGNORED & set(p.relative_to(skill).parts)
    )


def create(skill: Path) -> str:
    text = "".join(f"{sha256(skill / name)}  {name}\n" for name in files(skill))
    (skill / MANIFEST).write_text(text)
    return sha256(skill / MANIFEST)


def verify(skill: Path, expect: str | None = None) -> list[str]:
    manifest = skill / MANIFEST
    if not manifest.is_file():
        return [f"no {MANIFEST} in {skill}"]
    if expect and sha256(manifest) != expect:
        return [f"{MANIFEST} sha256 is {sha256(manifest)}, the publisher pinned {expect}"]
    listed = {name: digest for digest, name in (line.split("  ", 1) for line in manifest.read_text().splitlines())}
    present = files(skill)
    problems = [f"missing: {name}" for name in sorted(set(listed) - set(present))]
    problems += [f"unlisted: {name}" for name in present if name not in listed]
    problems += [f"modified: {name}" for name in present if name in listed and sha256(skill / name) != listed[name]]
    return problems


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="skill_manifest")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("create").add_argument("skill", type=Path)
    check = commands.add_parser("verify")
    check.add_argument("skill", type=Path)
    check.add_argument("--expect", help="sha256 of MANIFEST.sha256 published by the author out of band")
    args = parser.parse_args(argv)
    if args.command == "create":
        print(f"{MANIFEST} sha256: {create(args.skill)}")
        return 0
    problems = verify(args.skill, args.expect)
    for problem in problems:
        print(problem, file=sys.stderr)
    if problems:
        print(f"refusing {args.skill}: {len(problems)} integrity problem(s)", file=sys.stderr)
        return 1
    print(f"verified {len(files(args.skill))} files in {args.skill}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
