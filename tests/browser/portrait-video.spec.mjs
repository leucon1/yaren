import { test, expect, devices, webkit } from '@playwright/test';
import path from 'node:path';

const sizes = [
  ['iphone', 390, 844],
  ['large-phone', 430, 932],
  ['tablet-portrait', 768, 1024],
  ['tablet-landscape', 1024, 768],
  ['portrait-monitor', 1080, 1920],
  ['desktop', 1920, 1080],
  ['ultrawide', 3440, 1440],
];
const url = process.env.PORTRAIT_SITE_URL || '/';
const screenshotDirectory =
  process.env.PORTRAIT_SCREENSHOTS_DIR || 'test-results/portrait-video';

async function scrub(page, progress) {
  await page.locator('.journey-panel').evaluate((section, p) => {
    const top = section.getBoundingClientRect().top + scrollY;
    const travel =
      section.offsetHeight - section.querySelector('.journey-stage').offsetHeight;
    scrollTo({ top: top + travel * p, behavior: 'instant' });
  }, progress);
}

async function settled(page, progress) {
  await expect(page.locator('.journey-media')).toHaveAttribute('data-ready', 'true');
  await expect
    .poll(() =>
      page
        .locator('video')
        .evaluate(
          (v, p) =>
            Math.abs(v.currentTime - Math.min(p * v.duration, v.duration - 1 / 24)),
          progress,
        ),
    )
    .toBeLessThan(0.03);
  await expect.poll(() => page.locator('video').evaluate((v) => v.seeking)).toBe(false);
}

for (const [name, width, height] of sizes) {
  test(`${name}: viewport selects one source and scrubs both ways with stable layout`, async ({
    page,
  }) => {
    const errors = [],
      videos = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    page.on('request', (r) => {
      if (r.url().endsWith('.mp4')) videos.push(new URL(r.url()).pathname);
    });
    await page.setViewportSize({ width, height });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    // Preparation now starts after hero decode, before the first scroll.
    await page.locator('.hero img').evaluate((img) => img.decode());
    await expect.poll(() => videos.length).toBe(1);
    const openingBottom = await page
      .locator('.hero')
      .evaluate((el) => el.getBoundingClientRect().bottom);
    expect(openingBottom).toBeCloseTo(height, 0);
    await page.screenshot({
      path: path.join(screenshotDirectory, `${name}-hero.png`),
    });
    const portrait = width < height;
    const src = portrait ? '/video/yaren-scroll-portrait.mp4' : '/video/yaren-scroll.mp4';
    await scrub(page, 0);
    await settled(page, 0);
    await expect(page.locator('.journey-media')).toHaveAttribute('data-source', src);
    await expect(page.locator('.journey-brand img')).toHaveAttribute(
      'src',
      '/images/yaren-logo.png',
    );
    await expect(page.locator('.journey-brand')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: path.join(screenshotDirectory, `${name}-intro.png`) });
    for (const [progress, phase] of [
      [0.2, 'ÇEKİRDEK'],
      [0.4, 'CEZVE'],
      [0.65, 'FİNCAN'],
      [0.95, 'PAYLAŞIM'],
      [0.4, 'CEZVE'],
      [0, null],
    ]) {
      await scrub(page, progress);
      await settled(page, progress);
      if (phase)
        await expect(page.locator('.journey-caption .eyebrow')).toContainText(phase);
      const geometry = await page.locator('.journey-caption').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      });
      expect(geometry.left).toBeGreaterThanOrEqual(16);
      expect(geometry.right).toBeLessThanOrEqual(width - 16);
      expect(geometry.top).toBeGreaterThanOrEqual(65);
      expect(geometry.bottom).toBeLessThanOrEqual(height - 20);
      if (progress === 0.4 || progress === 0.95) {
        await page.screenshot({
          path: path.join(screenshotDirectory, `${name}-${phase}.png`),
        });
      }
    }
    expect(videos).toEqual([src]);
    const dimensions = await page
      .locator('video')
      .evaluate((v) => [v.videoWidth, v.videoHeight]);
    expect(dimensions).toEqual(portrait ? [1080, 1920] : [1280, 720]);
    const frame = await page.locator('.journey-frame').boundingBox();
    expect(frame.width / frame.height).toBeCloseTo(portrait ? 9 / 16 : 16 / 9, 2);
    expect(frame.x).toBeGreaterThanOrEqual(-1);
    expect(frame.x + frame.width).toBeLessThanOrEqual(width + 1);
    if (portrait) await expect(page.locator('.journey-ambient')).not.toBeVisible();
    const time = await page.locator('video').evaluate((v) => v.currentTime);
    await page.waitForTimeout(180);
    expect(await page.locator('video').evaluate((v) => v.currentTime)).toBe(time);
    expect(
      await page
        .locator('video')
        .evaluate((v) => v.paused && v.muted && v.playsInline && !v.autoplay),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('rotation preserves progress, holds a real frame while loading and reuses the source cache', async ({
  page,
}) => {
  const requested = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) requested.push(new URL(r.url()).pathname);
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await scrub(page, 0.65);
  await settled(page, 0.65);
  let release;
  const delayed = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/video/yaren-scroll.mp4', async (route) => {
    await delayed;
    await route.continue();
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.journey-media')).toHaveAttribute('data-holding', 'true');
  await expect(page.locator('.journey-canvas')).toBeVisible();
  await expect
    .poll(() =>
      page.locator('.journey-media').evaluate((el) => Number(el.dataset.progress)),
    )
    .toBeCloseTo(0.65, 2);
  release();
  await settled(page, 0.65);
  await expect(page.locator('.journey-media')).toHaveAttribute(
    'data-source',
    '/video/yaren-scroll.mp4',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await settled(page, 0.65);
  await expect(page.locator('.journey-media')).toHaveAttribute(
    'data-source',
    '/video/yaren-scroll-portrait.mp4',
  );
  await page.setViewportSize({ width: 430, height: 932 });
  await settled(page, 0.65);
  expect(requested).toEqual([
    '/video/yaren-scroll-portrait.mp4',
    '/video/yaren-scroll.mp4',
  ]);
});

test('iPhone WebKit emulation seeks when H.264 is supported, otherwise retains its accessible poster', async () => {
  const browser = await webkit.launch({ executablePath: webkit.executablePath() });
  try {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      baseURL: 'http://127.0.0.1:5180',
    });
    const page = await context.newPage();
    await page.goto(url);
    await scrub(page, 0.4);
    await expect
      .poll(() => page.locator('.journey-media').getAttribute('data-kind'))
      .toMatch(/video|poster/);
    await expect
      .poll(() =>
        page.locator('video').evaluate((v) => v.readyState >= 2 || v.error?.code === 4),
      )
      .toBe(true);
    const unsupported = await page.locator('video').evaluate((v) => v.error?.code === 4);
    if (unsupported) {
      test.info().annotations.push({
        type: 'codec limitation',
        description:
          'Windows WebKit rejects both approved H.264 files (MEDIA_ERR_SRC_NOT_SUPPORTED); this branch verifies the static fallback, not iOS seeking.',
      });
      await expect(page.locator('.journey-media')).toHaveAttribute('data-kind', 'poster');
      await expect(page.locator('.journey-video-poster')).toBeVisible();
      await expect(page.locator('.journey-status')).toContainText('Medya yüklenemedi');
      await page.keyboard.press('Escape');
      await expect(page.locator('#kahveler')).toBeFocused();
      return;
    }
    for (const progress of [0, 0.4, 0.95, 0.4, 0]) {
      await scrub(page, progress);
      await settled(page, progress);
    }
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-source',
      '/video/yaren-scroll-portrait.mp4',
    );
    await page.screenshot({
      path: path.join(screenshotDirectory, 'webkit-iphone-intro.png'),
    });
  } finally {
    await browser.close();
  }
});

