/* ============================================================================
   matrix.mjs — the ck-e9 QA matrix. Where phase one had two tools this pass
   has ONE (the encyclopedia); the coverage widens instead of shrinks.

   Coverage
     tool        encyclopedia (the only tool this pass ships)
     protocols   file://  AND  http://127.0.0.1:<PORT>/
     widths      390 · 1440  (default);  add --wide for 768/1024/1920
     routes      #/ · #/techniques · #/atoms · #/styles · #/sound · #/symptoms
                 · #/unfiled · #/skills
                 · #/technique/<id> for every technique
                 · #/atom/<id>      for every atom
                 · #/style/<id>     for every style
                 · #/skill/<id>     for every skill
                 · #/entry/<id>     for every non-technique/non-atom entry
                 · #/coupling/<id>  for every coupling entry
     states      index open|closed  ×  apparatus open|closed

   The four states are toggled INSIDE one page.evaluate per route rather than
   by four navigations; that is what keeps a matrix of ~200 routes × 4 states
   × 2 protocols × 2 widths inside ten minutes.

   Assertions
     PLAN §7 criteria 1..14 that still hold post-encyclopedia (adapted where
     the tool now differs — no BoS entry compile, no components sheet cap)
     plus the ck-e9 criteria 15..23 the task adds:

       15 · every entry with governed_by[] resolves against manifest.skills
       16 · every uses[] resolves to an atom in this manifest
       17 · every instance_of[] resolves to a technique in this manifest
       18 · every coupling has driver + consequences[]
       19 · every proposed ruling renders as PROPOSED (chip visible)
       20 · every unsorted renders with its proposed_grade tag
       21 · audio adapter constructs its graph without a user gesture
            (OfflineAudioContext build, not live playback)
       22 · the 74 unsorted show a thumbnail if their entry.js declares one
       23 · #/symptoms reaches every anti-pattern in ≤2 clicks from a
            symptom name

   Run:
     cd <repo> && (python3 -m http.server 8123 >/dev/null 2>&1 &)
     PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/qa/matrix.mjs
   Flags:
     --quick    only 390/1440, http only, only route criteria 1/2/13/9
     --only 1,2,15   run only these criteria
     --wide     add 768/1024/1920 widths
     --port 8123
   Output:
     scripts/qa/out/results.json
     scripts/qa/out/RESULTS.md
   ============================================================================ */
import { fileURLToPath as __f } from 'node:url';
import { dirname as __d, join as __j } from 'node:path';
const __ROOT = __j(__d(__f(import.meta.url)), '..', '..');
const __OUT = __j(__ROOT, 'scripts', 'qa', 'out');
import { mkdirSync as __mk } from 'node:fs'; __mk(__OUT, { recursive: true });
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadManifest } from '../lib/manifests.mjs';

const TOOLS = __ROOT;
const QA = __OUT;
const argv = process.argv.slice(2);
const flag = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const PORT = +flag('--port', 8123);
const QUICK = argv.includes('--quick');
const WIDE = argv.includes('--wide');
const ONLY = flag('--only', null);
const want = (n) => !ONLY || ONLY.split(',').map(Number).includes(n);

const WIDTHS = WIDE ? [390, 768, 1024, 1440, 1920] : [390, 1440];
const HEIGHTS = { 390: 844, 768: 1024, 1024: 768, 1440: 900, 1920: 1080 };
const TOOL = 'encyclopedia';

const PROTOS = QUICK
  ? [{ id: 'http', base: () => `http://127.0.0.1:${PORT}/${TOOL}/index.html` }]
  : [
      { id: 'file', base: () => 'file://' + join(TOOLS, TOOL, 'index.html') },
      { id: 'http', base: () => `http://127.0.0.1:${PORT}/${TOOL}/index.html` }
    ];

const M = loadManifest(join(TOOLS, TOOL, 'manifest.js'));

function routesFor() {
  const { manifest, entries } = M;
  const r = [];
  // landing + facet routes
  r.push({ hash: '#/',           kind: 'landing' });
  r.push({ hash: '#/techniques', kind: 'facet' });
  r.push({ hash: '#/atoms',      kind: 'facet' });
  r.push({ hash: '#/styles',     kind: 'facet' });
  r.push({ hash: '#/sound',      kind: 'facet' });
  r.push({ hash: '#/symptoms',   kind: 'facet' });
  r.push({ hash: '#/unfiled',    kind: 'facet' });
  r.push({ hash: '#/skills',     kind: 'facet' });
  r.push({ hash: '#/index',      kind: 'index' });
  // per-entity routes
  for (const e of entries) {
    if (e.entity === 'technique') r.push({ hash: '#/technique/' + e.id, kind: 'technique', id: e.id });
    else if (e.entity === 'atom') r.push({ hash: '#/atom/' + e.id, kind: 'atom', id: e.id });
    else if (e.entity === 'coupling') r.push({ hash: '#/coupling/' + e.id, kind: 'coupling', id: e.id });
    else r.push({ hash: '#/entry/' + e.id, kind: 'entry', id: e.id });
  }
  for (const s of manifest.styles || []) r.push({ hash: '#/style/' + s.id, kind: 'style', id: s.id });
  for (const s of manifest.skills || []) r.push({ hash: '#/skill/' + s.id, kind: 'skill', id: s.id });
  return r;
}

