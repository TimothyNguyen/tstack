import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

// Import routing and replicate routing logic to avoid spawning a subprocess
const ROOT = path.resolve(import.meta.dirname, '..');
const ROUTING = JSON.parse(fs.readFileSync(path.join(ROOT, 'agents', 'routing.json'), 'utf8'));

function globToRegex(pattern) {
  const normalized = pattern.replace(/\\/g, '/');
  let regex = '';
  let i = 0;
  while (i < normalized.length) {
    const ch = normalized[i];
    if (ch === '*' && normalized[i + 1] === '*') {
      i += 2;
      if (normalized[i] === '/') {
        // **/ → zero or more path segments
        regex += '(?:[^/]+/)*';
        i++;
      } else {
        regex += '.*';
      }
    } else if (ch === '*') {
      regex += '[^/]*';
      i++;
    } else if (ch === '?') {
      regex += '[^/]';
      i++;
    } else {
      regex += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
      i++;
    }
  }
  return new RegExp(`^${regex}$`);
}

function routeFile(file) {
  const normalized = file.replace(/\\/g, '/');
  for (const rule of ROUTING.rules) {
    for (const pattern of rule.patterns) {
      if (globToRegex(pattern).test(normalized)) {
        return { agents: rule.agents, reason: rule.reason };
      }
    }
  }
  return { agents: ROUTING.default, reason: 'default fallback' };
}

test('routing.json exists and has required shape', () => {
  assert.ok(Array.isArray(ROUTING.rules), 'rules must be an array');
  assert.ok(Array.isArray(ROUTING.default), 'default must be an array');
  assert.ok(ROUTING.rules.length > 0, 'must have at least one rule');
  for (const rule of ROUTING.rules) {
    assert.ok(Array.isArray(rule.patterns), `rule missing patterns: ${JSON.stringify(rule)}`);
    assert.ok(Array.isArray(rule.agents), `rule missing agents: ${JSON.stringify(rule)}`);
    assert.ok(typeof rule.reason === 'string', `rule missing reason: ${JSON.stringify(rule)}`);
  }
});

test('test files route to qa-agent', () => {
  const cases = [
    'tests/auth.test.ts',
    'src/__tests__/api.spec.js',
    'tests/integration/flow.test.mjs',
    'tests/unit/parser.test.py',
  ];
  for (const f of cases) {
    const { agents } = routeFile(f);
    assert.ok(agents.includes('qa-agent'), `expected qa-agent for ${f}, got ${agents}`);
  }
});

test('SQL and migration files route to migration', () => {
  const cases = [
    'migrations/0042_add_user.sql',
    'schema/tables.sql',
    'db/migrations/2026_init.sql',
  ];
  for (const f of cases) {
    const { agents } = routeFile(f);
    assert.ok(agents.includes('migration'), `expected migration for ${f}, got ${agents}`);
  }
});

test('infrastructure files route to cloud', () => {
  const cases = [
    'infra/main.tf',
    'k8s/deployment.yaml',
    '.github/workflows/ci.yml',
    'Dockerfile',
  ];
  for (const f of cases) {
    const { agents } = routeFile(f);
    assert.ok(agents.includes('cloud'), `expected cloud for ${f}, got ${agents}`);
  }
});

test('Python / data files route to data', () => {
  const cases = [
    'src/train.py',
    'notebooks/analysis.ipynb',
    'databricks.yml',
    'pyproject.toml',
  ];
  for (const f of cases) {
    const { agents } = routeFile(f);
    assert.ok(agents.includes('data'), `expected data for ${f}, got ${agents}`);
  }
});

test('C# / .NET files route to swe', () => {
  const cases = [
    'Api/Controllers/AuthController.cs',
    'MyApp.sln',
    'src/MyLib.csproj',
  ];
  for (const f of cases) {
    const { agents } = routeFile(f);
    assert.ok(agents.includes('swe'), `expected swe for ${f}, got ${agents}`);
  }
});

test('UI / design files route to design-agent', () => {
  const cases = [
    'src/components/Button.tsx',
    'styles/global.css',
    'src/Button.scss',
  ];
  for (const f of cases) {
    const { agents } = routeFile(f);
    assert.ok(agents.includes('design-agent'), `expected design-agent for ${f}, got ${agents}`);
  }
});

test('documentation files route to spec-agent', () => {
  const cases = [
    'docs/install-spec.md',
    'docs/decisions/ADR-0001.md',
    'README.md',
    'CHANGELOG.md',
  ];
  for (const f of cases) {
    const { agents } = routeFile(f);
    assert.ok(agents.includes('spec-agent'), `expected spec-agent for ${f}, got ${agents}`);
  }
});

test('agent infrastructure files route to orchestrate', () => {
  const cases = [
    'agents/swe/SKILL.md.tmpl',
    'scripts/install.mjs',
    'core/subagents.mjs',
    'policies/enterprise-default.json',
  ];
  for (const f of cases) {
    const { agents } = routeFile(f);
    assert.ok(agents.includes('orchestrate'), `expected orchestrate for ${f}, got ${agents}`);
  }
});

test('TypeScript files route to swe', () => {
  const { agents } = routeFile('src/api/router.ts');
  assert.ok(agents.includes('swe'), `expected swe for TypeScript file`);
});

test('unmatched files fall back to default agents', () => {
  const { agents, reason } = routeFile('some/unknown/binary.bin');
  assert.deepEqual(agents, ROUTING.default);
  assert.equal(reason, 'default fallback');
});

test('globToRegex handles ? as single-char wildcard', () => {
  const re = globToRegex('src/?.ts');
  assert.ok(re.test('src/a.ts'), '? matches one character');
  assert.ok(!re.test('src/ab.ts'), '? does not match two characters');
  assert.ok(!re.test('src//ts'), '? does not match separator');
});
