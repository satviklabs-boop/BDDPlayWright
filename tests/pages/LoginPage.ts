import { Page, Locator } from '@playwright/test';
import { GenericFunction } from '../Routine/GenericFunction.js';

/**
 * LoginPage - actions for the login screen.
 *
 * Selectors come from tests/locators/Login.csv - a UI change means editing one CSV row.
 * To add a new page: create tests/locators/<Page>.csv, copy this file,
 * then register it in tests/Routine/fixtures.ts.
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
    const loc = GenericFunction.readLocators('Login');
    this.username = page.locator(loc.usernameField);
    this.password = page.locator(loc.passwordField);
    this.loginButton = page.locator(loc.loginButton);
    this.flash = page.locator(loc.flashMessage);
    this.logout = page.locator(loc.logoutButton);
    this.heading = page.locator(loc.subheader).first();
  }

  // ----- Actions -----
  async open() {
    await this.page.goto('/login');
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
