import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createSubagentManifest, writeSubagentManifest } from '../core/subagents.mjs';
import {
  allocateSubagentWorktree,
  cleanupSubagentWorktree,
  collectSubagentWorktreeResult,
} from '../core/subagent-worktrees.mjs';

function git(repo, args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
}

function makeRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagent-wt-'));
  git(repo, ['init']);
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Test User']);
  fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'src', 'auth.js'), 'export const value = 1;\n', 'utf8');
  git(repo, ['add', 'src/auth.js']);
  git(repo, ['commit', '-m', 'init']);
  return repo;
}

test('allocateSubagentWorktree creates isolated worktree under declared subagent directory', () => {
  const repo = makeRepo();
  const manifest = createSubagentManifest({
    id: 'implementer-auth',
    role: 'implementer',
    task: 'Patch auth flow',
    allowedPaths: ['src/**', 'tests/**'],
    tools: ['shellRead', 'shellWrite', 'testExecution'],
  });
  writeSubagentManifest(manifest, { baseDir: repo });

  const allocation = allocateSubagentWorktree(manifest, { baseDir: repo });
  assert.equal(allocation.id, 'implementer-auth');
  assert.equal(allocation.branch, 'architecture-agent/implementer-auth');
  assert.equal(
    path.relative(path.join(repo, '.architecture-agent', 'subagents', 'implementer-auth'), allocation.worktreePath).startsWith('..'),
    false,
  );
  assert.equal(fs.existsSync(path.join(allocation.worktreePath, 'src', 'auth.js')), true);
  assert.equal(fs.existsSync(path.join(repo, '.architecture-agent', 'subagents', 'implementer-auth', 'allocation.json')), true);

  cleanupSubagentWorktree('implementer-auth', { baseDir: repo });
  fs.rmSync(repo, { recursive: true, force: true });
});

test('collectSubagentWorktreeResult records changed files from isolated worktree', () => {
  const repo = makeRepo();
  const manifest = createSubagentManifest({
    id: 'test-engineer-auth',
    role: 'test-engineer',
    task: 'Add auth tests',
    allowedPaths: ['tests/**'],
    tools: ['shellRead', 'shellWrite', 'testExecution'],
  });
  const allocation = allocateSubagentWorktree(manifest, { baseDir: repo });
  fs.mkdirSync(path.join(allocation.worktreePath, 'tests'), { recursive: true });
  fs.writeFileSync(path.join(allocation.worktreePath, 'tests', 'auth.test.js'), 'assert.ok(true);\n', 'utf8');

  const result = collectSubagentWorktreeResult('test-engineer-auth', { baseDir: repo });
  assert.equal(result.status, 'completed');
  assert.deepEqual(result.changedFiles, ['tests/auth.test.js']);
  assert.equal(fs.existsSync(path.join(repo, '.architecture-agent', 'subagents', 'test-engineer-auth', 'result.json')), true);

  cleanupSubagentWorktree('test-engineer-auth', { baseDir: repo });
  fs.rmSync(repo, { recursive: true, force: true });
});

test('allocateSubagentWorktree rejects read-only roles', () => {
  const repo = makeRepo();
  const manifest = createSubagentManifest({
    id: 'explorer-auth',
    role: 'explorer',
    task: 'Map auth flow',
    allowedPaths: ['src/**'],
    tools: ['shellRead'],
  });

  assert.throws(() => allocateSubagentWorktree(manifest, { baseDir: repo }), /does not allow worktree writes/);
  fs.rmSync(repo, { recursive: true, force: true });
});
