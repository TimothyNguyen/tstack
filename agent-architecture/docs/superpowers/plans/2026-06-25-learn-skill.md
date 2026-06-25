# Learn Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `learn` skill to agent-architecture that any agent can invoke to extract Q&A flashcards from session context, store them locally as JSON, export Quizlet-compatible CSV, and optionally push to Confluence.

**Architecture:** Flat-file skill — no server, no database. The skill (`learn/SKILL.md`) instructs the agent to extract Q&A pairs and write them to `learn-out/` via `learn/export.py`. The Python CLI handles all I/O: append-only JSON storage, dedup by front-hash, Quizlet CSV export, optional Confluence REST push.

**Tech Stack:** Python 3.x stdlib only (no pip required), Node.js (existing build toolchain), Markdown skill templates (existing pattern).

## Global Constraints

- Edit `.tmpl` files, not generated `.md` files directly — `npm run build:skills` regenerates SKILL.md
- `learn-out/` is gitignored — never committed
- Python CLI uses stdlib only: `json`, `uuid`, `hashlib`, `datetime`, `urllib.request`, `csv`, `argparse` — no third-party packages
- Conventional Commits: `feat(learn): ...`
- Run `npm run build:skills && npm run check:skills && npm test` before every commit involving skill files
- All skill frontmatter must declare `agents:` — orphan check runs in `npm test`
- Confluence push uses env vars: `CONFLUENCE_URL`, `CONFLUENCE_USER`, `CONFLUENCE_API_TOKEN`

---

### Task 1: Create `learn/SKILL.md.tmpl`

**Files:**
- Create: `learn/SKILL.md.tmpl`
- Generate: `learn/SKILL.md` (via `npm run build:skills`)

**Interfaces:**
- Produces: `learn` skill invokable by any agent, declares `agents: [swe, qa-agent, pm, spec-agent, orchestrate, data, cloud, security, design-agent, migration, release-agent, interviewer]`

- [ ] **Step 1: Create `learn/SKILL.md.tmpl`**

```markdown
---
name: learn
version: 0.1.0
description: |
  Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
  Writes to local learn-out/ folder as JSON. Exports Quizlet-compatible CSV via
  learn/export.py. Optionally pushes cards to Confluence via atlassian-docs.
  Invoke via /learn at end of any session.
agents: [swe, qa-agent, pm, spec-agent, orchestrate, data, cloud, security, design-agent, migration, release-agent, interviewer]
optional_skills: [atlassian-docs]
---

{{PREAMBLE}}

# Learn

Extract reusable Q&A flashcards from the current session and persist them locally.

## When to invoke

Invoke at the end of any session where new knowledge was produced:
- After implementing a feature (what did we decide and why)
- After debugging (what was the root cause, what does it teach)
- After spec writing (key product decisions)
- After any multi-agent orchestration run

## Workflow

1. **Extract** — from the current session context, generate 3–10 Q&A pairs covering
   decisions, patterns, pitfalls, and product knowledge. Use this prompt pattern:

   > "From this session, extract Q&A flashcards. For each card:
   > - `front`: a clear question someone unfamiliar with this would ask
   > - `back`: a precise, self-contained answer
   > - `deck`: topic or agent name (e.g. 'swe', 'product', 'architecture')
   > - `tags`: 2–4 relevant tags"

2. **Write** — call `learn/export.py --ingest` passing the extracted JSON array via stdin.
   The script appends to `learn-out/cards.json` and writes per-deck files.

3. **Confirm** — print the output: `Captured N cards → deck: <name>`

4. **Confluence (optional)** — if `--push-confluence` was passed, invoke `atlassian-docs`
   to create or update a Confluence page with the new cards table.

## Invocation

```
/learn                           # capture from current session context
/learn --deck product            # override deck name for all cards
/learn --push-confluence         # capture + push to Confluence
```

## Export (separate from capture)

```bash
python learn/export.py --deck swe --format quizlet          # → swe-cards.csv
python learn/export.py --all --format quizlet               # → all-cards.csv
python learn/export.py --since 2026-06-01 --format quizlet  # date-filtered
python learn/export.py --deck swe --confluence --page-title "SWE Learnings"
```

## Card schema

```json
{
  "id": "<uuid4>",
  "front": "question text",
  "back": "answer text",
  "deck": "swe",
  "source_agent": "swe",
  "tags": ["workflow", "debugging"],
  "created_at": "2026-06-25T10:00:00Z"
}
```

## Error handling

| Condition | Behavior |
|-----------|----------|
| `learn-out/` missing | Auto-created |
| `cards.json` malformed | Backed up as `cards.json.bak`, fresh file started |
| Confluence push fails | Local write succeeds, error printed, non-fatal |
| LLM extracts 0 cards | Warning printed, exits 0, no write |
| Duplicate card (same front) | Skipped silently |

{{POLICY_REQUIREMENTS}}
```

