import { test, expect } from '@playwright/test';

test('mobile menu supports keyboard, Escape, links and desktop resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menü', exact: true });
  await expect(menu).toBeVisible();
  await menu.focus();
  await page.keyboard.press('Enter');
  const close = page.getByRole('button', { name: 'Kapat', exact: true });
  await expect(close).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Kahvelerimiz', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await menu.click();
  await page.getByRole('link', { name: 'İletişim', exact: true }).click();
  await expect(page).toHaveURL(/#iletisim$/);
  await expect(page.getByRole('region', { name: 'Sohbete yerimiz var.' })).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(menu).not.toBeVisible();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.setViewportSize({ width: 768, height: 1024 });
  await menu.click();
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('form errors persist until valid and success is a local demo', async ({ page }) => {
  await page.goto('/');
  const name = page.getByRole('textbox', { name: 'Adınız', exact: true });
  const email = page.getByRole('textbox', { name: 'E-posta adresiniz', exact: true });
  const message = page.getByRole('textbox', { name: 'Mesajınız', exact: true });
  await page.getByRole('button', { name: 'Mesajı Gönder' }).click();
  await expect(name).toBeFocused();
  await name.fill('   ');
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Lütfen adınızı yazın.', { exact: true })).toBeVisible();
  await name.fill('İpek Çağrı');
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  await email.fill('i@');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAttribute('aria-describedby', 'email-error');
  await expect(
    page.getByText('Geçerli bir e-posta adresi yazın.', { exact: true }),
  ).toBeVisible();
  await email.fill('ipek@example.com');
  await expect(email).toHaveAttribute('aria-invalid', 'false');
  await email.fill('still-invalid');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await email.fill('ipek@example.com');
  await message.fill('Bir kahve hikâyesi.');
  const externalRequests = [];
  const dataRequests = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:5174'))
      externalRequests.push(request.url());
    if (request.method() !== 'GET') dataRequests.push(request.url());
  });
  await page.getByRole('button', { name: 'Mesajı Gönder' }).click();
  await expect(page.getByRole('status')).toContainText('Form başarıyla tamamlandı');
  await expect(page.getByRole('status')).toContainText('gönderilmez veya saklanmaz');
  await expect(name).toHaveValue('');
  await expect(email).toHaveValue('');
  await expect(message).toHaveValue('');
  expect(externalRequests).toEqual([]);
  expect(dataRequests).toEqual([]);
  await name.fill('Yeni mesaj');
  await expect(page.getByRole('status')).toBeEmpty();
});

test('skip link moves keyboard focus into main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'İçeriğe geç' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('blur validates a field without making untouched fields look invalid', async ({
  page,
}) => {
  await page.goto('/');
  const email = page.getByRole('textbox', { name: 'E-posta adresiniz', exact: true });
  await email.fill('invalid');
  await email.press('Tab');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(
    page.getByRole('textbox', { name: 'Mesajınız', exact: true }),
  ).toHaveAttribute('aria-invalid', 'false');
  await email.fill('ipek@example.com');
  await expect(email).toHaveAttribute('aria-invalid', 'false');
});

test('all prices refer to prepared cups or shots, never coffee packages', async ({
  page,
}) => {
  await page.goto('/');
  const servings = [
    ['Türk Kahvesi', '1 fincan', '₺120', 'cezvede'],
    ['Espresso', '1 shot', '₺100', 'krema'],
    ['Filtre Kahve', '1 fincan', '₺140', 'demlenir'],
  ];
  for (const [name, size, price, description] of servings) {
    const card = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name, exact: true }) });
    for (const text of [size, price, description, 'örnek servis fiyatı'])
      await expect(card).toContainText(text);
    await expect(card).not.toContainText(/100 g|250 g|paket|çekirdek kahve/);
  }
});

