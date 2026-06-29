import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

const skipDirs = new Set([
  '.git',
  'adapters',
  'core',
  'docs',
  'generated',
  'hosts',
  'node_modules',
  'policies',
  'profiles',
  'scripts',
  'tests',
]);

function skillDirs() {
  const dirs = [];
  if (fs.existsSync(path.join(root, 'SKILL.md.tmpl'))) dirs.push('.');
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || skipDirs.has(entry.name)) continue;
    if (fs.existsSync(path.join(root, entry.name, 'SKILL.md.tmpl'))) dirs.push(entry.name);
  }
  return dirs.sort();
}

function readSkill(skill) {
  const file = skill === '.' ? path.join(root, 'SKILL.md') : path.join(root, skill, 'SKILL.md');
  return fs.readFileSync(file, 'utf8');
}

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---', 4);
  if (end === -1) return null;
  return { fm: content.slice(4, end), bodyStart: end + 4 };
}

function extractDescriptionText(fm) {
  // Inline: description: <text>
  const inline = fm.match(/^description:\s+(.+)$/m);
  if (inline) return inline[1].trim();
  // Block: description: |\n  indented lines
  const blockIdx = fm.search(/^description:\s*\|?\s*$/m);
  if (blockIdx === -1) return '';
  const afterKey = fm.slice(blockIdx).indexOf('\n') + blockIdx + 1;
  const lines = fm.slice(afterKey).split('\n');
  const descLines = [];
  for (const line of lines) {
    if (line.startsWith('  ')) descLines.push(line.slice(2));
    else break;
  }
  return descLines.join('\n').trim();
}

const MAX_DESC_CHARS = 1024;
const MIN_BODY_BYTES = 200;

for (const skill of skillDirs()) {
  const label = skill === '.' ? '(root)' : skill;

  test(`${label}: generated SKILL.md body is non-trivial (>= ${MIN_BODY_BYTES} bytes)`, () => {
    const content = readSkill(skill);
    const parsed = parseFrontmatter(content);
    assert.ok(parsed !== null, `${label} SKILL.md has no frontmatter`);
    const body = content.slice(parsed.bodyStart + 4).trim();
    assert.ok(
      body.length >= MIN_BODY_BYTES,
      `${label} body is ${body.length} bytes — need >= ${MIN_BODY_BYTES}`,
    );
  });

  test(`${label}: description stays within ${MAX_DESC_CHARS} chars`, () => {
    const content = readSkill(skill);
    const parsed = parseFrontmatter(content);
    assert.ok(parsed !== null, `${label} SKILL.md has no frontmatter`);
    const desc = extractDescriptionText(parsed.fm);
    assert.ok(desc.length > 0, `${label} description is empty`);
    assert.ok(
      desc.length <= MAX_DESC_CHARS,
      `${label} description is ${desc.length} chars — need <= ${MAX_DESC_CHARS}`,
    );
  });
}

test('extractDescriptionText returns empty string when no description key present', () => {
  const result = extractDescriptionText('name: foo\nversion: 1.0.0\n');
  assert.equal(result, '');
});

test('extractDescriptionText reaches block-parsing path when description: ends line with no trailing text', () => {
  const fm = 'description:\n';
  const result = extractDescriptionText(fm);
  assert.equal(typeof result, 'string');
});

test('parseFrontmatter returns null when content does not start with ---', () => {
  const result = parseFrontmatter('no frontmatter here\n');
  assert.equal(result, null);
});

test('parseFrontmatter returns null when frontmatter is not closed', () => {
  const result = parseFrontmatter('---\nname: test\n');
  assert.equal(result, null);
});
