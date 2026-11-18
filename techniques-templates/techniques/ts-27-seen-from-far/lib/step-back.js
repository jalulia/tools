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
        0.12,
        0.15,
        0.2,
        0.25,
        0.3,
        0.35,
        0.4,
        0.45,
        0.5,
        0.6,
        0.7,
        0.75,
        0.8,
        0.9,
        1
      ],
      [
        0,
        0.075,
        0.115,
        0.1387,
        0.1629,
        0.195,
        0.2303,
        0.259,
        0.2858,
        0.3164,
        0.3696,
        0.4439,
        0.4613,
        0.4883,
        0.6101,
        1
      ]
    ],
    "stages": "on the slider: trees leave one by one 0.6–12.5 %; the outer 2 % band leaves at 13–15 %; then, on the inner track (the slider maps 25 → 16 %, 50 → 37 %, 75 → 46 %, 90 → 61 %): cells cut from the painting 1.5–7 % · cell pitch 2.4 u → far pitch on a log curve · cells part to show paper 8–42 % · empty ground clears behind a front that starts as the plate edge and shrinks to a circle 9–64 %, paced by cleared area · grown cells take the record 56–92 % by density · on the slider, the line comes in over 42–60 % and holds full contrast above"
  },
  "limits": "Steps back from the clearing: the trees go first, then the painting is cut into cells that part to paper and take the record’s dots.",
  "implementation": "Distance sets the cell pitch, how far the cells part, and when each cell trades the painting for the record. A dot that still shows the painting shows the painting’s own pixels, so the plate is never a blurred copy; a cell with more growth trades later, so the empty ground clears first and the ring stays to the end. Trees go first: each leaves whole, canopy and shadow, one after another from the plate edge inward over 0.6–12.5 % of the slider, and the front starts after the last one, leaving all four sides of the plate together."
};
export const params={
  "distance": 100,
  "pitch_near_u": 2.4,
  "remap": [
    [
      0,
      0.12,
      0.15,
      0.2,
      0.25,
      0.3,
      0.35,
      0.4,
      0.45,
      0.5,
      0.6,
      0.7,
      0.75,
      0.8,
      0.9,
      1
    ],
    [
      0,
      0.075,
      0.115,
      0.1387,
      0.1629,
      0.195,
      0.2303,
      0.259,
      0.2858,
      0.3164,
      0.3696,
      0.4439,
      0.4613,
      0.4883,
      0.6101,
      1
    ]
  ],
  "stages": "on the slider: trees leave one by one 0.6–12.5 %; the outer 2 % band leaves at 13–15 %; then, on the inner track (the slider maps 25 → 16 %, 50 → 37 %, 75 → 46 %, 90 → 61 %): cells cut from the painting 1.5–7 % · cell pitch 2.4 u → far pitch on a log curve · cells part to show paper 8–42 % · empty ground clears behind a front that starts as the plate edge and shrinks to a circle 9–64 %, paced by cleared area · grown cells take the record 56–92 % by density · on the slider, the line comes in over 42–60 % and holds full contrast above"
};
export const A={};
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
export const make=(P,u,A)=>{ const D=A.clamp(P.distance/100,0,1), p0=P.pitch_near_u;
      /* the slider is remapped onto the track so that equal travel gives an equal change in the plate (measured as mean color change on a 96 px copy) */
      const KD=P.remap[0], KS=P.remap[1]; let k=1; while(k<KD.length-1&&D>KD[k])k++; const s=KS[k-1]+(KS[k]-KS[k-1])*(D-KD[k-1])/(KD[k]-KD[k-1]);
      return { s, D, paintOnly:s<0.015, done:s>=0.985, part:A.sstep(0.08,0.50,s), line:A.sstep(0.42,0.60,D), near:1-A.sstep(0.10,0.35,s),
        /* cell pitch in u for a far pitch pf: 2.4 u at the near end, on a log curve to pf */
        pitch:pf=>{ const a=Math.min(pf,p0), w=Math.pow(A.clamp((s-0.015)/0.985,0,1),0.85); return a*Math.pow(pf/a,w); },
        /* when a cell trades the painting for the record. Empty ground clears behind a front that starts as the plate's own edge and shrinks to a circle (fr is the
           share of the plate already behind the front, see front()), so it leaves all four sides together and the paper grows evenly (9 → 64 %); cells that grew
           trade later, the densest last (56 → 92 %). The outer 2 % band (the first 15 % of the area) leaves almost at once, so the edge is inside the plate from the start. nd is a smooth noise in −1…1 that roughens both; on empty ground it only bites inward and is held back at the plate edge, so the edge never reaches back to the frame */
        center:(rec,nd,fr)=>{ const g=fr<=0.15?0.13*fr:0.0195+0.9805*Math.pow((fr-0.15)/0.85,0.85), cg=0.09+0.55*g-0.06*A.sstep(0.12,0.25,fr)*(1-nd)/2, cr=0.56+0.36*Math.pow(rec,0.7)+0.03*nd; return cg+(cr-cg)*A.sstep(0.05,0.35,rec); },
        /* w is the half-width of a cell's hand-off: 0.04 in general, 0.012 for the outer band so it leaves in one short step */
        take:(c,w)=>A.sstep(c-(w||0.04),c+(w||0.04),s), tint:(c,w)=>A.sstep(c-0.5*(w||0.04),c+2*(w||0.04),s) }; };
export default make;
