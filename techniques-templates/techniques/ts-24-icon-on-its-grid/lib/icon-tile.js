/* icon-tile · Tile and corner — TS-24 Mir on its icon grid · Techniques & Templates · ø co.
   Lifted from techniques/ts-24-icon-on-its-grid/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: A smoothed corner never runs past the middle of a side, so above a 25% radius the whole track maps onto the smaller range left (at 32%, up to 56%); the note on the sheet shows the smoothing drawn. The track follows a square root, so the first quarter already gives half the smoothing. */
export const id="icon-tile", name="Tile and corner", code="TS-24", entry="ts-24-icon-on-its-grid";
export const atoms=["rounded-rect","superellipse","continuous-curvature"];
export const spec={
  "id": "icon-tile",
  "short": "TILE",
  "name": "Tile and corner",
  "layer": 0,
  "pass": 0,
  "atoms": [
    "rounded-rect",
    "superellipse",
    "continuous-curvature"
  ],
  "params": {
    "tile": {
      "value": 3,
      "options": [
        {
          "v": 1,
          "label": "Accent"
        },
        {
          "v": 2,
          "label": "Deep"
        },
        {
          "v": 3,
          "label": "Light"
        },
        {
          "v": 4,
          "label": "Ink"
        }
      ],
      "label": "Tile",
      "note": "Tile ink, by role. Mir follows: ink line on accent and light, paper line on deep and ink; the cans keep the accent except on light, where Mir is line only."
    },
    "corner_pct": {
      "value": 22.4,
      "range": [
        10,
        32
      ],
      "unit": "%",
      "label": "Corner radius",
      "note": "Corner radius as a share of the tile side."
    },
    "smoothing": {
      "value": 0,
      "range": [
        0,
        100
      ],
      "unit": "%",
      "label": "Corner smoothing",
      "note": "0% is a circular arc; 100% is the most continuous curvature the radius allows; the track is front-loaded (square root), and the sheet shows the circular arc as a faint dashed ghost."
    }
  },
  "limits": "A smoothed corner never runs past the middle of a side, so above a 25% radius the whole track maps onto the smaller range left (at 32%, up to 56%); the note on the sheet shows the smoothing drawn. The track follows a square root, so the first quarter already gives half the smoothing.",
  "implementation": "Each corner is a circular arc of 90° × (1 − smoothing) between two cubic easings, the corner taking (1 + smoothing) × radius of each side (the Figma corner-smoothing construction)."
};
export const params={
  "tile": 3,
  "corner_pct": 22.4,
  "smoothing": 0
};
export const A={};

export const make=(P,u,A,V)=>{ const D=Math.PI/180;
      const R={ 1:{ tile:V.lime, line:V.ink, face:V.white, accent:V.lime, dark:false }, 2:{ tile:V.deep, line:V.paper, face:V.green, accent:V.lime, dark:true },
        3:{ tile:V.paper, line:V.ink, face:V.paper, accent:V.paper, dark:false }, 4:{ tile:V.ink, line:V.paper, face:V.ink, accent:V.lime, dark:true } }[P.tile]; R.shine=V.white;
      /* rounded square with smoothed corners at (x0, y0), side n */
      const smax=Math.min(1,Math.max(0,50/P.corner_pct-1)), sm=Math.sqrt(P.smoothing/100)*smax;
      const path=(x0,y0,n,s0)=>{ const r=P.corner_pct/100*n, s=s0===undefined?sm:s0, p=Math.min(n/2,(1+s)*r);
        const am=90*(1-s), al=Math.sin(am/2*D)*r*Math.SQRT2, ta=Math.tan((90-am)/4*D)*r, be=45*s*D, c=ta*Math.cos(be), d=c*Math.tan(be), b=(p-al-c-d)/3, a=2*b, f=v=>(+v).toFixed(3);
        const E=n-p, abc=a+b+c;
        return new Path2D(`M ${f(x0+E)} ${f(y0)} c ${f(a)} 0 ${f(a+b)} 0 ${f(abc)} ${f(d)} a ${f(r)} ${f(r)} 0 0 1 ${f(al)} ${f(al)} c ${f(d)} ${f(c)} ${f(d)} ${f(b+c)} ${f(d)} ${f(abc)} L ${f(x0+n)} ${f(y0+E)}`+
          ` c 0 ${f(a)} 0 ${f(a+b)} ${f(-d)} ${f(abc)} a ${f(r)} ${f(r)} 0 0 1 ${f(-al)} ${f(al)} c ${f(-c)} ${f(d)} ${f(-(b+c))} ${f(d)} ${f(-abc)} ${f(d)} L ${f(x0+p)} ${f(y0+n)}`+
          ` c ${f(-a)} 0 ${f(-(a+b))} 0 ${f(-abc)} ${f(-d)} a ${f(r)} ${f(r)} 0 0 1 ${f(-al)} ${f(-al)} c ${f(-d)} ${f(-c)} ${f(-d)} ${f(-(b+c))} ${f(-d)} ${f(-abc)} L ${f(x0)} ${f(y0+p)}`+
          ` c 0 ${f(-a)} 0 ${f(-(a+b))} ${f(d)} ${f(-abc)} a ${f(r)} ${f(r)} 0 0 1 ${f(al)} ${f(-al)} c ${f(c)} ${f(-d)} ${f(b+c)} ${f(-d)} ${f(abc)} ${f(-d)} Z`); };
      return { roles:R, path, pct:P.corner_pct, smooth:sm }; };
export default make;
