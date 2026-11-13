/* ===== PLATE 14 · FRACTAL FROST =====
   an escape-time field (z -> z^2 + c over a warped window near a branch point of the set) gives two numbers per
   pixel: the smooth escape count and the angle of z when it leaves. The count, on a log scale, picks a color
   from a cyclic ramp; the angle draws field-line filaments; pixels that stay longest are the speckled ground. */
(function () {
  const REF = { w: 736, h: 1308 };
  const SITES = { frost: [-0.5577, 0.6359, .02], fern: [0.27322626, 0.595153338, .01], star: [-0.235125, 0.827215, .01] };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, n = W * H, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 6151 + 29), site = SITES[P.site] || SITES.frost;
    const span = site[2] * P.zoom, sc = span / W, rot = P.rot * Math.PI / 180, ca = Math.cos(rot), sa = Math.sin(rot);
    const c0x = site[0] + (P.panX + (rnd() - .5) * .3) * site[2], c0y = site[1] + ((P.panY ?? 0) + (rnd() - .5) * .3) * site[2];
    /* 1 — warp: stretched value noise on a coarse grid, a smooth part and a ridged part that kinks the lines */
    const cell = 4 * u, gw = Math.ceil(W / cell) + 2, gh = Math.ceil(H / cell) + 2, GX = new Float32Array(gw * gh), GY = new Float32Array(gw * gh);
    const nA = vnoise(P.seed + 11), nB = vnoise(P.seed + 23), nK = vnoise(P.seed + 37), ws = P.warpS * u, st = P.stretch ?? 2.5, kk = P.kink;
    const flow = P.phase * ws * 1.5; for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const X = i * cell + flow, Y = j * cell, q = j * gw + i;
      const a = fbm(nA, X / ws, Y / (ws * st), 3) - .5, b = fbm(nB, X / (ws * st), Y / ws, 3) - .5, r = Math.abs(nK(X / (ws * .7), Y / (ws * .7)) - .5) * 2;
      GX[q] = (a * 2 * (1 - kk) + (r - .5) * kk) * P.warp * u; GY[q] = (b * 2 * (1 - kk) + (.5 - r) * kk * .6) * P.warp * u; }
    const WX = upsampleCR(GX, gw, gh, Math.round(gw * cell), Math.round(gh * cell)), WY = upsampleCR(GY, gw, gh, Math.round(gw * cell), Math.round(gh * cell)), WW = Math.round(gw * cell);
    const esc = (px, py, maxIt, k) => { const x0 = (px - W / 2) * sc, y0 = (py - H / 2) * sc, cr = c0x + x0 * ca - y0 * sa, ci = c0y + x0 * sa + y0 * ca; let zr = 0, zi = 0, it = 0, r2 = 0, p1r = 0, p1i = 0, p2r = 0, p2i = 0, p3r = 0, p3i = 0;
      for (; it < maxIt; it++) { const a = zr * zr, b = zi * zi; r2 = a + b; if (r2 > 1e20) break; p3r = p2r; p3i = p2i; p2r = p1r; p2i = p1i; p1r = zr; p1i = zi; zi = 2 * zr * zi + ci; zr = a - b + cr; }
      if (it >= maxIt) return 1e9; if (k >= 0) { A0[k] = Math.atan2(zi, zr); Z1r[k] = p1r; Z1i[k] = p1i; Z2r[k] = p2r; Z2i[k] = p2i; Z3r[k] = p3r; Z3i[k] = p3i; LZ[k] = .5 * Math.log(r2); } return it + 1 - Math.log2(.5 * Math.log(r2)); };
    /* 2 — the ground share sets the escape count that separates ground from field, read off a coarse pass */
    const smp = []; for (let y = 3 * u; y < H; y += 7 * u) for (let x = 3 * u; x < W; x += 7 * u) smp.push(esc(x, y, 900, -1));
    smp.sort((a, b) => a - b); const mu0 = Math.max(4, smp[Math.min(smp.length - 1, Math.floor((1 - P.ground) * smp.length))]), deep = P.deep ?? 2.2, maxIt = Math.ceil(mu0 * deep);
    /* 3 — full pass through the warp */
    const MU = new Float32Array(n), LZ = new Float32Array(n), A0 = new Float32Array(n), Z1r = new Float32Array(n), Z1i = new Float32Array(n), Z2r = new Float32Array(n), Z2i = new Float32Array(n), Z3r = new Float32Array(n), Z3i = new Float32Array(n), ZR = [null, Z1r, Z2r, Z3r], ZI = [null, Z1i, Z2i, Z3i];
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k++) { const q = y * WW + x; MU[k] = esc(x + WX[q], y + WY[q], maxIt, k); }
    /* 4 — field lines are level sets of the exit angle. |∇θ| ≈ ln2 · log|z| · |∇μ| (Böttcher coordinate), so the lines
       per turn that hold the measured 4.6 px spacing are 2^J with J = log2(2π / (spacing · |∇θ|)). |∇μ| is smooth across
       the escape bands and is blurred 3 px; log|z| doubles across each band seam, so J drops by one there and the line set
       stays continuous. J below 0 reads the angle of an earlier iterate (z_n-1 .. z_n-3, half the lines each step).
       Each pixel blends the levels ⌊J⌋ and ⌊J⌋+1 by the fraction of J, so new lines fade in between old ones. */
    const lm0 = Math.log(mu0), LN2 = Math.LN2, spc = P.spacing * u, GM = new Float32Array(n), OK = new Uint8Array(n), DXr = new Float32Array(n), DYr = new Float32Array(n);
    for (let y = 1; y < H - 1; y++) for (let x = 1, k = y * W + 1; x < W - 1; x++, k++) { const m = MU[k], a1 = MU[k + 1], b1 = MU[k - 1], c1 = MU[k + W], e1 = MU[k - W];
      if (m >= mu0 || a1 >= mu0 || b1 >= mu0 || c1 >= mu0 || e1 >= mu0) continue; const gx = a1 - b1, gy = c1 - e1, gl = Math.hypot(gx, gy) + 1e-12; GM[k] = Math.log(gl * .5 + 1e-9); DXr[k] = gx / gl; DYr[k] = gy / gl; OK[k] = 1; }
    for (let y = 0; y < H; y++) for (let x = 0, k = y * W; x < W; x++, k++) if (!OK[k] && MU[k] < mu0) { let s2 = 0, c2 = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && OK[yy * W + xx]) { s2 += GM[yy * W + xx]; c2++; } } GM[k] = c2 ? s2 / c2 : 0; OK[k] = c2 ? 2 : 0; }
    const GI = new Float32Array(n); for (let k = 0; k < n; k++) GI[k] = MU[k] >= mu0 ? 1 : 0; const GIB = gblur(GI, W, H, 1.6 * u * P.rim);   /* the rim: a band hugging the ground */
    const GB = gblur(GM, W, H, 3.3 * u), cyc = P.cycle, spr = P.spread, DD = new Float32Array(n), JR = new Float32Array(n);
    for (let k = 0; k < n; k++) { const m = MU[k]; if (m >= mu0) continue; DD[k] = cyc * Math.pow(lm0 - Math.log(m), spr); JR[k] = OK[k] ? Math.log2(6.2832 / (spc * LN2 * LZ[k])) - GB[k] * 1.4427 : -9; }
    const grid = (cell, fn) => { const gw2 = Math.ceil(W / cell) + 3, gh2 = Math.ceil(H / cell) + 3, A = new Float32Array(gw2 * gh2); for (let j = 0; j < gh2; j++) for (let i = 0; i < gw2; i++) A[j * gw2 + i] = fn(i * cell, j * cell); const U = upsampleCR(A, gw2, gh2, Math.round(gw2 * cell), Math.round(gh2 * cell)), WU = Math.round(gw2 * cell), O = new Float32Array(n); for (let y = 0; y < H; y++) O.set(U.subarray(y * WU, y * WU + W), y * W); return O; };
    /* frost fur: where the field lines are too dense to draw (next to the ground), white noise is smeared along the
       direction of ∇μ, which is the direction of the field lines (line integral convolution of a 2 px value noise, 2 × furLen steps of 1 px), then lit from the upper left */
    const DX = DXr, DY = DYr, FUR = new Float32Array(n), Ls = Math.round((P.furLen ?? 5) * u), sF = P.seed + 91;
    if (P.fur > 0) {
      const nF = vnoise(sF), fw = P.furW * u, NZ = grid(fw * .5, (X, Y) => nF(X / fw, Y / fw));
      for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k++) { if (MU[k] >= mu0 || DD[k] > .42) continue;
        let acc = NZ[k], c = 1; for (let sg = -1; sg <= 1; sg += 2) { let px = x + .5, py = y + .5; for (let st = 0; st < Ls; st++) { const q = (py | 0) * W + (px | 0); px += sg * DX[q]; py += sg * DY[q]; if (px < 0 || py < 0 || px >= W || py >= H) break; const q2 = (py | 0) * W + (px | 0); if (MU[q2] >= mu0) break; acc += NZ[q2]; c++; } }
        FUR[k] = (acc / c - .5) * 5.5; } }
    /* slow noise fields on a 2 px grid: field-line phase wobble, bold-line gate, bold-line width */
    const nP = vnoise(P.seed + 51), nQ = vnoise(P.seed + 57), nT = vnoise(P.seed + 63), nG = vnoise(P.seed + 71), nH = vnoise(P.seed + 73), wv1 = 6 * P.waver, wv2 = 2.2 * P.waver;
    const PHf = grid(1.5 * u, (X, Y) => (nP(X / (16 * u), Y / (16 * u)) - .5) * wv1 + (nQ(X / (4 * u), Y / (4 * u)) - .5) * wv2), GTf = grid(4 * u, (X, Y) => nT(X / (26 * u), Y / (26 * u))), BKf = grid(2 * u, (X, Y) => nG(X / (7 * u), Y / (7 * u)));
    /* one phase per pixel drives a fine striation of the ramp color, the feathered band edges (the ramp position moves
       with the striation) and sparse bold filaments picked per line index, light on dark bands and dark on light ones */
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, R = pal.ramp, nR = R.length, G = C, ph0 = P.phase, rimW = P.rim * .02, shd = P.relief ?? .6, gr = P.grain, sd = P.seed + 77;
    const ramp = (f, o) => { let i = 0; while (i < nR - 2 && f > R[i + 1][0]) i++; const a = R[i], b = R[i + 1], t = clamp((f - a[0]) / (b[0] - a[0] || 1), 0, 1); o[0] = a[1][0] + (b[1][0] - a[1][0]) * t; o[1] = a[1][1] + (b[1][1] - a[1][1]) * t; o[2] = a[1][2] + (b[1][2] - a[1][2]) * t; };
    const c3 = [0, 0, 0], ld = Math.log(deep), POW2 = new Float32Array(16).map((_, i) => Math.pow(2, i));
    const cosL = (L, k, ph) => { if (L >= 0) return Math.cos(POW2[L] * A0[k] + ph); const q = L < -3 ? 3 : -L, zr = ZR[q][k], zi = ZI[q][k], zl = Math.hypot(zr, zi) || 1; return (zr * Math.cos(ph) - zi * Math.sin(ph)) / zl; };   /* cos(arg z + ph) without the angle */
    const GRs = [[0, G.slate], [.14, G.ground2], [.44, G.ground2], [.52, G.ground], [.78, G.ground], [.86, G.bubble], [1, G.bubble]];
    const gramp = v => { let i = 0; while (i < 5 && v > GRs[i + 1][0]) i++; const A = GRs[i], B = GRs[i + 1], t = clamp((v - A[0]) / (B[0] - A[0]), 0, 1); r = A[1][0] + (B[1][0] - A[1][0]) * t; g = A[1][1] + (B[1][1] - A[1][1]) * t; b = A[1][2] + (B[1][2] - A[1][2]) * t; };
    const bold = P.bold, bw = 1 - 2 * P.lineW, fea = P.feather, stri = P.striate, pale = P.pale, fur = P.fur;
    let r, g, b; const mix = (c, t) => { r += (c[0] - r) * t; g += (c[1] - g) * t; b += (c[2] - b) * t; };
    for (let y = 0, k = 0, j = 0; y < H; y++) for (let x = 0; x < W; x++, k++, j += 4) {
      const m = MU[k];
      if (m >= mu0) { /* ground: one per-pixel draw through slate, steel, periwinkle and pale, pulled darker where the orbit stays longer; navy specks gather in rosettes there */
        const t = m > 1e8 ? 1 : (Math.log(m) - lm0) / ld, h = (hashI(x, y, sd + 2) + hashI(x, y, sd + 12) + nG(x / (1.5 * u), y / (1.5 * u))) / 3;
        gramp(clamp(.5 + (h - .5) * (1 + 3 * pale) - .28 * t + .06, 0, 1));
        const rz = nP(x / (3 * u), y / (3 * u)), pk = sstep(.25, .9, t) * (m > 1e8 ? .35 : 1) * P.speck * (.25 + .9 * sstep(.45, .75, rz)); if (hashI(x, y, sd + 4) < pk) mix(hashI(x, y, sd + 5) < .5 ? G.speck : G.slate, .9);
      } else {
        const dd = DD[k], Jr = JR[k], vis = sstep(-3.8, -3.1, Jr);
        let sv = 0, line = 0, fing = 0;
        if (vis > 0) {
          const J = clamp(Jr, -3, 12), j0 = Math.floor(J), w2 = sstep(.15, .85, J - j0), ph = PHf[k];
          const c0 = cosL(j0, k, ph), c1 = cosL(j0 + 1, k, ph), cm = cosL(j0 - 1, k, ph);
          sv = (c0 * (1 - w2) + c1 * w2) * vis; fing = (cm * (1 - w2) + c0 * w2) * vis;
          /* bold filaments: every second line, leaning to every fourth, gated by a 26 px noise so they run in long broken streaks */
          const gate = sstep(1 - bold - .15, 1 - bold + .15, GTf[k]);
          if (gate > 0 && dd > .18) { const cq = cosL(j0 - 2, k, ph), c4 = (cq * (1 - w2) + cm * w2) * .45 + fing * .55, wv = bw + (BKf[k] - .5) * P.breaks; line = sstep(wv, wv + .2, c4) * gate * vis * sstep(.18, .4, dd); }
        }
        const f0 = dd + ph0 + fea * (sv * .2 + fing * .3), f = f0 - Math.floor(f0); ramp(f, c3); r = c3[0]; g = c3[1]; b = c3[2];
        const lum = .3 * r + .59 * g + .11 * b, lite = sstep(150, 195, lum);
        /* frost texture: the smeared strands where lines are too dense, plus a per-pixel tooth on every light band */
        const em = x > 0 && y > 0 ? FUR[k] - FUR[k - W - 1] : 0, wF = Math.max(1 - vis, sstep(.36, .26, dd)), tx = ((FUR[k] * .8 + em * 2.4) * wF + (hashI(x, y, sd + 7) - .5) * .55 * lite) * fur; if (tx < 0) mix(G.fur, Math.min(1, -tx)); else mix(G.hi, Math.min(1, tx) * .8);
        if (sv > 0) mix(G.line, sv * stri * .3 * (1 - lite)); else mix(lite > .5 ? G.fur : G.shade, -sv * stri * (.3 + .25 * lite));
        const rb = sstep(.06, .16, GIB[k] + .05 * (FUR[k] + (hashI(x, y, sd + 11) - .5))); if (dd < rimW * (1 + .8 * sv + .5 * fing) || rb > 0) mix(G.rim, Math.max(rb, dd < rimW * (1 + .8 * sv + .5 * fing) ? 1 : 0) * .92);
        if (line > 0) mix(lite > .5 ? G.shade2 : G.line, line * (lite > .5 ? shd : .92));
      }
      const nz = (hashI(x, y, sd) - .5) * gr; d[j] = r + nz; d[j + 1] = g + nz; d[j + 2] = b + nz; d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  const MEASURED_RAMP = [[0, [206, 228, 238]], [.26, [200, 224, 236]], [.3, [170, 202, 224]], [.34, [12, 78, 186]], [.42, [7, 48, 136]], [.48, [5, 30, 104]], [.54, [12, 76, 182]], [.6, [56, 146, 224]], [.64, [12, 152, 160]], [.78, [16, 160, 162]], [.84, [80, 190, 214]], [.9, [190, 218, 232]], [1, [206, 228, 238]]];
  /* an alternate world from eight anchors: ground, frost white, first deep band, its dark, second band, rim, speck, filament */
  const L3 = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const world = (gd, wh, d1, dk, d2, rim, sp, ln) => ({ ramp: [[0, wh], [.26, L3(wh, gd, .05)], [.3, L3(wh, gd, .35)], [.34, d1], [.42, L3(d1, dk, .6)], [.48, dk], [.54, d1], [.6, L3(d2, wh, .25)], [.64, d2], [.78, L3(d2, wh, .08)], [.84, L3(d2, wh, .45)], [.9, L3(wh, gd, .15)], [1, wh]],
    c: { ground: gd, ground2: L3(gd, dk, .2), speck: sp, rim, line: ln, hi: L3(ln, [255, 255, 255], .5), shade: L3(dk, [0, 0, 0], .3), shade2: d1, fur: L3(wh, gd, .45), bubble: L3(gd, wh, .45), slate: L3(gd, dk, .5) } });
  PLATES.push({
    id: "p14", no: "14", title: "Fractal Frost", ref: REF, render,
    line: "One escape-time field: the smooth escape count picks a color from a cyclic ramp, the exit angle draws field-line filaments at a held spacing, and the slowest pixels are the speckled ground.",
    selects: [{ key: "site", label: "Site", def: "star", options: [["frost", "Frost"], ["fern", "Fern"], ["star", "Star"]] }],
    params: [
      { key: "zoom", label: "Zoom", min: .3, max: 3, step: .01, def: 1.5, unit: "×", group: "Window", why: "Width of the window on the plane. Smaller is deeper into the branches." },
      { key: "rot", label: "Rotation", min: -90, max: 90, step: .5, def: 0, unit: "°", group: "Window", why: "Turns the window, so the branches leave the plate at other angles." },
      { key: "panX", label: "Pan x", min: -1, max: 1, step: .005, def: 0, unit: "", group: "Window", why: "Moves the window across, in window widths." },
      { key: "ground", label: "Ground share", min: .05, max: .7, step: .005, def: .2, unit: "", group: "Ramp", why: "Share of pixels slow enough to be ground." },
      { key: "cycle", label: "Ramp cycles", min: .3, max: 6, step: .01, def: 1.3, unit: "per e", group: "Ramp", why: "How many times the ramp repeats per e-fold of escape count." },
      { key: "spread", label: "Spread", min: .5, max: 2.5, step: .01, def: 1.5, unit: "γ", group: "Ramp", why: "Power on the log escape count before the ramp; above 1 the frost band near the ground widens and the far bands close up." },
      { key: "rim", label: "Rim", min: 0, max: 3, step: .01, def: 1.2, unit: "", group: "Ramp", why: "Width of the turquoise rim where the frost meets the ground." },
      { key: "spacing", label: "Filament spacing", min: 2.5, max: 16, step: .05, def: 4.6, unit: "px", group: "Filaments", why: "Target distance between field lines; the line count per turn doubles or halves to hold it." },
      { key: "bold", label: "Bold share", min: 0, max: 1, step: .01, def: 0.65, unit: "", group: "Filaments", why: "Share of field lines, picked per line, that print as bold white filaments." },
      { key: "lineW", label: "Filament width", min: .02, max: .5, step: .005, def: 0.18, unit: "", group: "Filaments", why: "Share of a bold line's period that prints white." },
      { key: "striate", label: "Striation", min: 0, max: 1, step: .01, def: 0.7, unit: "", group: "Filaments", why: "Light and dark streaks of the ramp color along every field line." },
      { key: "feather", label: "Feather", min: 0, max: 1, step: .01, def: 0.25, unit: "", group: "Filaments", why: "How far the band edges move along the field lines, so bands meet in interlocking fingers." },
      { key: "breaks", label: "Breaks", min: 0, max: 1, step: .01, def: .5, unit: "", group: "Filaments", why: "Noise on the cut level, so filaments break and swell along their length." },
      { key: "waver", label: "Waver", min: 0, max: 1, step: .01, def: 0.6, unit: "", group: "Filaments", why: "Phase noise that bends the filaments sideways." },
      { key: "fur", label: "Fur", min: 0, max: 1.5, step: .01, def: 1.35, unit: "", group: "Filaments", why: "Strength of the strands in the frost next to the ground, where the field lines are too dense to draw one by one." },
      { key: "furW", label: "Fur width", min: .8, max: 5, step: .05, def: 2, unit: "px", group: "Filaments", why: "Cell size of the noise that the strands are smeared from: the strand width." },
      { key: "warp", label: "Warp", min: 0, max: 30, step: .1, def: 13, unit: "px", group: "Warp", why: "Displacement of the plane before iteration." },
      { key: "warpS", label: "Warp scale", min: 4, max: 80, step: .5, def: 22, unit: "px", group: "Warp", why: "Size of the warp's waves." },
      { key: "kink", label: "Kink", min: 0, max: 1, step: .01, def: 0.75, unit: "", group: "Warp", why: "Share of ridged noise in the warp; ridges bend lines at a point." },
      { key: "pale", label: "Ground spread", min: 0, max: 1, step: .01, def: 0.12, unit: "", group: "Ground", why: "Width of the per-pixel draw across slate, steel, periwinkle and pale. 0 is a flat periwinkle." },
      { key: "speck", label: "Speck", min: 0, max: 1, step: .01, def: 1, unit: "", group: "Ground", why: "Strength of the navy specks where the iteration never leaves." },
      { key: "grain", label: "Grain", min: 0, max: 30, step: .5, def: 18, unit: "", group: "Ground", why: "Per-pixel noise." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop: the ramp cycles once outward and the warp drifts 1.5 warp scales across." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 14, unit: "", group: "Motion", why: "Re-rolls the warp and nudges the window." }
    ],
    source: "Reference 14: fractal frost print, 736 × 1308 px JPEG",
    passes: ["window: a 0.03-wide square of the parameter plane near a branch point of the Mandelbrot set, displaced before iteration by stretched value noise with a ridged part (13 px, 22 px scale), so the band edges and field lines kink", "escape: z → z² + c to a bailout of 10^10; the smooth count μ, log|z| and the angles of z_n, z_n−1, z_n−2 and z_n−3 are kept; a coarse pass sets the count that makes 20 % of pixels ground", "line density: |∇μ| is blurred 3 px; with log|z| it gives |∇θ|, and the level J = log2(2π / (4.6 px · |∇θ|)) picks the line set per pixel, blended between ⌊J⌋ and ⌊J⌋ + 1", "ramp: d = 1.3 · (log μ0 − log μ)^1.5, read on a 12-stop cyclic ramp; the ramp position moves with the field-line phase so band edges meet in fingers; a turquoise rim at d < 0.028", "filaments: every field line striates the band color; every second line, gated by a 26 px noise, prints bold, white on dark bands and royal on light ones", "frost fur: where field lines are too dense to draw, a 2 px value noise is smeared 2 × 6 px along ∇μ and lit from the upper left", "ground: a per-pixel draw through slate, steel, periwinkle and pale, darkening where the orbit stays longer, with navy specks gathered in 3 px rosettes; 6 levels of grain over everything"],
    measured: { ramp_9_means: { white: [212, 240, 248, .159], pale: [179, 213, 231, .181], ground: [143, 188, 215, .166], steel: [112, 159, 189, .124], turquoise: [54, 171, 213, .054], mint: [11, 152, 159, .089], slate: [71, 121, 154, .067], royal: [14, 82, 172, .092], navy: [10, 52, 105, .066], method: "k-means, k = 9, on every second pixel; color and plate share" }, ramp_order: { sequence: "ground, turquoise rim, white frost with pale fur, slate, royal with navy, turquoise, mint, white filament field", method: "nearest-class transects from the ground network into the four large flowers" }, filament_spacing_px: { median: 4.6, range: [4, 5], method: "peak spacing (prominence 15) along the structure-tensor gradient in six 96 to 128 px patches" }, filament_ac: { blue_core_x: [.51, .09, .03], blue_core_y: [.73, .4, .23], white_field_x: [.46, .1, .12], white_field_y: [.72, .42, .31], method: "luminance autocorrelation, lags 1 to 3" }, lobe_scale_px: { frost_width_p50_p90: [10, 26], frost_eq_diameter_p50_p90_max: [14, 44, 259], ground_arm_width_p50_p90: [11.7, 28.6], deep_band_width_p50_p90: [14.6, 46], method: "class masks smoothed 9 px, opened twice; skeleton widths and component sizes" }, ground_patch: { mean_L: 160, sigma_L: 37, ac_x: [.34, .04], inks: "periwinkle 32 %, steel 35 %, slate 15 %, pale 19 %", method: "64 px patch at (240, 160)" }, rejected: "a pure noise-blob composition: it gave no star crossings in the ground network and no field-line fans; an escape-time field gives both" },
    limits: ["Bench mean 0.928, short of 0.98. The lowest metrics are the frost-lobe and white-field spectra and histograms (0.77 to 0.85): the reference frost is a JPEG-softened relief filter whose whites spread from L 200 to 250, and the plate's frost sits on a two-stop plateau near L 225 to 235 with a lit strand field on top. No blur was added to close it.", "The ground patch autocorrelation (lag 2 to 6 near 0 in the reference) still reads 0.1 to 0.3 on the plate, because the plate's navy rosettes cluster on a 3 px field. Removing the clustering scored higher and read as flat noise at 1x.", "Whole-plate shares follow the window: the plate puts 25 % of pixels in white against 16 % in the reference because its largest bay is white. The window is the plate's own; the reference's four flower heads are not traced.", "The reference is a downscaled render with a relief filter. The plate builds the relief from the field itself (strands lit from the upper left, bold lines with a dark side), not from an emboss filter."],
    study: { slug: "fractal-frost", lede: "An escape-time fractal colored by a cyclic ramp, with field-line filaments held at a 4.6 px spacing and a smeared fur where the lines get too dense.",
      body: ["The reference is a render of the exterior of a Mandelbrot-type set. Every pixel carries a count of how long its orbit stayed near the set. The slowest pixels form a periwinkle ground network with navy rosettes along its arms. Faster pixels read a repeating ramp: a turquoise rim, white frost with a fine fur, royal blue, mint, then white again in the largest bays. White filaments cross the blue and mint bands at about 4.6 px apart. They follow the field lines, the curves along which the count changes fastest.", "The rebuild iterates z² + c over a warped window near a branch point of the set. It keeps the smooth count, log|z| and the exit angles of the last four iterates. The count on a log scale picks the ramp color. The exit angle draws the field lines, and the number of lines per turn doubles or halves per pixel to hold the 4.6 px spacing. Where the lines are too dense, noise is smeared along the field direction instead. Zoom, rotation and pan move the window. Ground share, ramp cycles and spread set the bands. Filament spacing, bold share, width, striation and feather set the lines. Warp, warp scale and kink bend everything before the iteration."],
      method: "Warped window · Escape-time count and exit angles · Cyclic ramp on log count · Field lines at a held spacing · Smeared fur · Speckled ground",
      points: [
        { u: .45, v: .43, d: "KEY", label: "Ground arm: the slowest 20 % of pixels, a per-pixel draw through slate, steel, periwinkle and pale; navy specks gather in 3 px rosettes where the orbit never leaves.", t: "grain", dir: [-1, 0] },
        { u: .62, v: .08, d: "READ", label: "Star crossing: several ground arms meet at a branch point of the set; the reference arms measure 12 px median and 29 px at p90.", t: "edge", dir: [0, -1] },
        { u: .57, v: .19, d: "READ", label: "Turquoise rim: a band about 3 px wide hugging the ground, toothed by the fur and a per-pixel draw.", t: "edge", dir: [1, -1] },
        { u: .76, v: .21, d: "KEY", label: "Frost lobe: the first white band, with strands smeared 2 × 5 px along the field direction and lit from the upper left.", t: "grain", dir: [1, 0] },
        { u: .73, v: .34, d: "READ", label: "Feathered band edge: the ramp position moves with the line phase, so white and royal meet in fingers two lines wide.", t: "edge", dir: [-1, -1] },
        { u: .84, v: .4, d: "KEY", label: "Royal band: navy and royal striations every 4.6 px, every second line printed bold white where a 26 px noise allows.", t: "pull", dir: [1, 0] },
        { u: .35, v: .69, d: "READ", label: "Line doubling: where the lines spread past the target spacing, the next set fades in between them over one octave of J.", t: "pull", dir: [-1, 1] },
        { u: .45, v: .73, d: "READ", label: "Mint band: the ramp after navy, 12 152 160, carrying the same field lines as faint light streaks.", t: "pull", dir: [0, 1] },
        { u: .68, v: .92, d: "KEY", label: "Second white field: the ramp has wrapped once; bold lines here print royal on white.", t: "pull", dir: [1, 1] },
        { u: .2, v: .32, d: "READ", label: "Kink: the ridged part of the 13 px warp bends a filament at a point instead of along a curve.", t: "edge", dir: [-1, 0] }
      ] },
    palettes: [
      { id: "measured", name: "Frost", note: "measured", ramp: MEASURED_RAMP, c: { ground: [136, 186, 226], ground2: [106, 157, 200], speck: [16, 60, 130], rim: [34, 178, 196], line: [242, 250, 254], hi: [250, 253, 255], shade: [4, 26, 96], shade2: [24, 86, 176], fur: [150, 182, 204], bubble: [171, 222, 250], slate: [58, 109, 150] }, sw: ["#88bae2", "#d8ecf4", "#0e50b8", "#0c98a0"] },
      Object.assign({ id: "night", name: "Night frost", sw: ["#1c2a4a", "#e6f0ff", "#7a4cd8", "#38d0e8"] }, world([28, 42, 74], [230, 240, 255], [122, 76, 216], [46, 20, 100], [56, 208, 232], [140, 230, 255], [8, 12, 30], [250, 252, 255])),
      Object.assign({ id: "moss", name: "Moss", sw: ["#7e9a78", "#f0f6f2", "#2e7a3a", "#c8e04a"] }, world([126, 154, 120], [240, 246, 242], [46, 122, 58], [18, 60, 30], [200, 224, 74], [90, 200, 120], [30, 60, 34], [248, 252, 240])),
      Object.assign({ id: "orchid", name: "Orchid", sw: ["#a698cc", "#f6f0fc", "#b02c9c", "#3cc4d0"] }, world([166, 152, 204], [246, 240, 252], [176, 44, 156], [80, 16, 90], [60, 196, 208], [255, 120, 200], [60, 30, 90], [255, 250, 255])),
      Object.assign({ id: "graphite", name: "Graphite", sw: ["#9a9ea4", "#f2f4f6", "#33373c", "#6e8a9c"] }, world([154, 158, 164], [242, 244, 246], [51, 55, 60], [20, 22, 26], [110, 138, 156], [210, 214, 220], [30, 32, 36], [252, 252, 252])),
      Object.assign({ id: "solar", name: "Solar", sw: ["#5a6a8a", "#f2f6fc", "#e0601a", "#1c3cc0"] }, world([90, 106, 138], [242, 246, 252], [224, 96, 26], [120, 40, 8], [28, 60, 192], [255, 200, 60], [20, 26, 50], [250, 252, 255]))
    ],
    presets: [
      { name: "Deep fern", set: { site: "fern", zoom: 1.2, cycle: 2.2, ground: .26 } },
      { name: "Glass streaks", set: { bold: 1, lineW: .38, warp: 22, kink: 1, waver: 1 } },
      { name: "Soft frost", set: { cycle: .7, spread: 2.2, fur: 1.2, bold: .2, feather: .6 } },
      { name: "Bare escape", set: { warp: 0, waver: 0, fur: 0, striate: 0, bold: 0, feather: 0, grain: 0 } }
    ], motion: [{ key: "phase", amp: 1, period: 20, mode: "saw" }, { key: "warp", amp: 3, period: 11, mode: "sine" }], live: { x: { key: "rot", min: -60, max: 60 }, y: { key: "zoom", min: .5, max: 2 } },
    bench: { palette: "measured", params: {}, note: "The window on the set is the plate's own, so no region lines up with the reference. Each render rect was chosen with search.py and a full-metric check among regions of the same material: ground arms with rosettes, a frost lobe beside the ground, a blue band with bold filaments, and a second-cycle white field.", items: [
      { name: "ground", ref: [240, 160, 64, 64], out: [352, 432, 64, 64], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 6, inks: [[143, 188, 215], [112, 159, 189], [71, 121, 154], [179, 213, 231], [54, 171, 213]], inkNames: ["ground", "steel", "slate", "pale", "turquoise"] },
      { name: "frost lobe", ref: [280, 368, 96, 96], out: [592, 224, 96, 96], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 6, inks: [[212, 240, 248], [179, 213, 231], [143, 188, 215], [112, 159, 189]], inkNames: ["white", "pale", "fur", "steel"] },
      { name: "blue core", ref: [456, 688, 128, 128], out: [544, 528, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 8, inks: [[212, 240, 248], [112, 159, 189], [54, 171, 213], [14, 82, 172], [10, 52, 105]], inkNames: ["white", "steel", "turquoise", "royal", "navy"] },
      { name: "white field", ref: [330, 1060, 128, 128], out: [256, 1056, 128, 128], m: ["hist", "mean", "std", "spec", "ac"], lags: 8 },
      { name: "whole plate", ref: [0, 0, 736, 1308], out: [0, 0, 736, 1308], m: ["hist", "mean", "ink", "share"], inks: [[212, 240, 248], [179, 213, 231], [143, 188, 215], [112, 159, 189], [54, 171, 213], [11, 152, 159], [71, 121, 154], [14, 82, 172], [10, 52, 105]], inkNames: ["white", "pale", "ground", "steel", "turquoise", "mint", "slate", "royal", "navy"] }
    ] }
  });
})();
