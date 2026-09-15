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
    techniques:[
      { id:'ring-screen', short:'SCRN', name:'Concentric ring grating', layer:1, pass:1, atoms:['grating','radial'],
        params:{ A:{center_u:[440,640],pitch_u:68}, B:{center_u:[1420,-260],pitch_u:60}, profile:'0.5 + 0.5·cos(2π·d/pitch)', floor:0.42 },
        implementation:'g(p) = 0.5+0.5·cos(2π·|p−c|/pitch) for each grating; the floor keeps a base blue coverage so the field never drops to paper.' },
      { id:'moire-product', short:'MOIR', name:'Grating product (moiré)', layer:1, pass:1, atoms:['moire','interference'],
        params:{ blue_coverage:'floor + (1−floor)·smoothstep(0.10, 0.75, (gA·gB)^1.4)', beat_pitch_u:'1/(1/60−1/68) ≈ 510' },
        implementation:'Multiplying the two gratings gives a dot lattice where both are high and long beat fringes where their phases drift; nothing is drawn as a dot — the lattice is the product.' },
      { id:'radial-heat', short:'HEAT', name:'Radial red core', layer:2, pass:2, atoms:['radial','falloff'],
        params:{ center_u:[440,640], sigma_u:330, red_coverage:'min(1, 1.35·exp(−d²/σ²))', cutoff:0.02 },
        implementation:'Red coverage is a clipped gaussian of distance from the core; inside it the blue lattice overprints as a lighter pink, which is how the rings read through the red.' },
      { id:'stochastic-grain', short:'GRAIN', name:'Stochastic two-ink screen', layer:3, pass:3, atoms:['dither','grain','overprint'],
        params:{ threshold:'uniform random per pixel per ink (seed 101)', overprint:'where both inks land: #F58A80 pink in the field, #7A3A6A plum on lattice dots (product > 0.7) inside the core', soften_px:0.6, cell_px:1 },
        implementation:'For each device pixel: blue if r1 < blue_coverage, red if r2 < red_coverage; both → overprint; neither → paper tint. A 0.6 px blur softens the pixel edges the way the reference’s scan does.' },
      { id:'paper-margin', short:'EDGE', name:'Cream margin', layer:0, pass:0, atoms:['margin','stock'],
        params:{ width_u:34, color:'#F0EBE7', rule:'none' },
        implementation:'Flat cream fill; the print sits inset by 34 u on every side.' }
    ],
    pass_order:['margin · cream sheet','gratings · A and B evaluated per pixel','coverage · blue = product, red = radial × A','screen · random threshold per ink, overprint where both','soften · 0.6 px blur'],
    notes:['Measured on ref.png: ring pitch ≈ 50 px at 735 px (68 u); grain std ≈ 20/255 in flat regions; hot red (241,57,29) 3.6 % of pixels; saturated blue (72,130,183) 11.5 %.','Seed 101.']
  },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d');
    const paper=A.hex(V.paper), field=A.hex(V.field), inkA=A.hex(V.inkA), inkB=A.hex(V.inkB), oc=A.hex(V.overCore), of=A.hex(V.overFar);
    const m=34*u; const id=x.createImageData(W,H); const d=id.data; const r=A.rng(101);
    const cA=[440*u,640*u], cB=[1420*u,-260*u], pA=68*u, pB=60*u, sig=330*u, floor=0.42;
    for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const i=(y*W+X)*4; let c=paper;
      if(X>=m&&X<W-m&&y>=m&&y<H-m){ const dA=Math.hypot(X-cA[0],y-cA[1]), dB=Math.hypot(X-cB[0],y-cB[1]); const gA=0.5+0.5*Math.cos(6.2832*dA/pA), gB=0.5+0.5*Math.cos(6.2832*dB/pB);
        const prod=A.sstep(0.10,0.75,Math.pow(gA*gB,1.4)); const blue=floor+(1-floor)*prod; const red=Math.min(1,1.35*Math.exp(-(dA*dA)/(sig*sig)));
        const b=r()<blue, rr=red>0.02&&r()<red; c=b&&rr?(prod>0.7?A.mix(of,oc,1-red):oc):(rr?inkB:(b?inkA:field)); }
      d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; d[i+3]=255; }
    x.putImageData(id,0,0);
    const soft=A.blur(canvas,0.6*dpr); x.setTransform(1,0,0,1,0,0); x.drawImage(soft,0,0);
  }
};
