import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  collectTests,
  detectWindowsFragility,
  parseArgs,
  shard,
  stableHash,
} from '../scripts/test-free-shards.mjs';

function withFixture(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-architecture-shards-'));
  try {
    fs.mkdirSync(path.join(dir, 'tests', 'unit'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'test'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'e2e', 'fixtures'), { recursive: true });

    fs.writeFileSync(path.join(dir, 'tests', 'alpha.test.mjs'), 'test("alpha", () => {});\n');
    fs.writeFileSync(path.join(dir, 'tests', 'unit', 'beta.spec.ts'), 'test("beta", () => {});\n');
    fs.writeFileSync(path.join(dir, 'test', 'gamma.test.py'), 'def test_gamma(): pass\n');
    fs.writeFileSync(path.join(dir, 'e2e', 'fixtures', 'ignored.test.mjs'), 'test("ignored", () => {});\n');
    fs.writeFileSync(path.join(dir, 'tests', 'paid-e2e.test.mjs'), 'test("paid", () => {});\n');
    fs.writeFileSync(path.join(dir, 'tests', 'windows-fragile.test.mjs'), 'spawnSync("sh", ["script.sh"]);\n');

    return callback(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('collectTests discovers free local test files and excludes fixtures and paid tests', () => {
  withFixture((dir) => {
    assert.deepEqual(collectTests(dir), [
      'test/gamma.test.py',
      'tests/alpha.test.mjs',
      'tests/unit/beta.spec.ts',
      'tests/windows-fragile.test.mjs',
    ]);
  });
});

test('detectWindowsFragility explains the first Windows-hostile pattern', () => {
  withFixture((dir) => {
    assert.equal(detectWindowsFragility(dir, 'tests/windows-fragile.test.mjs'), 'spawns sh directly');
    assert.equal(detectWindowsFragility(dir, 'tests/alpha.test.mjs'), null);
  });
});

test('stableHash and shard produce deterministic non-empty buckets', () => {
  const files = ['tests/a.test.mjs', 'tests/b.test.mjs', 'tests/c.test.mjs'];

  assert.equal(stableHash('tests/a.test.mjs'), stableHash('tests/a.test.mjs'));
  assert.deepEqual(shard(files, 2), shard(files, 2));
  assert.equal(shard(files, 2).flat().sort().join(','), files.sort().join(','));
});

test('parseArgs validates shard runner options', () => {
  assert.deepEqual(parseArgs(['--list', '--windows-only', '--shards', '4', '--shard', '2', '--command', 'npm test']), {
    list: true,
    windowsOnly: true,
    shards: 4,
    shard: 2,
    command: 'npm test',
  });

  assert.throws(() => parseArgs(['--unknown']), /Unknown argument: --unknown/);
});
