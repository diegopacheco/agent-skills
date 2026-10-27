import json
from pathlib import Path

import pytest

from check_contract import violations
from run_evals import main, run_case

EVALS = Path(__file__).resolve().parent.parent / "skill" / "evals"
CONTRACT_CASES = json.loads((EVALS / "contract.json").read_text())


@pytest.mark.parametrize("case", CONTRACT_CASES, ids=[c["why"] for c in CONTRACT_CASES])
def test_checker_enforces_every_written_contract_case(case: dict[str, object]) -> None:
    message = case["message"]
    assert isinstance(message, str)
    assert (violations(message) == []) is case["valid"]


def test_contract_cases_cover_both_accepted_and_rejected_messages() -> None:
    assert {c["valid"] for c in CONTRACT_CASES} == {True, False}


class FakeModel:
    def __init__(self, replies: list[str]) -> None:
        self.replies = replies
        self.prompts: list[str] = []

    def __call__(self, command: list[str]) -> str:
        self.prompts.append(command[-1])
        return self.replies[len(self.prompts) - 1]


def test_behavior_eval_sends_the_skill_itself_to_the_model() -> None:
    model = FakeModel(["fix(auth): reject expired refresh tokens"])
    result = run_case({"name": "n", "change": "tokens bug", "expect_type": "fix"}, model, "claude", "m")
    assert result.problems == []
    assert "# Conventional Commit" in model.prompts[0]
    assert not model.prompts[0].startswith("-")


def test_behavior_eval_fails_a_well_formed_message_with_the_wrong_type() -> None:
    result = run_case({"name": "n", "change": "x", "expect_type": "refactor"}, FakeModel(["feat: move helpers"]), "claude", "m")
    assert result.problems == ["expected type refactor, got feat"]


def test_suite_exit_code_blocks_publishing_when_any_case_fails() -> None:
    good = FakeModel(["fix: a", "feat: b", "docs: c", "refactor: d"])
    bad = FakeModel(["fix: a", "feat: b", "docs: c", "Refactor stuff."])
    assert main([], good) == 0
    assert main([], bad) == 1
