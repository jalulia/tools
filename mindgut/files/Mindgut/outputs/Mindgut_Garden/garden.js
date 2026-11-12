/* A garden made of words. Light palette, Van Gogh stroke logic, every mark a letter.
   Three layers: underpainting (big soft words), body (strokes along a flow field), detail (fine words, petals, highlights).
   Nothing maps brightness to a character. Letters are brush hairs: rotated to the flow, sized continuously, overlapped. */

const cv=document.getElementById('c'), status=document.getElementById('status');
const W=1440, H=1800;                 // painting space; composited to cover the viewport
const off=document.createElement('canvas'); off.width=W; off.height=H;
const g=off.getContext('2d');

/* ---------- noise ---------- */
let seed=(location.hash&&parseInt(location.hash.slice(1)))||808;
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
let R=rng(seed);
const P=new Uint8Array(512);
function reseedNoise(){const r=rng(seed*7+1);const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}for(let i=0;i<512;i++)P[i]=p[i&255]}
const fade=t=>t*t*t*(t*(t*6-15)+10), lerp=(a,b,t)=>a+(b-a)*t;
function grad(h,x,y){switch(h&7){case 0:return x+y;case 1:return -x+y;case 2:return x-y;case 3:return -x-y;case 4:return x;case 5:return -x;case 6:return y;default:return -y}}
function noise(x,y){const X=Math.floor(x)&255,Y=Math.floor(y)&255;x-=Math.floor(x);y-=Math.floor(y);const u=fade(x),v=fade(y);const A=P[X]+Y,B=P[X+1]+Y;
  return lerp(lerp(grad(P[A],x,y),grad(P[B],x-1,y),u),lerp(grad(P[A+1],x,y-1),grad(P[B+1],x-1,y-1),u),v)}
function fbm(x,y,o=4){let a=0,s=1,f=1;for(let i=0;i<o;i++){a+=noise(x*f,y*f)*s;s*=.5;f*=2.1}return a}

/* ---------- palette: light, warm ground, Van Gogh ramps, brand hues seated inside them ---------- */
const PAL={
  ground:'#F4F2EC',
  sky:['#F6EFD8','#F2E9CF','#E8DDB2','#D8E3E4','#C6D8DD','#E3D4A6','#F7F1DE'],
  swirl:['#D9C98D','#C9B979','#E6D7A2','#B9CFD3'],
  sun:['#F2CF5B','#EFC244','#F7DD86','#E9B949'],
  cypress:['#2F5547','#3F6B5B','#4F7A66','#5B8A6E','#7FA38A'],
  hill:['#9DB7B1','#B6C9C2','#8FA9A3','#A9BFB6','#C9D6CE'],
  hedge:['#6F8F5E','#7E9D66','#8EAA6B','#A3BB7E','#B5C48A'],
  wheat:['#E4C56A','#D9B04F','#C9A24A','#F0DA95','#B88B3A','#EACB7A','#A47A2E'],
  grass:['#8FB46F','#6F9A5E','#A8C98A','#4F7D4A','#9DBF7C','#5E8B55','#BBD193'],
  iris:['#8C7BB8','#6E5FA0','#A99BCB','#4F4382','#B8ADD6'],
  poppy:['#D9663F','#C44D33','#E57A52'],
  path:['#DCC9A3','#CDB686','#E6D8B9','#BFA77A','#D9C49A'],
  pond:['#4FA3A0','#7EC0BC','#B6DCD8','#DCEDEA','#3C8683','#9ED0CC'],
  alive:'#3DDC84'
};
const pick=(arr,t)=>{if(!Array.isArray(arr))arr=PAL.grass;t=Math.max(0,Math.min(0.999,t||0));return arr[Math.floor(t*arr.length)]};
const jitterHex=(hex,amt)=>{const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g2=(n>>8)&255,b=n&255;const d=()=>Math.round((R()-.5)*amt*2);r=Math.max(0,Math.min(255,r+d()));g2=Math.max(0,Math.min(255,g2+d()));b=Math.max(0,Math.min(255,b+d()));return `rgb(${r},${g2},${b})`};

