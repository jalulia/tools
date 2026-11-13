/* ===== PLATE 18 · THERMAL FIELD =====
   one wrapped scalar field read through a cyclic thermal colormap: broad warm and cold domes, small hot spots whose
   value runs through whole turns (rings), and a cell grid that cuts the field: a cell may carry a constant shift, a fan
   (a dipole between two of its corners, so every color meets at the corner) or a flare along one edge. Thin dark lines
   multiply the field on the cell edges; a caption and a colorbar that is the true scale of the field sit at the foot. */
(function () {
  const REF = { w: 768, h: 1408 };
  /* measured loop: k-means (28) on the field, ordered by hue, stop positions by Oklab arc length; navy closes the loop */
  const LOOP = [[0, 1, 2, 108], [.077, 61, 25, 148], [.137, 108, 13, 149], [.187, 147, 5, 152], [.229, 179, 2, 151], [.269, 209, 1, 142], [.318, 238, 1, 112], [.354, 245, 4, 71], [.371, 243, 46, 63], [.402, 249, 76, 43], [.429, 250, 99, 26], [.459, 250, 123, 13], [.498, 251, 152, 5], [.548, 248, 186, 10], [.575, 220, 184, 46], [.617, 175, 179, 73], [.663, 124, 170, 97], [.706, 67, 160, 118], [.754, 4, 145, 148], [.817, 2, 115, 166], [.866, 3, 87, 165], [.908, 2, 62, 158], [.939, 4, 42, 147], [.969, 6, 22, 131], [1, 1, 2, 108]];
  function lut(stops) { const N = 1024, L = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const t = i / N; let k = 0; while (k < stops.length - 2 && stops[k + 1][0] <= t) k++; const a = stops[k], b = stops[k + 1], f = clamp((t - a[0]) / (b[0] - a[0] || 1), 0, 1); for (let c = 0; c < 3; c++) L[i * 3 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * f; } return L; }
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), img = g.createImageData(W, H), d = img.data, sd = P.seed | 0, rG = mulberry(sd * 7907 + 31), rD = mulberry(sd * 7907 + 101), rC = mulberry(sd * 7907 + 211), rS = mulberry(sd * 7907 + 307);
    let rnd = rG; /* one stream per component, so the grid, domes, cells and spots re-roll only with the seed */
    /* 1 — the grid: columns about 67 px, rows about 112 px that shrink toward the foot; some vertical segments are missing (merged cells),
       some horizontal segments jog a few px or double */
    const xs = [0]; { const cw = W / P.cols; let x = 0; while (x < W) { x += cw * (.9 + .2 * rnd()); xs.push(Math.min(W, x)); } if (W - xs[xs.length - 2] < cw * .45) xs.splice(xs.length - 2, 1); xs[xs.length - 1] = W; }
    const ys = [0]; { let y = (P.rowH * u) * (.4 + .1 * rnd()); while (y < H) { ys.push(y); const f = 1 - P.shrink * sstep(.62, 1, y / H); y += P.rowH * u * f * (.9 + .2 * rnd()); } ys.push(H); }
    const nc = xs.length - 1, nr = ys.length - 1, cell = new Int32Array(nc * nr);
    const vGone = new Uint8Array((nc + 1) * nr), hJog = new Float32Array(nc * (nr + 1)), hDbl = new Uint8Array(nc * (nr + 1));
    for (let r = 0; r < nr; r++) for (let c = 1; c < nc; c++) vGone[r * (nc + 1) + c] = rnd() < P.merge ? 1 : 0;
    for (let r = 1; r < nr; r++) for (let c = 0; c < nc; c++) { const q = rnd(); hJog[r * nc + c] = q < P.jog ? (rnd() < .5 ? -1 : 1) * (3 + 3 * rnd()) * u : 0; hDbl[r * nc + c] = rnd() < P.jog * .3 ? 1 : 0; }
    const colOf = new Int32Array(W), rowOf = new Int32Array(H); for (let x = 0, c = 0; x < W; x++) { while (c < nc - 1 && x + .5 >= xs[c + 1]) c++; colOf[x] = c; } for (let y = 0, r = 0; y < H; y++) { while (r < nr - 1 && y + .5 >= ys[r + 1]) r++; rowOf[y] = r; }
    /* 2 — the field, in turns. Broad domes set the warm and cold regions */
    rnd = rD;
    const T0 = P.temp, bl = []; for (let k = 0; k < 5; k++) bl.push({ x: rnd() * W, y: rnd() * H * .85, a: (k < 2 ? 1 : rnd() < .5 ? -1 : 1) * (.25 + .3 * rnd()), sx: (.18 + .22 * rnd()) * W * (P.domeSize ?? .93), sy: (.25 + .35 * rnd()) * W * (P.domeSize ?? .93) });
    bl[0].x = W * (.12 + .16 * rnd()); bl[0].y = H * (.36 + .14 * rnd()); bl[0].sx = .34 * W * (P.domeSize ?? .93); bl[0].sy = .3 * H * (P.domeSize ?? .93); /* the warm plateau */
    bl[1].x = W * (.7 + .2 * rnd()); bl[1].y = H * (.86 + .1 * rnd()); bl[1].sx = .42 * W * (P.domeSize ?? .93); bl[1].sy = .22 * H * (P.domeSize ?? .93); /* the navy pool */
    bl[2].x = W * (.02 + .1 * rnd()); bl[2].y = H * (.82 + .12 * rnd()); bl[2].a = .55; bl[2].sx = .28 * W * (P.domeSize ?? .93); bl[2].sy = .2 * H * (P.domeSize ?? .93); /* the over-hot corner: past yellow into green and teal */
    /* per cell: a shift, a fan between two adjacent corners, or a flare along one edge */
    rnd = rC;
    const shift = new Float32Array(nc * nr), fan = [], flare = [];
    for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) { const k = r * nc + c, q = rnd(), qs = rnd(), qa = rnd(), qn = rnd(), f2 = rnd(), fs = rnd(), fa = rnd(), fb = rnd(); /* every draw is taken whatever the sliders say, so a slider never re-rolls the rest */
      shift[k] = (qn - .5) * 2 * P.cellNoise; if (q < P.shifts) shift[k] += (qs < .5 ? -1 : 1) * P.shiftAmt * (.4 + .6 * qa); if (f2 < P.flares) flare.push({ k, side: (fs * 4) | 0, a: (fa < .5 ? -1 : 1) * (.08 + .1 * fb) }); }
    rnd = rS; for (let i = 0; i < 8; i++) { const c = 1 + ((rnd() * (nc - 2)) | 0), r = 1 + ((rnd() * (nr * .7 - 1)) | 0), side = (rnd() * 4) | 0, q = (rnd() < .5 ? -1 : 1) * (.45 + .4 * rnd()); fan.push({ k: r * nc + c, c, r, side, q }); } fan.length = Math.min(8, Math.round(P.fans));
    /* hot spots: small domes whose value climbs whole turns, so they show as rings; each throws a jet along the nearest grid line */
    const spots = []; for (let i = 0; i < 6; i++) { const c = 1 + ((rnd() * (nc - 2)) | 0), r = 2 + ((rnd() * (nr - 4)) | 0), sx = xs[c] + (rnd() - .5) * 30 * u, sy = ys[r] + (rnd() - .5) * 40 * u; spots.push({ x: sx, y: sy, tv: .5 + .06 * rnd(), a: (.6 + .7 * rnd()) * (P.spotAmp ?? .8), s: (4 + 6 * rnd()) * u * (P.spotR ?? 1), lx: xs[c], dn: rnd() < .6 ? 1 : -1, n: 2 + ((rnd() * 3) | 0), j: [0, 1, 2, 3].map(() => [(rnd() - .5) * 46 * u, (rnd() - .5) * 46 * u, (.5 + rnd()) * (rnd() < .3 ? -1 : 1)]) }); } spots.length = Math.min(6, Math.round(P.spots));
    const F = new Float32Array(W * H), ph = P.phase || 0;
    for (let y = 0, i = 0; y < H; y++) { const r = rowOf[y]; for (let x = 0; x < W; x++, i++) {
      let T = T0 + ph + P.tilt * (x / W - .5) - .1 * P.tilt * (y / H);
      for (let q = 2; q < bl.length; q++) { const b = bl[q], dx = (x - b.x) / b.sx, dy = (y - b.y) / b.sy; T += b.a * P.span * Math.exp(-.5 * (dx * dx + dy * dy)); }
      /* the warm plateau and the cold pool pull the field to a level with a flat top: orange one turn up, navy at the turn, so from the cold side the plateau is reached through navy, violet, magenta and red */
      for (let q = 0; q < 2; q++) { const b = bl[q], dx = (x - b.x) / b.sx, dy = (y - b.y) / b.sy, r2 = dx * dx + dy * dy, w = Math.exp(-.5 * r2 * r2) * (q ? (P.pool ?? 1) : 1); T += ((q ? 1 : 1 + P.warm) - T) * w; }
      const c = colOf[x], k = r * nc + c; T += shift[k];
      for (const sp of spots) { const dx = x - sp.x, dy = y - sp.y, rr = dx * dx + dy * dy; if (rr < 900 * u * u * (P.spotR ?? 1) * (P.spotR ?? 1) * 16) for (const jj of sp.j.slice(0, sp.n)) { const ex = dx - jj[0], ey = dy - jj[1]; T += jj[2] * sp.a * Math.exp(-(ex * ex + ey * ey) / (2 * sp.s * sp.s)); }
        const jx = (x - sp.lx) / (11 * u * (P.spotR ?? 1)), along = (y - sp.y) * sp.dn; if (along > -20 * u && Math.abs(jx) < 4) { const w = Math.min(1, P.jet * Math.exp(-.5 * jx * jx) * Math.exp(-Math.max(0, along) / ((P.jetLen ?? .2) * H))); let dl = sp.tv - T; dl -= Math.round(dl); T += dl * w; } }
      F[i] = T;
    } }
    for (const f of fan) { /* a fan: the field turns around one corner of the cell, q turns across the cell's quarter of the circle */
      const fl = 1.8 * Math.min(xs[f.c + 1] - xs[f.c], ys[f.r + 1] - ys[f.r]), x0 = Math.floor(xs[f.c]), x1 = Math.ceil(xs[f.c + 1]), y0 = Math.floor(ys[f.r]), y1 = Math.ceil(ys[f.r + 1]), cx = f.side & 1 ? xs[f.c + 1] : xs[f.c], cy = f.side & 2 ? ys[f.r + 1] : ys[f.r];
      for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) { if (colOf[x] !== f.c || rowOf[y] !== f.r) continue; const ax = Math.abs(x + .5 - cx), ay = Math.abs(y + .5 - cy), fr = Math.atan2(ay, ax) / 1.5708, en = Math.exp(-Math.hypot(ax, ay) / fl); F[y * W + x] += f.q * (fr - .5) * en; } }
    for (const f of flare) { const c = f.k % nc, r = (f.k / nc) | 0, x0 = Math.floor(xs[c]), x1 = Math.ceil(xs[c + 1]), y0 = Math.floor(ys[r]), y1 = Math.ceil(ys[r + 1]), w = (P.flareW ?? 14) * u;
      for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) { if (colOf[x] !== c || rowOf[y] !== r) continue; const dd = [y + .5 - ys[r], xs[c + 1] - x - .5, ys[r + 1] - y - .5, x + .5 - xs[c]][f.side]; F[y * W + x] += f.a * Math.exp(-dd / w); } }
    /* 3 — one grain field, softened a little and normalized: it dithers the value before the colormap (speckle where the map runs fast)
       and screens the tones */
    const N = new Float32Array(W * H), gsd = sd + 977 * Math.floor(ph * 240); /* the grain boils with the phase, as film grain does frame to frame; at rest it is fixed */ for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) N[i] = hashI(x, y, gsd) + hashI(x, y, gsd + 7) - 1;
    const B = P.grainSize * u >= .3 ? gblur(N, W, H, P.grainSize * u) : N; let bv = 0; for (let i = 0; i < B.length; i += 7) bv += B[i] * B[i]; const bn = 1 / Math.sqrt(bv / Math.ceil(B.length / 7) || 1);
    const LU = lut(pal.stops), dz = P.dither * .01 * bn, gz = P.grain * bn;
    for (let i = 0, o = 0; i < F.length; i++, o += 4) { let t = F[i] + B[i] * dz; t -= Math.floor(t); const k = (t * 1024 | 0) * 3, n = B[i] * gz; d[o] = clamp(LU[k] + n, 0, 255); d[o + 1] = clamp(LU[k + 1] + n, 0, 255); d[o + 2] = clamp(LU[k + 2] + n, 0, 255); d[o + 3] = 255; }
    /* 4 — grid lines: the field multiplied down on the cell edges, anti-aliased, P.lineW wide */
    const lw = P.lineW * u, dk = P.lineDark, lc = pal.line || [0, 0, 0], mul = (x, y, a) => { if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return; const o = (y * W + x) * 4; for (let c = 0; c < 3; c++) d[o + c] += (Math.max(0, d[o + c] * (1 - dk) - 22 * dk) * (1 - lc[3] || 1) + lc[c] * (lc[3] || 0) - d[o + c]) * a; };
    const vline = (x, y0, y1) => { for (let y = Math.max(0, Math.floor(y0)); y < Math.min(H, Math.ceil(y1)); y++) for (let xx = Math.floor(x - lw); xx <= Math.ceil(x + lw); xx++) mul(xx, y, clamp(lw / 2 + .5 - Math.abs(xx + .5 - x), 0, 1)); };
    const hline = (y, x0, x1) => { for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, Math.ceil(x1)); x++) for (let yy = Math.floor(y - lw); yy <= Math.ceil(y + lw); yy++) mul(x, yy, clamp(lw / 2 + .5 - Math.abs(yy + .5 - y), 0, 1)); };
    for (let c = 1; c < nc; c++) for (let r = 0; r < nr; r++) if (!vGone[r * (nc + 1) + c]) vline(xs[c], ys[r], ys[r + 1]);
    for (let r = 1; r < nr; r++) for (let c = 0; c < nc; c++) { const y = ys[r] + hJog[r * nc + c]; hline(y, xs[c], xs[c + 1]); if (hDbl[r * nc + c]) hline(y + 6 * u, xs[c], xs[c + 1]); }
    g.putImageData(img, 0, 0);
    /* 5 — the foot: caption, the colorbar as the true scale of the field (one turn, 0 to 1), its axis and ticks */
    const tc = pal.text || [199, 210, 247], ac = pal.axis || [88, 136, 209], bx0 = 273 * u, bx1 = 628 * u, by0 = 1330 * u, bh = 13.5 * u;
    for (let x = Math.floor(bx0); x < Math.ceil(bx1); x++) { const t = clamp((x + .5 - bx0) / (bx1 - bx0), 0, .9999), k = (t * 1024 | 0) * 3; g.fillStyle = css([LU[k], LU[k + 1], LU[k + 2]]); g.fillRect(x, by0, 1, bh); }
    g.strokeStyle = css(ac); g.lineWidth = 1.6 * u; g.beginPath(); g.moveTo(bx0, 1352.5 * u); g.lineTo(bx1, 1352.5 * u); g.moveTo(bx0, 1346 * u); g.lineTo(bx0, 1359 * u); g.moveTo(bx1, 1346 * u); g.lineTo(bx1, 1359 * u); g.stroke();
    const mk0 = bx0 + (bx1 - bx0) * (((ph % 1) + 1) % 1); g.beginPath(); g.ellipse(mk0, 1352.5 * u, 2.2 * u, 4.5 * u, 0, 0, 6.2832); g.fillStyle = css(tc); g.fill();
    g.textBaseline = "alphabetic"; g.textAlign = "center"; g.font = `400 ${17 * u * (P.tickSize ?? 1)}px "Archivo",Arial,sans-serif`; g.fillStyle = css(ac);
    for (let i = 0; i <= 5; i++) g.fillText(i === 0 ? "0" : i === 5 ? "1" : (i / 5).toFixed(1), bx0 + (bx1 - bx0) * i / 5, 1383 * u);
    /* the x axis: grid lines labeled with their position in px */
    for (const c of [1, 2, nc - 1]) if (xs[c] < bx0 - 30 * u || xs[c] > bx1 + 30 * u) g.fillText(String(Math.round(xs[c] / u)), xs[c], 1383 * u);
    if ((P.caption || "").trim()) { g.font = `400 ${25 * u * (P.capSize ?? 1)}px "Archivo",Arial,sans-serif`; g.fillStyle = css(tc); try { g.letterSpacing = (.2 * u) + "px"; } catch (e) {} g.fillText(P.caption, (bx0 + bx1) / 2 - 2 * u, 1318 * u); try { g.letterSpacing = "0px"; } catch (e) {} }
  }
  PLATES.push({
    id: "p18", no: "18", title: "Thermal Field", ref: REF, render,
    line: "One wrapped field read through a cyclic thermal colormap, cut by a cell grid that shifts, fans and flares it, with a colorbar that is its true scale.",
    texts: [{ key: "caption", label: "Caption", def: "Mindgut · the Helix" }],
    params: [
      { key: "temp", label: "Offset", min: 0, max: 1, step: .001, def: .94, unit: "turn", group: "Field", why: "Adds a constant to the whole field, which turns every color one step along the loop." },
      { key: "warm", label: "Warm level", min: 0, max: 1, step: .005, def: .445, unit: "turn", group: "Field", why: "The level the warm plateau holds: 0.43 is the measured orange 250 99 26; 0.5 is yellow." },
      { key: "span", label: "Dome height", min: 0, max: 2.5, step: .01, def: .92, unit: "×", group: "Field", why: "Height of the three free domes that bend the field between the plateau and the pool, 0.25 to 0.55 turn each at 1." },
      { key: "tilt", label: "Tilt", min: -1, max: 1, step: .01, def: -.47, unit: "turn", group: "Field", why: "A plain slope across the sheet, left to right, under the domes." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 7, unit: "", group: "Field", why: "Re-rolls the grid, the domes, the cell shifts and the hot spots." },
      { key: "cols", label: "Columns", min: 4, max: 24, step: 1, def: 11.5, unit: "", group: "Grid", why: "Columns across the sheet. Measured 63 to 76 px on 768: about 11.5." },
      { key: "rowH", label: "Row height", min: 30, max: 260, step: 1, def: 112, unit: "px", group: "Grid", why: "Row height at the top. Measured 101 to 119 px in the upper two thirds." },
      { key: "shrink", label: "Foot shrink", min: 0, max: .8, step: .01, def: .45, unit: "", group: "Grid", why: "How much the rows shrink toward the foot. Measured 112 px rows falling to 58 to 68 px in the bottom fifth." },
      { key: "lineW", label: "Line width", min: .5, max: 6, step: .1, def: 1.6, unit: "px", group: "Grid", why: "Width of the cell lines. Measured 2 px." },
      { key: "lineDark", label: "Line depth", min: 0, max: 1, step: .01, def: .53, unit: "", group: "Grid", why: "How far a line multiplies the field down. Measured 116 5 14 on a line over 245 75 50, and 94 55 0 over 247 185 12." },
      { key: "merge", label: "Merged cells", min: 0, max: .6, step: .01, def: .1, unit: "", group: "Grid", why: "Share of vertical segments left out, which merges two cells into one wide one." },
      { key: "jog", label: "Jogs", min: 0, max: .6, step: .01, def: .12, unit: "", group: "Grid", why: "Share of horizontal segments shifted 3 to 6 px off their row line; a third of those also double, as at y 503 and 509 in the source." },
      { key: "cellNoise", label: "Cell steps", min: 0, max: .15, step: .002, def: .006, unit: "turn", group: "Cells", why: "A small random offset in every cell, so most cell edges carry a faint step in color, as most of the source's do." },
      { key: "shifts", label: "Cell shifts", min: 0, max: .6, step: .01, def: .04, unit: "", group: "Cells", why: "Share of cells whose whole field is offset, which leaves a step in color along their edges." },
      { key: "shiftAmt", label: "Shift size", min: 0, max: .5, step: .005, def: .09, unit: "turn", group: "Cells", why: "Largest offset a shifted cell takes." },
      { key: "fans", label: "Fans", min: 0, max: 8, step: 1, def: 3, unit: "", group: "Cells", why: "Cells whose field turns around one of their corners, 0.45 to 0.85 turn across the cell's quarter circle and fading over 1.8 times the cell's short side, so the colors meet at the corner like a pinwheel and stop at the cell's edges." },
      { key: "flares", label: "Flares", min: 0, max: .5, step: .01, def: .1, unit: "", group: "Cells", why: "Share of cells with a bright ridge hugging one edge, like the yellow along x 200 in the source." },
      { key: "spots", label: "Hot spots", min: 0, max: 6, step: 1, def: 2, unit: "", group: "Hot spots", why: "Clusters of small domes near grid crossings whose value climbs through whole turns, so each reads as rings of every color." },
      { key: "jet", label: "Jet", min: 0, max: 2, step: .01, def: .8, unit: "", group: "Hot spots", why: "A narrow ridge thrown from each cluster along its grid line that pulls the field toward yellow (0.5 to 0.56 turn) by the shortest way round the loop: the yellow column under the source's lower left cluster." },
      { key: "dither", label: "Dither", min: 0, max: 6, step: .05, def: .1, unit: "% turn", group: "Surface", why: "σ of the grain added to the value before the colormap. The speckle lands where the map runs fast: high-pass σ 3.8 in the magenta band, 0.8 in the orange, 0.2 in the navy." },
      { key: "grain", label: "Grain", min: 0, max: 6, step: .05, def: .4, unit: "σ", group: "Surface", why: "Luminance grain screened over everything by the same field." },
      { key: "grainSize", label: "Grain size", min: 0, max: 3, step: .05, def: 1, unit: "px", group: "Surface", why: "Softening of the grain field. Measured lag-1 correlation 0.3 to 0.5." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. Adds one turn to the field over the loop, so every color walks once around the map, the marker walks the colorbar and the grain boils." }
    ],
    bench: { palette: "measured", params: { caption: "Visionary In Art" }, note: "The field is generated, so the region patches sit on the same material in the render, placed with search.py within the matching region: the warm plateau, the magenta flank, the cold pool. The caption is set to the source's wording for the foot patch; the render's colorbar is the true scale of its field, which the source's is not.", items: [
      { name: "whole field", ref: [0, 0, 768, 1260], out: [0, 0, 768, 1260], m: ["hist", "mean", "ink", "share"], inks: [[3, 7, 109], [108, 13, 149], [179, 2, 151], [245, 4, 71], [250, 99, 26], [248, 186, 10], [124, 170, 97], [4, 145, 148], [2, 87, 165], [4, 42, 147]], inkNames: ["navy", "violet", "magenta", "red", "orange", "yellow", "green", "teal", "blue", "deep blue"] },
      { name: "warm cells", ref: [205, 300, 150, 330], out: [16, 576, 150, 330], m: ["hist", "mean", "std", "ink"], inks: [[250, 99, 26], [248, 186, 10], [245, 4, 71]], inkNames: ["orange", "yellow", "red"] },
      { name: "magenta flank", ref: [430, 60, 200, 200], out: [464, 752, 200, 200], m: ["hist", "mean", "std", "spec", "ac"], lags: 6 },
      { name: "cold corner", ref: [620, 1060, 140, 140], out: [608, 1152, 140, 140], m: ["hist", "mean", "std", "spec", "ac"], lags: 6 },
      { name: "grid crossing", ref: [100, 900, 128, 128], out: [100, 900, 128, 128], m: ["spec", "ac"], lags: 8 },
      { name: "foot", ref: [260, 1285, 380, 110], out: [260, 1285, 380, 110], m: ["hist", "mean", "ink", "share"], inks: [[3, 7, 109], [2, 62, 158], [199, 210, 247], [250, 123, 13]], inkNames: ["navy", "blue", "type", "bar warm"] }
    ] },
    palettes: [
      { id: "measured", name: "Thermal loop", note: "measured", stops: LOOP, text: [199, 210, 247], axis: [88, 136, 209], sw: ["#03076d", "#930598", "#fa7b0d", "#029194"] },
      { id: "ice", name: "Ice loop", stops: [[0, 6, 12, 38], [.22, 24, 70, 190], [.42, 120, 200, 255], [.55, 236, 246, 255], [.7, 90, 220, 230], [.86, 20, 110, 170], [1, 6, 12, 38]], text: [232, 240, 250], axis: [130, 170, 225], sw: ["#060c26", "#1846be", "#ecf6ff", "#5adce6"] },
      { id: "acid", name: "Acid loop", stops: [[0, 18, 8, 52], [.18, 110, 0, 200], [.36, 255, 0, 150], [.52, 255, 226, 0], [.68, 120, 255, 80], [.84, 0, 190, 210], [1, 18, 8, 52]], text: [240, 240, 250], axis: [150, 160, 230], sw: ["#120834", "#ff0096", "#ffe200", "#00bed2"] },
      { id: "graphite", name: "Graphite loop", stops: [[0, 10, 10, 12], [.3, 110, 110, 116], [.5, 244, 244, 246], [.7, 110, 110, 116], [1, 10, 10, 12]], text: [236, 236, 240], axis: [150, 150, 160], sw: ["#0a0a0c", "#6e6e74", "#f4f4f6", "#3a3a3e"] },
      { id: "solar", name: "Solar loop", stops: [[0, 8, 26, 56], [.22, 0, 140, 160], [.42, 170, 230, 70], [.58, 255, 206, 0], [.76, 255, 104, 32], [.9, 120, 40, 120], [1, 8, 26, 56]], text: [236, 242, 250], axis: [120, 170, 210], sw: ["#081a38", "#008ca0", "#ffce00", "#ff6820"] },
      { id: "violet", name: "Night violet", stops: [[0, 4, 4, 20], [.28, 90, 40, 200], [.52, 240, 130, 255], [.7, 255, 236, 250], [.82, 120, 220, 255], [1, 4, 4, 20]], text: [236, 236, 252], axis: [150, 140, 230], sw: ["#040414", "#5a28c8", "#f082ff", "#78dcff"] }
    ],
    presets: [
      { name: "Clean field", set: { cellNoise: 0, shifts: 0, fans: 0, flares: 0, spots: 0, jog: 0, merge: 0 } },
      { name: "Shattered", set: { cellNoise: .06, shifts: .35, shiftAmt: .25, fans: 8, flares: .3, jog: .4 } },
      { name: "Fine grid", set: { cols: 20, rowH: 60, lineW: 1.2, shrink: .2 } },
      { name: "Hot spots", set: { spots: 6, jet: 1.6, dither: .6 } }
    ],
    motion: [{ key: "phase", amp: 1, period: 30, mode: "saw" }, { key: "jet", amp: .3, period: 7, mode: "sine" }],
    live: { x: { key: "temp", min: 0, max: 1 }, y: { key: "span", min: 0, max: 2 } },
    source: "Reference 18: thermal field poster, 768 × 1408 px",
    passes: ["grid: columns 0.9 to 1.1 of W / 11.5 wide, rows 112 px that shrink toward the foot; vertical segments dropped to merge cells, horizontal segments jogged 3 to 6 px and some doubled", "field in turns: offset plus a tilt, three free domes, then two flat-topped mixes that pull the warm plateau to orange one turn up and the cold pool to navy at the turn", "cells: a small step in every cell, larger shifts in a few, fans that turn the field around one corner inside the cell, flares along one edge", "hot spots: clusters of 2 to 4 small domes that climb whole turns, each throwing a jet along its grid line that pulls the field toward yellow", "one grain field dithers the value before the cyclic colormap and screens the tones", "lines: the field multiplied down along every cell edge, 2 px, anti-aliased", "foot: caption, a colorbar drawn from the same lookup over one turn, its axis, end ticks, a marker at the phase, tick labels 0 to 1 and the x positions of three grid lines"],
    measured: { colormap: { stops: 25, method: "k-means (28) on every other pixel of the field above the foot, dark line mixes dropped, centers ordered by hue; stop positions by Oklab arc length; the colors close on navy 3 7 109, so the map is a loop", order: "navy, violet 61 25 148, magenta 179 2 151, red 245 4 71, orange 250 99 26, yellow 248 186 10, olive 175 179 73, green 67 160 118, teal 4 145 148, blue 3 87 165, deep blue 6 22 131, navy" }, grid: { vertical_px: [71, 134, 200, 365, 430, 497, 567, 641, 717], horizontal_px: [50, 162, 279, 392, 506, 623, 725, 826, 945, 1054, 1138, 1206, 1273, 1331], method: "rows and columns where a pixel is 12 L darker than both neighbors 3 px away, share above 0.25", column_px: "63 to 76, one merged column of 165", row_px: "101 to 119 in the upper two thirds, 58 to 68 in the bottom fifth", jogs: "503 and 509 at one crossing, 823 and 829 at another" }, line: { width_px: 2, over_red: [[245, 75, 50], [116, 5, 14]], over_yellow: [[247, 185, 12], [94, 55, 0]], method: "row and column profiles across the lines" }, grain_hp_sigma: { magenta: 3.83, blue: 1.88, orange: .77, navy: .23, lag1: [.31, .54], method: "L minus a 2 px gaussian over 60 to 120 px patches; the spread follows how fast the map runs" }, foot: { caption_bbox: [373, 1298, 524, 1321], caption_rgb: [199, 210, 247], bar: [273, 1330, 628, 1343.5], axis_y: 1352.5, ticks_rgb: [88, 136, 209], tick_cap_px: 12 } },
    limits: ["Bench mean 0.910, lowest 0.61 (the foot's warm bar ink, below). The furthest of the four from 0.98. The field is generated, and the source's is a single drawn composition: an orange column on the left third, a magenta diagonal, a blue right side, a navy foot. The whole-field histogram and ink shares score 0.82 to 0.97 because the render's warm plateau, flank and pool fall in different places and proportions; the three region patches were placed with search.py inside the matching region and still score 0.71 to 0.95 on histogram and contrast.", "The grid-crossing spectrum scores 0.68 and the cold-corner structure 0.84: the source's lines fade into its navy and its corner is nearly noiseless, σ 0.2, while the render's lines stay at a constant depth and its cell steps add edges.", "The foot's warm bar ink scores 0.63 by design: the source's colorbar is a row of out-of-order blocks that does not match its field; the render's bar is the true scale of its own field over one turn, so its warm part is the narrow orange-to-yellow run of the loop.", "The source is a JPEG with soft streaks around its crossings that the render does not model."],
    study: { slug: "thermal-field", lede: "A wrapped field read through a cyclic thermal colormap, cut by a grid of cells that shift, fan and flare it.",
      body: ["The source reads a scalar field through a colormap that closes on itself: navy, violet, magenta, red, orange, yellow, then olive, green, teal and blue back to navy. Because the map is a loop, a field that climbs one full turn returns to its starting color, and a point the field winds around shows every color at once. Thin dark lines, 2 px, split the sheet into cells 63 to 76 px wide and 101 to 119 px tall, shorter toward the foot. Many cells carry a step in value at their edges; a few turn the field around one corner, so the colors fan out of the crossing. The grain is a dither on the value: σ 3.8 where the map runs fast through magenta, 0.2 in the flat navy.", "The rebuild sums the field in turns: an offset, a tilt, three free domes, a flat-topped warm plateau pulled to orange one turn up and a cold pool pulled to navy. Every cell then takes a small step, some a larger shift, some a fan around a corner, some a flare along an edge. Hot spots are clusters of small domes that climb whole turns, so they read as rings, and each throws a jet along its grid line. One grain field dithers the value before the lookup. The lines multiply the field down on every cell edge. The colorbar is drawn from the same lookup over one turn with ticks 0 to 1, so it is the field's own scale; its marker sits at the phase. Offset turns every color along the loop; Dome height and Warm level set the sweep; the Cells group sets the patchwork; Phase walks the whole field once around the map."],
      method: "Cyclic colormap from k-means · Field in turns · Cell steps, fans and flares · Value dither · Multiplied lines · True-scale colorbar",
      points: [
        { u: .15, v: .35, d: "KEY", label: "Warm plateau: the field held at 0.43 turn, orange 250 99 26, flat across several cells.", t: "field", dir: [-1, 0] },
        { u: .4, v: .32, d: "READ", label: "Flank: from orange down through red and magenta to violet; the dither speckle is densest here, σ 3.8.", t: "grain", dir: [1, 0] },
        { u: .82, v: .86, d: "KEY", label: "Cold pool: the field pulled to navy 3 7 109, the color where the loop closes; grain σ 0.2.", t: "field", dir: [1, 1] },
        { u: .1, v: .15, d: "READ", label: "Grid crossing: two 2 px lines that multiply the field to about 0.45 of its value.", t: "grid", dir: [-1, -1] },
        { u: .83, v: .46, d: "READ", label: "Cell step: one cell offset by up to 0.09 turn, so its edges show a hard change of color.", t: "cells", dir: [1, 0] },
        { u: .2, v: .39, d: "KEY", label: "Fan: inside one cell the field turns up to 0.85 turn around a corner and fades over 1.8 times the cell's short side.", t: "cells", dir: [0, -1] },
        { u: .68, v: .12, d: "KEY", label: "Hot spot: small domes that climb whole turns, so each reads as rings of every color.", t: "spot", dir: [1, -1] },
        { u: .68, v: .19, d: "READ", label: "Jet: a ridge along the grid line under the hot spot that pulls the field toward yellow.", t: "spot", dir: [1, 0] },
        { u: .5, v: .949, d: "KEY", label: "Colorbar: the same lookup drawn over one turn, 0 to 1, so it is the true scale of the field above.", t: "foot", dir: [0, 1] },
        { u: .5, v: .93, d: "READ", label: "Caption: editable Mindgut copy in Archivo 400 at 199 210 247, centered over the bar.", t: "foot", dir: [0, -1] }
      ] }
  });
})();
