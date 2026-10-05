import type { ChainablePromiseElement } from 'webdriverio';
import { SecureAreaLocators } from '../locators/Locators.ts';

/**
 * SecureAreaPage - the screen shown after a successful login.
 * Selectors live in `locators/Locators.ts` (readable accessibility-id/text).
 */
export class SecureAreaPage {
  readonly heading: ChainablePromiseElement;
  readonly logoutButton: ChainablePromiseElement;

  constructor() {
    const loc = new SecureAreaLocators();
    this.heading = loc.heading;
    this.logoutButton = loc.logoutButton;
  }
}