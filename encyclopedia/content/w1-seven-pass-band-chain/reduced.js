/* THE REDUCTION. The same bands, the same ridges, the same drift, the same
   colours — with passes 1, 2, 4 and 6 deleted. What is left is the fill, the
   crisp edge, the catch-light and the paper.

   This is here because "seven passes" is not automatically a virtue and the
   removal test has to be able to come back with a yes. Look at the two side by
   side and the honest verdict is: the reduction is a good picture. It is
   cut-paper rather than watercolour — cleaner, flatter, and about a different
   material. What it cannot do is hold a band that is BOTH pale and textured,
   because the wash and the granulation were the two passes carrying pigment
   density independently of tone.

   So the seven survive, and they survive as four-plus-three rather than as
   seven equals seven: the wash, the granulation and the pooling are one job
   done at three scales, and if a budget ever demanded it, that is where the
   argument would start. */

const BANDS   = Math.max(3, Math.round(p.bands   == null ? 6    : p.bands));
const EDGE    = lib.clamp(p.edge    == null ? 0.65 : p.edge, 0, 1.2);
const JOURNEY = lib.clamp(p.journey == null ? 0.28 : p.journey, 0, 1);

// Far to near. t = 0 is the FURTHEST band, so the ramp starts pale and warm —
// aerial perspective, which is why the catch-light below has to lift by a
// fraction of the remaining headroom rather than by a fixed amount.
// OKLab, not sRGB: a straight channel lerp goes grey through the middle of a
// ramp like this one (the fault the port used to carry — see critique). OKLab
// is the space the original (Ki-Landscapes) actually blends in; the five
// anchors and the picture they make are unchanged, only where they are mixed.
function s2lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function lin2s(c) { c = lib.clamp(c, 0, 1); return Math.round((c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255); }
function rgbToOklab(c) {
  const r = s2lin(c[0]), g = s2lin(c[1]), b = s2lin(c[2]);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
          1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
          0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function oklabToRgb(lab) {
  const l = Math.pow(lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2], 3);
  const m = Math.pow(lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2], 3);
  const s = Math.pow(lab[0] - 0.0894841775 * lab[1] - 1.2914855480 * lab[2], 3);
  return [
    lin2s(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    lin2s(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    lin2s(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
  ];
}
const PAL = [[206, 198, 176], [166, 164, 146], [116, 122, 112], [70, 82, 82], [30, 38, 48]];
const PAL_LAB = PAL.map(rgbToOklab);
function bandColour(t) {                       // OKLab lerp along the ramp
  const u = lib.clamp(t, 0, 1) * (PAL_LAB.length - 1);
  const i = Math.min(PAL_LAB.length - 2, Math.floor(u)), f = u - i;
  const lab = [0, 1, 2].map(k => lib.lerp(PAL_LAB[i][k], PAL_LAB[i + 1][k], f));
  return oklabToRgb(lab);
}
const rgb   = c => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
const shade = (c, k) => c.map(v => Math.round(lib.clamp(v * k, 0, 255)));
const lift  = (c, k) => c.map(v => Math.round(v + (255 - v) * k));

const grain = lib.grainTile();

const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
sky.addColorStop(0, 'rgb(226,222,206)');
sky.addColorStop(1, 'rgb(238,228,206)');
ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

const PTS = 220;

for (let i = 0; i < BANDS; i++) {
  const t     = BANDS === 1 ? 1 : i / (BANDS - 1);
  const mid   = bandColour(t);
  const drift = JOURNEY * (0.12 + 0.9 * t) * W / lib.lerp(0.8, 2.4, t);

  const wave = lib.fbm1D(1000 + i * 97, 5, 4, 0.55);
  const base = lib.lerp(H * 0.30, H * 0.88, t);
  const amp  = H * (0.045 + 0.10 * t);
  const ys   = [];
  for (let k = 0; k <= PTS; k++) ys.push(base - amp * wave(k / PTS * 1.4 + drift / W * 0.6));
  const top = Math.min.apply(null, ys);

  const trace = () => {
    ctx.beginPath(); ctx.moveTo(0, ys[0]);
    for (let k = 1; k <= PTS; k++) {
      const x0 = (k - 1) / PTS * W, x1 = k / PTS * W;
      ctx.quadraticCurveTo(x0, ys[k - 1], (x0 + x1) / 2, (ys[k - 1] + ys[k]) / 2);
    }
  };

  ctx.save();
  trace(); ctx.lineTo(W, ys[PTS]); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.clip();

  const g = ctx.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, rgb(lift(mid, 0.12)));
  g.addColorStop(1, rgb(shade(mid, 0.82)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // PASS 3 — the crisp edge
  ctx.save();
  trace();
  ctx.strokeStyle = 'rgba(' + shade(mid, 0.55).join(',') + ',' +
                    lib.clamp(0.46 - 0.28 * EDGE, 0.10, 0.46).toFixed(3) + ')';
  ctx.lineWidth = Math.max(1, H * 0.0018);
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // PASS 5 — the catch-light
  {
    const lr = Math.max(2, Math.ceil(H * (0.014 + 0.030 * EDGE)));
    const ls = document.createElement('canvas'); ls.width = 1; ls.height = lr;
    const lx = ls.getContext('2d'), lgr = lx.createLinearGradient(0, 0, 0, lr);
    const lc = lift(mid, 0.30);
    lgr.addColorStop(0, 'rgba(' + lc.join(',') + ',' + (0.45 * (0.55 + 0.45 * t)).toFixed(3) + ')');
    lgr.addColorStop(1, 'rgba(' + lc.join(',') + ',0)');
    lx.fillStyle = lgr; lx.fillRect(0, 0, 1, lr);
    for (let x = 0; x < W; x += 2) {
      const fx = x / W * PTS, i0 = Math.floor(fx), f = fx - i0;
      const cy = ys[i0] + (ys[Math.min(PTS, i0 + 1)] - ys[i0]) * f;
      ctx.drawImage(ls, x, cy, 2, lr);
    }
  }

  // PASS 7 — the paper
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.42;
  const gw = grain.width, gh = grain.height;
  const gx0 = ((i * 53 + drift) % gw + gw) % gw, gy0 = (i * 97) % gh;
  for (let gx = -gx0; gx < W; gx += gw) {
    for (let gy = -gy0 + Math.floor((top + gy0) / gh) * gh; gy < H; gy += gh) {
      ctx.drawImage(grain, gx, gy);
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

  ctx.restore();
}

const vg = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.3, W / 2, H * 0.5, W * 0.8);
vg.addColorStop(0, 'rgba(0,0,0,0)');
vg.addColorStop(1, 'rgba(20,14,8,0.10)');
ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
