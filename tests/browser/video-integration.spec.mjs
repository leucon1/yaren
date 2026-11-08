import { test, expect } from '@playwright/test';

export async function scrub(page, progress) {
  await page.locator('.journey-panel').evaluate((section, p) => {
    const top = section.getBoundingClientRect().top + scrollY;
    const viewport = section.querySelector('.journey-stage').offsetHeight;
    scrollTo({ top: top + (section.offsetHeight - viewport) * p, behavior: 'instant' });
  }, progress);
}

test('natural entry keeps opening photograph separate and does not steal initial focus or download video', async ({
  page,
}) => {
  const videos = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) videos.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('.journey-panel')).toHaveCount(1);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(videos).toEqual([]);
  await expect(page.locator('.hero-media img')).toHaveAttribute(
    'src',
    '/images/hero-ritual.webp',
  );
  await scrub(page, 0.1);
  await expect(page.locator('.journey-media')).toHaveAttribute('data-kind', 'video');
  await expect(page.locator('.journey-media img')).toHaveAttribute(
    'src',
    '/video/still-01.webp',
  );
  await expect(page.locator('.journey-video')).toHaveJSProperty('paused', true);
});

for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
  ['small', 320, 568],
  ['landscape', 844, 390],
]) {
  test(`${name}: real MP4 follows scroll in both directions, holds and keeps all objects in frame`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const video = page.locator('.journey-video');
    for (const [p, title] of [
      [0.2, 'Her hikâyenin bir başlangıcı vardır.'],
      [0.38, 'Geçmişten gelen bir sıcaklık.'],
      [0.63, 'Hayata küçük bir ara.'],
      [1, 'Her fincanda ortak bir hikâye.'],
      [0.38, 'Geçmişten gelen bir sıcaklık.'],
      [0, 'Her hikâyenin bir başlangıcı vardır.'],
    ]) {
      await scrub(page, p);
      await expect(page.locator('.journey-media')).toHaveAttribute('data-ready', 'true');
      await expect
        .poll(async () =>
          Math.abs(
            (await video.evaluate((v) => v.currentTime)) - Math.min(p * 10, 239 / 24),
          ),
        )
        .toBeLessThan(0.02);
      await expect.poll(() => video.evaluate((v) => v.seeking)).toBe(false);
      await expect(page.locator('.journey-caption h2')).toHaveText(title);
      expect(
        await video.evaluate((v) => v.paused && !v.autoplay && v.playsInline && v.muted),
      ).toBe(true);
    }
    await scrub(page, 0.63);
    await expect.poll(() => video.evaluate((v) => v.currentTime)).toBeGreaterThan(6.2);
    const before = await video.evaluate((v) => v.currentTime);
    await page.waitForTimeout(250);
    expect(await video.evaluate((v) => v.currentTime)).toBe(before);
    const frame = await page.locator('.journey-frame').boundingBox();
    const caption = await page.locator('.journey-caption').boundingBox();
    expect(caption.y).toBeGreaterThanOrEqual(65);
    expect(caption.y + caption.height).toBeLessThanOrEqual(height - 20);
    expect(frame.width / frame.height).toBeCloseTo(width < height ? 9 / 16 : 16 / 9, 2);
    expect(frame.x).toBeGreaterThanOrEqual(0);
    expect(frame.x + frame.width).toBeLessThanOrEqual(width + 1);
    expect(await video.evaluate((v) => getComputedStyle(v).objectFit)).toBe('contain');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
  });
}

test('menu skips animation without fetching MP4, and reverse scrolling can enter it later', async ({
  page,
}) => {
  const videos = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) videos.push(r.url());
  });
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Kahvelerimiz' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
  expect(videos).toEqual([]);
  await scrub(page, 0.9);
  await expect(page.locator('.journey-media')).toHaveAttribute('data-kind', 'video');
  await expect
    .poll(() => page.locator('.journey-video').evaluate((v) => v.currentTime))
    .toBeGreaterThan(8.9);
});

test('stopping exactly at a milestone leaves its caption readable', async ({ page }) => {
  await page.goto('/');
  for (const progress of [0.3, 0.5, 0.75]) {
    await scrub(page, progress);
    await expect
      .poll(() =>
        page
          .locator('.journey-caption')
          .evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBeGreaterThanOrEqual(0.75);
  }
});

test('rotating a phone preserves the current video moment instead of exiting the story', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await scrub(page, 0.65);
  await expect
    .poll(() => page.locator('video').evaluate((v) => v.currentTime))
    .toBeGreaterThan(6.4);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect
    .poll(() =>
      page.locator('.journey-media').evaluate((el) => Number(el.dataset.progress)),
    )
    .toBeCloseTo(0.65, 2);
  await expect
    .poll(() => page.locator('video').evaluate((v) => v.currentTime))
    .toBeGreaterThan(6.4);
  await expect
    .poll(() => page.locator('video').evaluate((v) => v.currentTime))
    .toBeLessThan(6.6);
  await expect(page.locator('.journey-caption h2')).toHaveText('Hayata küçük bir ara.');
});

for (const id of ['kahveler', 'hikayemiz', 'iletisim', 'kahve-turkish']) {
  test(`fresh fragment /#${id} reaches its destination without playing the story`, async ({
    page,
  }) => {
    const videos = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.mp4')) videos.push(request.url());
    });
    await page.goto('/#' + id);
    await expect(page.locator('#' + id)).toBeFocused();
    await expect(page.locator('#' + id)).toBeInViewport();
    expect(videos).toEqual([]);
  });
}
