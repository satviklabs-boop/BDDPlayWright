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
} as const;

export type AppConfig = typeof config;