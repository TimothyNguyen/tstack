#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const skills = [
  ['autoplan', 'Runs the plan review pipeline and produces a reviewed implementation plan before coding begins.'],
  ['claude', 'Optional Claude host bridge for profile-approved cross-agent review or execution.'],
  ['codex', 'Optional Codex host bridge for profile-approved cross-agent review or execution.'],
  ['context-save', 'Captures local working context so a future agent session can resume safely.'],
  ['context-restore', 'Restores previously saved local working context without relying on external services.'],
  ['design-html', 'Turns approved UI design direction into implementation-ready HTML guidance.'],
  ['design-review', 'Reviews product UI and interaction quality for practical design issues.'],
  ['diagram', 'Creates text-first architecture and workflow diagrams from local project context.'],
  ['document-generate', 'Generates missing local project documentation from code-backed evidence.'],
  ['document-release', 'Updates documentation after shipped behavior changes.'],
  ['guard', 'Applies stricter local safety posture for risky tools and filesystem boundaries.'],
  ['plan-pm-review', 'Reviews plans for product scope, business value, and strategic focus.'],
  ['plan-eng-review', 'Reviews plans for architecture, data flow, reliability, and testability.'],
  ['plan-design-review', 'Reviews plans for user experience, UI quality, and product interaction risk.'],
  ['plan-devex-review', 'Reviews plans for developer experience, APIs, onboarding, and operability.'],
  ['retro', 'Produces a local project retrospective from commits, incidents, decisions, and outcomes.'],
  ['ship', 'Prepares a human-approved PR, merge, or release handoff.'],
  ['skillify', 'Turns a repeated local workflow into a reusable skill folder with template files.'],
  ['architecture-agent-upgrade', 'Upgrades this local skill pack through a policy-approved internal or manual flow.'],
  ['test', 'Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy.'],
];

function title(name) {
  return name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

for (const [name, description] of skills) {
  const dir = path.join(root, name);
  const tmpl = path.join(dir, 'SKILL.md.tmpl');
  if (fs.existsSync(tmpl)) continue;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tmpl, `---
name: ${name}
version: 0.1.0
description: |
  ${description}
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

{{PREAMBLE}}

# ${title(name)}

${description}

## Steps

1. Confirm the user goal and scope.
2. Read the relevant local project files.
3. Check policy requirements before any privileged action.
4. Produce a concise result with evidence, risks, and next actions.

{{POLICY_REQUIREMENTS}}

{{BASE_OUTPUT_RULES}}
`);
}
