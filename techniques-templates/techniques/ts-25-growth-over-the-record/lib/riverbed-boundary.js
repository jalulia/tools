/* riverbed-boundary · Riverbed boundary — TS-25 Growth over the record · Techniques & Templates · ø co.
   Lifted from techniques/ts-25-growth-over-the-record/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above 55 % the blue drapes over the crest and the tree stands on its own patch; under 18 % it is a sliver under the front swell. Softness above about 110 u turns the hill teal from end to end. Wobble past 50 u bulges the edge into the crest. */
export const id="riverbed-boundary", name="Riverbed boundary", code="TS-25", entry="ts-25-growth-over-the-record";
export const atoms=["boundary","dissolve","stochastic-threshold","area-solve"];
export const spec={
  "id": "riverbed-boundary",
  "short": "EDGE",
  "name": "Riverbed boundary",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "boundary",
    "dissolve",
    "stochastic-threshold",
    "area-solve"
  ],
  "params": {
    "share_pct": {
      "value": 40,
      "range": [
        18,
        55
      ],
      "step": 1,
      "unit": "%",
      "label": "Riverbed share",
      "note": "blue as a share of all land below the main silhouette, solved for exactly"
    },
    "angle_deg": {
      "value": 25.5,
      "range": [
        0,
        50
      ],
      "step": 0.5,
      "unit": "°",
      "label": "Boundary angle",
      "note": "how steeply the grass edge climbs to the right; 0 is a level water line"
    },
    "soft_u": {
      "value": 50,
      "range": [
        12,
        110
      ],
      "unit": "u",
      "scale": "linear",
      "label": "Boundary softness",
      "note": "width over which blue coverage rises from 0 to 1; the grain decides each pixel inside it"
    },
    "wobble_u": {
      "value": 8,
      "range": [
        0,
        50
      ],
      "step": 0.5,
      "unit": "u",
      "label": "Boundary wobble",
      "note": "how far the boundary line meanders either side of its course, before the dissolve"
    },
    "anchor_u": [
      467.2,
      321.3
    ],
    "level_u": 225,
    "knee_u": 20,
    "seed": 73
  },
  "limits": "Above 55 % the blue drapes over the crest and the tree stands on its own patch; under 18 % it is a sliver under the front swell. Softness above about 110 u turns the hill teal from end to end. Wobble past 50 u bulges the edge into the crest.",
  "implementation": "A line at the boundary angle through the measured anchor, smooth-maxed with a level cap at 225 u and meandered across its course by noise whose wavelength grows with the wobble (60 u + 3.2 × wobble, so it never folds), is shifted vertically until the blue area is the share of the land (a quantile of the signed distances on a 4 u grid); a pixel is blue when its coverage smoothstep beats its own grain value."
};
export const params={
  "share_pct": 40,
  "angle_deg": 25.5,
  "soft_u": 50,
  "wobble_u": 8,
  "anchor_u": [
    467.2,
    321.3
  ],
  "level_u": 225,
  "knee_u": 20,
  "seed": 73
};
export const A={};
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const th=P.angle_deg*Math.PI/180, tn=Math.tan(th), cs=Math.cos(th), k=P.knee_u, ax=P.anchor_u[0], ay=P.anchor_u[1], lv=P.level_u;
      /* wobble: a meander along the line's course (a = distance along it), pushed across it before the dissolve; tabled per 1 u */
      const pn=A.perlin(P.seed), sn=Math.sin(th), lw=60+3.2*P.wobble_u, WT=new Float32Array(2201); for(let i=0;i<=2200;i++){ const a=i-800; WT[i]=P.wobble_u>0?P.wobble_u*1.5*(0.85*pn(a/lw+0.5,3.7)+0.15*pn(a/(lw*0.37)+0.5,11.3)):0; }
      const wobAt=(x,y)=>{ let i=(x*cs-y*sn+800)|0; i=i<0?0:i>2200?2200:i; return WT[i]; };
      const yb=x=>{ const a=ay-tn*(x-ax), b=lv; return (a+b+Math.sqrt((a-b)*(a-b)+k*k))/2; };
      const sd0=(x,y,dl,pt)=>{ let s=(y-yb(x)-dl)*cs-wobAt(x,y); for(let i=0;i<pt.length;i++){ const p=pt[i], qx=(x-p.x)/p.rx, qy=(y-p.y)/p.ry, q=qx*qx+qy*qy; if(q<7)s-=p.k*Math.exp(-q); } return s; };
      const solve=(main,front,pt,Hu)=>{ const bs=[]; let land=0; for(let x=2;x<1000;x+=4){ const t=main(x)[0], f=front(x)[0]; for(let y=Math.max(t+1,2);y<Hu;y+=4){ land++; if(y<f)bs.push(sd0(x,y,0,pt)); } }
        /* blue iff base − dl·cs > 0, so the share is a quantile of the bases: no search needed */
        const b=Float64Array.from(bs).sort(), n=b.length, want=Math.round(P.share_pct/100*land); if(want<=0)return 900; if(want>=n)return Math.max(-900,b[0]/cs-1); return Math.max(-900,Math.min(900,(b[n-want-1]+b[n-want])/2/cs)); };
      return { yb, sd0, solve, wobAt, soft:Math.max(0.5,P.soft_u), wmax:0, cs, seed:P.seed, angle:th }; };
export default make;
