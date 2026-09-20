import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * LoginPage - page object for https://the-internet.herokuapp.com/login
 *
 * Encapsulates every locator and user action for the login screen so that
 * step definitions stay declarative and locator changes are made in one place.
 */
export class LoginPage extends BasePage {
  // ----- Locators -----
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly flashMessage: Locator;
  private readonly logoutButton: Locator;
  private readonly subheader: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator('#flash');
    this.logoutButton = page.locator('a[href="/logout"]');
    this.subheader = page.locator('h2');
  }

  /** Open the login screen. */
  async open(): Promise<void> {
    await this.goto('/login');
  }

  /** Type credentials (individually, so steps can do partial fills). */
  async enterUsername(username: string): Promise<void> {
    await this.fill(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  /** Click the submit button. */
  async submit(): Promise<void> {
    await this.click(this.loginButton);
  }

  /** Full happy-path action: fill both fields and submit. */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.submit();
  }

  /** Text of the flash banner (success or error). */
  async getFlashMessage(): Promise<string> {
    await this.flashMessage.waitFor({ state: 'visible' });
    return (await this.flashMessage.innerText()).trim();
  }

  /** True when the secure area is displayed (login actually succeeded). */
  async isLoggedIn(): Promise<boolean> {
    return this.logoutButton.isVisible();
  }

  /** Read the secure-area heading. */
  async getSecureAreaHeading(): Promise<string> {
    await this.subheader.first().waitFor({ state: 'visible' });
    return (await this.subheader.first().innerText()).trim();
  }

  /** Log out of the secure area. */
  async logout(): Promise<void> {
    await this.click(this.logoutButton);
  }
}