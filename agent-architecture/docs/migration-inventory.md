# Migration Inventory

This inventory decides what to carry over from `gstack/` into
`agent-architecture/`.

`gstack/` remains upstream source material. Nothing is consumed in place by the
new package. Every carried item must be copied or reimplemented behind the
enterprise package boundary.

## Decision Table

| Source area | Decision | Rationale | Target |
|---|---|---|---|
| `hosts/*.ts` | Keep pattern, reimplement | Declarative host configs are the cleanest portability boundary. | `hosts/` |
| `scripts/host-config.ts` | Keep concept, simplify | Strong typed schema, validation, and uniqueness checks are reusable. Strip gstack-specific fields. | `core/host-config` |
| `scripts/gen-skill-docs.ts` | Change heavily | Template generation is useful, but upstream resolver/preamble behavior includes update checks, telemetry, and Claude-specific assumptions. | `core/skill-compiler` |
| Skill directory convention | Keep | Top-level directory-per-skill with `SKILL.md.tmpl` source and generated `SKILL.md` is reviewable, versionable, and easy to install locally. | `<skill>/` |
| Generated host variants | Keep pattern | Claude, Codex, Copilot, Strands, AgentCore, and future hosts should receive generated artifacts from one source. | `hosts/`, `core/skill-compiler` |
| Workflow taxonomy | Keep selectively | Planning, review, QA, security, docs, learnings, and ship lanes are useful. Adapt leadership labels to company roles such as PM, director, and senior principal. | top-level skill folders |
| `/review` | Change | Review skill is useful, but must be policy-aware and stack-neutral by default. | `review/` |
| `/cso` | Change | Security review is useful, but must focus on enterprise app, data, cloud, and agent-tool risks. | `security-review/` |
| `/qa` and `/qa-only` | Change | QA methodology is useful. Browser-driven testing is optional and cannot assume cookie import or public sites. | `qa/` |
| `/document-*` | Change | Documentation generation/release checks are useful, but must avoid public browsing and telemetry. | `documentation/` |
| `/learn` | Change | Project learnings are useful if local-only and secret-safe. | `learnings/`, `policies/` |
| `/spec` | Keep concept | Spec-first work fits scoped commits and reviewable behavior. Use generic format, not personal workflow assumptions. | `spec/` |
| `/ship` and `/land-and-deploy` | Change or defer | Release automation is useful but high risk. Keep as optional policy-gated skill. | `release/` |
| `/browse` daemon | Defer as optional | Local browser control can help UI QA but is not core. Disable by default; no tunnels or cookie import. | `adapters/browser` |
| `pair-agent` | Drop by default | Public or cross-machine remote control is too sensitive for the default company profile. | none |
| ngrok tunnel support | Drop | Public tunnels violate no-default-egress and enterprise network posture. | none |
| Cookie import/browser session import | Drop by default | Credential/session access must not be part of the default architecture. | none |
| Public scraping/browser harvesting | Drop | User explicitly excluded internet scraping and public data collection. | none |
| iOS/mobile QA | Drop | User explicitly excluded mobile workflows. | none |
| Telemetry/Supabase | Drop | Public telemetry is incompatible with default enterprise posture. Internal telemetry can be designed later. | none |
| Public update checks | Drop | Default install must not call GitHub or upstream update endpoints. Use manual or internal mirror later. | none |
| `gstack-upgrade` | Drop | Upgrade flow depends on upstream repo/network assumptions. | none |
| `setup` installer | Change heavily | Install flow is useful but must be local, reversible, no global mutation by default, offline/mirror-friendly. | `core/install` |
| Browser prompt-injection defenses | Keep lessons, not code initially | Content boundaries, canaries, and classifiers are relevant, but model/runtime dependencies need separate review. | `docs/security-posture.md`, later optional adapter |
| `model-overlays/` | Drop initially | Model-specific style overlays are not core architecture. Add later only if host compatibility requires it. | none |
| `openclaw/`, `claude/`, `codex/` wrapper skills | Change | Host bridge ideas are useful, but new package needs neutral host adapters. | `hosts/` |
| `gbrain` memory flows | Defer | Codebase understanding is important, but should be implemented as a pluggable adapter such as CodeGraph/internal index. | `adapters/codebase-understanding` |
| `make-pdf`, `diagram`, `design-*` | Drop initially | Useful tools but not core to software-engineer agent architecture for enterprise app work. | none |
| `benchmark`, `canary`, performance tooling | Defer | Useful for mature delivery workflow, not first migration slice. | optional skill pack |

## Initial Carry-Over Set

The first implementation slice should carry over only:

- Host config schema and registry.
- Skill source directory convention.
- Skill compiler skeleton.
- Enterprise policy model.
- Local install layout.
- Generic starter skills for spec, review, QA, security review, documentation,
  learnings, release, plan review, investigation, and codebase understanding.

Everything else remains excluded or deferred until the core proves local,
auditable, and no-egress by default.

## Project-Specific Skill Packs

Domain and stack support should be optional packs, not core:

- `profiles/marketing-measurement`
- `domain-causal-inference`
- `domain-experiment-design`
- `domain-uplift-modeling`
- `stack-aws`
- `stack-spring-boot`
- `stack-databricks`
- `stack-python`
- `stack-react`
- `stack-csharp`
- `stack-postgres`
- `stack-sql-server`

These packs can be installed together for the first target app, but another
project should be able to use the core without them.

## Non-Negotiable Defaults

- No public telemetry.
- No public update check.
- No ngrok or public tunnel.
- No cookie import.
- No mobile/iOS workflow.
- No public internet scraping.
- No global config mutation unless explicitly requested.
- No privileged tool without policy allowlist and audit event.
