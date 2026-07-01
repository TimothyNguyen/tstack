const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

test('governance-spec.yaml is valid YAML', () => {
  const spec = fs.readFileSync(path.join(__dirname, '..', 'governance-spec.yaml'), 'utf8');
  assert.doesNotThrow(() => yaml.load(spec));
});

test('schema is valid JSON', () => {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'governance-component-manifest.schema.json'), 'utf8');
  assert.doesNotThrow(() => JSON.parse(schema));
});

test('required directories exist', () => {
  for (const dir of ['.git/hooks', 'agents/governance', 'bin', 'docs', 'generated']) {
    assert.equal(fs.existsSync(path.join(__dirname, '..', dir)), true, `missing directory ${dir}`);
  }
});

test('required files exist', () => {
  const files = [
    'README.md',
    'SPEC.md',
    'SKILL.md',
    'TMPL.md',
    'CHANGELOG.md',
    'GOVERNANCE_AUTOMATION.md',
    'GOVERNANCE_EXCEPTIONS.md',
    'governance-spec.yaml',
    'governance-component-manifest.schema.json',
    'example-governance-manifest.yaml',
    'GOVERNANCE_ENGINE_INSTALL.md',
    'REPO_CHANGE_GOVERNANCE_WORKFLOW.md',
    'agents/governance/SKILL.md',
    'bin/governance.js',
    'scripts/governance-lib.js',
  ];

  for (const file of files) {
    assert.equal(fs.existsSync(path.join(__dirname, '..', file)), true, `missing file ${file}`);
  }
});