test('every story text tone has at least 4.5 to 1 contrast', async ({ page }) => {
  await page.goto('/');
  const colors = await page.locator('.story-copy').evaluate((root) => ({
    background: getComputedStyle(root.closest('.story')).backgroundColor,
    foregrounds: [...root.querySelectorAll('p,h2,em,strong,.story-signoff span')].map(
      (el) => getComputedStyle(el).color,
    ),
  }));
  const luminance = (color) => {
    const [r, g, b] = color
      .match(/[\d.]+/g)
      .slice(0, 3)
      .map(Number)
      .map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const background = luminance(colors.background);
  for (const color of colors.foregrounds) {
    const foreground = luminance(color);
    expect(
      (Math.max(background, foreground) + 0.05) /
        (Math.min(background, foreground) + 0.05),
      color,
    ).toBeGreaterThanOrEqual(4.5);
  }
});

for (const width of [320, 390, 650, 760, 768, 820, 899, 900, 1024, 1440]) {
  test(`layout remains readable and deliberate at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const bounds = (selector) => {
        const { x, y, width, height, right, bottom } = document
          .querySelector(selector)
          .getBoundingClientRect();
        return { x, y, width, height, right, bottom };
      };
      const title = document.querySelector('#hero-title');
      return {
        viewport: innerWidth,
        scroll: document.documentElement.scrollWidth,
        copy: bounds('.hero-copy'),
        media: bounds('.hero-media'),
        title: bounds('#hero-title'),
        titleLine: parseFloat(getComputedStyle(title).lineHeight),
        cards: [...document.querySelectorAll('.coffee-card')].map(
          (card) => card.getBoundingClientRect().width,
        ),
        columns: getComputedStyle(
          document.querySelector('.coffee-grid'),
        ).gridTemplateColumns.split(' ').length,
        description: parseFloat(
          getComputedStyle(document.querySelector('.hero-description')).fontSize,
        ),
        details: parseFloat(
          getComputedStyle(document.querySelector('.product-description')).fontSize,
        ),
        input: parseFloat(getComputedStyle(document.querySelector('#email')).fontSize),
        labels: [
          ...document.querySelectorAll(
            '.eyebrow,.section-aside,.hero figcaption,.product-size,.product-note,.product-bottom small,.field label,.form-note,.footer-bottom',
          ),
        ].map((el) => parseFloat(getComputedStyle(el).fontSize)),
      };
    });
    expect(layout.scroll).toBeLessThanOrEqual(layout.viewport);
    // The approved heading remains exactly three lines, including at the old 760/768 jump.
    expect(layout.title.height / layout.titleLine).toBeCloseTo(3, 1);
    expect(layout.title.right).toBeLessThanOrEqual(layout.copy.right + 1);
    if (width < 900 || (width < 1200 && width < 1000))
      expect(layout.media.y).toBeGreaterThanOrEqual(layout.copy.bottom - 1);
    // Only the transparent left blend may extend into the copy's column.
    else
      expect(layout.media.x + layout.media.width * 0.38).toBeGreaterThanOrEqual(
        layout.copy.right - 1,
      );
    expect(layout.media.height).toBeGreaterThanOrEqual(180);
    expect(
      await page
        .locator('.hero-media img')
        .evaluate((img) => getComputedStyle(img).objectFit),
    ).toBe('cover');
    expect(Math.min(...layout.cards)).toBeGreaterThanOrEqual(250);
    expect(layout.columns).toBe(width < 650 ? 1 : width < 1100 ? 2 : 3);
    expect(layout.description).toBeGreaterThanOrEqual(15);
    expect(layout.details).toBeGreaterThanOrEqual(15);
    expect(layout.input).toBeGreaterThanOrEqual(16);
    expect(Math.min(...layout.labels)).toBeGreaterThanOrEqual(12);
  });
}

test('hero is visible during animation and reduced motion has no animation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const opacity = await page.locator('.hero-copy').evaluate((element) => {
    for (const animation of element.getAnimations()) {
      animation.pause();
      animation.currentTime = 0;
    }
    return Number(getComputedStyle(element).opacity);
  });
  expect(opacity).toBe(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page.locator('.hero-copy').evaluate((el) => el.getAnimations().length),
  ).toBe(0);
  await expect(page.locator('video')).toHaveCount(0);
});

test('form placeholder and field boundaries meet contrast targets', async ({ page }) => {
  await page.goto('/');
  const colors = await page.locator('#email').evaluate((el) => ({
    placeholder: getComputedStyle(el, '::placeholder').color,
    border: getComputedStyle(el).borderBottomColor,
    paper: getComputedStyle(document.documentElement).backgroundColor,
  }));
  const luminance = (color) => {
    const [r, g, b] = color
      .match(/[\d.]+/g)
      .slice(0, 3)
      .map(Number)
      .map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) =>
    (Math.max(luminance(a), luminance(b)) + 0.05) /
    (Math.min(luminance(a), luminance(b)) + 0.05);
  expect(contrast(colors.placeholder, colors.paper)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colors.border, colors.paper)).toBeGreaterThanOrEqual(3);
});

test('mobile loads only its hero and logo; story has a distinct image', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const images = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'image') images.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('.hero-media img')).toBeVisible();
  await expect(page.locator('.header .logo')).toHaveJSProperty('complete', true);
  const hero = await page.locator('.hero-media img').evaluate((img) => img.currentSrc);
  expect(hero).toContain('hero-ritual-960.avif');
  expect(images.some((url) => /\/hero-ritual\.(?:webp|avif)$/.test(url))).toBe(false);
  expect(images.some((url) => /\/hero(?:-mobile)?\.webp$/.test(url))).toBe(false);
  expect(images.some((url) => url.endsWith('/yaren-logo.png'))).toBe(false);
  await expect(page.locator('.header .logo')).toHaveAttribute(
    'src',
    /yaren-logo-.*\.webp$/,
  );
  await expect(page.locator('.story-image img')).toHaveAttribute(
    'src',
    '/images/story-sharing.webp',
  );
});
