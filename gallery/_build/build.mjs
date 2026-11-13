// node gallery/_build/build.mjs   — run from the repo root after the library build.
// Writes gallery/index.html from library/catalog.json, the T&T manifest and each plate's own data.
// Every card links to the page it names. Hidden and withdrawn records are left out.
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const cat = JSON.parse(rd('library/catalog.json'));
const TT = (() => { const c = { window: {} }; vm.runInNewContext(rd('techniques-templates/_shared/entries.js'), c); return c.window.TT; })();
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lib = (p) => (p ? (p.startsWith('../') ? p : '../library/' + p) : null);

/* editable parameters per plate ------------------------------------------- */
const leaves = (o, n = 0) => { if (!o || typeof o !== 'object') return n; if (Array.isArray(o)) return o.reduce((a, x) => leaves(x, a), n);
  if ('value' in o && Array.isArray(o.range)) return n + 1; return Object.values(o).reduce((a, x) => leaves(x, a), n); };
const tsParams = (dir) => { try { const s = JSON.parse(rd(dir + 'spec.json')); return (s.techniques || []).reduce((a, t) => leaves(t.params, a), 0); } catch { return 0; } };
const stStudy = (file) => {
  const html = rd(file); const art = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => /window\.STUDY\s*=/.test(s));
  if (!art) return null; const box = { console: { log() {}, warn() {}, error() {} }, document: { createElement: () => ({ getContext: () => ({}) }) }, performance: { now: () => 0 } };
  box.window = box; try { vm.runInNewContext(art, vm.createContext(box), { timeout: 5000 }); } catch { return null; } return box.STUDY || null;
};

const recs = cat.records.filter((r) => r.access === 'public' && !r.role);
const byId = new Map(recs.map((r) => [r.id, r]));
const ttById = new Map(TT.entries.map((e) => [e.id, e]));

/* plates: T&T rebuilds (TS) and read plates (ST) --------------------------- */
const plates = [];
for (const r of recs.filter((r) => r.collection === 'techniques-templates' && r.section === 'techniques')) {
  const e = ttById.get(r.id.replace(/^tt:/, '')); if (!e) continue;
  plates.push({ r, code: e.code, title: e.title, n: tsParams('techniques-templates/' + e.path), motion: !!e.motion, live: !!e.live });
}
for (const r of recs.filter((r) => r.collection === 'technique-studies')) {
  const S = stStudy(r.source); const ps = (S && Array.isArray(S.params)) ? S.params.filter((p) => p.type !== 'text') : [];
  plates.push({ r, code: r.call, title: r.title, n: ps.length, motion: false, live: false });
}
const date = (p) => (p.r.dates && p.r.dates.accessioned) || '';
const num = (p) => parseInt(String(p.code).replace(/\D/g, ''), 10) || 0;
const editable = plates.filter((p) => p.n > 0).sort((a, b) => date(b).localeCompare(date(a)) || (b.code.startsWith('TS') - a.code.startsWith('TS')) || num(b) - num(a));
const fixed = plates.filter((p) => p.n === 0).sort((a, b) => a.code.localeCompare(b.code) || num(a) - num(b));

/* collections -------------------------------------------------------------- */
const COLL = [
  { href: '../techniques-templates/', pic: 'thumbs/techniques-templates.png', title: 'Techniques & Templates', meta: `${plates.length} plates · ${TT.entries.filter((e) => e.section === 'templates').length} templates · parameters · specs` },
  { href: '../printed-matter-studies/', pic: 'thumbs/printed-matter.png', title: 'Printed Matter', meta: `Paper · ink · grain · ${recs.filter((r) => r.collection === 'printed-matter').length} studies` },
  { href: '../keyline-and-ink/', pic: 'thumbs/keyline-and-ink.png', title: 'Keyline & Ink', meta: 'SVG keyline · riso · 8 plates' },
  { href: '../fidelity-test/', pic: 'thumbs/fidelity-test.png', title: 'Fidelity Test', meta: 'Pure line · two subjects' },
  { href: '../material-studies-ii/', pic: 'thumbs/material-studies-ii.png', title: 'Material Studies II', meta: 'Ink grammar · bouquet' } ];
