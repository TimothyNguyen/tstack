"""Tests for qa_verify.py — targeting 95%+ branch coverage."""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, call, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))
import qa_verify as qv
from qa_verify import (
    RECEIPT_HEADER,
    VERSION,
    CommandResult,
    Finding,
    assess,
    broad_command,
    changed_files,
    command_mentions_path,
    current_commit,
    evidence_hash,
    excluded,
    git_output,
    main,
    merge_base,
    needs_command_evidence,
    parse_args,
    parse_receipt_field,
    path_evidence_findings,
    proof_file_findings,
    proof_findings,
    proof_like,
    receipt,
    run,
    scan,
    scan_file,
    stale_input_files,
    strip_markdown_fences,
    summary,
)


# ── run() ─────────────────────────────────────────────────────────────────────


class TestRun:
    def test_returns_command_result(self):
        with patch("subprocess.run") as m:
            m.return_value = MagicMock(returncode=0, stdout="hello\n", stderr="")
            result = run("echo hello")
        assert result.command == "echo hello"
        assert result.code == 0
        assert result.output == "hello"

    def test_captures_stderr(self):
        with patch("subprocess.run") as m:
            m.return_value = MagicMock(returncode=1, stdout="", stderr="error!")
            result = run("bad")
        assert result.code == 1
        assert result.output == "error!"

    def test_combines_stdout_and_stderr(self):
        with patch("subprocess.run") as m:
            m.return_value = MagicMock(returncode=0, stdout="out\n", stderr="err\n")
            result = run("cmd")
        assert "out" in result.output and "err" in result.output


# ── git_output() ──────────────────────────────────────────────────────────────


class TestGitOutput:
    def test_success(self):
        with patch("subprocess.run") as m:
            m.return_value = MagicMock(returncode=0, stdout="abc123\n", stderr="")
            assert git_output(["rev-parse", "HEAD"]) == "abc123"

    def test_failure_raises_system_exit(self):
        with patch("subprocess.run") as m:
            m.return_value = MagicMock(returncode=128, stdout="", stderr="fatal: not a repo")
            with pytest.raises(SystemExit, match="fatal: not a repo"):
                git_output(["rev-parse", "HEAD"])

    def test_failure_empty_stderr_default_message(self):
        with patch("subprocess.run") as m:
            m.return_value = MagicMock(returncode=128, stdout="", stderr="")
            with pytest.raises(SystemExit, match="not a git repository"):
                git_output(["anything"])


# ── current_commit() ──────────────────────────────────────────────────────────


class TestCurrentCommit:
    def test_returns_commit(self):
        with patch("subprocess.run") as m:
            m.return_value = MagicMock(returncode=0, stdout="a1b2c3d\n")
            assert current_commit() == "a1b2c3d"

    def test_no_commits_returns_sentinel(self):
        with patch("subprocess.run") as m:
            m.return_value = MagicMock(returncode=128, stdout="")
            assert current_commit() == "no-commit-yet"


# ── merge_base() ──────────────────────────────────────────────────────────────


class TestMergeBase:
    def test_delegates_to_git_output(self):
        with patch.object(qv, "git_output", return_value="deadbeef") as m:
            assert merge_base("origin/main") == "deadbeef"
        m.assert_called_once_with(["merge-base", "origin/main", "HEAD"])


# ── changed_files() ───────────────────────────────────────────────────────────


class TestChangedFiles:
    def test_with_base_ref_and_commit(self):
        with patch.object(qv, "git_output", return_value="foo.py\nbar.py"):
            result = changed_files(base_ref="main", base_commit="abc123")
        assert result == [Path("foo.py"), Path("bar.py")]

    def test_with_base_ref_calls_merge_base(self):
        responses = iter(["deadbeef", "foo.py"])
        with patch.object(qv, "git_output", side_effect=lambda _a: next(responses)):
            result = changed_files(base_ref="main")
        assert result == [Path("foo.py")]

    def test_without_base_ref_deduplicates(self):
        effects = ["staged.py", "unstaged.py\nstaged.py", "untracked.py"]
        with patch.object(qv, "git_output", side_effect=effects):
            result = changed_files()
        names = {p.as_posix() for p in result}
        assert {"staged.py", "unstaged.py", "untracked.py"}.issubset(names)

    def test_empty_lines_filtered(self):
        with patch.object(qv, "git_output", return_value="\n\nfoo.py\n"):
            result = changed_files(base_ref="main", base_commit="abc")
        assert result == [Path("foo.py")]


