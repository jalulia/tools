/* ST-02 · Stipple-ray bloom — imported from technique-studies/st-02-stipple-ray-bloom.html at ck-e12.
   Reference-study plate; every technique block is provable from a point on the
   plate (coverage rule). Renders in canvas2d, 1152×2048 design pixels.
   compare{} off — public build cannot ship the reference; the rebuild carries the argument. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'st-02-stipple-ray-bloom',
  index: 'ST-02',
  order: 3020,
  title: 'Stipple-ray bloom',
  section: 'studies',
  style: 'technique-study',
  status: 'canonical',
  lane: 'canvas2d',
  governed_by: ['composing-computational-material-systems'],
  tags: ['Reference study'],

  source: {
    kind: 'reference-study',
    title: 'Reference 02 · stipple-ray bloom, dot screens on cream',
    note: 'Imported at ck-e12 from technique-studies/. compare{} off — public build cannot ship the reference; the rebuild carries the argument.'
  },

  frame: { designWidth: 1152, aspect: '1152/2048', previewHeight: 2048 },
  thumb: 'thumb.png',

  body: [
'Every form is a population of round dots on warm cream. Each flower head is a tilted bowl: a dense dotted rim ellipse, short pale rays running inward to a lobed cream corolla with gold speckle, and about 108 longer rays radiating outward at 6.0 u bead pitch, pale only at the rim and ultramarine #2B3AD1 from a third of the way out. No outline anywhere.',
    'Five heads step through three tilts beside one continuous vine: an edge-on crown over a funnel, two three-quarter bowls, two top-down discs. Leaves are asymmetric cordate silhouettes rendered only as an 8.6 u dot screen that falls to nothing at the margin, over a fine interior stipple. A tapered dry-pen vine and a per-pixel paper mottle finish the plate.'
  ],

  method: 'Paper mottle · dotted bowl · gold speckle · dot-screen leaf · dry-pen vine',

  plate: {
    fig: '3.2', series: 'STUDIES', sheet: 2, of: 8,
    designWidth: 1152, designHeight: 2048,
    render: function (canvas, w, h, dpr) {
    const U=1000, S=w/1000, V=h/S;
    let seed=2202; const rnd=()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const rr=(a,b)=>a+(b-a)*rnd();
    const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    const rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
    const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
    const C={ground:'#EEE6D5',rayA:'#DCE1F5',rayB:'#95A3E8',rayC:'#5566DF',rayD:'#3343D6',spot:'#2B3AD1',rayE:'#1622C8',rim:'#4A5BDC',cor:'#F6EEDA',cream:'#F7F0DC',gold:'#E2B84E',leafD:'#27432D',leafP:'#8FA282',vine:'#2A4830'};
    const ramp=(stops,t)=>{ t=Math.max(0,Math.min(1,t)); for(let i=1;i<stops.length;i++) if(t<=stops[i][0]){ const u=(t-stops[i-1][0])/(stops[i][0]-stops[i-1][0]); return mix(stops[i-1][1],stops[i][1],u); } return stops[stops.length-1][1]; };
    const RAY=[[0,hex(C.rayB)],[0.06,hex(C.rayC)],[0.16,hex(C.rayD)],[0.36,hex(C.spot)],[1,hex(C.rayE)]];
    const INNER=[[0,[142,157,232]],[0.5,[176,186,236]],[1,[200,207,241]]];
    const mkNoise=()=>{ const p=[rnd()*7,rnd()*7,rnd()*7], f=[1,2.13,4.7], a=[1,0.5,0.25]; return t=>(Math.sin(t*f[0]+p[0])*a[0]+Math.sin(t*f[1]+p[1])*a[1]+Math.sin(t*f[2]+p[2])*a[2])/1.75; };
    const hash2=(x,y)=>{ let h=(x*374761393+y*668265263)|0; h=(h^(h>>>13))*1274126177|0; h=h^(h>>>16); return (h&0xffff)/65535; };
    // 2-D value noise (bilinear on a hashed lattice), returns 0..1
    const vnoise=(x,y,cell,sx,sy)=>{ const gx=x/cell+sx, gy=y/cell+sy; const x0=Math.floor(gx), y0=Math.floor(gy); const fx=gx-x0, fy=gy-y0; const u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy); const a=hash2(x0,y0), b=hash2(x0+1,y0), c=hash2(x0,y0+1), d=hash2(x0+1,y0+1); return (a+(b-a)*u)+((c+(d-c)*u)-(a+(b-a)*u))*v; };
    const ctx=canvas.getContext('2d'); ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    const dot=(x,cx,cy,r,col)=>{ x.fillStyle=col; x.beginPath(); x.arc(cx,cy,r,0,6.2832); x.fill(); };
    // ---------- ground: ImageData pass ----------
    { const W=canvas.width, Hh=canvas.height; const id=ctx.createImageData(W,Hh); const d=id.data; const g=hex(C.ground); const k=1/(dpr*S); const cx=W/2, cy=Hh/2, dm=Math.hypot(cx,cy);
      const cell=3.4*dpr*S; const lfc=28; const asp=Hh/W; const sxo=rnd()*100, syo=rnd()*100, sxo2=rnd()*100, syo2=rnd()*100;
      // low-frequency mottle precomputed on a coarse grid (8 px) then bilinear per pixel to keep it fast
      const gs=8; const gw=Math.ceil(W/gs)+2, gh=Math.ceil(Hh/gs)+2; const LF=new Float32Array(gw*gh);
      for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){ const ux=i*gs*k, uy=j*gs*k; LF[j*gw+i]=(vnoise(ux,uy,lfc,sxo,syo)-0.5)*0.012+(vnoise(ux,uy,lfc*3.1,sxo2,syo2)-0.5)*0.012; }
      for(let y=0;y<Hh;y++){ const jy=y/gs, j0=jy|0, fy=jy-j0; const vy=y/Hh;
        for(let x=0;x<W;x++){ const ix=x/gs, i0=ix|0, fx=ix-i0; const l00=LF[j0*gw+i0], l10=LF[j0*gw+i0+1], l01=LF[(j0+1)*gw+i0], l11=LF[(j0+1)*gw+i0+1]; const lf=(l00+(l10-l00)*fx)+((l01+(l11-l01)*fx)-(l00+(l10-l00)*fx))*fy;
          const hf=(hash2((x/cell)|0,(y/cell)|0)-0.5)*0.016; const ux=x/W; const dTR=Math.hypot(1-ux,vy*asp), dBR=Math.hypot(1-ux,(1-vy)*asp); const vig=1-0.085*Math.exp(-dTR*dTR/0.30)-0.03*Math.exp(-dBR*dBR/0.25);
          const f=vig*(1+hf+lf); const i=(y*W+x)*4; d[i]=Math.min(255,g[0]*f); d[i+1]=Math.min(255,g[1]*f); d[i+2]=Math.min(255,g[2]*f); d[i+3]=255; } }
      ctx.putImageData(id,0,0); }
    // ---------- helpers ----------
    const bez=(p0,p1,p2,p3,t)=>{ const u=1-t; return [u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0], u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]; };
    const bezT=(p0,p1,p2,p3,t)=>{ const u=1-t; return [3*u*u*(p1[0]-p0[0])+6*u*t*(p2[0]-p1[0])+3*t*t*(p3[0]-p2[0]), 3*u*u*(p1[1]-p0[1])+6*u*t*(p2[1]-p1[1])+3*t*t*(p3[1]-p2[1])]; };
    const pip=(P,x,y)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const a=P[i],b=P[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c; } return c; };
    const segDist=(P,x,y)=>{ let m=1e9; for(let i=0;i<P.length;i++){ const a=P[i],b=P[(i+1)%P.length]; const vx=b[0]-a[0],vy=b[1]-a[1]; const L2=vx*vx+vy*vy||1; let t=((x-a[0])*vx+(y-a[1])*vy)/L2; t=t<0?0:t>1?1:t; const dx=a[0]+vx*t-x, dy=a[1]+vy*t-y; const d=dx*dx+dy*dy; if(d<m)m=d; } return Math.sqrt(m); };
    const bbox=P=>{ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const p of P){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; } return [x0,y0,x1,y1]; };
    const sstep=(a,b,t)=>{ t=Math.max(0,Math.min(1,(t-a)/(b-a))); return t*t*(3-2*t); };
    // ---------- leaves: cordate lobes rendered only as dot screens ----------
    // cordate leaf: hand-set outline (apex at +y, basal sinus at −y) → asymmetric widths, a bent midrib (curl), a drawn-out apex, Catmull-Rom smoothed, 2 % edge noise
    const CORD=[[0.03,1.0],[0.06,0.93],[0.11,0.84],[0.21,0.72],[0.36,0.54],[0.52,0.32],[0.63,0.06],[0.64,-0.24],[0.54,-0.50],[0.38,-0.67],[0.21,-0.68],[0.09,-0.56],[0.02,-0.36],[-0.06,-0.52],[-0.17,-0.67],[-0.33,-0.71],[-0.49,-0.60],[-0.60,-0.36],[-0.63,-0.06],[-0.52,0.30],[-0.37,0.52],[-0.22,0.71],[-0.12,0.84],[-0.07,0.93]];
    const cordate=(cx,cy,H,ang,curl,aL,aR)=>{ const k=H/1.76; const nz=mkNoise(); const V=CORD.map(([x,y])=>{ x*=x<0?aL:aR; x+=curl*(y+0.76)*(y+0.76)*0.32; return [x*k,-y*k]; }); const P=[]; const n=V.length, sub=7; const c=Math.cos(ang),s=Math.sin(ang);
      for(let i=0;i<n;i++){ const p0=V[(i-1+n)%n],p1=V[i],p2=V[(i+1)%n],p3=V[(i+2)%n]; for(let j=0;j<sub;j++){ const t=j/sub, t2=t*t, t3=t2*t; const x=0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3); const y=0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3); const e=1+0.02*nz((i+t)*1.7); P.push([cx+(x*c-y*s)*e,cy+(x*s+y*c)*e]); } } return P; };
    const leaf=(x,lobes,gridAng)=>{ // lobes: array of polygons
      const leafD=hex(C.leafD), leafP=hex(C.leafP); const pitch=8.6; const ca=Math.cos(gridAng), sa=Math.sin(gridAng);
      let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9; for(const P of lobes){ const b=bbox(P); bx0=Math.min(bx0,b[0]); by0=Math.min(by0,b[1]); bx1=Math.max(bx1,b[2]); by1=Math.max(by1,b[3]); }
      const cx=(bx0+bx1)/2, cy=(by0+by1)/2; const R=Math.hypot(bx1-bx0,by1-by0)/2+12;
      // per-lobe signed depth (positive inside); overlaps count as extra depth so lobe unions read darker where they stack
      const depths=(px,py)=>{ let best=-1e9, cnt=0; for(const P of lobes){ const d=segDist(P,px,py); const inside=pip(P,px,py); const v=inside?d:-d; if(inside)cnt++; if(v>best)best=v; } return [best,cnt]; };
      const n1=rnd()*100, n2=rnd()*100;
      // coarse screen: full-size dots in the margin band, shrinking and fading toward the middle
      const coarse=(offset,col,dmax,alpha,band)=>{ const N=Math.ceil(R/pitch); for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){ const gx=(i+offset)*pitch, gy=(j+offset)*pitch; const px=cx+gx*ca-gy*sa, py=cy+gx*sa+gy*ca; const [d,cnt]=depths(px,py); if(d<-2)continue; const edge=sstep(-2,10,d); const inner=1-band*sstep(30,80,d); let r=dmax/2*edge*inner*(0.9+0.2*hash2(i+400,j+400)); if(r<0.45)continue; x.fillStyle=rgb(col,alpha*(0.75+0.25*edge)); x.beginPath(); x.arc(px+(hash2(i,j)-0.5)*1.2,py+(hash2(j,i+77)-0.5)*1.2,r,0,6.2832); x.fill(); } };
      coarse(0,leafD,5.2,1.0,0.4);
      coarse(0.5,leafP,2.4,0.55,0.3);
      // interior stipple: fine dots, density grows with depth and with stacked lobes, mottled by value noise
      const area=(bx1-bx0)*(by1-by0); const n=Math.round(area*150/1000);
      for(let k=0;k<n;k++){ const px=rr(bx0,bx1), py=rr(by0,by1); const [d,cnt]=depths(px,py); if(d<1)continue; const dens=(0.12+0.88*sstep(4,42,d))*(0.25+0.75*vnoise(px,py,44,n1,n2))*(0.55+0.45*vnoise(px,py,12,n2,n1))*(cnt>1?1.25:1); if(rnd()>dens)continue; const pale=rnd()<0.38; dot(x,px,py,rr(0.45,0.9),pale?rgb(leafP,0.7):rgb(leafD,0.85)); }
    };
    // ---------- vine: tapered dry-pen curve ----------
    const vine=(x,p0,p1,p2,p3,w0,taper0,taper1,wobble,t0,t1)=>{ t0=t0||0; t1=t1===undefined?1:t1; const nz=mkNoise(), nz2=mkNoise(); const col=hex(C.vine); const L=(()=>{ let s=0,q=p0; for(let i=1;i<=60;i++){ const p=bez(p0,p1,p2,p3,i/60); s+=Math.hypot(p[0]-q[0],p[1]-q[1]); q=p; } return s; })(); const steps=Math.max(20,Math.round(L*(t1-t0)/4)); x.lineCap='round'; x.lineJoin='round'; let prev=null;
      const wAt=t=>{ const tp=Math.pow(Math.sin(Math.PI*(taper0+(taper1-taper0)*t)),0.6); return Math.max(1.6,w0*tp*(1+0.22*nz(t*L*0.11)+0.08*nz(t*L*0.9))); };
      for(let i=0;i<=steps;i++){ const t=t0+(t1-t0)*i/steps; let p=bez(p0,p1,p2,p3,t); const tg=bezT(p0,p1,p2,p3,t); const tl=Math.hypot(tg[0],tg[1])||1; const nx=-tg[1]/tl, ny=tg[0]/tl; const off=wobble*nz2(t*L*0.02); p=[p[0]+nx*off,p[1]+ny*off]; if(prev){ x.strokeStyle=rgb(col,0.97); x.lineWidth=wAt(t); x.beginPath(); x.moveTo(prev[0],prev[1]); x.lineTo(p[0],p[1]); x.stroke(); }
        // dry-pen flecks along both edges
        for(let f=0;f<2;f++) if(rnd()<0.7){ const wv=wAt(t); const sgn=rnd()<0.5?-1:1; const o=sgn*(wv/2+rr(-0.5,2.2)); dot(x,p[0]+nx*o+rr(-1.2,1.2),p[1]+ny*o+rr(-1.2,1.2),rr(0.45,0.9),rgb(col,rr(0.3,0.8))); }
        prev=p; } };
    // ---------- flower head: a tilted BOWL ----------
    // R: outer radius (u). tilt θ: 0 = top-down (full disc), π/2 = edge-on. roll: screen rotation of the near side (0 = near side screen-down).
    // rim ellipse (Rr, Rr·cosθ) = a dense dot row; the corolla sits at the bowl bottom, displaced 0.3·Rr·sinθ toward the near side;
    // inner rays run rim → corolla (short, pale, converging; hidden on the near side by the corolla), outer rays run rim → out along the ellipse normal (the burr), tips drooping toward the near side.
    const head=(x,cx,cy,R,tilt,roll,opts)=>{ opts=opts||{}; const Rr=R*0.50, Rc=R*(opts.rc||(0.22+0.08*Math.cos(tilt))); const ct=Math.cos(tilt), st=Math.sin(tilt); const cr=Math.cos(roll), sr=Math.sin(roll); const cyo=0.35*Rr*st; // corolla centre offset (bowl depth)
      const proj=(lx,ly)=>[cx+lx*cr-ly*sr, cy+lx*sr+ly*cr];
      const nRays=opts.nRays||Math.round(rr(100,116)); const phase=rr(0,6.28); const twSign=opts.twSign||1;
      const rays=[]; for(let i=0;i<nRays;i++){ const phi=phase+i/nRays*Math.PI*2+rr(-0.06,0.06)*(Math.PI*2/nRays); const lm=1+0.16*(Math.sin(2*phi+phase)+0.6*Math.sin(3*phi-phase*2)+0.4*Math.sin(5*phi+1.3))/2+rr(-0.09,0.09); const Lr=(R-Rr)*(opts.lenScale||1)*lm*(1-0.42*st*Math.sin(phi))*(rnd()<0.08?rr(1.12,1.24):1); rays.push({phi,Lr,near:Math.sin(phi),tw:0.09*(1+rr(-0.3,0.3))*twSign,wav:mkNoise()}); }
      const rimPt=phi=>[Rr*Math.cos(phi),Rr*ct*Math.sin(phi)];
      // outer ray: from the rim along the ellipse normal, beads every 6.2 u, Ø 3.4 → 4.8 u, ramp pale → ultramarine
      const outer=q=>{ const pitch=6.0; const droop=(opts.droop||0.5)*st*q.Lr*(0.3+0.7*Math.max(0,q.near)); const tot=q.Lr; const [sx0,sy0]=rimPt(q.phi); const a0=Math.atan2(Math.sin(q.phi),ct*Math.cos(q.phi)); let acc=0, prevP=null;
        for(let d=0; d<=tot+0.01; d+=1){ const sN=d/tot; const a=a0+q.tw*sN+0.018*q.wav(sN*4); const P=[sx0+Math.cos(a)*d, sy0+Math.sin(a)*d+droop*Math.pow(sN,2.2)]; if(prevP)acc+=Math.hypot(P[0]-prevP[0],P[1]-prevP[1]); prevP=P;
          if(acc>=pitch||d===0){ if(d>0)acc-=pitch; const p=proj(P[0],P[1]); const dia=(4.0+1.3*sN)*(1+rr(-0.1,0.1)); const cN=Math.min(1,sN+0.22*Math.max(0,q.near)*st); dot(x,p[0],p[1],dia/2,rgb(ramp(RAY,cN),1)); } } };
      // inner ray: from the rim inward to the corolla edge (the bowl wall), beads every 5.4 u, Ø 3.0 → 2.6 u, mid-pale → near-white
      const inner=q=>{ const pitch=5.0; const [sx0,sy0]=rimPt(q.phi); const ex=Rc*0.98*Math.cos(q.phi), ey=cyo+Rc*0.98*ct*Math.sin(q.phi); const L=Math.hypot(ex-sx0,ey-sy0); if(L<8)return; const n=Math.max(1,Math.round(L/pitch)); const bow=(0.06*L)*q.tw/0.09*twSign;
        for(let k=0;k<=n;k++){ const t=k/n; const bx=-(ey-sy0)/L*bow*Math.sin(Math.PI*t), by=(ex-sx0)/L*bow*Math.sin(Math.PI*t); const p=proj(sx0+(ex-sx0)*t+bx, sy0+(ey-sy0)*t+by); const dia=(3.0-0.4*t)*(1+rr(-0.1,0.1)); dot(x,p[0],p[1],dia/2,rgb(ramp(INNER,t),1)); } };
      rays.sort((a,b)=>a.near-b.near);
      const far=rays.filter(q=>q.near<=0.05), nearR=rays.filter(q=>q.near>0.05);
      for(const q of far)outer(q);
      // calyx funnel: hangs below tilted heads from the near rim; cream + white dots only, fading to the tip
      if(tilt>0.3){ const len=R*1.4*st, wTop=Rc*2.0; const cr2=hex(C.cream); const n=Math.round(len*wTop*0.11); for(let i=0;i<n;i++){ const t=Math.pow(rnd(),0.8); const wv=wTop*(1-t*0.94)*0.5; const lx=rr(-wv,wv); const p=proj(lx,Rr*ct*0.9+len*t); if(rnd()<0.95*(1-t*0.6)) dot(x,p[0],p[1],rr(0.8,1.5),rnd()<0.55?'rgba(255,255,255,0.95)':rgb(cr2,0.96)); } }
      // bowl interior: inner rays on the far half and the sides (the near wall is seen from outside, so its inner rays are hidden)
      if(!opts.bud) for(const q of rays) if(q.near<0.35||tilt<0.3) inner(q);
      // rim: a dense double row of beads on the ellipse, 2.4 u pitch, darker and fuller toward the near side
      const rim=()=>{ const per=2*Math.PI*Rr*Math.sqrt((1+ct*ct)/2); const nn=Math.round(per/2.4); const cA=hex(C.rim), cB=hex(C.rayD); const stg=sstep(0.15,0.7,tilt); for(let i=0;i<nn;i++){ const ph=i/nn*Math.PI*2; const nr=(1+Math.sin(ph))/2; if(rnd()>stg*(0.35+0.55*nr)+(1-stg)*0.08)continue; for(let k=0;k<2;k++){ if(k===1&&rnd()>(0.2+0.8*nr)*stg)continue; const [rx,ry]=rimPt(ph); const o=k===0?rr(-2,2):rr(1.5,5); const nx=Math.cos(ph)*ct, ny=Math.sin(ph); const nl=Math.hypot(nx,ny)||1; const p=proj(rx+nx/nl*o,ry+ny/nl*o); dot(x,p[0],p[1],rr(1.3,1.65),rgb(mix(mix(cA,hex(C.rayB),1-stg),cB,0.55*nr*stg),0.95)); } } };
      rim();
      // corolla: lobed cloud of cream dot rings + white fringe + gold speckle (a bud has none)
      if(!opts.bud){ const lobe=ph=>Rc*(0.82+0.26*Math.pow(Math.abs(Math.sin(2.5*ph+phase)),0.9)+0.03*Math.cos(3*ph-phase)); const cor=hex(C.cor);
        for(let rg=2; rg<Rc*1.16; rg+=4.2){ const nn=Math.max(6,Math.round(2*Math.PI*rg/4.2)); for(let i=0;i<nn;i++){ const ph=i/nn*Math.PI*2+rg*0.05; const rl=lobe(ph); if(rg>rl+3)continue; const inside=sstep(rl+3,rl-4,rg); const jx=rr(-1,1), jy=rr(-1,1); const p=proj(rg*Math.cos(ph)+jx,cyo+(rg*Math.sin(ph)+jy)*ct); const wh=rnd()<0.15; dot(x,p[0],p[1],1.75*(0.85+0.3*rnd())*(0.6+0.4*inside),wh?'rgba(255,255,255,0.95)':rgb(cor,inside>0.5?1:0.85)); } }
        { const nn=Math.round(2*Math.PI*Rc*1.1/3.6); for(let i=0;i<nn;i++){ const ph=i/nn*Math.PI*2; const rl=lobe(ph)+rr(2,8); const p=proj(rl*Math.cos(ph),cyo+rl*Math.sin(ph)*ct); dot(x,p[0],p[1],rr(0.9,1.4),'rgba(255,255,255,0.95)'); } }
        const g=hex(C.gold); for(let i=0;i<1100;i++){ const u1=rnd()||1e-6, u2=rnd(); const rad=Math.sqrt(-2*Math.log(u1))*0.38*Rc; const ph=u2*Math.PI*2; if(rad>lobe(ph)-2)continue; const p=proj(rad*Math.cos(ph),cyo+rad*Math.sin(ph)*ct); dot(x,p[0],p[1],rr(0.75,1.25),rgb(g,rr(0.7,0.95))); }
        // the near rim rides over the corolla's near edge
        if(tilt>0.3){ const cA=hex(C.rim), cB=hex(C.rayD); const nn=Math.round(Math.PI*Rr/2.4); for(let i=0;i<nn;i++){ const ph=i/nn*Math.PI; const [rx,ry]=rimPt(ph); const p=proj(rx+rr(-1,1),ry+rr(-1.2,1.2)); dot(x,p[0],p[1],rr(1.35,1.7),rgb(mix(cA,cB,0.55*Math.sin(ph)),0.97)); } }
      }
      for(const q of nearR)outer(q);
    };
    // bud: a small edge-on bowl with rim and burr only
    const bud=(x,cx,cy,R,roll)=>{ head(x,cx,cy,R,1.35,roll,{lenScale:1.0,droop:0.8,bud:true,nRays:60}); };
    // ---------- layout ----------
    const ink=(()=>{ const c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height; const xx=c.getContext('2d'); xx.setTransform(dpr*S,0,0,dpr*S,0,0); xx.lineCap='round'; xx.lineJoin='round'; return xx; })();
    // main stem: ONE continuous sweep entering top-right, leaving bottom-left; the heads sit alternately either side of it
    const ST=[[980,-40],[620,520],[560,1140],[40,1800]];
    // second, thinner vine crossing it from top-left to bottom-right
    const TD=[[-40,140],[380,640],[640,1180],[1040,1790]];
    // leaves (behind everything): cordate silhouettes, one overlapping pair + two singles
    leaf(ink,[cordate(150,345,350,-0.40,0.10,0.86,1.06),cordate(318,212,200,-1.30,-0.08,0.92,1.02)],7*Math.PI/180);
    leaf(ink,[cordate(880,1195,300,2.35,0.12,0.90,1.04)],-11*Math.PI/180);
    leaf(ink,[cordate(120,1485,260,3.6,-0.10,1.04,0.88)],19*Math.PI/180);
    // stem behind the heads
    vine(ink,ST[0],ST[1],ST[2],ST[3],6.2,0.06,0.94,0);
    vine(ink,TD[0],TD[1],TD[2],TD[3],4.4,0.04,0.96,3);
    // heads, top to bottom: edge-on, three-quarter ×2, top-down ×2. [cx, cy, R, tilt°, roll°, twist sign]
    const heads=[[700,300,188,72,-8,1],[300,600,202,50,-24,-1],[705,880,198,38,18,1],[300,1200,214,10,-10,-1],[680,1520,208,3,0,1]];
    for(const [cx,cy,R,td,ra,tw] of heads) head(ink,cx,cy,R,td*Math.PI/180,ra*Math.PI/180,{twSign:tw});
    // bud on the thin vine near its exit
    bud(ink,900,92,68,0.35);
    // the same stem re-stroked in front of the lower heads (behind the first, in front of the later ones)
    vine(ink,ST[0],ST[1],ST[2],ST[3],6.2,0.06,0.94,0,0.44,1.0);
    // the thin vine re-stroked in front from its crossing point on
    vine(ink,TD[0],TD[1],TD[2],TD[3],4.4,0.04,0.96,3,0.42,1.0);
    ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(ink.canvas,0,0); ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    }
  },

  points: [
{u:0.857,v:0.855,d:'MARK',label:'Outer ray · Ø 4.0→5.3 u beads at 6.0 u pitch, #1622C8 tip', t:'ray', dir:[1,0]},
    {u:0.700,v:0.112,d:'FORM',label:'Edge-on bowl · 72°, crown 1.4× above the rim, fringe and funnel below', t:'bowl', dir:[-1,-1]},
    {u:0.326,v:0.371,d:'MARK',label:'Rim ellipse · double bead row, 2.4 u pitch, fullest on the near side', t:'rim', dir:[1,1]},
    {u:0.724,v:0.462,d:'TONE',label:'Bowl interior · inner rays rim → corolla, pale blue, converging', t:'inner-ray', dir:[1,-1]},
    {u:0.209,v:0.624,d:'COL', label:'Ray ramp · #95A3E8 at the rim → #2B3AD1 by 0.36 → #1622C8 tip', t:'ray', dir:[-1,-1]},
    {u:0.680,v:0.855,d:'MARK',label:'Corolla · five-lobed cream dot cloud, gold speckle σ 0.38 Rc', t:'corolla', dir:[-1,1]},
    {u:0.712,v:0.235,d:'FILL',label:'Calyx funnel · cream + white dots only, fading to the tip', t:'calyx', dir:[1,1]},
    {u:0.680,v:0.320,d:'KEY', label:'Dry-pen vine · one cubic, 6.2 u tapered to 1.6 u, flecked edges', t:'vine', dir:[1,0]},
    {u:0.880,v:0.672,d:'TEX', label:'Leaf screen · 8.6 u grid, Ø ≤ 5.2 u, falls to nothing over 10 u', t:'leaf-screen', dir:[-1,1]},
    {u:0.120,v:0.060,d:'GRND',label:'Paper · #EEE6D5, ±0.8 % mottle, −8.5 % toward top-right', t:'ground', dir:[1,1]},
    {u:0.500, v:0.500, d:'', label:'stub · leaf-stipple pending point authoring', t:'leaf-stipple', dir:[1,-1]}
  ],

  spec: {
id:'st-02',
    reference:{ file:'ref-02.png', px:[1152,2048], measured_at:506, grammar:'dotted-ray flower heads seen as tilted bowls, dot-screen leaves, dry-pen vines, cream paper; no fills, no outlines, no shading' },
    palette:{ ground:'#EEE6D5', ground_top_right:'#DAD2C1', ray_rim:'#95A3E8', ray_mid:'#5566DF', ray_deep:'#3343D6', spot:'#2B3AD1', ray_tip:'#1622C8', rim_bead:'#4A5BDC', inner_ray:'#8E9DE8 → #C8CFF1', corolla_dot:'#F6EEDA', white:'#FFFFFF', cream:'#F7F0DC', gold:'#E2B84E', leaf_dark:'#27432D', leaf_pale:'#8FA282', vine:'#2A4830' },
    ground:{ colour:'#EEE6D5', mottle:'hash noise 3.4 u cells ±0.8 %, plus bilinear value noise 28 u and 87 u cells ±0.6 % each', vignette:'1 − 0.085·exp(−d_TR²/0.30) − 0.03·exp(−d_BR²/0.25), d in frame widths', area_ref:0.75 },
    units:'design units, 1000 = plate width (ref 1152 px ⇒ 1 u = 1.152 ref px; measured on the 506 px copy, 1 u = 0.506 px)',
    techniques:[
      { id:'ray', short:'MARK', name:'Outer ray (burr)', layer:3, pass:3,
        params:{ rays_per_head:[100,116], bead_pitch_u:6.0, bead_pitch_ref_px:6.9, bead_d_u:[4.0,5.3], bead_d_ref_px:[4.6,6.1], start:'rim ellipse (Rr = 0.5 R)', length_u:'(R − Rr)·(1 − 0.42·sinθ·sinφ) — far side 1.4×, near side 0.6× on the edge-on head', length_mod:'0.16·(sin2φ + 0.6 sin3φ + 0.4 sin5φ)/2 ± 9 % per ray, 8 % of rays 1.12–1.24× (the burr silhouette)', angular_jitter:'±6 % of pitch', twist_rad:0.09, waver:'0.018 rad · 3-sine noise', droop:'0.5·sinθ·L·s^2.2·(0.3 + 0.7·max(0, sinφ)) toward the near side', near_side_darkening:'ramp parameter + 0.22·sinφ·sinθ', ramp:[[0,'#95A3E8'],[0.06,'#5566DF'],[0.16,'#3343D6'],[0.36,'#2B3AD1'],[1,'#1622C8']], alpha:1 },
        implementation:'Each ray starts on the rim ellipse, heads along the ellipse normal with a 0.09 rad twist and a near-side droop, and is walked at 1 u steps; every 6.0 u of arc one solid disc is placed whose Ø and colour are read from the ramp at the ray parameter.' },
      { id:'bowl', short:'FORM', name:'Tilted bowl', layer:3, pass:3,
        params:{ tilts_deg:[72,50,38,10,3], bud_deg:77, R_u:[188,202,198,214,208], centres_u:[[700,300],[300,600],[705,880],[300,1200],[680,1520]], rim_r:'0.50·R', corolla_r:'(0.22 + 0.08·cosθ)·R', bowl_depth:'corolla centre displaced 0.35·Rr·sinθ toward the near side', rim_ellipse:'(Rr, Rr·cosθ) rotated by roll', roll_deg:[-8,-24,18,-10,0], ray_direction:'atan2(sinφ, cosθ·cosφ) — the ellipse normal', order:'far outer rays → calyx → inner rays (far half + sides) → rim → corolla → near rim over the corolla edge → near outer rays' },
        implementation:'The head is one bowl in local coordinates with y scaled by cosθ: a rim ellipse, a corolla sunk toward the near side, inner rays converging from rim to corolla, and outer rays leaving the rim along its normal, so a flat rim sends a crown up and a fringe down while a top-down head reads as a full disc.' },
      { id:'rim', short:'MARK', name:'Rim ellipse', layer:3, pass:3,
        params:{ bead_d_u:[2.6,3.3], bead_d_ref_px:[3.0,3.8], pitch_u:2.4, pitch_ref_px:2.8, rows:'1 on the ellipse (±2 u jitter) + 1 outside it (1.5–5 u), second row kept 20–100 % toward the near side', keep:'strength·(0.35 + 0.55·near) + (1 − strength)·0.08, strength = smoothstep(9° … 40°) of tilt', colour:'#4A5BDC (→ #95A3E8 on flat heads) mixed with #3343D6 by 0.55·near·strength', over_corolla:'near half restroked after the corolla' },
        implementation:'Beads are placed around the projected rim at 2.4 u pitch, thinned on the far side and doubled and darkened on the near side; on top-down heads 92 % of the rim beads are dropped so the rays read as one continuous fan.' },
      { id:'inner-ray', short:'TONE', name:'Bowl interior rays', layer:3, pass:3,
        params:{ from:'rim point', to:'corolla edge at 0.98·Rc, sunk by the bowl depth', bead_pitch_u:5.0, bead_d_u:[3.0,2.6], bow:'0.06·L sine bow in the twist direction', ramp:[[0,'#8E9DE8'],[0.5,'#B0BAEC'],[1,'#C8CFF1']], visible:'far half and sides (sinφ < 0.35), all around on top-down heads', min_length_u:8 },
        implementation:'Straight beaded runs from each rim point inward to the corolla edge, slightly bowed, pale blue and converging; the near wall is seen from outside so its inner rays are skipped.' },
      { id:'corolla', short:'MARK', name:'Corolla dot cloud', layer:2, pass:2,
        params:{ radius_u:'(0.22 + 0.08 cosθ)·R ≈ 48–64 u', lobes:'Rc·(0.82 + 0.26·|sin 2.5φ|^0.9 + 0.03 cos3φ), five lobes', dot_colour:'#F6EEDA (15 % #FFFFFF)', dot_d_u:3.5, ring_pitch_u:4.2, jitter_u:1, fringe:'white dots Ø 1.8–2.8 u, pitch 3.6 u, 2–8 u outside the lobe', speckle:{ colour:'#E2B84E', n:1100, d_u:[1.5,2.5], sigma:'0.38·Rc', alpha:[0.7,0.95] } },
        implementation:'Concentric jittered rings of cream dots at 4.2 u pitch fill the lobed outline (foreshortened by cosθ and sunk to the bowl bottom); a sparse white ring sits outside it and 1100 gaussian gold dots, densest at the middle, are rejected outside the lobe.' },
      { id:'calyx', short:'FILL', name:'Calyx funnel', layer:2, pass:2,
        params:{ colours:'#F7F0DC 45 %, #FFFFFF 55 %', dot_d_u:[1.6,3.0], length:'1.4·R·sinθ below the near rim', width:'2.0·Rc at the rim → 6 % at the tip', density:'0.11 per u² × (1 − 0.6 t)', edge:'none', on:'heads tilted > 17°' },
        implementation:'A downward triangle under tilted heads, in the head’s roll frame, filled only with cream and white dots whose density fades toward the tip; drawn after the far rays and before the near fringe.' },
      { id:'leaf-screen', short:'TEX', name:'Coarse dot screen', layer:1, pass:1,
        params:{ colour:'#27432D', grid_pitch_u:8.6, grid_pitch_ref_px:9.9, rotation_deg:[7,-11,19], dot_d_u_max:5.2, dot_d_ref_px:6.0, position_jitter_u:0.6, size_jitter:'±10 %', margin_falloff:'Ø · smoothstep(−2 … +10 u inside the edge) → nothing outside', interior:'Ø × (1 − 0.4·smoothstep(30 … 80 u depth))', pale_screen:{ colour:'#8FA282', pitch_u:8.6, offset:'half cell', d_u:2.4, alpha:0.55 }, silhouette:'cordate outline from 24 hand-set vertices (width 1.31 × height 1.76, sinus 0.34 deep, drawn-out apex), Catmull-Rom smoothed, left/right widths ×0.86–1.06 (asymmetry), midrib bent by curl·(y+0.76)²·0.32, ±2 % edge noise; heights 350+200 (overlapping pair) / 300 / 260 u' },
        implementation:'An asymmetric cordate polygon per leaf is sampled on a rotated square grid; each dot’s Ø is full in the margin band, shrinks toward the middle, and smoothsteps to zero across the last 10 u inside the edge so no outline forms; a paler half-cell-offset screen is added.' },
      { id:'leaf-stipple', short:'TEX', name:'Interior stipple', layer:1, pass:1,
        params:{ dark:'#27432D α0.85 (62 %)', pale:'#8FA282 α0.7 (38 %)', d_u:[0.9,1.8], candidates_per_1000u2:150, keep:'(0.12 + 0.88·smoothstep(4 … 42 u depth)) × (0.25 + 0.75·noise 44 u) × (0.55 + 0.45·noise 12 u)' },
        implementation:'Random fine dots whose keep-probability grows with depth inside the leaf and is modulated by two value-noise scales, giving the blotchy dark middle.' },
      { id:'vine', short:'KEY', name:'Dry-pen vine', layer:4, pass:4,
        params:{ colour:'#2A4830 α0.97', curve:'ONE cubic (980,−40)→(620,520)→(560,1140)→(40,1800), plus one thin vine (−40,140)→(380,640)→(640,1180)→(1040,1790) crossing it', width_u:{ stem:[6.2,1.6], tendril:[4.4,1.6] }, width_ref_px:[7.1,1.8], taper:'sin(π·t)^0.6 over the run', roughness:'width × (1 + 0.22·noise(0.11 s) + 0.08·noise(0.9 s))', flecks:'2 tries per 4 u step at 70 %, Ø 0.9–1.8 u, 0.5–2.2 u outside the edge, α 0.3–0.8', cap:'round', join:'round', order:'stroked behind all heads, then t 0.44–1.0 re-stroked in front (thin vine from t 0.42)' },
        implementation:'One cubic centreline is stroked in 4 u segments whose width is a tapered base times 1-D noise; small flecks are scattered along both edges to dry the line, and the lower run is re-stroked over the heads so the same vine passes both behind and in front.' },
      { id:'ground', short:'GRND', name:'Paper mottle', layer:0, pass:0,
        params:{ colour:'#EEE6D5', hf:'hash noise, 3.4 u cell, ±0.8 %', lf:'bilinear value noise on an 8 px lattice, 28 u and 87 u cells, ±0.6 % each', vignette:'−8.5 % gaussian toward the top-right corner (σ² 0.30 frame widths), −3 % toward the bottom-right (σ² 0.25)', corner_top_right:'#DAD2C1' },
        implementation:'One ImageData pass: ground colour × vignette × (1 + hf + lf) per pixel.' }
    ],
    pass_order:['ground ImageData','leaves (coarse screen, pale screen, interior stipple)','both vines behind the heads','heads top to bottom: far outer rays, calyx, inner rays, rim, corolla rings, white fringe, gold speckle, near rim, near outer rays','bud (rim + burr only, 60 rays)','main vine re-stroked in front from t 0.44','thin vine re-stroked in front from t 0.42'],
    notes:[ 'All numbers measured on ref-02.png at 506 px and scaled ×1.976 to design units (1000 = 1152 ref px).', 'Reference: ground (236,228,211) centre, (225,213,189) top-right corner, block std 1.2–3.8; ray-dot NN pitch 3.0 px (5.9 u), dot eq. Ø 2.2 px (4.3 u); ≈90 rays crossing r = 100 px; leaf grid NN 3.9–4.5 px (7.7–8.9 u), dot eq. Ø 2.5 px (4.9 u); vine 3 px (5.9 u).', 'Reference area shares: ground 0.75, blue 0.09, dark green 0.03; reference ray tips measured (20,36,202) in the top decile — deeper than the #2B3AD1 spot, hence the #1622C8 tip.', 'Seed 2202.' ]
  }
});
