const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const lib = require('../scripts/governance-lib');
const cli = require('../bin/governance');

test('internal path helpers cover classification branches', () => {
  const config = lib.loadConfig();

  assert.equal(lib.toPosix(`a${path.sep}b`), 'a/b');
  assert.equal(lib.fileExists(path.join(lib.REPO_ROOT, 'README.md')), true);
  assert.equal(lib.shouldSkipDirectory('node_modules', config), true);
  assert.equal(lib.shouldSkipDirectory('.claude-plugin', config), false);
  assert.equal(lib.shouldSkipDirectory('.hidden', config), true);

  assert.equal(lib.inferTypeFromSkillPath('foo.agent.md'), 'agent');
  assert.equal(lib.inferTypeFromSkillPath('agents/demo/SKILL.md'), 'agent');
  assert.equal(lib.inferTypeFromSkillPath('x/agents/demo/SKILL.md'), 'agent');
  assert.equal(lib.inferTypeFromSkillPath('x/packages/skills/agents/demo/SKILL.md'), 'agent');
  assert.equal(lib.inferTypeFromSkillPath('x/packages/adapters/demo/SKILL.md'), 'adapter');
  assert.equal(lib.inferTypeFromSkillPath('x/packages/stacks/demo/SKILL.md'), 'stack');
  assert.equal(lib.inferTypeFromSkillPath('plain/SKILL.md'), 'skill');
  assert.equal(lib.inferTypeFromSkillPath('plain/readme.md'), null);

  assert.equal(lib.inferComponentName('SKILL.md', {}), path.basename(lib.REPO_ROOT));
  assert.equal(lib.inferComponentName('agents/demo/SKILL.md', {}), 'demo');
  assert.equal(lib.inferComponentName('foo.agent.md', {}), 'foo');
  assert.equal(lib.inferComponentName('x/SKILL.md', { name: 'named' }), 'named');

  assert.equal(lib.inferNamespace('agent-architecture/packages/skills/x/SKILL.md'), 'agent-architecture/packages/skills');
  assert.equal(lib.inferNamespace('agent-architecture/packages/stacks/x/SKILL.md'), 'agent-architecture/packages/stacks');
  assert.equal(lib.inferNamespace('agent-architecture/packages/adapters/x/SKILL.md'), 'agent-architecture/packages/adapters');
  assert.equal(lib.inferNamespace('agent-architecture/plugins/x/skills/y/SKILL.md'), 'agent-architecture/plugins');
  assert.equal(lib.inferNamespace('agent-architecture/agents/x/SKILL.md'), 'agent-architecture/agents');
  assert.equal(lib.inferNamespace('agents/x/SKILL.md'), 'agents');
  assert.equal(lib.inferNamespace('mcp-atlassian'), 'mcps');
  assert.equal(lib.inferNamespace('README.md'), 'repo');
});

test('internal discovery helpers handle duplicates, invalid paths, and summaries', () => {
  const plugins = lib.detectPluginDirectories([
    'agent-architecture/plugins/agent-architecture',
    'agent-architecture/plugins/agent-architecture',
    'missing/plugins/not-real',
  ]);
  assert.equal(plugins.length, 1);
  assert.equal(plugins[0].type, 'plugin');

  const mcps = lib.detectMcpDirectories([
    'mcp-atlassian',
    'mcp-atlassian',
    'mcp-missing',
  ]);
  assert.equal(mcps.length, 1);
  assert.equal(mcps[0].type, 'mcp');

  assert.equal(lib.buildComponentRecord('README.md'), null);
  assert.equal(lib.buildComponentRecord('agents/governance/SKILL.md').type, 'agent');

  const walked = lib.walkRepo(lib.loadConfig(), path.join(lib.REPO_ROOT, 'docs'));
  assert.ok(walked.directories.includes('docs'));
  assert.ok(walked.files.some(file => file.startsWith('docs/')));

  const report = lib.withDigest(lib.discoverComponents());
  const summary = lib.renderSummary(report);
  assert.match(summary, /## Components/);
  assert.deepEqual(lib.stablePayload(report).digest, undefined);
});

test('CLI helpers can be invoked directly without throwing', () => {
  const config = lib.loadConfig();
  assert.doesNotThrow(() => cli.printFindings('Test', [], cli.colors.green));
  assert.doesNotThrow(() => cli.printFindings('Test', ['x'], cli.colors.red));
  assert.doesNotThrow(() => cli.buildLiveState(config));
  assert.doesNotThrow(() => cli.runHealth(config));
  assert.doesNotThrow(() => cli.runReport(config));
  assert.doesNotThrow(() => cli.runValidate(config));
  assert.doesNotThrow(() => cli.runBuild({
    ...config,
    inventoryAbsolutePath: path.join(lib.REPO_ROOT, 'generated', 'governance-inventory.json'),
    summaryAbsolutePath: path.join(lib.REPO_ROOT, 'generated', 'governance-summary.md'),
  }));
});
