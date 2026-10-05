import type { ChainablePromiseElement } from 'webdriverio';
import { LoginLocators } from '../locators/Locators.ts';

/**
 * LoginPage - actions for the Android login screen.
 *
 * The Android counterpart of `tests/pages/LoginPage.ts`. Selectors live in
 * `locators/Locators.ts` and are written with the readable `~accessibilityId`
 * and `text(...)` forms, so a UI change means editing one understandable line.
 *
 * The defaults target a conventional Android login layout. When you point the
 * suite at your own app, open Appium Inspector, read the accessibility id / text
 * of each element, and update `locators/Locators.ts`.
 */
export class LoginPage {
  // ----- Locators -----
  readonly username: ChainablePromiseElement;
  readonly password: ChainablePromiseElement;
  readonly loginButton: ChainablePromiseElement;
  readonly flash: ChainablePromiseElement;
  readonly error: ChainablePromiseElement;
  readonly heading: ChainablePromiseElement;

  constructor() {
    const loc = new LoginLocators();
    this.username = loc.username;
    this.password = loc.password;
    this.loginButton = loc.loginButton;
    this.flash = loc.successMessage;
    this.error = loc.errorMessage;
    this.heading = loc.heading;
  }

  // ----- Actions -----

  /** Wait until the login screen is on-screen. */
  async open(): Promise<void> {
    await this.username.waitForDisplayed({ timeout: 20_000 });
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.waitForDisplayed({ timeout: 15_000 });
    await this.username.clearValue();
    await this.username.setValue(username);

    await this.password.clearValue();
    await this.password.setValue(password);

    // Dismiss the soft keyboard so it cannot cover the submit button.
    try {
      await driver.hideKeyboard();
    } catch {
      // no soft keyboard present - fine
    }

    await this.loginButton.waitForEnabled({ timeout: 15_000 });
    await this.loginButton.click();
  }

  /** Read the success banner text. */
  async flashText(): Promise<string> {
    await this.flash.waitForDisplayed({ timeout: 15_000 });
    return (await this.flash.getText()).trim();
  }

  /** Read the error banner text. */
  async errorText(): Promise<string> {
    await this.error.waitForDisplayed({ timeout: 15_000 });
    return (await this.error.getText()).trim();
  }
}