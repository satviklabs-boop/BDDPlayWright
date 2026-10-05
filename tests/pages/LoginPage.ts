﻿import { Page, Locator } from '@playwright/test';
import { LoginLocators } from '../locators/Locators.js';

/**
 * LoginPage - actions for the login screen.
 *
 * Selectors live in tests/locators/Locators.ts and are written with
 * getByRole / getByLabel / getByText, so they read like the screen itself.
 * A UI change means editing one readable line there, not a CSS string.
 *
 * To add a new page: add a `<Page>Locators` class in Locators.ts, copy this
 * file, then register it in GenericFunction.Fixtures()
 * (tests/Routine/GenericFunction.ts).
 */
export class LoginPage {
  // ----- Locators -----
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly flash: Locator;
  readonly logout: Locator;
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    const loc = new LoginLocators(page);
    this.username = loc.username;
    this.password = loc.password;
    this.loginButton = loc.loginButton;
    this.flash = loc.flash;
    this.logout = loc.logout;
    this.heading = loc.heading;
  }

  // ----- Actions -----
  async open() {
    // The public demo host can be slow to respond; 'domcontentloaded' resolves
    // as soon as the form is parsed, and the locators below auto-wait for the
    // elements anyway, so there is no need to block on every sub-resource.
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async flashText(): Promise<string> {
    await this.flash.waitFor({ state: 'visible' });
    return (await this.flash.innerText()).trim();
  }
}
