/* ===== PLATE 21 · SPRAY SEASCAPE =====
   flat inks laid edge to edge (sky blue, sea blue, white wedge, yellow land, white foam), every transition
   sprayed: crisp round dots about 3 px across whose chance of landing falls off over about 80 px from the
   edge of a frisket. Green shades the land from below, pink and blue meet in the cloud band, black ink
   keys the silhouettes and sprays the shadowed undersides. A small seated robot rides the near hill. */
(function () {
  const REF = { w: 894, h: 1166 };
  /* ink ids */
  const WH = 0, BL = 1, GR = 2, YE = 3, BK = 4, PK = 5;
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c, N = W * H;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 4409 + 13), nA = vnoise(P.seed + 31), nB = vnoise(P.seed + 83), nC = vnoise(P.seed + 131);
    const INK = new Uint8Array(N), OWN = new Uint8Array(N);       /* top ink per pixel; which frisket owns it */
    const INKS = [C.white, C.blue, C.green, C.yellow, C.black, C.pink], CR = new Float32Array(N), CG = new Float32Array(N), CB = new Float32Array(N);
    /* lay ink k over pixel i at coverage c (edge pixels of dots and keys are partly covered) */
    const put = (i, k, c) => { if (c >= 1) { const q = INKS[k]; CR[i] = q[0]; CG[i] = q[1]; CB[i] = q[2]; INK[i] = k; return; } if (c <= 0) return; const q = INKS[k]; CR[i] += (q[0] - CR[i]) * c; CG[i] += (q[1] - CG[i]) * c; CB[i] += (q[2] - CB[i]) * c; if (c > .5) INK[i] = k; };
    const yh = Math.round(H * P.horizon), fall = P.falloff * u, rd = P.dot * u * .5, pitch = Math.max(1.2 * u, P.dot * u * .82), side = P.light, ink = P.ink;
    /* ---- the spray: a jittered lattice of candidate dots; each lands with the density at its center and
       prints a crisp disc, only on pixels its frisket allows ---- */
    let sid = 1;
    const spray = (x0, y0, x1, y1, dens, ink, own, rMul, ex, cap) => {
      const sd = P.seed * 97 + (sid++) * 7919, dE = Math.max(.5, (P.edge ?? 1) * u), r = rd * (rMul || 1), e = ex || 1, p = pitch * (rMul || 1) * .92, dmax = cap || 1;
      x0 = Math.max(0, x0 | 0); y0 = Math.max(0, y0 | 0); x1 = Math.min(W, Math.ceil(x1)); y1 = Math.min(H, Math.ceil(y1));
      for (let gy = Math.floor(y0 / p); gy * p < y1; gy++) for (let gx = Math.floor(x0 / p); gx * p < x1; gx++) {
        const cx = (gx + .5 + (hashI(gx, gy, sd) - .5) * .95) * p, cy = (gy + .5 + (hashI(gx, gy, sd + 1) - .5) * .95) * p;
        const d = Math.min(dmax, dens(cx, cy)); if (d <= 0 || hashI(gx, gy, sd + 2) >= d) continue;
        if (d > .96) { for (let y = Math.max(0, Math.floor(gy * p)); y < Math.min(H, Math.ceil((gy + 1) * p)); y++) for (let x = Math.max(0, Math.floor(gx * p)); x < Math.min(W, Math.ceil((gx + 1) * p)); x++) { const i = y * W + x; if (own < 0 || OWN[i] === own) put(i, ink, 1); } }
        const rr = r * (.8 + .4 * hashI(gx, gy, sd + 3)), rx = (rr + dE) * e;
        for (let y = Math.max(0, Math.floor(cy - rr - dE)); y <= Math.min(H - 1, Math.floor(cy + rr + dE)); y++) for (let x = Math.max(0, Math.floor(cx - rx)); x <= Math.min(W - 1, Math.floor(cx + rx)); x++) {
          const dx = (x + .5 - cx) / e, dy = y + .5 - cy, c = (rr - Math.sqrt(dx * dx + dy * dy)) / dE + .5; if (c <= 0) continue; const i = y * W + x; if (own < 0 || OWN[i] === own) put(i, ink, c);
        }
      }
    };
    /* ---- the key: a round nib stamped along a polyline straight into the ink plate, so later masses cover it ---- */
    const key = (pts, w) => {
      if (ink <= 0 || pts.length < 2) return; const r = Math.max(.5, w * ink * .5);
      let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (const q of pts) { bx0 = Math.min(bx0, q[0]); by0 = Math.min(by0, q[1]); bx1 = Math.max(bx1, q[0]); by1 = Math.max(by1, q[1]); }
      bx0 = Math.max(0, Math.floor(bx0 - r - 1)); by0 = Math.max(0, Math.floor(by0 - r - 1)); bx1 = Math.min(W - 1, Math.ceil(bx1 + r + 1)); by1 = Math.min(H - 1, Math.ceil(by1 + r + 1)); if (bx1 < bx0 || by1 < by0) return;
      const bw = bx1 - bx0 + 1, cov = new Float32Array(bw * (by1 - by0 + 1));
      for (let k = 0; k + 1 < pts.length; k++) { const [ax, ay] = pts[k], [qx, qy] = pts[k + 1], L = Math.hypot(qx - ax, qy - ay), n = Math.max(1, Math.ceil(L / .5));
        for (let j = 0; j <= n; j++) { const cx = ax + (qx - ax) * j / n, cy = ay + (qy - ay) * j / n; for (let y = Math.max(by0, Math.floor(cy - r - .5)); y <= Math.min(by1, cy + r + .5); y++) for (let x = Math.max(bx0, Math.floor(cx - r - .5)); x <= Math.min(bx1, cx + r + .5); x++) { const c = r + .5 - Math.hypot(x + .5 - cx, y + .5 - cy), o = (y - by0) * bw + x - bx0; if (c > cov[o]) cov[o] = c > 1 ? 1 : c; } } }
      for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) { const c = cov[(y - by0) * bw + x - bx0]; if (c > 0) put(y * W + x, BK, c); }
    };
    /* ---- 1. sky and sea; the white wedge under a rising edge ---- */
    const wedge = x => H * (P.horizon - P.cloud) + Math.pow(x / W, 1.15) * (H * P.cloud - 34 * u) + (nA(x / (420 * u), 3.1) - .5) * 18 * u;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (y < yh) { put(i, y > wedge(x) ? WH : BL, 1); OWN[i] = 1; } else { put(i, BL, 1); OWN[i] = 2; } }
    /* blue sprayed down into the white, pink sprayed along the edge from above, a sparse white speckle in the blue */
    spray(0, 0, W, yh, (x, y) => { const t = y - wedge(x); return t > 0 ? sstep(fall * .8, -4 * u, t) * (.9 + .2 * nB(x / (40 * u), y / (40 * u))) : 0; }, BL, 1);
    spray(0, 0, W, yh, (x, y) => { const t = y - wedge(x), g = .6 + .5 * nC(x / (60 * u), y / (45 * u)); return P.pink * g * sstep(-fall * 1.05, -fall * .05, t) * sstep(fall * 1.1, fall * .2, t) * .7; }, PK, 1, 1.35);
    spray(0, 0, W, yh, (x, y) => { const t = y - wedge(x); return t < 0 ? .06 * P.speck * sstep(-fall * 2.8, -fall * .6, t) : 0; }, WH, 1, .7);
    /* ---- 2. islands on the horizon: yellow domes, green sprayed up from the water side, keyed in black ---- */
    const isl = [], nIs = Math.round(P.islands), slots = [[.86, .2, 26], [.47, .15, 30], [.66, .045, 11], [.1, .09, 15], [.29, .05, 10]];
    for (let k = 0; k < nIs; k++) { const sl = slots[k % slots.length]; isl.push({ x: W * (sl[0] + (rnd() - .5) * .05), w: W * sl[1] * (.85 + .3 * rnd()), h: sl[2] * u * (.85 + .3 * rnd()), sk: rnd() - .5 }); }
    const islTop = new Float32Array(W).fill(1e9), islId = new Int8Array(W).fill(-1);
    isl.forEach((I, k) => { for (let x = Math.max(0, I.x - I.w | 0); x < Math.min(W, I.x + I.w); x++) { const t = (x - I.x) / I.w, sh = Math.pow(Math.max(0, 1 - t * t), .55) * (1 + I.sk * t * .6), yt = yh - I.h * sh * (.92 + .16 * nA(x / (30 * u), k * 4.1)); if (yt < islTop[x] && sh > .02) { islTop[x] = yt; islId[x] = k; } } });
    for (let x = 0; x < W; x++) if (islTop[x] < yh) for (let y = Math.max(0, Math.floor(islTop[x])); y < yh + 2 * u; y++) { const i = y * W + x; put(i, YE, 1); OWN[i] = 3; }
    spray(0, yh - 40 * u, W, yh + 3 * u, (x, y) => { const xi = clamp(x | 0, 0, W - 1), k = islId[xi]; if (k < 0) return 0; const I = isl[k], d = y - islTop[xi], hh = yh - islTop[xi]; return sstep(.15, .85, d / Math.max(1, hh) + .45 * (x - I.x) / I.w * (I.sk > 0 ? -1 : 1) + .25 * (nB(x / (14 * u), y / (14 * u)) - .5)); }, GR, 3);
    { let run = []; for (let x = 0; x <= W; x++) { if (x < W && islTop[x] < yh - .5) run.push([x, islTop[x]]); else if (run.length) { key(run, 1.5 * u); run = []; } } }
    key([[0, yh + .6 * u], [W, yh + .6 * u]], 2.2 * u);
    /* ---- 3. the sea: rows of white foam dots, thicker and further apart toward the shore; a white shore band ---- */
    const yShore = x => H * .81 + Math.sin(x / W * 2.4 + 1.1) * 14 * u + (nA(x / (90 * u), 8.8) - .5) * 16 * u;
    const nRows = Math.round(P.waves), rows = [];
    for (let k = 0; k < nRows; k++) { const t = (k + .6) / nRows; rows.push({ y: yh + (H * .78 - yh) * Math.pow(t, 1.45), w: (1.2 + 4.5 * t) * u, a: (5 + 9 * t) * u, f: (1.5 + 2 * rnd()) / W, ph: rnd() * 6.3, g: rnd() * 50 }); }
    spray(0, yh + 2 * u, W, H * .9, (x, y) => {
      let f = 0; for (let k = 0; k < rows.length; k++) { const R = rows[k], yr = R.y + Math.sin(x * R.f * 6.28 + R.ph) * R.a, dy = (y - yr) / R.w; if (dy < -3 || dy > 5) continue; f += Math.exp(-dy * dy * .5) * sstep(.38, .62, nB(x / (110 * u), R.g + y / (30 * u))); }
      const ys = yShore(x), sh = sstep(ys - fall * .9, ys, y); return Math.min(1, (f * .42 + .012) * P.foam + sh);
    }, WH, 2, .8, 1.7);
    for (let x = 0; x < W; x++) for (let y = Math.max(yh + 2, Math.floor(yShore(x))); y < H; y++) { const i = y * W + x; if (OWN[i] === 2) put(i, WH, 1); }
    /* ---- 4. posts in the shallows, receding toward the horizon: green over black, foam at the foot ---- */
    const nPo = Math.round(P.posts);
    for (let k = 0; k < nPo; k++) {
      const t = nPo > 1 ? k / (nPo - 1) : 0, px = W * (.93 - .32 * Math.pow(t, .85)) + (rnd() - .5) * 8 * u, py = lerp(H * .755, yh + 12 * u, Math.pow(t, .62)), sc2 = lerp(1, .2, Math.pow(t, .62));
      const pw = 13 * u * sc2, ph = 58 * u * sc2, x0 = Math.round(px - pw / 2), x1 = Math.round(px + pw / 2), yT = Math.round(py - ph);
      for (let y = yT; y < py; y++) for (let x = x0; x < x1; x++) { if (x < 0 || x >= W || y < 0 || y >= H) continue; const i = y * W + x, tt = (y - yT) / ph; put(i, tt < .5 + .14 * (hashI(x, y >> 1, k) - .5) ? GR : BK, 1); OWN[i] = 4; }
      key([[x0, py], [x0, yT + pw * .3], [px, yT], [x1 - 1, yT + pw * .3], [x1 - 1, py]], 1.3 * u * Math.max(.6, sc2));
      spray(px - pw * 2.6, py - 2 * u, px + pw * 2.6, py + 7 * u * sc2 + 3 * u, (x, y) => .6 * sstep(pw * 2.5, 0, Math.abs(x - px)), WH, 2, .8, 1.6);
    }
    /* ---- 5. land: rounded masses back to front. Each is a frisket: yellow inside, green sprayed up from below
       over the falloff, black sprayed along its shadowed underside, its silhouette keyed in black ---- */
    const lit = P.lit;
    const masses = [
      { cx: -.06, cy: .95, rx: .9, ryT: .41, ryB: .12, yl: 16, sh: .6 },
      { cx: .09, cy: .53, rx: .19, ryT: .07, ryB: .045, yl: 22, sh: 1 },
      { cx: .25, cy: .7, rx: .2, ryT: .055, ryB: .03, yl: 10, sh: 1 },
      { cx: .56, cy: .79, rx: .16, ryT: .06, ryB: .04, yl: 16, sh: 1 },
      { cx: .3, cy: .91, rx: .3, ryT: .11, ryB: .06, yl: 10, sh: 1 },
      { cx: .84, cy: .96, rx: .2, ryT: .07, ryB: .05, yl: 10, sh: 1 }
    ].slice(0, Math.max(1, Math.round(P.hills)));
    const yTop = [];
    masses.forEach((M, k) => {
      const cx = W * (M.cx + (rnd() - .5) * .04 * P.scatter), cy = H * M.cy, rx = W * M.rx * P.hillSize, ryT = H * M.ryT * P.hillSize, ryB = H * M.ryB * P.hillSize;
      M.id = 10 + k;
      const T = new Float32Array(W).fill(1e9), B = new Float32Array(W).fill(-1e9);
      for (let x = Math.max(0, Math.floor(cx - rx)); x < Math.min(W, cx + rx); x++) { const t = (x - cx) / rx, q = Math.sqrt(Math.max(0, 1 - t * t)), wob = 1 + .05 * (nA(x / (120 * u), k * 7.3) - .5) * 2; T[x] = cy - ryT * Math.pow(q, .75) * wob; B[x] = cy + ryB * Math.pow(q, .6); }
      yTop.push(T);
      for (let x = 0; x < W; x++) if (T[x] < 1e8) for (let y = Math.max(0, Math.floor(T[x])); y < Math.min(H, B[x]); y++) { const i = y * W + x; put(i, YE, 1); OWN[i] = M.id; }
      const fl = fall, yl = M.yl * u * lit;
      /* green from below: depth under the top contour past the lit band, bent by a slow noise into rounded lobes */
      spray(cx - rx, cy - ryT, cx + rx, cy + ryB, (x, y) => { const xi = clamp(x | 0, 0, W - 1), d = y - T[xi], tx = (x - cx) / rx; return sstep(yl, yl + fl, d + (nB(x / (95 * u), y / (70 * u) + k * 3) - .5) * .65 * fl - side * tx * .12 * fl); }, GR, M.id);
      /* black on the shadowed underside: solid at the edge, thinning inward over about 30 px */
      spray(cx - rx, cy - ryT, cx + rx, cy + ryB, (x, y) => { const tx = (x - cx) / rx, ty = y < cy ? (y - cy) / ryT : (y - cy) / ryB, e = Math.hypot(tx, ty), dE = (1 - e) * Math.min(rx, y < cy ? ryT : ryB); return P.shadow * M.sh * sstep(fall * .5, 0, dE + (nC(x / (30 * u), y / (30 * u) + k) - .5) * 18 * u) * sstep(-.35, .4, ty * .6 - side * tx * .8); }, BK, M.id, .9, 1, .8);
      /* key only where the mass stands against sea or sky */
      let pts = []; const flush = () => { if (pts.length > 1) key(pts, 2 * u); pts = []; };
      for (let x = 0; x < W; x++) { if (T[x] < 1e8 && T[x] < B[x]) { const ya = Math.floor(T[x] - 2 * u), oa = ya >= 0 ? OWN[ya * W + x] : 1; if (oa < 10) { pts.push([x, T[x]]); continue; } } flush(); } flush();
    });
    /* ---- 6. the beach: white foam in front, sprayed with blue and green; pebbles in it ---- */
    const yBeach = x => H * (.9 - P.beach) + Math.sin(x / W * 3.1 + .4) * 12 * u + (nA(x / (70 * u), 21) - .5) * 14 * u;
    /* the land's shadowed foot where it meets the foam: black sprayed up from the beach line, in crescents */
    spray(0, H * (.8 - P.beach), W, H, (x, y) => { const t = yBeach(x) - y, i = clamp(y | 0, 0, H - 1) * W + clamp(x | 0, 0, W - 1); return OWN[i] >= 10 && OWN[i] < 30 ? P.shadow * sstep(fall * .45, 0, t) * sstep(.42, .62, nC(x / (85 * u), 40)) : 0; }, BK, -1, .9, 1, .8);
    for (let x = 0; x < W; x++) for (let y = Math.max(0, Math.floor(yBeach(x))); y < H; y++) { const i = y * W + x; put(i, WH, 1); OWN[i] = 5; }
    spray(0, H * (.84 - P.beach), W, H, (x, y) => { const t = y - yBeach(x); return t > 0 ? .1 * sstep(fall * 1.2, 0, t) + .03 : 0; }, BL, 5, 1.3);
    spray(0, H * (.84 - P.beach), W, H, (x, y) => { const t = y - yBeach(x); return t > 0 ? .07 * sstep(fall * .8, 0, t) : 0; }, GR, 5);
    const nPe = Math.round(P.pebbles), peb = [];
    for (let k = 0, tries = 0; k < nPe && tries < nPe * 60; tries++) {
      const rx = (40 + 50 * rnd()) * u * P.pebSize, ry = rx * (.44 + .18 * rnd()), x = rnd() * W, y = lerp(yBeach(x) + ry * .9, H + ry * .4, Math.pow(rnd(), .75));
      if (peb.some(q => Math.hypot((q.x - x) / (q.rx + rx + 2 * u), (q.y - y) / (q.ry + ry + 2 * u)) < 1)) continue;
      peb.push({ x, y, rx, ry, gx: x + (rnd() - .5) * rx * .9, gy: y - ry * (.1 + .4 * rnd()), gr: rx * (.62 + .35 * rnd()), id: 30 + k, ph: rnd() * 6.3 }); k++;
    }
    peb.forEach(Q => {
      const R = a => 1 + .08 * Math.sin(a * 2 + Q.ph) + .05 * Math.sin(a * 3 - Q.ph);
      for (let y = Math.max(0, Math.floor(Q.y - Q.ry * 1.2)); y < Math.min(H, Q.y + Q.ry * 1.2); y++) for (let x = Math.max(0, Math.floor(Q.x - Q.rx * 1.2)); x < Math.min(W, Q.x + Q.rx * 1.2); x++) {
        const tx = (x + .5 - Q.x) / Q.rx, ty = (y + .5 - Q.y) / Q.ry; if (Math.hypot(tx, ty) > R(Math.atan2(ty, tx))) continue; const i = y * W + x; put(i, BL, 1); OWN[i] = Q.id;
      }
      spray(Q.x - Q.rx * 1.2, Q.y - Q.ry * 1.2, Q.x + Q.rx * 1.2, Q.y + Q.ry * 1.2, (x, y) => { const d = Math.hypot((x - Q.gx) / Q.gr, (y - Q.gy) / (Q.gr * .62)); return sstep(1.25, .7, d + (nB(x / (9 * u), y / (9 * u) + Q.ph) - .5) * .4) * 1.15; }, GR, Q.id);
      spray(Q.x - Q.rx * 1.2, Q.y - Q.ry * 1.2, Q.x + Q.rx * 1.2, Q.y + Q.ry * 1.2, (x, y) => { const d = Math.hypot((x - Q.gx) / Q.gr, (y - Q.gy) / (Q.gr * .62)), below = (y - Q.gy) / (Q.gr * .62); return P.shadow * .6 * sstep(1.05, .78, d) * sstep(.05, .6, below - side * (x - Q.gx) / Q.gr * .4); }, BK, Q.id, .9, 1, .8);
      const pts = []; for (let k = 0; k <= 64; k++) { const a = k / 64 * 6.2832, rr = R(a); pts.push([Q.x + Math.cos(a) * Q.rx * rr, Q.y + Math.sin(a) * Q.ry * rr]); } key(pts, 1.9 * u);
    });
    /* ---- 7. the robot, seated on the near hill, drawn into the plates with a black key ---- */
    if (P.robot > 0) {
      const rxp = clamp(W * P.robotX, 4, W - 4) | 0, hR = 84 * u * P.robot; let ry0 = H * .6, own0 = 10;
      for (let y = yh; y < H; y++) { const o = OWN[y * W + rxp]; if (o >= 10 && o < 30) { ry0 = y; own0 = o; break; } }
      const M = masses.find(m => m.id === own0) || masses[0];
      const RB = { body: mk(W, H), light: mk(W, H), accent: mk(W, H), shadow: mk(W, H), key: mk(W, H) }, g = k => RB[k].getContext("2d");
      /* seated on the slope, legs out along the ground, one hand propped behind, one on the thigh;
         the body tilts with the ground under it */
      const S = hR / 9.6, topAt = x => { x = clamp(x | 0, 0, W - 1); for (let y = yh; y < H; y++) { const o = OWN[y * W + x]; if (o >= 10 && o < 30) return y; } return ry0; };
      const rot = clamp(Math.atan2(topAt(rxp + 2.2 * S) - topAt(rxp - 1.2 * S), 3.4 * S), -.4, .4), hipY = ry0 - .32 * S;
      mgRobot({ x: rxp, y: hipY, h: hR, rot, flip: 1, stance: .35, head: -.12 - rot * .5, look: .9,
        arms: [{ a: -.75, b: .25 }, { a: .9, b: .55, front: true }], legs: [{ a: 1.45, b: .02 }, { a: 1.62, b: -.22, front: true }],
        plates: { body: { g: g("body"), style: "#fff" }, light: { g: g("light"), style: "#fff" }, accent: { g: g("accent"), style: "#fff" }, shadow: { g: g("shadow"), style: "#fff" } },
        key: { g: g("key"), style: "#fff", w: 2 * u * Math.max(.5, ink) }, shadow: [8 * u, 3 * u], detail: .9 });
      const mark = (cnv, inkId, cond) => { const d = cnv.getContext("2d").getImageData(0, 0, W, H).data; for (let i = 0; i < N; i++) if (d[i * 4 + 3] > 0 && (!cond || cond(i))) put(i, inkId, d[i * 4 + 3] / 255); };
      mark(RB.shadow, GR, i => OWN[i] === M.id && INK[i] !== BK);
      mark(RB.body, WH); mark(RB.light, YE); mark(RB.accent, PK); if (ink > 0) mark(RB.key, BK);
    }
    /* ---- 8. print: each ink carries its own measured grain, a pixel noise with a 2 px share (lag-1 correlation
       0.3 to 0.4) skewed light, plus a mottle of about 2 levels at 40 to 60 px; the blues and greens carry
       sparse light specks that cluster ---- */
    const img = cv.getContext("2d").createImageData(W, H), dd = img.data, gA = P.grain;
    const SL = [1.2, 4.2, 6, 1.4, 6, 3.4], SR = [.4, 5.2, 7, 1.1, 10, 2.1], SK = [.3, 1.9, 3, .67, 2.6, 1.76], MU = SL.map((v, k) => .399 * (SR[k] - v) + .5 * SK[k]), MO = [0, 1, .9, .15, .4, .3];
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      const k = INK[i], z = probit(hashI(x, y, P.seed + 7)) * .63 + probit(hashI(x >> 1, y >> 1, P.seed + 9)) * .78;
      let g = ((z < 0 ? SL[k] * z : SR[k] * z + SK[k] * z * z) - MU[k] + MO[k] * ((nC(x / (30 * u), y / (30 * u)) - .5) * 9 + (nC(x / (90 * u) + 40, y / (90 * u)) - .5) * 9)) * gA;
      if ((k === BL || k === GR) && hashI(x, y, P.seed + 11) < .02 * gA * (.25 + 1.5 * nA(x / (36 * u), y / (36 * u)))) g += 16 + 14 * hashI(x, y, 5);
      const j = i * 4; dd[j] = clamp(CR[i] + g, 0, 255); dd[j + 1] = clamp(CG[i] + g, 0, 255); dd[j + 2] = clamp(CB[i] + g, 0, 255); dd[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p21", no: "21", title: "Spray Seascape", ref: REF, render,
    line: "Flat inks edge to edge, every transition an airbrush spray of crisp 3 px dots whose landing chance falls off over about 80 px from a frisket edge, with black keying the silhouettes and the shadowed undersides.",
    params: [
      { key: "dot", label: "Spray dot", min: 1.2, max: 7, step: .05, def: 3.2, unit: "px", group: "Spray", why: "Diameter of a spray dot. The reference's isolated green dots measure 3.2 px." },
      { key: "falloff", label: "Falloff", min: 15, max: 220, step: 1, def: 80, unit: "px", group: "Spray", why: "Distance over which a spray thins from solid to nothing past a frisket edge." },
      { key: "grain", label: "Paint grain", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Spray", why: "Per-pixel grain of the flat inks and the light speckle in the blues, 1.7 % of pixels at 1." },
      { key: "ink", label: "Black key", min: 0, max: 2, step: .01, def: 0.75, unit: "×", group: "Spray", why: "Width of the black keylines: hill tops, waterlines, pebble rims, posts and the robot." },
      { key: "shadow", label: "Shadow spray", min: 0, max: 1.6, step: .01, def: 0.8, unit: "×", group: "Spray", why: "Strength of the black spray on the shadowed undersides of land and pebbles." },
      { key: "light", label: "Side light", min: -1.5, max: 1.5, step: .01, def: 1, unit: "", group: "Spray", why: "Which side of each mass stays yellow and which side takes the black." },
      { key: "lit", label: "Lit band", min: 0, max: 3, step: .01, def: 0.6, unit: "×", group: "Spray", why: "Depth of yellow left bare under each hill top before the green spray starts." },
      { key: "horizon", label: "Horizon", min: .3, max: .62, step: .005, def: .462, unit: "of height", group: "Scene", why: "Height of the sea line; the reference's keyline sits at 0.462." },
      { key: "cloud", label: "Cloud wedge", min: .05, max: .4, step: .005, def: .195, unit: "of height", group: "Scene", why: "How far the white sky wedge climbs above the horizon at its high end." },
      { key: "pink", label: "Pink band", min: 0, max: 1.6, step: .01, def: 0.8, unit: "×", group: "Scene", why: "Density of the pink spray along the edge of the white wedge." },
      { key: "speck", label: "Sky speckle", min: 0, max: 4, step: .01, def: 1, unit: "×", group: "Scene", why: "Sparse white spray dots in the blue above the cloud band." },
      { key: "islands", label: "Islands", min: 0, max: 5, step: 1, def: 3, unit: "", group: "Scene", why: "Low islands on the horizon." },
      { key: "waves", label: "Foam rows", min: 0, max: 16, step: 1, def: 6, unit: "", group: "Scene", why: "Rows of white foam dots across the sea, spaced wider toward the shore." },
      { key: "foam", label: "Foam", min: 0, max: 2.5, step: .01, def: 0.6, unit: "×", group: "Scene", why: "Density of the white dots on the foam rows." },
      { key: "posts", label: "Posts", min: 0, max: 14, step: 1, def: 7, unit: "", group: "Scene", why: "Posts in the shallows, receding toward the horizon; green over black, foam at the foot." },
      { key: "hills", label: "Land masses", min: 1, max: 6, step: 1, def: 6, unit: "", group: "Land", why: "Rounded masses stacked back to front on the near shore." },
      { key: "hillSize", label: "Land size", min: .6, max: 1.3, step: .01, def: 1, unit: "×", group: "Land", why: "Scale of every land mass." },
      { key: "beach", label: "Beach depth", min: 0, max: .2, step: .005, def: .025, unit: "of height", group: "Land", why: "Depth of the white foam beach along the foot of the sheet." },
      { key: "pebbles", label: "Pebbles", min: 0, max: 40, step: 1, def: 32, unit: "", group: "Land", why: "Black-rimmed pebbles in the beach foam, blue with a green patch." },
      { key: "pebSize", label: "Pebble size", min: .5, max: 1.8, step: .01, def: 1, unit: "×", group: "Land", why: "Scale of the pebbles." },
      { key: "robot", label: "Robot", min: 0, max: 2, step: .01, def: 1.2, unit: "×", group: "Land", why: "Height of the seated robot, 84 px at 1, 101 px at the default 1.2; 0 removes it." },
      { key: "robotX", label: "Robot position", min: .04, max: .92, step: .005, def: .4, unit: "of width", group: "Land", why: "Where across the sheet the robot sits; it lands on the first land below the horizon at that point and tilts with the slope." },
      { key: "scatter", label: "Scatter", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Land", why: "Random shift in the land masses' positions." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 4, unit: "", group: "Land", why: "Re-rolls islands, rows, pebbles and every spray dot." }
    ],
    motion: [{ key: "light", amp: .7, period: 10, mode: "sine" }, { key: "foam", amp: .4, period: 5, mode: "sine" }],
    live: { x: { key: "light", min: -1.5, max: 1.5 }, y: { key: "falloff", min: 30, max: 180 } },
    presets: [
      { name: "Fine mist", set: { dot: 1.8, falloff: 130 } },
      { name: "Coarse spatter", set: { dot: 5.5, falloff: 50, grain: 1.6 } },
      { name: "Open sea", set: { hills: 2, pebbles: 8, waves: 12, foam: 1.6, islands: 5 } },
      { name: "No key", set: { ink: 0, shadow: .3 } },
      { name: "Low sun", set: { light: -1.2, lit: 1.6, pink: 1.5 } }
    ],
    palettes: [
      { id: "measured", name: "Shore blue", note: "measured", c: { white: [249, 249, 247], blue: [85, 148, 207], green: [18, 128, 93], yellow: [243, 233, 124], black: [13, 14, 12], pink: [238, 185, 164] }, sw: ["#fcf8f1", "#5594cf", "#12805d", "#f3e97c", "#eeb9a4"] },
      { id: "dusk", name: "Dusk", c: { white: [244, 246, 250], blue: [64, 72, 150], green: [118, 58, 120], yellow: [252, 196, 120], black: [18, 14, 30], pink: [250, 150, 130] }, sw: ["#f4f6fa", "#404896", "#763a78", "#fcc478", "#fa9682"] },
      { id: "teal", name: "Teal and lime", c: { white: [246, 250, 250], blue: [30, 150, 160], green: [16, 88, 78], yellow: [214, 240, 110], black: [10, 22, 22], pink: [250, 190, 150] }, sw: ["#f6fafa", "#1e96a0", "#10584e", "#d6f06e", "#fabe96"] },
      { id: "night", name: "Night", c: { white: [214, 224, 240], blue: [22, 32, 70], green: [28, 86, 70], yellow: [120, 150, 120], black: [0, 0, 0], pink: [90, 70, 120] }, sw: ["#d6e0f0", "#162046", "#1c5646", "#789678", "#5a4678"] },
      { id: "riso", name: "Riso red and blue", c: { white: [248, 248, 248], blue: [232, 78, 66], green: [34, 64, 150], yellow: [252, 222, 64], black: [20, 20, 26], pink: [250, 172, 204] }, sw: ["#f8f8f8", "#e84e42", "#224096", "#fcde40", "#faaccc"] },
      { id: "graphite", name: "Graphite", c: { white: [247, 247, 247], blue: [128, 130, 138], green: [56, 58, 62], yellow: [214, 214, 218], black: [10, 10, 12], pink: [176, 176, 182] }, sw: ["#f7f7f7", "#80828a", "#383a3e", "#d6d6da", "#b0b0b6"] }
    ],
    bench: { palette: "measured", params: {}, note: "The shoreline is generated, so the cloud edge, hill spray, shadow edge and pebble beach rects were re-picked after the rebuild with search.py's window scan, each restricted to the matching zone of the render (sky band, land, beach). The flat sky and the whole plate compare in place. Inks are the reference's colors as the browser decodes them through its embedded ICC profile, which is how the bench reads it.", items: [
      { name: "flat sky", ref: [300, 100, 192, 64], out: [300, 100, 192, 64], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 4, inks: [[252, 248, 241], [85, 148, 207]], inkNames: ["white", "blue"] },
      { name: "cloud edge", ref: [520, 330, 128, 96], out: [300, 366, 128, 96], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 4, inks: [[252, 248, 241], [85, 148, 207], [238, 185, 164]], inkNames: ["white", "blue", "pink"] },
      { name: "hill spray", ref: [600, 660, 128, 96], out: [588, 884, 128, 96], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 4, inks: [[85, 148, 207], [18, 128, 93], [243, 233, 124], [13, 14, 12]], inkNames: ["blue", "green", "yellow", "black"] },
      { name: "shadow edge", ref: [510, 860, 96, 128], out: [180, 800, 96, 128], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[252, 248, 241], [18, 128, 93], [243, 233, 124], [13, 14, 12]], inkNames: ["white", "green", "yellow", "black"] },
      { name: "pebble beach", ref: [60, 1020, 240, 96], out: [612, 1024, 240, 96], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[252, 248, 241], [85, 148, 207], [18, 128, 93], [13, 14, 12]], inkNames: ["white", "blue", "green", "black"] },
      { name: "whole plate", ref: [0, 0, 894, 1166], out: [0, 0, 894, 1166], m: ["hist", "mean", "ink", "share"], inks: [[252, 248, 241], [85, 148, 207], [18, 128, 93], [243, 233, 124], [13, 14, 12], [238, 185, 164]], inkNames: ["white", "blue", "green", "yellow", "black", "pink"] }
    ] },
    passes: [
      "flats: sky blue over sea blue at the horizon (0.462 of the height), a white wedge rising under the cloud band",
      "sky spray: blue falling into the white over the falloff, a pink band along the wedge edge, sparse white dots up in the blue",
      "islands: yellow domes on the horizon, green sprayed up from the waterline, a black key; keys run at the black key slider (0.75) times 1.5 px for islands, 2 px for land, 2.2 px for the horizon",
      "sea: rows of white foam dots (stretched 1.7:1) widening and spacing out toward the shore, a white shore band, posts in the shallows, green over black with foam at the foot",
      "land: six rounded masses back to front. Each is a frisket: yellow inside, green sprayed up from below over the falloff and bent by a slow noise into lobes, black sprayed along the shadowed underside at most 0.8 dense, a key only where it stands against sea or sky",
      "beach: black sprayed up at the land's foot, white foam with blue and green spray, 32 black-rimmed blue pebbles with a green patch and black stipple under it",
      "robot: mgRobot seated on the near hill, tilted to the slope, drawn into the white, yellow and pink plates with a black key and a green cast shadow",
      "print: every dot and key is a coverage-weighted disc (1 px edge); each ink then takes its measured grain: a skewed pixel noise with a 2 px share, a 30 to 90 px mottle on blue and green, sparse light specks that cluster"
    ],
    measured: {
      inks_browser_p50: { white: [252, 248, 241], blue: [85, 148, 207], green: [18, 128, 93], yellow: [243, 233, 124], black: [13, 14, 12], pink: [238, 185, 164], method: "median inside 5 × 5 eroded ink regions, reference decoded in the bench page; the file's raw values (blue [100, 146, 202], green [59, 126, 95]) differ through its ICC profile" },
      ink_shares: { blue: .496, green: .209, white: .155, yellow: .054, pink: .055, black: .031, method: "nearest of six inks over every pixel" },
      spray_dot_diameter_px: { green_isolated: 3.19, white_foam: 3.19, black_shadow: 3.66, blue_in_wedge: 3.99, pink_cloud: 4.51, method: "components after a 2 × 2 opening, area 3 px and up, diameter from area" },
      dot_edge_px: { value: [1, 2], method: "cross-sections of isolated green dots on yellow: 225, 188, 79, 111, 86, 127, 234" },
      green_falloff: { share_by_20px_step: [.012, .147, .393, .504, .53, .572], length_px: 80 },
      grain_L_offsets_p1_p10_p90_p99: { blue: [-12, -7.3, 11, 25.6], green: [-13.9, -9.5, 15, 31.4], yellow: [-4.3, -1.8, 2.5, 6.2], white: [-5.1, -1.5, 0, 1.5], pink: [-8.1, -4.3, 5.6, 14.5] },
      sky_grain: { ac_lag: { 1: .38, 2: .03, 3: .13, 8: .09 }, sigma_L: 7.5, speck_share: .046, method: "flat sky 600 × 200 px; specks are pixels 15 above the median" },
      horizon_y: { value: .462, method: "keyline row at x 200 and 700" }
    },
    limits: [
      "Bench mean about 0.96, under 98 %. The lowest metrics are the cloud edge and shadow edge tone histograms (0.87): the reference's dots carry soft 1 to 2 px rims, so a quarter of its pixels sit 21 or more levels from any ink, and the render's 1 px dot edges leave fewer in-between values. A wider dot edge was tried (1.4 and 1.8 px) and scored the same or lower, and it softens the dots the brief asks to keep crisp.",
      "The flat sky spectrum scores 0.93: the reference's mottle has a specific energy at 30 to 60 px that two value noises approximate but do not match.",
      "The pebble beach black ink scores 0.91: the reference's black stipple there is mixed with green at the dot rims, so its mean black reads greener than the render's.",
      "The shoreline is generated, so searched windows compare spray material at different places, not the same rocks."
    ],
    source: "Reference 21: airbrush seascape illustration, 894 × 1166 px PNG.",
    study: {
      slug: "spray-seascape", lede: "Six flat inks laid edge to edge, every transition sprayed in crisp dots about 3 px across that thin out over 80 px from a frisket edge.",
      body: ["The reference is an airbrush seascape in six inks: sky blue, white, green, yellow, black and pink. No edge in it is drawn with a gradient. Where green shades a yellow hill, where pink meets the sky, where foam sits on the sea, the paint was sprayed through a frisket: round dots of one size, 3.2 px across on the green, whose number falls from solid to nothing over about 80 px (57 % cover to 1 % in four 20 px steps). Black does two jobs. It keys the silhouettes in lines about 2 px wide, and it sprays the shadowed undersides of the hills and pebbles. Each flat ink carries its own grain: the blue sky varies 7.5 levels with sparse light specks, the yellow only 2.", "The rebuild lays the flats and friskets back to front: sky and wedge, islands, sea, six land masses, the beach and its pebbles. Each frisket then takes its sprays. A jittered lattice of candidate dots lands where a density field says, and every dot prints only inside its own frisket, so spray never crosses a keyline. Green rises from under each hill top, black hugs the undersides, white foam lies in rows across the sea. A small seated Mindgut robot is drawn into the same plates with a black key. Dot, falloff and grain are the airbrush. Side light, lit band and shadow spray place the paint on the land. The scene sliders rebuild the shore."],
      method: "Flats and friskets back to front · jittered-lattice spray, one crisp dot per hit, clipped to its frisket · black key and shadow spray · per-ink measured grain",
      points: [
        { u: .4, v: .31, d: "KEY", label: "Cloud band: pink dots over blue, about half and half, thinning over 80 px into the white wedge below.", t: "grain", dir: [0, -1] },
        { u: .385, v: .591, d: "KEY", label: "Hill top: bare yellow under the keyline, then green dots 3.2 px across thickening downhill.", t: "tone", dir: [-1, -1] },
        { u: .12, v: .705, d: "KEY", label: "Shadow edge: black spray at most 0.8 dense along the underside of a lobe, 77 % black here.", t: "ink", dir: [-1, 1] },
        { u: .18, v: .141, d: "READ", label: "Flat sky: blue grain of 7.5 levels with about 6 % sparse white spray dots.", t: "paper", dir: [0, -1] },
        { u: .2, v: .39, d: "READ", label: "White wedge: bare paper under the cloud band, the only unsprayed white in the sky.", t: "paper", dir: [-1, 0] },
        { u: .45, v: .445, d: "READ", label: "Island on the horizon: yellow dome, green sprayed up from the waterline, a 1.1 px key.", t: "tone", dir: [0, -1] },
        { u: .867, v: .555, d: "READ", label: "Foam row: white dots stretched 1.7 to 1 across the sea, 30 % cover on the row.", t: "grain", dir: [1, 0] },
        { u: .859, v: .635, d: "READ", label: "Post in the shallows: green over black under a thin key, white foam at its foot.", t: "ink", dir: [1, 1] },
        { u: .4, v: .545, d: "READ", label: "The Mindgut robot, seated on the hill top, white, yellow and pink plates with a black key.", t: "ink", dir: [0, -1] },
        { u: .5, v: .95, d: "READ", label: "Pebble beach: black-rimmed blue pebbles in white foam, green patches with black stipple under them.", t: "edge", dir: [0, 1] }
      ]
    }
  });
})();
