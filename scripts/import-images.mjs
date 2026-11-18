// Converts the "Relaunch Edits 2026" image sets into web-ready WebP files
// and writes src/data/images.json (an ordered manifest per product folder).
//
// Usage: node scripts/import-images.mjs "<path to Relaunch Edits 2026>" ["<path to HomePage content>"]
//
// Output:
//   public/img/p/<product-folder>/<file>-600.webp, -1200.webp  (4:5 gallery images)
//   public/img/p/<product-folder>/<file>-1200.jpg               (first image only, for Open Graph / Merchant Center)
//   public/img/b/<bundle>-600.webp, -1200.webp, -1200.jpg
//   public/img/home/hero-*.webp|jpg
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = process.argv[2];
const HOME_SRC = process.argv[3];
if (!SRC) {
  console.error('Pass the path to the "Relaunch Edits 2026" folder.');
  process.exit(1);
}
const OUT = path.resolve('public/img');
const SETS = path.join(SRC, 'Website image sets');
const BUNDLES = path.join(SRC, 'Bundle images');

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function writeVariants(input, outBase, { widths = [600, 1200], jpg = false, ratio = 4 / 5 } = {}) {
  await fs.mkdir(path.dirname(outBase), { recursive: true });
  for (const w of widths) {
    const h = Math.round(w / ratio);
    const target = `${outBase}-${w}.webp`;
    if (await exists(target)) continue;
    await sharp(input).rotate().resize(w, h, { fit: 'cover', position: 'attention' }).webp({ quality: 78 }).toFile(target);
  }
  if (jpg) {
    const w = widths[widths.length - 1];
    const target = `${outBase}-${w}.jpg`;
    if (!(await exists(target))) {
      await sharp(input).rotate().resize(w, Math.round(w / ratio), { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile(target);
    }
  }
}

async function sampleColour(file) {
  // Flat mockups are drawn in the product's sampled colour; read the centre of the garment.
  const meta = await sharp(file).metadata();
  const box = { left: Math.round(meta.width * 0.45), top: Math.round(meta.height * 0.55), width: Math.round(meta.width * 0.1), height: Math.round(meta.height * 0.08) };
  const stats = await sharp(file).extract(box).stats();
  const [r, g, b] = stats.channels.slice(0, 3).map((c) => Math.round(c.mean));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

const manifest = { products: {}, bundles: {} };

for (const category of (await fs.readdir(SETS)).sort()) {
  const catDir = path.join(SETS, category);
  if (!(await fs.stat(catDir)).isDirectory()) continue;
  for (const product of (await fs.readdir(catDir)).sort()) {
    const dir = path.join(catDir, product);
    if (!(await fs.stat(dir)).isDirectory()) continue;
    const files = (await fs.readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
    const entry = { category, images: [], flat: null, swatch: null };
    let first = true;
    for (const f of files) {
      const base = f.replace(/\.(jpe?g|png)$/i, '');
      const kind = base.endsWith('_flat') ? 'flat' : base.endsWith('_lifestyle') ? 'lifestyle' : 'studio';
      const outBase = path.join(OUT, 'p', product, base);
      if (kind === 'flat') {
        await writeVariants(path.join(dir, f), outBase, { widths: [400] });
        entry.flat = `/img/p/${product}/${base}`;
        entry.swatch = await sampleColour(path.join(dir, f));
        continue;
      }
      await writeVariants(path.join(dir, f), outBase, { jpg: first });
      entry.images.push({ src: `/img/p/${product}/${base}`, kind });
      first = false;
    }
    manifest.products[product] = entry;
    console.log(`${product}: ${entry.images.length} images, swatch ${entry.swatch}`);
  }
}

for (const f of (await fs.readdir(BUNDLES)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
  const base = f.replace(/\.(jpe?g|png)$/i, '');
  const meta = await sharp(path.join(BUNDLES, f)).metadata();
  const ratio = meta.width / meta.height;
  await writeVariants(path.join(BUNDLES, f), path.join(OUT, 'b', base), { jpg: true, ratio });
  manifest.bundles[base] = { src: `/img/b/${base}`, ratio: +ratio.toFixed(4) };
  console.log(`bundle ${base}`);
}

if (HOME_SRC) {
  const hero = path.join(HOME_SRC, 'ChatGPT Image May 10, 2026, 04_21_53 PM.png');
  if (await exists(hero)) {
    await fs.mkdir(path.join(OUT, 'home'), { recursive: true });
    for (const w of [960, 1920]) {
      const t = path.join(OUT, 'home', `hero-${w}.webp`);
      if (!(await exists(t))) await sharp(hero).resize(w).webp({ quality: 76 }).toFile(t);
    }
    // Portrait crop for phones, centred on the couple.
    const t = path.join(OUT, 'home', 'hero-mobile-800.webp');
    if (!(await exists(t))) await sharp(hero).extract({ left: 660, top: 0, width: 752, height: 941 }).resize(800).webp({ quality: 76 }).toFile(t);
    const j = path.join(OUT, 'home', 'hero-1200.jpg');
    if (!(await exists(j))) await sharp(hero).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(j);
    manifest.hero = { desktop: '/img/home/hero', mobile: '/img/home/hero-mobile-800.webp', og: '/img/home/hero-1200.jpg', width: 1672, height: 941 };
  }
}

await fs.writeFile('src/data/images.json', JSON.stringify(manifest, null, 2));
console.log('Wrote src/data/images.json');
