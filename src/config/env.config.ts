/**
 * All configuration in one place, read from environment variables.
 * Import `config` instead of using process.env directly.
 */
import * as dotenv from 'dotenv';

dotenv.config();

const env = process.env;
const num = (name: string, fallback: number) => Number(env[name]) || fallback;

export const config = {
  // Which environment we are testing.
  env: env.ENV ?? 'dev',

  ui: {
    baseUrl: env.BASE_URL ?? 'https://the-internet.herokuapp.com',
  },

  api: {
    baseUrl: env.API_BASE_URL ?? 'https://reqres.in',
  },

  // How the tests are run.
  run: {
    headless: (env.HEADLESS ?? 'true') === 'true',
    workers: num('WORKERS', 2),
    retries: num('RETRIES', 1),
    slowMo: num('SLOW_MO', 0),
  },

  /**
   * The retry analyser reads the JSON report after the run and reports tests
   * that passed only after a retry (flaky) separately from real failures.
   * Set ANALYSE_RETRIES=false to skip it.
   */
  retryAnalyser: {
    enabled: (env.ANALYSE_RETRIES ?? 'true') === 'true',
    /** Set to true to make flaky tests fail the build. */
    failOnFlaky: (env.FAIL_ON_FLAKY ?? 'false') === 'true',
  },
};