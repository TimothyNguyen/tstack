#!/usr/bin/env node
/**
 * Scans vendored third-party skill packs for forbidden strings that would
 * violate enterprise-safe defaults: public egress, telemetry, tunnels, etc.
 *
 * Vendored packs checked:
 *   stack-csharp/dotnet-skills/
 *   stack-databricks/databricks-agent-skills/
 *
 * Usage:
 *   node scripts/vet-vendored.mjs           # report findings
 *   node scripts/vet-vendored.mjs --strict  # exit 1 on any finding
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.argv.includes('--strict');

const VENDORED_DIRS = [
  'stack-csharp/dotnet-skills',
  'stack-databricks/databricks-agent-skills',
];

const FORBIDDEN = [
  { pattern: /ngrok\b/i, label: 'public tunnel (ngrok)' },
  { pattern: /supabase\.co\b/i, label: 'public telemetry sink (supabase.co)' },
  { pattern: /\btelemetry\.send\b/i, label: 'telemetry call' },
  { pattern: /agent-architecture-update-check\b/i, label: 'public update check' },
  { pattern: /cookieImport\b/i, label: 'cookie import' },
  { pattern: /\bpair-agent\b.*ngrok/i, label: 'public tunnel (pair-agent + ngrok)' },
  { pattern: /https?:\/\/api\.supabase\./i, label: 'Supabase API endpoint' },
  { pattern: /\bANTHROPIC_API_KEY\b.*=\s*['"][^$]/i, label: 'hardcoded API key' },
];

function walkFiles(dir, callback) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, callback);
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      callback(full);
    }
  }
}

const findings = [];

for (const rel of VENDORED_DIRS) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) {
    console.warn(`WARN: vendored dir missing: ${rel}`);
    continue;
  }

  walkFiles(dir, (file) => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const { pattern, label } of FORBIDDEN) {
        if (pattern.test(lines[i])) {
          findings.push({
            file: path.relative(ROOT, file),
            line: i + 1,
            label,
            text: lines[i].trim().slice(0, 120),
          });
        }
      }
    }
  });
}

if (findings.length === 0) {
  console.log('vet:vendored OK — no forbidden strings found in vendored packs.');
  process.exit(0);
}

console.error(`vet:vendored: ${findings.length} finding(s) in vendored skill packs:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line} [${f.label}]`);
  console.error(`    ${f.text}`);
}

if (STRICT) {
  console.error('\nRe-vet vendored packs and remove or override forbidden guidance before shipping.');
  process.exit(1);
} else {
  console.error('\nRun with --strict to fail the build on these findings.');
}
