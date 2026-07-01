const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const REPO_ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(REPO_ROOT, 'governance.config.json');

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function fileExists(targetPath) {
  return fs.existsSync(targetPath);
}

function loadConfig() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return {
    ...config,
    inventoryAbsolutePath: path.join(REPO_ROOT, config.inventoryPath),
    summaryAbsolutePath: path.join(REPO_ROOT, config.summaryPath),
    agentDocAbsolutePath: path.join(REPO_ROOT, config.agentDocPath),
  };
}

function ensureParentDir(targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

function safeReadFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseFrontmatter(filePath) {
  try {
    const content = safeReadFile(filePath);
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};
    return yaml.load(match[1]) || {};
  } catch (error) {
    return {};
  }
}

function shouldSkipDirectory(name, config) {
  if (config.alwaysIncludeDirectories.includes(name)) {
    return false;
  }
  if (config.ignoreDirectories.includes(name)) {
    return true;
  }
  return name.startsWith('.') && !config.alwaysIncludeDirectories.includes(name);
}

function shouldSkipPath(relativePath, config) {
  return (config.ignorePathPrefixes || []).some(prefix => relativePath === prefix.slice(0, -1) || relativePath.startsWith(prefix));
}

function walkRepo(config, startDir = REPO_ROOT) {
  const files = [];
  const directories = [];

  function visit(currentDir) {
    const relativeDir = toPosix(path.relative(REPO_ROOT, currentDir)) || '.';
    directories.push(relativeDir);

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name);
      const relativePath = toPosix(path.relative(REPO_ROOT, entryPath));

      if (entry.isDirectory()) {
        if (shouldSkipPath(relativePath, config)) {
          continue;
        }
        if (shouldSkipDirectory(entry.name, config)) {
          continue;
        }
        visit(entryPath);
        continue;
      }

      files.push(relativePath);
    }
  }

  visit(startDir);
  return { files, directories };
}

function pathSegments(relativePath) {
  return relativePath.split('/').filter(Boolean);
}

function inferTypeFromSkillPath(relativePath) {
  const normalized = toPosix(relativePath);
  if (normalized.endsWith('.agent.md')) {
    return 'agent';
  }

  if (!normalized.endsWith('/SKILL.md') && normalized !== 'SKILL.md') {
    return null;
  }

  if (normalized.startsWith('agents/')) {
    return 'agent';
  }

  if (normalized.includes('/agents/')) {
    return 'agent';
  }

  if (normalized.includes('/packages/skills/agents/')) {
    return 'agent';
  }

  if (normalized.includes('/packages/adapters/')) {
    return 'adapter';
  }

  if (normalized.includes('/packages/stacks/')) {
    return 'stack';
  }

  return 'skill';
}

function inferComponentName(relativePath, metadata) {
  if (metadata.name && typeof metadata.name === 'string') {
    return metadata.name;
  }

  const segments = pathSegments(relativePath);
  if (relativePath === 'SKILL.md') {
    return path.basename(REPO_ROOT);
  }

  if (relativePath.endsWith('/SKILL.md')) {
    return segments[segments.length - 2];
  }

  if (relativePath.endsWith('.agent.md')) {
    return path.basename(relativePath, '.agent.md');
  }

  return path.basename(relativePath);
}

function inferNamespace(relativePath) {
  const normalized = toPosix(relativePath);
  if (normalized.startsWith('agent-architecture/packages/skills/')) return 'agent-architecture/packages/skills';
  if (normalized.startsWith('agent-architecture/packages/stacks/')) return 'agent-architecture/packages/stacks';
  if (normalized.startsWith('agent-architecture/packages/adapters/')) return 'agent-architecture/packages/adapters';
  if (normalized.startsWith('agent-architecture/plugins/')) return 'agent-architecture/plugins';
  if (normalized.startsWith('agent-architecture/agents/')) return 'agent-architecture/agents';
  if (normalized.startsWith('agents/')) return 'agents';
  if (normalized.startsWith('mcp-')) return 'mcps';
  return 'repo';
}

function detectPluginDirectories(directories) {
  const plugins = [];
  const seen = new Set();

  for (const relativeDir of directories) {
    const segments = pathSegments(relativeDir);
    const pluginIndex = segments.indexOf('plugins');
    if (pluginIndex === -1 || pluginIndex === segments.length - 1) {
      continue;
    }

    const pluginDir = segments.slice(0, pluginIndex + 2).join('/');
    if (seen.has(pluginDir)) {
      continue;
    }

    const absolutePath = path.join(REPO_ROOT, pluginDir);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
      continue;
    }

    const pluginName = segments[pluginIndex + 1];
    plugins.push({
      id: `plugin:${pluginDir}`,
      type: 'plugin',
      name: pluginName,
      path: pluginDir,
      namespace: inferNamespace(pluginDir),
      source: 'directory',
      description: '',
    });
    seen.add(pluginDir);
  }

  return plugins;
}

function detectMcpDirectories(directories) {
  const results = [];
  const seen = new Set();

  for (const relativeDir of directories) {
    const segments = pathSegments(relativeDir);
    const baseName = segments[segments.length - 1];
    if (!baseName || !baseName.startsWith('mcp-')) {
      continue;
    }

    const absolutePath = path.join(REPO_ROOT, relativeDir);
    const hasMarkers = [
      'package.json',
      'pyproject.toml',
      'setup.py',
      'Cargo.toml',
      'src',
      'server.py',
    ].some(marker => fileExists(path.join(absolutePath, marker)));

    if (!hasMarkers || seen.has(relativeDir)) {
      continue;
    }

    results.push({
      id: `mcp:${relativeDir}`,
      type: 'mcp',
      name: baseName,
      path: relativeDir,
      namespace: inferNamespace(relativeDir),
      source: 'directory',
      description: '',
    });
    seen.add(relativeDir);
  }

  return results;
}

