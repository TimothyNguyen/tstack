#!/usr/bin/env node

/**
 * Enrich GOVERNANCE.yaml with actual dependencies
 *
 * Analyzes component content to detect:
 * - Skill cross-references
 * - Adapter dependencies
 * - Tool usage
 * - MCP dependencies
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const AGENT_ARCH = path.join(__dirname, '..', 'agent-architecture');

// Map component names to directories for lookup
const componentMap = new Map();

function buildComponentMap() {
  const entries = fs.readdirSync(AGENT_ARCH, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      componentMap.set(entry.name, path.join(AGENT_ARCH, entry.name));
    }
  }
}

function parseSkillMetadata(skillPath) {
  try {
    const content = fs.readFileSync(skillPath, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);

    if (!match) return null;

    return yaml.load(match[1]);
  } catch (err) {
    return null;
  }
}

function analyzeSkillContent(skillPath) {
  try {
    const content = fs.readFileSync(skillPath, 'utf8');

    const deps = {
      skills: new Set(),
      adapters: new Set(),
      tools: new Set(),
      mcps: new Set(),
    };

    // Extract agents field - implies usage by those agents
    const match = content.match(/agents:\s*\[(.*?)\]/);
    if (match) {
      const agents = match[1].split(',').map(a => a.trim());
      agents.forEach(agent => {
        // Map agent name to primary skill
        const agentSkillMap = {
          'swe': 'seniorswe-concise',
          'qa-agent': 'qa',
          'orchestrate': 'subagent-orchestrator',
          'release-agent': 'release',
          'spec-agent': 'spec',
          'design-agent': 'design-review',
          'migration': 'migration-review',
          'data': 'stack-databricks',
          'cloud': 'stack-aws',
          'security': 'security-review',
        };

        if (agentSkillMap[agent]) {
          deps.skills.add(agentSkillMap[agent]);
        }
      });
    }

    // Detect common tool references
    const toolPatterns = {
      'git': /git\s+|commit|branch|merge|push|pull|rebase/gi,
      'docker': /docker\s+|container|image|build|run/gi,
      'github': /github\s+|pull request|issue|repository/gi,
      'npm': /npm\s+|node\s+|package\.json|dependencies/gi,
      'python': /python\s+|pip\s+|virtualenv|requirements/gi,
      'terraform': /terraform\s+|\.tf\s+|infrastructure/gi,
      'kubernetes': /kubernetes\s+|kubectl\s+|k8s|helm/gi,
    };

    Object.entries(toolPatterns).forEach(([tool, pattern]) => {
      if (pattern.test(content)) {
        deps.tools.add(tool);
      }
    });

    // Detect adapter references by looking for adapter- prefixed components
    const adapterMatch = content.matchAll(/adapter-[\w-]+/g);
    for (const match of adapterMatch) {
      deps.adapters.add(match[0]);
    }

    // Detect MCP references
    const mcpPatterns = /mcp|server/gi;
    if (mcpPatterns.test(content)) {
      const mcpMatch = content.matchAll(/([a-z]+)(?:-mcp|-server)/gi);
      for (const match of mcpMatch) {
        deps.mcps.add(`${match[1]}-mcp`);
      }
    }

    // Convert sets to sorted arrays
    return {
      skills: Array.from(deps.skills).sort(),
      adapters: Array.from(deps.adapters).sort(),
      tools: Array.from(deps.tools).sort(),
      mcps: Array.from(deps.mcps).sort(),
    };
  } catch (err) {
    return {
      skills: [],
      adapters: [],
      tools: [],
      mcps: [],
    };
  }
}

function enrichGovernanceFile(componentDir, componentName) {
  const governancePath = path.join(componentDir, 'GOVERNANCE.yaml');
  const skillPath = path.join(componentDir, 'SKILL.md');

  if (!fs.existsSync(governancePath) || !fs.existsSync(skillPath)) {
    return null;
  }

  try {
    // Read current governance file
    const governanceContent = fs.readFileSync(governancePath, 'utf8');
    const governance = yaml.load(governanceContent);

    // Analyze dependencies
    const deps = analyzeSkillContent(skillPath);

    // Update dependencies
    governance.dependencies = {
      skills: deps.skills,
      adapters: deps.adapters,
      tools: deps.tools,
      mcps: deps.mcps,
    };

    // Write updated file
    const updated = yaml.dump(governance, {
      lineWidth: 120,
      noRefs: true,
    });

    fs.writeFileSync(governancePath, updated, 'utf8');
    return deps;
  } catch (err) {
    console.error(`Error enriching ${componentName}: ${err.message}`);
    return null;
  }
}

function main() {
  buildComponentMap();

  console.log(`Found ${componentMap.size} components\n`);

  let enriched = 0;
  let errors = 0;

  const allDeps = {
    skills: new Set(),
    adapters: new Set(),
    tools: new Set(),
    mcps: new Set(),
  };

  for (const [name, dir] of componentMap) {
    try {
      const deps = enrichGovernanceFile(dir, name);
      if (deps) {
        enriched++;
        deps.skills.forEach(s => allDeps.skills.add(s));
        deps.adapters.forEach(a => allDeps.adapters.add(a));
        deps.tools.forEach(t => allDeps.tools.add(t));
        deps.mcps.forEach(m => allDeps.mcps.add(m));

        console.log(`✓ ${name}`);
      }
    } catch (err) {
      console.log(`✗ ${name}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Enriched: ${enriched}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nDependencies Discovered:`);
  console.log(`  Skills: ${allDeps.skills.size}`);
  console.log(`  Adapters: ${allDeps.adapters.size}`);
  console.log(`  Tools: ${allDeps.tools.size}`);
  console.log(`  MCPs: ${allDeps.mcps.size}`);
  console.log(`\nTop Dependencies:`);
  console.log(`  Skills: ${Array.from(allDeps.skills).slice(0, 10).join(', ')}`);
  console.log(`  Adapters: ${Array.from(allDeps.adapters).slice(0, 10).join(', ')}`);
  console.log(`  Tools: ${Array.from(allDeps.tools).slice(0, 10).join(', ')}`);
}

main();
