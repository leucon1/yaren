import { test, expect } from '@playwright/test';

async function scrub(page, progress) {
  await page.locator('.journey-panel').evaluate((section, p) => {
    scrollTo({
      top:
        scrollY +
        section.getBoundingClientRect().top +
        (section.offsetHeight - section.querySelector('.journey-stage').offsetHeight) * p,
      behavior: 'instant',
    });
  }, progress);
}

test('pending video keeps all four story stills and captions usable, then seeks to the current progress', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const requests = [];
  await page.route('**/*.mp4', async (route) => {
    requests.push(route.request().url());
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/');
    await scrub(page, 0.2);
    for (const [progress, phase, image] of [
      [0.2, 'ÇEKİRDEK', '02'],
      [0.4, 'CEZVE', '03'],
      [0.65, 'FİNCAN', '04'],
      [0.95, 'PAYLAŞIM', '05'],
      [0.4, 'CEZVE', '03'],
    ]) {
      await scrub(page, progress);
      await expect(page.locator('.journey-caption .eyebrow')).toContainText(phase);
      await expect(page.locator('.journey-video-poster')).toHaveAttribute(
        'src',
        `/video/still-${image}.webp`,
      );
      await expect(page.locator('.journey-video-poster')).toBeVisible();
      expect(
        await page
          .locator('.journey-video-poster')
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      ).toBe(true);
    }
    const before = await page.evaluate(() => scrollY);
    release();
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-fallback',
      'false',
    );
    await expect
      .poll(() => page.locator('video').evaluate((v) => v.currentTime))
      .toBeCloseTo(4, 1);
    expect(await page.evaluate(() => scrollY)).toBe(before);
    await expect(page.locator('.journey-caption .eyebrow')).toContainText('CEZVE');
    expect(requests).toHaveLength(1);
  } finally {
    release();
  }
});

for (const [width, height, format] of [
  [820, 1000, 'portrait'],
  [999, 1000, 'portrait'],
  [1000, 1000, 'landscape'],
  [1001, 1000, 'landscape'],
]) {
  test(`${width}×${height} selects ${format} by viewport orientation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await scrub(page, 0.4);
    await expect(page.locator('.journey-media')).toHaveAttribute('data-format', format);
    await expect(page.locator('.journey-media')).toHaveAttribute('data-ready', 'true');
    expect(
      await page.locator('video').evaluate((v) => v.videoWidth < v.videoHeight),
    ).toBe(format === 'portrait');
  });
}

test('failed download keeps the reversible still story and working page navigation', async ({
  page,
}) => {
  await page.route('**/*.mp4', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  );
  await page.goto('/');
  await scrub(page, 0.65);
  await expect(page.locator('.journey-status')).toContainText('Medya yüklenemedi');
  await expect(page.locator('.journey-caption .eyebrow')).toContainText('FİNCAN');
  await scrub(page, 0.4);
  await expect(page.locator('.journey-caption .eyebrow')).toContainText('CEZVE');
  await expect(page.locator('.journey-video-poster')).toHaveAttribute(
    'src',
    '/video/still-03.webp',
  );
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
  await page.getByRole('link', { name: 'Hikâyemiz', exact: true }).first().click();
  await expect(page.locator('#hikayemiz')).toBeInViewport();
});

test('a missing still does not block video readiness', async ({ page }) => {
  await page.route('**/video/still-03.webp', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );
  await page.goto('/');
  await scrub(page, 0.4);
  await expect(page.locator('.journey-media')).toHaveAttribute('data-fallback', 'false');
  await expect
    .poll(() => page.locator('video').evaluate((v) => v.currentTime))
    .toBeCloseTo(4, 1);
});

test('mobile menu and direct navigation remain usable while video is pending', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/*.mp4', async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  try {
    await page.goto('/');
    await scrub(page, 0.65);
    await expect(page.locator('.journey-media')).toHaveAttribute('data-fallback', 'true');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.getByRole('button', { name: 'Menü' }).click();
    await page.locator('#main-nav').getByRole('link', { name: 'İletişim' }).click();
    await expect(page.locator('#iletisim')).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Menü' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  } finally {
    release();
  }
});
