window.STUDY={
  id:'ts-14-deep-space-chroma', code:'TS-14', fig:'1.14',
  title:'Deep Space Chroma · dispersion fields',
  kicker:'Technique · TS-14',
  lede:'One cyclic dispersion ramp, read along a phase field, envelope, soft focus, grain.',
  body:[
    'Twenty-one key visuals, one optical system. Every picture is light split into a repeating fringe: black, crimson, orange, warm white, ice blue, steel, black. That fringe is a single 256-entry cyclic LUT, measured from the plates. What changes between pictures is only the phase field the LUT is read along: the angle around a focus gives a burst, angle plus radius a vortex, angle plus log-radius a spiral, distance to a curve a ribbon, distance to a circle a ring.',
    'A luminance envelope decides where the fringe is allowed to exist: a pinch at the focus, black sector wedges, a vignette, a near-black floor at (14, 13, 12). Then the whole image is defocused with a gaussian of 1.2 % of the width and covered with fine mono grain at 2 %. In motion the phase slides along the field, so the light crawls through the lobes while the structure holds.'
  ],
  source:'Reference 14 · Deep Space Chroma 09 (ø co. key visual set, 21 plates, 5000 × 3500 each), 1000 × 700',
  spot:[232,143,94], ref:{w:1000,h:700},
  variantLabel:'Structure',
  variants:[
    { id:'ref',    label:'Burst · as reference', sw:['#1D1C1A','#B9351F','#E88F5E','#DCC2B8','#A5C4C7'], spot:[232,143,94],
      P:{ type:'burst', cx:0.47, cy:0.345, k:9, warp:0.55, twist:0, spiral:0, flow:0.06, occ:[[-95,25,10],[77,14,8]], core:0.02, vig:0.2, gain:1.0, s1:1.1, s2:2.7, lobe:[0.7,0.3,2.3,0.6] } },
    { id:'vortex', label:'Vortex',               sw:['#1D1C1A','#B9351F','#E88F5E','#DCC2B8','#A5C4C7'], spot:[232,143,94],
      P:{ type:'burst', cx:0.44, cy:0.42, k:9, warp:0.4, twist:2.6, spiral:0, flow:0.06, occ:[[-60,12,6],[150,14,7]], core:0.02, vig:0.45, gain:1.0, s1:0.4, s2:3.9, lobe:[0.7,0.3,1.7,1.2] } },
    { id:'spiral', label:'Spiral',               sw:['#1D1C1A','#B9351F','#E88F5E','#DCC2B8','#A5C4C7'], spot:[232,143,94],
      P:{ type:'burst', cx:0.34, cy:0.3, k:3, warp:0.2, twist:0, spiral:1.6, flow:0.05, occ:[], core:0.02, vig:0.9, gain:1.0, s1:2.2, s2:0.8, lobe:[0.8,0.2,2,0] } },
    { id:'ribbon', label:'Ribbon',               sw:['#1D1C1A','#B9351F','#E88F5E','#DCC2B8','#A5C4C7'], spot:[232,143,94],
      P:{ type:'ribbon', cy:0.36, amp:0.13, freq:0.9, ph:0.15, period:0.19, width:0.17, flow:0.05, tilt:-0.15, vig:0.2, gain:1.0 } },
    { id:'ring',   label:'Ring',                 sw:['#1D1C1A','#B9351F','#E88F5E','#DCC2B8','#A5C4C7'], spot:[232,143,94],
      P:{ type:'ring', cx:0.72, cy:0.36, R:0.13, R0:0.07, period:0.11, width:0.14, flow:0.05, vig:0.3, gain:1.0 } },
    { id:'io',     label:'Ø · ember / blue',     sw:['#101014','#F4551E','#FFFFFF','#2F5AE6'], spot:[244,85,30],
      P:{ type:'burst', cx:0.47, cy:0.345, k:9, warp:0.55, twist:0, spiral:0, flow:0.06, occ:[[-95,25,10],[77,14,8]], core:0.02, vig:0.2, gain:1.0, s1:1.1, s2:2.7, lobe:[0.7,0.3,2.3,0.6] },
      lut:[[0,'#101014'],[0.12,'#5A1A0C'],[0.24,'#C23E17'],[0.36,'#F4551E'],[0.46,'#F79A6B'],[0.54,'#FFFFFF'],[0.62,'#B9C8F5'],[0.72,'#5B7FF0'],[0.84,'#2F5AE6'],[0.92,'#1A2A6E'],[1,'#101014']], floor:[16,16,20] }
  ],
  points:[
    {u:0.62,v:0.20,d:'LUT', label:'One cycle of the ramp · black → crimson → orange → white → ice → steel → black',t:'dispersion-lut',dir:[1,-1]},
    {u:0.80,v:0.40,d:'FAM', label:'Structure · burst; vortex, spiral, ribbon and ring are the other families (V)',t:'structure-family',dir:[1,1]},
    {u:0.30,v:0.62,d:'PHSE',label:'Angular phase · a = 9 · θ / 2π; lobes are the LUT repeating around the focus',t:'angular-phase',dir:[-1,1]},
    {u:0.22,v:0.42,d:'WARP',label:'Lobe warp · θ + .55 · (sin 3θ · ⅓ + sin 5θ · ⅕): unequal lane widths',t:'lobe-warp',dir:[-1,-1]},
    {u:0.47,v:0.345,d:'PNCH',label:'Pinch · envelope → 0 inside r < .03 W; the focus is a dark point',t:'pinch-core',dir:[1,-1]},
    {u:0.46,v:0.08,d:'OCCL',label:'Sector occluder · wedge at −95°, half-width 25°, feather 10°; a second at 77°, 14° / 8°',t:'sector-occluder',dir:[1,1]},
    {u:0.90,v:0.62,d:'FLOW',label:'Flow · the phase slides .06 cycles/s along every lobe; the fan turns .015 rad/s (M)',t:'chroma-flow',dir:[-1,-1]},
    {u:0.10,v:0.85,d:'BLUR',label:'Soft focus · gaussian σ = 1.2 % of width after the LUT, so lanes bleed into each other',t:'soft-focus',dir:[1,-1]},
    {u:0.70,v:0.90,d:'GRN', label:'Grain · mono, amplitude 2 %, 1 px cells; channels correlate .95 in the source',t:'film-grain',dir:[-1,-1]},
    {u:0.55,v:0.55,d:'FLOR',label:'Floor · black is (14,13,12), never 0; the vignette darkens with r²',t:'lifted-black',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1000,700], grammar:'a cyclic dispersion fringe (black → crimson → orange → warm white → ice blue → steel → black) read along a phase field around a focus; sector occluders; heavy gaussian defocus; fine mono grain; lifted warm black', set:'21 plates, 5000 × 3500, ø co. “Deep Space Chroma” key visuals' },
    units:'normalized by width: x ∈ [0,1], y ∈ [0, H/W]; angles in degrees, screen space (y down)',
    palette:{ floor:'#0E0D0C', deep:'#3A1512', crimson:'#7A2219', red:'#BE3A1E', orange:'#E8582C', amber:'#F08A4A', peach:'#F2B78E', white:'#F4E2D6', pale_ice:'#D8DEDC', ice:'#9DBDC4', steel:'#6C8B98', deep_steel:'#445C68', dusk:'#2C3A44' },
    techniques:[
      { id:'dispersion-lut', short:'LUT', name:'Cyclic dispersion ramp', layer:0, pass:1, atoms:['lut','cyclic','fringe','dispersion'],
        params:{ stops:[[0,'#3A1512'],[0.10,'#7A2219'],[0.21,'#BE3A1E'],[0.32,'#E8582C'],[0.42,'#F08A4A'],[0.49,'#F2B78E'],[0.535,'#F4E2D6'],[0.575,'#D8DEDC'],[0.62,'#9DBDC4'],[0.70,'#6C8B98'],[0.78,'#445C68'],[0.86,'#2C3A44'],[0.93,'#2A1E1C'],[1,'#3A1512']], cycle:'no floor inside the cycle — the dark part is deep crimson/dusk; true black comes only from the envelope (wedges, pinch, vignette)', measured:'band means per luminance class across all 21 plates: red side (235,182,147) (232,143,94) (225,95,57) (185,53,40) (104,30,24) (61,19,14); blue side (165,196,199) (120,154,165) (79,105,116) (49,68,78); white (204,198,190), brightest (222,190,184)', share:'hue 0–30° ≈ 70 % of chromatic pixels, 180–210° ≈ 6 %, 345–360° ≈ 6 %' },
        implementation:'A 256-entry LUT built from the stops; phase = frac(a) indexes it, so a full lobe is one cycle: dark lane, red flank, white core, blue flank, dark lane. The red side spans .46 of the cycle and the blue side .30, which is why orange dominates.' },
      { id:'angular-phase', short:'PHSE', name:'Phase field · angle around a focus', layer:0, pass:0, atoms:['field','polar','phase'],
        params:{ burst:'a = k · θ / 2π + flow · t', vortex:'+ twist · r', spiral:'+ spiral · ln(r + .002)', ribbon:'a = d / period, d = signed distance to y = cy + amp · sin(2π(freq · x + ph))', ring:'a = (r − R) / period', k_ref:9, focus_ref:[0.47,0.345] },
        implementation:'The only thing that differs between the 21 plates is this scalar field; the LUT and envelope are shared. Each structure family is one expression for a.' },
      { id:'lobe-warp', short:'WARP', name:'Unequal lobes', layer:0, pass:0, atoms:['warp','harmonic','irregular'],
        params:{ theta_warped:'θ + warp · (sin(3θ + s1) / 3 + sin(5θ + s2) / 5)', warp_ref:0.55, seeds:[1.1,2.7] },
        implementation:'Two low harmonics of the angle stretch some lobes and compress others before the phase is taken, so no two lanes have the same width — the reference’s hand-made look without breaking the cycle count.' },
      { id:'pinch-core', short:'PNCH', name:'Pinch at the focus', layer:1, pass:2, atoms:['envelope','smoothstep','focus'],
        params:{ env:'smoothstep(0, core, r)', core_ref:0.03, note:'plates 04, 09, 14, 16, 18, 19, 20 all pinch to a dark point' },
        implementation:'The envelope falls to the floor inside a small radius, so every lobe converges on a black point rather than a bright one.' },
      { id:'sector-occluder', short:'OCCL', name:'Sector occluders', layer:1, pass:2, atoms:['mask','wedge','gaussian'],
        params:{ wedge:'env *= smoothstep(hw − f, hw + f, |Δθ|) per occluder', ref:[['−95°','half-width 25°','feather 10°'],['77°','half-width 14°','feather 8°']], lobe_gain:'env *= .7 + .3 · (.5 + .5 sin(2.3 θ + .6))', other_plates:'08 = a cross of two wedges; 16 = a rectangle at the focus' },
        implementation:'Black wedges are multiplied into the envelope as gaussians of angular distance; they make the dark sectors that give the bursts their asymmetry.' },
      { id:'soft-focus', short:'BLUR', name:'Post-LUT gaussian defocus', layer:2, pass:3, atoms:['blur','gaussian','defocus'],
        params:{ sigma:'0.012 · W', measured:'p99 horizontal gradient 12/255 per px at 1600 px; no edge sharper than ≈ 1 % of width', order:'after the LUT, so colors mix in RGB and produce the grey-mauve between orange and blue' },
        implementation:'One blur over the finished color image. Blurring after the LUT (not the phase) is what makes neighboring lanes bleed into muddy transitions instead of clean fringes.' },
      { id:'film-grain', short:'GRN', name:'Mono grain', layer:3, pass:4, atoms:['grain','noise','multiply'],
        params:{ amp:0.02, pitch_px:'1 at 1600 px (≈ 1.5 at plate)', mono:true, measured:'black-region std 5.3/255; high-pass std 3.9/255; R/G/B high-pass correlation .96 / .95' },
        implementation:'Multiplicative hashed noise, identical across channels, so the grain reads as film rather than color noise.' },
      { id:'lifted-black', short:'FLOR', name:'Lifted floor + vignette', layer:1, pass:2, atoms:['floor','vignette','lift'],
        params:{ floor:[14,13,12], vignette:'env *= 1 − vig · r²', vig_ref:0.2, measured:'reference L p10 = .048 (≈ 12/255); a mid-dark region reads (29,28,26)' },
        implementation:'Every pixel is mix(floor, LUT(phase), env): nothing reaches 0, and the far field sinks toward the floor with the square of the distance from the focus.' },
      { id:'chroma-flow', short:'FLOW', name:'Phase flow (motion)', layer:4, pass:5, atoms:['loop','drift','phase'],
        params:{ flow:'a += 0.06 · t (cycles per second)', rotate:'θ += 0.015 · t', warp_drift:'s1 += 0.05 · t', work_width_px:400, then:'blur + grain per frame' },
        implementation:'Sliding the phase moves the fringe through the lobes — the light crawls along each ray — while a slow rotation and warp drift keep the structure alive without changing it.' },
      { id:'structure-family', short:'FAM', name:'Structure families', layer:0, pass:0, atoms:['burst','vortex','spiral','ribbon','ring'],
        params:{ burst:'03, 08, 09, 11, 12, 13, 14, 16, 18, 19', vortex:'04, 20', petal:'05 (burst, k = 4, radial term)', spiral:'07', ribbon:'01, 02, 06, 10, 15, 17', ring:'21', presets:'engine.html carries a first-pass preset for all 21' },
        implementation:'Each plate is a preset: one family, a focus or a curve, k, warp, twist, occluders. The engine reproduces any of them from ≈ 12 numbers.' }
    ],
    pass_order:['field · phase a(x,y) for the structure family','envelope · pinch × wedges × vignette','lut · mix(floor, LUT[frac a], env)','blur · gaussian σ .012 W','grain · mono ×(1 + .02 n)'],
    notes:['LUT stops were fitted to per-luminance band means over all 21 plates; the white core is set to the brightest measured (222,190,184) rather than the mean.','Reference 09: focus at (0.47, 0.345 W), ≈ 9 lobes, two black wedges (up, σ 14°; down-right, σ 9°), blue lanes dominant on the left.','Fidelity is measured on the still at t = 0; the motion version is the same field with the phase sliding.','engine.html in this folder is the production system: the same math as a WebGL fragment shader, 21 presets, drag-to-focus, export.']
  },

  /* ---------- engine (CPU) ---------- */
  _stops:[[0,'#3A1512'],[0.10,'#7A2219'],[0.21,'#BE3A1E'],[0.32,'#E8582C'],[0.42,'#F08A4A'],[0.49,'#F2B78E'],[0.535,'#F4E2D6'],[0.575,'#D8DEDC'],[0.62,'#9DBDC4'],[0.70,'#6C8B98'],[0.78,'#445C68'],[0.86,'#2C3A44'],[0.93,'#2A1E1C'],[1,'#3A1512']],
  _lut(V){ const A=window.ART; this._luts=this._luts||{}; const k=V.id; if(!this._luts[k]){ const L=A.lut(V.lut||this._stops); const f=new Float32Array(256*3); for(let i=0;i<256;i++){ f[i*3]=L[i][0]; f[i*3+1]=L[i][1]; f[i*3+2]=L[i][2]; } this._luts[k]=f; } return this._luts[k]; },
  _field(P,x,y,t){ // returns [phase a, envelope]
    const TAU=Math.PI*2; let a=0, env=1;
    if(P.type==='ribbon'){
      const xr=x, yc=P.cy+P.amp*Math.sin(TAU*(P.freq*xr+P.ph+0.01*t))+P.tilt*(x-0.5); const dy=P.amp*TAU*P.freq*Math.cos(TAU*(P.freq*xr+P.ph+0.01*t))+P.tilt; const d=(y-yc)/Math.sqrt(1+dy*dy);
      a=d/P.period+P.flow*t; env=Math.exp(-(d/P.width)*(d/P.width)*2); env*=1-P.vig*((x-0.5)*(x-0.5)+(y-0.35)*(y-0.35));
    } else if(P.type==='ring'){
      const dx=x-P.cx, dy=y-P.cy, r=Math.hypot(dx,dy), d=r-P.R; a=d/P.period+P.flow*t+0.06*Math.sin(Math.atan2(dy,dx)*2+t*0.2);
      env=Math.exp(-(d/P.width)*(d/P.width)*2); const s=Math.min(1,Math.max(0,(r-P.R0)/0.03)); env*=s*s*(3-2*s); env*=1-P.vig*r*r;
    } else {
      const dx=x-P.cx, dy=y-P.cy, r=Math.hypot(dx,dy); let th=Math.atan2(dy,dx)+0.015*t;
      const w=th+P.warp*(Math.sin(3*th+P.s1+0.05*t)/3+Math.sin(5*th+P.s2)/5);
      a=P.k*w/TAU+P.twist*r+P.spiral*Math.log(r+0.002)+P.flow*t;
      const s=Math.min(1,Math.max(0,r/P.core)); env=s*s*(3-2*s); env*=1-P.vig*r*r;
      if(P.lobe){ env*=P.lobe[0]+P.lobe[1]*(0.5+0.5*Math.sin(th*P.lobe[2]+P.lobe[3])); }
      for(const o of P.occ){ let d=th-o[0]*Math.PI/180; d=Math.abs(Math.atan2(Math.sin(d),Math.cos(d))); const hw=o[1]*Math.PI/180, fe=(o[2]!==undefined?o[2]:o[1]*0.4)*Math.PI/180; let q=(d-(hw-fe))/(2*fe); q=q<0?0:q>1?1:q; env*=q*q*(3-2*q); }
    }
    return [a,Math.max(0,Math.min(1,env*(P.gain||1)))];
  },
  _paint(work,V,t,pad){ pad=pad||0; const L=this._lut(V); const P=V.P; const fl=V.floor||[14,13,12]; const w=work.width,h=work.height; const we=w-2*pad; const x2=work.getContext('2d',{willReadFrequently:true}); const id=x2.createImageData(w,h); const d=id.data;
    for(let j=0;j<h;j++){ const y=(j+0.5-pad)/we; for(let i=0;i<w;i++){ const x=(i+0.5-pad)/we; const fe=this._field(P,x,y,t); const ph=fe[0]-Math.floor(fe[0]); const e=fe[1]; const k=((ph*255)|0)*3; const o=(j*w+i)*4;
        d[o]=fl[0]+(L[k]-fl[0])*e; d[o+1]=fl[1]+(L[k+1]-fl[1])*e; d[o+2]=fl[2]+(L[k+2]-fl[2])*e; d[o+3]=255; } }
    x2.putImageData(id,0,0); },
  /* full frame into ctx (device px canvas W×H): field at `scale` of W, blur, grain */
  _frame(ctx,W,H,V,t,scale,grainSeed){ const A=window.ART; const ww=Math.max(32,Math.round(W*scale)), hh=Math.max(32,Math.round(H*scale)); const pw=Math.ceil(0.03*ww); const work=A.off(ww+2*pw,hh+2*pw); this._paint(work,V,t,pw); const PW=pw/scale;
    ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctx.filter=`blur(${(0.012*W).toFixed(1)}px)`; ctx.drawImage(work,-PW,-PW,W+2*PW,H+2*PW); ctx.filter='none';
    A.grain(ctx,{amp:0.02,pitch:Math.max(1,Math.round(W/1000)),seed:grainSeed||14,mono:true}); },

  render(canvas,w,h,dpr,V,done){ const x=canvas.getContext('2d',{willReadFrequently:true}); this._frame(x,canvas.width,canvas.height,V,0,1,14); done&&done(); return false; },

  motion(canvas,w,h,dpr,V,t,ctx){ const W=canvas.width,H=canvas.height; this._frame(ctx,W,H,V,t,Math.min(1,400/W),14+((t*8)|0)); },

  live(V){ return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#1d1c1a;overflow:hidden}iframe{border:0;width:100%;height:100%;display:block}</style></head><body><iframe src="engine.html?preset=${encodeURIComponent(V.id)}&embed=1" title="Deep Space Chroma engine"></iframe></body></html>`; }
};
