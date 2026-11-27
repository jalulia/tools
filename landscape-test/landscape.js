
/* ===================== Ki Soundscape ============================
   Built ON the Ki Landscape engine — same OKLab color science, biome
   palettes, ridgeYs terrain, whisper-fold edge treatment, and paper/
   wash/granulation tiles. Restructured for 60fps audio animation:
   noise generators are cached once and scrolled by a phase; the two
   heavy per-band composites are consolidated into single global passes.
   The look is the landscape tool's; the motion is new.
   Test adaptation: TS-16 blue sky with cached, seeded stipple banks.
======================================================================*/

/* ---- OKLab (verbatim from the landscape engine) ---- */
function s2l(x){x/=255;return x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4;}
function rgbToOklch(r,g,b){r=s2l(r);g=s2l(g);b=s2l(b);
  let l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b),m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b),s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
  let L=0.2104542553*l+0.7936177850*m-0.0040720468*s,A=1.9779984951*l-2.4285922050*m+0.4505937099*s,B=0.0259040371*l+0.7827717662*m-0.8086757660*s;
  return {L,C:Math.hypot(A,B),H:(Math.atan2(B,A)*180/Math.PI+360)%360};}
function oklabToRgb(L,a,b){let l=(L+0.3963377774*a+0.2158037573*b)**3,m=(L-0.1055613458*a-0.0638541728*b)**3,s=(L-0.0894841775*a-1.2914855480*b)**3;
  let r=4.0767416621*l-3.3077115913*m+0.2309699292*s,g=-1.2684380046*l+2.6097574011*m-0.3413193965*s,bl=-0.0041960863*l-0.7034186147*m+1.7076147010*s;
  const f=x=>{x=Math.max(0,Math.min(1,x));return Math.round((x<=0.0031308?12.92*x:1.055*x**(1/2.4)-0.055)*255);};return [f(r),f(g),f(bl)];}
const okToLab=ok=>({L:ok.L,a:ok.C*Math.cos(ok.H*Math.PI/180),b:ok.C*Math.sin(ok.H*Math.PI/180)});
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const labStr=l=>'rgb('+oklabToRgb(l.L,l.a,l.b).join(',')+')';
const hex2rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function smooth(a,b,x){if(a===b)return x<a?0:1;const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
const lerpLab=(p,q,t)=>({L:lerp(p.L,q.L,t),a:lerp(p.a,q.a,t),b:lerp(p.b,q.b,t)});

/* ---- biome palettes (verbatim). Swap to ki-brandworld.tokens.json here. ---- */
const BIOMES={maple:{label:'Maple Coffee',hex:['#CBA664','#9C6734','#6E4C2C','#332926']},
  hokkaido:{label:'Hokkaido Mint',hex:['#97C0A4','#738F7D','#3E6956','#18332A']},
  yuzu:{label:'Yuzu Mint',hex:['#B7BA62','#889A42','#226727','#2D3527']},
  cola:{label:'Tokyo Cola',hex:['#D14C4F','#A7122B','#602029','#2D1F21']},
  satsuma:{label:'Satsuma Citrus',hex:['#D9C130','#DBA71F','#E09131','#D37526']}};
for(const k in BIOMES)BIOMES[k].labs=BIOMES[k].hex.map(h=>okToLab(rgbToOklch(...hex2rgb(h))));
const BKEYS=Object.keys(BIOMES);
function biomeLab(labs,t){const n=labs.length-1,i=Math.min(n-1,Math.floor(t*n)),u=t*n-i;return lerpLab(labs[i],labs[i+1],u);}
/* Blue from TS-16, opening into a cool pale horizon. */
const SKY_TOP=okToLab(rgbToOklch(98,152,193)), SKY_HOR=okToLab(rgbToOklch(215,230,235)), SUN_RGB=[0xec,0xd5,0x6b];

/* ---- noise (verbatim) ---- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function makeNoise(seed,nodes){const r=mulberry32(seed);const a=new Array(nodes);for(let i=0;i<nodes;i++)a[i]=r()*2-1;
  return x=>{const i=Math.floor(x),f=x-i;const a0=a[((i%nodes)+nodes)%nodes],a1=a[(((i+1)%nodes)+nodes)%nodes];const u=f*f*f*(f*(f*6-15)+10);return a0+(a1-a0)*u;};}

/* ---- texture tiles (verbatim) + baked granulation mask ---- */
function noiseLayer(size,cells,seed){const r=mulberry32(seed),g=new Float32Array(cells*cells);for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{const fx=x/size*cells,fy=y/size*cells;const xi=Math.floor(fx),yi=Math.floor(fy),x0=((xi%cells)+cells)%cells,y0=((yi%cells)+cells)%cells,x1=(x0+1)%cells,y1=(y0+1)%cells;
    let tx=fx-xi,ty=fy-yi;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);
    const a=g[y0*cells+x0],b=g[y0*cells+x1],c=g[y1*cells+x0],d=g[y1*cells+x1];return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;};}
