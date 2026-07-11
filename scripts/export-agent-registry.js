const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const DEFAULT_INPUT = path.join(REPO_ROOT, 'agent-architecture', 'generated', 'skills.index.json');
const DEFAULT_INVENTORY = path.join(REPO_ROOT, 'generated', 'governance-inventory.json');
const DEFAULT_OUTPUT = path.join(REPO_ROOT, 'generated', 'agent-registry', 'registry.json');
const DEFAULT_PLUGIN_OUTPUT = path.join(REPO_ROOT, 'agent-architecture', 'plugins', 'agent-pack', 'registry.json');
const DEFAULT_REPOSITORY_URL = 'https://github.com/TimothyNguyen/tstack';

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    pluginOutput: DEFAULT_PLUGIN_OUTPUT,
    inventory: DEFAULT_INVENTORY,
    repositoryUrl: DEFAULT_REPOSITORY_URL,
    commit: process.env.GIT_COMMIT || '',
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--input' && next) {
      options.input = path.resolve(next);
      index += 1;
    } else if (arg === '--output' && next) {
      options.output = path.resolve(next);
      index += 1;
    } else if (arg === '--plugin-output' && next) {
      options.pluginOutput = path.resolve(next);
      index += 1;
    } else if (arg === '--inventory' && next) {
      options.inventory = path.resolve(next);
      index += 1;
    } else if (arg === '--repository-url' && next) {
      options.repositoryUrl = next;
      index += 1;
    } else if (arg === '--commit' && next) {
      options.commit = next;
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  return options;
}

