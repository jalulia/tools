/* shadow-crosshatch · Shadow crosshatch — TS-15 Banknote engraving · Techniques & Templates · ø co.
   Lifted from techniques/ts-15-banknote-engraving/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: start under ~0.35 puts hatch into the midtones and the picture reads as a net, not an engraving. */
export const id="shadow-crosshatch", name="Shadow crosshatch", code="TS-15", entry="ts-15-banknote-engraving";
export const atoms=["hatch","line-screen","threshold"];
export const spec={
  "id": "shadow-crosshatch",
  "short": "XHAT",
  "name": "Shadow crosshatch",
  "layer": 2,
  "pass": 4,
  "atoms": [
    "hatch",
    "line-screen",
    "threshold"
  ],
  "params": {
    "strength": {
      "value": 0.65,
      "range": [
        0,
        1
      ]
    },
    "angle_deg": {
      "value": 62,
      "range": [
        20,
        90
      ],
      "unit": "°",
      "note": "relative to the main lines"
    },
    "pitch_u": {
      "value": 6,
      "range": [
        2,
        14
      ],
      "unit": "u"
    },
    "start": {
      "value": 0.58,
      "range": [
        0.2,
        0.9
      ]
    },
    "full": {
      "value": 0.92,
      "range": [
        0.5,
        1
      ]
    },
    "duty_max": {
      "value": 0.62,
      "range": [
        0.2,
        0.9
      ]
    }
  },
  "limits": "start under ~0.35 puts hatch into the midtones and the picture reads as a net, not an engraving.",
  "implementation": "A second, unwarped line set whose width ramps from 0 at start to duty_max · strength at full darkness; the two sets are combined as 1 − (1−a)(1−b)."
};
export const params={
  "strength": 0.65,
  "angle_deg": 62,
  "pitch_u": 6,
  "start": 0.58,
  "full": 0.92,
  "duty_max": 0.62
};
export const A={};
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>{ const p=P.pitch_u*u, w=0.5*p*P.duty_max*P.strength; return { start:P.start, angle:P.angle_deg, p, cov:(s,dark)=>{ const k=A.sstep(P.start,P.full,dark); if(k<=0)return 0; const f=s-Math.floor(s); const c=w*k-Math.abs(f-0.5)*p+0.5; return c<=0?0:c>1?1:c; } }; };
export default make;
