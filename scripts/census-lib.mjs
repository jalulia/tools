// Census helpers shared by scripts/census.mjs, scripts/guard.mjs and scripts/publish.mjs.
// A census page is one T&T page (technique, template, application, plate) or one technique study.
// Its dials are counted in the rendered Parameters pane (#mParams), the way a person sees them.
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import http from 'node:http'; import crypto from 'node:crypto';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const CENSUS = path.join(ROOT, 'library/census.json');

export const RULES = {
  has_dials: 'at least 1 working control that changes the piece (editing text counts); layout-only dials on still plates do not count',
  complete: 'at least 4 technique dials plus Reset',
  new_pages: 'a page added after the census must have dials (Julia, 2026-11-13: nothing goes on tools without parameters)',
  removal: 'a census page may only disappear if a .quarantine/*/MANIFEST.md names its folder, or library/_build/edits.json archives or removes it',
  measured: 'controls in the rendered Parameters pane (#mParams), headless Chromium at 1440x900'
};

/** Every page the census covers, read from the T&T manifest and the studies folder. */
export function listPages(root = ROOT) {
  const TT = (() => { const c = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'techniques-templates/_shared/entries.js'), 'utf8'), c); return c.window.TT; })();
  const pages = TT.entries.map(e => ({ id: e.id, code: e.code, title: e.title, section: e.section, path: 'techniques-templates/' + e.path.replace(/\/?$/, '/') }));
  const sd = path.join(root, 'techniques-templates/studies');
  for (const d of fs.readdirSync(sd).filter(s => /^st-\d+/.test(s) && fs.existsSync(path.join(sd, s, 'index.html'))).sort()) {
    const h = fs.readFileSync(path.join(sd, d, 'index.html'), 'utf8'); const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || d;
    const parts = t.replace(/&amp;/g, '&').split(/\s*·\s*/);
    pages.push({ id: d, code: d.slice(0, 5).toUpperCase(), title: (parts.length > 1 ? parts[1] : parts[0]).trim(), section: 'studies', path: 'techniques-templates/studies/' + d + '/' });
  }
  return pages;
}

/** How each plate is drawn, from plates.json: engine (real dials), live-lift (source figure, no dials) or still. */
export function plateModes(root = ROOT) {
  const PL = JSON.parse(fs.readFileSync(path.join(root, 'techniques-templates/_build/plates.json'), 'utf8')).plates;
  return new Map(PL.map(p => [p.slug, p.engine ? 'engine' : (p.lift && Object.values(p.lift).some(Boolean) ? 'live-lift' : 'still')]));
}

/** A fingerprint of the files that define a page, with build stamps (?v=…, commit ids) removed, so a rebuild alone never counts as a change. */
export function fingerprint(rel, root = ROOT) {
  const dir = path.join(root, rel); const h = crypto.createHash('sha256');
  for (const f of ['index.html', 'study.js', 'spec.json', 'engine.js']) {
    const p = path.join(dir, f); if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8');
    s = s.replace(/([?&]v=)\d{8,14}/g, '$1').replace(/"(source_commit|library_commit)":\s*"[0-9a-f]{7,40}"/g, '"$1":""');
    h.update(f + '\0' + s + '\0');
  }
  return h.digest('hex').slice(0, 16);
}

/** A static file server over the repo, mounted at /tools/ like GitHub Pages. Returns { base, close }. */
export function serve(root = ROOT) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.gif': 'image/gif' };
  const srv = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    if (!u.startsWith('/tools/')) { res.writeHead(404); return res.end(); }
    let p = path.join(root, u.slice(7)); if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
    try { if (fs.statSync(p).isDirectory()) p = path.join(p, 'index.html'); res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }
    catch { res.writeHead(404); res.end(); }
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok({ base: 'http://127.0.0.1:' + srv.address().port + '/tools', close: () => srv.close() })));
}

