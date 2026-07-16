/**
 * Unit tests for doctor() runtime-check helpers added to install.mjs.
 *
 * Tests cover: tryExec, detectPython, parsePyprojectName,
 * collectPythonComponents, and the new doctor output format.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  tryExec,
  detectPython,
  parsePyprojectName,
  collectPythonComponents,
} from '../scripts/install.mjs';

// ---------------------------------------------------------------------------
// tryExec
// ---------------------------------------------------------------------------

test('tryExec returns true for a command that succeeds', () => {
  // 'node --version' is always available since we are running in Node
  assert.equal(tryExec('node', ['--version']), true);
});

test('tryExec returns false for a command that does not exist', () => {
  assert.equal(tryExec('__nonexistent_binary_xyzzy__', ['--version']), false);
});

test('tryExec returns false for a command that exits nonzero', () => {
  // 'node -e "process.exit(1)"' exits 1
  assert.equal(tryExec('node', ['-e', 'process.exit(1)']), false);
});

// ---------------------------------------------------------------------------
// detectPython
// ---------------------------------------------------------------------------

test('detectPython returns a string or null (never throws)', () => {
  const result = detectPython();
  assert.ok(result === null || typeof result === 'string', 'must be string or null');
});

test('detectPython result, if non-null, is a runnable binary', () => {
  const bin = detectPython();
  if (bin === null) return; // Python not installed in this environment — skip
  // Must be able to get a version string
  assert.equal(tryExec(bin, ['--version']), true);
});

// ---------------------------------------------------------------------------
// parsePyprojectName
// ---------------------------------------------------------------------------

test('parsePyprojectName extracts name from valid pyproject.toml', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  const p = path.join(tmp, 'pyproject.toml');
  fs.writeFileSync(p, '[project]\nname = "my-package"\nversion = "1.0.0"\n');
  assert.equal(parsePyprojectName(p), 'my-package');
  fs.rmSync(tmp, { recursive: true });
});

test('parsePyprojectName handles single-quoted names', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  const p = path.join(tmp, 'pyproject.toml');
  fs.writeFileSync(p, "[project]\nname = 'single-quoted'\nversion = '0.1.0'\n");
  assert.equal(parsePyprojectName(p), 'single-quoted');
  fs.rmSync(tmp, { recursive: true });
});

test('parsePyprojectName returns null when no name field', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  const p = path.join(tmp, 'pyproject.toml');
  fs.writeFileSync(p, '[project]\nversion = "1.0.0"\n');
  assert.equal(parsePyprojectName(p), null);
  fs.rmSync(tmp, { recursive: true });
});

test('parsePyprojectName returns null for empty file', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  const p = path.join(tmp, 'pyproject.toml');
  fs.writeFileSync(p, '');
  assert.equal(parsePyprojectName(p), null);
  fs.rmSync(tmp, { recursive: true });
});

// ---------------------------------------------------------------------------
// collectPythonComponents
// ---------------------------------------------------------------------------

test('collectPythonComponents returns array (never throws)', () => {
  const result = collectPythonComponents();
  assert.ok(Array.isArray(result));
});

test('collectPythonComponents each entry has kind, name, pyproject fields', () => {
  const result = collectPythonComponents();
  for (const comp of result) {
    assert.ok(['mcp-server', 'adapter'].includes(comp.kind), `unexpected kind: ${comp.kind}`);
    assert.equal(typeof comp.name, 'string');
    assert.equal(typeof comp.pyproject, 'string');
    assert.ok(fs.existsSync(comp.pyproject), `pyproject missing: ${comp.pyproject}`);
  }
});

test('collectPythonComponents discovers atlassian-docs mcp-server', () => {
  const result = collectPythonComponents();
  const atlassian = result.find((c) => c.name === 'atlassian-docs' && c.kind === 'mcp-server');
  assert.ok(atlassian, 'atlassian-docs mcp-server should be discovered');
  assert.ok(atlassian.pyproject.endsWith('pyproject.toml'));
});

test('collectPythonComponents discovers Python adapters', () => {
  const result = collectPythonComponents();
  const adapters = result.filter((c) => c.kind === 'adapter');
  // There are multiple adapter-* directories with pyproject.toml
  assert.ok(adapters.length >= 1, 'should find at least one Python adapter');
  for (const a of adapters) {
    assert.ok(a.name.startsWith('adapter-'), `adapter name should start with "adapter-": ${a.name}`);
  }
});

test('collectPythonComponents all pyproject.toml files have [project] section', () => {
  const result = collectPythonComponents();
  const broken = result.filter((c) => {
    const content = fs.readFileSync(c.pyproject, 'utf8');
    return !content.includes('[project]');
  });
  assert.deepEqual(
    broken.map((c) => c.name),
    [],
    `pyproject.toml files missing [project] section: ${broken.map((c) => c.name).join(', ')}`,
  );
});

test('collectPythonComponents all pyproject.toml files have parseable name', () => {
  const result = collectPythonComponents();
  const noName = result.filter((c) => parsePyprojectName(c.pyproject) === null);
  assert.deepEqual(
    noName.map((c) => c.name),
    [],
    `pyproject.toml files with no parseable name: ${noName.map((c) => c.name).join(', ')}`,
  );
});
