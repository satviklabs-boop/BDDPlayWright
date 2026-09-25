/**
 * Locators for the account page, fed by Locators/reads_CustomAccount.csv.
 */
import { loadLocators, select } from './LoadLocators.js';

/** reads_CustomAccount.csv as key -> selector. Loaded once per process. */
export const LOCATORS = loadLocators('Account');

export const By = {
  PAGE_HEADING: select(LOCATORS, 'pageHeading'),
  CREATE_BUTTON: select(LOCATORS, 'createButton'),
  ACCOUNTS_TABLE: select(LOCATORS, 'accountsTable'),
  ACCOUNT_ROW: select(LOCATORS, 'accountRow'),
} as const;
