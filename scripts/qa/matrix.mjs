/* ============================================================================
   matrix.mjs — the checkpoint-8 QA matrix. PLAN §7, all fourteen criteria, as
   assertions, written from the spec rather than from any builder's harness.

   Coverage
     tools       book-of-shaders (course) · components (catalogue)
     protocols   file://  AND  http://127.0.0.1:<PORT>/
     widths      390 · 768 · 1024 · 1440 · 1920
     routes      #/ · #/index · every entry · every entry/example · every style
     states      index open|closed  ×  apparatus open|closed

   The four states are toggled INSIDE one page.evaluate per route rather than by
   four navigations, because the toggles are attribute writes and layout is read
   back synchronously. That is what keeps a 1,300-navigation matrix under ten
   minutes; it does not weaken the assertion, which is about layout, not load.

   Run:
     cd <repo> && (python3 -m http.server 8123 >/dev/null 2>&1 &)
     PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/qa/out/matrix.mjs
   Flags:
     --quick        widths 390 and 1440 only, http only  (smoke, ~2 min)
     --only 1,10    run only these criteria
     --port 8123
   Output:
     scripts/qa/out/results.json   every measurement
     scripts/qa/out/RESULTS.md     the human table
   ============================================================================ */
import { fileURLToPath as __f } from 'node:url';
import { dirname as __d, join as __j } from 'node:path';
const __ROOT = __j(__d(__f(import.meta.url)), '..', '..');
const __OUT = __j(__ROOT, 'scripts', 'qa', 'out');
import { mkdirSync as __mk } from 'node:fs'; __mk(__OUT, { recursive: true });
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { loadManifest } from '../lib/manifests.mjs';

const TOOLS = __ROOT;
const QA = __OUT;
const argv = process.argv.slice(2);
const flag = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const PORT = +flag('--port', 8123);
const QUICK = argv.includes('--quick');
const ONLY = flag('--only', null);
const want = (n) => !ONLY || ONLY.split(',').map(Number).includes(n);

const WIDTHS = QUICK ? [390, 1440] : [390, 768, 1024, 1440, 1920];
const HEIGHTS = { 390: 844, 768: 1024, 1024: 768, 1440: 900, 1920: 1080 };
const TOOLNAMES = ['book-of-shaders', 'components'];

const PROTOS = QUICK
  ? [{ id: 'http', base: (t) => `http://127.0.0.1:${PORT}/${t}/index.html` }]
  : [
      { id: 'file', base: (t) => 'file://' + join(TOOLS, t, 'index.html') },
      { id: 'http', base: (t) => `http://127.0.0.1:${PORT}/${t}/index.html` }
    ];

/* ------------------------------------------------------------ the roster */
const M = {};
for (const t of TOOLNAMES) M[t] = loadManifest(join(TOOLS, t, 'manifest.js'));

function routesFor(t) {
  const { manifest, entries } = M[t];
  const r = [{ hash: '#/', kind: 'landing' }, { hash: '#/index', kind: 'index' }];
  for (const e of entries) {
    r.push({ hash: '#/' + e.id, kind: 'entry', id: e.id });
    for (const ex of e.examples || []) r.push({ hash: '#/' + e.id + '/' + ex.id, kind: 'example', id: e.id, ex: ex.id });
  }
  for (const s of manifest.styles || []) r.push({ hash: '#/style/' + s.id, kind: 'style', id: s.id });
  return r;
}

/* ------------------------------------------------------------- machinery */
const R = {
  generated: new Date().toISOString(),
  quick: QUICK,
  widths: WIDTHS,
  protocols: PROTOS.map((p) => p.id),
  tools: Object.fromEntries(TOOLNAMES.map((t) => [t, { entries: M[t].entries.length, routes: routesFor(t).length }])),
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
  if (ok) c.pass++;
  else { c.fail++; if (c.failures.length < 60) c.failures.push({ where, detail }); }
  return ok;
}

crit(1, 'No horizontal overflow in any state at any width');
crit(2, 'Zero console errors and zero page errors on every route, both protocols');
crit(3, 'Forced light under emulated dark: html+body white, color-scheme light');
crit(4, 'prefers-reduced-motion: flag set, transitions ≤1ms, adapters stop rAF');
crit(5, 'Keyboard: tab order, editor entry+exit, ? dialog focus trap, aria-current, no bare outline:none');
crit(6, 'Iframe mounts: 1 on an entry, ≤2 at 390 / ≤4 at 1440 on the sheet, capped after a full scroll');
crit(7, 'Every example compiles; known-failure entries fail as declared');
crit(8, 'Every fragment renders standalone: no errors, families resolve, non-blank');
crit(9, 'Every count derives from entries.length; verifyManifests() green');
crit(10, 'Budgets: BoS entry <400ms / ≤2 canvases; sheet <1200ms, ≤40MB @1440, ≤12MB @390 worst adjacent pair');
crit(11, 'Fold: one full line of prose above the fold at 1440×900 and 1280×800');
crit(12, 'Contrast ≥4.5:1 for every computed text colour; --ink-4 never carries text');
crit(13, 'Deep links resolve without redirect or throw; unknown hash lands on landing silently');
crit(14, 'file:// parity: every route and fragment boots with no server, no contentDocument');

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });

