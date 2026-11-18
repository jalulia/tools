/* brush-line · Brush line — TS-23 Mir, turned · Techniques & Templates · ø co.
   Lifted from techniques/ts-23-mir-turned/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above 44 u the eye glint closes and the folds merge. Below 14 u the line no longer holds the flat fills. */
export const id="brush-line", name="Brush line", code="TS-23", entry="ts-23-mir-turned";
export const atoms=["stroke","round-cap","single-weight"];
export const spec={
  "id": "brush-line",
  "short": "LINE",
  "name": "Brush line",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "stroke",
    "round-cap",
    "single-weight"
  ],
  "params": {
    "weight_u": {
      "value": 30,
      "range": [
        14,
        44
      ],
      "unit": "u",
      "label": "Line weight",
      "note": "One weight for every outline, rim and band. Folds take 0.6 of it (never more than a third of the row spacing); the can gloss 0.45, always in the light ink."
    },
    "fold_share": 0.6,
    "gloss_share": 0.45
  },
  "limits": "Above 44 u the eye glint closes and the folds merge. Below 14 u the line no longer holds the flat fills.",
  "implementation": "Round-capped, round-joined strokes of one width over the fills; eyes and mouth are filled in the line color."
};
export const params={
  "weight_u": 30,
  "fold_share": 0.6,
  "gloss_share": 0.45
};
export const A={};

export const make=(P,u,A)=>({ w:P.weight_u*u, fold:P.fold_share, gloss:P.gloss_share,
      path:(x,pts,closed)=>{ x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]); if(closed)x.closePath(); },
      stroke:(x,pts,w,col,closed)=>{ if(pts.length<2)return; x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]); if(closed)x.closePath(); x.lineWidth=w; x.strokeStyle=col; x.lineCap='round'; x.lineJoin='round'; x.stroke(); } });
export default make;
