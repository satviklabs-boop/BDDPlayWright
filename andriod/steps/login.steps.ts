import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from 'expect-webdriverio';
import { LoginPage } from '../pages/LoginPage.ts';
import { SecureAreaPage } from '../pages/SecureAreaPage.ts';
import { genericFunction } from '../Routine/GenericFunction.ts';

/**
 * Step definitions for the Android login feature.
 *
 * The wording mirrors the Playwright suite's `tests/steps/login.steps.ts`, but
 * the implementation drives a real Android device over Appium instead of a
 * browser. Each step creates the page objects it needs; Appium exposes one
 * global session, so no fixture injection is required.
 */
const loginPage = new LoginPage();
const secureArea = new SecureAreaPage();

// ---------- GIVEN ----------
Given('the app is launched', async () => {
  // The session is started by WebdriverIO/Appium; this waits for the first
  // screen of the app to be usable.
  await loginPage.open();
});

Given('the login screen is open', async () => {
  await loginPage.open();
});

// ---------- WHEN ----------
When(
  'I login with username {string} and password {string}',
  async (username: string, password: string) => {
    await loginPage.login(username, password);
  },
);

When('I log out', async () => {
  await genericFunction.click(secureArea.logoutButton);
});

// ---------- THEN ----------
Then('I should be redirected to the secure area', async () => {
  await expect(secureArea.heading).toBeDisplayed();
});

Then('I should remain on the login screen', async () => {
  await expect(loginPage.username).toBeDisplayed();
  await expect(secureArea.heading).not.toBeDisplayed();
});

Then('the success message should be displayed', async () => {
  const text = (await loginPage.flashText()).toLowerCase();
  expect(text).toMatch(/you logged (into a|out of the) secure area/);
});

Then('an error message should be displayed', async () => {
  const text = (await loginPage.errorText()).toLowerCase();
  expect(text).toMatch(/your (username|password) is invalid/);
});

Then('a logout option should be available', async () => {
  await expect(secureArea.logoutButton).toBeDisplayed();
});

Then('I should be redirected back to the login screen', async () => {
  await expect(loginPage.username).toBeDisplayed();
});