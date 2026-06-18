# RTK Token Optimizer

RTK, Rust Token Killer, is an optional CLI proxy that compresses shell command
output before it reaches an AI assistant context window.

This package does not vendor RTK and does not install it automatically.

## Why Use It

RTK can reduce noisy command output for common development commands such as:

- `git status`
- `git diff`
- `grep` / `rg`
- `find`
- test runners
- Playwright
- pytest

Use it to reduce token cost during broad inspection. Avoid it when exact raw
output matters.

## Enterprise-Safe Rules

- Do not run `curl | sh`.
- Do not enable telemetry.
- Do not install global command-rewrite hooks by default.
- Do not use RTK to hide failures.
- Rerun raw commands when compressed output omits needed detail.
- Prefer explicit commands such as `rtk git diff` over automatic shell hooks.

## Installation Options

Choose one only after policy approval:

| Option | Command | Notes |
|---|---|---|
| Homebrew | `brew install rtk` | Good for macOS developer machines. |
| Cargo from Git | `cargo install --git https://github.com/rtk-ai/rtk` | Avoids same-name crate confusion. |
| Prebuilt binary | Download from RTK releases | Best for controlled internal mirroring. |
| Internal mirror | Company artifact repository | Preferred enterprise path. |

Do not install through a shell pipeline in company environments.

## Verification

```bash
rtk --version
rtk gain
```

## Recommended Explicit Usage

```bash
rtk git status
rtk git diff
rtk git log -n 10
rtk grep "pattern" .
rtk find "*.md" .
rtk test npm test
rtk playwright test
rtk pytest
```

## When Not To Use RTK

Use raw command output for:

- Exact diffs.
- Full stack traces.
- Security incident investigation.
- JSON, XML, or API contract validation.
- Snapshot tests.
- Failing test output where line-level detail matters.

## Policy

RTK is an optional module. It is not required for install and should not be
enabled through global hooks by default.

If a profile enables RTK, it should state:

- install method
- telemetry setting
- whether hooks are allowed
- which commands may be wrapped
- how to request raw output
