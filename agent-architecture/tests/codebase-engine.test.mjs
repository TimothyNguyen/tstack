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

test('codebase_engine env vars use CODEBASE_ENGINE_ prefix not GRAPHIFY_', () => {
  const pyFiles = fs.readdirSync(srcRoot).filter((f) => f.endsWith('.py'));
  for (const file of pyFiles) {
    const content = readSrc(file);
    assert.doesNotMatch(content, /GRAPHIFY_[A-Z]/, `${file} uses GRAPHIFY_ env var prefix`);
  }
});

// ── Enterprise egress stubs ──────────────────────────────────────────────────

test('detect.py stubs Google Workspace as empty frozenset (no external API egress)', () => {
  const detect = readSrc('detect.py');
  assert.match(detect, /GOOGLE_WORKSPACE_EXTENSIONS.*=.*frozenset\(\)/, 'Google Workspace extensions must be stubbed empty');
  assert.match(detect, /def google_workspace_enabled.*:\n\s+return False/s, 'google_workspace_enabled must always return False');
});

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
