import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');

test('generated skills are fresh', () => {
  const result = spawnSync(process.execPath, ['scripts/gen-skill-docs.mjs', '--check'], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('core skills have template and generated output', () => {
  const skills = [
    'health',
    'test',
    'review',
    'security-review',
    'codebase-understanding',
  ];

  for (const skill of skills) {
    assert.equal(fs.existsSync(path.join(root, skill, 'SKILL.md.tmpl')), true, `${skill} template missing`);
    assert.equal(fs.existsSync(path.join(root, skill, 'SKILL.md')), true, `${skill} generated output missing`);
  }
});

test('test skill has automation section manifest and generated section', () => {
  assert.equal(fs.existsSync(path.join(root, 'test', 'sections', 'manifest.json')), true);
  assert.equal(fs.existsSync(path.join(root, 'test', 'sections', 'automation-matrix.md.tmpl')), true);
  assert.equal(fs.existsSync(path.join(root, 'test', 'sections', 'automation-matrix.md')), true);
});
