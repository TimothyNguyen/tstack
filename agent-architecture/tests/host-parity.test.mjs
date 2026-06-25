/**
 * Host parity tests — verifies generated/codex and generated/copilot artifacts
 * are fresh, consistent, and contain required enterprise safety content.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CODEX_PATH = 'generated/codex/AGENTS.md';
const COPILOT_PATH = 'generated/copilot/copilot-instructions.md';

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function routingSection(text) {
  const start = text.indexOf('## Routing');
  if (start === -1) return '';
  const next = text.indexOf('\n## ', start + 1);
  return next === -1 ? text.slice(start) : text.slice(start, next);
}

describe('host-parity', () => {
  test('generated host artifacts exist', () => {
    assert.ok(
      fs.existsSync(path.join(ROOT, CODEX_PATH)),
      `${CODEX_PATH} missing — run npm run gen:hosts`
    );
    assert.ok(
      fs.existsSync(path.join(ROOT, COPILOT_PATH)),
      `${COPILOT_PATH} missing — run npm run gen:hosts`
    );
  });

  test('host artifacts are up-to-date (check:hosts passes)', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/gen-host-artifacts.mjs', '--check'],
      { cwd: ROOT, encoding: 'utf8' }
    );
    assert.equal(
      result.status,
      0,
      `Host artifacts stale:\n${result.stderr || result.stdout}\nRun: npm run gen:hosts`
    );
  });

  test('both artifacts list all 10 role-based agents', () => {
    const agents = [
      'cloud', 'data', 'design-agent', 'interviewer', 'migration',
      'orchestrate', 'pm', 'qa-agent', 'spec-agent', 'swe',
    ];
    const codex = read(CODEX_PATH);
    const copilot = read(COPILOT_PATH);
    for (const agent of agents) {
      assert.ok(codex.includes(`/${agent}`), `codex artifact missing agent /${agent}`);
      assert.ok(copilot.includes(`/${agent}`), `copilot artifact missing agent /${agent}`);
    }
  });

  test('routing sections are identical across hosts', () => {
    const codex = read(CODEX_PATH);
    const copilot = read(COPILOT_PATH);
    const codexRouting = routingSection(codex);
    const copilotRouting = routingSection(copilot);
    assert.ok(codexRouting.length > 0, 'codex artifact has no ## Routing section');
    assert.ok(copilotRouting.length > 0, 'copilot artifact has no ## Routing section');
    assert.equal(
      codexRouting,
      copilotRouting,
      'Routing sections diverged between codex and copilot artifacts'
    );
  });

  test('both artifacts contain required safety defaults', () => {
    const required = [
      'No public telemetry',
      'No public update checks',
      'No cookie/session import',
      'Privileged tools require policy approval',
    ];
    const artifacts = [[CODEX_PATH, read(CODEX_PATH)], [COPILOT_PATH, read(COPILOT_PATH)]];
    for (const [name, content] of artifacts) {
      for (const phrase of required) {
        assert.ok(content.includes(phrase), `${name} missing safety phrase: "${phrase}"`);
      }
    }
  });

  test('both artifacts contain commit discipline', () => {
    const required = [
      'Conventional Commits',
      'no-verify',
      'stage → commit → fetch → rebase → push',
    ];
    const artifacts = [[CODEX_PATH, read(CODEX_PATH)], [COPILOT_PATH, read(COPILOT_PATH)]];
    for (const [name, content] of artifacts) {
      for (const phrase of required) {
        assert.ok(content.includes(phrase), `${name} missing commit discipline phrase: "${phrase}"`);
      }
    }
  });

  test('both artifacts have no forbidden egress strings', () => {
    const forbidden = ['ngrok', 'supabase.co', 'cookieImport', 'telemetry.send'];
    const artifacts = [[CODEX_PATH, read(CODEX_PATH)], [COPILOT_PATH, read(COPILOT_PATH)]];
    for (const [name, content] of artifacts) {
      for (const pattern of forbidden) {
        assert.ok(
          !content.toLowerCase().includes(pattern.toLowerCase()),
          `${name} contains forbidden string: "${pattern}"`
        );
      }
    }
  });

  test('codex artifact references AGENTS.md format and Codex host', () => {
    const codex = read(CODEX_PATH);
    assert.ok(codex.includes('AGENTS.md'), 'codex artifact should reference AGENTS.md');
    assert.ok(codex.includes('Codex'), 'codex artifact should mention Codex');
  });

  test('copilot artifact references install path and Copilot host', () => {
    const copilot = read(COPILOT_PATH);
    assert.ok(copilot.includes('Copilot'), 'copilot artifact should mention Copilot');
    assert.ok(
      copilot.includes('copilot-instructions.md'),
      'copilot artifact should reference install path'
    );
  });
});
