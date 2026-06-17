# SPEC

## G
G1: Migrate the useful parts of gstack into an enterprise-safe software-engineer agent architecture for an AWS business application focused on experiment design, marketing campaigns, and uplift modeling, with scoped commits, local install, no default external egress, and portable support for Claude, Codex, Copilot, and future hosts.

## C
C1: Each commit changes one behavior surface only.
C2: Default install must work locally inside a work environment without global config mutation unless explicitly requested.
C3: Default runtime must not call GitHub, Supabase, ngrok, or third-party telemetry/update endpoints.
C4: Credential, cookie, browser-session, tunnel, deploy, git-write, and shell-write capabilities must be disabled or approval-gated by policy.
C5: Architecture must keep future extension points for codebase understanding, browser automation, documentation, QA, security review, and release workflows.
C6: Existing upstream gstack code should be mined for patterns, not adopted wholesale where it conflicts with enterprise policy.
C7: Security posture must be auditable and honest: no promise of "no security issues"; promise least privilege, no intentional default egress, policy gates, and logs.
C8: Target app stack includes AWS, Spring Boot, Databricks, Python, React, C#, Postgres, SQL Server, and likely Strands/AgentCore.
C9: Future UI/agent integration should remain AG-UI compatible.
C10: Migration must explicitly exclude mobile/iOS workflows, public internet scraping, consumer browser automation, generic growth-hacking flows, and unrelated gstack personal-productivity features.
C11: Skill directories must be easy to add, version, review, and install locally for company teams.

## I
I1: Skill templates: Markdown skill definitions and generated host-specific variants.
I2: Host adapters: Claude, Codex, Copilot, and future agent config mappings.
I3: Skill compiler: template rendering, path rewrite, frontmatter transform, suppressed resolver logic.
I4: Policy file: local enterprise config for tool allowlists, egress controls, approval gates, and disabled modules.
I5: Local installer: repo-local or approved-user-dir install path, offline/mirror-friendly.
I6: Audit log: local-only structured record of privileged actions and policy decisions.
I7: Optional tool runtimes: browser daemon, codebase understanding index, test runner, docs generator.
I8: Migration source: `gstack/` repo contents, especially `hosts/`, `scripts/gen-skill-docs.ts`, `scripts/host-config.ts`, skill directories, and browser docs.
I9: Business app domains: causal inference, experiment design, uplift modeling, campaign planning, measurement, data quality, governance, and model interpretation.
I10: Enterprise app stack surfaces: AWS services, Spring Boot APIs, Databricks jobs/notebooks, Python services, React UI, C# services, Postgres, SQL Server.
I11: Agent framework surfaces: Strands, AgentCore, AG-UI, MCP/tool adapters, skill directories, and host-specific agent prompts.
I12: Explicitly excluded surfaces: iOS/mobile QA, public web scraping, ngrok/public tunnels, cookie import, social/browser automation, and public data collection workflows.

## V
V1: No default external egress. Fresh install cannot call remote update, telemetry, tunnel, model, or analytics endpoints before explicit user/admin opt-in.
V2: One behavior per commit. A commit may touch multiple files only when all edits serve the same externally describable behavior.
V3: Local install is reversible. Installer writes only to declared target paths and provides uninstall or cleanup instructions for every written path.
V4: Host portability is declarative. Adding Copilot or another host requires a host config and generated artifacts, not edits to every skill.
V5: Dangerous tools are policy-bound. Shell write, git write, deploy, browser write, cookie import, credential read, and network tunnel require explicit policy allowance.
V6: Browser automation is optional. Core skill workflows work without installing or starting a browser daemon.
V7: Telemetry is removed or internally replaceable. Public Supabase and upstream analytics paths are not present in the enterprise default profile.
V8: Update checks are disabled by default. Version discovery must use an internal mirror or manual admin workflow if enabled.
V9: Remote pairing is disabled by default. ngrok and public tunnel flows cannot be installed or invoked in enterprise profile.
V10: Cookie/session import is disabled by default. Authenticated browser testing requires explicit policy, audit log, and local-only storage.
V11: Codebase understanding is a pluggable module. CodeGraph, embeddings, or another indexer can attach through a stable skill/tool interface later.
V12: Audit logs avoid secrets. Logs may include action type, path, command category, host, and decision, but not tokens, cookie values, API keys, prompts with secrets, or full file contents.
V13: Generated skills include enterprise boundary text. Skills must tell agents not to read unrelated skill packs, secret stores, or global agent configs unless the active task requires it.
V14: Migration preserves useful workflow taxonomy. Keep plan, build, review, QA, security, ship, learn, docs, and codebase-understanding lanes as separate skills or skill families.
V15: Domain skills are first-class. Causal inference, experiment design, uplift modeling, campaign measurement, and data governance get explicit skills rather than generic coding prompts.
V16: Stack skills are first-class. AWS, Spring Boot, Databricks, Python, React, C#, Postgres, and SQL Server workflows get targeted skill directories or modules.
V17: AG-UI compatibility is preserved. Agent outputs and future UI action events should be structured enough to map into AG-UI concepts without rewriting skills.
V18: Strands/AgentCore are integration targets, not hard dependencies in the core. The core skill system must run without them and adapt to them through host/tool adapters.
V19: No mobile carry-over. iOS QA, device tunnels, Swift templates, mobile debug bridge, and mobile-specific gstack skills are excluded.
V20: No public scraping carry-over. Internet scraping/browser harvesting skills are excluded unless later replaced by approved internal data-source connectors.
V21: Data access is governed. Skills that touch Postgres, SQL Server, Databricks, or campaign data must require policy-defined read/write permissions and audit trails.
V22: Domain correctness requires review lanes. Causal claims, experiment validity, uplift interpretation, and campaign recommendations require statistics/measurement review checks.

