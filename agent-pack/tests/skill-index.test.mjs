import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const INDEX_PATH = path.join(ROOT, 'generated', 'skills.index.json');

let index;

test('skills.index.json exists and is valid JSON', () => {
  assert.ok(fs.existsSync(INDEX_PATH), 'generated/skills.index.json must exist; run npm run build:index');
  index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  assert.ok(index && typeof index === 'object', 'index must be an object');
});

test('skills.index.json has required top-level fields', () => {
  assert.ok(typeof index.generatedAt === 'string', 'generatedAt must be a string');
  assert.ok(typeof index.count === 'number', 'count must be a number');
  assert.ok(Array.isArray(index.skills), 'skills must be an array');
  assert.equal(index.skills.length, index.count, 'count must match skills.length');
});

test('every skill has name, version, description, path, agents', () => {
  for (const skill of index.skills) {
    assert.ok(typeof skill.name === 'string' && skill.name.length > 0,
      `skill missing name: ${JSON.stringify(skill)}`);
    assert.ok(typeof skill.version === 'string',
      `skill.version must be a string: ${skill.name}`);
    assert.ok(typeof skill.description === 'string',
      `skill.description must be a string: ${skill.name}`);
    assert.ok(typeof skill.path === 'string' && skill.path.endsWith('SKILL.md.tmpl'),
      `skill.path must end with SKILL.md.tmpl: ${skill.name}`);
    assert.ok(Array.isArray(skill.agents),
      `skill.agents must be an array: ${skill.name}`);
  }
});

test('skill names are unique', () => {
  const names = index.skills.map((s) => s.name);
  const unique = new Set(names);
  assert.equal(unique.size, names.length, 'skill names must be unique');
});

test('skill index is sorted by name', () => {
  const names = index.skills.map((s) => s.name);
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(names, sorted, 'skills must be sorted by name');
});

test('all skill tmpl files referenced in index exist on disk', () => {
  for (const skill of index.skills) {
    const tmplPath = path.join(ROOT, skill.path);
    assert.ok(fs.existsSync(tmplPath),
      `tmpl file missing for skill "${skill.name}": ${skill.path}`);
  }
});

test('index count is at least 80 skills', () => {
  assert.ok(index.count >= 80, `expected >= 80 skills, got ${index.count}`);
});
