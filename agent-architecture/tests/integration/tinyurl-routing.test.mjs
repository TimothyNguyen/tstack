import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '../..');
const FIXTURE = path.resolve(import.meta.dirname, 'tinyurl-fixture');
const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');

let TMP;

// Install once, run all routing checks against the same install
test('setup: install agent-architecture into tinyurl fixture', () => {
  TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-routing-'));
  execFileSync(process.execPath, [INSTALL_SCRIPT, '--private', '--target', TMP],
    { cwd: FIXTURE, stdio: 'pipe' });
  assert.ok(fs.existsSync(path.join(TMP, 'VERSION')), 'install must succeed');
});

test('only agents declared in .agent-config.json are installed', () => {
  if (!TMP) return;
  const configAgents = ['swe', 'qa-agent', 'spec-agent', 'pm'];
  const notInstalled = ['orchestrate', 'migration', 'data', 'cloud', 'interviewer', 'design-agent'];

  for (const agent of configAgents) {
    assert.ok(
      fs.existsSync(path.join(TMP, 'skills', agent, 'SKILL.md')),
      `expected agent "${agent}" to be installed`
    );
  }
  for (const agent of notInstalled) {
    assert.ok(
      !fs.existsSync(path.join(TMP, 'skills', agent, 'SKILL.md')),
      `agent "${agent}" should NOT be installed (not in .agent-config.json)`
    );
  }
});

test('/swe SKILL.md references commit and seniorswe-concise', () => {
  if (!TMP) return;
  const skill = fs.readFileSync(path.join(TMP, 'skills', 'swe', 'SKILL.md'), 'utf8');
  assert.ok(skill.includes('commit'), '/swe must mention commit');
  assert.ok(skill.includes('seniorswe-concise'), '/swe must mention seniorswe-concise');
  assert.ok(skill.includes('investigate'), '/swe must mention investigate');
  assert.ok(skill.includes('ship'), '/swe must mention ship');
});

test('/spec-agent SKILL.md references atlassian-docs and spec', () => {
  if (!TMP) return;
  const skill = fs.readFileSync(path.join(TMP, 'skills', 'spec-agent', 'SKILL.md'), 'utf8');
  assert.ok(skill.includes('atlassian-docs'), '/spec-agent must mention atlassian-docs');
  assert.ok(skill.includes('spec'), '/spec-agent must mention spec');
  assert.ok(skill.includes('diagram'), '/spec-agent must mention diagram');
});

test('/qa-agent SKILL.md references qa and benchmark', () => {
  if (!TMP) return;
  const skill = fs.readFileSync(path.join(TMP, 'skills', 'qa-agent', 'SKILL.md'), 'utf8');
  assert.ok(skill.includes('qa'), '/qa-agent must mention qa');
  assert.ok(skill.includes('benchmark'), '/qa-agent must mention benchmark');
  assert.ok(skill.includes('canary'), '/qa-agent must mention canary');
});

test('CLAUDE.md lists all configured agents', () => {
  if (!TMP) return;
  const claude = fs.readFileSync(path.join(TMP, 'CLAUDE.md'), 'utf8');
  for (const agent of ['swe', 'qa-agent', 'spec-agent', 'pm']) {
    assert.ok(claude.includes(`/${agent}`), `CLAUDE.md must list /${agent}`);
  }
});

test('AGENTS.md mentions all configured agents', () => {
  if (!TMP) return;
  const agents = fs.readFileSync(path.join(TMP, 'AGENTS.md'), 'utf8');
  for (const agent of ['swe', 'qa-agent', 'spec-agent', 'pm']) {
    assert.ok(agents.includes(agent), `AGENTS.md must mention ${agent}`);
  }
});

test('teardown: clean up tmp dir', () => {
  if (TMP) fs.rmSync(TMP, { recursive: true, force: true });
});
