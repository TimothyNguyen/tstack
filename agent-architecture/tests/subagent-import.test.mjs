import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { allocateSubagentWorktree } from '../core/subagent-worktrees.mjs';
import {
  applySubagentPatch,
  exportSubagentPatch,
  rejectSubagentPatch,
} from '../core/subagent-import.mjs';

function git(repo, args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
}

function makeRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagent-import-'));
  git(repo, ['init']);
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Test User']);
  fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'src', 'auth.js'), 'export const value = 1;\n', 'utf8');
  git(repo, ['add', 'src/auth.js']);
  git(repo, ['commit', '-m', 'init']);
  return repo;
}

test('applySubagentPatch imports accepted worktree changes into coordinator repo', () => {
  const repo = makeRepo();
  const allocation = allocateSubagentWorktree({
    id: 'implementer-auth',
    role: 'implementer',
    task: 'Patch auth flow',
    allowedPaths: ['src/**'],
    tools: ['shellRead', 'shellWrite'],
  }, { baseDir: repo });

  fs.writeFileSync(path.join(allocation.worktreePath, 'src', 'auth.js'), 'export const value = 2;\n', 'utf8');

  const exported = exportSubagentPatch('implementer-auth', { baseDir: repo });
  assert.equal(exported.changedFiles[0], 'src/auth.js');
  assert.equal(fs.existsSync(exported.patchPath), true);

  const applied = applySubagentPatch('implementer-auth', { baseDir: repo });
  assert.equal(applied.status, 'applied');
  assert.equal(
    fs.readFileSync(path.join(repo, 'src', 'auth.js'), 'utf8').replace(/\r\n/g, '\n'),
    'export const value = 2;\n',
  );

  git(repo, ['worktree', 'remove', '--force', allocation.worktreePath]);
  fs.rmSync(repo, { recursive: true, force: true });
});

test('applySubagentPatch rejects changes outside allowed paths', () => {
  const repo = makeRepo();
  const allocation = allocateSubagentWorktree({
    id: 'implementer-auth',
    role: 'implementer',
    task: 'Patch auth flow',
    allowedPaths: ['src/**'],
    tools: ['shellRead', 'shellWrite'],
  }, { baseDir: repo });

  fs.writeFileSync(path.join(allocation.worktreePath, 'README.md'), 'not allowed\n', 'utf8');

  assert.throws(() => applySubagentPatch('implementer-auth', { baseDir: repo }), /outside allowed paths/);
  assert.equal(fs.existsSync(path.join(repo, 'README.md')), false);

  git(repo, ['worktree', 'remove', '--force', allocation.worktreePath]);
  fs.rmSync(repo, { recursive: true, force: true });
});

test('rejectSubagentPatch records rejection and leaves coordinator repo unchanged', () => {
  const repo = makeRepo();
  const allocation = allocateSubagentWorktree({
    id: 'implementer-auth',
    role: 'implementer',
    task: 'Patch auth flow',
    allowedPaths: ['src/**'],
    tools: ['shellRead', 'shellWrite'],
  }, { baseDir: repo });

  fs.writeFileSync(path.join(allocation.worktreePath, 'src', 'auth.js'), 'export const value = 3;\n', 'utf8');

  const rejected = rejectSubagentPatch('implementer-auth', 'wrong approach', { baseDir: repo });
  assert.equal(rejected.status, 'rejected');
  assert.equal(fs.readFileSync(path.join(repo, 'src', 'auth.js'), 'utf8'), 'export const value = 1;\n');
  assert.equal(fs.existsSync(path.join(repo, '.architecture-agent', 'subagents', 'implementer-auth', 'rejection.json')), true);

  git(repo, ['worktree', 'remove', '--force', allocation.worktreePath]);
  fs.rmSync(repo, { recursive: true, force: true });
});
