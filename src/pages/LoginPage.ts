import { Page, Locator } from '@playwright/test';
import { readLocators } from '../locators/locators.js';

/**
 * LoginPage - everything the login screen can do.
 *
 * Selectors come from Locators/Login.csv, so a UI change means
 * editing one CSV row instead of hunting through this file.
 *
 * To add another page: copy this file, change the page name passed to
 * readLocators() and the steps you want. No base class, no extra wiring.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  // ----- Elements (CSV read once per process) -----
  private readonly by = readLocators('Login');
  private el(name: string): Locator {
    return this.page.locator(this.by[name]);
  }

  get username() { return this.el('usernamefield'); }
  get password() { return this.el('passwordfield'); }
  get loginButton() { return this.el('loginbutton'); }
  get flash() { return this.el('flashmessage'); }
  get logout() { return this.el('logoutbutton'); }
  get heading() { return this.el('subheader').first(); }

  // ----- Actions -----
  async open() {
    await this.page.goto('/login');
  }

  async typeUsername(value: string) {
    await this.username.fill(value);
  }

  async typePassword(value: string) {
    await this.password.fill(value);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async login(username: string, password: string) {
    await this.typeUsername(username);
    await this.typePassword(password);
    await this.clickLogin();
  }

  async logOut() {
    await this.logout.click();
  }

  // ----- Reads -----
  async flashText(): Promise<string> {
    await this.flash.waitFor({ state: 'visible' });
    return (await this.flash.innerText()).trim();
  }

  async headingText(): Promise<string> {
    return (await this.heading.innerText()).trim();
  }

  get url(): string {
    return this.page.url();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.logout.isVisible();
  }

  async isPasswordMasked(): Promise<boolean> {
    return (await this.password.getAttribute('type')) === 'password';
  }
}