function buildComponentRecord(relativePath) {
  const type = inferTypeFromSkillPath(relativePath);
  if (!type) return null;

  const metadata = parseFrontmatter(path.join(REPO_ROOT, relativePath));
  const name = inferComponentName(relativePath, metadata);
  return {
    id: `${type}:${relativePath}`,
    type,
    name,
    path: relativePath,
    namespace: inferNamespace(relativePath),
    source: path.basename(relativePath),
    description: typeof metadata.description === 'string' ? metadata.description : '',
  };
}

function discoverComponents(config = loadConfig()) {
  const { files, directories } = walkRepo(config);
  const components = [];

  for (const relativePath of files) {
    if (relativePath.endsWith('/SKILL.md') || relativePath === 'SKILL.md' || relativePath.endsWith('.agent.md')) {
      const record = buildComponentRecord(relativePath);
      if (record) {
        components.push(record);
      }
    }
  }

  components.push(...detectPluginDirectories(directories));
  components.push(...detectMcpDirectories(directories));

  components.sort((left, right) => {
    const typeCompare = left.type.localeCompare(right.type);
    if (typeCompare !== 0) return typeCompare;
    return left.path.localeCompare(right.path);
  });

  const counts = components.reduce((accumulator, component) => {
    accumulator[component.type] = (accumulator[component.type] || 0) + 1;
    accumulator.total += 1;
    return accumulator;
  }, { total: 0 });

  return {
    generatedBy: 'scripts/build-governance.js',
    configVersion: config.version,
    counts,
    components,
  };
}

function stablePayload(report) {
  return {
    generatedBy: report.generatedBy,
    configVersion: report.configVersion,
    counts: report.counts,
    components: report.components,
  };
}

function withDigest(report) {
  const payload = stablePayload(report);
  const digest = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');

  return {
    ...payload,
    digest,
  };
}

function renderSummary(report) {
  const lines = [
    '# Governance Inventory',
    '',
    `Generated from \`governance.config.json\`.`,
    '',
    '## Counts',
    '',
  ];

  const sortedCountKeys = Object.keys(report.counts).sort();
  for (const key of sortedCountKeys) {
    lines.push(`- ${key}: ${report.counts[key]}`);
  }

  lines.push('', '## Components', '');

  let currentType = null;
  for (const component of report.components) {
    if (component.type !== currentType) {
      currentType = component.type;
      lines.push(`### ${currentType}`, '');
    }
    const descriptionSuffix = component.description ? ` - ${component.description}` : '';
    lines.push(`- \`${component.name}\` :: \`${component.path}\`${descriptionSuffix}`);
  }

  lines.push('');
  return lines.join('\n');
}

function writeGovernanceArtifacts(config = loadConfig()) {
  const report = withDigest(discoverComponents(config));
  ensureParentDir(config.inventoryAbsolutePath);
  ensureParentDir(config.summaryAbsolutePath);
  fs.writeFileSync(config.inventoryAbsolutePath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(config.summaryAbsolutePath, renderSummary(report));
  return report;
}

function readInventory(config = loadConfig()) {
  if (!fileExists(config.inventoryAbsolutePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(config.inventoryAbsolutePath, 'utf8'));
}

function validateDiscovery(report, config = loadConfig()) {
  const findings = [];
  const seenIds = new Set();

  for (const component of report.components) {
    if (seenIds.has(component.id)) {
      findings.push(`Duplicate component id: ${component.id}`);
    }
    seenIds.add(component.id);

    if (!component.name) {
      findings.push(`Missing component name for ${component.path}`);
    }

    if (!component.path) {
      findings.push(`Missing component path for ${component.id}`);
    }
  }

  if (!fileExists(config.agentDocAbsolutePath)) {
    findings.push(`Missing agent-readable governance doc: ${config.agentDocPath}`);
  }

  return findings;
}

function diffInventories(expected, actual) {
  if (!expected) {
    return ['Inventory file missing. Run npm run governance:build.'];
  }

  const diffs = [];
  if (expected.digest !== actual.digest) {
    diffs.push('Governance inventory is stale. Run npm run governance:build.');
  }

  const expectedSet = new Set(expected.components.map(component => component.id));
  const actualSet = new Set(actual.components.map(component => component.id));

  for (const id of [...actualSet].filter(id => !expectedSet.has(id)).slice(0, 10)) {
    diffs.push(`Missing from inventory: ${id}`);
  }

  for (const id of [...expectedSet].filter(id => !actualSet.has(id)).slice(0, 10)) {
    diffs.push(`Present in inventory only: ${id}`);
  }

  return diffs;
}

module.exports = {
  REPO_ROOT,
  toPosix,
  fileExists,
  loadConfig,
  parseFrontmatter,
  shouldSkipDirectory,
  shouldSkipPath,
  walkRepo,
  inferTypeFromSkillPath,
  inferComponentName,
  inferNamespace,
  detectPluginDirectories,
  detectMcpDirectories,
  buildComponentRecord,
  discoverComponents,
  stablePayload,
  withDigest,
  renderSummary,
  writeGovernanceArtifacts,
  readInventory,
  validateDiscovery,
  diffInventories,
};
