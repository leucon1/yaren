import fs from 'node:fs/promises';
import path from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const [url, directory, label = 'experimental'] = process.argv.slice(2);
if (!url || !directory)
  throw new Error(
    'Usage: node scripts/audit-performance.mjs <local-url> <output-directory> [label]',
  );
if (new URL(url).hostname !== '127.0.0.1') throw new Error('This audit is local-only.');
await fs.mkdir(directory, { recursive: true });
const results = [];
for (const device of ['mobile', 'desktop']) {
  const chrome = await chromeLauncher.launch({
    chromePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    chromeFlags: ['--headless=new', '--disable-extensions', '--no-first-run'],
    logLevel: 'silent',
  });
  try {
    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: ['json', 'html'],
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      device === 'desktop' ? desktopConfig : undefined,
    );
    const reports = Array.isArray(result.report) ? result.report : [result.report];
    await fs.writeFile(path.join(directory, `${label}-${device}.json`), reports[0]);
    await fs.writeFile(path.join(directory, `${label}-${device}.html`), reports[1]);
    const { lhr } = result;
    const row = {
      label,
      device,
      lighthouse: lhr.lighthouseVersion,
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      fcp: lhr.audits['first-contentful-paint'].numericValue,
      lcp: lhr.audits['largest-contentful-paint'].numericValue,
      tbt: lhr.audits['total-blocking-time'].numericValue,
      cls: lhr.audits['cumulative-layout-shift'].numericValue,
      bytes: lhr.audits['total-byte-weight'].numericValue,
      settings: lhr.configSettings,
    };
    results.push(row);
    console.log(JSON.stringify({ ...row, settings: undefined }));
  } finally {
    await chrome.kill();
  }
}
await fs.writeFile(
  path.join(directory, `${label}-summary.json`),
  JSON.stringify(results, null, 2),
);
