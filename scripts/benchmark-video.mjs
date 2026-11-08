import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const results = {};
try {
  for (const file of process.argv.slice(2)) {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5180/');
    results[file] = await page.evaluate(async (src) => {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      document.body.append(video);
      const loaded = new Promise((resolve, reject) => {
        video.onloadeddata = resolve;
        video.onerror = reject;
      });
      video.src = src;
      await loaded;
      const samples = [];
      for (const time of [1, 3, 5, 7, 9.9, 7, 4, 1, 8, 2, 9, 3]) {
        const start = performance.now();
        await new Promise((resolve) => {
          video.onseeked = resolve;
          video.currentTime = time;
        });
        samples.push(performance.now() - start);
      }
      return {
        duration: video.duration,
        samples,
        mean: samples.reduce((a, b) => a + b, 0) / samples.length,
        max: Math.max(...samples),
      };
    }, file);
    await page.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile('docs/video-seek-benchmark.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
