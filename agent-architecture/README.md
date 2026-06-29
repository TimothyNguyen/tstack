# Agent Architecture

Enterprise-safe skill pack for Claude Code, Codex, and Copilot CLI.

**114 skills · 15 role-based agents · No public egress by default**

**Extensibility-first:** Principal engineers can add 150+ skill families systematically with metadata-driven architecture, validation framework, and auto-generated documentation.

## Installation

### Minimal install (core only)

```bash
npm install agent-architecture
npx agent-architecture install --hosts claude
```

Installs core runtime, core agents (`swe`, `qa-agent`, `spec-agent`, `pm`), and ~25 universal skills.

### With add-on packages

```bash
npm install agent-architecture @agent-arch/stacks @agent-arch/adapters @agent-arch/skills
npx agent-architecture install --hosts claude,codex
```

Add-on packages are auto-discovered from `node_modules/@agent-arch/*` at install time. Install only what you need.

### Available packages

| Package | Contents |
|---|---|
| `agent-architecture` | Core runtime, agents (swe/qa-agent/spec-agent/pm), universal skills |
| `@agent-arch/adapters` | Framework adapters: MCP, LangGraph, AG-UI, AgentCore, Strands, GitHub, Databricks, OpenAPI, Google ADK, Docker MCP |
| `@agent-arch/stacks` | Tech stacks: AWS, Python, React/TS, Spring Boot, Databricks, C#, Postgres, SQL Server + domain skills |
| `@agent-arch/skills` | Specialty packs: diagrams, migration, plan-reviews, seniorswe-concise, security, design, benchmarks, docs |

### Install options

```bash
npx agent-architecture install --hosts claude,codex   # generate for specific hosts
npx agent-architecture install --private              # no telemetry, no cloud memory
npx agent-architecture install --docker-mcp backend   # wire Docker MCP Gateway
npx agent-architecture install --dry-run              # preview without writing files
npx agent-architecture upgrade                        # upgrade existing install
npx agent-architecture doctor                         # check install health
```

## Install

```bash
npx agent-architecture install
npx agent-architecture doctor
```

Installs to `.agent/` by default. Reads `.agent-config.json` for customization.

See [INSTALLATION.md](../docs/INSTALLATION.md) for detailed setup, MCP configuration, and cross-repo installation.

## Usage

### Core Agents

- **Brainstorm**: `/orchestrate` — Coordinate multi-team work
- **Implement**: `/swe` — Build code with TDD/conciseness focus
- **Test**: `/qa-agent` — Test and validate systematically
- **Spec**: `/spec-agent` — Write precise specifications
- **Review**: `/pm`, `/design-agent` — Product & design review
- **Deploy**: `/release-agent` — Release & deployment
- **Visualize**: `/diagram-agent` — Create diagrams (flowchart, architecture, ER, sequence)
- **Migrate**: `/migration-engineer` — SQL Server → Postgres migrations

See [WORKFLOWS.md](../docs/WORKFLOWS.md) for end-to-end examples and [DIAGRAM-AGENT-ROLE.md](../docs/DIAGRAM-AGENT-ROLE.md) for diagram workflows.

## Extensibility Framework

Add new skill families **without tribal knowledge**. See [EXTENSIBILITY-GUIDE.md](../docs/EXTENSIBILITY-GUIDE.md) for 6-phase process:

1. **Planning** — Write skill charter, get approval
2. **Build Skills** — TDD pattern (test RED → skill GREEN → refactor)
3. **Define Workflows** — Add to registry.json for coordination
4. **Testing & Validation** — Run full test suite and metadata validation
5. **Documentation & Training** — Generate examples and LLM training data
6. **Package & Release** — Update package.json, release notes, README

**Example:** [SQL Server → Postgres Migration Skills](../migration-sqlserver-assess/SKILL.md) (agent + 5 skills, 480 min workflow)

## Development

```bash
npm run build:skills    # Generate SKILL.md from templates
npm run check:skills    # Verify generated files are fresh
npm test                # Run 401+ unit + integration tests
npm run gen:training-data  # Export JSONL for LLM fine-tuning
```

## Structure

