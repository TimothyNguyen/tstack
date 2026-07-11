import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const FIXTURE = path.resolve(import.meta.dirname, 'tinyurl-fixture');

// Mirror of the stack detection logic from stack/SKILL.md.tmpl
function detectStacks(projectDir) {
  const detected = [];

  const readdir = (dir) => {
    try {
      return fs.readdirSync(dir, { recursive: true })
        .map((f) => (typeof f === 'string' ? f : f.toString()))
        .filter((f) => !f.includes('node_modules'));
    } catch {
      return [];
    }
  };

  const files = readdir(projectDir);

  // React / Node.js
  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.react || deps['@types/react']) detected.push('stack-react-typescript');
  }

  // Postgres (SERIAL or $$ block syntax in SQL files)
  const sqlFiles = files.filter((f) => f.endsWith('.sql'));
  for (const sql of sqlFiles) {
    const content = fs.readFileSync(path.join(projectDir, sql), 'utf8');
    if (content.includes('SERIAL') || content.includes('$$')) {
      if (!detected.includes('stack-postgres')) detected.push('stack-postgres');
    }
    if (/\bGO\b/.test(content) || /EXEC\s+sp_/i.test(content)) {
      if (!detected.includes('stack-sql-server')) detected.push('stack-sql-server');
    }
  }

  // Python
  if (fs.existsSync(path.join(projectDir, 'pyproject.toml')) ||
      fs.existsSync(path.join(projectDir, 'setup.py'))) {
    detected.push('stack-python');
  }

  // .NET
  if (files.some((f) => f.endsWith('.csproj') || f.endsWith('.sln'))) {
    detected.push('stack-csharp');
  }

  // Databricks
  if (fs.existsSync(path.join(projectDir, 'databricks.yml'))) {
    detected.push('stack-databricks');
  }

  return detected;
}

test('tinyurl fixture detects stack-postgres from schema.sql SERIAL keyword', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(stacks.includes('stack-postgres'),
    `expected stack-postgres to be detected, got: ${stacks.join(', ')}`);
});

test('tinyurl fixture does NOT detect stack-sql-server (no T-SQL patterns)', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(!stacks.includes('stack-sql-server'),
    'stack-sql-server must not be detected for a Postgres project');
});

test('tinyurl fixture does NOT detect stack-databricks (no databricks.yml)', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(!stacks.includes('stack-databricks'),
    'stack-databricks must not be detected for tinyurl');
});

test('tinyurl fixture does NOT detect stack-csharp (no .csproj)', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(!stacks.includes('stack-csharp'),
    'stack-csharp must not be detected for tinyurl');
});

test('tinyurl fixture does NOT detect stack-react-typescript (no react dep)', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(!stacks.includes('stack-react-typescript'),
    'stack-react-typescript must not be detected — tinyurl is plain Node.js, not React');
});

test('tinyurl schema.sql file exists and contains SERIAL', () => {
  const schemaPath = path.join(FIXTURE, 'schema.sql');
  assert.ok(fs.existsSync(schemaPath), 'schema.sql must exist in tinyurl fixture');
  const content = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(content.includes('SERIAL'), 'schema.sql must contain SERIAL for Postgres detection');
  assert.ok(content.includes('urls'), 'schema.sql must define the urls table');
});

test('detectStacks detects stack-python from pyproject.toml', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-stack-python-'));
  try {
    fs.writeFileSync(path.join(dir, 'pyproject.toml'), '[tool.poetry]\nname = "app"\n', 'utf8');
    const stacks = detectStacks(dir);
    assert.ok(stacks.includes('stack-python'), `expected stack-python, got: ${stacks.join(', ')}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('detectStacks detects stack-csharp from .csproj file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-stack-csharp-'));
  try {
    fs.writeFileSync(path.join(dir, 'MyApp.csproj'), '<Project Sdk="Microsoft.NET.Sdk"/>\n', 'utf8');
    const stacks = detectStacks(dir);
    assert.ok(stacks.includes('stack-csharp'), `expected stack-csharp, got: ${stacks.join(', ')}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('detectStacks detects stack-databricks from databricks.yml', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-stack-databricks-'));
  try {
    fs.writeFileSync(path.join(dir, 'databricks.yml'), 'bundle:\n  name: my-bundle\n', 'utf8');
    const stacks = detectStacks(dir);
    assert.ok(stacks.includes('stack-databricks'), `expected stack-databricks, got: ${stacks.join(', ')}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('detectStacks detects stack-sql-server from T-SQL GO statement', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-stack-sqlserver-'));
  try {
    fs.writeFileSync(path.join(dir, 'schema.sql'), 'CREATE TABLE Foo (Id INT);\nGO\n', 'utf8');
    const stacks = detectStacks(dir);
    assert.ok(stacks.includes('stack-sql-server'), `expected stack-sql-server, got: ${stacks.join(', ')}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('detectStacks returns empty array for non-existent directory (covers readdir catch)', () => {
  const stacks = detectStacks('/nonexistent-path-xyz-abc');
  assert.deepEqual(stacks, []);
});

test('detectStacks detects stack-postgres from $$ block syntax (covers || right side)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-stack-dollar-'));
  try {
    fs.writeFileSync(path.join(dir, 'migration.sql'), 'CREATE FUNCTION f() RETURNS void AS $$ BEGIN END; $$ LANGUAGE plpgsql;\n', 'utf8');
    const stacks = detectStacks(dir);
    assert.ok(stacks.includes('stack-postgres'), `expected stack-postgres, got: ${stacks.join(', ')}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
