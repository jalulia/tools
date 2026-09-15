window.STUDY={
  id:'ts-10-thermal-blob-field', code:'TS-10', fig:'1.10',
  title:'Thermal blob field',
  kicker:'Technique · TS-10',
  lede:'Blurred blobs mapped through a ramp with one dark stop at the rim.',
  body:[
    'One luminance field through one color ramp. Four blob shapes fill white on black and blur wide, so every edge becomes a smooth S. The ramp reads that profile: paper low, a light blue as it rises, a dark navy stop just under mid, then plum, red, orange, and yellow only where the field saturates deep inside a blob.',
    'Because the navy stop sits on the steepest part of the profile it renders as a thin band — the rim looks drawn but is only mapped. Over the sheet: mono grain and a faint mottle, two hairline rules, a mono caption and a two-line label.'
  ],
  source:'Reference 10 · blurred blob background with a dark rim, 1200 × 800',
  spot:[247,171,23], ref:{w:1200,h:800},
  variantLabel:'Color',
  variants:[
    { id:'ref',  label:'Lava', sw:['#F0ECE3','#F7AB17','#160F14'], spot:[247,171,23], paper:'#F0ECE3', ink:'#1A1618',
      stops:[[0,'#F0ECE3'],[0.28,'#F0ECE3'],[0.335,'#B8D3E6'],[0.37,'#5CA6DB'],[0.41,'#35507E'],[0.44,'#160F14'],[0.48,'#1E1218'],[0.53,'#452333'],[0.58,'#7A3540'],[0.64,'#AF4E43'],[0.70,'#EE613F'],[0.82,'#F58C1E'],[0.93,'#F7AB17'],[1,'#F2B815']] },
    { id:'teal', label:'Teal', sw:['#F0ECE3','#1F7A8C','#F3C623'], spot:[31,122,140], paper:'#F0ECE3', ink:'#1A1618',
      stops:[[0,'#F0ECE3'],[0.28,'#F0ECE3'],[0.335,'#CFE6EA'],[0.37,'#9ED2DA'],[0.41,'#1F7A8C'],[0.44,'#0F2A1E'],[0.48,'#0F2A1E'],[0.53,'#123A26'],[0.58,'#1F5A30'],[0.64,'#2E6B3A'],[0.70,'#8DAA2C'],[0.82,'#F3C623'],[0.93,'#F6D64A'],[1,'#FBE68C']] },
    { id:'pink', label:'Pink', sw:['#F0ECE3','#FF5FA8','#F0451E'], spot:[255,95,168], paper:'#F0ECE3', ink:'#1A1618',
      stops:[[0,'#F0ECE3'],[0.28,'#F0ECE3'],[0.335,'#FFE6F0'],[0.37,'#FFD3E6'],[0.41,'#8A2A4A'],[0.44,'#101014'],[0.48,'#101014'],[0.53,'#3A1018'],[0.58,'#6A1E1A'],[0.64,'#9A2A1A'],[0.70,'#F0451E'],[0.82,'#FF5FA8'],[0.93,'#F0451E'],[1,'#101014']] },
    { id:'io',   label:'Ø', sw:['#F4551E','#2F5AE6','#FFFFFF'], spot:[244,85,30], paper:'#FFFFFF', ink:'#101014',
      stops:[[0,'#FFFFFF'],[0.28,'#FFFFFF'],[0.335,'#D3DDFA'],[0.37,'#9DB3F5'],[0.41,'#2F5AE6'],[0.44,'#101014'],[0.48,'#101014'],[0.53,'#2A1A1E'],[0.58,'#4A2220'],[0.64,'#6E2A1E'],[0.70,'#C24422'],[0.82,'#F4551E'],[0.93,'#F98A4A'],[1,'#FFC08A']] }
  ],
  points:[
    {u:0.22,v:0.75,d:'BLOB',label:'Blob 2 · Fourier-radius shape, R 280 u, four harmonics',t:'blob-field',dir:[-1,1]},
    {u:0.33,v:0.06,d:'BLOB',label:'Blob 1 · center off-sheet above, only its lower edge shows',t:'blob-field',dir:[1,-1]},
    {u:0.72,v:0.96,d:'BLOB',label:'Blob 3 · merges with blob 2, union before the blur',t:'blob-field',dir:[1,-1]},
    {u:0.385,v:0.55,d:'RIM',label:'Rim · navy stop at field 0.44, band about 16 u wide',t:'rim-stop',dir:[1,-1]},
    {u:0.40,v:0.37,d:'RIM',label:'Blue halo · outside the rim, field 0.335–0.41',t:'rim-stop',dir:[-1,-1]},
    {u:0.30,v:0.85,d:'RAMP',label:'Core · field ≥ 0.9 maps to yellow',t:'gradient-map',dir:[1,1]},
    {u:0.36,v:0.62,d:'RAMP',label:'Inside the rim · plum → red → orange over field 0.53–0.70',t:'gradient-map',dir:[1,1]},
    {u:0.70,v:0.28,d:'TOOTH',label:'Paper · mono grain amp 0.03 plus mottle amp 0.012',t:'paper-tooth',dir:[1,-1]},
    {u:0.55,v:0.475,d:'RULE',label:'Rule 1 · 1 u ink, v 0.475, full width less 12 u',t:'rule-ledger',dir:[1,-1]},
    {u:0.10,v:0.925,d:'RULE',label:'Rule 2 and label · caption right-set under rule 1, studio label under rule 2',t:'rule-ledger',dir:[-1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1200,800], grammar:'one blurred luminance field of large blobs, gradient-mapped through paper → blue → navy → plum → red → orange → yellow; mono grain; two hairline rules; a mono caption and a two-line label' },
    units:'design units, 1000 = sheet width',
    palette:{ paper:'#F0ECE3', blue:'#5CA6DB', navy:'#160F14', plum:'#452333', red:'#AF4E43', orange:'#EE613F', yellow:'#F2B815', ink:'#1A1618' },
    techniques:[
      { id:'blob-field', short:'BLOB', name:'Blurred blob field', layer:1, pass:1, atoms:['blob','fourier-radius','gaussian-blur'],
        params:{ blobs:4, radius:'r(θ) = R·(1 + Σ a_k·cos(k·θ + φ_k)), k = 2..4, a ≤ 0.22', R_u:[250,280,200,150], blur_sigma_u:46, field_res:'1/3 device px', fill:'radial white → 0.78 gray at the shape edge, union by lighten' },
        implementation:'Four Fourier-radius blobs are filled with a radial white-to-gray gradient on a black canvas (union by lighten) at one-third resolution, blurred with σ = 46 u and read back as a 0..1 luminance field.' },
      { id:'gradient-map', short:'RAMP', name:'Gradient map', layer:2, pass:2, atoms:['lut','gradient-map'],
        params:{ lut:'256 entries', stops_ref:'0.28 paper · 0.37 blue · 0.41 (53,80,126) · 0.44–0.48 navy · 0.53 plum · 0.64 red · 0.70 orange · 0.82 (245,140,30) · 1.0 yellow', measured_edge_px:'paper→blue 12 · blue→navy 12 · navy 20 · plum→red 25 · red→orange 15 (at 1200 px)' },
        implementation:'Every pixel of the field is replaced by LUT[field]; the ramp is the only place color enters, so all four colourways share one field.' },
      { id:'rim-stop', short:'RIM', name:'Dark rim stop', layer:2, pass:2, atoms:['lut-stop','edge-band'],
        params:{ position:0.44, color:'#160F14', width_field:'0.41 → 0.53', band_px_ref:'≈ 20 at 1200 px', halo:'blue 0.335–0.41 outside the stop' },
        implementation:'The darkest stop sits just under the mid-point of the blurred edge, where the profile is steepest, so it occupies few pixels and reads as a drawn outline; the blue halo is the ramp segment just outside it.' },
      { id:'paper-tooth', short:'TOOTH', name:'Paper tooth', layer:3, pass:3, atoms:['grain','mottle'],
        params:{ grain_amp:0.03, pitch_px:1, mono:true, mottle:'perlin fbm, 3 octaves, cell 90 u, amp 0.012', measured:'high-pass std 3.4/255 on paper, 5.5/255 in the core' },
        implementation:'Multiplicative mono grain per device pixel, then a low-frequency perlin mottle, both on the whole sheet including the blobs.' },
      { id:'rule-ledger', short:'RULE', name:'Rules, caption and label', layer:4, pass:4, atoms:['hairline','caption','label'],
        params:{ rules:{ y_v:[0.475,0.925], inset_u:12, weight_u:1, color:'#1A1618' }, caption:{ font:'JetBrains Mono 14 u', align:'right, under rule 1', x_u:988 }, label:{ font:'Inter 13 u / Inter 600 18 u', lines:2, x_u:12, under:'rule 2' } },
        implementation:'Two 1 u ink rules across the sheet; the caption is set right-aligned 12 u under the first rule, the two-line studio label under the second.' }
    ],
    pass_order:['field · four blobs white on black at 1/3 res, blur σ 46 u','upscale · field to device res','map · LUT[field] per pixel (rim stop 0.44)','tooth · mono grain 0.03, perlin mottle 0.012','ledger · two rules, caption, two-line label'],
    notes:['Measured on ref.png: paper (240,236,233) std 3.3; one edge at y = 300 runs (92,166,219) → (22,15,20) → (69,35,51) → (175,78,67) → (238,97,63) over 70 px; core (244,137,20); rules at y = 380 and 740 of 800, x 14 → 1185.','Seed 1010. Motion: blob centres drift on perlin over a 12 s loop; field recomputed at half resolution per frame.']
  },
  _lut:null, _lutKey:'',
  _lutFor(V){ const k=V.id+JSON.stringify(V.stops); if(this._lutKey!==k){ this._lut=window.ART.lut(V.stops); this._lutKey=k; } return this._lut; },
  _blobs(){ return [
      { c:[340,-120], R:250, sx:1.05, sy:0.70, h:[[2,0.08,0.4],[3,0.10,1.9],[4,0.05,3.2]] },
      { c:[210,610], R:280, sx:1.15, sy:1.0, h:[[2,0.16,3.14],[3,0.14,4.71],[4,0.05,4.4],[5,0.04,1.2]] },
      { c:[630,730], R:200, sx:1.40, sy:0.62, h:[[2,0.10,1.1],[3,0.08,3.0]] },
      { c:[1090,720], R:150, sx:1.0, sy:1.0, h:[[2,0.12,0.2],[3,0.06,2.2]] } ]; },
  /* field: white blobs on black at scale s (device px per design unit), blurred; returns canvas */
  _field(W,H,s,off){
    const A=window.ART; const p=Math.ceil(140*s); const c=A.off(W+2*p,H+2*p); const x=c.getContext('2d'); x.fillStyle='#000'; x.fillRect(0,0,c.width,c.height); x.fillStyle='#fff';
    x.globalCompositeOperation='lighten';
    const B=this._blobs(); for(let b=0;b<B.length;b++){ const q=B[b]; const o=off?off[b]:[0,0]; const cx=p+(q.c[0]+o[0])*s, cy=p+(q.c[1]+o[1])*s; const g=x.createRadialGradient(cx,cy,0,cx,cy,q.R*Math.max(q.sx,q.sy)*1.25*s); g.addColorStop(0,'#fff'); g.addColorStop(1,'#c8c8c8'); x.fillStyle=g; x.beginPath();
      for(let i=0;i<=96;i++){ const th=i/96*6.283185; let r=1; for(const hh of q.h)r+=hh[1]*Math.cos(hh[0]*th+hh[2]); const px=p+(q.c[0]+o[0]+Math.cos(th)*q.R*q.sx*r)*s, py=p+(q.c[1]+o[1]+Math.sin(th)*q.R*q.sy*r)*s; if(i)x.lineTo(px,py); else x.moveTo(px,py); }
      x.closePath(); x.fill(); }
    x.globalCompositeOperation='source-over';
    const bl=A.blur(c,46*s); const out=A.off(W,H); const ox=out.getContext('2d'); ox.fillStyle='#000'; ox.fillRect(0,0,W,H); ox.drawImage(bl,-p,-p); return out; },
  _ledger(x,u,V,W,H){
    const ink=V.ink; x.setTransform(1,0,0,1,0,0); x.fillStyle=ink; const ins=12*u, lw=Math.max(1,Math.round(1*u));
    const y1=Math.round(0.475*H), y2=Math.round(0.925*H); x.fillRect(ins,y1,W-2*ins,lw); x.fillRect(ins,y2,W-2*ins,lw);
    x.textBaseline='alphabetic'; x.textAlign='right'; x.font=`400 ${14*u}px "JetBrains Mono", monospace`; x.fillText('MOLT — Soft Field Backgrounds · Set 02',W-ins,y1+lw+26*u);
    x.textAlign='left'; x.font=`400 ${13*u}px Inter, sans-serif`; x.fillText('studio',ins,y2+lw+20*u); x.font=`600 ${18*u}px Inter, sans-serif`; x.fillText('OKTAVE FORM',ins,y2+lw+42*u); },
  _tooth(x,u,W,H,V){
    const A=window.ART; A.grain(x,{amp:0.03,pitch:1,seed:1010,mono:true});
    const n=A.perlin(1010); const s=Math.max(1,Math.round(6*u)); const mw=Math.ceil(W/s), mh=Math.ceil(H/s); const m=A.off(mw,mh); const mx=m.getContext('2d'); const id=mx.createImageData(mw,mh); const d=id.data;
    for(let j=0;j<mh;j++)for(let i=0;i<mw;i++){ const v=n.fbm(i*s/(90*u),j*s/(90*u),3,0.55); const g=A.clamp(128+128*0.012*4*v,0,255); const k=(j*mw+i)*4; d[k]=d[k+1]=d[k+2]=g; d[k+3]=255; }
    mx.putImageData(id,0,0); x.setTransform(1,0,0,1,0,0); x.globalCompositeOperation='overlay'; x.imageSmoothingEnabled=true; x.drawImage(m,0,0,W,H); x.globalCompositeOperation='source-over'; },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d');
    const s=u/3; const f=this._field(Math.round(W/3),Math.round(H/3),s,null);
    x.setTransform(1,0,0,1,0,0); x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high'; x.drawImage(f,0,0,W,H);
    A.gradientMap(x,this._lutFor(V));
    this._tooth(x,u,W,H,V);
    this._ledger(x,u,V,W,H);
  },
  _mo:null,
  motion(canvas,w,h,dpr,V,t,ctx){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000;
    const k=W+'x'+H; if(!this._mo||this._mo.k!==k){ const g=A.off(W,H); const gx=g.getContext('2d'); const id=gx.createImageData(W,H); const d=id.data; const r=A.rng(1010);
      for(let i=0;i<d.length;i+=4){ const v=128+128*0.03*2*(r()*2-1); d[i]=d[i+1]=d[i+2]=v; d[i+3]=255; } gx.putImageData(id,0,0);
      const hw=Math.round(W/2), hh=Math.round(H/2); const half=A.off(hw,hh); this._mo={k,grain:g,half,hx:half.getContext('2d'),n:A.perlin(77)}; }
    const M=this._mo; const ph=(t%12)/12*6.283185; const cx=Math.cos(ph)*1.1, cy=Math.sin(ph)*1.1; const n=M.n;
    const off=[0,1,2,3].map(b=>[n(cx+b*3.7,cy+b*1.3)*90,n(cx+b*3.7+5.1,cy+b*1.3+2.9)*70]);
    const s=u/6; const f=this._field(Math.round(W/6),Math.round(H/6),s,off);
    const hx=M.hx; hx.setTransform(1,0,0,1,0,0); hx.imageSmoothingEnabled=true; hx.drawImage(f,0,0,M.half.width,M.half.height);
    A.gradientMap(hx,this._lutFor(V));
    ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctx.drawImage(M.half,0,0,W,H);
    ctx.globalCompositeOperation='overlay'; ctx.drawImage(M.grain,0,0); ctx.globalCompositeOperation='source-over';
    this._ledger(ctx,u,V,W,H); ctx.setTransform(dpr,0,0,dpr,0,0);
  }
};