- [ ] **Step 2: Run build to generate `learn/SKILL.md`**

```bash
cd agent-architecture
npm run build:skills
```

Expected output: no errors, `learn/SKILL.md` created.

- [ ] **Step 3: Verify `learn/SKILL.md` exists and tokens are resolved**

```bash
head -5 learn/SKILL.md
```

Expected: frontmatter block with `name: learn`, no `{{PREAMBLE}}` token visible.

- [ ] **Step 4: Run skill check**

```bash
npm run check:skills
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add learn/SKILL.md.tmpl learn/SKILL.md
git commit -m "feat(learn): add learn skill template"
```

---

### Task 2: Create `learn/export.py`

**Files:**
- Create: `learn/export.py`

**Interfaces:**
- Consumes: `learn-out/cards.json` (array of card objects from Task 1 schema)
- Produces:
  - Quizlet CSV: `<deck>-cards.csv` or `all-cards.csv` (tab-separated `front\tback`)
  - Confluence page: REST PUT to `CONFLUENCE_URL/wiki/rest/api/content/<id>` or POST to create
  - Ingest mode (stdin): appends cards to `learn-out/cards.json`

- [ ] **Step 1: Create `learn/export.py`**

```python
#!/usr/bin/env python3
"""
learn/export.py — flashcard capture and export CLI.

Modes:
  --ingest          Read JSON array from stdin, append to learn-out/cards.json
  --format quizlet  Export tab-separated CSV for Quizlet import
  --confluence      Push cards to Confluence page (requires env vars)

Env vars for Confluence:
  CONFLUENCE_URL        e.g. https://your-org.atlassian.net
  CONFLUENCE_USER       e.g. user@example.com
  CONFLUENCE_API_TOKEN  Atlassian API token
"""
import argparse
import csv
import hashlib
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError
import base64

LEARN_OUT = Path(__file__).parent.parent / "learn-out"
CARDS_FILE = LEARN_OUT / "cards.json"
DECKS_DIR = LEARN_OUT / "decks"


def ensure_dirs():
    LEARN_OUT.mkdir(exist_ok=True)
    DECKS_DIR.mkdir(exist_ok=True)


def load_cards() -> list[dict]:
    if not CARDS_FILE.exists():
        return []
    try:
        return json.loads(CARDS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        backup = CARDS_FILE.with_suffix(".json.bak")
        CARDS_FILE.rename(backup)
        print(f"Warning: cards.json was malformed — backed up to {backup.name}", file=sys.stderr)
        return []


def save_cards(cards: list[dict]):
    CARDS_FILE.write_text(json.dumps(cards, indent=2, ensure_ascii=False), encoding="utf-8")


def front_hash(front: str) -> str:
    return hashlib.sha256(front.strip().lower().encode()).hexdigest()[:16]


def write_deck(deck: str, cards: list[dict]):
    deck_cards = [c for c in cards if c.get("deck") == deck]
    if deck_cards:
        path = DECKS_DIR / f"{deck}.json"
        path.write_text(json.dumps(deck_cards, indent=2, ensure_ascii=False), encoding="utf-8")


def ingest(raw: list[dict], deck_override: str | None, source_agent: str) -> int:
    ensure_dirs()
    existing = load_cards()
    existing_hashes = {front_hash(c["front"]) for c in existing}

    added = 0
    affected_decks = set()
    for card in raw:
        h = front_hash(card.get("front", ""))
        if h in existing_hashes:
            continue
        card.setdefault("id", str(uuid.uuid4()))
        card.setdefault("created_at", datetime.now(timezone.utc).isoformat())
        card["source_agent"] = source_agent
        if deck_override:
            card["deck"] = deck_override
        card.setdefault("deck", "general")
        card.setdefault("tags", [])
        existing.append(card)
        existing_hashes.add(h)
        affected_decks.add(card["deck"])
        added += 1

    if added == 0:
        print("No new cards (all duplicates or empty input).")
        return 0

    save_cards(existing)
    for deck in affected_decks:
        write_deck(deck, existing)

    deck_names = ", ".join(sorted(affected_decks))
    print(f"Captured {added} cards → deck: {deck_names}")
    return added


def filter_cards(cards: list[dict], deck: str | None, since: str | None, all_cards: bool) -> list[dict]:
    result = cards
    if not all_cards and deck:
        result = [c for c in result if c.get("deck") == deck]
    if since:
        result = [c for c in result if c.get("created_at", "") >= since]
    return result


def export_quizlet(cards: list[dict], out_path: Path):
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter="\t")
        for card in cards:
            writer.writerow([card.get("front", ""), card.get("back", "")])
    print(f"Exported {len(cards)} cards → {out_path}")


def confluence_push(cards: list[dict], page_title: str, space_key: str):
    base_url = os.environ.get("CONFLUENCE_URL", "").rstrip("/")
    user = os.environ.get("CONFLUENCE_USER", "")
    token = os.environ.get("CONFLUENCE_API_TOKEN", "")

    if not all([base_url, user, token]):
        print(
            "Error: set CONFLUENCE_URL, CONFLUENCE_USER, CONFLUENCE_API_TOKEN to push.",
            file=sys.stderr,
        )
        return

    table_rows = "\n".join(
        f"<tr><td>{c.get('front','')}</td><td>{c.get('back','')}</td>"
        f"<td>{', '.join(c.get('tags', []))}</td></tr>"
        for c in cards
    )
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    body = (
        f"<p>Last updated: {now} | Cards: {len(cards)}</p>"
        f"<table><tr><th>Question</th><th>Answer</th><th>Tags</th></tr>"
        f"{table_rows}</table>"
    )

    creds = base64.b64encode(f"{user}:{token}".encode()).decode()
    headers = {
        "Authorization": f"Basic {creds}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Search for existing page
    search_url = f"{base_url}/wiki/rest/api/content?title={page_title}&spaceKey={space_key}&expand=version"
    try:
        req = Request(search_url, headers=headers)
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
    except URLError as e:
        print(f"Confluence push failed: {e}", file=sys.stderr)
        return

    results = data.get("results", [])

    if results:
        page_id = results[0]["id"]
        version = results[0]["version"]["number"] + 1
        payload = {
            "version": {"number": version},
            "title": page_title,
            "type": "page",
            "body": {"storage": {"value": body, "representation": "storage"}},
        }
        update_url = f"{base_url}/wiki/rest/api/content/{page_id}"
        req = Request(
            update_url,
            data=json.dumps(payload).encode(),
            headers=headers,
            method="PUT",
        )
    else:
        payload = {
            "type": "page",
            "title": page_title,
            "space": {"key": space_key},
            "body": {"storage": {"value": body, "representation": "storage"}},
        }
        create_url = f"{base_url}/wiki/rest/api/content"
        req = Request(
            create_url,
            data=json.dumps(payload).encode(),
            headers=headers,
            method="POST",
        )

    try:
        with urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            print(f"Confluence page updated: {result.get('_links', {}).get('webui', page_title)}")
    except URLError as e:
        print(f"Confluence push failed: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="learn flashcard capture and export")
    parser.add_argument("--ingest", action="store_true", help="Read JSON from stdin, append cards")
    parser.add_argument("--deck", help="Filter by or override deck name")
    parser.add_argument("--all", dest="all_cards", action="store_true", help="Include all decks")
    parser.add_argument("--since", help="Filter cards created on or after date (ISO, e.g. 2026-06-01)")
    parser.add_argument("--format", choices=["quizlet"], help="Export format")
    parser.add_argument("--confluence", action="store_true", help="Push to Confluence")
    parser.add_argument("--page-title", default="Agent Learnings", help="Confluence page title")
    parser.add_argument("--space-key", default="PROD", help="Confluence space key")
    parser.add_argument("--source-agent", default="unknown", help="Agent name for ingest metadata")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    if args.ingest:
        raw = json.loads(sys.stdin.read())
        if not isinstance(raw, list):
            print("Error: stdin must be a JSON array of card objects.", file=sys.stderr)
            sys.exit(1)
        ingest(raw, args.deck, args.source_agent)
        return

    ensure_dirs()
    cards = load_cards()
    if not cards:
        print("No cards found in learn-out/cards.json")
        return

    filtered = filter_cards(cards, args.deck, args.since, args.all_cards)
    if not filtered:
        print(f"No cards matched filters (deck={args.deck}, since={args.since})")
        return

    if args.format == "quizlet":
        suffix = args.deck or "all"
        out = Path(f"{suffix}-cards.csv")
        export_quizlet(filtered, out)

    if args.confluence:
        confluence_push(filtered, args.page_title, args.space_key)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Smoke-test ingest (creates learn-out/ and cards.json)**

```bash
cd agent-architecture
echo '[{"front":"What is seniorswe-concise?","back":"Lazy-senior-dev mode. Simplest solution that works.","deck":"swe","tags":["mode"]}]' | python learn/export.py --ingest --source-agent swe
```

Expected output:
```
Captured 1 cards → deck: swe
```

- [ ] **Step 3: Verify files created**

```bash
python -c "import json; cards=json.load(open('learn-out/cards.json')); print(f'{len(cards)} cards, id={cards[0][\"id\"]}')"
python -c "import json; print(json.load(open('learn-out/decks/swe.json'))[0]['front'])"
```

Expected: `1 cards, id=<uuid>` then `What is seniorswe-concise?`

- [ ] **Step 4: Test dedup — same card ingested again produces no new entries**

```bash
echo '[{"front":"What is seniorswe-concise?","back":"Lazy-senior-dev mode. Simplest solution that works.","deck":"swe","tags":["mode"]}]' | python learn/export.py --ingest --source-agent swe
```

Expected: `No new cards (all duplicates or empty input).`

- [ ] **Step 5: Test Quizlet export**

```bash
python learn/export.py --deck swe --format quizlet
cat swe-cards.csv
```

Expected: one line `What is seniorswe-concise?\tLazy-senior-dev mode. Simplest solution that works.`

- [ ] **Step 6: Clean up test artifacts**

```bash
rm -rf learn-out swe-cards.csv
```

- [ ] **Step 7: Commit**

```bash
git add learn/export.py
git commit -m "feat(learn): add export.py — ingest, Quizlet export, Confluence push"
```

---

### Task 3: Update `.gitignore` and `package.json`

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`

