/**
 * Custom fixtures: the objects steps can ask for.
 *
 * Playwright builds these per scenario and hands them to your steps, so a step
 * can just say `loginPage` instead of creating it itself. Add a fixture here
 * when you need a new shared object.
 */
import { test as base } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage.js';
import { ApiClient } from '../api/ApiClient.js';
import { config } from '../config/env.config.js';
import users from '../../test-data/users.json' with { type: 'json' };

export const test = base.extend<{
  loginPage: LoginPage;
  apiClient: ApiClient;
  testData: typeof users;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request, config.api.baseUrl));
  },

  testData: async ({}, use) => {
    await use(users);
  },
});

export { expect } from '@playwright/test';
export { config };
