import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'manifest.json' && full.includes(`${path.sep}mcp${path.sep}`)) out.push(full);
  }
  return out;
}

test('MCP manifests are privacy-safe by default', () => {
  const manifests = walk(path.join(root, 'adapters'));
  assert.ok(manifests.length >= 1, 'expected at least one MCP manifest');

  for (const file of manifests) {
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.match(manifest.transport, /^(stdio|local-http)$/, `${file} uses unsafe transport`);
    assert.match(manifest.egress, /^(disabled|approval-required)$/, `${file} has unsafe egress`);
    assert.match(manifest.state, /^(local-only|declared-local-paths)$/, `${file} has unsafe state`);

    for (const tool of manifest.tools || []) {
      assert.equal(tool.readOnly, true, `${manifest.name}.${tool.name} must be read-only by default`);
      assert.equal(tool.openWorld, false, `${manifest.name}.${tool.name} must be closed-world by default`);
      assert.match(tool.writes, /^(disabled|approval-required)$/, `${manifest.name}.${tool.name} has unsafe writes`);
      assert.equal(tool.secrets, 'not-required', `${manifest.name}.${tool.name} must not require secrets`);
    }
  }
});
