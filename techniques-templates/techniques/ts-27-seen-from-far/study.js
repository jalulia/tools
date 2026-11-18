window.STUDY={
  id:'ts-27-seen-from-far', code:'TS-27', fig:'1.27',
  title:'Seen from far',
  kicker:'Technique · TS-27',
  lede:'A clearing that becomes a field of dots as you step back from it.',
  body:['Up close the clearing is painted from above. Stepping back, the painting is cut into cells that grow from 2.4 u to 11.1 u, the cells part to show paper, and one by one each takes the record’s dot instead of the paint, empty ground first.',
    'At 100 % the plate is the deck’s emblem: dots sized and colored by density, a 62 u hole at zero, 22 turns joined by a 1.9 u line. Play grows the record from day 6 to day 60, then steps in to the clearing and back out.'],
  motionHint:'Play grows the record from day 6 to day 60, steps in to the clearing and back out, a 20 s loop.',
  source:'Reference 27 · closing emblem of the Mindgut deck: a ring of green halftone dots with the turns drawn through it, 1040 × 1040',
  spot:[13,85,49], ref:{w:1040,h:1040},
  variantLabel:'Inks',
  variants:[
    { id:'ref', label:'Field green', sw:['#FFFFFF','#86BC44','#2E8A52','#0D5531','#DB4B2D'], spot:[13,85,49], paper:'#FFFFFF', light:'#86BC44', mid:'#2E8A52', deep:'#0D5531', line:'#0A4528', ink:'#151B17', origin:'#DB4B2D', ring:'#D0EC60',
      lawn:'#62AE3E', mown:'#A6D45C', meadow:'#2E8C40', shrub:'#1A6534', tree:'#0E4D31', shade:'#183586', path:'#C3DC8A', petal:'#FFFFFF', lilac:'#D9CCEB', bloom:'#F2C62E' },
    { id:'mg', label:'Mindgut', sw:['#FBFBF7','#D0EC60','#126B3D','#0A4528','#183586'], spot:[18,107,61], paper:'#FBFBF7', light:'#B9DA4E', mid:'#126B3D', deep:'#0A4528', line:'#151B17', ink:'#151B17', origin:'#E0561B', ring:'#D0EC60',
      lawn:'#71AB4E', mown:'#D0EC60', meadow:'#126B3D', shrub:'#0A4528', tree:'#0A4528', shade:'#183586', path:'#FBFBF7', petal:'#FBFBF7', lilac:'#183586', bloom:'#D0EC60' },
    { id:'io', label:'Ø', sw:['#FFFFFF','#2F5AE6','#101014','#F4551E'], spot:[47,90,230], paper:'#FFFFFF', light:'#7E97F0', mid:'#2F5AE6', deep:'#101014', line:'#101014', ink:'#101014', origin:'#F4551E', ring:'#FFFFFF',
      lawn:'#A1B5F4', mown:'#DAE1FB', meadow:'#2F5AE6', shrub:'#213985', tree:'#1F3796', shade:'#101014', path:'#FFFFFF', petal:'#FFFFFF', lilac:'#FFFFFF', bloom:'#F4551E' }
  ],
  points:[
    {u:0.5,v:0.5,d:'ZERO',label:'Origin · 12.5 u dot in an 18.5 u lime ring',t:'origin-dot',dir:[1,-1]},
    {u:0.574,v:0.5,d:'HOLE',label:'Hole at zero · 62 u, dots shrink over 24 u',t:'record-field',dir:[1,1]},
    {u:0.38,v:0.6,d:'CORE',label:'Deep core · dots 0.92 of the 11.1 u pitch',t:'am-screen',dir:[-1,1]},
    {u:0.85,v:0.5,d:'FRNG',label:'Fringe · density under 0.2 prints light dots',t:'am-screen',dir:[1,0]},
    {u:0.3,v:0.3,d:'LOBE',label:'Planting at a turn · a 36 u lobe from far',t:'clearing',dir:[-1,-1]},
    {u:0.6,v:0.25,d:'LINE',label:'The turns · 1.9 u line, deep at 85 %',t:'the-turns',dir:[1,-1]},
    {u:0.2,v:0.6,d:'HALO',label:'Halo · 8 u, deep at 13 %',t:'the-turns',dir:[-1,1]},
    {u:0.62,v:0.62,d:'GAP',label:'Gap · raggedness opens the ring',t:'record-field',dir:[1,1]},
    {u:0.62,v:0.4,d:'DIST',label:'Distance 100 % · cells grown from 2.4 u to 11.1 u',t:'step-back',dir:[1,-1]},
    {u:0.45,v:0.2,d:'EDGE',label:'Ragged edge · moved by noise, up to 1.7 × raggedness',t:'record-field',dir:[-1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1040,1040], grammar:'square AM screen of round dots on white: dot size and color follow density (lime fringe, green, deep core); a ring-shaped field with a ragged edge and gaps; a clean hole at the center with one orange dot in a lime ring; a polyline of turns joining nodes on the ring, thin dark core over a pale halo' },
    units:'design units, 1000 = plate width; the plate is 1000 × 1000 and the clearing is drawn at the same scale',
    palette:{ paper:'#FFFFFF', light_dot:'#86BC44', mid_dot:'#2E8A52', deep_dot:'#0D5531', line:'#0A4528', origin:'#DB4B2D', ring:'#D0EC60' },
    techniques:[
      { id:'step-back', short:'DIST', name:'Distance', layer:0, pass:0, atoms:['cell-mosaic','handoff','screen-growth'],
        params:{ distance:{ value:100, range:[0,100], step:1, unit:'%', label:'Distance', note:'0 % up close, 100 % from far' },
          pitch_near_u:2.4, remap:[[0,0.1,0.25,0.4,0.5,0.6,0.75,0.9,1],[0.0,0.156,0.263,0.353,0.412,0.439,0.491,0.665,1.0]],
          stages:'on the inner track (the slider maps 25 → 24 %, 50 → 40 %, 75 → 50 %, 90 → 63 %): cells cut from the painting 1.5–7 % · cell pitch 2.4 u → far pitch on a log curve · cells part to show paper 8–42 % · empty ground clears from the corners inward 2–64 %, paced by cleared area · grown cells take the record 56–92 % by density · on the slider, the line comes in over 42–60 % and holds full contrast above' },
        limits:'Steps back from the clearing: the trees go first, then the painting is cut into cells that part to paper and take the record\u2019s dots.',
        implementation:'Distance sets the cell pitch, how far the cells part, and when each cell trades the painting for the record. A dot that still shows the painting shows the painting\u2019s own pixels, so the plate is never a blurred copy; a cell with more growth trades later, so the empty ground clears first and the ring stays to the end. Trees go first: each leaves whole, canopy and shadow, one after another from the plate edge inward over 0.4–2.8 % of the slider, and the front starts after the last one.' },
      { id:'clearing', short:'CLR', name:'Clearing', layer:1, pass:1, atoms:['top-down','illustration','grain','growth'],
        params:{ days:{ value:60, note:'day of the record; Play runs it from 6 to 60' }, walk_days:40, grow_days:16, grain:0.03, tree_ring_u:'reach + 70 … reach + 190', seed:27 },
        limits:'The walk takes 40 days and growth 16 more, so day 60 is the full ring. The painting is drawn once per plate size and palette, and reused along the Distance track.',
        implementation:'The trees are drawn last, and the painting is kept once without them. The ground is a lookup from the record density (mown at zero, lawn, meadow, shrub) with 3 % per-pixel grain; dabs, grass ticks, the trodden path, sprouts, grass tufts and flowers where the record is dense, plantings at each turn and tree canopies are drawn over it.' },
      { id:'record-field', short:'FIELD', name:'Record field', layer:2, pass:2, atoms:['ring','density','noise','lobe'],
        params:{ hole_u:{ value:62, range:[30,130], unit:'u', label:'Hole at zero', note:'radius of the clean circle around the origin' },
          reach_u:{ value:420, range:[355,470], unit:'u', label:'Field reach', note:'radius where the last fringe dots stop' },
          ragged_u:{ value:50, range:[0,110], unit:'u', label:'Raggedness', note:'how far the edge wanders and how many gaps open in the ring' },
          lobe_u:36, skirt:0.1, stretch:[1.16,0.95], sprout:0.2, gaps:0.92, plateau:0.6, fringe:0.15, seed:31 },
        limits:'Shapes what grew: the clean hole at zero, how far the field reaches, how ragged its edge is. Past 110 u of raggedness the ring splits into islands.',
        implementation:'density = 1 − (1 − band)(1 − lobe): band rises over 24 u past the round hole, holds to 0.6 R and falls over 0.16 R on a radius stretched 1.16 across and 0.95 down, with the edge moved by noise; each turn adds a 36 u lobe with a flat top and a 0.1 skirt; the field tapers to nothing 445–478 u from the center on each axis, and nodes stay within 440 u, so nothing touches the plate edge; gaps are cut where a second noise passes 0.14–0.26. Growth by day is kept apart, so a new day costs one pass over the 4 u grid.' },
      { id:'am-screen', short:'SCRN', name:'AM screen', layer:3, pass:3, atoms:['halftone','am-screen','dot-gain','ramp'],
        params:{ pitch_u:{ value:11.1, range:[8,24], unit:'u', scale:'log', label:'Dot pitch', note:'cell size at 100 % distance' },
          gain:{ value:0, range:[-15,25], unit:'%', label:'Dot gain', note:'added to a 50 % dot; above 20 % the deep dots join' },
          angle_deg:{ value:0, range:[0,45], unit:'°', label:'Screen angle', note:'turns the cell grid about the origin' },
          shape:{ value:1, options:[{v:1,label:'Round'},{v:2,label:'Square'},{v:3,label:'Line'}], label:'Dot shape', note:'round dots, square dots, or lines whose width follows density' },
          ink:{ value:1, options:[{v:1,label:'Ramp'},{v:2,label:'Deep'},{v:3,label:'Ink'}], label:'Dot ink', note:'Ramp takes the light, mid or deep ink by dot area; Deep prints every dot in the deep ink; Ink prints every dot in the darkest ink' },
          full_dot:0.92, min_tone:0.035, ramp:'light 0 · mid 0.4 · deep 0.8' },
        limits:'Prints the record as dots: cell size, gain, angle, shape and ink. Under 8 u the dots read as a tint; past 25 % gain the core prints solid.',
        implementation:'Each cell takes one size and one color. Per pixel the four nearest cells add their coverage with a half-pixel edge and share the color by weight, so abutting squares and lines close without seams and dots stay round at any angle; a square or line that would leave a gap under 12 % of the cell fills it.' },
      { id:'the-turns', short:'TURN', name:'The turns', layer:4, pass:4, atoms:['polyline','node','halo'],
        params:{ turns:{ value:22, range:[8,28], step:1, label:'Turns', note:'nodes on the ring; the walk visits them in order and closes the loop' },
          line_u:{ value:1.9, range:[1,4.5], unit:'u', scale:'log', label:'Line weight', note:'core of the line; the halo is 4.2 times wider, up to 10 u' },
          halo:4.2, halo_max_u:10, core_alpha:0.85, halo_alpha:0.13, chords:0.3, start_deg:-150, seed:22 },
        limits:'Draws the walk through the field: how many turns and how heavy the line. Over 28 turns the plantings merge into a band.',
        implementation:'Nodes sit at 0.54–0.95 of the reach (within 440 u of the center on each axis), one per turn with ±31 % angle jitter; the path joins them in order and 30 % of turns also cut across two or three nodes. The core and the halo are one path each, so crossings do not double the ink.' },
      { id:'origin-dot', short:'ZERO', name:'Origin', layer:5, pass:5, atoms:['marker','dot'],
        params:{ mark:{ value:2, options:[{v:1,label:'Off'},{v:2,label:'On'}], label:'Origin', note:'the origin dot in its ring at zero' },
          dot_u:12.5, ring_u:18.5 },
        limits:'Marks zero with the origin dot in its ring, drawn last at every distance.',
        implementation:'One orange disc in a lime ring at zero; up close it casts a short shadow on the grass.' }
    ],
    pass_order:['clearing · ground lookup, grain, dabs, grass, path, sprouts, meadow, plantings, trees (drawn once, reused)','record · density per 4 u cell at the current day','screen · per cell size and color from the painting or the record; per pixel coverage from the four nearest cells','turns · halo then core, one path each','origin · lime ring, orange dot'],
    notes:['Measured on ref.png: pitch 11.56 px at 1040 px (11.1 u), 0° screen with a cell centered on zero; hole clear to 58 u; plateau coverage 0.56 from 77 u to 240 u, falling to 0 by 420 u; largest dots 0.92 of the pitch; field 77 % of the plate wide and 65 % tall (0.1–99.9 percentile of ink), so the ring is stretched 1.16 × 0.95 and the hole kept round; dot color by coverage (13,85,49) deep, (45,135,82) mid, (134,188,68) fringe.','Line: core 1.5–2 px of #0A4528 at 85 % (antialiased), halo 8 px of #0A4528 at 13 % (223,231,227 on white). Origin (217,72,48), 12.5 u, in a lime ring 18.5 u.','The clearing is not in the reference; it is built from the deck sequence "Over time, a field of dots" and drawn from above so that it lands on the emblem.']
  },
  techniques:{
    /* one track. s in 0…1; every value is one rendering: the painting (s < 1.5 %), or a grid of cells over paper */
    'step-back': (P,u,A)=>{ const D=A.clamp(P.distance/100,0,1), p0=P.pitch_near_u;
      /* the slider is remapped onto the track so that equal travel gives an equal change in the plate (measured as mean color change on a 96 px copy) */
      const KD=P.remap[0], KS=P.remap[1]; let k=1; while(k<KD.length-1&&D>KD[k])k++; const s=KS[k-1]+(KS[k]-KS[k-1])*(D-KD[k-1])/(KD[k]-KD[k-1]);
      /* plate area (1000 × 1000 u) outside a circle of radius r about the center */
      const out=r=>{ if(r<=500)return 1e6-Math.PI*r*r; if(r>=707.1)return 0; const h=Math.sqrt(r*r-250000); return 1e6-(Math.PI*r*r-4*(r*r*Math.acos(500/r)-500*h)); };
      return { s, D, paintOnly:s<0.015, done:s>=0.985, part:A.sstep(0.08,0.50,s), line:A.sstep(0.42,0.60,D), near:1-A.sstep(0.10,0.35,s),
        /* cell pitch in u for a far pitch pf: 2.4 u at the near end, on a log curve to pf */
        pitch:pf=>{ const a=Math.min(pf,p0), w=Math.pow(A.clamp((s-0.015)/0.985,0,1),0.85); return a*Math.pow(pf/a,w); },
        /* when a cell trades the painting for the record. Empty ground clears as a front from the corners inward, paced by the share of the plate it has cleared,
           so the paper grows evenly (2 → 64 %); cells that grew trade later, the densest last (56 → 92 %). nd is a smooth noise in −1…1 that roughens both */
        center:(rec,nd,r)=>{ const cg=Math.max(0.09,0.09+0.55*Math.pow(A.clamp(out(r)/out(330),0,1),0.7)+0.03*nd), cr=0.56+0.36*Math.pow(rec,0.7)+0.03*nd; return cg+(cr-cg)*A.sstep(0.05,0.35,rec); },
        take:c=>A.sstep(c-0.04,c+0.04,s), tint:c=>A.sstep(c-0.02,c+0.08,s) }; },
    /* nodes of the walk. G: { reach_u, days, walk_days } → nodes [{x,y,th,day}], segs [{a,b,f}] with f the drawn fraction */
    'the-turns': (P,u,A,G)=>{ const r=A.rng(P.seed), N=Math.max(3,Math.round(P.turns)), R=G.reach_u, nodes=[], th0=P.start_deg*Math.PI/180;
      for(let k=0;k<N;k++){ const j=r()-0.5, q=r(), c=r(); const th=th0+6.2832*(k+0.62*j)/N; const rad=R*A.clamp(0.74+(k%2?0.07:-0.06)+0.42*(q-0.5),0.54,0.95); nodes.push({ x:A.clamp(Math.cos(th)*rad*(G.sx||1),-440,440), y:A.clamp(Math.sin(th)*rad*(G.sy||1),-440,440), th, rad, day:1+G.walk_days*k/N, chord:c<P.chords, skip:c<P.chords*0.45?3:2 }); }
      const vday=k=>k>=N?1+G.walk_days:nodes[k].day, segs=[];
      for(let k=0;k<N;k++){ const a=vday(k), b=vday(k+1); segs.push({ a:k, b:(k+1)%N, f:A.clamp((G.days-a)/(b-a),0,1) });
        if(nodes[k].chord){ const sk=nodes[k].skip, b2=k+sk>=N?1+G.walk_days:vday(k+sk); segs.push({ a:k, b:(k+sk)%N, f:G.days>=b2?1:0 }); } }
      const path=(c,cx,cy,s)=>{ c.beginPath(); for(const g of segs){ if(g.f<=0)continue; const p=nodes[g.a], q=nodes[g.b]; c.moveTo(cx+p.x*s,cy+p.y*s); c.lineTo(cx+(p.x+(q.x-p.x)*g.f)*s,cy+(p.y+(q.y-p.y)*g.f)*s); } };
      return { nodes, segs, path,
        /* key: { alpha, color } draws a paper keyline 1.8 u wider than the core between the halo and the core, so the line reads on a solid core */
        draw:(c,cx,cy,s,alpha,color,key)=>{ if(alpha<=0)return; c.save(); c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=color; path(c,cx,cy,s);
          c.globalAlpha=alpha*P.halo_alpha; c.lineWidth=Math.min(P.line_u*P.halo,P.halo_max_u)*s; c.stroke();
          if(key&&key.alpha>0){ c.strokeStyle=key.color; c.globalAlpha=alpha*key.alpha; c.lineWidth=(P.line_u+1.8)*s; c.stroke(); c.strokeStyle=color; }
          c.globalAlpha=alpha*P.core_alpha; c.lineWidth=P.line_u*s; c.stroke(); c.restore(); },
        /* distance from a point to the drawn path */
        dist:(x,y)=>{ let m=1e9; for(const g of segs){ if(g.f<=0)continue; const p=nodes[g.a], q=nodes[g.b]; const ex=(q.x-p.x)*g.f, ey=(q.y-p.y)*g.f; const L=ex*ex+ey*ey||1; let t=((x-p.x)*ex+(y-p.y)*ey)/L; t=t<0?0:t>1?1:t; const dx=x-p.x-ex*t, dy=y-p.y-ey*t; const d=dx*dx+dy*dy; if(d<m)m=d; } return Math.sqrt(m); } }; },
    /* density of what grew. G: { nodes, walk_days, grow_days } → at(x,y,day) in 0…1; grid(GR,gs) keeps the parts that do not change with the day, .day(t) fills F */
    'record-field': (P,u,A,G)=>{ const n1=A.perlin(P.seed), n2=A.perlin(P.seed+1), n3=A.perlin(P.seed+2), n4=A.perlin(P.seed+3); const H=P.hole_u, R=P.reach_u, Rg=P.ragged_u, L=P.lobe_u;
      const gap=Math.min(1,Rg/50)*P.gaps, nodes=G.nodes, th0=nodes.length?nodes[0].th:0, far=1.9*L;
      const lobe=d=>Math.max(0.95*(1-A.sstep(0.45*L,1.12*L,d)),P.skirt*(1-A.sstep(1.05*L,far,d)));
      const SX=P.stretch[0], SY=P.stretch[1];
      const parts=(x,y,o)=>{ const r0=Math.sqrt(x*x+y*y); const inner=A.sstep(H-6,H+18,r0)*(1-A.sstep(445,478,Math.abs(x)))*(1-A.sstep(445,478,Math.abs(y))); const r=Math.sqrt((x/SX)*(x/SX)+(y/SY)*(y/SY)); o.inner=inner; o.band=0; o.b=0; o.k1=-1; o.v1=0; o.k2=-1; o.v2=0; if(inner<=0)return o;
        const ro=P.plateau*R+Rg*1.7*n1.fbm(x*0.0045,y*0.0045,3); let band=1-A.sstep(ro-0.07*R,ro+0.09*R,r); band=band*band;
        band*=A.clamp(1.08+0.85*n3.fbm(x*0.03,y*0.03,2),0.35,1);
        if(gap>0)band*=1-gap*A.sstep(0.14,0.26,n2.fbm(x*0.022,y*0.022,3));
        o.band=Math.min(1,Math.max(band,P.fringe*(1-A.sstep(ro,ro+0.2*R,r))))*inner;
        let ph=(Math.atan2(y,x)-th0)/6.2832; ph-=Math.floor(ph); o.b=1+G.walk_days*ph+5*n2(x*0.01+40,y*0.01);
        const wob=Math.sqrt(1+0.9*n3(x*0.026+17,y*0.026-5));
        for(let k=0;k<nodes.length;k++){ const dx=x-nodes[k].x, dy=y-nodes[k].y; const dd=Math.sqrt(dx*dx+dy*dy)*wob; if(dd>=far)continue; const v=lobe(dd)*inner; if(v>o.v1){ o.k2=o.k1; o.v2=o.v1; o.k1=k; o.v1=v; } else if(v>o.v2){ o.k2=k; o.v2=v; } }
        return o; };
      const lwAt=t=>nodes.map(q=>A.sstep(q.day,q.day+G.grow_days*0.75,t)), gr=(b,t)=>P.sprout+(1-P.sprout)*A.sstep(b,b+G.grow_days,t);
      const at=(x,y,t)=>{ const o=parts(x,y,{}); if(o.inner<=0)return 0; const lw=lwAt(t); const band=o.band*gr(o.b,t); const lob=Math.max(o.k1>=0?lw[o.k1]*o.v1:0,o.k2>=0?lw[o.k2]*o.v2:0); return 1-(1-band)*(1-lob); };
      const grid=(GR,gs)=>{ const gn=Math.round(2*GR/gs)+1, N=gn*gn, BA=new Float32Array(N), BD=new Float32Array(N), K1=new Int16Array(N), V1=new Float32Array(N), K2=new Int16Array(N), V2=new Float32Array(N), ND=new Float32Array(N), o={};
        for(let j=0;j<gn;j++)for(let i=0;i<gn;i++){ const x=-GR+i*gs, y=-GR+j*gs, c=j*gn+i; parts(x,y,o); BA[c]=o.band; BD[c]=o.b; K1[c]=o.k1; V1[c]=o.v1; K2[c]=o.k2; V2[c]=o.v2; ND[c]=A.clamp(1.5*n4.fbm(x*0.009,y*0.009,2)+0.7*n4(x*0.05+9,y*0.05-3),-1,1); }
        const F=new Float32Array(N); let tF=null;
        return { GR, gs, gn, F, nd:ND, day:t=>{ if(t===tF)return F; tF=t; const lw=lwAt(t); for(let c=0;c<N;c++){ const band=BA[c]>0?BA[c]*gr(BD[c],t):0; const l1=K1[c]>=0?lw[K1[c]]*V1[c]:0, l2=K2[c]>=0?lw[K2[c]]*V2[c]:0; const lob=l1>l2?l1:l2; F[c]=1-(1-band)*(1-lob); } return F; } }; };
      return { at, grid, hole:H, reach:R }; },
    /* the picture, drawn from above in world units. G: { field grid, turns, days, reach_u, hole_u, s, cx, cy } */
    'clearing': (P,u,A,V,G)=>({ draw:(c)=>{ const W=c.canvas.width, Hh=c.canvas.height, s=G.s, cx=G.cx, cy=G.cy, t=G.days, H=G.hole_u, R=G.reach_u;
      const g=G.grid, F=g.F, gn=g.gn, GR=g.GR, gs=g.gs; const samp=(x,y)=>{ let fx=(x+GR)/gs, fy=(y+GR)/gs; fx=fx<0?0:fx>gn-1.001?gn-1.001:fx; fy=fy<0?0:fy>gn-1.001?gn-1.001:fy; const ix=fx|0, iy=fy|0, tx=fx-ix, ty=fy-iy, o=iy*gn+ix; return (F[o]*(1-tx)+F[o+1]*tx)*(1-ty)+(F[o+gn]*(1-tx)+F[o+gn+1]*tx)*ty; };
      const rng=A.rng(P.seed), nz=A.perlin(P.seed+5); const L=A.lut([[0,V.mown],[0.3,V.lawn],[0.7,V.meadow],[1,V.shrub]]); const hx=A.hex, rgb=(k,a)=>A.rgb(k,a);
      const Rt=R+70; const x0=-cx/s, x1=(W-cx)/s, y0=-cy/s, y1=(Hh-cy)/s;
      /* mottle on a coarse world grid */
      const mg=Math.round((x1-x0)/8)+2, mh=Math.round((y1-y0)/8)+2, M=new Float32Array(mg*mh); for(let j=0;j<mh;j++)for(let i=0;i<mg;i++)M[j*mg+i]=nz.fbm((x0+i*8)*0.006,(y0+j*8)*0.006,3);
      const SX=(G.stretch||[1,1])[0], SY=(G.stretch||[1,1])[1];
      const tone=(x,y,f,m)=>{ const r=Math.sqrt(x*x+y*y), re=Math.sqrt((x/SX)*(x/SX)+(y/SY)*(y/SY)); return 0.30+0.5*f+0.13*m-0.26*(1-A.sstep(H-12,H+10,r))+0.30*A.sstep(Rt-40,Rt+60,re); };
      if(!G.treesOnly){
      /* 1 · ground: lookup + grain, per pixel */
      const id=c.createImageData(W,Hh), d=id.data; let sd=(P.seed*7919)|0;
      for(let Y=0;Y<Hh;Y++){ const y=(Y+0.5-cy)/s, my=(y-y0)/8; const jy=my<0?0:my>mh-1.001?mh-1.001:my, j0=jy|0, ty=jy-j0;
        for(let X=0;X<W;X++){ const x=(X+0.5-cx)/s, mx=(x-x0)/8; const ix=mx<0?0:mx>mg-1.001?mg-1.001:mx, i0=ix|0, tx=ix-i0, o=j0*mg+i0; const m=(M[o]*(1-tx)+M[o+1]*tx)*(1-ty)+(M[o+mg]*(1-tx)+M[o+mg+1]*tx)*ty;
          let tn=tone(x,y,samp(x,y),m); tn=tn<0?0:tn>1?1:tn; const k=L[(tn*255)|0]; sd=sd+0x6D2B79F5|0; let q=Math.imul(sd^sd>>>15,1|sd); q=q+Math.imul(q^q>>>7,61|q)^q; const gr=1+P.grain*(((q^q>>>14)>>>0)/2147483648-1);
          const i=(Y*W+X)*4; d[i]=k[0]*gr; d[i+1]=k[1]*gr; d[i+2]=k[2]*gr; d[i+3]=255; } }
      c.putImageData(id,0,0); }
      c.save(); c.setTransform(s,0,0,s,cx,cy); c.lineCap='round'; c.lineJoin='round';
      const vis=(x,y,m)=>x>x0-m&&x<x1+m&&y>y0-m&&y<y1+m;
      if(!G.treesOnly){
      /* 2 · dabs: soft painted patches */
      for(let i=0;i<520;i++){ const x=-560+rng()*1120, y=-560+rng()*1120, w=10+rng()*26, h=w*(0.35+rng()*0.3), a=rng()*3.1416, lt=rng()<0.5; if(!vis(x,y,40))continue; const f=samp(x,y); const k=L[(A.clamp(tone(x,y,f,0),0,1)*255)|0];
        c.fillStyle=rgb(lt?A.mix(k,hx(V.mown),0.45):A.mix(k,hx(V.tree),0.35),0.16); c.beginPath(); c.ellipse(x,y,w,h,a,0,6.2832); c.fill(); }
      /* 3 · grass ticks on a jittered 7 u grid */
      const hh=(i,j,k)=>{ let n=(i*374761393+j*668265263+k*1274126177+P.seed*2246822519)|0; n=Math.imul(n^(n>>>13),1274126177); n=n^(n>>>16); return (n>>>0)/4294967296; };
      const dark=new Path2D(), lite=new Path2D(); for(let gy=Math.floor(y0/7);gy<y1/7+1;gy++)for(let gx=Math.floor(x0/7);gx<x1/7+1;gx++){ const x=(gx+hh(gx,gy,1))*7, y=(gy+hh(gx,gy,2))*7, a=-1.5708+(hh(gx,gy,3)-0.5)*1.3, l=2.2+hh(gx,gy,4)*3.4, w=hh(gx,gy,5); const r=Math.sqrt(x*x+y*y); const ll=r<H?l*0.5:l; const p=w<0.55?dark:lite; p.moveTo(x,y); p.lineTo(x+Math.cos(a)*ll,y+Math.sin(a)*ll); }
      c.lineWidth=0.9; c.strokeStyle=rgb(hx(V.shrub),0.32); c.stroke(dark); c.strokeStyle=rgb(hx(V.mown),0.42); c.stroke(lite);
      /* 4 · the trodden path */
      G.turns.path(c,0,0,1); c.strokeStyle=rgb(hx(V.path),0.34); c.lineWidth=13; c.stroke(); c.strokeStyle=rgb(hx(V.path),0.78); c.lineWidth=6.5; c.stroke();
      /* 5 · sprouts from day one */
      const sp=A.rng(P.seed+11); for(let i=0;i<70;i++){ const a=sp()*6.2832, rr=H+18+sp()*(R*0.6-H), day=1+sp()*26, rot=sp()*6.2832; const x=Math.cos(a)*rr, y=Math.sin(a)*rr; const age=t-day; if(age<0||!vis(x,y,10))continue; const z=Math.min(1,0.45+age/12)*2.6;
        c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=V.mown; c.beginPath(); c.ellipse(-z*0.8,0,z,z*0.45,0.3,0,6.2832); c.ellipse(z*0.8,0,z,z*0.45,-0.3,0,6.2832); c.fill(); c.restore(); }
      /* 6 · meadow where the record is dense: grass tufts, then flowers, kept off the path */
      const ks=hx(V.shrub), kmw=hx(V.mown), kd=A.mix(hx(V.tree),hx(V.shade),0.25), tu=new Path2D(), tl=new Path2D(), ts=new Path2D();
      for(let gy=-52;gy<52;gy++)for(let gx=-52;gx<52;gx++){ const x=(gx+hh(gx,gy,11))*10, y=(gy+hh(gx,gy,12))*10, q=hh(gx,gy,13), rs=hh(gx,gy,14), a0=hh(gx,gy,15)*6.2832; if(!vis(x,y,14))continue; const f=samp(x,y); if(q>Math.pow(f,1.15)*0.98)continue; if(G.turns.dist(x,y)<6)continue; const rr=4+4.5*f+2.4*rs;
        ts.moveTo(x+1.2+rr*0.62,y+1.6); ts.arc(x+1.2,y+1.6,rr*0.62,0,6.2832);
        for(let b=0;b<7;b++){ const a=a0+b*0.8976+(hh(gx+b,gy,16)-0.5)*0.5, l=rr*(0.65+0.45*hh(gx,gy+b,17)); const p2=b%3===0?tl:tu; p2.moveTo(x,y); p2.quadraticCurveTo(x+Math.cos(a+0.3)*l*0.55,y+Math.sin(a+0.3)*l*0.55,x+Math.cos(a)*l,y+Math.sin(a)*l); } }
      c.fillStyle=rgb(kd,0.2); c.fill(ts); c.lineWidth=1.25; c.strokeStyle=rgb(ks,0.85); c.stroke(tu); c.lineWidth=1.0; c.strokeStyle=rgb(A.mix(ks,kmw,0.6),0.8); c.stroke(tl);
      const fw=[new Path2D(),new Path2D(),new Path2D()], fc=new Path2D();
      for(let gy=-35;gy<35;gy++)for(let gx=-35;gx<35;gx++){ const x=(gx+hh(gx,gy,21))*15, y=(gy+hh(gx,gy,22))*15, q=hh(gx,gy,23), ty2=hh(gx,gy,24), z=0.8+0.5*hh(gx,gy,25); if(!vis(x,y,8))continue; const f=samp(x,y); if(f<0.55||q>(f-0.55)*0.75)continue; if(G.turns.dist(x,y)<6)continue;
        const k2=ty2<0.45?0:ty2<0.7?1:2, pth=fw[k2]; for(let l=0;l<5;l++){ const b=l*1.2566+q*9; const px=x+Math.cos(b)*1.7*z, py=y+Math.sin(b)*1.7*z; pth.moveTo(px+1.35*z,py); pth.arc(px,py,1.35*z,0,6.2832); } fc.moveTo(x+0.8*z,y); fc.arc(x,y,0.8*z,0,6.2832); }
      c.fillStyle=rgb(hx(V.petal)); c.fill(fw[0]); c.fillStyle=rgb(hx(V.lilac)); c.fill(fw[1]); c.fillStyle=rgb(hx(V.bloom)); c.fill(fw[2]); c.fillStyle=rgb(A.mix(hx(V.bloom),hx(V.tree),0.15)); c.fill(fc);
      /* 7 · plantings at each turn: sprout, leaves, bloom */
      const pl=A.rng(P.seed+23), kl=hx(V.meadow), kp=hx(V.petal), kq=hx(V.lilac), kb=hx(V.bloom);
      G.turns.nodes.forEach((n,k)=>{ for(let j=0;j<6;j++){ const a=pl()*6.2832, rr=6+pl()*24, rot=pl()*6.2832, sz=0.85+pl()*0.4; const x=n.x+Math.cos(a)*rr, y=n.y+Math.sin(a)*rr; const age=t-(n.day+j*1.6); if(age<0||!vis(x,y,14))continue; const z=sz*Math.min(1,0.35+age/14);
        c.save(); c.translate(x,y); c.rotate(rot);
        if(age<4){ c.fillStyle=V.mown; c.beginPath(); c.ellipse(-2.4*z,0,3*z,1.4*z,0.3,0,6.2832); c.ellipse(2.4*z,0,3*z,1.4*z,-0.3,0,6.2832); c.fill(); }
        else { c.fillStyle=rgb(A.mix(kl,hx(V.tree),0.25),0.35); c.beginPath(); c.arc(1.4*z,1.8*z,7.2*z,0,6.2832); c.fill(); c.fillStyle=rgb(kl); c.beginPath(); for(let l=0;l<5;l++){ const b=l*1.2566; c.moveTo(0,0); c.ellipse(Math.cos(b)*4*z,Math.sin(b)*4*z,4.4*z,1.9*z,b,0,6.2832); } c.fill();
          if(age>=10){ const op=Math.min(1,(age-10)/5); if(k%2===0){ c.fillStyle=rgb(A.mix(kq,kp,0.4),op); c.beginPath(); for(let l=0;l<5;l++){ const b=l*1.2566-1.57; c.moveTo(Math.cos(b)*2.6*z,Math.sin(b)*2.6*z); c.arc(Math.cos(b)*2.6*z,Math.sin(b)*2.6*z,2.2*z,0,6.2832); } c.fill(); c.fillStyle=rgb(kp,op); c.beginPath(); for(let l=0;l<5;l++){ const b=l*1.2566-1.57; c.moveTo(Math.cos(b)*2.3*z-0.5*z,Math.sin(b)*2.3*z-0.5*z); c.arc(Math.cos(b)*2.3*z-0.5*z,Math.sin(b)*2.3*z-0.5*z,1.4*z,0,6.2832); } c.fill(); c.fillStyle=rgb(kb,op); c.beginPath(); c.arc(0,0,1.3*z,0,6.2832); c.fill(); }
            else { c.fillStyle=rgb(A.mix(kb,hx(V.tree),0.2),op); c.beginPath(); for(let l=0;l<7;l++){ const b=l*0.8976; const rr2=l===6?0:3*z; c.moveTo(Math.cos(b)*rr2+1.9*z,Math.sin(b)*rr2); c.arc(Math.cos(b)*rr2,Math.sin(b)*rr2,1.9*z,0,6.2832); } c.fill(); c.fillStyle=rgb(A.mix(kb,kp,0.45),op); c.beginPath(); for(let l=0;l<6;l++){ const b=l*1.0472; c.moveTo(Math.cos(b)*3*z-0.6*z+0.8*z,Math.sin(b)*3*z-0.6*z); c.arc(Math.cos(b)*3*z-0.6*z,Math.sin(b)*3*z-0.6*z,0.8*z,0,6.2832); } c.fill(); } } }
        c.restore(); } });
      }
      if(G.beforeTrees)G.beforeTrees(c);   /* the painting without its trees, for a caller that lets them go first */
      /* 8 · trees around the edge: shadow, canopy lumps, leaf dabs lit from the top left */
      const tr=A.rng(P.seed+29), kT=hx(V.tree), kS=A.mix(kT,hx(V.shade),0.45), kL=A.mix(kT,hx(V.lawn),0.5), kH=A.mix(kT,hx(V.mown),0.72); const NT=30;
      const T1=new Path2D(), T2=new Path2D(), T3=new Path2D(), T4=new Path2D(), T5=new Path2D(), T6=new Path2D();
      for(let i=0;i<NT;i++){ const a=6.2832*(i+(tr()-0.5)*0.6)/NT, rr=Rt+tr()*120, rad=58+tr()*52; const x=Math.cos(a)*rr*SX, y=Math.sin(a)*rr*SY; const lumps=[]; for(let l=0;l<10;l++){ const b=tr()*6.2832, e=tr()*0.55*rad; lumps.push([x+Math.cos(b)*e,y+Math.sin(b)*e,rad*(0.42+tr()*0.25)]); } const hs=[]; for(let l=0;l<46;l++)hs.push([tr(),tr(),tr()]); if(!vis(x,y,rad+30)||(G.keep&&!G.keep(i)))continue;
        for(const q of lumps){ T1.moveTo(q[0]+14+q[2]*1.05,q[1]+18); T1.arc(q[0]+14,q[1]+18,q[2]*1.05,0,6.2832); T2.moveTo(q[0]+q[2],q[1]); T2.arc(q[0],q[1],q[2],0,6.2832); const r2=q[2]*0.6; T3.moveTo(q[0]-q[2]*0.26+r2,q[1]-q[2]*0.32); T3.arc(q[0]-q[2]*0.26,q[1]-q[2]*0.32,r2,0,6.2832); }
        hs.forEach((h,l)=>{ const q=lumps[(h[0]*lumps.length)|0]; const ang=h[1]*6.2832, e=q[2]*0.85*Math.sqrt(h[2]); const px=q[0]+Math.cos(ang)*e, py=q[1]+Math.sin(ang)*e; const lit=(Math.cos(ang)*-0.7+Math.sin(ang)*-0.7)>0.1; const r2=q[2]*(0.07+0.07*h[2]); const P2=l<14?T6:(lit?T4:T5); P2.moveTo(px+r2,py); P2.arc(px,py,r2,0,6.2832); }); }
      c.fillStyle=rgb(kS,0.26); c.fill(T1); c.fillStyle=rgb(kT); c.fill(T2); c.fillStyle=rgb(kL,0.72); c.fill(T3); c.fillStyle=rgb(A.mix(kT,kS,0.5),0.55); c.fill(T5); c.fillStyle=rgb(kH,0.6); c.fill(T4); c.fillStyle=rgb(A.mix(kL,kH,0.5),0.45); c.fill(T6);
      c.restore(); } }),
    /* the screen. area(tone) → dot area as a share of the cell; color(tone) → ink; cover(pd) → the area that closes every gap for this shape; print() runs the per-pixel pass */
    'am-screen': (P,u,A,V)=>{ const g=P.gain/100, Af=Math.PI/4*P.full_dot*P.full_dot; const R=A.lut([[0,V.light],[0.4,V.mid],[0.8,V.deep],[1,V.deep]]), deep=A.hex(V.deep), inkc=A.hex(V.ink);
      const area=t=>{ if(t<P.min_tone)return 0; const a=A.clamp(t,0,1)*Af; return A.clamp(a+4*g*a*(1-a),0,1); };
      return { area, angle:P.angle_deg*Math.PI/180, shape:P.shape, color:t=>P.ink===2?deep:P.ink===3?inkc:R[(A.clamp(t,0,1)*255)|0],
        cover:pd=>P.shape===1?Math.PI*Math.pow(0.7072+0.75/pd,2):1,
        /* d ← paper·(1 − a) + ink·a, a = summed coverage of the four nearest cells; ink = each cell's record color, or, for the share pw of a cell still showing the
           painting, the painting's own pixel under the dot (crisp, darkened by dk to hold its tone on paper). C: { ar, pw, cr, cg, cb, ni, nj, oi, oj }; pix: painting RGBA or null */
        print:(d,W,H,cx,cy,pd,C,paper,pix,dk,G)=>{ const ca=Math.cos(P.angle_deg*Math.PI/180), sa=Math.sin(P.angle_deg*Math.PI/180), ni=C.ni, nj=C.nj, oi=C.oi, oj=C.oj, ar=C.ar, pw=C.pw, cr=C.cr, cg=C.cg, cb=C.cb, sh=P.shape;
          const at=(i,j)=>{ i+=oi; j+=oj; return i<0||j<0||i>=ni||j>=nj?-1:j*ni+i; };
          /* a square or a line that would leave a gap under 12 % of the cell (or under 1 px) fills its cell, so near-touching cells never show hairlines */
          const shut=Math.max(0.12*pd,1), close=h=>pd-2*h<shut?0.5*pd:h;
          for(let Y=0;Y<H;Y++){ const dy=Y+0.5-cy; for(let X=0;X<W;X++){ const dx=X+0.5-cx; const a=(dx*ca+dy*sa)/pd, b=(-dx*sa+dy*ca)/pd; const i0=Math.round(a), j0=Math.round(b), fa=a-i0, fb=b-j0, si=fa<0?-1:1, sj=fb<0?-1:1;
            let cov=0, sr=0, sg=0, sb=0, sp=0;
            if(sh!==3){ for(let q=0;q<4;q++){ const ii=i0+(q&1?si:0), jj=j0+(q&2?sj:0); const c=at(ii,jj); if(c<0)continue; const A0=ar[c]; if(A0<=0)continue; let v;
                if(sh===1){ const ex=a-ii, ey=b-jj; v=pd*Math.sqrt(A0/Math.PI)-pd*Math.sqrt(ex*ex+ey*ey)+0.5; }
                else { const ex=a-ii, ey=b-jj; v=close(0.5*pd*Math.sqrt(A0>1?1:A0))-pd*Math.max(ex<0?-ex:ex,ey<0?-ey:ey)+0.5; }
                if(v<=0)continue; if(v>1)v=1; cov+=v; const vp=v*pw[c], vr=v-vp; sp+=vp; sr+=vr*cr[c]; sg+=vr*cg[c]; sb+=vr*cb[c]; } }
            else { const il=Math.floor(a), tl=a-il; for(let q=0;q<2;q++){ const jj=j0+(q?sj:0); const c1=at(il,jj), c2=at(il+1,jj); if(c1<0&&c2<0)continue; const A1=c1>=0?Math.min(1,ar[c1]):0, A2=c2>=0?Math.min(1,ar[c2]):0, Am=A1+(A2-A1)*tl; if(Am<=0)continue;
                let v=close(0.5*pd*Am)-pd*Math.abs(b-jj)+0.5; if(v<=0)continue; if(v>1)v=1; const w1=c1<0?0:c2<0?1:1-tl, w2=1-w1, e1=c1<0?c2:c1, e2=c2<0?c1:c2;
                cov+=v; const vp=v*(pw[e1]*w1+pw[e2]*w2), vr=v-vp; sp+=vp; sr+=vr*(cr[e1]*w1+cr[e2]*w2); sg+=vr*(cg[e1]*w1+cg[e2]*w2); sb+=vr*(cb[e1]*w1+cb[e2]*w2); } }
            const o=(Y*W+X)*4, r0=paper[0], g0=paper[1], b0=paper[2];
            if(cov>0){ if(sp>0&&pix){ const qr=pix[o], qg=pix[o+1], qb=pix[o+2]; sr+=sp*(qr+(G[qr]-qr)*dk); sg+=sp*(qg+(G[qg]-qg)*dk); sb+=sp*(qb+(G[qb]-qb)*dk); }
              const inv=1/cov, w=cov>1?1:cov; d[o]=r0+(sr*inv-r0)*w; d[o+1]=g0+(sg*inv-g0)*w; d[o+2]=b0+(sb*inv-b0)*w; } else { d[o]=r0; d[o+1]=g0; d[o+2]=b0; } d[o+3]=255; } } } }; },
    'origin-dot': (P,u,A,V)=>({ draw:(c,cx,cy,s,shadow)=>{ if(P.mark===1)return; c.save(); const rd=P.dot_u/2*s, rr=P.ring_u/2*s;
      if(shadow>0){ c.fillStyle=A.rgb(A.hex(V.tree),0.28*shadow); c.beginPath(); c.arc(cx+1.6*s,cy+2.2*s,rr*1.08,0,6.2832); c.fill(); }
      c.fillStyle=V.ring; c.beginPath(); c.arc(cx,cy,rr,0,6.2832); c.fill();
      c.fillStyle=V.origin; c.beginPath(); c.arc(cx,cy,rd,0,6.2832); c.fill(); c.restore(); } })
  },
  /* everything that depends on the parameters but not on the canvas: stages, nodes, the record grid at the current day */
  model(O){ const A=window.ART, S=window.STUDY, T=S.techniques, P=A.params(S.spec,O); const C=P['clearing'], Fp=P['record-field'];
    const key=JSON.stringify([P['the-turns'],Fp,C.seed]); const st=T['step-back'](P['step-back'],1,A);
    const turns=T['the-turns'](P['the-turns'],1,A,{ reach_u:Fp.reach_u, days:C.days, walk_days:C.walk_days, sx:Fp.stretch[0], sy:Fp.stretch[1] });
    if(!S._m||S._m.key!==key){ const field=T['record-field'](Fp,1,A,{ nodes:turns.nodes, walk_days:C.walk_days, grow_days:C.grow_days }); S._m={ key, field, grid:field.grid(520,4), trees:S.treeOrder(Fp.reach_u,Fp.stretch[0],Fp.stretch[1],C.seed) }; }
    return { P, st, key, turns, field:S._m.field, grid:S._m.grid, trees:S._m.trees, F:S._m.grid.day(C.days) }; },
  /* the painter's trees, replayed with its seed and rng order: rank 0 is the tree furthest out toward the plate edge, which leaves first; -1 is a tree off the plate */
  treeOrder(R,SX,SY,seed){ const A=window.ART, tr=A.rng(seed+29), Rt=R+70, NT=30, T=[];
    for(let i=0;i<NT;i++){ const a=6.2832*(i+(tr()-0.5)*0.6)/NT, rr=Rt+tr()*120, rad=58+tr()*52; const x=Math.cos(a)*rr*SX, y=Math.sin(a)*rr*SY; for(let l=0;l<10;l++){ tr(); tr(); tr(); tr(); } for(let l=0;l<46;l++){ tr(); tr(); tr(); }
      if(Math.abs(x)<500+rad+30&&Math.abs(y)<500+rad+30)T.push({ i, out:Math.max(Math.abs(x),Math.abs(y))+rad }); }
    T.sort((p,q)=>q.out-p.out); const rank=new Array(NT).fill(-1); T.forEach((t,k)=>rank[t.i]=k); return { rank, n:T.length }; },
  /* the painting, drawn once per plate size, palette, parameters and day; the last two are kept */
  paint(W,H,V,m){ const S=window.STUDY, A=window.ART, P=m.P, C=P['clearing']; const key=W+'x'+H+'#'+V.id+'#'+m.key+'#'+C.days; S._pc=S._pc||[]; let e=S._pc.find(q=>q.key===key); if(e)return e;
    const c=A.off(W,H), x=c.getContext('2d'), u=W/1000, g=m.grid;
    let bare=null; S.techniques['clearing'](C,u,A,V,{ grid:{ F:m.F, gn:g.gn, GR:g.GR, gs:g.gs }, stretch:P['record-field'].stretch, turns:m.turns, days:C.days, reach_u:P['record-field'].reach_u, hole_u:P['record-field'].hole_u, s:u, cx:W/2, cy:H/2,
      beforeTrees:k=>{ const t=k.getTransform(); k.save(); k.setTransform(1,0,0,1,0,0); bare=A.off(W,H); bare.getContext('2d').drawImage(k.canvas,0,0); k.restore(); k.setTransform(t); } }).draw(x);
    e={ key, canvas:c, data:x.getImageData(0,0,W,H).data, bare, sub:[] }; S._pc.unshift(e); if(S._pc.length>2)S._pc.length=2; return e; },
  /* the painting with only the trees that keep(i) holds: the bare painting with those trees drawn back over it; the last three are kept */
  paintSome(e,W,H,V,m,keep,mk){ const S=window.STUDY, A=window.ART, P=m.P, C=P['clearing'], u=W/1000, g=m.grid; let f=e.sub.find(q=>q.mk===mk); if(f)return f;
    const c=A.off(W,H), x=c.getContext('2d'); x.drawImage(e.bare,0,0);
    S.techniques['clearing'](C,u,A,V,{ grid:{ F:m.F, gn:g.gn, GR:g.GR, gs:g.gs }, stretch:P['record-field'].stretch, turns:m.turns, days:C.days, reach_u:P['record-field'].reach_u, hole_u:P['record-field'].hole_u, s:u, cx:W/2, cy:H/2, treesOnly:true, keep }).draw(x);
    f={ mk, canvas:c, data:x.getImageData(0,0,W,H).data }; e.sub.unshift(f); if(e.sub.length>3)e.sub.length=3; return f; },
  compose(canvas,V,O){ const A=window.ART, S=window.STUDY, T=S.techniques; const W=canvas.width, H=canvas.height, x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const m=S.model(O), P=m.P, st=m.st, u=W/1000, cx=W/2, cy=H/2; const scr=T['am-screen'](P['am-screen'],u,A,V), org=T['origin-dot'](P['origin-dot'],u,A,V), paper=A.hex(V.paper);
    let pic=st.done?null:S.paint(W,H,V,m);
    /* trees leave whole (canopy and shadow), one after another from the plate edge inward, over 0.4–2.8 % of the slider, before the front starts */
    if(pic){ const TR=m.trees, n=TR.n; let mk='', gone=0; const keep=i=>{ const r=TR.rank[i]; return r<0||!(st.D>0.004+0.024*r/Math.max(1,n-1)); }; for(let i=0;i<TR.rank.length;i++){ const k=keep(i); mk+=k?'1':'0'; if(!k)gone++; }
      if(gone===n)pic={ canvas:pic.bare, data:pic.bareData||(pic.bareData=pic.bare.getContext('2d').getImageData(0,0,W,H).data) }; else if(gone>0)pic=S.paintSome(pic,W,H,V,m,keep,mk); }
    if(st.paintOnly){ x.drawImage(pic.canvas,0,0); }
    else { const pd=st.pitch(P['am-screen'].pitch_u)*u, ang=scr.angle, ca=Math.cos(ang), sa=Math.sin(ang); const half=Math.ceil(Math.hypot(W,H)/2/pd)+2, ni=2*half+1, nj=ni;
      const C={ ni, nj, oi:half, oj:half, ar:new Float32Array(ni*nj), pw:new Float32Array(ni*nj), cr:new Float32Array(ni*nj), cg:new Float32Array(ni*nj), cb:new Float32Array(ni*nj) };
      let smd=null, sw=0, shh=0; if(pic){ sw=Math.max(2,Math.round(W/pd)); shh=Math.max(2,Math.round(H/pd)); const sm=A.off(sw,shh), sc=sm.getContext('2d'); sc.imageSmoothingQuality='high'; sc.drawImage(pic.canvas,0,0,sw,shh); smd=sc.getImageData(0,0,sw,shh).data; }
      const g=m.grid, F=m.F, ND=g.nd, gn=g.gn, GR=g.GR, gs=g.gs; const cov0=scr.cover(pd), part=st.part;
      const G8=S._g8||(S._g8=Uint8Array.from({length:256},(_,i)=>Math.round(255*Math.pow(i/255,1.4))));
      const P80=S._p14||(S._p14=Float32Array.from({length:257},(_,i)=>0.9*Math.pow(i/256,1.4)));
      for(let j=-half;j<=half;j++)for(let i=-half;i<=half;i++){ const X=cx+pd*(i*ca-j*sa), Y=cy+pd*(i*sa+j*ca); if(X<-pd||Y<-pd||X>W+pd||Y>H+pd)continue; const c=(j+half)*ni+(i+half);
        const wx=(X-cx)/u, wy=(Y-cy)/u; let fx=(wx+GR)/gs, fy=(wy+GR)/gs; fx=fx<0?0:fx>gn-1.001?gn-1.001:fx; fy=fy<0?0:fy>gn-1.001?gn-1.001:fy; const ix=fx|0, iy=fy|0, tx=fx-ix, ty=fy-iy, o=iy*gn+ix;
        const rec=(F[o]*(1-tx)+F[o+1]*tx)*(1-ty)+(F[o+gn]*(1-tx)+F[o+gn+1]*tx)*ty; const k2=scr.color(rec), ra=scr.area(rec);
        if(!smd){ C.ar[c]=ra; C.cr[c]=k2[0]; C.cg[c]=k2[1]; C.cb[c]=k2[2]; continue; }
        const nd=(ND[o]*(1-tx)+ND[o+1]*tx)*(1-ty)+(ND[o+gn]*(1-tx)+ND[o+gn+1]*tx)*ty;
        let sx=X/W*sw-0.5, sy=Y/H*shh-0.5; sx=sx<0?0:sx>sw-1.001?sw-1.001:sx; sy=sy<0?0:sy>shh-1.001?shh-1.001:sy; const qx=sx|0, qy=sy|0, ux=sx-qx, uy=sy-qy, q=(qy*sw+qx)*4, q2=q+sw*4;
        const cc=st.center(rec,nd,Math.sqrt(wx*wx+wy*wy));
        const pr=(smd[q]*(1-ux)+smd[q+4]*ux)*(1-uy)+(smd[q2]*(1-ux)+smd[q2+4]*ux)*uy, pg=(smd[q+1]*(1-ux)+smd[q+5]*ux)*(1-uy)+(smd[q2+1]*(1-ux)+smd[q2+5]*ux)*uy, pb=(smd[q+2]*(1-ux)+smd[q+6]*ux)*(1-uy)+(smd[q2+2]*(1-ux)+smd[q2+6]*ux)*uy;
        const lum=(0.2126*pr+0.7152*pg+0.0722*pb)/255, ti=A.clamp((1-lum)*1.6-0.05,0,1), ap=P80[(ti*256)|0];
        const tk=st.take(cc), tt=st.tint(cc), pa=cov0+(ap-cov0)*part;
        C.ar[c]=pa+(ra-pa)*tk; C.pw[c]=1-tt; C.cr[c]=k2[0]; C.cg[c]=k2[1]; C.cb[c]=k2[2]; }
      const id=x.createImageData(W,H);
      scr.print(id.data,W,H,cx,cy,pd,C,paper,pic?pic.data:null,part,G8); x.putImageData(id,0,0); }
    const solid=Math.max(P['am-screen'].ink===3?1:0,A.sstep(12,22,P['am-screen'].gain))*st.line; m.turns.draw(x,cx,cy,u,st.line,V.line,{ alpha:0.9*solid, color:V.paper });
    org.draw(x,cx,cy,u,st.near); },
  /* callouts follow the field: the shell hands over its point list once, then asks before every draw */
  onPoints(P){ const S=window.STUDY; S._P=P; S.relayPoints({}); },
  relayPoints(O){ const S=window.STUDY, A=window.ART, P=S._P; if(!P)return; const m=S.model(O||{}), Pf=m.P['record-field'], Pt=m.P['the-turns'], H=Pf.hole_u, R=Pf.reach_u, g=m.grid, F=m.F;
    const den=(x,y)=>{ let fx=(x+g.GR)/g.gs, fy=(y+g.GR)/g.gs; fx=A.clamp(fx,0,g.gn-1.001); fy=A.clamp(fy,0,g.gn-1.001); return F[(fy|0)*g.gn+(fx|0)]; };
    const find=(ok,a0,r0,r1)=>{ for(let k=0;k<90;k++){ const a=(a0+(k%2?1:-1)*Math.ceil(k/2)*4)*Math.PI/180; for(let r=r0;r<=r1;r+=4){ const x=Math.cos(a)*r, y=Math.sin(a)*r; if(ok(den(x,y)))return [x,y]; } } return null; };
    const put=(d,xy)=>{ const p=P.find(t=>t.d===d); if(!p||!xy)return; p.u=A.clamp(0.5+xy[0]/1000,0.04,0.96); p.v=A.clamp(0.5+xy[1]/1000,0.04,0.96); };
    const ang=(x,y,a0)=>{ let d=Math.atan2(y,x)*180/Math.PI-a0; d=((d+540)%360)-180; return Math.abs(d); };
    const segs=m.turns.segs.filter(q=>q.f>=1), nodes=m.turns.nodes, mid=q=>{ const a=nodes[q.a], b=nodes[q.b]; return [(a.x+b.x)/2,(a.y+b.y)/2,b.x-a.x,b.y-a.y]; };
    const near=(list,a0,f)=>list.reduce((best,q)=>{ const xy=f(q); return !best||ang(xy[0],xy[1],a0)<ang(best[0],best[1],a0)?xy:best; },null);
    put('ZERO',[0,0]); put('HOLE',[Math.max(16,H*0.55),0]);
    put('CORE',find(v=>v>0.85,150,H+30,0.6*R)||[-(H+40),40]);
    put('FRNG',find(v=>v>0.04&&v<0.2,0,0.6*R,1.1*R)||[0.9*R,0]);
    put('GAP',find(v=>v<0.08,45,H+36,0.58*R)||find(v=>v<0.04,45,0.6*R,1.2*R));
    put('DIST',find(v=>v>0.5,-25,H+60,0.6*R)||[H+60,-40]);
    put('EDGE',find(v=>v>0.2&&v<0.55,-100,0.45*R,1.0*R)||[0,-0.7*R]);
    const walked=nodes.filter(n=>n.day<=m.P['clearing'].days); put('LOBE',near(walked.length?walked:nodes,-135,n=>[n.x,n.y]));
    if(segs.length){ put('LINE',near(segs,-60,q=>mid(q))); const h=near(segs,160,q=>mid(q)), L=Math.hypot(h[2],h[3])||1, o=Math.min(Pt.line_u*Pt.halo,Pt.halo_max_u)*0.42; put('HALO',[h[0]-h[3]/L*o,h[1]+h[2]/L*o]); }
    else { const n=nodes[0]; put('LINE',[n.x,n.y]); put('HALO',[n.x,n.y]); } },
  render(canvas,w,h,dpr,V,done,O){ window.STUDY.compose(canvas,V,O); if(done)done(); },
  /* motion, 20 s: the record grows from day 6 to day 60 seen from far, the view steps in to the clearing and back out, and the record runs back to day 6 */
  motion(canvas,w,h,dpr,V,t,ctx,UO){ const S=window.STUDY, A=window.ART; const W=canvas.width, H=canvas.height, fw=Math.round(W/2), fh=Math.round(H/2);
    const ph=(t%20)/20, e=q=>q*q*(3-2*q); let dist=100, days=60;
    if(ph<0.4)days=6+54*e(ph/0.4); else if(ph<0.5){} else if(ph<0.7)dist=100*(1-e((ph-0.5)/0.2)); else if(ph<0.76)dist=0; else if(ph<0.92)dist=100*e((ph-0.76)/0.16); else days=60-54*e((ph-0.92)/0.08);
    const O={}; for(const k of Object.keys(UO||{}))O[k]=Object.assign({},UO[k]); O['step-back']=Object.assign({},O['step-back'],{ distance:dist }); O['clearing']=Object.assign({},O['clearing'],{ days:Math.round(days*4)/4 });
    if(!S._f||S._f.width!==fw||S._f.height!==fh)S._f=A.off(fw,fh);
    S.compose(S._f,V,O); ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=true; ctx.drawImage(S._f,0,0,W,H); ctx.restore(); }
};
