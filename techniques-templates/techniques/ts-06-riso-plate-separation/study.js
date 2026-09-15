window.STUDY={
  id:'ts-06-riso-plate-separation', code:'TS-06', fig:'1.6',
  title:'Riso three-plate separation',
  kicker:'Technique · TS-06',
  lede:'One isometric drawing split into three ink plates, each off by a few px.',
  body:[
    'An extruded isometric object — a top face and two sides — printed as three plates. Yellow takes the tops and a corner wash; blue the right faces; pink the left faces and a marbled fill in the tops; the keyline rides all three. The inks multiply: three on the keyline read near-black, pink over yellow reads orange.',
    'Each plate lands on its own register error and grains on its own — mono noise at its own seed, coverage thinning toward every fill edge, a slow mottle. The stock is light gray with a printed isometric grid.'
  ],
  source:'Reference 06 · risograph print, three plates on grid stock, 1080 × 1080',
  spot:[216,89,163], ref:{w:1080,h:1080},
  variantLabel:'Plates',
  variants:[
    { id:'ref', label:'All plates',  sw:['#E9E566','#614C90','#D859A3'], spot:[216,89,163], stock:'#EEEEEC', grid:'#5A5880', inks:['#E9E566','#614C90','#D859A3'], on:[1,1,1] },
    { id:'y',   label:'Yellow only', sw:['#E9E566'], spot:[233,229,102], stock:'#EEEEEC', grid:'#5A5880', inks:['#E9E566','#614C90','#D859A3'], on:[1,0,0] },
    { id:'b',   label:'Blue only',   sw:['#614C90'], spot:[97,76,144],   stock:'#EEEEEC', grid:'#5A5880', inks:['#E9E566','#614C90','#D859A3'], on:[0,1,0] },
    { id:'p',   label:'Pink only',   sw:['#D859A3'], spot:[216,89,163],  stock:'#EEEEEC', grid:'#5A5880', inks:['#E9E566','#614C90','#D859A3'], on:[0,0,1] },
    { id:'io',  label:'Ember / blue / ink', sw:['#F4551E','#2F5AE6','#101014'], spot:[244,85,30], stock:'#FFFFFF', grid:'#101014', inks:['#F4551E','#2F5AE6','#101014'], on:[1,1,1] }
  ],
  points:[
    {u:0.15,v:0.35,d:'PLTE',label:'Top face · yellow plate, pink marble plate over it',t:'plate-separation',dir:[-1,-1]},
    {u:0.35,v:0.56,d:'PLTE',label:'Right face · blue plate only',t:'plate-separation',dir:[-1,1]},
    {u:0.07,v:0.44,d:'PLTE',label:'Left face · pink plate only',t:'plate-separation',dir:[-1,1]},
    {u:0.61,v:0.56,d:'MREG',label:'Register error · pink +4,+3 u, yellow −3,+2 u, blue +1,−2 u',t:'misregister',dir:[1,1]},
    {u:0.79,v:0.30,d:'MREG',label:'Outline fringe · blue and pink keylines land 6 u apart',t:'misregister',dir:[1,-1]},
    {u:0.31,v:0.43,d:'MARB',label:'Marble · fbm zero-crossing band, two coverage levels',t:'marbled-fill',dir:[1,-1]},
    {u:0.63,v:0.15,d:'EXTR',label:'Slab stack · three extrusions, depth 40 / 30 / 24 u',t:'iso-extrude',dir:[-1,-1]},
    {u:0.49,v:0.64,d:'EXTR',label:'Extrusion · top outline dropped 85 u down the z axis',t:'iso-extrude',dir:[1,1]},
    {u:0.20,v:0.86,d:'GRN',label:'Ink grain · mono noise amp 0.10, coverage thins at fill edges',t:'ink-grain',dir:[-1,1]},
    {u:0.90,v:0.74,d:'STCK',label:'Grid stock · 31.5 u verticals, ±30° diagonals, 16 % ink',t:'grid-stock',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1080,1080], grammar:'three-plate risograph of an isometric drawing on grid stock: yellow, blue, fluorescent pink; plates mis-registered by a few px; each plate grained; marbled top faces; keyline near-black where plates overprint' },
    units:'design units, 1000 = sheet width',
    palette:{ stock:'#EEEEEC', grid_ink:'#5A5880', yellow:'#E9E566', blue:'#614C90', pink:'#D859A3', blue_over_pink:'#52205C', all_three:'#3A2018' },
    techniques:[
      { id:'iso-extrude', short:'EXTR', name:'Isometric extrusion by outline drop', layer:1, pass:1, atoms:['isometric','extrude','painter-order'],
        params:{ axes:'x → (cos30, sin30), y → (−cos30, sin30), z → (0, −1)', letters:{font:'Archivo 900', size_u:235, depth_u:85}, slabs:{depth_u:[40,30,24]}, bars:{depth_u:52}, probe_px:'(±2,+1)' },
        implementation:'Each object is a top-face mask drawn in the plane transform; a column scan drops every boundary pixel whose +x or +y probe is empty by the depth, labelling right or left face, top always winning; later objects overwrite earlier ones.' },
      { id:'plate-separation', short:'PLTE', name:'Three-plate coverage split', layer:2, pass:2, atoms:['separation','multiply','coverage'],
        params:{ yellow:'top faces + corner wash + marker strokes', blue:'right faces + keylines', pink:'left faces + keylines + marble', keyline:'on all three plates', keyline_u:3.6, composite:'multiply', max_coverage:1 },
        implementation:'Face labels become three coverage rasters; each raster is coloured mix(white, ink, coverage) on its own canvas and multiplied onto the stock in plate order.' },
      { id:'misregister', short:'MREG', name:'Per-plate register error', layer:2, pass:3, atoms:['translate','offset'],
        params:{ yellow_u:[-3,2], blue_u:[1,-2], pink_u:[4,3], measured_px:'pink +3,+2 · yellow −2,+1 relative to blue' },
        implementation:'Each plate canvas is drawn translated by its own vector; the keyline sits on all three plates, so the offsets show as coloured fringes on every edge and the overprint of all three is the near-black line.' },
      { id:'ink-grain', short:'GRN', name:'Per-plate ink grain', layer:3, pass:2, atoms:['grain','mottle','edge-thinning'],
        params:{ amp:[0.10,0.12,0.11], seeds:[601,602,603], pitch_px:1, stochastic_thin:'coverage × (1 − 0.4·rand)', edge_thin:'coverage × (0.72 + 0.28·blur(coverage, 4 u))', mottle:'0.86 + 0.14·perlin(p / 60 u)' },
        implementation:'Before colouring, coverage is multiplied by a blurred copy of itself so fills thin toward their edges, and by a slow perlin mottle; after colouring ART.grain runs mono on the plate and paper pixels are reset to white.' },
      { id:'marbled-fill', short:'MARB', name:'Marbled fill from fbm bands', layer:2, pass:2, atoms:['fbm','threshold','band'],
        params:{ scale_u:30, octaves:4, gain:0.6, band_core:'|n| < 0.055 → coverage 0', band_rim:'|n| < 0.10 → coverage 0.5', elsewhere:1 },
        implementation:'Inside the top faces the pink plate is full except where an fbm field crosses zero: the core of the band is paper, the rim half-coverage, which reads as swirls.' },
      { id:'grid-stock', short:'STCK', name:'Isometric grid stock', layer:0, pass:0, atoms:['stock','grid','isometric'],
        params:{ stock:'#EEEEEC', vertical_pitch_u:31.5, diagonals:'±30° through the same lattice, 18.2 u apart along a vertical', alpha:0.16, width_u:1.0 },
        implementation:'Flat gray fill, then verticals and both diagonal families stroked in the grid ink at 16 % before any plate lands.' }
    ],
    pass_order:['stock · gray fill + iso grid','labels · top / right / left per object, back to front','coverage · three rasters from labels, marble cut into pink, wash and strokes into yellow','grain · edge thinning, mottle, mono noise per plate','plates · multiply in order yellow, blue, pink, each translated by its register error'],
    notes:['Measured on ref.png: vertical grid pitch 34 px (31.5 u); diagonal spacing along a vertical 19.6 px; grid pixels 14 % darker than stock; stock (234,234,237) std 12 / 255; yellow (233,230,102); pink face (215,144,189) std 45; blue over pink (98,44,117); keyline (60,30,20).','Pink lands 3 px right and 2 px down of blue; yellow 2 px left and 1 px down; the rebuild gives blue its own +1,−2 u so all three plates move in the motion version.','Words are invented. Seeds 601–603, marble 610, mottle 611.']
  },
  /* ---------- geometry + plates, cached per size ---------- */
  _build(W,H){
    const A=window.ART; const u=W/1000; const c30=Math.sqrt(3)/2, s30=0.5; const N=W*H;
    const lab=new Uint8Array(N); let objId=0;
    const addObject=(draw,depth,lift)=>{ objId++; const m=A.off(W,H); const x=m.getContext('2d'); x.fillStyle='#fff'; draw(x,lift); const T=x.getImageData(0,0,W,H).data; const D=Math.round(depth*u); const id=objId*4;
      const inT=(X,Y)=>X>=0&&X<W&&Y>=0&&Y<H&&T[(Y*W+X)*4+3]>127;
      for(let X=0;X<W;X++){ let last=0,lastY=-1e9; for(let Y=0;Y<H;Y++){ const i=Y*W+X; if(T[i*4+3]>127){ lab[i]=id+1; const nR=inT(X+2,Y+1), nL=inT(X-2,Y+1), nD=inT(X,Y+1); if(!nR){ last=2; lastY=Y; } else if(!nL){ last=3; lastY=Y; } else if(!nD){ last=2; lastY=Y; } } else if(last&&Y-lastY<=D){ lab[i]=id+last; } } } };
    const plane=(x,ox,oy,z)=>x.setTransform(c30*u,s30*u,-c30*u,s30*u,ox*u,(oy-z)*u);
    const stadium=(x,w,h)=>{ x.beginPath(); x.roundRect(0,0,w,h,Math.min(w,h)/2); x.fill(); };
    /* bars (back), letters, slab stack (front-right) */
    addObject((x,z)=>{ plane(x,110,720,z); stadium(x,340,76); },52,0);
    addObject((x,z)=>{ plane(x,935,520,z); stadium(x,74,310); },52,0);
    addObject((x,z)=>{ plane(x,165,265,z); try{ x.fontStretch='normal'; }catch(e){} x.font='900 235px Archivo'; x.textBaseline='alphabetic'; x.fillText('DOT',0,172); },85,0);
    const slabs=[[230,190,40,0],[180,148,30,40],[124,100,24,70]];
    slabs.forEach(([sw,sh,d,z],k)=>{ const ox=k*22, oy=k*20; addObject((x,zz)=>{ plane(x,610,120,zz); x.fillRect(ox,oy,sw,sh); },d,z); });
    /* keyline mask: label changes, dilated */
    const r=Math.max(1,Math.round(1.8*u)); const E=new Uint8Array(N);
    for(let Y=0;Y<H-1;Y++)for(let X=0;X<W-1;X++){ const i=Y*W+X; const a=lab[i]; if(a!==lab[i+1]||a!==lab[i+W]){ if(a||lab[i+1]||lab[i+W]) E[i]=1; } }
    const K=new Uint8Array(N); const tmp=new Uint8Array(N);
    for(let Y=0;Y<H;Y++){ let run=0; for(let X=0;X<W+r;X++){ if(X<W&&E[Y*W+X])run=2*r+1; if(run>0&&X-r>=0&&X-r<W)tmp[Y*W+X-r]=1; if(run>0)run--; } }
    for(let X=0;X<W;X++){ let run=0; for(let Y=0;Y<H+r;Y++){ if(Y<H&&tmp[Y*W+X])run=2*r+1; if(run>0&&Y-r>=0&&Y-r<H)K[(Y-r)*W+X]=1; if(run>0)run--; } }
    /* yellow strokes on a scratch canvas */
    const sc=A.off(W,H); const sx=sc.getContext('2d'); sx.setTransform(u,0,0,u,0,0); sx.strokeStyle='#fff'; sx.lineCap='round'; sx.lineJoin='round'; sx.lineWidth=13;
    sx.beginPath(); sx.moveTo(240,240); sx.quadraticCurveTo(360,180,520,212); sx.moveTo(478,180); sx.lineTo(524,213); sx.lineTo(474,238); sx.stroke();
    sx.lineWidth=11; sx.beginPath(); sx.moveTo(900,40); sx.lineTo(960,120); sx.lineTo(910,150); sx.lineTo(980,215); sx.stroke();
    sx.beginPath(); sx.moveTo(930,900); sx.lineTo(985,960); sx.lineTo(940,975); sx.stroke();
    const SA=sx.getImageData(0,0,W,H).data;
    /* marble + mottle fields */
    const pm=A.perlin(610), pmo=A.perlin(611); const ms=30*u, mo=60*u;
    const cov=[new Float32Array(N),new Float32Array(N),new Float32Array(N)];
    const wx0=-0.05*W, wy0=1.05*H, wr=0.9*W;
    for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){ const i=Y*W+X; const t=lab[i]&3; const k=K[i];
      let y=0,b=0,p=0;
      if(t===1){ y=1; const n=pm.fbm(X/ms,Y/ms,4,0.6); const an=Math.abs(n); p=an<0.055?0:(an<0.10?0.5:1); }
      else if(t===2){ b=1; } else if(t===3){ p=1; }
      if(k){ y=1; b=1; p=1; }
      if(!t){ const d=Math.hypot(X-wx0,Y-wy0); { const wv=A.sstep(1.0,0.12,d/wr); const ww=0.92*wv*wv; if(ww>0.03)y=Math.max(y,ww); } }
      y=Math.max(y,SA[i*4+3]/255);
      cov[0][i]=y; cov[1][i]=b; cov[2][i]=p; }
    return {W,H,u,lab,K,cov,mottle:(X,Y)=>0.86+0.14*(0.5+0.5*pmo(X/mo,Y/mo))};
  },
  _plates(G,V){
    const A=window.ART; const {W,H,u,cov,K,lab}=G; const N=W*H; const amps=[0.10,0.12,0.11], seeds=[601,602,603]; const out=[];
    for(let k=0;k<3;k++){ const ink=A.hex(V.inks[k]); const c=A.off(W,H); const x=c.getContext('2d');
      /* soft copy for edge thinning */
      const g=x.createImageData(W,H); const gd=g.data; for(let i=0;i<N;i++){ const v=(cov[k][i]*255)|0; gd[i*4]=v; gd[i*4+1]=v; gd[i*4+2]=v; gd[i*4+3]=255; } x.putImageData(g,0,0);
      const soft=A.blur(c,4*u).getContext('2d').getImageData(0,0,W,H).data;
      const id=x.createImageData(W,H); const d=id.data; const mot=G.mottle; const rnd=A.rng(seeds[k]);
      for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){ const i=Y*W+X; let cv=cov[k][i]; if(cv>0){ const keyed=K[i]&&k>0; const thin=keyed?1:(0.72+0.28*soft[i*4]/255); cv=cv*thin*mot(X,Y)*(1-0.4*rnd()); if(cv>1)cv=1; }
        const j=i*4; d[j]=255-(255-ink[0])*cv; d[j+1]=255-(255-ink[1])*cv; d[j+2]=255-(255-ink[2])*cv; d[j+3]=255; }
      x.putImageData(id,0,0);
      A.grain(x,{amp:amps[k],pitch:1,seed:seeds[k],mono:true});
      const gi=x.getImageData(0,0,W,H); const gdd=gi.data; for(let i=0;i<N;i++){ if(cov[k][i]===0){ gdd[i*4]=255; gdd[i*4+1]=255; gdd[i*4+2]=255; } } x.putImageData(gi,0,0);
      out.push(c); }
    return out;
  },
  _stock(G,V){
    const A=window.ART; const {W,H,u}=G; const c=A.off(W,H); const x=c.getContext('2d'); x.fillStyle=V.stock; x.fillRect(0,0,W,H);
    x.setTransform(u,0,0,u,0,0); x.strokeStyle=A.rgb(A.hex(V.grid),0.16); x.lineWidth=1.0; const p=31.5, Hu=H/u, t30=Math.tan(Math.PI/6);
    x.beginPath(); for(let X=-1000;X<2000;X+=p){ x.moveTo(X,0); x.lineTo(X,Hu); x.moveTo(X,0); x.lineTo(X+Hu/t30,Hu); x.moveTo(X,0); x.lineTo(X-Hu/t30,Hu); } x.stroke();
    return c;
  },
  _get(canvas,V){
    const W=canvas.width,H=canvas.height; const key=W+'x'+H; this._cache=this._cache||{};
    if(!this._cache[key]||this._cache[key].G.W!==W) this._cache={[key]:{G:this._build(W,H),plates:{},stock:{}}};
    const C=this._cache[key]; if(!C.plates[V.id]){ C.plates[V.id]=this._plates(C.G,V); C.stock[V.id]=this._stock(C.G,V); }
    return {G:C.G,plates:C.plates[V.id],stock:C.stock[V.id]};
  },
  _offsets(u){ return [[-3*u,2*u],[1*u,-2*u],[4*u,3*u]]; },
  _compose(canvas,V,plates,stock,u,prog){
    const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.globalCompositeOperation='source-over'; x.drawImage(stock,0,0);
    const off=this._offsets(u); x.globalCompositeOperation='multiply';
    for(let k=0;k<3;k++){ if(!V.on[k])continue; const s=prog?prog[k]:1; if(s<=0)continue; const e=1-Math.pow(1-s,3); const m=3-2*e; x.drawImage(plates[k],Math.round(off[k][0]*m),Math.round(off[k][1]*m)); }
    x.globalCompositeOperation='source-over';
  },
  render(canvas,w,h,dpr,V){
    const {G,plates,stock}=this._get(canvas,V); this._compose(canvas,V,plates,stock,G.u,null);
  },
  motion(canvas,w,h,dpr,V,t,ctx){
    const {G,plates,stock}=this._get(canvas,V); const T=t%3.6; const prog=[0,1.2,2.4].map(t0=>Math.min(1,Math.max(0,(T-t0)/0.4)));
    this._compose(canvas,V,plates,stock,G.u,prog); ctx.setTransform(dpr,0,0,dpr,0,0);
  }
};
