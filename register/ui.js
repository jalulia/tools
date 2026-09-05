/* Register · ui — chrome, rails, inspector, and the loop back to Claude.
 *
 * The shape of the thing: one document, one active layer, one selection. Every mutation
 * goes through edit()/editBegin() so undo, the dirty flag and autosave all stay honest,
 * and every save appends a revision so a Claude pass can be diffed rather than trusted.
 */

import * as C from './core.js';
import * as S3 from './sync.js';
import { View } from './view.js';
import * as PV from './preview.js';

const $ = s => document.querySelector(s);
const el = (t, cls, txt) => { const e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ------------------------------------------------------------------ state */

const S = {
  doc: C.newDoc(), img: null, plates: null, showPlates: false, showImage: true, showGrid: false,
  layer: 'structure', sel: null, hover: null, tool: 'v', draft: null,
  hidden: new Set(), locked: new Set(),
  cloud: false, rev: 0, dirty: false, saving: false, autoPreview: false,
  review: null, revs: null,
  history: [], hi: -1,
};
let view = null, saveT = null, prevT = null;

/* --------------------------------------------------------------- history */

function snapshot() { return JSON.stringify({ p: S.doc.preset, e: S.doc.editor, t: S.doc.title, s: S.doc.slug }); }
function restore(str) { const o = JSON.parse(str); S.doc.preset = o.p; S.doc.editor = o.e; S.doc.title = o.t; S.doc.slug = o.s; }
function editBegin() {
  S.history.length = Math.min(S.history.length, S.hi + 1);
  S.history.push(snapshot());
  if (S.history.length > 200) S.history.shift();
  S.hi = S.history.length - 1;
}
function edit(label) {
  S.dirty = true; markSave(); renderInspector(); renderLayers(); view.draw();
  if (S.autoPreview) schedulePreview();
  scheduleSave();
}
function undo() {
  if (S.hi < 0) return;
  if (S.hi === S.history.length - 1) { S.history.push(snapshot()); }
  const str = S.history[S.hi--]; restore(str);
  S.sel = null; afterDocChange(); toast('undo');
}
function redo() {
  if (S.hi >= S.history.length - 2) return;
  const str = S.history[++S.hi + 1]; restore(str);
  S.sel = null; afterDocChange(); toast('redo');
}
function afterDocChange() {
  $('#title').value = S.doc.title || '';
  renderLayers(); renderParams(); renderInspector(); renderViewOpts();
  S.dirty = true; markSave(); view.draw();
}

/* ----------------------------------------------------------------- toast */
let toastT = null;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }

/* ------------------------------------------------------------------ gate */

async function gate() {
  if (new URLSearchParams(location.search).get('local') === '1') { S3.goLocal(); S.cloud = false; return; }
  const k = S3.getKey();
  if (k && await S3.verifyKey(k)) { S.cloud = true; return; }
  return new Promise(res => {
    const g = $('#gate'); g.hidden = false;
    const go = async () => {
      const v = $('#gatekey').value.trim();
      $('#gateerr').textContent = 'checking…';
      if (await S3.verifyKey(v)) { S3.setKey(v); S.cloud = true; g.hidden = true; res(); }
      else $('#gateerr').textContent = 'that key was refused.';
    };
    $('#gateok').onclick = go;
    $('#gatekey').onkeydown = e => { if (e.key === 'Enter') go(); };
    $('#gatelocal').onclick = () => { S3.goLocal(); S.cloud = false; g.hidden = true; res(); };
  });
}

/* ------------------------------------------------------------- documents */

function rowToDoc(r) {
  const d = C.newDoc(r.profile || 'h-figures');
  d.id = r.id; d.title = r.title; d.slug = r.slug; d.profile = r.profile || 'h-figures';
  const body = r.doc || {};
  d.editor = Object.assign(d.editor, body.editor || {});
  d.preset = body.preset || d.preset;
  d.image = r.image_url ? { url: r.image_url, w: r.image_w, h: r.image_h } : (body.image || null);
  return d;
}
function docToRow(d) {
  return { id: d.id, title: d.title, slug: d.slug, profile: d.profile,
    image_url: d.image ? d.image.url : null, image_w: d.image ? d.image.w : null, image_h: d.image ? d.image.h : null,
    doc: { editor: d.editor, preset: d.preset, image: d.image } };
}

async function loadDoc(id) {
  if (!S.cloud) { const l = S3.localLoad(id); if (l) { S.doc = l; S.rev = 0; } await afterLoad(); return; }
  const row = await S3.getDoc(id);
  if (!row) { toast('no document ' + id); return; }
  S.doc = rowToDoc(row); S.rev = row.rev; S.dirty = false;
  S.rowState = { state: row.state, ask: row.ask, reply: row.reply, reply_at: row.reply_at };
  history.replaceState(null, '', '?d=' + encodeURIComponent(id));
  await afterLoad();
  if (row.state === 'answered') openReview();
}
async function afterLoad() {
  S.history = []; S.hi = -1; S.sel = null; S.plates = null; S.showPlates = false;
  const P = C.profileOf(S.doc);
  if (!P.layers.find(l => l.id === S.layer)) S.layer = P.layers[0].id;
  await loadImage();
  $('#docid').textContent = S.doc.id || 'local';
  afterDocChange(); S.dirty = false; markSave();
  view.needFit = true; view.fit();
}
async function loadImage() {
  S.img = null;
  if (!S.doc.image || !S.doc.image.url) return;
  await new Promise(res => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => { S.img = im;
      if (!S.doc.image.w) { S.doc.image.w = im.naturalWidth; S.doc.image.h = im.naturalHeight; }
      res(); };
    im.onerror = () => { toast('source failed to load'); res(); };
    im.src = S.doc.image.url;
  });
}

