/* dot-burst · Dot sunburst — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Over ~60 rays the streams merge into a disc; root_width above ~140 u does the same. core_dots at 0 leaves the rays unjoined. gap at 0 lets dots pile up and the burst reads as spray, not stipple. */
export const id="dot-burst", name="Dot sunburst", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["radial","dot-stream","falloff"];
export const spec={
  "id": "dot-burst",
  "short": "RAYS",
  "name": "Dot sunburst",
  "layer": 1,
  "pass": 2,
  "atoms": [
    "radial",
    "dot-stream",
    "falloff"
  ],
  "params": {
    "center_u": [
      470,
      800
    ],
    "rays": {
      "value": 30,
      "range": [
        6,
        60
      ],
      "step": 1
    },
    "fan_deg": [
      -172,
      -8
    ],
    "length_u": {
      "value": 560,
      "range": [
        200,
        900
      ],
      "unit": "u"
    },
    "length_var": {
      "value": 0.3,
      "range": [
        0,
        0.6
      ]
    },
    "root_width_u": {
      "value": 64,
      "range": [
        6,
        140
      ],
      "unit": "u"
    },
    "dots_per_ray": {
      "value": 520,
      "range": [
        60,
        1200
      ],
      "step": 1
    },
    "core_dots": {
      "value": 7000,
      "range": [
        0,
        16000
      ],
      "step": 1
    },
    "core_sigma_u": {
      "value": 185,
      "range": [
        40,
        300
      ],
      "unit": "u"
    },
    "dot_u": {
      "value": 1.5,
      "range": [
        0.6,
        3
      ],
      "unit": "u"
    },
    "gap_u": {
      "value": 5.2,
      "range": [
        0,
        10
      ],
      "unit": "u",
      "note": "no two dots closer than this"
    },
    "seed": {
      "value": 77,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "Over ~60 rays the streams merge into a disc; root_width above ~140 u does the same. core_dots at 0 leaves the rays unjoined. gap at 0 lets dots pile up and the burst reads as spray, not stipple.",
  "implementation": "Dots are placed along each ray with a spread that narrows to the tip and a count that thins with distance; a gaussian core sits on the center. A dot is dropped when another already sits within the gap. Dots land only on the sky."
};
export const params={
  "center_u": [
    470,
    800
  ],
  "rays": 30,
  "fan_deg": [
    -172,
    -8
  ],
  "length_u": 560,
  "length_var": 0.3,
  "root_width_u": 64,
  "dots_per_ray": 520,
  "core_dots": 7000,
  "core_sigma_u": 185,
  "dot_u": 1.5,
  "gap_u": 5.2,
  "seed": 77
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>({ r:P.dot_u*u, each:put0=>{ const r=A.rng(P.seed); const cell=Math.max(1e-6,P.gap_u*u), seen=new Set(); const put=(X,Y)=>{ if(P.gap_u>0){ const k=Math.floor(X/cell)*100003+Math.floor(Y/cell); if(seen.has(k))return; seen.add(k); } put0(X,Y); }; const cx=P.center_u[0]*u, cy=P.center_u[1]*u; const a0=P.fan_deg[0]*Math.PI/180, a1=P.fan_deg[1]*Math.PI/180;
        const g=()=>{ let s=0; for(let i=0;i<4;i++)s+=r(); return (s-2)*0.866; };
        for(let k=0;k<P.rays;k++){ const th=a0+(a1-a0)*(k+0.5+(r()-0.5)*0.7)/P.rays; const L=P.length_u*u*(1+(r()*2-1)*P.length_var); const dx=Math.cos(th), dy=Math.sin(th);
          for(let i=0;i<P.dots_per_ray;i++){ const t=0.12+0.88*Math.pow(r(),1.15); const w=P.root_width_u*u*Math.pow(1-t,0.8)*0.5+0.8*u; const o=g()*w; put(cx+dx*t*L-dy*o, cy+dy*t*L+dx*o); } }
        for(let i=0;i<P.core_dots;i++){ const s=P.core_sigma_u*u; put(cx+g()*s, cy+g()*s); } } });
export default make;
