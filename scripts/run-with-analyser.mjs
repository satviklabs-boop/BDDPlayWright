/**
 * Run the Playwright suite, then ALWAYS run the retry analyser.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The obvious approach is a shell chain in package.json:
 *
 *   "test": "playwright test && npm run retry:analyse"
 *
 * That is wrong twice over:
 *
 *   1. `&&` short-circuits, so when a test FAILS the analyser never runs -
 *      exactly when its verdict (flaky vs genuinely broken) is most needed.
 *   2. `;` fixes the short-circuit on bash, but on Windows the command runs
 *      through cmd/PowerShell, where `;` is a statement separator that npm
 *      never sees. The script breaks differently on each platform.
 *
 * So the sequencing lives here, in Node, where it behaves the same everywhere.
 *
 * Exit code is the TEST result (0 pass, 1 fail), so CI still fails the build.
 * The analyser only overrides it when the analyser itself fails to run, or
 * when FAIL_ON_FLAKY=true and flaky scenarios were found.
 */

import { spawnSync } from 'node:child_process';

/** Run a command through the shell so `npx`/`.cmd` shims resolve on Windows. */
function run(command, { inherit = true } = {}) {
  return spawnSync(command, {
    stdio: inherit ? 'inherit' : 'pipe',
    shell: true,
    env: process.env,
  });
}

console.log('--- Running the BDD suite ---');
const tests = run('playwright test');
const testExit = tests.status ?? 1;

if (testExit !== 0) {
  console.log(`\n--- Suite exited with ${testExit}; running the retry analyser anyway ---`);
} else {
  console.log('\n--- Suite passed; running the retry analyser ---');
}

const analyse = run('npm run retry:analyse');
const analyseExit = analyse.status ?? 1;

if (analyseExit !== 0) {
  // The analyser failed to run, or FAIL_ON_FLAKY flagged flaky scenarios.
  // Either way the caller must not see a green build.
  console.error(`\nRetry analyser exited with ${analyseExit}.`);
  process.exit(analyseExit);
}

process.exit(testExit);