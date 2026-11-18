/* soil-grain · Soil grain — TS-26 Seen in section · Techniques & Templates · ø co.
   Lifted from techniques/ts-26-seen-in-section/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Under ~0.6 per 1000 u² the soil reads as flat paint; above ~24 the specks touch and the soil turns to sand. */
export const id="soil-grain", name="Soil grain", code="TS-26", entry="ts-26-seen-in-section";
export const atoms=["speck","stipple","mottle"];
export const spec={
  "id": "soil-grain",
  "short": "SOIL",
  "name": "Soil grain",
  "layer": 2,
  "pass": 4,
  "atoms": [
    "speck",
    "stipple",
    "mottle"
  ],
  "params": {
    "specks": {
      "value": 4,
      "range": [
        0.6,
        24
      ],
      "unit": "/1000 u²",
      "label": "Soil grain",
      "note": "Pale and dark specks in the soil, per 1000 u²"
    },
    "size_u": [
      0.45,
      1.25
    ],
    "pale_share": 0.66,
    "seed": 19
  },
  "limits": "Under ~0.6 per 1000 u² the soil reads as flat paint; above ~24 the specks touch and the soil turns to sand.",
  "implementation": "One speck per jittered cell, its size and its pale or dark ink drawn from a hash of the cell, over a two-scale mottle; nothing repeats."
};
export const params={
  "specks": 4,
  "size_u": [
    0.45,
    1.25
  ],
  "pale_share": 0.66,
  "seed": 19
};
export const A={};

export const make=(P,u,A)=>{ const cell=Math.sqrt(1000/P.specks), seed=P.seed|0, r0=P.size_u[0], r1=P.size_u[1];
      const hs=(i,j,k)=>{ let n=(i*374761393+j*668265263+k*1274126177+seed*2246822519)|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296; };
      /* speck(x,y) → coverage in −1..1: positive = pale speck, negative = dark speck */
      const nx=Math.ceil(1000/cell)+2, ny=Math.ceil(620/cell)+2, tab=new Float32Array(nx*ny*4);
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const o=(j*nx+i)*4, r=r0+(r1-r0)*hs(i,j,3)*hs(i,j,5), m=Math.min(0.45,r/cell+0.02); tab[o]=(i+m+(1-2*m)*hs(i,j,1))*cell; tab[o+1]=(j+m+(1-2*m)*hs(i,j,2))*cell; tab[o+2]=r; tab[o+3]=hs(i,j,4)<P.pale_share?1:-1; }
      return { cell, speck:(x,y)=>{ const i=Math.floor(x/cell), j=Math.floor(y/cell); if(i<0||j<0||i>=nx||j>=ny)return 0; const o=(j*nx+i)*4, dx=x-tab[o], dy=y-tab[o+1], r=tab[o+2]; if(dx>r+1||dx<-r-1||dy>r+1||dy<-r-1)return 0;
        const a=(r-Math.sqrt(dx*dx+dy*dy))*u+0.5; return a<=0?0:(a>=1?tab[o+3]:a*tab[o+3]); } }; };
export default make;
