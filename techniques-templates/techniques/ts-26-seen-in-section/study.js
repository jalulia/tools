window.STUDY={
  id:'ts-26-seen-in-section', code:'TS-26', fig:'1.26',
  title:'Seen in section',
  kicker:'Technique · TS-26',
  lede:'A riverbank in section: water, gravel, soil, roots and a garden.',
  body:['One ground line runs through the section: a riverbed at 402 u, a bank face at 48°, a crest at 286 u and an upland that rises 72 u to the right edge. Water fills every column below its level. Two gravel beds lie over a clay floor at 515 u: the riverbed, which wedges up under the bank and pinches out at x 634, and a deep bed 455 u down under the garden, dipping parallel to the wedge base.',
    'Roots grow from five crowns in 2.2 u steps, bend toward the gravel and branch through four generations; at 60 % they stop where the deck’s roots stop, and at 100 % every main tip lands on the gravel top. Grass, irises and trees stand only on soil above the water.'],
  motionHint:'Play moves the wave strokes slowly downstream.',
  source:'Reference 26 · Mindgut deck, a riverbank in section, gouache, 972 × 376, framed at 972 × 540',
  spot:[12,106,223], ref:{w:972,h:540},
  variantLabel:'Inks',
  variants:[
    { id:'ref', label:'Riverbank', sw:['#0C6ADF','#B3C5D7','#9B7C56','#55A33A','#A592DE'], spot:[12,106,223],
      paper:'#FBFBF7', ink:'#151B17',
      hillNear:'#67B66C', hillNearLow:'#A6D8BC', hillFar:'#83C4B6', hillFarLow:'#C2E4DC', hillLight:'#C6E27E',
      water:'#0B6AE0', waterDeep:'#1552C2', waterHi:'#F2F7FF', waterMid:'#5C9DF1',
      gravel:'#B9CADB', gravelLight:'#F1F5F9', gravelDark:'#7F94AD',
      soil:'#9B7C56', soilDark:'#674F34', speck:'#E6D9BC', clay:'#5F564D', clayLight:'#7A7066',
      root:'#DFC796', rootEdge:'#86663D',
      grass:'#4E9E37', grassDark:'#2A6829', grassLight:'#8CCB3B', grassTip:'#CFE55C',
      iris:'#A08ADC', irisDark:'#62509F', bloom:'#F7F4FB', yellow:'#F2D23A',
      tree:'#4E9E43', treeDark:'#24632C', treeLight:'#A9D96A', trunk:'#5A4230',
      line:'#151B17', lineWater:'#183586' },
    { id:'mg', label:'Mindgut', sw:['#183586','#126B3D','#0A4528','#D0EC60','#FBFBF7'], spot:[24,53,134],
      paper:'#FBFBF7', ink:'#151B17',
      hillNear:'#5A9672', hillNearLow:'#B3CFBC', hillFar:'#8FB3A6', hillFarLow:'#CFE0D8', hillLight:'#B5D394',
      water:'#183586', waterDeep:'#0F2766', waterHi:'#E4EAF8', waterMid:'#4D67B6',
      gravel:'#C1CAD5', gravelLight:'#F2F4F7', gravelDark:'#7E8A9A',
      soil:'#857158', soilDark:'#55463A', speck:'#E2D9C6', clay:'#4C4740', clayLight:'#645E56',
      root:'#E6DDAE', rootEdge:'#6E5E40',
      grass:'#126B3D', grassDark:'#0A4528', grassLight:'#3E9150', grassTip:'#D0EC60',
      iris:'#8F98D8', irisDark:'#183586', bloom:'#FBFBF7', yellow:'#D0EC60',
      tree:'#126B3D', treeDark:'#0A4528', treeLight:'#86BE5C', trunk:'#3B3229',
      line:'#151B17', lineWater:'#183586' },
    { id:'io', label:'Ø', sw:['#2F5AE6','#F4551E','#101014','#FFFFFF'], spot:[244,85,30],
      paper:'#FFFFFF', ink:'#101014',
      hillNear:'#9FB2F3', hillNearLow:'#D6DEFB', hillFar:'#C0CCF7', hillFarLow:'#E7ECFD', hillLight:'#E8EDFE',
      water:'#2448C8', waterDeep:'#1A3494', waterHi:'#FFFFFF', waterMid:'#6F8BEF',
      gravel:'#DADAE0', gravelLight:'#FFFFFF', gravelDark:'#8E8E97',
      soil:'#3E3E48', soilDark:'#26262E', speck:'#C8C8CE', clay:'#6C6C75', clayLight:'#86868F',
      root:'#F4551E', rootEdge:'#101014',
      grass:'#3D66EA', grassDark:'#1F3DAE', grassLight:'#7E98F2', grassTip:'#C3CFF9',
      iris:'#F4551E', irisDark:'#B93A0E', bloom:'#FFFFFF', yellow:'#F4551E',
      tree:'#3359E2', treeDark:'#1D3AA6', treeLight:'#9BB0F5', trunk:'#101014',
      line:'#101014', lineWater:'#2F5AE6' }
  ],
  points:[
    {u:0.30,v:0.16,d:'SKY',label:'Sky · Paper #FBFBF7 by day, left blank',t:'section-ground',dir:[1,-1]},
    {u:0.20,v:0.624,d:'WAVE',label:'Wave strokes · 12 per 10 000 u², longer with depth',t:'river-view',dir:[-1,1]},
    {u:0.453,v:0.581,d:'BANK',label:'Bank face · 48° from the riverbed to the crest',t:'bank-profile',dir:[-1,-1]},
    {u:0.12,v:0.73,d:'BED',label:'Riverbed · gravel at the surface under the water',t:'gravel-body',dir:[-1,1]},
    {u:0.52,v:0.622,d:'GRVL',label:'Gravel wedge · base dips 0.28, pinching out at x 634',t:'gravel-body',dir:[1,1]},
    {u:0.30,v:0.963,d:'CLAY',label:'Clay floor · 515 u down, laminated; gravel rests on it',t:'gravel-body',dir:[-1,1]},
    {u:0.82,v:0.789,d:'SOIL',label:'Soil · 4 specks per 1000 u², pale and dark',t:'soil-grain',dir:[1,1]},
    {u:0.865,v:0.657,d:'ROOT',label:'Root tip · 60 % of the way to the gravel; four generations',t:'root-growth',dir:[1,1]},
    {u:0.613,v:0.376,d:'IRIS',label:'Irises · among 18 flowers, on soil above the water',t:'bank-garden',dir:[-1,-1]},
    {u:0.866,v:0.253,d:'TREE',label:'Tree · forked trunk under 12 lit lobes, crown 53 u',t:'bank-garden',dir:[1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[972,540], grammar:'cross-section in gouache: white sky, far hills on the waterline, deep-blue water with white wave strokes over a pale gravel riverbed that wedges up under the bank; brown speckled soil with pale branching roots; a turf bank with irises, small flowers and round trees' },
    units:'design units, 1000 = plate width; the plate is 1000 × 556',
    palette:{ paper:'#FBFBF7', water:'#0B6AE0', water_deep:'#1552C2', gravel:'#B9CADB', soil:'#9B7C56', root:'#DFC796', grass:'#4E9E37', iris:'#A08ADC', tree:'#43923F' },
    techniques:[
      { id:'section-ground', short:'SKY', name:'Rendering and sky', layer:0, pass:0, atoms:['ground','rendering','grain'],
        params:{ rendering:{ value:1, options:[{v:1,label:'Gouache'},{v:2,label:'Line section'}], label:'Rendering', note:'Painted section, or a technical section with hatching and hairlines' },
          sky:{ value:1, options:[{v:1,label:'Day'},{v:2,label:'Night'}], label:'Sky', note:'Day leaves the sky blank Paper as in the deck; Night turns it to Ink' },
          grain_amp:0.03, grain_seed:26 },
        limits:'At night the hills, the water and the garden darken toward night blue while the cut face stays lit, so the section still reads. The gouache grain is fixed at 3 % mono; above ~4 % it shows as dirt on the flat sky. The line section has no grain.',
        implementation:'The ground is one flat color behind everything. Gouache paints each region per pixel and adds a 3 % one-pixel grain; at night it mixes the hills (66 %), the water (42 %), the trees (45 %) and the grass (52 %) toward night blue. The line section draws contacts, hatching and symbols as hairlines on the same geometry, light on the night sky.' },
      { id:'bank-profile', short:'BANK', name:'Ground line', layer:1, pass:1, atoms:['profile','section','smooth-min'],
        params:{ slope_deg:{ value:48, range:[22,72], unit:'°', label:'Bank slope', note:'Angle of the bank face from the riverbed up to the crest' },
          crest_u:[480,286], bed_u:402, bed_rise:0.00019, upland_rise_u:72, toe_round_u:18, crest_round_u:14,
          profile:'S(x) = smin(riverbed, smax(face, upland)); face = crest_y + (crest_x − x)·tan(slope)' },
        limits:'Below ~22° the face runs under half the river and the toe leaves the plate’s left third; above ~72° the bank reads as a wall and the toe fillet folds.',
        implementation:'The riverbed, the bank face and the upland are three curves joined by a smooth minimum at the toe and a smooth maximum at the crest, so the section has one continuous ground line with rounded corners.' },
      { id:'river-view', short:'WAVE', name:'Water and far hills', layer:1, pass:2, atoms:['water','stroke','haze'],
        params:{ water_u:{ value:102, range:[40,108], unit:'u', label:'Water level', note:'Height of the water surface above the riverbed' },
          strokes:{ value:12, range:[1.5,40], unit:'/10k u²', label:'Wave strokes', note:'White strokes on the water, per 10 000 u² of water' },
          horizon_u:300, ridge_seed:31, ridges:[{tone:0,peaks:[[318,36,62],[236,24,46],[392,15,34]]},{tone:0.55,peaks:[[105,50,70],[22,24,48]]},{tone:0.8,peaks:[[182,34,78],[40,12,40],[296,7,40]]},{tone:1,peaks:[[430,40,46],[372,12,30]]}], stroke_seed:7, drift_u_s:[2.2,4.8] },
        limits:'Above 108 u the water would reach the bank crest; under ~40 u the river is a shallow strip over the gravel. Above ~40 strokes per 10 000 u² the water turns white-on-blue and loses its depth.',
        implementation:'Water fills every column whose ground lies below the level, from the left edge to the shoreline. Strokes are arched, tapered dashes placed uniformly in the water; deeper strokes are longer and thicker. The far hills are four ridges drawn back to front, teal far to green near, each with a fractal crest, light on the flanks that face the upper left, fine dabbed flecks and haze toward the waterline; they stand on the waterline at any level.' },
      { id:'gravel-body', short:'GRVL', name:'Gravel beds and clay floor', layer:2, pass:3, atoms:['bed','contact','pinch-out','worley'],
        params:{ depth_u:{ value:46, range:[16,96], unit:'u', label:'Gravel bed depth', note:'Thickness of both gravel beds: the riverbed wedge and the bed under the garden' },
          contact_x_u:[330,560], peak_u:316, base_u:{ at:[339,421], slope:0.28, per_depth:0.6, floor:[472,0.45], floor_round:40 }, deep_u:[455,0.62], deep_dip:0.28, deep_dip_from_u:640, clay_u:515, pebble_u:3.6, seed:61,
          wedge:'top = max(ground, contact), the contact rising from the riverbed to 316 u at x 560; base = 421 + 0.6 · (depth − 46) − 0.28 · (x − 339), levelling under the river at 472 + 0.45 · (depth − 46) u through a 40 u smooth minimum; the wedge pinches out where its base meets the contact',
          deep_bed:'top = 455 − 0.62 · (depth − 46) u under the garden, dipping 0.28 to the left of x 640, parallel to the wedge base, so the soil between them keeps one thickness',
          clay:'floor at 515 u; it cuts any gravel below it' },
        limits:'Under ~16 u the riverbed is a skin 9 u thick at the steepest toe and the wedge pinches out at x ≈ 600. Above ~96 u the soil under the river thins to 20 u over the clay and the soil between the two beds to 54 u.',
        implementation:'Two gravel beds over a clay floor. The riverbed gravel wedges up under the bank and pinches out where its base meets the contact; the deep bed runs under the garden and dips left parallel to the wedge base, so the soil between them never tapers into a tongue. Depth thickens both, moves the wedge tip right and raises the deep bed toward the roots. Pebbles are elliptical Worley cells lit from the upper left; the clay is laminated.' },
      { id:'soil-grain', short:'SOIL', name:'Soil grain', layer:2, pass:4, atoms:['speck','stipple','mottle'],
        params:{ specks:{ value:4, range:[0.6,24], unit:'/1000 u²', label:'Soil grain', note:'Pale and dark specks in the soil, per 1000 u²' },
          size_u:[0.45,1.25], pale_share:0.66, seed:19 },
        limits:'Under ~0.6 per 1000 u² the soil reads as flat paint; above ~24 the specks touch and the soil turns to sand.',
        implementation:'One speck per jittered cell, its size and its pale or dark ink drawn from a hash of the cell, over a two-scale mottle; nothing repeats.' },
      { id:'root-growth', short:'ROOT', name:'Root growth', layer:3, pass:5, atoms:['branching','tropism','taper'],
        params:{ depth_pct:{ value:60, range:[20,100], unit:'%', label:'Root depth', note:'How far the roots reach toward the gravel; at 100 % the tips touch it' },
          generations:{ value:4, range:[2,5], step:1, label:'Root branching', note:'Generations of roots, from the main root to the finest forks' },
          habit:{ value:3, options:[{v:1,label:'Taproot'},{v:2,label:'Fibrous'},{v:3,label:'Mixed'}], label:'Root habit', note:'One deep main root, a fan of fine roots, or a main root with crown roots' },
          crowns_u:[612,655,728,856,944], step_u:2.2, fork_rate:[0.15,0.12,0.1,0.08], child_width:0.6, steps_per_crown:2600, trop_main:0.16, trop_lateral:0.009, wander_main:0.13, wander_lateral:0.17, min_soil_u:7, seed:4 },
        limits:'Five generations is the most that still reads as separate roots at plate size; one generation is a bare stick, so the range starts at two. Under ~20 % depth the system is only the crown.',
        implementation:'Each root walks in 2.2 u steps, turning toward straight down and wandering; it forks at a per-generation rate into children 0.62 × its width. It stops on the envelope ground + depth × (gravel top − ground), never above the soil line, never in the gravel and never under water.' },
      { id:'bank-garden', short:'GRDN', name:'Garden on the bank', layer:4, pass:6, atoms:['blade','flower','canopy'],
        params:{ grass_u:{ value:58, range:[14,72], unit:'u', label:'Grass height', note:'Height of the tallest blades above the soil line' },
          flowers:{ value:18, range:[0,48], step:1, scale:'sqrt', label:'Flowers', note:'Irises and small blooms along the bank' },
          trees:{ value:3, range:[0,3], step:1, label:'Trees', note:'Round trees on the upland, largest first' },
          tree_sites_u:[[768,41],[866,53],[958,34]], mat_share:0.48, blades_per_u:14, seed:12 },
        limits:'Above ~72 u the grass hides the irises and lifts the canopies off the plate top. Grass, flowers and trees stand only where soil is at the surface and above the water.',
        implementation:'A turf mat follows the soil line; blades grow from it along the surface normal and lean up. Flowers take fixed slots along the dry bank so the count adds or removes without reshuffling. Each tree stands on the soil line: a trunk forks into three branches under a crown of 10 to 15 seeded lobes, each lobe dabbed and lit from its upper left; a tree that would cross the plate edge moves inside it.' }
    ],
    pass_order:['sky · flat Paper by day, Ink at night','far hills · four ridges back to front on the waterline: crest light, flecks, haze toward the water','water · level fill, depth gradient, horizontal brush streaks','section · clay floor, gravel beds and soil per pixel; specks, pebbles, laminae','roots · grown, edge then fill','garden · turf mat, trees, back blades, flowers, front blades','strokes · wave dashes over the water (moving in Play)','finish · 3 % mono grain'],
    notes:['ref.png is the deck image (972 × 376) placed 49 px down in a 972 × 540 frame, so its geometry lines up with the plate; the clay floor and the deep bed below 437 u are not in the deck image.','Measured on the deck image (972 × 376), then moved 50 u down: water surface y 243 px (250 u); riverbed 338–348 px at the left (≈ 352 u); bank toe ≈ (387, 300) px; shoreline x 437 px; soil line 238 px at x 490 and 168 px at x 900; gravel wedge top 258 px at x 530, its base 305 px; canopies at x 745, 840, 935 px with radii ≈ 40, 52, 33 px; five root crowns at x ≈ 600, 634, 706, 832, 916 px.',
      'Colors sampled from region means: water #1069DE, gravel #ABC0D3, soil #9D7E57, grass #63A841, root #B2986A. The sky is kept Paper, not the deck’s warm tone.',
      'Seeds are fixed; the structure moves only with the parameters.']
  },
  techniques:{
    'section-ground': (P,u,A,V)=>{ const dark=P.sky===2; const gnd=dark?V.ink:V.paper; const line=dark?V.paper:V.line; const lw=A.mix(A.hex(V.lineWater),A.hex(dark?V.paper:V.lineWater),dark?0.55:0);
      return { line:P.rendering===2, dark, ground:gnd, ink:line, inkWater:A.rgb(lw),
        /* one-pixel mono grain from a running xorshift: every pixel its own value, nothing tiles */
        finish:ctx=>{ if(P.rendering===2||!(P.grain_amp>0))return; const c=ctx.canvas, id=ctx.getImageData(0,0,c.width,c.height), d=id.data; let s=(P.grain_seed*2654435761)|0||1; const amp=P.grain_amp*2;
          for(let i=0;i<d.length;i+=4){ if(d[i+3]===0)continue; s^=s<<13; s^=s>>>17; s^=s<<5; const m=1+amp*((s>>>0)/4294967296-0.5); d[i]*=m; d[i+1]*=m; d[i+2]*=m; } ctx.putImageData(id,0,0); } }; },
    'bank-profile': (P,u,A)=>{ const tn=Math.tan(P.slope_deg*Math.PI/180), xc=P.crest_u[0], yc=P.crest_u[1], bed=P.bed_u, rise=P.upland_rise_u, kt=P.toe_round_u, kc=P.crest_round_u;
      const smin=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.min(a,b)-h*h*k*0.25; };
      const bedY=x=>{ const q=Math.min(x,520); return bed-P.bed_rise*q*q+1.4*Math.sin(x/37+0.7)+0.9*Math.sin(x/13.3+2.1); };
      const faceY=x=>yc+(xc-x)*tn;
      const upY=x=>{ if(x<=xc)return yc; const t=Math.min(1,(x-xc)/(1000-xc)); return yc-rise*t*t*(3-2*t); };
      const S=x=>smin(bedY(x),-smin(-faceY(x),-upY(x),kc),kt);
      let a=0,b=xc; for(let i=0;i<40;i++){ const m=(a+b)/2; if(faceY(m)>bedY(m))a=m; else b=m; }
      return { S, bedY, faceY, crest:[xc,yc], bed, toe:(a+b)/2, slope:P.slope_deg }; },
    'river-view': (P,u,A)=>{ const g=(x,c,w)=>{ const d=(x-c)/w; return Math.exp(-d*d); }; const H0=P.horizon_u;
      /* far hills: ridges back to front, each a sum of gaussian peaks with a fractal crest; tone 0 = far (teal), 1 = near (green) */
      const fb=A.perlin(P.ridge_seed);
      const hs=rd=>x=>{ let h=0; for(const [c,a,w] of rd.peaks)h+=a*g(x,c,w); return h; };
      const ridge=(rd,k)=>{ const h0=hs(rd); return x=>{ const h=h0(x), j=(2.6*fb.fbm(x/15+k*7.3,k*3.1+0.5,3)+1.0*fb(x/4.2+k*11.1,k*5.7+0.3))*Math.min(1,h/12); return H0-Math.max(0,h+j); }; };
      const ridges=P.ridges.map((rd,k)=>{ const h0=hs(rd); return { y:ridge(rd,k), lit:x=>Math.max(0,Math.min(1,0.5+1.5*(h0(x+6)-h0(x-6))/12)), tone:rd.tone }; });
      return { ridges, H0, level:(bed,crestLow)=>Math.max(bed-P.water_u,crestLow+3),
        /* strokes(G): arched dashes in the water, in u. G: { S, yw, xs, bedMax } */
        strokes:G=>{ const r=A.rng(P.stroke_seed); let area=0; for(let x=0;x<G.xs;x+=2)area+=Math.max(0,G.S(x)-G.yw)*2; const n=Math.round(P.strokes*area/10000); const out=[];
          for(let i=0;i<n;i++){ let x=0,y=0,ok=false; for(let k=0;k<30&&!ok;k++){ x=r()*G.xs; y=G.yw+1.2+r()*(G.bedMax-G.yw); ok=y<G.S(x)-1.5; } if(!ok)continue;
            const f=Math.min(1,(y-G.yw)/Math.max(8,G.bedMax-G.yw)); const len=(12+30*f)*(0.55+0.9*r()), th=(1.2+1.7*f)*(0.75+0.5*r()), arch=(r()-0.25)*th*1.3;
            let xr=x; while(xr<G.xs&&G.S(xr)>y+th)xr+=1;
            out.push({ x, y, len, th, arch, hi:r()<0.8, ph:r()*6.2832, v:A.lerp(P.drift_u_s[0],P.drift_u_s[1],1-f)*(0.75+0.5*r()), xr }); }
          return out; } }; },
    'gravel-body': (P,u,A)=>{ const [x0,xp]=P.contact_x_u, pk=P.peak_u; const ss=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
      const wob=x=>2.2*Math.sin(x/29+1.3)+1.3*Math.sin(x/11.7+0.4), wob2=x=>2.6*Math.sin(x/41+0.2)+1.4*Math.sin(x/15.3+2.2);
      const wob3=x=>1.8*Math.sin(x/53+0.9)+1.1*Math.sin(x/19.7+1.7);
      /* wedge top: the contact rises from the riverbed to the peak; wedge base: a straight dipping line; deep bed parallel to it; clay floor */
      const C=(x,bedY)=>x<=xp?bedY(x)+(pk+wob(x)-bedY(x))*ss(x0,xp,x):pk+wob(x)+(x-xp)*0.35;
      const dd=P.depth_u-46, Bs=P.base_u;
      const smin=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.min(a,b)-h*h*k*0.25; };
      const Lb=x=>smin(Bs.at[1]+Bs.per_depth*dd-Bs.slope*(x-Bs.at[0]),Bs.floor[0]+Bs.floor[1]*dd,Bs.floor_round);
      const D=x=>P.deep_u[0]-P.deep_u[1]*dd+wob2(x)+P.deep_dip*Math.max(0,P.deep_dip_from_u-x);
      const K=x=>P.clay_u+wob3(x);
      const c=P.pebble_u, cy=c*0.78, seed=P.seed|0;
      const hs=(i,j,k)=>{ let n=(i*374761393+j*668265263+k*1274126177+seed*2246822519)|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296; };
      /* one pebble per jittered cell, held in a table: center, inverse radii, tone */
      const nx=Math.ceil(1000/c)+5, ny=Math.ceil(620/cy)+5, tab=new Float32Array(nx*ny*5);
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const I=i-2, J=j-2, o=(j*nx+i)*5, s=0.62+0.5*hs(I,J,3); tab[o]=(I+0.1+0.8*hs(I,J,1))*c; tab[o+1]=(J+0.1+0.8*hs(I,J,2))*cy; tab[o+2]=1/(c*0.66*s); tab[o+3]=1/(cy*0.62*s); tab[o+4]=hs(I,J,4); }
      /* pebble(x,y) → [tone 0..1, coverage 0..1, light −1..1] at a point in u */
      const out=[0,0,0];
      const pebble=(x,y)=>{ const ci=Math.floor(x/c)+2, cj=Math.floor(y/cy)+2; let d1=9,tone=0,lx=0,ly=0;
        for(let j=cj-1;j<=cj+1;j++){ if(j<0||j>=ny)continue; for(let i=ci-1;i<=ci+1;i++){ if(i<0||i>=nx)continue; const o=(j*nx+i)*5, dx=(x-tab[o])*tab[o+2], dy=(y-tab[o+1])*tab[o+3], d=dx*dx+dy*dy; if(d<d1){ d1=d; tone=tab[o+4]; lx=dx; ly=dy; } } }
        const e=Math.sqrt(d1); out[0]=tone; out[1]=e>=1?0:(e<0.74?1:(1-e)/0.26); out[2]=-(lx*0.55+ly*0.83); return out; };
      return { C, Lb, D, K, depth:P.depth_u, pebble, pitch:c }; },
    'soil-grain': (P,u,A)=>{ const cell=Math.sqrt(1000/P.specks), seed=P.seed|0, r0=P.size_u[0], r1=P.size_u[1];
      const hs=(i,j,k)=>{ let n=(i*374761393+j*668265263+k*1274126177+seed*2246822519)|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296; };
      /* speck(x,y) → coverage in −1..1: positive = pale speck, negative = dark speck */
      const nx=Math.ceil(1000/cell)+2, ny=Math.ceil(620/cell)+2, tab=new Float32Array(nx*ny*4);
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const o=(j*nx+i)*4, r=r0+(r1-r0)*hs(i,j,3)*hs(i,j,5), m=Math.min(0.45,r/cell+0.02); tab[o]=(i+m+(1-2*m)*hs(i,j,1))*cell; tab[o+1]=(j+m+(1-2*m)*hs(i,j,2))*cell; tab[o+2]=r; tab[o+3]=hs(i,j,4)<P.pale_share?1:-1; }
      return { cell, speck:(x,y)=>{ const i=Math.floor(x/cell), j=Math.floor(y/cell); if(i<0||j<0||i>=nx||j>=ny)return 0; const o=(j*nx+i)*4, dx=x-tab[o], dy=y-tab[o+1], r=tab[o+2]; if(dx>r+1||dx<-r-1||dy>r+1||dy<-r-1)return 0;
        const a=(r-Math.sqrt(dx*dx+dy*dy))*u+0.5; return a<=0?0:(a>=1?tab[o+3]:a*tab[o+3]); } }; },
    'root-growth': (P,u,A)=>({ grow:G=>{ const r=A.rng(P.seed); const reach=P.depth_pct/100, gens=P.generations|0, habit=P.habit|0; const roots=[]; let budget=0; const PI2=Math.PI/2;
        const grow=(x,y,ang,len,w0,gen,trop,wand)=>{ const pts=[[x,y]]; let L=0, touch=false; const kids=[]; const step=P.step_u;
          while(L<len&&budget>0){ ang+=(PI2-ang)*trop+(r()-0.5)*wand; ang=Math.max(0.12,Math.min(Math.PI-0.12,ang)); let nx=x+Math.cos(ang)*step, ny=y+Math.sin(ang)*step;
            if(nx<2||nx>998)break; const s=G.S(nx), t=G.T(nx); if(t-s<P.min_soil_u||s>G.yw-1)break;
            if(ny<s+2.5){ ny=s+2.5; ang=(ang+PI2)/2; }
            const e=s+reach*(t-s); if(ny>=e){ if(e>y)pts.push([nx,e]); touch=reach>0.995; break; } if(G.gravel(nx,ny))break;
            L+=step; budget--; pts.push([nx,ny]); x=nx; y=ny;
            if(gen<gens-1&&L>5&&r()<P.fork_rate[Math.min(gen,P.fork_rate.length-1)]*(gen===0?1.5-Math.min(1,(ny-G.S(nx))/Math.max(20,e-G.S(nx))):1)){ const side=r()<0.5?-1:1, rem=(e-ny)*0.8+8; kids.push([pts.length-1,ang+side*(0.55+0.4*r()),rem*(0.42+0.4*r())*Math.pow(0.74,gen),gen+1]); } }
          const n=pts.length; const ws=pts.map((p,k)=>w0*(0.2+0.8*Math.pow(1-k/Math.max(1,n-1),0.85))); const R={pts,ws,gen,touch}; roots.push(R);
          for(const k of kids){ const p=pts[k[0]]; if(p&&k[2]>3)grow(p[0],p[1],k[1],k[2],ws[k[0]]*P.child_width,k[3],P.trop_lateral,P.wander_lateral); } return R; };
        const sizes=[0.72,0.9,1.08,1.18,0.95];
        const crowns=habit===2?P.crowns_u.flatMap((x,i)=>i<P.crowns_u.length-1?[[x,sizes[i]],[(x+P.crowns_u[i+1])/2+(r()-0.5)*10,0.8]]:[[x,sizes[i]]]):P.crowns_u.map((x,i)=>[x,sizes[i]]);
        for(const [x0,sz] of crowns){ budget=P.steps_per_crown; const s=G.S(x0), t=G.T(x0); if(s>G.yw-2||t-s<P.min_soil_u*2)continue; const y0=s+1.2, dep=Math.max(4,s+reach*(t-s)-y0);
          if(habit===1){ grow(x0,y0,PI2+(r()-0.5)*0.12,dep*2.2,4.8*sz,0,P.trop_main,P.wander_main); }
          else if(habit===3){ grow(x0,y0,PI2+(r()-0.5)*0.12,dep*2.2,4.4*sz,0,P.trop_main,P.wander_main); const k=1+Math.floor(r()*2.4); for(let i=0;i<k;i++){ const side=(i+(x0|0))%2?1:-1; grow(x0+side*1.4,y0,PI2+side*(0.7+0.3*r()),dep*(0.45+0.25*r()),2.2*sz,0,0.03,0.16); } }
          else { const k=5+Math.floor(r()*3); for(let i=0;i<k;i++){ const a=PI2+(i/(k-1)-0.5)*1.7+(r()-0.5)*0.2; grow(x0+(r()-0.5)*3,y0,a,dep*(1.0+0.4*r()),1.6*sz,1,0.06,0.24); } } }
        return roots; } }),
    'bank-garden': (P,u,A)=>{ const sites=P.tree_sites_u;
      const normal=(G,x)=>{ const sl=(G.S(x+0.6)-G.S(x-0.6))/1.2; const l=Math.hypot(sl,1); return [sl/l,-1/l]; };
      return { mat:P.grass_u*P.mat_share, height:P.grass_u, normal,
        /* trees(G) → per tree: lobes [x,y,r] round the upper rim and inside (none at the bottom middle, so the fork shows), the trunk to a fork and its branches; kept inside the plate */
        trees:G=>[[],[1],[0,1],[0,1,2]][Math.max(0,Math.min(3,P.trees|0))].map(i=>{ let [x,r]=sites[i]; const q=A.rng(P.seed*31+i*977+5); const asp=0.84+0.14*q(), lean=(q()-0.5)*0.18;
            const n=8+Math.floor(q()*5), L=[]; for(let k=0;k<n;k++){ const a=0.62-(Math.PI+1.24)*k/(n-1)+(q()-0.5)*0.3, rho=0.62+0.17*q(), lr=0.27+0.13*q(); L.push([Math.cos(a)*rho,Math.sin(a)*rho*asp,lr]); }
            const ni=3+Math.floor(q()*2); for(let k=0;k<ni;k++){ const a=-Math.PI*(0.1+0.8*k/(ni-1)+0.08*(q()-0.5)), rho=0.25+0.18*q(); L.push([Math.cos(a)*rho,Math.sin(a)*rho*asp-0.04,0.34+0.1*q()]); }
            let mx=0, my0=0, my1=0; for(const [lx,ly,lr] of L){ mx=Math.max(mx,lx+lr*1.06); my0=Math.min(my0,ly-lr*1.06); my1=Math.max(my1,ly+lr); }
            x=Math.min(x,995-mx*r); const s=G.S(x); const lift=P.grass_u*0.6+3+0.16*r; const cy=Math.max(5-my0*r,s-lift-my1*r);
            const fx=x+lean*r, fy=cy+0.5*r, w0=0.12*r; const br=[[x-0.34*r+lean*r*0.5,cy+0.1*r],[x+0.3*r+lean*r,cy+0.06*r],[x+0.04*r+lean*r,cy-0.2*r]];
            return { i, x, r, asp, base:s, cy, fx, fy, w0, br, lobes:L.map(([lx,ly,lr])=>[x+lx*r,cy+ly*r,lr*r]) }; }).sort((a,b)=>b.r-a.r),
        /* blades(G) → [{bx,by,tx,ty,cx,cy,w,front,shade}] in u */
        blades:G=>{ const r=A.rng(P.seed); const out=[]; const x0=G.dry0, n=Math.round((1000-x0)*P.blades_per_u); const mat=P.grass_u*P.mat_share;
          for(let i=0;i<n;i++){ const x=x0+(1000-x0)*r(), k=r(), h0=r(), lean=r(), bend=r(), wd=r(), lay=r(), sh=r(); const s=G.S(x); if(s>G.yw-0.6||!G.soilAt(x))continue; const [nx,ny]=normal(G,x);
            const tp=Math.min(1,(x-x0)/36), f=0.3+0.7*tp*tp*(3-2*tp), clump=0.86+0.14*Math.sin(x/23)*Math.sin(x/7.1);
            const d=mat*0.8*k*f; const bx=x+nx*d, by=s+ny*d; const h=P.grass_u*(0.4+0.6*h0)*(1-0.5*k)*f*clump; let dx=nx*0.4, dy=ny*0.4-0.6; const dl=Math.hypot(dx,dy); dx/=dl; dy/=dl; const la=(lean-0.5)*0.7; const cs=Math.cos(la), sn=Math.sin(la); const ux=dx*cs-dy*sn, uy=dx*sn+dy*cs;
            const b=(bend-0.5)*0.95; out.push({ bx, by, tx:bx+ux*h+(-uy)*b*h*0.5, ty:by+uy*h+ux*b*h*0.5, cx:bx+ux*h*0.55+(-uy)*b*h*0.15, cy:by+uy*h*0.55+ux*b*h*0.15, w:0.8+1.3*wd, front:lay>0.6, shade:sh }); }
          return out; },
        /* flowers(G) → fixed slots; the first P.flowers of them are drawn */
        flowers:G=>{ const r=A.rng(P.seed+7); const out=[]; const x0=G.dry0+6, x1=990; for(let i=0;i<48;i++){ const t=r(), a=r(), b=r(), c=r(), e=r(); if(i>=(P.flowers|0))continue; const x=x0+(x1-x0)*t; const s=G.S(x); if(s>G.yw-2||!G.soilAt(x))continue;
            const type=t<0.6?(a<0.78?'iris':'white'):(t>0.74?(a<0.6?'yellow':'white'):(a<0.45?'iris':'white')); const base=s-P.grass_u*P.mat_share*0.5;
            const hgt=type==='iris'?P.grass_u*0.84+3+13*b:P.grass_u*(0.6+0.36*b); out.push({ type, x, base, top:base-hgt, lean:(c-0.5)*0.22, size:type==='iris'?4.3+1.8*e:1.3+0.6*e, two:e>0.6 }); }
          return out.sort((p,q)=>p.base-q.base); },
        /* tufts(G) → grass symbols for the line section */
        tufts:G=>{ const r=A.rng(P.seed+3); const out=[]; for(let x=G.dry0+2;x<998;x+=5.2+2.4*r()){ const s=G.S(x); if(s>G.yw-0.6||!G.soilAt(x))continue; out.push({ x, s, h:P.grass_u*0.36*(0.75+0.5*r()), n:normal(G,x) }); } return out; } }; }
  },
  /* geometry in u for a parameter set: ground S, gravel top T and base B, water level, shoreline, where soil meets the air */
  geom(P){ const A=window.ART, T=this.techniques; const bp=T['bank-profile'](P['bank-profile'],1,A), rv=T['river-view'](P['river-view'],1,A), gb=T['gravel-body'](P['gravel-body'],1,A);
    const S=bp.S; let crestLow=S(bp.crest[0]); for(let x=bp.crest[0];x<=1000;x+=2)crestLow=Math.max(crestLow,S(x));
    const yw=rv.level(bp.bed,crestLow); let xs=0; while(xs<1000&&S(xs)>yw)xs+=0.25; xs=Math.max(0,xs-0.25)+0.25*(S(xs-0.25)-yw)/Math.max(1e-6,S(xs-0.25)-S(xs));
    const C=x=>gb.C(x,bp.bedY); let xq=1000; for(let x=0;x<=1000;x+=0.5){ if(gb.Lb(x)<=Math.max(C(x),S(x))){ xq=x; break; } }
    const Tl=x=>x<xq?Math.max(C(x),S(x)):1e9, Bl=x=>x<xq?Math.max(Tl(x),gb.Lb(x)):1e9, D=gb.D, K=gb.K;
    const soilAt=x=>x>=xq||C(x)>S(x)+0.6; const Tg=x=>x<xq?Tl(x):Math.min(D(x),K(x)); const gravel=(x,y)=>y<K(x)&&((y>=Tl(x)&&y<Bl(x))||y>=D(x));
    let dry0=xs; while(dry0<1000&&!(S(dry0)<yw-0.6&&soilAt(dry0)))dry0+=0.5;
    let bedMax=0; for(let x=0;x<xs;x+=2)bedMax=Math.max(bedMax,S(x));
    return { S, C, T:Tg, Tl, Bl, D, K, xq, gravel, yw, xs, dry0, bedMax, soilAt, toe:bp.toe, crest:bp.crest, bp, rv, gb, ridges:rv.ridges.map(rd=>({ y:x=>rd.y(x)+yw-rv.H0, lit:rd.lit, tone:rd.tone })) }; },
  /* layers: under (ground, hills, water body), strokes (moving), front (section and garden), all in device px */
  layers(W,H,V,O){ const key=W+'x'+H+'|'+JSON.stringify(V)+'|'+JSON.stringify(O||{}); const cache=this._cache||(this._cache=[]); const hit=cache.find(c=>c.key===key); if(hit)return hit;
    const A=window.ART, T=this.techniques, P=A.params(this.spec,O); const u=W/1000;
    const sg=T['section-ground'](P['section-ground'],u,A,V), G=this.geom(P); if(sg.dark&&!sg.line)V=this.night(V);
    const so=T['soil-grain'](P['soil-grain'],u,A), rg=T['root-growth'](P['root-growth'],u,A), bg=T['bank-garden'](P['bank-garden'],u,A,V);
    const L={ key, G, sg, line:sg.line, strokes:G.rv.strokes(G), roots:rg.grow(G), u, V };
    if(sg.line)this.buildLine(L,W,H,V,P,bg); else this.buildPaint(L,W,H,V,P,so,bg);
    cache.unshift(L); if(cache.length>2)cache.length=2; return L; },
  /* Ink under gouache: the hills, the water and the garden mix toward night blue; the cut face stays lit */
  night(V){ const A=window.ART, n=A.hex('#0D1828'), o=Object.assign({},V); const m=(c,k)=>'#'+A.mix(A.hex(c),n,k).map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
    for(const [keys,k] of [[['hillNear','hillFar'],0.66],[['hillNearLow','hillFarLow'],0.74],[['water','waterDeep','waterMid'],0.42],[['waterHi'],0.3],[['hillLight'],0.72],[['grass','grassDark','grassLight','grassTip'],0.52],[['tree','treeDark','treeLight','trunk'],0.45],[['iris','irisDark','bloom','yellow'],0.3],[['soil','soilDark','speck','gravel','gravelLight','gravelDark','root','rootEdge','clay','clayLight'],0.08]])for(const key of keys)if(V[key])o[key]=m(V[key],k);
    return o; },
  /* the water region as a path, in u */
  waterPath(x,G){ x.beginPath(); x.moveTo(-2,G.yw); x.lineTo(G.xs,G.yw); for(let X=G.xs;X>=-2;X-=1.5)x.lineTo(X,G.S(Math.max(0,X))); x.closePath(); },
  groundPath(x,G,Hu){ x.beginPath(); x.moveTo(-2,G.S(0)); for(let X=0;X<=1002;X+=1)x.lineTo(X,G.S(Math.min(1000,X))); x.lineTo(1002,Hu+4); x.lineTo(-2,Hu+4); x.closePath(); },
  buildPaint(L,W,H,V,P,so,bg){ const A=window.ART, G=L.G, u=L.u, Hu=H/u; const hx=A.hex; const gnd=hx(L.sg.ground);
    const cN=hx(V.hillNear),cNL=hx(V.hillNearLow),cF=hx(V.hillFar),cFL=hx(V.hillFarLow),cHL=hx(V.hillLight),cW=hx(V.water),cWD=hx(V.waterDeep),cWM=hx(V.waterMid),cG=hx(V.gravel),cGL=hx(V.gravelLight),cGD=hx(V.gravelDark),cS=hx(V.soil),cSD=hx(V.soilDark),cSp=hx(V.speck),cK=hx(V.clay),cKL=hx(V.clayLight);
    const pn=A.perlin(26); const gs=8, gw=Math.ceil(1000/gs)+2, gh=Math.ceil(Hu/gs)+2; const M1=new Float32Array(gw*gh); for(let j=0;j<gh;j++)for(let i=0;i<gw;i++)M1[j*gw+i]=pn.fbm(i*gs/60,j*gs/60,3);
    const gs2=2.4, gw2=Math.ceil(1000/gs2)+2, gh2=Math.ceil(Hu/gs2)+2; const M2=new Float32Array(gw2*gh2); for(let j=0;j<gh2;j++)for(let i=0;i<gw2;i++)M2[j*gw2+i]=pn(i*gs2/7+31.7,j*gs2/7+5.3);
    const bil=(M,w,s,x,y)=>{ const h=M.length/w; let fx=x/s, fy=y/s; fx=fx<0?0:(fx>w-1.001?w-1.001:fx); fy=fy<0?0:(fy>h-1.001?h-1.001:fy); const i=fx|0, j=fy|0, a=fx-i, b=fy-j, k=j*w+i; return (M[k]*(1-a)+M[k+1]*a)*(1-b)+(M[k+w]*(1-a)+M[k+w+1]*a)*b; };
    const y0w=G.yw-2, wsx=4, wsy=0.8, ww=Math.ceil(1000/wsx)+2, wh=Math.ceil((G.bedMax+4-y0w)/wsy)+2; const WS=new Float32Array(ww*wh); for(let j=0;j<wh;j++)for(let i=0;i<ww;i++)WS[j*ww+i]=pn(i*wsx/34+11.1,(y0w+j*wsy)/2.1+3.3)+0.5*pn(i*wsx/11+4.2,(y0w+j*wsy)/0.9+7.7);
    const sY=new Float32Array(W), kY=new Float32Array(W), dY=new Float32Array(W), tY=new Float32Array(W), bY=new Float32Array(W), hTop=new Float32Array(W).fill(1e9);
    const NR=G.ridges.length, rY=G.ridges.map(()=>new Float32Array(W)), rL=G.ridges.map(()=>new Float32Array(W)), rC=G.ridges.map(rd=>A.mix(cF,cN,rd.tone)), rCL=G.ridges.map(rd=>A.mix(cFL,cNL,rd.tone));
    G.ridges.forEach((rd,k)=>{ for(let X=0;X<W;X++){ const xu=(X+0.5)/u, yk=rd.y(xu); rY[k][X]=yk*u; rL[k][X]=rd.lit(xu); if(yk*u<hTop[X])hTop[X]=yk*u; } });
    /* fleck(x,y,k) → −1..1: a dab of hill light (+) or shade (−), one per 2.2 u jittered cell, 0.45–1.05 u across */
    const fleck=(x,y,k)=>{ const i=Math.floor(x/2.2), j=Math.floor(y/2.2); let n=(i*374761393+j*668265263+k*1274126177+911)|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; const h1=(n>>>0)/4294967296; if(h1>0.5)return 0; n=Math.imul(n^(n>>>15),2246822519); n^=n>>>13; const h2=(n>>>0)/4294967296; n=Math.imul(n^(n>>>16),3266489917); n^=n>>>16; const h3=(n>>>0)/4294967296; n=Math.imul(n^(n>>>13),2654435761); n^=n>>>15; const h4=(n>>>0)/4294967296;
      const rr=0.45+0.6*h4, cx=(i+rr/2.2+(1-2*rr/2.2)*h2)*2.2, cy=(j+rr/2.2+(1-2*rr/2.2)*h3)*2.2, dx=(x-cx)/1.6, dy=y-cy, dd=Math.sqrt(dx*dx+dy*dy), c=Math.max(0,Math.min(1,(rr-dd)*u+0.5)); return h1<0.3?c:-c; };
    for(let X=0;X<W;X++){ const xu=(X+0.5)/u; sY[X]=G.S(xu)*u; tY[X]=G.Tl(xu)*u; bY[X]=G.Bl(xu)*u; dY[X]=G.D(xu)*u; kY[X]=G.K(xu)*u; }
    const ywY=G.yw*u, hsh=(x,y)=>{ let n=(x*374761393+y*668265263)|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296-0.5; };
    let gs0=(P['section-ground'].grain_seed*40503+7)|0||1; const gamp=P['section-ground'].grain_amp*2;
    const ud=new ImageData(W,H), fd=new ImageData(W,H), UD=ud.data, FD=fd.data; const peb=G.gb.pebble, speck=so.speck;
    for(let y=0;y<H;y++){ const yc=y+0.5, yu=yc/u;
      for(let X=0;X<W;X++){ const i=(y*W+X)*4, xu=(X+0.5)/u; let r=gnd[0], g=gnd[1], b=gnd[2];
        if(yc<ywY+1&&yc>hTop[X]-0.5){ for(let k=0;k<NR;k++){ const y0=rY[k][X]; if(yc<=y0-0.5)continue; const a=Math.min(1,yc-y0+0.5), dpx=yc-y0, d=dpx/u, hz=Math.min(1,Math.max(0,dpx/Math.max(4,ywY-y0))), hs=hz*hz*(3-2*hz), lit=rL[k][X], C0=rC[k], C1=rCL[k];
            let cr=C0[0]+(C1[0]-C0[0])*hs*0.92, cg=C0[1]+(C1[1]-C0[1])*hs*0.92, cb=C0[2]+(C1[2]-C0[2])*hs*0.92; const sh=0.84+0.28*lit; cr*=sh; cg*=sh; cb*=sh;
            const band=Math.exp(-d/6)*(0.2+0.8*lit)*(1-hs)*0.66; cr+=(cHL[0]-cr)*band; cg+=(cHL[1]-cg)*band; cb+=(cHL[2]-cb)*band;
            const fl=fleck(xu+k*53.1,yu+k*17.3,k); if(fl>0){ const w=fl*(1-hs)*(0.4+0.5*lit); cr+=(cHL[0]-cr)*w; cg+=(cHL[1]-cg)*w; cb+=(cHL[2]-cb)*w; } else if(fl<0){ const w=-fl*(1-hs*0.6)*0.14; cr*=1-w; cg*=1-w*0.8; cb*=1-w*0.7; }
            const m=1+0.05*bil(M1,gw,gs,xu+k*37,yu)+0.04*bil(M2,gw2,gs2,xu+k*11,yu)+0.03*hsh(X,y+k*101); r+=(cr*m-r)*a; g+=(cg*m-g)*a; b+=(cb*m-b)*a; } }
        if(yc>ywY-0.5){ const a=Math.min(1,yc-ywY+0.5), d=(yc-ywY)/u, t=Math.min(1,d/90), s=bil(WS,ww,1,xu/wsx,(yu-y0w)/wsy), m=1+0.075*s+0.03*bil(M1,gw,gs,xu,yu);
          let cr=(cW[0]+(cWD[0]-cW[0])*t)*m, cg=(cW[1]+(cWD[1]-cW[1])*t)*m, cb=(cW[2]+(cWD[2]-cW[2])*t)*m; if(d<1.8){ const k=0.4*(1-d/1.8); cr+=(cWM[0]-cr)*k; cg+=(cWM[1]-cg)*k; cb+=(cWM[2]-cb)*k; }
          r+=(cr-r)*a; g+=(cg-g)*a; b+=(cb-b)*a; }
        gs0^=gs0<<13; gs0^=gs0>>>17; gs0^=gs0<<5; const gm=1+gamp*((gs0>>>0)/4294967296-0.5); UD[i]=r*gm; UD[i+1]=g*gm; UD[i+2]=b*gm; UD[i+3]=255;
        if(yc>sY[X]-0.5){ const a=Math.min(1,yc-sY[X]+0.5); const wg=Math.max(Math.max(0,Math.min(1,yc-tY[X]+0.5))*Math.max(0,Math.min(1,bY[X]-yc+0.5)),Math.max(0,Math.min(1,yc-dY[X]+0.5))); let sr=0,sg=0,sb=0,gr=0,gg=0,gb2=0;
          if(wg<1){ const m=1+0.075*bil(M1,gw,gs,xu+90,yu)+0.05*bil(M2,gw2,gs2,xu+7,yu)+0.05*hsh(X,y); const dd=(yc-sY[X])/u; const top=dd<7?1-0.16*(1-dd/7):1; sr=cS[0]*m*top; sg=cS[1]*m*top; sb=cS[2]*m*top; const sp=speck(xu,yu); if(sp>0){ sr+=(cSp[0]-sr)*sp; sg+=(cSp[1]-sg)*sp; sb+=(cSp[2]-sb)*sp; } else if(sp<0){ sr+=(cSD[0]-sr)*-sp; sg+=(cSD[1]-sg)*-sp; sb+=(cSD[2]-sb)*-sp; } }
          if(wg>0){ const q=peb(xu,yu), tn=q[0], cv=q[1], lt=1+0.17*q[2]; const pr=(cG[0]+(cGL[0]-cG[0])*tn)*lt, pg=(cG[1]+(cGL[1]-cG[1])*tn)*lt, pb=(cG[2]+(cGL[2]-cG[2])*tn)*lt; const mm=1+0.05*bil(M2,gw2,gs2,xu,yu+9); gr=cGD[0]*mm+(pr-cGD[0]*mm)*cv; gg=cGD[1]*mm+(pg-cGD[1]*mm)*cv; gb2=cGD[2]*mm+(pb-cGD[2]*mm)*cv; }
          let fr=sr+(gr-sr)*wg, fg=sg+(gg-sg)*wg, fb=sb+(gb2-sb)*wg;
          const wc=Math.max(0,Math.min(1,yc-kY[X]+0.5)); if(wc>0){ const ln=0.5+0.5*Math.sin((yu+4*bil(M1,gw,gs,xu+150,yu))*2.1), lam=ln*ln*ln*ln*0.75, mk=1+0.06*bil(M2,gw2,gs2,xu+30,yu*2.5)+0.04*hsh(X,y), kd=(yc-kY[X])/u, edge=kd<3?0.85+0.05*kd:1;
            const kr=(cK[0]+(cKL[0]-cK[0])*lam)*mk*edge, kg=(cK[1]+(cKL[1]-cK[1])*lam)*mk*edge, kb=(cK[2]+(cKL[2]-cK[2])*lam)*mk*edge; fr+=(kr-fr)*wc; fg+=(kg-fg)*wc; fb+=(kb-fb)*wc; }
          FD[i]=fr; FD[i+1]=fg; FD[i+2]=fb; FD[i+3]=255*a; } } }
    const under=A.off(W,H), front=A.off(W,H); const CA={willReadFrequently:true}; under.getContext('2d',CA).putImageData(ud,0,0); const fx=front.getContext('2d',CA); fx.putImageData(fd,0,0);
    /* roots, then the garden, drawn in u on the front layer */
    fx.save(); fx.setTransform(u,0,0,u,0,0); fx.lineJoin='round'; fx.lineCap='round';
    fx.save(); this.groundPath(fx,G,Hu); fx.clip(); this.rootPolys(fx,L.roots,1,2.2/u,0.75); fx.fillStyle=V.rootEdge; fx.fill(); this.rootPolys(fx,L.roots,1,0); fx.fillStyle=V.root; fx.fill(); fx.restore();
    this.paintGarden(fx,G,V,bg,u,Hu);
    fx.restore();
    L.sg.finish(fx);
    L.under=under; L.front=front; },
  /* all roots as one path of tapered polygons; k scales the width */
  rootPolys(x,roots,k,add,rel){ x.beginPath(); for(const R of roots){ const p=R.pts, n=p.length; if(n<2)continue; const lf=[], rt=[];
      for(let i=0;i<n;i++){ const a=p[Math.max(0,i-1)], b=p[Math.min(n-1,i+1)]; let tx=b[0]-a[0], ty=b[1]-a[1]; const l=Math.hypot(tx,ty)||1; tx/=l; ty/=l; const wk=R.ws[i]*k, w=(wk+(rel?Math.min(add||0,wk*rel):(add||0)))/2; lf.push([p[i][0]-ty*w,p[i][1]+tx*w]); rt.push([p[i][0]+ty*w,p[i][1]-tx*w]); }
      x.moveTo(lf[0][0],lf[0][1]); for(let i=1;i<n;i++)x.lineTo(lf[i][0],lf[i][1]); for(let i=n-1;i>=0;i--)x.lineTo(rt[i][0],rt[i][1]); x.closePath(); } },
  paintGarden(x,G,V,bg,u,Hu){ const A=window.ART; const mat=bg.mat; const mix=(a,b,t)=>A.rgb(A.mix(A.hex(a),A.hex(b),t));
    /* turf mat along the soil line, above water; below water it fades out */
    const pts=[]; for(let X=G.dry0;X<=1001;X+=1.5){ const xx=Math.min(1000,X); if(!G.soilAt(xx)||G.S(xx)>G.yw-0.4)continue; pts.push([xx,G.S(xx)]); }
    if(pts.length>2){ const top=pts.map(([px,py])=>{ const [nx,ny]=bg.normal(G,px); const tp=Math.max(0,Math.min(1,(px-G.dry0)/30)); const k=mat*(0.85+0.3*Math.sin(px/9.1)*Math.sin(px/3.7))*(0.12+0.88*tp*tp*(3-2*tp)); return [px+nx*k,py+ny*k]; });
      const path=()=>{ x.beginPath(); x.moveTo(pts[0][0],pts[0][1]+1); for(const p of top)x.lineTo(p[0],p[1]); for(let i=pts.length-1;i>=0;i--)x.lineTo(pts[i][0],pts[i][1]+0.8); x.closePath(); };
      x.save(); x.beginPath(); x.rect(-5,-5,1010,G.yw-0.4); x.clip(); path(); x.fillStyle=mix(V.grassDark,V.grass,0.3); x.fill(); x.restore(); }
    /* trees, behind the grass */
    const trees=bg.trees(G); const tr=A.rng(55); const shades=[0,1,2,3,4,5].map(k=>{ const v=k/5; return v<0.5?mix(V.treeDark,V.tree,v*2):mix(V.tree,V.treeLight,(v-0.5)*2); });
    const taper=(x0,y0,x1,y1,w0,w1)=>{ const dx=x1-x0, dy=y1-y0, l=Math.hypot(dx,dy)||1, nx=-dy/l, ny=dx/l; x.moveTo(x0+nx*w0,y0+ny*w0); x.lineTo(x1+nx*w1,y1+ny*w1); x.lineTo(x1-nx*w1,y1-ny*w1); x.lineTo(x0-nx*w0,y0-ny*w0); x.closePath(); };
    for(const t of trees){ /* the shaded hollow under the crown, then the trunk, its fork and branches */
      x.fillStyle=mix(V.treeDark,V.trunk,0.35); x.beginPath(); x.ellipse(t.x,t.cy+0.14*t.r,0.6*t.r,0.48*t.r*t.asp,0,0,6.2832); x.fill();
      x.fillStyle=V.trunk; x.beginPath(); taper(t.x,t.base+1,t.fx,t.fy,t.w0,t.w0*0.72); for(const [bx,by] of t.br)taper(t.fx,t.fy,bx,by,t.w0*0.5,t.w0*0.2); x.fill();
      x.fillStyle=mix(V.trunk,V.treeDark,0.5); x.beginPath(); taper(t.x+t.w0*0.45,t.base+1,t.fx+t.w0*0.35,t.fy,t.w0*0.45,t.w0*0.3); x.fill();
      /* lobes, lowest first: each a base tone by where it sits in the crown, then dabs lit from its own upper left; dabs spill past the rim to break the outline */
      for(const [lx,ly,lr] of t.lobes.slice().sort((a,b)=>b[1]-a[1])){ const gl=Math.max(0,Math.min(1,0.55-0.5*((lx-t.x)*0.55+(ly-t.cy)*0.85)/t.r));
        x.fillStyle=mix(V.treeDark,V.tree,0.1+0.45*gl); x.beginPath(); x.arc(lx,ly,lr,0,6.2832); x.fill();
        const bins=shades.map(()=>[]); const n=Math.round(lr*lr*1.5);
        for(let k=0;k<n;k++){ const a=tr()*6.2832, qq=Math.sqrt(tr())*1.07, px=lx+Math.cos(a)*qq*lr, py=ly+Math.sin(a)*qq*lr, sz=0.7+0.95*tr(), nz=tr(); const loc=0.5-0.8*(Math.cos(a)*0.6+Math.sin(a)*0.8)*qq;
          const lit=0.32*gl+0.68*loc+0.28*(nz-0.5)-(qq>0.97?0.12:0); bins[Math.max(0,Math.min(5,Math.round(lit*5)))].push([px,py,sz]); }
        bins.forEach((bn,k)=>{ if(!bn.length)return; x.beginPath(); for(const [px,py,sz] of bn){ x.moveTo(px+sz,py); x.arc(px,py,sz,0,6.2832); } x.fillStyle=shades[k]; x.fill(); }); } }
    /* blades in shade bins: back blades darker, front blades lighter */
    const bl=bg.blades(G); const back=[0,1,2,3].map(k=>mix(V.grassDark,V.grass,k/3*0.95)), frontC=[0,1,2,3].map(k=>k<2?mix(V.grass,V.grassLight,k*0.55):mix(V.grassLight,V.grassTip,(k-1.5)*0.6));
    const blade=(b)=>{ const dx=b.tx-b.bx, dy=b.ty-b.by, l=Math.hypot(dx,dy)||1, px=-dy/l*b.w/2, py=dx/l*b.w/2; x.moveTo(b.bx-px,b.by-py); x.quadraticCurveTo(b.cx-px*0.5,b.cy-py*0.5,b.tx,b.ty); x.quadraticCurveTo(b.cx+px*0.5,b.cy+py*0.5,b.bx+px,b.by+py); x.closePath(); };
    const draw=(list,cols)=>{ const bins=cols.map(()=>[]); for(const b of list)bins[Math.min(cols.length-1,(b.shade*cols.length)|0)].push(b); bins.forEach((bn,k)=>{ x.beginPath(); for(const b of bn)blade(b); x.fillStyle=cols[k]; x.fill(); }); };
    draw(bl.filter(b=>!b.front),back);
    /* flowers: irises stand above the grass, small blooms sit in it */
    const fl=bg.flowers(G);
    for(const f of fl){ if(f.type!=='iris')continue; const tx=f.x+f.lean*(f.base-f.top); x.strokeStyle=V.grassDark; x.lineWidth=0.9; x.beginPath(); x.moveTo(f.x,f.base); x.quadraticCurveTo(f.x+f.lean*8,(f.base+f.top)/2,tx,f.top); x.stroke();
      x.fillStyle=V.grassDark; for(const sd of [-1,1]){ const lh=(f.base-f.top)*0.78; x.beginPath(); x.moveTo(f.x-0.7,f.base); x.quadraticCurveTo(f.x+sd*3,f.base-lh*0.5,f.x+sd*4.5,f.base-lh); x.quadraticCurveTo(f.x+sd*1.2,f.base-lh*0.5,f.x+0.7,f.base); x.fill(); } }
    draw(bl.filter(b=>b.front),frontC);
    for(const f of fl){ const tx=f.x+f.lean*(f.base-f.top), ty=f.top;
      if(f.type==='iris'){ const s=f.size; const petal=(a,len,wd,col)=>{ x.beginPath(); x.ellipse(tx+Math.cos(a)*len*0.5,ty+Math.sin(a)*len*0.5,len*0.55,wd,a,0,6.2832); x.fillStyle=col; x.fill(); };
        petal(2.6,s*1.1,s*0.34,V.irisDark); petal(0.55,s*1.1,s*0.34,V.irisDark); petal(1.57,s*0.95,s*0.32,V.iris); petal(2.55,s,s*0.3,V.iris); petal(0.6,s,s*0.3,V.iris);
        petal(-1.2,s*0.85,s*0.26,mix(V.iris,V.bloom,0.3)); petal(-1.95,s*0.85,s*0.26,mix(V.iris,V.bloom,0.3)); x.fillStyle=V.yellow; x.beginPath(); x.arc(tx,ty+s*0.18,s*0.16,0,6.2832); x.fill();
        if(f.two){ const by=ty+(f.base-ty)*0.28, bx=f.x+f.lean*(f.base-by)+1.2; x.fillStyle=V.irisDark; x.beginPath(); x.ellipse(bx,by,s*0.28,s*0.6,0.3,0,6.2832); x.fill(); } }
      else { x.strokeStyle=V.grass; x.lineWidth=0.5; x.beginPath(); x.moveTo(f.x,f.base); x.lineTo(tx,ty); x.stroke(); const c=f.type==='yellow'?V.yellow:V.bloom; const s=f.size;
        if(f.type==='yellow'){ x.fillStyle=c; for(let k=0;k<3;k++){ x.beginPath(); x.arc(tx+(k-1)*s*1.3,ty+(k===1?-s*0.8:0),s*0.75,0,6.2832); x.fill(); } }
        else { x.fillStyle=c; for(let k=0;k<5;k++){ const a=k*1.2566; x.beginPath(); x.arc(tx+Math.cos(a)*s*0.7,ty+Math.sin(a)*s*0.7,s*0.55,0,6.2832); x.fill(); } x.fillStyle=V.yellow; x.beginPath(); x.arc(tx,ty,s*0.4,0,6.2832); x.fill(); } } } },
  buildLine(L,W,H,V,P,bg){ const A=window.ART, G=L.G, u=L.u, Hu=H/u, sg=L.sg; const ink=sg.ink, gnd=sg.ground; const hp=u>0?1/u:1;
    const under=A.off(W,H), front=A.off(W,H); const ux=under.getContext('2d'), fx=front.getContext('2d'); ux.fillStyle=gnd; ux.fillRect(0,0,W,H);
    ux.save(); ux.setTransform(u,0,0,u,0,0); ux.lineJoin='round'; ux.lineCap='round'; ux.strokeStyle=ink;
    /* far hills: each ridge crest where no nearer ridge stands in front of it, down to the waterline */
    let on=false; G.ridges.forEach((rd,k)=>{ ux.globalAlpha=0.45+0.4*rd.tone; ux.lineWidth=(0.8+0.4*rd.tone)*hp; ux.beginPath(); on=false; for(let X=0;X<=600;X+=0.5){ const yk=rd.y(X); let vis=yk<G.yw-0.5&&X<G.xs; for(let j=k+1;j<G.ridges.length&&vis;j++)if(G.ridges[j].y(X)<yk+0.4)vis=false; if(vis){ if(!on){ ux.moveTo(X,yk); on=true; } else ux.lineTo(X,yk); } else on=false; } ux.stroke(); }); ux.globalAlpha=1;
    /* waterline and the water-level mark */
    ux.strokeStyle=sg.inkWater; ux.lineWidth=1.3*hp; ux.beginPath(); ux.moveTo(0,G.yw); ux.lineTo(G.xs,G.yw); ux.stroke();
    const mx=Math.min(96,G.xs*0.3); ux.beginPath(); ux.moveTo(mx-5,G.yw-7.5); ux.lineTo(mx+5,G.yw-7.5); ux.lineTo(mx,G.yw-0.8); ux.closePath(); ux.lineWidth=1.1*hp; ux.stroke(); ux.beginPath(); ux.moveTo(mx-6,G.yw+3); ux.lineTo(mx+6,G.yw+3); ux.moveTo(mx-3.5,G.yw+6); ux.lineTo(mx+3.5,G.yw+6); ux.stroke();
    ux.restore();
    fx.save(); fx.setTransform(u,0,0,u,0,0); fx.lineJoin='round'; fx.lineCap='round';
    /* soil: 45° hatch clipped to the ground, the gravel then cleared and ringed; both gravel parts wind the same way, so they join */
    const cl=v=>Math.min(Hu+4,v), xq=Math.min(1002,G.xq);
    const gravelPath=k=>{ k.moveTo(-2,G.Tl(0)); for(let X=0;X<xq;X+=1)k.lineTo(X,G.Tl(X)); k.lineTo(xq,G.Tl(Math.min(1000,xq-0.01))); for(let X=Math.floor(xq);X>=0;X-=1)k.lineTo(X,cl(G.Bl(X))); k.lineTo(-2,cl(G.Bl(0))); k.closePath();
      k.moveTo(-2,cl(G.D(0))); for(let X=0;X<=1002;X+=1)k.lineTo(X,cl(G.D(Math.min(1000,X)))); k.lineTo(1002,Hu+4); k.lineTo(-2,Hu+4); k.closePath(); };
    fx.save(); this.groundPath(fx,G,Hu); fx.clip(); fx.strokeStyle=ink; fx.globalAlpha=0.75; fx.lineWidth=0.7*hp; fx.beginPath(); const pitch=5; for(let c=-Hu;c<1000+Hu;c+=pitch){ fx.moveTo(c,Hu+4); fx.lineTo(c+Hu+8,-4); } fx.stroke(); fx.globalAlpha=1;
    const so=this.techniques['soil-grain'](P['soil-grain'],u,A); const sr=A.rng(19); const cell=so.cell*1.25; fx.fillStyle=ink; fx.beginPath(); for(let yy=0;yy<Hu;yy+=cell)for(let xx=0;xx<1000;xx+=cell){ const px=xx+sr()*cell, py=yy+sr()*cell, rr=0.45+0.5*sr(); if(py<G.S(px)+2||G.gravel(px,py))continue; fx.moveTo(px+rr,py); fx.arc(px,py,rr,0,6.2832); } fx.fill(); fx.restore();
    fx.save(); fx.beginPath(); gravelPath(fx); fx.clip(); fx.fillStyle=gnd; fx.fill(); const gr=A.rng(61); const gp=6.2; fx.strokeStyle=ink; fx.lineWidth=0.75*hp; fx.beginPath(); for(let yy=200;yy<Hu+gp;yy+=gp*0.8)for(let xx=-gp;xx<1000+gp;xx+=gp){ const px=xx+gr()*gp, py=yy+gr()*gp*0.8, rx=1.0+1.4*gr(), ry=rx*(0.6+0.25*gr()), ro=(gr()-0.5)*0.6; const qx=Math.max(0,Math.min(1000,px)); if(!(G.gravel(qx,py-ry-0.6)&&G.gravel(qx,py+ry+0.6)&&G.gravel(Math.max(0,qx-rx-0.6),py)&&G.gravel(Math.min(1000,qx+rx+0.6),py)))continue; fx.moveTo(px+rx*Math.cos(ro),py+rx*Math.sin(ro)); fx.ellipse(px,py,rx,ry,ro,0,6.2832); } fx.stroke(); fx.restore();
    /* clay floor: cleared, then staggered horizontal dashes */
    fx.save(); fx.beginPath(); fx.moveTo(-2,cl(G.K(0))); for(let X=0;X<=1002;X+=1)fx.lineTo(X,cl(G.K(Math.min(1000,X)))); fx.lineTo(1002,Hu+4); fx.lineTo(-2,Hu+4); fx.closePath(); fx.clip(); fx.fillStyle=gnd; fx.fill(); fx.strokeStyle=ink; fx.globalAlpha=0.8; fx.lineWidth=0.7*hp; fx.beginPath(); const kr=A.rng(83); let row=0;
    for(let yy=P['gravel-body'].clay_u-6;yy<Hu+4;yy+=3.6,row++){ let xx=-(row%2)*4.5-kr()*4; while(xx<1002){ const ln=5+3*kr(); fx.moveTo(xx,yy); fx.lineTo(xx+ln,yy); xx+=ln+3+2*kr(); } } fx.stroke(); fx.restore();
    /* roots: hairlines, the main root full weight and each finer generation lighter */
    fx.save(); this.groundPath(fx,G,Hu); fx.clip(); fx.fillStyle=ink; [1,0.78,0.58,0.45,0.38].forEach((al,g)=>{ const rs=L.roots.filter(R=>R.gen===g); if(!rs.length)return; fx.globalAlpha=al; this.rootPolys(fx,rs,g===0?0.3:0.2,(g===0?0.7:0.45)*hp); fx.fill(); }); fx.globalAlpha=1; fx.restore();
    /* contacts: gravel top where buried, gravel base, then the ground line as the cut edge */
    const trace=(f,vis)=>{ fx.beginPath(); let on=false; for(let X=0;X<=1000;X+=0.5){ const y=f(X); if(vis(X,y)){ if(!on){ fx.moveTo(X,y); on=true; } else fx.lineTo(X,y); } else on=false; } fx.stroke(); };
    fx.strokeStyle=ink; fx.lineWidth=0.9*hp;
    trace(G.Tl,(X,y)=>X<G.xq&&y>G.S(X)+0.5&&y<G.D(X)&&y<G.K(X)); trace(G.Bl,(X,y)=>X<G.xq&&y<G.D(X)&&y<G.K(X)); trace(G.D,(X,y)=>y<G.K(X)&&!(y>=G.Tl(X)&&y<G.Bl(X))); trace(G.K,(X,y)=>y<Hu);
    /* trees: ring outline from the union of circles, trunk lines */
    for(const t of bg.trees(G)){ const tp=(x0,y0,x1,y1,w0,w1)=>{ const dx=x1-x0, dy=y1-y0, l=Math.hypot(dx,dy)||1, nx=-dy/l, ny=dx/l; fx.moveTo(x0+nx*w0,y0+ny*w0); fx.lineTo(x1+nx*w1,y1+ny*w1); fx.lineTo(x1-nx*w1,y1-ny*w1); fx.lineTo(x0-nx*w0,y0-ny*w0); fx.closePath(); };
      fx.beginPath(); tp(t.x,t.base+0.5,t.fx,t.fy,t.w0,t.w0*0.72); for(const [bx,by] of t.br)tp(t.fx,t.fy,bx,by,t.w0*0.5,t.w0*0.2); fx.strokeStyle=ink; fx.lineWidth=1.8*hp; fx.stroke(); fx.fillStyle=gnd; fx.fill();
      fx.beginPath(); for(const [bx,by,br] of t.lobes){ fx.moveTo(bx+br,by); fx.arc(bx,by,br,0,6.2832); } fx.lineWidth=2.2*hp; fx.stroke(); fx.fillStyle=gnd; fx.fill();
      fx.lineWidth=0.7*hp; fx.beginPath(); for(const [bx,by,br] of t.lobes){ if(by>t.cy+0.2*t.r)continue; fx.moveTo(bx+br*0.6*Math.cos(3.5),by+br*0.6*Math.sin(3.5)); fx.arc(bx,by,br*0.6,3.5,4.8); } fx.stroke(); }
    /* ground line: the cut edge, heavier */
    fx.strokeStyle=ink; fx.lineWidth=1.6*hp; fx.beginPath(); fx.moveTo(0,G.S(0)); for(let X=1;X<=1000;X+=1)fx.lineTo(X,G.S(X)); fx.stroke();
    /* grass tufts and flowers */
    fx.lineWidth=0.8*hp; fx.beginPath(); for(const t of bg.tufts(G)){ const [nx,ny]=t.n; for(const a of [-0.42,0,0.42]){ const dx=nx*0.5+Math.sin(a)*0.9, dy=ny*0.5-Math.cos(a)*0.9; const l=Math.hypot(dx,dy); const h=t.h*(a===0?1:0.75); fx.moveTo(t.x,t.s-0.3); fx.lineTo(t.x+dx/l*h,t.s-0.3+dy/l*h); } } fx.stroke();
    for(const f of bg.flowers(G)){ const tx=f.x+f.lean*(f.base-f.top), ty=f.top; fx.lineWidth=0.75*hp; fx.beginPath(); fx.moveTo(f.x,G.S(f.x)); fx.lineTo(tx,ty); fx.stroke();
      if(f.type==='iris'){ const s=f.size*0.9; fx.beginPath(); for(const a of [-1.57,2.4,0.74]){ fx.moveTo(tx,ty); fx.ellipse(tx+Math.cos(a)*s*0.55,ty+Math.sin(a)*s*0.55,s*0.55,s*0.28,a,Math.PI,Math.PI*3); } fx.fillStyle=gnd; fx.fill(); fx.stroke(); }
      else if(f.type==='white'){ fx.beginPath(); fx.arc(tx,ty,f.size*0.9,0,6.2832); fx.fillStyle=gnd; fx.fill(); fx.stroke(); }
      else { fx.beginPath(); fx.arc(tx,ty,f.size*0.75,0,6.2832); fx.fillStyle=ink; fx.fill(); } }
    fx.restore();
    L.under=under; L.front=front; },
  /* compose at time t (seconds): under, the wave strokes clipped to the water, front */
  compose(x,L,t){ const G=L.G, u=L.u, V=L.V; x.drawImage(L.under,0,0); x.save(); x.setTransform(u,0,0,u,0,0); this.waterPath(x,G); x.clip();
    const strokesHi=[], strokesMid=[];
    for(const s of L.strokes){ const len=s.len*(1+0.08*Math.sin(0.6*t+s.ph)), per=s.xr+2*len; let cx=((s.x+s.v*t+len)%per+per)%per-len; const cy=s.y+0.35*Math.sin(0.8*t+s.ph); const fade=Math.max(0,Math.min(1,(s.xr-cx)/14)); if(fade<=0.02)continue; (s.hi?strokesHi:strokesMid).push([cx,cy,len,s.th,s.arch,fade]); }
    if(L.line){ x.strokeStyle=L.sg.inkWater; x.lineWidth=0.85/u; x.lineCap='round'; for(const [cx,cy,len,th,arch,fade] of strokesHi.concat(strokesMid)){ x.globalAlpha=0.75*fade; x.beginPath(); x.moveTo(cx-len*0.4,cy); x.lineTo(cx+len*0.4,cy); x.stroke(); } x.globalAlpha=1; }
    else { const dash=(cx,cy,len,th,arch)=>{ x.moveTo(cx-len/2,cy); x.quadraticCurveTo(cx,cy-th*0.6-arch,cx+len/2,cy+th*0.15); x.quadraticCurveTo(cx,cy+th*0.4-arch*0.6,cx-len/2,cy); };
      for(const [list,col,al] of [[strokesMid,V.waterMid,0.75],[strokesHi,V.waterHi,0.95]]){ for(const [cx,cy,len,th,arch,fade] of list){ x.globalAlpha=al*fade; x.beginPath(); dash(cx,cy,len,th,arch); x.fillStyle=col; x.fill(); } } x.globalAlpha=1; }
    x.restore(); x.drawImage(L.front,0,0); },
  render(canvas,w,h,dpr,V,done,O){ const L=this.layers(canvas.width,canvas.height,V,O); const x=canvas.getContext('2d'); x.save(); x.setTransform(1,0,0,1,0,0); this.compose(x,L,0); x.restore(); if(done)done(); },
  motion(canvas,w,h,dpr,V,t,ctx,UO){ const L=this.layers(canvas.width,canvas.height,V,UO); ctx.save(); ctx.setTransform(1,0,0,1,0,0); this.compose(ctx,L,t); ctx.restore(); },
  onPoints(P){ this._pts=P; },
  /* points follow the geometry: the bank face, the riverbed, the wedge, the clay, the soil, a root tip, an iris and the largest tree */
  relayPoints(O){ const Pp=this._pts; if(!Pp)return; try{ const A=window.ART, P=A.params(this.spec,O), G=this.geom(P), Hu=1000*this.ref.h/this.ref.w; const set=(i,x,y)=>{ if(Pp[i]&&isFinite(x)&&isFinite(y)){ Pp[i].u=Math.max(0.01,Math.min(0.99,x/1000)); Pp[i].v=Math.max(0.01,Math.min(0.99,y/Hu)); } };
      const fy=Math.min(G.yw+20,(G.yw+G.S(G.toe))/2); let fx=G.toe; while(fx<G.crest[0]&&G.S(fx)>fy)fx+=0.5; set(2,fx+3,fy+3);
      set(1,Math.min(200,G.xs*0.45),(G.yw+G.S(Math.min(200,G.xs*0.45)))/2);
      set(3,Math.min(120,G.xs*0.3),G.S(Math.min(120,G.xs*0.3))+8);
      const wx=Math.min(520,G.xq-30), wt=G.Tl(wx), wb=Math.min(G.Bl(wx),G.D(wx),G.K(wx)); set(4,wx,(wt+wb)/2);
      set(5,300,(G.K(300)+Hu)/2);
      set(6,820,Math.max(G.S(820)+20,Math.min(G.D(820),G.K(820))-18));
      const roots=this.techniques['root-growth'](P['root-growth'],1,A).grow(G); let tip=null; for(const R of roots){ const e=R.pts[R.pts.length-1]; if(R.gen===0&&e[0]>800&&(!tip||e[1]>tip[1]))tip=e; }
      if(tip)set(7,tip[0],tip[1]); else set(7,850,G.S(850)+12);
      const bg=this.techniques['bank-garden'](P['bank-garden'],1,A,this.variants[0]); const fls=bg.flowers(G), irs=fls.filter(f=>f.type==='iris').sort((a,b)=>Math.abs(a.x-580)-Math.abs(b.x-580)), fl=irs[0]||fls[0]; if(fl)set(8,fl.x+fl.lean*(fl.base-fl.top),fl.top); else set(8,G.dry0+60,G.S(G.dry0+60)-P['bank-garden'].grass_u*0.6);
      const tr=bg.trees(G)[0]; if(tr)set(9,tr.x,tr.cy); else set(9,880,G.S(880)-P['bank-garden'].grass_u*0.7);
    }catch(e){} }
};
