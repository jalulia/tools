/* ===== PLATE 17 · GRAIN PILL =====
   two rounded pills of frosted chrome on a flat light gray. Each pill reads one ramp (gray, white, dark gray, yellow,
   white, pink) along a warped coordinate that swirls across it and wraps into bands along its rim; every pixel reads
   the ramp a grain-field jitter off, so the grain is densest where the ramp is steepest. Under the pill the type is
   frosted: blurred and faded. Small black type sits on the ground with an oval drawn round the middle line. */
(function () {
  const REF = { w: 736, h: 920 };
  const STOPS = [[0, 212, 212, 212], [.25, 200, 200, 200], [.39, 142, 142, 140], [.47, 96, 95, 70], [.55, 206, 204, 12], [.62, 236, 234, 40], [.72, 232, 229, 226], [.86, 244, 186, 224], [1, 236, 222, 230]];
  /* the lower pill reads the same ramp with the yellow band spent: its dark swoosh turns straight to white, a trace of olive left in it */
  const STOPS2 = [[0, 212, 212, 212], [.22, 214, 214, 214], [.36, 160, 160, 158], [.45, 118, 119, 106], [.53, 192, 192, 186], [.6, 206, 205, 206], [.66, 212, 208, 212], [.8, 238, 192, 222], [1, 236, 196, 222]];
  function lut(st) { const N = 1024, L = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const t = i / (N - 1); let k = 0; while (k < st.length - 2 && st[k + 1][0] <= t) k++; const a = st[k], b = st[k + 1], f = clamp((t - a[0]) / (b[0] - a[0] || 1), 0, 1), e = f; for (let c = 0; c < 3; c++) L[i * 3 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * e; } return L; }
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c, sd = P.seed | 0, rnd = mulberry(sd * 6151 + 17);
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    /* 1 — the type, on its own layer, so the pills can frost it */
    const T = mk(W, H), t = T.getContext("2d"), cap = P.capH * u, lead = P.lead * u;
    t.font = `500 100px "Archivo",Arial,sans-serif`; const capR = t.measureText("H").actualBoundingBoxAscent / 100, fs = cap / capR;
    t.font = `500 ${fs}px "Archivo",Arial,sans-serif`; t.fillStyle = "#000"; t.textBaseline = "alphabetic"; try { t.letterSpacing = (-.01 * fs) + "px"; } catch (e) {}
    const x1 = 35 * u, x2 = (35 + P.indent) * u, xt = (35 + P.tab) * u, b1 = 74 * u, b2 = b1 + lead, b3 = b2 + lead;
    const L1 = (P.line1 || "").toUpperCase(), L2 = (P.line2 || "").toUpperCase(), L3 = (P.line3 || "").toUpperCase().trim();
    t.fillText(L1, x1, b1); t.fillText(L2, x2, b2);
    if (L3) { const sp = L3.indexOf(" "), w1 = sp < 0 ? L3 : L3.slice(0, sp), w2 = sp < 0 ? "" : L3.slice(sp + 1); t.fillText(w1, x1, b3); if (w2) t.fillText(w2, Math.max(xt, x1 + t.measureText(w1 + "  ").width), b3); }
    if (L2 && P.oval > 0) { const w = t.measureText(L2).width, cx = x2 + w / 2 - 2 * u, cy = b2 - cap / 2 + 1 * u, rx = w / 2 + (P.ovalPad ?? 15) * u, ry = cap / 2 + ((P.ovalPad ?? 15) * .55 + 3) * u;
      t.strokeStyle = "#000"; t.lineWidth = P.oval * u; t.beginPath(); t.ellipse(cx, cy, rx, ry, -.035, 0, 6.2832); t.stroke(); }
    try { t.letterSpacing = "0px"; } catch (e) {}
    const ink = chan(t, W, H, 3), inkB = gblur(ink, W, H, P.frostBlur * u);
    /* 2 — the pills: stadium shapes, measured 481 × 158 and 226 × 159 px */
    const ph = P.pillH * u, pills = [{ x0: 220 * u, y0: 29 * u, w: 481 * u, h: ph }, { x0: 37 * u, y0: 730 * u, w: 226 * u * P.pill2, h: ph }];
    pills.forEach((p, i) => { p.th = ((i ? P.angle2 : P.angle) + (rnd() - .5) * 20) * Math.PI / 180; p.ph = rnd() * 6.28; p.fq = .7 * (.8 + .4 * rnd()); p.k = 1; p.s0 = i ? P.shift2 : P.shift; p.run = i ? P.run2 : P.run; p.gm = i ? 1 / (P.gamma ?? 1) : (P.gamma ?? 1); });
    /* 3 — one grain field: position-hashed noise softened a little and normalized to σ 1, used as the ramp jitter and the floor grain */
    const N = new Float32Array(W * H); for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) N[i] = hashI(x, y, sd) + hashI(x, y, sd + 7) - 1;
    const B = P.grainSize * u >= .3 ? gblur(N, W, H, P.grainSize * u) : N; let bv = 0; for (let i = 0; i < B.length; i += 7) bv += B[i] * B[i]; const bn = 1 / Math.sqrt(bv / Math.ceil(B.length / 7) || 1);
    const B2 = new Float32Array(W * H); for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) B2[i] = B[y * W + ((x + 37) % W)];
    const LU = lut(pal.stops), LU2 = pal.stops2 ? lut(pal.stops2) : LU, img = g.createImageData(W, H), d = img.data, gr = C.ground, ik = C.ink, jit = P.jitter * u * bn, gz = P.grain * bn;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) { const o = i * 4, a = ink[i]; d[o] = gr[0] + (ik[0] - gr[0]) * a; d[o + 1] = gr[1] + (ik[1] - gr[1]) * a; d[o + 2] = gr[2] + (ik[2] - gr[2]) * a; d[o + 3] = 255; }
    for (const p of pills) {
      const LP = p === pills[0] ? LU : LU2;
      const r = p.h / 2, cyy = p.y0 + r, xa = p.x0 + r, xb = p.x0 + p.w - r, ca = Math.cos(p.th), sa = Math.sin(p.th), e = Math.max(.5, (P.edge ?? 1.4) * u);
      const X0 = Math.max(0, Math.floor(p.x0 - 2)), X1 = Math.min(W - 1, Math.ceil(p.x0 + p.w + 2)), Y0 = Math.max(0, Math.floor(p.y0 - 2)), Y1 = Math.min(H - 1, Math.ceil(p.y0 + p.h + 2));
      for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
        const i = y * W + x, px = x + .5, py = y + .5, qx = clamp(px, xa, xb), dEdge = r - Math.hypot(px - qx, py - cyy), cov = sstep(-e * .5, e * .5, dEdge); if (cov <= 0) continue;
        /* the warped coordinate, read a jitter off: a tilted run across the pill, a swirl, and bands that follow the rim */
        const jx = px + B[i] * jit, jy = py + B2[i] * jit, X = (jx - p.x0) / p.h, Y = (jy - p.y0) / p.h, U = X * ca + Y * sa, V = -X * sa + Y * ca;
        const de = Math.max(0, r - Math.hypot(jx - clamp(jx, xa, xb), jy - cyy)) / p.h;
        const Ul = U / (p.w / p.h);
        let sv = p.s0 + (P.phase || 0) + p.run * Math.pow(Math.max(0, Ul), p.gm) + P.bend * (V - .5) * (V - .5) + P.swirl * Math.sin(3.1416 * (p.fq * V + Ul) + p.ph) + P.rimBands * Math.exp(-de / .07) * Math.sin(de * 40 + p.ph);
        sv = clamp(sv - Math.floor(sv / 1.0001) * 0, 0, 1); /* the ramp is read once across the pill, held at its ends */
        const k = (sv * 1023 | 0) * 3, o = i * 4, fr = 1 - P.frost * inkB[i], rim = dEdge < 1.6 * u ? (P.rimLight ?? .4) * (1 - dEdge / (1.6 * u)) : 0, n = B[i] * gz;
        for (let c = 0; c < 3; c++) { const v = clamp(LP[k + c] * fr + rim * 40 + n, 0, 255); d[o + c] += (v - d[o + c]) * cov; }
      }
    }
    g.putImageData(img, 0, 0);
    /* 4 — the tag sits on the glass, sharp */
    const tag = (P.tag || "").trim(); if (tag) { const ws = tag.split(/\s+/), ts = (P.tagSize ?? 17) * u; g.font = `400 ${ts}px "Archivo",Arial,sans-serif`; g.textAlign = "right"; g.textBaseline = "alphabetic"; g.fillStyle = css(C.tag); ws.forEach((w, k) => g.fillText(w, 313 * u, 59 * u + k * ts * .95)); g.textAlign = "left"; }
  }
  PLATES.push({
    id: "p17", no: "17", title: "Grain Pill", ref: REF, render,
    line: "Two frosted pills read one chrome ramp along a swirled coordinate at a jittered position, so the grain gathers where the ramp is steep; black type with an oval sits beside and under them.",
    texts: [{ key: "line1", label: "Line 1", def: "FIRST THOUGHT" }, { key: "line2", label: "Line 2 (in the oval)", def: "SECOND BRAIN" }, { key: "line3", label: "Line 3 (second word tabs right)", def: "FOR MINDGUT" }, { key: "tag", label: "Tag (one word per line)", def: "helix #01" }],
    params: [
      { key: "angle", label: "Run angle", min: -90, max: 90, step: 1, def: 18, unit: "°", group: "Chrome", why: "Direction the ramp runs across the upper pill, ±10 degrees by seed." },
      { key: "angle2", label: "Lower run angle", min: -90, max: 90, step: 1, def: 40, unit: "°", group: "Chrome", why: "Direction the ramp runs across the lower pill." },
      { key: "run", label: "Run", min: 0, max: 2, step: .01, def: .57, unit: "", group: "Chrome", why: "How much of the ramp one pill spans end to end." },
      { key: "run2", label: "Lower run", min: 0, max: 2.5, step: .01, def: .75, unit: "", group: "Chrome", why: "How much of the ramp the lower pill spans; it is shorter, so it needs more to reach the pink." },
      { key: "bend", label: "Bend", min: -1, max: 1, step: .01, def: .25, unit: "", group: "Chrome", why: "A quadratic across the run, which cups the bands into a swoosh." },
      { key: "swirl", label: "Swirl", min: 0, max: .5, step: .005, def: .15, unit: "", group: "Chrome", why: "Amplitude of the sine that bends the bands into a swoosh." },
      { key: "rimBands", label: "Rim bands", min: 0, max: .4, step: .005, def: .2, unit: "", group: "Chrome", why: "Bands that follow the pill's edge inside 0.07 of its height, the thin yellow and gray stripes along the source's rims." },
      { key: "shift", label: "Ramp offset", min: -.5, max: .5, step: .005, def: .05, unit: "", group: "Chrome", why: "Slides every pill along the ramp, which moves the dark, yellow and pink bands together." },
      { key: "shift2", label: "Lower offset", min: -.5, max: .5, step: .005, def: .27, unit: "", group: "Chrome", why: "Where on the ramp the lower pill starts: 0.2 opens its top corner on the light gray just before the dark swoosh." },
      { key: "pillH", label: "Pill height", min: 80, max: 260, step: 1, def: 158, unit: "px", group: "Pills", why: "Height of both pills. Measured 158 and 159 px; the ends are full half circles." },
      { key: "pill2", label: "Lower pill length", min: .7, max: 2.5, step: .01, def: 1, unit: "×", group: "Pills", why: "Length of the lower pill. Measured 226 px, 1.42 times its height." },
      { key: "frost", label: "Frost", min: 0, max: 1, step: .01, def: .25, unit: "", group: "Pills", why: "How much of the blurred type reads through a pill. Measured: the S of the middle line shows at about 30 % contrast under the glass." },
      { key: "frostBlur", label: "Frost blur", min: 0, max: 12, step: .1, def: 3.5, unit: "px", group: "Pills", why: "σ of the blur on the type seen through the glass." },
      { key: "jitter", label: "Jitter", min: 0, max: 6, step: .05, def: 1.35, unit: "px", group: "Grain", why: "σ of the offset each pixel reads the ramp at. Measured: high-pass σ is 1.2 to 1.5 times the local slope in L per px, so the grain gathers on the band edges." },
      { key: "grain", label: "Grain floor", min: 0, max: 8, step: .05, def: 1.6, unit: "σ", group: "Grain", why: "Luminance grain on the glass where the ramp is flat. Measured 1.3 to 1.8; the ground carries none." },
      { key: "grainSize", label: "Grain size", min: 0, max: 3, step: .05, def: .6, unit: "px", group: "Grain", why: "Softening of the grain field. Measured lag-1 correlation 0.6 to 0.8 on the glass." },
      { key: "capH", label: "Cap height", min: 12, max: 60, step: .5, def: 27.5, unit: "px", group: "Type", why: "Cap height of the three lines. Measured 27 to 28 px." },
      { key: "lead", label: "Line pitch", min: 30, max: 90, step: .5, def: 50.5, unit: "px", group: "Type", why: "Baseline to baseline. Measured 50 to 51 px." },
      { key: "indent", label: "Oval line indent", min: 0, max: 120, step: 1, def: 45, unit: "px", group: "Type", why: "How far the middle line steps in from the margin. Measured 45 px." },
      { key: "tab", label: "Tab", min: 60, max: 260, step: 1, def: 135, unit: "px", group: "Type", why: "Where the second word of the last line starts, from the margin. Measured 135 px." },
      { key: "oval", label: "Oval stroke", min: 0, max: 6, step: .1, def: 2.6, unit: "px", group: "Type", why: "Stroke of the oval round the middle line. 0 removes it." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 3, unit: "", group: "Chrome", why: "Re-rolls the swirl phase and each pill's turn of the run." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. Slides both pills once along the mirrored ramp, so the bands flow and return." }
    ],
    bench: { palette: "measured", params: { line1: "MUSIC", line2: "ARCHIVES", line3: "FOR BRANDS", tag: "edition #01" }, note: "The benchmark sets the type and tag to the source's wording, so the type patch and the frosted letters compare the same shapes. The pills sit where the source's do; their swirl is generated.", items: [
      { name: "ground", ref: [300, 300, 400, 400], out: [300, 300, 400, 400], m: ["hist", "mean", "std", "ink"], inks: [[230, 230, 230]], inkNames: ["ground"] },
      { name: "type", ref: [30, 40, 185, 140], out: [30, 40, 185, 140], m: ["hist", "mean", "ink", "share"], inks: [[29, 29, 22], [230, 230, 230]], inkNames: ["black", "ground"] },
      { name: "upper chrome", ref: [400, 36, 290, 144], out: [400, 36, 290, 144], m: ["hist", "mean", "std", "ink", "share"], inks: [[180, 180, 180], [85, 85, 84], [205, 203, 12], [232, 232, 232], [240, 190, 222]], inkNames: ["gray", "dark", "yellow", "white", "pink"] },
      { name: "frosted type", ref: [228, 36, 160, 144], out: [228, 36, 160, 144], m: ["hist", "mean", "std"] },
      { name: "lower pill", ref: [40, 735, 220, 150], out: [40, 735, 220, 150], m: ["hist", "mean", "std", "ink", "share"], inks: [[130, 130, 128], [208, 207, 207], [236, 193, 221], [230, 230, 230]], inkNames: ["dark", "white", "pink", "ground"] },
      { name: "band grain", ref: [520, 50, 128, 110], out: [520, 50, 128, 110], m: ["spec", "ac"], lags: 4 }
    ] },
    palettes: [
      { id: "measured", name: "Chrome", note: "measured", c: { ground: [230, 230, 230], ink: [8, 8, 8], tag: [30, 30, 30] }, stops: STOPS, stops2: STOPS2, sw: ["#e6e6e6", "#5f5f46", "#cecc0c", "#f4bae0"] },
      { id: "cobalt", name: "Cobalt", c: { ground: [228, 232, 238], ink: [10, 14, 30], tag: [86, 96, 120] }, stops: [[0, 214, 218, 226], [.25, 200, 206, 216], [.39, 140, 150, 170], [.47, 36, 52, 120], [.55, 40, 90, 255], [.62, 110, 190, 255], [.72, 230, 236, 244], [.86, 150, 226, 255], [1, 226, 236, 244]], stops2: [[0, 214, 218, 226], [.22, 214, 218, 226], [.36, 160, 168, 186], [.45, 90, 104, 140], [.53, 190, 200, 220], [.66, 216, 222, 234], [.8, 150, 210, 255], [1, 160, 214, 255]], sw: ["#e4e8ee", "#243478", "#285aff", "#96e2ff"] },
      { id: "acid", name: "Acid", c: { ground: [232, 232, 232], ink: [10, 10, 10], tag: [90, 90, 90] }, stops: [[0, 212, 212, 212], [.25, 198, 198, 202], [.39, 140, 140, 150], [.47, 62, 58, 78], [.55, 186, 255, 0], [.62, 220, 255, 90], [.72, 234, 232, 238], [.86, 196, 150, 255], [1, 232, 226, 240]], stops2: [[0, 212, 212, 212], [.22, 214, 214, 216], [.36, 160, 158, 168], [.45, 110, 104, 126], [.53, 192, 190, 200], [.66, 214, 210, 220], [.8, 200, 160, 255], [1, 206, 172, 255]], sw: ["#e8e8e8", "#3e3a4e", "#baff00", "#c496ff"] },
      { id: "mono", name: "Mono", c: { ground: [232, 232, 232], ink: [8, 8, 8], tag: [96, 96, 96] }, stops: [[0, 214, 214, 214], [.25, 200, 200, 200], [.39, 140, 140, 140], [.47, 70, 70, 70], [.55, 250, 250, 250], [.62, 236, 236, 236], [.72, 196, 196, 196], [.86, 246, 246, 246], [1, 226, 226, 226]], stops2: [[0, 214, 214, 214], [.22, 216, 216, 216], [.36, 158, 158, 158], [.45, 104, 104, 104], [.53, 200, 200, 200], [.66, 220, 220, 220], [.8, 246, 246, 246], [1, 236, 236, 236]], sw: ["#e8e8e8", "#464646", "#fafafa", "#8c8c8c"] },
      { id: "night", name: "Night", c: { ground: [24, 25, 28], ink: [236, 236, 238], tag: [170, 170, 176] }, stops: [[0, 70, 72, 78], [.25, 96, 98, 104], [.39, 60, 62, 68], [.47, 20, 20, 24], [.55, 230, 226, 30], [.62, 250, 246, 120], [.72, 200, 198, 206], [.86, 250, 150, 220], [1, 160, 150, 170]], stops2: [[0, 70, 72, 78], [.22, 96, 98, 104], [.36, 60, 62, 68], [.45, 30, 30, 34], [.53, 110, 110, 116], [.66, 170, 166, 176], [.8, 250, 150, 220], [1, 240, 160, 220]], sw: ["#18191c", "#141418", "#e6e21e", "#fa96dc"] },
      { id: "ice", name: "Ice", c: { ground: [240, 243, 246], ink: [18, 22, 30], tag: [100, 108, 120] }, stops: [[0, 222, 228, 236], [.25, 210, 218, 228], [.39, 150, 162, 182], [.47, 92, 104, 132], [.55, 120, 230, 210], [.62, 190, 250, 236], [.72, 236, 240, 248], [.86, 196, 186, 255], [1, 232, 232, 248]], stops2: [[0, 222, 228, 236], [.22, 224, 230, 238], [.36, 170, 180, 198], [.45, 120, 130, 156], [.53, 200, 210, 226], [.66, 222, 228, 240], [.8, 200, 190, 255], [1, 206, 198, 255]], sw: ["#f0f3f6", "#5c6884", "#78e6d2", "#c4baff"] }
    ],
    presets: [
      { name: "Liquid", set: { swirl: .4, bend: .8, rimBands: .35, run: .9 } },
      { name: "Clear glass", set: { frost: .7, frostBlur: 1.5, jitter: .4, grain: .5 } },
      { name: "Heavy grain", set: { jitter: 4, grain: 5, grainSize: 1.2 } },
      { name: "Big pill", set: { pillH: 230, pill2: 1.8, capH: 22 } }
    ],
    motion: [{ key: "phase", amp: 1, period: 24, mode: "saw" }, { key: "swirl", amp: .05, period: 9, mode: "sine" }],
    live: { x: { key: "angle", min: -60, max: 60 }, y: { key: "swirl", min: 0, max: .4 } },
    source: "Reference 17: frosted pill poster, 736 × 920 px",
    passes: ["type on its own layer: three lines of Archivo 500 at a 27.5 px cap and a 50.5 px pitch, the middle line indented 45 px and ringed by a 2.6 px oval, the last line's second word at a 135 px tab", "ground and type flat: no grain on the ground, as measured", "one grain field: position-hashed noise softened 0.6 px, normalized", "each pill: a stadium 158 px tall; every pixel reads the chrome ramp along a tilted run, a swirl, a cupping bend and bands that follow the rim, at a position jittered by the grain field; the type under it is blurred 3.5 px and shows at 25 %", "a light line on the first 1.6 px inside each pill's edge", "the tag in Archivo 400 on the glass, sharp, one word per line"],
    measured: { ground: [230, 230, 230], ground_sigma_L: 0, upper_pill_px: [220, 29, 701, 187], lower_pill_px: [37, 730, 263, 889], edge_px: "1 to 2, with a 239 light line at the top edge", type: { cap_px: 27.5, pitch_px: 50.5, margin_px: 35, indent_px: 45, tab_px: 135, ink: [22, 22, 22], method: "rows and columns with L < 110" }, oval: { bbox: [65, 79, 250, 141], stroke_px: 2.6 }, chrome_samples: { gray: [179, 179, 179], dark: [166, 164, 167], yellow: [197, 196, 3], pink: [236, 212, 218], lower_pink: [236, 193, 221], lower_dark: [129, 129, 127], lower_white: [207, 206, 206], method: "7 × 7 means" }, grain: { hp_over_slope: "1.2 to 1.5 L per (L per px): high-pass σ at 3 px blur binned by local slope over both pills", floor_hp: [1.3, 1.8], lag1: [.58, .92], ground_hp: 0 } },
    limits: ["Bench mean 0.94. The upper chrome patch scores 0.73 on its histogram and 0.82 on its dark ink: the source's swoosh is a hand-drawn C that keeps 41 % of the patch in mid gray and wraps its yellow under the rim; the render's warped run spaces its bands more evenly, so it shows more yellow and white and less gray. The lower pill's histogram scores 0.86 for the same reason.", "The type patch histogram scores 0.86: 7.5 % of the source's pixels round the letters read above 240, JPEG ringing on a 230 ground; the render's ground is flat and no ringing was added.", "Archivo 500 stands in for the source's grotesque; caps, pitch, indent and tab are set to the measured 27.5, 50.5, 45 and 135 px.", "The copy is Mindgut wording by default; the benchmark sets the source's words so the type and frost patches compare the same shapes."],
    study: { slug: "grain-pill", lede: "Two frosted pills that read one chrome ramp at a jittered position, beside three lines of small black type with an oval round the middle one.",
      body: ["The source's pills are stadiums about 158 px tall with edges cut in 1 to 2 px. Inside, a blurred chrome runs gray, white, dark gray, yellow, white and pink in a swoosh, with thin bands that follow the rim at the right end. The grain sits on the glass only, and it is not even: its high-pass σ is 1.2 to 1.5 times the local slope, so it gathers on the band edges and nearly vanishes in the flat pink. That is the signature of a gradient read at a randomly offset position. The type under the glass shows blurred at about 30 % contrast; the small tag on the glass stays sharp.", "The rebuild sets the type on its own layer, then lays each pill over it. Every pixel inside a pill reads the ramp along a warped coordinate: a tilted run, a swirl, a cupping bend and rim bands, all read at a position jittered by one grain field, so the grain lands on the band edges. The type under the pill is blurred and shows through at the Frost setting. The lower pill uses the same ramp with its yellow spent. Run angle, Run, Swirl and Bend shape the bands; Jitter and Grain floor set the grain; the Type group sets the three lines and the oval."],
      method: "Warped ramp coordinate · Jittered read position · Frosted backdrop · Type on its own layer",
      points: [
        { u: .66, v: .1, d: "KEY", label: "Dark band to yellow: the steepest run of the ramp, where the jittered read scatters dark specks into the yellow.", t: "grain", dir: [0, -1] },
        { u: .5, v: .09, d: "READ", label: "Frosted run: light gray with the type under it blurred 3.5 px and shown at 25 %.", t: "frost", dir: [0, -1] },
        { u: .9, v: .12, d: "READ", label: "Rim bands: stripes that follow the pill's edge inside 0.07 of its height.", t: "chrome", dir: [1, 0] },
        { u: .95, v: .06, d: "READ", label: "Pink tip: the ramp's last stop, 246 186 224, where the grain is lightest.", t: "chrome", dir: [1, -1] },
        { u: .31, v: .035, d: "KEY", label: "Pill edge: cut in 1.4 px, with a light line on the first 1.6 px inside.", t: "edge", dir: [0, -1] },
        { u: .1, v: .055, d: "KEY", label: "Type: Archivo 500, 27.5 px caps, 50.5 px from baseline to baseline.", t: "type", dir: [-1, 0] },
        { u: .15, v: .12, d: "READ", label: "Oval: a 2.6 px ring 15 px clear of the middle line's ends.", t: "type", dir: [-1, 0] },
        { u: .4, v: .055, d: "READ", label: "Tag on the glass: Archivo 400 at 17 px, sharp, one word per line, right-aligned.", t: "type", dir: [0, -1] },
        { u: .12, v: .85, d: "KEY", label: "Lower pill: the same ramp with the yellow spent, so the dark swoosh turns straight to white and pink.", t: "chrome", dir: [-1, 0] },
        { u: .5, v: .5, d: "READ", label: "Ground: flat 230 230 230; no grain reaches it.", t: "ground", dir: [0, 0] }
      ] }
  });
})();