```
agent-architecture/
  agents/              # 15 role-based agents (coordinator, swe, qa, spec, design, diagram, migration, etc.)
  <skill>/             # 114 reusable skills
    SKILL.md.tmpl      # Metadata + checklist template
    SKILL.md           # Generated (committed)
  docs/
    EXTENSIBILITY-GUIDE.md    # Framework for adding skill families
    METADATA-SCHEMA.md        # Skill metadata reference
    CONTRIBUTING.md           # Skill submission workflow (10 steps)
    DIAGRAM-AGENT-ROLE.md     # Diagram specialist guide (8 types)
    workflows/registry.json   # 6 reference workflows
    skill-catalog.md          # Auto-generated skill directory
    TRAINING-DATA.jsonl       # LLM fine-tuning export (1 skill/line)
  hooks/               # Session-start bootstrap
  generated/           # registry.json (114 skills), skills.index.json
  scripts/             # Build, install, upgrade, validation
  tests/               # 401+ unit + integration tests
```

## Enterprise Readiness

### Security

- ✓ No telemetry, no update checks
- ✓ No public tunnels, no cookie import
- ✓ No credential reads, no scraping
- ✓ All MCPs require explicit env vars + policy approval
- ✓ Policy-gated tool access (read-only by default)
- ✓ Session files owner-only (0o600)
- ✓ 9-point validation checklist per skill
- ✓ Security review gates before release

### Governance

- ✓ Metadata-driven architecture (YAML frontmatter)
- ✓ Auto-generated registry and catalog
- ✓ Training data export for LLM fine-tuning
- ✓ Automated skill validation + pre-merge verification
- ✓ Multi-stage release process (RED → GREEN → REFACTOR)
- ✓ Version tracking + dependency management

### Quality

- ✓ 401+ tests (unit + integration + structure)
- ✓ Linting + code review checklist
- ✓ Generated artifacts verified fresh
- ✓ No unresolved placeholders or secrets

## Upgrade

```bash
/architecture-agent-upgrade
```

Agents invoke this skill to upgrade agent-architecture to the latest version.

## License

Apache 2.0. See LICENSE file.

## Quick Start: Add a Skill Family

**New to agent-architecture?** Follow [EXTENSIBILITY-GUIDE.md](../docs/EXTENSIBILITY-GUIDE.md) (6 phases, 1200 lines of walkthrough):

```bash
# 1. Plan (write charter, get approval)
# 2. Build skills (TDD: test RED → skill GREEN)
npm run scaffold:skill -- --name my-skill --agents swe,qa-agent

# 3. Write tests
echo "test('my-skill description', () => { ... })" > tests/my-skill.test.mjs

# 4. Run validation
npm run validate:metadata -- my-skill/SKILL.md.tmpl
npm test -- tests/my-skill.test.mjs

# 5. Build & check
npm run build:skills
npm run check:skills

# 6. Commit
git add my-skill/ tests/my-skill.test.mjs
git commit -m "feat: add my-skill"
```

**[Example: SQL Server → Postgres Migration](../docs/EXTENSIBILITY-GUIDE.md#phase-2-build-skills)** (agent + 5 skills, TDD pattern, full workflow)

## Documentation

- [EXTENSIBILITY-GUIDE.md](../docs/EXTENSIBILITY-GUIDE.md) — Add skill families (6 phases, with SQL Server migration example)
- [METADATA-SCHEMA.md](../docs/METADATA-SCHEMA.md) — Skill metadata reference (category, domain, dependencies, policies)
- [CONTRIBUTING.md](../docs/CONTRIBUTING.md) — Skill submission workflow (10 steps + GitHub charter template)
- [DIAGRAM-AGENT-ROLE.md](../docs/DIAGRAM-AGENT-ROLE.md) — Diagram specialist guide (8 diagram types + routing logic)
- [SKILL-VALIDATION-CHECKLIST.md](../docs/SKILL-VALIDATION-CHECKLIST.md) — QA gate (8 sections, red flags)
- [SECURITY-REVIEW-CHECKLIST.md](../docs/SECURITY-REVIEW-CHECKLIST.md) — Security review (8 categories, OWASP/CWE alignment)
- [WORKFLOWS.md](../docs/WORKFLOWS.md) — End-to-end workflows and use cases
- [INSTALLATION.md](../docs/INSTALLATION.md) — Setup and cross-repo installation

## Contributing

1. See [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for detailed workflow
2. Edit `<skill>/SKILL.md.tmpl` (metadata + checklist)
3. Run `npm run build:skills` then `npm test`
4. Commit template + generated `.md` files together
