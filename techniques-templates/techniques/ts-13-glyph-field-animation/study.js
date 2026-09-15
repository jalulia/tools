window.STUDY={
  id:'ts-13-glyph-field-animation', code:'TS-13', fig:'1.13',
  title:'ASCII glyph-field animations',
  kicker:'Technique · TS-13',
  lede:'Type glyphs as particles: a helix, a wave, an orbit and a pulse, drawn with fillText.',
  body:[
    'Four canvases, one method. Every mark is a monospace glyph placed with fillText — no sprites, no shapes. A glyph vocabulary of dots, rules, arrows and three-digit numbers is read by index, so the field looks typeset rather than drawn. Depth is alpha and size only: the helix projects 150 glyphs through a pinhole at 800 u and sorts them far-to-near, so near glyphs sit on top at 0.89 alpha and far ones fade to 0.04. Every 18th glyph is a palette label in its own color with a soft glow, so the animation names the system it decorates.',
    'The field cedes the middle: a CSS radial mask (ellipse 44 % × 40 %) clears the helix behind the title. The wave is a 70 × 8 cell grid whose glyph is chosen by a sine phase and whose alpha falls off from a sine centerline. The orbit is 52 glyphs on a 0.4-ratio ellipse whose radius breathes ±10 %. The pulse is 18 glyphs lit by the positive half of one travelling sine. Each frame clears and redraws; reduced-motion draws the frame once and stops.'
  ],
  source:'Reference 13 · four canvases from the Ink and Signal component library (hero helix, wave figure, inline pulse, orbit atmosphere), composited at t = 5.9 s, 1000 × 1250',
  spot:[124,196,255], ref:{w:1000,h:1250},
  variantLabel:'Color',
  variants:[
    { id:'ref',   label:'As reference', sw:['#09090B','#F6F1E4','#10B981','#2B8EF5'], spot:[124,196,255],
      ground:'#09090B', paper:'#FFFFFF', paper2:'#FAFAFA', hair:'rgba(9,9,11,.08)', ink:'#09090B', mute:'#52525B', mute2:'#A1A1AA', bone:'#F6F1E4', glyph:'#FFFFFF', kicker:'rgba(255,255,255,.55)', deck:'rgba(255,255,255,.6)', bar:'rgba(255,255,255,.35)',
      labels:[['ICE','#7CC4FF'],['LAMINAR','#4FE3C1'],['HEAT','#FF8A4C'],['VOID','#FF6A8A'],['SIGNAL','#FFD166'],['BALANCED','#A8F080'],['Ø','#FF6A8A'],['PAPER','#7CC4FF']],
      wave:[16,185,129], pulse:[43,142,245], orbit:[246,241,228], halo:'rgba(0,0,0,' },
    { id:'io',    label:'Ø',            sw:['#101014','#F4551E','#2F5AE6','#FFFFFF'], spot:[244,85,30],
      ground:'#101014', paper:'#FFFFFF', paper2:'#F6F5F2', hair:'#E7E4DD', ink:'#101014', mute:'#6F6E6A', mute2:'#B4B2AC', bone:'#FFFFFF', glyph:'#FFFFFF', kicker:'rgba(255,255,255,.55)', deck:'rgba(255,255,255,.6)', bar:'rgba(255,255,255,.35)',
      labels:[['EMBER','#F4551E'],['BLUE','#5B7FF0'],['PAPER','#FFFFFF'],['INK','#B4B2AC'],['Ø','#F4551E'],['EMBER','#F4551E'],['BLUE','#5B7FF0'],['PAPER','#FFFFFF']],
      wave:[244,85,30], pulse:[47,90,230], orbit:[255,255,255], halo:'rgba(0,0,0,' },
    { id:'paper', label:'On paper',     sw:['#FFFFFF','#101014','#10B981','#2B8EF5'], spot:[16,16,20],
      ground:'#FFFFFF', paper:'#F6F5F2', paper2:'#FFFFFF', hair:'rgba(9,9,11,.10)', ink:'#101014', mute:'#52525B', mute2:'#A1A1AA', bone:'#101014', glyph:'#101014', kicker:'rgba(16,16,20,.55)', deck:'rgba(16,16,20,.6)', bar:'rgba(16,16,20,.35)',
      labels:[['ICE','#2B8EF5'],['LAMINAR','#10B981'],['HEAT','#FF5A1F'],['VOID','#E11D48'],['SIGNAL','#F59E0B'],['BALANCED','#16A34A'],['Ø','#E11D48'],['PAPER','#2B8EF5']],
      wave:[16,185,129], pulse:[43,142,245], orbit:[16,16,20], halo:'rgba(255,255,255,' }
  ],
  points:[
    {u:0.50,v:0.06,d:'HELX',label:'Helix · 150 glyphs, 7 turns over 484 u, two strands π apart, pinhole at 800 u',t:'glyph-helix',dir:[1,1]},
    {u:0.66,v:0.14,d:'DPTH',label:'Near glyph · alpha .04 + d^1.5 · .85, size 10.5 · 800/(800 − z)',t:'depth-alpha',dir:[1,-1]},
    {u:0.65,v:0.09,d:'LABL',label:'Palette label · every 18th glyph, weight 500, glow shadowBlur 6·d in its own color',t:'semantic-label',dir:[1,-1]},
    {u:0.40,v:0.12,d:'VOCB',label:'Vocabulary · 23 entries read by index: dots, rules, ø, ×, →, ▸, three-digit numbers',t:'glyph-vocab',dir:[-1,-1]},
    {u:0.30,v:0.36,d:'MASK',label:'Center mask · radial ellipse 44 % × 40 % at 50 % 52 %, clear to 0.4, opaque from 0.8',t:'center-mask',dir:[-1,1]},
    {u:0.86,v:0.34,d:'PRLX',label:'Pointer parallax · x ±18 u, y ±14 u, eased at 0.04 per frame',t:'pointer-parallax',dir:[-1,1]},
    {u:0.50,v:0.59,d:'WAVE',label:'Wave grid · 70 × 8 cells, glyph = ramp[sin φ], alpha = 1 − |row − 4 + 1.4 sin φ| / 2.2',t:'wave-grid',dir:[1,1]},
    {u:0.26,v:0.74,d:'PULS',label:'Pulse · 18 glyphs, sin(1.6 t − 0.12 i), only the positive half drawn, alpha ≤ .5',t:'pulse-row',dir:[1,-1]},
    {u:0.63,v:0.90,d:'ORBT',label:'Orbit · 52 glyphs on an ellipse, ratio 0.4, radius ±10 %, every 6th is ø, canvas at .3',t:'orbit-ring',dir:[1,1]},
    {u:0.10,v:0.96,d:'LOOP',label:'Runtime · DPR capped at 2, clearRect every frame, reduced-motion draws one frame',t:'still-frame-runtime',dir:[1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1000,1250], grammar:'monospace glyphs placed with fillText as particles; depth by alpha and size only; semantic labels with glow; CSS radial mask; sine-driven grid, ring and row; rAF loop, DPR cap 2, reduced-motion still frame' },
    units:'design units, 1000 = plate width; the reference canvases use CSS px at a 1000 px layout, so 1 u = 1 px there',
    palette:{ ink:'#09090B', paper:'#FFFFFF', paper_2:'#FAFAFA', bone:'#F6F1E4', glyph:'#FFFFFF', laminar:'#10B981', ice:'#2B8EF5', on_ink:{ ice:'#7CC4FF', laminar:'#4FE3C1', heat:'#FF8A4C', void:'#FF6A8A', signal:'#FFD166', balanced:'#A8F080' } },
    techniques:[
      { id:'glyph-helix', short:'HELX', name:'Projected glyph helix', layer:0, pass:1, atoms:['particle','helix','perspective','depth-sort'],
        params:{ count:150, turns:7, radius_u:'min(0.18 W, 0.24 H, 240)', height_u:'min(0.78 H, 820)', pinhole_u:800, strands:'2 · phase π by parity', rise:'t_i = i/150 + 0.018 · t (mod 1)', spin:'θ = 7π · t_i + 0.22 · t', project:'sc = P / (P − z); sx = cx + x · sc; sy = cy + y · sc', order:'sort by depth d = (z + R) / 2R, far first' },
        implementation:'150 particles climb a helix (0.018 of the height per second) while the helix turns (0.22 rad/s); each is projected through a pinhole at 800 u and drawn as text, far to near.' },
      { id:'depth-alpha', short:'DPTH', name:'Depth as alpha and size', layer:0, pass:1, atoms:['alpha-ramp','scale','depth'],
        params:{ alpha:'0.04 + d^1.5 · 0.85', size_px:'round(10.5 · sc)', size_range:'≈ 9 – 13 px', font:'JetBrains Mono 400', no_color_depth:'glyphs stay white; only alpha and size carry depth' },
        implementation:'Nothing is shaded: depth is the alpha ramp and the projected font size, so far glyphs are ghosts and near glyphs are ink.' },
      { id:'semantic-label', short:'LABL', name:'Palette label with glow', layer:0, pass:1, atoms:['label','glow','palette'],
        params:{ every:18, offset:7, weight:500, sequence:['ICE','LAMINAR','HEAT','VOID','SIGNAL','BALANCED','Ø','PAPER'], colors:['#7CC4FF','#4FE3C1','#FF8A4C','#FF6A8A','#FFD166','#A8F080','#FF6A8A','#7CC4FF'], glow:'shadowColor = label color, shadowBlur = 6 · d', count_per_150:8 },
        implementation:'Every glyph with i mod 18 = 7 is replaced by the next palette name, set in its lifted on-ink color at weight 500 with a depth-scaled glow; the animation names its own system.' },
      { id:'glyph-vocab', short:'VOCB', name:'Indexed glyph vocabulary', layer:0, pass:0, atoms:['glyph-set','index','typeset'],
        params:{ helix:['·','∙','•','▪','│','─','ø','×','→','▸','001','010','042','077','126','154','218','258','369','396','410','523','808'], wave:'· ∙ ─ - ━ (ramp by sin)', orbit:'· with ø every 6th, Ø at center', pulse:['·','∙','•','∙','·'], read:'glyph = vocab[i mod n]' },
        implementation:'Each animation reads its marks from a short ordered list by index, so the field is typeset from a vocabulary rather than drawn from shapes; the helix list mixes 10 marks with 13 three-digit numbers.' },
      { id:'center-mask', short:'MASK', name:'Radial center mask', layer:1, pass:2, atoms:['mask','radial-gradient','ellipse'],
        params:{ css:'mask-image: radial-gradient(ellipse 44% 40% at 50% 52%, transparent 0%, transparent 40%, #000 80%)', rx_u:440, ry_u:248, center_u:[500,322], clear_to:0.4, opaque_from:0.8, canvas_opacity:0.95, title_shadow:'0 0 80px rgba(0,0,0,.7), 0 0 160px rgba(0,0,0,.5)' },
        implementation:'The helix canvas is masked by an elliptical radial gradient so glyphs fade out toward the middle; the title sits in the hole with a wide dark text-shadow that deepens it.' },
      { id:'pointer-parallax', short:'PRLX', name:'Eased pointer parallax', layer:0, pass:1, atoms:['pointer','ease','parallax'],
        params:{ input:'mx = clientX / innerWidth − 0.5; my = clientY / innerHeight − 0.5', ease:'tx += (mx − tx) · 0.04 per frame', offset_u:{ x:'tx · 18', y:'ty · 14' }, applied:'to every glyph before projection' },
        implementation:'The pointer shifts the whole helix by at most 18 u × 14 u, eased at 4 % per frame, so the field drifts after the cursor rather than following it.' },
      { id:'wave-grid', short:'WAVE', name:'Sine-phased glyph grid', layer:2, pass:3, atoms:['grid','sine','glyph-ramp','falloff'],
        params:{ cols:70, rows:8, canvas_u:[500,150], font:'JetBrains Mono 400 12 px', phase:'φ = 4π · c/70 + 0.8 · t + 0.15 · r', glyph:'ramp[floor((sin φ · 0.5 + 0.5) · 4)]', centerline:'row 4 − 1.4 · sin φ', alpha:'(1 − |r − 4 + 1.4 sin φ| / 2.2) · 0.55, skipped below 0.05', color:'#10B981' },
        implementation:'A 70 × 8 grid where one sine phase picks both the glyph (from a five-step ramp) and the alpha (by distance to a sine centerline), so a two-wavelength band of laminar glyphs rolls across the frame.' },
      { id:'pulse-row', short:'PULS', name:'Half-wave pulse row', layer:2, pass:3, atoms:['row','sine','half-wave'],
        params:{ count:18, canvas_u:[250,30], font:'JetBrains Mono 400 11 px', wave:'w = sin(1.6 · t − 0.12 · i)', drawn:'only w > 0', alpha:'w · 0.5', x:'14 + i · (W − 28) / 18', head:'▸ at x 4, alpha .5', color:'#2B8EF5' },
        implementation:'Eighteen glyphs along a line lit by the positive half of one travelling sine, so a soft blue pulse runs left to right behind a fixed ▸ head; it lives inline under a dialogue turn.' },
      { id:'orbit-ring', short:'ORBT', name:'Breathing glyph orbit', layer:2, pass:3, atoms:['ring','ellipse','breath','sine'],
        params:{ count:52, radius_u:'min(0.3 W, 0.42 H)', ratio:0.4, spin:'a = 2π · i/52 + 0.3 · t', breath:'r = R · (1 + 0.1 · sin(0.6 · t + 0.3 · i))', alpha:'0.1 + 0.6 · (sin a + 1) / 2', glyph:'ø every 6th, else ·', center:'Ø at alpha .55', canvas_opacity:0.3, font:'JetBrains Mono 400 11 px', color:'#F6F1E4' },
        implementation:'52 glyphs on a flattened ellipse, each with its own breathing radius and an alpha that peaks at the bottom of the orbit; the canvas is held at 30 % under a pull quote.' },
      { id:'still-frame-runtime', short:'LOOP', name:'Frame runtime', layer:3, pass:4, atoms:['raf-loop','dpr','reduced-motion','clear'],
        params:{ dpr:'min(devicePixelRatio, 2)', resize:'canvas.width = clientWidth · dpr; setTransform(dpr)', loop:'requestAnimationFrame, t = (now − t0) / 1000', clear:'clearRect every frame, no trails', reduced_motion:'draw once at t = now, no loop', text:'textAlign center, textBaseline middle', aria:'canvas aria-hidden' },
        implementation:'One setupCanvas and one loop helper serve all four canvases; under prefers-reduced-motion the loop degenerates to a single still frame, so the page keeps its picture without motion.' }
    ],
    pass_order:['vocabulary · the glyph lists and label sequence','helix · project 150 glyphs, sort far to near, draw with depth alpha and glow','mask · elliptical radial mask over the helix canvas, title in the hole','grid · wave, pulse and orbit each from one sine','runtime · rAF loop, DPR cap, reduced-motion still frame'],
    notes:['Measured in the source: helix R = 148.8 u and H = 483.6 u at a 1000 × 620 hero; font 10.5 px scaled by 800/(800 − z) gives 9–13 px; 8 of 150 glyphs are labels.','Wave: the band spans two wavelengths across 70 columns; the ramp has five glyphs so sin φ is quantised to five weights.','Orbit: R = 130.2 u at 1000 × 310; the ellipse is 260 × 104 u; at canvas opacity .3 the brightest glyph reads at alpha .21.','The reference title is Instrument Serif; this rebuild sets it in Archivo (condensed) since no serif is inlined. Frame time t = 5.9 s so the pulse is fully lit.']
  },

  /* ---------- shared ---------- */
  _vocab:['·','∙','•','▪','│','─','ø','×','→','▸','001','010','042','077','126','154','218','258','369','396','410','523','808'],
  _pts(V){ const pts=[]; let cur=0; for(let i=0;i<150;i++){ const t=i/150; if(i%18===7){ const x=V.labels[cur++%V.labels.length]; pts.push({t,l:x[0],c:x[1],s:true,st:i%2}); } else pts.push({t,l:this._vocab[i%this._vocab.length],c:V.glyph,s:false,st:i%2}); } return pts; },
  _rgba(c,a){ return `rgba(${c[0]},${c[1]},${c[2]},${a})`; },
  _mono(size,wt){ return `${wt||400} ${size}px 'JetBrains Mono',ui-monospace,monospace`; },
  _track(x,size,em){ if('letterSpacing' in x)x.letterSpacing=(size*em).toFixed(2)+'px'; },
  _untrack(x){ if('letterSpacing' in x)x.letterSpacing='0px'; },

  /* helix into ctx x (already scaled to design units), panel w × h, time t, parallax tx,ty ∈ [−.5,.5]; u = device px per unit (for shadowBlur) */
  _helix(x,w,h,t,V,tx,ty,u){
    const pts=this._pts(V); const cx=w/2,cy=h/2,R=Math.min(w*.18,h*.24,240),H=Math.min(h*.78,820),P=800,arr=[];
    for(const p of pts){ const bt=((p.t+t*.018)%1), y=(bt-.5)*H; const th=bt*Math.PI*7+t*.22+(p.st?Math.PI:0);
      const px=Math.cos(th)*R+tx*18, z=Math.sin(th)*R, sc=P/(P-z); arr.push({sx:cx+px*sc,sy:cy+(y+ty*14)*sc,sc,d:(z+R)/(2*R),l:p.l,c:p.c,s:p.s}); }
    arr.sort((a,b)=>a.d-b.d); x.textAlign='center'; x.textBaseline='middle';
    for(const p of arr){ x.globalAlpha=.04+Math.pow(p.d,1.5)*.85; x.font=this._mono(Math.round(10.5*p.sc),p.s?500:400);
      if(p.s){ x.shadowColor=p.c; x.shadowBlur=6*p.d*u; x.fillStyle=p.c; } else { x.shadowBlur=0; x.fillStyle=V.glyph; }
      x.fillText(p.l,p.sx,p.sy); x.shadowBlur=0; }
    x.globalAlpha=1; },
  /* masked helix: offscreen device-px canvas for the hero panel (1000 × 620 u), masked, returned */
  _heroLayer(u,t,V,tx,ty){
    const A=window.ART; const W=Math.round(1000*u),H=Math.round(620*u); const c=A.off(W,H); const x=c.getContext('2d'); x.setTransform(u,0,0,u,0,0);
    this._helix(x,1000,620,t,V,tx,ty,u);
    // mask · radial-gradient(ellipse 44% 40% at 50% 52%, transparent 0–40%, #000 80%)
    x.globalCompositeOperation='destination-in'; x.save(); x.translate(500,322); x.scale(440,248);
    const g=x.createRadialGradient(0,0,0,0,0,1); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.4,'rgba(0,0,0,0)'); g.addColorStop(.8,'rgba(0,0,0,1)'); g.addColorStop(1,'rgba(0,0,0,1)');
    x.fillStyle=g; x.fillRect(-2,-2,4,4); x.restore(); x.globalCompositeOperation='source-over'; return c; },
  _wave(x,t,V){ const ch='·∙─-━', w=500,h=150,cols=70,rows=8,cw=w/cols,rh=h/rows; x.font=this._mono(12); x.textAlign='center'; x.textBaseline='middle';
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const ph=(c/cols)*Math.PI*4+t*.8+r*.15; const wv=Math.sin(ph)*.5+.5; const dist=Math.abs(r-rows/2+Math.sin(ph)*1.4); const it=Math.max(0,1-dist/2.2); if(it<.05)continue;
      x.fillStyle=this._rgba(V.wave,it*.55); x.fillText(ch[Math.floor(wv*(ch.length-1))],c*cw+cw/2,r*rh+rh/2); } },
  _pulse(x,t,V){ const ch=['·','∙','•','∙','·'], w=250,h=30; x.font=this._mono(11); x.textBaseline='middle'; x.textAlign='left';
    for(let i=0;i<18;i++){ const wv=Math.sin(t*1.6-i*.12); if(wv<=0)continue; x.fillStyle=this._rgba(V.pulse,wv*.5); x.fillText(ch[i%ch.length],14+i*(w-28)/18,h/2); }
    x.fillStyle=this._rgba(V.pulse,.5); x.fillText('▸',4,h/2); },
  _orbit(x,t,V){ const w=1000,h=310,cx=w/2,cy=h/2,R=Math.min(w*.3,h*.42),N=52; x.font=this._mono(11); x.textAlign='center'; x.textBaseline='middle';
    for(let i=0;i<N;i++){ const a=(i/N)*Math.PI*2+t*.3; const rr=R*(1+Math.sin(t*.6+i*.3)*.1); const d=(Math.sin(a)+1)/2; x.fillStyle=this._rgba(V.orbit,.1+d*.6); x.fillText(i%6===0?'ø':'·',cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.4); }
    x.fillStyle=this._rgba(V.orbit,.55); x.fillText('Ø',cx,cy); },

  /* static layers: grounds (under the animations) and text (over them), cached per key */
  _ground(x,V){ x.fillStyle=V.ground; x.fillRect(0,0,1000,620); x.fillStyle=V.paper; x.fillRect(0,620,1000,320); x.fillStyle=V.ground; x.fillRect(0,940,1000,310);
    const A=window.ART; x.fillStyle=V.paper2; A.rrect(x,220,634,560,232,2); x.fill(); x.strokeStyle=V.hair; x.lineWidth=1; x.stroke();
    x.fillStyle=V.hair; x.fillRect(250,823,500,1); x.fillRect(0,880,1000,1); },
  _text(x,V,u){
    const A=window.ART; x.textBaseline='alphabetic';
    // kicker · bars 28 u, gap 12
    x.textAlign='center'; x.font=this._mono(10.5); this._track(x,10.5,.22); const kw=x.measureText('REFERENCE № 013').width; x.fillStyle=V.kicker; x.fillText('REFERENCE № 013',500+10.5*.11,236); this._untrack(x);
    x.fillStyle=V.bar; x.fillRect(500-kw/2-12-28,232,28,1); x.fillRect(500+kw/2+12,232,28,1);
    // title · Archivo condensed, fit to 540 u, dark halo then bone
    const F=s=>`400 condensed ${s}px Archivo,sans-serif`; const size=A.fitText(x,'Glyph and Field.',F,540,100); x.font=F(size); this._track(x,size,-.025);
    x.save(); x.fillStyle=V.ground; x.shadowColor=V.halo+'.7)'; x.shadowBlur=80*u; x.fillText('Glyph and Field.',500,342); x.shadowColor=V.halo+'.5)'; x.shadowBlur=160*u; x.fillText('Glyph and Field.',500,342); x.restore();
    x.fillStyle=V.bone; x.fillText('Glyph and Field.',500,342); this._untrack(x);
    // deck
    x.font=this._mono(10); this._track(x,10,.22); x.fillStyle=V.deck; x.fillText('HELIX · WAVE · ORBIT · PULSE',500+1.1,393); this._untrack(x);
    // wave caption
    x.font=this._mono(9.5,500); this._track(x,9.5,.18); const c1='FIG. 01', c2='WAVE FIELD  ·  LAMINAR ACCENT'; const w1=x.measureText(c1).width; x.font=this._mono(9.5); const w2=x.measureText(c2).width; const tot=w1+8+w2; x.textAlign='left';
    x.font=this._mono(9.5,500); x.fillStyle=V.ink; x.fillText(c1,500-tot/2,846); x.font=this._mono(9.5); x.fillStyle=V.mute; x.fillText(c2,500-tot/2+w1+8,846); this._untrack(x);
    // pulse label
    x.font=this._mono(11,500); this._track(x,11,.14); x.fillStyle=V.ink; x.fillText('SYSTEM',180,900); this._untrack(x);
    // pull quote · rule, quote, attribution
    x.fillStyle=V.bone; x.fillRect(480,1026,40,1);
    const Q=s=>`400 condensed ${s}px Archivo,sans-serif`; const qs=A.fitText(x,'The field is drawn, not placed.',Q,380,38); x.font=Q(qs); this._track(x,qs,-.015); x.textAlign='center'; x.fillStyle=V.bone; x.fillText('The field is drawn, not placed.',500,1092); this._untrack(x);
    x.font=this._mono(9.5); this._track(x,9.5,.22); x.fillStyle=V.mute2; x.fillText('COMPONENT · ATMOSPHERE',500+1,1130); this._untrack(x); },
  _layers(canvas,V){ const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const key=W+'x'+H+'#'+V.id; if(this._lc&&this._lc.key===key)return this._lc;
    const g=A.off(W,H); const gx=g.getContext('2d'); gx.setTransform(u,0,0,u,0,0); this._ground(gx,V);
    const t=A.off(W,H); const tx=t.getContext('2d'); tx.setTransform(u,0,0,u,0,0); this._text(tx,V,u);
    return this._lc={key,g,t,u}; },
  /* one full frame at time t into ctx x (device px, untransformed) */
  _frame(x,canvas,V,t,px,py){
    const L=this._layers(canvas,V); const u=L.u; x.setTransform(1,0,0,1,0,0); x.drawImage(L.g,0,0);
    x.globalAlpha=.95; x.drawImage(this._heroLayer(u,t,V,px,py),0,0); x.globalAlpha=1;
    x.setTransform(u,0,0,u,250*u,660*u); this._wave(x,t,V);
    x.setTransform(u,0,0,u,180*u,907*u); this._pulse(x,t,V);
    x.setTransform(u,0,0,u,0,940*u); x.globalAlpha=.3; this._orbit(x,t,V); x.globalAlpha=1;
    x.setTransform(1,0,0,1,0,0); x.drawImage(L.t,0,0); },

  render(canvas,w,h,dpr,V,done){
    const x=canvas.getContext('2d'); const u=canvas.width/1000;
    const go=()=>{ this._frame(x,canvas,V,5.9,0,0); done&&done(); };
    const need=["400 12px 'JetBrains Mono'","500 12px 'JetBrains Mono'","400 condensed 100px Archivo"];
    if(document.fonts&&document.fonts.check&&need.some(s=>!document.fonts.check(s))){ Promise.all(need.map(s=>document.fonts.load(s))).then(go,go); return false; }
    go(); return false;
  },

  motion(canvas,w,h,dpr,V,t,ctx){
    if(!this._mm){ this._mm={mx:0,my:0,tx:0,ty:0}; addEventListener('mousemove',e=>{ this._mm.mx=e.clientX/innerWidth-.5; this._mm.my=e.clientY/innerHeight-.5; }); }
    const m=this._mm; m.tx+=(m.mx-m.tx)*.04; m.ty+=(m.my-m.ty)*.04;
    this._frame(ctx,canvas,V,t,m.tx,m.ty);
  },

  live(V){
    let faces=''; try{ for(const ss of document.styleSheets){ let rules; try{ rules=ss.cssRules; }catch(e){ continue; } for(const r of rules){ if(r.type===CSSRule.FONT_FACE_RULE){faces+=r.cssText+'\n';} } } }catch(e){}
    const L=JSON.stringify(V.labels.map(l=>({t:l[0],c:l[1]}))); const rgb=c=>c.join(',');
    return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${(document.body.dataset.root||'../../')}_shared/fonts.css"><style>${faces}
:root{--ground:${V.ground};--paper:${V.paper};--paper2:${V.paper2};--hair:${V.hair};--ink:${V.ink};--mute:${V.mute};--mute2:${V.mute2};--bone:${V.bone};--kicker:${V.kicker};--deck:${V.deck};--bar:${V.bar};--mono:'JetBrains Mono',ui-monospace,monospace;--disp:Archivo,sans-serif}
*{box-sizing:border-box}html,body{margin:0;background:var(--paper);overflow:hidden;height:100%}
#plate{width:1000px;height:1250px;position:relative;transform-origin:0 0;background:var(--paper)}
.hero{position:absolute;left:0;top:0;width:1000px;height:620px;background:var(--ground);overflow:hidden;isolation:isolate}
#hero-canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.95;-webkit-mask-image:radial-gradient(ellipse 44% 40% at 50% 52%,transparent 0%,transparent 40%,#000 80%);mask-image:radial-gradient(ellipse 44% 40% at 50% 52%,transparent 0%,transparent 40%,#000 80%)}
.hero-inner{position:relative;z-index:2;height:100%;display:grid;place-items:center;text-align:center}
.kicker{font-family:var(--mono);font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--kicker);margin-bottom:22px;display:inline-flex;align-items:center;gap:12px}.kicker .bar{width:28px;height:1px;background:var(--bar)}
h1{font-family:var(--disp);font-stretch:condensed;font-weight:400;font-size:100px;line-height:.92;letter-spacing:-.025em;margin:0;color:var(--bone);text-shadow:0 0 80px rgba(0,0,0,.7),0 0 160px rgba(0,0,0,.5)}
.deck{margin:26px auto 0;color:var(--deck);font-family:var(--mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;line-height:2}
.wavep{position:absolute;left:0;top:620px;width:1000px;height:260px;display:grid;place-items:center}
.fr{width:560px;padding:26px 22px 16px;background:var(--paper2);border:1px solid var(--hair);border-radius:2px;display:flex;flex-direction:column;align-items:center}
.fr canvas{width:500px;height:150px;display:block}
.cap{margin-top:13px;padding-top:11px;border-top:1px solid var(--hair);width:500px;text-align:center;font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--mute)}.cap .n{color:var(--ink);font-weight:500;margin-right:8px}
.pulsep{position:absolute;left:0;top:880px;width:1000px;height:60px;border-top:1px solid var(--hair)}.turn{position:absolute;left:180px;top:10px}
.mt{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;color:var(--ink);line-height:1}
.inline-c{display:block;margin:6px 0 0;height:30px;width:250px}
.atmo{position:absolute;left:0;top:940px;width:1000px;height:310px;overflow:hidden;isolation:isolate;display:grid;place-items:center;background:var(--ground)}
.atmo canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.3;z-index:0}.atmo>*:not(canvas){position:relative;z-index:1}
.pull{padding:30px 24px;text-align:center;position:relative}.pull::before{content:"";position:absolute;left:50%;top:0;width:40px;height:1px;background:var(--bone);transform:translateX(-50%)}
.pull blockquote{font-family:var(--disp);font-stretch:condensed;font-weight:400;font-size:34px;line-height:1.22;letter-spacing:-.015em;margin:0;color:var(--bone)}
.pull .at{margin-top:16px;font-family:var(--mono);font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--mute2);display:inline-block}
</style></head><body><div id="plate">
<section class="hero"><canvas id="hero-canvas"></canvas><div class="hero-inner"><div><div class="kicker"><span class="bar"></span><span>Reference № 013</span><span class="bar"></span></div><h1>Glyph and Field.</h1><div class="deck">Helix · Wave · Orbit · Pulse · live</div></div></div></section>
<section class="wavep"><div class="fr"><canvas id="fig-wave"></canvas><div class="cap"><span class="n">Fig. 01</span> Wave Field &nbsp;·&nbsp; Laminar Accent</div></div></section>
<section class="pulsep"><div class="turn"><div class="mt">System</div><canvas class="inline-c" data-anim="pulse"></canvas></div></section>
<section class="atmo"><canvas id="atm-orbit"></canvas><div class="pull"><blockquote>The field is drawn, not placed.</blockquote><div class="at">Component · Atmosphere</div></div></section>
</div><script>
/* the four animations, verbatim from the reference; colours read from the variant */
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{ for(const [sel,max,start] of [['h1',540,100],['blockquote',380,38]]){ const el=document.querySelector(sel); let z=start; el.style.fontSize=z+'px'; const r=document.createRange(); r.selectNodeContents(el); const sc=()=>r.getBoundingClientRect().width/(parseFloat(document.getElementById('plate').dataset.s)||1); for(let i=0;i<40&&sc()>max;i++){ z*=.94; el.style.fontSize=z+'px'; } } });
function fit(){ const s=Math.min(innerWidth/1000,innerHeight/1250); const p=document.getElementById('plate'); p.style.transform='scale('+s+')'; p.dataset.s=s; p.style.left=((innerWidth-1000*s)/2)+'px'; p.style.top=((innerHeight-1250*s)/2)+'px'; p.style.position='absolute'; } fit(); addEventListener('resize',fit);
function setupCanvas(cv){ if(!cv)return null; cv.setAttribute('aria-hidden','true'); const ctx=cv.getContext('2d'); const dpr=Math.min(devicePixelRatio||1,2);
  function resize(){ const w=cv.clientWidth,h=cv.clientHeight; cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); } resize();
  return {ctx,get w(){return cv.clientWidth},get h(){return cv.clientHeight}}; }
