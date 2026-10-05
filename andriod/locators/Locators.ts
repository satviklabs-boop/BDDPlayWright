import type { ChainablePromiseElement } from 'webdriverio';

/**
 * Locators - one place for every Android selector, written the readable way.
 *
 * The CSV used `android=new UiSelector().resourceId("com.example.app:id/username")`
 * on every row. Here each element is described by *what the user sees* instead:
 *
 *   - `$('~Username')`                    -> accessibility id / content-desc
 *   - `$('android=new UiSelector().text("Login")')`        -> visible text
 *   - `$('android=new UiSelector().textContains("invalid")')` -> part of the text
 *
 * WebdriverIO does not ship a `getByRole`/`getByLabel` (that is Playwright, in
 * the web suite). The Android equivalents below - accessibility id and text -
 * are the same idea: locators that state the intent instead of a resource-id.
 *
 * Note on the `~` selector: Appium resolves `~Value` as the element whose
 * **accessibility id** (Android `content-desc`, or `resource-id` fallback) is
 * `Value`. So `$('~username')` matches a field tagged `content-desc="username"`
 * (or `resource-id=".../username"`). Prefer it - it survives layout changes.
 * Where an app only exposes text, use `text(...)` / `textContains(...)`.
 */
export class LoginLocators {
  // Accessibility-id locators (the readable, resilient choice)
  readonly username: ChainablePromiseElement = $('~username');
  readonly password: ChainablePromiseElement = $('~password');
  readonly loginButton: ChainablePromiseElement = $('~login');
  readonly successMessage: ChainablePromiseElement = $('~success_message');
  readonly errorMessage: ChainablePromiseElement = $('~error_message');

  // Text locators, used where the screen exposes the word itself
  readonly heading: ChainablePromiseElement = $('android=new UiSelector().text("Login")');
}

/**
 * SecureAreaLocators - the screen shown after a successful login.
 */
export class SecureAreaLocators {
  readonly heading: ChainablePromiseElement = $('android=new UiSelector().textContains("Secure Area")');
  readonly logoutButton: ChainablePromiseElement = $('~logout');
}