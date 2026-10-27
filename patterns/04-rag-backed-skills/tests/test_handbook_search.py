import json
from pathlib import Path

import pytest

from handbook_search import DEFAULT_DIR, Index, chunk_documents, main


def search(question: str, k: int = 3) -> list[tuple[str, str]]:
    return [(h.source, h.section) for h in Index(chunk_documents(DEFAULT_DIR)).search(question, k)]


def test_release_freeze_question_finds_the_freeze_rule_despite_plural_and_case() -> None:
    assert search("can I deploy on friday afternoon")[0] == ("releases.md", "Freeze")


def test_approval_question_ranks_the_approval_rule_above_other_database_mentions() -> None:
    hits = search("how many approvals for a database migration pull request")
    assert hits[0] == ("code-review.md", "Approvals")
    assert ("security.md", "Access") in hits


def test_only_top_k_sections_reach_the_prompt() -> None:
    assert len(search("production deploy approvals access secrets", k=2)) == 2


def test_unknown_topic_returns_nothing_so_the_agent_cannot_invent_a_policy(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["best pizza in naples"]) == 0
    assert capsys.readouterr().out.strip() == "NO RELEVANT KNOWLEDGE FOUND"


def test_team_can_point_the_skill_to_their_own_handbook(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    (tmp_path / "travel.md").write_text("# Travel\n\n## Flights\nBook economy for flights under six hours.\n")
    assert main(["flights budget", "--dir", str(tmp_path), "--json"]) == 0
    hits = json.loads(capsys.readouterr().out)
    assert [(h["source"], h["section"]) for h in hits] == [("travel.md", "Flights")]


def test_missing_knowledge_folder_fails_loudly(tmp_path: Path) -> None:
    assert main(["anything", "--dir", str(tmp_path / "missing")]) == 2
