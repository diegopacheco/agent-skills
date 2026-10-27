import os
import shutil
import subprocess
from pathlib import Path

import pytest

from untrusted_run import IMAGE, main, podman_args, refuse_reason

SCRIPT = Path(__file__).resolve().parent.parent / "skill" / "scripts" / "untrusted_run.py"
podman = pytest.mark.skipif(shutil.which("podman") is None, reason="podman is not installed")


def test_every_isolation_boundary_is_in_the_command() -> None:
    args = podman_args(Path("/srv/job"), ["python", "x.py"])
    joined = " ".join(args)
    for flag in ("--network none", "--read-only", "--cap-drop all", "--security-opt no-new-privileges", "--memory 512m", "--pids-limit 128"):
        assert flag in joined
    assert "/srv/job:/work:ro" in args
    assert "--env-host" not in args and "--privileged" not in args
    assert args[-3:] == [IMAGE, "python", "x.py"]


def test_mounting_the_home_folder_or_above_is_refused(tmp_path: Path) -> None:
    home = tmp_path / "home"
    project = home / "project"
    project.mkdir(parents=True)
    assert refuse_reason(home, home) is not None
    assert refuse_reason(tmp_path, home) is not None
    assert refuse_reason(Path("/"), home) is not None
    assert refuse_reason(project, home) is None


def test_refused_mount_never_starts_a_container(capsys: pytest.CaptureFixture[str]) -> None:
    assert main([str(Path.home()), "--", "id"]) == 2
    assert "home folder" in capsys.readouterr().err


def sandbox(workdir: Path, code: str) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "AWS_SECRET_ACCESS_KEY": "host-secret"}
    return subprocess.run(["python3", str(SCRIPT), str(workdir), "--", "python", "-c", code], env=env, capture_output=True, text=True, timeout=180)


@podman
def test_sandboxed_code_cannot_reach_the_network(tmp_path: Path) -> None:
    result = sandbox(tmp_path, "import urllib.request; urllib.request.urlopen('http://1.1.1.1', timeout=5)")
    assert result.returncode != 0
    assert "URLError" in result.stderr or "unreachable" in result.stderr.lower()


@podman
def test_sandboxed_code_cannot_change_the_mounted_folder(tmp_path: Path) -> None:
    (tmp_path / "data.txt").write_text("original")
    result = sandbox(tmp_path, "print(open('/work/data.txt').read()); open('/work/data.txt', 'w').write('pwned')")
    assert result.stdout.strip() == "original"
    assert "Read-only file system" in result.stderr
    assert (tmp_path / "data.txt").read_text() == "original"


@podman
def test_sandboxed_code_cannot_see_host_secrets(tmp_path: Path) -> None:
    result = sandbox(tmp_path, "import os; print(os.environ.get('AWS_SECRET_ACCESS_KEY', 'absent'))")
    assert result.returncode == 0
    assert result.stdout.strip() == "absent"