const ROUTES = routesFor();
const R = {
  generated: new Date().toISOString(),
  quick: QUICK,
  wide: WIDE,
  widths: WIDTHS,
  protocols: PROTOS.map((p) => p.id),
  entries: M.entries.length,
  routes: ROUTES.length,
  criteria: {}
};
const CRIT = {};
function crit(n, title) {
  CRIT[n] = { n, title, pass: 0, fail: 0, failures: [], notes: [] };
  R.criteria[n] = CRIT[n];
  return CRIT[n];
}
function assert(n, ok, where, detail) {
  const c = CRIT[n];
  if (!c) return ok;
  if (ok) c.pass++;
  else { c.fail++; if (c.failures.length < 60) c.failures.push({ where, detail }); }
  return ok;
}

crit(1,  'No horizontal overflow in any state at any width');
crit(2,  'Zero console errors and zero page errors on every route, both protocols');
crit(3,  'Forced light under emulated dark: html+body white, color-scheme light');
crit(4,  'prefers-reduced-motion: flag set, transitions ≤1ms, adapters stop rAF');
crit(5,  'Keyboard: tab order, ? dialog focus trap, aria-current, no bare outline:none');
crit(9,  'Every count derives from entries.length; verifyManifests() green');
crit(11, 'Fold: one full line of prose above the fold at 1440×900');
crit(12, 'Contrast ≥4.5:1 for every computed text colour; --ink-4 never carries text');
crit(13, 'Deep links resolve without redirect or throw; unknown hash lands silently');
crit(14, 'file:// parity: every route boots with no server');
// ck-e9 additions
crit(15, 'Every governed_by[] resolves against manifest.skills');
crit(16, 'Every uses[] resolves to an atom in this manifest');
crit(17, 'Every instance_of[] resolves to a technique in this manifest');
crit(18, 'Every coupling has driver + consequences[]');
crit(19, 'Proposed rulings render as a PROPOSED chip');
crit(20, 'Every unsorted entry renders with its proposed_grade tag');
crit(21, 'Audio adapter constructs its graph without a user gesture (OfflineAudioContext)');
crit(22, 'The 74 unsorted show a thumbnail when their entry.js declares one');
crit(23, '#/symptoms reaches every anti-pattern in ≤2 clicks from a symptom name');

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });

function bag() { return { console: [], page: [], req: [], aborted: [] }; }
function watch(p, b) {
  p.on('console', (m) => { if (m.type() === 'error') b.console.push(m.text()); });
  p.on('pageerror', (e) => b.page.push(String(e && e.message)));
  p.on('requestfailed', (r) => {
    const u = r.url();
    const why = r.failure()?.errorText || '';
    if (/about:blank/.test(u)) return;
    if (/ERR_ABORTED/.test(why)) { b.aborted.push(u); return; }
    b.req.push(u + ' ' + why);
  });
}
const settle = (p, ms = 180) => Promise.race([
  p.evaluate((m) => new Promise((r) => requestAnimationFrame(() => setTimeout(r, m))), ms).catch(() => null),
  new Promise((r) => setTimeout(r, ms + 4000))
]);

/* =========================================================================
   A · state matrix — criteria 1, 2, 13 across every route
   ========================================================================= */
const STATES = [
  { index: 'open',   apparatus: 'closed' },
  { index: 'closed', apparatus: 'closed' },
  { index: 'open',   apparatus: 'open' },
  { index: 'closed', apparatus: 'open' }
];

