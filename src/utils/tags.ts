import { Page } from '@playwright/test';

/**
 * Tests in this framework use a single shared tag vocabulary so that
 * suites can be selected from the command line.
 *
 * Example:  npm run test:smoke   -> runs everything tagged @smoke
 */
export const TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  UI: '@ui',
  API: '@api',
  LOGIN: '@login',
} as const;

/**
 * Network throttling / offline simulation helper (used by edge-case tests).
 */
export async function setOffline(page: Page, offline: boolean): Promise<void> {
  await page.context().setOffline(offline);
}