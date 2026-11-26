/* routes.js · four ways from the ST-22 coil to the mindgut wordmark.
   frame(route, t) → every sample's position, band direction, width, roundness and ink, plus camera, lights, spheres,
   and the value of each design axis at t. The same frame feeds the render, the orthographic map and the axis traces. */
"use strict";
const R = (() => {
  const { N, AX, wm, clamp, lerp, ss, ease, W0, letterOf } = G;
  const D2R = Math.PI / 180;
  const ph = t => 0.21 * t * 24 / 24;                   // coil phase while the route runs (ST-22 turns once in 24 s)
  const seg = (t, a, b) => ease(clamp((t - a) / (b - a), 0, 1));

  /* targets in stage units */
  const romanS = W0.roman.map(p => { const q = wm(p.x, p.y); return { x: q[0], y: q[1], w: p.w * G.WM.k, pen: p.pen }; });
  const scriptS = W0.script.map(p => { const q = wm(p.x, p.y); return { x: q[0], y: q[1], w: p.w * G.WM.k, pen: p.pen }; });
  const isTittle = W0.seg.map(s => s >= 23);
  /* g only: the roman pen path of the g (bowl, up, down and hook) resampled to N */
  const gOnly = (() => { const src = romanS.filter((p, i) => W0.seg[i] >= 12 && W0.seg[i] <= 14); const L = [0];
    for (let i = 1; i < src.length; i++) L.push(L[i - 1] + Math.hypot(src[i].x - src[i - 1].x, src[i].y - src[i - 1].y));
    const out = []; let j = 0; for (let i = 0; i < N; i++) { const s = i / (N - 1) * L[L.length - 1]; while (j < src.length - 2 && L[j + 1] < s) j++;
      const t = (s - L[j]) / ((L[j + 1] - L[j]) || 1e-6), a = src[j], b = src[j + 1]; out.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), pen: 1 }); }
    return out; })();
  let outlineS = null;
  const outline = () => outlineS || (outlineS = G.outline(window.MINDGUT_LOGO.d).map(p => { const q = wm(p.x, p.y); return { x: q[0], y: q[1], pen: p.pen, ring: p.ring, flip: p.flip }; }));

  const tan = (A, i) => { const a = A[Math.max(0, i - 2)], b = A[Math.min(A.length - 1, i + 2)]; let x = b.x - a.x, y = b.y - a.y; const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
  const norm3 = (x, y, z) => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
  /* band direction for a stroke in the picture plane: nib at a fixed angle (translation) or square to the path (monoline);
     the sign is chosen so the face looks at the viewer */
  const NIB = -32 * D2R;
  function planeB(T, mono) {
    const fx = Math.cos(NIB), fy = Math.sin(NIB), px = T[1], py = -T[0];
    let bx = lerp(fx, px, mono), by = lerp(fy, py, mono); if (Math.hypot(bx, by) < .2) { bx = px; by = py; }
    [bx, by] = norm3(bx, by, 0);
    if (bx * T[1] - by * T[0] < 0) { bx = -bx; by = -by; }       // N = b × T must point +z
    return [bx, by];
  }

  /* camera presets */
  const camFront = { az: 0, el: 0, persp: .4 };

  function blank(t) { return { t, s: new Array(N), cam: Object.assign({}, camFront), arcA: 1, sphA: 1, gridA: 1, markA: 0, markG: 0, ribA: 1, phase: ph(t * 8), spheres: null, tittleSphere: 0, axes: {} }; }

  /* ---------------- 01 · Write: the coil unwinds into a broad-nib script, the script stands up into the wordmark ---------------- */
  function write(t) {
    const F = blank(t), C = G.coil(F.phase).pts;
    const tu = clamp((t - .06) / .44, 0, 1), m = seg(t, .6, .84), mono = seg(t, .6, .8), flat = seg(t, .3, .55);
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1), u = ease(clamp((tu * 1.12 - s) / .12, 0, 1));
      const sc = scriptS[i], ro = romanS[i];
      const wx = lerp(sc.x, ro.x, m), wy = lerp(sc.y, ro.y, m);
      const nibW = 30 * G.WM.k * 1.25, ww = lerp(nibW, ro.w, m);
      const pen = lerp(sc.pen, ro.pen, ss(.6, .72, t));
      const Tw = tan(m < .5 ? scriptS : romanS, i);
      const [bx, by] = planeB(Tw, mono);
      const c = C[i], wz = 0;
      const bw = norm3(lerp(c.bx, bx, u), lerp(c.by, by, u) + (u > 0 && u < 1 ? .0001 : 0), lerp(c.bz, 0, u));
      F.s[i] = { x: lerp(c.x, wx, u), y: lerp(c.y, wy, u), z: lerp(c.z, wz, u) * (1 - flat * .0), w: lerp(c.w, ww, u), bx: bw[0], by: bw[1], bz: bw[2], r: 0, sh: u * lerp(.5, .85, m), a: lerp(1, pen, u) };
    }
    F.cam.persp = lerp(.4, 0, seg(t, .3, .6));
    F.arcA = 1 - seg(t, .08, .22); F.sphA = 1 - seg(t, .1, .28); F.gridA = 1 - seg(t, .7, .9) * .85;
    F.markA = seg(t, .84, .93); F.ribA = 1 - seg(t, .87, .95);
    F.axes = { COIL: 1000 * clamp(tu, 0, 1), NIBA: 1000 * mono, NIBR: 1000 * Math.min(1, tu * 1.4) * lerp(.5, .85, m), slnt: -14 * (1 - m) * Math.min(1, tu * 2), wght: lerp(620, 800, m), DPTH: 1000 * (1 - flat), cam: 0 };
    return F;
  }

  /* ---------------- 02 · Gut: the wordmark stands; the coil drops into the g and becomes it ---------------- */
  function gut(t) {
    const F = blank(t), sh = seg(t, .06, .4), C = G.coil(F.phase, { open: lerp(.9, .05, sh), pitch: lerp(.08, .028, sh), turns: lerp(1.85, 2.8, sh), band: lerp(.18, .085, sh) }).pts;
    const tu = clamp((t - .42) / .36, 0, 1), mono = seg(t, .5, .8);
    const gc = wm(658, 118), k = lerp(1, .3, sh), ox = lerp(AX.cx, gc[0], sh), oy = lerp(AX.cy, gc[1], sh);
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1), u = ease(clamp((tu - s * .5) / .5, 0, 1)), c = C[i], g = gOnly[i];
      const cx = ox + (c.x - AX.cx) * k, cy = oy + (c.y - AX.cy) * k, cz = c.z * k;
      const [bx, by] = planeB(tan(gOnly, i), mono);
      const bw = norm3(lerp(c.bx, bx, u), lerp(c.by, by, u), lerp(c.bz, 0, u));
      F.s[i] = { x: lerp(cx, g.x, u), y: lerp(cy, g.y, u), z: lerp(cz, 0, u), w: lerp(c.w * k, g.w, u), bx: bw[0], by: bw[1], bz: bw[2], r: 0, sh: .85 * u, a: 1 };
    }
    F.cam.persp = lerp(.4, .6, sh) * (1 - seg(t, .55, .8));
    F.arcA = 1 - seg(t, .06, .2); F.sphA = 1 - seg(t, .08, .24); F.gridA = 1 - seg(t, .3, .6) * .85;
    F.markG = seg(t, .2, .32); F.markA = seg(t, .82, .92); F.ribA = 1 - seg(t, .86, .94);
    F.axes = { COIL: 1000 * tu, NIBA: 1000 * mono, NIBR: 850 * tu, slnt: 0, wght: 800, DPTH: 1000 * (1 - seg(t, .45, .8)), cam: 0, GUT: 1000 * (1 - tu) };
    return F;
  }

  /* ---------------- 03 · Axis: look down the coil; the twelve spheres stack into one dot; turn back and the word is there ---------------- */
  function axis(t) {
    const F = blank(t), C = G.coil(F.phase).pts;
    const turn1 = seg(t, .05, .28), tu = clamp((t - .4) / .22, 0, 1), turn2 = seg(t, .62, .88);
    F.cam.az = 90 * turn1 * (1 - turn2);
    F.cam.el = -7 * Math.sin(Math.PI * clamp((t - .05) / .23, 0, 1)) - 7 * Math.sin(Math.PI * turn2);
    F.cam.persp = lerp(.4, .78, turn1) * (1 - turn2);
    const face = seg(t, .28, .4);
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1), u = ease(clamp((tu - s * .5) / .5, 0, 1)), c = C[i], ro = romanS[i];
      const [bx, by] = planeB(tan(romanS, i), 1);
      // while end-on, the band turns its face to the camera (b swings from the axis to the radial direction)
      const rad = norm3(0, c.y - AX.cy, c.z), b0 = norm3(lerp(c.bx, rad[0], face), lerp(c.by, rad[1], face), lerp(c.bz, rad[2], face));
      const bw = norm3(lerp(b0[0], bx, u), lerp(b0[1], by, u), lerp(b0[2], 0, u));
      F.s[i] = { x: lerp(c.x, ro.x, u), y: lerp(c.y, ro.y, u), z: lerp(c.z, 0, u), w: lerp(c.w * lerp(1, .42, face), ro.w, u), bx: bw[0], by: bw[1], bz: bw[2], r: 0, sh: .85 * u, a: lerp(1, ro.pen, u) * (isTittle[i] ? 0 : 1) };
    }
    F.arcA = 1 - seg(t, .1, .3); F.gridA = 1 - seg(t, .05, .2) * .9; F.sphA = 1;
    F.tittleSphere = seg(t, .64, .88);                  // the stacked spheres travel to the i and become its dot
    F.markA = seg(t, .88, .95); F.ribA = 1 - seg(t, .9, .96); F.sphFade = 1 - seg(t, .9, .96);
    F.axes = { COIL: 1000 * tu, NIBA: 1000, NIBR: 850 * tu, slnt: 0, wght: 800, DPTH: 1000 * (1 - tu), cam: F.cam.az };
    return F;
  }

  /* ---------------- 04 · Edge: the band runs the wordmark's own outline as its depth; turned to the front it goes edge-on ---------------- */
  function edge(t) {
    const F = blank(t), C = G.coil(F.phase).pts, O = outline();
    const tu = clamp((t - .06) / .4, 0, 1), sw = seg(t, .1, .45), back = seg(t, .72, .88);
    F.cam.az = lerp(0, 30, sw) * (1 - back) - 8 * Math.sin(Math.PI * clamp((t - .45) / .27, 0, 1)) * (1 - back);
    F.cam.el = lerp(0, -18, sw) * (1 - back); F.cam.persp = lerp(.4, .55, sw) * (1 - back);
    const D = 34;                                         // extrusion depth, stage px
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1), u = ease(clamp((tu - s * .5) / .5, 0, 1)), c = C[i], o = O[i];
      const bw = norm3(lerp(c.bx, 0, u), lerp(c.by, 0, u), lerp(c.bz, o.flip ? -1 : 1, u));
      F.s[i] = { x: lerp(c.x, o.x, u), y: lerp(c.y, o.y, u), z: lerp(c.z, -D / 2, u), w: lerp(c.w, D, u), bx: bw[0], by: bw[1], bz: bw[2], r: 0, a: lerp(1, o.pen, u) };
    }
    F.arcA = 1 - seg(t, .08, .22); F.sphA = 1 - seg(t, .1, .26); F.gridA = 1 - seg(t, .1, .4) * .9;
    F.faceA = seg(t, .3, .52) * (1 - seg(t, .86, .94)); F.faceZ = 0;
    F.markA = seg(t, .8, .9); F.ribA = 1 - seg(t, .86, .94);
    F.axes = { COIL: 1000 * tu, NIBA: 1000, NIBR: 0, slnt: 0, wght: 800, DPTH: 1000 * (1 - back), cam: F.cam.az, EXTR: 1000 * u1(tu) * (1 - back) };
    return F;
  }
  const u1 = x => x;

  const ROUTES = [
    { id: 'write', no: '01', name: 'Write', line: 'The coil unwinds into a broad-nib script, then the script stands up into the wordmark.', f: write, dur: 9, keys: [0, .18, .36, .56, .74, 1] },
    { id: 'gut', no: '02', name: 'Gut', line: 'The word is set. The coil drops into the g, which is already a tight loop opening into a long sweep.', f: gut, dur: 8, keys: [0, .22, .42, .58, .76, 1] },
    { id: 'axis', no: '03', name: 'Axis', line: 'Look down the coil: it closes to a ring and the twelve spheres stack into one dot. Turn back and that dot is the i.', f: axis, dur: 9, keys: [0, .18, .36, .56, .74, 1] },
    { id: 'edge', no: '04', name: 'Edge', line: 'The band runs the wordmark’s own outline as its depth. Turned to the front, it goes edge-on and the face is left.', f: edge, dur: 8, keys: [0, .2, .4, .6, .8, 1] }
  ];

  /* camera projection, shared by the render and the map */
  function project(p, cam, F) {
    const az = cam.az * D2R, el = cam.el * D2R, dx = p.x - AX.cx, dy = p.y - AX.cy, dz = p.z;
    const x1 = Math.cos(az) * dx + Math.sin(az) * dz, z1 = -Math.sin(az) * dx + Math.cos(az) * dz;
    const y2 = Math.cos(el) * dy - Math.sin(el) * z1, z2 = Math.sin(el) * dy + Math.cos(el) * z1;
    const k = cam.persp > .001 ? 1 / (1 - z2 / F) : 1;
    return [AX.cx + x1 * k, AX.cy + y2 * k, z2, k];
  }
  function rotate(v, cam) { const az = cam.az * D2R, el = cam.el * D2R; const x1 = Math.cos(az) * v[0] + Math.sin(az) * v[2], z1 = -Math.sin(az) * v[0] + Math.cos(az) * v[2];
    return [x1, Math.cos(el) * v[1] - Math.sin(el) * z1, Math.sin(el) * v[1] + Math.cos(el) * z1]; }
  const focal = cam => 297 * lerp(12, 2.2, clamp(cam.persp, 0, 1));

  return { ROUTES, project, rotate, focal, romanS, scriptS, gOnly, outline };
})();
