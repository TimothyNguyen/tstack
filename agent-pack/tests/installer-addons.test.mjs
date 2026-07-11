import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

// Simulate the discoverAddonPackages logic inline so tests don't need a live node_modules
function discoverAddonPackages(fakeRoot) {
  const scope = path.join(fakeRoot, '..', '@agent-pack');
  if (!fs.existsSync(scope)) return [];
  return fs.readdirSync(scope, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(scope, e.name));
}

test('discoverAddonPackages returns empty array when @agent-pack scope missing', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-addons-'));
  const fakeRoot = path.join(tmp, 'agent-pack');
  fs.mkdirSync(fakeRoot);
  try {
    const result = discoverAddonPackages(fakeRoot);
    assert.deepEqual(result, []);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('discoverAddonPackages returns paths for each @agent-pack/* package dir', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-addons-'));
  const fakeRoot = path.join(tmp, 'agent-pack');
  const scope = path.join(tmp, '@agent-pack');
  fs.mkdirSync(fakeRoot);
  fs.mkdirSync(path.join(scope, 'stacks'), { recursive: true });
  fs.mkdirSync(path.join(scope, 'adapters'), { recursive: true });
  try {
    const result = discoverAddonPackages(fakeRoot);
    assert.equal(result.length, 2);
    assert.ok(result.includes(path.join(scope, 'stacks')));
    assert.ok(result.includes(path.join(scope, 'adapters')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('discoverAddonPackages ignores files in @agent-pack scope (only dirs)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-addons-'));
  const fakeRoot = path.join(tmp, 'agent-pack');
  const scope = path.join(tmp, '@agent-pack');
  fs.mkdirSync(fakeRoot);
  fs.mkdirSync(path.join(scope, 'skills'), { recursive: true });
  fs.writeFileSync(path.join(scope, 'stray-file.json'), '{}');
  try {
    const result = discoverAddonPackages(fakeRoot);
    assert.equal(result.length, 1);
    assert.ok(result.includes(path.join(scope, 'skills')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
