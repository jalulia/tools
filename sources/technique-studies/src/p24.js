/* ===== PLATE 24 · DOTTED FLOW =====
   one wave flow (a sum of two sines in tilted coordinates, warped by slow noise) -> rows along its streamlines at
   a fixed spacing -> dots along each row at a fixed pitch, staggered row to row -> each dot takes a color from
   runs along its row, with a slow zone field deciding whether red, cream or teal leads. The dots never change size. */
(function () {
  const REF = { w: 640, h: 960 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const nA = vnoise(P.seed + 3), nB = vnoise(P.seed + 41), nC = vnoise(P.seed + 97), nZ = vnoise(P.seed + 131);
    const th = P.tilt * Math.PI / 180, ct = Math.cos(th), st = Math.sin(th), A1 = P.wave * u, lam1 = P.wavelength * u, A2 = P.wave * .45 * u, lam2 = P.wavelength * .43 * u;
    const S = P.rows * u, pitch = P.pitch * u, rd = P.radius * u, soft = P.soft * u, warp = P.turbulence * u, ph0 = (P.phase || 0) * lam1, mg = P.margin * u;
    /* the river: a band of rows around psi = pc, pulled tighter (the stream function is steeper there) */
    const pc = (-W * .5 * st + P.river * H * ct) / 1, rw = P.riverW * u, cv2 = P.converge;
    const remap = q => q + cv2 * rw * Math.tanh((q - pc) / rw);
    /* arc length along a row as a function of X */
    const X0 = -(W + H), NX = Math.ceil(2 * (W + H)) + 2, arc = new Float32Array(NX);
    const dpsi = X => A1 * 2 * Math.PI / lam1 * Math.cos(2 * Math.PI * (X + ph0) / lam1) + A2 * 2 * Math.PI / lam2 * Math.cos(2 * Math.PI * (X + ph0) / lam2 + 1.7);
    { let acc = 0; for (let i = 0; i < NX; i++) { const dp = dpsi(X0 + i); arc[i] = acc; acc += Math.sqrt(1 + dp * dp); } }
    const ground = C.ground, teal = C.teal, red = C.red, cream = C.cream, run = P.run * u;
    /* where along the plate a row starts: arc length at the left edge, so "distance from the left" is sArc - sLeft */
    const kR0 = Math.floor(remap(pc - rw * .5) / S), kR1 = Math.ceil(remap(pc + rw * .5) / S);
    /* color of dot (k, j): a field sampled along the row. zone(k, s) varies slowly along s and over a few rows across,
       so a row holds one color for a stretch; the river rows are cream end to end; above the river the cream spreads
       back along each row from the left edge, further on rows nearer the river */
    const colorOf = (k, j, sa, x, y) => {
      const sAlong = j * pitch, h = hashI(k, j, P.seed + 5);
      if (k >= kR0 && k <= kR1) return h < .06 ? teal[0] : cream;
      const below = k > kR1, dk = below ? k - kR1 : kR0 - k;
      if (!below) {
        /* the cream field: it reaches further along a row the closer the row is to the river, and ends raggedly */
        const reach = P.creamReach * W * Math.pow(Math.max(0, 1 - dk / P.creamRows), .6) + 110 * u * (hashI(k, 3, P.seed + 7) - .5) + 30 * u * (nA(sAlong / (40 * u), k * .3) - .5);
        if (dk < P.creamRows && x < mg + reach && x > 0) return h < .04 ? red : h < .07 ? teal[0] : cream;
        if (h < .006 * P.cream) return cream;
        if (h > 1 - .005 * P.red) return red;
      }
      /* runs: one zone value per stretch of row */
      const zone = nZ(sAlong / (run * 3.2) + 50, k / P.bandRows) * .65 + nA(sAlong / run, k * .61) * .35, depth = below ? Math.min(1, dk / 14) : 0;
      if (below && zone < .44 + .12 * (P.red - 1) + .05 * depth) return red;
      if (below && zone > 1 - P.green * .5) return C.green;
      if (!below && zone > 1 - P.green * .25) return C.green;
      const sh = h * P.shadeMix + (1 - P.shadeMix) * nB(sAlong / (run * .7) + 40, k * .77); return sh < P.dark ? C.deep : sh < .36 + P.dark * .3 ? teal[0] : sh < .66 ? teal[1] : teal[2];
    };
    /* pass 1: the stream function and the arc coordinate at every pixel */
    const PS = new Float32Array(W * H), SA = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const wx = warp * (nA(x / (90 * u), y / (90 * u)) - .5) * 2, wy = warp * (nB(x / (90 * u), y / (90 * u)) - .5) * 2;
      const X = (x + wx) * ct + (y + wy) * st, Y = -(x + wx) * st + (y + wy) * ct;
      /* a swirl: a dome in the stream function the upper rows bow around; a slow spread term opens and closes the gaps between rows */
      const sxr = (x - P.swirlX * W) / (P.swirlR * W), syr = (y - P.swirlY * H) / (P.swirlR * W), sw = P.swirl * W * Math.exp(-(sxr * sxr + syr * syr));
      const spr = P.spread * 120 * u * (fbm(nZ, x / (160 * u) + 7, y / (160 * u), 2) - .5);
      const psi0 = Y + A1 * Math.sin(2 * Math.PI * (X + ph0) / lam1) + A2 * Math.sin(2 * Math.PI * (X + ph0) / lam2 + 1.7) + sw + spr;
      const ai = X - X0, ii = ai | 0, k = y * W + x;
      PS[k] = remap(psi0); SA[k] = ii >= 0 && ii < NX - 1 ? arc[ii] + (arc[ii + 1] - arc[ii]) * (ai - ii) : ai;
    }
    const img = cv.getContext("2d").createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const j4 = (y * W + x) * 4, k0 = y * W + x;
        /* local frame from finite differences: n across the rows, t along them; both scales in px */
        const xl = x > 0 ? k0 - 1 : k0, xr = x < W - 1 ? k0 + 1 : k0, yu = y > 0 ? k0 - W : k0, yd = y < H - 1 ? k0 + W : k0, fx = 1 / Math.max(1, xr - xl), fy = W / Math.max(W, yd - yu);
        const gx = (PS[xr] - PS[xl]) * fx, gy = (PS[yd] - PS[yu]) * fy, gn = Math.hypot(gx, gy) || 1e-6, nx = gx / gn, ny = gy / gn;
        const sx = (SA[xr] - SA[xl]) * fx, sy = (SA[yd] - SA[yu]) * fy, an = sx * nx + sy * ny, at = Math.abs(-sx * ny + sy * nx) || 1e-6;
        const psi = PS[k0], sArc = SA[k0];
        /* nearest dot among the neighboring rows and positions */
        const kc = Math.floor(psi / S); let best = 1e9, bk = 0, bj = 0;
        for (let k = kc - 1; k <= kc + 1; k++) {
          const off = (k & 1) ? .5 * P.stagger : 0, dq0 = (psi - (k + .5) * S) / gn, sf = sArc - an * dq0, jc = Math.round(sf / pitch - off);
          for (let j = jc - 1; j <= jc + 1; j++) {
            const jx = (hashI(k, j, P.seed + 1) - .5) * P.jitter * u, jy = (hashI(k, j, P.seed + 2) - .5) * P.jitter * u;
            const dq = dq0 - jy, ds = (sf - (j + off) * pitch) / at - jx, dd = ds * ds + dq * dq;
            if (dd < best) { best = dd; bk = k; bj = j; }
          }
        }
        const inside = x >= mg && y >= mg && x < W - mg * .6 && y < H - mg;
        const rr = rd * (1 + (hashI(bk, bj, P.seed + 3) - .5) * .16 * P.vary), a = inside ? sstep(rr + soft, rr - soft, Math.sqrt(best)) : 0;
        const gr = ((hashI(x, y, P.seed + 9) - .5) * 4 + (nC(x / (5 * u) + 800, y / (5 * u)) - .5) * 5) * P.grain;
        let r = ground[0] + gr, g = ground[1] + gr, b = ground[2] + gr;
        if (a > 0) { const c = colorOf(bk, bj, SA[k0], x, y), tint = 1 + (hashI(bk, bj, P.seed + 4) - .5) * .3 * P.vary; r += (c[0] * tint - r) * a; g += (c[1] * tint - g) * a; b += (c[2] * tint - b) * a; }
        d[j4] = r < 0 ? 0 : r > 255 ? 255 : r; d[j4 + 1] = g < 0 ? 0 : g > 255 ? 255 : g; d[j4 + 2] = b < 0 ? 0 : b > 255 ? 255 : b; d[j4 + 3] = 255;
      }
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p24", no: "24", title: "Dotted Flow", ref: REF, render,
    line: "Rows of round dots along the streamlines of one flow, each dot colored by a field sampled along its row, so color runs along rows and a band of rows bunched by the flow prints as a white river.",
    params: [
      { key: "pitch", label: "Dot pitch", min: 4, max: 16, step: .05, def: 6.1, unit: "px", group: "Dots", why: "Spacing of dots along a row; the reference's nearest-neighbor spacing is 6.3 px." },
      { key: "rows", label: "Row spacing", min: 4, max: 16, step: .05, def: 6.85, unit: "px", group: "Dots", why: "Distance between rows across the flow, outside the river." },
      { key: "radius", label: "Dot radius", min: 1, max: 7, step: .05, def: 2.45, unit: "px", group: "Dots", why: "Radius of every dot; the reference's components have a median area of 21 px." },
      { key: "soft", label: "Edge softness", min: .2, max: 2, step: .01, def: 0.7, unit: "px", group: "Dots", why: "Width of each dot's edge." },
      { key: "stagger", label: "Stagger", min: 0, max: 1, step: .01, def: 1, unit: "", group: "Dots", why: "Offset of every second row by half a pitch; 1 packs the dots hexagonally, 0 aligns them in columns." },
      { key: "jitter", label: "Jitter", min: 0, max: 4, step: .01, def: 2.6, unit: "px", group: "Dots", why: "Random offset of each dot from its place on the row." },
      { key: "vary", label: "Dot variety", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Dots", why: "Per-dot variation of size and tint." },
      { key: "grain", label: "Ground grain", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Dots", why: "Speckle of the dark ground between the dots." },
      { key: "margin", label: "Margin", min: 0, max: 40, step: .5, def: 11, unit: "px", group: "Dots", why: "Bare ground around the field: 11 px on the left, top and bottom of the reference, 6 px on the right." },
      { key: "wave", label: "Wave amplitude", min: 0, max: 300, step: 1, def: 90, unit: "px", group: "Flow", why: "Swing of the main wave the rows follow." },
      { key: "wavelength", label: "Wavelength", min: 150, max: 1500, step: 5, def: 800, unit: "px", group: "Flow", why: "Length of one full wave; a second wave at 0.43 of this length rides on it." },
      { key: "tilt", label: "Tilt", min: -90, max: 90, step: .5, def: 12, unit: "°", group: "Flow", why: "Rotation of the whole flow; at 12 the rows fall gently from left to right." },
      { key: "swirl", label: "Swirl", min: -.5, max: .5, step: .005, def: .16, unit: "of width", group: "Flow", why: "Height of a dome in the stream function that the upper rows bow around; negative bows them the other way." },
      { key: "swirlX", label: "Swirl x", min: 0, max: 1, step: .005, def: .72, unit: "of width", group: "Flow", why: "Across position of the swirl." },
      { key: "swirlY", label: "Swirl y", min: 0, max: 1, step: .005, def: .12, unit: "of height", group: "Flow", why: "Down position of the swirl." },
      { key: "swirlR", label: "Swirl size", min: .1, max: 1, step: .005, def: .42, unit: "of width", group: "Flow", why: "Radius of the swirl's dome." },
      { key: "spread", label: "Row spread", min: 0, max: 1.5, step: .005, def: 0.6, unit: "", group: "Flow", why: "Slow variation of row spacing: where the rows open the dark ground shows between them as lines; where they close the dots crowd." },
      { key: "turbulence", label: "Turbulence", min: 0, max: 60, step: .5, def: 14, unit: "px", group: "Flow", why: "Slow noise warp of the coordinates, so the rows wander off the clean sine." },
      { key: "river", label: "River height", min: .15, max: .85, step: .005, def: .44, unit: "of height", group: "River", why: "Where the white river crosses the plate." },
      { key: "riverW", label: "River width", min: 4, max: 80, step: .5, def: 24, unit: "px", group: "River", why: "Width of the band of rows that print white end to end." },
      { key: "converge", label: "Converge", min: 0, max: 1.5, step: .01, def: .45, unit: "×", group: "River", why: "How much tighter the rows pack inside the river: the stream function is this much steeper there." },
      { key: "creamReach", label: "White reach", min: 0, max: .9, step: .005, def: .42, unit: "of width", group: "River", why: "How far the white field reaches along the rows just above the river, from the left edge." },
      { key: "creamRows", label: "White rows", min: 2, max: 120, step: 1, def: 70, unit: "rows", group: "River", why: "How many rows above the river the cream field covers; its reach falls off row by row, so its edge sweeps down into the river." },
      { key: "run", label: "Run length", min: 5, max: 200, step: 1, def: 110, unit: "px", group: "Color", why: "Length of the color runs along a row." },
      { key: "bandRows", label: "Band rows", min: 1, max: 30, step: .5, def: 1.6, unit: "rows", group: "Color", why: "Across the flow, how many rows share a run's color before the field changes." },
      { key: "red", label: "Red", min: 0, max: 1.5, step: .01, def: 1, unit: "×", group: "Color", why: "Share of red runs below the river." },
      { key: "green", label: "Green", min: 0, max: 1, step: .01, def: .3, unit: "×", group: "Color", why: "Share of dark green runs." },
      { key: "shadeMix", label: "Shade mix", min: 0, max: 1, step: .01, def: 0, unit: "", group: "Color", why: "How the three teals are chosen: 0 runs them along the rows like the red, 1 scatters them dot by dot." },
      { key: "dark", label: "Dark teal", min: 0, max: .5, step: .01, def: 0.15, unit: "share", group: "Color", why: "Share of teal dots printed in the deep teal that barely lifts off the ground; they read as gaps in the rows." },
      { key: "cream", label: "Stray white", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Color", why: "Single white dots scattered in the teal above the river: one in 170 at 1." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 8, unit: "", group: "Color", why: "Re-rolls the warp, the runs and the bands." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop: slides the wave along the rows." }
    ],
    motion: [{ key: "phase", amp: 1, period: 30, mode: "saw" }, { key: "turbulence", amp: 8, period: 13, mode: "sine" }],
    live: { x: { key: "tilt", min: -20, max: 40 }, y: { key: "river", min: .2, max: .8 } },
    presets: [
      { name: "Sparse beads", set: { pitch: 11, rows: 11, radius: 3.2, jitter: 2 } },
      { name: "Straight weave", set: { wave: 0, turbulence: 0, tilt: 0, stagger: 0, converge: 0 } },
      { name: "Red tide", set: { red: 1.5, creamRows: 10, run: 120, river: .3 } },
      { name: "Fine grid", set: { pitch: 4.5, rows: 4.2, radius: 1.7, soft: .4 } }
    ],
    palettes: [
      { id: "measured", name: "Teal, red, white", note: "measured", c: { ground: [52, 51, 49], teal: [[44, 103, 113], [58, 118, 128], [54, 123, 110]], green: [36, 96, 72], deep: [38, 74, 80], red: [214, 58, 56], cream: [246, 241, 228] }, sw: ["#343331", "#2e6973", "#cc3a3a", "#e8e2d0"] },
      { id: "indigo", name: "Indigo and gold", c: { ground: [24, 26, 40], deep: [30, 36, 80], green: [30, 50, 110], teal: [[50, 70, 150], [70, 90, 170], [40, 80, 160]], red: [240, 180, 60], cream: [230, 230, 236] }, sw: ["#181a28", "#324696", "#f0b43c", "#e6e6ec"] },
      { id: "moss", name: "Moss and rust", c: { ground: [40, 44, 36], deep: [46, 66, 40], green: [50, 80, 40], teal: [[70, 110, 60], [90, 130, 70], [60, 120, 80]], red: [190, 90, 40], cream: [226, 230, 222] }, sw: ["#282c24", "#466e3c", "#be5a28", "#dcd6be"] },
      { id: "night", name: "Night", c: { ground: [10, 10, 14], deep: [24, 24, 36], green: [30, 30, 50], teal: [[40, 40, 60], [60, 60, 90], [50, 50, 80]], red: [230, 60, 90], cream: [240, 240, 250] }, sw: ["#0a0a0e", "#3c3c5a", "#e63c5a", "#f0f0fa"] },
      { id: "paper", name: "On white", c: { ground: [244, 244, 242], deep: [150, 190, 196], green: [30, 90, 70], teal: [[40, 110, 120], [60, 130, 140], [50, 125, 115]], red: [210, 50, 50], cream: [120, 120, 120] }, sw: ["#f4f4f2", "#286e78", "#d23232", "#787878"] },
      { id: "mono", name: "Graphite", c: { ground: [30, 30, 32], deep: [60, 60, 64], green: [90, 90, 96], teal: [[110, 110, 116], [130, 130, 136], [120, 120, 126]], red: [230, 230, 234], cream: [70, 70, 74] }, sw: ["#1e1e20", "#6e6e74", "#e6e6ea", "#46464a"] }
    ],
    bench: { palette: "measured", params: {}, note: "The composition moved (white field, river, red half), so the teal field, red field, white rows and zone edge rects were re-picked with search.py on the plate's own zones: teal above the river at (192, 96), red below it at (512, 720), white rows in the white field at (112, 64), the river edge at (448, 448). The whole plate compares in place.", items: [
      { name: "teal field", ref: [200, 300, 128, 128], out: [192, 96, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 8, inks: [[50, 52, 50], [52, 112, 116], [203, 58, 58], [230, 223, 206]], inkNames: ["ground", "teal", "red", "cream"] },
      { name: "red field", ref: [60, 640, 128, 128], out: [512, 720, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 8, inks: [[50, 52, 50], [52, 112, 116], [203, 58, 58], [230, 223, 206]], inkNames: ["ground", "teal", "red", "cream"] },
      { name: "white rows", ref: [40, 160, 128, 128], out: [112, 64, 128, 128], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[50, 52, 50], [52, 112, 116], [203, 58, 58], [230, 223, 206]], inkNames: ["ground", "teal", "red", "cream"] },
      { name: "zone edge", ref: [300, 420, 192, 96], out: [448, 448, 192, 96], m: ["hist", "mean", "std", "ink", "share"], inks: [[50, 52, 50], [52, 112, 116], [203, 58, 58], [230, 223, 206]], inkNames: ["ground", "teal", "red", "cream"] },
      { name: "whole plate", ref: [0, 0, 640, 960], out: [0, 0, 640, 960], m: ["hist", "mean", "std", "ink", "share"], inks: [[50, 52, 50], [52, 112, 116], [203, 58, 58], [230, 223, 206]], inkNames: ["ground", "teal", "red", "cream"] }
    ] },
    passes: ["flow: tilted coordinates warped by slow noise; a stream function of two sines, a dome the upper rows bow around, and a slow term that opens and closes the gaps between rows", "the river: around one level of the stream function the function is made steeper, so a band of rows packs 1.45 times tighter and crosses the plate as one bundle", "pass 1 stores the stream function and the arc coordinate at every pixel; pass 2 reads the local frame from their differences, so each dot stays round where the rows bend, fan or bunch", "dots: along every row at a fixed pitch, every second row offset by half a pitch; each dot jittered and sized by a hash; every pixel takes the nearest dot through a soft edge", "color: one field sampled along each row, in row and arc coordinates, so a row holds a color for a run and the next row may differ; river rows print white end to end; above the river the white reaches back along each row from the left edge, further on rows nearer the river, with a ragged end per row; below it the runs turn red; teals and a deep teal fill the rest", "ground: dark gray with a 1 px speckle and an 11 px bare margin"],
    measured: { ground_median: [53, 51, 48], dot_component_area_px: { median: 21, p25: 19, p75: 25, radius_px: 2.6, method: "connected components of pixels above L 75" }, nearest_neighbor_px: { nn1: 6.3, nn2: 6.53 }, lattice_evidence: "autocorrelation of the dot mask peaks at 6.4, 12.8 and 19.2 px along one direction", dot_colors_kmeans: { red: [200, 58, 58], teal: [[46, 105, 115], [57, 117, 128], [54, 123, 112]], white: [234, 229, 214] }, margin_px: { left: 11, top: 10, right: 6, bottom: 10, method: "column and row means of L fall to the ground's 53" }, river: "a band of 4 to 6 white rows from (0, 380) through (300, 430) to (640, 470), rows tighter than the field around it", white_field: "upper left, x under 200 at the top, its edge sweeping down to the river by x 120 at y 350", shares_whole: { ground: .6, teal: .235, red: .092, white: .072, method: "nearest-ink share over the whole plate" }, rejected: "a 2-D blob field for color (the first build): it printed red as patches that cut across rows; the reference's red runs along rows" },
    limits: ["Benchmark mean 0.953, lowest 0.80 (red field texture spectrum). Under 98 % on: the tone histograms (0.86 to 0.89) and the red field's spectrum and autocorrelation (0.80, 0.82). The reference's dots are hand-placed along each streamline, so neighboring rows do not keep a fixed phase and its autocorrelation decays to zero by lag 4; the plate's rows keep a half-pitch stagger, which leaves a rebound at lags 5 to 7 even with 2.6 px of jitter. The white field's histogram misses because the reference's white dots run in many tints from (210,200,180) to (250,248,240) and the plate's vary by 15 %.", "The flow is an original arrangement: the white field, the river and the red half sit where the reference's do in outline, the rows and runs do not, so four of the five rects were placed with search.py.", "Dots that fall below L 75 (the darkest teals) were not separated by the component measure, so the dot radius may be read slightly small."],
    source: "Reference 24: pointillist flow print in teal, red and white on dark gray, 640 × 960 px PNG.",
    study: {
      slug: "dotted-flow", lede: "One flow, rows of one dot: color runs along each row, and a white river is a band of rows that never change color.",
      body: ["The reference is a field of round dots about 5 px across laid along the streamlines of a flow on a dark gray ground. Neighbors sit 6.3 px apart, so the dots pack nearly hexagonally, and the rows show as rows only where the flow opens a gap of ground between them. Color comes in runs along a row: a row is red for a stretch, then teal. A white field in the upper left is made of whole rows of white dots; its rows sweep down into a white river 4 to 6 rows wide that crosses the plate, packed tighter than the rows around it. Below the river red runs dominate. Nothing is shaded and the dot size never changes.", "The rebuild keeps that chain. A stream function of two sines in tilted, noise-warped coordinates sets the rows, with a dome for the upper swirl and a slow term that opens and closes the gaps. Around one level the function is steeper, so a band of rows bunches into the river. Dots sit along each row at a fixed pitch and take their color from a field sampled in row and arc coordinates, so color runs along rows. River rows print white end to end; above the river, white reaches back along each row from the left edge, further on rows nearer the river. Pitch, rows and radius are the dots; wave, tilt, swirl and spread are the flow; river height, width, converge, reach and rows set the white; run length, band rows and red set the runs."],
      method: "Stream function with a swirl and a steep band · local frame per pixel · dots at fixed pitch along each row · color sampled along the row",
      points: [
        { u: .15, v: .15, d: "KEY", label: "The white field: whole rows of white dots, each ending at its own place as it meets the teal.", t: "tone", dir: [1, 1] },
        { u: .58, v: .48, d: "KEY", label: "The river: rows of white packed 1.45 times tighter than the rows beside them, running the width of the plate.", t: "flow", dir: [1, 0] },
        { u: .3, v: .62, d: "KEY", label: "Red runs: a row is red for 100 px or more, then teal; the next row changes on its own schedule.", t: "tone", dir: [1, 0] },
        { u: .6, v: .2, d: "READ", label: "The swirl: rows bow around a dome in the stream function and spread apart, so the ground shows between them.", t: "flow", dir: [1, -1] },
        { u: .8, v: .35, d: "READ", label: "Teal runs in three shades and a deep teal that barely lifts off the ground, chosen along the row.", t: "tone", dir: [0, 0] },
        { u: .5, v: .85, d: "READ", label: "Where rows bunch, the dots stay round: the local frame comes from the stream function's own slope.", t: "grain", dir: [0, 1] },
        { u: .9, v: .7, d: "READ", label: "A dark green run among the red and teal below the river.", t: "tone", dir: [1, 0] },
        { u: .35, v: .25, d: "READ", label: "A stray white dot in the teal: one dot in 170 above the river.", t: "grain", dir: [0, 0] },
        { u: .01, v: .5, d: "READ", label: "The margin: 11 px of bare ground, then the rows begin mid-dot.", t: "edge", dir: [1, 0] },
        { u: .7, v: .95, d: "READ", label: "Ground between dots: dark gray with a 1 px speckle, about 60 % of the plate.", t: "paper", dir: [0, 0] }
      ]
    }
  });
})();
