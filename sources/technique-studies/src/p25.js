/* ===== PLATE 25 · RISO ROAD =====
   flat ink plates (road gray, wall pink, stripe yellow, object inks) each with its own feed offset, every
   plate mottled by one horizontally streaked grain and broken at the edge by it, a 3 px black key drawn
   last and slightly off. The scene: a road taken at an angle, a lightning stripe, two Mindgut robots
   racing with smoke behind them. */
(function () {
  const REF = { w: 1440, h: 1920 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c, N = W * H;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 4409 + 13), nA = vnoise(P.seed + 7);
    /* ---------- geometry: road direction, wall line, stripe polyline ---------- */
    const ang = -P.angle * Math.PI / 180, ex = Math.cos(ang), ey = Math.sin(ang), nx = -ey, ny = ex; /* ex,ey along the road (up-right), nx,ny across */
    const wallY = H * P.wall; /* the wall edge passes through (0, wallY) along the road direction */
    const across = (x, y) => (x - 0) * nx + (y - wallY) * ny; /* signed distance from the wall line, positive toward the road */
    const along = (x, y) => x * ex + (y - wallY) * ey;
    /* canvases */
    const mkc = () => { const c = mk(W, H); return [c, c.getContext("2d")]; };
    const [rc, rg] = mkc(), [wc, wg] = mkc(), [sc, sg] = mkc(), [oc, og] = mkc(), [kc, kg] = mkc();
    const big = Math.max(W, H) * 3;
    const bandPath = (g, d0, d1) => { g.beginPath(); const p = (a, d) => [a * ex + d * nx, wallY + a * ey + d * ny]; const A = p(-big, d0), B = p(big, d0), Cc = p(big, d1), D = p(-big, d1); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.lineTo(Cc[0], Cc[1]); g.lineTo(D[0], D[1]); g.closePath(); };
    /* wall: everything above the wall line; curb: a strip just below it; road: the rest */
    wg.fillStyle = "#fff"; bandPath(wg, -big, 0); wg.fill();
    rg.fillStyle = "#fff"; bandPath(rg, 0, big); rg.fill();
    const curbW = 40 * u * P.curb; kg.fillStyle = "#000"; kg.strokeStyle = "#000"; kg.lineCap = "round"; kg.lineJoin = "round";
    const kw = P.key * u;
    kg.lineWidth = kw; bandPath(kg, 0, 0.0001); kg.stroke(); if (curbW > 0) { bandPath(kg, curbW, curbW + .0001); kg.stroke(); }
    /* lightning stripe: a zigzag polyline along the road, offset d from the wall, drawn as a band with pointed ends */
    const stripe = (d0, segs, amp, wid, fromA, toA) => { const pts = []; for (let i = 0; i <= segs; i++) { const a = lerp(fromA, toA, i / segs), d = d0 + (i % 2 ? amp : -amp) * (i === 0 || i === segs ? 0 : 1); pts.push([a, d]); } const P2 = (a, d) => [a * ex + d * nx, wallY + a * ey + d * ny]; const path = g => { g.beginPath(); pts.forEach(([a, d], i) => { const q = P2(a, d - wid / 2); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); for (let i = pts.length - 1; i >= 0; i--) { const [a, d] = pts[i]; const q = P2(a + (i === 0 ? -wid * 1.4 : i === pts.length - 1 ? wid * 1.4 : 0), d + wid / 2); g.lineTo(q[0], q[1]); } g.closePath(); }; path(sg); sg.fillStyle = "#fff"; sg.fill(); path(kg); kg.lineWidth = kw; kg.stroke(); };
    const roadD = (y) => across(0, y);
    const laneD = curbW + (H * .62 - wallY) * ny * .5 + 160 * u * P.lane; /* center lane distance from the wall */
    stripe(laneD, 5, 120 * u, 70 * u * P.stripeW, -W * .25, W * 1.5);
    if (P.stripes > 1) stripe(laneD + 520 * u, 4, 100 * u, 60 * u * P.stripeW, -W * .1, W * 1.4);
    /* ---------- objects: smoke clouds, two robots, stars, motion ticks ---------- */
    const ids = { green: "#010000", blue: "#020000", orange: "#030000", white: "#040000", dark: "#050000", gray: "#060000" };
    const cloud = (cx, cy, R, n) => { if (R <= kw) return; const cs = []; for (let i = 0; i < n; i++) { const a = rnd() * 6.28, r = R * (.35 + rnd() * .35); cs.push([cx + Math.cos(a) * R * .75 * rnd() + (i / n - .5) * R * 2.2 * ex, cy + Math.sin(a) * R * .35 + (i / n - .5) * R * 2.2 * ey * .6, r]); } kg.lineWidth = kw; for (const [x, y, r] of cs) { kg.beginPath(); kg.arc(x, y, r, 0, 6.3); kg.stroke(); } og.fillStyle = ids.white; for (const [x, y, r] of cs) { og.beginPath(); og.arc(x, y, r, 0, 6.3); og.fill(); kg.save(); kg.globalCompositeOperation = "destination-out"; kg.beginPath(); kg.arc(x, y, Math.max(0, r - kw * .2), 0, 6.3); kg.fill(); kg.restore(); } for (let i = 0; i < 3; i++) { const [x, y, r] = cs[(i * 2) % cs.length]; kg.beginPath(); kg.arc(x + r * .2, y + r * .1, r * .45, 2.6, 4.2); kg.stroke(); } };
    /* Mindgut's robot, running: the shared construction in the run pose, leaning 0.2 rad into the stride */
    const robot = (x, y, h, id, lean, acc) => { const S = h / 9.6, fl = ex >= 0 ? 1 : -1;
      mgRobot(Object.assign({}, MG_POSE.dash, { x: x, y: y - 2.0 * S, h, rot: .42 * fl + lean * .5, flip: fl, detail: 1,
        plates: { body: { g: og, style: id }, light: { g: og, style: ids.white }, accent: { g: og, style: acc || ids.orange } }, key: { g: kg, style: "#000", w: kw } })); };
    const star = (x, y, r, id) => { const n = 8; og.fillStyle = id; og.beginPath(); kg.beginPath(); for (let k = 0; k < n * 2; k++) { const a = k / (n * 2) * 6.283 + rnd() * .1, rr = k % 2 ? r * .38 : r * (.8 + rnd() * .3); const X = x + Math.cos(a) * rr, Y = y + Math.sin(a) * rr; k ? (og.lineTo(X, Y), kg.lineTo(X, Y)) : (og.moveTo(X, Y), kg.moveTo(X, Y)); } og.closePath(); kg.closePath(); og.fill(); kg.lineWidth = kw * .85; kg.stroke(); };
    const ticks = (x, y, n, len) => { kg.lineWidth = kw; for (let i = 0; i < n; i++) { const ox = (rnd() - .5) * 60 * u, oy = i * 16 * u - n * 8 * u; kg.beginPath(); kg.moveTo(x + ox - ex * len, y + oy - ey * len); kg.lineTo(x + ox - ex * len * (.3 + rnd() * .3), y + oy - ey * len * (.3 + rnd() * .3)); kg.stroke(); } };
    /* two racers on the road, back one first */
    const rh = 500 * u * P.robotSize;
    const racers = [{ t: .64, d: laneD - 40 * u, id: ids.green, acc: ids.orange, lean: -.1 }, { t: .4, d: laneD + 470 * u, id: ids.blue, acc: ids.orange, lean: -.1 }, { t: .16, d: laneD + 1020 * u, id: ids.orange, acc: ids.blue, lean: -.1 }];
    for (const r of racers) { const a = -W * .1 + W * 1.1 * r.t, x = a * ex + r.d * nx, y = wallY + a * ey + r.d * ny; if (y < -rh || y > H + rh) continue; cloud(x - ex * rh * .55 - 110 * u, y - ey * rh * .55 - rh * .25, rh * .36 * P.smoke, 7); robot(x, y, rh, r.id, r.lean, r.acc); ticks(x - rh * .25, y + rh * .1, 3, 70 * u); const ns = Math.round(P.stars); for (let k = 0; k < ns; k++) { const a = rnd() * 6.28, rr = rh * (.55 + rnd() * .35); star(x + Math.cos(a) * rr * 1.1, y + Math.sin(a) * rr * .8, (12 + rnd() * 14) * u, k % 2 ? ids.orange : ids.white); } }
    /* read plates */
    const eb = .6 * u, RD = gblur(chan(rg, W, H, 3), W, H, eb), WL = gblur(chan(wg, W, H, 3), W, H, eb), ST = gblur(chan(sg, W, H, 3), W, H, eb), OB = oc.getContext("2d").getImageData(0, 0, W, H).data, KY = gblur(chan(kg, W, H, 3), W, H, eb);
    /* ---------- one grain: hashed, blurred, smeared along the feed direction ---------- */
    const gf = new Float32Array(N); for (let i = 0, y = 0; y < H; y++) for (let x = 0; x < W; x++, i++) gf[i] = hashI(x, y, P.seed + 5) - .5;
    const g1 = gblur(gf, W, H, .6 * u), GR = new Float32Array(N), sm = Math.max(1, Math.round(P.streak * u)), fm = Math.min(1, P.streak);
    for (let y = 0; y < H; y++) { const o = y * W; let acc = 0; for (let i = -sm; i <= sm; i++) acc += g1[o + clamp(i, 0, W - 1)]; for (let x = 0; x < W; x++) { GR[o + x] = lerp(g1[o + x], acc / (2 * sm + 1), fm); acc += g1[o + Math.min(W - 1, x + sm + 1)] - g1[o + Math.max(0, x - sm)]; } }
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, mg = P.misreg * u, gs = P.grain, rough = P.rough;
    const off = [[0, 0], [Math.round(mg), Math.round(-mg * .4)], [Math.round(-mg * .7), Math.round(mg * .6)], [Math.round(mg * .5), Math.round(mg)], [Math.round(-mg), Math.round(-mg * .3)]];
    const objCol = [null, C.green, C.blue, C.orange, C.smoke, C.dark, C.gray], objOff = [null, off[3], off[4], off[1], off[2], off[0], off[2]];
    const kOff = [Math.round(mg * .3), Math.round(-mg * .5)];
    const at = (A, x, y, o) => A[clamp(y - o[1], 0, H - 1) * W + clamp(x - o[0], 0, W - 1)];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, j = i * 4, g = GR[i] * 4.6, eg = g * .5 * rough;
      let r = C.paper[0], gg = C.paper[1], b = C.paper[2];
      const lay = (col, cov, amp) => { if (cov <= .002) return; const a = cov >= .998 ? 1 : sstep(.3, .7, cov + eg); if (a <= 0) return; const t = 1 + g * gs * amp; r += (col[0] * t - r) * a; gg += (col[1] * t - gg) * a; b += (col[2] * t - b) * a; };
      lay(C.road, at(RD, x, y, off[1]), .05); lay(C.wall, at(WL, x, y, off[2]), .066);
      /* curb: a lighter strip of the road plate just below the wall */
      const dd = across(x, y); if (curbW > 0 && dd > 0 && dd < curbW) { const t = 1 + g * gs * .05; r += (C.curb[0] * t - r) * .9; gg += (C.curb[1] * t - gg) * .9; b += (C.curb[2] * t - b) * .9; }
      lay(C.yellow, at(ST, x, y, off[3]), .07);
      /* objects by id, each plate with its own offset */
      for (let k = 1; k <= 6; k++) { const o = objOff[k]; const xx = clamp(x - o[0], 0, W - 1), yy = clamp(y - o[1], 0, H - 1), jj = (yy * W + xx) * 4; if (OB[jj + 3] > 0 && OB[jj] === k) lay(objCol[k], OB[jj + 3] / 255, k === 4 ? .04 : .09); }
      const kv = at(KY, x, y, kOff); if (kv > .02) { const a = sstep(.3, .7, kv + eg * .4); r += (C.key[0] - r) * a; gg += (C.key[1] - gg) * a; b += (C.key[2] - b) * a; }
      d[j] = clamp(r, 0, 255); d[j + 1] = clamp(gg, 0, 255); d[j + 2] = clamp(b, 0, 255); d[j + 3] = 255;
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p25", no: "25", title: "Riso Road", ref: REF, render,
    line: "Flat ink plates, each fed through 2 px off the last, every one mottled by a grain smeared 1 px along the feed, under a 3 px black key: a road at 32°, a lightning stripe, two Mindgut robots racing.",
    params: [
      { key: "angle", label: "Road angle", min: 10, max: 55, step: .5, def: 32, unit: "°", group: "Scene", why: "Slope of the road and the wall across the sheet. Measured 32°." },
      { key: "wall", label: "Wall line", min: .05, max: .6, step: .005, def: .3, unit: "of height", group: "Scene", why: "Where the pink wall meets the road at the left edge." },
      { key: "curb", label: "Curb", min: 0, max: 2.5, step: .01, def: 1, unit: "×", group: "Scene", why: "Width of the lighter strip along the wall, 40 px at 1. 0 removes it." },
      { key: "lane", label: "Stripe offset", min: -2, max: 3, step: .01, def: 1, unit: "×", group: "Scene", why: "Distance of the lightning stripe from the wall." },
      { key: "stripes", label: "Stripes", min: 1, max: 2, step: 1, def: 2, unit: "", group: "Scene", why: "One or two lightning stripes along the road." },
      { key: "stripeW", label: "Stripe width", min: .3, max: 2.5, step: .01, def: 1, unit: "×", group: "Scene", why: "Width of the yellow band, 70 px at 1." },
      { key: "robotSize", label: "Robot size", min: .4, max: 1.6, step: .01, def: 1, unit: "×", group: "Scene", why: "Height of the two racers, 380 px at 1." },
      { key: "smoke", label: "Smoke", min: 0, max: 2.2, step: .01, def: 1, unit: "×", group: "Scene", why: "Size of the puff clouds behind each racer. 0 removes them." },
      { key: "stars", label: "Star marks", min: 0, max: 8, step: 1, def: 3, unit: "", group: "Scene", why: "Sparkle marks thrown around each racer." },
      { key: "key", label: "Key weight", min: 1, max: 8, step: .1, def: 3, unit: "px", group: "Plates", why: "Width of the black line. Measured 2.8 px." },
      { key: "grain", label: "Ink grain", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Plates", why: "Mottle of every ink. Measured σ 6 on the gray, 8 on the pink." },
      { key: "streak", label: "Feed streak", min: 0, max: 8, step: .1, def: .4, unit: "px", group: "Plates", why: "How far the grain is smeared along the drum feed. The gray's autocorrelation runs 0.60 along x and 0.42 along y." },
      { key: "rough", label: "Edge rough", min: 0, max: 2.5, step: .01, def: .6, unit: "×", group: "Plates", why: "How much the grain breaks every plate edge and the key." },
      { key: "misreg", label: "Misregister", min: 0, max: 10, step: .1, def: 2.5, unit: "px", group: "Plates", why: "Offset between plates, each in its own direction, as the paper shifts between passes." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 9, unit: "", group: "Scene", why: "Re-rolls clouds, stars and the grain." }
    ],
    motion: [{ key: "misreg", amp: 1.5, period: 8, mode: "sine" }, { key: "lane", amp: .6, period: 13, mode: "sine" }],
    live: { x: { key: "angle", min: 10, max: 55 }, y: { key: "misreg", min: 0, max: 10 } },
    presets: [{ name: "Clean pass", set: { grain: .2, rough: .2, misreg: 0 } }, { name: "Bad feed", set: { misreg: 8, rough: 1.8, streak: 6 } }, { name: "Heavy key", set: { key: 6, stars: 6 } }, { name: "Flat road", set: { angle: 14, stripes: 1, smoke: 1.8 } }],
    palettes: [
      { id: "measured", name: "Riso set", note: "measured", c: { paper: [252, 248, 241], road: [210, 211, 203], curb: [222, 223, 215], wall: [247, 173, 226], yellow: [253, 250, 163], green: [18, 135, 70], blue: [129, 186, 239], orange: [240, 110, 40], smoke: [252, 248, 241], dark: [60, 60, 60], gray: [180, 180, 176], key: [8, 11, 10] }, sw: ["#d2d3cb", "#f7ade2", "#fdfaa3", "#128746"] },
      { id: "cool", name: "Blue night", c: { paper: [244, 246, 250], road: [150, 160, 180], curb: [170, 180, 198], wall: [60, 70, 110], yellow: [255, 230, 90], green: [255, 90, 80], blue: [120, 220, 200], orange: [255, 160, 60], smoke: [244, 246, 250], dark: [40, 44, 60], gray: [170, 176, 190], key: [10, 12, 24] }, sw: ["#96a0b4", "#3c466e", "#ffe65a", "#ff5a50"] },
      { id: "fluor", name: "Fluorescent", c: { paper: [250, 250, 250], road: [200, 205, 210], curb: [220, 224, 228], wall: [255, 90, 160], yellow: [220, 255, 60], green: [40, 60, 200], blue: [255, 140, 40], orange: [255, 60, 60], smoke: [250, 250, 250], dark: [50, 50, 60], gray: [180, 184, 190], key: [20, 20, 30] }, sw: ["#c8cdd2", "#ff5aa0", "#dcff3c", "#283cc8"] },
      { id: "teal", name: "Teal and rust", c: { paper: [246, 247, 247], road: [190, 200, 200], curb: [210, 218, 218], wall: [40, 150, 150], yellow: [250, 220, 120], green: [200, 80, 40], blue: [90, 120, 200], orange: [250, 170, 60], smoke: [246, 247, 247], dark: [50, 56, 56], gray: [170, 178, 178], key: [14, 20, 20] }, sw: ["#bec8c8", "#289696", "#fadc78", "#c85028"] },
      { id: "mono", name: "Black and red", c: { paper: [248, 248, 248], road: [205, 205, 205], curb: [224, 224, 224], wall: [120, 120, 120], yellow: [235, 50, 50], green: [60, 60, 60], blue: [170, 170, 170], orange: [235, 50, 50], smoke: [248, 248, 248], dark: [40, 40, 40], gray: [180, 180, 180], key: [10, 10, 10] }, sw: ["#cdcdcd", "#787878", "#eb3232", "#3c3c3c"] },
      { id: "violet", name: "Violet and lime", c: { paper: [247, 246, 250], road: [196, 190, 210], curb: [214, 208, 226], wall: [120, 70, 200], yellow: [200, 240, 80], green: [40, 160, 110], blue: [250, 140, 170], orange: [255, 200, 60], smoke: [247, 246, 250], dark: [50, 40, 70], gray: [176, 170, 190], key: [20, 14, 36] }, sw: ["#c4bed2", "#7846c8", "#c8f050", "#28a06e"] }
    ],
    bench: { palette: "measured", params: {}, note: "The scene is generated; render-side windows were placed with search.py after the 2026-11-12 robot redraw. Patches sit on the same ink in both: open road gray, the pink wall, a stripe edge with its key, a smoke cloud edge, the whole sheet for ink shares.", items: [
      { name: "road gray", ref: [840, 1680, 200, 200], out: [1080, 1368, 200, 200], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 8, inks: [[210, 211, 203]], inkNames: ["gray"] },
      { name: "pink wall", ref: [100, 100, 200, 200], out: [100, 100, 200, 200], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 8, inks: [[247, 173, 226]], inkNames: ["pink"] },
      { name: "stripe edge", ref: [1150, 560, 200, 200], out: [768, 360, 200, 200], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[210, 211, 203], [253, 250, 163], [8, 11, 10]], inkNames: ["gray", "yellow", "key"] },
      { name: "smoke edge", ref: [1100, 250, 200, 200], out: [552, 1608, 200, 200], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[210, 211, 203], [252, 248, 241], [8, 11, 10]], inkNames: ["gray", "white", "key"] },
      { name: "whole plate", ref: [0, 0, 1440, 1920], out: [0, 0, 1440, 1920], m: ["hist", "ink", "share"], inks: [[210, 211, 203], [8, 11, 10], [129, 186, 239], [251, 177, 230], [252, 248, 241], [253, 250, 163], [18, 135, 70]], inkNames: ["gray", "key", "blue", "pink", "white", "yellow", "green"] }
    ] },
    passes: ["geometry: a road direction at 32°, the wall line, the curb strip, the lightning stripes as zigzag bands with pointed ends", "object plate by id: puff clouds (circles stroked on the key, filled and cut from the key so only the outer scallop stays), two robots, star marks, motion ticks", "one grain: a hashed field blurred 0.45 px and smeared 1 px along the feed", "per pixel: paper, road plate, wall plate, curb, stripe plate, object inks, each sampled at its own offset, each edge broken by the grain, each tone mottled by it; the key last at its own offset"],
    measured: { paper: [252, 248, 241], road: [210, 211, 203], road_sigma: 6.05, wall_pink: [247, 173, 226], pink_sigma_rgb: [6.9, 8.9, 8.4], pink_hp_sigma: 7.7, curb: [214, 215, 207], yellow: [253, 250, 163], green: [18, 135, 70], blue: [129, 186, 239], key: [8, 11, 10], key_share: .091, key_halfwidth_px: { median: 1.41, p90: 2.24 }, grain_autocorr: "clean gray plate: x 0.60, 0.16; y 0.42, 0.04 (slightly longer along x)", kmeans8_shares: { gray: .507, key: .091, blue: .076, pink: .076, white: .068, yellow: .067, green: .066, pink_edge: .049 }, misregistration_px: "2 to 3, read on the stripe edge where paper shows between key and yellow", rejected: "a strongly streaked grain: the first patch measured 0.89 along x, but it held a stripe edge; the clean gray reads 0.60 against 0.42" },
    limits: ["Benchmark 90.8 % mean. The stripe-edge patch scores lowest (histogram 56 %, contrast 55 %): the reference patch holds a stripe edge, a star and a corner of the dark green car, so its key class is 15 % and reads as the car's green; the rebuild's patch holds one stripe edge with 3 % key.", "Whole-plate gray coverage (75 %) is higher than the reference because two robots cover less road than two cars.", "The reference's two cars are not redrawn; two Mindgut robots race in their place with the same key, smoke and star marks."],
    source: "Reference 25: risograph-style illustration, 1440 × 1920 px",
    study: { slug: "riso-road", lede: "Flat inks fed one pass at a time, each a little off the last.",
      body: ["A risograph prints one ink per pass through a drum. Each plate is flat, but the drum's screen mottles it: the gray here carries σ 6 of grain, the pink σ 8, and the grain runs a little longer along the feed, autocorrelation 0.60 at one px along it against 0.42 across. Each pass lands a little off the last, 2 to 3 px here, so paper shows between the black key and the yellow at a stripe edge. The key is a 2.8 px line with the same grain breaking its edge.", "The rebuild keeps one road direction and builds every plate from it: the wall line, the curb, the lightning stripes as zigzag bands. The racers are Mindgut robots on an object plate keyed by ink. One hashed grain, blurred 0.45 px and smeared along the feed by Feed streak, mottles every ink by Ink grain and breaks every edge by Edge rough. Misregister slides each plate in its own direction. Key weight sets the line drawn last."],
      method: "measure inks, grain, streak, offsets · plates from one road direction · object plate by id · one grain mottles and breaks · key last",
      points: [{ u: .15, v: .88, d: "KEY", label: "Open road: σ 6 grain smeared 1 px along the feed", t: "grain", dir: [1, 0] }, { u: .15, v: .1, d: "READ", label: "Pink wall: the same grain at σ 8", t: "grain", dir: [1, 0] }, { u: .85, v: .35, d: "KEY", label: "Stripe edge: paper shows between key and yellow, the plates 2.5 px apart", t: "edge", dir: [1, -1] }, { u: .3, v: .34, d: "READ", label: "Curb: a lighter strip of the road plate, 40 px, under the wall line", t: "edge", dir: [0, 1] }, { u: .8, v: .18, d: "KEY", label: "Smoke: paper left bare, scalloped by a key that survives only on the outer edge", t: "edge", dir: [1, 0] }, { u: .6, v: .45, d: "KEY", label: "Green racer: a flat plate under the key, 3 px off", t: "pull", dir: [0, 0] }, { u: .35, v: .72, d: "READ", label: "Blue racer: the body ink mottled by the same grain", t: "grain", dir: [0, 0] }, { u: .7, v: .5, d: "READ", label: "Star mark: a tiny plate of its own with the key around it", t: "edge", dir: [0, 0] }, { u: .25, v: .6, d: "READ", label: "Motion ticks: key only, no plate under them", t: "pull", dir: [1, 0] }, { u: .5, v: .8, d: "READ", label: "Lightning stripe: a zigzag band with pointed ends, 70 px wide", t: "pull", dir: [1, -1] }]
    }
  });
})();
