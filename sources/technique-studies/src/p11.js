/* ===== PLATE 11 · STITCH SAMPLER =====
   one thread primitive (a capsule with a three-tone cross profile, a twist along its length and fiber fuzz at
   its edges) laid down by band generators on one 22.5 px stitch grid: satin runs, a packed bar, a couched
   lattice, chevrons, herringbone. Two threads; clusters of the second color from one slow field. Paper
   shows thread shadow. Type and swatches are Mindgut copy. */
(function () {
  const REF = { w: 905, h: 1181 };
  /* ---- a thread segment list, then one rasterizer ---- */
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c, N = W * H;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 3331 + 7), nA = vnoise(P.seed + 5), nB = vnoise(P.seed + 23), nC = vnoise(P.seed + 61);
    const pitch = P.pitch * u, hw = P.thread * u * .5, x0 = W * .11, x1 = W * .89;
    const segs = []; /* {ax,ay,bx,by,c:0|1,w,z} */
    /* color field: which thread a stitch takes; clusters from one slow field, per band bias */
    const pick = (x, y, bias) => (fbm(nA, x / (90 * u), y / (90 * u), 3) - .5) * 2 * P.mix + bias > 0 ? 1 : 0;
    const add = (ax, ay, bx, by, c, w, z, k) => segs.push({ ax, ay, bx, by, c, w: w || hw, z: z || 0, k: k || 1 });
    /* band generators */
    const satin = (y0, rows, bias) => { const rp = pitch, ang = -.95, L = rp / Math.abs(Math.sin(ang)) * .92; for (let r = 0; r < rows; r++) { const y = y0 + r * rp + rp / 2, off = ((-r * L * Math.cos(ang)) % pitch + pitch) % pitch; for (let x = x0 + off - pitch; x < x1; x += pitch) { const c = pick(x, y, bias), a = ang + (rnd() - .5) * .18, l = L * (.8 + rnd() * .4), jx = (rnd() - .5) * 8 * u, jy = (rnd() - .5) * 5 * u; add(x + jx - Math.cos(a) * l / 2, y + jy - Math.sin(a) * l / 2, x + jx + Math.cos(a) * l / 2, y + jy + Math.sin(a) * l / 2, c, hw * 1.06, r); } } };
    const bar = (y0, h, bias) => { const step = hw * 1.6; for (let x = x0; x < x1; x += step * (.85 + rnd() * .3)) { const c = pick(x, y0, bias + .35), sl = h * (.4 + rnd() * .3), jx = (rnd() - .5) * u, jy = (rnd() - .5) * 2 * u; const X0 = Math.max(x - sl, x0), X1 = Math.min(x, x1); if (X1 - X0 < 2 * u) continue; const zz = rnd(); add(X0 + jx, y0 + h + jy, X1 + jx, y0 + jy, c, hw * .9, zz); add(X0 + jx - hw * .8, y0 + h + jy, X1 + jx - hw * .8, y0 + jy, c, hw * .3, zz + .001, .42); } };
    const lattice = (y0, rows, bias) => { const nx = Math.floor((x1 - x0) / pitch), JX = [], JY = []; for (let i = 0; i <= nx; i++) { JX.push([]); JY.push([]); for (let r = 0; r <= rows; r++) { JX[i].push((rnd() - .5) * 7 * u); JY[i].push((rnd() - .5) * 6 * u); } } const X = (i, r) => x0 + i * pitch + JX[i][r], Y = (i, r) => y0 + r * pitch + JY[i][r]; for (let r = 0; r <= rows; r++) for (let i = 0; i < nx; i++) add(X(i, r) + 2 * u, Y(i, r), X(i + 1, r) - 2 * u, Y(i + 1, r), pick(X(i, r), Y(i, r), bias), hw * .68, 0); for (let i = 0; i <= nx; i++) for (let r = 0; r < rows; r++) add(X(i, r), Y(i, r) + 2 * u, X(i, r + 1), Y(i, r + 1) - 2 * u, pick(X(i, r), Y(i, r) + pitch / 2, bias), hw * .68, 1); /* couching knots at the crossings */ for (let i = 0; i <= nx; i++) for (let r = 0; r <= rows; r++) { const x = X(i, r), y = Y(i, r), c = pick(x, y, bias); if (x > x1 + 3 * u) continue; add(x - hw, y, x + hw, y, c, hw * .66, 2); add(x, y - hw, x, y + hw, c, hw * .66, 2); } };
    const zigzag = (y0, rows, bias, amp) => { amp = amp || pitch * .42; for (let r = 0; r < rows; r++) { const y = y0 + r * pitch * .67 + amp / 2, rx = (rnd() - .5) * 12 * u, ry = (rnd() - .5) * 3 * u; for (let x = x0 + rx; x < x1; x += pitch) { const c = pick(x, y, bias), a = amp * (.85 + rnd() * .3), jx = (rnd() - .5) * 2 * u; add(x + jx, y + ry + a / 2, x + pitch / 2 + jx, y + ry - a / 2, c, hw * .82, r); add(x + pitch / 2 + jx, y + ry - a / 2, x + pitch + jx, y + ry + a / 2, c, hw * .82, r); } } };
    const herring = (y0, rows, bias, open) => { const h = pitch; for (let r = 0; r < rows; r++) { const y = y0 + r * pitch, dir = r % 2 ? 1 : -1; for (let x = x0 + (r % 2) * pitch * .5; x < x1; x += pitch) { const c = pick(x, y, bias); if (open && hashI(Math.round(x / pitch * 2), r, P.seed + 3) < .5) continue; const jx = (rnd() - .5) * 2 * u; add(x + jx, y + (dir > 0 ? h * .05 : h * .95), x + jx + pitch * .5, y + (dir > 0 ? h * .95 : h * .05), c, hw * .9, r); } } };
    /* tufts: loose thread ends splayed from a band end */
    const tuft = (x, y, c, dir) => { const n = 2 + (rnd() * 3 | 0); for (let i = 0; i < n; i++) { const L = (18 + rnd() * 30) * u, a = (rnd() - .5) * 1.1 + (dir < 0 ? 3.14 : 0) + .2, mx = x + Math.cos(a) * L * .5 + (rnd() - .5) * 6 * u, my = y + Math.sin(a) * L * .5 + (rnd() - .5) * 8 * u; add(x, y, mx, my, c, hw * .55, 3); add(mx, my, x + Math.cos(a) * L, y + Math.sin(a) * L + (rnd() - .5) * 10 * u, c, hw * .45, 3); } };
    /* ---- the sampler: bands from the top, heights from the reference ---- */
    let y = H * .1 + rnd() * 10 * u; const bands = [];
    const plan = ["satinloose", "satin", "bar", "lattice", "zigzag", "herring-open", "herring", "lattice", "zigzag"];
    const biases = [-.3, -.4, -.62, .2, 0, .2, -.1, -.35, .35], nb = Math.round(P.bands); for (let i = 0; i < nb; i++) { const kind = plan[i % plan.length], bias = biases[i % biases.length] + (rnd() - .5) * .2; bands.push({ kind, y, bias });
      if (kind === "satinloose") { herring(y, 2, bias, true); y += 2 * pitch; }
      else if (kind === "satin") { const rows = 7 + (rnd() * 2 | 0); satin(y, rows, bias); tuft(x0 - 4 * u, y + pitch * (1 + rnd() * 2), pick(x0, y, bias), -1); tuft(x1 + 4 * u, y + pitch * (2 + rnd() * 3), pick(x1, y + 40 * u, bias), 1); y += rows * pitch + pitch * .3; }
      else if (kind === "bar") { bar(y, pitch * 1.1, bias); tuft(x0 - 2 * u, y + pitch * .5, pick(x0, y, bias + .35), -1); y += pitch * 1.6; }
      else if (kind === "lattice") { const rows = 3 + (rnd() * 2 | 0); lattice(y, rows, bias); tuft(x0 - 2 * u, y + pitch * rows * .5, pick(x0, y, bias), -1); y += rows * pitch + pitch * .8; }
      else if (kind === "zigzag") { const rows = 5 + (rnd() * 2 | 0); zigzag(y, rows, bias); y += rows * pitch * .67 + pitch * .9; }
      else if (kind === "herring-open") { herring(y, 2 + (rnd() * 2 | 0), bias, true); y += 3 * pitch; }
      else { const rows = 3 + (rnd() * 2 | 0); herring(y, rows, bias, false); y += rows * pitch + pitch * .5; }
      if (y > H * .8) break; }
    const yEnd = y;
    /* needle at the top right with a loose loop of thread */
    const needle = P.needle > 0;
    if (needle) { const nx = x1 - 20 * u, ny = H * .1 - 6 * u, L = 110 * u * P.needle, a = -.45; const c = pick(nx, ny, .3); add(nx + Math.cos(a) * L * .55, ny + Math.sin(a) * L * .55, nx - 10 * u, ny + 36 * u, c, hw * .5, 4); add(nx - 10 * u, ny + 36 * u, nx + 18 * u, ny + 60 * u, c, hw * .5, 4); add(nx + Math.cos(a) * L * .55, ny + Math.sin(a) * L * .55, nx + Math.cos(a) * L * .55 + 40 * u, ny + Math.sin(a) * L * .55 - 50 * u, c, hw * .5, 4); add(nx + Math.cos(a) * L * .55 + 40 * u, ny + Math.sin(a) * L * .55 - 50 * u, nx + Math.cos(a) * L * .55 + 15 * u, ny + Math.sin(a) * L * .55 - 95 * u, c, hw * .45, 4); bands.needle = [nx, ny, L, a]; }
    /* ---- rasterize: paper, shadow, threads ---- */
    const TR = new Float32Array(N), TG = new Float32Array(N), TB = new Float32Array(N), TA = new Float32Array(N);
    const cols = [C.blue, C.red], lit = [C.blueLit, C.redLit], dark = [C.blueDark, C.redDark];
    segs.sort((a, b) => a.z - b.z);
    const fz = P.fuzz, tw = P.twist;
    for (let k = 0; k < segs.length; k++) {
      const sg = segs[k], w = sg.w, kk = sg.k, dx = sg.bx - sg.ax, dy = sg.by - sg.ay, len = Math.hypot(dx, dy) || 1, ex = dx / len, ey = dy / len, col = cols[sg.c], li = lit[sg.c], dk = dark[sg.c];
      const pad = w + 3 * u, X0 = Math.max(0, Math.floor(Math.min(sg.ax, sg.bx) - pad)), X1 = Math.min(W - 1, Math.ceil(Math.max(sg.ax, sg.bx) + pad)), Y0 = Math.max(0, Math.floor(Math.min(sg.ay, sg.by) - pad)), Y1 = Math.min(H - 1, Math.ceil(Math.max(sg.ay, sg.by) + pad));
      for (let yy = Y0; yy <= Y1; yy++) for (let xx = X0; xx <= X1; xx++) {
        const px = xx + .5 - sg.ax, py = yy + .5 - sg.ay; let t = px * ex + py * ey; const tc = clamp(t, 0, len), qx = px - tc * ex, qy = py - tc * ey, d = Math.hypot(qx, qy), side = qx * ey - qy * ex;
        /* edge wobble and twist: the thread is a twisted bundle, its silhouette bumps every few px */
        const wob = (hashI(Math.round(tc / (2.2 * u)) + 7, sg.z + k * 3, P.seed) - .5) * 1.4 * u * fz, wl = (w + wob) * (len < 4 * w ? .72 + .28 * Math.sin(3.1416 * clamp(tc / len, 0, 1)) : 1);
        let cov = clamp(wl - d + .5, 0, 1);
        if (cov <= 0) { /* fibers: short hairs past the edge */ if (fz > 0 && d < wl + 3.5 * u && hashI(xx, yy, P.seed + 9) < .028 * fz * (1 - (d - wl) / (3.5 * u))) { const i = yy * W + xx, a = .22; TR[i] += (dk[0] - TR[i]) * a; TG[i] += (dk[1] - TG[i]) * a; TB[i] += (dk[2] - TB[i]) * a; TA[i] = Math.min(1, TA[i] + a); } continue; }
        const i = yy * W + xx, tt = d / wl, ph = Math.sin((tc / (4.8 * u)) * 6.283 + side * 1.1 / u) * .5 + .5;
        const shade = sstep(.5, 1, tt), hl = (1 - sstep(.1, .6, tt)) * (.55 + .45 * ph * tw) + (1 - tw) * .2, tm = 1 + (ph - .5) * .36 * tw * (1 - shade);
        let r = lerp(col[0], dk[0], shade) * tm, g = lerp(col[1], dk[1], shade) * tm, b = lerp(col[2], dk[2], shade) * tm;
        r += (li[0] - r) * hl * .65; g += (li[1] - g) * hl * .65; b += (li[2] - b) * hl * .65;
        const gr = (hashI(xx, yy, P.seed + 4) - .5) * 14 * fz; r = r * kk + gr; g = g * kk + gr; b = b * kk + gr;
        TR[i] += (r - TR[i]) * cov; TG[i] += (g - TG[i]) * cov; TB[i] += (b - TB[i]) * cov; TA[i] = TA[i] + cov - TA[i] * cov;
      }
    }
    /* photographic softness of the threads */
    const sb = (P.soft ?? .6) * u; if (sb > .2) { const PR = new Float32Array(N), PG = new Float32Array(N), PB = new Float32Array(N); for (let i = 0; i < N; i++) { PR[i] = TR[i] * TA[i]; PG[i] = TG[i] * TA[i]; PB[i] = TB[i] * TA[i]; } const bR = gblur(PR, W, H, sb), bG = gblur(PG, W, H, sb), bB = gblur(PB, W, H, sb), bA = gblur(TA, W, H, sb); for (let i = 0; i < N; i++) { const a = bA[i]; TA[i] = a; if (a > 1e-4) { TR[i] = bR[i] / a; TG[i] = bG[i] / a; TB[i] = bB[i] / a; } } }
    /* needle body on top: steel gray taper with an eye */
    if (needle) { const [nx, ny, L, a] = bands.needle, g = cv.getContext("2d"); g.clearRect(0, 0, W, H); g.lineCap = "round"; g.strokeStyle = css(C.steel); g.lineWidth = 2.6 * u; g.beginPath(); g.moveTo(nx + Math.cos(a) * L * .55, ny + Math.sin(a) * L * .55); g.lineTo(nx - Math.cos(a) * L * .45, ny - Math.sin(a) * L * .45); g.stroke(); g.lineWidth = 1.2 * u; g.strokeStyle = css(C.steelDark); g.beginPath(); g.moveTo(nx + Math.cos(a) * L * .55, ny + Math.sin(a) * L * .55); g.lineTo(nx + Math.cos(a) * L * .38, ny + Math.sin(a) * L * .38); g.stroke(); g.fillStyle = css(C.paper); g.beginPath(); g.ellipse(nx + Math.cos(a) * L * .47, ny + Math.sin(a) * L * .47, 1.2 * u, 2.6 * u, a, 0, 6.3); g.fill();
      const dd = g.getImageData(0, 0, W, H).data; for (let i = 0; i < N; i++) { const al = dd[i * 4 + 3] / 255; if (al > 0) { TR[i] += (dd[i * 4] - TR[i]) * al; TG[i] += (dd[i * 4 + 1] - TG[i]) * al; TB[i] += (dd[i * 4 + 2] - TB[i]) * al; TA[i] = TA[i] + al - TA[i] * al; } } }
    /* thread shadow on the paper: alpha blurred and offset */
    const sh = lowblur(TA, W, H, 2.2 * u, 2), ox = Math.round(1.6 * u), oy = Math.round(2 * u);
    /* type: Mindgut wordmark in spaced caps, two thread swatches */
    const g2 = cv.getContext("2d"); g2.clearRect(0, 0, W, H);
    const ty = Math.min(H * .9, yEnd + 70 * u), fs = 22 * u * P.typeSize; g2.font = `600 ${fs}px "Archivo",Arial,sans-serif`; g2.textAlign = "center"; g2.textBaseline = "alphabetic"; g2.fillStyle = css(C.ink);
    try { g2.letterSpacing = (fs * .32) + "px"; } catch (e) {}
    const txt = (P.word || "").toUpperCase(); g2.fillText(txt, W / 2 + fs * .16, ty);
    try { g2.letterSpacing = "0px"; } catch (e) {}
    const td = g2.getImageData(0, 0, W, H).data;
    /* swatches: two short stacks of horizontal stitches */
    const sy = ty + 36 * u, sw2 = 16 * u, sh2 = 24 * u; const sws = []; [0, 1].forEach((c, j) => { const sx = W / 2 + (j - .5) * 30 * u - sw2 / 2; for (let yy = 0; yy < sh2; yy += hw * .7) sws.push({ ax: sx, ay: sy + yy, bx: sx + sw2, by: sy + yy + (rnd() - .5) * u, c, w: hw * .6 }); });
    for (const sg of sws) { const w = sg.w, X0 = Math.floor(sg.ax - w - 1), X1 = Math.ceil(sg.bx + w + 1), Y0 = Math.floor(Math.min(sg.ay, sg.by) - w - 1), Y1 = Math.ceil(Math.max(sg.ay, sg.by) + w + 1), dx = sg.bx - sg.ax, dy = sg.by - sg.ay, len = Math.hypot(dx, dy), ex = dx / len, ey = dy / len, col = cols[sg.c], dk = dark[sg.c], li = lit[sg.c]; for (let yy = Y0; yy <= Y1; yy++) for (let xx = X0; xx <= X1; xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const px = xx + .5 - sg.ax, py = yy + .5 - sg.ay, tc = clamp(px * ex + py * ey, 0, len), d = Math.hypot(px - tc * ex, py - tc * ey), cov = clamp(w - d + .5, 0, 1); if (cov <= 0) continue; const i = yy * W + xx, tt = d / w, shade = sstep(.3, .95, tt), hl = 1 - sstep(.05, .45, tt); let r = lerp(col[0], dk[0], shade), g = lerp(col[1], dk[1], shade), b = lerp(col[2], dk[2], shade); r += (li[0] - r) * hl * .6; g += (li[1] - g) * hl * .6; b += (li[2] - b) * hl * .6; TR[i] += (r - TR[i]) * cov; TG[i] += (g - TG[i]) * cov; TB[i] += (b - TB[i]) * cov; TA[i] = TA[i] + cov - TA[i] * cov; } }
    /* ---- compose: paper with its own grain, shadow, threads, type ---- */
    const img = g2.createImageData(W, H), d = img.data, pap = C.paper, pg = P.paper;
    const mw = Math.ceil(W / 4), mh = Math.ceil(H / 4), m0 = new Float32Array(mw * mh); for (let yy = 0; yy < mh; yy++) for (let xx = 0; xx < mw; xx++) m0[yy * mw + xx] = fbm(nB, xx / (9 * u), yy / (9 * u), 3) - .5; const mot = upsampleCR(m0, mw, mh, W, H);
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      const i = yy * W + xx, j = i * 4, sx = xx - ox, sy2 = yy - oy, shd = (sx >= 0 && sy2 >= 0) ? sh[sy2 * W + sx] : 0;
      const n = (hashI(xx, yy, P.seed + 44) - .5) * 5 * pg + mot[i] * 4 * pg, k = 1 - shd * .06 * P.shadow;
      let r = (pap[0] + n) * k, g = (pap[1] + n) * k, b = (pap[2] + n) * k;
      const a = TA[i]; if (a > 0) { r += (TR[i] - r) * a; g += (TG[i] - g) * a; b += (TB[i] - b) * a; }
      const ta = td[j + 3] / 255; if (ta > 0) { r += (td[j] - r) * ta; g += (td[j + 1] - g) * ta; b += (td[j + 2] - b) * ta; }
      const gn = (hashI(xx, yy, P.seed + 45) - .5) * 4 * pg; d[j] = clamp(r + gn, 0, 255); d[j + 1] = clamp(g + gn, 0, 255); d[j + 2] = clamp(b + gn, 0, 255); d[j + 3] = 255;
    }
    g2.putImageData(img, 0, 0);
  }
  /* wide blur at reduced resolution */
  function lowblur(src, W, H, sigma, f) { const w0 = Math.ceil(W / f), h0 = Math.ceil(H / f), d = new Float32Array(w0 * h0), c = new Float32Array(w0 * h0); for (let y = 0; y < H; y++) { const yy = (y / f) | 0; for (let x = 0; x < W; x++) { const i = yy * w0 + ((x / f) | 0); d[i] += src[y * W + x]; c[i]++; } } for (let i = 0; i < d.length; i++) d[i] /= c[i] || 1; return upsampleCR(gblur(d, w0, h0, sigma / f), w0, h0, W, H); }
  PLATES.push({
    id: "p11", no: "11", title: "Stitch Sampler", ref: REF, render,
    line: "One twisted-thread capsule, 8 px wide with a lit crown and dark flanks, laid by five band generators on a 22.5 px grid in two threads, casting a 2 px shadow on white paper.",
    texts: [{ key: "word", label: "Wordmark", def: "MINDGUT" }],
    params: [
      { key: "pitch", label: "Stitch grid", min: 12, max: 40, step: .5, def: 22.5, unit: "px", group: "Stitch", why: "Spacing of the stitch grid every band is laid on. Measured 22 to 23 px in every band." },
      { key: "thread", label: "Thread width", min: 3, max: 16, step: .1, def: 8, unit: "px", group: "Stitch", why: "Diameter of the thread. Measured 8.2 px on the satin runs, 7.2 px on the chevrons." },
      { key: "twist", label: "Twist", min: 0, max: 1.5, step: .01, def: 1, unit: "×", group: "Stitch", why: "How much the lit crown and the body striation follow the 4.8 px twist of the bundle." },
      { key: "fuzz", label: "Fiber fuzz", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Stitch", why: "Edge wobble and stray hairs within 3.5 px of each thread." },
      { key: "mix", label: "Second thread", min: 0, max: 2, step: .01, def: .8, unit: "×", group: "Thread", why: "Strength of the cluster field that hands a band's stitches to the other thread. 0 keeps each band one color." },
      { key: "bands", label: "Bands", min: 1, max: 9, step: 1, def: 9, unit: "", group: "Sampler", why: "How many bands of the sampler are sewn, in order from the top." },
      { key: "needle", label: "Needle", min: 0, max: 1.6, step: .01, def: 1, unit: "×", group: "Sampler", why: "Length of the needle at the top right. 0 removes it and its loose thread." },
      { key: "shadow", label: "Thread shadow", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Paper", why: "Darkening of the paper under each thread, blurred 2.2 px and offset 2 px." },
      { key: "paper", label: "Paper grain", min: 0, max: 3, step: .01, def: 0, unit: "×", group: "Paper", why: "Fine grain and 36 px mottle of the white. The reference paper is flat, so the default is 0." },
      { key: "typeSize", label: "Type size", min: .5, max: 2, step: .01, def: 1, unit: "×", group: "Type", why: "Cap size of the wordmark under the sampler." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 3, unit: "", group: "Sampler", why: "Re-rolls band heights, color clusters, tufts." }
    ],
    motion: [{ key: "mix", amp: .5, period: 9, mode: "sine" }, { key: "twist", amp: .4, period: 6, mode: "sine" }],
    live: { x: { key: "mix", min: 0, max: 2 }, y: { key: "thread", min: 4, max: 14 } },
    presets: [{ name: "Fine silk", set: { thread: 4.5, pitch: 14, fuzz: .4 } }, { name: "Wool", set: { thread: 12, pitch: 30, fuzz: 2, twist: 1.3 } }, { name: "One thread", set: { mix: 0, thread: 9.5 } }, { name: "Loose", set: { bands: 5, shadow: 2 } }],
    palettes: [
      { id: "measured", name: "Blue and red", note: "measured", c: { paper: [246, 246, 246], blue: [32, 108, 176], blueLit: [120, 186, 236], blueDark: [18, 64, 124], red: [224, 58, 34], redLit: [246, 120, 96], redDark: [194, 34, 14], ink: [40, 50, 70], steel: [150, 152, 156], steelDark: [90, 92, 96] }, sw: ["#f4f5f5", "#1f68a8", "#da3a22", "#283246"] },
      { id: "mono", name: "Black thread", c: { paper: [246, 246, 246], blue: [40, 40, 44], blueLit: [110, 110, 116], blueDark: [16, 16, 18], red: [120, 120, 126], redLit: [180, 180, 186], redDark: [80, 80, 84], ink: [30, 30, 34], steel: [150, 152, 156], steelDark: [90, 92, 96] }, sw: ["#f6f6f6", "#28282c", "#78787e", "#1e1e22"] },
      { id: "forest", name: "Forest and gold", c: { paper: [240, 244, 240], blue: [30, 110, 70], blueLit: [90, 170, 120], blueDark: [16, 70, 44], red: [220, 160, 40], redLit: [245, 200, 110], redDark: [180, 120, 20], ink: [30, 50, 40], steel: [150, 152, 156], steelDark: [90, 92, 96] }, sw: ["#f0f4f0", "#1e6e46", "#dca028", "#1e3228"] },
      { id: "night", name: "Night cloth", c: { paper: [24, 26, 34], blue: [120, 190, 255], blueLit: [200, 230, 255], blueDark: [60, 120, 190], red: [255, 120, 90], redLit: [255, 190, 160], redDark: [200, 70, 40], ink: [220, 224, 232], steel: [170, 172, 176], steelDark: [110, 112, 116] }, sw: ["#181a22", "#78beff", "#ff785a", "#dce0e8"] },
      { id: "violet", name: "Violet and lime", c: { paper: [247, 246, 250], blue: [110, 60, 190], blueLit: [170, 130, 230], blueDark: [70, 30, 130], red: [140, 190, 40], redLit: [190, 230, 110], redDark: [100, 140, 20], ink: [50, 40, 70], steel: [150, 152, 156], steelDark: [90, 92, 96] }, sw: ["#f7f6fa", "#6e3cbe", "#8cbe28", "#322846"] },
      { id: "sea", name: "Teal and coral", c: { paper: [242, 246, 247], blue: [20, 130, 140], blueLit: [90, 190, 200], blueDark: [10, 80, 90], red: [240, 90, 100], redLit: [250, 150, 150], redDark: [190, 50, 60], ink: [30, 50, 60], steel: [150, 152, 156], steelDark: [90, 92, 96] }, sw: ["#f2f6f7", "#14828c", "#f05a64", "#1e323c"] }
    ],
    bench: { palette: "measured", params: {}, note: "Bands are generated in the reference's order with the reference's heights; patches were placed with search.py on the default render, then fixed by hand on the matching stitch family.", items: [
      { name: "satin runs", ref: [150, 190, 300, 120], out: [230, 200, 300, 120], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 12, inks: [[244, 245, 245], [31, 104, 168], [218, 58, 34]], inkNames: ["paper", "blue", "red"] },
      { name: "packed bar", ref: [150, 383, 500, 28], out: [150, 353, 500, 28], m: ["hist", "mean", "std", "ink", "share"], inks: [[244, 245, 245], [31, 104, 168], [218, 58, 34]], inkNames: ["paper", "blue", "red"] },
      { name: "lattice", ref: [300, 455, 140, 100], out: [300, 386, 140, 100], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 12, inks: [[244, 245, 245], [31, 104, 168], [218, 58, 34]], inkNames: ["paper", "blue", "red"] },
      { name: "chevrons", ref: [300, 850, 160, 110], out: [300, 830, 160, 110], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 12, inks: [[244, 245, 245], [31, 104, 168], [218, 58, 34]], inkNames: ["paper", "blue", "red"] },
      { name: "paper", ref: [560, 1000, 300, 100], out: [560, 1000, 300, 100], m: ["hist", "mean", "std", "spec"] },
      { name: "whole plate", ref: [0, 0, 905, 1181], out: [0, 0, 905, 1181], m: ["hist", "ink", "share"], inks: [[244, 245, 245], [31, 104, 168], [215, 59, 37], [132, 178, 214], [237, 156, 143]], inkNames: ["paper", "blue", "red", "blue edge", "red edge"] }
    ] },
    passes: ["stitch list: band generators on the 22.5 px grid (satin runs at 54°, a packed bar whose loops sit 6.4 px apart, a couched lattice with cross knots, chevrons of 9.5 px amplitude in rows 15 px apart, herringbone), tufts at band ends, a needle with its loose loop", "one color field (150 px) hands clusters of stitches to the second thread", "rasterize each capsule in z order: coverage from the capsule distance, a 5.5 px twist moving the lit crown, dark flanks past 30 % of the radius, hairs within 3.5 px", "needle body in steel over the threads", "photographic softness: the thread layer blurred 0.6 px premultiplied; thread shadow: coverage blurred 2.2 px, offset 2 px, darkening the paper 6 %", "paper: flat [246,246,246] as in the reference (grain optional); threads and type over it"],
    measured: { paper: [244, 245, 245], blue_mean: [31, 104, 168], blue_lit: [67, 138, 194], blue_dark: [26, 76, 131], red_mean: [215, 59, 37], red_lit: [224, 102, 81], red_dark: [218, 37, 16], blue_share: .12, red_share: .098, thread_halfwidth_px: { satin: 4.12, chevron: 3.61 }, satin_angle_deg: 54, grid_pitch_px: "autocorrelation peaks at 22 to 23 and 45 in satin, lattice, chevron and herringbone bands", chevron_row_pitch_px: 15, coverage: { satin: .548, lattice: .462, chevron: .506, bar: .963 }, band_rows_y: "satin 175 to 370, bar 385 to 410, lattice 470 to 540, chevron 540 to 600, herringbone 600 to 770, lattice 780 to 850, chevron 850 to 950", wordmark_y: 1035, swatches_y: 1140, rejected: "a flat two-tone thread: the measured cross profile has three tones with the lit crown off center" },
    limits: ["Benchmark 90.8 % mean. The packed bar scores lowest (contrast 65 %, histogram 73 %): the reference bar is a braid with crevices down to L 48 and lit loops up to L 247, the rebuild's grooves bottom out near L 70.", "Satin and chevron autocorrelation (87 %, 80 %) miss because the rebuild's stitch spacing is a jittered 22.5 px grid and the reference's hand spacing drifts more; ink coverage in the satin patch (77 %, 74 %) depends on where the seeded red cluster falls.", "The reference's red cross-hatch patch is a separate diagonal lattice laid over the satin; the rebuild clusters stitches of the second thread instead.", "The wordmark in the reference is a fashion house; it is replaced by editable Mindgut copy in Archivo, so the type is not scored.", "The reference paper is flat [246,246,246]; the thread layer is blurred 0.6 px for the photograph's softness, and the shadow is one blurred offset, not a lit model."],
    source: "Reference 11: embroidery sampler on white, 905 × 1181 px",
    study: { slug: "stitch-sampler", lede: "Two threads, five stitch families, one 22.5 px grid.",
      body: ["A sampler is sewn row by row on a counted grid. Here the grid is 22 to 23 px in every band: satin runs at 54°, a packed bar whose loops sit 6.4 px apart, a lattice couched with a cross at each crossing, chevrons 9.5 px tall in rows 15 px apart, herringbone. The thread is a twisted bundle 8 px across. Its cross section reads as three tones, a lit crown of [67,138,194] that sits off center and follows the 4.8 px twist, a body of [31,104,168], and dark flanks of [26,76,131]. Loose ends splay at the band edges, and each thread drops a soft shadow on the paper.", "The rebuild keeps one thread primitive and lets five generators lay it on the grid. Stitch grid and Thread width set the counted base; Twist moves the crown along the bundle and striates the body; Fiber fuzz wobbles the silhouette by up to 1.4 px and throws hairs 3.5 px past it. One slow field at 90 px hands clusters of stitches to the second thread, and Second thread sets how often. Thread shadow blurs the coverage 2.2 px and offsets it 2 px; the threads themselves are blurred 0.6 px for the photograph's softness. The wordmark is Mindgut copy in spaced caps with two stitched swatches under it."],
      method: "measure grid, width, three tones · band generators on the grid · one cluster field · capsule raster with twist and hairs · shadow · paper",
      points: [{ u: .3, v: .22, d: "KEY", label: "Satin run at 54°: the lit crown rides the 4.8 px twist, dark flanks either side", t: "pull", dir: [1, -1] }, { u: .5, v: .31, d: "KEY", label: "Packed bar: loops 6.4 px apart with a dark groove between, 96 % coverage", t: "grain", dir: [1, 0] }, { u: .45, v: .37, d: "KEY", label: "Lattice couched with a cross at each 22.5 px crossing, crossings jittered up to 3.5 px", t: "pull", dir: [1, 0] }, { u: .4, v: .45, d: "READ", label: "Chevrons: 22.5 px period, 9.5 px amplitude, rows 15 px apart", t: "pull", dir: [1, 0] }, { u: .5, v: .6, d: "READ", label: "Herringbone: rows alternate direction, half the stitches of the open rows skipped by the seed", t: "pull", dir: [1, 0] }, { u: .08, v: .31, d: "READ", label: "Tuft: loose ends splayed from the band edge at 55 % of the stitch width", t: "edge", dir: [-1, 0] }, { u: .4, v: .24, d: "KEY", label: "Cluster of the second thread cut from the 90 px field", t: "pull", dir: [0, 0] }, { u: .25, v: .52, d: "READ", label: "Thread shadow: coverage blurred 2.2 px, offset 2 px, 6 % darker paper", t: "edge", dir: [1, 1] }, { u: .88, v: .1, d: "READ", label: "Needle in steel with a loose loop of thread", t: "edge", dir: [1, -1] }, { u: .5, v: .89, d: "READ", label: "Wordmark in spaced caps, 22 px, and two stitched swatches 16 px wide", t: "pull", dir: [0, 1] }]
    }
  });
})();
