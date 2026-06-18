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
