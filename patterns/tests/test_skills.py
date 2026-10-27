import os
import re
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
PATTERNS = sorted(p for p in ROOT.iterdir() if re.match(r"^\d\d-", p.name))
REFERENCE = re.compile(r"`(?:<skill-dir>/)?((?:references|routes|evals|scripts|knowledge)/[\w./-]*)")


def frontmatter(skill_md: Path) -> dict[str, str]:
    _, front, _ = skill_md.read_text().split("---", 2)
    return dict((k.strip(), v.strip()) for k, v in (line.split(":", 1) for line in front.strip().splitlines()))


def installer_name(pattern: Path) -> str:
    match = re.search(r'^NAME="([^"]+)"', (pattern / "install.sh").read_text(), re.MULTILINE)
    assert match
    return match.group(1)


def test_there_are_nineteen_patterns() -> None:
    assert len(PATTERNS) == 19


@pytest.mark.parametrize("pattern", PATTERNS, ids=[p.name for p in PATTERNS])
def test_skill_is_discoverable_with_a_name_that_matches_its_installer(pattern: Path) -> None:
    meta = frontmatter(pattern / "skill" / "SKILL.md")
    assert meta["name"] == installer_name(pattern)
    assert "Use when" in meta["description"]
    assert len(meta["description"]) <= 1024


@pytest.mark.parametrize("pattern", PATTERNS, ids=[p.name for p in PATTERNS])
def test_every_file_the_skill_tells_the_agent_to_load_exists(pattern: Path) -> None:
    skill = pattern / "skill"
    for relative in REFERENCE.findall((skill / "SKILL.md").read_text()):
        assert (skill / relative).exists(), f"{pattern.name}: {relative} is referenced but missing"


@pytest.mark.parametrize("pattern", PATTERNS, ids=[p.name for p in PATTERNS])
def test_install_and_uninstall_cover_claude_codex_and_both(pattern: Path, tmp_path: Path) -> None:
    env = {**os.environ, "CLAUDE_SKILLS": str(tmp_path / "claude"), "CODEX_SKILLS": str(tmp_path / "codex")}
    name = installer_name(pattern)

    def run(script: str, target: str) -> None:
        subprocess.run([str(pattern / script), target], env=env, check=True, capture_output=True, timeout=30)

    run("install.sh", "both")
    for home in ("claude", "codex"):
        installed = tmp_path / home / name
        assert (installed / "SKILL.md").read_text() == (pattern / "skill" / "SKILL.md").read_text()
        assert not list(installed.rglob("__pycache__"))
    run("uninstall.sh", "codex")
    assert (tmp_path / "claude" / name).exists() and not (tmp_path / "codex" / name).exists()
    run("uninstall.sh", "claude")
    assert not (tmp_path / "claude" / name).exists()


@pytest.mark.parametrize("pattern", PATTERNS, ids=[p.name for p in PATTERNS])
def test_installer_rejects_an_unknown_target(pattern: Path) -> None:
    result = subprocess.run([str(pattern / "install.sh"), "vim"], capture_output=True, text=True, timeout=30)
    assert result.returncode == 1
    assert "usage" in result.stderr