function fbm(size,octaves,baseCells,seed){const ls=[];let cells=baseCells;for(let o=0;o<octaves;o++){ls.push({fn:noiseLayer(size,cells,seed+o*317),amp:Math.pow(0.55,o)});cells=Math.min(size,cells*2);}
  return (x,y)=>{let v=0,n=0;for(const L of ls){v+=L.fn(x,y)*L.amp;n+=L.amp;}return v/n;};}
function noiseCanvas(size,fn,base,spread){const c=document.createElement('canvas');c.width=c.height=size;const cx=c.getContext('2d'),id=cx.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const v=clamp(base+(fn(x,y)-0.5)*spread,0,255),i=(y*size+x)*4;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255;}cx.putImageData(id,0,0);return c;}
let grainTile,washTile,mottleTile,mottlePat;
function buildTiles(){
  // paper grain — FINE tooth, MID-GREY (128) so SOFT-LIGHT perturbs luminance both ways (mean preserved) = tooth, NOT a darkening film
  // razor grain — PER-PIXEL speckle (sharp 1px tooth), NOT smooth value-noise (which made soft ~2px blobs = 'clunky').
  // noiseCanvas calls fn once per pixel in scan order, so a stateful PRNG gives true per-pixel white noise; a gentle
  // low-freq fbm adds paper-fibre variation so it isn't flat TV static.
  const grng=mulberry32(7), gfib=fbm(256,3,40,21);
  grainTile=noiseCanvas(256,(x,y)=>0.5+(grng()-0.5)*0.85+(gfib(x,y)-0.5)*0.35,128,80);
  const wf=fbm(256,4,6,55);washTile=noiseCanvas(256,wf,128,128);
  // mottle — FINER pigment field (smaller scale) for granulation + edge pooling
  const mf=fbm(256,6,46,91),mg2=fbm(256,5,104,131);
  mottleTile=noiseCanvas(256,(x,y)=>0.5+(mf(x,y)-0.5)*0.7+(mg2(x,y)-0.5)*0.42,206,90);
  mottlePat=document.createElement('canvas').getContext('2d').createPattern(mottleTile,'repeat');  // for edge pooling
}
buildTiles();
/* per-band wavelength → converts the journey scroll to pixels so surface texture travels WITH the land */
function wlOf(layer){const n=NC&&NC[layer];return n?lerp(0.8,2.7,ST.rug)*n.wlVar:1.4;}
/* edge-pooling scratch buffer */
let PL,PLX,plKey=null;
function ensurePL(W,H){const key=W+'x'+H;if(plKey===key)return;plKey=key;if(!PL){PL=document.createElement('canvas');PLX=PL.getContext('2d');}PL.width=W;PL.height=H;}

/* ===================== STATE ===================== */
/* each world is a set of 3 biomes; as we travel, regions of each drift past, and each biome reacts to its OWN band (0→bass, 1→mid, 2→treble) */
const COMP={
  hokkaido:['hokkaido','satsuma','yuzu'],
  yuzu:    ['yuzu','maple','hokkaido'],
  maple:   ['maple','cola','hokkaido'],
  cola:    ['cola','maple','yuzu'],
  satsuma: ['satsuma','hokkaido','maple']
};
/* per-biome landform personality — the tool's per-flavor form deltas (Lift / Crest↔Trough / Wave height /
   Wave breadth / Detail), scaled live by ST.variety. As a biome region drifts past, the terrain takes on
   its character, so the scroll is never one uniform shape. */
