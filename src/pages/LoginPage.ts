import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { Locators } from '../locators/Locators.js';

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
    this.usernameInput = page.locator(Locators.Login.USERNAME_FIELD);
    this.passwordInput = page.locator(Locators.Login.PASSWORD_FIELD);
    this.loginButton = page.locator(Locators.Login.LOGIN_BUTTON);
    this.flashMessage = page.locator(Locators.Login.FLASH_MESSAGE);
    this.logoutButton = page.locator(Locators.Login.LOGOUT_BUTTON);
    this.subheader = page.locator(Locators.Login.SUBHEADER);
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
  /** True when the logout link is present and visible. */
  async isLogoutVisible(): Promise<boolean> {
    return this.logoutButton.isVisible();
  }
  /** True when the password input is masked (type="password"). */
  async isPasswordMasked(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'password';
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

