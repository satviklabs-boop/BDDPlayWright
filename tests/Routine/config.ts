/**
 * config - every URL and run setting in one place.
 *
 * Each value can be overridden in a .env file (copy .env.example to .env)
 * or as an environment variable in CI. The value after ?? is the default.
 */
import 'dotenv/config';

const env = process.env;

export const config = {
  // ----- URLs -----
  uiBaseUrl: env.BASE_URL ?? 'https://the-internet.herokuapp.com',
  apiBaseUrl: env.API_BASE_URL ?? 'https://reqres.in',

  // ----- How tests run -----
  headless: (env.HEADLESS ?? 'true') === 'true',
  workers: Number(env.WORKERS) || 2,
  retries: Number(env.RETRIES ?? 1),
  slowMo: Number(env.SLOW_MO) || 0,

  // ----- Retry analyser -----
  analyseRetries: (env.ANALYSE_RETRIES ?? 'true') === 'true',
  failOnFlaky: env.FAIL_ON_FLAKY === 'true',
};
