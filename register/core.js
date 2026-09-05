/* Register · core — the document, the profiles, the geometry.
 *
 * The document IS the preset plus editor metadata. There is no parallel model to keep in
 * step: what you drag is the array the instrument reads, and export is that array written
 * out. A profile says which arrays exist, what geometry each holds, and how to serialise —
 * so a second export target is data, not another code path.
 */

export const r4 = v => Math.round(v * 1e4) / 1e4;
export const clone = o => JSON.parse(JSON.stringify(o));
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export function uid(n = 10) {
  const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = '';
  const r = crypto.getRandomValues(new Uint8Array(n));
  for (let i = 0; i < n; i++) s += a[r[i] % a.length];
  return 'r_' + s;
}

/* ---------------------------------------------------------------- profiles */

const RULE_DARK = [
  { k: 't', t: 'num', help: 'threshold on the stretched L (0–1)' },
  { k: 'abs', t: 'bool', help: 'read absolute luminance instead of the stretched L' },
  { k: 'invert', t: 'bool', help: 'bright-as-ink instead of dark-as-ink' },
  { k: 'raw', t: 'bool' },
  { k: 'tMax', t: 'num', help: 'thicker than this becomes an outlined mass' },
  { k: 'massMin', t: 'int' }, { k: 'minArea', t: 'int' },
  { k: 'minChain', t: 'int' }, { k: 'wMin', t: 'num' }, { k: 'spur', t: 'num' },
  { k: 'close', t: 'int' }, { k: 'open', t: 'int' },
  { k: 'hue', t: 'raw', help: '[lo,hi] degrees' }, { k: 'sat', t: 'num' }, { k: 'satMax', t: 'num' },
  { k: 'not', t: 'raw', help: '[hueLo,hueHi,sat] to exclude' },
  { k: 'knockout', t: 'bool' }, { k: 'dropLong', t: 'bool' }, { k: 'dropRows', t: 'bool' },
];