**Interfaces:**
- Produces: `learn-out/` excluded from git; `learn/` included in npm pack

- [ ] **Step 1: Add `learn-out/` to `.gitignore`**

Open `agent-architecture/.gitignore` and append:

```
learn-out/
```

- [ ] **Step 2: Add `learn/` to `package.json` `files` array**

In `package.json`, find the `"files"` array and add `"learn/"` after `"learnings/"`:

```json
    "learnings/",
    "learn/",
```

- [ ] **Step 3: Verify npm pack would include the skill**

```bash
npm pack --dry-run 2>&1 | grep "learn/"
```

Expected: lines showing `learn/SKILL.md`, `learn/SKILL.md.tmpl`, `learn/export.py`

- [ ] **Step 4: Commit**

```bash
git add .gitignore package.json
git commit -m "chore(learn): add learn-out to gitignore, add learn/ to npm files"
```

---

### Task 4: Wire `learn` into `swe` and `orchestrate` agent templates

**Files:**
- Modify: `agents/swe/SKILL.md.tmpl` (add learn to end-of-session section)
- Modify: `agents/orchestrate/SKILL.md.tmpl` (add learn to post-run workflow)
- Re-generate: `agents/swe/SKILL.md`, `agents/orchestrate/SKILL.md`

**Interfaces:**
- Consumes: `learn/SKILL.md.tmpl` (must exist — Task 1)
- Produces: `swe` and `orchestrate` agent templates reference `/learn` in their workflow