/* ---------- words: what the garden is made of ---------- */
const WORDS={
  sky:['breath','and the sky kept going','held','a long afternoon','what the light said','slowly','remember this','you decide','the record is yours','open','warm'],
  field:['wheat','strand','strand','kept','measured','every word','counted','gold','sown','the same mir','ripening','field'],
  grass:['grass','green','grown','again','still here','rooted','il','it','lift','tall'],
  hedge:['hedge','held','closed','dense','leaf','and','between'],
  cypress:['cypress','reach','flame','stays','upward','still','sings'],
  iris:['iris','violet','reflection','why','wonder','slow','deep'],
  pond:['water','mirror','mir','mir','returns','what was said','still','again','reflection','nothing is lost','the same'],
  path:['path','walk','here','step','toward'],
  poppy:['red','note','one','here']
};
const word=k=>{const a=WORDS[k]||WORDS.grass;return a[Math.floor(R()*a.length)]};
addEventListener('error',e=>{status.textContent='error: '+e.message});
addEventListener('unhandledrejection',e=>{status.textContent='error: '+(e.reason&&e.reason.message||e.reason)});

/* ---------- composition: regions as height fields in painting space ---------- */
const horizon=y=>H*0.40 + fbm(y*0.002,3.1)*20;       // placeholder, replaced per x below
const hillYr =x=>H*0.415 + fbm(x*0.0016,1.7,3)*34 - Math.abs(x-W*0.55)*0.03;
const hedgeYr=x=>H*0.49  + fbm(x*0.004,5.2,3)*22;
const fieldYr=x=>H*0.63  + fbm(x*0.003,8.4,3)*16;    // wheat ends, grass/iris begins
const pondYr =x=>H*0.78  + fbm(x*0.0025,2.2,3)*22 + Math.pow(Math.abs((x-W*0.5)/(W*0.5)),2)*90; // bowl shape
const memo=f=>{const m=new Float32Array(W+2).fill(NaN);return x=>{const i=Math.max(0,Math.min(W+1,Math.round(x)));let v=m[i];if(v!==v){v=f(i);m[i]=v}return v}};
const hillY=memo(hillYr), hedgeY=memo(hedgeYr), fieldY=memo(fieldYr), pondY=memo(pondYr);
const sun={x:W*0.68,y:H*0.17,r:88};
function region(x,y){
  if(y<hillY(x)) return 'sky';
  if(y<hedgeY(x)) return 'hill';
  if(y<hedgeY(x)+40+Math.abs(fbm(x*0.012,4.4,2))*80) return 'hedge';
  if(y<fieldY(x)+fbm(x*0.01,y*0.01,2)*26) return 'wheat';
  if(y<pondY(x)+fbm(x*0.02,7.7,2)*10) return (fbm(x*0.006,y*0.006,2)>0.18 && y>fieldY(x)+40)?'iris':'grass';
  return 'pond';
}
const pathOn=(x,y)=>{const c=W*0.30+Math.sin(y*0.004)*60+fbm(y*0.005,9)*40;const w=14+(y-H*0.5)*0.11+fbm(y*0.01,3.3,2)*6;return y>hedgeY(x)+30&&y<pondY(x)&&Math.abs(x-c)<w};

/* flow field: the direction a brush hair lies at (x,y) */
function flowRaw(x,y,r){
  const n=fbm(x*0.0025,y*0.0025,3);
  switch(r){
    case 'sky':{ // swirls around the sun, long arcs elsewhere
      const dx=x-sun.x,dy=y-sun.y,d=Math.hypot(dx,dy);
      const tang=Math.atan2(dy,dx)+Math.PI/2;
      const far=Math.min(1,d/(W*0.6));
      return lerp(tang, n*2.2+0.1, far*far)+fbm(x*0.006,y*0.006,2)*0.9; }
    case 'hill': return n*0.5-0.08;
    case 'hedge': return -Math.PI/2+n*0.5;
    case 'wheat': return -Math.PI/2+0.35+n*0.5;            // leaning verticals, one wind
    case 'grass': return -Math.PI/2+n*1.1+Math.sin(x*0.01)*0.3;
    case 'iris':  return -Math.PI/2+n*0.7;
    case 'path':  return 0.15+n*0.25;
    case 'pond':  return n*0.28;                             // horizontals with gentle tremble
    default: return n;
  }
}

