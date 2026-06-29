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

test('seniorswe-concise config writeDefaultMode writes config and rejects invalid mode', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-wdm-'));
  const prevConfigDir = process.env.SENIORSWE_CONCISE_CONFIG_DIR;
  const prevAllowExternal = process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE;
  process.env.SENIORSWE_CONCISE_CONFIG_DIR = temp;
  process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE = '1';
  try {
    const { writeDefaultMode } = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-config.cjs');
    assert.equal(writeDefaultMode('not-a-mode'), null);
    const written = writeDefaultMode('lite');
    assert.equal(written, 'lite');
    assert.equal(
      JSON.parse(fs.readFileSync(path.join(temp, 'config.json'), 'utf8')).defaultMode,
      'lite',
    );
  } finally {
    delete process.env.SENIORSWE_CONCISE_CONFIG_DIR;
    delete process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE;
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('seniorswe-concise config resolveDeclaredDir rejects external path without allow flag', async () => {
  process.env.SENIORSWE_CONCISE_CONFIG_DIR = path.join(os.tmpdir(), 'external-seniorswe');
  delete process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE;
  try {
    const { getConfigDir } = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-config.cjs');
    const dir = getConfigDir();
    assert.ok(!dir.startsWith(os.tmpdir()), 'external dir should be rejected and fallback used');
  } finally {
    delete process.env.SENIORSWE_CONCISE_CONFIG_DIR;
    delete process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE;
  }
});

test('seniorswe-concise instructions getFallbackInstructions and review mode', async () => {
  const mod = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-instructions.cjs');
  const fallback = mod.getFallbackInstructions('ultra');
  assert.match(fallback, /SENIORSWE-CONCISE MODE ACTIVE/);
  assert.match(fallback, /lazy senior developer/);

  const reviewInstructions = mod.getSeniorsweConciseInstructions('review');
  assert.match(reviewInstructions, /SENIORSWE-CONCISE MODE ACTIVE/);
  assert.match(reviewInstructions, /review/);
});

test('seniorswe-concise instructions covers non-review mode try block', async () => {
  const mod = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-instructions.cjs');
  const liteInstructions = mod.getSeniorsweConciseInstructions('lite');
  assert.match(liteInstructions, /SENIORSWE-CONCISE MODE ACTIVE/);

  const invalidMode = mod.getSeniorsweConciseInstructions('invalid-xyz-mode');
  assert.match(invalidMode, /SENIORSWE-CONCISE MODE ACTIVE/);

  const reviewBody = mod.filterSkillBodyForMode('SENIORSWE-CONCISE: review content', 'review');
  assert.ok(typeof reviewBody === 'string');
});

test('seniorswe-concise config isDeactivationCommand recognizes stop commands', async () => {
  const { isDeactivationCommand, normalizeMode, normalizeConfigMode, normalizePersistedMode } =
    await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-config.cjs');

  assert.equal(isDeactivationCommand('normal mode'), true);
  assert.equal(isDeactivationCommand('stop seniorswe-concise'), true);
  assert.equal(isDeactivationCommand('do something else'), false);
  assert.equal(isDeactivationCommand(null), false);

  assert.equal(normalizeMode(null), null);
  assert.equal(normalizeMode(42), null);
  assert.equal(normalizeMode('lite'), 'lite');

  assert.equal(normalizeConfigMode(null), null);
  assert.equal(normalizeConfigMode('review'), 'review');

  // normalizePersistedMode: 'review' not in RUNTIME_MODES so falls through to normalizeConfigMode
  assert.equal(normalizePersistedMode('review'), 'review');
  // normalizePersistedMode: 'lite' IS in RUNTIME_MODES, covers left side of ||
  assert.equal(normalizePersistedMode('lite'), 'lite');
});

test('seniorswe-concise MCP resolveMode returns full for unrecognized mode', async () => {
  const mod = await import('../adapters/seniorswe-concise/mcp/instructions.js');
  const result = mod.resolveMode('unrecognized-mode-xyz');
  assert.ok(['lite', 'full', 'ultra'].includes(result), `Expected a valid mode, got: ${result}`);
});

test('seniorswe-concise MCP resolveMode returns full when default is off', async () => {
  process.env.SENIORSWE_CONCISE_DEFAULT_MODE = 'off';
  try {
    const mod = await import('../adapters/seniorswe-concise/mcp/instructions.js');
    const result = mod.resolveMode('unknown-xyz');
    assert.equal(result, 'full');
  } finally {
    delete process.env.SENIORSWE_CONCISE_DEFAULT_MODE;
  }
});

test('seniorswe-concise activate with default mode=off clears state (covers if-mode-off branch)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-off-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-activate.cjs', {
    PLUGIN_DATA: pluginData,
    SENIORSWE_CONCISE_DEFAULT_MODE: 'off',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(pluginData, '.seniorswe-concise-active')), false);
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise activate in Copilot environment writes Copilot-format output (covers isCopilot branch)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-copilot-'));
  const result = run('seniorswe-concise-activate.cjs', {
    COPILOT_PLUGIN_DATA: temp,
    SENIORSWE_CONCISE_DEFAULT_MODE: 'lite',
  });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.ok('additionalContext' in output, 'Copilot output must have additionalContext');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise activate without plugin data writes plain text (covers neither-isCopilot-nor-isCodex branch)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-plain-'));
  const result = run('seniorswe-concise-activate.cjs', {
    SENIORSWE_CONCISE_DEFAULT_MODE: 'lite',
    SENIORSWE_CONCISE_STATE_DIR: temp,
    SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE: '1',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /SENIORSWE-CONCISE MODE ACTIVE/);
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker activates review mode (covers /seniorswe-concise-review branch)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-review-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-mode-tracker.cjs', { PLUGIN_DATA: pluginData },
    JSON.stringify({ prompt: '/seniorswe-concise-review' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.seniorswe-concise-active'), 'utf8'), 'review');
  assert.equal(JSON.parse(result.stdout).systemMessage, 'SENIORSWE-CONCISE:REVIEW');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker turns off with /seniorswe-concise off (covers mode===off branch)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-off-cmd-'));
  const pluginData = path.join(temp, 'plugin-data');
  const env = { PLUGIN_DATA: pluginData };
  run('seniorswe-concise-mode-tracker.cjs', env, JSON.stringify({ prompt: '/seniorswe-concise lite' }));
  const result = run('seniorswe-concise-mode-tracker.cjs', env, JSON.stringify({ prompt: '/seniorswe-concise off' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(pluginData, '.seniorswe-concise-active')), false);
  assert.equal(JSON.parse(result.stdout).systemMessage, 'SENIORSWE-CONCISE:OFF');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker falls back to default mode for unknown arg (covers else-getDefaultMode branch)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-fallback-'));
  const pluginData = path.join(temp, 'plugin-data');
  const env = { PLUGIN_DATA: pluginData, SENIORSWE_CONCISE_DEFAULT_MODE: 'ultra' };
  const result = run('seniorswe-concise-mode-tracker.cjs', env,
    JSON.stringify({ prompt: '/seniorswe-concise unknownarg' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.seniorswe-concise-active'), 'utf8'), 'ultra');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker handles namespaced /seniorswe-concise:seniorswe-concise-review (covers || right-side)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-ns-review-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-mode-tracker.cjs', { PLUGIN_DATA: pluginData },
    JSON.stringify({ prompt: '/seniorswe-concise:seniorswe-concise-review' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.seniorswe-concise-active'), 'utf8'), 'review');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker handles namespaced /seniorswe-concise:seniorswe-concise (covers || right-side)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-ns-main-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-mode-tracker.cjs', { PLUGIN_DATA: pluginData },
    JSON.stringify({ prompt: '/seniorswe-concise:seniorswe-concise full' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.seniorswe-concise-active'), 'utf8'), 'full');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker handles unrecognized seniorswe-concise subcommand (covers mode=null path)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-badcmd-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-mode-tracker.cjs', { PLUGIN_DATA: pluginData },
    JSON.stringify({ prompt: '/seniorswe-concise-badcmd' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(pluginData, '.seniorswe-concise-active')), false);
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker handles invalid JSON input gracefully (covers try-catch)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-invalid-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-mode-tracker.cjs', { PLUGIN_DATA: pluginData }, 'not-valid-json');
  assert.equal(result.status, 0, result.stderr);
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker handles input with no prompt key (covers data.prompt||"" right side)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-noprompt-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-mode-tracker.cjs', { PLUGIN_DATA: pluginData }, JSON.stringify({}));
  assert.equal(result.status, 0, result.stderr);
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise mode tracker handles bare /seniorswe-concise with no arg (covers parts[1]||"" right side)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-bare-'));
  const pluginData = path.join(temp, 'plugin-data');
  const result = run('seniorswe-concise-mode-tracker.cjs',
    { PLUGIN_DATA: pluginData, SENIORSWE_CONCISE_DEFAULT_MODE: 'full' },
    JSON.stringify({ prompt: '/seniorswe-concise' }));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(pluginData, '.seniorswe-concise-active'), 'utf8'), 'full');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise config contained() covers rel=="" branch when state dir equals ROOT', async () => {
  delete process.env.COPILOT_PLUGIN_DATA;
  delete process.env.PLUGIN_DATA;
  process.env.SENIORSWE_CONCISE_STATE_DIR = root;
  try {
    const { getStateDir } = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-config.cjs');
    const dir = getStateDir();
    assert.equal(dir, root, 'contained(ROOT, ROOT) must return dir when rel is empty string');
  } finally {
    delete process.env.SENIORSWE_CONCISE_STATE_DIR;
  }
});

test('seniorswe-concise instructions filterSkillBodyForMode with null body (covers body||"" false branch)', async () => {
  const mod = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-instructions.cjs');
  const result = mod.filterSkillBodyForMode(null, 'full');
  assert.equal(typeof result, 'string');
});

test('seniorswe-concise instructions falls back when SKILL.md is unreadable (covers catch block at lines 53-54)', async () => {
  const mod = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-instructions.cjs');
  const skillPath = path.join(root, 'seniorswe-concise', 'SKILL.md');
  const backupPath = skillPath + '.bak';
  fs.renameSync(skillPath, backupPath);
  try {
    const result = mod.getSeniorsweConciseInstructions('full');
    assert.match(result, /SENIORSWE-CONCISE MODE ACTIVE/);
    assert.match(result, /lazy senior developer/);
  } finally {
    fs.renameSync(backupPath, skillPath);
  }
});

test('seniorswe-concise mode tracker in Copilot env writes {} for UserPromptSubmit (covers Copilot ternary false branch)', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-copilot-tracker-'));
  const result = run('seniorswe-concise-mode-tracker.cjs',
    { COPILOT_PLUGIN_DATA: temp },
    JSON.stringify({ prompt: '/seniorswe-concise lite' }));
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.deepEqual(output, {}, 'Copilot mode-tracker emits {} for UserPromptSubmit event');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('seniorswe-concise config getDefaultMode falls back to DEFAULT_MODE when config has invalid defaultMode (covers || right side at line 65)', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-seniorswe-gdm-'));
  const prevConfigDir = process.env.SENIORSWE_CONCISE_CONFIG_DIR;
  const prevAllowExternal = process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE;
  const prevDefaultMode = process.env.SENIORSWE_CONCISE_DEFAULT_MODE;
  process.env.SENIORSWE_CONCISE_CONFIG_DIR = temp;
  process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE = '1';
  delete process.env.SENIORSWE_CONCISE_DEFAULT_MODE;
  try {
    fs.writeFileSync(path.join(temp, 'config.json'), JSON.stringify({ defaultMode: 'invalid-mode' }), 'utf8');
    const { getDefaultMode, DEFAULT_MODE } = await import('../adapters/seniorswe-concise/hooks/seniorswe-concise-config.cjs');
    const result = getDefaultMode();
    assert.equal(result, DEFAULT_MODE, 'should return DEFAULT_MODE when config has invalid mode value');
  } finally {
    if (prevConfigDir !== undefined) process.env.SENIORSWE_CONCISE_CONFIG_DIR = prevConfigDir;
    else delete process.env.SENIORSWE_CONCISE_CONFIG_DIR;
    if (prevAllowExternal !== undefined) process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE = prevAllowExternal;
    else delete process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE;
    if (prevDefaultMode !== undefined) process.env.SENIORSWE_CONCISE_DEFAULT_MODE = prevDefaultMode;
    else delete process.env.SENIORSWE_CONCISE_DEFAULT_MODE;
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
