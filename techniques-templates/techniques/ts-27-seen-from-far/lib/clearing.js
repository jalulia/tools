/* clearing · Clearing — TS-27 Seen from far · Techniques & Templates · ø co.
   Lifted from techniques/ts-27-seen-from-far/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V,G) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: The walk takes 40 days and growth 16 more, so day 60 is the full ring. The painting is drawn once per plate size and palette, and reused along the Distance track. */
export const id="clearing", name="Clearing", code="TS-27", entry="ts-27-seen-from-far";
export const atoms=["top-down","illustration","grain","growth"];
export const spec={
  "id": "clearing",
  "short": "CLR",
  "name": "Clearing",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "top-down",
    "illustration",
    "grain",
    "growth"
  ],
  "params": {
    "days": {
      "value": 60,
      "note": "day of the record; Play runs it from 6 to 60"
    },
    "walk_days": 40,
    "grow_days": 16,
    "grain": 0.03,
    "tree_ring_u": "reach + 70 … reach + 190",
    "seed": 27
  },
  "limits": "The walk takes 40 days and growth 16 more, so day 60 is the full ring. The painting is drawn once per plate size and palette, and reused along the Distance track.",
  "implementation": "The trees are drawn last, and the painting is kept once without them. The ground is a lookup from the record density (mown at zero, lawn, meadow, shrub) with 3 % per-pixel grain; dabs, grass ticks, the trodden path, sprouts, grass tufts and flowers where the record is dense, plantings at each turn and tree canopies are drawn over it."
};
export const params={
  "days": 60,
  "walk_days": 40,
  "grow_days": 16,
  "grain": 0.03,
  "tree_ring_u": "reach + 70 … reach + 190",
  "seed": 27
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.lut=stops=>{ const L=new Array(256); for(let i=0;i<256;i++){ const t=i/255; let c=A.hex(stops[stops.length-1][1]); for(let k=1;k<stops.length;k++){ if(t<=stops[k][0]){ const u=(t-stops[k-1][0])/((stops[k][0]-stops[k-1][0])||1e-6); c=A.mix(A.hex(stops[k-1][1]),A.hex(stops[k][1]),A.clamp(u,0,1)); break; } } L[i]=c; } return L; };
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
A.mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
A.rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
export const make=(P,u,A,V,G)=>({ draw:(c)=>{ const W=c.canvas.width, Hh=c.canvas.height, s=G.s, cx=G.cx, cy=G.cy, t=G.days, H=G.hole_u, R=G.reach_u;
      const g=G.grid, F=g.F, gn=g.gn, GR=g.GR, gs=g.gs; const samp=(x,y)=>{ let fx=(x+GR)/gs, fy=(y+GR)/gs; fx=fx<0?0:fx>gn-1.001?gn-1.001:fx; fy=fy<0?0:fy>gn-1.001?gn-1.001:fy; const ix=fx|0, iy=fy|0, tx=fx-ix, ty=fy-iy, o=iy*gn+ix; return (F[o]*(1-tx)+F[o+1]*tx)*(1-ty)+(F[o+gn]*(1-tx)+F[o+gn+1]*tx)*ty; };
      const rng=A.rng(P.seed), nz=A.perlin(P.seed+5); const L=A.lut([[0,V.mown],[0.3,V.lawn],[0.7,V.meadow],[1,V.shrub]]); const hx=A.hex, rgb=(k,a)=>A.rgb(k,a);
      const Rt=R+70; const x0=-cx/s, x1=(W-cx)/s, y0=-cy/s, y1=(Hh-cy)/s;
      /* mottle on a coarse world grid */
      const mg=Math.round((x1-x0)/8)+2, mh=Math.round((y1-y0)/8)+2, M=new Float32Array(mg*mh); for(let j=0;j<mh;j++)for(let i=0;i<mg;i++)M[j*mg+i]=nz.fbm((x0+i*8)*0.006,(y0+j*8)*0.006,3);
      const SX=(G.stretch||[1,1])[0], SY=(G.stretch||[1,1])[1];
      const tone=(x,y,f,m)=>{ const r=Math.sqrt(x*x+y*y), re=Math.sqrt((x/SX)*(x/SX)+(y/SY)*(y/SY)); return 0.30+0.5*f+0.13*m-0.26*(1-A.sstep(H-12,H+10,r))+0.30*A.sstep(Rt-40,Rt+60,re); };
      if(!G.treesOnly){
      /* 1 · ground: lookup + grain, per pixel */
      const id=c.createImageData(W,Hh), d=id.data; let sd=(P.seed*7919)|0;
      for(let Y=0;Y<Hh;Y++){ const y=(Y+0.5-cy)/s, my=(y-y0)/8; const jy=my<0?0:my>mh-1.001?mh-1.001:my, j0=jy|0, ty=jy-j0;
        for(let X=0;X<W;X++){ const x=(X+0.5-cx)/s, mx=(x-x0)/8; const ix=mx<0?0:mx>mg-1.001?mg-1.001:mx, i0=ix|0, tx=ix-i0, o=j0*mg+i0; const m=(M[o]*(1-tx)+M[o+1]*tx)*(1-ty)+(M[o+mg]*(1-tx)+M[o+mg+1]*tx)*ty;
          let tn=tone(x,y,samp(x,y),m); tn=tn<0?0:tn>1?1:tn; const k=L[(tn*255)|0]; sd=sd+0x6D2B79F5|0; let q=Math.imul(sd^sd>>>15,1|sd); q=q+Math.imul(q^q>>>7,61|q)^q; const gr=1+P.grain*(((q^q>>>14)>>>0)/2147483648-1);
          const i=(Y*W+X)*4; d[i]=k[0]*gr; d[i+1]=k[1]*gr; d[i+2]=k[2]*gr; d[i+3]=255; } }
      c.putImageData(id,0,0); }
      c.save(); c.setTransform(s,0,0,s,cx,cy); c.lineCap='round'; c.lineJoin='round';
      const vis=(x,y,m)=>x>x0-m&&x<x1+m&&y>y0-m&&y<y1+m;
      if(!G.treesOnly){
      /* 2 · dabs: soft painted patches */
      for(let i=0;i<520;i++){ const x=-560+rng()*1120, y=-560+rng()*1120, w=10+rng()*26, h=w*(0.35+rng()*0.3), a=rng()*3.1416, lt=rng()<0.5; if(!vis(x,y,40))continue; const f=samp(x,y); const k=L[(A.clamp(tone(x,y,f,0),0,1)*255)|0];
        c.fillStyle=rgb(lt?A.mix(k,hx(V.mown),0.45):A.mix(k,hx(V.tree),0.35),0.16); c.beginPath(); c.ellipse(x,y,w,h,a,0,6.2832); c.fill(); }
      /* 3 · grass ticks on a jittered 7 u grid */
      const hh=(i,j,k)=>{ let n=(i*374761393+j*668265263+k*1274126177+P.seed*2246822519)|0; n=Math.imul(n^(n>>>13),1274126177); n=n^(n>>>16); return (n>>>0)/4294967296; };
      const dark=new Path2D(), lite=new Path2D(); for(let gy=Math.floor(y0/7);gy<y1/7+1;gy++)for(let gx=Math.floor(x0/7);gx<x1/7+1;gx++){ const x=(gx+hh(gx,gy,1))*7, y=(gy+hh(gx,gy,2))*7, a=-1.5708+(hh(gx,gy,3)-0.5)*1.3, l=2.2+hh(gx,gy,4)*3.4, w=hh(gx,gy,5); const r=Math.sqrt(x*x+y*y); const ll=r<H?l*0.5:l; const p=w<0.55?dark:lite; p.moveTo(x,y); p.lineTo(x+Math.cos(a)*ll,y+Math.sin(a)*ll); }
      c.lineWidth=0.9; c.strokeStyle=rgb(hx(V.shrub),0.32); c.stroke(dark); c.strokeStyle=rgb(hx(V.mown),0.42); c.stroke(lite);
      /* 4 · the trodden path */
      G.turns.path(c,0,0,1); c.strokeStyle=rgb(hx(V.path),0.34); c.lineWidth=13; c.stroke(); c.strokeStyle=rgb(hx(V.path),0.78); c.lineWidth=6.5; c.stroke();
      /* 5 · sprouts from day one */
      const sp=A.rng(P.seed+11); for(let i=0;i<70;i++){ const a=sp()*6.2832, rr=H+18+sp()*(R*0.6-H), day=1+sp()*26, rot=sp()*6.2832; const x=Math.cos(a)*rr, y=Math.sin(a)*rr; const age=t-day; if(age<0||!vis(x,y,10))continue; const z=Math.min(1,0.45+age/12)*2.6;
        c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=V.mown; c.beginPath(); c.ellipse(-z*0.8,0,z,z*0.45,0.3,0,6.2832); c.ellipse(z*0.8,0,z,z*0.45,-0.3,0,6.2832); c.fill(); c.restore(); }
      /* 6 · meadow where the record is dense: grass tufts, then flowers, kept off the path */
      const ks=hx(V.shrub), kmw=hx(V.mown), kd=A.mix(hx(V.tree),hx(V.shade),0.25), tu=new Path2D(), tl=new Path2D(), ts=new Path2D();
      for(let gy=-52;gy<52;gy++)for(let gx=-52;gx<52;gx++){ const x=(gx+hh(gx,gy,11))*10, y=(gy+hh(gx,gy,12))*10, q=hh(gx,gy,13), rs=hh(gx,gy,14), a0=hh(gx,gy,15)*6.2832; if(!vis(x,y,14))continue; const f=samp(x,y); if(q>Math.pow(f,1.15)*0.98)continue; if(G.turns.dist(x,y)<6)continue; const rr=4+4.5*f+2.4*rs;
        ts.moveTo(x+1.2+rr*0.62,y+1.6); ts.arc(x+1.2,y+1.6,rr*0.62,0,6.2832);
        for(let b=0;b<7;b++){ const a=a0+b*0.8976+(hh(gx+b,gy,16)-0.5)*0.5, l=rr*(0.65+0.45*hh(gx,gy+b,17)); const p2=b%3===0?tl:tu; p2.moveTo(x,y); p2.quadraticCurveTo(x+Math.cos(a+0.3)*l*0.55,y+Math.sin(a+0.3)*l*0.55,x+Math.cos(a)*l,y+Math.sin(a)*l); } }
      c.fillStyle=rgb(kd,0.2); c.fill(ts); c.lineWidth=1.25; c.strokeStyle=rgb(ks,0.85); c.stroke(tu); c.lineWidth=1.0; c.strokeStyle=rgb(A.mix(ks,kmw,0.6),0.8); c.stroke(tl);
      const fw=[new Path2D(),new Path2D(),new Path2D()], fc=new Path2D();
      for(let gy=-35;gy<35;gy++)for(let gx=-35;gx<35;gx++){ const x=(gx+hh(gx,gy,21))*15, y=(gy+hh(gx,gy,22))*15, q=hh(gx,gy,23), ty2=hh(gx,gy,24), z=0.8+0.5*hh(gx,gy,25); if(!vis(x,y,8))continue; const f=samp(x,y); if(f<0.55||q>(f-0.55)*0.75)continue; if(G.turns.dist(x,y)<6)continue;
        const k2=ty2<0.45?0:ty2<0.7?1:2, pth=fw[k2]; for(let l=0;l<5;l++){ const b=l*1.2566+q*9; const px=x+Math.cos(b)*1.7*z, py=y+Math.sin(b)*1.7*z; pth.moveTo(px+1.35*z,py); pth.arc(px,py,1.35*z,0,6.2832); } fc.moveTo(x+0.8*z,y); fc.arc(x,y,0.8*z,0,6.2832); }
      c.fillStyle=rgb(hx(V.petal)); c.fill(fw[0]); c.fillStyle=rgb(hx(V.lilac)); c.fill(fw[1]); c.fillStyle=rgb(hx(V.bloom)); c.fill(fw[2]); c.fillStyle=rgb(A.mix(hx(V.bloom),hx(V.tree),0.15)); c.fill(fc);
      /* 7 · plantings at each turn: sprout, leaves, bloom */
      const pl=A.rng(P.seed+23), kl=hx(V.meadow), kp=hx(V.petal), kq=hx(V.lilac), kb=hx(V.bloom);
      G.turns.nodes.forEach((n,k)=>{ for(let j=0;j<6;j++){ const a=pl()*6.2832, rr=6+pl()*24, rot=pl()*6.2832, sz=0.85+pl()*0.4; const x=n.x+Math.cos(a)*rr, y=n.y+Math.sin(a)*rr; const age=t-(n.day+j*1.6); if(age<0||!vis(x,y,14))continue; const z=sz*Math.min(1,0.35+age/14);
        c.save(); c.translate(x,y); c.rotate(rot);
        if(age<4){ c.fillStyle=V.mown; c.beginPath(); c.ellipse(-2.4*z,0,3*z,1.4*z,0.3,0,6.2832); c.ellipse(2.4*z,0,3*z,1.4*z,-0.3,0,6.2832); c.fill(); }
        else { c.fillStyle=rgb(A.mix(kl,hx(V.tree),0.25),0.35); c.beginPath(); c.arc(1.4*z,1.8*z,7.2*z,0,6.2832); c.fill(); c.fillStyle=rgb(kl); c.beginPath(); for(let l=0;l<5;l++){ const b=l*1.2566; c.moveTo(0,0); c.ellipse(Math.cos(b)*4*z,Math.sin(b)*4*z,4.4*z,1.9*z,b,0,6.2832); } c.fill();
          if(age>=10){ const op=Math.min(1,(age-10)/5); if(k%2===0){ c.fillStyle=rgb(A.mix(kq,kp,0.4),op); c.beginPath(); for(let l=0;l<5;l++){ const b=l*1.2566-1.57; c.moveTo(Math.cos(b)*2.6*z,Math.sin(b)*2.6*z); c.arc(Math.cos(b)*2.6*z,Math.sin(b)*2.6*z,2.2*z,0,6.2832); } c.fill(); c.fillStyle=rgb(kp,op); c.beginPath(); for(let l=0;l<5;l++){ const b=l*1.2566-1.57; c.moveTo(Math.cos(b)*2.3*z-0.5*z,Math.sin(b)*2.3*z-0.5*z); c.arc(Math.cos(b)*2.3*z-0.5*z,Math.sin(b)*2.3*z-0.5*z,1.4*z,0,6.2832); } c.fill(); c.fillStyle=rgb(kb,op); c.beginPath(); c.arc(0,0,1.3*z,0,6.2832); c.fill(); }
            else { c.fillStyle=rgb(A.mix(kb,hx(V.tree),0.2),op); c.beginPath(); for(let l=0;l<7;l++){ const b=l*0.8976; const rr2=l===6?0:3*z; c.moveTo(Math.cos(b)*rr2+1.9*z,Math.sin(b)*rr2); c.arc(Math.cos(b)*rr2,Math.sin(b)*rr2,1.9*z,0,6.2832); } c.fill(); c.fillStyle=rgb(A.mix(kb,kp,0.45),op); c.beginPath(); for(let l=0;l<6;l++){ const b=l*1.0472; c.moveTo(Math.cos(b)*3*z-0.6*z+0.8*z,Math.sin(b)*3*z-0.6*z); c.arc(Math.cos(b)*3*z-0.6*z,Math.sin(b)*3*z-0.6*z,0.8*z,0,6.2832); } c.fill(); } } }
        c.restore(); } });
      }
      if(G.beforeTrees)G.beforeTrees(c);   /* the painting without its trees, for a caller that lets them go first */
      /* 8 · trees around the edge: shadow, canopy lumps, leaf dabs lit from the top left */
      const tr=A.rng(P.seed+29), kT=hx(V.tree), kS=A.mix(kT,hx(V.shade),0.45), kL=A.mix(kT,hx(V.lawn),0.5), kH=A.mix(kT,hx(V.mown),0.72); const NT=30;
      const T1=new Path2D(), T2=new Path2D(), T3=new Path2D(), T4=new Path2D(), T5=new Path2D(), T6=new Path2D();
      for(let i=0;i<NT;i++){ const a=6.2832*(i+(tr()-0.5)*0.6)/NT, rr=Rt+tr()*120, rad=58+tr()*52; const x=Math.cos(a)*rr*SX, y=Math.sin(a)*rr*SY; const lumps=[]; for(let l=0;l<10;l++){ const b=tr()*6.2832, e=tr()*0.55*rad; lumps.push([x+Math.cos(b)*e,y+Math.sin(b)*e,rad*(0.42+tr()*0.25)]); } const hs=[]; for(let l=0;l<46;l++)hs.push([tr(),tr(),tr()]); if(!vis(x,y,rad+30)||(G.keep&&!G.keep(i)))continue;
        for(const q of lumps){ T1.moveTo(q[0]+14+q[2]*1.05,q[1]+18); T1.arc(q[0]+14,q[1]+18,q[2]*1.05,0,6.2832); T2.moveTo(q[0]+q[2],q[1]); T2.arc(q[0],q[1],q[2],0,6.2832); const r2=q[2]*0.6; T3.moveTo(q[0]-q[2]*0.26+r2,q[1]-q[2]*0.32); T3.arc(q[0]-q[2]*0.26,q[1]-q[2]*0.32,r2,0,6.2832); }
        hs.forEach((h,l)=>{ const q=lumps[(h[0]*lumps.length)|0]; const ang=h[1]*6.2832, e=q[2]*0.85*Math.sqrt(h[2]); const px=q[0]+Math.cos(ang)*e, py=q[1]+Math.sin(ang)*e; const lit=(Math.cos(ang)*-0.7+Math.sin(ang)*-0.7)>0.1; const r2=q[2]*(0.07+0.07*h[2]); const P2=l<14?T6:(lit?T4:T5); P2.moveTo(px+r2,py); P2.arc(px,py,r2,0,6.2832); }); }
      c.fillStyle=rgb(kS,0.26); c.fill(T1); c.fillStyle=rgb(kT); c.fill(T2); c.fillStyle=rgb(kL,0.72); c.fill(T3); c.fillStyle=rgb(A.mix(kT,kS,0.5),0.55); c.fill(T5); c.fillStyle=rgb(kH,0.6); c.fill(T4); c.fillStyle=rgb(A.mix(kL,kH,0.5),0.45); c.fill(T6);
      c.restore(); } });
export default make;
