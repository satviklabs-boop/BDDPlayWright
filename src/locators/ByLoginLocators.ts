/**
 * Locators for the login page, fed by Locators/reads_CustomLogin.csv.
 *
 * `loadLocators('Login')` runs once, when this module is first imported - the
 * TypeScript stand-in for Java's `static { loadLocators("Login"); }`. Every
 * selector below then resolves against this page's own map, so no lookup can
 * reach another page's file.
 */
import { loadLocators, select } from './LoadLocators.js';

/** reads_CustomLogin.csv as key -> selector. Loaded once per process. */
export const LOCATORS = loadLocators('Login');

export const By = {
  USERNAME_FIELD: select(LOCATORS, 'usernameField'),
  PASSWORD_FIELD: select(LOCATORS, 'passwordField'),
  LOGIN_BUTTON: select(LOCATORS, 'loginButton'),
  FLASH_MESSAGE: select(LOCATORS, 'flashMessage'),
  LOGOUT_BUTTON: select(LOCATORS, 'logoutButton'),
  SUBHEADER: select(LOCATORS, 'subheader'),
} as const;
