/* guide.js · the guide sheet over the render: ascender, x-height, baseline and descender lines, a slant line through every
   stroke slot, and a nib ladder in nib widths. Lines lie in the z = 0 plane and go through the same camera as the ribbon.
   Seen down the axis, the sheet becomes a square cell with its diagonals and centerlines (the rice-character practice grid). */
"use strict";
const GUIDE = (() => {
  function draw(c, F, opt) {
    const x = c.getContext('2d'), W = c.width, H = c.height; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
    const g = F.guide; if (!g || opt.alpha <= 0) return;
    const s = Math.min(W / G.STAGE.w, H / G.STAGE.h) * (F.cam.zoom || 1), ox = W / 2 - (G.AX.cx + (F.cam.shift || 0)) * s, oy = H / 2 - (G.STAGE.h / 2) * s, Fz = R.focal(F.cam);
    const P = p => { const q = R.project(p, F.cam, Fz); return [ox + q[0] * s, oy + q[1] * s]; };
    const lw = Math.max(1, Math.round(s * .9)), light = opt.light;
    const ink = a => light ? `rgba(17,21,19,${a})` : `rgba(236,238,236,${a})`, vio = a => light ? `rgba(86,62,168,${a})` : `rgba(183,156,242,${a})`;
    const A = opt.alpha, endOn = Math.abs(Math.sin(F.cam.az * Math.PI / 180));
    x.lineWidth = lw; x.font = `500 ${Math.max(9, 10.5 * s)}px "Geist Mono", ui-monospace, monospace`; x.textBaseline = 'middle';
    const line = (a, b) => { x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); };
    const X0 = g.X.length ? g.X[0] - 4.2 * g.n : 140, X1 = g.X.length ? g.X[g.X.length - 1] + 3.2 * g.n : 1060;
    const fa = A * (1 - endOn);
    if (fa > .01) {
      // horizontal guides
      [['asc', g.asc, .34], ['x-height', g.xtop, .5], ['baseline', g.base, .62], ['desc', g.desc, .34]].forEach(([n, yy, a]) => {
        if (n !== 'baseline' && n !== 'x-height' && Math.abs(yy - (n === 'asc' ? g.xtop : g.base)) < 1) return;
        x.strokeStyle = ink(a * fa); line(P({ x: X0, y: yy, z: 0 }), P({ x: X1, y: yy, z: 0 }));
        x.fillStyle = ink(.62 * fa); const q = P({ x: X1, y: yy, z: 0 }), tw = x.measureText(n.toUpperCase()).width; x.fillText(n.toUpperCase(), Math.min(q[0] + 8 * s, W - tw - 10), q[1] - (n === 'desc' || n === 'baseline' ? -7 : 7) * s); });
      // slant lines through the stroke slots
      const t = Math.tan(g.slant); x.strokeStyle = vio(.42 * fa);
      g.X.forEach(X => line(P({ x: X + (g.mid - g.asc) * t, y: g.asc, z: 0 }), P({ x: X - (g.desc - g.mid) * t, y: g.desc, z: 0 })));
      // nib ladder: one square per nib width, stacked from the baseline, alternating sides, turned to the nib angle
      const L = (g.X.length ? g.X[0] : X0) - 2.4 * g.n, n = g.n, steps = [];
      const fr = (v, k) => Math.max(0, Math.min(1, v - k));
      for (let k = 0; k < g.xh - .01; k++) steps.push([g.base - k * n, .55, fr(g.xh, k), -1]);
      for (let k = 0; k < g.ascN - .01; k++) steps.push([g.xtop - k * n, .3, fr(g.ascN, k), -1]);
      for (let k = 0; k < g.descN - .01; k++) steps.push([g.base + k * n, .3, fr(g.descN, k), 1]);
      // the ladder: squares one nib wide, stacked and alternating, as a calligrapher rules it with the pen held square; a part square closes a fractional count
      if (g.n < 120) steps.forEach(([y0, a, f, dir], k) => { const cx = L - (k % 2) * n, hh = n / 2, e = Math.min(1.2, n * .04);
        const ya = y0, yb = y0 + dir * n * f, top = Math.min(ya, yb) + e, bot = Math.max(ya, yb) - e;
        const pts = [[cx - hh + e, top], [cx + hh - e, top], [cx + hh - e, bot], [cx - hh + e, bot]].map(([u, v]) => P({ x: u, y: v, z: 0 }));
        x.fillStyle = ink(a * .3 * fa); x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fill(); });
      // numbers
      x.fillStyle = ink(.72 * fa); const q = P({ x: X0, y: g.desc + n * .9, z: 0 }); q[0] = Math.max(12, q[0]);
      x.fillText(`X ${g.xh.toFixed(2)} · ASC ${g.ascN.toFixed(2)} · DESC ${g.descN.toFixed(2)} NIB WIDTHS · NIB ${Math.round(g.nib * 180 / Math.PI)}° · SLANT ${Math.round(g.slant * 180 / Math.PI)}°`, q[0], q[1] + 10 * s);
    }
    if (endOn > .6) {
      // the axis view: a square cell around the coil's rings, with its diagonals and centerlines
      const a = A * (endOn - .6) / .4, top = Math.min(g.asc, g.xtop), bot = Math.max(g.desc, g.base), half = (bot - top) / 2 + g.n * .6, cy = (top + bot) / 2;
      const c0 = P({ x: G.AX.cx, y: cy, z: 0 }); const k = s * (1 / (1)) ;
      const r = half * s, cx = c0[0], cyy = oy + cy * s;
      x.strokeStyle = ink(.5 * a); x.strokeRect(cx - r, cyy - r, 2 * r, 2 * r);
      x.strokeStyle = ink(.26 * a); line([cx - r, cyy], [cx + r, cyy]); line([cx, cyy - r], [cx, cyy + r]); line([cx - r, cyy - r], [cx + r, cyy + r]); line([cx + r, cyy - r], [cx - r, cyy + r]);
      x.fillStyle = ink(.62 * a); x.fillText('AXIS VIEW · SQUARE CELL, DIAGONALS, CENTERLINES', cx - r, cyy + r + 14 * s);
    }
  }
  return { draw };
})();
