import { test, expect, devices, webkit } from '@playwright/test';
import path from 'node:path';

async function checkStoryIcon(page, name) {
  await page.goto(process.env.STORY_ICON_SITE_URL || '/');
  await page.evaluate(() => document.fonts.ready);
  const signoff = page.locator('.story-signoff');
  await signoff.scrollIntoViewIfNeeded();
  const icon = signoff.locator('svg');
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  await expect(icon).toHaveAttribute('focusable', 'false');
  await expect(icon).toHaveAttribute('stroke', 'currentColor');
  await expect(icon).toHaveAttribute('fill', 'none');
  await expect(signoff).not.toContainText('✳');
  await expect(signoff).toContainText('Birlikte içilenin, hikâyesi.');

  const layout = await signoff.evaluate((element) => {
    const svg = element.querySelector('svg');
    const iconBox = svg.getBoundingClientRect();
    const textBox = element.querySelector('span').getBoundingClientRect();
    return {
      width: iconBox.width,
      height: iconBox.height,
      gap: textBox.left - iconBox.right,
      centerOffset: Math.abs(
        iconBox.top + iconBox.height / 2 - textBox.top - textBox.height / 2,
      ),
      color: getComputedStyle(svg).color,
      stroke: getComputedStyle(svg.querySelector('path')).stroke,
      background: getComputedStyle(svg).backgroundColor,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  expect(layout.width).toBe(43);
  expect(layout.height).toBe(43);
  expect(layout.gap).toBe(19);
  expect(layout.centerOffset).toBeLessThan(1);
  expect(layout.color).toBe('rgb(244, 241, 234)');
  expect(layout.stroke).toBe(layout.color);
  expect(layout.background).toBe('rgba(0, 0, 0, 0)');
  expect(layout.overflow).toBe(false);

  const directory = process.env.DELIVERY_SCREENSHOTS_DIR || 'test-results/story-icon';
  await signoff.screenshot({ path: path.join(directory, `${name}-icon.png`) });
  await page.locator('#hikayemiz').screenshot({
    path: path.join(directory, `${name}-story.png`),
  });
}

test('story icon is monochrome SVG and aligned on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await checkStoryIcon(page, 'desktop-chromium');
});

test('story icon stays aligned in Android Chrome emulation', async ({ browser }) => {
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    baseURL: 'http://127.0.0.1:5180',
  });
  try {
    await checkStoryIcon(await context.newPage(), 'android-chromium');
  } finally {
    await context.close();
  }
});

test('story icon stays monochrome in iPhone WebKit emulation', async () => {
  const browser = await webkit.launch({ executablePath: webkit.executablePath() });
  try {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      baseURL: 'http://127.0.0.1:5180',
    });
    await checkStoryIcon(await context.newPage(), 'iphone-webkit');
  } finally {
    await browser.close();
  }
});
