// Measures lifted SVG figures into flat primitives in viewBox units, for _build/engines/reading-diagram.js (rd-figure.js per plate).
// node capture-svg.mjs PL-92,PL-93,...  (sources served from this repo)
import { serve } from '../../../scripts/census-lib.mjs';
import { chromium } from 'playwright';
import fs from 'node:fs';
const ROOT = new URL('../../../', import.meta.url).pathname.replace(/\/$/, '');
const { base, close } = await serve(ROOT);
const codes = process.argv[2].split(',');
const plates = JSON.parse(fs.readFileSync(ROOT + '/techniques-templates/_build/plates.json')).plates.filter((p) => codes.includes(p.code));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } }); let at = '';
const out = {};
for (const p of plates) {
  const L = Object.values(p.lift)[0];
  if (at !== L.rt) { at = L.rt; await pg.goto(base + L.rt.replace(/^\/tools/, ''), { waitUntil: 'load', timeout: 30000 }); await pg.waitForTimeout(2500); }
  const r = await pg.evaluate((sel) => {
    const fig = document.querySelector(sel); if (!fig) return { err: 'no figure' };
    fig.scrollIntoView(); const svg = fig.tagName.toLowerCase() === 'svg' ? fig : fig.querySelector('svg'); if (!svg) return { err: fig.querySelector('canvas') ? 'canvas' : 'no svg' };
    const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : { x: 0, y: 0, width: svg.clientWidth, height: svg.clientHeight };
    const root = svg.getScreenCTM().inverse();
    const rgb = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null; const v = m[1].split(',').map(Number); if (v.length > 3 && v[3] === 0) return null; return v.slice(0, 3).concat(v.length > 3 ? [v[3]] : []); };
    const prims = [];
    for (const el of svg.querySelectorAll('line,rect,circle,ellipse,polygon,polyline,path,text')) {
      if (el.closest('defs,marker,clipPath,mask,pattern')) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      let op = 1; for (let n = el; n && n !== svg; n = n.parentElement) op *= +getComputedStyle(n).opacity;
      if (op < 0.02) continue;
      const M = root.multiply(el.getScreenCTM()); const T = (x, y) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]; const sc = Math.hypot(M.a, M.b);
      const st = { s: cs.stroke === 'none' ? null : rgb(cs.stroke), f: cs.fill === 'none' ? null : rgb(cs.fill), w: (parseFloat(cs.strokeWidth) || 0) * sc, o: +op.toFixed(3), so: +cs.strokeOpacity, fo: +cs.fillOpacity,
        d: cs.strokeDasharray && cs.strokeDasharray !== 'none' ? cs.strokeDasharray.split(/[ ,]+/).map((x) => parseFloat(x) * sc) : null, cap: cs.strokeLinecap,
        me: /url/.test(cs.markerEnd || '') || /url/.test(el.getAttribute('marker-end') || ''), ms: /url/.test(cs.markerStart || '') || /url/.test(el.getAttribute('marker-start') || '') };
      if (!st.s && !st.f) continue;
      const t = el.tagName;
      if (t === 'text') {
        const txt = el.textContent.replace(/\s+/g, ' ').trim(); if (!txt) continue;
        const kids = el.querySelectorAll('tspan'); const parts = kids.length ? [...kids].filter((k) => k.textContent.trim()) : [el];
        for (const k of parts) { let bb; try { bb = k.getBBox(); } catch (e) { continue; } const s0 = k.getStartPositionOfChar ? k.getStartPositionOfChar(0) : { x: bb.x, y: bb.y + bb.height * .8 };
          const anch = getComputedStyle(k).textAnchor; const ax = anch === 'middle' ? bb.x + bb.width / 2 : anch === 'end' ? bb.x + bb.width : s0.x;
          const kcs = getComputedStyle(k); const P = T(ax, s0.y);
          prims.push({ t: 'text', x: +P[0].toFixed(2), y: +P[1].toFixed(2), a: anch, txt: k.textContent.replace(/\s+/g, ' ').trim(), fs: +(parseFloat(kcs.fontSize) * sc).toFixed(2), fw: kcs.fontWeight, ff: /mono/i.test(kcs.fontFamily) ? 'mono' : /serif/i.test(kcs.fontFamily) && !/sans/i.test(kcs.fontFamily) ? 'serif' : 'sans', ls: parseFloat(kcs.letterSpacing) || 0, it: kcs.fontStyle === 'italic', tt: kcs.textTransform, rot: +(Math.atan2(M.b, M.a) * 180 / Math.PI).toFixed(1), f: rgb(kcs.fill) || st.f, o: st.o }); }
        continue;
      }
      let pts = null, closed = false, extra = {};
      if (t === 'line') pts = [T(el.x1.baseVal.value, el.y1.baseVal.value), T(el.x2.baseVal.value, el.y2.baseVal.value)];
      else if (t === 'rect') { const x = el.x.baseVal.value, y = el.y.baseVal.value, w = el.width.baseVal.value, h = el.height.baseVal.value; pts = [T(x, y), T(x + w, y), T(x + w, y + h), T(x, y + h)]; closed = true; extra.rx = (el.rx.baseVal.value || 0) * sc; extra.box = 1; }
      else if (t === 'circle' || t === 'ellipse') { const cx = el.cx.baseVal.value, cy = el.cy.baseVal.value, rx = t === 'circle' ? el.r.baseVal.value : el.rx.baseVal.value, ry = t === 'circle' ? rx : el.ry.baseVal.value; const C = T(cx, cy); extra = { cx: C[0], cy: C[1], rx: rx * sc, ry: ry * sc }; closed = true; pts = []; }
      else if (t === 'polygon' || t === 'polyline') { pts = [...el.points].map((q) => T(q.x, q.y)); closed = t === 'polygon'; }
      else if (t === 'path') { const len = el.getTotalLength(); if (!len) continue; const n = Math.min(2400, Math.max(2, Math.ceil(len / 1.5))), stp = len / n; const rings = [[]]; let prev = null; for (let i = 0; i <= n; i++) { const q = el.getPointAtLength(len * i / n); if (prev && Math.hypot(q.x - prev.x, q.y - prev.y) > stp * 2.5 + 0.5) rings.push([]); rings[rings.length - 1].push(T(q.x, q.y)); prev = q; } const rr = rings.filter((r) => r.length > 1); if (!rr.length) continue; const dd = el.getAttribute('d') || ''; closed = /z/i.test(dd); pts = rr[0]; if (rr.length > 1) extra.h = rr.slice(1); }
      prims.push(Object.assign({ t: t === 'circle' || t === 'ellipse' ? 'ell' : 'poly', p: pts.map((q) => [+q[0].toFixed(2), +q[1].toFixed(2)]), c: closed }, extra.cx != null ? { cx: +extra.cx.toFixed(2), cy: +extra.cy.toFixed(2), rx: +extra.rx.toFixed(2), ry: +extra.ry.toFixed(2) } : {}, extra.rx ? { rx: +extra.rx.toFixed(2) } : {}, extra.box ? { box: 1 } : {}, extra.h ? { h: extra.h.map((r) => r.map((q) => [+q[0].toFixed(2), +q[1].toFixed(2)])), fr: getComputedStyle(el).fillRule } : {}, st));
    }
    let fc = null; for (let n = svg; n && n.nodeType === 1; n = n.parentElement) { const bc = getComputedStyle(n).backgroundColor; const m = /rgba?\(([^)]+)\)/.exec(bc); if (m) { const v = m[1].split(',').map(Number); if (v.length < 4 || v[3] > .5) { fc = bc; break; } } }
    return { vb: [vb.x, vb.y, vb.width, vb.height], ground: rgb(fc), n: prims.length, prims };
  }, L.sel);
  out[p.slug] = r; console.log(p.code, r.err || (r.n + ' primitives, vb ' + r.vb.join(' ')));
}
for (const p of plates) { const r = out[p.slug]; if (!r || r.err || !r.n) continue; const L = Object.values(p.lift)[0];
  fs.writeFileSync(ROOT + '/techniques-templates/plates/' + p.slug + '/rd-figure.js', `/* ${p.code} · ${p.title} · the figure measured from ${L.rt} ${L.sel} (${r.n} primitives, viewBox ${r.vb.join(' ')}). Measured by _build/qa/capture-svg.mjs, a headless read of the source page; see _build/engines/reading-diagram.js. */\nwindow.RD_FIG=${JSON.stringify([{ vb: r.vb, ground: r.ground || [255, 255, 255], prims: r.prims }])};\n`); }
await b.close(); close();
