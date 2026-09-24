# BDD Playwright Test Automation Framework

A modern, production-ready test automation framework built on **Playwright** and **BDD (Gherkin)**.
It covers both **UI login testing** (real browser) and **API testing** (real HTTP) in one codebase,
using a clean layered architecture.

![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Playwright](https://img.shields.io/badge/playwright-1.63-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.7-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Writing Tests](#writing-tests)
- [Configuration](#configuration)
- [Reporting](#reporting)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

---

## Features

| Feature | Description |
|---|---|
| **BDD / Gherkin** | Human-readable `.feature` files describing behaviour |
| **UI Testing** | Real-browser login tests via Playwright (Chromium) |
| **API Testing** | HTTP request tests with no browser overhead |
| **Page Object Model** | Locators and actions encapsulated in page classes |
| **Custom Fixtures** | Dependency-injected page objects, API client, and test data |
| **Scenario Outlines** | Data-driven tests via Gherkin `Examples` tables |
| **Tagging** | `@smoke`, `@regression`, `@negative`, etc. for selective runs |
| **Reporting** | HTML, JSON, JUnit, and trace/screenshot/video on failure |
| **TypeScript** | Strict typing across the whole framework |
| **CI Ready** | GitHub Actions workflow included |
| **Cross-Platform** | Windows, macOS, and Linux |

---

## Tech Stack

- **[Playwright](https://playwright.dev/)** `1.63` - browser automation + API request context
- **[playwright-bdd](https://vitalets.github.io/playwright-bdd/)** `9.2` - BDD layer on top of Playwright's native test runner
- **[Cucumber](https://cucumber.io/)** - Gherkin syntax and expressions
- **TypeScript** `5.7` - type safety
- **[dotenv](https://github.com/motdotla/dotenv)** - environment configuration

> **Why playwright-bdd and not cucumber-js?**
> playwright-bdd generates real Playwright tests from `.feature` files, so you inherit Playwright's
> parallelisation, retries, tracing, fixtures, and reporters for free — no custom runner wiring.

---

## Architecture

The framework is organised in clear layers, each with a single responsibility:

```
.feature files        ->  What the business wants (Gherkin)
       |
   step definitions   ->  Translation between Gherkin and code
       |
   page objects /     ->  How to interact with UI / API
   api client
       |
   fixtures            ->  Dependency injection of the above
       |
   config              ->  Environment, URLs, credentials
```

**Key principle:** step definitions stay declarative and locator-free; all selectors live in page objects.

---

## Getting Started

### Prerequisites

- **Node.js** 18 or newer (`node --version`)
- **npm** 9 or newer (`npm --version`)
- **Git**

### Installation

```bash
# 1. Clone
git clone https://github.com/satviklabs-boop/BDDPlayWright.git
cd BDDPlayWright

# 2. Install dependencies
npm install

# 3. Install the Playwright browser
npx playwright install chromium

# 4. Create your environment file
cp .env.example .env      # Windows: copy .env.example .env
```

### Verify the setup

```bash
npm test
```

You should see **16 passing tests** (8 UI + 8 API).

---

## Running Tests

| Command | What it does |
|---|---|
| `npm test` | Generate specs and run the entire suite |
| `npm run test:ui` | Only UI tests (Chromium) |
| `npm run test:api` | Only API tests |
| `npm run test:smoke` | Only `@smoke` tagged scenarios |
| `npm run test:regression` | Only `@regression` scenarios |
| `npm run test:headed` | UI tests with a visible browser |
| `npm run test:debug` | UI tests with Playwright Inspector |
| `npm run test:ui-mode` | Playwright UI mode (interactive) |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | TypeScript type check only |
| `npm run clean` | Remove all generated output |

### Advanced examples

```bash
# Run a single feature file
npx bddgen && npx playwright test features/ui/login.feature

# Run by scenario title
npx bddgen && npx playwright test --grep "Successful login"

# Run with custom base URL
BASE_URL=https://staging.example.com npm test        # macOS/Linux
$env:BASE_URL="https://staging.example.com"; npm test # Windows PowerShell
```

---

## Project Structure

```
BDDPlayWright/
├── features/                   # Gherkin specifications
│   ├── ui/
│   │   └── login.feature       # UI login scenarios
│   └── api/
│       └── auth-api.feature    # API scenarios
│
├── src/
│   ├── api/
│   │   └── ApiClient.ts        # HTTP wrapper (GET/POST/PUT/PATCH/DELETE)
│   ├── config/
│   │   └── env.config.ts       # Central config loader
│   ├── fixtures/
│   │   └── test.fixtures.ts    # Custom BDD fixtures
│   ├── pages/
│   │   ├── BasePage.ts         # Shared page helpers
│   │   └── LoginPage.ts        # Login page object
│   ├── steps/
│   │   ├── login.steps.ts      # UI step definitions
│   │   └── api.steps.ts        # API step definitions
│   └── utils/
│       └── tags.ts             # Tag vocabulary + helpers
│
├── test-data/
│   └── users.json              # Test data
│
├── .github/workflows/
│   └── playwright.yml          # CI pipeline
│
├── playwright.config.ts        # Playwright + BDD configuration
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Environment template
└── package.json
```

---

## Writing Tests

### 1. Write the feature file

Business-readable Gherkin in `features/ui/` or `features/api/`:

```gherkin
@ui @login
Feature: User login

  Background:
    Given the login page is open

  @smoke @positive
  Scenario: Successful login with valid credentials
    When I login with valid credentials
    Then I should be redirected to the secure area
    And the success message should be displayed
```

### 2. Implement the steps

In `src/steps/`:

```typescript
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/test.fixtures.js';

const { Given, When, Then } = createBdd(test);

When('I login with valid credentials', async ({ loginPage, testData }) => {
  await loginPage.login(testData.validUser.username, testData.validUser.password);
});
```

### 3. Add page objects as needed

In `src/pages/`, extend `BasePage` and keep **all locators private**:

```typescript
export class DashboardPage extends BasePage {
  private readonly welcomeBanner = this.page.locator('.welcome');

  async open(): Promise<void> {
    await this.goto('/dashboard');
  }
}
```

Then register the new page object as a fixture in `src/fixtures/test.fixtures.ts`.

### Using pre-defined fixtures

Every scenario can request these without any setup:

| Fixture | Type | Purpose |
|---|---|---|
| `page` | Playwright `Page` | Browser page |
| `request` | Playwright `APIRequestContext` | HTTP client |
| `loginPage` | `LoginPage` | UI login page object |
| `apiClient` | `ApiClient` | Configured API client |
| `testData` | `users.json` | Shared test data |

---

## Configuration

All configuration flows through `.env` -> `src/config/env.config.ts` -> the code.

| Variable | Default | Description |
|---|---|---|
| `ENV` | `dev` | Environment name |
| `BASE_URL` | `https://the-internet.herokuapp.com` | UI base URL |
|UI_USERNAME` | `tomsmith` | Valid UI username |
| `UI_PASSWORD` | `SuperSecretPassword!` | Valid UI password |
| `API_BASE_URL` | `https://reqres.in` | API base URL |
| `API_KEY` | `reqres-free-v1` | API key header |
| `API_USERNAME` | `eve.holt@reqres.in` | API login email |
| `API_PASSWORD` | `cityslicka` | API login password |
| `HEADLESS` | `true` | Run browsers headless |
| `WORKERS` | `2` | Parallel workers |
| `RETRIES` | `1` | Retries on failure |
| `DEFAULT_TIMEOUT` | `30000` | Test timeout (ms) |
| `SLOW_MO` | `0` | Slow down actions (ms) |

> `.env` is git-ignored. Never commit real credentials — use CI secrets in production.

---

## Reporting

After a run you get:

| Report | Path | Command |
|---|---|---|
| **Allure** (extended report) | `allure-report/index.html` | `npm run report:allure` |
| **Playwright HTML** | `playwright-report/index.html` | `npm run report` |
| **Retry analyser** | `test-results/retry/retry-report.txt` | `npm run retry:analyse` |
| **JSON results** | `test-results/results.json` | - |
| **JUnit XML** | `test-results/junit.xml` | - |
| **On failure** | screenshot, video, trace | - |

### Allure - the extended report

Allure is the rich, interactive report for this stack: it groups scenarios by
feature, renders **every Gherkin step as its own sub-step**, and attaches the
failure screenshot, video and trace to the step that broke.

```bash
npm test              # runs the suite AND the retry analyser
npm run report:allure # generate the Allure report and open it
```

Because `screenshot`, `video` and `trace` are all set to `...-on-failure` in
`playwright.config.ts`, the adapter attaches them automatically - there are no
manual `annotate()` calls to maintain.

> **Serve it over HTTP, not `file://`.** Allure is a single-page app that fetches
> its own data, so opening `index.html` from disk shows an empty shell and logs
> CORS errors. `npm run report:allure` opens it correctly; `npm run allure:serve`
> serves the raw results without writing a report at all.

> **Why not Extent Reports?** Extent is a `com.aventstack:extentreports` Java
> library driven by a Cucumber-**JVM** plugin. This project is TypeScript on Node
> with `playwright-bdd` - there is no JVM or Maven for it to attach to, so an
> `extent.properties` file here would do nothing. Allure covers the same ground
> for Node.

> **Known external limitation - `reqres.in` rate limits (HTTP 429).**
> The API scenarios target the public demo API `reqres.in`, which throttles
> automated traffic. Running the suite repeatedly in a short window makes the
> 8 API scenarios fail with `Expected: 200, Received: 429` while the 8 UI
> scenarios keep passing. This is the *service* refusing the request, not a
> defect in the framework or the tests; relaunching later clears it. The retry
> analyser reports them as **failed**, which is correct - a 429 is
> deterministic, so retrying cannot fix it - and the message names the status
> code so the cause is obvious. Point `API_BASE_URL` at a local stub for a
> suite that does not depend on a shared public sandbox.

## Retry analyser

Playwright already retries failing tests, but it reports a test that passed on
the **second attempt as a plain green PASS** - which hides the fact that the test
is unstable. The retry analyser reads `test-results/results.json` after the run
and separates the three outcomes that actually differ:

| Verdict | Meaning | Build result |
|---|---|---|
| **pass** | green on the first attempt | Success |
| **flaky** | failed, then passed on a retry - real instability | Success, reported loudly |
| **failed** | never passed, even after every retry | Failure |

```
$ npm run retry:analyse

Retry analyser report
=====================
Retries per test : 1
Scenarios  : 16
Passed     : 14  (green on the first attempt)
Flaky      : 2  (passed only after a retry)
Failed     : 0  (failed every attempt)

FLAKY - these passed, but only after a retry. They are hiding a
real instability, so treat them as defects waiting to surface.
    FLAKY  ui > login.feature > Successful login > logs in
           attempts: failed -> passed
```

A flaky pass does **not** break the build by default - the run *is* green, and the
flakiness is reported for a human to act on. Set `FAIL_ON_FLAKY=true` to make
flakiness itself a failure.

```bash
RETRIES=2 npm test               # two retries per test
RETRIES=0 npm test               # no retries; every failure is genuine
FAIL_ON_FLAKY=true npm test      # a flaky pass fails the build
ANALYSE_RETRIES=false npm test   # skip the analyser entirely
```

`npm test` runs the analyser automatically. `npm run test:ci` is the same chain for CI.

> **Do not pass `--reporter` on the command line.** Any CLI reporter flag
> *replaces* the reporters in `playwright.config.ts`, so `results.json` is never
> written and the analyser has nothing to read. Add reporters to the config instead.

### Why the analyser runs even when tests fail

`npm test` does not chain the commands with `&&`. That would short-circuit on the
first failing test, so the analyser would be skipped **precisely when its verdict
matters most** - telling flaky (passed on retry) apart from genuinely broken.

The sequencing lives in `scripts/run-with-analyser.mjs` instead. Two reasons:

- `&&` skips the analyser on failure, as above.
- `;` fixes that on bash, but on Windows the command runs through `cmd`, where
  `;` separates statements before npm ever sees it - so the chain breaks
  differently per platform.

The Node runner behaves identically everywhere, always runs the analyser, and
still exits with the **test** result, so CI fails the build on a real failure.
### Inspecting a failure

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

The trace viewer steps through every action, DOM snapshot and network call.

---

## CI/CD

Two pipelines are configured.

### GitHub Actions

`.github/workflows/playwright.yml` runs on **push, pull request, manual dispatch,
and a 3-hourly schedule**:

```yaml
schedule:
  - cron: '17 */3 * * *'   # every 3 hours, at :17 past
```

The offset minute avoids the top-of-the-hour spike when GitHub queues the most
jobs. The job does: checkout, `npm ci`, install Chromium, `npm run test:ci`, print
the retry analyser verdict, generate the Allure report, then upload the Allure
report, raw Allure results, the Playwright HTML report and `test-results/` as
artefacts.

### Jenkins

`Jenkinsfile` is a declarative pipeline that **runs automatically every 3 hours**:

```groovy
triggers {
    cron('H H/3 * * *')
}
```

`H H/3 * * *` means *every third hour, at a Jenkins-chosen minute*. `H` hashes the
value so several jobs do not all fire on the hour - the recommended way to write a
periodic trigger. It also still runs on push/PR and manual "Build with Parameters".

Stages: checkout, `npm ci`, install Chromium (cached), typecheck, run the suite,
print the retry analyser verdict, generate Allure, publish reports. A failing test
marks the build **UNSTABLE** rather than aborting, so the reports are always
published and triageable.

Parameters let you steer a run without editing the file: `TAGS`, `RETRIES`,
`WORKERS`, `BASE_URL`, `API_BASE_URL`, `FAIL_ON_FLAKY` and `HEADLESS`.

**Before it will run, Jenkins needs three things:**

- A **NodeJS 20** tool configured in *Manage Jenkins -> Tools*, named `nodejs-20`
  (or renamed to match the `environment` block)
- The **Allure Jenkins Plugin** installed, for the `allure` step
- **Scan Multibranch Pipeline Triggers** enabled (or the job polled) - Jenkins
  ignores a `cron` in a `Jenkinsfile` until the job has indexed the branch once

Reports and artefacts are archived on every build: the retry analyser output, the
raw JSON/XML, failure screenshots/videos/traces, and a copy of the generated Allure
report so a specific build can be reopened later.

> **Note on Extent Reports:** it is a Java/Cucumber-JVM library and has no place in
> this Node build - see the note under [Reporting](#reporting). Allure is the
> extended report here.

---
## Troubleshooting

**`git`/`node` not recognised (Windows)**
These tools may not be on your PATH. Restart the terminal after installing, or add:
- Node: `C:\Program Files\nodejs`
- Git: `C:\Program Files\Git\cmd`

**`npx.ps1 cannot be loaded` (Windows PowerShell)**
The execution policy blocks PowerShell shims. Either use `npx.cmd` instead of `npx`, or run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Browser not found**
```bash
npx playwright install chromium
```

**BDD steps not picked up**
Run the generator before the runner:
```bash
npm run bddgen && npx playwright test
```
(`npm test` already does both.)

**API tests fail with 401/403**
Your API key may have expired. Request a free key at [reqres.in](https://reqres.in) and set `API_KEY` in `.env`.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Satvik Labs** - test automation practice project
