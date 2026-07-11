#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');
const [cmd, ...rest] = process.argv.slice(2);

const HELP = `
agent-pack — install and manage agent skills

Commands:
  install    Install agent skills into current repo (creates .agent/)
  upgrade    Upgrade an existing install
  doctor     Check install health
  list-agents
  list-mcp-profiles
  list-hosts

Options:
  --target <dir>        Install to a custom directory (default: .agent/)
  --hosts <list>        Comma-separated host list: claude,codex,copilot
  --mcp-profile <list>  Built-in MCP profiles: github,postgres,slack
  --docker-mcp [prof]   Wire Docker MCP Gateway (profile name, default: "default")
  --dry-run             Print what would be installed without writing files
  --help                Show this message

Examples:
  npx agent-pack install
  npx agent-pack install --target ./.agent --hosts claude,codex
  npx agent-pack install --mcp-profile github,postgres
  npx agent-pack install --docker-mcp backend
  npx agent-pack upgrade
  npx agent-pack doctor
  npx agent-pack list-agents
  npx agent-pack list-mcp-profiles
  npx agent-pack list-hosts
`.trim();

if (!cmd || cmd === '--help' || cmd === 'help') {
  console.log(HELP);
  process.exit(0);
}

const FLAG_MAP = {
  install: ['--private', ...rest],
  upgrade: ['--private', '--upgrade', ...rest],
  doctor: ['--doctor', ...rest],
  'list-agents': ['--list-agents'],
  'list-mcp-profiles': ['--list-mcp-profiles'],
  'list-hosts': ['--list-hosts'],
};

const flags = FLAG_MAP[cmd];
if (!flags) {
  console.error(`Unknown command: ${cmd}\n`);
  console.log(HELP);
  process.exit(1);
}

execFileSync(process.execPath, [INSTALL_SCRIPT, ...flags], { stdio: 'inherit' });
