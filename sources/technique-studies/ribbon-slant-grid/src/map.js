/* map.js · the same frame, drawn as orthographic elevations: front (x·y), top (x·z), side (z·y), and the camera's own view axis.
   Ink centerline, band edges, a tick every 30 samples for the band direction, travel in a light line, the spheres, and the camera. */
"use strict";
const MAP = (() => {
  const INK = '#111513', MID = 'rgba(17,21,19,.42)', LIGHT = 'rgba(17,21,19,.16)', GREEN = '#126B3D', VIOLET = '#563EA8';
  const VIEWS = [
    { id: 'front', label: 'Front · x y', u: p => p.x, v: p => p.y, ur: [40, 1160], vr: [-20, 700] },
    { id: 'top', label: 'Top · x z', u: p => p.x, v: p => -p.z, ur: [40, 1160], vr: [-380, 380] },
    { id: 'side', label: 'Side · z y', u: p => p.z, v: p => p.y, ur: [-380, 380], vr: [-20, 700] }
  ];
  function draw(cv, F, dpr) {
    const x = cv.getContext('2d'), W = cv.width, H = cv.height; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
    const pad = 14 * dpr, lab = 22 * dpr, gap = 18 * dpr;
    // layout: front wide on top; top and side below
    // third-angle layout: top above front, side to the right of front, rows and columns aligned as projection lines
    const wa = Math.round((W - gap) * .8), h1 = Math.round((H - gap) * .45);
    let boxes = [[0, h1 + gap, wa, H - h1 - gap], [0, 0, wa, h1], [wa + gap, h1 + gap, W - wa - gap, H - h1 - gap]];
    if (W < H * 1.2) { const r1 = Math.round((H - 2 * gap) * .3), r2 = Math.round((H - 2 * gap) * .38); boxes = [[0, r1 + gap, W, r2], [0, 0, W, r1], [0, r1 + r2 + 2 * gap, W, H - r1 - r2 - 2 * gap]]; }
    // one scale for all three elevations (as in a drafting sheet), each view centered on what it shows
    const S0 = F.s, bnd = VIEWS.map(V => { let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9; for (let i = 0; i < S0.length; i += 3) { const p = S0[i]; if (p.a < .05) continue;
      for (const sg of [-1, 1]) { const q = { x: p.x + p.bx * p.w / 2 * sg, y: p.y + p.by * p.w / 2 * sg, z: p.z + p.bz * p.w / 2 * sg }, u = V.u(q), v = V.v(q); u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); } }
      if (F.guide) { v0 = V.id === 'top' ? v0 : Math.min(v0, F.guide.asc); v1 = V.id === 'top' ? v1 : Math.max(v1, F.guide.desc); }
      return [u0, u1, v0, v1]; });
    let SC = 1e9; VIEWS.forEach((V, k) => { const [bx, by, bw, bh] = boxes[k], b2 = bnd[k]; SC = Math.min(SC, (bw - pad * 2) / Math.max(1, b2[1] - b2[0]) * .92, (bh - lab - pad * 2) / Math.max(1, b2[3] - b2[2]) * .9); });
    VIEWS.forEach((V, k) => { const [bx, by, bw, bh] = boxes[k];
      x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip();
      x.strokeStyle = LIGHT; x.lineWidth = 1; x.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
      x.fillStyle = MID; x.font = `500 ${10.5 * dpr}px "Geist Mono", ui-monospace, monospace`; x.textBaseline = 'top'; x.fillText(V.label.toUpperCase(), bx + pad, by + pad * .8);
      const ix = bx + pad, iy = by + lab + pad, iw = bw - pad * 2, ih = bh - lab - pad * 2;
      const sc = SC, b2 = bnd[k];
      const cu = ix + iw / 2 - (b2[0] + b2[1]) / 2 * sc, cv2 = iy + ih / 2 - (b2[2] + b2[3]) / 2 * sc;
      const P = p => [cu + V.u(p) * sc, cv2 + V.v(p) * sc];
      // axis of the coil
      x.strokeStyle = LIGHT; x.setLineDash([]); x.beginPath(); const a0 = P({ x: 60, y: G.AX.cy, z: 0 }), a1 = P({ x: 1140, y: G.AX.cy, z: 0 }); x.moveTo(a0[0], a0[1]); x.lineTo(a1[0], a1[1]); x.stroke();
      // the guide sheet, in the front view: ascender, x-height, baseline, descender, and a slant line through every stroke slot
      if (V.id === 'front' && F.guide) { const g = F.guide; x.lineWidth = 1; x.strokeStyle = 'rgba(86,62,168,.5)';
        for (const yy of [g.asc, g.xtop, g.base, g.desc]) { const p0 = P({ x: 40, y: yy, z: 0 }), p1 = P({ x: 1160, y: yy, z: 0 }); x.beginPath(); x.moveTo(p0[0], Math.round(p0[1]) + .5); x.lineTo(p1[0], Math.round(p1[1]) + .5); x.stroke(); }
        x.strokeStyle = 'rgba(86,62,168,.28)'; for (const X0 of g.X) { const t = Math.tan(g.slant), p0 = P({ x: X0 + (g.mid - g.asc) * t, y: g.asc, z: 0 }), p1 = P({ x: X0 - (g.desc - g.mid) * t, y: g.desc, z: 0 }); x.beginPath(); x.moveTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.stroke(); } }
      // band edges
      const S = F.s, n = S.length;
      for (const sgn of [1, -1]) { x.strokeStyle = GREEN; x.globalAlpha = .55; x.lineWidth = 1 * dpr; x.beginPath(); let on = false;
        for (let i = 0; i < n; i++) { const p = S[i]; if (p.a < .05) { on = false; continue; } const q = P({ x: p.x + p.bx * p.w / 2 * sgn, y: p.y + p.by * p.w / 2 * sgn, z: p.z + p.bz * p.w / 2 * sgn }); if (!on) { x.moveTo(q[0], q[1]); on = true; } else x.lineTo(q[0], q[1]); } x.stroke(); }
      x.globalAlpha = 1;
      // travel, then ink centerline
      x.lineWidth = 1 * dpr; x.strokeStyle = LIGHT; x.beginPath(); for (let i = 0; i < n; i++) { const q = P(S[i]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); } x.stroke();
      x.strokeStyle = INK; x.lineWidth = 1.25 * dpr; x.beginPath(); let on = false;
      for (let i = 0; i < n; i++) { const p = S[i]; if (p.a < .05) { on = false; continue; } const q = P(p); if (!on) { x.moveTo(q[0], q[1]); on = true; } else x.lineTo(q[0], q[1]); } x.stroke();
      // band direction ticks
      x.strokeStyle = GREEN; x.lineWidth = 1 * dpr; x.beginPath();
      for (let i = 0; i < n; i += 30) { const p = S[i]; if (p.a < .05) continue; const q0 = P({ x: p.x - p.bx * p.w / 2, y: p.y - p.by * p.w / 2, z: p.z - p.bz * p.w / 2 }), q1 = P({ x: p.x + p.bx * p.w / 2, y: p.y + p.by * p.w / 2, z: p.z + p.bz * p.w / 2 }); x.moveTo(q0[0], q0[1]); x.lineTo(q1[0], q1[1]); }
      x.stroke();
      // spheres
      if (F.sphA > .05) { const tt = F.tittleSphere || 0, ti = G.wm(251.5, 18.5); x.strokeStyle = VIOLET; x.lineWidth = 1 * dpr;
        G.spheres().forEach(s => { const q = P({ x: s.x + (ti[0] - s.x) * tt, y: s.y + (ti[1] - s.y) * tt, z: 0 }); x.beginPath(); x.arc(q[0], q[1], Math.max(1.5 * dpr, (s.r + (15 - s.r) * tt) * sc), 0, 6.2832); x.stroke(); }); }
      // the camera, in the top and side views: a line of sight from the viewer
      if (V.id !== 'front') { const az = F.cam.az * Math.PI / 180, el = F.cam.el * Math.PI / 180, L = 330;
        const L2 = 120 / SC * (F.s.length ? .5 : 1); const dir = V.id === 'top' ? { x: Math.sin(az) * L2, y: 0, z: Math.cos(az) * L2 } : { x: 0, y: -Math.sin(el) * L2, z: Math.cos(el) * L2 };
        const c0 = P({ x: G.AX.cx, y: G.AX.cy, z: 0 }), c1 = P({ x: G.AX.cx + dir.x, y: G.AX.cy + dir.y, z: dir.z });
        x.strokeStyle = VIOLET; x.lineWidth = 1.25 * dpr; x.beginPath(); x.moveTo(c0[0], c0[1]); x.lineTo(c1[0], c1[1]); x.stroke();
        x.fillStyle = VIOLET; x.beginPath(); x.arc(c1[0], c1[1], 3.2 * dpr, 0, 6.2832); x.fill();
        x.font = `500 ${10 * dpr}px "Geist Mono", ui-monospace, monospace`; x.textBaseline = 'middle'; x.fillText('EYE', c1[0] + 7 * dpr, c1[1]); }
      x.restore(); });
  }
  /* axis traces for one route: every axis over the route's time, 0–1000, with the playhead */
  const TRACE = [['COIL', 0, 1000], ['NIBA', 0, 1000], ['NIBR', 0, 1000], ['slnt', -14, 0], ['DPTH', 0, 1000], ['cam', 0, 90]];
  const cache = {};
  function traces(route) { if (cache[route.id]) return cache[route.id]; const out = TRACE.map(() => []); for (let i = 0; i <= 120; i++) { const t = i / 120, A = route.f(t).axes; TRACE.forEach((T, k) => out[k].push(A[T[0]] === undefined ? null : A[T[0]])); } return cache[route.id] = out; }
  function drawTrace(cv, route, t, dpr) {
    const x = cv.getContext('2d'), W = cv.width, H = cv.height; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
    const tr = traces(route), rows = TRACE.length, lw = 54 * dpr, rh = H / rows;
    TRACE.forEach((T, k) => { const y0 = k * rh, d = tr[k];
      x.fillStyle = MID; x.font = `500 ${10.5 * dpr}px "Geist Mono", ui-monospace, monospace`; x.textBaseline = 'middle'; x.fillText(T[0], 0, y0 + rh / 2);
      x.strokeStyle = LIGHT; x.lineWidth = 1; x.beginPath(); x.moveTo(lw, y0 + rh - .5); x.lineTo(W, y0 + rh - .5); x.stroke();
      x.strokeStyle = INK; x.lineWidth = 1.25 * dpr; x.beginPath(); let on = false;
      d.forEach((v, i) => { if (v === null) return; const f = (v - T[1]) / (T[2] - T[1]), px = lw + (W - lw) * i / 120, py = y0 + rh - 4 * dpr - f * (rh - 9 * dpr); on ? x.lineTo(px, py) : x.moveTo(px, py); on = true; }); x.stroke(); });
    const px = lw + (W - lw) * t; x.strokeStyle = GREEN; x.lineWidth = 1.5 * dpr; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, H); x.stroke();
  }
  return { draw, drawTrace, TRACE };
})();
