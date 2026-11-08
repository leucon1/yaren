import { test, expect } from '@playwright/test';

async function seek(page, time) {
  await page.locator('.journey-panel').evaluate((section, t) => {
    const top = section.getBoundingClientRect().top + scrollY;
    const travel =
      section.offsetHeight - section.querySelector('.journey-stage').offsetHeight;
    scrollTo({ top: top + (travel * t) / 10, behavior: 'instant' });
  }, time);
  await expect(page.locator('.journey-media')).toHaveAttribute('data-kind', 'video');
  await expect.poll(() => page.locator('video').evaluate((v) => v.seeking)).toBe(false);
  await expect
    .poll(() =>
      page.locator('.journey-annotation').evaluate((el) => Number(el.dataset.time)),
    )
    .toBeCloseTo(time, 1);
}

test('original logo fades only with presented progress, holds and returns in reverse', async ({
  page,
}) => {
  await page.goto('/');
  await seek(page, 0);
  const logo = page.locator('.journey-brand');
  await expect(logo.locator('img')).toHaveAttribute('src', '/images/yaren-logo.png');
  expect(
    await logo.locator('img').evaluate((img) => [img.naturalWidth, img.naturalHeight]),
  ).toEqual([2172, 724]);
  const opacity = () => logo.evaluate((el) => Number(getComputedStyle(el).opacity));
  const textOpacity = () =>
    page
      .locator('.journey-caption')
      .evaluate((el) => Number(getComputedStyle(el).opacity));
  await expect.poll(opacity).toBe(1);
  expect(await textOpacity()).toBe(0);
  const box = await logo.locator('img').boundingBox();
  const viewport = page.viewportSize();
  expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0);
  expect(box.y + box.height / 2).toBeCloseTo(viewport.height * 0.4, 0);
  expect(box.width).toBeCloseTo(Math.min(viewport.width * 0.64, 660) * 0.9, 0);
  await seek(page, 0.5);
  const intermediate = await opacity();
  expect(intermediate).toBeGreaterThan(0);
  expect(intermediate).toBeLessThan(1);
  expect(await textOpacity()).toBe(0);
  const time = await page.locator('video').evaluate((v) => v.currentTime);
  await page.waitForTimeout(350);
  expect(await opacity()).toBe(intermediate);
  expect(await page.locator('video').evaluate((v) => v.currentTime)).toBe(time);
  expect(await logo.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
  await seek(page, 1.8);
  expect(await opacity()).toBe(0);
  expect(await textOpacity()).toBe(1);
  await expect(page.locator('.journey-caption h2')).toHaveText(
    'Her hikâyenin bir başlangıcı vardır.',
  );
  await seek(page, 0.5);
  expect(await opacity()).toBe(intermediate);
  await seek(page, 0);
  expect(await opacity()).toBe(1);
  expect(await textOpacity()).toBe(0);
});

test('cinematic text keeps its feathered gradient and contains no annotation shapes', async ({
  page,
}) => {
  await page.goto('/');
  await seek(page, 2);
  await expect(
    page.locator('.journey-annotation svg, .journey-callout, .annotation-baseline'),
  ).toHaveCount(0);
  const gradient = await page
    .locator('.journey-caption')
    .evaluate((el) => getComputedStyle(el, '::before').backgroundImage);
  expect(gradient).toContain('radial-gradient');
  expect(gradient).toContain('rgba(17, 23, 8, 0.75)');
});
