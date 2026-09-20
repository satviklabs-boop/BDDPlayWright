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

- **HTML report** - `playwright-report/index.html` (open with `npm run report`)
- **JSON results** - `test-results/results.json`
- **JUnit XML** - `test-results/junit.xml` (for CI dashboards)
- **On failure**: screenshot, video, and a full trace

### Inspecting a failure

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

The trace viewer lets you step through every action, DOM snapshot, and network call.

---

## CI/CD

`.github/workflows/playwright.yml` runs the full suite on every push and pull request to `main`:

1. Checkout the repository
2. Install Node.js 20
3. `npm ci` - clean, lockfile-based install
4. Install Chromium with system dependencies
5. Run the suite (headless)
6. Upload the HTML report and test results as artifacts

Reports are downloadable from the **Actions** tab of any workflow run.

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