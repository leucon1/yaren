import { test, expect } from '@playwright/test';

for (const [width, height, source] of [
  [390, 844, '/video/yaren-scroll-portrait.mp4'],
  [1920, 1080, '/video/yaren-scroll.mp4'],
]) {
  test(`${width}px: one paused video prepares after the critical hero, without scrolling`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const requests = [];
    await page.route('**/images/hero-ritual*', async (route) => {
      await gate;
      await route.continue().catch(() => {});
    });
    page.on('request', (request) => {
      if (request.url().endsWith('.mp4')) requests.push(new URL(request.url()).pathname);
    });
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      expect(requests).toEqual([]);
      release();
      await page.locator('.hero img').evaluate((img) => img.decode());
      await expect.poll(() => requests).toEqual([source]);
      await expect(page.locator('.journey-media')).toHaveAttribute(
        'data-fallback',
        'false',
      );
      await expect(page.locator('video')).toHaveJSProperty('paused', true);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await expect(
        page.getByRole('navigation', { name: 'Sinematik sahneler' }),
      ).toHaveCount(0);
      await expect(page.locator('.journey-brand img')).toHaveCount(0);
    } finally {
      release();
    }
  });
}

test('reduced motion never prepares either video, even after waiting and visiting the story', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.mp4')) requests.push(request.url());
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  await page.locator('#kahve-yolculugu').scrollIntoViewIfNeeded();
  await expect(page.locator('.journey-reduced')).toBeVisible();
  await expect(page.locator('.journey-stops')).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('rapid cold entry uses every still and hands off at the current stop without resetting scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests = [];
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/*.mp4', async (route) => {
    requests.push(new URL(route.request().url()).pathname);
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
    const buttons = page.locator('.journey-stops button');
    for (const phase of [0, 1, 2, 3, 1, 2]) {
      await buttons.nth(phase).click();
      await expect(buttons.nth(phase)).toHaveAttribute('aria-current', 'step');
      await expect(page.locator('.journey-video-poster')).toHaveAttribute(
        'src',
        `/video/still-0${phase + 2}.webp`,
      );
      expect(
        await page
          .locator('.journey-video-poster')
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      ).toBe(true);
      await expect(page.locator('.journey-media')).toHaveAttribute(
        'data-fallback',
        'true',
      );
    }
    await expect
      .poll(() => page.locator('.journey-media').evaluate((el) => +el.dataset.progress))
      .toBeCloseTo(0.575, 3);
    const before = await page.evaluate(() => scrollY);
    release();
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-fallback',
      'false',
    );
    await expect
      .poll(() => page.locator('video').evaluate((v) => v.currentTime))
      .toBeCloseTo(5.75, 1);
    expect(await page.evaluate(() => scrollY)).toBe(before);
    expect(requests).toEqual(['/video/yaren-scroll-portrait.mp4']);
  } finally {
    release();
  }
});

test('a real first-load failure stays visible with usable stills, dots and an exit', async ({
  page,
}) => {
  await page.route('**/*.mp4', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  );
  await page.goto('/');
  await page.locator('.journey-discover').click();
  const status = page.locator('.journey-status');
  await expect(status).toContainText('Medya yüklenemedi');
  expect((await status.boundingBox()).height).toBeGreaterThan(10);
  await page.locator('.journey-stops button').nth(2).click();
  await expect(page.locator('.journey-video-poster')).toHaveAttribute(
    'src',
    '/video/still-04.webp',
  );
  await expect(page.locator('.journey-video-poster')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#kahveler')).toBeFocused();
});

test('rotation during background preparation cancels the obsolete source without entering the story', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests = [];
  const failed = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.mp4')) requests.push(new URL(request.url()).pathname);
  });
  page.on('requestfailed', (request) => {
    if (request.url().endsWith('.mp4')) failed.push(new URL(request.url()).pathname);
  });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/video/yaren-scroll-portrait.mp4', async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  try {
    await page.goto('/');
    await expect.poll(() => requests.length).toBe(1);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-source',
      '/video/yaren-scroll.mp4',
    );
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-fallback',
      'false',
    );
    release();
    await expect.poll(() => failed).toContain('/video/yaren-scroll-portrait.mp4');
    await page.setViewportSize({ width: 900, height: 400 });
    await page.waitForTimeout(300);
    expect(requests).toEqual([
      '/video/yaren-scroll-portrait.mp4',
      '/video/yaren-scroll.mp4',
    ]);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('.journey-stops')).toHaveCount(0);
    await expect(page.locator('video')).toHaveJSProperty('paused', true);
  } finally {
    release();
  }
});
