import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '../..');
const FIXTURE = path.resolve(import.meta.dirname, 'tinyurl-fixture');
const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');
const DEFAULT_AGENTS = [
  'cloud',
  'data',
  'design-agent',
  'diagram-agent',
  'interviewer',
  'migration',
  'migration-engineer',
  'orchestrate',
  'pm',
  'qa-agent',
  'release-agent',
  'security',
  'spec-agent',
  'swe',
];

function runInstall(targetDir, extraArgs = []) {
  execFileSync(process.execPath, [
    INSTALL_SCRIPT,
    '--private',
    '--target', targetDir,
    ...extraArgs,
  ], { cwd: FIXTURE, stdio: 'pipe' });
}

test('install into tinyurl fixture produces all expected artifacts', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-agent-'));
  try {
    runInstall(tmp);

    // Manifest exists and is valid JSON
    const manifestPath = path.join(tmp, 'install-manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'install-manifest.json missing');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.private, true, 'manifest.private must be true');
    assert.deepEqual(manifest.agents, ['swe', 'qa-agent', 'spec-agent', 'pm'],
      'manifest agents must match .agent-config.json');

    // VERSION written
    assert.ok(fs.existsSync(path.join(tmp, 'VERSION')), 'VERSION file missing');

    // Host artifacts written for all 3 hosts
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')), 'CLAUDE.md missing');
    assert.ok(fs.existsSync(path.join(tmp, 'AGENTS.md')), 'AGENTS.md missing');
    assert.ok(fs.existsSync(path.join(tmp, 'copilot-instructions.md')), 'copilot-instructions.md missing');

    // settings.json written with private mode
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.equal(settings.env.CLAUDE_CODE_DISABLE_AUTO_MEMORY, '1', 'auto-memory must be disabled');
    assert.ok('db' in settings.mcpServers, 'db MCP server must be wired');
    assert.ok(!('cavemem' in settings.mcpServers), 'cavemem must not be installed (private mode)');
    assert.ok(!('gbrain' in settings.mcpServers), 'gbrain must not be installed (private mode)');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('install dry-run writes nothing to disk', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-dry-'));
  try {
    runInstall(tmp, ['--dry-run']);
    const files = fs.readdirSync(tmp);
    assert.deepEqual(files, [], `dry-run must write nothing, but found: ${files.join(', ')}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor passes after install', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-doctor-'));
  try {
    runInstall(tmp);
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, [INSTALL_SCRIPT, '--doctor', '--target', tmp], {
        cwd: FIXTURE, stdio: 'pipe',
      });
    }, 'doctor must exit 0 after a clean install');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor on empty directory exits with error (covers VERSION/manifest/settings missing paths)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-doctor-empty-'));
  try {
    const result = execFileSync(process.execPath, [INSTALL_SCRIPT, '--doctor', '--target', tmp], {
      cwd: FIXTURE, stdio: 'pipe', encoding: 'utf8',
    });
    assert.fail('doctor should fail on empty dir');
  } catch (err) {
    assert.equal(err.status, 1, 'doctor must exit with status 1 when files are missing');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('install from directory without .agent-config.json uses default agents', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-install-defaults-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-no-config-'));
  try {
    execFileSync(process.execPath, [INSTALL_SCRIPT, '--private', '--target', tmp], {
      cwd, stdio: 'pipe',
    });
    assert.ok(fs.existsSync(path.join(tmp, 'VERSION')), 'VERSION must be written');
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')), 'CLAUDE.md must be written');
    const manifest = JSON.parse(fs.readFileSync(path.join(tmp, 'install-manifest.json'), 'utf8'));
    assert.deepEqual(manifest.agents, DEFAULT_AGENTS,
      'default agents must be used when no .agent-config.json exists');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('install with --docker-mcp injects docker-gateway into settings.json', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-docker-mcp-'));
  try {
    execFileSync(process.execPath, [
      INSTALL_SCRIPT, '--private', '--target', tmp, '--docker-mcp', 'default',
    ], { cwd: FIXTURE, stdio: 'pipe' });
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.ok('docker-gateway' in settings.mcpServers, 'docker-gateway MCP must be injected');
    assert.equal(settings.mcpServers['docker-gateway'].command, 'docker');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor reports missing agent skill file (covers manifest-present/skill-missing path)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-doctor-partial-'));
  try {
    runInstall(tmp);
    // Delete an agent skill file to trigger the missing-skill check
    fs.rmSync(path.join(tmp, 'skills', 'swe'), { recursive: true, force: true });
    try {
      execFileSync(process.execPath, [INSTALL_SCRIPT, '--doctor', '--target', tmp], {
        cwd: FIXTURE, stdio: 'pipe',
      });
      assert.fail('doctor should fail when agent skill is missing');
    } catch (err) {
      assert.equal(err.status, 1, 'doctor must exit with status 1 when agent skill is missing');
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('install with unknown agent name fails fast with error', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-fake-agent-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-fake-cwd-'));
  try {
    fs.writeFileSync(path.join(cwd, '.agent-config.json'), JSON.stringify({
      private: true,
      hosts: ['claude'],
      agents: ['swe', 'nonexistent-agent-xyz'],
      mcps: [],
    }), 'utf8');
    assert.throws(() => {
      execFileSync(process.execPath, [INSTALL_SCRIPT, '--private', '--target', tmp], {
        cwd, stdio: 'pipe',
      });
    }, /Unknown agents:/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('install without --private flag covers non-private mode branches', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-non-private-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-non-private-cwd-'));
  try {
    execFileSync(process.execPath, [INSTALL_SCRIPT, '--target', tmp], {
      cwd, stdio: 'pipe',
    });
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.ok(!('env' in settings), 'non-private install must not add env settings block');
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')), 'CLAUDE.md must be written');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('install with --hosts claude only skips codex and copilot artifacts (covers activeHosts FALSE branches)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-claude-only-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-claude-only-cwd-'));
  try {
    execFileSync(process.execPath, [INSTALL_SCRIPT, '--private', '--target', tmp, '--hosts', 'claude'], {
      cwd, stdio: 'pipe',
    });
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')), 'CLAUDE.md must be written');
    assert.ok(!fs.existsSync(path.join(tmp, 'AGENTS.md')), 'AGENTS.md must not be written when codex not in hosts');
    assert.ok(!fs.existsSync(path.join(tmp, 'copilot-instructions.md')), 'copilot-instructions.md must not be written');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('private install strips private-only MCPs (covers PRIVATE_STRIP_MCPS return-false branch)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-strip-mcp-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-strip-cwd-'));
  try {
    fs.writeFileSync(path.join(cwd, '.agent-config.json'), JSON.stringify({
      private: true,
      hosts: ['claude'],
      agents: ['swe'],
      mcps: [
        { name: 'cavemem', command: 'cavemem', args: [], credentialEnvVars: [] },
        { name: 'db', command: 'uvx', args: ['mcp-server-postgres'], credentialEnvVars: ['DATABASE_URL'] },
      ],
    }), 'utf8');
    execFileSync(process.execPath, [INSTALL_SCRIPT, '--private', '--target', tmp], {
      cwd, stdio: 'pipe',
    });
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.ok(!('cavemem' in settings.mcpServers), 'cavemem must be stripped in private mode');
    assert.ok('db' in settings.mcpServers, 'db MCP must remain in private mode');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('doctor with docker-gateway configured triggers docker health checks (covers docker-gateway branch)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-doctor-docker-'));
  try {
    execFileSync(process.execPath, [
      INSTALL_SCRIPT, '--private', '--target', tmp, '--docker-mcp', 'default',
    ], { cwd: FIXTURE, stdio: 'pipe' });
    // Use spawnSync so non-zero exit (docker not running) does not throw
    spawnSync(process.execPath, [INSTALL_SCRIPT, '--doctor', '--target', tmp], {
      cwd: FIXTURE, stdio: 'pipe',
    });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('install with MCP without optional args/credentialEnvVars fields (covers || [] right sides)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-mcp-minimal-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-mcp-minimal-cwd-'));
  try {
    fs.writeFileSync(path.join(cwd, '.agent-config.json'), JSON.stringify({
      private: false,
      hosts: ['claude'],
      agents: ['swe'],
      mcps: [{ name: 'mydb', command: 'pg' }],
    }), 'utf8');
    execFileSync(process.execPath, [INSTALL_SCRIPT, '--target', tmp], { cwd, stdio: 'pipe' });
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.ok('mydb' in settings.mcpServers, 'mydb MCP must be installed');
    assert.deepEqual(settings.mcpServers.mydb.args, [], 'args must default to []');
    assert.deepEqual(settings.mcpServers.mydb.env, {}, 'env must be empty when no credentialEnvVars');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('install with --docker-mcp and no profile arg uses "default" (covers inner ternary false branch)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-docker-noprofile-'));
  try {
    execFileSync(process.execPath, [
      INSTALL_SCRIPT, '--private', '--target', tmp, '--docker-mcp',
    ], { cwd: FIXTURE, stdio: 'pipe' });
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.ok('docker-gateway' in settings.mcpServers, 'docker-gateway must be injected');
    assert.equal(settings.mcpServers['docker-gateway'].args[4], 'default', 'profile must default to "default"');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('install dry-run without --target uses default .agent path (covers targetIdx ternary false branch)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-no-target-cwd-'));
  try {
    execFileSync(process.execPath, [INSTALL_SCRIPT, '--private', '--dry-run'], {
      cwd: tmp, stdio: 'pipe',
    });
    // Dry-run writes nothing; target defaults to <cwd>/.agent which never gets created
    assert.deepEqual(fs.readdirSync(tmp), [], 'dry-run with no --target must write nothing');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('install with minimal config defaults missing agents and hosts, leaves mcps empty', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-minimal-config-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-minimal-config-cwd-'));
  try {
    fs.writeFileSync(path.join(cwd, '.agent-config.json'), JSON.stringify({
      private: false,
    }), 'utf8');
    execFileSync(process.execPath, [INSTALL_SCRIPT, '--target', tmp], { cwd, stdio: 'pipe' });
    // With no agents field: config.agents||[] triggers right side, no agent skills installed
    // With no mcps field: config.mcps||[] triggers right side, no MCPs in settings
    // With no hosts field: config.hosts||HOSTS triggers right side, all 3 hosts written
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')), 'CLAUDE.md must be written (claude in default hosts)');
    assert.ok(fs.existsSync(path.join(tmp, 'AGENTS.md')), 'AGENTS.md must be written (codex in default hosts)');
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.deepEqual(settings.mcpServers, {}, 'no MCPs when config.mcps absent');
    const manifest = JSON.parse(fs.readFileSync(path.join(tmp, 'install-manifest.json'), 'utf8'));
    assert.deepEqual(manifest.agents, DEFAULT_AGENTS, 'default agents must be installed when config.agents absent');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('install can enable a specialty agent and built-in MCP profile from config', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-specialty-agent-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-specialty-agent-cwd-'));
  try {
    fs.writeFileSync(path.join(cwd, '.agent-config.json'), JSON.stringify({
      private: true,
      hosts: ['claude'],
      agents: ['orchestrate', 'security'],
      mcpProfiles: ['github'],
    }), 'utf8');
    execFileSync(process.execPath, [INSTALL_SCRIPT, '--private', '--target', tmp], {
      cwd, stdio: 'pipe',
    });

    assert.ok(fs.existsSync(path.join(tmp, 'skills', 'orchestrate', 'SKILL.md')), 'orchestrate agent must be installed');
    assert.ok(fs.existsSync(path.join(tmp, 'skills', 'security', 'SKILL.md')), 'security agent must be installed');

    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.ok('github' in settings.mcpServers, 'built-in github MCP profile must be wired');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('doctor reports missing utility skill file (covers manifest-present/utility-skill-missing path)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-doctor-util-'));
  try {
    runInstall(tmp);
    const manifest = JSON.parse(fs.readFileSync(path.join(tmp, 'install-manifest.json'), 'utf8'));
    if (manifest.skills.length === 0) return; // no utility skills to remove
    const firstSkill = manifest.skills[0];
    fs.rmSync(path.join(tmp, 'skills', firstSkill), { recursive: true, force: true });
    try {
      execFileSync(process.execPath, [INSTALL_SCRIPT, '--doctor', '--target', tmp], {
        cwd: FIXTURE, stdio: 'pipe',
      });
      assert.fail('doctor should fail when utility skill is missing');
    } catch (err) {
      assert.equal(err.status, 1, 'doctor must exit with status 1 when utility skill is missing');
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
