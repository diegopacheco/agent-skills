import json
from pathlib import Path

import pytest

from log_triage import main, scan, summarize


def run(log: Path, budget: int, capsys: pytest.CaptureFixture[str]) -> dict[str, object]:
    assert main([str(log), "--budget", str(budget)]) == 0
    return json.loads(capsys.readouterr().out)


def test_a_huge_log_costs_no_more_than_the_budget(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    log = tmp_path / "app.log"
    log.write_text("".join(f"2026-10-27 INFO request {i} ok\n" for i in range(200_000)) + "2026-10-27 ERROR db down\n")
    assert main([str(log), "--budget", "1500"]) == 0
    printed = capsys.readouterr().out.strip()
    assert log.stat().st_size > 5_000_000 and len(printed) <= 1500
    assert json.loads(printed)["lines"] == 200_001


def test_same_error_with_different_ids_is_one_group_ranked_by_count() -> None:
    lines = [
        "ERROR timeout after 30s for order 123\n",
        "ERROR timeout after 45s for order 999\n",
        "ERROR disk full on /dev/sda1\n",
        "ERROR timeout after 12s for order 7\n",
    ]
    groups = summarize(scan(lines), 4000)["groups"]
    assert isinstance(groups, list)
    assert groups[0] == {"signature": "ERROR timeout after <n>s for order <n>", "count": 3, "first_line": 1}
    assert len(groups) == 2


def test_dropped_groups_are_reported_never_hidden(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    log = tmp_path / "app.log"
    log.write_text("".join(f"ERROR failure kind {chr(97 + i % 26) * (i // 26 + 1)}\n" for i in range(300)))
    summary = run(log, 1500, capsys)
    groups = summary["groups"]
    assert isinstance(groups, list)
    assert summary["groups_omitted"] == 300 - len(groups) > 0


def test_a_budget_too_small_fails_loudly_instead_of_returning_nothing(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    log = tmp_path / "app.log"
    log.write_text("ERROR boom\n")
    assert main([str(log), "--budget", "20"]) == 1
    assert "cannot hold" in capsys.readouterr().err
