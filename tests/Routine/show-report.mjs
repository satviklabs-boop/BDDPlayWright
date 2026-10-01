import { readdirSync, statSync, renameSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const htmlFiles = readdirSync('playwright-report')
  .filter((f) => f.endsWith('.html'))
  .sort(
    (a, b) =>
      statSync(`playwright-report/${b}`).mtimeMs -
      statSync(`playwright-report/${a}`).mtimeMs,
  );

if (htmlFiles.length === 0) {
  console.error('No HTML report found in playwright-report/. Run tests first.');
  process.exit(1);
}

const latestFile = htmlFiles[0];
const needsTempRename = latestFile !== 'index.html';

if (needsTempRename) {
  renameSync(`playwright-report/${latestFile}`, 'playwright-report/index.html');
}

console.log(`Opening ${latestFile}`);

const result = spawnSync('npx', ['playwright', 'show-report', 'playwright-report'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

// Restore the original filename after show-report exits
if (needsTempRename && existsSync('playwright-report/index.html')) {
  renameSync('playwright-report/index.html', `playwright-report/${latestFile}`);
}

process.exit(result.status ?? 0);
