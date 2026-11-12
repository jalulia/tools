#!/usr/bin/env node
// library/_build/collate.mjs: builds the catalog.
//
// Reads each collection in place and writes library/catalog.json, catalog.js,
// accessions.json, fixity.json, llms.txt and the static table in index.html.
// It writes only inside library/.
//
//   node library/_build/collate.mjs            build
//   node library/_build/collate.mjs --thumbs   build, and remake access copies whose master changed
//   node library/_build/collate.mjs --check    compare disk against the last build; writes nothing; exit 1 on a difference
//
// No npm dependencies. --thumbs uses Pillow (thumb.py), or sips on macOS.
// A new collection is one row in collections.json; a new source shape is one reader below.

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

  /** A collection whose records are rows in works.json. The rows are added after the readers run. */
  'works'() { return []; },

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
/* works kept by hand -------------------------------------------------------
   works.json lists work that lives outside this repository: a page on another
   site, with its address. works-private.json, when present, adds work that is
   not public; it is never committed, and its records are numbered apart. */
for (const f of ['works.json', 'works-private.json']) {
  if (!existsSync(join(HERE, f))) continue;
  const W = readJson(join(HERE, f)), priv = f !== 'works.json';
  if (W.collections) { const at = CFG.collections.findIndex((c) => c.id === 'holdings'); CFG.collections.splice(at < 0 ? CFG.collections.length : at, 0, ...W.collections.map((c) => ({ reader: 'works', path: null, index: null, ...c, private: priv }))); for (const c of W.collections) colMeta[c.id] = {}; }
  W.records.forEach((w, i) => {
    const col = CFG.collections.find((c) => c.id === w.collection);
    if (!col) { problems.push(`${f}: no collection "${w.collection}" for ${w.id}`); return; }
    raw.push({
      id: w.id, slug: w.id.split(':').pop(), call: w.call || '', title: w.title, sub: w.sub || '', kind: w.kind, collection: w.collection,
      section: w.section || 'pages', section_title: w.section_title || 'Pages', status: w.status ?? null, lane: null, layer: null, style: null,
      href: w.href || null, thumbSrc: null, source: w.source || f, dirs: [], held_date: w.date || null, ext_fixity: w.fixity || null,
      plate: { spec: false, points: 0 }, reads: [], rel: w.rel || [], governed_by: [],
      provenance: { kind: 'original', title: w.source || null, author: null, date: w.date || null, license: null, url: null, rights: 'first-party' },
      location: w.location || null, access: w.access || 'public', private: priv, tags: w.tags || [], family: w.family || null, form: w.form || null, order: 1000 + i
    });
  });
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
  } else r.fixity = r.ext_fixity || null;
}

/* accession numbers ------------------------------------------------------- */
const ACC_FILE = join(LIB, 'accessions.json');
const ACC = existsSync(ACC_FILE) ? readJson(ACC_FILE) : { records: {}, next: 1 };
const before = JSON.stringify(ACC.records);
const colOrder = new Map(CFG.collections.map((c, i) => [c.id, i]));
// private work is numbered in its own file, so the public register never depends on it
const ACCP_FILE = join(LIB, 'accessions-private.json');
const ACCP = existsSync(ACCP_FILE) ? readJson(ACCP_FILE) : { records: {}, next: 1 };
for (const r of raw.filter((x) => x.private && !ACCP.records[x.id]).sort((a, b) => (a.dates.accessioned || '9999').localeCompare(b.dates.accessioned || '9999') || a.order - b.order)) {
  const date = r.dates.accessioned || TODAY;
  ACCP.records[r.id] = { acc: `${date.slice(0, 4)}.P${String(ACCP.next++).padStart(3, '0')}`, accessioned: date };
}
const pending = raw.filter((r) => !r.private && !ACC.records[r.id])
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
for (const r of raw) { const a = r.private ? ACCP.records[r.id] : ACC.records[r.id]; r.acc = a.acc; r.dates.accessioned = a.accessioned; }
raw.sort((a, b) => a.acc.slice(5).localeCompare(b.acc.slice(5)));
const byId = new Map(raw.map((r) => [r.id, r]));