/* cached flow on an 8px grid per region */
const FG=8, FW=Math.ceil(W/FG)+2, FH=Math.ceil(H/FG)+2, FC={};
function flow(x,y,r){
  let m=FC[r]; if(!m){m=new Float32Array(FW*FH).fill(NaN);FC[r]=m}
  const i=Math.max(0,Math.min(FW-1,(x/FG)|0)), j=Math.max(0,Math.min(FH-1,(y/FG)|0)), k=j*FW+i;
  let v=m[k]; if(v!==v){v=flowRaw(i*FG,j*FG,r);m[k]=v} return v;
}
/* ---------- a mark: a word laid along the flow, each letter a brush hair ---------- */
const FONTS={serif:'"Cormorant Garamond"',disp:'"Instrument Serif"',hand:'Caveat'};
const WCACHE=new Map();
function cw(ch,font){let m=WCACHE.get(font);if(!m){m=new Map();WCACHE.set(font,m)}let w=m.get(ch);if(w===undefined){w=g.measureText(ch).width;m.set(ch,w)}return w}
function mark(x,y,r,size,color,alpha,text,opts={}){
  const ang=flow(x,y,r)+(opts.rot||0), font=opts.font||FONTS.serif, italic=opts.italic!==false;
  g.save(); g.translate(x,y); g.rotate(ang);
  g.globalAlpha=alpha; g.fillStyle=color;
  const fs=`${italic?'italic ':''}${opts.weight||400} 20px ${font}`; g.font=fs; const k=size/20;
  g.textBaseline='middle';
  const track=opts.track??-0.08;                              // negative tracking: letters touch, read as one stroke
  let cx=0;
  const lenScale=opts.len||1;
  for(const ch of text){
    const w=cw(ch,fs)*k;
    const jy=(R()-.5)*size*(opts.jitter??0.18);
    const js=1+(R()-.5)*0.25;
    g.save(); g.translate(cx,jy); g.scale(lenScale*k,js*k); g.fillText(ch,0,0); g.restore();
    cx+=w*(1+track);
  }
  g.restore();
}

/* ---------- the three passes ---------- */
function underpaint(){
  g.fillStyle=PAL.ground; g.fillRect(0,0,W,H);
  // big soft words, very low alpha, blurred: a wash that sets the value structure
  // paint the wash at 1/8 scale, then scale it up: cheap, soft, no filter
  const sm=document.createElement('canvas'); sm.width=W/8; sm.height=H/8; const s=sm.getContext('2d');
  s.fillStyle=PAL.ground; s.fillRect(0,0,sm.width,sm.height);
  for(let i=0;i<700;i++){
    const x=R()*W,y=R()*H,r=region(x,y);
    const ramp=PAL[r]||PAL.grass;
    s.globalAlpha=0.22; s.fillStyle=pick(ramp,R());
    s.save(); s.translate(x/8,y/8); s.rotate(flow(x,y,r)); s.font=`italic ${12+R()*16}px "Cormorant Garamond"`; s.textBaseline='middle'; s.fillText(word(r),0,0); s.restore();
  }
  g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(sm,0,0,W,H);
  // sun wash
  const gr=g.createRadialGradient(sun.x,sun.y,0,sun.x,sun.y,sun.r*4.5);
  gr.addColorStop(0,'rgba(247,221,134,.9)');gr.addColorStop(.3,'rgba(242,207,91,.35)');gr.addColorStop(1,'rgba(242,207,91,0)');
  g.fillStyle=gr; g.fillRect(0,0,W,H*0.5);
  g.filter='none';
}


