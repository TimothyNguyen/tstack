# Test Quality Checklist

Run this against any test file before merging.

## Test Names

- [ ] Test name states the behavior, not the implementation: `"returns 404 when user not found"` not `"test getUserById"`
- [ ] Negative cases named explicitly: `"throws when input is null"` not `"handles invalid input"`
- [ ] No generic names: no `"works"`, `"test 1"`, `"should work"`

## Structure

- [ ] One assertion per test where possible — one failure = one clear cause
- [ ] Arrange / Act / Assert structure visible in each test
- [ ] No test logic duplicated across tests — extract to helpers
- [ ] No test depends on another test's state (order-independent)

## Coverage

- [ ] Happy path covered
- [ ] Boundary values covered (empty, max, min, null/undefined)
- [ ] Error/failure paths covered
- [ ] New behaviors have at least one test each

## Mocks and Fixtures

- [ ] Mocks reset between tests
- [ ] Fixtures use the minimum data needed — no copy-paste bloat
- [ ] External calls (HTTP, DB) are mocked in unit tests

## Anti-patterns to Delete

- [ ] No `assert(true)` or empty test body
- [ ] No `setTimeout` in tests — use async/await
- [ ] No catching errors to suppress — let them propagate
- [ ] No commented-out tests — delete them
