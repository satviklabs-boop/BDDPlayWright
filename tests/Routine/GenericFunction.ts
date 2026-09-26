import { Page, Locator } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LoginPage } from '../pages/LoginPage.js';

/**
 * GenericFunction - everything shared by all pages and steps:
 *   1. Fixtures()      - the objects every step can ask for (loginPage, genericFunction)
 *   2. readLocators()  - reads selectors from tests/locators/<Page>.csv
 *   3. browser actions - click, enterText, getText, ...
 *
 * Usage in a step file:  import { Given, When, Then } from '../Routine/GenericFunction.js';
 * Usage in a page:       const loc = GenericFunction.readLocators('Login');
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

  // ===================== Locators =====================

  /**
   * Reads tests/locators/<pageName>.csv and returns { name: selector }.
   *
   * Each row is:  name,selector        e.g.  loginButton,button[type="submit"]
   * Blank lines and lines starting with # are ignored.
   * Only the FIRST comma splits the row, so selectors may contain commas.
   */
  static readLocators(pageName: string): Record<string, string> {
    const file = path.join('tests', 'locators', `${pageName}.csv`);
    if (!fs.existsSync(file)) {
      throw new Error(`Locator file not found: ${file}`);
    }

    const locators: Record<string, string> = {};
    for (const line of fs.readFileSync(file, 'utf-8').split(/\r?\n/)) {
      const row = line.trim();
      if (row === '' || row.startsWith('#')) continue;

      const comma = row.indexOf(',');
      if (comma < 1) throw new Error(`Bad row in ${file}: "${row}" (expected name,selector)`);
      locators[row.slice(0, comma).trim()] = row.slice(comma + 1).trim();
    }

    // Fail fast on a typo like loc.loginButon instead of passing `undefined` to Playwright.
    return new Proxy(locators, {
      get(target, key) {
        if (typeof key !== 'string') return undefined;
        if (!(key in target)) {
          throw new Error(`Locator "${key}" not found in ${file}. Available: ${Object.keys(target).join(', ')}`);
        }
        return target[key];
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
}

// ===================== Step keywords =====================
// Built once from the fixtures above. Every step file imports these.
// Test data lives in the feature files (Examples tables), not here.
export const test = GenericFunction.Fixtures();
export const { Given, When, Then } = createBdd(test);