function markSave() {
  const e = $('#savestate');
  if (!S.cloud) { e.textContent = 'local'; e.classList.toggle('dirty', S.dirty); return; }
  e.textContent = S.saving ? 'saving…' : (S.dirty ? 'unsaved' : 'saved · r' + S.rev);
  e.classList.toggle('dirty', S.dirty && !S.saving);
}
function scheduleSave() { clearTimeout(saveT); saveT = setTimeout(() => save(false), 1400); }

async function save(explicit) {
  if (!S.cloud) { S.doc._at = new Date().toISOString(); S3.localSave(S.doc); S.dirty = false; markSave(); if (explicit) toast('saved locally'); return; }
  if (S.saving) return;
  if (!S.doc.id) {
    S.doc.id = C.uid(); S.saving = true; markSave();
    try {
      const row = await S3.createDoc(docToRow(S.doc));
      S.rev = row.rev; S.dirty = false;
      await S3.pushRev(S.doc.id, row.rev, { editor: S.doc.editor, preset: S.doc.preset }, 'julia', 'created');
      history.replaceState(null, '', '?d=' + encodeURIComponent(S.doc.id));
      $('#docid').textContent = S.doc.id;
      toast('document created · ' + S.doc.id);
    } catch (e) { S.doc.id = null; toast('create failed: ' + e.message); }
    S.saving = false; markSave(); return;
  }
  S.saving = true; markSave();
  try {
    const r = await S3.saveDoc(S.doc.id, docToRow(S.doc), S.rev);
    if (r.ok) {
      S.rev = r.row.rev; S.dirty = false;
      await S3.pushRev(S.doc.id, S.rev, { editor: S.doc.editor, preset: S.doc.preset }, 'julia', null);
      if (explicit) toast('saved · r' + S.rev);
    } else {
      toast('another session saved r' + (r.current ? r.current.rev : '?') + ' — reload or force');
      S.conflict = r.current;
      renderInspector();
    }
  } catch (e) { toast('save failed: ' + e.message); }
  S.saving = false; markSave();
}

/* ------------------------------------------------------------------ rails */

const TOOLS = [
  { k: 'v', label: 'Select', hint: 'v' }, { k: 'p', label: 'Pen', hint: 'p' },
  { k: 'r', label: 'Rect', hint: 'r' }, { k: 'c', label: 'Circle', hint: 'c' },
  { k: 'l', label: 'Ellipse', hint: 'l' }, { k: 't', label: 'Point', hint: 't' },
];
function renderTools() {
  const box = $('#tools'); box.innerHTML = '';
  for (const t of TOOLS) {
    const b = el('button', S.tool === t.k ? 'on' : '');
    b.innerHTML = esc(t.label) + '<span>' + esc(t.hint) + '</span>';
    b.onclick = () => setTool(t.k);
    box.appendChild(b);
  }
}
function setTool(k) {
  if (S.draft) view.cancelDraft();
  S.tool = k;
  const L = C.layerSpec(S.doc, S.layer);
  if (k === 't' && L && L.geom !== 'point') {
    const pt = C.profileOf(S.doc).layers.find(l => l.geom === 'point');
    if (pt) { S.layer = pt.id; toast('switched to ' + pt.label); }
  }
  if (k !== 'v' && k !== 't' && L && L.geom === 'point') {
    const g = C.profileOf(S.doc).layers.find(l => l.geom !== 'point');
    if (g) { S.layer = g.id; toast('switched to ' + g.label); }
  }
  renderTools(); renderLayers(); view.draw();
}

function renderLayers() {
  const box = $('#layers'); box.innerHTML = '';
  const P = C.profileOf(S.doc);
  let total = 0;
  for (const L of P.layers) {
    const list = C.items(S.doc, L.id); total += list.length;
    const row = el('div', 'lay' + (L.id === S.layer ? ' on' : ''));
    const sw = el('span', 'sw'); sw.style.background = L.color; row.appendChild(sw);
    row.appendChild(el('span', 'nm', L.label));
    row.appendChild(el('span', 'ct', String(list.length)));
    const eye = el('span', 'ic' + (S.hidden.has(L.id) ? '' : ' act'), S.hidden.has(L.id) ? '·' : '●');
    eye.title = 'show / hide';
    eye.onclick = ev => { ev.stopPropagation(); S.hidden.has(L.id) ? S.hidden.delete(L.id) : S.hidden.add(L.id); renderLayers(); view.draw(); };
    row.appendChild(eye);
    row.onclick = () => { S.layer = L.id; S.sel = null; renderLayers(); renderInspector(); view.draw(); };
    row.title = L.help || L.label;
    box.appendChild(row);
  }
  $('#laycount').textContent = total;
}

