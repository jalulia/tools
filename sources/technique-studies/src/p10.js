/* ===== PLATE 10 · AIRBRUSH RIBBON =====
   one helix on one axis carries everything: a translucent band (its shade is a measured ramp over the
   surface normal, its layers stack like gels), thin light helices that add their own glow, a row of lit
   spheres on the axis, a perspective grid whose glow lifts the black, then one airbrush bloom and scan grain. */
(function () {
  const REF = { w: 1000, h: 675 };
  /* shade ramp over the normal angle θ (0 = top, π/2 = facing the viewer, π = bottom): [θ, base factor, white mix]
     read off the reference's single-layer section at x=760 and the loop at x=300 (see `measured`) */
  const RAMP = [[0, .75, .19], [.25, .68, .12], [.5, .47, .17], [.72, .75, .07], [.9, .98, 0], [1.3, 1, 0], [1.55, .72, .07], [1.75, .44, .13], [2.05, .88, .055], [2.4, .58, .12], [2.75, .32, .08], [3.14, .18, .06], [3.6, .07, .04], [4.2, .04, .035], [4.71, .04, .035], [5.3, .08, .04], [5.8, .34, .1], [6.2832, .75, .19]];
  function ramp(th) { th = ((th % 6.2832) + 6.2832) % 6.2832; let i = 0; while (i < RAMP.length - 2 && RAMP[i + 1][0] <= th) i++; const a = RAMP[i], b = RAMP[i + 1], t = sstep(0, 1, (th - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  /* wide blurs at reduced resolution: box-average down by f, blur, Catmull-Rom back up */
  function lowblur(src, W, H, sigma, f) { const w0 = Math.ceil(W / f), h0 = Math.ceil(H / f), d = new Float32Array(w0 * h0), c = new Float32Array(w0 * h0); for (let y = 0; y < H; y++) { const yy = (y / f) | 0; for (let x = 0; x < W; x++) { const i = yy * w0 + ((x / f) | 0); d[i] += src[y * W + x]; c[i]++; } } for (let i = 0; i < d.length; i++) d[i] /= c[i] || 1; return upsampleCR(gblur(d, w0, h0, sigma / f), w0, h0, W, H); }
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c, N = W * H;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 7177 + 5);
    const R = H * P.radius, cy = H * P.horizon - 8 * u, cx = W * .5, bw = W * P.band, pitch = W * P.pitch, zf = R * lerp(12, 2.2, P.persp);
    const persp = z => 1 / (1 - z / zf);
    const rot = 6.2832 * (P.phase || 0), th0 = P.start + rnd() * .2, th1 = th0 + 6.2832 * P.turns, adv = th => { const t = (th - th0) / 6.2832; return pitch * (t + P.open * t * t * t); }, span = adv(th1) + bw, a0 = (W - span) / 2 + P.shift * W;
    /* ---------- base: black, blue haze and the grid ---------- */
    const Rb = new Float32Array(N), Gb = new Float32Array(N), Bb = new Float32Array(N);
    const vy = H * P.horizon, gc = mk(W, H), gg = gc.getContext("2d");
    if (P.gridGlow > 0) {
      const pb = P.gridPitch * u, y0 = H, n0 = Math.max(4, Math.round((H - vy) / (P.gridPitch * u * .345)));
      const K = (y0 - vy) * n0; gg.lineCap = "butt"; gg.strokeStyle = "#fff"; gg.lineWidth = 1.5 * u;
      const fade = y => sstep(vy + (H - vy) * .6, vy + (H - vy) * .76, y);
      for (let i = -40; i <= 40; i++) { const xb = cx + i * pb; const segs = 14; for (let k = 0; k < segs; k++) { const t0 = k / segs, t1 = (k + 1) / segs, ya = vy + (H - vy) * t0, yb = vy + (H - vy) * t1; gg.globalAlpha = fade((ya + yb) / 2) * 1; if (gg.globalAlpha < .01) continue; gg.beginPath(); gg.moveTo(cx + (xb - cx) * t0, ya); gg.lineTo(cx + (xb - cx) * t1, yb); gg.stroke(); } }
      for (let n = n0; n < n0 * 3; n++) { const y = vy + K / n; if (y < vy + (H - vy) * .5) break; gg.globalAlpha = Math.min(1, fade(y) * (.5 + .45 * (y - vy) / (H - vy))); gg.beginPath(); gg.moveTo(0, y); gg.lineTo(W, y); gg.stroke(); }
      gg.globalAlpha = 1;
    }
    const gl = chan(gg, W, H, 3), glo = gblur(gl, W, H, 2.2 * u), glo2 = lowblur(gl, W, H, 9 * u, 4);
    for (let y = 0; y < H; y++) { const hz = sstep(vy + (H - vy) * .45, H + (H - vy) * .3, y) * P.haze * (P.hzk ?? .75); for (let x = 0; x < W; x++) { const i = y * W + x, g = (gl[i] * (P.gl ?? 1.3) + glo[i] * (P.gg ?? .25)) * P.gridGlow, g2 = glo2[i] * (P.g2 ?? .1) * P.gridGlow * P.haze; Rb[i] = C.ground[0] + C.haze[0] * hz + C.grid[0] * g + C.haze[0] * g2; Gb[i] = C.ground[1] + C.haze[1] * hz + C.grid[1] * g + C.haze[1] * g2; Bb[i] = C.ground[2] + C.haze[2] * hz + C.grid[2] * g + C.haze[2] * g2; } }
    /* ---------- spheres on the axis (z = 0) ---------- */
    const sR = new Float32Array(N), sG = new Float32Array(N), sB = new Float32Array(N), sA = new Float32Array(N);
    const ns = Math.round(P.spheres), sr = P.sphereR * u, sp = 78 * u, sx0 = sp * (.6 + .2 * rnd());
    for (let k = 0; k < ns; k++) {
      const x0 = sx0 + k * sp, y0 = cy + (hashI(k, 3, P.seed) - .5) * 2 * u, col = C.spheres[(k + Math.floor(hashI(1, 7, P.seed) * C.spheres.length)) % C.spheres.length], dim = .86 + .14 * hashI(k, 11, P.seed);
      for (let y = Math.floor(y0 - sr - 2); y <= Math.ceil(y0 + sr + 2); y++) for (let x = Math.floor(x0 - sr - 2); x <= Math.ceil(x0 + sr + 2); x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue; const dx = (x - x0) / sr, dy = (y - y0) / sr, d = Math.hypot(dx, dy), cov = clamp((1 - d) * sr + .5, 0, 1); if (cov <= 0) continue;
        const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)), lam = sstep(-.75, 1, dx * .78 - dy * .25 + nz * .57), spec = Math.pow(Math.max(0, dx * .35 - dy * .55 + nz * .76), 14) * .12;
        const i = y * W + x, sh = (.26 + .74 * lam) * dim; sR[i] = col[0] * sh + 255 * spec; sG[i] = col[1] * sh + 255 * spec; sB[i] = col[2] * sh + 255 * spec; sA[i] = cov;
      }
    }
    /* overspray halo around each masked sphere */
    if (P.halo > 0) { const tR = new Float32Array(N), tG = new Float32Array(N), tB = new Float32Array(N); for (let i = 0; i < N; i++) { const a = sA[i]; if (a > 0) { const l = (.299 * sR[i] + .587 * sG[i] + .114 * sB[i]) * a; tR[i] = l * .8; tG[i] = l * .95; tB[i] = l * 1.3; } } const hR = lowblur(tR, W, H, 6 * u, 4), hG = lowblur(tG, W, H, 6 * u, 4), hB = lowblur(tB, W, H, 6 * u, 4); for (let i = 0; i < N; i++) { const k = P.halo * 1.0 * (1 - sA[i]); Rb[i] += hR[i] * k; Gb[i] += hG[i] * k; Bb[i] += hB[i] * k; } }
    /* ---------- light helices: additive core + glow, with a depth buffer ---------- */
    const aR = new Float32Array(N), aG = new Float32Array(N), aB = new Float32Array(N), aZ = new Float32Array(N).fill(-1e9), aM = new Float32Array(N);
    const na = Math.round(P.arcs), core = P.arcCore * u, kr = Math.ceil(core * 2.5), zs = P.arcGlow * 2.5 * u, kz = Math.ceil(zs * 1.5);
    for (let k = 0; k < na; k++) {
      const col = C.arcs[(k + 2) % C.arcs.length], ra = R * (.86 + .15 * hashI(k, 1, P.seed + 9)), ph = (hashI(k, 2, P.seed + 9) - .5) * .8, pa = pitch * (1.6 + 1.2 * hashI(k, 4, P.seed + 9)), xap = a0 + (k + .02 + .2 * hashI(k, 5, P.seed + 9)) / na * span, ta = 6.2832 * (.6 + .4 * hashI(k, 6, P.seed + 9)), bright = .65 + .5 * hashI(k, 8, P.seed + 9), gate = (hashI(k, 10, P.seed + 9) - .5) * 2.5;
      const steps = Math.ceil(ta * ra * 1.4); let px = 0, py = 0; for (let n = 0; n <= steps; n++) {
        const th = ph + ta * (n / steps - .5), tt = th / 6.2832, thr = th + rot * 1.5, z = ra * Math.sin(thr), p = persp(z), x = cx + (xap + pa * tt * (1 + P.open * Math.abs(tt) * .5) - cx) * p, y = cy - ra * Math.cos(thr) * p;
        const ds = n ? Math.hypot(x - px, y - py) : 0; px = x; py = y; if (!ds) continue;
        if (x < -kr || y < -kr || x > W + kr || y > H + kr) continue;
        const env = (.3 + .7 * Math.pow(.5 + .5 * Math.cos(thr - gate), 1.2)) * Math.pow(Math.max(0, Math.sin(Math.PI * n / steps)), .5) * bright * P.arcGain * ds / (core * 2.5);
        for (let yy = Math.floor(y - kz); yy <= Math.ceil(y + kz); yy++) for (let xx = Math.floor(x - kz); xx <= Math.ceil(x + kz); xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const d2 = (xx - x) * (xx - x) + (yy - y) * (yy - y), i = yy * W + xx, wz = Math.exp(-d2 / (2 * zs * zs)) * env; if (wz > aM[i]) { aM[i] = wz; aZ[i] = z; } if (d2 > kr * kr) continue; const w = Math.exp(-d2 / (2 * core * core)) * env; aR[i] += col[0] * w; aG[i] += col[1] * w; aB[i] += col[2] * w; }
      }
    }
    const gR = lowblur(aR, W, H, P.arcGlow * u, 2), gG = lowblur(aG, W, H, P.arcGlow * u, 2), gB = lowblur(aB, W, H, P.arcGlow * u, 2), ag = (P.ag ?? 2.4), ak = (P.ak ?? .25), a2 = (P.a2 ?? .1);
    const wR = lowblur(aR, W, H, P.arcGlow * 5 * u, 4), wG = lowblur(aG, W, H, P.arcGlow * 5 * u, 4), wB = lowblur(aB, W, H, P.arcGlow * 5 * u, 4);
    for (let i = 0; i < N; i++) { aR[i] = aR[i] * ak + gR[i] * ag + wR[i] * a2; aG[i] = aG[i] * ak + gG[i] * ag * .95 + wG[i] * a2 * .9; aB[i] = aB[i] * ak + gB[i] * ag * .9 + wB[i] * a2 * .8; }
    /* ---------- ribbon spans: the band sliced by rows, each slice knows its depth and normal ---------- */
    const rows = new Array(H); for (let y = 0; y < H; y++) rows[y] = [];
    const dth = .35 / (R * persp(R)); let prev = null;
    const edgeR = new Float32Array(N), edgeB = new Float32Array(N);
    for (let th = th0; th <= th1 + 1e-9; th += dth) {
      const thr = th + rot, z = R * Math.sin(thr), p = persp(z), y = cy - R * Math.cos(thr) * p, xa = cx + (a0 + adv(th) - cx) * p, xb = xa + bw * p;
      if (prev) { const ya = Math.min(prev.y, y), yb = Math.max(prev.y, y), r0 = Math.floor(ya), r1 = Math.floor(yb); for (let r = r0; r <= r1; r++) { if (r < 0 || r >= H) continue; const cov = Math.min(yb, r + 1) - Math.max(ya, r); if (cov <= 0) continue; const L = rows[r], last = L[L.length - 1]; if (last && last.dir === Math.sign(y - prev.y) && Math.abs(last.th - thr) < .2) { last.cov += cov; last.xa = (last.xa * last.n + xa) / (last.n + 1); last.xb = (last.xb * last.n + xb) / (last.n + 1); last.n++; } else L.push({ xa, xb, z, th: thr, cov, n: 1, dir: Math.sign(y - prev.y) }); } }
      prev = { y, th };
    }
    for (let y = 0; y < H; y++) { const L = rows[y]; for (const sp of L) sp.cov = Math.min(1, sp.cov); L.sort((a, b) => a.z - b.z); }
    /* cut ends of the band: a soft lit edge (the reference's end glows blue over the grid) */
    if (P.rimGlow > 0) for (const th of [th1]) { const thr = th + rot, z = R * Math.sin(thr), p = persp(z), y = cy - R * Math.cos(thr) * p, xa = cx + (a0 + adv(th) - cx) * p, xb = xa + bw * p, s1 = 3 * u, s2 = 13 * u, rr = Math.ceil(s2 * 2.5), xl = Math.min(xa, xb), xr = Math.max(xa, xb), dn = (Math.sin(thr) > 0 ? 1 : .35) * P.rimGlow, out = Math.cos(thr) < 0 ? 1 : -1;
      for (let yy = Math.floor(y - rr); yy <= Math.ceil(y + rr); yy++) for (let xx = Math.floor(xl - rr); xx <= Math.ceil(xr + rr); xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const dx = xx < xl ? xl - xx : xx > xr ? xx - xr : 0, dy = yy - y, d2 = dx * dx + dy * dy, side = dy * out > 0 ? 1 : .8, g = (Math.exp(-d2 / (2 * s1 * s1)) * .8 + Math.exp(-d2 / (2 * s2 * s2)) * .55 * side) * dn; const i = yy * W + xx; edgeR[i] += g * .6; edgeB[i] += g; } }
    /* ---------- per-pixel composite in depth order: base → back spans → spheres/arc at their depth → front spans ---------- */
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, Fr = new Float32Array(N), Fg = new Float32Array(N), Fb = new Float32Array(N), Fc = new Float32Array(N);
    const alpha = P.opacity, T = [1 - P.tint * (1 - C.gel[0] / 255), 1 - P.tint * (1 - C.gel[1] / 255), 1 - P.tint * (1 - C.gel[2] / 255)], base = C.ribbon, rim = C.rim, e = Math.max(.4, P.edge * u), lampL = 1 - P.lamp;
    const nS = vnoise(P.seed + 31), lampX = new Float32Array(W); for (let x = 0; x < W; x++) lampX[x] = lerp(lampL, 1, sstep(0, .7, x / W));
    /* per-span constants: shade from the ramp, blue under-light from the down-facing component */
    for (let y = 0; y < H; y++) for (const sp of rows[y]) { const [bf, wm] = ramp(sp.th), dn = Math.max(0, -Math.cos(sp.th)); sp.bf = bf; sp.wm = wm; sp.bl = dn * dn * dn * P.rimGlow * .28; sp.x0 = Math.min(sp.xa, sp.xb); sp.x1 = Math.max(sp.xa, sp.xb); }
    const stk = .07 * P.streak;
    for (let y = 0; y < H; y++) { const L = rows[y], nL = L.length, ys = y / (260 * u); for (let x = 0; x < W; x++) {
      const i = y * W + x; let r = Rb[i], g = Gb[i], b = Bb[i];
      if (nL === 0) { const a = sA[i]; if (a > 0) { r += (sR[i] - r) * a; g += (sG[i] - g) * a; b += (sB[i] - b) * a; } r += aR[i]; g += aG[i]; b += aB[i]; }
      else { let sphDone = false, arcDone = false, under = 0, st = 0; const az = aZ[i], hasArc = aR[i] + aG[i] + aB[i] > 0, lamp = lampX[x];
        for (let k = 0; k < nL; k++) { const sp = L[k]; let c = Math.min(x + .5 - sp.x0, sp.x1 - x + .5); if (c <= 0) continue; c = Math.min(1, c / e) * sp.cov; if (c <= 0) continue;
          if (!sphDone && sp.z > 0) { const a = sA[i]; if (a > 0) { r += (sR[i] - r) * a; g += (sG[i] - g) * a; b += (sB[i] - b) * a; } sphDone = true; }
          if (!arcDone && hasArc && az < sp.z) { r += aR[i]; g += aG[i]; b += aB[i]; arcDone = true; }
          if (!st) st = 1 + (nS(x / (34 * u), ys) - .5) * stk;
          const f = sp.bf * (1 - P.tint * (P.ud ?? .55) * under) * lamp, wm = (sp.wm + (P.uw ?? .13) * under * P.tint) * 255, bl = sp.bl;
          const cr = base[0] * f + wm + rim[0] * bl, cg = base[1] * f + wm + rim[1] * bl, cb = base[2] * f + wm + rim[2] * bl, ac = alpha * c, tr = 1 - ac, kr = (1 - c + c * T[0]) * tr, kg = (1 - c + c * T[1]) * tr, kb2 = (1 - c + c * T[2]) * tr, em = c * st;
          r = r * kr + cr * em; g = g * kg + cg * em; b = b * kb2 + cb * em; under = Math.min(1, under + c); }
        if (!sphDone) { const a = sA[i]; if (a > 0) { r += (sR[i] - r) * a; g += (sG[i] - g) * a; b += (sB[i] - b) * a; } }
        if (!arcDone && hasArc) { r += aR[i]; g += aG[i]; b += aB[i]; } Fc[i] = under; }
      const eg = edgeR[i], eb = edgeB[i]; if (eg > 0 || eb > 0) { r += rim[0] * eg + 60 * eb; g += rim[1] * eg + 75 * eb; b += rim[2] * eg + 105 * eb; }
      Fr[i] = r; Fg[i] = g; Fb[i] = b; } }
    /* ---------- airbrush bloom and scan grain ---------- */
    let bR = Fr, bG = Fg, bB = Fb; if (P.bloom > 0 && P.bloomGain > 0) { bR = lowblur(Fr, W, H, P.bloom * u, 4); bG = lowblur(Fg, W, H, P.bloom * u, 4); bB = lowblur(Fb, W, H, P.bloom * u, 4); }
    const kb = P.bloomGain, gr = P.grain, nM = vnoise(P.seed + 91), mw = Math.ceil(W / 4), mh = Math.ceil(H / 4), m0 = new Float32Array(mw * mh); for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) m0[y * mw + x] = fbm(nM, x / (7.5 * u), y / (7.5 * u), 3) - .5; const mot = upsampleCR(m0, mw, mh, W, H), gf = new Float32Array(N); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) gf[y * W + x] = hashI(x, y, P.seed + 77) + hashI(x, y, P.seed + 78) - 1; const gn = gblur(gf, W, H, .75 * u);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, j = i * 4, n = (gn[i] * 4.2 * gr + mot[i] * 3 * gr) * (1 + .45 * Fc[i]) + (hashI(x, y, P.seed + 80) < .012 ? 2.5 * gr : 0), ch = (hashI(x, y, P.seed + 79) - .5) * gr * .6; const r = Fr[i] + bR[i] * kb, g = Fg[i] + bG[i] * kb, b = Fb[i] + bB[i] * kb; d[j] = clamp(r + n + ch, 0, 255); d[j + 1] = clamp(g + n, 0, 255); d[j + 2] = clamp(b + n - ch, 0, 255); d[j + 3] = 255; }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p10", no: "10", title: "Airbrush Ribbon", ref: REF, render,
    line: "A translucent band coiled on one axis: its color is a ramp over the surface normal, its layers stack like gels, thin helices add their glow with a depth test, and one airbrush bloom sits over a 39 px floor grid.",
    params: [
      { key: "turns", label: "Turns", min: .4, max: 3, step: .01, def: 1.85, unit: "", group: "Ribbon", why: "How many times the band goes around the axis. 1.85 ends the band at the front, just under the sphere line." },
      { key: "radius", label: "Coil radius", min: .15, max: .55, step: .005, def: .44, unit: "of height", group: "Ribbon", why: "Radius of the coil. The reference loop spans 600 px of a 675 px sheet." },
      { key: "band", label: "Band width", min: .06, max: .45, step: .005, def: .18, unit: "of width", group: "Ribbon", why: "Width of the strip along the axis. The reference band is 200 px wide at the loop." },
      { key: "pitch", label: "Pitch", min: .03, max: .9, step: .005, def: .08, unit: "of width / turn", group: "Ribbon", why: "Axial advance per turn at the start. Below the band width the far side shows through the near side." },
      { key: "open", label: "Opening", min: 0, max: 3, step: .01, def: .9, unit: "×", group: "Ribbon", why: "Cubic growth of the pitch along the coil: a tight loop that opens into the long sweep." },
      { key: "start", label: "Start angle", min: 0, max: 6, step: .01, def: 2.6, unit: "rad", group: "Ribbon", why: "Where on the circle the band begins. 2.6 rad hides the start at the lower front." },
      { key: "shift", label: "Coil position", min: -.35, max: .35, step: .005, def: .04, unit: "of width", group: "Ribbon", why: "Slides the whole coil along its axis." },
      { key: "persp", label: "Perspective", min: 0, max: 1, step: .01, def: .4, unit: "", group: "Ribbon", why: "Near parts of the coil drawn larger. At .4 the near face is 12 % wider than the far face." },
      { key: "opacity", label: "Gel opacity", min: .45, max: 1, step: .01, def: .84, unit: "", group: "Ribbon", why: "Share of the near layer in the mix. At .84 the far side reads through at 16 %." },
      { key: "tint", label: "Gel density", min: 0, max: 1, step: .01, def: .35, unit: "", group: "Ribbon", why: "How much a layer tints what lies behind it and darkens a layer stacked on it." },
      { key: "lamp", label: "Lamp fall-off", min: 0, max: .7, step: .01, def: .38, unit: "", group: "Ribbon", why: "The key light sits at the right. The band at the left edge is dimmed by this fraction." },
      { key: "streak", label: "Spray streaks", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Ribbon", why: "Passes of the gun along the band, read as faint 34 px streaks." },
      { key: "edge", label: "Mask edge", min: .5, max: 8, step: .1, def: 1.3, unit: "px", group: "Ribbon", why: "Softness of the frisket edge. The reference edge turns over in 1.5 px." },
      { key: "rimGlow", label: "Under-light", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Ribbon", why: "Blue light from the floor on the band's cut end and on down-facing parts." },
      { key: "arcs", label: "Light helices", min: 0, max: 6, step: 1, def: 3, unit: "", group: "Light", why: "Count of thin additive helices on the same axis." },
      { key: "arcCore", label: "Core width", min: .6, max: 5, step: .05, def: 1.3, unit: "px", group: "Light", why: "Sigma of the bright core of each helix." },
      { key: "arcGlow", label: "Glow radius", min: 1.5, max: 16, step: .1, def: 3.8, unit: "px", group: "Light", why: "Sigma of the sprayed skirt around the core. A second skirt sits at 5 times this radius." },
      { key: "arcGain", label: "Light gain", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Light", why: "Brightness of the helices. At 1 the yellow core peaks at the measured 228, 181, 89." },
      { key: "spheres", label: "Spheres", min: 0, max: 16, step: 1, def: 12, unit: "", group: "Spheres", why: "Count of lit balls along the axis, spaced 78 px apart." },
      { key: "halo", label: "Sphere halo", min: 0, max: 3, step: .01, def: .25, unit: "×", group: "Spheres", why: "Overspray around each masked ball, a 6 px blur that lifts the black beside it." },
      { key: "sphereR", label: "Sphere size", min: 5, max: 40, step: .5, def: 18, unit: "px", group: "Spheres", why: "Radius of each ball. Measured 18 px." },
      { key: "gridPitch", label: "Grid pitch", min: 18, max: 90, step: .5, def: 39, unit: "px at foot", group: "Grid", why: "Spacing of the floor grid at the bottom edge. Measured 39 px." },
      { key: "gridGlow", label: "Grid light", min: 0, max: 2.2, step: .01, def: 1, unit: "×", group: "Grid", why: "Brightness of the grid lines and their 2.2 px glow. 0 removes the floor." },
      { key: "horizon", label: "Horizon", min: .3, max: .75, step: .005, def: .52, unit: "of height", group: "Grid", why: "Vanishing height of the floor. The band's axis sits 8 px above it." },
      { key: "haze", label: "Floor haze", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Grid", why: "Blue light lifting the black toward the foot, and the 9 px glow around the grid." },
      { key: "bloom", label: "Bloom radius", min: 0, max: 24, step: .5, def: 7, unit: "px", group: "Air", why: "Radius of the haze that every light throws past its own edge." },
      { key: "bloomGain", label: "Bloom", min: 0, max: .5, step: .005, def: .04, unit: "×", group: "Air", why: "How much of that haze is added back." },
      { key: "grain", label: "Scan grain", min: 0, max: 10, step: .1, def: 3.1, unit: "σ", group: "Air", why: "Noise of the printed, scanned original: a 0.75 px blurred field plus a 30 px mottle. Measured σ 2.6 on the black." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 7, unit: "", group: "Air", why: "Re-rolls sphere colors and helix placement." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. The coil turns once about the axis per unit; the light helices turn one and a half times." }
    ],
    motion: [{ key: "phase", amp: 1, period: 24, mode: "saw" }, { key: "arcGain", amp: .25, period: 5, mode: "sine" }, { key: "lamp", amp: .12, period: 11, mode: "sine" }],
    live: { x: { key: "open", min: 0, max: 3 }, y: { key: "radius", min: .2, max: .55 } },
    presets: [
      { name: "Tight coil", set: { turns: 2.6, band: .13, pitch: .06, open: .3, persp: .55 } },
      { name: "Wide sash", set: { turns: .8, band: .42, pitch: .5, open: 0, opacity: .7 } },
      { name: "Neon", set: { arcs: 6, arcGain: 2, arcGlow: 9, bloomGain: .3, gridGlow: 1.8 } },
      { name: "Cel", set: { grain: 0, bloomGain: 0, edge: .6, arcGlow: 2, tint: .1, halo: 0 } }
    ],
    palettes: [
      { id: "measured", name: "Hot orange", note: "measured", c: { ground: [10, 11, 16], haze: [2, 1, 26], grid: [30, 27, 46], ribbon: [255, 72, 25], gel: [255, 120, 40], rim: [90, 136, 221], arcs: [[252, 206, 108], [118, 154, 90], [120, 150, 255]], spheres: [[152, 182, 98], [250, 200, 66], [152, 182, 98], [92, 84, 186], [64, 94, 186]] }, sw: ["#0b0c11", "#ff4819", "#fcce79", "#2c2a5a"] },
      { id: "cyan", name: "Cyan gel", c: { ground: [8, 10, 14], haze: [2, 4, 22], grid: [90, 40, 80], ribbon: [20, 190, 230], gel: [40, 180, 230], rim: [255, 120, 170], arcs: [[255, 230, 160], [255, 110, 160], [160, 255, 200]], spheres: [[255, 120, 90], [250, 220, 90], [120, 220, 255], [200, 120, 255], [255, 255, 255]] }, sw: ["#080a0e", "#14bee6", "#ff6ea0", "#5a2850"] },
      { id: "violet", name: "Ultraviolet", c: { ground: [10, 8, 16], haze: [6, 2, 24], grid: [30, 80, 90], ribbon: [200, 60, 240], gel: [190, 80, 230], rim: [120, 255, 220], arcs: [[255, 240, 200], [120, 255, 200], [255, 180, 80]], spheres: [[255, 200, 80], [120, 240, 200], [255, 90, 120], [90, 120, 255], [230, 230, 230]] }, sw: ["#0a0810", "#c83cf0", "#78ffdc", "#1e505a"] },
      { id: "emerald", name: "Emerald", c: { ground: [8, 11, 12], haze: [2, 6, 16], grid: [40, 60, 110], ribbon: [40, 200, 90], gel: [60, 200, 110], rim: [255, 190, 90], arcs: [[255, 230, 120], [255, 120, 150], [200, 220, 255]], spheres: [[255, 160, 60], [240, 230, 90], [120, 140, 255], [255, 90, 90], [220, 240, 230]] }, sw: ["#080b0c", "#28c85a", "#ffbe5a", "#283c6e"] },
      { id: "ice", name: "Ice on navy", c: { ground: [8, 12, 30], haze: [2, 4, 26], grid: [40, 110, 130], ribbon: [200, 225, 255], gel: [170, 210, 255], rim: [255, 150, 70], arcs: [[255, 170, 80], [255, 240, 150], [140, 230, 255]], spheres: [[255, 120, 70], [250, 210, 80], [80, 180, 255], [230, 240, 250], [160, 220, 200]] }, sw: ["#080c1e", "#c8e1ff", "#ffaa50", "#286e82"] },
      { id: "gold", name: "Gold on midnight", c: { ground: [10, 9, 18], haze: [4, 2, 24], grid: [80, 40, 110], ribbon: [255, 190, 40], gel: [255, 200, 70], rim: [100, 140, 255], arcs: [[255, 90, 70], [120, 230, 120], [240, 240, 255]], spheres: [[255, 80, 60], [90, 200, 120], [90, 110, 255], [255, 220, 120], [220, 220, 230]] }, sw: ["#0a0912", "#ffbe28", "#ff5a46", "#50286e"] }
    ],
    bench: { palette: "measured", params: {}, note: "Composition is generated; the ribbon face, arc, sphere and grid patches were placed with search.py on the default render and then fixed by hand to the equivalent material events.", items: [
      { name: "ribbon face", ref: [600, 110, 240, 150], out: [596, 90, 240, 150], m: ["hist", "mean", "std", "spec", "ink"], lags: 8, inks: [[254, 71, 24], [168, 75, 53]], inkNames: ["orange", "dark"] },
      { name: "arc over black", ref: [392, 60, 96, 128], out: [400, 44, 96, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 10, inks: [[13, 13, 20], [150, 109, 63], [252, 206, 121]], inkNames: ["black", "skirt", "core"] },
      { name: "grid floor", ref: [760, 588, 240, 85], out: [760, 588, 240, 85], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 12, inks: [[12, 12, 30], [40, 39, 68]], inkNames: ["floor", "line"] },
      { name: "black", ref: [840, 415, 130, 160], out: [30, 40, 130, 160], m: ["hist", "mean", "std", "spec"], lags: 6 },
      { name: "sphere row", ref: [20, 318, 220, 48], out: [404, 318, 220, 48], m: ["hist", "mean", "ink", "share"], inks: [[13, 13, 20], [150, 178, 93], [250, 201, 70]], inkNames: ["black", "green", "yellow"] },
      { name: "whole plate", ref: [0, 0, 1000, 675], out: [0, 0, 1000, 675], m: ["hist", "ink", "share"], inks: [[13, 13, 20], [45, 37, 46], [181, 81, 50], [240, 80, 35], [128, 70, 50], [202, 142, 90], [156, 177, 206]], inkNames: ["black", "haze", "mid orange", "hot orange", "red brown", "pink", "blue white"] }
    ] },
    passes: ["base: black, a blue haze from the horizon down, the floor grid drawn once at 1.5 px and glowed at 2.2 px and 9 px", "spheres on the axis at depth zero: lambert discs lit from the right, a hard 1 px mask edge, a 6 px overspray halo", "light helices on the same axis: gaussian cores splatted with a wide depth kernel, then a 3.8 px skirt and a 19 px skirt per channel", "the band: sliced by rows into spans that carry depth and normal angle; per pixel the spans composite far to near as gels (opacity, tint, stacking), with the spheres and the helices inserted at their depth", "cut end of the band: a 3 px and a 13 px blue edge light", "one 7 px bloom at 4 %, then scan grain scaled 1.45× on the band"],
    measured: { ground: [11, 12, 17], ground_sigma: 2.6, ground_hp_sigma: 3.44, ribbon_single_layer_ramp: "x=760 column: top glint [236,109,58], dark fold [168,73,53] at θ≈.5, saturated [254,71,24] at θ .8 to 1.3, pink [198,134,88] and blue [90,136,221] at the cut end", ribbon_double_layer: "x=230 column: [175 to 197,80,50] where the loop's back shows through the front, [115,65,48] in the darkest overlap", back_face: "[37,27,31] at x 600 to 660, the band seen from behind", mask_edge_px: 1.5, end_glow_sigma_px: 5, end_glow_reach_px: 14, arc_sigma_px: [3.5, 4.4], arc_core_yellow: [252, 206, 121], arc_skirt_yellow: [150, 109, 63], arc_core_green: [118, 154, 90], sphere_radius_px: 18, sphere_spacing_px: 78, sphere_axis_y: 341, sphere_shade: "L 47 at the left edge to 179 five px right of center, no specular", grid_pitch_foot_px: 39, grid_pitch_px_at_y620: 34, grid_row_spacing_px: "7 at y 585 to 12 at y 656, proportional to (y − 350)²", grid_horizon_y: 350, grid_line: [40, 39, 68], grid_floor: [12, 12, 30], grid_line_share: .237, kmeans8_shares: { black: .572, haze: .102, mid_orange: .098, hot_orange: .085, red_brown: .075, pink: .032, gray_green: .023, blue_white: .013 }, rejected: "a Lambert shade over the normal: the measured ramp has a dark fold at θ .5 between two bright zones, which no single light direction gives" },
    limits: ["Benchmark 95.4 % mean. The sphere-row histogram (86 %) and the whole-plate histogram (90 %) miss because the reference spheres are shaded by hand with a flatter yellow and a steeper green, and the reference's left loop carries a yellow glint from an arc behind it that the generated coil does not reproduce.", "The ribbon-face patch includes the band seen from behind; the reference's back face is [37,27,31] gray, the rebuild's is [47,27,22], so the dark ink color scores 91 %.", "The coil, helices and sphere colors are generated; whole-plate ink shares are matched by the coil's scale, not by position.", "The reference is a JPEG scan; its ringing around the arcs is not reproduced."],
    source: "Reference 10: 1980s airbrush illustration on black, 1000 × 675 px",
    study: { slug: "airbrush-ribbon", lede: "A translucent orange band coiled through black, light added as sprayed glow.",
      body: ["Airbrush work of this kind is built from masks and gradients. A frisket cuts the band's edge, which turns over in 1.5 px in the reference. The gun lays a gradient inside it: a pale glint at the top edge, a dark fold of [168,73,53] about 50 px below, then the saturated [254,71,24] face. Where the band's far side shows through its near side the tone drops to [115,65,48], the way two orange gels stack. The thin lines of light are a core of σ 1.3 px over a skirt of σ 4 px, and the floor grid, 39 px at the foot, leaks blue into the black for 14 px past the band's cut end.", "The rebuild puts one helix on one axis. The band is sliced into rows; each slice carries its depth and the angle of its surface, and an 18-stop ramp over that angle gives the color. Slices composite far to near as gels: Gel opacity sets how much the back reads through, Gel density how much a layer darkens the one behind it. The light helices share the axis and add with a depth test, so they pass behind and in front of the band in the right order. Grid pitch and Horizon place the floor. Bloom and Scan grain finish the sheet; the grain runs 1.45× stronger on the band, where the reference's high-pass σ is 5.2 against 3.4 on the black."],
      method: "measure the ramp · slice the band by rows · composite as gels · add light with depth · bloom",
      points: [{ u: .8, v: .25, d: "KEY", label: "Single-layer face: the ramp from the top glint through the dark fold to [254,71,24]", t: "pull", dir: [0, 1] }, { u: .3, v: .45, d: "KEY", label: "Far side read through the near side: the stacked layer drops toward [115,65,48]", t: "pull", dir: [1, 0] }, { u: .44, v: .1, d: "READ", label: "Light helix: a σ 1.3 px core over a σ 3.8 px skirt, added over black", t: "glow", dir: [1, 0] }, { u: .22, v: .065, d: "READ", label: "Frisket edge: the band turns over in 1.3 px, then the glint starts", t: "edge", dir: [0, 1] }, { u: .88, v: .64, d: "KEY", label: "Cut end: blue light at the edge, bleeding 14 px into the black below", t: "glow", dir: [0, 1] }, { u: .045, v: .51, d: "READ", label: "Sphere on the axis: 18 px radius, lit from the right, L 47 at the left edge", t: "pull", dir: [1, 0] }, { u: .15, v: .92, d: "KEY", label: "Floor grid, 39 px at the foot, rows closing as (y − horizon)²", t: "grain", dir: [0, -1] }, { u: .07, v: .18, d: "READ", label: "The black: σ 2.6 scan grain with a 30 px mottle, not a flat fill", t: "grain", dir: [0, 0] }, { u: .52, v: .55, d: "READ", label: "Helix passing behind the band: dimmed to 16 % and tinted by the gel", t: "pull", dir: [0, 1] }, { u: .66, v: .85, d: "READ", label: "Bloom: 4 % of a 7 px blur, the haze every light throws past its edge", t: "glow", dir: [0, -1] }]
    }
  });
})();
