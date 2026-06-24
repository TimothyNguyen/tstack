import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '../..');
const FIXTURE = path.resolve(import.meta.dirname, 'tinyurl-fixture');
const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');

function runInstall(targetDir, extraArgs = []) {
  execFileSync(process.execPath, [
    INSTALL_SCRIPT,
    '--private',
    '--target', targetDir,
    ...extraArgs,
  ], { cwd: FIXTURE, stdio: 'pipe' });
}

test('install into tinyurl fixture produces all expected artifacts', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-agent-'));
  try {
    runInstall(tmp);

    // Manifest exists and is valid JSON
    const manifestPath = path.join(tmp, 'install-manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'install-manifest.json missing');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.private, true, 'manifest.private must be true');
    assert.deepEqual(manifest.agents, ['swe', 'qa-agent', 'spec-agent', 'pm'],
      'manifest agents must match .agent-config.json');

    // VERSION written
    assert.ok(fs.existsSync(path.join(tmp, 'VERSION')), 'VERSION file missing');

    // Host artifacts written for all 3 hosts
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')), 'CLAUDE.md missing');
    assert.ok(fs.existsSync(path.join(tmp, 'AGENTS.md')), 'AGENTS.md missing');
    assert.ok(fs.existsSync(path.join(tmp, 'copilot-instructions.md')), 'copilot-instructions.md missing');

    // settings.json written with private mode
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.equal(settings.env.CLAUDE_CODE_DISABLE_AUTO_MEMORY, '1', 'auto-memory must be disabled');
    assert.ok('db' in settings.mcpServers, 'db MCP server must be wired');
    assert.ok(!('cavemem' in settings.mcpServers), 'cavemem must not be installed (private mode)');
    assert.ok(!('gbrain' in settings.mcpServers), 'gbrain must not be installed (private mode)');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('install dry-run writes nothing to disk', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-dry-'));
  try {
    runInstall(tmp, ['--dry-run']);
    const files = fs.readdirSync(tmp);
    assert.deepEqual(files, [], `dry-run must write nothing, but found: ${files.join(', ')}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor passes after install', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-doctor-'));
  try {
    runInstall(tmp);
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, [INSTALL_SCRIPT, '--doctor', '--target', tmp], {
        cwd: FIXTURE, stdio: 'pipe',
      });
    }, 'doctor must exit 0 after a clean install');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
