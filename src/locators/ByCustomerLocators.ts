/**
 * Locators for the customer page, fed by Locators/reads_CustomCustomer.csv.
 */
import { loadLocators, select } from './LoadLocators.js';

/** reads_CustomCustomer.csv as key -> selector. Loaded once per process. */
export const LOCATORS = loadLocators('Customer');

export const By = {
  PAGE_HEADING: select(LOCATORS, 'pageHeading'),
  SEARCH_BOX: select(LOCATORS, 'searchBox'),
  ADD_BUTTON: select(LOCATORS, 'addButton'),
  CUSTOMER_ROW: select(LOCATORS, 'customerRow'),
  EDIT_ROW_BUTTON: select(LOCATORS, 'editRowButton'),
} as const;
