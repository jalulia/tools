// FLOYD-STEINBERG, and why it is not a shader.
//
// Every pixel is quantized, its error measured, and that error handed forward
// to neighbours that have not been decided yet — 7/16 right, then 3/16, 5/16,
// 1/16 on the row below. The loop cannot be reordered and it cannot be run in
// parallel: pixel n+1 is not answerable until pixel n has been answered.
// That is the exact property a fragment shader is defined not to have, which is
// why this example is in the other lane rather than in GLSL with a trick.
//
// The pay-off is that nothing tiles. There is no matrix, so there is no weave,
// and the error is settled locally instead of being spread by a pattern.

const levels = Math.max(2, Math.round(p.levels || 4));
const amount = Math.min(1, Math.max(0, p.dither == null ? 1 : p.dither));
const cell   = Math.max(1, Math.round(p.pitch || 2));

// ---- the source: drawn here, so no asset ships ----
const g = ctx.createLinearGradient(0, 0, W, 0);
g.addColorStop(0.00, '#141821');
g.addColorStop(0.55, '#8d8577');
g.addColorStop(1.00, '#f2ece0');
ctx.fillStyle = g;
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = 'rgba(255,255,255,0.55)';
ctx.beginPath(); ctx.arc(W * 0.30, H * 0.42, Math.min(W, H) * 0.26, 0, 7); ctx.fill();
ctx.fillStyle = 'rgba(10,10,12,0.75)';
ctx.fillRect(W * 0.62, H * 0.20, W * 0.22, H * 0.60);

// ---- one serial pass ----
// Worked at 1/cell resolution so the result is legible at any DPR: the dot is a
// decision about the output device, not about the buffer that happens to exist.
const w = Math.max(1, Math.floor(W / cell)), h = Math.max(1, Math.floor(H / cell));
const src = ctx.getImageData(0, 0, W, H);
const buf = new Float32Array(w * h);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = ((y * cell) * W + x * cell) * 4;
    buf[y * w + x] = (0.2125 * src.data[o] + 0.7154 * src.data[o + 1] + 0.0721 * src.data[o + 2]) / 255;
  }
}

const step = levels - 1;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const old = buf[i];
    const q = Math.round(old * step) / step;
    buf[i] = q;
    const err = (old - q) * amount;
    if (x + 1 < w)                buf[i + 1]         += err * 7 / 16;
    if (x > 0     && y + 1 < h)   buf[i + w - 1]     += err * 3 / 16;
    if (             y + 1 < h)   buf[i + w]         += err * 5 / 16;
    if (x + 1 < w && y + 1 < h)   buf[i + w + 1]     += err * 1 / 16;
  }
}

// ---- paint the decided values back, one cell to one cell ----
// Written into a w x h buffer and blown up with smoothing off, rather than
// w*h fillRect calls: at 1440 with DPR 2 that would be half a million draw
// calls for a picture that is painted once.
const out = ctx.createImageData(w, h);
for (let i = 0; i < w * h; i++) {
  const v = Math.round(lib.clamp(buf[i], 0, 1) * 255);
  out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = v;
  out.data[i * 4 + 3] = 255;
}
const off = document.createElement('canvas');
off.width = w; off.height = h;
off.getContext('2d').putImageData(out, 0, 0);
ctx.imageSmoothingEnabled = false;
ctx.clearRect(0, 0, W, H);
ctx.drawImage(off, 0, 0, w, h, 0, 0, w * cell, h * cell);
