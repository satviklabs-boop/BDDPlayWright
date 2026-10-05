# Android App Test Automation (Appium)

A **separate** test project inside this repository that runs the *same login
scenario* against an **Android app on a real device (or emulator) connected over
USB debugging**, using **Appium + WebdriverIO + Cucumber BDD**.

It is deliberately independent of the root Playwright suite:

| | Root framework | This folder |
|---|---|---|
| Target | Web browser | Android app |
| Engine | Playwright | Appium (UiAutomator2) |
| Runner | playwright-bdd | WebdriverIO + Cucumber |
| Config | `playwright.config.ts` | `andriod/wdio.conf.ts` |
| Install | root `npm install` | `cd andriod && npm install` |

Nothing in the root suite is modified, and nothing here needs the root suite.

---

## Prerequisites

1. **Node.js 18+**
2. **Java JDK 11+** and the **Android SDK**. Install it via
   [Android Studio](https://developer.android.com/studio) → *SDK Manager*, then set
   the environment variables and put `platform-tools` on `PATH`:
   ```powershell
   # Windows PowerShell (adjust the path to your SDK location)
   setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
   setx ANDROID_SDK_ROOT "$env:LOCALAPPDATA\Android\Sdk"
   setx PATH "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
   ```
   Restart the terminal afterwards and check with `adb version`. Appium fails
   with *"Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was
   exported"* until this is done.
3. **Appium 2 + the UiAutomator2 driver.** You do **not** need a global
   install: `npm install` in this folder already pulls in `appium` and
   `appium-uiautomator2-driver`. (If you prefer a global install:
   `npm install -g appium && appium driver install uiautomator2`.)
4. An **Android device with USB debugging enabled**, or a running emulator.

---

## Connect a device over USB debugging

1. On the phone: *Settings → About phone → tap "Build number" 7 times* to unlock
   Developer options.
2. *Settings → Developer options → enable **USB debugging***.
3. Plug the phone in with a USB cable and accept the **"Allow USB debugging?"**
   prompt on the phone.
4. Verify from this folder:

   ```bash
   npm run devices
   # List of devices attached
   # 1A2B3C4D5E    device
   ```

   `unauthorized` means you have not accepted the prompt; `offline` means
   unplug/replug or restart the adb server with `adb kill-server && adb start-server`.

---

## Install & run

```bash
cd andriod
npm install

# create your env file and point it at your app/device
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

npm test
```

WebdriverIO starts the Appium server automatically (`APPIUM_AUTOSTART=true`),
so you only need the device connected and `adb devices` showing it as `device`.

### Useful commands

| Command | What it does |
|---|---|
| `npm test` | Run the whole Android login suite |
| `npm run test:smoke` | Only `@smoke` scenarios |
| `npm run test:regression` | Only `@regression` scenarios |
| `npm run test:positive` / `test:negative` | Filter by those tags |
| `npm run appium:start` | Start the Appium server manually |
| `npm run appium:doctor` | Diagnose the Android setup |
| `npm run devices` | `adb devices` |
| `npm run typecheck` | TypeScript type check |

Tag a run from the shell without editing files:

```bash
$env:TAGS="@smoke"; npm test          # Windows PowerShell
TAGS="@smoke" npm test                # macOS/Linux
```

---

## Point it at your own app

**Option A - install a `.apk` you have** (`app:install`):

```env
APP_PATH=./andriod/apps/app-debug.apk
```
Put the `.apk` in `andriod/apps/` (that folder is where relative `APP_PATH`
resolves from) and leave `APP_PACKAGE`/`APP_ACTIVITY` unset.

**Option B - an app already installed on the device** (default):

```env
APP_PACKAGE=com.yourcompany.yourapp
APP_ACTIVITY=.ui.MainActivity
```

The defaults ship with the natively pre-installed **Settings** app
(`com.android.settings/.Settings`) so the harness launches *something* before you
plug in your own app.

### Update the locators

Selectors live in `locators/Locators.ts`, written the readable way. Open
**Appium Inspector**, inspect your login screen, and update the values there:

```typescript
export class LoginLocators {
  readonly username = $('~username');                              // accessibility id
  readonly loginButton = $('android=new UiSelector().text("Login")'); // visible text
}
```

Supported readable selector forms:

| Form | Example | Meaning |
|---|---|---|
| Accessibility id | `~username` | element whose `content-desc` (or `resource-id`) is `username` |
| Visible text | `android=new UiSelector().text("Login")` | element showing exactly that text |
| Partial text | `android=new UiSelector().textContains("invalid")` | element containing that text |

> **Why not a CSV of resource-ids?** WebdriverIO has no `getByRole`/`getByLabel`
> (that is Playwright, used by the web suite), so the Android equivalents are the
> accessibility id and the visible text above. Both describe **what the user
> sees**, survive a resource-id rename, and read the same for a developer and a
> tester. A raw `resourceId("com.example.app:id/username")` reads as nothing.

---

## Project structure

```
andriod/
├── features/            # WHAT to test (Gherkin)
│   └── login.feature    #   same login scenario as the web suite
├── steps/               # HOW each Gherkin line runs
│   └── login.steps.ts
├── pages/               # Page objects (actions)
│   ├── LoginPage.ts
│   └── SecureAreaPage.ts
├── locators/            # Selectors, readable ~accessibilityId / text(...)
│   └── Locators.ts
├── Routine/
│   └── GenericFunction.ts   # element actions (click, enterText, ...)
├── apps/                # drop your .apk here (git-ignored)
├── wdio.conf.ts         # Appium + WebdriverIO + Cucumber config
├── tsconfig.json
├── .env.example
└── package.json
```

---

## Reporting

`npm test` runs the suite and then builds the Allure report automatically via
`Routine/run-tests.mjs` - it does **not** stop at raw results. Each run gets its
own folder stamped with the local date and time, and a `latest` copy always
points at the newest one:

```
allure-report/
  2026-10-05_14-32-07/   <- one folder per run, never overwritten
  latest/                <- copy of the newest run
```

```bash
npm test           # run the suite + build the timestamped report
npm run report     # open the newest report (allure-report/latest)
npm run report:serve   # serve raw results without writing a report
npm run test:raw   # run the suite only, no report step
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Could not find a connected Android device` | Run `adb devices`; accept the USB prompt; try another cable/port. |
| `unauthorized` in `adb devices` | Unlock the phone and accept the "Allow USB debugging" dialog. |
| `UiAutomator2 server` install timeout | First run downloads the server APK - give it time or raise `uiautomator2ServerInstallTimeout`. |
| Keyboard covers the button | `hideKeyboard()` is called before tapping login; disable the soft keyboard in emulator settings if it still misbehaves. |
| `resourceId not found` | Your app exposes different ids/text - update `locators/Locators.ts` from Appium Inspector. |
| Appium server not starting | Start it manually (`npm run appium:start`) and set `APPIUM_AUTOSTART=false`. |