/* glyph vocabulary per region: letters chosen for their stroke shape, not their meaning */
const GL={
  sky:'ecoaesceCG&',  hill:',-~__,',  hedge:'liftj,',  wheat:'lllifttj1',  wheatHead:'wmvy',
  grass:'liiltjf/,',  iris:'oadgbp',  irisLeaf:'ly',  pond:'~~-_sScu', path:',-_.'
};
const gl=k=>{const a=GL[k];return a[Math.floor(R()*a.length)]};

/* glyph atlas: each (glyph,font) rasterised once, white on transparent, at 64px; tinted per colour on demand.
   Drawing a sprite with a transform is cheap everywhere; drawing rotated text is not (Cairo re-rasterises per angle). */
const SP=64, ATLAS=new Map();
function sprite(ch,fs,col){
  const key=fs+'|'+ch+'|'+col;
  let sp=ATLAS.get(key); if(sp) return sp;
  const base=fs+'|'+ch; let b=ATLAS.get(base);
  if(!b){ const c=document.createElement('canvas'); c.width=SP*2; c.height=SP*2; const x=c.getContext('2d');
    x.font=fs.replace('20px',SP+'px'); x.textBaseline='middle'; x.fillStyle='#fff'; x.fillText(ch,SP*0.5,SP);
    b={c,w:x.measureText(ch).width/SP*20}; ATLAS.set(base,b); }
  const c=document.createElement('canvas'); c.width=SP*2; c.height=SP*2; const x=c.getContext('2d');
  x.drawImage(b.c,0,0); x.globalCompositeOperation='source-in'; x.fillStyle=col; x.fillRect(0,0,SP*2,SP*2);
  sp={c,w:b.w}; ATLAS.set(key,sp); return sp;
}
/* colours are quantised to keep the atlas small: 24 steps per channel */
const Q=c=>{if(c[0]==='#'){const n=parseInt(c.slice(1),16);return `rgb(${(n>>16)&255},${(n>>8)&255},${n&255})`}return c};
function jitterQ(hex,amt){const n=parseInt(hex.slice(1),16);const q=v=>Math.max(0,Math.min(255,Math.round((v+(R()-.5)*amt*2)/11)*11));return `rgb(${q((n>>16)&255)},${q((n>>8)&255)},${q(n&255)})`}

/* a streamline: start at (x,y), walk the flow, lay a glyph (or a word's letters) at each step with overlap */
function stroke(x,y,r,opts){
  const n=opts.n||8, size0=opts.size, col=Q(opts.color), font=opts.font||FONTS.serif, text=opts.text||null;
  const overlap=opts.overlap??0.5, alpha=opts.alpha??0.75, taper=opts.taper??0.35;
  const fs=`italic ${opts.weight||400} 20px ${font}`;
  let px=x,py=y, ti=0;
  const wph=R()*6.28, wamp=size0*0.18, sx=opts.sx||1, sy=opts.sy||1;
  for(let k=0;k<n;k++){
    const t=k/n, size=size0*(1-taper*t);
    const ang=flow(px,py,r)+(opts.rot||0)+(R()-.5)*(opts.jit??0.18);
    const ch=text?text[ti++%text.length]:gl(opts.glyphs||r);
    if(ch!==' '){
      const sp=sprite(ch,fs,col), w=sp.w*size/20, wob=Math.sin(k*0.9+wph)*wamp, k2=size/SP;
      g.save(); g.translate(px-Math.sin(ang)*wob,py+Math.cos(ang)*wob); g.rotate(ang);
      g.globalAlpha=alpha*(0.85+R()*0.15);
      g.scale(k2*sx,k2*sy); g.drawImage(sp.c,-SP*0.5-w/k2/2,-SP); g.restore();
      const adv=Math.max(2,w*(1-overlap)); px+=Math.cos(ang)*adv; py+=Math.sin(ang)*adv;
    } else { const adv=size*0.35; px+=Math.cos(ang)*adv; py+=Math.sin(ang)*adv; }
    if(px<-40||px>W+40||py<-40||py>H+40) break;
  }
}
const TG=new Float32Array(FW*FH).fill(NaN);
const tone=(x,y)=>{const i=(x/FG)|0,j=(y/FG)|0,k=Math.max(0,Math.min(FW*FH-1,j*FW+i));let v=TG[k];if(v!==v){v=(fbm(x*0.008,y*0.008,2)+0.75)/1.5;TG[k]=v}return v};   // 0..1 slow tonal variation
let WORDS_PASS=null;
const darken=(hex,k)=>{const n=parseInt(hex.slice(1),16);const f=v=>Math.round(v*(1-k));return `rgb(${f((n>>16)&255)},${f((n>>8)&255)},${f(n&255)})`};
const depth=y=>0.7+0.8*Math.max(0,(y-H*0.4)/(H*0.6));    // size grows toward the viewer

