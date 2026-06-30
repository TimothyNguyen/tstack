import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('install spec documents all supported local install modes', () => {
  const spec = read('docs/install-spec.md');

  for (const mode of ['Repo-local', 'Vendored source', 'Approved user directory', 'Generated host sidecar']) {
    assert.match(spec, new RegExp(`\\| ${mode} \\|`), `${mode} install mode missing`);
  }

  assert.match(spec, /Repo-local install is the default\./);
});

test('install spec documents required repo-local and host-sidecar layout', () => {
  const spec = read('docs/install-spec.md');

  for (const required of [
    '<repo>/.architecture-agent/',
    'VERSION',
    'SKILL.md',
    'policies/',
    'profiles/',
    'generated/',
    'claude/',
    'codex/',
    'copilot/',
    'google-adk/',
    '<repo>/.agents/skills/architecture-agent/',
  ]) {
    assert.match(spec, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${required} missing`);
  }
});

test('install manifest sample contains required fields and no forbidden fields', () => {
  const spec = read('docs/install-spec.md');
  const match = spec.match(/```json\n([\s\S]*?)\n```/);
  assert.ok(match, 'install manifest JSON sample missing');

  const manifest = JSON.parse(match[1]);
  assert.equal(manifest.name, 'architecture-agent');
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.mode, 'repo-local');
  assert.equal(manifest.policy, 'enterprise-default');
  assert.deepEqual(manifest.hosts, ['claude', 'codex', 'copilot']);
  assert.deepEqual(manifest.profiles, ['enterprise-default']);
  assert.deepEqual(manifest.adapters, []);

  for (const forbidden of ['token', 'cookie', 'credential', 'password', 'secret', 'fullPrompt', 'fileContents']) {
    assert.equal(Object.hasOwn(manifest, forbidden), false, `${forbidden} must not appear in install manifest`);
  }
});

test('install and upgrade docs require offline-safe upgrade behavior', () => {
  const installSpec = read('docs/install-spec.md');
  const upgradeSkill = read('packages/skills/architecture-agent-upgrade/SKILL.md.tmpl');

  for (const content of [installSpec, upgradeSkill]) {
    assert.match(content, /No public update check|Do not call public update endpoints/i);
    assert.match(content, /internal mirror|pinned artifact|manual/i);
    assert.match(content, /npm run check:skills/);
  }
});
