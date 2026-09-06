/* ST-01 · Pencil keyline botanical — imported from technique-studies/ at ck-e12.
   Reference-study rebuild of a public-domain Art-Nouveau botanical. Coloured-pencil
   rendering with contrast keyline, radial striation and dry-brush fringe; every
   technique block is provable from a point on the plate. compare{} off — the
   reference is not shipped inline; the rebuild carries the argument. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'st-01-pencil-keyline-botanical',
  index: 'ST-01',
  order: 3010,
  title: 'Pencil keyline botanical',
  section: 'studies',
  style: 'technique-study',
  status: 'canonical',
  lane: 'canvas2d',
  governed_by: ['composing-computational-material-systems'],
  tags: ['Reference study', 'Coloured pencil', 'Botanical', 'Art Nouveau'],

  source: {
    kind: 'reference-study',
    title: 'Reference 01 · keylined pencil Art-Nouveau botanical',
    note: 'Rebuild study — the plate rebuilds a public-domain Art-Nouveau botanical from scratch; every visible mark is code, not the reference. compare{} off per PROCESS §5.4.'
  },

  frame: { designWidth: 1200, aspect: '1/1', previewHeight: 1200 },
  thumb: 'thumb.png',

  body: [
    'Coloured-pencil fills on a flat cream sheet: every plate carries a fine grain that runs with the shape, a red-orange keyline sits a hair inside each teal, blue and olive silhouette, and the bloom alone goes unlined. Deep-teal striations radiate over the fans and stop short of the line.',
    'Built in five passes: flat fills, directional pencil strokes clipped to each plate, vector striations and veins, a dry-brush fringe of hundreds of broken radial strokes at every leaf root, then a wavered keyline. A per-pixel tooth pass ruffles all pigment but never the paper.'
  ],

  method: 'Pencil grain · contrast keyline · radial striation · dry-brush fringe',

  plate: {
    fig: '3.1', series: 'STUDIES', sheet: 1, of: 8,
    designWidth: 1200, designHeight: 1200,
    render: function (canvas, w, h, dpr) {
    const C={ground:'#E6E6D2',teal:'#9ABFA2',stria:'#20A49C',key:'#D8502E',coral:'#F44712',coralL:'#FB6A2C',coralD:'#CF3A0C',orange:'#FA8325',yellow:'#F5D77A',yellowHi:'#FBF0B5',blue:'#1D4888',blueCore:'#1E3CC0',blueRoot:'#17327C',blueL:'#2E5C9C',black:'#0E0E0E',mound:'#B5A448',vein:'#905B06',tan:'#D0A16A',cream:'#F0E9C7',ring:'#765D0C'};
    const S=w/1000, U=1000, V=h/S;
    let seed=1101; const rnd=()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const rr=(a,b)=>a+(b-a)*rnd();
    const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    const rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
    const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
    const lighten=(c,t)=>mix(hex(c),[255,255,255],t), darken=(c,t)=>mix(hex(c),[0,0,0],t);
    // 1-D waver noise (sum of sines with seeded phases)
    const mkNoise=()=>{ const p=[rnd()*7,rnd()*7,rnd()*7], f=[1,2.13,4.7], a=[1,0.5,0.25]; return t=>(Math.sin(t*f[0]+p[0])*a[0]+Math.sin(t*f[1]+p[1])*a[1]+Math.sin(t*f[2]+p[2])*a[2])/1.75; };
    const off=()=>{ const c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height; const x=c.getContext('2d'); x.setTransform(dpr*S,0,0,dpr*S,0,0); x.lineCap='round'; x.lineJoin='round'; return x; };
    const ink=off();
    // ---------- polyline helpers ----------
    const bez=(p0,p1,p2,p3,n,out)=>{ out=out||[]; for(let i=0;i<=n;i++){ const t=i/n,u=1-t; out.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0], u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]); } return out; };
    const quad=(p0,p1,p2,n,out)=>{ out=out||[]; for(let i=0;i<=n;i++){ const t=i/n,u=1-t; out.push([u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0], u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]]); } return out; };
    const normals=(P,closed)=>{ const n=P.length, N=[]; for(let i=0;i<n;i++){ const a=P[closed?(i-1+n)%n:Math.max(0,i-1)], b=P[closed?(i+1)%n:Math.min(n-1,i+1)]; let dx=b[0]-a[0],dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; N.push([dy/l,-dx/l]); } return N; };
    const area=P=>{ let a=0; for(let i=0;i<P.length;i++){ const p=P[i],q=P[(i+1)%P.length]; a+=p[0]*q[1]-q[0]*p[1]; } return a/2; };
    // offset a polyline inward by d (positive = toward the interior of a closed CW/CCW shape) and add waver
    const offsetWaver=(P,d,amp,freq,closed)=>{ const N=normals(P,closed); const sgn=closed?(area(P)>0?1:-1):1; const nz=mkNoise(); const out=[]; let s=0; for(let i=0;i<P.length;i++){ if(i>0)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]); const o=d*sgn+amp*nz(s*freq); out.push([P[i][0]+N[i][0]*o,P[i][1]+N[i][1]*o]); } return out; };
    const path=(x,P,closed)=>{ x.beginPath(); x.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++)x.lineTo(P[i][0],P[i][1]); if(closed)x.closePath(); };
    const fillP=(x,P,col)=>{ path(x,P,true); x.fillStyle=col; x.fill(); };
    const bbox=P=>{ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const p of P){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; } return [x0,y0,x1,y1]; };
    const pip=(P,x,y)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const a=P[i],b=P[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c; } return c; };
    // hand-drawn stroke: width jitter along the line, in segments
    const handStroke=(x,P,col,wBase,jit,closed)=>{ x.strokeStyle=col; const n=P.length; const seg=8; for(let i=0;i<n-(closed?0:1);i+=seg){ x.beginPath(); x.moveTo(P[i][0],P[i][1]); for(let k=1;k<=seg;k++){ const j=i+k; if(j>n-1&&!closed)break; const p=P[j%n]; x.lineTo(p[0],p[1]); } x.lineWidth=wBase*(1+jit*(rnd()*2-1)); x.stroke(); } };
    const keyline=(x,P,closed)=>{ const Q=offsetWaver(P,1.2,1.4,0.06,closed); handStroke(x,Q,C.key,4.6,0.18,closed); const Q2=offsetWaver(P,1.2,1.6,0.21,closed); x.globalAlpha=0.55; handStroke(x,Q2,C.key,3.2,0.3,closed); x.globalAlpha=1; };
    // directional grain: strokes along a direction field, clipped to P
    const grain=(x,P,dirFn,col,density,amp,lenMin,lenMax,ltc,dkc)=>{ const [x0,y0,x1,y1]=bbox(P); const n=Math.round(density*(x1-x0)*(y1-y0)/1000); const lt=rgb(ltc?hex(ltc):lighten(col,0.20),0.32*amp), dk=rgb(dkc?hex(dkc):darken(col,0.16),0.32*amp); x.save(); path(x,P,true); x.clip(); for(let i=0;i<n;i++){ const px=rr(x0,x1),py=rr(y0,y1); if(!pip(P,px,py))continue; const a=dirFn(px,py)+rr(-0.12,0.12), L=rr(lenMin,lenMax); const dx=Math.cos(a)*L/2,dy=Math.sin(a)*L/2; x.strokeStyle=rnd()<0.5?lt:dk; x.lineWidth=rr(0.8,1.3); x.beginPath(); x.moveTo(px-dx,py-dy); x.lineTo(px+dx,py+dy); x.stroke(); } x.restore(); };
    // ---------- shape builders ----------
    // fan-palm leaf: root r0, axis angle A (rad), half-span Sp, radius R, fingers nf
    const fan=(root,A,Sp,R,nf,neckW,k0,notch)=>{ const nz=mkNoise(); const P=[]; const a0=A-Sp,a1=A+Sp; const edge=[]; const steps=nf*26; k0=k0===undefined?0.42:k0; notch=notch||0.15;
      const fl=[]; for(let i=0;i<nf;i++)fl.push(1-0.05*rnd()); const rOf=phi=>{ const u=(phi-a0)/(a1-a0); const k=Math.min(nf-1,Math.floor(u*nf)), t=u*nf-k; const s=1-Math.abs(2*t-1); const sc=(1-notch*(1-Math.pow(s,1.7)))*fl[k]; const c=Math.cos(phi-A); const shape=k0+(1-k0)*c*c; return R*shape*sc*(1+0.02*nz(phi*9)); };
      for(let i=0;i<=steps;i++){ const phi=a0+(a1-a0)*i/steps; const r=rOf(phi); edge.push([root[0]+Math.cos(phi)*r,root[1]+Math.sin(phi)*r]); }
      const perp=[Math.cos(A+Math.PI/2),Math.sin(A+Math.PI/2)]; const nA=[root[0]-perp[0]*neckW/2,root[1]-perp[1]*neckW/2], nB=[root[0]+perp[0]*neckW/2,root[1]+perp[1]*neckW/2];
      const first=edge[0], last=edge[edge.length-1];
      const mid1=[root[0]+Math.cos(a0)*R*k0*0.5,root[1]+Math.sin(a0)*R*k0*0.5], c1=[mid1[0]+Math.cos(A)*R*0.10,mid1[1]+Math.sin(A)*R*0.10];
      const mid2=[root[0]+Math.cos(a1)*R*k0*0.5,root[1]+Math.sin(a1)*R*k0*0.5], c2=[mid2[0]+Math.cos(A)*R*0.10,mid2[1]+Math.sin(A)*R*0.10];
      quad(nA,c1,first,30,P); P.push(...edge.slice(1)); quad(last,c2,nB,30,P);
      return {P,root,A,Sp,R,rOf,nf};
    };
    const drawFanFill=(x,F)=>{ fillP(x,F.P,C.teal); grain(x,F.P,(px,py)=>Math.atan2(py-F.root[1],px-F.root[0]),C.teal,2.6,0.6,8,30); x.save(); path(x,F.P,true); x.clip(); const [x0,y0,x1,y1]=bbox(F.P); x.strokeStyle=rgb(lighten(C.teal,0.55),0.35); for(let i=0;i<Math.round((x1-x0)*(y1-y0)/9000);i++){ const px=rr(x0,x1),py=rr(y0,y1); if(!pip(F.P,px,py))continue; const a=Math.atan2(py-F.root[1],px-F.root[0])+rr(-0.3,0.3), L=rr(6,22); x.lineWidth=rr(1.2,2.4); x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(a)*L,py+Math.sin(a)*L); x.stroke(); } x.restore(); };
    const drawFanStriations=(x,F)=>{ x.save(); path(x,F.P,true); x.clip(); x.strokeStyle=C.stria; const pitchA=30/F.R; const n=Math.floor(2*F.Sp/pitchA); const nz=mkNoise(); for(let i=0;i<=n;i++){ const phi=F.A-F.Sp+ (2*F.Sp)*(i/n); const rE=F.rOf(phi)+4; const r0=60+rnd()*14; const bow=0.10*rE*Math.sin(phi-F.A)*(0.6+0.4*nz(i*0.7)); const pm=[F.root[0]+Math.cos(phi)*rE*0.55+Math.cos(phi+Math.PI/2)*bow, F.root[1]+Math.sin(phi)*rE*0.55+Math.sin(phi+Math.PI/2)*bow]; const Q=quad([F.root[0]+Math.cos(phi)*r0,F.root[1]+Math.sin(phi)*r0],pm,[F.root[0]+Math.cos(phi)*rE,F.root[1]+Math.sin(phi)*rE],24); const W=offsetWaver(Q,0,0.5,0.3,false); handStroke(x,W,C.stria,3.2,0.18,false); }
      // teal band under the keyline: 4 u gap between striation ends and keyline
      path(x,F.P,true); x.strokeStyle=C.teal; x.lineWidth=15; x.stroke(); x.restore(); };
    const fringe=(x0,root,A,Sp,clipInvP,keepP)=>{ let x=x0; // blob: elongated along the axis, lobed
      const bc=[root[0]+Math.cos(A)*38,root[1]+Math.sin(A)*38]; const B=[],B2=[]; const nz=mkNoise(); for(let i=0;i<=100;i++){ const t=i/100*Math.PI*2; const ca=Math.cos(t-A), sa=Math.sin(t-A); const r=1/Math.sqrt((ca/58)*(ca/58)+(sa/46)*(sa/46))*(1+0.05*nz(t*2.5)); B.push([bc[0]+Math.cos(t)*r,bc[1]+Math.sin(t)*r]); B2.push([bc[0]+Math.cos(t)*(r+3),bc[1]+Math.sin(t)*(r+3)]); }
      fillP(x,B,C.blue); { const core=[]; for(let i=0;i<=60;i++){ const t=i/60*Math.PI*2; const r=19*(1+0.12*nz(t*3+1)); core.push([bc[0]+Math.cos(A)*12+Math.cos(t)*r,bc[1]+Math.sin(A)*12+Math.sin(t)*r]); } fillP(x,core,C.blueCore); }
      // bristles: start inside the blob, fade out 30–115 u past its edge; density peaks along the axis
      // bristle layer: drawn unclipped on its own canvas, then masked once (destination-in) by leaf ∪ blob ∪ stems so nothing lands on paper and no clip seam accumulates
      const lay=off(); const xo=x; x=lay;
      const bl=hex(C.blue), bc0=hex(C.blueRoot); x.strokeStyle=C.blue; for(let i=0;i<900;i++){ const g=(rnd()+rnd()+rnd())/1.5-1; const a=A+g*Sp*1.4; const edge=1/Math.sqrt((Math.cos(a-A)/58)**2+(Math.sin(a-A)/46)**2); const r1=edge-rr(4,14), r2=edge+rr(6,26); x.lineWidth=rr(1.0,2.0); x.beginPath(); x.moveTo(bc[0]+Math.cos(a)*r1,bc[1]+Math.sin(a)*r1); x.lineTo(bc[0]+Math.cos(a)*r2,bc[1]+Math.sin(a)*r2); x.stroke(); }
      x.strokeStyle=rgb(hex(C.blueL),0.26); for(let i=0;i<360;i++){ const a=A+rr(-1.6,1.6), r1=rr(0,75), L=rr(10,40); x.lineWidth=rr(0.7,1.3); x.beginPath(); x.moveTo(bc[0]+Math.cos(a)*r1,bc[1]+Math.sin(a)*r1); x.lineTo(bc[0]+Math.cos(a)*(r1+L),bc[1]+Math.sin(a)*(r1+L)); x.stroke(); }
      for(let i=0;i<5200;i++){ const g=(rnd()+rnd()+rnd())/1.5-1; const a=A+g*Sp*1.4; const edge=1/Math.sqrt((Math.cos(a-A)/58)**2+(Math.sin(a-A)/46)**2); const reach=40+140*Math.pow(rnd(),1.3)*(0.45+0.55*(1-Math.abs(g))); const w=rr(0.5,1.4); const nd=5+Math.floor(rnd()*7); let r=rr(0,edge-8); const step=(reach+edge-r)/nd; x.lineWidth=w; for(let k=0;k<nd;k++){ const t=Math.max(0,(r-edge)/reach); const gap=rr(0,0.55)*step; const r1=r+gap, r2=r+step-rr(0,0.2)*step; x.strokeStyle=rgb(mix(bc0,bl,Math.min(1,t*3.5)),0.95*Math.pow(1-t,1.8)*rr(0.4,1)); x.beginPath(); x.moveTo(bc[0]+Math.cos(a)*r1,bc[1]+Math.sin(a)*r1); x.lineTo(bc[0]+Math.cos(a)*r2,bc[1]+Math.sin(a)*r2); x.stroke(); r+=step; } }
      x=xo; lay.globalCompositeOperation='destination-in'; lay.beginPath(); for(const P0 of keepP.concat([B2])){ const P=area(P0)>0?P0:P0.slice().reverse(); lay.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++)lay.lineTo(P[i][0],P[i][1]); lay.closePath(); } lay.fillStyle='#000'; lay.fill(); x.save(); x.setTransform(1,0,0,1,0,0); x.drawImage(lay.canvas,0,0); x.restore();
      // keyline on the blob only where it lies outside every leaf: stroke the runs of points not inside any leaf polygon
      { const outside=p=>!clipInvP.some(P=>pip(P,p[0],p[1])); const pass=(d,amp,fq,wd,jit,al)=>{ const Q=offsetWaver(B,d,amp,fq,true); x.globalAlpha=al; let run=[]; const flush=()=>{ if(run.length>1)handStroke(x,run,C.key,wd,jit,false); run=[]; }; for(let i=0;i<=Q.length;i++){ const p=Q[i%Q.length]; if(outside(p))run.push(p); else flush(); } flush(); x.globalAlpha=1; }; pass(1.2,1.4,0.06,4.6,0.18,1); pass(1.2,1.6,0.21,3.2,0.3,0.55); }
    };
    // ribbon from cubic centreline; returns full outline and split outlines
    const ribbon=(p0,p1,p2,p3,wid,n)=>{ const Cn=bez(p0,p1,p2,p3,n); const N=normals(Cn,false); const L=[],R=[]; for(let i=0;i<=n;i++){ const wv=wid/2; L.push([Cn[i][0]+N[i][0]*wv,Cn[i][1]+N[i][1]*wv]); R.push([Cn[i][0]-N[i][0]*wv,Cn[i][1]-N[i][1]*wv]); } const cap=(c,i,dir)=>{ const o=[]; const a0=Math.atan2(N[i][1],N[i][0]); for(let k=1;k<10;k++){ const a=a0+dir*Math.PI*k/10; o.push([c[0]+Math.cos(a)*wid/2,c[1]+Math.sin(a)*wid/2]); } return o; };
      const outline=[...L,...cap(Cn[n],n,-1),...R.slice().reverse(),...cap(Cn[0],0,-1).reverse()];
      // tangent direction sign to orient caps properly: check area sign and flip caps if needed
      const part=(t0,t1)=>{ const i0=Math.round(t0*n), i1=Math.round(t1*n); const o=[...L.slice(i0,i1+1)]; if(t1>=1)o.push(...cap(Cn[n],n,-1)); o.push(...R.slice(i0,i1+1).reverse()); if(t0<=0)o.push(...cap(Cn[0],0,-1).reverse()); return o; };
      return {outline,part,Cn,N};
    };
    // ---------- bloom ----------
    const bloom=(x,cx,cy,W,H,rot,nSt)=>{ x.save(); x.translate(cx,cy); x.rotate(rot);
      const hw=W/2, hh=H/2;
      // cup silhouette: bottom point, sides, three petal tips with dips
      const P=[]; bez([0,hh],[-hw*0.55,hh*0.95],[-hw*1.02,hh*0.25],[-hw*0.92,-hh*0.30],22,P);
      bez([-hw*0.92,-hh*0.30],[-hw*0.86,-hh*0.62],[-hw*0.55,-hh*0.66],[-hw*0.40,-hh*0.40],14,P);
      bez([-hw*0.40,-hh*0.40],[-hw*0.30,-hh*0.30],[-hw*0.22,-hh*0.42],[-hw*0.12,-hh*0.72],12,P);
      bez([-hw*0.12,-hh*0.72],[-hw*0.06,-hh*1.02],[hw*0.06,-hh*1.02],[hw*0.12,-hh*0.72],12,P);
      bez([hw*0.12,-hh*0.72],[hw*0.22,-hh*0.42],[hw*0.30,-hh*0.30],[hw*0.40,-hh*0.40],12,P);
      bez([hw*0.40,-hh*0.40],[hw*0.55,-hh*0.66],[hw*0.86,-hh*0.62],[hw*0.92,-hh*0.30],14,P);
      bez([hw*0.92,-hh*0.30],[hw*1.02,hh*0.25],[hw*0.55,hh*0.95],[0,hh],22,P);
      const Pw=offsetWaver(P,0,0.9,0.08,true);
      fillP(x,Pw,C.coral);
      // crayon grain along the petal axis (diverging from the throat, mostly vertical)
      grain(x,Pw,(px,py)=>{ const a=Math.atan2(py-hh*0.9,px*0.35); return a; },C.coral,16,1.25,12,50,C.coralL,C.coralD);
      // throat glow: radial pencil ramp over the grain, real yellow core
      const tc=[0,-hh*0.12], Rg=H*0.76; const stops=[[0,hex(C.yellowHi)],[0.08,hex(C.yellow)],[0.26,hex(C.yellow)],[0.50,hex(C.orange)],[0.84,hex(C.coral)],[1.2,hex(C.coral)]];
      const ramp=t=>{ for(let i=1;i<stops.length;i++) if(t<=stops[i][0]){ const u=(t-stops[i-1][0])/(stops[i][0]-stops[i-1][0]); return mix(stops[i-1][1],stops[i][1],Math.max(0,Math.min(1,u))); } return stops[stops.length-1][1]; };
      x.save(); path(x,Pw,true); x.clip();
      for(let i=0;i<14000;i++){ const a=rr(-Math.PI,Math.PI); const r=Math.pow(rnd(),0.9)*Rg; const L=rr(4,14); const t=(r+L/2)/Rg+rr(-0.06,0.06); const c=ramp(t); const g=rr(-0.14,0.10); x.strokeStyle=rgb(g>0?mix(c,[255,255,255],g):mix(c,[0,0,0],-g*0.7),0.42); x.lineWidth=rr(0.9,1.6); x.beginPath(); x.moveTo(tc[0]+Math.cos(a)*r,tc[1]+Math.sin(a)*r); x.lineTo(tc[0]+Math.cos(a)*(r+L),tc[1]+Math.sin(a)*(r+L)); x.stroke(); }
      x.restore();
      // veins: long sweeping curves parallel to each back petal's axis (no convergence)
      const vein=(Q,doubled,wv)=>{ const W1=offsetWaver(Q,0,0.5,0.1,false); handStroke(x,W1,C.vein,wv||3.2,0.12,false); if(doubled){ const W2=offsetWaver(Q,3.0,0.4,0.1,false); handStroke(x,W2,C.tan,2.2,0.15,false); } };
      const petals=[[-hw*0.64,-hh*0.55,-hw*0.36],[0,-hh*0.92,0],[hw*0.64,-hh*0.55,hw*0.36]]; // tip x, tip y, base x
      for(const [tx,ty,bx] of petals){ for(let j=-1.5;j<=1.5;j+=1){ const o=j*hw*0.11; const sp=[bx*0.5+o,hh*0.55], ep=[tx+o*0.55,ty+hh*0.12+Math.abs(j)*hh*0.05]; const c1=[sp[0]+(tx-bx)*0.15+o*0.4,sp[1]-hh*0.45], c2=[ep[0]-(tx-bx)*0.05+o*0.3,ep[1]+hh*0.35]; vein(bez(sp,c1,c2,ep,30)); } }
      // front lobes (two overlapping petals) with transverse tan ribs
      const lobe=sg=>{ const L=[]; bez([sg*hw*0.02,hh*0.98],[sg*hw*0.15,hh*0.55],[sg*hw*0.22,hh*0.05],[sg*hw*0.16,-hh*0.02],14,L); bez([sg*hw*0.16,-hh*0.02],[sg*hw*0.24,-hh*0.34],[sg*hw*0.52,-hh*0.34],[sg*hw*0.54,-hh*0.05],14,L); bez([sg*hw*0.54,-hh*0.05],[sg*hw*0.64,-hh*0.34],[sg*hw*0.98,-hh*0.20],[sg*hw*0.90,hh*0.12],14,L); bez([sg*hw*0.90,hh*0.12],[sg*hw*0.88,hh*0.5],[sg*hw*0.55,hh*0.95],[sg*hw*0.02,hh*0.98],22,L); return offsetWaver(L,0,0.9,0.08,true); };
      for(const sg of [-1,1]){ const L=lobe(sg); fillP(x,L,C.coral); grain(x,L,(px,py)=>Math.atan2(-hh*0.3-py, sg*hw*0.6-px),C.coral,16,1.25,12,44,C.coralL,C.coralD);
        x.save(); path(x,L,true); x.clip();
        // pale peach edge along the lobe top
        const E=offsetWaver(L,2.4,0.6,0.1,true); x.strokeStyle=rgb([255,160,118],0.6); x.lineWidth=3.2; x.beginPath(); const i0=14, i1=42; x.moveTo(E[i0][0],E[i0][1]); for(let i=i0+1;i<=i1;i++)x.lineTo(E[i][0],E[i][1]); x.stroke();
        // ribs: transverse arcs following the lobe, tan doubled with olive
        for(let j=0;j<4;j++){ const yy=hh*(0.05+0.22*j); const x0=sg*hw*(0.12+0.02*j), x1=sg*hw*(0.86-0.06*j); const Q=quad([x0,yy+hh*0.02],[(x0+x1)/2,yy-hh*0.10-hh*0.03*j],[x1,yy+hh*0.04],24); const W2=offsetWaver(Q,0,0.5,0.1,false); handStroke(x,W2,C.vein,2.6,0.12,false); const W3=offsetWaver(Q,-3.0,0.4,0.1,false); handStroke(x,W3,C.tan,3.0,0.15,false); }
        x.restore(); }
      // stamens: cream curves from the throat, rings at the ends
      for(let i=0;i<nSt;i++){ const u=nSt>1?(i/(nSt-1))*2-1:0; const ang=-Math.PI/2+u*1.05; const len=hh*(0.70+0.30*(1-Math.abs(u))+rr(-0.05,0.05)); const sp=[u*hw*0.04,tc[1]+hh*0.45]; const ep=[sp[0]+Math.cos(ang)*len*0.85+u*hw*0.28, sp[1]+Math.sin(ang)*len]; const c1=[sp[0]+u*hw*0.03,sp[1]-len*0.6], c2=[ep[0]-u*hw*0.3,ep[1]+len*0.3]; const Q=bez(sp,c1,c2,ep,30); const Wq=offsetWaver(Q,0,0.5,0.12,false); handStroke(x,Wq,C.cream,3.8,0.12,false);
        x.fillStyle=C.cream; x.beginPath(); x.arc(ep[0],ep[1],8.2,0,7); x.fill(); x.strokeStyle=C.ring; x.lineWidth=3.4; x.beginPath(); x.arc(ep[0],ep[1],5.0,0,7); x.stroke(); }
      x.restore();
    };
    // ---------- layout ----------
    // ground
    const ctx=canvas.getContext('2d'); ctx.setTransform(dpr*S,0,0,dpr*S,0,0); ctx.fillStyle=C.ground; ctx.fillRect(0,0,U,V);
    const deg=d=>d*Math.PI/180;
    // fans: two upper palms rooted at the outer edge spreading up and inward, two lower palms beneath them (mirrored)
    const fanL1=fan([175,452],deg(-72),deg(88),465,9,84,0.48,0.24);
    const fanL2=fan([165,855],deg(-100),deg(100),395,8,80,0.46,0.24);
    const mirrorF=F=>({P:F.P.map(p=>[1000-p[0],p[1]]),root:[1000-F.root[0],F.root[1]],A:Math.PI-F.A,Sp:F.Sp,R:F.R,rOf:phi=>F.rOf(Math.PI-phi),nf:F.nf});
    const fans=[fanL1,mirrorF(fanL1),fanL2,mirrorF(fanL2)];
    const fanPaths=fans.map(f=>f.P);
    for(const F of [fans[2],fans[3],fans[0],fans[1]]){ drawFanFill(ink,F); drawFanStriations(ink,F); keyline(ink,F.P,true); }
    // stems
    const stemL=ribbon([500,900],[470,830],[300,830],[290,735],30,60), stemR=ribbon([500,900],[530,830],[700,830],[710,735],30,60);
    const armL=ribbon([292,735],[280,640],[150,560],[175,452],34,60), armR=ribbon([708,735],[720,640],[850,560],[825,452],34,60);
    const main=ribbon([500,900],[500,800],[500,650],[500,545],30,60);
    for(const st of [stemL,stemR]){ fillP(ink,st.part(0,0.42),C.blue); fillP(ink,st.part(0.42,1),C.black); }
    for(const st of [armL,armR]) fillP(ink,st.outline,C.black);
    fillP(ink,main.part(0,0.45),C.blue);
    // teal → blue bristle gradient on the main stem under the bloom
    { const seg=main.part(0.45,1); fillP(ink,seg,C.teal); ink.save(); path(ink,seg,true); ink.clip(); const [bx0,by0,bx1,by1]=bbox(seg); const bl=hex(C.blue); for(let i=0;i<700;i++){ const px=rr(bx0,bx1), py=rr(by0,by1); const t=(py-by0)/(by1-by0); const L=rr(10,40); ink.strokeStyle=rgb(bl,0.85*Math.pow(t,1.3)*rr(0.5,1)); ink.lineWidth=rr(0.8,1.3); ink.beginPath(); ink.moveTo(px,py-L/2); ink.lineTo(px,py+L/2); ink.stroke(); } ink.restore(); }
    for(const st of [stemL,stemR,armL,armR,main]) keyline(ink,st.outline,true);
    // fringes at the four roots (over stems and teal)
    const stemOutlines=[stemL,stemR,armL,armR,main].map(s=>s.outline); for(const F of fans) fringe(ink,F.root,F.A,F.Sp,fanPaths,[F.P].concat(stemOutlines));
    // mound
    { const M=[]; for(let i=0;i<=80;i++){ const t=i/80; const xx=320+360*t; const yy=975-80*Math.pow(Math.sin(Math.PI*t),1.6); M.push([xx,yy]); } const Mw=offsetWaver(M,0,0.8,0.08,false); const poly=[...Mw,[680,975],[320,975]]; fillP(ink,poly,C.mound); grain(ink,poly,()=>0,C.mound,2.5,0.5,8,30); const K=offsetWaver(Mw,1.2,1.4,0.06,false); handStroke(ink,K,C.key,4.6,0.18,false); const K2=offsetWaver(Mw,1.2,1.6,0.21,false); ink.globalAlpha=0.55; handStroke(ink,K2,C.key,3.2,0.3,false); ink.globalAlpha=1; }
    // buds: two small teal drops on short black stalks off the main stem
    const bud=(cx,cy,sg)=>{ const B=[]; bez([cx,cy+34],[cx+sg*32,cy+26],[cx+sg*32,cy-28],[cx+sg*5,cy-42],18,B); bez([cx+sg*5,cy-42],[cx-sg*12,cy-28],[cx-sg*15,cy+12],[cx,cy+34],18,B); const Bw=offsetWaver(B,0,0.6,0.1,true); fillP(ink,Bw,C.teal); grain(ink,Bw,()=>-Math.PI/2,C.teal,2.2,0.55,6,20); ink.save(); path(ink,Bw,true); ink.clip(); for(let j=0;j<3;j++){ const Q=quad([cx+sg*2,cy+30],[cx+sg*(7+9*j),cy-2],[cx+sg*(5+8*j),cy-36],16); handStroke(ink,offsetWaver(Q,0,0.6,0.15,false),C.stria,3.5,0.18,false); } path(ink,Bw,true); ink.strokeStyle=C.teal; ink.lineWidth=15; ink.stroke(); ink.restore(); keyline(ink,Bw,true); };
    { const s1=ribbon([500,730],[478,722],[452,714],[436,700],10,20); fillP(ink,s1.outline,C.black); keyline(ink,s1.outline,true); const s2=ribbon([500,730],[522,722],[548,714],[564,700],10,20); fillP(ink,s2.outline,C.black); keyline(ink,s2.outline,true); }
    bud(428,672,-1); bud(572,672,1);
    // blooms: centre tallest, sides leaning outward
    bloom(ink,285,625,275,295,deg(-18),3);
    bloom(ink,715,625,275,295,deg(18),3);
    bloom(ink,500,335,470,430,0,5);
    // ---------- tooth pass on pigment only ----------
    { const cv=ink.canvas; const W=cv.width,Hh=cv.height; const id=ink.getImageData(0,0,W,Hh); const d=id.data; for(let y=0;y<Hh;y++){ for(let xx=0;xx<W;xx++){ const i=(y*W+xx)*4; if(d[i+3]===0)continue; const cx=(xx/(dpr*S*1.6))|0, cy=(y/(dpr*S*1.6))|0; let hsh=(cx*374761393+cy*668265263)|0; hsh=(hsh^(hsh>>>13))*1274126177|0; hsh=(hsh^(hsh>>>16)); const n=((hsh&0xffff)/65535-0.5)*2; const amp=(d[i]>d[i+1]+40)?0.07:0.02; const f=1+amp*n; d[i]=Math.min(255,d[i]*f); d[i+1]=Math.min(255,d[i+1]*f); d[i+2]=Math.min(255,d[i+2]*f); } } ink.putImageData(id,0,0); }
    ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(ink.canvas,0,0); ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    }
  },

  points: [
    {u:0.072,v:0.141,d:'KEY', label:'Contrast keyline · 4.6 u, frayed pass, follows each finger', t:'keyline', dir:[-1,-1]},
    {u:0.120,v:0.296,d:'TEX', label:'Radial striation · 3.2 u deep teal, rim pitch 30 u, 4 u gap', t:'striation', dir:[-1,0]},
    {u:0.760,v:0.400,d:'MARK',label:'Dry-brush fringe · 5200 broken strokes, deep navy root', t:'fringe', dir:[1,0]},
    {u:0.500,v:0.300,d:'TONE',label:'Throat glow · #F5D77A core → orange → coral, pencil-grained', t:'throat-glow', dir:[1,-1]},
    {u:0.395,v:0.420,d:'FILL',label:'Crayon grain · 1 u strokes along the petal axis, chroma kept', t:'grain-fill', dir:[-1,0]},
    {u:0.613,v:0.255,d:'MARK',label:'Stamen · 3.8 u cream curve, olive ring Ø 10 u in a cream eye', t:'stamen', dir:[1,-1]},
    {u:0.254,v:0.608,d:'MARK',label:'Olive vein · 3.2 u along the back petal; tan ribs on lobes', t:'vein', dir:[-1,1]},
    {u:0.500,v:0.640,d:'TONE',label:'Bristle gradient · teal → blue down the stem, 700 strokes', t:'stem-gradient', dir:[1,0]},
    {u:0.320,v:0.805,d:'FORM',label:'Ribbon stem · 30 u, hard black-over-blue cut, keylined', t:'stem', dir:[-1,1]},
    {u:0.500,v:0.940,d:'COL', label:'Olive mound · #B5A448 dome, keyline on the arc only', t:'mound', dir:[1,1]}
  ],

  spec: {
    id:'st-01',
    reference:{ file:'ref-01.png', px:[1200,1200], measured_at:900, grammar:'coloured pencil on flat cream, red-orange keyline inside teal/blue/olive plates, no line on the bloom' },
    palette:{ ground:'#E6E6D2', teal:'#9ABFA2', striation:'#20A49C', keyline:'#D8502E', coral:'#F44712', coral_grain_light:'#FB6A2C', coral_grain_dark:'#CF3A0C', orange:'#FA8325', yellow:'#F5D77A', yellow_hi:'#FBF0B5', blue:'#1D4888', blue_core:'#1E3CC0', blue_root:'#17327C', blue_light:'#2E5C9C', black:'#0E0E0E', mound:'#B5A448', vein:'#905B06', vein_tan:'#D0A16A', stamen:'#F0E9C7', ring:'#765D0C' },
    ground:{ colour:'#E6E6D2', tooth:'none (ref L std 0.0)', area_ref:0.30 },
    units:'design units, 1000 = plate width (ref 1200 px ⇒ 1 u = 1.2 ref px)',
    techniques:[
      { id:'grain-fill', short:'FILL', name:'Directional pencil grain', layer:2, pass:2,
        params:{ stroke_w_u:[0.8,1.3], stroke_len_u:[8,50], alpha:0.32, light:'mix(fill,#fff,0.20) — coral uses #FB6A2C to keep chroma', dark:'mix(fill,#000,0.16) — coral #CF3A0C', coral_alpha:0.40, coral_density_per_1000u2:16, teal_density_per_1000u2:2.6, teal_scumble:'1 per 9000 u², 1.2–2.4 u, α0.35 pale teal', teal_L_std_ref:1.7, coral_L_std_ref:7.5, tooth:'hash noise on a 1.6 u cell, ±7 % L on red pigment, ±2 % elsewhere, none on paper' },
        implementation:'Short 1 u strokes along each plate’s axis field (radial for fans and throat, petal-axis for lobes) in lighter and darker fill tints at α 0.32, clipped to the plate; then an ImageData pass multiplies every non-transparent pixel by 1±amp·hash(⌊x/1.6u⌋,⌊y/1.6u⌋), amp 0.07 where R>G+40 else 0.02.' },
      { id:'keyline', short:'KEY', name:'Contrast keyline', layer:5, pass:5,
        params:{ colour:'#D8502E', width_u:4.6, fray_pass:{ width_u:3.2, alpha:0.55, waver_amp_u:1.6, waver_freq:0.21 }, effective_width_ref_px:5.2, offset_u:-1.2, waver_amp_u:1.4, waver_freq:0.06, width_jitter:0.18, cap:'round', join:'round', on:['fans','buds','stems','fringe blobs','mound arc'], not_on:['bloom','mound base'] },
        implementation:'Silhouette polylines are offset 1 u inward along their normals, displaced by a 3-octave 1-D sine noise of the arc length (amp 1.2 u), and stroked in 8-point segments whose width varies ±18 %; a second 3.2 u pass at α 0.55 with a faster waver frays the edges.' },
      { id:'striation', short:'TEX', name:'Radial striation', layer:3, pass:3,
        params:{ colour:'#20A49C', width_u:3.2, width_ref_px:3.5, rim_pitch_u:30, stop_short_u:4, curve:'quadratic, control bowed 0.10·r off the radial', start_r_u:60, waver_amp_u:0.5, waver_freq:0.3 },
        implementation:'One quadratic per ray from the fan root to the rim at angular pitch = 30 u / rim radius, clipped to the fan, then a 6.75 u teal band stroked on the silhouette before the keyline leaves a 4 u gap.' },
      { id:'fringe', short:'MARK', name:'Dry-brush bristle fringe', layer:4, pass:4,
        params:{ colour:'#1D4888', blob_centre:'root + 38 u along the leaf axis (the blob is the leaf’s basal lobe)', blob_rx_ry_u:[58,46], core:{ colour:'#1E3CC0', solid_d_u:38, core_offset_u:'+12 along the axis', stroke_colour:'#17327C at the root → #1D4888 within 0.28·reach' }, strokes:5200, stroke_w_u:[0.5,1.4], reach_u:[40,180], mask:'own layer, destination-in with leaf ∪ blob(+3 u) ∪ stems (never onto paper; no clip-seam darkening)', reach_ref_px:90, spread_deg:'1.4 × leaf span', dashes_per_stroke:[5,11], gap_frac:[0,0.55], dash_alpha_jitter:[0.4,1], alpha_curve:'(1−t)^1.8', alpha_root:0.95, alpha_tip:0.0, start_r_u:'0 … edge−8 (from the solid core outward)', rim_band:{ strokes:900, w_u:[1,2], span_u:'edge −4…−14 to edge +6…+26', alpha:1 }, blob_streaks:{ colour:'#2E5C9C', n:360, alpha:0.26, r_u:[0,75], len_u:[10,40] } },
        implementation:'A solid blue ellipse (58×46 u) at the leaf root, then a 900-stroke opaque band straddling the rim so the disc edge never shows, a solid #1E3CC0 core 38 u across set 12 u up the axis, then 5200 radial strokes (on a layer masked by leaf, blob and stems) starting anywhere inside the blob, each drawn as 5–11 dashes with random gaps and per-dash alpha, colour running from a deep #17327C at the root to #1D4888 within the first 28 % of the reach, alpha falling (1−t)^1.8 to zero 40–180 u past the edge; the blob and its rim get 360 lighter streaks.' },
      { id:'throat-glow', short:'TONE', name:'Radial pencil ramp', layer:2, pass:2,
        params:{ stops:[[0.0,'#FBF0B5'],[0.08,'#F5D77A'],[0.26,'#F5D77A'],[0.50,'#FA8325'],[0.84,'#F44712']], r_u:'0.76·bloom height', yellow_extent:'≈0.40·bloom height across', strokes:14000, alpha:0.42, stroke_w_u:[0.9,1.6], len_u:[4,14], r_jitter:0.06, grain:'per-stroke −14…+10 % L' },
        implementation:'14000 short radial strokes at α 0.42 from the throat point, each coloured by the ramp at (r ± 6 % jitter) and lightened or darkened ±14 % so the ramp is pencil-grained so the stops are ragged, over a flat coral fill; grain strokes on top.' },
      { id:'stamen', short:'MARK', name:'Cream stamen with ring', layer:3, pass:3,
        params:{ line_colour:'#F0E9C7', line_w_u:3.8, ring_colour:'#765D0C', eye_d_u:16.4, ring_d_u:10, ring_w_u:3.4, eye:'#F0E9C7', count_per_bloom:[5,3,3] },
        implementation:'Cubic from the throat splaying outward, stroked cream; the end gets a cream disc then an olive ring.' },
      { id:'vein', short:'MARK', name:'Olive petal vein', layer:3, pass:3,
        params:{ colour:'#905B06', width_u:3.2, per_back_petal:4, spacing_u:'0.11·bloom width', lobe_ribs:{ per_lobe:4, olive_w_u:2.6, tan:'#D0A16A', tan_w_u:3.0, tan_offset_u:3.0 }, lobe_edge_light:'#FFA076 α0.6 w3.2' },
        implementation:'Four cubics per back petal run parallel to the petal axis from base to tip without converging; each front lobe gets four transverse quadratic ribs, olive doubled by a tan line 2.8 u below.' },
      { id:'stem-gradient', short:'TONE', name:'Bristle stem gradient', layer:2, pass:2,
        params:{ from:'#9ABFA2', to:'#1D4888', length_u:150, strokes:700, stroke_w_u:1.0, alpha_curve:'t^1.3' },
        implementation:'Teal ribbon segment under the centre bloom, then 700 vertical blue strokes whose alpha rises with depth, clipped to the ribbon.' },
      { id:'stem', short:'FORM', name:'Ribbon stem', layer:1, pass:1,
        params:{ width_u:30, black:'#0E0E0E', blue:'#1D4888', cut:'hard, perpendicular to the ribbon', ends:'round', keyline:true },
        implementation:'Cubic centrelines are offset ±15 u along their normals into closed ribbons, split at a parameter into black and blue fills, and keylined as one silhouette.' },
      { id:'mound', short:'COL', name:'Olive mound', layer:1, pass:1,
        params:{ colour:'#B5A448', apex_u:[500,900], base_y_u:975, base_w_u:340, keyline:'arc only' },
        implementation:'Cosine dome polygon filled flat with faint grain; the keyline is stroked from base corner to base corner over the arc and skips the base.' }
    ],
    pass_order:['ground','plates (fans, stems, mound, bloom cups, buds)','grain + throat ramp + stem gradient','striations, veins, stamens','fringe','keyline','tooth ImageData pass on pigment'],
    notes:[ 'All numbers measured on ref-01.png at 900 px and scaled ×1.11 to 1000 design units.', 'Reference area shares: cream 0.30, teal 0.30, red 0.17, blue 0.07, black 0.02, orange 0.03, yellow 0.014.', 'Seed 1101.' ]
  }
});
