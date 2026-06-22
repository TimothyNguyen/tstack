import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const hooks = path.join(root, 'adapters', 'seniorswe-concise', 'hooks');

function run(script, env, input = '') {
  return spawnSync(process.execPath, [path.join(hooks, script)], {
    env: { ...process.env, ...env },
    input,
    encoding: 'utf8',
  });
}

test('seniorswe-concise hooks default to repo-local state and emit Codex context', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-concise-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-activate.cjs', {
    PLUGIN_DATA: pluginData,
    SENIORSWE_CONCISE_DEFAULT_MODE: 'ultra',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.seniorswe-concise-active'), 'utf8'), 'ultra');
  const output = JSON.parse(result.stdout);
  assert.equal(output.systemMessage, 'SENIORSWE-CONCISE:ULTRA');
  assert.match(output.hookSpecificOutput.additionalContext, /SENIORSWE-CONCISE MODE ACTIVE/);

  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker changes and clears active state', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-concise-'));
  const pluginData = path.join(temp, 'plugin-data');
  const env = { PLUGIN_DATA: pluginData };

  let result = run('seniorswe-concise-mode-tracker.cjs', env, JSON.stringify({ prompt: '/seniorswe-concise lite' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.seniorswe-concise-active'), 'utf8'), 'lite');
  assert.equal(JSON.parse(result.stdout).systemMessage, 'SENIORSWE-CONCISE:LITE');

  result = run('seniorswe-concise-mode-tracker.cjs', env, JSON.stringify({ prompt: 'normal mode' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(pluginData, '.seniorswe-concise-active')), false);
  assert.equal(JSON.parse(result.stdout).systemMessage, 'SENIORSWE-CONCISE:OFF');

  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise config rejects undeclared external state by default', async () => {
  const { getStateDir } = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-config.cjs');
  assert.equal(path.relative(root, getStateDir()).startsWith('..'), false);
});

test('seniorswe-concise MCP instruction helper serves only runtime modes', async () => {
  const mod = await import('../adapters/seniorswe-concise/mcp/instructions.js');
  assert.deepEqual(mod.MODES, ['lite', 'full', 'ultra']);
  assert.equal(mod.resolveMode('ultra'), 'ultra');
  assert.equal(mod.MODES.includes(mod.resolveMode('off')), true);
  assert.match(mod.buildInstructions('full'), /SENIORSWE-CONCISE MODE ACTIVE/);
});
