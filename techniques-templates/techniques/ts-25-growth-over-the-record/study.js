window.STUDY={
  id:'ts-25-growth-over-the-record', code:'TS-25', fig:'1.25',
  title:'Growth over the record',
  kicker:'Technique · TS-25',
  lede:'One hill, half grass and half riverbed blue, laid in one fine grain.',
  body:['The hill silhouette (crest 610 u across, 166 u down) and the front swell are traced from the reference. A boundary at 25.5° with a level cap at 225 u splits the hill: 40 % of the land is riverbed blue, the rest is grass, and the two meet over a 50 u grain dissolve with the grass darkening into it. A grass patch is always held under each trunk.',
    'Every surface is one stochastic screen: a 1.3 u grain picks one of five or six inks per pixel from a tone set by the sun angle, the depth below the silhouette and a 16 u rim light. The grass tufts (12 u blades in front, smaller up the hill), the leafy flower clumps and the tree (16 lobes of leaf clusters on a forked trunk) are drawn as tones and screened by the same grain.'],
  motionHint:'Play sends wind across the grass: the fine blades lean and a lighter gust band travels across. The blue does not move.',
  source:'Reference 25 · Mindgut deck, a hill half grass and half riverbed blue, 1556 × 804',
  spot:[11,94,190], ref:{w:1556,h:804},
  variantLabel:'Season',
  variants:[
    { id:'ref', label:'High summer', sw:['#FBFBF7','#C8E546','#5BA83F','#0B5EBE','#147143'], spot:[11,94,190], sky:'#FBFBF7', haze:'#B4E0CC',
      grass:['#167530','#2F8A3C','#5BA83F','#A3D339','#C8E546','#E8F46E'], blue:['#0142A4','#0450B1','#0B5EBE','#1770CE','#2E8CE4'],
      leaf:['#084F2E','#147143','#2A8426','#4BA244','#82C64B','#BEEC6C'], bark:['#262B24','#3B4539','#645F46','#8B7C4F'], petal:'#CDB4EC', eye:'#F4E9A0', bloom:'#F2DC2C' },
    { id:'spring', label:'Spring', sw:['#FFFFFF','#DCF07A','#92CF45','#3474D6','#5BB040'], spot:[52,116,214], sky:'#FFFFFF', haze:'#C8EADA',
      grass:['#2E8A3A','#5BB040','#92CF45','#BFE357','#DCF07A','#F2FAB0'], blue:['#1A4FB8','#2461C8','#3474D6','#4C8DE2','#78ABEC'],
      leaf:['#1E6B3A','#2E8A3A','#5BB040','#7DC24A','#B4E05E','#E2F59A'], bark:['#2E332B','#454D40','#6E6A50','#978A5E'], petal:'#E6CCF4', eye:'#FFF6C0', bloom:'#FFE84A' },
    { id:'evening', label:'Evening', sw:['#FBFBF7','#79A93A','#1C6B35','#183586','#0A3D22'], spot:[24,53,134], sky:'#FBFBF7', haze:'#B9D0D3',
      grass:['#0A3D22','#125130','#1C6B35','#3E8A34','#79A93A','#B3C860'], blue:['#0E1F5C','#152B72','#183586','#22449A','#3A5DB0'],
      leaf:['#062E1A','#0A3D22','#125130','#1C6B35','#3E8A34','#86A94A'], bark:['#151B17','#262B24','#3B4539','#5C5A44'], petal:'#B9A6DA', eye:'#E8DC9A', bloom:'#E2C83A' },
    { id:'mindgut', label:'Mindgut', sw:['#FBFBF7','#D0EC60','#126B3D','#183586','#0A4528'], spot:[24,53,134], sky:'#FBFBF7', haze:'#BCDDDA',
      grass:['#0A4528','#126B3D','#3E8F45','#7DB451','#AED45A','#D0EC60'], blue:['#0F2363','#183586','#244A9E','#3A63B4','#5B82C8'],
      leaf:['#0A4528','#0E5833','#126B3D','#3E8F45','#8DC155','#D0EC60'], bark:['#151B17','#2B302B','#4A4A3C','#6B6750'], petal:'#E8ECF6', eye:'#D0EC60', bloom:'#D0EC60' },
    { id:'io', label:'Ø', sw:['#FFFFFF','#F4551E','#2F5AE6','#101014'], spot:[244,85,30], sky:'#FFFFFF', haze:'#EEF1FC',
      grass:['#B3441C','#D84D1D','#F4551E','#F77A4B','#FAA07E','#FDD3C2'], blue:['#223C92','#2A4DBE','#2F5AE6','#5E7EEB','#97ACF2'],
      leaf:['#101014','#7A2E17','#D84D1D','#F4551E','#F77A4B','#FAA07E'], bark:['#101014','#1C2147','#2F5AE6','#6F8CEE'], petal:'#FFFFFF', eye:'#101014', bloom:'#2F5AE6' }
  ],
  points:[
    {u:0.12,v:0.10,d:'SKY',label:'Sky · Paper, 1.2 % grain, no tint',t:'paper-sky',dir:[-1,-1]},
    {u:0.82,v:0.31,d:'HILL',label:'Hills behind · six, hazed 62 % by depth',t:'hills-behind',dir:[1,-1]},
    {u:0.61,v:0.34,d:'FORM',label:'Crest · traced silhouette, 166 u below the top',t:'hill-form',dir:[1,-1]},
    {u:0.48,v:0.17,d:'CRWN',label:'Crown · 239 u wide, 16 lobes of leaf clusters',t:'tree-crown',dir:[-1,-1]},
    {u:0.48,v:0.43,d:'ROOT',label:'Root patch · grass held under the trunk',t:'riverbed-boundary',dir:[-1,0]},
    {u:0.47,v:0.63,d:'EDGE',label:'Boundary · 25.5°, 50 u grain dissolve',t:'riverbed-boundary',dir:[-1,1]},
    {u:0.70,v:0.76,d:'RIVR',label:'Riverbed · 40 % of the land, five blues',t:'stipple-grain',dir:[1,1]},
    {u:0.22,v:0.54,d:'RIM',label:'Rim light · 16 u band on the sunlit flank',t:'hill-light',dir:[-1,-1]},
    {u:0.30,v:0.92,d:'TUFT',label:'Tufts · 12 u blades in front, smaller uphill',t:'grass-tufts',dir:[1,1]},
    {u:0.09,v:0.86,d:'FLWR',label:'Wildflowers · 60 heads on leafy clumps',t:'wildflowers',dir:[-1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1556,804], grammar:'one rolling hill in front of paler hills; its left side grass, its right flank a deep ultramarine laid in the same grain; a round tree on the crest, grass tufts and flower clumps in front; every surface a fine stipple, no flat fills' },
    units:'design units, 1000 = plate width; the plate is 1000 × 516.7',
    palette:{ sky:'#FBFBF7 (Paper; the reference sky is a warm cream, not copied)', grass:['#167530','#2F8A3C','#5BA83F','#A3D339','#C8E546','#E8F46E'], blue:['#0142A4','#0450B1','#0B5EBE','#1770CE','#2E8CE4'], haze:'#B4E0CC', leaf:['#084F2E','#147143','#2A8426','#4BA244','#82C64B','#BEEC6C'], bark:['#262B24','#3B4539','#645F46','#8B7C4F'] },
    techniques:[
      { id:'paper-sky', short:'SKY', name:'Paper sky', layer:0, pass:0, atoms:['ground','grain','stock'],
        params:{ grain_amp:0.012, seed:251 },
        limits:'Above about 3 % the sky grain reads as dirt next to the hazed hills.',
        implementation:'Paper multiplied by 1 + 0.012 × a signed hash per device pixel, so the sky is never a flat fill.' },
      { id:'hills-behind', short:'HILL', name:'Hills behind', layer:1, pass:1, atoms:['silhouette','aerial-perspective','haze'],
        params:{ count:{ value:6, range:[0,8], step:1, label:'Hills behind', note:'how many measured hills stand behind the main hill, most prominent first' },
          haze_pct:{ value:62, range:[25,85], step:1, unit:'%', label:'Haze', note:'how far the farthest row is mixed toward the haze ink; nearer rows take less' },
          mist:0.3, mist_from_u:50, mist_to_u:140,
          hills:[
            { id:'R1', depth:1.15, pts:[[580,232],[610.5,212.1],[709.5,170.3],[771.2,149.1],[817.5,142],[863.8,148.5],[925.4,167.7],[971.7,178.7],[1040,196]] },
            { id:'L1', depth:1, pts:[[-60,282],[0,250],[61.7,225.6],[123.4,197.3],[200.5,180.6],[277.6,194.1],[354.8,212.7],[417.7,234.6],[488.4,263.5],[560,300]] },
            { id:'Rm', depth:0.85, pts:[[740,330],[784.1,302.1],[835.5,273.1],[886.9,260.3],[931.9,253.9],[976.9,244.2],[1000,236],[1060,226]] },
            { id:'Lm', depth:0.72, pts:[[-60,316],[25.7,297.6],[70.7,300.8],[115.7,316.2],[167.1,340.6],[220,372]] },
            { id:'R0', depth:1.2, pts:[[880,210],[925.4,192.8],[983.3,177.4],[1041.1,172.2]] },
            { id:'Rl', depth:0.72, pts:[[800,392],[854.8,359.9],[912.6,324.6],[964,307.2],[1040,302]] },
            { id:'X1', depth:1.3, pts:[[760,186],[803.3,167.1],[899.7,126],[951.2,119.5],[1040,134]] },
            { id:'X2', depth:1.22, pts:[[-60,222],[38.6,192.8],[102.8,168.4],[154.2,160.7],[231.4,172.2],[295.6,192.8],[360,220]] } ] },
        limits:'Haze under 25 % brings the back hills to the grass inks and they flatten against the main hill; above 85 % the farthest rows vanish into the sky.',
        implementation:'Each hill is a measured monotone-cubic silhouette, screened from the four darker grass inks, darkened over its first 70 u and mixed toward the haze ink by haze × its depth, plus up to 30 % mist from 50 u to 140 u below its top.' },
      { id:'hill-form', short:'FORM', name:'Measured hill and front swell', layer:2, pass:2, atoms:['silhouette','landform','monotone-cubic'],
        params:{ main_u:[[-40,405],[0,385.6],[51.4,359.9],[96.4,340.6],[141.4,309.1],[192.8,277],[257.1,244.9],[321.3,222.4],[359.9,211.4],[411.3,204.4],[462.7,195.4],[514.1,182.5],[565.6,170.3],[610.5,166.5],[642.7,169],[674.8,174.8],[706.9,186.4],[739.1,204.4],[771.2,223.7],[803.3,249.4],[835.5,273.8],[867.6,295.6],[899.7,318.1],[931.9,336.1],[964,352.2],[1000,366.3],[1040,380]],
          front_u:[[-40,498],[-19.3,494.9],[77.1,480.7],[160.7,457.6],[212.1,442.2],[289.2,448.6],[385.6,453.7],[482,460.2],[555.3,465.3],[610.5,457.6],[642.7,449.9],[706.9,429.3],[758.4,414.5],[803.3,407.5],[848.3,411.3],[899.7,425.4],[951.2,438.3],[1000,446],[1040,451]] },
        limits:'The silhouettes are data, not dials: moving the crest under the tree would leave the trunk floating.',
        implementation:'Sky-boundary and blue-edge scans of the reference every 8 px, simplified to 27 and 19 points and joined by a monotone cubic (no overshoot, flat at the crest).' },
      { id:'riverbed-boundary', short:'EDGE', name:'Riverbed boundary', layer:2, pass:2, atoms:['boundary','dissolve','stochastic-threshold','area-solve'],
        params:{ share_pct:{ value:40, range:[18,55], step:1, unit:'%', label:'Riverbed share', note:'blue as a share of all land below the main silhouette, solved for exactly' },
          angle_deg:{ value:25.5, range:[0,50], step:0.5, unit:'°', label:'Boundary angle', note:'how steeply the grass edge climbs to the right; 0 is a level water line' },
          soft_u:{ value:50, range:[12,110], unit:'u', scale:'linear', label:'Boundary softness', note:'width over which blue coverage rises from 0 to 1; the grain decides each pixel inside it' },
          wobble_u:{ value:8, range:[0,50], step:0.5, unit:'u', label:'Boundary wobble', note:'how far the boundary line meanders either side of its course, before the dissolve' },
          anchor_u:[467.2,321.3], level_u:225, knee_u:20, seed:73 },
        limits:'Above 55 % the blue drapes over the crest and the tree stands on its own patch; under 18 % it is a sliver under the front swell. Softness above about 110 u turns the hill teal from end to end. Wobble past 50 u bulges the edge into the crest.',
        implementation:'A line at the boundary angle through the measured anchor, smooth-maxed with a level cap at 225 u and meandered across its course by noise whose wavelength grows with the wobble (60 u + 3.2 × wobble, so it never folds), is shifted vertically until the blue area is the share of the land (a quantile of the signed distances on a 4 u grid); a pixel is blue when its coverage smoothstep beats its own grain value.' },
      { id:'hill-light', short:'LITE', name:'Side light and rim', layer:3, pass:3, atoms:['lambert','rim-light','depth-falloff'],
        params:{ sun_deg:{ value:-50, range:[-75,75], step:1, unit:'°', label:'Sun from', note:'negative lights the left flank, positive the right; 0 is overhead' },
          rim_u:{ value:16, range:[0,40], step:0.5, unit:'u', label:'Rim light', note:'width of the light band just under each silhouette' },
          face:0.62, turn_u:70,
          mat:{ grass:[0.10,0.78,0.40,0.34,240,0.25], front:[0.0,0.46,0.6,0.08,60,0.3], blue:[0.09,0.55,0.75,0.30,170,0.85], hill:[0.2,0.55,0.30,0.2,70,0.4], note:'base, gain, rim gain, depth darkening, depth span u, sky share of the rim' } },
        limits:'Past ±75° the light comes from behind the hill and both flanks go flat.',
        implementation:'At each column the silhouette normal (slope, −1) is dotted with the sun vector; below the edge the normal turns toward the viewer over 70 u, a rim term decays over rim width, and depth darkens the lower hill.' },
      { id:'stipple-grain', short:'GRAN', name:'Stipple grain and riverbed mark', layer:4, pass:4, atoms:['stochastic-screen','value-noise','anisotropic-noise','dither'],
        params:{ grain_u:{ value:1.3, range:[0.7,1.6], step:0.05, unit:'u', label:'Grain size', note:'cell of the value noise that picks each pixel’s ink' },
          mark:{ value:1, options:[{v:1,label:'Stipple'},{v:2,label:'Current'}], label:'Riverbed mark', note:'Stipple lays the blue like the grass; Current lays it in flow strokes along the boundary' },
          spread:0.72, lean_var_deg:20, streak_u:3.5, current:{ length_u:34, width_u:2.1, meander_u:7, gain:1.7, lift:0.07 }, seed:1556 },
        limits:'Below 0.7 u the grain is finer than a screen pixel at 900 px; above 1.6 u it clumps into blots. Current strokes narrower than about 2 u vanish at page size.',
        implementation:'Value noise on a lattice rotated 27°, mixed with per-pixel white noise, offsets each pixel’s tone before it picks one discrete ink; grass adds 3.5 u streaks traced from its bright specks. Current is a second value noise stretched 34 u along the boundary and 2.1 u across it, meandering 7 u, added to the blue only.' },
      { id:'grass-tufts', short:'TUFT', name:'Grass tufts', layer:4, pass:4, atoms:['blade','tuft','perspective','tone-layer'],
        params:{ blade_u:{ value:12, range:[4,24], unit:'u', scale:'linear', label:'Blade length', note:'height of a tuft in the foreground; tufts higher up the hill are drawn smaller' },
          count:420, dark_share:0.6, seed:47 },
        limits:'Above about 24 u the front tufts cover the swell and read as reeds; at 2 u they sink into the grain and the grass reads as plain stipple.',
        implementation:'420 tufts of three to seven curved, tapering blades, placed on grass only and denser toward the front; each blade is a dark or light tone in the shared tone layer and the grain screens it like the rest of the grass.' },
      { id:'tree-crown', short:'CRWN', name:'Tree of leaf clusters', layer:5, pass:5, atoms:['leaf-cluster','lobe','soft-edge','tone-layer'],
        params:{ tree:{ value:2, options:[{v:1,label:'None'},{v:2,label:'One tree'},{v:3,label:'Grove'}], label:'Tree', note:'what stands on the crest' },
          crown_u:{ value:239, range:[80,270], step:1, unit:'u', when:{ path:'tree', is:[2,3] }, label:'Crown size', note:'width of the main crown (measured 239 u); past that it sinks down its trunk to stay inside the plate; the grove scales with it' },
          base_x_u:479.4, base_depth:0.2, root_patch:[0.6,0.32,200],
          lobes:[[0,1.46,0.33],[-0.34,1.38,0.31],[0.36,1.36,0.31],[-0.62,1.14,0.33],[0.64,1.1,0.33],[-0.18,1.2,0.37],[0.22,1.22,0.35],[-0.79,0.87,0.27],[0.8,0.85,0.27],[-0.42,0.95,0.33],[0.44,0.93,0.33],[0.02,1.0,0.33],[-0.6,0.7,0.24],[0.62,0.68,0.24],[-0.31,0.74,0.23],[0.34,0.73,0.23]],
          fork:[[-0.4,1.0,0.085],[0.36,1.08,0.08],[0.04,1.34,0.055]], twigs:[[0,-0.78,0.9],[1,0.78,0.88],[0,-0.62,1.22],[1,0.6,1.2]],
          grove:[[0,1],[-0.95,0.62],[0.9,0.7],[-1.7,0.46],[1.65,0.52]], seed:9 },
        limits:'Above 270 u the crown would have to sink past its fork to stay inside the plate; under 80 u the leaf clusters merge into one lump.',
        implementation:'A trunk 0.12 R wide forks at 0.46 R into three limbs. Sixteen lobes, drawn top and outside first, are each filled with about 70 five-leaflet clusters shaded as a small sphere lit from the sun side, scaled by the whole crown’s shading; clusters on the crown’s rim go down at partial coverage so the grain gives a soft edge.' },
      { id:'wildflowers', short:'FLWR', name:'Wildflowers', layer:6, pass:6, atoms:['clump','flower-head','perspective'],
        params:{ count:{ value:60, range:[0,240], step:1, label:'Wildflowers', note:'flower heads, on leafy clumps on grass only, smaller higher up the hill' }, lilac_share:0.6, seed:31 },
        limits:'Past about 240 heads the clumps join into a meadow band and stop reading as separate plants.',
        implementation:'Clumps of six to nine blades with three to seven heads about 5 u across, at least 3.6 u apart, on stems 6–19 u tall; leaves and stems go into the tone layer, the heads are pixel-quantized lilac or yellow petals drawn last. A head on blue or on a tree is skipped.' }
    ],
    pass_order:['sky · Paper with per-pixel grain','hills behind · measured silhouettes, hazed by depth','form · main hill and front swell, traced','boundary · blue share solved, dissolve by grain','light · sun normal, rim, depth','tone layer · tufts, flower clumps, forked trunk and leaf lobes','grain · one ink per pixel from tone + grain; current strokes in the blue','flowers · petal heads on top'],
    notes:['Measured on the 1556 × 804 original: sky (249,246,236) on 30 % of pixels; blue on 19 %, five clusters from (1,66,164) to (46,140,228); blue / land 0.40; grass clusters (22,117,48) to (228,245,103); foreground grass mean #4EA040.','Boundary: blue left edge from (324,680) to (1066,360) px, 25.5° through its middle, flattening at y ≈ 350 px before it meets the silhouette at x = 1216 px; color unmixing across it gives a 10–90 % width of about 74 px.','Grain: autocorrelation drops to 0.3–0.43 at 1 px and below 0 at 2 px, so the cell is about 2 px (1.3 u); in grass the vertical lag-1 correlation is 0.57 against 0.30 across, the blades.','Tree: crown 372 × 268 px, centered at x = 744, widest 155 px above the base; trunk 22 px wide, base 38 px below the silhouette. Flowers: about 60 heads in ten leafy clumps, lilac and yellow; front tufts 20–40 px tall.']
  },
  techniques:{
    'paper-sky':(P,u,A,V)=>{ const k=A.hex(V.sky); return { k, amp:P.grain_amp, seed:P.seed }; },
    /* monotone cubic through measured points → f(x) = [y, dy/dx] in u */
    'hill-form':(P,u,A)=>{ const mono=pts=>{ const n=pts.length, X=pts.map(p=>p[0]), Y=pts.map(p=>p[1]), d=[], m=new Array(n);
        for(let i=0;i<n-1;i++)d[i]=(Y[i+1]-Y[i])/(X[i+1]-X[i]); m[0]=d[0]; m[n-1]=d[n-2]; for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
        for(let i=0;i<n-1;i++){ if(d[i]===0){ m[i]=m[i+1]=0; continue; } const a=m[i]/d[i], b=m[i+1]/d[i], s=a*a+b*b; if(s>9){ const t=3/Math.sqrt(s); m[i]=t*a*d[i]; m[i+1]=t*b*d[i]; } }
        return x=>{ if(x<=X[0])return [Y[0]+m[0]*(x-X[0]),m[0]]; if(x>=X[n-1])return [Y[n-1]+m[n-1]*(x-X[n-1]),m[n-1]]; let lo=0, hi=n-1; while(hi-lo>1){ const k=(lo+hi)>>1; if(X[k]>x)hi=k; else lo=k; }
          const h=X[hi]-X[lo], t=(x-X[lo])/h, t2=t*t, t3=t2*t; return [(2*t3-3*t2+1)*Y[lo]+(t3-2*t2+t)*h*m[lo]+(-2*t3+3*t2)*Y[hi]+(t3-t2)*h*m[hi], ((6*t2-6*t)*Y[lo]+(3*t2-4*t+1)*h*m[lo]+(6*t-6*t2)*Y[hi]+(3*t2-2*t)*h*m[hi])/h]; }; };
      return { mono, main:mono(P.main_u), front:mono(P.front_u) }; },
    'hills-behind':(P,u,A)=>{ const mono=pts=>{ const n=pts.length, X=pts.map(p=>p[0]), Y=pts.map(p=>p[1]), d=[], m=new Array(n);
        for(let i=0;i<n-1;i++)d[i]=(Y[i+1]-Y[i])/(X[i+1]-X[i]); m[0]=d[0]; m[n-1]=d[n-2]; for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
        return x=>{ if(x<=X[0])return [Y[0]+m[0]*(x-X[0]),m[0]]; if(x>=X[n-1])return [Y[n-1]+m[n-1]*(x-X[n-1]),m[n-1]]; let lo=0, hi=n-1; while(hi-lo>1){ const k=(lo+hi)>>1; if(X[k]>x)hi=k; else lo=k; }
          const h=X[hi]-X[lo], t=(x-X[lo])/h, t2=t*t, t3=t2*t; return [(2*t3-3*t2+1)*Y[lo]+(t3-2*t2+t)*h*m[lo]+(-2*t3+3*t2)*Y[hi]+(t3-t2)*h*m[hi], ((6*t2-6*t)*Y[lo]+(3*t2-4*t+1)*h*m[lo]+(6*t-6*t2)*Y[hi]+(3*t2-2*t)*h*m[hi])/h]; }; };
      const list=P.hills.slice(0,Math.max(0,Math.round(P.count))).map(h=>({ id:h.id, depth:h.depth, f:mono(h.pts), x0:h.pts[0][0], x1:h.pts[h.pts.length-1][0] })).sort((a,b)=>b.depth-a.depth);   /* far first */
      return { list, haze:(depth,d)=>Math.min(0.94,P.haze_pct/100*depth+P.mist*A.sstep(P.mist_from_u,P.mist_to_u,d)) }; },
    /* sd0(x,y,dl,patches): signed distance into the blue in u (> 0 blue), before grain; solve(): the vertical shift dl that gives share_pct */
    'riverbed-boundary':(P,u,A)=>{ const th=P.angle_deg*Math.PI/180, tn=Math.tan(th), cs=Math.cos(th), k=P.knee_u, ax=P.anchor_u[0], ay=P.anchor_u[1], lv=P.level_u;
      /* wobble: a meander along the line's course (a = distance along it), pushed across it before the dissolve; tabled per 1 u */
      const pn=A.perlin(P.seed), sn=Math.sin(th), lw=60+3.2*P.wobble_u, WT=new Float32Array(2201); for(let i=0;i<=2200;i++){ const a=i-800; WT[i]=P.wobble_u>0?P.wobble_u*1.5*(0.85*pn(a/lw+0.5,3.7)+0.15*pn(a/(lw*0.37)+0.5,11.3)):0; }
      const wobAt=(x,y)=>{ let i=(x*cs-y*sn+800)|0; i=i<0?0:i>2200?2200:i; return WT[i]; };
      const yb=x=>{ const a=ay-tn*(x-ax), b=lv; return (a+b+Math.sqrt((a-b)*(a-b)+k*k))/2; };
      const sd0=(x,y,dl,pt)=>{ let s=(y-yb(x)-dl)*cs-wobAt(x,y); for(let i=0;i<pt.length;i++){ const p=pt[i], qx=(x-p.x)/p.rx, qy=(y-p.y)/p.ry, q=qx*qx+qy*qy; if(q<7)s-=p.k*Math.exp(-q); } return s; };
      const solve=(main,front,pt,Hu)=>{ const bs=[]; let land=0; for(let x=2;x<1000;x+=4){ const t=main(x)[0], f=front(x)[0]; for(let y=Math.max(t+1,2);y<Hu;y+=4){ land++; if(y<f)bs.push(sd0(x,y,0,pt)); } }
        /* blue iff base − dl·cs > 0, so the share is a quantile of the bases: no search needed */
        const b=Float64Array.from(bs).sort(), n=b.length, want=Math.round(P.share_pct/100*land); if(want<=0)return 900; if(want>=n)return Math.max(-900,b[0]/cs-1); return Math.max(-900,Math.min(900,(b[n-want-1]+b[n-want])/2/cs)); };
      return { yb, sd0, solve, wobAt, soft:Math.max(0.5,P.soft_u), wmax:0, cs, seed:P.seed, angle:th }; },
    /* lam2(slope): silhouette normal · sun; tone(mat, lam2, d): 0..1 */
    'hill-light':(P,u,A)=>{ const a=P.sun_deg*Math.PI/180, Lx=Math.sin(a), Ly=-Math.cos(a), face=P.face, turn=P.turn_u, rimW=P.rim_u;
      const lam2=s=>(s*Lx-Ly)/Math.sqrt(s*s+1);
      const tone=(m,l2,d)=>{ const lam=face+(l2-face)*Math.exp(-d/turn); const rim=rimW>0?Math.exp(-d/rimW)*(m[5]+(1-m[5])*Math.max(0,l2)):0; const t=Math.min(1,Math.max(0,d/m[4])); return m[0]+m[1]*lam+m[2]*rim-m[3]*t*t*(3-2*t); };
      return { Lx, Ly, lam2, tone, mat:P.mat, face, turn, rimW }; },
    'stipple-grain':(P,u,A)=>{ const hs=(x,y,s)=>{ let n=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1274126177))|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296; };
      const unit=out=>{ let s=0, s2=0, n=0; for(let i=0;i<out.length;i+=97){ s+=out[i]; s2+=out[i]*out[i]; n++; } const m=s/n, k=1/Math.sqrt(Math.max(1e-6,s2/n-m*m)); for(let i=0;i<out.length;i++)out[i]=(out[i]-m)*k; return out; };
      /* value noise on a lattice; X = a·x + b·y, Y = c·x + d·y in lattice cells (any affine frame) */
      const lattice=(W,H,a,b,c,d,S0,warp)=>{ const xs=[0,W*a,H*b,W*a+H*b], ys=[0,W*c,H*d,W*c+H*d], i0=Math.floor(Math.min(...xs))-40, j0=Math.floor(Math.min(...ys))-40, nx=Math.ceil(Math.max(...xs))-i0+80, ny=Math.ceil(Math.max(...ys))-j0+80, L=new Float32Array(nx*ny), out=new Float32Array(W*H);
        for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)L[j*nx+i]=hs(i+i0,j+j0,S0);
        for(let y=0;y<H;y++){ const r=y*W, wy=warp?warp.row(y):null; for(let x=0;x<W;x++){ const X=x*a+y*b-i0, Y=x*c+y*d-j0+(wy?wy[x>>3]:0), i=X|0, j=Y|0; let fx=X-i, fy=Y-j; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy); const q=j*nx+i;
          const v0=L[q], v1=L[q+1], v2=L[q+nx], v3=L[q+nx+1]; out[r+x]=v0+(v1-v0)*fx+(v2-v0+(v0-v1-v2+v3)*fx)*fy; } }
        return out; };
      /* grain field: lattice rotated 27°, cell = grain_u, plus white noise; unit std */
      const field=(W,H)=>{ const c=Math.max(0.6,P.grain_u*u), ic=1/c, ca=0.891, sa=0.454, out=lattice(W,H,ca*ic,sa*ic,-sa*ic,ca*ic,P.seed,null);
        for(let y=0;y<H;y++){ const r=y*W; for(let x=0;x<W;x++)out[r+x]=(out[r+x]-0.5)*4.2+(hs(x,y,P.seed+7)-0.5)*1.25; } return unit(out); };
      /* current: value noise stretched along the flow direction th (rad, screen), meandering; unit std */
      const flow=(W,H,th,pn)=>{ const C=P.current, la=1/(C.length_u*u), wa=1/(C.width_u*u), dx=Math.cos(th), dy=Math.sin(th), mu=C.meander_u*u*wa, sc=1/(90*u);
        const warp={ row:y=>{ const n=Math.ceil(W/8)+1, o=new Float32Array(n); for(let k=0;k<n;k++)o[k]=mu*pn(k*8*sc+3.1,y*sc+7.7); return o; } };
        return unit(lattice(W,H,dx*la,dy*la,-dy*wa,dx*wa,P.seed+101,warp)); };
      /* fine blade streaks: each bright (or dark) speck adds a tapering streak above it along dirAt(x,y) (rad, per 8-px block) */
      const streak=(g,W,H,len,dirAt,shift)=>{ const n=Math.max(1,Math.round(len)), bw=Math.ceil(W/8), bh=Math.ceil(H/8), N=W*H, out=new Float32Array(N), OF=new Int32Array(bw*bh*n), w=new Float32Array(n); let ws=0;
        for(let k=0;k<n;k++){ w[k]=1-k/(n+1); ws+=w[k]; } for(let k=0;k<n;k++)w[k]/=ws*0.16;
        for(let by=0;by<bh;by++)for(let bx=0;bx<bw;bx++){ const a=dirAt(bx*8+4,by*8+4), dx=Math.sin(a), dy=-Math.cos(a), o=(by*bw+bx)*n; for(let k=0;k<n;k++)OF[o+k]=Math.round((k+1)*dy)*W+Math.round((k+1)*dx); }
        for(let j=0;j<N;j++){ const v=g[j]; let a; if(v>1.25)a=v-1.25; else if(v<-1.5)a=(v+1.5)*0.7; else continue; const q=j-shift; if(q<0)continue; const y=(q/W)|0, x=q-y*W, o=((y>>3)*bw+(x>>3))*n;
          for(let k=0;k<n;k++){ const i=q+OF[o+k]; if(i>=0&&i<N)out[i]+=w[k]*a; } }
        return out; };
      return { field, flow, streak, hs, blade:P.streak_u*u, current:P.mark===2, gain:P.current.gain, lift:P.current.lift, leanVar:P.lean_var_deg*Math.PI/180, spread:P.spread, seed:P.seed }; },
    /* place() → tufts [{x,y,s,n,lean,seed}] in u; draw(ctx, list): tone layer, G = 128 marks grass */
    'grass-tufts':(P,u,A)=>{ const place=(main,ok,Hu)=>{ const r=A.rng(P.seed), out=[]; let guard=0;
        while(out.length<P.count&&guard++<P.count*8){ const x=r()*1000, t=main(x)[0], y=t+8+(Hu-t-4)*Math.sqrt(r()), n=3+Math.floor(r()*5), lean=(r()-0.5)*0.5, seed=Math.floor(r()*1e9);
          if(y>Hu+2||!ok(x,y))continue; out.push({ x, y, s:0.3+0.7*Math.pow(Math.min(1,Math.max(0,(y-160)/(Hu-160))),1.15), n, lean, seed }); }
        return out; };
      const draw=(c,list)=>{ const C=t=>`rgb(${Math.max(0,Math.min(255,Math.round(t*255)))},128,0)`;
        for(const f of list){ const r=A.rng(f.seed), bx=f.x*u, by=f.y*u, H=P.blade_u*u*f.s;
          for(let j=0;j<f.n;j++){ const a=f.lean+((j+0.5)/f.n-0.5)*1.2+(r()-0.5)*0.35, h=H*(0.55+0.6*r()), x0=bx+(r()-0.5)*0.3*H, tx=x0+Math.sin(a)*h, ty=by-Math.cos(a)*h*0.95, cx=x0+Math.sin(a*0.35)*h*0.55, cy=by-h*0.6, w=Math.max(0.7,0.06*h), dark=r()<P.dark_share;
            c.fillStyle=C(dark?0.1*r():0.8+0.2*r()); c.beginPath(); c.moveTo(x0-w,by); c.quadraticCurveTo(cx-w*0.6,cy,tx,ty); c.quadraticCurveTo(cx+w*0.6,cy,x0+w,by); c.closePath(); c.fill(); } } };
      return { place, draw }; },
    /* trees(main) → [{x, y base, R, k}] in u; draw(ctx, trees, Lx, Ly): tone layer — R = tone, G = 255 for bark, 0 for leaves, A = coverage */
    'tree-crown':(P,u,A)=>{ const on=P.tree>1, grove=P.tree>2, R0=P.crown_u/2;
      const trees=main=>{ if(!on)return []; const list=(grove?P.grove:[P.grove[0]]).map(g=>{ const R=R0*g[1], x=P.base_x_u+g[0]*R0; return { x, y:main(x)[0]+P.base_depth*R, R, k:g[1] }; }); return list.sort((a,b)=>a.R-b.R); };
      const draw=(c,list,Lx,Ly)=>{ const C=(t,g,a)=>`rgba(${Math.max(0,Math.min(255,Math.round(t*255)))},${g},0,${a===undefined?1:a})`, lz=0.55, ln=Math.hypot(Lx,Ly,lz), L3=[Lx/ln,Ly/ln,lz/ln];
        const limb=(x0,y0,x1,y1,x2,y2,w0,w1,tone)=>{ const N=14, Lf=[], Rt=[]; for(let i=0;i<=N;i++){ const t=i/N, a=(1-t)*(1-t), m=2*(1-t)*t, z=t*t, px=a*x0+m*x1+z*x2, py=a*y0+m*y1+z*y2, dx=2*(1-t)*(x1-x0)+2*t*(x2-x1), dy=2*(1-t)*(y1-y0)+2*t*(y2-y1), dl=Math.hypot(dx,dy)||1, w=(w0+(w1-w0)*t)/2; Lf.push([px-dy/dl*w,py+dx/dl*w]); Rt.push([px+dy/dl*w,py-dx/dl*w]); }
          c.fillStyle=C(tone,255); c.beginPath(); c.moveTo(Lf[0][0],Lf[0][1]); for(const p of Lf)c.lineTo(p[0],p[1]); for(let i=Rt.length-1;i>=0;i--)c.lineTo(Rt[i][0],Rt[i][1]); c.closePath(); c.fill(); return t=>{ const a=(1-t)*(1-t), m=2*(1-t)*t, z=t*t; return [a*x0+m*x1+z*x2, a*y0+m*y1+z*y2]; }; };
        const ros=(q,ox,oy,k)=>{ c.beginPath(); for(let j=0;j<5;j++){ const a=q.rot+j*1.2566, ex=q.x+ox+Math.cos(a)*q.s*0.52, ey=q.y+oy+Math.sin(a)*q.s*0.52, rx=q.s*0.46*k, ry=q.s*0.25*k; c.moveTo(ex+Math.cos(a)*rx,ey+Math.sin(a)*rx); c.ellipse(ex,ey,rx,ry,a,0,6.2832); } const rr=q.s*0.3*k; c.moveTo(q.x+ox+rr,q.y+oy); c.arc(q.x+ox,q.y+oy,rr,0,6.2832); c.fill(); };
        for(const T of list){ const r=A.rng(P.seed+Math.round(T.x*7)), R=T.R*u, bx=T.x*u, by=T.y*u, fy=by-0.46*R, sk=Math.min(0.3*T.R,Math.max(0,6-(T.y-1.8*T.R)))*u;
          /* each tree's own lobe layout: the measured one for the main tree, a seeded variant (mirrored, stretched, lobes dropped and added) for the grove */
          const vr=A.rng(P.seed*31+Math.round(T.x*13)), main=T.k===1, mir=!main&&vr()<0.5?-1:1, ax=main?1:0.85+0.3*vr(), ay=main?1:0.85+0.3*vr();
          const lay=P.lobes.filter(()=>main||vr()>0.18).map(q=>[q[0]*mir*ax+(main?0:(vr()-0.5)*0.24),1.05+(q[1]-1.05)*ay+(main?0:(vr()-0.5)*0.2),q[2]*(main?1:0.85+0.3*vr())]);
          if(!main){ const add=2+Math.floor(vr()*3); for(let i=0;i<add;i++)lay.push([(vr()*2-1)*0.75,0.8+vr()*0.6,0.22+vr()*0.12]); }
          const fk=P.fork.map(f=>[f[0]*mir+(main?0:(vr()-0.5)*0.16),f[1]*(main?1:0.92+0.16*vr()),f[2]]);
          /* trunk to the fork, flared at the ground, lit side toward the sun */
          const g=c.createLinearGradient(bx-0.06*R,0,bx+0.06*R,0); g.addColorStop(0,C(Lx<0?0.78:0.14,255)); g.addColorStop(1,C(Lx<0?0.14:0.78,255));
          c.fillStyle=g; c.beginPath(); c.moveTo(bx-0.13*R,by+0.03*R); c.quadraticCurveTo(bx-0.062*R,by-0.01*R,bx-0.064*R,by-0.16*R); c.lineTo(bx-0.056*R,fy); c.lineTo(bx+0.056*R,fy); c.lineTo(bx+0.064*R,by-0.16*R); c.quadraticCurveTo(bx+0.062*R,by-0.01*R,bx+0.135*R,by+0.035*R); c.closePath(); c.fill();
          /* the fork: three limbs that curve up into the crown, two twigs off each side limb */
          const lp=fk.map(f=>{ const ey=by-f[1]*R+sk; return limb(bx+f[0]*0.06*R,fy+0.03*R,bx+f[0]*0.42*R,fy+(ey-fy)*0.38,bx+f[0]*R,ey,f[2]*R,f[2]*0.3*R,0.3); });
          for(const tw of P.twigs){ const p=lp[tw[0]](0.5), ex=bx+tw[1]*mir*R, ey=by-tw[2]*R+sk; limb(p[0],p[1],(p[0]+ex)/2,(p[1]+ey)/2-0.04*R,ex,ey,0.03*R,0.01*R,0.34); }
          /* lobes: top and outside first, so lower and central lobes overlap the shaded undersides above them */
          const lobes=lay.map(q=>({ x:q[0]+(r()-0.5)*0.06, up:q[1]+(r()-0.5)*0.06, rl:q[2]*(0.92+0.16*r()) })).sort((a,b)=>(b.up+0.5*Math.abs(b.x))-(a.up+0.5*Math.abs(a.x)));
          const sz=5.5*Math.sqrt(T.R/119.5)*u;
          for(const q of lobes){ const lx=bx+q.x*R, ly=by-q.up*R+sk, rl=q.rl*R; let gx=q.x/1.05, gy=-(q.up-1.05)/0.78; const gl=Math.hypot(gx,gy); if(gl>0.97){ gx*=0.97/gl; gy*=0.97/gl; }
            const gz=Math.sqrt(1-gx*gx-gy*gy), gs=Math.max(0,gx*L3[0]+gy*L3[1]+gz*L3[2]), ao=0.72+0.28*Math.min(1,Math.max(0,(q.up-0.5)/1.0));
            c.fillStyle=C(0.14+0.16*gs*ao,0); c.beginPath(); c.arc(lx,ly,rl*0.62,0,6.2832); c.fill();
            const n=Math.round(1.7*(rl/sz)*(rl/sz)), cl=[];
            for(let i=0;i<n;i++){ const rho=Math.sqrt(r())*0.98, a=r()*6.2832, nx=Math.cos(a)*rho, ny=Math.sin(a)*rho, nz=Math.sqrt(Math.max(0,1-rho*rho)), sh=Math.max(0,nx*L3[0]+ny*L3[1]+nz*L3[2]);
              const t=0.13+0.64*sh*ao+0.24*gs+(r()-0.5)*0.16, px=lx+nx*rl, py=ly+ny*rl, ex=(px-bx)/R/1.05, eu=(by+sk-py)/R, cy=(eu-1.05)/(eu>1.05?0.8:0.62), rc=Math.hypot(ex,cy);
              cl.push({ x:px, y:py, t, rot:r()*6.2832, s:sz*(0.8+0.5*r())*(1-0.25*rho*rho*rho*rho), a:rc>0.9?0.42:rc>0.8?0.7:1 }); }
            cl.sort((a,b)=>a.t-b.t);
            for(const k of cl){ c.fillStyle=C(k.t-0.28,0,k.a); ros(k,-L3[0]*0.25*k.s,-L3[1]*0.25*k.s,1.1); c.fillStyle=C(k.t,0,k.a); ros(k,0,0,1); } } } };
      const patches=list=>list.map(t=>({ x:t.x, y:t.y-0.04*t.R, rx:P.root_patch[0]*t.R, ry:P.root_patch[1]*t.R, k:P.root_patch[2] }));
      return { on, trees, draw, patches }; },
    /* place() → clumps [{x,y,s,kind,seed,heads:[{x,y,z}]}] in u, holding `count` heads in all; drawClumps(ctx, list): leaves and stems into the tone layer; drawHeads(ctx, list, V): petals on the finished plate */
    'wildflowers':(P,u,A)=>{ const place=(main,ok,Hu)=>{ const r=A.rng(P.seed), out=[], N=Math.round(P.count); let heads=0, guard=0;
        while(heads<N&&guard++<3000){ const x=1000*Math.pow(r(),1.3), t=main(x)[0], y=t+20+(Hu-t-20)*Math.pow(r(),0.8), kind=r()<P.lilac_share?1:2, m=3+Math.floor(r()*5), seed=Math.floor(r()*1e9);
          if(y>Hu-2||!ok(x,y))continue; const s=0.5+1.05*Math.pow(Math.min(1,Math.max(0,(y-160)/(Hu-160))),1.1), rr=A.rng(seed), hd=[];
          for(let j=0,tries=0;j<m&&heads<N&&tries<m*6;tries++){ const hx=x+(rr()-0.5)*20*s, hy=y-(6+rr()*13)*s, z=rr(); if(hx<2||hx>998||!ok(hx,hy)||hd.some(q=>Math.hypot(q.x-hx,q.y-hy)<3.6*s))continue; hd.push({ x:hx, y:hy, z }); heads++; j++; }
          if(hd.length)out.push({ x, y, s, kind, seed, heads:hd }); }
        return out; };
      const drawClumps=(c,list)=>{ const C=t=>`rgb(${Math.max(0,Math.min(255,Math.round(t*255)))},128,0)`;
        for(const f of list){ const r=A.rng(f.seed+7), bx=f.x*u, by=f.y*u, s=f.s*u;
          c.strokeStyle=C(0.05); c.lineWidth=Math.max(1.2,0.42*s); c.lineCap='round';
          for(const h of f.heads){ const hx=h.x*u, hy=h.y*u, sx=bx+(hx-bx)*0.25; c.beginPath(); c.moveTo(sx,by); c.quadraticCurveTo(sx+(hx-sx)*0.2,(by+hy)/2,hx,hy); c.stroke(); }
          const n=6+Math.floor(r()*4); for(let j=0;j<n;j++){ const a=((j+0.5)/n-0.5)*1.9+(r()-0.5)*0.3, h=(8+9*r())*s, x0=bx+(r()-0.5)*4*s, tx=x0+Math.sin(a)*h, ty=by-Math.cos(a)*h*0.85, cx=x0+Math.sin(a)*h*0.4, cy=by-h*0.55, w=Math.max(0.9,0.1*h);
            c.fillStyle=C(r()<0.6?0.03+0.1*r():0.66+0.26*r()); c.beginPath(); c.moveTo(x0,by); c.quadraticCurveTo(cx-w,cy,tx,ty); c.quadraticCurveTo(cx+w,cy,x0,by); c.closePath(); c.fill(); } } };
      const drawHeads=(c,list,V)=>{ const dot=(x,y,rad)=>{ const R=Math.max(0.5,rad), r2=R*R, x0=Math.floor(x-R), x1=Math.ceil(x+R), y0=Math.floor(y-R), y1=Math.ceil(y+R); for(let yy=y0;yy<=y1;yy++){ let a=-1, b=-2; for(let xx=x0;xx<=x1;xx++){ const dx=xx+0.5-x, dy=yy+0.5-y; if(dx*dx+dy*dy<=r2){ if(a<0)a=xx; b=xx; } } if(b>=a)c.fillRect(a,yy,b-a+1,1); } };
        for(const f of list){ const s=f.s*u; for(const h of f.heads){ const x=h.x*u, y=h.y*u;
          if(f.kind===1){ c.fillStyle=V.petal; for(let j=0;j<4;j++){ const a=j*1.5708+h.z; dot(x+Math.cos(a)*1.4*s,y+Math.sin(a)*1.2*s,1.15*s); } c.fillStyle=V.eye; dot(x,y,0.55*s); }
          else { c.fillStyle=V.bloom; for(let j=0;j<5;j++){ const a=j*1.2566+h.z; dot(x+Math.cos(a)*1.15*s,y+Math.sin(a)*0.95*s,0.9*s); } c.fillStyle=V.eye; dot(x,y,0.45*s); } } } };
      return { place, drawClumps, drawHeads }; }
  },
  /* geometry in u for one set of params: shared by render, motion and the callouts */
  layout(P){ const A=window.ART, S=window.STUDY, T=S.techniques, Hu=1000*S.ref.h/S.ref.w; const key=JSON.stringify(P); if(S._L&&S._L.key===key)return S._L;
    const form=T['hill-form'](P['hill-form'],1,A), hills=T['hills-behind'](P['hills-behind'],1,A), edge=T['riverbed-boundary'](P['riverbed-boundary'],1,A), tree=T['tree-crown'](P['tree-crown'],1,A), fl=T['wildflowers'](P['wildflowers'],1,A), tf=T['grass-tufts'](P['grass-tufts'],1,A);
    const trees=tree.trees(x=>form.main(x)), patches=tree.patches(trees), dl=edge.solve(form.main,form.front,patches,Hu);
    const ok=(x,y)=>{ if(y<=form.main(x)[0]+3)return false; for(const t of trees){ const dx=(x-t.x)/(t.R*1.08), dy=(y-(t.y-0.95*t.R))/(t.R*0.95); if(dx*dx+dy*dy<1||(Math.abs(x-t.x)<0.25*t.R&&y<t.y+0.12*t.R&&y>t.y-0.6*t.R))return false; } return y>=form.front(x)[0]||edge.sd0(x,y,dl,patches)<-edge.soft*0.5-edge.wmax; };
    const flowers=fl.place(form.main,ok,Hu), tufts=tf.place(form.main,ok,Hu);
    return (S._L={ key, Hu, form, hills, edge, trees, patches, dl, flowers, tufts }); },
  /* the screen: every pixel picks one ink. keep → also returns the grass pixels for motion */
  paint(W,H,V,O,keep){ const A=window.ART, S=window.STUDY, T=S.techniques, P=A.params(S.spec,O), u=W/1000, L=S.layout(P);
    const sky=T['paper-sky'](P['paper-sky'],u,A,V), lit=T['hill-light'](P['hill-light'],u,A), gr=T['stipple-grain'](P['stipple-grain'],u,A), E=L.edge;
    const flat=a=>{ const o=new Uint8Array(a.length*3); a.forEach((h,i)=>{ const k=A.hex(h); o[i*3]=k[0]; o[i*3+1]=k[1]; o[i*3+2]=k[2]; }); return o; };
    const G=flat(V.grass), B=flat(V.blue), Lf=flat(V.leaf), Bk=flat(V.bark), HZ=A.hex(V.haze), KG=V.grass.length, KB=V.blue.length, KL=V.leaf.length, KK=V.bark.length, SP=gr.spread;
    /* grain field, cached per size */
    const nk=W+'x'+H+'|'+P['stipple-grain'].grain_u; if(!S._N||S._N.k!==nk)S._N={ k:nk, g:gr.field(W,H) }; const g=S._N.g, N=W*H;
    const DM=H+2, e1=new Float32Array(DM), er=new Float32Array(DM), face=lit.face; for(let k=0;k<DM;k++){ e1[k]=Math.exp(-k/u/lit.turn); er[k]=lit.rimW>0?Math.exp(-k/u/lit.rimW):0; }
    const ssOf=m=>{ const a=new Float32Array(DM); for(let k=0;k<DM;k++){ const t=Math.min(1,k/u/m[4]); a[k]=m[3]*t*t*(3-2*t); } return a; };
    const mG=lit.mat.grass, mF=lit.mat.front, mB=lit.mat.blue, mH=lit.mat.hill, sG=ssOf(mG), sF=ssOf(mF), sB=ssOf(mB);
    /* columns: silhouettes, normal · sun, boundary line */
    const tM=new Int32Array(W), tF=new Int32Array(W), lM=new Float32Array(W), lF=new Float32Array(W), yb=new Float32Array(W), wF=new Float32Array(W), hl=L.hills.list.slice().reverse(), nH=hl.length, tH=hl.map(()=>new Int32Array(W)), lH=hl.map(()=>new Float32Array(W));
    const rimF=(m,l2)=>m[5]+(1-m[5])*Math.max(0,l2), sw=E.soft, sw2=sw/2, wm=E.wmax, dl=L.dl, cs=E.cs, pt=L.patches;
    const sdAt=(xu,yu)=>{ let s=(yu-E.yb(xu)-dl)*cs-E.wobAt(xu,yu); for(const p of pt){ const qx=(xu-p.x)/p.rx, qy=(yu-p.y)/p.ry, q=qx*qx+qy*qy; if(q<7)s-=p.k*Math.exp(-q); } return s; };
    const pF=new Float32Array(W);
    for(let x=0;x<W;x++){ const xu=(x+0.5)/u; let q=L.form.main(xu); tM[x]=Math.ceil(q[0]*u); lM[x]=lit.lam2(q[1]); const f=L.form.front(xu); tF[x]=Math.ceil(f[0]*u); lF[x]=lit.lam2(f[1]); yb[x]=E.yb(xu)+dl;
      for(let k=0;k<nH;k++){ q=hl[k].f(xu); tH[k][x]=Math.ceil(q[0]*u); lH[k][x]=lit.lam2(q[1]); }
      const s=sdAt(xu,f[0]-3); pF[x]=s>sw2?1:s<-sw2?0:(()=>{ const t=(s+sw2)/sw; return t*t*(3-2*t); })(); }
    /* front swell: a hard lit edge where the riverbed is behind it; elsewhere it blends into the hill over 25 u */
    { const r=Math.max(1,Math.round(26*u)); let acc=0; for(let x=-r;x<W+r;x++){ const a=x+r<W?pF[Math.min(W-1,Math.max(0,x+r))]:pF[W-1]; acc+=a; if(x-r-1>=0)acc-=pF[x-r-1]; else acc-=pF[0]; if(x>=0&&x<W){ const t=Math.min(1,Math.max(0,(acc/(2*r+1)-0.04)/0.45)); wF[x]=t*t*(3-2*t); } } }
    const pc=new Uint8Array(W); for(let x=0;x<W;x++){ const xu=(x+0.5)/u; for(const p of pt)if(Math.abs(xu-p.x)<2.7*p.rx)pc[x]=1; }
    /* fine blade streaks on the grass; current strokes in the blue */
    const pn=A.perlin(gr.seed), lean0=(O&&O.__lean)||0, sh=37*W+53;
    const bl=gr.streak(g,W,H,gr.blade,(x,y)=>lean0+gr.leanVar*(pn(x/(34*u),y/(34*u))*1.6),sh);
    const fk=W+'x'+H+'|'+JSON.stringify(P['stipple-grain'].current)+'|'+P['riverbed-boundary'].angle_deg; let cu=null; if(gr.current){ if(!S._F||S._F.k!==fk)S._F={ k:fk, f:gr.flow(W,H,-E.angle,pn) }; cu=S._F.f; }
    /* tone layer: tufts, flower clumps, trees */
    const lk=W+'x'+H+'|'+JSON.stringify([P['tree-crown'],P['grass-tufts'],P['wildflowers'],P['riverbed-boundary'],P['hill-light'].sun_deg]); if(!S._T||S._T.k!==lk){ const c=A.off(W,H), x=c.getContext('2d');
      T['grass-tufts'](P['grass-tufts'],u,A).draw(x,L.tufts); T['wildflowers'](P['wildflowers'],u,A).drawClumps(x,L.flowers); if(L.trees.length)T['tree-crown'](P['tree-crown'],u,A).draw(x,L.trees,lit.Lx,lit.Ly); S._T={ k:lk, d:x.getImageData(0,0,W,H).data }; }
    const tl=S._T.d;
    const hz=hl.map(h=>{ const a=new Float32Array(DM); for(let k=0;k<DM;k++)a[k]=L.hills.haze(h.depth,k/u); return a; });
    const img=new ImageData(W,H), d=img.data, sk=sky.k, sa=sky.amp*2, kept=keep?{ idx:[], t:[] }:null, dk=0.6*sw+8, dw=sw+dk, cg=gr.gain, cl=gr.lift;
    for(let y=0;y<H;y++){ const yu=(y+0.5)/u, r=y*W; for(let x=0;x<W;x++){ const i=r+x, o=i*4, ta=tl[o+3]; let R=0, Gc=0, Bc=0;
        let U=0.5+0.22*g[i]; U=U<0.05?0.05:U>0.95?0.95:U;
        if(ta>0&&ta>255*U){ const t=tl[o]/255, gc=tl[o+1];
          if(gc>200){ let k=(t*(KK-1)+0.5+SP*g[i])|0; k=k<0?0:k>=KK?KK-1:k; R=Bk[k*3]; Gc=Bk[k*3+1]; Bc=Bk[k*3+2]; }
          else if(gc>90){ let k=(t*(KG-1)+0.5+SP*0.5*g[i])|0; k=k<0?0:k>=KG?KG-1:k; R=G[k*3]; Gc=G[k*3+1]; Bc=G[k*3+2]; }
          else { let k=(t*(KL-1)+0.5+SP*g[i]*0.9)|0; k=k<0?0:k>=KL?KL-1:k; R=Lf[k*3]; Gc=Lf[k*3+1]; Bc=Lf[k*3+2]; } }
        else if(y>=tM[x]){ const front=y>=tF[x], km=y-tM[x], l2=lM[x]; let blue=false, p=0, s=-1e9;
          let fz=1, fb=1; if(front){ const dz=(y-tF[x])/u, z=dz/(0.8*sw), zb=dz/Math.min(10,0.3*sw); fz=(1-wF[x])*(z>=1?0:1-z*z*(3-2*z)); fb=zb>=1?0:1-zb*zb*(3-2*zb); }
          if(fz>0){ const xu=(x+0.5)/u; s=(yu-yb[x])*cs-E.wobAt(xu,yu); if(pc[x]===1){ for(const q of pt){ const qx=(xu-q.x)/q.rx, qy=(yu-q.y)/q.ry, qq=qx*qx+qy*qy; if(qq<7)s-=q.k*Math.exp(-qq); } }
            if(s>=sw2)p=fz*fb; else if(s>-sw2){ const t=(s+sw2)/sw; p=t*t*(3-2*t)*fz*fb; }
            if(p>0){ let j=i+sh+977; if(j>=N)j-=N; let V2=0.5+0.2*g[j]+0.55*(gr.hs(x,y,E.seed)-0.5); V2=V2<0.02?0.02:V2>0.98?0.98:V2; blue=p>V2; } }
          if(blue){ const t=mB[0]+mB[1]*(face+(l2-face)*e1[km])+mB[2]*er[km]*rimF(mB,l2)-sB[km]+(cu!==null?cl*cu[i]:0); let k=(t*(KB-1)+0.5+SP*(cu!==null?g[i]*0.35+cu[i]*cg:g[i]))|0; k=k<0?0:k>=KB?KB-1:k; R=B[k*3]; Gc=B[k*3+1]; Bc=B[k*3+2]; }
          else { let t=mG[0]+mG[1]*(face+(l2-face)*e1[km])+mG[2]*er[km]*rimF(mG,l2)-sG[km];
            if(front){ const w=wF[x], kf=y-tF[x], lf=lF[x], tf=mF[0]+mF[1]*(face+(lf-face)*e1[kf])+mF[2]*er[kf]*rimF(mF,lf)*w-sF[kf]; let z=kf/u/25; z=z>1?1:z; t+=(tf-t)*(w+(1-w)*z*z*(3-2*z)); }
            if(s>-sw2-dk){ let q=(s+sw2+dk)/dw; q=q>1?1:q; t-=0.42*fz*q*q*(3-2*q); }
            let k=(t*(KG-1)+0.5+SP*(g[i]*0.62+bl[i]))|0; k=k<0?0:k>=KG?KG-1:k; R=G[k*3]; Gc=G[k*3+1]; Bc=G[k*3+2]; if(kept!==null){ kept.idx.push(i); kept.t.push(t); } } }
        else { let k=0; for(;k<nH;k++)if(y>=tH[k][x])break;
          if(k<nH){ const kd=y-tH[k][x], l2=lH[k][x], t=mH[0]+mH[1]*(face+(l2-face)*e1[kd])+mH[2]*er[kd]*rimF(mH,l2); let j=(t*(KG-3)+0.5+SP*0.8*g[i])|0; j=j<0?0:j>KG-3?KG-3:j; const h=hz[k][kd];
            R=G[j*3]+(HZ[0]-G[j*3])*h; Gc=G[j*3+1]+(HZ[1]-G[j*3+1])*h; Bc=G[j*3+2]+(HZ[2]-G[j*3+2])*h; }
          else { const m=1+sa*(gr.hs(x,y,sky.seed)-0.5); R=sk[0]*m; Gc=sk[1]*m; Bc=sk[2]*m; } }
        d[o]=R; d[o+1]=Gc; d[o+2]=Bc; d[o+3]=255; } }
    return { img, L, P, u, g, bl, kept }; },
  render(canvas,w,h,dpr,V,done,O){ const S=window.STUDY, A=window.ART, W=canvas.width, H=canvas.height; const r=S.paint(W,H,V,O,false); const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.putImageData(r.img,0,0);
    S.techniques['wildflowers'](r.P['wildflowers'],r.u,A).drawHeads(x,r.L.flowers,V); if(done)done(); },
  /* motion: wind. Grass pixels re-pick their ink each frame between fine blades leaning −9° and +9°, driven by a gust band that crosses the plate every 11 s; the gust is evaluated per 4 × 4 block. Tufts, flowers, tree and blue stay still. */
  motion(canvas,w,h,dpr,V,t,ctx,UO){ const S=window.STUDY, A=window.ART, W=canvas.width, H=canvas.height; const key=W+'x'+H+'|'+V.id+'|'+JSON.stringify(UO||{});
    if(!S._M||S._M.key!==key){ const merge=(o,lean)=>Object.assign({},o||{},{ __lean:lean }); const a=S.paint(W,H,V,merge(UO,-0.16),true), b=S.paint(W,H,V,merge(UO,0.16),false);
      const k=a.kept, n=k.idx.length, idx=Int32Array.from(k.idx), tt=Float32Array.from(k.t), ga=new Float32Array(n), gd=new Float32Array(n), blk=new Int32Array(n), bw=(W>>2)+1, bh=(H>>2)+1;
      for(let j=0;j<n;j++){ const i=idx[j], x=i%W, y=(i/W)|0; ga[j]=a.g[i]*0.62+a.bl[i]; gd[j]=b.bl[i]-a.bl[i]; blk[j]=(y>>2)*bw+(x>>2); }
      const bs=new Float32Array(bw*bh); for(let y=0;y<bh;y++)for(let x=0;x<bw;x++)bs[y*bw+x]=x*4/W*6+y*4/H*1.4;
      const G=new Uint8Array(V.grass.length*3); V.grass.forEach((h,i)=>{ const q=A.hex(h); G[i*3]=q[0]; G[i*3+1]=q[1]; G[i*3+2]=q[2]; });
      S._M={ key, img:a.img, idx, tt, ga, gd, blk, bs, gb:new Float32Array(bw*bh), G, K:V.grass.length, P:a.P, L:a.L, u:a.u, spread:a.P['stipple-grain'].spread }; }
    const M=S._M, d=M.img.data, K=M.K, G=M.G, sp=M.spread, ph=t*0.55, gb=M.gb, bs=M.bs;
    for(let j=0;j<bs.length;j++){ const s=bs[j]-ph; gb[j]=0.5+0.5*Math.sin(s*2.1)*Math.sin(s*0.77+1.3); }
    const n=M.idx.length, idx=M.idx, tt=M.tt, ga=M.ga, gd=M.gd, blk=M.blk;
    for(let j=0;j<n;j++){ const g=gb[blk[j]]; let k=((tt[j]+0.12*(g-0.35))*(K-1)+0.5+sp*(ga[j]+gd[j]*g))|0; k=k<0?0:k>=K?K-1:k; const o=idx[j]*4; d[o]=G[k*3]; d[o+1]=G[k*3+1]; d[o+2]=G[k*3+2]; }
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.putImageData(M.img,0,0); S.techniques['wildflowers'](M.P['wildflowers'],M.u,A).drawHeads(ctx,M.L.flowers,V); ctx.restore(); },
  /* callouts follow the parameters */
  onPoints(P){ window.STUDY._pts=P; },
  relayPoints(O){ const S=window.STUDY, A=window.ART, pts=S._pts; if(!pts)return; const P=A.params(S.spec,O), L=S.layout(P), Hu=L.Hu, at=(d,u,v)=>{ const p=pts.find(q=>q.d===d); if(p){ p.u=Math.min(0.98,Math.max(0.02,u)); p.v=Math.min(0.98,Math.max(0.02,v)); } };
    const main=x=>L.form.main(x)[0], front=x=>L.form.front(x)[0], E=L.edge;
    const t0=L.trees.find(t=>t.k===1); if(t0){ at('CRWN',t0.x/1000,(t0.y-1.25*t0.R)/Hu); at('ROOT',t0.x/1000,(t0.y+4)/Hu); } else { at('CRWN',0.49,(main(490)+10)/Hu); at('ROOT',0.49,(main(490)+24)/Hu); }
    /* boundary: middle of the visible edge; riverbed: middle of the blue */
    const eg=[], bs=[]; for(let x=20;x<1000;x+=10){ const t=main(x), f=front(x); for(let y=t+4;y<f-4;y+=6){ const s=E.sd0(x,y,L.dl,L.patches); if(Math.abs(s)<3)eg.push([x,y]); if(s>E.soft*0.6+8)bs.push([x,y]); } }
    if(eg.length){ const e=eg[Math.floor(eg.length*0.45)]; at('EDGE',e[0]/1000,e[1]/Hu); }
    if(bs.length){ let sx=0, sy=0; bs.forEach(b=>{ sx+=b[0]; sy+=b[1]; }); sx/=bs.length; sy/=bs.length; let best=bs[0], bd=1e9; bs.forEach(b=>{ const q=(b[0]-sx)**2+(b[1]-sy)**2; if(q<bd){ bd=q; best=b; } }); at('RIVR',best[0]/1000,best[1]/Hu); }
    const rx=P['hill-light'].sun_deg<=0?240:870; at('RIM',rx/1000,(main(rx)+4)/Hu);
    const hl=L.hills.list.find(h=>h.id==='R1'); at('HILL',0.84,hl?(hl.f(840)[0]+16)/Hu:0.2);
    if(L.flowers.length){ const f=L.flowers[0], h=f.heads[0]; at('FLWR',h.x/1000,h.y/Hu); }
    let bt=null, bd=1e9; for(const f of L.tufts){ const q=Math.abs(f.x-300)+(1-f.s)*400; if(q<bd){ bd=q; bt=f; } } if(bt)at('TUFT',bt.x/1000,(bt.y-0.5*P['grass-tufts'].blade_u*bt.s)/Hu); }
};
