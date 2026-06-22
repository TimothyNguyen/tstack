import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { allocateSubagentWorktree } from '../core/subagent-worktrees.mjs';

const root = path.resolve(import.meta.dirname, '..');

function git(repo, args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
}

function makeRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagent-import-cli-'));
  git(repo, ['init']);
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Test User']);
  fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'src', 'auth.js'), 'export const value = 1;\n', 'utf8');
  git(repo, ['add', 'src/auth.js']);
  git(repo, ['commit', '-m', 'init']);
  return repo;
}

test('subagent import CLI applies an accepted worktree patch', () => {
  const repo = makeRepo();
  const allocation = allocateSubagentWorktree({
    id: 'implementer-auth',
    role: 'implementer',
    task: 'Patch auth flow',
    allowedPaths: ['src/**'],
    tools: ['shellRead', 'shellWrite'],
  }, { baseDir: repo });

  fs.writeFileSync(path.join(allocation.worktreePath, 'src', 'auth.js'), 'export const value = 9;\n', 'utf8');

  const raw = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'subagent-import.mjs'),
    'apply',
    'implementer-auth',
    '--base-dir',
    repo,
  ], { encoding: 'utf8' });
  const result = JSON.parse(raw);

  assert.equal(result.status, 'applied');
  assert.equal(
    fs.readFileSync(path.join(repo, 'src', 'auth.js'), 'utf8').replace(/\r\n/g, '\n'),
    'export const value = 9;\n',
  );

  git(repo, ['worktree', 'remove', '--force', allocation.worktreePath]);
  fs.rmSync(repo, { recursive: true, force: true });
});

test('subagent import CLI accepts npm-safe positional base dir', () => {
  const repo = makeRepo();
  const allocation = allocateSubagentWorktree({
    id: 'implementer-auth',
    role: 'implementer',
    task: 'Patch auth flow',
    allowedPaths: ['src/**'],
    tools: ['shellRead', 'shellWrite'],
  }, { baseDir: repo });

  fs.writeFileSync(path.join(allocation.worktreePath, 'src', 'auth.js'), 'export const value = 10;\n', 'utf8');

  const raw = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'subagent-import.mjs'),
    'apply',
    'implementer-auth',
    repo,
  ], { encoding: 'utf8' });
  const result = JSON.parse(raw);

  assert.equal(result.status, 'applied');
  assert.equal(
    fs.readFileSync(path.join(repo, 'src', 'auth.js'), 'utf8').replace(/\r\n/g, '\n'),
    'export const value = 10;\n',
  );

  git(repo, ['worktree', 'remove', '--force', allocation.worktreePath]);
  fs.rmSync(repo, { recursive: true, force: true });
});
