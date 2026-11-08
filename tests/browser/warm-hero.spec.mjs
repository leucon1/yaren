import { test, expect } from '@playwright/test';

for (const [name, width, height] of [
  ['desktop', 1920, 1080],
  ['ultrawide', 3440, 1440],
  ['vertical', 1080, 1920],
  ['phone', 390, 844],
  ['tablet', 768, 1024],
]) {
  test(`${name}: full opening has one bottom cue, a large focused photo and no cinematic peek`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const videos = [];
    page.on('request', (r) => {
      if (r.url().endsWith('.mp4')) videos.push(r.url());
    });
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));
    });
    const geometry = await page.evaluate(() => {
      const box = (s) => {
        const r = document.querySelector(s).getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          right: r.right,
          bottom: r.bottom,
        };
      };
      return {
        hero: box('.hero'),
        header: box('.header'),
        copy: box('.hero-copy'),
        photo: box('.hero-media'),
        cue: box('.journey-discover'),
        scene: box('.journey-panel'),
        mask: getComputedStyle(document.querySelector('.hero-media')).maskImage,
      };
    });
    expect(geometry.hero.bottom).toBeCloseTo(height, 0);
    expect(geometry.hero.y).toBeCloseTo(geometry.header.bottom, 0);
    expect(geometry.scene.y).toBeGreaterThanOrEqual(height - 0.5);
    expect(geometry.cue.x + geometry.cue.width / 2).toBeCloseTo(width / 2, 0);
    expect(geometry.cue.bottom).toBeGreaterThan(height - 65);
    expect(geometry.cue.bottom).toBeLessThanOrEqual(height - 8);
    expect(geometry.photo.bottom).toBeLessThanOrEqual(geometry.cue.y);
    expect(geometry.mask).toContain('linear-gradient');
    if (width / height > 1.2) expect(geometry.photo.width).toBeGreaterThan(700);
    else expect(geometry.photo.y).toBeGreaterThanOrEqual(geometry.copy.bottom - 1);
    await expect(page.locator('.journey-discover')).toHaveText('KEŞFET ↓');
    await expect(page.locator('.scroll-cue')).toHaveCount(0);
    expect(await page.locator('.hero img').evaluate((img) => img.currentSrc)).toContain(
      'hero-ritual',
    );
    // v11 intentionally prepares one selected source after critical hero assets.
    await expect.poll(() => videos.length).toBe(1);
    expect(videos[0]).toContain(
      width < height ? 'yaren-scroll-portrait.mp4' : 'yaren-scroll.mp4',
    );
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.mouse.wheel(0, Math.round(height * 1.15));
    await expect(page.locator('.journey-media')).toHaveAttribute('data-kind', 'video');
    await expect(page.locator('video')).toHaveJSProperty('paused', true);
  });
}

test('single discovery cue supports keyboard; short screens retain natural access to all content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  const cue = page.getByRole('link', { name: 'KEŞFET', exact: true });
  await cue.focus();
  await expect(cue).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Hikâyeyi atla' })).toBeFocused();
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe(
    'hidden',
  );
});

test('phone height changes keep the opening complete without locking natural scroll', async ({
  page,
}) => {
  await page.goto('/');
  for (const height of [844, 700, 900]) {
    await page.setViewportSize({ width: 390, height });
    await expect
      .poll(() =>
        page.locator('.hero').evaluate((el) => el.getBoundingClientRect().bottom),
      )
      .toBeGreaterThanOrEqual(height);
    expect(
      await page
        .locator('.journey-panel')
        .evaluate((el) => el.getBoundingClientRect().top),
    ).toBeGreaterThanOrEqual(height);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe(
      'hidden',
    );
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
});

test('high-density phone chooses the sharper hero without preloading a second size', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  const images = [];
  page.on('request', (request) => {
    if (request.url().includes('/images/hero-ritual')) images.push(request.url());
  });
  await page.goto('http://127.0.0.1:5180/');
  await page.locator('.hero img').evaluate((img) => img.decode());
  expect(await page.locator('.hero img').evaluate((img) => img.currentSrc)).toContain(
    '/hero-ritual.avif',
  );
  expect(images).toHaveLength(1);
  await context.close();
});
