import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { main, parseArgs, readPlan } from '../scripts/subagent-deploy.mjs';

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
  assert.equal(output.summaryPath.endsWith(path.join('.agent-pack', 'subagents', 'deployment.json')), true);

  const implementerManifest = JSON.parse(fs.readFileSync(path.join(
    baseDir,
    '.agent-pack',
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
    '.agent-pack',
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

test('parseArgs handles -- separator gracefully', () => {
  const args = parseArgs(['--', '--from-file', 'plan.json']);
  assert.equal(args.fromFile, 'plan.json');
});

test('parseArgs accepts literal "true" as allocateWorktrees flag', () => {
  const args = parseArgs(['--from-file', 'plan.json', 'true']);
  assert.equal(args.allocateWorktrees, true);
  assert.equal(args.fromFile, 'plan.json');
});

test('parseArgs throws for unknown argument', () => {
  assert.throws(() => parseArgs(['--unknown-flag']), /Unknown argument/);
});

test('parseArgs throws when --from-file is missing (covers line 34 throw branch)', () => {
  assert.throws(() => parseArgs([]), /Missing --from-file/);
});

test('readPlan throws when plan object has no agents array', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-readplan-'));
  try {
    const planFile = path.join(dir, 'plan.json');
    fs.writeFileSync(planFile, JSON.stringify({ agents: 'not-an-array' }), 'utf8');
    assert.throws(() => readPlan(planFile), /requires agents array/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('subagent deployment filters explorer agents from worktree allocation', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagent-explorer-filter-'));
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
      { id: 'explorer-a', role: 'explorer', task: 'Map', allowedPaths: ['src/**'], tools: ['shellRead'] },
      { id: 'implementer-a', role: 'implementer', task: 'Patch', allowedPaths: ['src/**'], tools: ['shellRead', 'shellWrite'] },
    ],
  }), 'utf8');

  const raw = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'subagent-deploy.mjs'),
    '--from-file', planFile,
    '--base-dir', baseDir,
    '--allocate-worktrees',
  ], { encoding: 'utf8' });

  const output = JSON.parse(raw);
  assert.equal(output.count, 2, 'both agents deployed');
  assert.equal(output.allocations.length, 1, 'only implementer gets worktree');

  execFileSync('git', ['worktree', 'remove', '--force', output.allocations[0].worktreePath], { cwd: baseDir });
  fs.rmSync(baseDir, { recursive: true, force: true });
});

test('subagent deployment filters reviewer agents from worktree allocation', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-subagent-reviewer-filter-'));
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
      { id: 'reviewer-a', role: 'reviewer', task: 'Review', allowedPaths: ['src/**'], tools: ['shellRead'] },
      { id: 'implementer-a', role: 'implementer', task: 'Patch', allowedPaths: ['src/**'], tools: ['shellRead', 'shellWrite'] },
    ],
  }), 'utf8');

  const raw = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'subagent-deploy.mjs'),
    '--from-file', planFile,
    '--base-dir', baseDir,
    '--allocate-worktrees',
  ], { encoding: 'utf8' });

  const output = JSON.parse(raw);
  assert.equal(output.count, 2, 'both agents deployed');
  assert.equal(output.allocations.length, 1, 'only implementer gets worktree');

  execFileSync('git', ['worktree', 'remove', '--force', output.allocations[0].worktreePath], { cwd: baseDir });
  fs.rmSync(baseDir, { recursive: true, force: true });
});

test('main() catches errors and sets exitCode to 1', () => {
  const prevArgv = process.argv;
  const prevExitCode = process.exitCode;
  process.argv = ['node', 'subagent-deploy.mjs', '--from-file', '/nonexistent/plan.json'];
  try {
    main();
    assert.equal(process.exitCode, 1);
  } finally {
    process.argv = prevArgv;
    process.exitCode = prevExitCode;
  }
});
