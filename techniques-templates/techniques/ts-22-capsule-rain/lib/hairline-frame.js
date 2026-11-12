/* hairline-frame · Hairline frame — TS-22 Capsule rain system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above ~3 u the frame competes with the capsules. */
export const id="hairline-frame", name="Hairline frame", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["rule","frame"];
export const spec={
  "id": "hairline-frame",
  "short": "FRAME",
  "name": "Hairline frame",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "rule",
    "frame"
  ],
  "params": {
    "line_u": {
      "value": 1.2,
      "range": [
        0.4,
        4
      ],
      "unit": "u"
    },
    "corner": "square"
  },
  "limits": "Above ~3 u the frame competes with the capsules.",
  "implementation": "A square-cornered rectangle stroked once over the clipped field."
};
export const params={
  "line_u": 1.2,
  "corner": "square"
};
export const A={};

export const make=(P,u,A)=>({ draw:(x,R,color)=>{ x.strokeStyle=color; x.lineWidth=P.line_u*u; x.strokeRect(R.x,R.y,R.w,R.h); }, line:P.line_u*u });
export default make;
