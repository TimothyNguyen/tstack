#!/usr/bin/env node

const {
  diffInventories,
  discoverComponents,
  loadConfig,
  readInventory,
  validateDiscovery,
  withDigest,
  writeGovernanceArtifacts,
} = require('../scripts/governance-lib');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function printFindings(title, findings, color = colors.red) {
  console.log(`\n${colors.bold}${title}${colors.reset}`);
  console.log('='.repeat(60));
  if (findings.length === 0) {
    console.log(`  ${colors.green}OK${colors.reset}`);
    return;
  }

  for (const finding of findings) {
    console.log(`  ${color}-${colors.reset} ${finding}`);
  }
}

function buildLiveState(config) {
  return withDigest(discoverComponents(config));
}

function runCheck(config) {
  const live = buildLiveState(config);
  const stored = readInventory(config);
  const findings = [
    ...validateDiscovery(live, config),
    ...diffInventories(stored, live),
  ];

  printFindings('Governance Check', findings, colors.red);
  if (findings.length > 0) {
    process.exit(1);
  }

  console.log(`\n${colors.green}${colors.bold}Tracked components: ${live.counts.total}${colors.reset}`);
}

function runHealth(config) {
  const live = buildLiveState(config);
  console.log(`\n${colors.bold}Governance Health${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`Inventory path: ${config.inventoryPath}`);
  console.log(`Summary path:   ${config.summaryPath}`);
  console.log(`Agent doc:      ${config.agentDocPath}`);
  console.log('');

  for (const [type, count] of Object.entries(live.counts).sort(([left], [right]) => left.localeCompare(right))) {
    console.log(`${type.padEnd(12)} ${count}`);
  }
}

function runReport(config) {
  const live = buildLiveState(config);
  const grouped = new Map();

  for (const component of live.components) {
    if (!grouped.has(component.type)) {
      grouped.set(component.type, []);
    }
    grouped.get(component.type).push(component);
  }

  console.log(`\n${colors.bold}Governance Report${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`Digest: ${live.digest}`);

  for (const [type, components] of [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    console.log(`\n${colors.blue}${type}${colors.reset} (${components.length})`);
    for (const component of components.slice(0, 15)) {
      console.log(`  - ${component.name} :: ${component.path}`);
    }
    if (components.length > 15) {
      console.log(`  - ... ${components.length - 15} more`);
    }
  }
}

function runValidate(config) {
  const live = buildLiveState(config);
  const findings = validateDiscovery(live, config);
  printFindings('Governance Validation', findings, colors.red);
  if (findings.length > 0) {
    process.exit(1);
  }
}

function runBuild(config) {
  const report = writeGovernanceArtifacts(config);
  console.log(`\n${colors.green}${colors.bold}Inventory written${colors.reset}`);
  console.log(`- ${config.inventoryPath}`);
  console.log(`- ${config.summaryPath}`);
  console.log(`- components: ${report.counts.total}`);
}

function main(command = process.argv[2] || 'check', config = loadConfig()) {
  switch (command) {
    case 'build':
      runBuild(config);
      break;
    case 'check':
    case 'check:hard':
    case 'check:soft':
      runCheck(config);
      break;
    case 'health':
      runHealth(config);
      break;
    case 'report':
      runReport(config);
      break;
    case 'validate':
      runValidate(config);
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('');
      console.log('Usage:');
      console.log('  governance build');
      console.log('  governance check');
      console.log('  governance health');
      console.log('  governance validate');
      console.log('  governance report');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  colors,
  printFindings,
  buildLiveState,
  runCheck,
  runHealth,
  runReport,
  runValidate,
  runBuild,
  main,
};