function fieldRow(label, node, hint) {
  const f = el('div', 'fld'); f.appendChild(el('label', null, label)); f.appendChild(node);
  if (hint) f.title = hint;
  return f;
}
function numInput(val, on, step) {
  const i = document.createElement('input');
  i.type = 'text'; i.value = val == null ? '' : String(val);
  i.onchange = () => { const v = i.value.trim(); on(v === '' ? undefined : (isNaN(+v) ? v : +v)); };
  return i;
}
function rawInput(val, on) {
  const i = document.createElement('input'); i.type = 'text';
  i.value = val === undefined ? '' : JSON.stringify(val);
  i.onchange = () => { const t = i.value.trim();
    if (t === '') return on(undefined);
    try { on(JSON.parse(t)); } catch (e) { toast('not valid JSON'); i.value = JSON.stringify(val); } };
  return i;
}
function boolInput(val, on) {
  const i = document.createElement('input'); i.type = 'checkbox'; i.checked = !!val;
  i.onchange = () => on(i.checked || undefined); return i;
}
function enumInput(val, opts, on) {
  const s = document.createElement('select');
  for (const o of ['', ...opts]) { const op = document.createElement('option'); op.value = o; op.textContent = o || '—'; s.appendChild(op); }
  s.value = val == null ? '' : val;
  s.onchange = () => on(s.value || undefined); return s;
}
function fieldFor(spec, get, set) {
  const v = get(spec.k);
  const on = nv => { editBegin(); if (nv === undefined) delete_(spec.k); else set(spec.k, nv); edit(); };
  const delete_ = k => set(k, undefined);
  if (spec.t === 'bool') return fieldRow(spec.k, boolInput(v, on), spec.help);
  if (spec.t === 'enum') return fieldRow(spec.k, enumInput(v, spec.opts, on), spec.help);
  if (spec.t === 'raw') return fieldRow(spec.k, rawInput(v, on), spec.help);
  return fieldRow(spec.k, numInput(v, on), spec.help);
}

function renderParams() {
  const box = $('#params'); box.innerHTML = '';
  const P = C.profileOf(S.doc), pre = S.doc.preset;
  const get = k => pre[k], set = (k, v) => { if (v === undefined) delete pre[k]; else pre[k] = v; };
  for (const f of P.params) {
    if (get(f.k) === undefined && !['scale', 'luma', 'key', 'bands', 'cross'].includes(f.k)) continue;
    box.appendChild(fieldFor(f, get, set));
  }
  for (const g of P.groups) {
    if (!pre[g.k] && g.k !== 'mask') continue;
    const h = el('div', 'fld'); h.innerHTML = `<label style="flex:1;color:var(--ink);font-weight:500">${esc(g.k)}</label>`;
    box.appendChild(h);
    const gv = pre[g.k] || (pre[g.k] = {});
    for (const f of g.fields) {
      if (gv[f.k] === undefined && !(g.k === 'mask' && f.k === 'type')) continue;
      box.appendChild(fieldFor(f, k => gv[k], (k, v) => { if (v === undefined) delete gv[k]; else gv[k] = v; }));
    }
    const add = el('div', 'fld');
    const sel = document.createElement('select');
    sel.appendChild(new Option('add field…', ''));
    for (const f of g.fields) if (gv[f.k] === undefined) sel.appendChild(new Option(f.k, f.k));
    sel.onchange = () => { if (!sel.value) return; editBegin(); gv[sel.value] = 0; edit(); };
    add.appendChild(sel); add.style.paddingTop = '2px'; box.appendChild(add);
  }
  const add = el('div', 'fld');
  const sel = document.createElement('select');
  sel.appendChild(new Option('add parameter…', ''));
  for (const f of P.params) if (pre[f.k] === undefined) sel.appendChild(new Option(f.k, f.k));
  sel.onchange = () => { if (!sel.value) return; const f = P.params.find(x => x.k === sel.value);
    editBegin(); pre[sel.value] = f.t === 'bool' ? true : f.t === 'raw' ? [] : f.t === 'enum' ? f.opts[0] : 0; edit(); };
  add.appendChild(sel); box.appendChild(add);
}

function renderViewOpts() {
  const box = $('#viewopts'); box.innerHTML = '';
  const e = S.doc.editor;
  const alpha = document.createElement('input');
  alpha.type = 'range'; alpha.min = 0; alpha.max = 1; alpha.step = 0.05; alpha.value = e.imageAlpha == null ? 1 : e.imageAlpha;
  alpha.oninput = () => { e.imageAlpha = +alpha.value; view.draw(); };
  alpha.onchange = () => { S.dirty = true; markSave(); scheduleSave(); };
  box.appendChild(fieldRow('source', alpha));

  const grid = numInput(e.grid, v => { e.grid = v === undefined ? 0 : +v; view.draw(); S.dirty = true; markSave(); });
  box.appendChild(fieldRow('grid', grid, 'grid step in normalised units'));
  const snap = boolInput(e.snap, v => { e.snap = !!v; S.dirty = true; markSave(); });
  box.appendChild(fieldRow('snap', snap));
  const showGrid = boolInput(S.showGrid, v => { S.showGrid = !!v; view.draw(); });
  box.appendChild(fieldRow('show grid', showGrid));

  const mir = numInput(e.mirror, v => { e.mirror = v === undefined ? null : +v; view.draw(); S.dirty = true; markSave(); });
  box.appendChild(fieldRow('mirror u', mir, 'the axis a specimen is symmetrical about'));
  const mb = el('div', 'fld');
  const guess = el('button', 'btn', 'find axis');
  guess.title = 'average the horizontal extremes of the current layer';
  guess.onclick = () => {
    const L = C.layerSpec(S.doc, S.layer), list = C.items(S.doc, S.layer);
    let lo = 1, hi = 0;
    for (const it of list) { const b = C.bbox(it, L, view.W, view.H); if (!b) continue; lo = Math.min(lo, b.x0); hi = Math.max(hi, b.x1); }
    if (hi <= lo) { toast('nothing to measure'); return; }
    e.mirror = C.r4((lo + hi) / 2); renderViewOpts(); view.draw(); S.dirty = true; markSave();
    toast('mirror axis ' + e.mirror.toFixed(4));
  };
  mb.appendChild(guess); box.appendChild(mb);

  const core = document.createElement('input');
  core.type = 'color';
  const c3 = e.core || [226, 112, 92];
  core.value = '#' + c3.map(n => n.toString(16).padStart(2, '0')).join('');
  core.oninput = () => { const h = core.value; e.core = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    S.dirty = true; markSave(); if (S.plates) schedulePreview(); };
  box.appendChild(fieldRow('spot colour', core, 'the one printed colour — `core` in the field data'));

  if (S.plates) {
    for (const k of ['key', 'hatch', 'spot']) {
      const b = boolInput(e.plates[k], v => { e.plates[k] = v ? 1 : 0; view.draw(); });
      box.appendChild(fieldRow('plate ' + k, b));
    }
  }
  const ap = boolInput(S.autoPreview, v => { S.autoPreview = !!v; if (v) schedulePreview(); });
  box.appendChild(fieldRow('auto preview', ap, 're-read after every edit — off for big sources'));
}

