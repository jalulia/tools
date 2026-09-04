/* ============================================================================
   axe.mjs — the accessibility pass BEYOND the fourteen criteria.

   axe-core is not allowed in shipped code (PLAN §2.6: no CDN, no third party in
   the deliverable). It is injected here from a LOCAL copy — `npm i axe-core` in
   team/qa — via page.addScriptTag, which touches nothing the tools ship.

   Representative Encyclopedia routes cover the technique spine, atom shelf,
   sound lane, compact and chapter techniques, fragment entries and styles.
   The apparatus and ? dialog are included because both are
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

const argv = process.argv.slice(2);
const PORT = +(argv.includes('--port') ? argv[argv.indexOf('--port') + 1] : 8123);
const ENC = `http://127.0.0.1:${PORT}/encyclopedia/index.html`;
const ROUTES = [
  { id: 'technique-spine',     url: `${ENC}#/techniques` },
  { id: 'atom-shelf',          url: `${ENC}#/atoms` },
  { id: 'sound-lane',          url: `${ENC}#/sound` },
  { id: 'chapter-technique',   url: `${ENC}#/10-random` },
  { id: 'compact-technique',   url: `${ENC}#/technique/mulberry32-driver` },
  { id: 'fragment-technique',  url: `${ENC}#/technique/caustic-refraction-web` },
  { id: 'fragment-entry',      url: `${ENC}#/birefringent-ray-bench` },
  { id: 'style',               url: `${ENC}#/style/riso-xerox` },
  { id: 'entry+apparatus',     url: `${ENC}#/10-random`, after: 'apparatus' },
  { id: 'techniques+help',     url: `${ENC}#/techniques`, after: 'help' }
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

// Every Encyclopedia fragment, audited as its own document. Opaque-origin
// iframes cannot be inspected from the shell, so this direct sweep is required.
const { loadManifest } = await import('../lib/manifests.mjs');
const ENC_MANIFEST = loadManifest(__j(__ROOT,'encyclopedia/manifest.js'));
const DEFAULT_LANE = ENC_MANIFEST.manifest.stage?.adapter;
const FRAGS = ENC_MANIFEST.entries
  .filter((e) => e.fragment || (e.lane || DEFAULT_LANE) === 'fragment')
  .map((e) => ({ id: e.id, file: e.fragment || 'fragment.html' }));
out.fragments = {};
for (const frag of FRAGS) {
  const id = frag.id;
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/encyclopedia/content/${id}/${frag.file}`, { waitUntil: 'load' });
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
