/**
 * Retry analyser for the Playwright + playwright-bdd suite.
 *
 * WHY THIS EXISTS
 * ---------------
 * Playwright already re-runs a failed test `retries` times, but the HTML/JSON
 * reporters show a test that passed on the second attempt as a plain green
 * PASS. That hides a real signal: the suite is unstable, and the exact test
 * that is unstable is the one nobody looks at again.
 *
 * This analyser reads the Playwright JSON report after the run and separates
 * the three genuinely different outcomes:
 *
 *   pass   - green on the first attempt
 *   flaky  - failed, then passed on a retry        (reported, does not fail CI)
 *   failed - never passed, even after every retry  (fails CI)
 *
 * It mirrors the semantics of the Java framework's RetryAnalyzer so the two
 * suites report retries the same way.
 *
 * HOW PLAYWRIGHT ENCODES THIS
 * ---------------------------
 * In the JSON report each test carries a `results` array, one entry per
 * attempt, plus a derived `status` on the spec:
 *
 *   status "expected"  -> every attempt passed
 *   status "flaky"     -> Playwright's own word for "passed after a retry"
 *   status "unexpected"-> never passed
 *
 * We do not simply trust the top-level status: we re-derive the verdict from
 * the per-attempt results so the report is correct even if a test is skipped
 * or a project is retried in a way Playwright labels differently.
 *
 * USAGE
 * -----
 *   npm run retry:analyse          # analyse whatever test-results/ holds
 *
 * Run automatically after `npm test` through the package.json script chain.
 */

import fs from 'node:fs';
import path from 'node:path';

import { config } from '../config/env.config';

/** One attempt at a test. */
interface Attempt {
  status: string;
  duration?: number;
  error?: { message?: string };
}

interface TestResult {
  status: string;
  title?: string;
  error?: { message?: string };
  results?: Attempt[];
}

interface Spec {
  title: string;
  tests?: TestResult[];
  file?: string;
  line?: number;
}

interface Suite {
  title?: string;
  file?: string;
  specs?: Spec[];
  suites?: Suite[];
}

interface PlaywrightJsonReport {
  suites?: Suite[];
  stats?: {
    startTime?: string;
    duration?: number;
    expected?: number;
    unexpected?: number;
    flaky?: number;
    skipped?: number;
  };
}

/** The analyser's verdict for a single scenario. */
export type Verdict = 'pass' | 'flaky' | 'failed' | 'skipped';

export interface ScenarioOutcome {
  /** file > describe chain > title, stable enough to grep for in CI. */
  id: string;
  verdict: Verdict;
  attempts: number;
  /** e.g. ['failed', 'passed'] - makes the retry visible in the report. */
  attemptStatuses: string[];
  durationMs: number;
  error?: string;
}

export interface AnalysisResult {
  total: number;
  passed: number;
  flaky: number;
  failed: number;
  skipped: number;
  scenarios: ScenarioOutcome[];
  durationMs: number;
}

/** Walk the nested suite tree and flatten every spec into one list. */
function collectSpecs(report: PlaywrightJsonReport): ScenarioOutcome[] {
  const outcomes: ScenarioOutcome[] = [];

  const walk = (suite: Suite, chain: string[]): void => {
    // A spec's own title is appended by the caller, so only the describe
    // titles are carried down the chain. A root suite has no title.
    const nextChain = suite.title ? [...chain, suite.title] : chain;
    const file = suite.file ?? '';

    for (const spec of suite.specs ?? []) {
      const attempts: Attempt[] = (spec.tests ?? []).flatMap((t) => t.results ?? []);
      const attemptStatuses = attempts.map((a) => a.status);
      const durationMs = attempts.reduce((sum, a) => sum + (a.duration ?? 0), 0);
      const lastError = attempts.find((a) => a.status === 'failed')?.error?.message;

      let verdict: Verdict;
      if (attempts.length === 0) {
        verdict = 'skipped';
      } else if (attemptStatuses.every((s) => s === 'skipped')) {
        verdict = 'skipped';
      } else if (attemptStatuses[attemptStatuses.length - 1] === 'passed') {
        // Passed last. Flaky only if something failed along the way.
        verdict = attemptStatuses.some((s) => s === 'failed') ? 'flaky' : 'pass';
      } else {
        verdict = 'failed';
      }

      // bddgen puts the feature path into the describe title, so joining
      // `file` as well prints it twice. Use the chain, and fall back to the
      // file only when there is no chain at all.
      const label = nextChain.length > 0 ? nextChain.join(' > ') : file;
      outcomes.push({
        id: [label, spec.title].filter(Boolean).join(' > '),
        verdict,
        attempts: attempts.length,
        attemptStatuses,
        durationMs,
        error: verdict === 'failed' ? lastError : undefined,
      });
    }

    for (const child of suite.suites ?? []) {
      walk(child, nextChain);
    }
  };

  for (const suite of report.suites ?? []) {
    walk(suite, []);
  }
  return outcomes;
}

