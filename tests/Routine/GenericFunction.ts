import { Page, Locator } from '@playwright/test';

/**
 * GenericFunction - reusable browser actions shared by all pages and steps.
 *
 * Usage in a step:   await genericFunction.click(loginPage.loginButton);
 * Usage in a page:   const generic = new GenericFunction(page);
 */
export class GenericFunction {
  constructor(private readonly page: Page) {}

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
