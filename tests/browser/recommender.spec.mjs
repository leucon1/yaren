import { test, expect } from '@playwright/test';

const question = 'Bugün nasıl hissediyorsun?';
async function enterCoffees(page) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Kahveleri Keşfet', exact: true }).click();
  await expect(page.getByRole('button', { name: question, exact: true })).toBeVisible();
}
async function openPanel(page) {
  await page.getByRole('button', { name: question, exact: true }).click();
  const panel = page.getByRole('dialog', { name: question });
  await expect(panel).toBeVisible();
  return panel;
}
for (const [mood, coffee, message, id] of [
  [
    'Biraz yorgunum.',
    'Espresso',
    'Kısa bir mola, güçlü bir başlangıç.',
    'kahve-espresso',
  ],
  ['Sakin ve huzurluyum.', 'Filtre Kahve', 'Anın tadını yavaşça çıkar.', 'kahve-filter'],
  [
    'Biraz nostalji istiyorum.',
    'Türk Kahvesi',
    'Tanıdık bir tat, unutulmayan hikâyeler.',
    'kahve-turkish',
  ],
  [
    'Sohbet etmek istiyorum.',
    'Türk Kahvesi',
    'Güzel sohbetler bir fincanla başlar.',
    'kahve-turkish',
  ],
]) {
  test(mood + ' recommends and focuses the correct existing drink', async ({ page }) => {
    await enterCoffees(page);
    const panel = await openPanel(page);
    await panel.getByRole('button', { name: mood, exact: true }).click();
    await expect(panel.getByRole('heading', { name: new RegExp(coffee) })).toBeVisible();
    await expect(panel.getByRole('status')).toContainText(message);
    await expect(panel.getByText(message, { exact: true }).first()).toBeVisible();
    await panel.getByRole('link', { name: 'Kahveyi Gör', exact: true }).click();
    await expect(panel).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
    const card = page.locator('#' + id);
    await expect(card).toBeFocused();
    await expect(card).toHaveClass(/is-recommended/);
    expect((await card.boundingBox()).y).toBeGreaterThanOrEqual(80);
    await expect(card).not.toHaveClass(/is-recommended/, { timeout: 5000 });
  });
}

