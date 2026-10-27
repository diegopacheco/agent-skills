import json
from decimal import Decimal
from pathlib import Path

import pytest

from invoice_total import compute, main


def row(quantity: str, price: str) -> dict[str, str]:
    return {"item": "x", "quantity": quantity, "unit_price": price}


def test_money_is_exact_where_float_math_drifts() -> None:
    totals = compute([row("3", "0.10"), row("1", "0.20"), row("7", "19.99")], Decimal("0"))
    assert 3 * 0.10 + 0.20 + 7 * 19.99 != 140.43
    assert totals.subtotal == Decimal("140.43")


def test_tax_rounds_half_up_to_the_cent_like_accounting_expects() -> None:
    totals = compute([row("1", "10.00")], Decimal("0.0825"))
    assert totals.tax == Decimal("0.83")
    assert totals.total == Decimal("10.83")


def test_tax_applies_after_the_discount_not_before() -> None:
    totals = compute([row("1", "100.00")], Decimal("0.10"), Decimal("0.20"))
    assert (totals.discount, totals.tax, totals.total) == (Decimal("20.00"), Decimal("8.00"), Decimal("88.00"))


def test_percent_typed_as_a_whole_number_is_refused_not_applied() -> None:
    with pytest.raises(ValueError, match="between 0 and 1"):
        compute([row("1", "10.00")], Decimal("8.25"))


def test_agent_gets_only_a_json_result(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    items = tmp_path / "items.csv"
    items.write_text("item,quantity,unit_price\nwidget,3,0.10\ngadget,1,0.20\n")
    assert main([str(items), "--tax-rate", "0.10"]) == 0
    assert json.loads(capsys.readouterr().out) == {"items": 2, "subtotal": "0.50", "discount": "0.00", "tax": "0.05", "total": "0.55"}


def test_bad_rows_fail_loudly_instead_of_returning_a_wrong_total(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    items = tmp_path / "items.csv"
    items.write_text("item,qty,price\nwidget,2,5.00\n")
    assert main([str(items)]) == 1
    assert "missing columns: quantity, unit_price" in capsys.readouterr().err