/* pictures ------------------------------------------------------------------
   thumbs/<acc>.jpg is an access copy, 480 px on its long edge. The master stays
   with its record and serves as the larger size. A snapshot has no master, so
   snap.mjs also writes thumbs/<acc>-960.jpg. thumbs/index.json holds each
   copy's size, the hash of its master and a signature for grouping. */
const THUMB_DIR = join(LIB, 'thumbs');
const PIC_FILE = join(THUMB_DIR, 'index.json');
const PICS = existsSync(PIC_FILE) ? readJson(PIC_FILE).pictures : {};
function makeCopies(jobs) {
  try {
    const out = execFileSync('python3', [join(HERE, 'thumb.py')], { input: JSON.stringify(jobs), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] });
    return JSON.parse(out);
  } catch { /* no Pillow here */ }
  if (process.platform !== 'darwin') return null;
  const dim = (f) => { const o = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', f], { encoding: 'utf8' }); return [Number(/pixelWidth: (\d+)/.exec(o)[1]), Number(/pixelHeight: (\d+)/.exec(o)[1])]; };
  const sips = (src, dst, edge) => execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '90', '-Z', String(edge), src, '--out', dst], { stdio: 'ignore' });
  const res = {};
  for (const j of jobs) {
    try {
      sips(j.src, `${j.dst}.jpg`, 480);
      const [w, h] = dim(`${j.dst}.jpg`), [mw, mh] = dim(j.src);
      res[j.key] = { w, h, mw, mh };
    } catch (e) { res[j.key] = { error: String(e.message || e) }; }
  }
  return res;
}
const masterSha = new Map();
const jobs = [];
for (const r of raw) {
  if (!r.thumbSrc) continue;
  const sha = sha256(readFileSync(join(ROOT, r.thumbSrc))).slice(0, 16);
  masterSha.set(r.id, sha);
  const have = PICS[r.acc];
  if (THUMBS && !CHECK && (!have || have.from !== 'copy' || have.master !== sha || !existsSync(join(THUMB_DIR, `${r.acc}.jpg`)))) jobs.push({ key: r.acc, src: join(ROOT, r.thumbSrc), dst: join(THUMB_DIR, r.acc), sha });
}
let thumbsMade = 0, thumbsFailed = 0;
if (jobs.length) {
  mkdirSync(THUMB_DIR, { recursive: true });
  const res = makeCopies(jobs) || {};
  for (const j of jobs) {
    const p = res[j.key];
    if (!p || p.error) { thumbsFailed++; console.error(`  access copy failed: ${j.src.slice(ROOT.length + 1)}${p && p.error ? ` (${p.error})` : ' (no Pillow or sips here; the page loads the master)'}`); continue; }
    PICS[j.key] = { from: 'copy', master: j.sha, w: p.w, h: p.h, mw: p.mw, mh: p.mh };
    if (p.sig) PICS[j.key].sig = p.sig;
    thumbsMade++;
  }
}
const stalePics = [];
for (const r of raw) {
  const p = PICS[r.acc], onDisk = existsSync(join(THUMB_DIR, `${r.acc}.jpg`));
  r.thumb = null; r.thumb_kind = null; r.pic = null;
  if (r.thumbSrc) {
    r.thumb_master = `../${r.thumbSrc}`; r.thumb_kind = 'copy';
    if (p && p.from === 'copy' && onDisk) { r.thumb = `thumbs/${r.acc}.jpg`; r.pic = p; if (p.master !== masterSha.get(r.id)) stalePics.push(r.id); }
    else r.thumb = r.thumb_master;   // no access copy yet: the page loads the master
  } else if (p && p.from === 'snapshot' && onDisk) { r.thumb = `thumbs/${r.acc}.jpg`; r.thumb_kind = 'snapshot'; r.pic = p; }
  // no_frame: a plain field, or a picture already drawn on another work, is listed, not framed
  const nf = (CFG.no_frame || {})[r.id];
  if (nf) { r.thumb = null; r.thumb_kind = null; r.pic = null; delete r.thumb_master; }
  if (!r.thumb) {
    const cfg = nf || (CFG.no_snapshot || {})[r.id];
    r.no_pic = r.access === 'staged' ? { label: 'staged', why: 'Not on the site yet.' }
      : r.access === 'local' ? { label: 'local', why: 'The files are on the working machine.' }
      : cfg ? { label: cfg.label, why: cfg.why }
      : r.lane === 'audio' ? { label: 'sound', why: 'Sound entry.' }
      : { label: 'no picture', why: '' };
  }
}
/* families -----------------------------------------------------------------
   The technique registry in Techniques & Templates gives each technique a
   family. A record takes the family most of its techniques belong to; a row in
   works.json may name one directly. */