const BFORM={
  hokkaido:{mv:-0.10, amp:-0.05, dens:0.00, peakW:+0.14, lift:-0.05},   // calm broad swell, sits LOW
  yuzu:    {mv:+0.14, amp:+0.07, dens:+0.05, peakW:0.00, lift:+0.06},   // gentle rolling
  maple:   {mv:+0.24, amp:+0.09, dens:+0.02, peakW:-0.06, lift:+0.09},  // rolling hills
  cola:    {mv:+0.52, amp:+0.18, dens:+0.06, peakW:-0.22, lift:+0.17},  // dramatic crests, rides HIGH
  satsuma: {mv:+0.22, amp:+0.11, dens:-0.05, peakW:+0.16, lift:+0.10}   // broad tall dunes
};
const ST={
  flavor:'hokkaido', seed:2471, sun:true, react:0.5, volume:0.85, playing:false,
  g:{layers:11, amp:0.30, dens:0.16, haze:0.50, mv:0.0, peakW:0.62}, rug:0.52, hAvg:0.43, relief:0.55,
  wash:0.5, crest:0.34, epool:0.30, grain:0.42, gran:0.28, edge:0.5, variety:0.8,
  sunPos:{x:0.72,y:0.17,size:0.55},
  compP:null,compT:null,fade:1, autoCycle:false, autoT:0, _last:0,
  bass:0,mid:0,treble:0,rms:0,beat:0, journey:0, journeyC:0,
  reduced:matchMedia('(prefers-reduced-motion: reduce)').matches
};
const labsOf=k=>BIOMES[k].labs.map(l=>({...l}));
const compOf=f=>COMP[f].map(labsOf);
ST.compP=compOf(ST.flavor);ST.compT=compOf(ST.flavor);

/* per-(seed,layers,rug) noise cache — built once, scrolled by phase each frame */
let NC=null, ncKey=null, CZ=null, CZ2=null;
function buildCZ(){CZ=makeNoise(ST.seed*53+7,8);CZ2=makeNoise(ST.seed*97+13,11);}  // color-zone + outcrop fields
function buildNC(){const N=ST.g.layers,rug=ST.rug,oct=3+Math.round(rug*4),nodes=6+Math.round(rug*12);
  buildCZ();
  NC=[];for(let layer=0;layer<N;layer++){const set=[];for(let o=0;o<oct;o++)set.push(makeNoise(ST.seed*131+layer*977+o*53,nodes));
    const sr=mulberry32(ST.seed*7+layer*101+999), wlVar=0.7+sr()*0.85;
    NC.push({set,detail:makeNoise(ST.seed*333+layer*61,48),ridge:makeNoise(ST.seed*555+layer*71,5),
      mvN:makeNoise(ST.seed*211+layer*89,7),       // travels: which stretches are peaky (+) vs valleyed (-)
      elev:makeNoise(ST.seed*709+layer*131,6),     // travels: broad plateaus / basins (the 'rise' analog)
      wlVar});}  // ridge = long-wavelength rolling landforms
  ncKey=ST.seed+'_'+N+'_'+rug;}
buildNC();
/* deterministic per-(world-cell,layer) landform RNG -> stable features that scroll in/out, never re-rolled per frame */
function cellRnd(cell,layer){let h=(Math.imul(cell|0,73856093)^Math.imul(layer|0,19349663)^Math.imul(ST.seed|0,83492791))>>>0;
  const r=()=>{h=Math.imul(h^h>>>15,2246822519);h=Math.imul(h^h>>>13,3266489917);h^=h>>>16;return (h>>>0)/4294967296;};
  return [r(),r(),r(),r()];}
/* blended per-biome form delta at world-x (same dominance-biased weighting as the colour regions) */
function formAt(wx,t){const nz=clamp(CZ(wx*0.6+t*0.5)*0.5+0.5,0,1),v=Math.pow(nz,1.55)*2;
  const i0=Math.floor(v),i1=Math.min(2,i0+1);let u=v-i0;u=u*u*(3-2*u);
  const comp=COMP[ST.flavor],A=BFORM[comp[i0]],B=BFORM[comp[i1]],g=ST.variety;
  return {mv:g*((1-u)*A.mv+u*B.mv),amp:g*((1-u)*A.amp+u*B.amp),dens:g*((1-u)*A.dens+u*B.dens),peakW:g*((1-u)*A.peakW+u*B.peakW),lift:g*((1-u)*A.lift+u*B.lift)};}

