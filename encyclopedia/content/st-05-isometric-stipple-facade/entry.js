/* ST-05 · Dimetric stipple loggia — imported from technique-studies/st-05-isometric-stipple-facade.html at ck-e12.
   Reference-study plate; every technique block is provable from a point on the
   plate (coverage rule). Renders in canvas2d, 1200×1999 design pixels.
   compare{} off — public build cannot ship the reference; the rebuild carries the argument. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'st-05-isometric-stipple-facade',
  index: 'ST-05',
  order: 3050,
  title: 'Dimetric stipple loggia',
  section: 'studies',
  style: 'technique-study',
  status: 'canonical',
  lane: 'canvas2d',
  governed_by: ['composing-computational-material-systems'],
  tags: ['Reference study'],

  source: {
    kind: 'reference-study',
    title: 'Reference 05 · isometric stippled façade in four inks and black',
    note: 'Imported at ck-e12 from technique-studies/. compare{} off — public build cannot ship the reference; the rebuild carries the argument.'
  },

  frame: { designWidth: 1200, aspect: '1200/1999', previewHeight: 1999 },
  thumb: 'thumb.png',

  body: [
'A print-style architectural fragment in a near-frontal dimetric view: every face is one of four flat inks — ice blue, lemon yellow, pink, orange-red — bounded by a heavy black brush contour that swells on the shadow side and at every join. Shading is black spatter: sunlit tops stay clean, half-lit fronts carry a sparse field, turned-away yellow returns go olive.',
    'Built in four passes: faces are filled flat while a grey density map is painted in parallel (one ramp per cylinder, a sawtooth per flute, edge bands on every return, cast bands under overhangs); a per-pixel pass converts that map into 1.85 u spatter dots clipped per face; then wavered variable-width ribbons draw contours, fluting, joints, dentils and mouldings on top.'
  ],

  method: 'Flat face fills · density map · spatter stipple · brush contour',

  plate: {
    fig: '3.5', series: 'STUDIES', sheet: 5, of: 8,
    designWidth: 1200, designHeight: 1999,
    render: function (canvas, w, h, dpr) {
    const C={blk:'#000000',blue:'#D2F1F3',yel:'#FFFF01',pink:'#FF868F',red:'#FF4C01'};
    const S=w/1000, V=h/S;
    let seed=505; const rnd=()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const mk=()=>{ const c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height; const x=c.getContext('2d',{willReadFrequently:true}); x.setTransform(dpr*S,0,0,dpr*S,0,0); x.lineCap='round'; x.lineJoin='round'; return x; };
    const ctx=canvas.getContext('2d'); ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    const dc=mk(); dc.fillStyle='#000'; dc.fillRect(-80,-80,1200,V+200);
    const ink=mk(); ink.fillStyle='#000';
    const BIG=[-80,-80,1200,V+200];
    const path=(x,P,closed=true)=>{ x.beginPath(); x.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++)x.lineTo(P[i][0],P[i][1]); if(closed)x.closePath(); };
    const gr=v=>{ v=Math.max(0,Math.min(1,v))*255|0; return `rgb(${v},${v},${v})`; };
    const uni=(g,v)=>{ g.globalCompositeOperation='source-over'; g.fillStyle=gr(v); g.fillRect(...BIG); };
    const lin=(g,p0,p1,v0,v1,pw=1)=>{ const G=g.createLinearGradient(p0[0],p0[1],p1[0],p1[1]); for(let k=0;k<=8;k++){ const t=k/8; G.addColorStop(t,gr(v0+(v1-v0)*Math.pow(t,pw))); } const dx=p1[0]-p0[0],dy=p1[1]-p0[1],L=Math.hypot(dx,dy)||1; const nx=-dy/L*3000,ny=dx/L*3000; const ex=v1>0.001?dx/L*3000:0, ey=v1>0.001?dy/L*3000:0; g.globalCompositeOperation='lighter'; g.fillStyle=G; path(g,[[p0[0]+nx,p0[1]+ny],[p1[0]+nx+ex,p1[1]+ny+ey],[p1[0]-nx+ex,p1[1]-ny+ey],[p0[0]-nx,p0[1]-ny]]); g.fill(); g.globalCompositeOperation='source-over'; };
    const sub=(g,P,fn)=>{ g.save(); path(g,P); g.clip(); fn(g); g.restore(); };
    const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
    // ---- face: colour fill on main, erase ink beneath, paint density (base + fn) ----
    const face=(P,col,base,fn)=>{ path(ctx,P); ctx.fillStyle=col; ctx.fill(); ink.save(); ink.globalCompositeOperation='destination-out'; path(ink,P); ink.fill(); ink.restore(); dc.save(); path(dc,P); dc.clip(); uni(dc,base); if(fn)fn(dc); dc.restore(); };
    // ---- lines: wavered variable-width ribbons with shadow swell, join swell and tapered ends ----
    const mkN=()=>{ const p=[rnd()*7,rnd()*7,rnd()*7]; return t=>(Math.sin(t+p[0])+0.5*Math.sin(t*2.13+p[1])+0.25*Math.sin(t*4.7+p[2]))/1.75; };
    const resample=(P,closed,step)=>{ const n=P.length, m=closed?n:n-1; const Q=[],VD=[];
      const CR=P.map((b,i)=>{ if(!closed&&(i===0||i===n-1))return false; const a=P[(i-1+n)%n],c=P[(i+1)%n]; const a1=Math.atan2(b[1]-a[1],b[0]-a[0]),a2=Math.atan2(c[1]-b[1],c[0]-b[0]); let d=Math.abs(a2-a1); if(d>Math.PI)d=2*Math.PI-d; return d>0.4; });
      for(let i=0;i<m;i++){ const a=P[i],b=P[(i+1)%n]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const k=Math.max(1,Math.ceil(L/step)); for(let j=0;j<k;j++){ const t=j/k; Q.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]); let d=1e9; if(CR[i])d=Math.min(d,t*L); if(CR[(i+1)%n])d=Math.min(d,(1-t)*L); VD.push(d); } }
      if(!closed){ Q.push(P[n-1].slice()); VD.push(1e9); } return {Q,VD}; };
    const normals=(P,closed)=>{ const n=P.length, N=[]; for(let i=0;i<n;i++){ const a=P[closed?(i-1+n)%n:Math.max(0,i-1)], b=P[closed?(i+1)%n:Math.min(n-1,i+1)]; const dx=b[0]-a[0],dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; N.push([dy/l,-dx/l]); } return N; };
    const pip=(P,x,y)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const a=P[i],b=P[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c; } return c; };
    const LX=Math.SQRT1_2, LY=-Math.SQRT1_2; // light from top-right
    // line(P,w,{closed,taper:true|'soft',swell,wav,clip,step,join})
    const line=(P,w,o={})=>{ const closed=!!o.closed; const {Q,VD}=resample(P,closed,o.step||7); if(Q.length<2)return; const N=normals(Q,closed); const nz=mkN(), nz2=mkN(); const wav=o.wav===undefined?0.9:o.wav;
      let tot=0; const sArr=[0]; for(let i=1;i<Q.length;i++){ tot+=Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]); sArr.push(tot); }
      let sgn=1; if(closed&&o.swell!==false){ const m=Q[0]; const t=[m[0]+N[0][0]*2,m[1]+N[0][1]*2]; sgn=pip(Q,t[0],t[1])?-1:1; }
      const taper=closed?false:(o.taper===undefined?'soft':o.taper); const soft=taper==='soft'; const tl=taper?(soft?Math.min(14,tot*0.25):Math.min(30,tot*0.3)):0;
      const outer=[],inner=[]; const ws=[];
      for(let i=0;i<Q.length;i++){ const s=sArr[i]; let ww=w*(1+0.22*nz(s*0.045)); if(tl>0){ const e=Math.min(1,Math.min(s,tot-s)/tl); ww*=soft?0.55+0.45*Math.pow(e,0.7):Math.pow(e,0.6); } if(closed&&o.swell!==false){ const nx=N[i][0]*sgn, ny=N[i][1]*sgn; ww*=1+0.5*Math.max(0,-(nx*LX+ny*LY)); } if(o.join!==false)ww*=1+0.35*Math.max(0,1-VD[i]/12); ws.push(ww); const off=wav*nz2(s*0.02); const px=Q[i][0]+N[i][0]*off, py=Q[i][1]+N[i][1]*off; outer.push([px+N[i][0]*ww/2,py+N[i][1]*ww/2]); inner.push([px-N[i][0]*ww/2,py-N[i][1]*ww/2]); }
      ink.save(); if(o.clip){ path(ink,o.clip); ink.clip(); } ink.beginPath(); ink.moveTo(outer[0][0],outer[0][1]); for(let i=1;i<outer.length;i++)ink.lineTo(outer[i][0],outer[i][1]);
      if(closed){ ink.closePath(); ink.moveTo(inner[inner.length-1][0],inner[inner.length-1][1]); for(let i=inner.length-2;i>=0;i--)ink.lineTo(inner[i][0],inner[i][1]); ink.closePath(); ink.fill('evenodd'); }
      else { for(let i=inner.length-1;i>=0;i--)ink.lineTo(inner[i][0],inner[i][1]); ink.closePath(); ink.fill(); if(!taper){ for(const k of [0,Q.length-1]){ ink.beginPath(); ink.arc(Q[k][0],Q[k][1],ws[k]/2,0,Math.PI*2); ink.fill(); } } }
      ink.restore(); };
    // ---- projection: near-frontal dimetric measured from the reference. Y runs along the façade (to the left, rising 12°), X toward the viewer (down-left at 30°, ×0.8), Z up. Visible: tops, +X fronts, −Y right-hand returns ----
    const D2R=Math.PI/180, c12=Math.cos(12*D2R), s12=Math.sin(12*D2R), c30=Math.cos(30*D2R), s30=0.5, KY=0.8, SC=0.85, OX=945, OY=1300;
    const iso=(X,Y,Z)=>[OX-(Y*c12+X*c30*KY)*SC, OY+(X*s30*KY-Y*s12-Z)*SC];
    const KW=Math.hypot(c30*KY,c12)*SC, KE=Math.hypot(s30*KY,s12)*SC; // apparent half-width / semi-minor per unit radius (screen u)
    const TH=Math.atan2(c12,c30*KY); // circle angle of the left tangent
    const hc=(Xc,Yc,Z,r,t0,t1,n=32)=>{ const P=[]; for(let i=0;i<=n;i++){ const a=t0+(t1-t0)*i/n; P.push(iso(Xc+r*Math.cos(a),Yc+r*Math.sin(a),Z)); } return P; };
    const frontArc=(Xc,Yc,Z,r)=>hc(Xc,Yc,Z,r,TH+Math.PI,TH+2*Math.PI); const backArc=(Xc,Yc,Z,r)=>hc(Xc,Yc,Z,r,TH,TH+Math.PI);
    const cyl=(Xc,Yc,r,z0,z1)=>frontArc(Xc,Yc,z0,r).concat(backArc(Xc,Yc,z1,r));
    // shading band from a 3-D edge: p (3-D point on the edge), e (3-D edge direction), into (3-D direction into the face), len = screen distance
    const bandE=(g,p,e,into,len,v0,v1,pw)=>{ const p0=iso(...p), q=iso(p[0]+e[0],p[1]+e[1],p[2]+e[2]), w=iso(p[0]+into[0],p[1]+into[1],p[2]+into[2]); let ex=q[0]-p0[0],ey=q[1]-p0[1]; const L=Math.hypot(ex,ey)||1; ex/=L; ey/=L; let nx=-ey,ny=ex; if(nx*(w[0]-p0[0])+ny*(w[1]-p0[1])<0){ nx=-nx; ny=-ny; } lin(g,p0,[p0[0]+nx*len,p0[1]+ny*len],v0,v1,pw); };
    // face specs: T top (lit), FX front (half-lit 0.10), FY right-hand return (shaded 0.14 + edge bands)
    const T=(col,d=0,fn)=>({col,d,fn}); const FX=(col,fn,d=0.10)=>({col,d,fn}); const FY=(col,d=0.14,fn)=>({col,d,fn,ret:true});
    // box: faces top (Z1), front (+X at X1), return (−Y at Y0); then hexagonal silhouette + 3 inner edges from the interior vertex (X1,Y0,Z1)
    const box=(X0,X1,Y0,Y1,Z0,Z1,f,lw=8)=>{ const A=iso(X0,Y0,Z1),B=iso(X0,Y1,Z1),Cc=iso(X1,Y1,Z1),D=iso(X1,Y1,Z0),E=iso(X1,Y0,Z0),F=iso(X0,Y0,Z0),I=iso(X1,Y0,Z1);
      const tp=[A,B,Cc,I], xf=[I,Cc,D,E], yf=[A,I,E,F];
      if(f.top)face(tp,f.top.col,f.top.d,f.top.fn);
      if(f.x){ const fx=f.x; face(xf,fx.col,fx.d,g=>{ if(fx.corner)bandE(g,[X1,Y0,Z0],[0,0,1],[0,1,0],Math.min(40,(Y1-Y0)*SC*0.4),0.25,0,1.3); if(fx.fn)fx.fn(g); }); }
      if(f.y){ const fy=f.y; const fn=fy.ret?g=>{ const L=Math.min(70,(X1-X0)*KY*SC*0.5); bandE(g,[X1,Y0,Z0],[0,0,1],[-1,0,0],L,0.42,0,1.3); bandE(g,[X0,Y0,Z0],[0,0,1],[1,0,0],L*0.8,0.32,0,1.3); bandE(g,[X0,Y0,Z1],[1,0,0],[0,0,-1],Math.min(40,(Z1-Z0)*SC*0.4),0.25,0,1.2); if(fy.fn)fy.fn(g); }:fy.fn; face(yf,fy.col,fy.d,fn); }
      line([A,B,Cc,D,E,F],lw,{closed:true});
      line([I,E],lw*0.86); line([I,Cc],lw*0.86); line([I,A],lw*0.86); return {tp,xf,yf}; };
    const L3=(a,b,w,o)=>line([iso(...a),iso(...b)],w,o);
    const R3=(P,w,o)=>line(P.map(q=>iso(...q)),w,Object.assign({closed:true,swell:false},o||{}));
    const DET=4.5, MOR=4.2, HAIR=3.6;
    // ashlar grid on a plane: kind 'X' (plane X = const, lines along Y) or 'Y' (plane Y = const, lines along X)
    const ashlar=(kind,c,a0,a1,z0,z1,course,block,w=MOR,ph=0)=>{ let k=ph; for(let Z=z0;Z<z1;Z+=course,k++){ if(kind==='X')L3([c,a0,Z],[c,a1,Z],w,{wav:0.5}); else L3([a0,c,Z],[a1,c,Z],w,{wav:0.5}); const zt=Math.min(Z+course,z1); for(let a=a0+((k%2)?block/2:0);a<a1;a+=block){ if(a<=a0)continue; if(kind==='X')L3([c,a,Z],[c,a,zt],w,{wav:0.4}); else L3([a,c,Z],[a,c,zt],w,{wav:0.4}); } } };

    // ================= SCENE: a loggia bay between two corner piers. Wall X = 0 (faces +X). Y runs right→left: pier R −60…100, column A 280, window 470…600, column B 640, door 850…980, pier L 1000…1080 =================
    // ---- wall (X = 0), ashlar courses ----
    face(rect(-80,-80,1100,V+80),C.blue,0.11,g=>{ bandE(g,[0,0,1262],[0,1,0],[0,0,-1],110,0.5,0,1.2); bandE(g,[0,0,200],[0,1,0],[0,0,1],40,0.3,0,1.2); for(const Yc of [280,640]){ const cx=iso(150,Yc,0)[0], hw=KW*55; lin(g,[cx-hw,0],[cx-hw-48,0],0.4,0,1.2); lin(g,[cx+hw,0],[cx+hw+30,0],0.25,0,1.2); } });
    ashlar('X',0,-300,1300,-800,1900,70,150);
    // ---- loggia window (between the columns) ----
    { const y0=470,y1=600,z0=520,z1=940, r=-40;
      face([iso(r,y1,z0),iso(0,y1,z0),iso(0,y1,z1),iso(r,y1,z1)],C.yel,0.15,g=>bandE(g,[0,y1,z0],[0,0,1],[-1,0,0],22,0.3,0)); L3([r,y1,z0],[r,y1,z1],DET);
      face([iso(r,y0,z0),iso(r,y1,z0),iso(r,y1,z1),iso(r,y0,z1)],C.blue,0.6,g=>{ bandE(g,[r,y0,z1],[0,1,0],[0,0,-1],80,0.35,0); bandE(g,[r,y1,z0],[0,0,1],[0,-1,0],30,0.2,0); });
      const ym=(y0+y1)/2; L3([r,ym,z0],[r,ym,z1],DET+1); L3([r,y0,730],[r,y1,730],DET+1); R3([[r,y0+14,z0+14],[r,y1-14,z0+14],[r,y1-14,z1-14],[r,y0+14,z1-14]],HAIR);
      for(let i=1;i<3;i++){ L3([r,y0+(ym-y0)*i/3,z0+14],[r,y0+(ym-y0)*i/3,z1-14],HAIR,{taper:true}); L3([r,ym+(y1-ym)*i/3,z0+14],[r,ym+(y1-ym)*i/3,z1-14],HAIR,{taper:true}); }
      face([iso(r,y0,z0),iso(0,y0,z0),iso(0,y1,z0),iso(r,y1,z0)],C.yel,0);
      const sh=(a,b)=>{ box(0,10,a,b,z0,z1,{x:FX(C.red,null,0.06),y:FY(C.red,0.2),top:T(C.red)},6); for(const [za,zb] of [[z0+14,z0+140],[z0+156,z1-156],[z1-140,z1-14]]){ R3([[10,a+9,za],[10,b-9,za],[10,b-9,zb],[10,a+9,zb]],DET); R3([[10,a+17,za+8],[10,b-17,za+8],[10,b-17,zb-8],[10,a+17,zb-8]],HAIR); sub(dc,[iso(10,a+17,za+8),iso(10,b-17,za+8),iso(10,b-17,zb-8),iso(10,a+17,zb-8)],g=>{ bandE(g,[10,a+17,zb-8],[0,1,0],[0,0,-1],12,0.4,0); bandE(g,[10,b-17,za+8],[0,0,1],[0,-1,0],8,0.3,0); }); } };
      sh(410,470); sh(600,660);
      box(0,40,390,680,940,990,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)}); R3([[40,515,940],[40,555,940],[40,565,990],[40,505,990]],DET); L3([40,390,962],[40,680,962],MOR,{wav:0.5}); L3([40,390,976],[40,680,976],HAIR,{wav:0.5}); L3([0,390,962],[40,390,962],MOR,{wav:0.4});
      box(0,40,390,680,470,520,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)}); L3([40,390,498],[40,680,498],MOR,{wav:0.5}); L3([40,390,484],[40,680,484],HAIR,{wav:0.5}); L3([0,390,498],[40,390,498],MOR,{wav:0.4}); }
    // ---- door ----
    { const y0=850,y1=980,z0=200,z1=900, r=-40;
      face([iso(r,y1,z0),iso(0,y1,z0),iso(0,y1,z1),iso(r,y1,z1)],C.yel,0.15,g=>bandE(g,[0,y1,z0],[0,0,1],[-1,0,0],22,0.3,0)); L3([r,y1,z0],[r,y1,z1],DET);
      face([iso(r,y0,z0),iso(r,y1,z0),iso(r,y1,z1),iso(r,y0,z1)],C.blue,0.6,g=>bandE(g,[r,y0,z1],[0,1,0],[0,0,-1],60,0.3,0));
      face([iso(r,y0,z0),iso(r,y1,z0),iso(r,y1,800),iso(r,y0,800)],C.red,0.04); R3([[r,y0,z0],[r,y1,z0],[r,y1,800],[r,y0,800]],6,{swell:true});
      const ym=(y0+y1)/2; for(const [a,b] of [[y0,ym],[ym,y1]])for(const [za,zb] of [[z0+22,z0+190],[z0+208,z0+400],[z0+418,800-20]]){ R3([[r,a+10,za],[r,b-10,za],[r,b-10,zb],[r,a+10,zb]],DET); R3([[r,a+18,za+8],[r,b-18,za+8],[r,b-18,zb-8],[r,a+18,zb-8]],HAIR); sub(dc,[iso(r,a+18,za+8),iso(r,b-18,za+8),iso(r,b-18,zb-8),iso(r,a+18,zb-8)],g=>{ bandE(g,[r,a+18,zb-8],[0,1,0],[0,0,-1],14,0.4,0); bandE(g,[r,b-18,za+8],[0,0,1],[0,-1,0],10,0.3,0); }); }
      L3([r,ym,z0],[r,ym,800],DET+1);
      L3([r,y0,800],[r,y1,800],DET); for(let i=1;i<7;i++)L3([r,y0+i*(y1-y0)/7,810],[r,y0+i*(y1-y0)/7,z1-8],HAIR,{taper:true});
      box(0,20,830,850,z0,900,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)},6); box(0,20,980,1000,z0,900,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)},6); L3([20,836,z0],[20,836,900],HAIR,{wav:0.4}); L3([20,994,z0],[20,994,900],HAIR,{wav:0.4});
      box(0,30,820,1010,900,945,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)}); L3([30,820,922],[30,1010,922],MOR,{wav:0.5}); L3([30,820,935],[30,1010,935],HAIR,{wav:0.5}); L3([0,820,922],[30,820,922],MOR,{wav:0.4}); }
    // ---- string course along the wall and a relief panel over the door ----
    box(0,22,100,1000,1010,1040,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)},6); L3([22,100,1024],[22,1000,1024],HAIR,{wav:0.5});
    { const y0=850,y1=980,z0=1070,z1=1200; face([iso(-14,y1,z0),iso(0,y1,z0),iso(0,y1,z1),iso(-14,y1,z1)],C.yel,0.15); face([iso(-14,y0,z0),iso(-14,y1,z0),iso(-14,y1,z1),iso(-14,y0,z1)],C.blue,0.35,g=>bandE(g,[-14,y0,z1],[0,1,0],[0,0,-1],26,0.3,0)); L3([-14,y1,z0],[-14,y1,z1],DET); R3([[-14,y0+14,z0+14],[-14,y1-14,z0+14],[-14,y1-14,z1-14],[-14,y0+14,z1-14]],HAIR); R3([[-14,y0+26,z0+26],[-14,y1-26,z0+26],[-14,y1-26,z1-26],[-14,y0+26,z1-26]],HAIR); R3([[0,y0-10,z0-10],[0,y1+10,z0-10],[0,y1+10,z1+10],[0,y0-10,z1+10]],DET); }
    // ---- base wall with arch (under the slab), Y 100…1000 ----
    { const acy=480, acz=-60, ri=120, ro=162;
      box(0,300,100,1000,-800,150,{x:FX(C.blue,g=>{ for(let Z=-780;Z<150;Z+=90)bandE(g,[300,0,Z],[0,1,0],[0,0,-1],22,0.5,0,1.1); })},7);
      for(let Z=-780;Z<150;Z+=90){ const k=(Z+780)/90; L3([300,100,Z],[300,1000,Z],5,{wav:0.5}); L3([300,100,Z+12],[300,1000,Z+12],HAIR,{wav:0.5}); for(let j=0;j<7;j++){ const Y=100+j*180+(k%2)*90+40; if(Y>=1000)continue; if(Y>acy-ro-20&&Y<acy+ro+20&&Z>-330)continue; L3([300,Y,Z],[300,Y,Z+90],5); L3([300,Y+12,Z+12],[300,Y+12,Z+90],HAIR,{wav:0.4}); } }
      const arc=(r,a0,a1,n)=>{ const P=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; P.push([300,acy+Math.cos(a)*r,acz+Math.sin(a)*r]); } return P; };
      const RC=arc(ri,0,Math.PI,40).concat([[300,acy-ri,-800],[300,acy+ri,-800]]); face(RC.map(q=>iso(...q)),C.blue,0.55,g=>bandE(g,[300,acy,acz+ri],[0,1,0],[0,0,-1],120,0.3,0));
      const VB=arc(ro,0,Math.PI,56).concat(arc(ri,Math.PI,0,40)); face(VB.map(q=>iso(...q)),C.yel,0.10,g=>bandE(g,[300,acy,acz+ro],[0,1,0],[0,0,-1],14,0.3,0));
      face([iso(300,acy-ro,acz),iso(300,acy-ri,acz),iso(300,acy-ri,-800),iso(300,acy-ro,-800)],C.yel,0.10); face([iso(300,acy+ri,acz),iso(300,acy+ro,acz),iso(300,acy+ro,-800),iso(300,acy+ri,-800)],C.yel,0.10);
      for(let i=0;i<=12;i++){ const a=i*Math.PI/12; L3([300,acy+Math.cos(a)*ri,acz+Math.sin(a)*ri],[300,acy+Math.cos(a)*ro,acz+Math.sin(a)*ro],DET,{wav:0.4}); }
      for(let Z=acz-60;Z>-800;Z-=90){ L3([300,acy-ro,Z],[300,acy-ri,Z],DET,{wav:0.4}); L3([300,acy+ri,Z],[300,acy+ro,Z],DET,{wav:0.4}); }
      line([[300,acy+ro,-800],[300,acy+ro,acz]].concat(arc(ro,0,Math.PI,56)).concat([[300,acy-ro,-800]]).map(q=>iso(...q)),7); line(arc(ro-12,0,Math.PI,56).map(q=>iso(...q)),MOR,{wav:0.4});
      line([[300,acy+ri,-800],[300,acy+ri,acz]].concat(arc(ri,0,Math.PI,40)).concat([[300,acy-ri,-800]]).map(q=>iso(...q)),6); }
    // ---- slab / floor ----
    const FLOOR=box(0,300,100,1000,150,200,{top:T(C.pink,0.05,g=>{ bandE(g,[0,100,200],[0,1,0],[1,0,0],26,0.25,0); bandE(g,[250,100,200],[0,1,0],[-1,0,0],30,0.3,0); }),x:FX(C.yel)},7);
    for(let X=30;X<300;X+=60)L3([X,100,200],[X,1000,200],DET,{clip:FLOOR.tp,wav:0.5}); for(let Y=130;Y<1000;Y+=60)L3([0,Y,200],[300,Y,200],DET,{clip:FLOOR.tp,wav:0.5});
    L3([300,100,176],[300,1000,176],MOR,{wav:0.5}); L3([300,100,162],[300,1000,162],HAIR,{wav:0.5});
    // ---- columns (axis X = 150): plinth, tori, fluted shaft, astragal, echinus, Ionic volute block, abacus ----
    const column=(Yc)=>{ const XC=150, R=55; const cx=iso(XC,Yc,0)[0]; const yz=z=>iso(XC,Yc,z)[1]; const hw=KW*R;
      box(XC-75,XC+75,Yc-75,Yc+75,200,236,{x:FX(C.blue),y:FY(C.blue,0.3),top:T(C.blue,0.05,g=>lin(g,[cx-KW*72,0],[cx-KW*72-40,0],0.3,0))},7);
      const ring=(z0,z1,r,lw,d0=0.5)=>{ const P=cyl(XC,Yc,r,z0,z1); const rx=KW*r, ry=KE*r; face(P,C.blue,0,g=>{ lin(g,[cx-rx,0],[cx+rx,0],d0,0,1.5); lin(g,[0,yz(z0)+ry],[0,yz(z0)-ry*0.6],0.35,0); }); line(P,lw,{closed:true}); line(frontArc(XC,Yc,z1,r),DET,{swell:false}); return rx; };
      ring(236,268,72,7); ring(268,282,60,5.5);
      const SH=[[cx-hw,yz(1130)],[cx+hw,yz(1130)],[cx+hw,yz(282)],[cx-hw,yz(282)]];
      const ks=[-1,-0.8,-0.6,-0.4,-0.2,0,0.2,0.4,0.6,0.8,1];
      face(SH,C.blue,0,g=>{ lin(g,[cx-hw,0],[cx+hw,0],0.34,0,3.0); lin(g,[cx+hw*0.7,0],[cx+hw,0],0,0.14); lin(g,[0,yz(282)],[0,yz(320)],0.15,0); lin(g,[0,yz(1130)],[0,yz(1092)],0.3,0);
        for(let i=0;i<ks.length-1;i++){ const xa=cx+ks[i]*hw, xb=cx+ks[i+1]*hw; const t=(i+0.5)/(ks.length-1); sub(g,rect(xa,yz(1132),xb,yz(280)),x=>lin(x,[xa,0],[xb,0],0.34*(1-0.8*t),0,2.6)); } });
      line([[cx-hw,yz(283)],[cx-hw,yz(1132)]],9,{wav:0.7}); line([[cx+hw,yz(283)],[cx+hw,yz(1132)]],6.5,{wav:0.7});
      for(let i=1;i<ks.length-1;i++)line([[cx+ks[i]*hw,yz(1118)],[cx+ks[i]*hw,yz(296)]],4.5,{taper:true,wav:0.5});
      ring(1130,1142,60,5.5); ring(1142,1180,66,6,0.38);
      { const yf=z=>iso(XC+R,Yc,z)[1]; const cx=iso(XC+R,Yc,0)[0]; const hv=hw+30, top=yf(1240), bot=yf(1180), rv=Math.min(25,(bot-top)/2-0.5), ym=(top+bot)/2; const P=[[cx-hv+rv,top],[cx+hv-rv,top]]; for(let i=0;i<=14;i++){ const a=-Math.PI/2+Math.PI*i/14; P.push([cx+hv-rv+Math.cos(a)*rv,ym+Math.sin(a)*rv]); } P.push([cx-hv+rv,bot]); for(let i=0;i<=14;i++){ const a=Math.PI/2+Math.PI*i/14; P.push([cx-hv+rv+Math.cos(a)*rv,ym+Math.sin(a)*rv]); }
        face(P,C.blue,0.03,g=>{ lin(g,[cx-hv,0],[cx-hv+2*rv,0],0.4,0,1.3); lin(g,[cx+hv,0],[cx+hv-1.2*rv,0],0.22,0,1.3); lin(g,[0,top],[0,top+9],0.3,0); lin(g,[0,bot],[0,bot-10],0.25,0); }); line(P,6.5,{closed:true});
        const spiral=(sx,sy,r0,turns,dir)=>{ const Q=[]; const n=44; for(let i=0;i<=n;i++){ const t=i/n; const a=-Math.PI/2+dir*t*turns*2*Math.PI; const r=r0*(1-0.82*t); Q.push([sx+Math.cos(a)*r,sy+Math.sin(a)*r]); } line(Q,DET,{taper:true,wav:0.15,step:3,join:false}); };
        spiral(cx-hv+rv,ym,rv-4,1.75,-1); spiral(cx+hv-rv,ym,rv-4,1.75,1); line([[cx-hv+2*rv,top+3],[cx+hv-2*rv,top+3]],HAIR,{wav:0.3}); line([[cx-hv+2*rv,ym+8],[cx+hv-2*rv,ym+8]],HAIR,{wav:0.3});
        for(const k of [-0.4,0,0.4])line([[cx+k*hw*0.8,ym+12],[cx+k*hw*0.8,bot-4]],HAIR,{taper:true,wav:0.2}); }
      box(XC-70,XC+70,Yc-72,Yc+72,1240,1262,{x:FX(C.blue),y:FY(C.blue,0.3),top:T(C.blue)},6); L3([220,Yc-72,1252],[220,Yc+72,1252],HAIR,{wav:0.4}); };
    column(280); column(640);
    // ---- balustrade at the front edge, X 250…290, Y 160…600, newel at the right end ----
    box(250,290,200,600,200,236,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)},6); L3([290,200,218],[290,600,218],MOR,{wav:0.5});
    { const prof=[[0,11],[0.07,11],[0.12,7],[0.22,8],[0.4,11],[0.58,17],[0.74,14],[0.85,8],[0.9,12],[1,12]]; const rOf=t=>{ for(let i=1;i<prof.length;i++){ if(t<=prof[i][0]){ const [t0,r0]=prof[i-1],[t1,r1]=prof[i]; const u=(t-t0)/(t1-t0); return r0+(r1-r0)*(u*u*(3-2*u)); } } return 14; };
      for(let k=0;k<7;k++){ const Y=230+k*55; const cx=iso(270,Y,0)[0]; const yOf=z=>iso(270,Y,z)[1]; const P=[]; const n=36; for(let i=0;i<=n;i++){ const t=i/n; P.push([cx+KW*rOf(t),yOf(350-114*t)]); } for(let i=n;i>=0;i--){ const t=i/n; P.push([cx-KW*rOf(t),yOf(350-114*t)]); }
        face(P,C.pink,0.04,g=>lin(g,[cx-17*KW,0],[cx+17*KW,0],0.35,0,1.4)); line(P,5,{closed:true}); for(const t of [0.09,0.38,0.86]){ const r=KW*rOf(t); line([[cx-r,yOf(350-114*t)],[cx+r,yOf(350-114*t)]],MOR,{wav:0.3}); } } }
    box(250,290,200,600,350,380,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)},6); L3([290,200,365],[290,600,365],MOR,{wav:0.5});
    box(245,295,160,200,200,400,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)},6.5); box(240,300,155,205,400,420,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)},6); R3([[295,166,215],[295,194,215],[295,194,385],[295,166,385]],HAIR);
    // ---- piers (R and L), full depth, ashlar on both faces ----
    const pier=(y0,y1)=>{ box(0,300,y0,y1,-800,1250,{x:Object.assign(FX(C.blue,null),{corner:true}),y:FY(C.yel,0.16,g=>{ for(let Z=-740;Z<1250;Z+=60)bandE(g,[0,y0,Z],[1,0,0],[0,0,-1],12,0.3,0,1.1); })},7); ashlar('X',300,y0,y1,-800,1250,60,(y1-y0)); ashlar('Y',y0,0,300,-800,1250,60,100); };
    pier(-60,100); pier(1000,1080);
    // ---- entablature, flush with the column fronts: architrave (blue, 3 fasciae), frieze (blue, medallion), dentil row (yellow), cornice (yellow) ----
    box(0,220,-60,1080,1262,1312,{x:FX(C.blue,g=>bandE(g,[220,0,1312],[0,1,0],[0,0,-1],16,0.25,0)),y:FY(C.yel)},7); for(const Z of [1276,1292,1306])L3([220,-60,Z],[220,1080,Z],Z===1306?DET:MOR,{wav:0.5});
    box(0,220,-60,1080,1312,1392,{x:FX(C.blue,g=>bandE(g,[220,0,1392],[0,1,0],[0,0,-1],34,0.4,0)),y:FY(C.yel)},7);
    { const Yc=535, Zc=1336; const cp=(rY,rZ,n)=>{ const P=[]; for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2; P.push(iso(220,Yc-Math.sin(a)*rY,Zc+Math.cos(a)*rZ)); } return P; };
      const ring=cp(52,64,72), dial=cp(38,47,64); face(ring,C.yel,0.06,g=>{ const c=iso(220,Yc,Zc); lin(g,[c[0]-34,c[1]-46],[c[0]-52,c[1]-66],0,0.3); }); face(dial,C.blue,0,g=>{ const c=iso(220,Yc,Zc); lin(g,[c[0]-30,c[1]-36],[c[0]+22,c[1]+24],0.55,0,1.3); });
      line(ring,6.5,{closed:true}); line(cp(46,57,72),HAIR,{closed:true,swell:false}); line(dial,5,{closed:true,swell:false});
      for(let i=0;i<12;i++){ const a=i*Math.PI/6; L3([220,Yc-Math.sin(a)*30,Zc+Math.cos(a)*38],[220,Yc-Math.sin(a)*35,Zc+Math.cos(a)*45],HAIR,{wav:0.2,taper:true}); }
      const hand=(a,len,w0)=>{ const dY=-Math.sin(a),dZ=Math.cos(a); const nY=dZ,nZ=-dY; const P=[[220,Yc+nY*w0/2,Zc+nZ*w0/2],[220,Yc+dY*len,Zc+dZ*len],[220,Yc-nY*w0/2,Zc-nZ*w0/2],[220,Yc-dY*5,Zc-dZ*5]].map(q=>iso(...q)); path(ink,P); ink.fill(); };
      hand(Math.PI*2*(10/12),27,6); hand(Math.PI*2*(2/12),37,5); const c=iso(220,Yc,Zc); ink.beginPath(); ink.arc(c[0],c[1],4,0,Math.PI*2); ink.fill(); }
    box(0,236,-60,1080,1392,1416,{x:FX(C.yel),y:FY(C.yel)},6);
    for(let Y=-60;Y<1080;Y+=30){ const g=[iso(236,Y+18,1395),iso(236,Y+30,1395),iso(236,Y+30,1414),iso(236,Y+18,1414)]; path(ink,g); ink.fill(); }
    box(0,246,-60,1080,1416,1444,{x:FX(C.yel),y:FY(C.yel),top:T(C.yel)},7); L3([246,-60,1430],[246,1080,1430],MOR,{wav:0.5}); L3([246,-60,1420],[246,1080,1420],HAIR,{wav:0.5});
    // ---- steps down from the loggia front (X 300…450) ----
    for(let k=0;k<2;k++){ const X0=300+75*k, Z1=150-75*k, Z0=k<1?Z1-75:-800; box(X0,X0+75,700,900,Z0,Z1,{top:T(C.yel,0,g=>bandE(g,[X0,700,Z1],[0,1,0],[1,0,0],18,0.35,0)),x:FX(C.blue,g=>bandE(g,[X0+75,700,Z1],[0,1,0],[0,0,-1],22,0.4,0)),y:FY(C.yel)},7); L3([X0+66,700,Z1],[X0+66,900,Z1],MOR,{wav:0.4}); L3([X0+75,700,Z1-14],[X0+75,900,Z1-14],HAIR,{wav:0.4}); }

    // ================= STIPPLE PASS (density map → spatter) =================
    const W=canvas.width, Hh=canvas.height; const u=S*dpr; const ss=Math.max(1,Math.ceil(2.6/(1.85*u))); const WW=W*ss, HH=Hh*ss, uu=u*ss;
    let D; if(ss>1){ const dw=document.createElement('canvas'); dw.width=WW; dw.height=HH; const dx=dw.getContext('2d',{willReadFrequently:true}); dx.imageSmoothingEnabled=true; dx.imageSmoothingQuality='high'; dx.drawImage(dc.canvas,0,0,WW,HH); D=dx.getImageData(0,0,WW,HH).data; } else D=dc.getImageData(0,0,W,Hh).data;
    const A=new Float32Array(WW*HH);
    const rBase=1.2*uu; // ref dots ≈ 2.6 u across (1 px at 540, drawn crisp)
    const stamp=(cx,cy,r)=>{ const x0=Math.max(0,Math.floor(cx-r-1)), x1=Math.min(WW-1,Math.ceil(cx+r+1)), y0=Math.max(0,Math.floor(cy-r-1)), y1=Math.min(HH-1,Math.ceil(cy+r+1)); for(let y=y0;y<=y1;y++){ const dy=y+0.5-cy; for(let x=x0;x<=x1;x++){ const dx=x+0.5-cx; const c=r+0.5-Math.sqrt(dx*dx+dy*dy); if(c>0){ const i=y*WW+x; const v=A[i]+(c>1?1:c); A[i]=v>1?1:v; } } } };
    const dotArea=Math.PI*rBase*rBase*1.12; // mean area incl. size jitter and clumps
    const NG=Math.ceil(WW/(8*uu))+2, NGY=Math.ceil(HH/(8*uu))+2; const NZ=new Float32Array(NG*NGY); for(let i=0;i<NZ.length;i++)NZ[i]=rnd();
    const vn=(x,y)=>{ const fx=x/(8*uu), fy=y/(8*uu); const ix=fx|0, iy=fy|0, tx=fx-ix, ty=fy-iy; const i=iy*NG+ix; const a=NZ[i],b=NZ[i+1],c=NZ[i+NG],d=NZ[i+NG+1]; return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty; };
    for(let y=0;y<HH;y++){ const row=y*WW; for(let x=0;x<WW;x++){ const d=D[(row+x)*4]/255; if(d<0.004)continue; const e=d-0.75; const lam=(0.62*d+(e>0?4*e*e:0))*(0.75+0.5*vn(x,y)); const p=lam/dotArea; if(rnd()>=p)continue; let r=rBase*(0.82+0.36*rnd()); if(rnd()<0.10)r*=1.45; stamp(x+rnd(),y+rnd(),r); } }
    // box-filter the dot layer down to the plate and crisp it (a dot that covers ≥ 45 % of a plate pixel prints solid, like the reference's hard 1-px dots)
    const dots=new ImageData(W,Hh); const dd=dots.data; const inv=1/(ss*ss);
    for(let y=0;y<Hh;y++){ for(let x=0;x<W;x++){ let a=0; for(let j=0;j<ss;j++){ const row=(y*ss+j)*WW+x*ss; for(let i=0;i<ss;i++)a+=A[row+i]; } a*=inv; let t=(a-0.16)/0.3; t=t<0?0:t>1?1:t; t=t*t*(3-2*t); dd[(y*W+x)*4+3]=(t*255)|0; } }
    const tmp=document.createElement('canvas'); tmp.width=W; tmp.height=Hh; tmp.getContext('2d').putImageData(dots,0,0);
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctx.drawImage(tmp,0,0); ctx.drawImage(ink.canvas,0,0); ctx.restore();
    }
  },

  points: [
{u:0.569,v:0.424,d:'KEY', label:'Brush contour · 9 u shadow edge, 6.5 u lit, +35 % at joins', t:'contour', dir:[-1,0]},
    {u:0.298,v:0.335,d:'MARK',label:'Fluted shaft · 0.34 → 0 ramp + 0.34 sawtooth per flute', t:'stipple-cylinder', dir:[-1,1]},
    {u:0.554,v:0.169,d:'TEX', label:'Half-lit wall · 0.11 field, 0.5 → 0 band under the beam', t:'stipple-field', dir:[1,-1]},
    {u:0.237,v:0.450,d:'FILL',label:'Red door · #FF4C01 flat, 0.4 band inside each panel', t:'flat-fill', dir:[-1,0]},
    {u:0.907,v:0.460,d:'TONE',label:'Yellow return · 0.14 field + 0.42 → 0 edge bands, reads olive', t:'yellow-return', dir:[-1,-1]},
    {u:0.371,v:0.087,d:'COL', label:'Four inks only · yellow oval, blue dial, black hands', t:'palette', dir:[1,1]},
    {u:0.458,v:0.640,d:'MARK',label:'Pink baluster · 0.35 → 0 ramp, rings at neck and belly', t:'baluster', dir:[1,-1]},
    {u:0.243,v:0.622,d:'GRND',label:'Pink floor · #FF868F, 0.05 field, 4.5 u grid on both axes', t:'floor-grid', dir:[-1,1]},
    {u:0.142,v:0.712,d:'FORM',label:'Dimetric corner · façade −12°, depth +30° × 0.8, Z vertical', t:'projection', dir:[1,1]},
    {u:0.560,v:0.866,d:'KEY', label:'Rusticated base · 5 u joints, 3.6 u bevel line, stipple chamfer', t:'rustication', dir:[1,-1]}
  ],

  spec: {
id:'st-05',
    reference:{ file:'ref-05.png', px:[1200,1999], measured_at:540, grammar:'flat four-ink façade fragment, black brush contour, black spatter stipple for shading, near-frontal dimetric construction', measured:{ axes_deg:{ facade:-12, depth:30, verticals:90, method:'structure-tensor orientation histogram of dark edges at 540 px: peaks at 10–15° (down-right) and 145–150° (up-right 30°)' }, stroke_px_540:{ mortar:2, detail:'2–2.5', contour:'4–5', swell:'5.7–8 at shadow sides and joins', ridge_width_percentiles:'p25 4, p50 4, p90 5.7, p97 8' }, stipple:{ dot_px_540:1, density:{ blue_front:'0.07–0.10', yellow_return:'0.15 mid, 0.40–0.45 at the edges', shaft_edge:'0.55–0.70', pink_floor:0.05, red_panels:0.33 } }, black_area:0.372, line_share_96px:0.357 } },
    palette:{ black:'#000000', blue:'#D2F1F3', yellow:'#FFFF01', pink:'#FF868F', red:'#FF4C01' },
    ground:{ colour:'none — the picture is edge-to-edge fills; the blue wall (#D2F1F3) acts as ground', area_ref:{ black_incl_stipple:0.372, blue:0.27, yellow:0.15, stippled_yellow:0.12, pink:0.05, red:0.02 } },
    units:'design units, 1000 = plate width, frame 1000 × 1666; scene units × 0.85 (1 u = 0.54 ref px at 540, 1.2 px at 1200)',
    techniques:[
      { id:'contour', short:'KEY', name:'Brush-ink contour', layer:4, pass:4,
        params:{ colour:'#000000', box_silhouette_u:8, box_inner_edge_u:6.9, column_edge_u:[9,6.5], detail_u:4.5, mortar_u:4.2, hairline_u:3.6, ref_equiv_px_540:{ silhouette:'4.3 (+50 % shadow side, +35 % joins → 6.5–8.7)', detail:2.4, mortar:2.3 }, shadow_swell:'×(1 + 0.5·max(0, −n·light))', join_swell:'×(1 + 0.35·(1 − d/12 u)) within 12 u of a corner > 23°', light_dir:[0.71,-0.71], width_noise:0.22, waver_amp_u:0.9, waver_freq:0.02, taper:'open lines: soft (to 55 % over min(14 u, 25 %)); flutes, spirals, bars: full taper to 0 over min(30 u, 30 %), exponent 0.6', ref_px_540:{ mortar:2, detail:'2–2.5', contour:'4–5', swell:'5.7–8' }, join:'round', ends:'tapered' },
        implementation:'Every edge is resampled at 7 u, displaced along its normal by a 3-octave sine noise (0.9 u), then filled as a variable-width ribbon (outer + inner offset polylines, even-odd) whose width = base·(1+0.22·noise)·taper·(1+0.5·max(0,−n·light))·(1+0.35·cornerProximity), so edges facing down-left and every corner run heavier; the ink layer under every later face is erased (destination-out) so occluded lines vanish.' },
      { id:'stipple-cylinder', short:'MARK', name:'Fluted-shaft stipple', layer:3, pass:3,
        params:{ dot_radius_u:'1.2 × (0.82–1.18), 10 % clumps ×1.45', dot_diameter_u:'≈ 2.6 (1.4 px at 540, 3.1 px at 1200)', coverage:'λ = 0.62·d + 4·max(0,d−0.75)² expected black area per px, dots placed as a Poisson process p = λ / mean dot area', modulation:'value noise on an 8 u grid, ×(0.75 … 1.25)', crisp:'plate-pixel coverage a → smoothstep((a − 0.16)/0.30): a dot covering ≥ 46 % of a plate pixel prints solid, matching the reference’s hard 1-px dots', shaft_ramp:'0.34·(1−u)^3 across the apparent width (u = 0 at the shadow/left edge) + 0.14 rim at u > 0.7', flute_sawtooth:'10 flutes between 9 lines at k = −0.8 … 0.8 of the half-width; each flute 0.34·(1−0.8·t)·(1−v)^2.6, v = 0 at its left line, t = 0 at the shadow side', neck_bands:'0.3 → 0 over 38 u under the astragal, 0.15 → 0 over 30 u above the base', torus_ramp:'0.5 → 0 pow 1.5 + 0.35 → 0 under the belly', capital:{ astragal:'r 60, Z 1130…1142', echinus:'r 66, Z 1142…1180, ramp 0.38 → 0', volute_block:'rounded slab in the shaft-front plane, Z 1180…1240, half-width hw + 30, end radius 25, 0.4 → 0 band at the shadow end, two 1.75-turn spirals 4.5 u tapered, two 3.6 u fillets', abacus:'box 140 × 144 × 22' }, apparent_half_width:'1.199·r (dimetric horizontal circle), cap semi-minor 0.451·r', fluting_lines:'9 × 4.5 u, full taper', mask:'density painted inside the face clip only', supersample:'work canvas scaled so a dot is ≥ 2.6 px, then box-filtered down' },
        implementation:'The shaft is filled blue and a horizontal grey gradient plus ten per-flute sawtooth gradients are painted into the density map inside the shaft clip; the global pass reads the map (upscaled so dots stay ≥ 2.6 px), keeps each work pixel with probability λ/dotArea and stamps an anti-aliased disc, then the dot layer is box-filtered to the plate, crisped with a smoothstep on coverage and composited as black.' },
      { id:'stipple-field', short:'TEX', name:'Half-lit front field', layer:3, pass:3,
        params:{ density_front:0.10, density_wall:0.11, on:['wall (X = 0)','+X faces of every box (blue and yellow)','risers','recess backs 0.6','reveals 0.15'], lit_faces:'tops 0 (yellow), floor 0.05', pier_corner:'0.25 → 0 over 40 u beside the return edge', column_halo:'0.4 → 0 over 48 u on the shadow side, 0.25 → 0 over 30 u lit side', under_beam:'0.5 → 0 over 110 u', under_cornice:'0.4 → 0 over 34 u on the frieze, 0.25 → 0 over 16 u on the architrave', under_sill:'0.3 → 0 over 22 u', wall_base:'0.3 → 0 over 40 u', ashlar:'courses every 70 (4.2 u), staggered joints every 150' },
        implementation:'Half-lit faces get a uniform 0.10–0.11 in the density map; additive (lighter) gradient bands are laid from 3-D edges with bandE(), which takes the edge and an into-face direction and builds the band perpendicular to the projected edge so its iso-lines stay parallel to the edge.' },
      { id:'flat-fill', short:'FILL', name:'Flat ink face', layer:1, pass:1,
        params:{ inks:{ blue:'#D2F1F3', yellow:'#FFFF01', pink:'#FF868F', red:'#FF4C01' }, assignment:'blue = wall, fronts of piers/base/architrave/frieze, shafts, capitals, plinths, risers, relief-panel field; yellow = every top, every right-hand return (−Y) face, cornice, dentil row, string course, sills, lintels, jambs, rails, newel, medallion ring, reveals; pink = floor, balusters; red = shutters and door', shutter:{ leaf_depth:10, panels:3, mouldings_u:[4.5,3.6] }, door:{ leaf:'red, X = −40, 2 × 3 panels, 0.4 band inside each panel', transom:'dark 0.6 with 6 tapered bars' } },
        implementation:'Each face is a closed polygon filled with one of the four hexes; the ink layer under it is erased so occluded lines vanish, then the face paints its own density before its own detail lines are drawn.' },
      { id:'yellow-return', short:'TONE', name:'Stippled yellow return', layer:3, pass:3,
        params:{ base:0.14, front_edge_band:'0.42 → 0 over min(70 u, half the face width), pow 1.3', back_edge_band:'0.32 → 0 over 0.8 × that', top_band:'0.25 → 0 over min(40 u, 40 % of the height)', course_bands:'0.3 → 0 over 12 u under every pier course (60 u pitch)', on:'every −Y (right-facing) return: both piers, step returns, rail and newel ends, jamb/lintel/sill ends, shutter edges (red, 0.2)', reads_as:'olive — yellow under 25–45 % black', tops:'0 (sunlit) except cast bands' },
        implementation:'box() resolves a {ret:true} face spec into the yellow fill plus a uniform 0.14 and three additive edge bands laid with bandE() from the face’s own 3-D edges, so the spatter is densest against the contour and thins toward the middle of the face.' },
      { id:'projection', short:'FORM', name:'Near-frontal dimetric', layer:0, pass:0,
        params:{ type:'parallel dimetric, verticals vertical (not the 30°/30° isometric the AD assumed — the pixels disagree)', screen:'sx = 945 − (Y·cos12° + X·cos30°·0.8)·0.85, sy = 1300 + (X·sin30°·0.8 − Y·sin12° − Z)·0.85', axes_deg:{ Y_facade:'−12 (runs left along the façade, rising 12°; a façade horizontal falls 12° to the right)', X_depth:'+30 (toward the viewer, down-left at 30°; the receding depth rises 30° to the right)', Z:'90 (vertical)' }, foreshortening:{ X:0.8, Y:1.0, Z:1.0, scale:0.85 }, visible_faces:['top (+Z)','front (+X, faces the viewer down-left)','return (−Y, the right-hand side of every mass)'], hidden:'−X backs, +Y left sides, undersides', circles:'horizontal circle → tilted ellipse: apparent half-width 1.199 r, semi-minor 0.451 r, left tangent at circle angle atan2(cos12°, cos30°·0.8) = 54.7°', measured:'reference orientation peaks at 10–15° (façade horizontals, down-right) and 145–150° (depth, up-right 30°) on the floor, balustrade, slab and base; the upper façade drifts toward horizontal by hand (5–20°); foreshortening 0.8 estimated from the floor tiles', scene:{ wall:'X = 0', piers:'X 0…300 at Y −60…100 (right) and 1000…1080 (left)', columns:'axis X = 150, Y = 280 and 640, r 55, Z 200…1262', window:'Y 470…600, Z 520…940, reveal X −40', door:'Y 850…980, Z 200…900, leaf X −40', string_course:'X 0…22, Z 1010…1040', relief_panel:'Y 850…980, Z 1070…1200, X −14', floor:'Z = 200, X 0…300, Y 100…1000', balustrade:'X 250…290, Y 200…600, newel 160…200', entablature:'architrave/frieze X 0…220, dentils 0…236, cornice 0…246, Z 1262…1444', steps:'X 300…450 in 75 × 75 treads, Y 700…900', base:'Z −800…150 with arch r 120/162 at Y 480' } },
        implementation:'One iso(X,Y,Z) maps every point; boxes are three parallelograms (top, +X front, −Y return) drawn back to front, then a hexagonal silhouette contour and three inner edges from the interior vertex (X1, Y0, Z1); cylinders are the projected front arc at the base, two vertical tangents at ±1.199 r and the projected back arc at the top.' },
      { id:'palette', short:'COL', name:'Four-ink colour system', layer:1, pass:1,
        params:{ black:'#000000', blue:'#D2F1F3', yellow:'#FFFF01', pink:'#FF868F', red:'#FF4C01', rule:'black stipple over any ink where the face is shaded or half-lit; only tops and the clean trims stay pure', medallion:{ ring:'#FFFF01 oval rY 52 / rZ 64 in the frieze plane (X = 220), 6.5 u contour + 3.6 u inner line', dial:'#D2F1F3 rY 38 / rZ 47, diagonal ramp 0.55 → 0', ticks:'12 × 3.6 u', hands:'tapered black ribbons 6→0 (27 u) and 5→0 (37 u), hub r 4' } },
        implementation:'No mixed colours anywhere; every midtone in the picture is black dots over a flat ink, so the colour histogram stays five-peaked.' },
      { id:'baluster', short:'MARK', name:'Turned baluster', layer:2, pass:2,
        params:{ colour:'#FF868F', pitch:55, count:7, height:114, axis:'X = 270, Y 230…560', half_widths:'top 11, neck 7 @0.12, belly 17 @0.58, waist 8 @0.85, foot 12 (×1.199 apparent)', density:'0.04 + 0.35 → 0 across, pow 1.4', contour_u:5, rings:'4.2 u at t 0.09, 0.38, 0.86', rails:'Z 200…236 and 350…380, yellow, 4.2 u moulding line, returns stippled', newel:'50 × 40 × 200 with a 60 × 50 × 20 cap, 3.6 u panel line', floor_band:'0.3 → 0 over 30 u behind the rail' },
        implementation:'A vase profile r(t) (smoothstep between knots) is mirrored into a closed polygon about the axis’ projected x, filled pink with a left-heavy horizontal density ramp; the pink floor behind the row carries a cast band.' },
      { id:'floor-grid', short:'GRND', name:'Pink tile floor', layer:1, pass:1,
        params:{ colour:'#FF868F', density:0.05, line_u:4.5, set_x:'lines along X every 60 units (30° family)', set_y:'lines along Y every 60 (−12° family)', clip:'top face of the slab (Z = 200)', wall_shadow:'0.25 over 26 u along the wall base', slab_edge:'yellow +X band Z 150…200 with 4.2 u and 3.6 u moulding lines, 0.10 field' },
        implementation:'The slab top is filled pink, then two families of axis lines are ribbon-stroked with the ink clipped to the face polygon; later faces erase what they cover.' },
      { id:'rustication', short:'KEY', name:'Rusticated base', layer:2, pass:2,
        params:{ colour:'#D2F1F3', base_density:0.10, course:90, block:180, stagger:90, joint_u:5, bevel_line_u:'3.6, 12 u inside the joint', chamfer:'0.5 → 0 over 22 u below each course', arch:{ r_in:120, r_out:162, extrados_line:'4.2 u at r 150', voussoir_joints:13, jamb_joints:'every 90', recess_density:'0.55 + 0.3 band', ring_density:0.10 }, pier_grid:'courses every 60, blocks 160 (front) / 100 (return), staggered, 4.2 u, on both visible pier faces', wall_ashlar:'courses every 70, 4.2 u, joints staggered every 150', dentils:'solid ink gaps 12 × 19 u every 30 u under the cornice' },
        implementation:'Course joints and staggered verticals are ribbon lines (5 u) doubled by a 3.6 u bevel line over a sparse blue face; under each course a gradient band in the density map makes the stipple read as a chamfer; the arch is an annulus sector of yellow with radial joints over a dark stippled recess.' }
    ],
    pass_order:['faces back-to-front (wall + ashlar, loggia window + shutters, door, string course + relief panel, base + arch, slab/floor, columns, balustrade + newel, piers, entablature + medallion + dentils, steps) — each fills colour, erases ink beneath, paints density inside its own clip, draws its own detail lines','density map → per-pixel Poisson spatter on a supersampled work canvas (dot ≥ 2.6 px)','dot layer box-filtered to the plate, crisped, composited as black','ink layer (contours, fluting, joints, dentils, mouldings, spirals, hands) composited last'],
    notes:[ 'Reference measured at 540 px wide: mortar 2 px (3.7 u), contours 4–5 px (7–9 u), swell to 8 px, stipple dots 1 px, black area 0.372, line share at 96 px 0.357.', 'Pass 3 rebuild: projection re-measured (façade −12°, depth +30°, ×0.8 — not true isometric); every right-hand return is yellow under spatter; fronts 0.10; fluting 9 lines + per-flute sawtooth; Ionic volute capitals; dentils, fasciae, string course, relief panel; ashlar on every masonry face; join swell + soft taper on contours; dot layer crisped so spatter prints as hard dots.', 'Rebuild measured the same way: black area 0.39, line share at 96 px 0.30.', 'Line widths scale with the plate: at 700 css px @ dpr 2 a 4.5 u detail line is 6.3 px, a dot 3.6 px.', 'Seed 505.' ]
  }
});
