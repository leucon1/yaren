import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('Sites HTTP200 video remains seekable forward/backward and releases its buffer on teardown', async ({
  page,
}) => {
  const bytes = await fs.readFile('public/video/yaren-scroll.mp4');
  await page.route('**/video/yaren-scroll.mp4', (route) =>
    route.fulfill({ status: 200, contentType: 'video/mp4', body: bytes }),
  );
  await page.addInitScript(() => {
    window.videoBuffers = [];
    window.releasedBuffers = [];
    const create = URL.createObjectURL.bind(URL),
      revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      window.videoBuffers.push(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      window.releasedBuffers.push(url);
      revoke(url);
    };
  });
  await page.goto('/');
  await page.locator('.journey-discover').click();
  await expect(page.locator('.journey-media')).toHaveAttribute('data-ready', 'true');
  for (const time of [0.5, 4, 9.5, 4, 0]) {
    await page.locator('.journey-panel').evaluate((el, t) => {
      const top = scrollY + el.getBoundingClientRect().top;
      scrollTo({
        top: top + ((el.offsetHeight - innerHeight) * t) / 10,
        behavior: 'instant',
      });
    }, time);
    await expect
      .poll(() =>
        page.locator('.journey-annotation').evaluate((el) => Number(el.dataset.time)),
      )
      .toBeCloseTo(time, 1);
    expect(
      await page
        .locator('video')
        .evaluate((v) => v.paused && v.seekable.length > 0 && v.seekable.end(0) > 9),
    ).toBe(true);
  }
  expect(await page.locator('video').evaluate((v) => v.currentSrc)).toMatch(/^blob:/);
  const time = await page.locator('video').evaluate((v) => v.currentTime);
  await page.waitForTimeout(200);
  expect(await page.locator('video').evaluate((v) => v.currentTime)).toBe(time);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('video')).toHaveCount(0);
  expect(await page.evaluate(() => window.releasedBuffers)).toEqual(
    await page.evaluate(() => window.videoBuffers),
  );
});
