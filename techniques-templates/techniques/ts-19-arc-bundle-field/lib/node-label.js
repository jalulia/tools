/* node-label · Numbered nodes — TS-19 Arc bundles on a dashed globe · Techniques & Templates · ø co.
   Lifted from techniques/ts-19-arc-bundle-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Over ~60 nodes the labels overlap. Type under 9 u is unreadable at 900 px. */
export const id="node-label", name="Numbered nodes", code="TS-19", entry="ts-19-arc-bundle-field";
export const atoms=["marker","data-label"];
export const spec={
  "id": "node-label",
  "short": "NODE",
  "name": "Numbered nodes",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "marker",
    "data-label"
  ],
  "params": {
    "nodes": {
      "value": 34,
      "range": [
        0,
        90
      ],
      "step": 1
    },
    "square_u": {
      "value": 3.4,
      "range": [
        1.5,
        8
      ],
      "unit": "u"
    },
    "type_u": {
      "value": 13.5,
      "range": [
        9,
        26
      ],
      "unit": "u"
    },
    "offset_u": [
      5,
      -5
    ],
    "seed": {
      "value": 52,
      "range": [
        1,
        9999
      ],
      "step": 1
    },
    "format": "three digits, one decimal"
  },
  "limits": "Over ~60 nodes the labels overlap. Type under 9 u is unreadable at 900 px.",
  "implementation": "Square markers sit on bundle ends and on seeded free points; each carries a seeded number set up and to the right."
};
export const params={
  "nodes": 34,
  "square_u": 3.4,
  "type_u": 13.5,
  "offset_u": [
    5,
    -5
  ],
  "seed": 52,
  "format": "three digits, one decimal"
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>({ draw:(x,ends,W,H,color)=>{ const r=A.rng(P.seed); const s=P.square_u*u; x.fillStyle=color; x.font=`400 ${P.type_u*u}px Inter, sans-serif`; x.textBaseline='alphabetic';
        for(let i=0;i<P.nodes;i++){ let X,Y; const a=r(), b=r(), c=r(); if(i<ends.length&&a<0.7){ X=ends[i][0]; Y=ends[i][1]; } else { X=(0.04+0.92*b)*W; Y=(0.06+0.88*c)*H; }
          const v=(r()*900+10).toFixed(1).padStart(5,'0'); if(X<0||Y<0||X>W||Y>H)continue; x.fillRect(Math.round(X-s/2),Math.round(Y-s/2),Math.round(s),Math.round(s)); x.fillText(v,X+P.offset_u[0]*u,Y+P.offset_u[1]*u); } } });
export default make;
