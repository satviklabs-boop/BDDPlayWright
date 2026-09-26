/**
 * Playwright configuration for the BDD framework.
 * Uses playwright-bdd to generate Playwright tests from Gherkin .feature files.
 *
 * Two projects:
 *   - ui-chromium : browser-driven UI tests (login flows)
 *   - api         : pure HTTP API tests (no browser)
 */
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { config } from './src/config/env.config.js';

const uiTestDir = defineBddConfig({
  outputDir: '.features-gen/ui',
  features: ['features/ui/**/*.feature'],
  steps: ['src/steps/**/*.ts', 'src/fixtures/**/*.ts'],
  quotes: 'single',
});

const apiTestDir = defineBddConfig({
  outputDir: '.features-gen/api',
  features: ['features/api/**/*.feature'],
  steps: ['src/steps/**/*.ts', 'src/fixtures/**/*.ts'],
  quotes: 'single',
});

export default defineConfig({
  testDir: '.',
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
      testDir: uiTestDir,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
      },
    },
    {
      name: 'api',
      testDir: apiTestDir,
      use: {
        baseURL: config.api.baseUrl,
      },
    },
  ],

  outputDir: 'test-results',
});