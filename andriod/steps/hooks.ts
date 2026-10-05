import { After, Before } from '@wdio/cucumber-framework';

/**
 * Cucumber hooks for the Android suite.
 *
 * Appium exposes a single global driver session, so there is nothing to build
 * per-scenario. These hooks only capture evidence when a scenario fails, which
 * is what makes a red run triageable from the Allure report.
 */
const screenshotOnFailure = (process.env.SCREENSHOT_ON_FAILURE ?? 'true') === 'true';

Before(async () => {
  // Reserved for per-scenario setup (deep links, login state, etc.).
});

After(async (scenario) => {
  if (scenario.result?.status === 'FAILED' && screenshotOnFailure) {
    try {
      const png = await driver.takeScreenshot();
      // With the Allure reporter active, attach the screenshot to the failing
      // step; otherwise write it to disk next to the other test artefacts.
      if (typeof (globalThis as { allure?: { addAttachment?: unknown } }).allure !== 'undefined') {
        const allure = (globalThis as unknown as {
          allure: { addAttachment(name: string, buffer: Buffer, type: string): void };
        }).allure;
        allure.addAttachment('failure-screenshot', Buffer.from(png, 'base64'), 'image/png');
      }
    } catch {
      // Device may already be gone - never fail a hook over evidence capture.
    }
  }
});