const REG_FILE = join(ROOT, 'techniques-templates', 'registry.json');
const REG = existsSync(REG_FILE) ? readJson(REG_FILE) : null;
const famOf = new Map();
if (REG) for (const e of REG.entries) for (const a of e.aliases || []) famOf.set(a, e.family);
// the registry also names the plates that use each technique, by call number or title
const usedBy = new Map();
if (REG) for (const e of REG.entries) for (const u of new Set([...(e.used_in || []), ...(e.proposed_uses || [])])) { if (!usedBy.has(u)) usedBy.set(u, []); usedBy.get(u).push(e.family); }
for (const r of raw) {
  if (r.family) continue;
  const ids = [...(r.kind === 'technique' ? [`${r.collection === 'holdings' ? 'hld' : 'enc'}:${r.slug}`] : []), ...r.rel.filter((x) => x.type === 'instance-of').map((x) => x.to), ...r.reads.map((x) => `${x.scheme}:${x.id}`)];
  const n = {};
  for (const id of ids) { const f = famOf.get(id); if (f) n[f] = (n[f] || 0) + 1; }
  for (const f of [...(r.call && r.collection !== 'holdings' ? usedBy.get(r.call) || [] : []), ...(usedBy.get(r.title) || [])]) n[f] = (n[f] || 0) + 1;
  const top = Object.entries(n).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  r.family = top ? top[0] : null;
}

/* works ---------------------------------------------------------------------
   A work is drawn once. editions.json names the other records that are the same
   work (versions) and the records lifted out of a work (parts). A record that
   is a version or a part carries `work` and `role`; the work lists them. */
