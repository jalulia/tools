/* ===== PLATE 03 · PHOSPHOR CELL =====
   one luminance scene (a generated rose cluster, lit from the upper left) -> dot lattice
   -> per-cell faults (drip, slip, dropout, levels) -> bead emission, fused under the type
   -> optics: focus, phosphor glow, blue lens veil -> per-channel phosphor saturation     */
(function () {
  const REF = { w: 736, h: 1103 };
  const G = v => { const c = clamp(v, 0, 1) * 255 | 0; return `rgb(${c},${c},${c})`; };
  let FACEK = .78; /* set per render: brightness of petal faces that do not face the light */
  /* ---- subject generator: a photographic rose cluster in gray. Tones are set for the phosphor: faces 0.25-0.5,
     shadow sides and creases under 0.1, only the rims that catch the light go to 1 ---- */
  function petal(g, len, wd, lit, s, f, S) {
    const path = () => { g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(len * .22, -wd, len * .82, -wd * 1.04, len, -wd * .22); g.quadraticCurveTo(len * .93, 0, len, wd * .22); g.bezierCurveTo(len * .82, wd * 1.04, len * .22, wd, 0, 0); g.closePath(); };
    /* tone: lit faces take a gamma of 0.75 and the ring that faces the light a 1.35 highlight; shadow sides sit near black */
    path(); const gr = g.createLinearGradient(0, -wd, 0, wd), tm = clamp(.5 + .32 * s, .2, .8), hi = Math.min(1, Math.pow(lit, .75) * (1 + .1 * Math.abs(s)) * (f > .55 ? 1.3 : FACEK)), sh = lit * .15, near = s > 0 ? hi : sh, far = s > 0 ? sh : hi;
    gr.addColorStop(0, G(near)); gr.addColorStop(Math.max(0, tm - .09), G(near)); gr.addColorStop(Math.min(1, tm + .09), G(far)); gr.addColorStop(1, G(far)); g.fillStyle = gr; g.fill();
    const gb = g.createLinearGradient(0, 0, len * .42, 0); gb.addColorStop(0, "rgba(0,0,0,1)"); gb.addColorStop(.4, "rgba(0,0,0,.55)"); gb.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gb; g.fill();
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = S * .005; for (let v = -2; v <= 2; v++) { const t = v / 2.6; g.beginPath(); g.moveTo(len * .08, 0); g.quadraticCurveTo(len * .5, wd * t * .55, len * .9, wd * t * .95); g.stroke(); }
    g.strokeStyle = G(0); g.lineWidth = S * .009; path(); g.stroke();
    if (f > 0) { g.strokeStyle = `rgba(255,255,255,${(.35 + .65 * f).toFixed(2)})`; g.lineWidth = S * .012; g.beginPath(); g.moveTo(len * .45, -wd * .9); g.bezierCurveTo(len * .82, -wd * 1.02, len * .98, -wd * .5, len, -wd * .2); g.stroke(); g.strokeStyle = `rgba(255,255,255,${(.45 * f).toFixed(2)})`; g.lineWidth = S * .008; g.beginPath(); g.moveTo(len, wd * .2); g.bezierCurveTo(len * .96, wd * .6, len * .82, wd * .98, len * .6, wd * .92); g.stroke(); }
  }
  function rose(g, cx, cy, R, rnd, La, S, open, squash) {
    g.save(); g.translate(cx, cy); g.scale(1, squash);
    const cupY = R * .12, cupRx = R * (open ? .62 : .42), cupRy = R * (open ? .5 : .62);
    /* 1 — back petals: a fan over the top, each a lit face with a terminator and a rim */
    const nb = open ? 5 : 3, span = open ? 3.5 : 1.5;
    for (let i = 0; i < nb; i++) { const a = -Math.PI / 2 + (i / (nb - 1) - .5) * span + (rnd() - .5) * .25, len = R * (open ? .95 + rnd() * .25 : 1.05 + rnd() * .2), wd = len * (open ? .46 : .36) * (.9 + rnd() * .2), s = Math.sin(a - La), f = Math.cos(a - La), lit = .48 + .3 * Math.pow(f * .5 + .5, 1.2); g.save(); g.translate(0, cupY); g.rotate(a); petal(g, len, wd, lit, s, f, S); g.restore(); }
    /* 2 — the cup: dark interior, inner petal rims as bright arcs */
    g.save(); g.translate(0, cupY); g.scale(1, cupRy / cupRx);
    const gc = g.createRadialGradient(-cupRx * .3, -cupRx * .2, 0, 0, 0, cupRx); gc.addColorStop(0, G(.24)); gc.addColorStop(.6, G(.13)); gc.addColorStop(1, G(.08)); g.fillStyle = gc; g.beginPath(); g.arc(0, 0, cupRx, 0, 6.3); g.fill();
    g.strokeStyle = G(.05); g.lineWidth = S * .01; g.stroke();
    const na = open ? 4 : 2;
    for (let j = 0; j < na; j++) { const r = cupRx * (.86 - .2 * j) * (.95 + rnd() * .1), a0 = -2.9 + rnd() * .5, a1 = a0 + 1.6 + rnd() * 1.2, ox = (rnd() - .5) * cupRx * .25, oy = (rnd() - .5) * cupRx * .2; g.strokeStyle = G(.06); g.lineWidth = S * .022; g.beginPath(); g.arc(ox, oy + S * .006, r, a0, a1); g.stroke(); g.strokeStyle = G(.75 + .2 * rnd()); g.lineWidth = S * .012; g.beginPath(); g.arc(ox, oy, r, a0, a1); g.stroke(); }
    g.restore();
    /* 3 — front petals: curl down and out from the cup's lower rim */
    if (open) { const nf = 3; for (let i = 0; i < nf; i++) { const a = Math.PI / 2 + (i - 1) * .95 + (rnd() - .5) * .3, len = R * (.8 + rnd() * .25), wd = len * .55 * (.9 + rnd() * .2), s = Math.sin(a - La), f = Math.cos(a - La), lit = .5 + .3 * Math.pow(f * .5 + .5, 1.2); g.save(); g.translate(Math.cos(a) * cupRx * .45, cupY + Math.sin(a) * cupRy * .45); g.rotate(a); petal(g, len, wd, lit, s, f, S); g.restore(); } }
    /* 4 — the lit near rim of the cup */
    g.save(); g.translate(0, cupY); g.scale(1, cupRy / cupRx); g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = S * .013; g.beginPath(); g.arc(0, 0, cupRx * .98, 2.2, 3.9); g.stroke(); g.restore();
    g.restore();
  }
  function leaf(g, bx, by, a, len, wd, lit, La, S, rnd) {
    g.save(); g.translate(bx, by); g.rotate(a); const s = Math.sin(a - La);
    const path = () => { g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(len * .22, -wd, len * .76, -wd * .82, len, 0); g.bezierCurveTo(len * .76, wd * .82, len * .22, wd, 0, 0); g.closePath(); };
    path(); const gr = g.createLinearGradient(0, -wd, 0, wd), lh = Math.pow(lit, .75); gr.addColorStop(0, G(lh * (1 + .3 * s))); gr.addColorStop(.49, G(lh * (1 + .1 * s))); gr.addColorStop(.51, G(lit * (.45 - .25 * s))); gr.addColorStop(1, G(lit * (.3 - .2 * s))); g.fillStyle = gr; g.fill();
    const gb = g.createLinearGradient(0, 0, len, 0); gb.addColorStop(0, "rgba(0,0,0,.45)"); gb.addColorStop(.3, "rgba(0,0,0,0)"); gb.addColorStop(1, "rgba(0,0,0,.2)"); g.fillStyle = gb; g.fill();
    g.lineCap = "round"; g.strokeStyle = G(.04); g.lineWidth = S * .009; g.beginPath(); g.moveTo(len * .02, 0); g.quadraticCurveTo(len * .5, 0, len * .97, 0); g.stroke();
    const nv = 5 + (rnd() * 3 | 0); g.lineWidth = S * .0045;
    for (let k = 0; k < nv; k++) { const t = .1 + .74 * k / nv, x = len * t, w = wd * .9 * Math.sqrt(Math.max(0, 1 - (t * 2 - 1) ** 2)); for (const sg of [-1, 1]) { g.strokeStyle = G(lit * (sg * s < 0 ? .5 : .3)); g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + len * .09, sg * w * .5, x + len * .17 + len * .03 * rnd(), sg * w * .9); g.stroke(); } }
    g.strokeStyle = G(.06); g.lineWidth = S * .007; path(); g.stroke();
    if (s > 0) { g.strokeStyle = `rgba(255,255,255,${(.3 * s).toFixed(2)})`; g.lineWidth = S * .007; g.beginPath(); g.moveTo(len * .1, -wd * .55); g.bezierCurveTo(len * .3, -wd * .98, len * .7, -wd * .85, len * .96, -wd * .06); g.stroke(); }
    g.restore();
  }
  function stem(g, p0, p1, p2, w, S) {
    const path = dx => { g.beginPath(); g.moveTo(p0[0] + dx, p0[1]); g.quadraticCurveTo(p1[0] + dx, p1[1], p2[0] + dx, p2[1]); };
    g.lineCap = "round"; g.strokeStyle = G(.16); g.lineWidth = w; path(0); g.stroke();
    g.strokeStyle = G(.03); g.lineWidth = w * .35; path(w * .3); g.stroke();
    g.strokeStyle = G(.55); g.lineWidth = w * .2; path(-w * .28); g.stroke();
  }
  function drawSubject(g, kind, cx, cy, S, rnd) {
    g.save(); g.translate(cx, cy); g.lineCap = "round"; g.lineJoin = "round";
    if (kind === "helix") {
      const turns = 2.6 + rnd() * .8, A = S * .34, Hh = S * 1.18, N = 220, ph = rnd() * 6.28;
      const pts = []; for (let i = 0; i <= N; i++) { const t = i / N, a = ph + t * turns * 6.283; pts.push([t, Math.sin(a), Math.cos(a)]); }
      const seg = (side, back) => { for (let i = 0; i < N; i++) { const [t, s, z] = pts[i], zz = side * z; if ((zz < 0) !== back) continue; const y0 = -Hh / 2 + t * Hh, y1 = -Hh / 2 + pts[i + 1][0] * Hh; g.strokeStyle = G(.22 + .78 * (zz * .5 + .5)); g.lineWidth = S * (.05 + .035 * (zz * .5 + .5)); g.beginPath(); g.moveTo(side * s * A, y0); g.lineTo(side * pts[i + 1][1] * A, y1); g.stroke(); } };
      seg(1, true); seg(-1, true);
      for (let i = 4; i < N; i += 9) { const [t, s, z] = pts[i], y = -Hh / 2 + t * Hh; g.strokeStyle = G(.18 + .34 * Math.abs(s)); g.lineWidth = S * .022; g.beginPath(); g.moveTo(-s * A, y); g.lineTo(s * A, y); g.stroke(); }
      seg(1, false); seg(-1, false);
    } else if (kind === "coil") {
      const rows = 6, Wd = S * .92, Hh = S * 1.02, tw = Hh / rows * .74, P = [];
      for (let r = 0; r < rows; r++) { const y = -Hh / 2 + (r + .5) * Hh / rows, dir = r % 2 ? -1 : 1, inset = (r === 0 || r === rows - 1) ? .2 : .04 + rnd() * .1; for (let i = 0; i <= 26; i++) { const t = i / 26, x = dir * (-Wd / 2 + Wd * inset + t * Wd * (1 - 2 * inset)); P.push([x, y + Math.sin(t * 9 + r * 2 + rnd() * .2) * tw * .12]); } }
      const path = () => { g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
      [[1, .16, 0], [.8, .42, -.06], [.5, .7, -.14], [.2, .98, -.2]].forEach(([w, v, o]) => { g.save(); g.translate(0, o * tw); g.strokeStyle = G(v); g.lineWidth = tw * w; path(); g.stroke(); g.restore(); });
      g.strokeStyle = G(.1); g.lineWidth = tw * .1; for (let i = 3; i < P.length - 1; i += 3) { const a = P[i], b = P[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; g.beginPath(); g.moveTo(a[0] - dy / l * tw * .5, a[1] + dx / l * tw * .5); g.lineTo(a[0] + dy / l * tw * .2, a[1] - dx / l * tw * .2); g.stroke(); }
    } else { /* bloom: a rose cluster lit from the upper left; two open heads, a bud, veined leaves */
      const La = -2.3 + (rnd() - .5) * .4, lean = (rnd() - .5) * .3;
      const main = [S * (.04 + lean * .3), -S * .02], second = [-S * (.27 - lean * .2), -S * .27], bud = [S * (.3 + lean * .2), -S * .3], foot = [lean * S * .1, S * .58];
      stem(g, foot, [foot[0] * .5 + main[0] * .3, S * .3], main, S * .02, S);
      stem(g, [foot[0] - S * .02, foot[1]], [-S * .22, S * .2], second, S * .016, S);
      stem(g, [foot[0] + S * .02, foot[1]], [S * .3, S * .2], bud, S * .014, S);
      const leaves = [[-.24, .18, 2.55, .36, .095], [.24, .2, .5, .34, .09], [-.1, .32, 2.85, .36, .085], [.1, .34, .35, .34, .085], [.3, -.02, -.35, .3, .075], [-.4, -.04, 3.25, .28, .07], [-.3, .04, 2.1, .26, .07], [.2, .08, -1.1, .22, .06], [-.02, .42, 1.85, .28, .075], [.36, .26, .85, .26, .065]];
      const nl = 7 + (rnd() * 3 | 0);
      leaves.slice(0, nl).forEach(([x, y, a, l, w], i) => { if (i < nl - 3) leaf(g, x * S, y * S, a + (rnd() - .5) * .4, S * l * (1.05 + rnd() * .25), S * w * (1.05 + rnd() * .2), .5 + rnd() * .25, La, S, rnd); });
      rose(g, second[0], second[1], S * .18, rnd, La, S, true, .78);
      for (let i = 0; i < 3; i++) leaf(g, bud[0], bud[1] + S * .07, -1.57 + (i - 1) * .55 + (rnd() - .5) * .2, S * .12, S * .022, .45, La, S, rnd);
      rose(g, bud[0], bud[1], S * .08, rnd, La, S, false, 1.3);
      rose(g, main[0], main[1], S * .24, rnd, La, S, true, .86);
      leaves.slice(nl - 3, nl).forEach(([x, y, a, l, w]) => leaf(g, x * S, y * S, a + (rnd() - .5) * .4, S * l * (1.05 + rnd() * .25), S * w * (1.05 + rnd() * .2), .55 + rnd() * .25, La, S, rnd));
    }
    g.restore();
  }

  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 7919 + 13), font = n => `${n}px "Archivo Black","Arial Black",sans-serif`; FACEK = P.faceK ?? .78;
    /* 1 — scene: cold layer (image, marks, data) and hot layer (headline) */
    const A = mk(W, H), a = A.getContext("2d"), B = mk(W, H), b = B.getContext("2d");
    a.fillStyle = "#000"; a.fillRect(0, 0, W, H);
    const lines = [P.line1 || "", P.line2 || ""].map(t => t.toUpperCase()), cap = 93 * u * P.headSize, wpx = Math.max(0, P.weight) * u, capD = Math.max(8 * u, cap - 2 * wpx), fs = capD / .716, measure = (P.measure ?? 496) * u, measD = measure - 2 * wpx, gap = (P.lineGap ?? 16) * u;
    b.fillStyle = "#fff"; b.textBaseline = "alphabetic"; b.font = font(fs);
    const top = 146 * u; let yb = top + cap - wpx;
    const ext = [];
    /* a positive weight fattens the strokes inward: the stroke adds wpx on every side of a glyph drawn 2 wpx smaller, so the cap and the measure stay put */
    lines.forEach((t, i) => { if (!t) { yb += cap + gap; return; } const w0 = b.measureText(t).width, sx = clamp(measD / w0, .7, 1 + .6 * P.stretch), w = w0 * sx, lx = (W - w) / 2 + (P.typeShift ?? -14) * u; b.save(); b.translate(lx, yb); b.scale(sx, 1); b.fillText(t, 0, 0); if (Math.abs(P.weight) > .01) { b.globalCompositeOperation = P.weight < 0 ? "destination-out" : "source-over"; b.strokeStyle = "#fff"; b.lineJoin = "round"; b.lineWidth = Math.abs(P.weight) * 2 * u / sx; b.strokeText(t, 0, 0); b.globalCompositeOperation = "source-over"; } b.restore(); ext.push([lx - wpx, lx + w + wpx, yb - cap / 2 + wpx]); yb += cap + gap; });
    const headBot = yb - gap;
    a.fillStyle = "#fff";
    if (P.marks > 0) { /* registration dashes beside each line, tick rows top and foot */
      ext.forEach(([l, r, y]) => { a.globalAlpha = .9; a.fillRect(l - 58 * u, y - 4 * u, 40 * u, 8 * u); a.fillRect(r + 18 * u, y - 4 * u, 40 * u, 8 * u); });
      a.globalAlpha = .55; [[70, 128, 44], [330, 124, 60], [622, 128, 44]].forEach(([x, y, w]) => a.fillRect(x * u, y * u, w * u, 6 * u));
      [[268, 962, 36], [402, 962, 58]].forEach(([x, y, w]) => a.fillRect(x * u, y * u, w * u, 9 * u)); a.fillRect(362 * u, 948 * u, 12 * u, 26 * u); a.globalAlpha = 1;
    }
    const sy0 = headBot + 18 * u, sy1 = (P.block > 0 ? 852 : 950) * u, S = Math.min((sy1 - sy0), W * .86) * .9 * P.subjectSize;
    a.save(); a.beginPath(); a.rect(0, sy0 - 40 * u, W, sy1 - sy0 + 34 * u); a.clip(); drawSubject(a, P.subject, W / 2, (sy0 + sy1) / 2 + S * .02, S, rnd); a.restore();
    const cold = chan(a, W, H, 0), hot = chan(b, W, H, 3);
    { /* petal-surface mottle: the photographed faces are not flat */ const mn = vnoise(P.seed + 91), mot = P.mottle ?? .3, sc1 = 24 * u, sc2 = 8 * u; for (let y = sy0 - 40 * u | 0; y < sy1; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (cold[i] > .02 && hot[i] < .01) cold[i] *= 1 + mot * (mn(x / sc1, y / sc1) - .5) * 1.6 + mot * .6 * (mn(x / sc2 + 50, y / sc2) - .5); } }
    /* 2 — sample to the dot lattice */
    const pitch = P.pitch * u, cols = Math.ceil(W / pitch), rows = Math.ceil(H / pitch), I = new Float32Array(cols * rows), Hh = new Float32Array(cols * rows), cnt = new Uint16Array(cols * rows);
    /* the screen's own content carries a soft glow around the type: counters and the rim rows light up as beads */
    const hg = gblur(hot, W, H, (P.cglowR ?? 12) * u), cg = P.cglow ?? .6;
    for (let y = 0; y < H; y++) { const r = Math.min(rows - 1, y / pitch | 0); for (let x = 0; x < W; x++) { const k = r * cols + Math.min(cols - 1, x / pitch | 0), i = y * W + x; I[k] += cold[i] + cg * hg[i] * (1 - hot[i]); Hh[k] += hot[i]; cnt[k]++; } }
    for (let k = 0; k < I.length; k++) { I[k] /= cnt[k] || 1; Hh[k] /= cnt[k] || 1; }
    /* data block: small text sampled under the lattice. Per-column and per-row gain, a right-skewed per-cell
       residual smeared one cell to the right (glyph strokes straddle cells), word gaps every few glyphs */
    const isB = new Uint8Array(cols * rows);
    if (P.block > 0) { const bx0 = Math.round(140 * u / pitch), bx1 = Math.round(598 * u / pitch), by0 = Math.round(872 * u / pitch), nrow = Math.round(1 + P.block * 22), sd = P.seed * 3 + 5;
      /* word gaps: runs of 1 to 3 cells, about 20 % of cells; a paragraph break one row deep near the middle; row gain 1.2 on the first row falling to 0.6 on the last */
      const gapAt = (c, r) => { for (let d = 0; d < 3; d++) { const st = hashI(c - d, r, sd + 1) < (P.gapP ?? .07), ln = 1 + (hashI(c - d, r, sd + 6) * 3 | 0); if (st && d < ln) return true; } return false; };
      const cellv = (c, r) => { const h = hashI(c, r, sd), dim = hashI(c, r, sd + 5) < .05; return (gapAt(c, r) ? (P.gapLevel ?? .6) : dim ? .6 : 1) * (.66 + .5 * h + (P.skew ?? .8) * Math.max(0, h - .7) / .3); };
      const pbreak = Math.round(nrow * .5);
      for (let r = 0; r < nrow; r++) { const cut = r >= nrow - 2 ? ((.08 + rnd() * .2) * (bx1 - bx0) | 0) : 0, rowG = ((P.rowTop ?? 1.12) - (P.rowDrop ?? .4) * r / Math.max(1, nrow - 1)) * (.9 + .2 * hashI(r, 1, sd + 3)) * (r === pbreak ? (P.breakLevel ?? .6) : 1); for (let c = bx0 + cut; c < bx1; c++) { const k = (by0 + r) * cols + c; if (k >= I.length) continue; const colG = .74 + .52 * hashI(c, 2, sd + 4), v = .65 * cellv(c, r) + .35 * cellv(c - 1, r); I[k] = -(P.blockGain ?? .47) * rowG * colG * v; isB[k] = 1; } } }
    /* 3 — faults, all on the lattice */
    if (P.drip > 0) for (let c = 0; c < cols; c++) { for (let r = 1; r < rows - 1; r++) { const k = r * cols + c; if (Hh[k] > .45 && Hh[k + cols] < .12 && hashI(c, r, P.seed + 21) < .05 + .5 * P.drip) { const len = 2 + hashI(c, r, P.seed + 22) * 26 * P.drip, st = .3 + .55 * hashI(c, r, P.seed + 23); for (let j = 1; j < len && r + j < rows; j++) { const kk = (r + j) * cols + c, v = st * Math.exp(-j / (len * .6)) * (hashI(c, r + j, P.seed + 24) < .86 ? 1 : .15); if (v > Math.abs(I[kk])) { I[kk] = v; isB[kk] = 0; } } } } }
    if (P.drip > 0) { /* persistence: every lit cell streaks down its column, the block and the image alike, at a fraction of its drive */ const dec = .62 + .3 * P.drip, k0 = P.streak ?? .48, r0 = Math.max(1, sy0 / pitch | 0); for (let c = 0; c < cols; c++) { let pv = 0; for (let r = r0; r < rows; r++) { const k = r * cols + c; if (Hh[k] > .05) { pv = 0; continue; } const v = Math.abs(I[k]); pv = Math.max(v * k0, pv * dec * (.8 + .3 * hashI(c, r, P.seed + 25))); if (!isB[k] && pv > v) I[k] = pv; } } }
    if (P.slip > 0) { const n = Math.round(P.slip * 16); for (let j = 0; j < n; j++) { const r0 = (rnd() * rows) | 0, hh = 1 + (rnd() * 3 | 0), d = Math.round((rnd() - .5) * 2 * (2 + P.slip * 12)); for (let r = r0; r < Math.min(rows, r0 + hh); r++) { const rowI = I.slice(r * cols, (r + 1) * cols), rowH = Hh.slice(r * cols, (r + 1) * cols), rowB = isB.slice(r * cols, (r + 1) * cols); for (let c = 0; c < cols; c++) { const sc = c - d, ok = sc >= 0 && sc < cols; I[r * cols + c] = ok ? rowI[sc] : 0; Hh[r * cols + c] = ok ? rowH[sc] : 0; isB[r * cols + c] = ok ? rowB[sc] : 0; } } } }
    const lv = Math.round(P.levels), nb = vnoise(P.seed + 61), dropP = P.dropout * (P.dropShare ?? .1), jit = P.dropout * (P.dropJitter ?? .35);
    for (let k = 0; k < I.length; k++) { let v = I[k]; const c = k % cols, r = k / cols | 0; if (v < 0) { v = -v * (1 + P.shade * 1.6 * (nb(c / 13 + 40, r / 13) - .5)); } else if (v > 0) { v = Math.pow(v, P.contrast) * (1 + P.shade * 2 * (nb(c / 13 + 40, r / 13) - .5)); } if (v > 0) { const hd = hashI(c, r, P.seed + 31); v *= hd < dropP && !isB[k] ? .15 + .5 * hashI(c, r, P.seed + 32) : 1 - jit * hashI(c, r, P.seed + 33); if (lv < 32) v = Math.round(v * lv) / lv; v = v < .04 ? 0 : v < (P.cut ?? .15) ? (P.dim ?? .06) : v; } I[k] = v * P.gain; Hh[k] = Math.pow(Hh[k], P.hotGamma ?? 2.4) * P.heat * 2.4; }
    /* 4 — emission: one gaussian bead per cell; type cells with four lit neighbors fuse into a solid */
    const Int = new Float32Array(cols * rows); for (let r = 1; r < rows - 1; r++) for (let c = 1; c < cols - 1; c++) { const k = r * cols + c; Int[k] = Math.min(1, Math.min(Hh[k], Hh[k - 1], Hh[k + 1], Hh[k - cols], Hh[k + cols]) / (P.heat * 2.4 * .9)); }
    const E = new Float32Array(W * H), sx = P.dotW / 2.355, syy = P.dotH / 2.355;
    const wx = new Float32Array(W), cxi = new Uint16Array(W); for (let x = 0; x < W; x++) { const c = x / pitch, f = c - Math.floor(c) - .5; wx[x] = Math.exp(-.5 * f * f / (sx * sx)); cxi[x] = Math.min(cols - 1, c | 0); }
    for (let y = 0; y < H; y++) { const rf = y / pitch, r = Math.min(rows - 1, rf | 0), f = rf - Math.floor(rf) - .5, wy = Math.exp(-.5 * f * f / (syy * syy)), o = y * W, ro = r * cols; for (let x = 0; x < W; x++) { const k = ro + cxi[x], l = wx[x] * wy, fl = isB[k] ? (P.fillB ?? .12) : P.fill; E[o + x] = I[k] * (l * (1 - fl) + fl * .5) + Hh[k] * (l + (1 - l) * P.fuse * Int[k]); } }
    /* 5 — optics: focus, near phosphor glow (green), wide lens veil (blue-white) */
    const F = gblur(E, W, H, P.focus * u), b1 = gblur(E, W, H, (P.s1 ?? 2.6) * u), b2 = gblur(b1, W, H, (P.s2 ?? 8.25) * u), b3 = gblur(b2, W, H, (P.s3 ?? 40) * u);
    /* 6 — phosphor saturation: each channel 1 - exp(-(k T^pk + kb T^pw + veil)), the veil inside the exponent so the white core stays at the cap */
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, k = pal.k, kb = pal.kb, pw = pal.pw || [3, 3, 3], pk = pal.pk || [1, 1, 1], fl = pal.floor, vc = pal.veil || [.1, .5, 1], bl = P.bloom, Tc = P.tcap || 4, e0 = P.e0 || 4.2, w1 = P.w1 ?? .195, w2 = P.w2 ?? .545, w3 = P.w3 ?? .05, wv = P.wv ?? .18, nz = P.noise * 14, sd = P.seed + 77;
    for (let y = 0, i = 0, j = 0; y < H; y++) for (let x = 0; x < W; x++, i++, j += 4) {
      const T = F[i] * e0 + bl * (b1[i] * w1 + b2[i] * w2 + b3[i] * w3), n = (hashI(x, y, sd) - .5) * nz, veil = bl * b3[i] * wv;
      const Ts = Tc * (1 - Math.exp(-T / Tc));
      d[j] = clamp(fl[0] + (255 - fl[0]) * (1 - Math.exp(-(k[0] * Math.pow(Ts, pk[0]) + kb[0] * Math.pow(Ts, pw[0]) + veil * vc[0]))) + n, 0, 255);
      d[j + 1] = clamp(fl[1] + (255 - fl[1]) * (1 - Math.exp(-(k[1] * Math.pow(Ts, pk[1]) + kb[1] * Math.pow(Ts, pw[1]) + veil * vc[1]))) + n, 0, 255);
      d[j + 2] = clamp(fl[2] + (255 - fl[2]) * (1 - Math.exp(-(k[2] * Math.pow(Ts, pk[2]) + kb[2] * Math.pow(Ts, pw[2]) + veil * vc[2]))) + n, 0, 255); d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }

  PLATES.push({
    id: "p3", no: "03", title: "Phosphor Cell", ref: REF, render,
    line: "A luminance scene sampled to a dot lattice, faulted on the lattice, then pushed through bloom and a phosphor saturation curve.",
    texts: [{ key: "line1", label: "Line 1", def: "MIND" }, { key: "line2", label: "Line 2", def: "GUT" }],
    selects: [{ key: "subject", label: "Subject", def: "bloom", options: [["bloom", "Bloom"], ["helix", "Helix"], ["coil", "Coil"]] }],
    params: [
      { key: "pitch", label: "Lattice pitch", min: 3.5, max: 14, step: .05, def: 5.85, unit: "px", group: "Lattice", why: "Dot spacing. Coarser reads as signage, finer as video." },
      { key: "dotW", label: "Dot width", min: .25, max: .95, step: .01, def: 0.35, unit: "cell", group: "Lattice", why: "Narrow dots open the dark gaps between columns." },
      { key: "dotH", label: "Dot height", min: .3, max: 1.4, step: .01, def: 0.8, unit: "cell", group: "Lattice", why: "Tall dots fuse into vertical columns; short ones separate into beads." },
      { key: "levels", label: "Brightness levels", min: 2, max: 32, step: 1, def: 9, unit: "", group: "Lattice", why: "Steps of intensity per dot. 2 is one-bit." },
      { key: "heat", label: "Headline heat", min: .6, max: 7, step: .05, def: 3.3, unit: "×", group: "Light", why: "How far past saturation the type is driven. Sets the white core." },
      { key: "fuse", label: "Type fusion", min: 0, max: 1, step: .01, def: 0.5, unit: "", group: "Light", why: "How far the overdriven type closes the gaps between its dots." },
      { key: "bloom", label: "Bloom", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Light", why: "Halo energy over three radii." },
      { key: "gain", label: "Image gain", min: .3, max: 2.2, step: .01, def: 1.75, unit: "×", group: "Light", why: "Brightness of everything that is not the headline." },
      { key: "contrast", label: "Image contrast", min: .5, max: 3, step: .01, def: 1.45, unit: "γ", group: "Light", why: "Gamma on the image before it reaches the lattice. High values leave only the highlights lit." },
      { key: "fill", label: "Cell fill", min: 0, max: 1, step: .01, def: 0.09, unit: "", group: "Lattice", why: "Light leaking into the gaps between dots." },
      { key: "shade", label: "Shading", min: 0, max: 1, step: .01, def: 0, unit: "", group: "Light", why: "A broad light field across the image, so parts of it sink into the dark." },
      { key: "focus", label: "Focus", min: 0, max: 2.2, step: .01, def: 0.18, unit: "px", group: "Light", why: "Softness of each dot. 0 is razor." },
      { key: "drip", label: "Drip", min: 0, max: 1, step: .01, def: .55, unit: "", group: "Faults", why: "Columns bleeding down from the underside of the type." },
      { key: "slip", label: "Row slip", min: 0, max: 1, step: .01, def: .3, unit: "", group: "Faults", why: "Bands of rows knocked sideways." },
      { key: "dropout", label: "Dropout", min: 0, max: 1, step: .01, def: 0.4, unit: "", group: "Faults", why: "Per-dot loss of intensity." },
      { key: "noise", label: "Noise", min: 0, max: 1, step: .01, def: 0.07, unit: "", group: "Faults", why: "Sensor grain over the whole frame." },
      { key: "headSize", label: "Type size", min: .5, max: 1.5, step: .01, def: 0.96, unit: "×", group: "Layout", why: "Cap height of both lines." },
      { key: "weight", label: "Type weight", min: -8, max: 8, step: .1, def: 5, unit: "px", group: "Layout", why: "Thins or fattens the strokes before they hit the lattice." },
      { key: "stretch", label: "Justify stretch", min: 0, max: 1, step: .01, def: .7, unit: "", group: "Layout", why: "How far a short line may be widened to reach the measure." },
      { key: "subjectSize", label: "Subject size", min: .4, max: 2.4, step: .01, def: 1.7, unit: "×", group: "Layout", why: "Scale of the generated image." },
      { key: "block", label: "Data block", min: 0, max: 1, step: .01, def: .5, unit: "", group: "Layout", why: "Rows of unreadable text under the image. 0 removes it." },
      { key: "marks", label: "Marks", min: 0, max: 1, step: 1, def: 1, unit: "", group: "Layout", why: "Registration dashes and tick rows." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 7, unit: "", group: "Layout", why: "Re-rolls the subject and every fault." }
    ],
    bench: { palette: "measured", params: { line1: "GROW", line2: "FLOW" }, note: "The benchmark sets the type to the source wording so the type patch compares the same letters. The flower is generated, so the dot-field render rect was placed with search.py on a lit petal region with a shadow gap, the same material as the reference patch.", items: [
      { name: "headline", ref: [150, 150, 220, 84], out: [150, 150, 220, 84], m: ["hist", "mean", "std", "ink"], inks: [[3, 6, 5], [26, 128, 78], [124, 239, 200], [232, 252, 250]], inkNames: ["black", "green", "mint", "hot white"] },
      { name: "dot field", ref: [300, 420, 128, 128], out: [216, 624, 128, 128], m: ["hist", "mean", "std", "spec", "ac"], lags: 12 },
      { name: "data block", ref: [180, 880, 256, 64], out: [180, 880, 256, 64], m: ["hist", "mean", "std", "spec", "ac"], lags: 12 },
      { name: "halo", ref: [420, 96, 180, 46], out: [420, 96, 180, 46], m: ["hist", "mean", "std"] },
      { name: "whole plate", ref: [0, 0, 736, 1103], out: [0, 0, 736, 1103], m: ["hist", "mean", "ink"], inks: [[3, 6, 5], [6, 61, 34], [26, 128, 78], [71, 190, 132], [124, 239, 200], [226, 252, 249]], inkNames: ["black", "deep green", "green", "bright green", "mint", "hot white"] }
    ] },
    palettes: [
      { id: "measured", name: "P1 green", note: "measured", k: [.097, 1, .16], pk: [1.5, 1, 1], kb: [.0059, 0, .2], pw: [4.2, 3, 2], floor: [3, 6, 5], veil: [.1, .4, 1], sw: ["#030605", "#1a804e", "#7cefc8", "#e2fcf9"] },
      { id: "amber", name: "Amber", k: [1, .5, .07], kb: [0, .014, .012], floor: [6, 4, 2], veil: [1, .7, .35], sw: ["#060402", "#8a4a08", "#ffb43c", "#fff3d6"] },
      { id: "ice", name: "Ice", k: [.3, .66, 1], kb: [.02, .016, 0], floor: [3, 4, 7], veil: [.6, .8, 1], sw: ["#030407", "#24568c", "#8fd0ff", "#eef8ff"] },
      { id: "magenta", name: "Magenta", k: [1, .12, .6], kb: [0, .02, .016], floor: [6, 2, 5], veil: [1, .4, .9], sw: ["#060205", "#8c1a5c", "#ff7fd0", "#ffe9f7"] },
      { id: "red", name: "Signal red", k: [1, .1, .08], kb: [0, .02, .02], floor: [6, 2, 2], veil: [1, .45, .35], sw: ["#060202", "#8c1410", "#ff5a48", "#ffe6e0"] },
      { id: "paper", name: "Paper white", k: [.9, .95, 1], kb: [.01, .01, .01], floor: [4, 4, 5], veil: [.8, .9, 1], sw: ["#040405", "#565a60", "#c4cad2", "#ffffff"] }
    ],
    presets: [{ name: "Signage", set: { pitch: 11, dotH: .6, dotW: .6, levels: 3, bloom: .6 } }, { name: "Melt", set: { drip: 1, slip: .9, dropout: .8, bloom: 1.8 } }, { name: "Razor", set: { focus: 0, bloom: .25, noise: 0, fill: 0, pitch: 4.2 } }],
    motion: [{ key: "slip", amp: .25, period: 7, mode: "drift" }, { key: "bloom", amp: .12, period: 5, mode: "sine" }, { key: "drip", amp: .2, period: 11, mode: "drift" }],
    live: { x: { key: "pitch", min: 4, max: 11 }, y: { key: "bloom", min: .3, max: 2 } },
    source: "Reference 3: phosphor poster, 736 × 1103 px JPEG",
    passes: ["scene in gray at full resolution: the headline on a hot layer; the rose cluster (faces at a 0.75 gamma, the ring that faces the light 1.3 hotter, shadow sides at 0.15, creases at 0), registration marks and the type's own 12 px content glow on a cold layer", "lattice: both layers averaged into 5.85 px cells; the data block written straight into cells as row gain (1.12 on the first row falling to 0.72) × per-column gain × a right-skewed residual, with 1 to 3 cell word gaps on about 20 % of cells and a one-row paragraph break at 0.6", "faults on the lattice: drips under the type, persistence streaks down every column at 0.48 of the drive above, row slip, sparse dropout with a 14 % per-cell jitter, 9 brightness levels; cells under 0.15 of full drive fall to one dim level at 0.06, the display's floor", "emission: one gaussian bead per cell, 0.35 cells wide and 0.8 tall; the type's coverage takes a display gamma of 2.4, so edge cells drive to mint and only interior cells with four lit neighbors fuse into solid white", "optics: 0.18 px focus, then glow at 2.6, 8.25 and 40 px, the 40 px term also as a blue-white lens veil", "phosphor saturation: green 1 − exp(−T); blue 1 − exp(−(0.16 T + 0.2 T²)); red 1 − exp(−(0.097 T^1.5 + 0.0059 T^4.2)); drive capped at Tc = 4 so the white core reads 235 252 250"],
    measured: { lattice_pitch_px: { x: 5.85, y: 5.8, method: "autocorrelation peaks of the column and row profiles of the data block, lags 6, 12, 17 to 18" }, bead_fwhm_px: { x: 2.2, y: 4.4, method: "column profile 14→101→49 across one bead; row profile modulation 53 to 116 fitted to a gaussian bead" }, gap_to_peak_drive: { ratio: .27, method: "gap pixel [1, 80, 24] and peak pixel [85, 190, 128] inverted through the green curve, the same in the block, the flower and a hot cluster" }, block_cells: { mean_L: 96.7, std_L: 22.4, column_gain_std: 11.2, row_gain_std: 8.9, residual_std: 17.2, lag1_corr: .42, method: "5 × 5 means at peak-aligned cell centers, 77 × 10 cells" }, flower_cells: { dark_share: .41, dim_32_64_share: .07, mid_64_128_share: .045, lit_128_224_share: .42, hot_over_224_share: .05, lit_run_median_cells: 6, method: "cell maxima over 120..620 × 330..850; the render measures .43 / .13 / .05 / .36 / .03" }, type: { cap_px: 90, GROW_width_px: 482, FLOW_width_px: 442, line_gap_px: 15, center_offset_px: -5, stroke_px: 45, counter_px: 18, method: "rows and columns with L > 200" }, glow_above_type: { G_at_d: { 2: 154, 4: 131, 8: 86, 14: 68, 26: 41, 36: 29 }, B_over_G: { 4: .85, 14: .94, 36: 1.14 }, method: "per-column profile above the first white pixel, 481 columns" }, phosphor_curves: { green: "1 − exp(−T)", blue: "1 − exp(−(0.16 T + 0.2 T²))", red: "1 − exp(−(0.097 T^1.5 + 0.0059 T^4.2))", method: "R and B binned by G over the headline patch, T from the green curve" }, black_share: .633, hot_white: [233, 252, 250], hot_white_share: .058 },
    limits: ["The flower is generated and the reference's is a photograph: the dot-field patch is compared at a search-chosen rect; its histogram and contrast sit at 0.91 because the photograph's dim cells spread over 16 to 64 L where the render holds one dim level.", "The reference is a JPEG whose quantization flattens dim lattice detail and softens the type's edge: the headline histogram and mint ink sit at 0.89 to 0.90, the data-block spectrum at 0.90; no blur was added to close that.", "Archivo Black at +5 px stroke stands in for the reference's extended black sans, whose strokes measure 45 px with 18 px counters; the reference sets each line at its natural width (482 and 442 px) and the render justifies to one measure."],
    study: { slug: "phosphor-cell", lede: "A rose cluster and a two-line headline sampled to a 5.85 px phosphor lattice, faulted on the lattice, then pushed through glow and a per-channel saturation curve.",
      body: ["The reference is a photograph of a monochrome green display. Each cell is one phosphor bead on a 5.85 px pitch, about 2.2 px wide and 4.4 px tall, so the columns read before the rows. A bead driven harder does not grow, it changes color: green saturates first, blue follows as the square of the drive, red stays near zero until about twice the drive that saturates green. The camera adds two things the display does not make. A glow of about 8 px fills the gaps beside bright cells with mid green. A veil of about 40 px lays a blue-white haze over everything near the headline, which is why the halo above the type measures more blue than green at 36 px out.", "The rebuild draws the scene in gray at full resolution: the headline on a hot layer, the rose cluster, the registration marks and the data block on a cold layer. Both layers are averaged into lattice cells. The faults happen on the lattice: drips under the type, persistence streaks down every column, row slip, sparse dropout, nine brightness levels with a floor at 0.15 of full drive. Each cell emits one gaussian bead; the type's coverage takes a 2.4 display gamma, so its edge cells sit at mint and only interior cells with four lit neighbors fuse into solid white. Three blurs make the glow and the per-channel curve turns drive into color. Pitch, dot width and dot height set the lattice. Heat and fusion set the white core of the type. Bloom scales the three glow radii together. Gain and contrast shape the gray image before it reaches the lattice."],
      method: "Gray scene · Lattice sampling · Faults on the lattice · Bead emission with fusion · Three-radius glow · Per-channel saturation",
      points: [
        { u: .5, v: .17, d: "KEY", label: "Headline core: cells with four lit neighbors fuse into a solid; the drive caps at Tc = 4 and every channel reads about 235 252 250.", t: "type", dir: [0, -1] },
        { u: .22, v: .2, d: "READ", label: "Rim of the G: edge cells take the 2.4 display gamma, so they drive to mint one cell wide while the interior fuses to white.", t: "lattice", dir: [-1, 0] },
        { u: .69, v: .1, d: "READ", label: "Halo above the type: 40 px veil, blue above green from 14 px out; the green glow is gone by 50 px.", t: "glow", dir: [0, -1] },
        { u: .5, v: .33, d: "READ", label: "Drips: columns under the type decay over 2 to 26 cells, one in three edge cells at the default.", t: "fault", dir: [1, 0] },
        { u: .46, v: .5, d: "KEY", label: "Lit petal face: beads at 180 to 220 luminance, a hot rim where the petal edge faces the upper-left light.", t: "subject", dir: [-1, -1] },
        { u: .6, v: .56, d: "READ", label: "Cup shadow: cells under 0.15 drive fall to the display floor, one dim level at T 0.3; the creases between petals go to black.", t: "glow", dir: [1, 0] },
        { u: .32, v: .64, d: "READ", label: "Leaf: the dark midrib and side veins sample as missing cells one column wide.", t: "subject", dir: [-1, 1] },
        { u: .5, v: .82, d: "KEY", label: "Data block: row gain 1.12 falling to 0.72, column gain σ 11, a right-skewed residual σ 17, word gaps of 1 to 3 cells and a paragraph break one row deep.", t: "lattice", dir: [0, 1] },
        { u: .55, v: .74, d: "READ", label: "Persistence: a bright cell streaks down its column at 0.48 of its drive, decaying 0.8 per row.", t: "fault", dir: [1, 1] },
        { u: .38, v: .87, d: "READ", label: "Below the block: the streaks continue 10 px past the last row at about L 25, and nothing spills sideways.", t: "fault", dir: [-1, 1] }
      ] }
  });
})();
