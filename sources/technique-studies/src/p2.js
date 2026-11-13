/* ===== PLATE 02 · STIPPLE GOUACHE =====
   flat paint shapes -> edges dissolved by dabbed dots in the neighboring color -> one thread lattice
   (straight warp, wandering weft, one thread on top at each crossing) that shades every paint, starves
   the dry-brush streaks and breaks through as primer specks on its knots. */
(function () {
  const REF = { w: 1000, h: 1254 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 6151 + 3), nA = vnoise(P.seed + 11), nB = vnoise(P.seed + 29), C = pal.c;
    const S = mk(W, H), g = S.getContext("2d"), T = mk(W, H), t = T.getContext("2d"), yg = H * (1 - P.ground), prim = C.primer;
    const skyAt = y => { const k = y / H; return [C.sky[0] + 26 * k * k, C.sky[1] + 14 * k * k, C.sky[2] + 6 * k * k]; };
    /* sun */
    const sunR = 74 * u * P.sun; if (P.sun > 0) { g.fillStyle = css(C.sun); g.beginPath(); g.arc(W * (.62 + rnd() * .16), H * (.09 + rnd() * .06), sunR, 0, 6.3); g.fill(); }
    /* canopies: flat base, lobed top */
    const N = Math.round(P.canopies), cans = [];
    for (let i = 0; i < N; i++) { const big = i === 0, w = (big ? 420 : 210 + rnd() * 150) * u, x = big ? W * .14 + rnd() * W * .1 : rnd() * (W - w * .7) - w * .15, y = big ? H * .31 : H * (.3 + .26 * rnd() + .04 * i); cans.push({ x, y, w, h: w * (.34 + rnd() * .1), lobes: Math.max(1, Math.round(P.lobes + (rnd() - .5) * 2)) }); }
    cans.sort((a, b) => a.y - b.y);
    /* dry-brush trunks into the mask layer */
    if (P.streaks > 0) cans.forEach(c => { if (rnd() > .25 + .5 * P.streaks) return; const x = c.x + c.w * (.3 + rnd() * .4), wd = (18 + rnd() * 16) * u; t.fillStyle = `rgba(255,255,255,${.5 + .5 * Math.min(1, P.streaks)})`; t.beginPath(); t.moveTo(x - wd, c.y); for (let y = c.y; y < H; y += 12 * u) t.lineTo(x - wd * (.5 + .3 * nA(y / (70 * u), x)), y); for (let y = H; y > c.y; y -= 12 * u) t.lineTo(x + wd * (.5 + .3 * nA(y / (70 * u), x + 9)), y); t.closePath(); t.fill(); });
    /* ground */
    g.fillStyle = css(C.ground); g.beginPath(); g.moveTo(0, H); g.lineTo(0, yg); for (let x = 0; x <= W; x += 20 * u) g.lineTo(x, yg + (nA(x / (260 * u), 2.2) - .5) * 22 * u); g.lineTo(W, H); g.closePath(); g.fill();
    const dab = (x, y, r, col, hi) => { g.fillStyle = css(col); g.beginPath(); g.ellipse(x, y, r * (.86 + rnd() * .3), r * (.8 + rnd() * .25), rnd() * 3.1, 0, 6.3); g.fill(); g.fillStyle = css(col.map(v => v * .78)); g.beginPath(); g.arc(x + r * .22, y + r * .26, r * .5, 0, 6.3); g.fill(); const hc = hi ? col.map((v, k) => v + (hi[k] - v) * .6) : col.map(v => Math.min(255, v * 1.16 + 14)); g.fillStyle = css(hc); g.beginPath(); g.arc(x - r * .2, y - r * .24, r * (hi ? .5 : .42), 0, 6.3); g.fill(); if (hi) { g.fillStyle = css(hc.map((v, k) => v + (hi[k] - v) * .5)); g.beginPath(); g.arc(x - r * .26, y - r * .3, r * .26, 0, 6.3); g.fill(); } };
    for (let i = 0, n = Math.round(P.groundDots * (P.gn ?? 260) * P.ground / .25); i < n; i++) { const x = rnd() * W, y = yg + Math.pow(rnd(), 1.7) * (H - yg); dab(x, y, (4.2 + rnd() * 2.6) * u * P.dot * (P.gd ?? 1.2), C.sky.map((v, k) => v + (C.pale[k] - v) * (P.dabMix ?? .15)), C.pale); }
    /* branch: one winding stroke tying canopies together, shaded by dark dabs on its underside */
    if (P.branch > 0 && N > 1) { const pts = [[W * (.42 + rnd() * .1), yg - 30 * u]]; const pick = cans.slice().sort(() => rnd() - .5).slice(0, Math.min(N, 3)).sort((a, b) => b.y - a.y); pick.forEach(c => pts.push([c.x + c.w * (.3 + rnd() * .4), c.y + 4 * u]));
      const path = (off) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1] + off); for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], sgn = i % 2 ? 1 : -1; g.bezierCurveTo(a[0] + sgn * 190 * u * P.branch, a[1] - 40 * u + off, b[0] - sgn * 150 * u * P.branch, b[1] + 90 * u + off, b[0], b[1] + off); } };
      g.lineCap = "round"; g.strokeStyle = css(C.ink); g.lineWidth = 30 * u; path(0); g.stroke(); g.strokeStyle = css(C.ground.map(v => v * .98)); g.lineWidth = 22 * u; path(-3 * u); g.stroke(); }
    /* canopies with their stipple fringe */
    cans.forEach(c => {
      g.fillStyle = css(C.pale); g.beginPath(); const rr = c.h * .42; g.moveTo(c.x + rr, c.y); g.arcTo(c.x, c.y, c.x, c.y - rr, rr); g.arcTo(c.x, c.y - c.h * .56, c.x + rr, c.y - c.h * .56, rr); g.lineTo(c.x + c.w - rr, c.y - c.h * .56); g.arcTo(c.x + c.w, c.y - c.h * .56, c.x + c.w, c.y - rr, rr); g.arcTo(c.x + c.w, c.y, c.x + c.w - rr, c.y, rr); g.closePath(); g.fill();
      for (let l = 0; l < c.lobes; l++) { const f = c.lobes === 1 ? .5 : .2 + .6 * l / (c.lobes - 1), R = c.w * (.2 + .12 * Math.sin(Math.PI * f) + rnd() * .03); g.beginPath(); g.arc(c.x + c.w * f, c.y - c.h * .5 - R * .25, R, 0, 6.3); g.fill(); }
      const depth = c.h * .62 * P.fringe, n = Math.round(c.w / u * 1.2745 * P.density), col = skyAt(c.y);
      for (let i = 0; i < n; i++) { const x = c.x - 6 * u + rnd() * (c.w + 12 * u), d = -Math.log(1 - rnd() * .97) * depth * .3 - 5 * u; dab(x, c.y - d, (4.37 + rnd() * 3.04) * u * P.dot, col); }
    });
    /* ---- pixel pass: sky, trunks, shapes, all through one weave ---- */
    const sd = g.getImageData(0, 0, W, H).data, td = t.getImageData(0, 0, W, H).data, img = cv.getContext("2d").createImageData(W, H), d = img.data;
    const px = P.pitch * u, py = P.pitch * 1.1 * u, K = 2 * Math.PI;
    for (let y = 0; y < H; y++) { const sk = skyAt(y); for (let x = 0; x < W; x++) {
      const j = (y * W + x) * 4, wx = x + (nB(y / (90 * u), 1) - .5) * (P.warpW ?? 2.5) * u, wy = y + (nB(x / (90 * u), 7) - .5) * (P.weftW ?? 6) * u;
      /* thread lattice: straight warp threads down the sheet, wandering weft threads across it, each thread with its own
         brightness; at every crossing one thread lies on top and its rounded profile sets the height */
      /* each thread sits a little off its grid line: a per-thread phase jitter of up to ±0.3 pitch breaks the lag-8 regularity of the over/under alternation */
      const c0 = Math.floor(wx / px), r0 = Math.floor(wy / py), wxj = wx - (hashI(c0, 9, P.seed + 303) - .5) * (P.jit ?? .15) * px, wyj = wy - (hashI(9, r0, P.seed + 304) - .5) * (P.jit ?? .15) * py;
      const ci = Math.floor(wxj / px), fx = wxj / px - ci, rj = Math.floor(wyj / py), fy = wyj / py - rj, tv = P.threadVar ?? .15;
      const bw = 1 + tv * (hashI(ci, 0, P.seed + 301) - .5) + .2 * tv * (nA(ci * 3.1, y / (40 * u)) - .5), bf = (P.weftK ?? .85) * (1 + tv * (hashI(0, rj, P.seed + 302) - .5) + .2 * tv * (nA(x / (40 * u), rj * 3.7 + 90) - .5));
      const pw = Math.pow(Math.sin(Math.PI * fx), P.threadPow ?? .9), pf = Math.pow(Math.sin(Math.PI * fy), P.threadPow ?? .9);
      /* knot brightness carries an exponential tail: most knots sit near the base, a few stand 2 to 3 times brighter */
      const ktop = Math.max(0, ((ci + rj) & 1 ? pw : pf) - .7) / .3, ktail = ktop > 0 ? ktop * (P.tailAmp ?? .04) * -Math.log(1 - .98 * hashI(ci, rj, P.seed + 305)) : 0;
      const hl = ((ci + rj) & 1 ? pw * bw * (.7 + .3 * pf) : pf * bf * (.7 + .3 * pw)) * (1 + ktail); let h = hl * (P.reg ?? .45) + (1 - (P.reg ?? .45)) * nA(x / ((P.ns ?? 1.6) * u), y / ((P.ns ?? 1.6) * u));
      const load = nB(x / (160 * u), y / (160 * u));
      const ld = (P.ld ?? .4) * (load - .5 + (nB(x / (22 * u), y / (22 * u)) - .5) * .7) + (P.md ?? .975) * (nA(x / ((P.ms ?? 4) * u) + 50, y / ((P.ms ?? 4) * u)) - .5); let r = sk[0] + ld * 22, gg = sk[1] + ld * 18, b = sk[2] + ld * 14;
      const ta = td[j + 3] / 255; if (ta > 0) { const a = ta * sstep(.42, .7, h + (nA(x / (9 * u), y / (60 * u)) - .5) * .5) * .8; r += (C.pale[0] - r) * a; gg += (C.pale[1] - gg) * a; b += (C.pale[2] - b) * a; }
      const sa = sd[j + 3] / 255; if (sa > 0) { r += (sd[j] - r) * sa; gg += (sd[j + 1] - gg) * sa; b += (sd[j + 2] - b) * sa; }
      /* the shapes are laid on thicker than the sky wash, so the weave shades them less and fewer knots break through */
      const L = (.299 * r + .587 * gg + .114 * b) / 255, thick = sa > 0 ? (P.thick ?? .45) : 1, sh = 1 + P.weave * thick * (Math.max(h, P.hfloor ?? .2) - .5) * ((P.wl ?? .0654) + (P.wd ?? 1.05) * (1 - L)); r *= sh; gg *= sh; b *= sh;
      /* primer specks sit on the knots of the weave: the top of the top thread, where the paint is thinnest. Each knot has its
         own strength, more of them where the paint load is thin and on dark paint */
      { const kt = Math.max(0, hl - (P.knot ?? .78)) / (1.1 - (P.knot ?? .78)); if (kt > 0) { const thin = Math.pow(clamp((nB(x / (70 * u) + 30, y / (70 * u)) - .25) / .6, 0, 1), (P.sk ?? 1.5)), ks = hashI(ci, rj, P.seed + 201), a = P.skips * (P.sa ?? 2.5) * thick * kt * kt * Math.pow(ks, P.sp ?? 3) * (.3 + 1.2 * (1 - L)) * (.25 + 1.5 * thin); if (a > .01) { const aa = Math.min(1, a); r += (prim[0] - r) * aa; gg += (prim[1] - gg) * aa; b += (prim[2] - b) * aa; } } }
      const n = (hashI(x, y, P.seed + 203) - .5) * (P.nz ?? 22.5); d[j] = clamp(r + n, 0, 255); d[j + 1] = clamp(gg + n, 0, 255); d[j + 2] = clamp(b + n, 0, 255); d[j + 3] = 255; } }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p2", no: "02", title: "Stipple Gouache", ref: REF, render,
    line: "Flat paint whose edges are dissolved by dabbed dots, all of it sitting on one canvas weave that shades the paint and shows through as specks.",
    params: [
      { key: "density", label: "Dab density", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Stipple", why: "Dabs per unit of edge." },
      { key: "dot", label: "Dab size", min: .4, max: 2.4, step: .01, def: 1, unit: "×", group: "Stipple", why: "Radius of each dab." },
      { key: "fringe", label: "Fringe depth", min: .1, max: 2, step: .01, def: 1, unit: "×", group: "Stipple", why: "How far the dabs climb into the shape." },
      { key: "groundDots", label: "Ground dabs", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Stipple", why: "Scattered dabs across the ground band." },
      { key: "pitch", label: "Weave pitch", min: 2.5, max: 14, step: .05, def: 4, unit: "px", group: "Canvas", why: "Thread spacing. Fine linen to coarse burlap." },
      { key: "weave", label: "Weave depth", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Canvas", why: "How strongly the threads shade the paint." },
      { key: "skips", label: "Primer specks", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Canvas", why: "Paint skipping the weave peaks. More on dark paint." },
      { key: "streaks", label: "Dry-brush streaks", min: 0, max: 1.5, step: .01, def: 1, unit: "×", group: "Canvas", why: "Pale vertical strokes that only catch the thread tops." },
      { key: "canopies", label: "Canopies", min: 1, max: 12, step: 1, def: 6, unit: "", group: "Picture", why: "Number of lobed shapes." },
      { key: "lobes", label: "Lobes", min: 1, max: 6, step: 1, def: 3, unit: "", group: "Picture", why: "Bumps along each top edge." },
      { key: "ground", label: "Ground band", min: .05, max: .5, step: .005, def: .27, unit: "of height", group: "Picture", why: "Height of the ground color." },
      { key: "branch", label: "Branch", min: 0, max: 1.6, step: .01, def: 1, unit: "×", group: "Picture", why: "Swing of the outlined stroke that ties the shapes together. 0 removes it." },
      { key: "sun", label: "Disc", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Picture", why: "Size of the flat disc." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 4, unit: "", group: "Picture", why: "Re-rolls the composition." }
    ],
    bench: { palette: "measured", params: {}, note: "The picture is generated, so the pale-paint and ground render rects were placed with search.py on the same material as the reference patches: flat pale paint with a few sky dabs in it, and ground paint with its scattered dabs.", items: [
      { name: "open paint", ref: [60, 60, 128, 128], out: [60, 60, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 10, inks: [[22, 144, 161]], inkNames: ["sky"] },
      { name: "pale paint", ref: [250, 270, 200, 56], out: [240, 672, 200, 56], m: ["hist", "mean", "std", "ink"], inks: [[242, 240, 175]], inkNames: ["pale"] },
      { name: "stipple fringe", ref: [150, 325, 380, 70], out: [340, 750, 380, 70], m: ["hist", "mean", "std", "ink", "share"], inks: [[22, 144, 161], [242, 240, 175]], inkNames: ["sky", "pale"] },
      { name: "ground", ref: [10, 960, 130, 280], out: [32, 928, 130, 280], m: ["hist", "mean", "std", "ink"], inks: [[10, 157, 109], [30, 130, 180]], inkNames: ["ground", "dab"] }
    ] },
    palettes: [
      { id: "measured", name: "Lagoon", note: "measured", c: { sky: [19, 142, 160], pale: [246, 244, 178], ground: [7, 157, 109], sun: [250, 233, 101], ink: [26, 24, 22], primer: [200, 232, 228] }, sw: ["#0e8ca0", "#f6f4b2", "#08a06c", "#fae965"] },
      { id: "plum", name: "Plum dusk", c: { sky: [92, 54, 128], pale: [255, 198, 214], ground: [226, 92, 60], sun: [255, 226, 120], ink: [28, 18, 34], primer: [226, 214, 240] }, sw: ["#5c3680", "#ffc6d6", "#e25c3c", "#ffe278"] },
      { id: "poppy", name: "Poppy", c: { sky: [232, 70, 48], pale: [255, 255, 255], ground: [28, 60, 150], sun: [255, 208, 60], ink: [20, 20, 36], primer: [255, 226, 214] }, sw: ["#e84630", "#ffffff", "#1c3c96", "#ffd03c"] },
      { id: "mint", name: "Mint ink", c: { sky: [24, 30, 44], pale: [150, 240, 204], ground: [40, 92, 220], sun: [255, 120, 150], ink: [8, 10, 16], primer: [120, 130, 150] }, sw: ["#181e2c", "#96f0cc", "#285cdc", "#ff7896"] },
      { id: "mono", name: "Graphite", c: { sky: [112, 116, 122], pale: [246, 247, 248], ground: [52, 54, 60], sun: [246, 247, 248], ink: [16, 16, 18], primer: [220, 222, 226] }, sw: ["#70747a", "#f6f7f8", "#34363c", "#101012"] }
    ],
    presets: [{ name: "Burlap", set: { pitch: 9, weave: 2, skips: 2.4 } }, { name: "Orchard", set: { canopies: 11, lobes: 4, dot: .7, density: 1.8, ground: .16 } }, { name: "Bare paint", set: { density: 0, groundDots: 0, streaks: 0, branch: 0 } }],
    motion: [{ key: "weave", amp: .25, period: 6, mode: "sine" }, { key: "skips", amp: .4, period: 9, mode: "drift" }],
    live: { x: { key: "density", min: 0, max: 2.5 }, y: { key: "weave", min: 0, max: 2.5 } },
    source: "Reference 2: gouache on canvas, 1000 × 1254 px JPEG",
    passes: ["flat paint: sky wash with a 26-level warm drift toward the foot, disc, ground, lobed shapes", "dry-brush streaks into a mask (they only catch thread tops)", "dabs: three-tone discs lit from the upper left, in the neighboring color, dense at the edge and thinning inward; ground dabs in the sky color with a pale center", "thread lattice: straight warp threads on a 4 px pitch, weft threads on 4.4 px that wander by up to 6 px, each thread set off its grid line by up to ±0.075 pitch and carrying its own brightness (±7 %); the top thread at each crossing sets the height, and its knots carry an exponential brightness tail (scale 0.04) so a few stand 2 to 3 times brighter; 45 % lattice, 55 % 1.6 px tooth", "paint load: two scales of luminance drift, 160 px and 22 px", "weave shading: valleys floored at 0.2 so the dark side is shallow; shapes are laid on 0.45 as thick as the sky wash", "primer specks on the knots of the weave: strength per knot (cubed), more on dark paint and where the load is thin"],
    measured: { weave_pitch_px: { warp: 4.0, weft: 4.4, method: "column-profile autocorrelation ±0.8 at lag 4 in the sky patch; row-profile peaks at lags 4 to 5 and 13 to 14" }, column_profile: { peaks: [112, 116], troughs: [99, 106], method: "local maxima of the column means, 60..188 × 60..188" }, sky: { mean: [22, 144, 161], sigma_L: 16.1, hist_share_above_144: .031, method: "sky patch pixels" }, ground: { mean: [10, 158, 111], dab_share: .086, dab_mean: [52, 153, 144], dab_diameter_px: 12.8, method: "pixels with B > 0.8 G in 960..1240 × 10..140, components over 20 px" }, pale: [242, 240, 175], disc: [250, 233, 101], fringe_sky_share: .477 },
    limits: ["The picture is an original arrangement in the technique; the reference's figure is not redrawn, and the pale-paint and ground rects were chosen with search.py.", "The sky histogram scores about 0.88: the reference's lobe is 47 % in one 16-level bin with a tail to 224; the lattice shading plus the knot tail gives 37 % in that bin.", "The ground histogram scores about 0.94: the reference's ground lobe is 58 % in one bin with its spread in the dabs; one weave depth serves every paint here, scaled 0.45 on the shapes."],
    study: { slug: "stipple-gouache", lede: "Flat gouache shapes whose edges dissolve into dabs, all of it shaded by one thread lattice on a 4 px pitch that breaks through as primer specks on its knots.",
      body: ["The reference is gouache on a fine canvas. The weave is a thread lattice: warp threads run straight down the sheet on a 4.0 px pitch, weft threads cross on about 4.4 px and wander by several pixels, and at each crossing one thread lies on top. Each thread has its own brightness and sits a little off its grid line, so the column means vary 99 to 116 across the sky and the lattice never repeats cleanly at 8 px. The paint sits in the valleys; the knots stand up through it, and where the paint is thin the primer shows as a pale speck. The shapes are edged with dabs in the neighboring color, three tones each, lit from the upper left, dense at the edge and thinning inward. The ground carries scattered dabs in the sky color, 13 px across, with a pale center.", "The rebuild draws the paint flat: the sky wash with its warm drift, the disc, the ground, the lobed shapes, then the dabs. The dry-brush streaks go into a mask that only the thread tops reach. One pixel pass builds the lattice, mixes it with a 1.6 px tooth, adds two scales of paint-load drift and shades every paint by the lattice height, with the valleys floored so the dark side stays shallow. Density, dab size and fringe depth set the stipple. Pitch and weave depth set the canvas. Primer specks sets how many knots break through; dry-brush streaks sets how much pale paint catches the thread tops."],
      method: "Flat paint · Dry-brush mask · Three-tone dabs · Thread lattice · Load drift · Knot specks",
      points: [
        { u: .12, v: .1, d: "KEY", label: "Open sky: the 4 px lattice at ±16 levels, 45 % lattice and 55 % tooth, column means 99 to 116.", t: "weave", dir: [-1, -1] },
        { u: .3, v: .14, d: "READ", label: "Knot: the top thread's crest at a crossing, its brightness drawn from an exponential tail; the strongest break through to primer.", t: "speck", dir: [0, -1] },
        { u: .35, v: .3, d: "KEY", label: "Stipple fringe: dabs in the sky color climb into the pale shape, exponential in depth, 4.4 to 7.4 px radius.", t: "dab", dir: [1, 0] },
        { u: .6, v: .27, d: "READ", label: "Pale paint: the same lattice at ±5 % because the shading scales with darkness, and a few dabs that strayed.", t: "weave", dir: [1, -1] },
        { u: .7, v: .11, d: "READ", label: "Disc: flat paint; its edge is the one hard edge on the sheet.", t: "paint", dir: [1, -1] },
        { u: .45, v: .55, d: "READ", label: "Dry-brush streak: pale paint that only reaches thread tops, gated by lattice height above 0.42.", t: "streak", dir: [-1, 0] },
        { u: .5, v: .72, d: "READ", label: "Branch: a 30 px ink stroke with a 22 px ground stroke laid 3 px above it, so one dark edge remains.", t: "paint", dir: [1, 1] },
        { u: .1, v: .85, d: "KEY", label: "Ground dabs: sky color with a pale center, 13 px across, their share 8.6 % of the ground.", t: "dab", dir: [-1, 1] },
        { u: .5, v: .9, d: "READ", label: "Ground paint: laid 0.45 as thick as the sky wash, so the lattice shades it less and fewer knots break through.", t: "weave", dir: [0, 1] },
        { u: .85, v: .5, d: "READ", label: "Paint load: 160 px and 22 px drifts of ±9 levels under everything.", t: "paint", dir: [1, 0] }
      ] }
  });
})();
