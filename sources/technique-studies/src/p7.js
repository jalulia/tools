/* ===== PLATE 07 · FOLD GLOW =====
   one ribbon folded into stacked parallelogram slabs; every slab is a near-black field whose color is a
   function of the distance to its own edge (yellow rim, pink, blue, dark green), measured in the slab's
   own width and height; edges facing away from the light enter the ramp late; one grain, denser on the ramps. */
(function () {
  const REF = { w: 1199, h: 1697 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), img = g.createImageData(W, H), d = img.data;
    const gr = C.ground; for (let i = 0; i < d.length; i += 4) { d[i] = gr[0]; d[i + 1] = gr[1]; d[i + 2] = gr[2]; d[i + 3] = 255; }
    /* 1 — the ribbon: n slabs with heights 1, 2 or 4 units, folded left / right at every edge */
    const rnd = mulberry(P.seed * 48271 + 7), n = Math.max(1, Math.round(P.slabs)), units = [];
    const p4 = .08 + .32 * P.tall, p1 = .55 - .35 * P.tall;
    for (let i = 0; i < n; i++) { const r = rnd(); units.push(r < p1 ? 1 : r < 1 - p4 ? 2 : 4); }
    const tot = units.reduce((a, b) => a + b, 0), margin = P.margin * H, h0 = (H - 2 * margin) / tot, A = P.fold * W, wR = P.width * W, xL = (W - wR - A) / 2;
    const slabs = []; let y = margin;
    for (let i = 0; i < n; i++) { const h = units[i] * h0, even = i % 2 === 0; slabs.push({ y0: y, y1: y + h, h, xt: xL + (even ? A : 0), xb: xL + (even ? 0 : A) }); y += h; }
    /* 2 — two ramps as lookups: the lit edge (yellow, pink, blue, dark) and the shadowed edge (light blue, blue, dark), color against the normalized distance to the slab edge */
    const NL = 1024, gam = P.curve, mkLut = stops => { const L = new Float32Array(NL * 3); for (let i = 0; i < NL; i++) { const t = Math.pow(i / (NL - 1), gam); let k = 0; while (k < stops.length - 2 && stops[k + 1][0] < t) k++; const a = stops[k], b = stops[k + 1], f = clamp((t - a[0]) / (b[0] - a[0] || 1), 0, 1); L[i * 3] = a[1] + (b[1] - a[1]) * f; L[i * 3 + 1] = a[2] + (b[2] - a[2]) * f; L[i * 3 + 2] = a[3] + (b[3] - a[3]) * f; } return L; };
    const stops = C.stops, LUT = mkLut(stops), tailFrom = C.shadow[C.shadow.length - 1][0], LUS = mkLut(C.shadow.concat(stops.filter(q => q[0] > tailFrom))), last = stops[stops.length - 1];
    /* 3 — light: each edge is shadowed by how much it faces away from the light (the top edges, with the light below); a shadowed edge
       runs the shadow ramp, entered late. The slanted sides are lit near the edge that faces the light and fall into shadow toward
       the other one: half shadow at 0.2 of the slab height. */
    const ph = (P.phase || 0) * 6.2832, Lx = -Math.sin(ph), Ly = Math.cos(ph), sh = P.topShift, wT = Math.max(0, Ly), wB = Math.max(0, -Ly), wL = Math.max(0, Lx), wRt = Math.max(0, -Lx);
    const e = Math.max(.3, P.edge * u), gx = P.glowX, gy = P.glowY, gyS = P.glowTop, ra = P.rimSide, rb = .0625, side = t => t < ra ? t * (rb / ra) : rb + (t - ra) * (1 - rb) / (1 - ra); /* the slanted sides stretch the yellow-to-pink part of the ramp */
    const SKN = [[0, 0], [.333, .33], [.467, .54], [.522, .67], [.8, .795], [.93, .92]], shd = x => { if (x >= .93) return .92 + (x - .93) * .6; let k = 0; while (x > SKN[k + 1][0]) k++; return SKN[k][1] + (x - SKN[k][0]) * (SKN[k + 1][1] - SKN[k][1]) / (SKN[k + 1][0] - SKN[k][0]); }; /* shadowed edge, from the row means under the tops of the 77 and 304 px slabs: blue at 0.15 h, a fast fall to 0.235 h, then a slow tail */
    const LK = [[0, 0], [.16, .06], [.24, .12], [.47, .41], [.97, 1]], lit = x => { if (x >= .97) return 1 + (x - .97) * 1.18; let k = 0; while (x > LK[k + 1][0]) k++; return LK[k][1] + (x - LK[k][0]) * (LK[k + 1][1] - LK[k][1]) / (LK[k + 1][0] - LK[k][0]); }; /* lit edge, knots read off the row means of the 304 px slab's bottom 128 px: yellow to 0.016 h, pink at 0.04, blue at 0.117, dark by 0.24 */
    const sk = P.sideShade, sa = 0, sb = P.sideReach, kk = Math.max(1e-3, P.round), sd = P.seed | 0;
    /* 4 — one grain field: position-hashed noise softened to the measured 0.6 lag-1 correlation, normalized to σ 1. It jitters the
       distance each pixel reads the ramp at (so the bands themselves are grainy, blue specks in the pink) and screens every tone. */
    const sg = Math.max(0, P.grainSize * u), N = new Float32Array(W * H), gsd = sd + 977 * Math.floor((P.phase || 0) * 240); /* the grain boils with the phase, as film grain does frame to frame; at rest it is fixed */
    for (let yy = 0, i = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++, i++) N[i] = hashI(xx, yy, gsd) + hashI(xx, yy, gsd + 7) - 1;
    const B = sg >= .3 ? gblur(N, W, H, sg) : N; let bv = 0; for (let i = 0; i < B.length; i += 7) bv += B[i] * B[i]; const bn = 1 / Math.sqrt(bv / Math.ceil(B.length / 7) || 1);
    const jit = P.jitter * u * bn, seam = P.seam;
    for (const S of slabs) {
      const sl = (S.xb - S.xt) / S.h, cs = 1 / Math.sqrt(1 + sl * sl), ya = Math.max(0, Math.floor(S.y0 - e)), yb = Math.min(H - 1, Math.ceil(S.y1 + e));
      for (let yy = ya; yy <= yb; yy++) {
        const v0 = (yy + .5 - S.y0) / S.h, xl0 = S.xt + (S.xb - S.xt) * v0, dyT = yy + .5 - S.y0, dyB = S.y1 - yy - .5;
        const xa = Math.max(0, Math.floor(xl0 - e)), xb2 = Math.min(W - 1, Math.ceil(xl0 + wR + e));
        for (let xx = xa; xx <= xb2; xx++) {
          const hx0 = xx + .5 - xl0, dIn = Math.min(Math.min(hx0, wR - hx0) * cs, dyT, dyB), cov = sstep(-e * .5, e * .5, dIn); if (cov <= 0) continue;
          /* every edge distance is read a grain-field jitter off: the dither of the bands is the ramp itself */
          const i = yy * W + xx, j = B[i] * jit, jv = j * S.h / (4 * h0), v = clamp((dyT + jv) / S.h, 0, 1), vb = clamp((dyB + jv) / S.h, 0, 1), uL = Math.max(0, hx0 + j) / wR, uR = Math.max(0, wR - hx0 + j) / wR;
          const sv = sk * (wT * (1 - sstep(sa, sb, v0)) + wB * (1 - sstep(sa, sb, 1 - v0))), wsL = Math.max(wL, sv), wsR = Math.max(wRt, sv);
          const t1 = wT >= wB ? shd(v / gyS) + sh * wT : lit(v / gy), t2 = wB > wT ? shd(vb / gyS) + sh * wB : lit(vb / gy), t3 = side(uL / gx) + sh * wL, t4 = side(uR / gx) + sh * wRt;
          /* smooth minimum: the nearest edge wins, but where two edges tie the corner rounds instead of mitering */
          const m = Math.min(t1, t2, t3, t4), e1 = Math.exp((m - t1) / kk), e2 = Math.exp((m - t2) / kk), e3 = Math.exp((m - t3) / kk), e4 = Math.exp((m - t4) / kk), es = e1 + e2 + e3 + e4;
          const t = m - kk * Math.log(es), w = (e1 * wT + e2 * wB + e3 * wsL + e4 * wsR) / es;
          /* the crease: the first row under a fold reads darker */
          const cr = seam > 0 ? 1 - seam * Math.exp(-.5 * (dyT / (.7 * u)) ** 2) : 1;
          const o = i * 4;
          if (t >= 1) { d[o] += (last[1] * cr - d[o]) * cov; d[o + 1] += (last[2] * cr - d[o + 1]) * cov; d[o + 2] += (last[3] * cr - d[o + 2]) * cov; }
          else { const k = (Math.max(0, t) * (NL - 1) | 0) * 3; for (let c = 0; c < 3; c++) { const val = (w > 0 ? LUT[k + c] + (LUS[k + c] - LUT[k + c]) * w : LUT[k + c]) * cr; d[o + c] += (val - d[o + c]) * cov; } }
        }
      }
    }
    /* 5 — the same grain field screens every tone, plus a slow mottle and a white floor */
    if (P.grain > 0) {
      const wf = P.grainWhite, mf = P.mottle * (1 - wf), gf = 1 - wf - mf, gn = P.grain * gf * bn, sm = Math.max(1, (P.mottleSize ?? 4) * u), M2 = mf > 0 ? gblur(N, W, H, sm) : null, mn = P.grain * 2.45 * mf * 3.545 * sm, gw = P.grain * 2.45 * wf, gd = P.grainDark ?? 0;
      for (let i = 0, o = 0; i < N.length; i++, o += 4) {
        const xx = i % W, yy = (i / W) | 0, Lr = (.299 * d[o] + .587 * d[o + 1] + .114 * d[o + 2]) / 255, nz = (B[i] * gn * (1 + gd * (1 - Lr)) + (M2 ? M2[i] * mn : 0) + (wf > 0 ? (hashI(xx, yy, sd + 13) + hashI(xx, yy, sd + 17) - 1) * gw : 0));
        d[o] = clamp(d[o] + nz, 0, 255); d[o + 1] = clamp(d[o + 1] + nz, 0, 255); d[o + 2] = clamp(d[o + 2] + nz, 0, 255);
      }
    }
    g.putImageData(img, 0, 0);
  }
  const MS = [[.14, 65, 118, 180], [.21, 80, 118, 200], [.28, 94, 119, 210], [.34, 60, 110, 216], [.41, 3, 99, 217]];
  const M = [[0, 254, 172, 52], [.03, 254, 166, 91], [.06, 253, 152, 173], [.11, 245, 141, 200], [.16, 217, 133, 207], [.22, 147, 124, 213], [.28, 71, 114, 215], [.34, 16, 105, 219], [.41, 3, 96, 217], [.5, 1, 83, 199], [.62, 1, 67, 145], [.75, 1, 49, 82], [.875, 1, 41, 28], [1, 1, 37, 5]];
  PLATES.push({
    id: "p7", no: "07", title: "Fold Glow", ref: REF, render,
    line: "One ribbon folded into stacked slabs; each slab is a dark field whose color is read from the distance to its nearest edge, lit edges yellow through pink and blue, shadowed edges gray blue, all at a grain-jittered position.",
    params: [
      { key: "slabs", label: "Slabs", min: 3, max: 16, step: 1, def: 10, unit: "", group: "Ribbon", why: "Number of folds. The source stacks 10." },
      { key: "fold", label: "Fold", min: 0, max: .3, step: .001, def: .133, unit: "of width", group: "Ribbon", why: "Sideways throw of each fold: how far the left edge jumps between slabs. Measured 160 px, 0.133 of the width." },
      { key: "width", label: "Ribbon width", min: .3, max: .95, step: .001, def: .742, unit: "of width", group: "Ribbon", why: "Width of the ribbon. Measured 890 px, 0.742 of the sheet." },
      { key: "tall", label: "Tall slabs", min: 0, max: 1, step: .01, def: .5, unit: "", group: "Ribbon", why: "Share of slabs drawn 4 units high instead of 1 or 2. The source has 2 tall, 4 middle, 4 thin." },
      { key: "margin", label: "Margin", min: 0, max: .15, step: .001, def: .047, unit: "of height", group: "Ribbon", why: "Ground left above and below the stack. Measured 74 px at the top, 85 at the foot." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 86, unit: "", group: "Ribbon", why: "Re-rolls the sequence of slab heights. The default draws 4 thin, 4 middle and 2 tall slabs, the source's counts, in its own order." },
      { key: "glowY", label: "Glow height", min: .08, max: 1.5, step: .01, def: .25, unit: "× slab height", group: "Glow", why: "Vertical reach of the ramp from the lit edge, as a share of each slab's height. Measured on the 75, 152 and 304 px slabs: yellow and pink to 0.066 of the height, blue at 0.1, dark by 0.22." },
      { key: "glowTop", label: "Shadow glow", min: .08, max: 1.5, step: .01, def: .45, unit: "× slab height", group: "Glow", why: "Vertical reach of the ramp from the edge that faces away from the light. Measured: dark at 0.35 to 0.4 of the height under the top edges, against 0.2 above the lit bottom edges." },
      { key: "glowX", label: "Glow width", min: .04, max: .8, step: .005, def: .255, unit: "× ribbon width", group: "Glow", why: "Horizontal reach of the ramp from the slanted sides. Measured 215 px on an 890 px ribbon, whatever the skew." },
      { key: "rimSide", label: "Side rim", min: .06, max: .5, step: .005, def: .23, unit: "", group: "Glow", why: "How far along the side ramp the yellow lasts before pink. Measured 0.23 on the slanted sides against 0.06 on the bottom edges: 52 px of yellow against 8." },
      { key: "topShift", label: "Shadow offset", min: 0, max: .8, step: .01, def: .08, unit: "", group: "Glow", why: "How far along the ramp an edge facing away from the light starts, on the shadow ramp (light blue to blue to dark). Measured 0.14: the top edge's tail sits 18 px ahead of the bottom edge's." },
      { key: "sideShade", label: "Side shade", min: 0, max: 1, step: .01, def: .9, unit: "", group: "Glow", why: "How far the slanted sides fall into the shadow ramp toward the edge that faces away from the light. Measured: the left side of the 304 px slab is gray blue for 26 px under its top, olive at 66 px, yellow from 106 px." },
      { key: "sideReach", label: "Side light", min: .1, max: .9, step: .01, def: .42, unit: "× slab height", group: "Glow", why: "Where the slanted side is fully lit, as a share of the slab height measured from the shadowed edge. Half shade sits at about 0.2: 16 px on the 75 px slab, 37 on the 156, 66 on the 304." },
      { key: "round", label: "Corner round", min: .005, max: .2, step: .005, def: .04, unit: "", group: "Glow", why: "Width of the smooth minimum between the four edge distances. Small values miter the bands at the corners; the source's dark interiors have rounded corners." },
      { key: "curve", label: "Ramp curve", min: .4, max: 2.5, step: .01, def: 1, unit: "γ", group: "Glow", why: "Bends the distance before it reads the ramp. Below 1 pushes the blue inward; above 1 pulls the rim colors in." },
      { key: "edge", label: "Edge", min: .5, max: 10, step: .1, def: 1.2, unit: "px", group: "Surface", why: "Width of the slab outline. Measured 1 to 2 px." },
      { key: "grain", label: "Grain", min: 0, max: 6, step: .05, def: 1, unit: "σ", group: "Surface", why: "Luminance grain over the sheet. Measured 0.8 σ on the ground, 1.8 in the dark interiors." },
      { key: "grainSize", label: "Grain size", min: 0, max: 4, step: .05, def: .7, unit: "px", group: "Surface", why: "Softening of the main grain. The ground's lag-1 correlation is 0.59." },
      { key: "mottle", label: "Mottle", min: 0, max: 1, step: .01, def: .2, unit: "", group: "Surface", why: "Share of the grain spread at 3.5 times the grain size: the slow mottle the ground's spectrum keeps below 0.05 cycles per pixel." },
      { key: "grainWhite", label: "Grain floor", min: 0, max: 1, step: .01, def: .1, unit: "", group: "Surface", why: "Share of the grain left unsoftened." },
      { key: "seam", label: "Crease", min: 0, max: 1, step: .01, def: .45, unit: "", group: "Surface", why: "Darkening of the first row under each fold, on the lower slab. Measured: the row under each fold reads 63 102 117 between 212 180 95 above and 67 124 177 below." },
      { key: "jitter", label: "Jitter", min: 0, max: 6, step: .05, def: .5, unit: "px", group: "Surface", why: "σ of the random offset at which each pixel reads the ramp, in px on the sides and on a 4-unit slab; thinner slabs take it in proportion to their height. It scatters blue specks into the pink band and pink into the yellow: high-pass σ 1.65 in the blue band, 2.5 in the pink, 0.6 in the flats." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop: the light walks once around the stack, the shadowed edge walks with it and the grain boils." }
    ],
    motion: [{ key: "phase", amp: 1, period: 48, mode: "saw" }, { key: "glowY", amp: .07, period: 9, mode: "sine" }, { key: "topShift", amp: .08, period: 13, mode: "drift" }],
    live: { x: { key: "phase", min: 0, max: 1 }, y: { key: "fold", min: 0, max: .3 } },
    bench: { palette: "measured", params: {}, note: "The stack is generated (seed 86 draws the source's 4 thin, 4 middle and 2 tall slabs in its own order). Each slab patch sits on the same material at the same place in its slab: the bottom 128 px of a tall slab, the slanted side of a tall slab at 0.22 to 0.6 of its height (mirrored, since the render's tall slabs lean the other way), the interior of a tall slab, a whole thin slab. search.py scored other spots up to 0.02 higher; they were not used.", items: [
      { name: "ground", ref: [40, 4, 1100, 66], out: [40, 4, 1100, 66], m: ["hist", "mean", "std", "spec", "ink"], inks: [[228, 227, 222]], inkNames: ["ground"] },
      { name: "bottom ramp", ref: [400, 720, 400, 128], out: [400, 566, 400, 128], m: ["hist", "mean", "std", "ink"], inks: [[254, 170, 60], [245, 141, 200], [3, 96, 217], [1, 37, 5]], inkNames: ["yellow", "pink", "blue", "dark"] },
      { name: "side ramp", ref: [150, 600, 220, 120], out: [845, 450, 220, 120], m: ["hist", "mean", "std", "ink", "share"], inks: [[228, 227, 222], [254, 170, 60], [245, 141, 200], [3, 96, 217]], inkNames: ["ground", "yellow", "pink", "blue"] },
      { name: "dark interior", ref: [450, 640, 300, 100], out: [450, 493, 300, 100], m: ["hist", "mean", "std", "spec", "ac"], lags: 8 },
      { name: "thin slab", ref: [300, 74, 600, 80], out: [300, 233, 600, 80], m: ["hist", "mean", "std", "ink"], inks: [[3, 96, 217], [1, 37, 5], [245, 141, 200]], inkNames: ["blue", "dark", "pink"] },
      { name: "whole plate", ref: [0, 0, 1199, 1697], out: [0, 0, 1199, 1697], m: ["hist", "mean", "ink", "share"], inks: [[228, 227, 222], [254, 170, 60], [245, 141, 200], [3, 96, 217], [1, 60, 120], [1, 37, 5]], inkNames: ["ground", "yellow", "pink", "blue", "deep blue", "dark"] }
    ] },
    palettes: [
      { id: "measured", name: "Pink blue", note: "measured", ground: [226, 226, 225], stops: M, shadow: MS, sw: ["#e2e2e1", "#feac34", "#f58dc8", "#0360d9", "#012505"] },
      { id: "ice", name: "Ice fold", ground: [18, 20, 26], stops: [[0, 250, 252, 255], [.06, 200, 230, 255], [.16, 120, 190, 255], [.4, 30, 90, 230], [.7, 10, 30, 110], [1, 4, 8, 24]], shadow: [[.14, 90, 140, 200], [.28, 110, 160, 230], [.4, 30, 90, 230]], sw: ["#12141a", "#fafcff", "#78beff", "#1e5ae6", "#040818"] },
      { id: "ember", name: "Ember", ground: [236, 236, 238], stops: [[0, 255, 240, 120], [.06, 255, 170, 40], [.16, 240, 80, 20], [.4, 150, 20, 40], [.7, 60, 8, 30], [1, 18, 4, 10]], shadow: [[.14, 200, 90, 60], [.28, 220, 70, 40], [.4, 150, 20, 40]], sw: ["#ececee", "#fff078", "#f05014", "#961428", "#12040a"] },
      { id: "mint", name: "Mint lab", ground: [246, 248, 250], stops: [[0, 255, 255, 255], [.06, 170, 255, 220], [.16, 40, 220, 170], [.4, 0, 140, 120], [.7, 0, 70, 70], [1, 2, 24, 28]], shadow: [[.14, 90, 200, 180], [.28, 60, 210, 180], [.4, 0, 140, 120]], sw: ["#f6f8fa", "#aaffdc", "#28dcaa", "#008c78", "#02181c"] },
      { id: "violet", name: "Violet night", ground: [30, 26, 40], stops: [[0, 255, 230, 120], [.06, 255, 150, 200], [.16, 190, 90, 255], [.4, 80, 40, 200], [.7, 30, 16, 90], [1, 8, 6, 20]], shadow: [[.14, 120, 80, 220], [.28, 140, 90, 240], [.4, 80, 40, 200]], sw: ["#1e1a28", "#ffe678", "#be5aff", "#5028c8", "#080614"] },
      { id: "mono", name: "Graphite", ground: [238, 238, 240], stops: [[0, 255, 255, 255], [.06, 210, 210, 214], [.16, 140, 140, 146], [.4, 70, 70, 76], [.7, 30, 30, 34], [1, 10, 10, 12]], shadow: [[.14, 120, 120, 126], [.28, 110, 110, 116], [.4, 70, 70, 76]], sw: ["#eeeef0", "#ffffff", "#8c8c92", "#46464c", "#0a0a0c"] }
    ],
    presets: [
      { name: "Thin stack", set: { slabs: 16, tall: 0, fold: .2 } },
      { name: "Two folds", set: { slabs: 3, tall: 1, glowY: .3, glowX: .18 } },
      { name: "Flat slab", set: { fold: 0, topShift: 0, curve: 1.6 } },
      { name: "Blue core", set: { curve: .55, glowY: .8, glowX: .45, jitter: 3 } }
    ],
    passes: ["ribbon: slab heights drawn from 1, 2 and 4 units, scaled to fill the sheet between the margins; the left edge jumps by the fold at every slab", "ramp lookups: color against the normalized distance to an edge, through 14 measured stops for the lit edge and a gray-blue start for the shadowed one", "one grain field: position-hashed noise softened 0.7 px and normalized to σ 1", "per pixel: the distance to the top, the bottom and both slanted sides, each read a grain-field jitter off; the lit bottom edge through knots read off its row means, the shadowed top edge through its own knots, the sides through a stretch that holds the yellow 0.23 of the way; the sides fall into the shadow ramp toward the top, half at 0.2 of the slab's height", "a smooth minimum of the four, so the corners round instead of mitering; one ramp lookup; the row under each fold darkened 0.45 for the crease; a 1.2 px anti-aliased outline", "the same grain field screens every tone, with a slow mottle and a 10 % white floor"],
    measured: { ground: [228, 227, 222], ground_sigma_L: .57, ground_lag1: .59, slab_heights_px: [75, 78, 151, 156, 304, 85, 78, 153, 154, 304], height_units: "1, 2 and 4 times 76 px", ribbon_width_px: 890, fold_throw_px: 160, lit_edge: { yellow_to: .016, pink_at: .039, blue_at: .117, dark_by: .24, unit: "share of the slab height", method: "row means over x 400 to 800 up from the bottom of the 304 px slab, and R > 200 widths of 4, 10 and 23 px at the bottoms of the 75, 152 and 304 px slabs" }, shadow_edge: { start: [65, 118, 180], blue_at: .15, fast_fall_to: .235, dark_by: .42, method: "column profiles under the tops of the 77 and 304 px slabs" }, side: { yellow_to_pink_px: 52, blue_at_px: 110, dark_at_px: 200, method: "row profiles from the slanted edge at mid height of the 304 px slab" }, side_shade: { full_at: .04, half_at: .2, lit_from: .4, method: "olive mix fraction of the side's first 12 px at rows 545 to 700 of the 304 px slab, and the same on the 156 and 75 px slabs" }, crease: { above: [212, 180, 95], row: [63, 102, 117], below: [67, 124, 177], method: "raw pixels across the fold at x 400 to 402" }, grain_hp_sigma: { ground: .57, dark_interior: .7, pink_to_blue: 2.8, lag1: .6, method: "L minus a 2 px gaussian" } },
    limits: ["Bench mean 0.975, lowest 0.90 (thin slab pink). The stack is generated: slab patches are matched by place in the matching slab, not by pixel; the side patch is mirrored because the render's tall slabs lean the other way.", "The thin slab's pink scores 0.90: the source's thin bottoms read peach, 208 156 169, a JPEG blend of the 4 px yellow and pink bands that the render keeps apart.", "The ground spectrum scores 0.92: the source's ground carries a slow mottle the render's 4 px mottle does not fully reach without lifting the fine grain past the measured 0.57.", "The measured palette keeps the source's light gray ground, 228 227 222; every alternate uses a neutral or cool ground."],
    source: "Reference 7: folded ribbon poster, 1199 × 1697 px",
    study: { slug: "fold-glow", lede: "A ribbon folded ten times; every fold glows inward from its edge, yellow where the light catches it, gray blue where it does not.",
      body: ["The source is one strip 890 px wide folded into ten parallelogram slabs of three heights, 76, 152 and 304 px, the left edge jumping 160 px at every fold. Each slab is a near-black green, 1 37 5, whose color depends on the distance to its nearest edge. The bottom edges are lit: yellow for 0.016 of the slab's height, pink by 0.04, blue by 0.12, dark by 0.24. The top edges are in shadow and start gray blue, 65 118 180. The slanted sides glow yellow through pink to blue over 200 px, and fall into the shadow toward the top: half shaded at 0.2 of the height, olive where the two meet. The row under each fold reads darker, 63 102 117. The grain is a dither on the ramp itself: σ 2.8 in the pink-to-blue band, 0.6 in the flats.", "The rebuild draws the ribbon from seeded heights and computes each pixel's distance to the four edges of its slab, each read a grain-field jitter off. The lit and shadowed edges each run through knots read off the source's row means; the sides use a stretch that holds the yellow longer. A smooth minimum joins the four, so corners round. One lookup turns the result into color, the crease darkens the first row under each fold, and the same grain field screens every tone. Glow height and Shadow glow set the reach of the lit and shaded ramps; Glow width sets the sides; Side shade and Side light set how the sides fall into shadow; Phase walks the light once round the stack."],
      method: "Column profiles through the slab edges · row profiles through the slanted sides · row means per band · high-pass σ per band",
      points: [
        { u: .5, v: .405, d: "KEY", label: "Lit bottom edge of the tall slab: yellow for 5 px, pink by 12, blue by 36, dark by 72.", t: "pull", dir: [0, 1] },
        { u: .5, v: .235, d: "KEY", label: "Shadowed top edge: it starts gray blue, 65 118 180, with no yellow or pink.", t: "edge", dir: [0, -1] },
        { u: .85, v: .3, d: "KEY", label: "Slanted side: yellow to pink over 52 px, blue at 110, dark at 200.", t: "pull", dir: [1, 0] },
        { u: .1, v: .24, d: "READ", label: "Side in shadow: under the top edge the side reads olive, the yellow ramp mixed into the gray blue.", t: "pull", dir: [-1, -1] },
        { u: .5, v: .33, d: "READ", label: "Interior: near-black green 1 37 5 with grain σ 0.7.", t: "grain", dir: [0, 0] },
        { u: .5, v: .162, d: "READ", label: "Thin slab: its two ramps meet, so it never reaches the dark.", t: "pull", dir: [0, 0] },
        { u: .2, v: .38, d: "READ", label: "Corner: a smooth minimum of the edge distances rounds the dark interior instead of mitering it.", t: "edge", dir: [1, 1] },
        { u: .5, v: .229, d: "KEY", label: "Crease: the row under a fold reads 63 102 117, darker than the slabs on either side.", t: "edge", dir: [0, -1] },
        { u: .45, v: .4, d: "READ", label: "Dither: where pink turns to blue the ramp read a grain-field offset off scatters blue specks into the pink, σ 2.8.", t: "grain", dir: [0, 1] },
        { u: .03, v: .5, d: "READ", label: "Ground: 228 227 222, σ 0.57 with a lag-1 correlation of 0.6.", t: "grain", dir: [-1, 0] }
      ] }
  });
})();
