const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  addResource,
  classifyCategory,
  componentToResource,
  emptyRegistry,
  exportSkills,
  generatedHostPaths,
  sourceSubfolder,
  writeExport,
} = require('../scripts/export-agent-registry');

test('classifyCategory maps tstack skill paths to registry categories', () => {
  assert.equal(classifyCategory('stacks/stack-python/SKILL.md.tmpl'), 'stack');
  assert.equal(classifyCategory('adapters/adapter-github/SKILL.md.tmpl'), 'adapter');
  assert.equal(classifyCategory('agents/swe/SKILL.md.tmpl'), 'agent');
  assert.equal(classifyCategory('agents/security/SKILL.md.tmpl'), 'agent');
  assert.equal(
    classifyCategory('stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/agents/build-perf.agent.md'),
    'agent',
  );
  assert.equal(classifyCategory('skills/security-review/SKILL.md.tmpl'), 'skill');
});

test('sourceSubfolder strips skill entrypoint path', () => {
  assert.equal(sourceSubfolder('skills/spec/SKILL.md.tmpl'), 'skills/spec');
});

test('generatedHostPaths keeps host output paths predictable', () => {
  assert.deepEqual(generatedHostPaths('spec'), {
    claude: 'agent-architecture/generated/claude/skills/spec',
    codex: 'agent-architecture/generated/codex/skills/spec',
    copilot: 'agent-architecture/generated/copilot/skills/spec',
  });
});

test('addResource routes resources into agent-registry sections', () => {
  const registry = emptyRegistry();
  addResource(registry, {
    spec: {
      tstack: {
        category: 'adapter',
      },
    },
  });
  assert.equal(registry.adapters.length, 1);
});

test('writeExport converts skills index to agent-registry resources', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-registry-export-'));
  const inputPath = path.join(tempDir, 'skills.index.json');
  const outputPath = path.join(tempDir, 'export.json');
  const pluginOutputPath = path.join(tempDir, 'plugin-registry.json');

  fs.writeFileSync(inputPath, JSON.stringify({
    generatedAt: '2026-07-10T00:00:00.000Z',
    count: 1,
    skills: [{
      name: 'spec',
      version: '0.1.1',
      description: 'Spec skill',
      path: 'skills/spec/SKILL.md.tmpl',
      agents: ['spec-agent'],
    }],
  }));

  const payload = writeExport({
    input: inputPath,
    output: outputPath,
    pluginOutput: pluginOutputPath,
    repositoryUrl: 'https://example.test/tstack',
    commit: 'abc123',
  });

  assert.equal(fs.existsSync(outputPath), true);
  assert.equal(fs.existsSync(pluginOutputPath), true);
  assert.equal(payload.counts.total, 1);
  assert.equal(payload.registry.skills[0].kind, 'Skill');
  assert.equal(payload.registry.skills[0].metadata.name, 'spec');
  assert.equal(payload.registry.skills[0].spec.source.repository.subfolder, 'agent-architecture/skills/spec');
  assert.equal(payload.registry.skills[0].spec.tstack.agents[0], 'spec-agent');
});

test('writeExport uses governance inventory to fill registry sections', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-registry-export-'));
  const inputPath = path.join(tempDir, 'skills.index.json');
  const inventoryPath = path.join(tempDir, 'governance-inventory.json');
  const outputPath = path.join(tempDir, 'registry.json');

  fs.writeFileSync(inputPath, JSON.stringify({
    skills: [{
      name: 'stack-python',
      version: '0.2.0',
      description: 'Python stack',
      path: 'stacks/stack-python/SKILL.md.tmpl',
      agents: ['swe'],
    }],
  }));
  fs.writeFileSync(inventoryPath, JSON.stringify({
    components: [
      { type: 'stack', name: 'stack-python', path: 'agent-architecture/stacks/stack-python/SKILL.md', description: '' },
      { type: 'agent', name: 'governance', path: 'agents/governance/SKILL.md', description: '' },
    ],
  }));

  const payload = writeExport({
    input: inputPath,
    inventory: inventoryPath,
    output: outputPath,
    repositoryUrl: 'https://example.test/tstack',
    commit: 'abc123',
  });

  assert.equal(payload.counts.total, 2);
  assert.equal(payload.registry.stacks.length, 1);
  assert.equal(payload.registry.agents.length, 1);
  assert.equal(payload.registry.stacks[0].spec.source.repository.subfolder, 'agent-architecture/stacks/stack-python');
  assert.equal(payload.registry.agents[0].spec.source.repository.subfolder, 'agents/governance');
});

test('componentToResource preserves root and agent-architecture paths', () => {
  const resource = componentToResource(
    { type: 'skill', name: 'root-skill', path: 'root-skill/SKILL.md', description: '' },
    new Map(),
    { repositoryUrl: 'https://example.test/tstack', commit: '' },
  );

  assert.equal(resource.spec.source.repository.subfolder, 'root-skill');
});

test('exportSkills reads default shape', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-registry-export-'));
  const inputPath = path.join(tempDir, 'skills.index.json');
  fs.writeFileSync(inputPath, JSON.stringify({ skills: [] }));

  const payload = exportSkills({
    input: inputPath,
    output: path.join(tempDir, 'unused.json'),
    repositoryUrl: 'https://example.test/tstack',
    commit: '',
  });

  assert.equal(payload.kind, 'AgentRegistryExport');
  assert.equal(payload.counts.total, 0);
  assert.deepEqual(Object.keys(payload.registry), [
    'skills',
    'agents',
    'workflows',
    'adapters',
    'toolProviders',
    'stacks',
    'domains',
    'profiles',
    'schemas',
  ]);
});
