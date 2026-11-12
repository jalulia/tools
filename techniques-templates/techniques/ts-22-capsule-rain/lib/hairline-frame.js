/* hairline-frame · Hairline frame — TS-22 Capsule system · Techniques & Templates · ø co.
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
  "layer": 4,
  "pass": 4,
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
    "corner": "square, or the clip shape"
  },
  "limits": "Above ~3 u the frame competes with the capsules.",
  "implementation": "The clip path of a panel is stroked once over the field."
};
export const params={
  "line_u": 1.2,
  "corner": "square, or the clip shape"
};
export const A={};

export const make=(P,u,A)=>({ line:P.line_u*u, path:(x,path,color)=>{ path(x); x.strokeStyle=color; x.lineWidth=P.line_u*u; x.stroke(); } });
export default make;
