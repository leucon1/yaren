import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const directory = fileURLToPath(new URL('../public/images/', import.meta.url));
const original = path.join(directory, 'yaren-logo.png');
const originalBytes = await fs.readFile(original);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

for (const width of [270, 540]) {
  await sharp(originalBytes)
    .resize({ width })
    .webp({ lossless: true, effort: 6 })
    .toFile(path.join(directory, `yaren-logo-${width}.webp`));
}

if (hash(await fs.readFile(original)) !== hash(originalBytes)) {
  throw new Error('The approved original logo was modified.');
}
console.log('Lossless web derivatives created; the approved original is unchanged.');
