import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type ImageSize = { width: number; height: number };

const cache = new Map<string, ImageSize | null>();
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function svgSize(filePath: string): Promise<ImageSize | null> {
  const content = await readFile(filePath, 'utf8');
  const svgTag = content.match(/<svg[^>]*>/i)?.[0] ?? '';
  const w = svgTag.match(/\bwidth\s*=\s*["']?([\d.]+)/i)?.[1];
  const h = svgTag.match(/\bheight\s*=\s*["']?([\d.]+)/i)?.[1];
  if (w && h) return { width: Math.round(+w), height: Math.round(+h) };
  const viewBox = svgTag.match(/viewBox\s*=\s*["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/i);
  if (viewBox) return { width: Math.round(+viewBox[1]), height: Math.round(+viewBox[2]) };
  return null;
}

/**
 * Reads the intrinsic dimensions of an image located in the /public folder.
 * Runs at build time (prerendered pages) and caches results. Returns null if
 * the file can't be found or read.
 */
export async function getPublicImageSize(src?: string | null): Promise<ImageSize | null> {
  if (!src || !src.startsWith('/')) return null;
  const clean = decodeURIComponent(src.split(/[?#]/)[0]);
  if (cache.has(clean)) return cache.get(clean) ?? null;

  const filePath = path.join(PUBLIC_DIR, clean);
  if (!existsSync(filePath)) {
    cache.set(clean, null);
    return null;
  }

  let dims: ImageSize | null = null;
  try {
    if (/\.svg$/i.test(filePath)) {
      dims = await svgSize(filePath);
    } else {
      const meta = await sharp(filePath).metadata();
      if (meta.width && meta.height) dims = { width: meta.width, height: meta.height };
    }
  } catch {
    dims = null;
  }
  cache.set(clean, dims);
  return dims;
}