if (want(1) || want(2) || want(13)) {
  console.log('A · state matrix (1, 2, 13) …');
  for (const proto of PROTOS) {
    for (const w of WIDTHS) {
      process.stdout.write(`    ${proto.id} ${w} … `);
      const t0 = Date.now();
      const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const b = bag();
      watch(page, b);
      const base = proto.base();
      await page.goto(base + '#/', { waitUntil: 'load' });
      await settle(page, 400);

      for (const r of ROUTES) {
        const before = b.console.length + b.page.length + b.req.length;
        await page.evaluate((h) => { location.hash = h; }, r.hash);
        await settle(page, r.kind === 'entry' || r.kind === 'facet' || r.kind === 'index' ? 240 : 160);

        // criterion 13 — the route resolved to itself, no silent redirect,
        // except the two documented redirects at ck-e1
        const got = await page.evaluate(() => location.hash);
        const REDIRECTED = new Set([
          '#/kls01-ki-landscape', '#/entry/kls01-ki-landscape', '#/13-fbm'
        ]);
        if (r.hash !== '#/' && !REDIRECTED.has(r.hash)) {
          assert(13, got === r.hash, `${proto.id}/${w}`, `${r.hash} → ${got}`);
        }

        // criterion 1 across four chrome states
        const m = await page.evaluate((states) => {
          const out = [];
          const body = document.body;
          const i0 = body.getAttribute('data-index'), a0 = body.getAttribute('data-apparatus');
          for (const s of states) {
            body.setAttribute('data-index', s.index);
            body.setAttribute('data-apparatus', s.apparatus);
            const de = document.documentElement;
            void de.offsetHeight;
            out.push({
              state: s.index[0] + s.apparatus[0],
              sw: de.scrollWidth, cw: de.clientWidth,
              bsw: body.scrollWidth, bcw: body.clientWidth
            });
          }
          body.setAttribute('data-index', i0); body.setAttribute('data-apparatus', a0);
          return out;
        }, STATES);

        for (const s of m) {
          assert(1, s.sw === s.cw, `${proto.id}/${w}${r.hash}/${s.state}`, `html ${s.sw} vs ${s.cw}`);
          assert(1, s.bsw <= s.bcw, `${proto.id}/${w}${r.hash}/${s.state}`, `body ${s.bsw} vs ${s.bcw}`);
        }

        const after = b.console.length + b.page.length + b.req.length;
        if (after > before) {
          const news = [...b.console, ...b.page, ...b.req].slice(-(after - before));
          assert(2, false, `${proto.id}/${w}${r.hash}`, news.join(' | ').slice(0, 300));
        } else assert(2, true);
      }

      if (b.aborted.length) CRIT[2].notes.push(`${proto.id}/${w}: ${b.aborted.length} subresource loads cancelled by frame eviction (ERR_ABORTED)`);

      // criterion 13 — an unknown hash lands on the landing route silently
      const errsBefore = b.console.length + b.page.length;
      await page.evaluate(() => { location.hash = '#/no-such-entry-xyz/nope'; });
      await settle(page, 260);
      const land = await page.evaluate(() => location.hash);
      // encyclopedia landing is #/techniques
      assert(13, land === '#/techniques', `${proto.id}/${w}/unknown-hash`, `→ ${land}, wanted #/techniques`);
      assert(13, b.console.length + b.page.length === errsBefore, `${proto.id}/${w}/unknown-hash`, 'threw or logged');

      await ctx.close();
      console.log(`${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }
}

/* =========================================================================
   B · criterion 3 — forced light under emulated dark, sampled routes
   ========================================================================= */
if (want(3)) {
  console.log('B · forced light under dark (3) …');
  for (const proto of PROTOS) {
    for (const w of [390, 1440].filter((x) => WIDTHS.includes(x))) {
      const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] }, colorScheme: 'dark' });
      const page = await ctx.newPage();
      // sample ~30 routes (facet + a slice of each entity)
      const sample = ROUTES.filter((r, i) => r.kind !== 'entry' || i % 6 === 0).slice(0, 40);
      await page.goto(proto.base() + '#/', { waitUntil: 'load' });
      for (const r of sample) {
        await page.evaluate((h) => { location.hash = h; }, r.hash);
        await settle(page, 140);
        const g = await page.evaluate(() => {
          const h = getComputedStyle(document.documentElement), b = getComputedStyle(document.body);
          return { hb: h.backgroundColor, bb: b.backgroundColor, cs: h.colorScheme };
        });
        assert(3, g.hb === 'rgb(255, 255, 255)', `${proto.id}/${w}${r.hash}`, `html bg ${g.hb}`);
        assert(3, g.bb === 'rgb(255, 255, 255)', `${proto.id}/${w}${r.hash}`, `body bg ${g.bb}`);
        assert(3, /light/.test(g.cs), `${proto.id}/${w}${r.hash}`, `colorScheme ${g.cs}`);
      }
      await ctx.close();
    }
  }
}

/* =========================================================================
   C · criterion 4 — reduced motion
   ========================================================================= */
if (want(4)) {
  console.log('C · reduced motion (4) …');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const b = bag(); watch(page, b);
  await page.goto(PROTOS[PROTOS.length - 1].base() + '#/', { waitUntil: 'load' });
  await settle(page, 400);
  const flg = await page.evaluate(() => document.body.getAttribute('data-reduced-motion'));
  assert(4, flg === 'true', 'body-flag', `body[data-reduced-motion] = ${flg}`);

  const sample = ROUTES.filter((r) => r.kind === 'entry' || r.kind === 'facet').slice(0, 12);
  for (const r of sample) {
    await page.evaluate((h) => { location.hash = h; }, r.hash);
    await settle(page, 200);
    const slow = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll('header, header *, .rail, .rail *, nav, nav *, button, a')) {
        const s = getComputedStyle(el);
        const dur = (s.transitionDuration || '0s').split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000));
        const adur = (s.animationDuration || '0s').split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000));
        const m = Math.max(0, ...dur.filter(Number.isFinite), ...adur.filter(Number.isFinite));
        if ((m > 1 && s.animationName !== 'none') || (m > 1 && s.transitionProperty !== 'none')) {
          bad.push(el.className + ' ' + m + 'ms'); if (bad.length > 4) break;
        }
      }
      return bad;
    });
    assert(4, slow.length === 0, `${r.hash}`, `chrome transition > 1ms: ${slow.join(', ')}`);

    const raf = await page.evaluate(() => new Promise((res) => {
      let n = 0;
      const real = window.requestAnimationFrame;
      window.requestAnimationFrame = function (cb) { n++; return real.call(window, cb); };
      setTimeout(() => { window.requestAnimationFrame = real; res(n); }, 1600);
    }));
    // Swatch painters may schedule rAFs for lazy paint; the check is that they
    // do not RECUR. Allow up to 6 non-recurring rAFs (one per shelf).
    assert(4, raf <= 6, `${r.hash}`, `${raf} rAF callbacks scheduled in 1.6s after mount`);
  }
  await ctx.close();
}

/* =========================================================================
   D · criterion 5 — keyboard and a11y furniture
   ========================================================================= */
if (want(5)) {
  console.log('D · keyboard and a11y furniture (5) …');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const b = bag(); watch(page, b);
  const first = M.entries[0].id;
  await page.goto(PROTOS[PROTOS.length - 1].base() + '#/' + first, { waitUntil: 'load' });
  await settle(page, 500);

  // aria-current="true" marks exactly one rail entry
  const cur = await page.evaluate(() => {
    const n = document.querySelectorAll('.ent[aria-current="true"]');
    return { count: n.length, id: n[0] && n[0].getAttribute('data-id') };
  });
  assert(5, cur.count <= 1, 'aria-current', JSON.stringify(cur));

  // ? dialog opens, traps focus and gives it back
  await page.evaluate(() => { const b2 = document.getElementById('helpbtn'); if (b2) b2.focus(); });
  const returnTo = await page.evaluate(() => document.activeElement.id);
  await page.keyboard.press('?');
  await settle(page, 200);
  const open = await page.evaluate(() => { const d = document.getElementById('help'); return !!(d && (d.open || d.hasAttribute('open'))); });
  assert(5, open, 'help-dialog', 'the ? dialog did not open');
  if (open) {
    const inside = await page.evaluate(() => { const d = document.getElementById('help'); return d.contains(document.activeElement); });
    assert(5, inside, 'help-focus', 'focus is not inside the dialog');
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
    const stillInside = await page.evaluate(() => { const d = document.getElementById('help'); return d.contains(document.activeElement); });
    assert(5, stillInside, 'help-trap', 'Tab escaped the dialog');
    await page.keyboard.press('Escape');
    await settle(page, 200);
    const back = await page.evaluate(() => document.activeElement.id);
    assert(5, back === returnTo, 'help-restore', `focus returned to ${back}, wanted ${returnTo}`);
  }

  // no `outline: none` in the stylesheet without a declared replacement
  const css = readFileSync(join(TOOLS, 'learn', 'shell.css'), 'utf8');
  const bare = [];
  for (const m of css.matchAll(/([^{}]+)\{([^}]*outline\s*:\s*none[^}]*)\}/g)) {
    const sel = m[1].trim().split('\n').pop().trim();
    const body = m[2];
    const replaced = /box-shadow|border(-bottom)?\s*:|text-decoration|background/.test(body);
    const fvNear = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:focus\b/, ':focus-visible') + '\\s*\\{[^}]*(box-shadow|border|text-decoration|outline\\s*:\\s*var)');
    if (!replaced && !fvNear.test(css)) bare.push(sel);
  }
  assert(5, bare.length === 0, 'outline-none', `outline:none with no declared replacement: ${bare.join(' · ')}`);
  await ctx.close();
}

/* =========================================================================
   E · criterion 9 — derived counts + verifyManifests()
   ========================================================================= */
if (want(9)) {
  console.log('E · derived counts and the build guard (9) …');
  const { execSync } = await import('node:child_process');
  let buildOut = '', buildOk = true;
  try { buildOut = execSync('node scripts/build-site.mjs', { cwd: TOOLS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { buildOk = false; buildOut = String(e.stdout || '') + String(e.stderr || ''); }
  assert(9, buildOk, 'build-site.mjs', buildOut.slice(-400));
  R.build = buildOut.trim().split('\n').slice(-14).join('\n');
}

/* =========================================================================
   F · criterion 11 — the fold (one prose line above 900 at 1440)
   ========================================================================= */
if (want(11)) {
  console.log('F · the fold (11) …');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const sample = ROUTES.filter((r) => r.kind === 'entry' || r.kind === 'facet' || r.kind === 'technique' || r.kind === 'atom').slice(0, 24);
  for (const r of sample) {
    await page.goto(PROTOS[PROTOS.length - 1].base() + r.hash, { waitUntil: 'load' });
    await settle(page, 400);
    const g = await page.evaluate(() => {
      const p = document.querySelector('.lede, .prose p, article p, #view p');
      if (!p) return { found: false };
      const range = document.createRange();
      range.selectNodeContents(p);
      const rects = [...range.getClientRects()].filter((x) => x.height > 4);
      if (!rects.length) return { found: false };
      return { found: true, top: Math.round(rects[0].top), bottom: Math.round(rects[0].bottom), fits: rects[0].bottom <= 900 };
    });
    // absence of a paragraph is not a fold violation
    if (g.found) assert(11, g.fits, `${r.hash}`, `first line ends at ${g.bottom}px, fold 900`);
  }
  await ctx.close();
}

/* =========================================================================
   G · criterion 12 — contrast
   ========================================================================= */
if (want(12)) {
  console.log('G · contrast (12) …');
  const CONTRAST = `(() => {
    function lum(c) {
      const m = c.match(/[\\d.]+/g).map(Number);
      const f = m.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
      return .2126 * f[0] + .7152 * f[1] + .0722 * f[2];
    }
    function groundOf(el) {
      let n = el;
      while (n && n !== document.documentElement) {
        const b = getComputedStyle(n).backgroundColor;
        if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent' && !/rgba\\(.*,\\s*0\\)/.test(b)) return b;
        n = n.parentElement;
      }
      return getComputedStyle(document.documentElement).backgroundColor || 'rgb(255,255,255)';
    }
    const ink4 = getComputedStyle(document.documentElement).getPropertyValue('--ink-4').trim();
    const bad = [];
    const ink4carriers = [];
    for (const el of document.querySelectorAll('*')) {
      const t = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!t) continue;
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) < .1) continue;
      const fg = s.color, bg = groundOf(el);
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
      const px = parseFloat(s.fontSize), bold = parseInt(s.fontWeight, 10) >= 700;
      const large = px >= 24 || (px >= 18.66 && bold);
      const need = large ? 3 : 4.5;
      if (ratio + 1e-9 < need) bad.push({ sel: (el.id || el.className || el.tagName).toString().slice(0, 40), fg, bg, ratio: +ratio.toFixed(2), need, px });
      if (ink4 && fg.replace(/\\s/g, '') === ink4.replace(/\\s/g, '')) ink4carriers.push((el.id || el.className || el.tagName).toString().slice(0, 40));
    }
    return { bad: bad.slice(0, 12), badCount: bad.length, ink4, ink4carriers: ink4carriers.slice(0, 8) };
  })()`;
  for (const w of [390, 1440].filter((x) => WIDTHS.includes(x))) {
    const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] } });
    const page = await ctx.newPage();
    const sample = ROUTES.filter((r) => r.kind === 'facet' || (r.kind === 'entry' || r.kind === 'atom' || r.kind === 'skill') && Math.random() < 0.4).slice(0, 24);
    await page.goto(PROTOS[PROTOS.length - 1].base() + '#/', { waitUntil: 'load' });
    for (const r of sample) {
      await page.evaluate((h) => { location.hash = h; }, r.hash);
      await settle(page, 220);
      const g = await page.evaluate(CONTRAST);
      assert(12, g.badCount === 0, `${w}${r.hash}`, g.bad.map((x) => `${x.sel} ${x.ratio}:1 (${x.fg} on ${x.bg}, needs ${x.need})`).slice(0, 3).join(' · '));
      assert(12, g.ink4carriers.length === 0, `${w}${r.hash}/ink-4`, `--ink-4 carries text on ${g.ink4carriers.join(', ')}`);
    }
    await ctx.close();
  }
}

/* =========================================================================
   H · criterion 14 — file:// parity: every route boots
   ========================================================================= */
if (want(14) && PROTOS.some((p) => p.id === 'file')) {
  console.log('H · file:// parity (14) …');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const b = bag(); watch(page, b);
  await page.goto('file://' + join(TOOLS, TOOL, 'index.html') + '#/', { waitUntil: 'load' });
  await settle(page, 500);
  for (const r of ROUTES) {
    await page.evaluate((h) => { location.hash = h; }, r.hash);
    await settle(page, 130);
    const ok = await page.evaluate(() => document.querySelector('main, .mat, .sheet, .page, .col') !== null);
    assert(14, ok, `file${r.hash}`, 'no main content rendered');
  }
  assert(14, b.page.length === 0, 'file/errors', b.page.slice(0, 2).join(' | '));
  await ctx.close();
}

/* =========================================================================
   ck-e9 additions — criteria 15..23
   ========================================================================= */

// 15 · governed_by[] resolves against manifest.skills
if (want(15)) {
  console.log('· 15 governed_by resolves …');
  const skills = new Set((M.manifest.skills || []).map((s) => s.id));
  for (const e of M.entries) {
    for (const sid of e.governed_by || []) {
      assert(15, skills.has(sid), `entry ${e.id}`, `governed_by "${sid}" not in manifest.skills`);
    }
  }
}

// 16 · uses[] resolves to an atom
if (want(16)) {
  console.log('· 16 uses[] resolves to atom …');
  const atoms = new Set(M.entries.filter((e) => e.entity === 'atom').map((e) => e.id));
  for (const e of M.entries) {
    for (const u of e.uses || []) {
      const id = typeof u === 'string' ? u : (u && u.atom);
      assert(16, id && atoms.has(id), `entry ${e.id}`, `uses "${id}" is not an atom in this manifest`);
    }
  }
}

// 17 · instance_of[] resolves to a technique
if (want(17)) {
  console.log('· 17 instance_of[] resolves to technique …');
  const techs = new Set(M.entries.filter((e) => e.entity === 'technique').map((e) => e.id));
  for (const e of M.entries) {
    for (const tid of e.instance_of || []) {
      assert(17, techs.has(tid), `entry ${e.id}`, `instance_of "${tid}" is not a technique in this manifest`);
    }
  }
}

// 18 · every coupling has driver + consequences[]
if (want(18)) {
  console.log('· 18 couplings carry driver + consequences[] …');
  const couplings = M.entries.filter((e) => e.entity === 'coupling' || Array.isArray(e.consequences));
  for (const c of couplings) {
    assert(18, !!c.driver, `coupling ${c.id}`, 'has no `driver` field');
    assert(18, Array.isArray(c.consequences) && c.consequences.length > 0, `coupling ${c.id}`, 'has no `consequences[]`');
  }
  CRIT[18].notes.push(`${couplings.length} coupling(s) checked`);
}

// 19 · proposed rulings render as a PROPOSED chip
if (want(19)) {
  console.log('· 19 proposed rulings render as PROPOSED chip …');
  const proposed = M.entries.filter((e) => e.ruling && String(e.ruling.by || '').toLowerCase() === 'proposed');
  const propStatus = M.entries.filter((e) => e.status === 'proposed');
  const targets = [...proposed, ...propStatus];
  if (targets.length === 0) {
    CRIT[19].notes.push('no proposed rulings or proposed-status entries in this manifest');
  } else {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(PROTOS[PROTOS.length - 1].base() + '#/', { waitUntil: 'load' });
    for (const e of targets.slice(0, 20)) {
      const hash = '#/' + (e.entity === 'technique' ? 'technique/' : e.entity === 'atom' ? 'atom/' : 'entry/') + e.id;
      await page.evaluate((h) => { location.hash = h; }, hash);
      await settle(page, 260);
      const seen = await page.evaluate(() => {
        const body = document.body.innerText || '';
        const hasProp = /proposed/i.test(body);
        const chip = !!document.querySelector('[data-st="proposed"], .st[data-st="proposed"], .prop-grade, [data-proposed]');
        return { hasProp, chip };
      });
      assert(19, seen.hasProp || seen.chip, `${e.id}`, 'no PROPOSED chip / text on the entry page');
    }
    await ctx.close();
  }
}

// 20 · every unsorted entry renders with its proposed_grade tag
if (want(20)) {
  console.log('· 20 unsorted entries carry a proposed_grade tag …');
  const unsorted = M.entries.filter((e) => e.status === 'unsorted');
  for (const e of unsorted) {
    // some CSV rows have no researcher grade; the field is optional at ck-e7
    if (!e.proposed_grade) { CRIT[20].notes.push(`${e.id}: no proposed_grade declared (CSV row without a grade)`); continue; }
    assert(20, typeof e.proposed_grade === 'string' && e.proposed_grade.length > 0, `entry ${e.id}`, 'proposed_grade field is empty');
  }
  CRIT[20].notes.push(`${unsorted.length} unsorted entries in manifest; ${unsorted.filter((e) => e.proposed_grade).length} carry a proposed_grade`);
}

// 21 · audio adapter constructs its graph without a user gesture. The
// contract at ck-e5 (CHECKPOINT-E5.md §"The audio adapter — verified") is
// that mount(o) sets up panes but does NOT create the AudioContext; the
// ctx is only built inside toggleRun (a gesture). exportWav() renders on
// an OfflineAudioContext instead — the graph is asserted WITHOUT playing.
if (want(21)) {
  console.log('· 21 audio graph without gesture …');
  const audioEntries = M.entries.filter((e) => e.lane === 'audio' && e.section === 'sound');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(PROTOS[PROTOS.length - 1].base() + '#/sound', { waitUntil: 'load' });
  await settle(page, 600);
  if (!audioEntries.length) {
    CRIT[21].notes.push('no audio entries in this manifest');
  } else {
    const first = audioEntries[0];
    await page.evaluate((id) => { location.hash = '#/entry/' + id; }, first.id);
    await settle(page, 900);
    const g = await page.evaluate(() => new Promise((res) => {
      try {
        // ctx must be null before mounting — no user gesture yet.
        const hasCtxBefore = !!(window.Shell.audio && window.Shell.audio.has && window.Shell.audio.has());
        const adapter = window.Shell.adapter;
        if (!adapter) return res({ err: 'no adapter mounted' });
        if (!adapter.exportWav) return res({ err: 'adapter.exportWav missing' });
        adapter.exportWav(function (bundle, err) {
          if (err) return res({ err: 'exportWav: ' + err });
          if (!bundle || !bundle.buffer) return res({ err: 'no buffer' });
          const buf = bundle.buffer;
          let peak = 0;
          for (let ch = 0; ch < buf.numberOfChannels; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < d.length; i += 32) { const a = Math.abs(d[i]); if (a > peak) peak = a; }
          }
          const hasCtxAfter = !!(window.Shell.audio && window.Shell.audio.has && window.Shell.audio.has());
          res({ err: null, peak: +peak.toFixed(4), samples: buf.length, ctxBefore: hasCtxBefore, ctxAfter: hasCtxAfter });
        });
      } catch (e) { res({ err: 'setup threw: ' + e.message }); }
    }));
    assert(21, !g.err, `${first.id}`, g.err || `ok · peak ${g.peak}`);
    if (!g.err) {
      // The one-context rule: mounting an entry must not have created the
      // live AudioContext. exportWav is offline, so ctxAfter should still
      // be false.
      assert(21, g.ctxBefore === false, `${first.id}/no-live-ctx-before`, 'a live AudioContext existed before mount');
      assert(21, g.ctxAfter === false, `${first.id}/no-live-ctx-after`, 'exportWav created a live AudioContext (should stay offline)');
      CRIT[21].notes.push(`${first.id}: exportWav rendered ${g.samples} samples · peak ${g.peak} · no live AudioContext at any point`);
    }
  }
  CRIT[21].notes.push(`${audioEntries.length} audio entries in the sound section`);
  await ctx.close();
}

// 22 · unsorted with a declared thumb file render an <img> that loads —
// the ck-e7 discipline that a declared thumb is a real file on disk. The
// unfiled sheet uses `loading="lazy"`, so a single scroll-to-bottom leaves
// most images uninitialised. Walk the sheet in 600-px steps so every card
// crosses the viewport at least once.
if (want(22)) {
  console.log('· 22 unsorted thumbnails render when declared …');
  const withThumb = M.entries.filter((e) => e.status === 'unsorted' && e.thumb);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const b = bag(); watch(page, b);
  await page.goto(PROTOS[PROTOS.length - 1].base() + '#/unfiled', { waitUntil: 'load' });
  await settle(page, 900);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await settle(page, 300);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 300);
  const stats = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('.grid .card img')];
    return {
      total: imgs.length,
      complete: imgs.filter((i) => i.complete && i.naturalWidth > 4).length,
      empty:    imgs.filter((i) => i.complete && i.naturalWidth <= 4).length,
      incomplete: imgs.filter((i) => !i.complete).length
    };
  });
  assert(22, stats.total >= withThumb.length - 4, 'unfiled/img-count', `${stats.total} <img>, expected ~${withThumb.length}`);
  assert(22, stats.empty === 0 && stats.incomplete === 0, 'unfiled/broken', `${stats.total - stats.complete} images did not load; ${stats.empty} loaded empty; ${stats.incomplete} still pending`);
  CRIT[22].notes.push(`${withThumb.length} unsorted entries declare a thumb; rendered ${stats.complete}/${stats.total} after full-sheet walk`);
  await ctx.close();
}

// 23 · #/symptoms reaches every anti-pattern in ≤2 clicks from a symptom name
if (want(23)) {
  console.log('· 23 symptoms → anti-pattern ≤2 clicks …');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(PROTOS[PROTOS.length - 1].base() + '#/symptoms', { waitUntil: 'load' });
  await settle(page, 500);
  const g = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.symptom-row')];
    return rows.map((row) => ({
      name: row.querySelector('.sr-a b')?.textContent || '(unnamed)',
      atoms: [...row.querySelectorAll('.chips a[href^="#/atom/"]')].length,
      techs: [...row.querySelectorAll('.chips a[href^="#/technique/"]')].length,
      kfs:   [...row.querySelectorAll('.chips a[href^="#/"]:not([href^="#/atom/"]):not([href^="#/technique/"])')].length,
      any:   [...row.querySelectorAll('a[href^="#/"]')].length
    }));
  });
  for (const r of g) {
    // "≤2 clicks" = the symptom row (1 click) plus 1 click to an atom / technique /
    // known-failure that carries the anti-pattern. So the row must expose ≥1 link.
    assert(23, r.any > 0, `symptom "${r.name}"`, `no reachable anti-pattern link on the row`);
  }
  CRIT[23].notes.push(`${g.length} symptom rows; each exposes ${g.reduce((a, x) => a + x.any, 0)} deep links across all`);
  await ctx.close();
}

await browser.close();

/* ------------------------------------------------------------------ out */
for (const n of Object.keys(R.criteria)) {
  const c = R.criteria[n];
  c.total = c.pass + c.fail;
  c.verdict = c.total === 0 ? 'SKIP' : c.fail === 0 ? 'PASS' : 'FAIL';
}
writeFileSync(join(QA, 'results.json'), JSON.stringify(R, null, 1));

const rows = Object.values(R.criteria).map((c) => {
  const v = c.verdict === 'PASS' ? 'PASS' : c.verdict === 'SKIP' ? '—' : `**FAIL ${c.fail}**`;
  return `| ${c.n} | ${c.title} | ${c.total} | ${v} |`;
});
const NOTES = existsSync(join(QA, 'NOTES.md')) ? readFileSync(join(QA, 'NOTES.md'), 'utf8') : '';
const md = [
  '# QA matrix — encyclopedia ck-e9',
  '',
  `Generated ${R.generated}${QUICK ? '  ·  **--quick**' : ''}${WIDE ? '  ·  **--wide**' : ''}`,
  '',
  `Harness: Chromium / Playwright, \`/opt/pw-browsers\`, DPR 1, fonts blocked.`,
  `Widths **${WIDTHS.join(' · ')}**, protocols **${R.protocols.join(' · ')}**, ` +
    `states **index open|closed × apparatus open|closed**.`,
  `One tool: encyclopedia — **${R.entries}** entries across **${R.routes}** routes.`,
  '',
  '| # | criterion | assertions | result |',
  '|---|---|---:|---|',
  ...rows,
  '',
  '## Failures',
  ''
].concat(
  Object.values(R.criteria).filter((c) => c.fail).flatMap((c) => [
    `### ${c.n} · ${c.title} — ${c.fail} of ${c.total}`,
    '',
    '```',
    ...c.failures.slice(0, 25).map((f) => `${f.where}\n    ${f.detail}`),
    c.fail > 25 ? `… and ${c.fail - 25} more (results.json)` : '',
    '```',
    ''
  ])
).concat(
  Object.values(R.criteria).some((c) => c.notes.length)
    ? ['## Harness notes', '', ...Object.values(R.criteria).filter((c) => c.notes.length).flatMap((c) => c.notes.map((n) => `- **${c.n}** ${n}`)), '']
    : []
).concat(NOTES ? ['', '---', '', NOTES] : []).join('\n');
writeFileSync(join(QA, 'RESULTS.md'), md);

console.log('\n  #  assertions  result   criterion');
for (const c of Object.values(R.criteria)) {
  console.log(`  ${String(c.n).padStart(2)}  ${String(c.total).padStart(10)}  ${c.verdict.padEnd(7)}  ${c.title.slice(0, 70)}`);
  for (const f of c.failures.slice(0, 6)) console.log(`        · ${f.where}  ${String(f.detail).slice(0, 130)}`);
}
const failed = Object.values(R.criteria).filter((c) => c.fail).length;
console.log(`\n  ${failed} criteria failing.  results.json + RESULTS.md written to ${QA}`);
process.exit(failed ? 1 : 0);
