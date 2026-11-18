/* ground-inks · Ground and inks — TS-23 Mir, turned · Techniques & Templates · ø co.
   Lifted from techniques/ts-23-mir-turned/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: The accent is never a line color. On the deep ground the face takes the second green so the head still reads as a volume. */
export const id="ground-inks", name="Ground and inks", code="TS-23", entry="ts-23-mir-turned";
export const atoms=["ground","palette","brand-rule"];
export const spec={
  "id": "ground-inks",
  "short": "GND",
  "name": "Ground and inks",
  "layer": 0,
  "pass": 0,
  "atoms": [
    "ground",
    "palette",
    "brand-rule"
  ],
  "params": {
    "ground": {
      "value": 1,
      "options": [
        {
          "v": 1,
          "label": "Light"
        },
        {
          "v": 2,
          "label": "Accent"
        },
        {
          "v": 3,
          "label": "Deep"
        }
      ],
      "label": "Ground",
      "note": "The sheet, by role. The line follows it: deep on light, ink on accent, paper on deep."
    }
  },
  "limits": "The accent is never a line color. On the deep ground the face takes the second green so the head still reads as a volume.",
  "implementation": "One switch picks five roles from the palette: sheet, line, face, accent and the one-ink color for Mono, Engraved and Pencil."
};
export const params={
  "ground": 1
};
export const A={};

export const make=(P,u,A,V)=>{ const g=P.ground===2?'lime':(P.ground===3?'forest':'white');
      const R={ white:{ stock:V.white, line:V.deep, face:V.white, accent:V.lime, mono:V.ink, engr:V.deep, pencil:V.graphite },
        lime:{ stock:V.lime, line:V.ink, face:V.white, accent:V.lime, mono:V.ink, engr:V.ink, pencil:V.graphite },
        forest:{ stock:V.deep, line:V.paper, face:V.green, accent:V.lime, mono:V.paper, engr:V.paper, pencil:V.paper } };
      return { ground:g, roles:R[g] }; };
export default make;
