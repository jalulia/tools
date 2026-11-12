/* capsule-dial · Capsule dial — TS-22 Capsule system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Over ~120 spokes the inner ends overlap into a ring. lobes at 0 gives a plain sun. */
export const id="capsule-dial", name="Capsule dial", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["radial","rosette"];
export const spec={
  "id": "capsule-dial",
  "short": "DIAL",
  "name": "Capsule dial",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "radial",
    "rosette"
  ],
  "params": {
    "spokes": {
      "value": 54,
      "range": [
        8,
        120
      ],
      "step": 1
    },
    "inner_u": {
      "value": 44,
      "range": [
        10,
        120
      ],
      "unit": "u"
    },
    "length_u": [
      14,
      96
    ],
    "width_u": [
      3,
      9
    ],
    "lobes": {
      "value": 3,
      "range": [
        0,
        8
      ],
      "step": 1
    },
    "turn": {
      "value": 0,
      "range": [
        0,
        1
      ],
      "note": "turns the dial; Motion runs it"
    },
    "seed": {
      "value": 6,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "Over ~120 spokes the inner ends overlap into a ring. lobes at 0 gives a plain sun.",
  "implementation": "Capsules point outward from a circle. Length and width follow a sine with three lobes around the dial; ink follows the angle through the five bands."
};
export const params={
  "spokes": 54,
  "inner_u": 44,
  "length_u": [
    14,
    96
  ],
  "width_u": [
    3,
    9
  ],
  "lobes": 3,
  "turn": 0,
  "seed": 6
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.lerp=(a,b,t)=>a+(b-a)*t;
export const make=(P,u,A)=>({ spokes:(cx,cy,inks)=>{ const out=[]; const n=P.spokes, r0=P.inner_u*u, r=A.rng(P.seed); for(let k=0;k<n;k++){ const t=k/n; const a=6.2832*(t+P.turn); const e=0.5+0.5*Math.sin(6.2832*t*P.lobes+1.2); const len=A.lerp(P.length_u[0],P.length_u[1],e)*u*(0.85+0.3*r()), w=A.lerp(P.width_u[0],P.width_u[1],e)*u, rc=r0+len/2;
          out.push({ i:inks.pick(t,r()), x:cx+Math.cos(a)*rc, y:cy+Math.sin(a)*rc, w, len, a:a-Math.PI/2 }); } return out; } });
export default make;
