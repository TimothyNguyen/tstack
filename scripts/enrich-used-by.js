#!/usr/bin/env node

/**
 * Enrich GOVERNANCE.yaml with used_by information
 *
 * Analyzes dependencies to determine which components use each component.
 * Creates bidirectional dependency tracking.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const AGENT_ARCH = path.join(__dirname, '..', 'agent-architecture');

// Map of what uses what: component -> [list of components that use it]
const usedByMap = new Map();

// Load all governance files
function loadAllGovernanceFiles() {
  const files = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        walk(fullPath);
      } else if (entry.name === 'GOVERNANCE.yaml') {
        files.push(fullPath);
      }
    }
  }

  walk(AGENT_ARCH);
  return files;
}

function extractComponentName(governancePath) {
  try {
    const content = fs.readFileSync(governancePath, 'utf8');
    const governance = yaml.load(content);
    return governance.name;
  } catch (err) {
    return path.basename(path.dirname(governancePath));
  }
}

function buildUsedByMap(files) {
  // First pass: build the map
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const governance = yaml.load(content);
      const componentName = governance.name;

      // For each dependency, record that componentName uses it
      if (governance.dependencies) {
        // Skills
        if (governance.dependencies.skills && Array.isArray(governance.dependencies.skills)) {
          governance.dependencies.skills.forEach(skill => {
            if (!usedByMap.has(skill)) {
              usedByMap.set(skill, []);
            }
            if (!usedByMap.get(skill).includes(componentName)) {
              usedByMap.get(skill).push(componentName);
            }
          });
        }

        // Adapters
        if (governance.dependencies.adapters && Array.isArray(governance.dependencies.adapters)) {
          governance.dependencies.adapters.forEach(adapter => {
            if (!usedByMap.has(adapter)) {
              usedByMap.set(adapter, []);
            }
            if (!usedByMap.get(adapter).includes(componentName)) {
              usedByMap.get(adapter).push(componentName);
            }
          });
        }
      }
    } catch (err) {
      // Silently skip errors
    }
  }
}

function enrichAllGovernanceFiles(files) {
  let updated = 0;
  let skipped = 0;

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const governance = yaml.load(content);
      const componentName = governance.name;

      // Get used_by list for this component
      const usedBy = usedByMap.get(componentName) || [];

      // Only update if there are actual users
      if (usedBy.length > 0) {
        governance.used_by = usedBy.sort();
        const updated_yaml = yaml.dump(governance, {
          lineWidth: 120,
          noRefs: true,
        });

        fs.writeFileSync(filePath, updated_yaml, 'utf8');
        console.log(`✓ ${componentName} (used by ${usedBy.length})`);
        updated++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`Error updating ${filePath}: ${err.message}`);
    }
  }

  return { updated, skipped };
}

function main() {
  console.log('Loading governance files...');
  const files = loadAllGovernanceFiles();
  console.log(`Found ${files.length} components\n`);

  console.log('Building used_by map...');
  buildUsedByMap(files);

  console.log(`\nEnriching governance files...\n`);
  const { updated, skipped } = enrichAllGovernanceFiles(files);

  console.log(`\n=== USED_BY ENRICHMENT SUMMARY ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (no users): ${skipped}`);
  console.log(`Total: ${updated + skipped}`);

  // Report most-used components
  const sortedByUsage = Array.from(usedByMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);

  console.log(`\nMost Used Components:`);
  sortedByUsage.forEach(([comp, users]) => {
    console.log(`  ${comp}: used by ${users.length} (${users.join(', ')})`);
  });
}

main();
