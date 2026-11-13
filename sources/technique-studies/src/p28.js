/* ===== PLATE 28 · RIPPLE FIELD =====
   an embroidered ground: two flat greens in concentric bands whose edges are torn by one roughness
   field; stitched picture patches (flat thread colors, comb-toothed edges, show-through along the
   thread columns); thick yellow outline flowers torn by the same field; a crisp UI card on top. */
(function () {
  const REF = { w: 2048, h: 1152 };
  function rrect(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function capRatio(g, font) { g.font = font; const m = g.measureText("H"); return (m.actualBoundingBoxAscent || 73) / 100; }
  /* ---- motifs, flat colors in patch-local coordinates; `acc` draws the same shapes in the second thread ---- */
  function motifFlower(g, w, h, C, acc) {
    const cx = w * .46, cy = h * .36, pet = acc ? C.petal2 : C.petal, disc = acc ? C.petal : C.disc;
    g.strokeStyle = acc ? C.leaf2 : C.stem; g.lineWidth = w * .03; g.lineCap = "round"; g.beginPath(); g.moveTo(cx, cy + h * .1); g.quadraticCurveTo(cx - w * .02, cy + h * .4, cx - w * .03, h * .9); g.stroke();
    g.fillStyle = acc ? C.petal2 : C.leaf; g.beginPath(); g.ellipse(cx + w * .1, cy + h * .36, w * .12, w * .06, -.5, 0, 6.3); g.fill();
    g.fillStyle = acc ? C.petal2 : C.leaf; g.beginPath(); g.moveTo(cx - w * .14, h * .78); g.lineTo(cx + w * .14, h * .78); g.lineTo(cx + w * .11, h * .98); g.lineTo(cx - w * .11, h * .98); g.closePath(); g.fill();
    g.fillStyle = pet; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; g.beginPath(); g.ellipse(cx + Math.cos(a) * w * .19, cy + Math.sin(a) * w * .19, w * .12, w * .055, a, 0, 6.3); g.fill(); }
    g.fillStyle = disc; g.beginPath(); g.arc(cx, cy, w * .135, 0, 6.3); g.fill();
  }
  function motifSpiral(g, w, h, C, acc) {
    g.strokeStyle = acc ? C.bg : C.ribbon; g.lineWidth = h * .11; g.lineCap = "round"; g.beginPath();
    const cx = w * .56, cy = h * .72, turns = 2.6, pitch = h * .19; for (let t = 0; t <= turns * 6.283; t += .08) { const r = 4 + t / 6.283 * pitch, x = cx + Math.cos(t) * r * 1.15, y = cy + Math.sin(t) * r; t ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }
  function motifRings(g, w, h, C, acc, pitch, band) {
    g.strokeStyle = acc ? C.bg : C.ring; g.lineWidth = band; const cx = w * .41, cy = h * 1.0;
    for (let r = pitch * .6; r < Math.hypot(w, h * 2); r += pitch) { g.beginPath(); g.arc(cx, cy, r, 0, 6.3); g.stroke(); }
  }
  function motifIris(g, w, h, C, acc) {
    const lil = acc ? C.navy : C.lilac, nav = acc ? C.lilac : C.navy, ora = acc ? C.navy : C.orange;
    g.strokeStyle = acc ? C.navy : C.stem; g.lineWidth = w * .035; g.lineCap = "round"; g.beginPath(); g.moveTo(w * .46, h); g.quadraticCurveTo(w * .50, h * .6, w * .6, h * .28); g.stroke();
    const leaf = (x0, y0, x1, y1, wd, col) => { const dx = x1 - x0, dy = y1 - y0, nx = -dy, ny = dx, L = Math.hypot(dx, dy), kx = nx / L * wd, ky = ny / L * wd; g.fillStyle = col; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + dx * .5 + kx, y0 + dy * .5 + ky, x1, y1); g.quadraticCurveTo(x0 + dx * .5 - kx, y0 + dy * .5 - ky, x0, y0); g.closePath(); g.fill(); };
    leaf(w * .44, h * .98, w * .12, h * .60, w * .17, lil); leaf(w * .44, h * .98, w * .21, h * .58, w * .045, nav);
    leaf(w * .50, h * .96, w * .82, h * .64, w * .15, ora); leaf(w * .50, h * .96, w * .75, h * .64, w * .04, nav);
    /* head: three petals, one falling */
    leaf(w * .6, h * .3, w * .44, h * .07, w * .14, lil); leaf(w * .6, h * .3, w * .78, h * .08, w * .14, nav); leaf(w * .6, h * .3, w * .88, h * .36, w * .11, ora);
    leaf(w * .6, h * .3, w * .51, h * .11, w * .035, nav); leaf(w * .6, h * .3, w * .73, h * .13, w * .035, ora);
  }
  function flowerPath(g, cx, cy, S, petals, seed) {
    const rr = mulberry(seed), r0 = S * .08, tip = S * .44;
    g.beginPath(); g.arc(cx, cy, r0, 0, 6.3);
    /* each petal is a rounded loop: a pinched base, a broad rounded far end */
    for (let i = 0; i < petals; i++) { const a = i / petals * 6.283 + (rr() - .5) * .3, len = tip * (.8 + rr() * .3), wd = S * (.15 + rr() * .06), c = Math.cos(a), s = Math.sin(a), nx = -s, ny = c; const bx = cx + c * r0 * 1.5, by = cy + s * r0 * 1.5, tx = cx + c * len, ty = cy + s * len; g.moveTo(bx, by); g.bezierCurveTo(bx + nx * wd * 1.1 + c * len * .15, by + ny * wd * 1.1 + s * len * .15, tx + nx * wd * 1.2 + c * len * .08, ty + ny * wd * 1.2 + s * len * .08, tx, ty); g.bezierCurveTo(tx - nx * wd * 1.2 + c * len * .08, ty - ny * wd * 1.2 + s * len * .08, bx - nx * wd * 1.1 + c * len * .15, by - ny * wd * 1.1 + s * len * .15, bx, by); }
  }
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), rnd = mulberry(P.seed * 7919 + 11);
    /* ---- pass 1: one roughness field at half resolution, two components, upsampled ---- */
    const w0 = Math.ceil(W / 2), h0 = Math.ceil(H / 2), nA = vnoise(P.seed + 1), nB = vnoise(P.seed + 2), ls = P.lump * u / 2;
    const fx = new Float32Array(w0 * h0), fy = new Float32Array(w0 * h0), fw = new Float32Array(w0 * h0), rA = P.rough * u * 2, tA = P.teeth * u * 2, ts = 4 * P.thread * u / 2;
    for (let j = 0; j < h0; j++) for (let i = 0; i < w0; i++) { const k = j * w0 + i; fx[k] = (fbm(nA, i / ls, j / ls, 3) - .5) * rA + (nA(i / ts + 97, j / ts + 41) - .5) * tA; fy[k] = (fbm(nB, i / ls + 31, j / ls - 17, 3) - .5) * rA + (nB(i / ts - 53, j / ts + 71) - .5) * tA; fw[k] = fbm(nA, i / (ls * 1.7) + 57, j / (ls * 1.7) + 23, 2) - .5; }
    const DX = upsampleCR(fx, w0, h0, W, H), DY = upsampleCR(fy, w0, h0, W, H), DW = upsampleCR(fw, w0, h0, W, H);
    /* ---- pass 2: patches (crisp rects) with flat motifs on their own canvases ---- */
    const pw = P.patchScale, segDir = (segs) => (x, y) => { let bd = 1e18, ba = 0; for (const [x0, y0, x1, y1] of segs) { const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy, t = clamp(((x - x0) * dx + (y - y0) * dy) / L2, 0, 1), ex = x0 + dx * t - x, ey = y0 + dy * t - y, d2 = ex * ex + ey * ey; if (d2 < bd) { bd = d2; ba = Math.atan2(dy, dx); } } return ba; };
    const defs = [
      { x: 289, y: 323, w: 252, h: 252, bg: C.teal, draw: (gg, w, h, acc) => motifFlower(gg, w, h, { petal: css(C.orange), petal2: css(C.red), disc: css(C.lilac), stem: css(C.tealDark), leaf: css(C.orange), leaf2: css(C.lilac) }, acc), dir: (w, h) => () => Math.PI / 2, lat: Math.PI / 2, showK: .7 },
      { x: 370, y: 550, w: 460, h: 214, bg: C.purple, draw: (gg, w, h, acc) => motifSpiral(gg, w, h, { ribbon: css(C.sky), bg: css(C.purple) }, acc), dir: (w, h) => (x, y) => Math.atan2(y - h * .72, (x - w * .56) / 1.15) + Math.PI / 2, lat: 0, showK: .4 },
      { x: 1150, y: 300, w: 460, h: 240, bg: C.tealDark, draw: (gg, w, h, acc) => motifRings(gg, w, h, { ring: css(C.tealLight), bg: css(C.tealDark) }, acc, (P.patchPitch ?? 40) * u, (P.patchPitch ?? 40) * u * .4), dir: (w, h) => (x, y) => Math.atan2(y - h, x - w * .41) + Math.PI / 2, lat: 0, showK: .4 },
      { x: 1507, y: 543, w: 251, h: 268, bg: C.red, draw: (gg, w, h, acc) => motifIris(gg, w, h, { lilac: css(C.lilac), navy: css(C.thread), orange: css(C.orange), stem: css(C.tealLight) }, acc), dir: (w, h) => segDir([[w * .46, h, w * .6, h * .28], [w * .44, h * .98, w * .10, h * .58], [w * .50, h * .96, w * .84, h * .62], [w * .6, h * .3, w * .42, h * .05], [w * .6, h * .3, w * .8, h * .06], [w * .6, h * .3, w * .9, h * .36]]), lat: -62 * Math.PI / 180, showK: .5 }
    ];
    /* each motif becomes a bed of capsule stitches: a dark flank, the thread color, a lit center line, laid along the motif's direction field */
    const sp = 3.5 * P.thread * u, sl = 12 * P.thread * u, show = P.show;
    const patches = defs.map((d, pi) => {
      const w = Math.round(d.w * u * pw), h = Math.round(d.h * u * pw), cxp = (d.x + d.w / 2 - REF.w / 2) * u * P.spread + W / 2, cyp = (d.y + d.h / 2 - REF.h / 2) * u * P.spread + H / 2;
      const M = mk(w, h), A = mk(w, h), gm = M.getContext("2d"), ga = A.getContext("2d");
      d.draw(gm, w, h, false); d.draw(ga, w, h, true);
      const md = gm.getImageData(0, 0, w, h).data, ad = ga.getImageData(0, 0, w, h).data, S = mk(w, h), gs = S.getContext("2d"), dirF = d.dir(w, h), rs = mulberry(P.seed * 131 + pi * 17 + 3);
      gs.lineCap = "round"; const lit = P.lit, d0 = d.lat, ux = Math.cos(d0), uy = Math.sin(d0), vx = -uy, vy = ux, diag = Math.hypot(w, h);
      /* satin lattice: columns one thread apart across the patch's dominant direction, stitches end to end along it with a per-column phase */
      for (let c = -diag / 2; c <= diag / 2; c += sp) { const ph = rs() * sl; for (let t = -diag / 2 + ph; t <= diag / 2; t += sl * .62) {
        const jx = w / 2 + c * vx + t * ux + (rs() - .5) * sp * .5, jy = h / 2 + c * vy + t * uy + (rs() - .5) * sp * .5, ix = Math.floor(jx), iy = Math.floor(jy); if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
        const mi = (iy * w + ix) * 4; if (md[mi + 3] < 128) continue;
        const src = rs() < show * d.showK ? ad : md, r0 = src[mi], g0 = src[mi + 1], b0 = src[mi + 2];
        const an = dirF(jx, jy) + (rs() - .5) * .12, L = sl * (.75 + rs() * .5), cc = Math.cos(an) * L / 2, sn = Math.sin(an) * L / 2;
        gs.beginPath(); gs.moveTo(jx - cc, jy - sn); gs.lineTo(jx + cc, jy + sn);
        gs.strokeStyle = `rgb(${r0 * (1 - .14 * lit) | 0},${g0 * (1 - .14 * lit) | 0},${b0 * (1 - .14 * lit) | 0})`; gs.lineWidth = sp; gs.stroke();
        gs.strokeStyle = `rgb(${r0 | 0},${g0 | 0},${b0 | 0})`; gs.lineWidth = sp * .6; gs.stroke();
        if (lit > 0) { gs.strokeStyle = `rgb(${Math.min(255, r0 + (255 - r0) * .16 * lit) | 0},${Math.min(255, g0 + (255 - g0) * .16 * lit) | 0},${Math.min(255, b0 + (255 - b0) * .16 * lit) | 0})`; gs.lineWidth = sp * .22; gs.stroke(); }
      } }
      return { x: Math.round(cxp - w / 2), y: Math.round(cyp - h / 2), w, h, bg: d.bg, s: gs.getImageData(0, 0, w, h).data, r: 12 * P.corners * u };
    });
    /* ---- pass 3: yellow outline flowers on a full canvas ---- */
    const Y = mk(W, H), gy = Y.getContext("2d"); gy.strokeStyle = "#fff"; gy.lineWidth = P.lineW * u; gy.lineJoin = "round"; gy.lineCap = "round";
    const nf = Math.round(P.flowers), fl = [];
    for (let i = 0; i < nf; i++) { const S = P.flowerSize * u * (i ? .75 + rnd() * .5 : 1); let x = W * .535, y = H * .285; if (i) for (let t = 0; t < 60; t++) { x = W * (.12 + rnd() * .76); y = H * (.1 + rnd() * .8); if (fl.every(f => Math.hypot(f.x - x, f.y - y) > (f.S + S) * .55) && patches.every(q => x < q.x - S * .3 || x > q.x + q.w + S * .3 || y < q.y - S * .3 || y > q.y + q.h + S * .3)) break; } fl.push({ x, y, S, seed: P.seed * 31 + i }); }
    fl.forEach(f => { flowerPath(gy, f.x, f.y, f.S, Math.round(P.petals ?? 5), f.seed); gy.stroke(); });
    const yd = gy.getImageData(0, 0, W, H).data;
    /* ---- pass 4: the pixel pass: ground bands, patches, flowers, all through the one field ---- */
    const img = g.createImageData(W, H), d = img.data, fray = .7 * u, pitch = P.pitch * u, hw = P.band * u / 2, soft = 1 / (P.edgeSoft * u), grain = P.grain ?? 1.2, combR = Math.ceil(P.comb * u * .4) + 1;
    const cx = W / 2 + P.centerX * u, cy = H / 2 + P.centerY * u, ph = P.phase || 0, r0 = ((P.ring0 ?? 22.7) + ph * P.pitch) * u;
    const dark = C.dark, light = C.light, yel = C.yellow, comb = P.comb * u, nS = vnoise(P.seed + 3), seedT = P.seed + 9, wmod = P.widthVar * 2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = y * W + x, j = k * 4;
      const hh = hashI(x, y, seedT), h2 = (hh * 61.7) % 1;
      let kf = k; if (ph > 0) { const ex = x + .5 - cx, ey = y + .5 - cy, er = Math.sqrt(ex * ex + ey * ey) + 1e-6, shf = ph * pitch / er; let mx = Math.round(x - ex * shf), my = Math.round(y - ey * shf); if (mx < 0) mx = 0; else if (mx >= W) mx = W - 1; if (my < 0) my = 0; else if (my >= H) my = H - 1; kf = my * W + mx; }
      const wx = x + .5 + DX[kf] + (hh - .5) * fray, wy = y + .5 + DY[kf] + (h2 - .5) * fray;
      let cr, cg, cb;
      const ddx = wx - cx, ddy = wy - cy, rr = Math.sqrt(ddx * ddx + ddy * ddy), dd = ((rr - r0 + pitch / 2) % pitch + pitch) % pitch, bt = clamp((hw * (1 + DW[kf] * wmod) - Math.abs(dd - pitch / 2)) * soft + .5, 0, 1);
      cr = dark[0] + (light[0] - dark[0]) * bt; cg = dark[1] + (light[1] - dark[1]) * bt; cb = dark[2] + (light[2] - dark[2]) * bt;
      for (let pi = 0; pi < patches.length; pi++) {
        const q = patches[pi], lx = x + .5 - q.x, ly = y + .5 - q.y; if (lx < 0 || ly < 0 || lx >= q.w || ly >= q.h) continue;
        const r = q.r, ex = lx < r ? r - lx : lx > q.w - r ? lx - (q.w - r) : 0, ey = ly < r ? r - ly : ly > q.h - r ? ly - (q.h - r) : 0; if (ex * ex + ey * ey > r * r) continue;
        const sat = (nS(x / sp + pi * 9.1, y / (sl * .7)) - .5) * 7 * P.lit;                     // faint satin columns on the patch ground
        cr = q.bg[0] + sat; cg = q.bg[1] + sat; cb = q.bg[2] + sat;
        let sx = Math.floor(x + .5 + DX[kf] * .3 - q.x), sy = Math.floor(y + .5 + DY[kf] * .3 - q.y); if (sx < 0) sx = 0; else if (sx >= q.w) sx = q.w - 1; if (sy < 0) sy = 0; else if (sy >= q.h) sy = q.h - 1;
        const mi = (sy * q.w + sx) * 4, ma = q.s[mi + 3]; if (ma > 20) { const fa = ma / 255; cr += (q.s[mi] - cr) * fa; cg += (q.s[mi + 1] - cg) * fa; cb += (q.s[mi + 2] - cb) * fa; }
        break;
      }
      /* yellow outline flowers: torn by the field, over the patches, under the card */
      let yx = Math.floor(wx), yy = Math.floor(wy); if (yx < 0) yx = 0; else if (yx >= W) yx = W - 1; if (yy < 0) yy = 0; else if (yy >= H) yy = H - 1;
      const yl = Math.max(0, yy - combR), yh = Math.min(H - 1, yy + combR);
      if (yd[(yy * W + yx) * 4 + 3] > 20 || yd[(yl * W + yx) * 4 + 3] > 20 || yd[(yh * W + yx) * 4 + 3] > 20) {   /* near the outline: comb the satin columns */
        let y2 = Math.floor(wy + (nS(x / sp + 3.1, y / sl) - .5) * comb * .8); if (y2 < 0) y2 = 0; else if (y2 >= H) y2 = H - 1;
        const ya = yd[(y2 * W + yx) * 4 + 3]; if (ya > 20) { const fa = ya / 255; cr += (yel[0] - cr) * fa; cg += (yel[1] - cg) * fa; cb += (yel[2] - cb) * fa; }
      }
      const gn = (h2 - .5) * grain; d[j] = cr + gn; d[j + 1] = cg + gn; d[j + 2] = cb + gn; d[j + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    /* ---- pass 5: the card on its own layer, then the resample softening the reference carries, composited on top ---- */
    const Lc = mk(W, H), gc = Lc.getContext("2d");
    const cw = (P.cardW ?? 1126) * u, ch = (P.cardH ?? 229) * u, cx0 = W / 2 - cw / 2, cy0 = H / 2 - ch / 2, cr0 = 24 * P.corners * u, ink = C.ink;
    gc.fillStyle = css(C.card); rrect(gc, cx0, cy0, cw, ch, cr0); gc.fill();
    const capM = capRatio(g, `100px "JetBrains Mono",monospace`) || .73, fs1 = P.typeCap * u / capM, fs2 = P.typeCap * u * .733 / capM, pad = 22 * u * (ch / (229 * u));
    /* icon: periwinkle tile, scalloped light-blue bloom, Mindgut's little robot in navy */
    const is = (P.iconSize ?? 88) * u, ix = cx0 + pad, iy = cy0 + 18 * u * (ch / (229 * u));
    gc.fillStyle = css(C.peri); rrect(gc, ix, iy, is, is, is * .2); gc.fill();
    gc.fillStyle = css(C.sky); gc.beginPath(); for (let i = 0; i <= 60; i++) { const a = i / 60 * 6.283 + .3, r = is * .27 * (1 + .2 * Math.cos(5 * a)); i ? gc.lineTo(ix + is / 2 + Math.cos(a) * r, iy + is / 2 + Math.sin(a) * r) : gc.moveTo(ix + is / 2 + Math.cos(a) * r, iy + is / 2 + Math.sin(a) * r); } gc.closePath(); gc.fill();
    /* the robot's head as the icon mark: the same head as the robot plates (visor, two eyes, smile, antenna ball), flat navy */
    { const hx = ix + is / 2, hy = iy + is / 2 + is * .06, hw2 = is * .17, hh = is * .125, rr = is * .055, nv = css(C.navy), sk = css(C.sky);
      gc.fillStyle = nv; gc.fillRect(hx - is * .011, hy - hh - is * .1, is * .022, is * .1); gc.beginPath(); gc.arc(hx, hy - hh - is * .105, is * .03, 0, 6.3); gc.fill();
      rrect(gc, hx - hw2 - is * .03, hy - hh * .35, is * .04, hh * .7, is * .015); gc.fill(); rrect(gc, hx + hw2 - is * .01, hy - hh * .35, is * .04, hh * .7, is * .015); gc.fill();
      rrect(gc, hx - hw2, hy - hh, hw2 * 2, hh * 2, rr); gc.fill();
      gc.fillStyle = sk; rrect(gc, hx - hw2 * .74, hy - hh * .66, hw2 * 1.48, hh * 1.3, rr * .7); gc.fill();
      gc.fillStyle = nv; [-1, 1].forEach(sd => { gc.beginPath(); gc.arc(hx + sd * hw2 * .34, hy - hh * .1, is * .026, 0, 6.3); gc.fill(); });
      gc.strokeStyle = nv; gc.lineWidth = is * .018; gc.lineCap = "round"; gc.beginPath(); gc.arc(hx, hy + hh * .1, hw2 * .2, .4, Math.PI - .4); gc.stroke(); }
    /* prompt line */
    gc.fillStyle = css(ink); gc.textBaseline = "alphabetic"; gc.textAlign = "left"; gc.font = `${fs1}px "JetBrains Mono",monospace`;
    const TW = Math.ceil(cw), TH = Math.ceil(ch), Tc = mk(TW, TH), gt = Tc.getContext("2d"); gt.fillStyle = "#fff"; gt.strokeStyle = "#fff"; gt.lineJoin = "round"; gt.textBaseline = "alphabetic"; gt.textAlign = "left";
    const ptx = 143 * u * (cw / (1126 * u)), pty = iy - cy0 + is / 2 + P.typeCap * u * .5, ptxt = String(P.prompt || "").toUpperCase(); gt.font = `${fs1}px "JetBrains Mono",monospace`; gt.fillText(ptxt, ptx, pty); if (P.typeWeight > 0) { gt.lineWidth = P.typeWeight * u; gt.strokeText(ptxt, ptx, pty); }
    /* row 2: clip button, agent chip, send button */
    const ry = cy0 + ch - 15 * u * (ch / (229 * u)) - 77 * u, rh = 77 * u, bx = cx0 + 18 * u;
    gc.fillStyle = css(C.chip); rrect(gc, bx, ry, rh, rh, rh * .2); gc.fill();
    gc.strokeStyle = css(ink); gc.lineWidth = 2.6 * u; gc.lineCap = "round"; gc.lineJoin = "round";
    gc.save(); gc.translate(bx + rh / 2, ry + rh / 2); gc.rotate(-.78); gc.beginPath();
    gc.moveTo(-6.5 * u, -8 * u); gc.lineTo(-6.5 * u, 11 * u); gc.arc(0, 11 * u, 6.5 * u, Math.PI, 0, true); gc.lineTo(6.5 * u, -12 * u); gc.arc(0, -12 * u, 6.5 * u, 0, Math.PI, true); gc.lineTo(-6.5 * u, -12 * u + .01); gc.moveTo(-2.5 * u, -12 * u); gc.lineTo(-2.5 * u, 8 * u); gc.arc(0, 8 * u, 2.5 * u, Math.PI, 0, true); gc.lineTo(2.5 * u, -6 * u); gc.stroke(); gc.restore();
    gc.font = `${fs2}px "JetBrains Mono",monospace`; const agent = String(P.agent || "").toUpperCase(), aw = gc.measureText(agent).width, chipX = bx + rh + 11 * u, chipW = aw + 118 * u, tw = P.typeWeight * u;
    gc.fillStyle = css(C.chip); rrect(gc, chipX, ry, chipW, rh, rh * .2); gc.fill();
    gt.font = `${fs2}px "JetBrains Mono",monospace`; gt.fillText(agent, chipX - cx0 + 65 * u, ry - cy0 + rh / 2 + P.typeCap * u * .733 / 2); if (tw > 0) { gt.lineWidth = tw * .8; gt.strokeText(agent, chipX - cx0 + 65 * u, ry - cy0 + rh / 2 + P.typeCap * u * .733 / 2); }
    /* type layer: the resample blur the reference's glyphs carry, then ink composited over the card */
    { const td = gt.getImageData(0, 0, TW, TH).data, n = TW * TH; let al = new Float32Array(n); for (let i = 0; i < n; i++) al[i] = td[i * 4 + 3] / 255; 
      const hk = P.halo ?? .9, wide = hk > 0 ? gblur(al, TW, TH, 1.6 * u) : null;                                 // resample ringing: a bright halo hugging each glyph
      const ox = Math.round(cx0), oy = Math.round(cy0), cd = gc.getImageData(ox, oy, TW, TH), dd2 = cd.data; for (let yy = 0; yy < TH; yy++) for (let xx = 0; xx < TW; xx++) { const i = yy * TW + xx; let a = al[i]; if (wide) a += (al[i] - wide[i]) * hk; if (a > -.002 && a <= .002) continue; const j = i * 4; if (a > 0) { if (a > 1) a = 1; dd2[j] += (ink[0] - dd2[j]) * a; dd2[j + 1] += (ink[1] - dd2[j + 1]) * a; dd2[j + 2] += (ink[2] - dd2[j + 2]) * a; } else { const b = Math.min(1, -a * 2); dd2[j] += (255 - dd2[j]) * b; dd2[j + 1] += (255 - dd2[j + 1]) * b; dd2[j + 2] += (255 - dd2[j + 2]) * b; } } gc.putImageData(cd, ox, oy); }
    gc.strokeStyle = css(ink); gc.lineWidth = 2.6 * u; gc.beginPath(); const vx = chipX + 65 * u + aw + 26 * u, vy = ry + rh / 2; gc.moveTo(vx - 7 * u, vy - 4 * u); gc.lineTo(vx, vy + 3.5 * u); gc.lineTo(vx + 7 * u, vy - 4 * u); gc.stroke();
    const sx0 = cx0 + cw - 19 * u - 75 * u; gc.fillStyle = css(C.peri); rrect(gc, sx0, ry, 75 * u, rh, rh * .2); gc.fill();
    gc.strokeStyle = css(C.card); gc.lineWidth = 3 * u; gc.beginPath(); const ax = sx0 + 37.5 * u, ay = ry + rh / 2; gc.moveTo(ax - 13 * u, ay); gc.lineTo(ax + 13 * u, ay); gc.moveTo(ax + 4 * u, ay - 9 * u); gc.lineTo(ax + 13 * u, ay); gc.lineTo(ax + 4 * u, ay + 9 * u); gc.stroke();
    /* soften the card layer and composite */
    { const m = Math.ceil(4 * u), ox = Math.max(0, Math.round(cx0) - m), oy = Math.max(0, Math.round(cy0) - m), rw = Math.min(W - ox, Math.ceil(cw) + 2 * m), rh2 = Math.min(H - oy, Math.ceil(ch) + 2 * m), ld = gc.getImageData(ox, oy, rw, rh2).data, n = rw * rh2, sg = P.cardSoft * u;
      let ch4 = [new Float32Array(n), new Float32Array(n), new Float32Array(n), new Float32Array(n)]; for (let i = 0, j = 0; i < n; i++, j += 4) { const al = ld[j + 3] / 255; ch4[0][i] = ld[j] * al; ch4[1][i] = ld[j + 1] * al; ch4[2][i] = ld[j + 2] * al; ch4[3][i] = al; }
      if (sg > .05) ch4 = ch4.map(c => gblur(c, rw, rh2, sg));
      const bs = g.getImageData(ox, oy, rw, rh2), bd = bs.data; for (let i = 0, j = 0; i < n; i++, j += 4) { const al = ch4[3][i]; if (al <= 0) continue; const k = 1 - al; bd[j] = clamp(bd[j] * k + ch4[0][i], 0, 255); bd[j + 1] = clamp(bd[j + 1] * k + ch4[1][i], 0, 255); bd[j + 2] = clamp(bd[j + 2] * k + ch4[2][i], 0, 255); } g.putImageData(bs, ox, oy); }
  }
  PLATES.push({
    id: "p28", no: "28", title: "Ripple Field", ref: REF, render,
    line: "An embroidered green ground of concentric bands torn by one roughness field, stitched picture patches and yellow outline flowers torn by the same field, under a crisp prompt card.",
    texts: [
      { key: "prompt", label: "Prompt line", def: "ASK MIR ANYTHING.." },
      { key: "agent", label: "Agent chip", def: "HELIX 1" }
    ],
    params: [
      { key: "pitch", label: "Ring pitch", min: 40, max: 220, step: .5, def: 103.3, unit: "px", group: "Ripple", why: "Radial distance between light bands." },
      { key: "band", label: "Band width", min: 6, max: 90, step: .5, def: 26, unit: "px", group: "Ripple", why: "Width of each light band before the edge is torn." },
      { key: "centerX", label: "Center x", min: -1000, max: 1000, step: 1, def: 0, unit: "px", group: "Ripple", why: "Ring center across the plate, from the middle." },
      { key: "centerY", label: "Center y", min: -600, max: 600, step: 1, def: -68, unit: "px", group: "Ripple", why: "Ring center down the plate, from the middle; the reference sits 68 px above it." },
      { key: "rough", label: "Tear", min: 0, max: 30, step: .1, def: 8, unit: "px", group: "Field", why: "Displacement every edge takes from the roughness field." },
      { key: "lump", label: "Lump size", min: 6, max: 120, step: .5, def: 28, unit: "px", group: "Field", why: "Scale of the field's largest lumps; smaller values tear finer." },
      { key: "edgeSoft", label: "Edge softness", min: .5, max: 14, step: .1, def: 2.75, unit: "px", group: "Field", why: "Width of the tone ramp at a band edge; the reference's edges blend over about 2 px." },
      { key: "widthVar", label: "Band swell", min: 0, max: 1, step: .01, def: .5, unit: "×", group: "Field", why: "How much the band width swells and thins along its length." },
      { key: "teeth", label: "Teeth", min: 0, max: 8, step: .05, def: 3.6, unit: "px", group: "Field", why: "Amplitude of the fine tooth noise on every torn edge." },
      { key: "thread", label: "Thread scale", min: .4, max: 4, step: .01, def: 1, unit: "×", group: "Stitch", why: "Scales the thread: column width 3.5 px, stitch length 12 px, and the 4 px teeth on every torn edge." },
      { key: "comb", label: "Comb depth", min: 0, max: 24, step: .1, def: 3, unit: "px", group: "Stitch", why: "How far the satin columns of the yellow outline overshoot its edge." },
      { key: "lit", label: "Thread relief", min: 0, max: 2, step: .01, def: .4, unit: "×", group: "Stitch", why: "Contrast of each stitch's dark flank and lit center line, and the faint satin on the patch grounds; 0 is flat thread." },
      { key: "show", label: "Show-through", min: 0, max: .8, step: .01, def: .27, unit: "", group: "Stitch", why: "Share of stitches laid in the second thread color." },
      { key: "flowers", label: "Flowers", min: 0, max: 8, step: 1, def: 3, unit: "", group: "Flowers", why: "Count of yellow outline flowers." },
      { key: "flowerSize", label: "Flower size", min: 80, max: 500, step: 1, def: 252, unit: "px", group: "Flowers", why: "Span of the largest flower." },
      { key: "lineW", label: "Outline weight", min: 3, max: 30, step: .25, def: 9, unit: "px", group: "Flowers", why: "Width of the yellow line before it is torn." },
      { key: "patchScale", label: "Patch size", min: .4, max: 1.6, step: .01, def: 1, unit: "×", group: "Patches", why: "Scales the four picture patches about their centers." },
      { key: "spread", label: "Patch spread", min: .3, max: 1.6, step: .01, def: 1, unit: "×", group: "Patches", why: "Moves the patches toward or away from the plate center." },
      { key: "corners", label: "Corners", min: 0, max: 5, step: .01, def: 1, unit: "×", group: "Card", why: "Corner radius scale: the card's 24 px and the patches' 12 px together; 5 makes pills." },
      { key: "typeCap", label: "Type cap height", min: 16, max: 48, step: .5, def: 30, unit: "px", group: "Card", why: "Cap height of the prompt line; the chip text follows at 0.73×." },
      { key: "typeWeight", label: "Type weight", min: 0, max: 5, step: .05, def: .5, unit: "px", group: "Card", why: "Ink stroke added around the mono glyphs; 0 is JetBrains Mono Regular as loaded." },
      { key: "cardSoft", label: "Card softening", min: 0, max: 3, step: .05, def: .35, unit: "px σ", group: "Card", why: "Resample blur on the whole card layer (edge, icon, chips, type), as the reference carries; 0 is crisp vector." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 5, unit: "", group: "Field", why: "Re-rolls the roughness field, the threads and the flower positions." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop: the bands move outward by one pitch per cycle." }
    ],
    motion: [
      { key: "phase", amp: 1, period: 6, mode: "saw" },
      { key: "rough", amp: 2.5, period: 7, mode: "sine" },
      { key: "centerX", amp: 40, period: 11, mode: "drift" }
    ],
    live: { x: { key: "centerX", min: -800, max: 800 }, y: { key: "rough", min: 0, max: 24 } },
    bench: { palette: "measured", params: { prompt: "ASK DESSN ANYTHING..", agent: "AGENT 1" },
      note: "The benchmark sets the card copy to the reference wording so the type patches compare the same glyphs. Motifs are the engine's own, so the stitched patch compares color shares, not drawing. The first flower sits at the reference flower's center so its rect compares like with like.", items: [
      { name: "ripple ground", ref: [100, 800, 400, 300], out: [100, 800, 400, 300], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 10, inks: [[16, 141, 71], [44, 153, 92]], inkNames: ["dark", "light"] },
      { name: "card edge", ref: [1300, 648, 190, 92], out: [1300, 648, 190, 92], m: ["hist", "mean", "std", "ink", "share"], inks: [[239, 238, 231], [16, 141, 71], [44, 153, 92]], inkNames: ["card", "dark", "light"] },
      { name: "card flat", ref: [900, 548, 400, 48], out: [900, 548, 400, 48], m: ["hist", "mean", "std", "ink"], inks: [[239, 238, 231]], inkNames: ["card"] },
      { name: "prompt type", ref: [600, 500, 560, 48], out: [600, 500, 560, 48], m: ["hist", "mean", "std", "ink", "share"], inks: [[239, 238, 231], [64, 66, 90]], inkNames: ["card", "ink"] },
      { name: "stitched patch", ref: [1510, 560, 245, 245], out: [1510, 560, 245, 245], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[225, 74, 38], [140, 133, 173], [59, 65, 77], [241, 158, 40], [79, 191, 192]], inkNames: ["red", "lilac", "navy", "orange", "teal"] },
      { name: "outline flower", ref: [985, 210, 245, 245], out: [985, 210, 245, 245], m: ["hist", "mean", "std", "ink", "share"], inks: [[237, 171, 31], [16, 141, 71], [44, 153, 92]], inkNames: ["yellow", "dark", "light"] },
      { name: "whole plate", ref: [0, 0, 2048, 1152], out: [0, 0, 2048, 1152], m: ["ink", "share"], inks: [[16, 141, 71], [44, 153, 92], [239, 238, 231], [67, 178, 167], [130, 105, 193], [14, 115, 108], [225, 74, 38], [237, 171, 31], [129, 137, 199]], inkNames: ["dark", "light", "card", "teal", "purple", "tealDark", "red", "yellow", "peri"] }
    ] },
    palettes: [
      { id: "measured", name: "Field green", note: "measured", c: { dark: [16, 141, 71], light: [44, 153, 92], card: [239, 238, 231], chip: [220, 219, 216], ink: [64, 66, 90], peri: [129, 137, 199], sky: [186, 220, 234], navy: [54, 64, 93], thread: [59, 65, 77], teal: [67, 178, 167], tealDark: [14, 115, 108], tealLight: [79, 191, 192], purple: [130, 105, 193], red: [225, 74, 38], orange: [242, 161, 37], lilac: [142, 134, 176], yellow: [237, 171, 31] }, sw: ["#108d47", "#2c995c", "#eeede6", "#edab1f"] },
      { id: "indigo", name: "Indigo cloth", c: { dark: [28, 38, 110], light: [46, 60, 140], card: [244, 246, 250], chip: [226, 229, 236], ink: [30, 34, 60], peri: [255, 140, 80], sky: [255, 226, 180], navy: [40, 40, 70], thread: [40, 40, 70], teal: [255, 196, 90], tealDark: [120, 40, 70], tealLight: [255, 160, 140], purple: [60, 150, 150], red: [240, 220, 120], orange: [250, 120, 60], lilac: [120, 170, 230], yellow: [250, 236, 160] }, sw: ["#1c266e", "#2e3c8c", "#f4f6fa", "#faeca0"] },
      { id: "oxide", name: "Oxide", c: { dark: [122, 48, 36], light: [146, 66, 48], card: [246, 246, 246], chip: [226, 226, 226], ink: [40, 30, 30], peri: [60, 120, 110], sky: [200, 236, 230], navy: [30, 50, 50], thread: [30, 50, 50], teal: [240, 200, 90], tealDark: [40, 90, 100], tealLight: [150, 210, 200], purple: [60, 60, 90], red: [250, 230, 200], orange: [230, 120, 60], lilac: [170, 150, 200], yellow: [250, 236, 180] }, sw: ["#7a3024", "#924230", "#f6f6f6", "#faecb4"] },
      { id: "slate", name: "Slate", c: { dark: [52, 58, 68], light: [70, 78, 90], card: [250, 250, 252], chip: [230, 231, 235], ink: [28, 30, 36], peri: [255, 90, 60], sky: [255, 220, 210], navy: [50, 20, 20], thread: [50, 20, 20], teal: [230, 230, 230], tealDark: [90, 96, 110], tealLight: [200, 206, 220], purple: [250, 200, 60], red: [40, 130, 200], orange: [255, 120, 60], lilac: [220, 230, 250], yellow: [250, 250, 250] }, sw: ["#343a44", "#464e5a", "#fafafc", "#fafafa"] },
      { id: "ultramarine", name: "Ultramarine", c: { dark: [20, 60, 180], light: [40, 80, 205], card: [246, 248, 252], chip: [228, 232, 240], ink: [20, 30, 70], peri: [250, 120, 160], sky: [255, 230, 240], navy: [60, 20, 50], thread: [60, 20, 50], teal: [250, 160, 60], tealDark: [160, 40, 90], tealLight: [250, 200, 220], purple: [20, 170, 150], red: [250, 240, 120], orange: [250, 100, 60], lilac: [120, 230, 220], yellow: [250, 250, 200] }, sw: ["#143cb4", "#2850cd", "#f6f8fc", "#fafac8"] },
      { id: "night", name: "Night thread", c: { dark: [18, 20, 26], light: [34, 38, 48], card: [36, 38, 46], chip: [52, 56, 66], ink: [230, 232, 240], peri: [120, 220, 150], sky: [30, 40, 40], navy: [200, 250, 220], thread: [230, 240, 250], teal: [40, 120, 110], tealDark: [60, 40, 90], tealLight: [200, 160, 250], purple: [180, 60, 60], red: [40, 90, 160], orange: [250, 200, 80], lilac: [240, 150, 120], yellow: [250, 220, 90] }, sw: ["#12141a", "#222630", "#24262e", "#fadc5a"] }
    ],
    presets: [
      { name: "Reference seat", set: { pitch: 103.3, band: 26, rough: 8, lump: 28, teeth: 2.2 } },
      { name: "Fine ripple", set: { pitch: 56, band: 14, rough: 5, lump: 16, teeth: 1.5 } },
      { name: "Torn wide", set: { pitch: 150, band: 48, rough: 18, lump: 48, teeth: 3 } },
      { name: "Clean cut", set: { rough: 0, teeth: 0, comb: 0, show: 0 } }
    ],
    passes: [
      "pass 1, field: one roughness field at half resolution, three components upsampled with Catmull-Rom: two warp components (3-octave value noise with a 28 px base lump plus 4 px tooth noise) and one band-swell component; it displaces every torn edge",
      "pass 2, patches: four crisp rounded rects; each motif is drawn flat twice (first and second thread), then laid as a bed of capsule stitches on a satin lattice (3.5 px columns, 12 px stitches end to end) following the motif's direction field, each stitch a dark flank, the thread color and a lit center line; 27 % of stitches take the second thread",
      "pass 3, flowers: yellow outline flowers stroked flat on a full canvas, 10.5 px line, five petal loops around a ring",
      "pass 4, pixels: per pixel, the warped position (field plus 0.7 px fray) samples the ring function with a 2.75 px edge ramp, the stitch beds at 30 % of the tear, and the flower canvas through a satin comb; a faint satin on the patch grounds; 1.2/255 grain per pixel",
      "pass 5, card: the prompt card, icon, chips and buttons drawn on their own layer; the mono type gets a 0.5 px ink stroke and a bright resample halo; the layer is blurred by 0.35 px σ and composited on top"
    ],
    measured: {
      plate: "2048×1152; ring center (1024, 508) by maximizing the radial profile contrast of the light-green fraction; band centers 126, 228, 333, 436, 540, 642, 745, 849, 953, 1056 px, pitch 103.3, offset 22.7",
      bands: "light band width 25 to 26 px between mean edges; edge radius jitter σ 4.2 to 4.6 px, peak to peak 16 px, no periodic peak in the edge autocorrelation; mean zero-crossing period 20 to 27 px along the arc; 1 to 2 px teeth on top",
      greens: "k-means on the ground: dark (16,141,71) 74 %, light (44,153,92) 26 %; whole-plate green share 78 %",
      patches: "teal (67,178,167) at (289,323) 252 sq; purple (130,105,193) at (370,550) 460×214 with sky ribbons (188,221,236); dark teal (14,115,108) at (1150,300) with light teal (79,191,192) rings, pitch 40, band 16, center (1340,540); red (225,74,38) at (1507,543) 251×268 with lilac (140,133,173), navy (59,65,77), orange (241,158,40), teal stem (94,162,154); corner radius ≈ 10 to 12 px",
      stitches: "sunflower region autocorrelation x [0.79, 0.49, 0.32], y [0.85, 0.63, 0.46]: vertical threads about 3.5 px wide, stitches 10 to 12 px long; iris threads at 62°; the tooth noise on torn edges is set to 4 px, one thread wide",
      edges: "edge-radius spectrum along the 849 px ring (bands 80-40 … 3-2 px, log10 power): reference inner [4.39, 4.33, 3.52, 3.07, 2.84, 2.38, 2.08, 1.64], render [4.32, 3.54, 3.37, 3.09, 2.94, 2.46, 2.04, 1.79]: a red-noise profile with no peak at 20 to 27 px, so no sawtooth term was added",
      type: "reference glyph stems 4 to 5 px (run-length median 5), core (53,53,75), bulk 64 to 80 lum; 14 % of the type patch sits above 240 lum, a bright ringing halo around the glyphs, reproduced as an unsharp term on the type alpha",
      flowers: "yellow (237,171,31); line half-width 5.0 px by distance transform (10 to 11 px wide); the large flower spans 252 px centered at (1096, 329); five petal loops around a ring",
      card: "(461,463) to (1586,691), 1126×229, centered on the plate, corner radius 22 to 27 px, fill (238,237,230); icon tile 88 px periwinkle (129,137,199) at +22,+18 with a 55 px light-blue (183,221,234) bloom and a navy (54,64,93) mark; prompt cap height 30 px in (58,60,83) starting at +143; row two at +137: 77 px chip buttons (220,219,216), chip text cap 22 px; send button 75 px periwinkle 19 px from the right edge"
    },
    limits: [
      "The reference is a resampled JPEG: its band edges blend over 2 to 3 px and its dark green (lum 95.7) straddles a 16-bin histogram boundary, so the ripple-ground contrast and card-edge histogram sit near 0.96 to 0.97 even with a 2.75 px edge ramp and 1.2/255 grain.",
      "The patch motifs are the engine's own drawings laid as stitches, so the stitched-patch rect compares thread-color shares and texture statistics, not the figure; its histogram sits near 0.94 and its navy color near 0.93.",
      "The prompt type is JetBrains Mono Regular with a 0.5 px ink stroke, a bright ringing halo and a 0.35 px σ layer blur standing in for the reference's resampled glyphs; the type patch's histogram sits near 0.86.",
      "The yellow flowers after the first are seeded away from the patches, so the outline-flower rect scores only the first flower, drawn at the reference flower's center; its histogram sits near 0.84 from the JPEG edge blend."
    ],
    source: "Reference 28: an embroidered ripple ground with stitched picture patches and a prompt card, 2048×1152.",
    study: {
      slug: "ripple-field", lede: "Two greens in concentric bands, every edge torn by one roughness field, under a crisp card.",
      body: [
        "The ground is embroidery read as two flat greens, (16,141,71) and (44,153,92). Light bands 26 px wide sit every 103.3 px from a center 68 px above the plate's middle. Their edges are not lines: the band boundary wanders by 4.5 px σ with lumps 20 to 27 px long and 1 to 2 px teeth on top. The picture patches use the same material: flat thread colors, comb-toothed shape edges where thread columns 3.5 px wide overshoot, and a second color showing through along some columns. Yellow outline flowers 10.5 px wide are torn the same way. The prompt card is the one thing cut clean.",
        "The rebuild computes one roughness field at half resolution and lets it displace every sampled edge: the ring function, the stitch beds and the flower canvas are read at the warped position, with a 0.7 px fray and 1.2/255 grain added per pixel. Tear, lump size and teeth set the field. Thread scale sets the 3.5 px column width, the 12 px stitch length and the 4 px teeth together, thread relief sets each stitch's flank and center contrast, show-through sets how many stitches take the second thread. Pitch, band width, swell and center move the ripple. The card's corners, type size, type weight and softening are its own controls, and the prompt and chip copy are editable."
      ],
      method: "one roughness field · ring function sampled through it · flat motifs through a thread comb · crisp card over the warp",
      points: [
        { u: .15, v: .82, d: "KEY", label: "A light band 26 px wide: its edge wanders by 4.5 px σ with 4 px teeth, two flat greens and a 2 px ramp between.", t: "edge", dir: [1, 0] },
        { u: .50, v: .93, d: "READ", label: "Band pitch 103.3 px from the center 68 px above the plate middle; the lumps along an edge run 20 to 27 px.", t: "pull", dir: [0, 1] },
        { u: .20, v: .35, d: "KEY", label: "Flower patch: 14 orange petal ellipses and a lilac disc laid as vertical capsule stitches, 3.5 px columns, 12 px long, red second thread on 19 % of stitches.", t: "grain", dir: [0, 1] },
        { u: .80, v: .62, d: "KEY", label: "Iris patch: leaves as pointed lenses stitched along their own axes, navy and orange second thread on 14 % of stitches, each stitch with a dark flank and lit center.", t: "grain", dir: [1, -1] },
        { u: .67, v: .33, d: "READ", label: "Ringed patch: the same band function at 40 px pitch and 16 px band inside a crisp 12 px rounded rect.", t: "pull", dir: [1, 0] },
        { u: .30, v: .62, d: "READ", label: "Spiral patch: a sky-blue ribbon 24 px wide on purple, stitched along its tangent, 11 % second thread.", t: "edge", dir: [1, 0] },
        { u: .535, v: .285, d: "KEY", label: "Outline flower: five petal loops around a ring, a 9.5 px yellow line whose edges take the same 8 px tear and 4 px teeth as the bands.", t: "edge", dir: [0, 1] },
        { u: .50, v: .50, d: "KEY", label: "The card: a 24 px corner, 88 px icon tile, 30 px cap JetBrains Mono with a 0.5 px stroke and a bright ringing halo, the layer softened by 0.35 px σ.", t: "type", dir: [1, 0] },
        { u: .26, v: .55, d: "READ", label: "Icon: a scalloped light-blue bloom with the little robot mark in navy.", t: "type", dir: [0, 1] },
        { u: .75, v: .56, d: "READ", label: "Send button: 75 px periwinkle tile with a 3 px arrow, 19 px from the card's right edge.", t: "type", dir: [1, 0] }
      ]
    }
  });
})();
