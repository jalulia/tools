/* shape-mask · Shape clip — TS-22 Capsule rain system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: An inner radius within ~20 u of the outer leaves a band thinner than one long capsule and the field no longer reads. */
export const id="shape-mask", name="Shape clip", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["clip","mask"];
export const spec={
  "id": "shape-mask",
  "short": "MASK",
  "name": "Shape clip",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "clip",
    "mask"
  ],
  "params": {
    "ring": {
      "center_u": [
        232,
        562
      ],
      "outer_u": {
        "value": 132,
        "range": [
          40,
          300
        ],
        "unit": "u"
      },
      "inner_u": {
        "value": 70,
        "range": [
          0,
          280
        ],
        "unit": "u"
      },
      "gap_deg": [
        -34,
        34
      ]
    },
    "shapes": "frame rectangle · ring with a gap"
  },
  "limits": "An inner radius within ~20 u of the outer leaves a band thinner than one long capsule and the field no longer reads.",
  "implementation": "The capsule field is drawn through a clip path: a rectangle for framed panels, a ring with an opening for the mark."
};
export const params={
  "ring": {
    "center_u": [
      232,
      562
    ],
    "outer_u": 132,
    "inner_u": 70,
    "gap_deg": [
      -34,
      34
    ]
  },
  "shapes": "frame rectangle · ring with a gap"
};
export const A={};

export const make=(P,u,A)=>({ rect:(x,R)=>{ x.beginPath(); x.rect(R.x,R.y,R.w,R.h); }, ring:x=>{ const c=P.ring, cx=c.center_u[0]*u, cy=c.center_u[1]*u, a0=c.gap_deg[0]*Math.PI/180, a1=c.gap_deg[1]*Math.PI/180; x.beginPath(); x.arc(cx,cy,c.outer_u*u,a1,a0+6.2832,false); x.arc(cx,cy,c.inner_u*u,a0+6.2832,a1,true); x.closePath(); return { x:cx-c.outer_u*u, y:cy-c.outer_u*u, w:2*c.outer_u*u, h:2*c.outer_u*u }; } });
export default make;
