import { Page, Locator } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage.js';

/**
 * GenericFunction - everything shared by all pages and steps:
 *   1. Fixtures()      - the objects every step can ask for (loginPage, genericFunction)
 *   2. browser actions - click, enterText, getText, ...
 *
 * Locators live in tests/locators/Locators.ts, written the readable way with
 * getByRole / getByLabel / getByText. Pages build them; steps just use them.
 *
 * Usage in a step file:  import { Given, When, Then } from '../Routine/GenericFunction.js';
 * Usage in a page:       const loc = new LoginLocators(page);
 * Usage in a step:       await genericFunction.click(loginPage.loginButton);
 */
export class GenericFunction {
  constructor(private readonly page: Page) { }

  // ===================== Fixtures =====================

  /**
   * Defines the fixtures - objects Playwright creates fresh for every scenario
   * and hands to any step that names them, e.g.  async ({ loginPage }) => { ... }
   *
   * To add a page: add its type in < > and one line below that creates it.
   */
  static Fixtures() {
    return base.extend<{
      loginPage: LoginPage;
      genericFunction: GenericFunction;
    }>({
      loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
      },
      genericFunction: async ({ page }, use) => {
        await use(new GenericFunction(page));
      },
    });
  }

  // ===================== Browser actions =====================

  /** Open a URL (relative paths use baseURL from playwright.config.ts). */
  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  /** Wait until the element is visible, then click it. */
  async click(element: Locator) {
    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  /** Clear the field and type a value. */
  async enterText(element: Locator, value: string) {
    await element.waitFor({ state: 'visible' });
    await element.fill(value);
  }

  /** Read the visible text of an element, trimmed. */
  async getText(element: Locator): Promise<string> {
    await element.waitFor({ state: 'visible' });
    return (await element.innerText()).trim();
  }

  /** Pick an option from a <select> by its visible label. */
  async selectByText(element: Locator, label: string) {
    await element.selectOption({ label });
  }

  /** True if the element is currently visible (does not wait). */
  async isVisible(element: Locator): Promise<boolean> {
    return element.isVisible();
  }

  /** Wait for the page to finish loading. */
  async waitForPageLoad() {
    await this.page.waitForLoadState('load');
  }

  /** Current page URL. */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Save a full-page screenshot to test-results/screenshots/<name>.png. */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Get a date string in YYYY-MM-DD format.
   * @param offset - 'currentdate' for today, 'currentdate-1' for yesterday, 'currentdate+2' for 2 days ahead, etc.
   */
  static dateFill(offset: string): string {
    const match = offset.match(/^currentdate([+-]\d+)?$/i);
    if (!match) {
      throw new Error(`Invalid date offset: "${offset}". Use 'currentdate', 'currentdate-1', 'currentdate+2', etc.`);
    }
    const days = match[1] ? parseInt(match[1], 10) : 0;
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// ===================== Step keywords =====================
// Built once from the fixtures above. Every step file imports these.
// Test data lives in the feature files (Examples tables), not here.
export const test = GenericFunction.Fixtures();
export const { Given, When, Then } = createBdd(test);