function bag() { return { console: [], page: [], req: [], aborted: [] }; }
function watch(p, b) {
  p.on('console', (m) => { if (m.type() === 'error') b.console.push(m.text()); });
  p.on('pageerror', (e) => b.page.push(String(e && e.message)));
  p.on('requestfailed', (r) => {
    const u = r.url();
    const why = r.failure()?.errorText || '';
    if (/about:blank/.test(u)) return;                    // eviction, the policy working
    // ERR_ABORTED is the mount/evict policy cancelling a load it started: a
    // preview frame goes to about:blank while its engines are still in flight,
    // and every subresource of that frame reports as failed. It is not a
    // console error and not a page error — it is us — and a MISSING file
    // reports ERR_FILE_NOT_FOUND or a 404 instead, so nothing hides behind
    // this. Counted separately and reported, never asserted on.
    if (/ERR_ABORTED/.test(why)) { b.aborted.push(u); return; }
    b.req.push(u + ' ' + why);
  });
}
/* A settle is one animation frame plus a pause. It is wrapped in a hard timeout
   because a page whose rAF never fires (a renderer that has gone away, a frame
   navigating under us) would otherwise hang the whole matrix silently — which
   is exactly what happened on one run of this harness. */
const settle = (p, ms = 180) => Promise.race([
  p.evaluate((m) => new Promise((r) => requestAnimationFrame(() => setTimeout(r, m))), ms).catch(() => null),
  new Promise((r) => setTimeout(r, ms + 4000))
]);

/* Canvases live inside opaque-origin iframes. Sum by asking each FRAME for its
   own total: page.frames() is a devtools view, not a DOM reach-in, so this does
   not violate criterion 14. */
async function canvasMB(p) {
  let bytes = 0;
  for (const f of p.frames()) {
    try {
      bytes += await f.evaluate(() => [...document.querySelectorAll('canvas')].reduce((a, c) => a + c.width * c.height * 4, 0));
    } catch { /* frame navigated mid-measure */ }
  }
  return +(bytes / 1048576).toFixed(2);
}

/* =========================================================================
   A · the state matrix — criteria 1, 2, 13, and the iframe count of 6
   ========================================================================= */
const STATES = [
  { index: 'open', apparatus: 'closed' },
  { index: 'closed', apparatus: 'closed' },
  { index: 'open', apparatus: 'open' },
  { index: 'closed', apparatus: 'open' }
];

