# Runbook: Rollback

Roll back to a previous `agent-architecture` version after a bad upgrade.

## Option A — Git revert (preferred)

If the `.agent/` directory is committed to git, roll back to the previous commit:

```bash
git log --oneline .agent/VERSION
# find the commit before the bad upgrade
git checkout <commit-sha> -- .agent/
git commit -m "chore: rollback agent-architecture to v$(cat .agent/VERSION)"
```

Verify:

```bash
npx agent-architecture doctor
```

## Option B — Reinstall from old package version

### 1. Pin the old version

```bash
npm install --save-dev agent-architecture@0.1.0
```

### 2. Reinstall

```bash
npx agent-architecture install
```

### 3. Verify

```bash
cat .agent/VERSION   # should show 0.1.0
npx agent-architecture doctor
```

### 4. Commit

```bash
git add .agent/ package.json package-lock.json
git commit -m "chore: rollback agent-architecture to v0.1.0"
```

## Option C — Clean reinstall

If the target directory is corrupted:

```bash
rm -rf .agent/
npx agent-architecture install
npx agent-architecture doctor
```

## Notes

- Always verify with `doctor` after rollback.
- If rollback reveals a bug in the pack, file an issue before re-upgrading.
- The `.agent-config.json` is never modified by install/upgrade/rollback — it is safe
  to keep on disk during any operation.
