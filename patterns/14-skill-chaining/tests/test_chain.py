import json
from pathlib import Path

import pytest

import render_report
import summarize_csv
from chain_schema import violations


def first_link(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> str:
    sales = tmp_path / "sales.csv"
    sales.write_text("region,amount,units\nnorth,10.00,1\nsouth,30.25,4\neast,20.25,2\n")
    assert summarize_csv.main([str(sales)]) == 0
    return capsys.readouterr().out


def test_the_output_of_link_one_is_the_input_of_link_two(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    link = first_link(tmp_path, capsys)
    assert render_report.main(link) == 0
    report = capsys.readouterr().out
    assert "| amount | 60.50 | 10.00 | 30.25 |" in report
    assert "| units | 7 | 1 | 4 |" in report
    assert "region" not in report


def test_money_crosses_the_link_as_exact_strings(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    link = json.loads(first_link(tmp_path, capsys))
    assert link["columns"]["amount"]["sum"] == "60.50"


@pytest.mark.parametrize(
    ("change", "reason"),
    [
        ({"schema": "csv-summary/2"}, "schema must be csv-summary/1"),
        ({"rows": "3"}, "rows must be a positive integer"),
        ({"extra": True}, "keys must be exactly"),
        ({"columns": {"amount": {"sum": 60.5, "min": "10.00", "max": "30.25"}}}, "amount.sum must be a decimal string"),
    ],
)
def test_link_two_refuses_any_shape_but_the_contract(tmp_path: Path, capsys: pytest.CaptureFixture[str], change: dict, reason: str) -> None:
    link = {**json.loads(first_link(tmp_path, capsys)), **change}
    assert render_report.main(json.dumps(link)) == 1
    assert reason in capsys.readouterr().err


def test_a_broken_handoff_stops_the_chain_instead_of_rendering_garbage(capsys: pytest.CaptureFixture[str]) -> None:
    assert render_report.main("summarize_csv failed: no such file") == 1
    captured = capsys.readouterr()
    assert captured.out == "" and "not JSON" in captured.err


def test_contract_reports_every_violation_at_once() -> None:
    assert len(violations({"schema": "x", "source": 1, "rows": 0, "columns": {}})) == 4
