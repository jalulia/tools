/* ===== PLATE 08 · INTERFERENCE =====
   two (or more) point sources each throw a cosine ring system whose amplitude dies with distance;
   the rings add, the sum is normalized by the local envelope and cut hard into six inks. Which ink a
   band gets depends on how near the sources it sits: a red crest set close in, a green trough set in a
   capsule around them, a black/white/blue/yellow set outside. One field, three ink sets, no shading. */
(function () {
  const REF = { w: 720, h: 734 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const nW = vnoise(P.seed + 5), nR = vnoise(P.seed + 23), wl = (P.warpLen ?? 170) * u, wa = P.warp * 16 * u;
    /* sources on a tilted axis through the plate center */
    const N = Math.round(P.sources), sep = P.separation * H, th = P.tilt * Math.PI / 180, cx = W * .5, cy = H * .5, ax = Math.sin(th), ay = Math.cos(th);
    const S = [];
    for (let i = 0; i < N; i++) { const t = N === 1 ? 0 : (i / (N - 1) - .5) * sep * (N === 2 ? 1 : 1.25), sw = N > 2 ? (i % 2 ? 1 : -1) * sep * .22 : 0; S.push([cx + ax * t + ay * sw, cy + ay * t - ax * sw]); }
    const p = P.pitch * u, k2 = 2 * Math.PI / p, R0 = (P.reach ?? 1) * H * .2, decay = P.decay, Rh = P.hole * H * .028, Rc = P.capsule * H * .31;
    const bias = P.capsBias, sd = P.saddle, T = [P.trough, P.trough + P.ringW, -sd, sd, P.crest - P.ringW * .8, P.crest], T1 = [P.trough * .75, P.trough * .75 + P.ringW * .5, -sd, sd, T[4] - bias, T[5] - bias], Tr = P.redDuty, lensK = P.lens, diag = Math.hypot(W, H) * .5, wob = P.wobble, par = Math.cos(P.near * Math.PI / 180), gate = P.gate, eye = C.eye || C.green;
    const Z0 = [C.yellow, C.black, C.yellow, C.white, C.blue, C.white, C.black], Z1 = [C.green, C.green, C.yellow, C.white, C.yellow, C.white, C.black];
    const img = cv.getContext("2d").createImageData(W, H), d = img.data;
    const seg = (x, y, a, b) => { const vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1; let t = ((x - a[0]) * vx + (y - a[1]) * vy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(x - a[0] - vx * t, y - a[1] - vy * t); };
    const ux = new Float32Array(N), uy = new Float32Array(N), cs = new Float32Array(N), am = new Float32Array(N);
    /* sheet warp on a coarse grid, resampled; zone wobble as a table over angle */
    const cw = Math.max(2, Math.ceil(W / (4 * u))), chh = Math.max(2, Math.ceil(H / (4 * u))), gx = new Float32Array(cw * chh), gy = new Float32Array(cw * chh);
    for (let j = 0; j < chh; j++) for (let i = 0; i < cw; i++) { const x = (i + .5) * W / cw, y = (j + .5) * H / chh; gx[j * cw + i] = (nW(x / wl, y / wl) - .5) * wa; gy[j * cw + i] = (nR(x / wl + 7, y / wl + 3) - .5) * wa; }
    const WX = wa > 0 ? upsampleCR(gx, cw, chh, W, H) : null, WY = wa > 0 ? upsampleCR(gy, cw, chh, W, H) : null;
    const NA = 1024, TW1 = new Float32Array(NA), TW2 = new Float32Array(NA);
    for (let i = 0; i < NA; i++) { const an = i / NA * 2 * Math.PI, ca = Math.cos(an), sa = Math.sin(an); TW1[i] = 1 + wob * (nW(ca * 2.2 + 3, sa * 2.2 + 3) - .5); TW2[i] = 1 + wob * (nR(ca * 1.7 + 9, sa * 1.7 + 9) - .5); }
    const ampP = P.amp, lensCut = P.lensCut ?? .8, slip = P.slip, ph0 = -P.phase * 2 * Math.PI, spk = 1.8 * u, spx = Rh * .35, spy = -Rh * .3;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = y * W + x, wx = WX ? x + WX[k] : x, wy = WY ? y + WY[k] : y;
      /* lens: the sheet bulges, rings stretch toward the edges */
      const dx = wx - cx, dy = wy - cy, rho = Math.hypot(dx, dy) / diag, q = 1 + lensK * rho * rho, X = cx + dx * q, Y = cy + dy * q;
      let num = 0, den = 0, rmin = 1e9, dseg = 1e9, dom = 0, imin = 0;
      for (let i = 0; i < N; i++) {
        const ddx = X - S[i][0], ddy = Y - S[i][1], r = Math.hypot(ddx, ddy) + 1e-3, a = Math.pow(1 + r / R0, -decay), c = Math.cos(k2 * r + slip * i + ph0 * (1 + .25 * i));
        num += a * c; den += a; if (r < rmin) { rmin = r; imin = i; } ux[i] = ddx / r; uy[i] = ddy / r; cs[i] = c; am[i] = a; if (a > am[dom]) dom = i;
        if (i) { const ds = seg(X, Y, S[i - 1], S[i]); if (ds < dseg) dseg = ds; }
      }
      if (N === 1) dseg = rmin;
      /* parallelism: how nearly the ring trains run together here (|cos| of the angle between neighboring rays) */
      let pl = 0, oth = dom === 0 ? 1 : 0; for (let i = 1; i < N; i++) { const c = Math.abs(ux[i] * ux[i - 1] + uy[i] * uy[i - 1]); if (c > pl) pl = c; if (i !== dom && am[i] > am[oth]) oth = i; }
      const g = num * ampP, ai = ((Math.atan2(Y - cy, X - cx) / (2 * Math.PI) + 1) * NA | 0) % NA, w1 = TW1[ai], w2 = TW2[ai];
      let col;
      if (rmin < Rh) col = Math.hypot(X - S[imin][0] - spx, Y - S[imin][1] - spy) < spk ? C.white : eye;   /* the eye, with its pinprick */
      else if (N > 1 && pl > par * w1 && den > gate) {
        /* red set: the dominant train prints red on its crests, black in its troughs; the weaker train's crest shows as a yellow lens in the trough, the trough floor as a blue or white line */
        col = g >= Tr ? C.red : (cs[oth] > lensCut && cs[dom] < -.3) ? C.yellow : g < Tr - .3 ? C.white : g < Tr - .18 ? C.blue : C.black;
      } else { const Z = dseg < Rc * w2 ? Z1 : Z0, TT = Z === Z1 ? T1 : T; col = g < TT[0] ? Z[0] : g < TT[1] ? Z[1] : g < TT[2] ? Z[2] : g < TT[3] ? Z[3] : g < TT[4] ? Z[4] : g < TT[5] ? Z[5] : Z[6]; }
      const j = k * 4; d[j] = col[0]; d[j + 1] = col[1]; d[j + 2] = col[2]; d[j + 3] = 255;
    }
    /* press: a little ink spread, the same on every edge */
    if (P.spread > .04) {
      const n = W * H, ch = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
      for (let i = 0, j = 0; i < n; i++, j += 4) { ch[0][i] = d[j]; ch[1][i] = d[j + 1]; ch[2][i] = d[j + 2]; }
      const bl = ch.map(c => gblur(c, W, H, P.spread * u));
      for (let i = 0, j = 0; i < n; i++, j += 4) { const nz = (hashI(i % W, i / W | 0, P.seed) - .5) * P.grain; d[j] = bl[0][i] + nz; d[j + 1] = bl[1][i] + nz; d[j + 2] = bl[2][i] + nz; }
    } else if (P.grain > 0) for (let i = 0, j = 0; i < W * H; i++, j += 4) { const nz = (hashI(i % W, i / W | 0, P.seed) - .5) * P.grain; d[j] = clamp(d[j] + nz, 0, 255); d[j + 1] = clamp(d[j + 1] + nz, 0, 255); d[j + 2] = clamp(d[j + 2] + nz, 0, 255); }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p8", no: "08", title: "Interference", ref: REF, render,
    line: "Two ring systems whose amplitude fades with distance, added and cut hard at fixed levels into six inks whose assignment changes with distance from the sources.",
    params: [
      { key: "pitch", label: "Ring pitch", min: 8, max: 60, step: .1, def: 26.7, unit: "px", group: "Waves", why: "Wavelength of every ring system. Sets the lozenge lattice with it." },
      { key: "separation", label: "Source gap", min: .05, max: .8, step: .005, def: .34, unit: "of height", group: "Waves", why: "Distance between the sources. Closer sources make wider, flatter lozenges." },
      { key: "tilt", label: "Axis tilt", min: -89, max: 75, step: .5, def: -12, unit: "°", group: "Waves", why: "Rotates the line the sources sit on." },
      { key: "sources", label: "Sources", min: 1, max: 4, step: 1, def: 2, unit: "", group: "Waves", why: "How many ring systems beat together. One is plain rings; three or four stagger off the axis." },
      { key: "decay", label: "Amplitude decay", min: 0, max: 3, step: .01, def: 1.75, unit: "", group: "Waves", why: "How fast each wave fades with distance. 0 gives equal waves everywhere, so no source ever dominates its own neighborhood." },
      { key: "slip", label: "Ring slip", min: 0, max: 3.14, step: .01, def: 0, unit: "rad", group: "Waves", why: "Offsets the second train against the first by this phase; the lattice walks sideways." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. Advances the first ring train one wavelength outward and the second 1.25, so the lattice drifts as the trains travel." },
      { key: "lens", label: "Lens", min: -.5, max: 1.2, step: .01, def: .06, unit: "", group: "Waves", why: "Barrel bulge of the sheet: rings stretch toward the edges." },
      { key: "warp", label: "Sheet warp", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Waves", why: "Slow, uneven stretch of the sheet, so the lattice never repeats exactly and the local pitch drifts as it does in the print." },
      { key: "amp", label: "Wave height", min: .3, max: 3, step: .01, def: 0.8, unit: "×", group: "Cut", why: "Height of every wave against fixed cut levels. Higher pushes more of the sheet into the core inks and thins the lines between." },
      { key: "crest", label: "Crest cut", min: .02, max: .8, step: .005, def: 0.15, unit: "", group: "Cut", why: "Height above which a crest prints as a solid core. Lower makes fatter lenses; far out, where the waves are low, only beats reach it." },
      { key: "ringW", label: "Ring width", min: 0, max: .4, step: .005, def: 0.1, unit: "", group: "Cut", why: "Depth of the band that rings each core." },
      { key: "trough", label: "Trough cut", min: -.8, max: -.05, step: .005, def: -0.18, unit: "", group: "Cut", why: "Depth below which a trough prints as its own core." },
      { key: "saddle", label: "Saddle line", min: 0, max: .12, step: .002, def: 0.015, unit: "", group: "Cut", why: "Half-width of the thin white line drawn where the wave crosses zero: the grid between cells and the rim of every diamond. 0 removes it." },
      { key: "redDuty", label: "Red duty", min: -.6, max: .6, step: .01, def: -.1, unit: "", group: "Cut", why: "Height at which the red set switches from black to red along a wave. 0 is half the cycle close to a source." },
      { key: "capsBias", label: "Capsule bias", min: -.2, max: .4, step: .005, def: .0, unit: "", group: "Cut", why: "Lowers the crest cuts inside the capsule, so black cores grow into diamonds there." },
      { key: "near", label: "Red angle", min: 0, max: 90, step: .5, def: 38, unit: "°", group: "Zones", why: "The red set prints where the two ring trains run within this angle of parallel: the far side of each source and the strip between them." },
      { key: "gate", label: "Red gate", min: 0, max: 1.4, step: .01, def: 0.4, unit: "", group: "Zones", why: "Wave strength the red set also needs, which keeps it out of the far corners." },
      { key: "hole", label: "Eye", min: 0, max: 4, step: .01, def: 1, unit: "×", group: "Zones", why: "Flat green disc at the heart of each source." },
      { key: "capsule", label: "Green capsule", min: 0, max: 2.2, step: .01, def: 0.85, unit: "×", group: "Zones", why: "Radius of the capsule around the sources where troughs print green." },
      { key: "wobble", label: "Zone wobble", min: 0, max: 1.2, step: .01, def: .3, unit: "", group: "Zones", why: "Low-frequency wander of the zone edges so they do not read as compass circles." },
      { key: "spread", label: "Ink spread", min: 0, max: 3, step: .01, def: 0.6, unit: "px", group: "Press", why: "Softening of every edge, as the inks bleed a little into the sheet." },
      { key: "grain", label: "Grain", min: 0, max: 60, step: .1, def: 10, unit: "", group: "Press", why: "Fine position-hashed noise on top of the inks." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 8, unit: "", group: "Press", why: "Re-rolls the zone wobble and grain." }
    ],
    presets: [
      { name: "Plain rings", set: { sources: 1, capsule: 0, hole: 0 } },
      { name: "Three beats", set: { sources: 3, separation: .5, tilt: 30, pitch: 18, decay: .6 } },
      { name: "Fat lenses", set: { crest: .08, ringW: .06, trough: -.2, pitch: 40 } },
      { name: "All red", set: { near: 80, gate: 0, redDuty: -.15, hole: 2 } }
    ],
    motion: [{ key: "phase", amp: 1, period: 8, mode: "saw" }, { key: "tilt", amp: 3, period: 14, mode: "sine" }],
    live: { x: { key: "tilt", min: -45, max: 45 }, y: { key: "separation", min: .15, max: .6 } },
    bench: { palette: "measured", params: {}, note: "The composition is the plate's own (tilted axis, different source gap), so output rects were chosen with search.py over the same patch size; the whole plate and the eye are compared in place.", items: [
      { name: "lozenge field", ref: [20, 280, 128, 192], out: [20, 280, 128, 192], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 14, inks: [[9, 10, 5], [234, 245, 244], [233, 239, 80], [151, 185, 214]], inkNames: ["black", "white", "yellow", "blue"] },
      { name: "capsule field", ref: [150, 330, 128, 128], out: [150, 330, 128, 128], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[9, 10, 5], [234, 245, 244], [233, 239, 80], [34, 66, 10]], inkNames: ["black", "white", "yellow", "green"] },
      { name: "red rings", ref: [300, 560, 128, 96], out: [300, 560, 128, 96], m: ["hist", "mean", "std", "ink", "share"], inks: [[209, 54, 28], [9, 10, 5], [151, 185, 214]], inkNames: ["red", "black", "blue"] },
      { name: "corner stripes", ref: [560, 40, 128, 128], out: [560, 40, 128, 128], m: ["hist", "mean", "std", "spec", "ac"], lags: 14 },
      { name: "eye", ref: [340, 497, 16, 16], out: [326, 481, 16, 16], m: ["hist", "mean", "std", "ink"], inks: [[14, 56, 9]], inkNames: ["eye"] },
      { name: "whole plate", ref: [0, 3, 720, 728], out: [0, 3, 720, 728], m: ["hist", "mean", "ink", "share"], inks: [[9, 10, 5], [234, 245, 244], [233, 239, 80], [151, 185, 214], [209, 54, 28], [34, 66, 10]], inkNames: ["black", "white", "yellow", "blue", "red", "green"] }
    ] },
    palettes: [
      { id: "measured", name: "Six-ink", note: "measured", c: { black: [9, 10, 5], white: [234, 245, 244], yellow: [233, 239, 80], blue: [151, 185, 214], red: [209, 54, 28], green: [34, 66, 10], eye: [14, 56, 9] }, sw: ["#090a05", "#e9ef50", "#97b9d6", "#d1361c"] },
      { id: "cobalt", name: "Cobalt press", c: { black: [12, 14, 40], white: [240, 244, 250], yellow: [255, 200, 40], blue: [40, 90, 220], red: [255, 60, 90], green: [10, 60, 120] }, sw: ["#0c0e28", "#ffc828", "#285adc", "#ff3c5a"] },
      { id: "mono", name: "Carbon", c: { black: [14, 14, 16], white: [242, 242, 244], yellow: [190, 190, 196], blue: [120, 122, 128], red: [60, 60, 66], green: [40, 40, 44] }, sw: ["#0e0e10", "#bebec4", "#787a80", "#f2f2f4"] },
      { id: "acid", name: "Acid", c: { black: [20, 10, 30], white: [240, 255, 240], yellow: [200, 255, 40], blue: [120, 240, 230], red: [255, 40, 160], green: [40, 110, 60] }, sw: ["#140a1e", "#c8ff28", "#78f0e6", "#ff28a0"] },
      { id: "ember", name: "Ember", c: { black: [30, 12, 8], white: [255, 240, 230], yellow: [255, 170, 40], blue: [200, 120, 80], red: [220, 30, 20], green: [90, 30, 20] }, sw: ["#1e0c08", "#ffaa28", "#c87850", "#dc1e14"] },
      { id: "arctic", name: "Arctic", c: { black: [20, 30, 50], white: [248, 252, 255], yellow: [190, 230, 255], blue: [90, 150, 210], red: [30, 70, 140], green: [60, 100, 150] }, sw: ["#141e32", "#bee6ff", "#5a96d2", "#1e468c"] }
    ],
    passes: ["sources placed on a tilted axis through the plate center", "per pixel: lens bulge of the coordinates, then distance to each source", "each source: cosine ring train, amplitude falling as (1 + r/R)^-decay; the trains are summed, so close to a source its own train swings past every cut and far out only beats reach the core cuts", "zones: eye disc at each source; red set where the two trains run within a set angle of parallel and the sum is still strong (the far side of each source and the strip between them); green capsule by distance to the axis; outside", "one hard cut into seven bands (trough core, trough ring, field, saddle line, field, crest ring, crest core), each zone with its own ink set", "press: equal ink spread on every edge, position-hashed grain"],
    measured: { ring_pitch_px: 26.7, pitch_method: "autocorrelation of the radial luminance profile around each source: peaks at lags 14 and 27-28; joint fit of a two-cosine model to the black lens mask gives 26.7", sources_px: [[361, 255], [360, 503]], source_method: "center that maximizes the variance of the angle-averaged radial profile", lens_lattice_px: { column: 14.5, row: 31 }, outer_cut_sequence: "trough yellow < black < yellow < blue < white < black crest, bins of f at -1.6, -0.8, -0.2, 0.8, 1.4 on a sum in [-2, 2]", near_source_cycle: "red 50 %, black 37 %, blue/white line 12 % (phase table at pitch 26.5)", red_reach_px: 175, green_capsule_halfwidth_px: 225, eye_radius_px: 20, inks: { black: [9, 10, 5], white: [234, 245, 244], yellow: [233, 239, 80], blue: [151, 185, 214], red: [209, 54, 28], green: [34, 66, 10] }, strict_shares: { black: .243, white: .107, yellow: .053, blue: .061, red: .032, green: .032 }, edge_width_20_80_px: 3 },
    limits: ["Benchmark mean 0.89. Tone histograms (0.70 to 0.85) miss because the reference is a soft, upscaled JPEG whose 3 px edge ramps put 15 to 20 % of every patch in mid-tones; the plate spreads ink 0.6 px and keeps its edges, since more spread cost the texture spectrum more than it gained.", "Ink colors score 0.8 to 0.96 for the same reason: the reference's per-ink class means are pulled toward gray by edge mixes.", "The eye patch's contrast (0.26) is JPEG noise in a flat disc, 11 levels of standard deviation; the plate keeps 10 levels of grain, 3 after rounding, instead of chasing it.", "Inside the capsule the reference cuts black diamonds with white rims where the two trains are equal; the plate's capsule is dominated by the nearer source in its tilted composition, so those read as rounded blocks.", "The reference is warped unevenly (local pitch 25 to 29.5 px); the plate uses a smooth sheet warp and a lens bulge instead, and its ink zones are a parallelism test and a capsule, not the reference's hand-masked shapes."],
    source: "Reference 8: two-source ring interference artwork, 720 × 734 px JPEG",
    study: { slug: "interference", lede: "Two ring systems added and cut hard into six inks.", body: ["Two point sources 248 px apart each throw a train of concentric rings with a 26.7 px pitch. Where the trains cross, their sum beats. Along the line between the sources the crests line up into stacked lenses. Out to the sides they lock into a lattice of lozenges, 14.5 px between columns and 31 px between rows in the reference. In the corners both trains arrive nearly parallel and the lattice slides into long diagonal stripes. The amplitude of each train fades with distance as (1 + r/147 px)^-1.75, so close to a source its own rings win and the pattern reads as clean circles.", "The plate computes that sum per pixel and cuts it at fixed heights into seven bands: a core and a ring on each side of zero, a field either side, and a thin line on the zero crossing that draws the grid between cells. Because the cuts are fixed and the waves fade, a source swings its neighborhood through every band with thin lines between, while in the far corners only the beats of two weak trains reach a core. Which ink each band gets depends on the zone. A red set prints where the two trains run within 38 degrees of parallel and the sum is still above the gate. A green trough set prints inside a capsule 193 px around the axis. A black, white, blue and yellow set prints outside. Ink spread of 0.6 px is the press."], method: "two fading cosine ring trains · summed · seven-band cut at fixed levels · three ink sets by zone · ink spread", points: [
      { u: .5, v: .35, d: "KEY", label: "A source: its own rings dominate here, so the cut reads as clean red circles with thin black and blue lines.", t: "pull", dir: [0, -1] },
      { u: .5, v: .52, d: "KEY", label: "Between the sources the crests of both trains line up: stacked horizontal lenses along the axis.", t: "pull", dir: [1, 0] },
      { u: .12, v: .5, d: "KEY", label: "Far to the side the two trains are equal in height: a lattice of lozenges on a 14.5 by 31 px cell, black crest cores ringed white, yellow trough cores ringed black.", t: "grain", dir: [1, 0] },
      { u: .88, v: .12, d: "READ", label: "In the corner both trains arrive almost parallel, so the lattice stretches into long diagonal stripes.", t: "pull", dir: [-1, 1] },
      { u: .3, v: .45, d: "READ", label: "Inside the capsule the trough ink switches to green: same lattice, different set.", t: "grain", dir: [1, 0] },
      { u: .5, v: .69, d: "READ", label: "The eye: a flat green disc of 20 px radius at the heart of the lower source, with one white pinprick.", t: "pull", dir: [0, 1] },
      { u: .36, v: .35, d: "READ", label: "The edge of the red reach cuts straight through lenses; the zone is a mask, not a feature of the wave.", t: "edge", dir: [-1, 0] },
      { u: .5, v: .05, d: "READ", label: "Above the upper source: red rings with yellow lens ends where the lower train still adds a little.", t: "pull", dir: [0, -1] },
      { u: .2, v: .85, d: "READ", label: "Lower corner: the lozenges tilt the other way because the sources now sit above.", t: "grain", dir: [1, -1] },
      { u: .5, v: .5, d: "READ", label: "Zoom in: every edge carries the same 0.6 px ink spread, measured against a 3 px ramp in the reference.", t: "edge", dir: [0, 1] }
    ] }
  });
})();