const pm = recs.filter((r) => r.collection === 'printed-matter').sort((a, b) => a.call.localeCompare(b.call));

const img = (r) => { const a = lib(r.thumb), b = lib(r.thumb_2x); const w = r.thumb_w || 480, h = r.thumb_h || 480;
  return `<img src="${esc(a)}"${b ? ` srcset="${esc(a)} ${w}w, ${esc(b)} ${r.thumb_2x_w || w * 2}w" sizes="(max-width:760px) 92vw, 360px"` : ''} width="${w}" height="${h}" alt="" loading="lazy" decoding="async">`; };
const tags = (p) => [p.n ? `<b>${p.n} parameter${p.n === 1 ? '' : 's'}</b>` : '', p.motion ? 'motion' : '', p.live ? 'pointer' : ''].filter(Boolean).join('<i>·</i>');
const card = (p) => `<a class="pl" href="${esc(p.r.href)}"><span class="fr">${img(p.r)}</span><span class="cap"><span class="cd">${esc(p.code)}</span><span class="tt">${esc(p.title)}</span>${tags(p) ? `<span class="tg">${tags(p)}</span>` : ''}</span></a>`;
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const nice = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="only light">
<title>Gallery — jalulia/tools</title>
<!-- generated by gallery/_build/build.mjs from library/catalog.json. Edit the builder, not this file. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#fff;--ink:#111;--ink-2:#5f5f5f;--ink-3:#9a9a9a;--line:#e5e5e5;--sunk:#f4f4f4;--acc:#f4551e;
  --font:'Archivo',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;--mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font);-webkit-font-smoothing:antialiased;font-feature-settings:'tnum' 1}
