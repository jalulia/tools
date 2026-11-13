/* ===== PLATE 01 · GRAIN NOCTURNE =====
   one tone field (sky, ridges, lit caps, glints, fringe, stars) -> one stochastic grain screen whose
   transfer (tone -> pixel distribution) was measured off the reference -> tone ramp.
   Light is only ever speck density; nothing is shaded twice. */
(function () {
  const REF = { w: 1200, h: 1617 };
  /* measured transfer, extended by a black end and a solid end */
  const TN = [10].concat(P1_LUT.tones, [208]), QN = [Array.from({ length: 129 }, (_, i) => 4 + 14 * i / 128)].concat(P1_LUT.q, [Array.from({ length: 129 }, (_, i) => 176 + 60 * Math.pow(i / 128, .9))]);
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 9973 + 1), nA = vnoise(P.seed + 3), nB = vnoise(P.seed + 41);
    const yh = H * P.horizon, N = Math.round(P.ridges), yFore = H * .9;
    /* crests: ridged lines between horizon and foreground, spacing opens toward the viewer */
    const crest = [], lit = [], hair = [];
    for (let i = 0; i < N; i++) {
      const t = N > 1 ? i / (N - 1) : 0, base = yh + Math.pow(t, 1.45) * (yFore - yh) * .9 + 14 * u, amp = (9 + 34 * t) * u * P.relief, f = (1 / (430 - 200 * t)) / u;
      const c = new Float32Array(W), l = new Float32Array(W), hgt = new Float32Array(W), gate = rnd() * 40;
      for (let x = 0; x < W; x++) { const r = 1 - Math.abs(2 * fbm(nA, (x + (P.phase || 0) * 260 * u * (1 + t)) * f + i * 31.7, i * 5.3, 3) - 1); hgt[x] = r; c[x] = base - (Math.pow(r, 1.6) - .35) * 2.6 * amp; }
      /* lit caps: the high ground of each ridge, gated so not every peak catches light */
      const thr = clamp(1.02 - .2 * P.light, .2, 1.2);
      for (let x = 0; x < W; x++) { const g = nB(x / (210 * u) + gate, i * 2.9); l[x] = Math.pow(sstep(thr, thr + .12, hgt[x] * (.72 + .56 * g)), .55); }
      crest.push(c); lit.push(l); hair.push(rnd() < .6);
    }
    const fore = new Float32Array(W), lam = W / (1.15 + rnd() * .5), ph = rnd() * 3.14;
    for (let x = 0; x < W; x++) fore[x] = yFore + 150 * u - (x / W) * 150 * u - Math.pow(Math.abs(Math.sin(x / lam * Math.PI + ph)), .72) * 46 * u * P.relief - (nB(x / (90 * u), 3.3) - .5) * 22 * u;
    /* ---- tone field, in luminance units 0..255 ---- */
    const M = new Float32Array(W * H), D = P.density, Tmax = 15 * u * P.rim, fall = 46 * u * Math.max(.05, P.glow), band = 24 * u, SOLID = 208;
    for (let x = 0; x < W; x++) {
      const ex = Math.min(x, W - 1 - x), edge = P.edge * 13 * (1 - sstep(3 * u, 24 * u, ex));
      let ri = -1;
      for (let y = 0; y < H; y++) {
        while (ri + 1 < N && y >= crest[ri + 1][x]) ri++;
        let m;
        if (y >= fore[x]) { const dy = y - fore[x]; m = D * (36 + 26 * Math.exp(-dy / (26 * u)) + 8 * nB(x / (60 * u), y / (60 * u))); }
        else if (ri < 0) { const t = y / yh; m = D * (37.6 + 3.4 * t + 17 * Math.pow(t, 5)) * (.955 + .09 * nB(x / (240 * u), y / (240 * u))) * (1 + P.hatch * (.02 + .58 * Math.pow(t, 4)) * (nA(x / (46 * u), y / (2.6 * u)) - .5)); }
        else {
          const dy = y - crest[ri][x], nxt = ri + 1 < N ? crest[ri + 1][x] : fore[x], dn = nxt - y, L = lit[ri][x], th = Tmax * L * (.7 + .5 * nA(x / (33 * u), ri * 7.7));
          m = D * (39 + 9 * ri / N) * (.86 + .28 * nB(x / (150 * u), y / (38 * u))) + P.glow * 62 * L * Math.exp(-dy / fall) + 16 * Math.exp(-dy / (7 * u));
          m = 15 + (m - 15) * sstep(1 * u, band * (1 + ri / N), dn);            /* valley shadow under the next crest */
          if (L > .02 && dy < th) m = dy < th - 2 * u ? SOLID : SOLID - 110 * (dy - th + 2 * u) / (2 * u);
          else if (hair[ri] && dy < 1.3 * u) m = Math.max(m, 165);
        }
        M[y * W + x] = m + edge;
      }
    }
    /* ---- drawn marks, alpha = how far toward solid ---- */
    const K = mk(W, H), g = K.getContext("2d"); g.fillStyle = "#000"; g.fillRect(0, 0, W, H); g.lineCap = "round";
    const G = v => `rgba(255,255,255,${v})`;
    for (let i = 0, n = Math.round(P.stars); i < n; i++) { const x = (.05 + rnd() * .9) * W, y = (.03 + Math.pow(rnd(), 1.15) * .9) * (yh - 70 * u), r = (1.5 + Math.pow(rnd(), 2.2) * 2.3) * u; g.fillStyle = G(1); g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); }
    if (P.glints > 0 && N > 2) { /* a band of short dashes along one slope */
      const ri = Math.min(N - 2, Math.max(1, Math.round(N * .62))), off = (crest[ri + 1][W >> 1] - crest[ri][W >> 1]) * .5;
      for (let i = 0, n = Math.round(1500 * P.glints); i < n; i++) { const x = (.1 + rnd() * .78) * W, env = Math.sin((x / W - .1) / .78 * Math.PI), y = crest[ri][x | 0] + off + (nB(x / (140 * u), 9.1) - .5) * 26 * u + (rnd() - .5) * 13 * u * env; if (rnd() > env) continue; g.strokeStyle = G(.5 + rnd() * .5); g.lineWidth = (.9 + rnd() * .9) * u; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (2 + rnd() * 5) * u, y + (rnd() - .5) * 1.6 * u); g.stroke(); }
    }
    for (let k = 1; k <= 3; k++) { g.strokeStyle = G(.42); g.lineWidth = .9 * u; g.beginPath(); for (let x = 0; x < W; x += 3) { const y = fore[x] - k * (34 + 10 * k) * u * (.5 + .7 * nB(x / (300 * u), k * 3.1)); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.strokeStyle = G(1); g.lineWidth = 2.6 * u; g.beginPath(); for (let x = 0; x < W; x += 2) x ? g.lineTo(x, fore[x]) : g.moveTo(x, fore[x]); g.stroke();
    /* fringe: hairs stand off the shore edge, dense enough to overlap into a fuzz; each hair is brightest at its root */
    if (P.fringe > 0) for (let x = 2; x < W - 2; x += (P.fsp ?? 1.4) * u) { const xi = x | 0, sl = (fore[Math.min(W - 1, xi + 3)] - fore[Math.max(0, xi - 3)]) / 6, ln = (4 + Math.pow(rnd(), 2) * 30) * u * P.fringe, j = (rnd() - .5) * .55, l = Math.hypot(sl, 1), a = .2 + rnd() * .4, dx = (sl / l + j), dy = -1 / l; g.lineWidth = (.55 + rnd() * .45) * u; g.strokeStyle = G(a); g.beginPath(); g.moveTo(x, fore[xi]); g.lineTo(x + dx * ln, fore[xi] + dy * ln); g.stroke(); g.strokeStyle = G(a * .9); g.beginPath(); g.moveTo(x, fore[xi]); g.lineTo(x + dx * ln * .45, fore[xi] + dy * ln * .45); g.stroke(); }
    for (let i = 0, n = Math.round(W * H / (5200 * u * u) * P.scratch); i < n; i++) { const x = rnd() * W, y = rnd() * H, a = rnd() * 6.28, ln = (6 + rnd() * 26) * u, bend = (rnd() - .5) * 1.2; g.strokeStyle = G(.1 + rnd() * .16); g.lineWidth = .7 * u; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + bend) * ln * .5, y + Math.sin(a + bend) * ln * .5, x + Math.cos(a) * ln, y + Math.sin(a) * ln); g.stroke(); }
    if (P.edge > 0) for (let side = 0; side < 2; side++) for (let i = 0; i < 9; i++) { const x = side ? W - (2 + i * 2.6 + rnd()) * u : (2 + i * 2.6 + rnd()) * u; g.strokeStyle = G(.1 * P.edge * (1 - i / 10)); g.lineWidth = .8 * u; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (rnd() - .5) * 2 * u, H); g.stroke(); }
    const Kc = chan(g, W, H, 0);
    for (let i = 0; i < M.length; i++) { const k = Kc[i]; if (k > 0) M[i] += k * (SOLID - M[i]); }
    /* ---- the screen: correlated grain -> rank -> measured transfer ---- */
    const gr = gaussRng(mulberry(P.seed * 31 + 7)), gw = Math.max(8, Math.round(W / (P.grain * 1.16 * u))), gh = Math.max(8, Math.round(H / (P.grain * 1.09 * u))), Nz = new Float32Array(gw * gh); for (let i = 0; i < Nz.length; i++) Nz[i] = gr();
    const Gz = upsampleCR(Nz, gw, gh, W, H), G2 = P.even > .01 ? gblur(Gz, W, H, (P.span || 4.25) * u) : null; if (G2) for (let i = 0; i < Gz.length; i++) Gz[i] -= P.even * G2[i];
    let sd = 0, cn = 0; for (let i = 0; i < Gz.length; i += 97) { sd += Gz[i] * Gz[i]; cn++; } sd = Math.sqrt(sd / cn) || 1;
    const CDF = new Float32Array(2049); for (let i = 0; i <= 2048; i++) { const z = (i - 1024) / 256, t = 1 / (1 + .2316419 * Math.abs(z)), p = 1 - Math.exp(-z * z / 2) / 2.50662827 * t * (.31938153 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))); CDF[i] = z >= 0 ? p : 1 - p; }
    const V = new Float32Array(W * H), nT = TN.length;
    for (let i = 0; i < V.length; i++) {
      const m = M[i], z = clamp(Gz[i] / sd, -3.99, 3.99), uq = CDF[(z * 256 + 1024) | 0] * 128, qi = Math.min(127, uq | 0), qf = uq - qi;
      let k = 0; while (k < nT - 2 && m > TN[k + 1]) k++;
      const tf = clamp((m - TN[k]) / (TN[k + 1] - TN[k]), 0, 1), a = QN[k], b = QN[k + 1], la = a[qi] + (a[qi + 1] - a[qi]) * qf, lb = b[qi] + (b[qi + 1] - b[qi]) * qf;
      const v = la + (lb - la) * tf, yy = (i / W | 0) / H, kq = 1 - P.haze * (.03 - .06 * sstep(.2, .6, yy) + .23 * (1 - sstep(.04, .2, yy)));
      V[i] = m + (v - m) * kq;
    }
    const S = P.soft > .02 ? gblur(V, W, H, P.soft * u) : V;
    /* ---- tone ramp ---- */
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, R = pal.ramp, fl = P.floor * 255;
    for (let i = 0, j = 0; i < S.length; i++, j += 4) {
      let L = (fl + (S[i] - 26) * P.punch + 26 - 25.5) / 255; L = L < 0 ? 0 : L > 1 ? 1 : L; const f = L * (R.length - 1), k = Math.min(R.length - 2, f | 0), t = f - k, a = R[k], b = R[k + 1];
      d[j] = a[0] + (b[0] - a[0]) * t; d[j + 1] = a[1] + (b[1] - a[1]) * t; d[j + 2] = a[2] + (b[2] - a[2]) * t; d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  const rampFrom = (black, mid, tint) => { const r = []; for (let i = 0; i <= 10; i++) { const t = i / 10; r.push(t < .5 ? black.map((v, c) => v + (mid[c] - v) * (t / .5)) : mid.map((v, c) => v + (tint[c] - v) * ((t - .5) / .5))); } return r; };
  PLATES.push({
    id: "p1", no: "01", title: "Grain Nocturne", ref: REF, render,
    line: "A single tone field put through a stochastic grain screen. Every light in the picture is a change in speck density.",
    params: [
      { key: "density", label: "Field density", min: .5, max: 2.6, step: .01, def: 1, unit: "×", group: "Screen", why: "Speck coverage across the whole sheet. Low is deep night, high is fog." },
      { key: "grain", label: "Grain size", min: .8, max: 6, step: .01, def: 1.05, unit: "px", group: "Screen", why: "Size of the specks. Small is stone tooth, large is sponge." },
      { key: "even", label: "Evenness", min: 0, max: 1.2, step: .01, def: .27, unit: "", group: "Screen", why: "How strongly specks avoid each other. 0 clumps like spray, 1 spaces like hand stipple." },
      { key: "haze", label: "Sky haze", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Screen", why: "Flattens speck contrast toward the top of the sheet." },
      { key: "hatch", label: "Hatch", min: 0, max: 3, step: .01, def: .8, unit: "×", group: "Screen", why: "Horizontal streaking in the tone, strongest at the horizon." },
      { key: "soft", label: "Press softness", min: 0, max: 1.6, step: .01, def: 0, unit: "px", group: "Screen", why: "Ink spread after the screen. 0 keeps every speck hard." },
      { key: "punch", label: "Ink punch", min: .4, max: 1.8, step: .01, def: 1, unit: "×", group: "Screen", why: "Contrast of a printed speck against the black." },
      { key: "floor", label: "Black floor", min: 0, max: .3, step: .005, def: .1, unit: "", group: "Screen", why: "How far the unprinted black lifts." },
      { key: "scratch", label: "Scratches", min: 0, max: 12, step: .01, def: 1, unit: "×", group: "Screen", why: "Short burin strokes scattered through the field." },
      { key: "light", label: "Lit caps", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Light", why: "How much high ground catches the light." },
      { key: "rim", label: "Cap thickness", min: .2, max: 3, step: .01, def: 1, unit: "×", group: "Light", why: "Depth of the solid lit sliver." },
      { key: "glow", label: "Glow falloff", min: 0, max: 2.4, step: .01, def: 1, unit: "×", group: "Light", why: "How far light bleeds down a slope as stipple." },
      { key: "glints", label: "Glint band", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Light", why: "A band of short dashes on one slope." },
      { key: "stars", label: "Stars", min: 0, max: 120, step: 1, def: 9, unit: "", group: "Light", why: "Solid points in the sky." },
      { key: "horizon", label: "Horizon", min: .3, max: .8, step: .005, def: .63, unit: "of height", group: "Land", why: "Where sky ends." },
      { key: "ridges", label: "Ridges", min: 2, max: 12, step: 1, def: 6, unit: "", group: "Land", why: "Number of crest lines." },
      { key: "relief", label: "Relief", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Land", why: "Height of the terrain. 0 is flat water." },
      { key: "fringe", label: "Fringe", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Land", why: "Hair strokes standing off the foreground edge." },
      { key: "edge", label: "Plate edge", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Land", why: "Denser, hatched margins left and right." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 12, unit: "", group: "Land", why: "Re-rolls terrain, light and grain." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. The swell advances across the sheet, the near crests faster than the far ones." }
    ],
    bench: { palette: "measured", params: {}, items: [
      { name: "open field", ref: [300, 300, 256, 256], out: [300, 300, 256, 256], m: ["hist", "mean", "std", "spec", "ac"], lags: 4 },
      { name: "upper field", ref: [200, 60, 800, 128], out: [200, 60, 800, 128], m: ["hist", "mean", "std", "spec"] },
      { name: "dense field", ref: [100, 850, 1000, 128], out: [100, 850, 1000, 128], m: ["hist", "mean", "std", "spec", "ac"], lags: 4 },
      { name: "lit edge", ref: [120, 1070, 300, 96], out: [600, 948, 300, 96], m: ["hist", "mean", "std", "ink"], inks: [[10, 10, 7], [100, 100, 96], [232, 218, 190]], inkNames: ["black", "speck gray", "tint"] },
      { name: "fringed edge", ref: [60, 1440, 320, 150], out: [816, 1380, 320, 150], m: ["hist", "mean", "std"] },
      { name: "whole plate", ref: [0, 0, 1200, 1617], out: [0, 0, 1200, 1617], m: ["hist", "mean"] }
    ] },
    palettes: [
      { id: "silver", name: "Silver", ramp: rampFrom([9, 10, 11], [98, 100, 103], [240, 243, 246]), sw: ["#090a0b", "#626467", "#f0f3f6"] },
      { id: "measured", name: "Stone ink", note: "measured", ramp: [[0, 0, 0], [27, 26, 21], [51, 52, 48], [77, 77, 73], [102, 102, 97], [127, 125, 119], [153, 150, 141], [181, 174, 158], [212, 198, 168], [230, 216, 188], [250, 239, 217]], sw: ["#080805", "#666661", "#f6ebd5"] },
      { id: "cyan", name: "Blueprint", ramp: rampFrom([6, 12, 30], [40, 96, 150], [208, 240, 255]), sw: ["#060c1e", "#286096", "#d0f0ff"] },
      { id: "ember", name: "Ember", ramp: rampFrom([14, 6, 6], [150, 44, 20], [255, 196, 96]), sw: ["#0e0606", "#962c14", "#ffc460"] },
      { id: "moss", name: "Moss", ramp: rampFrom([6, 12, 9], [60, 110, 78], [206, 244, 200]), sw: ["#060c09", "#3c6e4e", "#cef4c8"] },
      { id: "negative", name: "Negative", ramp: rampFrom([250, 250, 250], [150, 152, 156], [14, 15, 18]), sw: ["#fafafa", "#96989c", "#0e0f12"] }
    ],
    presets: [{ name: "Fog bank", set: { density: 1.7, haze: 2.2, light: .5, glow: 1.8, stars: 0 } }, { name: "Hard bit", set: { grain: 2.4, even: 1, punch: 1.6, floor: 0, haze: 0 } }, { name: "Still water", set: { relief: .15, ridges: 10, light: 1.6, glints: 2, fringe: 0 } }, { name: "Star field", set: { stars: 110, density: .7, horizon: .78, ridges: 3 } }],
    motion: [{ key: "phase", amp: 1, period: 24, mode: "saw" }, { key: "light", amp: .3, period: 7, mode: "sine" }, { key: "glow", amp: .25, period: 11, mode: "drift" }],
    live: { x: { key: "light", min: 0, max: 2.5 }, y: { key: "density", min: .5, max: 2.6 } },
    source: "Reference 1: night seascape print, 1200 × 1617 px JPEG",
    passes: ["tone field: sky ramp, ridged crests, valley shadow under each next crest", "lit caps: solid slivers on high ground, stipple glow falling down the slope", "drawn marks: stars, glint dashes, contour hairlines, fringe hairs, scratches, edge hatch", "grain screen: random cell lattice at 1.05 × 1.16 by 1.05 × 1.09 px per cell, resampled, minus 0.27 of its own 4.25 px blur (specks avoid each other)", "transfer: each pixel's rank in the grain looks up the measured tone distribution, 12 tone bins × 129 quantiles", "tone ramp: 11 stops, black to tint"],
    measured: { speck_median_area_px: 2, speck_coverage_open_field: [.078, .119], speck_coverage_dense_field: .274, field_mean_luminance: [38.5, 39.4], field_sigma_L: { open: 26.6, upper: 20.4, dense: 39.5 }, black: [8, 8, 5], tint: [245, 234, 212], lit_sliver_thickness_px: { median: 6, p90: 13 }, lit_edge_inks: { black: [29, 28, 23], speck_gray: [96, 93, 85], tint: [214, 199, 169], shares: [.545, .347, .108] }, autocorrelation_lag1: { open: [.37, .3], dense: [.43, .27] }, transfer_table: "12 tone bins × 129 quantiles, from 12 px blocks of the reference" },
    limits: ["The landscape is generated, not traced: the benchmark compares material, not composition, and the lit-edge and fringed-edge render rects sit on the render's own foreground.", "The transfer table comes from the reference, so tone histograms match partly by construction; spectrum and autocorrelation do not.", "The open and upper field spectra score 0.93 to 0.95: the reference's grain carries less energy at 32 to 64 px than the field drift gives it, and the JPEG softens the specks the lattice keeps hard."],
    study: { slug: "grain-nocturne", lede: "One tone field for sky, crests, lit caps and shore, screened by a stochastic grain whose transfer from tone to speck was read off the reference in 12 px blocks.",
      body: ["The reference is a night seascape printed as a stipple: no grays, only specks of a median 2 px on black and black holes in the lit tint. Light is speck density. The open field covers 8 to 12 % of its area with specks, the dense foreground 27 %, and the lit caps run solid in slivers 6 px thick at the median, 13 px at the 90th percentile. Specks avoid each other: the lag-1 autocorrelation is 0.37 across and 0.30 down in the open field, with a negative lag 2.", "The rebuild writes the picture as one luminance field first: a sky ramp, ridged crests whose spacing opens toward the viewer, a valley shadow under each next crest, lit caps on the high ground with a glow that falls down the slope, then stars, glints, hairlines, fringe and scratches as marks. A random cell lattice is resampled to the sheet and its own blur subtracted, so the specks space out. Each pixel's rank in that grain looks up the reference's tone distribution for its luminance, which is the whole transfer from tone to print. Density, grain size and evenness set the screen. Lit caps, cap thickness and glow set the light. Horizon, ridges and relief set the land."],
      method: "Tone field · Lit caps and marks · Correlated grain lattice · Rank to measured transfer · Tone ramp",
      points: [
        { u: .35, v: .25, d: "KEY", label: "Open sky: specks at 8 to 12 % coverage, median 2 px, evenness 0.27 so they stand apart.", t: "grain", dir: [-1, -1] },
        { u: .5, v: .08, d: "READ", label: "Haze: speck contrast flattened by 23 % in the top fifth of the sheet.", t: "grain", dir: [0, -1] },
        { u: .3, v: .5, d: "READ", label: "Hatch: horizontal streaking in the tone, strongest at the horizon, 46 px across and 2.6 px tall.", t: "field", dir: [-1, 0] },
        { u: .6, v: .66, d: "KEY", label: "Lit cap: a solid sliver 6 px thick at the median on the high ground, its glow falling 46 px down the slope as stipple.", t: "light", dir: [1, -1] },
        { u: .45, v: .72, d: "READ", label: "Valley shadow: tone drops to 15 within 24 px under the next crest.", t: "field", dir: [0, 1] },
        { u: .5, v: .78, d: "READ", label: "Glint band: 1500 dashes of 2 to 7 px along one slope, thinning toward both ends.", t: "light", dir: [1, 0] },
        { u: .2, v: .9, d: "KEY", label: "Dense field: 27 % coverage, where the transfer table's upper bins put specks almost edge to edge.", t: "grain", dir: [-1, 1] },
        { u: .7, v: .88, d: "READ", label: "Fringe: hairs 4 to 34 px standing off the shore edge at 1.4 px spacing, each brightest in its root half.", t: "marks", dir: [1, 1] },
        { u: .5, v: .95, d: "READ", label: "Contour hairlines: three lines above the foreground edge at 0.42 alpha, 0.9 px.", t: "marks", dir: [0, 1] },
        { u: .02, v: .5, d: "READ", label: "Plate edge: nine hatch lines 2.6 px apart, the field 13 levels denser within 24 px of the margin.", t: "marks", dir: [-1, 0] }
      ] }
  });
})();