/* ===================== terrain — a scrolling panorama (no vertical bop) ===================== */
function ridgeYs(W,H,layer,N,sig){
  if(ncKey!==(ST.seed+'_'+ST.g.layers+'_'+ST.rug))buildNC();
  const nc=NC[layer],rug=ST.rug,set=nc.set,detail=nc.detail,ridge=nc.ridge,oct=set.length;
  const persist=lerp(0.30,0.66,rug),wl=lerp(0.8,2.7,rug)*nc.wlVar;
  const t=N===1?0:layer/(N-1);
  const hAvg=ST.hAvg - sig.lift*0.03;                                   // gentle global breath only
  const scroll=ST.journey*(0.12+0.9*t);                                // depth parallax: front travels faster
  const ampF=ST.g.amp,densF=ST.g.dens,relief=ST.relief;
  // landform candidates — the mv & breadth that gate them now follow the BIOME drifting past (formAt):
  // cola crests, hokkaido stays calm, satsuma broadens → variety tracks the colour regions (the tool's mechanism).
  const drama=0.45+0.4*relief, mvBase=ST.g.mv, bwBase=clamp(ST.g.peakW,0,1);
  const PSPAN=3.2, prate=PSPAN/wl, pw0=scroll*prate;
  const cands=[];
  if(t>0.18){const cmin=Math.floor(pw0)-1, cmax=Math.ceil(pw0+PSPAN)+1;
    for(let c=cmin;c<=cmax;c++){const rr=cellRnd(c,layer),cx=(c-pw0)/PSPAN+(rr[1]-0.5)/PSPAN,fd=formAt(cx+ST.journeyC,t);
      const m=clamp(mvBase+fd.mv+nc.mvN(c*0.45+layer*0.7)*0.45,-1,1),bw=clamp(bwBase+fd.peakW,0,1);
      if(rr[0]<Math.abs(m)*0.7){
        if(m>0)cands.push({x:cx,w:Math.max(0.012,lerp(0.02,0.16,bw)+rr[2]*(0.016+0.05*bw)),h:-H*(0.10+rr[3]*0.18)*m*drama}); // bright peak (up)
        else   cands.push({x:cx,w:Math.max(0.03,0.06+rr[2]*0.07+bw*0.05),h:H*(0.09+rr[3]*0.16)*(-m)*drama});}}}             // broad valley (down)
  const pts=84,ys=new Array(pts+1);
  for(let i=0;i<=pts;i++){const fx=i/pts,fd=formAt(fx+ST.journeyC,t);
    const ground=lerp(H*hAvg,H*0.985,t);
    const ampE=Math.max(0.04,ampF+fd.amp),densE=Math.max(0,densF+fd.dens),ampPx=H*(0.03+ampE*0.20)*(0.45+0.7*t);
    let bv=0,a=1,nm=0,fr=wl;for(let o=0;o<oct;o++){bv+=set[o](fx*fr+layer*3.1+scroll)*a;nm+=a;a*=persist;fr*=1.9;}
    let y=ground+(bv/nm)*ampPx;
    y-=nc.elev(fx*0.5+layer*0.4+scroll*0.8)*H*0.05;                            // gentle traveling elevation
    y-=fd.lift*H*0.42;                                                          // per-biome elevation (the tool's 'Lift')
    y+=detail(fx*(10+rug*22)+layer+scroll*1.6)*H*(0.006+densE*0.016);
    for(const f of cands){const dx=(fx-f.x)/f.w;y+=f.h*Math.exp(-dx*dx*0.5);}  // peaks & valleys
    ys[i]=y;
  }
  return ys;
}
/* color — biome REGIONS drift past as we travel; each biome reacts to its own band (slot 0→bass,1→mid,2→treble) */
function regionColorAt(x,t,C,levels){
  const wx=x+ST.journeyC;                                              // color scrolls with the journey
  const nz=clamp(CZ(wx*0.6+t*0.5)*0.5+0.5,0,1);                        // travelling region field over the 3 biome slots
  const v=Math.pow(nz,1.55)*2;                                        // bias toward slot 0 -> the puck's world dominates; slots 1 & 2 still drift through
  const i0=Math.floor(v),i1=Math.min(2,i0+1);let u=v-i0;u=u*u*(3-2*u); // feathered region boundary
  const w=[0,0,0];w[i0]+=1-u;w[i1]+=u;
  let L=0,A=0,B=0,boost=0;for(let s=0;s<3;s++){L+=C[s].L*w[s];A+=C[s].a*w[s];B+=C[s].b*w[s];boost+=w[s]*levels[s];}
  boost=clamp(boost,0,1);
  L=Math.min(1,L+boost*0.09);A*=1+boost*0.20;B*=1+boost*0.20;          // biome-as-instrument: its region lifts + saturates on its band
  const hz=clamp(ST.g.haze,0,1)*(1-t)*(1-t);
  return {L:lerp(L,SKY_HOR.L,hz),a:lerp(A,SKY_HOR.a,hz*0.85),b:lerp(B,SKY_HOR.b,hz*0.85)};}

