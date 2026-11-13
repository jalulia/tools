/* ===== PLATE 12 · STIPPLE WAVE =====
   one flow field (an S-wave) -> rows of brush dabs along its level sets -> a density field (dense rounded
   tips, fading tails, a sparse haze between) -> a stipple of 2 px dots in two inks, sampled from that density.
   Tone is only ever dot density; the dots themselves never change size. */
(function () {
  const REF = { w: 614, h: 1228 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const nA = vnoise(P.seed + 5), nB = vnoise(P.seed + 61), rnd = mulberry(P.seed * 6151 + 3);
    /* ---- flow: rotated coordinates, a sine wave across them; rows are level sets of phi ---- */
    const th = P.tilt * Math.PI / 180, ct = Math.cos(th), st = Math.sin(th), A = P.wave * u, lam = P.wavelength * u, S = P.rows * u, pl = P.pitch * u;
    const rd = P.width * u, tau = P.fade * u, Ld = P.length * u, rho0 = P.haze * .004, rmax = P.tip, gap = Math.round(P.gap), G = Math.max(1, Math.round(P.group) + gap);
    /* arc length along a row as a function of X, tabulated (rows are steeper where the wave is steep) */
    const X0 = -(W + H), NX = Math.ceil(2 * (W + H)) + 2, arc = new Float32Array(NX); { let acc = 0; for (let i = 0; i < NX; i++) { const X = X0 + i, dp = A * 2 * Math.PI / lam * Math.cos(2 * Math.PI * X / lam); arc[i] = acc; acc += Math.sqrt(1 + dp * dp); } }
    const rowPhase = [], rowGain = [], rowSkew = [];
    for (let k = 0; k < 400; k++) { rowPhase.push(rnd() * pl); rowGain.push(.75 + rnd() * .5); rowSkew.push((rnd() - .5) * .6); }
    /* density of one row's dabs at (t across the row from its tip line, sArc along the row) */
    const flare = P.flare, floor = P.floor;
    const dab = (t, sArc, k, gain) => {
      if (t < -rd * 1.2 || t > Ld + 3 * u) return 0;
      const ph = rowPhase[k & 255], j = Math.floor((sArc - ph) / pl), w = sArc - ph - (j + .5) * pl;
      const dj = hashI(j, k, P.seed + 9), r = rd * (.85 + .3 * dj), tt = t - (hashI(j, k, P.seed + 10) - .5) * 4 * u + .1 * rd;
      /* the lobe: a disc of radius r whose center sits one radius into the row */
      const dq = Math.hypot(tt - r, w), lobe = sstep(r + 1.5 * u, r - 2.5 * u, dq) * (1 - .25 * sstep(0, r, dq));
      /* the tail: a stripe behind the lobe, as wide as the lobe, fading from the lobe's edge to the floor, widening by flare */
      const back = tt - 2 * r, wr = r * (1 + flare * Math.min(1, Math.max(0, back) / (Ld - 2 * r + 1e-3)));
      const tail = back > -r ? sstep(wr + 3 * u, wr - 3 * u, Math.abs(w)) * (1 - sstep(Ld - 8 * u, Ld + 3 * u, tt)) * Math.max(floor, .5 * Math.exp(-Math.max(0, back) / tau)) : 0;
      return gain * rmax * Math.max(lobe, tail) * (.75 + .5 * hashI(j, k, P.seed + 11));
    };
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, paper = C.paper;
    const INK = [paper, C.pale, C.light, C.mid, C.dark], cross = P.cross, ph0 = (P.phase || 0) * lam;
    /* ---- the density field at (x, y): dabs of the main sweep, of the crossing sweep, and the haze ---- */
    const field = (x, y, sgn, off) => {
      const X = (x * ct + y * st) * sgn + off + ph0, Y = -x * st + y * ct, wave = A * Math.sin(2 * Math.PI * X / lam), dp = A * 2 * Math.PI / lam * Math.cos(2 * Math.PI * X / lam), grad = Math.sqrt(1 + dp * dp);
      const phi = Y + wave + off * .37, k = Math.floor(phi / S), tpx = (phi - k * S) / grad, ai = X - X0, ii = ai | 0, sArc = ii >= 0 && ii < NX - 1 ? arc[ii] + (arc[ii + 1] - arc[ii]) * (ai - ii) : ai;
      const gk = ((k % G) + G) % G, gainK = gk >= G - gap ? .02 : rowGain[k & 255], gainP = (((k - 1) % G) + G) % G >= G - gap ? .02 : rowGain[(k - 1) & 255];
      return dab(tpx, sArc, k, gainK) + dab(tpx + S / grad, sArc, k - 1, gainP);
    };
    /* ---- measured transfer: tone -> share of each ink (paper, pale, light, mid, dark), read off the reference in 0.1 tone bins ---- */
    const TR = [[.93, .05, .015, .005, 0], [.841, .089, .047, .02, .004], [.62, .197, .114, .056, .013], [.398, .281, .189, .108, .025], [.192, .293, .265, .215, .035], [.083, .209, .273, .363, .073], [.032, .127, .206, .445, .191], [.011, .069, .156, .343, .421], [.001, .055, .111, .274, .559], [0, .03, .07, .2, .7], [0, 0, .03, .12, .85]];
    const shares = (T, out) => { const f = clamp(T, 0, 1) * 10, k = Math.min(9, f | 0), t = f - k, a = TR[k], b = TR[k + 1]; for (let i = 0; i < 5; i++) out[i] = a[i] + (b[i] - a[i]) * t; };
    /* ---- dither on the cell grid: whether a cell takes a dot is error-diffused (so dots space evenly); which ink it takes
            follows the measured shares for that tone. The cell image is then scaled up to the sheet with bilinear filtering,
            which is how the reference's 2 px dots and their soft fringes came about ---- */
    const R = new Float32Array(W * H), Gc = new Float32Array(W * H), B = new Float32Array(W * H);
    for (let i = 0; i < R.length; i++) { R[i] = paper[0]; Gc[i] = paper[1]; B[i] = paper[2]; }
    const hd = P.dot * u * .5;
    /* a dot is a square of side `dot` at a sub-pixel position; each pixel takes the overlap area as coverage */
    const splat = (cx, cy, ink) => {
      const x0 = Math.floor(cx - hd), x1 = Math.ceil(cx + hd), y0 = Math.floor(cy - hd), y1 = Math.ceil(cy + hd);
      for (let yy = y0; yy < y1; yy++) { if (yy < 0 || yy >= H) continue; const oy = Math.min(cy + hd, yy + 1) - Math.max(cy - hd, yy); if (oy <= 0) continue; for (let xx = x0; xx < x1; xx++) { if (xx < 0 || xx >= W) continue; const ox = Math.min(cx + hd, xx + 1) - Math.max(cx - hd, xx); if (ox <= 0) continue; const wgt = Math.min(1, ox * oy), i = yy * W + xx; R[i] += (ink[0] - R[i]) * wgt; Gc[i] += (ink[1] - Gc[i]) * wgt; B[i] += (ink[2] - B[i]) * wgt; } }
    };
    const g = P.cell * u, cw = Math.ceil(W / g), ch = Math.ceil(H / g), err = new Float32Array(cw + 2), nxt = new Float32Array(cw + 2), sh = new Float32Array(5), grain = P.grain;
    for (let cy = 0; cy < ch; cy++) {
      nxt.fill(0);
      const ltr = (cy & 1) === 0, py = (cy + .5) * g;
      for (let q = 0; q < cw; q++) {
        const cx = ltr ? q : cw - 1 - q, px = (cx + .5) * g;
        let rho = field(px, py, 1, 0);
        if (cross > 0) rho += cross * field(px, py, -1, 1000 * u);
        rho += rho0 * (.5 + nA(px / (60 * u), py / (60 * u)) + .8 * nB(px / (14 * u), py / (14 * u)));
        const T = (1 - Math.exp(-rho * .95)) * (1 + grain * (hashI(cx, cy, P.seed + 8) - .5) * .3);
        shares(T, sh);
        const want = 1 - sh[0] + err[cx + 1];                              /* chance of a dot in this cell, plus carried error */
        const put = want >= .5 ? 1 : 0, e = want - put;
        const dir = ltr ? 1 : -1; err[cx + 1 + dir] += e * 7 / 16; nxt[cx + 1 - dir] += e * 3 / 16; nxt[cx + 1] += e * 5 / 16; nxt[cx + 1 + dir] += e * 1 / 16;
        if (put) {
          const pick = hashI(cx, cy, P.seed + 4) * Math.max(1e-6, 1 - sh[0]); let acc = 0, ink = 4;
          for (let i = 1; i < 5; i++) { acc += sh[i]; if (pick < acc) { ink = i; break; } }
          const jx = (hashI(cx, cy, P.seed + 1) - .5) * .5 * g, jy = (hashI(cx, cy, P.seed + 2) - .5) * .5 * g;
          splat(px + jx, py + jy, INK[ink]);
        }
      }
      err.set(nxt);
    }
    for (let i = 0, j = 0; i < R.length; i++, j += 4) { d[j] = R[i]; d[j + 1] = Gc[i]; d[j + 2] = B[i]; d[j + 3] = 255; }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p12", no: "12", title: "Stipple Wave", ref: REF, render,
    line: "Rows of brush dabs along an S-wave, rendered only as dot density: dense rounded tips, fading tails, a haze between, every dot the same 2 px.",
    params: [
      { key: "wave", label: "Wave amplitude", min: 0, max: 400, step: 1, def: 140, unit: "px", group: "Flow", why: "How far the rows swing from side to side." },
      { key: "wavelength", label: "Wavelength", min: 200, max: 2000, step: 5, def: 1100, unit: "px", group: "Flow", why: "Length of one full S across the sheet." },
      { key: "tilt", label: "Tilt", min: -90, max: 90, step: .5, def: 62, unit: "°", group: "Flow", why: "Rotation of the whole flow." },
      { key: "rows", label: "Row spacing", min: 20, max: 120, step: .5, def: 50, unit: "px", group: "Flow", why: "Distance between rows of dabs; tails of one row reach into the next." },
      { key: "group", label: "Rows per sweep", min: 1, max: 8, step: 1, def: 4, unit: "", group: "Flow", why: "Inked rows in each sweep before the gap." },
      { key: "gap", label: "Gap rows", min: 0, max: 6, step: 1, def: 2, unit: "", group: "Flow", why: "Rows left almost empty after each sweep, which is the white between sweeps." },
      { key: "cross", label: "Crossing sweep", min: 0, max: 1.2, step: .01, def: .1, unit: "×", group: "Flow", why: "A second system of rows running the other way, laid under the first." },
      { key: "pitch", label: "Dab pitch", min: 8, max: 40, step: .5, def: 22, unit: "px", group: "Dabs", why: "Spacing of dabs along a row." },
      { key: "width", label: "Lobe radius", min: 3, max: 20, step: .1, def: 9, unit: "px", group: "Dabs", why: "Radius of each dab's solid lobe; the tail behind it is as wide." },
      { key: "length", label: "Dab length", min: 10, max: 120, step: .5, def: 62, unit: "px", group: "Dabs", why: "How far the tail runs before it ends." },
      { key: "flare", label: "Tail flare", min: 0, max: 2, step: .01, def: .8, unit: "×", group: "Dabs", why: "How much the tail widens along its length; at 1 it ends twice as wide as the tip." },
      { key: "floor", label: "Tail floor", min: 0, max: .5, step: .005, def: .08, unit: "", group: "Dabs", why: "Tone the tail never falls below, as a share of the lobe; it is what fills the band between lobes." },
      { key: "fade", label: "Tail fade", min: 4, max: 60, step: .5, def: 10, unit: "px", group: "Dabs", why: "Distance over which the density falls to a third of the tip." },
      { key: "tip", label: "Tip density", min: .1, max: 5, step: .01, def: 3, unit: "×", group: "Dabs", why: "Dots per pixel at the tip; above 1 the dots pile up into a solid." },
      { key: "haze", label: "Haze", min: 0, max: 4, step: .01, def: .4, unit: "×", group: "Dabs", why: "The thin even field of dots between the rows." },
      { key: "cell", label: "Dither cell", min: 1, max: 4, step: .05, def: 2, unit: "px", group: "Dots", why: "Pitch of the grid the tone is dithered on; dots cannot sit closer than this." },
      { key: "dot", label: "Dot size", min: 1, max: 5, step: .05, def: 2, unit: "px", group: "Dots", why: "Side of every square dot; the reference's cover a 2 × 2 px footprint." },
      { key: "grain", label: "Tone grain", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Dots", why: "Per-cell scatter of the tone before it picks an ink; 0 makes each tone a clean mix, 2 throws dark dots into the haze." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 3, unit: "", group: "Dots", why: "Re-rolls the dab jitter and the ink choice per dot." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop." }
    ],
    motion: [{ key: "phase", amp: 1, period: 24, mode: "saw" }, { key: "wave", amp: 30, period: 11, mode: "sine" }],
    live: { x: { key: "tilt", min: 20, max: 110 }, y: { key: "fade", min: 4, max: 30 } },
    presets: [
      { name: "Fine feather", set: { pitch: 10, width: 4.5, length: 30, fade: 10, rows: 32 } },
      { name: "Long tails", set: { length: 90, fade: 34, rows: 70, floor: .15 } },
      { name: "Straight rows", set: { wave: 0, tilt: 0, cross: 0, group: 1 } },
      { name: "Fog", set: { haze: 3.5, tip: 1, grain: 1.8, cross: 0 } }
    ],
    palettes: [
      { id: "measured", name: "Teal stipple", note: "measured", c: { paper: [240, 242, 241], pale: [156, 205, 206], light: [90, 152, 152], mid: [35, 107, 106], dark: [10, 53, 49] }, sw: ["#f0f2f1", "#9ccdce", "#5a9898", "#0a3531"] },
      { id: "vermilion", name: "Vermilion", c: { paper: [245, 245, 244], pale: [240, 170, 150], light: [225, 110, 90], mid: [170, 45, 40], dark: [90, 14, 20] }, sw: ["#f5f5f4", "#f0aa96", "#aa2d28", "#5a0e14"] },
      { id: "cobalt", name: "Cobalt", c: { paper: [242, 243, 246], pale: [170, 190, 240], light: [110, 140, 225], mid: [40, 70, 180], dark: [14, 24, 90] }, sw: ["#f2f3f6", "#aabef0", "#2846b4", "#0e185a"] },
      { id: "night", name: "Night", c: { paper: [14, 18, 22], pale: [30, 70, 72], light: [40, 120, 120], mid: [90, 200, 200], dark: [200, 250, 250] }, sw: ["#0e1216", "#1e4648", "#5ac8c8", "#c8fafa"] },
      { id: "violet", name: "Violet", c: { paper: [244, 243, 246], pale: [200, 180, 230], light: [160, 120, 210], mid: [100, 50, 160], dark: [40, 14, 80] }, sw: ["#f4f3f6", "#c8b4e6", "#6432a0", "#280e50"] },
      { id: "graphite", name: "Graphite", c: { paper: [243, 243, 243], pale: [190, 190, 194], light: [140, 140, 146], mid: [80, 80, 86], dark: [24, 24, 28] }, sw: ["#f3f3f3", "#bebec2", "#505056", "#18181c"] }
    ],
    bench: { palette: "measured", params: {}, note: "The sweep is generated, so the out rects for the dense tips, the tail field and the band edge were placed with search.py; the sparse field and the whole plate compare in place.", items: [
      { name: "dense tips", ref: [60, 560, 128, 96], out: [112, 608, 128, 96], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 6, inks: [[240, 242, 241], [156, 205, 206], [90, 152, 152], [35, 107, 106], [10, 53, 49]], inkNames: ["paper", "pale", "light", "mid", "dark"] },
      { name: "sparse field", ref: [0, 300, 192, 128], out: [0, 300, 192, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 4, inks: [[240, 242, 241], [156, 205, 206], [90, 152, 152], [35, 107, 106], [10, 53, 49]], inkNames: ["paper", "pale", "light", "mid", "dark"] },
      { name: "tail field", ref: [300, 180, 128, 128], out: [128, 544, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "share"], lags: 4, inks: [[240, 242, 241], [156, 205, 206], [90, 152, 152], [35, 107, 106], [10, 53, 49]], inkNames: ["paper", "pale", "light", "mid", "dark"] },
      { name: "band edge", ref: [40, 480, 192, 96], out: [208, 752, 192, 96], m: ["hist", "mean", "std", "share"], inks: [[240, 242, 241], [156, 205, 206], [90, 152, 152], [35, 107, 106], [10, 53, 49]], inkNames: ["paper", "pale", "light", "mid", "dark"] },
      { name: "whole plate", ref: [0, 0, 614, 1228], out: [0, 0, 614, 1228], m: ["hist", "mean", "std", "ink", "share"], inks: [[240, 242, 241], [156, 205, 206], [90, 152, 152], [35, 107, 106], [10, 53, 49]], inkNames: ["paper", "pale", "light", "mid", "dark"] }
    ] },
    passes: ["flow: a tilted sine wave; rows are its level sets, with arc length along each row tabulated so dab spacing holds around the bends", "dabs: on each row, a dab every pitch with a rounded tip of the dab's radius and a tail that fades exponentially and ends; every fourth row is thin, so rows read as sweeps", "a second, mirrored sweep system laid under the first", "haze: a thin even field between the rows, slightly clumped", "stipple: each pixel draws a dot with probability 1 - exp(-density); the dot lands at a hashed sub-pixel offset", "ink: dark or light by a chance that rises toward the tips; dots multiply into the paper, so overlaps go darker"],
    measured: { paper: [240, 242, 241], paper_std: .3, dot_footprint: "2 × 2 px bounding box for 39 of 51 area-4 dots in a sparse field; component area median 4", dot_mean_color: [134, 172, 173], dot_darkest_pixel_median: [79, 125, 128], dense_core_clusters: { darkest: [3, 46, 41], dark: [19, 89, 84], light: [110, 173, 171], pale: [184, 236, 235] }, dot_pixel_share: .41, row_spacing_px: { value: 48, method: "2-D autocorrelation peak of the smoothed darkness at r = 47.8 (top band) and 52 (lower band)" }, dab_pitch_px: 17, dab_width_px: 15, dab_length_px: 40, densest_24px_mean_L: 71, sparse_field_nn_spacing_px: 3.1 },
    limits: ["Under 98 %: the tone histograms of every patch (0.79 to 0.84) and the lag-1 autocorrelation of the dense patches. The reference was dithered at a finer cell and scaled up by a non-integer factor, which spreads every 2 px dot over partial pixels and flattens its histogram; the square-dot splat at a 2 px cell keeps the dot but not that flattening.", "The transfer table was read per pixel with a nearest-ink rule, so partial-coverage pixels of mid dots were counted as pale; the sparse field therefore carries more pale dots than the reference.", "The sweep is an original arrangement; the reference's rows are not traced."],
    source: "Reference 12: teal stipple print, 614 × 1228 px PNG (rows of brush dabs in S-curves).",
    study: {
      slug: "stipple-wave", lede: "A brush drawing where the brush was a dot: dense where the dab lands, thin where it lifts.",
      body: ["The reference is a stipple in two teal inks on a flat pale gray. There is no line and no fill in it; every tone is a count of two-pixel dots. The dots are laid in rows of brush dabs that follow an S-shaped sweep: each dab has a rounded tip where the dots pile up nearly solid, and a tail that thins out over about forty pixels until it dissolves into the haze between rows. The tails of one row reach the tips of the next, so the sheet reads as feathers or scales. Dark teal dots carry the tips; a lighter cyan dot is mixed in through the tails and the haze.", "The rebuild keeps that chain. One sine-wave flow sets the rows; dabs are placed along each row at a fixed pitch and described as a density field (tip radius, tail length, fade length). A second, mirrored sweep is laid under the first. Every pixel then draws a dot with a probability set by that density, at a hashed sub-pixel position, in the dark or light ink. The flow sliders bend the rows, the dab sliders reshape the feather, and the dot sliders change what a single dot is."],
      method: "Sine-wave flow · dab density field (tip, tail, fade) · haze · probabilistic 2 px stipple in two inks",
      points: [
        { u: .25, v: .48, d: "KEY", label: "A dab tip: dots pile up to nearly solid; the rounded edge is a density edge, not a drawn one.", t: "grain", dir: [0, 1] },
        { u: .4, v: .44, d: "READ", label: "The tail: the same dots, fewer of them, with the light ink mixed in as the dark thins out.", t: "tone", dir: [1, -1] },
        { u: .5, v: .5, d: "KEY", label: "Rows stacked: one row's tails reach the next row's tips, so the sheet reads as scales.", t: "pull", dir: [0, 1] },
        { u: .15, v: .25, d: "READ", label: "The haze between rows: an even sparse field, about a dot every six pixels.", t: "grain", dir: [0, 0] },
        { u: .7, v: .3, d: "READ", label: "The S-bend: dabs fan slightly on the outside of the curve because they are spaced by arc length.", t: "flow", dir: [1, 0] },
        { u: .6, v: .72, d: "READ", label: "A thin row: every fourth row is left faint, which is what groups the rows into sweeps.", t: "tone", dir: [0, 1] },
        { u: .8, v: .6, d: "READ", label: "Where the crossing sweep runs under the main one, the two dot fields simply add.", t: "pull", dir: [-1, 1] },
        { u: .3, v: .85, d: "KEY", label: "At 4x: every dot is the same two-pixel mark; overlaps multiply into the darkest teal.", t: "grain", dir: [0, 0] },
        { u: .9, v: .1, d: "READ", label: "Flat paper: no fiber, no tint; the only texture on the sheet is the dot.", t: "paper", dir: [0, 0] },
        { u: .5, v: .95, d: "READ", label: "Row ends at the sheet edge: the density field runs off the paper without a border.", t: "edge", dir: [0, 1] }
      ]
    }
  });
})();
