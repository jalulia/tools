/* ============================================================================
   axe.mjs — the accessibility pass BEYOND the fourteen criteria.

   axe-core is not allowed in shipped code (PLAN §2.6: no CDN, no third party in
   the deliverable). It is injected here from a LOCAL copy — `npm i axe-core` in
   team/qa — via page.addScriptTag, which touches nothing the tools ship.

   Six representative routes:
     1  book-of-shaders  #/00-introduction     course entry, glsl stage
     2  book-of-shaders  #/10-random           course entry with three plots
     3  book-of-shaders  #/index               course contact sheet
     4  components       #/index               catalogue contact sheet, iframes
     5  components       #/b1-photocopy-collage catalogue entry, one iframe
     6  components       #/style/riso-xerox    a style page
   plus the apparatus open on (1) and the ? dialog open on (4), because both are
   states no static crawl reaches.

   Run: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/qa/out/axe.mjs
   ============================================================================ */
import { fileURLToPath as __f } from 'node:url';
import { dirname as __d, join as __j } from 'node:path';
const __ROOT = __j(__d(__f(import.meta.url)), '..', '..');
const __OUT = __j(__ROOT, 'scripts', 'qa', 'out');
import { mkdirSync as __mk } from 'node:fs'; __mk(__OUT, { recursive: true });
import { chromium } from 'playwright';
import { writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let AXE_PATH = null;
try { AXE_PATH = require.resolve('axe-core/axe.min.js'); } catch { /* not installed */ }
if (!AXE_PATH || !existsSync(AXE_PATH)) {
  console.log('axe-core is not installed — run `npm i` in scripts/qa. Skipping.');
  process.exit(0);
}

const PORT = 8123;
const ROUTES = [
  { id: 'bos-entry',        url: `http://127.0.0.1:${PORT}/book-of-shaders/index.html#/00-introduction` },
  { id: 'bos-entry-plots',  url: `http://127.0.0.1:${PORT}/book-of-shaders/index.html#/10-random` },
  { id: 'bos-sheet',        url: `http://127.0.0.1:${PORT}/book-of-shaders/index.html#/index` },
  { id: 'comp-sheet',       url: `http://127.0.0.1:${PORT}/components/index.html#/index` },
  { id: 'comp-entry',       url: `http://127.0.0.1:${PORT}/components/index.html#/b1-photocopy-collage` },
  { id: 'comp-style',       url: `http://127.0.0.1:${PORT}/components/index.html#/style/riso-xerox` },
  { id: 'bos-entry+apparatus', url: `http://127.0.0.1:${PORT}/book-of-shaders/index.html#/00-introduction`, after: 'apparatus' },
  { id: 'comp-sheet+help',  url: `http://127.0.0.1:${PORT}/components/index.html#/index`, after: 'help' }
];

const browser = await chromium.launch();
const out = { generated: new Date().toISOString(), axe: require('axe-core/package.json').version, routes: {} };
let serious = 0;

for (const r of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(r.url, { waitUntil: 'load' });
  await page.waitForTimeout(1400);
  if (r.after === 'apparatus') { await page.evaluate(() => window.Shell.toggleApparatus(true)); await page.waitForTimeout(500); }
  if (r.after === 'help') { await page.keyboard.press('?'); await page.waitForTimeout(400); }

  await page.addScriptTag({ path: AXE_PATH });
  const res = await page.evaluate(async () => {
    // The lens iframes are opaque-origin documents with their own <head>; axe
    // cannot reach into them and must not try, so the run is scoped to the
    // host document. Each fragment is audited on its own below.
    return await window.axe.run(document, {
      resultTypes: ['violations'],
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
      iframes: false
    });
  });
  const v = res.violations
    .filter((x) => x.impact === 'serious' || x.impact === 'critical')
    .map((x) => ({ id: x.id, impact: x.impact, help: x.help, n: x.nodes.length, nodes: x.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' — ' + (n.failureSummary || '').split('\n').slice(0, 2).join(' ')) }));
  out.routes[r.id] = { url: r.url, violations: v, allImpacts: res.violations.map((x) => `${x.impact}:${x.id}(${x.nodes.length})`) };
  serious += v.length;
  console.log(`${r.id.padEnd(22)} ${v.length ? v.map((x) => `${x.impact}:${x.id}×${x.n}`).join('  ') : 'clean (serious/critical)'}`);
  if (out.routes[r.id].allImpacts.length) console.log(`  all impacts: ${out.routes[r.id].allImpacts.join(', ')}`);
  await ctx.close();
}

// EVERY fragment, audited as its own document. Six would have been the brief;
// the sweep is cheap and it found two lenses the six-lens sample missed.
const { loadManifest } = await import('../lib/manifests.mjs');
const FRAGS = loadManifest(__j(__ROOT,'components/manifest.js')).entries.map((e) => e.id);
out.fragments = {};
for (const id of FRAGS) {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/components/content/${id}/fragment.html`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.addScriptTag({ path: AXE_PATH });
  const res = await page.evaluate(async () => await window.axe.run(document, {
    resultTypes: ['violations'],
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
  }));
  const v = res.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical')
    .map((x) => ({ id: x.id, impact: x.impact, help: x.help, n: x.nodes.length, nodes: x.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
  out.fragments[id] = v;
  serious += v.length;
  console.log(`fragment ${id.padEnd(28)} ${v.length ? v.map((x) => `${x.impact}:${x.id}×${x.n}`).join('  ') : 'clean'}`);
  await ctx.close();
}

await browser.close();
writeFileSync(__j(__OUT,'axe.json'), JSON.stringify(out, null, 1));
console.log(`\n${serious} serious/critical violation types across ${ROUTES.length} routes + ${FRAGS.length} fragments. axe.json written.`);
