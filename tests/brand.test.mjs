import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

test('approved logo is unchanged and web derivatives retain alpha and proportions', async () => {
  const original = await readFile(
    new URL('../public/images/yaren-logo.png', import.meta.url),
  );
  assert.equal(
    createHash('sha256').update(original).digest('hex'),
    '396526bea1ac630fa15827567d00ba138b1999c7931191e6853a1d0c763cc056',
  );
  for (const width of [270, 540]) {
    const optimized = await readFile(
      new URL(`../public/images/yaren-logo-${width}.webp`, import.meta.url),
    );
    const metadata = await sharp(optimized).metadata();
    assert.equal(metadata.hasAlpha, true);
    assert.equal(metadata.width, width);
    assert.equal(metadata.width / metadata.height, 3);
    assert.ok(optimized.byteLength < original.byteLength / 10);
  }
});