for (const f of ['editions.json', 'editions-private.json']) {
  if (!existsSync(join(HERE, f))) continue;
  const E = readJson(join(HERE, f));
  const top = (id) => { let r = byId.get(id); while (r && r.work) r = byId.get(r.work); return r; };
  for (const v of E.versions || []) {
    const w = top(v.work); if (!w) continue;
    for (const id of v.of) { const m = byId.get(id); if (m && m !== w && !m.work) { m.work = w.id; m.role = 'version'; } }
  }
  for (const p of E.parts || []) {
    const members = raw.filter((r) => !r.work && r.role !== 'version' && r.provenance && r.provenance.title && r.provenance.title.startsWith(p.source));
    const w = p.work ? top(p.work) : null;
    // with no record for the source, the parts carry its name and no picture of their own
    for (const m of members) if (m !== w) { m.role = 'part'; if (w) { m.work = w.id; delete m.part_of; } else if (p.label) m.part_of = p.label; }
  }
}
for (const r of raw) {
  if (!r.work) continue;
  const w = byId.get(r.work);
  (w[r.role === 'part' ? 'parts' : 'versions'] ||= []).push(r.id);
}
// a work with no picture of its own shows its newest pictured version
for (const w of raw) {
  if (w.work || w.thumb || !w.versions) continue;
  const v = w.versions.map((id) => byId.get(id)).filter((x) => x.thumb).sort((a, b) => (b.dates.modified || '').localeCompare(a.dates.modified || ''))[0];
  if (v) { w.thumb = v.thumb; w.thumb_kind = v.thumb_kind; w.pic = v.pic; w.pic_acc = v.acc; w.thumb_master = v.thumb_master; w.thumb_from = v.id; delete w.no_pic; }
}
// Records that show the same picture. With a signature: same shape, mean difference
// at most 0.4 and no cell further than 6 of 255. Two snapshots of one moving stage
// differ a little more, so a pair of snapshots is allowed 3 and 24.
// Without a signature: the same master file.
{
  const sig = (r) => (r.pic && r.pic.sig ? Buffer.from(r.pic.sig, 'base64') : null);
  const ar = (r) => (r.pic ? r.pic.w / r.pic.h : 0);
  const same = (a, b) => {
    const x = sig(a), y = sig(b);
    if (!x || !y) return !!masterSha.get(a.id) && masterSha.get(a.id) === masterSha.get(b.id);
    if (Math.abs(ar(a) - ar(b)) / ar(a) > 0.02) return false;
    const snaps = a.thumb_kind === 'snapshot' && b.thumb_kind === 'snapshot';
    const far = snaps ? 24 : 6, mean = snaps ? 3 : 0.4;
    let sum = 0;
    for (let i = 0; i < x.length; i++) { const d = Math.abs(x[i] - y[i]); if (d > far) return false; sum += d; }
    return sum / x.length <= mean;
  };
  const leaders = [];
  for (const r of raw) {
    if (!r.thumb || r.role) continue;
    const l = leaders.find((x) => same(x, r));
    if (l) { r.pic_group = l.acc; l.pic_group = l.acc; } else leaders.push(r);
  }
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
const tag = (r) => `${r.acc} ${r.call ? r.call + ' ' : ''}${r.title}`;
{
  /* to rule */
  const uns = raw.filter((r) => r.status === 'unsorted');
  if (uns.length) finding('unsorted', 'ruling', 'Unsorted imports', 'Imported from the inventory with a proposed grade. Each needs a section and a status.', { records: uns.map((r) => r.id) });
  const prop = raw.filter((r) => r.status === 'proposed' && r.access === 'public');
  if (prop.length) finding('proposed', 'ruling', 'Proposed entries on the live site', 'Written by the tool. A ruling in the manifest makes an entry canonical.', { records: prop.map((r) => r.id) });
  const staged = raw.filter((r) => r.access === 'staged');
  if (staged.length) finding('staged', 'ruling', 'Staged work', 'Patches and proposals that are not on the deployed site.', { records: staged.map((r) => r.id) });
  const xp = see.filter((l) => l.by === 'proposed');
  if (xp.length) finding('see-also-proposed', 'ruling', 'See-also links to confirm', 'Written by the tool in library/_build/crosswalk.json. Set `by` to a name to confirm a link, or delete its row.', { links: xp.map((l) => `${l.a} · ${l.relation} · ${l.b}`) });
  // one work in two places: links marked also-filed-as, and records that share a title
  const twice = new Map();
  const pair = (a, b, why) => { const k = [a.id, b.id].sort().join('|'); if (!twice.has(k)) twice.set(k, `${tag(a)}  ↔  ${tag(b)} (${why})`); };
  for (const l of see) if (l.relation === 'also-filed-as') pair(byId.get(l.a.replace(/^record:/, '')), byId.get(l.b.replace(/^record:/, '')), 'see-also');
  const titles = new Map();
  for (const r of raw) { const k = r.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); (titles.get(k) || titles.set(k, []).get(k)).push(r); }
  const linked = (a, b) => a.rel.some((x) => x.to === b.id) || b.rel.some((x) => x.to === a.id);   // a technique and its instance may share a title
  for (const v of titles.values()) for (let i = 1; i < v.length; i++) if (!linked(v[0], v[i])) pair(v[0], v[i], 'same title');
  if (twice.size) finding('filed-twice', 'ruling', 'Possible double filings', 'Pairs that may be one work filed in two places.', { n: twice.size, items: [...twice.values()], records: [...new Set([...twice.keys()].flatMap((k) => k.split('|')))] });

  /* gaps */
  const local = raw.filter((r) => r.access === 'local');
  if (local.length) finding('local', 'gap', 'Local only', 'Listed from build notes. The files are not in the repository.', { records: local.map((r) => r.id) });
  const noStatus = pub.filter((r) => !r.status && r.kind !== 'instrument');
  if (noStatus.length) finding('no-status', 'gap', 'No status', 'Their collections have no status field.', { records: noStatus.map((r) => r.id) });
  const noThumb = pub.filter((r) => !r.thumb);
  if (noThumb.length) finding('no-surrogate', 'gap', 'No picture', 'Public records with no thumbnail and no snapshot.', { records: noThumb.map((r) => r.id) });
  const snaps = pub.filter((r) => r.thumb_kind === 'snapshot');
  if (snaps.length) finding('snapshot', 'gap', 'Library snapshots', 'The collection has no thumbnail for these. The picture is a snapshot of the live plate, made by library/_build/snap.mjs.', { records: snaps.map((r) => r.id) });
  const groups = new Map();
  for (const r of raw) if (r.pic_group) (groups.get(r.pic_group) || groups.set(r.pic_group, []).get(r.pic_group)).push(r);
  if (groups.size) finding('shared-picture', 'gap', 'Shared pictures', 'Records that show the same picture as another record. Most are a screenshot of the page an import was lifted from.', {
    items: [...groups.values()].map((v) => `${v.length} records: ${v.map((r) => r.call || r.acc).join(', ')}`), records: [...groups.values()].flat().map((r) => r.id), n: [...groups.values()].reduce((n, v) => n + v.length - 1, 0) });
  const fromId = raw.filter((r) => r.title_from_id);
  if (fromId.length) finding('title-from-id', 'gap', 'Titles written from the slug', 'Holdings titled from their id. The real title is in a document outside the repository.', { records: fromId.map((r) => r.id) });
  const produced = new Set(raw.flatMap((r) => r.rel.filter((x) => x.type === 'produces' && r.access === 'public').map((x) => x.to)));
  const orphans = raw.filter((r) => r.kind === 'atom' && !produced.has(r.id));
  if (orphans.length) finding('orphan-atom', 'gap', 'Atoms no technique produces', 'Substrates, engines and buses are inputs. A process atom can be closed by a technique.', { records: orphans.map((r) => r.id) });
  const ttUses = [...techniques.values()].filter((t) => t.scheme === 'tt').flatMap((t) => t.uses);
  const lift = ttUses.filter((u) => u.module).length;
  if (ttUses.length) finding('module-coverage', 'gap', 'Reads with a module to lift', `${lift} of ${ttUses.length} technique reads in Techniques & Templates name a module file.`, { n: lift, of: ttUses.length, records: [...new Set(ttUses.filter((u) => u.module).map((u) => u.rec))] });

  /* drift */
  if (stalePics.length) finding('stale-pictures', 'drift', 'Access copies older than their master', 'Run node library/_build/collate.mjs --thumbs.', { records: stalePics });
  const tIds = new Map(); for (const t of techniques.values()) (tIds.get(t.id) || tIds.set(t.id, []).get(t.id)).push(t.key);
  const aIds = new Map(); for (const a of atoms.values()) (aIds.get(a.id) || aIds.set(a.id, []).get(a.id)).push(a.key);
  const clash = [];
  for (const [id, keys] of tIds) {
    const asAtom = aIds.get(id) || [];
    if (asAtom.length) clash.push(`${id}: technique in ${keys.map((k) => k.split(':')[0]).join(', ')} · atom in ${asAtom.map((k) => k.split(':')[0]).join(', ')}`);
  }
  if (clash.length) finding('vocabulary-collision', 'drift', 'Ids used as both technique and atom', 'The same id names a technique in one vocabulary and an atom in another.', { items: clash });
  const calls = new Map();
  for (const r of raw) { if (!r.call) continue; const k = r.call.replace(/[^A-Za-z0-9]/g, '').toUpperCase(); (calls.get(k) || calls.set(k, []).get(k)).push(r); }
  const dup = [...calls.values()].filter((v) => new Set(v.map((r) => r.collection)).size > 1);
  if (dup.length) finding('call-collision', 'drift', 'Call numbers shared by two collections', 'A call number is local to its collection. The accession number is unique.', { items: dup.map((v) => v.map((r) => `${r.call} ${r.title} (${r.collection})`).join('  ↔  ')), records: dup.flat().map((r) => r.id) });
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
    if (stated.length) finding('stated-count', 'drift', 'Hand-typed counts that are out of date', 'Counts typed into gallery/index.html that differ from the source.', { items: stated });
  }
  // the repository's copy is US English; list the British spellings the catalog displays
  const BRIT = /\b(colour\w*|grey\w*|centre[sd]?|catalogue[sd]?|fibres?|metres?|analyse[drs]?|analysers|behaviour\w*|favour\w*|flavour\w*|honour\w*|labour\w*|neighbour\w*|travell(?:ed|ing|ers?)|modell(?:ed|ing)|labell(?:ed|ing)|cancell(?:ed|ing)|artefacts?|programmes?|licences?|defences?|aluminium|moulds?|judgements?|(?:organ|real|recogn|optim|visual|normal|quant|random|memo|initial|synchron|minim|maxim|character|general|special|standard|summar|categor|digit|raster|parameter|vector|linear|stabil|custom|priorit|local)is(?:e[ds]?|ing|ations?))\b/gi;
  const brit = [];
  for (const r of raw) {
    const hits = [...new Set((`${r.title} ${r.sub}`.match(BRIT) || []).map((w) => w.toLowerCase()))];
    if (hits.length) brit.push({ r, hits });
  }
  if (brit.length) finding('spelling', 'drift', 'British spellings in source text', 'In titles and descriptions the catalog reads from the collections.', { items: brit.map((x) => `${tag(x.r)}: ${x.hits.join(', ')}`), records: brit.map((x) => x.r.id) });
  if (problems.length) finding('problem', 'drift', 'Unresolved references', 'Ids that point at nothing.', { items: [...problems] });

  /* notes */
  const wh = Object.values(colMeta).reduce((n, m) => n + (m.withheld || 0), 0);
  if (wh) finding('withheld', 'note', 'Withheld by .private', 'Folders with a .private marker are skipped and not named.', { n: wh });
  if (withdrawn.length) finding('withdrawn', 'note', 'Withdrawn accession numbers', 'The record is gone from its collection. Its number is not reused.', { items: withdrawn.map((w) => `${w.acc} ${w.id} (${w.withdrawn})`) });
  if (CFG.superseded.length) finding('superseded', 'note', 'Folders folded into another collection', 'Not read as collections of their own.', { items: CFG.superseded.map((s) => `${s.path}/ into ${s.folded_into}. ${s.note}`) });
}

