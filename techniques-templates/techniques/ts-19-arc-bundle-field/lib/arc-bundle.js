/* arc-bundle · Trunk-and-fan arc bundle — TS-19 Arc bundles on a dashed globe · Techniques & Templates · ø co.
   Lifted from techniques/ts-19-arc-bundle-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: trunk under ~0.25 lets strands separate at the hub and the bundle reads as a plain fan. Past ~24 bundles the sheet fills and single arcs stop reading. */
export const id="arc-bundle", name="Trunk-and-fan arc bundle", code="TS-19", entry="ts-19-arc-bundle-field";
export const atoms=["bezier","fan","bundle"];
export const spec={
  "id": "arc-bundle",
  "short": "ARC",
  "name": "Trunk-and-fan arc bundle",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "bezier",
    "fan",
    "bundle"
  ],
  "params": {
    "hub": {
      "x": {
        "value": 470,
        "range": [
          0,
          1000
        ],
        "unit": "u"
      },
      "y": {
        "value": 292,
        "range": [
          0,
          577
        ],
        "unit": "u"
      }
    },
    "bundles": {
      "value": 12,
      "range": [
        1,
        24
      ],
      "step": 1
    },
    "strands": [
      8,
      30
    ],
    "reach_u": [
      420,
      900
    ],
    "trunk": {
      "value": 0.5,
      "range": [
        0.2,
        0.9
      ],
      "note": "control point distance, as a share of the reach"
    },
    "spread": [
      0.2,
      0.6
    ],
    "curl": [
      0.3,
      1.1
    ],
    "squash": {
      "value": 0.72,
      "range": [
        0.3,
        1.2
      ],
      "note": "vertical scale of the whole fan"
    },
    "line_u": {
      "value": 1.8,
      "range": [
        0.4,
        4
      ],
      "unit": "u"
    },
    "line_var": {
      "value": 0.5,
      "range": [
        0,
        1
      ]
    },
    "sway": {
      "value": 0,
      "range": [
        0,
        1
      ],
      "note": "swings every bundle through one cycle; Motion runs it"
    },
    "pulse_u": {
      "value": 46,
      "range": [
        8,
        200
      ],
      "unit": "u",
      "note": "length of the moving pulse"
    },
    "pulse_s": {
      "value": 3.2,
      "range": [
        0.5,
        12
      ],
      "unit": "s",
      "note": "time for a pulse to run a strand"
    },
    "seed": {
      "value": 404,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "trunk under ~0.25 lets strands separate at the hub and the bundle reads as a plain fan. Past ~24 bundles the sheet fills and single arcs stop reading.",
  "implementation": "Each strand is a quadratic curve from the hub. Its control point lies on the bundle’s ray at trunk × reach; its end is turned from that ray by the curl plus its share of the spread."
};
export const params={
  "hub": {
    "x": 470,
    "y": 292
  },
  "bundles": 12,
  "strands": [
    8,
    30
  ],
  "reach_u": [
    420,
    900
  ],
  "trunk": 0.5,
  "spread": [
    0.2,
    0.6
  ],
  "curl": [
    0.3,
    1.1
  ],
  "squash": 0.72,
  "line_u": 1.8,
  "line_var": 0.5,
  "sway": 0,
  "pulse_u": 46,
  "pulse_s": 3.2,
  "seed": 404
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.lerp=(a,b,t)=>a+(b-a)*t;
export const make=(P,u,A)=>({ line:P.line_u*u, pulse:P.pulse_u*u, pulse_s:P.pulse_s, strands:()=>{ const r=A.rng(P.seed); const hx=P.hub.x*u, hy=P.hub.y*u, out=[];
        for(let b=0;b<P.bundles;b++){ const phi=(b+0.2+0.6*r())/P.bundles*6.2832; const reach=A.lerp(P.reach_u[0],P.reach_u[1],r())*u; const n=Math.round(A.lerp(P.strands[0],P.strands[1],r())); const sg=r()<0.5?-1:1;
          const curl=sg*A.lerp(P.curl[0],P.curl[1],r())+0.22*(Math.sin(6.2832*P.sway+b*1.3)-Math.sin(b*1.3)); const spread=A.lerp(P.spread[0],P.spread[1],r()); const trunk=P.trunk*(0.85+0.3*r());
          const cx=hx+Math.cos(phi)*reach*trunk, cy=hy+Math.sin(phi)*reach*trunk*P.squash;
          for(let k=0;k<n;k++){ const t=n>1?k/(n-1):0; const a=phi+curl*(0.55+0.45*t)+sg*spread*(t-0.5); const L=reach*(0.82+0.3*r()); const lw=1-P.line_var*r(); const j=(r()-0.5)*5*u;
            out.push({ x0:hx, y0:hy, cx:cx+j, cy:cy-j, x1:hx+Math.cos(a)*L, y1:hy+Math.sin(a)*L*P.squash, t, b, lw, len:L }); } }
        return out; } });
export default make;
