/* moire-product · Grating product (moiré) — TS-01 Moiré from two ring screens · Techniques & Templates · ø co.
   Lifted from techniques/ts-01-moire-ring-screens/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: knee_lo ≥ knee_hi inverts the smoothstep. gamma below ~0.8 fills the lattice to a flat tint; above ~2.5 the dots shrink to specks. */
export const id="moire-product", name="Grating product (moiré)", code="TS-01", entry="ts-01-moire-ring-screens";
export const atoms=["moire","interference"];
export const spec={
  "id": "moire-product",
  "short": "MOIR",
  "name": "Grating product (moiré)",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "moire",
    "interference"
  ],
  "params": {
    "blue_coverage": "floor + (1−floor)·smoothstep(knee_lo, knee_hi, (gA·gB)^gamma)",
    "beat_pitch_u": "1/(1/60−1/68) ≈ 510",
    "knee_lo": {
      "value": 0.1,
      "range": [
        0,
        0.5
      ]
    },
    "knee_hi": {
      "value": 0.75,
      "range": [
        0.5,
        1
      ]
    },
    "gamma": {
      "value": 1.4,
      "range": [
        0.5,
        3
      ]
    }
  },
  "limits": "knee_lo ≥ knee_hi inverts the smoothstep. gamma below ~0.8 fills the lattice to a flat tint; above ~2.5 the dots shrink to specks.",
  "implementation": "Multiplying the two gratings gives a dot lattice where both are high and long beat fringes where their phases drift; nothing is drawn as a dot — the lattice is the product."
};
export const params={
  "blue_coverage": "floor + (1−floor)·smoothstep(knee_lo, knee_hi, (gA·gB)^gamma)",
  "beat_pitch_u": "1/(1/60−1/68) ≈ 510",
  "knee_lo": 0.1,
  "knee_hi": 0.75,
  "gamma": 1.4
};
export const A={};
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,A)=>({ prod:(gA,gB)=>A.sstep(P.knee_lo,P.knee_hi,Math.pow(gA*gB,P.gamma)), coverage:(prod,floor)=>floor+(1-floor)*prod });
export default make;
