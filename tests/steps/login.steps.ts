import { expect } from '@playwright/test';
import { Given, When, Then } from '../Routine/GenericFunction.js';

// ---------- GIVEN ----------
Given('the login page is open', async ({ loginPage, page }) => {
  await loginPage.open();
  await expect(page).toHaveURL(/\/login$/);
});

// ---------- WHEN ----------
When(
  'I login with username {string} and password {string}',
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
  },
);

When('I enter the password {string}', async ({ loginPage }, password: string) => {
  await loginPage.password.fill(password);
});

When('I log out', async ({ loginPage }) => {
  await loginPage.logout.click();
});

// ---------- THEN ----------
Then('I should be redirected to the secure area', async ({ loginPage }) => {
  await expect(loginPage.logout).toBeVisible();
  await expect(loginPage.heading).toHaveText('Secure Area');
});

Then('I should remain on the login page', async ({ page }) => {
  expect(page.url()).toMatch(/\/login$/);
});

Then('the success message should be displayed', async ({ loginPage }) => {
  // The banner reads "You logged into a secure area!" plus a close link (×),
  // so match the meaningful part, ignoring case.
  expect((await loginPage.flashText()).toLowerCase()).toMatch(
    /you logged (into a|out of the) secure area/,
  );
});

Then('an error message should be displayed', async ({ loginPage }) => {
  expect((await loginPage.flashText()).toLowerCase()).toMatch(/your (username|password) is invalid/);
});

Then('a logout option should be available', async ({ loginPage }) => {
  await expect(loginPage.logout).toBeVisible();
});

Then('I should be redirected back to the login page', async ({ page }) => {
  await expect(page).toHaveURL(/\/login$/);
});

Then('the password field should be masked', async ({ loginPage }) => {
  await expect(loginPage.password).toHaveAttribute('type', 'password');
});
