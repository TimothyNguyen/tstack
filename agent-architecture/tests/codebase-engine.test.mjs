import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const pkgRoot = path.join(root, 'codebase-engine');
const srcRoot = path.join(pkgRoot, 'codebase_engine');

function read(rel) {
  return fs.readFileSync(path.join(pkgRoot, rel), 'utf8');
}

function readSrc(file) {
  return fs.readFileSync(path.join(srcRoot, file), 'utf8');
}

// ── Package contract ─────────────────────────────────────────────────────────

test('codebase-engine pyproject.toml declares correct package name and entry points', () => {
  const toml = read('pyproject.toml');

  assert.match(toml, /name = "codebase-engine"/, 'package name must be codebase-engine');
  assert.match(toml, /version = "\d+\.\d+\.\d+"/, 'version must be semver');
  assert.match(toml, /codebase-engine\s*=\s*"codebase_engine\.__main__:main"/, 'CLI entry point missing');
  assert.match(toml, /codebase-engine-mcp\s*=\s*"codebase_engine\.serve:_main"/, 'MCP entry point missing');
});

test('codebase-engine pyproject.toml requires python >= 3.10', () => {
  const toml = read('pyproject.toml');
  assert.match(toml, /requires-python\s*=\s*">=3\.10"/, 'python version floor missing');
});

test('codebase-engine pyproject.toml declares networkx and tree-sitter core dependencies', () => {
  const toml = read('pyproject.toml');
  assert.match(toml, /networkx/, 'networkx dependency missing');
  assert.match(toml, /tree-sitter/, 'tree-sitter dependency missing');
  assert.match(toml, /rapidfuzz/, 'rapidfuzz (fuzzy search) dependency missing');
});

test('codebase-engine pyproject.toml does not reference graphify', () => {
  const toml = read('pyproject.toml');
  assert.doesNotMatch(toml, /graphify/i, 'pyproject.toml must not contain graphify');
});

// ── Brand rename completeness ────────────────────────────────────────────────

test('codebase_engine source files contain no graphify brand references', () => {
  const pyFiles = fs.readdirSync(srcRoot).filter((f) => f.endsWith('.py'));
  assert.ok(pyFiles.length > 5, 'expected multiple Python source files');

  const survivors = [];
  for (const file of pyFiles) {
    const content = readSrc(file);
    if (/graphify/i.test(content)) survivors.push(file);
  }

  assert.deepEqual(survivors, [], `graphify found in: ${survivors.join(', ')}`);
});

test('skill reference markdown files contain no graphify brand references', () => {
  const skillsRoot = path.join(pkgRoot, 'codebase_engine', 'skills');
  if (!fs.existsSync(skillsRoot)) return;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const mdFiles = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) mdFiles.push(...walk(full));
      else if (e.name.endsWith('.md')) mdFiles.push(full);
    }
    return mdFiles;
  }

  const survivors = [];
  for (const file of walk(skillsRoot)) {
    if (/graphify/i.test(fs.readFileSync(file, 'utf8'))) {
      survivors.push(path.relative(pkgRoot, file));
    }
  }

  assert.deepEqual(survivors, [], `graphify found in: ${survivors.join(', ')}`);
});

test('codebase_engine env vars use CODEBASE_ENGINE_ prefix not GRAPHIFY_', () => {
  const pyFiles = fs.readdirSync(srcRoot).filter((f) => f.endsWith('.py'));
  for (const file of pyFiles) {
    const content = readSrc(file);
    assert.doesNotMatch(content, /GRAPHIFY_[A-Z]/, `${file} uses GRAPHIFY_ env var prefix`);
  }
});

// ── Enterprise egress stubs ──────────────────────────────────────────────────

test('serve.py stubs PR tools with enterprise-build error messages', () => {
  const serve = readSrc('serve.py');
  assert.match(serve, /def _tool_list_prs/, '_tool_list_prs stub missing');
  assert.match(serve, /def _tool_get_pr_impact/, '_tool_get_pr_impact stub missing');
  assert.match(serve, /def _tool_triage_prs/, '_tool_triage_prs stub missing');
  assert.match(serve, /PR.*not available in enterprise build|enterprise build.*PR/i, 'PR stub must return enterprise-build error');
});

