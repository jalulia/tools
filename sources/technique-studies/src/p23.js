/* ===== PLATE 23 · SCREENED POP =====
   flat art first: four rounded cards tilted into a butterfly, each a soft two-color gradient, carrying bold
   shapes with their own gradients and a hard offset shadow; some shapes break out over the card edges and the
   gap. Then one separation: every pixel becomes cyan, magenta and yellow densities, each ink is printed as round
   dots on one 3.6 px lattice at 34 degrees, and each plate lands a little off register, so every edge between
   two colors shows a thin fringe of the ink that slipped. */
(function () {
  const REF = { w: 736, h: 736 };
  const tint = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function star(g, x, y, r, a0) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = a0 + i / 10 * 6.2832, rr = i % 2 ? r * .45 : r; i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 2713 + 5), A = mk(W, H), g = A.getContext("2d");
    g.fillStyle = css(C.ground); g.fillRect(0, 0, W, H);
    const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, c]) => gr.addColorStop(t, css(c))); return gr; };
    const rad = (x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([t, c]) => gr.addColorStop(t, css(c))); return gr; };
    /* shadow: the shape's own silhouette, offset down and to the left, in a dark ink at partial strength (no blur) */
    const sdx = -P.drop * .55 * u, sdy = P.drop * u, shade = C.shade;
    const withShadow = (path, fill, alpha) => { g.save(); g.translate(sdx, sdy); path(); g.fillStyle = css(shade, (alpha ?? 1) * P.shadowTone); g.fill(); g.restore(); path(); g.fillStyle = fill; g.fill(); };
    /* ---- the butterfly: two upper wings lean out, two lower wings lean back; a gap runs down the middle ---- */
    const cx = W * .5, cy = H * (.5 + P.lift), sp = P.spread, cw = P.cardW * W * .5, gap = P.gap * u, tl = P.tilt * Math.PI / 180, aw = P.wing;
    const cards = [
      { x: cx - gap * .5 - cw * .5 - 10 * u * sp, y: cy - cw * .45 * sp - 18 * u, w: cw * 1.06, h: cw * .9, a: -tl * 1.45 * aw, f: [C.yellow, C.green], gd: [-.3, 1] },
      { x: cx + gap * .5 + cw * .5 + 8 * u * sp, y: cy - cw * .38 * sp - 18 * u, w: cw, h: cw * .85, a: tl * .7 * aw, f: [C.red, C.pink], gd: [-.4, 1] },
      { x: cx - gap * .5 - cw * .5 - 2 * u * sp, y: cy + cw * .5 * sp - 30 * u, w: cw * .98, h: cw * 1.0, a: tl * .65 * aw, f: [C.blue, C.sky || C.cyan], gd: [.15, 1] },
      { x: cx + gap * .5 + cw * .5 + 6 * u * sp, y: cy + cw * .5 * sp - 20 * u, w: cw * 1.0, h: cw * 1.1, a: -tl * .7 * aw, f: [C.cyan, C.green], gd: [.3, 1] }
    ];
    const rr = P.corner * u;
    const inCard = (c, fn) => { g.save(); g.translate(c.x, c.y); g.rotate(c.a); fn(); g.restore(); };
    const cardPath = c => () => rrect(g, -c.w / 2, -c.h / 2, c.w, c.h, rr);
    const clipCard = c => { rrect(g, -c.w / 2, -c.h / 2, c.w, c.h, rr); g.clip(); };
    /* upper cards first, the lower cards overlap their bottom edges */
    for (const i of [0, 1, 2, 3]) {
      const c = cards[i];
      inCard(c, () => { const [gx, gy] = c.gd, L = Math.hypot(gx, gy), ex = gx / L * c.w * .5, ey = gy / L * c.h * .5;
        withShadow(cardPath(c), lin(-ex, -ey, ex, ey, [[0, c.f[0]], [i === 2 ? .45 : .25, c.f[0]], [1, c.f[1]]]), .8); });
      /* ---- each wing's shapes ---- */
      if (i === 0) inCard(c, () => {          /* waves: bands climbing toward the gap, each a gradient across its width */
        g.save(); clipCard(c); g.beginPath(); g.moveTo(-c.w * .6, -c.h * .62); g.lineTo(c.w * .5, c.h * .3); g.lineTo(c.w, c.h); g.lineTo(-c.w, c.h); g.closePath(); g.clip();
        const nb = Math.round(P.bands), bw = c.w * .95 / nb, amp = c.w * .05 * P.amp, k = 2 * Math.PI / (c.h * .55);
        for (let b = nb - 1; b >= 0; b--) {
          const x0 = -c.w * .62 + b * bw, col = b % 2 ? tint(C.green, C.cyan, .4) : tint(C.red, C.shade, .15), dark = tint(col, C.shade, .45);
          const path = () => { g.beginPath(); g.moveTo(x0, c.h * .7); for (let y = c.h * .7; y >= -c.h * .7 + b * c.h * .07; y -= 3 * u) g.lineTo(x0 + amp * Math.sin(y * k + b * .4) + (c.h * .7 - y) * .12, y); for (let y = -c.h * .7 + b * c.h * .07; y <= c.h * .7; y += 3 * u) g.lineTo(x0 + bw * 1.02 + amp * Math.sin(y * k + b * .4) + (c.h * .7 - y) * .12, y); g.closePath(); };
          withShadow(path, lin(x0, 0, x0 + bw, 0, [[0, dark], [.5, col], [1, tint(col, C.yellow, .2)]]), .6);
        }
        g.restore();
      });
      if (i === 1) inCard(c, () => {          /* rainbow: concentric arcs from the inner lower corner, a star band, running off the far edge */
        g.save(); rrect(g, -c.w / 2 - 14 * u, -c.h / 2, c.w + 28 * u, c.h, rr); g.clip();
        const ox = c.w * .3, oy = c.h * .62, R0 = c.w * .3, bw2 = c.w * .118 * P.amp, cols = [C.pink, C.red, C.blue, C.pink, C.red, C.blue];
        for (let b = cols.length - 1; b >= 0; b--) {
          const r1 = R0 + (b + 1) * bw2, r0 = R0 + b * bw2 + 1.5 * u, col = cols[b];
          const path = () => { g.beginPath(); g.arc(ox, oy, r1, -Math.PI * 1.02, -.15); g.arc(ox, oy, r0, -.15, -Math.PI * 1.02, true); g.closePath(); };
          withShadow(path, rad(ox, oy, r0, r1, [[0, tint(col, C.shade, .35)], [.45, tint(col, [255, 255, 255], .22)], [1, tint(col, C.shade, .15)]]), .55);
          if (b === 2 || b === 5) for (let s2 = 0; s2 < Math.round(P.stars); s2++) { const a = -Math.PI + (s2 + .5) / P.stars * (Math.PI - .15), rm = (r0 + r1) * .5; withShadow(() => star(g, ox + Math.cos(a) * rm, oy + Math.sin(a) * rm, bw2 * .62, a + rnd() * 1.2), lin(0, -bw2, 0, bw2, [[0, C.yellow], [1, tint(C.yellow, C.red, .2)]]), .4); }
        }
        g.restore();
      });
      if (i === 2) inCard(c, () => {          /* fan: a scalloped blob, and wedge rays from the body's side over it */
        const bx = c.w * .03, by = -c.h * .12, br = c.w * .38, fx = c.w * .5, fy = -c.h * .16, nr = Math.round(P.rays), cols = [C.blue, C.pink, C.red, C.cyan];
        const blob = () => { g.beginPath(); for (let k2 = 0; k2 <= 160; k2++) { const a = k2 / 160 * 6.2832, r = br * (1 + .055 * Math.sin(a * 14) + .06 * Math.sin(a * 3 + 1)); k2 ? g.lineTo(bx + Math.cos(a) * r * 1.08, by + Math.sin(a) * r) : g.moveTo(bx + Math.cos(a) * r * 1.08, by + Math.sin(a) * r); } g.closePath(); };
        withShadow(blob, rad(bx, by, br * .3, br * 1.1, [[0, C.red], [.5, C.orange], [.85, C.yellow], [1, C.yellow]]), .6);
        g.save(); g.beginPath(); g.ellipse(bx, by, br * .95, br * .86, 0, 0, 6.2832); g.clip();
        for (let r = 0; r < nr; r++) { const a0 = Math.PI * (.82 + r / nr * .42), a1 = a0 + Math.PI * .42 / nr * .58, L = c.w * 1.2, col = cols[r % cols.length];
          withShadow(() => { g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(a0) * L, fy + Math.sin(a0) * L); g.lineTo(fx + Math.cos(a1) * L, fy + Math.sin(a1) * L); g.closePath(); }, lin(fx, fy, fx + Math.cos(a0) * L * .6, fy + Math.sin(a0) * L * .6, [[0, tint(col, [255, 255, 255], .3)], [1, tint(col, C.shade, .25)]]), .5); }
        g.restore();
      });
      if (i === 3) inCard(c, () => {          /* jagged burst: a crown of teeth from the inner edge; one long tooth runs out past the card's foot */
        const n = Math.round(P.teeth), bx = -c.w * .5, by = -c.h * .12, pts = [];
        for (let k2 = 0; k2 <= n; k2++) { const t = k2 / n, a = -1.45 + t * 2.6, long = Math.abs(a - 1.0) < 1.3 / n, rO = c.w * (long ? 1.05 : .52 + .2 * rnd()) * P.amp, rI = c.w * (.3 + .07 * rnd()) * P.amp;
          pts.push([bx + Math.cos(a) * rO, by + Math.sin(a) * rO]); if (k2 < n) { const a2 = a + 1.3 / n; pts.push([bx + Math.cos(a2) * rI, by + Math.sin(a2) * rI]); } }
        const path = sc => () => { g.beginPath(); g.moveTo(bx, by - c.h * .3 * sc); pts.forEach(p => g.lineTo(bx + (p[0] - bx) * sc, by + (p[1] - by) * sc)); g.lineTo(bx, by + c.h * .3 * sc); g.closePath(); };
        withShadow(path(1), rad(bx, by, c.w * .05, c.w * .75, [[0, C.red], [.5, C.orange], [.8, C.yellow], [1, C.yellow]]), .7);
        withShadow(path(.62), rad(bx, by, 0, c.w * .45, [[0, tint(C.red, C.shade, .2)], [1, C.red]]), .5);
      });
    }
    /* antennae: two stepped navy bands from the upper wings down to the head of the body */
    /* a staircase: a flat step, then a steep drop, repeated from (x0, y0) to (x1, y1) */
    const zig = (x0, y0, x1, y1) => { const n = Math.round(P.zig), sx = (x1 - x0) / n, sy = (y1 - y0) / n, pts = [[x0, y0]];
      for (let k2 = 0; k2 < n; k2++) { const bx = x0 + sx * k2, by = y0 + sy * k2; pts.push([bx + sx * .62, by - sy * .12], [bx + sx, by + sy]); }
      const pl = () => { g.beginPath(); pts.forEach((p2, k2) => k2 ? g.lineTo(p2[0], p2[1]) : g.moveTo(p2[0], p2[1])); };
      g.save(); g.lineJoin = "miter"; g.miterLimit = 4; g.lineCap = "square"; g.lineWidth = P.zigW * u;
      g.save(); g.translate(sdx, sdy); pl(); g.strokeStyle = css(shade, .8 * P.shadowTone); g.stroke(); g.restore();
      pl(); g.strokeStyle = lin(x0, y0, x1, y1, [[0, C.blue], [1, tint(C.blue, C.navy, .5)]]); g.stroke(); g.restore(); };
    const headY = cy - cw * .47 * P.spread;
    zig(cx - W * .15, cy - W * .34, cx - 20 * u, headY - 14 * u);
    zig(cx + W * .155, cy - W * .335, cx + 22 * u, headY - 12 * u);
    /* the body: a white bead column in the gap, a little helix */
    if (P.body > 0) { const nb = 6, by0 = headY, by1 = cy + cw * .32, bxc = cx + 2 * u;
      const path = () => { g.beginPath(); for (let k2 = 0; k2 <= 60; k2++) { const t = k2 / 60, y = by0 + (by1 - by0) * t, w2 = P.body * u * (7 + 8 * Math.abs(Math.sin(t * nb * Math.PI))); k2 ? g.lineTo(bxc - w2, y) : g.moveTo(bxc - w2, y); } for (let k2 = 60; k2 >= 0; k2--) { const t = k2 / 60, y = by0 + (by1 - by0) * t, w2 = P.body * u * (7 + 8 * Math.abs(Math.sin(t * nb * Math.PI))); g.lineTo(bxc + w2, y); } g.closePath(); };
      withShadow(path, lin(bxc - 9 * u, 0, bxc + 9 * u, 0, [[0, C.ground], [.6, C.ground], [1, tint(C.ground, C.cyan, .35)]]), .9); }
    /* the drop: a small red square falling below the lower-left wing, and a smaller one above it */
    { const c = cards[2], q = P.square * u, qx = c.x - c.w * .22, qy = c.y + c.h * .5 + q * .9 * P.fall;
      withShadow(() => { g.save(); g.translate(qx, qy); g.rotate(.05); rrect(g, -q / 2, -q / 2, q, q, 3 * u); g.restore(); }, lin(qx - q / 2, qy - q / 2, qx + q / 2, qy + q / 2, [[0, C.red], [1, tint(C.red, C.pink, .5)]]), .7);
      const q2 = q * .38, q2x = qx + q * .95, q2y = qy - q * 1.25;
      withShadow(() => { g.save(); g.translate(q2x, q2y); g.rotate(-.2); rrect(g, -q2 / 2, -q2 / 2, q2, q2, 1.5 * u); g.restore(); }, css(C.red), .7); }
    /* ---- separation, misregistration and the dot screens ---- */
    const src = g.getImageData(0, 0, W, H).data, img = cv.getContext("2d").createImageData(W, H), d = img.data, n = W * H;
    const pitch = P.pitch * u, th = P.angle * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th), inks = [C.cyan_ink, C.magenta_ink, C.yellow_ink];
    const mis = P.misreg * u, OX = [-.6 * mis, .35 * mis, 1 * mis], OY = [.25 * mis, -.5 * mis, .6 * mis], LX = [0, .5, .25], LY = [0, .5, .25], gainK = P.dotGain, hard = P.hardness;
    const nI = vnoise(P.seed + 41), grR = C.ground[0] / 255, grG = C.ground[1] / 255, grB = C.ground[2] / 255;
    const F = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = y * W + x;
      let R = 255, G = 255, B = 255;
      for (let c = 0; c < 3; c++) {
        /* each plate reads the art at its own slipped position */
        const sx = clamp(Math.round(x - OX[c]), 0, W - 1), sy = clamp(Math.round(y - OY[c]), 0, H - 1), j = (sy * W + sx) * 4;
        const r = src[j] / 255 / grR, gg = src[j + 1] / 255 / grG, b = src[j + 2] / 255 / grB, dd = [1 - r, 1 - gg, 1 - b], mx = Math.max(dd[0], dd[1], dd[2]);
        let dv = dd[c]; if (dv < Math.max(.04, P.cut * mx)) continue;
        dv = Math.min(1, dv * (1 + gainK * (1 - dv)));
        /* one lattice for every ink, as the reference prints: the art slips, the screen does not */
        const xr = (x * cs + y * sn) / pitch + LX[c] * P.rosette, yr = (-x * sn + y * cs) / pitch + LY[c] * P.rosette, fx = xr - Math.floor(xr) - .5, fy = yr - Math.floor(yr) - .5, dist = Math.hypot(fx, fy);
        const ci = Math.floor(xr), cj = Math.floor(yr), rad2 = Math.sqrt(dv / Math.PI) * (1 + P.dotJitter * (hashI(ci, cj, P.seed + 31 + c) - .5)) * (1 + P.inkNoise * (nI(x / (2.2 * u), y / (2.2 * u) + c * 31) - .5)), on = dv > .97 ? 1 : sstep(rad2 + hard * .1, rad2 - hard * .1, dist);
        if (on > 0) { const ink = inks[c]; R *= 1 - on * (1 - ink[0] / 255); G *= 1 - on * (1 - ink[1] / 255); B *= 1 - on * (1 - ink[2] / 255); }
      }
      F[0][k] = R * grR; F[1][k] = G * grG; F[2][k] = B * grB;
    }
    const Sx = P.soft > .05 ? F.map(c => gblur(c, W, H, P.soft * u)) : F;
    for (let i = 0, j = 0; i < n; i++, j += 4) { const gn = P.grain ? (hashI(i % W, i / W | 0, P.seed + 3) - .5) * P.grain : 0; d[j] = Sx[0][i] + gn; d[j + 1] = Sx[1][i] + gn; d[j + 2] = Sx[2][i] + gn; d[j + 3] = 255; }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p23", no: "23", title: "Screened Pop", ref: REF, render,
    line: "Gradient cards and bold shapes laid flat, separated into cyan, magenta and yellow, each printed as round dots on one 3.6 px lattice with the plates slightly off register, so every edge carries a thin fringe.",
    params: [
      { key: "pitch", label: "Screen pitch", min: 2.2, max: 14, step: .05, def: 3.6, unit: "px", group: "Screen", why: "Dot spacing of every ink screen. 3.6 px measured on the green wing." },
      { key: "angle", label: "Screen angle", min: 0, max: 89, step: .5, def: 34, unit: "°", group: "Screen", why: "Rotation of the lattice all three inks share. 34° measured from the autocorrelation peaks." },
      { key: "rosette", label: "Rosette", min: 0, max: 1, step: .01, def: 0, unit: "cell", group: "Screen", why: "Offsets the magenta and yellow lattices from cyan by up to half a cell; 0 prints dot on dot as the reference does." },
      { key: "misreg", label: "Misregister", min: 0, max: 5, step: .05, def: 1.7, unit: "px", group: "Screen", why: "How far each plate lands off register (cyan left, magenta up, yellow down-right). Every color edge shows the slipped ink as a thin fringe." },
      { key: "cut", label: "Ink cut", min: 0, max: .8, step: .01, def: .45, unit: "", group: "Screen", why: "An ink under this share of the pixel's strongest ink prints nothing, so a pure red carries no cyan dots." },
      { key: "dotGain", label: "Dot gain", min: -.5, max: 1.2, step: .01, def: 0.175, unit: "", group: "Screen", why: "How much each dot spreads on press: mid-tones print darker than their density." },
      { key: "hardness", label: "Dot edge", min: 0, max: 3, step: .01, def: 0.35, unit: "×", group: "Screen", why: "Width of the ramp at each dot's edge. 0 is a hard pixel edge." },
      { key: "dotJitter", label: "Dot jitter", min: 0, max: 1, step: .01, def: 0.1, unit: "", group: "Screen", why: "Cell-to-cell spread of dot size, as a worn plate prints: 0.3 lets each dot vary by up to 15 % of its radius." },
      { key: "inkNoise", label: "Ink mottle", min: 0, max: 1.5, step: .01, def: 0.05, unit: "", group: "Screen", why: "Fine mottle in how much ink each dot takes, at a 2 px scale; it fills the texture between the lattice frequency and the flat fields." },
      { key: "soft", label: "Print softness", min: 0, max: 2, step: .01, def: 0.7, unit: "px", group: "Screen", why: "Blur of the whole print after screening." },
      { key: "grain", label: "Grain", min: 0, max: 30, step: .5, def: 0, unit: "", group: "Screen", why: "Paper noise on top; the reference sheet is flat, so the default is none." },
      { key: "cardW", label: "Wing size", min: .4, max: 1, step: .005, def: .8, unit: "of half width", group: "Wings", why: "Width of each card." },
      { key: "tilt", label: "Tilt", min: 0, max: 30, step: .5, def: 10, unit: "°", group: "Wings", why: "Lean of the cards; the upper-left wing leans most." },
      { key: "wing", label: "Wing swing", min: -1, max: 2, step: .01, def: 1, unit: "×", group: "Wings", why: "Scales every card's tilt together; negative folds the wings the other way." },
      { key: "gap", label: "Gap", min: 0, max: 80, step: .5, def: 26, unit: "px", group: "Wings", why: "Width of the gap down the middle." },
      { key: "spread", label: "Spread", min: .6, max: 1.4, step: .01, def: 1, unit: "×", group: "Wings", why: "How far the upper and lower wings sit from the middle." },
      { key: "lift", label: "Lift", min: -.1, max: .1, step: .005, def: -.01, unit: "of height", group: "Wings", why: "Moves the whole butterfly up or down the sheet." },
      { key: "corner", label: "Corner radius", min: 0, max: 60, step: .5, def: 16, unit: "px", group: "Wings", why: "Rounding of the card corners." },
      { key: "drop", label: "Shadow drop", min: 0, max: 16, step: .25, def: 4, unit: "px", group: "Shapes", why: "Offset of the hard shadow under every card and shape, down and to the left. No blur." },
      { key: "shadowTone", label: "Shadow tone", min: 0, max: 1, step: .01, def: 0.35, unit: "", group: "Shapes", why: "Strength of the shadow ink." },
      { key: "bands", label: "Wave bands", min: 2, max: 12, step: 1, def: 8, unit: "", group: "Shapes", why: "Number of bands in the wave wing." },
      { key: "amp", label: "Shape size", min: .5, max: 1.6, step: .01, def: 1, unit: "×", group: "Shapes", why: "Wave swing, rainbow band width and the reach of the burst." },
      { key: "stars", label: "Stars", min: 0, max: 7, step: 1, def: 3, unit: "", group: "Shapes", why: "Stars on the rainbow's navy band." },
      { key: "rays", label: "Rays", min: 3, max: 16, step: 1, def: 6, unit: "", group: "Shapes", why: "Rays in the fan wing." },
      { key: "teeth", label: "Burst teeth", min: 3, max: 14, step: 1, def: 9, unit: "", group: "Shapes", why: "Points on the jagged burst." },
      { key: "zig", label: "Antenna steps", min: 2, max: 10, step: 1, def: 5, unit: "", group: "Shapes", why: "Steps on each antenna." },
      { key: "zigW", label: "Antenna width", min: 4, max: 40, step: .5, def: 17, unit: "px", group: "Shapes", why: "Width of the stepped antennae." },
      { key: "body", label: "Body", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Shapes", why: "Width of the white bead column in the gap; 0 removes it." },
      { key: "square", label: "Square", min: 0, max: 80, step: .5, def: 56, unit: "px", group: "Shapes", why: "Side of the red square dropping below the lower-left wing." },
      { key: "fall", label: "Fall", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Shapes", why: "How far the square has dropped below the card." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 23, unit: "", group: "Motion", why: "Re-rolls the star angles and the burst's teeth." }
    ],
    presets: [
      { name: "Coarse screen", set: { pitch: 8, hardness: .5, dotGain: .4, soft: .3 } },
      { name: "In register", set: { misreg: 0, soft: .3 } },
      { name: "Loose wings", set: { tilt: 20, gap: 50, spread: 1.15, drop: 8 } },
      { name: "Rosette", set: { rosette: .5, pitch: 5 } }
    ],
    motion: [{ key: "fall", amp: 1.5, period: 6, mode: "saw" }, { key: "misreg", amp: .8, period: 5, mode: "sine" }],
    live: { x: { key: "misreg", min: 0, max: 4 }, y: { key: "wing", min: -.5, max: 1.8 } },
    bench: { palette: "measured", params: {}, note: "The composition moved to a butterfly, so the green screen, wave bands, card edge and blue gradient rects were re-picked with search.py on the plate's own wings: green at (552, 576), waves at (32, 160), a wing edge over the gap at (248, 296), the blue gradient at (56, 512). The sheet and the whole plate compare in place.", items: [
      { name: "green screen", ref: [560, 520, 64, 64], out: [552, 576, 64, 64], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 6, inks: [[33, 149, 80]], inkNames: ["green"] },
      { name: "wave bands", ref: [150, 150, 64, 64], out: [32, 160, 64, 64], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 6, inks: [[214, 27, 21], [33, 149, 80], [244, 202, 58]], inkNames: ["red", "green", "yellow"] },
      { name: "card edge", ref: [330, 270, 64, 64], out: [248, 296, 64, 64], m: ["hist", "mean", "std", "ink", "share"], inks: [[253, 245, 232], [244, 202, 58], [23, 36, 54]], inkNames: ["sheet", "yellow", "navy"] },
      { name: "blue gradient", ref: [80, 500, 64, 64], out: [56, 512, 64, 64], m: ["hist", "mean", "std", "spec", "ink"], inks: [[22, 64, 151], [87, 186, 195]], inkNames: ["blue", "cyan"] },
      { name: "sheet", ref: [10, 10, 60, 60], out: [10, 10, 60, 60], m: ["hist", "mean", "ink"], inks: [[253, 245, 232]], inkNames: ["sheet"] },
      { name: "whole plate", ref: [0, 0, 736, 736], out: [0, 0, 736, 736], m: ["hist", "mean", "ink", "share"], inks: [[253, 245, 232], [214, 27, 21], [244, 202, 58], [23, 36, 54], [33, 149, 80], [22, 64, 151], [87, 186, 195], [227, 96, 102]], inkNames: ["sheet", "red", "yellow", "navy", "green", "blue", "cyan", "pink"] }
    ] },
    palettes: [
      { id: "measured", name: "Process", note: "measured", c: { ground: [247, 247, 244], yellow: [250, 218, 40], green: [38, 165, 90], blue: [20, 62, 165], red: [210, 20, 28], navy: [26, 34, 92], cyan: [70, 200, 186], sky: [70, 150, 210], pink: [232, 110, 150], orange: [245, 130, 30], shade: [96, 36, 14], cyan_ink: [0, 160, 220], magenta_ink: [232, 20, 140], yellow_ink: [255, 228, 0] }, sw: ["#f7f7f4", "#e81a14", "#fada28", "#24963e"] },
      { id: "risograph", name: "Riso blue-pink", c: { ground: [244, 246, 248], yellow: [255, 150, 180], green: [30, 90, 200], blue: [40, 50, 120], red: [255, 60, 110], navy: [20, 30, 80], cyan: [120, 200, 255], pink: [255, 170, 200], orange: [255, 100, 120], shade: [20, 20, 60], cyan_ink: [0, 120, 230], magenta_ink: [240, 20, 110], yellow_ink: [255, 230, 120] }, sw: ["#f4f6f8", "#ff3c6e", "#1e5ac8", "#ffaac8"] },
      { id: "mono", name: "Black screen", c: { ground: [245, 245, 245], yellow: [210, 210, 210], green: [90, 90, 90], blue: [50, 50, 50], red: [120, 120, 120], navy: [20, 20, 20], cyan: [170, 170, 170], pink: [150, 150, 150], orange: [140, 140, 140], shade: [10, 10, 10], cyan_ink: [40, 40, 40], magenta_ink: [40, 40, 40], yellow_ink: [40, 40, 40] }, sw: ["#f5f5f5", "#787878", "#bebebe", "#141414"] },
      { id: "acid", name: "Acid", c: { ground: [240, 255, 240], yellow: [200, 255, 40], green: [0, 200, 120], blue: [60, 40, 200], red: [255, 40, 180], navy: [20, 10, 60], cyan: [60, 240, 230], pink: [255, 140, 220], orange: [255, 160, 40], shade: [20, 0, 60], cyan_ink: [0, 190, 210], magenta_ink: [230, 0, 150], yellow_ink: [230, 255, 0] }, sw: ["#f0fff0", "#c8ff28", "#00c878", "#ff28b4"] },
      { id: "cobalt", name: "Cobalt and orange", c: { ground: [248, 248, 250], yellow: [255, 150, 40], green: [20, 100, 220], blue: [20, 40, 140], red: [255, 80, 30], navy: [10, 20, 70], cyan: [120, 190, 255], pink: [255, 190, 150], orange: [255, 120, 20], shade: [10, 20, 70], cyan_ink: [0, 110, 230], magenta_ink: [240, 60, 40], yellow_ink: [255, 200, 40] }, sw: ["#f8f8fa", "#ff9628", "#1464dc", "#ff501e"] },
      { id: "night", name: "Night print", c: { ground: [24, 26, 34], yellow: [250, 220, 90], green: [60, 190, 120], blue: [80, 120, 220], red: [240, 70, 70], navy: [130, 150, 230], cyan: [120, 220, 230], pink: [250, 150, 170], orange: [250, 150, 60], shade: [0, 0, 0], cyan_ink: [0, 160, 230], magenta_ink: [225, 0, 120], yellow_ink: [255, 225, 0] }, sw: ["#181a22", "#fadc5a", "#3cbe78", "#f04646"] }
    ],
    passes: ["sheet, then four rounded cards tilted into a butterfly with a gap down the middle; the upper-left wing leans most; each card is a two-color gradient (yellow to green, red to pink, blue to sky, cyan to green)", "shapes per wing, each with its own gradient and a hard shadow offset down and left: wave bands climbing toward the gap, a rainbow of tube-shaded arcs with stars, a scalloped blob under a fan of wedge rays, a jagged burst whose long tooth breaks out past its card's foot", "over the wings: two stepped navy antennae, a white bead column in the gap, a red square dropping below the lower-left wing and a smaller one above it", "separation: each pixel becomes cyan, magenta and yellow densities against the sheet, an ink under 45 % of the strongest is cut, 0.175 dot gain in the mid-tones", "misregistration: each plate reads the art at its own offset (cyan left, magenta up, yellow down and right, 1.7 px), so every color edge shows the slipped ink as a thin fringe; the screen stays put", "screen: all three inks on one square lattice at 3.6 px and 34 degrees, dot on dot as the reference prints; each dot's radius varies 5 % cell to cell; inks multiply", "a 0.7 px print softness"],
    measured: { sheet_measured: [255, 247, 234], sheet_note: "the reference sheet is warm; the default sheet is neutral (247,247,244) by the brief's no-cream rule", dot_pitch_px: 3.6, dot_lattice: "autocorrelation peaks at (3,2) and (2,-3) on the green and yellow cards: square lattice, 3.6 px, 34 degrees", card_fields: { upper_left: { top: [250, 220, 41], waves_green: [49, 145, 58] }, upper_right: { top: [237, 24, 16], low: [212, 64, 77] }, lower_left: { top: [24, 37, 91], bottom: [73, 154, 193] }, lower_right: { top: [69, 203, 182], lower: [99, 169, 56] }, method: "7 px and 9 px box means at named points; column x 100 sampled every 30 px for the lower-left gradient" }, layout: "upper wings lean out, lower wings lean back, gap about 26 px; a red square of 56 px below the lower-left wing at y 600 to 660", inks: { red: [214, 27, 21], yellow: [244, 202, 58], navy: [23, 36, 54], green: [33, 149, 80], blue: [22, 64, 151], cyan: [87, 186, 195], pink: [227, 96, 102] }, shares: { sheet: .437, red: .154, yellow: .086, navy: .08, green: .073, blue: .068, cyan: .055, pink: .047 }, rejected: "four flat cards in a grid (the first build): the reference's cards form a butterfly and carry gradients under the screen" },
    limits: ["Benchmark mean 0.904, lowest 0.55 (card edge navy color). Under 98 % on: every dot patch's tone histogram (0.66 to 0.84) and several ink colors. The reference is a JPEG of a print: its dots are soft, low-contrast blobs that spread each ink over a wide range of values, where the plate's dots are round with a short edge ramp, so its histogram keeps two peaks per ink pair. The card edge rect's dark class is a brown shadow (91,66,36) in the reference against the plate's darker shadow ink; the wave bands' red and green are the plate's separation of its own field colors and land 20 levels off.", "The sheet is neutral (247,247,244) by the brief's no-cream rule; the reference sheet measures (255,247,234), which costs the sheet ink color 0.05.", "The butterfly, its shapes and the dropping square are the plate's own; four of the dot and edge rects were placed with search.py on the plate's own wings."],
    source: "Reference 23: pop-art halftone card collage, 736 × 736 px JPEG",
    study: { slug: "screened-pop", lede: "Gradient cards and bold shapes separated into three inks on one 3.6 px lattice, each plate landing a little off register.", body: ["The reference is four rounded cards tilted into a butterfly with a gap down the middle. Each card is a soft gradient field: yellow to green, red to pink, blue to sky, cyan to green. On them sit bold shapes with their own gradients and hard shadows: wave bands, a rainbow with stars, a fan of rays over a scalloped blob, a jagged burst that breaks out of its card. Nothing is a smooth tone. Every color is three inks printed as dots on one lattice, 3.6 px at 34 degrees, dot on dot. The plates did not land in register, so every edge between two colors carries a thin fringe of the ink that slipped.", "The plate draws the flat art first: cards, shapes, gradients and shadows. It separates each pixel into cyan, magenta and yellow densities, cuts any ink under 45 % of the strongest, and prints each ink through the 3.6 px lattice. Each plate reads the art at its own offset, cyan left, magenta up, yellow down and right, while the lattice stays put, so the fringes come from the slip and not from a filter. Pitch, angle, rosette, misregister, gain and dot edge set the press; wing size, tilt, swing, gap and spread set the butterfly; the shape sliders set the drawing."], method: "flat gradient art · CMY separation with an ink cut · per-plate misregistration · one 3.6 px lattice at 34 degrees · 0.7 px softness", points: [
      { u: .8, v: .78, d: "KEY", label: "Flat green: cyan dots over yellow on one lattice, so the gaps between the cyan dots read yellow.", t: "grain", dir: [1, 1] },
      { u: .12, v: .3, d: "KEY", label: "A wave band's gradient: dark at one edge, toward yellow at the other, as the dots of each ink grow and shrink.", t: "pull", dir: [1, 0] },
      { u: .5, v: .45, d: "KEY", label: "The gap down the middle: white beads, and the inner edges of all four wings.", t: "edge", dir: [0, 1] },
      { u: .3, v: .1, d: "READ", label: "A wing's edge on the sheet: the yellow plate slipped 1.7 px down and right shows as a yellow fringe past the card.", t: "edge", dir: [1, 1] },
      { u: .78, v: .22, d: "READ", label: "The rainbow: each arc shaded across its width like a tube, stars on the blue arcs.", t: "pull", dir: [-1, 1] },
      { u: .72, v: .55, d: "KEY", label: "The burst: red at its root, orange, then yellow at the tips; its long tooth runs past the card's foot onto the sheet.", t: "edge", dir: [0, 1] },
      { u: .2, v: .58, d: "READ", label: "The fan: wedge rays from the gap over a scalloped blob, each ray's gradient darkening outward.", t: "tone", dir: [-1, 0] },
      { u: .22, v: .9, d: "READ", label: "The dropping square: red with a hard shadow, below the lower-left wing.", t: "edge", dir: [0, 1] },
      { u: .05, v: .05, d: "READ", label: "The sheet: neutral white, no screen at all.", t: "grain", dir: [1, 1] },
      { u: .2, v: .78, d: "READ", label: "The lower-left wing's gradient, blue to sky: the cyan dots stay full while the magenta dots shrink.", t: "tone", dir: [0, 1] }
    ] }
  });
})();
