import { test, expect } from '@playwright/test';

test('footer copy stays clear of the fixed recommender on narrow and tablet screens', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 820, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.evaluate(() =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    await expect(page.locator('.recommender-launch')).toBeVisible();
    const overlap = await page.evaluate(() => {
      const a = document
          .querySelector('.footer-bottom > span:last-child')
          .getBoundingClientRect(),
        b = document.querySelector('.recommender-launch').getBoundingClientRect();
      return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    });
    expect(overlap, `${width}px footer obscured`).toBe(false);
  }
});

test('loading status is available to assistive technology without a visible technical banner', async ({
  page,
}) => {
  let release;
  const gate = new Promise((r) => {
    release = r;
  });
  await page.route('**/*.mp4', async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  try {
    await page.goto('/');
    await page.locator('.journey-discover').click();
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-still-ready',
      'true',
    );
    const status = page.locator('.journey-status');
    await expect(status).toHaveAttribute('role', 'status');
    const box = await status.boundingBox();
    expect(box.width).toBeLessThanOrEqual(1);
    expect(box.height).toBeLessThanOrEqual(1);
    await expect(page.locator('.journey-video-poster')).toBeVisible();
  } finally {
    release();
  }
});
