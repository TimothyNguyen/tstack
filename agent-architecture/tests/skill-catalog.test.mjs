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
    // Match: - **[`skill-name`](./skill-name/SKILL.md)** — description
    const match = line.match(/^- \*\*\[`([^`]+)`\]\(\.\/([^/]+)\/SKILL\.md\)\*\*/);
    if (match) {
      const skill = match[1];
      const dir = match[2];
      rows.push({ skill, source: `${dir}/SKILL.md.tmpl` });
    }
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
  }
});

test('root router skill routing is consistent', () => {
  const rootSkill = read('SKILL.md.tmpl');
  const rows = catalogRows();
  const catalogedSkills = new Set(rows.map(r => r.skill));

  // Extract skills mentioned in root router
  const routedSkills = [];
  for (const match of rootSkill.matchAll(/invoke `([a-z-]+)`/g)) {
    routedSkills.push(match[1]);
  }

  // Check that routed skills are cataloged
  // adapter- skills are now in packages/adapters/ and are excluded from the top-level catalog
  // stack- and domain- skills are now in packages/stacks/ and are excluded from the top-level catalog
  for (const skill of routedSkills) {
    if (!skill.startsWith('architecture-agent-') && !skill.startsWith('adapter-') &&
        !skill.startsWith('stack-') && !skill.startsWith('domain-') &&
        skill !== 'subagent-orchestrator') {
      assert.ok(catalogedSkills.has(skill),
        `${skill} is routed by root but not in catalog`);
    }
  }
});

test('every top-level skill folder is cataloged', () => {
  const rows = catalogRows();
  const cataloged = new Set(rows.map((row) => row.skill));

  for (const skill of skillDirs()) {
    assert.equal(cataloged.has(skill), true, `${skill} has SKILL.md.tmpl but is missing from catalog`);
  }
});

test('catalog excludes agent-architecture-only or disallowed defaults', () => {
  const catalog = read('docs/skill-catalog.md');

  assert.doesNotMatch(catalog, /plan-ceo-review/);
  assert.doesNotMatch(catalog, /agent-architecture-upgrade/);
  assert.doesNotMatch(catalog, /ios-/i);
  assert.doesNotMatch(catalog, /hackernews|scrape/i);
});

test('subagent orchestrator is cataloged and routed', () => {
  const catalog = read('docs/skill-catalog.md');
  const rootSkill = read('SKILL.md.tmpl');

  assert.match(catalog, /\[`subagent-orchestrator`\]/);
  assert.match(rootSkill, /`subagent-orchestrator`/);
});
