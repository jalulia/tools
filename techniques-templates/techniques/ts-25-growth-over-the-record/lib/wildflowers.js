/* wildflowers · Wildflowers — TS-25 Growth over the record · Techniques & Templates · ø co.
   Lifted from techniques/ts-25-growth-over-the-record/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Past about 240 heads the clumps join into a meadow band and stop reading as separate plants. */
export const id="wildflowers", name="Wildflowers", code="TS-25", entry="ts-25-growth-over-the-record";
export const atoms=["clump","flower-head","perspective"];
export const spec={
  "id": "wildflowers",
  "short": "FLWR",
  "name": "Wildflowers",
  "layer": 6,
  "pass": 6,
  "atoms": [
    "clump",
    "flower-head",
    "perspective"
  ],
  "params": {
    "count": {
      "value": 60,
      "range": [
        0,
        240
      ],
      "step": 1,
      "label": "Wildflowers",
      "note": "flower heads, on leafy clumps on grass only, smaller higher up the hill"
    },
    "lilac_share": 0.6,
    "seed": 31
  },
  "limits": "Past about 240 heads the clumps join into a meadow band and stop reading as separate plants.",
  "implementation": "Clumps of six to nine blades with three to seven heads about 5 u across, at least 3.6 u apart, on stems 6–19 u tall; leaves and stems go into the tone layer, the heads are pixel-quantized lilac or yellow petals drawn last. A head on blue or on a tree is skipped."
};
export const params={
  "count": 60,
  "lilac_share": 0.6,
  "seed": 31
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const place=(main,ok,Hu)=>{ const r=A.rng(P.seed), out=[], N=Math.round(P.count); let heads=0, guard=0;
        while(heads<N&&guard++<3000){ const x=1000*Math.pow(r(),1.3), t=main(x)[0], y=t+20+(Hu-t-20)*Math.pow(r(),0.8), kind=r()<P.lilac_share?1:2, m=3+Math.floor(r()*5), seed=Math.floor(r()*1e9);
          if(y>Hu-2||!ok(x,y))continue; const s=0.5+1.05*Math.pow(Math.min(1,Math.max(0,(y-160)/(Hu-160))),1.1), rr=A.rng(seed), hd=[];
          for(let j=0,tries=0;j<m&&heads<N&&tries<m*6;tries++){ const hx=x+(rr()-0.5)*20*s, hy=y-(6+rr()*13)*s, z=rr(); if(hx<2||hx>998||!ok(hx,hy)||hd.some(q=>Math.hypot(q.x-hx,q.y-hy)<3.6*s))continue; hd.push({ x:hx, y:hy, z }); heads++; j++; }
          if(hd.length)out.push({ x, y, s, kind, seed, heads:hd }); }
        return out; };
      const drawClumps=(c,list)=>{ const C=t=>`rgb(${Math.max(0,Math.min(255,Math.round(t*255)))},128,0)`;
        for(const f of list){ const r=A.rng(f.seed+7), bx=f.x*u, by=f.y*u, s=f.s*u;
          c.strokeStyle=C(0.05); c.lineWidth=Math.max(1.2,0.42*s); c.lineCap='round';
          for(const h of f.heads){ const hx=h.x*u, hy=h.y*u, sx=bx+(hx-bx)*0.25; c.beginPath(); c.moveTo(sx,by); c.quadraticCurveTo(sx+(hx-sx)*0.2,(by+hy)/2,hx,hy); c.stroke(); }
          const n=6+Math.floor(r()*4); for(let j=0;j<n;j++){ const a=((j+0.5)/n-0.5)*1.9+(r()-0.5)*0.3, h=(8+9*r())*s, x0=bx+(r()-0.5)*4*s, tx=x0+Math.sin(a)*h, ty=by-Math.cos(a)*h*0.85, cx=x0+Math.sin(a)*h*0.4, cy=by-h*0.55, w=Math.max(0.9,0.1*h);
            c.fillStyle=C(r()<0.6?0.03+0.1*r():0.66+0.26*r()); c.beginPath(); c.moveTo(x0,by); c.quadraticCurveTo(cx-w,cy,tx,ty); c.quadraticCurveTo(cx+w,cy,x0,by); c.closePath(); c.fill(); } } };
      const drawHeads=(c,list,V)=>{ const dot=(x,y,rad)=>{ const R=Math.max(0.5,rad), r2=R*R, x0=Math.floor(x-R), x1=Math.ceil(x+R), y0=Math.floor(y-R), y1=Math.ceil(y+R); for(let yy=y0;yy<=y1;yy++){ let a=-1, b=-2; for(let xx=x0;xx<=x1;xx++){ const dx=xx+0.5-x, dy=yy+0.5-y; if(dx*dx+dy*dy<=r2){ if(a<0)a=xx; b=xx; } } if(b>=a)c.fillRect(a,yy,b-a+1,1); } };
        for(const f of list){ const s=f.s*u; for(const h of f.heads){ const x=h.x*u, y=h.y*u;
          if(f.kind===1){ c.fillStyle=V.petal; for(let j=0;j<4;j++){ const a=j*1.5708+h.z; dot(x+Math.cos(a)*1.4*s,y+Math.sin(a)*1.2*s,1.15*s); } c.fillStyle=V.eye; dot(x,y,0.55*s); }
          else { c.fillStyle=V.bloom; for(let j=0;j<5;j++){ const a=j*1.2566+h.z; dot(x+Math.cos(a)*1.15*s,y+Math.sin(a)*0.95*s,0.9*s); } c.fillStyle=V.eye; dot(x,y,0.45*s); } } } };
      return { place, drawClumps, drawHeads }; };
export default make;
