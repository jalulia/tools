/* wedge-envelope · Wedge envelope — TS-22 Capsule rain system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: floor at 1 fills the frame and the wedge is gone. scatter above ~0.4 hides the wedge edge. */
export const id="wedge-envelope", name="Wedge envelope", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["envelope","ramp"];
export const spec={
  "id": "wedge-envelope",
  "short": "WEDG",
  "name": "Wedge envelope",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "envelope",
    "ramp"
  ],
  "params": {
    "anchor": "bottom",
    "power": {
      "value": 0.9,
      "range": [
        0.3,
        3
      ]
    },
    "floor": {
      "value": 0.04,
      "range": [
        0,
        1
      ],
      "note": "filled share of the height at t = 0"
    },
    "scatter": {
      "value": 0.2,
      "range": [
        0,
        0.6
      ],
      "note": "chance of a pill above the wedge, falling with distance"
    }
  },
  "limits": "floor at 1 fills the frame and the wedge is gone. scatter above ~0.4 hides the wedge edge.",
  "implementation": "The filled height is floor + (1 − floor)·t^power from the anchor side; a few pills are allowed past the edge."
};
export const params={
  "anchor": "bottom",
  "power": 0.9,
  "floor": 0.04,
  "scatter": 0.2
};
export const A={};

export const make=(P,u,A)=>({ top:t=>1-(P.floor+(1-P.floor)*Math.pow(t,P.power)), scatter:P.scatter });
export default make;