export const PROFILES = {
  'h-figures': {
    id: 'h-figures',
    label: 'h-figures preset',
    note: 'Mode Mode Fig. 2 — the instrument that reads one object at a time.',
    layers: [
      { id: 'structure', path: 'structure', geom: 'shape', color: '#15140F', label: 'structure',
        help: 'hand-set lines drawn from the source; rasterised at hairline 0.9, not masked' },
      { id: 'trackers', path: 'trackers', geom: 'point', color: '#1E5EE0', label: 'trackers',
        number: i => 10 + i * 2, max: 10,
        fields: [{ k: 'n', t: 'int', help: 'index into the project’s field nodes' }],
        help: 'ten points the read fixes, numbered 10–28' },
      { id: 'keep', path: 'mask.keep', geom: 'poly', color: '#00963c', label: 'mask keep',
        help: 'outside the mask the paper is bare' },
      { id: 'drop', path: 'mask.drop', geom: 'poly', color: '#dc1e1e', label: 'mask drop' },
      { id: 'nohatch', path: 'noHatch', geom: 'poly', color: '#969696', label: 'noHatch', dash: [3, 3],
        help: 'applied after forceBand, so it wins — cut these around forced regions' },
      { id: 'force', path: 'forceBand', geom: 'poly', at: 'poly', color: '#d28200', label: 'forceBand', dash: [6, 3],
        fields: [{ k: 'band', t: 'int' }, { k: 'hue', t: 'raw' }, { k: 'sat', t: 'num' },
                 { k: 'lmax', t: 'num' }, { k: 'lmin', t: 'num' }],
        help: 'bypasses the ridge-density form gate' },
      { id: 'dark', path: 'darkKey', geom: 'poly', at: 'poly', color: '#7800c8', label: 'darkKey', dash: [2, 2],
        fields: RULE_DARK, help: 'the only place the drawing’s own ink enters the plate' },
      { id: 'plate', path: 'plate', geom: 'poly', at: 'poly', color: '#9a9a9a', label: 'hatch plate', dash: [1, 3],
        fields: [{ k: 'angle', t: 'num' }, { k: 'ruled', t: 'bool', help: 'ignore the flow' }] },
      { id: 'keyclip', path: 'keyClip', geom: 'poly', color: '#5b8f8f', label: 'keyClip', dash: [4, 2] },
      { id: 'keydrop', path: 'keyDrop', geom: 'poly', color: '#8f5b8f', label: 'keyDrop', dash: [4, 2] },
    ],
    params: [
      { k: 'scale', t: 'num', help: 'analysis width multiplier — capped at the source width under 600 px' },
      { k: 'luma', t: 'enum', opts: ['rec', 'max'] },
      { k: 'key', t: 'enum', opts: ['none', 'fdog'], help: 'none → darkKey medial pass (line art)' },
      { k: 'local', t: 'num' }, { k: 'formTh', t: 'num' },
      { k: 'bands', t: 'raw', help: 'tone thresholds [b1,b2,b3]' },
      { k: 'dsep', t: 'raw', help: 'streamline spacing per band' },
      { k: 'cross', t: 'raw', help: 'cross-hatch angle on band 3, or false' },
      { k: 'cohLo', t: 'num' }, { k: 'cohHi', t: 'num' },
      { k: 'etfR', t: 'int' }, { k: 'etfIters', t: 'int' },
      { k: 'structClear', t: 'num' }, { k: 'minChain', t: 'int' },
      { k: 'sc', t: 'num' }, { k: 'sm', t: 'num' }, { k: 'rho', t: 'num' }, { k: 'tau', t: 'num' },
      { k: 'detailMin', t: 'num' }, { k: 'structTh', t: 'num' }, { k: 'turn', t: 'num' }, { k: 'minHatch', t: 'num' },
    ],
    groups: [
      { k: 'mask', fields: [{ k: 'type', t: 'enum', opts: ['all', 'chroma', 'lum', 'ink'] },
        { k: 'hue', t: 'raw' }, { k: 'sat', t: 'num' }, { k: 'lo', t: 'num' }, { k: 'dark', t: 'num' },
        { k: 'density', t: 'num' }, { k: 'erode', t: 'int' }, { k: 'edgeClear', t: 'num' }] },
      { k: 'spot', fields: [{ k: 'hue', t: 'raw' }, { k: 'sat', t: 'num' }, { k: 'satMax', t: 'num' },
        { k: 'band', t: 'raw' }, { k: 'not', t: 'raw' }, { k: 'gate', t: 'bool' }, { k: 'sharp', t: 'bool' },
        { k: 'close', t: 'int' }, { k: 'open', t: 'int' }, { k: 'close2', t: 'int' },
        { k: 'minFrac', t: 'num' }, { k: 'dpEps', t: 'num' }, { k: 'asKey', t: 'bool' }, { k: 'knockout', t: 'bool' }] },
    ],
    empty: () => ({ crop: [0, 0, 1, 1], luma: 'rec', key: 'none', mask: { type: 'all' },
                    structure: [], plate: [{ angle: 45 }], trackers: [] }),
  },

  /* A deliberately open profile: one geometry layer and one point layer, exported as plain
     JSON. Anything that is not an h-figures preset starts here rather than being forced
     into one. */
  generic: {
    id: 'generic', label: 'generic geometry',
    note: 'normalised shapes and numbered points, exported as plain JSON.',
    layers: [
      { id: 'shapes', path: 'shapes', geom: 'shape', color: '#15140F', label: 'shapes' },
      { id: 'regions', path: 'regions', geom: 'poly', color: '#d28200', label: 'regions', dash: [6, 3] },
      { id: 'points', path: 'points', geom: 'point', color: '#1E5EE0', label: 'points', number: i => i + 1 },
    ],
    params: [], groups: [],
    empty: () => ({ shapes: [], regions: [], points: [] }),
  },
};

export const profileOf = doc => PROFILES[doc.profile] || PROFILES['h-figures'];

/* ------------------------------------------------------- paths into the preset */

export function atPath(obj, path, make) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (o[parts[i]] == null) { if (!make) return undefined; o[parts[i]] = {}; }
    o = o[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (o[last] == null && make) o[last] = [];
  return o[last];
}
export function layerSpec(doc, id) { return profileOf(doc).layers.find(l => l.id === id); }
export function items(doc, id, make) {
  const L = layerSpec(doc, id); if (!L) return [];
  return atPath(doc.preset, L.path, make) || [];
}
/* an item's geometry may sit at the item itself or under a key (rules carry `.poly`) */
export function geomOf(item, L) { return L.at ? item[L.at] : item; }
export function setGeom(item, L, g) { if (L.at) item[L.at] = g; else throw new Error('cannot replace geometry in place'); }

