/* ===== PLATE 04 · HIGHLIGHT BAR =====
   type knocked out of bars that hug it, printed on a woven black; a paper panel carrying a generated
   burst; a block strip at the foot. One twill (3 px columns stepping 1.2 px per row) runs under every ink. */
(function () {
  const REF = { w: 592, h: 592 };
  function burst(g, cx, cy, R, P, rnd, ink, paper, u) {
    g.fillStyle = ink; g.strokeStyle = ink;
    const ray = () => { const side = rnd() < .5 ? 0 : Math.PI, th = side + (rnd() < .5 ? -1 : 1) * Math.pow(rnd(), 1.25) * P.spread, r0 = R * (1.03 + rnd() * rnd() * .9), r1 = R * (1.9 + rnd() * 2.7) * P.reach, w0 = (.4 + rnd() * 1.3) * u, w1 = w0 * (1 + rnd() * rnd() * 5.5), c = Math.cos(th), sn = Math.sin(th) * .78, nx = -sn, ny = c; const seg = (a, b, wa, wb) => { g.beginPath(); g.moveTo(cx + c * a + nx * wa, cy + sn * a + ny * wa); g.lineTo(cx + c * b + nx * wb, cy + sn * b + ny * wb); g.lineTo(cx + c * b - nx * wb, cy + sn * b - ny * wb); g.lineTo(cx + c * a - nx * wa, cy + sn * a - ny * wa); g.closePath(); g.fill(); };
      if (rnd() < .22) { const n = 3 + (rnd() * 4 | 0); for (let i = 0; i < n; i++) { const a = r0 + (r1 - r0) * (i / n), b = a + (r1 - r0) / n * (.35 + rnd() * .4); seg(a, b, w0, w0); } } else seg(r0, r1, w0, w1); };
    for (let i = 0, n = Math.round(P.rays); i < n; i++) ray();
    for (let i = 0, n = Math.round(P.fragments); i < n; i++) { const th = (rnd() < .5 ? 0 : Math.PI) + (rnd() - .5) * 2 * P.spread * 1.25, r = R * (1.5 + rnd() * 2) * P.reach, x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r * .78, sz = (5 + rnd() * 13) * u, k = 5 + (rnd() * 3 | 0), a0 = rnd() * 6.28; g.beginPath(); for (let j = 0; j < k; j++) { const a = a0 + j / k * 6.283, rr = sz * (.55 + rnd() * .6), px = Math.cos(a) * rr * 1.7, py = Math.sin(a) * rr * .8; const X = x + px * Math.cos(th) - py * Math.sin(th), Y = y + px * Math.sin(th) + py * Math.cos(th); j ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.closePath(); g.fill(); }
    g.beginPath(); g.arc(cx, cy, R, 0, 6.3); g.fill();
    if (P.crack > 0) { const a = -.5 + (rnd() - .5) * .5, c = Math.cos(a), sn = Math.sin(a); g.strokeStyle = paper; g.lineWidth = R * .3 * P.crack; g.lineJoin = "miter"; g.miterLimit = 8; g.beginPath(); for (let i = -4; i <= 4; i++) { const t = (i + (rnd() - .5) * .5) / 4 * R * 1.3, o = (i % 2 ? 1 : -1) * R * (.04 + rnd() * .34); const X = cx + c * t - sn * o, Y = cy + sn * t + c * o; i === -6 ? g.moveTo(X, Y) : g.lineTo(X, Y); } g.stroke(); }
  }
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 4931 + 9), g = cv.getContext("2d");
    g.fillStyle = css(C.ground); g.fillRect(0, 0, W, H);
    /* strip, then panel */
    const py0 = H * (1 - P.panel) - 12 * u, py1 = H - 12 * u, nb = Math.round(P.blocks), bw = W / nb;
    for (let i = 0; i < nb; i++) if (i % 2) { g.fillStyle = css(C.accent); g.fillRect(i * bw - bw * .46, py1 - 2 * u, bw, 14 * u); }
    g.fillStyle = css(C.accent); g.fillRect(0, py0 + (py1 - py0) * .55, 8 * u, (py1 - py0) * .15); g.fillRect(W - 8 * u, py0 + (py1 - py0) * .55, 8 * u, (py1 - py0) * .27);
    g.fillStyle = css(C.paper); g.fillRect(8 * u, py0, W - 16 * u, py1 - py0);
    g.save(); g.beginPath(); g.rect(8 * u, py0 + 30 * u, W - 16 * u, py1 - py0 - 58 * u); g.clip(); burst(g, W / 2, (py0 + py1) / 2 - 2 * u, 62 * u * P.disc, P, rnd, css(C.ground), css(C.paper), u); g.restore();
    const small = 12.2 * u; g.font = `600 ${small}px "Archivo",Arial,sans-serif`; g.fillStyle = css(C.ground); g.textBaseline = "alphabetic";
    const row = (txt, y) => { const p = (txt || "").toUpperCase().split("/").map(t => t.trim()); g.textAlign = "left"; g.fillText(p[0] || "", 20 * u, y); g.textAlign = "center"; g.fillText(p[1] || "", W / 2, y); g.textAlign = "right"; g.fillText(p[2] || "", W - 20 * u, y); };
    g.fillStyle = css(C.paper); g.fillRect(8 * u, py0, W - 16 * u, 26 * u); g.fillRect(8 * u, py1 - 24 * u, W - 16 * u, 24 * u); g.fillStyle = css(C.ground); row(P.top, py0 + 21 * u); row(P.bottom, py1 - 8 * u);
    /* headline: bars hug the type, type is the paper showing through */
    const lines = [P.line1, P.line2].map(t => (t || "").toUpperCase()), cap = 108 * u * P.headSize, pad = 9 * u * P.pad, pv = 3.5 * u * P.pad; g.font = `100px "Anton","Arial Narrow",sans-serif`; const capR = g.measureText("H").actualBoundingBoxAscent / 100, fs = cap / capR; g.font = `${fs}px "Anton","Arial Narrow",sans-serif`; g.textAlign = "left"; try { g.letterSpacing = (-.014 * fs * P.tight) + "px"; } catch (e) {}
    let y = 22 * u; const bars = [];
    lines.forEach((t, i) => { if (!t) return; const w = Math.min(g.measureText(t).width * P.condense, W - 2 * pad - 16 * u), sx = w / g.measureText(t).width, bx = (W - w) / 2 - pad + (i === 0 ? P.offset * u : 0), bh = cap + 2 * pv; bars.push([bx, y, w + 2 * pad, bh, t, sx]); y += bh; });
    bars.forEach(([bx, by, bw2, bh]) => { g.fillStyle = css(C.bar); g.fillRect(bx, by, bw2, bh); });
    bars.forEach(([bx, by, bw2, bh, t, sx]) => { g.save(); g.translate(bx + pad, by + pv + cap); g.scale(sx, 1); g.fillStyle = css(C.paper); g.fillText(t, 0, 0); if (P.bold > 0) { g.strokeStyle = css(C.paper); g.lineJoin = "round"; g.lineWidth = P.bold * u; g.strokeText(t, 0, 0); } g.restore(); });
    try { g.letterSpacing = "0px"; } catch (e) {}
    /* labels: small highlight bars around the headline */
    const labs = (P.labels || "").toUpperCase().split("/").map(t => t.trim()).filter(Boolean), spots = [[20 * u, 143 * u, "left"], [W - 64 * u, 122 * u, "left"], [90 * u, y + 19 * u, "left"], [W - 150 * u, y + 30 * u, "left"]];
    g.font = `600 ${11.5 * u}px "Archivo",Arial,sans-serif`;
    labs.slice(0, 4).forEach((t, i) => { const [x, yy] = spots[i]; t.split(" ").reduce((acc, w, k, arr) => { if (i === 1) acc.push(w); else if (!k) acc.push(arr.join(" ")); return acc; }, []).forEach((ln, k) => { const w = g.measureText(ln).width; g.fillStyle = css(C.bar); g.fillRect(x - 2 * u, yy - 9.6 * u + k * 12 * u, w + 4 * u, 11.4 * u); g.fillStyle = css(C.paper); g.fillText(ln, x, yy + k * 12 * u); }); });
    /* ---- one weave under everything ---- */
    const img = g.getImageData(0, 0, W, H), d = img.data, nA = vnoise(P.seed + 17), nB = vnoise(P.seed + 71), hr = mulberry(P.seed + 5), th = P.thread * u;
    for (let yy = 0; yy < H; yy++) for (let x = 0; x < W; x++) {
      const j = (yy * W + x) * 4, L = (.299 * d[j] + .587 * d[j + 1] + .114 * d[j + 2]) / 255;
      const tw = Math.sin(2 * Math.PI * (x / (3 * th) + (P.twill ?? 1.2) * (yy / th) / 3 + (P.twd ?? .25) * nB(3, yy / (18 * u)))), hp = hashI(x / th | 0, yy / th | 0, P.seed) - hashI(x / th | 0, (yy / th | 0) - 1, P.seed), sl = nB(x / (70 * u), yy / (9 * u)) - .5;
      const hx = hashI(x, yy, P.seed + 11) - hashI(x - 1, yy, P.seed + 11), wv = (P.tw ?? .55) * tw + (P.hp ?? 2.3) * hp + (P.hx ?? 0) * hx + (P.sl ?? .16) * sl * 4 + (P.fb ?? .975) * (nA(x / ((P.fx ?? 4) * th), yy / ((P.fy ?? 2.3) * th)) - .5) + (P.f2 ?? 0) * (nA(x / (14 * th) + 9, yy / (5 * th)) - .5);
      const k = P.weave * (P.ws ?? 9.8) * wv * (L > .5 ? P.wear * (P.wp ?? .07) : 1);
      d[j] = clamp(d[j] + k, 0, 255); d[j + 1] = clamp(d[j + 1] + k, 0, 255); d[j + 2] = clamp(d[j + 2] + k, 0, 255);
    }
    g.putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p4", no: "04", title: "Highlight Bar", ref: REF, render,
    line: "Type knocked out of bars that hug it, on a woven black, above a paper panel with a generated burst.",
    texts: [{ key: "line1", label: "Line 1", def: "MIND &" }, { key: "line2", label: "Line 2", def: "GUT" }, { key: "labels", label: "Labels ( / between)", def: "MIR / HELIX 01 / ROBOT" }, { key: "top", label: "Panel top ( / between)", def: "MINDGUT / PRESENTS / THE HELIX" }, { key: "bottom", label: "Panel foot ( / between)", def: "FIRST THOUGHT / SECOND BRAIN / ONE SIGNAL" }],
    params: [
      { key: "headSize", label: "Type size", min: .4, max: 1.4, step: .01, def: 1, unit: "×", group: "Type", why: "Cap height of the headline." },
      { key: "condense", label: "Condense", min: .5, max: 1.3, step: .01, def: 0.88, unit: "×", group: "Type", why: "Horizontal squeeze of the letterforms." },
      { key: "tight", label: "Tracking", min: -3, max: 4, step: .01, def: 1.2, unit: "×", group: "Type", why: "How hard the letters are pulled together." },
      { key: "bold", label: "Weight", min: 0, max: 8, step: .1, def: 2.9, unit: "px", group: "Type", why: "Fattens the strokes until the counters start to close." },
      { key: "pad", label: "Bar padding", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Type", why: "How tightly each bar hugs its line. 0 crops the type at the bar edge." },
      { key: "offset", label: "Line 1 shift", min: -160, max: 160, step: 1, def: -6, unit: "px", group: "Type", why: "Slides the top bar against the bottom one." },
      { key: "rays", label: "Rays", min: 0, max: 90, step: 1, def: 54, unit: "", group: "Burst", why: "Number of shards." },
      { key: "spread", label: "Spread", min: .1, max: 1.57, step: .01, def: 0.9, unit: "rad", group: "Burst", why: "How far rays stray from horizontal. 1.57 is a full radial burst." },
      { key: "reach", label: "Reach", min: .4, max: 1.6, step: .01, def: 1.02, unit: "×", group: "Burst", why: "Length of the rays." },
      { key: "fragments", label: "Fragments", min: 0, max: 30, step: 1, def: 11, unit: "", group: "Burst", why: "Loose chunks thrown clear." },
      { key: "crack", label: "Crack", min: 0, max: 2.5, step: .01, def: 0.7, unit: "×", group: "Burst", why: "Width of the fracture through the disc." },
      { key: "disc", label: "Disc size", min: .3, max: 1.8, step: .01, def: 1, unit: "×", group: "Burst", why: "Radius of the split disc." },
      { key: "weave", label: "Weave", min: 0, max: 3, step: .01, def: 1, unit: "×", group: "Fabric", why: "Depth of the cloth texture." },
      { key: "thread", label: "Thread size", min: .5, max: 4, step: .01, def: 1, unit: "×", group: "Fabric", why: "Scale of the threads." },
      { key: "wear", label: "Show-through", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Fabric", why: "How much cloth reads through the light inks." },
      { key: "panel", label: "Panel height", min: .2, max: .7, step: .005, def: .465, unit: "of height", group: "Layout", why: "Share of the sheet given to the paper panel." },
      { key: "blocks", label: "Strip blocks", min: 2, max: 40, step: 1, def: 8, unit: "", group: "Layout", why: "Count of blocks in the foot strip." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 3, unit: "", group: "Layout", why: "Re-rolls the burst and the cloth." }
    ],
    bench: { palette: "measured", params: { line1: "PAIN &", line2: "PLEASURE", labels: "", top: "", bottom: "" }, note: "The benchmark sets the headline to the source wording so the type patch compares the same letters, and leaves the small text off.", items: [
      { name: "cloth", ref: [10, 160, 72, 100], out: [10, 160, 72, 100], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 6, inks: [[52, 51, 54]], inkNames: ["ground"] },
      { name: "headline", ref: [150, 25, 285, 110], out: [150, 25, 285, 110], m: ["hist", "mean", "ink", "share"], inks: [[76, 181, 127], [235, 237, 237], [52, 51, 54]], inkNames: ["bar", "paper", "ground"] },
      { name: "panel paper", ref: [335, 312, 140, 22], out: [335, 312, 140, 22], m: ["hist", "mean", "std", "ink"], inks: [[235, 237, 237]], inkNames: ["paper"] },
      { name: "burst", ref: [170, 360, 250, 165], out: [170, 360, 250, 165], m: ["hist", "mean", "ink", "share"], inks: [[52, 51, 54], [235, 237, 237]], inkNames: ["ground", "paper"] },
      { name: "foot strip", ref: [0, 583, 592, 8], out: [0, 583, 592, 8], m: ["ink", "share"], inks: [[238, 130, 86], [52, 51, 54]], inkNames: ["accent", "ground"] }
    ] },
    palettes: [
      { id: "measured", name: "Field green", note: "measured", c: { ground: [50, 49, 52], bar: [76, 181, 127], paper: [235, 237, 237], accent: [238, 130, 86] }, sw: ["#323134", "#4cb57f", "#ebeded", "#ee8256"] },
      { id: "cobalt", name: "Cobalt", c: { ground: [18, 22, 40], bar: [44, 92, 255], paper: [240, 242, 246], accent: [255, 214, 64] }, sw: ["#121628", "#2c5cff", "#f0f2f6", "#ffd640"] },
      { id: "signal", name: "Signal", c: { ground: [30, 28, 30], bar: [255, 72, 40], paper: [244, 244, 244], accent: [120, 220, 255] }, sw: ["#1e1c1e", "#ff4828", "#f4f4f4", "#78dcff"] },
      { id: "violet", name: "Ultraviolet", c: { ground: [34, 20, 60], bar: [190, 130, 255], paper: [250, 248, 255], accent: [190, 255, 90] }, sw: ["#22143c", "#be82ff", "#faf8ff", "#beff5a"] },
      { id: "invert", name: "Daylight", c: { ground: [236, 238, 240], bar: [24, 26, 30], paper: [255, 255, 255], accent: [255, 96, 60] }, sw: ["#eceef0", "#181a1e", "#ffffff", "#ff603c"] }
    ],
    presets: [{ name: "Radial", set: { spread: 1.57, rays: 84, reach: 1.05, fragments: 20 } }, { name: "Quiet", set: { rays: 10, fragments: 0, crack: .4, weave: .5 } }, { name: "Heavy", set: { bold: 6, pad: 0, headSize: 1.25, tight: 2 } }],
    motion: [{ key: "weave", amp: .3, period: 5, mode: "sine" }, { key: "offset", amp: 24, period: 9, mode: "drift" }],
    live: { x: { key: "spread", min: .1, max: 1.57 }, y: { key: "reach", min: .4, max: 1.6 } },
    source: "Reference 4: poster on black cloth, 592 × 592 px JPEG",
    passes: ["ground, foot strip, side notches", "paper panel, burst clipped to its inner band, corner text", "bars sized to their line, type drawn in the paper color with a 2.9 px stroke", "label bars", "cloth: a twill of 3 px columns that step 1.2 px to the left per row, with a slow phase drift; vertical differenced noise for the lag-1 weft; fiber noise at 4 × 2.3 threads; full strength on the ground, a 7 % trace on light inks"],
    measured: { cloth: [50, 48, 51], cloth_sigma_L: 10.7, column_period_px: 3, twill_step_px_per_row: 1.2, twill_evidence: "2D autocorrelation 0.23 at (dx −1, dy 1) and 0.35 at (dx 3, dy 0); the vertical lags run −0.41, 0.08, 0.12, −0.16, 0.19, a period near 2.5 rows", column_share_of_variance: .36, vertical_lag1_correlation: -.41, bar: [76, 181, 127], paper: [235, 237, 237], accent: [238, 130, 86], bar_rows_px: [22, 137, 257], panel_px: [8, 305, 584, 580], disc_radius_px: 62, type: { stroke_px: 45, counter_px: 18, method: "L > 200 runs across the headline band" } },
    limits: ["Anton stands in for the reference's condensed grotesque, which is heavier and tighter.", "The copy is placeholder Mindgut wording; edit it in the text fields.", "The headline and burst histograms score 0.83 to 0.84 because the reference is a JPEG whose ringing puts 7 to 11 % of its paper pixels above L 240 and spreads the bar green over 138 to 159; the render's edges are sharp and no blur or ringing was added.", "The cloth is a stochastic twill, not the reference's exact thread count: its spectrum scores 0.92 and its autocorrelation 0.93."],
    study: { slug: "highlight-bar", lede: "Type knocked out of green bars that hug each line, a paper panel with a generated burst, all of it printed on a black cloth whose twill shows through the ground at full strength and through the inks at 7 %.",
      body: ["The reference is a poster printed on black cloth. The cloth is a fine twill: columns on a 3 px period that step about 1.2 px to the left on each row, so the diagonal runs up to the right, with the weft showing as a negative correlation of 0.41 between neighboring rows. The ground measures 50 48 51 with a luminance spread of 10.7. The headline is set in a condensed black grotesque, strokes about 45 px with 18 px counters, knocked out of a green bar sized to each line. A paper panel holds a split disc with rays thrown left and right.", "The rebuild draws the sheet flat: ground, foot strip, notches, panel, the burst clipped to the panel's inner band, the bars and the type, then the labels. One pixel pass lays the cloth under everything: the twill term, a vertical differenced noise, fiber noise at two scales and a slow slub. The ground takes the full depth; light inks take a trace scaled by show-through. Type size, condense and tracking set the headline; bar padding sets how tightly the green hugs it. Rays, spread and reach shape the burst; crack sets the fracture through the disc. Weave and thread size set the cloth."],
      method: "Flat inks · Bars sized to the type · Generated burst · Twill under every ink · Show-through on light inks",
      points: [
        { u: .07, v: .35, d: "KEY", label: "Bare cloth: the 3 px twill at full depth, σ 10.7 around 50 48 51, stepping 1.2 px per row.", t: "cloth", dir: [-1, 0] },
        { u: .3, v: .09, d: "KEY", label: "Bar hugging the type: 9 px pad left and right, 3.5 px above and below the cap.", t: "type", dir: [0, -1] },
        { u: .6, v: .24, d: "READ", label: "Paper type inside the bar: the cloth reads through at 7 %, so the paper is not flat.", t: "type", dir: [1, 0] },
        { u: .5, v: .45, d: "READ", label: "Panel corner text at 12 px, three columns, in the ground color.", t: "panel", dir: [0, -1] },
        { u: .5, v: .66, d: "KEY", label: "Burst: 54 rays from a 62 px disc, each ray 0.4 to 1.7 px at the root and up to 6 times that at the tip.", t: "burst", dir: [1, 1] },
        { u: .42, v: .62, d: "READ", label: "Crack: a paper stroke 0.3 of the disc radius wide, nine segments, miter joins.", t: "burst", dir: [-1, 0] },
        { u: .8, v: .72, d: "READ", label: "Fragments: 11 loose chunks of 5 to 18 px thrown clear of the rays.", t: "burst", dir: [1, 0] },
        { u: .5, v: .99, d: "READ", label: "Foot strip: 8 blocks, every second one in the accent, 14 px tall, under the panel's bottom edge.", t: "panel", dir: [0, 1] },
        { u: .985, v: .7, d: "READ", label: "Side notch: the accent at the panel's edge, 8 px wide, 27 % of the panel's height.", t: "panel", dir: [1, 0] },
        { u: .15, v: .25, d: "READ", label: "Label bar: 11.4 px of green around 11.5 px Archivo, a small copy of the headline rule.", t: "type", dir: [-1, 1] }
      ] }
  });
})();