test('panel is opt-in, keyboard accessible, closes on Escape and resets choices', async ({
  page,
}) => {
  await enterCoffees(page);
  const trigger = page.getByRole('button', { name: question, exact: true });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await trigger.focus();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('dialog', { name: question });
  await expect(
    panel.getByRole('button', { name: 'Biraz yorgunum.', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    panel.getByRole('link', { name: 'Kahveyi Gör', exact: true }),
  ).toBeFocused();
  await panel
    .getByRole('button', { name: 'Başka Bir Ruh Hâli Seç', exact: true })
    .click();
  await expect(
    panel.getByRole('button', { name: 'Biraz yorgunum.', exact: true }),
  ).toBeFocused();
  await panel.getByRole('button', { name: 'Sakin ve huzurluyum.', exact: true }).click();
  await expect(panel.getByRole('heading', { name: /Filtre Kahve/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(
    panel.getByRole('button', { name: 'Biraz yorgunum.', exact: true }),
  ).toBeVisible();
  await panel
    .getByRole('button', { name: 'Kahve önericisini kapat', exact: true })
    .click();
  await expect(trigger).toBeFocused();
});

test('widget stays hidden throughout hero, appears below it and hides on reverse scroll', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: question, exact: true });
  await expect(trigger).toHaveCount(0);
  await page.getByRole('button', { name: 'Kahve hikâyesini keşfet' }).click();
  for (const p of [0, 0.36, 0.65, 0.96, 1]) {
    await page.locator('.journey-panel').evaluate((section, progress) => {
      const top = section.getBoundingClientRect().top + scrollY;
      window.scrollTo({
        top: top + (section.offsetHeight - innerHeight) * progress,
        behavior: 'instant',
      });
    }, p);
    await expect(trigger).toHaveCount(0);
  }
  await page.keyboard.press('PageDown');
  await expect(trigger).toBeVisible();
  await openPanel(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(trigger).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#icerik')).toBeFocused();
  await expect(page.locator('.journey-panel')).toHaveCount(1);
});

for (const [device, width, height] of [
  ['desktop', 1440, 1000],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
  ['small-mobile', 320, 568],
  ['mobile-landscape', 844, 390],
]) {
  test(
    device +
      ': compact panel fits viewport, supports repeat selection, and does not block form editing',
    async ({ page }) => {
      await page.setViewportSize({ width, height });
      await enterCoffees(page);
      const panel = await openPanel(page);
      const box = await panel.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(12);
      expect(box.x + box.width).toBeLessThanOrEqual(width - 12);
      expect(box.y).toBeGreaterThanOrEqual(16);
      if (width < 650) expect(box.height).toBeLessThanOrEqual(height * 0.5);
      await panel
        .getByRole('button', { name: 'Sohbet etmek istiyorum.', exact: true })
        .click();
      await expect(panel.getByRole('heading', { name: /Türk Kahvesi/ })).toBeVisible();
      await page.locator('#name').focus();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('button', { name: question, exact: true })).toHaveCount(
        0,
      );
      await expect(page.locator('#name')).toBeFocused();
      await page.locator('#name').fill('Yâren Ziyaretçisi');
      await page.locator('#contact-title').click();
      await expect(
        page.getByRole('button', { name: question, exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => getComputedStyle(document.body).overflow),
      ).not.toBe('hidden');
    },
  );
}

test('reduced-motion disables panel transitions and keeps an accessible static highlight', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterCoffees(page);
  const panel = await openPanel(page);
  expect(await panel.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await panel.getByRole('button', { name: 'Biraz yorgunum.', exact: true }).click();
  await panel.getByRole('link', { name: 'Kahveyi Gör', exact: true }).click();
  await expect(page.locator('#kahve-espresso')).toBeFocused();
  await expect(page.locator('#kahve-espresso')).toHaveClass(/is-recommended/);
});

test('mobile result keeps the drink, action and change-choice option inside the compact panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterCoffees(page);
  const panel = await openPanel(page);
  await panel
    .getByRole('button', { name: 'Biraz nostalji istiyorum.', exact: true })
    .click();
  const box = await panel.boundingBox();
  const title = await panel.getByRole('heading', { name: /Türk Kahvesi/ }).boundingBox();
  const back = await panel
    .getByRole('button', { name: 'Başka Bir Ruh Hâli Seç', exact: true })
    .boundingBox();
  expect(title.y).toBeGreaterThanOrEqual(box.y + 8);
  expect(back.y + back.height).toBeLessThanOrEqual(box.y + box.height - 8);
});

test('Escape closes only the recommender while the existing hero remains open', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kahve hikâyesini keşfet' }).click();
  await page.locator('.journey-panel').evaluate((section) => {
    const top = section.getBoundingClientRect().top + scrollY;
    window.scrollTo({
      top: top + section.offsetHeight - innerHeight,
      behavior: 'instant',
    });
  });
  await page.keyboard.press('PageDown');
  await openPanel(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.journey-panel')).toHaveCount(1);
  await expect(page.getByRole('button', { name: question, exact: true })).toBeFocused();
});

test('a new recommendation clears an older highlight, uses no service, and outside clicks keep focus', async ({
  page,
}) => {
  const serviceRequests = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr'].includes(request.resourceType()))
      serviceRequests.push(request.url());
  });
  await enterCoffees(page);
  let panel = await openPanel(page);
  await panel.getByRole('button', { name: 'Biraz yorgunum.', exact: true }).click();
  await panel.getByRole('link', { name: 'Kahveyi Gör', exact: true }).click();
  await expect(page.locator('#kahve-espresso')).toHaveClass(/is-recommended/);
  panel = await openPanel(page);
  await panel.getByRole('button', { name: 'Sakin ve huzurluyum.', exact: true }).click();
  await panel.getByRole('link', { name: 'Kahveyi Gör', exact: true }).click();
  await expect(page.locator('#kahve-espresso')).not.toHaveClass(/is-recommended/);
  await expect(page.locator('#kahve-filter')).toHaveClass(/is-recommended/);
  await openPanel(page);
  await page.locator('#kahve-filter').click({ position: { x: 20, y: 20 } });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#kahve-filter')).toBeFocused();
  // v11 prepares the selected static MP4 in the background. This is a local
  // asset fetch, not a recommender service/API request.
  const origin = new URL(page.url()).origin;
  expect(
    serviceRequests.every((url) => {
      const request = new URL(url);
      return (
        request.origin === origin &&
        ['/journey-media.json', '/video/yaren-scroll.mp4'].includes(request.pathname)
      );
    }),
  ).toBe(true);
  expect(
    serviceRequests.filter((url) => url.endsWith('.mp4')).length,
  ).toBeLessThanOrEqual(1);
});
