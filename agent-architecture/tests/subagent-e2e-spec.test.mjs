import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('subagent e2e spec documents implemented happy, reject, and boundary flows', () => {
  const spec = read('docs/subagent-e2e-spec.md');
  for (const phrase of [
    'Covered Flow',
    'Reject Flow',
    'Boundary Flow',
    'npm run subagents:deploy -- subagents.json <repo> allocate-worktrees',
    'npm run subagents:import -- apply <agent-id> <repo>',
    'npm run subagents:import -- reject <agent-id> <repo> "reason"',
    '.architecture-agent/subagents/',
  ]) {
    assert.match(spec, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('subagent e2e spec maps coverage to existing test files', () => {
  const spec = read('docs/subagent-e2e-spec.md');
  for (const file of [
    'tests/subagent-manifest.test.mjs',
    'tests/subagent-deployment.test.mjs',
    'tests/subagent-worktree.test.mjs',
    'tests/subagent-import.test.mjs',
    'tests/subagent-import-cli.test.mjs',
  ]) {
    assert.match(spec, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(fs.existsSync(path.join(root, file)), true);
  }
});

test('subagent e2e spec includes current pros, cons, and explicit exclusions', () => {
  const spec = read('docs/subagent-e2e-spec.md');
  for (const phrase of [
    'Local-first and private by default',
    'Git worktrees isolate write-capable agents',
    'orchestration plumbing, not true autonomous multi-agent runtime yet',
    'Playwright smoke exists, but no product app/browser QA subagent yet',
    'Not Yet Covered',
  ]) {
    assert.match(spec, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('subagent e2e spec includes Playwright CLI and devtools agent coverage', () => {
  const spec = read('docs/subagent-e2e-spec.md');
  for (const phrase of [
    'Playwright CLI Flow',
    'Devtools Agent Flow',
    'npm run test:e2e',
    'devtools-agent',
    'console errors',
    'buttons respond',
  ]) {
    assert.match(spec, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
