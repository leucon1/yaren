import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const source =
  process.argv[2] || path.join(root, 'source-media/hero-ritual-original.png');
const bytes = await fs.readFile(source);
// Keep the approved input; web derivatives preserve its aspect and focal objects.
await fs.writeFile(path.join(root, 'source-media/hero-ritual-original.png'), bytes);
for (const [width, filename] of [
  [960, 'hero-ritual-960.webp'],
  [1672, 'hero-ritual.webp'],
]) {
  await sharp(bytes)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88, effort: 6 })
    .toFile(path.join(root, 'public/images', filename));
  await sharp(bytes)
    .resize({ width, withoutEnlargement: true })
    .avif({ quality: 58, effort: 6 })
    .toFile(path.join(root, 'public/images', filename.replace('.webp', '.avif')));
}
console.log('Approved original preserved; responsive AVIF and WebP derivatives ready.');
