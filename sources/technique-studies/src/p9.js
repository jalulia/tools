/* ===== PLATE 09 · DISC STACK =====
   one tone field (a domed gray spool, a stack of lit discs seen from above, two line-screen flanks) -> one
   position-hashed dither that screens every gray -> on the flanks, one warped stripe phase printed by three
   light plates that slip apart where the warp bends hardest, so the bends fringe red, yellow, green and cyan.
   The eye sits above the stack: lower discs tilt further toward it and sit further apart. */
(function () {
  const REF = { w: 736, h: 1282 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 7177 + 11), nA = vnoise(P.seed + 31), nB = vnoise(P.seed + 57), nC = vnoise(P.seed + 83);
    const cx = W * .5, colW = P.column * W * .5, ph = P.phase * 2 * Math.PI;
    /* ---- the stack: front-band rows grow apart and discs tilt further toward the eye as they go down ---- */
    const N = Math.max(1, Math.round(P.rings)), top = (P.top ?? .1605) * H, A0 = P.discW * W * .5, view = P.view, rings = [];
    { let y = top; const b0 = P.discH * A0;
      for (let i = 0; i < N; i++) {
        const t = (y - top) / H, b = b0 * (1 + view * t * 3.2), A = A0 * (i === N - 1 && N > 2 ? 1 + .15 * P.base : 1) * (1 + (nA(i * 3.7, 2.2) - .5) * .02);
        const T = P.rim * (1 * u + .14 * b);
        rings.push({ y, b, A, T, yc: y - (1 + P.inner) * b * .5 - T * .5 });
        y += P.spacing * u * (1 + view * t * .38) * (.98 + .04 * rnd());
      } }
    /* ---- tone field T (white coverage), color field col (three light plates), OPEN (how much of the color prints) ---- */
    const n = W * H, FL = new Float32Array(n), EA = new Float32Array(n), EB = new Float32Array(n), TN = new Float32Array(n), OPEN = new Float32Array(n), cR = new Float32Array(n), cG = new Float32Array(n), cB = new Float32Array(n);
    const gapIn = colW + 6 * u, chainA = Math.max(colW, A0) + P.gapW * u, stripeIn = chainA + P.chainW * u, stripeOut0 = stripeIn + P.stripes * W, edgeW = (P.edgeBand ?? 12) * u, flankOut = W * .5 - edgeW;
    const p1 = P.pitch * u, pc = P.chainPitch * u, mis = P.misreg * p1, wl = (P.warpLen ?? 300) * u, wa = P.warp * 18 * u;
    /* flare bumps: where the sheet bulges, the stripe zone flares outward and the lines fan and fold */
    const bumps = [[], []];
    for (let sd = 0; sd < 2; sd++) for (let k = 0; k < 3; k++) { const b = { y: H * (.18 + .3 * k + (rnd() - .5) * .14), r: H * (.07 + .05 * rnd()), a: .6 + .5 * rnd() };
      /* each bulge carries an eye: a gaussian push on the stripe phase strong enough to fold the lines into closed loops */
      b.ey = b.y + (rnd() - .5) * b.r * .8; b.ex = .35 + .4 * rnd(); b.sx = (18 + 10 * rnd()) * u; b.sy = b.r * (.45 + .25 * rnd()); b.sh = (rnd() - .5) * 1.2; b.K = (rnd() < .5 ? -1 : 1) * (22 + 16 * rnd()) * u; bumps[sd].push(b); }
    const flareAt = (sd, y) => { let f = 0; for (const b of bumps[sd]) { const d = (y - b.y) / b.r; f += b.a * Math.exp(-d * d); } return f; };
    const domeY = top - (P.dome ?? 1.2) * colW * .55;
    const GY = [new Float32Array(3), new Float32Array(3)];
    for (let y = 0; y < H; y++) {
      const fl = [P.flare * flareAt(0, y), P.flare * flareAt(1, y)];
      for (let sd = 0; sd < 2; sd++) for (let b = 0; b < 3; b++) { const B = bumps[sd][b], d = (y - B.ey) / B.sy; GY[sd][b] = Math.exp(-d * d); }
      for (let x = 0; x < W; x++) {
        const k = y * W + x, ax = Math.abs(x - cx), sd = x < cx ? 0 : 1, F = fl[sd];
        let t = 0;
        /* the spool: a domed gray column, brighter toward both edges as a turned surface catches side light */
        if (ax < colW) {
          const e = ax / colW, cap = y < domeY + colW * .55 ? Math.sqrt(Math.max(0, 1 - Math.pow((domeY + colW * .55 - y) / (colW * .55), 2))) : 1;
          if (e < cap) t = P.gray * (1 + P.sheen * (sstep(.55, .9, e / Math.max(cap, .01)) - .3)) * sstep(1, .95, e / Math.max(cap, .01)) * (y < domeY + colW * .55 ? .8 + .2 * cap : 1);
        }
        /* a lit keyline at the inner edge of each flank */
        if (Math.abs(ax - chainA + 4 * u) < 1.5 * u) { const kk = (P.keys ?? 1) * (.6 + .4 * nB(y / (60 * u), 21 + sd)); cR[k] = kk; cG[k] = kk; OPEN[k] = 1; }
        if (ax >= gapIn && ax < flankOut) {
          /* inner hairlines: 1 px lines in dashes between the black gap and the stripes; they sit on top of the screen, not through it */
          if (ax >= chainA && ax < stripeIn + 4 * u) {
            const yd = y + P.phase * 37.5 * u, xw = ax + 2.5 * u * Math.sin(y / (41 * u) + ax * .043), li = Math.round(xw / pc), dl = Math.abs(xw - li * pc), dash = hashI(li + sd * 977, Math.floor(yd / (P.dash * u) + hashI(li, sd, P.seed + 4) * 9), P.seed + 7);
            if (dl < .7 * u && dash < P.chainTone * (.45 + .55 * sstep(chainA, stripeIn, ax))) FL[k] = (.45 + .5 * hashI(li, Math.floor(y / (7 * u)), P.seed + 8)) * sstep(.7 * u, .2 * u, dl);
          }
          if (ax >= chainA) { t = Math.max(t, P.murk * (.6 + .8 * nC(x / (9 * u), y / (30 * u))));
            /* haze: dim specks over the flank black, the scanned sheet's own gray */
            const hz = hashI(x, y, P.seed + 17); if (hz < P.haze) FL[k] = Math.max(FL[k], .04 + .26 * hz / P.haze * hashI(x, y >> 1, P.seed + 18)); }
          /* the stripe field: one warped phase from the inner edge to the edge strip. Where the print is low its lines are dashed
             hairlines; in a bulge the print rises and the same lines go bold through the three light plates */
          const lim = flankOut - 12 * u, out = Math.min(lim, stripeOut0 + F * P.reach * W + 10 * u * (nB(y / (90 * u), sd * 5 + 2) - .5)), zin = sstep(stripeIn - 4 * u, stripeIn + 6 * u, ax), zone = zin * (1 - sstep(lim - 6 * u, lim, ax));
          if (zone > 0) {
            const q = clamp((ax - stripeIn) / (out - stripeIn + 1e-3), 0, 1.6), wv = Math.sin(2 * Math.PI * y / wl + ph + 1.7 * sd + 2.2 * q * F), wv2 = Math.sin(2 * Math.PI * y / (wl * .46) + ph * 2 + 3 * sd + 4.4 * q);
            let eye = 0, eg = 0;
            for (let b = 0; b < 3; b++) { const B = bumps[sd][b], gy = GY[sd][b]; if (gy < .01) continue; const dxe = (ax - (stripeIn + B.ex * (stripeOut0 - stripeIn)) - B.sh * (y - B.ey)) / B.sx, g = B.K * P.fold * gy * Math.exp(-dxe * dxe); eye += g; eg += -2 * dxe / B.sx * g; }
            const fanS = -(.5 + .5 * Math.sin(2 * Math.PI * y / (wl * .8) + ph + sd * 2)), disp = wa * (wv * (.35 + 2 * F * Math.min(q, 1)) + .45 * wv2 * F * q * q) + F * P.fan * (ax - stripeIn) * fanS + eye;
            /* the phase and its slope across the sheet: plates slip in space, so a fold (slope near 0) shows no fringe and a steep run shows a thin one */
            const phi = (ax + disp) / p1, dphi = (1 + eg + F * P.fan * fanS + wa * 2 * F * wv / (out - stripeIn + 1e-3)) / p1;
            /* moire: a second straight screen at a finer pitch beats against the warped one; with the bulge it sets the print */
            const beat = .5 + .5 * Math.cos(2 * Math.PI * (phi - ax / (p1 * (1 - 1 / P.beat)))), inY = 1 - sstep(out - 8 * u, out + 4 * u, ax);
            const bw = stripeOut0 - stripeIn, bc = stripeIn + bw * (.5 + .22 * Math.sin(2 * Math.PI * y / (wl * 2.3) + sd * 1.3 + ph) + .25 * Math.min(1, F)), hw = bw * (P.print + .45 * Math.min(1.2, F));
            const pr = sstep(hw + 4 * u, hw - 10 * u, Math.abs(ax - bc)) * (.8 + .2 * beat) * sstep(stripeIn, stripeIn + 10 * u, ax), weight = clamp(P.weight * (.6 + .4 * pr) + .12 * Math.min(1, F), .12, .7);
            const slip = mis * (.6 + 1.2 * Math.min(1, Math.abs(eg) + F * q)), soft = .14 + .1 * Math.min(1, Math.abs(dphi * p1)), th = Math.cos(Math.PI * weight), thB = Math.cos(Math.PI * weight * .55);
            const line = (o, t) => sstep(t - soft, t + soft, Math.cos(2 * Math.PI * (phi + o * dphi)));
            const thR = Math.cos(Math.PI * weight * .97), lg = line(0, th) * pr, lr = Math.min(line(-slip, thR), line(0, th) * 1.15) * pr, lb = Math.min(line(slip * .5, thB) * Math.min(1, F) * .9, lr) * pr;
            /* hairline: the center of the same line, 1 px, broken into dashes */
            const hl = Math.cos(2 * Math.PI * phi), dash = hashI(Math.round(phi) + sd * 3001, Math.floor((y + P.phase * 37.5 * u) / (P.dash * u) + hashI(Math.round(phi), sd, P.seed + 14) * 9), P.seed + 13);
            if (pr < .9 && hl > Math.cos(Math.PI * .65 * u / p1 * Math.max(1, 1 / Math.max(.3, Math.abs(dphi * p1)))) && dash < P.chainTone * .95) FL[k] = Math.max(FL[k], (.55 + .4 * hashI(Math.round(phi), Math.floor(y / (6 * u)), P.seed + 15)) * (1 - pr) * zone);
            cR[k] = lr; cG[k] = lg; cB[k] = lb; OPEN[k] = Math.min(1, zone * 1.6);
          }
        }
        /* the edge strip: a lit band of the edge ink, cyan to yellow down the sheet, and a dim blue rule inside it */
        if (ax >= flankOut - 22 * u) {
          const e = (W * .5 - ax) / edgeW, sw = edgeW * (.5 + .7 * nB(y / (120 * u), sd * 7));
          if (W * .5 - ax < sw) { const hue = nA(y / (260 * u), 40 + sd * 9), lit = sstep(sw, sw * .3, W * .5 - ax);
            const hb = sstep(.38, .68, hue); EA[k] = lit * (1 - hb); EB[k] = lit * hb; }
          else if (Math.abs(W * .5 - ax - 18 * u) < 1.5 * u) { cB[k] = .45 * nB(y / (50 * u), 3 + sd); cG[k] = cB[k] * .4; OPEN[k] = 1; }
          else { const wash = .14 * sstep(flankOut - 22 * u, flankOut - 6 * u, ax) * nC(y / (70 * u), 11 + sd); cB[k] = wash; cG[k] = wash * .6; OPEN[k] = 1; }
        }
        TN[k] = t;
      }
    }
    /* ---- discs, bottom up so each disc's wall covers the back rim of the disc below ---- */
    const halo = P.halo * 6 * u, kIn = P.inner, arcs = P.arcs ?? 1;
    for (let i = rings.length - 1; i >= 0; i--) {
      const R = rings[i], A = R.A, B = R.b, yc = R.yc, Tw = R.T;   /* yc: center of the top face */
      const y0 = Math.max(0, Math.floor(yc - B - halo - 2 * u)), y1 = Math.min(H - 1, Math.ceil(yc + B + Tw + halo + 2 * u)), x0 = Math.max(0, Math.floor(cx - A - halo)), x1 = Math.min(W - 1, Math.ceil(cx + A + halo));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const k = y * W + x, dx = (x - cx) / A, dy = (y - yc) / B, r = Math.hypot(dx, dy), sx = Math.sqrt(Math.max(0, 1 - dx * dx)), yf = yc + B * sx;
        let v = -1;
        if (Math.abs(dx) <= 1 && y > yf && y <= yf + Tw) {
          /* the wall: a crisp lit band under the front edge */
          v = P.lip + .05;
        } else if (r <= 1) {
          /* top face: a lit lip whose width runs from the full ring at the front and sides to a thin line at the back;
             thin concentric ridges inside it; the face between is the spool gray in streaks that follow the ellipse */
          const front = .5 + .5 * clamp(dy * 1.3, -1, 1), lipW = (1 - kIn) * (P.backRim + (1 - P.backRim) * Math.pow(front, .6)), rimE = r > 1 - lipW * .62 ? 1 : 0;
          const ang = Math.atan2(dy, dx), dr = (1 - kIn) * .19, rj = (1 - lipW * .62 - r) / dr;
          const nr = P.ridges ?? 5, ridge = rj > 0 && rj < nr ? arcs * (1 - .7 * rj / nr) * sstep(.42, .12, Math.abs(rj - Math.round(rj))) : 0;
          const streak = hashI(Math.floor(ang * A / (P.streakLen ?? 4) / u), Math.floor(r * B / (1.1 * u)), P.seed + 21) - .5;
          v = rimE ? P.lip : Math.max(ridge * .95, P.face * (1 + .8 * streak) * (.7 + .5 * r));
        } else {
          /* a short speck ramp outside the lit edge */
          const dWall = y - (yf + Tw), dOut = (r - 1) / Math.max(1e-3, Math.hypot(dx / A, dy / B) / Math.max(r, 1e-3)), dd = Math.abs(dx) <= 1 && y > yf ? Math.max(0, dWall) : dOut;
          if (dd < halo) v = Math.max(TN[k], .55 * (1 - dd / halo));
        }
        if (v >= 0) { TN[k] = v; cR[k] = cG[k] = cB[k] = 0; OPEN[k] = 0; }
      }
    }
    /* ---- the screen: one hashed threshold per cell of the dither grid, resampled to the sheet ---- */
    const gs = P.grain * u, gw = Math.max(4, Math.round(W / gs)), gh = Math.max(4, Math.round(H / gs)), Dg = new Float32Array(gw * gh), Og = new Float32Array(gw * gh), nT = vnoise(P.seed + 9), ts = (P.clump ?? 2.5) * u, streak = Math.max(1, Math.round(P.streak ?? 4));
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = Math.min(W - 1, Math.round((i + .5) * gs)), y = Math.min(H - 1, Math.round((j + .5) * gs)), k = y * W + x, fl = sstep(colW - 6 * u, colW + 30 * u, Math.abs(x - cx)), st = 1 + (streak - 1) * fl;
      const h = hashI(i, Math.floor(j / st), P.seed) * (1 - .3 * fl) + hashI(i, j, P.seed + 3) * .3 * fl, tv = TN[k], v = tv > 1 ? 1.5 : tv + P.tooth * 4 * (nT(x / ts, y / ts) - .5) * tv * (1 - tv);
      Dg[j * gw + i] = v > h ? (tv > .95 ? 1 : 1 - P.speckVar * hashI(i, j, P.seed + 12)) : hashI(i, j, P.seed + 11) < P.dust ? .5 : 0;
      Og[j * gw + i] = OPEN[k] >= .999 ? 1 : OPEN[k] > hashI(i, Math.floor(j / streak), P.seed + 5) ? 1 : 0;
    }
    const same = gw === W && gh === H, Du = same ? Dg : upsampleCR(Dg, gw, gh, W, H), Sx = P.soft > .05 ? gblur(Du, W, H, P.soft * u) : Du, Ou = same ? Og : upsampleCR(Og, gw, gh, W, H);
    /* the light plates are continuous: a short blur so a stripe edge is a 1 px ramp */
    const bl = P.lineSoft * u, R2 = gblur(cR, W, H, bl), G2 = gblur(cG, W, H, bl), B2 = gblur(cB, W, H, bl);
    const EA2 = EA, EB2 = EB, FL2 = gblur(FL, W, H, .3 * u);   /* the edge plates are already smooth ramps */
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, ink = C.ink, paper = C.paper, PR = C.plateR, PG = C.plateG, PB = C.plateB, E1 = C.edge, E2 = C.edge2;
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      const w = Math.max(clamp(Sx[i], 0, 1), FL2[i] * 1.15), on = clamp(Ou[i], 0, 1), pr = R2[i] * on, pg = G2[i] * on, pb = B2[i] * on, ea = EA2[i], eb = EB2[i];
      let R = ink[0] + PR[0] * pr + PG[0] * pg + PB[0] * pb + E1[0] * ea + E2[0] * eb, G = ink[1] + PR[1] * pr + PG[1] * pg + PB[1] * pb + E1[1] * ea + E2[1] * eb, Bv = ink[2] + PR[2] * pr + PG[2] * pg + PB[2] * pb + E1[2] * ea + E2[2] * eb;
      if (R > 255) R = 255; if (G > 255) G = 255; if (Bv > 255) Bv = 255;
      R += (paper[0] - R) * w; G += (paper[1] - G) * w; Bv += (paper[2] - Bv) * w;
      d[j] = R; d[j + 1] = G; d[j + 2] = Bv; d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p9", no: "09", title: "Disc Stack", ref: REF, render,
    line: "A domed spool and a stack of lit discs seen from above, screened by one random dither, between two flanks where one warped stripe phase prints through three light plates that slip apart where the warp bends hardest.",
    params: [
      { key: "rings", label: "Discs", min: 1, max: 24, step: 1, def: 11, unit: "", group: "Stack", why: "Number of discs in the stack." },
      { key: "spacing", label: "Spacing", min: 30, max: 160, step: .5, def: 87, unit: "px", group: "Stack", why: "Gap between the first two discs; lower gaps grow with the view setting." },
      { key: "view", label: "View height", min: 0, max: 1.5, step: .01, def: .7, unit: "×", group: "Stack", why: "How far above the stack the eye sits: lower discs tilt toward it and spread apart. 0 shows every disc at the same tilt." },
      { key: "discW", label: "Disc width", min: .2, max: .95, step: .005, def: .4, unit: "of width", group: "Stack", why: "Long axis of each disc as a share of the sheet width. 0.4 is 145 px of half axis, as measured." },
      { key: "discH", label: "Disc tilt", min: .03, max: .5, step: .005, def: .115, unit: "×", group: "Stack", why: "Short axis of the top disc over its long axis." },
      { key: "rim", label: "Wall", min: .3, max: 2.5, step: .01, def: 1, unit: "×", group: "Stack", why: "Thickness of each disc's lit wall: 11 px on the top disc, 23 px lower down, as measured." },
      { key: "inner", label: "Rim ring", min: .4, max: .98, step: .005, def: .67, unit: "of radius", group: "Stack", why: "Where the lit rim ring on each disc's top face begins." },
      { key: "backRim", label: "Back lip", min: 0, max: 1, step: .01, def: .25, unit: "", group: "Stack", why: "Width of the lit lip at the back of each disc, as a share of its width at the front." },
      { key: "lip", label: "Lip light", min: .5, max: 1.01, step: .005, def: 0.95, unit: "coverage", group: "Stack", why: "Speck coverage of each disc's lit lip; 1.01 prints it solid, lower lets the screen pit it as the reference's lips are." },
      { key: "face", label: "Face gray", min: 0, max: .8, step: .01, def: 0.435, unit: "coverage", group: "Stack", why: "Speck coverage inside each disc's top face, under the ridges." },
      { key: "halo", label: "Rim halo", min: 0, max: 3, step: .01, def: 0.2, unit: "×", group: "Stack", why: "Speck ramp the lit edges bleed into the dark: 0.4 is 2.4 px." },
      { key: "base", label: "Base disc", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Stack", why: "The last disc is wider by 15 % at 1, a foot for the stack." },
      { key: "column", label: "Spool width", min: .1, max: .9, step: .005, def: .3, unit: "of width", group: "Screen", why: "Width of the domed gray spool behind the discs: 216 px measured just under each disc." },
      { key: "gray", label: "Spool gray", min: .05, max: .95, step: .005, def: 0.47, unit: "coverage", group: "Screen", why: "Speck coverage of the spool: the tone the dither screens." },
      { key: "sheen", label: "Spool sheen", min: 0, max: 1.5, step: .01, def: .3, unit: "", group: "Screen", why: "How much brighter the spool prints near its edges, where the turned surface catches side light." },
      { key: "grain", label: "Speck size", min: 1, max: 5, step: .05, def: 1.35, unit: "px", group: "Screen", why: "Cell size of the dither grid; above 1 px each speck gets a soft ramp." },
      { key: "speckVar", label: "Speck light", min: 0, max: .9, step: .01, def: 0.2, unit: "", group: "Screen", why: "Spread of brightness between specks: each speck prints at 1 minus up to this much, so a fine screen still carries a spread of grays." },
      { key: "tooth", label: "Tooth", min: 0, max: 1.5, step: .01, def: 1.0, unit: "", group: "Screen", why: "Slow noise added to the tone before the threshold, strongest at mid-gray and nil at black and white; clumps the specks without pitting a lit lip." },
      { key: "dust", label: "Dust", min: 0, max: .05, step: .001, def: .006, unit: "coverage", group: "Screen", why: "Stray half-tone specks on the unprinted black." },
      { key: "soft", label: "Press blur", min: 0, max: 2, step: .01, def: 0.5, unit: "px", group: "Screen", why: "Ink spread after the screen." },
      { key: "chainTone", label: "Hairline print", min: 0, max: 1, step: .01, def: 1, unit: "", group: "Flanks", why: "Share of each hairline that prints: the lines print in 5 px dashes, and 1 prints them solid." },
      { key: "chainPitch", label: "Chain pitch", min: 4, max: 24, step: .1, def: 5.5, unit: "px", group: "Flanks", why: "Spacing of the hairlines beside the stripes: 5 to 6 px by autocorrelation; the sparse lines outside the stripes sit 1.7 times wider." },
      { key: "chainW", label: "Chain band", min: 0, max: 120, step: 1, def: 20, unit: "px", group: "Flanks", why: "Width of the hairline band between the black gap and the stripes; the lines thicken toward the stripes." },
      { key: "gapW", label: "Black gap", min: 6, max: 80, step: 1, def: 23, unit: "px", group: "Flanks", why: "Unprinted black between the disc edge and the first chain line." },
      { key: "stripes", label: "Stripe band", min: 0, max: .3, step: .005, def: 0.121, unit: "of width", group: "Flanks", why: "Width of the stripe zone where no bulge flares it." },
      { key: "pitch", label: "Stripe pitch", min: 5, max: 30, step: .1, def: 11, unit: "px", group: "Flanks", why: "Line spacing of the stripe screen: 11 px by autocorrelation." },
      { key: "flare", label: "Flare", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Flanks", why: "Strength of the three bulges per flank where the stripe zone flares outward and the lines go bold." },
      { key: "reach", label: "Flare reach", min: 0, max: .2, step: .005, def: .07, unit: "of width", group: "Flanks", why: "How far a bulge pushes the stripe zone toward the edge." },
      { key: "fan", label: "Fan", min: 0, max: 1.5, step: .01, def: 0.45, unit: "", group: "Flanks", why: "How much the lines spread apart inside a bulge: a displacement that grows against the distance from the inner edge, so the pitch opens outward." },
      { key: "warp", label: "Warp", min: 0, max: 3, step: .01, def: 1.4, unit: "×", group: "Flanks", why: "Sideways wave of the sheet that bends every stripe." },
      { key: "lineSoft", label: "Line blur", min: 0, max: 3, step: .01, def: 0.75, unit: "px", group: "Flanks", why: "Blur of the light plates: the stripe edges of the reference ramp over about 2 px." },
      { key: "print", label: "Bold band", min: 0, max: 1, step: .01, def: 0.26, unit: "of band", group: "Flanks", why: "Half width of the band, wandering down each flank, where the stripes print bold through the light plates; a bulge widens it. Outside it the same lines stay dashed hairlines." },
      { key: "dash", label: "Dash length", min: 1, max: 20, step: .1, def: 5, unit: "px", group: "Flanks", why: "Length of the dashes each hairline breaks into." },
      { key: "weight", label: "Line weight", min: .1, max: .7, step: .01, def: 0.46, unit: "of pitch", group: "Flanks", why: "Share of each stripe period the green plate prints; the bulges and the beat add to it." },
      { key: "fold", label: "Fold", min: 0, max: 2, step: .01, def: 0.55, unit: "×", group: "Flanks", why: "Strength of the eye in each bulge: a gaussian push on the stripe phase; above about 0.6 the lines fold into closed loops." },
      { key: "murk", label: "Flank murk", min: 0, max: .3, step: .005, def: 0.12, unit: "coverage", group: "Flanks", why: "Dim specks the screen leaves across the black flanks; the reference's flank black is 7 % dark gray specks." },
      { key: "haze", label: "Flank haze", min: 0, max: .8, step: .01, def: 0.15, unit: "share", group: "Flanks", why: "Share of the flank black carrying a dim speck, 4 to 30 % gray: the reference's black has a third of its pixels in the lowest gray bins." },
      { key: "beat", label: "Beat", min: 3, max: 40, step: .5, def: 7, unit: "lines", group: "Flanks", why: "A straight screen this many lines per cycle finer beats against the warped one and sets the line weight: the moire." },
      { key: "misreg", label: "Plate slip", min: 0, max: .6, step: .005, def: 0.09, unit: "of pitch", group: "Flanks", why: "Sideways slip of the red and blue plates off the green, in space; it doubles inside the bulges. A fold, where the lines run flat, shows no fringe." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop. Runs the sheet warp down the flanks one full wave and slides the hairline dashes down 37.5 px." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 9, unit: "", group: "Motion", why: "Re-rolls the dither, the bulges and the edge strip." }
    ],
    presets: [
      { name: "Tight spring", set: { rings: 22, spacing: 44, discH: .08, rim: .6, view: .3 } },
      { name: "Plain lines", set: { flare: 0, misreg: 0, warp: .3, beat: 40 } },
      { name: "Fog", set: { gray: .75, soft: 1.4, halo: 2.5, face: .6 } },
      { name: "Wild bulge", set: { flare: 2, reach: .16, fan: 1.3, misreg: .35, warp: 2.4 } }
    ],
    motion: [{ key: "phase", amp: 1, period: 10, mode: "saw" }, { key: "misreg", amp: .05, period: 7, mode: "sine" }],
    live: { x: { key: "misreg", min: 0, max: .45 }, y: { key: "view", min: 0, max: 1.4 } },
    bench: { palette: "measured", params: {}, note: "Every rect compares in place. The plate places 11 discs within 6 px of the reference's ring rows, so the spool, disc front and disc face rects sit on the same events; the hairline, stripe and edge rects sit on the same zones of the flanks, whose bulges are the plate's own. Composition moved from the first build (9 discs, 7 different rects), so all rects were re-picked against the new stack; search.py on the spool and disc rects found nothing better than the in-place windows.", items: [
      { name: "spool", ref: [300, 218, 140, 30], out: [300, 218, 140, 30], m: ["hist", "mean", "std", "ac"], lags: 6 },
      { name: "disc front", ref: [300, 540, 140, 30], out: [300, 540, 140, 30], m: ["hist", "mean", "std", "spec"] },
      { name: "disc face", ref: [290, 696, 160, 26], out: [290, 696, 160, 26], m: ["hist", "mean", "std"] },
      { name: "chains", ref: [176, 400, 56, 300], out: [176, 400, 56, 300], m: ["hist", "mean", "std", "ac"], lags: 12 },
      { name: "stripes", ref: [590, 400, 110, 300], out: [590, 400, 110, 300], m: ["hist", "mean", "std", "ac", "ink", "share"], lags: 12, inks: [[5, 5, 4], [234, 229, 111], [227, 242, 197], [101, 193, 167]], inkNames: ["black", "yellow", "pale", "mint"] },
      { name: "edge strip", ref: [0, 200, 40, 900], out: [0, 200, 40, 900], m: ["hist", "mean", "std", "ink", "share"], inks: [[3, 3, 5], [40, 200, 200], [150, 220, 60]], inkNames: ["black", "cyan", "yellow-green"] },
      { name: "whole plate", ref: [0, 0, 736, 1282], out: [0, 0, 736, 1282], m: ["hist", "mean", "ink", "share"], inks: [[5, 5, 4], [245, 247, 245], [234, 229, 111], [101, 193, 167]], inkNames: ["black", "white", "yellow", "mint"] }
    ] },
    palettes: [
      { id: "measured", name: "Screen print", note: "measured", c: { ink: [2, 2, 2], paper: [246, 247, 245], plateR: [235, 52, 8], plateG: [22, 208, 88], plateB: [20, 60, 215], edge: [53, 196, 196], edge2: [178, 232, 36] }, sw: ["#040404", "#f6f7f5", "#f4f06e", "#6edcaa"] },
      { id: "cobalt", name: "Cobalt", c: { ink: [6, 10, 30], paper: [240, 244, 252], plateR: [40, 90, 230], plateG: [60, 160, 255], plateB: [200, 230, 255], edge: [120, 170, 255], edge2: [220, 236, 255] }, sw: ["#060a1e", "#f0f4fc", "#508cff", "#a0dcff"] },
      { id: "rust", name: "Rust", c: { ink: [20, 8, 6], paper: [240, 240, 238], plateR: [250, 90, 20], plateG: [220, 150, 40], plateB: [40, 30, 160], edge: [250, 150, 60], edge2: [255, 220, 120] }, sw: ["#140806", "#f0f0ee", "#fa7828", "#ffc85a"] },
      { id: "mono", name: "Graphite", c: { ink: [8, 8, 9], paper: [242, 242, 244], plateR: [120, 120, 124], plateG: [110, 110, 114], plateB: [70, 72, 78], edge: [180, 180, 184], edge2: [230, 230, 232] }, sw: ["#080809", "#f2f2f4", "#c8c8cc", "#96989c"] },
      { id: "acid", name: "Acid", c: { ink: [10, 4, 16], paper: [240, 255, 240], plateR: [255, 40, 160], plateG: [120, 255, 40], plateB: [60, 60, 255], edge: [120, 255, 120], edge2: [255, 80, 200] }, sw: ["#0a0410", "#f0fff0", "#d2ff3c", "#ff50c8"] },
      { id: "arctic", name: "Arctic", c: { ink: [10, 18, 32], paper: [250, 253, 255], plateR: [90, 200, 255], plateG: [120, 220, 255], plateB: [40, 90, 220], edge: [200, 240, 255], edge2: [120, 200, 255] }, sw: ["#0a1220", "#fafdff", "#aaf0ff", "#3c78c8"] }
    ],
    passes: ["the stack: 11 discs from 16 % of the height down, each placed by the eye's height above it, so lower discs sit further apart and tilt further toward the eye; each disc is a top face, a lit lip and a wall", "the spool: a domed gray column behind the discs, brighter toward its edges", "the flanks: a black gap, a band of 1 px hairlines in dashes, then one warped stripe phase; the warp is a sum of two sines whose depth grows inside three bulges per flank, each carrying an eye that folds the lines", "the bold band: a band that wanders down each flank, widened by the bulges, where the stripes print through the light plates; outside it the same lines stay dashed hairlines", "the light plates: green on the line, red a little narrower and slipped one way, blue narrower still and slipped the other way, only inside the bulges; the slip is in space, so a steep run of lines fringes and a fold does not", "the edge strip: a lit band 12 px wide that runs cyan to yellow-green down the sheet, a dim blue rule inside it", "the screen: one hashed threshold per 1.35 px cell turns every gray into speck density; each speck takes a little of its own brightness; a 0.5 px press blur", "flank haze: dim 1 px specks over the black, the scanned sheet's own gray"],
    measured: { ring_rows_px: [206, 295, 383, 469, 555, 646, 739, 834, 933, 1033, 1131], ring_method: "peaks of the 80 px wide center column luminance, smoothed over 9 rows", ring_spacing_px: "89, 88, 86, 86, 91, 93, 95, 99, 100: it grows down the stack", disc_half_axis_px: 145, disc_center_x: 369, disc_axis_method: "first and last x above 185 in the 45 rows over each ring row", front_band_rows_px: { top: 11, ring3: 13, ring5: 17, ring6: 23, bottom: 25, method: "rows above 180 through the center column at each ring" }, spool_width_px: 216, spool_method: "speckle coverage above 110 in rows 14 to 24 px under each disc", hairline_pitch_px: "5 to 6", hairline_evidence: "column-mean autocorrelation of x 176 to 200 peaks at lags 5 and 6", stripe_pitch_px: 11, stripe_kmeans_10: { black: [5, 6, 3, .368], dark: [28, 35, 23, .097], yellow: [238, 228, 92, .066], yellow_pale: [239, 245, 152, .08], pale: [231, 246, 211, .07], method: "k-means on every third pixel of x 60 to 180, y 300 to 1000" }, edge_strip: { black: [6, 15, 17, .724], cyan: [53, 188, 185, .146], yellow_green: [169, 215, 53, .129], method: "nearest-ink shares of x 0 to 40" }, rejected: "a dotted outline for each ring (the first build): the reference's rims measure 11 to 25 px of solid white" },
    limits: ["Benchmark mean 0.931, lowest 0.66 (edge strip yellow-green color). Under 98 % on: the hairline band (tone histogram 0.80, mean 0.79): the reference's hairlines are scanned 1 px lines whose gray spreads over bins 1 to 8, the plate's are 1 px dashes at one gray each, so it prints too much pure black; the stripes' autocorrelation (0.72) and yellow (0.83): the reference's lines are near vertical with a 22 px repeat that survives its warp, the plate's bold band folds harder and wanders more, which reads better next to the reference but decorrelates faster; the edge strip's yellow-green (0.66), whose reference band is a saturated (169,215,53) the additive plates reach only at full print.", "Render time 0.86 to 1.3 s on this machine depending on load; the two Catmull-Rom upsamples and five blurs take about a third of it.", "The stack and the flanks are the plate's own: 11 discs placed by a view height, three bulges per flank from the seed; the ring rows land within 6 px of the reference's, the bulges do not sit where its flares do.", "The reference is a JPEG; its ringing around the stripes is not modeled."],
    source: "Reference 9: dithered screen print of a stacked disc spring, 736 × 1282 px JPEG",
    study: { slug: "disc-stack", lede: "One random dither screens a domed spool and a stack of lit discs; the flanks are one warped stripe phase printed through three slipped light plates.", body: ["The print has three materials and one screen. Down the middle a gray spool, 216 px wide, carries 11 discs seen from above. Each disc is a solid white wall 11 px tall at the top of the stack and 25 px at the bottom, a lit lip on its top face, thin ridges inside the lip, and the spool's gray between. The discs sit 86 px apart at the top and 100 px apart at the bottom, because the eye is above the stack. On each flank a stripe screen at 11 px pitch prints in three light plates that do not sit on each other: green on the line, red slipped one way so the line prints yellow with a red edge, blue slipped the other way inside the bulges so a cyan edge appears. Between the spool and the stripes, 1 px hairlines print in dashes.", "The rebuild draws one tone field for the spool, the discs and the hairlines and passes it through one hashed threshold per 1.35 px cell, so every gray is speck density from the same screen. The stripes are one phase field: two sines bend it, three bulges per flank widen and fold it, and a band that wanders down the flank decides where it prints bold. The plates slip in space, so a fringe is thin where the lines run steep and absent where they fold flat. Discs, spacing, view height and wall set the stack; spool width, gray and speck size set the screen; bold band, flare, fold, warp and plate slip set the flanks."], method: "one tone field · hashed threshold dither at 1.35 px · warped stripe phase with folding bulges · three light plates slipped in space · 0.5 px press blur", points: [
      { u: .5, v: .2, d: "KEY", label: "The top disc's wall: solid white, 11 px tall, the lip above it narrows to a quarter of its width at the back.", t: "edge", dir: [0, -1] },
      { u: .5, v: .88, d: "KEY", label: "The bottom disc: the wall is 25 px tall and the face is a fuller ellipse, because the eye looks further down onto it.", t: "edge", dir: [0, 1] },
      { u: .5, v: .52, d: "KEY", label: "Inside a disc face: thin ridges under the lit lip, then the spool's speckle at 47 % coverage.", t: "grain", dir: [0, 0] },
      { u: .43, v: .42, d: "READ", label: "The spool between two discs: specks of 1.35 px with their own brightness, under a 0.5 px press blur.", t: "grain", dir: [0, 1] },
      { u: .24, v: .5, d: "READ", label: "The hairline band: 1 px lines 5.5 px apart that print in 5 px dashes over the black gap's haze.", t: "grain", dir: [1, 0] },
      { u: .1, v: .45, d: "KEY", label: "The bold band: yellow where the red plate sits on the green, a thin red edge on one side and the black between.", t: "pull", dir: [0, 1] },
      { u: .9, v: .2, d: "KEY", label: "A bulge: the stripe zone flares toward the edge, the lines fan apart and an eye folds them; the blue plate adds a cyan edge here only.", t: "pull", dir: [-1, 0] },
      { u: .87, v: .62, d: "READ", label: "Outside the bold band the same lines print as dashed hairlines: one phase, two print depths.", t: "grain", dir: [0, 1] },
      { u: .01, v: .55, d: "READ", label: "The edge strip: a lit band up to 12 px wide that runs from cyan to yellow-green down the sheet, a dim blue rule beside it.", t: "edge", dir: [1, 0] },
      { u: .5, v: .1, d: "READ", label: "The spool's dome above the top disc: the same screen, its gray falling off toward the cap.", t: "edge", dir: [0, -1] }
    ] }
  });
})();
