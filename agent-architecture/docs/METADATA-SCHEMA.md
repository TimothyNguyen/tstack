# Skill Metadata Schema v1.0.0

Enhanced frontmatter for skills, agents, and workflows. **Backwards compatible** — optional fields enable gradual adoption.

## Frontmatter Structure

```yaml
---
name: skill-name
version: 0.1.0
description: |
  Clear description of skill purpose.
  Multi-line OK. First line is tldr for catalogs.
allowed-tools:
  - Read
  - Bash
agents: [agent1, agent2]

# OPTIONAL: Metadata for discovery, validation, training
metadata:
  category: "core"                 # core, visual-system, design, code, data, release, infrastructure
  domain: null                     # null=core. Optional: aws, databricks, spring-boot, react, postgres
  tier: "essential"                # essential, recommended, optional
  
  dependencies:
    mcps: []                        # MCP server requirements: [drawio-mcp, github-mcp]
    skills: []                      # Cross-skill dependencies: [diagram-export, spec]
    min-agent-arch-version: "0.1.4" # Minimum version of agent-architecture required
    max-agent-arch-version: null    # null = no upper limit. "1.x" = compatible with 1.x
  
  training:
    examples: null                  # Path to examples file: references/diagram-examples.md
    patterns: null                  # Path to patterns file: references/diagram-patterns.md
    keywords: []                    # Searchable keywords for LLM training
  
  discovery:
    related-to: []                  # Related skills: [design-html, documentation]
    replaces: null                  # Deprecated skill being replaced
  
  approval-gates:
    policy-required: []             # Policies that must be checked: [mcp-egress, destructive-operations]
  
  support:
    maintenance-status: "active"    # active, experimental, deprecated
    owner-team: null                # Team responsible for maintenance
    last-reviewed: "2026-06-26"     # ISO date of last review

# OPTIONAL: Skills that enhance this skill but aren't required
optional-skills: []
---
```

## Field Definitions

### Required Fields (All Skills)

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Unique skill identifier. Matches directory name. Lowercase, hyphens. |
| `version` | semver | Skill version (major.minor.patch). See versioning guide. |
| `description` | string | Clear, concise skill purpose. Multi-line OK. First line = catalog entry. |
| `allowed-tools` | array | Tools this skill uses: Read, Grep, Glob, Bash, etc. |
| `agents` | array | Agents that access this skill. Use `[_infrastructure]` for non-agent skills. |

### Optional Metadata Fields

#### `metadata.category`

Skill family for grouping and discovery.

- `core`: Fundamental workflows (brainstorming, spec, review)
- `visual-system`: Diagrams, design, UI (new: diagram-generate, design-html)
- `design`: Design review, UX patterns
- `code`: Implementation, testing, code review
- `data`: Data pipelines, MLOps, analytics
- `release`: Release planning, deployment, canary
- `infrastructure`: System skills (routing, orchestration, policies)

#### `metadata.domain`

Optional tech stack or business domain.

- `null`: Core domain-neutral skill
- `aws`: AWS-specific patterns
- `databricks`: Databricks workflows
- `spring-boot`: Spring Boot modernization
- `react`: React + TypeScript patterns
- `postgres`: PostgreSQL database work
- etc.

#### `metadata.tier`

Importance level for onboarding.

- `essential`: Must-know for all agents
- `recommended`: Strongly recommended for specialization
- `optional`: Advanced/domain-specific use cases

#### `metadata.dependencies`

What this skill needs to function.

```yaml
dependencies:
  mcps:                              # MCP servers required
    - name: drawio-mcp
      min-version: "1.0.0"
      max-version: "2.x"
  skills:                            # Other skills this depends on
    - diagram-export
    - diagram-validate
  min-agent-arch-version: "0.1.4"    # Earliest compatible agent-architecture
  max-agent-arch-version: null       # null = no upper limit
```

#### `metadata.training`

Data for LLM fine-tuning and discovery.

```yaml
training:
  examples: "references/diagram-examples.md"  # File with usage examples
  patterns: "references/diagram-patterns.md"  # Common patterns and anti-patterns
  keywords: [diagram, architecture, flowchart, visual, draw.io]
```

#### `metadata.discovery`

Link skills for navigation and cross-references.

```yaml
discovery:
  related-to: [design-html, documentation, diagram-export]
  replaces: old-diagram-skill          # If this skill supersedes another
```

#### `metadata.approval-gates`

Policies that must be verified before using this skill.

```yaml
approval-gates:
  policy-required: [mcp-egress, destructive-operations]
```

Policies are checked at:
- Skill discovery time (registry load)
- Before skill invocation (agent routing)
- At install time (policy validation)

#### `metadata.support`

Maintenance and ownership information.

```yaml
support:
  maintenance-status: "active"    # active | experimental | deprecated
  owner-team: "design-systems"    # Team responsible for this skill
  last-reviewed: "2026-06-26"     # ISO date of last security/completeness review
```

