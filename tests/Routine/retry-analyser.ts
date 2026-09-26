/**
 * Retry analyser.
 *
 * Playwright re-runs a failed test, then reports it as a plain green PASS.
 * That hides a real signal: the test is unstable. This reads the Playwright
 * JSON report after the run and sorts every scenario into one of three groups:
 *
 *   pass   - passed first time
 *   flaky  - failed, then passed on a retry
 *   failed - never passed
 *
 * Usage:  npm run retry:analyse
 * (npm test runs it automatically afterwards.)
 */

import fs from 'node:fs';
import { config } from './config.js';

const enabled = config.analyseRetries;
const failOnFlaky = config.failOnFlaky;

const REPORT_FILE = 'test-results/results.json';
const OUTPUT_DIR = 'test-results/retry';

type Verdict = 'pass' | 'flaky' | 'failed' | 'skipped';

interface Scenario {
  id: string;
  verdict: Verdict;
  attemptStatuses: string[];
  error?: string;
}

/** Walk the report's nested suites and flatten every scenario into one list. */
function readScenarios(suite: any, chain: string[], into: Scenario[]) {
  // Carry only the describe titles; a scenario's own title is added below.
  const titles = suite.title ? [...chain, suite.title] : chain;

  for (const spec of suite.specs ?? []) {
    const statuses: string[] = (spec.tests ?? []).flatMap((t: any) => t.results ?? []).map((r: any) => r.status);

    let verdict: Verdict;
    if (statuses.length === 0 || statuses.every((s) => s === 'skipped')) {
      verdict = 'skipped';
    } else if (statuses.at(-1) === 'passed') {
      // Passed last: flaky only if something failed before it.
      verdict = statuses.some((s) => s === 'failed') ? 'flaky' : 'pass';
    } else {
      verdict = 'failed';
    }

    into.push({
      id: [...titles, spec.title].filter(Boolean).join(' > '),
      verdict,
      attemptStatuses: statuses,
      error: (spec.tests ?? [])
        .flatMap((t: any) => t.results ?? [])
        .find((r: any) => r.status === 'failed')?.error?.message,
    });
  }

  for (const child of suite.suites ?? []) readScenarios(child, titles, into);
}

/** Build the plain-text report a human reads in the CI console. */
function renderReport(scenarios: Scenario[]): string {
  const count = (v: Verdict) => scenarios.filter((s) => s.verdict === v);
  const lines = [
    'Retry analyser report',
    '=====================',
    '',
    `Scenarios : ${scenarios.length}`,
    `Passed    : ${count('pass').length}  (green first time)`,
    `Flaky     : ${count('flaky').length}  (passed only after a retry)`,
    `Failed    : ${count('failed').length}  (failed every attempt)`,
    '',
  ];

  for (const [verdict, heading] of [
    ['flaky', 'FLAKY - passed, but only after a retry. This instability is hidden by a green build.'],
    ['failed', 'FAILED - every attempt failed:'],
  ] as const) {
    const rows = count(verdict);
    if (rows.length === 0) continue;
    lines.push(heading);
    for (const s of rows) {
      lines.push(`    ${verdict.toUpperCase().padEnd(6)} ${s.id}`);
      lines.push(`           attempts: ${s.attemptStatuses.join(' -> ')}`);
      // First line of the message is the assertion; the rest is the call log.
      if (s.error) lines.push(`           reason  : ${s.error.split('\n')[0]}`);
    }
    lines.push('');
  }

  if (count('flaky').length === 0 && count('failed').length === 0) {
    lines.push('No flaky or failed scenarios.');
  }
  return lines.join('\n');
}

function main(): void {
  if (!enabled) {
    console.log('[retry-analyser] Disabled (ANALYSE_RETRIES=false) - skipping.');
    return;
  }

  if (!fs.existsSync(REPORT_FILE)) {
    console.error(`[retry-analyser] No Playwright JSON report at ${REPORT_FILE}.`);
    process.exitCode = 1;
    return;
  }

  const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
  const scenarios: Scenario[] = [];
  for (const suite of report.suites ?? []) readScenarios(suite, [], scenarios);

  const text = renderReport(scenarios);
  console.log(text);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(`${OUTPUT_DIR}/retry-report.txt`, text, 'utf8');
  fs.writeFileSync(`${OUTPUT_DIR}/retry-summary.json`, JSON.stringify(scenarios, null, 2), 'utf8');

  // A flaky test does NOT fail the build by default - it is reported for a
  // human to act on. Set FAIL_ON_FLAKY=true to treat flakiness as a failure.
  const failed = scenarios.filter((s) => s.verdict === 'failed').length;
  const flaky = scenarios.filter((s) => s.verdict === 'flaky').length;
  if (failed > 0) process.exitCode = 1;
  else if (flaky > 0 && failOnFlaky) process.exitCode = 1;
}

main();