/* finish · Finish — TS-23 Mir, turned · Techniques & Templates · ø co.
   Lifted from techniques/ts-23-mir-turned/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Hatch lines are box-filtered per pixel and fade to their mean tone below 3 px; spacing runs 5–9 u so a 1× screen does not beat, and the cross set ramps in over the darkest half of the tone. Grain amount starts at 0.5 so Mono stays a one-ink stamp. Each finish-only control is quiet outside its finish. */
export const id="finish", name="Finish", code="TS-23", entry="ts-23-mir-turned";
export const atoms=["stochastic-screen","engraving","graphite","per-pixel"];
export const spec={
  "id": "finish",
  "short": "FIN",
  "name": "Finish",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "stochastic-screen",
    "engraving",
    "graphite",
    "per-pixel"
  ],
  "params": {
    "finish": {
      "value": 1,
      "options": [
        {
          "v": 1,
          "label": "Flat"
        },
        {
          "v": 2,
          "label": "Grain"
        },
        {
          "v": 3,
          "label": "Mono"
        },
        {
          "v": 4,
          "label": "Engraved"
        },
        {
          "v": 5,
          "label": "Pencil"
        }
      ],
      "label": "Finish",
      "note": "Flat color · Color + grain · Mono stamp · Engraved · Pencil. Each renders the same construction."
    },
    "grain": {
      "value": 90,
      "range": [
        50,
        100
      ],
      "unit": "%",
      "label": "Grain amount",
      "note": "Grain and Mono only: share of the shade printed as single-pixel dots; the rest is smooth tone.",
      "when": {
        "path": "finish",
        "is": [
          2,
          3
        ]
      }
    },
    "hatch_angle_deg": {
      "value": 35,
      "range": [
        -75,
        75
      ],
      "step": 1,
      "unit": "°",
      "label": "Hatch angle",
      "note": "Engraved only: tilt of the cutting planes on the head. The cans keep rings around their axis.",
      "when": {
        "path": "finish",
        "is": [
          4
        ]
      }
    },
    "hatch_u": {
      "value": 6,
      "range": [
        5,
        9
      ],
      "unit": "u",
      "label": "Hatch spacing",
      "note": "Engraved only: distance between cutting planes.",
      "when": {
        "path": "finish",
        "is": [
          4
        ]
      }
    },
    "pressure": {
      "value": 60,
      "range": [
        25,
        100
      ],
      "unit": "%",
      "label": "Pencil pressure",
      "note": "Pencil only: graphite darkness and stroke width.",
      "when": {
        "path": "finish",
        "is": [
          5
        ]
      }
    }
  },
  "limits": "Hatch lines are box-filtered per pixel and fade to their mean tone below 3 px; spacing runs 5–9 u so a 1× screen does not beat, and the cross set ramps in over the darkest half of the tone. Grain amount starts at 0.5 so Mono stays a one-ink stamp. Each finish-only control is quiet outside its finish.",
  "implementation": "Per pixel: tone = 1 − n·L, eased in past mid-shade. Grain keeps the part colors and screens only the shade, in the darkest ink; Mono screens one ink; Engraved inks a line where the plane phase falls within the tone; Pencil draws broken diagonal strokes thinned by paper tooth. On the deep ground the one ink is paper and prints the light, from 70% on the lit side down to none in the shade, so the paper line still reads."
};
export const params={
  "finish": 1,
  "grain": 90,
  "hatch_angle_deg": 35,
  "hatch_u": 6,
  "pressure": 60
};
export const A={};

