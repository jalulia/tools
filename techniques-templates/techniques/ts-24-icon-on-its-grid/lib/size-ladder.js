/* size-ladder · Size ladder — TS-24 Mir on its icon grid · Techniques & Templates · ø co.
   Lifted from techniques/ts-24-icon-on-its-grid/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: The line is held under 0.24 of Mir’s radius at every size, so with a heavy line the compensation runs out early. Rungs keep their true relative sizes; the loupe is never under 2×. */
export const id="size-ladder", name="Size ladder", code="TS-24", entry="ts-24-icon-on-its-grid";
export const atoms=["optical-size","pixel-grid","hinting"];
export const spec={
  "id": "size-ladder",
  "short": "LADR",
  "name": "Size ladder",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "optical-size",
    "pixel-grid",
    "hinting"
  ],
  "params": {
    "optical": {
      "value": 80,
      "range": [
        0,
        120
      ],
      "unit": "%",
      "label": "Optical compensation",
      "note": "How much thicker the line gets at 40 px than plain scaling gives (less at larger sizes); 0% scales the line with the icon."
    },
    "snapping": {
      "value": 1,
      "options": [
        {
          "v": 1,
          "label": "Off"
        },
        {
          "v": 2,
          "label": "On"
        }
      ],
      "label": "Pixel snapping",
      "note": "On draws each size at its true pixel count with whole-pixel lines, and a loupe under the ladder shows the 40 px icon at a whole-number enlargement."
    },
    "sizes": [
      180,
      120,
      80,
      58,
      40
    ],
    "fold_min_px": 7.5,
    "cap": 0.24,
    "min_w": 0.56
  },
  "limits": "The line is held under 0.24 of Mir’s radius at every size, so with a heavy line the compensation runs out early. Rungs keep their true relative sizes; the loupe is never under 2×.",
  "implementation": "Each size keeps the same inked width share. line = weight × N / 1024 × (1 + c × (1024 / N − 1) / 24.6), held under 0.24 R; fold rows = ⌊dome height / max(2.8 × fold line, 7.5 px)⌋, held to 1–3."
};
export const params={
  "optical": 80,
  "snapping": 1,
  "sizes": [
    180,
    120,
    80,
    58,
    40
  ],
  "fold_min_px": 7.5,
  "cap": 0.24,
  "min_w": 0.56
};
export const A={};

export const make=(P,u,A)=>({ sizes:P.sizes, snap:P.snapping===2, c:P.optical/100,
      /* the icon at N px: line, fold line, fold rows, radius and center, inside an N × N tile */
      fit:(mir,N,safe,snap)=>{ const g3=mir.geom(3), b=g3.box, gw=b[1]-b[0], Wt=Math.max(mir.size*safe,P.min_w)*N, m=1+P.optical/100*(1024/N-1)/(1024/40-1);
        let w=Math.min(mir.line*N/1024*m, P.cap*Wt/(gw+P.cap)); if(snap)w=Math.max(1,Math.round(w)); let wf=0.55*w; if(snap)wf=Math.max(1,Math.round(wf));
        const R=(Wt-w)/gw, cap=R*(1-mir.sinB), rows=Math.max(1,Math.min(3,Math.floor(cap/Math.max(2.8*wf,P.fold_min_px))));
        let cx=N/2-R*(b[0]+b[1])/2, cy=N/2+R*(b[2]+b[3])/2; if(snap){ const o=w%2?0.5:0; cx=Math.round(cx-o)+o; cy=Math.round(cy-o)+o; }
        return { w, wf, R, rows, cx, cy, g:rows===3?g3:mir.geom(rows) }; } });
export default make;
