/**
 * Run the Appium/Cucumber suite, then build a timestamped Allure report.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Same reason as the web suite's `tests/Routine/run-tests.mjs`: the obvious
 * `"test": "wdio run wdio.conf.ts && allure generate ..."` is wrong twice over.
 *
 *   1. `&&` short-circuits, so when a test FAILS the report is never built -
 *      exactly when you most need to look at it.
 *   2. `;` fixes that on bash, but on Windows the command runs through
 *      cmd/PowerShell, where `;` is a statement separator npm never sees.
 *
 * So the sequencing lives here, in Node, where it behaves the same everywhere.
 * The report is generated into a folder stamped with the local date and time,
 * so successive runs do not overwrite each other.
 *
 *   allure-report/
 *     2026-10-05_14-32-07/     <- one folder per run
 *
 * Exit code is the TEST result (0 pass, 1 fail), so CI still fails the build.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import path from 'node:path';

/** Run a command through the shell so `npx`/`.cmd` shims resolve on Windows. */
function run(command) {
  return spawnSync(command, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
}

/** Local date+time, e.g. 2026-10-05_14-32-07. */
function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
}

const resultsDir = process.env.ALLURE_RESULTS ?? 'allure-results';
const stampId = stamp();
const reportDir = path.join('allure-report', stampId);

console.log('--- Running the Android Appium suite ---');
const tests = run('npx wdio run wdio.conf.ts');
const testExit = tests.status ?? 1;

if (!existsSync(resultsDir)) {
  // No results (e.g. the session never started). Still exit with the test result.
  console.error(`\nNo Allure results at ${resultsDir}/ - nothing to report.`);
  process.exit(testExit);
}

mkdirSync(reportDir, { recursive: true });

console.log(`\n--- Building Allure report -> ${reportDir} ---`);
const allure = run(`npx allure generate ${resultsDir} --clean -o "${reportDir}"`);

if ((allure.status ?? 1) !== 0) {
  // The report step failed. Report it, but do not mask the test result:
  // a generation error must not look like a passing suite.
  console.error('\nAllure report generation failed.');
  process.exit(testExit === 0 ? 1 : testExit);
}

// Keep a stable "latest" copy so a known path always opens the newest report.
const latest = path.join('allure-report', 'latest');
console.log(`\n--- Refreshing ${latest} -> ${stampId} ---`);
rmSync(latest, { recursive: true, force: true });
cpSync(reportDir, latest, { recursive: true });

console.log(`\nOpen it with:  npx allure open ${latest}`);
console.log(`Or the run itself:  npx allure open ${reportDir}`);

process.exit(testExit);