/* ------------------------------------------------------------- inspector */

function renderInspector() {
  const box = $('#inspbody'); box.innerHTML = '';
  if (S.review) { renderReview(box); return; }
  if (S.conflict) {
    const b = el('div', 'banner warn');
    b.innerHTML = `<b>Someone else saved r${S.conflict.rev}.</b> Reload to take theirs, or force to keep yours.`;
    const row = el('div', 'fld');
    const r1 = el('button', 'btn', 'Reload'); r1.onclick = () => loadDoc(S.doc.id).then(() => { S.conflict = null; renderInspector(); });
    const r2 = el('button', 'btn', 'Force mine'); r2.onclick = async () => { S.rev = S.conflict.rev; S.conflict = null; await save(true); renderInspector(); };
    row.appendChild(r1); row.appendChild(r2); box.appendChild(b); box.appendChild(row);
  }
  if (S.rowState && S.rowState.state === 'asked') {
    const b = el('div', 'banner');
    b.innerHTML = `<b>Out with Claude.</b> ${esc(S.rowState.ask || '')}`;
    const row = el('div', 'fld');
    const r = el('button', 'btn', 'Check for a reply');
    r.onclick = async () => { await loadDoc(S.doc.id); if (!S.review) toast('nothing back yet'); };
    row.appendChild(r); box.appendChild(b); box.appendChild(row);
  }
  const L = C.layerSpec(S.doc, S.layer);
  const head = el('div', 'sec');
  head.appendChild(el('h3', null, L ? L.label : 'layer'));
  if (L && L.help) { const h = el('div', 'hint', L.help); head.appendChild(h); }
  box.appendChild(head);

  if (!S.sel || !L) { const s = el('div', 'hint', 'Nothing selected. Click a point, a line, or inside a closed shape.'); box.appendChild(s); renderStat(); return; }
  const list = C.items(S.doc, S.layer), it = list[S.sel.pi];
  if (!it) { S.sel = null; renderStat(); return; }

  const sec = el('div', 'sec');
  const kind = C.kindOf(it, L);
  sec.appendChild(el('h3', null, `#${S.sel.pi} · ${kind}`));
  box.appendChild(sec);

  /* actions */
  const acts = el('div', 'fld'); acts.style.flexWrap = 'wrap';
  const mk = (label, fn, title) => { const b = el('button', 'btn', label); b.onclick = fn; if (title) b.title = title; acts.appendChild(b); };
  mk('Duplicate', () => { editBegin(); list.splice(S.sel.pi + 1, 0, C.clone(it)); S.sel = { pi: S.sel.pi + 1, vi: 0 }; edit(); });
  mk('Mirror', () => {
    const ax = S.doc.editor.mirror;
    if (ax == null) { toast('set a mirror axis first'); return; }
    editBegin(); const cp = C.clone(it); C.mirrorPrim(cp, L, ax);
    list.splice(S.sel.pi + 1, 0, cp); S.sel = { pi: S.sel.pi + 1, vi: 0 }; edit();
    toast('mirrored about ' + ax);
  }, 'copy reflected about the mirror axis');
  if (kind === 'polyline' || kind === 'polygon' || kind === 'curve') {
    mk(kind === 'polygon' ? 'Open' : 'Close', () => {
      editBegin(); const g = C.geomOf(it, L); const pts = Array.isArray(g) ? g : g.pts;
      if (C.isClosed(pts)) pts.pop(); else pts.push([pts[0][0], pts[0][1]]); edit();
    });
    mk('Reverse', () => { editBegin(); const g = C.geomOf(it, L); const pts = Array.isArray(g) ? g : g.pts; pts.reverse(); edit(); });
    if (kind !== 'curve' && !L.at) mk('Curve', () => { editBegin(); const g = C.geomOf(it, L);
      list[S.sel.pi] = { curve: true, pts: Array.isArray(g) ? g : g.pts }; edit(); }, 'Catmull-Rom through the points');
    if (kind === 'curve') mk('Straight', () => { editBegin(); list[S.sel.pi] = C.geomOf(it, L).pts; edit(); });
  }
  mk('Delete', () => { editBegin(); list.splice(S.sel.pi, 1); S.sel = null; edit(); });
  box.appendChild(acts);

  /* rule fields */
  if (L.fields) {
    const f = el('div', 'sec'); f.appendChild(el('h3', null, 'rule'));
    for (const spec of L.fields) {
      if (it[spec.k] === undefined && !['n', 'band', 'angle', 't'].includes(spec.k)) continue;
      f.appendChild(fieldFor(spec, k => it[k], (k, v) => { if (v === undefined) delete it[k]; else it[k] = v; }));
    }
    const add = el('div', 'fld'); const sel = document.createElement('select');
    sel.appendChild(new Option('add field…', ''));
    for (const spec of L.fields) if (it[spec.k] === undefined) sel.appendChild(new Option(spec.k, spec.k));
    sel.onchange = () => { if (!sel.value) return; const spec = L.fields.find(x => x.k === sel.value);
      editBegin(); it[sel.value] = spec.t === 'bool' ? true : spec.t === 'raw' ? [] : 0; edit(); };
    add.appendChild(sel); f.appendChild(add);
    box.appendChild(f);
  }

  /* the numbers themselves */
  const pt = el('div', 'sec'); pt.appendChild(el('h3', null, 'coordinates'));
  const g = L.geom === 'point' ? null : C.geomOf(it, L);
  if (g && g.circle) {
    pt.appendChild(fieldRow('u', numInput(g.circle[0], v => { editBegin(); g.circle[0] = C.r4(+v); edit(); })));
    pt.appendChild(fieldRow('v', numInput(g.circle[1], v => { editBegin(); g.circle[1] = C.r4(+v); edit(); })));
    pt.appendChild(fieldRow('r', numInput(g.circle[2], v => { editBegin(); g.circle[2] = C.r4(+v); edit(); }), 'in u units; the v radius is r·W/H'));
  } else if (g && g.ellipse) {
    ['u', 'v', 'ru', 'rv'].forEach((k, i) => pt.appendChild(fieldRow(k, numInput(g.ellipse[i], v => { editBegin(); g.ellipse[i] = C.r4(+v); edit(); }))));
  } else if (L.geom === 'point') {
    pt.appendChild(fieldRow('u', numInput(it.u, v => { editBegin(); it.u = C.r4(+v); edit(); })));
    pt.appendChild(fieldRow('v', numInput(it.v, v => { editBegin(); it.v = C.r4(+v); edit(); })));
  } else {
    const pts = Array.isArray(g) ? g : (g && g.pts) || [];
    const t = document.createElement('table'); t.className = 'pts';
    t.innerHTML = '<tr><th></th><th>u</th><th>v</th><th></th></tr>';
    pts.forEach((p, i) => {
      const tr = document.createElement('tr'); if (S.sel.vi === i) tr.className = 'on';
      tr.innerHTML = `<td class="i">${i}</td>`;
      [0, 1].forEach(j => {
        const td = document.createElement('td'); const inp = document.createElement('input');
        inp.value = C.r4(p[j]).toFixed(4);
        inp.onfocus = () => { S.sel = { pi: S.sel.pi, vi: i }; view.draw(); };
        inp.onchange = () => { const nv = parseFloat(inp.value); if (isNaN(nv)) { inp.value = C.r4(p[j]).toFixed(4); return; }
          editBegin(); C.moveHandle(it, L, i, j === 0 ? nv : p[0], j === 1 ? nv : p[1]); edit(); };
        td.appendChild(inp); tr.appendChild(td);
      });
      const x = document.createElement('td'); x.className = 'x'; x.textContent = '×'; x.title = 'delete point';
      x.onclick = () => { if (pts.length <= 2) { toast('a path needs two points'); return; }
        editBegin(); pts.splice(i, 1); S.sel = { pi: S.sel.pi, vi: Math.max(0, i - 1) }; edit(); };
      tr.appendChild(x);
      t.appendChild(tr);
    });
    pt.appendChild(t);
  }
  box.appendChild(pt);
  renderStat();
}

