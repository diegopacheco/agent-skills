import sys
from pathlib import Path

from approval_gate import APPROVALS, TTL_SECONDS, ticket_name


def approve(command: str, folder: Path, answer: str) -> Path | None:
    if answer.strip().lower() != "yes":
        return None
    ticket = folder / APPROVALS / ticket_name(command)
    ticket.parent.mkdir(exist_ok=True)
    ticket.write_text(command.strip() + "\n")
    return ticket


def main(argv: list[str]) -> int:
    if len(argv) != 1:
        print("usage: approve.py '<exact command>'", file=sys.stderr)
        return 2
    if not sys.stdin.isatty():
        print("approve.py refused: approval needs a human at a terminal", file=sys.stderr)
        return 1
    print(f"command: {argv[0]}")
    ticket = approve(argv[0], Path.cwd(), input("type yes to approve this exact command once: "))
    if ticket is None:
        print("not approved")
        return 1
    print(f"approved once, valid for {TTL_SECONDS // 60} minutes")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
