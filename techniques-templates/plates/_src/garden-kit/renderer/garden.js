/* ============================================================================
   garden.js — the shared renderer for the Encyclopedia Garden
   ----------------------------------------------------------------------------
   Framework-free. Produces SVG strings. One engine for both the sketchbook
   (specimen mode) and the live map (scene mode).

   The model (see ../briefs/ontology.md):
     MATERIAL  — how the garden is drawn (canon, set once).      -> Garden.setMaterial()
     FORM      — the anatomy primitives (leaf, bloom, bodies).
     ENCODING  — what a mark means; compose(datum) reads data.   -> Garden.compose()
     MOTION    — CSS-driven (see ../visual-system/motion.css).

   Usage:
     Garden.setMaterial({ line:0.8, inter:'print', texture:'grain', ... });
     el.innerHTML = '<svg>...' + Garden.defs() + Garden.compose(datum) + '</svg>';
   Every fill/stroke reads MATERIAL, so re-theming is one setMaterial() + re-render.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---- palette (measured constants — copied, never re-derived) ------------ */
  const SPOT = {
    // section blooms
    techniques:"#e0a52c", atoms:"#d76a37", styles:"#9b5fbf",
    sound:"#3d8fe0", optics:"#12a891", explorations:"#d76392",
    // foliage + structure
    leaf:"#7bab54", leaf2:"#9cc06a", stem:"#4f6c39", center:"#f0efe6",
    // states / attention
    harvest:"#e6b21f", water:"#3d8fe0", prune:"#e58a17",
    // scene furniture
    earth:"#c69a6a", hat:"#e0a52c", shell:"#d98a4a", soil:"#d9cdb0", wood:"#b98a52"
  };
  const INK = "#18211c";

  /* ---- MATERIAL (canon tokens) + FORM (structure) ------------------------- */
  const M = { line:0.8, waver:false, fill:"mixed", inter:"print",
              texture:"grain", dist:"cover", amt:0.5, fine:4 };
  const FORM = { detail:"vein" };
  let SEED = 7;

  /* ---- seeded RNG --------------------------------------------------------- */
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

  /* ---- MATERIAL · <defs>: the textures ------------------------------------
     grain   — granulation, clipped to a shape (multiply overlay)
     soilGrain — same field, used clipped to a bed in scene mode
     dots    — 45° halftone dot screen (printed shade)
     riso    — coverage grain: the spot colour itself breaks up (spot plate)
     falloff — mask that fades a texture from a shape's base to its tip
     keyInk  — hand-nib waver on the keyline
     Returns the inner markup for an <svg> <defs>. Rebuild after any token change
     that affects seed/amount/fineness/line. --------------------------------- */
  function defs(){
    const gFreq=(0.35+M.fine*0.14).toFixed(3);
    const dPitch=(6.2-M.fine).toFixed(2);
    const dR=(0.34+M.amt*0.5).toFixed(2);
    const waverS=(M.line*0.9).toFixed(2);
    const risoFreq=(0.42+M.fine*0.15).toFixed(3);
    const GA=(1.05+M.amt*0.55).toFixed(2), GB=(1-(1.05+M.amt*0.55)*0.55).toFixed(3);
    return `<defs>
      <filter id="grainF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${gFreq}" numOctaves="2" seed="${SEED}" stitchTiles="stitch" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.12  0 0 0 0 0.10  0.85 0 0 0 -0.34"/></filter>
      <pattern id="grain" width="150" height="150" patternUnits="userSpaceOnUse"><rect width="150" height="150" fill="#fff" filter="url(#grainF)"/></pattern>
      <pattern id="soilGrain" width="150" height="150" patternUnits="userSpaceOnUse"><rect width="150" height="150" fill="#fff" filter="url(#grainF)"/></pattern>
      <pattern id="dots" width="${dPitch}" height="${dPitch}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="${(dPitch/2).toFixed(2)}" cy="${(dPitch/2).toFixed(2)}" r="${dR}" fill="${INK}"/></pattern>
      <linearGradient id="foGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#000"/></linearGradient>
      <mask id="falloff" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#foGrad)"/></mask>
      <filter id="riso" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${risoFreq}" numOctaves="2" seed="${SEED}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${GA} ${GB}" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
      <filter id="keyInk" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.021" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${waverS}" xChannelSelector="R" yChannelSelector="G"/></filter>
    </defs>`;
  }

  /* ---- material-aware draw helpers ---------------------------------------- */
  const texMask = () => M.dist==="falloff" ? ' mask="url(#falloff)"' : '';
  const blend   = () => M.inter==="print" ? ' style="mix-blend-mode:multiply"' : '';
  const mrn     = () => M.inter==="print" ? 0.7 : 0;
  const inkT    = () => { const m=mrn(); return m ? ` transform="translate(${m} ${(m*0.75).toFixed(2)})"` : ''; };

  function texOverlay(d){
    if(M.texture==="grain") return `<path d="${d}" fill="url(#grain)" opacity="${M.amt.toFixed(2)}" style="mix-blend-mode:multiply"${texMask()}/>`;
    if(M.texture==="dots")  return `<path d="${d}" fill="url(#dots)"${texMask()}/>`;
    return "";
  }
  // fillShape — the heart of the material grammar. role decides keyline in "mixed".
  function fillShape(d, spot, role){
    const mode=M.fill; let s=""; const showFill=mode!=="ink";
    let showKey; if(mode==="ink"||mode==="fill") showKey=true;
    else showKey=(role==="petal"||role==="center"||role==="berry"||role==="pod");
    if(showFill){
      if(M.texture==="riso") s+=`<path d="${d}" fill="${spot}" filter="url(#riso)"${blend()}/>`;
      else { s+=`<path d="${d}" fill="${spot}"${blend()}/>`; s+=texOverlay(d); }
    }
    if(showKey) s+=`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${M.line}" stroke-linejoin="round" stroke-linecap="round"${M.waver?' filter="url(#keyInk)"':''}${inkT()}/>`;
    return s;
  }
  function inkPath(d, w){ return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${(w||M.line).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"${M.waver?' filter="url(#keyInk)"':''}${inkT()}/>`; }
  function inkLine(x1,y1,x2,y2,w){ return inkPath(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`,w); }
  function circShape(cx,cy,r,spot,role){ return fillShape(`M ${(cx-r).toFixed(1)} ${cy.toFixed(1)} a ${r} ${r} 0 1 0 ${(2*r).toFixed(1)} 0 a ${r} ${r} 0 1 0 ${(-2*r).toFixed(1)} 0 Z`,spot,role); }
  function ellD(cx,cy,rx,ry){ return `M ${(cx-rx).toFixed(1)} ${cy.toFixed(1)} a ${rx} ${ry} 0 1 0 ${(2*rx).toFixed(1)} 0 a ${rx} ${ry} 0 1 0 ${(-2*rx).toFixed(1)} 0 Z`; }

  /* ---- FORM · leaf (organic, veined/serrate) ------------------------------ */
  function rp(x,y,ang,a,p){return [ +(x+Math.cos(ang)*a - Math.sin(ang)*p).toFixed(2), +(y+Math.sin(ang)*a + Math.cos(ang)*p).toFixed(2) ];}
  function leafShape(x,y,ang,len){
    const w=len*0.30, N=18, bend=len*0.13, serr=FORM.detail==="serrate";
    function edge(sign){const pts=[];for(let i=0;i<=N;i++){const t=i/N;const env=Math.sin(Math.PI*Math.pow(t,0.72));
      let width=w*env*(sign>0?1:0.9); if(serr) width*=(1+0.12*Math.sin(t*20+(sign>0?0:1.6)));
      pts.push(rp(x,y,ang,t*len,sign*width+Math.sin(Math.PI*t)*bend));} return pts;}
    const all=edge(1).concat(edge(-1).reverse());
    if(serr) return "M"+all.map(p=>p.join(" ")).join(" L")+" Z";
    let d="M"+all[0].join(" ");
    for(let i=1;i<all.length-1;i++){const mx=((all[i][0]+all[i+1][0])/2).toFixed(1),my=((all[i][1]+all[i+1][1])/2).toFixed(1);d+=` Q${all[i][0]} ${all[i][1]} ${mx} ${my}`;}
    return d+" Z";
  }
  function leafVeins(x,y,ang,len){
    const bend=len*0.13; let s=""; const N=8,mp=[];
    for(let i=0;i<=N;i++){const t=i/N;mp.push(rp(x,y,ang,t*len,Math.sin(Math.PI*t)*bend));}
    let d="M"+mp[0].join(" ");for(let i=1;i<mp.length;i++)d+=" L"+mp[i].join(" ");
    s+=inkPath(d,M.line*0.62);
    if(FORM.detail==="flat") return s;
    for(let k=1;k<=4;k++){const t=k/5;const cam=Math.sin(Math.PI*t)*bend;const base=rp(x,y,ang,t*len,cam);
      const ww=len*0.28*Math.sin(Math.PI*Math.pow(t,0.72));
      s+=inkPath(`M${base.join(" ")} L${rp(x,y,ang,t*len+len*0.11,ww*0.85+cam).join(" ")}`,M.line*0.48);
      s+=inkPath(`M${base.join(" ")} L${rp(x,y,ang,t*len+len*0.11,-ww*0.85+cam).join(" ")}`,M.line*0.48);}
    return s;
  }
  function drawLeaf(x,y,ang,len,col){ return fillShape(leafShape(x,y,ang,len),col,"leaf")+leafVeins(x,y,ang,len); }

  /* ---- FORM · blooms (bloom TYPE encodes section) ------------------------- */
  function bloom(section,cx,cy,r,rng,spotOverride){
    const col=spotOverride||SPOT[section]||"#8a8a5a"; let s="";
    if(section==="optics"){
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const ex=cx+Math.cos(a)*r*0.72,ey=cy+Math.sin(a)*r*0.72;
        s+=`<g transform="rotate(${(a*180/Math.PI).toFixed(0)} ${ex.toFixed(1)} ${ey.toFixed(1)})">${fillShape(ellD(ex,ey,r*0.5,r*0.2),col,"petal")}</g>`;}
      s+=circShape(cx,cy,r*0.46,SPOT.techniques,"center");
    } else if(section==="techniques"){
      for(let i=0;i<7;i++){const a=(-0.62+i*0.205)-1.57;s+=inkPath(`M${cx} ${cy} L${(cx+Math.cos(a)*r*1.28).toFixed(1)} ${(cy+Math.sin(a)*r*1.28).toFixed(1)}`,M.line*1.0);}
      s+=circShape(cx,cy,r*0.52,col,"pod");
    } else if(section==="atoms"){
      [[0,0],[-0.62,-0.3],[0.6,-0.22],[-0.34,0.5],[0.42,0.46]].forEach(([dx,dy])=>{s+=circShape(cx+dx*r,cy+dy*r,r*0.42,col,"berry");});
    } else if(section==="styles"){
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const ex=cx+Math.cos(a)*r*0.5,ey=cy+Math.sin(a)*r*0.5;
        s+=`<g transform="rotate(${(a*180/Math.PI).toFixed(0)} ${ex.toFixed(1)} ${ey.toFixed(1)})">${fillShape(ellD(ex,ey,r*0.58,r*0.32),col,"petal")}</g>`;}
      s+=circShape(cx,cy,r*0.36,SPOT.center,"center");
    } else if(section==="sound"){
      for(let i=3;i>=1;i--){const rr=r*0.46*i;s+=inkPath(`M ${cx-rr} ${cy} a ${rr} ${rr} 0 1 0 ${2*rr} 0 a ${rr} ${rr} 0 1 0 ${-2*rr} 0`,M.line*0.85);}
      s+=circShape(cx,cy,r*0.26,col,"center");
    } else {
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const ex=cx+Math.cos(a)*r*0.7,ey=cy+Math.sin(a)*r*0.7;
        s+=`<g transform="rotate(${(a*180/Math.PI).toFixed(0)} ${ex.toFixed(1)} ${ey.toFixed(1)})">${fillShape(ellD(ex,ey,r*0.5,r*0.19),col,"petal")}</g>`;}
      s+=circShape(cx,cy,r*0.34,SPOT.harvest,"center");
    }
    return s;
  }
  function pompom(cx,cy,r,rng,col){let s="";const N=48;
    for(let i=0;i<N;i++){const a=-Math.PI+(i/(N-1))*Math.PI+(rng()-0.5)*0.05;const ll=r*(0.78+rng()*0.5);
      const ex=cx+Math.cos(a)*ll,ey=cy+Math.sin(a)*ll*0.92;
      s+=inkPath(`M${cx.toFixed(1)} ${cy.toFixed(1)} Q ${(cx+Math.cos(a)*ll*0.55+(rng()-0.5)*3).toFixed(1)} ${(cy+Math.sin(a)*ll*0.5).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,M.line*0.46);
      s+=`<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${(0.85+rng()*0.6).toFixed(2)}" fill="${col}"${blend()}/>`;}
    return s;}
  function feather(x,y,ang,len,col){let s="";const N=11;const rp2=(a,p)=>rp(x,y,ang,a,p);
    const mp=[];for(let i=0;i<=N;i++){const t=i/N;mp.push(rp2(t*len,Math.sin(Math.PI*t)*len*0.08));}
    let d="M"+mp[0].join(" ");for(let i=1;i<mp.length;i++)d+=" L"+mp[i].join(" ");s+=inkPath(d,M.line*0.6);
    for(let k=1;k<=N-1;k++){const t=k/N;const cam=Math.sin(Math.PI*t)*len*0.08;const b=rp2(t*len,cam),ll=len*0.16*Math.sin(Math.PI*t);
      s+=inkPath(`M${b.join(" ")} L${rp2(t*len+ll*0.5,cam+ll).join(" ")}`,M.line*0.4);
      s+=inkPath(`M${b.join(" ")} L${rp2(t*len+ll*0.5,cam-ll).join(" ")}`,M.line*0.4);}
    return s;}

  /* ---- ENCODING · height = lifecycle -------------------------------------- */
  function heightFor(lifecycle,conn){ return lifecycle==="seedling"?92 : lifecycle==="established"?176+conn*8 : 150; }

  // normal plant body (technique/atom/style/etc). Returns parts for reuse (motion).
  function growBody(d, baseX, baseY){
    const section=d.section||"explorations", lifecycle=d.lifecycle||"growing", conn=d.conn||0;
    const rng=mulberry32(hash(section+lifecycle+conn+(d.kind||"")+"::"+SEED));
    const bx=baseX, by=baseY, H=heightFor(lifecycle,conn);
    const sway=(rng()-0.5)*30, topx=bx+sway*0.7, topy=by-H;
    const stemD=`M${bx} ${by} C ${(bx+sway*0.4).toFixed(1)} ${(by-H*0.4).toFixed(1)} ${(bx+sway).toFixed(1)} ${(by-H*0.7).toFixed(1)} ${topx.toFixed(1)} ${topy.toFixed(1)}`;
    const roots=inkPath(`M${bx} ${by} q -7 22 -3 40 M${bx} ${by} q 8 20 3 42`,M.line*0.72);
    const stem=inkPath(stemD,M.line*1.1);
    const nLeaf=lifecycle==="seedling"?2:3+conn; const leaves=[];
    for(let i=0;i<nLeaf;i++){const t=0.24+i/(nLeaf)*0.7;const lx=bx+sway*0.4*t,ly=by-H*t;const side=i%2?1:-1;
      const len=lifecycle==="seedling"?16:22+conn*1.5;
      leaves.push(drawLeaf(lx,ly,(side>0?-0.5:Math.PI+0.5)+(rng()-0.5)*0.28,len,rng()>0.5?SPOT.leaf:SPOT.leaf2));}
    if(lifecycle==="established"&&conn>0){const by2=by-H*0.55,bx2=bx+sway*0.35;
      leaves.push(inkPath(`M${bx2.toFixed(1)} ${by2.toFixed(1)} q 18 -7 27 -24`,M.line*0.9)+drawLeaf(bx2+27,by2-24,-1.0,17,SPOT.leaf));}
    let head;
    if(lifecycle==="seedling") head=drawLeaf(topx,topy,-2.1,16,SPOT.leaf2)+drawLeaf(topx,topy,-1.0,16,SPOT.leaf2)+circShape(topx,topy,3,SPOT.optics,"center");
    else head=bloom(section,topx,topy,11+conn*1.1,rng, d.harvested?SPOT.harvest:null);
    return {roots,stem,stemD,leaves,head,topx,topy,H,bx,by};
  }
  // ENCODING · attention[] + harvested = overlays ON TOP of the lifecycle plant
  function overlays(g, attention, harvested, anim){
    let s="";
    if(attention.indexOf("water")>=0){ const drop=`<path d="M${g.topx} ${g.topy-26} q 6 10 0 16 q -6 -6 0 -16 z" fill="${SPOT.water}"/>`;
      s+= anim? `<g class="drip">${drop}</g>` : `<g>${drop}</g>`; }
    if(attention.indexOf("prune")>=0){
      s+=`<circle cx="${g.bx}" cy="${(g.by-g.H*0.5).toFixed(0)}" r="26" fill="none" stroke="${SPOT.prune}" stroke-dasharray="3 4" stroke-width="1.3"/>`;
      s+=inkPath(`M${g.bx-10} ${(g.by-g.H*0.5).toFixed(0)} l20 14 M${g.bx+10} ${(g.by-g.H*0.5).toFixed(0)} l-20 14`,M.line*0.9); }
    if(harvested){
      s+=`<circle cx="${g.topx}" cy="${g.topy}" r="20" fill="${SPOT.harvest}" opacity="0.16"/>`;
      s+=`<g transform="translate(${g.bx},${g.by+16})">${fillShape('M-10 0 a10 10 0 0 1 20 0 z',SPOT.earth,'pod')}<path d="M-11 0 h22" stroke="${INK}" stroke-width="${M.line}"/></g>`; }
    return s;
  }

  /* ---- FORM · special bodies (KIND encodes silhouette) -------------------- */
  function spiralPath(cx,cy,rMax,turns){let d="";const N=Math.round(turns*26);
    for(let i=0;i<=N;i++){const t=i/N;const ang=t*turns*Math.PI*2-1.6;const r=rMax*Math.pow(t,0.92);d+=(i?" L":"M")+(cx+Math.cos(ang)*r).toFixed(1)+" "+(cy+Math.sin(ang)*r).toFixed(1);}return d;}
  function stumpBody(d,bx,by){ let s=inkPath(`M${bx} ${by} q -6 16 -2 30`,M.line*0.7);
    s+=fillShape(`M${bx-15} ${by} h30 v-24 a15 6 0 0 0 -30 0 z`,"#bcb6a4","pod");
    s+=`<ellipse cx="${bx}" cy="${by-24}" rx="15" ry="6" fill="#a7a08b"/>`;
    s+=inkPath(`M${bx-9} ${by-24} a9 3.6 0 1 0 18 0`,M.line*0.7)+inkPath(`M${bx-4} ${by-24} a4 1.6 0 1 0 8 0`,M.line*0.6);
    if(d.lifecycle==="seedling") s+=inkPath(`M${bx+4} ${by-24} q 10 -14 4 -30`,M.line)+drawLeaf(bx+6,by-42,-1.2,11,"#37b23a");
    return s;}
  function taskBody(d,bx,by){const H=64;let s=inkLine(bx,by,bx,by-H,M.line*1.4);
    s+=fillShape(`M${bx-2} ${by-H-2} h26 v16 h-26 z`,"#fbfdfc","pod");
    s+=`<text x="${bx+11}" y="${by-H+10}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="${INK}">${d.attention&&d.attention.indexOf('water')>=0?'H₂O':'✂'}</text>`;
    return s;}
  function moundInner(anim){const cx=100,cy=170;let s=fillShape(`M${cx-42} ${cy} Q ${cx-50} ${cy-74} ${cx} ${cy-84} Q ${cx+50} ${cy-74} ${cx+42} ${cy} Z`,SPOT.stem,"leaf");
    for(let i=0;i<9;i++){const a=-2.6+i*0.34;s+=inkPath(`M${cx} ${cy-10} L${(cx+Math.cos(a)*40).toFixed(0)} ${(cy-10+Math.sin(a)*40).toFixed(0)}`,M.line*0.75);}
    const curl=inkPath(`M${cx+12} ${cy-98} a 12 12 0 1 0 -4 9`,M.line*1.15)+inkPath(`M${cx+12} ${cy-106} L${cx+12} ${cy-97} L${cx+3} ${cy-99}`,M.line*1.15);
    s+= anim? `<g class="curl">${curl}</g>` : curl; return s;}
  function groveInner(){const rng=mulberry32(hash("grove"+SEED));const bx=100,by=244;let s="";
    for(let i=0;i<11;i++){const gx=bx+(i-5)*13+(rng()-0.5)*7;const gh=60+rng()*70;
      s+=inkPath(`M${gx.toFixed(1)} ${by} q ${(rng()*10-5).toFixed(1)} ${(-gh*0.6).toFixed(1)} ${(rng()*8-4).toFixed(1)} ${(-gh).toFixed(1)}`,M.line*0.85);
      s+=drawLeaf(gx,by-gh*0.6,-1.9+rng(),11+rng()*6,rng()>0.5?SPOT.leaf:SPOT.leaf2);
      s+=circShape(gx,by-gh,2.6+rng()*1.5,SPOT.techniques,"berry");}
    return s;}

  const svgWrap=(inner,vb)=>`<svg viewBox="${vb||'0 0 200 260'}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;

  /* ---- ENCODING · compose(datum) — the one entry point -------------------- */
  // datum: { section, kind, lifecycle:'seedling|growing|established',
  //          attention:['water'|'prune'], harvested:bool, conn:int }
  function compose(d, baseX, baseY){
    const bx=baseX||100, by=baseY||244; const kind=d.kind||"atom";
    if(kind==="grove") return groveInner();
    if(kind==="stump") return stumpBody(d,bx,by);
    if(kind==="task")  return taskBody(d,bx,by);
    if(kind==="perennial") return moundInner(false);
    const g=growBody(d,bx,by);
    let inner=g.roots+g.stem+g.leaves.join("")+g.head+overlays(g,d.attention||[],d.harvested,false);
    if(d.harvested) inner=`<g opacity="0.62">${inner}</g>`;
    return inner;
  }
  const specimen=(d,vb)=>svgWrap(compose(d),vb);

  /* ---- SCENE MODE · furniture (beds, soil, signs) ------------------------- */
  // A drawn raised bed with soil grain CLIPPED to the bed (never a page wash),
  // plants grounded with cast shadows, and a staked signpost.
  function bed(opts){
    opts=opts||{};
    const W=opts.W||260,H=opts.H||190, bx=24,by=96,bw=W-48,bh=64;
    const id="bc"+Math.random().toString(36).slice(2,7);
    const label=opts.label||"BED";
    const plants=opts.plants||[["styles","growing"],["optics","established"],["atoms","seedling"]];
    let s=`<clipPath id="${id}"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4"/></clipPath>`;
    s+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="${SPOT.soil}"${blend()}/>`;
    s+=`<g clip-path="url(#${id})"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#soilGrain)" opacity="0.6" style="mix-blend-mode:multiply"/></g>`;
    s+=fillShape(`M${bx} ${by+bh} h${bw} v14 h${-bw} z`,SPOT.wood,"pod");
    s+=inkPath(`M${bx} ${by} h${bw} M${bx} ${by+bh} h${bw} M${bx} ${by} v${bh+14} M${bx+bw} ${by} v${bh+14}`,M.line*0.9);
    const n=plants.length;
    plants.forEach((p,i)=>{const px=bx+ (bw)*((i+0.5)/n), py=by+bh-6;const [sec,lc]=p;
      s+=`<ellipse cx="${px}" cy="${py+2}" rx="18" ry="4" fill="${INK}" opacity="0.08"/>`;
      const g=growBody({section:sec,lifecycle:lc,conn:lc==="established"?2:0},100,244);
      s+=`<g transform="translate(${px.toFixed(1)} ${py}) scale(0.4) translate(-100 -244)">${g.roots+g.stem+g.leaves.join("")+g.head}</g>`;});
    s+=inkLine(bx+8,by-2,bx+8,by-30,M.line*1.1);
    const tw=Math.max(46,label.length*6.4);
    s+=fillShape(`M${bx+6} ${by-44} h${tw} v16 h${-tw} z`,"#fbfdfc","pod");
    s+=`<text x="${bx+6+tw/2}" y="${by-33}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8" letter-spacing="1" fill="${INK}">${label}</text>`;
    return svgWrap(s,`0 0 ${W} ${H}`);
  }

  /* ---- GARDENER characters ------------------------------------------------ */
  const gardeners = {
    mound(){ return svgWrap(moundInner(false),"0 0 200 210"); },
    snail(){ const cx=98,cy=152,bodyCol="#e6d5b4",shcx=cx-10,shcy=cy-18,shr=33;let s="";
      s+=`<ellipse cx="${cx}" cy="${cy+40}" rx="60" ry="6" fill="${INK}" opacity="0.06"/>`;
      s+=fillShape(`M ${cx-56} ${cy+30} C ${cx-72} ${cy+22} ${cx-66} ${cy+4} ${cx-46} ${cy+6} C ${cx-18} ${cy} ${cx+30} ${cy} ${cx+54} ${cy+10} C ${cx+72} ${cy+17} ${cx+74} ${cy+32} ${cx+60} ${cy+36} C ${cx+50} ${cy+39} ${cx+46} ${cy+38} ${cx+38} ${cy+38} L ${cx-44} ${cy+38} C ${cx-54} ${cy+38} ${cx-56} ${cy+36} ${cx-56} ${cy+30} Z`,bodyCol,"petal");
      s+=circShape(shcx,shcy,shr,SPOT.shell,"berry");
      s+=`<path d="M ${shcx-shr*0.5} ${shcy-shr*0.4} a ${shr*0.6} ${shr*0.6} 0 0 1 ${shr*0.7} ${-shr*0.2}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity="0.28"/>`;
      s+=inkPath(spiralPath(shcx,shcy,shr*0.8,2.7),M.line*0.9);
      s+=inkPath(`M${shcx+2} ${shcy-shr+2} q -1 -8 -5 -12`,M.line*0.7)+drawLeaf(shcx-3,shcy-shr-10,-2.0,11,SPOT.leaf)+drawLeaf(shcx-3,shcy-shr-10,-1.15,9,SPOT.leaf2);
      const hx=cx+52,hy=cy+14;
      s+=inkPath(`M${hx-2} ${hy+4} Q ${hx-8} ${hy-14} ${hx-9} ${hy-30}`,M.line*0.85)+inkPath(`M${hx+7} ${hy+4} Q ${hx+12} ${hy-16} ${hx+15} ${hy-34}`,M.line*0.85);
      s+=`<circle cx="${hx-9}" cy="${hy-32}" r="4.2" fill="${INK}"/><circle cx="${hx-7.4}" cy="${hy-33.6}" r="1.4" fill="#fff"/>`;
      s+=`<circle cx="${hx+15}" cy="${hy-36}" r="4.2" fill="${INK}"/><circle cx="${hx+16.6}" cy="${hy-37.6}" r="1.4" fill="#fff"/>`;
      s+=`<circle cx="${hx+2}" cy="${hy+10}" r="3.4" fill="#e58bb0" opacity="0.5"/>`+inkPath(`M${hx-3} ${hy+11} q 6 5 12 0`,M.line*0.8);
      return svgWrap(s,"0 0 200 220"); },
    tender(){ const cx=100,cy=140;let s="";
      s+=fillShape(`M${cx-26} ${cy+70} Q ${cx-30} ${cy} ${cx} ${cy-4} Q ${cx+30} ${cy} ${cx+26} ${cy+70} Z`,SPOT.stem,"petal");
      s+=circShape(cx,cy-16,18,"#e9d9c2","berry");
      s+=`<circle cx="${cx-6}" cy="${cy-18}" r="1.6" fill="${INK}"/><circle cx="${cx+6}" cy="${cy-18}" r="1.6" fill="${INK}"/>`;
      s+=inkPath(`M${cx-5} ${cy-11} q 5 4 10 0`,M.line*0.8);
      s+=fillShape(`M${cx-30} ${cy-30} Q ${cx} ${cy-24} ${cx+30} ${cy-30} Q ${cx} ${cy-20} ${cx-30} ${cy-30} Z`,SPOT.hat,"petal");
      s+=fillShape(`M${cx-13} ${cy-30} Q ${cx-11} ${cy-46} ${cx} ${cy-47} Q ${cx+11} ${cy-46} ${cx+13} ${cy-30} Z`,SPOT.hat,"petal");
      s+=inkPath(`M${cx+22} ${cy+18} q 16 2 22 -10`,M.line*1.0)+fillShape(`M${cx+44} ${cy+4} l6 -10 l4 3 l-6 10 z`,SPOT.earth,"pod");
      s+=inkPath(`M${cx-40} ${cy+72} q 0 -14 -6 -22`,M.line*0.8)+drawLeaf(cx-46,cy+50,-1.9,13,SPOT.leaf);return svgWrap(s,"0 0 200 230"); },
    sprite(){ const cx=100,cy=150;let s="";
      s+=inkPath(`M${cx} ${cy+70} C ${cx-8} ${cy+30} ${cx+8} ${cy} ${cx} ${cy-16}`,M.line*1.3);
      s+=fillShape(ellD(cx,cy+30,20,30),SPOT.leaf,"petal");
      s+=`<circle cx="${cx-6}" cy="${cy+24}" r="2" fill="${INK}"/><circle cx="${cx+6}" cy="${cy+24}" r="2" fill="${INK}"/>`;
      s+=inkPath(`M${cx-5} ${cy+32} q 5 5 10 0`,M.line*0.9);
      s+=`<circle cx="${cx-11}" cy="${cy+30}" r="2.4" fill="#e58bb0" opacity="0.6"/><circle cx="${cx+11}" cy="${cy+30}" r="2.4" fill="#e58bb0" opacity="0.6"/>`;
      s+=drawLeaf(cx-18,cy+34,Math.PI-0.2,16,SPOT.leaf2)+drawLeaf(cx+18,cy+34,0.2,16,SPOT.leaf2);
      s+=drawLeaf(cx,cy-14,-2.2,18,SPOT.leaf)+drawLeaf(cx,cy-14,-0.9,18,SPOT.leaf);return svgWrap(s,"0 0 200 240"); },
    hedgehog(){ const cx=100,cy=158;let s="";
      s+=fillShape(`M${cx-46} ${cy+34} q -2 -34 40 -36 q 34 -2 40 20 q 4 16 -14 20 q -40 8 -66 -4 z`,SPOT.earth,"petal");
      s+=`<circle cx="${cx+34}" cy="${cy+8}" r="2" fill="${INK}"/><circle cx="${cx+44}" cy="${cy+16}" r="2.6" fill="${INK}"/>`;
      const rng=mulberry32(hash("hog"+SEED));
      for(let i=0;i<12;i++){const t=i/11;const bxp=cx-40+t*66,byp=cy+(Math.sin(t*Math.PI)*-22)+6;s+=drawLeaf(bxp,byp,-1.9+(t-0.5)*1.2,12+rng()*6,i%2?SPOT.leaf:SPOT.leaf2);}
      s+=inkLine(cx-28,cy+30,cx-28,cy+38,M.line)+inkLine(cx+6,cy+32,cx+6,cy+40,M.line);return svgWrap(s,"0 0 200 230"); }
  };

  /* ---- public API --------------------------------------------------------- */
  global.Garden = {
    // config
    setMaterial(t){ Object.assign(M,t||{}); return this; },
    getMaterial(){ return Object.assign({}, M); },
    setForm(t){ Object.assign(FORM,t||{}); return this; },
    seed(n){ SEED = (n==null? Math.floor(Math.random()*9999) : n|0); return this; },
    tokens(){ return { material:Object.assign({},M), form:Object.assign({},FORM), palette:SPOT, ink:INK }; },
    // render
    defs, compose, specimen, bed, gardeners,
    // primitives (for extending)
    prims:{ fillShape, inkPath, inkLine, circShape, ellD, drawLeaf, leafShape, bloom, pompom, feather, growBody, overlays, mulberry32, hash, svgWrap },
    palette:SPOT, INK
  };
})(typeof window!=="undefined" ? window : globalThis);
