import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function catalogRows() {
  const catalog = read('docs/skill-catalog.md');
  const rows = [];
  for (const line of catalog.split(/\r?\n/)) {
    const match = line.match(/^\| `([^`]+)` \| ([^|]+) \| `([^`]+)` \|$/);
    if (match) rows.push({ skill: match[1], purpose: match[2].trim(), source: match[3] });
  }
  return rows;
}

function skillDirs() {
  const skip = new Set([
    '.git',
    'adapters',
    'agents',
    'core',
    'docs',
    'generated',
    'hosts',
    'node_modules',
    'policies',
    'profiles',
    'scripts',
    'stack',
    'tests',
  ]);
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith('.') && !skip.has(entry.name))
    .filter((entry) => fs.existsSync(path.join(root, entry.name, 'SKILL.md.tmpl')))
    .map((entry) => entry.name)
    .sort();
}

test('skill catalog rows point to generated top-level skills', () => {
  const rows = catalogRows();
  assert.ok(rows.length >= 30, `expected substantial default catalog, found ${rows.length}`);

  for (const row of rows) {
    assert.equal(row.source, `${row.skill}/SKILL.md.tmpl`, `${row.skill} source must match folder contract`);
    assert.equal(fs.existsSync(path.join(root, row.source)), true, `${row.skill} template missing`);
    assert.equal(fs.existsSync(path.join(root, row.skill, 'SKILL.md')), true, `${row.skill} generated skill missing`);
    assert.notEqual(row.purpose, '', `${row.skill} purpose missing`);
  }
});

test('root router mentions every cataloged default skill', () => {
  const rootSkill = read('SKILL.md.tmpl');
  const rows = catalogRows();

  for (const { skill } of rows) {
    assert.match(rootSkill, new RegExp(`\\\`${skill}\\\``), `${skill} is cataloged but not routed by root skill`);
  }
});

test('every top-level skill folder is cataloged and routed', () => {
  const rows = catalogRows();
  const cataloged = new Set(rows.map((row) => row.skill));
  const rootSkill = read('SKILL.md.tmpl');

  for (const skill of skillDirs()) {
    assert.equal(cataloged.has(skill), true, `${skill} has SKILL.md.tmpl but is missing from catalog`);
    assert.match(rootSkill, new RegExp(`\\\`${skill}\\\``), `${skill} has SKILL.md.tmpl but is not routed`);
  }
});

test('catalog excludes gstack-only or disallowed defaults', () => {
  const catalog = read('docs/skill-catalog.md');

  assert.doesNotMatch(catalog, /plan-ceo-review/);
  assert.doesNotMatch(catalog, /gstack-upgrade/);
  assert.doesNotMatch(catalog, /ios-/i);
  assert.doesNotMatch(catalog, /hackernews|scrape/i);
});

test('subagent orchestrator is cataloged and routed', () => {
  const catalog = read('docs/skill-catalog.md');
  const rootSkill = read('SKILL.md.tmpl');

  assert.match(catalog, /\| `subagent-orchestrator` \|/);
  assert.match(rootSkill, /invoke `subagent-orchestrator`/);
});
