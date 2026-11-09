import { test, expect } from '@playwright/test';
import sharp from 'sharp';

async function scrub(page, progress) {
  await page.locator('.journey-panel').evaluate(
    (s, p) =>
      scrollTo({
        top:
          scrollY +
          s.getBoundingClientRect().top +
          (s.offsetHeight - s.querySelector('.journey-stage').offsetHeight) * p,
        behavior: 'instant',
      }),
    progress,
  );
}
async function ready(page, progress) {
  await expect(page.locator('.journey-media')).toHaveAttribute('data-fallback', 'false');
  await expect
    .poll(() =>
      page
        .locator('video')
        .evaluate(
          (v, p) => !v.seeking && Math.abs(v.currentTime - p * v.duration) < 0.03,
          progress,
        ),
    )
    .toBe(true);
}
const mask = (page) =>
  page.locator('.journey-frame').evaluate((el) => getComputedStyle(el).maskImage);

for (const [width, height, portrait, direction] of [
  [390, 844, true, 'bottom'],
  [768, 1024, true, 'right'],
  [820, 1000, true, 'right'],
  [1080, 1920, true, null],
  [1024, 768, false, 'landscape'],
  [1920, 1080, false, null],
]) {
  test(`${width}×${height}: approved C fades only the empty edges and preserves the full source`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const requests = [];
    page.on('request', (r) => {
      if (r.url().endsWith('.mp4')) requests.push(new URL(r.url()).pathname);
    });
    await page.goto('/');
    await scrub(page, 0.631);
    await ready(page, 0.631);
    const applied = await mask(page);
    if (direction === 'landscape') {
      expect(applied).toContain('linear-gradient');
      expect(applied).not.toContain('to right');
      expect(applied).toContain('6%');
      expect(
        await page.locator('.journey-frame').evaluate((el) => el.style.maskImage),
      ).toBe('');
    } else if (direction) {
      expect(applied).toContain('linear-gradient');
      if (direction === 'right') expect(applied).toContain('to right');
      else expect(applied).not.toContain('to right');
      expect(applied).toContain('28px');
    } else expect(applied).toBe('none');
    const geometry = await page.locator('.journey-frame').evaluate((frame) => {
      const video = frame.querySelector('video'),
        r = frame.getBoundingClientRect(),
        v = video.getBoundingClientRect();
      return {
        ratio: r.width / r.height,
        width: r.width,
        height: r.height,
        videoWidth: v.width,
        videoHeight: v.height,
        fit: getComputedStyle(video).objectFit,
        transform: getComputedStyle(video).transform,
      };
    });
    expect(geometry.ratio).toBeCloseTo(portrait ? 9 / 16 : 16 / 9, 4);
    expect(geometry.videoWidth).toBe(geometry.width);
    expect(geometry.videoHeight).toBe(geometry.height);
    expect(geometry.fit).toBe('contain');
    expect(geometry.transform).toBe('none');
    expect(requests).toEqual([
      portrait ? '/video/yaren-scroll-portrait.mp4' : '/video/yaren-scroll.mp4',
    ]);
    await expect(page.locator('video')).toHaveCount(1);
    await expect(
      page.getByRole('navigation', { name: 'Sinematik sahneler' }),
    ).toHaveCount(0);
    const before = await page
      .locator('video')
      .evaluate((v) => ({ y: scrollY, time: v.currentTime }));
    await page.waitForTimeout(700);
    expect(
      await page.locator('video').evaluate((v) => ({ y: scrollY, time: v.currentTime })),
    ).toEqual(before);
  });
}

test('pending story stills share the C edge transition through same-source resizing and handoff', async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const requests = [];
  await page.route('**/*.mp4', async (route) => {
    requests.push(new URL(route.request().url()).pathname);
    await gate;
    await route.continue().catch(() => {});
  });
  try {
    await page.goto('/');
    for (const [progress, image] of [
      [0.21, '02'],
      [0.63, '04'],
      [0.92, '05'],
      [0.42, '03'],
    ]) {
      await scrub(page, progress);
      await expect(page.locator('.journey-video-poster')).toHaveAttribute(
        'src',
        `/video/still-${image}.webp`,
      );
      expect(await mask(page)).toContain('to right');
      await expect(page.locator('.journey-ambient')).toBeVisible();
    }
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect.poll(() => mask(page)).toContain('to right');
    const before = await page
      .locator('.journey-media')
      .evaluate((el) => ({ progress: +el.dataset.progress, y: scrollY }));
    release();
    await ready(page, before.progress);
    expect(await page.evaluate(() => scrollY)).toBe(before.y);
    expect(requests).toEqual(['/video/yaren-scroll-portrait.mp4']);
  } finally {
    release();
  }
});

test('rotation updates the feather axis, preserves progress and reuses one source per format', async ({
  page,
}) => {
  const requests = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) requests.push(new URL(r.url()).pathname);
  });
  await page.setViewportSize({ width: 820, height: 1000 });
  await page.goto('/');
  await scrub(page, 0.631);
  await ready(page, 0.631);
  for (const [width, height, direction] of [
    [1080, 1920, null],
    [390, 844, 'bottom'],
    [1024, 768, 'landscape'],
    [820, 1000, 'right'],
  ]) {
    await page.setViewportSize({ width, height });
    await ready(page, 0.631);
    await expect
      .poll(() => mask(page))
      .toContain(
        direction === null
          ? 'none'
          : direction === 'right'
            ? 'to right'
            : 'linear-gradient',
      );
    if (direction === 'landscape')
      expect(
        await page.locator('.journey-frame').evaluate((el) => el.style.maskImage),
      ).toBe('');
    await expect
      .poll(() => page.locator('.journey-media').evaluate((el) => +el.dataset.progress))
      .toBeCloseTo(0.631, 3);
  }
  expect(requests).toEqual([
    '/video/yaren-scroll-portrait.mp4',
    '/video/yaren-scroll.mp4',
  ]);
});

test('C changes the seam pixels while leaving the central video and its geometry intact', async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await page.goto('/');
  await scrub(page, 0.575);
  await ready(page, 0.575);
  await page.waitForTimeout(100);
  const stage = page.locator('.journey-stage');
  const frame = page.locator('.journey-frame');
  const before = await frame.boundingBox();
  const softened = await sharp(await stage.screenshot())
    .removeAlpha()
    .raw()
    .toBuffer();
  await frame.evaluate((el) => {
    el.style.maskImage = 'none';
  });
  const hard = await sharp(await stage.screenshot())
    .removeAlpha()
    .raw()
    .toBuffer();
  expect(await frame.boundingBox()).toEqual(before);
  let edgeDiff = 0,
    centerDiff = 0,
    centerCount = 0;
  for (let y = 300; y < 650; y++)
    for (let x = Math.ceil(before.x); x < before.x + before.width; x++) {
      const offset = (y * 820 + x) * 3;
      const difference = Math.max(
        ...[0, 1, 2].map((c) => Math.abs(softened[offset + c] - hard[offset + c])),
      );
      if (x < before.x + 20 || x > before.x + before.width - 20) {
        if (difference > 3) edgeDiff++;
      } else if (x > before.x + 70 && x < before.x + before.width - 70) {
        centerDiff += difference;
        centerCount++;
      }
    }
  expect(edgeDiff).toBeGreaterThan(1000);
  expect(centerDiff / centerCount).toBeLessThan(0.2);
});
