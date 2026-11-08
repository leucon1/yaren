import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const output = process.argv[2];
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const results = [];
try {
  for (const [device, width, height, cpu] of [
    ['desktop', 1440, 1000, 1],
    ['mobile-emulation', 390, 844, 4],
    ['ultrawide', 3440, 1440, 1],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await page.goto('http://127.0.0.1:5182/');
    await page.getByRole('button', { name: 'Kahve hikâyesini keşfet' }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('.journey-media').dataset.ready === 'true' &&
        document.querySelector('video').readyState >= 2,
    );
    const metrics = await page.evaluate(async () => {
      const section = document.querySelector('.journey-panel');
      const video = document.querySelector('video');
      const top = section.getBoundingClientRect().top + scrollY;
      const travel =
        section.offsetHeight - section.querySelector('.journey-stage').offsetHeight;
      const errors = [];
      const presentationErrors = [];
      const intervals = [];
      const seeks = [];
      let seekStart;
      video.addEventListener('seeking', () => {
        seekStart = performance.now();
      });
      video.addEventListener('seeked', () => {
        if (seekStart !== undefined) seeks.push(performance.now() - seekStart);
      });
      for (const reverse of [false, true]) {
        const start = performance.now();
        let last = start;
        await new Promise((resolve) => {
          const tick = (now) => {
            const p = Math.min(1, (now - start) / 3000);
            const progress = reverse ? 1 - p : p;
            scrollTo({ top: top + travel * progress, behavior: 'instant' });
            intervals.push(now - last);
            last = now;
            errors.push(Math.abs(video.currentTime - Math.min(progress * 10, 239 / 24)));
            const annotation = document.querySelector('.journey-annotation');
            if (annotation)
              presentationErrors.push(
                Math.abs(
                  Number(annotation.dataset.time) - Math.min(progress * 10, 239 / 24),
                ),
              );
            if (p < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
      const p95 = (values) =>
        [...values].sort((a, b) => a - b)[Math.floor(values.length * 0.95)] ?? 0;
      return {
        samples: errors.length,
        p95TimeLagSeconds: p95(errors),
        p95PresentedFrameLagSeconds: p95(presentationErrors),
        p95AnimationFrameMs: p95(intervals),
        p95SeekMs: p95(seeks),
        seeks: seeks.length,
        finalTime: video.currentTime,
        paused: video.paused,
      };
    });
    results.push({ device, cpuSlowdown: cpu, ...metrics });
    await page.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(output, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