/* ---------------------------------------------------------------- status */

function renderStat() {
  const L = C.layerSpec(S.doc, S.layer);
  $('#s-zoom').textContent = Math.round(view.scale * 100) + '%';
  $('#s-sel').textContent = S.sel ? `${L ? L.label : ''} #${S.sel.pi}${S.sel.vi != null ? ' · pt ' + (S.sel.vi + 1) : ''}` : '—';
  const t = PV.lastTiming();
  $('#s-pipe').textContent = t ? PV.summary(t) : '';
}
function onCursor(u, v) {
  $('#s-uv').textContent = `u ${u.toFixed(4)}  v ${v.toFixed(4)}`;
  $('#s-px').textContent = `${Math.round(u * view.W)} , ${Math.round(v * view.H)} px`;
}

/* --------------------------------------------------------------- preview */

function schedulePreview() { clearTimeout(prevT); prevT = setTimeout(runPreview, 700); }
async function runPreview() {
  if (!S.img) { toast('load a source first'); return; }
  const btn = $('#b-preview'); btn.textContent = 'reading…'; btn.disabled = true;
  try {
    const data = await PV.analyse(S.img, S.doc.preset);
    const core = S.doc.editor.core || null;
    S.plates = await PV.raster(data, S.doc.preset, core, S.doc.image.w, S.doc.image.h, 2);
    setPlates(true);
    const sz = PV.analysisSize(S.img, S.doc.preset);
    if (sz.capped) toast(`analysis capped at the source width (${sz.sourceW} px) — scale has no effect below 600 px`);
    renderStat();
  } catch (e) { toast(e.message); }
  btn.textContent = 'Preview'; btn.disabled = false;
  btn.classList.toggle('on', S.showPlates);
}

/* the plates read only against a faded source, so the toggle carries the source with it */
function setPlates(on) {
  S.showPlates = on;
  const e = S.doc.editor;
  if (on) { if (e.imageAlpha == null || e.imageAlpha > 0.5) { S._alphaWas = e.imageAlpha; e.imageAlpha = 0.22; } }
  else if (S._alphaWas != null) { e.imageAlpha = S._alphaWas; S._alphaWas = null; }
  $('#b-preview').classList.toggle('on', on);
  renderViewOpts(); view.draw();
}

/* -------------------------------------------------------------- popovers */

function pop(html, anchor) {
  const p = $('#pop'); p.innerHTML = html; p.hidden = false;
  const r = anchor.getBoundingClientRect();
  p.style.left = Math.max(8, Math.min(r.left, innerWidth - p.offsetWidth - 8)) + 'px';
  const close = e => { if (!p.contains(e.target) && e.target !== anchor) { p.hidden = true; document.removeEventListener('pointerdown', close, true); } };
  setTimeout(() => document.addEventListener('pointerdown', close, true), 0);
  return p;
}
function closePop() { $('#pop').hidden = true; }

