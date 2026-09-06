/* ST-08 · Two-ink monoline saint — imported from technique-studies/st-08-two-ink-saint.html at ck-e12.
   Reference-study plate; every technique block is provable from a point on the
   plate (coverage rule). Renders in canvas2d, 640×1481 design pixels.
   compare{} off — public build cannot ship the reference; the rebuild carries the argument. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'st-08-two-ink-saint',
  index: 'ST-08',
  order: 3080,
  title: 'Two-ink monoline saint',
  section: 'studies',
  style: 'technique-study',
  status: 'canonical',
  lane: 'canvas2d',
  governed_by: ['composing-computational-material-systems'],
  tags: ['Reference study'],

  source: {
    kind: 'reference-study',
    title: 'References 08 · two-ink monoline devotional prints + anatomical wireframe',
    note: 'Imported at ck-e12 from technique-studies/. compare{} off — public build cannot ship the reference; the rebuild carries the argument.'
  },

  frame: { designWidth: 640, aspect: '640/1481', previewHeight: 1481 },
  thumb: 'thumb.png',

  body: [
'A devotional print in monoline: one stroke weight, round caps, no shading, no fills. The hand is organic — a slow waver on every contour, so nothing is a true circle or rule except the red spine. Two inks with one job each: warm black for flesh, halo, shroud, cords and roots; deep red for what grows inside — flame-heart, spine, ribs, stars, coil, buds and pods.',
    'Built from the anatomical wireframe zone by zone (corona, cervix, pectus, cor, viscera, nervus, ossa, pes) as stroked polylines on two offscreen ink canvases, multiplied onto cream paper with a per-pixel tooth. The shroud is a gaunt asymmetric cocoon; root-cords inside it branch into red growths.'
  ],

  method: 'Wireframe zones · organic monoline · two inks · root-cords · stippled halo · lattice',

  plate: {
    fig: '3.8', series: 'STUDIES', sheet: 8, of: 8,
    designWidth: 640, designHeight: 1481,
    render: function (canvas, w, h, dpr) {
    const S=w/1000, U=1000, V=h/S;
    let seed=8808; const rnd=()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const rr=(a,b)=>a+(b-a)*rnd();
    const K=1.42, OX=500-345*K, OY=170;
    const T=p=>[OX+p[0]*K, OY+p[1]*K];
    const MX=x=>690-x;
    const mk=col=>{ const c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height; const x=c.getContext('2d'); x.setTransform(dpr*S,0,0,dpr*S,0,0); x.lineCap='round'; x.lineJoin='round'; x.strokeStyle=col; x.fillStyle=col; return x; };
    const D=mk('#1C1512'), R=mk('#B1231C');
    const PEN=3.44;
    // ---------- geometry (wireframe px) ----------
    const bez=(p0,p1,p2,p3,n,out)=>{ out=out||[]; for(let i=(out.length?1:0);i<=n;i++){ const t=i/n,u=1-t; out.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0], u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]); } return out; };
    const quad=(p0,p1,p2,n,out)=>{ out=out||[]; for(let i=(out.length?1:0);i<=n;i++){ const t=i/n,u=1-t; out.push([u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0], u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]]); } return out; };
    const seg=(a,b,n,out)=>{ out=out||[]; n=n||Math.max(2,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/4)); for(let i=(out.length?1:0);i<=n;i++)out.push([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]); return out; };
    const arc=(cx,cy,r,a0,a1,n,out)=>{ out=out||[]; n=n||Math.max(8,Math.round(r*Math.abs(a1-a0)/3)); for(let i=(out.length?1:0);i<=n;i++){ const a=a0+(a1-a0)*i/n; out.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } return out; };
    const ell=(cx,cy,rx,ry,a0,a1,n)=>{ const out=[]; n=n||Math.max(12,Math.round(Math.max(rx,ry)*Math.abs(a1-a0)/3)); for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; out.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]); } return out; };
    const spiral=(cx,cy,r0,r1,turns,rot,ccw)=>{ const out=[]; const n=Math.round(turns*24); for(let i=0;i<=n;i++){ const t=i/n; const a=rot+(ccw?-1:1)*t*turns*Math.PI*2; const r=r0+(r1-r0)*t; out.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } return out; };
    const mirror=P=>P.map(p=>[MX(p[0]),p[1]]);
    const mkNoise=()=>{ const p=[rnd()*7,rnd()*7,rnd()*7]; return t=>(Math.sin(t+p[0])+0.5*Math.sin(t*2.13+p[1])+0.25*Math.sin(t*4.7+p[2]))/1.75; };
    // ---------- the organic pen ----------
    const pen=(x,P,opt)=>{ opt=opt||{}; const Q=P.map(T); const n=Q.length; const nz=mkNoise(), tz=mkNoise(); const out=[]; let s=0; const A=opt.straight?0:0.9, B=opt.straight?0:0.15; for(let i=0;i<n;i++){ if(i>0)s+=Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]); const a=Q[Math.max(0,i-1)], b=Q[Math.min(n-1,i+1)]; const dx=b[0]-a[0],dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; const o=A*nz(s*0.012)+B*tz(s*0.5); out.push([Q[i][0]+dy/l*o,Q[i][1]-dx/l*o]); }
      x.save(); x.lineWidth=PEN*(1+0.02*(rnd()*2-1)); x.setLineDash(opt.dash==='dash'?[5.7,9.8]:opt.dash==='dashdot'?[5.7,8,0.05,8]:[]); x.beginPath(); x.moveTo(out[0][0],out[0][1]); for(let i=1;i<n;i++)x.lineTo(out[i][0],out[i][1]); if(opt.closed)x.closePath(); x.stroke(); x.restore(); };
    const dot=(x,p,r)=>{ const q=T(p); x.beginPath(); x.arc(q[0],q[1],r||2.0,0,7); x.fill(); };
    const ring=(x,cx,cy,r)=>pen(x,arc(cx,cy,r,0,Math.PI*2),{closed:true});
    const star=(x,cx,cy,r,inner)=>{ const P=[]; for(let i=0;i<8;i++){ const a=-Math.PI/2+i*Math.PI/4+rr(-0.06,0.06); const q=(i&1)?r*(inner||0.4):r*rr(0.92,1.08); P.push([cx+Math.cos(a)*q,cy+Math.sin(a)*q]); } pen(x,P,{closed:true}); };
    const dense=(P,step)=>{ const o=[P[0]]; for(let i=1;i<P.length;i++){ const a=P[i-1],b=P[i]; const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step)); for(let k=1;k<=n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]); } return o; };
    // red growths at branch tips
    const growth=(p,dir,kind)=>{ const [cx,cy]=p; const a=Math.atan2(dir[1],dir[0]); const c=Math.cos(a),s=Math.sin(a); const tr=(u,v)=>[cx+u*c-v*s,cy+u*s+v*c];
      if(kind===0){ const P=[]; quad(tr(0,0),tr(6,-6),tr(12,0),8,P); quad(tr(12,0),tr(6,6),tr(0,0),8,P); pen(R,P); }                       // bud (teardrop)
      else if(kind===1){ const P=[]; for(let i=0;i<=24;i++){ const t=i/24*Math.PI*2; P.push(tr(7+7*Math.cos(t),3.4*Math.sin(t))); } pen(R,P,{closed:true}); for(const u of [3,7,11])dot(R,tr(u,0),1.7); } // pod
      else { ring(R,cx+c*7,cy+s*7,5.5); dot(R,[cx+c*7,cy+s*7],1.9); } };                                                                       // eye
    // ======================================================================
    // CORONA
    // ======================================================================
    const HX=345, HY=170;
    ring(D,HX,HY,100);
    for(let i=0;i<30;i++){ const a=i/30*Math.PI*2+Math.PI/30+rr(-0.03,0.03); if(Math.abs(a-Math.PI/2)<0.45)continue; const r1=108+rr(10,30); pen(D,seg([HX+Math.cos(a)*108,HY+Math.sin(a)*108],[HX+Math.cos(a)*r1,HY+Math.sin(a)*r1],5)); }
    for(const k of [0,2]){ const a=k*Math.PI/2; const c=Math.cos(a),s=Math.sin(a); const r1=k?136:128; pen(D,seg([HX+c*66,HY+s*66],[HX+c*r1,HY+s*r1],12)); const lx=HX+c*(r1-14),ly=HY+s*(r1-14); pen(D,[[lx+c*7,ly+s*7],[lx-s*5,ly+c*5],[lx-c*7,ly-s*7],[lx+s*5,ly-c*5]],{closed:true}); }
    { const wob=mkNoise(); for(let i=0;i<96;i++){ const a=i/96*Math.PI*2; const r=138+3*wob(a*2); dot(D,[HX+4+Math.cos(a)*r,HY-3+Math.sin(a)*r],2.0); }
      const wob2=mkNoise(); for(let i=0;i<108;i++){ const a=(i+0.5)/108*Math.PI*2; const r=152+3*wob2(a*2+1); dot(D,[HX-5+Math.cos(a)*r,HY+4+Math.sin(a)*r],2.0); } }
    pen(D,seg([345,74],[345,94],4)); pen(D,seg([337,82],[353,82],3));
    // ======================================================================
    // FACE — long, narrow, solemn
    // ======================================================================
    const FX=345, FY=174, RX=42, RY=72;
    pen(D,ell(FX,FY,RX,RY,0,Math.PI*2),{closed:true});
    // hair: a few long strands from the crown down the sides
    for(const [sx,cx1,cx2,ex,ey] of [[338,300,286,290,262],[332,310,296,300,250],[326,318,306,310,236]]){ pen(D,bez([sx,104],[cx1,120],[cx2,180],[ex,ey],18)); pen(D,bez([690-sx,104],[690-cx1,124],[690-cx2,184],[690-ex,ey+6],18)); }
    pen(D,quad([318,112],[345,100],[372,112],10));
    // brows high and long, heavy-lidded open eyes with pupils, long nose, flat mouth
    for(const f of [P=>P,mirror]){ pen(D,f(quad([312,146],[326,139],[340,147],8)));
      pen(D,f(quad([315,166],[326,156],[337,166],8))); pen(D,f(quad([316,160],[326,152],[336,160],8))); pen(D,f(quad([316,166],[326,172],[336,166],8))); dot(D,f([[326,164]])[0],2.4); }
    pen(D,[[345,156],[346,176],[350,200],[341,203]]);
    pen(D,quad([333,224],[345,223],[357,226],8));
    // long neck
    pen(D,seg([332,244],[329,298],10)); pen(D,seg([358,244],[361,298],10));
    // ======================================================================
    // CERVIX — narrow yoke, ring, red lozenge
    // ======================================================================
    pen(D,quad([300,296],[345,304],[390,296],14));
    { const P=[[300,296]]; seg([300,296],[299,316],4,P); for(let i=0;i<5;i++){ const x0=299+i*92/5, x1=299+(i+1)*92/5; quad([x0,316],[(x0+x1)/2,330],[x1,316],8,P); } seg([391,316],[390,296],4,P); pen(D,P); }
    ring(D,345,340,5);
    pen(R,[[345,352],[357,366],[345,380],[333,366]],{closed:true}); dot(R,[345,366],1.9);
    // ======================================================================
    // SHROUD — gaunt asymmetric cocoon
    // ======================================================================
    const prof=(keys,y)=>{ if(y<=keys[0][0])return keys[0][1]; for(let i=1;i<keys.length;i++){ if(y<=keys[i][0]){ const [y0,w0]=keys[i-1],[y1,w1]=keys[i]; const t=(y-y0)/(y1-y0); const c=(1-Math.cos(t*Math.PI))/2; return w0+(w1-w0)*c; } } return keys[keys.length-1][1]; };
    const KL=[[312,66],[420,86],[600,106],[800,102],[950,88],[1080,78]], KR=[[312,64],[420,90],[600,110],[800,98],[950,92],[1080,74]];
    const phL=[1.3,4.1], phR=[3.7,0.6];
    const side=(keys,ph,sg,inset)=>y=>345+sg*(prof(keys,y)-(inset||0)+6*Math.sin(y/140+ph[0])+3*Math.sin(y/57+ph[1]));
    const xL=side(KL,phL,-1), xR=side(KR,phR,1);
    const hem=x=>{ const w=(x<345?prof(KL,1080):prof(KR,1080)); return 1080+40*Math.max(0,1-Math.abs(x-345)/w); };
    { const P=[[300,306]]; quad([300,306],[290,318],[xL(322),322],6,P); for(let y=326;y<=1080;y+=4)P.push([xL(y),y]); for(let x=xL(1080)+4;x<xR(1080);x+=4)P.push([x,hem(x)]); for(let y=1080;y>=326;y-=4)P.push([xR(y),y]); quad([xR(322),322],[400,318],[390,306],6,P); pen(D,P); }
    // folds: the contour offset inward with its own noise
    for(const [keys,ph,sg,ins,dsh] of [[KL,phL,-1,16,'dashdot'],[KR,phR,1,15,'']]){ const f=side(keys,[ph[0]+rr(0.3,0.9),ph[1]+rr(0.3,0.9)],sg,ins); const P=[]; for(let y=350+ins*2;y<=hem(f(1060))-14;y+=4)P.push([f(y),y]); pen(D,P,dsh?{dash:dsh}:{}); }
    // turned hem: second line above the V, pendant ring
    { const Q=[]; for(let x=xL(1060)+12;x<=xR(1060)-12;x+=4)Q.push([x,hem(x)-13]); pen(D,Q,{dash:'dashdot'}); ring(D,345,1134,6); }
    // ======================================================================
    // PECTVS / SPINA — root-cords with red growths; NERVVS from the right cord
    // ======================================================================
    const cordX=(x0,ph)=>y=>x0+8*Math.sin((y-318)/40*Math.PI*2+ph)+5*Math.sin(y/113+ph);
    const cords=[{x0:283,ph:0.4,sg:-1,by:[420,520,640,760,880,980],kinds:[0,1,2,0,1,0]},{x0:407,ph:2.1,sg:1,by:[380,470,700,830,960],kinds:[2,0,1,0,2]}];
    for(const c of cords){ const cx=cordX(c.x0,c.ph); const P=[]; for(let y=318;y<=hem(c.x0)-6;y+=3)P.push([cx(y),y]); pen(D,P);
      c.by.forEach((y,i)=>{ const x=cx(y); const L=rr(16,26); const out=c.sg*rr(0.5,1); const dirv=[out*L,rr(-0.2,1.1)*L]; const end=[x+dirv[0],y+dirv[1]]; const B=bez([x,y],[x+dirv[0]*0.3,y+dirv[1]*0.1-8],[x+dirv[0]*0.7,y+dirv[1]*0.8+8],end,14); pen(D,B); growth(end,dirv,c.kinds[i]);
        if(i%3===1){ const m=B[7]; const d2=[out*rr(8,14),rr(-16,-6)]; const e2=[m[0]+d2[0],m[1]+d2[1]]; pen(D,bez(m,[m[0]+d2[0]*0.5,m[1]-4],[m[0]+d2[0]*0.9,m[1]+d2[1]*0.6],e2,8)); growth(e2,d2,(c.kinds[i]+1)%3); } }); }
    // nerves: three wavy lines with rings from the right cord inward
    for(let i=0;i<3;i++){ const y=690+i*26; const x=cordX(407,2.1)(y); pen(D,bez([x,y],[x-14,y-12],[x-24,y+14],[x-36,y+2],14)); ring(D,x-41,y+2,4.5); }
    // ======================================================================
    // COR — flame-heart
    // ======================================================================
    { const cx=345,cy=470,s=1.6; const P=[]; for(let i=0;i<=72;i++){ const t=i/72*Math.PI*2; const x=16*Math.pow(Math.sin(t),3); const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t); P.push([cx+x*s,cy-y*s]); } pen(R,P,{closed:true});
      const tongue=(x0,y0,x1,y1,lean,wd)=>{ const P=[]; bez([x0-wd,y0],[x0-wd*1.6+lean*0.3,y0-(y0-y1)*0.35],[x1-wd*0.4+lean,y1+(y0-y1)*0.35],[x1,y1],10,P); bez([x1,y1],[x1+wd*0.6+lean,y1+(y0-y1)*0.3],[x0+wd*1.5+lean*0.4,y0-(y0-y1)*0.6],[x0+wd,y0],10,P); pen(R,P); };
      tongue(345,461,347,398,0,6); tongue(334,460,318,424,-6,4.5); tongue(356,460,374,420,6,4.5); }
    // ======================================================================
    // OSSA — straight spine, stars of varying size, nine uneven ribs; girdle lattice
    // ======================================================================
    for(let k=-5;k<=5;k++){ const x=345+k*8; pen(R,seg([x,512],[x,630],20),{straight:true}); pen(R,seg([x,676],[x,1010],40),{straight:true}); }
    [[548,9],[594,13],[700,7],[758,11],[900,15],[952,8],[1002,12]].forEach(([y,r])=>star(R,345,y,r,0.4));
    star(R,345,815,16,0.4);
    for(let i=0;i<9;i++){ const r=28+i*9+rr(-2,2); const cx=345+rr(-3,3), cy=850+rr(-3,3); pen(R,arc(cx,cy,r,Math.PI+rr(-0.06,0.06),Math.PI*2+rr(-0.06,0.06))); }
    { const x0=288,x1=402,y0=636,y1=666,p=(x1-x0)/4; pen(R,seg([x0,y0],[x1,y0],20)); pen(R,seg([x0,y1],[x1,y1],20)); const A=[],B=[]; let k=0; for(let x=x0;x<=x1+0.1;x+=p/2,k++){ A.push([x,(k&1)?y1:y0]); B.push([x,(k&1)?y0:y1]); } pen(R,A); pen(R,B); for(let x=x0+p/2;x<x1;x+=p)dot(R,[x,(y0+y1)/2],1.9); }
    // ======================================================================
    // VISCERA — belly coil that sends a tendril out
    // ======================================================================
    { const sp=spiral(268,730,2,26,2.5,Math.PI*0.3,false); const e=sp[sp.length-1]; const tail=bez(e,[e[0]-30,e[1]+30],[e[0]-14,e[1]+70],[e[0]-30,e[1]+104],16); pen(R,sp.concat(tail.slice(1))); dot(R,[268,730],1.9); growth(tail[tail.length-1],[-0.4,1],0); }
    // ======================================================================
    // HANDS — long fingers hanging outside the shroud
    // ======================================================================
        for(const [f,sg,k0] of [[P=>P,-1,0],[mirror,1,2]]){ const wx=xL(574)-4; const P=[[wx+2,566]]; seg([wx+2,566],[wx-22,574],6,P); bez([wx-22,574],[wx-30,596],[wx-34,620],[wx-36,642],8,P);
      const xs=[wx-32,wx-21,wx-10,wx+1], tips=[714,730,722,692]; const tipP=[]; for(let i=0;i<4;i++){ const x=xs[i], tip=tips[i]; seg(P[P.length-1],[x-5,tip-8],8,P); quad([x-5,tip-8],[x,tip+4],[x+5,tip-8],8,P); tipP.push([x,tip+2]); if(i<3)seg([x+5,tip-8],[x+5.5,654],8,P); }
      seg(P[P.length-1],[wx+7,650],3,P); seg([wx+7,650],[wx+4,600],6,P); seg([wx+4,600],[wx-2,588],3,P); pen(D,f(P));
      // thumb on the outer side
      pen(D,f(bez([wx-30,612],[wx-48,624],[wx-54,652],[wx-44,664],10).concat(seg([wx-44,664],[wx-36,642],4).slice(1))));
      pen(D,f(quad([wx-30,646],[wx-14,654],[wx+4,648],8)),{dash:'dashdot'});
    }
    // ======================================================================
    // PES — comb, twisted-cord legs, feet that are too small
    // ======================================================================
    for(let i=0;i<11;i++){ const x=300+i*9; pen(D,seg([x,hem(x)+2],[x,hem(x)+30],6)); }
    { const P=[]; for(let x=292;x<=398;x+=3)P.push([x,hem(x)+16+4*Math.sin((x-292)/24*Math.PI*2)]); pen(D,P); }
    for(const [cx,sg] of [[300,-1],[390,1]]){ star(R,cx,1150,8,0.4);
      for(const ph of [0,Math.PI]){ const P=[]; for(let y=1162;y<=1310;y+=3)P.push([cx+10*Math.sin((y-1162)/50*Math.PI*2+ph),y]); pen(D,P); }
      const F=[[cx-7,1308]]; seg([cx-7,1308],[cx-7,1324],4,F); quad([cx-7,1324],[cx-6,1334],[cx+sg*-1*0,1334],4,F); seg([cx,1334],[cx+sg*24,1336],6,F); quad([cx+sg*24,1336],[cx+sg*34,1334],[cx+sg*28,1324],6,F); quad([cx+sg*28,1324],[cx+sg*12,1316],[cx+7,1310],6,F); seg([cx+7,1310],[cx+7,1308],2,F); pen(D,F,{closed:true}); }
    // ======================================================================
    // composite
    // ======================================================================
    const ctx=canvas.getContext('2d'); ctx.setTransform(dpr*S,0,0,dpr*S,0,0); ctx.fillStyle='#FBF6EB'; ctx.fillRect(0,0,U,V);
    { const W=canvas.width,H=canvas.height; const id=ctx.getImageData(0,0,W,H); const d=id.data; let hsh=8808; for(let i=0;i<d.length;i+=4){ hsh=(hsh+0x6D2B79F5)|0; let t=Math.imul(hsh^hsh>>>15,1|hsh); t=t+Math.imul(t^t>>>7,61|t)^t; const n=((t^t>>>14)>>>0)/4294967296-0.5; const f=1+0.016*n; d[i]=Math.min(255,d[i]*f); d[i+1]=Math.min(255,d[i+1]*f); d[i+2]=Math.min(255,d[i+2]*f); } ctx.putImageData(id,0,0); }
    ctx.setTransform(1,0,0,1,0,0); ctx.globalCompositeOperation='multiply'; ctx.drawImage(D.canvas,0,0); ctx.drawImage(R.canvas,0,0); ctx.globalCompositeOperation='source-over';
    ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    }
  },

  points: [
{u:0.6474,v:0.5398,d:'KEY', label:'Organic monoline · 3.4 u (2.2 px), waver 0.9 u + tremor, round caps', t:'monoline', dir:[1,0]},
    {u:0.5000,v:0.3619,d:'COL', label:'Second ink · #B1231C only for what grows inside', t:'two-ink', dir:[1,-1]},
    {u:0.4155,v:0.4417,d:'KEY', label:'Root-cord · continuous wave that branches, red buds at the tips', t:'cord', dir:[-1,0]},
    {u:0.6455,v:0.1143,d:'MARK',label:'Stippled halo · two off-centre dot rings, rays of uneven length', t:'halo-dots', dir:[1,-1]},
    {u:0.4393,v:0.4730,d:'TEX', label:'Girdle lattice · red diamonds pitch 40 u over the spine gap', t:'lattice', dir:[-1,1]},
    {u:0.5000,v:0.6258,d:'MARK',label:'Star column · stars of varying size on 11 straight red verticals', t:'star-column', dir:[1,0]},
    {u:0.5000,v:0.5558,d:'FORM',label:'Ribs · nine uneven arcs, centres drift, red', t:'ribs', dir:[1,0]},
    {u:0.3248,v:0.4539,d:'FORM',label:'Hand · long narrow fingers hanging outside the shroud, thumb out', t:'hands', dir:[-1,-1]},
    {u:0.4148,v:0.8921,d:'FORM',label:'Twisted-cord leg · ends in a foot that is too small', t:'legs-feet', dir:[-1,1]},
    {u:0.7800,v:0.6600,d:'GRND',label:'Cream paper · #FBF6EB, ±0.8 % tooth, nothing else on it', t:'paper', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · fold pending point authoring', t:'fold', dir:[1,-1]}
  ],

  spec: {
id:'st-08',
    reference:{ files:['ref-08a-ambrose.png','ref-08b-michael.png','ref-08-wire.png'], compare:'ref-08.png (A over B)', px:[640,1481], grammar:'two-ink monoline devotional prints: a single pen weight, round caps, dashed secondary edges, ornament as line, plain cream paper; anatomy from a 742×1398 wireframe (corona, cervix, pectvs, spina, cor, viscera, nervvs, ossa, pes)' },
    units:'design units, 1000 = plate width (ref 640 px ⇒ 1 u = 0.64 px); plate is 1000 × 2314 u; wireframe px × 1.42 = u, axis x 345 → 500 u, y 0 → 170 u',
    palette:{ paper:'#FBF6EB', ink_dark:'#1C1512', ink_red:'#B1231C', ref_A_body:'#8A1A1A', ref_A_gold:'#C9A46A', ref_B_black:'#111111', ref_B_red:'#E0261B' },
    ground:{ colour:'#FBF6EB', tooth:'±0.8 % per-pixel hashed brightness (ref B paper L std ≈1.3)', share:'≈0.90 of the plate' },
    pen:{ width_u:3.44, width_ref_px:2.2, measured:'A ≈1.6 px at 460 px wide, B ≈2.4 px at 639 px wide ⇒ 2.2 px at 640', cap:'round', join:'round', waver:'0.9 u at 0.012 rad/u + 0.15 u tremor at 0.5 rad/u', width_jitter:0.02, exception:'the 11 spine verticals are straight' },
    dash:{ array_u:[5.7,9.8], visible:'9.1 on / 6.4 off with round caps', dashdot_u:[5.7,8,0.05,8], where:'secondary shroud folds, palm creases' },
    halo:{ ring_r_u:142, rays:{ n:30, from_u:153, length_u:'14–43 random', omitted:'±25° of the collar' }, lozenge_rays:2, cross:{ at:'crown', arm_u:11 }, dots:{ rings_r_u:[196,216], centres_off_u:[[6,-4],[-7,6]], radius_wobble_u:4, n:[96,108], dot_r_u:2.0 } },
    lattice:{ pitch_u:40, band_u:43, diamonds:4, dot_r_u:1.9, where:'girdle y 636–666 wire, x 288–402, spine interrupted behind it' },
    figure:{ heads_tall:'≈9.3 (face 106–246 wire, feet 1330)', shroud_half_width_wire:{ left:[[312,66],[420,86],[600,106],[800,102],[950,88],[1080,78]], right:[[312,64],[420,90],[600,110],[800,98],[950,92],[1080,74]] }, contour_noise:'6·sin(y/140+φ)+3·sin(y/57+φ′), φ = [1.3,4.1] left, [3.7,0.6] right', hem:'V from ±78 at y 1080 to the pendant at y 1120' },
    zones:{ corona:'dark: wavered ring, 30 rays of random length, 2 lozenge rays, two off-centre stippled rings, cross', cervix:'dark: long neck, 5-scallop yoke, ring; red lozenge', pectvs_spina:'dark: two root-cords (wave λ 40 wire, amp 8 + drift 5) from the collar to the hem, 5–6 branches each; red buds, pods and eyes at the branch tips', cor:'red: flame-heart, three tongues', viscera:'red: belly coil 2.5 turns r 26 wire with a tendril to a bud', nervvs:'dark: 3 wavy nerves with terminal rings from the right cord', ossa:'red: 11 straight spine verticals pitch 8 wire, 9 uneven rib arcs r 28–100, stars r 6–16', pes:'dark: V hem, comb of 11 teeth with a wave, twisted-cord legs, feet 34 wire long' },
    techniques:[
      { id:'monoline', short:'KEY', name:'Organic monoline pen', layer:1, pass:1,
        params:{ width_u:3.44, width_ref_px:2.2, cap:'round', join:'round', waver_amp_u:0.9, waver_freq:0.012, tremor_amp_u:0.15, tremor_freq:0.5, width_jitter:0.02, modulation:'none', fills:'none', straight:'spine verticals only' },
        implementation:'Every mark is a polyline in wireframe px mapped to plate units, displaced along its normal by 0.9 u of 3-octave sine noise of arc length plus a 0.15 u tremor, and stroked once at 3.44 u with round caps and joins on one of the two ink canvases.' },
      { id:'two-ink', short:'COL', name:'Two inks, one job each', layer:1, pass:5,
        params:{ dark:'#1C1512', red:'#B1231C', dark_job:'flesh, halo, shroud, folds, cords, branches, nerves, hands, legs, feet', red_job:'lozenge, flame-heart, spine, ribs, stars, coil and its tendril, buds, pods, eyes, girdle lattice', composite:'multiply', overlap:'only where objects overlap (ribs over the spine, cords over the lattice)' },
        implementation:'Two offscreen canvases, one per ink, each stroked with its own colour; both are drawn in multiply onto the paper so crossings darken like wet ink.' },
      { id:'cord', short:'KEY', name:'Root-cords with growths', layer:1, pass:2,
        params:{ cords:2, wave:'x = x0 + 8·sin(2πy/40) + 5·sin(y/113) wire px', x0_wire:[283,407], branches_per_cord:[6,5], branch_len_wire:'16–26', forks:'every third branch forks', growths:{ bud:'teardrop 6×11 wire', pod:'ellipse 12×6 with 3 pen dots', eye:'ring r 5 + dot' }, growth_ink:'#B1231C' },
        implementation:'Each cord is a sine-of-y polyline; at chosen y a cubic branch leaves it with a random outward lean, optionally forking, and a red growth is drawn at each tip.' },
      { id:'fold', short:'KEY', name:'Shroud folds', layer:1, pass:2,
        params:{ per_side:1, left:'dash-dot at inset 16 wire', right:'solid at inset 15 wire', dashdot_u:[5.7,8,0.05,8] },
        implementation:'The contour is offset inward and re-wavered with its own noise so the folds follow the cocoon without being parallel copies.' },
      { id:'halo-dots', short:'MARK', name:'Stippled corona', layer:1, pass:3,
        params:{ rings_r_u:[196,216], centres_off_u:[[6,-4],[-7,6]], radius_wobble_u:4, counts:[96,108], dot_r_u:2.0, rays:'30, 14–43 u, random' },
        implementation:'Two rings of filled pen dots with displaced centres and a slow radial wobble, so they are not concentric; short rays of random length inside them.' },
      { id:'lattice', short:'TEX', name:'Girdle lattice', layer:2, pass:4,
        params:{ pitch_u:40, band_u:43, rules:2, diamonds:4, dot_r_u:1.9, ink:'#B1231C' },
        implementation:'Two rules and two antiphase zigzags make a row of diamonds with a pen dot in each; the spine verticals stop above and resume below the band.' },
      { id:'star-column', short:'MARK', name:'Spine and stars', layer:2, pass:4,
        params:{ column:{ lines:11, pitch_u:11.4, x_wire:'305–385', y_wire:'512–630 and 676–1010', waver:0 }, stars:{ y_wire:[548,594,700,758,900,952,1002], r_wire:[9,13,7,11,15,8,12], inner:0.4, points:4 }, big_star:{ r_wire:16, y_wire:815 } },
        implementation:'Eleven straight red verticals; 4-point stars are 8-vertex polygons of varying radius stroked closed on the centre line.' },
      { id:'ribs', short:'FORM', name:'Uneven ribs', layer:2, pass:4,
        params:{ arcs:9, r_wire:'28…100 step 9, jitter ±2', centre_wire:[345,850], centre_jitter_wire:'±3 per arc', span:'upper semicircle' },
        implementation:'Nine upper semicircles with per-arc radius and centre jitter, stroked in red over the spine.' },
      { id:'hands', short:'FORM', name:'Long hands', layer:1, pass:3,
        params:{ finger_len_wire:'62–72', finger_w_wire:10, fingers:4, thumb:'outer side', wrist:'emerges from the shroud contour at y 574', crease:'dash-dot' },
        implementation:'One open polyline per hand (wrist → palm → four narrow U-fingers → thumb → wrist) hanging outside the shroud, with a dash-dot palm crease.' },
      { id:'legs-feet', short:'FORM', name:'Cord legs and small feet', layer:1, pass:3,
        params:{ legs:{ x_wire:[300,390], cord:'two antiphase sines amp 10 wire, λ 50', y_wire:'1140–1310' }, feet:{ length_wire:34, turned:'out' }, comb:{ teeth:11, pitch_wire:9, wave:'amp 4, λ 24 through the teeth' }, pendant_ring_wire:[345,1134] },
        implementation:'Each leg is a twisted cord of two sines; each foot a closed contour 34 wire px long; the comb hangs from the V hem with a sine crossing it.' },
      { id:'paper', short:'GRND', name:'Cream paper', layer:0, pass:0,
        params:{ colour:'#FBF6EB', tooth:'±0.8 % hashed per pixel', ref_B_paper:'#FBF6EB', ref_A_paper:'#F8F8F8 (linen)' },
        implementation:'Flat cream fill with a hashed per-pixel brightness noise; nothing else is drawn on the paper except the two inks.' }
    ],
    pass_order:['paper + tooth','dark ink: halo, cross, face, hair strands, neck, collar, shroud contour, hem, folds, cords + branches, nerves, hands, comb, legs, feet','red ink: lozenge, flame-heart, spine, stars, ribs, lattice, coil + tendril, growths','multiply dark canvas','multiply red canvas'],
    notes:[ 'Pen width from EDT ridge widths: A ≈1.6 px at 460 px wide, B ≈2.4 px at 639 px wide; the plate uses one pen of 2.2 px at 640 px (3.44 u).', 'Seed 8808; wireframe 742×1398 mapped by (x−345)·1.42+500, y·1.42+170; figure 194–2090 u tall, ≈9.3 heads.' ]
  }
});