function loop(fn){ if(REDUCED){fn(performance.now());return;} requestAnimationFrame(function f(t){fn(t);requestAnimationFrame(f);}); }
(function(){ const s=setupCanvas(document.getElementById('hero-canvas')); if(!s)return; const ctx=s.ctx;
  const G=${JSON.stringify(this._vocab)}; const SYS=${L}; const GL='${V.glyph}'; const pts=[]; let cur=0;
  for(let i=0;i<150;i++){ const t=i/150; if(i%18===7){const x=SYS[cur++%SYS.length];pts.push({t,l:x.t,c:x.c,s:true,st:i%2});} else pts.push({t,l:G[i%G.length],c:GL,s:false,st:i%2}); }
  const t0=performance.now(); let mx=0,my=0,tx=0,ty=0; addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;});
  loop(now=>{ const el=(now-t0)/1000; tx+=(mx-tx)*.04; ty+=(my-ty)*.04; const w=s.w,h=s.h; ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2,R=Math.min(w*.18,h*.24,240),H=Math.min(h*.78,820),P=800,arr=[];
    for(const p of pts){ const bt=((p.t+el*.018)%1), y=(bt-.5)*H; const th=bt*Math.PI*7+el*.22+(p.st?Math.PI:0); const x=Math.cos(th)*R+tx*18, z=Math.sin(th)*R, sc=P/(P-z); arr.push({sx:cx+x*sc,sy:cy+(y+ty*14)*sc,sc,d:(z+R)/(2*R),l:p.l,c:p.c,s:p.s}); }
    arr.sort((a,b)=>a.d-b.d); ctx.textAlign='center';ctx.textBaseline='middle';
    for(const p of arr){ ctx.globalAlpha=.04+Math.pow(p.d,1.5)*.85; ctx.font=(p.s?500:400)+' '+Math.round(10.5*p.sc)+"px 'JetBrains Mono',monospace";
      if(p.s){ctx.shadowColor=p.c;ctx.shadowBlur=6*p.d;ctx.fillStyle=p.c;} else {ctx.shadowBlur=0;ctx.fillStyle=GL;} ctx.fillText(p.l,p.sx,p.sy); ctx.shadowBlur=0; }
    ctx.globalAlpha=1; }); })();
