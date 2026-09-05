/* Register · view — the plate: viewport, rendering, hit-testing, drawing tools.
 *
 * One coordinate story throughout. Everything in the document is normalised 0–1 over the
 * source; the viewport is the only place that becomes pixels, so a document survives a
 * change of source size, a crop, or a different display.
 */

import { r4, clamp, expand, handles, moveHandle, movePrim, geomOf, items, layerSpec, profileOf, isClosed } from './core.js';

const HANDLE = 4.5;      // css px, half-size
const HIT = 7;           // css px
const RULER = 16;

export class View {
  constructor(cv, S) {
    this.cv = cv; this.S = S;
    this.ctx = cv.getContext('2d');
    this.scale = 1; this.ox = 0; this.oy = 0;
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.cursor = null; this.drag = null; this.space = false; this.panning = null;
    this.loupe = true; this.needFit = true;
    this._bind();
    this.resize();
    new ResizeObserver(() => this.resize()).observe(cv.parentElement);
  }

  /* ------------------------------------------------------------ geometry */
  get W() { return (this.S.doc.image && this.S.doc.image.w) || 1000; }
  get H() { return (this.S.doc.image && this.S.doc.image.h) || 1000; }
  sx(u) { return this.ox + u * this.W * this.scale; }
  sy(v) { return this.oy + v * this.H * this.scale; }
  toU(x, y) { return { u: (x - this.ox) / (this.W * this.scale), v: (y - this.oy) / (this.H * this.scale) }; }

  resize() {
    const r = this.cv.parentElement.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.cv.width = Math.max(1, Math.round(r.width * this.dpr));
    this.cv.height = Math.max(1, Math.round(r.height * this.dpr));
    this.cw = r.width; this.ch = r.height;
    if (this.needFit) this.fit(); else this.draw();
  }
  fit() {
    const pad = 34 + RULER;
    const s = Math.min((this.cw - pad * 2) / this.W, (this.ch - pad * 2) / this.H);
    this.scale = s > 0 ? s : 1;
    this.ox = (this.cw - this.W * this.scale) / 2;
    this.oy = (this.ch - this.H * this.scale) / 2;
    this.needFit = false; this.draw();
  }
  zoomAt(f, x, y) {
    const s0 = this.scale, s1 = clamp(s0 * f, 0.05, 64);
    if (s1 === s0) return;
    this.ox = x - (x - this.ox) * (s1 / s0);
    this.oy = y - (y - this.oy) * (s1 / s0);
    this.scale = s1; this.draw();
  }
  setZoom(s) { this.zoomAt(s / this.scale, this.cw / 2, this.ch / 2); }

  /* -------------------------------------------------------------- picking */
  activeItems() { return items(this.S.doc, this.S.layer); }
  activeSpec() { return layerSpec(this.S.doc, this.S.layer); }

