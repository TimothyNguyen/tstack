import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { render, writeRendered } from '../scripts/gen-skill-docs.mjs';
import { discoverTemplates, discoverSectionTemplates, parseFrontmatterAgents } from '../scripts/discover-skills.mjs';

const root = path.resolve(import.meta.dirname, '..');
function skillDirs() {
  return discoverTemplates(root)
    .map(({ output }) => (output === 'SKILL.md' ? '.' : path.dirname(output).split(path.sep).join('/')))
    .sort();
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
  const coreSkills = [
    { dir: path.join(root, 'skills'), name: 'health' },
    { dir: path.join(root, 'skills'), name: 'test' },
    { dir: path.join(root, 'skills'), name: 'review' },
    { dir: path.join(root, 'skills'), name: 'security-review' },
  ];

  for (const { dir, name: skill } of coreSkills) {
    assert.equal(fs.existsSync(path.join(dir, skill, 'SKILL.md.tmpl')), true, `${skill} template missing`);
    assert.equal(fs.existsSync(path.join(dir, skill, 'SKILL.md')), true, `${skill} generated output missing`);
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
  assert.equal(fs.existsSync(path.join(root, 'skills', 'test', 'sections', 'manifest.json')), true);
  assert.equal(fs.existsSync(path.join(root, 'skills', 'test', 'sections', 'automation-matrix.md.tmpl')), true);
  assert.equal(fs.existsSync(path.join(root, 'skills', 'test', 'sections', 'automation-matrix.md')), true);
});