- [ ] **Step 1: Add end-of-session section to `agents/swe/SKILL.md.tmpl`**

Open `agents/swe/SKILL.md.tmpl`. Find the `## Workflow` section and add after step 6 (`Ship`):

```markdown
7. **Capture** — invoke `learn` to extract Q&A flashcards from session output.
```

Then add a new section at the bottom, before `{{POLICY_REQUIREMENTS}}`:

```markdown
## End of session

After completing work:
- invoke `context-save` to persist working state.
- invoke `learn` to capture Q&A flashcards from this session's decisions and findings.
```

- [ ] **Step 2: Add post-run learn invocation to `agents/orchestrate/SKILL.md.tmpl`**

Open `agents/orchestrate/SKILL.md.tmpl`. Find the `## Workflow` section and add after step 5 (`Context`):

```markdown
6. **Capture** — invoke `learn` after each major milestone to extract product and architecture knowledge.
```

- [ ] **Step 3: Rebuild all skill docs and sync agent tables**

```bash
npm run sync:agents
npm run build:skills
```

Expected: no errors. `agents/swe/SKILL.md` and `agents/orchestrate/SKILL.md` regenerated. The `<!-- agent-skills:start -->` table in both agent files will now include `learn`.

- [ ] **Step 4: Verify `learn` appears in swe agent's skill table**

