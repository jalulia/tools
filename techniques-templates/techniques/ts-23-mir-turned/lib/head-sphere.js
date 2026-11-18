/* head-sphere · Head sphere, turned — TS-23 Mir, turned · Techniques & Templates · ø co.
   Lifted from techniques/ts-23-mir-turned/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Turn is held to ±35°: past that the near can covers the near eye. Tilt below −10° hides the band behind the brow line. */
export const id="head-sphere", name="Head sphere, turned", code="TS-23", entry="ts-23-mir-turned";
export const atoms=["sphere","rotation","orthographic","latitude-band"];
export const spec={
  "id": "head-sphere",
  "short": "HEAD",
  "name": "Head sphere, turned",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "sphere",
    "rotation",
    "orthographic",
    "latitude-band"
  ],
  "params": {
    "turn_deg": {
      "value": 0,
      "range": [
        -35,
        35
      ],
      "step": 1,
      "unit": "°",
      "label": "Turn",
      "note": "Yaw of the whole head. From about ±20° the far can tucks behind the head; past ±26° its face turns away."
    },
    "tilt_deg": {
      "value": 8,
      "range": [
        -10,
        20
      ],
      "step": 1,
      "unit": "°",
      "label": "Tilt",
      "note": "Chin up (+) or down (−). The band arches up as the chin lifts."
    },
    "radius_u": 300,
    "center_u": [
      500,
      420
    ],
    "band_lat_deg": 12,
    "light": [
      -0.45,
      0.62,
      0.64
    ]
  },
  "limits": "Turn is held to ±35°: past that the near can covers the near eye. Tilt below −10° hides the band behind the brow line.",
  "implementation": "Every part is built in head space and taken to the view by one rotation, tilt about x then turn about y, and an orthographic projection. The band is the latitude circle at 12°; only its front half is drawn."
};
export const params={
  "turn_deg": 0,
  "tilt_deg": 8,
  "radius_u": 300,
  "center_u": [
    500,
    420
  ],
  "band_lat_deg": 12,
  "light": [
    -0.45,
    0.62,
    0.64
  ]
};
export const A={};

export const make=(P,u,A)=>{ const D=Math.PI/180, ya=P.turn_deg*D, ti=P.tilt_deg*D, cy=Math.cos(ya), sy=Math.sin(ya), ct=Math.cos(ti), st=Math.sin(ti);
      const toW=p=>{ const y=p[1]*ct+p[2]*st, z=-p[1]*st+p[2]*ct; return [p[0]*cy+z*sy, y, -p[0]*sy+z*cy]; };
      const fromW=p=>{ const x=p[0]*cy-p[2]*sy, z=p[0]*sy+p[2]*cy; return [x, p[1]*ct-z*st, p[1]*st+z*ct]; };
      const R=P.radius_u*u, X0=P.center_u[0]*u, Y0=P.center_u[1]*u, L=P.light, l=Math.hypot(L[0],L[1],L[2]), b=P.band_lat_deg*D;
      return { R, Ru:P.radius_u, X0, Y0, toW, fromW, sinB:Math.sin(b), light:[L[0]/l,L[1]/l,L[2]/l], rot:[cy,sy,ct,st],
        at:(lam,phi)=>[Math.cos(phi)*Math.sin(lam), Math.sin(phi), Math.cos(phi)*Math.cos(lam)],
        proj:p=>[X0+p[0]*R, Y0-p[1]*R],
        lat:(phi,n)=>{ const o=[]; for(let i=0;i<=n;i++){ const t=-Math.PI+2*Math.PI*i/n; o.push(toW([Math.cos(phi)*Math.sin(t), Math.sin(phi), Math.cos(phi)*Math.cos(t)])); } return o; },
        band:n=>{ const o=[]; for(let i=0;i<=n;i++){ const t=-Math.PI+2*Math.PI*i/n; o.push(toW([Math.cos(b)*Math.sin(t), Math.sin(b), Math.cos(b)*Math.cos(t)])); } return o; } }; };
export default make;
