#!/usr/bin/env node

const {
  diffInventories,
  discoverComponents,
  loadConfig,
  readInventory,
  validateDiscovery,
  withDigest,
} = require('./governance-lib');

const config = loadConfig();
const discovered = withDigest(discoverComponents(config));
const committed = readInventory(config);
const findings = [
  ...validateDiscovery(discovered, config),
  ...diffInventories(committed, discovered),
];

if (findings.length > 0) {
  console.error('Governance check failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log(`Governance check passed. Components tracked: ${discovered.counts.total}`);