```bash
grep "learn" agents/swe/SKILL.md
```

Expected: line like `| \`learn\` | Knowledge capture workflow...`

- [ ] **Step 5: Run full test suite**

```bash
npm run check:skills && npm test
```

Expected: all tests pass, exits 0.

- [ ] **Step 6: Commit**

```bash
git add agents/swe/SKILL.md.tmpl agents/swe/SKILL.md agents/orchestrate/SKILL.md.tmpl agents/orchestrate/SKILL.md
git commit -m "feat(learn): wire learn skill into swe and orchestrate end-of-session workflow"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|------------------|------|
| `learn/SKILL.md.tmpl` + generated `SKILL.md` | Task 1 |
| `learn/export.py` with ingest, Quizlet export, Confluence push | Task 2 |
| `learn-out/` gitignored, `learn/` in npm files | Task 3 |
| `swe` + `orchestrate` wired to invoke `learn` | Task 4 |
| Dedup by front hash | Task 2 step 4 |
| Per-deck files in `learn-out/decks/` | Task 2 step 3 |
| `--since` date filter | Task 2 (export_quizlet path) |
| Confluence push via `urllib.request` | Task 2 (confluence_push fn) |
| Error handling (malformed JSON backup, auto-create dirs, non-fatal Confluence) | Task 2 (load_cards, ingest fns) |
| Card schema: id, front, back, deck, source_agent, tags, created_at | Task 2 (ingest fn) |

**Placeholder scan:** None found.

**Type consistency:** `ingest()` takes `list[dict]` → `filter_cards()` takes same → `export_quizlet()` takes same. `front_hash(str) -> str` used consistently in `ingest()`. No mismatched names.