export const make=(P,u,A)=>{ const D=Math.PI/180, mode=P.finish, gr=P.grain/100, pr=P.pressure/100, ha=P.hatch_angle_deg*D;
      const hash=(x,y,k)=>{ let n=(x*374761393+y*668265263+k*1274126177)|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296; };
      const cl=v=>v<0?0:v>1?1:v, ss=(a,b,x)=>{ const t=cl((x-a)/(b-a)); return t*t*(3-2*t); };
      /* materials 1 face · 2 dome · 3 can side · 4 can face · 5 cushion · 6 antenna.
         Grain: [shade-dot gain, lo, hi] over the part color; the others: [base, gain, lo, hi] for the ink coverage over the shade ramp. */
      const GR=[0,[0.26,0.55,1],[0.34,0.45,1],[0.42,0.35,1],[0.22,0.55,1],[0.4,0.2,1],[0.3,0.5,1]];
      const TAB={ 3:[0,[0,0.34,0.6,1],[0.04,0.45,0.4,1],[0.3,0.45,0.1,0.8],[0,0.4,0.6,1],[0.5,0.3,0,0.6],[0,0.4,0.5,1]],
        4:[0,[0,0.78,0.45,1],[0.18,0.6,0.2,1],[0.2,0.6,0.1,0.9],[0.03,0.6,0.45,1],[0.4,0.4,0,0.8],[0.05,0.7,0.35,1]],
        5:[0,[0,0.85,0.42,1],[0.1,0.7,0.3,1],[0.18,0.7,0.1,0.9],[0.02,0.6,0.5,1],[0.3,0.5,0,0.8],[0,0.6,0.45,1]] };
      /* box-filtered periodic line: the share of a pixel footprint (fw periods wide) that lies on a line of width f, faded to f once a period is under ~3 px */
      const hatch=(ph,fw,f)=>{ if(f<=0.002)return 0; const d=Math.abs(ph-Math.floor(ph)-0.5), hw=f*0.5, a=Math.max(fw,1e-4); let c=Math.max(0,Math.min(hw,d+a/2)-Math.max(-hw,d-a/2))/a; if(d+a/2>1-hw)c+=Math.max(0,Math.min(1+hw,d+a/2)-Math.max(1-hw,d-a/2))/a; c=cl(c); const k=cl((fw-0.33)/0.25); return c+(f-c)*k; };
      const sp=P.hatch_u*u, pp=Math.max(2.2,3.1*u), pl=24*u, sb=Math.sin(55*D), cb=Math.cos(55*D);
      return { mode, sp, dir:[-Math.sin(ha),Math.cos(ha),0], dir2:[Math.cos(ha),Math.sin(ha),0], hash,
        /* one pixel: material, tone (0 lit … 1 dark), pixel coords, two hatch phases and their change per pixel, inks → rgb in o.
           K.inv: the one ink is lighter than the sheet, so it prints the light (white-line) */
        px:(m,tone,ix,iy,h1,f1,h2,f2,K,o)=>{
          const acc=m===2||m===3||m===5;
          if(mode===1){ const c=acc?K.accent:K.face; o[0]=c[0]; o[1]=c[1]; o[2]=c[2]; return; }
          if(mode===2){ const g=GR[m], B=acc?K.accent:K.face, Dk=K.shade, cD=g[0]*ss(g[1],g[2],tone), on=hash(ix,iy,13)<cD, t=1+0.04*(hash(ix,iy,29)-0.5);
            for(let k=0;k<3;k++){ const s=B[k]+(Dk[k]-B[k])*cD, b=on?Dk[k]:B[k]; o[k]=(s+(b-s)*gr)*t; } return; }
          const tb=TAB[mode][m]; let f=cl(tb[0]+tb[1]*ss(tb[2],tb[3],tone)); if(K.inv)f=0.7*(1-ss(0.05,0.95,tone))*(acc?0.75:1);
          if(mode===3){ const on=hash(ix,iy,7)<f, t=1+0.035*(hash(ix,iy,29)-0.5); for(let k=0;k<3;k++){ const s=K.stock[k]+(K.ink[k]-K.stock[k])*f, b=on?K.ink[k]:K.stock[k]; o[k]=(s+(b-s)*gr)*t; } return; }
          if(mode===4){ const a=hatch(h1,f1,Math.min(0.6,f*1.25)), f2b=0.4*ss(0.5,1.1,f), b=f2b>0.002?hatch(h2,f2,f2b):0, c=1-(1-a)*(1-b);
            for(let k=0;k<3;k++)o[k]=K.stock[k]+(K.ink[k]-K.stock[k])*c; return; }
          let g=0;
          if(f>0.01){ const pq=(ix*sb+iy*cb)/pp, row=Math.floor(pq), fr=pq-row, al=ix*cb-iy*sb;
            const vt=(al+hash(row,0,3)*900)/pl, vi=Math.floor(vt), vf=vt-vi, vs=vf*vf*(3-2*vf), vn=hash(row,vi,5)+(hash(row,vi+1,5)-hash(row,vi,5))*vs, keep=vn+0.16*(hash(ix,iy,19)-0.5)<f*1.5, w=0.16+0.22*f, prof=keep?cl(1-Math.abs(fr-0.5)/w):0; g=cl(prof*0.9+f*0.2)*(0.42+0.58*hash(ix,iy,11))*(0.5+0.5*pr); }
          for(let k=0;k<3;k++)o[k]=K.stock[k]+(K.ink[k]-K.stock[k])*g; } }; };
export default make;
