#!/usr/bin/env python3
"""Validate a read-only mcp-atlassian profile for architecture-agent use."""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


SAFE_TOOLS = {
    "confluence_search",
    "confluence_get_page",
    "confluence_get_page_children",
    "jira_search",
    "jira_get_issue",
}

DENY_TOOL_PATTERNS = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        "create",
        "update",
        "delete",
        "transition",
        "comment",
        "worklog",
        "link",
        "watch",
        "label",
        "move",
        "attachment",
        "upload",
        "download",
    )
)

SECRET_KEY_PARTS = ("TOKEN", "PASSWORD", "SECRET", "API_KEY", "PAT", "COOKIE")


def parse_bool(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def parse_csv(value: str | None) -> list[str]:
    if value is None:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line_no, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        if "=" not in line:
            raise ValueError(f"{path}:{line_no}: expected KEY=VALUE")
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if not key:
            raise ValueError(f"{path}:{line_no}: empty key")
        values[key] = value
    return values


def redacted(key: str, value: str | None) -> str:
    if value is None:
        return "<unset>"
    if any(part in key.upper() for part in SECRET_KEY_PARTS):
        return "<redacted>"
    return value


def host_from_url(value: str | None) -> str | None:
    if not value:
        return None
    parsed = urlparse(value)
    return parsed.hostname.lower() if parsed.hostname else None


def validate(values: dict[str, str]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if not parse_bool(values.get("READ_ONLY_MODE")):
        errors.append("READ_ONLY_MODE must be true.")

    if parse_bool(values.get("ATLASSIAN_OAUTH_PROXY_ENABLE")):
        errors.append("ATLASSIAN_OAUTH_PROXY_ENABLE must be false for docs lookup.")

    for key in ("JIRA_SSL_VERIFY", "CONFLUENCE_SSL_VERIFY"):
        value = values.get(key)
        if value is not None and not parse_bool(value):
            errors.append(f"{key} must not be false.")

    allowed_domains = parse_csv(values.get("MCP_ALLOWED_URL_DOMAINS"))
    if not allowed_domains:
        errors.append("MCP_ALLOWED_URL_DOMAINS must list approved Atlassian domains.")

    enabled_tools = parse_csv(values.get("ENABLED_TOOLS"))
    if not enabled_tools:
        errors.append("ENABLED_TOOLS must be a narrow read-only allowlist.")
    else:
        unknown = sorted(set(enabled_tools) - SAFE_TOOLS)
        denied = sorted(
            tool for tool in enabled_tools if any(pattern.search(tool) for pattern in DENY_TOOL_PATTERNS)
        )
        if unknown:
            errors.append(f"ENABLED_TOOLS contains non-approved tools: {', '.join(unknown)}.")
        if denied:
            errors.append(f"ENABLED_TOOLS contains side-effecting or file tools: {', '.join(denied)}.")

    toolsets = parse_csv(values.get("TOOLSETS"))
    if not toolsets:
        errors.append("TOOLSETS must be set; mcp-atlassian currently defaults unset TOOLSETS to all toolsets.")
    elif "all" in {item.lower() for item in toolsets}:
        errors.append("TOOLSETS=all is not allowed for docs lookup.")
    elif any(item.lower().endswith("attachments") or "attachment" in item.lower() for item in toolsets):
        errors.append("Attachment toolsets are not allowed for docs lookup.")

    for key in ("JIRA_URL", "CONFLUENCE_URL"):
        host = host_from_url(values.get(key))
        if host and allowed_domains and not any(host == domain or host.endswith(f".{domain}") for domain in allowed_domains):
            errors.append(f"{key} host is not covered by MCP_ALLOWED_URL_DOMAINS.")

    if values.get("JIRA_OAUTH_SCOPES") or values.get("CONFLUENCE_OAUTH_SCOPES"):
        warnings.append("OAuth scopes are present; prefer injected PATs or gateway tokens for read-only docs lookup.")

    if values.get("ATLASSIAN_OAUTH_CLIENT_STORAGE_MODE") or values.get("ATLASSIAN_OAUTH_CLIENT_STORAGE_FACTORY"):
        errors.append("Custom OAuth client storage is not allowed for docs lookup.")

    return errors, warnings


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path, help="Path to a .env-style mcp-atlassian profile.")
    parser.add_argument("--print-summary", action="store_true", help="Print non-secret effective settings.")
    args = parser.parse_args(argv)

    values = dict(os.environ)
    if args.env_file:
        values.update(parse_env_file(args.env_file))

    errors, warnings = validate(values)

    if args.print_summary:
        interesting = [
            "READ_ONLY_MODE",
            "ATLASSIAN_OAUTH_PROXY_ENABLE",
            "JIRA_URL",
            "CONFLUENCE_URL",
            "JIRA_SSL_VERIFY",
            "CONFLUENCE_SSL_VERIFY",
            "MCP_ALLOWED_URL_DOMAINS",
            "TOOLSETS",
            "ENABLED_TOOLS",
        ]
        for key in interesting:
            print(f"{key}={redacted(key, values.get(key))}")

    for warning in warnings:
        print(f"WARNING: {warning}", file=sys.stderr)
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)

    if errors:
        return 1
    print("mcp-atlassian profile is safe for read-only product documentation lookup.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
