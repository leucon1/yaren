import { test, expect } from '@playwright/test';
import path from 'node:path';

test('capture the finished continuous journey at desktop, tablet and mobile sizes', async ({
  page,
}) => {
  test.setTimeout(120000);
  const directory = process.env.DELIVERY_SCREENSHOTS_DIR || 'test-results/delivery';
  for (const [device, width, height] of [
    ['desktop', 1440, 1000],
    ['desktop-1920', 1920, 1080],
    ['vertical', 1080, 1920],
    ['ultrawide', 3440, 1440],
    ['tablet', 768, 1024],
    ['tablet-landscape', 1024, 768],
    ['mobile', 390, 844],
    ['small-mobile', 320, 568],
    ['mobile-landscape', 844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) => {
          image.loading = 'eager';
          return image.decode().catch(() => {});
        }),
      );
      await Promise.all(
        document.getAnimations().map((animation) => animation.finished.catch(() => {})),
      );
    });
    await page.getByRole('button', { name: 'Kahve hikâyesini keşfet' }).click();
    const canvas = page.locator('.journey-media');
    await expect(canvas).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
    await page.locator('.journey-frame').evaluate(async (frame) => {
      await Promise.all(
        frame.getAnimations().map((animation) => animation.finished.catch(() => {})),
      );
    });
    for (const [stage, progress] of [
      ['intro', 0],
      [1, 0.24],
      [2, 0.4],
      [3, 0.65],
      [4, 1],
    ]) {
      const actual = await page.locator('.journey-panel').evaluate((section, p) => {
        const top = section.getBoundingClientRect().top + scrollY;
        const travel = section.offsetHeight - innerHeight;
        window.scrollTo({ top: top + travel * p, behavior: 'instant' });
        return Math.max(0, Math.min(1, (scrollY - top) / travel));
      }, progress);
      await expect(canvas).toHaveAttribute('data-progress', actual.toFixed(5));
      await expect
        .poll(() =>
          page
            .locator('.journey-video')
            .evaluate((v) =>
              Math.abs(
                v.currentTime -
                  Math.min(
                    v.duration * Number(v.closest('.journey-media').dataset.progress),
                    239 / 24,
                  ),
              ),
            ),
        )
        .toBeLessThan(0.02);
      await expect
        .poll(() => page.locator('.journey-video').evaluate((v) => v.seeking))
        .toBe(false);
      await expect(page.locator('.journey-annotation')).toHaveAttribute(
        'data-static-frame',
        'false',
      );
      await expect
        .poll(() =>
          page.locator('.journey-annotation').evaluate((el) => Number(el.dataset.time)),
        )
        .toBeCloseTo(Math.min(progress * 10, 239 / 24), 1);
      await page.locator('.journey-annotation').evaluate(async (el) => {
        await Promise.all(
          el
            .getAnimations({ subtree: true })
            .map((animation) => animation.finished.catch(() => {})),
        );
      });
      await page.screenshot({
        path: path.join(directory, `yaren-journey-${device}-${stage}.png`),
      });
    }
    await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
    await expect(page.locator('#kahveler')).toBeFocused();
  }
});
