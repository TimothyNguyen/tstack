# Definition of Done

A task or feature is done when ALL of the following are true.

## Code

- [ ] Implementation matches the spec — no extra features, no missing requirements
- [ ] No TODO/FIXME left behind in changed files
- [ ] No dead code introduced

## Tests

- [ ] Failing test written before implementation (TDD)
- [ ] All new behaviors covered by at least one test
- [ ] All tests pass (`npm test` green)
- [ ] Edge cases documented in test names, not comments

## Build

- [ ] `npm run build:skills` passes (if SKILL.md.tmpl changed)
- [ ] `npm run check:skills` passes
- [ ] No new lint errors

## Documentation

- [ ] README.md updated if new skill added
- [ ] GOVERNANCE.yaml present for new skills
- [ ] Interfaces documented in plan's Produces/Consumes blocks

## Security

- [ ] No secrets in code or committed files
- [ ] No new public egress
- [ ] Security checklist reviewed for code touching auth/data/agent tools

## Git

- [ ] Each commit follows Conventional Commits format
- [ ] Each commit is one describable behavior (no "and" in the description)
- [ ] No `--no-verify`, `--force`, or `--no-gpg-sign` used
