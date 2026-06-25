#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');
const [cmd, ...rest] = process.argv.slice(2);

const HELP = `
agent-architecture — install and manage agent skills

Commands:
  install    Install agent skills into current repo (creates .agent/)
  upgrade    Upgrade an existing install
  doctor     Check install health

Options:
  --target <dir>        Install to a custom directory (default: .agent/)
  --hosts <list>        Comma-separated host list: claude,codex,copilot
  --docker-mcp [prof]   Wire Docker MCP Gateway (profile name, default: "default")
  --dry-run             Print what would be installed without writing files
  --help                Show this message

Examples:
  npx agent-architecture install
  npx agent-architecture install --target ./.agent --hosts claude,codex
  npx agent-architecture install --docker-mcp backend
  npx agent-architecture upgrade
  npx agent-architecture doctor
`.trim();

if (!cmd || cmd === '--help' || cmd === 'help') {
  console.log(HELP);
  process.exit(0);
}

const FLAG_MAP = {
  install: ['--private', ...rest],
  upgrade: ['--private', '--upgrade', ...rest],
  doctor: ['--doctor', ...rest],
};

const flags = FLAG_MAP[cmd];
if (!flags) {
  console.error(`Unknown command: ${cmd}\n`);
  console.log(HELP);
  process.exit(1);
}

execFileSync(process.execPath, [INSTALL_SCRIPT, ...flags], { stdio: 'inherit' });
