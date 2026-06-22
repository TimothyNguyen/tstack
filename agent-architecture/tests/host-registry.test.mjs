import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'hosts', 'registry.json'), 'utf8'));

test('host registry is declarative and repo-local', () => {
  assert.equal(registry.defaultInstallMode, 'repo-local');
  assert.ok(registry.hosts.length >= 6, 'expected core and future host targets');

  const ids = new Set();
  for (const host of registry.hosts) {
    assert.equal(ids.has(host.id), false, `duplicate host id ${host.id}`);
    ids.add(host.id);
    assert.equal(fs.existsSync(path.join(root, host.skill, 'SKILL.md.tmpl')), true, `${host.id} skill missing`);
    assert.equal(path.isAbsolute(host.generatedPath), false, `${host.id} path must be relative`);
    assert.equal(host.generatedPath.startsWith('.architecture-agent/generated/'), true, `${host.id} path must be repo-local`);
    assert.doesNotMatch(host.generatedPath, /\.\./, `${host.id} path must not escape repo`);
  }
});

test('host registry forbids telemetry, egress, and global mutation by default', () => {
  for (const host of registry.hosts) {
    assert.equal(host.globalMutation, false, `${host.id} must not mutate global config by default`);
    assert.equal(host.telemetry, 'disabled', `${host.id} telemetry must be disabled`);
    assert.equal(host.egress, 'disabled', `${host.id} egress must be disabled`);
  }
});