/** Renders pages and counts their dials. pages: census rows (need path, section). Returns rows with counts and a status. */
export async function measure(pages, { root = ROOT, concurrency = 4, log = () => {} } = {}) {
  let chromium; try { ({ chromium } = await import('playwright')); } catch { throw Object.assign(new Error('playwright is not installed'), { code: 'NO_BROWSER' }); }
  const modes = plateModes(root); const { base, close } = await serve(root);
  const b = await chromium.launch(); const out = []; let n = 0; const q = [...pages];
  async function one(p) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    let r;
    try {
      await pg.goto(base + '/' + p.path + 'index.html', { waitUntil: 'load', timeout: 30000 }); await pg.waitForTimeout(2500);
      r = await pg.evaluate(() => { const P = document.getElementById('mParams'), C = document.getElementById('mColor'); const q = (el, s) => el ? el.querySelectorAll(s).length : 0; const bl = document.getElementById('bLive');
        return { dials: q(P, 'input[type=range],select,input[type=number],input[type=text],textarea'), ranges: q(P, 'input[type=range]'), texts: q(P, 'input[type=text],textarea'), colors: q(C, 'input,button.sw,[data-pal]'),
          reset: [...document.querySelectorAll('button')].some(x => /reset/i.test(x.textContent)), live_toggle: !!(bl && !bl.hidden), own_controls_note: /keeps its own controls/i.test(document.body.innerText), redirect: !P && /moved/i.test(document.title) }; });
    } catch (e) { r = { error: String(e.message).slice(0, 160) }; }
    await ctx.close();
    const slug = p.path.split('/').filter(Boolean).pop(); const mode = p.section === 'plates' ? (modes.get(slug) || 'unknown') : (r.dials ? 'engine' : 'none');
    const dial_kind = p.section === 'plates' && mode === 'still' ? 'layout' : (r.dials ? 'technique' : 'none');
    const status = r.error ? 'error' : r.redirect ? 'redirect' : (dial_kind === 'technique' && r.dials >= 4 && r.reset) ? 'complete' : (dial_kind === 'technique' && r.dials >= 1) ? 'has-dials' : 'no-dials';
    out.push({ ...p, mode, ...r, dial_kind, status, fingerprint: fingerprint(p.path, root), page_errors: errs.length ? errs.slice(0, 3) : undefined });
    if (++n % 25 === 0) log(n + ' / ' + pages.length);
  }
  try { await Promise.all(Array.from({ length: concurrency }, async () => { while (q.length) await one(q.shift()); })); }
  finally { await b.close(); close(); }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

export function counts(rows) { return rows.reduce((m, r) => (m[r.status] = (m[r.status] || 0) + 1, m), {}); }

export function readCensus() { return fs.existsSync(CENSUS) ? JSON.parse(fs.readFileSync(CENSUS, 'utf8')) : null; }
export function writeCensus(rows, extra = {}) {
  fs.writeFileSync(CENSUS, JSON.stringify({ schema: 'tools-census/1', generated: new Date().toISOString(), rules: RULES, counts: counts(rows), ...extra, pages: rows }, null, 1) + '\n');
}

/** Folders named in any quarantine manifest, and ids archived or removed in the CMS edits file. */
export function allowedGone(root = ROOT) {
  const names = new Set(); const qd = path.join(root, '.quarantine');
  if (fs.existsSync(qd)) for (const d of fs.readdirSync(qd)) { const m = path.join(qd, d, 'MANIFEST.md'); if (fs.existsSync(m)) for (const x of fs.readFileSync(m, 'utf8').matchAll(/[\w./-]*?((?:st|ts|pl|ap|t)-[\w-]+)\/?/g)) names.add(x[1]); }
  const ef = path.join(root, 'library/_build/edits.json');
  if (fs.existsSync(ef)) { try { const E = JSON.parse(fs.readFileSync(ef, 'utf8')); for (const [id, v] of Object.entries(E.records || {})) if (v && /archived|removed/.test(v.state || '')) names.add(id.replace(/^tt:/, '')); } catch {} }
  return names;
}