test('same-width aspect changes preserve progress while ordinary same-format resizes do not refetch', async ({
  page,
}) => {
  const videos = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.mp4')) videos.push(request.url());
  });
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(url);
  await scrub(page, 0.62);
  await settled(page, 0.62);
  await page.setViewportSize({ width: 768, height: 850 });
  await settled(page, 0.62);
  expect(videos).toHaveLength(1);
  await page.setViewportSize({ width: 768, height: 768 });
  await expect(page.locator('.journey-media')).toHaveAttribute(
    'data-source',
    '/video/yaren-scroll.mp4',
  );
  await settled(page, 0.62);
  await expect
    .poll(() =>
      page.locator('.journey-media').evaluate((el) => Number(el.dataset.progress)),
    )
    .toBeCloseTo(0.62, 2);
  const source = await page.locator('video').evaluate((video) => video.currentSrc);
  await page.setViewportSize({ width: 768, height: 700 });
  await settled(page, 0.62);
  expect(await page.locator('video').evaluate((video) => video.currentSrc)).toBe(source);
  expect(videos).toHaveLength(2);
});

test('real metadata duration maps to the same normalized narrative moment', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      'duration',
    );
    Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
      get() {
        return descriptor.get.call(this) * 0.8;
      },
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await scrub(page, 0.4);
  await settled(page, 0.4);
  await expect
    .poll(() =>
      page.locator('.journey-annotation').evaluate((el) => Number(el.dataset.time)),
    )
    .toBeCloseTo(4, 1);
  await expect(page.locator('.journey-caption .eyebrow')).toContainText('CEZVE');
});

test('rapid rotation aborts an obsolete source and keeps the latest seek and one decoder', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await scrub(page, 0.4);
  await settled(page, 0.4);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/video/yaren-scroll.mp4', async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.journey-media')).toHaveAttribute('data-holding', 'true');
  await page.setViewportSize({ width: 390, height: 844 });
  await settled(page, 0.4);
  await scrub(page, 0.65);
  release();
  await settled(page, 0.65);
  await expect(page.locator('.journey-media')).toHaveAttribute(
    'data-source',
    '/video/yaren-scroll-portrait.mp4',
  );
  await expect(page.locator('video')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('failed replacement retains a visual, current narrative and working exit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await scrub(page, 0.65);
  await settled(page, 0.65);
  await page.route('**/video/yaren-scroll.mp4', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  );
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.journey-status')).toContainText('Medya yüklenemedi');
  await expect(page.locator('.journey-media')).toHaveAttribute('data-holding', 'true');
  await expect(page.locator('.journey-canvas')).toBeVisible();
  await expect(page.locator('.journey-caption .eyebrow')).toContainText('FİNCAN');
  await page.keyboard.press('Escape');
  await expect(page.locator('#kahveler')).toBeFocused();
});

test('landscape to portrait holds one frozen image during delayed or failed replacement', async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await scrub(page, 0.65);
  await settled(page, 0.65);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/video/yaren-scroll-portrait.mp4', async (route) => {
    await gate;
    await route.fulfill({ status: 503, body: 'unavailable' });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.journey-media')).toHaveAttribute('data-holding', 'true');
  await expect(page.locator('.journey-canvas')).toBeVisible();
  await expect(page.locator('.journey-video-poster')).not.toBeVisible();
  await expect(page.locator('.journey-ambient')).not.toBeVisible();
  release();
  await expect(page.locator('.journey-status')).toContainText('Medya yüklenemedi');
  await expect(page.locator('.journey-canvas')).toBeVisible();
  await expect(page.locator('.journey-video-poster')).not.toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#kahveler')).toBeFocused();
});
