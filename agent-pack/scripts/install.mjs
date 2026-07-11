#!/usr/bin/env node
/**
 * agent-pack installer.
 *
 * Usage:
 *   node scripts/install.mjs [--private] [--target <dir>] [--hosts <list>]
 *   node scripts/install.mjs --upgrade [--private] [--target <dir>]
 *   node scripts/install.mjs --doctor [--target <dir>]
 *   node scripts/install.mjs --dry-run [--private] [--target <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST_REGISTRY = JSON.parse(fs.readFileSync(path.join(ROOT, 'hosts', 'registry.json'), 'utf8'));
const KNOWN_HOSTS = HOST_REGISTRY.hosts.map((host) => host.id).sort();
const SUPPORTED_HOSTS = HOST_REGISTRY.hosts
  .filter((host) => host.output === 'markdown-skill-directory')
  .map((host) => host.id)
  .sort();
const BUILTIN_MCP_PROFILES = {
  github: {
    name: 'github',
    command: 'npx',
    args: ['@modelcontextprotocol/server-github'],
    credentialEnvVars: ['GITHUB_TOKEN'],
  },
  postgres: {
    name: 'postgres',
    command: 'uvx',
    args: ['mcp-server-postgres'],
    credentialEnvVars: ['DATABASE_URL'],
  },
  slack: {
    name: 'slack',
    command: 'npx',
    args: ['@modelcontextprotocol/server-slack'],
    credentialEnvVars: ['SLACK_BOT_TOKEN'],
  },
};
const SKILL_DISCOVERY_SKIP = new Set([
  '.git',
  'node_modules',
  'tests',
  'test-results',
  'docs',
  'generated',
  'scripts',
  'bin',
  'core',
  'hosts',
  'policies',
  'profiles',
  'references',
  'templates',
  'assets',
  'images',
  'videos',
  'output',
  'bundle-examples',
  'databricks-sdk-py',
]);

function discoverAddonPackages() {
  const scope = path.join(ROOT, '..', '@agent-pack');
  if (!fs.existsSync(scope)) return [];
  return fs.readdirSync(scope, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(scope, e.name));
}

const args = process.argv.slice(2);

const PRIVATE = args.includes('--private');
const DRY_RUN = args.includes('--dry-run');
const UPGRADE = args.includes('--upgrade');
const DOCTOR = args.includes('--doctor');
const LIST_AGENTS = args.includes('--list-agents');
const LIST_MCP_PROFILES = args.includes('--list-mcp-profiles');
const LIST_HOSTS = args.includes('--list-hosts');

function getOptionValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
}

function getMultiOptionValues(flag) {
  const values = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== flag) continue;
    const raw = args[i + 1];
    if (!raw || raw.startsWith('--')) continue;
    values.push(...raw.split(',').map((value) => value.trim()).filter(Boolean));
  }
  return values;
}

const targetValue = getOptionValue('--target');
const TARGET = targetValue ? path.resolve(targetValue) : path.join(process.cwd(), '.agent');

const hostsValue = getOptionValue('--hosts');
const HOSTS = hostsValue
  ? hostsValue.split(',').map((h) => h.trim())
  : ['claude', 'codex', 'copilot'];
const CLI_MCP_PROFILES = getMultiOptionValues('--mcp-profile');

// --docker-mcp [profile]  - inject Docker MCP gateway into settings.json
const dockerMcpIdx = args.indexOf('--docker-mcp');
const DOCKER_MCP_PROFILE = dockerMcpIdx !== -1
  ? (args[dockerMcpIdx + 1] && !args[dockerMcpIdx + 1].startsWith('--') ? args[dockerMcpIdx + 1] : 'default')
  : null;

// Agents not installed in private mode by default (stripped)
const PRIVATE_STRIP_MCPS = new Set(['cavemem', 'agent-pack-analytics', 'agent-pack-update-check', 'gbrain']);

function parseFrontmatter(content) {
  const text = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.startsWith('---\n')) return {};
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) return {};
  const block = normalized.slice(4, end);
  const result = {};
  const nameMatch = block.match(/^name:\s*(.+)$/m);
  if (nameMatch) result.name = nameMatch[1].trim();
  const descMatch = block.match(/^description:\s*\|?\s*\n((?:[ \t]+.+\n?)*)/m);
  if (descMatch) {
    result.description = descMatch[1].replace(/^[ \t]{2}/gm, '').trim().split('\n')[0];
  }
  const agentsMatch = block.match(/^agents:\s*\[([^\]]*)\]/m);
  if (agentsMatch) {
    result.agents = agentsMatch[1].split(',').map((a) => a.trim()).filter(Boolean);
  }
  return result;
}

function collectSkillEntries(scanDir, relPrefix = '') {
  if (!fs.existsSync(scanDir)) return [];
  const entries = [];
  const stack = [{ abs: scanDir, rel: relPrefix }];

  while (stack.length > 0) {
    const { abs, rel } = stack.pop();
    const skillPath = path.join(abs, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      const frontmatter = parseFrontmatter(fs.readFileSync(skillPath, 'utf8'));
      const relPath = path.posix.join(rel, 'SKILL.md').replace(/\\/g, '/');
      entries.push({
        name: frontmatter.name || path.basename(abs),
        description: frontmatter.description || '',
        agents: frontmatter.agents || [],
        relPath,
      });
    }

    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue;
      if (SKILL_DISCOVERY_SKIP.has(entry.name)) continue;
      stack.push({
        abs: path.join(abs, entry.name),
        rel: rel ? path.posix.join(rel, entry.name) : entry.name,
      });
    }
  }

  return entries;
}

function discoverInstallableSkillCatalog() {
  const seen = new Set();
  const catalog = [];
  const directRootEntries = [];
  const rootSkillPath = path.join(ROOT, 'SKILL.md');
  if (fs.existsSync(rootSkillPath)) {
    const frontmatter = parseFrontmatter(fs.readFileSync(rootSkillPath, 'utf8'));
    directRootEntries.push({
      name: frontmatter.name || 'agent-pack',
      description: frontmatter.description || '',
      agents: frontmatter.agents || [],
      relPath: 'SKILL.md',
    });
  }
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    if (SKILL_DISCOVERY_SKIP.has(entry.name)) continue;
    const skillPath = path.join(ROOT, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;
    const frontmatter = parseFrontmatter(fs.readFileSync(skillPath, 'utf8'));
    directRootEntries.push({
      name: frontmatter.name || entry.name,
      description: frontmatter.description || '',
      agents: frontmatter.agents || [],
      relPath: `${entry.name}/SKILL.md`,
    });
  }
  const roots = [
    { abs: path.join(ROOT, 'agents'), rel: 'agents' },
    { abs: path.join(ROOT, 'skills'), rel: 'skills' },
    { abs: path.join(ROOT, 'adapters'), rel: 'adapters' },
    { abs: path.join(ROOT, 'stacks'), rel: 'stacks' },
    { abs: path.join(ROOT, 'domains'), rel: 'domains' },
    { abs: path.join(ROOT, 'tool-providers'), rel: 'tool-providers' },
    ...discoverAddonPackages().map((addonRoot) => ({ abs: addonRoot, rel: '' })),
  ];

  for (const entry of directRootEntries) {
    seen.add(entry.relPath);
    catalog.push({
      ...entry,
      kind: 'skill',
    });
  }

  for (const root of roots) {
    for (const entry of collectSkillEntries(root.abs, root.rel)) {
      if (seen.has(entry.relPath)) continue;
      seen.add(entry.relPath);
      catalog.push({
        ...entry,
        kind: (
          /^agents\/[^/]+\/SKILL\.md$/.test(entry.relPath)
        ) ? 'agent' : 'skill',
      });
    }
  }

  return catalog.sort((a, b) => a.name.localeCompare(b.name));
}

const INSTALLABLE_SKILLS = discoverInstallableSkillCatalog();
const AVAILABLE_AGENTS = INSTALLABLE_SKILLS
  .filter((entry) => entry.kind === 'agent')
  .map((entry) => entry.name)
  .sort();

function getDefaultAgents() {
  return [...AVAILABLE_AGENTS];
}

function validateHostNames(hosts) {
  const requested = (hosts || []).filter(Boolean);
  const unknown = requested.filter((host) => !KNOWN_HOSTS.includes(host));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown hosts: ${unknown.join(', ')}. Known hosts: ${KNOWN_HOSTS.join(', ')}`
    );
  }

  const unsupported = requested.filter((host) => !SUPPORTED_HOSTS.includes(host));
  if (unsupported.length > 0) {
    throw new Error(
      `Unsupported install hosts: ${unsupported.join(', ')}. Supported hosts: ${SUPPORTED_HOSTS.join(', ')}`
    );
  }
}

function validateAgentNames(agents) {
  const available = new Set(AVAILABLE_AGENTS);
  const unknown = (agents || []).filter((agent) => !available.has(agent));
  if (unknown.length === 0) return;
  throw new Error(
    `Unknown agents: ${unknown.join(', ')}. Available agents: ${AVAILABLE_AGENTS.join(', ')}`
  );
}

function resolveBuiltinMcps(config) {
  const requestedProfiles = [...new Set([
    ...((config.mcpProfiles || []).filter(Boolean)),
    ...CLI_MCP_PROFILES,
  ])];
  const unknownProfiles = requestedProfiles.filter((name) => !BUILTIN_MCP_PROFILES[name]);
  if (unknownProfiles.length > 0) {
    throw new Error(
      `Unknown MCP profiles: ${unknownProfiles.join(', ')}. Available MCP profiles: ${Object.keys(BUILTIN_MCP_PROFILES).join(', ')}`
    );
  }

  const explicitMcps = config.mcps || [];
  const explicitNames = new Set(explicitMcps.map((mcp) => mcp.name));
  const merged = [...explicitMcps];

  for (const profileName of requestedProfiles) {
    const profile = BUILTIN_MCP_PROFILES[profileName];
    if (!explicitNames.has(profile.name)) {
      merged.push(profile);
    }
  }

  return merged;
}

function printList(kind) {
  if (kind === 'agents') {
    for (const agent of AVAILABLE_AGENTS) console.log(agent);
    return;
  }
  if (kind === 'mcp-profiles') {
    for (const profile of Object.keys(BUILTIN_MCP_PROFILES).sort()) console.log(profile);
    return;
  }
  if (kind === 'hosts') {
    console.log('supported:');
    for (const host of SUPPORTED_HOSTS) console.log(host);
    const future = KNOWN_HOSTS.filter((host) => !SUPPORTED_HOSTS.includes(host));
    if (future.length > 0) {
      console.log('future:');
      for (const host of future) console.log(host);
    }
  }
}

function readConfig() {
  const configPath = path.join(process.cwd(), '.agent-config.json');
  if (!fs.existsSync(configPath)) {
    return {
      private: PRIVATE,
      hosts: HOSTS,
      agents: getDefaultAgents(),
      mcps: [],
      mcpProfiles: CLI_MCP_PROFILES,
    };
  }

  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const config = {
    private: raw.private ?? PRIVATE,
    hosts: raw.hosts || HOSTS,
    agents: raw.agents || getDefaultAgents(),
    mcps: raw.mcps || [],
    mcpProfiles: raw.mcpProfiles || [],
  };
  validateHostNames(config.hosts);
  validateAgentNames(config.agents);
  config.mcps = resolveBuiltinMcps(config);
  return config;
}

function readPackageVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  return pkg.version || '0.0.0';
}

function writeFile(rel, content) {
  if (DRY_RUN) return;
  const full = path.join(TARGET, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function readAgentFrontmatter(agentName) {
  const roots = [
    path.join(ROOT, 'agents'),
  ];

  for (const base of roots) {
    const tmplPath = path.join(base, agentName, 'SKILL.md.tmpl');
    if (fs.existsSync(tmplPath)) {
      return parseFrontmatter(fs.readFileSync(tmplPath, 'utf8'));
    }

    const skillPath = path.join(base, agentName, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      return parseFrontmatter(fs.readFileSync(skillPath, 'utf8'));
    }
  }

  return null;
}

function generateSettings(config) {
  const mcps = {};
  const activeMcps = resolveBuiltinMcps(config).filter((m) => {
    if (PRIVATE && PRIVATE_STRIP_MCPS.has(m.name)) return false;
    return true;
  });
  for (const mcp of activeMcps) {
    const env = {};
    for (const envVar of mcp.credentialEnvVars || []) {
      env[envVar] = `$${envVar}`;
    }
    mcps[mcp.name] = {
      command: mcp.command,
      args: mcp.args || [],
      env,
    };
  }

  // --docker-mcp flag: inject gateway entry if not already declared in config.mcps
  if (DOCKER_MCP_PROFILE && !mcps['docker-gateway']) {
    mcps['docker-gateway'] = {
      command: 'docker',
      args: ['mcp', 'gateway', 'run', '--profile', DOCKER_MCP_PROFILE],
      env: {},
    };
  }

  const settings = { mcpServers: mcps };
  if (PRIVATE) {
    settings.env = { CLAUDE_CODE_DISABLE_AUTO_MEMORY: '1' };
  }
  return JSON.stringify(settings, null, 2);
}

function generateClaudeMd(config, version) {
  const agents = config.agents || [];
  const lines = [
    '# CLAUDE.md - agent-pack install',
    '',
    `> Generated by agent-pack v${version}. Do not edit directly.`,
    '',
    '## Available Agents',
    '',
  ];
  for (const agent of agents) {
    const fm = readAgentFrontmatter(agent);
    if (fm) {
      lines.push(`- \`/${agent}\` - ${fm.description || agent}`);
    }
  }
  lines.push('');
  lines.push('## Private Mode');
  lines.push('');
  if (PRIVATE) {
    lines.push('This install is private: no telemetry, no cloud memory, no update checks.');
  }
  lines.push('');
  lines.push('## Skill Reference');
  lines.push('');
  lines.push('Skills are installed at: `skills/<agent>/SKILL.md`');
  return lines.join('\n');
}

function generateAgentsMd(config, version) {
  const agents = config.agents || [];
  const lines = [
    '# AGENTS.md - agent-pack install',
    '',
    `> Generated by agent-pack v${version}. Do not edit directly.`,
    '',
    '## Available Agents',
    '',
  ];
  for (const agent of agents) {
    const fm = readAgentFrontmatter(agent);
    if (fm) {
      lines.push(`- ${agent}: ${fm.description || agent}`);
    }
  }
  lines.push('');
  lines.push('## Safety Defaults');
  lines.push('');
  lines.push('- No public telemetry.');
  lines.push('- No credential reads without explicit configuration.');
  return lines.join('\n');
}

function generateCopilotInstructions(config, version) {
  const agents = config.agents || [];
  const lines = [
    '# GitHub Copilot Instructions - agent-pack install',
    '',
    `> Generated by agent-pack v${version}. Do not edit directly.`,
    '',
    '## Available Agents',
    '',
  ];
  for (const agent of agents) {
    lines.push(`- /${agent}`);
  }
  return lines.join('\n');
}

function generateManifest(config, version, utilitySkills) {
  const resolvedMcps = resolveBuiltinMcps(config);
  const resolvedProfiles = [...new Set([
    ...((config.mcpProfiles || []).filter(Boolean)),
    ...CLI_MCP_PROFILES,
  ])];
  return JSON.stringify({
    name: 'agent-pack',
    version,
    private: !!(config.private || PRIVATE),
    agents: config.agents || [],
    skills: (utilitySkills || []).map((s) => s.name),
    hosts: config.hosts || HOSTS,
    mcpProfiles: resolvedProfiles,
    mcps: resolvedMcps.map((mcp) => mcp.name),
    generatedAt: new Date().toISOString(),
  }, null, 2);
}

function discoverUtilitySkills(configuredAgents) {
  const agentSet = new Set(configuredAgents);
  return INSTALLABLE_SKILLS.filter((entry) => (
    entry.kind === 'skill'
    && Array.isArray(entry.agents)
    && entry.agents.some((agent) => agentSet.has(agent))
  ));
}

function installSkillEntry(entry) {
  const srcPath = path.join(ROOT, entry.relPath.replace(/\//g, path.sep));
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Expected skill file missing from package: ${entry.relPath}`);
  }
  writeFile(`skills/${entry.name}/SKILL.md`, fs.readFileSync(srcPath, 'utf8'));
}

function installAgentSkill(agentName) {
  const entry = INSTALLABLE_SKILLS.find((skill) => skill.kind === 'agent' && skill.name === agentName);
  if (!entry) {
    throw new Error(`Agent "${agentName}" is not installable. Available agents: ${AVAILABLE_AGENTS.join(', ')}`);
  }
  installSkillEntry(entry);
}

function copyDirRecursive(srcDir, destRelDir) {
  if (!fs.existsSync(srcDir)) return;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name === '__pycache__' || entry.name.endsWith('.pyc')) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destRel = `${destRelDir}/${entry.name}`;
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destRel);
    } else {
      writeFile(destRel, fs.readFileSync(srcPath));
    }
  }
}

function installTokenOptimizer() {
  const src = path.join(ROOT, 'token-optimizer');
  if (!fs.existsSync(src)) return;
  // Copy ptk_minimize.py
  const scriptSrc = path.join(src, 'ptk_minimize.py');
  if (fs.existsSync(scriptSrc)) {
    writeFile('token-optimizer/ptk_minimize.py', fs.readFileSync(scriptSrc));
  }
  // Copy bundled lib/ptk/
  copyDirRecursive(path.join(src, 'lib'), 'token-optimizer/lib');
}

const AGENT_PACK_GITIGNORE = [
  '# Generated by agent-pack installer - do not edit directly.',
  'audit/',
  'subagents/*/worktree/',
  '',
].join('\n');

