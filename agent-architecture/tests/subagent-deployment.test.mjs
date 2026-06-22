import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

test('subagent deployment CLI writes manifests and deployment summary', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagent-deploy-'));
  const planFile = path.join(baseDir, 'subagents.json');
  fs.writeFileSync(planFile, JSON.stringify({
    agents: [
      {
        id: 'explorer-auth',
        role: 'explorer',
        task: 'Map auth flow',
        allowedPaths: ['src/auth/**'],
        tools: ['shellRead'],
      },
      {
        id: 'implementer-auth',
        role: 'implementer',
        task: 'Patch auth flow',
        allowedPaths: ['src/auth/**', 'tests/auth/**'],
        tools: ['shellRead', 'shellWrite', 'testExecution'],
      },
    ],
  }), 'utf8');

  const raw = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'subagent-deploy.mjs'),
    '--from-file',
    planFile,
    '--base-dir',
    baseDir,
  ], { encoding: 'utf8' });

  const output = JSON.parse(raw);
  assert.equal(output.count, 2);
  assert.equal(output.manifests.length, 2);
  assert.equal(output.summaryPath.endsWith(path.join('.architecture-agent', 'subagents', 'deployment.json')), true);

  const implementerManifest = JSON.parse(fs.readFileSync(path.join(
    baseDir,
    '.architecture-agent',
    'subagents',
    'implementer-auth',
    'manifest.json',
  ), 'utf8'));
  assert.equal(implementerManifest.egress, 'disabled');
  assert.equal(implementerManifest.writes, 'approval-required');

  fs.rmSync(baseDir, { recursive: true, force: true });
});

test('subagent deployment CLI can allocate write-capable worktrees', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagent-deploy-wt-'));
  execFileSync('git', ['init'], { cwd: baseDir });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: baseDir });
  execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: baseDir });
  fs.mkdirSync(path.join(baseDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(baseDir, 'src', 'auth.js'), 'export const value = 1;\n', 'utf8');
  execFileSync('git', ['add', 'src/auth.js'], { cwd: baseDir });
  execFileSync('git', ['commit', '-m', 'init'], { cwd: baseDir });

  const planFile = path.join(baseDir, 'subagents.json');
  fs.writeFileSync(planFile, JSON.stringify({
    agents: [
      {
        id: 'implementer-auth',
        role: 'implementer',
        task: 'Patch auth flow',
        allowedPaths: ['src/**'],
        tools: ['shellRead', 'shellWrite'],
      },
    ],
  }), 'utf8');

  const raw = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'subagent-deploy.mjs'),
    '--from-file',
    planFile,
    '--base-dir',
    baseDir,
    '--allocate-worktrees',
  ], { encoding: 'utf8' });

  const output = JSON.parse(raw);
  assert.equal(output.allocations.length, 1);
  assert.equal(fs.existsSync(path.join(
    baseDir,
    '.architecture-agent',
    'subagents',
    'implementer-auth',
    'worktree',
    'src',
    'auth.js',
  )), true);

  execFileSync('git', ['worktree', 'remove', '--force', output.allocations[0].worktreePath], { cwd: baseDir });
  fs.rmSync(baseDir, { recursive: true, force: true });
});

test('subagent deployment CLI accepts npm-safe positional arguments', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagent-deploy-positional-'));
  execFileSync('git', ['init'], { cwd: baseDir });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: baseDir });
  execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: baseDir });
  fs.mkdirSync(path.join(baseDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(baseDir, 'src', 'auth.js'), 'export const value = 1;\n', 'utf8');
  execFileSync('git', ['add', 'src/auth.js'], { cwd: baseDir });
  execFileSync('git', ['commit', '-m', 'init'], { cwd: baseDir });

  const planFile = path.join(baseDir, 'subagents.json');
  fs.writeFileSync(planFile, JSON.stringify([
    {
      id: 'implementer-auth',
      role: 'implementer',
      task: 'Patch auth flow',
      allowedPaths: ['src/**'],
      tools: ['shellRead', 'shellWrite'],
    },
  ]), 'utf8');

  const raw = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'subagent-deploy.mjs'),
    planFile,
    baseDir,
    'allocate-worktrees',
  ], { encoding: 'utf8' });

  const output = JSON.parse(raw);
  assert.equal(output.count, 1);
  assert.equal(output.allocations.length, 1);

  execFileSync('git', ['worktree', 'remove', '--force', output.allocations[0].worktreePath], { cwd: baseDir });
  fs.rmSync(baseDir, { recursive: true, force: true });
});
