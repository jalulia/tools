#!/usr/bin/env node
// library/_build/snap.mjs: optional. Photographs the live plate for public
// records whose collection has no thumbnail for them.
//
//   node library/_build/collate.mjs                      the catalog must exist
//   node library/_build/snap.mjs [--force] [--fonts DIR] needs Playwright and Pillow
//   node library/_build/collate.mjs                      files the snapshots
//
// Pages are served from _site/ when it exists (the deployed shape), else from
// the repository root. Each capture is taken at 2x (atoms at 1x) and saved through thumb.py
// as thumbs/<accession>.jpg and -960.jpg; the catalog marks it as a snapshot.
// A collection's own thumbnail is never replaced.
//
// --fonts DIR  serve Google Fonts requests from a local kit instead of the
//              network. DIR holds node_modules/@fontsource/<family>.
// A page whose web fonts cannot load is skipped, since the picture would show
// the wrong type. So are records listed under no_snapshot in collections.json
// and a stage that is a flat field at capture.

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, createReadStream } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(HERE, '..');
const ROOT = resolve(LIB, '..');
const ARGV = process.argv.slice(2);
const FORCE = ARGV.includes('--force');
const KIT = ARGV.includes('--fonts') ? resolve(ARGV[ARGV.indexOf('--fonts') + 1]) : null;
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('Playwright is not installed here.'); process.exit(1); }

const cat = JSON.parse(readFileSync(join(LIB, 'catalog.json'), 'utf8'));
const CFG = JSON.parse(readFileSync(join(HERE, 'collections.json'), 'utf8'));
const PIC_FILE = join(LIB, 'thumbs', 'index.json');
const INDEX = existsSync(PIC_FILE) ? JSON.parse(readFileSync(PIC_FILE, 'utf8')) : { pictures: {} };
const want = cat.records.filter((r) => r.access === 'public' && r.href && !r.thumb_master);

// Which element of the live page is the plate. null: nothing to photograph. 'page': the viewport.
const SELECT = {
  encyclopedia: (r) => (r.kind === 'atom' ? '.atom-swatch canvas' : '#stage'),
  'printed-matter': (r) => `#${r.id.split(':')[1]} .stage`,
  instruments: () => 'page'
};
const WAIT = { 'printed-matter': 2600, instruments: 3500 };
// Capture scale. Five encyclopedia atom swatches fill only part of their canvas above 1x
// (the draw code ignores the pixel ratio), so atoms are photographed at 1x.
const SCALE = (r) => (r.collection === 'encyclopedia' && r.kind === 'atom' ? 1 : 2);
// site furniture that floats over the page
const HIDE = '#gt,#pill,#tn,#tn-menu,#tools-grab-hud{display:none!important}';

