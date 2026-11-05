#!/usr/bin/env node
// library/_build/snap.mjs — optional. Photographs the live plate for records
// that have no thumbnail of their own, so the index has a picture to show.
//
//   node library/_build/collate.mjs            (first: the catalog must exist)
//   node library/_build/snap.mjs [--force]     (needs Playwright, like techniques-templates/_build/render.mjs)
//   node library/_build/collate.mjs            (again: picks the snapshots up)
//
// A snapshot is the library's own access copy, named by accession number in
// library/thumbs/. It never replaces a thumbnail a collection made itself, and
// the catalog marks it as a snapshot. A page that pulls its type from a font
// CDN is skipped: without the fonts the picture would misrepresent the plate.
// So is a sound entry (its panes are empty until played) and a stage that is a
// flat field at capture.

import { readFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(HERE, '..');
const FORCE = process.argv.includes('--force');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('Playwright is not installed here. Skip this step, or run it where techniques-templates/_build/render.mjs runs.'); process.exit(1); }

const cat = JSON.parse(readFileSync(join(LIB, 'catalog.json'), 'utf8'));
const want = cat.records.filter((r) => r.access === 'public' && r.href && !r.thumb_master);
// One rule per collection: which element of the live page is the plate.
// A collection with no rule keeps its type plate in the index.
const SELECT = {
  encyclopedia: (r) => (r.kind === 'atom' ? '.atom-swatch canvas' : r.lane === 'audio' ? null : '#stage')
};
// page furniture that floats over the stage
const HIDE = '#gt,#pill,#tn,#tn-menu{display:none!important}';

function shrink(png, jpg) {
  if (process.platform === 'darwin') {
    try { execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', '480', png, '--out', jpg], { stdio: 'ignore' }); return true; } catch { /* fall through */ }
  }
  try {
    execFileSync('python3', ['-c',
      // exit 3: the stage was a flat field when photographed, so there is no picture to file
      'import sys\nfrom PIL import Image, ImageStat\nim=Image.open(sys.argv[1]).convert("RGB")\nif max(ImageStat.Stat(im.convert("L")).stddev)<5: sys.exit(3)\nw,h=im.size\ns=min(1,480/max(w,h))\nim=im.resize((max(1,round(w*s)),max(1,round(h*s))),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=82,optimize=True)',
      png, jpg], { stdio: 'ignore' });
    return true;
  } catch (e) { return e && e.status === 3 ? 'blank' : false; }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
mkdirSync(join(LIB, 'thumbs'), { recursive: true });
let made = 0;
const skipped = [];
for (const r of want) {
  const dst = join(LIB, 'thumbs', `${r.acc}.jpg`);
  if (existsSync(dst) && !FORCE) continue;
  const pick = SELECT[r.collection];
  if (!pick) { skipped.push(`${r.acc} ${r.title}: no snapshot rule for ${r.collection}`); continue; }
  const [path, hash] = r.href.split('#');
  let file = join(LIB, path);
  if (!/\.html?$/.test(file)) file = join(file, 'index.html');
  if (!existsSync(file)) { skipped.push(`${r.acc} ${r.title}: ${path} is not a page on disk`); continue; }
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net/.test(readFileSync(file, 'utf8'))) { skipped.push(`${r.acc} ${r.title}: page loads web fonts`); continue; }
  const tmp = dst.replace(/\.jpg$/, '.tmp.png');
  try {
    await page.goto(pathToFileURL(file).href + (hash ? '#' + hash : ''), { waitUntil: 'load' });
    await page.waitForTimeout(1600);
    const sel = pick(r);
    if (!sel) { skipped.push(`${r.acc} ${r.title}: nothing to photograph (${r.lane || r.kind})`); continue; }
    await page.addStyleTag({ content: HIDE });
    const el = await page.$(sel);
    if (!el) { skipped.push(`${r.acc} ${r.title}: nothing matches ${sel}`); continue; }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await el.screenshot({ path: tmp });
    const ok = shrink(tmp, dst);
    if (ok === true) made++;
    else skipped.push(`${r.acc} ${r.title}: ${ok === 'blank' ? 'the stage was a flat field when photographed' : 'could not write a jpeg (no sips, no PIL)'}`);
  } catch (e) { skipped.push(`${r.acc} ${r.title}: ${String(e.message || e).split('\n')[0]}`); }
  finally { if (existsSync(tmp)) unlinkSync(tmp); }
}
await browser.close();
console.log(`snap · ${made} made · ${skipped.length} skipped of ${want.length} without a thumbnail of their own`);
for (const s of skipped) console.log('  · ' + s);
console.log('Run collate.mjs again to file them.');
