import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - thin wrapper around Playwright's Page with reusable helpers.
 * All page objects extend this so common behaviour lives in one place.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Expose the underlying Playwright page (used by step definitions for assertions). */
  getPage(): Page {
    return this.page;
  }

  /** Navigate to a path relative to the configured baseURL. */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /** Wait for, then fill, an input. */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  /** Click an element once it is visible and enabled. */
  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /** Assert an element is visible. */
  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /** Assert an element contains the given text. */
  async expectContainsText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toContainText(text);
  }

  /** Current page URL. */
  url(): string {
    return this.page.url();
  }

  /** Current page title. */
  async title(): Promise<string> {
    return this.page.title();
  }
}