function writeAgentPackGitignore() {
  const dir = path.join(process.cwd(), '.agent-pack');
  const file = path.join(dir, '.gitignore');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, AGENT_PACK_GITIGNORE, 'utf8');
}

function install() {
  const config = readConfig();
  const version = readPackageVersion();
  const agents = config.agents || [];

  if (!DRY_RUN) {
    fs.mkdirSync(TARGET, { recursive: true });
    writeAgentPackGitignore();
  }

  // Install agent skills
  for (const agent of agents) {
    installAgentSkill(agent);
  }

  // Install utility skills auto-discovered from top-level SKILL.md files
  const utilitySkills = discoverUtilitySkills(agents);
  for (const skill of utilitySkills) {
    installSkillEntry(skill);
  }

  // Install token-optimizer CLI + bundled lib (Python assets alongside SKILL.md)
  installTokenOptimizer();

  // Generate host artifacts
  const activeHosts = config.hosts || HOSTS;
  if (activeHosts.includes('claude')) {
    writeFile('CLAUDE.md', generateClaudeMd(config, version));
  }
  if (activeHosts.includes('codex')) {
    writeFile('AGENTS.md', generateAgentsMd(config, version));
  }
  if (activeHosts.includes('copilot')) {
    writeFile('copilot-instructions.md', generateCopilotInstructions(config, version));
  }

  // Settings (private mode)
  writeFile('settings.json', generateSettings(config));

  // Version file
  writeFile('VERSION', version);

  // Manifest
  writeFile('install-manifest.json', generateManifest(config, version, utilitySkills));

  if (!DRY_RUN) {
    console.log(`agent-pack v${version} installed to ${TARGET}`);
    console.log(`  agents: ${agents.join(', ')}`);
    console.log(`  skills: ${utilitySkills.map((s) => s.name).join(', ') || '(none)'}`);
    console.log(`  hosts:  ${(config.hosts || HOSTS).join(', ')}`);
    if (PRIVATE) console.log('  mode:   private (no telemetry, no cloud memory)');
  }
}