  hitHandle(x, y) {
    const L = this.activeSpec(); if (!L) return null;
    const list = this.activeItems();
    for (let pi = list.length - 1; pi >= 0; pi--) {
      const hs = handles(list[pi], L);
      for (let vi = 0; vi < hs.length; vi++) {
        if (Math.abs(this.sx(hs[vi][0]) - x) <= HIT && Math.abs(this.sy(hs[vi][1]) - y) <= HIT) return { pi, vi };
      }
    }
    return null;
  }
  hitSegment(x, y) {
    const L = this.activeSpec(); if (!L || L.geom === 'point') return null;
    const list = this.activeItems(); let best = null, bd = HIT + 1;
    list.forEach((it, pi) => {
      const g = geomOf(it, L); const pts = Array.isArray(g) ? g : (g && g.pts);
      if (!pts || pts.length < 2) return;
      for (let i = 1; i < pts.length; i++) {
        const ax = this.sx(pts[i - 1][0]), ay = this.sy(pts[i - 1][1]);
        const bx = this.sx(pts[i][0]), by = this.sy(pts[i][1]);
        const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy; if (!len) continue;
        let t = ((x - ax) * dx + (y - ay) * dy) / len; t = clamp(t, 0, 1);
        const d = Math.hypot(ax + dx * t - x, ay + dy * t - y);
        if (d < bd) { bd = d; best = { pi, vi: i }; }
      }
    });
    return best;
  }
  hitBody(x, y) {
    const L = this.activeSpec(); if (!L) return null;
    const list = this.activeItems();
    for (let pi = list.length - 1; pi >= 0; pi--) {
      const pts = L.geom === 'point' ? null : expand(geomOf(list[pi], L), this.W, this.H);
      if (!pts || pts.length < 3 || !isClosed(pts)) continue;
      const { u, v } = this.toU(x, y);
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
        if (((yi > v) !== (yj > v)) && (u < (xj - xi) * (v - yi) / (yj - yi) + xi)) inside = !inside;
      }
      if (inside) return { pi, vi: 0 };
    }
    return null;
  }

  snapUV(u, v) {
    const e = this.S.doc.editor;
    if (!e.snap || !e.grid) return { u: r4(u), v: r4(v) };
    const g = e.grid;
    return { u: r4(Math.round(u / g) * g), v: r4(Math.round(v / g) * g) };
  }

  /* --------------------------------------------------------- interaction */
  _bind() {
    const cv = this.cv;
    cv.addEventListener('wheel', e => {
      e.preventDefault();
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (e.ctrlKey || e.metaKey) this.zoomAt(Math.pow(1.0025, -e.deltaY), x, y);
      else { this.ox -= e.deltaX; this.oy -= e.deltaY; this.draw(); }
    }, { passive: false });

    cv.addEventListener('pointerdown', e => this.onDown(e));
    cv.addEventListener('pointermove', e => this.onMove(e));
    addEventListener('pointerup', e => this.onUp(e));
    cv.addEventListener('pointerleave', () => { this.cursor = null; this.draw(); });
    cv.addEventListener('dblclick', e => { if (this.S.draft) this.finishDraft(); });
    cv.addEventListener('contextmenu', e => e.preventDefault());
  }
  local(e) { const r = this.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  onDown(e) {
    const { x, y } = this.local(e);
    if (this.space || e.button === 1) { this.panning = { x, y, ox: this.ox, oy: this.oy }; this.cv.setPointerCapture(e.pointerId); return; }
    const S = this.S, L = this.activeSpec(); if (!L) return;
    const raw0 = this.toU(x, y); const { u, v } = this.snapUV(raw0.u, raw0.v);
    const tool = S.tool;

    if (tool === 'v') {
      const h = this.hitHandle(x, y);
      if (h) { S.sel = h; S.onSelect(); S.onEditBegin('move point');
        this.drag = { kind: 'handle', pi: h.pi, vi: h.vi, whole: e.altKey, u, v };
        this.cv.setPointerCapture(e.pointerId); this.draw(); return; }
      const seg = this.hitSegment(x, y);
      if (seg) {
        if (e.altKey) { S.sel = { pi: seg.pi, vi: 0 }; S.onSelect(); S.onEditBegin('move shape');
          this.drag = { kind: 'handle', pi: seg.pi, vi: 0, whole: true, u, v };
          this.cv.setPointerCapture(e.pointerId); this.draw(); return; }
        S.onEditBegin('insert point');
        const it = this.activeItems()[seg.pi]; const g = geomOf(it, L);
        const pts = Array.isArray(g) ? g : g.pts;
        pts.splice(seg.vi, 0, [u, v]);
        S.sel = { pi: seg.pi, vi: seg.vi }; S.onSelect(); S.onEdit('insert point');
        this.drag = { kind: 'handle', pi: seg.pi, vi: seg.vi, whole: false, u, v };
        this.cv.setPointerCapture(e.pointerId); this.draw(); return;
      }
      const body = this.hitBody(x, y);
      if (body) { S.sel = body; S.onSelect(); S.onEditBegin('move shape');
        this.drag = { kind: 'handle', pi: body.pi, vi: 0, whole: true, u, v };
        this.cv.setPointerCapture(e.pointerId); this.draw(); return; }
      S.sel = null; S.onSelect(); this.draw(); return;
    }

    if (tool === 't') { S.onEditBegin('add point');
      const list = items(S.doc, S.layer, true);
      if (L.max && list.length >= L.max) { S.toast(`${L.label}: ${L.max} is the limit`); return; }
      const it = { u, v }; if (L.fields) for (const f of L.fields) if (f.t === 'int') it[f.k] = 0;
      list.push(it); S.sel = { pi: list.length - 1, vi: 0 }; S.onSelect(); S.onEdit('add point'); this.draw(); return; }

    if (tool === 'p') {
      if (!S.draft) { S.draft = { kind: 'pen', pts: [[u, v]] }; }
      else S.draft.pts.push([u, v]);
      this.draw(); return;
    }
    if (tool === 'r' || tool === 'c' || tool === 'l') {
      S.draft = { kind: tool, a: [u, v], b: [u, v] };
      this.cv.setPointerCapture(e.pointerId); this.draw(); return;
    }
  }

  onMove(e) {
    const { x, y } = this.local(e);
    this.cursor = { x, y };
    const S = this.S;
    if (this.panning) { this.ox = this.panning.ox + (x - this.panning.x); this.oy = this.panning.oy + (y - this.panning.y); this.draw(); return; }
    const raw = this.toU(x, y);
    S.onCursor(raw.u, raw.v);
    if (this.drag) {
      const L = this.activeSpec(); const it = this.activeItems()[this.drag.pi]; if (!it) return;
      const { u, v } = this.snapUV(raw.u, raw.v);
      if (this.drag.whole) movePrim(it, L, u - this.drag.u, v - this.drag.v);
      else moveHandle(it, L, this.drag.vi, u, v);
      this.drag.u = u; this.drag.v = v;
      S.onEditLive(); this.draw(); return;
    }
    if (S.draft && (S.draft.kind === 'r' || S.draft.kind === 'c' || S.draft.kind === 'l')) {
      const { u, v } = this.snapUV(raw.u, raw.v); S.draft.b = [u, v]; this.draw(); return;
    }
    if (S.tool === 'v') {
      const h = this.hitHandle(x, y);
      const was = S.hover; S.hover = h;
      this.cv.style.cursor = h ? 'move' : (this.hitSegment(x, y) ? 'copy' : 'crosshair');
      if (JSON.stringify(was) !== JSON.stringify(h)) this.draw(); else if (this.loupe) this.draw();
      return;
    }
    this.cv.style.cursor = 'crosshair';
    this.draw();
  }

  onUp(e) {
    if (this.panning) { this.panning = null; return; }
    if (this.drag) { this.drag = null; this.S.onEdit('move'); this.draw(); return; }
    const S = this.S, d = S.draft;
    if (d && (d.kind === 'r' || d.kind === 'c' || d.kind === 'l')) {
      const L = this.activeSpec();
      const du = d.b[0] - d.a[0], dv = d.b[1] - d.a[1];
      let geo = null;
      if (d.kind === 'r') {
        const x0 = Math.min(d.a[0], d.b[0]), x1 = Math.max(d.a[0], d.b[0]);
        const y0 = Math.min(d.a[1], d.b[1]), y1 = Math.max(d.a[1], d.b[1]);
        if (Math.abs(x1 - x0) < 0.004 || Math.abs(y1 - y0) < 0.004) { S.draft = null; this.draw(); return; }
        geo = [[r4(x0), r4(y0)], [r4(x1), r4(y0)], [r4(x1), r4(y1)], [r4(x0), r4(y1)], [r4(x0), r4(y0)]];
      } else if (d.kind === 'c') {
        const r = Math.hypot(du, dv * this.H / this.W); if (r < 0.004) { S.draft = null; this.draw(); return; }
        geo = { circle: [r4(d.a[0]), r4(d.a[1]), r4(r)] };
      } else {
        if (Math.abs(du) < 0.004 || Math.abs(dv) < 0.004) { S.draft = null; this.draw(); return; }
        geo = { ellipse: [r4(d.a[0]), r4(d.a[1]), r4(Math.abs(du)), r4(Math.abs(dv))] };
      }
      S.onEditBegin('draw ' + d.kind);
      this.pushGeom(L, geo);
      S.draft = null; S.onEdit('draw'); this.draw();
    }
  }

  /** put a new geometry into the active layer, wrapping it in a rule if the layer needs one */
  pushGeom(L, geo) {
    const S = this.S, list = items(S.doc, S.layer, true);
    if (L.at) {
      const rule = {}; rule[L.at] = geo;
      if (L.id === 'plate') { rule.angle = 45; rule.ruled = true; }
      if (L.id === 'force') rule.band = 2;
      if (L.id === 'dark') { rule.t = 0.3; rule.tMax = 8; rule.massMin = 150; rule.minChain = 8; }
      list.push(rule);
    } else if (L.geom === 'poly' && !Array.isArray(geo)) {
      list.push(expand(geo, this.W, this.H).map(p => [r4(p[0]), r4(p[1])]));
    } else list.push(geo);
    S.sel = { pi: list.length - 1, vi: 0 }; S.onSelect();
  }

  finishDraft(close) {
    const S = this.S, d = S.draft; if (!d || d.kind !== 'pen') return;
    if (d.pts.length < 2) { S.draft = null; this.draw(); return; }
    const L = this.activeSpec();
    const pts = d.pts.map(p => [r4(p[0]), r4(p[1])]);
    if (close && pts.length > 2) pts.push([pts[0][0], pts[0][1]]);
    S.onEditBegin('draw path');
    this.pushGeom(L, pts);
    S.draft = null; S.onEdit('draw path'); this.draw();
  }
  cancelDraft() { this.S.draft = null; this.draw(); }

  /* ------------------------------------------------------------ rendering */
  draw() {
    const c = this.ctx, S = this.S, dpr = this.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, this.cw, this.ch);
    c.fillStyle = '#f6f5f2'; c.fillRect(0, 0, this.cw, this.ch);

    const W = this.W, H = this.H, sc = this.scale;
    const ix = this.ox, iy = this.oy, iw = W * sc, ih = H * sc;

    // the sheet
    c.save();
    c.fillStyle = '#fff'; c.fillRect(ix, iy, iw, ih);
    if (S.img && S.showImage) {
      c.globalAlpha = S.doc.editor.imageAlpha == null ? 1 : S.doc.editor.imageAlpha;
      c.imageSmoothingEnabled = sc < 3;
      c.drawImage(S.img, ix, iy, iw, ih);
      c.globalAlpha = 1;
    }
    // the plates, in the instrument's own order: spot under hatch under key, multiply
    if (S.showPlates && S.plates) {
      const pl = S.doc.editor.plates || { key: 1, hatch: 1, spot: 1 };
      c.globalCompositeOperation = 'multiply';
      if (S.plates.spot && pl.spot) c.drawImage(S.plates.spot, ix + 1.5, iy + 1.0, iw, ih);   // the trap is a fixed 1.5 / 1.0 px, as on the plate
      if (S.plates.hatch && pl.hatch) c.drawImage(S.plates.hatch, ix, iy, iw, ih);
      if (S.plates.key && pl.key) c.drawImage(S.plates.key, ix, iy, iw, ih);
      c.globalCompositeOperation = 'source-over';
    }
    c.restore();
    c.strokeStyle = '#d9d8d3'; c.lineWidth = 1;
    c.strokeRect(Math.round(ix) + .5, Math.round(iy) + .5, Math.round(iw), Math.round(ih));

    if (!S.img) this.drawEmpty();
    if (S.doc.editor.grid && S.showGrid) this.drawGrid();
    if (S.showGeom !== false) this.drawGeom();
    if (S.doc.editor.mirror != null) this.drawMirror();
    this.drawDraft();
    this.drawRulers();
    if (this.loupe && this.cursor && S.img && sc < 6) this.drawLoupe();
  }

  /* nothing loaded yet — say the one thing to do rather than showing an empty grey box */
  drawEmpty() {
    const c = this.ctx, w = this.cw, h = this.ch;
    const bw = Math.min(420, w - 80), bh = Math.min(190, h - 80);
    const bx = (w - bw) / 2, by = (h - bh) / 2;
    c.save();
    c.strokeStyle = '#c9c8c2'; c.lineWidth = 1.5; c.setLineDash([7, 5]);
    c.strokeRect(Math.round(bx) + .5, Math.round(by) + .5, Math.round(bw), Math.round(bh));
    c.setLineDash([]);
    c.textAlign = 'center';
    c.fillStyle = '#15140F'; c.font = '600 14px -apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif';
    c.fillText('Drop an image here', bx + bw / 2, by + bh / 2 - 8);
    c.fillStyle = '#8a8984'; c.font = '11.5px -apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif';
    c.fillText('or use Image ▾ up top · press ? for how this works', bx + bw / 2, by + bh / 2 + 14);
    c.textAlign = 'left';
    c.restore();
  }

  drawGrid() {
    const c = this.ctx, g = this.S.doc.editor.grid;
    if (!g || g <= 0) return;
    c.save(); c.strokeStyle = 'rgba(30,94,224,.14)'; c.lineWidth = 1; c.beginPath();
    for (let u = 0; u <= 1.0001; u += g) { const x = Math.round(this.sx(u)) + .5; c.moveTo(x, this.sy(0)); c.lineTo(x, this.sy(1)); }
    for (let v = 0; v <= 1.0001; v += g) { const y = Math.round(this.sy(v)) + .5; c.moveTo(this.sx(0), y); c.lineTo(this.sx(1), y); }
    c.stroke(); c.restore();
  }

  drawGeom(mx, my, lw) {
    const c = this.ctx, S = this.S, P = profileOf(S.doc);
    const X = mx || (u => this.sx(u)), Y = my || (v => this.sy(v));
    const width = lw || 1;
    for (const L of P.layers) {
      if (S.hidden && S.hidden.has(L.id)) continue;
      const list = items(S.doc, L.id); if (!list.length) continue;
      const active = L.id === S.layer;
      c.save();
      c.strokeStyle = L.color; c.lineWidth = width * (active ? 1.15 : 1);
      c.globalAlpha = active ? 1 : 0.55;
      for (const it of list) {
        if (L.geom === 'point') { const x = X(it.u), y = Y(it.v);
          c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.moveTo(x, y - 5); c.lineTo(x, y + 5); c.stroke(); continue; }
        const pts = expand(geomOf(it, L), this.W, this.H); if (pts.length < 2) continue;
        c.setLineDash(L.dash || []);
        c.beginPath(); c.moveTo(X(pts[0][0]), Y(pts[0][1]));
        for (let i = 1; i < pts.length; i++) c.lineTo(X(pts[i][0]), Y(pts[i][1]));
        const cl = isClosed(pts) || geomOf(it, L).circle || geomOf(it, L).ellipse;
        if (cl) c.closePath();
        c.stroke();
        if (cl && L.geom === 'poly') { c.globalAlpha = active ? 0.07 : 0.04; c.fillStyle = L.color; c.fill(); c.globalAlpha = active ? 1 : 0.55; }
        c.setLineDash([]);
      }
      // numbers on point layers
      if (L.geom === 'point' && L.number) {
        c.font = '10px ui-monospace,Menlo,monospace'; c.fillStyle = L.color;
        list.forEach((it, i) => c.fillText(String(L.number(i)), X(it.u) + 7, Y(it.v) - 5));
      }
      c.restore();
    }
    this.drawHandles(X, Y);
  }

  drawHandles(X, Y) {
    const c = this.ctx, S = this.S, L = this.activeSpec(); if (!L) return;
    if (S.hidden && S.hidden.has(L.id)) return;
    const list = this.activeItems(), col = L.color;
    list.forEach((it, pi) => {
      const hs = handles(it, L);
      const isSel = S.sel && S.sel.pi === pi;
      hs.forEach((p, vi) => {
        const x = X(p[0]), y = Y(p[1]);
        const sel = isSel && S.sel.vi === vi;
        const hov = S.hover && S.hover.pi === pi && S.hover.vi === vi;
        c.beginPath(); c.rect(x - HANDLE, y - HANDLE, HANDLE * 2, HANDLE * 2);
        c.fillStyle = sel || hov ? col : '#fff'; c.fill();
        c.strokeStyle = col; c.lineWidth = sel ? 1.8 : 1; c.stroke();
        if (sel) { c.beginPath(); c.moveTo(x - 13, y); c.lineTo(x + 13, y); c.moveTo(x, y - 13); c.lineTo(x, y + 13);
          c.lineWidth = .6; c.stroke(); }
      });
    });
  }

  drawDraft() {
    const c = this.ctx, d = this.S.draft; if (!d) return;
    const L = this.activeSpec(); const col = (L && L.color) || '#15140F';
    c.save(); c.strokeStyle = col; c.lineWidth = 1; c.setLineDash([4, 3]);
    if (d.kind === 'pen') {
      c.beginPath(); c.moveTo(this.sx(d.pts[0][0]), this.sy(d.pts[0][1]));
      for (let i = 1; i < d.pts.length; i++) c.lineTo(this.sx(d.pts[i][0]), this.sy(d.pts[i][1]));
      if (this.cursor) c.lineTo(this.cursor.x, this.cursor.y);
      c.stroke();
      c.setLineDash([]);
      for (const p of d.pts) { c.beginPath(); c.rect(this.sx(p[0]) - 3, this.sy(p[1]) - 3, 6, 6); c.fillStyle = '#fff'; c.fill(); c.stroke(); }
    } else if (d.kind === 'r') {
      const x0 = this.sx(Math.min(d.a[0], d.b[0])), y0 = this.sy(Math.min(d.a[1], d.b[1]));
      c.strokeRect(x0, y0, Math.abs(this.sx(d.b[0]) - this.sx(d.a[0])), Math.abs(this.sy(d.b[1]) - this.sy(d.a[1])));
    } else if (d.kind === 'c') {
      const r = Math.hypot(this.sx(d.b[0]) - this.sx(d.a[0]), this.sy(d.b[1]) - this.sy(d.a[1]));
      c.beginPath(); c.arc(this.sx(d.a[0]), this.sy(d.a[1]), r, 0, Math.PI * 2); c.stroke();
    } else if (d.kind === 'l') {
      c.beginPath(); c.ellipse(this.sx(d.a[0]), this.sy(d.a[1]),
        Math.abs(this.sx(d.b[0]) - this.sx(d.a[0])), Math.abs(this.sy(d.b[1]) - this.sy(d.a[1])), 0, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  }

  drawMirror() {
    const c = this.ctx, m = this.S.doc.editor.mirror;
    const x = Math.round(this.sx(m)) + .5;
    c.save(); c.strokeStyle = 'rgba(120,0,200,.55)'; c.lineWidth = 1; c.setLineDash([7, 4]);
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x, this.ch); c.stroke();
    c.setLineDash([]); c.fillStyle = 'rgba(120,0,200,.9)';
    c.font = '9px ui-monospace,Menlo,monospace';
    c.fillText('mirror ' + r4(m).toFixed(4), x + 4, 12 + RULER);
    c.restore();
  }

  drawRulers() {
    const c = this.ctx;
    c.save();
    c.fillStyle = 'rgba(255,255,255,.92)';
    c.fillRect(0, 0, this.cw, RULER); c.fillRect(0, 0, RULER, this.ch);
    c.strokeStyle = '#e5e4df'; c.lineWidth = 1; c.beginPath();
    c.moveTo(0, RULER + .5); c.lineTo(this.cw, RULER + .5); c.moveTo(RULER + .5, 0); c.lineTo(RULER + .5, this.ch); c.stroke();
    c.font = '8.5px ui-monospace,Menlo,monospace'; c.fillStyle = '#8a8984';
    const step = this.scale * this.W > 900 ? 0.05 : 0.1;
    c.strokeStyle = '#c9c8c2'; c.beginPath();
    for (let u = 0; u <= 1.0001; u += step) {
      const x = Math.round(this.sx(u)) + .5; if (x < RULER || x > this.cw) continue;
      const major = Math.abs(u * 10 - Math.round(u * 10)) < 1e-6;
      c.moveTo(x, RULER - (major ? 6 : 3)); c.lineTo(x, RULER);
      if (major) c.fillText(u.toFixed(1), x + 2, 8);
    }
    const stepV = this.scale * this.H > 900 ? 0.05 : 0.1;
    for (let v = 0; v <= 1.0001; v += stepV) {
      const y = Math.round(this.sy(v)) + .5; if (y < RULER || y > this.ch) continue;
      const major = Math.abs(v * 10 - Math.round(v * 10)) < 1e-6;
      c.moveTo(RULER - (major ? 6 : 3), y); c.lineTo(RULER, y);
      if (major) c.fillText(v.toFixed(1), 2, y - 2);
    }
    c.stroke();
    if (this.cursor) {
      c.strokeStyle = '#1E5EE0'; c.beginPath();
      c.moveTo(Math.round(this.cursor.x) + .5, 0); c.lineTo(Math.round(this.cursor.x) + .5, RULER);
      c.moveTo(0, Math.round(this.cursor.y) + .5); c.lineTo(RULER, Math.round(this.cursor.y) + .5);
      c.stroke();
    }
    c.restore();
  }

  /* the magnifier — the only way to place a point to one source pixel on a small source */
  drawLoupe() {
    const c = this.ctx, S = this.S, cur = this.cursor, Z = 6, box = 128;
    const bx = cur.x > this.cw / 2 ? RULER + 10 : this.cw - box - 10, by = RULER + 10;
    const { u, v } = this.toU(cur.x, cur.y);
    const su = (box / 2) / (this.W * this.scale * Z), sv = (box / 2) / (this.H * this.scale * Z);
    c.save();
    c.beginPath(); c.rect(bx, by, box, box); c.clip();
    c.fillStyle = '#fff'; c.fillRect(bx, by, box, box);
    if (S.img) {
      c.imageSmoothingEnabled = false;
      c.globalAlpha = 0.62;
      c.drawImage(S.img, (u - su) * this.W, (v - sv) * this.H, su * 2 * this.W, sv * 2 * this.H, bx, by, box, box);
      c.globalAlpha = 1;
    }
    const LX = n => bx + (n - (u - su)) / (su * 2) * box, LY = n => by + (n - (v - sv)) / (sv * 2) * box;
    this.drawGeom(LX, LY, 1);
    c.strokeStyle = 'rgba(21,20,15,.28)'; c.lineWidth = .5; c.beginPath();
    c.moveTo(bx + box / 2, by); c.lineTo(bx + box / 2, by + box);
    c.moveTo(bx, by + box / 2); c.lineTo(bx + box, by + box / 2); c.stroke();
    c.restore();
    c.strokeStyle = '#15140F'; c.lineWidth = 1; c.strokeRect(bx + .5, by + .5, box, box);
    c.font = '8.5px ui-monospace,Menlo,monospace'; c.fillStyle = '#8a8984';
    c.fillText('×' + Z, bx + 4, by + box - 5);
  }
}
