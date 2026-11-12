/* arc-bundle · Nested arc bundle — TS-19 Arc bundles on a dashed globe · Techniques & Templates · ø co.
   Lifted from techniques/ts-19-arc-bundle-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: fan under ~10 u collapses a bundle to one thick line. Past ~24 bundles the sheet fills and single arcs stop reading. */
export const id="arc-bundle", name="Nested arc bundle", code="TS-19", entry="ts-19-arc-bundle-field";
export const atoms=["bezier","fan","bundle"];
export const spec={
  "id": "arc-bundle",
  "short": "ARC",
  "name": "Nested arc bundle",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "bezier",
    "fan",
    "bundle"
  ],
  "params": {
    "hub_u": [
      470,
      292
    ],
    "bundles": {
      "value": 14,
      "range": [
        1,
        24
      ],
      "step": 1
    },
    "strands": [
      10,
      34
    ],
    "reach_u": [
      230,
      520
    ],
    "fan_u": {
      "value": 78,
      "range": [
        10,
        400
      ],
      "unit": "u",
      "note": "length of the line the strokes end along"
    },
    "stagger": {
      "value": 0.3,
      "range": [
        0,
        0.8
      ],
      "note": "share of the reach by which stroke ends step back across the bundle"
    },
    "bend": [
      0.04,
      0.36
    ],
    "line_u": {
      "value": 1.5,
      "range": [
        0.4,
        4
      ],
      "unit": "u"
    },
    "seed": {
      "value": 404,
      "range": [
        1,
        9999
      ],
      "step": 1
    },
    "curve": "quadratic; control point at mid-chord, pushed sideways by bend × chord length"
  },
  "limits": "fan under ~10 u collapses a bundle to one thick line. Past ~24 bundles the sheet fills and single arcs stop reading.",
  "implementation": "For each bundle a target point is picked around the hub; stroke ends are spaced along a line through it, and each stroke is a quadratic curve whose sideways bend steps up across the bundle."
};
export const params={
  "hub_u": [
    470,
    292
  ],
  "bundles": 14,
  "strands": [
    10,
    34
  ],
  "reach_u": [
    230,
    520
  ],
  "fan_u": 78,
  "stagger": 0.3,
  "bend": [
    0.04,
    0.36
  ],
  "line_u": 1.5,
  "seed": 404,
  "curve": "quadratic; control point at mid-chord, pushed sideways by bend × chord length"
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.lerp=(a,b,t)=>a+(b-a)*t;
export const make=(P,u,A)=>({ line:P.line_u*u, strands:()=>{ const r=A.rng(P.seed); const hx=P.hub_u[0]*u, hy=P.hub_u[1]*u; const out=[];
        for(let b=0;b<P.bundles;b++){ const th=(b+r()*0.8)/P.bundles*6.2832; const reach=A.lerp(P.reach_u[0],P.reach_u[1],r())*u; const tx=hx+Math.cos(th)*reach*1.35, ty=hy+Math.sin(th)*reach*0.62;
          const n=Math.round(A.lerp(P.strands[0],P.strands[1],r())); const fa=th+1.5708+(r()-0.5)*1.2; const fan=P.fan_u*u*(0.5+r()); const sign=r()<0.5?-1:1; const b0=P.bend[0], b1=P.bend[1]*(0.5+0.5*r());
          for(let k=0;k<n;k++){ const t=n>1?k/(n-1):0; const back=1-P.stagger*t*(0.6+0.4*r()); const ex=hx+(tx+Math.cos(fa)*fan*(t-0.5)-hx)*back, ey=hy+(ty+Math.sin(fa)*fan*(t-0.5)-hy)*back; const dx=ex-hx, dy=ey-hy, L=Math.hypot(dx,dy); const bend=sign*A.lerp(b0,b1,t*t)*L;
            out.push({ x0:hx, y0:hy, cx:hx+dx*0.5-dy/L*bend, cy:hy+dy*0.5+dx/L*bend, x1:ex, y1:ey, t, b }); } }
        return out; } });
export default make;
