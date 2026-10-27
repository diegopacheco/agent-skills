import argparse
import os
import sys
import time
from collections.abc import Callable
from dataclasses import dataclass, field

from agent_sdk import PROVIDERS, Agent, json_object
from safe_math import MathError, evaluate, format_number

BANNER = r"""
   ____    _    _     ____   _   _    _    ____  _   _ _____ ____ ____
  / ___|  / \  | |   / ___| | | | |  / \  |  _ \| \ | | ____/ ___/ ___|
 | |     / _ \ | |  | |     | |_| | / _ \ | |_) |  \| |  _| \___ \___ \
 | |___ / ___ \| |__| |___  |  _  |/ ___ \|  _ <| |\  | |___ ___) |__) |
  \____/_/   \_\_____\____| |_| |_/_/   \_\_| \_\_| \_|_____|____/____/
"""

HELP = """commands
  /calc <expression>     engineering: code only, no llm
                         /calc (17 + 25) * 3 ^ 2
  /english <sentence>    blended: llm parses the english, code computes
                         /english fifteen percent of two hundred forty plus eight
  /ask <question>        llm: the model decides alone
                         /ask if 11 + 11 were my age, could I drive a car in Brazil?
  /trace                 every call of this session with mode, llm use and latency
  /help                  this help
  /quit                  leave"""

ENGLISH_PROMPT = """Translate the English below into one arithmetic expression.
Use only numbers, parentheses and the operators + - * / // % **.
Do not compute the result.
Reply with only JSON: {{"expression": "<expression>"}}
English: {text}"""

ASK_PROMPT = """Answer the question below in at most three short sentences.
Start with YES, NO or DEPENDS.
Question: {question}"""


class HarnessError(RuntimeError):
    pass


@dataclass(frozen=True)
class Reply:
    mode: str
    request: str
    text: str
    llm: bool
    ok: bool
    millis: int


@dataclass
class Harness:
    agent: Agent
    model: str
    args: list[str] = field(default_factory=list)
    trace: list[Reply] = field(default_factory=list)

    def handle(self, line: str) -> Reply:
        command, _, request = line.strip().partition(" ")
        modes: dict[str, tuple[str, bool, Callable[[str], str]]] = {
            "/calc": ("engineering", False, self.calc),
            "/english": ("blended", True, self.english),
            "/ask": ("llm", True, self.ask),
        }
        if command not in modes:
            raise HarnessError(f"unknown command {command}, try /help")
        mode, llm, run = modes[command]
        started = time.monotonic()
        try:
            text, ok = run(request.strip()), True
        except (MathError, HarnessError, RuntimeError, ValueError) as error:
            text, ok = f"error: {error}", False
        reply = Reply(mode, request.strip(), text, llm, ok, int((time.monotonic() - started) * 1000))
        self.trace.append(reply)
        return reply

    def calc(self, expression: str) -> str:
        return f"{expression} = {format_number(evaluate(expression))}"

    def english(self, sentence: str) -> str:
        if not sentence:
            raise HarnessError("nothing to translate")
        expression = json_object(self.agent.call(self.model, ENGLISH_PROMPT.format(text=sentence), self.args)).get("expression")
        if not isinstance(expression, str):
            raise HarnessError("llm did not return an expression")
        return f"llm parsed   : {expression}\ncode computed: {format_number(evaluate(expression))}"

    def ask(self, question: str) -> str:
        if not question:
            raise HarnessError("nothing to ask")
        return f"llm decided  : {self.agent.call(self.model, ASK_PROMPT.format(question=question), self.args).strip()}"

    def render_trace(self) -> str:
        rows = [f"{i:>3} {r.mode:<12} llm={'yes' if r.llm else 'no ':<3} ok={'yes' if r.ok else 'no ':<3} {r.millis:>6}ms  {r.request}" for i, r in enumerate(self.trace, 1)]
        return "\n".join(rows) or "no calls yet"


def build(provider: str, model: str | None) -> Harness:
    agent_type = PROVIDERS[provider]
    return Harness(agent_type(), model or os.environ.get("CALC_HARNESS_MODEL") or agent_type.default_model)


def repl(harness: Harness) -> int:
    print(BANNER)
    print(f"provider model: {harness.model}\n")
    print(HELP)
    while True:
        try:
            line = input("\ncalc> ").strip()
        except EOFError:
            return 0
        if line in ("/quit", "/exit"):
            return 0
        if not line:
            continue
        if line == "/help":
            print(HELP)
        elif line == "/trace":
            print(harness.render_trace())
        else:
            try:
                reply = harness.handle(line)
                print(f"[{reply.mode}] {reply.text}")
            except HarnessError as error:
                print(error)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="calc_harness", description=BANNER + "\n" + HELP, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--provider", choices=sorted(PROVIDERS), default="claude")
    parser.add_argument("--model")
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    harness = build(args.provider, args.model)
    if not args.command:
        return repl(harness)
    try:
        reply = harness.handle(" ".join(args.command))
    except HarnessError as error:
        print(error, file=sys.stderr)
        return 2
    print(f"[{reply.mode}] {reply.text}", file=sys.stdout if reply.ok else sys.stderr)
    return 0 if reply.ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
