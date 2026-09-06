/* ST-03 · Thermal die-cut chips — imported from technique-studies/st-03-thermal-chips.html at ck-e12.
   Reference-study plate; every technique block is provable from a point on the
   plate (coverage rule). Renders in canvas2d, 736×917 design pixels.
   compare{} off — public build cannot ship the reference; the rebuild carries the argument. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'st-03-thermal-chips',
  index: 'ST-03',
  order: 3030,
  title: 'Thermal die-cut chips',
  section: 'studies',
  style: 'technique-study',
  status: 'canonical',
  lane: 'canvas2d',
  governed_by: ['composing-computational-material-systems'],
  tags: ['Reference study'],

  source: {
    kind: 'reference-study',
    title: 'Reference 03 · outlined die-cut chips with oil-slick gradient fills',
    note: 'Imported at ck-e12 from technique-studies/. compare{} off — public build cannot ship the reference; the rebuild carries the argument.'
  },

  frame: { designWidth: 736, aspect: '736/917', previewHeight: 917 },
  thumb: 'thumb.png',

  body: [
'Die-cut pieces on warm grey stock. Each silhouette carries a hairline plum outline that misregisters from its fill: the pale backing and the colour sit a pixel down-right of the line, so a white sliver shows inside top edges and outside bottom ones. Two pieces are flat orange-and-black with cut windows and dash text.',
    'Interiors are heat maps: one dominant octave of domain-warped Perlin, read through a pale-biased ramp of pink, white, blue, yellow and cyan, with one liquid contour hardened per chip. Liquid layers are separate blobs with their own outline and ramp. A monochrome print grain at reference-pixel pitch closes everything, paper included.'
  ],

  method: 'Die-cut rings · misregistered keyline · warped thermal ramp · print grain',

  plate: {
    fig: '3.3', series: 'STUDIES', sheet: 3, of: 8,
    designWidth: 736, designHeight: 917,
    render: function (canvas, w, h, dpr) {
    const C={paper:'#DED9D5',back:'#F3F0EC',key:'#2A2634',orange:'#F65C1E',rim:'#FFA46E',blue:'#0B85C5',black:'#06070A',pink:'#F6879E',pale:'#EBB2BB',white:'#DAD5D0',cool:'#CDD6CF',blue2:'#1475BE',yellow:'#F0C550',lemon:'#E4C022',cyan:'#7ED6E5',mint:'#39B66B',teal:'#2AAAD0',lilac:'#9C86C7',hot:'#F8641F'};
    const S=w/1000, U=1000, V=h/S;
    let seed=3303; const rnd=()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const rr=(a,b)=>a+(b-a)*rnd();
    const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    const rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
    const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
    const clamp=(v,a,b)=>v<a?a:v>b?b:v;
    const sstep=t=>{ t=clamp(t,0,1); return t*t*(3-2*t); };
    // ---------- Perlin 2-D ----------
    const perm=new Uint8Array(512); { const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(rnd()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255]; }
    const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    const fade=t=>t*t*t*(t*(t*6-15)+10);
    const perlin=(x,y)=>{ const X=Math.floor(x), Y=Math.floor(y); const xf=x-X, yf=y-Y; const xi=X&255, yi=Y&255; const g00=G[perm[perm[xi]+yi]&7], g10=G[perm[perm[xi+1]+yi]&7], g01=G[perm[perm[xi]+yi+1]&7], g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf, n10=g10[0]*(xf-1)+g10[1]*yf, n01=g01[0]*xf+g01[1]*(yf-1), n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf), v=fade(yf); return (n00+(n10-n00)*u)+((n01+(n11-n01)*u)-(n00+(n10-n00)*u))*v; };
    const fbm=(x,y,o,g)=>{ let s=0,a=1,n=0; g=g||0.45; for(let i=0;i<o;i++){ s+=a*perlin(x,y); n+=a; a*=g; const nx=x*2.03+17.13, ny=y*2.03+9.71; x=nx; y=ny; } return s/n; }; // ~[-0.7,0.7]
    const ridged=(x,y,o)=>{ let s=0,a=1,n=0; for(let i=0;i<o;i++){ const v=Math.min(1,Math.abs(perlin(x,y))*2.6); s+=a*(1-Math.sqrt(v)); n+=a; a*=0.6; const nx=x*2.1+3.3, ny=y*2.1+7.7; x=nx; y=ny; } return s/n; };
    // ---------- canvases ----------
    const off=(cw,ch)=>{ const c=document.createElement('canvas'); c.width=cw; c.height=ch; return c; };
    const layer=()=>{ const c=off(canvas.width,canvas.height); const x=c.getContext('2d'); x.setTransform(dpr*S,0,0,dpr*S,0,0); x.lineCap='round'; x.lineJoin='round'; return x; };
    const ink=layer();
    // ---------- geometry ----------
    const area=P=>{ let a=0; for(let i=0;i<P.length;i++){ const p=P[i],q=P[(i+1)%P.length]; a+=p[0]*q[1]-q[0]*p[1]; } return a/2; };
    const normals=P=>{ const n=P.length, N=[]; for(let i=0;i<n;i++){ const a=P[(i-1+n)%n], b=P[(i+1)%n]; let dx=b[0]-a[0],dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; N.push([dy/l,-dx/l]); } return N; };
    // offset a closed ring by d toward its own exterior (positive d grows an outer ring, shrinks a hole)
    const offsetRing=(P,d,tx,ty)=>{ const N=normals(P); const sg=area(P)>0?-1:1; const o=[]; for(let i=0;i<P.length;i++)o.push([P[i][0]+N[i][0]*d*sg+(tx||0),P[i][1]+N[i][1]*d*sg+(ty||0)]); return o; };
    const bbox=R=>{ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const P of R)for(const p of P){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; } return [x0,y0,x1,y1]; };
    const pathRings=(x,R)=>{ x.beginPath(); for(const P of R){ x.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++)x.lineTo(P[i][0],P[i][1]); x.closePath(); } };
    // vertices [[x,y,r],...] -> ring polyline with arcs at corners
    const rounded=(Vs,step)=>{ step=step||3; const n=Vs.length, out=[]; for(let i=0;i<n;i++){ const A=Vs[(i-1+n)%n], P=Vs[i], B=Vs[(i+1)%n]; const r=P[2]||0; if(r<=0){ out.push([P[0],P[1]]); continue; } let d1=[P[0]-A[0],P[1]-A[1]], d2=[B[0]-P[0],B[1]-P[1]]; const l1=Math.hypot(d1[0],d1[1]), l2=Math.hypot(d2[0],d2[1]); d1=[d1[0]/l1,d1[1]/l1]; d2=[d2[0]/l2,d2[1]/l2]; const cosT=-(d1[0]*d2[0]+d1[1]*d2[1]); const th=Math.acos(clamp(cosT,-1,1)); if(th>Math.PI-0.02){ out.push([P[0],P[1]]); continue; } let t=r/Math.tan(th/2); const tm=Math.min(l1,l2)*0.49; let rr_=r; if(t>tm){ t=tm; rr_=t*Math.tan(th/2); } const T1=[P[0]-d1[0]*t,P[1]-d1[1]*t], T2=[P[0]+d2[0]*t,P[1]+d2[1]*t]; let bis=[d2[0]-d1[0],d2[1]-d1[1]]; const bl=Math.hypot(bis[0],bis[1]); bis=[bis[0]/bl,bis[1]/bl]; const cd=rr_/Math.sin(th/2); const Cc=[P[0]+bis[0]*cd,P[1]+bis[1]*cd]; let a0=Math.atan2(T1[1]-Cc[1],T1[0]-Cc[0]), a1=Math.atan2(T2[1]-Cc[1],T2[0]-Cc[0]); let da=a1-a0; while(da>Math.PI)da-=2*Math.PI; while(da<-Math.PI)da+=2*Math.PI; const k=Math.max(2,Math.ceil(Math.abs(da)*rr_/step)); for(let j=0;j<=k;j++){ const a=a0+da*j/k; out.push([Cc[0]+Math.cos(a)*rr_,Cc[1]+Math.sin(a)*rr_]); } } return out; };
    const arcV=(cx,cy,r,a0,a1,n,rad)=>{ const o=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,rad||0]); } return o; };
    const circle=(cx,cy,r,n)=>arcV(cx,cy,r,0,Math.PI*2*(1-1/(n||64)),(n||64)-1,0).map(p=>[p[0],p[1]]);
    const blob=(cx,cy,rx,ry,rot,amp)=>{ const k=[rr(0,6.28),rr(0,6.28),rr(0,6.28)], a=[rr(0.6,1)*amp,rr(0.3,0.7)*amp,rr(0.15,0.4)*amp]; const o=[]; const cs=Math.cos(rot), sn=Math.sin(rot); for(let i=0;i<72;i++){ const t=i/72*Math.PI*2; const m=1+a[0]*Math.sin(2*t+k[0])+a[1]*Math.sin(3*t+k[1])+a[2]*Math.sin(4*t+k[2]); const px=Math.cos(t)*rx*m, py=Math.sin(t)*ry*m; o.push([cx+px*cs-py*sn,cy+px*sn+py*cs]); } return o; };
    // distance from point to ring (segments)
    const distRing=(P,x,y)=>{ let best=1e9; for(let i=0,j=P.length-1;i<P.length;j=i++){ const ax=P[j][0],ay=P[j][1],bx=P[i][0],by=P[i][1]; const dx=bx-ax,dy=by-ay; const L2=dx*dx+dy*dy||1; let t=((x-ax)*dx+(y-ay)*dy)/L2; t=t<0?0:t>1?1:t; const ex=ax+dx*t-x, ey=ay+dy*t-y; const d=ex*ex+ey*ey; if(d<best)best=d; } return Math.sqrt(best); };
    // ---------- misregistration constants (ref: 1 px = 1.385 u) ----------
    const OFF=1.4, EXP=1.4, KEYW=2.1;
    const waverN=()=>{ const p=[rnd()*7,rnd()*7]; return t=>(Math.sin(t*0.05+p[0])+0.5*Math.sin(t*0.11+p[1]))*0.25/1.5; };
    const strokeRings=(x,R,col,wd,al)=>{ x.save(); x.strokeStyle=col; x.globalAlpha=al===undefined?0.92:al; x.lineWidth=wd; for(const P of R){ const nz=waverN(); const N=normals(P); x.beginPath(); let s=0; for(let i=0;i<=P.length;i++){ const k=i%P.length; if(i>0)s+=Math.hypot(P[k][0]-P[(i-1)%P.length][0],P[k][1]-P[(i-1)%P.length][1]); const o=nz(s); const px=P[k][0]+N[k][0]*o, py=P[k][1]+N[k][1]*o; if(i===0)x.moveTo(px,py); else x.lineTo(px,py); } x.closePath(); x.stroke(); } x.restore(); };
    // ---------- ramps ----------
    const lut=stops=>{ const L=new Array(256); for(let i=0;i<256;i++){ const t=i/255; let c=hex(stops[stops.length-1][1]); for(let k=1;k<stops.length;k++){ if(t<=stops[k][0]){ const u=(t-stops[k-1][0])/((stops[k][0]-stops[k-1][0])||1e-6); c=mix(hex(stops[k-1][1]),hex(stops[k][1]),clamp(u,0,1)); break; } } L[i]=c; } return L; };
    // ---------- thermal field bitmap ----------
    // opts: {freq, warp, oct, contrast, lin:[dx,dy,amt], edge:{ring,amt,scale}, terr:[n,k], turb:{amt,freq,along:[dx,dy]}, ox,oy, bias}
    const thermal=(R,stops,o)=>{ const [x0,y0,x1,y1]=bbox(R); const pitch=o.pitch||1.6; const cw=Math.ceil((x1-x0)/pitch)+2, ch=Math.ceil((y1-y0)/pitch)+2; const cv=off(cw,ch); const cx=cv.getContext('2d'); const id=cx.createImageData(cw,ch); const d=id.data; const L=lut(stops); const fq=o.freq, wp=o.warp, ct=o.contrast, ox=o.ox||0, oy=o.oy||0; const lin=o.lin, edge=o.edge, terr=o.terr, turb=o.turb, bias=o.bias||0; const W=x1-x0, H=y1-y0; const L2=turb?lut(turb.stops):null;
      for(let j=0;j<ch;j++){ for(let i=0;i<cw;i++){ let tw=0,tc=null; const px=x0+i*pitch, py=y0+j*pitch; const nx=(px+ox)*fq, ny=(py+oy)*fq; const qx=fbm(nx,ny,2,0.4), qy=fbm(nx+5.2,ny+1.3,2,0.4); let f=fbm(nx+wp*qx,ny+wp*qy,o.oct||2,o.gain||0.3); f=f*ct+0.5+bias; const u=(px-x0)/W, v=(py-y0)/H; if(lin)f+=lin[2]*((u-0.5)*lin[0]+(v-0.5)*lin[1]); if(edge){ const dd=distRing(edge.ring,px,py); f+=edge.amt*Math.exp(-dd/edge.scale); } if(o.sharp){ const g=f-o.sharp[0]; f=o.sharp[0]+g*(1+o.sharp[1]*Math.exp(-g*g/0.012)); } if(turb){ const wgt=turb.amt*sstep((u-0.5)*turb.along[0]+(v-0.5)*turb.along[1]+0.5+(turb.shift||0)); if(wgt>0.002){ const tx=(px+ox)*turb.freq, ty=(py+oy)*turb.freq; const wx=fbm(tx+3.1,ty+7.7,2), wy=fbm(tx+9.4,ty+2.2,2); const t=fbm(tx+1.6*wx,ty+1.6*wy,turb.oct||3)*turb.contrast+0.5; tw=wgt; tc=L2[clamp(t*255,0,255)|0]; } } let dk=1; if(terr){ const q=f*terr[0]; const fl=Math.floor(q); let fr=q-fl; if(o.cl){ const e=(fr-0.5)/0.07; dk=1-o.cl*Math.exp(-e*e); } fr=clamp((fr-0.5)*terr[1]+0.5,0,1); fr=fr*fr*(3-2*fr); f=(fl+fr)/terr[0]; } let c=L[clamp(f*255,0,255)|0]; if(tc)c=mix(c,tc,tw); const k=(j*cw+i)*4; d[k]=c[0]*dk; d[k+1]=c[1]*dk; d[k+2]=c[2]*dk; d[k+3]=255; } }
      cx.putImageData(id,0,0); return {cv,x0,y0,pitch,cw,ch}; };
    const drawThermal=(x,T)=>{ x.save(); x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high'; x.drawImage(T.cv,T.x0-T.pitch*0.5,T.y0-T.pitch*0.5,T.cw*T.pitch,T.ch*T.pitch); x.restore(); };
    // ---------- chip machinery ----------
    // rings: array of closed polylines (outer + holes). fill: fn(x) draws the interior (already clipped). extra: fn(x) after fill within clip.
    const chip=(x,rings,fillFn,afterFn,opts)=>{ opts=opts||{}; const exp=opts.exp===undefined?EXP:opts.exp; const back=offsetRing; const B=rings.map(P=>back(P,exp,OFF,OFF)); const F=rings.map(P=>back(P,-exp,OFF,OFF));
      pathRings(x,B); x.fillStyle=opts.back||C.back; x.fill('evenodd');
      x.save(); pathRings(x,F); x.clip('evenodd'); fillFn(x,F); if(afterFn)afterFn(x,F); x.restore();
      if(opts.key!==false)strokeRings(x,rings,opts.keyCol||C.key,opts.keyW||KEYW,opts.keyA); };
    const flat=col=>(x,F)=>{ pathRings(x,F); x.fillStyle=col; x.fill('evenodd'); };
    const therm=(stops,o)=>(x,F)=>{ const T=thermal(F,stops,o); drawThermal(x,T); };
    // liquid layer: blob ring inside a clipped chip; own ramp, own slipped outline
    const liquid=(x,ring,stops,o,keyA)=>{ const F=offsetRing(ring,-1.0,OFF,OFF); x.save(); pathRings(x,[F]); x.clip(); const T=thermal([F],stops,o); drawThermal(x,T); x.restore(); strokeRings(x,[ring],C.key,1.7,keyA===undefined?0.8:keyA); };
    // cut window: pale rim ring, black fill slipped
    const cut=(x,ring,fillFn,rimCol)=>{ const B=offsetRing(ring,EXP,OFF,OFF), F=offsetRing(ring,-EXP,OFF,OFF); pathRings(x,[B]); x.fillStyle=rimCol||C.rim; x.fill(); x.save(); pathRings(x,[F]); x.clip(); fillFn(x,[F]); x.restore(); };
    const dashRows=(x,rx,y0,rows,col)=>{ x.fillStyle=col; for(let r=0;r<rows;r++){ const n=3+((rnd()*4)|0); let cx=rx; const y=y0+r*11+rr(-1,1); for(let k=0;k<n;k++){ const wd=rr(7,26); cx-=wd; x.fillRect(cx,y,wd,6); cx-=4; } } };
    // ---------- paper ----------
    const ctx=canvas.getContext('2d'); ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    ink.fillStyle=C.paper; ink.fillRect(0,0,U,V);
    { const g=ink.createRadialGradient(U/2,V/2,Math.min(U,V)*0.55,U/2,V/2,Math.hypot(U,V)*0.62); g.addColorStop(0,'rgba(60,50,40,0)'); g.addColorStop(1,'rgba(60,50,40,0.03)'); ink.fillStyle=g; ink.fillRect(0,0,U,V); }
    const PI=Math.PI; const SC=0.955; ink.save(); ink.translate(500,V/2); ink.scale(SC,SC); ink.translate(-500,-V/2);
    // ---------- A · arch with a notch (thermal, blue liquid band) ----------
    { // notch on the bottom edge, right of centre
      const Vs=[[45,360,14],[45,150,120],[315,150,120],[315,360,14],[282,360,3],[282,346,4],[242,346,4],[242,360,3]];
      const ring=rounded(Vs);
      chip(ink,[ring],therm([[0,C.blue],[0.3,C.blue],[0.42,C.teal],[0.52,C.cool],[0.7,C.white],[0.84,C.pale],[1,C.pink]],{freq:1/820,warp:1.5,contrast:1.8,lin:[-0.45,-0.9,0.9],sharp:[0.4,3],ox:120,oy:40,bias:0.05}),
        (x,F)=>{ // orange liquid band hugging the bottom-right edge
          const b=blob(306,336,160,58,-0.55,0.16); liquid(x,b,[[0,C.lemon],[0.4,C.yellow],[0.7,'#E8E0C4'],[1,C.white]],{freq:1/420,warp:0.8,contrast:1.6,lin:[0.9,0.5,0.7],ox:900,oy:300});
          // small blue liquid drop at the top-left
        });
    }
    // ---------- B · stepped card (flat orange, cut windows, dash rows) ----------
    { const Vs=[[350,50,16],[560,50,16],[560,110,10],[626,110,16],[626,400,16],[350,400,16]]; const ring=rounded(Vs);
      chip(ink,[ring],flat(C.orange),(x,F)=>{
        // two slots
        for(const sx of [380,420]) cut(x,rounded([[sx,80,7],[sx+26,80,7],[sx+26,152,7],[sx,152,7]]),flat(C.black));
        // large T-slot window: blue → black thermal
        const win=rounded([[420,228,10],[600,228,10],[600,372,10],[420,372,10]]);
        cut(x,win,(xx,F2)=>{ const T=thermal(F2,[[0,C.black],[0.35,C.black],[0.6,'#0A3E6E'],[0.82,C.blue],[1,C.teal]],{freq:1/320,warp:0.8,contrast:1.0,lin:[0.15,-1.6,0.9],ox:2000,oy:100,bias:-0.25}); drawThermal(xx,T); });
        // orange tongue inside the window (vertical bar from the top edge, T shape)
        pathRings(x,[rounded([[506,228,0],[528,228,0],[528,318,6],[506,318,6]])]); x.fillStyle=C.orange; x.fill();
        pathRings(x,[rounded([[448,306,5],[572,306,5],[572,318,5],[448,318,5]])]); x.fillStyle=C.orange; x.fill();
        // mint hairline rule and two white dots
        x.strokeStyle=C.mint; x.lineWidth=1.5; x.globalAlpha=0.95; x.beginPath(); x.moveTo(372,186); x.lineTo(606,186); x.stroke(); x.globalAlpha=1;
        x.fillStyle=C.white; for(const dy of [300,330]){ x.beginPath(); x.arc(372,dy,1.6,0,7); x.fill(); }
        // tiny black square at the step
        pathRings(x,[rounded([[584,124,2],[598,124,2],[598,138,2],[584,138,2]])]); x.fillStyle=C.black; x.fill();
      });
    }
    // ---------- C · keyhole tab (thermal yellow/white/cyan, white liquid) ----------
    { const outer=rounded([[670,50,30],[955,50,30],[955,340,30],[670,340,30]]);
      // keyhole: circle r34 at (812,150) + slot 26 wide to y 260
      const kc=[812,150], kr=34, sw=13, a=Math.asin(sw/kr); const hole=[]; const arc=arcV(kc[0],kc[1],kr,PI/2+a,PI/2-a+2*PI,40); for(const p of arc)hole.push([p[0],p[1],0]); hole.push([kc[0]+sw,260,6],[kc[0]-sw,260,6]); const hr=rounded(hole);
      chip(ink,[outer,hr],therm([[0,C.lemon],[0.3,C.lemon],[0.42,'#E4DEC0'],[0.55,C.white],[0.72,C.cool],[0.86,C.cyan],[1,C.blue]],{freq:1/760,warp:1.0,contrast:1.7,lin:[1.0,0.4,0.9],edge:{ring:outer,amt:-0.14,scale:60},sharp:[0.36,3],ox:3000,oy:700,bias:-0.02}),
        (x,F)=>{ const b=blob(770,250,80,55,0.35,0.18); liquid(x,b,[[0,C.white],[0.55,C.cool],[1,'#E6D8DB']],{freq:1/400,warp:0.6,contrast:0.8,ox:4000,oy:200},0.75);
          // small black square fitting at the top-left corner
          pathRings(x,[rounded([[688,66,2],[706,66,2],[706,90,2],[688,90,2]])]); x.fillStyle=C.black; x.fill(); x.fillStyle=C.orange; x.beginPath(); x.arc(697,100,2,0,7); x.fill(); });
    }
    // ---------- D · lens (thermal blue/pink, white liquid layer) ----------
    { const top=[180,400], bot=[180,780], hw=125; const L=380, sag=hw; const Rr=(sag*sag+(L/2)*(L/2))/(2*sag); const cxo=Rr-sag; const my=590; const ang=Math.asin((L/2)/Rr);
      const Vs=[]; Vs.push([top[0],top[1],14]); // right arc: centre (180-cxo, 590)
      { const c=[180-cxo,my]; for(let i=1;i<40;i++){ const t=-ang+2*ang*i/40; Vs.push([c[0]+Math.cos(t)*Rr,c[1]+Math.sin(t)*Rr,0]); } }
      Vs.push([bot[0],bot[1],14]);
      { const c=[180+cxo,my]; for(let i=1;i<40;i++){ const t=PI-ang+2*ang*i/40; Vs.push([c[0]+Math.cos(t)*Rr,c[1]+Math.sin(t)*Rr,0]); } }
      const ring=rounded(Vs);
      chip(ink,[ring],therm([[0,C.blue],[0.34,C.blue],[0.46,'#5F9CBE'],[0.58,'#A9BFC8'],[0.76,C.white],[0.88,C.pale],[1,C.pink]],{freq:1/800,warp:1.0,contrast:1.7,lin:[0.4,1.0,0.9],sharp:[0.44,2.5],ox:5000,oy:1200,bias:-0.1}),
        (x,F)=>{ const b=blob(180,560,62,110,0.15,0.16); liquid(x,b,[[0,C.white],[0.5,'#E2DCDA'],[1,C.cool]],{freq:1/400,warp:0.6,contrast:0.7,ox:6000,oy:0},0.8);
          const b2=blob(215,700,40,26,-0.7,0.22); liquid(x,b2,[[0,C.lilac],[0.6,C.pale],[1,C.pink]],{freq:1/240,warp:0.8,contrast:1.2,ox:7000,oy:500},0.7); });
    }
    // ---------- E · pac-dial (thermal orange/pink/white following the rim) ----------
    { const cc=[495,600], R=145, r=36, a0=0.5, a1=2*PI-0.34; const Vs=[]; const outerArc=arcV(cc[0],cc[1],R,a0,a1,80,0); Vs.push([outerArc[0][0],outerArc[0][1],12]); for(let i=1;i<outerArc.length-1;i++)Vs.push(outerArc[i]); Vs.push([outerArc[outerArc.length-1][0],outerArc[outerArc.length-1][1],12]);
      const innerArc=arcV(cc[0],cc[1],r,a1,a0,16,0); Vs.push([innerArc[0][0],innerArc[0][1],8]); for(let i=1;i<innerArc.length-1;i++)Vs.push(innerArc[i]); Vs.push([innerArc[innerArc.length-1][0],innerArc[innerArc.length-1][1],8]);
      const ring=rounded(Vs);
      chip(ink,[ring],therm([[0,'#8FA6B8'],[0.16,C.cool],[0.34,C.white],[0.5,C.white],[0.66,C.pale],[0.84,C.pink],[1,C.pink]],{freq:1/720,warp:1.0,contrast:1.7,edge:{ring,amt:0.32,scale:70},lin:[0.3,-0.5,0.5],sharp:[0.62,2.5],ox:8000,oy:300,bias:-0.04}),
        (x,F)=>{ const b=blob(455,650,58,44,0.9,0.2); liquid(x,b,[[0,C.blue],[0.45,C.teal],[0.8,C.cyan],[1,C.white]],{freq:1/300,warp:0.8,contrast:1.3,lin:[0.8,0.2,0.4],ox:9000,oy:900},0.75);
          // pinhole
          x.fillStyle=C.black; x.beginPath(); x.arc(cc[0]+Math.cos(2.4)*95,cc[1]+Math.sin(2.4)*95,3.4,0,7); x.fill(); });
    }
    // ---------- F · folder tab (flat blue, hairline ring, pink needle, disc, dot) ----------
    { const Vs=[[670,432,10],[670,400,10],[790,400,10],[812,432,6],[955,432,10],[955,760,16],[670,760,16]]; const ring=rounded(Vs);
      chip(ink,[ring],flat(C.blue2),(x,F)=>{
        // hairline arc and rule
        x.strokeStyle='rgba(20,30,50,0.55)'; x.lineWidth=1.1; x.beginPath(); x.arc(812,600,96,0.2,2*PI-0.9); x.stroke(); x.beginPath(); x.moveTo(690,600); x.lineTo(935,600); x.stroke();
        // pink needle: tapered pill with round ends, diagonal
        const P0=[742,700], P1=[905,505]; const dx=P1[0]-P0[0], dy=P1[1]-P0[1], Ln=Math.hypot(dx,dy); const ux=dx/Ln, uy=dy/Ln, nx=-uy, ny=ux; const w0=12, w1=4; const pts=[]; for(let i=0;i<=20;i++){ const t=i/20; const wv=w0+(w1-w0)*t; pts.push([P0[0]+ux*Ln*t+nx*wv,P0[1]+uy*Ln*t+ny*wv]); } for(let i=0;i<=10;i++){ const a=Math.atan2(ny,nx)-PI*i/10; pts.push([P1[0]+Math.cos(a)*w1,P1[1]+Math.sin(a)*w1]); } for(let i=20;i>=0;i--){ const t=i/20; const wv=w0+(w1-w0)*t; pts.push([P0[0]+ux*Ln*t-nx*wv,P0[1]+uy*Ln*t-ny*wv]); } for(let i=0;i<=10;i++){ const a=Math.atan2(-ny,-nx)-PI*i/10; pts.push([P0[0]+Math.cos(a)*w0,P0[1]+Math.sin(a)*w0]); }
        pathRings(x,[offsetRing(pts,0.8,OFF,OFF)]); x.fillStyle=C.back; x.fill(); pathRings(x,[pts]); x.fillStyle=C.pink; x.fill();
        // orange disc with slipped pale backing, black dot
        const dc=circle(720,470,17,48); pathRings(x,[offsetRing(dc,1.2,OFF,OFF)]); x.fillStyle=C.rim; x.fill(); pathRings(x,[dc]); x.fillStyle=C.hot; x.fill();
        x.fillStyle=C.black; x.beginPath(); x.arc(812,600,5,0,7); x.fill();
      });
    }
    // ---------- G · double-notched capsule (thermal pink/orange, marbling at the right) ----------
    { const y0=800,y1=930, r=65; const Vs=[]; // left semicircle, top edge with two notches, right semicircle
      const la=arcV(45+r,(y0+y1)/2,r,PI/2,3*PI/2,24,0); for(const p of la)Vs.push(p);
      const notch=(nx)=>{ Vs.push([nx-22,y0,0]); const na=arcV(nx,y0,22,PI,0,12,0); for(let i=1;i<na.length-1;i++)Vs.push(na[i]); Vs.push([nx+22,y0,0]); };
      notch(200); notch(420);
      const ra=arcV(600-r,(y0+y1)/2,r,-PI/2,PI/2,24,0); for(const p of ra)Vs.push(p);
      const ring=rounded(Vs);
      chip(ink,[ring],therm([[0,C.pink],[0.25,C.pink],[0.42,C.pale],[0.6,C.white],[0.78,C.cool],[0.9,C.cyan],[1,C.teal]],{freq:1/800,warp:1.0,contrast:1.6,lin:[1.0,0.2,0.9],sharp:[0.5,2.5],bias:-0.06,turb:{amt:0.65,freq:1/170,oct:2,contrast:2.0,along:[3.0,0.3],shift:-0.55,stops:[[0,C.blue],[0.3,C.teal],[0.45,'#8FB4C4'],[0.58,C.cool],[0.72,C.white],[0.86,'#E4DEC0'],[1,C.yellow]]},ox:11000,oy:400}),
        (x,F)=>{ const b=blob(150,865,70,36,0.1,0.18); liquid(x,b,[[0,C.white],[0.6,C.cool],[1,C.pale]],{freq:1/300,warp:0.6,contrast:0.8,ox:12000,oy:0},0.7); });
    }
    // ---------- H · device slab (orange, black panel, orange lines, dash rows, dots) ----------
    { const ring=rounded([[640,800,18],[955,800,18],[955,1200,18],[640,1200,18]]);
      chip(ink,[ring],flat(C.orange),(x,F)=>{
        const panel=rounded([[672,846,12],[862,846,12],[862,1158,12],[672,1158,12]]);
        cut(x,panel,flat(C.black),C.rim);
        x.strokeStyle=C.orange; x.lineWidth=1.6; x.lineCap='round'; x.lineJoin='round';
        // inner frame line
        pathRings(x,[rounded([[686,862,8],[848,862,8],[848,1144,8],[686,1144,8]])]); x.stroke();
        // vertical bar (a slot) and a C-shaped cut line
        pathRings(x,[rounded([[826,852,3],[840,852,3],[840,1000,3],[826,1000,3]])]); x.stroke();
        x.beginPath(); x.moveTo(800,1060); x.lineTo(700,1060); x.lineTo(700,1140); x.lineTo(800,1140); x.stroke();
        x.beginPath(); x.moveTo(720,1100); x.lineTo(790,1100); x.stroke();
        // small orange square window and a filled tab
        pathRings(x,[rounded([[826,1012,3],[840,1012,3],[840,1030,3],[826,1030,3]])]); x.fillStyle=C.orange; x.fill();
        // dash rows (micro text), right-aligned inside the panel
        dashRows(x,816,858,5,C.orange);
        // fittings on the orange strip: two black dots, a small black square, a mint hairline
        x.fillStyle=C.black; for(const dy of [1150,1170]){ x.beginPath(); x.arc(918,dy,3,0,7); x.fill(); }
        cut(x,rounded([[905,860,2],[930,860,2],[930,880,2],[905,880,2]]),flat(C.black),C.rim);
        x.strokeStyle=C.mint; x.lineWidth=1.4; x.beginPath(); x.moveTo(896,910); x.lineTo(896,1120); x.stroke();
        x.fillStyle=C.white; x.beginPath(); x.arc(918,990,1.8,0,7); x.fill(); x.beginPath(); x.arc(918,1010,1.8,0,7); x.fill();
      });
    }
    // ---------- I · quarter wedge (thermal blue/cyan/mint, terraced) ----------
    { const Vs=[[45,1200,14],[45,972,14]]; const qa=arcV(45,1200,228,-PI/2,0,40,0); for(let i=1;i<qa.length-1;i++)Vs.push(qa[i]); Vs.push([273,1200,14]);
      const ring=rounded(Vs);
      chip(ink,[ring],therm([[0,C.blue],[0.42,C.blue],[0.56,'#4B94B7'],[0.68,C.cyan],[0.82,'#C6E2D8'],[1,'#A9E0C0']],{freq:1/700,warp:1.0,contrast:1.6,lin:[0.8,-0.6,0.8],edge:{ring,amt:-0.12,scale:50},sharp:[0.5,2.5],ox:13000,oy:800,bias:-0.04}),
        (x,F)=>{ const b=blob(95,1140,52,38,0.5,0.2); liquid(x,b,[[0,C.white],[0.5,C.cool],[1,'#C6E2D8']],{freq:1/260,warp:0.8,contrast:1.0,ox:14000,oy:300},0.75); });
    }
    // ---------- J · orange disc with a pinhole ----------
    { const ring=circle(362,1040,50,72); chip(ink,[ring],flat(C.hot),(x,F)=>{ x.fillStyle=C.black; x.beginPath(); x.arc(362,1040,4,0,7); x.fill(); x.strokeStyle='rgba(255,220,190,0.7)'; x.lineWidth=1; x.beginPath(); x.arc(362,1040,30,0,7); x.stroke(); }); }
    // ---------- K · pill with a corner notch (thermal pink/orange/lemon) ----------
    { const ring=rounded([[310,1112,32],[600,1112,32],[600,1150,4],[578,1150,4],[578,1176,32],[310,1176,32]]);
      chip(ink,[ring],therm([[0,C.lemon],[0.25,'#E4DEC0'],[0.45,C.white],[0.62,C.cool],[0.78,C.cyan],[1,C.blue]],{freq:1/520,warp:1.0,contrast:1.7,lin:[1.2,0.2,0.9],sharp:[0.5,2.5],ox:15000,oy:900,bias:-0.04}),
        (x,F)=>{ const b=blob(400,1146,46,18,0.05,0.2); liquid(x,b,[[0,C.pink],[0.5,C.pale],[1,C.white]],{freq:1/240,warp:0.8,contrast:1.2,ox:16000,oy:400},0.7); });
    }
    ink.restore();
    // ---------- print grain over everything ----------
    { const cv=ink.canvas; const W=cv.width,Hh=cv.height; const id=ink.getImageData(0,0,W,Hh); const d=id.data; const cell=1.385*S*dpr; const inv=1/cell; const amp=0.038;
      const hsh=(cx,cy)=>{ let h=(cx*374761393+cy*668265263)|0; h=(h^(h>>>13))*1274126177|0; h=(h^(h>>>16)); return ((h&0xffff)/65535-0.5)*2; };
      let prevRow=null; for(let y=0;y<Hh;y++){ const cy=(y*inv)|0; for(let xx=0;xx<W;xx++){ const cx=(xx*inv)|0; const n=0.72*hsh(cx,cy)+0.14*hsh(cx-1,cy)+0.14*hsh(cx,cy-1); const f=1+amp*n; const i=(y*W+xx)*4; d[i]=Math.min(255,d[i]*f); d[i+1]=Math.min(255,d[i+1]*f); d[i+2]=Math.min(255,d[i+2]*f); } }
      ink.putImageData(id,0,0); }
    ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(ink.canvas,0,0); ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    }
  },

  points: [
{u:0.323,v:0.252,d:'KEY', label:'Keyline · 1.5 px plum on the cut, fill slipped 1 px down-right', t:'keyline', dir:[1,-1]},
    {u:0.166,v:0.166,d:'TONE',label:'Thermal ramp · warped Perlin, terraced to soft contour plateaus', t:'thermal', dir:[-1,-1]},
    {u:0.798,v:0.137,d:'FORM',label:'Die-cut ring · keyhole hole, r 34 u + 26 u slot, corners r 6', t:'diecut', dir:[1,-1]},
    {u:0.398,v:0.206,d:'FILL',label:'Flat plate · #F65C1E, no tone, grain only', t:'flat-plate', dir:[-1,0]},
    {u:0.397,v:0.110,d:'FORM',label:'Cut window · black with a pale-orange rim slipped 1 px', t:'cutout', dir:[-1,-1]},
    {u:0.194,v:0.318,d:'GRND',label:'Paper · #DED9D5, L std 3, no vignette to speak of', t:'ground', dir:[-1,0]},
    {u:0.194,v:0.452,d:'COL', label:'Liquid layer · white blob, own thin outline, own pale ramp', t:'liquid-layer', dir:[-1,0]},
    {u:0.882,v:0.595,d:'TEX', label:'Print grain · ±2.4 % L at 1.4 u pitch, lag-1 corr 0.35', t:'grain', dir:[1,0]},
    {u:0.519,v:0.681,d:'TONE',label:'Marbling · small warped field blended in at the capsule end', t:'marbling', dir:[1,1]},
    {u:0.758,v:0.697,d:'MARK',label:'Dash rows · 6 u orange dashes standing in for micro text', t:'dash-rows', dir:[1,1]}
  ],

  spec: {
id:'st-03',
    reference:{ file:'ref-03.png', px:[736,917], measured_at:[722,900], grammar:'die-cut chips on warm grey stock; 1.5 px plum outline misregistered from a white-backed fill; heat-map gradient interiors with liquid sub-layers; two flat orange/black pieces with cut windows and dash-row text; monochrome print grain' },
    palette:{ paper:'#DED9D5', backing:'#F3F0EC', keyline:'#2A2634', orange:'#F65C1E', orange_hot:'#F8641F', orange_rim:'#FFA46E', blue_flat:'#1475BE', blue:'#0B85C5', black:'#06070A', pink:'#F6879E', pale_pink:'#EBB2BB', white:'#DAD5D0', cool_white:'#CDD6CF', yellow:'#F0C550', lemon:'#E4C022', cyan:'#7ED6E5', mint:'#39B66B', teal:'#2AAAD0', lilac:'#9C86C7' },
    ground:{ colour:'#DED9D5', L_std_ref:3.0, vignette:'1.5 % radial darkening, corners only', area_ref:0.39 },
    units:'design units, 1000 = plate width (ref 722 px ⇒ 1 u = 0.722 ref px, 1 ref px = 1.385 u)',
    techniques:[
      { id:'keyline', short:'KEY', name:'Misregistered keyline', layer:4, pass:4,
        params:{ colour:'#2A2634', alpha:0.92, width_u:2.1, width_ref_px:1.5, fill_offset_u:[1.4,1.4], backing_expand_u:1.4, fill_shrink_u:1.4, backing:'#F3F0EC', waver_amp_u:0.25, waver_freq:0.05, join:'round', cap:'round' },
        implementation:'Every chip is a set of rings; the backing ring is offset +1.4 u along its normals and translated (+1.4,+1.4), the fill ring is offset −1.4 u and translated the same, and the plum line is stroked on the unmoved ring at 2.1 u so a pale hairline shows inside the top-left edges and outside the bottom-right ones.' },
      { id:'thermal', short:'TONE', name:'Warped thermal ramp', layer:2, pass:2,
        params:{ noise:'2-D Perlin, gradient table seeded 3303', base_freq_u:[1/520,1/820], warp_octaves:2, warp_amp:[1.0,1.5], field_octaves:2, second_octave_gain:0.3, lacunarity:2.03, contrast:[1.6,1.8], linear_term:[0.5,0.9], edge_term:'exp(−d/60–70 u) × ±0.12–0.32 on the dial, tab and wedge', liquid_contour:'one per chip: local slope ×(1+2.5–3·e^(−g²/0.012)) at ramp value 0.36–0.62', pale_share:'ramps carry 45–55 % pale stops (#DAD5D0, #CDD6CF, #EBB2BB, #E4DEC0)', sample_pitch_u:1.6, per_chip:'own noise offset (ox,oy) and own ramp subset: pink/white/blue arch, yellow/white/blue tab, blue/white lens, white/pink dial, mostly-blue wedge' },
        implementation:'For each chip an ImageData at 1.6 u pitch evaluates f = perlin(p + warp·q) + 0.3·perlin(2p + …) with q a 2-octave warp, adds a linear ramp along the chip and an optional edge-distance term, stretches by the contrast, steepens the slope locally around one ramp value so a single liquid contour hardens, and looks the result up in a 256-entry pale-biased ramp LUT; the bitmap is drawn smoothed into the fill clip.' },
      { id:'diecut', short:'FORM', name:'Die-cut rings', layer:1, pass:1,
        params:{ builder:'polygon vertices with per-corner radius → arcs at 3 u step', corner_r_u:[6,110], holes:'evenodd rings (keyhole r 34 + slot 26×110, corners r 6)', silhouettes:['arch with notch','stepped card','keyhole tab','lens','pac-dial','folder tab','double-notched capsule','device slab','quarter wedge','disc','pill'] },
        implementation:'Each silhouette is a vertex list with corner radii; corners are replaced by tangent-point arcs and the ring is sampled at ~3 u so the same polyline feeds fill, clip, normal offset and stroke.' },
      { id:'flat-plate', short:'FILL', name:'Flat plate', layer:2, pass:2,
        params:{ colour:'#F65C1E', blue_plate:'#1475BE', device_black:'#06070A', hairline:'#39B66B 1.5 u mint rule', dots:'2 white 3 u, 2 orange 5 u', L_std_ref:3.1 },
        implementation:'Solid orange fill through the same backing/offset machinery; no gradient, only the closing grain; a mint 1.5 u rule and 3 u dots as fittings.' },
      { id:'cutout', short:'FORM', name:'Cut window with pale rim', layer:3, pass:3,
        params:{ black:'#06070A', rim:'#FFA46E', rim_expand_u:1.4, offset_u:[1.4,1.4], corner_r_u:8, gradient:'blue #0477C8 → black over the top 45 % of the window, only on the large window' },
        implementation:'Cut windows reuse the chip rings: a pale-orange rim ring +1.4 u, then the black (or blue-to-black thermal) fill −1.4 u translated (+1.4,+1.4), so a light hairline sits on the top-left of every cut.' },
      { id:'ground', short:'GRND', name:'Warm grey stock', layer:0, pass:0,
        params:{ colour:'#DED9D5', vignette_alpha:0.015, grain:'shared closing grain' },
        implementation:'Flat fill plus a radial 1.5 % darkening from 55 % radius to the corners; the grain pass gives it its tooth.' },
      { id:'liquid-layer', short:'COL', name:'Liquid layer blob', layer:3, pass:3,
        params:{ shape:'r(θ)=R(1+Σ a_k sin(kθ+φ_k)), k=2..4, a 0.10–0.22', fill_ramps:['white [#F3F0EC,#DDE6EA,#F6E9EE]','orange [#F0C550,#FA6A21,#F6879E]','blue [#0477C8,#1FA3CB,#7ED6E5]'], outline:{ colour:'#2A2634', width_u:1.7, alpha:0.8, offset_u:[1.4,1.4] } },
        implementation:'A Fourier-radius blob clipped to the chip fill, filled with its own low-contrast thermal ramp, then outlined with the same slipped keyline so it reads as a second cut layer of liquid.' },
      { id:'grain', short:'TEX', name:'Print grain', layer:5, pass:5,
        params:{ pitch_u:1.385, amp_uniform:0.042, L_std_ref_target:3.0, lag1_autocorr:0.35, mono:true, on:'everything, paper included', hash:'xorshift of (cx·374761393 + cy·668265263)' },
        implementation:'One ImageData pass over the composite multiplies R, G and B by 1 + 0.042·(0.6·n(c) + 0.2·n(c−x) + 0.2·n(c−y)) with n a signed hash on 1.385 u cells, giving mono grain with a 0.35 lag-1 correlation like the reference’s.' },
      { id:'marbling', short:'TONE', name:'Ridged marbling', layer:2, pass:2,
        params:{ field:'2-octave warped Perlin at 1/170 u, contrast 2.0', weight:'0.65 × smoothstep((u−0.5)·3 − 0.55 + 0.5) — only the right ~25 % of the capsule', ramp:'[#0B85C5,#2AAAD0,#8FB4C4,#CDD6CF,#DAD5D0,#E4DEC0,#F0C550]', blend:'colour-space mix with the base ramp' },
        implementation:'On the capsule a second, smaller-scale warped field with its own blue/pale/yellow ramp is mixed in by colour where the weight rises along the length, so the right end breaks into a few soft blue and yellow pools while the left stays a smooth pink-to-white plateau.' },
      { id:'dash-rows', short:'MARK', name:'Dash-row micro text', layer:3, pass:3,
        params:{ colour:'#F46629', dash_h_u:6, dash_w_u:[7,26], gap_u:4, row_pitch_u:11, rows:5, align:'right', jitter:'±1 u' },
        implementation:'Right-aligned rows of 3–6 orange rectangles of random width with a 4 u gap and 11 u pitch stand in for text; nothing is typed.' }
    ],
    pass_order:['paper + vignette','chip backing rings (offset +1.4 u, slipped)','chip fills: thermal ImageData or flat, clipped to the shrunk slipped ring','liquid layers, cut windows, fittings, dash rows','keylines on the unmoved rings','print grain ImageData pass over all'],
    orange_budget:'one flat orange card (#F65C1E), one orange/black device, one small orange disc; every other chip is a gradient with no orange stop',
    notes:[ 'All numbers measured on ref-03.png at 722 px and scaled ×1.385 to 1000 design units.', 'Reference area shares (k-means): paper 0.39, blue 0.14, orange 0.08, pink 0.06, black 0.05, pale pink 0.04, yellow 0.02, mint 0.015.', 'Outline profile: 1.5 px dark, white hairline 1 px inside on top/left, 1 px outside on bottom/right ⇒ fill and backing slipped +1 px.', 'Seed 3303.' ]
  }
});
