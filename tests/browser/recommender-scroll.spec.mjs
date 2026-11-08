import { test, expect } from '@playwright/test';

const cases = [
  ['Biraz nostalji istiyorum.', 'kahve-turkish'],
  ['Biraz yorgunum.', 'kahve-espresso'],
  ['Sakin ve huzurluyum.', 'kahve-filter'],
];
for (const [device, width, height] of [
  ['desktop', 1440, 1000],
  ['mobile', 390, 844],
]) {
  for (const [mood, id] of cases) {
    test(`${device}: ${id} travels smoothly, closes the panel and highlights only on arrival`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/#iletisim');
      await page
        .getByRole('button', { name: 'Bugün nasıl hissediyorsun?', exact: true })
        .click();
      await page.getByRole('button', { name: mood, exact: true }).click();
      await page.evaluate((id) => {
        window.travel = [];
        const sample = () => {
          const card = document.getElementById(id);
          window.travel.push({
            y: scrollY,
            highlight: card.classList.contains('is-recommended'),
            focused: document.activeElement === card,
          });
          if (!window.stopTravel) requestAnimationFrame(sample);
        };
        sample();
      }, id);
      await page.getByRole('link', { name: 'Kahveyi Gör', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const card = page.locator('#' + id);
      await expect(card).toBeFocused();
      await expect(card).toHaveClass(/is-recommended/);
      const travel = await page.evaluate(() => {
        window.stopTravel = true;
        return window.travel;
      });
      const first = travel[0].y,
        last = travel.at(-1).y;
      expect(Math.abs(first - last)).toBeGreaterThan(200);
      const intermediate = travel.filter(
        (p) => Math.abs(p.y - first) > 10 && Math.abs(p.y - last) > 10,
      );
      expect(new Set(intermediate.map((p) => Math.round(p.y))).size).toBeGreaterThan(3);
      expect(intermediate.some((p) => p.highlight || p.focused)).toBe(false);
      const box = await card.boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(80);
      expect(box.y).toBeLessThan(170);
      await expect(
        page.getByRole('button', { name: 'Bugün nasıl hissediyorsun?', exact: true }),
      ).toBeVisible();
    });
  }
}

test('reduced motion jumps immediately and retains focus and highlight', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#iletisim');
  await page
    .getByRole('button', { name: 'Bugün nasıl hissediyorsun?', exact: true })
    .click();
  await page.getByRole('button', { name: 'Biraz yorgunum.', exact: true }).click();
  await page.getByRole('link', { name: 'Kahveyi Gör', exact: true }).click();
  await expect(page.locator('#kahve-espresso')).toBeFocused();
  await expect(page.locator('#kahve-espresso')).toHaveClass(/is-recommended/);
});

test('manual scrolling interrupts the trip without a delayed focus or highlight', async ({
  page,
}) => {
  await page.goto('/#iletisim');
  await page
    .getByRole('button', { name: 'Bugün nasıl hissediyorsun?', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Biraz nostalji istiyorum.', exact: true })
    .click();
  await page.getByRole('link', { name: 'Kahveyi Gör', exact: true }).click();
  await page.waitForTimeout(80);
  await page.mouse.wheel(0, 250);
  await page.waitForTimeout(1200);
  await expect(page.locator('#kahve-turkish')).not.toBeFocused();
  await expect(page.locator('#kahve-turkish')).not.toHaveClass(/is-recommended/);
});
