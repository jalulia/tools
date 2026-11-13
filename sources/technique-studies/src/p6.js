/* ===== PLATE 06 · GRADIENT ORBS =====
   a chain of equal opaque discs, each a freeform gradient: its own rim color, a shared core color reached
   through soft arc-shaped ghost regions (offset circles blurred σ≈20 px), lit on the last disc by a pale
   highlight, a black shade and a cool spot; hard anti-aliased edges; one fine luminance grain over all. */
(function () {
  const REF = { w: 1199, h: 1696 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), img = g.createImageData(W, H), d = img.data;
    const gr = C.ground; for (let i = 0; i < d.length; i += 4) { d[i] = gr[0]; d[i + 1] = gr[1]; d[i + 2] = gr[2]; d[i + 3] = 255; }
    const rnd = mulberry(P.seed * 2654435 + 101), n = Math.max(1, Math.round(P.discs)), R = P.radius * W, sd = P.seed | 0;
    /* 1 — the chain: equal discs stepping down the sheet, wandering sideways; later discs lie on top */
    const margin = .058 * H, discs = [];
    let dir = rnd() < .5 ? -1 : 1, px = 0;
    const stepY = n > 1 ? Math.min(P.step * R, (H - 2 * margin - 2 * R) / (n - 1)) : 0, y0 = (H - stepY * (n - 1)) / 2;
    for (let i = 0; i < n; i++) {
      const w = P.wander * R, jx = (rnd() - .5) * .5;
      if (i) { px = dir * (.35 + rnd() * .65) * w + jx * w; if (rnd() < .65) dir = -dir; }
      const x = clamp(W / 2 + px, R + 8 * u, W - R - 8 * u), col = C.discs[i % C.discs.length];
      /* inside a disc: soft red pools, some cut sharp by an arc (an offset circle about the disc's size). Two pools on either side of one arc leave a crease of rim color between them */
      const arcs = []; for (let k = 0; k < 3; k++) arcs.push({ th: rnd() * 6.2832, rr: .85 + rnd() * .3, vt: (rnd() - .5) * 1.2, inS: rnd() < .5, lr: .7 + rnd() * .6 });
      const pools = []; for (let k = 0; k < 6; k++) pools.push({ th: rnd() * 6.2832, rho: Math.sqrt(rnd()), sz: .7 + rnd() * .6, sf: .7 + rnd() * .5 });
      discs.push({ x, y: y0 + i * stepY, col, arcs, pools, thr: rnd() * 6.2832, rv: .35 + rnd() * .5, bo: .1 + .2 * hashI(i, 3, sd), lit: i === n - 1 });
    }
    /* each disc's exposed side points away from the disc laid over it; every arc is a circle through a point on that side, so the creases fall where they can be seen */
    discs.forEach((D, i) => { const Nx = discs[i + 1]; D.vx = Nx ? Math.atan2(D.y - Nx.y, D.x - Nx.x) : -Math.PI / 2; });
    /* 2 — one grain field: position-hashed noise softened to the source's lag-1 correlation and normalized to σ 1. It jitters the
       distance every pixel reads its ramp at (the dither of the gradients) and screens every tone. */
    const sg = Math.max(0, (P.grainSize ?? 2.2) * u), N = new Float32Array(W * H), gsd = sd + 977 * Math.floor((P.phase || 0) * 240); /* the grain boils with the phase, as film grain changes frame to frame; at rest it is fixed */
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) N[i] = hashI(x, y, gsd) + hashI(x, y, gsd + 7) - 1;
    const B = sg >= .3 ? gblur(N, W, H, sg) : N; let bv = 0; for (let i = 0; i < B.length; i += 7) bv += B[i] * B[i]; const bn = 1 / Math.sqrt(bv / Math.ceil(B.length / 7) || 1);
    /* 3 — per disc: m = union of the pools (1 − Π(1 − m_k)), each pool a dome m_k = 1 − (1 − t)^1.5 on t = (s − r)/(soft·s); times the same
       ramp restarted from every arc (the creases) and from the disc's edge, so the disc's own color holds its edge and every arc */
    const nA = Math.round(P.arcs), nP = Math.round(P.pools), Lc = P.crease * u, e = Math.max(.3, P.edge * u), glass = P.glass, jit = P.jitter * u * bn, ph = (P.phase || 0) * 6.2832;
    const eLo = P.eh ?? -.24, eHi = .45 + P.hiSize, rl = -.2, rcs = Math.cos(rl + ph), rsn = Math.sin(rl + ph), pt = .12, pcs = Math.cos(pt), psn = Math.sin(pt);
    const dome = q => q >= 1 ? 0 : Math.pow(1 - q, 1.3), ramp = t => t >= 1 ? 1 : t <= 0 ? 0 : 1 - Math.pow(1 - t, 1.5);
    for (const D of discs) {
      const base = D.col, core = [0, 1, 2].map(c => C.core[c] + (base[c] - C.core[c]) * (P.tint ?? 0));
      const A = D.arcs.slice(0, nA).map(a => { const va = D.vx + a.vt * 2.2 + ph, vd = (.25 + .5 * Math.abs(a.vt)) * P.reach * R, vx = D.x + Math.cos(va) * vd, vy = D.y + Math.sin(va) * vd, r = a.rr * R; return { x: vx + Math.cos(a.th + ph) * r, y: vy + Math.sin(a.th + ph) * r, r, li: Lc * (a.inS ? 1 : (P.creaseRatio ?? 3)) * a.lr, lo: Lc * (a.inS ? (P.creaseRatio ?? 3) : 1) * a.lr }; });
      const PL = D.pools.slice(0, nP).map(q => { const sz = q.sz * P.poolSize * R; return { x: D.x + Math.cos(q.th + ph) * q.rho * P.spread * R, y: D.y + Math.sin(q.th + ph) * q.rho * P.spread * R, s: sz, L: sz * q.sf * P.poolSoft }; });
      /* the base pool: one wide soft dome 0.1 to 0.3 R off center, so no part of a disc is flat rim color */
      if (P.base > 0) { const bs = P.base * R; PL.push({ x: D.x + Math.cos(D.thr + Math.PI + ph) * D.bo * R, y: D.y + Math.sin(D.thr + Math.PI + ph) * D.bo * R, s: bs, L: bs }); }

      const x0 = Math.max(0, Math.floor(D.x - R - e)), x1 = Math.min(W - 1, Math.ceil(D.x + R + e)), yA = Math.max(0, Math.floor(D.y - R - e)), yB = Math.min(H - 1, Math.ceil(D.y + R + e));
      for (let y = yA; y <= yB; y++) for (let x = x0; x <= x1; x++) {
        const X = x + .5, Y = y + .5, dx = X - D.x, dy = Y - D.y, dc = Math.hypot(dx, dy), cov = 1 - sstep(R - e * .5, R + e * .5, dc); if (cov <= 0) continue;
        const i = y * W + x, j = B[i] * jit;
        let keep = 1;
        for (const q of PL) { const mk = ramp((q.s - Math.hypot(X - q.x, Y - q.y) + j) / q.L); if (mk > 0) keep *= 1 - mk; }
        /* every arc is a crease through the pools: the ramp restarts from it, short on one side, long on the other */
        let cr = 1; for (const a of A) { const rho = Math.hypot(X - a.x, Y - a.y) - a.r; cr *= ramp(Math.abs(rho) / (rho < 0 ? a.li : a.lo)); }
        /* rim ramp: from the disc's own edge, longer on one side of the disc than the other */
        const Lr = P.rimLen * u * (1 + D.rv * Math.cos(Math.atan2(dy, dx) - D.thr - ph)), mc = (1 - keep) * cr * ramp((R - dc) / Lr) * P.core;
        let r = base[0] + (core[0] - base[0]) * mc, gg = base[1] + (core[1] - base[1]) * mc, b = base[2] + (core[2] - base[2]) * mc;
        if (D.lit) { /* the last disc is a glossy sphere reflecting one simple room: a cool zenith, the base color for the sky, a pale band
             just above the horizon, a dark floor below it. Each pixel reads the room along its reflected ray; grazing rays keep the base color */
          const nx = dx / R, ny = dy / R, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)), rx = 2 * nz * nx, ry = 2 * nz * ny, rz = 2 * nz * nz - 1;
          const rx2 = rx * rcs + ry * rsn, ry2 = -rx * rsn + ry * rcs, el = -(ry2 * pcs - rz * psn), h = P.highlight * sstep(eLo, eLo + (P.ehW ?? .4), el) * (1 - sstep(eHi - .5, eHi, el)) * (1 - sstep(.84, 1, dc / R)) * Math.exp(-(((rx2 + .2) / 1.3) ** 2));
          const rr = dc / R, fr = sstep(.8, .99, rr), sp = (P.spot > 0 ? 1 : 0) * sstep(1 - .22 * P.spot, 1.07 - .1 * P.spot, el) * (1 - fr), sh = P.shade * sstep(-.14, -.66, el) * (.72 + .28 * sstep(-.8, .5, rx2)) * (1 - fr), hh = h * (1 - Math.pow(1 - nz, 2.2) * .85);
          r += (C.hi[0] - r) * hh; gg += (C.hi[1] - gg) * hh; b += (C.hi[2] - b) * hh;
          r += (C.spot[0] - r) * sp; gg += (C.spot[1] - gg) * sp; b += (C.spot[2] - b) * sp;
          r += (C.shade[0] - r) * sh; gg += (C.shade[1] - gg) * sh; b += (C.shade[2] - b) * sh;
        }
        const o = i * 4;
        if (glass > 0) { r += (r * d[o] / 255 - r) * glass; gg += (gg * d[o + 1] / 255 - gg) * glass; b += (b * d[o + 2] / 255 - b) * glass; }
        d[o] += (r - d[o]) * cov; d[o + 1] += (gg - d[o + 1]) * cov; d[o + 2] += (b - d[o + 2]) * cov;
      }
    }
    /* 4 — the same grain field screens every tone */
    if (P.grain > 0) { const gn = P.grain * bn; for (let i = 0, o = 0; i < N.length; i++, o += 4) { const nz = B[i] * gn; d[o] = clamp(d[o] + nz, 0, 255); d[o + 1] = clamp(d[o + 1] + nz, 0, 255); d[o + 2] = clamp(d[o + 2] + nz, 0, 255); } }
    g.putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p6", no: "06", title: "Gradient Orbs", ref: REF, render,
    line: "Equal opaque discs stepping down a sheet, each a ramp from its rim color to a shared red that gathers in soft pools and restarts along arcs; the last disc reflects a simple room; one grain jitters the ramps.",
    params: [
      { key: "discs", label: "Discs", min: 4, max: 8, step: 1, def: 6, unit: "", group: "Chain", why: "How many discs step down the sheet. The chain is re-spaced to fit." },
      { key: "radius", label: "Disc radius", min: .14, max: .34, step: .001, def: .2385, unit: "of width", group: "Chain", why: "Radius of every disc. All discs are the same size, as in the source: 286 px on a 1199 px sheet." },
      { key: "step", label: "Step", min: .3, max: 1.3, step: .01, def: .65, unit: "× R", group: "Chain", why: "Vertical distance between neighbors. Below 1 they overlap; the lower disc always lies on top. Measured 0.51 to 0.73 R." },
      { key: "wander", label: "Wander", min: 0, max: 1, step: .01, def: .6, unit: "× R", group: "Chain", why: "How far the chain drifts sideways as it descends. The source's centers swing 0.15 to 0.6 R between neighbors." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 7, unit: "", group: "Chain", why: "Re-rolls the drift, the arcs inside each disc and the side each rim ramp is long on." },
      { key: "pools", label: "Pools", min: 0, max: 6, step: 1, def: 4, unit: "", group: "Gradient", why: "Soft pools of the core red inside each disc. Their union, 1 − Π(1 − m), is how far a pixel moves from the rim color to the core." },
      { key: "base", label: "Base pool", min: 0, max: 2, step: .01, def: .9, unit: "× R", group: "Gradient", why: "Radius of one wide soft pool per disc, 0.1 to 0.3 R off center on the side opposite the long rim ramp. It keeps every rim moving toward the core from its very edge, as the source's do. 0 removes it." },
      { key: "poolSize", label: "Pool size", min: .15, max: 1.5, step: .01, def: .6, unit: "× R", group: "Gradient", why: "Radius of the pools, 0.7 to 1.3 times this. Measured: the orange disc's three pools run 0.35 to 0.6 R across." },
      { key: "poolSoft", label: "Pool falloff", min: .2, max: 1.5, step: .01, def: .92, unit: "× size", group: "Gradient", why: "Length of each pool's ramp as a share of its radius: m = 1 − (1 − t)^1.5. Near 1 the pool is a soft dome; small values give a flat red plate with a short edge." },
      { key: "spread", label: "Pool spread", min: 0, max: 1, step: .01, def: .65, unit: "× R", group: "Gradient", why: "How far from the disc's center the pools may sit." },
      { key: "arcs", label: "Arcs", min: 0, max: 3, step: 1, def: 2, unit: "", group: "Gradient", why: "Offset circles about the disc's size. Each is a crease: the ramp to the core restarts from it on both sides, so where it crosses a pool a thin line of rim color cuts the red." },
      { key: "reach", label: "Arc reach", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Gradient", why: "Every arc is a circle 0.85 to 1.15 R across that passes through a point 0.45 R out on the disc's exposed side (away from the disc laid over it), so the creases fall where they show. This scales that 0.45 R." },
      { key: "crease", label: "Crease ramp", min: 4, max: 200, step: 1, def: 30, unit: "px", group: "Gradient", why: "Length of the ramp on the sharp side of a crease, 0.7 to 1.3 times this. Measured: the pink disc's crease goes from rim color to full red in about 40 px on its sharp side." },
      { key: "rimLen", label: "Rim ramp", min: 5, max: 300, step: 1, def: 30, unit: "px", group: "Gradient", why: "Length of the ramp in from each disc's edge, 0.35 to 0.85 longer on one side of the disc than the other." },
      { key: "core", label: "Core strength", min: 0, max: 1, step: .01, def: 1, unit: "", group: "Gradient", why: "How fully the ramps reach the shared core red. 0 leaves flat rim-colored discs." },
      { key: "highlight", label: "Highlight", min: 0, max: 1, step: .01, def: .95, unit: "", group: "Light", why: "Strength of the pale highlight on the last disc." },
      { key: "hiSize", label: "Highlight size", min: .15, max: .9, step: .01, def: .45, unit: "× R", group: "Light", why: "How high into the reflected sky the pale band reaches: it runs from just above the horizon up to 0.4 plus this in elevation, fading over its top 0.5. At 0.4 it ends under the cool spot, as in the source." },
      { key: "shade", label: "Shade", min: 0, max: 1, step: .01, def: .9, unit: "", group: "Light", why: "The near-black shade on the last disc: a terminator band at 0.7 R plus a flat blob under the highlight, fitted to the source with rmse 0.07." },
      { key: "spot", label: "Cool spot", min: 0, max: 2, step: .01, def: .9, unit: "", group: "Light", why: "How far down the reflected sky the cool zenith color reaches: at 0.9 it begins 0.8 up in elevation, an ellipse about 0.66 by 0.28 R at the top of the last disc, as measured." },
      { key: "edge", label: "Edge", min: .5, max: 14, step: .1, def: 1.5, unit: "px", group: "Surface", why: "Width of the disc edge. Measured 1 to 2 px: the discs are cut, not blurred." },
      { key: "glass", label: "Glass", min: 0, max: 1, step: .01, def: 0, unit: "", group: "Surface", why: "Lets a disc multiply with what lies beneath it. Measured 0: the source discs are opaque." },
      { key: "jitter", label: "Dither", min: 0, max: 8, step: .05, def: 1.35, unit: "px", group: "Surface", why: "σ of the grain-field offset each pixel reads its ramp at. It puts the grain where the ramp is steep: high-pass σ about 1.1 in the mint-to-red mix, 0.4 in the flat red." },
      { key: "grain", label: "Grain", min: 0, max: 4, step: .05, def: .5, unit: "σ", group: "Surface", why: "Luminance grain screened over every tone by the same field. Measured 0.3 on the ground." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. Turns every arc, every rim ramp and the light around its disc by one revolution; the grain boils as it goes." }
    ],
    bench: { palette: "measured", params: {}, note: "The chain is generated, so each disc patch sits at the same offset from the matching disc's center as in the source: the olive disc's top pool (search.py agreed within 8 px), the mint disc's upper right edge, the first disc's left edge over the ground, the lit disc's highlight.", items: [
      { name: "ground", ref: [20, 20, 150, 300], out: [20, 20, 150, 300], m: ["hist", "mean", "std", "spec", "ink"], inks: [[240, 235, 229]], inkNames: ["ground"] },
      { name: "flat core", ref: [548, 708, 96, 96], out: [704, 708, 96, 96], m: ["hist", "mean", "std", "spec", "ac"], lags: 8 },
      { name: "rim ramp", ref: [856, 372, 96, 96], out: [826, 330, 96, 96], m: ["hist", "mean", "std", "ink"], inks: [[179, 203, 172], [253, 4, 55]], inkNames: ["mint rim", "red core"] },
      { name: "cut edge", ref: [200, 300, 128, 160], out: [249, 299, 128, 160], m: ["hist", "mean", "std", "ink", "share"], inks: [[240, 235, 229], [253, 116, 189]], inkNames: ["ground", "pink"] },
      { name: "highlight", ref: [420, 1190, 220, 200], out: [375, 1186, 220, 200], m: ["hist", "mean", "std", "ink"], inks: [[255, 205, 234], [245, 20, 60]], inkNames: ["highlight", "red"] },
      { name: "whole plate", ref: [0, 0, 1199, 1696], out: [0, 0, 1199, 1696], m: ["hist", "mean", "ink", "share"], inks: [[240, 235, 229], [245, 15, 55], [253, 116, 189], [254, 156, 8], [138, 92, 4], [179, 203, 172], [254, 91, 215], [30, 10, 12]], inkNames: ["ground", "red", "pink", "orange", "olive", "mint", "magenta", "shadow"] }
    ] },
    palettes: [
      { id: "measured", name: "Pink red", note: "measured", c: { ground: [236, 236, 235], discs: [[253, 116, 189], [179, 203, 172], [254, 156, 8], [138, 92, 4], [254, 91, 215], [236, 2, 46]], core: [253, 4, 55], hi: [255, 205, 234], shade: [0, 12, 5], spot: [87, 140, 114] }, sw: ["#f0ebe5", "#fd74bd", "#fd0437", "#b3cbac"] },
      { id: "cobalt", name: "Cobalt night", c: { ground: [18, 20, 28], discs: [[40, 90, 255], [90, 220, 240], [150, 80, 255], [190, 255, 80], [235, 240, 250], [10, 30, 120]], core: [20, 40, 200], hi: [255, 255, 255], shade: [0, 0, 8], spot: [255, 120, 60] }, sw: ["#12141c", "#285aff", "#1428c8", "#5adcf0"] },
      { id: "ice", name: "Ice", c: { ground: [246, 248, 251], discs: [[150, 200, 255], [205, 185, 255], [160, 240, 210], [255, 230, 120], [120, 160, 230], [60, 90, 200]], core: [50, 110, 255], hi: [255, 255, 255], shade: [10, 20, 60], spot: [255, 150, 120] }, sw: ["#f6f8fb", "#96c8ff", "#326eff", "#a0f0d2"] },
      { id: "signal", name: "Signal", c: { ground: [236, 236, 238], discs: [[255, 40, 30], [255, 210, 0], [20, 20, 24], [250, 250, 250], [0, 180, 230], [255, 120, 0]], core: [255, 60, 0], hi: [255, 255, 255], shade: [8, 8, 10], spot: [0, 200, 190] }, sw: ["#ececee", "#ff281e", "#ff3c00", "#ffd200"] },
      { id: "graphite", name: "Graphite", c: { ground: [40, 40, 44], discs: [[150, 152, 158], [210, 212, 216], [90, 92, 98], [255, 120, 40], [120, 124, 130], [70, 72, 78]], core: [86, 88, 94], hi: [250, 250, 252], shade: [4, 4, 6], spot: [255, 150, 80] }, sw: ["#28282c", "#96989e", "#56585e", "#ff7828"] },
      { id: "acid", name: "Acid", c: { ground: [250, 250, 250], discs: [[180, 255, 0], [255, 0, 170], [0, 230, 255], [255, 120, 0], [120, 0, 255], [0, 170, 140]], core: [255, 0, 120], hi: [255, 255, 255], shade: [10, 0, 30], spot: [0, 255, 200] }, sw: ["#fafafa", "#b4ff00", "#ff0078", "#00e6ff"] },
      { id: "dusk", name: "Dusk", c: { ground: [28, 24, 40], discs: [[255, 160, 120], [255, 80, 140], [255, 200, 60], [40, 180, 170], [200, 160, 255], [200, 40, 60]], core: [255, 60, 90], hi: [255, 240, 230], shade: [10, 6, 20], spot: [80, 200, 180] }, sw: ["#1c1828", "#ffa078", "#ff3c5a", "#28b4aa"] }
    ],
    motion: [{ key: "phase", amp: 1, period: 60, mode: "saw" }, { key: "highlight", amp: .15, period: 11, mode: "sine" }, { key: "crease", amp: 8, period: 17, mode: "drift" }],
    live: { x: { key: "phase", min: 0, max: 1 }, y: { key: "poolSize", min: .3, max: 1.1 } },
    presets: [
      { name: "Flat rims", set: { core: 0, highlight: 0, shade: 0, spot: 0 } },
      { name: "Glass", set: { glass: 1, step: .5, arcs: 1, rimLen: 60 } },
      { name: "Beads", set: { discs: 8, step: 1.1, radius: .15, wander: .9, arcs: 3, crease: 12 } },
      { name: "Soft", set: { crease: 120, edge: 14, grain: 2, rimLen: 120, poolSoft: 1.4 } }
    ],
    passes: ["chain: equal discs stepped down the sheet with a seeded sideways swing; each later disc lies on top", "one grain field: position-hashed noise softened 2.2 px and normalized to σ 1; it jitters the distance the pools are read at and screens every tone", "per disc and per pixel: the union of four soft pools and one wide base pool, 1 − Π(1 − m), each pool m = 1 − (1 − t)^1.5; times the same ramp restarted from every arc (short on one side, three times longer on the other) and from the disc's own edge; color = rim color moved toward the core red by that amount", "the last disc only: a glossy sphere reflecting one simple room along each pixel's reflected ray: a pale band from 0.24 below the horizon to 0.9 up, a cool zenith, a dark floor, the base color at grazing angles", "composite in order with a 1.5 px anti-aliased cut edge; Glass, at 0 by default, multiplies a disc with what lies beneath", "the grain field screens the whole sheet at σ 0.5"],
    measured: { disc_radius_px: 286, disc_radius_evidence: "Hough circles on the Lab gradient; all six radii 284 to 288", centers_px: [[548, 383], [685, 557], [727, 766], [557, 913], [469, 1108], [548, 1313]], vertical_step_px: [174, 209, 147, 195, 205], ground: [240, 235, 229], rim_colors: { pink: [253, 116, 189], mint: [179, 203, 172], orange: [254, 156, 8], olive: [138, 92, 4], magenta: [254, 91, 215], red: [236, 2, 46] }, core: [253, 4, 55], blend_rule: "opaque: a rim 6 px inside the mint disc reads (175,210,176) over pink and (172,209,180) over ground", ramp_profile: "hard crease then (1 − d/L)^1.5: L 76 px on the mint disc's soft side; about 25 px on a crease's sharp side", rim_width_by_angle: { mint_disc: "red reached 19 to 24 px in from the edge at −30 to −10 degrees, 51 to 145 px or never elsewhere", method: "L < 120 along 15 radii from the fitted center" }, edge_width_px: "1 to 2", lit_disc: { spot: [87, 140, 114], highlight: [255, 205, 234], shade: [0, 12, 5], order_top_to_bottom: "red rim, cool spot at 0.64 R up, red, pale band from 0.35 R up to 0.1 R down, red, dark floor, red rim 0.15 to 0.2 R wide", method: "crops at 1 and 2 times, row means through the center" }, grain_hp_sigma: { ground: .29, mint_to_red_mix: 1.06, pink_disc: .55, lit_disc: .68, red_core: .41, method: "L minus a 2 px gaussian; it is largest where the ramp is steepest, the mark of a ramp read at a jittered position" }, ink_shares_kmeans: { ground: .58, red: .175, pink: .07, orange: .037, olive: .053, mint: .03, magenta: .029, shadow: .027 } },
    limits: ["Bench mean 0.962, lowest 0.77 (rim ramp histogram). The chain and its pools are generated, so four disc patches are matched by place in the matching disc, not by pixel. The rim ramp patch scores 0.77 to 0.93 on its histogram and contrast: the source's mint disc has one narrow rim where a red pool runs to within 20 px of the edge, and the generated mint disc reaches red 44 to 64 px in; the nearest honest spot was used.", "The lit disc is a reflection model, not the source's hand-placed blobs: its highlight patch scores 0.89 on histogram and contrast because the source's pale band is wider at its center.", "The source's ground is a warm light gray (240, 235, 229); every palette here, the measured one included, uses a neutral ground of the same lightness (236, 236, 235). That costs the ground color metric about 0.01.", "The source is a JPEG whose 8 px blocks soften its grain: the render's grain is softened 2.2 px to meet the ground spectrum at 0.95."],
    source: "Reference 6: gradient disc poster, 1199 × 1696 px",
    study: { slug: "gradient-orbs", lede: "Six cut discs, each a ramp from its own rim color to a shared red, broken by arcs, the last one a glossy sphere.",
      body: ["The source is a stack of equal circles, 286 px in radius, on a light gray. Each circle is cut hard and filled with a gradient that starts at the disc's own color at the edge and moves toward one shared red, 253 4 55, inside. The red gathers in soft pools. Arcs about the size of the discs cross them: along an arc the ramp starts over, so a thin line of rim color cuts the red, sharp on one side and soft on the other. Where a lower disc crosses an upper one it covers it; a rim reads the same over another disc as over the ground. The last disc is a glossy sphere: a cool spot at the top, a pale band across the middle, a dark floor below, a red rim all round. The grain is strongest where the ramp is steepest, σ 1.1 in the mint-to-red mix against 0.3 on the ground.", "The rebuild steps equal discs down the sheet and computes each pixel's ramp amount: the union of soft pools and one wide base pool, times the same ramp restarted from every arc and from the disc's own edge. One grain field jitters the distance the pools are read at, so the grain lands on the ramps, and screens the whole sheet. The last disc reflects a simple room along each pixel's reflected ray. Pools, Pool size, Pool falloff and Base pool set where the red gathers; Arcs, Arc reach and Crease ramp set the cuts; Rim ramp holds each disc's color at its edge; Highlight, Shade and Cool spot set the sphere; Phase turns the arcs and the light once round."],
      method: "Hough circles · rim sampling inside and outside each edge · ramp profiles along radii · high-pass σ by region · k-means shares",
      points: [
        { u: .25, v: .22, d: "KEY", label: "Cut edge: the disc color meets the ground in 1.5 px with no halo.", t: "edge", dir: [-1, 0] },
        { u: .5, v: .17, d: "KEY", label: "Crease: an arc where the ramp starts over, rim color on the line, red reached in about 30 px on its sharp side.", t: "pull", dir: [0, -1] },
        { u: .6, v: .26, d: "READ", label: "Mix: halfway along the ramp the mint and the red average to a dusty rose; the grain is densest here.", t: "grain", dir: [1, -1] },
        { u: .33, v: .41, d: "KEY", label: "Two yellow creases on the orange disc, each cutting a red pool.", t: "pull", dir: [-1, 0] },
        { u: .63, v: .44, d: "READ", label: "Pool: the shared red 253 4 55 where no arc or edge is near; only the grain moves.", t: "grain", dir: [1, 0] },
        { u: .45, v: .49, d: "READ", label: "Overlap: the lower disc covers the upper one fully; its rim is the same over a disc as over the ground.", t: "edge", dir: [0, -1] },
        { u: .39, v: .755, d: "KEY", label: "Pale band: the reflected sky from 0.24 below the horizon to 0.9 up, fading over its bottom 0.4, brightest left of center.", t: "light", dir: [-1, 0] },
        { u: .46, v: .875, d: "KEY", label: "Dark floor: rays that reflect below the horizon read near black 0 12 5.", t: "light", dir: [1, 1] },
        { u: .42, v: .665, d: "READ", label: "Cool spot: the zenith, 87 140 114, at the top of the sphere.", t: "light", dir: [0, -1] },
        { u: .08, v: .6, d: "READ", label: "Ground: 240 235 229 with a grain of σ 0.3.", t: "grain", dir: [-1, 0] }
      ] }
  });
})();
