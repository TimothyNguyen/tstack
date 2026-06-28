// Governance Engine Tests

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('Governance Engine', () => {
  test('governance-spec.yaml is valid YAML', () => {
    const spec = fs.readFileSync(path.join(__dirname, '..', 'governance-spec.yaml'), 'utf8');
    expect(() => yaml.load(spec)).not.toThrow();
  });

  test('schema is valid JSON', () => {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'governance-component-manifest.schema.json'), 'utf8');
    expect(() => JSON.parse(schema)).not.toThrow();
  });

  test('governance.js is executable', () => {
    const govScript = path.join(__dirname, '..', 'bin', 'governance.js');
    expect(fs.existsSync(govScript)).toBe(true);
  });

  test('required directories exist', () => {
    const dirs = ['.git/hooks', 'agents/governance', 'bin'];
    dirs.forEach(dir => {
      expect(fs.existsSync(path.join(__dirname, '..', dir))).toBe(true);
    });
  });

  test('required files exist', () => {
    const files = [
      'README.md',
      'SPEC.md',
      'SKILL.md',
      'TMPL.md',
      'CHANGELOG.md',
      'GOVERNANCE_EXCEPTIONS.md',
      'governance-spec.yaml',
      'governance-component-manifest.schema.json',
      'example-governance-manifest.yaml',
      'GOVERNANCE_ENGINE_INSTALL.md',
      'REPO_CHANGE_GOVERNANCE_WORKFLOW.md',
      'agents/governance/SKILL.md',
      'bin/governance.js'
    ];
    files.forEach(file => {
      expect(fs.existsSync(path.join(__dirname, '..', file))).toBe(true);
    });
  });
});
