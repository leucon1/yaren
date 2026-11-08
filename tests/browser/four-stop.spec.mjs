import { test, expect } from '@playwright/test';

export async function seek(page, progress) {
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
  await expect(page.locator('.journey-media')).toHaveAttribute('data-fallback', 'false');
}
const progress = (page) =>
  page.locator('.journey-media').evaluate((el) => +el.dataset.progress);

test('small separate wheel gestures can leave either end of the story without snapping back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const [start, direction] of [
    [0.175, -1],
    [0.925, 1],
  ]) {
    await seek(page, start);
    for (let step = 0; step < 6; step++) {
      const before = await progress(page);
      await page.mouse.wheel(0, direction * 100);
      await page.waitForTimeout(1000);
      const after = await progress(page);
      if (direction > 0) expect(after).toBeGreaterThanOrEqual(before);
      else expect(after).toBeLessThanOrEqual(before);
    }
    expect(await progress(page)).toBe(direction > 0 ? 1 : 0);
  }
});

test('dot keyboard navigation and repeated selections are interruptible; fast exit is never pulled back', async ({
  page,
}) => {
  await page.goto('/');
  await seek(page, 0.43);
  const buttons = page.locator('.journey-stops button');
  await buttons.nth(0).focus();
  await page.keyboard.press('ArrowDown');
  await expect(buttons.nth(1)).toBeFocused();
  await expect.poll(() => progress(page)).toBeCloseTo(0.35, 3);
  await page.keyboard.press('End');
  await expect.poll(() => progress(page)).toBeCloseTo(0.925, 3);
  await page.keyboard.press('Home');
  await expect.poll(() => progress(page)).toBeCloseTo(0.175, 3);
  await buttons.nth(3).click();
  await buttons.nth(0).click();
  await buttons.nth(2).click();
  await expect.poll(() => progress(page)).toBeCloseTo(0.575, 3);
  await buttons.nth(0).click();
  await page.mouse.wheel(0, 20000);
  await expect.poll(() => progress(page)).toBe(1);
  const y = await page.evaluate(() => scrollY);
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => scrollY)).toBe(y);
});

test('real touch gestures settle in both directions and rotation preserves the interrupted moment', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL: 'http://127.0.0.1:5180',
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await seek(page, 0.43);
    const cdp = await context.newCDPSession(page);
    const swipe = async (from, to) => {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: 180, y: from }],
      });
      for (let i = 1; i <= 8; i++) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: 180, y: from + ((to - from) * i) / 8 }],
        });
        await page.waitForTimeout(25);
      }
      await page.waitForTimeout(120);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    await swipe(650, 350);
    await expect.poll(() => progress(page)).toBeCloseTo(0.575, 3);
    // Cross the midpoint between stops, allowing Chromium's touch slop.
    await swipe(250, 650);
    await expect.poll(() => progress(page)).toBeCloseTo(0.35, 3);
    await page.locator('.journey-stops button').nth(3).click();
    await page.waitForTimeout(80);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-format',
      'landscape',
    );
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-fallback',
      'false',
    );
    const held = await progress(page);
    expect(held).toBeGreaterThan(0.35);
    expect(held).toBeLessThan(0.925);
    await page.waitForTimeout(1000);
    expect(await progress(page)).toBeCloseTo(held, 3);
  } finally {
    await context.close();
  }
});

for (const [name, width, height] of [
  ['desktop', 1920, 1080],
  ['ultrawide', 3440, 1440],
  ['tablet', 820, 1000],
  ['phone', 390, 844],
]) {
  test(`${name}: four accessible stops settle forward and backward without oscillation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await seek(page, 0.43);
    const nav = page.getByRole('navigation', { name: 'Sinematik sahneler' });
    await expect(nav.getByRole('button')).toHaveCount(4);
    expect(await nav.innerText()).toBe('');
    for (const button of await nav.getByRole('button').all()) {
      const box = await button.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await nav.evaluate((el) => getComputedStyle(el, '::before').width)).toBe(
      '1px',
    );
    await page.mouse.wheel(0, 1);
    await expect.poll(() => progress(page)).toBeCloseTo(0.35, 3);
    const held = await progress(page);
    await page.waitForTimeout(700);
    expect(await progress(page)).toBe(held);
    for (const [label, target, phase] of [
      ['Paylaşım', 0.925, 'PAYLAŞIM'],
      ['Çekirdek', 0.175, 'ÇEKİRDEK'],
      ['Fincan', 0.575, 'FİNCAN'],
      ['Cezve', 0.35, 'CEZVE'],
    ]) {
      const button = nav.getByRole('button', { name: new RegExp(label) });
      await button.click();
      await expect.poll(() => progress(page)).toBeCloseTo(target, 3);
      await expect(button).toHaveAttribute('aria-current', 'step');
      await expect(page.locator('.journey-caption .eyebrow')).toContainText(phase);
      await expect
        .poll(() =>
          page
            .locator('video')
            .evaluate((v, p) => Math.abs(v.currentTime - v.duration * p), target),
        )
        .toBeLessThan(0.05);
    }
    await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
    await expect(page.locator('#kahveler')).toBeFocused();
    const y = await page.evaluate(() => scrollY);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => scrollY)).toBe(y);
  });
}

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