(function(){ const s=setupCanvas(document.getElementById('fig-wave')); if(!s)return; const ctx=s.ctx, ch='·∙─-━', t0=performance.now();
  loop(now=>{ const w=s.w,h=s.h,el=(now-t0)/1000; ctx.clearRect(0,0,w,h); ctx.font="12px 'JetBrains Mono',monospace";ctx.textAlign='center';ctx.textBaseline='middle'; const cols=70,rows=8,cw=w/cols,rh=h/rows;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const ph=(c/cols)*Math.PI*4+el*.8+r*.15; const wv=Math.sin(ph)*.5+.5; const dist=Math.abs(r-rows/2+Math.sin(ph)*1.4); const it=Math.max(0,1-dist/2.2); if(it<.05)continue;
      ctx.fillStyle='rgba(${rgb(V.wave)},'+(it*.55)+')'; ctx.fillText(ch[Math.floor(wv*(ch.length-1))],c*cw+cw/2,r*rh+rh/2); } }); })();
(function(){ const s=setupCanvas(document.getElementById('atm-orbit')); if(!s)return; const ctx=s.ctx,t0=performance.now();
  loop(now=>{ const w=s.w,h=s.h,el=(now-t0)/1000; ctx.clearRect(0,0,w,h); ctx.font="11px 'JetBrains Mono',monospace";ctx.textAlign='center';ctx.textBaseline='middle'; const cx=w/2,cy=h/2,R=Math.min(w*.3,h*.42),N=52;
    for(let i=0;i<N;i++){ const a=(i/N)*Math.PI*2+el*.3; const rr=R*(1+Math.sin(el*.6+i*.3)*.1); const d=(Math.sin(a)+1)/2; ctx.fillStyle='rgba(${rgb(V.orbit)},'+(.1+d*.6)+')'; ctx.fillText(i%6===0?'ø':'·',cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.4); }
    ctx.fillStyle='rgba(${rgb(V.orbit)},.55)'; ctx.fillText('Ø',cx,cy); }); })();
document.querySelectorAll('canvas[data-anim="pulse"]').forEach(cv=>{ const s=setupCanvas(cv); if(!s)return; const ctx=s.ctx,t0=performance.now(),ch=['·','∙','•','∙','·'];
  loop(now=>{ const w=s.w,h=s.h||30,el=(now-t0)/1000; ctx.clearRect(0,0,w,h); ctx.font="11px 'JetBrains Mono',monospace";ctx.textBaseline='middle';ctx.textAlign='left';
    for(let i=0;i<18;i++){ const wv=Math.sin(el*1.6-i*.12); if(wv<=0)continue; ctx.fillStyle='rgba(${rgb(V.pulse)},'+(wv*.5)+')'; ctx.fillText(ch[i%ch.length],14+i*(w-28)/18,h/2); }
    ctx.fillStyle='rgba(${rgb(V.pulse)},.5)'; ctx.fillText('▸',4,h/2); }); });
</script></body></html>`;
  }
};
