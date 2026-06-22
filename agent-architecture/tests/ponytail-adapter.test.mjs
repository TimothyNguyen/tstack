import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const hooks = path.join(root, 'adapters', 'ponytail', 'hooks');

function run(script, env, input = '') {
  return spawnSync(process.execPath, [path.join(hooks, script)], {
    env: { ...process.env, ...env },
    input,
    encoding: 'utf8',
  });
}

test('ponytail hooks default to repo-local state and emit Codex context', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-ponytail-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('ponytail-activate.cjs', {
    PLUGIN_DATA: pluginData,
    PONYTAIL_DEFAULT_MODE: 'ultra',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.ponytail-active'), 'utf8'), 'ultra');
  const output = JSON.parse(result.stdout);
  assert.equal(output.systemMessage, 'PONYTAIL:ULTRA');
  assert.match(output.hookSpecificOutput.additionalContext, /PONYTAIL MODE ACTIVE/);

  fs.rmSync(temp, { recursive: true, force: true });
});

test('ponytail mode tracker changes and clears active state', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-ponytail-'));
  const pluginData = path.join(temp, 'plugin-data');
  const env = { PLUGIN_DATA: pluginData };

  let result = run('ponytail-mode-tracker.cjs', env, JSON.stringify({ prompt: '/ponytail lite' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.ponytail-active'), 'utf8'), 'lite');
  assert.equal(JSON.parse(result.stdout).systemMessage, 'PONYTAIL:LITE');

  result = run('ponytail-mode-tracker.cjs', env, JSON.stringify({ prompt: 'normal mode' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(pluginData, '.ponytail-active')), false);
  assert.equal(JSON.parse(result.stdout).systemMessage, 'PONYTAIL:OFF');

  fs.rmSync(temp, { recursive: true, force: true });
});

test('ponytail config rejects undeclared external state by default', async () => {
  const { getStateDir } = await import('../adapters/ponytail/hooks/ponytail-config.cjs');
  assert.equal(path.relative(root, getStateDir()).startsWith('..'), false);
});

test('ponytail MCP instruction helper serves only runtime modes', async () => {
  const mod = await import('../adapters/ponytail/mcp/instructions.js');
  assert.deepEqual(mod.MODES, ['lite', 'full', 'ultra']);
  assert.equal(mod.resolveMode('ultra'), 'ultra');
  assert.equal(mod.MODES.includes(mod.resolveMode('off')), true);
  assert.match(mod.buildInstructions('full'), /PONYTAIL MODE ACTIVE/);
});
