/* ===== PLATE 16 · TWO-INK WOODS =====
   three plates: a mint plate of lobed foliage masses (shape fields at 1/3 resolution, grained like a riso
   screen), a flat pink plate (disc, robot, small blobs) with fine grain, and a black key plate drawn full-res:
   outlines pulled off the foliage field's edge band, hatching inside the masses, bark lines, gills, dots.
   Plates sit a few px out of register. One grain field screens every ink. */
(function () {
  const REF = { w: 1200, h: 1500 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c, N = W * H;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 7919 + 11), nA = vnoise(P.seed + 3), nB = vnoise(P.seed + 17), nC = vnoise(P.seed + 41);
    /* ---------- shape fields at reduced resolution ---------- */
    const f = 3, w0 = Math.ceil(W / f), h0 = Math.ceil(H / f), n0 = w0 * h0, FG = new Float32Array(n0), FD = new Float32Array(n0);
    /* foliage blobs: a canopy ring at the top, ground masses at the foot, bushes along the sides; each blob a lobed disc */
    const blobs = []; const cx = W * .5, cy = H * .52, Rx = W * .36, Ry = H * .37;
    const nb = Math.round(P.masses), sunR = 92 * u * P.disc, sunX = W * .7, sunY = H * .34, rb = { x: W * .5, y: H * .645, h: 380 * u * P.robot };
    const clear = (x, y, r) => Math.hypot(x - sunX, y - sunY) < sunR * 1.5 + r * .3 || (Math.abs(x - rb.x) < rb.h * .32 + r * .4 && y > rb.y - rb.h * .5 && y < rb.y + rb.h * .6);
    for (let i = 0; i < nb; i++) { const a = -1.4 + (i / nb) * 6.28 + rnd() * .25, ex = Math.cos(a), ey = Math.sin(a); const x = cx + ex * Rx * (.85 + rnd() * .3), y = cy + ey * Ry * (.85 + rnd() * .3), r = (110 + rnd() * 90) * u * P.size * (ey > .4 ? 1.2 : ey < -.5 ? 1.1 : .85); if (clear(x, y, r)) continue; blobs.push({ x, y, r, lobe: 4 + (rnd() * 5 | 0), ph: rnd() * 6.28, k: rnd() }); }
    for (let i = 0; i < 5; i++) { const x = cx + (rnd() - .5) * W * .7, y = H * (.74 + rnd() * .16), r = (120 + rnd() * 80) * u * P.size; if (clear(x, y, r)) continue; blobs.push({ x, y, r, lobe: 5 + (rnd() * 4 | 0), ph: rnd() * 6.28, k: rnd() }); }
    /* the tree: trunk from the lower left curving up to the canopy */
    const tx0 = W * .3, ty0 = H * .72, tx1 = W * .44, ty1 = H * .17, trunkW = 76 * u * P.trunk;
    const trunk = t => { const x = lerp(tx0, tx1, t) + Math.sin(t * 3.1) * 70 * u, y = lerp(ty0, ty1, t); return [x, y]; };
    for (let i = 0; i < 4; i++) { const [px, py] = trunk(1); blobs.push({ x: px + (i - 1.5) * 150 * u + (rnd() - .5) * 60 * u, y: py - 30 * u + (rnd() - .5) * 80 * u, r: (130 + rnd() * 70) * u * P.size, lobe: 5 + (rnd() * 4 | 0), ph: rnd() * 6.28, k: rnd() }); }
    /* mushroom caps as mint ellipses */
    const mush = []; const nm = Math.round(P.mushrooms); for (let i = 0; i < nm; i++) mush.push({ x: W * (.1 + rnd() * .22), y: H * (.48 + i * .06 + rnd() * .04), r: (60 + rnd() * 55) * u, tilt: (rnd() - .5) * .5 });
    /* field: lobed blobs + the trunk as a band */
    for (let yy = 0; yy < h0; yy++) for (let xx = 0; xx < w0; xx++) {
      const X = (xx + .5) * f, Y = (yy + .5) * f; let v = 0;
      for (const b of blobs) { const dx = X - b.x, dy = Y - b.y, d = Math.hypot(dx, dy); if (d > b.r * 1.5) continue; const an = Math.atan2(dy, dx), rr = b.r * (1 + .16 * Math.cos(an * b.lobe + b.ph) + .09 * Math.cos(an * (b.lobe * 2 + 1) + b.k * 9)) * (1 + (nA(X / (40 * u), Y / (40 * u)) - .5) * .3 * P.wobble); v += Math.max(0, 1 - d / rr) * 1.6; }
      let tv = 0; for (let k = 0; k <= 20; k++) { const [px, py] = trunk(k / 20), d = Math.hypot(X - px, Y - py) / (trunkW * (1.3 - .55 * k / 20)); tv = Math.max(tv, 1 - d); }
      let mv = 0; for (const m of mush) { const dx = (X - m.x) / m.r, dy = (Y - m.y) / (m.r * .5); const d = Math.hypot(dx, dy); if (d < 1.3) mv = Math.max(mv, (1 - d) * 1.8); const sx = (X - m.x) / (m.r * .22), sy = (Y - m.y - m.r * .5) / (m.r * .55); const ds = Math.hypot(sx, sy); if (ds < 1.3) mv = Math.max(mv, (1 - ds) * 1.6); }
      FG[yy * w0 + xx] = Math.max(v, tv * 1.4, mv) - .55;
    }
    const G = upsampleCR(FG, w0, h0, W, H);
    /* edge band for the outline: the field's zero crossing, width from the local slope */
    /* ---------- pink plate: a disc, a few blobs, the robot ---------- */
    const pc = mk(W, H), pg = pc.getContext("2d"); pg.fillStyle = "#fff";
    if (P.disc > 0) { pg.beginPath(); pg.arc(sunX, sunY, sunR, 0, 6.3); pg.fill(); }
    const pinkBlobs = []; for (let i = 0; i < 3; i++) { const b = blobs[(i * 5 + 2) % blobs.length]; pinkBlobs.push({ x: b.x + (rnd() - .5) * b.r, y: b.y - b.r * .6, r: (16 + rnd() * 14) * u }); }
    for (const b of pinkBlobs) { pg.beginPath(); for (let k = 0; k <= 24; k++) { const a = k / 24 * 6.283, rr = b.r * (1 + .25 * Math.cos(a * 5 + b.x)); k ? pg.lineTo(b.x + Math.cos(a) * rr, b.y + Math.sin(a) * rr) : pg.moveTo(b.x + Math.cos(a) * rr, b.y + Math.sin(a) * rr); } pg.closePath(); pg.fill(); }
    /* robot: Mindgut's little robot, pink body, drawn from primitives; key lines added on the key plate */
    /* Mindgut's robot: the shared construction, walking and looking up at the disc; pink plate for the body, paper for
       the visor and chest panel, its key on its own canvas so it can sit in front of every hatch line */
    const rkc = mk(W, H), rk = rkc.getContext("2d"), rmc = mk(W, H), rm = rmc.getContext("2d");
    const robotOpts = { x: rb.x, y: rb.y, h: rb.h, rot: .04, flip: 1, head: -.22, look: .9, detail: 1, arms: [{ a: -.45, b: -.3 }, { a: 1.9, b: .5, front: true }], legs: MG_POSE.walk.legs };
    if (P.robot > 0) { mgRobot(Object.assign({}, robotOpts, { plates: { body: { g: pg, style: "#fff" }, light: { g: pg, style: "#000" }, accent: { g: pg, style: "#fff" } }, key: { g: rk, style: "#000", w: P.key * u } }));
      mgRobot(Object.assign({}, robotOpts, { plates: { body: { g: rm, style: "#fff" }, light: { g: rm, style: "#fff" }, accent: { g: rm, style: "#fff" } }, key: { g: rm, style: "#fff", w: P.key * u } })); }
    const PKs = chan(pg, W, H, 0);
    /* ---------- key plate (black), full resolution, canvas strokes ---------- */
    const kc = mk(W, H), kg = kc.getContext("2d"); kg.strokeStyle = "#000"; kg.fillStyle = "#000"; kg.lineCap = "round"; kg.lineJoin = "round";
    const kw = P.key * u;
    /* hatching inside foliage: short curved strokes following a flow, denser toward each mass's lower left */
    kg.lineWidth = kw * .95;
    const hatchN = Math.round(P.hatch * 7000 * (W * H) / (1200 * 1500));
    for (let i = 0; i < hatchN; i++) { const x = rnd() * W, y = rnd() * H; const gi = (Math.min(H - 1, y | 0)) * W + (Math.min(W - 1, x | 0)); if (G[gi] < .06) continue; let onTrunk = false; for (let k = 0; k <= 10; k++) { const [px, py] = trunk(k / 10); if (Math.hypot(x - px, y - py) < trunkW * 1.1) { onTrunk = true; break; } } if (onTrunk) continue; const shade = sstep(.45, 1, nB(x / (140 * u), y / (140 * u)) * .75 + (y / H) * .45 + (G[gi] < .22 ? .2 : 0)); if (rnd() > shade) continue; const a = (nC(x / (90 * u), y / (90 * u)) - .5) * 1.6, L = (12 + rnd() * 26) * u, cv2 = (6 + rnd() * 12) * u * (rnd() < .5 ? 1 : -1); if (rnd() < .45) { const n = 2 + (rnd() * 4 | 0), sw = (7 + rnd() * 6) * u, sgn = rnd() < .5 ? 1 : -1; kg.beginPath(); for (let q = 0; q < n; q++) { const X0 = x + Math.cos(a) * (q - n / 2) * sw, Y0 = y + Math.sin(a) * (q - n / 2) * sw, X1 = X0 + Math.cos(a) * sw, Y1 = Y0 + Math.sin(a) * sw; if (!q) kg.moveTo(X0, Y0); kg.quadraticCurveTo((X0 + X1) / 2 - Math.sin(a) * sw * .9 * sgn, (Y0 + Y1) / 2 + Math.cos(a) * sw * .9 * sgn, X1, Y1); } kg.stroke(); } else { kg.beginPath(); kg.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); kg.quadraticCurveTo(x - Math.sin(a) * cv2, y + Math.cos(a) * cv2, x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); kg.stroke(); } }
    /* bark: dense wavy lines along the trunk */
    kg.lineWidth = kw * 1.35; const bl = Math.round(trunkW / (P.bark * u)); for (let j = 0; j < bl; j++) { const off = (j / (bl - 1) - .5) * 2 * .92; kg.beginPath(); let started = false; for (let k = 0; k <= 60; k++) { const t = k / 60, [px, py] = trunk(t), [qx, qy] = trunk(Math.min(1, t + .02)), dx = qx - px, dy = qy - py, dn = Math.hypot(dx, dy) || 1, nx = -dy / dn, ny = dx / dn, wv = trunkW * (1.3 - .55 * t) * .9, o = off * wv + (nA(t * 7 + j * .7, j) - .5) * 16 * u + Math.sin(t * 40 + j) * 3 * u; if (hashI(j, k >> 1, P.seed) < .28) { started = false; continue; } const X = px + nx * o, Y = py + ny * o; if (!started) { kg.moveTo(X, Y); started = true; } else kg.lineTo(X, Y); } kg.stroke(); }
    /* mushrooms: a cluster at the lower left, caps as arcs with gill hatching below */
    kg.lineWidth = kw;
    for (const m of mush) { kg.save(); kg.translate(m.x, m.y); kg.rotate(m.tilt); kg.beginPath(); kg.ellipse(0, 0, m.r, m.r * .42, 0, 3.1416, 0); kg.stroke(); kg.beginPath(); kg.moveTo(-m.r, 0); kg.quadraticCurveTo(0, m.r * .22, m.r, 0); kg.stroke(); kg.lineWidth = kw * .6; const ng = Math.round(m.r / (3.2 * u)); for (let k = 0; k < ng; k++) { const t = -1 + (k + .5) / ng * 2, X = t * m.r, y1 = m.r * .22 * (1 - t * t) * .9; kg.beginPath(); kg.moveTo(X, y1 * .15); kg.lineTo(X * .96, y1 + (4 + hashI(k, 1, P.seed) * 10) * u); kg.stroke(); } kg.lineWidth = kw; kg.beginPath(); kg.moveTo(-m.r * .18, m.r * .2); kg.lineTo(-m.r * .14, m.r * .95); kg.moveTo(m.r * .18, m.r * .2); kg.lineTo(m.r * .12, m.r * .95); kg.stroke(); kg.restore(); }
    /* flying dots near the disc: small rings with a dot */
    const nd = Math.round(P.dots); for (let i = 0; i < nd; i++) { const x = sunX + (rnd() - .5) * sunR * 4, y = sunY + (rnd() - .2) * sunR * 3.5, r = (5 + rnd() * 6) * u; if (Math.hypot(x - sunX, y - sunY) < sunR * 1.15) continue; kg.lineWidth = kw * .7; kg.beginPath(); kg.arc(x, y, r, 0, 6.3); kg.stroke(); kg.beginPath(); kg.arc(x, y, r * .35, 0, 6.3); kg.fill(); }
    /* the robot's key lines: outline, eyes, a mouth grille, hatching on its shadow side */
    if (P.robot > 0) { kg.save(); kg.globalCompositeOperation = "destination-out"; kg.drawImage(rmc, 0, 0); kg.restore(); kg.drawImage(rkc, 0, 0); }
    const K0 = gblur(chan(kg, W, H, 3), W, H, .9 * u);
    /* ---------- compose per pixel: ground, mint plate, pink plate, key, all through one grain ---------- */
    const mw = Math.ceil(W / 3), mh = Math.ceil(H / 3), m0 = new Float32Array(mw * mh); for (let yy = 0; yy < mh; yy++) for (let xx = 0; xx < mw; xx++) m0[yy * mw + xx] = fbm(nC, xx / (2.6 * u), yy / (2.6 * u), 2) - .5; const MID = upsampleCR(m0, mw, mh, W, H), gf = new Float32Array(N); for (let i = 0, yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++, i++) gf[i] = hashI(xx, yy, P.seed + 5) - .5; const GF = gblur(gf, W, H, .9 * u);
    const img = cv.getContext("2d").createImageData(W, H), d = img.data;
    const gr = C.green, pk = C.pink, bk = C.key, gd = C.ground, mg = P.misreg * u, gx = Math.round(mg), gy = Math.round(-mg * .5), px2 = Math.round(-mg * .6), py2 = Math.round(mg);
    const gs = P.grainG, ps = P.grainP, rough = P.rough;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, j = i * 4;
      /* one grain field: a 2 px hashed speckle, slightly smoothed by neighbors */
      const grain = GF[i] * 3.4, mid = MID[i];
      let r = gd[0], g = gd[1], b = gd[2];
      /* mint plate, shifted by the misregistration; its edge wobbles with the grain */
      const xg = clamp(x - gx, 0, W - 1), yg = clamp(y - gy, 0, H - 1), gv = G[yg * W + xg] + grain * .12 * rough, cg = sstep(-.03, .03, gv);
      if (cg > 0) { const t = 1 + (grain * .3 + mid * .12) * gs; r += (gr[0] * t - r) * cg; g += (gr[1] * t - g) * cg; b += (gr[2] * t - b) * cg; }
      /* pink plate */
      const xp = clamp(x - px2, 0, W - 1), yp = clamp(y - py2, 0, H - 1), pv = PKs[yp * W + xp]; if (pv > .02) { const t = 1 + (grain * .11 + mid * .06) * ps, a = clamp(pv + grain * .3 * rough, 0, 1); r += (pk[0] * t - r) * a; g += (pk[1] * t - g) * a; b += (pk[2] * t - b) * a; }
      /* key plate: outline from the field's edge band, plus the drawn strokes; crayon edge from the grain */
      const gv0 = G[i], band = Math.max(0, 1 - Math.abs(gv0) / (P.key * .022)), ko = clamp(K0[i] + band, 0, 1), kk = ko > .03 ? sstep(.3, .7, ko + (grain * .3 + mid * .25) * rough * Math.min(1, ko * 3)) : 0;
      if (kk > 0) { r += (bk[0] - r) * kk; g += (bk[1] - g) * kk; b += (bk[2] - b) * kk; }
      d[j] = clamp(r, 0, 255); d[j + 1] = clamp(g, 0, 255); d[j + 2] = clamp(b, 0, 255); d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p16", no: "16", title: "Two-Ink Woods", ref: REF, render,
    line: "A mint plate of lobed foliage grained like a riso screen, a flat pink plate, and a 4 px black key drawn over them 2 px out of register, with Mindgut's robot standing in the glade.",
    params: [
      { key: "masses", label: "Foliage masses", min: 3, max: 24, step: 1, def: 12, unit: "", group: "Glade", why: "Lobed blobs around the oval of the glade." },
      { key: "size", label: "Mass size", min: .4, max: 1.8, step: .01, def: 1, unit: "×", group: "Glade", why: "Radius of the foliage blobs, 70 to 160 px at 1." },
      { key: "wobble", label: "Lobe wobble", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Glade", why: "Noise on each blob's rim, the hand in the drawn edge." },
      { key: "trunk", label: "Trunk width", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Glade", why: "Width of the tree, 76 px at 1. 0 removes it." },
      { key: "mushrooms", label: "Mushrooms", min: 0, max: 8, step: 1, def: 4, unit: "", group: "Glade", why: "Caps in the cluster at the lower left, each with its gills." },
      { key: "disc", label: "Disc", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Glade", why: "Radius of the pink disc, 92 px at 1." },
      { key: "dots", label: "Flying dots", min: 0, max: 40, step: 1, def: 12, unit: "", group: "Glade", why: "Rings with a center dot drifting near the disc." },
      { key: "robot", label: "Robot", min: 0, max: 1.8, step: .01, def: 1, unit: "×", group: "Glade", why: "Height of Mindgut's robot, 250 px at 1. 0 removes it." },
      { key: "key", label: "Key weight", min: 1.5, max: 9, step: .1, def: 4, unit: "px", group: "Key", why: "Width of the black line. Measured 4 px, hatch strokes 3.6 px." },
      { key: "hatch", label: "Hatching", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Key", why: "Count of short curved strokes inside the foliage, denser where the shade field is dark." },
      { key: "bark", label: "Bark pitch", min: 3, max: 20, step: .1, def: 5, unit: "px", group: "Key", why: "Spacing of the wavy lines along the trunk." },
      { key: "grainG", label: "Mint grain", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Plates", why: "Speckle of the mint plate. Measured σ 14 on a 127, 197, 165 ink." },
      { key: "grainP", label: "Pink grain", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Plates", why: "Speckle of the pink plate. Measured σ 5." },
      { key: "rough", label: "Edge rough", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Plates", why: "How much the grain breaks the edges of every plate and the key." },
      { key: "misreg", label: "Misregister", min: 0, max: 10, step: .1, def: 2, unit: "px", group: "Plates", why: "Offset of the color plates from the key, as the drum feeds each pass." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 5, unit: "", group: "Glade", why: "Re-rolls the glade." }
    ],
    motion: [{ key: "misreg", amp: 1.5, period: 7, mode: "sine" }, { key: "wobble", amp: .4, period: 11, mode: "sine" }],
    live: { x: { key: "hatch", min: 0, max: 3 }, y: { key: "key", min: 1.5, max: 9 } },
    presets: [{ name: "Thicket", set: { masses: 22, size: .8, hatch: 2 } }, { name: "Open glade", set: { masses: 6, hatch: .4, mushrooms: 2 } }, { name: "Clean plates", set: { grainG: .2, grainP: .2, rough: .2, misreg: 0 } }, { name: "Off register", set: { misreg: 7, rough: 1.6 } }],
    palettes: [
      { id: "measured", name: "Mint and salmon", note: "measured", c: { ground: [235, 236, 222], green: [127, 197, 165], pink: [243, 164, 152], key: [19, 28, 22] }, sw: ["#ebecde", "#7fc5a5", "#f3a498", "#131c16"] },
      { id: "cool", name: "Teal and coral", c: { ground: [240, 244, 246], green: [70, 170, 180], pink: [250, 120, 100], key: [20, 24, 36] }, sw: ["#f0f4f6", "#46aab4", "#fa7864", "#141824"] },
      { id: "night", name: "Night riso", c: { ground: [28, 30, 44], green: [60, 150, 110], pink: [255, 110, 140], key: [230, 236, 240] }, sw: ["#1c1e2c", "#3c966e", "#ff6e8c", "#e6ecf0"] },
      { id: "blue", name: "Blue and orange", c: { ground: [244, 246, 250], green: [60, 110, 210], pink: [255, 150, 60], key: [18, 20, 30] }, sw: ["#f4f6fa", "#3c6ed2", "#ff963c", "#12141e"] },
      { id: "violet", name: "Violet and lime", c: { ground: [246, 244, 250], green: [150, 110, 220], pink: [190, 230, 80], key: [30, 20, 40] }, sw: ["#f6f4fa", "#966edc", "#bee650", "#1e1428"] },
      { id: "gray", name: "Graphite and red", c: { ground: [242, 242, 242], green: [150, 156, 160], pink: [235, 60, 60], key: [16, 16, 18] }, sw: ["#f2f2f2", "#969ca0", "#eb3c3c", "#101012"] }
    ],
    bench: { palette: "measured", params: {}, note: "The glade is generated; patches were placed with search.py on the default render and fixed by hand on the matching plate (a mint mass, the bark, the disc, the ground, the whole plate).", items: [
      { name: "mint plate", ref: [760, 140, 120, 120], out: [216, 288, 120, 120], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 8, inks: [[127, 197, 165]], inkNames: ["mint"] },
      { name: "bark key", ref: [390, 370, 130, 140], out: [168, 744, 130, 140], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 10, inks: [[19, 28, 22], [127, 197, 165], [235, 236, 222]], inkNames: ["key", "mint", "ground"] },
      { name: "pink disc", ref: [740, 480, 120, 120], out: [792, 456, 120, 120], m: ["hist", "mean", "std", "spec", "ink"], lags: 6, inks: [[243, 164, 152]], inkNames: ["pink"] },
      { name: "hatched mass", ref: [400, 1050, 160, 130], out: [504, 1128, 160, 130], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 10, inks: [[19, 28, 22], [127, 197, 165], [235, 236, 222]], inkNames: ["key", "mint", "ground"] },
      { name: "ground", ref: [20, 20, 200, 120], out: [20, 20, 200, 120], m: ["hist", "mean", "std"] },
      { name: "whole plate", ref: [0, 0, 1200, 1500], out: [0, 0, 1200, 1500], m: ["hist", "ink", "share"], inks: [[235, 236, 222], [127, 197, 165], [19, 28, 22], [243, 164, 152]], inkNames: ["ground", "mint", "key", "pink"] }
    ] },
    passes: ["shape fields at 1/3 resolution: lobed blobs around the glade's oval, four ground masses, the trunk as a tapered band; Catmull-Rom up to full size", "pink plate on a full-res canvas: disc, three blobs, the robot's body", "key plate on a full-res canvas: hatch strokes inside the foliage where the shade field is dark, bark lines along the trunk, mushroom caps and gills, rings with dots, the robot's outline, eyes and grille", "per pixel: ground; the mint plate shifted 2 px with its edge wobbled by the grain and its tone speckled; the pink plate shifted the other way; the key as the field's zero band plus the drawn strokes, its edge broken by the same grain"],
    measured: { ground: [235, 236, 222], ground_sigma: 0, mint: [127, 197, 165], mint_sigma_rgb: [13.8, 16.2, 14.7], mint_hp_sigma: 12, mint_autocorr: "0.70, 0.33, 0.19 at lags 1 to 3", mint_speck_median_area_px: 2, mint_speck_share: .128, pink: [243, 164, 152], pink_sigma_rgb: [4.1, 6.4, 5.7], pink_hp_sigma: 4.2, key: [19, 28, 22], key_share: .127, key_halfwidth_px: { median: 2, p90: 2.8 }, ground_share: .512, mint_share: .25, pink_share: .062, kmeans6: "ground .513, light mint .136, key .116, mint .115, pink .064, dark mint .056", misregistration_px: "about 2, read by eye on the foliage edges", rejected: "a smooth gradient inside the foliage: the mint plate is flat with speckle, its only shading is the hatching" },
    limits: ["Benchmark 88.7 % mean. The bark patch scores lowest (histogram 51 %, autocorrelation 63 %): the reference trunk at that spot is 64 % key with the pink figure's arm crossing it, the rebuild's trunk is 43 % key with the mint streaking through; the bark lines are drawn as a broken scribble, not traced.", "The hatched-mass patch misses on the ground ink color (47 %) because the reference patch contains pink where the rebuild has mint; whole-plate shares are matched by the count and size of the masses, not by position.", "The reference's human figure is not redrawn; Mindgut's robot stands in its place, drawn with the same 4 px key.", "The ground is the reference's own 235, 236, 222; alternates use cool or neutral grounds."],
    source: "Reference 16: two-color print with a black key, 1200 × 1500 px",
    study: { slug: "two-ink-woods", lede: "Mint, pink and a black key, each plate a little out of register.",
      body: ["A two-color print with a key: the mint plate carries the foliage as flat lobed masses, the pink plate a disc and a figure, and the black key carries every line. The mint is not flat up close: it is a speckle of σ 14 around 127, 197, 165, with specks 2 px across covering 13 % of the ink, the texture of a riso screen or a crayon rubbing. The pink is quieter, σ 5. The key is a 4 px line with a broken crayon edge, and its hatching, 3.6 px strokes, does all the shading. The plates sit about 2 px out of register.", "The rebuild draws the glade from shape fields at a third of the size: lobed blobs around an oval, ground masses, a tapered trunk. The field's zero band becomes the outline, so Key weight sets both line and band. Hatching counts strokes inside the masses, Bark pitch spaces the trunk lines. Mint grain and Pink grain scale the speckle, Edge rough lets that same speckle break every edge, and Misregister slides the color plates against the key. The figure is Mindgut's robot, pink plate and key lines only."],
      method: "measure the three inks and the mint speckle · shape fields at 1/3 · key from the field edge plus strokes · one grain screens every plate · misregister",
      points: [{ u: .68, v: .13, d: "KEY", label: "Mint plate up close: σ 14 speckle, 2 px specks, no gradient", t: "grain", dir: [0, 0] }, { u: .38, v: .3, d: "KEY", label: "Bark: wavy lines on a 9 px pitch along the trunk", t: "pull", dir: [0, -1] }, { u: .68, v: .33, d: "READ", label: "Pink disc: flat with σ 5 grain", t: "grain", dir: [0, 0] }, { u: .3, v: .78, d: "KEY", label: "Hatching: 3.6 px curved strokes, denser where the shade field is dark", t: "pull", dir: [1, 0] }, { u: .2, v: .55, d: "READ", label: "Mushroom cap: arc, rim line, gill hatch below at 3.2 px", t: "pull", dir: [0, 1] }, { u: .55, v: .6, d: "KEY", label: "Mindgut's robot: pink plate under a 4 px key, hatched on its shadow side", t: "pull", dir: [0, 0] }, { u: .8, v: .4, d: "READ", label: "Flying dots: rings with a center dot", t: "edge", dir: [0, 0] }, { u: .18, v: .2, d: "READ", label: "Outline: the field's zero band, broken by the grain", t: "edge", dir: [1, 0] }, { u: .85, v: .6, d: "READ", label: "Misregister: mint 2 px right of the key, pink 2 px down", t: "edge", dir: [1, 0] }, { u: .1, v: .05, d: "READ", label: "Ground: flat 235, 236, 222, no grain", t: "grain", dir: [0, 0] }]
    }
  });
})();