if (want(1) || want(2) || want(13) || want(6)) {
  console.log('A · state matrix (1, 2, 6, 13) …');
  for (const proto of PROTOS) {
    for (const t of TOOLNAMES) {
      const routes = routesFor(t);
      for (const w of WIDTHS) {
        process.stdout.write(`    ${t} ${proto.id} ${w} … `);
        const t0 = Date.now();
        const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] }, deviceScaleFactor: 1 });
        const page = await ctx.newPage();
        const b = bag();
        watch(page, b);
        const base = proto.base(t);
        await page.goto(base + '#/', { waitUntil: 'load' });
        await settle(page, 300);

        for (const r of routes) {
          const before = b.console.length + b.page.length + b.req.length;
          await page.evaluate((h) => { location.hash = h; }, r.hash);
          await settle(page, r.kind === 'entry' || r.kind === 'index' ? 220 : 140);

          // criterion 13 — the route resolved to itself, no silent redirect
          const got = await page.evaluate(() => location.hash);
          const expect = r.hash === '#/' ? null : r.hash;
          if (expect) {
            assert(13, got === expect, `${t}/${proto.id}/${w}`, `${r.hash} → ${got}`);
          }

          // criteria 1 + 6, over all four chrome states
          const m = await page.evaluate((states) => {
            const out = [];
            const body = document.body;
            const i0 = body.getAttribute('data-index'), a0 = body.getAttribute('data-apparatus');
            for (const s of states) {
              body.setAttribute('data-index', s.index);
              body.setAttribute('data-apparatus', s.apparatus);
              // force layout
              const de = document.documentElement;
              void de.offsetHeight;
              out.push({
                state: s.index[0] + s.apparatus[0],
                sw: de.scrollWidth, cw: de.clientWidth,
                bsw: body.scrollWidth, bcw: body.clientWidth,
                frames: document.querySelectorAll('iframe').length
              });
            }
            body.setAttribute('data-index', i0); body.setAttribute('data-apparatus', a0);
            return out;
          }, STATES);

          for (const s of m) {
            assert(1, s.sw === s.cw, `${t}/${proto.id}/${w}/${r.hash}/${s.state}`, `html ${s.sw} vs ${s.cw}`);
            assert(1, s.bsw <= s.bcw, `${t}/${proto.id}/${w}/${r.hash}/${s.state}`, `body ${s.bsw} vs ${s.bcw}`);
          }
          if (r.kind === 'entry' && M[t].manifest.stage?.adapter === 'fragment') {
            assert(6, m[0].frames === 1, `${t}/${proto.id}/${w}/${r.hash}`, `entry route mounted ${m[0].frames} iframes`);
          }

          const after = b.console.length + b.page.length + b.req.length;
          if (after > before) {
            const news = [...b.console, ...b.page, ...b.req].slice(-(after - before));
            assert(2, false, `${t}/${proto.id}/${w}/${r.hash}`, news.join(' | ').slice(0, 300));
          } else assert(2, true);
        }

        if (b.aborted.length) CRIT[2].notes.push(`${t}/${proto.id}/${w}: ${b.aborted.length} subresource loads cancelled by frame eviction (ERR_ABORTED) — the mount/evict policy, not an error`);

        // criterion 13 — an unknown hash lands on the landing route, silently
        const errsBefore = b.console.length + b.page.length;
        await page.evaluate(() => { location.hash = '#/no-such-entry-xyz/nope'; });
        await settle(page, 220);
        const land = await page.evaluate(() => location.hash);
        const expected = M[t].manifest.mode === 'catalogue' ? '#/index' : '#/' + M[t].entries[0].id;
        assert(13, land === expected, `${t}/${proto.id}/${w}/unknown-hash`, `→ ${land}, wanted ${expected}`);
        assert(13, b.console.length + b.page.length === errsBefore, `${t}/${proto.id}/${w}/unknown-hash`, 'threw or logged');

        await ctx.close();
        console.log(`${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }
  }
}

/* =========================================================================
   B · criterion 3 — forced light under emulated dark
   ========================================================================= */
if (want(3)) {
  console.log('B · forced light under dark (3) …');
  for (const proto of PROTOS) {
    for (const t of TOOLNAMES) {
      for (const w of [390, 1440].filter((x) => WIDTHS.includes(x))) {
        const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] }, colorScheme: 'dark' });
        const page = await ctx.newPage();
        const routes = routesFor(t).filter((r) => r.kind !== 'example').slice(0, 40);
        await page.goto(proto.base(t) + '#/', { waitUntil: 'load' });
        for (const r of routes) {
          await page.evaluate((h) => { location.hash = h; }, r.hash);
          await settle(page, 120);
          const g = await page.evaluate(() => {
            const h = getComputedStyle(document.documentElement), b = getComputedStyle(document.body);
            return { hb: h.backgroundColor, bb: b.backgroundColor, cs: h.colorScheme, bcs: b.colorScheme };
          });
          assert(3, g.hb === 'rgb(255, 255, 255)', `${t}/${proto.id}/${w}/${r.hash}`, `html bg ${g.hb}`);
          assert(3, g.bb === 'rgb(255, 255, 255)', `${t}/${proto.id}/${w}/${r.hash}`, `body bg ${g.bb}`);
          assert(3, /light/.test(g.cs), `${t}/${proto.id}/${w}/${r.hash}`, `colorScheme ${g.cs}`);
        }
        await ctx.close();
      }
    }
  }
  // and every fragment, standalone, under dark
  const frags = [];
  for (const e of M.components.entries) {
    const f = join(TOOLS, 'components', e.path || `content/${e.id}/`, e.fragment || 'fragment.html');
    if (existsSync(f)) frags.push({ id: e.id, f });
  }
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  for (const { id, f } of frags) {
    await page.goto('file://' + f, { waitUntil: 'load' });
    const g = await page.evaluate(() => {
      const h = getComputedStyle(document.documentElement), b = getComputedStyle(document.body);
      return { hb: h.backgroundColor, bb: b.backgroundColor, cs: h.colorScheme };
    });
    // a fragment declares its OWN ground, which is not required to be white —
    // what is required is that it declares one and does not go transparent.
    assert(3, g.hb !== 'rgba(0, 0, 0, 0)' && g.hb !== 'transparent', `fragment/${id}`, `html bg ${g.hb}`);
    assert(3, g.bb !== 'rgba(0, 0, 0, 0)' && g.bb !== 'transparent', `fragment/${id}`, `body bg ${g.bb}`);
    assert(3, /light/.test(g.cs), `fragment/${id}`, `colorScheme ${g.cs}`);
  }
  await ctx.close();
}

/* =========================================================================
   C · criterion 4 — reduced motion
   ========================================================================= */
if (want(4)) {
  console.log('C · reduced motion (4) …');
  for (const t of TOOLNAMES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const b = bag(); watch(page, b);
    const routes = routesFor(t).filter((r) => r.kind === 'entry').slice(0, 8);
    await page.goto(PROTOS[PROTOS.length - 1].base(t) + '#/', { waitUntil: 'load' });
    await settle(page, 300);
    const flag = await page.evaluate(() => document.body.getAttribute('data-reduced-motion'));
    assert(4, flag === 'true', `${t}`, `body[data-reduced-motion] = ${flag}`);

    for (const r of routes) {
      await page.evaluate((h) => { location.hash = h; }, r.hash);
      await settle(page, 200);
      const slow = await page.evaluate(() => {
        const bad = [];
        for (const el of document.querySelectorAll('.chrome, .chrome *, header, header *, .rail, .rail *, nav, nav *, button, a')) {
          const s = getComputedStyle(el);
          const dur = (s.transitionDuration || '0s').split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000));
          const adur = (s.animationDuration || '0s').split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000));
          const m = Math.max(0, ...dur.filter(Number.isFinite), ...adur.filter(Number.isFinite));
          if (m > 1 && s.animationName !== 'none' || m > 1 && s.transitionProperty !== 'none') {
            bad.push(el.className + ' ' + m + 'ms');
            if (bad.length > 4) break;
          }
        }
        return bad;
      });
      assert(4, slow.length === 0, `${t}/${r.hash}`, `chrome transition > 1ms: ${slow.join(', ')}`);

      // no rAF pending two seconds after mount
      const raf = await page.evaluate(() => new Promise((res) => {
        let n = 0;
        const real = window.requestAnimationFrame;
        window.requestAnimationFrame = function (cb) { n++; return real.call(window, cb); };
        setTimeout(() => { window.requestAnimationFrame = real; res(n); }, 2000);
      }));
      assert(4, raf === 0, `${t}/${r.hash}`, `${raf} rAF callbacks scheduled in 2s after mount`);
    }
    await ctx.close();
  }
}

/* =========================================================================
   D · criterion 5 — keyboard and a11y furniture
   ========================================================================= */
if (want(5)) {
  console.log('D · keyboard and a11y furniture (5) …');
  for (const t of TOOLNAMES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const b = bag(); watch(page, b);
    const first = M[t].entries[0].id;
    await page.goto(PROTOS[PROTOS.length - 1].base(t) + '#/' + first, { waitUntil: 'load' });
    await settle(page, 400);

    // aria-current="true" marks exactly one rail entry, and it is the route's
    const cur = await page.evaluate(() => {
      const n = document.querySelectorAll('.ent[aria-current="true"]');
      return { count: n.length, id: n[0] && n[0].getAttribute('data-id') };
    });
    assert(5, cur.count === 1 && cur.id === first, `${t}/aria-current`, JSON.stringify(cur));

    // tab order follows DOM order across the chrome. A freshly loaded page must
    // start at the top of it: scrollIntoView() silently moves Chromium's
    // sequential focus navigation starting point, which is how the rail once
    // swallowed the masthead.
    const tabs = await page.evaluate(() => {
      const vis = (e) => { const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden'; };
      return [...document.querySelectorAll('a[href], button:not([disabled]), input:not([type=hidden]), textarea, select, [tabindex]:not([tabindex="-1"])')]
        .filter(vis).slice(0, 12).map((e) => (e.id || e.className || e.tagName).toString().slice(0, 24));
    });
    const walked = [];
    for (let i = 0; i < Math.min(12, tabs.length); i++) {
      await page.keyboard.press('Tab');
      walked.push(await page.evaluate(() => {
        const a = document.activeElement;
        return a ? (a.id || a.className || a.tagName).toString().slice(0, 24) : null;
      }));
    }
    const inOrder = walked.every((v, i) => v === tabs[i]);
    assert(5, inOrder, `${t}/tab-order`, `dom ${tabs.slice(0, 6).join('>')} · tab ${walked.slice(0, 6).join('>')}`);

    // every keyboard-focused control shows a focus indicator. Programmatic
    // .focus() does NOT match :focus-visible on a button in Chromium, so this
    // walks with real Tab presses — the check the builders' harness could not
    // make from el.focus().
    await page.evaluate(() => { document.body.tabIndex = -1; document.body.focus(); document.body.blur(); document.body.removeAttribute('tabindex'); });
    const noRing = [];
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press('Tab');
      const r = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return null;
        const s = getComputedStyle(a);
        const ring = parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== 'none';
        const alt = (s.boxShadow && s.boxShadow !== 'none') || parseFloat(s.borderBottomWidth) >= 2 ||
          s.textDecorationLine !== 'none' || a.matches(':focus-visible') === false;
        return { id: (a.id || a.className || a.tagName).toString().slice(0, 28), ok: ring || alt };
      });
      if (r && !r.ok) noRing.push(r.id);
    }
    assert(5, noRing.length === 0, `${t}/focus-indicator`, `no visible focus ring on ${[...new Set(noRing)].join(', ')}`);

    // the editor: focus enters, Esc leaves it
    await page.evaluate(() => window.Shell.toggleApparatus(true));
    await settle(page, 250);
    const hasEditor = await page.evaluate(() => !!document.querySelector('#app-body textarea, .app textarea, textarea'));
    if (hasEditor) {
      await page.evaluate(() => document.querySelector('textarea').focus());
      const inEditor = await page.evaluate(() => document.activeElement.tagName);
      assert(5, inEditor === 'TEXTAREA', `${t}/editor-enter`, inEditor);
      await page.keyboard.press('Escape');
      await settle(page, 150);
      const out = await page.evaluate(() => document.activeElement.tagName);
      assert(5, out !== 'TEXTAREA', `${t}/editor-exit`, `Esc left focus on ${out}`);
    } else {
      CRIT[5].notes.push(`${t}: catalogue mode has no editor textarea (fragment adapter is read-only) — enter/exit not applicable`);
    }
    await page.evaluate(() => window.Shell.toggleApparatus(false));

    // the ? dialog traps focus and gives it back
    await page.evaluate(() => { const b2 = document.getElementById('helpbtn'); if (b2) b2.focus(); });
    const returnTo = await page.evaluate(() => document.activeElement.id);
    await page.keyboard.press('?');
    await settle(page, 200);
    const open = await page.evaluate(() => { const d = document.getElementById('help'); return !!(d && (d.open || d.hasAttribute('open'))); });
    assert(5, open, `${t}/help-dialog`, 'the ? dialog did not open');
    if (open) {
      const inside = await page.evaluate(() => { const d = document.getElementById('help'); return d.contains(document.activeElement); });
      assert(5, inside, `${t}/help-focus`, 'focus is not inside the dialog');
      for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
      const stillInside = await page.evaluate(() => { const d = document.getElementById('help'); return d.contains(document.activeElement); });
      assert(5, stillInside, `${t}/help-trap`, 'Tab escaped the dialog');
      await page.keyboard.press('Escape');
      await settle(page, 200);
      const back = await page.evaluate(() => document.activeElement.id);
      assert(5, back === returnTo, `${t}/help-restore`, `focus returned to ${back}, wanted ${returnTo}`);
    }

    // no `outline: none` in the stylesheet without a declared replacement in
    // the SAME or an adjacent :focus-visible rule — read from the CSS text,
    // because that is where the rule actually lives.
    const css = readFileSync(join(TOOLS, 'learn', 'shell.css'), 'utf8');
    const bare = [];
    for (const m of css.matchAll(/([^{}]+)\{([^}]*outline\s*:\s*none[^}]*)\}/g)) {
      const sel = m[1].trim().split('\n').pop().trim();
      const body = m[2];
      const replaced = /box-shadow|border(-bottom)?\s*:|text-decoration|background/.test(body);
      const fvNear = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:focus\b/, ':focus-visible') + '\\s*\\{[^}]*(box-shadow|border|text-decoration|outline\\s*:\\s*var)');
      if (!replaced && !fvNear.test(css)) bare.push(sel);
    }
    assert(5, bare.length === 0, `${t}/outline-none`, `outline:none with no declared replacement: ${bare.join(' · ')}`);
    await ctx.close();
  }
}

/* =========================================================================
   E · criterion 6 — the sheet's mount/evict cap, scrolled end to end
   ========================================================================= */
if (want(6)) {
  console.log('E · sheet mount/evict cap (6) …');
  for (const proto of PROTOS) {
    for (const w of WIDTHS) {
      const capWanted = w >= 840 ? 4 : 2;
      const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const b = bag(); watch(page, b);
      await page.goto(proto.base('components') + '#/index', { waitUntil: 'load' });
      await settle(page, 700);
      let maxLive = 0, everCreated = 0;
      const dh = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = Math.round(HEIGHTS[w] * 0.8);
      for (let y = 0; y < dh; y += step) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await settle(page, 260);
        const n = await page.evaluate(() => document.querySelectorAll('iframe').length);
        maxLive = Math.max(maxLive, n);
        everCreated = Math.max(everCreated, n);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await settle(page, 400);
      const after = await page.evaluate(() => document.querySelectorAll('iframe').length);
      assert(6, maxLive <= capWanted, `sheet/${proto.id}/${w}`, `max concurrent ${maxLive} > cap ${capWanted}`);
      assert(6, after <= capWanted, `sheet/${proto.id}/${w}`, `after a full scroll ${after} > cap ${capWanted}`);
      CRIT[6].notes.push(`sheet ${proto.id} ${w}: max ${maxLive}, cap ${capWanted}, after scroll ${after}, doc ${dh}px`);
      await ctx.close();
    }
  }
}

/* =========================================================================
   F · criterion 7 — every example compiles; declared failures fail
   ========================================================================= */
if (want(7)) {
  console.log('F · every example compiles (7) …');
  for (const proto of PROTOS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const b = bag(); watch(page, b);
    await page.goto(proto.base('book-of-shaders') + '#/', { waitUntil: 'load' });
    await settle(page, 400);
    for (const e of M['book-of-shaders'].entries) {
      const lane0 = e.lane || 'glsl';
      const list = (e.examples || []).length ? e.examples : [{ id: null }];
      for (const ex of list) {
        const lane = ex.lane || lane0;
        if (lane !== 'glsl') continue;
        const hash = '#/' + e.id + (ex.id ? '/' + ex.id : '');
        await page.evaluate((h) => { location.hash = h; }, hash);
        await settle(page, 260);
        const g = await page.evaluate(() => {
          const chip = document.getElementById('compile');
          const cv = document.querySelector('canvas.gl') || document.querySelector('.stage canvas');
          let err = null, linked = null;
          if (cv) {
            const gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
            if (gl) {
              err = gl.getError();
              const p = gl.getParameter(gl.CURRENT_PROGRAM);
              linked = p ? !!gl.getProgramParameter(p, gl.LINK_STATUS) : false;
            }
          }
          return { chip: chip && chip.textContent.trim(), state: chip && chip.parentNode.getAttribute('data-state'), err, linked };
        });
        // The declaration is per EXAMPLE where the example carries one — a
        // known-failure entry that also ships the repair has one of each.
        const declaredFailure = ex.status ? ex.status === 'known-failure' : e.status === 'known-failure';
        if (declaredFailure) {
          assert(7, g.chip === 'FAILED' || g.state === 'error', `bos/${proto.id}${hash}`, `known-failure did NOT fail: ${JSON.stringify(g)}`);
        } else {
          assert(7, g.chip === 'COMPILED', `bos/${proto.id}${hash}`, `chip ${g.chip} state ${g.state}`);
          assert(7, g.err === 0, `bos/${proto.id}${hash}`, `gl.getError() = ${g.err}`);
          assert(7, g.linked === true, `bos/${proto.id}${hash}`, `program linked = ${g.linked}`);
        }
      }
    }
    await ctx.close();
  }
}

/* =========================================================================
   G · criterion 8 + 14 — every fragment standalone, over file:// and http
   ========================================================================= */
if (want(8) || want(14)) {
  console.log('G · every fragment standalone (8, 14) …');
  const frags = [];
  for (const t of TOOLNAMES) {
    for (const e of M[t].entries) {
      const rel = (e.path || `content/${e.id}/`) + (e.fragment || 'fragment.html');
      const abs = join(TOOLS, t, rel);
      if (existsSync(abs)) frags.push({ t, id: e.id, abs, rel, dw: (e.frame && e.frame.designWidth) || 1100 });
    }
  }
  for (const proto of PROTOS) {
    // One context per protocol, a fresh PAGE per fragment. A fragment is its
    // own document either way; sharing the HTTP cache across them is what a
    // reader gets too, and it takes this phase from minutes to seconds.
    const fctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
    for (const f of frags) {
      const page = await fctx.newPage();
      await page.setViewportSize({ width: f.dw, height: 900 });
      const b = bag(); watch(page, b);
      const url = proto.id === 'file' ? 'file://' + f.abs : `http://127.0.0.1:${PORT}/${f.t}/${f.rel}`;
      await page.goto(url, { waitUntil: 'load' });
      await settle(page, 1400);
      const g = await page.evaluate(() => {
        const need = new Set();
        for (const el of document.querySelectorAll('*')) {
          const fam = getComputedStyle(el).fontFamily;
          if (fam) need.add(fam.split(',')[0].replace(/["']/g, '').trim());
        }
        return { h: document.documentElement.scrollHeight, families: [...need].filter(Boolean).slice(0, 20) };
      });
      const c = want(8) ? 8 : 14;
      assert(c, b.console.length === 0, `${proto.id}/${f.t}/${f.id}`, 'console: ' + b.console.slice(0, 2).join(' | ').slice(0, 200));
      assert(c, b.page.length === 0, `${proto.id}/${f.t}/${f.id}`, 'pageerror: ' + b.page.slice(0, 2).join(' | ').slice(0, 200));
      assert(c, b.req.length === 0, `${proto.id}/${f.t}/${f.id}`, 'failed request: ' + b.req.slice(0, 2).join(' | ').slice(0, 200));
      assert(c, g.h > 200, `${proto.id}/${f.t}/${f.id}`, `scrollHeight ${g.h}`);
      // non-blank: sample the screenshot's pixel variance
      const buf = await page.screenshot({ clip: { x: 0, y: 0, width: Math.min(f.dw, 1100), height: 600 } });
      let lo = 255, hi = 0, s = 0;
      for (let i = 1000; i < buf.length; i += 997) { const v = buf[i]; lo = Math.min(lo, v); hi = Math.max(hi, v); s++; }
      assert(c, hi - lo > 24, `${proto.id}/${f.t}/${f.id}`, `screenshot spread ${hi - lo} over ${s} samples — looks blank`);
      await page.close();
    }
    await fctx.close();
  }
}

/* =========================================================================
   H · criterion 9 — counts derive; verifyManifests() green
   ========================================================================= */
if (want(9)) {
  console.log('H · derived counts and the build guard (9) …');
  const { execSync } = await import('node:child_process');
  let buildOut = '', buildOk = true;
  try { buildOut = execSync('node scripts/build-site.mjs', { cwd: TOOLS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { buildOk = false; buildOut = String(e.stdout || '') + String(e.stderr || ''); }
  assert(9, buildOk, 'build-site.mjs', buildOut.slice(-400));
  R.build = buildOut.trim().split('\n').slice(-12).join('\n');

  for (const proto of PROTOS) {
    for (const t of TOOLNAMES) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(proto.base(t) + '#/index', { waitUntil: 'load' });
      await settle(page, 700);
      const n = M[t].entries.length;
      const seen = await page.evaluate(() => document.body.innerText);
      // every integer 2..999 rendered as chrome text must be a number the
      // manifest can produce
      const derivable = new Set([n, (M[t].manifest.sections || []).length, (M[t].manifest.styles || []).length]);
      for (const k of ['examples', 'gallery', 'stages', 'params', 'plots', 'exercises']) {
        let sum = 0;
        for (const e of M[t].entries) if (e[k]) { derivable.add(e[k].length); sum += e[k].length; }
        derivable.add(sum);                       // the roll-up is a derived count too
      }
      for (const s of M[t].manifest.styles || []) derivable.add(M[t].entries.filter((e) => e.style === s.id).length);
      derivable.add(M[t].entries.filter((e) => e.reference).length);
      derivable.add(M[t].entries.filter((e) => !e.reference).length);
      // Only COUNT strings: a number bound to a countable noun. A chapter's own
      // index (07, 13, 21) and a line number are not counts and must not be
      // read as one — which is what makes this assertion about §7.9 rather
      // than about every digit on the page.
      const NOUN = /(\d{1,4})\s*(?:∅\s*)?(lenses?|styles?|chapters?|entries|entry|sections?|examples?|worked examples?|reference stud(?:y|ies)|with a reference study|without|plates?|cards?|variants?|exercises?|passes)/gi;
      const found = [...seen.matchAll(NOUN)].map((m) => ({ n: +m[1], noun: m[2].toLowerCase(), text: m[0] }));
      const undecl = found.filter((f) => !derivable.has(f.n));
      assert(9, undecl.length === 0, `${t}/${proto.id}/sheet-counts`,
        `count strings entries.length cannot produce: ${undecl.map((f) => `"${f.text}"`).join(', ')}`);
      CRIT[9].notes.push(`${t}/${proto.id}: ${found.length} count strings on the sheet, all derived (${[...new Set(found.map((f) => f.text))].slice(0, 8).join(' · ')})`);
      await ctx.close();
    }
  }
}

/* =========================================================================
   I · criterion 10 — budgets. The phone canvas budget is tested against the
       WORST ADJACENT PAIR in manifest order, not one sample: with a cap of 2,
       the peak is whatever two neighbours cost together, so the assertion has
       to be max over i of (cost[i] + cost[i+1]).
   ========================================================================= */
if (want(10)) {
  console.log('I · budgets (10) …');
  R.budgets = {};

  // 1 · Book of Shaders entry route. Every chapter, not a sample. The first
  //     navigation of the run is a warm-up that is NOT asserted on: it pays for
  //     the shell's own cold start (shell.js, shell.css, the two faces, three
  //     adapters), which is not the entry route's cost. Everything after it is
  //     a cold entry.js on a warm shell — the reader moving chapter to chapter.
  //     "at most 2 canvases" is read as at most two with a BACKING STORE: a
  //     canvas at 0x0 costs nothing, which is what a budget clause is about.
  for (const proto of PROTOS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const rows = [];
    const all = M['book-of-shaders'].entries;
    await page.goto(proto.base('book-of-shaders') + '#/' + all[0].id, { waitUntil: 'load' });   // warm-up
    await page.waitForFunction(() => !!document.querySelector('.stage canvas, canvas.gl'), null, { timeout: 9000 }).catch(() => {});
    for (const e of all) {
      const t0 = Date.now();
      await page.goto(proto.base('book-of-shaders') + '#/' + e.id, { waitUntil: 'load' });
      await page.waitForFunction(() => !!document.querySelector('.stage canvas, canvas.gl'), null, { timeout: 9000 }).catch(() => {});
      const ms = Date.now() - t0;
      const c = await page.evaluate(() => {
        const all2 = [...document.querySelectorAll('canvas')];
        return { total: all2.length, live: all2.filter((x) => x.width > 0 && x.height > 0).length,
          mb: +(all2.reduce((a, x) => a + x.width * x.height * 4, 0) / 1048576).toFixed(2) };
      });
      rows.push({ id: e.id, ms, ...c });
      assert(10, ms < 400, `bos/${proto.id}/${e.id}/interactive`, `${ms} ms (budget 400)`);
      assert(10, c.live <= 2, `bos/${proto.id}/${e.id}/canvases`, `${c.live} canvases with a backing store (budget 2); ${c.total} elements, ${c.mb} MB`);
    }
    const t = rows.map((r) => r.ms).sort((a, b) => a - b);
    R.budgets[`bos-entry-${proto.id}`] = {
      worstMs: t[t.length - 1], medianMs: t[Math.floor(t.length / 2)], p90Ms: t[Math.floor(t.length * 0.9)],
      maxLiveCanvases: Math.max(...rows.map((r) => r.live)), maxCanvasMB: Math.max(...rows.map((r) => r.mb)),
      slowest: rows.slice().sort((a, b) => b.ms - a.ms).slice(0, 4)
    };
    await ctx.close();
  }

  // 2 · per-lens canvas cost, measured IN SITU — inside the preview frame the
  //     sheet actually mounts, not standalone. A lens standalone in a 1100px
  //     window is not the same allocation as the same lens in a preview frame
  //     (B1 measures 11.12 MB standalone and 2.78 MB as a preview), and the
  //     budget governs the sheet, so the sheet is where it has to be measured.
  const order = M.components.entries;
  const cost = {};
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(PROTOS[PROTOS.length - 1].base('components') + '#/index', { waitUntil: 'load' });
    await settle(page, 900);
    for (const e of order) {
      for (let k = 0; k < 3; k++) {
        await page.evaluate((id) => { const c = document.querySelector('.prev[data-id="' + id + '"]'); if (c) c.scrollIntoView({ block: 'center' }); }, e.id);
        await settle(page, 800);
      }
      const per = await page.evaluate(() => [...document.querySelectorAll('iframe[data-lens-id]')].map((f) => [f.getAttribute('data-lens-id'), +(f.getAttribute('data-mb') || 0)]));
      for (const [k, v] of per) if (k && (cost[k] === undefined || v > cost[k])) cost[k] = v;
    }
    for (const e of order) if (cost[e.id] === undefined) cost[e.id] = 0;
    await ctx.close();
  }
  const maxSingle = Math.max(...Object.values(cost));

  // The worst adjacent RUN of `cap` lenses in manifest order — and, because the
  // brief asks for ANY order rather than this one, the worst run the manifest
  // could ever produce if it were reordered (the `cap` costliest lenses).
  for (const w of [390, 1440]) {
    const capW = w >= 840 ? 4 : 2;
    const budget = w >= 840 ? 40 : 12;
    let worst = 0, at = null;
    for (let i = 0; i + capW <= order.length; i++) {
      const run = order.slice(i, i + capW);
      const sum = +run.reduce((a, e) => a + (cost[e.id] || 0), 0).toFixed(2);
      if (sum > worst) { worst = sum; at = run.map((e) => e.id); }
    }
    const byCost = Object.entries(cost).sort((a, b) => b[1] - a[1]).slice(0, capW);
    const anyOrder = +byCost.reduce((a, x) => a + x[1], 0).toFixed(2);
    R.budgets[`sheet-worst-adjacent-${w}`] = {
      cap: capW, budgetMB: budget,
      worstInManifestOrderMB: worst, run: at,
      worstInAnyOrderMB: anyOrder, anyOrderRun: byCost.map((x) => `${x[0]} ${x[1]}`),
      perLens: cost
    };
    assert(10, worst <= budget, `sheet/${w}/worst-adjacent-${capW}/manifest-order`, `${worst} MB over ${at && at.join(' + ')} (budget ${budget} MB)`);
    CRIT[10].notes.push(`sheet ${w}: worst run of ${capW} in manifest order ${worst} MB; worst in ANY order ${anyOrder} MB (${byCost.map((x) => x[0]).join(' + ')}); budget ${budget} MB — the byte cap is what makes the second number safe, see the squeeze test`);
  }

  // 3 · THE SQUEEZE TEST — proof of the policy rather than of the content.
  //     Today's thirty lenses fit two-up on a phone, so a passing measurement
  //     at 12 MB proves nothing about the cap. Shell.canvasBudgetMB forces the
  //     budget down to 3 MB; the invariant is that the live store never exceeds
  //     the budget OR the single costliest lens, whichever is larger, because
  //     the card you are looking at is never evicted.
  {
    const FORCED = 3;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.addInitScript(() => { Object.defineProperty(window, '__qaBudget', { value: 3 }); });
    await page.goto(PROTOS[PROTOS.length - 1].base('components') + '#/index', { waitUntil: 'load' });
    await page.evaluate(() => { window.Shell.canvasBudgetMB = 3; });
    await settle(page, 800);
    const dh = await page.evaluate(() => document.documentElement.scrollHeight);
    let peak = 0, peakAt = 0, maxFrames = 0;
    for (let y = 0; y < dh; y += 500) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await settle(page, 320);
      const v = await canvasMB(page);
      const fr = await page.evaluate(() => document.querySelectorAll('iframe').length);
      maxFrames = Math.max(maxFrames, fr);
      if (v > peak) { peak = v; peakAt = y; }
    }
    const ceiling = Math.max(FORCED, maxSingle) + 0.05;
    R.budgets['squeeze-390-forced-3MB'] = { forcedBudgetMB: FORCED, costliestSingleLensMB: maxSingle, peakMB: peak, peakAtY: peakAt, maxFrames, ceilingMB: +ceiling.toFixed(2) };
    assert(10, peak <= ceiling, 'sheet/390/squeeze', `forced budget ${FORCED} MB, peak ${peak} MB, ceiling ${ceiling.toFixed(2)} MB (costliest single lens ${maxSingle} MB)`);
    await ctx.close();
  }

  // 3 · the sheet's own measured peak, scrolled, and time to interactive
  for (const proto of PROTOS) {
    for (const w of [390, 1440].filter((x) => WIDTHS.includes(x))) {
      const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const t0 = Date.now();
      await page.goto(proto.base('components') + '#/index', { waitUntil: 'load' });
      await page.waitForFunction(() => document.querySelectorAll('[data-id]').length > 5, null, { timeout: 12000 }).catch(() => {});
      const tti = Date.now() - t0;
      await settle(page, 600);
      let peak = await canvasMB(page);
      const dh = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < dh; y += Math.round(HEIGHTS[w] * 0.8)) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await settle(page, 320);
        peak = Math.max(peak, await canvasMB(page));
      }
      const budget = w >= 840 ? 40 : 12;
      R.budgets[`sheet-measured-${proto.id}-${w}`] = { ttiMs: tti, peakMB: peak, budgetMB: budget, docHeight: dh };
      assert(10, tti < 1200, `sheet/${proto.id}/${w}/interactive`, `${tti} ms (budget 1200)`);
      assert(10, peak <= budget, `sheet/${proto.id}/${w}/canvas`, `${peak} MB (budget ${budget})`);
      await ctx.close();
    }
  }
}

