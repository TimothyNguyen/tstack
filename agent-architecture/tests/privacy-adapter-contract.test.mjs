import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

test('privacy adapter contract documents forbidden default behaviors', () => {
  const doc = read('docs/privacy-first-adapter-contract.md');
  for (const phrase of [
    'No public telemetry',
    'No public update checks',
    'No public tunnels',
    'No cookie/session import',
    'No credential reads',
    'No global host config mutation',
  ]) {
    assert.match(doc, new RegExp(phrase), `${phrase} missing`);
  }
});

test('enterprise policy keeps privacy-sensitive behavior disabled by default', () => {
  const policy = JSON.parse(read('policies/enterprise-default.json'));
  assert.equal(policy.egress.default, 'deny');
  assert.deepEqual(policy.egress.allowedHosts, []);
  assert.equal(policy.egress.allowPublicTelemetry, false);
  assert.equal(policy.egress.allowPublicUpdateChecks, false);
  assert.equal(policy.egress.allowPublicTunnels, false);
  assert.equal(policy.egress.allowPublicWebScraping, false);
  assert.equal(policy.tools.cookieImport, 'disabled');
  assert.equal(policy.tools.credentialRead, 'disabled');
  assert.equal(policy.install.allowGlobalMutation, false);
});

test('optional adapter skills mention policy or disabled defaults', () => {
  const adapterSkills = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('adapter-'))
    .map((entry) => entry.name);

  assert.ok(adapterSkills.length >= 10, `expected adapter coverage, got ${adapterSkills.length}`);

  for (const skill of adapterSkills) {
    const body = read(`${skill}/SKILL.md.tmpl`);
    assert.match(body, /policy|disabled|optional|approval/i, `${skill} must name policy/optional defaults`);
  }
});

test('adapter runtime code does not include known public telemetry or tunnel endpoints', () => {
  const adaptersDir = path.join(root, 'adapters');
  const files = walk(adaptersDir);
  const text = files
    .filter((file) => /\.(cjs|js|json|md)$/.test(file))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');

  for (const forbidden of [
    /supabase\.co/i,
    /segment\.com/i,
    /posthog\.com/i,
    /analytics\.google\.com/i,
    /ngrok/i,
    /cookie/i,
  ]) {
    assert.doesNotMatch(text, forbidden);
  }
});
