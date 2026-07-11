const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pluginRoot = path.join(__dirname, '..', 'agent-pack', 'plugins', 'agent-pack');

test('agent-pack plugin exposes manifest and registry for consumers', () => {
  const pluginJsonPath = path.join(pluginRoot, 'plugin.json');
  const registryPath = path.join(pluginRoot, 'registry.json');

  assert.equal(fs.existsSync(pluginJsonPath), true);
  assert.equal(fs.existsSync(registryPath), true);

  const plugin = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  assert.equal(plugin.name, 'agent-pack');
  assert.equal(plugin.registry, './registry.json');
  assert.equal(plugin.consumers.registry, 'agent-registry');
  assert.equal(plugin.consumers.harness, 'agent-harness');
  assert.equal(registry.kind, 'AgentRegistryExport');
  assert.deepEqual(Object.keys(registry.registry), [
    'skills',
    'agents',
    'workflows',
    'adapters',
    'toolProviders',
    'stacks',
    'domains',
    'profiles',
    'schemas',
  ]);
});

test('agent-pack plugin mirrors specialty skills into plugin skills directory', () => {
  for (const skillName of ['security-scanner', 'observability-and-instrumentation', 'pm', 'swe']) {
    assert.equal(
      fs.existsSync(path.join(pluginRoot, 'skills', skillName, 'SKILL.md')),
      true,
      `${skillName} should be mirrored into plugin skills`,
    );
  }
});
