/* bank-garden · Garden on the bank — TS-26 Seen in section · Techniques & Templates · ø co.
   Lifted from techniques/ts-26-seen-in-section/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above ~72 u the grass hides the irises and lifts the canopies off the plate top. Grass, flowers and trees stand only where soil is at the surface and above the water. */
export const id="bank-garden", name="Garden on the bank", code="TS-26", entry="ts-26-seen-in-section";
export const atoms=["blade","flower","canopy"];
export const spec={
  "id": "bank-garden",
  "short": "GRDN",
  "name": "Garden on the bank",
  "layer": 4,
  "pass": 6,
  "atoms": [
    "blade",
    "flower",
    "canopy"
  ],
  "params": {
    "grass_u": {
      "value": 58,
      "range": [
        14,
        72
      ],
      "unit": "u",
      "label": "Grass height",
      "note": "Height of the tallest blades above the soil line"
    },
    "flowers": {
      "value": 18,
      "range": [
        0,
        48
      ],
      "step": 1,
      "scale": "sqrt",
      "label": "Flowers",
      "note": "Irises and small blooms along the bank"
    },
    "trees": {
      "value": 3,
      "range": [
        0,
        3
      ],
      "step": 1,
      "label": "Trees",
      "note": "Round trees on the upland, largest first"
    },
    "tree_sites_u": [
      [
        768,
        41
      ],
      [
        866,
        53
      ],
      [
        958,
        34
      ]
    ],
    "mat_share": 0.48,
    "blades_per_u": 14,
    "seed": 12
  },
  "limits": "Above ~72 u the grass hides the irises and lifts the canopies off the plate top. Grass, flowers and trees stand only where soil is at the surface and above the water.",
  "implementation": "A turf mat follows the soil line; blades grow from it along the surface normal and lean up. Flowers take fixed slots along the dry bank so the count adds or removes without reshuffling. Each tree stands on the soil line: a trunk forks into three branches under a crown of 10 to 15 seeded lobes, each lobe dabbed and lit from its upper left; a tree that would cross the plate edge moves inside it."
};
export const params={
  "grass_u": 58,
  "flowers": 18,
  "trees": 3,
  "tree_sites_u": [
    [
      768,
      41
    ],
    [
      866,
      53
    ],
    [
      958,
      34
    ]
  ],
  "mat_share": 0.48,
  "blades_per_u": 14,
  "seed": 12
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const sites=P.tree_sites_u;
      const normal=(G,x)=>{ const sl=(G.S(x+0.6)-G.S(x-0.6))/1.2; const l=Math.hypot(sl,1); return [sl/l,-1/l]; };
      return { mat:P.grass_u*P.mat_share, height:P.grass_u, normal,
        /* trees(G) → per tree: lobes [x,y,r] round the upper rim and inside (none at the bottom middle, so the fork shows), the trunk to a fork and its branches; kept inside the plate */
        trees:G=>[[],[1],[0,1],[0,1,2]][Math.max(0,Math.min(3,P.trees|0))].map(i=>{ let [x,r]=sites[i]; const q=A.rng(P.seed*31+i*977+5); const asp=0.84+0.14*q(), lean=(q()-0.5)*0.18;
            const n=8+Math.floor(q()*5), L=[]; for(let k=0;k<n;k++){ const a=0.62-(Math.PI+1.24)*k/(n-1)+(q()-0.5)*0.3, rho=0.62+0.17*q(), lr=0.27+0.13*q(); L.push([Math.cos(a)*rho,Math.sin(a)*rho*asp,lr]); }
            const ni=3+Math.floor(q()*2); for(let k=0;k<ni;k++){ const a=-Math.PI*(0.1+0.8*k/(ni-1)+0.08*(q()-0.5)), rho=0.25+0.18*q(); L.push([Math.cos(a)*rho,Math.sin(a)*rho*asp-0.04,0.34+0.1*q()]); }
            let mx=0, my0=0, my1=0; for(const [lx,ly,lr] of L){ mx=Math.max(mx,lx+lr*1.06); my0=Math.min(my0,ly-lr*1.06); my1=Math.max(my1,ly+lr); }
            x=Math.min(x,995-mx*r); const s=G.S(x); const lift=P.grass_u*0.6+3+0.16*r; const cy=Math.max(5-my0*r,s-lift-my1*r);
            const fx=x+lean*r, fy=cy+0.5*r, w0=0.12*r; const br=[[x-0.34*r+lean*r*0.5,cy+0.1*r],[x+0.3*r+lean*r,cy+0.06*r],[x+0.04*r+lean*r,cy-0.2*r]];
            return { i, x, r, asp, base:s, cy, fx, fy, w0, br, lobes:L.map(([lx,ly,lr])=>[x+lx*r,cy+ly*r,lr*r]) }; }).sort((a,b)=>b.r-a.r),
        /* blades(G) → [{bx,by,tx,ty,cx,cy,w,front,shade}] in u */
        blades:G=>{ const r=A.rng(P.seed); const out=[]; const x0=G.dry0, n=Math.round((1000-x0)*P.blades_per_u); const mat=P.grass_u*P.mat_share;
          for(let i=0;i<n;i++){ const x=x0+(1000-x0)*r(), k=r(), h0=r(), lean=r(), bend=r(), wd=r(), lay=r(), sh=r(); const s=G.S(x); if(s>G.yw-0.6||!G.soilAt(x))continue; const [nx,ny]=normal(G,x);
            const tp=Math.min(1,(x-x0)/36), f=0.3+0.7*tp*tp*(3-2*tp), clump=0.86+0.14*Math.sin(x/23)*Math.sin(x/7.1);
            const d=mat*0.8*k*f; const bx=x+nx*d, by=s+ny*d; const h=P.grass_u*(0.4+0.6*h0)*(1-0.5*k)*f*clump; let dx=nx*0.4, dy=ny*0.4-0.6; const dl=Math.hypot(dx,dy); dx/=dl; dy/=dl; const la=(lean-0.5)*0.7; const cs=Math.cos(la), sn=Math.sin(la); const ux=dx*cs-dy*sn, uy=dx*sn+dy*cs;
            const b=(bend-0.5)*0.95; out.push({ bx, by, tx:bx+ux*h+(-uy)*b*h*0.5, ty:by+uy*h+ux*b*h*0.5, cx:bx+ux*h*0.55+(-uy)*b*h*0.15, cy:by+uy*h*0.55+ux*b*h*0.15, w:0.8+1.3*wd, front:lay>0.6, shade:sh }); }
          return out; },
        /* flowers(G) → fixed slots; the first P.flowers of them are drawn */
        flowers:G=>{ const r=A.rng(P.seed+7); const out=[]; const x0=G.dry0+6, x1=990; for(let i=0;i<48;i++){ const t=r(), a=r(), b=r(), c=r(), e=r(); if(i>=(P.flowers|0))continue; const x=x0+(x1-x0)*t; const s=G.S(x); if(s>G.yw-2||!G.soilAt(x))continue;
            const type=t<0.6?(a<0.78?'iris':'white'):(t>0.74?(a<0.6?'yellow':'white'):(a<0.45?'iris':'white')); const base=s-P.grass_u*P.mat_share*0.5;
            const hgt=type==='iris'?P.grass_u*0.84+3+13*b:P.grass_u*(0.6+0.36*b); out.push({ type, x, base, top:base-hgt, lean:(c-0.5)*0.22, size:type==='iris'?4.3+1.8*e:1.3+0.6*e, two:e>0.6 }); }
          return out.sort((p,q)=>p.base-q.base); },
        /* tufts(G) → grass symbols for the line section */
        tufts:G=>{ const r=A.rng(P.seed+3); const out=[]; for(let x=G.dry0+2;x<998;x+=5.2+2.4*r()){ const s=G.S(x); if(s>G.yw-0.6||!G.soilAt(x))continue; out.push({ x, s, h:P.grass_u*0.36*(0.75+0.5*r()), n:normal(G,x) }); } return out; } }; };
export default make;
