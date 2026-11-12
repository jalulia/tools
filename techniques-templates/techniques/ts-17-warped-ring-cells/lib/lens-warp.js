/* lens-warp · Pinch lens — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: k below about −0.6 folds the grid over itself inside the sheet. k above ~3 stretches the outer cells past the sheet and they read as bars. */
export const id="lens-warp", name="Pinch lens", code="TS-17", entry="ts-17-warped-ring-cells";
export const atoms=["domain-warp","radial","lens"];
export const spec={
  "id": "lens-warp",
  "short": "WARP",
  "name": "Pinch lens",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "domain-warp",
    "radial",
    "lens"
  ],
  "params": {
    "center_u": [
      520,
      700
    ],
    "radius_u": {
      "value": 700,
      "range": [
        200,
        1600
      ],
      "unit": "u"
    },
    "k": {
      "value": 0.85,
      "range": [
        -0.6,
        3
      ],
      "note": "pinch strength; negative bulges"
    },
    "stretch_y": {
      "value": 1.1,
      "range": [
        -0.8,
        1.6
      ],
      "note": "extra pull above the center"
    },
    "q": "c + d / (1 + k·|d/R|²), with d.y scaled by 1 − stretch_y·clamp(−d.y/R, 0, 1)·0.5"
  },
  "limits": "k below about −0.6 folds the grid over itself inside the sheet. k above ~3 stretches the outer cells past the sheet and they read as bars.",
  "implementation": "Each pixel is mapped to a sample point pulled toward the lens center by 1/(1 + k·r²); the grid is evaluated at the sample point."
};
export const params={
  "center_u": [
    520,
    700
  ],
  "radius_u": 700,
  "k": 0.85,
  "stretch_y": 1.1,
  "q": "c + d / (1 + k·|d/R|²), with d.y scaled by 1 − stretch_y·clamp(−d.y/R, 0, 1)·0.5"
};
export const A={};
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>{ const cx=P.center_u[0]*u, cy=P.center_u[1]*u, R=P.radius_u*u; return { cx, cy, map:(x,y)=>{ let dx=x-cx, dy=y-cy; dy*=1-P.stretch_y*A.clamp(-dy/R,0,1)*0.5; const f=1/(1+P.k*(dx*dx+dy*dy)/(R*R)); return [cx+dx*f, cy+dy*f]; } }; };
export default make;
