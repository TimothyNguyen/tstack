# Test Automation Matrix

## Runner Detection

Detect project runners before proposing new tools:

| Stack | Signals | Preferred commands |
|---|---|---|
| Node/React | `package.json`, `vite.config.*`, `playwright.config.*` | `npm test`, `npm run test`, `npm run test:e2e` |
| Spring Boot | `pom.xml`, `build.gradle`, `gradlew` | `./mvnw test`, `./gradlew test` |
| Python | `pyproject.toml`, `pytest.ini`, `requirements.txt` | `pytest`, `ruff check`, `mypy` |
| C# | `.sln`, `.csproj`, `global.json` | `dotnet test`, `dotnet build` |
| SQL | `.sql`, migration folders, dbt config | approved migration or dbt test command |
| Databricks | notebooks, job configs, bundle files | approved local/unit job tests |

## Test Selection

Choose the lowest-cost test that proves the behavior:

1. Unit test.
2. Contract/API test.
3. Integration test with local fixture.
4. Data pipeline test with approved sample data.
5. Browser UI test with Playwright or Selenium.
6. Manual verification checklist.

## Playwright Rules

- Use when the project already has Playwright or a profile enables it.
- Prefer local or internal environments.
- Save screenshots/traces only when useful.
- Redact or avoid secrets and sensitive data.
- Do not import browser cookies.
- Do not scrape public websites.

## Selenium Rules

- Use when the project already standardizes on Selenium or a profile selects it.
- Record browser/driver version.
- Prefer stable selectors and page objects already present in the repo.
- Avoid adding Selenium when Playwright is already the project standard.

## Sharding And Curation

For large suites:

- Enumerate tests deterministically.
- Exclude paid/e2e/external-service tests from default free runs.
- Shard with a stable hash.
- Curate Windows-safe subsets by scanning for POSIX-only assumptions.
- Run browser suites separately from fast unit/integration shards.

## Evidence

For each run, report:

- Command.
- Scope.
- Environment.
- Duration.
- Pass/fail/skipped counts.
- Artifact paths.
- Known exclusions.
- Next recommended command.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
