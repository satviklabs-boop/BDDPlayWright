/**
 * Custom BDD fixtures.
 *
 * playwright-bdd builds on Playwright fixtures; this file exposes the objects
 * every scenario needs (page objects, API client, test data) without each
 * step having to construct them. Fixtures are lazy and per-scenario.
 */
import { test as base } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage.js';
import { ApiClient } from '../api/ApiClient.js';
import { config } from '../config/env.config.js';
import users from '../../test-data/users.json' with { type: 'json' };

export type TestFixtures = {
  loginPage: LoginPage;
  apiClient: ApiClient;
  testData: typeof users;
};

export const test = base.extend<TestFixtures>({
  /** UI page object for the login screen. */
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  /** API client bound to the configured API base URL + key. */
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request, config.api.baseUrl, config.api.apiKey));
  },

  /** Static test data shared by UI and API scenarios. */
  testData: async ({}, use) => {
    await use(users);
  },
});

export { expect } from '@playwright/test';
export { config };
