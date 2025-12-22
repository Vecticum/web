// scripts/generate_kb.js
// Build a consolidated knowledge base from site content (MD/MDX/Astro)
// Outputs: server/knowledgeBase.generated.json

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, 'server', 'knowledgeBase.generated.json');
const SOURCES = [path.join(ROOT, 'src', 'content'), path.join(ROOT, 'src', 'pages')];
const SITE_BASE = 'https://vecticum.lt';

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf-8'); } catch { return ''; }
}

function stripFrontmatter(text) {
  if (text.startsWith('---')) {
    const end = text.indexOf('\n---', 3);
    if (end !== -1) return text.slice(end + 4);
  }
  return text;
}

function extractTitle(text, fallback) {
  // Try frontmatter title:
  const titleMatch = text.match(/\btitle:\s*(.+)/);
  if (titleMatch) return titleMatch[1].trim().replace(/^"|"$/g, '');
  // Try meta.title:
  const metaTitle = text.match(/meta:\s*[\s\S]*?title:\s*(.+)/);
  if (metaTitle) return metaTitle[1].trim().replace(/^"|"$/g, '');
  return fallback;
}

function extractCanonical(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  const fm = end !== -1 ? text.slice(0, end) : text;
  // canonical: ...
  const canon = fm.match(/\bcanonical:\s*(.+)/);
  if (canon) {
    let v = canon[1].trim();
    v = v.replace(/^"|"$/g, '');
    return v;
  }
  // meta: ... canonical: ...
  const metaCanon = fm.match(/meta:\s*[\s\S]*?canonical:\s*(.+)/);
  if (metaCanon) {
    let v = metaCanon[1].trim();
    v = v.replace(/^"|"$/g, '');
    return v;
  }
  return null;
}

function stripContent(text) {
  let t = text;
  t = stripFrontmatter(t);
  // Remove imports and exports
  t = t.replace(/^import\s+.*$/mg, '').replace(/^export\s+.*$/mg, '');
  // Remove Astro/MDX JSX blocks
  t = t.replace(/\{[\s\S]*?\}/g, '');
  // Remove HTML/MD tags
  t = t.replace(/<[^>]+>/g, ' ');
  // Remove code fences
  t = t.replace(/```[\s\S]*?```/g, '');
  // Remove frontmatter-ish lines
  t = t.replace(/^meta:\s*[\s\S]*?$/m, '');
  // Collapse whitespace
  t = t.replace(/[\t ]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
  return t;
}

function walk(dir, out = []) {
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p, out); continue; }
    if (!/\.(md|mdx|astro)$/i.test(e.name)) continue;
    out.push(p);
  }
  return out;
}

function toSlug(p) {
  const rel = path.relative(path.join(ROOT, 'src'), p).replace(/\\/g, '/');
  return rel.replace(/\.(md|mdx|astro)$/i, '');
}

function slugToUrl(slug, canonical) {
  if (canonical) {
    return canonical.startsWith('http')
      ? canonical
      : `${SITE_BASE}${canonical.startsWith('/') ? canonical : '/' + canonical}`;
  }
  if (slug.startsWith('pages/')) {
    let route = slug.slice('pages/'.length);
    if (route.endsWith('/index')) route = route.slice(0, -('/index'.length));
    route = route.startsWith('/') ? route : '/' + route;
    return `${SITE_BASE}${route}`;
  }
  if (slug.startsWith('content/')) {
    const route = '/' + slug.replace(/^content\//, '').replace(/\/(index)?$/, '');
    return `${SITE_BASE}${route}`;
  }
  return null;
}

function buildEntry(filePath) {
  const raw = readFileSafe(filePath);
  const title = extractTitle(raw, path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' '));
  const canonical = extractCanonical(raw);
  const content = stripContent(raw);
  const slug = toSlug(filePath);
  const tags = slug.split('/').filter(Boolean).slice(0, 4);
  const url = slugToUrl(slug, canonical);
  return {
    id: slug,
    title,
    tags,
    content,
    source: slug,
    url,
  };
}

function main() {
  const files = SOURCES.flatMap((d) => walk(d));
  const entries = files.map(buildEntry).filter((e) => e.content && e.content.length > 0);
  // De-duplicate by id
  const map = new Map();
  for (const e of entries) map.set(e.id, e);
  const final = Array.from(map.values());
  fs.mkdirSync(path.join(ROOT, 'server'), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(final, null, 2), 'utf-8');
  console.log(`Generated KB entries: ${final.length}`);
  console.log(`Output: ${OUTPUT}`);
}

main();
