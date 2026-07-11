import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'policies', 'enterprise-default.json'), 'utf8'));

test('enterprise default policy is repo-local and avoids global mutation', () => {
  assert.equal(policy.install.defaultMode, 'repo-local');
  assert.equal(policy.install.allowGlobalMutation, false);
  assert.deepEqual(policy.install.allowedTargets, [
    'agent-pack/generated',
    '.agent-pack',
  ]);

  for (const target of policy.install.allowedTargets) {
    assert.equal(path.isAbsolute(target), false, `${target} must be repo-relative`);
    assert.doesNotMatch(target, /\.\./, `${target} must not escape the repo`);
  }
});

test('enterprise default policy has explicit no-public-egress posture', () => {
  assert.equal(policy.egress.default, 'deny');
  assert.deepEqual(policy.egress.allowedHosts, []);
  assert.equal(policy.egress.allowPublicUpdateChecks, false);
  assert.equal(policy.egress.allowPublicTelemetry, false);
  assert.equal(policy.egress.allowPublicTunnels, false);
  assert.equal(policy.egress.allowPublicWebScraping, false);
});

test('enterprise default policy keeps sensitive and side-effecting tools gated', () => {
  assert.equal(policy.tools.shellRead, 'allow');
  assert.equal(policy.tools.gitRead, 'allow');
  assert.equal(policy.tools.testExecution, 'allow');

  for (const tool of ['shellWrite', 'gitWrite', 'deploy', 'databaseRead', 'ticketCreate']) {
    assert.equal(policy.tools[tool], 'approval-required', `${tool} must require approval`);
  }

  for (const tool of ['browserRead', 'browserWrite', 'cookieImport', 'credentialRead', 'databaseWrite']) {
    assert.equal(policy.tools[tool], 'disabled', `${tool} must be disabled by default`);
  }

  for (const tool of ['playwrightCli', 'devtoolsInspect']) {
    assert.equal(policy.tools[tool], 'approval-required', `${tool} must require approval`);
  }
});

test('enterprise default policy redacts prompt, file, and secret-like audit fields', () => {
  assert.equal(policy.audit.enabled, true);
  assert.equal(policy.audit.destination, 'local-file');
  assert.match(policy.audit.path, /^\.agent-pack\//);

  for (const field of ['token', 'cookie', 'apiKey', 'password', 'secret', 'credential', 'fullPrompt', 'fileContents']) {
    assert.equal(policy.audit.forbiddenFields.includes(field), true, `${field} must be forbidden from audit payloads`);
  }
});

test('enterprise default modules are disabled or optional, never enabled by default', () => {
  assert.equal(policy.modules.browser, 'disabled');
  assert.equal(policy.modules.devtools, 'optional');

  for (const [moduleName, state] of Object.entries(policy.modules)) {
    assert.match(state, /^(disabled|optional)$/, `${moduleName} must not be enabled by default`);
  }
});