/* shape the public catalog -------------------------------------------------- */
const out = (r) => {
  const o = {
    acc: r.acc, id: r.id, call: r.call, title: r.title, sub: r.sub, kind: r.kind,
    collection: r.collection, section: r.section, section_title: r.section_title,
    status: r.status, lane: r.lane, layer: r.layer, style: r.style, access: r.access,
    href: r.href ? (/^https?:/.test(r.href) ? r.href : `../${r.href}`) : null, thumb: r.thumb, source: r.source,
    dates: r.dates, fixity: r.fixity ? r.fixity.slice(0, 16) : null,
    plate: r.plate, techniques: [...new Set([...(r.kind === 'technique' ? [`${r.collection === 'holdings' ? 'hld' : 'enc'}:${r.slug}`] : []), ...r.rel.filter((x) => x.type === 'instance-of').map((x) => x.to), ...r.reads.map((x) => `${x.scheme}:${x.id}`)])],
    atoms: [...new Set([...r.rel.filter((x) => x.type === 'uses' || x.type === 'produces').map((x) => x.to), ...r.reads.flatMap((x) => (x.atoms || []).map((a) => `${x.scheme}:${a}`))])],
    rel: r.rel, provenance: r.provenance
  };
  for (const k of ['spec_href', 'thumb_master']) if (r[k]) o[k] = k === 'spec_href' ? `../${r[k]}` : r[k];
  for (const k of ['governed_by', 'tags']) if (r[k] && r[k].length) o[k] = r[k];
  for (const k of ['swatches', 'ruling', 'proposed_grade', 'atom_kind', 'location', 'target', 'pic_group', 'no_pic', 'work', 'role', 'part_of', 'versions', 'parts', 'thumb_from', 'family', 'form']) if (r[k]) o[k] = r[k];
  if (r.thumb_kind === 'snapshot') o.thumb_kind = 'snapshot';
  if (r.private) o.private = true;
  if (r.pic) {
    o.thumb_w = r.pic.w; o.thumb_h = r.pic.h;
    if (r.pic.w2) { o.thumb_2x = `thumbs/${r.pic_acc || r.acc}-960.jpg`; o.thumb_2x_w = r.pic.w2; }   // a snapshot's larger copy
    else if (r.pic.mw > r.pic.w) { o.thumb_2x = r.thumb_master; o.thumb_2x_w = r.pic.mw; } // the master is the larger size
  }
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
    records: records.length, works: records.filter((r) => !r.role).length,
    public: records.filter((r) => r.access === 'public').length,
    collections: collections.length,
    techniques: techniques.size, atoms: atoms.size,
    by_kind: tally(records, 'kind'), by_collection: tally(records, 'collection'), by_status: tally(records, 'status'), by_access: tally(records, 'access')
  },
  vocabulary: {
    kind: {
      technique: 'A method, with the pieces that use it.',
      atom: 'A reusable part with parameters: substrate, process, texture, color, engine, field, mark, voice, space or bus.',
      exploration: 'A piece that runs techniques on a subject.',
      coupling: 'An exploration with one driver and named consequences.',
      study: 'A reference measured and rebuilt in code, with a spec.',
      template: 'A layout made for reuse with new content.',
      instrument: 'A working tool.',
      document: 'A written piece with figures: a design document, a report, a dossier.',
      plate: 'One figure isolated from a page.'
    },
    status: { ...(colMeta.encyclopedia?.status_vocabulary || {}), '': 'The collection records no status.' },
    family: Object.fromEntries((REG ? REG.families : []).map((f) => [f.id, f.blurb])),
    access: { public: 'On a public site.', staged: 'Built or proposed, not yet on the site.', local: 'On the working machine only.', private: 'A private link or file.' },
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
  for (const id of stalePics) drift.push(`thumbnail changed since its access copy was made: ${byId.get(id).thumbSrc}`);
  for (const r of raw) if (r.thumbSrc && !r.pic && !(CFG.no_frame || {})[r.id]) drift.push(`no access copy yet: ${r.thumbSrc}`);
  for (const p of problems) drift.push(p);
  console.log(drift.length ? `✘ ${drift.length} difference(s)\n  · ${drift.join('\n  · ')}` : `✔ ${records.length} records, ${Object.keys(fixity).length} source files, nothing changed`);
  process.exit(drift.length ? 1 : 0);
}

