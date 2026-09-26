/**
 * Fixtures - the objects every step can use.
 * Steps import { Given, When, Then } from here.
 * To add a page: create it in tests/pages and add one line below.
 *
 * Test data lives in the feature files (Examples tables), not here.
 */
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage.js';
import { GenericFunction } from './GenericFunction.js';

export const test = base.extend<{ loginPage: LoginPage; genericFunction: GenericFunction }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  genericFunction: async ({ page }, use) => {
    await use(new GenericFunction(page));
  },
});

export const { Given, When, Then } = createBdd(test);
