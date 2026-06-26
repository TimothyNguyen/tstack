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
import base64
import csv
import hashlib
import html
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError

# Ensure UTF-8 output on Windows (avoids cp1252 encode errors for → etc.)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

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


def ingest(raw: list[dict], deck_override: str | None, source_agent: str, verbose: bool = False) -> int:
    ensure_dirs()
    existing = load_cards()
    existing_hashes = {front_hash(c["front"]) for c in existing}

    added = 0
    affected_decks = set()
    for card in raw:
        if not card.get("front", "").strip():
            continue
        h = front_hash(card.get("front", ""))
        if h in existing_hashes:
            if verbose:
                print(f"Skipped duplicate: {card.get('front', '')[:60]}")
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
        f"<tr><td>{html.escape(c.get('front',''))}</td>"
        f"<td>{html.escape(c.get('back',''))}</td>"
        f"<td>{html.escape(', '.join(c.get('tags', [])))}</td></tr>"
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
    params = urlencode({"title": page_title, "spaceKey": space_key, "expand": "version"})
    search_url = f"{base_url}/wiki/rest/api/content?{params}"
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
        ingest(raw, args.deck, args.source_agent, args.verbose)
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
