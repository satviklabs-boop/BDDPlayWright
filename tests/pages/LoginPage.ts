import { Page, Locator } from '@playwright/test';

/**
 * LoginPage - locators + actions for the login screen.
 *
 * Locators are defined right here at the top of the class.
 * To add a new page: copy this file, change the locators and actions,
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
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.flash = page.locator('#flash');
    this.logout = page.locator('a[href="/logout"]');
    this.heading = page.locator('h2').first();
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
