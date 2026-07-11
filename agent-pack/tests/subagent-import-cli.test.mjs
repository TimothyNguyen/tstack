import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { allocateSubagentWorktree } from '../core/subagent-worktrees.mjs';
import { main, parseArgs, run } from '../scripts/subagent-import.mjs';

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

test('parseArgs throws for invalid command', () => {
  assert.throws(() => parseArgs(['badcommand', 'myid']), /Usage:/);
});

test('parseArgs throws for missing agent id', () => {
  assert.throws(() => parseArgs(['export']), /Missing agent id/);
});

test('parseArgs handles -- separator and still reads following flags', () => {
  const args = parseArgs(['export', 'myid', '--', '--base-dir', '/tmp/repo']);
  assert.equal(args.command, 'export');
  assert.equal(args.id, 'myid');
  assert.equal(args.baseDir, '/tmp/repo');
});

test('parseArgs parses --reason flag', () => {
  const args = parseArgs(['reject', 'myid', '--reason', 'bad approach']);
  assert.equal(args.reason, 'bad approach');
});

test('parseArgs throws for unknown flag', () => {
  assert.throws(() => parseArgs(['export', 'myid', '--unknown-flag']), /Unknown argument/);
});

test('parseArgs accepts positional base dir and reason as positional arguments', () => {
  const args = parseArgs(['reject', 'myid', '/some/repo', 'too risky and complex']);
  assert.equal(args.command, 'reject');
  assert.equal(args.id, 'myid');
  assert.equal(args.baseDir, '/some/repo');
  assert.equal(args.reason, 'too risky and complex');
});

test('main() catches errors and sets exitCode to 1', () => {
  const prevArgv = process.argv;
  const prevExitCode = process.exitCode;
  process.argv = ['node', 'subagent-import.mjs', 'export', 'nonexistent-agent-id'];
  try {
    main();
    assert.equal(process.exitCode, 1);
  } finally {
    process.argv = prevArgv;
    process.exitCode = prevExitCode;
  }
});

test('run() calls reject for reject command', () => {
  const repo = makeRepo();
  const allocation = allocateSubagentWorktree({
    id: 'implementer-reject',
    role: 'implementer',
    task: 'Test reject',
    allowedPaths: ['src/**'],
    tools: ['shellRead'],
  }, { baseDir: repo });

  fs.writeFileSync(path.join(allocation.worktreePath, 'src', 'auth.js'), 'export const value = 99;\n', 'utf8');

  const result = run({ command: 'reject', id: 'implementer-reject', baseDir: repo, reason: 'too risky' });
  assert.equal(result.status, 'rejected');
  assert.equal(
    fs.readFileSync(path.join(repo, 'src', 'auth.js'), 'utf8'),
    'export const value = 1;\n',
  );

  git(repo, ['worktree', 'remove', '--force', allocation.worktreePath]);
  fs.rmSync(repo, { recursive: true, force: true });
});