async function popDocs(anchor) {
  const p = pop('<h4>Documents</h4><div class="pad">loading…</div>', anchor);
  let rows = [];
  try { rows = S.cloud ? await S3.listDocs() : S3.localList(); } catch (e) { rows = []; }
  const body = [];
  body.push('<h4>Documents</h4>');
  body.push('<div class="row" data-new="h-figures"><b>New · h-figures preset</b><span class="sub">the instrument</span></div>');
  body.push('<div class="row" data-new="generic"><b>New · generic geometry</b><span class="sub">shapes + points</span></div>');
  for (const r of rows) body.push(
    `<div class="row" data-open="${esc(r.id)}"><b>${esc(r.title || r.id)}</b>` +
    `<span class="sub">${esc(r.state === 'asked' ? 'asked ·' : r.state === 'answered' ? 'answered ·' : '')} ${esc((r.updated_at || '').slice(0, 10))}</span></div>`);
  if (!rows.length) body.push('<div class="pad" style="color:var(--ink-3)">No documents yet.</div>');
  p.innerHTML = body.join('');
  p.querySelectorAll('[data-open]').forEach(n => n.onclick = () => { closePop(); loadDoc(n.dataset.open); });
  p.querySelectorAll('[data-new]').forEach(n => n.onclick = async () => {
    closePop(); S.doc = C.newDoc(n.dataset.new); S.rev = 0; history.replaceState(null, '', location.pathname);
    await afterLoad(); toast('new document — add a source');
  });
}

function popSource(anchor) {
  const p = pop([
    '<h4>Source</h4>',
    '<div class="pad">',
    '<input type="file" id="f-img" accept="image/*" style="width:100%">',
    '<div class="fld" style="padding-left:0"><label>or URL</label><input type="text" id="f-url" placeholder="https://…"></div>',
    '<div class="fld" style="padding-left:0"><label>crop</label><input type="text" id="f-crop"></div>',
    '<div style="margin-top:8px;display:flex;gap:8px"><button class="btn" id="f-set">Apply</button>',
    '<button class="btn" id="f-fit">Fit view</button></div>',
    '<div class="hint" style="padding-left:0">Uploads go to the register-images bucket. Crop is [u0,v0,u1,v1] and everything downstream is normalised to it.</div>',
    '</div>'].join(''), anchor);
  p.querySelector('#f-crop').value = JSON.stringify(S.doc.preset.crop || [0, 0, 1, 1]);
  p.querySelector('#f-url').value = (S.doc.image && S.doc.image.url) || '';
  p.querySelector('#f-img').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    toast('uploading…');
    try {
      let url;
      if (S.cloud) url = await S3.uploadImage(file);
      else url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
      await setImage(url); closePop();
    } catch (err) { toast(err.message); }
  };
  p.querySelector('#f-set').onclick = async () => {
    const u = p.querySelector('#f-url').value.trim();
    try { const c = JSON.parse(p.querySelector('#f-crop').value); editBegin(); S.doc.preset.crop = c; edit(); } catch (e) {}
    if (u && u !== (S.doc.image && S.doc.image.url)) await setImage(u);
    closePop(); view.draw();
  };
  p.querySelector('#f-fit').onclick = () => { closePop(); view.fit(); };
}
async function setImage(url) {
  S.doc.image = { url, w: 0, h: 0 };
  await loadImage();
  if (S.img) { S.doc.image.w = S.img.naturalWidth; S.doc.image.h = S.img.naturalHeight;
    toast(`source ${S.doc.image.w}×${S.doc.image.h}`); }
  S.plates = null; S.showPlates = false; S.dirty = true; markSave(); scheduleSave();
  view.needFit = true; view.fit(); renderStat();
}

