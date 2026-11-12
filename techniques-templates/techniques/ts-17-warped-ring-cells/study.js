window.STUDY={
  id:'ts-17-warped-ring-cells', code:'TS-17', fig:'1.17',
  title:'Warped ring cells',
  kicker:'Technique · TS-17',
  lede:'A grid of rounded cells on a pulled sheet, inked in pools, printed as single pixels.',
  body:[
    'A square grid of rounded cells, pitch 52 u, lies on a sheet that is pulled at four points. A pull moves the sheet by a vector that falls off as a gaussian. Cells behind a pull stretch to nearly three times their length; cells ahead of it shrink. Thirteen pools of ink sit over the sheet. A pool fills the cells, outlines them, or fills the gutters between them.',
    'Nothing is drawn as a line and nothing is blurred. Each pixel takes an ink with a chance equal to the coverage there, drawn in proportion to the pools that reach it, and otherwise shows stock. 12 % of pixels near a pool take a stray ink. Motion swings the pulls. Live adds a pull under the pointer.'
  ],
  source:'Reference 17 · warped grid of grainy color cells, 735 × 956',
  spot:[10,185,241], ref:{w:735,h:956},
  variantLabel:'Inks',
  variants:[
    { id:'ref',  label:'Five ink', sw:['#0AF2D1','#0AB9F1','#EE4A1E','#F2C234','#D7D7B6'], spot:[10,185,241], paper:'#EFECE6', stock:'#D7D7B6', inks:{ base:'#A0D1C2', teal:'#0AF2D1', blue:'#0AB9F1', red:'#EE4A1E', yellow:'#F2C234', pink:'#E877A8', orange:'#F28A1E' } },
    { id:'io',   label:'Ø',        sw:['#F4551E','#2F5AE6','#101014','#FFFFFF'], spot:[244,85,30],  paper:'#FFFFFF', stock:'#F2F2F5', inks:{ base:'#C9CEDD', teal:'#2F5AE6', blue:'#2F5AE6', red:'#F4551E', yellow:'#F4551E', pink:'#101014', orange:'#F4551E' } },
    { id:'cold', label:'Cold',     sw:['#1E3A8A','#19B5F0','#7FE3D4','#E6ECEE'], spot:[30,58,138],  paper:'#FFFFFF', stock:'#E6ECEE', inks:{ base:'#B4D6DC', teal:'#7FE3D4', blue:'#19B5F0', red:'#1E3A8A', yellow:'#5B7EF0', pink:'#19B5F0', orange:'#1E3A8A' } },
    { id:'hot',  label:'Hot',      sw:['#F2401C','#F6C31E','#E86AA0','#F1E6DA'], spot:[242,64,28],  paper:'#FFFFFF', stock:'#F1E6DA', inks:{ base:'#F3C9B4', teal:'#F6C31E', blue:'#F2401C', red:'#E86AA0', yellow:'#F6C31E', pink:'#F2401C', orange:'#F28A1E' } }
  ],
  points:[
    {u:0.47,v:0.33,d:'PULL',label:'Behind the pull · cells 2.9 × as tall',t:'sheet-pull',dir:[-1,1]},
    {u:0.50,v:0.05,d:'PULL',label:'Ahead of the pull · cells shrink',t:'sheet-pull',dir:[1,-1]},
    {u:0.80,v:0.38,d:'PULL',label:'Side pull · cells lean along the vector',t:'sheet-pull',dir:[1,-1]},
    {u:0.28,v:0.10,d:'POOL',label:'Cell pool · teal fills the cells',t:'ink-pool',dir:[-1,-1]},
    {u:0.52,v:0.58,d:'POOL',label:'Gutter pool · blue fills between the cells',t:'ink-pool',dir:[1,1]},
    {u:0.88,v:0.60,d:'POOL',label:'Outline pool · yellow outlines the cells',t:'ink-pool',dir:[1,1]},
    {u:0.38,v:0.82,d:'CELL',label:'Solid cell · superellipse, exponent 2.8',t:'ring-cell',dir:[-1,1]},
    {u:0.64,v:0.49,d:'CELL',label:'Outline · band at 0.34 of the cell',t:'ring-cell',dir:[1,-1]},
    {u:0.18,v:0.66,d:'GRAIN',label:'One pixel, one ink · no blur',t:'stochastic-speckle',dir:[-1,1]},
    {u:0.50,v:0.015,d:'EDGE',label:'Margin · 34 u, no rule',t:'paper-margin',dir:[1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[735,956], grammar:'a grid of rounded cells on a warped sheet; pools of ink that fill cells, outline them or fill the gutters; every tone built from noise-thresholded pixels; plain margin' },
    units:'design units, 1000 = sheet width',
    palette:{ paper:'#EFECE6', stock:'#D7D7B6', base:'#A0D1C2', teal:'#0AF2D1', blue:'#0AB9F1', red:'#EE4A1E', yellow:'#F2C234', pink:'#E877A8', orange:'#F28A1E' },
    techniques:[
      { id:'paper-margin', short:'EDGE', name:'Plain margin', layer:0, pass:0, atoms:['margin','stock'],
        params:{ width_u:{ value:34, range:[0,120], unit:'u' }, rule:'none' },
        limits:'Above ~120 u the margin crops the stretched band.',
        implementation:'Flat paper fill; the print sits inset on every side.' },
      { id:'sheet-pull', short:'PULL', name:'Gaussian sheet pulls', layer:1, pass:1, atoms:['domain-warp','gaussian','displacement'],
        params:{ pitch_u:{ value:52, range:[24,160], unit:'u' }, turn_deg:{ value:-8, range:[-45,45], unit:'°' },
          pulls:[ {at:[0.5,0.16],radius_u:310,vec_u:[0,-235]}, {at:[0.93,0.3],radius_u:250,vec_u:[150,-105]}, {at:[0.04,0.86],radius_u:330,vec_u:[-215,20]}, {at:[0.62,1],radius_u:260,vec_u:[60,120]} ],
          strength:{ value:1, range:[0,1.5], note:'multiplies every pull vector' }, radius:{ value:1, range:[0.5,2], note:'multiplies every pull radius' }, swing:{ value:0, range:[0,1], note:'turns and scales the pulls through one cycle; Motion runs it' },
          grab:{ x:{ value:0.5, range:[0,1] }, y:{ value:0.5, range:[0,1] }, pull_u:{ value:0, range:[0,320], unit:'u', note:'a fifth pull, away from the sheet center; Live sets it at the pointer' }, radius_u:{ value:280, range:[80,600], unit:'u' } } },
        limits:'A pull folds the sheet when 0.86 × vector length exceeds its radius; at strength 1 the largest ratio is 0.65. Pitch under ~24 u puts a cell below ten pixels and the outline closes.',
        implementation:'Each pixel is sampled at its own position minus every pull vector times exp(−d² / r²). The grid is read at the sample point, so the sheet stretches behind a pull and bunches ahead of it.' },
      { id:'ring-cell', short:'CELL', name:'Rounded cell', layer:1, pass:1, atoms:['grid','superellipse','ring'],
        params:{ roundness:{ value:2.8, range:[2,8], note:'superellipse exponent; 2 is an ellipse' }, cell_at:{ value:0.33, range:[0.2,0.45], note:'edge of the solid cell, in cell units' }, ring_at:{ value:0.34, range:[0.1,0.42] }, ring_width:{ value:0.1, range:[0.02,0.24] }, gutter_at:{ value:0.43, range:[0.3,0.55] }, edge:{ value:0.04, range:[0.01,0.25], note:'width over which coverage ramps at every edge' } },
        limits:'cell_at above gutter_at removes the stock band between a cell and its gutter. edge above ~0.2 thins every shape to a haze.',
        implementation:'The distance from the cell center is a superellipse. Three shapes are read from it: the solid cell, an outline band, and the gutter past it.' },
      { id:'ink-pool', short:'POOL', name:'Ink pools', layer:1, pass:1, atoms:['palette-field','gaussian','per-cell'],
        params:{ pools:[ {ink:'base',mode:'gutter',at:[0.25,0.25],size:0.42}, {ink:'teal',mode:'cell',at:[0.45,0.08],size:0.22}, {ink:'teal',mode:'cell',at:[0.45,0.31],size:0.19}, {ink:'red',mode:'ring',at:[0.58,0.34],size:0.08}, {ink:'red',mode:'ring',at:[0.93,0.3],size:0.11}, {ink:'orange',mode:'ring',at:[0.95,0.18],size:0.08},
            {ink:'yellow',mode:'ring',at:[0.88,0.55],size:0.12}, {ink:'yellow',mode:'ring',at:[0.9,0.85],size:0.14}, {ink:'blue',mode:'gutter',at:[0.52,0.58],size:0.19}, {ink:'red',mode:'cell',at:[0.38,0.82],size:0.14}, {ink:'orange',mode:'cell',at:[0.08,0.9],size:0.09}, {ink:'pink',mode:'ring',at:[0.1,0.42],size:0.1}, {ink:'blue',mode:'cell',at:[0.58,0.97],size:0.06} ],
          gain:{ value:1, range:[0,2], note:'multiplies every pool' }, size:{ value:1, range:[0.4,2.5], note:'multiplies every pool radius' }, cell_var:{ value:0.25, range:[0,1], note:'how much strength varies cell to cell' }, drift:{ value:0, range:[0,1], note:'moves every pool once around a small loop; Motion runs it' }, seed:{ value:31, range:[1,9999], step:1 } },
        limits:'size above ~2 merges the pools into one field and no region reads. gain under ~0.4 leaves only the stray pixels.',
        implementation:'Each pool has an ink, a center, a gaussian radius and a mode. Its strength is 2.4 × the gaussian, read per pixel and clipped at 1, so the middle of a pool is solid; the mode says which shape of the cell it colors.' },
      { id:'stochastic-speckle', short:'GRAIN', name:'Noise-threshold print', layer:2, pass:2, atoms:['dither','grain','speckle'],
        params:{ gain:{ value:0.92, range:[0.3,1], note:'highest ink coverage' }, stray:{ value:0.12, range:[0,0.35], note:'share of pixels near a pool that take its ink regardless' }, stock_noise:{ value:0.08, range:[0,0.25] }, soften_px:{ value:0, range:[0,3], unit:'px', note:'blur after printing; 0 keeps single pixels' }, seed:{ value:211, range:[1,9999], step:1 } },
        limits:'stray above ~0.25 lifts the stock to a tint. Any soften above 0 turns the pixels into tone and the print reads as blurred.',
        implementation:'Per pixel: ink if a random number is under the coverage, with the ink drawn in proportion to each pool’s share; otherwise stock, or a stray ink pixel.' }
    ],
    pass_order:['margin · paper','pulls · pixel to sample point','cells · solid, outline and gutter coverage','pools · strength per pixel, ink by share','print · one ink or stock per pixel'],
    notes:['Measured on ref.png: stock (215,215,182); pale tint (160,209,194); blue (10,185,241); teal (10,242,209); cell pitch ≈ 38 px at the center (52 u); tallest cells ≈ 110 px; margin ≈ 25 px.','The subject is new: the pulls and pools are a mirror of the reference layout.']
  },
  techniques:{
    'paper-margin': (P,u)=>{ const m=P.width_u*u; return { m, inside:(x,y,W,H)=>x>=m&&x<W-m&&y>=m&&y<H-m }; },
    /* build(W,H).at(x,y) → [column, row, fx, fy], with fx, fy the place in the cell (−0.5..0.5). The array is reused. */
    'sheet-pull': (P,u,A)=>({ build:(W,H)=>{ const L=[]; P.pulls.forEach((p,k)=>{ const ph=6.2832*(P.swing+k/3), ph0=6.2832*k/3; const rot=0.6*(Math.sin(ph)-Math.sin(ph0)), sc=P.strength*(1+0.3*(Math.sin(2*ph+k)-Math.sin(2*ph0+k))); const c=Math.cos(rot), s=Math.sin(rot), r=p.radius_u*u*P.radius; L.push({ x:p.at[0]*W, y:p.at[1]*H, r2:r*r, vx:(p.vec_u[0]*c-p.vec_u[1]*s)*u*sc, vy:(p.vec_u[0]*s+p.vec_u[1]*c)*u*sc }); });
        if(P.grab.pull_u>0){ const gx=P.grab.x*W, gy=P.grab.y*H; const dx=gx-W/2, dy=gy-H/2, n=Math.hypot(dx,dy)||1, r=P.grab.radius_u*u; L.push({ x:gx, y:gy, r2:r*r, vx:dx/n*P.grab.pull_u*u, vy:dy/n*P.grab.pull_u*u }); }
        const a=P.turn_deg*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), p=P.pitch_u*u, out=[0,0,0,0];
        return { at:(x,y)=>{ let qx=x, qy=y; for(let k=0;k<L.length;k++){ const l=L[k]; const dx=x-l.x, dy=y-l.y, d2=dx*dx+dy*dy; if(d2<l.r2*8){ const g=Math.exp(-d2/l.r2); qx-=l.vx*g; qy-=l.vy*g; } }
            const gx=(qx*ca+qy*sa)/p, gy=(-qx*sa+qy*ca)/p; const i=Math.floor(gx), j=Math.floor(gy); out[0]=i; out[1]=j; out[2]=gx-i-0.5; out[3]=gy-j-0.5; return out; } }; } }),
    /* shapes(fx, fy, o) fills o = [solid cell, outline, gutter], each 0..1 */
    'ring-cell': (P,u,A)=>({ shapes:(fx,fy,o)=>{ const n=P.roundness; const d=Math.pow(Math.pow(Math.abs(fx),n)+Math.pow(Math.abs(fy),n),1/n), e=P.edge; o[0]=1-A.sstep(P.cell_at-e*0.5,P.cell_at+e*0.5,d); o[1]=1-A.sstep(P.ring_width*0.5,P.ring_width*0.5+e,Math.abs(d-P.ring_at)); o[2]=A.sstep(P.gutter_at-e*0.5,P.gutter_at+e*0.5,d); return o; } }),
    /* build(W,H) → pools in device px: { ink, m (0 cell, 1 outline, 2 gutter), x, y, r2, cut, gain } */
    'ink-pool': (P,u,A)=>({ cell_var:P.cell_var, hash:(i,j)=>{ let h=(i*374761393+j*668265263+P.seed*2246822519)|0; h=(h^(h>>>13))*1274126177|0; h=h^(h>>>16); return (h>>>0)/4294967296; },
      build:(W,H)=>{ const a=6.2832*P.drift; return P.pools.map((p,k)=>{ const r=p.size*P.size*W; return { ink:p.ink, m:p.mode==='cell'?0:(p.mode==='ring'?1:2), x:(p.at[0]+0.06*(Math.cos(a+k*1.7)-Math.cos(k*1.7)))*W, y:(p.at[1]+0.05*(Math.sin(a+k*2.3)-Math.sin(k*2.3)))*H, r2:r*r, cut:r*r*5, gain:P.gain*2.4 }; }); } }),
    'stochastic-speckle': (P,u,A)=>({ r:A.rng(P.seed), gain:P.gain, stray:P.stray, noise:P.stock_noise, soften:P.soften_px })
  },
  /* shared by render, motion and live: prints the sheet into pixel data at any size */
  paint(d,W,H,V,O){ const A=window.ART, S=window.STUDY, T=S.techniques, P=A.params(S.spec,O), u=W/1000;
    const margin=T['paper-margin'](P['paper-margin'],u), sheet=T['sheet-pull'](P['sheet-pull'],u,A).build(W,H), cells=T['ring-cell'](P['ring-cell'],u,A), pool=T['ink-pool'](P['ink-pool'],u,A), print=T['stochastic-speckle'](P['stochastic-speckle'],u,A);
    const list=pool.build(W,H), n=list.length, col=list.map(p=>A.hex(V.inks[p.ink])); const paper=A.hex(V.paper), stock=A.hex(V.stock); const r=print.r, sh=[0,0,0], cv=pool.cell_var;
    for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const o=(y*W+X)*4; let c0=paper[0], c1=paper[1], c2=paper[2];
      if(margin.inside(X,y,W,H)){ const q=sheet.at(X,y); cells.shapes(q[2],q[3],sh); const sv=1-cv*pool.hash(q[0],q[1]); let tot=0, near=0, pick=-1, stray=-1;
        for(let k=0;k<n;k++){ const p=list[k]; const dx=X-p.x, dy=y-p.y, d2=dx*dx+dy*dy; if(d2>p.cut)continue; let s=p.gain*Math.exp(-d2/p.r2); if(s>1)s=1; near+=s; if(r()*near<s)stray=k; const c=s*(p.m===2?1:sv)*sh[p.m]; if(c>0.004){ tot+=c; if(r()*tot<c)pick=k; } }
        let k=-1; if(pick>=0&&r()<(tot>1?1:tot)*print.gain)k=pick; else if(stray>=0&&r()<print.stray*(near>1?1:near))k=stray;
        if(k>=0){ const c=col[k]; c0=c[0]; c1=c[1]; c2=c[2]; } else { const m=1+(r()*2-1)*print.noise; c0=stock[0]*m; c1=stock[1]*m; c2=stock[2]*m; } }
      d[o]=c0; d[o+1]=c1; d[o+2]=c2; d[o+3]=255; }
    return print.soften; },
  render(canvas,w,h,dpr,V,done,O){ const A=window.ART; const W=canvas.width, H=canvas.height; const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const id=x.createImageData(W,H); const soften=window.STUDY.paint(id.data,W,H,V,O); x.putImageData(id,0,0);
    if(soften>0){ const soft=A.blur(canvas,soften*dpr); x.drawImage(soft,0,0); }
    if(done)done(); },
  /* motion: the pulls swing through one cycle every 16 s and the pools loop every 22 s; printed at half size, shown without smoothing */
  motion(canvas,w,h,dpr,V,t,ctx){ const S=window.STUDY; const W=Math.round(canvas.width/2), H=Math.round(canvas.height/2); if(!S._m||S._m.width!==W||S._m.height!==H){ S._m=document.createElement('canvas'); S._m.width=W; S._m.height=H; }
    const mx=S._m.getContext('2d'); const id=mx.createImageData(W,H); S.paint(id.data,W,H,V,{ 'sheet-pull':{ swing:(t/16)%1 }, 'ink-pool':{ drift:(t/22)%1 } }); mx.putImageData(id,0,0);
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false; ctx.drawImage(S._m,0,0,canvas.width,canvas.height); ctx.restore(); },
  /* live: a fifth pull sits under the pointer */
  pointer(px,py){ return { 'sheet-pull':{ 'grab.x':px, 'grab.y':py, 'grab.pull_u':230 } }; },
  liveScale:0.5,
  live(V){ const S=window.STUDY, A=window.ART; const fn=f=>{ const s=f.toString(); return /^(function\b|\(|[\w$]+\s*=>)/.test(s)?s:'function '+s; };
    const art=Object.keys(A).map(k=>'A.'+k+'='+fn(A[k])+';').join('\n'); const tech='{'+Object.keys(S.techniques).map(k=>JSON.stringify(k)+':'+fn(S.techniques[k])).join(',')+'}';
    const extra=Object.keys(S).filter(k=>typeof S[k]==='function'&&k!=='live'&&k!=='motion').map(k=>k+':'+fn(S[k])).join(',');
    return `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="../../_shared/fonts.css"><style>html,body{margin:0;height:100%;overflow:hidden}canvas{width:100%;height:100%;display:block;cursor:crosshair;touch-action:none;image-rendering:pixelated}</style><canvas id="c"></canvas><script>
const A={};${art}
window.ART=A; window.STUDY={spec:${JSON.stringify(S.spec)},techniques:${tech},${extra}};
const S=window.STUDY,V=${JSON.stringify(V)},c=document.getElementById('c'),d=${S.liveScale||0.6};let px=0.5,py=0.5,q=0;
const draw=()=>{q=0;c.width=Math.max(2,Math.round(innerWidth*d));c.height=Math.max(2,Math.round(innerHeight*d));S.render(c,innerWidth,innerHeight,d,V,null,S.pointer(px,py));};
addEventListener('pointermove',e=>{px=e.clientX/innerWidth;py=e.clientY/innerHeight;if(!q)q=requestAnimationFrame(draw);});addEventListener('resize',draw);(document.fonts?document.fonts.ready:Promise.resolve()).then(draw);
<\/script>`; }
};
