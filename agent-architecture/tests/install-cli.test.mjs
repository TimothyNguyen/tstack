import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const binPath = path.join(root, 'bin', 'agent-architecture.mjs');
const installScript = path.join(root, 'scripts', 'install.mjs');

function runCli(args, options = {}) {
  return execFileSync(process.execPath, [binPath, ...args], {
    encoding: 'utf8',
    ...options,
  });
}

test('list-agents prints canonical agents including specialty agents', () => {
  const output = runCli(['list-agents']);
  assert.match(output, /orchestrate/);
  assert.match(output, /security/);
  assert.match(output, /swe/);
});

test('list-mcp-profiles prints built-in MCP profiles', () => {
  const output = runCli(['list-mcp-profiles']);
  assert.match(output, /github/);
  assert.match(output, /postgres/);
  assert.match(output, /slack/);
});

test('list-hosts prints supported and future hosts', () => {
  const output = runCli(['list-hosts']);
  assert.match(output, /supported:/);
  assert.match(output, /claude/);
  assert.match(output, /future:/);
  assert.match(output, /google-adk/);
});

test('.agent-config.example.json is valid JSON with expected fields', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, '.agent-config.example.json'), 'utf8'));
  assert.equal(config.private, true);
  assert.ok(Array.isArray(config.hosts) && config.hosts.length >= 2);
  assert.ok(Array.isArray(config.agents) && config.agents.includes('orchestrate'));
  assert.ok(Array.isArray(config.mcpProfiles) && config.mcpProfiles.includes('github'));
});

test('install fails fast on unsupported host ids', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-invalid-host-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-invalid-host-cwd-'));
  try {
    fs.writeFileSync(path.join(cwd, '.agent-config.json'), JSON.stringify({
      private: true,
      hosts: ['claude', 'google-adk'],
      agents: ['swe'],
    }), 'utf8');
    assert.throws(() => {
      execFileSync(process.execPath, [installScript, '--private', '--target', tmp], {
        cwd,
        stdio: 'pipe',
      });
    }, /Unsupported install hosts:/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
