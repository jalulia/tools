/* ST-04 · Chromolitho calendar plate — imported from technique-studies/st-04-chromolitho-calendar.html at ck-e12.
   Reference-study plate; every technique block is provable from a point on the
   plate (coverage rule). Renders in canvas2d, 622×900 design pixels.
   compare{} on — reference is public-domain / Julia\'s own instrument (PROCESS §5.4). */
Shell.registerEntry({
  entity: 'exploration',
  id: 'st-04-chromolitho-calendar',
  index: 'ST-04',
  order: 3040,
  title: 'Chromolitho calendar plate',
  section: 'studies',
  style: 'technique-study',
  status: 'canonical',
  lane: 'canvas2d',
  governed_by: ['composing-computational-material-systems'],
  tags: ['Reference study'],

  source: {
    kind: 'reference-study',
    title: 'Reference 04 · misregistered chromolitho calendar with tiled border',
    note: 'Imported at ck-e12 from technique-studies/. compare{} on — reference is public-domain / Julia\'s own instrument (PROCESS §5.4).'
  },

  frame: { designWidth: 622, aspect: '622/900', previewHeight: 900 },
  thumb: 'thumb.png',

  body: [
'A chromolithograph on cream: every colour is a separate flat plate — ochre, sage, slate, pale grey, salmon, tan, rust, black — printed with no shading, and a dark olive-brown keyline carries all the drawing. Each tint sits about a pixel off the line; the border is a stack of small repeating pattern fields cut by a great arc.',
    'Built as ten offscreen plates, each drawn with its own register offset and composited in multiply over the paper, then a per-pixel print mottle on the inks only. Tiles are procedural repeats clipped to rules; plants, sheaf and hops are wavered keyline polygons over their tints; the calendar is the one typeset element.'
  ],

  method: 'Flat plates · register offset · keyline · tile repeats · print mottle',

  compare: {
    /* Reference is public-domain (or Julia's own instrument). The public
       build strips this to null per PROCESS §5.4; the local build keeps it
       so the fidelity readout has something to cite. */
    reference: 'reference-inline',
    readout:   { palette: true, tone: true, edge: true, grain: true, chroma: true }
  },
  plate: {
    fig: '3.4', series: 'STUDIES', sheet: 4, of: 8,
    designWidth: 622, designHeight: 900,
    render: function (canvas, w, h, dpr) {
    const S=w/1000, U=1000, V=h/S;
    let seed=4404; const rnd=()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const rr=(a,b)=>a+(b-a)*rnd();
    const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    const PAPER=hex('#F1E5CB');
    const ink=c=>{ const v=hex(c); return `rgb(${v.map((x,i)=>Math.min(255,Math.round(x*255/PAPER[i]))).join(',')})`; };
    // ---------- plates ----------
    const mk=(dx,dy)=>{ const c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height; const x=c.getContext('2d'); x.setTransform(dpr*S,0,0,dpr*S,dpr*S*dx,dpr*S*dy); x.lineCap='round'; x.lineJoin='round'; return x; };
    const PL={};
    const defs={ ochre:['#E3CA5B',1.6,-1.0], ochreL:['#E4D189',1.2,-1.4], sage:['#C5BB7F',-1.2,1.4], olive:['#ABA65E',-0.6,1.8], slate:['#9DA694',1.0,1.6], pale:['#D3D0BC',-1.6,0.6], salmon:['#E0B48C',1.8,0.8], salmonD:['#C6845A',1.8,0.8], peach:['#EBD5AA',1.8,0.8], yellow:['#E1D298',-0.8,-1.6], cream:['#E3D6A5',-0.8,-1.6], tan:['#AD834C',1.4,1.2], rust:['#B8764B',-1.4,-0.8], black:['#050505',0.6,1.2], green:['#B9BA8C',1.2,1.0], greenD:['#7C8654',1.2,1.0], red:['#A8452B',-1.0,0.8] };
    const order=['cream','yellow','ochreL','ochre','pale','sage','olive','slate','peach','salmon','salmonD','tan','rust','black','green','greenD','red'];
    for(const k of order){ const d=defs[k]; const x=mk(d[1],d[2]); x.fillStyle=x.strokeStyle=ink(d[0]); PL[k]=x; }
    const KEY=mk(0,0); const KEYC=ink('#3A3016'); KEY.fillStyle=KEY.strokeStyle=KEYC;
    // ---------- geometry helpers ----------
    const bez=(p0,p1,p2,p3,n,out)=>{ out=out||[]; for(let i=0;i<=n;i++){ const t=i/n,u=1-t; out.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0], u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]); } return out; };
    const quad=(p0,p1,p2,n,out)=>{ out=out||[]; for(let i=0;i<=n;i++){ const t=i/n,u=1-t; out.push([u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0], u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]]); } return out; };
    const normals=(P,closed)=>{ const n=P.length,N=[]; for(let i=0;i<n;i++){ const a=P[closed?(i-1+n)%n:Math.max(0,i-1)], b=P[closed?(i+1)%n:Math.min(n-1,i+1)]; const dx=b[0]-a[0],dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; N.push([dy/l,-dx/l]); } return N; };
    const mkNoise=()=>{ const p=[rnd()*7,rnd()*7,rnd()*7]; return t=>(Math.sin(t+p[0])+0.5*Math.sin(t*2.13+p[1])+0.25*Math.sin(t*4.7+p[2]))/1.75; };
    const waver=(P,amp,freq,closed)=>{ const N=normals(P,closed); const nz=mkNoise(); const out=[]; let s=0; for(let i=0;i<P.length;i++){ if(i>0)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]); const o=amp*nz(s*freq); out.push([P[i][0]+N[i][0]*o,P[i][1]+N[i][1]*o]); } return out; };
    const path=(x,P,closed)=>{ x.beginPath(); x.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++)x.lineTo(P[i][0],P[i][1]); if(closed)x.closePath(); };
    const fillO=(x,P)=>{ path(x,P,true); x.fill(); };
    let ALL=[];
    const knock=(x,pf)=>{ for(const c of ALL){ if(c===x)continue; c.save(); c.globalCompositeOperation='destination-out'; pf(c); c.fill(); c.restore(); } };
    const fill=(x,P)=>{ knock(x,c=>path(c,P,true)); path(x,P,true); x.fill(); };
    const rectK=(x,x0,y0,w,h)=>{ knock(x,c=>{ c.beginPath(); c.rect(x0,y0,w,h); }); x.fillRect(x0,y0,w,h); };
    const dotK=(x,cx,cy,r)=>{ knock(x,c=>{ c.beginPath(); c.arc(cx,cy,r,0,7); }); x.beginPath(); x.arc(cx,cy,r,0,7); x.fill(); };
    const segLine=(a,b,n)=>{ const o=[]; for(let i=0;i<=n;i++)o.push([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]); return o; };
    const rectP=(x0,y0,x1,y1)=>[...segLine([x0,y0],[x1,y0],Math.max(2,(x1-x0)/12|0)),...segLine([x1,y0],[x1,y1],Math.max(2,(y1-y0)/12|0)).slice(1),...segLine([x1,y1],[x0,y1],Math.max(2,(x1-x0)/12|0)).slice(1),...segLine([x0,y1],[x0,y0],Math.max(2,(y1-y0)/12|0)).slice(1,-1)];
    const circP=(cx,cy,r,a0,a1,n)=>{ a0=a0===undefined?0:a0; a1=a1===undefined?Math.PI*2:a1; n=n||Math.max(12,(r*Math.abs(a1-a0)/6)|0); const o=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } return o; };
    // hand stroke with width jitter, in 8-point runs
    const hand=(x,P,wBase,jit,closed)=>{ const n=P.length, seg=8; for(let i=0;i<n-(closed?0:1);i+=seg){ x.beginPath(); x.moveTo(P[i][0],P[i][1]); for(let k=1;k<=seg;k++){ const j=i+k; if(j>n-1&&!closed)break; const p=P[j%n]; x.lineTo(p[0],p[1]); } x.lineWidth=wBase*(1+jit*(rnd()*2-1)); x.stroke(); } };
    const KW=2.3;
    const kl=(P,closed,wd)=>{ hand(KEY,waver(P,0.7,0.05,closed),wd||KW,0.15,closed); };
    const rule=(a,b,wd)=>{ kl(segLine(a,b,Math.max(2,Math.hypot(b[0]-a[0],b[1]-a[1])/10|0)),false,wd||1.8); };
    const rectRule=(x0,y0,x1,y1,wd)=>kl(rectP(x0,y0,x1,y1),true,wd||1.8);
    const dot=(x,cx,cy,r)=>{ x.beginPath(); x.arc(cx,cy,r,0,7); x.fill(); };
    // clip a set of contexts to a path builder, run fn, restore
    const clip=(ctxs,pf,fn)=>{ for(const x of ctxs){ x.save(); pf(x); x.clip(); } fn(); for(const x of ctxs)x.restore(); };
    const rectPF=(x0,y0,x1,y1)=>x=>{ x.beginPath(); x.rect(x0,y0,x1-x0,y1-y0); };
    const discPF=(cx,cy,r)=>x=>{ x.beginPath(); x.arc(cx,cy,r,0,7); };
    const ringPF=(cx,cy,r0,r1)=>x=>{ x.beginPath(); x.arc(cx,cy,r1,0,7); x.arc(cx,cy,r0,7,0,true); };
    ALL=order.map(k=>PL[k]).concat([KEY]);
    // ribbon around a polyline centre
    const ribbon=(Cn,wid)=>{ const N=normals(Cn,false); const L=[],R=[]; const n=Cn.length; for(let i=0;i<n;i++){ const wv=(typeof wid==='function'?wid(i/(n-1)):wid)/2; L.push([Cn[i][0]+N[i][0]*wv,Cn[i][1]+N[i][1]*wv]); R.push([Cn[i][0]-N[i][0]*wv,Cn[i][1]-N[i][1]*wv]); } return [...L,...R.reverse()]; };
    // ---------- tiles ----------
    const tSquares=(x0,y0,x1,y1)=>{ rectK(PL.ochre,x0-4,y0-4,x1-x0+8,y1-y0+8); const p=22.5,s=10.5; let row=0; for(let y=y0+p*0.55;y<y1+p;y+=p,row++){ const off=(row&1)?p/2:0; for(let x=x0+off+p*0.5;x<x1+p;x+=p){ const q=rectP(x-s/2,y-s/2,x+s/2,y+s/2); const qw=waver(q,0.6,0.2,true); PL.ochre.save(); PL.ochre.globalCompositeOperation='destination-out'; fill(PL.ochre,qw); PL.ochre.restore(); kl(qw,true,2.2); dot(KEY,x+p/2,y,1.7); } } };
    const spiralP=(cx,cy,rmax,turns,rot)=>{ const o=[]; const n=Math.round(turns*28); for(let i=0;i<=n;i++){ const t=i/n; const a=rot+t*turns*Math.PI*2; const r=3.5+(rmax-3.5)*Math.pow(t,0.9); o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } return o; };
    const tSpiral=(x0,y0,x1,y1)=>{ rectK(PL.pale,x0-4,y0-4,x1-x0+8,y1-y0+8); const p=52; let row=0; for(let y=y0+p*0.5;y<y1+p*0.5;y+=p*0.86,row++){ const off=(row&1)?p/2:0; for(let x=x0+off+p*0.5-p;x<x1+p;x+=p){ const sp=spiralP(x+rr(-4,4),y+rr(-4,4),rr(15,19),rr(1.3,1.5),rr(0,6.28)); const rb=ribbon(sp,i=>5.2*(0.7+0.3*i)); const rw=waver(rb,0.5,0.15,true); fill(PL.slate,rw); kl(rw,true,1.7); dotK(PL.black,x+p/2,y+p*0.43,1.8); } } };
    const heartP=(cx,cy,s)=>{ const o=[]; quad([cx,cy+s*0.5],[cx-s*0.75,cy-s*0.05],[cx-s*0.5,cy-s*0.45],10,o); quad([cx-s*0.5,cy-s*0.45],[cx-s*0.2,cy-s*0.6],[cx,cy-s*0.25],8,o); quad([cx,cy-s*0.25],[cx+s*0.2,cy-s*0.6],[cx+s*0.5,cy-s*0.45],8,o); quad([cx+s*0.5,cy-s*0.45],[cx+s*0.75,cy-s*0.05],[cx,cy+s*0.5],10,o); return o; };
    const tHearts=(x0,y0,x1,y1)=>{ rectK(PL.ochreL,x0-4,y0-4,x1-x0+8,y1-y0+8); const p=24,rh=26; let row=0; for(let y=y0+rh*0.5;y<y1+rh;y+=rh,row++){ const off=(row&1)?p/2:0; for(let x=x0+off+p*0.5;x<x1+p;x+=p){ const hp=waver(heartP(x,y,13),0.5,0.2,true); PL.ochreL.save(); PL.ochreL.globalCompositeOperation='destination-out'; fill(PL.ochreL,hp); PL.ochreL.restore(); kl(hp,true,2.2); rectK(PL.black,x+p/2-3,y+rh/2-3,6,6); } } };
    const tScallop=(x0,y0,x1,y1)=>{ rectK(PL.ochreL,x0-4,y0-4,x1-x0+8,y1-y0+8); const p=22,r=11; let row=0; for(let y=y0+2;y<y1+p;y+=r,row++){ const off=(row&1)?p/2:0; for(let x=x0+off;x<x1+p;x+=p){ kl(circP(x,y,r,Math.PI,Math.PI*2,14),false,1.9); dot(KEY,x,y-4,1.5); } } };
    const tWave=(x0,y0,x1,y1,lines)=>{ rectK(PL.pale,x0-4,y0-4,x1-x0+8,y1-y0+8); const n=lines||3; const H=y1-y0; for(let k=0;k<n;k++){ const yc=y0+H*(k+0.5)/n; const P=[]; for(let x=x0-10;x<=x1+10;x+=3)P.push([x,yc+3.2*Math.sin(x/26*Math.PI*2+k*1.3)]); const Pw=waver(P,0.4,0.1,false); PL.slate.lineWidth=4.2; PL.slate.beginPath(); for(let i=0;i<Pw.length;i++){ if(i)PL.slate.lineTo(Pw[i][0],Pw[i][1]); else PL.slate.moveTo(Pw[i][0],Pw[i][1]); } PL.slate.stroke(); kl(Pw.map(q=>[q[0],q[1]-2.4]),false,1.4); } };
    const tWaveV=(x0,y0,x1,y1,lines)=>{ rectK(PL.pale,x0-4,y0-4,x1-x0+8,y1-y0+8); const n=lines||3; const Wd=x1-x0; for(let k=0;k<n;k++){ const xc=x0+Wd*(k+0.5)/n; const P=[]; for(let y=y0-10;y<=y1+10;y+=3)P.push([xc+4*Math.sin(y/30*Math.PI*2+k*1.3),y]); const Pw=waver(P,0.4,0.1,false); PL.slate.lineWidth=4; path(PL.slate,Pw,false); PL.slate.stroke(); kl(Pw.map(q=>[q[0]-2.6,q[1]]),false,1.5); } };
    const tDots=(x0,y0,x1,y1)=>{ rectK(PL.salmon,x0-4,y0-4,x1-x0+8,y1-y0+8); const p=9.5; let row=0; for(let y=y0;y<y1+p;y+=p*0.87,row++){ const off=(row&1)?p/2:0; for(let x=x0+off;x<x1+p;x+=p){ dotK(PL.salmonD,x+rr(-1.8,1.8),y+rr(-1.8,1.8),rr(2.8,3.8)); } } };
    const tChecker=(x0,y0,x1,y1)=>{ const c=12; let row=0; for(let y=y0;y<y1;y+=c,row++){ for(let x=x0+((row&1)?c:0);x<x1;x+=c*2)PL.black.fillRect(x,y,Math.min(c,x1-x),Math.min(c,y1-y)); } };
    const tZigzag=(x0,y0,x1,y1)=>{ const yc=(y0+y1)/2; const P=[]; let k=0; for(let x=x0;x<=x1;x+=6.5,k++)P.push([x,yc+(k&1?-5:5)]); const Pw=waver(P,0.4,0.1,false); PL.rust.lineWidth=2.6; path(PL.rust,Pw,false); PL.rust.stroke(); PL.rust.lineWidth=2.2; for(const yy of [y0+2,y1-2]){ path(PL.rust,waver(segLine([x0,yy],[x1,yy],20),0.4,0.08,false),false); PL.rust.stroke(); } };
    const tRingDot=(x0,y0,x1,y1)=>{ rectK(PL.pale,x0-4,y0-4,x1-x0+8,y1-y0+8); const p=20; let row=0; for(let y=y0+p/2;y<y1+p;y+=p*0.87,row++){ const off=(row&1)?p/2:0; for(let x=x0+off;x<x1+p;x+=p){ kl(circP(x,y,6.2),true,1.9); dot(KEY,x,y,1.8); } } };
    const tStars=(x0,y0,x1,y1)=>{ rectK(PL.peach,x0-4,y0-4,x1-x0+8,y1-y0+8); const p=30; let row=0; for(let y=y0+p*0.45;y<y1+p;y+=p*0.8,row++){ const off=(row&1)?p/2:0; for(let x=x0+off+p*0.3;x<x1+p;x+=p){ for(let k=0;k<6;k++){ const a=k*Math.PI/3+rr(-0.15,0.15); const r0=3.5,r1=rr(8,10.5); rule([x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1],1.6); } dot(KEY,x,y,1.4); dot(KEY,x+p/2,y+p*0.4,1.3); } } };
    const tCross=(x0,y0,x1,y1)=>{ rectK(PL.slate,x0-4,y0-4,x1-x0+8,y1-y0+8); const p=11; let row=0; for(let y=y0+p/2;y<y1+p;y+=p,row++){ const off=(row&1)?p/2:0; for(let x=x0+off;x<x1+p;x+=p){ rule([x-3,y-3],[x+3,y+3],1.6); rule([x+3,y-3],[x-3,y+3],1.6); } } };
    // ---------- botanicals ----------
    const leaf=(p0,p1,wid,bow,plate,serr)=>{ const dx=p1[0]-p0[0],dy=p1[1]-p0[1]; const L=Math.hypot(dx,dy); const nx=-dy/L,ny=dx/L; const ax=[]; for(let i=0;i<=24;i++){ const t=i/24; ax.push([p0[0]+dx*t+nx*bow*Math.sin(Math.PI*t), p0[1]+dy*t+ny*bow*Math.sin(Math.PI*t)]); } const N=normals(ax,false); const A=[],B=[]; for(let i=0;i<=24;i++){ const t=i/24; let wv=wid*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05)),0.8)*(serr&&(i&1)?0.86:1); A.push([ax[i][0]+N[i][0]*wv,ax[i][1]+N[i][1]*wv]); B.push([ax[i][0]-N[i][0]*wv,ax[i][1]-N[i][1]*wv]); } const P=[...A,...B.reverse()]; const Pw=waver(P,0.6,0.08,true); fill(plate,Pw); kl(Pw,true); kl(ax.slice(2,21),false,1.6); return Pw; };
    const stem=(pts,wid,plate)=>{ const Cn=bez(pts[0],pts[1],pts[2],pts[3],40); const rb=ribbon(Cn,wid); fill(plate,rb); kl(rb,true,2.2); return Cn; };
    const aster=(cx,cy,R,sq,rot,np)=>{ np=np||16; const petals=[]; for(let i=0;i<np;i++){ const a=rot+i/np*Math.PI*2+rr(-0.05,0.05); const r0=R*0.26, r1=R*rr(0.92,1.05); const wv=R*0.19; const ca=Math.cos(a),sa=Math.sin(a); const px=-sa,py=ca; const P=[]; quad([cx+ca*r0,cy+sa*r0*sq],[cx+ca*(r0+r1)/2+px*wv*1.5,cy+(sa*(r0+r1)/2+py*wv*1.5)*sq],[cx+ca*r1,cy+sa*r1*sq],9,P); quad([cx+ca*r1,cy+sa*r1*sq],[cx+ca*(r0+r1)/2-px*wv*1.5,cy+(sa*(r0+r1)/2-py*wv*1.5)*sq],[cx+ca*r0,cy+sa*r0*sq],9,P); const Pw=waver(P,0.5,0.1,true); fill(PL.pale,Pw); kl(Pw,true); } const disc=circP(cx,cy,R*0.3).map(p=>[p[0],cy+(p[1]-cy)*sq]); const dw=waver(disc,0.5,0.15,true); fill(PL.ochre,dw); kl(dw,true,2.2); for(let i=0;i<34;i++){ const a=rr(0,6.28), r=R*0.27*Math.sqrt(rnd()); dot(KEY,cx+Math.cos(a)*r,cy+Math.sin(a)*r*sq,1.2); } };
    const asterSide=(cx,cy,R,dir)=>{ // half-open head seen from the side, calyx below
      const petals=[]; const n=9; for(let i=0;i<n;i++){ const a=-Math.PI+(i+0.5)/n*Math.PI+rr(-0.05,0.05); const r1=R*rr(0.9,1.05),wv=R*0.17; const ca=Math.cos(a),sa=Math.sin(a); const P=[]; quad([cx+ca*4,cy+sa*4],[cx+ca*r1*0.5-sa*wv,cy+sa*r1*0.5+ca*wv],[cx+ca*r1,cy+sa*r1],8,P); quad([cx+ca*r1,cy+sa*r1],[cx+ca*r1*0.5+sa*wv,cy+sa*r1*0.5-ca*wv],[cx+ca*4,cy+sa*4],8,P); petals.push(waver(P,0.5,0.1,true)); } for(const P of petals)fill(PL.pale,P); for(const P of petals)kl(P,true);
      const cal=[]; quad([cx-R*0.36,cy-2],[cx-R*0.22,cy+R*0.4],[cx,cy+R*0.56],8,cal); quad([cx,cy+R*0.56],[cx+R*0.22,cy+R*0.4],[cx+R*0.36,cy-2],8,cal); cal.push([cx+R*0.36,cy-2]); const cw=waver(cal,0.5,0.1,true); fill(PL.sage,cw); kl(cw,true); for(let k=-1;k<=1;k++)rule([cx+k*R*0.1,cy+2],[cx+k*R*0.15,cy+R*0.4],1.4); };
    const floretDots=(P,plate,r0,r1)=>{ for(const p of P){ const r=rr(r0,r1); const q=[p[0]+rr(-1,1),p[1]+rr(-1,1)]; dotK(plate,q[0],q[1],r); const a=rr(-2.8,-0.3); kl(circP(q[0],q[1],r*0.95,a,a+2.4,6),false,1.4); } };
    const goldenrod=(base,ctrl,top,lean)=>{ const Cn=bez(base,[base[0],base[1]-(base[1]-top[1])*0.35],ctrl,top,50); const rb=ribbon(Cn,t=>7-3.5*t); fill(PL.sage,rb); kl(rb,true,2.2);
      // leaves on the lower 50 %
      for(let i=0;i<5;i++){ const t=0.05+i*0.1; const p=Cn[Math.round(t*50)]; const sg=(i&1)?1:-1; const L=rr(85,125)*(1-0.25*t); leaf(p,[p[0]+sg*L*0.55+lean*14,p[1]-L*0.7],rr(11,15),sg*rr(8,16),(i%3===2)?PL.olive:PL.sage); }
      // plume: branches from the upper 45 %, each a dense arc of florets; longest low, shortest at the tip
      const florets=[]; for(let i=0;i<9;i++){ const t=0.5+i*0.052; const p=Cn[Math.round(t*50)]; const sg=(i&1)?1:-1; const L=rr(70,105)*(1-0.55*i/9); const end=[p[0]+sg*L*0.8+lean*L*0.4,p[1]-L*0.62]; const Q=quad(p,[p[0]+sg*L*0.2+lean*L*0.15,p[1]-L*0.6],end,22); kl(Q,false,1.8); for(let k=4;k<Q.length;k++){ const nn=2+(k>Q.length*0.5?1:0); for(let m=0;m<nn;m++)florets.push([Q[k][0]+rr(-6,6),Q[k][1]-rr(0,9)]); } }
      const tip=quad(Cn[50],[top[0]+lean*22,top[1]-46],[top[0]+lean*50,top[1]-70],18); kl(tip,false,1.8); for(let k=2;k<tip.length;k++)for(let m=0;m<3;m++)florets.push([tip[k][0]+rr(-6,6),tip[k][1]-rr(0,8)]);
      floretDots(florets,PL.ochre,3.2,5.0); };
    const hopLeaf=(cx,cy,sz,rot)=>{ const P=[]; const pt=(a,r)=>[cx+Math.cos(a+rot)*r*sz,cy+Math.sin(a+rot)*r*sz]; // 3-lobed with notches, tip at -90°
      const lobes=[[-Math.PI/2,1.0],[-Math.PI/2-1.25,0.82],[-Math.PI/2+1.25,0.82]]; const seq=[lobes[1],lobes[0],lobes[2]]; P.push(pt(Math.PI/2,0.18)); P.push(pt(Math.PI/2+1.0,0.34)); for(let i=0;i<3;i++){ const [a,r]=seq[i]; const base=P[P.length-1]; const tip=pt(a,r); const mid=pt(a-0.45,r*0.72); quad(base,mid,tip,12,P); if(i<2){ const nxt=seq[i+1]; const notch=pt((a+nxt[0])/2,0.36); quad(tip,pt(a+0.4,r*0.7),notch,12,P); } } quad(P[P.length-1],pt(Math.PI/2-1.0,0.34),pt(Math.PI/2,0.18),12,P);
      // serrations
      const Ps=P.map((p,i)=>{ if(i%2)return p; const d=[p[0]-cx,p[1]-cy]; const l=Math.hypot(d[0],d[1])||1; return [p[0]-d[0]/l*2.2,p[1]-d[1]/l*2.2]; }); const Pw=waver(Ps,0.5,0.12,true); fill(PL.tan,Pw); kl(Pw,true); for(const [a,r] of lobes){ const t=pt(a,r*0.82); rule([cx,cy],t,1.6); const m=pt(a,r*0.45); for(const sg of [-1,1]){ rule(m,pt(a+sg*0.5,r*0.66),1.3); } } };
    const hopCone=(cx,cy,wd,ht,rot)=>{ const ca=Math.cos(rot),sa=Math.sin(rot); const tr=(x,y)=>[cx+x*ca-y*sa,cy+x*sa+y*ca]; // ovoid silhouette, bract scallops inside, tips poking out at the sides
      const rows=6; const prof=t=>wd*0.5*Math.pow(Math.sin(Math.PI*Math.min(1,0.08+0.92*t)),0.7); const O=[]; for(let i=0;i<=20;i++){ const t=i/20; O.push(tr(-prof(t),-ht/2+ht*t)); } for(let i=20;i>=0;i--){ const t=i/20; O.push(tr(prof(t),-ht/2+ht*t)); }
      // side tips: small pointed bulges along the outline
      const Ow=waver(O,0.6,0.08,true); fill(PL.yellow,Ow); kl(Ow,true);
      for(let r=0;r<rows;r++){ const t=(r+0.5)/rows; const y=-ht/2+ht*t; const w=prof(t)*2; const n=(r&1)?3:2; for(let k=0;k<n;k++){ const u=n===1?0:(k/(n-1)-0.5)*(1-1/n); const bx=u*w; const bw=w/n*0.95; const bh=ht/rows*1.15; const Q=[]; quad(tr(bx-bw/2,y-bh*0.15),tr(bx-bw*0.45,y+bh*0.55),tr(bx,y+bh*0.7),8,Q); quad(tr(bx,y+bh*0.7),tr(bx+bw*0.45,y+bh*0.55),tr(bx+bw/2,y-bh*0.15),8,Q); kl(Q,false,1.8); } }
      rule(tr(0,-ht/2-2),tr(rr(-4,4),-ht/2-16),2.2); };
    // wheat ear: alternating grains along an axis
    const ear=(p0,ang,len)=>{ const ca=Math.cos(ang),sa=Math.sin(ang); const n=6; for(let i=0;i<n;i++){ const t=i/(n-1); const d=len*t; const cx=p0[0]+ca*d, cy=p0[1]+sa*d; for(const sg of [-1,1]){ const ox=-sa*sg*3.2, oy=ca*sg*3.2; const G=[]; const gl=9,gw=3.6; const a2=ang+sg*0.5; const c2=Math.cos(a2),s2=Math.sin(a2); const b=[cx+ox,cy+oy]; quad(b,[b[0]+c2*gl*0.5-s2*gw*1.6,b[1]+s2*gl*0.5+c2*gw*1.6],[b[0]+c2*gl,b[1]+s2*gl],6,G); quad([b[0]+c2*gl,b[1]+s2*gl],[b[0]+c2*gl*0.5+s2*gw*1.6,b[1]+s2*gl*0.5-c2*gw*1.6],b,6,G); fill(PL.ochre,G); kl(G,true,1.7); rule([b[0]+c2*gl,b[1]+s2*gl],[b[0]+c2*(gl+20),b[1]+s2*(gl+20)],1.2); } } };
    // ---------- layout ----------
    const ctx=canvas.getContext('2d'); ctx.setTransform(dpr*S,0,0,dpr*S,0,0); ctx.fillStyle='#F1E5CB'; ctx.fillRect(0,0,U,V);
    // paper: ±0.8 % per-pixel noise (ref paper L std 1.6)
    { const W=canvas.width,H=canvas.height; const id=ctx.getImageData(0,0,W,H); const d=id.data; let h=4404; for(let i=0;i<d.length;i+=4){ h=(h+0x6D2B79F5)|0; let t=Math.imul(h^h>>>15,1|h); t=t+Math.imul(t^t>>>7,61|t)^t; const n=((t^t>>>14)>>>0)/4294967296-0.5; const f=1+0.022*n; d[i]=Math.min(255,d[i]*f); d[i+1]=Math.min(255,d[i+1]*f); d[i+2]=Math.min(255,d[i+2]*f); } ctx.putImageData(id,0,0); }
    // frame
    const FX0=48,FY0=30,FX1=962,FY1=1372;
    rectRule(FX0,FY0,FX1,FY1,2.4);
    const LX0=60,LX1=300,CX0=310,CX1=790,RX0=800,RX1=952;
    // --- top band: scallops (x 310–800, y 62–118) with a rust rule under it
    clip(ALL,rectPF(CX0,62,RX0,118),()=>tScallop(CX0,62,RX0,118)); rectRule(CX0,62,RX0,118); PL.rust.lineWidth=2.4; path(PL.rust,waver(segLine([CX0,124],[RX0,124],30),0.4,0.08,false),false); PL.rust.stroke(); rule([CX0,130],[RX0,130],1.6);
    // --- calendar bands (drawn before the arc so the arc cuts across them)
    clip(ALL,rectPF(CX0,790,RX0,850),()=>tHearts(CX0,790,RX0,850)); rectRule(CX0,790,RX0,850);
    tZigzag(CX0,852,RX0,870);
    clip(ALL,rectPF(CX0,872,RX0,940),()=>{ // scroll band: running spirals joined by a wave
      rectK(PL.pale,CX0-4,868,RX0-CX0+8,76); const p=60; for(let x=CX0+p/2;x<RX0+p;x+=p){ const sp=spiralP(x,912,17,1.5,Math.PI*0.5); const rb=ribbon(sp,i=>5.2*(0.6+0.4*i)); const rw=waver(rb,0.5,0.15,true); fill(PL.slate,rw); kl(rw,true,1.5); const W=quad([x-p/2+2,916],[x-p/4,876],[x+2,886],14); const wb=ribbon(W,4.6); fill(PL.slate,wb); kl(wb,true,1.5); dotK(PL.black,x-p/2+6,932,1.9); } });
    rectRule(CX0,872,RX0,940);
    clip(ALL,rectPF(CX0,944,RX0,968),()=>tChecker(CX0,944,RX0,968)); rectRule(CX0,944,RX0,968);
    // --- right column x 800–952: cream field with aster stems (y 130–380), zigzag, spirals
    clip(ALL,rectPF(RX0,130,RX1,380),()=>{ rectK(PL.cream,RX0-4,126,RX1-RX0+8,258); });
    tZigzag(RX0,384,RX1,402);
    clip(ALL,rectPF(RX0,406,RX1,600),()=>tSpiral(RX0,406,RX1,600)); rule([RX0,600],[RX1,600],1.6);
    tZigzag(RX0,604,RX1,622); rule([RX0,626],[RX1,626],1.6);
    clip(ALL,rectPF(RX0,626,RX1,1160),()=>tWaveV(RX0,626,RX1,1160,7));
    rule([RX0,130],[RX0,1160],1.8); rule([RX1,130],[RX1,1160],1.8); rule([RX0,380],[RX1,380],1.6); rule([RX0,406],[RX1,406],1.6); rule([RX0,1160],[RX1,1160],1.8);
    // --- great arc: centre (992,1160) r 300 — a quarter circle in the lower-right corner cutting the column and the bands
    clip(ALL,rectPF(600,700,RX1,1160),()=>{ const cx=992,cy=1160; clip(ALL,discPF(cx,cy,300),()=>{ // sawtooth ring 286–300
        rectK(PL.pale,680,850,300,320); const nt=120; for(let i=0;i<nt;i++){ const a0=Math.PI*0.5+i/nt*Math.PI*2, a1=a0+Math.PI*2/nt; const T=[[cx+Math.cos(a0)*302,cy+Math.sin(a0)*302],[cx+Math.cos(a1)*302,cy+Math.sin(a1)*302],[cx+Math.cos((a0+a1)/2)*286,cy+Math.sin((a0+a1)/2)*286]]; fill(PL.black,T); }
      });
      clip(ALL,discPF(cx,cy,286),()=>{ rectK(PL.salmon,680,850,320,320); });
      kl(circP(cx,cy,286,Math.PI,Math.PI*1.5,90),false,1.8);
      clip(ALL,discPF(cx,cy,272),()=>{ tRingDot(680,860,1000,1170); });
      kl(circP(cx,cy,272,Math.PI,Math.PI*1.5,90),false,1.8);
      PL.rust.lineWidth=2.4; path(PL.rust,circP(cx,cy,279,Math.PI,Math.PI*1.5,90),false); PL.rust.stroke();
      clip(ALL,discPF(cx,cy,246),()=>{ tSquares(720,890,1000,1170); });
      kl(circP(cx,cy,246,Math.PI,Math.PI*1.5,90),false,2.2);
      kl(circP(cx,cy,300,Math.PI,Math.PI*1.5,100),false,2.2);
    });
    // --- left panel x 60–300: lunette (salmon stars) 345–420, paper stripe, slate field 435–930
    { const lun=[[LX0,420],[LX0,374]]; quad([LX0,374],[(LX0+LX1)/2,332],[LX1,374],30,lun); lun.push([LX1,420]); clip(ALL,x=>{ path(x,lun,true); },()=>tStars(LX0,340,LX1,420)); kl(lun,true,1.8);
      clip(ALL,rectPF(LX0,435,LX1,930),()=>{ rectK(PL.slate,LX0-4,431,LX1-LX0+8,504); }); rectRule(LX0,435,LX1,930,1.8); rule([LX0,427],[LX1,427],1.4);
      // goldenrod + asters in the panel
      clip(ALL,rectPF(LX0+2,437,LX1-2,928),()=>{
        goldenrod([108,928],[80,640],[100,530],-0.25);
        goldenrod([246,928],[286,650],[262,505],0.3);
        const s1=stem([[180,928],[186,790],[130,690],[165,585]],6,PL.sage); leaf(s1[10],[s1[10][0]+95,s1[10][1]-70],17,12,PL.sage); leaf(s1[22],[s1[22][0]-90,s1[22][1]-46],16,-11,PL.sage);
        aster(165,585,62,1,0.2,16);
        const s2=stem([[284,928],[286,860],[262,790],[244,712]],5.5,PL.sage); leaf(s2[16],[s2[16][0]-80,s2[16][1]-40],15,-9,PL.sage); leaf(s2[6],[s2[6][0]+50,s2[6][1]-70],13,8,PL.sage);
        aster(244,712,50,0.85,0.5,16);
        const s3=stem([[150,928],[165,880],[196,860],[200,812]],5,PL.sage); asterSide(200,812,44,1);
        const s4=stem([[76,928],[68,890],[62,860],[82,830]],5,PL.sage); leaf(s4[22],[s4[22][0]+64,s4[22][1]-26],13,9,PL.olive); aster(82,830,38,0.72,0.9,15);
        leaf([182,905],[100,840],20,-14,PL.sage); leaf([186,870],[290,800],19,12,PL.sage); leaf([110,760],[40,700],17,-10,PL.sage); leaf([250,905],[300,835],16,10,PL.sage); leaf([120,540],[60,470],16,-9,PL.sage); leaf([262,600],[300,520],15,9,PL.olive); leaf([108,700],[190,650],18,10,PL.sage); leaf([246,760],[160,720],17,-9,PL.sage); leaf([80,880],[150,800],15,8,PL.sage);
      });
      // below the panel: paper with a keyline bine and a tan hop leaf (y 945–1150)
      clip(ALL,rectPF(LX0,940,LX1,1160),()=>{ const B=bez([LX0-4,1150],[120,1040],[160,1080],[LX1+4,960],40); kl(B,false,2.6); const B2=bez([150,1075],[140,1120],[110,1150],[90,1158],20); kl(B2,false,2.2); hopLeaf(196,1040,66,0.35); hopLeaf(100,1112,44,-0.6); kl(spiralP(258,1000,11,1.4,1.2),false,1.6); });
      rule([LX0,940],[LX1,940],1.6);
    }
    // --- calendar (x 310–790, y 140–660)
    { const cxm=(CX0+CX1)/2; const font=(sz,wt)=>`${wt||400} ${sz}px 'Georgia','Times New Roman',serif`;
      PL.green.font=font(70,700); PL.green.textAlign='center'; PL.green.textBaseline='alphabetic'; PL.green.fillText('September',cxm,236);
      PL.greenD.font=font(70,700); PL.greenD.textAlign='center'; PL.greenD.textBaseline='alphabetic'; PL.greenD.lineWidth=1.7; PL.greenD.lineJoin='round'; PL.greenD.strokeText('September',cxm,236);
      KEY.font=font(27,400); KEY.textAlign='center'; KEY.textBaseline='alphabetic'; PL.red.font=font(27,400); PL.red.textAlign='center'; PL.red.textBaseline='alphabetic';
      const cols=[0,1,2,3,4,5,6].map(i=>cxm+(i-3)*56);
      const wd=['S','M','T','W','T','F','S']; wd.forEach((c,i)=>{ KEY.fillText(c,cols[i],296); if(i<6)rule([cols[i]+28,278],[cols[i]+28,300],1.4); });
      const red=new Set([7,22]); let d=1; for(let r=0;r<5;r++){ for(let c=0;c<7;c++){ if(r===0&&c<2)continue; if(d>30)break; const x=(red.has(d)?PL.red:KEY); x.fillText(String(d),cols[c],352+r*43); d++; } }
      PL.red.font=font(25,400); PL.red.textAlign='left'; PL.red.fillText('7 - labor day',cols[0]-12,602); PL.red.fillText('22 - equinox',cols[0]-12,638);
    }
    // --- top-right aster cluster breaking the frame (x 720–1000, y 0–300); stems run into the cream field
    { clip(ALL,rectPF(RX0,130,RX1,380),()=>{ const s1=stem([[900,380],[905,300],[870,220],[862,150]],5.5,PL.sage); const s2=stem([[850,380],[845,330],[935,270],[938,215]],5.5,PL.sage); leaf(s1[18],[s1[18][0]-58,s1[18][1]-70],12,-8,PL.sage); leaf(s2[12],[s2[12][0]+50,s2[12][1]-56],11,7,PL.sage); leaf(s1[30],[s1[30][0]+62,s1[30][1]-38],12,9,PL.sage); leaf(s2[26],[s2[26][0]-50,s2[26][1]-60],11,-6,PL.sage); });
      stem([[862,150],[858,120],[850,100],[848,84]],5,PL.sage); stem([[938,215],[940,190],[930,170],[925,150]],5,PL.sage); stem([[880,214],[860,190],[812,190],[786,170]],4.5,PL.sage);
      leaf([880,214],[820,262],12,12,PL.sage); leaf([850,100],[910,126],9,-7,PL.olive);
      aster(848,84,64,1,0.3,17); aster(925,150,50,0.8,0.7,16); asterSide(786,170,42,-1);
    }
    // --- cartouche (60,62)–(300,330)
    { const x0=LX0,y0=62,x1=LX1,y1=330; const sx=(x0+x1)/2; clip(ALL,rectPF(x0,y0,x1,y1),()=>{ rectK(PL.cream,x0-4,y0-4,x1-x0+8,y1-y0+8);
        // rays from the point behind the sheaf, sky only
        KEY.save(); KEY.globalAlpha=0.55; for(let i=0;i<30;i++){ const a=Math.PI+(i+0.5)/30*Math.PI; const r0=rr(70,90), r1=rr(150,190); rule([sx+Math.cos(a)*r0,236+Math.sin(a)*r0],[sx+Math.cos(a)*r1,236+Math.sin(a)*r1],1.1); } KEY.restore();
        // horizon and ground
        const hz=[]; for(let x=x0-4;x<=x1+4;x+=6)hz.push([x,258+3*Math.sin(x/38)]); const G=[...hz,[x1+4,y1+4],[x0-4,y1+4]]; fill(PL.sage,G); kl(hz,false,2.2);
        for(let x=x0+6;x<x1;x+=6){ rule([x+rr(-2,2),262+rr(0,4)],[x+rr(-4,4),262+rr(12,28)],1.3); }
        // sheaf body: pale-yellow hourglass bundle with keyline stalks, tan band at the waist
        const by=304; const body=[]; bez([sx-52,by],[sx-40,by-30],[sx-14,by-50],[sx-12,by-60],10,body); bez([sx-12,by-60],[sx-14,by-90],[sx-70,by-120],[sx-84,by-150],10,body); body.push([sx+84,by-150]); bez([sx+84,by-150],[sx+70,by-120],[sx+14,by-90],[sx+12,by-60],10,body); bez([sx+12,by-60],[sx+14,by-50],[sx+40,by-30],[sx+52,by],10,body); const bw=waver(body,0.6,0.08,true); fill(PL.yellow,bw); kl(bw,true);
        const ears=[]; for(let i=0;i<13;i++){ const u=(i/12-0.5); const top=[sx+u*172+rr(-3,3),by-150-Math.max(0,20-Math.abs(u)*70)+Math.abs(u)*40+rr(-5,5)]; const Q=bez([sx+u*44,by],[sx+u*30,by-40],[sx+u*30,by-90],top,24); kl(Q,false,1.7); ears.push([top,Q]); }
        const band=ribbon(quad([sx-32,by-64],[sx,by-52],[sx+32,by-64],10),13); fill(PL.tan,band); kl(band,true,2.0); rule([sx-5,by-70],[sx-14,by-42],1.6); rule([sx+5,by-70],[sx+14,by-42],1.6);
        for(const [top,Q] of ears){ const p=Q[20]; const ang=Math.atan2(top[1]-p[1],top[0]-p[0]); ear(top,ang,40); }
      });
      rectRule(x0,y0,x1,y1,2.4); rectRule(x0+8,y0+8,x1-8,y1-8,1.4);
      // symbol tab above with ♍ built from strokes
      const tx0=sx-70,tx1=sx+70,ty0=14,ty1=60; clip(ALL,rectPF(tx0,ty0,tx1,ty1),()=>{ rectK(PL.cream,tx0-4,ty0-4,tx1-tx0+8,ty1-ty0+8); }); rectRule(tx0,ty0,tx1,ty1,2.0); for(const ex of [tx0-6,tx1+6]){ const c=circP(ex,37,9); fill(PL.ochre,c); kl(c,true,2.0); dot(KEY,ex,37,2.2); }
      { const gx=sx,gy=48; // ♍: three arches + looped tail
        for(let k=0;k<3;k++){ const x=gx-14+k*13; kl(bez([x-4,gy],[x-4,gy-22],[x+9,gy-22],[x+9,gy-8],12),false,3); if(k<2)rule([x+9,gy-8],[x+9,gy],3); }
        kl(bez([gx+22,gy-8],[gx+22,gy+4],[gx+10,gy+8],[gx+2,gy+2],12),false,3); }
    }
    // --- bottom frieze: paper strip 1170–1215 with hop cones, salmon dot band 1215–1320, wave band 1320–1360
    { rule([LX0,1170],[RX1,1170],1.8); for(let x=LX0+4;x<RX1;x+=7)dot(KEY,x,1180,1.3);
      clip(ALL,rectPF(LX0,1222,RX1,1302),()=>tDots(LX0,1222,RX1,1302)); rectRule(LX0,1222,RX1,1302,1.8);
      clip(ALL,rectPF(LX0,1306,RX1,1342),()=>tWave(LX0,1306,RX1,1342,2)); rectRule(LX0,1306,RX1,1342,1.8);
      // bines: sage ribbons keylined, tan leaves, cones rising above the salmon
      for(let i=0;i<4;i++){ const xa=100+i*222; stem([[xa,1300],[xa+30,1280],[xa+90,1258],[xa+118,1206]],5,PL.sage); stem([[xa+150,1300],[xa+150,1284],[xa+100,1250],[xa+56,1214]],4.5,PL.sage);
        hopLeaf(xa+80,1264,70,rr(-0.3,0.3)); hopLeaf(xa+180,1278,44,rr(-0.5,0.5));
        kl(spiralP(xa+30,1245,10,1.4,rr(0,6)),false,1.8);
        hopCone(xa+118,1180,60,92,rr(-0.2,0.2)); hopCone(xa+56,1190,46,72,rr(-0.3,0.3)); }
      // corner ornament square at right
      clip(ALL,rectPF(890,1232,936,1292),()=>{ rectK(PL.ochre,886,1228,54,68); }); rectRule(890,1232,936,1292,2.0); rectRule(898,1242,928,1282,1.4); for(const [dx,dy] of [[-8,-10],[8,-10],[-8,10],[8,10]])dotK(PL.black,913+dx,1262+dy,3);
      // bottom-left hairline scroll below the frame
      kl(bez([60,1372],[60,1420],[110,1430],[140,1400],20),false,1.6); kl(spiralP(148,1396,9,1.4,Math.PI),false,1.6);
    }
    // column separations
    rule([LX1,62],[LX1,1160],1.8); rule([LX0,1160],[LX1,1160],1.8); rule([CX0,130],[CX0,1160],1.4);
    // ---------- composite: plates → white sheet (multiply) → mottle → paper; keyline last ----------
    const sheet=mk(0,0); sheet.setTransform(1,0,0,1,0,0); sheet.fillStyle='#fff'; sheet.fillRect(0,0,canvas.width,canvas.height); sheet.globalCompositeOperation='multiply';
    for(const k of order)sheet.drawImage(PL[k].canvas,0,0);
    { const W=canvas.width,H=canvas.height; const id=sheet.getImageData(0,0,W,H); const d=id.data; const cell=1.8*S*dpr; for(let y=0;y<H;y++){ const cy=(y/cell)|0; for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i]>250&&d[i+1]>250&&d[i+2]>250)continue; const cx=(x/cell)|0; let hs=(cx*374761393+cy*668265263)|0; hs=(hs^(hs>>>13))*1274126177|0; hs=(hs^(hs>>>16)); const n=((hs&0xffff)/65535-0.5)*2; const f=1+0.022*n; d[i]=Math.min(255,d[i]*f); d[i+1]=Math.min(255,d[i+1]*f); d[i+2]=Math.min(255,d[i+2]*f); } } sheet.putImageData(id,0,0); }
    ctx.setTransform(1,0,0,1,0,0); ctx.globalCompositeOperation='multiply'; ctx.drawImage(sheet.canvas,0,0); ctx.drawImage(KEY.canvas,0,0); ctx.globalCompositeOperation='source-over';
    // scan softness: separable [1,2,1] blur, passes scaled so the kernel ≈ 0.6 u (≈ 1 ref px of scanner blur)
    { const W=canvas.width,H=canvas.height; const passes=Math.max(1,Math.round(0.6*S*dpr/0.7)); const id=ctx.getImageData(0,0,W,H); const d=id.data; const tmp=new Uint8ClampedArray(d.length); for(let ps=0;ps<passes;ps++){ for(let y=0;y<H;y++){ const row=y*W*4; for(let x=0;x<W;x++){ const i=row+x*4, l=x>0?i-4:i, r=x<W-1?i+4:i; tmp[i]=(d[l]+2*d[i]+d[r]+2)>>2; tmp[i+1]=(d[l+1]+2*d[i+1]+d[r+1]+2)>>2; tmp[i+2]=(d[l+2]+2*d[i+2]+d[r+2]+2)>>2; tmp[i+3]=255; } } const W4=W*4; for(let y=0;y<H;y++){ const u=y>0?-W4:0, dn=y<H-1?W4:0; for(let x=0;x<W;x++){ const i=(y*W+x)*4; d[i]=(tmp[i+u]+2*tmp[i]+tmp[i+dn]+2)>>2; d[i+1]=(tmp[i+u+1]+2*tmp[i+1]+tmp[i+dn+1]+2)>>2; d[i+2]=(tmp[i+u+2]+2*tmp[i+2]+tmp[i+dn+2]+2)>>2; d[i+3]=255; } } } ctx.putImageData(id,0,0); }
    ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    }
  },

  points: [
{u:0.910,v:0.069,d:'KEY', label:'Keyline · 2.3 u #3A3016, waver 0.7 u, blunt ends, on every plate edge', t:'keyline', dir:[-1,-1]},
    {u:0.180,v:0.166,d:'FORM',label:'Cartouche · wheat sheaf on a horizon, rays in thin keyline', t:'cartouche', dir:[1,-1]},
    {u:0.555,v:0.062,d:'TEX', label:'Scallop tile · fish-scale arcs, pitch 22 u on light ochre', t:'tile-scallop', dir:[1,1]},
    {u:0.606,v:0.303,d:'TYPE',label:'Calendar type · serif fillText 27 u, holidays on the red plate', t:'calendar-type', dir:[1,1]},
    {u:0.876,v:0.360,d:'TEX', label:'Spiral tile · slate ribbon spirals, pitch 52 u on pale grey', t:'tile-spiral', dir:[-1,0]},
    {u:0.240,v:0.563,d:'COL', label:'Register offset · sage plate 1.8 u off the keyline, slate knocked out', t:'misregister', dir:[1,0]},
    {u:0.555,v:0.567,d:'TEX', label:'Heart tile · paper hearts, black squares, pitch 24 u', t:'tile-hearts', dir:[-1,1]},
    {u:0.785,v:0.659,d:'FORM',label:'Arc · sawtooth ring, salmon and ring-and-dot bands, squares inside', t:'arc', dir:[-1,0]},
    {u:0.760,v:0.857,d:'TEX', label:'Dot screen · #C99E74 dots r 3.7 u, pitch 11 u on salmon', t:'dot-screen', dir:[1,-1]},
    {u:0.560,v:0.733,d:'GRND',label:'Cream paper · #F1E5CB, ±0.8 % noise (ref L std 1.6), no tooth', t:'paper', dir:[1,1]},
    {u:0.500, v:0.500, d:'', label:'stub · flat-plate pending point authoring', t:'flat-plate', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · print-mottle pending point authoring', t:'print-mottle', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · scan-softness pending point authoring', t:'scan-softness', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · tile-squares pending point authoring', t:'tile-squares', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · tile-scroll pending point authoring', t:'tile-scroll', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · tile-wave pending point authoring', t:'tile-wave', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · tile-zigzag pending point authoring', t:'tile-zigzag', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · tile-checker pending point authoring', t:'tile-checker', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · tile-stars pending point authoring', t:'tile-stars', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · botanical pending point authoring', t:'botanical', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · hop-frieze pending point authoring', t:'hop-frieze', dir:[1,-1]}
  ],

  spec: {
id:'st-04',
    reference:{ file:'ref-04.png', px:[622,900], grammar:'chromolithograph scan: flat tint plates ~1 px out of register against a soft dark olive-brown keyline; tiled ornament border cut by an arc; botanical panels; typeset calendar' },
    units:'design units, 1000 = plate width (ref 622 px ⇒ 1 u = 0.622 ref px; 1 ref px = 1.61 u); plate is 1000 × 1447 u',
    palette:{ paper:'#F1E5CB', keyline:'#3A3016', ochre:'#E3CA5B', ochre_light:'#E4D189', sage:'#C5BB7F', olive:'#ABA65E', slate:'#9DA694', pale_grey:'#D3D0BC', peach:'#EBD5AA', salmon:'#E0B48C', salmon_dot:'#C6845A', cream_yellow:'#E3D6A5', pale_yellow:'#E1D298', tan:'#AD834C', rust:'#B8764B', black:'#050505', month_fill:'#B9BA8C', month_outline:'#7C8654', text_red:'#A8452B' },
    ground:{ colour:'#F1E5CB', tooth:'±1.1 % per-pixel noise before the softness pass (ref paper L std 1.6)', area_ref:'≈0.44 of the sheet at 96 px' },
    techniques:[
      { id:'keyline', short:'KEY', name:'Olive-brown keyline', layer:9, pass:9,
        params:{ colour:'#3A3016', width_u:2.3, width_ref_px:1.4, ref_integrated_width_px:2.7, waver_amp_u:0.7, waver_freq:0.05, width_jitter:0.15, rule_width_u:1.6, tile_keyline_u:[1.7,2.2], cap:'round', join:'round', register_offset:'none — the keyline is the reference plate' },
        implementation:'Every silhouette and rule is a polyline displaced by 3-octave sine noise of arc length (amp 0.7 u) and stroked in 8-point runs whose width varies ±15 %, into one keyline canvas multiplied over the sheet last.' },
      { id:'misregister', short:'COL', name:'Plate register offset + knockout', layer:1, pass:8,
        params:{ offsets_u:{ ochre:[1.6,-1.0], ochre_light:[1.2,-1.4], sage:[-1.2,1.4], olive:[-0.6,1.8], slate:[1.0,1.6], pale_grey:[-1.6,0.6], peach:[1.8,0.8], salmon:[1.8,0.8], yellow:[-0.8,-1.6], cream:[-0.8,-1.6], tan:[1.4,1.2], rust:[-1.4,-0.8], black:[0.6,1.2], green:[1.2,1.0], red:[-1.0,0.8] }, magnitude_ref_px:'≈1.2', composite:'multiply', ink:'measured colour ÷ paper per channel', knockout:'every fill erases its shape (destination-out) from all other plates and the keyline canvas, so plates do not overprint; the offsets then leave paper slivers and overlaps at every edge' },
        implementation:'Each tint plate is an offscreen canvas whose base transform is translated by its offset; a fill knocks its polygon out of the other plates, then all plates are multiplied onto a white sheet, mottled, and multiplied onto the paper.' },
      { id:'flat-plate', short:'FILL', name:'Flat tint plate', layer:1, pass:1,
        params:{ gradient:'none', shading:'none', mottle:'see print-mottle' },
        implementation:'Polygons filled with the plate ink at full opacity; no gradients, no tone — all modelling is left to the keyline.' },
      { id:'print-mottle', short:'TEX', name:'Print mottle on inks', layer:8, pass:8,
        params:{ amp:0.022, cell_u:1.8, cell_ref_px:1.1, on:'ink pixels only', ref_tint_L_std:'3–7' },
        implementation:'ImageData pass over the composited sheet: every non-white pixel is multiplied by 1 ± 0.022·hash(⌊x/cell⌋,⌊y/cell⌋); white (paper) pixels are untouched.' },
      { id:'scan-softness', short:'TEX', name:'Scan softness', layer:10, pass:11,
        params:{ kernel:'[1,2,1]/4 separable', passes:'round(0.6 u · S · dpr / 0.7), min 1 (1 at 700 css px @ dpr 2)', equivalent_ref_px:'≈1 px scanner blur', measured_on_ref:'keyline runs 1–2 px dark but 2.7 px integrated darkness' },
        implementation:'After compositing, one ImageData pass applies a horizontal then vertical 3-tap binomial blur so keylines and dot screens carry the reference scan’s soft edges instead of crisp anti-aliasing.' },
      { id:'tile-scallop', short:'TEX', name:'Scallop (fish-scale) tile', layer:2, pass:2,
        params:{ ground:'#E4D189', pitch_u:22, row_u:11, arc_r_u:11, keyline_u:1.9, dot_r_u:1.5, ref_pitch_px:14, field_u:[310,62,800,118] },
        implementation:'Staggered rows of keyline semicircles (r = pitch/2) over a light-ochre field, a keyline dot at each arc centre, clipped to the band; rust rule beneath.' },
      { id:'tile-spiral', short:'TEX', name:'Spiral tile', layer:2, pass:2,
        params:{ ground:'#D3D0BC', spiral:'#9DA694', pitch_u:52, row_u:44.7, turns:[1.3,1.5], r_max_u:[15,19], r_start_u:3.5, ribbon_w_u:'5.2 × (0.7→1.0)', position_jitter_u:4, keyline_u:1.7, dots:'black r 1.8 between spirals', ref_pitch_px:29, field_u:[800,406,952,600] },
        implementation:'On a hex-staggered 52 u grid each spiral is an Archimedean polyline (r = 3.5 → r_max over 1.3–1.5 turns) offset along its normals into a ribbon, knocked out of the pale plate, filled slate and keylined; a black dot sits in each gap.' },
      { id:'tile-squares', short:'TEX', name:'Square-and-dot tile', layer:2, pass:2,
        params:{ ground:'#E3CA5B', square_u:10.5, pitch_u:22.5, stagger:'half pitch', dot_r_u:1.7, keyline_u:2.2, ref_pitch_px:14, where:'inside the arc, r < 246 u' },
        implementation:'Ochre field with paper squares cut out (destination-out on the plate), each square keylined with a wavered outline, keyline dots on the half-pitch lattice.' },
      { id:'tile-hearts', short:'TEX', name:'Heart tile', layer:2, pass:2,
        params:{ ground:'#E4D189', heart_u:13, pitch_u:24, row_u:26, black_square_u:6, keyline_u:2.2, ref_pitch_px:15, field_u:[310,790,800,850] },
        implementation:'Light-ochre field with paper hearts (two arcs and a point) cut out and keylined; a row of black squares alternates between heart rows.' },
      { id:'tile-scroll', short:'TEX', name:'Running-scroll band', layer:2, pass:2,
        params:{ ground:'#D3D0BC', pitch_u:60, spiral_r_u:17, turns:1.5, ribbon_w_u:5.2, link:'4.6 u slate wave ribbon', keyline_u:1.5, field_u:[310,872,800,940] },
        implementation:'Slate ribbon spirals every 60 u joined by a quadratic wave ribbon, each knocked out of the pale ground and keylined, black dot in the trough.' },
      { id:'tile-wave', short:'TEX', name:'Wave band', layer:2, pass:2,
        params:{ ground:'#D3D0BC', line:'#9DA694', wavelength_u:30, amp_u:4, line_w_u:5, lines:2, keyline_u:1.4, vertical_variant:'7 lines at 21.7 u pitch, wavelength 30 u, amp 4 u, 4 u ribbon, in the right column 626–1160 u', ref_wavelength_px:16 },
        implementation:'Sine polylines stroked as slate ribbons on pale grey, each with a thin keyline along one edge.' },
      { id:'dot-screen', short:'TEX', name:'Salmon dot screen', layer:2, pass:2,
        params:{ ground:'#E0B48C', dot:'#C6845A', dot_r_u:[2.8,3.8], pitch_u:9.5, lattice:'hex, jitter ±1.8 u', coverage:'≈0.45', ref_mean:'#CF9468', ref_pitch_px:5, field_u:[60,1222,952,1302] },
        implementation:'Salmon field, then a darker salmon plate of jittered discs on a 9.5 u hex lattice knocked out of the ground, both under the keyline.' },
      { id:'tile-zigzag', short:'TEX', name:'Rust zigzag rule', layer:2, pass:2,
        params:{ colour:'#B8764B', pitch_u:13, amp_u:5, line_w_u:2.6, rules:'2 × 2.2 u rust rules', where:['310–800 × 852–870','800–952 × 384–402','800–952 × 604–622'] },
        implementation:'A rust polyline zigzag between two rust rules, on the rust plate, over paper.' },
      { id:'tile-checker', short:'TEX', name:'Checker band', layer:2, pass:2,
        params:{ cell_u:12, colours:['#050505','paper'], field_u:[310,944,800,968] },
        implementation:'Alternate 12 u cells filled on the black plate; keyline rules top and bottom.' },
      { id:'tile-stars', short:'TEX', name:'Star-sprig lunette', layer:2, pass:2,
        params:{ ground:'#EBD5AA', pitch_u:30, row_u:24, sprig:'6 keyline rays 3.5→8–10.5 u round a dot', keyline_u:1.6, field:'arched lunette 60–300 × 332–420 u' },
        implementation:'Peach plate clipped to the arch, keyline star sprigs on a staggered lattice with a dot between.' },
      { id:'arc', short:'FORM', name:'Great arc', layer:3, pass:3,
        params:{ centre_u:[992,1160], r_u:300, visible:'upper-left quadrant, clipped to 600–952 × 700–1160', rings:[{r:[286,300],tile:'sawtooth: 120 black triangles on pale'},{r:[272,286],tile:'plain salmon, rust rule at 279'},{r:[246,272],tile:'ring-and-dot on pale grey, pitch 20 u, ring r 6.2'},{r:[0,246],tile:'square-and-dot on ochre'}], keylines_u:[2.2,1.8,1.8,2.2] },
        implementation:'Concentric clip discs drawn over the right column and the calendar bands (each ground knocked out of what lies beneath): inner ochre square tile, ring-and-dot band, a salmon band, a sawtooth ring of black triangles, each ring keylined.' },
      { id:'botanical', short:'FORM', name:'Keyline botanical', layer:4, pass:4,
        params:{ asters:{ petals:[15,17], R_u:[34,64], petal_w:'0.19 R', petal:'two quads base→tip→base, wavered', fill:'#D3D0BC', disc:'0.30 R ochre, 34 keyline stipple dots r 1.2', side_view:'9 petals over 180°, sage calyx' }, goldenrod:{ branches:9, floret_r_u:[3.2,5.0], florets_per_branch:'2–3 per 4 u of branch', crescent:'keyline arc 1.4 u over 2.4 rad', leaves:5 }, leaves:'lanceolate, width sin(πt)^0.8, length 85–160 u, width 13–20 u, keyline midrib 1.6 u', stems:'sage ribbon 4.5–7 u, keylined 2.2 u' },
        implementation:'Each organ is a closed polyline built from cubics/quads, knocked out of the plates beneath, filled on its plate and keylined; asters are 15–17 two-quad petals round an ochre disc; goldenrod plumes are arcs of ochre dots with keyline crescents.' },
      { id:'hop-frieze', short:'FORM', name:'Hop frieze', layer:4, pass:4,
        params:{ cones:{ silhouette:'ovoid, half-width = w/2·sin(π(0.08+0.92t))^0.7', w_u:[46,60], h_u:[72,92], rows:6, bracts_per_row:[2,3], bract:'keyline scallop pointing down', fill:'#E1D298' }, leaves:'3-lobed serrate hop leaf, #AD834C, size 44–70 u, keyline veins', bines:'sage ribbon 4.5–5 u keylined, tendril spiral r 10', repeats:4, pitch_u:222, band:'dot screen 1222–1302 u, wave band 1306–1342 u' },
        implementation:'Hop cones rise above the salmon band as ovoid pale-yellow silhouettes carrying six rows of downward keyline bract scallops; tan lobed leaves and sage bines cross the dot screen.' },
      { id:'cartouche', short:'FORM', name:'Zodiac cartouche (Virgo)', layer:4, pass:4,
        params:{ box_u:[60,62,300,330], rules:'2.4 u outer, 1.4 u inner at +8', sky:'#E3D6A5', horizon_u:258, ground:'#C5BB7F strip with 1.3 u keyline grass hatch every 6 u', rays:'30 keyline rays 1.1 u α0.55 from r 70–90 to 150–190 round (180,236)', sheaf:{ body:'pale-yellow hourglass 104 u wide at base, 24 u at the waist, 168 u at the ears', stalks:13, ears:13, ear_len_u:40, grain:'ochre ovals 9×3.6 u in pairs, awns 20 u', band:'tan ribbon 13 u' }, tab:'cream box 140×46 u at y 14, ochre bosses r 9, ♍ from three arches + looped tail in 3 u keyline' },
        implementation:'Double-ruled square; sky plate, horizon strip, rays from a point behind the sheaf; the sheaf body is one knocked-out polygon with keyline stalks fanning through it, bound by a tan band, each stalk ending in an ear of alternating ochre grains with thin awns.' },
      { id:'calendar-type', short:'TYPE', name:'Typeset calendar', layer:6, pass:6,
        params:{ face:"'Georgia','Times New Roman',serif", month:{ text:'September', size_u:70, weight:700, fill:'#B9BA8C', outline:'#7C8654 1.7 u', baseline_u:236 }, weekdays:{ size_u:27, letters:'S M T W T F S', separators:'1.4 u keyline bars', baseline_u:296 }, numbers:{ size_u:27, colour:'keyline plate', col_pitch_u:56, row_pitch_u:43, first_row_u:352, red:'#A8452B on 7 and 22' }, list:{ size_u:25, colour:'#A8452B', lines:['7 - labor day','22 - equinox'], baselines_u:[602,638] }, ref_cap_height_px:11 },
        implementation:'canvas fillText/strokeText on the green, dark-green, red and keyline plates (each with its own register offset); the month is a light green fill with a dark green outline like the reference’s decorated serif.' },
      { id:'paper', short:'GRND', name:'Cream paper', layer:0, pass:0,
        params:{ colour:'#F1E5CB', lab:'L 91.3 a −0.1 b 14', noise:'±1.1 % per pixel, hashed, before the softness pass', share:'≈0.40 at 96 px (ref 0.44)' },
        implementation:'Flat fill plus a hashed per-pixel brightness noise; nothing else is drawn on the paper except ink.' }
    ],
    pass_order:['paper + paper noise','tile fields (clipped to rules) on their plates','arc rings over the column and bands','botanicals: left panel, top-right cluster, bottom-left bine, frieze','cartouche + symbol tab','calendar text','composite plates with offsets in multiply onto white','print mottle on ink pixels','multiply sheet onto paper','keyline plate in multiply','scan-softness blur'],
    notes:[ 'Colours are per-region k-means centres on ref-04.png (paper is the modal pixel 241,229,203); keyline width from 266 line crossings (2.7 px integrated darkness incl. scan blur ⇒ ≈1.4–1.7 px ink).', 'Reference shares at 96 px: paper 0.44, black ≈0.024, light ochres ≈0.10; mean L 190.', 'Seed 4404; layout 1000 × 1447 u: left column 60–300, calendar 310–790, right column 800–952, frieze 1170–1342, frame 48–962 × 30–1372.' ]
  }
});
