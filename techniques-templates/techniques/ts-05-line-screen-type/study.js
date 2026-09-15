window.STUDY={
  id:'ts-05-line-screen-type', code:'TS-05', fig:'1.5',
  title:'Vertical line-screen type',
  kicker:'Technique · TS-05',
  lede:'Heavy type cut into vertical bars; bar width follows a phase field.',
  body:[
    'One ink on warm paper. Four lines of display type are set with leading shorter than the ascender, so each line overlaps the one above. The type is not printed as type — it prints through a vertical line screen at fixed pitch, and a bar exists only where the letter mask is on. Where two lines overlap the mask doubles and the bars swell to solid.',
    'A low phase field shifts each bar a few units sideways and steps some regions by half a pitch, so bars break against each other at letter edges. A 0.7 px bleed rounds the bar ends, interiors print a shade darker, and the sheet carries tooth and a faint mottle.'
  ],
  source:'Reference 05 · line-screened slab-serif type on gray stock, 1448 × 936',
  spot:[81,77,74], ref:{w:1448,h:936},
  variantLabel:'Color',
  variants:[
    { id:'ref', label:'As reference', sw:['#514D4A','#E5E1DB'], spot:[81,77,74], paper:'#E5E1DB', ink:'#514D4A', inkDeep:'#3E3A38', caption:'#4A4643', mottle:0.035 },
    { id:'io',  label:'Ember',        sw:['#F4551E','#FFFFFF'], spot:[244,85,30], paper:'#FFFFFF', ink:'#F4551E', inkDeep:'#D9420F', caption:'#F4551E', mottle:0.02 },
    { id:'rev', label:'Reverse',      sw:['#FFFFFF','#101014'], spot:[255,255,255], paper:'#101014', ink:'#FFFFFF', inkDeep:'#FFFFFF', caption:'#FFFFFF', mottle:0.05 }
  ],
  points:[
    {u:0.50,v:0.24,d:'LINE',label:'Line screen · pitch 6.9 u, bar 0.66 pitch inside a letter',t:'line-screen',dir:[1,-1]},
    {u:0.20,v:0.44,d:'LINE',label:'Bar ends · the mask clips each bar; no bar on bare paper',t:'line-screen',dir:[-1,-1]},
    {u:0.69,v:0.47,d:'MERG',label:'Overlap · two lines of type, density 2, bars merge to solid',t:'line-screen',dir:[1,1]},
    {u:0.36,v:0.36,d:'PHSE',label:'Phase field · perlin, period 260 u, shift ± 2.4 u',t:'phase-field',dir:[-1,-1]},
    {u:0.76,v:0.66,d:'PHSE',label:'Half-pitch step · field quantised where |n| > 0.35',t:'phase-field',dir:[1,1]},
    {u:0.30,v:0.72,d:'BLED',label:'Ink bleed · 0.7 px blur, gain 1.15, corners soften',t:'ink-bleed',dir:[-1,1]},
    {u:0.62,v:0.80,d:'BLED',label:'Interior darkening · ink → ink_deep where mask density > 0.9',t:'ink-bleed',dir:[1,1]},
    {u:0.90,v:0.12,d:'TOOTH',label:'Paper tooth · mono grain amp 0.04 on 1 px cells',t:'paper-tooth',dir:[1,-1]},
    {u:0.08,v:0.60,d:'TOOTH',label:'Mottle · perlin at 60 u, ± 3.5 % luminance',t:'paper-tooth',dir:[-1,1]},
    {u:0.16,v:0.15,d:'CAPT',label:'Caption block · Archivo 800 caps, 18 u, four lines',t:'caption-label',dir:[-1,-1]},
    {u:0.50,v:0.93,d:'CAPT',label:'Word row · JetBrains Mono 14 u, justified across 840 u',t:'caption-label',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1448,936], grammar:'one-ink print: heavy slab type, tight leading, screened as vertical bars at a fixed pitch; bars merge where lines of type overlap; small caps captions in the corners, spaced word row at the foot' },
    units:'design units, 1000 = sheet width (sheet is 1000 × 646)',
    palette:{ paper:'#E5E1DB', ink:'#514D4A', ink_deep:'#3E3A38', caption:'#4A4643' },
    techniques:[
      { id:'line-screen', short:'LINE', name:'Vertical line screen', layer:1, pass:2, atoms:['grating','mask','clip'],
        params:{ pitch_u:6.9, bar_min:'0.58 pitch (mask 0.10)', bar_full:'0.66 pitch (mask ≥ 0.35)', end_cells:'bar ends snap to 0.5-pitch cells down the page', bar_merge:'1.15 pitch (mask ≥ 1.6, two lines overlapping)', threshold:0.10, gap_min_px:1, mask:'sum of four text lines, Archivo 900 condensed, blurred 1.2 px' },
        implementation:'For every screen column x_k = k·pitch, walk down the page one device pixel at a time, read the summed letter mask at (x_k + phase, y), map it to a bar width and fill each continuous run as one polygon with a left and a right edge per y.' },
      { id:'phase-field', short:'PHSE', name:'Phase field', layer:1, pass:1, atoms:['perlin','offset','quantise'],
        params:{ period_u:260, octaves:2, shift_u:2.4, quantise:'+0.5 pitch where fbm > 0.35', seed:505 },
        implementation:'phase(x,y) = 2.4·fbm(x/260, y/260) plus half a pitch in regions where the field is high; the bar center is x_k + phase, so bars in neighbouring regions step against each other.' },
      { id:'ink-bleed', short:'BLED', name:'Ink bleed', layer:2, pass:3, atoms:['blur','gain','darken'],
        params:{ blur_px:0.7, gain:1.15, interior_darken:'ink → ink_deep (#3E3A38) where mask > 0.9, ramp from 0.6', threshold_soft:'0.26 → 0.60' },
        implementation:'The bar layer is blurred 0.8 px, its alpha is pushed through a soft threshold so the edge swells outward, and the ink color shifts toward ink_deep inside the letters.' },
      { id:'paper-tooth', short:'TOOTH', name:'Paper tooth', layer:3, pass:4, atoms:['grain','mottle'],
        params:{ grain:'mono, amp 0.04, pitch 1 px, seed 505', mottle:'perlin period 60 u, ± 3.5 % (ref) · ± 2 % (ember) · ± 5 % (reverse)', measured_paper_std:'4.4 / 255' },
        implementation:'Luminance is multiplied by 1 + mottle before the bars land and by ART.grain after, so ink and paper share one tooth.' },
      { id:'caption-label', short:'CAPT', name:'Caption blocks', layer:2, pass:3, atoms:['type','justify'],
        params:{ corner_blocks:'Archivo 800 condensed caps, 18 u, line 20 u, at (83,55) and (698,55)', credit:'Archivo 800 caps 18 u at (680,483)', word_row:'JetBrains Mono 700 14 u, seven words justified from 83 u to 922 u at 598 u' },
        implementation:'Plain fills in the caption color; the word row divides the leftover width equally between the words.' }
    ],
    pass_order:['paper · flat fill + mottle','mask · four text lines summed into a luminance layer, blurred 1.2 px','phase · perlin offset per (column, y)','bars · one polygon per continuous run per column','bleed · 0.7 px blur, soft threshold, interior darkening','captions · corner blocks, credit, word row','tooth · mono grain 0.04'],
    notes:['Measured on ref.png: pitch 10 px at 1448 px (6.9 u); bar runs 6–7 px inside letters (0.68 pitch), 11 px+ where lines merge; paper (229,226,220) covers 80 %; ink (65,62,59) 15 %; paper std 4.4 / 255.','The reference type is a slab serif; no serif is inlined, so the rebuild sets Archivo 900 at condensed width (font-stretch 75 %), which keeps the stroke weight and the tight leading but not the slabs.','Words are invented. Seed 505.']
  },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d');
    const paper=A.hex(V.paper), ink=A.hex(V.ink), deep=A.hex(V.inkDeep);
    const pitch=6.9*u; const seed=505;
    /* 1 · letter mask: four lines summed (overlap → 2) */
    const mk=A.off(W,H); const mx=mk.getContext('2d',{willReadFrequently:true}); mx.fillStyle='#000'; mx.fillRect(0,0,W,H);
    const lines=[['An',0.60,232],['uneven',0.50,338],['signal',0.46,444],['line.',0.50,552]];
    const size=196*u; mx.fillStyle='#7f7f7f'; mx.globalCompositeOperation='lighter'; mx.textBaseline='alphabetic'; mx.textAlign='center';
    try{ mx.fontStretch='condensed'; }catch(e){}
    for(const [t,cx,by] of lines){ mx.font=`900 condensed ${size}px Archivo`; try{ mx.letterSpacing=(0.04*size)+'px'; }catch(e){} mx.fillText(t,cx*W,by*u); }
    const mkb=A.blur(mk,1.2*u/1.448); const md=mkb.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data;
    const cell=Math.max(1,Math.round(0.5*pitch)); const mask=(X,Y)=>{ if(X<0||X>=W||Y<0||Y>=H)return 0; const Yq=Math.min(H-1,((Y/cell)|0)*cell+(cell>>1)); return md[(Yq*W+(X|0))*4]/127.5; };
    /* 2 · phase field */
    const P=A.perlin(seed); const per=260*u;
    const phase=(X,Y)=>{ const n=P.fbm(X/per,Y/per,2,0.5); return 2.4*u*n*2+(n>0.35?0.5*pitch:0); };
    /* 3 · bars → alpha layer */
    const bl=A.off(W,H); const bx=bl.getContext('2d',{willReadFrequently:true}); bx.fillStyle='#000'; bx.fillRect(0,0,W,H); bx.fillStyle='#fff';
    const gapMin=Math.max(1,0.32*pitch); const full=Math.min(0.66*pitch,pitch-gapMin), min=0.58*pitch;
    const width=m=>{ if(m<0.10)return 0; let wd=min+(full-min)*A.sstep(0.10,0.35,m); wd+=(1.15*pitch-wd)*A.sstep(1.0,1.6,m); return wd; };
    const nCols=Math.ceil(W/pitch)+1;
    for(let k=0;k<nCols;k++){ const xk=k*pitch; let L=[],R=[]; let open=false;
      const flush=()=>{ if(!open)return; bx.beginPath(); bx.moveTo(R[0][0],R[0][1]); for(let i=1;i<R.length;i++)bx.lineTo(R[i][0],R[i][1]); for(let i=L.length-1;i>=0;i--)bx.lineTo(L[i][0],L[i][1]); bx.closePath(); bx.fill(); L=[]; R=[]; open=false; };
      for(let y=0;y<=H;y++){ const ph=phase(xk,y); const cx=xk+ph; const m=y<H?mask(cx,y):0; const wd=width(m);
        if(wd<=0){ flush(); continue; }
        if(!open){ open=true; L.push([cx-wd/2,y-0.5]); R.push([cx+wd/2,y-0.5]); }
        L.push([cx-wd/2,y+0.5]); R.push([cx+wd/2,y+0.5]); }
      flush(); }
    /* 4 · bleed: blur + soft threshold; composite with mottle and interior darkening */
    const bb=A.blur(bl,0.7); const bd=bb.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data;
    const M=A.perlin(seed+1); const mper=60*u; const mamp=V.mottle||0.03;
    const id=x.createImageData(W,H); const d=id.data;
    for(let Y=0;Y<H;Y++){ for(let X=0;X<W;X++){ const i=(Y*W+X)*4; const a=A.sstep(0.26,0.60,Math.min(1,bd[i]/255*1.15)); const m=md[i]/127.5;
        const mo=1+mamp*M.fbm(X/mper,Y/mper,2,0.5)*2; const c=A.mix(ink,deep,A.sstep(0.6,0.9,m));
        d[i]=(paper[0]*(1-a)+c[0]*a)*mo; d[i+1]=(paper[1]*(1-a)+c[1]*a)*mo; d[i+2]=(paper[2]*(1-a)+c[2]*a)*mo; d[i+3]=255; } }
    x.setTransform(1,0,0,1,0,0); x.putImageData(id,0,0);
    /* 5 · captions */
    x.setTransform(u,0,0,u,0,0); x.fillStyle=V.caption; x.textBaseline='alphabetic'; x.textAlign='left';
    try{ x.fontStretch='condensed'; }catch(e){}
    x.font='800 condensed 18px Archivo';
    const tl=['A PLAIN WORD SET','IN ONE INK ON','GREY STOCK,','SCREENED.'], tr=['FOUR LINES, TIGHT','LEADING, BARS','AT A FIXED','PITCH.'];
    tl.forEach((s,i)=>x.fillText(s,83,72+i*20)); tr.forEach((s,i)=>x.fillText(s,698,72+i*20));
    x.fillText('SET BY HAND',680,491);
    x.font='700 14px "JetBrains Mono"'; const words=['A','ROW','OF','WORDS','SPACED','TO','THE','EDGE.']; const x0=83,x1=922;
    const tw=words.reduce((s,wd)=>s+x.measureText(wd).width,0); const gap=(x1-x0-tw)/(words.length-1); let px=x0;
    for(const wd of words){ x.fillText(wd,px,598); px+=x.measureText(wd).width+gap; }
    /* 6 · tooth */
    x.setTransform(1,0,0,1,0,0); A.grain(x,{amp:0.04,pitch:1,seed:seed,mono:true});
  }
};
