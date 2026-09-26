/**
 * Locators live in plain CSV files under the project-root `Locators/` folder:
 *
 *   Locators/Login.csv                 -> login page
 *   Locators/reads_CustomAccount.csv   -> account page
 *   Locators/reads_CustomCustomer.csv  -> customer page
 *
 * Each row is `key,selector`:
 *
 *   usernameField,#username
 *   loginButton,button[type="submit"]
 *
 * Blank lines and `#` comments are ignored. Only the FIRST comma separates key
 * from selector, so a selector may itself contain commas.
 *
 * To add a page: drop in `reads_Custom<PageName>.csv` (or `<PageName>.csv`)
 * and call `readLocators('<PageName>')` once in your page object.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const FOLDER = 'Locators';
const PREFIX = 'reads_Custom';
const SUFFIX = '.csv';

/** page name -> its parsed selectors. Read once per page, then reused. */
const CACHE: Record<string, Record<string, string>> = {};

/**
 * Reads `Locators/<page>.csv` for Login or `Locators/reads_Custom<page>.csv`
 * for other pages and returns `{ key: selector }`.
 * Keys are lower-cased, so lookups are case-insensitive.
 */
export function readLocators(page: string): Record<string, string> {
  if (CACHE[page]) return CACHE[page];

  const file = path.join(FOLDER, page === 'Login' ? 'Login.csv' : `${PREFIX}${page}${SUFFIX}`);
  if (!fs.existsSync(file)) {
    throw new Error(`Locator file not found: ${file}`);
  }

  const selectors: Record<string, string> = {};
  for (const line of fs.readFileSync(file, 'utf-8').split(/\r?\n/)) {
    const row = line.trim();
    if (row === '' || row.startsWith('#')) continue;
    const comma = row.indexOf(',');
    if (comma < 1) {
      throw new Error(`Bad row in ${file}: expected 'key,selector' but got '${row}'`);
    }
    selectors[row.slice(0, comma).trim().toLowerCase()] = row.slice(comma + 1).trim();
  }

  CACHE[page] = selectors;
  return selectors;
}

/** Reads one selector by key, or throws with the list of valid keys. */
export function selector(page: string, key: string): string {
  const all = readLocators(page);
  const value = all[key.trim().toLowerCase()];
  if (!value) {
    throw new Error(`Missing locator '${key}' in ${page} (available: ${Object.keys(all).join(', ')})`);
  }
  return value;
}
