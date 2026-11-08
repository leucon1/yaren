import { test, expect } from '@playwright/test';
import path from 'node:path';

test('capture recommender invitation, choices, result and focused drink in three sizes', async ({
  page,
}) => {
  test.setTimeout(90000);
  const directory = process.env.DELIVERY_SCREENSHOTS_DIR || 'test-results/delivery';
  for (const [device, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 768, 1024],
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
    await page.getByRole('link', { name: 'Kahveleri Keşfet', exact: true }).click();
    const trigger = page.getByRole('button', {
      name: 'Bugün nasıl hissediyorsun?',
      exact: true,
    });
    await expect(trigger).toBeVisible();
    await page.screenshot({
      path: path.join(directory, 'yaren-recommender-' + device + '-invite.png'),
    });
    await trigger.click();
    const panel = page.getByRole('dialog', { name: 'Bugün nasıl hissediyorsun?' });
    await panel.evaluate(async (el) => {
      await Promise.all(
        el.getAnimations().map((animation) => animation.finished.catch(() => {})),
      );
    });
    await page.screenshot({
      path: path.join(directory, 'yaren-recommender-' + device + '-choices.png'),
    });
    await panel.getByRole('button', { name: 'Biraz yorgunum.', exact: true }).click();
    await expect(panel.getByRole('heading', { name: /Espresso/ })).toBeVisible();
    await page.screenshot({
      path: path.join(directory, 'yaren-recommender-' + device + '-result.png'),
    });
    await panel.getByRole('link', { name: 'Kahveyi Gör', exact: true }).click();
    await expect(page.locator('#kahve-espresso')).toHaveClass(/is-recommended/);
    await page.screenshot({
      path: path.join(directory, 'yaren-recommender-' + device + '-drink.png'),
    });
  }
});
