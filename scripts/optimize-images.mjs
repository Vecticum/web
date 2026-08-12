// Optimizes raster images in /public that exceed a size threshold, in place,
// keeping the SAME file path and format so no references break.
//
// - Resizes images wider than MAX_WIDTH (keeps aspect ratio)
// - Re-encodes with tuned quality (webp / mozjpeg / png)
// - Only overwrites when the new file is actually smaller
//
// Usage:
//   node scripts/optimize-images.mjs           # apply changes
//   node scripts/optimize-images.mjs --dry     # preview only
//   node scripts/optimize-images.mjs --limit 100  # only files > 100 kB (default)

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const DRY = process.argv.includes('--dry');
const limitArgIdx = process.argv.indexOf('--limit');
const THRESHOLD_KB = limitArgIdx !== -1 ? Number(process.argv[limitArgIdx + 1]) : 100;
const THRESHOLD = THRESHOLD_KB * 1024;

const MAX_WIDTH = 1920; // cap huge images
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 80;

const EXT = /\.(png|jpe?g|webp)$/i;
// Skip favicons / tiny icons folders where recompression is pointless.
const SKIP_DIRS = new Set(['fonts']);

/** Recursively collect image files. */
async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...(await collect(path.join(dir, entry.name))));
    } else if (EXT.test(entry.name)) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function fmt(bytes) {
  return (bytes / 1024).toFixed(1) + ' kB';
}

async function optimize(file) {
  const before = (await stat(file)).size;
  if (before <= THRESHOLD) return null;

  const ext = path.extname(file).toLowerCase();
  const input = await readFile(file);

  let pipeline = sharp(input, { failOn: 'none' });
  const meta = await pipeline.metadata();

  // Preserve orientation, drop metadata.
  pipeline = pipeline.rotate();

  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: WEBP_QUALITY, effort: 6 });
  } else if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  } else if (ext === '.png') {
    // Try lossy palette PNG first (big wins for UI/graphics),
    // fall back handled below by comparing sizes.
    pipeline = pipeline.png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 });
  }

  const output = await pipeline.toBuffer();
  const after = output.length;

  if (after >= before) return { file, before, after, changed: false };

  if (!DRY) await writeFile(file, output);
  return { file, before, after, changed: true };
}

const files = await collect(PUBLIC_DIR);
let totalBefore = 0;
let totalAfter = 0;
let optimized = 0;
const rows = [];

for (const file of files) {
  try {
    const res = await optimize(file);
    if (!res) continue;
    if (res.changed) {
      optimized++;
      totalBefore += res.before;
      totalAfter += res.after;
      rows.push(res);
    }
  } catch (err) {
    console.error('FAILED', path.relative(ROOT, file), err.message);
  }
}

rows.sort((a, b) => (b.before - b.after) - (a.before - a.after));
for (const r of rows) {
  const rel = path.relative(PUBLIC_DIR, r.file);
  const pct = (((r.before - r.after) / r.before) * 100).toFixed(0);
  console.log(`${DRY ? '[dry] ' : ''}${rel}: ${fmt(r.before)} -> ${fmt(r.after)} (-${pct}%)`);
}

console.log('\n----------------------------------------');
console.log(`${DRY ? 'Would optimize' : 'Optimized'} ${optimized} file(s) over ${THRESHOLD_KB} kB`);
console.log(`Total: ${fmt(totalBefore)} -> ${fmt(totalAfter)} (saved ${fmt(totalBefore - totalAfter)})`);
if (DRY) console.log('Dry run - no files were written. Re-run without --dry to apply.');
