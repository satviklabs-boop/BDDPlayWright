import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Reads locators from tests/locators/<Page>.csv
 *
 * Each row is:  name,selector        e.g.  loginButton,button[type="submit"]
 * Blank lines and lines starting with # are ignored.
 * Only the FIRST comma splits the row, so selectors may contain commas.
 *
 * Usage:  const loc = readLocators('Login');   loc.loginButton  ->  'button[type="submit"]'
 */
export function readLocators(pageName: string): Record<string, string> {
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