function popExport(anchor) {
  const preset = C.exportPreset(S.doc);
  const p = pop([
    '<h4>Export</h4>',
    '<div class="row" data-x="preset"><b>Preset</b><span class="sub">specimen-presets.js</span></div>',
    '<div class="row" data-x="json"><b>Document JSON</b><span class="sub">round-trips here</span></div>',
    '<div class="row" data-x="svg"><b>SVG</b><span class="sub">geometry at source size</span></div>',
    '<div class="row" data-x="import"><b>Import a preset…</b><span class="sub">paste</span></div>',
    `<div class="pad"><textarea id="x-out" style="width:100%;height:190px;font-family:var(--num);font-size:10.5px;border:1px solid var(--line);border-radius:2px;padding:6px" spellcheck="false">${esc(preset)}</textarea>`,
    '<div style="margin-top:8px;display:flex;gap:8px"><button class="btn" id="x-copy">Copy</button><button class="btn" id="x-dl">Download</button><button class="btn" id="x-in">Load what is in the box</button></div></div>',
  ].join(''), anchor);
  let mode = 'preset';
  const out = p.querySelector('#x-out');
  const setMode = m => { mode = m;
    out.value = m === 'preset' ? C.exportPreset(S.doc) : m === 'json' ? C.exportJSON(S.doc) : m === 'svg' ? C.exportSVG(S.doc) : '';
    if (m === 'import') out.placeholder = "paste 'chalice':{ … } or a document JSON"; };
  p.querySelectorAll('[data-x]').forEach(n => n.onclick = () => setMode(n.dataset.x));
  p.querySelector('#x-copy').onclick = async () => { try { await navigator.clipboard.writeText(out.value); toast('copied'); } catch (e) { out.select(); toast('press ⌘C'); } };
  p.querySelector('#x-dl').onclick = () => {
    const ext = mode === 'svg' ? 'svg' : mode === 'json' ? 'json' : 'js';
    const b = new Blob([out.value], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = `${S.doc.slug || 'register'}.${ext}`; a.click(); URL.revokeObjectURL(a.href);
  };
  p.querySelector('#x-in').onclick = () => {
    const t = out.value.trim(); if (!t) return;
    try {
      let obj;
      try { obj = JSON.parse(t); } catch (e) { obj = null; }
      if (obj && obj.preset) { editBegin(); S.doc.preset = obj.preset;
        if (obj.editor) S.doc.editor = Object.assign(S.doc.editor, obj.editor);
        if (obj.slug) S.doc.slug = obj.slug; if (obj.title) S.doc.title = obj.title;
        edit(); afterDocChange(); toast('document loaded'); closePop(); return; }
      const { slug, preset } = C.parsePreset(t);
      editBegin(); S.doc.preset = preset; if (slug) S.doc.slug = slug; edit(); afterDocChange();
      toast('preset loaded' + (slug ? ' · ' + slug : '')); closePop();
    } catch (e) { toast(e.message); }
  };
}

/* -------------------------------------------------------- Claude handoff */

function popAsk(anchor) {
  if (!S.cloud) { toast('a workspace key is needed to hand a document to Claude'); return; }
  const p = pop([
    '<h4>Send to Claude</h4>',
    '<div class="pad">',
    '<textarea id="a-txt" style="width:100%;height:110px;border:1px solid var(--line);border-radius:2px;padding:6px" ',
    'placeholder="What should I do? e.g. place the six column rects on their edges, and leave the base alone."></textarea>',
    '<div style="margin-top:8px;display:flex;gap:8px"><button class="btn pri" id="a-go">Mark as asked</button>',
    '<button class="btn" id="a-copy">Copy the handoff line</button></div>',
    '<div class="hint" style="padding-left:0">This saves, records the ask, and gives you one line to paste into a Claude session. ',
    'I read the document by id, write a revision, and it comes back here as a review.</div>',
    '</div>'].join(''), anchor);
  p.querySelector('#a-txt').value = (S.rowState && S.rowState.ask) || '';
  const line = () => `Register document ${S.doc.id} — ${p.querySelector('#a-txt').value.trim() || 'take a look'}`;
  p.querySelector('#a-copy').onclick = async () => { try { await navigator.clipboard.writeText(line()); toast('copied'); } catch (e) { toast(line()); } };
  p.querySelector('#a-go').onclick = async () => {
    const ask = p.querySelector('#a-txt').value.trim();
    await save(false);
    try {
      await S3.saveDoc(S.doc.id, { ask, ask_at: new Date().toISOString(), state: 'asked', reply: null, reply_at: null }, S.rev);
      S.rev += 1; markSave();
      try { await navigator.clipboard.writeText(line()); } catch (e) {}
      toast('asked · handoff line copied');
    } catch (e) { toast(e.message); }
    closePop();
  };
}

async function openReview() {
  try {
    const pair = await S3.claudePair(S.doc.id);
    if (!pair) { toast('no Claude revision found'); return; }
    const base = pair.base ? pair.base.doc.preset : S.doc.preset;
    const diff = C.diffPresets(base, pair.claude.doc.preset, S.doc, view.W, view.H);
    if (!diff.length) { toast('Claude changed nothing'); return; }
    S.review = { diff, base, claude: pair.claude, accepted: new Set(diff.map((d, i) => i)) };
    renderInspector();
    previewReview();
  } catch (e) { toast('review failed: ' + e.message); }
}
function previewReview() {
  if (!S.review) return;
  S.doc.preset = C.applyDiff(S.review.base, S.review.diff, S.review.accepted, S.doc);
  renderLayers(); view.draw();
}
function renderReview(box) {
  const R = S.review;
  const b = el('div', 'banner');
  b.innerHTML = `<b>Claude answered.</b> ${esc((S.rowState && S.rowState.reply) || '')}`;
  box.appendChild(b);
  const acts = el('div', 'fld'); acts.style.flexWrap = 'wrap';
  const mk = (t, fn, cls) => { const x = el('button', 'btn' + (cls ? ' ' + cls : ''), t); x.onclick = fn; acts.appendChild(x); };
  mk('Accept all', () => { R.accepted = new Set(R.diff.map((d, i) => i)); previewReview(); renderInspector(); }, 'pri');
  mk('Reject all', () => { R.accepted = new Set(); previewReview(); renderInspector(); });
  mk('Keep', async () => {
    const kept = R.accepted.size;
    S.review = null; S.dirty = true;
    await save(true);
    try { await S3.saveDoc(S.doc.id, { state: 'idle' }, S.rev); S.rev += 1; } catch (e) {}
    S.rowState = Object.assign({}, S.rowState, { state: 'idle' });
    markSave(); renderInspector(); toast(`${kept} of ${R.diff.length} change${R.diff.length === 1 ? '' : 's'} kept`);
  });
  box.appendChild(acts);
  const list = el('div');
  R.diff.forEach((d, i) => {
    const row = el('div', 'rev' + (R.accepted.has(i) ? '' : ' off'));
    const k = el('span', 'k ' + (d.kind === 'add' ? 'add' : d.kind === 'del' ? 'del' : 'chg'),
      d.kind === 'add' ? '+' : d.kind === 'del' ? '−' : '~');
    const dd = el('div', 'd');
    dd.appendChild(el('b', null, `${d.label} #${d.i}`));
    dd.appendChild(el('small', null, d.kind === 'chg'
      ? (d.px != null ? `moved up to ${d.px} source px` : 'changed')
      : d.kind === 'add' ? 'added' : 'removed'));
    row.appendChild(k); row.appendChild(dd);
    row.onclick = () => { R.accepted.has(i) ? R.accepted.delete(i) : R.accepted.add(i); previewReview(); renderInspector(); };
    list.appendChild(row);
  });
  box.appendChild(list);
}

/* -------------------------------------------------------------- keyboard */

function keys(e) {
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
    if (e.key === 'Escape') t.blur();
    return;
  }
  const meta = e.metaKey || e.ctrlKey;
  if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); save(true); return; }
  if (e.key === ' ') { view.space = true; view.cv.style.cursor = 'grab'; e.preventDefault(); return; }
  if (e.key === 'Escape') { if (S.draft) view.cancelDraft(); else { S.sel = null; renderInspector(); view.draw(); } return; }
  if (e.key === 'Enter') { if (S.draft) view.finishDraft(e.shiftKey); return; }

  const k = e.key.toLowerCase();
  if ('vprclt'.includes(k) && !meta) { setTool(k); return; }
  if (k === '0') { view.fit(); renderStat(); return; }
  if (k === '1' && !meta) { view.setZoom(1); renderStat(); return; }
  if (k === '=' || k === '+') { view.zoomAt(1.25, view.cw / 2, view.ch / 2); renderStat(); return; }
  if (k === '-') { view.zoomAt(0.8, view.cw / 2, view.ch / 2); renderStat(); return; }
  if (e.key === "'") { S.showGrid = !S.showGrid; renderViewOpts(); view.draw(); return; }
  if (k === 'i') { S.showImage = !S.showImage; view.draw(); return; }
  if (k === 'd') { S.showGeom = S.showGeom === false; view.draw(); toast(S.showGeom === false ? 'geometry hidden' : 'geometry shown'); return; }
  if (k === 'h') { S.hidden.has(S.layer) ? S.hidden.delete(S.layer) : S.hidden.add(S.layer); renderLayers(); view.draw(); return; }
  if (k === 'm') { const ax = S.doc.editor.mirror;
    if (ax == null || !S.sel) { toast('select something and set a mirror axis'); return; }
    const L = C.layerSpec(S.doc, S.layer), list = C.items(S.doc, S.layer);
    editBegin(); const cp = C.clone(list[S.sel.pi]); C.mirrorPrim(cp, L, ax);
    list.splice(S.sel.pi + 1, 0, cp); S.sel = { pi: S.sel.pi + 1, vi: 0 }; edit(); toast('mirrored'); return; }
  if (k === 'p' && e.shiftKey) { runPreview(); return; }

  const P = C.profileOf(S.doc);
  if (e.key === '[' || e.key === ']') {
    const list = C.items(S.doc, S.layer); if (!list.length) return;
    const d = e.key === ']' ? 1 : -1;
    const cur = S.sel ? S.sel.pi : (d > 0 ? -1 : 0);
    S.sel = { pi: ((cur + d) % list.length + list.length) % list.length, vi: 0 };
    renderInspector(); view.draw(); return;
  }
  if (e.key === 'Tab') { e.preventDefault();
    const i = P.layers.findIndex(l => l.id === S.layer);
    S.layer = P.layers[(i + (e.shiftKey ? -1 : 1) + P.layers.length) % P.layers.length].id;
    S.sel = null; renderLayers(); renderInspector(); view.draw(); return; }
  if (e.key === 'Backspace' || e.key === 'Delete') {
    if (!S.sel) return; const list = C.items(S.doc, S.layer);
    editBegin(); list.splice(S.sel.pi, 1); S.sel = null; edit(); return; }
  if (e.key.startsWith('Arrow')) {
    if (!S.sel) return; e.preventDefault();
    const step = e.shiftKey ? 5 : 1;
    const du = (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0) / view.W;
    const dv = (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0) / view.H;
    const L = C.layerSpec(S.doc, S.layer), it = C.items(S.doc, S.layer)[S.sel.pi]; if (!it) return;
    editBegin();
    if (e.altKey) C.movePrim(it, L, du, dv);
    else { const hs = C.handles(it, L), p = hs[S.sel.vi]; if (p) C.moveHandle(it, L, S.sel.vi, p[0] + du, p[1] + dv); }
    edit(); return;
  }
}

