
/* ═══ CHROMA core · photoelastic polariscope model · shared by study.js (CPU) and engine.html (GLSL) ═══ */
window.CHROMA=(function(){
  const C={}; const TAU=Math.PI*2;
  /* CIE 1931 2° CMF, Wyman–Sloan–Shirley multi-lobe fit */
  const g=(l,mu,s1,s2)=>{ const s=l<mu?s1:s2; const t=(l-mu)/s; return Math.exp(-0.5*t*t); };
  const cmf=l=>[1.056*g(l,599.8,37.9,31.0)+0.362*g(l,442.0,16.0,26.7)-0.065*g(l,501.1,20.4,26.2), 0.821*g(l,568.8,46.9,40.5)+0.286*g(l,530.9,16.3,31.1), 1.217*g(l,437.0,11.8,36.0)+0.681*g(l,459.0,26.0,13.8)];
  const planck=(l,T)=>Math.pow(l*1e-9,-5)/(Math.exp(14387770/(l*T))-1);
  const M=[[3.2406,-1.5372,-0.4986],[-0.9689,1.8758,0.0415],[0.0557,-0.2040,1.0570]];
  /* Michel-Lévy chart for a crossed polariscope: color(δ) for δ = 0 … N−1 nm.
     opts: T (K), wb (0..1 partial von Kries to D65), exposure, sat, blueRoll (desaturate δ>480), grade (hue compression 0..1 toward warm/cool anchors, applied in display space), gdip (green dip of the source), leak (unpolarized leak through the analyser: imperfect extinction lifts the dark bands to crimson), warm/cool (anchor hues, deg) */
  C.chart=function(o){ o=Object.assign({T:3000,wb:0.6,exposure:0.8,sat:1.4,blueRoll:0.85,grade:0.75,gdip:0.1,leak:0.06,warm:6,cool:196,N:1600},o||{});
    const lam=[]; for(let l=380;l<=720;l+=4)lam.push(l); const S=[],CM=[]; let smax=0;
    for(const l of lam){ let s=planck(l,o.T); s*=1-o.gdip*Math.exp(-((l-548)/48)*((l-548)/48)); S.push(s); if(s>smax)smax=s; CM.push(cmf(l)); }
    for(let i=0;i<S.length;i++)S[i]/=smax;
    const white=[0,0,0]; for(let i=0;i<lam.length;i++){ white[0]+=S[i]*CM[i][0]; white[1]+=S[i]*CM[i][1]; white[2]+=S[i]*CM[i][2]; }
    const target=[0.9505,1.0,1.089]; const scale=[0,1,2].map(k=>Math.pow(target[k]/(white[k]/white[1]),o.wb));
    const out=new Float32Array(o.N*3); const A1=(o.warm!==undefined?o.warm:18),A2=(o.cool!==undefined?o.cool:196);
    for(let d=0;d<o.N;d++){ let X=0,Y=0,Z=0; for(let i=0;i<lam.length;i++){ const s=Math.sin(Math.PI*d/lam[i]); const tr=(s*s*(1-o.leak)+o.leak)*S[i]; X+=tr*CM[i][0]; Y+=tr*CM[i][1]; Z+=tr*CM[i][2]; }
      const k=2.0*o.exposure/white[1]; X*=scale[0]*k; Y*=scale[1]*k; Z*=scale[2]*k;
      let r=Math.max(0,M[0][0]*X+M[0][1]*Y+M[0][2]*Z), gg=Math.max(0,M[1][0]*X+M[1][1]*Y+M[1][2]*Z), b=Math.max(0,M[2][0]*X+M[2][1]*Y+M[2][2]*Z);
      let L=0.2126*r+0.7152*gg+0.0722*b; const roll=Math.min(1,Math.max(0,(d-480)/150)); const sat=o.sat*(1-o.blueRoll*roll*roll);
      r=L+(r-L)*sat; gg=L+(gg-L)*sat; b=L+(b-L)*sat; r=Math.max(0,r); gg=Math.max(0,gg); b=Math.max(0,b);
      r=r/(1+r*0.25); gg=gg/(1+gg*0.25); b=b/(1+b*0.25);
      L=0.2126*r+0.7152*gg+0.0722*b; let t=Math.min(1,Math.max(0,(L-0.6)/0.45)); t=t*t*(3-2*t)*0.85;
      r=r*(1-t)+L*1.02*t; gg=gg*(1-t)+L*0.97*t; b=b*(1-t)+L*0.96*t;
      r=Math.pow(Math.min(1,r),1/2.2); gg=Math.pow(Math.min(1,gg),1/2.2); b=Math.pow(Math.min(1,b),1/2.2);
      /* hue grade in display space (perceptual): compress hues toward the warm and cool anchors */
      if(o.grade>0){ const mx=Math.max(r,gg,b), mn=Math.min(r,gg,b), dl=Math.max(mx-mn,1e-9); let h=(mx===r?((gg-b)/dl+6)%6:mx===gg?(b-r)/dl+2:(r-gg)/dl+4)*60;
        const d1=((h-A1+540)%360)-180, d2=((h-A2+540)%360)-180; const h2=(((Math.abs(d1)<=Math.abs(d2)?A1+d1*(1-o.grade):A2+d2*(1-o.grade))%360)+360)%360;
        const sv=mx>0?dl/mx:0, v=mx, c=v*sv, x=c*(1-Math.abs((h2/60)%2-1)), m=v-c; const hh=Math.floor(h2/60)%6;
        const R=[c,x,0,0,x,c][hh], G=[x,c,c,x,0,0][hh], B=[0,0,x,c,c,x][hh]; r=R+m; gg=G+m; b=B+m; }
      out[d*3]=r; out[d*3+1]=gg; out[d*3+2]=b; }
    return out; };
  /* field: δ (nm), ψ (rad), env (0..1) at normalized x,y (width = 1), time t */
  /* 2-octave value noise in [-1,1] — the same hash as the shader, so the warp matches */
  const hsh=(i,j)=>{ const v=Math.sin(i*127.1+j*311.7)*43758.5453; return v-Math.floor(v); };
  const vn=(x,y)=>{ const i=Math.floor(x), j=Math.floor(y); let fx=x-i, fy=y-j; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy); const a=hsh(i,j),b=hsh(i+1,j),c=hsh(i,j+1),d=hsh(i+1,j+1); return ((a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy)*2-1; };
  C.noise=(x,y)=>vn(x,y)+0.5*vn(x*2.1+5.2,y*2.1+1.7);
  C.field=function(P,x,y,t){
    let delta=0, psi=0, env=1; const cx=P.cx||0.5, cy=P.cy||0.35;
    if(P.wa){ /* domain warp: the sheet is not flat — lanes bend and thicken */ const f=P.wf||2.2, dr=(P.wdrift||0)*t; x+=P.wa*C.noise(x*f+7.3+dr,y*f+1.1); y+=P.wa*C.noise(x*f+3.7,y*f+9.2+dr); }
    if(P.type==='ribbon'){ const ph=TAU*(P.freq*x+P.ph+0.01*t); const yc=cy+P.amp*Math.sin(ph)+(P.tilt||0)*(x-0.5); const dy=P.amp*TAU*P.freq*Math.cos(ph)+(P.tilt||0); const d=(y-yc)/Math.sqrt(1+dy*dy);
      delta=P.d0+P.A*Math.tanh(d/P.period)+40*Math.sin((P.flow||0)*t); psi=Math.atan(dy); env=Math.exp(-(d/P.width)*(d/P.width)*2)*(1-(P.vig||0)*((x-0.5)*(x-0.5)+(y-0.35)*(y-0.35))); }
    else if(P.type==='ring'){ const dx=x-cx, dy=y-cy, r=Math.hypot(dx,dy), th=Math.atan2(dy,dx); const d=r-P.R; delta=P.d0+P.A*Math.tanh(d/P.period)+40*Math.sin((P.flow||0)*t); psi=th+Math.PI/2;
      env=Math.exp(-(d/P.width)*(d/P.width)*2); const s=Math.min(1,Math.max(0,(r-P.R0)/0.03)); env*=s*s*(3-2*s); env*=1-(P.vig||0)*r*r; }
    else if(P.type==='load'){ let sx=P.sx||0, sy=P.sy||0, txy=P.txy||0; for(const L of P.loads){ const dx=x-L[0], dy=y-L[1]; const r=Math.hypot(dx,dy)+0.004; const th=Math.atan2(dy,dx); const a=L[2]*Math.PI/180; const sr=-2*L[3]*Math.cos(th-a)/(Math.PI*Math.pow(r,P.decay||1));
        const c=Math.cos(th), s=Math.sin(th); sx+=sr*c*c; sy+=sr*s*s; txy+=sr*s*c; }
      const ds=Math.sqrt((sx-sy)*(sx-sy)+4*txy*txy); delta=(P.dmin||0)+(P.K||1)*ds; psi=0.5*Math.atan2(2*txy,sx-sy); const dx=x-cx, dy=y-cy, r=Math.hypot(dx,dy); const s=Math.min(1,Math.max(0,r/(P.core||0.02))); env=s*s*(3-2*s)*(1-(P.vig||0)*r*r); }
    else if(P.type==='uniaxial'){ const dx=x-cx, dy=y-cy, r=Math.hypot(dx,dy); delta=P.d0+P.c*r*r; psi=Math.atan2(dy,dx); env=1-(P.vig||0)*r*r; }
    else if(P.type==='biaxial'){ const ax=cx-P.sep/2, bx=cx+P.sep/2; const dax=x-ax, day=y-cy, dbx=x-bx, dby=y-cy; const ra=Math.hypot(dax,day), rb=Math.hypot(dbx,dby); delta=P.d0+P.c*ra*rb; psi=0.5*(Math.atan2(day,dax)+Math.atan2(dby,dbx)); const r=Math.hypot(x-cx,y-cy); env=1-(P.vig||0)*r*r; }
    else { /* sheet: oriented lobes around a focus */ const dx=x-cx, dy=y-cy, r=Math.hypot(dx,dy); const th=Math.atan2(dy,dx)+(P.rot||0)*t; const w=th+P.warp*(Math.sin(3*th+P.s1+0.05*t)/3+Math.sin(5*th+P.s2)/5);
      let osc=Math.cos(P.k*w+(P.ph||0)+(P.flow||0)*t); osc=Math.sign(osc)*Math.pow(Math.abs(osc),osc<0?(P.shapeN!==undefined?P.shapeN:(P.shape||1)):(P.shape||1)); /* shapeN sharpens the dips: the pale lanes are narrower than the red ones */ const d0=P.d0+(P.breath||0)*Math.sin(0.4*t);
      delta=(d0+P.A*osc+(P.rad||0)*r)*(1+(P.pin||0)/(r+0.01)); psi=th+(P.twist||0)*r+(P.spiral||0)*Math.log(r+0.002); const s=Math.min(1,Math.max(0,r/(P.core||0.02))); env=s*s*(3-2*s)*(1-(P.vig||0)*r*r);
      if(P.lobe)env*=P.lobe[0]+P.lobe[1]*(0.5+0.5*Math.sin(th*P.lobe[2]+P.lobe[3]));
      for(const o of (P.occ||[])){ let d=th-o[0]*Math.PI/180; d=Math.abs(Math.atan2(Math.sin(d),Math.cos(d))); const hw=o[1]*Math.PI/180, fe=(o[2]!==undefined?o[2]:o[1]*0.4)*Math.PI/180; let q=(d-(hw-fe))/(2*fe); q=q<0?0:q>1?1:q; env*=q*q*(3-2*q); } }
    return [Math.min(1599,Math.max(0,delta)),psi,Math.max(0,Math.min(1,env*(P.gain||1)))]; };
  /* isoclinic term of a plane polariscope: sin²(m(ψ−β)) with a skew, sharpness, and a mix toward a circular polariscope */
  C.iso=function(P,psi,t){ const beta=(P.beta+(P.spin||0)*t)*Math.PI/180; const pp=psi-beta+(P.skew||0)*Math.sin(psi-beta); let s=Math.sin((P.m||2)*pp); const near=Math.cos(pp)>0; /* nearer the β arm or the β+180 arm — each arm has its own width */ s=Math.pow(s*s,near?(P.sharp||1):(P.sharp2!==undefined?P.sharp2:(P.sharp||1))); return (P.circ||0)+(1-(P.circ||0))*s; };
  return C;
})();
window.STUDY={
  id:'ts-14-deep-space-chroma', code:'TS-14', fig:'1.14',
  title:'Deep Space Chroma · birefringence',
  kicker:'Technique · TS-14',
  lede:'A stressed birefringent sheet between polarizers, integrated over the spectrum.',
  body:[
    'Twenty-one key visuals, one instrument: a polariscope. A birefringent material splits light into two rays with a retardation δ between them; between crossed polarizers each wavelength is transmitted as sin²(πδ/λ), so integrating a tungsten source through the CIE color-matching functions gives the Michel-Lévy sequence — black, grey, warm white, amber, orange, red, mauve, blue, cyan — as a function of δ alone. Where the material’s slow axis lines up with a polarizer the light is cut regardless of δ: those are the isoclinics, the black wedges through every focus.',
    'What varies between plates is only the retardation field and the axis field: an oriented sheet whose δ oscillates around a focus, point loads (Flamant), a uniaxial conoscopic figure (δ ∝ r², a Maltese cross), a biaxial one (δ ∝ |p−A|·|p−B|, hyperbolic isogyres), a ribbon, a ring. The plate look is the camera on top of the physics: partial white balance, a green dip, a teal-and-orange hue compression, a film shoulder that blows the cores to pink-white, a 1.2 % defocus and mono grain. Rotating the polarizer sweeps the isoclinics; breathing δ moves the fringes.'
  ],
  source:'Reference 14 · Deep Space Chroma 09 (ø co. key visual set, 21 plates, 5000 × 3500 each), 1000 × 700',
  spot:[232,143,94], ref:{w:1000,h:700},
  variantLabel:'Field',
  variants:[
    { id:'ref',      label:'Sheet · as reference', sw:['#0E0D0C','#C24A28','#F0A060','#F2DCD0','#8FB6BF'], spot:[232,143,94],
      P:{ type:'sheet', cx:0.47, cy:0.345, k:7, warp:1.0, s1:1.0, s2:3.5, ph:1.0, d0:520, A:200, shape:2, shapeN:3.5, rad:-80, pin:0, twist:0, spiral:0, beta:-90, m:1, skew:0.1, sharp:4, sharp2:1.2, circ:0, core:0.02, vig:0.4, lobe:[0.8,0.2,2.3,0.6], wa:0.1, wf:1.2, wdrift:0.02, spin:2, breath:40, flow:0.15, rot:0.01, blur:0.004, bloom:0.4 } },
    { id:'load',     label:'Point loads · Flamant', sw:['#0E0D0C','#C24A28','#F0A060','#F2DCD0','#8FB6BF'], spot:[232,143,94],
      P:{ type:'load', cx:0.47, cy:0.345, loads:[[0.47,0.345,-95,15],[0.15,0.62,-20,12],[0.88,0.10,160,10]], sx:30, sy:-15, txy:10, K:3, dmin:420, decay:0.4, wa:0.06, wf:1.5, beta:-95, m:2, sharp:1.0, circ:0.15, core:0.02, vig:0.5, spin:3, breath:0 } },
    { id:'uniaxial', label:'Uniaxial conoscope', sw:['#0E0D0C','#C24A28','#F0A060','#F2DCD0','#8FB6BF'], spot:[232,143,94],
      P:{ type:'uniaxial', cx:0.5, cy:0.35, d0:480, c:600, beta:-45, m:2, sharp:1.0, circ:0, vig:1.5, spin:4 } },
    { id:'biaxial',  label:'Biaxial conoscope', sw:['#0E0D0C','#C24A28','#F0A060','#F2DCD0','#8FB6BF'], spot:[232,143,94],
      P:{ type:'biaxial', cx:0.5, cy:0.35, sep:0.3, d0:460, c:1200, beta:-45, m:2, sharp:1.0, circ:0, vig:1.5, spin:4 } },
    { id:'ribbon',   label:'Ribbon', sw:['#0E0D0C','#C24A28','#F0A060','#F2DCD0','#8FB6BF'], spot:[232,143,94],
      P:{ type:'ribbon', cy:0.36, amp:0.13, freq:0.9, ph:0.15, period:0.12, width:0.2, tilt:-0.15, d0:480, A:330, beta:-70, m:1, sharp:0.8, circ:0.5, vig:0.2, flow:0.3 } },
    { id:'ring',     label:'Ring', sw:['#0E0D0C','#C24A28','#F0A060','#F2DCD0','#8FB6BF'], spot:[232,143,94],
      P:{ type:'ring', cx:0.72, cy:0.36, R:0.16, R0:0.06, period:0.08, width:0.16, d0:480, A:330, beta:-45, m:2, sharp:0.7, circ:0.6, vig:0.3, flow:0.3 } }
  ],
  points:[
    {u:0.62,v:0.20,d:'CHRT',label:'Michel-Lévy chart · color(δ) = ∫ S(λ) sin²(πδ/λ) x̄ȳz̄(λ) dλ, tungsten 3000 K',t:'michel-levy-chart',dir:[1,-1]},
    {u:0.80,v:0.40,d:'RETD',label:'Retardation · δ = 520 + 200·osc(7θ) − 80r nm; red is δ ≈ 430–560, pink-white ≈ 320, steel blue ≈ 640',t:'retardation-field',dir:[1,1]},
    {u:0.46,v:0.08,d:'ISOC',label:'Isoclinic · slow axis ∥ polarizer at β = −90°: sin²(ψ − β)^4 → 0, the wide black wedge',t:'isoclinic',dir:[1,1]},
    {u:0.50,v:0.92,d:'ISOC',label:'Second arm · β + 180°, its own width (^1.2) and a .1·sin(ψ − β) skew: the arms are not mirror images',t:'isoclinic',dir:[-1,-1]},
    {u:0.22,v:0.42,d:'WARP',label:'Warp · the sheet is domain-warped by value noise (.1 W at 1.2 cycles) and θ by 1.0·(sin 3θ/3 + sin 5θ/5): lanes bend and thicken',t:'axis-field',dir:[-1,-1]},
    {u:0.47,v:0.345,d:'PNCH',label:'Pinch · envelope → 0 inside r < .02 W; the load point is opaque',t:'envelope',dir:[1,-1]},
    {u:0.30,v:0.62,d:'GRDE',label:'Grade · hues compressed .75 toward 6° and 196° in display space; blue end desaturated .85; highlight bloom .4 at σ 5 % W',t:'plate-look',dir:[-1,1]},
    {u:0.10,v:0.85,d:'BLUR',label:'Defocus · gaussian σ = .4 % of width after the chart, so lanes bleed',t:'soft-focus',dir:[1,-1]},
    {u:0.70,v:0.90,d:'GRN', label:'Grain · mono, 2 %, 1 px cells; channels correlate .95 in the source',t:'film-grain',dir:[-1,-1]},
    {u:0.90,v:0.62,d:'MOTN',label:'Motion · polarizer spins 2°/s (wedges sweep), δ0 breathes ±40 nm, lanes flow .15 rad/s (M)',t:'polariscope-motion',dir:[-1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1000,700], grammar:'photoelastic fringes: a retardation field seen through a plane polariscope with a warm source; isoclinic wedges through the focus; soft focus; mono grain', set:'21 plates, 5000 × 3500, ø co. “Deep Space Chroma” key visuals' },
    units:'normalized by width: x ∈ [0,1], y ∈ [0, H/W]; δ in nm; angles in degrees, screen space (y down)',
    physics:{ transmission:'I(λ) = S(λ) · sin²(2(ψ − β)) · sin²(π δ / λ) for a crossed plane polariscope; the first sin² is the isoclinic term (achromatic), the second the isochromatic term (chromatic)', stress_optic:'δ = C · t · (σ1 − σ2) — retardation is proportional to the principal stress difference', color:'XYZ = ∫ I(λ) [x̄ ȳ z̄](λ) dλ over 380–720 nm at 4 nm; XYZ → linear sRGB', chart:'the Michel-Lévy chart is color(δ) for δ = 0…1600 nm; it is computed at load, not hand-drawn' },
    palette:{ derived:'from the chart — nothing is hand-picked', floor:'#0E0D0C', anchors:{ warm:'18°', cool:'196°' } },
    techniques:[
      { id:'michel-levy-chart', short:'CHRT', name:'Spectral Michel-Lévy chart', layer:0, pass:1, atoms:['spectrum','planck','cmf','lut'],
        params:{ source:'Planck 3000 K, green dip .1 at 548 ± 48 nm', integration:'380–720 nm, 4 nm steps, Wyman–Sloan–Shirley CMF fit', white_balance:'von Kries toward D65, strength .6', exposure:0.8, N:1600 },
        implementation:'For every δ from 0 to 1599 nm the transmitted spectrum sin²(πδ/λ)·S(λ) is integrated against the color-matching functions; the 1600 colors are the LUT the field is shaded with. Order 1 (0–560 nm) is where the plates live: black → grey → warm white → amber → orange → red; the mauve and blue of 560–700 are the cool lanes.' },
      { id:'retardation-field', short:'RETD', name:'Retardation field', layer:0, pass:0, atoms:['field','retardation','oscillation'],
        params:{ sheet:'δ = (d0 + A · sign(c)|c|^shape) · (1 + pin/r), c = cos(k · θw + ph + flow · t); shape for the peaks (blue), shapeN for the dips (pale) — the pale lanes are the narrow ones', ref:{ d0:520, A:200, shape:2, shapeN:3.5, k:7, ph:1.0, rad:-80, pin:0 }, radial:'+ rad · r — orange near the focus, red far out', load:'δ = K · |σ1 − σ2| from Σ Flamant point loads (σr = −2F cos(θ−α)/(π r^decay)) + a uniform stress', uniaxial:'δ = d0 + c · r²', biaxial:'δ = d0 + c · |p − A| · |p − B| (Cassini ovals)', ribbon:'δ = d0 + A · tanh(d / period) — a ramp across the ribbon: white, orange, red, blue in order', ring:'δ = d0 + A · tanh((r − R) / period)' },
        implementation:'Each family is one expression for δ. The sheet keeps δ in the orange-red most of the time (shape 2.4 dwells near d0) and dips to white or peaks to blue briefly; the load family is real plane-stress mechanics; the conoscopes are the textbook interference figures.' },
      { id:'axis-field', short:'WARP', name:'Slow-axis field ψ', layer:0, pass:0, atoms:['direction','principal-axis','warp'],
        params:{ domain_warp:'(x, y) += wa · noise2((x, y) · wf), 2-octave value noise, wa .1 W, wf 1.2; the same hash in JS and GLSL', sheet:'ψ = θw + twist · r + spiral · ln r', load:'ψ = ½ · atan2(2τ, σx − σy) (principal direction)', uniaxial:'ψ = θ', biaxial:'ψ = ½(θA + θB)', ribbon:'ψ = tangent', ring:'ψ = θ + 90°', warp:'θw = θ + 1.0 · (sin(3θ + 1.0)/3 + sin(5θ + 3.5)/5)' },
        implementation:'ψ decides where the isoclinics fall. The domain warp bends the sheet — the plates are not flat starbursts — and warping θ makes lanes of unequal width; neither breaks the physics because δ and ψ are still evaluated from one coordinate.' },
      { id:'isoclinic', short:'ISOC', name:'Isoclinics', layer:1, pass:2, atoms:['polarizer','extinction','wedge'],
        params:{ term:'sin²(m · (ψ − β + skew · sin(ψ − β)))^sharp, sharp for the β arm and sharp2 for the β + 180° arm', ref:{ m:1, beta:-90, skew:0.1, sharp:4, sharp2:1.2 }, circular:'circ mixes toward 1 (a circular polariscope removes isoclinics)', note:'m = 2 is the physical crossed-polar cross (four arms); the plates read as two arms, m = 1, one polarizer effective' },
        implementation:'Multiplies the whole image; the black wedges are not masks but extinction where the material axis is parallel to the polarizer. Spinning β sweeps them around the focus.' },
      { id:'envelope', short:'PNCH', name:'Envelope', layer:1, pass:2, atoms:['envelope','vignette','floor'],
        params:{ pinch:'smoothstep(0, core, r), core .02', vignette:'1 − .4 r²', lobe_gain:'.8 + .2 · sin(2.3θ + .6)', floor:[14,13,12], occluders:'optional manual wedges (plate 16’s rectangle)' },
        implementation:'mix(floor, chart(δ) · iso, env): the load point is opaque, the far field sinks, nothing reaches 0.' },
      { id:'plate-look', short:'GRDE', name:'Plate look (camera + grade)', layer:2, pass:3, atoms:['white-balance','hue-compression','shoulder'],
        params:{ hue_grade:'after gamma, hues pulled .75 of the way toward 6° (warm) or 196° (cool), whichever is nearer; saturation × 1.4 first', bloom:'highlights (brightness .8, contrast 2.5 → a threshold near L .4) blurred at σ .05 W and added at .4 — the glow along the hot edges', blue_roll:'saturation × (1 − .85 · ((δ − 480)/150)²) for δ > 480', shoulder:'x/(1 + .25x), then highlights above L .6 desaturate .85 toward a pink-white', measured:'plates carry no yellow, no green, no magenta — the grade explains the absence; band means: (235,182,147) (232,143,94) (225,95,57) (185,53,40) red side, (165,196,199) (120,154,165) (79,105,116) blue side, white (222,190,184)' },
        implementation:'Applied to the chart once (1600 entries), so per-pixel cost is a lookup; this is the step that turns a textbook chart into the plate palette.' },
      { id:'soft-focus', short:'BLUR', name:'Post defocus', layer:3, pass:4, atoms:['blur','gaussian'],
        params:{ sigma:'0.004 · W', measured:'p99 horizontal gradient 12/255 per px at 1600 px' },
        implementation:'One gaussian over the finished color image; blurring after the chart is what mixes neighboring lanes into the grey-mauve transitions.' },
      { id:'film-grain', short:'GRN', name:'Mono grain', layer:4, pass:5, atoms:['grain','noise'],
        params:{ amp:0.02, pitch_px:'1 at 1600 px', mono:true, measured:'black-region std 5.3/255; R/G/B high-pass correlation .96 / .95' },
        implementation:'Multiplicative hashed noise, identical across channels.' },
      { id:'polariscope-motion', short:'MOTN', name:'Polariscope motion', layer:5, pass:6, atoms:['rotation','breath','flow'],
        params:{ spin:'β += 2°/s (isoclinics sweep)', breath:'d0 += 40 · sin(.4 t) nm (fringes move)', flow:'lobe phase += .15 t', rot:'θ += .01 t' },
        implementation:'Every motion is a physical control of the instrument: rotate the polarizer, load the sheet, turn the sheet.' }
    ],
    pass_order:['chart · integrate the spectrum once → color(δ)','warp · (x,y) += wa · noise2','field · δ(x,y) and ψ(x,y) for the family','isoclinic · sin²(m(ψ − β))^sharp','envelope · pinch × vignette × lobe gain, mix from the floor','defocus · gaussian σ .004 W','bloom · thresholded highlights, σ .05 W, add .4','grain · mono ×(1 + .02 n)'],
    notes:['The chart parameters were tuned by eye against the 21 plates; the field parameters against plate 09 (focus (0.47, 0.345 W), a wide isoclinic arm straight up and a narrower one straight down).','Motion is CPU on a 400 px work canvas in the plate; engine.html is the GPU version.','engine.html carries a first-pass preset for every plate (by eye) — refine with the sliders, Copy JSON.']
  },

  _chart(){ if(!this._L)this._L=window.CHROMA.chart(); return this._L; },
  _paint(work,V,t,pad){ pad=pad||0; const L=this._chart(); const P=V.P; const fl=V.floor||[14,13,12]; const C=window.CHROMA; const w=work.width,h=work.height; const we=w-2*pad; const x2=work.getContext('2d',{willReadFrequently:true}); const id=x2.createImageData(w,h); const d=id.data;
    for(let j=0;j<h;j++){ const y=(j+0.5-pad)/we; for(let i=0;i<w;i++){ const x=(i+0.5-pad)/we; const f=C.field(P,x,y,t); const e=f[2]*C.iso(P,f[1],t); const k=(f[0]|0)*3; const o=(j*w+i)*4;
        d[o]=fl[0]+(L[k]*255-fl[0])*e; d[o+1]=fl[1]+(L[k+1]*255-fl[1])*e; d[o+2]=fl[2]+(L[k+2]*255-fl[2])*e; d[o+3]=255; } }
    x2.putImageData(id,0,0); },
  _frame(ctx,W,H,V,t,scale,grainSeed){ const A=window.ART; const ww=Math.max(32,Math.round(W*scale)), hh=Math.max(32,Math.round(H*scale)); const pw=Math.ceil(0.03*ww); const work=A.off(ww+2*pw,hh+2*pw); this._paint(work,V,t,pw); const PW=pw/scale;
    ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctx.filter=`blur(${((V.P.blur!==undefined?V.P.blur:0.004)*W).toFixed(1)}px)`; ctx.drawImage(work,-PW,-PW,W+2*PW,H+2*PW); ctx.filter='none';
    const bl=(V.P.bloom!==undefined?V.P.bloom:0.35); if(bl>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=bl; ctx.filter=`blur(${(0.05*W).toFixed(1)}px) brightness(0.8) contrast(2.5)`; ctx.drawImage(work,-PW,-PW,W+2*PW,H+2*PW); ctx.restore(); ctx.filter='none'; }
    A.grain(ctx,{amp:0.02,pitch:Math.max(1,Math.round(W/1000)),seed:grainSeed||14,mono:true}); },
  render(canvas,w,h,dpr,V,done){ const x=canvas.getContext('2d',{willReadFrequently:true}); this._frame(x,canvas.width,canvas.height,V,0,1,14); done&&done(); return false; },
  motion(canvas,w,h,dpr,V,t,ctx){ const W=canvas.width,H=canvas.height; this._frame(ctx,W,H,V,t,Math.min(1,400/W),14+((t*8)|0)); },
  live(V){ return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#0e0d0c;overflow:hidden}iframe{border:0;width:100%;height:100%;display:block}</style></head><body><iframe src="engine.html?preset=${encodeURIComponent(V.id)}&embed=1" title="Deep Space Chroma engine"></iframe></body></html>`; }
};
