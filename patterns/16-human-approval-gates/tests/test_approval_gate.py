import json
import subprocess
from pathlib import Path

from approval_gate import TTL_SECONDS, decide
from approve import approve

SCRIPTS = Path(__file__).resolve().parent.parent / "skill" / "scripts"
DEPLOY = "./deploy.sh prod v1.4.2"


def bash(command: str, cwd: Path) -> dict:
    return {"tool_name": "Bash", "tool_input": {"command": command}, "cwd": str(cwd)}


def test_production_deploy_is_blocked_without_approval(tmp_path: Path) -> None:
    code, message = decide(bash(DEPLOY, tmp_path), 0)
    assert code == 2
    assert "approve.py" in message and DEPLOY in message


def test_staging_and_ordinary_commands_are_not_gated(tmp_path: Path) -> None:
    assert decide(bash("./deploy.sh staging v1.4.2", tmp_path), 0) == (0, "")
    assert decide(bash("ls -la", tmp_path), 0) == (0, "")


def test_an_approval_runs_the_exact_command_once(tmp_path: Path) -> None:
    ticket = approve(DEPLOY, tmp_path, "yes")
    assert ticket is not None
    now = ticket.stat().st_mtime + 1
    assert decide(bash(DEPLOY, tmp_path), now)[0] == 0
    assert decide(bash(DEPLOY, tmp_path), now)[0] == 2


def test_an_approval_does_not_cover_a_different_version(tmp_path: Path) -> None:
    approve(DEPLOY, tmp_path, "yes")
    assert decide(bash("./deploy.sh prod v9.9.9", tmp_path), 0)[0] == 2


def test_a_stale_approval_is_refused(tmp_path: Path) -> None:
    ticket = approve(DEPLOY, tmp_path, "yes")
    assert ticket is not None
    code, message = decide(bash(DEPLOY, tmp_path), ticket.stat().st_mtime + TTL_SECONDS + 1)
    assert code == 2 and "expired" in message


def test_the_agent_cannot_approve_its_own_deploy(tmp_path: Path) -> None:
    assert decide(bash(f"python3 approve.py '{DEPLOY}'", tmp_path), 0)[0] == 2
    assert decide(bash("mkdir -p .approvals && touch .approvals/x", tmp_path), 0)[0] == 2
    write = {"tool_name": "Write", "tool_input": {"file_path": str(tmp_path / ".approvals" / "x")}, "cwd": str(tmp_path)}
    assert decide(write, 0)[0] == 2


def test_approve_refuses_without_a_human_terminal(tmp_path: Path) -> None:
    result = subprocess.run(["python3", str(SCRIPTS / "approve.py"), DEPLOY], cwd=tmp_path, input="yes\n", capture_output=True, text=True, timeout=30)
    assert result.returncode == 1
    assert "human" in result.stderr
    assert not (tmp_path / ".approvals").exists()


def test_the_hook_blocks_through_stdin_with_exit_code_2(tmp_path: Path) -> None:
    result = subprocess.run(
        ["python3", str(SCRIPTS / "approval_gate.py")],
        input=json.dumps(bash(DEPLOY, tmp_path)),
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 2
    assert "needs human approval" in result.stderr
