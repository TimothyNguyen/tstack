import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'install-dry-run.example.json'), 'utf8'));
const forbiddenKeys = /token|cookie|apiKey|password|secret|credential|fullPrompt|fileContents/i;

function assertNoForbiddenKeys(value, trail = '') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${trail}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      assert.doesNotMatch(key, forbiddenKeys, `${trail}.${key} is forbidden in install dry-run`);
      assertNoForbiddenKeys(child, `${trail}.${key}`);
    }
  }
}

test('install dry-run writes only declared repo-local paths', () => {
  assert.equal(manifest.mode, 'repo-local');
  assert.ok(manifest.writePlan.length > 0);

  for (const target of manifest.writePlan) {
    assert.equal(path.isAbsolute(target), false, `${target} must be relative`);
    assert.equal(target.startsWith('.agent/'), true, `${target} must stay under .agent/`);
    assert.doesNotMatch(target, /\.\./, `${target} must not escape repo`);
  }
});

test('install dry-run records privacy-disabled defaults', () => {
  for (const item of [
    'publicTelemetry',
    'publicUpdateChecks',
    'publicTunnels',
    'publicWebScraping',
    'cookieImport',
    'credentialRead',
  ]) {
    assert.equal(manifest.skippedByDefault.includes(item), true, `${item} must be skipped by default`);
  }
});

test('install dry-run contains no secret-like fields', () => {
  assertNoForbiddenKeys(manifest, 'manifest');
});
