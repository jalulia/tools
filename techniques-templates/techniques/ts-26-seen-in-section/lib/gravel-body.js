/* gravel-body · Gravel beds and clay floor — TS-26 Seen in section · Techniques & Templates · ø co.
   Lifted from techniques/ts-26-seen-in-section/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Under ~16 u the riverbed is a skin 9 u thick at the steepest toe and the wedge pinches out at x ≈ 600. Above ~96 u the soil under the river thins to 20 u over the clay and the soil between the two beds to 54 u. */
export const id="gravel-body", name="Gravel beds and clay floor", code="TS-26", entry="ts-26-seen-in-section";
export const atoms=["bed","contact","pinch-out","worley"];
export const spec={
  "id": "gravel-body",
  "short": "GRVL",
  "name": "Gravel beds and clay floor",
  "layer": 2,
  "pass": 3,
  "atoms": [
    "bed",
    "contact",
    "pinch-out",
    "worley"
  ],
  "params": {
    "depth_u": {
      "value": 46,
      "range": [
        16,
        96
      ],
      "unit": "u",
      "label": "Gravel bed depth",
      "note": "Thickness of both gravel beds: the riverbed wedge and the bed under the garden"
    },
    "contact_x_u": [
      330,
      560
    ],
    "peak_u": 316,
    "base_u": {
      "at": [
        339,
        421
      ],
      "slope": 0.28,
      "per_depth": 0.6,
      "floor": [
        472,
        0.45
      ],
      "floor_round": 40
    },
    "deep_u": [
      455,
      0.62
    ],
    "deep_dip": 0.28,
    "deep_dip_from_u": 640,
    "clay_u": 515,
    "pebble_u": 3.6,
    "seed": 61,
    "wedge": "top = max(ground, contact), the contact rising from the riverbed to 316 u at x 560; base = 421 + 0.6 · (depth − 46) − 0.28 · (x − 339), levelling under the river at 472 + 0.45 · (depth − 46) u through a 40 u smooth minimum; the wedge pinches out where its base meets the contact",
    "deep_bed": "top = 455 − 0.62 · (depth − 46) u under the garden, dipping 0.28 to the left of x 640, parallel to the wedge base, so the soil between them keeps one thickness",
    "clay": "floor at 515 u; it cuts any gravel below it"
  },
  "limits": "Under ~16 u the riverbed is a skin 9 u thick at the steepest toe and the wedge pinches out at x ≈ 600. Above ~96 u the soil under the river thins to 20 u over the clay and the soil between the two beds to 54 u.",
  "implementation": "Two gravel beds over a clay floor. The riverbed gravel wedges up under the bank and pinches out where its base meets the contact; the deep bed runs under the garden and dips left parallel to the wedge base, so the soil between them never tapers into a tongue. Depth thickens both, moves the wedge tip right and raises the deep bed toward the roots. Pebbles are elliptical Worley cells lit from the upper left; the clay is laminated."
};
export const params={
  "depth_u": 46,
  "contact_x_u": [
    330,
    560
  ],
  "peak_u": 316,
  "base_u": {
    "at": [
      339,
      421
    ],
    "slope": 0.28,
    "per_depth": 0.6,
    "floor": [
      472,
      0.45
    ],
    "floor_round": 40
  },
  "deep_u": [
    455,
    0.62
  ],
  "deep_dip": 0.28,
  "deep_dip_from_u": 640,
  "clay_u": 515,
  "pebble_u": 3.6,
  "seed": 61,
  "wedge": "top = max(ground, contact), the contact rising from the riverbed to 316 u at x 560; base = 421 + 0.6 · (depth − 46) − 0.28 · (x − 339), levelling under the river at 472 + 0.45 · (depth − 46) u through a 40 u smooth minimum; the wedge pinches out where its base meets the contact",
  "deep_bed": "top = 455 − 0.62 · (depth − 46) u under the garden, dipping 0.28 to the left of x 640, parallel to the wedge base, so the soil between them keeps one thickness",
  "clay": "floor at 515 u; it cuts any gravel below it"
};
export const A={};

export const make=(P,u,A)=>{ const [x0,xp]=P.contact_x_u, pk=P.peak_u; const ss=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
      const wob=x=>2.2*Math.sin(x/29+1.3)+1.3*Math.sin(x/11.7+0.4), wob2=x=>2.6*Math.sin(x/41+0.2)+1.4*Math.sin(x/15.3+2.2);
      const wob3=x=>1.8*Math.sin(x/53+0.9)+1.1*Math.sin(x/19.7+1.7);
      /* wedge top: the contact rises from the riverbed to the peak; wedge base: a straight dipping line; deep bed parallel to it; clay floor */
      const C=(x,bedY)=>x<=xp?bedY(x)+(pk+wob(x)-bedY(x))*ss(x0,xp,x):pk+wob(x)+(x-xp)*0.35;
      const dd=P.depth_u-46, Bs=P.base_u;
      const smin=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.min(a,b)-h*h*k*0.25; };
      const Lb=x=>smin(Bs.at[1]+Bs.per_depth*dd-Bs.slope*(x-Bs.at[0]),Bs.floor[0]+Bs.floor[1]*dd,Bs.floor_round);
      const D=x=>P.deep_u[0]-P.deep_u[1]*dd+wob2(x)+P.deep_dip*Math.max(0,P.deep_dip_from_u-x);
      const K=x=>P.clay_u+wob3(x);
      const c=P.pebble_u, cy=c*0.78, seed=P.seed|0;
      const hs=(i,j,k)=>{ let n=(i*374761393+j*668265263+k*1274126177+seed*2246822519)|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296; };
      /* one pebble per jittered cell, held in a table: center, inverse radii, tone */
      const nx=Math.ceil(1000/c)+5, ny=Math.ceil(620/cy)+5, tab=new Float32Array(nx*ny*5);
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const I=i-2, J=j-2, o=(j*nx+i)*5, s=0.62+0.5*hs(I,J,3); tab[o]=(I+0.1+0.8*hs(I,J,1))*c; tab[o+1]=(J+0.1+0.8*hs(I,J,2))*cy; tab[o+2]=1/(c*0.66*s); tab[o+3]=1/(cy*0.62*s); tab[o+4]=hs(I,J,4); }
      /* pebble(x,y) → [tone 0..1, coverage 0..1, light −1..1] at a point in u */
      const out=[0,0,0];
      const pebble=(x,y)=>{ const ci=Math.floor(x/c)+2, cj=Math.floor(y/cy)+2; let d1=9,tone=0,lx=0,ly=0;
        for(let j=cj-1;j<=cj+1;j++){ if(j<0||j>=ny)continue; for(let i=ci-1;i<=ci+1;i++){ if(i<0||i>=nx)continue; const o=(j*nx+i)*5, dx=(x-tab[o])*tab[o+2], dy=(y-tab[o+1])*tab[o+3], d=dx*dx+dy*dy; if(d<d1){ d1=d; tone=tab[o+4]; lx=dx; ly=dy; } } }
        const e=Math.sqrt(d1); out[0]=tone; out[1]=e>=1?0:(e<0.74?1:(1-e)/0.26); out[2]=-(lx*0.55+ly*0.83); return out; };
      return { C, Lb, D, K, depth:P.depth_u, pebble, pitch:c }; };
export default make;
