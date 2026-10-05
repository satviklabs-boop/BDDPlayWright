import type { ChainablePromiseElement } from 'webdriverio';

/**
 * GenericFunction - the Android equivalent of the Playwright suite's
 * `tests/Routine/GenericFunction.ts`. Everything shared by all pages and
 * steps lives here:
 *
 *   1. element actions - click, enterText, getText, isVisible, ...
 *   2. small helpers   - hideKeyboard, waitForGone, pause
 *
 * Locators live in `locators/Locators.ts`, written the readable way:
 *   `~username`                                  (accessibility id)
 *   `android=new UiSelector().text("Login")`       (visible text)
 *
 * Usage in a page:  const loc = new LoginLocators();
 * Usage in a step:  await genericFunction.click(LoginPage.loginButton);
 */
export class GenericFunction {
  // ===================== Element actions =====================

  /** Wait until the element is displayed, then click it. */
  async click(element: ChainablePromiseElement): Promise<void> {
    await element.waitForDisplayed({ timeout: 15_000 });
    await element.click();
  }

  /** Clear the field and type a value. */
  async enterText(element: ChainablePromiseElement, value: string): Promise<void> {
    await element.waitForDisplayed({ timeout: 15_000 });
    await element.clearValue();
    await element.setValue(value);
  }

  /** Read the visible text of an element, trimmed. */
  async getText(element: ChainablePromiseElement): Promise<string> {
    await element.waitForDisplayed({ timeout: 15_000 });
    return (await element.getText()).trim();
  }

  /** True if the element is currently displayed (does not wait long). */
  async isVisible(element: ChainablePromiseElement): Promise<boolean> {
    return element.isDisplayed().catch(() => false);
  }

  /** True if the element is enabled (used for a clickable login button). */
  async isEnabled(element: ChainablePromiseElement): Promise<boolean> {
    return element.isEnabled().catch(() => false);
  }

  /** Hide the on-screen keyboard if it is open. */
  async hideKeyboard(): Promise<void> {
    try {
      await driver.hideKeyboard();
    } catch {
      // Some devices/emulators have no soft keyboard - ignore.
    }
  }

  /** Wait for the element to disappear (e.g. a spinner / splash screen). */
  async waitForGone(element: ChainablePromiseElement, timeout = 15_000): Promise<void> {
    await element.waitForDisplayed({ timeout, reverse: true });
  }

  /** Pause the run, in milliseconds. */
  async pause(ms: number): Promise<void> {
    await driver.pause(ms);
  }
}

/** Shared instance. Appium is a single global session, so one helper is enough. */
export const genericFunction = new GenericFunction();