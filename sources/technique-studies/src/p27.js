/* ===== PLATE 27 · ROBOT ON THE LINE =====
   a flat green plate with a 99 px pale grid, orange hand plates at two corners, a blue plate for the striped
   pole and Mindgut's robot, a black key that also prints the pole's drop shadow. Every plate is mottled by
   one grain and sits a px or two off the key. */
(function () {
  const REF = { w: 1080, h: 1350 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c, N = W * H;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 5557 + 3);
    const mkc = () => { const c = mk(W, H); return [c, c.getContext("2d")]; };
    const [oc, og] = mkc(), [kc, kg] = mkc(), [gc, gg] = mkc();
    const kw = P.key * u; kg.strokeStyle = "#000"; kg.fillStyle = "#000"; kg.lineCap = "round"; kg.lineJoin = "round";
    const ids = { orange: "#010000", blue: "#020000", white: "#030000", pale: "#040000", dark: "#050000" };
    /* ---------- pole: from the lower left corner to the upper right, held by two hands ---------- */
    const ang = -P.angle * Math.PI / 180, ex = Math.cos(ang), ey = Math.sin(ang), nx = -ey, ny = ex;
    const cx = W * .5 + P.shift * W, cy = H * .52, L = Math.hypot(W, H) * .84;
    const p0 = [cx - ex * L / 2, cy - ey * L / 2], p1 = [cx + ex * L / 2, cy + ey * L / 2];
    const pw = 38 * u * P.poleW;
    /* drop shadow band on the key plate, offset down-right */
    const so = P.shadow * u; if (so > 0) { og.fillStyle = ids.dark; og.beginPath(); og.moveTo(p0[0] + nx * pw / 2 + so * .7, p0[1] + ny * pw / 2 + so); og.lineTo(p1[0] + nx * pw / 2 + so * .7, p1[1] + ny * pw / 2 + so); og.lineTo(p1[0] - nx * pw / 2 + so * .7, p1[1] - ny * pw / 2 + so); og.lineTo(p0[0] - nx * pw / 2 + so * .7, p0[1] - ny * pw / 2 + so); og.closePath(); og.fill(); }
    /* pole body: blue plate, key outline, cross bars */
    const band = (g, a, b, w) => { g.beginPath(); g.moveTo(a[0] + nx * w / 2, a[1] + ny * w / 2); g.lineTo(b[0] + nx * w / 2, b[1] + ny * w / 2); g.lineTo(b[0] - nx * w / 2, b[1] - ny * w / 2); g.lineTo(a[0] - nx * w / 2, a[1] - ny * w / 2); g.closePath(); };
    const seg = P.segment * u;
    /* a part on the object plate with its key: erase the key under it, fill the plate, stroke the outline */
    const kpart = (path, id, w) => { kg.save(); kg.globalCompositeOperation = "destination-out"; path(kg); kg.fill(); kg.restore(); og.fillStyle = id; path(og); og.fill(); kg.lineWidth = w || kw; kg.strokeStyle = "#000"; path(kg); kg.stroke(); };
    const capsuleP = (A, B, w) => g => { const dx = B[0] - A[0], dy = B[1] - A[1], Lc = Math.hypot(dx, dy) || 1e-6, qx = -dy / Lc * w / 2, qy = dx / Lc * w / 2, a = Math.atan2(dy, dx); g.beginPath(); g.moveTo(A[0] + qx, A[1] + qy); g.lineTo(B[0] + qx, B[1] + qy); g.arc(B[0], B[1], w / 2, a + Math.PI / 2, a - Math.PI / 2, true); g.lineTo(A[0] - qx, A[1] - qy); g.arc(A[0], A[1], w / 2, a - Math.PI / 2, a + Math.PI / 2, true); g.closePath(); };
    const ellP = (x, y, rx, ry, a) => g => { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, 6.2832); };
    const poleAt = t => [p0[0] + ex * t, p0[1] + ey * t];
    /* hands grip the pole near each end: the palm sits behind the pole and runs off the sheet, three fingers wrap over
       the pole toward the viewer, the thumb lies along the near face; nails are the light plate */
    const handGrip = (end, sideN, sizeK) => {
      const S2 = 150 * u * P.hand * sizeK, ax = end > 0 ? ex : -ex, ay = end > 0 ? ey : -ey, tEnd = end > 0 ? L - 40 * u : 40 * u, G = poleAt(tEnd), sx = nx * sideN, sy = ny * sideN;
      const fw = S2 * .3, base = [G[0] + ax * S2 * .2, G[1] + ay * S2 * .2];
      const palm = ellP(base[0] + ax * S2 * .85 + sx * S2 * .42, base[1] + ay * S2 * .85 + sy * S2 * .42, S2 * .95, S2 * .62, Math.atan2(ay, ax) + sideN * .18);
      return { under: () => kpart(palm, ids.orange), over: () => {
        for (let k = 0; k < 3; k++) { const along = -k * fw * 1.02 - fw * .1, ox = base[0] + ax * along, oy = base[1] + ay * along, A = [ox + sx * (pw * .5 + S2 * .22) + ax * fw * .25, oy + sy * (pw * .5 + S2 * .22) + ay * fw * .25], B = [ox - sx * (pw * .5 + fw * .1) - ax * fw * (.18 + .1 * k), oy - sy * (pw * .5 + fw * .1) - ay * fw * (.18 + .1 * k)];
          kpart(capsuleP(A, B, fw * (1 - k * .08)), ids.orange); const tip = [B[0] + sx * fw * .22, B[1] + sy * fw * .22]; kpart(ellP(tip[0], tip[1], fw * .2, fw * .27, Math.atan2(ay, ax)), ids.white, kw * .8); }
        const T0 = [base[0] + ax * fw * .9 + sx * pw * .15, base[1] + ay * fw * .9 + sy * pw * .15], T1 = [T0[0] - ax * S2 * .62 + sx * pw * .05, T0[1] - ay * S2 * .62 + sy * pw * .05];
        kpart(capsuleP(T0, T1, fw * 1.05), ids.orange); kpart(ellP(T1[0] + ax * fw * .2, T1[1] + ay * fw * .2, fw * .27, fw * .2, Math.atan2(ay, ax)), ids.white, kw * .8); } };
    };
    const rh = 520 * u * P.robot, rt = L * (.47 + P.climb * .3);
    const robotOpts = P.robot > 0 ? (() => { const hp = poleAt(rt), at = d => poleAt(rt + d * rh / 400), lean = Math.atan2(ex, -ey) * .55;
      return { x: hp[0] - nx * 4 * u, y: hp[1] - ny * 4 * u, h: rh, rot: lean, flip: 1, head: -.16, look: .55, detail: 1,
        arms: [{ to: at(235), bend: 1 }, { to: at(160), bend: -1, front: true }], legs: [{ to: at(-95), bend: 1 }, { a: .95, b: -1.4, front: true }],
        shadow: so > 0 ? [so * .7, so] : null,
        plates: { body: { g: og, style: ids.blue }, light: { g: og, style: ids.white }, accent: { g: og, style: ids.orange }, shadow: { g: og, style: ids.dark } },
        key: { g: kg, style: "#000", w: kw } }; })() : null;
    if (robotOpts && robotOpts.shadow) mgRobot(Object.assign({}, robotOpts, { pass: "shadow" }));
    const hTop = handGrip(1, 1, 1.6), hBot = handGrip(-1, -1, 1.5);
    hTop.under(); hBot.under();
    /* the pole runs over the palms */
    og.fillStyle = ids.blue; band(og, [p0[0] - ex * 10 * u, p0[1] - ey * 10 * u], [p1[0] + ex * 10 * u, p1[1] + ey * 10 * u], pw); og.fill(); kg.lineWidth = kw; band(kg, [p0[0] - ex * 10 * u, p0[1] - ey * 10 * u], [p1[0] + ex * 10 * u, p1[1] + ey * 10 * u], pw); kg.stroke();
    for (let t = seg; t < L; t += seg) { const x = p0[0] + ex * t, y = p0[1] + ey * t; kg.beginPath(); kg.moveTo(x + nx * pw / 2, y + ny * pw / 2); kg.lineTo(x - nx * pw / 2, y - ny * pw / 2); kg.stroke(); }
    hTop.over(); hBot.over();
    /* Mindgut's robot climbing hand over hand: hands on the pole above the hip (IK), back boot on the pole below,
       front leg kicked out; its drop shadow is the same black plate and offset as the pole's */
    if (robotOpts) {
      mgRobot(Object.assign({}, robotOpts, { pass: "figure" }));
      const nt = Math.round(P.ticks); kg.lineWidth = kw * 1.4; kg.lineCap = "round";
      for (let i = 0; i < nt; i++) { const side = i % 2 ? 1 : -1, t = rt + (rnd() - .3) * rh * .9, base = poleAt(t), off = rh * (.42 + rnd() * .2), x = base[0] + nx * side * off, y = base[1] + ny * side * off, len = (55 + rnd() * 60) * u; kg.beginPath(); kg.moveTo(x - ex * len / 2, y - ey * len / 2); kg.lineTo(x + ex * len / 2, y + ey * len / 2); kg.stroke(); }
    }
    /* grid on its own plate (pale ink) */
    const gp = P.grid * u, gl = 2.2 * u; gg.fillStyle = "#fff"; const g0x = (W * .5) % gp, g0y = (H * .5) % gp; for (let x = g0x; x < W; x += gp) gg.fillRect(x - gl / 2, 0, gl, H); for (let y = g0y; y < H; y += gp) gg.fillRect(0, y - gl / 2, W, gl);
    /* read plates */
    const eb = .6 * u, OB = oc.getContext("2d").getImageData(0, 0, W, H).data, KY = gblur(chan(kg, W, H, 3), W, H, eb), GL = gblur(chan(gg, W, H, 3), W, H, .4 * u);
    /* one grain: hashed, blurred; the green takes it with a light-speck bias */
    const gf = new Float32Array(N); for (let i = 0, y = 0; y < H; y++) for (let x = 0; x < W; x++, i++) gf[i] = hashI(x, y, P.seed + 5) - .5;
    const GR = gblur(gf, W, H, .6 * u);
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, mg = P.misreg * u, gs = P.grain, rough = P.rough;
    const objCol = [null, C.orange, C.blue, C.white, C.pale, C.key], objOff = [null, [Math.round(mg), Math.round(-mg * .5)], [Math.round(-mg * .6), Math.round(mg * .7)], [Math.round(mg), Math.round(-mg * .5)], [0, 0], [Math.round(mg * .3), Math.round(mg * .4)]], kOff = [Math.round(mg * .3), Math.round(mg * .4)];
    const at = (A, x, y, o) => A[clamp(y - o[1], 0, H - 1) * W + clamp(x - o[0], 0, W - 1)];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, j = i * 4, g = GR[i] * 4.6, eg = g * .5 * rough;
      /* green field: the grain with a bias toward light specks */
      const sp = g > 1 ? (g - 1) * 2 : 0, t = 1 + g * .022 * gs + sp * gs * .35;
      let r = C.green[0] * t + sp * 30 * gs, gg2 = C.green[1] * t, b = C.green[2] * t + sp * 24 * gs;
      const gv = GL[i]; if (gv > .02) { const a = clamp(gv * P.gridLight, 0, 1); r += (C.line[0] - r) * a; gg2 += (C.line[1] - gg2) * a; b += (C.line[2] - b) * a; }
      for (let k = 1; k <= 5; k++) { const o = objOff[k]; const xx = clamp(x - o[0], 0, W - 1), yy = clamp(y - o[1], 0, H - 1), jj = (yy * W + xx) * 4; if (OB[jj + 3] > 0 && OB[jj] === k) { const cov = OB[jj + 3] / 255, a = cov >= .998 ? 1 : sstep(.3, .7, cov + eg), col = objCol[k], tt = 1 + g * .06 * gs; if (a > 0) { r += (col[0] * tt - r) * a; gg2 += (col[1] * tt - gg2) * a; b += (col[2] * tt - b) * a; } } }
      const kv = at(KY, x, y, kOff); if (kv > .02) { const a = kv >= .998 ? 1 : sstep(.3, .7, kv + eg * .4); const tt = 1 + g * .05 * gs; r += (C.key[0] * tt - r) * a; gg2 += (C.key[1] * tt - gg2) * a; b += (C.key[2] * tt - b) * a; }
      d[j] = clamp(r, 0, 255); d[j + 1] = clamp(gg2, 0, 255); d[j + 2] = clamp(b, 0, 255); d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p27", no: "27", title: "Robot on the Line", ref: REF, render,
    line: "A flat green plate with a 99 px pale grid and σ 14 speckle, orange hands and a blue pole on their own plates 2 px off the 2.8 px key, and Mindgut's robot clinging to the line.",
    params: [
      { key: "angle", label: "Pole angle", min: 20, max: 80, step: .5, def: 53, unit: "°", group: "Scene", why: "Slope of the pole from the lower left to the upper right. Measured 53°." },
      { key: "shift", label: "Pole position", min: -.3, max: .3, step: .005, def: 0, unit: "of width", group: "Scene", why: "Slides the pole and both hands across the sheet." },
      { key: "poleW", label: "Pole width", min: .4, max: 2.5, step: .01, def: 1, unit: "×", group: "Scene", why: "Width of the striped pole, 38 px at 1." },
      { key: "segment", label: "Segment", min: 8, max: 60, step: .5, def: 22, unit: "px", group: "Scene", why: "Pitch of the black cross bars along the pole." },
      { key: "shadow", label: "Drop shadow", min: 0, max: 80, step: 1, def: 38, unit: "px", group: "Scene", why: "Offset of the black band the pole throws on the ground. 0 removes it." },
      { key: "hand", label: "Hand size", min: .4, max: 2, step: .01, def: 1, unit: "×", group: "Scene", why: "Size of the two orange hands, palm 126 px at 1." },
      { key: "robot", label: "Robot", min: 0, max: 1.5, step: .01, def: 1, unit: "×", group: "Scene", why: "Height of Mindgut's robot, 440 px at 1. 0 removes it." },
      { key: "climb", label: "Climb", min: -1, max: 1, step: .01, def: 0, unit: "", group: "Scene", why: "Where along the pole the robot clings." },
      { key: "ticks", label: "Motion ticks", min: 0, max: 30, step: 1, def: 5, unit: "", group: "Scene", why: "Key strokes 70 to 140 px long beside the robot, along the pole." },
      { key: "grid", label: "Grid pitch", min: 40, max: 200, step: 1, def: 99, unit: "px", group: "Plates", why: "Spacing of the pale grid on the green. Measured 99 px." },
      { key: "gridLight", label: "Grid light", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Plates", why: "How pale the grid prints. The measured line is 145, 243, 192 at its center." },
      { key: "key", label: "Key weight", min: 1, max: 8, step: .1, def: 2.8, unit: "px", group: "Plates", why: "Width of the black line. Measured 2.8 px." },
      { key: "grain", label: "Ink grain", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Plates", why: "Mottle of every ink, light specks on the green. Measured σ 14 on the green." },
      { key: "rough", label: "Edge rough", min: 0, max: 2.5, step: .01, def: .6, unit: "×", group: "Plates", why: "How much the grain breaks each plate edge and the key." },
      { key: "misreg", label: "Misregister", min: 0, max: 10, step: .1, def: 2, unit: "px", group: "Plates", why: "Offset between plates, each in its own direction." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 4, unit: "", group: "Scene", why: "Re-rolls fingers, ticks and the grain." }
    ],
    motion: [{ key: "climb", amp: .6, period: 12, mode: "sine" }, { key: "misreg", amp: 1.2, period: 7, mode: "sine" }],
    live: { x: { key: "angle", min: 20, max: 80 }, y: { key: "climb", min: -1, max: 1 } },
    presets: [{ name: "Clean pass", set: { grain: .2, rough: .2, misreg: 0 } }, { name: "Bad feed", set: { misreg: 7, rough: 1.6 } }, { name: "Thick line", set: { key: 6, segment: 34 } }, { name: "Tight grid", set: { grid: 50, gridLight: 1.6 } }],
    palettes: [
      { id: "measured", name: "Green ground", note: "measured", c: { green: [5, 151, 84], line: [145, 243, 192], orange: [253, 177, 66], blue: [135, 215, 232], white: [243, 243, 239], pale: [200, 240, 220], key: [24, 18, 10] }, sw: ["#059754", "#fdb142", "#87d7e8", "#18120a"] },
      { id: "blue", name: "Blue ground", c: { green: [30, 70, 180], line: [150, 190, 255], orange: [255, 200, 60], blue: [255, 140, 150], white: [246, 246, 250], pale: [200, 220, 255], key: [10, 12, 30] }, sw: ["#1e46b4", "#ffc83c", "#ff8c96", "#0a0c1e"] },
      { id: "red", name: "Red ground", c: { green: [200, 40, 50], line: [255, 170, 170], orange: [255, 220, 90], blue: [160, 220, 255], white: [250, 246, 246], pale: [255, 210, 210], key: [30, 10, 10] }, sw: ["#c82832", "#ffdc5a", "#a0dcff", "#1e0a0a"] },
      { id: "night", name: "Night", c: { green: [26, 28, 40], line: [80, 86, 110], orange: [255, 150, 60], blue: [120, 200, 230], white: [240, 240, 246], pale: [120, 130, 160], key: [236, 240, 244] }, sw: ["#1a1c28", "#ff963c", "#78c8e6", "#ecf0f4"] },
      { id: "violet", name: "Violet ground", c: { green: [110, 60, 190], line: [200, 170, 255], orange: [220, 255, 90], blue: [255, 180, 120], white: [250, 246, 255], pale: [220, 200, 255], key: [24, 10, 40] }, sw: ["#6e3cbe", "#dcff5a", "#ffb478", "#180a28"] },
      { id: "gray", name: "Graphite ground", c: { green: [120, 124, 130], line: [200, 204, 210], orange: [255, 90, 60], blue: [220, 220, 224], white: [250, 250, 250], pale: [200, 204, 210], key: [14, 14, 16] }, sw: ["#787c82", "#ff5a3c", "#dcdce0", "#0e0e10"] }
    ],
    bench: { palette: "measured", params: {}, note: "Patches sit on the same ink in both: open green with grid lines, a pole segment with its shadow, an orange hand edge, a dense key patch, the whole sheet.", items: [
      { name: "green grid", ref: [60, 300, 160, 160], out: [60, 300, 160, 160], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 8, inks: [[5, 151, 84]], inkNames: ["green"] },
      { name: "pole and shadow", ref: [580, 300, 160, 160], out: [672, 264, 160, 160], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[5, 151, 84], [135, 215, 232], [24, 18, 10]], inkNames: ["green", "blue", "key"] },
      { name: "hand edge", ref: [860, 100, 160, 160], out: [72, 1128, 160, 160], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[5, 151, 84], [253, 177, 66], [24, 18, 10]], inkNames: ["green", "orange", "key"] },
      { name: "robot key", ref: [380, 420, 200, 200], out: [408, 648, 200, 200], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[5, 151, 84], [135, 215, 232], [24, 18, 10]], inkNames: ["green", "blue", "key"] },
      { name: "whole plate", ref: [0, 0, 1080, 1350], out: [0, 0, 1080, 1350], m: ["hist", "ink", "share"], inks: [[5, 151, 84], [25, 22, 13], [134, 216, 223], [251, 177, 67], [245, 232, 213]], inkNames: ["green", "key", "blue", "orange", "white"] }
    ] },
    passes: ["key plate: the pole outline and cross bars, hand outlines with the insides cut, the robot's lines, motion ticks", "object plate by id: the pole's drop shadow in key black first, then pole and robot in blue, hands in orange, nails and a dial in white", "grid plate: 1.6 px lines on a 99 px pitch", "one hashed grain blurred 0.6 px; the green takes it with a light-speck bias", "per pixel: green with grid, then each plate at its own offset with its edge broken by the grain, the key last"],
    measured: { green: [5, 151, 84], green_sigma_rgb: [21.4, 13.5, 15.8], green_hp_sigma: 14, grid_pitch_px: 99, grid_line: "center 145, 243, 192 falling to 56, 176, 117 one px out", orange: [253, 177, 66], blue: [135, 215, 232], key: [24, 18, 10], key_share: .075, key_halfwidth_px: { median: 1.41, p90: 5.66 }, pole_width_px: 38, cross_bar_pitch_px: 22, shadow_offset_px: 38, kmeans6_shares: { green: .776, key: .078, blue: .062, orange: .053, mid_green: .021, white: .01 }, rejected: "a neutral grain on the green: its speckle is skewed toward light specks, so the grain is applied with a positive-tail bias" },
    limits: ["Benchmark 88.8 % mean. The robot-key and pole patches score lowest (histograms 55 % and 61 %): the reference patches hold the tin robot's panel of dials and the pole's rope texture, the rebuild's hold Mindgut's plainer robot and a flat pole with cross bars, so the key share differs by position.", "The green-grid patch misses on autocorrelation (86 %): the reference's grid lines are 1 to 2 px with a soft halo and the rebuild's are 2.2 px blurred 0.4 px.", "The reference's tin robot is not redrawn; Mindgut's robot clings to the pole in its place, drawn with the same key.", "The hands and pole are generated shapes; patches compare the same inks, not the same drawing."],
    source: "Reference 27: flat-ink illustration on green, 1080 × 1350 px",
    study: { slug: "robot-on-the-line", lede: "Four flat plates, a pale grid, and a line held tight between two hands.",
      body: ["The ground is one flat green, 5, 151, 84, printed with a speckle of σ 14 that leans toward light specks. A pale grid of 1.6 px lines sits on it every 99 px. The pole, the hands and the robot are flat plates of blue and orange under a 2.8 px black key, and the key also prints the pole's drop shadow, a black band 38 px to the lower right. Each plate lands a px or two off the key.", "The rebuild draws the pole from one angle and hangs everything on it: the shadow band, the cross bars every 22 px, a hand at each end built from a palm and three or four finger capsules, and Mindgut's robot clinging where Climb puts it. One grain mottles every ink and breaks every edge by Edge rough; Misregister slides each plate its own way; Grid pitch and Grid light set the grid."],
      method: "measure green, grid, inks, key, shadow offset · key and plates from one pole angle · hands from capsules · one grain · misregister",
      points: [{ u: .12, v: .3, d: "KEY", label: "Open green: σ 14 speckle leaning to light specks, grid lines every 99 px", t: "grain", dir: [0, 0] }, { u: .6, v: .32, d: "KEY", label: "Pole: blue plate, cross bars every 22 px, the black shadow band 38 px below", t: "pull", dir: [1, -1] }, { u: .88, v: .12, d: "KEY", label: "Hand: orange plate 2 px off its key, nails in white", t: "edge", dir: [0, 0] }, { u: .45, v: .5, d: "KEY", label: "Mindgut's robot clinging to the line, blue plate and key", t: "pull", dir: [0, 0] }, { u: .3, v: .45, d: "READ", label: "Motion ticks: key only", t: "pull", dir: [1, -1] }, { u: .2, v: .85, d: "READ", label: "Lower hand holding the pole's end", t: "edge", dir: [0, 0] }, { u: .5, v: .1, d: "READ", label: "Grid line: 1.6 px, pale 145, 243, 192 at its center", t: "edge", dir: [1, 0] }, { u: .7, v: .7, d: "READ", label: "Shadow band edge: the key's edge broken by the grain", t: "edge", dir: [1, 0] }, { u: .4, v: .25, d: "READ", label: "Misregister: the blue 2 px off the key on the pole", t: "edge", dir: [1, 0] }, { u: .8, v: .5, d: "READ", label: "Green between grid lines: no gradient, grain only", t: "grain", dir: [0, 0] }]
    }
  });
})();
