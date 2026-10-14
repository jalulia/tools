window.STUDY={
  id:'ts-01-moire-ring-screens', code:'TS-01', fig:'1.1',
  title:'Moiré from two ring screens',
  kicker:'Technique · TS-01',
  lede:'Two ring gratings multiplied, screened as two inks, one hot core.',
  body:[
    'Two ink plates. Blue is the product of two concentric-ring gratings — centers apart, pitches 68 and 60 u. Where the rings cross they make a dot lattice; the 8 u pitch difference beats into the long fringes. Red is a radial falloff from the core, shaped by grating A so the rings carry through it.',
    'Each ink is thresholded per pixel against white noise: every mid-tone is a mix of paper, blue, red and overprint. That mix is the grain, not a layer on top. A 34 u cream margin frames the sheet.'
  ],
  source:'Reference 01 · red-and-blue moiré print, 735 × 956',
  spot:[224,64,45], ref:{w:735,h:956},
  variantLabel:'Inks',
  variants:[
    { id:'ref', label:'Red / blue', sw:['#E0402D','#5287BB','#F0EBE7'], spot:[224,64,45], paper:'#F0EBE7', field:'#DCD8DC', inkA:'#3670B8', inkB:'#F2381C', overCore:'#F58A80', overFar:'#7A3A6A' },
    { id:'io',  label:'Ember / sky', sw:['#F4551E','#2F5AE6','#FFFFFF'], spot:[244,85,30], paper:'#FFFFFF', field:'#F4F0F2', inkA:'#2F5AE6', inkB:'#F4551E', overCore:'#FF9A6E', overFar:'#3A2E9E' },
    { id:'ink', label:'Ink / gray', sw:['#101014','#B4B2AC','#FFFFFF'], spot:[16,16,20], paper:'#FFFFFF', field:'#FFFFFF', inkA:'#8C8A84', inkB:'#101014', overCore:'#5A5A60', overFar:'#101014' }
  ],
  points:[
    {u:0.44,v:0.49,d:'HEAT',label:'Red core · clipped gaussian, σ 0.33 W, off-center left',t:'radial-heat',dir:[1,1]},
    {u:0.30,v:0.36,d:'SCRN',label:'Ring grating A · center at the core, pitch 68 u',t:'ring-screen',dir:[-1,-1]},
    {u:0.74,v:0.22,d:'SCRN',label:'Ring grating B · center off-sheet top-right, pitch 60 u',t:'ring-screen',dir:[1,-1]},
    {u:0.62,v:0.62,d:'MOIR',label:'Dot lattice · product of the two gratings',t:'moire-product',dir:[1,1]},
    {u:0.20,v:0.72,d:'MOIR',label:'Beat fringe · pitch difference 8 u makes the long curves',t:'moire-product',dir:[-1,1]},
    {u:0.14,v:0.20,d:'GRAIN',label:'Stochastic screen · random threshold per ink per pixel',t:'stochastic-grain',dir:[-1,-1]},
    {u:0.86,v:0.86,d:'GRAIN',label:'Overprint pixels · both inks on → plum far out, pink in the core',t:'stochastic-grain',dir:[1,1]},
    {u:0.50,v:0.08,d:'EDGE',label:'Cream margin · 34 u, no rule',t:'paper-margin',dir:[1,-1]},
    {u:0.40,v:0.94,d:'HEAT',label:'Heat tail · red coverage falls below 0.1 here',t:'radial-heat',dir:[-1,1]},
    {u:0.88,v:0.45,d:'SCRN',label:'Ring A at the rim · coverage floor 0.42 keeps the field blue',t:'ring-screen',dir:[1,0]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[735,956], grammar:'two-ink stochastic print: blue dot lattice from two ring gratings, red radial core, cream margin; grain is the screening itself' },
    units:'design units, 1000 = sheet width',
    palette:{ paper:'#F0EBE7', field_tint:'#E6D6D8', blue:'#3670B8', red:'#F2381C', overprint_core:'#F58A80', overprint_far:'#8A4A78' },
    /* spec v2: numeric params carry { value, range, unit } — value is the measured number, range the band the technique
       holds together in; limits says where it stops holding. Strings stay as documentation of the formula. */
    techniques:[
      { id:'ring-screen', short:'SCRN', name:'Concentric ring grating', layer:1, pass:1, atoms:['grating','radial'],
        params:{ A:{ center_u:[440,640], pitch_u:{ value:68, range:[24,160], unit:'u' } }, B:{ center_u:[1420,-260], pitch_u:{ value:60, range:[24,160], unit:'u' } }, profile:'0.5 + 0.5·cos(2π·d/pitch)', floor:{ value:0.42, range:[0,0.9], note:'base blue coverage' } },
        limits:'Pitches within ~4 u of each other push the beat fringe past the sheet; equal pitches collapse the moiré to one ring set. Below ~30 u the rings alias into the screen.',
        implementation:'g(p) = 0.5+0.5·cos(2π·|p−c|/pitch) for each grating; the floor keeps a base blue coverage so the field never drops to paper.' },
      { id:'moire-product', short:'MOIR', name:'Grating product (moiré)', layer:1, pass:1, atoms:['moire','interference'],
        params:{ blue_coverage:'floor + (1−floor)·smoothstep(knee_lo, knee_hi, (gA·gB)^gamma)', beat_pitch_u:'1/(1/60−1/68) ≈ 510', knee_lo:{ value:0.10, range:[0,0.5] }, knee_hi:{ value:0.75, range:[0.5,1] }, gamma:{ value:1.4, range:[0.5,3] } },
        limits:'knee_lo ≥ knee_hi inverts the smoothstep. gamma below ~0.8 fills the lattice to a flat tint; above ~2.5 the dots shrink to specks.',
        implementation:'Multiplying the two gratings gives a dot lattice where both are high and long beat fringes where their phases drift; nothing is drawn as a dot — the lattice is the product.' },
      { id:'radial-heat', short:'HEAT', name:'Radial red core', layer:2, pass:2, atoms:['radial','falloff'],
        params:{ center_u:[440,640], sigma_u:{ value:330, range:[80,900], unit:'u' }, gain:{ value:1.35, range:[0.5,3] }, red_coverage:'min(1, gain·exp(−d²/σ²))', cutoff:{ value:0.02, range:[0,0.2], note:'red coverage below this prints nothing' } },
        limits:'gain above ~2 saturates the core to a flat disc; sigma above ~700 u floods the sheet and the blue lattice no longer reads through.',
        implementation:'Red coverage is a clipped gaussian of distance from the core; inside it the blue lattice overprints as a lighter pink, which is how the rings read through the red.' },
      { id:'stochastic-grain', short:'GRAIN', name:'Stochastic two-ink screen', layer:3, pass:3, atoms:['dither','grain','overprint'],
        params:{ threshold:'uniform random per pixel per ink', seed:{ value:101, range:[1,9999], step:1 }, overprint:'where both inks land: overCore pink in the field, overFar plum on lattice dots (product > plum_above) inside the core', plum_above:{ value:0.7, range:[0.3,1] }, soften_px:{ value:0.6, range:[0,3], unit:'px' }, cell_px:1 },
        limits:'soften above ~1.5 px dissolves the lattice into tone; cell_px is fixed at 1 in this rebuild (a coarser cell needs a hash per cell, not per pixel).',
        implementation:'For each device pixel: blue if r1 < blue_coverage, red if r2 < red_coverage; both → overprint; neither → paper tint. A 0.6 px blur softens the pixel edges the way the reference’s scan does.' },
      { id:'paper-margin', short:'EDGE', name:'Cream margin', layer:0, pass:0, atoms:['margin','stock'],
        params:{ width_u:{ value:34, range:[0,120], unit:'u' }, color:'#F0EBE7', rule:'none' },
        limits:'Above ~120 u the margin crops the beat fringe at the left edge.',
        implementation:'Flat cream fill; the print sits inset by 34 u on every side.' }
    ],
    pass_order:['margin · cream sheet','gratings · A and B evaluated per pixel','coverage · blue = product, red = radial × A','screen · random threshold per ink, overprint where both','soften · 0.6 px blur'],
    notes:['Measured on ref.png: ring pitch ≈ 50 px at 735 px (68 u); grain std ≈ 20/255 in flat regions; hot red (241,57,29) 3.6 % of pixels; saturated blue (72,130,183) 11.5 %.','Seed 101.']
  },
  /* v2 · techniques as functions — one per spec id, pure, composed by render() in pass order. P is this technique's
     params resolved to plain values (A.params), u = device px per design unit. _build/build.mjs lifts each one into
     lib/<id>.js as a self-contained module. */
  techniques:{
    'paper-margin': (P,u)=>{ const m=P.width_u*u; return { m, inside:(x,y,W,H)=>x>=m&&x<W-m&&y>=m&&y<H-m }; },
    'ring-screen': (P,u)=>{ const g=(c,pitch)=>({ cx:c[0]*u, cy:c[1]*u, pitch:pitch*u }); return { A:g(P.A.center_u,P.A.pitch_u), B:g(P.B.center_u,P.B.pitch_u), floor:P.floor, g:(d,pitch)=>0.5+0.5*Math.cos(6.2832*d/pitch) }; },
    'moire-product': (P,A)=>({ prod:(gA,gB)=>A.sstep(P.knee_lo,P.knee_hi,Math.pow(gA*gB,P.gamma)), coverage:(prod,floor)=>floor+(1-floor)*prod }),
    'radial-heat': (P,u)=>{ const cx=P.center_u[0]*u, cy=P.center_u[1]*u, sig=P.sigma_u*u, gain=P.gain; return { cx, cy, cutoff:P.cutoff, cov:d=>Math.min(1,gain*Math.exp(-(d*d)/(sig*sig))) }; },
    'stochastic-grain': (P,A,V)=>{ const r=A.rng(P.seed); const oc=A.hex(V.overCore), of=A.hex(V.overFar); const plum=P.plum_above;
      return { soften:P.soften_px, ink:(blue,red,prod,cutoff,inkA,inkB,field)=>{ const b=r()<blue, rr=red>cutoff&&r()<red; return b&&rr?(prod>plum?A.mix(of,oc,1-red):oc):(rr?inkB:(b?inkA:field)); } }; }
  },
  render(canvas,w,h,dpr,V,done,O){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d');
    const paper=A.hex(V.paper), field=A.hex(V.field), inkA=A.hex(V.inkA), inkB=A.hex(V.inkB);
    const S=window.STUDY; const T=S.techniques, P=A.params(S.spec,O);
    const margin=T['paper-margin'](P['paper-margin'],u), ring=T['ring-screen'](P['ring-screen'],u), moire=T['moire-product'](P['moire-product'],A), heat=T['radial-heat'](P['radial-heat'],u), screen=T['stochastic-grain'](P['stochastic-grain'],A,V);
    const id=x.createImageData(W,H); const d=id.data;
    for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const i=(y*W+X)*4; let c=paper;
      if(margin.inside(X,y,W,H)){ const dA=Math.hypot(X-ring.A.cx,y-ring.A.cy), dB=Math.hypot(X-ring.B.cx,y-ring.B.cy); const gA=ring.g(dA,ring.A.pitch), gB=ring.g(dB,ring.B.pitch);
        const prod=moire.prod(gA,gB); const blue=moire.coverage(prod,ring.floor); const red=heat.cov(Math.hypot(X-heat.cx,y-heat.cy));
        c=screen.ink(blue,red,prod,heat.cutoff,inkA,inkB,field); }
      d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; d[i+3]=255; }
    x.putImageData(id,0,0);
    if(screen.soften>0){ const soft=A.blur(canvas,screen.soften*dpr); x.setTransform(1,0,0,1,0,0); x.drawImage(soft,0,0); }
    if(done)done();
  }
};
