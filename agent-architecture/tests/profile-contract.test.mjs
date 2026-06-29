import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const adaptersRoot = path.join(root, 'packages', 'adapters');
const profilesDir = path.join(root, 'profiles');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'policies', 'enterprise-default.json'), 'utf8'));

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function skillDirs() {
  const fromRoot = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(root, entry.name, 'SKILL.md.tmpl')))
    .map((entry) => entry.name);
  const fromAdapters = fs.readdirSync(adaptersRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(adaptersRoot, entry.name, 'SKILL.md.tmpl')))
    .map((entry) => entry.name);
  return new Set([...fromRoot, ...fromAdapters]);
}

function profileFiles() {
  return fs.readdirSync(profilesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(profilesDir, entry.name));
}

test('profiles reference existing skills and optional modules', () => {
  const skills = skillDirs();
  const modules = new Set(Object.keys(policy.modules));

  for (const file of profileFiles()) {
    const profile = readJson(file);
    assert.equal(typeof profile.name, 'string', `${file} missing name`);
    assert.equal(profile.policy, 'policies/enterprise-default.json', `${profile.name} must use default policy`);

    for (const skill of profile.skills) {
      assert.equal(skills.has(skill), true, `${profile.name} references missing skill ${skill}`);
    }

    for (const moduleName of profile.optionalModules) {
      assert.equal(modules.has(moduleName), true, `${profile.name} references missing module ${moduleName}`);
      assert.match(policy.modules[moduleName], /^(optional|disabled)$/, `${moduleName} must not be enabled by default`);
    }
  }
});

test('profiles preserve privacy-disabled defaults', () => {
  const required = [
    'publicTelemetry',
    'publicUpdateChecks',
    'publicTunnels',
    'publicWebScraping',
    'cookieImport',
    'credentialRead',
    'globalMutation',
  ];

  for (const file of profileFiles()) {
    const profile = readJson(file);
    for (const item of required) {
      assert.equal(profile.disabledByDefault.includes(item), true, `${profile.name} must disable ${item}`);
    }
  }
});

test('enterprise modernization extends privacy default', () => {
  const profile = readJson(path.join(profilesDir, 'enterprise-modernization.json'));
  assert.equal(profile.extends, 'privacy-default');
  assert.equal(profile.skills.includes('migration-dotnet-sqlserver-modernization'), true);
  assert.equal(profile.skills.includes('security-review'), false, 'base privacy profile supplies core security-review');
});

test('subagents local profile enables orchestration skills without browser or egress defaults', () => {
  const profile = readJson(path.join(profilesDir, 'subagents-local.json'));
  assert.equal(profile.extends, 'privacy-default');
  assert.equal(profile.optionalModules.includes('subagents'), true);
  for (const skill of ['autoplan', 'investigate', 'review', 'test', 'ship']) {
    assert.equal(profile.skills.includes(skill), true, `subagents-local should include ${skill}`);
  }
  assert.equal(profile.optionalModules.includes('browser'), true);
  assert.equal(profile.optionalModules.includes('devtools'), true);
  assert.equal(profile.disabledByDefault.includes('cookieImport'), true);
  assert.equal(profile.disabledByDefault.includes('publicTunnels'), true);
});