async function body(){
  const N=52000;
  for(let i=0;i<N;i++){
    if((i&2047)===2047){status.textContent=`painting… ${Math.round(i/N*100)}%`;await new Promise(r=>setTimeout(r,0))}
    const x=R()*W,y=R()*H;const r=region(x,y);
    const t=tone(x,y), d=depth(y);
    if(t>0.78&&R()<0.6) continue;
    const path=pathOn(x,y);
    if(r==='wheat'&&y<hedgeY(x)+130&&R()<0.5){ stroke(x,y,'hedge',{n:4,size:(10+R()*6)*d,color:jitterQ(pick(PAL.hedge,t),10),alpha:0.8,overlap:0.6,taper:0.4,jit:0.3,glyphs:'hedge'}); continue }
    if(r==='sky'){
      if(R()<0.25) continue;
      const ramp=R()<0.35?PAL.swirl:PAL.sky;
      stroke(x,y,'sky',{n:7+R()*8,size:14+R()*14,color:jitterQ(pick(ramp,t),8),alpha:0.55,overlap:0.6,taper:0.1,jit:0.08,font:FONTS.serif,glyphs:'sky',sx:1.15});
    } else if(r==='hill'){
      const ridge=hillY(x)+60+fbm(x*0.003,2.9,3)*40; const far=y<ridge;
      stroke(x,y,'hill',{n:6+R()*6,size:12+R()*8,color:jitterQ(far?pick(['#C9D6CE','#B6C9C2','#D5DFD9'],t):pick(PAL.hill,t*0.7),8),alpha:far?0.6:0.75,overlap:0.5,taper:0,jit:0.1,glyphs:'hill',sx:1.6});
    } else if(r==='hedge'){
      for(let q=0;q<2;q++) stroke(x+(R()-.5)*6,y+(R()-.5)*6,'hedge',{n:4+R()*4,size:(10+R()*8)*d,color:jitterQ(pick(PAL.hedge,t*0.6),10),alpha:0.9,overlap:0.6,taper:0.4,jit:0.3,glyphs:'hedge'});
    } else if(r==='wheat'){
      if(path){ stroke(x,y,'path',{n:6+R()*6,size:(9+R()*6)*d,color:jitterQ(pick(PAL.path,t*0.8+R()*0.2),10),alpha:0.95,overlap:0.5,rot:0.2+(R()-.5)*0.3,jit:0.1,glyphs:'path',sx:1.6,sy:0.9}); if(R()<0.15) stroke(x,y,'path',{n:2,size:6*d,color:'#B9A373',alpha:0.7,overlap:0.3,rot:R()*6.28,glyphs:'path'}); continue }
      const c=jitterQ(pick(PAL.wheat,t*0.8+R()*0.2),12);
      stroke(x,y,'wheat',{n:6+R()*6,size:(11+R()*9)*d,color:c,alpha:0.92,overlap:0.55,taper:0.45,jit:0.22,glyphs:'wheat',font:R()<0.35?FONTS.hand:FONTS.serif,weight:R()<0.35?600:400});
      if(R()<0.22) stroke(x,y-6*d,'wheat',{n:2,size:(7+R()*4)*d,color:pick(PAL.wheat,R()),alpha:0.9,overlap:0.3,taper:0,jit:0.4,glyphs:'wheatHead',font:FONTS.hand,weight:600});
    } else if(r==='grass'||r==='iris'){
      if(path){ stroke(x,y,'path',{n:6+R()*6,size:(9+R()*6)*d,color:jitterQ(pick(PAL.path,t*0.8+R()*0.2),10),alpha:0.95,overlap:0.5,rot:0.2+(R()-.5)*0.3,jit:0.1,glyphs:'path',sx:1.6,sy:0.9}); if(R()<0.15) stroke(x,y,'path',{n:2,size:6*d,color:'#B9A373',alpha:0.7,overlap:0.3,rot:R()*6.28,glyphs:'path'}); continue }
      const isIris=r==='iris';
      const ramp=isIris&&R()<0.55?PAL.iris:PAL.grass;
      stroke(x,y,r,{n:5+R()*7,size:(10+R()*10)*d,color:jitterQ(pick(ramp,t*0.8+R()*0.2),12),alpha:0.92,overlap:0.55,taper:0.4,jit:0.3,glyphs:ramp===PAL.iris?'iris':'grass',font:R()<0.4?FONTS.hand:FONTS.serif,weight:R()<0.4?600:400});
    } else if(r==='pond'){
      const above=region(x, pondY(x)-(y-pondY(x))*0.9);
      let ramp=PAL.pond, a=0.62, txt=null;
      if(R()<0.42&&above!=='pond'){ramp=PAL[above]; a=0.4}
      stroke(x,y,'pond',{n:6+R()*7,size:(10+R()*10)*d*0.9,color:jitterQ(pick(ramp,t),10),alpha:a,overlap:0.35,taper:0,jit:0.05,glyphs:'pond',sx:1.7,sy:0.8});
    }
  }
  /* the word layer: real phrases on long calm streamlines, a shade darker than their ground; legible close, invisible far */
  WORDS_PASS=()=>{
    const sizes={sky:16,hill:12,hedge:11,wheat:12,grass:12,iris:13,pond:13,path:12};
    for(let i=0;i<1600;i++){
      const x=R()*W,y=R()*H;let r=region(x,y); if(pathOn(x,y)) r='path';
      const ramp=PAL[r]||PAL.grass; const c=darken(pick(ramp,0.6+R()*0.3),0.22);
      stroke(x,y,r,{n:26,size:sizes[r]*depth(y)*0.9,color:c,alpha:0.78,overlap:0.04,taper:0,jit:0.02,text:word(r)+'  ',font:r==='iris'?FONTS.disp:FONTS.serif});
    }
  };
}

