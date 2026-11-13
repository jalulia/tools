/* ===== PLATE 19 · RADIAL DITHER BLOOM =====
   one light field, then one dither. The field: a black sheet with a lit square panel set into it, a beveled
   halo that falls from the panel edge to black, a light that falls off from one corner, dark bead chains and
   bright capsules on alternating radial rays (the capsules end in hard yellow caps that spill past the panel),
   a ring of yellow teeth around a black hole. The field is sampled once per dither cell (2.21 px); each cell's
   color is printed on a diagonal checker: each phase quantizes its own tone between two inks, breaks placed on an ordered diagonal lattice. */
(function () {
  const REF = { w: 735, h: 920 };
  const TAU = Math.PI * 2;
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 3331 + 7);
    const INK = [C.k, C.i, C.v, C.w, C.y, C.o || C.y.map((v, c) => v * .7 + C.k[c] * .3)];
    /* ---- geometry: panel rect (measured insets 55 / 63 / 59 / 68 px at frame 57), the halo ramp outside it ---- */
    const fr = P.frame / 57, x0 = 55 * u * fr, y0 = 63 * u * fr, x1 = W - 59 * u * fr, y1 = H - 68 * u * fr;
    const bev = Math.max(2 * u, P.bevel * u), cx = W * .498, cy = H * .497, R0 = Math.hypot(x1 - x0, y1 - y0) * .5;
    const la = P.light * Math.PI / 180, lx = Math.cos(la), ly = Math.sin(la), fo = P.falloff, wm = P.warm;
    /* the light: tone along the light axis, 1 toward the light, 0 in the far corner; warmth only near the light */
    const Lx = cx + lx * R0 * .95, Ly = cy + ly * R0 * .95;
    const lightT = (X, Y) => { const sL = ((X - cx) * lx + (Y - cy) * ly) / R0, dL = Math.hypot(X - Lx, Y - Ly) / R0; return [clamp(1.1 - Math.pow(dL * fo * .68, 1.8), 0, 1), sstep(-.05, .4, sL) * wm, sL]; };
    const rectDist = a => { const c = Math.cos(a), sn = Math.sin(a); let t = 1e9; if (c > 1e-6) t = Math.min(t, (x1 - cx) / c); if (c < -1e-6) t = Math.min(t, (x0 - cx) / c); if (sn > 1e-6) t = Math.min(t, (y1 - cy) / sn); if (sn < -1e-6) t = Math.min(t, (y0 - cy) / sn); return t; };
    /* ---- the rays: N capsules, each a chain of overlapping beads growing outward, the last bead longer and
       carrying a pale yellow cap that can spill past the panel edge ---- */
    const N = Math.max(3, Math.round(P.rays)), nb = Math.max(1, Math.round(P.beads)), sc = P.scatter, ring = P.ring * u;
    const base = P.spin * Math.PI / 180, dA = TAU / N, wOut = 40 * u * P.size, rA = ring * 1.5;
    const lobes = [];
    for (let k = 0; k < N; k++) {
      const a = base + k * dA + (rnd() - .5) * .25 * sc, rE = rectDist(a) * P.reach * (1 + (rnd() - .45) * .24 * sc), rhoB = wOut * (1 + (rnd() - .5) * .45 * sc), bb = [];
      const rTip = Math.max(rA + rhoB, rE - rhoB * .25), r0 = rA + rhoB * .35;
      for (let j = 0; j < nb; j++) { const t = nb > 1 ? j / (nb - 1) : 1, rho = rhoB * (.68 + .32 * t) * (j < nb - 1 ? .88 + .24 * rnd() : 1); bb.push([r0 + (rTip - r0) * Math.pow(t, .8) + (j && j < nb - 1 ? (rnd() - .5) * .15 * sc * (rTip - r0) / nb : 0), rho, (rnd() - .5) * .08]); }
      const sp = nb > 1 ? (rTip - r0) / (nb - 1) : rhoB; bb.forEach((q, j) => q.push(j === nb - 1 ? 1.25 : Math.max(1, .55 * sp / q[1])));
      /* a bead over the pale panel is a round dark spot, smaller and separate from its neighbors; over the dark
         panel it stays a long bright capsule. Paleness is the panel tone under the bead's center */
      bb.forEach((q, j) => { const bx = cx + Math.cos(a) * q[0], by = cy + Math.sin(a) * q[0], pale = j === nb - 1 ? 0 : sstep(.55, .78, lightT(bx, by)[0]); q[1] *= 1 - .12 * pale; q.push(pale); });
      lobes.push({ a, beads: bb, tip: rTip + rhoB * .55, cap: rhoB * P.cap });
    }
    const wrap = d => { d = (d + Math.PI) % TAU; if (d < 0) d += TAU; return d - Math.PI; };
    /* ---- sample the field once per dither cell ---- */
    const cell = Math.max(.5, P.cell * u), gw = Math.ceil(W / cell), gh = Math.ceil(H / cell), NC = gw * gh;
    const FT = new Float32Array(NC), FW = new Float32Array(NC), FS = new Float32Array(NC), FG = new Float32Array(NC);
    const blur = Math.max(.5 * u, P.blur * u), tw = P.twist, spill = P.spill, halo = P.halo, dd = P.dark;
    const zig = P.petals / TAU;
    /* every layer works on three numbers per cell: tone T, warmth Wm, saturation S; color comes last, so a soft
       edge between a white capsule and the black ground passes through violet the way the reference's rims do */
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      const X = (gx + .5) * cell, Y = (gy + .5) * cell, i = gy * gw + gx;
      /* ground: inside the panel the light; outside, the beveled halo (Chebyshev distance gives mitered corners) */
      const ex = Math.max(x0 - X, X - x1), ey = Math.max(y0 - Y, Y - y1), e = Math.max(ex, ey), inside = e <= 0;
      let T, Wm, S;
      if (inside) { const L = lightT(X, Y); T = Math.min(1 - .2 * L[1], L[0]); Wm = L[1] * sstep(.4, .7, L[0]); S = .6 + .4 * sstep(.75, .3, L[0]); }
      else {
        const L = lightT(clamp(X, x0, x1), clamp(Y, y0, y1)), side = ex > ey ? (X < x0 ? .92 : .8) : (Y < y0 ? 1 : .86), b = e / bev;
        T = b < 1 ? halo * side * (.42 + .53 * sstep(0, .7, L[0])) * Math.pow(1 - b, 1.15) : 0; Wm = sstep(-.05, .55, L[2]) * wm * sstep(.55, .85, L[0]); S = 1;
      }
      const Tg = T, dim = .1 + .9 * sstep(-1, -.1, ((X - cx) * lx + (Y - cy) * ly) / R0 * fo);
      /* polar position, warped by the twist */
      const dx = X - cx, dy = Y - cy, r = Math.hypot(dx, dy), th = Math.atan2(dy, dx) - tw * r / R0;
      const kk = Math.round(wrap(th - base) / dA);
      /* the capsules: a lobe turns the ground over. On the pale ground it prints lilac and indigo, on the dark
         ground lilac and white; each bead's core pushes further than its rim (bead depth). The outer bead's cap
         is pale yellow with a hard inner arc */
      for (let q = -1; q <= 1; q++) {
        const B = lobes[((kk + q) % N + N) % N], dt = wrap(th - B.a), al = r * Math.cos(dt), ac = Math.abs(r * Math.sin(dt));
        if (ac > wOut * 2.6 || al < 0) continue;
        for (let j = 0; j < B.beads.length; j++) {
          const bd = B.beads[j], last = j === B.beads.length - 1, ea = (al - bd[0]) / bd[3], dq = Math.hypot(ea, ac), bl = blur * (last ? 1 : .8) * (.45 + .55 * sstep(.05, .5, Tg));
          if (dq > Math.max(bd[1] + 2 * bl, bd[1] * 1.9)) continue;
          let a = sstep(bl, -bl, dq - bd[1]) * sstep(rA * .9, rA * 1.9, r); if (!inside) a *= spill;
          const pw = bd[4];
          if (pw > 0) {   /* the dark bead: a gaussian spot, sigma 0.62 of its radius, indigo at the core; the ground keeps its warmth */
            const sg = bd[1] * .72, g = Math.exp(-dq * dq / (2 * sg * sg)) * sstep(rA * .9, rA * 1.9, r) * (inside ? 1 : spill), tcore = clamp(.26 - .08 * dd + bd[2], .06, .5);
            T += (tcore - T) * g * pw; Wm *= 1 - Math.min(1, 6 * g) * pw; S += (1 - S) * Math.min(1, 6 * g) * pw;
          }
          if (pw >= 1) continue;
          const core = sstep(bd[1] * .75, 0, dq), tl = clamp(.8 * dim + bd[2], .14, .95), tc = clamp(tl + (tl - Tg) * .3 * dd * core, 0, 1), ap = a * (1 - pw);
          if (last && Math.hypot(al - B.tip, ac) < B.cap) { T += (.84 - T) * a; Wm += (1 - Wm) * a; S += (1 - S) * a; }
          else { T += (tc - T) * ap; Wm *= 1 - ap; S += (.95 - .1 * core - S) * ap; }
        }
      }
      /* the center: a dark collar, a lilac disc, a zigzag of yellow teeth, a black hole */
      if (r < ring * 2.2) {
        const dk = .55 * sstep(ring * 1.6, ring * 1.02, r); if (T > .22) T += (.22 - T) * dk; Wm *= 1 - dk; S += (1 - S) * dk;
        const ph = (Math.atan2(dy, dx) - base) * zig, tri = Math.abs(ph - Math.floor(ph) - .5) * 2, zdp = Math.min(.45, 3.4 / P.petals), zr = ring * (1 - zdp + zdp * tri), bw = ring * .09;
        if (r < zr + bw) { T = .56; Wm = 0; S = 1; }
        if (r > zr - bw * 2 && r < zr + bw * .8) { T = 1; Wm = 1; }
        if (r < ring * .36) { T = 0; Wm = 0; }
      }
      FT[i] = clamp(T, 0, 1); FW[i] = clamp(Wm * (inside ? sstep(.6, .78, T) : 1), 0, 1); FS[i] = clamp(S, 0, 1); FG[i] = Math.min(T, Tg + .3);
    }
    /* ---- the dither, checker first. Every cell belongs to one phase of the diagonal checker. The light phase
       prints the field tone raised by h, the dark phase the tone lowered by h (h = depth × min(T − 0.1, 1 − T)),
       never below the rung under T, so mid-tones are a two-ink checker of neighboring inks. Ladders: warm (black,
       olive, yellow) only where the panel is pale, saturated (black, indigo, lilac, white) almost everywhere else,
       gray (black, indigo, white) where saturation is low. Rung breaks and ladder picks use a 4 × 4 ordered
       threshold laid on the checker's own diagonal lattice, so breaks spread evenly with no row pattern; the field
       itself carries no noise ---- */
    const gr = P.grain, dpt = P.depth, sd = P.seed * 7 + 1, OB = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const LAD = [[[0, 0], [.35, 5], [1, 4]], [[0, 0], [.1, 1], [1, 3]], [[0, 0], [.1, 1], [.6, 2], [1, 3]]];
    const quant = (L, t, n) => { let k = 0; while (k < L.length - 2 && t > L[k + 1][0]) k++; return n < (t - L[k][0]) / (L[k + 1][0] - L[k][0]) ? L[k + 1][1] : L[k][1]; };
    const pick = new Uint8Array(NC);
    for (let gy = 0, i = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++, i++) {
      /* thresholds live on the checker's own diagonal lattice (a, b), so break cells spread evenly along the diagonals */
      const la = (gx + gy) >> 1, lb = (gx - gy) >> 1, ord = k => (OB[((la + k) & 3) * 4 + ((lb + 3 * k) & 3)] + .5) / 16, jt = hashI(gx, gy, sd) - .5;
      const L = FW[i] > ord(1) ? LAD[0] : FS[i] > .1 + .3 * ord(2) ? LAD[2] : LAD[1];
      const T = FT[i], h = dpt * Math.min(Math.max(0, T - .1), 1 - T), flip = hashI(gx, gy, sd + 4) < gr * .5, ph = ((gx + gy) & 1) ^ (flip ? 1 : 0);
      const fl = L === LAD[0] ? .35 * sstep(.4, .6, T) : .1, lo = Math.max(T - h, Math.min(T, fl)), hi = T + h * sstep(.04, .2, T);
      pick[i] = quant(L, clamp(ph ? hi : lo, 0, 1), clamp(ord(0) + jt * .12, 0, 1));
    }
    /* ---- print: the dither is one ink per cell; the sheet is that cell grid enlarged to the page. Enlarge 0 keeps
       square cells, 1 interpolates linearly between cell centers the way the reference's 2.21x enlargement does.
       One-pixel white dust lands on the bare black after enlargement ---- */
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, dust = P.dust * .0065, en = clamp(P.enlarge, 0, 1);
    const fx0 = new Int32Array(W), fx1 = new Int32Array(W), ftx = new Float32Array(W), nx = new Int32Array(W);
    for (let x = 0; x < W; x++) { const f = (x + .5) / cell - .5, i0 = Math.floor(f); fx0[x] = clamp(i0, 0, gw - 1); fx1[x] = clamp(i0 + 1, 0, gw - 1); ftx[x] = f - i0; nx[x] = Math.min(gw - 1, Math.floor(x / cell)); }
    for (let y = 0; y < H; y++) {
      const f = (y + .5) / cell - .5, j0 = Math.floor(f), ty = f - j0, r0 = clamp(j0, 0, gh - 1) * gw, r1 = clamp(j0 + 1, 0, gh - 1) * gw, rn = Math.min(gh - 1, Math.floor(y / cell)) * gw;
      for (let x = 0; x < W; x++) {
        const ci = rn + nx[x], j = (y * W + x) * 4, tx = ftx[x];
        const A = INK[pick[r0 + fx0[x]]], B = INK[pick[r0 + fx1[x]]], Cc = INK[pick[r1 + fx0[x]]], D = INK[pick[r1 + fx1[x]]], Nn = INK[pick[ci]];
        let r = 0, g = 0, b = 0;
        for (let c = 0; c < 3; c++) { const lin = (A[c] * (1 - tx) + B[c] * tx) * (1 - ty) + (Cc[c] * (1 - tx) + D[c] * tx) * ty, v = Nn[c] + (lin - Nn[c]) * en; c === 0 ? r = v : c === 1 ? g = v : b = v; }
        if (pick[ci] === 0 && dust > 0 && FG[ci] < .2 && hashI(x, y, P.seed + 5) < dust * (1 - FG[ci] * 5)) { const q = INK[2], m = .2 + .6 * hashI(x, y, P.seed + 6); r += (q[0] - r) * m; g += (q[1] - g) * m; b += (q[2] - b) * m; }
        d[j] = r; d[j + 1] = g; d[j + 2] = b; d[j + 3] = 255;
      }
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p19", no: "19", title: "Radial Dither Bloom", ref: REF, render,
    line: "A light field of a beveled panel, bead-chain capsules and a corner light, sampled once per 2.21 px cell and printed as a diagonal checker of two neighboring inks.",
    params: [
      { key: "cell", label: "Dither cell", min: 1, max: 6, step: .01, def: 2.21, unit: "px", group: "Dither", why: "Size of one dither cell. The reference's checkerboard peaks at 0.227 cycles per px, a 2.21 px cell." },
      { key: "depth", label: "Checker depth", min: 0, max: 2, step: .01, def: 1.3, unit: "×", group: "Dither", why: "How far apart the two checker phases print: 0 posterizes each cell to its nearest ink, 1.3 splits mid-tones into a full checker of neighboring inks." },
      { key: "grain", label: "Phase breaks", min: 0, max: 1, step: .01, def: 0.005, unit: "", group: "Dither", why: "Share of cells that swap checker phase. 0.005 keeps the diagonal checker nearly exact; 1 is a random dither." },
      { key: "enlarge", label: "Enlarge", min: 0, max: 1, step: .01, def: 0.8, unit: "", group: "Dither", why: "How the cell grid is enlarged to the page. 0 keeps hard square cells; 1 interpolates linearly between cell centers, as the reference file does." },
      { key: "dust", label: "Dust", min: 0, max: 10, step: .01, def: 2, unit: "×", group: "Dither", why: "One-pixel light specks on the bare black, 0.65 % of pixels per unit; the reference's black corner carries about 1.3 %." },
      { key: "light", label: "Light angle", min: 120, max: 330, step: 1, def: 230, unit: "°", group: "Light", why: "Where the light sits around the center. 225 is the upper left corner, 270 straight up." },
      { key: "falloff", label: "Falloff", min: .3, max: 2.5, step: .01, def: 1.2, unit: "×", group: "Light", why: "How fast the panel falls from pale to black across the sheet." },
      { key: "warm", label: "Warm light", min: 0, max: 1.5, step: .01, def: 1.1, unit: "×", group: "Light", why: "How much of the lit corner turns pale yellow instead of white and lilac." },
      { key: "rays", label: "Rays", min: 3, max: 36, step: 1, def: 17, unit: "", group: "Rays", why: "Capsules around the center; the reference carries about 17." },
      { key: "beads", label: "Beads", min: 1, max: 7, step: 1, def: 4, unit: "", group: "Rays", why: "Beads chained along each capsule, growing outward; the last carries the cap." },
      { key: "dark", label: "Bead depth", min: 0, max: 3.5, step: .01, def: 2.2, unit: "×", group: "Rays", why: "How far each bead's core pushes past its rim: darker on the pale ground, whiter on the dark. 0 makes smooth capsules." },
      { key: "size", label: "Lobe width", min: .4, max: 2, step: .01, def: 1, unit: "×", group: "Rays", why: "Width of capsules and beads; a capsule's outer end is 62 px across at 1." },
      { key: "reach", label: "Reach", min: .5, max: 1.4, step: .01, def: 1.08, unit: "×", group: "Rays", why: "Capsule length as a share of the distance to the panel edge. Above 1 the caps spill onto the bevel." },
      { key: "blur", label: "Lobe softness", min: 1, max: 40, step: .5, def: 20.5, unit: "px", group: "Rays", why: "Half width of a capsule's soft edge. The yellow cap's inner arc stays hard." },
      { key: "cap", label: "Cap size", min: 0, max: 1.6, step: .01, def: 1.15, unit: "×", group: "Rays", why: "Radius of the hard yellow cap at each capsule tip, as a share of the tip radius." },
      { key: "spill", label: "Spill", min: 0, max: 1, step: .01, def: 0.9, unit: "", group: "Rays", why: "Opacity of a capsule where it leaves the panel. Below 1 the panel edge draws a hard line across every cap." },
      { key: "twist", label: "Twist", min: -2, max: 2, step: .01, def: 0, unit: "rad", group: "Rays", why: "Spiral turn of the rays with radius." },
      { key: "spin", label: "Spin", min: 0, max: 90, step: .5, def: 14, unit: "°", group: "Rays", why: "Rotation of the ray set and the teeth." },
      { key: "scatter", label: "Scatter", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Rays", why: "Random spread in each ray's angle, length, waist and bead size." },
      { key: "ring", label: "Ring radius", min: 15, max: 110, step: .5, def: 48, unit: "px", group: "Center", why: "Outer radius of the tooth ring; the hole is 0.36 of it." },
      { key: "petals", label: "Teeth", min: 3, max: 40, step: 1, def: 12, unit: "", group: "Center", why: "Yellow teeth in the zigzag ring; fewer teeth cut deeper, to a depth of 3.4 / teeth of the ring radius (0.28 at 12, at most 0.45)." },
      { key: "frame", label: "Panel inset", min: 20, max: 140, step: .5, def: 57, unit: "px", group: "Panel", why: "Distance from the sheet edge to the panel edge, 55 to 68 px on the reference." },
      { key: "bevel", label: "Halo width", min: 4, max: 120, step: .5, def: 50, unit: "px", group: "Panel", why: "Length of the halo ramp from the panel edge out to black." },
      { key: "halo", label: "Halo light", min: 0, max: 1.6, step: .01, def: 0.92, unit: "×", group: "Panel", why: "Brightness of the halo at the panel edge." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 2, unit: "", group: "Panel", why: "Re-rolls ray angles, lengths, waists, beads, threshold noise and dust." }
    ],
    motion: [{ key: "light", amp: 40, period: 14, mode: "sine" }, { key: "spin", amp: 4, period: 22, mode: "sine" }],
    live: { x: { key: "light", min: 150, max: 300 }, y: { key: "falloff", min: .5, max: 2 } },
    presets: [
      { name: "Hard posterize", set: { depth: .15, grain: 0 } },
      { name: "Noise dither", set: { grain: 1, depth: 1 } },
      { name: "Spiral", set: { twist: 1.2, rays: 18, beads: 5, size: .8 } },
      { name: "Coarse cell", set: { cell: 4.4, blur: 26 } },
      { name: "Top light", set: { light: 285, warm: .5, falloff: 1.5 } },
      { name: "Square cells", set: { enlarge: 0, cell: 3 } }
    ],
    palettes: [
      { id: "measured", name: "Indigo bloom", note: "measured", c: { k: [4, 3, 12], i: [18, 12, 96], v: [176, 171, 246], w: [246, 244, 255], y: [244, 246, 194], o: [184, 185, 140] }, sw: ["#04030c", "#120c60", "#b0abf6", "#f6f4ff", "#f4f6c2"] },
      { id: "teal", name: "Teal night", c: { k: [3, 10, 12], i: [6, 62, 74], v: [120, 214, 220], w: [238, 252, 250], y: [216, 246, 120] }, sw: ["#030a0c", "#063e4a", "#78d6dc", "#eefcfa", "#d8f678"] },
      { id: "graphite", name: "Graphite", c: { k: [0, 0, 0], i: [50, 50, 54], v: [168, 168, 176], w: [250, 250, 250], y: [206, 224, 242] }, sw: ["#000000", "#323236", "#a8a8b0", "#fafafa", "#cee0f2"] },
      { id: "acid", name: "Acid", c: { k: [6, 8, 4], i: [20, 74, 34], v: [150, 228, 120], w: [242, 255, 240], y: [250, 255, 80] }, sw: ["#060804", "#144a22", "#96e478", "#f2fff0", "#faff50"] },
      { id: "magenta", name: "Magenta", c: { k: [12, 2, 16], i: [80, 10, 88], v: [242, 142, 212], w: [255, 244, 252], y: [255, 214, 110] }, sw: ["#0c0210", "#500a58", "#f28ed4", "#fff4fc", "#ffd66e"] },
      { id: "cobalt", name: "Cobalt and orange", c: { k: [6, 8, 22], i: [20, 34, 142], v: [140, 176, 250], w: [240, 248, 255], y: [255, 170, 64] }, sw: ["#060816", "#14228e", "#8cb0fa", "#f0f8ff", "#ffaa40"] }
    ],
    bench: { palette: "measured", params: {}, note: "The rays are generated, so the bead chain, bright lobe, panel field and dark ground rects were re-picked after the rebuild and again after the checker-first dither and the dark-bead rebuild (panel field picked on autocorrelation in the mid-tone zone), with search.py's window scan, each restricted to the matching zone of the render (bead chain in the lit upper half, lobe and dark ground in the lower right). The bevel corner and the whole plate compare in place.", items: [
      { name: "bead chain", ref: [180, 96, 128, 128], out: [264, 60, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 4, inks: [[4, 3, 12], [18, 12, 96], [246, 244, 255], [244, 246, 194]], inkNames: ["black", "indigo", "white", "yellow"] },
      { name: "bright lobe", ref: [540, 680, 96, 128], out: [276, 652, 96, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 4, inks: [[4, 3, 12], [18, 12, 96], [176, 171, 246], [246, 244, 255], [244, 246, 194]], inkNames: ["black", "indigo", "lilac", "white", "yellow"] },
      { name: "panel field", ref: [440, 320, 128, 96], out: [168, 348, 128, 96], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 4, inks: [[4, 3, 12], [18, 12, 96], [176, 171, 246], [246, 244, 255]], inkNames: ["black", "indigo", "lilac", "white"] },
      { name: "bevel corner", ref: [0, 0, 128, 128], out: [0, 0, 128, 128], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[4, 3, 12], [18, 12, 96], [246, 244, 255], [244, 246, 194]], inkNames: ["black", "indigo", "white", "yellow"] },
      { name: "dark ground", ref: [600, 690, 96, 96], out: [456, 748, 96, 96], m: ["hist", "mean", "std", "ink", "share"], inks: [[4, 3, 12], [18, 12, 96], [176, 171, 246], [246, 244, 255]], inkNames: ["black", "indigo", "lilac", "white"] },
      { name: "whole plate", ref: [0, 0, 735, 920], out: [0, 0, 735, 920], m: ["hist", "mean", "ink", "share"], inks: [[4, 3, 12], [18, 12, 96], [176, 171, 246], [246, 244, 255], [244, 246, 194]], inkNames: ["black", "indigo", "lilac", "white", "yellow"] }
    ] },
    passes: [
      "light field per dither cell: a radial light from the upper left corner (tone falls with distance, warm only where it is bright), a square panel inset 55 to 68 px, a halo that ramps from the panel edge to black over 50 px with mitered corners",
      "capsules: 17 rays, each a chain of four overlapping beads growing outward. A bead over the pale panel is a smooth gaussian dark spot (sigma 0.72 of its radius, indigo at the core, cool and saturated); over the dark panel it is a soft bright capsule, white in the core. Neither carries noise",
      "caps: the outer bead ends in a pale yellow disc with a hard inner arc that spills past the panel at 0.9 opacity",
      "center: a dark collar, a lilac disc, a zigzag of 12 yellow teeth, a black hole at 0.36 of the ring radius",
      "dither, checker first: each cell belongs to one phase of the diagonal checker; the light phase quantizes T + h and the dark phase T − h, floored at the rung under T, along a warm, saturated or gray ladder; rung breaks and ladder picks use a 4 × 4 ordered threshold on the checker's diagonal lattice; phase breaks 0.005",
      "print: the 2.21 px cell grid is enlarged to the page with 0.8 linear interpolation between cell centers; one-pixel lilac dust lands on the bare black"
    ],
    measured: {
      dither_cell_px: { value: 2.21, method: "grid search over cell size and phase for the largest neighbor contrast at cell centers; 2-D FFT peaks at 0.227 cycles per px on both diagonals (3.12 px) in four patches" },
      inks_per_cell_kmeans7: { black: [4, 4, 12, .195], indigo: [16, 13, 83, .17], lilac: [172, 168, 239, .083], white: [242, 239, 242, .232], yellow: [187, 188, 154, .077], note: "two more clusters at [66, 62, 108] and [115, 112, 150] are interpolated mixes between cells, not inks" },
      yellow_p90: { value: [248, 248, 198], method: "90th percentile of warm pixels (B below R by 15) in the top left bevel" },
      panel_inset_px: { left: 55, top: 63, right: 59, bottom: 68, method: "end of the halo ramp on 9 px box-filtered luminance profiles across each edge" },
      halo_ramp_px: { value: 50, method: "panel edge to black on the same profiles" },
      quadrant_mean_L: { tl: 163, tr: 130, bl: 103, br: 69 },
      dust_on_black: { components_per_100px2: .65, median_area_px: 2, method: "components above L 40 in a 100 × 80 px black patch" },
      checker_phase: { method: "cells of the pale ground thresholded 25 levels under their median: dark cells sit on one diagonal phase only (P of a dark axis neighbor 0.00 to 0.01, of a dark diagonal neighbor 0.77 to 0.84), 39 to 41 % of all cells", olive_ink: [184, 185, 140], olive_method: "median of local minima in two pale-ground patches; p10 [162, 163, 117]" },
      cell_softness: { method: "AC at lag 1 to 4 against nearest, bilinear and cubic enlargements of an ideal ordered dither of the blurred reference", result: "lag-1 AC 0.31 in the panel patch sits between nearest (0.43) and bilinear (0.79) after a 2.21x enlargement; the render's enlarge 0.8 is the bench optimum" }
    },
    limits: [
      "Bench mean 0.913, under 98 %. The lowest metric is the dark ground contrast (0.66): the render's black between lobes is cleaner than the reference's (σ 10.8 against 16.3), which carries JPEG ringing off the lobe edges. Panel field contrast scores 0.75 (enlarged cells average toward the mean); enlarge 0.65 lifts it to 0.87 and the mean to 0.917, but the brief keeps the measured 0.8.",
      "The bevel corner's indigo class scores 0.82: the reference's top bevel dark cells are olive-black, and the render's bevel still mixes in indigo where the halo cools toward the sides.",
      "The rays are generated, not traced. Searched windows compare a lobe of the render with a lobe of the reference, not the same lobe, so tone shares differ with where each lobe sits under the light.",
      "Cell edges at 3 to 5x are soft by design (enlarge 0.8) because the reference's are; enlarge 0 gives hard square cells.",
      "The bead chain tone histogram scores 0.76: the reference's pale ground is JPEG-softened into a continuous spread between yellow and olive that the render's enlarge only partly makes.",
      "The lower right quarter averages 74 against the reference's 69; the dark ground patch itself scores 0.96 on its mean (5.8 against 5.5)."
    ],
    source: "Reference 19: dithered radial bloom in indigo, lilac and pale yellow, 735 × 920 px JPEG.",
    study: {
      slug: "radial-dither-bloom", lede: "A lit panel, 17 bead-chain capsules and a ring of yellow teeth, sampled once per 2.21 px cell and printed as a diagonal checker of six inks.",
      body: ["The reference is a soft picture reduced to six inks: black, indigo, lilac, white, a pale yellow and an olive. Its cells measure 2.21 px, and the print is a diagonal checker: FFT peaks at 3.12 px on both diagonals, and on the pale ground every dark cell sits on one phase (no dark axis neighbors, 77 to 84 % dark diagonal neighbors). A square panel sits inset 55 to 68 px inside a black frame, and a halo ramps from the panel edge to black over 50 px with mitered corners. A light from the upper left falls across the panel: mean luminance runs 163, 130, 103 and 69 by quadrant. The same capsules read as smooth dark indigo beads on the pale ground and as white-cored lilac lobes on the dark ground. Their yellow caps spill past the panel edge.", "The rebuild computes one light field per cell: the panel, the halo, the corner light, then the capsules and the center ring on top. A capsule is a chain of four soft beads: over the pale panel each bead is a gaussian dark spot, over the dark panel a bright capsule. The field carries no noise; all texture is the checker. Each cell then picks an ink ladder by warmth and saturation. The light phase of the checker prints the tone raised by h, the dark phase the tone lowered by h, and an ordered threshold on the checker's diagonal lattice places the cells that break to the next ink, so mid-tones print a clean checker with no row pattern. The cell grid is enlarged to the page with 0.8 linear interpolation, as the reference's was. Dither cell, checker depth, enlarge and phase breaks set the print. Light angle and falloff set the field. Rays, beads, bead depth and cap size set the capsules."],
      method: "Light field per 2.21 px cell · bead-chain capsules · ink ladder by warmth and saturation · diagonal checker, light phase T + h, dark phase T − h, ordered breaks on the diagonal lattice · 0.8 linear enlarge",
      points: [
        { u: .5, v: .497, d: "KEY", label: "Center: 12 yellow teeth in a zigzag around a black hole 0.36 of the ring radius, on a lilac disc with a dark collar.", t: "edge", dir: [0, 0] },
        { u: .3, v: .2, d: "KEY", label: "Bead chain on the pale ground: the dark phase prints indigo and the light phase lilac, inside a yellow and olive checker.", t: "tone", dir: [-1, -1] },
        { u: .7, v: .66, d: "KEY", label: "The same chain on the dark ground: indigo and lilac at the rim, a checker of white and lilac in the core.", t: "tone", dir: [1, 1] },
        { u: .44, v: .06, d: "READ", label: "Yellow cap spilling past the panel edge onto the bevel at 0.9 opacity, olive cells where it thins.", t: "edge", dir: [0, -1] },
        { u: .04, v: .04, d: "READ", label: "Bevel corner: the halo ramps to black over 50 px through olive and indigo cells, the miter at 45 degrees.", t: "edge", dir: [-1, -1] },
        { u: .96, v: .5, d: "READ", label: "Right bevel: indigo, darker than the top bevel by the side factor 0.8, thinning to black at the sheet edge.", t: "edge", dir: [1, 0] },
        { u: .2, v: .13, d: "READ", label: "At 4x: the pale ground is a diagonal checker of yellow and olive, the olive phase broken to yellow on an ordered lattice, 2.21 px per cell.", t: "grain", dir: [0, 0] },
        { u: .62, v: .8, d: "READ", label: "Dark ground between lobes: 98 % black, indigo cells only at the lobe rims.", t: "grain", dir: [1, 1] },
        { u: .66, v: .9, d: "READ", label: "Dust on the bare black: one-pixel lilac specks, about 1.3 % of pixels at dust 2.", t: "grain", dir: [1, 1] },
        { u: .25, v: .58, d: "READ", label: "Capsule on the mid ground: indigo on the dark phase, lilac and olive on the light phase.", t: "tone", dir: [-1, 1] }
      ]
    }
  });
})();