/* write -------------------------------------------------------------------- */
const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
ACC.note = 'Record id to accession number. A number is given once, in order of arrival, and is not changed or reused. Written by library/_build/collate.mjs; do not edit by hand.';
ACC.scheme = 'YYYY.NNNN: the year the work entered the repository, then a running number across the library';
writeFileSync(ACC_FILE, JSON.stringify({ note: ACC.note, scheme: ACC.scheme, next: ACC.next, records: Object.fromEntries(Object.entries(ACC.records).sort((a, b) => a[1].acc.slice(5).localeCompare(b[1].acc.slice(5)))) }, null, 1) + '\n');
if (raw.some((r) => r.private)) writeFileSync(ACCP_FILE, JSON.stringify({ note: 'Accession numbers for private work. Not committed.', next: ACCP.next, records: ACCP.records }, null, 1) + '\n');
writeFileSync(join(LIB, 'fixity.json'), JSON.stringify({ note: 'sha256 of each record\'s source file at build time. `node library/_build/collate.mjs --check` compares disk against it.', algorithm: 'sha256', generated: TODAY, source_commit: catalog.source_commit, files: sortObj(fixity) }, null, 1) + '\n');
{
  mkdirSync(THUMB_DIR, { recursive: true });
  writeFileSync(PIC_FILE, JSON.stringify({ note: 'One entry per access copy in this folder: its size in pixels, where it came from (a copy of the collection\'s thumbnail, or a snapshot by snap.mjs), the sha256 of the master it was made from, and a signature for grouping identical pictures. Written by collate.mjs and snap.mjs.', pictures: sortObj(PICS) }, null, 1) + '\n');
}
writeFileSync(join(LIB, 'catalog.json'), JSON.stringify(catalog) + '\n');
writeFileSync(join(LIB, 'catalog.js'), `/* generated by library/_build/collate.mjs. Do not edit: change the sources and rebuild. */\nwindow.LIBRARY=${JSON.stringify(catalog)};\n`);