function cypress(cx,base,height,width){
  // flame: vertical streamlines of f / long-s, S-curving, tapering, darkest at the core
  for(let i=0;i<height*3.2;i++){
    const h=R(); const y=base-h*height; const v=h;
    const spread=(1-v*v)*width+4; const x=cx+(R()-.5)*spread + Math.sin(v*6.28*2.5+0.8*Math.sin(v*6.28))*width*0.18;
    const core=1-Math.abs(x-cx)/(spread/2+1);
    const col=pick(PAL.cypress, Math.max(0,Math.min(.99,(1-core)*0.7+R()*0.3)));
    const lean=Math.sin(v*6.28*2.5)*0.35+(R()-.5)*0.3;
    stroke(x,y,'cypress',{n:3+R()*4,size:(9+R()*9)*(1-v*0.5),color:col,alpha:0.92,overlap:0.65,taper:0.5,rot:-Math.PI/2+lean,jit:0.12,text:R()<0.5?'ſſf':'ffſ',font:FONTS.serif});
  }
}
function impasto(){
  // a faint darker edge on the shadow side of everything: shifts the whole painting 1px, multiply, low alpha
  const tmp=document.createElement('canvas'); tmp.width=W; tmp.height=H; const t=tmp.getContext('2d');
  t.drawImage(off,0,0);
  g.save(); g.globalAlpha=0.16; g.globalCompositeOperation='multiply'; g.drawImage(tmp,1.3,1.5); g.restore();
  g.save(); g.globalAlpha=0.07; g.globalCompositeOperation='screen'; g.drawImage(tmp,-1,-1); g.restore();
}
function detail(){
  // sun: concentric turns of e and c, nearly white at the heart, then short rays
  for(let i=0;i<420;i++){const a=R()*Math.PI*2,rad=sun.r*Math.sqrt(R())*0.95;const x=sun.x+Math.cos(a)*rad,y=sun.y+Math.sin(a)*rad;
    const tt=rad/sun.r; stroke(x,y,'sky',{n:4,size:12+R()*10,color:tt<0.35?'#FBF3D2':pick(PAL.sun,tt),alpha:0.55,overlap:0.5,taper:0,rot:a+Math.PI/2-flow(x,y,'sky'),jit:0.06,glyphs:'sky'});}
  for(let i=0;i<160;i++){const a=R()*Math.PI*2,rad=sun.r*(1.05+R()*0.9);const x=sun.x+Math.cos(a)*rad,y=sun.y+Math.sin(a)*rad;
    stroke(x,y,'sky',{n:5,size:10+R()*8,color:pick(PAL.sun,R()),alpha:0.35,overlap:0.4,taper:0.5,rot:a-flow(x,y,'sky'),jit:0.05,text:'light ',font:FONTS.disp});}
  // cypresses: one tall, one small, right of centre
  cypress(W*0.80,hedgeY(W*0.80)+40,H*0.33,64);
  cypress(W*0.868,hedgeY(W*0.868)+40,H*0.20,40);
  // wheat ears along the top of the field, bright
  for(let i=0;i<1400;i++){const x=R()*W,y=hedgeY(x)+34+R()*(fieldY(x)-hedgeY(x)-34);if(pathOn(x,y))continue;
    stroke(x,y,'wheat',{n:2,size:(6+R()*5)*depth(y),color:pick(PAL.wheat,R()*0.5),alpha:0.9,overlap:0.3,taper:0,jit:0.5,glyphs:'wheatHead',font:FONTS.hand,weight:600});}
  // iris blooms: a fan of three o/a petals, upright, with one pale standard
  for(let i=0;i<520;i++){const x=R()*W,y=fieldY(x)+30+R()*(pondY(x)-fieldY(x)-50);if(region(x,y)!=='iris'||pathOn(x,y))continue;
    const d=depth(y), s=(8+R()*6)*d;
    for(const a of [-0.7,0,0.7]) stroke(x,y,'iris',{n:2,size:s,color:pick(PAL.iris,R()*0.8),alpha:0.9,overlap:0.5,taper:0.2,rot:-Math.PI/2+a-flow(x,y,'iris'),jit:0.1,glyphs:'iris',font:FONTS.disp});
    if(R()<0.5) stroke(x,y-s*0.6,'iris',{n:1,size:s*0.7,color:R()<0.04?'#F4F2EC':PAL.iris[4],alpha:0.95,overlap:0,rot:-Math.PI/2-flow(x,y,'iris'),glyphs:'iris'});
    // leaves
    stroke(x+(R()-.5)*8,y+4,'iris',{n:4,size:s*0.9,color:pick(['#3F6B5B','#4F7A66','#5B8A6E'],R()),alpha:0.8,overlap:0.5,taper:0.6,rot:(R()-.5)*0.6,jit:0.1,glyphs:'irisLeaf'});}
  // poppies: clustered red dabs, few
  for(let c=0;c<7;c++){const cx=R()*W,cy=fieldY(cx)+20+R()*(pondY(cx)-fieldY(cx)-60);
    for(let i=0;i<10;i++){const x=cx+(R()-.5)*90,y=cy+(R()-.5)*50;if(region(x,y)==='pond'||pathOn(x,y)||y<fieldY(x))continue;
      stroke(x,y,'grass',{n:2,size:(7+R()*5)*depth(y),color:pick(PAL.poppy,R()),alpha:0.92,overlap:0.6,taper:0,rot:R()*6.28,jit:0.3,text:',o',font:FONTS.serif});}}
  // sun on water: pale broken horizontals toward the sun's column
  for(let i=0;i<700;i++){const x=sun.x+(R()-.5)*W*0.5*(0.4+R()),y=pondY(x)+10+R()*(H-pondY(x)-30);
    stroke(x,y,'pond',{n:3+R()*5,size:(7+R()*8)*depth(y)*0.9,color:R()<.6?'#FBF6E4':PAL.sun[2],alpha:0.55,overlap:0.3,taper:0,jit:0.03,glyphs:'pond',sx:1.8,sy:0.7});}
  if(WORDS_PASS) WORDS_PASS();
  impasto();
  // the one green: a single living point on the path, where a person would stand, and her name beside it
  const py=H*0.70, px=W*0.30+Math.sin(py*0.004)*60+fbm(py*0.005,9)*40;
  g.save();g.globalAlpha=0.95;g.fillStyle=PAL.alive;g.beginPath();g.arc(px,py,5,0,7);g.fill();g.restore();
  g.save();g.globalAlpha=0.85;g.fillStyle='#2a2926';g.font=`400 12px ${FONTS.serif}`;g.textBaseline='middle';g.fillText('mir',px+10,py+1);g.restore();
}

