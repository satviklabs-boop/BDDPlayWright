/**
 * Reads a per-page locator CSV and hands back a key -> selector map.
 *
 * Every page owns one CSV under the project-root `Locators/` folder:
 *
 *   Locators/reads_CustomLogin.csv      -> Login page
 *   Locators/reads_CustomAccount.csv    -> Account page
 *   Locators/reads_CustomCustomer.csv   -> Customer page
 *
 * Each row is `key,selector`:
 *
 *   usernameField,#username
 *   loginButton,button[type="submit"]
 *
 * Blank lines and `#` comments are ignored. Only the FIRST comma separates key
 * from selector, so a selector may itself contain commas. Keys are matched
 * case-insensitively.
 *
 * TypeScript has no `static { }` initialiser block, so the Java pattern maps to
 * a module-scope call in each page module:
 *
 *   // ByLoginLocators.ts
 *   export const LOCATORS = loadLocators('Login');
 *
 * That runs exactly once, on first import of the module, which is the same
 * guarantee the static block gave in Java.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Directory of this module (ESM equivalent of __dirname). */
const here = path.dirname(fileURLToPath(import.meta.url));

const FILE_PREFIX = 'reads_Custom';
const FILE_SUFFIX = '.csv';
const FOLDER = 'Locators';

/** page name -> its parsed map. Read once per process. */
const CACHE = new Map<string, Map<string, string>>();

/**
 * Resolve `Locators/<file>` from the project root, independent of cwd depth.
 */
function findCsv(fileName: string): string {
  const candidates = [
    path.resolve(process.cwd(), FOLDER, fileName),
    path.resolve(here, '..', '..', FOLDER, fileName),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      `Locator file '${fileName}' not found. Looked in:\n  ${candidates.join('\n  ')}`,
    );
  }
  return found;
}

/** Parse `key,selector` rows, skipping blanks and `#` comments. */
function parse(filePath: string): Map<string, string> {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const map = new Map<string, string>();
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    const comma = trimmed.indexOf(',');
    if (comma < 1) {
      throw new Error(
        `Malformed row in ${filePath} line ${i + 1}: expected 'key,selector' but found '${trimmed}'`,
      );
    }
    const key = trimmed.slice(0, comma).trim().toLowerCase();
    const selector = trimmed.slice(comma + 1).trim();
    if (key !== '') map.set(key, selector);
  }
  if (map.size === 0) {
    throw new Error(`Locator file '${filePath}' contains no entries`);
  }
  return map;
}

/**
 * Loads the CSV for `page` (e.g. 'Login' -> reads_CustomLogin.csv).
 *
 * The result is cached per page name, so repeated imports cost nothing.
 */
export function loadLocators(page: string): ReadonlyMap<string, string> {
  const name = page.trim();
  if (name === '') {
    throw new Error('Locator page name must not be empty');
  }
  const fileName = `${FILE_PREFIX}${name}${FILE_SUFFIX}`;
  const cached = CACHE.get(fileName);
  if (cached) return cached;
  const parsed = parse(findCsv(fileName));
  CACHE.set(fileName, parsed);
  return parsed;
}

/**
 * Looks up one selector in a page's own map.
 *
 * A missing key fails fast with the list of available keys, rather than
 * yielding an empty selector that would surface later as a confusing
 * Playwright timeout.
 */
export function select(pageLocators: ReadonlyMap<string, string>, key: string): string {
  const value = pageLocators.get(key.trim().toLowerCase());
  if (value === undefined || value === '') {
    throw new Error(
      `Missing locator '${key}' (available keys: ${[...pageLocators.keys()].join(', ')})`,
    );
  }
  return value;
}
