import { test, expect } from '@playwright/test';

async function open(page) {
  await page.getByRole('button', { name: 'Kahve hikâyesini keşfet' }).click();
  await expect(page.locator('.journey-media')).toHaveAttribute('data-ready', 'true');
  await page.locator('.journey-frame').evaluate(async (el) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
}
async function scrub(page, p) {
  return page.locator('.journey-panel').evaluate((section, progress) => {
    const top = section.getBoundingClientRect().top + scrollY;
    window.scrollTo({
      top: top + (section.offsetHeight - innerHeight) * progress,
      behavior: 'instant',
    });
    return (scrollY - top) / (section.offsetHeight - innerHeight);
  }, p);
}
test('approved video keeps opening photo separate and does not request archived Blender media', async ({
  page,
}) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('.hero-media img')).toHaveAttribute(
    'src',
    '/images/hero-ritual.webp',
  );
  await open(page);
  await expect(page.locator('.journey-media')).toHaveAttribute(
    'data-progress',
    '0.00000',
  );
  await page.waitForTimeout(250);
  await expect(page.locator('.journey-media')).toHaveAttribute(
    'data-progress',
    '0.00000',
  );
  await scrub(page, 0.95);
  await expect(page.locator('.journey-caption h2')).toHaveText(
    'Her fincanda ortak bir hikâye.',
  );
  await expect(page.locator('.journey-media video')).toBeVisible();
  await expect(page.locator('.journey-canvas')).not.toBeVisible();
  await expect(page.locator('.journey-ambient')).toBeVisible();
  await expect(page.locator('.journey-media img')).toHaveAttribute(
    'src',
    '/video/still-01.webp',
  );
  expect(requests.filter((url) => new URL(url).pathname.startsWith('/story/'))).toEqual(
    [],
  );
});
for (const [device, width, height] of [
  ['desktop', 1440, 1000],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
]) {
  test(
    device + ': retained scroll motor drives the new four phases forward and backward',
    async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await open(page);
      for (const [p, title, subtitle] of [
        [
          0.05,
          'Her hikâyenin bir başlangıcı vardır.',
          'Bizimki, sıradan bir anı özel kılma fikriyle başlıyor.',
        ],
        [
          0.36,
          'Geçmişten gelen bir sıcaklık.',
          'Yâren, köklü kahve kültürünün samimiyetini bugünün dünyasına taşır.',
        ],
        [
          0.65,
          'Hayata küçük bir ara.',
          'Bazen kendimize, bazen sevdiklerimize ayırdığımız birkaç dakika her şeyi değiştirir.',
        ],
        [
          0.96,
          'Her fincanda ortak bir hikâye.',
          "Çünkü Yâren'de önemli olan yalnızca içtiğimiz kahve değil, onu kiminle paylaştığımızdır.",
        ],
        [
          0.36,
          'Geçmişten gelen bir sıcaklık.',
          'Yâren, köklü kahve kültürünün samimiyetini bugünün dünyasına taşır.',
        ],
        [
          0.05,
          'Her hikâyenin bir başlangıcı vardır.',
          'Bizimki, sıradan bir anı özel kılma fikriyle başlıyor.',
        ],
      ]) {
        const actual = await scrub(page, p);
        await expect(page.locator('.journey-media')).toHaveAttribute(
          'data-progress',
          actual.toFixed(5),
        );
        await expect(page.locator('.journey-caption h2')).toHaveText(title);
        await expect(page.locator('.journey-subtitle')).toHaveText(subtitle);
        await expect(page.getByRole('link', { name: 'Hikâyeyi atla' })).toBeInViewport();
      }
      await scrub(page, 1);
      await page.keyboard.press('PageDown');
      await expect(
        page.getByRole('heading', { name: 'Her anın bir kahvesi var.' }),
      ).toBeInViewport();
      await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
      await expect(page.locator('#kahveler')).toBeFocused();
    },
  );
}
for (const [label, id] of [
  ['Kahvelerimiz', 'kahveler'],
  ['Hikâyemiz', 'hikayemiz'],
  ['İletişim', 'iletisim'],
]) {
  test(
    label +
      ': explicit navigation jumps past the active story without intermediate playback',
    async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto('/');
      await open(page);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expect(page.locator('.journey-media')).toHaveAttribute(
        'data-progress',
        '0.00000',
      );
      await page.evaluate(() => {
        window.observedProgress = [];
        new MutationObserver((records) => {
          for (const record of records)
            window.observedProgress.push(Number(record.target.dataset.progress));
        }).observe(document.querySelector('.journey-media'), {
          attributes: true,
          attributeFilter: ['data-progress'],
        });
      });
      await page.getByRole('navigation').getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(new RegExp('#' + id + '$'));
      await expect(page.locator('#' + id)).toBeFocused();
      const values = await page.evaluate(() => window.observedProgress);
      expect(values.filter((p) => p > 0 && p < 0.99)).toEqual([]);
    },
  );
}
test('reduced motion keeps the narrative with video stills and no MP4 request', async ({
  page,
}) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Kahve hikâyesini keşfet' }).click();
  await expect(page.locator('.journey-reduced article')).toHaveCount(4);
  await expect(page.locator('.journey-reduced h2')).toHaveText([
    'Her hikâyenin bir başlangıcı vardır.',
    'Geçmişten gelen bir sıcaklık.',
    'Hayata küçük bir ara.',
    'Her fincanda ortak bir hikâye.',
  ]);
  expect(
    requests.some(
      (url) =>
        new URL(url).pathname.startsWith('/story/') || url.includes('journey-media.json'),
    ),
  ).toBe(false);
});

test('an unavailable Gemini MP4 falls back to the photo while the narrative and exit keep working', async ({
  page,
}) => {
  await page.route('**/journey-media.json', (route) =>
    route.fulfill({ json: { kind: 'video', src: '/test-video/unavailable.mp4' } }),
  );
  await page.route('**/test-video/unavailable.mp4', (route) => route.abort());
  await page.goto('/');
  await open(page);
  await expect(page.locator('.journey-status')).toContainText('Medya yüklenemedi');
  await expect(page.locator('.journey-media')).toHaveAttribute('data-kind', 'poster');
  await expect(page.locator('.journey-media img')).toBeVisible();
  await scrub(page, 0.96);
  await expect(page.locator('.journey-caption h2')).toHaveText(
    'Her fincanda ortak bir hikâye.',
  );
  await page.getByRole('link', { name: 'Hikâyeyi atla' }).click();
  await expect(page.locator('#kahveler')).toBeFocused();
});

for (const [label, id] of [
  ['Kahvelerimiz', 'kahveler'],
  ['Hikâyemiz', 'hikayemiz'],
  ['İletişim', 'iletisim'],
]) {
  test('mobile navigation skips the active story: ' + label, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await open(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('.journey-media')).toHaveAttribute(
      'data-progress',
      '0.00000',
    );
    await page.getByRole('button', { name: 'Menü', exact: true }).click();
    await page.evaluate(() => {
      window.observedProgress = [];
      new MutationObserver((records) => {
        for (const record of records)
          window.observedProgress.push(Number(record.target.dataset.progress));
      }).observe(document.querySelector('.journey-media'), {
        attributes: true,
        attributeFilter: ['data-progress'],
      });
    });
    await page.getByRole('navigation').getByRole('link', { name: label }).click();
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
    await expect(page.locator('#' + id)).toBeFocused();
    await expect(page.getByRole('button', { name: 'Menü', exact: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      (await page.evaluate(() => window.observedProgress)).filter(
        (p) => p > 0 && p < 0.99,
      ),
    ).toEqual([]);
  });
}