function analyse(): AnalysisResult {
  const reportPath = path.resolve(
    config.retryAnalyser.reportDir,
    config.retryAnalyser.reportFile,
  );

  if (!fs.existsSync(reportPath)) {
    throw new Error(
      `Retry analyser could not find the Playwright JSON report at ${reportPath}. ` +
        `Make sure the "json" reporter is enabled in playwright.config.ts.`,
    );
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as PlaywrightJsonReport;
  const scenarios = collectSpecs(report);

  return {
    total: scenarios.length,
    passed: scenarios.filter((s) => s.verdict === 'pass').length,
    flaky: scenarios.filter((s) => s.verdict === 'flaky').length,
    failed: scenarios.filter((s) => s.verdict === 'failed').length,
    skipped: scenarios.filter((s) => s.verdict === 'skipped').length,
    scenarios,
    durationMs: report.stats?.duration ?? 0,
  };
}

/** Build the plain-text report a human reads in the CI console. */
function renderReport(result: AnalysisResult): string {
  const lines: string[] = [];
  const seconds = (result.durationMs / 1000).toFixed(1);

  lines.push('Retry analyser report');
  lines.push('=====================');
  lines.push(`Retries per test : ${config.execution.retries}`);
  lines.push(`Run duration     : ${seconds}s`);
  lines.push('');
  lines.push(`Scenarios  : ${result.total}`);
  lines.push(`Passed     : ${result.passed}  (green on the first attempt)`);
  lines.push(`Flaky      : ${result.flaky}  (passed only after a retry)`);
  lines.push(`Failed     : ${result.failed}  (failed every attempt)`);
  if (result.skipped > 0) {
    lines.push(`Skipped    : ${result.skipped}`);
  }
  lines.push('');

  const flaky = result.scenarios.filter((s) => s.verdict === 'flaky');
  if (flaky.length > 0) {
    lines.push('FLAKY - these passed, but only after a retry. They are hiding a');
    lines.push('real instability, so treat them as defects waiting to surface.');
    for (const s of flaky) {
      lines.push(`    FLAKY  ${s.id}`);
      lines.push(`           attempts: ${s.attemptStatuses.join(' -> ')}`);
    }
    lines.push('');
  }

  const failed = result.scenarios.filter((s) => s.verdict === 'failed');
  if (failed.length > 0) {
    lines.push('FAILED - every attempt failed:');
    for (const s of failed) {
      lines.push(`    FAILED ${s.id}`);
      lines.push(`           attempts: ${s.attemptStatuses.join(' -> ')}`);
      if (s.error) {
        // First line of the Playwright message is the assertion; the rest is
        // the call log, which is noise in this summary.
        lines.push(`           reason  : ${s.error.split('\n')[0]}`);
      }
    }
    lines.push('');
  }

  if (flaky.length === 0 && failed.length === 0) {
    lines.push('No flaky or failed scenarios.');
  }

  return lines.join('\n');
}

function main(): void {
  if (!config.retryAnalyser.enabled) {
    console.log('[retry-analyser] Disabled (ANALYSE_RETRIES=false) - skipping.');
    return;
  }

  let result: AnalysisResult;
  try {
    result = analyse();
  } catch (error) {
    console.error(`[retry-analyser] ${(error as Error).message}`);
    process.exitCode = 1;
    return;
  }

  const report = renderReport(result);
  console.log(report);

  const outDir = path.resolve(config.retryAnalyser.outputDir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'retry-report.txt'), report, 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'retry-summary.json'),
    JSON.stringify(result, null, 2),
    'utf8',
  );
  console.log(`\n[retry-analyser] Wrote ${path.join(outDir, 'retry-report.txt')}`);
  console.log(`[retry-analyser] Wrote ${path.join(outDir, 'retry-summary.json')}`);

  // A retried-then-passed test does NOT fail the build by default: the run is
  // green, and the flakiness is reported above for a human to act on. Set
  // FAIL_ON_FLAKY=true to make flakiness itself a failure.
  if (result.failed > 0) {
    process.exitCode = 1;
  } else if (result.flaky > 0 && config.retryAnalyser.failOnFlaky) {
    console.error(
      `[retry-analyser] ${result.flaky} flaky scenario(s) and FAIL_ON_FLAKY=true`,
    );
    process.exitCode = 1;
  }
}

main();