#!/usr/bin/env node

const { loadConfig, writeGovernanceArtifacts } = require('./governance-lib');

const config = loadConfig();
const report = writeGovernanceArtifacts(config);

console.log(`Governance inventory written: ${config.inventoryPath}`);
console.log(`Governance summary written: ${config.summaryPath}`);
console.log(`Components discovered: ${report.counts.total}`);