/* --------------------------------------------------------------- primitives */

export const isPoly = g => Array.isArray(g);
export const isClosed = g => isPoly(g) && g.length > 3 &&
  Math.hypot(g[0][0] - g[g.length - 1][0], g[0][1] - g[g.length - 1][1]) < 1e-6;

/** the polyline a primitive draws as, in normalised space. W/H only shape the circle. */
export function expand(g, W, H) {
  if (g == null) return [];
  if (Array.isArray(g)) return g;
  if (g.circle) { const [u, v, r] = g.circle, out = [];
    for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2;
      out.push([u + Math.cos(a) * r, v + Math.sin(a) * r * W / H]); } return out; }
  if (g.ellipse) { const [u, v, ru, rv] = g.ellipse, out = [];
    for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2;
      out.push([u + Math.cos(a) * ru, v + Math.sin(a) * rv]); } return out; }
  if (g.pts) return g.pts;
  return [];
}
/** draggable handles of a primitive */
export function handles(item, L) {
  if (L.geom === 'point') return [[item.u, item.v]];
  const g = geomOf(item, L);
  if (Array.isArray(g)) return g;
  if (!g) return [];
  if (g.circle) return [[g.circle[0], g.circle[1]], [g.circle[0] + g.circle[2], g.circle[1]]];
  if (g.ellipse) return [[g.ellipse[0], g.ellipse[1]], [g.ellipse[0] + g.ellipse[2], g.ellipse[1]],
                         [g.ellipse[0], g.ellipse[1] + g.ellipse[3]]];
  if (g.pts) return g.pts;
  return [];
}
export function moveHandle(item, L, i, u, v) {
  if (L.geom === 'point') { item.u = r4(u); item.v = r4(v); return; }
  const g = geomOf(item, L);
  if (g && g.circle) { if (i === 0) { g.circle[0] = r4(u); g.circle[1] = r4(v); }
    else g.circle[2] = r4(Math.max(0.002, u - g.circle[0])); return; }
  if (g && g.ellipse) { if (i === 0) { g.ellipse[0] = r4(u); g.ellipse[1] = r4(v); }
    else if (i === 1) g.ellipse[2] = r4(Math.max(0.002, u - g.ellipse[0]));
    else g.ellipse[3] = r4(Math.max(0.002, v - g.ellipse[1])); return; }
  const pts = Array.isArray(g) ? g : (g && g.pts);
  if (!pts || !pts[i]) return;
  const closed = isClosed(pts);
  pts[i][0] = r4(u); pts[i][1] = r4(v);
  if (closed && (i === 0 || i === pts.length - 1)) {
    const o = i === 0 ? pts.length - 1 : 0; pts[o][0] = r4(u); pts[o][1] = r4(v);
  }
}
export function movePrim(item, L, du, dv) {
  if (L.geom === 'point') { item.u = r4(item.u + du); item.v = r4(item.v + dv); return; }
  const g = geomOf(item, L);
  if (g && g.circle) { g.circle[0] = r4(g.circle[0] + du); g.circle[1] = r4(g.circle[1] + dv); return; }
  if (g && g.ellipse) { g.ellipse[0] = r4(g.ellipse[0] + du); g.ellipse[1] = r4(g.ellipse[1] + dv); return; }
  const pts = Array.isArray(g) ? g : (g && g.pts); if (!pts) return;
  for (const p of pts) { p[0] = r4(p[0] + du); p[1] = r4(p[1] + dv); }
}
/** reflect a primitive about a vertical axis; the chalice needed this to be exact */
export function mirrorPrim(item, L, axis) {
  const m = u => r4(2 * axis - u);
  if (L.geom === 'point') { item.u = m(item.u); return item; }
  const g = geomOf(item, L);
  if (g && g.circle) { g.circle[0] = m(g.circle[0]); return item; }
  if (g && g.ellipse) { g.ellipse[0] = m(g.ellipse[0]); return item; }
  const pts = Array.isArray(g) ? g : (g && g.pts);
  if (pts) for (const p of pts) p[0] = m(p[0]);
  return item;
}
export function bbox(item, L, W, H) {
  const pts = L.geom === 'point' ? [[item.u, item.v]] : expand(geomOf(item, L), W, H);
  if (!pts.length) return null;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  return { x0, y0, x1, y1 };
}
export function kindOf(item, L) {
  if (L.geom === 'point') return 'point';
  const g = geomOf(item, L);
  if (Array.isArray(g)) return isClosed(g) ? 'polygon' : 'polyline';
  if (!g) return 'empty';
  if (g.circle) return 'circle';
  if (g.ellipse) return 'ellipse';
  if (g.pts) return 'curve';
  return 'unknown';
}

