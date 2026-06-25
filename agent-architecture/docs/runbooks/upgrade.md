# Runbook: Upgrade

Upgrade an existing `agent-architecture` install to a newer version.

## Prerequisites

- Existing install at `.agent/` (or custom `--target`)
- `npm update agent-architecture` or manual version bump in `package.json`

## Steps

### 1. Update the package

```bash
npm install --save-dev agent-architecture@latest
```

Check the new version:

```bash
cat node_modules/agent-architecture/package.json | grep '"version"'
```

### 2. Run upgrade

```bash
npx agent-architecture install --upgrade
```

This re-runs the installer in place, overwriting generated files in the target directory.
Your `.agent-config.json` is not modified.

Options are the same as `install`:

```bash
npx agent-architecture install --upgrade --target .agent --private
```

### 3. Verify

```bash
npx agent-architecture doctor
cat .agent/VERSION
```

### 4. Review diff and commit

```bash
git diff .agent/
git add .agent/
git commit -m "chore: upgrade agent-architecture to v$(cat .agent/VERSION)"
```

## Notes

- The upgrade command is identical to `install` — it overwrites in place.
- Skills installed from a previous version that no longer exist will remain on disk
  until you remove the target directory and reinstall.
- If you have local modifications inside `.agent/`, they will be overwritten.
  Keep customizations in `.agent-config.json`, not in installed files.
- To see what changed between versions, check the pack's CHANGELOG or git log.

## Rollback

If the upgrade causes problems, see [rollback.md](rollback.md).
