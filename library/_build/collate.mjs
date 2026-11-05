#!/usr/bin/env node
// library/_build/collate.mjs — the union catalog.
//
// Reads every collection where it lies and writes one catalog over all of
// them. It moves nothing, renames nothing and edits no source: a collection
// keeps its folder, its shell, its codes and its own order. What the library
// adds is a record per work, a number that never changes, two authority
// files, a see-also table, a fixity list and an audit.
//
//   node library/_build/collate.mjs            build
//   node library/_build/collate.mjs --thumbs   build, and (re)make access copies of the thumbs
//   node library/_build/collate.mjs --check    verify fixity + accessions against disk; writes nothing; exit 1 on drift
//
// No dependencies, same as scripts/build-site.mjs. Adding a collection is one
// row in collections.json; a new source shape is one reader below.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { loadManifest } from '../../scripts/lib/manifests.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const LIB = join(ROOT, 'library');
const ARGS = new Set(process.argv.slice(2));
const CHECK = ARGS.has('--check');
const THUMBS = ARGS.has('--thumbs');
const TODAY = new Date().toISOString().slice(0, 10);
const SCHEMA = 'library/1';

/* ------------------------------------------------------------------ small tools */
const read = (p) => readFileSync(p, 'utf8');
const readJson = (p) => JSON.parse(read(p));
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const posix = (p) => p.split('\\').join('/');
const repoRel = (abs) => posix(relative(ROOT, abs));
const exists = (repoPath) => existsSync(join(ROOT, repoPath));
const isDir = (repoPath) => exists(repoPath) && statSync(join(ROOT, repoPath)).isDirectory();

