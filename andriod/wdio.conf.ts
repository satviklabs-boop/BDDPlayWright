/**
 * WebdriverIO + Appium + Cucumber configuration for the Android suite.
 *
 * This file is the Android counterpart of the root `playwright.config.ts`.
 * It runs entirely on its own: `cd andriod && npm install && npm test`.
 *
 * Device connection is over USB debugging (`adb`), so make sure the phone is
 * plugged in, "USB debugging" is enabled, and `adb devices` lists it as
 * "device" before you run the suite.
 */
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Options, Capabilities } from '@wdio/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = process.env;

/**
 * WDIO's config object mixes `Options.Testrunner` (runner/framework/reporters)
 * with a root-level `capabilities` array, which the published `Testrunner` type
 * does not include. Declaring the union locally keeps strict type-checking on
 * while accepting the full documented shape.
 */
type WdioConfig = Options.Testrunner & {
  capabilities: Capabilities.TestrunnerCapabilities;
  autoCompileOpts?: {
    autoCompile?: boolean;
    tsNodeOpts?: { project?: string; transpileOnly?: boolean };
  };
};

/** Resolve a path relative to the `andriod/` folder (cwd is not guaranteed). */
const fromRoot = (p: string) => (path.isAbsolute(p) ? p : path.resolve(__dirname, p));

const appPath = env.APP_PATH ? fromRoot(env.APP_PATH) : undefined;

export const config: WdioConfig = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: path.resolve(__dirname, 'tsconfig.json'),
      transpileOnly: true,
    },
  },

  hostname: env.APPIUM_HOST ?? '127.0.0.1',
  port: Number(env.APPIUM_PORT ?? 4723),
  path: '/',

  // ----- Cucumber (BDD) -----
  specs: ['./features/**/*.feature'],
  exclude: [],
  maxInstances: 1, // one device -> one session at a time
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': env.DEVICE_NAME ?? 'Android Device',
      'appium:platformVersion': env.PLATFORM_VERSION ?? '13',
      ...(env.UDID ? { 'appium:udid': env.UDID } : {}),
      // Re-install and launch our own .apk when APP_PATH is given, otherwise
      // drive the app already installed on the device (APP_PACKAGE/ACTIVITY).
      ...(appPath
        ? { 'appium:app': appPath }
        : {
            'appium:appPackage': env.APP_PACKAGE ?? 'com.android.settings',
            'appium:appActivity': env.APP_ACTIVITY ?? '.Settings',
          }),
      'appium:noReset': (env.NO_RESET ?? 'false') === 'true',
      'appium:newCommandTimeout': 120,
      'appium:uiautomator2ServerInstallTimeout': 60000,
      'appium:adbExecTimeout': 60000,
      // USB connection: keep the session alive over adb.
      'appium:autoGrantPermissions': true,
    },
  ],

  // Appium server is started/stopped automatically unless told otherwise.
  ...((env.APPIUM_AUTOSTART ?? 'true') === 'true'
    ? {
        services: [
          [
            'appium',
            {
              args: { address: env.APPIUM_HOST ?? '127.0.0.1', port: Number(env.APPIUM_PORT ?? 4723) },
              logPath: fromRoot('logs'),
            },
          ],
        ],
      }
    : {}),

  logLevel: (env.LOG_LEVEL as Options.WebdriverIO['logLevel']) ?? 'info',
  bail: 0,
  waitforTimeout: 15_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 2,

  framework: 'cucumber',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: env.ALLURE_RESULTS ?? 'allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: true,
      },
    ],
  ],

  cucumberOpts: {
    require: ['./steps/**/*.ts'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    tagExpression: env.TAGS ?? '',
    timeout: 120_000,
    ignoreUndefinedDefinitions: false,
  },

  // Make TypeScript specs/steps resolvable.
  specFileRetries: Number(env.SPEC_FILE_RETRIES ?? 1),

  // ----- Hooks -----
  onPrepare: () => {
    // Surface the target device in the log so a wrong udid is obvious.
    // eslint-disable-next-line no-console
    console.log(`[android] Appium ${env.APPIUM_HOST ?? '127.0.0.1'}:${env.APPIUM_PORT ?? 4723} | app=${appPath ?? `${env.APP_PACKAGE}/${env.APP_ACTIVITY}`}`);
  },

  before: async () => {
    // Nothing global yet; kept as an explicit extension point.
  },
};