/* ------------------------------------------------------------ new documents */

export function newDoc(profile = 'h-figures') {
  const P = PROFILES[profile] || PROFILES['h-figures'];
  return {
    v: 1, id: null, title: 'Untitled', slug: 'specimen', profile: P.id,
    image: null,
    editor: { mirror: null, grid: 0.05, snap: false, core: [226, 112, 92], imageAlpha: 1, plates: { key: 1, hatch: 1, spot: 1 } },
    preset: P.empty(),
  };
}

/* --------------------------------------------------------- export / import */

const num = v => (typeof v === 'number' ? String(r4(v)) : JSON.stringify(v));
const inlineJSON = x => JSON.stringify(x, (k, v) => (typeof v === 'number' ? r4(v) : v));

/** the preset written the way specimen-presets.js wants it: one primitive per line. */
export function exportPreset(doc) {
  const P = doc.preset, out = [], long = new Set(['structure', 'trackers', 'plate', 'darkKey', 'forceBand', 'noHatch']);
  out.push(`'${doc.slug || 'specimen'}':{`);
  const keys = Object.keys(P).filter(k => {
    const v = P[k];
    if (v == null) return false;
    if (Array.isArray(v) && !v.length) return false;
    if (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) return false;
    return true;
  });
  keys.forEach((k, i) => {
    const last = i === keys.length - 1, tail = last ? '' : ',';
    const v = P[k];
    if (long.has(k) && Array.isArray(v) && v.length > 1) {
      out.push(`  ${JSON.stringify(k)}:[`);
      v.forEach((s, j) => out.push('    ' + inlineJSON(s) + (j < v.length - 1 ? ',' : '')));
      out.push(`  ]${tail}`);
    } else out.push(`  ${JSON.stringify(k)}:${inlineJSON(v)}${tail}`);
  });
  out.push('}');
  return out.join('\n');
}

export function exportJSON(doc) {
  return JSON.stringify({ title: doc.title, slug: doc.slug, profile: doc.profile,
    image: doc.image, editor: doc.editor, preset: doc.preset }, (k, v) => (typeof v === 'number' ? r4(v) : v), 1);
}

