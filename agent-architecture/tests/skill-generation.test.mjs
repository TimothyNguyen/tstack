import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';

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

function readGeneratedSkill(skill) {
  const file = skill === '.' ? path.join(root, 'SKILL.md') : path.join(root, skill, 'SKILL.md');
  return fs.readFileSync(file, 'utf8');
}

function frontmatter(content) {
  assert.equal(content.startsWith('---\n'), true, 'missing frontmatter start');
  const end = content.indexOf('\n---', 4);
  assert.notEqual(end, -1, 'missing frontmatter end');
  return content.slice(4, end);
}

function frontmatterValue(fm, key) {
  const match = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim() || '';
}

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
    'rtk-token-optimizer',
  ];

  for (const skill of skills) {
    assert.equal(fs.existsSync(path.join(root, skill, 'SKILL.md.tmpl')), true, `${skill} template missing`);
    assert.equal(fs.existsSync(path.join(root, skill, 'SKILL.md')), true, `${skill} generated output missing`);
  }
});

test('every skill template has generated output', () => {
  for (const skill of skillDirs()) {
    const tmpl = skill === '.' ? path.join(root, 'SKILL.md.tmpl') : path.join(root, skill, 'SKILL.md.tmpl');
    const generated = skill === '.' ? path.join(root, 'SKILL.md') : path.join(root, skill, 'SKILL.md');

    assert.equal(fs.existsSync(tmpl), true, `${skill} template missing`);
    assert.equal(fs.existsSync(generated), true, `${skill} generated output missing`);
  }
});

test('every generated skill has required frontmatter fields', () => {
  for (const skill of skillDirs()) {
    const fm = frontmatter(readGeneratedSkill(skill));

    assert.notEqual(frontmatterValue(fm, 'name'), '', `${skill} missing name`);
    assert.notEqual(frontmatterValue(fm, 'version'), '', `${skill} missing version`);
    assert.match(fm, /^description:\s*\|/m, `${skill} must use block description`);
  }
});

test('generated skills have no unresolved placeholders', () => {
  for (const skill of skillDirs()) {
    const content = readGeneratedSkill(skill);
    assert.equal(content.match(/\{\{[A-Z0-9_]+(?::[^}]*)?\}\}/g), null, `${skill} has unresolved placeholder`);
  }
});

test('test skill has automation section manifest and generated section', () => {
  assert.equal(fs.existsSync(path.join(root, 'test', 'sections', 'manifest.json')), true);
  assert.equal(fs.existsSync(path.join(root, 'test', 'sections', 'automation-matrix.md.tmpl')), true);
  assert.equal(fs.existsSync(path.join(root, 'test', 'sections', 'automation-matrix.md')), true);
});

test('section manifests reference existing generated files', () => {
  for (const skill of skillDirs().filter((dir) => dir !== '.')) {
    const manifestPath = path.join(root, skill, 'sections', 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.skill, skill);
    assert.equal(Array.isArray(manifest.sections), true);

    for (const section of manifest.sections) {
      assert.equal(typeof section.id, 'string');
      assert.equal(typeof section.file, 'string');
      assert.equal(fs.existsSync(path.join(root, skill, 'sections', section.file)), true, `${skill} missing section ${section.file}`);
    }
  }
});

test('section templates have generated outputs', () => {
  for (const skill of skillDirs().filter((dir) => dir !== '.')) {
    const sectionsDir = path.join(root, skill, 'sections');
    if (!fs.existsSync(sectionsDir)) continue;

    for (const entry of fs.readdirSync(sectionsDir)) {
      if (!entry.endsWith('.md.tmpl')) continue;
      const generated = path.join(sectionsDir, entry.replace(/\.tmpl$/, ''));
      assert.equal(fs.existsSync(generated), true, `${skill}/${entry} missing generated output`);
    }
  }
});

test('upgrade skill uses architecture-agent name', () => {
  assert.equal(fs.existsSync(path.join(root, 'architecture-agent-upgrade', 'SKILL.md.tmpl')), true);
  assert.equal(fs.existsSync(path.join(root, 'architecture-agent-upgrade', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(root, 'tstack-upgrade')), false);
});

test('install spec documents safe repo-local install contract', () => {
  const installSpec = fs.readFileSync(path.join(root, 'docs', 'install-spec.md'), 'utf8');

  assert.match(installSpec, /Repo-local/);
  assert.match(installSpec, /\.architecture-agent/);
  assert.match(installSpec, /No public telemetry/);
  assert.match(installSpec, /No public update checks/);
  assert.match(installSpec, /No public tunnels/);
  assert.match(installSpec, /No cookie\/session import/);
  assert.match(installSpec, /architecture-agent-upgrade/);
});

test('default policy denies public egress and sensitive capabilities', () => {
  const policy = JSON.parse(fs.readFileSync(path.join(root, 'policies', 'enterprise-default.json'), 'utf8'));

  assert.equal(policy.egress.default, 'deny');
  assert.equal(policy.egress.allowPublicUpdateChecks, false);
  assert.equal(policy.egress.allowPublicTelemetry, false);
  assert.equal(policy.egress.allowPublicTunnels, false);
  assert.equal(policy.egress.allowPublicWebScraping, false);
  assert.equal(policy.tools.cookieImport, 'disabled');
  assert.equal(policy.tools.credentialRead, 'disabled');
});

test('rtk token optimizer is optional and safe by default', () => {
  const policy = JSON.parse(fs.readFileSync(path.join(root, 'policies', 'enterprise-default.json'), 'utf8'));
  const doc = fs.readFileSync(path.join(root, 'docs', 'rtk-token-optimizer.md'), 'utf8');
  const skill = fs.readFileSync(path.join(root, 'rtk-token-optimizer', 'SKILL.md.tmpl'), 'utf8');

  assert.equal(policy.modules.rtkTokenOptimizer, 'optional');
  assert.match(doc, /Do not run `curl \| sh`/);
  assert.match(doc, /Do not enable telemetry/);
  assert.match(doc, /Do not install global command-rewrite hooks by default/);
  assert.match(skill, /Do not run `curl \| sh`/);
  assert.match(skill, /Do not enable RTK telemetry/);
});

test('generated skills do not reintroduce forbidden default capabilities', () => {
  const forbidden = [
    /ngrok/i,
    /public telemetry/i,
    /cookie import/i,
    /public update checks/i,
    /public web scraping/i,
    /iOS QA/i,
  ];

  for (const skill of skillDirs()) {
    const content = readGeneratedSkill(skill);
    for (const pattern of forbidden) {
      const matches = content.match(pattern);
      if (!matches) continue;
      assert.match(content, /disabled by default|forbidden by default|No public|Do not/i, `${skill} mentions ${pattern} without default-deny language`);
    }
  }
});

test('free test discovery lists this local test suite', () => {
  const result = spawnSync(process.execPath, ['scripts/test-free-shards.mjs', '--list'], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.files.includes('tests/skill-generation.test.mjs'), true);
});