function doctor() {
  const errors = [];

  // Check VERSION
  const versionPath = path.join(TARGET, 'VERSION');
  if (!fs.existsSync(versionPath)) {
    errors.push(`VERSION missing at ${TARGET}/VERSION — run install first`);
  }

  // Check manifest
  const manifestPath = path.join(TARGET, 'install-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push(`install-manifest.json missing — run install first`);
  } else {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const agent of (manifest.agents || [])) {
      const skillPath = path.join(TARGET, 'skills', agent, 'SKILL.md');
      if (!fs.existsSync(skillPath)) {
        errors.push(`agent "${agent}" declared in manifest but skills/${agent}/SKILL.md missing`);
      }
    }
    for (const skill of (manifest.skills || [])) {
      const skillPath = path.join(TARGET, 'skills', skill, 'SKILL.md');
      if (!fs.existsSync(skillPath)) {
        errors.push(`utility skill "${skill}" declared in manifest but skills/${skill}/SKILL.md missing`);
      }
    }
  }

  // Check settings
  const settingsPath = path.join(TARGET, 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    errors.push(`settings.json missing at ${TARGET}/settings.json`);
  } else {
    // If docker-gateway MCP is configured, verify Docker Desktop + MCP Toolkit
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings.mcpServers && settings.mcpServers['docker-gateway']) {
      try {
        execFileSync('docker', ['info'], { stdio: 'pipe' });
      } catch {
        errors.push('docker-gateway configured but "docker info" failed — ensure Docker Desktop is running');
      }
      try {
        execFileSync('docker', ['mcp', '--help'], { stdio: 'pipe' });
      } catch {
        errors.push('docker-gateway configured but "docker mcp --help" failed — requires Docker Desktop 4.62+');
      }
    }
  }

  if (errors.length > 0) {
    for (const err of errors) console.error(`ERROR: ${err}`);
    process.exitCode = 1;
  } else {
    console.log(`doctor: OK (${TARGET})`);
  }
}

function main() {
  if (DOCTOR) {
    doctor();
  } else if (LIST_AGENTS) {
    printList('agents');
  } else if (LIST_MCP_PROFILES) {
    printList('mcp-profiles');
  } else if (LIST_HOSTS) {
    printList('hosts');
  } else {
    validateHostNames(HOSTS);
    install();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

export {
  AVAILABLE_AGENTS,
  BUILTIN_MCP_PROFILES,
  HOSTS,
  KNOWN_HOSTS,
  PRIVATE_STRIP_MCPS,
  SUPPORTED_HOSTS,
  TARGET,
  collectSkillEntries,
  discoverAddonPackages,
  discoverInstallableSkillCatalog,
  discoverUtilitySkills,
  doctor,
  generateAgentsMd,
  generateClaudeMd,
  generateCopilotInstructions,
  generateManifest,
  generateSettings,
  getDefaultAgents,
  getMultiOptionValues,
  getOptionValue,
  install,
  installAgentSkill,
  installSkillEntry,
  main,
  parseFrontmatter,
  printList,
  readAgentFrontmatter,
  readConfig,
  resolveBuiltinMcps,
  validateAgentNames,
  validateHostNames,
};



