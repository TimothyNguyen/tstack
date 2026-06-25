#!/usr/bin/env python3
"""ptk_minimize — minimize file/stdin content to reduce LLM tokens.

Uses bundled ptk library (lib/ptk/) — no pip install needed.

Usage:
    python ptk_minimize.py data/response.json
    cat server.log | python ptk_minimize.py --stdin --type log
    cat diff.patch | python ptk_minimize.py --stdin --type diff --aggressive
    python ptk_minimize.py --stdin --stats < large_api_response.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows (cp1252 default breaks stats arrow char)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# prefer installed ptk, fall back to bundled lib/
try:
    import ptk
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent / "lib"))
    import ptk  # type: ignore[no-redef]


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="ptk — minimize tokens from files or stdin")
    parser.add_argument("file", nargs="?", help="File to minimize")
    parser.add_argument("--stdin", action="store_true", help="Read from stdin")
    parser.add_argument(
        "--type",
        choices=["dict", "list", "code", "log", "diff", "text"],
        default=None,
        help="Force content type (default: auto-detect)",
    )
    parser.add_argument("--aggressive", "-a", action="store_true", help="Max compression")
    parser.add_argument("--stats", "-s", action="store_true", help="Print stats to stderr")
    args = parser.parse_args()

    if args.stdin:
        raw = sys.stdin.read()
    elif args.file:
        raw = Path(args.file).read_text(encoding="utf-8-sig")  # utf-8-sig strips BOM if present
    else:
        parser.print_help()
        sys.exit(1)

    import contextlib

    obj: object = raw
    with contextlib.suppress(json.JSONDecodeError, ValueError):
        obj = json.loads(raw)

    if args.stats:
        s = ptk.stats(obj, aggressive=args.aggressive, content_type=args.type)
        print(s["output"])
        print(
            f"[ptk] {s['content_type']}: {s['original_tokens']} → {s['minimized_tokens']} tokens "
            f"({s['savings_pct']}% saved)",
            file=sys.stderr,
        )
    else:
        print(ptk.minimize(obj, aggressive=args.aggressive, content_type=args.type))


if __name__ == "__main__":
    main()
