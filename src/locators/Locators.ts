/**
 * The single, centralized store for every selector in the framework.
 *
 * Why one file instead of a file per page: the suite is expected to grow to a
 * dozen or more screens (login, accounts, customers, ...). Splitting selectors
 * across many small files scatters the DOM knowledge and makes it easy for two
 * page objects to drift onto slightly different selectors for the same element.
 * One `Locators` object keeps every selector in a single, greppable place.
 *
 * Layout: one nested namespace-like object per page/screen, each grouping its
 * selectors. Only page objects read these constants - step definitions never
 * touch them.
 *
 * Usage:
 *   page.locator(Locators.login.usernameField)
 *   page.locator(Locators.customers.searchBox)
 *
 * `as const` preserves the literal string types, so a typo in a selector name
 * is a compile error rather than a runtime one.
 */
export const Locators = {
  // =====================================================================
  // Login page - https://the-internet.herokuapp.com/login
  // =====================================================================
  login: {
    /** Username input on the login form. */
    usernameField: '#username',
    /** Password input on the login form. */
    passwordField: '#password',
    /** Submit button of the login form. */
    loginButton: 'button[type="submit"]',
    /** Flash banner showing the success or error message after submit. */
    flashMessage: '#flash',
    /** Logout link, rendered only once the user is authenticated. */
    logoutButton: 'a[href="/logout"]',
    /** Page heading (h2) of the login screen. */
    heading: 'h2',
  },

  // =====================================================================
  // Accounts page
  //
  // Placeholder section. Fill in the real selectors once the screen exists;
  // keeping the section here documents the intended shape and stops selectors
  // from leaking back into page objects or step definitions.
  // =====================================================================
  accounts: {
    /** Heading of the accounts list screen. */
    pageHeading: 'h1.accounts-title',
    /** "Create account" action button. */
    createButton: 'button[data-test="create-account"]',
    /** Table listing the accounts. */
    accountsTable: 'table#accounts',
    /** Row selector within the accounts table. */
    accountRow: 'table#accounts tbody tr',
  },

  // =====================================================================
  // Customers page
  // =====================================================================
  customers: {
    /** Heading of the customers list screen. */
    pageHeading: 'h1.customers-title',
    /** Search input used to filter customers. */
    searchBox: 'input[data-test="customer-search"]',
    /** "Add customer" action button. */
    addButton: 'button[data-test="add-customer"]',
    /** Row selector within the customers table. */
    customerRow: 'table#customers tbody tr',
    /** Per-row edit action. */
    editRowButton: 'button[data-test="edit-customer"]',
  },
} as const;