function classifyCategory(skillPath) {
  const normalized = skillPath.replace(/\\/g, '/').replace(/^agent-architecture\//, '');
  if (normalized.includes('/agents/') || normalized.startsWith('agents/')) return 'agent';
  if (normalized.startsWith('stacks/')) return 'stack';
  if (normalized.startsWith('domains/')) return 'domain';
  if (normalized.startsWith('adapters/')) return 'adapter';
  if (normalized.startsWith('tool-providers/')) return 'toolProvider';
  if (normalized.startsWith('agents/')) return 'agent';
  return 'skill';
}

function sourceSubfolder(skillPath) {
  const normalized = skillPath.replace(/\\/g, '/');
  if (normalized.endsWith('/SKILL.md') || normalized.endsWith('/SKILL.md.tmpl')) {
    return toPosix(path.posix.dirname(normalized));
  }
  return toPosix(path.posix.dirname(normalized));
}

function generatedHostPaths(name) {
  return {
    claude: `agent-architecture/generated/claude/skills/${name}`,
    codex: `agent-architecture/generated/codex/skills/${name}`,
    copilot: `agent-architecture/generated/copilot/skills/${name}`,
  };
}

function skillToResource(skill, options) {
  const subfolder = sourceSubfolder(skill.path);
  const category = classifyCategory(skill.path);
  const entrypoint = path.posix.basename(skill.path.replace(/\\/g, '/')).replace(/\.tmpl$/, '');
  const sourceEntrypoint = path.posix.basename(skill.path.replace(/\\/g, '/'));

  return {
    apiVersion: 'agent.dev/v1alpha1',
    kind: 'Skill',
    metadata: {
      name: skill.name,
      tag: skill.version || '0.1.0',
      labels: {
        'tstack.dev/category': category,
      },
    },
    spec: {
      title: skill.name,
      description: skill.description || '',
      source: {
        repository: {
          url: options.repositoryUrl,
          commit: options.commit,
          subfolder: `agent-architecture/${subfolder}`,
        },
      },
      tstack: {
        contentType: 'skill-directory',
        entrypoint,
        sourceEntrypoint,
        category,
        agents: skill.agents || [],
        generated: generatedHostPaths(skill.name),
      },
    },
  };
}

function componentToResource(component, indexByName, options) {
  const indexed = indexByName.get(component.name) || {};
  const normalizedPath = component.path.replace(/\\/g, '/');
  const hasAgentArchitecturePrefix = normalizedPath.startsWith('agent-architecture/');
  const relativePath = hasAgentArchitecturePrefix
    ? normalizedPath.slice('agent-architecture/'.length)
    : normalizedPath;
  const subfolder = hasAgentArchitecturePrefix
    ? `agent-architecture/${sourceSubfolder(relativePath)}`
    : sourceSubfolder(relativePath);
  const category = component.type === 'mcp' ? 'toolProvider' : classifyCategory(relativePath);
  const entrypoint = path.posix.basename(relativePath);
  const sourceEntrypoint = entrypoint === 'SKILL.md' ? 'SKILL.md.tmpl' : entrypoint;

  return {
    apiVersion: 'agent.dev/v1alpha1',
    kind: component.type === 'mcp' ? 'ToolProvider' : 'Skill',
    metadata: {
      name: component.name,
      tag: indexed.version || '0.1.0',
      labels: {
        'agent.dev/category': category,
      },
    },
    spec: {
      title: component.name,
      description: indexed.description || component.description || '',
      source: {
        repository: {
          url: options.repositoryUrl,
          commit: options.commit,
          subfolder,
        },
      },
      tstack: {
        contentType: component.type === 'mcp' ? 'tool-provider' : 'skill-directory',
        entrypoint,
        sourceEntrypoint,
        category,
        agents: indexed.agents || [],
        generated: generatedHostPaths(component.name),
      },
    },
  };
}

function emptyRegistry() {
  return {
    skills: [],
    agents: [],
    workflows: [],
    adapters: [],
    toolProviders: [],
    stacks: [],
    domains: [],
    profiles: [],
    schemas: [],
  };
}

function addResource(registry, resource) {
  const category = resource.spec.tstack.category;
  if (category === 'agent') {
    registry.agents.push(resource);
  } else if (category === 'adapter') {
    registry.adapters.push(resource);
  } else if (category === 'stack') {
    registry.stacks.push(resource);
  } else if (category === 'domain') {
    registry.domains.push(resource);
  } else if (category === 'mcp' || category === 'toolProvider') {
    registry.toolProviders.push(resource);
  } else {
    registry.skills.push(resource);
  }
}

function exportSkills(options) {
  const input = JSON.parse(fs.readFileSync(options.input, 'utf8'));
  const indexByName = new Map(input.skills.map(skill => [skill.name, skill]));
  let resources;

  if (options.inventory && fs.existsSync(options.inventory)) {
    const inventory = JSON.parse(fs.readFileSync(options.inventory, 'utf8'));
    resources = inventory.components
      .filter(component => ['skill', 'agent', 'adapter', 'stack', 'domain', 'mcp'].includes(component.type))
      .map(component => componentToResource(component, indexByName, options));
  } else {
    resources = input.skills.map(skill => skillToResource(skill, options));
  }

  const registry = emptyRegistry();
  for (const resource of resources) {
    addResource(registry, resource);
  }

  return {
    apiVersion: 'agent.dev/v1alpha1',
    kind: 'AgentRegistryExport',
    generatedFrom: toPosix(path.relative(REPO_ROOT, options.input)),
    inventory: options.inventory && fs.existsSync(options.inventory)
      ? toPosix(path.relative(REPO_ROOT, options.inventory))
      : null,
    counts: {
      total: resources.length,
      skills: registry.skills.length,
      agents: registry.agents.length,
      workflows: registry.workflows.length,
      adapters: registry.adapters.length,
      toolProviders: registry.toolProviders.length,
      stacks: registry.stacks.length,
      domains: registry.domains.length,
      profiles: registry.profiles.length,
      schemas: registry.schemas.length,
    },
    registry,
  };
}

function writeExport(options) {
  const payload = exportSkills(options);
  fs.mkdirSync(path.dirname(options.output), { recursive: true });
  fs.writeFileSync(options.output, `${JSON.stringify(payload, null, 2)}\n`);
  if (options.pluginOutput) {
    fs.mkdirSync(path.dirname(options.pluginOutput), { recursive: true });
    fs.writeFileSync(options.pluginOutput, `${JSON.stringify(payload, null, 2)}\n`);
  }
  return payload;
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv);
    const payload = writeExport(options);
    console.log(`Agent registry export written: ${toPosix(path.relative(REPO_ROOT, options.output))}`);
    if (options.pluginOutput) {
      console.log(`Plugin registry written: ${toPosix(path.relative(REPO_ROOT, options.pluginOutput))}`);
    }
    console.log(`Resources exported: ${payload.counts.total}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  classifyCategory,
  emptyRegistry,
  exportSkills,
  generatedHostPaths,
  parseArgs,
  addResource,
  skillToResource,
  componentToResource,
  sourceSubfolder,
  writeExport,
};
