import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const [baseline, candidate, directory] = process.argv.slice(2);
if (
  !directory ||
  [baseline, candidate].some((url) => new URL(url).hostname !== '127.0.0.1')
)
  throw new Error('Use two local preview URLs and an output directory.');
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const results = [];
try {
  for (const [device, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 768, 1024],
    ['mobile', 390, 844],
  ]) {
    const pages = await Promise.all(
      [baseline, candidate].map(async (url) => {
        const page = await browser.newPage({
          viewport: { width, height },
          reducedMotion: 'reduce',
        });
        await page.goto(url);
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(
            [...document.images].map((image) => {
              image.loading = 'eager';
              return image.decode().catch(() => {});
            }),
          );
          window.regressionSections = Object.fromEntries(
            ['#kahveler', '#hikayemiz', '#iletisim'].map((selector) => [
              selector,
              document.querySelector(selector).cloneNode(true),
            ]),
          );
        });
        return page;
      }),
    );
    for (const [name, selector] of [
      ['coffees', '#kahveler'],
      ['story', '#hikayemiz'],
      ['contact', '#iletisim'],
    ]) {
      const buffers = [];
      for (let i = 0; i < pages.length; i++) {
        // Isolate unchanged sections at one common page origin. This avoids
        // mistaking a different hero height's subpixel rasterization for a redesign.
        // Original pages/styles are untouched; this runs in throwaway test tabs.
        await pages[i].evaluate(async (selected) => {
          document.body.replaceChildren(
            window.regressionSections[selected].cloneNode(true),
          );
          await Promise.all([...document.images].map((image) => image.decode()));
        }, selector);
        buffers.push(
          await pages[i].locator(selector).screenshot({
            path: path.join(
              directory,
              device + '-' + name + '-' + (i ? 'after' : 'before') + '.png',
            ),
            animations: 'disabled',
            style: '.skip-link { visibility: hidden !important; }',
          }),
        );
      }
      const sizes = await Promise.all(buffers.map((buffer) => sharp(buffer).metadata()));
      if (sizes[0].width !== sizes[1].width || sizes[0].height !== sizes[1].height)
        throw new Error(device + ' ' + name + ' dimensions changed');
      const width = Math.min(...sizes.map((size) => size.width));
      const height = Math.min(...sizes.map((size) => size.height));
      const pixels = await Promise.all(
        buffers.map((buffer) =>
          sharp(buffer)
            .extract({ left: 0, top: 0, width, height })
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true }),
        ),
      );
      let changed = 0;
      let absoluteError = 0;
      for (let i = 0; i < pixels[0].data.length; i += 3) {
        for (const channel of [0, 1, 2])
          absoluteError += Math.abs(
            pixels[0].data[i + channel] - pixels[1].data[i + channel],
          );
        if (
          [0, 1, 2].some(
            (channel) =>
              Math.abs(pixels[0].data[i + channel] - pixels[1].data[i + channel]) > 12,
          )
        )
          changed++;
      }
      results.push({
        device,
        section: name,
        width,
        height,
        boundaryHeightDifference: sizes[1].height - sizes[0].height,
        changedPixelRatio: changed / (width * height),
        meanAbsoluteColorError: absoluteError / (width * height * 3),
      });
    }
    await Promise.all(pages.map((page) => page.close()));
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  path.join(directory, 'comparison.json'),
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results));
if (results.some((result) => result.meanAbsoluteColorError > 2)) process.exitCode = 1;
