import type { Page, Locator } from '@playwright/test';

/**
 * Locators - one place for every UI selector, written the readable way.
 *
 * Instead of a `name,selector` CSV full of CSS (`#username`,
 * `button[type="submit"]`), each locator is now described by *what the user
 * sees*: its role, its label, its text. Playwright's `getByRole`,
 * `getByLabel` and `getByText` read like the screen itself, so a non-technical
 * reader can follow them and a UI change is obvious to fix.
 *
 * Why this is better than the CSV:
 *   - `getByLabel('Username')` says exactly which field it is; `#username` does not.
 *   - Role/label locators are resilient: they survive a class or id rename.
 *   - Playwright's accessibility engine also asserts the element is *accessible*.
 *
 * Usage:
 *   const login = new LoginLocators(page);
 *   await login.username.fill('tomsmith');
 */
export class LoginLocators {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly flash: Locator;
  readonly logout: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.flash = page.locator('#flash');
    this.logout = page.getByRole('link', { name: 'Logout' });
    this.heading = page.getByRole('heading', { name: 'Secure Area', level: 2 });
  }
}