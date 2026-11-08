import path from 'node:path';

// Exercise the retained generic frame engine with the approved photo.
// Archived Blender images are not requested by the application or fixture.
export async function useSequence(page) {
  await page.route('**/journey-media.json', (route) =>
    route.fulfill({
      json: { kind: 'sequence', manifest: '/test-sequence/manifest.json' },
    }),
  );
  await page.route('**/test-sequence/manifest.json', (route) =>
    route.fulfill({
      json: {
        desktop: {
          count: 180,
          width: 1536,
          height: 1024,
          pattern: '/test-sequence/desktop/frame-{index}.webp',
        },
        mobile: {
          count: 180,
          width: 800,
          height: 533,
          pattern: '/test-sequence/mobile/frame-{index}.webp',
        },
      },
    }),
  );
  await page.route('**/test-sequence/**/frame-*.webp', (route) =>
    route.fulfill({
      path: path.resolve(
        'public/images',
        route.request().url().includes('/mobile/') ? 'hero-mobile.webp' : 'hero.webp',
      ),
      contentType: 'image/webp',
    }),
  );
}
