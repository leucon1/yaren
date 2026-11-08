import { test } from '@playwright/test';
import path from 'node:path';

test('capture stable delivery views', async ({ page }) => {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['desktop-1920', 1920, 1080],
    ['ultrawide', 3440, 1440],
    ['vertical', 1080, 1920],
    ['small-phone', 320, 568],
    ['phone-landscape', 844, 390],
    ['tablet', 768, 1024],
    ['tablet-650', 650, 1000],
    ['tablet-900', 900, 1000],
    ['tablet-1024', 1024, 1000],
    ['mobile', 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((img) => {
          img.loading = 'eager';
          return img.decode().catch(() => {});
        }),
      );
      await Promise.all(
        document.getAnimations().map((animation) => animation.finished.catch(() => {})),
      );
    });
    const directory = process.env.DELIVERY_SCREENSHOTS_DIR || 'test-results/delivery';
    await page.screenshot({
      path: path.join(directory, `yaren-${name}.png`),
      fullPage: true,
    });
    await page.screenshot({ path: path.join(directory, `yaren-${name}-hero.png`) });
    if (name === 'desktop')
      await page.screenshot({ path: path.join(directory, 'yaren-hero-onizleme.png') });
  }
});