/** build-site.mjs never deploys a folder holding a `.private` marker. Neither does the catalog. */
function isPrivate(repoPath) {
  let d = join(ROOT, repoPath);
  if (existsSync(d) && !statSync(d).isDirectory()) d = dirname(d);
  while (d.startsWith(ROOT)) {
    if (existsSync(join(d, '.private'))) return true;
    if (d === ROOT) break;
    d = dirname(d);
  }
  return false;
}

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&middot;': '·', '&mdash;': '—', '&ndash;': '–' };
function plain(html) {
  return String(html || '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (m) => ENT[m] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
/** One line, cut at a sentence end where one falls in range. */
function line(text, max = 190) {
  const t = plain(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  if (stop > max * 0.45) return cut.slice(0, stop + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]+$/, '') + '…';
}
function sandbox(file, extra = {}) {
  const box = { console: { log() {}, warn() {}, error() {} }, ...extra };
  box.window = box;
  vm.runInNewContext(read(file), vm.createContext(box), { filename: file, timeout: 5000 });
  return box;
}

/* ------------------------------------------------------------------ git dates */
function gitDates() {
  try {
    const out = execFileSync('git', ['-C', ROOT, 'log', '--format=@%as', '--name-only', '--no-renames'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const first = new Map(), last = new Map();
    let d = null;
    for (const raw of out.split('\n')) {
      if (raw.startsWith('@')) { d = raw.slice(1); continue; }
      const p = raw.trim();
      if (!p) continue;
      if (!last.has(p)) last.set(p, d);      // log runs newest first
      first.set(p, d);
    }
    const head = execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
    return { first, last, head };
  } catch { return null; }
}
const GIT = gitDates();
function span(prefixes) {
  if (!GIT) return { first: null, last: null };
  let a = null, b = null;
  const hit = (p) => prefixes.some((x) => p === x || (x.endsWith('/') && p.startsWith(x)));
  for (const [p, d] of GIT.first) if (hit(p) && (!a || d < a)) a = d;
  for (const [p, d] of GIT.last) if (hit(p) && (!b || d > b)) b = d;
  return { first: a, last: b };
}

/* ------------------------------------------------------------------ readers
   Each returns raw records. A raw record carries repo-relative paths; the
   catalog rewrites them relative to library/ at the end. */

const READERS = {
  /** A learn/-shell manifest: encyclopedia. Loaded with the gate's own loader. */
  'learn-manifest'(col) {
    const m = loadManifest(join(ROOT, col.path, 'manifest.js'));
    const sections = new Map((m.manifest.sections || []).map((s) => [s.id, s]));
    const route = { technique: 'technique', atom: 'atom', coupling: 'coupling' };
    const out = m.entries.map((e, i) => {
      const dir = `${col.path}/${e.path || `content/${e.id}/`}`;
      const thumbFile = e.thumb ? (typeof e.thumb === 'string' ? e.thumb : e.thumb.file) : null;
      const thumb = thumbFile && exists(dir + thumbFile) ? dir + thumbFile : null;
      const src = exists(dir + 'entry.js') ? dir + 'entry.js' : `${col.path}/manifest.js`;
      const rel = [];
      for (const t of e.instance_of || []) rel.push({ type: 'instance-of', to: `enc:${t}` });
      for (const a of e.uses || []) rel.push({ type: 'uses', to: `enc:${a}` });
      for (const a of e.produces || []) rel.push({ type: 'produces', to: `enc:${a}` });
      for (const r of e.related || []) if (!r.tool || r.tool === col.id) rel.push({ type: r.relation || 'related', to: `enc:${r.entry}` });
      const reads = (e.spec?.techniques || []).map((t) => ({ scheme: 'enc.read', id: t.id, name: t.name, short: t.short, layer: t.layer, implementation: t.implementation, atoms: t.atoms || [] }));
      const s = e.source || {};
      return {
        id: `enc:${e.id}`, slug: e.id, call: e.index ? String(e.index) : (e.order != null ? String(e.order) : ''),
        title: e.title, sub: line(e.description || (e.body && e.body[0]) || e.text || s.note || ''),
        kind: e.entity, collection: col.id, section: e.section, section_title: sections.get(e.section)?.title || e.section,
        status: e.status || null, lane: e.lane || null, layer: e.layer || null, style: e.style || null,
        href: `${col.path}/#/${route[e.entity] || 'entry'}/${e.id}`,
        thumbSrc: thumb, source: src, dirs: [dir, `book-of-shaders/content/${e.id}/`, `components/content/${e.id}/`],
        plate: { spec: !!e.spec, points: (e.points || []).length, examples: (e.examples || []).length, params: Array.isArray(e.params) ? e.params.length : 0 },
        reads, atom_kind: e.entity === 'atom' ? (e.kind || null) : null,
        rel, governed_by: e.governed_by || [],
        provenance: { kind: s.kind || null, title: s.title || null, author: s.author || null, date: s.date || null, license: s.license || null, url: s.url || null,
          rights: s.kind === 'original' ? 'first-party' : s.kind === 'adapted' ? 'adapted' : s.kind === 'reference-study' ? 'reference-study' : null },
        ruling: e.ruling ? { by: e.ruling.by, date: e.ruling.date || null } : null,
        proposed_grade: e.proposed_grade || null,
        access: 'public', tags: (e.tags || []).filter((t) => !['imported', 'unsorted'].includes(t)), order: i
      };
    });
    out.meta = {
      sections: (m.manifest.sections || []).map((s) => ({ id: s.id, title: s.title, order: s.order })),
      styles: (m.manifest.styles || []).map((s) => ({ id: s.id, title: s.title, summary: s.summary, palette: s.palette, entries: (s.entries || []).map((x) => `enc:${x}`) })),
      skills: (m.manifest.skills || []).map((s) => ({ id: s.id, title: s.title || s.id })),
      status_vocabulary: m.manifest.vocabulary?.status || {}
    };
    return out;
  },

  /** Techniques & Templates: _shared/entries.js is the roster, spec.json the measured record. */
  'tt-entries'(col) {
    const TT = sandbox(join(ROOT, col.path, '_shared', 'entries.js')).TT;
    const secs = new Map((TT.sections || []).map((s) => [s.id, s]));
    const out = [];
    let withheld = 0;
    // a private entry is not in entries.js; count the folders so the audit can say how many were left out
    for (const sec of ['techniques', 'templates']) {
      const base = `${col.path}/${sec}`;
      if (!isDir(base)) continue;
      for (const d of readdirSync(join(ROOT, base))) if (isDir(`${base}/${d}`) && isPrivate(`${base}/${d}`)) withheld++;
    }
    TT.entries.forEach((e, i) => {
      const dir = `${col.path}/${e.path}`;
      if (isPrivate(dir)) return;
      const spec = exists(dir + 'spec.json') ? readJson(join(ROOT, dir + 'spec.json')) : null;
      const reads = (spec?.techniques || []).map((t) => ({
        scheme: 'tt', id: t.id, name: t.name, short: t.short, layer: t.layer ?? null, pass: t.pass ?? null,
        implementation: t.implementation || null, limits: t.limits || null, module: t.module ? `${col.path}/${t.module}` : null,
        ranged: JSON.stringify(t.params || {}).includes('"range"'), atoms: t.atoms || []
      }));
      if (!reads.length) for (const id of e.techniques || []) reads.push({ scheme: 'tt', id, name: id, atoms: [] });
      let refWithheld = null;
      if (exists(dir + 'ref.js')) refWithheld = /"data"\s*:\s*null/.test(read(join(ROOT, dir + 'ref.js')).slice(0, 200));
      const isStudy = e.section === 'techniques';
      out.push({
        id: `tt:${e.id}`, slug: e.id, call: e.code, title: e.title, sub: line(e.sub || ''),
        kind: isStudy ? 'study' : 'template', collection: col.id, section: e.section, section_title: secs.get(e.section)?.title || e.section,
        status: null, lane: isStudy ? 'canvas2d' : null, layer: null, style: null,
        href: dir, thumbSrc: exists(dir + 'thumb.png') ? dir + 'thumb.png' : null,
        source: exists(dir + 'study.js') ? dir + 'study.js' : dir + 'index.html', dirs: [dir],
        spec_href: spec ? dir + 'spec.json' : (exists(dir + 'template.json') ? dir + 'template.json' : null),
        plate: { spec: !!spec || exists(dir + 'template.json'), points: isStudy ? 10 : 0, variants: (e.variants || []).length, motion: !!e.motion, live: !!e.live,
          modules: reads.filter((r) => r.module).length, compare: refWithheld === false },
        reads, rel: [], governed_by: [],
        provenance: { kind: isStudy ? 'reference-study' : 'original', title: spec?.reference?.grammar || null, author: null, date: null, license: null, url: null,
          rights: refWithheld === true ? 'reference-withheld' : refWithheld === false ? 'first-party' : null },
        swatches: (e.variants && e.variants[0]) || null,
        access: 'public', tags: [], order: i
      });
    });
    out.meta = { withheld };
    return out;
  },

  /** Technique Studies: each plate is a standalone page with window.STUDY inside. */
  'st-plates'(col) {
    const out = [];
    const files = readdirSync(join(ROOT, col.path)).filter((f) => /^st-\d+.*\.html$/.test(f)).sort();
    files.forEach((f, i) => {
      const file = `${col.path}/${f}`;
      const html = read(join(ROOT, file));
      const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
      const art = scripts.find((s) => /window\.STUDY\s*=/.test(s));
      let S = null;
      if (art) {
        try {
          const box = { console: { log() {}, warn() {}, error() {} }, document: { createElement: () => ({ getContext: () => ({}) }) }, performance: { now: () => 0 } };
          box.window = box;
          vm.runInNewContext(art, vm.createContext(box), { timeout: 5000 });
          S = box.STUDY;
        } catch { S = null; }
      }
      const pick = (k) => (S && S[k]) || (art && (art.match(new RegExp(`\\b${k}\\s*:\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1]) || null;
      const n = (f.match(/^st-(\d+)/) || [])[1];
      const points = (S && Array.isArray(S.points)) ? S.points : [];
      const blocks = (S && S.spec && Array.isArray(S.spec.techniques)) ? S.spec.techniques : [];
      const names = new Map(blocks.map((b) => [b.id, b]));
      const ids = [...new Set([...blocks.map((b) => b.id), ...points.map((p) => p.t)].filter(Boolean))];
      const reads = ids.map((id) => {
        const b = names.get(id) || {};
        const p = points.find((x) => x.t === id);
        return { scheme: 'st', id, name: b.name || (p ? p.label.split(' · ')[0] : id), short: p ? p.d : (b.short || null), implementation: b.implementation || (p ? p.label : null), atoms: b.atoms || [] };
      });
      const refNull = /window\.__REF\s*=\s*\{[^}]{0,60}"data"\s*:\s*null/.test(html);
      const thumb = `gallery/thumbs/ts-st${n}.png`;
      out.push({
        id: `st:st-${n}`, slug: f.replace(/\.html$/, ''), call: pick('code') || `ST-${n}`, title: pick('title') || plain((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || f),
        sub: line(pick('lede') || pick('method') || ''),
        kind: 'study', collection: col.id, section: 'plates', section_title: 'Read plates',
        status: null, lane: 'canvas2d', layer: null, style: null,
        href: file, thumbSrc: exists(thumb) ? thumb : null, source: file, dirs: [file],
        plate: { spec: !!(S && S.spec), points: points.length, compare: !refNull },
        reads, rel: [], governed_by: [],
        provenance: { kind: 'reference-study', title: pick('source'), author: null, date: null, license: null, url: null, rights: refNull ? 'reference-withheld' : 'reference-published' },
        access: 'public', tags: [], order: i
      });
    });
    return out;
  },

  /** Printed Matter: one page, one BUILDERS entry per study, addressed by anchor. */
  'pm-page'(col) {
    const file = `${col.path}/index.html`;
    const html = read(join(ROOT, file));
    const out = [];
    const re = /study\(\s*"(st(\d+))"\s*,\s*reg\(\s*"(\d+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"/g;
    let m, i = 0;
    while ((m = re.exec(html))) {
      const thumb = `gallery/thumbs/pm-${m[1]}.png`;
      // the page sets titles in capitals; the catalog writes them the way the gallery does
      const small = new Set(['a', 'an', 'and', 'de', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
      const title = m[4].toLowerCase().split(' ').map((w, k) => (k && small.has(w) ? w : w.replace(/^[a-zà-ÿ]/, (c) => c.toUpperCase()))).join(' ');
      out.push({
        id: `pm:${m[1]}`, slug: m[1], call: `ST.${m[3]}`, title, sub: line(m[5]),
        kind: 'study', collection: col.id, section: 'studies', section_title: 'Studies',
        status: null, lane: 'canvas2d', layer: null, style: null,
        href: `${file.replace(/index\.html$/, '')}#${m[1]}`, thumbSrc: exists(thumb) ? thumb : null, source: file, dirs: [file],
        plate: { spec: false, points: 0 }, reads: [], rel: [], governed_by: [],
        provenance: { kind: 'original', title: null, author: null, date: null, license: null, url: null, rights: 'first-party' },
        access: 'public', tags: m[5].split('·').map((s) => s.trim()).filter(Boolean), order: i++
      });
    }
    return out;
  },

  /** A one-page study with a tool.json. */
  'single-page'(col) { return folderRecords(col, 'gal', 'study'); },
  /** A working tool. */
  'instrument'(col) { return folderRecords(col, 'ins', 'instrument'); },

  /** Work outside the deployed site, kept by hand in holdings.json. */
  'holdings'(col) {
    const H = readJson(join(HERE, 'holdings.json'));
    const out = H.records.map((h, i) => ({
      id: `hld:${h.id}`, slug: h.id, call: h.call || '', title: h.title, sub: h.sub || '',
      kind: h.kind, collection: col.id, section: h.access, section_title: h.access === 'local' ? 'On the working machine' : 'Staged',
      status: h.status ?? null, lane: null, layer: h.layer || null, style: null,
      href: null, thumbSrc: null, source: 'library/_build/holdings.json', dirs: [], held_date: h.date || null,
      plate: { spec: false, points: 0 }, reads: [], rel: h.rel || [], governed_by: [],
      provenance: { kind: null, title: h.location || null, author: null, date: h.date || null, license: null, url: null, rights: null },
      location: h.location || null, target: h.target || null, becomes: h.becomes || null, title_from_id: !!h.title_from_id,
      access: h.access, tags: [], order: i
    }));
    out.meta = { as_of: H.as_of };
    return out;
  }
};

function folderRecords(col, prefix, kind) {
  const out = [];
  (col.members || []).forEach((name, i) => {
    if (!isDir(name) || isPrivate(name)) return;
    const meta = exists(`${name}/tool.json`) ? readJson(join(ROOT, name, 'tool.json')) : {};
    const html = exists(`${name}/index.html`) ? read(join(ROOT, name, 'index.html')) : '';
    const thumb = `gallery/thumbs/${name}.png`;
    out.push({
      id: `${prefix}:${name}`, slug: name, call: '', title: meta.title || plain((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || name),
      sub: line(meta.description || ''), kind, collection: col.id, section: kind === 'instrument' ? 'tools' : 'pages', section_title: kind === 'instrument' ? 'Tools' : 'Pages',
      status: null, lane: null, layer: null, style: null,
      href: `${name}/`, thumbSrc: exists(thumb) ? thumb : null, source: `${name}/index.html`, dirs: [`${name}/`],
      plate: { spec: false, points: 0 }, reads: [], rel: [], governed_by: [],
      provenance: { kind: 'original', title: null, author: null, date: null, license: null, url: null, rights: 'first-party' },
      access: 'public', tags: [], order: i
    });
  });
  return out;
}

/* ------------------------------------------------------------------ collate */
const CFG = readJson(join(HERE, 'collections.json'));
const problems = [];
const raw = [];
const colMeta = {};
for (const col of CFG.collections) {
  const reader = READERS[col.reader];
  if (!reader) { problems.push(`collections.json: no reader "${col.reader}" for ${col.id}`); continue; }
  const recs = reader(col);
  colMeta[col.id] = recs.meta || {};
  for (const r of recs) raw.push(r);
}
{
  const seen = new Set();
  for (const r of raw) { if (seen.has(r.id)) problems.push(`duplicate record id ${r.id}`); seen.add(r.id); }
}

/* dates + fixity ---------------------------------------------------------- */
const fixity = {};
for (const r of raw) {
  const s = r.dirs.length ? span(r.dirs) : { first: null, last: null };
  r.dates = { accessioned: s.first || r.held_date || null, modified: s.last || r.held_date || null };
  if (r.source && exists(r.source)) {
    if (!fixity[r.source]) fixity[r.source] = sha256(readFileSync(join(ROOT, r.source)));
    r.fixity = fixity[r.source];
  } else r.fixity = null;
}

/* accession numbers ------------------------------------------------------- */
const ACC_FILE = join(LIB, 'accessions.json');
const ACC = existsSync(ACC_FILE) ? readJson(ACC_FILE) : { records: {}, next: 1 };
const before = JSON.stringify(ACC.records);
const colOrder = new Map(CFG.collections.map((c, i) => [c.id, i]));
const pending = raw.filter((r) => !ACC.records[r.id])
  .sort((a, b) => (a.dates.accessioned || '9999').localeCompare(b.dates.accessioned || '9999') || colOrder.get(a.collection) - colOrder.get(b.collection) || a.order - b.order);
for (const r of pending) {
  // a holding that landed in a collection keeps the number it was given as a holding
  const prior = Object.entries(ACC.records).find(([, v]) => v.becomes === r.id);
  if (prior) { ACC.records[r.id] = { acc: prior[1].acc, accessioned: prior[1].accessioned, was: prior[0] }; continue; }
  const date = r.dates.accessioned || TODAY;
  ACC.records[r.id] = { acc: `${date.slice(0, 4)}.${String(ACC.next++).padStart(4, '0')}`, accessioned: date };
  if (r.becomes) ACC.records[r.id].becomes = r.becomes;
}
const live = new Set(raw.map((r) => r.id));
const withdrawn = [];
for (const [id, v] of Object.entries(ACC.records)) {
  if (live.has(id)) { delete v.withdrawn; continue; }
  if (Object.values(ACC.records).some((o) => o.was === id)) continue;   // became another record
  if (!v.withdrawn) v.withdrawn = TODAY;
  withdrawn.push({ id, acc: v.acc, withdrawn: v.withdrawn });
}
for (const r of raw) { r.acc = ACC.records[r.id].acc; r.dates.accessioned = ACC.records[r.id].accessioned; }
raw.sort((a, b) => a.acc.slice(5).localeCompare(b.acc.slice(5)));
const byId = new Map(raw.map((r) => [r.id, r]));

/* access copies of the thumbs --------------------------------------------- */
const THUMB_DIR = join(LIB, 'thumbs');
function makeThumb(src, dst) {
  if (process.platform === 'darwin') {
    try { execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', '480', src, '--out', dst], { stdio: 'ignore' }); return true; } catch { /* fall through */ }
  }
  try {
    execFileSync('python3', ['-c',
      'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nw,h=im.size\ns=min(1,480/max(w,h))\nim=im.resize((max(1,round(w*s)),max(1,round(h*s))),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=82,optimize=True)',
      src, dst], { stdio: 'ignore' });
    return true;
  } catch { return false; }
}
let thumbsMade = 0, thumbsFailed = 0;
for (const r of raw) {
  r.thumb = null; r.thumb_kind = null;
  const name = `${r.acc}.jpg`, dst = join(THUMB_DIR, name);
  if (!r.thumbSrc) {
    // no thumbnail of its own: a snapshot made by snap.mjs may stand in
    if (existsSync(dst)) { r.thumb = `thumbs/${name}`; r.thumb_kind = 'snapshot'; }
    continue;
  }
  const src = join(ROOT, r.thumbSrc);
  if (THUMBS && !CHECK && (!existsSync(dst) || statSync(dst).mtimeMs < statSync(src).mtimeMs)) {
    mkdirSync(THUMB_DIR, { recursive: true });
    if (makeThumb(src, dst)) thumbsMade++; else thumbsFailed++;
  }
  r.thumb = existsSync(dst) ? `thumbs/${name}` : `../${r.thumbSrc}`;   // the master stays with its record
  r.thumb_master = `../${r.thumbSrc}`; r.thumb_kind = 'copy';
}

/* authority: techniques ---------------------------------------------------- */
const techniques = new Map();
const term = (map, key, init) => { if (!map.has(key)) map.set(key, init()); return map.get(key); };
for (const r of raw) {
  if (r.kind === 'technique') {
    const scheme = r.collection === 'holdings' ? 'hld' : 'enc';
    const t = term(techniques, `${scheme}:${r.slug}`, () => ({ key: `${scheme}:${r.slug}`, scheme, id: r.slug, name: r.title, record: r.id, layer: r.layer, uses: [] }));
    t.uses.push({ rec: r.id, role: 'entry' });
  }
}
for (const r of raw) {
  for (const x of r.rel) if (x.type === 'instance-of') {
    const t = techniques.get(x.to);
    if (t) t.uses.push({ rec: r.id, role: 'instance' }); else problems.push(`${r.id}: instance-of ${x.to} does not resolve`);
  }
  for (const rd of r.reads) {
    const key = `${rd.scheme}:${rd.id}`;
    const t = term(techniques, key, () => ({ key, scheme: rd.scheme, id: rd.id, name: rd.name, record: null, layer: null, uses: [] }));
    const use = { rec: r.id, role: 'read' };
    for (const k of ['short', 'implementation', 'limits', 'module']) if (rd[k]) use[k] = rd[k];
    if (rd.ranged) use.ranged = true;
    t.uses.push(use);
  }
}

/* authority: atoms --------------------------------------------------------- */
const atoms = new Map();
for (const r of raw) if (r.kind === 'atom') term(atoms, r.id, () => ({ key: r.id, scheme: 'enc', id: r.slug, name: r.title, record: r.id, atom_kind: r.atom_kind, uses: [] }));
for (const r of raw) for (const x of r.rel) if (x.type === 'uses' || x.type === 'produces') {
  const a = atoms.get(x.to);
  if (a) a.uses.push({ rec: r.id, role: x.type });
  else if (r.collection !== 'holdings') problems.push(`${r.id}: ${x.type} ${x.to} does not resolve to an atom`);
}
for (const r of raw) for (const rd of r.reads) for (const a of rd.atoms || []) {
  const key = `${rd.scheme}:${a}`;
  const at = term(atoms, key, () => ({ key, scheme: rd.scheme, id: a, name: a, record: null, atom_kind: null, uses: [] }));
  at.uses.push({ rec: r.id, role: 'in', via: `${rd.scheme}:${rd.id}` });
}

/* see-also ---------------------------------------------------------------- */
const XW = readJson(join(HERE, 'crosswalk.json'));
const resolves = (ref) => {
  const [type, ...rest] = ref.split(':'); const key = rest.join(':');
  if (type === 'record') return byId.has(key);
  if (type === 'technique') return techniques.has(key);
  if (type === 'atom') return atoms.has(key);
  return false;
};
const see = [];
for (const l of XW.links) {
  const bad = [l.a, l.b].filter((x) => !resolves(x));
  if (bad.length) { problems.push(`crosswalk.json: ${bad.join(', ')} does not resolve`); continue; }
  if (!XW.relations[l.relation]) problems.push(`crosswalk.json: unknown relation "${l.relation}"`);
  see.push(l);
}

/* audit ------------------------------------------------------------------- */
const audit = [];
const finding = (id, level, title, detail, extra = {}) => audit.push({ id, level, title, detail, ...extra });
const pub = raw.filter((r) => r.access === 'public');
{
  const uns = raw.filter((r) => r.status === 'unsorted');
  if (uns.length) finding('unsorted', 'ruling', 'Imports awaiting a ruling', 'Filed from the inventory with a proposed grade. Each wants a section and a status.', { records: uns.map((r) => r.id) });
  const prop = raw.filter((r) => r.status === 'proposed' && r.access === 'public');
  if (prop.length) finding('proposed', 'ruling', 'Proposed, live, not yet ruled canonical', 'Written by the tool. Only a person graduates work to canonical.', { records: prop.map((r) => r.id) });
  const staged = raw.filter((r) => r.access === 'staged');
  if (staged.length) finding('staged', 'ruling', 'Staged, not live', 'Patches and proposals outside the deployed site.', { records: staged.map((r) => r.id) });
  const local = raw.filter((r) => r.access === 'local');
  if (local.length) finding('local', 'gap', 'Kept on the working machine only', 'Catalogued from build notes. Not in the repository.', { records: local.map((r) => r.id) });
  const xp = see.filter((l) => l.by === 'proposed');
  if (xp.length) finding('see-also-proposed', 'ruling', 'See-also links not yet ruled', 'Hand-written by the tool in library/_build/crosswalk.json. Shown as PROPOSED and used for nothing else.', { links: xp.map((l) => `${l.a} · ${l.relation} · ${l.b}`) });

  const noStatus = pub.filter((r) => !r.status && r.kind !== 'instrument');
  if (noStatus.length) finding('no-status', 'gap', 'No status on file', 'These collections carry no status field. The library shows a blank, never a guess.', { records: noStatus.map((r) => r.id) });
  const noThumb = pub.filter((r) => !r.thumb);
  if (noThumb.length) finding('no-surrogate', 'gap', 'No thumbnail on file', 'The plate exists; its picture for the index does not.', { records: noThumb.map((r) => r.id) });
  const snaps = pub.filter((r) => r.thumb_kind === 'snapshot');
  if (snaps.length) finding('snapshot', 'gap', 'A page snapshot stands in for a thumbnail', 'These plates have no thumbnail of their own. The library photographed the live page (library/_build/snap.mjs).', { records: snaps.map((r) => r.id) });
  const fromId = raw.filter((r) => r.title_from_id);
  if (fromId.length) finding('title-from-id', 'gap', 'Title written from the slug', 'Holdings whose real title is in a document the catalog cannot read.', { records: fromId.map((r) => r.id) });

  // atoms no technique produces (the open join-passes)
  const produced = new Set(raw.flatMap((r) => r.rel.filter((x) => x.type === 'produces' && r.access === 'public').map((x) => x.to)));
  const orphans = raw.filter((r) => r.kind === 'atom' && !produced.has(r.id));
  if (orphans.length) finding('orphan-atom', 'gap', 'Atoms no live technique produces', 'Substrates, engines and buses are inputs and may stay this way. Process atoms can be closed by a technique.', { records: orphans.map((r) => r.id) });

  // parts-bin coverage
  const ttUses = [...techniques.values()].filter((t) => t.scheme === 'tt').flatMap((t) => t.uses);
  const lift = ttUses.filter((u) => u.module).length;
  if (ttUses.length) finding('module-coverage', 'gap', 'Technique reads with a liftable module', `${lift} of ${ttUses.length} reads in Techniques & Templates name a module file. The rest are described, not yet liftable.`, { n: lift, of: ttUses.length, records: [...new Set(ttUses.filter((u) => u.module).map((u) => u.rec))] });

  // one id, two vocabularies
  const tIds = new Map(); for (const t of techniques.values()) (tIds.get(t.id) || tIds.set(t.id, []).get(t.id)).push(t.key);
  const aIds = new Map(); for (const a of atoms.values()) (aIds.get(a.id) || aIds.set(a.id, []).get(a.id)).push(a.key);
  const clash = [];
  for (const [id, keys] of tIds) {
    const asAtom = aIds.get(id) || [];
    if (asAtom.length) clash.push(`${id}: technique in ${keys.map((k) => k.split(':')[0]).join(', ')} · atom in ${asAtom.map((k) => k.split(':')[0]).join(', ')}`);
  }
  if (clash.length) finding('vocabulary-collision', 'drift', 'One id filed at two levels', 'The same word is a technique in one vocabulary and an atom in another.', { items: clash });

  // call numbers that collide across collections
  const calls = new Map();
  for (const r of raw) { if (!r.call) continue; const k = r.call.replace(/[^A-Za-z0-9]/g, '').toUpperCase(); (calls.get(k) || calls.set(k, []).get(k)).push(r); }
  const dup = [...calls.values()].filter((v) => new Set(v.map((r) => r.collection)).size > 1);
  if (dup.length) finding('call-collision', 'drift', 'Call numbers used by two collections', 'Codes are local to a collection. The accession number is the one that is unique.', { items: dup.map((v) => v.map((r) => `${r.call} ${r.title} (${r.collection})`).join('  ↔  ')), records: dup.flat().map((r) => r.id) });

  // counts stated by hand on the gallery page
  if (exists('gallery/index.html')) {
    const g = read(join(ROOT, 'gallery/index.html'));
    const count = (c, k) => raw.filter((r) => r.collection === c && (!k || r.kind === k)).length;
    const stated = [];
    for (const m of g.matchAll(/<a class="card"[^>]*href="\.\.\/([^"/#]+)\/"[\s\S]*?class="meta">([\s\S]*?)</g)) {
      const folder = m[1], meta = plain(m[2]);
      const col = CFG.collections.find((c) => c.path === folder);
      if (!col) continue;
      for (const n of meta.matchAll(/(\d+)\s+(plates?|templates?|rebuilds?)/g)) {
        const want = /template/.test(n[2]) ? count(col.id, 'template') : col.id === 'techniques-templates' ? count(col.id, 'study') : count(col.id);
        if (Number(n[1]) !== want) stated.push(`gallery card "${col.title}" says ${n[1]} ${n[2]}; the source has ${want}`);
      }
    }
    if (stated.length) finding('stated-count', 'drift', 'Counts written by hand that no longer match', 'A number typed into a page drifts. Every count in the library is derived.', { items: stated });
  }
  const wh = Object.values(colMeta).reduce((n, m) => n + (m.withheld || 0), 0);
  if (wh) finding('withheld', 'note', 'Left out by a .private marker', 'Folders the deploy skips are skipped here too. They are counted, not named.', { n: wh });
  if (withdrawn.length) finding('withdrawn', 'note', 'Accession numbers whose record is gone', 'A number is never reused. If a record was renamed, restore the id or accept the withdrawal.', { items: withdrawn.map((w) => `${w.acc} ${w.id} (${w.withdrawn})`) });
  for (const s of CFG.superseded) finding(`superseded:${s.path}`, 'note', `${s.path}/ is not counted twice`, `${s.note}`, {});
  for (const p of problems) finding('problem', 'drift', 'Does not resolve', p, {});
}

/* shape the public catalog -------------------------------------------------- */
const out = (r) => {
  const o = {
    acc: r.acc, id: r.id, call: r.call, title: r.title, sub: r.sub, kind: r.kind,
    collection: r.collection, section: r.section, section_title: r.section_title,
    status: r.status, lane: r.lane, layer: r.layer, style: r.style, access: r.access,
    href: r.href ? `../${r.href}` : null, thumb: r.thumb, source: r.source,
    dates: r.dates, fixity: r.fixity ? r.fixity.slice(0, 16) : null,
    plate: r.plate, techniques: [...new Set([...(r.kind === 'technique' ? [`${r.collection === 'holdings' ? 'hld' : 'enc'}:${r.slug}`] : []), ...r.rel.filter((x) => x.type === 'instance-of').map((x) => x.to), ...r.reads.map((x) => `${x.scheme}:${x.id}`)])],
    atoms: [...new Set([...r.rel.filter((x) => x.type === 'uses' || x.type === 'produces').map((x) => x.to), ...r.reads.flatMap((x) => (x.atoms || []).map((a) => `${x.scheme}:${a}`))])],
    rel: r.rel, provenance: r.provenance
  };
  for (const k of ['spec_href', 'thumb_master']) if (r[k]) o[k] = k === 'spec_href' ? `../${r[k]}` : r[k];
  for (const k of ['governed_by', 'tags']) if (r[k] && r[k].length) o[k] = r[k];
  for (const k of ['swatches', 'ruling', 'proposed_grade', 'atom_kind', 'location', 'target']) if (r[k]) o[k] = r[k];
  if (r.thumb_kind === 'snapshot') o.thumb_kind = 'snapshot';
  return o;
};
const records = raw.map(out);
const collections = CFG.collections.map((c) => {
  const mine = raw.filter((r) => r.collection === c.id);
  const sections = [];
  const order = colMeta[c.id]?.sections;
  const seen = new Map();
  for (const r of [...mine].sort((a, b) => a.order - b.order)) {
    if (!seen.has(r.section)) { seen.set(r.section, { id: r.section, title: r.section_title, records: [] }); sections.push(seen.get(r.section)); }
    seen.get(r.section).records.push(r.id);
  }
  if (order) sections.sort((a, b) => (order.find((s) => s.id === a.id)?.order ?? 999) - (order.find((s) => s.id === b.id)?.order ?? 999));
  return { id: c.id, code: c.code, title: c.title, path: c.path, truth: c.truth, index: c.index, note: c.note, n: mine.length, sections };
});
const catalog = {
  schema: SCHEMA, generated: TODAY, source_commit: GIT?.head || null,
  counts: {
    records: records.length,
    public: records.filter((r) => r.access === 'public').length,
    collections: collections.length,
    techniques: techniques.size, atoms: atoms.size,
    by_kind: tally(records, 'kind'), by_collection: tally(records, 'collection'), by_status: tally(records, 'status'), by_access: tally(records, 'access')
  },
  vocabulary: {
    kind: {
      technique: 'A verb with a lesson: a way of doing something, with its instances.',
      atom: 'A noun with parameters: a substrate, process, texture, color, engine, field, mark, voice, space or bus.',
      exploration: 'A piece that runs techniques on a subject. Kept because it asks or answers something.',
      coupling: 'An exploration with one driver and named consequences.',
      study: 'One reference measured, one technique system rebuilt in code, one spec filed.',
      template: 'A composed layout meant to be reused with new content.',
      instrument: 'A working tool.'
    },
    status: { ...(colMeta.encyclopedia?.status_vocabulary || {}), '': 'No status on file. The collection does not record one.' },
    access: { public: 'On the deployed site.', staged: 'Built or proposed, waiting to land.', local: 'On the working machine only.' },
    scheme: { enc: 'Encyclopedia technique entries and atoms', 'enc.read': 'Technique reads inside encyclopedia plates', tt: 'Techniques & Templates', st: 'Technique Studies', hld: 'Holdings' }
  },
  collections, superseded: CFG.superseded, not_collated: CFG.not_collated,
  styles: colMeta.encyclopedia?.styles || [], skills: colMeta.encyclopedia?.skills || [],
  records,
  authority: {
    techniques: [...techniques.values()].sort((a, b) => a.key.localeCompare(b.key)),
    atoms: [...atoms.values()].sort((a, b) => a.key.localeCompare(b.key)),
    see_also: { relations: XW.relations, links: see }
  },
  audit
};
function tally(list, key) { const t = {}; for (const r of list) { const k = r[key] ?? ''; t[k] = (t[k] || 0) + 1; } return t; }

/* --check ------------------------------------------------------------------ */
if (CHECK) {
  const drift = [];
  const FIX_FILE = join(LIB, 'fixity.json');
  if (existsSync(FIX_FILE)) {
    const old = readJson(FIX_FILE).files;
    for (const [p, h] of Object.entries(fixity)) if (old[p] && old[p] !== h) drift.push(`changed since last build: ${p}`);
    for (const p of Object.keys(old)) if (!fixity[p]) drift.push(`gone since last build: ${p}`);
    for (const p of Object.keys(fixity)) if (!old[p]) drift.push(`new since last build: ${p}`);
  } else drift.push('no fixity.json yet: run a build first');
  if (JSON.stringify(ACC.records) !== before) drift.push('accessions.json would change: records were added, withdrawn or renamed');
  for (const p of problems) drift.push(p);
  console.log(drift.length ? `✘ ${drift.length} difference(s)\n  · ${drift.join('\n  · ')}` : `✔ ${records.length} records, ${Object.keys(fixity).length} source files, nothing changed`);
  process.exit(drift.length ? 1 : 0);
}

/* write -------------------------------------------------------------------- */
const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
ACC.note = 'The accession register. A number is given once, in order of arrival, and never changes or gets reused, whatever happens to the record. Written by library/_build/collate.mjs; do not renumber by hand.';
ACC.scheme = 'YYYY.NNNN — year the work first entered the repository, then a running number across the whole library';
writeFileSync(ACC_FILE, JSON.stringify({ note: ACC.note, scheme: ACC.scheme, next: ACC.next, records: Object.fromEntries(Object.entries(ACC.records).sort((a, b) => a[1].acc.slice(5).localeCompare(b[1].acc.slice(5)))) }, null, 1) + '\n');
writeFileSync(join(LIB, 'fixity.json'), JSON.stringify({ note: 'sha256 of each record\'s source file at build time. `node library/_build/collate.mjs --check` compares disk against this list.', algorithm: 'sha256', generated: TODAY, source_commit: catalog.source_commit, files: sortObj(fixity) }, null, 1) + '\n');
writeFileSync(join(LIB, 'catalog.json'), JSON.stringify(catalog) + '\n');
writeFileSync(join(LIB, 'catalog.js'), `/* generated by library/_build/collate.mjs — do not edit; edit the sources and rebuild */\nwindow.LIBRARY=${JSON.stringify(catalog)};\n`);

/* llms.txt ------------------------------------------------------------------ */
{
  const L = [];
  L.push('# Library', '', `> One catalog over every collection in this repository: ${collections.map((c) => c.title).join(', ')}. ${records.length} records, each with a permanent accession number, a link to its plate, and its technique and atom terms.`, '');
  L.push('Read the data, not the page. Every record names its source file; every technique and atom term lists the records that use it.', '');
  L.push('## Data', '', '- [Catalog](catalog.json): all records, both authority files, the see-also table and the audit, in one JSON file.', '- [Accession register](accessions.json): record id to permanent number.', '- [Fixity](fixity.json): sha256 of every source file at build time.', '');
  L.push('## Collections', '');
  for (const c of collections) L.push(`- [${c.title}](${c.index || '.'}): ${c.n} records. ${c.note} Source of truth: \`${c.truth}\`.`);
  L.push('', '## Measured specs', '');
  for (const r of records.filter((x) => x.spec_href)) L.push(`- [${r.call} ${r.title}](${r.spec_href}): ${r.sub}`);
  L.push('', '## Optional', '', '- [Techniques by id](../techniques-templates/techniques.json): every Techniques & Templates read with its parameters.', '- [Atoms by id](../techniques-templates/atoms.json)', '');
  writeFileSync(join(LIB, 'llms.txt'), L.join('\n'));
}

/* static read baked into index.html ---------------------------------------- */
{
  const IDX = join(LIB, 'index.html');
  if (existsSync(IDX)) {
    const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const colTitle = new Map(collections.map((c) => [c.id, c.title]));
    const rows = records.map((r) => `<tr><td>${esc(r.acc)}</td><td>${esc(r.call)}</td><td>${r.href ? `<a href="${esc(r.href)}">${esc(r.title)}</a>` : esc(r.title)}</td><td>${esc(r.kind)}</td><td>${esc(colTitle.get(r.collection))}</td><td>${esc(r.status || '')}</td><td>${esc(r.sub)}</td></tr>`).join('\n');
    const block = `<!--LIB:STATIC built by library/_build/collate.mjs; library.js replaces this on load. Hand edits here are overwritten.-->
<section class="static">
<h1>Library</h1>
<p>${records.length} records across ${collections.length} collections, ${techniques.size} technique terms and ${atoms.size} atom terms. Built ${TODAY}${catalog.source_commit ? ` from ${catalog.source_commit}` : ''}. Data: <a href="catalog.json">catalog.json</a> · <a href="llms.txt">llms.txt</a>.</p>
<table><thead><tr><th>Accession</th><th>Call</th><th>Title</th><th>Kind</th><th>Collection</th><th>Status</th><th>Note</th></tr></thead><tbody>
${rows}
</tbody></table>
</section>
<!--/LIB:STATIC-->`;
    const html = read(IDX);
    const re = /<!--LIB:STATIC[\s\S]*?<!--\/LIB:STATIC-->/;
    if (re.test(html)) writeFileSync(IDX, html.replace(re, () => block));
    else problems.push('index.html has no LIB:STATIC block to bake into');
  }
}

/* report -------------------------------------------------------------------- */
console.log(`library · ${records.length} records · ${collections.length} collections · ${techniques.size} techniques · ${atoms.size} atoms${catalog.source_commit ? ' · ' + catalog.source_commit : ''}`);
for (const c of collections) console.log(`  ${c.code.padEnd(4)} ${String(c.n).padStart(4)}  ${c.title}`);
console.log(`  accessions: ${pending.length} new, ${withdrawn.length} withdrawn, next ${ACC.next}`);
if (THUMBS) console.log(`  access copies: ${thumbsMade} made${thumbsFailed ? `, ${thumbsFailed} failed (no sips or PIL on this machine; the page falls back to the masters)` : ''}`);
for (const a of audit.filter((x) => x.level !== 'note')) console.log(`  ${a.level.padEnd(6)} ${a.title}${a.records ? ` (${a.records.length})` : a.items ? ` (${a.items.length})` : a.links ? ` (${a.links.length})` : ''}`);
if (problems.length) { console.error(`\n✘ ${problems.length} problem(s):\n  · ${problems.join('\n  · ')}`); process.exit(1); }
