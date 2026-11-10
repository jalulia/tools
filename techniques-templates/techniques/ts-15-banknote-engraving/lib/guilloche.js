/* guilloche · Guilloche in upper smooth regions — TS-15 Banknote engraving · Techniques & Templates · ø co.
   Lifted from techniques/ts-15-banknote-engraving/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: curvature above ~3 makes the wave steeper than the antialiasing estimate holds; pitch near the main pitch makes the hand-over at upper_v invisible. */
export const id="guilloche", name="Guilloche in upper smooth regions", code="TS-15", entry="ts-15-banknote-engraving";
export const atoms=["guilloche","sine-line","mask"];
export const spec={
  "id": "guilloche",
  "short": "GUIL",
  "name": "Guilloche in upper smooth regions",
  "layer": 2,
  "pass": 5,
  "atoms": [
    "guilloche",
    "sine-line",
    "mask"
  ],
  "params": {
    "strength": {
      "value": 0.69,
      "range": [
        0,
        1
      ]
    },
    "upper_v": {
      "value": 0.4,
      "range": [
        0,
        1
      ]
    },
    "feather_v": {
      "value": 0.07,
      "range": [
        0.01,
        0.3
      ]
    },
    "scale_u": {
      "value": 103,
      "range": [
        30,
        400
      ],
      "unit": "u"
    },
    "curvature": {
      "value": 1.55,
      "range": [
        0.2,
        4
      ],
      "note": "max slope of the wave; amplitude = curvature · scale / 2π"
    },
    "pitch_u": {
      "value": 10,
      "range": [
        2.5,
        20
      ],
      "unit": "u"
    },
    "duty": {
      "value": 0.17,
      "range": [
        0.08,
        0.6
      ]
    },
    "tone": {
      "value": 0.7,
      "range": [
        0,
        1.5
      ],
      "note": "how much darkness thickens the guilloche line"
    },
    "drift": {
      "value": 0.9,
      "range": [
        0,
        3
      ],
      "note": "phase wander of family A down the sheet"
    },
    "smooth_lo": {
      "value": 0.1,
      "range": [
        0,
        0.5
      ]
    },
    "smooth_hi": {
      "value": 0.3,
      "range": [
        0.1,
        1
      ]
    },
    "shear": {
      "value": 0.37,
      "range": [
        0,
        1
      ],
      "note": "family B phase advance per unit y, in units of 2π/S — tilts the braid so it does not stripe"
    },
    "lines": "A: y + a·sin(2πx/S + drift·sin(2πy/2.3S)) = k·pitch;  B: y − a·sin(2πx/S + shear·2πy/S + 1.1) = k·pitch"
  },
  "limits": "curvature above ~3 makes the wave steeper than the antialiasing estimate holds; pitch near the main pitch makes the hand-over at upper_v invisible.",
  "implementation": "Two families of stacked sine lines, mirrored, give the braided cells. Vertical distance is divided by √(1 + slope²) so line width stays even on the steep parts. The mask is (above upper_v) × (edge energy low); the straight lines fade by the same mask."
};
export const params={
  "strength": 0.69,
  "upper_v": 0.4,
  "feather_v": 0.07,
  "scale_u": 103,
  "curvature": 1.55,
  "pitch_u": 10,
  "duty": 0.17,
  "tone": 0.7,
  "drift": 0.9,
  "smooth_lo": 0.1,
  "smooth_hi": 0.3,
  "shear": 0.37,
  "lines": "A: y + a·sin(2πx/S + drift·sin(2πy/2.3S)) = k·pitch;  B: y − a·sin(2πx/S + shear·2πy/S + 1.1) = k·pitch"
};
export const A={};
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>{ const S=P.scale_u*u, k=6.2832/S, a=P.curvature/k, p=P.pitch_u*u, hw=0.5*p*P.duty*(0.45+0.8*P.strength);
      return { mask:(v,edge)=>P.strength<=0?0:(1-A.sstep(P.upper_v-P.feather_v,P.upper_v+P.feather_v,v))*(1-A.sstep(P.smooth_lo,P.smooth_hi,edge)),
        cov:(x,y,dark)=>{ const w=hw*(0.55+P.tone*dark); const ph=k*x+P.drift*Math.sin(k*y/2.3); const pb=k*x+P.shear*k*y+1.1; const sA=(y+a*Math.sin(ph))/p, sB=(y-a*Math.sin(pb))/p; const mA=a*k*Math.cos(ph), mB=a*k*Math.cos(pb);
          const dA=Math.abs(sA-Math.floor(sA)-0.5)*p/Math.sqrt(1+mA*mA), dB=Math.abs(sB-Math.floor(sB)-0.5)*p/Math.sqrt(1+mB*mB); const cA=A.clamp(w-dA+0.5,0,1), cB=A.clamp(w-dB+0.5,0,1); return 1-(1-cA)*(1-cB); } }; };
export default make;
