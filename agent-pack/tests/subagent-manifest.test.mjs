import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  createSubagentManifest,
  validateSubagentManifest,
  writeSubagentManifest,
  writeSubagentResult,
  verifySubagentPaths,
  globToRegex,
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
    '.agent-pack',
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

// ── verifySubagentPaths ──────────────────────────────────────────────────────

test('globToRegex matches double-star patterns', () => {
  const re = globToRegex('src/auth/**');
  assert.ok(re.test('src/auth/routes.ts'));
  assert.ok(re.test('src/auth/nested/deep/file.ts'));
  assert.ok(!re.test('src/other/file.ts'));
  assert.ok(!re.test('tests/auth/file.ts'));
});

test('globToRegex matches single-star patterns', () => {
  const re = globToRegex('src/*/index.ts');
  assert.ok(re.test('src/auth/index.ts'));
  assert.ok(!re.test('src/auth/nested/index.ts'));
  assert.ok(!re.test('tests/auth/index.ts'));
});

test('globToRegex handles exact file patterns', () => {
  const re = globToRegex('.env');
  assert.ok(re.test('.env'));
  assert.ok(!re.test('src/.env'));
  assert.ok(!re.test('.env.local'));
});

test('verifySubagentPaths passes when all files are in allowedPaths', () => {
  const manifest = {
    id: 'implementer-auth',
    role: 'implementer',
    task: 'Implement auth module',
    allowedPaths: ['src/auth/**', 'tests/auth/**'],
    tools: ['shellRead', 'shellWrite'],
  };
  const result = verifySubagentPaths(manifest, [
    'src/auth/routes.ts',
    'src/auth/middleware.ts',
    'tests/auth/routes.test.ts',
  ]);
  assert.ok(result.ok);
  assert.deepEqual(result.violations, []);
});

test('verifySubagentPaths reports files outside allowedPaths', () => {
  const manifest = {
    id: 'implementer-auth',
    role: 'implementer',
    task: 'Implement auth module',
    allowedPaths: ['src/auth/**'],
    tools: ['shellRead', 'shellWrite'],
  };
  const result = verifySubagentPaths(manifest, [
    'src/auth/routes.ts',
    'src/billing/invoice.ts',
    'package.json',
  ]);
  assert.ok(!result.ok);
  assert.equal(result.violations.length, 2);
  assert.ok(result.violations.some((v) => v.file === 'src/billing/invoice.ts'));
  assert.ok(result.violations.some((v) => v.file === 'package.json'));
  assert.ok(result.violations.every((v) => v.reason === 'outside allowedPaths'));
});

test('verifySubagentPaths blocks files matching disallowedPaths', () => {
  const manifest = {
    id: 'implementer-full',
    role: 'implementer',
    task: 'Implement feature',
    allowedPaths: ['src/**'],
    disallowedPaths: ['.env', 'secrets/**'],
    tools: ['shellRead', 'shellWrite'],
  };
  const result = verifySubagentPaths(manifest, [
    'src/app.ts',
    '.env',
    'secrets/api-key.txt',
  ]);
  assert.ok(!result.ok);
  assert.equal(result.violations.length, 2);
  assert.ok(result.violations.every((v) => v.reason === 'matches disallowedPaths'));
});

test('verifySubagentPaths normalizes Windows-style backslash paths', () => {
  const manifest = {
    id: 'implementer-win',
    role: 'implementer',
    task: 'Windows path test',
    allowedPaths: ['src/auth/**'],
    tools: ['shellRead', 'shellWrite'],
  };
  const result = verifySubagentPaths(manifest, ['src\\auth\\routes.ts']);
  assert.ok(result.ok, 'should accept backslash paths normalized to forward slash');
});

test('verifySubagentPaths allows everything when allowedPaths is empty (coordinator)', () => {
  const manifest = {
    id: 'coordinator-main',
    role: 'coordinator',
    task: 'Coordinate feature',
    tools: ['shellRead'],
  };
  const result = verifySubagentPaths(manifest, ['src/any/file.ts', 'another/file.ts']);
  assert.ok(result.ok, 'coordinator with no allowedPaths should not block any file');
});

// ── validation error paths ────────────────────────────────────────────────────

test('validateSubagentManifest rejects non-object input', () => {
  assert.throws(() => validateSubagentManifest('not-an-object'), /must be an object/);
  assert.throws(() => validateSubagentManifest(null), /must be an object/);
});

test('subagent manifest rejects invalid id format', () => {
  assert.throws(() => createSubagentManifest({
    id: 'INVALID_ID',
    role: 'planner',
    task: 'Plan work',
    allowedPaths: ['docs/**'],
    tools: ['shellRead'],
  }), /Invalid subagent id/);
});

test('subagent manifest rejects id that is too short', () => {
  assert.throws(() => createSubagentManifest({
    id: 'x',
    role: 'planner',
    task: 'Plan work',
    allowedPaths: ['docs/**'],
    tools: ['shellRead'],
  }), /Invalid subagent id/);
});

test('subagent manifest rejects empty task string', () => {
  assert.throws(() => createSubagentManifest({
    id: 'planner-work',
    role: 'planner',
    task: '   ',
    allowedPaths: ['docs/**'],
    tools: ['shellRead'],
  }), /requires a task/);
});

test('subagent manifest rejects non-string task', () => {
  assert.throws(() => createSubagentManifest({
    id: 'planner-work',
    role: 'planner',
    task: 42,
    allowedPaths: ['docs/**'],
    tools: ['shellRead'],
  }), /requires a task/);
});

test('subagent manifest rejects non-array allowedPaths', () => {
  assert.throws(() => createSubagentManifest({
    id: 'planner-work',
    role: 'planner',
    task: 'Plan work',
    allowedPaths: 'src/**',
    tools: ['shellRead'],
  }), /must be an array/);
});

test('subagent manifest rejects allowedPaths with empty string element', () => {
  assert.throws(() => createSubagentManifest({
    id: 'planner-work',
    role: 'planner',
    task: 'Plan work',
    allowedPaths: ['src/**', ''],
    tools: ['shellRead'],
  }), /must be an array of non-empty strings/);
});

test('subagent manifest rejects unknown tool', () => {
  assert.throws(() => createSubagentManifest({
    id: 'planner-work',
    role: 'planner',
    task: 'Plan work',
    allowedPaths: ['docs/**'],
    tools: ['shellRead', 'teleportation'],
  }), /Unknown subagent tool/);
});

test('subagent manifest rejects non-disabled egress', () => {
  assert.throws(() => createSubagentManifest({
    id: 'planner-work',
    role: 'planner',
    task: 'Plan work',
    allowedPaths: ['docs/**'],
    tools: ['shellRead'],
    egress: 'enabled',
  }), /egress must be disabled/);
});

test('subagent manifest rejects unknown role', () => {
  assert.throws(() => createSubagentManifest({
    id: 'planner-work',
    role: 'hacker',
    task: 'Do hacking',
    tools: ['shellRead'],
  }), /Unknown subagent role/);
});

test('writeSubagentResult rejects non-object result', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagents-result-'));
  try {
    assert.throws(
      () => writeSubagentResult('planner-ab', 'not-an-object', { baseDir }),
      /result must be an object/,
    );
  } finally {
    fs.rmSync(baseDir, { recursive: true, force: true });
  }
});
