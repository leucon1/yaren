import { test, expect } from '@playwright/test';
import { useSequence } from './journey-fixture.mjs';

const triggerName = 'Kahve hikâyesini keşfet';

async function openJourney(page) {
  await page.getByRole('button', { name: triggerName }).click();
  const canvas = page.locator('.journey-media');
  await expect(canvas).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
  await page.locator('.journey-frame').evaluate(async (el) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  return canvas;
}

async function scrub(page, progress) {
  return page.locator('.journey-panel').evaluate((section, p) => {
    const top = section.getBoundingClientRect().top + scrollY;
    const travel = section.offsetHeight - innerHeight;
    window.scrollTo({ top: top + travel * p, behavior: 'instant' });
    return Math.max(0, Math.min(1, (scrollY - top) / travel));
  }, progress);
}

test('normal navigation skips the story without downloading its media', async ({
  page,
}) => {
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('/');
  await expect(page.getByRole('button', { name: triggerName })).toBeVisible();
  await expect(page.locator('.journey-panel')).toHaveCount(1);
  await page.getByRole('link', { name: 'Kahveleri Keşfet', exact: true }).click();
  await expect(page).toHaveURL(/#kahveler$/);
  expect(
    requests.some((url) => /manifest\.json|frame-\d+\.webp|sequence-player/.test(url)),
  ).toBe(false);
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe(
    'hidden',
  );
});

for (const [device, width, height] of [
  ['desktop', 1440, 1000],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
]) {
  test(`${device}: one timeline scrubs forward and backward and rejoins the page`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const canvas = await openJourney(page);
    await expect(page.getByRole('link', { name: 'Hikâyeyi atla' })).toBeFocused();
    for (const [p, title] of [
      [0.05, 'Her hikâyenin bir başlangıcı vardır.'],
      [0.36, 'Geçmişten gelen bir sıcaklık.'],
      [0.65, 'Hayata küçük bir ara.'],
      [0.96, 'Her fincanda ortak bir hikâye.'],
      [0.36, 'Geçmişten gelen bir sıcaklık.'],
      [0.05, 'Her hikâyenin bir başlangıcı vardır.'],
    ]) {
      const actual = await scrub(page, p);
      await expect(canvas).toHaveAttribute('data-progress', actual.toFixed(5));
      await expect(page.locator('.journey-caption h2')).toHaveText(title);
      await expect(page.getByRole('link', { name: 'Hikâyeyi atla' })).toBeVisible();
    }
    await scrub(page, 1);
    await page.keyboard.press('PageDown');
    await expect(
      page.getByRole('heading', { name: 'Her anın bir kahvesi var.' }),
    ).toBeInViewport();
    // Once the story has left the viewport, Escape must not hijack focus.
    const focused = await page.evaluate(() => document.activeElement.tagName);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.activeElement.tagName)).toBe(focused);
    await expect(page.locator('.journey-panel')).toHaveCount(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
  });
}

test('keyboard activates the whole image, PageDown scrolls, and skip focuses products', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: triggerName });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.journey-media')).toHaveAttribute('data-ready', 'true', {
    timeout: 20000,
  });
  const before = await page.evaluate(() => scrollY);
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
  await expect(page.locator('.journey-panel')).toHaveCount(1);
});

test('reduced motion presents the same four milestones without a pinned sequence', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: triggerName }).click();
  await expect(page.locator('.journey-reduced')).toBeVisible();
  await expect(page.locator('.journey-reduced article')).toHaveCount(4);
  await expect(page.locator('.journey-canvas')).toHaveCount(0);
  expect(
    await page
      .locator('.journey-reduced')
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe('relative');
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
});

test('failed scene loading leaves a static scene and an accessible exit', async ({
  page,
}) => {
  await page.route('**/journey-media.json', (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: triggerName }).click();
  await expect(page.locator('.journey-status')).toContainText('Medya yüklenemedi');
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('.journey-panel')).toHaveCount(1);
});

test('touch scrolling and trackpad-style wheel input remain native', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5180/');
  const trigger = page.getByRole('button', { name: triggerName });
  await trigger.scrollIntoViewIfNeeded();
  const box = await trigger.boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('.journey-media')).toHaveAttribute('data-ready', 'true', {
    timeout: 20000,
  });
  const before = await page.evaluate(() => scrollY);
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 195, y: 650 }],
  });
  for (const y of [600, 540, 470, 390, 300])
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: 195, y }],
    });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
  const beforeWheel = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 300);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(beforeWheel + 100);
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe(
    'hidden',
  );
  await context.close();
});

test('a current frame failure keeps the exit visible at mid-story', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await useSequence(page);
  await page.route('**/test-sequence/desktop/frame-090.webp', (route) => route.abort());
  await page.goto('/');
  await openJourney(page);
  await expect(page.locator('.journey-canvas')).toHaveAttribute('data-ready', 'true');
  await scrub(page, 0.5);
  await expect(page.locator('.journey-status')).toContainText('Medya yüklenemedi');
  await expect(page.getByRole('link', { name: 'Hikâyeyi atla' })).toBeInViewport();
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
});

test('skipping before the manifest completes keeps navigation and error recovery safe', async ({
  page,
}) => {
  let heldRoute;
  let requested;
  const held = new Promise((resolve) => {
    requested = resolve;
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await useSequence(page);
  await page.route('**/test-sequence/manifest.json', (route) => {
    heldRoute = route;
    requested();
  });
  await page.goto('/');
  await page.getByRole('button', { name: triggerName }).click();
  await held;
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await heldRoute.abort().catch(() => {});
  await expect(page.locator('.journey-panel')).toHaveCount(1);
  await expect(page.locator('#kahveler')).toBeFocused();
  expect(errors).toEqual([]);
});

test('orientation changes replace pending landscape work with the portrait sequence', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  let requested;
  const held = new Promise((resolve) => {
    requested = resolve;
  });
  await useSequence(page);
  await page.route('**/test-sequence/desktop/frame-090.webp', () => {
    requested();
  });
  await page.goto('/');
  await openJourney(page);
  await expect(page.locator('.journey-canvas')).toHaveAttribute('data-ready', 'true');
  await scrub(page, 0.5);
  await held;
  await page.setViewportSize({ width: 390, height: 844 });
  const canvas = page.locator('.journey-canvas');
  await expect(canvas).toHaveAttribute('width', '800');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.journey-status')).toHaveCount(0);
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
});
