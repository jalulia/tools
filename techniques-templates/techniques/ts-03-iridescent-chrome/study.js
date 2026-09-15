window.STUDY={
  id:'ts-03-iridescent-chrome', code:'TS-03', fig:'1.3',
  title:'Iridescent chrome on black',
  kicker:'Technique · TS-03',
  lede:'A bent slab, normals mapped through a spectral LUT, film grain, split type.',
  body:[
    'Normal shading. A 300 × 160 u slab with 30 u fillets is swept along an L, twisted 31° and tilted 29° to camera, then rasterized to a per-pixel normal buffer. Each pixel reflects a 1-D environment: the vertical component of the reflected ray indexes a spectral LUT, so the fillets sweep the whole table in a few pixels and each flat face holds one band. Grazing normals take the edge color; a specular lobe adds white.',
    'Film grain sits over it — multiplicative on the chrome, additive on the black so the ground is never clean. The headline is Archivo 900 at width 62, each word drawn three times in red, green and blue with a lighter blend, offset 2.5 u: overlaps sum to white, edges fringe.'
  ],
  source:'Reference 03 · chrome slab poster, black ground, 1644 × 1568',
  spot:[110,199,209], ref:{w:1644,h:1568},
  variantLabel:'Color',
  variants:[
    { id:'ref', label:'As reference', sw:['#0D0E0E','#386EB2','#6EC7D1','#E3D672'], spot:[110,199,209], ground:'#0D0E0E', type:'#F3F3F3', edge:'#F0DC6A', specular:'#FFFFFF',
      lut:[[0,'#1E3A78'],[0.10,'#386EB2'],[0.22,'#6EC7D1'],[0.34,'#F2F4F0'],[0.44,'#E3D672'],[0.54,'#E8935C'],[0.64,'#D68FA8'],[0.76,'#9C64A4'],[0.88,'#3B5DAE'],[1,'#182A57']] },
    { id:'io',  label:'Ember spectrum', sw:['#101014','#F4551E','#2F5AE6','#FFFFFF'], spot:[244,85,30], ground:'#101014', type:'#FFFFFF', edge:'#FFFFFF', specular:'#FFFFFF',
      lut:[[0,'#101014'],[0.14,'#F4551E'],[0.34,'#2F5AE6'],[0.50,'#FFFFFF'],[0.66,'#2F5AE6'],[0.84,'#F4551E'],[1,'#101014']] },
    { id:'gray', label:'Chrome gray', sw:['#0D0E0E','#EAECEC','#8A8A8A'], spot:[234,236,236], ground:'#0D0E0E', type:'#EAECEC', edge:'#EAECEC', specular:'#FFFFFF',
      lut:[[0,'#0D0E0E'],[0.16,'#5A5C5C'],[0.32,'#EAECEC'],[0.46,'#8A8A8A'],[0.60,'#EAECEC'],[0.78,'#3A3B3B'],[1,'#0D0E0E']] }
  ],
  points:[
    {u:0.30,v:0.62,d:'LUT',label:'Spectral LUT · 10 stops, navy → blue → cyan → white → yellow → pink → magenta → navy',t:'spectral-lut',dir:[-1,-1]},
    {u:0.62,v:0.80,d:'NRML',label:'Inner wall · section 300 × 160 u, fillet 30 u; this face is the slab’s thickness',t:'normal-shading',dir:[1,1]},
    {u:0.46,v:0.55,d:'NRML',label:'Top face · t = 0.5 + 0.40·r.y + 0.16·r.x picks the band; tilt 29° puts it in the cyan half',t:'normal-shading',dir:[1,-1]},
    {u:0.20,v:0.86,d:'EDGE',label:'Edge band · |n.z| = 0.34 ± 0.06 painted yellow along every fillet',t:'edge-highlight',dir:[-1,1]},
    {u:0.34,v:0.57,d:'EDGE',label:'Specular lobe · (n·h)^60, light from upper left, peaks at the outer bend',t:'edge-highlight',dir:[-1,-1]},
    {u:0.60,v:0.30,d:'GRN',label:'Ground grain · additive, σ 14/255, per channel',t:'film-grain',dir:[1,-1]},
    {u:0.74,v:0.52,d:'GRN',label:'Chrome grain · multiplicative, amp 0.10, mono:false',t:'film-grain',dir:[1,-1]},
    {u:0.08,v:0.12,d:'TYPE',label:'Headline · Archivo 900, wdth 62, cap 142 u, line pitch 175 u',t:'display-headline',dir:[-1,-1]},
    {u:0.32,v:0.30,d:'SPLT',label:'Channel split · R −2.5 u, G 0, B +2.5 u, blend lighter → white where all three overlap',t:'channel-split-type',dir:[1,-1]},
    {u:0.80,v:0.41,d:'SPLT',label:'Small words · same split at 4 u, so the fringe is wider than the stem',t:'channel-split-type',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1644,1568], grammar:'black ground; one bent chrome slab shaded by a spectral gradient across its normals, thin yellow edge lines on every fillet; heavy film grain over everything; white condensed display headline; small words with split color channels' },
    units:'design units, 1000 = plate width (plate 1000 × 954)',
    palette:{ ground:'#0D0E0E', blue:'#386EB2', cyan:'#6EC7D1', white:'#F2F4F0', yellow:'#E3D672', pink:'#D68FA8', magenta:'#9C64A4', navy:'#182A57', type:'#F3F3F3' },
    techniques:[
      { id:'spectral-lut', short:'LUT', name:'Spectral look-up table', layer:2, pass:2, atoms:['lut','gradient','spectrum'],
        params:{ stops:10, order:'navy 0 · blue 0.10 · cyan 0.22 · white 0.34 · yellow 0.44 · orange 0.54 · pink 0.64 · magenta 0.76 · blue 0.88 · navy 1', measured_ref:'(56,110,178) (110,199,209) (242,241,242) (235,233,94) (214,153,172) (170,108,160)' },
        implementation:'ART.lut(stops) gives 256 colors; the shading pass indexes it with the environment coordinate t, so color is a function of normal direction only.' },
      { id:'normal-shading', short:'NRML', name:'Normal-buffer shading of a swept slab', layer:2, pass:1, atoms:['mesh','normal','zbuffer','sweep','twist'],
        params:{ section:'rounded rectangle 300 × 160 u, fillet 30 u, 56 points', sweep:'L path (−200,1040) → (330,470) → (1200,780), bend radius 230 u, 260 steps', twist_rad:'−0.22 + 0.55·s', tilt_rad:'0.5 about the screen x axis through y = 740 u', env:'t = clamp(0.5 + 0.40·r.y + 0.16·r.x), r = reflect(view, n)', wobble:'n += 0.20–0.22·sin/cos fields of period 260–420 u plus 0.06–0.08 at 90–120 u, then normalise' },
        implementation:'Vertices P = C(s) + a·e1 + b·e2 with the section basis rotated by the twist; normals from the cross product of finite differences; triangles rasterized with edge functions into normal + depth buffers; per pixel the reflected ray of the orthographic view picks LUT[t].' },
      { id:'edge-highlight', short:'EDGE', name:'Edge band and specular lobe', layer:2, pass:3, atoms:['rim','specular','band'],
        params:{ band_center_nz:0.34, band_width:0.06, band_colour:'#F0DC6A', band_mix:1, light:'(−0.35,−0.60,0.72)', spec_power:60, spec_mix:0.85 },
        implementation:'band = exp(−((|n.z|−0.34)/0.06)²) mixes the edge color in; spec = (n·h)^60 mixes white in; both read from the same normal buffer as the LUT.' },
      { id:'film-grain', short:'GRN', name:'Per-channel film grain', layer:4, pass:5, atoms:['grain','noise','film'],
        params:{ multiplicative:'ART.grain amp 0.10, pitch 1 px, mono:false, seed 303', additive:'σ 14/255 per channel on the ground, hashed per pixel, seed 304', soften_px:0.7 },
        implementation:'ART.grain multiplies RGB by 1 + 0.10·n per channel (visible on the chrome and the type); a second pass adds signed noise of 14/255 so the black ground carries grain too, as film does.' },
      { id:'channel-split-type', short:'SPLT', name:'RGB channel-split lettering', layer:3, pass:4, atoms:['type','channel','offset','additive'],
        params:{ offsets_u:{ R:[-2.5,0], G:[0,0], B:[2.5,0] }, small_offsets_u:{ R:[-4,0], G:[0,0.8], B:[4,0] }, blend:'lighter on a transparent layer', type_colour:'#F3F3F3 (the three channels sum to white)' },
        implementation:'Each word is filled three times in #FF0000, #00FF00, #0000FF with globalCompositeOperation lighter on a transparent layer, offset per channel; where all three overlap the sum is white, at the edges one or two channels show; the layer is drawn under the chrome.' },
      { id:'display-headline', short:'TYPE', name:'Condensed display headline', layer:3, pass:4, atoms:['type','headline','condensed'],
        params:{ font:'Archivo 900, font-stretch 62 %', cap_u:142, line_pitch_u:175, left_u:38, top_u:28, figure:'right-aligned on line 2, 962 u', small:'Archivo 700, 30 u, 2 columns × 3 rows at x 660 / 840, baselines 372 / 402 / 432' },
        implementation:'line 1 is sized to 924 u (font-stretch is set after ctx.font, which resets it); the figure sits on line 2 flush right; the slab is drawn after the type so it covers the bottom of the headline as the reference slab does.' }
    ],
    pass_order:['ground · flat fill','headline + small words · channel split on a transparent layer, source-over','slab · rasterize section sweep into normal + depth buffers','shade · LUT[t(reflect)] + edge band + specular, soften 0.7 px, source-over','grain · multiplicative per channel, then additive on the ground'],
    notes:['Measured on ref.png: ground (13,13,13) σ 14–16 per channel; headline white 243 σ 3; cap height 233 px = 142 u; line pitch 288 px = 175 u; small-word fringe 3–5 px at 1644 px.','Seeds 303 (grain), 304 (ground noise). Orthographic view, no perspective.']
  },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const S=W/1000; const x=canvas.getContext('2d');
    const T0=performance.now();
    /* ---------- ground ---------- */
    x.setTransform(1,0,0,1,0,0); x.fillStyle=V.ground; x.fillRect(0,0,W,H);
    /* ---------- type (channel split) ---------- */
    const tl=A.off(W,H); const tx=tl.getContext('2d');
    const setFont=(c,weight,size,stretch)=>{ c.font=`${weight} ${size}px Archivo`; if('fontStretch' in c) c.fontStretch=stretch; };
    const splitText=(str,px,py,size,weight,stretch,off,align)=>{
      tx.save(); tx.setTransform(S,0,0,S,0,0); tx.textBaseline='alphabetic'; tx.textAlign=align||'left'; setFont(tx,weight,size,stretch);
      tx.globalCompositeOperation='lighter';
      const ch=[['#FF0000',off.R],['#00FF00',off.G],['#0000FF',off.B]];
      for(const [c,o] of ch){ tx.fillStyle=c; tx.fillText(str,px+o[0],py+o[1]); }
      tx.restore(); };
    const big={R:[-2.5,0],G:[0,0],B:[2.5,0]}, small={R:[-4,0],G:[0,0.8],B:[4,0]};
    tx.setTransform(S,0,0,S,0,0); let size=205; for(let i=0;i<40;i++){ setFont(tx,900,size,'extra-condensed'); if(tx.measureText('CHROMATIC').width<=924)break; size*=0.96; }
    splitText('CHROMATIC',38,170,size,900,'extra-condensed',big);
    splitText('FOLD',38,345,size,900,'extra-condensed',big);
    splitText('3',962,345,size,900,'extra-condensed',big,'right');
    for(let r=0;r<3;r++){ splitText('unfold',660,372+r*30,30,700,'normal',small); splitText('unfold',840,372+r*30,30,700,'normal',small); }
    x.drawImage(tl,0,0);
    /* ---------- slab: mesh ---------- */
    const NS=260, M=56; const hw=150*S, ht=80*S, fr=30*S;
    /* section: rounded rectangle traced by arc length; returns [a,b,na,nb] */
    const sec=[]; { const straightW=2*(hw-fr), straightH=2*(ht-fr), arc=Math.PI/2*fr; const per=2*straightW+2*straightH+4*arc;
      for(let j=0;j<M;j++){ let d=per*j/M; let a,b,na,nb;
        if(d<straightW){ a=-(hw-fr)+d; b=-ht; na=0; nb=-1; } else if((d-=straightW)<arc){ const p=-Math.PI/2+d/fr; a=(hw-fr)+fr*Math.cos(p); b=-(ht-fr)+fr*Math.sin(p); na=Math.cos(p); nb=Math.sin(p); }
        else if((d-=arc)<straightH){ a=hw; b=-(ht-fr)+d; na=1; nb=0; } else if((d-=straightH)<arc){ const p=d/fr; a=(hw-fr)+fr*Math.cos(p); b=(ht-fr)+fr*Math.sin(p); na=Math.cos(p); nb=Math.sin(p); }
        else if((d-=arc)<straightW){ a=(hw-fr)-d; b=ht; na=0; nb=1; } else if((d-=straightW)<arc){ const p=Math.PI/2+d/fr; a=-(hw-fr)+fr*Math.cos(p); b=(ht-fr)+fr*Math.sin(p); na=Math.cos(p); nb=Math.sin(p); }
        else if((d-=arc)<straightH){ a=-hw; b=(ht-fr)-d; na=-1; nb=0; } else { d-=straightH; const p=Math.PI+d/fr; a=-(hw-fr)+fr*Math.cos(p); b=-(ht-fr)+fr*Math.sin(p); na=Math.cos(p); nb=Math.sin(p); }
        sec.push([a,b,na,nb]); } }
    /* sweep path: two straight legs meeting at a rounded corner (bend radius 140 u), arc-length parametrised */
    const PA=[-200,1040], PK=[330,470], PB=[1200,780], RB=230;
    const path=(()=>{ const u1=[PK[0]-PA[0],PK[1]-PA[1]], l1=Math.hypot(u1[0],u1[1]); u1[0]/=l1; u1[1]/=l1; const u2=[PB[0]-PK[0],PB[1]-PK[1]], l2=Math.hypot(u2[0],u2[1]); u2[0]/=l2; u2[1]/=l2;
      const th=Math.acos(A.clamp(u1[0]*u2[0]+u1[1]*u2[1],-1,1)); const d=RB*Math.tan(th/2); const K1=[PK[0]-u1[0]*d,PK[1]-u1[1]*d], K2=[PK[0]+u2[0]*d,PK[1]+u2[1]*d];
      const cross=u1[0]*u2[1]-u1[1]*u2[0]; const sg=cross>0?1:-1; const n1=[-u1[1]*sg,u1[0]*sg]; const O=[K1[0]+n1[0]*RB,K1[1]+n1[1]*RB]; const a0=Math.atan2(K1[1]-O[1],K1[0]-O[0]); const arc=RB*th;
      const L1=l1-d, L2=l2-d, tot=L1+arc+L2;
      return s=>{ let q=s*tot; if(q<L1)return [PA[0]+u1[0]*q,PA[1]+u1[1]*q]; q-=L1; if(q<arc){ const a=a0+sg*q/RB; return [O[0]+RB*Math.cos(a),O[1]+RB*Math.sin(a)]; } q-=arc; return [K2[0]+u2[0]*q,K2[1]+u2[1]*q]; }; })();
    const bez=s=>{ const p=path(s); return [p[0]*S,p[1]*S]; };
    const twist=s=>-0.22+0.55*s;
    const TILT=0.5, cT=Math.cos(TILT), sT=Math.sin(TILT), yc=740*S;
    const surf=(s,j)=>{ const c=bez(s), c2=bez(Math.min(1,s+0.001)); let tx_=c2[0]-c[0], ty_=c2[1]-c[1]; const tl_=Math.hypot(tx_,ty_)||1; tx_/=tl_; ty_/=tl_;
      const U=[-ty_,tx_,0], th=twist(s), ct=Math.cos(th), st=Math.sin(th); const e1=[ct*U[0],ct*U[1],st], e2=[-st*U[0],-st*U[1],ct]; const q=sec[((j%M)+M)%M];
      const px=c[0]+q[0]*e1[0]+q[1]*e2[0], py=c[1]+q[0]*e1[1]+q[1]*e2[1], pz=q[0]*e1[2]+q[1]*e2[2]; const nx=q[2]*e1[0]+q[3]*e2[0], ny=q[2]*e1[1]+q[3]*e2[1], nz=q[2]*e1[2]+q[3]*e2[2];
      /* tilt the whole slab about the screen x axis through y = 740 u */
      const dy=py-yc; return [px, yc+dy*cT-pz*sT, dy*sT+pz*cT, nx, ny*cT-nz*sT, ny*sT+nz*cT]; };
    const vx=new Float32Array((NS+1)*M*3), vn=new Float32Array((NS+1)*M*3);
    for(let i=0;i<=NS;i++){ const s=i/NS; for(let j=0;j<M;j++){ const p=surf(s,j); const ps=surf(Math.min(1,s+1/NS),j), pj=surf(s,j+1);
      const d1=[ps[0]-p[0],ps[1]-p[1],ps[2]-p[2]], d2=[pj[0]-p[0],pj[1]-p[1],pj[2]-p[2]];
      let nx=d1[1]*d2[2]-d1[2]*d2[1], ny=d1[2]*d2[0]-d1[0]*d2[2], nz=d1[0]*d2[1]-d1[1]*d2[0]; const nl=Math.hypot(nx,ny,nz)||1; nx/=nl; ny/=nl; nz/=nl;
      if(nx*p[3]+ny*p[4]+nz*p[5]<0){ nx=-nx; ny=-ny; nz=-nz; }
      const k=(i*M+j)*3; vx[k]=p[0]; vx[k+1]=p[1]; vx[k+2]=p[2]; vn[k]=nx; vn[k+1]=ny; vn[k+2]=nz; } }
    /* ---------- rasterize into normal + depth buffers ---------- */
    const NB=new Float32Array(W*H*3), ZB=new Float32Array(W*H).fill(-1e9), MK=new Uint8Array(W*H);
    const tri=(a,b,c)=>{ const ax=vx[a],ay=vx[a+1],bx=vx[b],by=vx[b+1],cx=vx[c],cy=vx[c+1]; const area=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax); if(Math.abs(area)<1e-6)return;
      const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))), x1=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx))), y0=Math.max(0,Math.floor(Math.min(ay,by,cy))), y1=Math.min(H-1,Math.ceil(Math.max(ay,by,cy))); if(x0>x1||y0>y1)return;
      const ia=1/area;
      for(let y=y0;y<=y1;y++){ const py=y+0.5; for(let X=x0;X<=x1;X++){ const px=X+0.5;
        let w0=((bx-px)*(cy-py)-(by-py)*(cx-px))*ia, w1=((cx-px)*(ay-py)-(cy-py)*(ax-px))*ia, w2=1-w0-w1; if(w0<0||w1<0||w2<0)continue;
        const z=w0*vx[a+2]+w1*vx[b+2]+w2*vx[c+2]; const k=y*W+X; if(z<=ZB[k])continue; ZB[k]=z; MK[k]=1;
        NB[k*3]=w0*vn[a]+w1*vn[b]+w2*vn[c]; NB[k*3+1]=w0*vn[a+1]+w1*vn[b+1]+w2*vn[c+1]; NB[k*3+2]=w0*vn[a+2]+w1*vn[b+2]+w2*vn[c+2]; } } };
    for(let i=0;i<NS;i++)for(let j=0;j<M;j++){ const a=(i*M+j)*3, b=(i*M+(j+1)%M)*3, c=((i+1)*M+j)*3, d=((i+1)*M+(j+1)%M)*3; tri(a,b,c); tri(b,d,c); }
    /* ---------- shade ---------- */
    const L=A.lut(V.lut), edge=A.hex(V.edge), spc=A.hex(V.specular);
    const li=[-0.35,-0.60,0.72], ll=Math.hypot(li[0],li[1],li[2]); const hx=li[0]/ll, hy=li[1]/ll, hz=li[2]/ll+1; const hl=Math.hypot(hx,hy,hz); const Hx=hx/hl,Hy=hy/hl,Hz=hz/hl;
    const cl=A.off(W,H); const cx=cl.getContext('2d'); const cid=cx.createImageData(W,H); const cd=cid.data;
    for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const k=y*W+X; if(!MK[k])continue;
      let nx=NB[k*3],ny=NB[k*3+1],nz=NB[k*3+2];
      nx+=0.20*Math.sin(X/(300*S)+y/(420*S))+0.06*Math.sin(X/(90*S)); ny+=0.22*Math.cos(X/(360*S)-y/(260*S))+0.08*Math.sin(y/(120*S)); const nl=Math.hypot(nx,ny,nz)||1; nx/=nl; ny/=nl; nz/=nl;
      const rx=2*nz*nx, ry=2*nz*ny; const t=A.clamp(0.5+0.40*ry+0.16*rx,0,1); let c=L[(t*255)|0];
      const anz=Math.abs(nz); const bd=Math.exp(-Math.pow((anz-0.34)/0.06,2)); if(bd>0.01)c=A.mix(c,edge,bd);
      const nh=Math.max(0,nx*Hx+ny*Hy+nz*Hz); const sp=Math.pow(nh,60); if(sp>0.01)c=A.mix(c,spc,0.85*sp);
      const i=k*4; cd[i]=c[0]; cd[i+1]=c[1]; cd[i+2]=c[2]; cd[i+3]=255; }
    cx.putImageData(cid,0,0);
    const soft=A.blur(cl,0.7*dpr); x.drawImage(soft,0,0);
    /* ---------- grain ---------- */
    A.grain(x,{amp:0.10,pitch:1,mono:false,seed:303});
    { const id=x.getImageData(0,0,W,H); const d=id.data; const seed=304;
      const hash=(x_,y_,k)=>{ let n=(x_*374761393+y_*668265263+k*1274126177+seed*2246822519)|0; n=(n^(n>>>13))*1274126177|0; n=n^(n>>>16); return ((n>>>0)/4294967296)*2-1; };
      const sig=14*1.73;
      for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const i=(y*W+X)*4; const m=hash(X,y,0); d[i]=d[i]+sig*(0.7*m+0.3*hash(X,y,1)); d[i+1]=d[i+1]+sig*(0.7*m+0.3*hash(X,y,2)); d[i+2]=d[i+2]+sig*(0.7*m+0.3*hash(X,y,3)); }
      x.putImageData(id,0,0); }
    if(window.__TS03_DEBUG)console.log('ts-03 render ms',(performance.now()-T0)|0);
  }
};
