/**
 * Typed accessor layer over the externalized selector store.
 *
 * Every selector lives in the project-root file `Locators.text` as a plain
 * `PAGE.ELEMENT=selector` line, for example:
 *
 *   LOGIN.USERNAME_FIELD=#username
 *
 * This module reads that file once at startup and exposes the values as typed
 * constants, so page objects never hard-code a raw string:
 *
 *   page.locator(Locators.Login.USERNAME_FIELD)
 *
 * A missing key fails fast with a clear message rather than yielding an empty
 * selector that would surface much later as a confusing Playwright timeout.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Directory of this module (ESM equivalent of __dirname). */
const here = path.dirname(fileURLToPath(import.meta.url));

/** Resolve the selector file from the project root (works regardless of cwd depth). */
function findLocatorsFile(): string {
  const candidates = [
    path.resolve(process.cwd(), 'Locators.text'),
    path.resolve(here, '..', '..', 'Locators.text'),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      `Locator file 'Locators.text' not found. Looked in:\n  ${candidates.join('\n  ')}`,
    );
  }
  return found;
}

/** Parse `KEY=value` lines, ignoring blanks and `#` comments. */
function load(): Record<string, string> {
  const raw = fs.readFileSync(findLocatorsFile(), 'utf-8');
  const map: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key !== '') map[key] = value;
  }
  return map;
}

const PROPS = load();

/** Returns the selector registered under `key`, throwing when it is absent. */
function get(key: string): string {
  const value = PROPS[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing locator '${key}' in Locators.text`);
  }
  return value;
}

export const Locators = {
  // ---- Login page - https://the-internet.herokuapp.com/login --------------
  Login: {
    /** Username input on the login form. */
    USERNAME_FIELD: get('LOGIN.USERNAME_FIELD'),
    /** Password input on the login form. */
    PASSWORD_FIELD: get('LOGIN.PASSWORD_FIELD'),
    /** Submit button of the login form. */
    LOGIN_BUTTON: get('LOGIN.LOGIN_BUTTON'),
    /** Flash banner showing the success or error message after submit. */
    FLASH_MESSAGE: get('LOGIN.FLASH_MESSAGE'),
    /** Logout link, rendered only once the user is authenticated. */
    LOGOUT_BUTTON: get('LOGIN.LOGOUT_BUTTON'),
    /** Secure-area heading (h2). */
    SUBHEADER: get('LOGIN.SUBHEADER'),
  },

  // ---- Accounts page ------------------------------------------------------
  Accounts: {
    PAGE_HEADING: get('ACCOUNTS.PAGE_HEADING'),
    CREATE_BUTTON: get('ACCOUNTS.CREATE_BUTTON'),
    ACCOUNTS_TABLE: get('ACCOUNTS.ACCOUNTS_TABLE'),
    ACCOUNT_ROW: get('ACCOUNTS.ACCOUNT_ROW'),
  },

  // ---- Customers page -----------------------------------------------------
  Customers: {
    PAGE_HEADING: get('CUSTOMERS.PAGE_HEADING'),
    SEARCH_BOX: get('CUSTOMERS.SEARCH_BOX'),
    ADD_BUTTON: get('CUSTOMERS.ADD_BUTTON'),
    CUSTOMER_ROW: get('CUSTOMERS.CUSTOMER_ROW'),
    EDIT_ROW_BUTTON: get('CUSTOMERS.EDIT_ROW_BUTTON'),
  },
} as const;

