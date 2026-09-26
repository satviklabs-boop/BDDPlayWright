/**
 * Playwright configuration. All settings come from .env (see .env.example).
 *
 * Two projects, picked by the tag on each feature file:
 *   - ui-chromium : features tagged @ui  (browser)
 *   - api         : features tagged @api (HTTP only)
 */
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const env = process.env;
const config = {
  ui: { baseUrl: env.BASE_URL ?? 'https://the-internet.herokuapp.com' },
  api: { baseUrl: env.API_BASE_URL ?? 'https://reqres.in' },
  run: {
    headless: (env.HEADLESS ?? 'true') === 'true',
    workers: Number(env.WORKERS) || 2,
    retries: Number(env.RETRIES ?? 1),
    slowMo: Number(env.SLOW_MO) || 0,
  },
};

const testDir = defineBddConfig({
  features: 'tests/features/**/*.feature',
  steps: ['tests/steps/**/*.ts', 'tests/support/fixtures.ts'],
  quotes: 'single',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: config.run.retries,
  workers: config.run.workers,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // The retry analyser reads this file to separate flaky from genuinely
    // failing scenarios. Do not remove it.
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // Allure: the extended report. Because `screenshot`, `video` and `trace`
    // are all set to "…-on-failure" above, the adapter attaches them to the
    // failing step automatically - no manual annotate() calls needed.
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,          // each Gherkin step becomes a sub-step in the report
      suiteTitle: true,      // group by feature file / describe block
      environmentInfo: {
        framework: 'playwright-bdd',
        app: 'BDDPlayWright',
        node: process.version,
      },
    }],
  ],

  use: {
    baseURL: config.ui.baseUrl,
    headless: config.run.headless,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      slowMo: config.run.slowMo,
      args: ['--disable-dev-shm-usage'],
    },
  },

  projects: [
    {
      name: 'ui-chromium',
      grep: /@ui/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
      },
    },
    {
      name: 'api',
      grep: /@api/,
      use: {
        baseURL: config.api.baseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],

  outputDir: 'test-results',
});