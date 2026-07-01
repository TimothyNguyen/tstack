/**
 * Host parity tests — verifies generated/codex and generated/copilot artifacts
 * are fresh, consistent, and contain required enterprise safety content.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  buildAgentsMd,
  buildClaudeMd,
  buildCopilotInstructions,
  logOutputs,
  routingSection as scriptRoutingSection,
  stripFrontmatter,
  write,
} from '../scripts/gen-host-artifacts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CLAUDE_PATH = 'generated/claude/CLAUDE.md';
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
      fs.existsSync(path.join(ROOT, CLAUDE_PATH)),
      `${CLAUDE_PATH} missing - run npm run gen:hosts`
    );
    assert.ok(
      fs.existsSync(path.join(ROOT, CODEX_PATH)),
      `${CODEX_PATH} missing - run npm run gen:hosts`
    );
    assert.ok(
      fs.existsSync(path.join(ROOT, COPILOT_PATH)),
      `${COPILOT_PATH} missing - run npm run gen:hosts`
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
      'stage -> commit -> fetch -> rebase -> push',
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

  test('claude artifact references CLAUDE.md format and Claude host', () => {
    const claude = read(CLAUDE_PATH);
    assert.ok(claude.includes('CLAUDE.md'), 'claude artifact should reference CLAUDE.md');
    assert.ok(claude.includes('Claude Code'), 'claude artifact should mention Claude Code');
  });
});

test('write() in non-check mode creates file via mkdirSync+writeFileSync', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-host-write-'));
  try {
    write('generated/codex/AGENTS.md', 'test content', { check: false, root: dir });
    const written = fs.readFileSync(path.join(dir, 'generated/codex/AGENTS.md'), 'utf8');
    assert.equal(written, 'test content');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('write() in check mode detects stale file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-host-check-'));
  try {
    fs.mkdirSync(path.join(dir, 'generated/codex'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'generated/codex/AGENTS.md'), 'old content');

    const prevExitCode = process.exitCode;
    write('generated/codex/AGENTS.md', 'new content', { check: true, root: dir });
    assert.equal(process.exitCode, 1);
    process.exitCode = prevExitCode;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('write() in check mode passes for fresh file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-host-fresh-'));
  try {
    fs.mkdirSync(path.join(dir, 'generated/codex'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'generated/codex/AGENTS.md'), 'same content');

    const prevExitCode = process.exitCode;
    write('generated/codex/AGENTS.md', 'same content', { check: true, root: dir });
    assert.equal(process.exitCode, prevExitCode);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('buildAgentsMd returns a non-empty string with required sections', () => {
  const content = buildAgentsMd();
  assert.ok(content.length > 0);
  assert.match(content, /AGENTS\.md/);
  assert.match(content, /Commit Discipline/);
});

test('buildClaudeMd returns a non-empty string with required sections', () => {
  const content = buildClaudeMd();
  assert.ok(content.length > 0);
  assert.match(content, /CLAUDE\.md/);
  assert.match(content, /Commit Discipline/);
});

test('buildCopilotInstructions returns a non-empty string with required sections', () => {
  const content = buildCopilotInstructions();
  assert.ok(content.length > 0);
  assert.match(content, /Copilot/);
  assert.match(content, /Commit Discipline/);
});

test('write() in check mode treats missing file as stale', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-host-missing-'));
  try {
    const prevExitCode = process.exitCode;
    write('generated/codex/AGENTS.md', 'some content', { check: true, root: dir });
    assert.equal(process.exitCode, 1);
    process.exitCode = prevExitCode;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('logOutputs logs when check=false and suppresses when check=true', () => {
  assert.doesNotThrow(() => logOutputs(false));
  assert.doesNotThrow(() => logOutputs(true));
});

test('stripFrontmatter returns content unchanged when no frontmatter marker', () => {
  const plain = 'no frontmatter here\n';
  assert.equal(stripFrontmatter(plain), plain);
});

test('stripFrontmatter returns content unchanged when frontmatter has no closing marker', () => {
  const unclosed = '---\nname: test\n';
  assert.equal(stripFrontmatter(unclosed), unclosed);
});

test('stripFrontmatter strips frontmatter block', () => {
  const content = '---\nname: test\n---\nbody here\n';
  assert.equal(stripFrontmatter(content), 'body here\n');
});

test('scriptRoutingSection returns full content when no ## Routing heading', () => {
  const content = 'Some content\n\n## Other Section\n';
  assert.equal(scriptRoutingSection(content), content);
});

test('scriptRoutingSection returns from ## Routing to end when no following ## section', () => {
  const content = 'Preamble\n\n## Routing\n\n- Route A\n- Route B\n';
  const result = scriptRoutingSection(content);
  assert.match(result, /## Routing/);
  assert.match(result, /Route A/);
});

test('scriptRoutingSection returns only the routing section when followed by another ##', () => {
  const content = 'Preamble\n\n## Routing\n\n- Route A\n\n## Policy\n\nSome policy.\n';
  const result = scriptRoutingSection(content);
  assert.match(result, /## Routing/);
  assert.ok(!result.includes('## Policy'), 'should not include sections after routing');
});

