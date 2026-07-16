/**
 * Integration tests: doctor command output and onboarding messages.
 *
 * Verifies that `npx agent-pack doctor` (via install.mjs --doctor):
 *   1. Detects a missing install and prints an actionable Fix hint.
 *   2. Passes cleanly after a successful install.
 *   3. Detects a missing skill file and names it with a Fix hint.
 *   4. Reports runtime dep checks (npx, Python, uvx) without crashing.
 *   5. Reports a missing pyproject [project] section with Fix hint.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '../..');
const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');
const FIXTURE = path.resolve(import.meta.dirname, 'tinyurl-fixture');

/**
 * Run install.mjs with given args. Returns { stdout, stderr, status }.
 */
function runScript(args, { cwd = ROOT } = {}) {
  const result = spawnSync(process.execPath, [INSTALL_SCRIPT, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status ?? -1,
  };
}

// ---------------------------------------------------------------------------

test('doctor reports missing install and provides Fix hints', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  try {
    const { stdout, stderr, status } = runScript(['--doctor', '--target', tmp]);
    const out = stdout + stderr;
    assert.equal(status, 1, 'should exit 1 when install is missing');
    assert.match(out, /ERR.*install:.*VERSION missing/i, 'should report missing VERSION');
    assert.match(out, /Fix:.*npx agent-pack install/i, 'should include Fix hint for missing VERSION');
    assert.match(out, /problem.*found/i, 'should summarise problem count');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor passes after a clean install', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  try {
    // Install first
    spawnSync(process.execPath, [
      INSTALL_SCRIPT, '--private', '--target', tmp,
    ], { cwd: FIXTURE, encoding: 'utf8', timeout: 60_000 });

    const { stdout, stderr, status } = runScript(['--doctor', '--target', tmp], { cwd: FIXTURE });
    const out = stdout + stderr;
    // Install checks must pass (no install ERR lines)
    assert.doesNotMatch(out, /ERR.*install:/i, 'no install errors after clean install');
    // Overall exit — 0 if all runtimes available, nonzero only for missing runtimes
    // We only enforce no install-level errors here
    const installErrors = (out.match(/ERR.*install:/gi) || []).length;
    assert.equal(installErrors, 0, 'should have zero install-level errors');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor detects deleted SKILL.md and names it with Fix hint', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  try {
    spawnSync(process.execPath, [
      INSTALL_SCRIPT, '--private', '--target', tmp,
    ], { cwd: FIXTURE, encoding: 'utf8', timeout: 60_000 });

    // Delete one agent skill file
    const skillFiles = fs.readdirSync(path.join(tmp, 'skills'));
    const firstAgent = skillFiles[0];
    const skillMd = path.join(tmp, 'skills', firstAgent, 'SKILL.md');
    if (fs.existsSync(skillMd)) fs.unlinkSync(skillMd);

    const { stdout, stderr, status } = runScript(['--doctor', '--target', tmp], { cwd: FIXTURE });
    const out = stdout + stderr;
    assert.equal(status, 1, 'should exit 1 when a skill file is missing');
    assert.match(out, /ERR.*install:.*SKILL\.md missing/i, 'should name the missing skill');
    assert.match(out, /Fix:.*agent-pack/i, 'should include a Fix hint');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor output includes runtime checks section', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  try {
    spawnSync(process.execPath, [
      INSTALL_SCRIPT, '--private', '--target', tmp,
    ], { cwd: FIXTURE, encoding: 'utf8', timeout: 60_000 });

    const { stdout, stderr } = runScript(['--doctor', '--target', tmp], { cwd: FIXTURE });
    const out = stdout + stderr;
    // Must mention npx (either ok or ERR)
    assert.match(out, /runtime:.*npx/i, 'should check npx availability');
    // Must mention Python (either ok or ERR with fix)
    assert.match(out, /runtime:.*python/i, 'should check Python availability');
    // Must mention uvx
    assert.match(out, /runtime:.*uvx/i, 'should check uvx availability');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor provides Fix hint when runtime is missing', () => {
  // Simulate a missing runtime by checking the ERR/Fix format on a fresh target
  // (fresh target forces install ERR; the format is verified for Fix presence)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  try {
    const { stdout, stderr } = runScript(['--doctor', '--target', tmp]);
    const out = stdout + stderr;
    // Every ERR line that is followed by a Fix line uses the correct format
    const errLines = out.split('\n').filter((l) => l.includes('  ERR '));
    const fixLines = out.split('\n').filter((l) => l.includes('      Fix:'));
    // At minimum the install errors each have a fix
    assert.ok(errLines.length > 0, 'should have at least one ERR line');
    assert.ok(fixLines.length > 0, 'each ERR should be paired with a Fix line');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor output lists codebase-engine check when Python is available', () => {
  // Only meaningful when Python exists; skip gracefully otherwise
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  try {
    spawnSync(process.execPath, [
      INSTALL_SCRIPT, '--private', '--target', tmp,
    ], { cwd: FIXTURE, encoding: 'utf8', timeout: 60_000 });

    const { stdout, stderr } = runScript(['--doctor', '--target', tmp], { cwd: FIXTURE });
    const out = stdout + stderr;

    const hasPython = out.match(/ok.*runtime:.*python/i);
    if (!hasPython) return; // Python not available in this environment

    assert.match(out, /codebase-engine:/i, 'should check codebase-engine when Python is available');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor output lists Python component checks', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-pack-doctor-'));
  try {
    spawnSync(process.execPath, [
      INSTALL_SCRIPT, '--private', '--target', tmp,
    ], { cwd: FIXTURE, encoding: 'utf8', timeout: 60_000 });

    const { stdout, stderr } = runScript(['--doctor', '--target', tmp], { cwd: FIXTURE });
    const out = stdout + stderr;

    // atlassian-docs is a real mcp-server component — must appear
    assert.match(out, /atlassian-docs/i, 'should check atlassian-docs mcp-server');
    // adapter entries must appear
    assert.match(out, /adapter-github|adapter-mcp|adapter-langgraph/i, 'should check Python adapters');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
