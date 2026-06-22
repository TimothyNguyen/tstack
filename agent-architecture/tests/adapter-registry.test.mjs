import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'adapters', 'registry.json'), 'utf8'));
const policy = JSON.parse(fs.readFileSync(path.join(root, 'policies', 'enterprise-default.json'), 'utf8'));

test('adapter registry is default-deny and references existing skills/modules', () => {
  assert.equal(registry.defaultEgress, 'deny');
  assert.ok(registry.adapters.length >= 10, 'expected all optional adapters to be registered');

  const ids = new Set();
  for (const adapter of registry.adapters) {
    assert.equal(ids.has(adapter.id), false, `duplicate adapter id ${adapter.id}`);
    ids.add(adapter.id);

    assert.equal(fs.existsSync(path.join(root, adapter.skill, 'SKILL.md.tmpl')), true, `${adapter.id} skill missing`);
    assert.equal(Object.hasOwn(policy.modules, adapter.module), true, `${adapter.id} policy module missing`);
    assert.match(policy.modules[adapter.module], /^(optional|disabled)$/, `${adapter.id} module must not be enabled`);
  }
});

test('adapter registry forbids default public egress and ungated writes', () => {
  for (const adapter of registry.adapters) {
    assert.match(adapter.egress, /^(disabled|approval-required)$/, `${adapter.id} has unsafe egress ${adapter.egress}`);
    assert.match(adapter.writes, /^(disabled|approval-required)$/, `${adapter.id} has unsafe writes ${adapter.writes}`);
    assert.match(adapter.state, /^(local-only|declared-local-paths)$/, `${adapter.id} has unsafe state ${adapter.state}`);
  }
});

test('adapter registry and adapter skills stay in sync', () => {
  const registeredSkills = new Set(registry.adapters.map((adapter) => adapter.skill));
  const adapterSkills = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('adapter-'))
    .map((entry) => entry.name);

  for (const skill of adapterSkills) {
    assert.equal(registeredSkills.has(skill), true, `${skill} missing from adapters/registry.json`);
  }
});
