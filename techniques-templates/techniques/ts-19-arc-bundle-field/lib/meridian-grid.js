/* meridian-grid · Dashed meridians — TS-19 Arc bundles on a dashed globe · Techniques & Templates · ø co.
   Lifted from techniques/ts-19-arc-bundle-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Over ~31 meridians the dashes of neighbors align into bands. A radius under the half-height of the sheet shows the sphere outline and the picture reads as a ball, not a field. */
export const id="meridian-grid", name="Dashed meridians", code="TS-19", entry="ts-19-arc-bundle-field";
export const atoms=["sphere","ellipse","dash"];
export const spec={
  "id": "meridian-grid",
  "short": "GRID",
  "name": "Dashed meridians",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "sphere",
    "ellipse",
    "dash"
  ],
  "params": {
    "center_u": [
      500,
      288
    ],
    "radius_u": {
      "value": 560,
      "range": [
        200,
        1200
      ],
      "unit": "u"
    },
    "count": {
      "value": 11,
      "range": [
        3,
        31
      ],
      "step": 1
    },
    "dash_u": [
      6,
      5
    ],
    "line_u": {
      "value": 1.1,
      "range": [
        0.4,
        3
      ],
      "unit": "u"
    },
    "tilt_deg": {
      "value": 0,
      "range": [
        -30,
        30
      ],
      "unit": "°"
    },
    "axis": "the middle meridian is solid"
  },
  "limits": "Over ~31 meridians the dashes of neighbors align into bands. A radius under the half-height of the sheet shows the sphere outline and the picture reads as a ball, not a field.",
  "implementation": "Each meridian is an ellipse with the sphere radius as its tall axis and radius·|sin λ| as its wide one, stroked with a 6 on 5 dash."
};
export const params={
  "center_u": [
    500,
    288
  ],
  "radius_u": 560,
  "count": 11,
  "dash_u": [
    6,
    5
  ],
  "line_u": 1.1,
  "tilt_deg": 0,
  "axis": "the middle meridian is solid"
};
export const A={};

export const make=(P,u,A)=>({ draw:(x,color)=>{ const cx=P.center_u[0]*u, cy=P.center_u[1]*u, R=P.radius_u*u; x.save(); x.translate(cx,cy); x.rotate(P.tilt_deg*Math.PI/180); x.strokeStyle=color; x.lineWidth=P.line_u*u; const n=P.count, mid=(n-1)/2;
        for(let i=0;i<n;i++){ const lam=(i-mid)/(mid+1)*Math.PI/2; const rx=Math.abs(Math.sin(lam))*R; x.setLineDash(i===Math.round(mid)?[]:[P.dash_u[0]*u,P.dash_u[1]*u]); x.beginPath(); if(rx<0.5){ x.moveTo(0,-R); x.lineTo(0,R); } else x.ellipse(0,0,rx,R,0,lam<0?Math.PI/2:-Math.PI/2,lam<0?Math.PI*1.5:Math.PI/2); x.stroke(); }
        x.setLineDash([]); x.restore(); } });
export default make;
