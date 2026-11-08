import { test, expect } from '@playwright/test';

async function seek(page, progress) {
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
  await settled(page);
}
async function settled(page) {
  await expect
    .poll(() =>
      page.locator('video').evaluate((v) => {
        const progress = +v.closest('.journey-media').dataset.progress;
        return (
          !v.seeking &&
          Math.abs(v.currentTime - Math.min(progress * v.duration, v.duration - 1 / 24)) <
            0.03
        );
      }),
    )
    .toBe(true);
}
async function hold(page) {
  await settled(page);
  const before = await page
    .locator('video')
    .evaluate((v) => ({ y: scrollY, t: v.currentTime }));
  await page.waitForTimeout(1100);
  const after = await page
    .locator('video')
    .evaluate((v) => ({ y: scrollY, t: v.currentTime }));
  expect(after).toEqual(before);
  return before;
}

for (const [width, height] of [
  [390, 844],
  [820, 1000],
  [1920, 1080],
  [3440, 1440],
]) {
  test(`${width}px: small wheel and trackpad gestures hold the exact frame without automatic settling`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await seek(page, 0.43);
    await expect(
      page.getByRole('navigation', { name: 'Sinematik sahneler' }),
    ).toHaveCount(0);
    for (const delta of [20, -12]) {
      const y = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, delta);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(y + delta, 0);
      await hold(page);
    }
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 3);
      await page.waitForTimeout(20);
    }
    await hold(page);
    await page.mouse.wheel(0, 500);
    const forward = await hold(page);
    await page.mouse.wheel(0, -350);
    const reverse = await hold(page);
    expect(reverse.y).toBeLessThan(forward.y);
    expect(reverse.t).toBeLessThan(forward.t);
    // Native PageDown scrolls over several frames. Measure the held video only
    // after the browser's own scroll ends, not immediately after key delivery.
    await page.evaluate(() => {
      window.nativeScrollEnded = false;
      document.addEventListener(
        'scrollend',
        () => {
          window.nativeScrollEnded = true;
        },
        { once: true },
      );
    });
    await page.keyboard.press('PageDown');
    await page.waitForFunction(() => window.nativeScrollEnded);
    await hold(page);
    await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
    await expect(page.locator('#kahveler')).toBeFocused();
    const exit = await page.evaluate(() => scrollY);
    await page.waitForTimeout(1100);
    expect(await page.evaluate(() => scrollY)).toBe(exit);
  });
}

test('rotation keeps edge fill tied to the held frame while replacement posters load', async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.addInitScript(() => {
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
      if (this.canvas.classList.contains('journey-ambient'))
        window.lastAmbientSource = {
          tag: source.tagName,
          width: source.videoWidth || source.naturalWidth || source.width,
          height: source.videoHeight || source.naturalHeight || source.height,
        };
      return draw.call(this, source, ...args);
    };
  });
  await page.goto('/');
  await seek(page, 0.63);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const delay = async (route) => {
    await gate;
    await route.continue().catch(() => {});
  };
  await page.route(/\/video\/still-0[2-5]\.webp$/, delay);
  await page.route('**/video/yaren-scroll-portrait.mp4', delay);
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.journey-media')).toHaveAttribute('data-holding', 'true');
    await expect(page.locator('.journey-video-poster')).toHaveAttribute(
      'src',
      '/video/still-portrait.webp',
    );
    await page.locator('.journey-video-poster').evaluate((img) => img.decode());
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.lastAmbientSource)).toEqual({
      tag: 'CANVAS',
      width: 1280,
      height: 720,
    });
    await expect(page.locator('.journey-ambient')).toBeVisible();
    release();
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-fallback',
      'false',
    );
    await settled(page);
    await expect
      .poll(() => page.evaluate(() => window.lastAmbientSource.tag))
      .toBe('VIDEO');
  } finally {
    release();
  }
});

test('touch scrolling holds arbitrary frames in both directions and rotation preserves progress', async ({
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
    for (const [from, to] of [
      [650, 350],
      [250, 650],
    ]) {
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
      await page.waitForTimeout(150);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await hold(page);
    }
    const p = await page.locator('.journey-media').evaluate((el) => +el.dataset.progress);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-fallback',
      'false',
    );
    await expect
      .poll(() => page.locator('.journey-media').evaluate((el) => +el.dataset.progress))
      .toBeCloseTo(p, 3);
    await hold(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#kahveler')).toBeFocused();
  } finally {
    await context.close();
  }
});

for (const [width, height] of [
  [390, 844],
  [820, 1000],
  [1080, 1920],
]) {
  test(`${width}px: portrait gaps extend only the current edges, reverse exactly, and stop repainting when idle`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      window.ambientDraws = [];
      const draw = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
        if (this.canvas.classList.contains('journey-ambient')) {
          window.ambientDraws.push({
            args,
            width: source.videoWidth || source.naturalWidth || source.width,
            height: source.videoHeight || source.naturalHeight || source.height,
          });
        }
        return draw.call(this, source, ...args);
      };
    });
    await page.goto('/');
    const ambient = page.locator('.journey-ambient');
    await seek(page, 0.22);
    await expect(ambient).toBeVisible();
    await expect(ambient).toHaveAttribute('data-ready', 'true');
    await page.waitForTimeout(100);
    const first = await ambient.evaluate((c) => c.toDataURL());
    await seek(page, 0.67);
    await page.waitForTimeout(100);
    expect(await ambient.evaluate((c) => c.toDataURL())).not.toBe(first);
    await seek(page, 0.22);
    await page.waitForTimeout(100);
    expect(await ambient.evaluate((c) => c.toDataURL())).toBe(first);
    const stats = await page.evaluate(() => ({
      draws: window.ambientDraws.length,
      last: window.ambientDraws.slice(-5),
      width: document.querySelector('.journey-ambient').width,
      height: document.querySelector('.journey-ambient').height,
    }));
    expect(Math.max(stats.width, stats.height)).toBeLessThanOrEqual(320);
    for (const edge of stats.last.slice(0, 4)) {
      expect(edge.width).toBe(1080);
      expect(edge.height).toBe(1920);
      expect(edge.args[2] === 8 || edge.args[3] === 8).toBe(true);
    }
    const center = stats.last[4].args;
    expect(center).toHaveLength(4);
    expect(center[2] / center[3]).toBeCloseTo(9 / 16, 3);
    await page.waitForTimeout(1100);
    expect(await page.evaluate(() => window.ambientDraws.length)).toBe(stats.draws);
    await expect(page.locator('video')).toHaveCount(1);
    await expect(page.locator('video')).toHaveCSS('object-fit', 'contain');
  });
}
