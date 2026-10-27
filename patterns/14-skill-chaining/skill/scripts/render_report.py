import json
import sys

from chain_schema import violations


def render(document: dict) -> str:
    lines = [f"# Report for {document['source']}", "", f"Rows: {document['rows']}", "", "| Column | Sum | Min | Max |", "|---|---|---|---|"]
    lines += [f"| {name} | {s['sum']} | {s['min']} | {s['max']} |" for name, s in document["columns"].items()]
    return "\n".join(lines) + "\n"


def main(text: str) -> int:
    try:
        document = json.loads(text)
    except json.JSONDecodeError as error:
        print(f"render_report refused: input is not JSON ({error})", file=sys.stderr)
        return 1
    problems = violations(document)
    if problems:
        print("render_report refused the link: " + "; ".join(problems), file=sys.stderr)
        return 1
    print(render(document), end="")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.stdin.read()))