/* ===================== render (per frame) ===================== */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let RS=1;
function resize(){const rect=cv.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(1.5,devicePixelRatio||1);
  RS=(w*dpr>2048)?2048/w:dpr; cv.width=Math.round(w*RS);cv.height=Math.round(h*RS);}


function mixLabs(cur,tgt,f){return f>=1?tgt:cur.map((l,i)=>lerpLab(l,tgt[i],f));}
function compLabs(){return ST.compP.map((ramp,j)=>mixLabs(ramp,ST.compT[j],ST.fade));}

function drawSun(W,H,sig){const x=ST.sunPos.x*W,y=ST.sunPos.y*H,R=H*0.07*ST.sunPos.size*(1+0.03*sig.rms);
  const g=ctx.createRadialGradient(x,y,R*0.6,x,y,R);const c=`rgb(${SUN_RGB.join(',')})`;
  g.addColorStop(0,c);g.addColorStop(0.94,c);g.addColorStop(1,`rgba(${SUN_RGB.join(',')},0)`);      // crisp edge (solid to 94%) — CANON, do not soften (julia 2026-06-10)
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(x,y,R*0.99,0,7);ctx.clip();                                     // fine grain inside the disc
  ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=0.3;ctx.drawImage(grainTile,x-R,y-R,R*2,R*2);ctx.restore();
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}

