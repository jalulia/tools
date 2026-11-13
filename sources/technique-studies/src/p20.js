/* ===== PLATE 20 · NOISE ATOM =====
   a dark video ground of horizontal blue clumps; one speck field whose density and color fall off with distance from
   the core, so near the core the specks fuse into the glow; orbits drawn as crayon: several offset passes of a band
   whose width swells and thins with pressure, edges broken on a paper tooth, ends curled into hooks; hairline orbits;
   a faceted blue gem with magenta side facets; one scan line; per-pixel grain. */
(function () {
  const REF = { w: 736, h: 736 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, n = W * H, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 8191 + 3), nR = vnoise(P.seed + 41), nD = vnoise(P.seed + 97), nW = vnoise(P.seed + 131);
    const cx = W * .51 + (rnd() - .5) * 16 * u, cy = H * .495 + (rnd() - .5) * 16 * u, ph = P.phase * 2 * Math.PI;
    /* ---- 1 · strokes: stamp cones into a profile buffer (max), so the profile is 1 on the centerline, 0 at the edge ---- */
    const PROF = new Float32Array(n).fill(-99), PRS = new Float32Array(n), HAIR = new Float32Array(n), ER = 5 * u;
    const stamp = (buf, px, py, R) => { const x0 = Math.max(0, Math.floor(px - R - 1)), x1 = Math.min(W - 1, Math.ceil(px + R + 1)), y0 = Math.max(0, Math.floor(py - R - 1)), y1 = Math.min(H - 1, Math.ceil(py + R + 1)), iR = 1 / R;
      for (let y = y0; y <= y1; y++) { const dy = y + .5 - py, o = y * W; for (let x = x0; x <= x1; x++) { const dx = x + .5 - px, v = 1 - Math.sqrt(dx * dx + dy * dy) * iR; if (v > buf[o + x]) buf[o + x] = v; } } };
    /* crayon stamp: keeps the signed distance inside the band's edge (px, negative outside, to ER) and the pressure there */
    const stampE = (px, py, R, pr) => { const Re = R + ER, x0 = Math.max(0, Math.floor(px - Re)), x1 = Math.min(W - 1, Math.ceil(px + Re)), y0 = Math.max(0, Math.floor(py - Re)), y1 = Math.min(H - 1, Math.ceil(py + Re));
      for (let y = y0; y <= y1; y++) { const dy = y + .5 - py, o = y * W; for (let x = x0; x <= x1; x++) { const dx = x + .5 - px, v = R - Math.sqrt(dx * dx + dy * dy); if (v > PROF[o + x]) { PROF[o + x] = v; PRS[o + x] = pr; } } } };
    /* a pass: walk an ellipse from φ0 to φ1 in ~1 px steps; width = stroke × pressure, pressure from noise along φ and
       a taper at both ends; then a hook: the walk keeps going while its curvature climbs, turning about 1.5 turns
       toward the orbit's inside while the width runs out */
    const pass = (o, off, ph0, ph1, wid, seedOff, hookA, hookB) => {
      const pt = f => { const wv = (nR(Math.cos(f) * 1.7 + o.k, Math.sin(f) * 1.7 + o.k) - .5) * 2 * P.wobble * u + off * (.6 + .8 * nW(f * 1.3 + seedOff, o.k)); const ex = o.a * Math.cos(f), ey = o.b * Math.sin(f), nx = o.b * Math.cos(f), ny = o.a * Math.sin(f), nl = Math.hypot(nx, ny) || 1, lx = ex + nx / nl * wv, ly = ey + ny / nl * wv; return [cx + lx * o.ca - ly * o.sa, cy + lx * o.sa + ly * o.ca]; };
      const L = Math.abs(ph1 - ph0) * (o.a + o.b) * .5, N = Math.max(8, Math.ceil(L / (1.1 * u))), sw = P.swell;
      for (let i = 0; i <= N; i++) { const t = i / N, f = ph0 + (ph1 - ph0) * t, [x, y] = pt(f), [x2, y2] = pt(f + .002), tl = Math.hypot(x2 - x, y2 - y) || 1, nx = -(y2 - y) / tl, ny = (x2 - x) / tl;
        const taper = Math.min(1, t / .06, (1 - t) / .06), pq = sstep(.22, .78, nD(f * 1.9 + seedOff, o.k * 3)), pr = clamp((1 - sw * .55 + sw * .7 * pq) * (.35 + .65 * Math.pow(taper, .6)), .12, 1.2), R = Math.max(.7 * u, wid * pr * .5);
        const sp = sstep(.66, .78, nW(f * 1.5 + seedOff + 20, o.k + 7)) * P.split;   /* the pass splits into two lines for a stretch */
        if (sp > .02) { const sep = R * (.55 + .5 * sp), r2 = Math.max(.7 * u, R * (1 - .5 * sp)); stampE(x + nx * sep, y + ny * sep, r2, pr); stampE(x - nx * sep, y - ny * sep, r2 * (.6 + .4 * nD(f * 5 + seedOff, 9)), pr); }
        else stampE(x, y, R, pr); }
      /* hooks at the chosen ends */
      const hook = (end) => { const f = end ? ph1 : ph0, d = end ? Math.sign(ph1 - ph0) : -Math.sign(ph1 - ph0), [x0, y0] = pt(f), [x1, y1] = pt(f + d * .01); let hx = x0, hy = y0, hd = Math.atan2(y1 - y0, x1 - x0);
        const toC = Math.atan2(cy - hy, cx - hx), turn = Math.sin(toC - hd) > 0 ? 1 : -1, Lh = P.hook * u * (.8 + .4 * hashI(o.k * 7, end, P.seed)), steps = Math.ceil(Lh / (1 * u)), w0 = wid * (.75 + .25 * sw);
        for (let i = 1; i <= steps; i++) { const q = i / steps, kap = turn * (P.curl * 2 * Math.PI / Lh) * (.45 + 1.1 * q); hd += kap * u; hx += Math.cos(hd) * u; hy += Math.sin(hd) * u; stampE(hx, hy, Math.max(.7 * u, w0 * .5 * (1 - .55 * q) * (1 - .2 * Math.sin(q * 7))), .9 - .3 * q); } };
      if (hookA) hook(false); if (hookB) hook(true);
    };
    const NO = Math.round(P.rings), orbits = [];
    for (let i = 0; i < NO; i++) { const t = NO ? i / NO : 0, ang = (P.tilt + t * 180 + (rnd() - .5) * 14) * Math.PI / 180 + ph * (i % 2 ? -1 : 1) * .5, a = P.radius * W * .5 * (.86 + rnd() * .2), b = a * P.squash * (.75 + rnd() * .5); orbits.push({ ca: Math.cos(ang), sa: Math.sin(ang), a, b, k: i * 13.7 + rnd() * 50 }); }
    const sw0 = P.stroke * u, np = Math.round(P.passes);
    orbits.forEach((o, i) => { const st = rnd() * 6.283; for (let p = 0; p < np; p++) { const a0 = st + (rnd() - .5) * .9 + p * .35, sweep = (1.35 + rnd() * .5) * Math.PI * (p ? .55 + rnd() * .35 : 1), off = (p ? (rnd() < .5 ? -1 : 1) * (.35 + .5 * rnd()) : 0) * P.spread * sw0; const hk = p === 0 || rnd() < .3; pass(o, off, a0, a0 + sweep, sw0 * (p ? .55 + .35 * rnd() : 1), p * 9.1 + i, hk && (p === 0 || rnd() < .5), hk); } });
    /* hairline orbits: narrow ellipses through the core, one pass, no hooks */
    const NH = Math.round(P.hair);
    for (let i = 0; i < NH; i++) { const ang = (P.tilt + 22 + i * 180 / Math.max(1, NH) + (rnd() - .5) * 26) * Math.PI / 180 - ph * .3, a = P.radius * W * .5 * (.45 + rnd() * .5), b = a * (.05 + rnd() * .16), o = { ca: Math.cos(ang), sa: Math.sin(ang), a, b, k: 300 + i * 7.3 }, N = Math.ceil(6.3 * a / u);
      for (let j = 0; j <= N; j++) { const f = j / N * 6.2832, ex = o.a * Math.cos(f), ey = o.b * Math.sin(f); stamp(HAIR, cx + ex * o.ca - ey * o.sa, cy + ex * o.sa + ey * o.ca, 4 * u * .5 * (.7 + .6 * nD(f * 3 + i, 77))); } }
    /* ---- 2 · per pixel: ground, speck field, glow, gem, strokes, scan line ---- */
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, nQ = vnoise(P.seed + 151), nG = vnoise(P.seed + 5), nS = vnoise(P.seed + 17), nT = vnoise(P.seed + 29), nM = vnoise(P.seed + 61);
    const R0 = P.core * u, nf = Math.round(P.facets ?? 5), gs = P.glow * u, ro = 60 * gs, reach = P.reach * u * P.glow, far = P.specks * .001, gsh = P.blueShare, tooth = P.dry, scanY = cy + (P.scan ?? 0) * H, gr = P.grain, sd = P.seed + 3;
    const GL = C.glowRamp, nGL = GL.length;
    let r, g, b; const mix = (c, t) => { r += (c[0] - r) * t; g += (c[1] - g) * t; b += (c[2] - b) * t; };
    const U = v => 1 / (1 + Math.exp(-(v - .5) * 10.6));   /* value noise (σ ≈ 0.16) to a near-uniform rank */
    const facetA = rnd() * 6.283;
    for (let y = 0, k = 0, j = 0; y < H; y++) for (let x = 0; x < W; x++, k++, j += 4) {
      const dx = x + .5 - cx, dy = y + .5 - cy, rr = Math.hypot(dx, dy);
      /* ground: dark with vivid blue clumps stretched 2:1 along the scan */
      const gn = U(nG(x / (4.6 * u), y / (2.6 * u)) * .6 + nS(x / (2.2 * u) + 91, y / (1.5 * u)) * .34 + hashI(x, y, sd) * .06);
      r = C.ground[0]; g = C.ground[1]; b = C.ground[2]; mix(C.blue, sstep(1 - gsh - .06, 1 - gsh + .06, gn));
      /* glow: the ground tints green toward the core, e-fold 60 px past the 60 px ring */
      const gb = Math.min(1, Math.exp(-(rr - ro) / (60 * gs))), gt = Math.min(1, Math.exp(-(rr - ro) / (85 * gs))); mix(C.base, gt * P.halo * .55);
      /* speck field: density e-folds over `reach` from the ring, floor `far`; specks coarsen toward the core */
      const rho = far + Math.exp(-(rr - 74 * gs) / reach) * P.halo, gc = sstep(.15, .7, gb);
      const sn = U((nS(x / (3 * u), y / (1.9 * u)) * (1 - gc) + nW(x / (3.6 * u) + 40, y / (3 * u)) * gc) * .92 + hashI(x, y, sd + 1) * .08);
      if (sn > 1 - rho) { /* speck color: far specks lavender, near ones green, inside the ring the glow ramp; brightness per speck */
        const e = sstep(1 - rho - .06, 1 - rho + .22, sn), lv = (.5 + 1.2 * Math.pow(nM(x / (2.4 * u), y / (1.6 * u)), 2)) * (1 - gb) + (.8 + .4 * nM(x / (3 * u), y / (3 * u))) * gb, fr = rr / (100 * gs);
        let sc0, sc1, sc2;
        if (fr < 1) { let i = 0; while (i < nGL - 2 && fr * 100 > GL[i + 1][0]) i++; const A = GL[i], B = GL[i + 1], t = clamp((fr * 100 - A[0]) / (B[0] - A[0]), 0, 1); sc0 = A[1][0] + (B[1][0] - A[1][0]) * t; sc1 = A[1][1] + (B[1][1] - A[1][1]) * t; sc2 = A[1][2] + (B[1][2] - A[1][2]) * t; const wb = sstep(.55, .75, nM(x / (4 * u) + 17, y / (4 * u))) * sstep(.3, .5, fr) * sstep(.85, .65, fr) * P.halo; sc0 += (C.glowHot[0] - sc0) * wb; sc1 += (C.glowHot[1] - sc1) * wb; sc2 += (C.glowHot[2] - sc2) * wb; }
        else { const t = Math.min(1, Math.exp(-(rr - 100 * gs) / (210 * gs))), dimb = sstep(1.05, .6, lv) * (1 - t); sc0 = C.speckFar[0] + (C.speckNear[0] - C.speckFar[0]) * t; sc1 = C.speckFar[1] + (C.speckNear[1] - C.speckFar[1]) * t; sc2 = C.speckFar[2] + (C.speckNear[2] - C.speckFar[2]) * t; sc0 += (C.speckDim[0] - sc0) * dimb; sc1 += (C.speckDim[1] - sc1) * dimb; sc2 += (C.speckDim[2] - sc2) * dimb; }
        if (fr >= 1 && hashI(x >> 1, y >> 1, sd + 9) < (P.warm ?? .15) * (1 - gb)) { sc0 = C.speckWarm[0]; sc1 = C.speckWarm[1]; sc2 = C.speckWarm[2]; }
        mix([sc0 * lv, sc1 * lv, sc2 * lv], e);
      }
      /* magenta and lavender pockets just outside the gem, in angular sectors */
      if (rr < R0 * 2.3 && rr > R0 * .9) { const th = Math.atan2(dy, dx) + facetA, fs = (th / 6.2832 + 1) * nf * 2, sec = Math.floor(fs) % (nf * 2), fe = Math.min(fs - Math.floor(fs), Math.ceil(fs) - fs) * rr * 6.2832 / (nf * 2) / u, rad = sstep(R0 * 2.3, R0 * 2.05, rr) * sstep(R0 * .9, R0 * 1.05, rr) * sstep(.5, 1.6, fe);
        if (sec % 2) mix(sec % 4 === 1 ? C.gem2 : C.lav, rad * (sec % 4 === 1 ? .92 : .6) * (.8 + .2 * nM(x / (3 * u), y / (3 * u)))); }
      /* the gem: an nf-sided polygon, one blue face lit from the upper left, a violet facet on the right */
      const th0 = Math.atan2(dy, dx) - facetA, pr = Math.cos(Math.PI / nf) / Math.cos(((th0 % (6.2832 / nf)) + 6.2832 / nf) % (6.2832 / nf) - Math.PI / nf);
      if (rr < R0 * pr) { const edge = sstep(R0 * pr - 3.2 * u, R0 * pr - 1.2 * u, rr), side = Math.cos(Math.atan2(dy, dx) - .2) > .55 && rr > R0 * .45 ? 1 : 0; r = C.gem[0]; g = C.gem[1]; b = C.gem[2]; if (side) mix(C.gem3, .75); mix(C.gemEdge, edge * .9); }
      /* hairlines: dark across the bright glow, mint outside it */
      const hv = HAIR[k]; if (hv > 0) { const lum = .3 * r + .59 * g + .11 * b, cv2 = gb > .75 ? C.hairIn : C.hairOut, cov = sstep(.05, .35, hv) * (.55 + .45 * hashI(x, y, sd + 4)); mix(cv2, cov * .9); }
      /* crayon: ink lands where (distance inside the edge) + pressure × paper beats the threshold, so the edge bites
         2 to 4 px in and throws detached flecks up to 2 px out; then the speck field and the blue clumps under the
         stroke knock pits in it, dark or tinted by what is beneath */
      const E = PROF[k];
      if (E > -ER) { const pq = PRS[k], T = nT(x / (2.8 * u), y / (2.8 * u)) * .5 + nQ(x / (1.2 * u), y / (1.2 * u)) * .3 + hashI(x, y, sd + 5) * .2, Tu = U(T),
          dep = E / u + 3.6 * tooth * (Tu * (.55 + .55 * pq) - .5) - .1, ps = U(nQ(x / (1.1 * u) + 30, y / (1.1 * u)) * .65 + hashI(x, y, sd + 12) * .35), pit = Math.max(sstep(1 - P.bite, 1 - P.bite + .06, ps), sstep(.93, .99, gn) * .5) * sstep(-1, 1.5, E / u);
        let cov = sstep(-.2, .35, dep) * (1 - .45 * Math.min(1, pit));
        if (cov > 0) { const de = Math.max(0, E / u), sr = C.stroke, lv = .9 + .2 * hashI(x, y >> 1, sd + 6), A = de < 2.2 ? sr[0] : de < 4.5 ? sr[1] : sr[2], B = de < 2.2 ? sr[1] : de < 4.5 ? sr[2] : sr[3], t = de < 2.2 ? de / 2.2 : de < 4.5 ? (de - 2.2) / 2.3 : Math.min(1, (de - 4) / 3) * sstep(.4, .7, nM(x / (5 * u), y / (5 * u)) + .15);
          mix([(A[0] + (B[0] - A[0]) * t) * lv, (A[1] + (B[1] - A[1]) * t) * lv, (A[2] + (B[2] - A[2]) * t) * lv], cov);
          if (de > 2.5) mix(sr[4], sstep(.56, .7, nT(x / (3.2 * u) + 50, y / (3.2 * u))) * sstep(2.5, 4.5, de) * .85 * cov); } }   /* pale blotches where the crayon pressed hardest */
      /* scan line */
      if ((P.scanK ?? .7) > 0) { const sl = Math.exp(-((y + .5 - scanY) ** 2) / (.8 * u * u)) * (P.scanK ?? .7) * (.5 + .5 * hashI(x >> 2, 0, sd + 7)); mix(C.hairOut, sl * .55); }
      const nz = (hashI(x, y, sd + 8) - .5) * gr; d[j] = r + nz; d[j + 1] = g + nz; d[j + 2] = b + nz * 1.2; d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  const MEAS = { ground: [7, 7, 40], blue: [24, 20, 90], base: [26, 60, 32], speckFar: [86, 86, 124], speckNear: [94, 142, 100], speckWarm: [104, 104, 92], speckDim: [52, 46, 170], glowHot: [152, 217, 224],
    glowRamp: [[0, [150, 200, 205]], [25, [130, 190, 170]], [45, [140, 210, 190]], [58, [118, 218, 196]], [70, [96, 200, 160]], [85, [88, 168, 112]], [100, [84, 138, 92]]],
    gem: [12, 6, 242], gem2: [150, 64, 212], gem3: [80, 50, 225], gemEdge: [139, 184, 209], lav: [177, 177, 220], hairIn: [44, 100, 56], hairOut: [98, 192, 124],
    stroke: [[118, 176, 118], [104, 206, 160], [88, 220, 186], [88, 222, 222], [146, 212, 186]] };
  /* an alternate world from seven anchors: ground, clump, stroke core, stroke edge, glow, gem face, side facet */
  const L3 = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const world = (gd, cl, sc, se, gw, gm, g2) => ({ ground: gd, blue: cl, base: L3(gd, se, .35), speckFar: L3(cl, [200, 200, 210], .45), speckNear: L3(se, gd, .25), speckWarm: L3(se, [150, 150, 120], .5), speckDim: L3(cl, gd, .1), glowHot: L3(gw, [235, 240, 245], .45),
    glowRamp: [[0, L3(gw, [235, 240, 245], .4)], [25, L3(gw, se, .35)], [45, L3(gw, [235, 240, 245], .25)], [58, gw], [70, L3(gw, se, .45)], [85, L3(se, gd, .2)], [100, L3(se, gd, .4)]],
    gem: gm, gem2: g2, gem3: L3(gm, g2, .5), gemEdge: L3(gw, [235, 240, 245], .3), lav: L3(g2, [235, 240, 245], .5), hairIn: L3(se, gd, .55), hairOut: L3(se, sc, .3),
    stroke: [L3(se, gd, .1), L3(se, sc, .5), sc, L3(sc, [235, 240, 245], .25), L3(sc, [235, 240, 245], .45)] });
  PLATES.push({
    id: "p20", no: "20", title: "Noise Atom", ref: REF, render,
    line: "One speck field whose density falls off from the core makes both the ground and the glow; crayon orbits are laid over it in offset passes that break on the paper tooth and curl into hooks.",
    params: [
      { key: "specks", label: "Far specks", min: 0, max: 400, step: 1, def: 110, unit: "per 1000", group: "Speck field", why: "Speck density far from the core, dim and bright together. 12 % of corner pixels sit above L 32 in the reference, 1.5 % above L 70." },
      { key: "reach", label: "Speck reach", min: 20, max: 240, step: 1, def: 66, unit: "px", group: "Speck field", why: "Distance over which the speck density falls by e from 74 px out. Fitted 76 px to the reference: 93 % covered at 80 px, 55 % at 120, 12 % at 230." },
      { key: "halo", label: "Glow", min: 0, max: 1.6, step: .01, def: 1.08, unit: "×", group: "Speck field", why: "Strength of the green tint and of the speck density near the core." },
      { key: "glow", label: "Glow radius", min: .4, max: 2.2, step: .01, def: 1.03, unit: "×", group: "Speck field", why: "Scales the glow: 1 puts the brightest ring at 60 px and the green edge at 100 px." },
      { key: "blueShare", label: "Blue clumps", min: 0, max: .6, step: .01, def: 0.2, unit: "", group: "Ground", why: "Share of the ground in vivid blue clumps, stretched 2:1 along the scan direction." },
      { key: "grain", label: "Grain", min: 0, max: 40, step: .5, def: 12, unit: "", group: "Ground", why: "Per-pixel video noise, a little bluer than neutral." },
      { key: "rings", label: "Orbits", min: 0, max: 7, step: 1, def: 3, unit: "", group: "Crayon", why: "Number of crayon orbits." },
      { key: "passes", label: "Passes", min: 1, max: 5, step: 1, def: 3, unit: "", group: "Crayon", why: "Strokes laid along each orbit; the later ones are shorter, narrower and offset." },
      { key: "spread", label: "Pass spread", min: 0, max: 2, step: .01, def: 0.85, unit: "× width", group: "Crayon", why: "Sideways offset of the later passes; past 1 a dark gap opens between them." },
      { key: "stroke", label: "Stroke width", min: 3, max: 30, step: .1, def: 15, unit: "px", group: "Crayon", why: "Width of the first pass at full pressure. 12 to 16 px in the reference." },
      { key: "swell", label: "Pressure", min: 0, max: 1.4, step: .01, def: 1, unit: "", group: "Crayon", why: "How much the width swells and thins along the stroke." },
      { key: "dry", label: "Tooth", min: 0, max: 1.4, step: .01, def: .85, unit: "", group: "Crayon", why: "How far into the stroke the paper tooth breaks the edge." },
      { key: "split", label: "Split", min: 0, max: 1, step: .01, def: .7, unit: "", group: "Crayon", why: "How often a pass separates into two parallel lines for a stretch, the way a worn crayon tip rides on two edges." },
      { key: "bite", label: "Pits", min: 0, max: .5, step: .005, def: .2, unit: "", group: "Crayon", why: "Share of stroke pixels the speck field and the blue clumps knock dark or tint. 15 to 25 % in the reference strokes." },
      { key: "hook", label: "Hook length", min: 0, max: 160, step: 1, def: 130, unit: "px", group: "Crayon", why: "Length of the curl at each stroke end." },
      { key: "curl", label: "Hook turn", min: .2, max: 1.5, step: .01, def: 0.8, unit: "turns", group: "Crayon", why: "How far the hook turns before it runs out." },
      { key: "wobble", label: "Wobble", min: 0, max: 20, step: .1, def: 6, unit: "px", group: "Crayon", why: "Hand wobble of the orbit radius along the stroke." },
      { key: "radius", label: "Orbit size", min: .3, max: 1.1, step: .005, def: 0.88, unit: "of half width", group: "Orbits", why: "Long axis of the orbits." },
      { key: "squash", label: "Squash", min: .15, max: 1, step: .005, def: .5, unit: "×", group: "Orbits", why: "Short axis over long axis." },
      { key: "tilt", label: "Tilt", min: 0, max: 179, step: .5, def: 28, unit: "°", group: "Orbits", why: "Angle of the first orbit; the rest spread evenly from it." },
      { key: "hair", label: "Hairlines", min: 0, max: 8, step: 1, def: 4, unit: "", group: "Orbits", why: "Narrow orbits drawn as 2 px lines through the core, dark across the glow." },
      { key: "core", label: "Gem size", min: 6, max: 50, step: .5, def: 25, unit: "px", group: "Core", why: "Radius of the faceted gem. Measured 18 px." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. Precesses the orbits, alternate ones the other way." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 20, unit: "", group: "Motion", why: "Re-rolls the speck field, the passes and the hooks." }
    ],
    presets: [
      { name: "Clean orbits", set: { dry: 0, wobble: 1.5, passes: 1, swell: .2, specks: 20, grain: 3, hook: 0 } },
      { name: "Scribble", set: { passes: 5, spread: 1.6, swell: 1.3, hook: 150, curl: 1.2, wobble: 12 } },
      { name: "Wide glow", set: { glow: 1.7, halo: 1.4, reach: 130, core: 34 } },
      { name: "Static storm", set: { specks: 320, blueShare: .5, grain: 30, dry: 1.2 } }
    ], motion: [{ key: "phase", amp: 1, period: 16, mode: "saw" }, { key: "halo", amp: .15, period: 5, mode: "sine" }],
    live: { x: { key: "tilt", min: 0, max: 179 }, y: { key: "glow", min: .5, max: 1.8 } },
    bench: { palette: "measured", params: {}, note: "Orbits, hooks and core are generated. The two ground patches sit in clean corners of both images. The halo-speck and stroke rects on the render were placed with search.py; the core rect is centered on the render's gem.", items: [
      { name: "ground", ref: [8, 8, 96, 96], out: [8, 8, 96, 96], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 6, inks: [[7, 7, 42], [25, 21, 96], [83, 82, 123]], inkNames: ["dark", "blue", "speck"] },
      { name: "far ground", ref: [632, 616, 96, 96], out: [632, 616, 96, 96], m: ["hist", "mean", "std", "spec", "ac"], lags: 6 },
      { name: "halo specks", ref: [196, 268, 64, 64], out: [208, 320, 64, 64], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 6, inks: [[24, 40, 34], [55, 110, 70], [90, 150, 105], [120, 200, 150]], inkNames: ["base", "dim speck", "speck", "bright speck"] },
      { name: "stroke", ref: [60, 320, 110, 96], out: [464, 144, 110, 96], m: ["hist", "mean", "std", "ink", "share"], inks: [[8, 10, 32], [41, 49, 71], [89, 216, 178], [113, 175, 144]], inkNames: ["dark", "gray", "mint", "green"] },
      { name: "core", ref: [288, 292, 160, 160], out: [288, 292, 160, 160], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[31, 82, 40], [85, 157, 112], [93, 217, 191], [147, 199, 191], [51, 26, 228]], inkNames: ["dark green", "mid", "mint", "pale", "gem"] },
      { name: "whole plate", ref: [0, 0, 736, 736], out: [0, 0, 736, 736], m: ["hist", "mean", "ink", "share"], inks: [[8, 10, 32], [16, 14, 69], [44, 56, 62], [100, 164, 128], [92, 222, 191], [138, 207, 175]], inkNames: ["dark", "blue", "gray", "mid", "mint", "pale"] }
    ] },
    source: "Reference 20: video-noise atom, 736 × 736 px JPEG",
    passes: ["ground: dark (7, 7, 40) with vivid blue clumps (24, 20, 90) on a 20 % share, from value noise stretched 4.6 × 2.6 px, so the clumps run along the scan", "speck field: one ranked noise field, cut at a density of 0.11 far out plus exp(−(r − 74) / 66) toward the core; far specks are blue when dim and lavender when bright, near ones gray-green, and inside 100 px they take the glow ramp, so the specks fuse into the glow", "glow tint: the ground under the specks greens toward the core with an 85 px e-fold, 0.55 strong, so dark ground still shows between the specks at 160 px", "gem: a 25 px pentagon in saturated blue with a violet face and a 2 px light rim; ten sectors out to 2.3 radii, alternate ones filled magenta or lavender with crisp 1 px edges", "hairlines: 4 narrow ellipses, 4 px, dark green inside the bright glow and mint outside it", "crayon: each orbit is 3 passes; each pass stamps the signed distance to its band edge along the ellipse at 1.1 px steps, width = 15 px × a pressure noise that runs from 0.12 to 1.2 × an end taper; for stretches the band splits into two parallel lines; each pass ends in a hook that turns about 0.8 of a turn as its curvature climbs. Ink lands where distance inside the edge + 3.6 × tooth × (paper × pressure − 0.5) clears the threshold, with the paper a 2.8 px and 1.2 px value noise plus a per-pixel draw, so the edge bites 2 to 4 px in and throws flecks out; a fine speck grain and the blue clumps then tint 15 % of stroke-core pixels; color by distance from the edge: green fringe under 2.2 px, mint to 4.5 px, a cyan core with pale blotches beyond", "scan line at the core's height, then 12 levels of per-pixel grain, a little bluer than neutral"],
    measured: { ground: { dark: [9, 8, 46], blue: [24, 21, 87], speck: [75, 73, 115], shares: [.698, .276, .025], mean_L: 18.8, sigma_L: 15.1, ac_x: [.75, .39, .17], ac_y: [.54, .1, .02], method: "inks and statistics of the clean 96 px corners (8, 8) and (632, 616)" }, far_specks: { above_L32: .12, above_L70: .015, color_bright: [83, 82, 123], vivid_blue_share: [.10, .16], method: "four clean 100 px corners" }, speck_density_by_r: { 60: .98, 80: .93, 100: .76, 120: .55, 140: .39, 160: .29, 200: .23, 230: .12, 260: .09, 350: .04, fit: "exp(−(r − 74) / 76) above a floor", method: "share above L 70 in 20 px annuli about (375, 364), strokes masked" }, glow_L_by_r: { 0: 36, 20: 143, 40: 159, 50: 173, 60: 170, 70: 152, 80: 132, 100: 105, 120: 85, 140: 71, 170: 60, method: "mean L in 10 px annuli" }, glow_colors: { r22_45: "green (104, 167, 129), pale mint (138, 203, 172), magenta (134, 92, 192), lavender (177, 177, 220)", r45_75: "mint (88, 216, 187) 32 %, white-cyan (152, 217, 222) 23 %", method: "5-means per annulus" }, gem: { blue: [10, 4, 243], eq_radius_px: 18.3, bbox_px: [55, 40], magenta: [153, 84, 210], magenta_mean_r_px: 33, method: "B > 180, G < 90 inside 40 px" }, stroke: { width_px_p50_p90: [14, 18], by_distance_from_edge: { 1: [108, 172, 136], 2: [110, 200, 155], 3: [103, 212, 163], 5: [88, 217, 179], 8: [84, 220, 201] }, method: "distance transform of the mint mask, skeleton widths outside r 170" } },
    limits: ["Bench mean 0.934, short of 0.98. The lowest metric is the halo-speck histogram (0.71): the reference halo at 160 px spreads its specks evenly from L 0 to 150, the plate's ranked field puts more pixels at the dark floor and at L 70 to 120. The core's dark-green ink (0.80) and both ground spectra (0.79 to 0.81) follow: the reference carries JPEG block energy at 8 px that the plate does not imitate.", "Rejected: the earlier single-pass orbit with a gaussian profile; the reference strokes measure 14 px median and 18 px at p90 with a green fringe and a cyan core, which one even stroke cannot make.", "The orbits, hooks and gem are the plate's own. The reference's four pinwheel arcs and their eyes are not copied, so the whole-plate ink shares differ where the compositions differ: the reference's glow cloud fills more of the space inside its orbits."],
    study: { slug: "noise-atom", lede: "One speck field is the ground far out and the glow near the core; crayon orbits are pressed onto it in offset passes that end in hooks.",
      body: ["The reference is a frame of noisy video. The ground is near black with vivid blue clumps stretched along the scan, and 1.5 % of its pixels are bright specks. Toward the core the specks get denser and greener: 93 % of pixels at 80 px, 55 % at 120 px, 12 % at 230 px. Inside 75 px they fuse into a mint and white-cyan glow that peaks at L 173 about 50 px out. A small blue gem sits in the middle with magenta facets around it. The orbits are crayon. Each is several passes, 12 to 18 px wide, with a green fringe, a mint body and a cyan core where the stroke is widest. The ends curl into hooks.", "The rebuild draws the ground as two blues cut from one stretched noise field. One more noise field, ranked to an even distribution, is cut at a density that falls off from the core, so the same field gives the far specks, the green halo and the glow. Each orbit is laid as three passes of stamped cones whose width follows a pressure noise and tapers at the ends, and each pass ends in a hook whose curvature climbs. The cone height has to beat a paper tooth to print, so the edges break and the middle stays solid. Speck reach, glow and far specks set the field. Passes, pass spread, stroke width, pressure, tooth and the two hook controls set the crayon."],
      method: "Stretched two-blue ground · One ranked speck field with a radial density · Stamped crayon passes on a paper tooth · Curvature-climbing hooks · Faceted gem",
      points: [
        { u: .503, v: .496, d: "KEY", label: "Gem: a 25 px blue pentagon with a violet face and a 2 px light rim; the reference measures an 18 px equivalent radius.", t: "pull", dir: [0, -1] },
        { u: .56, v: .44, d: "READ", label: "Magenta facets: alternate sectors from 1 to 2.3 gem radii, crisp at a 1 px edge, cut by the hairlines.", t: "edge", dir: [1, -1] },
        { u: .58, v: .53, d: "KEY", label: "Glow ring: specks fuse at 93 % cover; mint with white-cyan blotches, brightest about 50 px from the gem.", t: "pull", dir: [1, 1] },
        { u: .36, v: .62, d: "READ", label: "Halo specks at 160 px: 29 % cover in the reference, gray-green, with dark ground showing between them.", t: "grain", dir: [-1, 1] },
        { u: .1, v: .1, d: "KEY", label: "Far ground: blue clumps on 20 % of pixels, stretched 2:1 along the scan; dim specks blue, bright ones lavender.", t: "grain", dir: [1, 1] },
        { u: .82, v: .3, d: "KEY", label: "Hook: the stroke keeps going while its curvature climbs, about 0.8 of a turn, and stays thick to a blunt end.", t: "edge", dir: [1, -1] },
        { u: .25, v: .7, d: "READ", label: "Overlapping passes: the second and third passes are 0.55 to 0.9 as wide and sit up to 0.85 widths to the side.", t: "edge", dir: [-1, 1] },
        { u: .72, v: .76, d: "READ", label: "Dry edge: ink lands only where edge distance plus pressure times paper clears the threshold, so the edge bites 2 to 4 px and drops flecks; 15 % of core pixels are tinted by the speck grain.", t: "grain", dir: [1, 1] },
        { u: .45, v: .4, d: "READ", label: "Hairline in the glow: 4 px, dark green over the bright ring, mint once it leaves the glow.", t: "edge", dir: [-1, -1] },
        { u: .9, v: .496, d: "READ", label: "Scan line: one 1.3 px row at the gem's height, its brightness jittered every 4 px.", t: "edge", dir: [1, 0] }
      ] },
    palettes: [
      { id: "measured", name: "Video blue", note: "measured", c: MEAS, sw: ["#070728", "#18145a", "#58dcb8", "#0c06f2"] },
      { id: "amber", name: "Amber terminal", c: world([9, 8, 4], [40, 30, 8], [255, 196, 70], [190, 120, 30], [255, 220, 140], [255, 120, 20], [255, 200, 60]), sw: ["#090804", "#281e08", "#ffc446", "#ff7814"] },
      { id: "mono", name: "Monitor", c: world([8, 9, 10], [26, 28, 32], [214, 218, 224], [130, 134, 140], [235, 238, 242], [110, 114, 120], [180, 184, 190]), sw: ["#08090a", "#1a1c20", "#d6dae0", "#6e7278"] },
      { id: "magenta", name: "Magenta phosphor", c: world([16, 4, 22], [52, 10, 66], [255, 110, 225], [190, 60, 170], [255, 190, 240], [40, 230, 230], [120, 255, 200]), sw: ["#100416", "#340a42", "#ff6ee1", "#28e6e6"] },
      { id: "ice", name: "Ice", c: world([8, 16, 34], [26, 48, 92], [170, 228, 255], [110, 170, 220], [232, 246, 255], [30, 80, 255], [130, 180, 255]), sw: ["#081022", "#1a305c", "#aae4ff", "#1e50ff"] },
      { id: "lime", name: "Lime scope", c: world([5, 10, 6], [16, 40, 20], [190, 255, 80], [110, 190, 50], [230, 255, 180], [150, 60, 255], [230, 90, 255]), sw: ["#050a06", "#102814", "#beff50", "#963cff"] }
    ]
  });
})();