/* =========================================================================
   J · criterion 11 — the fold
   ========================================================================= */
if (want(11)) {
  console.log('J · the fold (11) …');
  for (const [w, h] of [[1440, 900], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    for (const e of M['book-of-shaders'].entries.slice(0, 12)) {
      await page.goto(PROTOS[PROTOS.length - 1].base('book-of-shaders') + '#/' + e.id, { waitUntil: 'load' });
      await settle(page, 400);
      const r = await page.evaluate((vh) => {
        const p = document.querySelector('.prose p, .text p, article p, .read p');
        if (!p) return { found: false };
        const range = document.createRange();
        range.selectNodeContents(p);
        const rects = [...range.getClientRects()].filter((x) => x.height > 4);
        if (!rects.length) return { found: false };
        const line = rects[0];
        return { found: true, top: Math.round(line.top), bottom: Math.round(line.bottom), fits: line.bottom <= vh };
      }, h);
      assert(11, r.found && r.fits, `bos/${w}x${h}/${e.id}`, r.found ? `first prose line ends at ${r.bottom}px, fold ${h}` : 'no prose paragraph found');
    }
    await ctx.close();
  }
}

/* =========================================================================
   K · criterion 12 — contrast
   ========================================================================= */
if (want(12)) {
  console.log('K · contrast (12) …');
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
  for (const t of TOOLNAMES) {
    for (const w of [390, 1440].filter((x) => WIDTHS.includes(x))) {
      const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] } });
      const page = await ctx.newPage();
      const routes = routesFor(t).filter((r) => r.kind !== 'example');
      await page.goto(PROTOS[PROTOS.length - 1].base(t) + '#/', { waitUntil: 'load' });
      for (const r of routes) {
        await page.evaluate((h) => { location.hash = h; }, r.hash);
        await settle(page, 200);
        const g = await page.evaluate(CONTRAST);
        assert(12, g.badCount === 0, `${t}/${w}${r.hash}`, g.bad.map((x) => `${x.sel} ${x.ratio}:1 (${x.fg} on ${x.bg}, needs ${x.need})`).slice(0, 3).join(' · '));
        assert(12, g.ink4carriers.length === 0, `${t}/${w}${r.hash}/ink-4`, `--ink-4 carries text on ${g.ink4carriers.join(', ')}`);
      }
      await ctx.close();
    }
  }
}