function render(sig){
  const W=cv.width,H=cv.height,N=ST.g.layers,CL=compLabs();
  const levels=[sig.bass,sig.mid,sig.treble];                          // biome slots → bands
  // The cached sky includes its paper texture; the sun sits behind the banks.
  if(window.paintSky)window.paintSky(ctx,W,H,ST.journey,sig);
  else {ctx.fillStyle=labStr(SKY_TOP);ctx.fillRect(0,0,W,H);drawSun(W,H,sig);}
  let skyline=null;
  for(let i=0;i<N;i++){
    const t=N===1?0:i/(N-1),ys=ridgeYs(W,H,i,N,sig),pts=ys.length-1;
    if(i===0)skyline=ys;
    const C=[biomeLab(CL[0],t),biomeLab(CL[1],t),biomeLab(CL[2],t)];   // 3 biome colors at this depth
    const grad=ctx.createLinearGradient(0,0,W,0);let midCol;
    for(let s=0;s<=20;s++){const x=s/20,c=regionColorAt(x,t,C,levels);grad.addColorStop(x,labStr(c));if(s===10)midCol=c;}
    const trace=()=>{ctx.beginPath();ctx.moveTo(0,ys[0]);for(let k=1;k<=pts;k++){const x0=(k-1)/pts*W,x1=k/pts*W,xm=(x0+x1)/2,ym=(ys[k-1]+ys[k])/2;ctx.quadraticCurveTo(x0,ys[k-1],xm,ym);}};
    trace();ctx.lineTo(W,ys[pts]);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
    ctx.save();ctx.clip();
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    const top=Math.min(...ys);
    const gdrift=ST.journey*(0.12+0.9*t)*W/wlOf(i);                      // px scrolled at this depth → texture travels WITH the land
    const e=clamp(ST.edge,0,1.2);
    // soft watercolor wash — per-band, soft-light (keeps hue), drifts with the land
    if(ST.wash>0){ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=Math.min(0.5,0.5*ST.wash);
      const ws=W*1.1,hs=ws*(H/W)*1.4,wox=((i*131+gdrift*0.6)%(ws*0.5)+(ws*0.5))%(ws*0.5),woy=(i*71)%(hs*0.5);
      ctx.drawImage(washTile,-wox,top-woy,ws,hs);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
    // granulation — pigment settling in the body (finer mottle masked by a vertical gradient), multiply; bounded to [top,H]
    if(ST.gran>0.01){ensurePL(W,H);const gy=Math.max(0,Math.floor(top)),gh2=H-gy,mw=mottleTile.width,mh=mottleTile.height,gox=((i*61+gdrift)%mw+mw)%mw,goy=(i*97)%mh;
      PLX.clearRect(0,gy,W,gh2);PLX.globalCompositeOperation='source-over';
      PLX.save();PLX.translate(-gox,-goy);PLX.fillStyle=mottlePat;PLX.fillRect(gox,gy+goy,W,gh2);PLX.restore();
      PLX.globalCompositeOperation='destination-in';const gg=PLX.createLinearGradient(0,top,0,H);
      gg.addColorStop(0,'rgba(0,0,0,0)');gg.addColorStop(0.45,'rgba(0,0,0,1)');gg.addColorStop(1,'rgba(0,0,0,1)');PLX.fillStyle=gg;PLX.fillRect(0,gy,W,gh2);
      PLX.globalCompositeOperation='source-over';
      ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=Math.min(0.30,ST.gran*(0.20+0.34*t));ctx.drawImage(PL,0,gy,W,gh2,0,gy,W,gh2);ctx.globalAlpha=1;ctx.restore();}
    // crisp cut-paper edge line — follows the ridge exactly, eases as bloom grows
    {const lc=oklabToRgb(Math.max(0,midCol.L-0.19),midCol.a,midCol.b);
     ctx.save();trace();ctx.strokeStyle=`rgba(${lc[0]},${lc[1]},${lc[2]},${clamp(0.46-0.28*e,0.10,0.46).toFixed(3)})`;ctx.lineWidth=Math.max(1,H*0.0016);ctx.lineJoin=ctx.lineCap='round';ctx.stroke();ctx.restore();}
    const reach=H*(0.04+0.5*e);
    // edge bloom — crest-darker shade that HUGS the wave: 1px vertical gradient strip stamped at each column's crest (no seam, no banding)
    if(e>0.02){const bc=oklabToRgb(Math.max(0,midCol.L-0.16),midCol.a,midCol.b),rh=Math.max(2,Math.ceil(reach));
      const strip=render._strips[i]||(render._strips[i]=document.createElement('canvas'));if(strip.height!==rh){strip.width=1;strip.height=rh;}const sx=strip.getContext('2d');sx.clearRect(0,0,1,rh);const lg=sx.createLinearGradient(0,0,0,rh);
      lg.addColorStop(0,`rgba(${bc[0]},${bc[1]},${bc[2]},${(0.10+0.26*e).toFixed(3)})`);lg.addColorStop(1,`rgba(${bc[0]},${bc[1]},${bc[2]},0)`);sx.fillStyle=lg;sx.fillRect(0,0,1,rh);
      for(let x=0;x<W;x+=4){const fx=x/W*pts,i0=Math.floor(fx),f=fx-i0,cy=ys[i0]+(ys[Math.min(pts,i0+1)]-ys[i0])*f;ctx.drawImage(strip,x,cy,4,rh);}}
    // crest light — a thin misty CATCH-LIGHT sliver at the VERY TOP of each ridge. Lift = a fraction of the
    // remaining headroom to white, so pale/hazed far bands lift GENTLY and never clip into a white lens.
    if(ST.crest>0.01){const Ll=midCol.L+(1-midCol.L)*0.30,ll=oklabToRgb(Ll,midCol.a*0.82,midCol.b*0.82);
      const lr=Math.max(2,Math.ceil(H*(0.018+0.055*ST.crest))),ls=render._lights[i]||(render._lights[i]=document.createElement('canvas'));if(ls.height!==lr){ls.width=1;ls.height=lr;}   // thin rim, not a glow
      const lx=ls.getContext('2d');lx.clearRect(0,0,1,lr);const lgr=lx.createLinearGradient(0,0,0,lr);
      lgr.addColorStop(0,`rgba(${ll[0]},${ll[1]},${ll[2]},${(0.5*ST.crest*(0.55+0.45*t)).toFixed(3)})`);lgr.addColorStop(1,`rgba(${ll[0]},${ll[1]},${ll[2]},0)`);lx.fillStyle=lgr;lx.fillRect(0,0,1,lr);
      for(let x=0;x<W;x+=4){const fx=x/W*pts,i0=Math.floor(fx),f=fx-i0,cy=ys[i0]+(ys[Math.min(pts,i0+1)]-ys[i0])*f;ctx.drawImage(ls,x,cy,4,lr);}}
    // edge pooling — textured pigment burn inside the bloom (FINER mottle), travels with the land, bounded for perf
    if(ST.epool>0.01&&e>0.02){ensurePL(W,H);const ry0=Math.max(0,Math.floor(top)-1),rh2=Math.ceil(reach)+3,mw=mottleTile.width,mh=mottleTile.height,pox=((i*53+gdrift)%mw+mw)%mw,poy=(i*89)%mh;
      PLX.clearRect(0,ry0,W,rh2);PLX.globalCompositeOperation='source-over';
      PLX.save();PLX.translate(-pox,-poy);PLX.fillStyle=mottlePat;PLX.fillRect(pox,ry0+poy,W,rh2);PLX.restore();
      PLX.globalCompositeOperation='destination-in';const eg=PLX.createLinearGradient(0,top,0,top+reach);
      eg.addColorStop(0,'rgba(0,0,0,1)');eg.addColorStop(1,'rgba(0,0,0,0)');PLX.fillStyle=eg;PLX.fillRect(0,ry0,W,rh2);
      PLX.globalCompositeOperation='source-over';
      ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=Math.min(0.55,ST.epool*(0.4+0.4*e));ctx.drawImage(PL,0,ry0,W,rh2,0,ry0,W,rh2);ctx.globalAlpha=1;ctx.restore();}
    // fine paper grain — FINE tooth, SOFT-LIGHT over mid-grey (mean-preserving ⇒ tooth, NOT a dirty film), locked to the moving paper
    {ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=Math.min(0.45,0.52*ST.grain*(1+0.10*sig.treble));
     const gw=grainTile.width,gh=grainTile.height,gx0=((i*53+gdrift)%gw+gw)%gw,gy0=(i*97)%gh;
     const gyStart=-gy0+Math.floor((top+gy0)/gh)*gh;                  // skip tiles fully above this ridge
     for(let gx=-gx0;gx<W;gx+=gw)for(let gy=gyStart;gy<H;gy+=gh)ctx.drawImage(grainTile,gx,gy);
     ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
    ctx.restore();
  }
  // (wash · granulation · edge · bloom · crest-light · pooling · grain are ALL per-band above — matching the current tool; no pinned global film)
  // Keep the field evenly lit; no vignette.
}
/* granulation buffer — mottle masked by a vertical gradient, rebuilt only on resize */
let GRAN,GRX,granKey=null;
function ensureGran(W,H,top){const key=W+'x'+H;if(granKey===key)return;granKey=key;
  if(!GRAN){GRAN=document.createElement('canvas');GRX=GRAN.getContext('2d');}GRAN.width=W;GRAN.height=H;
  const pat=GRX.createPattern(mottleTile,'repeat');GRX.fillStyle=pat;GRX.fillRect(0,0,W,H);
  GRX.globalCompositeOperation='destination-in';const gg=GRX.createLinearGradient(0,H*0.25,0,H);
  gg.addColorStop(0,'rgba(0,0,0,0)');gg.addColorStop(0.5,'rgba(0,0,0,1)');gg.addColorStop(1,'rgba(0,0,0,1)');
  GRX.fillStyle=gg;GRX.fillRect(0,0,W,H);GRX.globalCompositeOperation='source-over';}



render._strips=[];render._lights=[];
