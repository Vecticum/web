// One-off: convert selected photographic PNG/JPG files in /public to WebP
// (deleting the original), and recompress a few already-WebP files that are
// still over the target. Iteratively lowers quality / width to get < TARGET.
//
// Usage: node scripts/convert-to-webp.mjs

import { readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const TARGET = 100 * 1024;

// PNG/JPG -> WebP (original deleted afterwards).
const CONVERT = [
  'media/services/statybos-industrija.png',
  'media/services/prekyba-industrija.png',
  'media/services/IT-industrija.png',
  'media/services/apskaita-industrija.png',
  'media/services/medicinos-industrija.png',
  'media/services/logistika-industrija.png',
  'media/services/finansu-industrija.png',
  'media/blog/dvs_dar_aktualios.png',
  'media/blog/straipsnis-dvs2026.png',
  'media/blog/kas yra dvs.png',
  'media/recomendations/Iki rekomendacija.png',
  'media/recomendations/FREDA-REC.png',
  'media/recomendations/yukon-rec.png',
  'media/recomendations/coop rekomendacija.png',
  'media/recomendations/GATAS-rec.png',
  'media/team/Živilė.png',
  'media/team/Evelina.png',
  'media/team/Julija.png',
  'media/team/Raimondas.png',
  'media/team/Darius.png',
  'media/team/Viktoras.png',
  'media/team/Linas.png',
  'media/team/Jevgenij.png',
  'media/team/Dovydas.png',
  'media/team/Ignas.png',
  'media/team/Šarūnas.png',
  'media/team/Domas.png',
  'media/team/Ieva.png',
  'ofisas.jpg',
];

// Already WebP but still oversized -> recompress in place (no rename).
const RECOMPRESS = [
  'media/blog/Phishing.webp',
  'media/blog/popierines-sf.webp',
  'media/services/migracija-komanda.webp',
];

const WIDTH_STEPS = [null, 1600, 1400, 1200, 1000, 900];
const QUALITY_STEPS = [82, 76, 70, 64, 58, 52];

function fmt(b) { return (b / 1024).toFixed(1) + ' kB'; }

async function encodeUnderTarget(input, srcWidth) {
  let best = null;
  for (const width of WIDTH_STEPS) {
    if (width && srcWidth && width >= srcWidth) continue;
    for (const quality of QUALITY_STEPS) {
      let p = sharp(input, { failOn: 'none' }).rotate();
      if (width) p = p.resize({ width, withoutEnlargement: true });
      p = p.webp({ quality, effort: 6 });
      const buf = await p.toBuffer();
      if (!best || buf.length < best.length) best = buf;
      if (buf.length <= TARGET) return { buf, width, quality };
    }
  }
  // Couldn't hit target; return smallest achieved.
  return { buf: best, width: 'min', quality: 'min' };
}

for (const rel of CONVERT) {
  const abs = path.join(PUBLIC_DIR, rel);
  if (!existsSync(abs)) { console.log('SKIP (missing):', rel); continue; }
  const before = (await stat(abs)).size;
  const input = await readFile(abs);
  const meta = await sharp(input, { failOn: 'none' }).metadata();
  const { buf, width, quality } = await encodeUnderTarget(input, meta.width);

  const outRel = rel.replace(/\.(png|jpe?g)$/i, '.webp');
  const outAbs = path.join(PUBLIC_DIR, outRel);
  await writeFile(outAbs, buf);
  if (outAbs !== abs) await unlink(abs);
  console.log(`${rel} -> ${outRel}: ${fmt(before)} -> ${fmt(buf.length)} (q${quality}${width && width !== null ? ' w' + width : ''})`);
}

for (const rel of RECOMPRESS) {
  const abs = path.join(PUBLIC_DIR, rel);
  if (!existsSync(abs)) { console.log('SKIP (missing):', rel); continue; }
  const before = (await stat(abs)).size;
  const input = await readFile(abs);
  const meta = await sharp(input, { failOn: 'none' }).metadata();
  const { buf, width, quality } = await encodeUnderTarget(input, meta.width);
  if (buf.length < before) {
    await writeFile(abs, buf);
    console.log(`${rel} (recompress): ${fmt(before)} -> ${fmt(buf.length)} (q${quality}${width && width !== null ? ' w' + width : ''})`);
  } else {
    console.log(`${rel} (recompress): kept ${fmt(before)}`);
  }
}

console.log('\nDone.');
