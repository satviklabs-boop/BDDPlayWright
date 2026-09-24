import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../fixtures/test.fixtures.js';
const { Given, When, Then } = createBdd(test);
// ---------- GIVEN ----------
Given('the login page is open', async ({ loginPage }) => {
  await loginPage.open();
  await expect(loginPage.getPage()).toHaveURL(/\/login$/);
});
// ---------- WHEN ----------
When('I login with valid credentials', async ({ loginPage, testData }) => {
  await loginPage.login(testData.validUser.username, testData.validUser.password);
});
When(
  'I login with username {string} and password {string}',
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
  },
);
When('I enter the password {string}', async ({ loginPage }, password: string) => {
  await loginPage.enterPassword(password);
});
When('I log out', async ({ loginPage }) => {
  await loginPage.logout();
});
// ---------- THEN ----------
Then('I should be redirected to the secure area', async ({ loginPage }) => {
  expect(await loginPage.isLoggedIn()).toBe(true);
  expect(await loginPage.getSecureAreaHeading()).toBe('Secure Area');
});
Then('I should remain on the login page', async ({ loginPage }) => {
  expect(await loginPage.url()).toMatch(/\/login$/);
});
Then('the success message should be displayed', async ({ loginPage }) => {
  // The flash banner reads "You logged into a secure area!" followed by a
  // close link (×), so match on the meaningful substring, case-insensitively.
  const flash = (await loginPage.getFlashMessage()).toLowerCase();
  expect(flash).toMatch(/you logged (into a|out of the) secure area/);
});
Then('an error message should be displayed', async ({ loginPage }) => {
  const flash = (await loginPage.getFlashMessage()).toLowerCase();
  expect(flash).toMatch(/your (username|password) is invalid/);
});
Then('a logout option should be available', async ({ loginPage }) => {
  await expect(loginPage.logoutLink()).toBeVisible();
});
Then('I should be redirected back to the login page', async ({ loginPage }) => {
  await expect(loginPage.getPage()).toHaveURL(/\/login$/);
});
Then('the password field should be masked', async ({ loginPage }) => {
  expect(await loginPage.isPasswordMasked()).toBe(true);
});