/** SVG of the geometry alone, at the source's pixel size — for dropping into a drawing app. */
export function exportSVG(doc) {
  const W = (doc.image && doc.image.w) || 1000, H = (doc.image && doc.image.h) || 1000;
  const P = profileOf(doc), body = [];
  for (const L of P.layers) {
    const list = items(doc, L.id); if (!list.length) continue;
    const g = [`<g id="${L.id}" fill="none" stroke="${L.color}" stroke-width="1"${L.dash ? ` stroke-dasharray="${L.dash.join(' ')}"` : ''}>`];
    for (const it of list) {
      if (L.geom === 'point') { g.push(`  <circle cx="${r4(it.u * W)}" cy="${r4(it.v * H)}" r="4" fill="${L.color}" stroke="none"/>`); continue; }
      const geo = geomOf(it, L); if (!geo) continue;
      if (geo.circle) { g.push(`  <ellipse cx="${r4(geo.circle[0] * W)}" cy="${r4(geo.circle[1] * H)}" rx="${r4(geo.circle[2] * W)}" ry="${r4(geo.circle[2] * W)}"/>`); continue; }
      if (geo.ellipse) { g.push(`  <ellipse cx="${r4(geo.ellipse[0] * W)}" cy="${r4(geo.ellipse[1] * H)}" rx="${r4(geo.ellipse[2] * W)}" ry="${r4(geo.ellipse[3] * H)}"/>`); continue; }
      const pts = expand(geo, W, H); if (pts.length < 2) continue;
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${r4(p[0] * W)} ${r4(p[1] * H)}`).join(' ');
      g.push(`  <path d="${d}${isClosed(pts) ? ' Z' : ''}"/>`);
    }
    g.push('</g>'); body.push(g.join('\n'));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${body.join('\n')}\n</svg>`;
}

/** Accepts a bare object literal, a `'slug':{…}` entry, or strict JSON. */
export function parsePreset(text) {
  let s = String(text).trim();
  s = s.replace(/^\s*(?:const\s+\w+\s*=\s*)?/, '');
  const m = s.match(/^['"]([\w-]+)['"]\s*:\s*/);
  let slug = null;
  if (m) { slug = m[1]; s = s.slice(m[0].length); }
  s = s.replace(/,\s*$/, '').trim();
  if (!s.startsWith('{')) throw new Error('expected an object');
  // strip comments and trailing commas, then quote bare keys — enough for the file's own style
  let t = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  t = t.replace(/,(\s*[}\]])/g, '$1');
  t = t.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":');
  t = t.replace(/'/g, '"');
  let obj;
  try { obj = JSON.parse(t); }
  catch (e) { throw new Error('could not parse: ' + e.message); }
  return { slug, preset: obj };
}

/* --------------------------------------------------------------- the diff */

/** Structural diff of two presets, layer by layer, reported in source pixels. */
export function diffPresets(a, b, doc, W, H) {
  const P = profileOf(doc), out = [];
  const listOf = (preset, L) => atPath(preset, L.path) || [];
  for (const L of P.layers) {
    const A = listOf(a, L), B = listOf(b, L);
    const n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i++) {
      const x = A[i], y = B[i];
      if (x === undefined) { out.push({ layer: L.id, label: L.label, i, kind: 'add', after: clone(y), px: null }); continue; }
      if (y === undefined) { out.push({ layer: L.id, label: L.label, i, kind: 'del', before: clone(x), px: null }); continue; }
      const sx = JSON.stringify(x), sy = JSON.stringify(y);
      if (sx === sy) continue;
      out.push({ layer: L.id, label: L.label, i, kind: 'chg', before: clone(x), after: clone(y),
                 px: maxDelta(x, y, L, W, H) });
    }
  }
  return out;
}
function maxDelta(x, y, L, W, H) {
  try {
    const A = L.geom === 'point' ? [[x.u, x.v]] : expand(geomOf(x, L), W, H);
    const B = L.geom === 'point' ? [[y.u, y.v]] : expand(geomOf(y, L), W, H);
    if (!A.length || !B.length || A.length !== B.length) return null;
    let m = 0;
    for (let i = 0; i < A.length; i++) m = Math.max(m, Math.hypot((A[i][0] - B[i][0]) * W, (A[i][1] - B[i][1]) * H));
    return Math.round(m * 10) / 10;
  } catch (e) { return null; }
}
/** apply only the accepted changes of `diff` onto `base`, returning a new preset */
export function applyDiff(base, diff, accepted, doc) {
  const out = clone(base), P = profileOf(doc);
  const byLayer = new Map();
  for (let k = 0; k < diff.length; k++) if (accepted.has(k)) {
    const d = diff[k]; if (!byLayer.has(d.layer)) byLayer.set(d.layer, []); byLayer.get(d.layer).push(d);
  }
  for (const [lid, ds] of byLayer) {
    const L = P.layers.find(l => l.id === lid); if (!L) continue;
    const list = atPath(out, L.path, true);
    // deletes last, so earlier indices stay valid
    for (const d of ds.filter(d => d.kind !== 'del')) {
      if (d.kind === 'chg') list[d.i] = clone(d.after);
      else { while (list.length < d.i) list.push(null); list[d.i] = clone(d.after); }
    }
    for (const d of ds.filter(d => d.kind === 'del').sort((p, q) => q.i - p.i)) list.splice(d.i, 1);
    for (let i = list.length - 1; i >= 0; i--) if (list[i] === null) list.splice(i, 1);
  }
  return out;
}
