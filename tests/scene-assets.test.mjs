import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

test('both frame sequences are complete, unique and share the same continuous physical scene', async () => {
  const manifest = JSON.parse(
    await fs.readFile(new URL('../public/story/manifest.json', import.meta.url)),
  );
  const proof = JSON.parse(
    await fs.readFile(new URL('../scene-source/validation.json', import.meta.url)),
  );
  assert.equal(proof.passed, true);
  assert.equal(proof.same_physical_camera_path_both_formats, true);
  assert.equal(proof.desktop.geometry_hash, proof.mobile.geometry_hash);
  assert.ok(proof.key_speeds_m_per_progress['0.33'] > 0);
  assert.ok(proof.key_speeds_m_per_progress['0.66'] > 0);
  for (const variant of ['desktop', 'mobile']) {
    const { count, width, height } = manifest[variant];
    assert.equal(count, 180);
    const directory = new URL(`../public/story/${variant}/`, import.meta.url);
    const names = (await fs.readdir(directory)).filter((name) => name.endsWith('.webp'));
    assert.equal(names.length, count);
    const hashes = new Set();
    for (let index = 0; index < count; index++) {
      const bytes = await fs.readFile(
        new URL(`frame-${String(index).padStart(3, '0')}.webp`, directory),
      );
      hashes.add(createHash('sha256').update(bytes).digest('hex'));
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.width, width);
      assert.equal(metadata.height, height);
    }
    assert.equal(hashes.size, count);
    assert.ok(proof[variant].first_second_cup_bounds.x[0] > 1);
    for (const object of Object.values(proof[variant].final_cup_saucer_bounds)) {
      assert.ok(object.x[0] > 0 && object.x[1] < 1 && object.y[0] > 0 && object.y[1] < 1);
    }
  }
});
