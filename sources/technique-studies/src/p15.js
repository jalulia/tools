/* ===== PLATE 15 · DITHERED CANDLE =====
   smooth gradient fields (a glow from each flame, a cylinder shading, a flame core) -> each field is a position
   along a short ramp of inks -> one jittered dot lattice plus fine grain decides, pixel by pixel, which of the two
   neighboring inks prints. Every tone in the picture is a mix of whole inks; nothing is blended. */
(function () {
  const REF = { w: 736, h: 1104 };
  function render(cv, P, pal, scale) {
    const s = scale || 1, W = Math.round(REF.w * s), H = Math.round(REF.h * s), u = s, C = pal.c;
    cv.width = W; cv.height = H;
    const rnd = mulberry(P.seed * 7001 + 11), nA = vnoise(P.seed + 23), nB = vnoise(P.seed + 77), ph = (P.phase || 0) * 2 * Math.PI;
    /* ---- subject: candles step right, down and nearer (larger); the nearer one stands in front ---- */
    const n = Math.max(1, Math.round(P.candles)), cands = [];
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / (n - 1) : .5, near = .8 + .45 * t;
      const r = W * .1975 * P.girth * near, cx = W * (.42 + P.spread * .25 * (t - .5) * 2 * (n > 1 ? 1 : 0)), top = H * (.598 + P.step * .082 * (t - .5) * 2 * (n > 1 ? 1 : 0)) + (rnd() - .5) * 6 * u;
      const fh = H * (.46 + .06 * t) * P.flame, fw = W * .125 * (1 + .15 * t) * P.flameW;
      cands.push({ cx, r, top, ry: r * P.tilt, fh, fw, wick: cx + r * (.08 + (rnd() - .5) * .1), ph: rnd() * 6.28 + i * 2.1, sgn: 1 - .3 * i });
    }
    const inks = [C.black, C.violet, C.lavender, C.lime, C.pink, C.white];   /* ramps index into this */
    const rampBg = [1, 2, 3], rampBody = [0, 1, 2, 3], rampPool = [1, 2, 3], rampFlame = [3, 2, 4, 5];
    const pitch = P.pitch * u, th = P.angle * Math.PI / 180, ca = Math.cos(th) / pitch, sa = Math.sin(th) / pitch, jit = P.jitter, fine = P.fine, span = P.span;
    const img = cv.getContext("2d").createImageData(W, H), d = img.data, FM = new Float32Array(W * H);
    /* flame: an S-curved tongue. t runs 0 at the wick to 1 at the tip; the centerline swings one way low and the other way high */
    const flameAt = (c, x, y) => {
      const t = (c.top - y) / c.fh;
      if (t < -.12 || t > 1.08 || Math.abs(x - c.wick) > c.fw * (2.2 + P.sway) + P.halo * 30 * u) return null;
      const tt = clamp(t, 0, 1), sw = c.fw * P.sway * (.9 * Math.sin(Math.PI * (tt * 1.45 - .15) + .35 * Math.sin(ph + c.ph) + .25 * ph * tt) * Math.pow(tt, 1.2) * c.sgn - .3 * tt * tt * tt);
      const prof = Math.sqrt(clamp((t + .12) / .2, 0, 1)) * (1 - Math.pow(sstep(.25, 1.02, t), .6)) * (1 + .08 * Math.sin(t * 9 + c.ph));
      const w = c.fw * prof, dx = x - c.wick - sw, ins = w > 0 ? 1 - Math.abs(dx) / w : -1;
      /* the core: a pink tongue in the lower half, split at its foot where the wick stands */
      const tc = (t + .03) / P.core, cw = c.fw * .74 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(tc - .42) / .58, 2.4)), .45), dxc = x - c.wick - sw;
      let core = cw > 0 && tc < 1.02 ? 1 - Math.abs(dxc) / cw : -1;
      const notch = (1 - sstep(0, .085, tc)) * c.fw * .14 - Math.abs(dxc); if (notch > 0) core = Math.min(core, -notch / (c.fw * .1));
      return { ins, out: (Math.abs(dx) - w), core, t };
    };
    /* the dither threshold: a jittered dot lattice (pitch per region) mixed with fine grain */
    const thrAt = (x, y, pf, fn) => { const cu = x * ca / pf + y * sa / pf, cvv = -x * sa / pf + y * ca / pf, ku = Math.round(cu), kv = Math.round(cvv); const fu = cu - ku - (hashI(ku, kv, P.seed + 1) - .5) * jit, fv = cvv - kv - (hashI(ku, kv, P.seed + 2) - .5) * jit; const spot = Math.min(1, Math.PI * (fu * fu + fv * fv)); return spot * (1 - fn) + hashI(x, y, P.seed + 3) * fn; };
    const gx = W * .42, gy = H * .5;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const j = (y * W + x) * 4;
        let ramp = rampBg, v = 0, pf = 1, fn = fine, sp = span;
        /* background: pale at the sheet's edge, a violet aura closes in around the candles, and each flame lights a rim of the aura */
        let lit = 0, fO = 1e9, fl = null, fr = null;
        /* the front-most flame that covers the pixel wins; outside every flame, the nearest one lights the rim */
        let hit = false;
        for (let i = n - 1; i >= 0; i--) { const c = cands[i], f = flameAt(c, x, y), fc = c.top - c.fh * .4, dd = Math.hypot((x - c.wick) * 1.1, (y - fc) * .75);
          lit += Math.exp(-dd / (P.glow * W));
          if (f && !hit && (f.out < 0 || f.core > 0)) { hit = true; fO = f.out; fl = f; fr = c; }
          else if (f && !hit && f.out < fO) { fO = f.out; fl = f; fr = c; } }
        const edge = Math.pow(Math.hypot((x - gx) / W, (y - gy) / H) * 2, 2), aura = Math.exp(-Math.pow(Math.hypot((x - gx) / (W * .5), (y - gy) / (H * 1.1)) / P.aura, 2));
        v = clamp(P.ambient + P.edgeLift * edge - P.auraDepth * aura + P.glowGain * lit + P.mottle * (nA(x / (80 * u), y / (80 * u)) - .5), 0, 2.2);
        if (fl && fO < 0) { /* inside a flame: ramp lime -> lavender -> pink -> white */ }
        else if (fl && fO < P.halo * 30 * u) v = Math.max(v, 1 + sstep(P.halo * 30 * u, 0, fO) * (1 - sstep(.75, 1.05, fl.t)));
        /* candle bodies, nearest last so it covers */
        let onBody = -1;
        for (let i = n - 1; i >= 0; i--) {
          const c = cands[i], dx = (x - c.cx) / c.r;
          if (Math.abs(dx) > 1.25) continue;
          const yr = c.top + c.ry * Math.sqrt(Math.max(0, 1 - dx * dx)), inPool = ((x - c.cx) / (c.r * P.poolW)) ** 2 + ((y - c.top) / (c.ry * P.poolW)) ** 2;
          if (inPool <= 1) { /* the pool: wax melted under the flame, lit lime at the middle, lavender at the lip; it spills a lit ring past the body */
            ramp = rampPool; pf = P.candlePitch; sp = span * .8; v = clamp(1.22 + 1.75 * P.poolLight * (1 - Math.pow(inPool, 1.6)), 0, 2.2); onBody = i; break; }
          if (Math.abs(dx) <= 1 && y > yr - 1) {
            ramp = rampBody; pf = P.candlePitch; fn = Math.min(1, fine * 1.6); sp = span * .75; onBody = i;
            /* the wall: lit from the flame above (falls with depth below the rim), a little from the side; the foot goes near-black toward the middle */
            const depth = (y - yr) / (H * .2 * P.fall), sideLit = .5 - .5 * dx * P.light, rimGlow = Math.exp(-(y - yr) / (c.r * .5));
            /* the nearest candle's foot sinks to near-black toward its middle; candles further back keep their violet */
            const nearK = n > 1 ? .35 + .65 * i / (n - 1) : 1;
            v = 1.0 + 1.1 * rimGlow * (1 - .3 * Math.abs(dx)) + .5 * (sideLit - .5) - 2.6 * nearK * sstep(.15, .75, depth) * (1 - .8 * Math.pow(Math.abs(dx), 2.2));
            /* the candle in front shades the one behind it near their overlap */
            for (let k = i + 1; k < n; k++) { const c2 = cands[k], ddx = (x - c2.cx) / c2.r; if (Math.abs(ddx) < 1.35 && y > c2.top - c2.ry * 2.5) v -= .45 * sstep(1.35, 1, Math.abs(ddx)) * sstep(c2.top - c2.ry * 2.5, c2.top, y); }
            v = clamp(v, -.6, 2.6); break;
          }
        }
        /* flames over everything */
        if (fl && (fO < 0 || fl.core > 0)) {
          ramp = rampFlame; pf = P.flamePitch ?? .35; fn = P.flameGrain; sp = 1.1; FM[y * W + x] = 1;
          const tipFade = sstep(.78, 1.05, fl.t);
          v = fl.core > 0 ? clamp(1.05 + .95 * Math.pow(sstep(0, .8, fl.core), 1.1) * P.heat + 1.2 * Math.max(0, P.heat - 1.1) * sstep(.5, .9, fl.core), 0, 3) : clamp(1.05 * sstep(-.45, .02, fl.core) * (1 - tipFade), 0, 1.05);
          if (fO > -2 * u && fl.core <= 0) v = Math.min(v, .4);
        }
        const thr = thrAt(x, y, pf, fn);
        const q = Math.round(v + (thr - .5) * sp);
        let pick = ramp[q < 0 ? 0 : q >= ramp.length ? ramp.length - 1 : q];
        /* in the aura the light dots are a pale lavender-white more often the deeper the violet: the light ink of a two-ink dither on a dark field */
        if (ramp === rampBg && pick === 2 && hashI(Math.round(x * ca + y * sa), Math.round(-x * sa + y * ca), P.seed + 9) < P.pale * clamp(1.4 - v, 0, 1)) pick = 5;
        const ink = inks[pick], iv = 1 + P.inkVar * 2 * (hashI(x, y, P.seed + 13) - .5);
        d[j] = ink[0] * iv; d[j + 1] = ink[1] * iv; d[j + 2] = ink[2] * iv; d[j + 3] = 255;
      }
    }
    {
      /* ink spread: the printed dots soften; the flame, printed as a near-continuous gradient, spreads further */
      const sg = Math.max(.05, (1 - P.sharp) * 1.6 * u), sf = P.flameSoft * u, Rc = new Float32Array(W * H), Gc = new Float32Array(W * H), Bc = new Float32Array(W * H);
      for (let i = 0, jj = 0; i < Rc.length; i++, jj += 4) { Rc[i] = d[jj]; Gc[i] = d[jj + 1]; Bc[i] = d[jj + 2]; }
      const R2 = gblur(Rc, W, H, sg), G2 = gblur(Gc, W, H, sg), B2 = gblur(Bc, W, H, sg), M = sf > .05 ? gblur(FM, W, H, 2 * u) : FM;
      const R3 = sf > .05 ? gblur(Rc, W, H, sf) : R2, G3 = sf > .05 ? gblur(Gc, W, H, sf) : G2, B3 = sf > .05 ? gblur(Bc, W, H, sf) : B2;
      for (let i = 0, jj = 0; i < Rc.length; i++, jj += 4) { const m = M[i]; d[jj] = R2[i] + (R3[i] - R2[i]) * m; d[jj + 1] = G2[i] + (G3[i] - G2[i]) * m; d[jj + 2] = B2[i] + (B3[i] - B2[i]) * m; }
    }
    cv.getContext("2d").putImageData(img, 0, 0);
  }
  PLATES.push({
    id: "p15", no: "15", title: "Dithered Candle", ref: REF, render,
    line: "Each flame lights its own wax pool and a rim of the violet aura around it; the light falls off down each candle wall to a near-black foot; every one of those fields is a position on a short ramp of inks, screened by one jittered dot lattice.",
    params: [
      { key: "pitch", label: "Dot pitch", min: 2.5, max: 12, step: .05, def: 5.7, unit: "px", group: "Screen", why: "Spacing of the dither lattice; the dots of the lower ink sit at its points." },
      { key: "angle", label: "Screen angle", min: -45, max: 45, step: .5, def: -21, unit: "°", group: "Screen", why: "Rotation of the lattice." },
      { key: "jitter", label: "Lattice jitter", min: 0, max: 1, step: .01, def: 0.35, unit: "cell", group: "Screen", why: "How far each lattice point is knocked off its grid; 0 is an ordered screen, 1 is a scatter." },
      { key: "span", label: "Dot span", min: .6, max: 4, step: .01, def: 2.6, unit: "inks", group: "Screen", why: "How many ramp steps one dot crosses from its center to its edge; above 1 a dot shows a ring of the middle ink." },
      { key: "candlePitch", label: "Candle pitch", min: .3, max: 1.5, step: .01, def: .72, unit: "× pitch", group: "Screen", why: "The candles were dithered on a finer lattice than the background; this is its pitch as a share of the background's." },
      { key: "flameGrain", label: "Flame grain", min: 0, max: 1, step: .01, def: 0.85, unit: "", group: "Screen", why: "Share of per-pixel noise in the flame threshold; the reference's flame shows no lattice at all." },
      { key: "flameSoft", label: "Flame spread", min: 0, max: 3, step: .01, def: 0.6, unit: "px", group: "Screen", why: "Extra ink spread inside the flames, where the reference prints a near-continuous gradient." },
      { key: "mottle", label: "Mottle", min: 0, max: .5, step: .01, def: .05, unit: "ramp", group: "Light", why: "Slow 80 px unevenness in the background tone." },
      { key: "fine", label: "Fine grain", min: 0, max: 1, step: .01, def: .1, unit: "", group: "Screen", why: "Share of the threshold taken from per-pixel noise instead of the lattice; 1 turns the screen into white-noise dither." },
      { key: "sharp", label: "Dot sharpness", min: .2, max: 1, step: .01, def: .6, unit: "", group: "Screen", why: "1 keeps every dot hard-edged; lower spreads the ink, as the printed reference does." },
      { key: "pale", label: "Pale dots", min: 0, max: 1, step: .01, def: 0.75, unit: "", group: "Screen", why: "Share of the light dots in the deep violet aura that print the pale white ink instead of lavender." },
      { key: "inkVar", label: "Ink variance", min: 0, max: .4, step: .005, def: 0.1, unit: "", group: "Screen", why: "Per-pixel variation of ink density, at 1 and 2 px: a printed ink is never one flat value." },
      { key: "ambient", label: "Sheet light", min: 0, max: 2, step: .01, def: 0.225, unit: "ramp", group: "Light", why: "Where the background sits on its violet-lavender-lime ramp with no subject near; 0 is solid violet." },
      { key: "edgeLift", label: "Edge lift", min: 0, max: 1.5, step: .01, def: 0.9, unit: "ramp", group: "Light", why: "How much paler the sheet prints toward its corners: the reference's corners sit near ramp 1.35, lime and lavender dots in equal parts." },
      { key: "aura", label: "Aura size", min: .1, max: 1, step: .01, def: 0.55, unit: "of sheet", group: "Light", why: "Radius of the violet aura that closes around the candles." },
      { key: "auraDepth", label: "Aura depth", min: 0, max: 1.5, step: .01, def: 0.95, unit: "ramp", group: "Light", why: "How far the aura pulls the background down toward violet." },
      { key: "glow", label: "Flame reach", min: .02, max: .5, step: .005, def: .09, unit: "of width", group: "Light", why: "Distance over which each flame's light lifts the aura around it." },
      { key: "glowGain", label: "Flame light", min: 0, max: 2, step: .01, def: 0.25, unit: "×", group: "Light", why: "How far up the ramp the flame's light pushes the aura near it." },
      { key: "halo", label: "Lit rim", min: 0, max: 3, step: .01, def: 0.6, unit: "×", group: "Light", why: "Width of the lavender rim the flame lights in the aura right around its edge: 30 px at 1." },
      { key: "heat", label: "Heat", min: .4, max: 1.6, step: .01, def: 0.75, unit: "×", group: "Light", why: "How far into the flame ramp the core goes; above 1.3 the core goes white." },
      { key: "poolLight", label: "Pool light", min: 0, max: 1, step: .01, def: .6, unit: "", group: "Light", why: "How much of the wax pool the flame lights to lime before its lip falls to lavender." },
      { key: "light", label: "Side light", min: -1, max: 1, step: .01, def: .4, unit: "", group: "Light", why: "Which side of each candle wall catches more light; 0 lights both sides alike." },
      { key: "fall", label: "Wall fall", min: .3, max: 3, step: .01, def: 1, unit: "×", group: "Light", why: "How far down the wall the flame's light reaches before the nearest candle's foot goes near-black: 220 px at 1." },
      { key: "candles", label: "Candles", min: 1, max: 4, step: 1, def: 2, unit: "", group: "Subject", why: "How many candles stand on the sheet; each one steps right, lower and nearer." },
      { key: "spread", label: "Spread", min: 0, max: 1.5, step: .01, def: 0.375, unit: "×", group: "Subject", why: "How far apart the candles stand across the sheet." },
      { key: "step", label: "Step down", min: -1, max: 1.5, step: .01, def: 1, unit: "×", group: "Subject", why: "How much lower each nearer candle's top sits: 180 px between the two at 1, as measured." },
      { key: "girth", label: "Girth", min: .5, max: 1.6, step: .01, def: 1, unit: "×", group: "Subject", why: "Radius of the candles." },
      { key: "tilt", label: "Top tilt", min: .1, max: .6, step: .005, def: 0.33, unit: "×", group: "Subject", why: "Short axis of each candle's top over its radius: how far the eye looks down onto the pools." },
      { key: "poolW", label: "Pool spill", min: .8, max: 1.4, step: .01, def: 1.12, unit: "×", group: "Subject", why: "Size of the lit pool against the candle's top; above 1 its light spills past the wall." },
      { key: "flame", label: "Flame height", min: .4, max: 1.6, step: .01, def: 1, unit: "×", group: "Subject", why: "Height of each flame: 500 and 590 px at 1, as measured from each pool to its tip." },
      { key: "flameW", label: "Flame width", min: .5, max: 1.6, step: .01, def: 1, unit: "×", group: "Subject", why: "Width of each flame's lime body." },
      { key: "core", label: "Core height", min: .3, max: .9, step: .01, def: 0.58, unit: "of flame", group: "Subject", why: "Height of the pink core inside the lime flame." },
      { key: "sway", label: "Sway", min: 0, max: 2, step: .01, def: 1, unit: "×", group: "Subject", why: "How far each flame's S-curve swings." },
      { key: "phase", label: "Phase", min: 0, max: 1, step: .001, def: 0, unit: "", group: "Motion", why: "Position along the loop: the flames sway through one cycle and their tips drift a quarter turn further." },
      { key: "seed", label: "Seed", min: 1, max: 999, step: 1, def: 5, unit: "", group: "Motion", why: "Re-rolls the lattice jitter and the flames' sway offsets." }
    ],
    motion: [{ key: "phase", amp: 1, period: 4, mode: "saw" }, { key: "heat", amp: .12, period: 1.7, mode: "drift" }],
    live: { x: { key: "light", min: -1, max: 1 }, y: { key: "glowGain", min: 0, max: 1.4 } },
    presets: [
      { name: "Coarse screen", set: { pitch: 10, jitter: .2, fine: 0, sharp: 1 } },
      { name: "Noise dither", set: { fine: 1, sharp: .9 } },
      { name: "Low light", set: { glowGain: .35, glow: .25, light: .2, fall: .5 } },
      { name: "Vigil", set: { candles: 4, girth: .7, flame: 1.3, sway: 1.6 } }
    ],
    palettes: [
      { id: "measured", name: "Violet lime", note: "measured", c: { black: [2, 2, 6], violet: [103, 79, 225], lavender: [187, 168, 253], lime: [194, 243, 133], pink: [225, 145, 254], white: [242, 237, 255] }, sw: ["#020206", "#674fe1", "#bba8fd", "#c2f385", "#e191fe"] },
      { id: "ember", name: "Ember", c: { black: [8, 4, 4], violet: [120, 30, 40], lavender: [220, 110, 70], lime: [255, 210, 90], pink: [255, 240, 170], white: [255, 255, 240] }, sw: ["#080404", "#781e28", "#dc6e46", "#ffd25a", "#fff0aa"] },
      { id: "cyan", name: "Cold cyan", c: { black: [4, 8, 16], violet: [20, 70, 150], lavender: [90, 170, 230], lime: [200, 250, 240], pink: [255, 255, 255], white: [255, 255, 255] }, sw: ["#040810", "#144696", "#5aaae6", "#c8faf0", "#ffffff"] },
      { id: "acid", name: "Acid", c: { black: [10, 10, 10], violet: [40, 60, 40], lavender: [60, 160, 60], lime: [220, 255, 40], pink: [255, 120, 200], white: [255, 240, 250] }, sw: ["#0a0a0a", "#283c28", "#3ca03c", "#dcff28", "#ff78c8"] },
      { id: "mono", name: "Graphite", c: { black: [0, 0, 0], violet: [70, 70, 76], lavender: [150, 150, 156], lime: [214, 214, 218], pink: [240, 240, 244], white: [255, 255, 255] }, sw: ["#000000", "#46464c", "#96969c", "#d6d6da", "#f0f0f4"] },
      { id: "rose", name: "Rose and teal", c: { black: [6, 10, 12], violet: [30, 90, 100], lavender: [120, 190, 190], lime: [250, 200, 200], pink: [255, 110, 150], white: [255, 240, 240] }, sw: ["#060a0c", "#1e5a64", "#78bebe", "#fac8c8", "#ff6e96"] }
    ],
    bench: { palette: "measured", params: {}, note: "The composition moved: the candles are now sized and placed from the reference's measured pools and flames, so the flame gradient, candle shadow and flame edge rects compare in place on the same events (the first build searched them). search.py found no better window for the flame and shadow rects.", items: [
      { name: "background", ref: [30, 30, 128, 128], out: [30, 30, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 6, inks: [[103, 79, 225], [187, 168, 253], [194, 243, 133]], inkNames: ["violet", "lavender", "lime"] },
      { name: "flame gradient", ref: [180, 300, 128, 128], out: [180, 300, 128, 128], m: ["hist", "mean", "std", "spec", "ink", "share"], inks: [[194, 243, 133], [187, 168, 253], [225, 145, 254], [242, 237, 255]], inkNames: ["lime", "lavender", "pink", "white"] },
      { name: "candle shadow", ref: [220, 800, 128, 128], out: [220, 800, 128, 128], m: ["hist", "mean", "std", "spec", "ac", "ink", "share"], lags: 6, inks: [[2, 2, 6], [103, 79, 225], [187, 168, 253]], inkNames: ["black", "violet", "lavender"] },
      { name: "flame edge", ref: [100, 150, 128, 96], out: [100, 150, 128, 96], m: ["hist", "mean", "std", "ink", "share"], inks: [[103, 79, 225], [187, 168, 253], [194, 243, 133], [225, 145, 254]], inkNames: ["violet", "lavender", "lime", "pink"] },
      { name: "whole plate", ref: [0, 0, 736, 1104], out: [0, 0, 736, 1104], m: ["hist", "mean", "ink", "share"], inks: [[2, 2, 6], [103, 79, 225], [187, 168, 253], [194, 243, 133], [225, 145, 254], [242, 237, 255]], inkNames: ["black", "violet", "lavender", "lime", "pink", "white"] }
    ] },
    passes: ["subject: two candles step right and 180 px lower, the nearer one drawn 1.5 times wider, so it stands in front; each top is an ellipse 0.27 of its radius tall", "the flames: each an S-curved tongue 500 to 590 px tall that swings one way low and the other high; inside it a pink core in the lower 58 %, its foot split by the wick", "light, from the flames outward: each flame lights its wax pool lime at the middle and lavender at the lip, and the pool's light spills past the wall; the flame lights a rim of the aura around itself; its light lifts the aura near it", "the aura: the background is pale at the sheet's corners and pulled down toward violet in a tall oval around the candles", "the walls: lit just under the rim, falling off down the wall; the nearest candle's foot sinks to near-black toward its middle while its sides keep violet; the front candle shades the one behind it near their overlap", "ramps: background violet, lavender, lime; walls black, violet, lavender, lime; pool violet, lavender, lime; flame lime, lavender, pink, white", "screen: one jittered dot lattice at 5.7 px and -21 degrees, finer on the candles and finer still in the flames; in the deep aura the light dots print the pale ink", "ink: 10 % per-pixel density variation, a 0.64 px spread, a 0.6 px extra spread inside the flames"],
    measured: { inks_p50_of_saturated_pixels: { lime: [194, 243, 133], violet: [103, 79, 225], lavender: [187, 168, 253], pink: [225, 145, 254], black: [1, 1, 4], white: [242, 237, 255] }, kmeans_7_clusters: [[196, 229, 147, .219], [139, 127, 203, .203], [191, 158, 247, .172], [88, 60, 216, .161], [204, 212, 218, .159], [4, 6, 14, .057]], background_screen: { pitch_px: 5.7, angle_deg: [69, -21], method: "2-D FFT peaks of a 128 px background patch" }, candle_screen: { pitch_px: [4.4, 3.6], method: "weak FFT peaks; a broad ring from 0.14 to 0.26 cycles per px" }, aura: { corner: [183, 193, 162], beside_flame: [114, 87, 235], method: "15 px box means along row 200 and column 650" }, pools: { back_top_y: 560, front_top_y: 740, color: [185, 245, 130], method: "lime runs in a 40 px grid of 9 px box means" }, front_foot: { y_920_to_1080: [9, 10, 12], sides_at_y_900: [104, 83, 233], method: "box means along x 300 and row 900" }, flame_tips_y: [55, 180], rejected: "flat cylinders with no top and a single glow per flame (the first build): the reference's tops are lit lime pools and its aura is deep violet near the candles, pale at the corners" },
    limits: ["Benchmark mean 0.905, lowest 0.66 (background texture spectrum). Under 98 % on: every tone histogram (0.67 to 0.84) and the flame patches' contrast (0.78 to 0.83). The reference is a soft JPEG whose dots were blended into continuous tones and whose chroma spreads each ink into a range; this engine prints whole inks with a 0.64 px spread and 10 % density variation, so its histogram keeps peaks where the reference's is smooth. The background spectrum misses because the reference lattice is regular enough to leave little energy below its own frequency; the jitter that makes the plate's screen read as hand-dithered at 3x adds that energy.", "The violet ink of the background and the flame edge measures (107,78,208) in the reference against (103,79,225) here: the reference's violet dots are softened toward the lime around them.", "The candles and flames are the plate's own construction: tops, pools and flame heights follow the reference's measured rows within 20 px; the flames' S-curves are drawn from a two-term sway, not traced.", "Render time 0.6 to 0.9 s on this machine depending on load."],
    source: "Reference 15: dithered gradient illustration of two candle flames, 736 × 1104 px JPEG.",
    study: {
      slug: "dithered-candle", lede: "Five inks and no blends: the flame lights the wax pool and the aura, and every gradient is a dot screen choosing between two neighboring inks.",
      body: ["The reference is a gradient illustration that was never allowed a blended pixel. Its palette is five inks, violet, lavender, lime, pink and near-black, with a pale white at the flame core and in the deep violet. The lighting has one source per candle. Each flame lights the wax pool under it, so the candle tops are lime pools with a lavender lip. Each flame lights a rim of lime in the aura around it, and the aura is deep violet near the candles and pale at the corners. The walls are lit just under the rim and fall away to a near-black foot on the nearer candle. The background lattice measures 5.7 px at -21 degrees; the candle dither is finer; the flame grain lies below the file's compression.", "The rebuild keeps the fields smooth and puts the texture in one screen. Pools, aura, walls and flames are continuous values on short ramps of inks; one jittered lattice, mixed with per-pixel grain, gives every pixel a threshold, and the fractional ramp position is tested against it. Pitch, angle, jitter and grain set the screen. Sheet light, edge lift, aura size and depth, flame reach and lit rim set the light outside the candles; pool light, side light and wall fall set the candles. Spread, step down, girth and tilt set the pair; flame height, width, core height and sway set the flames."],
      method: "Pool, aura, wall and flame fields lit from each flame · ink ramps · one jittered dot lattice with fine grain · ink spread",
      points: [
        { u: .52, v: .68, d: "KEY", label: "The front candle's pool: lime at the middle where the flame lights the wax, lavender at its lip, its light spilling past the wall.", t: "tone", dir: [0, 1] },
        { u: .26, v: .52, d: "KEY", label: "The back candle's pool, 180 px higher and partly behind the front flame.", t: "tone", dir: [0, -1] },
        { u: .55, v: .56, d: "KEY", label: "The front flame: a pink core in the lower 58 %, lavender at its edge, lime fringe, the wick splitting its foot.", t: "edge", dir: [0, 1] },
        { u: .42, v: .1, d: "READ", label: "A flame tip: the lime tongue swings one way low and the other way high.", t: "pull", dir: [0, -1] },
        { u: .72, v: .42, d: "READ", label: "The lit rim: lime in the aura for about 18 px around each flame, then the violet dots close in.", t: "pull", dir: [1, 0] },
        { u: .1, v: .4, d: "KEY", label: "Deep aura: violet with pale white dots on the 5.7 px lattice.", t: "grain", dir: [0, 0] },
        { u: .95, v: .05, d: "READ", label: "The corner: the sheet pales to lime and lavender dots in equal parts.", t: "tone", dir: [1, -1] },
        { u: .6, v: .9, d: "KEY", label: "The front foot: black dots thicken toward the middle until black is the field; the sides keep violet.", t: "grain", dir: [0, 1] },
        { u: .22, v: .62, d: "READ", label: "The back candle's wall beside the front one: shaded darker toward the overlap, no outline.", t: "edge", dir: [1, 0] },
        { u: .35, v: .75, d: "READ", label: "Under the rim: the wall is lit lavender and falls to violet within half a radius.", t: "tone", dir: [0, 1] }
      ]
    }
  });
})();
