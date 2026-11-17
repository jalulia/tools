/* reading-diagram · shared engine for the "Diagram of an argument" plates (PL-67…80). Appended to each plate's study.js
   by _build/plates.py after that plate's rd-figure.js (window.RD_FIG: the figure measured from jalulia.github.io/capschiz
   by its own geometry: every line, box, pole, arrow and label, in the figure's viewBox units).
   The engine redraws that geometry with the technique's dials: how heavy the lines are, how ruled or hand-drawn,
   how round the boxes, how big the arrowheads, whether tones are solid or hatched, and how large the type. */
(function (S) {
  'use strict';
  var FIGS = window.RD_FIG || [];
  /* the plate is cut to the figure: one panel takes the figure's own shape, so nothing of the old screenshot's caption and controls is left as empty sheet */
  if (S.panels.length === 1 && FIGS[0]) { var p0 = S.panels[0], vb0 = FIGS[0].vb; p0.h = +(p0.w * vb0[3] / vb0[2]).toFixed(2); S.ref = { w: 1000, h: Math.round(p0.y * 2 + p0.h) }; }
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var read = (S.spec.techniques || [])[0] || {};
  var TECH = [
    { id: 'reading-diagram', short: 'DOAA', name: 'Diagram of an argument', layer: 1, pass: 1, atoms: ['line', 'box', 'arrow', 'label'],
      params: {
        weight: leaf(1, 0.4, 3, 0.05, 'Line weight', '×', 'Every stroke of the figure at this multiple of its measured width.'),
        hand: leaf(0, 0, 4, 0.05, 'Hand', 'u', 'How far a line may wander from its ruled path, in figure units. 0 is ruled; higher redraws every line, box and pole by hand.'),
        corner: leaf(0, 0, 24, 0.5, 'Box corners', 'u', 'Corner radius of every box, in figure units. A box drawn round in the source keeps at least its own.'),
        arrow: leaf(1, 0.4, 3, 0.05, 'Arrowheads', '×', 'Size of the arrowheads on directed lines, as a multiple of a head 7 strokes long.'),
        hatch: leaf(0, 0, 1, 0.01, 'Tone as hatching', '', '0 fills every toned shape solid; 1 lays the same tone as hatching; between, both.'),
        gap: leaf(4, 1.5, 14, 0.25, 'Hatch spacing', 'u', 'Distance between hatch lines, in figure units.'),
        angle: leaf(45, 0, 180, 1, 'Hatch angle', '°', 'Direction of the hatch lines.'),
        type: leaf(1, 0.7, 1.6, 0.01, 'Type size', '×', 'Every label at this multiple of its measured size, from its own anchor.'),
        seed: leaf(7, 1, 99, 1, 'Seed', '', 'Re-rolls the hand: where each line wanders.')
      },
      implementation: (read.implementation || 'Each claim of the text is drawn as boxes, poles and arrows with a numbered caption.') + ' The geometry is measured from the source figure; the engine redraws it with weight, hand, corners, arrowheads, hatched tone and type size as dials.' }
  ];
  var keep = (S.spec.techniques || []).filter(function (t) { return t.id !== 'reading-diagram'; });
  S.spec.techniques = TECH.concat(keep);
  S.spec.pass_order = ['ground · plate', 'tone · fills, solid or hatched', 'line · every stroke, ruled or by hand', 'arrowheads', 'labels'];
  S.body = [S.body[0], 'The figure is redrawn here from its own geometry, measured from the source page: every box, pole, arrow and label. The dials change how it is drawn: line weight, a ruled or hand line, box corners, arrowhead size, tone as solid fill or hatching, and type size.'];
  S.paramsHint = 'How the diagram is drawn. Figure units are the source figure’s own.';
  S.liveOnLoad = false; delete S.live;

  /* seeded smooth noise along a line */
  function hash(n, s) { var h = Math.imul((n | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x85EBCA6B); h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35); h ^= h >>> 16; return (h >>> 0) / 4294967296 * 2 - 1; }
  function noise(x, s) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, s) * (1 - u) + hash(i + 1, s) * u; }
  /* a polyline redrawn by hand: subdivided every ~5 units and pushed off its path along the normal */
  function wobble(pts, closed, amt, seed) {
    if (!amt) return pts;
    var out = [], acc = 0, n = pts.length, segs = closed ? n : n - 1;
    for (var k = 0; k < segs; k++) {
      var A = pts[k], B = pts[(k + 1) % n], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, m = Math.max(1, Math.ceil(L / 5));
      for (var j = 0; j < m; j++) { var t = j / m, d = acc + L * t, o = noise(d / 22, seed) * amt + noise(d / 7, seed + 9) * amt * .35; out.push([A[0] + dx * t + nx * o, A[1] + dy * t + ny * o]); }
      acc += L;
    }
    if (!closed) { var Z = pts[n - 1], o2 = noise(acc / 22, seed) * amt; var P = pts[n - 2] || Z, dx2 = Z[0] - P[0], dy2 = Z[1] - P[1], L2 = Math.hypot(dx2, dy2) || 1; out.push([Z[0] - dy2 / L2 * o2, Z[1] + dx2 / L2 * o2]); }
    return out;
  }
  function roundRect(p, r) { /* p: 4 corners of a rect, clockwise from top-left */
    var x0 = Math.min(p[0][0], p[2][0]), y0 = Math.min(p[0][1], p[2][1]), x1 = Math.max(p[0][0], p[2][0]), y1 = Math.max(p[0][1], p[2][1]); r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
    if (r <= 0.3) return p; var out = [], arc = function (cx, cy, a0) { for (var i = 0; i <= 6; i++) { var a = a0 + i / 6 * Math.PI / 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    arc(x1 - r, y0 + r, -Math.PI / 2); arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI); return out;
  }
  function ellPts(e) { var out = [], n = Math.max(24, Math.min(96, Math.round((e.rx + e.ry) * .6))); for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; out.push([e.cx + Math.cos(a) * e.rx, e.cy + Math.sin(a) * e.ry]); } return out; }
  function lum(c) { return (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255; }

  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    var A = window.ART.params(S.spec, overrides || {}), Q = A['reading-diagram'];
    var x = canvas.getContext('2d'), W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h;
    var paper = V.paper || '#FFFFFF', pr = parseInt(paper.slice(1), 16), dark = lum([pr >> 16 & 255, pr >> 8 & 255, pr & 255]) < .45;
    var col = function (c, a) { if (!c) return null; var r = c[0], g = c[1], b = c[2]; if (dark) { r = 255 - r; g = 255 - g; b = 255 - b; } return 'rgba(' + r + ',' + g + ',' + b + ',' + ((c.length > 3 ? c[3] : 1) * (a == null ? 1 : a)).toFixed(3) + ')'; };
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = paper; x.fillRect(0, 0, W, H);
    S.panels.forEach(function (p, i) {
      var F = FIGS[i]; if (!F) return;
      var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, vb = F.vb, k = Math.min(bw / vb[2], bh / vb[3]), ox = bx + (bw - vb[2] * k) / 2 - vb[0] * k, oy = by + (bh - vb[3] * k) / 2 - vb[1] * k;
      x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip();
      if (F.ground && !dark) { x.fillStyle = col(F.ground); x.fillRect(bx, by, bw, bh); }
      x.setTransform(k, 0, 0, k, ox, oy); x.lineJoin = 'round';
      var seed = Q.seed | 0, minW = 0.6 / k;
      F.prims.forEach(function (e, n) {
        if (e.t === 'text') return;
        var pts = e.t === 'ell' ? ellPts(e) : (e.box ? roundRect(e.p, Math.max(e.rx || 0, Q.corner)) : e.p);
        var hp = wobble(pts, e.c, Q.hand, seed + n * 17);
        var path = function (q, cl) { x.beginPath(); q.forEach(function (pt, j) { if (j) x.lineTo(pt[0], pt[1]); else x.moveTo(pt[0], pt[1]); }); if (cl) x.closePath(); };
        /* tone: solid, hatched, or both */
        if (e.f && e.c) {
          var solid = 1 - Q.hatch, fo = (e.fo == null ? 1 : e.fo) * e.o;
          var light = lum(e.f) > .93;   /* paper-colored fills stay solid: they knock out what is behind */
          var bbx = hp.reduce(function (m, q) { return [Math.min(m[0], q[0]), Math.min(m[1], q[1]), Math.max(m[2], q[0]), Math.max(m[3], q[1])]; }, [1e9, 1e9, -1e9, -1e9]);
          if (Math.min(bbx[2] - bbx[0], bbx[3] - bbx[1]) < Q.gap * 3) solid = 1;   /* a dot or a tick is too small to hatch: it stays a mark */
          if (light || solid > 0) { path(hp, true); x.fillStyle = col(e.f, light ? fo : fo * solid); x.fill(); }
          if (!light && solid < 1) {
            x.save(); path(hp, true); x.clip();
            var xs = hp.map(function (q) { return q[0]; }), ys = hp.map(function (q) { return q[1]; }), mx = Math.min.apply(null, xs), Mx = Math.max.apply(null, xs), my = Math.min.apply(null, ys), My = Math.max.apply(null, ys);
            var cx = (mx + Mx) / 2, cy = (my + My) / 2, R = Math.hypot(Mx - mx, My - my) / 2 + 2, a = Q.angle * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), g = Q.gap;
            x.strokeStyle = col(e.f, fo * Q.hatch); x.lineWidth = Math.max(minW, Math.min(g * .45, 1.1 * Q.weight)); x.beginPath();
            for (var t = -R; t <= R; t += g) { var px = cx - dy * t, py = cy + dx * t; x.moveTo(px - dx * R, py - dy * R); x.lineTo(px + dx * R, py + dy * R); }
            x.stroke(); x.restore();
          }
        }
        /* line */
        if (e.s && e.w > 0) {
          path(hp, e.c); x.strokeStyle = col(e.s, (e.so == null ? 1 : e.so) * e.o); x.lineWidth = Math.max(minW, e.w * Q.weight); x.lineCap = e.cap || 'butt';
          x.setLineDash(e.d ? e.d.map(function (d) { return d * Math.max(.5, Q.weight); }) : []); x.stroke(); x.setLineDash([]);
          /* arrowheads, where the source marked the line */
          var head = function (P, B) { var dx = P[0] - B[0], dy = P[1] - B[1], L = Math.hypot(dx, dy) || 1, s = Math.max(5, e.w * 7) * Q.arrow * .8, ux = dx / L, uy = dy / L;
            x.beginPath(); x.moveTo(P[0], P[1]); x.lineTo(P[0] - ux * s - uy * s * .45, P[1] - uy * s + ux * s * .45); x.lineTo(P[0] - ux * s + uy * s * .45, P[1] - uy * s - ux * s * .45); x.closePath(); x.fillStyle = col(e.s, e.o); x.fill(); };
          if (e.me && hp.length > 1) head(hp[hp.length - 1], hp[Math.max(0, hp.length - 3)]);
          if (e.ms && hp.length > 1) head(hp[0], hp[Math.min(hp.length - 1, 2)]);
        }
      });
      /* labels last, over the lines */
      F.prims.forEach(function (e) {
        if (e.t !== 'text') return;
        var fam = e.ff === 'mono' ? '"JetBrains Mono", ui-monospace, monospace' : e.ff === 'serif' ? 'Georgia, "Times New Roman", serif' : 'Inter, "Helvetica Neue", Arial, sans-serif';
        x.save(); x.translate(e.x, e.y); if (e.rot) x.rotate(e.rot * Math.PI / 180);
        x.font = (e.it ? 'italic ' : '') + (e.fw || 400) + ' ' + (e.fs * Q.type).toFixed(2) + 'px ' + fam; x.textAlign = e.a === 'middle' ? 'center' : e.a === 'end' ? 'right' : 'left'; x.textBaseline = 'alphabetic';
        if ('letterSpacing' in x) x.letterSpacing = (e.ls * Q.type).toFixed(2) + 'px';
        x.fillStyle = col(e.f || [21, 20, 24], e.o); x.fillText(e.tt === 'uppercase' ? e.txt.toUpperCase() : e.txt, 0, 0); x.restore();
      });
      x.setTransform(1, 0, 0, 1, 0, 0); x.restore();
      x.strokeStyle = V.rule; x.lineWidth = Math.max(1, u * .8); x.strokeRect(Math.round(bx) + .5, Math.round(by) + .5, Math.round(bw) - 1, Math.round(bh) - 1);
    });
    if (done) done();
    return false;
  };
})(window.STUDY);
