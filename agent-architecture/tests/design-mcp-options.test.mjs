import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('design skills document Figma MCP and OpenPencil MCP options', () => {
  for (const skill of ['design-review', 'design-html']) {
    const body = read(`${skill}/SKILL.md.tmpl`);
    for (const phrase of [
      'Figma MCP',
      'https://github.com/mcp/com.figma.mcp/mcp',
      'OpenPencil MCP',
      '@open-pencil/mcp',
      'openpencil-mcp',
      'mcp__open-pencil__*',
    ]) {
      assert.match(body, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${skill} missing ${phrase}`);
    }
  }
});

test('enterprise policy gates design MCP tools and modules', () => {
  const policy = JSON.parse(read('policies/enterprise-default.json'));
  assert.equal(policy.tools.figmaMcp, 'approval-required');
  assert.equal(policy.tools.openPencilMcp, 'approval-required');
  assert.equal(policy.modules.figmaMcp, 'optional');
  assert.equal(policy.modules.openPencilMcp, 'optional');
});

test('adapter registry includes optional design MCP adapters', () => {
  const registry = JSON.parse(read('adapters/registry.json'));
  const byId = new Map(registry.adapters.map((adapter) => [adapter.id, adapter]));

  assert.equal(byId.get('figma-mcp')?.module, 'figmaMcp');
  assert.equal(byId.get('figma-mcp')?.skill, 'design-review');
  assert.equal(byId.get('figma-mcp')?.egress, 'approval-required');

  assert.equal(byId.get('open-pencil-mcp')?.module, 'openPencilMcp');
  assert.equal(byId.get('open-pencil-mcp')?.skill, 'design-review');
  assert.equal(byId.get('open-pencil-mcp')?.egress, 'approval-required');
});
