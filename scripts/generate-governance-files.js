#!/usr/bin/env node

/**
 * Generate GOVERNANCE.yaml files for all components
 *
 * Scans agent-architecture/ for components with SKILL.md
 * Extracts metadata and creates GOVERNANCE.yaml
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const AGENT_ARCH = path.join(__dirname, '..', 'agent-architecture');
const TODAY = new Date().toISOString().split('T')[0];

function parseSkillMetadata(skillPath) {
  const content = fs.readFileSync(skillPath, 'utf8');

  // Extract YAML frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }

  const frontmatter = yaml.load(match[1]);
  return {
    name: frontmatter.name || path.basename(path.dirname(skillPath)),
    type: frontmatter.type || 'skill',
    description: frontmatter.description || '',
    version: frontmatter.version || '1.0.0',
  };
}

function determineStatus(componentName) {
  // Heuristic: newer or critical components = stable
  const stableKeywords = ['commit', 'release', 'deploy', 'core', 'github', 'test'];
  if (stableKeywords.some(kw => componentName.includes(kw))) {
    return 'stable';
  }

  // Domain-specific = experimental
  if (componentName.includes('domain-') || componentName.includes('migration-')) {
    return 'experimental';
  }

  // Architecture & stack components = beta
  if (componentName.includes('architecture-') || componentName.includes('stack-')) {
    return 'beta';
  }

  return 'beta';
}

function determineOwner(componentName) {
  if (componentName.includes('adapter-')) return 'orchestrator';
  if (componentName.includes('domain-')) return 'domain-expert';
  if (componentName.includes('migration-')) return 'migration-agent';
  if (componentName.includes('stack-')) return 'stack-agent';
  if (componentName.includes('plan-')) return 'planner';
  if (componentName.includes('design-')) return 'designer';
  if (componentName.includes('diagram-')) return 'diagram-agent';
  if (componentName.includes('seniorswe-')) return 'swe-agent';
  return 'orchestrator';
}

function generateGovernanceYAML(metadata, componentName) {
  const status = determineStatus(componentName);
  const owner = determineOwner(componentName);

  // Coverage targets based on status
  const coverageTarget = status === 'stable' ? 90 : status === 'beta' ? 80 : 70;

  const governance = {
    name: metadata.name,
    type: metadata.type || 'skill',
    status,
    version: metadata.version || '1.0.0',
    owner,
    description: metadata.description,
    dependencies: {
      skills: [],
      adapters: [],
      tools: [],
      mcps: [],
    },
    testing: {
      coverage_target: coverageTarget,
      types: ['unit', 'integration'],
    },
    documentation: {
      readme: true,
      spec: true,
      examples_min: 2,
    },
    used_by: [],
    governance_version: '1.0',
    last_reviewed: TODAY,
  };

  return yaml.dump(governance, {
    lineWidth: 120,
    noRefs: true,
  });
}

function main() {
  // Find all SKILL.md files
  const skillFiles = [];

  function findSkills(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden/special dirs
        if (!entry.name.startsWith('.') && !entry.name.startsWith('node_modules')) {
          findSkills(fullPath);
        }
      } else if (entry.name === 'SKILL.md') {
        skillFiles.push(fullPath);
      }
    }
  }

  findSkills(AGENT_ARCH);

  console.log(`Found ${skillFiles.length} components\n`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const skillPath of skillFiles) {
    const componentDir = path.dirname(skillPath);
    const componentName = path.basename(componentDir);
    const governancePath = path.join(componentDir, 'GOVERNANCE.yaml');

    try {
      // Parse SKILL.md
      const metadata = parseSkillMetadata(skillPath);
      if (!metadata) {
        console.log(`⚠ ${componentName}: No frontmatter in SKILL.md (skipped)`);
        continue;
      }

      // Generate GOVERNANCE.yaml
      const yaml = generateGovernanceYAML(metadata, componentName);

      // Write file
      fs.writeFileSync(governancePath, yaml, 'utf8');

      if (fs.existsSync(governancePath)) {
        const isNew = !fs.existsSync(governancePath);
        console.log(`✓ ${componentName}`);
        isNew ? created++ : updated++;
      }
    } catch (err) {
      console.log(`✗ ${componentName}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${created + updated}`);
}

main();
