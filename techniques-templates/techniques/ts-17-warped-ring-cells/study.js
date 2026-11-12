window.STUDY={
  id:'ts-17-warped-ring-cells', code:'TS-17', fig:'1.17',
  title:'Warped ring cells',
  kicker:'Technique · TS-17',
  lede:'A grid of ringed cells pulled through a lens, printed as speckle.',
  body:[
    'A square grid of rounded cells, pitch 64 u, turned 14°. Each cell carries an outer ring and, in most cells, a thin inner ring. The grid is read through a pinch lens: sample positions are pulled toward the lens center, so cells far from it stretch along the radius.',
    'Ink color comes from five anchors blended by distance and fixed per cell. Every pixel is thresholded against noise, so rings are speckle, not line, and stray color pixels land on the stock between them. A 34 u margin frames the sheet.'
  ],
  source:'Reference 17 · warped grid of grainy color rings, 735 × 956',
  spot:[25,181,240], ref:{w:735,h:956},
  variantLabel:'Inks',
  variants:[
    { id:'ref',  label:'Five ink', sw:['#17DDBE','#19B5F0','#F2401C','#F6C31E','#E0D3B4'], spot:[25,181,240], paper:'#EFEBE7', stock:'#E0D3B4', inks:['#17DDBE','#19B5F0','#F2401C','#F6C31E','#E86AA0'] },
    { id:'io',   label:'Ø',        sw:['#F4551E','#2F5AE6','#101014','#FFFFFF'], spot:[244,85,30],  paper:'#FFFFFF', stock:'#F1F1F4', inks:['#2F5AE6','#2F5AE6','#F4551E','#F4551E','#101014'] },
    { id:'cold', label:'Cold',     sw:['#1E3A8A','#19B5F0','#7FE3D4','#EEF2F4'], spot:[30,58,138],  paper:'#FFFFFF', stock:'#E4EAEE', inks:['#7FE3D4','#19B5F0','#1E3A8A','#5B7EF0','#19B5F0'] },
    { id:'hot',  label:'Hot',      sw:['#F2401C','#F6C31E','#E86AA0','#F4EFEA'], spot:[242,64,28],  paper:'#FFFFFF', stock:'#F0E6DC', inks:['#F6C31E','#F2401C','#E86AA0','#F6C31E','#F2401C'] }
  ],
  points:[
    {u:0.50,v:0.52,d:'WARP',label:'Lens center · cells are smallest here',t:'lens-warp',dir:[1,1]},
    {u:0.46,v:0.14,d:'WARP',label:'Far from the center · cells stretch along the radius',t:'lens-warp',dir:[-1,-1]},
    {u:0.30,v:0.44,d:'CELL',label:'Outer ring · band at 0.37 of the cell, rounded square',t:'ring-cell',dir:[-1,-1]},
    {u:0.66,v:0.40,d:'CELL',label:'Inner ring · band at 0.2, in 7 cells of 10',t:'ring-cell',dir:[1,-1]},
    {u:0.56,v:0.62,d:'CELL',label:'Gutters · up to 60 % ink between cells near the center',t:'ring-cell',dir:[1,1]},
    {u:0.74,v:0.80,d:'HUE',label:'Ink anchor · red, lower right',t:'hue-field',dir:[1,1]},
    {u:0.14,v:0.66,d:'HUE',label:'Ink anchor · yellow, left edge',t:'hue-field',dir:[-1,1]},
    {u:0.86,v:0.30,d:'GRAIN',label:'Stray pixels · 15 % of stock pixels take an ink',t:'stochastic-speckle',dir:[1,-1]},
    {u:0.22,v:0.88,d:'GRAIN',label:'Ring edge · thresholded against noise, no hard line',t:'stochastic-speckle',dir:[-1,1]},
    {u:0.50,v:0.015,d:'EDGE',label:'Margin · 34 u, no rule',t:'paper-margin',dir:[1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[735,956], grammar:'a grid of rounded ring cells seen through a lens distortion; five inks placed by region; every tone built from noise-thresholded pixels; plain margin' },
    units:'design units, 1000 = sheet width',
    palette:{ paper:'#EFEBE7', stock:'#E0D3B4', teal:'#17DDBE', blue:'#19B5F0', red:'#F2401C', yellow:'#F6C31E', pink:'#E86AA0' },
    techniques:[
      { id:'paper-margin', short:'EDGE', name:'Plain margin', layer:0, pass:0, atoms:['margin','stock'],
        params:{ width_u:{ value:34, range:[0,120], unit:'u' }, rule:'none' },
        limits:'Above ~120 u the margin crops the stretched cells at the sheet edge.',
        implementation:'Flat paper fill; the print sits inset on every side.' },
      { id:'lens-warp', short:'WARP', name:'Pinch lens', layer:1, pass:1, atoms:['domain-warp','radial','lens'],
        params:{ center_u:[520,700], radius_u:{ value:700, range:[200,1600], unit:'u' }, k:{ value:0.85, range:[-0.6,3], note:'pinch strength; negative bulges' }, stretch_y:{ value:1.1, range:[-0.8,1.6], note:'extra pull above the center' }, q:'c + d / (1 + k·|d/R|²), with d.y scaled by 1 − stretch_y·clamp(−d.y/R, 0, 1)·0.5' },
        limits:'k below about −0.6 folds the grid over itself inside the sheet. k above ~3 stretches the outer cells past the sheet and they read as bars.',
        implementation:'Each pixel is mapped to a sample point pulled toward the lens center by 1/(1 + k·r²); the grid is evaluated at the sample point.' },
      { id:'ring-cell', short:'CELL', name:'Ringed rounded cell', layer:1, pass:1, atoms:['grid','superellipse','ring'],
        params:{ pitch_u:{ value:64, range:[28,160], unit:'u' }, turn_deg:{ value:14, range:[-45,45], unit:'°' }, roundness:{ value:2.7, range:[2,8], note:'superellipse exponent; 2 is a circle' },
          outer:{ at:{ value:0.37, range:[0.3,0.5] }, width:{ value:0.05, range:[0.02,0.16] }, grow:{ value:0.07, range:[0,0.25], note:'added width at full field strength' } },
          gutter:{ tint:{ value:0.6, range:[0,0.9], note:'ink coverage between cells' } }, edge:{ value:0.075, range:[0.01,0.2], note:'softness of a band edge, in cell units' },
          inner:{ at:{ value:0.2, range:[0.1,0.3] }, width:{ value:0.04, range:[0.01,0.1] }, share:{ value:0.7, range:[0,1], note:'share of cells that carry it' } },
          field:{ sigma_u:{ value:400, range:[150,1200], unit:'u' }, floor:{ value:0.1, range:[0,1] } }, cell_var:{ value:0.55, range:[0,1], note:'how much ring strength varies cell to cell' }, seed:{ value:31, range:[1,9999], step:1 } },
        limits:'outer.at + width + grow above ~0.6 closes every gutter and the cells read as holes in a flat tint. Pitch under ~28 u falls below the speckle and the rings vanish.',
        implementation:'Inside each cell the distance to the center is measured as a superellipse; two bands of that distance carry ink and the space past 0.45 carries a lighter tint. Both strengthen with a gaussian field centered on the lens.' },
      { id:'hue-field', short:'HUE', name:'Anchored ink regions', layer:1, pass:1, atoms:['palette-field','per-cell'],
        params:{ anchors_u:[[480,130],[520,640],[760,1040],[60,860],[960,420]], sharpness:{ value:3, range:[1,8], note:'higher gives harder region borders' }, mix:{ value:0.38, range:[0,0.5], note:'chance that a cell takes its second-nearest ink' }, inner:'the inner ring takes the next ink in the list' },
        limits:'sharpness under ~1.5 mixes every region and no ink dominates anywhere. mix above ~0.4 reads as random color.',
        implementation:'Five anchor points carry one ink each. A cell takes the ink of its nearest anchor, or with up to 30 % chance the second nearest.' },
      { id:'stochastic-speckle', short:'GRAIN', name:'Noise-threshold print', layer:2, pass:2, atoms:['dither','grain','speckle'],
        params:{ gain:{ value:0.82, range:[0.3,1], note:'highest ink coverage' }, stray:{ value:0.15, range:[0,0.3], note:'share of stock pixels that take an ink' }, stock_noise:{ value:0.1, range:[0,0.2] }, soften_px:{ value:0.8, range:[0,3], unit:'px' }, seed:{ value:211, range:[1,9999], step:1 } },
        limits:'stray above ~0.2 lifts the stock to a tint and the rings lose contrast. soften above ~1.5 px turns the speckle into tone.',
        implementation:'Per pixel: ink if a random number is under the coverage, else stock; a share of stock pixels take a random ink. A 0.8 px blur follows.' }
    ],
    pass_order:['margin · paper','warp · pixel to sample point','cells · two ring bands per cell, ink by region','print · noise threshold per pixel, stray ink on stock','soften · 0.8 px blur'],
    notes:['Measured on ref.png: cell pitch ≈ 47 px at the center (64 u); margin ≈ 25 px (34 u); grain std ≈ 24/255 on the stock.','The subject is new: lens center, grid turn and ink regions differ from the reference.']
  },
  techniques:{
    'paper-margin': (P,u)=>{ const m=P.width_u*u; return { m, inside:(x,y,W,H)=>x>=m&&x<W-m&&y>=m&&y<H-m }; },
    'lens-warp': (P,u,A)=>{ const cx=P.center_u[0]*u, cy=P.center_u[1]*u, R=P.radius_u*u; return { cx, cy, map:(x,y)=>{ let dx=x-cx, dy=y-cy; dy*=1-P.stretch_y*A.clamp(-dy/R,0,1)*0.5; const f=1/(1+P.k*(dx*dx+dy*dy)/(R*R)); return [cx+dx*f, cy+dy*f]; } }; },
    'ring-cell': (P,u,A)=>{ const p=P.pitch_u*u, a=P.turn_deg*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), n=P.roundness, sig=P.field.sigma_u*u;
      const hash=(i,j,k)=>{ let h=(i*374761393+j*668265263+k*1274126177+P.seed*2246822519)|0; h=(h^(h>>>13))*1274126177|0; h=h^(h>>>16); return (h>>>0)/4294967296; };
      const band=(d,at,w)=>1-A.sstep(w*0.5,w*0.5+P.edge,Math.abs(d-at));
      return { hash, cell:(qx,qy,cx,cy)=>{ const gx=(qx*ca+qy*sa)/p, gy=(-qx*sa+qy*ca)/p; const i=Math.floor(gx), j=Math.floor(gy); const fx=gx-i-0.5, fy=gy-j-0.5; const d=Math.pow(Math.pow(Math.abs(fx),n)+Math.pow(Math.abs(fy),n),1/n);
          const mx=((i+0.5)*ca-(j+0.5)*sa)*p-cx, my=((i+0.5)*sa+(j+0.5)*ca)*p-cy; const F=P.field.floor+(1-P.field.floor)*Math.exp(-(mx*mx+my*my)/(sig*sig));
          const sv=1-P.cell_var*hash(i,j,3); const o=band(d,P.outer.at+P.outer.grow*F*0.5,P.outer.width+P.outer.grow*F)*(0.55+0.45*F)*sv; const inn=hash(i,j,1)<P.inner.share?band(d,P.inner.at,P.inner.width)*(0.5+0.5*F):0;
          return { i, j, outer:Math.max(o,A.sstep(0.45,0.53,d)*P.gutter.tint*(0.15+0.85*F)), inner:inn, px:mx+cx, py:my+cy }; } }; },
    'hue-field': (P,u,A)=>{ const an=P.anchors_u.map(a=>[a[0]*u,a[1]*u]); return { pick:(x,y,h)=>{ let b=0, s=1, bd=1e30, sd=1e30; for(let k=0;k<an.length;k++){ const d=Math.hypot(x-an[k][0],y-an[k][1]); if(d<bd){ sd=bd; s=b; bd=d; b=k; } else if(d<sd){ sd=d; s=k; } }
        const near=Math.pow(bd/(sd+1e-6),P.sharpness); return h<P.mix*(0.4+1.2*near)?s:b; }, count:an.length }; },
    'stochastic-speckle': (P,u,A)=>{ const r=A.rng(P.seed); return { soften:P.soften_px, px:(cov,ink,stock,inks)=>{ if(r()<cov*P.gain)return ink; const t=r(); if(t<P.stray)return inks[(r()*inks.length)|0]; const m=1+(r()*2-1)*P.stock_noise; return [stock[0]*m,stock[1]*m,stock[2]*m]; } }; }
  },
  render(canvas,w,h,dpr,V,done,O){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const S=window.STUDY; const T=S.techniques, P=A.params(S.spec,O);
    const margin=T['paper-margin'](P['paper-margin'],u), lens=T['lens-warp'](P['lens-warp'],u,A), cells=T['ring-cell'](P['ring-cell'],u,A), hue=T['hue-field'](P['hue-field'],u,A), print=T['stochastic-speckle'](P['stochastic-speckle'],u,A);
    const paper=A.hex(V.paper), stock=A.hex(V.stock), inks=V.inks.map(A.hex);
    const id=x.createImageData(W,H); const d=id.data;
    for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const i=(y*W+X)*4; let c=paper;
      if(margin.inside(X,y,W,H)){ const q=lens.map(X,y); const k=cells.cell(q[0],q[1],lens.cx,lens.cy);
        const a=hue.pick(k.px,k.py,cells.hash(k.i,k.j,2)); const cov=Math.max(k.outer,k.inner); const ink=k.inner>k.outer?inks[(a+1)%inks.length]:inks[a%inks.length];
        c=print.px(cov,ink,stock,inks); }
      d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; d[i+3]=255; }
    x.putImageData(id,0,0);
    if(print.soften>0){ const soft=A.blur(canvas,print.soften*dpr); x.drawImage(soft,0,0); }
    if(done)done();
  }
};
