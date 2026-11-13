/* ===== PLATE 05 · CHARTED STITCH =====
   a cross-stitch chart printed in three passes: a hand-ruled black grid, a yellow plate and a blue plate.
   The motif is a plant grown by a seeded cellular rule on the chart's cell lattice; the blue plate is a dot
   screen (holes of paper in a rotated lattice) and sits 3-6 px off the yellow, so every leaf carries a yellow
   fringe on one side and a blue fringe on the other. The grid is knocked out under the motif with a paper halo. */
(function () {
  const REF = { w: 736, h: 980 };
  /* ---- motif: a plant on the cell lattice. 0 empty · 1 blue · 2 green (yellow+blue) · 3 light blue ---- */
  function grow(cols, rows, P, rnd) {
    const C = new Uint8Array(cols * rows), get = (x, y) => (x < 0 || y < 0 || x >= cols || y >= rows) ? 0 : C[y * cols + x], set = (x, y, v) => { if (x >= 0 && y >= 0 && x < cols && y < rows) C[y * cols + x] = v; };
    const r0 = rows - 2, span = Math.max(3, Math.round(P.height * (rows - 4))), r1 = Math.max(2, r0 - span);
    /* stem: climbs, drifts a cell now and then, two cells wide for the lower part */
    const sx = new Int16Array(rows); let x = Math.round(cols * (.44 + rnd() * .12)); const thick = r0 - Math.round(span * .55);
    for (let y = r0; y >= r1; y--) { if (y < r0 - 1 && rnd() < .16) { const d = rnd() < .5 ? -1 : 1; set(x, y, 2); x = clamp(x + d, 2, cols - 3); } sx[y] = x; set(x, y, 2); if (y > thick) set(x + 1, y, 2); }
    /* leaves: stepped runs off alternating sides, two cells thick, rising as they go out */
    const nl = Math.round(P.leaves);
    const tips = [];
    for (let k = 0; k < nl; k++) {
      const yl = r0 - 1 - Math.round((k + 1) / (nl + 1) * (r0 - r1) * .92), side = (k % 2 ? -1 : 1) * (rnd() < .12 ? -1 : 1), len = 2 + Math.floor(rnd() * 3), rise = rnd() < .5 ? 2 : 3;
      let bx = sx[yl] + (side > 0 && yl > thick ? 1 : 0), by = yl;
      for (let j = 1; j <= len; j++) { const cx = bx + side * j, cy = by - Math.floor(j / rise); set(cx, cy, 2); set(cx, cy - 1, 2); if (j === len) { set(cx + side, cy - 1, 2); tips.push([cx + side, cy - 2]); } }
    }
    /* blooms: a seeded cross, then two rounds of a cellular rule (fill a cell with 3+ filled neighbors, drop loose corners) */
    const bloom = (cx, cy, R, v) => {
      const cells = new Set(), key = (a, b) => a + "," + b;
      for (let i = -R; i <= R; i++) { cells.add(key(cx + i, cy)); cells.add(key(cx, cy + i)); }
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) cells.add(key(cx + i, cy + j));
      for (let it = 0; it < 2; it++) {
        const add = [], del = [];
        for (let i = -R - 1; i <= R + 1; i++) for (let j = -R - 1; j <= R + 1; j++) {
          let n = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && cells.has(key(cx + i + a, cy + j + b))) n++;
          const has = cells.has(key(cx + i, cy + j));
          if (!has && n >= 3 && rnd() < .7) add.push(key(cx + i, cy + j));
          if (has && n <= 2 && rnd() < .5 && (i || j)) del.push(key(cx + i, cy + j));
        }
        add.forEach(k => cells.add(k)); del.forEach(k => cells.delete(k));
      }
      /* a notch at the foot (the calyx) and a bud on top */
      cells.delete(key(cx, cy + R)); if (rnd() < .7) { const bx = cx + (rnd() < .5 ? -1 : 1); let by = cy - R - 1; while (by < cy && !cells.has(key(bx, by + 1))) by++; cells.add(key(bx, by)); }
      cells.forEach(k => { const [a, b] = k.split(",").map(Number); if (get(a, b) !== 2) set(a, b, v); });
      /* lighter stitches: one or two patches inside the bloom */
      for (let t = 0, nt = 2 + Math.round(rnd() * R); t < nt; t++) { const px = cx + Math.round((rnd() - .5) * 2 * R), py = cy + Math.round((rnd() - .5) * 2 * R); for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) if (get(px + a, py + b) === 1 && rnd() < .8) set(px + a, py + b, 3); }
    };
    const nb = Math.round(P.blooms), R = Math.max(1, Math.round(P.bloom));
    if (nb > 0) bloom(sx[r1], r1 - R - 1, R, 1);
    const far = tips.filter(([tx, ty]) => Math.abs(tx - sx[r1]) > R + 1 || ty > r1 + R + 2).sort((a, b) => a[1] - b[1]);
    for (let k = 0; k < nb - 1 && k < far.length; k++) { const [tx, ty] = far[k]; const Rk = Math.max(1, R - (k > 0 ? 1 : 0)), sd = tx > sx[r1] ? 1 : -1; set(tx, ty + 1, 2); bloom(tx + sd * (Rk - 1), ty - Rk, Rk, 1); }
    return C;
  }
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 7919 + 5), nA = vnoise(P.seed + 11), nB = vnoise(P.seed + 53), nC = vnoise(P.seed + 97);
    const pitch = P.pitch * u, gx0 = (20 * u) % pitch, gy0 = (18 * u) % pitch;                /* grid lines x = gx0 + i·pitch */
    const ox = gx0 + P.register * pitch, oy = gy0 + ((P.register * pitch - 10 * u) % pitch + pitch) % pitch;  /* motif lattice origin */
    const cols = Math.floor((W - ox) / pitch), rows = Math.floor((H - oy) / pitch);
    const cells = grow(cols, rows, P, rnd);
    /* ---- plates as masks: yellow (green cells), blue (every cell, shifted), halo (every cell grown) ---- */
    const dx = P.dx * u, dy = P.dy * u, halo = P.halo * u;
    const Y = mk(W, H), gy = Y.getContext("2d"), Bc = mk(W, H), gb = Bc.getContext("2d"), Hc = mk(W, H), gh = Hc.getContext("2d"), Lc = mk(W, H), gl = Lc.getContext("2d");
    gy.fillStyle = gb.fillStyle = gh.fillStyle = gl.fillStyle = "#000"; gy.fillRect(0, 0, W, H); gb.fillRect(0, 0, W, H); gh.fillRect(0, 0, W, H); gl.fillRect(0, 0, W, H);
    gy.fillStyle = gb.fillStyle = gh.fillStyle = gl.fillStyle = "#fff";
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const v = cells[j * cols + i]; if (!v) continue;
      const x = ox + i * pitch, y = oy + j * pitch;
      if (v === 2) { gy.fillRect(x, y, pitch, pitch); gh.fillRect(x - halo, y - halo, pitch + 2 * halo, pitch + 2 * halo); }
      gb.fillRect(x + dx, y + dy, pitch, pitch); gh.fillRect(x + dx - halo, y + dy - halo, pitch + 2 * halo, pitch + 2 * halo);
      if (v === 3) { gl.fillRect(x + dx, y + dy, pitch, pitch); }
    }
    const soft = Math.max(.05, P.soft * u);
    const My = gblur(chan(gy, W, H, 0), W, H, soft), Mb = gblur(chan(gb, W, H, 0), W, H, soft), Mh = chan(gh, W, H, 0), Ml = gblur(chan(gl, W, H, 0), W, H, 4 * u);
    /* ---- the ruled grid: per-line 1-D profiles (wobble, half width, darkness with breaks), read per pixel ---- */
    const nv = Math.ceil((W - gx0) / pitch) + 1, nh = Math.ceil((H - gy0) / pitch) + 1, bthr = .11 * P.breaks;
    const prof = (n, len, seedOff) => { const off = [], hw = [], dk = []; for (let i = 0; i < n; i++) { const o = new Float32Array(len), w = new Float32Array(len), d = new Float32Array(len), base = (.95 + rnd() * .45) * (seedOff ? 1.06 : .92), tone = (.88 + rnd() * .17) * (seedOff ? 1 : .94); for (let t = 0; t < len; t++) { o[t] = (fbm(nA, t / (150 * u), i * 5.7 + seedOff, 2) - .5) * 2.6 * u * P.wobble; w[t] = (1.05 + .6 * (nB(t / (38 * u), i * 2.1 + seedOff + 50) - .5)) * base * u * P.weight; const br = nC(t / (6 * u), i * 3.3 + seedOff + 200), gate = sstep(bthr * (seedOff ? .8 : 1.2), bthr * (seedOff ? .8 : 1.2) + .03, br); d[t] = Math.min(1, tone * (.85 + .6 * (nA(t / (26 * u), i * 4.4 + seedOff + 300) - .5))) * gate; } off.push(o); hw.push(w); dk.push(d); } return { off, hw, dk }; };
    const V = prof(nv, H, 0), Hh = prof(nh, W, 1000);
    /* ---- screens: three alpha fields (yellow, blue, black), then ink spread, then compose ---- */
    const sp = P.screen * u, th = P.angle * Math.PI / 180, ca = Math.cos(th) / sp, sa = Math.sin(th) / sp;
    const cover = P.cover, ycov = P.yCover, ld = P.ld ?? .15, eps = P.eps, pool = P.pooling, gridTone = P.gridTone ?? 1, leaf = P.leafTint, unev = P.uneven, fill = P.fill ?? .06, SQ = 1 / Math.sqrt(Math.PI);
    /* slow and mid-scale drift of coverage, and the paper fiber, computed at half resolution and resampled */
    const hw = Math.ceil(W / 2), hh = Math.ceil(H / 2), Dl = new Float32Array(hw * hh), Fl = new Float32Array(hw * hh);
    for (let y = 0; y < hh; y++) for (let x = 0; x < hw; x++) { const X = x * 2 + 1, Yy = y * 2 + 1, i = y * hw + x; Dl[i] = .04 * (fbm(nB, X / (30 * u), Yy / (30 * u) + 400, 2) - .5) * 2 + .08 * (nC(X / (9 * u), Yy / (9 * u) + 700) - .5) * 2; Fl[i] = (nA(X / (6 * u), Yy / (6 * u) + 900) - .5) * 9; }
    const Df = upsampleCR(Dl, hw, hh, W, H), Ff = upsampleCR(Fl, hw, hh, W, H);
    const Ay = new Float32Array(W * H), Ab = new Float32Array(W * H), Ak = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      const o = y * W;
      for (let x = 0; x < W; x++) {
        const i = o + x;
        const my = My[i], mb = Mb[i];
        if (my > .003 || mb > .003) {
          /* one screen for both plates: a lattice of paper holes; each hole is jittered and sized by the local coverage */
          const cu = x * ca + y * sa, cvv = -x * sa + y * ca, ku = Math.round(cu), kv = Math.round(cvv), jit = .1 * unev;
          const fu = cu - ku - (hashI(ku, kv, P.seed + 21) - .5) * jit, fv = cvv - kv - (hashI(ku, kv, P.seed + 22) - .5) * jit, r = Math.sqrt(fu * fu + fv * fv) + (hashI(x, y, P.seed + 3) - .5) * .04 * (1 + unev);
          const drift = unev * (Df[i] + .16 * (hashI(ku, kv, P.seed + 23) - .5));
          if (my > .003) {
            const c = clamp((ycov + drift * .5) * my, 0, 1), rh = SQ * Math.sqrt(1 - c);
            Ay[i] = sstep(rh - eps, rh + eps, r) * .96;
          }
          if (mb > .003) {
            const ci = Math.floor((x - dx - ox) / pitch), cj = Math.floor((y - dy - oy) / pitch), cv_ = (ci >= 0 && cj >= 0 && ci < cols && cj < rows) ? cells[cj * cols + ci] : 0;
            const c = clamp((cover * (cv_ === 2 ? leaf : 1) - ld * Ml[i] + drift) * mb, 0, 1), rh = SQ * Math.sqrt(1 - c);
            const ab = sstep(rh - eps, rh + eps, r), fl = fill * mb * sstep(.2, .6, c);
            const dens = .9 * (1 + unev * (P.dh ?? .12) * (hashI(x, y, P.seed + 31) - .5) * 2 + unev * (P.dm ?? .08) * (nC(x / (2.5 * u) + 300, y / (2.5 * u)) - .5) * 2 + unev * .1 * sstep(.3, .6, r));
            Ab[i] = (ab > fl ? ab : fl) * dens;
          }
        }
        const kh = 1 - Mh[i];
        if (kh > .01) {
          const vi = Math.round((x - gx0) / pitch), hi = Math.round((y - gy0) / pitch);
          let av = 0, ah = 0, dv = 99, dh = 99;
          if (vi >= 0 && vi < nv) { dv = Math.abs(x - (gx0 + vi * pitch + V.off[vi][y])); const w = V.hw[vi][y]; av = V.dk[vi][y] * sstep(w + .7 * u, w - .4 * u, dv); }
          if (hi >= 0 && hi < nh) { dh = Math.abs(y - (gy0 + hi * pitch + Hh.off[hi][x])); const w = Hh.hw[hi][x]; ah = Hh.dk[hi][x] * sstep(w + .7 * u, w - .4 * u, dh); }
          let a = 1 - (1 - av) * (1 - ah);
          if (dv < 6 * u && dh < 6 * u) { const q = (dv * dv + dh * dh) / (2 * 2.4 * 2.4 * u * u); a = Math.min(1, a + pool * .6 * Math.exp(-q) * Math.max(V.dk[vi][y], Hh.dk[hi][x])); }
          Ak[i] = a * gridTone * kh;
        }
      }
    }
    const spread = P.spread * u, Sy = gblur(Ay, W, H, spread), Sb = gblur(Ab, W, H, spread), Sk = gblur(Ak, W, H, .35 * u);
    const paper = C.paper, black = C.black, blue = C.blue, yellow = C.yellow, green = C.green;
    const img = cv.getContext("2d").createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) {
      const o = y * W;
      for (let x = 0; x < W; x++) {
        const i = o + x, j = i * 4;
        const fib = ((hashI(x, y, P.seed) - .5) * 5 + Ff[i]) * P.fiber;
        let r = paper[0] + fib, g = paper[1] + fib, b = paper[2] + fib;
        const ay = Sy[i]; if (ay > .002) { r += (yellow[0] - r) * ay; g += (yellow[1] - g) * ay; b += (yellow[2] - b) * ay; }
        const ab = Sb[i]; if (ab > .002) { const ty = sstep(.35, .9, My[i]), tr = blue[0] + (green[0] - blue[0]) * ty, tg = blue[1] + (green[1] - blue[1]) * ty, tb = blue[2] + (green[2] - blue[2]) * ty; r += (tr - r) * ab; g += (tg - g) * ab; b += (tb - b) * ab; }
        const ak = Sk[i]; if (ak > .002) { r += (black[0] - r) * ak; g += (black[1] - g) * ak; b += (black[2] - b) * ak; }
        d[j] = r < 0 ? 0 : r > 255 ? 255 : r; d[j + 1] = g < 0 ? 0 : g > 255 ? 255 : g; d[j + 2] = b < 0 ? 0 : b > 255 ? 255 : b; d[j + 3] = 255;
      }
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p5", no: "05", title: "Charted Stitch", ref: REF, render,
    line: "A stitch chart in three passes: a hand-ruled black grid, a near-solid yellow plate, and a dot-screened blue plate printed a few pixels off the yellow, so the leaves are green with a yellow fringe on one side and a blue one on the other.",
    params: [
      { key: "pitch", label: "Cell pitch", min: 20, max: 60, step: .5, def: 35, unit: "px", group: "Grid", why: "Spacing of the ruled lines; the motif's stitches are the same size." },
      { key: "weight", label: "Line weight", min: .3, max: 2.6, step: .01, def: 1, unit: "×", group: "Grid", why: "Width of the ruled lines, 2 to 3 px at 1." },
      { key: "wobble", label: "Hand wobble", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Grid", why: "How far each line wanders off true as it is ruled." },
      { key: "breaks", label: "Breaks", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Grid", why: "How often the pen skips. 0 rules every line unbroken." },
      { key: "pooling", label: "Crossing pools", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Grid", why: "Ink pooling where two lines cross; the crossings go darker and fatter." },
      { key: "halo", label: "Knockout halo", min: 0, max: 14, step: .1, def: 5, unit: "px", group: "Grid", why: "Paper margin cut out of the grid around the motif. 0 lets the grid run under the ink." },
      { key: "cover", label: "Blue coverage", min: .3, max: .97, step: .005, def: .88, unit: "", group: "Plates", why: "Dot coverage of the blue screen. Low opens the holes into a visible lattice; high fills to a solid." },
      { key: "screen", label: "Screen pitch", min: 2.6, max: 9, step: .05, def: 4.3, unit: "px", group: "Plates", why: "Spacing of the halftone lattice." },
      { key: "angle", label: "Screen angle", min: -45, max: 45, step: .5, def: -18, unit: "°", group: "Plates", why: "Rotation of the hole lattice shared by both plates." },
      { key: "uneven", label: "Uneven inking", min: 0, max: 2.5, step: .01, def: 1.4, unit: "×", group: "Plates", why: "Slow drift of coverage across the plate plus per-dot jitter; 0 is a perfect screen." },
      { key: "soft", label: "Edge softness", min: 0, max: 4, step: .01, def: .4, unit: "px", group: "Plates", why: "Blur of the plate mask before screening, so dots thin out at every edge." },
      { key: "dx", label: "Misregister x", min: -12, max: 12, step: .5, def: 3.5, unit: "px", group: "Plates", why: "Blue plate shift to the right of the yellow; the yellow fringe appears on the left." },
      { key: "dy", label: "Misregister y", min: -12, max: 12, step: .5, def: 5.5, unit: "px", group: "Plates", why: "Blue plate shift down from the yellow; the yellow fringe appears on top." },
      { key: "leafTint", label: "Leaf tint", min: .3, max: 1, step: .005, def: .8, unit: "", group: "Plates", why: "Blue coverage over the yellow cells relative to the flowers; the leaves are a tint, so their dots sit apart on the yellow." },
      { key: "eps", label: "Hole softness", min: .02, max: .3, step: .005, def: .1, unit: "cell", group: "Plates", why: "Edge softness of each paper hole in the screen, in lattice units; high turns the lattice into a soft ripple." },
      { key: "spread", label: "Ink spread", min: 0, max: 2, step: .01, def: .7, unit: "px", group: "Plates", why: "Dot gain: every ink spreads into its neighbors, so holes go pale blue instead of paper white." },
      { key: "yCover", label: "Yellow coverage", min: .4, max: 1, step: .005, def: .83, unit: "", group: "Plates", why: "Coverage of the yellow screen; below .8 the overprint goes mottled." },
      { key: "fiber", label: "Paper fiber", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Plates", why: "Grain of the stock showing in the bare paper." },
      { key: "height", label: "Stem height", min: .25, max: 1, step: .01, def: .8, unit: "of sheet", group: "Motif", why: "How far the plant climbs the chart." },
      { key: "leaves", label: "Leaves", min: 0, max: 9, step: 1, def: 4, unit: "", group: "Motif", why: "Stepped leaves off the stem, alternating sides." },
      { key: "blooms", label: "Blooms", min: 0, max: 4, step: 1, def: 2, unit: "", group: "Motif", why: "Blue flower heads: one on the stem, the rest on leaf tips." },
      { key: "bloom", label: "Bloom size", min: 1, max: 4, step: 1, def: 3, unit: "cells", group: "Motif", why: "Radius of the seed cross the flower rule grows from." },
      { key: "register", label: "Stitch offset", min: 0, max: 1, step: .01, def: .37, unit: "cell", group: "Motif", why: "Where the stitches sit against the ruled lines. 0 fills the cells exactly." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 7, unit: "", group: "Motif", why: "Re-rolls the plant, the ruling and the inking." }
    ],
    motion: [{ key: "dx", amp: 2.5, period: 7, mode: "drift" }, { key: "dy", amp: 2.5, period: 7, mode: "drift" }, { key: "uneven", amp: .4, period: 5, mode: "sine" }],
    live: { x: { key: "dx", min: -12, max: 12 }, y: { key: "dy", min: -12, max: 12 } },
    presets: [
      { name: "Fine chart", set: { pitch: 24, weight: .7, bloom: 3, leaves: 6, height: .9, halo: 3 } },
      { name: "Off register", set: { dx: 9, dy: -8, cover: .7, uneven: 1.8 } },
      { name: "Loose press", set: { breaks: 2.4, wobble: 2.2, pooling: 2, soft: 3, uneven: 2 } },
      { name: "Clean plates", set: { breaks: 0, wobble: 0, pooling: .3, uneven: 0, soft: .4, dx: 0, dy: 0, cover: .9 } }
    ],
    palettes: [
      { id: "measured", name: "Chart blue", note: "measured", c: { paper: [250, 247, 240], black: [44, 42, 40], blue: [22, 122, 184], yellow: [236, 230, 106], green: [92, 138, 80] }, sw: ["#faf7f0", "#167ab8", "#ece66a", "#5c8a50"] },
      { id: "violets", name: "Violets", note: "inks read off the second chart (r22)", c: { paper: [248, 248, 246], black: [52, 52, 54], blue: [92, 78, 168], yellow: [236, 230, 106], green: [70, 130, 80] }, sw: ["#f8f8f6", "#5c4ea8", "#ece66a", "#468250"] },
      { id: "red", name: "Red & slate", c: { paper: [246, 247, 249], black: [40, 42, 48], blue: [210, 48, 52], yellow: [160, 178, 196], green: [118, 44, 70] }, sw: ["#f6f7f9", "#d23034", "#a0b2c4", "#762c46"] },
      { id: "night", name: "Night chart", c: { paper: [24, 28, 42], black: [150, 160, 182], blue: [96, 214, 236], yellow: [250, 214, 74], green: [214, 240, 190] }, sw: ["#181c2a", "#60d6ec", "#fad64a", "#d6f0be"] },
      { id: "teal", name: "Teal & coral", c: { paper: [247, 248, 247], black: [48, 50, 52], blue: [28, 140, 142], yellow: [248, 128, 108], green: [110, 76, 86] }, sw: ["#f7f8f7", "#1c8c8e", "#f8806c", "#6e4c56"] },
      { id: "mono", name: "Graphite", c: { paper: [247, 247, 247], black: [40, 40, 42], blue: [70, 70, 76], yellow: [186, 186, 190], green: [28, 28, 32] }, sw: ["#f7f7f7", "#46464c", "#bababe", "#1c1c20"] }
    ],
    bench: { palette: "measured", params: {}, note: "The plant is generated, so the out rects were placed with search.py (blue field, blue edge, fringed edge) and by a green-share scan of the render (green block); the bare grid and the whole plate compare in place.", items: [
      { name: "blue field", ref: [143, 132, 128, 128], out: [264, 108, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 6, inks: [[22, 122, 184], [250, 247, 240]], inkNames: ["blue", "paper"] },
      { name: "green block", ref: [154, 682, 64, 64], out: [283, 586, 64, 64], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[92, 138, 80], [236, 230, 106], [250, 247, 240]], inkNames: ["green", "yellow", "paper"] },
      { name: "bare grid", ref: [477, 716, 256, 256], out: [477, 716, 256, 256], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 8, inks: [[44, 42, 40], [250, 247, 240]], inkNames: ["black", "paper"] },
      { name: "blue edge", ref: [240, 170, 128, 96], out: [12, 300, 128, 96], m: ["hist", "mean", "ink", "share"], inks: [[22, 122, 184], [250, 247, 240], [44, 42, 40]], inkNames: ["blue", "paper", "black"] },
      { name: "fringed edge", ref: [156, 605, 128, 96], out: [348, 396, 128, 96], m: ["hist", "mean", "ink", "share"], inks: [[92, 138, 80], [236, 230, 106], [250, 247, 240], [22, 122, 184]], inkNames: ["green", "yellow", "paper", "blue"] },
      { name: "whole plate", ref: [0, 0, 736, 980], out: [0, 0, 736, 980], m: ["hist", "mean", "ink", "share"], inks: [[250, 247, 240], [22, 122, 184], [92, 138, 80], [236, 230, 106], [44, 42, 40]], inkNames: ["paper", "blue", "green", "yellow", "black"] }
    ] },
    passes: ["motif: a plant grown on the cell lattice by a seeded rule (stem climbs and drifts, stepped leaves alternate sides, blooms grow from a cross by a 3-neighbor fill rule)", "plates as masks: yellow under the green cells, blue under every cell shifted by the misregister, a halo mask grown around both", "mask softening: each plate mask is blurred so the screen's dots thin out across every edge", "ruled grid: per-line profiles of wobble, width, darkness and pen breaks; crossings pool ink; the halo knocks the grid out under the motif", "screens: the yellow plate as a near-solid rotated screen, the blue plate as a dot lattice whose coverage drifts with uneven inking and drops on the light stitches", "compose on fibered paper: yellow, then blue (which turns green where yellow is already down), then black"],
    measured: { grid_pitch_px: 35, grid_pitch_evidence: "autocorrelation of column darkness peaks at lag 35; line positions 30,65,100,134,169,205 (x) and 18,53,87,122,157,191 (y)", line_width_px: { median: 2, p25: 2, p75: 3, method: "run lengths of darkness>90 across vertical lines" }, line_darkness_along_length: { mean: 166, std: 46, p10: 131, p90: 205, scale: "255-L at the line core" }, break_fraction: .07, crossing_darkness_vs_midline: [158, 104], blue_screen: { pitch_px: [4.35, 4.12], angle_deg: [-18, 75], method: "2-D FFT peaks of a 128 px blue patch", paper_hole_share: .22, hole_median_area_px: 3 }, misregister_px: { blue_right_of_yellow: 3.5, blue_below_yellow: 5.5, method: "median run length of yellow-only pixels left/above green (3, 6) and blue-only right/below green (4, 5)" }, inks: { paper: [250, 247, 240], blue_solid_p10: [28, 124, 171], yellow_median: [236, 230, 106], green_overprint_p5: [52, 114, 57], black_median: [62, 61, 58] }, class_shares: { blue: .094, green: .085, yellow_only: .009, black: .066, paper: .65 }, motif_offset_from_grid_px: { x: 13, y: 3, method: "motif block edges mod 35 vs grid line positions mod 35" }, second_chart_r22: { grid_pitch_px: 36, paper: [250, 247, 240], yellow: [235, 228, 108], purple_overprint_median: [127, 107, 142] } },
    limits: ["Under 98 %: the blue field's histogram, contrast and hole color, and the green block's contrast and spectrum. In the scanned reference the paper holes never reach paper white and read bluer than paper (B above the paper's own B), and the ink ground spreads over a 60-level tone range; a two-ink physical mix cannot produce that hole color, and matching the tone range without blurring the plate was not found.", "The plant is generated; the reference's flowers and leaves are not redrawn, so the edge patches are compared by material (fringe widths, dot thinning, halo) at searched positions.", "The reference is a scanned print saved as JPEG: its dots are softer and its paper carries ringing; no blur was added to imitate that.", "The second chart (r22) shares paper, yellow, grid and screen; its purple is a magenta-over-blue overprint that this two-plate engine represents only as the Violets palette."],
    source: "Reference 05: a printed cross-stitch chart, 736 × 980 px JPEG (blue flowers, green leaves, hand-ruled grid). Reference 22 is a second chart from the same series (838 × 862 px, violets and leaves) and was read for the grid pitch, paper and inks.",
    study: {
      slug: "charted-stitch", lede: "Three passes on one sheet: a ruled grid, a yellow plate, and a dotted blue plate that never quite lands on it.",
      body: ["A stitch chart is a pixel drawing before the word existed: one cell per stitch, one color per thread. This one was printed, not drawn. The grid was ruled by hand in black ink, with the pen skipping and the ink pooling at every crossing; the motif went down as two halftone plates, a yellow and a blue, and the press put the blue a few pixels right and down of the yellow. Where both plates land the result is green; along the top and left of every leaf a sliver of bare yellow shows, and along the bottom and right the blue runs out past it. The blue itself is a dot screen tilted about eighteen degrees, printed heavy enough that it reads as a solid with a lattice of paper holes.", "The rebuild grows its own plant on the cell lattice with a seeded rule, then prints it the way the chart was printed. The grid is drawn from per-line profiles of wobble, width, darkness and pen breaks and knocked out under the motif with a paper halo. Each plate mask is softened before it meets its screen, so the dots thin out at the edges instead of stopping dead. Coverage, screen pitch and angle, the two misregister offsets and the uneven inking are the knobs on the press; stem height, leaves, blooms and the stitch offset are the knobs on the chart."],
      method: "Measured grid, ruled line profiles · plates as softened masks · rotated dot screen with drifting coverage · misregistered overprint",
      points: [
        { u: .27, v: .2, d: "KEY", label: "Inside a blue bloom: the screen is a lattice of paper holes at a tilt, not dots on paper.", t: "grain", dir: [1, 0] },
        { u: .4, v: .24, d: "READ", label: "A lighter stitch where the coverage drops and the holes open up.", t: "tone", dir: [0, 1] },
        { u: .36, v: .55, d: "KEY", label: "Leaf edge: yellow shows along the top and left where the blue plate did not reach.", t: "pull", dir: [-1, -1] },
        { u: .6, v: .62, d: "KEY", label: "The opposite edge: blue runs past the yellow on the bottom and right.", t: "pull", dir: [1, 1] },
        { u: .5, v: .5, d: "READ", label: "Stem: blue over yellow goes green; the holes between dots show yellow, not paper.", t: "grain", dir: [0, -1] },
        { u: .8, v: .8, d: "KEY", label: "A crossing: ink pools where two ruled lines meet, darker and fatter than the lines.", t: "ink", dir: [0, 0] },
        { u: .7, v: .9, d: "READ", label: "A pen skip: the line thins and breaks for a few pixels, then resumes.", t: "ink", dir: [1, 0] },
        { u: .5, v: .3, d: "READ", label: "The knockout halo: ruled lines stop short of every stitch, leaving a margin of bare paper.", t: "edge", dir: [1, 0] },
        { u: .3, v: .38, d: "READ", label: "Dots thin out across the bloom's edge instead of cutting off on a hard line.", t: "edge", dir: [0, 1] },
        { u: .15, v: .15, d: "READ", label: "Bare stock: a faint fiber grain, and lines that wander a pixel or two off true.", t: "paper", dir: [0, 0] }
      ]
    }
  });
})();