## T
id|status|task|cites
T1|.|Inventory gstack carry-over candidates: host configs, generator, skill templates, docs, browser daemon, telemetry, update, pair-agent, cookie import|V1,V4,V14,I8
T2|.|Create enterprise module map: core, optional-browser, optional-codebase-understanding, optional-release, disabled-public-egress|V1,V6,V11,I7
T3|.|Define commit discipline doc with examples of allowed and disallowed commit scopes|V2
T4|.|Extract host config model into enterprise core and add Claude, Codex, Copilot starter configs|V4,I2
T5|.|Extract skill compiler with frontmatter transforms, path rewrites, suppressed sections, and metadata generation|V4,V13,I3
T6|.|Create enterprise policy schema for tools, egress, approvals, install paths, audit settings, and optional modules|V5,V12,I4
T7|.|Build local installer profile that writes only to repo-local or admin-approved user paths|V3,I5
T8|.|Remove or stub public telemetry and Supabase sync from enterprise profile|V1,V7
T9|.|Remove or disable public GitHub update checks from enterprise profile; document internal mirror option|V1,V8
T10|.|Disable ngrok and remote pair-agent flows in enterprise profile; keep design notes only as future internal-tunnel option|V9
T11|.|Disable cookie import and authenticated browser state by default; define approval and audit requirements for re-enable|V10
T12|.|Keep browser daemon as optional module with local-only binding, scoped tokens, no tunnel, no cookie import default|V6,V9,V10,I7
T13|.|Add codebase-understanding extension spec for CodeGraph or internal indexer integration|V11,I7
T14|.|Add audit log writer and event taxonomy for privileged action requests and decisions|V12,I6
T15|.|Generate enterprise skills for Claude, Codex, and Copilot and verify no upstream path, telemetry, update, or tunnel references leak into generated output|V1,V4,V7,V8,V9,V13
T16|.|Write migration guide from upstream gstack to enterprise architecture, including keep/change/drop table|V14,I8
T17|.|Add security review checklist for new skills and optional modules|V1,V5,V12
T18|.|Add tests for no-egress defaults, install path containment, host generation, disabled modules, and policy gates|V1,V3,V4,V5,V7,V8,V9,V10
T19|.|Define keep/change/drop inventory specific to the target app: keep host configs and skill compiler; change review/QA/docs/security skills; drop mobile, scraping, public tunnels, telemetry, cookie import|V14,V19,V20,I8,I12
T20|.|Create domain skill map for causal inference, experiment design, uplift modeling, campaign measurement, data governance, and model interpretation|V15,V22,I9
T21|.|Create stack skill map for AWS, Spring Boot, Databricks, Python, React, C#, Postgres, and SQL Server|V16,V21,I10
T22|.|Design Strands/AgentCore adapter boundary for invoking skills and tools without making core architecture depend on those frameworks|V18,I11
T23|.|Define AG-UI-compatible output/event contract for skill results, approval requests, tool actions, progress, and audit references|V17,I11
T24|.|Add local skill directory layout for company teams, including versioning, ownership, review, and install rules|C11,V4,I1,I5
T25|.|Add data-permission policy gates for Databricks, Postgres, SQL Server, campaign datasets, and model outputs|V21,I10
T26|.|Add measurement-review checklist for causal inference, experiment validity, uplift modeling leakage, treatment/control balance, and campaign recommendation risk|V22,I9

## B
id|date|cause|fix
