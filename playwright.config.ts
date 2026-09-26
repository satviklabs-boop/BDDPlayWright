/**
 * Playwright configuration.
 * URLs and run settings come from tests/Routine/config.ts (which reads .env).
 *
 * Two projects, picked by the tag on each feature file:
 *   - ui-chromium : features tagged @ui  (browser)
 *   - api         : features tagged @api (HTTP only)
 */
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { config } from './tests/Routine/config.js';

const testDir = defineBddConfig({
  features: 'tests/features/**/*.feature',
  steps: ['tests/steps/**/*.ts', 'tests/Routine/GenericFunction.ts'],
  quotes: 'single',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: config.retries,
  workers: config.workers,
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
    baseURL: config.uiBaseUrl,
    headless: config.headless,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      slowMo: config.slowMo,
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
        baseURL: config.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],

  outputDir: 'test-results',
});