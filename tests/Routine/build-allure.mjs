/**
 * Build the Allure report into a folder stamped with the local date and time.
 *
 * The plain `allure generate allure-results -o allure-report` writes to a fixed
 * `allure-report/index.html`, so every run overwrites the previous one. Here
 * each run gets its own folder, and a `latest` copy always points at the newest:
 *
 *   allure-report/
 *     2026-10-05_14-32-07/   <- one folder per run
 *     latest/                <- copy of the newest run
 *
 * Run:  node tests/Routine/build-allure.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, cpSync } from 'node:fs';
import path from 'node:path';

const resultsDir = process.env.ALLURE_RESULTS ?? 'allure-results';

if (!existsSync(resultsDir)) {
  console.error(`No Allure results at ${resultsDir}/. Run the tests first.`);
  process.exit(1);
}

const d = new Date();
const pad = (n) => String(n).padStart(2, '0');
const stamp =
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
  `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;

const reportDir = path.join('allure-report', stamp);
mkdirSync(reportDir, { recursive: true });

console.log(`Building Allure report -> ${reportDir}`);
const gen = spawnSync(
  `npx allure generate ${resultsDir} --clean -o "${reportDir}"`,
  { stdio: 'inherit', shell: true, env: process.env },
);
if ((gen.status ?? 1) !== 0) {
  console.error('Allure report generation failed.');
  process.exit(1);
}

// Refresh the stable `latest` copy to the run we just built.
const latest = path.join('allure-report', 'latest');
rmSync(latest, { recursive: true, force: true });
cpSync(reportDir, latest, { recursive: true });

// Keep the folder tidy: list what is available.
const runs = readdirSync('allure-report')
  .filter((f) => /^\d{4}-\d{2}-\d{2}_/.test(f))
  .sort();

console.log(`\nReport:  ${reportDir}/index.html`);
console.log(`Latest:  ${latest}/index.html`);
console.log(`Runs kept: ${runs.length} (${runs.join(', ')})`);
console.log(`\nOpen it with:  npx allure open ${latest}`);
