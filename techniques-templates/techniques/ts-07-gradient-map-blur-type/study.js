window.STUDY={
  id:'ts-07-gradient-map-blur-type', code:'TS-07', fig:'1.7',
  title:'Gradient-mapped blur type',
  kicker:'Technique · TS-07',
  lede:'Type and blobs in one mask, blurred, mapped through a four-stop ramp.',
  body:[
    'One luminance mask. Hard-edged blobs sit on black; six heavy words draw over them with a difference composite, so a letter is white on a black field and black on a white field. The whole mask blurs, then every pixel is replaced by a ramp read at its luminance — black, deep red, red, pink, light gray.',
    'The edge halo is that ramp read down the blur falloff; stops at 0, 0.09, 0.30, 0.70 and 0.92 make the pink band wide and the drop to black short. In motion the blur breathes between 4 and 28 u over 8 s and the blobs drift — the words hold still.'
  ],
  source:'Reference 07 · frame from an 8 s motion piece, gradient-mapped blurred type, 1000 × 1296',
  spot:[235,62,37], ref:{w:1000,h:1296},
  variantLabel:'Color',
  variants:[
    { id:'ref',   label:'As reference', sw:['#000000','#EB3E25','#EDA1E3','#DAD9D9'], spot:[235,62,37],
      ramp:[[0,'#000000'],[0.09,'#460A05'],[0.30,'#EB3E25'],[0.70,'#EDA1E3'],[0.92,'#DAD9D9'],[1,'#DAD9D9']] },
    { id:'ember', label:'Ember',        sw:['#101014','#F4551E','#FFFFFF'], spot:[244,85,30],
      ramp:[[0,'#101014'],[0.09,'#4A1C12'],[0.30,'#F4551E'],[0.70,'#FBBFA0'],[0.92,'#FFFFFF'],[1,'#FFFFFF']] },
    { id:'blue',  label:'Blue',         sw:['#101014','#2F5AE6','#FFFFFF'], spot:[47,90,230],
      ramp:[[0,'#101014'],[0.09,'#141E4E'],[0.30,'#2F5AE6'],[0.70,'#AEC0F5'],[0.92,'#FFFFFF'],[1,'#FFFFFF']] }
  ],
  points:[
    {u:0.08,v:0.20,d:'BLOB',label:'Blob 1 · metaball, radius 210 u, ratio 1.35, cut by the frame edge',t:'blob-field',dir:[1,1]},
    {u:0.92,v:0.66,d:'BLOB',label:'Blob 6 · field threshold 1.0 gives a hard edge before the blur',t:'blob-field',dir:[-1,-1]},
    {u:0.34,v:0.48,d:'BLOB',label:'Blobs 5 + 10 · two fields sum and merge into one shape',t:'blob-field',dir:[1,1]},
    {u:0.50,v:0.12,d:'TYPE',label:'Line 1 · Archivo 900 semi-condensed, 225 u, cap 155 u',t:'display-stack',dir:[1,-1]},
    {u:0.50,v:0.60,d:'TYPE',label:'Line 4 · pitch 205 u, six lines, difference composite over the blobs',t:'display-stack',dir:[1,1]},
    {u:0.20,v:0.92,d:'TYPE',label:'Line 6 · black letter over a white blob, white letter over black ground',t:'display-stack',dir:[1,1]},
    {u:0.66,v:0.36,d:'BLUR',label:'Blur · gaussian, σ 16 u on the whole mask; the halo width is 2σ',t:'blur-field',dir:[1,-1]},
    {u:0.14,v:0.74,d:'MAP',label:'Ramp on the falloff · light → pink → red → deep red → black',t:'gradient-map',dir:[1,1]},
    {u:0.84,v:0.06,d:'MAP',label:'Flat white region → light gray stop at 0.92',t:'gradient-map',dir:[-1,1]},
    {u:0.50,v:0.80,d:'BRTH',label:'Breath · σ = 4 + 24·(0.5+0.5·sin 2πt/8) u; blobs drift ±40 u on perlin(t)',t:'breath-motion',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1000,1296], grammar:'one luminance mask (hard blobs, heavy stacked type in difference), gaussian blur, gradient map through black → deep red → red → pink → light gray; no grain' },
    units:'design units, 1000 = plate width',
    palette:{ black:'#000000', deep_red:'#460A05', red:'#EB3E25', pink:'#EDA1E3', light:'#DAD9D9' },
    techniques:[
      { id:'blob-field', short:'BLOB', name:'Metaball blob field', layer:0, pass:0, atoms:['metaball','threshold','radial'],
        params:{ count:10, radius_u:[105,230], field:'Σ (r_i / |p − c_i|_e)⁴, |·|_e an elliptic distance (ratio 1.3–1.6, seeded angle)', threshold:1.0, centres_u:[[30,240],[450,20],[930,230],[10,560],[320,640],[960,870],[30,1160],[470,890],[730,1280],[650,420]], eval_scale:'1/2 (render) · 1/4 (motion)' },
        implementation:'Sum of inverse-fourth elliptic fields from 10 seeded centres; pixels above 1.0 are white, the rest black, so nearby blobs merge into one shape with a hard edge.' },
      { id:'display-stack', short:'TYPE', name:'Stacked display words', layer:1, pass:1, atoms:['lettering','stack','difference'],
        params:{ font:'Archivo 900, font-stretch semi-condensed (wdth 87.5)', lines:6, size_u:225, pitch_u:205, cap_height_u:155, align:'center', composite:'difference' },
        implementation:'Six words centred at 225 u (the six-letter word spans 0.92 W), drawn white with globalCompositeOperation difference so each letter inverts the blob field under it.' },
      { id:'blur-field', short:'BLUR', name:'Whole-mask gaussian blur', layer:2, pass:2, atoms:['blur','gaussian','falloff'],
        params:{ sigma_u:16, sigma_px_ref:'≈20 at 1000 px', edge:'mask padded 40 u so the frame edge does not darken' },
        implementation:'One CSS blur over the full mask after the type is composited, so type edges and blob edges get the same falloff.' },
      { id:'gradient-map', short:'MAP', name:'Five-stop gradient map', layer:3, pass:3, atoms:['lut','luminance','ramp'],
        params:{ stops:[[0,'#000000'],[0.09,'#460A05'],[0.30,'#EB3E25'],[0.70,'#EDA1E3'],[0.92,'#DAD9D9']], read:'luminance 0.2126 R + 0.7152 G + 0.0722 B' },
        implementation:'256-entry LUT from the stops; every pixel of the blurred mask is replaced by LUT[luminance], which turns the blur falloff into the red-and-pink halo.' },
      { id:'breath-motion', short:'BRTH', name:'Breathing blur', layer:4, pass:4, atoms:['loop','sine','drift'],
        params:{ period_s:8, sigma_u:'4 + 24·(0.5 + 0.5·sin(2πt/8))', blob_drift_u:'±40 on perlin(t/6 + i)', words:'static', work_width_px:512, cache:'text mask per size' },
        implementation:'Each frame recomputes the blobs at quarter scale, composites the cached text mask, blurs at the current σ and gradient-maps on a 512 px work canvas that is drawn up to plate size.' }
    ],
    pass_order:['mask · black ground, metaballs thresholded at 1.0','type · six words in difference over the mask','blur · gaussian σ 16 u (4–28 u in motion), padded canvas','map · LUT[luminance] per pixel','frame · crop the padding'],
    notes:['Measured on ref.png: ramp bins by luminance → (70,12,5) at 0.06, (232,71,45) at 0.38, (234,168,229) at 0.69, (218,217,219) at 0.82 of output luminance; flat regions have std 0 (no grain).','Edge width light → black: 16 px in the sharpest frame (ref-c, 1120 px), 26 px (ref-b), 80 px (ref.png) — the blur breathes over the 8 s loop.','Word block in ref.png: line pitch ≈ 203 u, cap height ≈ 155 u, DARK width / cap = 4.0 (Archivo 900 semi-condensed: 4.04), six-letter word ≈ 0.90 W. Seed 7.']
  },

  /* ---------- shared pieces ---------- */
  _blobs:[[30,240,210,1.35,0.4],[450,20,140,1.5,1.4],[930,230,230,1.3,0.9],[10,560,130,1.4,1.2],[320,640,105,1.6,0.3],[960,870,210,1.3,1.5],[30,1160,200,1.3,0.6],[470,890,130,1.5,1.0],[730,1280,160,1.4,0.2],[650,420,110,1.3,0.8]],
  _words:['FIRST','LIGHT','MOVES','ACROSS','STILL','WATER'],
  _font(s){ return `900 semi-condensed ${s}px Archivo, 'Archivo', sans-serif`; },
  /* metaball mask → canvas of cw × ch device px covering (−pad … 1000+pad) u horizontally; off = drift offsets per blob (u) */
  _blobMask(cw,ch,uPer,padU,off){
    const A=window.ART; const c=A.off(cw,ch); const x=c.getContext('2d'); const id=x.createImageData(cw,ch); const d=id.data; const B=this._blobs; const n=B.length;
    const cx=new Float32Array(n), cy=new Float32Array(n), r2=new Float32Array(n), ca=new Float32Array(n), sa=new Float32Array(n), kk=new Float32Array(n);
    for(let i=0;i<n;i++){ cx[i]=(B[i][0]+(off?off[i][0]:0)+padU)/uPer; cy[i]=(B[i][1]+(off?off[i][1]:0)+padU)/uPer; r2[i]=(B[i][2]/uPer)*(B[i][2]/uPer); ca[i]=Math.cos(B[i][4]); sa[i]=Math.sin(B[i][4]); kk[i]=B[i][3]*B[i][3]; }
    for(let y=0;y<ch;y++)for(let X=0;X<cw;X++){ let f=0; for(let i=0;i<n;i++){ const ox=X+0.5-cx[i], oy=y+0.5-cy[i]; const dx=ox*ca[i]+oy*sa[i], dy=oy*ca[i]-ox*sa[i]; const q=r2[i]/(dx*dx+dy*dy*kk[i]+1e-3); f+=q*q; if(f>=1)break; }
      const k=(y*cw+X)*4; const v=f>=1?255:0; d[k]=v; d[k+1]=v; d[k+2]=v; d[k+3]=255; }
    x.putImageData(id,0,0); return c; },
  /* text mask: white words on transparent, canvas of pw × ph device px, u = px per design unit, padded by padPx */
  _textMask(pw,ph,u,padPx){
    const A=window.ART; const c=A.off(pw,ph); const x=c.getContext('2d'); x.setTransform(u,0,0,u,padPx,padPx);
        const size=225;
    x.font=this._font(size); x.fillStyle='#fff'; x.textAlign='center'; x.textBaseline='alphabetic';
    const pitch=205, n=this._words.length, cap=size*0.69; const block=cap+(n-1)*pitch; const y0=(1296-block)/2+cap;
    for(let i=0;i<n;i++)x.fillText(this._words[i],500,y0+i*pitch);
    return c; },
  _lut(V){ const A=window.ART; const k=V.id; this._luts=this._luts||{}; return this._luts[k]||(this._luts[k]=A.lut(V.ramp)); },
  /* compose one frame: target ctx (device px), sigmaU blur, drift offsets or null; masks at scale `mask` (device px per u) */
  _frame(tx,W,H,u,sigmaU,off,blobScale,textMask){
    const A=window.ART; const padU=40; const padPx=padU*u; const pw=Math.round(W+2*padPx), ph=Math.round(H+2*padPx);
    const bw=Math.max(8,Math.round(pw*blobScale)), bh=Math.max(8,Math.round(ph*blobScale));
    const blobs=this._blobMask(bw,bh,(1/u)/blobScale,padU,off);
    const lum=A.off(pw,ph); const lx=lum.getContext('2d'); lx.fillStyle='#000'; lx.fillRect(0,0,pw,ph); lx.imageSmoothingEnabled=true; lx.imageSmoothingQuality='low'; lx.drawImage(blobs,0,0,pw,ph);
    lx.globalCompositeOperation='difference'; lx.drawImage(textMask,0,0); lx.globalCompositeOperation='source-over';
    tx.setTransform(1,0,0,1,0,0); tx.filter=`blur(${Math.max(0.01,sigmaU*u)}px)`; tx.drawImage(lum,-padPx,-padPx); tx.filter='none'; },

  render(canvas,w,h,dpr,V,done){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d',{willReadFrequently:true});
    const go=()=>{ const padPx=40*u; const tm=this._textMask(Math.round(W+2*padPx),Math.round(H+2*padPx),u,padPx);
      this._frame(x,W,H,u,16,null,0.5,tm); A.gradientMap(x,this._lut(V)); done&&done(); };
    const spec='900 100px Archivo';
    if(document.fonts&&document.fonts.check&&!document.fonts.check(spec)){ document.fonts.load(spec).then(go,go); return false; }
    go(); return false;
  },

  motion(canvas,w,h,dpr,V,t,ctx){
    const A=window.ART; const W=canvas.width,H=canvas.height; const key=W+'x'+H;
    const c=this._cache&&this._cache.key===key?this._cache:null;
    let C=c; if(!C){ const mw=Math.min(W,512), mh=Math.round(H*mw/W); const u=mw/1000; const padPx=40*u; const work=A.off(mw,mh); const tm=this._textMask(Math.round(mw+2*padPx),Math.round(mh+2*padPx),u,padPx);
      C=this._cache={key,work,wx:work.getContext('2d',{willReadFrequently:true}),tm,u,mw,mh,noise:A.perlin(7)}; }
    const ph=(t%8)/8; const sigma=4+24*(0.5+0.5*Math.sin(2*Math.PI*ph));
    const off=this._blobs.map((b,i)=>[40*C.noise(t/6+i*3.7,i*1.3),40*C.noise(i*2.1,t/6+i*5.3)]);
    this._frame(C.wx,C.mw,C.mh,C.u,sigma,off,0.25,C.tm); A.gradientMap(C.wx,this._lut(V));
    ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='low'; ctx.drawImage(C.work,0,0,W,H);
  }
};
