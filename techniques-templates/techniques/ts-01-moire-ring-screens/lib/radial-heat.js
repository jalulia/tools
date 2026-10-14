/* radial-heat · Radial red core — TS-01 Moiré from two ring screens · Techniques & Templates · ø co.
   Lifted from techniques/ts-01-moire-ring-screens/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: gain above ~2 saturates the core to a flat disc; sigma above ~700 u floods the sheet and the blue lattice no longer reads through. */
export const id="radial-heat", name="Radial red core", code="TS-01", entry="ts-01-moire-ring-screens";
export const atoms=["radial","falloff"];
export const spec={
  "id": "radial-heat",
  "short": "HEAT",
  "name": "Radial red core",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "radial",
    "falloff"
  ],
  "params": {
    "center_u": [
      440,
      640
    ],
    "sigma_u": {
      "value": 330,
      "range": [
        80,
        900
      ],
      "unit": "u"
    },
    "gain": {
      "value": 1.35,
      "range": [
        0.5,
        3
      ]
    },
    "red_coverage": "min(1, gain·exp(−d²/σ²))",
    "cutoff": {
      "value": 0.02,
      "range": [
        0,
        0.2
      ],
      "note": "red coverage below this prints nothing"
    }
  },
  "limits": "gain above ~2 saturates the core to a flat disc; sigma above ~700 u floods the sheet and the blue lattice no longer reads through.",
  "implementation": "Red coverage is a clipped gaussian of distance from the core; inside it the blue lattice overprints as a lighter pink, which is how the rings read through the red."
};
export const params={
  "center_u": [
    440,
    640
  ],
  "sigma_u": 330,
  "gain": 1.35,
  "red_coverage": "min(1, gain·exp(−d²/σ²))",
  "cutoff": 0.02
};
export const A={};

export const make=(P,u)=>{ const cx=P.center_u[0]*u, cy=P.center_u[1]*u, sig=P.sigma_u*u, gain=P.gain; return { cx, cy, cutoff:P.cutoff, cov:d=>Math.min(1,gain*Math.exp(-(d*d)/(sig*sig))) }; };
export default make;
