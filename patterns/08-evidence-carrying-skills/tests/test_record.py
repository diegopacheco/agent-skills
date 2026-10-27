import hashlib
import subprocess
from pathlib import Path

RECORD = Path(__file__).resolve().parent.parent / "skill" / "scripts" / "record.sh"


def record(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run([str(RECORD), *args], capture_output=True, text=True, timeout=30)


def test_passing_check_is_recorded_with_its_real_exit_code_and_output_hash(tmp_path: Path) -> None:
    evidence = tmp_path / "evidence.md"
    result = record("run", str(evidence), "--", "printf", "tests ok")
    text = evidence.read_text()
    assert result.returncode == 0
    assert result.stdout == "tests ok"
    assert "- exit code: 0" in text
    assert f"- output sha256: {hashlib.sha256(b'tests ok').hexdigest()}" in text


def test_failing_check_keeps_its_exit_code_so_the_agent_cannot_call_it_done(tmp_path: Path) -> None:
    evidence = tmp_path / "evidence.md"
    result = record("run", str(evidence), "--", "sh", "-c", "echo 2 failed; exit 3")
    assert result.returncode == 3
    assert "- exit code: 3" in evidence.read_text()
    assert "2 failed" in evidence.read_text()


def test_artifact_hash_changes_when_the_file_changes_after_attaching(tmp_path: Path) -> None:
    evidence, artifact = tmp_path / "evidence.md", tmp_path / "out.txt"
    artifact.write_text("v1")
    record("artifact", str(evidence), str(artifact))
    artifact.write_text("v2")
    assert hashlib.sha256(b"v1").hexdigest() in evidence.read_text()
    assert hashlib.sha256(b"v2").hexdigest() not in evidence.read_text()


def test_missing_artifact_and_bad_usage_fail_loudly(tmp_path: Path) -> None:
    evidence = tmp_path / "evidence.md"
    assert record("artifact", str(evidence), str(tmp_path / "missing")).returncode == 1
    assert record("run", str(evidence), "ls").returncode == 2
    assert not evidence.exists()