# ── excluded() ────────────────────────────────────────────────────────────────


class TestExcluded:
    def test_matches(self):
        assert excluded(Path(".git/config"), (".git/*",)) is True

    def test_no_match(self):
        assert excluded(Path("src/main.py"), ("*.lock",)) is False

    def test_lock_file(self):
        assert excluded(Path("poetry.lock"), ("*.lock",)) is True


# ── strip_markdown_fences() ───────────────────────────────────────────────────


class TestStripMarkdownFences:
    def test_strips_fenced_content(self):
        result = strip_markdown_fences("before\n```\ncode\n```\nafter")
        assert "code" not in result
        assert "before" in result and "after" in result

    def test_preserves_non_fenced(self):
        text = "line1\nline2"
        assert strip_markdown_fences(text) == text

    def test_fence_line_becomes_empty(self):
        lines = strip_markdown_fences("```\nstuff\n```").splitlines()
        assert all(line == "" for line in lines)

    def test_language_specifier_stripped(self):
        result = strip_markdown_fences("```python\nimport os\n```")
        assert "import os" not in result


# ── scan_file() ───────────────────────────────────────────────────────────────


class TestScanFile:
    def test_unicode_error_returns_empty(self, tmp_path):
        f = tmp_path / "binary.py"
        f.write_bytes(b"\x80\x81\x82")
        assert scan_file(f) == []

    def test_os_error_returns_empty(self, tmp_path):
        assert scan_file(tmp_path / "nonexistent.py") == []

    def test_unfinished_marker_todo(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text("# TODO: fix this\n", encoding="utf-8")
        assert any(fi.rule == "unfinished_marker" for fi in scan_file(f))

    def test_unfinished_marker_fixme(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text("# FIXME: broken\n", encoding="utf-8")
        assert any(fi.rule == "unfinished_marker" for fi in scan_file(f))

    def test_unfinished_not_implemented(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text('raise NotImplementedError("not implemented")\n', encoding="utf-8")
        assert any(fi.rule == "unfinished_marker" for fi in scan_file(f))

    def test_python_silent_failure(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text("try:\n    do_thing()\nexcept Exception:\n    pass\n", encoding="utf-8")
        assert any(fi.rule == "python_silent_failure" for fi in scan_file(f))

    def test_js_silent_failure(self, tmp_path):
        f = tmp_path / "code.js"
        f.write_text("try { doThing(); } catch(e) {}", encoding="utf-8")
        assert any(fi.rule == "js_silent_failure" for fi in scan_file(f))

    def test_unsafe_eval(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text("result = eval(user_input)\n", encoding="utf-8")
        assert any(fi.rule == "unsafe_eval" for fi in scan_file(f))

    def test_secret_literal(self, tmp_path):
        f = tmp_path / "config.py"
        f.write_text('api_key = "supersecretvalue123"\n', encoding="utf-8")
        assert any(fi.rule == "secret_literal" for fi in scan_file(f))

    def test_md_strips_fences(self, tmp_path):
        f = tmp_path / "test-results.md"
        f.write_text("# Results\n```\neval(x)\n```\n", encoding="utf-8")
        assert not any(fi.rule == "unsafe_eval" for fi in scan_file(f))

    def test_correct_line_number(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text("line1\nline2\nresult = eval(x)\n", encoding="utf-8")
        findings = [fi for fi in scan_file(f) if fi.rule == "unsafe_eval"]
        assert findings[0].line == 3

    def test_snippet_truncated_at_160(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text("# TODO: " + "x" * 200 + "\n", encoding="utf-8")
        assert all(len(fi.text) <= 160 for fi in scan_file(f))

    def test_clean_file_empty(self, tmp_path):
        f = tmp_path / "clean.py"
        f.write_text("def hello():\n    return 'world'\n", encoding="utf-8")
        assert scan_file(f) == []


# ── scan() ────────────────────────────────────────────────────────────────────


class TestScan:
    def test_skips_directories(self, tmp_path):
        d = tmp_path / "somedir"
        d.mkdir()
        assert scan([d], ()) == []

    def test_skips_excluded_files(self, tmp_path):
        f = tmp_path / "file.lock"
        f.write_text("content")
        assert scan([f], ("*.lock",)) == []

    def test_scans_matching_files(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text("# TODO fix me\n")
        assert len(scan([f], ())) > 0


# ── proof_like() ──────────────────────────────────────────────────────────────


class TestProofLike:
    def test_qa_receipt_md(self):
        assert proof_like(Path("QA-RECEIPT.md")) is True

    def test_proof_txt(self):
        assert proof_like(Path("proof.txt")) is True

    def test_verification_markdown(self):
        assert proof_like(Path("verification.markdown")) is True

    def test_test_results_md(self):
        assert proof_like(Path("test-results.md")) is True

    def test_qa_verify_md(self):
        assert proof_like(Path("qa-verify.md")) is True

    def test_wrong_extension(self):
        assert proof_like(Path("QA-RECEIPT.py")) is False

    def test_wrong_name(self):
        assert proof_like(Path("readme.md")) is False


# ── parse_receipt_field() ─────────────────────────────────────────────────────


class TestParseReceiptField:
    def test_with_backticks(self):
        assert parse_receipt_field("- evidence hash: `abc123`", "evidence hash") == "abc123"

    def test_without_backticks(self):
        assert parse_receipt_field("- base commit: deadbeef", "base commit") == "deadbeef"

    def test_not_found(self):
        assert parse_receipt_field("- other: value", "evidence hash") is None

    def test_case_insensitive(self):
        assert parse_receipt_field("- Evidence Hash: `abc`", "evidence hash") == "abc"


# ── proof_file_findings() ─────────────────────────────────────────────────────


class TestProofFileFindings:
    def test_non_proof_file_skipped(self, tmp_path):
        f = tmp_path / "README.md"
        f.write_text("tests passed")
        assert proof_file_findings([f], "hash123") == []

    def test_nonexistent_proof_file_skipped(self, tmp_path):
        f = tmp_path / "QA-RECEIPT.md"
        assert proof_file_findings([f], "hash123") == []

    def test_thin_proof_flagged(self, tmp_path):
        f = tmp_path / "QA-RECEIPT.md"
        f.write_text("all tests passed\n")
        findings = proof_file_findings([f], "hash123")
        assert any(fi.rule == "thin_proof_file" for fi in findings)

    def test_thin_proof_with_full_evidence_not_flagged(self, tmp_path):
        f = tmp_path / "QA-RECEIPT.md"
        f.write_text("tests passed\nexit code: 0\noutput:\n```text\n...\n```\ngenerated: 2024-01-01\n")
        findings = proof_file_findings([f], "hash123")
        assert not any(fi.rule == "thin_proof_file" for fi in findings)

    def test_no_receipt_header_skipped(self, tmp_path):
        f = tmp_path / "QA-RECEIPT.md"
        f.write_text("# Other Header\nresults\n")
        assert proof_file_findings([f], "hash123") == []

    def test_no_evidence_hash_finding(self, tmp_path):
        f = tmp_path / "QA-RECEIPT.md"
        f.write_text(f"{RECEIPT_HEADER} PASS\n\nno hash here\n")
        findings = proof_file_findings([f], "hash123")
        assert any(fi.rule == "stale_proof" and "no evidence hash" in fi.text for fi in findings)

    def test_wrong_hash_finding(self, tmp_path):
        f = tmp_path / "QA-RECEIPT.md"
        f.write_text(f"{RECEIPT_HEADER} PASS\n\n- evidence hash: `wronghash`\n")
        findings = proof_file_findings([f], "correcthash")
        assert any(fi.rule == "stale_proof" and "evidence changed" in fi.text for fi in findings)

    def test_correct_hash_no_finding(self, tmp_path):
        h = "abc123"
        f = tmp_path / "QA-RECEIPT.md"
        f.write_text(f"{RECEIPT_HEADER} PASS\n\n- evidence hash: `{h}`\n")
        assert not any(fi.rule == "stale_proof" for fi in proof_file_findings([f], h))

    def test_base_commit_mismatch(self, tmp_path):
        h = "abc123"
        f = tmp_path / "QA-RECEIPT.md"
        f.write_text(f"{RECEIPT_HEADER} PASS\n\n- evidence hash: `{h}`\n- base commit: `oldbase`\n")
        findings = proof_file_findings([f], h, base_commit="newbase")
        assert any(fi.rule == "stale_proof" and "base commit changed" in fi.text for fi in findings)

    def test_base_commit_match_no_finding(self, tmp_path):
        h, base = "abc123", "thebase"
        f = tmp_path / "QA-RECEIPT.md"
        f.write_text(f"{RECEIPT_HEADER} PASS\n\n- evidence hash: `{h}`\n- base commit: `{base}`\n")
        assert not any(fi.rule == "stale_proof" for fi in proof_file_findings([f], h, base_commit=base))

    def test_os_error_skipped(self, tmp_path):
        f = tmp_path / "qa-verify.md"
        with patch.object(Path, "is_file", return_value=True):
            with patch.object(Path, "read_text", side_effect=OSError("no read")):
                assert proof_file_findings([f], "hash") == []


# ── stale_input_files() ───────────────────────────────────────────────────────


class TestStaleInputFiles:
    def test_adds_tracked_stale_files(self):
        with patch.object(qv, "git_output", return_value="pyproject.toml\nsrc/main.py"):
            result = stale_input_files([])
        paths = [p.as_posix() for p in result]
        assert "pyproject.toml" in paths
        assert "src/main.py" not in paths

    def test_git_failure_falls_back_to_input_only(self):
        inp = [Path("requirements.txt")]
        with patch.object(qv, "git_output", side_effect=SystemExit("not a repo")):
            result = stale_input_files(inp)
        assert Path("requirements.txt") in result

    def test_union_of_input_and_tracked(self):
        inp = [Path("requirements.txt")]
        with patch.object(qv, "git_output", return_value="go.mod\nfoo.py"):
            result = stale_input_files(inp)
        paths = [p.as_posix() for p in result]
        assert "requirements.txt" in paths
        assert "go.mod" in paths

    def test_output_sorted(self):
        with patch.object(qv, "git_output", return_value="pyproject.toml\ngo.mod"):
            result = stale_input_files([])
        posix = [p.as_posix() for p in result]
        assert posix == sorted(posix)


# ── evidence_hash() ───────────────────────────────────────────────────────────


class TestEvidenceHash:
    def test_deterministic(self, tmp_path):
        f = tmp_path / "file.py"
        f.write_text("content", encoding="utf-8")
        cmd = CommandResult("pytest", 0, "ok")
        assert evidence_hash([f], [cmd]) == evidence_hash([f], [cmd])

    def test_base_commit_changes_hash(self, tmp_path):
        f = tmp_path / "file.py"
        f.write_text("content", encoding="utf-8")
        assert evidence_hash([f], []) != evidence_hash([f], [], base_commit="abc123")

    def test_missing_file_uses_sentinel(self, tmp_path):
        f = tmp_path / "missing.py"
        result = evidence_hash([f], [])
        assert isinstance(result, str) and len(result) == 64

    def test_different_files_different_hash(self, tmp_path):
        f1, f2 = tmp_path / "a.py", tmp_path / "b.py"
        f1.write_text("aaa", encoding="utf-8")
        f2.write_text("bbb", encoding="utf-8")
        assert evidence_hash([f1], []) != evidence_hash([f2], [])

    def test_command_affects_hash(self, tmp_path):
        f = tmp_path / "file.py"
        f.write_text("content", encoding="utf-8")
        h1 = evidence_hash([f], [CommandResult("pytest", 0, "")])
        h2 = evidence_hash([f], [CommandResult("npm test", 0, "")])
        assert h1 != h2


# ── broad_command() ───────────────────────────────────────────────────────────


class TestBroadCommand:
    @pytest.mark.parametrize("cmd", [
        "pytest",
        "pytest -v --tb=short",
        "python -m unittest",
        "cargo test",
        "go test ./...",
        "dotnet test",
        "mvn test",
        "npm test",
        "npm run test",
        "pnpm test",
        "yarn test",
        "tox",
        "nox",
    ])
    def test_broad_commands(self, cmd):
        assert broad_command(cmd) is True

    @pytest.mark.parametrize("cmd", [
        "python main.py",
        "grep test file.py",
        "ls -la",
        "echo hello",
    ])
    def test_narrow_commands(self, cmd):
        assert broad_command(cmd) is False


# ── needs_command_evidence() ──────────────────────────────────────────────────


class TestNeedsCommandEvidence:
    def test_code_file(self):
        assert needs_command_evidence(Path("src/main.py")) is True

    def test_proof_file_excluded(self):
        assert needs_command_evidence(Path("QA-RECEIPT.md")) is False

    def test_non_code_extension(self):
        assert needs_command_evidence(Path("image.png")) is False

    def test_plain_md(self):
        assert needs_command_evidence(Path("README.md")) is False


# ── command_mentions_path() ───────────────────────────────────────────────────


class TestCommandMentionsPath:
    def test_path_in_command(self):
        cmd = CommandResult("pytest src/main.py", 0, "")
        assert command_mentions_path(cmd, Path("src/main.py")) is True

    def test_path_in_output(self):
        cmd = CommandResult("pytest", 0, "PASSED src/main.py::test_foo")
        assert command_mentions_path(cmd, Path("src/main.py")) is True

    def test_not_mentioned(self):
        cmd = CommandResult("pytest other.py", 0, "passed")
        assert command_mentions_path(cmd, Path("src/main.py")) is False

    def test_backslash_normalized(self):
        cmd = CommandResult("pytest src\\main.py", 0, "")
        assert command_mentions_path(cmd, Path("src/main.py")) is True

    def test_filename_only_match(self):
        cmd = CommandResult("pytest", 0, "PASSED main.py::test_foo")
        assert command_mentions_path(cmd, Path("src/main.py")) is True


# ── path_evidence_findings() ──────────────────────────────────────────────────


class TestPathEvidenceFindings:
    def test_no_commands_returns_empty(self):
        assert path_evidence_findings([], [Path("main.py")]) == []

    def test_broad_command_returns_empty(self):
        cmd = CommandResult("pytest", 0, "")
        assert path_evidence_findings([cmd], [Path("main.py")]) == []

    def test_narrow_command_missing_path(self):
        cmd = CommandResult("python check.py", 0, "ok")
        findings = path_evidence_findings([cmd], [Path("main.py")])
        assert any(fi.rule == "missing_path_evidence" for fi in findings)

    def test_narrow_command_mentions_path(self):
        cmd = CommandResult("python main.py", 0, "ok")
        assert path_evidence_findings([cmd], [Path("main.py")]) == []

    def test_proof_file_not_checked(self):
        cmd = CommandResult("python check.py", 0, "ok")
        assert path_evidence_findings([cmd], [Path("QA-RECEIPT.md")]) == []


# ── receipt() ─────────────────────────────────────────────────────────────────


class TestReceipt:
    def _make(self, monkeypatch, tmp_path, findings=None, commands=None, files=None, elapsed=0.1, **kwargs):
        monkeypatch.chdir(tmp_path)  # no .git → sha = "no-git"
        return receipt(findings or [], commands or [], files or [], elapsed, **kwargs)

    def test_contains_receipt_header(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="PASS")
        assert RECEIPT_HEADER in body

    def test_pass_status_in_header(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="PASS")
        assert f"{RECEIPT_HEADER} PASS" in body

    def test_no_git_uses_sentinel(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="PASS")
        assert "no-git" in body

    def test_git_uses_current_commit(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        (tmp_path / ".git").mkdir()
        with patch.object(qv, "current_commit", return_value="a1b2c3d"):
            body = receipt([], [], [], 0.1, status="PASS")
        assert "a1b2c3d" in body

    def test_base_ref_lines_present(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="PASS", base_ref="main", base_commit="deadbeef")
        assert "- base: `main`" in body
        assert "- base commit: `deadbeef`" in body

    def test_no_base_lines_absent(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="PASS")
        assert "- base:" not in body

    def test_findings_listed(self, monkeypatch, tmp_path):
        f = Finding("some_rule", "foo.py", 1, "bad thing")
        body = self._make(monkeypatch, tmp_path, findings=[f], status="FAIL")
        assert "some_rule" in body and "foo.py:1" in body

    def test_no_findings_shows_none(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="PASS")
        assert "## Findings" in body

    def test_with_commands(self, monkeypatch, tmp_path):
        cmd = CommandResult("pytest", 0, "2 passed")
        body = self._make(monkeypatch, tmp_path, commands=[cmd], status="PASS")
        assert "### `pytest`" in body and "2 passed" in body

    def test_no_commands(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="SKIPPED")
        assert "- none supplied" in body

    def test_skip_reasons_listed(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="SKIPPED", skip_reasons=["no test suite"])
        assert "no test suite" in body

    def test_files_listed(self, monkeypatch, tmp_path):
        f = tmp_path / "main.py"
        body = self._make(monkeypatch, tmp_path, files=[f], status="PASS")
        assert "main.py" in body

    def test_status_auto_assessed_when_none(self, monkeypatch, tmp_path):
        # No args → proof_findings → missing_evidence → FAIL
        body = self._make(monkeypatch, tmp_path)
        assert "FAIL" in body

    def test_output_ends_with_newline(self, monkeypatch, tmp_path):
        body = self._make(monkeypatch, tmp_path, status="PASS")
        assert body.endswith("\n")

    def test_command_output_truncated_to_4000(self, monkeypatch, tmp_path):
        long_out = "x" * 10_000
        cmd = CommandResult("pytest", 0, long_out)
        body = self._make(monkeypatch, tmp_path, commands=[cmd], status="PASS")
        assert "x" * 5000 not in body  # only last 4000 chars kept, not 10000


# ── proof_findings() ──────────────────────────────────────────────────────────


class TestProofFindings:
    def test_empty_everything_returns_missing_evidence(self):
        result = proof_findings([], [], [])
        assert len(result) == 1 and result[0].rule == "missing_evidence"

    def test_with_scan_findings_returned(self):
        f = Finding("rule", "path.py", 1, "text")
        result = proof_findings([f], [], [Path("file.py")])
        assert f in result

    def test_broad_command_no_findings_returns_empty(self):
        cmd = CommandResult("pytest", 0, "")
        assert proof_findings([], [cmd], []) == []

    def test_adds_path_evidence_findings(self):
        cmd = CommandResult("python check.py", 0, "")
        result = proof_findings([], [cmd], [Path("main.py")])
        assert any(fi.rule == "missing_path_evidence" for fi in result)


# ── assess() ──────────────────────────────────────────────────────────────────


class TestAssess:
    def test_fail_with_proof_findings(self):
        f = Finding("rule", "path.py", 1, "text")
        assert assess([f], [], [Path("file.py")]) == "FAIL"

    def test_fail_with_failed_command(self):
        cmd = CommandResult("pytest", 1, "FAILED")
        assert assess([], [cmd], [Path("a.py")]) == "FAIL"

    def test_skipped_with_skip_reasons(self):
        cmd = CommandResult("pytest", 0, "")
        assert assess([], [cmd], [], skip_reasons=["manual"]) == "SKIPPED"

    def test_skipped_files_no_commands(self):
        assert assess([], [], [Path("main.py")]) == "SKIPPED"

    def test_pass_with_broad_command(self):
        cmd = CommandResult("pytest", 0, "5 passed")
        assert assess([], [cmd], [Path("main.py")]) == "PASS"

    def test_fail_no_files_no_commands(self):
        assert assess([], [], []) == "FAIL"


# ── summary() ─────────────────────────────────────────────────────────────────


class TestSummary:
    def test_starts_with_status(self):
        assert summary("PASS", [], []).startswith("qa-verify: PASS")

    def test_includes_findings(self):
        f = Finding("rule", "path.py", 1, "bad thing")
        result = summary("FAIL", [f], [])
        assert "rule" in result and "path.py:1" in result

    def test_includes_skip_reasons(self):
        result = summary("SKIPPED", [], [], skip_reasons=["no tests"])
        assert "no tests" in result

    def test_failed_command_shown(self):
        cmd = CommandResult("pytest", 1, "5 failed")
        result = summary("FAIL", [], [cmd])
        assert "command failed: pytest" in result and "5 failed" in result

    def test_passing_command_not_shown(self):
        cmd = CommandResult("pytest", 0, "5 passed")
        assert "command failed" not in summary("PASS", [], [cmd])

    def test_ends_with_newline(self):
        assert summary("PASS", [], []).endswith("\n")


# ── parse_args() ──────────────────────────────────────────────────────────────


class TestParseArgs:
    def test_defaults(self):
        args = parse_args([])
        assert args.cmd == []
        assert args.write == "QA-RECEIPT.md"
        assert args.all is False
        assert args.base is None
        assert args.exclude == []
        assert args.skip_reason == []
        assert args.no_fail_on_findings is False

    def test_cmd_repeatable(self):
        args = parse_args(["--cmd", "pytest", "--cmd", "npm test"])
        assert args.cmd == ["pytest", "npm test"]

    def test_write_stdout(self):
        assert parse_args(["--write", "-"]).write == "-"

    def test_all_flag(self):
        assert parse_args(["--all"]).all is True

    def test_base_flag(self):
        assert parse_args(["--base", "origin/main"]).base == "origin/main"

    def test_exclude_repeatable(self):
        args = parse_args(["--exclude", "*.lock", "--exclude", "dist/*"])
        assert args.exclude == ["*.lock", "dist/*"]

    def test_skip_reason_repeatable(self):
        args = parse_args(["--skip-reason", "no tests", "--skip-reason", "manual"])
        assert args.skip_reason == ["no tests", "manual"]

    def test_no_fail_on_findings(self):
        assert parse_args(["--no-fail-on-findings"]).no_fail_on_findings is True

    def test_version_exits_zero(self, capsys):
        with pytest.raises(SystemExit) as exc:
            parse_args(["--version"])
        assert exc.value.code == 0
        assert VERSION in capsys.readouterr().out


# ── main() ────────────────────────────────────────────────────────────────────


class TestMain:
    def _patches(self, changed=None, stale=None, run_result=None):
        """Context manager stack for main() isolation."""
        changed = changed or []
        stale = stale or []
        run_result = run_result or CommandResult("pytest", 0, "ok")
        return (
            patch.object(qv, "changed_files", return_value=changed),
            patch.object(qv, "stale_input_files", return_value=stale),
            patch.object(qv, "run", return_value=run_result),
        )

    def test_pass_returns_0(self, capsys):
        with patch.object(qv, "changed_files", return_value=[]):
            with patch.object(qv, "stale_input_files", return_value=[]):
                with patch.object(qv, "run", return_value=CommandResult("pytest", 0, "ok")):
                    code = main(["--cmd", "pytest", "--write", "-"])
        assert code == 0

    def test_failed_cmd_returns_1(self, capsys):
        with patch.object(qv, "changed_files", return_value=[]):
            with patch.object(qv, "stale_input_files", return_value=[]):
                with patch.object(qv, "run", return_value=CommandResult("pytest", 1, "FAILED")):
                    code = main(["--cmd", "pytest", "--write", "-"])
        assert code == 1

    def test_write_to_file(self, tmp_path):
        receipt_path = tmp_path / "QA-RECEIPT.md"
        with patch.object(qv, "changed_files", return_value=[]):
            with patch.object(qv, "stale_input_files", return_value=[]):
                with patch.object(qv, "run", return_value=CommandResult("pytest", 0, "ok")):
                    with patch("builtins.print"):
                        main(["--cmd", "pytest", "--write", str(receipt_path)])
        assert receipt_path.exists()
        assert RECEIPT_HEADER in receipt_path.read_text()

    def test_write_to_stdout(self, capsys):
        with patch.object(qv, "changed_files", return_value=[]):
            with patch.object(qv, "stale_input_files", return_value=[]):
                with patch.object(qv, "run", return_value=CommandResult("pytest", 0, "ok")):
                    main(["--cmd", "pytest", "--write", "-"])
        assert RECEIPT_HEADER in capsys.readouterr().out

    def test_skip_reason_returns_1(self, capsys):
        with patch.object(qv, "changed_files", return_value=[]):
            with patch.object(qv, "stale_input_files", return_value=[]):
                code = main(["--skip-reason", "no tests", "--write", "-"])
        assert code == 1

    def test_no_fail_on_findings_returns_0(self, tmp_path):
        f = tmp_path / "code.py"
        f.write_text("# TODO fix\n", encoding="utf-8")
        with patch.object(qv, "changed_files", return_value=[f]):
            with patch.object(qv, "stale_input_files", return_value=[]):
                with patch.object(qv, "run", return_value=CommandResult("pytest", 0, "ok")):
                    with patch("builtins.print"):
                        code = main(["--cmd", "pytest", "--no-fail-on-findings", "--write", "-"])
        assert code == 0

    def test_no_cmd_auto_skip_reason(self, tmp_path, capsys):
        f = tmp_path / "code.py"
        f.write_text("hello\n")
        with patch.object(qv, "changed_files", return_value=[f]):
            with patch.object(qv, "stale_input_files", return_value=[]):
                code = main(["--write", "-"])
        assert code == 1
        assert "no verification command" in capsys.readouterr().out

    def test_all_flag_uses_ls_files(self):
        calls = []
        def fake_git_output(args):
            calls.append(args)
            return ""
        with patch.object(qv, "git_output", side_effect=fake_git_output):
            with patch.object(qv, "stale_input_files", return_value=[]):
                with patch.object(qv, "run", return_value=CommandResult("pytest", 0, "ok")):
                    with patch("builtins.print"):
                        main(["--all", "--cmd", "pytest", "--write", "-"])
        assert ["ls-files"] in calls

    def test_base_flag_calls_merge_base(self):
        with patch.object(qv, "merge_base", return_value="abc123") as mock_mb:
            with patch.object(qv, "git_output", return_value=""):
                with patch.object(qv, "stale_input_files", return_value=[]):
                    with patch("builtins.print"):
                        main(["--base", "origin/main", "--write", "-"])
        mock_mb.assert_called_once_with("origin/main")

    def test_argv_none_uses_sys_argv(self):
        """main(None) reads sys.argv[1:]."""
        with patch.object(sys, "argv", ["qa-verify", "--write", "-"]):
            with patch.object(qv, "changed_files", return_value=[]):
                with patch.object(qv, "stale_input_files", return_value=[]):
                    code = main(None)
        # no cmd, no files → no auto-skip → proof_findings empty → PASS? No: no files, no commands → missing_evidence → FAIL
        assert code == 1