/* ---------- paint, composite, zoom ---------- */
let zoomed=false, view={x:0,y:0,s:1};
function fit(){
  const dpr=Math.min(2,devicePixelRatio||1);
  cv.width=innerWidth*dpr; cv.height=innerHeight*dpr;
  const c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle=PAL.ground; c.fillRect(0,0,innerWidth,innerHeight);
  // cover
  const s=Math.max(innerWidth/W,innerHeight/H)*(zoomed?3.2:1);
  const dw=W*s,dh=H*s;
  const x=zoomed?-(view.x*s-innerWidth/2):(innerWidth-dw)/2, y=zoomed?-(view.y*s-innerHeight/2):(innerHeight-dh)/2;
  c.imageSmoothingQuality='high';
  c.drawImage(off,x,y,dw,dh);
  // paper grain: multiply a faint noise so it sits on paper, not on a screen
  c.globalCompositeOperation='multiply'; c.globalAlpha=0.06;
  for(let i=0;i<innerWidth*innerHeight/900;i++){c.fillStyle=i&1?'#000':'#8a7a5a';c.fillRect(Math.random()*innerWidth,Math.random()*innerHeight,1,1)}
  c.globalCompositeOperation='source-over'; c.globalAlpha=1;
}
async function paint(){
  status.textContent='painting…'; document.getElementById('seed').textContent='  seed '+seed;
  await document.fonts.ready;
  R=rng(seed); reseedNoise(); for(const k in FC) delete FC[k];
  const t0=performance.now();
  underpaint(); await new Promise(r=>setTimeout(r,0));
  await body();
  detail();
  fit();
  status.textContent=`painted · ${Math.round(performance.now()-t0)}ms · every mark is a word`;
}
document.getElementById('re').onclick=paint;
document.getElementById('seedb').onclick=()=>{seed=Math.floor(Math.random()*1e6);location.hash=seed;paint()};
document.getElementById('zoom').onclick=()=>{zoomed=!zoomed;view={x:W*0.42,y:H*0.70};fit()};
cv.addEventListener('click',e=>{const s=Math.max(innerWidth/W,innerHeight/H);zoomed=!zoomed;view={x:(e.clientX-(innerWidth-W*s)/2)/s,y:(e.clientY-(innerHeight-H*s)/2)/s};fit()});
addEventListener('resize',fit);
paint();
