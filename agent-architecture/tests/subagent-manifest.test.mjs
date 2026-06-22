import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  createSubagentManifest,
  writeSubagentManifest,
  writeSubagentResult,
} from '../core/subagents.mjs';

test('subagent manifest normalizes a scoped implementer with no default egress', () => {
  const manifest = createSubagentManifest({
    id: 'implementer-auth-api',
    role: 'implementer',
    task: 'Add token refresh endpoint',
    allowedPaths: ['src/auth/**', 'tests/auth/**'],
    disallowedPaths: ['.env', 'secrets/**'],
    tools: ['shellRead', 'shellWrite', 'testExecution'],
  });

  assert.equal(manifest.id, 'implementer-auth-api');
  assert.equal(manifest.role, 'implementer');
  assert.equal(manifest.egress, 'disabled');
  assert.equal(manifest.writes, 'approval-required');
  assert.equal(manifest.output, 'summary-and-changed-files');
});

test('subagent manifest rejects write tools for read-only explorer', () => {
  assert.throws(() => createSubagentManifest({
    id: 'explorer-auth',
    role: 'explorer',
    task: 'Map auth flow',
    allowedPaths: ['src/auth/**'],
    tools: ['shellRead', 'shellWrite'],
  }), /explorer cannot use write tool shellWrite/);
});

test('subagent manifest requires scoped paths for write-capable roles', () => {
  assert.throws(() => createSubagentManifest({
    id: 'implementer-unscoped',
    role: 'implementer',
    task: 'Change auth flow',
    tools: ['shellRead', 'shellWrite'],
  }), /requires at least one allowed path/);
});

test('subagent manifest rejects secret-like manifest fields', () => {
  assert.throws(() => createSubagentManifest({
    id: 'planner-secret',
    role: 'planner',
    task: 'Plan work',
    allowedPaths: ['docs/**'],
    tools: ['shellRead'],
    token: 'abc',
  }), /forbidden field token/);
});

test('subagent manifest supports read-only devtools agent for Playwright evidence', () => {
  const manifest = createSubagentManifest({
    id: 'devtools-local-ui',
    role: 'devtools-agent',
    task: 'Inspect local UI buttons with Playwright and collect console evidence',
    tools: ['browserRead', 'devtoolsInspect', 'playwrightCli'],
  });

  assert.equal(manifest.role, 'devtools-agent');
  assert.equal(manifest.egress, 'disabled');
  assert.equal(manifest.writes, 'disabled');
  assert.equal(manifest.output, 'summary-and-evidence');
});

test('subagent artifacts stay under declared repo-local directory and redact results', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagents-'));
  const manifest = createSubagentManifest({
    id: 'test-engineer-auth',
    role: 'test-engineer',
    task: 'Add auth tests',
    allowedPaths: ['tests/auth/**'],
    tools: ['shellRead', 'shellWrite', 'testExecution'],
  });

  const manifestWrite = writeSubagentManifest(manifest, { baseDir });
  assert.ok(manifestWrite.path.endsWith(path.join(
    '.architecture-agent',
    'subagents',
    'test-engineer-auth',
    'manifest.json',
  )));

  const resultWrite = writeSubagentResult('test-engineer-auth', {
    status: 'completed',
    changedFiles: ['tests/auth/token-refresh.test.ts'],
    tests: [{ command: 'npm test', result: 'pass' }],
    password: 'secret',
  }, { baseDir });

  const result = JSON.parse(fs.readFileSync(resultWrite.path, 'utf8'));
  assert.equal(result.status, 'completed');
  assert.equal(result.password, '[REDACTED]');

  fs.rmSync(baseDir, { recursive: true, force: true });
});
