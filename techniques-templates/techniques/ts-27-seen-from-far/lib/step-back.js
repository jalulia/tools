/* step-back · Distance — TS-27 Seen from far · Techniques & Templates · ø co.
   Lifted from techniques/ts-27-seen-from-far/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Steps back from the clearing: the trees go first, then the painting is cut into cells that part to paper and take the record’s dots. */
export const id="step-back", name="Distance", code="TS-27", entry="ts-27-seen-from-far";
export const atoms=["cell-mosaic","handoff","screen-growth"];
export const spec={
  "id": "step-back",
  "short": "DIST",
  "name": "Distance",
  "layer": 0,
  "pass": 0,
  "atoms": [
    "cell-mosaic",
    "handoff",
    "screen-growth"
  ],
  "params": {
    "distance": {
      "value": 100,
      "range": [
        0,
        100
      ],
      "step": 1,
      "unit": "%",
      "label": "Distance",
      "note": "0 % up close, 100 % from far"
    },
    "pitch_near_u": 2.4,
    "remap": [
      [
        0,
        0.1,
        0.25,
        0.4,
        0.5,
        0.6,
        0.75,
        0.9,
        1
      ],
      [
        0,
        0.156,
        0.263,
        0.353,
        0.412,
        0.439,
        0.491,
        0.665,
        1
      ]
    ],
    "stages": "on the inner track (the slider maps 25 → 24 %, 50 → 40 %, 75 → 50 %, 90 → 63 %): cells cut from the painting 1.5–7 % · cell pitch 2.4 u → far pitch on a log curve · cells part to show paper 8–42 % · empty ground clears from the corners inward 2–64 %, paced by cleared area · grown cells take the record 56–92 % by density · on the slider, the line comes in over 42–60 % and holds full contrast above"
  },
  "limits": "Steps back from the clearing: the trees go first, then the painting is cut into cells that part to paper and take the record’s dots.",
  "implementation": "Distance sets the cell pitch, how far the cells part, and when each cell trades the painting for the record. A dot that still shows the painting shows the painting’s own pixels, so the plate is never a blurred copy; a cell with more growth trades later, so the empty ground clears first and the ring stays to the end. Trees go first: each leaves whole, canopy and shadow, one after another from the plate edge inward over 0.4–2.8 % of the slider, and the front starts after the last one."
};
export const params={
  "distance": 100,
  "pitch_near_u": 2.4,
  "remap": [
    [
      0,
      0.1,
      0.25,
      0.4,
      0.5,
      0.6,
      0.75,
      0.9,
      1
    ],
    [
      0,
      0.156,
      0.263,
      0.353,
      0.412,
      0.439,
      0.491,
      0.665,
      1
    ]
  ],
  "stages": "on the inner track (the slider maps 25 → 24 %, 50 → 40 %, 75 → 50 %, 90 → 63 %): cells cut from the painting 1.5–7 % · cell pitch 2.4 u → far pitch on a log curve · cells part to show paper 8–42 % · empty ground clears from the corners inward 2–64 %, paced by cleared area · grown cells take the record 56–92 % by density · on the slider, the line comes in over 42–60 % and holds full contrast above"
};
export const A={};
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
export const make=(P,u,A)=>{ const D=A.clamp(P.distance/100,0,1), p0=P.pitch_near_u;
      /* the slider is remapped onto the track so that equal travel gives an equal change in the plate (measured as mean color change on a 96 px copy) */
      const KD=P.remap[0], KS=P.remap[1]; let k=1; while(k<KD.length-1&&D>KD[k])k++; const s=KS[k-1]+(KS[k]-KS[k-1])*(D-KD[k-1])/(KD[k]-KD[k-1]);
      /* plate area (1000 × 1000 u) outside a circle of radius r about the center */
      const out=r=>{ if(r<=500)return 1e6-Math.PI*r*r; if(r>=707.1)return 0; const h=Math.sqrt(r*r-250000); return 1e6-(Math.PI*r*r-4*(r*r*Math.acos(500/r)-500*h)); };
      return { s, D, paintOnly:s<0.015, done:s>=0.985, part:A.sstep(0.08,0.50,s), line:A.sstep(0.42,0.60,D), near:1-A.sstep(0.10,0.35,s),
        /* cell pitch in u for a far pitch pf: 2.4 u at the near end, on a log curve to pf */
        pitch:pf=>{ const a=Math.min(pf,p0), w=Math.pow(A.clamp((s-0.015)/0.985,0,1),0.85); return a*Math.pow(pf/a,w); },
        /* when a cell trades the painting for the record. Empty ground clears as a front from the corners inward, paced by the share of the plate it has cleared,
           so the paper grows evenly (2 → 64 %); cells that grew trade later, the densest last (56 → 92 %). nd is a smooth noise in −1…1 that roughens both */
        center:(rec,nd,r)=>{ const cg=Math.max(0.09,0.09+0.55*Math.pow(A.clamp(out(r)/out(330),0,1),0.7)+0.03*nd), cr=0.56+0.36*Math.pow(rec,0.7)+0.03*nd; return cg+(cr-cg)*A.sstep(0.05,0.35,rec); },
        take:c=>A.sstep(c-0.04,c+0.04,s), tint:c=>A.sstep(c-0.02,c+0.08,s) }; };
export default make;
