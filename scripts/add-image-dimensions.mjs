// Adds intrinsic width/height attributes to raw <img> tags that reference
// static files in /public, to prevent Cumulative Layout Shift (CLS).
//
// Usage:
//   node scripts/add-image-dimensions.mjs          # apply changes
//   node scripts/add-image-dimensions.mjs --dry     # preview only

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const PUBLIC_DIR = path.join(ROOT, 'public');

const DRY = process.argv.includes('--dry');

/** Recursively collect .astro and .mdx files. */
async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(full)));
    } else if (/\.(astro|mdx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/** Read intrinsic dimensions of a static public file. */
const dimensionCache = new Map();
async function getDimensions(publicSrc) {
  // Strip query/hash and decode URI escapes.
  const clean = decodeURIComponent(publicSrc.split(/[?#]/)[0]);
  if (dimensionCache.has(clean)) return dimensionCache.get(clean);

  const filePath = path.join(PUBLIC_DIR, clean);
  if (!existsSync(filePath)) {
    dimensionCache.set(clean, null);
    return null;
  }

  let dims = null;
  try {
    if (/\.svg$/i.test(filePath)) {
      dims = await getSvgDimensions(filePath);
    } else {
      const meta = await sharp(filePath).metadata();
      if (meta.width && meta.height) {
        dims = { width: meta.width, height: meta.height };
      }
    }
  } catch {
    dims = null;
  }
  dimensionCache.set(clean, dims);
  return dims;
}

/** Parse width/height (or viewBox) from an SVG file. */
async function getSvgDimensions(filePath) {
  const content = await readFile(filePath, 'utf8');
  const svgTag = content.match(/<svg[^>]*>/i)?.[0] ?? '';
  const w = svgTag.match(/\bwidth\s*=\s*["']?([\d.]+)/i)?.[1];
  const h = svgTag.match(/\bheight\s*=\s*["']?([\d.]+)/i)?.[1];
  if (w && h) return { width: Math.round(+w), height: Math.round(+h) };
  const viewBox = svgTag.match(/viewBox\s*=\s*["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/i);
  if (viewBox) return { width: Math.round(+viewBox[1]), height: Math.round(+viewBox[2]) };
  return null;
}

async function processFile(filePath) {
  const original = await readFile(filePath, 'utf8');
  const imgTagRegex = /<img\b[^>]*?\/?>/gis;

  const matches = [...original.matchAll(imgTagRegex)];
  if (matches.length === 0) return { changed: 0, skipped: 0 };

  let result = '';
  let lastIndex = 0;
  let changed = 0;
  let skipped = 0;

  for (const match of matches) {
    const tag = match[0];
    const start = match.index;
    result += original.slice(lastIndex, start);
    lastIndex = start + tag.length;

    // Only handle static string src starting with "/".
    const srcMatch = tag.match(/\bsrc\s*=\s*"(\/[^"]*)"/i);
    // Skip if already has both width and height attributes.
    const hasWidth = /\bwidth\s*=/i.test(tag);
    const hasHeight = /\bheight\s*=/i.test(tag);

    if (!srcMatch || (hasWidth && hasHeight)) {
      result += tag;
      continue;
    }

    const dims = await getDimensions(srcMatch[1]);
    if (!dims) {
      skipped++;
      result += tag;
      continue;
    }

    // Build the attributes to inject (only the missing ones).
    const inject = [];
    if (!hasWidth) inject.push(`width="${dims.width}"`);
    if (!hasHeight) inject.push(`height="${dims.height}"`);

    // Insert right after "<img".
    const newTag = tag.replace(/^<img\b/i, `<img ${inject.join(' ')}`);
    result += newTag;
    changed++;
  }
  result += original.slice(lastIndex);

  if (changed > 0 && !DRY) {
    await writeFile(filePath, result, 'utf8');
  }
  return { changed, skipped };
}

async function main() {
  const files = await collectFiles(SRC_DIR);
  let totalChanged = 0;
  let totalSkipped = 0;
  const touched = [];

  for (const file of files) {
    const { changed, skipped } = await processFile(file);
    totalChanged += changed;
    totalSkipped += skipped;
    if (changed > 0) touched.push(`${path.relative(ROOT, file)}: +${changed}`);
  }

  console.log(touched.join('\n'));
  console.log('\n----------------------------------------');
  console.log(`${DRY ? '[DRY RUN] ' : ''}Injected width/height into ${totalChanged} <img> tag(s).`);
  if (totalSkipped > 0) {
    console.log(`Skipped ${totalSkipped} tag(s) (file not found in /public or unreadable).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