test('section manifests reference existing generated files', () => {
  for (const skill of skillDirs().filter((dir) => dir !== '.')) {
    const manifestPath = path.join(root, skill, 'sections', 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.skill, path.basename(skill));
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
  const skillsRoot = path.join(root, 'skills');
  assert.equal(fs.existsSync(path.join(skillsRoot, 'architecture-agent-upgrade', 'SKILL.md.tmpl')), true);
  assert.equal(fs.existsSync(path.join(skillsRoot, 'architecture-agent-upgrade', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(root, 'tstack-upgrade')), false);
});

test('no standalone codebase-understanding skill folder exists (merged into codebase-engine)', () => {
  assert.equal(fs.existsSync(path.join(root, 'codebase-understanding')), false,
    'codebase-understanding/ must not exist — workflow merged into codebase-engine/');
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

test('parseFrontmatterAgents handles UTF-8 BOM at start of content', () => {
  const bom = '﻿';
  const content = `${bom}---\nagents: [swe, qa-agent]\n---\n`;
  assert.deepEqual(parseFrontmatterAgents(content), ['swe', 'qa-agent']);
});

test('parseFrontmatterAgents returns empty array when no frontmatter marker', () => {
  assert.deepEqual(parseFrontmatterAgents('no frontmatter here'), []);
});

test('parseFrontmatterAgents returns empty array when frontmatter is not closed', () => {
  assert.deepEqual(parseFrontmatterAgents('---\nagents: [swe]\n'), []);
});

test('parseFrontmatterAgents returns empty array when no agents field', () => {
  assert.deepEqual(parseFrontmatterAgents('---\nname: test\n---\n'), []);
});

test('discoverTemplates works with a root that has no agents directory', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-discover-no-agents-'));
  try {
    fs.writeFileSync(path.join(dir, 'SKILL.md.tmpl'), '---\nname: root-skill\n---\n');
    const templates = discoverTemplates(dir);
    assert.ok(templates.some((t) => t.tmpl === 'SKILL.md.tmpl'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('render throws for unknown placeholder', () => {
  assert.throws(
    () => render('{{UNKNOWN_PLACEHOLDER}}', 'test.tmpl'),
    /Unknown placeholder \{\{UNKNOWN_PLACEHOLDER\}\} in test\.tmpl/,
  );
});

test('render expands known PREAMBLE placeholder', () => {
  const result = render('{{PREAMBLE}}', 'test.tmpl');
  assert.match(result, /Enterprise Preamble/);
});

test('writeRendered write mode creates output and mirror files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-genskill-write-'));
  try {
    const skillDir = path.join(dir, 'my-skill');
    const pluginDir = path.join(dir, 'plugins', 'agent-pack', 'skills', 'my-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.mkdirSync(pluginDir, { recursive: true });

    const tmplContent = '---\nname: my-skill\nversion: 0.1.0\ndescription: |\n  Test.\nagents: [swe]\n---\n\n# My Skill\n';
    fs.writeFileSync(path.join(skillDir, 'SKILL.md.tmpl'), tmplContent);

    writeRendered('my-skill/SKILL.md.tmpl', 'my-skill/SKILL.md', { check: false, root: dir });

    assert.equal(fs.existsSync(path.join(skillDir, 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(pluginDir, 'SKILL.md')), true);
    assert.equal(fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8'), tmplContent);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('writeRendered check mode detects stale output file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-genskill-check-'));
  try {
    const skillDir = path.join(dir, 'my-skill');
    fs.mkdirSync(skillDir, { recursive: true });

    const tmplContent = '---\nname: my-skill\nversion: 0.1.0\ndescription: |\n  Test.\nagents: [swe]\n---\n\n# My Skill\n';
    fs.writeFileSync(path.join(skillDir, 'SKILL.md.tmpl'), tmplContent);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), 'stale content\n');

    const prevExitCode = process.exitCode;
    writeRendered('my-skill/SKILL.md.tmpl', 'my-skill/SKILL.md', { check: true, root: dir });
    assert.equal(process.exitCode, 1);
    process.exitCode = prevExitCode;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('writeRendered check mode detects stale mirror file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-genskill-mirror-'));
  try {
    const skillDir = path.join(dir, 'my-skill');
    const pluginDir = path.join(dir, 'plugins', 'agent-pack', 'skills', 'my-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.mkdirSync(pluginDir, { recursive: true });

    const tmplContent = '---\nname: my-skill\nversion: 0.1.0\ndescription: |\n  Test.\nagents: [swe]\n---\n\n# My Skill\n';
    fs.writeFileSync(path.join(skillDir, 'SKILL.md.tmpl'), tmplContent);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), tmplContent); // output is fresh
    fs.writeFileSync(path.join(pluginDir, 'SKILL.md'), 'stale mirror content\n'); // mirror is stale

    const prevExitCode = process.exitCode;
    writeRendered('my-skill/SKILL.md.tmpl', 'my-skill/SKILL.md', { check: true, root: dir });
    assert.equal(process.exitCode, 1);
    process.exitCode = prevExitCode;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('writeRendered handles root SKILL.md outputRel (null mirror path, non-check mode)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-genskill-root-write-'));
  try {
    const tmplContent = '---\nname: root\nversion: 0.1.0\ndescription: |\n  Test.\nagents: [swe]\n---\n\n# Root\n';
    fs.writeFileSync(path.join(dir, 'SKILL.md.tmpl'), tmplContent);
    writeRendered('SKILL.md.tmpl', 'SKILL.md', { check: false, root: dir });
    assert.equal(fs.existsSync(path.join(dir, 'SKILL.md')), true);
    // 'SKILL.md' has parts.length=1 → pluginMirrorFor returns null → no mirror file
    assert.equal(
      fs.existsSync(path.join(dir, 'plugins', 'agent-pack', 'skills', 'SKILL.md')),
      false,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('writeRendered handles root SKILL.md outputRel (null mirror path, check mode)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-genskill-root-check-'));
  try {
    const tmplContent = '---\nname: root\nversion: 0.1.0\ndescription: |\n  Test.\nagents: [swe]\n---\n\n# Root\n';
    fs.writeFileSync(path.join(dir, 'SKILL.md.tmpl'), tmplContent);
    fs.writeFileSync(path.join(dir, 'SKILL.md'), tmplContent);
    const prevExitCode = process.exitCode;
    writeRendered('SKILL.md.tmpl', 'SKILL.md', { check: true, root: dir });
    assert.equal(process.exitCode, prevExitCode, 'check mode must not set exitCode when content is fresh');
    process.exitCode = prevExitCode;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('writeRendered check mode with missing output file treats it as stale (covers ternary false at line 64)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-genskill-missing-output-'));
  try {
    fs.mkdirSync(path.join(dir, 'my-skill'), { recursive: true });
    const tmplContent = '---\nname: my-skill\nversion: 0.1.0\ndescription: |\n  Test.\nagents: [swe]\n---\n\n# My Skill\n';
    fs.writeFileSync(path.join(dir, 'my-skill', 'SKILL.md.tmpl'), tmplContent);
    // No SKILL.md output file — check mode should detect it as missing (empty string != rendered)
    const prevExitCode = process.exitCode;
    writeRendered('my-skill/SKILL.md.tmpl', 'my-skill/SKILL.md', { check: true, root: dir });
    assert.equal(process.exitCode, 1, 'check mode must set exitCode=1 when output file is missing');
    process.exitCode = prevExitCode;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('writeRendered with 2-part non-SKILL.md outputRel skips mirror (covers parts[1]!==SKILL.md branch)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-genskill-readme-'));
  try {
    fs.mkdirSync(path.join(dir, 'my-skill'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'my-skill', 'README.md.tmpl'), '# README\n');
    writeRendered('my-skill/README.md.tmpl', 'my-skill/README.md', { check: false, root: dir });
    assert.equal(fs.existsSync(path.join(dir, 'my-skill', 'README.md')), true);
    assert.equal(
      fs.existsSync(path.join(dir, 'plugins', 'agent-pack', 'skills', 'my-skill', 'README.md')),
      false,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('discoverSectionTemplates skips non-.md.tmpl files and directories in sections/', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-discover-sections-skip-'));
  try {
    const mySkillDir = path.join(dir, 'skills', 'my-skill');
    const sectionsDir = path.join(mySkillDir, 'sections');
    fs.mkdirSync(sectionsDir, { recursive: true });
    fs.mkdirSync(path.join(sectionsDir, 'subdir'), { recursive: true });
    fs.writeFileSync(path.join(mySkillDir, 'SKILL.md.tmpl'), '---\nname: my-skill\n---\n');
    fs.writeFileSync(path.join(sectionsDir, 'part.md.tmpl'), '# Part\n');
    fs.writeFileSync(path.join(sectionsDir, 'notes.txt'), 'not a template\n');
    const templates = discoverSectionTemplates(dir);
    assert.ok(templates.some((t) => t.tmpl.includes('part.md.tmpl')), 'should find .md.tmpl file');
    assert.ok(!templates.some((t) => t.tmpl.includes('notes.txt')), 'should skip .txt file');
    assert.ok(!templates.some((t) => t.tmpl.includes('subdir')), 'should skip subdirectory');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