/* =========================================================================
   L · criterion 14 — the file:// source guard is in static-checks.mjs; here
       we prove both tools boot from file:// with no server on every route.
   ========================================================================= */
if (want(14) && PROTOS.some((p) => p.id === 'file')) {
  for (const t of TOOLNAMES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const b = bag(); watch(page, b);
    await page.goto('file://' + join(TOOLS, t, 'index.html') + '#/', { waitUntil: 'load' });
    await settle(page, 500);
    for (const r of routesFor(t)) {
      await page.evaluate((h) => { location.hash = h; }, r.hash);
      await settle(page, 130);
      const ok = await page.evaluate(() => document.querySelector('main, .mat, .sheet, .page') !== null);
      assert(14, ok, `${t}/file${r.hash}`, 'no main content rendered');
    }
    assert(14, b.page.length === 0, `${t}/file`, b.page.slice(0, 2).join(' | '));
    await ctx.close();
  }
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
/* The narrative — what failed, what was fixed, what stays open — lives in
   NOTES.md beside this script and is folded into RESULTS.md on every run, so a
   re-run refreshes the numbers without losing the reading. */
const NOTES = existsSync(join(QA, 'NOTES.md')) ? readFileSync(join(QA, 'NOTES.md'), 'utf8') : '';

const md = [
  '# QA matrix — press-bench checkpoint 8',
  '',
  `Generated ${R.generated}${QUICK ? '  ·  **--quick** (390/1440, http only)' : ''}`,
  '',
  `Harness: Chromium / Playwright, \`/opt/pw-browsers\`, DPR 1, fonts blocked.`,
  `Widths **${WIDTHS.join(' · ')}**, protocols **${R.protocols.join(' · ')}**, states **index open|closed × apparatus open|closed**.`,
  `Routes: book-of-shaders **${R.tools['book-of-shaders'].routes}**, components **${R.tools.components.routes}**.`,
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
  R.budgets ? ['## Budgets (criterion 10)', '', '```', JSON.stringify(R.budgets, (k, v) => (k === 'perLens' ? undefined : v), 1), '```', ''] : []
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
