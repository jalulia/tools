/* ===== PLATE 13 · MEMBRANE =====
   a field of cells from a jittered seed lattice, read through one warped distance field: the signed
   distance to the nearest cell wall gives the fill, the keyline and the black gap in one pass; a
   mint channel network is a second distance field (to a few wandering polylines) that pushes the cells
   aside and takes its own keyline. Fills carry a scanner grain; the whole sheet gets a scan blur and
   an ink gain so every black edge fattens the same way. */
(function () {
  const REF = { w: 850, h: 1200 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 3331 + 7), nA = vnoise(P.seed + 13), nB = vnoise(P.seed + 77);
    const fr = P.frame * W, key = P.keyline * u, kx = key * .5, G = P.cell * u, jit = P.jitter, warpA = P.warp * 18 * u, warpL = 170 * u, rad = P.round * u, gap = P.gap * u, ph = P.phase * 2 * Math.PI;
    /* seeds on a jittered lattice; each has a size weight and a fill */
    const gx = Math.ceil(W / G) + 2, gy = Math.ceil(H / G) + 2, SX = new Float32Array(gx * gy), SY = new Float32Array(gx * gy), SR = new Float32Array(gx * gy), SF = new Uint8Array(gx * gy);
    for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) { const k = j * gx + i, h1 = hashI(i, j, P.seed), h2 = hashI(i, j, P.seed + 1), h3 = hashI(i, j, P.seed + 2); SX[k] = (i - 1 + .5 + (h1 - .5) * jit) * G + ((j & 1) ? G * .5 : 0) * jit; SY[k] = (j - 1 + .5 + (h2 - .5) * jit) * G; SR[k] = (h3 - .5) * G * .45 * P.vary; SF[k] = hashI(i, j, P.seed + 3) < P.green ? 1 : 0; if (hashI(i, j, P.seed + 4) < P.merge) SR[k] = -1e6; }
    /* channels: a few polylines that wander from one edge of the panel to another */
    const rivers = [], nR = Math.round(P.rivers);
    for (let r = 0; r < nR; r++) {
      const pts = [], vertical = r % 2 === 0, n = 7 + (rnd() * 3 | 0), wig = P.wander;
      let a = rnd(), drift = (rnd() - .5) * .4;
      const span = r === 1 ? .72 : 1.12, off = r === 1 ? .1 : -.06;
      for (let i = 0; i < n; i++) { const t = i / (n - 1); a += (rnd() - .5) * .45 * wig + drift * .1; a = clamp(a, .06, .94); const x = vertical ? a * W : (t * span + off) * W, y = vertical ? (t * span + off) * H : a * H; pts.push([x, y]); }
      /* catmull-rom resample into short segments */
      const seg = [];
      for (let i = 0; i < n - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)]; for (let k = 0; k < 6; k++) { const t = k / 6, t2 = t * t, t3 = t2 * t; seg.push([.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); } }
      seg.push(pts[n - 1]);
      rivers.push({ seg, w: P.channel * u * 14 * (.7 + rnd() * .6), phase: rnd() * 9, ends: r === 1 });
    }
    /* seeds inside or near a channel are pushed aside, so the walls between cells follow the channel instead of cells being cut by it */
    const nearRiver = (x, y) => { let best = 1e9, nx = 0, ny = 0, bw = 0; for (const R of rivers) { const sg = R.seg; for (let q = 0; q < sg.length - 1; q++) { const ax = sg[q][0], ay = sg[q][1], bx = sg[q + 1][0], by = sg[q + 1][1], vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1; let t = ((x - ax) * vx + (y - ay) * vy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; const cxp = ax + vx * t, cyp = ay + vy * t, dd = Math.hypot(x - cxp, y - cyp); if (dd < best) { best = dd; nx = x - cxp; ny = y - cyp; bw = R.w; } } } return [best, nx, ny, bw]; };
    if (rivers.length) for (let q = 0; q < gx * gy; q++) { const [dd, nx, ny, bw] = nearRiver(SX[q], SY[q]), reach = bw * 1.6 + key * 2 + G * .3; if (dd < reach) { const m = Math.hypot(nx, ny) || 1, push = (reach - dd) * .85; SX[q] += nx / m * push; SY[q] += ny / m * push; } }
    const img = cv.getContext("2d").createImageData(W, H), d = img.data;
    const n = W * H, F = new Float32Array(n), MASK = new Float32Array(n), RIV = new Float32Array(n);   /* F: fill class (0 gray, 1 green); MASK: 1 where fill, 0 black; RIV: 1 where channel */
    const px0 = fr + key, px1 = W - fr - key, py0 = fr + key, py1 = H - fr - key;
    const sm = (a, b, k) => { const h = clamp(.5 + .5 * (b - a) / k, 0, 1); return b + (a - b) * h - k * h * (1 - h); };   /* smooth min */
    /* channel field on a coarse grid (signed distance to the nearest channel edge), sampled bilinearly */
    const cs = 3 * u, cgw = Math.ceil(W / cs) + 1, cgh = Math.ceil(H / cs) + 1, RD = new Float32Array(cgw * cgh);
    for (let j = 0; j < cgh; j++) for (let i = 0; i < cgw; i++) {
      const x = i * cs, y = j * cs, wx = x + (nA(x / warpL, y / warpL) - .5) * warpA, wy = y + (nB(x / warpL + 5, y / warpL + 3) - .5) * warpA;
      let dr = 1e9;
      for (const R of rivers) { const sg = R.seg; let best = 1e9, bt = 0; for (let q = 0; q < sg.length - 1; q++) { const ax = sg[q][0], ay = sg[q][1], bx = sg[q + 1][0], by = sg[q + 1][1], vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1; let t = ((wx - ax) * vx + (wy - ay) * vy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; const dd = Math.hypot(wx - ax - vx * t, wy - ay - vy * t); if (dd < best) { best = dd; bt = q + t; } } const tt = bt / (sg.length - 1), tap = R.ends ? Math.min(1, (1 - tt) * 4, tt * 4 + .6) : 1, w = R.w * tap * (1 + .45 * Math.sin(bt * .9 + R.phase + ph * .5) + .25 * Math.sin(bt * 2.3 + R.phase * 1.7 - ph * .5)); if (best - w < dr) dr = best - w; }
      RD[j * cgw + i] = dr;
    }
    /* the warp on a 4 px grid, resampled: one field for the walls and the channels */
    const ws = 4 * u, wgw = Math.max(4, Math.ceil(W / ws)), wgh = Math.max(4, Math.ceil(H / ws)), WGX = new Float32Array(wgw * wgh), WGY = new Float32Array(wgw * wgh);
    for (let j = 0; j < wgh; j++) for (let i = 0; i < wgw; i++) { const x = (i + .5) * W / wgw, y = (j + .5) * H / wgh; WGX[j * wgw + i] = (nA(x / warpL, y / warpL) - .5) * warpA + Math.sin(ph + y / (300 * u)) * 2 * u; WGY[j * wgw + i] = (nB(x / warpL + 5, y / warpL + 3) - .5) * warpA + Math.cos(ph + x / (300 * u)) * 2 * u; }
    const WX = upsampleCR(WGX, wgw, wgh, W, H), WY = upsampleCR(WGY, wgw, wgh, W, H);
    const DD = new Float32Array(9), QQ = new Int32Array(9);
    const riverAt = (x, y) => { const fx = x / cs, fy = y / cs, i = Math.min(cgw - 2, fx | 0), j = Math.min(cgh - 2, fy | 0), tx = fx - i, ty = fy - j, o = j * cgw + i; return (RD[o] * (1 - tx) + RD[o + 1] * tx) * (1 - ty) + (RD[o + cgw] * (1 - tx) + RD[o + cgw + 1] * tx) * ty; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = y * W + x;
      if (x < px0 || x >= px1 || y < py0 || y >= py1) { MASK[k] = 0; RIV[k] = (x < fr || x >= W - fr || y < fr || y >= H - fr) ? 1 : 0; continue; }
      /* one warp for everything */
      const wx = x + WX[k], wy = y + WY[k];
      /* nearest seeds (3×3 lattice neighborhood), power distances */
      const ci = Math.floor(wx / G) + 1, cj = Math.floor(wy / G) + 1;
      let d1 = 1e9, i1 = 0, nn = 0;
      for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) { if (i < 0 || j < 0 || i >= gx || j >= gy) continue; const q = j * gx + i, ddx = wx - SX[q], ddy = wy - SY[q], dd = Math.sqrt(ddx * ddx + ddy * ddy) - SR[q]; DD[nn] = dd; QQ[nn++] = q; if (dd < d1) { d1 = dd; i1 = q; } }
      /* signed distance to the cell wall: half the margin over the next seed, smooth-minned over the neighbors so corners round */
      let inside = 1e9;
      for (let t = 0; t < nn; t++) { if (QQ[t] === i1) continue; inside = sm(inside, (DD[t] - d1) * .5, rad); }
      inside += rad * .25 - gap * .5;
      const dr = riverAt(x, y);
      /* the panel edge also pushes cells back with a keyline */
      const edge = Math.min(x - px0, px1 - 1 - x, y - py0, py1 - 1 - y);
      const riv = dr < 0 ? 1 : 0, cellIn = Math.min(inside, dr - key, edge - kx);
      MASK[k] = cellIn > key ? 1 : 0; RIV[k] = riv; F[k] = SF[i1];
    }
    /* ---- scan: soften every edge, then the ink gain fattens the black ---- */
    const V = new Float32Array(n); for (let i = 0; i < n; i++) V[i] = RIV[i] ? 2 : MASK[i];
    const Vb = P.soft > .05 ? gblur(V, W, H, P.soft * u) : V, gain = .5 - P.gain * .18;
    /* ink bleed: a wide, faint darkening of the fills beside every black line */
    const INK = new Float32Array(n); for (let i = 0; i < n; i++) INK[i] = 1 - Math.max(MASK[i], RIV[i]);
    const Bl = P.bleed > .01 ? gblur(INK, W, H, 3.2 * u) : null;
    const paper = C.paper, green = C.green, mint = C.mint, ink = C.ink, gs = P.grainSize * u, ggw = Math.max(4, Math.ceil(W / gs)), ggh = Math.max(4, Math.ceil(H / gs)), GG = new Float32Array(ggw * ggh);
    for (let i = 0; i < GG.length; i++) GG[i] = hashI(i % ggw, i / ggw | 0, P.seed + 21) - .5;
    const GR = upsampleCR(GG, ggw, ggh, W, H);
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      const x = i % W, y = i / W | 0;
      /* fill class is decided before the blur; the blur only moves the edge */
      const m = sstep(gain - .35, gain + .35, Vb[i]), r = sstep(gain + .65, gain + 1.35, Vb[i]);
      const fill = F[i] ? green : paper, gr = GR[i] * P.grain * (F[i] ? 1.5 : 1) * 12 + (hashI(x, y, P.seed + 9) - .5) * P.grain * .6 - (Bl ? Bl[i] * P.bleed * 26 : 0);
      let R = ink[0] + (fill[0] + gr - ink[0]) * m, Gc = ink[1] + (fill[1] + gr - ink[1]) * m, B = ink[2] + (fill[2] + gr - ink[2]) * m;
      R += (mint[0] + gr * .25 - R) * r; Gc += (mint[1] + gr * .25 - Gc) * r; B += (mint[2] + gr * .25 - B) * r;
      d[j] = R; d[j + 1] = Gc; d[j + 2] = B; d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p13", no: "13", title: "Membrane", ref: REF, render,
    line: "Cells from a jittered lattice read through one warped distance field, so fill, keyline and gap come from one number; a channel field pushes the cells aside and takes a keyline of its own.",
    params: [
      { key: "cell", label: "Cell size", min: 40, max: 260, step: 1, def: 105, unit: "px", group: "Cells", why: "Lattice spacing of the seeds. The reference's gray cells have a median equivalent diameter of 87 px." },
      { key: "jitter", label: "Jitter", min: 0, max: 1.2, step: .01, def: 0.9, unit: "×", group: "Cells", why: "How far each seed leaves its lattice point. 0 is a tidy honeycomb." },
      { key: "vary", label: "Size spread", min: 0, max: 1.5, step: .01, def: 1.2, unit: "×", group: "Cells", why: "Per-seed weight: some cells grow at their neighbors' expense." },
      { key: "merge", label: "Merged cells", min: 0, max: .5, step: .01, def: .12, unit: "share", group: "Cells", why: "Share of seeds dropped, so their neighbors grow into one large cell. The reference's largest cells are 4 times the median." },
      { key: "round", label: "Corner radius", min: 0, max: 60, step: .5, def: 18, unit: "px", group: "Cells", why: "Smooth-min softness: how much each corner rounds and how big the black pocket at a junction gets." },
      { key: "warp", label: "Warp", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Cells", why: "Low-frequency bend of the whole field; makes the walls wander." },
      { key: "green", label: "Green share", min: 0, max: 1, step: .01, def: 0.34, unit: "", group: "Cells", why: "Probability that a cell is filled green instead of gray. 30 of 73 in the reference." },
      { key: "gap", label: "Gap", min: 0, max: 30, step: .5, def: 6, unit: "px", group: "Ink", why: "Black space between cell walls before the keylines are added." },
      { key: "keyline", label: "Keyline", min: 1, max: 12, step: .1, def: 4, unit: "px", group: "Ink", why: "Width of the black outline on every cell and channel edge. The reference's measures 4 px." },
      { key: "gain", label: "Ink gain", min: -1, max: 1.5, step: .01, def: .3, unit: "", group: "Ink", why: "Spread of the black into its neighbors after the scan blur, as wet ink does." },
      { key: "bleed", label: "Ink bleed", min: 0, max: 4, step: .01, def: 1.8, unit: "×", group: "Ink", why: "A faint, wide darkening of the fill beside every black line, 3 px out: the ink that wicked into the paper." },
      { key: "soft", label: "Scan blur", min: 0, max: 3, step: .01, def: 1.3, unit: "px", group: "Ink", why: "Softness of every edge; the reference's black-to-gray edges run 2 px from 20 to 80 percent." },
      { key: "grain", label: "Grain", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Ink", why: "Scanner grain in the fills: 3.5 levels on the gray, 5 on the green." },
      { key: "grainSize", label: "Grain size", min: 1, max: 8, step: .1, def: 2.8, unit: "px", group: "Ink", why: "Scale of that grain." },
      { key: "rivers", label: "Channels", min: 0, max: 6, step: 1, def: 3, unit: "", group: "Channels", why: "How many channels wander through the field." },
      { key: "channel", label: "Channel width", min: .3, max: 4, step: .01, def: 1.5, unit: "×", group: "Channels", why: "Width of the mint rivers: 1 is a 28 px median with a swell along the run." },
      { key: "wander", label: "Wander", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Channels", why: "How much each channel swings side to side." },
      { key: "frame", label: "Frame", min: 0, max: .15, step: .001, def: .055, unit: "of width", group: "Channels", why: "Width of the mint border around the panel." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. Slides a slow wave through the warp so the walls breathe, and moves the swell along each channel." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 13, unit: "", group: "Motion", why: "Re-rolls seeds, fills and channels." }
    ],
    presets: [
      { name: "Honeycomb", set: { jitter: .1, vary: 0, round: 6, gap: 4, rivers: 0 } },
      { name: "Flooded", set: { rivers: 6, channel: 2.2, wander: 1.8, green: .7 } },
      { name: "Fine ink", set: { keyline: 2, gain: -.4, soft: .4, gap: 2, cell: 60 } },
      { name: "Heavy press", set: { gain: 1.2, soft: 2, keyline: 7, gap: 14 } }
    ],
    motion: [{ key: "phase", amp: 1, period: 12, mode: "saw" }, { key: "channel", amp: .15, period: 9, mode: "sine" }],
    live: { x: { key: "gap", min: 0, max: 24 }, y: { key: "channel", min: .4, max: 2.5 } },
    bench: { palette: "measured", params: {}, note: "Cells and channels are generated, so the patch windows compare material on the plate's own cells: the flat patches were placed with search.py, the whole panel compares ink shares.", items: [
      { name: "gray fill", ref: [435, 877, 33, 33], out: [76, 645, 33, 33], m: ["hist", "mean", "std", "ac", "ink"], lags: 4, inks: [[213, 213, 213]], inkNames: ["gray"] },
      { name: "green fill", ref: [438, 441, 33, 33], out: [485, 219, 33, 33], m: ["hist", "mean", "std", "ink"], inks: [[115, 167, 118]], inkNames: ["green"] },
      { name: "keyline edge", ref: [300, 400, 160, 120], out: [608, 560, 160, 120], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[7, 11, 8], [209, 212, 210], [168, 240, 173], [112, 156, 115]], inkNames: ["black", "gray", "mint", "green"] },
      { name: "dense junctions", ref: [420, 820, 256, 192], out: [528, 624, 256, 192], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[7, 11, 8], [209, 212, 210], [168, 240, 173], [112, 156, 115]], inkNames: ["black", "gray", "mint", "green"] },
      { name: "frame", ref: [4, 500, 40, 200], out: [4, 500, 40, 200], m: ["hist", "mean", "std", "ink"], inks: [[174, 251, 179]], inkNames: ["mint"] },
      { name: "whole panel", ref: [30, 30, 790, 1140], out: [30, 30, 790, 1140], m: ["hist", "mean", "ink", "share"], inks: [[7, 11, 8], [209, 212, 210], [168, 240, 173], [112, 156, 115]], inkNames: ["black", "gray", "mint", "green"] }
    ] },
    palettes: [
      { id: "measured", name: "Mint and gray", note: "measured", c: { paper: [213, 213, 213], green: [118, 170, 121], mint: [173, 247, 178], ink: [4, 6, 4] }, sw: ["#040604", "#d5d5d5", "#73a776", "#adf7b2"] },
      { id: "cobalt", name: "Cobalt", c: { paper: [226, 230, 236], green: [60, 90, 200], mint: [150, 200, 255], ink: [10, 12, 30] }, sw: ["#0a0c1e", "#e2e6ec", "#3c5ac8", "#96c8ff"] },
      { id: "coral", name: "Coral", c: { paper: [240, 240, 240], green: [230, 90, 80], mint: [255, 190, 170], ink: [20, 10, 10] }, sw: ["#140a0a", "#f0f0f0", "#e65a50", "#ffbeaa"] },
      { id: "mono", name: "Graphite", c: { paper: [220, 220, 222], green: [120, 120, 124], mint: [245, 245, 247], ink: [6, 6, 8] }, sw: ["#060608", "#dcdcde", "#78787c", "#f5f5f7"] },
      { id: "violet", name: "Ultraviolet", c: { paper: [232, 228, 240], green: [110, 70, 180], mint: [200, 240, 90], ink: [16, 8, 30] }, sw: ["#10081e", "#e8e4f0", "#6e46b4", "#c8f05a"] },
      { id: "night", name: "Night", c: { paper: [40, 44, 52], green: [20, 110, 90], mint: [120, 230, 200], ink: [230, 236, 240] }, sw: ["#e6ecf0", "#282c34", "#146e5a", "#78e6c8"] }
    ],
    passes: ["seeds on a 105 px lattice with 0.8 jitter, each with a size weight and a fill chosen by hash (41 % green)", "one low-frequency warp of the coordinates for everything that follows", "signed distance to the nearest cell wall: half the margin over the next seed, smooth-minned over the 3×3 neighborhood with a 22 px radius so corners round and junctions pocket; minus half the 6 px gap", "channel field: distance to 3 wandering Catmull-Rom polylines minus a width that swells along the run; the channel pushes the cell distance back by one keyline", "the panel edge does the same", "cut: fill where the distance exceeds the 4 px keyline, channel where its field is negative, black elsewhere", "scan blur 1.3 px on the masks, then a threshold shifted by the ink gain so black fattens; a 3.2 px bleed of the black into the fills; grain on the fills"],
    measured: { paper_gray: [213, 213, 213], paper_sigma_L: 3.54, paper_ac: [.81, .5, .12], green_fill: [115, 167, 118], green_sigma_L: 5.16, mint: [173, 245, 178], black: [3, 5, 3], shares_interior: { black: .219, green: .166, mint: .225, gray: .391 }, keyline_half_width_px: { median: 2, p90: 4 }, keyline_method: "distance transform ridge of the black class", gray_cells: { count: 43, area_median_px: 5959, equiv_diameter_px: 87 }, green_cells: { count: 30, area_median_px: 2227, equiv_diameter_px: 53 }, channel_half_width_px: { median: 14, p25: 5, p75: 20, p95: 30 }, edge_20_80_px: 2, frame_px: { left: 57, top: 45, bottom: 43 } },
    limits: ["Benchmark mean 0.96. The edge and junction tone histograms (0.80 to 0.85) miss on the mid-tone tail: the scan's black lines carry a 2 px ramp and a wider halo that the plate reproduces with a 1.3 px blur and a 3 px bleed, which leaves fewer pixels between 16 and 128 than the scan has.", "Gray-fill autocorrelation 0.87: the scan grain correlates 0.81 at lag 1 and 0.49 at lag 2; a 2.8 px hashed grid resampled with Catmull-Rom falls off faster at lag 2.", "Cells and channels are generated; the edge and junction patches were placed with search.py on the plate's own cells.", "The reference's channels were drawn by hand and meet the frame at chosen points; the plate's wander from edge to edge, and one ends inside the panel with a taper."],
    source: "Reference 13: hand-inked cell print with a mint channel network, 850 × 1200 px JPEG scan",
    study: { slug: "membrane", lede: "One distance field gives every cell its fill, its 4 px keyline and the black gap beside it.", body: ["The print is a sheet of cells inked by hand: gray or green blobs, each outlined in black, with black pockets where three walls meet and a mint channel that winds between them and out into the mint frame. Measured off the scan, the gray cells have a median equivalent diameter of 87 px and the green ones 53 px; the keylines are 4 px wide; the channels have a median width of 28 px and swell to 60; black covers 22 percent of the panel.", "The plate seeds cells on a 105 px lattice with jitter, warps the coordinates once, and computes for every pixel the signed distance to the nearest wall as a smooth minimum over the neighboring seeds. That one number is cut three ways: above the keyline it is fill, below zero it is gap, between it is the black line. A second field, the distance to three wandering polylines, is the channel; it pushes the cells back by one keyline so each river has its own black edge. Cell size, jitter and corner radius shape the field; gap, keyline, gain and scan blur are the ink; channels, width and wander are the rivers."], method: "jittered seed lattice · warped smooth-min wall distance · polyline channel distance · three-way cut · scan blur and ink gain", points: [
      { u: .35, v: .5, d: "KEY", label: "A wall: 4 px of black keyline on each side of a 6 px gap, all from one distance value.", t: "edge", dir: [1, 0] },
      { u: .5, v: .35, d: "KEY", label: "A junction: three walls meet and the smooth-min distance leaves a black pocket about 22 px across.", t: "edge", dir: [0, 1] },
      { u: .6, v: .6, d: "KEY", label: "A channel: mint, 28 px median width, swelling along the run, with its own keyline where it passes a cell.", t: "pull", dir: [0, 1] },
      { u: .2, v: .2, d: "READ", label: "A green cell: the fill is decided by hash, 41 percent of cells; its grain is 1.5 times the gray's.", t: "grain", dir: [1, 0] },
      { u: .5, v: .5, d: "READ", label: "Gray fill: 3.5 levels of smooth grain at 2.6 px, the scanner's noise on flat paper.", t: "grain", dir: [1, 1] },
      { u: .03, v: .5, d: "READ", label: "The frame: 0.055 of the width in mint, with the panel's keyline inside it.", t: "edge", dir: [1, 0] },
      { u: .5, v: .97, d: "READ", label: "Where a channel meets the frame it opens into it; the keyline stops at the panel edge.", t: "pull", dir: [0, 1] },
      { u: .8, v: .3, d: "READ", label: "Zoom in: the scan blur of 1.3 px runs on every edge, the gain shifts the cut so black grows 1 px into the fills, and a 3 px bleed darkens the fill beside the line.", t: "edge", dir: [-1, 0] },
      { u: .7, v: .8, d: "READ", label: "A small cell pinched between two channels: the channel distance beat the wall distance on both sides.", t: "edge", dir: [0, -1] },
      { u: .3, v: .85, d: "READ", label: "A wide black gap: two seeds far apart leave a long margin below the keyline cut.", t: "edge", dir: [1, 0] }
    ] }
  });
})();