### Optional Skills

Skills that enhance but aren't required.

```yaml
optional-skills:
  - diagram-search          # Optional: find shapes before generating
  - diagram-style           # Optional: apply styling after generation
  - diagram-validate        # Optional: validate completeness
```

Agents invoke optional skills when available but don't fail if unavailable.

## Examples

### Minimal Skill (No Metadata)

```yaml
---
name: my-skill
version: 0.1.0
description: My skill does X.
allowed-tools: [Read, Bash]
agents: [swe]
---
```

**Backwards compatible** — works with existing agent-architecture.

### Rich Skill (Full Metadata)

```yaml
---
name: diagram-generate
version: 0.1.0
description: |
  Generate Draw.io diagrams from text descriptions.
  Supports flowchart, architecture, ER, sequence, class diagrams.
allowed-tools: [Read, Bash, Grep]
agents: [design-agent, spec-agent, orchestrate]

metadata:
  category: "visual-system"
  domain: null
  tier: "recommended"
  
  dependencies:
    mcps:
      - name: drawio-mcp
        min-version: "1.0.0"
    skills: [diagram-export, diagram-validate]
    min-agent-arch-version: "0.1.4"
  
  training:
    examples: "references/diagram-examples.md"
    patterns: "references/diagram-patterns.md"
    keywords: [diagram, architecture, flowchart, visual, draw.io]
  
  discovery:
    related-to: [design-html, design-review, diagram-export]
  
  approval-gates:
    policy-required: [mcp-egress]
  
  support:
    maintenance-status: "active"
    owner-team: "design-systems"
    last-reviewed: "2026-06-26"

optional-skills:
  - diagram-search
  - diagram-style
---
```

## Versioning

### Skill Version Semantics (SemVer)

```
skill-version: major.minor.patch

- major: Breaking change to workflow steps or required tools
- minor: New features (steps, examples, optional sections)
- patch: Documentation fixes, clarifications, bug corrections
```

### Agent-Architecture Version Compatibility

Skills declare minimum and maximum agent-architecture versions.

```yaml
metadata:
  dependencies:
    min-agent-arch-version: "0.1.4"  # Oldest compatible version
    max-agent-arch-version: "1.x"    # "1.x" = 1.0-1.999, null = unlimited
```

## Deprecation

Skills can mark themselves as deprecated with a replacement path.

```yaml
metadata:
  support:
    maintenance-status: "deprecated"
  discovery:
    replaces: old-skill-name

# In skill body, add section:

## Deprecation Notice

This skill is deprecated as of version 0.2.0.

**Use [`new-skill`](../new-skill/SKILL.md) instead.**

Replacement guide: See `references/migrate-from-old-skill.md`
```

## Registry Integration

When skills are built, metadata is:

1. **Extracted** → `scripts/discover-skills.mjs` reads all frontmatter
2. **Validated** → `scripts/validate-metadata.mjs` checks schema compliance
3. **Indexed** → `generated/registry.json` contains full metadata
4. **Embedded** → `generated/skills.index.json` for LLM ingestion
5. **Cataloged** → `docs/skill-catalog.md` auto-generated from metadata

## Validation Rules

### Required Field Validation

- `name`: Non-empty, matches directory, lowercase + hyphens only
- `version`: Valid semver (major.minor.patch)
- `description`: Non-empty, ideally 1-3 sentences
- `allowed-tools`: Non-empty array, valid tool names
- `agents`: Non-empty array, valid agent names (or `[_infrastructure]`)

### Optional Metadata Validation

- `metadata.category`: One of defined categories
- `metadata.domain`: null or valid domain name
- `metadata.dependencies.mcps`: Valid MCP names with version constraints
- `metadata.dependencies.skills`: Valid skill names (exist in registry)
- `metadata.approval-gates.policy-required`: Valid policy names
- `metadata.support.last-reviewed`: Valid ISO date (YYYY-MM-DD)

### Cross-Validation

- If `metadata.dependencies.skills` lists another skill, that skill must exist
- If `metadata.discovery.replaces` is set, referenced skill must exist
- If `metadata.discovery.related-to` lists skills, they must exist
- Agent declarations must reference valid agent names

## Adoption Timeline

- **Phase 1 (now):** Framework ready. New skills use full metadata. Existing skills unchanged.
- **Phase 2 (1-2 weeks):** Core 20 skills migrated to metadata. Catalog generated.
- **Phase 3 (2-3 weeks):** Design + visual skills migrated (15 skills).
- **Phase 4 (3-4 weeks):** Domain skills migrated (40+ skills). Training data exported.
- **Phase 5 (ongoing):** All 102 skills migrated. Monthly validation runs.

See `CONTRIBUTING.md` for submission guidelines.

