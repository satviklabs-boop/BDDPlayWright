/**
 * Central configuration loader.
 * Reads environment variables (via dotenv) and exposes strongly-typed config
 * to the whole framework. Import `config` anywhere instead of using process.env.
 */
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';

const envFile = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === 'true';
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  env: process.env.ENV ?? 'dev',

  ui: {
    baseUrl: process.env.BASE_URL ?? 'https://the-internet.herokuapp.com',
    username: process.env.UI_USERNAME ?? 'tomsmith',
    password: process.env.UI_PASSWORD ?? 'SuperSecretPassword!',
  },

  api: {
    baseUrl: process.env.API_BASE_URL ?? 'https://reqres.in',
    apiKey: process.env.API_KEY ?? '',
    username: process.env.API_USERNAME ?? 'eve.holt@reqres.in',
    password: process.env.API_PASSWORD ?? 'cityslicka',
  },

  execution: {
    headless: bool(process.env.HEADLESS, true),
    workers: num(process.env.WORKERS, 2),
    retries: num(process.env.RETRIES, 1),
    defaultTimeout: num(process.env.DEFAULT_TIMEOUT, 30_000),
    slowMo: num(process.env.SLOW_MO, 0),
  },
  /**
   * Retry analyser settings.
   *
   * Playwright already re-runs a failed test `execution.retries` times, but it
   * reports the outcome as a plain pass. The analyser reads the JSON report
   * afterwards and separates the three genuinely different outcomes:
   *
   *   pass   - green on the first attempt
   *   flaky  - failed, then passed on a retry (a real signal: something is
   *            unstable, and a green build is hiding it)
   *   failed - never passed, even after every retry (a true defect)
   *
   * Set ANALYSE_RETRIES=false to skip the step (useful when you only want the
   * raw Playwright run in local iteration).
   */
  retryAnalyser: {
    enabled: bool(process.env.ANALYSE_RETRIES, true),
    /** Directory scanned for Playwright JSON reports. */
    reportDir: process.env.RETRY_REPORT_DIR ?? 'test-results',
    /** Name of the JSON reporter output inside reportDir. */
    reportFile: process.env.RETRY_REPORT_FILE ?? 'results.json',
    /** Where the analyser writes retry-report.txt and retry-summary.json. */
    outputDir: process.env.RETRY_OUTPUT_DIR ?? 'test-results/retry',
    /**
     * Treat a flaky run as a build failure. Off by default: a flaky pass is
     * reported loudly but does not break the build, matching the Java framework.
     */
    failOnFlaky: bool(process.env.FAIL_ON_FLAKY, false),
  },
} as const;

export type AppConfig = typeof config;