import pytest

from agent_sdk import ClaudeCodeAgent, CodexAgent
from calc_harness import Harness, HarnessError, main
from safe_math import MathError, evaluate


class FakeRunner:
    def __init__(self, output: str) -> None:
        self.output = output
        self.commands: list[list[str]] = []

    def __call__(self, command: list[str]) -> str:
        self.commands.append(command)
        return self.output


def harness(output: str) -> tuple[Harness, FakeRunner]:
    runner = FakeRunner(output)
    return Harness(ClaudeCodeAgent(runner), "claude-haiku-5-5"), runner


def test_engineering_mode_never_calls_the_llm() -> None:
    h, runner = harness("unused")
    reply = h.handle("/calc (17 + 25) * 3 ^ 2")
    assert reply.text == "(17 + 25) * 3 ^ 2 = 378"
    assert runner.commands == []


def test_blended_mode_takes_only_the_expression_from_the_llm_and_computes_in_code() -> None:
    h, runner = harness('{"expression": "(15 * 240) / 100 + 8", "result": 999}')
    reply = h.handle("/english fifteen percent of two hundred forty plus eight")
    assert reply.ok
    assert reply.text.endswith("code computed: 44")
    assert "999" not in reply.text
    assert runner.commands[0][:4] == ["claude", "-p", "--model", "claude-haiku-5-5"]


def test_blended_mode_refuses_code_the_llm_tries_to_smuggle_in() -> None:
    h, _ = harness('{"expression": "__import__(\'os\').system(\'rm -rf /\')"}')
    reply = h.handle("/english delete everything")
    assert not reply.ok
    assert reply.text == "error: Call is not allowed"


def test_blended_mode_fails_loudly_when_the_llm_answers_without_json() -> None:
    h, _ = harness("the answer is 44")
    reply = h.handle("/english fifteen percent of two hundred forty plus eight")
    assert reply.text == "error: llm did not return an expression"


def test_llm_mode_returns_the_model_judgement_labelled_as_such() -> None:
    h, _ = harness("YES. 22 is above 18.\n")
    reply = h.handle("/ask if 11 + 11 were my age, could I drive in Brazil?")
    assert reply.mode == "llm"
    assert reply.text == "llm decided  : YES. 22 is above 18."


def test_every_call_is_traced_with_its_mode_and_llm_use() -> None:
    h, _ = harness('{"expression": "1 + 1"}')
    h.handle("/calc 1 / 0")
    h.handle("/english one plus one")
    assert [(r.mode, r.llm, r.ok) for r in h.trace] == [("engineering", False, False), ("blended", True, True)]


def test_unknown_command_is_rejected_before_anything_runs() -> None:
    h, runner = harness("unused")
    with pytest.raises(HarnessError):
        h.handle("/shell ls")
    assert h.trace == [] and runner.commands == []


def test_safe_math_blocks_resource_exhaustion() -> None:
    with pytest.raises(MathError):
        evaluate("9 ** 9 ** 9")
    with pytest.raises(MathError):
        evaluate("1 + " * 100 + "1")


def test_codex_provider_runs_outside_a_git_repository() -> None:
    runner = FakeRunner("{}")
    CodexAgent(runner).call("gpt-5.6-luna", "hi")
    assert "--skip-git-repo-check" in runner.commands[0]


def test_cli_exit_code_reflects_failure(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["/calc", "2", "+", "3"]) == 0
    assert capsys.readouterr().out == "[engineering] 2 + 3 = 5\n"
    assert main(["/calc", "1/0"]) == 1
