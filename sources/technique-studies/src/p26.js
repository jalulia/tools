/* ===== PLATE 26 · ARC LEDGER =====
   a concentric-ring paper (two ring systems meeting on a diagonal) under two mirrored groups of
   ten track arcs; each arc sweeps from a numeral cap by its value, a hairline of paper separates
   the tracks, and the empty track runs on as the leader to a straight label set tangent to it. */
(function () {
  const REF = { w: 1486, h: 842 };
  const D2R = Math.PI / 180;
  function parse(s) {
    return String(s || "").split(/[;\n]+/).map(t => t.trim()).filter(Boolean).slice(0, 12).map(t => {
      const i = t.lastIndexOf("/"); let name = t, raw = "", v = NaN;
      if (i >= 0) { name = t.slice(0, i).trim(); raw = t.slice(i + 1).trim(); v = parseFloat(raw); }
      if (!(v >= 0)) v = 0; if (!raw) raw = "0";
      return { name, raw, v };
    });
  }
  function capRatio(g, font) { g.font = `${font.replace("SIZE", "100")}`; const m = g.measureText("H"); return (m.actualBoundingBoxAscent || 70) / 100; }
  /* one group: arcs, numerals, leaders, labels, title. rot = 0 or PI (the mirrored group) */
  function group(g, cx, cy, rot, items, P, C, u, fonts, title) {
    const N = items.length, pitch = P.pitch * u, hair = P.hair * u, inner = P.inner * u, cap = (pitch - hair) / 2;
    const ax = P.axis * D2R, start = ax + Math.PI + rot, axisEnd = start + Math.PI;            // caps sit on the axis (upper-left), labels start on it (lower-right)
    const vmax = Math.max(1e-6, ...items.map(it => it.v));
    const labFs = fonts.lab, numFs = fonts.num;
    const rows = items.map((it, k) => {
      const ri = inner + (N - 1 - k) * pitch, rm = ri + pitch / 2;                          // track k: ri..ri+pitch, outer arc is item 0
      g.font = `400 ${labFs}px "Archivo",Arial,sans-serif`; const wN = g.measureText(it.name + " / ").width;
      g.font = `700 ${labFs}px "Archivo",Arial,sans-serif`; const wV = g.measureText(it.raw).width;
      const L = wN + wV, half = L / 2, capH = labFs * fonts.capL, gapAng0 = (P.gap * u) / rm;
      const am0 = axisEnd - gapAng0 - Math.atan2(half, rm), d0 = am0 - Math.PI / 2, flip = Math.cos(d0) < -1e-9 || (Math.abs(Math.cos(d0)) <= 1e-9 && Math.sin(d0) > 0);
      /* baseline radius: upright text hangs its cap tops 1.5 px off the leader; flipped text sits its baseline 7.5 px off it (room for the slash) */
      const rT = ri + hair / 2 + P.guide * u + P.labelDrop * u + (flip ? 7.5 * u : 1.5 * u + capH);
      const labAng = 2 * Math.atan2(half, rT), capAng = cap / rm, gapAng = (P.gap * u) / rm;
      let sweep = (P.minSweep + (it.v / vmax) * (P.maxSweep - P.minSweep)) * D2R;
      const avail = Math.PI - labAng - 2 * capAng - 2 * gapAng; if (sweep > avail) sweep = Math.max(0, avail);
      return { it, k, ri, rm, rT, wN, wV, L, half, labAng, capAng, sweep, flip };
    });
    /* leaders: the empty track's inner edge runs from the arc's end cap to the label's near end */
    g.lineWidth = P.guide * u; g.strokeStyle = css(C.guide); g.lineCap = "butt";
    rows.forEach(r => { const a0 = start + r.sweep + r.capAng + (P.gap * u) / r.rm, a1 = axisEnd - (P.gap * u) / r.rm; if (a1 > a0 && P.guide > 0) { g.beginPath(); g.arc(cx, cy, r.ri + hair / 2 + P.guide * u / 2, a0, a1); g.stroke(); } });
    /* arcs: a paper outline, then the ink, round caps on both ends */
    g.lineCap = "round";
    rows.forEach(r => { g.beginPath(); g.arc(cx, cy, r.rm, start, start + r.sweep); g.lineWidth = pitch - hair + 2 * hair; g.strokeStyle = css(C.hair); g.stroke(); });
    rows.forEach(r => { const t = N > 1 ? r.k / (N - 1) : 0, c = ramp(C.ramp, Math.pow(t, P.rampBend)); g.beginPath(); g.arc(cx, cy, r.rm, start, start + r.sweep); g.lineWidth = pitch - hair; g.strokeStyle = css(c); g.stroke(); });
    /* numerals in the start caps */
    g.fillStyle = css(C.numeral); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${numFs}px "Archivo",Arial,sans-serif`;
    rows.forEach(r => { if (r.sweep <= 0) return; const x = cx + Math.cos(start) * r.rm, y = cy + Math.sin(start) * r.rm; g.fillText(String(r.k + 1), x, y + numFs * .04); });
    /* labels: straight, tangent at their midpoint, cap tops toward the leader, always readable */
    g.textBaseline = "alphabetic"; g.fillStyle = css(C.ink);
    rows.forEach(r => {
      const am = axisEnd - (P.gap * u) / r.rm - r.labAng / 2, px = cx + Math.cos(am) * r.rT, py = cy + Math.sin(am) * r.rT;
      const dir = am - Math.PI / 2 + (r.flip ? Math.PI : 0), y0 = 0;                      // reading counter-clockwise, glyph tops inward; flipped when that would read upside down
      g.save(); g.translate(px, py); g.rotate(dir); g.textAlign = "left";
      g.font = `400 ${labFs}px "Archivo",Arial,sans-serif`; g.fillStyle = css(C.ink); g.fillText(r.it.name + " / ", -r.half, y0);
      g.font = `700 ${labFs}px "Archivo",Arial,sans-serif`; g.fillText(r.it.raw, -r.half + r.wN, y0);
      g.restore();
    });
    /* title: two upright lines in the quiet sector before the caps */
    const tr = P.titleR * u, ta = ax + Math.PI + rot - 22 * D2R, tx = cx + Math.cos(ta) * tr, ty = cy + Math.sin(ta) * tr, lines = String(title || "").split("/").map(s => s.trim().toUpperCase()).filter(Boolean);
    g.font = `700 ${fonts.title}px "Archivo",Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillStyle = css(C.ink);
    lines.forEach((ln, i) => g.fillText(ln, tx, ty + (i - (lines.length - 1) / 2) * fonts.title * 1.15 + fonts.title * .36));
  }
  function ramp(R, t) { const n = R.length - 1, f = clamp(t, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), s = f - i; return [0, 1, 2].map(c => lerp(R[i][c], R[i + 1][c], s)); }
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    /* group centers: a measured offset expressed in the axis frame, so the axis slider turns the whole figure */
    const ax = P.axis * D2R, tX = Math.cos(ax), tY = Math.sin(ax), nX = Math.sin(ax), nY = -Math.cos(ax), sp = P.spread;
    const ox = (136.5 * tX + 43 * nX) * u * sp, oy = (136.5 * tY + 43 * nY) * u * sp, cxA = W / 2 + ox, cyA = H / 2 + oy, cxB = W / 2 - ox, cyB = H / 2 - oy;
    /* ---- pass 1: paper, two concentric ring systems meeting on the axis line, a faint mottle ---- */
    const img = g.createImageData(W, H), d = img.data, fine = P.pitch * u / Math.max(1, Math.round(P.ringsPer)), sig = P.ringWidth * u, k2 = -1 / (2 * sig * sig), s3 = .7 * u, k3 = -1 / (2 * s3 * s3), half = P.halfRing / Math.max(1, P.ringDepth), depth = P.ringDepth, mot = P.mottle, nz = vnoise(P.seed + 5), ms = 2.6 * u, bead = P.bead, bs = 1.6 * u, ph = P.phase || 0, blue = clamp(P.blue ?? .3, 0, 1);
    const pr = C.paper[0], pg = C.paper[1], pb = C.paper[2], dL = Math.max(1, Math.abs(.299 * (pr - C.ring[0]) + .587 * (pg - C.ring[1]) + .114 * (pb - C.ring[2]))), rs = depth / dL, rr = pr + (C.ring[0] - pr) * rs, rg = pg + (C.ring[1] - pg) * rs, rb = pb + (C.ring[2] - pb) * rs;
    let wf = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const side = (x + .5 - W / 2) * nX + (y + .5 - H / 2) * nY, cx = side >= 0 ? cxA : cxB, cy = side >= 0 ? cyA : cyB;
      const dx = x + .5 - cx, dy = y + .5 - cy, r = Math.hypot(dx, dy), f = r / fine - ph, dd = (f - Math.round(f)) * fine, f2 = f + .5, d2 = (f2 - Math.round(f2)) * fine;
      wf[y * W + x] = (Math.exp(dd * dd * k2) + half * Math.exp(d2 * d2 * k3)) * (1 + bead * (nz(x / bs, y / bs) - .5));   // the ruling, and a fainter ring between each pair
    }
    if ((P.soften ?? 0) > 0) wf = gblur(wf, W, H, P.soften * u);                                                       // the resample softening the reference's ruling carries
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const j = (y * W + x) * 4, side = (x + .5 - W / 2) * nX + (y + .5 - H / 2) * nY, cx = side >= 0 ? cxA : cxB, cy = side >= 0 ? cyA : cyB;
      const dx = x + .5 - cx, dy = y + .5 - cy, r = Math.hypot(dx, dy), w = wf[y * W + x];
      const sh = ph * fine / (r + 1e-6), mx = x - dx * sh, my = y - dy * sh;                                    // the paper moves with its ruling
      const ix = Math.round(mx), iy = Math.round(my), h0 = hashI(ix, iy, P.seed), hn = (hashI(ix - 1, iy, P.seed) + hashI(ix + 1, iy, P.seed) + hashI(ix, iy - 1, P.seed) + hashI(ix, iy + 1, P.seed)) * .25;
      const m = mot * ((h0 - hn) * 4.2 * blue + (h0 - .5) * 3.2 * (1 - blue) + (nz(mx / ms, my / ms) - .5) * .3);   // grain: part high-passed (neighbors anti-correlated, as the reference's resampled noise is), part white
      d[j] = clamp(pr + (rr - pr) * w + m, 0, 255); d[j + 1] = clamp(pg + (rg - pg) * w + m, 0, 255); d[j + 2] = clamp(pb + (rb - pb) * w + m, 0, 255); d[j + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    /* ---- pass 2: the two groups ---- */
    const capL = capRatio(g, `700 SIZEpx "Archivo",Arial,sans-serif`) || .72;
    const fonts = { lab: P.labelCap * u / capL, num: P.numeralCap * u / capL, title: P.titleCap * u / capL, capL };
    const A = parse(P.dataA), B = parse(P.dataB), ts = P.typeSoft * u;
    const Lc = ts > .05 ? mk(W, H) : cv, gl = Lc.getContext("2d");
    if (A.length) group(gl, cxA, cyA, 0, A, P, C, u, fonts, P.titleA);
    if (B.length) group(gl, cxB, cyB, Math.PI, B, P, C, u, fonts, P.titleB);
    /* ---- pass 3: the drawn layer takes the resample softening the reference carries; the paper keeps its own grain ---- */
    if (ts > .05) {
      const ld = gl.getImageData(0, 0, W, H).data, n = W * H, ch = [new Float32Array(n), new Float32Array(n), new Float32Array(n), new Float32Array(n)];
      for (let i = 0, j = 0; i < n; i++, j += 4) { const a = ld[j + 3] / 255; ch[0][i] = ld[j] * a; ch[1][i] = ld[j + 1] * a; ch[2][i] = ld[j + 2] * a; ch[3][i] = a; }
      const bl = ch.map(c => gblur(c, W, H, ts)), base = g.getImageData(0, 0, W, H), bd = base.data;
      for (let i = 0, j = 0; i < n; i++, j += 4) { const a = bl[3][i]; if (a <= 0) continue; const k = 1 - a; bd[j] = clamp(bd[j] * k + bl[0][i], 0, 255); bd[j + 1] = clamp(bd[j + 1] * k + bl[1][i], 0, 255); bd[j + 2] = clamp(bd[j + 2] * k + bl[2][i], 0, 255); }
      g.putImageData(base, 0, 0);
    }
  }
  const RAMP = (stops, n) => { const out = []; for (let i = 0; i < n; i++) out.push(ramp(stops.map(hex), i / (n - 1)).map(Math.round)); return out; };
  PLATES.push({
    id: "p26", no: "26", title: "Arc Ledger", ref: REF, render,
    line: "Two mirrored decks of ten track arcs on a paper ruled with 6.25 px concentric rings; each arc sweeps by its value from a numbered cap, and its empty track runs on as the leader to a label set tangent to it.",
    texts: [
      { key: "dataA", label: "Group A data (name / value; …) outer→inner", def: "Helix open / 140%; Second brain / 129%; Gut signal / 105%; Mir replies / 76%; Loop closes / 72%; Little robot / 50%; Night mode / 35%; Slow morning / 30%; Quiet check / 30%; First thought / 12%" },
      { key: "dataB", label: "Group B data (name / value; …) outer→inner", def: "Helix turn / 444%; Deep listen / 340%; Gut answer / 330%; Robot wakes / 318%; Mir remembers / 195%; Thread held / 135%; Signal clears / 110%; Pause / 39%; Breath / 32%; First thought / 2%" },
      { key: "titleA", label: "Title A ( / = line break)", def: "FIRST / THOUGHT" },
      { key: "titleB", label: "Title B ( / = line break)", def: "SECOND / BRAIN" }
    ],
    params: [
      { key: "pitch", label: "Track pitch", min: 18, max: 44, step: .25, def: 31.25, unit: "px", group: "Tracks", why: "Radial distance from one track to the next; the arc width follows it." },
      { key: "inner", label: "Inner radius", min: 60, max: 220, step: 1, def: 131.25, unit: "px", group: "Tracks", why: "Where the innermost track begins." },
      { key: "hair", label: "Hairline", min: 0, max: 5, step: .05, def: 1.4, unit: "px", group: "Tracks", why: "Paper-colored outline around every arc; the gap you see between neighbors." },
      { key: "guide", label: "Leader weight", min: 0, max: 3, step: .05, def: 1, unit: "px", group: "Tracks", why: "The empty track's edge line from arc end to label. 0 removes the leaders." },
      { key: "gap", label: "Leader gap", min: 0, max: 60, step: .5, def: 4, unit: "px", group: "Tracks", why: "Breathing room: cap to leader, and the label start back from the axis." },
      { key: "minSweep", label: "Minimum sweep", min: 0, max: 90, step: .5, def: 32, unit: "°", group: "Data", why: "Sweep given to a value of zero, so every arc shows its cap and numeral." },
      { key: "maxSweep", label: "Maximum sweep", min: 40, max: 180, step: .5, def: 158, unit: "°", group: "Data", why: "Sweep of the largest value; clamped so no arc runs into its own label." },
      { key: "rampBend", label: "Ramp bend", min: .3, max: 3, step: .01, def: 1, unit: "γ", group: "Data", why: "How the ten greens are spaced from outer (light) to inner (dark)." },
      { key: "labelCap", label: "Label cap height", min: 7, max: 22, step: .25, def: 13, unit: "px", group: "Type", why: "Size of the tangent labels; longer labels take more of the track." },
      { key: "numeralCap", label: "Numeral cap height", min: 6, max: 24, step: .25, def: 13.5, unit: "px", group: "Type", why: "Size of the white numerals in the start caps." },
      { key: "titleCap", label: "Title cap height", min: 8, max: 30, step: .25, def: 12, unit: "px", group: "Type", why: "Size of the two-line titles." },
      { key: "labelDrop", label: "Label seat", min: -6, max: 10, step: .25, def: 0, unit: "px", group: "Type", why: "Extra radial offset of the label from its leader; 0 is the measured seat." },
      { key: "typeSoft", label: "Drawn-layer softening", min: 0, max: 2, step: .05, def: .45, unit: "px σ", group: "Type", why: "Resample blur on the arcs, leaders and type, as the reference carries; 0 is crisp vector." },
      { key: "titleR", label: "Title distance", min: 40, max: 520, step: 1, def: 294, unit: "px", group: "Type", why: "Radius of the title from its group center, in the quiet sector before the caps." },
      { key: "ringsPer", label: "Rings per track", min: 1, max: 10, step: 1, def: 5, unit: "", group: "Paper", why: "Fine ring count inside one track pitch; the ruling that reads as paper texture." },
      { key: "ringDepth", label: "Ring depth", min: 0, max: 80, step: 1, def: 26, unit: "/255", group: "Paper", why: "Darkness of each fine ring at its center." },
      { key: "ringWidth", label: "Ring width", min: .3, max: 3.5, step: .05, def: .6, unit: "px σ", group: "Paper", why: "Softness of the fine rings; large values blur them into a tone." },
      { key: "bead", label: "Ring beading", min: 0, max: 2, step: .05, def: .15, unit: "×", group: "Paper", why: "How unevenly each ring takes ink along its length; 0 is a perfectly even line." },
      { key: "halfRing", label: "Half ring", min: 0, max: 30, step: .5, def: 6.25, unit: "/255", group: "Paper", why: "Depth of the fainter ring the reference carries between each pair of rings." },
      { key: "mottle", label: "Mottle", min: 0, max: 16, step: .1, def: 3.3, unit: "/255", group: "Paper", why: "Low-amplitude paper noise under the rings." },
      { key: "axis", label: "Axis angle", min: 15, max: 75, step: .5, def: 45, unit: "°", group: "Layout", why: "Tilt of the diagonal that the caps, the label starts and the ring seam all sit on." },
      { key: "spread", label: "Group spread", min: 0, max: 1.8, step: .01, def: 1, unit: "×", group: "Layout", why: "How far the two group centers sit from the plate center." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 7, unit: "", group: "Layout", why: "Re-rolls the paper mottle." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop: the ruling moves outward by one ring pitch per cycle." }
    ],
    motion: [
      { key: "phase", amp: 1, period: 4, mode: "saw" },
      { key: "maxSweep", amp: 12, period: 9, mode: "sine" },
      { key: "axis", amp: .6, period: 6, mode: "drift" }
    ],
    live: { x: { key: "axis", min: 20, max: 70 }, y: { key: "maxSweep", min: 60, max: 180 } },
    bench: { palette: "measured", params: {
      dataA: "Vietnam / 140%; Mozambique / 129%; India / 105%; China / 75%; Russia / 72%; UAE / 50%; Australia / 35%; UK / 30%; US / 30%; Switzerland / 12%",
      dataB: "Azerbaijan / 444%; India / 340%; China / 330%; Angola / 318%; Russia / 195%; Australia / 135%; UAE / 110%; UK / 39%; US / 32%; Portugal / 2%",
      titleA: "PAST / 10 YEARS", titleB: "NEXT / 10 YEARS" },
      note: "The benchmark feeds the reference's own country list and titles so the typed patches compare the same words; the composition is laid out by the engine's rules, so patches are the same rects on both.", items: [
      { name: "ruled paper", ref: [1300, 20, 160, 160], out: [1300, 20, 160, 160], m: ["hist", "mean", "std", "spec", "ac", "ink"], lags: 8, inks: [[250, 249, 247]], inkNames: ["paper"] },
      { name: "arc starts", ref: [560, 140, 300, 260], out: [560, 140, 300, 260], m: ["hist", "mean", "std", "ink", "share"], inks: [[250, 249, 247], [221, 232, 152], [119, 196, 126], [1, 147, 89], [0, 87, 66]], inkNames: ["paper", "pale", "mid", "deep", "dark"] },
      { name: "arc field", ref: [800, 60, 200, 200], out: [800, 60, 200, 200], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 8, inks: [[221, 232, 152], [160, 207, 115], [91, 187, 105], [1, 173, 92], [250, 249, 247]], inkNames: ["pale", "light", "mid", "deep", "paper"] },
      { name: "labels", ref: [1000, 540, 260, 240], out: [1000, 540, 260, 240], m: ["hist", "mean", "std", "ink", "share"], inks: [[250, 249, 247], [40, 37, 36]], inkNames: ["paper", "ink"] },
      { name: "whole plate", ref: [0, 0, 1486, 842], out: [0, 0, 1486, 842], m: ["ink", "share"], inks: [[250, 249, 247], [221, 232, 152], [119, 196, 126], [1, 147, 89], [0, 87, 66], [40, 37, 36]], inkNames: ["paper", "pale", "mid", "deep", "dark", "ink"] }
    ] },
    palettes: [
      { id: "measured", name: "Ledger green", note: "measured", c: { paper: [250, 249, 247], ring: [196, 195, 193], guide: [70, 70, 70], hair: [255, 255, 255], ink: [40, 37, 36], numeral: [255, 255, 255], ramp: [[221, 232, 152], [197, 223, 137], [160, 207, 115], [119, 196, 126], [91, 187, 105], [51, 182, 97], [1, 173, 92], [1, 147, 89], [4, 105, 85], [0, 87, 66]] }, sw: ["#faf9f7", "#ddE898", "#01ad5c", "#005742"] },
      { id: "cobalt", name: "Cobalt", c: { paper: [246, 247, 250], ring: [200, 204, 214], guide: [70, 76, 96], hair: [255, 255, 255], ink: [24, 28, 44], numeral: [255, 255, 255], ramp: RAMP(["#cfe0ff", "#7fa8ff", "#2f5fe8", "#1a2f9a", "#0d1650"], 10) }, sw: ["#f6f7fa", "#cfe0ff", "#2f5fe8", "#0d1650"] },
      { id: "ember", name: "Ember", c: { paper: [245, 245, 246], ring: [205, 203, 203], guide: [90, 70, 64], hair: [255, 255, 255], ink: [40, 30, 28], numeral: [255, 255, 255], ramp: RAMP(["#ffe0a8", "#ffb256", "#ff7a2a", "#d8381e", "#7a1a16"], 10) }, sw: ["#f5f5f6", "#ffe0a8", "#ff7a2a", "#7a1a16"] },
      { id: "night", name: "Night ledger", c: { paper: [22, 24, 30], ring: [44, 47, 56], guide: [150, 156, 170], hair: [22, 24, 30], ink: [226, 228, 234], numeral: [22, 24, 30], ramp: RAMP(["#f4ffb8", "#b8f06a", "#56c86a", "#1f8e6e", "#0f4a58"], 10) }, sw: ["#16181e", "#f4ffb8", "#56c86a", "#0f4a58"] },
      { id: "plum", name: "Plum", c: { paper: [248, 246, 250], ring: [206, 200, 212], guide: [84, 70, 96], hair: [255, 255, 255], ink: [38, 28, 46], numeral: [255, 255, 255], ramp: RAMP(["#f3d4ff", "#d49cff", "#a05ce6", "#6a2aa8", "#2f1050"], 10) }, sw: ["#f8f6fa", "#f3d4ff", "#a05ce6", "#2f1050"] },
      { id: "slate", name: "Slate mono", c: { paper: [247, 248, 249], ring: [198, 201, 205], guide: [60, 64, 70], hair: [255, 255, 255], ink: [28, 30, 34], numeral: [255, 255, 255], ramp: RAMP(["#d8dde3", "#aab2bb", "#7b8590", "#4d5661", "#1f252c"], 10) }, sw: ["#f7f8f9", "#d8dde3", "#7b8590", "#1f252c"] }
    ],
    presets: [
      { name: "Reference seat", set: { pitch: 31.25, inner: 131.25, maxSweep: 150, minSweep: 30, ringsPer: 5 } },
      { name: "Dense ruling", set: { ringsPer: 8, ringDepth: 18, ringWidth: .8, hair: 1.2 } },
      { name: "Wide tracks", set: { pitch: 40, inner: 90, labelCap: 14, numeralCap: 16, minSweep: 20 } },
      { name: "Quiet paper", set: { ringDepth: 8, ringWidth: 1.6, mottle: 1, guide: .7 } }
    ],
    passes: [
      "pass 1, paper: a flat near-white, then two concentric ring systems (one per group center) meeting on the axis diagonal; each fine ring is a gaussian dip of measured depth with a fainter ring between each pair, five rings per track pitch; a low-amplitude grain, part high-passed, under it",
      "pass 2, leaders: each empty track's inner edge is drawn as a 1 px gray arc from the arc's end cap to the label's near end",
      "pass 3, arcs: a paper-white outline stroke, then the ink stroke, round caps; the outline is the hairline you see between neighbors",
      "pass 4, numerals: white bold figures centered in the start caps",
      "pass 5, labels: name (Archivo 400) and value (700) set on one straight baseline tangent to the track at the label's midpoint, cap tops toward the leader, flipped to stay readable on the mirrored group",
      "pass 6, titles: two upright lines in the quiet sector before the caps",
      "pass 7, softening: the drawn layer (arcs, leaders, numerals, labels, titles) is blurred by 0.45 px σ and composited over the paper, the resample softening the reference carries; the paper keeps its own grain"
    ],
    measured: {
      plate: "1486×842; group A center (870.3, 487.4) by least-squares circle fit on the outer arc edge; group B is its 180° rotation about the plate center (615.7, 354.6)",
      tracks: "pitch 31.25 px (radial profile: hairlines at 162.5, 193.75, … 412.5 from the center; autocorrelation peak at 31.25); innermost track inner edge 131.25 px (= 21 fine rings); outermost edge 443.75; ink width 29.5 px, white hairline 1.75 px",
      arcs: "caps centered on the axis at −135° from the group center (numeral centers measured at −135.1°); ends measured for A: 15.5, 4, −24, −36, −42, −70, −77.5, −77.5, −95.5, ≈−99° → sweeps 150…36°; fit as sweep = 30° + 0.85°/% (ref values 12…140 %); the reference's B group is not proportional (444 % at 141°), so proportional sweep is the engine's rule, not the reference's",
      greens: "mid-track medians along the −118° radial, outer→inner: (221,232,152) (197,223,137) (160,207,115) (119,196,126) (91,187,105) (51,182,97) (1,173,92) (1,147,89) (4,105,85) (0,87,66)",
      paper: "between rings (250,249,247) (top decile 252,251,250); fine ring pitch 6.25 px (autocorrelation peak 6.25 with harmonic at 31.25); folded radial profile at 0.125 px: dip 247 → 229, FWHM 2.1 px, plus a 3/255 dip midway between rings → gaussian σ 0.6 depth 26 with a 6/255 half-pitch ring; corner patch decomposed into ring model σ 7.3 and residual noise σ 4.1 with lag-1 x-autocorrelation −0.23 → grain 30 % high-passed; whole-plate green share 26.2 %",
      ringSeam: "local structure-tensor orientation of the paper fits center A on one side and center B on the other of a line through the plate center at ≈43–45°",
      leaders: "1 px dark gray (≈80) at the track's inner edge, present only from arc end to label; no guide circles past the labels (checked at 60°, 100°)",
      labels: "straight lines tangent to the track; glyph normal extents inner edge +2 … +21 px (cap tops almost touching the leader, baseline near the track center); label starts aligned on the +45° axis (max angle 44.7° on every track); text ink (40,37,36)",
      type: "label cap height ≈ 13 px, value bold; numerals ≈ 13.5 px white serif bold (Archivo 700 stands in); title two lines, cap 12 px, pitch 19 px, centered at r 294 / −157° from the group center"
    },
    limits: [
      "The reference's numerals are a serif bold; Archivo 700 stands in, which keeps the arc-starts histogram near 0.97.",
      "The reference's ruling and type are resampled, so a 0.45 px σ blur is applied to the drawn layer (arcs, leaders, type) and the fine ruling carries a 6/255 half-pitch ring measured in the folded radial profile; the paper patch's histogram and spectrum sit near 0.96 to 0.98.",
      "The reference's hairline reads as a 1.4 px paper line after softening, wider than the 1 px core measured on the raw profile; the arc-field paper (hairline) color sits near 0.92.",
      "The reference's lower deck is not proportional to its values (444 % at 158°, 2 % at 13°); the engine is, with a 32° floor, so whole-plate shares differ by about a point."
    ],
    source: "Reference 26: a two-deck concentric arc chart on a ring-ruled paper, 1486×842.",
    study: {
      slug: "arc-ledger", lede: "Ten arcs on ten tracks, mirrored, on a paper ruled with the same 6.25 px circles that carry the data.",
      body: [
        "The material is a ruled paper. Fine concentric circles at a 6.25 px pitch radiate from each group's center, and the two ring systems meet on a diagonal through the plate center. Every fifth ring is a track boundary, so a track is 31.25 px wide. Each arc is a 29.5 px ink stroke with round caps set in its track, separated from its neighbors by a paper hairline of about 1.4 px. The ten greens step from (221,232,152) on the outer track to (0,87,66) on the inner one. Where an arc ends, the track's inner edge continues as a 1 px leader to a straight label set tangent to the track, with the cap tops 2 px off the leader.",
        "The rebuild draws the ruling per pixel from the two centers, then strokes each arc by its value: a 32° minimum sweep that keeps the cap and numeral visible, plus up to 126° in proportion to the value, clamped so no arc reaches its own label. Pitch, inner radius and hairline set the track geometry. Ring depth, width and count set the paper. The axis angle turns the caps, the label starts and the ring seam together, and group spread moves the two decks apart. The data lists are free text, one item per arc, name and value separated by a slash."
      ],
      method: "ruled paper from two centers · track arcs with paper hairlines · leaders along empty tracks · tangent labels",
      points: [
        { u: .43, v: .29, d: "KEY", label: "Start cap of the upper deck: a white Archivo 700 numeral centered in a 14.25 px round cap, with the 1 px paper outline between it and the next track.", t: "edge", dir: [1, 1] },
        { u: .60, v: .14, d: "KEY", label: "Ten stacked tracks: 29.5 px ink, 1.4 px paper hairline, ten greens from (221,232,152) outward to (0,87,66) inward.", t: "pull", dir: [0, 1] },
        { u: .93, v: .12, d: "READ", label: "Bare ruling: rings at 6.25 px pitch, a gaussian dip of 26/255 with σ 0.6 px and a 6/255 half-pitch ring between, under 3.3/255 of grain.", t: "grain", dir: [0, 1] },
        { u: .77, v: .35, d: "KEY", label: "An arc's end: the round cap, then the track's inner edge continuing as a 1 px leader in (70,70,70).", t: "edge", dir: [1, 0] },
        { u: .74, v: .72, d: "KEY", label: "Labels on their tracks: straight, tangent at the midpoint, Archivo 400 name and 700 value, cap tops 1.5 px off the leader, softened by 0.45 px σ.", t: "type", dir: [1, -1] },
        { u: .50, v: .50, d: "READ", label: "The ring seam: rings about the upper center meet rings about the lower center on the 45° diagonal.", t: "grain", dir: [1, -1] },
        { u: .40, v: .44, d: "READ", label: "Title in the empty sector 22° before the caps, two upright lines at 12 px cap height.", t: "type", dir: [0, 1] },
        { u: .20, v: .17, d: "KEY", label: "Lower deck's labels: the same tangent geometry rotated 180°, the text flipped to read upright, baseline 7.5 px off the leader.", t: "type", dir: [1, 1] },
        { u: .10, v: .55, d: "READ", label: "Outermost pale arc of the lower deck at the 158° maximum sweep.", t: "pull", dir: [0, 1] },
        { u: .56, v: .60, d: "READ", label: "Innermost dark arc at the 32° minimum sweep, long enough to hold its cap and numeral.", t: "edge", dir: [-1, 0] }
      ]
    }
  });
})();
