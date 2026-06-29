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
  parseChangedFiles,
  readAllocation,
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

test('readAllocation throws when allocation file is missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-no-alloc-'));
  try {
    assert.throws(
      () => readAllocation('nonexistent-agent', { baseDir: dir }),
      /Missing subagent allocation/,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('readAllocation uses default baseDir when option not provided', () => {
  assert.throws(() => readAllocation('nonexistent-default-xq'), /Missing subagent allocation/);
});

test('allocateSubagentWorktree skips git-worktree-add when worktree already exists', () => {
  const repo = makeRepo();
  const manifest = createSubagentManifest({
    id: 'implementer-realloc',
    role: 'implementer',
    task: 'Re-allocate test',
    allowedPaths: ['src/**'],
    tools: ['shellRead', 'shellWrite'],
  });

  const first = allocateSubagentWorktree(manifest, { baseDir: repo });
  assert.equal(fs.existsSync(first.worktreePath), true);

  const second = allocateSubagentWorktree(manifest, { baseDir: repo });
  assert.equal(second.id, 'implementer-realloc');
  assert.equal(second.worktreePath, first.worktreePath);

  git(repo, ['worktree', 'remove', '--force', first.worktreePath]);
  fs.rmSync(repo, { recursive: true, force: true });
});

test('cleanupSubagentWorktree skips git-remove when worktree path does not exist', () => {
  const repo = makeRepo();
  const allocationDir = path.join(repo, '.architecture-agent', 'subagents', 'implementer-phantom');
  fs.mkdirSync(allocationDir, { recursive: true });
  const phantomWorktree = path.join(repo, '.architecture-agent', 'subagents', 'implementer-phantom', 'worktree');
  fs.writeFileSync(path.join(allocationDir, 'allocation.json'), JSON.stringify({
    id: 'implementer-phantom',
    role: 'implementer',
    branch: 'architecture-agent/implementer-phantom',
    baseRef: 'HEAD',
    worktreePath: phantomWorktree,
    status: 'allocated',
  }), 'utf8');

  const result = cleanupSubagentWorktree('implementer-phantom', { baseDir: repo });
  assert.equal(result.status, 'cleaned');
  fs.rmSync(repo, { recursive: true, force: true });
});

test('parseChangedFiles returns empty array for empty or null status output', () => {
  assert.deepEqual(parseChangedFiles(''), []);
  assert.deepEqual(parseChangedFiles(null), []);
});

test('parseChangedFiles handles rename arrow notation', () => {
  const result = parseChangedFiles('R  src/old-auth.ts -> src/auth.ts');
  assert.deepEqual(result, ['src/auth.ts']);
});

test('parseChangedFiles sorts and deduplicates output', () => {
  const result = parseChangedFiles('?? zebra.ts\n?? alpha.ts');
  assert.deepEqual(result, ['alpha.ts', 'zebra.ts']);
});
