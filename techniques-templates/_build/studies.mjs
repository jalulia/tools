// node _build/studies.mjs [slug …]   — run from techniques-templates/.
// Puts every Technique Studies page (studies/st-NN-slug/index.html) on the T&T plate shell.
// Each study page is self-contained: its engine, its window.STUDY and (ST-13 on) the measured-plate bridge stay inline,
// untouched. This script swaps only the page around them: the head, the body markup from _build/page.html with a
// static read baked in, and the script tail (entries, vocab, art, studies, st-adapter, shell). The old chrome
// scripts and their CSS are removed. Safe to run again: an already-ported page keeps its inline scripts.
// Also writes studies/<slug>/spec.json and _shared/studies.js (the Studies manifest the shell and the index read).
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const only = process.argv.slice(2);
const DIR = 'studies';
const tpl = fs.readFileSync('_build/page.html', 'utf8');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STAMP = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
const version = (h) => h.replace(/(_shared\/(?:shell|art|entries|vocab|studies|st-adapter)\.(?:css|js))(\?v=\d+)?(?=["'])/g, (m, f) => f + '?v=' + STAMP);
const HIDDEN = (() => { try { return JSON.parse(fs.readFileSync('../library/_build/collections.json', 'utf8')).hidden || {}; } catch { return {}; } })();
const FAMILY = (() => { try { const c = JSON.parse(fs.readFileSync('../library/catalog.json', 'utf8')); return Object.fromEntries(c.records.filter((r) => r.collection === 'technique-studies').map((r) => [r.id.replace(/^st:/, ''), r.family || ''])); } catch { return {}; } })();

const evalStudy = (src) => { const box = { console: { log() {}, warn() {}, error() {} }, document: { createElement: () => ({ getContext: () => ({}) }), getElementById: () => null, fonts: { load: () => Promise.resolve() } }, performance: { now: () => 0 }, matchMedia: () => ({ matches: false }), addEventListener() {}, setTimeout() {}, Promise };
  box.window = box; try { vm.runInNewContext(src, vm.createContext(box), { timeout: 5000 }); } catch { /* engines may need a DOM; STUDY is set before they fail */ } return box.STUDY || null; };
const kindOf = (attrs, body) => {
  if (/\bsrc=/.test(attrs)) return 'src';
  if (/getElementById\(['"]copy['"]\)/.test(body)) return 'chrome';
  if (/measured plates: lay the instrument/.test(body)) return 'layout';
  return 'keep';
};

const dirs = fs.readdirSync(DIR).filter((d) => /^st-\d+/.test(d) && fs.existsSync(path.join(DIR, d, 'index.html'))).sort();
const LIST = [], PAGES = [];
for (const d of dirs) {
  const file = path.join(DIR, d, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => ({ attrs: m[1], body: m[2], kind: kindOf(m[1], m[2]) }));
  const keep = scripts.filter((s) => s.kind === 'keep');
  // the study data, read without a browser
  const S = evalStudy(keep.map((s) => s.body).join('\n;\n'));
  if (!S) { console.warn('skip (no STUDY):', d); continue; }
  const n = (d.match(/^st-(\d+)/) || [])[1]; const id = S.id || `st-${n}`;
  const hidden = !!HIDDEN[`st:${id}`];
  LIST.push({ id, code: S.code, title: S.title, path: `${DIR}/${d}/`, family: FAMILY[id] || '', techniques: (S.spec && S.spec.techniques || []).map((t) => t.id), ...(hidden ? { hidden: true } : {}) });
  PAGES.push({ d, file, html, scripts, keep, S, id, hidden });
}
for (const { d, file, html, scripts, keep, S, id, hidden } of PAGES) {
  if (only.length && !only.some((o) => d.includes(o))) continue;

  // engine fixes the shell's rules ask for: no coarse grain (ST-10), and a pixel budget that lets a 2x and 3x display
  // get a 1:1 render instead of an upscaled one (ST-13 on)
  for (const s of keep) {
    s.body = s.body.replace("GRAINS=[['off',0,1],['fine',0.08,1],['coarse',0.11,2]]", "GRAINS=[['off',0,1],['fine',0.08,1]]");
    s.body = s.body.replace('const BUDGET = 2.4e6;', 'const BUDGET = 6e6;');
  }
  // engine fonts: keep the page's @font-face rules (engines draw type on the canvas); drop the old chrome CSS
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  const faces = (styles.match(/@font-face\s*\{[^}]*\}/g) || []).join('\n');

  // spec.json beside the page
  const spec = Object.assign({ id, code: S.code, title: S.title, section: 'studies' }, S.spec || {});
  fs.writeFileSync(path.join(DIR, d, 'spec.json'), JSON.stringify(spec, null, 2));

  // the page: template head + body, static read baked in
  const head = `<style id="engine-fonts">\n${faces}\n</style>`;
  let page = tpl
    .replace(/<link rel="stylesheet" href="\.\.\/\.\.\/_shared\/shell\.css[^"]*">/, (m) => `${m}\n${head}`)
    .replace('<body class="plate-page" data-root="../../">', '<body class="plate-page st-page" data-root="../../">')
    .replace(/\{\{CODE\}\}/g, esc(S.code)).replace(/\{\{TITLE\}\}/g, esc(S.title))
    .replace(/\{\{DESCRIPTION\}\}/g, () => esc(`${S.code} · ${S.title} — ${S.lede || ''}`))
    .replace('{{NAV}}', () => nav(S, d))
    .replace('{{NOTES}}', () => notes(S, id))
    .replace('{{SPEC}}', () => esc(JSON.stringify(spec, null, 2)));
  page = page.replace(/<!-- \{\{NAV\}\}[\s\S]*?-->/, '<!-- Technique study on the T&T shell. The study\'s engine, data and bridge are the inline scripts below, unchanged;\n     _build/studies.mjs writes the rest. Edit the inline scripts or _build/, then run it again. -->');
  const tail = ['<script src="../../_shared/entries.js"></script>', '<script src="../../_shared/vocab.js"></script>', '<script src="../../_shared/art.js"></script>',
    ...keep.map((s) => `<script${s.attrs}>${s.body}</script>`),
    '<script src="../../_shared/studies.js"></script>', '<script src="../../_shared/st-adapter.js"></script>', '<script src="../../_shared/shell.js"></script>'].join('\n');
  page = page.replace(/<script src="\.\.\/\.\.\/_shared\/entries\.js[\s\S]*<\/script>\s*(?=<\/body>)/, () => tail + '\n');
  fs.writeFileSync(file, version(page));
  console.log('ported', d, `(${scripts.filter((s) => s.kind === 'chrome' || s.kind === 'layout').length} chrome scripts out, ${keep.length} kept)`, hidden ? 'hidden' : '');
}
LIST.sort((a, b) => parseInt(a.code.replace(/\D/g, ''), 10) - parseInt(b.code.replace(/\D/g, ''), 10));
fs.writeFileSync('_shared/studies.js', `/* generated by _build/studies.mjs — the Studies section of Techniques & Templates (ST plates). Do not edit. */\nwindow.TT_STUDIES=${JSON.stringify(LIST)};\n`);
console.log('wrote _shared/studies.js', LIST.length, 'studies', LIST.filter((e) => e.hidden).length, 'hidden');

/* static read, mirroring shell.js's nav and notes column */
function nav(S, d) { const vis = LIST_ALL().filter((e) => !e.hidden || e.id === S.id); const i = vis.findIndex((e) => e.path.includes(d)); const prev = vis[i - 1], next = vis[i + 1]; const R = '../../';
  return `<span class="crumb"><a href="${R}index.html">Techniques &amp; Templates</a><span class="sep">/</span><a href="${R}index.html#techniques">Studies</a><span class="sep">/</span><b>${esc(S.title)}</b><span class="code">${esc(S.code)}</span></span><span class="pager">${prev ? `<a href="${R}${prev.path}index.html">← ${esc(prev.code)}</a>` : '<a class="off" aria-disabled="true">←</a>'}<a class="pos" href="${R}index.html#techniques"><span class="n">${i + 1}</span>&nbsp;of ${vis.length}</a>${next ? `<a href="${R}${next.path}index.html">${esc(next.code)} →</a>` : '<a class="off" aria-disabled="true">→</a>'}</span>`; }
function notes(S, id) { const T = (S.spec && S.spec.techniques) || []; const fam = String(FAMILY[id] || '').replace(/-/g, ' ');
  const steps = ((S.spec && S.spec.pass_order) || []).map((s) => `<li><b>${esc(String(s).split(' · ')[0])}</b>${String(s).includes(' · ') ? `<span>${esc(String(s).split(' · ').slice(1).join(' · '))}</span>` : ''}</li>`).join('');
  const vrows = T.map((t) => `<li class="vr"><button type="button" data-t="${esc(t.id)}"><span class="vn">${esc(t.name || t.id)}</span><span class="vid">${esc(t.id)}</span></button></li>`).join('');
  const reads = (S.points || []).map((p) => `<li><b>${esc(p.d)} · ${esc(p.label)}</b><span>u ${(+p.u).toFixed(2)} · v ${(+p.v).toFixed(2)}${p.t ? ` · ${esc(p.t)}` : ''}</span></li>`).join('');
  const acc = (i, t, b, o) => `<details class="acc" name="notes" id="${i}"${o ? ' open' : ''}><summary><span>${t}</span></summary><div class="ab">${b}</div></details>`;
  return `<p class="kicker"><span>${esc(S.code)}</span>${fam ? `<span>${esc(fam)}</span>` : ''}</p><h1 class="title">${esc(S.title)}</h1>${S.lede ? `<p class="lede">${esc(S.lede)}</p>` : ''}<div class="body">${(S.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  <div class="accs">${steps ? acc('aBuild', 'How it is built', `<ol class="steps">${steps}</ol>`, true) : ''}${acc('aTech', `Techniques <i>${T.length}</i>`, `<ul class="vocab" id="chips">${vrows}</ul>`, !steps)}${acc('aRef', 'Reference and match', `<p class="src">${esc(S.source || '—')}</p><div class="fid" id="fid"></div>`)}${acc('aStudy', 'Study', `<dl class="kv"><dt>Code</dt><dd>${esc(S.code)}</dd><dt>Section</dt><dd>Studies</dd>${fam ? `<dt>Family</dt><dd>${esc(fam)}</dd>` : ''}<dt>Spec</dt><dd><a href="spec.json">spec.json</a></dd></dl>`)}${reads ? acc('aPts', `Callouts <i>${(S.points || []).length}</i>`, `<ol class="steps">${reads}</ol>`) : ''}${acc('aRel', 'Related', '<div class="rel" id="rel"></div>')}</div>`; }
function LIST_ALL() { return LIST.slice().sort((a, b) => parseInt(a.code.replace(/\D/g, ''), 10) - parseInt(b.code.replace(/\D/g, ''), 10)); }