test('codebase-engine has no always_on/ install directory (enterprise: no host-side injection)', () => {
  const alwaysOn = path.join(srcRoot, 'always_on');
  assert.equal(fs.existsSync(alwaysOn), false, 'always_on/ directory must not exist in enterprise build');
});

test('codebase_engine source does not import removed egress modules (google_workspace, prs, wiki)', () => {
  const pyFiles = fs.readdirSync(srcRoot).filter((f) => f.endsWith('.py'));
  for (const file of pyFiles) {
    const content = readSrc(file);
    assert.doesNotMatch(content, /from codebase_engine\.google_workspace import|import codebase_engine\.google_workspace/, `${file} imports removed google_workspace module`);
    assert.doesNotMatch(content, /from codebase_engine\.prs import|import codebase_engine\.prs/, `${file} imports removed prs module`);
    assert.doesNotMatch(content, /from codebase_engine\.wiki import|import codebase_engine\.wiki/, `${file} imports removed wiki module`);
  }
});

// ── Skill co-location ────────────────────────────────────────────────────────

test('codebase-engine/ contains both Python package and agent skill', () => {
  assert.equal(fs.existsSync(path.join(pkgRoot, 'pyproject.toml')), true, 'pyproject.toml missing');
  assert.equal(fs.existsSync(path.join(pkgRoot, 'SKILL.md.tmpl')), true, 'SKILL.md.tmpl missing');
  assert.equal(fs.existsSync(path.join(pkgRoot, 'SKILL.md')), true, 'SKILL.md missing');
  assert.equal(fs.existsSync(srcRoot), true, 'codebase_engine/ Python package missing');
});

test('no standalone codebase-understander skill folder exists (merged into codebase-engine)', () => {
  assert.equal(fs.existsSync(path.join(root, 'codebase-understander')), false,
    'codebase-understander/ must not exist — skill lives in codebase-engine/');
});

// ── Skill content ────────────────────────────────────────────────────────────

test('codebase-engine SKILL.md documents all primary CLI commands', () => {
  const skill = read('SKILL.md');

  for (const cmd of ['extract', 'query', 'explain', 'path', 'affected', 'update', 'watch']) {
    assert.match(skill, new RegExp(`codebase-engine ${cmd}`), `SKILL.md missing codebase-engine ${cmd} command`);
  }
});

test('codebase-engine SKILL.md documents CODEBASE_OUT env var override', () => {
  const skill = read('SKILL.md');
  assert.match(skill, /CODEBASE_OUT/, 'SKILL.md must document CODEBASE_OUT env var');
});

test('codebase-engine SKILL.md declares enterprise no-egress constraints', () => {
  const skill = read('SKILL.md');
  assert.match(skill, /No.*egress|no.*egress|offline|No data leaves/i, 'SKILL.md must state no-egress constraint');
  assert.match(skill, /No Google Workspace|Google Workspace.*not|google workspace.*removed/i, 'SKILL.md must explicitly exclude Google Workspace');
  assert.match(skill, /No.*GitHub PR|GitHub PR.*not|PR.*egress/i, 'SKILL.md must explicitly exclude GitHub PR egress');
});

test('codebase-engine SKILL.md frontmatter name matches folder', () => {
  const skill = read('SKILL.md');
  assert.match(skill, /^name: codebase-engine$/m, 'SKILL.md frontmatter name must be codebase-engine');
});

test('codebase-engine SKILL.md documents local-only LLM backend constraint', () => {
  const skill = read('SKILL.md');
  assert.match(skill, /CODEBASE_ENGINE_LLM_/, 'SKILL.md must reference LLM env var prefix');
  assert.match(skill, /approved internal endpoint|internal.*endpoint/i, 'SKILL.md must state internal-only LLM requirement');
});

// ── CLI backends (codex-cli, copilot-cli) ────────────────────────────────────

test('codex-cli and copilot-cli are registered in BACKENDS', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /"codex-cli"\s*:\s*\{/, 'codex-cli missing from BACKENDS dict');
  assert.match(llm, /"copilot-cli"\s*:\s*\{/, 'copilot-cli missing from BACKENDS dict');
});

test('codex-cli BACKENDS entry has required keys', () => {
  const llm = readSrc('llm.py');
  const start = llm.indexOf('"codex-cli":');
  assert.ok(start !== -1, 'codex-cli block not found');
  // Grab the next 600 chars which covers the full entry
  const block = llm.slice(start, start + 600);
  assert.match(block, /default_model/, 'codex-cli missing default_model');
  assert.match(block, /max_tokens/, 'codex-cli missing max_tokens');
  assert.match(block, /"vision"\s*:\s*False/, 'codex-cli must have vision: False');
});

