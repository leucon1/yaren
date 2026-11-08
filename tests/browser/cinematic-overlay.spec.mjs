import { test, expect } from '@playwright/test';

async function scrub(page, time) {
  await page.locator('.journey-panel').evaluate((section, t) => {
    const top = section.getBoundingClientRect().top + scrollY;
    scrollTo({
      top:
        top +
        ((section.offsetHeight - section.querySelector('.journey-stage').offsetHeight) *
          t) /
          10,
      behavior: 'instant',
    });
  }, time);
  await expect(page.locator('.journey-media')).toHaveAttribute('data-kind', 'video');
  await expect(page.locator('.journey-annotation')).toHaveAttribute(
    'data-static-frame',
    'false',
  );
  await expect.poll(() => page.locator('video').evaluate((v) => v.seeking)).toBe(false);
  await expect
    .poll(() =>
      page.locator('.journey-annotation').evaluate((el) => Number(el.dataset.time)),
    )
    .toBeCloseTo(time, 1);
}

// Independent interior object windows inspected in the approved source video.
const scenes = [
  [
    2,
    'Her hikâyenin bir başlangıcı vardır.',
    'Bizimki, sıradan bir anı özel kılma fikriyle başlıyor.',
    [270, 450, 330, 500],
  ],
  [
    4,
    'Geçmişten gelen bir sıcaklık.',
    'Yâren, köklü kahve kültürünün samimiyetini bugünün dünyasına taşır.',
    [370, 220, 500, 370],
  ],
  [
    6,
    'Hayata küçük bir ara.',
    'Bazen kendimize, bazen sevdiklerimize ayırdığımız birkaç dakika her şeyi değiştirir.',
    [585, 380, 735, 490],
  ],
  [
    9.5,
    'Her fincanda ortak bir hikâye.',
    "Çünkü Yâren'de önemli olan yalnızca içtiğimiz kahve değil, onu kiminle paylaştığımızdır.",
    [600, 125, 710, 225],
  ],
];
for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['ultrawide', 3440, 1440],
  ['tablet-portrait', 768, 1024],
  ['tablet-landscape', 1024, 768],
  ['phone', 390, 844],
  ['small-phone', 320, 568],
  ['landscape', 844, 390],
]) {
  test(`${name}: exact brand copy stays on scene, clear of important objects and viewport edges`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    for (const [time, title, subtitle, bounds] of [...scenes, scenes[1]]) {
      await scrub(page, time);
      await expect(page.locator('.journey-caption h2')).toHaveText(title);
      await expect(page.locator('.journey-subtitle').first()).toHaveText(subtitle);
      await expect(page.locator('.journey-annotation svg')).toHaveCount(0);
      const media = await page.locator('.journey-media').boundingBox();
      expect(media.width).toBeCloseTo(width, 0);
      expect(media.height).toBeCloseTo(height, 0);
      const geometry = await page.locator('.journey-annotation').evaluate((el) => {
        const label = el.querySelector('.journey-caption').getBoundingClientRect();
        const frame = document.querySelector('.journey-frame').getBoundingClientRect();
        const rects = [...el.querySelectorAll('h2,.journey-subtitle')].flatMap((node) => {
          const range = document.createRange();
          range.selectNodeContents(node);
          return [...range.getClientRects()].map((r) => ({
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
          }));
        });
        return {
          label: {
            left: label.left,
            right: label.right,
            top: label.top,
            bottom: label.bottom,
          },
          frame: { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
          rects,
        };
      });
      expect(geometry.label.left).toBeGreaterThanOrEqual(16);
      expect(geometry.label.right).toBeLessThanOrEqual(width - 16);
      expect(geometry.label.top).toBeGreaterThanOrEqual(65);
      expect(geometry.label.bottom).toBeLessThanOrEqual(height - 20);
      const f = geometry.frame;
      const object = {
        left: f.x + (bounds[0] * f.width) / 1280,
        right: f.x + (bounds[2] * f.width) / 1280,
        top: f.y + (bounds[1] * f.height) / 720,
        bottom: f.y + (bounds[3] * f.height) / 720,
      };
      expect(
        geometry.rects.some(
          (r) =>
            r.left < object.right &&
            r.right > object.left &&
            r.top < object.bottom &&
            r.bottom > object.top,
        ),
        `${name} at ${time}s: copy covers object ${JSON.stringify(geometry)}`,
      ).toBe(false);
      expect(await page.locator('video').evaluate((v) => v.paused)).toBe(true);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
  });
}

test('seeked fallback tracks the scene when frame callbacks are unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLVideoElement.prototype.requestVideoFrameCallback = undefined;
    HTMLVideoElement.prototype.cancelVideoFrameCallback = undefined;
  });
  await page.goto('/');
  for (const time of [4, 6.5, 9.5, 4]) {
    await scrub(page, time);
    await expect(page.locator('.journey-ambient')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('video')).toHaveJSProperty('paused', true);
  }
});

test('reduced-motion switch tears down frame callbacks and keeps the static narrative', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const request = HTMLVideoElement.prototype.requestVideoFrameCallback;
    const cancel = HTMLVideoElement.prototype.cancelVideoFrameCallback;
    window.pendingVideoFrames = new Set();
    HTMLVideoElement.prototype.requestVideoFrameCallback = function (callback) {
      let id;
      id = request.call(this, (now, metadata) => {
        window.pendingVideoFrames.delete(id);
        callback(now, metadata);
      });
      window.pendingVideoFrames.add(id);
      return id;
    };
    HTMLVideoElement.prototype.cancelVideoFrameCallback = function (id) {
      window.pendingVideoFrames.delete(id);
      return cancel.call(this, id);
    };
  });
  await page.goto('/');
  await scrub(page, 6.5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.locator('.journey-reduced article')).toHaveCount(4);
  expect(await page.evaluate(() => window.pendingVideoFrames.size)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await scrub(page, 6.5);
  expect(errors).toEqual([]);
});

test('failed video keeps its extended poster aligned across same-orientation resizing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route('**/journey-media.json', (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Kahve hikâyesini keşfet' }).click();
  await expect(page.locator('.journey-status')).toContainText('Medya yüklenemedi');
  await expect(page.locator('.journey-ambient')).toHaveAttribute('data-ready', 'true');
  await page.setViewportSize({ width: 2000, height: 1000 });
  await expect(page.locator('.journey-ambient')).toHaveAttribute('width', '320');
  await expect(page.locator('.journey-ambient')).toHaveAttribute('height', '160');
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
});
