/* Register · preview — the real instrument, not a lookalike.
 *
 * pipeline.worker.js and plates.js are copied verbatim out of the h-figures build, so what
 * you see here is what h-specimens will draw. analyse() below reproduces the host page's
 * sizing rule exactly, including the cap that quietly limits a small source: a 304 px
 * reference cannot be analysed at 840 px however high `scale` is set, and the readout says so.
 */

let worker = null, jobId = 0;
const jobs = new Map();
export const timings = [];

function boot() {
  if (worker) return worker;
  worker = new Worker(new URL('./pipeline.worker.js', import.meta.url));
  worker.onmessage = e => {
    const j = jobs.get(e.data.id); if (!j) return;
    jobs.delete(e.data.id);
    if (e.data.ok) j.res(e.data); else { j.err(new Error(e.data.err || 'pipeline failed')); }
  };
  worker.onerror = e => { for (const [, j] of jobs) j.err(new Error(e.message)); jobs.clear(); };
  return worker;
}

/** the host page's own sizing: portrait 560, landscape 700, × scale, capped at a small source */
export function analysisSize(img, P) {
  const [cx0, cy0, cx1, cy1] = P.crop || [0, 0, 1, 1];
  const sw = img.naturalWidth * (cx1 - cx0), sh = img.naturalHeight * (cy1 - cy0);
  const ar = sh / sw;
  let tw = ar > 1 ? 560 : 700;
  tw = Math.round(tw * (P.scale || 1));
  const capped = sw < 600 && tw > Math.round(sw);
  if (sw < 600) tw = Math.min(tw, Math.round(sw));
  return { tw, th: Math.round(tw * ar), capped, sourceW: Math.round(sw) };
}

export async function analyse(img, P) {
  const { tw, th } = analysisSize(img, P);
  const [cx0, cy0, cx1, cy1] = P.crop || [0, 0, 1, 1];
  const sw = img.naturalWidth * (cx1 - cx0), sh = img.naturalHeight * (cy1 - cy0);
  const c = document.createElement('canvas'); c.width = tw; c.height = th;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, img.naturalWidth * cx0, img.naturalHeight * cy0, sw, sh, 0, 0, tw, th);
  let d;
  try { d = x.getImageData(0, 0, tw, th).data; }
  catch (err) { throw new Error('the source is not readable (CORS) — re-upload it'); }
  const id = ++jobId, rgba = new Uint8ClampedArray(d.buffer), t0 = performance.now();
  boot();
  return new Promise((res, err) => {
    jobs.set(id, {
      res: r => { timings.push({ ms: Math.round(performance.now() - t0), w: tw, h: th, timings: r.timings });
                  if (timings.length > 40) timings.shift(); res(r); },
      err,
    });
    worker.postMessage({ id, rgba, W: tw, H: th, P: Object.assign({}, P, { trackers: undefined }), quick: false }, [rgba.buffer]);
  });
}

/** drive FigRaster.plates() to completion in slices so the tool stays responsive.
 *  Deliberately NOT requestAnimationFrame: it stops firing the moment the tab is hidden,
 *  which left a preview stuck on "reading…" if you switched away mid-raster — and checking
 *  document.hidden at schedule time doesn't help, because the tab can be hidden after the
 *  frame is requested. A MessageChannel macrotask still yields to paint and always fires. */
function slices() {
  const mc = typeof MessageChannel !== 'undefined' ? new MessageChannel() : null;
  let queued = null;
  if (mc) mc.port1.onmessage = () => { const f = queued; queued = null; if (f) f(); };
  return fn => {
    if (mc) { queued = fn; mc.port2.postMessage(0); return; }
    setTimeout(fn, 0);
  };
}

export async function raster(data, P, core, W, H, dpr = 2) {
  const R = window.FigRaster;
  if (!R) throw new Error('plates.js did not load');
  const gen = R.plates(data, P, core, { x: 0, y: 0, w: W, h: H }, dpr);
  const next = slices();
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const step = () => {
      try {
        const t0 = performance.now();
        for (;;) {
          const n = gen.next();
          if (n.done) { resolve(n.value); return; }
          // past 20 s something is wrong; finish in one go rather than never finishing
          if (performance.now() - started > 20000) continue;
          if (performance.now() - t0 > 10) break;
        }
      } catch (e) { reject(e); return; }
      next(step);
    };
    step();
  });
}

export function lastTiming() { return timings.length ? timings[timings.length - 1] : null; }
export function summary(t) {
  if (!t) return '';
  const g = t.timings || {};
  const part = k => (g[k] == null ? '' : `${k} ${Math.round(g[k])}`);
  return `${t.w}×${t.h} · ${t.ms} ms · ` + ['luma', 'mask', 'etf', 'fdog', 'trace', 'hatch', 'spot']
    .map(part).filter(Boolean).join(' · ');
}
