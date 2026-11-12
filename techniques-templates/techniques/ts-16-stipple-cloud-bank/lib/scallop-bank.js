/* scallop-bank · Scalloped flat bank — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: spacing above ~1.9 opens gaps between lobes and the edge reads as beads. R_var above ~0.6 makes single lobes swallow their neighbors. */
export const id="scallop-bank", name="Scalloped flat bank", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["flat-fill","circle-union","hard-edge"];
export const spec={
  "id": "scallop-bank",
  "short": "BANK",
  "name": "Scalloped flat bank",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "flat-fill",
    "circle-union",
    "hard-edge"
  ],
  "params": {
    "banks": [
      {
        "fill": "warm",
        "shade": "body",
        "from": [
          -120,
          500
        ],
        "to": [
          360,
          1010
        ],
        "R": 96,
        "seed": 11
      },
      {
        "fill": "dark",
        "shade": "rim",
        "from": [
          1120,
          380
        ],
        "to": [
          590,
          1010
        ],
        "R": 104,
        "seed": 23
      },
      {
        "fill": "pale",
        "shade": "body",
        "from": [
          -130,
          790
        ],
        "to": [
          1130,
          930
        ],
        "R": 132,
        "seed": 37
      },
      {
        "fill": "dark",
        "shade": "rim",
        "from": [
          -130,
          1130
        ],
        "to": [
          1130,
          1040
        ],
        "R": 100,
        "seed": 51
      }
    ],
    "R_scale": {
      "value": 1,
      "range": [
        0.5,
        1.8
      ],
      "note": "multiplies every lobe radius"
    },
    "R_var": {
      "value": 0.35,
      "range": [
        0,
        0.6
      ],
      "note": "lobe radius varies ± this share"
    },
    "spacing": {
      "value": 1.25,
      "range": [
        0.8,
        1.9
      ],
      "note": "lobe centers sit this many radii apart"
    },
    "child": {
      "value": 0.55,
      "range": [
        0,
        1
      ],
      "note": "chance that a lobe carries a smaller lobe on its rim"
    }
  },
  "limits": "spacing above ~1.9 opens gaps between lobes and the edge reads as beads. R_var above ~0.6 makes single lobes swallow their neighbors.",
  "implementation": "A bank is a row of circles along a spine plus the area under the spine. The depth of a point is its distance inside the nearest lobe; the shading reads that depth."
};
export const params={
  "banks": [
    {
      "fill": "warm",
      "shade": "body",
      "from": [
        -120,
        500
      ],
      "to": [
        360,
        1010
      ],
      "R": 96,
      "seed": 11
    },
    {
      "fill": "dark",
      "shade": "rim",
      "from": [
        1120,
        380
      ],
      "to": [
        590,
        1010
      ],
      "R": 104,
      "seed": 23
    },
    {
      "fill": "pale",
      "shade": "body",
      "from": [
        -130,
        790
      ],
      "to": [
        1130,
        930
      ],
      "R": 132,
      "seed": 37
    },
    {
      "fill": "dark",
      "shade": "rim",
      "from": [
        -130,
        1130
      ],
      "to": [
        1130,
        1040
      ],
      "R": 100,
      "seed": 51
    }
  ],
  "R_scale": 1,
  "R_var": 0.35,
  "spacing": 1.25,
  "child": 0.55
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>({ banks:P.banks.map(b=>{ const r=A.rng(b.seed); const fx=b.from[0]*u, fy=b.from[1]*u, tx=b.to[0]*u, ty=b.to[1]*u; const len=Math.hypot(tx-fx,ty-fy); const dx=(tx-fx)/len, dy=(ty-fy)/len; let nx=dy, ny=-dx; if(ny>0){ nx=-nx; ny=-ny; }
        const Rb=b.R*P.R_scale*u; const lobes=[]; let s=0;
        while(s<=len){ const R=Rb*(1+(r()*2-1)*P.R_var); const cx=fx+dx*s, cy=fy+dy*s; lobes.push([cx,cy,R]);
          if(r()<P.child){ const a=(r()*2-1)*0.9, ca=Math.cos(a), sa=Math.sin(a); const kx=nx*ca-ny*sa, ky=nx*sa+ny*ca; lobes.push([cx+kx*R*0.78,cy+ky*R*0.78,R*(0.38+0.25*r())]); }
          s+=R*P.spacing; }
        const x0=Math.min(fx,tx), x1=Math.max(fx,tx);
        const depth=(x,y)=>{ let d=-1e9; for(let i=0;i<lobes.length;i++){ const l=lobes[i]; const ex=x-l[0], ey=y-l[1]; const q=l[2]-Math.sqrt(ex*ex+ey*ey); if(q>d)d=q; } if(x>=x0&&x<=x1){ const below=-((x-fx)*nx+(y-fy)*ny); if(below>0){ const q=below+Rb*0.375; if(q>d)d=q; } } return d; };
        const path=(c,W,H)=>{ const B=Math.max(fy,ty,H)+Rb; const pts=[[fx,fy],[tx,ty],[tx,B],[fx,B]]; let a=0; for(let i=0;i<4;i++){ const p=pts[i], q=pts[(i+1)%4]; a+=p[0]*q[1]-q[0]*p[1]; } if(a<0)pts.reverse();
          c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<4;i++)c.lineTo(pts[i][0],pts[i][1]); c.closePath(); for(const l of lobes){ c.moveTo(l[0]+l[2],l[1]); c.arc(l[0],l[1],l[2],0,6.2832); } };
        return { fill:b.fill, shade:b.shade, Rb, dir:[dx,dy], depth, path }; }) });
export default make;