test('copilot-cli BACKENDS entry has required keys and reduced max_tokens', () => {
  const llm = readSrc('llm.py');
  const start = llm.indexOf('"copilot-cli":');
  assert.ok(start !== -1, 'copilot-cli block not found');
  const block = llm.slice(start, start + 800);
  assert.match(block, /"max_tokens"\s*:\s*4096/, 'copilot-cli max_tokens must be 4096 (gh copilot designed for short inputs)');
  assert.match(block, /"vision"\s*:\s*False/, 'copilot-cli must have vision: False');
});

test('codex-cli raises RuntimeError with install hint when CLI missing', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /Codex CLI not found on \$PATH/, 'codex-cli missing PATH error message');
  assert.match(llm, /github\.com\/openai\/codex/, 'codex-cli error must include install URL');
});

test('copilot-cli raises RuntimeError with install hint when gh CLI missing', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /GitHub CLI \(gh\) not found on \$PATH/, 'copilot-cli missing gh PATH error message');
  assert.match(llm, /cli\.github\.com/, 'copilot-cli error must include gh install URL');
});

test('codex-cli and copilot-cli have serial-by-default parallel guards', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /CODEBASE_ENGINE_CODEX_CLI_PARALLEL/, 'codex-cli parallel guard env var missing');
  assert.match(llm, /CODEBASE_ENGINE_COPILOT_CLI_PARALLEL/, 'copilot-cli parallel guard env var missing');
});

test('codex-cli and copilot-cli excluded from key requirement check', () => {
  const llm = readSrc('llm.py');
  // Both instances of the key-check exclusion must include codex-cli and copilot-cli
  const exclusionPattern = /backend not in \([^)]*"codex-cli"[^)]*"copilot-cli"[^)]*\)|backend not in \([^)]*"copilot-cli"[^)]*"codex-cli"[^)]*\)/g;
  const matches = [...llm.matchAll(exclusionPattern)];
  assert.ok(matches.length >= 2, 'both key-check exclusions must include codex-cli and copilot-cli');
});

test('codex-cli and copilot-cli excluded from detect_backend auto-resolution', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /"codex-cli"[^)]*"copilot-cli"|"copilot-cli"[^)]*"codex-cli"/, 'detect_backend exclusion must include both CLI backends');
});

test('_strip_ansi helper defined in llm.py', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /def _strip_ansi\(/, '_strip_ansi helper missing');
  assert.match(llm, /\\x1b\\\[/, '_strip_ansi must match ANSI escape sequences');
});

test('_call_codex_cli defined and uses _strip_ansi before _parse_llm_json', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /def _call_codex_cli\(/, '_call_codex_cli function missing');
  // _strip_ansi must appear before _parse_llm_json in the function body
  const fnStart = llm.indexOf('def _call_codex_cli(');
  const fnEnd = llm.indexOf('\ndef _call_copilot_cli(', fnStart);
  const fnBody = llm.slice(fnStart, fnEnd);
  const stripIdx = fnBody.indexOf('_strip_ansi(');
  const parseIdx = fnBody.indexOf('_parse_llm_json(');
  assert.ok(stripIdx !== -1, '_call_codex_cli must call _strip_ansi');
  assert.ok(parseIdx !== -1, '_call_codex_cli must call _parse_llm_json');
  assert.ok(stripIdx < parseIdx, '_strip_ansi must precede _parse_llm_json in _call_codex_cli');
});

test('_call_copilot_cli defined and uses gh copilot explain', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /def _call_copilot_cli\(/, '_call_copilot_cli function missing');
  assert.match(llm, /gh.*copilot.*explain|"gh", "copilot", "explain"/, '_call_copilot_cli must invoke gh copilot explain');
});

test('codex-cli and copilot-cli wired into extract_files_direct dispatch', () => {
  const llm = readSrc('llm.py');
  assert.match(llm, /backend == "codex-cli"[\s\S]{0,50}_call_codex_cli/, 'codex-cli not dispatched in extract_files_direct');
  assert.match(llm, /backend == "copilot-cli"[\s\S]{0,50}_call_copilot_cli/, 'copilot-cli not dispatched in extract_files_direct');
});
