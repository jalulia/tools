/* ink-bands · Ink bands on the axis — TS-22 Capsule system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: width above ~0.35 mixes all five inks everywhere. Under ~0.05 the inks meet in hard stripes. */
export const id="ink-bands", name="Ink bands on the axis", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["palette-field","overprint","multiply"];
export const spec={
  "id": "ink-bands",
  "short": "INK",
  "name": "Ink bands on the axis",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "palette-field",
    "overprint",
    "multiply"
  ],
  "params": {
    "centers": [
      0.16,
      0.36,
      0.54,
      0.72,
      0.9
    ],
    "offset": {
      "value": 0,
      "range": [
        -1,
        1
      ],
      "note": "slides the bands along the axis"
    },
    "width": {
      "value": 0.17,
      "range": [
        0.03,
        0.5
      ],
      "note": "gaussian width of each band in t"
    },
    "blend": "multiply"
  },
  "limits": "width above ~0.35 mixes all five inks everywhere. Under ~0.05 the inks meet in hard stripes.",
  "implementation": "A capsule draws its ink from five gaussian bands along t. Each ink has its own layer; the layers are composited with the variant’s blend."
};
export const params={
  "centers": [
    0.16,
    0.36,
    0.54,
    0.72,
    0.9
  ],
  "offset": 0,
  "width": 0.17,
  "blend": "multiply"
};
export const A={};

export const make=(P,u,A,V)=>({ blend:V.blend||P.blend, pick:(t0,k)=>{ const t=((t0+P.offset)%1+1)%1; let s=0; const w=P.centers.map(c=>{ const d=(t-c)/P.width; const v=Math.exp(-d*d); s+=v; return v; }); let a=k*s; for(let i=0;i<w.length;i++){ a-=w[i]; if(a<=0)return i; } return w.length-1; } });
export default make;