/* a static server: the deployed site lives under /tools/ */
const SITE = existsSync(join(ROOT, '_site', 'index.html')) ? join(ROOT, '_site') : ROOT;
const MIME = { html: 'text/html', js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2', woff: 'font/woff', wasm: 'application/wasm' };
const server = createServer((req, res) => {
  let f = join(SITE, decodeURIComponent(req.url.split('?')[0]).replace(/^\/tools\//, '/'));
  if (!f.startsWith(SITE)) { res.writeHead(403); return res.end(); }
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[f.split('.').pop().toLowerCase()] || 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/tools/`;

/* Google Fonts from a local kit */
function kitCss(url) {
  let css = '';
  for (const fam of new URL(url).searchParams.getAll('family')) {
    const [name, spec] = fam.split(':');
    const pkg = name.trim().toLowerCase().replace(/\s+/g, '-');
    const dir = join(KIT, 'node_modules', '@fontsource', pkg);
    if (!existsSync(dir)) continue;
    let combos = [['400', false]];
    if (spec) {
      const [axes, vals] = spec.split('@');
      const ax = axes.split(',');
      combos = (vals || '').split(';').map((v) => { const p = v.split(','); const o = {}; ax.forEach((a, i) => { o[a] = p[i]; }); return [o.wght || '400', o.ital === '1']; });
    }
    for (const [w, it] of combos) {
      const f = join(dir, `${w}${it ? '-italic' : ''}.css`);
      if (existsSync(f)) css += readFileSync(f, 'utf8').replace(/url\(\.\/files\//g, `url(https://fonts.gstatic.com/kit/${pkg}/files/`) + '\n';
    }
  }
  return css;
}

function copies(png, dst) {
  const out = execFileSync('python3', [join(HERE, 'thumb.py')], { input: JSON.stringify([{ key: 'x', src: png, dst, large: true }]), encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  return JSON.parse(out).x;
}

const browser = await chromium.launch();
const pages = {};
let fontsFailed = false;
async function pageAt(scale) {
  if (pages[scale]) return pages[scale];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: scale });
  if (KIT) {
    await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', headers: { 'access-control-allow-origin': '*' }, body: kitCss(r.request().url()) }));
    await ctx.route('https://fonts.gstatic.com/kit/**', (r) => {
      const m = r.request().url().match(/\/kit\/([^/]+)\/files\/([^/?#]+)/);
      const f = m && join(KIT, 'node_modules', '@fontsource', m[1], 'files', m[2]);
      if (f && existsSync(f)) r.fulfill({ status: 200, contentType: 'font/woff2', headers: { 'access-control-allow-origin': '*' }, body: readFileSync(f) }); else r.abort();
    });
  }
  const page = await ctx.newPage();
  page.on('requestfailed', (q) => { if (/fonts\.(googleapis|gstatic)\.com|use\.typekit\.net/.test(q.url())) fontsFailed = true; });
  return (pages[scale] = page);
}

mkdirSync(join(LIB, 'thumbs'), { recursive: true });
let made = 0;
const skipped = [];
const skip = (r, why) => skipped.push(`${r.acc} ${r.title}: ${why}`);
for (const r of want) {
  const dst = join(LIB, 'thumbs', r.acc);
  const have = INDEX.pictures[r.acc];
  if (have && have.from === 'snapshot' && existsSync(`${dst}.jpg`) && !FORCE) continue;
  const no = (CFG.no_snapshot || {})[r.id];
  if (no) { skip(r, no.why); continue; }
  const pick = SELECT[r.collection];
  if (!pick) { skip(r, `no rule for ${r.collection}`); continue; }
  const sel = pick(r);
  if (!sel) { skip(r, `nothing to photograph (${r.lane || r.kind})`); continue; }
  const tmp = `${dst}.tmp.png`;
  try {
    fontsFailed = false;
    const page = await pageAt(SCALE(r));
    await page.goto(BASE + r.href.replace(/^\.\.\//, ''), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.addStyleTag({ content: HIDE });
    await page.waitForTimeout(WAIT[r.collection] || 1600);
    if (fontsFailed) { skip(r, 'its web fonts did not load (pass --fonts DIR)'); continue; }
    if (sel === 'page') await page.screenshot({ path: tmp });
    else {
      const el = await page.$(sel);
      if (!el) { skip(r, `nothing matches ${sel}`); continue; }
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(WAIT[r.collection] || 300);
      await el.screenshot({ path: tmp });
    }
    const p = copies(tmp, dst);
    if (!p || p.error) { skip(r, 'could not write the copies (Pillow missing?)'); continue; }
    if (p.flat) {
      for (const f of [`${dst}.jpg`, `${dst}-960.jpg`]) if (existsSync(f)) unlinkSync(f);
      delete INDEX.pictures[r.acc];
      skip(r, 'the stage was a flat field at capture');
      continue;
    }
    INDEX.pictures[r.acc] = { from: 'snapshot', w: p.w, h: p.h };
    for (const k of ['w2', 'h2', 'sig']) if (p[k]) INDEX.pictures[r.acc][k] = p[k];
    made++;
  } catch (e) { skip(r, String(e.message || e).split('\n')[0]); }
  finally { if (existsSync(tmp)) unlinkSync(tmp); }
}
await browser.close();
server.close();
INDEX.pictures = Object.fromEntries(Object.entries(INDEX.pictures).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(PIC_FILE, JSON.stringify(INDEX, null, 1) + '\n');
console.log(`snap · ${made} made · ${skipped.length} skipped · ${want.length} public records have no thumbnail in their collection · served from ${SITE === ROOT ? 'the repository root' : '_site/'}`);
for (const s of skipped) console.log('  · ' + s);
console.log('Run collate.mjs again to file them.');