a{color:inherit;text-decoration:none}
.wrap{max-width:1240px;margin:0 auto;padding:0 40px}
header{padding:40px 0 0}
.top{border-top:2px solid var(--ink);padding-top:12px;display:flex;justify-content:space-between;font:500 10.5px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-2)}
.top b{color:var(--ink);font-weight:500}
.mast{display:grid;grid-template-columns:1fr minmax(0,38ch);gap:32px;align-items:end;padding:56px 0 30px;border-bottom:1px solid var(--line)}
h1{margin:0;font-weight:600;font-size:clamp(48px,9vw,112px);letter-spacing:-.035em;line-height:.88}
.stand{margin:0;font-size:14px;line-height:1.55;color:var(--ink-2)}
.stand b{color:var(--ink);font-weight:500}
.count{padding:14px 0 0;font:500 10.5px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)}
nav.jump{display:flex;gap:22px;padding:18px 0 0;font:500 10.5px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase}
nav.jump a{color:var(--ink-2);padding-bottom:4px;border-bottom:1px solid transparent}nav.jump a:hover{color:var(--ink);border-color:var(--ink)}
nav.jump i{font-style:normal;color:var(--ink-3);margin-left:5px}
section{padding-top:56px}
h2{margin:0 0 4px;display:flex;justify-content:space-between;align-items:baseline;padding-bottom:12px;border-bottom:2px solid var(--ink);font:600 12px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase}
h2 span:last-child{color:var(--ink-3);font-weight:500}
.blurb{margin:12px 0 22px;max-width:62ch;font-size:13.5px;line-height:1.55;color:var(--ink-2)}
.cols{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--line);border:1px solid var(--line)}
.co{background:var(--bg);padding:16px 16px 18px;display:flex;flex-direction:column;gap:12px;transition:background .15s}
.co:hover{background:#fafafa}
.co .fr{aspect-ratio:4/3}.co .fr img{object-fit:cover;object-position:50% 0}
.co .tt{font-size:15px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px 22px}
.pl{display:flex;flex-direction:column;gap:12px}
.fr{position:relative;display:block;aspect-ratio:4/5;background:var(--sunk);overflow:hidden;outline:1px solid var(--line);outline-offset:-1px}
.fr img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:0;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.pl:hover .fr img{transform:scale(1.025)}
.pl:focus-visible,.co:focus-visible{outline:2px solid var(--ink);outline-offset:4px}
.cap{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:baseline}
.cd{font:500 10.5px/1.2 var(--mono);letter-spacing:.08em;color:var(--ink-3)}
.tt{font-weight:600;font-size:16px;letter-spacing:-.01em;line-height:1.15}
.pl:hover .tt{text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
.tg{grid-column:2;font:400 10.5px/1.4 var(--mono);letter-spacing:.04em;color:var(--ink-2)}
.tg b{font-weight:500;color:var(--acc)}.tg i{font-style:normal;color:var(--ink-3);margin:0 6px}
.co .cd{display:none}.co .tg{grid-column:1/-1}
footer{display:flex;justify-content:space-between;padding:56px 0 44px;margin-top:56px;border-top:1px solid var(--line);font:400 10.5px/1 var(--mono);letter-spacing:.06em;color:var(--ink-3)}
footer a{color:var(--ink-2)}footer a:hover{color:var(--ink)}
@media(max-width:1080px){.grid{grid-template-columns:repeat(3,1fr)}.cols{grid-template-columns:repeat(3,1fr)}}
@media(max-width:760px){.wrap{padding:0 20px}.mast{grid-template-columns:1fr;gap:16px;padding-top:36px}.grid{grid-template-columns:repeat(2,1fr);gap:22px 14px}.cols{grid-template-columns:repeat(2,1fr)}.tt{font-size:14px}nav.jump{flex-wrap:wrap;gap:12px 18px}}
</style>
</head>
<body>
<div class="wrap">
<header>
  <div class="top"><span>jalulia / <b>tools</b></span><span>Gallery</span></div>
  <div class="mast"><h1>Gallery</h1><p class="stand"><b>Front-end studies.</b> Every texture is generated in the browser. Plates marked with parameters can be edited on their own page.</p></div>
  <div class="count">${editable.length + fixed.length + pm.length} plates · updated ${esc(nice(today))}</div>
  <nav class="jump"><a href="#editable">Editable<i>${editable.length}</i></a><a href="#plates">Read plates<i>${fixed.length}</i></a><a href="#printed">Printed matter<i>${pm.length}</i></a><a href="#collections">Collections<i>${COLL.length}</i></a></nav>
</header>

<section id="editable"><h2><span>Editable plates</span><span>${editable.length}</span></h2>
<p class="blurb">Newest first. Each opens its plate, where every parameter, ink and motion setting can be changed.</p>
<div class="grid">${editable.map(card).join('')}</div></section>

<section id="plates"><h2><span>Read plates</span><span>${fixed.length}</span></h2>
<p class="blurb">Measured rebuilds with a spec and no controls yet.</p>
<div class="grid">${fixed.map(card).join('')}</div></section>

<section id="printed"><h2><span>Printed matter</span><span>${pm.length}</span></h2>
<p class="blurb">Paper-and-ink studies on one page; each card opens its study on that page.</p>
<div class="grid">${pm.map((r) => card({ r, code: r.call, title: r.title, n: 0 })).join('')}</div></section>

<section id="collections"><h2><span>Collections</span><span>${COLL.length}</span></h2>
<div class="cols">${COLL.map((c) => `<a class="co" href="${esc(c.href)}"><span class="fr"><img src="${esc(c.pic)}" alt="" loading="lazy"></span><span class="cap"><span class="tt">${esc(c.title)}</span><span class="tg">${esc(c.meta)}</span></span></a>`).join('')}</div></section>

<footer><a href="../">← tools</a><a href="../library/">Library</a><a href="https://github.com/jalulia/tools">github.com/jalulia/tools</a></footer>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'gallery/index.html'), html);
console.log(`gallery · ${editable.length} editable · ${fixed.length} read plates · ${pm.length} printed matter · ${COLL.length} collections`);