/* llms.txt ------------------------------------------------------------------ */
{
  const L = [];
  L.push('# Library', '', `> A catalog of ${records.length} works in ${collections.length} collections in this repository. Each record has a permanent accession number, a link to its plate, its source file, and its technique and atom terms.`, '');
  L.push('## Data', '', '- [Catalog](catalog.json): records, technique and atom terms with the records that use them, see-also links, audit.', '- [Accession register](accessions.json): record id to accession number.', '- [Fixity](fixity.json): sha256 of each source file at build time.', '');
  L.push('## Collections', '');
  for (const c of collections) L.push(`- [${c.title}](${c.index || '.'}): ${c.n} records. ${c.note} Source: \`${c.truth}\`.`);
  L.push('', '## Specs', '');
  for (const r of records.filter((x) => x.spec_href)) L.push(`- [${r.call} ${r.title}](${r.spec_href}): ${r.sub}`);
  L.push('', '## Optional', '', '- [Techniques by id](../techniques-templates/techniques.json): each Techniques & Templates read with its parameters.', '- [Atoms by id](../techniques-templates/atoms.json)', '');
  writeFileSync(join(LIB, 'llms.txt'), L.join('\n'));
}

/* static read baked into index.html ---------------------------------------- */
{
  const IDX = join(LIB, 'index.html');
  if (existsSync(IDX)) {
    const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const colTitle = new Map(collections.map((c) => [c.id, c.title]));
    const rows = records.map((r) => `<tr><td>${esc(r.acc)}</td><td>${esc(r.call)}</td><td>${r.href ? `<a href="${esc(r.href)}">${esc(r.title)}</a>` : esc(r.title)}</td><td>${esc(r.kind)}</td><td>${esc(colTitle.get(r.collection))}</td><td>${esc(r.status || '')}</td><td>${esc(r.sub)}</td></tr>`).join('\n');
    const block = `<!--LIB:STATIC written by library/_build/collate.mjs and replaced by library.js on load. Edits here are overwritten.-->
<section class="static">
<h1>Library</h1>
<p>${records.length} records in ${collections.length} collections. ${techniques.size} technique terms, ${atoms.size} atom terms. Built ${TODAY}${catalog.source_commit ? ` from ${catalog.source_commit}` : ''}. <a href="catalog.json">catalog.json</a> · <a href="llms.txt">llms.txt</a></p>
<table><thead><tr><th>Accession</th><th>Call</th><th>Title</th><th>Kind</th><th>Collection</th><th>Status</th><th>Description</th></tr></thead><tbody>
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
if (THUMBS) console.log(`  access copies: ${thumbsMade} made${thumbsFailed ? `, ${thumbsFailed} failed` : ''}`);
for (const a of audit.filter((x) => x.level !== 'note')) console.log(`  ${a.level.padEnd(6)} ${a.title}${a.records ? ` (${a.records.length})` : a.items ? ` (${a.items.length})` : a.links ? ` (${a.links.length})` : ''}`);
if (problems.length) { console.error(`\n✘ ${problems.length} problem(s):\n  · ${problems.join('\n  · ')}`); process.exit(1); }
