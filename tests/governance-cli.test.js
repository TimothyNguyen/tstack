const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.join(__dirname, '..');

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

test('build-governance script succeeds and prints artifact paths', () => {
  const result = runNode(['scripts/build-governance.js']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Governance inventory written:/);
  assert.match(result.stdout, /Components discovered:/);
});

test('check-governance script succeeds against committed inventory', () => {
  const result = runNode(['scripts/check-governance.js']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Governance check passed/);
});

test('CLI health, report, validate, and build succeed', () => {
  for (const command of ['health', 'report', 'validate', 'build']) {
    const result = runNode(['bin/governance.js', command]);
    assert.equal(result.status, 0, `${command} failed: ${result.stderr}`);
  }
});

test('CLI unknown command exits non-zero with usage', () => {
  const result = runNode(['bin/governance.js', 'wat']);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Unknown command: wat/);
  assert.match(result.stdout, /Usage:/);
});

test('CLI check fails when config points at missing governance doc and recovers after restore', async (t) => {
  const configPath = path.join(repoRoot, 'governance.config.json');
  const original = fs.readFileSync(configPath, 'utf8');

  t.after(() => {
    fs.writeFileSync(configPath, original);
  });

  const parsed = JSON.parse(original);
  parsed.agentDocPath = 'missing-governance-doc.md';
  fs.writeFileSync(configPath, `${JSON.stringify(parsed, null, 2)}\n`);

  const failure = runNode(['bin/governance.js', 'check']);
  assert.equal(failure.status, 1);
  assert.match(failure.stdout, /Missing agent-readable governance doc/);

  fs.writeFileSync(configPath, original);

  const success = runNode(['bin/governance.js', 'check']);
  assert.equal(success.status, 0, success.stderr);
});
