/* tone-curve · Exposure and contrast — TS-15 Banknote engraving · Techniques & Templates · ø co.
   Lifted from techniques/ts-15-banknote-engraving/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   makeP=>{ const ev=Math.pow(2,P.exposure) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Contrast above ~2 clips most of the sheet to paper or solid line; the swelling line then reads as a two-level threshold. */
export const id="tone-curve", name="Exposure and contrast", code="TS-15", entry="ts-15-banknote-engraving";
export const atoms=["tone-curve","luminance"];
export const spec={
  "id": "tone-curve",
  "short": "TONE",
  "name": "Exposure and contrast",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "tone-curve",
    "luminance"
  ],
  "params": {
    "luminance": "0.2126 R + 0.7152 G + 0.0722 B",
    "exposure": {
      "value": 0.1,
      "range": [
        -1.5,
        1.5
      ],
      "unit": "stops"
    },
    "contrast": {
      "value": 1.25,
      "range": [
        0.5,
        2.5
      ]
    },
    "map": "clamp((L · 2^exposure − 0.5) · contrast + 0.5)"
  },
  "limits": "Contrast above ~2 clips most of the sheet to paper or solid line; the swelling line then reads as a two-level threshold.",
  "implementation": "Luminance is exposed and stretched about mid-gray before it sets any line width, so paper and solid shadow are reached inside the picture, not only at its extremes."
};
export const params={
  "luminance": "0.2126 R + 0.7152 G + 0.0722 B",
  "exposure": 0.1,
  "contrast": 1.25,
  "map": "clamp((L · 2^exposure − 0.5) · contrast + 0.5)"
};
export const A={};

export const make=P=>{ const ev=Math.pow(2,P.exposure), k=P.contrast; return { map:l=>{ const v=(l*ev-0.5)*k+0.5; return v<0?0:v>1?1:v; } }; };
export default make;
