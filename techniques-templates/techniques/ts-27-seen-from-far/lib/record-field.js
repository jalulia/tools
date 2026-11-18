/* record-field · Record field — TS-27 Seen from far · Techniques & Templates · ø co.
   Lifted from techniques/ts-27-seen-from-far/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,G) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Shapes what grew: the clean hole at zero, how far the field reaches, how ragged its edge is. Past 110 u of raggedness the ring splits into islands. */
export const id="record-field", name="Record field", code="TS-27", entry="ts-27-seen-from-far";
export const atoms=["ring","density","noise","lobe"];
export const spec={
  "id": "record-field",
  "short": "FIELD",
  "name": "Record field",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "ring",
    "density",
    "noise",
    "lobe"
  ],
  "params": {
    "hole_u": {
      "value": 62,
      "range": [
        30,
        130
      ],
      "unit": "u",
      "label": "Hole at zero",
      "note": "radius of the clean circle around the origin"
    },
    "reach_u": {
      "value": 420,
      "range": [
        355,
        470
      ],
      "unit": "u",
      "label": "Field reach",
      "note": "radius where the last fringe dots stop"
    },
    "ragged_u": {
      "value": 50,
      "range": [
        0,
        110
      ],
      "unit": "u",
      "label": "Raggedness",
      "note": "how far the edge wanders and how many gaps open in the ring"
    },
    "lobe_u": 36,
    "skirt": 0.1,
    "stretch": [
      1.16,
      0.95
    ],
    "sprout": 0.2,
    "gaps": 0.92,
    "plateau": 0.6,
    "fringe": 0.15,
    "seed": 31
  },
  "limits": "Shapes what grew: the clean hole at zero, how far the field reaches, how ragged its edge is. Past 110 u of raggedness the ring splits into islands.",
  "implementation": "density = 1 − (1 − band)(1 − lobe): band rises over 24 u past the round hole, holds to 0.6 R and falls over 0.16 R on a radius stretched 1.16 across and 0.95 down, with the edge moved by noise; each turn adds a 36 u lobe with a flat top and a 0.1 skirt; the field tapers to nothing 445–478 u from the center on each axis, and nodes stay within 440 u, so nothing touches the plate edge; gaps are cut where a second noise passes 0.14–0.26. Growth by day is kept apart, so a new day costs one pass over the 4 u grid."
};
export const params={
  "hole_u": 62,
  "reach_u": 420,
  "ragged_u": 50,
  "lobe_u": 36,
  "skirt": 0.1,
  "stretch": [
    1.16,
    0.95
  ],
  "sprout": 0.2,
  "gaps": 0.92,
  "plateau": 0.6,
  "fringe": 0.15,
  "seed": 31
};
export const A={};
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A,G)=>{ const n1=A.perlin(P.seed), n2=A.perlin(P.seed+1), n3=A.perlin(P.seed+2), n4=A.perlin(P.seed+3); const H=P.hole_u, R=P.reach_u, Rg=P.ragged_u, L=P.lobe_u;
      const gap=Math.min(1,Rg/50)*P.gaps, nodes=G.nodes, th0=nodes.length?nodes[0].th:0, far=1.9*L;
      const lobe=d=>Math.max(0.95*(1-A.sstep(0.45*L,1.12*L,d)),P.skirt*(1-A.sstep(1.05*L,far,d)));
      const SX=P.stretch[0], SY=P.stretch[1];
      const parts=(x,y,o)=>{ const r0=Math.sqrt(x*x+y*y); const inner=A.sstep(H-6,H+18,r0)*(1-A.sstep(445,478,Math.abs(x)))*(1-A.sstep(445,478,Math.abs(y))); const r=Math.sqrt((x/SX)*(x/SX)+(y/SY)*(y/SY)); o.inner=inner; o.band=0; o.b=0; o.k1=-1; o.v1=0; o.k2=-1; o.v2=0; if(inner<=0)return o;
        const ro=P.plateau*R+Rg*1.7*n1.fbm(x*0.0045,y*0.0045,3); let band=1-A.sstep(ro-0.07*R,ro+0.09*R,r); band=band*band;
        band*=A.clamp(1.08+0.85*n3.fbm(x*0.03,y*0.03,2),0.35,1);
        if(gap>0)band*=1-gap*A.sstep(0.14,0.26,n2.fbm(x*0.022,y*0.022,3));
        o.band=Math.min(1,Math.max(band,P.fringe*(1-A.sstep(ro,ro+0.2*R,r))))*inner;
        let ph=(Math.atan2(y,x)-th0)/6.2832; ph-=Math.floor(ph); o.b=1+G.walk_days*ph+5*n2(x*0.01+40,y*0.01);
        const wob=Math.sqrt(1+0.9*n3(x*0.026+17,y*0.026-5));
        for(let k=0;k<nodes.length;k++){ const dx=x-nodes[k].x, dy=y-nodes[k].y; const dd=Math.sqrt(dx*dx+dy*dy)*wob; if(dd>=far)continue; const v=lobe(dd)*inner; if(v>o.v1){ o.k2=o.k1; o.v2=o.v1; o.k1=k; o.v1=v; } else if(v>o.v2){ o.k2=k; o.v2=v; } }
        return o; };
      const lwAt=t=>nodes.map(q=>A.sstep(q.day,q.day+G.grow_days*0.75,t)), gr=(b,t)=>P.sprout+(1-P.sprout)*A.sstep(b,b+G.grow_days,t);
      const at=(x,y,t)=>{ const o=parts(x,y,{}); if(o.inner<=0)return 0; const lw=lwAt(t); const band=o.band*gr(o.b,t); const lob=Math.max(o.k1>=0?lw[o.k1]*o.v1:0,o.k2>=0?lw[o.k2]*o.v2:0); return 1-(1-band)*(1-lob); };
      const grid=(GR,gs)=>{ const gn=Math.round(2*GR/gs)+1, N=gn*gn, BA=new Float32Array(N), BD=new Float32Array(N), K1=new Int16Array(N), V1=new Float32Array(N), K2=new Int16Array(N), V2=new Float32Array(N), ND=new Float32Array(N), o={};
        for(let j=0;j<gn;j++)for(let i=0;i<gn;i++){ const x=-GR+i*gs, y=-GR+j*gs, c=j*gn+i; parts(x,y,o); BA[c]=o.band; BD[c]=o.b; K1[c]=o.k1; V1[c]=o.v1; K2[c]=o.k2; V2[c]=o.v2; ND[c]=A.clamp(1.5*n4.fbm(x*0.009,y*0.009,2)+0.7*n4(x*0.05+9,y*0.05-3),-1,1); }
        const F=new Float32Array(N); let tF=null;
        return { GR, gs, gn, F, nd:ND, day:t=>{ if(t===tF)return F; tF=t; const lw=lwAt(t); for(let c=0;c<N;c++){ const band=BA[c]>0?BA[c]*gr(BD[c],t):0; const l1=K1[c]>=0?lw[K1[c]]*V1[c]:0, l2=K2[c]>=0?lw[K2[c]]*V2[c]:0; const lob=l1>l2?l1:l2; F[c]=1-(1-band)*(1-lob); } return F; } }; };
      return { at, grid, hole:H, reach:R }; };
export default make;
