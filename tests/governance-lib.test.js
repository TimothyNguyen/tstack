const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  discoverComponents,
  diffInventories,
  loadConfig,
  readInventory,
  shouldSkipPath,
  validateDiscovery,
  withDigest,
  writeGovernanceArtifacts,
} = require('../scripts/governance-lib');

function makeTempConfig() {
  const base = loadConfig();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gov-artifacts-'));
  return {
    ...base,
    inventoryAbsolutePath: path.join(tempDir, 'inventory.json'),
    summaryAbsolutePath: path.join(tempDir, 'summary.md'),
  };
}

test('loadConfig resolves absolute artifact paths', () => {
  const config = loadConfig();
  assert.match(config.inventoryAbsolutePath, /generated[\\/]governance-inventory\.json$/);
  assert.match(config.summaryAbsolutePath, /generated[\\/]governance-summary\.md$/);
  assert.match(config.agentDocAbsolutePath, /GOVERNANCE_AUTOMATION\.md$/);
  assert.ok(Array.isArray(config.ignorePathPrefixes));
});

test('discoverComponents finds representative component types', () => {
  const report = discoverComponents();
  assert.equal(report.generatedBy, 'scripts/build-governance.js');
  assert.ok(report.counts.total > 100);
  assert.ok(report.counts.skill > 0);
  assert.ok(report.counts.agent > 0);
  assert.ok(report.counts.plugin > 0);
  assert.ok(report.counts.adapter > 0);
  assert.ok(report.components.some(component => component.path === 'agents/governance/SKILL.md'));
  assert.ok(report.components.some(component => component.path === 'mcp-atlassian'));
});

test('withDigest produces stable digest metadata', () => {
  const report = withDigest(discoverComponents());
  assert.equal(typeof report.digest, 'string');
  assert.equal(report.digest.length, 64);
});

test('writeGovernanceArtifacts writes inventory and summary', () => {
  const config = makeTempConfig();
  const report = writeGovernanceArtifacts(config);
  assert.equal(fs.existsSync(config.inventoryAbsolutePath), true);
  assert.equal(fs.existsSync(config.summaryAbsolutePath), true);

  const inventory = JSON.parse(fs.readFileSync(config.inventoryAbsolutePath, 'utf8'));
  const summary = fs.readFileSync(config.summaryAbsolutePath, 'utf8');
  assert.equal(inventory.digest, report.digest);
  assert.match(summary, /# Governance Inventory/);
  assert.match(summary, /## Counts/);
});

test('readInventory returns null for missing file and object for existing file', () => {
  const config = makeTempConfig();
  assert.equal(readInventory(config), null);
  writeGovernanceArtifacts(config);
  assert.equal(typeof readInventory(config), 'object');
});

test('validateDiscovery reports duplicates and missing agent doc', () => {
  const config = loadConfig();
  const report = withDigest(discoverComponents());
  report.components.push({ ...report.components[0] });

  const findings = validateDiscovery(report, {
    ...config,
    agentDocAbsolutePath: path.join(os.tmpdir(), 'missing-governance-doc.md'),
    agentDocPath: 'missing-governance-doc.md',
  });

  assert.ok(findings.some(finding => finding.includes('Duplicate component id')));
  assert.ok(findings.some(finding => finding.includes('Missing agent-readable governance doc')));
});

test('diffInventories reports missing inventory, stale digest, and membership drift', () => {
  const actual = withDigest({
    generatedBy: 'scripts/build-governance.js',
    configVersion: 1,
    counts: { total: 1, skill: 1 },
    components: [{ id: 'skill:a', type: 'skill', name: 'a', path: 'a/SKILL.md' }],
  });

  assert.deepEqual(diffInventories(null, actual), ['Inventory file missing. Run npm run governance:build.']);

  const expected = {
    ...actual,
    digest: '0'.repeat(64),
    components: [{ id: 'skill:b', type: 'skill', name: 'b', path: 'b/SKILL.md' }],
  };

  const diffs = diffInventories(expected, actual);
  assert.ok(diffs.some(diff => diff.includes('stale')));
  assert.ok(diffs.some(diff => diff.includes('Missing from inventory: skill:a')));
  assert.ok(diffs.some(diff => diff.includes('Present in inventory only: skill:b')));
});

test('shouldSkipPath blocks known doc-noise roots', () => {
  const config = loadConfig();
  assert.equal(shouldSkipPath('graphify/worked/example', config), true);
  assert.equal(
    shouldSkipPath('agent-architecture/packages/stacks/stack-databricks/bundle-examples/default_python', config),
    true,
  );
  assert.equal(shouldSkipPath('agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills', config), false);
});