/* ------------------------------------------------------------------ boot */

async function boot() {
  view = new View($('#cv'), S);
  S.onEditBegin = editBegin;
  S.onEdit = edit;
  S.onEditLive = () => { renderStat(); };
  S.onSelect = () => { renderInspector(); };
  S.onCursor = onCursor;
  S.toast = toast;

  $('#title').oninput = () => { S.doc.title = $('#title').value; S.dirty = true; markSave(); scheduleSave(); };
  $('#b-docs').onclick = e => popDocs(e.currentTarget);
  $('#b-image').onclick = e => popSource(e.currentTarget);
  $('#b-export').onclick = e => popExport(e.currentTarget);
  $('#b-ask').onclick = e => popAsk(e.currentTarget);
  $('#b-preview').onclick = () => { if (S.plates) setPlates(!S.showPlates); else runPreview(); };
  addEventListener('keydown', keys);
  addEventListener('keyup', e => { if (e.key === ' ') { view.space = false; view.cv.style.cursor = ''; } });
  addEventListener('beforeunload', e => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

  renderTools();
  await gate();

  const id = new URLSearchParams(location.search).get('d');
  if (id) await loadDoc(id);
  else { await afterLoad(); }
  window.__register = { S, view, C, S3, PV, save, runPreview, openReview, reload: afterLoad, renderReviewNow: renderInspector };
}
boot();
