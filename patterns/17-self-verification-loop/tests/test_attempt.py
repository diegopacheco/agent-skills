from pathlib import Path

import pytest

from attempt import GREEN, RETRY, STOP, run


@pytest.fixture
def files(tmp_path: Path) -> tuple[Path, Path, Path]:
    return tmp_path / "state.json", tmp_path / "report.md", tmp_path / "runs"


def flaky_until(passes_on: int, runs: Path) -> str:
    return f"echo x >> {runs}; n=$(wc -l < {runs}); echo \"failure $n\"; [ $n -ge {passes_on} ]"


def test_green_on_a_later_attempt_clears_the_state(files: tuple[Path, Path, Path]) -> None:
    state, report, runs = files
    command = flaky_until(2, runs)
    assert run(command, 3, state, report)[0] == RETRY
    code, message = run(command, 3, state, report)
    assert code == GREEN and "green on attempt 2/3" in message
    assert not state.exists() and not report.exists()


def test_budget_is_enforced_by_the_script_not_by_the_model(files: tuple[Path, Path, Path]) -> None:
    state, report, runs = files
    command = flaky_until(99, runs)
    assert [run(command, 3, state, report)[0] for _ in range(3)] == [RETRY, RETRY, STOP]
    code, message = run(command, 3, state, report)
    assert code == STOP and "budget spent" in message
    assert len(runs.read_text().splitlines()) == 3
    assert "3 of 3 attempts failed" in report.read_text()


def test_a_fix_that_changes_nothing_stops_the_loop_early(files: tuple[Path, Path, Path]) -> None:
    state, report, _ = files
    command = "echo 'AssertionError: 1 != 2'; exit 1"
    assert run(command, 5, state, report)[0] == RETRY
    code, message = run(command, 5, state, report)
    assert code == STOP and "no progress" in message
    assert "AssertionError: 1 != 2" in report.read_text()


def test_switching_to_another_command_cannot_reset_the_budget(files: tuple[Path, Path, Path]) -> None:
    state, report, _ = files
    run("exit 1", 3, state, report)
    with pytest.raises(ValueError, match="belongs to"):
        run("true", 3, state, report)
