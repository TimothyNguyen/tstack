# Learn Skill — Design Spec

**Date:** 2026-06-25  
**Status:** Approved  
**Scope:** `agent-architecture/` — new `learn/` skill + `learn-out/` output folder

---

## Problem

Agents produce knowledge during sessions — decisions, patterns, pitfalls, product understanding — but none of it is captured or reusable. Users cannot review, study, or export what agents discovered. No mechanism exists to accumulate product intelligence across sessions.

---

## Goal

Add a `learn` skill to `agent-architecture` that:
1. Any agent can invoke to extract Q&A flashcards from session context
2. Stores cards locally as structured JSON (append-only, per-deck)
3. Exports Quizlet-compatible CSV via Python CLI
4. Optionally pushes cards to Confluence via `atlassian-docs` skill

---

## Non-Goals

- No web server, no database service (flat files only)
- No real-time sync
- No Anki integration (Quizlet CSV is the export target)
- No automatic capture — agents invoke explicitly

---

## Folder Structure

```
agent-architecture/
├── learn/
│   ├── SKILL.md.tmpl          # source of truth
│   ├── SKILL.md               # generated, committed
│   └── export.py              # Quizlet CSV + Confluence push CLI
└── learn-out/                 # gitignored, local only
    ├── cards.json             # all cards, append-only master list
    └── decks/
        ├── swe.json
        ├── product.json
        └── <deck>.json        # auto-created per deck name
```

`learn-out/` is added to `.gitignore`. Cards are local by default; Confluence push is opt-in.

---

## Data Model

Each card is a JSON object:

```json
{
  "id": "<uuid4>",
  "front": "What does the swe agent do when detecting a bug?",
  "back": "Invokes investigate skill for root cause before writing any fix.",
  "deck": "swe",
  "source_agent": "swe",
  "tags": ["workflow", "debugging"],
  "created_at": "2026-06-25T10:00:00Z"
}
```

`cards.json` is an array. Deck files mirror same schema, filtered by `deck` field.  
`id` is stable — duplicate detection uses `front` hash to avoid re-inserting same question.

---

## Skill Workflow

When any agent invokes `learn`:

1. Agent passes session summary or raw context to skill
2. Skill prompts LLM to extract 3–10 Q&A pairs from content
3. LLM assigns `deck` name (usually matches invoking agent name) and `tags`
4. Skill appends new cards (dedup by front hash) to `learn-out/cards.json`
5. Skill writes/merges into `learn-out/decks/<deck>.json`
6. Skill prints: `Captured N cards → deck: <name>` (deterministic confirmation)
7. If `--push-confluence` flag present: invoke `atlassian-docs` to write page

**Invoke from any agent:**
```
/learn                          # capture from current session
/learn --deck product           # override deck name
/learn --push-confluence        # capture + push to Confluence
```

---

## Export CLI (`export.py`)

Runs standalone, no dependencies beyond Python 3.x stdlib + optional `requests` for Confluence push.

```bash
# Quizlet CSV export
python learn/export.py --deck swe --format quizlet
python learn/export.py --all --format quizlet
python learn/export.py --since 2026-06-01 --format quizlet

# Confluence push
python learn/export.py --deck swe --confluence --page-title "SWE Agent Learnings"
python learn/export.py --all --confluence --space-key PROD
```

**Quizlet CSV format:** tab-separated, one card per line:
```
What does the swe agent do?\tInvokes investigate skill for root cause.
```

---

## Confluence Integration

Optional at every step. Two trigger paths:

**Path 1 — inline during capture:**
```
/learn --push-confluence
```
Skill captures cards, then calls `atlassian-docs` to create or update page.

**Path 2 — explicit CLI push:**
```
python learn/export.py --confluence --page-title "..." --space-key PROD
```

**Confluence page structure:**
```
📚 Learn: <deck-name>
Last updated: <date> | Source agent: <agent> | Cards: N

| Question | Answer | Tags |
|----------|--------|------|
| ...      | ...    | ...  |
```

Skill declares `atlassian-docs` as optional dependency:
```yaml
optional_skills: [atlassian-docs]
```
Agents without Confluence access skip push silently. Local write always succeeds.

---

## Skill Frontmatter

```yaml
---
name: learn
version: 0.1.0
description: |
  Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
  Writes to local learn-out/ folder. Exports Quizlet-compatible CSV.
  Optionally pushes to Confluence via atlassian-docs.
  Invoke via /learn at end of any session.
agents: [swe, qa-agent, pm, spec-agent, orchestrate, data, cloud, security, design-agent, migration, release-agent, interviewer]
optional_skills: [atlassian-docs]
---
```

---

## Agent Integration Pattern

Agents add `learn` to their end-of-session workflow:

```markdown
## End of session
- invoke `context-save` to persist working state
- invoke `learn` to capture Q&A from session output
```

`orchestrate` agent invokes `learn` after multi-agent runs to capture cross-agent knowledge.

---

## Dedup Strategy

Before appending, `export.py` and the skill both hash `front.strip().lower()`.  
If hash exists in `cards.json`, card is skipped. New `back` content for same question is flagged as a conflict — user resolves manually or `--overwrite` flag replaces.

---

## Error Handling

| Condition | Behavior |
|-----------|----------|
| `learn-out/` missing | Auto-created on first run |
| `cards.json` malformed | Backed up as `cards.json.bak`, fresh file started |
| Confluence push fails | Local write succeeds, error printed, non-fatal |
| LLM extracts 0 cards | Prints warning, exits 0 (no partial write) |
| Duplicate card | Skipped silently unless `--verbose` |

---

## Files Changed

| File | Action |
|------|--------|
| `learn/SKILL.md.tmpl` | Create |
| `learn/SKILL.md` | Create (generated) |
| `learn/export.py` | Create |
| `.gitignore` | Add `learn-out/` |
| `agents/swe/SKILL.md.tmpl` | Add `learn` to end-of-session workflow |
| `agents/orchestrate/SKILL.md.tmpl` | Add `learn` to post-run workflow |
| `agents/routing.json` | No change needed |
