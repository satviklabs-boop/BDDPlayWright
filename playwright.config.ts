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
  retries: config.execution.retries,
  workers: config.execution.workers,
  timeout: config.execution.defaultTimeout,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: config.ui.baseUrl,
    headless: config.execution.headless,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      slowMo: config.execution.slowMo,
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