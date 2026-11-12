/* shape-mask · Shape clip with a masked edge — TS-22 Capsule system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: A feather above ~20 u erodes a third of a narrow panel. On flat fields the ramp would show as a gray band, so it is off there. */
export const id="shape-mask", name="Shape clip with a masked edge", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["clip","mask","feather"];
export const spec={
  "id": "shape-mask",
  "short": "MASK",
  "name": "Shape clip with a masked edge",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "clip",
    "mask",
    "feather"
  ],
  "params": {
    "feather_u": {
      "value": 5,
      "range": [
        0,
        24
      ],
      "unit": "u",
      "note": "width over which coverage ramps down before a clip edge; stippled fields only"
    },
    "shapes": "rectangle · arch · ring with a gap"
  },
  "limits": "A feather above ~20 u erodes a third of a narrow panel. On flat fields the ramp would show as a gray band, so it is off there.",
  "implementation": "A field is drawn through a clip path. Three erasing strokes along the path then lower coverage toward the edge; the stipple turns that ramp into single pixels."
};
export const params={
  "feather_u": 5,
  "shapes": "rectangle · arch · ring with a gap"
};
export const A={};

export const make=(P,u,A)=>({ rect:(c,R)=>{ c.beginPath(); c.rect(R.x,R.y,R.w,R.h); }, arch:(c,R)=>{ const r=R.w/2; c.beginPath(); c.moveTo(R.x,R.y+R.h); c.lineTo(R.x,R.y+r); c.arc(R.x+r,R.y+r,r,Math.PI,0); c.lineTo(R.x+R.w,R.y+R.h); c.closePath(); },
      ring:(c,cx,cy,ro,ri,g0,g1)=>{ c.beginPath(); c.arc(cx,cy,ro,g1,g0+6.2832,false); c.arc(cx,cy,ri,g0+6.2832,g1,true); c.closePath(); },
      erode:(c,path)=>{ const f=P.feather_u*u; if(f<=0)return; c.save(); c.globalCompositeOperation='destination-out'; c.lineJoin='round'; c.strokeStyle='#000'; c.globalAlpha=0.34; for(let k=3;k>=1;k--){ c.lineWidth=2*f*k/3; path(c); c.stroke(); } c.restore(); } });
export default make;
