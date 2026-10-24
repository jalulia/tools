/* T-04 · Effect set · the SET file · ø co. Techniques & Templates
   This is the only file a new set replaces. Shape (also in template.json):
     window.FXSET = { code, title, sub, premise, source, effects:[Effect], usages:[Usage] }
     Effect = { id, code, name, sub, recipe:[str], limits:[[param, range, what happens]], params:[Param],
                run(o, W, H, dpr, x) → { lin:Float32Array(W·H·3, linear RGB), cov:Float32Array(W·H), mask:Float32Array(W·H), marks:int } }
       x (optional, used by usages): { base: lin buffer to print over, clip: Float32 coverage multiplier, field:(u,v,layer)→0..1 }
     Param  = { key, label, group: density|dropoff|color|mixing|mask|seed, type: range|select|ease, value, min,max,step,unit, options, note, limits:[[lo,hi,why]] }
     Usage  = { id, title, sub, uses:[effect id], aspect, overrides:{effectId:{…}}, run(ctx, W, H, dpr, P) }  — P(effectId) = live params merged with overrides
   Set 01 · "Four surfaces" — the texture recipes from Mindgut Technique Study V01 §08, rebuilt on white. */
(function(G){
'use strict';
const FX=G.FX, PI=Math.PI, TAU=FX.TAU, clamp=FX.clamp, lerp=FX.lerp, hash=FX.hash;

/* shared pieces */
const proj=(w,h,deg)=>{ const a=deg*PI/180, c=Math.cos(a), s=Math.sin(a); return {c,s,ext:Math.abs(w*c)+Math.abs(h*s)}; };
const BAYER=(()=>{ let m=[[0]]; for(let n=1;n<8;n*=2){ const z=[]; for(let y=0;y<n*2;y++){ z[y]=[]; for(let x=0;x<n*2;x++){ const q=m[y%n][x%n]*4; z[y][x]=q+(y<n?(x<n?0:2):(x<n?3:1)); } } m=z; } const N=m.length; return (x,y)=>(m[((y%N)+N)%N][((x%N)+N)%N]+.5)/(N*N); })();
const rankOf=(order,i,j,s)=>order==='white'?hash(i,j,s):order==='ordered'?BAYER(i,j):FX.blue.at(i+s%41,j+s%29);
const ORDER={key:'order',label:'Selection',group:'density',type:'select',options:['blue','white','ordered'],note:'which sites survive at a given density — blue: even thinning (void-and-cluster rank); white: hash, clumps; ordered: 8×8 Bayer, reads as a screen'};
const compose=(W,H,x)=>x&&x.base?Float32Array.from(x.base):FX.ground(W,H,FX.WHITE);
const clipInto=(M,x)=>{ if(x&&x.clip) for(let i=0;i<M.length;i++) M[i]*=x.clip[i]; return M; };

/* ══════════ FX-01 · Stipple ramp ══════════ */
const stipple={ id:'fx-01-stipple', code:'FX-01', name:'Stipple ramp', sub:'Tone made of whole dots. Value sets how many sites print (FM) or how big each dot is (AM); a blue-noise rank decides which sites, so sparse areas thin evenly.',
  recipe:[
    'Lay a site lattice at the pitch (CSS px). Jitter each site inside its cell.',
    'Read the value field at the site: linear ramp, radial, or noise — eased from → to by the dropoff curve.',
    'Screen: FM keeps a site when its rank < value; AM keeps every site and sets radius ∝ √value. The FM↔AM dial interpolates.',
    'Rank comes from a 64 × 64 void-and-cluster tile (blue), a hash (white), or Bayer 8 × 8 (ordered).',
    'Rasterize each kept dot analytically (7 vertex radii, AA by distance) into a coverage layer, then mix ink into the ground per pixel in the chosen color space. Ink B overprints by the overprint rule.',
    'The mask is sampled at the site, not the pixel: dots are whole or absent, never sliced by the edge.'],
  limits:[['pitch','< 2 px','sites merge into flat tone at 1× — the stipple stops reading as marks'],['dot radius','> ½ pitch','dots overlap into a solid; FM loses its range'],['selection','white','clumps and voids at low density — the original jittered-hash look'],['screen','AM at pitch < 4 px','radius steps quantize to the pixel grid; banding']],
  params:[
    {key:'pitch',label:'Pitch',group:'density',type:'range',min:1.2,max:16,step:.1,unit:'px',value:2.7,note:'distance between dot sites — sets the COUNT of dots, not their size',limits:[[1.2,2,'sites merge into tone at 1×']]},
    {key:'dotR',label:'Dot radius',group:'density',type:'range',min:.2,max:4,step:.02,unit:'px',value:1,note:'radius of a full-value dot, independent of pitch',limits:[[2.4,4,'past ~½ pitch dots fuse']]},
    {key:'screen',label:'Screen · FM ↔ AM',group:'density',type:'range',min:0,max:1,step:.01,value:0,note:'0 = value changes how many dots print; 1 = value changes how big they are'},
    Object.assign({value:'blue'},ORDER),
    {key:'jitter',label:'Jitter',group:'density',type:'range',min:0,max:1,step:.01,value:.85,note:'site offset inside its cell (0 = lattice)',limits:[[0,.2,'lattice shows through as a grid']]},
    {key:'sizeVar',label:'Size variance',group:'density',type:'range',min:0,max:1,step:.01,value:.35,note:'per-dot radius spread — pen pressure'},
    {key:'irregular',label:'Irregularity',group:'density',type:'range',min:0,max:1,step:.01,value:.35,note:'vertex wobble of each 7-gon — nib, not disc'},
    {key:'source',label:'Value field',group:'dropoff',type:'select',options:['linear','radial','noise'],value:'linear',note:'what drives value across the plate'},
    {key:'angle',label:'Ramp angle',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:0,note:'direction of the linear ramp',when:{source:['linear']}},
    FX.EASE_PARAM('ease','Dropoff curve',['in',1.6],'how value travels from → to across the field'),
    {key:'from',label:'From',group:'dropoff',type:'range',min:0,max:1,step:.01,value:0,note:'value at the start of the field'},
    {key:'to',label:'To',group:'dropoff',type:'range',min:0,max:1,step:.01,value:1,note:'value at the end of the field'},
    {key:'fScale',label:'Field scale',group:'dropoff',type:'range',min:20,max:500,step:1,unit:'px',value:140,note:'noise field wavelength',when:{source:['noise']}},
    ...FX.INK_PARAMS('a','Ink A',.2,.008,285),
    {key:'duo',label:'Ink B',group:'color',type:'select',options:['off','on'],value:'off',note:'a second stipple ramp running the opposite way, overprinted'},
    ...FX.INK_PARAMS('b','Ink B',.62,.2,36).map(p=>Object.assign(p,{when:{duo:['on']}})),
    {key:'density',label:'Ink density',group:'mixing',type:'range',min:.2,max:1,step:.01,value:1,note:'film strength of each dot; below 1 the mix space becomes visible inside the dot'},
    FX.MIX_PARAM('oklab'),
    {key:'over',label:'Overprint',group:'mixing',type:'select',options:['multiply','mix','darken'],value:'multiply',when:{duo:['on']},note:'ink B over ink A — multiply: transparent inks; mix: opaque; darken: lower L wins'},
    ...FX.MASK_PARAMS({mShape:'rect',mInset:16,mAmp:5,mScale:70,mFeather:10,mMode:'speckle',mBite:.2}),
    FX.SEED_PARAM(5)],
  run(o,W,H,dpr,x={}){ const w=W/dpr,h=H/dpr,s=o.seed|0; const M=clipInto(FX.mask(o,W,H,dpr,s),x); const P=proj(w,h,o.angle);
    const field=x.field||((u,v,L)=>{ let t; if(o.source==='radial') t=1-Math.hypot(u-w/2,v-h/2)/(Math.hypot(w,h)*.5); else if(o.source==='noise') t=(FX.fbm(u/o.fScale,v/o.fScale,s+5,3,.5)-.25)/.5; else t=((u-w/2)*P.c+(v-h/2)*P.s)/P.ext+.5; if(L) t=1-t; return lerp(o.from,o.to,FX.ease(o.ease,t)); });
    const layers=o.duo==='on'?2:1, covs=[]; let marks=0; const p=o.pitch, nx=Math.ceil(w/p)+1, ny=Math.ceil(h/p)+1;
    for(let L=0;L<layers;L++){ const D=FX.DotRaster(W,H), sL=s*31+L*977, rad=new Array(7);
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        const sx=(i+.5+(hash(i,j,sL+1)-.5)*o.jitter)*p, sy=(j+.5+(hash(i,j,sL+2)-.5)*o.jitter)*p; if(sx<0||sy<0||sx>=w||sy>=h) continue;
        const val=clamp(field(sx,sy,L),0,1); if(val<=0) continue;
        if(rankOf(o.order,i,j,sL+3)>=val*(1-o.screen)+o.screen) continue;
        const mv=M[((sy*dpr)|0)*W+((sx*dpr)|0)]; if(hash(i,j,sL+4)>=mv) continue;
        const r=o.dotR*((1-o.screen)+o.screen*Math.sqrt(val))*(1+o.sizeVar*(hash(i,j,sL+5)-.5)*1.6); if(r*dpr<.18) continue;
        for(let k=0;k<7;k++) rad[k]=1+o.irregular*(hash(i*7+k,j,sL+7)-.5); D.add(sx*dpr,sy*dpr,r*dpr,rad); marks++; }
      covs.push(D.cov); }
    const inkA=FX.inkOf(o,'a'), inkB=FX.inkOf(o,'b'), lin=compose(W,H,x), cov=new Float32Array(W*H), px=[0,0,0], LUT=x.base?null:FX.lut(inkA,o.mix);
    for(let i=0,k=0;i<W*H;i++,k+=3){ const a=covs[0][i], b=layers>1?covs[1][i]:0; cov[i]=Math.max(a,b); if(!a&&!b) continue;
      if(LUT&&!b){ FX.lutAt(LUT,a*o.density,lin,k); continue; }
      px[0]=lin[k];px[1]=lin[k+1];px[2]=lin[k+2]; FX.mixInto(px,inkA,a*o.density,o.mix); if(b) FX.overInto(px,inkB,b*o.density,o.over,o.mix); lin[k]=px[0];lin[k+1]=px[1];lin[k+2]=px[2]; }
    return {lin,cov,mask:M,marks,inks:layers>1?[inkA,inkB]:[inkA]}; } };

/* ══════════ FX-02 · Ink leaving paper ══════════ */
const inkEdge={ id:'fx-02-ink-edge', code:'FX-02', name:'Ink leaving paper', sub:'A solid that runs out. Coverage eases off across a warped edge; inside the transition it resolves to binary speckle (blue-noise threshold, optionally streaked along the stroke), with starved pinholes and film mottle in the body.',
  recipe:[
    'Distance to the edge line along the stroke direction (CSS px), displaced by fbm warp.',
    'Coverage = dropoff curve over the transition width.',
    'Speckle: perturb coverage by a clump noise (clump size, stretched along the stroke by streak), then threshold it per device pixel against the blue-noise rank. Speckle 0 → continuous tone, 1 → pure binary.',
    'Starve: clumped pinholes, likelier where coverage is thin. Mottle: low-frequency film thickness, taken off coverage.',
    'Mask × coverage × ink density, mixed into the ground per pixel in the chosen color space.'],
  limits:[['transition','< 4 px','reads as a hard vector edge — no speckle band to see'],['clump size','> 8 px','clumps read as blotches, not ink'],['speckle','< .3','the edge becomes a gradient — the "AI gradient" failure'],['streak','> 6','marks read as scanlines unless the angle is off-axis']],
  params:[
    {key:'grain',label:'Clump size',group:'density',type:'range',min:.5,max:12,step:.1,unit:'px',value:2.2,note:'size of the clumps speckle gathers into; marks themselves are device pixels',limits:[[8,12,'clumps read as blotches']]},
    {key:'clump',label:'Clumping',group:'density',type:'range',min:0,max:1,step:.01,value:.55,note:'how strongly speckle gathers into clumps (0 = even blue-noise dither)'},
    {key:'speckle',label:'Speckle ↔ tone',group:'density',type:'range',min:0,max:1,step:.01,value:.92,note:'how much of the transition resolves to binary marks vs partial tone',limits:[[0,.3,'becomes a gradient']]},
    {key:'streak',label:'Streak',group:'density',type:'range',min:1,max:10,step:.1,value:1.6,note:'clumps stretched along the stroke — dry roller, dragged brush',limits:[[6,10,'scanlines on-axis']]},
    Object.assign({value:'blue'},ORDER),
    {key:'starve',label:'Starve',group:'density',type:'range',min:0,max:1,step:.01,value:.14,note:'pinhole density in the body; likelier as ink thins'},
    {key:'pin',label:'Pinhole scale',group:'density',type:'range',min:2,max:60,step:.5,unit:'px',value:7,note:'clump size of the pinholes'},
    {key:'mottle',label:'Mottle',group:'density',type:'range',min:0,max:.4,step:.005,value:.03,note:'film-thickness variation inside the solid'},
    {key:'angle',label:'Stroke angle',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:0,note:'direction the ink travels (it runs out along this vector)'},
    {key:'edge',label:'Edge position',group:'dropoff',type:'range',min:0,max:1,step:.005,value:.56,note:'where the transition is centered across the plate'},
    {key:'width',label:'Transition',group:'dropoff',type:'range',min:1,max:420,step:1,unit:'px',value:150,note:'width of the run-out band',limits:[[1,4,'hard vector edge']]},
    FX.EASE_PARAM('ease','Dropoff curve',['smooth',2],'coverage across the band — how fast the ink gives out'),
    {key:'wAmp',label:'Edge warp',group:'dropoff',type:'range',min:0,max:90,step:.5,unit:'px',value:16,note:'how far the edge line wanders'},
    {key:'wScale',label:'Warp scale',group:'dropoff',type:'range',min:8,max:400,step:1,unit:'px',value:84,note:'wavelength of the wander'},
    {key:'wOct',label:'Warp octaves',group:'dropoff',type:'range',min:1,max:5,step:1,unit:'oct',value:3,note:'detail in the wander'},
    ...FX.INK_PARAMS('i','Ink',.4,.155,300),
    {key:'density',label:'Ink density',group:'mixing',type:'range',min:.2,max:1,step:.01,value:1,note:'film strength of the solid'},
    FX.MIX_PARAM('oklab'),
    ...FX.MASK_PARAMS({mShape:'rect',mInset:16,mAmp:4,mScale:60,mFeather:6,mMode:'speckle',mBite:.12}),
    FX.SEED_PARAM(9)],
  run(o,W,H,dpr,x={}){ const w=W/dpr,h=H/dpr,s=o.seed|0; const M=clipInto(FX.mask(o,W,H,dpr,s),x); const P=proj(w,h,o.angle); const ink=FX.inkOf(o,'i');
    const lin=compose(W,H,x), cov=new Float32Array(W*H), px=[0,0,0], edgePx=(o.edge-.5)*P.ext, g=o.grain, st=o.streak, LUT=x.base?null:FX.lut(ink,o.mix); let marks=0;
    for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const i=y*W+X, m=M[i]; if(m<=0) continue; const u=X/dpr;
      const d=edgePx-((u-w/2)*P.c+(v-h/2)*P.s)+o.wAmp*(FX.fbm(u/o.wScale,v/o.wScale,s,o.wOct,.5)*2-1)*1.5;
      let c=FX.ease(o.ease,clamp(d/o.width+.5,0,1)); if(c<=0) continue;
      if(o.speckle>0&&c<1){ const al=u*P.c+v*P.s, ac=-u*P.s+v*P.c; const cl=c+(FX.fbm(al/(g*st),ac/g,s+3,2,.5)-.5)*2.2*o.clump*Math.min(c,1-c)*2; const r=rankOf(o.order,X,y,s+5); c=lerp(c,r<cl?1:0,o.speckle); }
      if(c>0&&o.starve>0){ const n=FX.fbm(u/o.pin,v/o.pin,s+11,2,.5), th=o.starve*(.3+.7*(1-c))*.62; if(n<th) c*=clamp((n-th)/.025+1,0,1); }
      if(c>0&&o.mottle>0) c*=1-o.mottle*FX.fbm(u/38,v/38,s+21,2,.5);
      c*=m; cov[i]=c; if(c<=0) continue; if(c>.5) marks++;
      const k=i*3; if(LUT){ FX.lutAt(LUT,c*o.density,lin,k); continue; } px[0]=lin[k];px[1]=lin[k+1];px[2]=lin[k+2]; FX.mixInto(px,ink,c*o.density,o.mix); lin[k]=px[0];lin[k+1]=px[1];lin[k+2]=px[2]; } }
    return {lin,cov,mask:M,marks,inks:[ink],markUnit:'inked px'}; } };

/* ══════════ FX-03 · Paper tooth (on white) ══════════ */
const tooth={ id:'fx-03-paper-tooth', code:'FX-03', name:'Paper tooth', sub:'White stock that is not a screen. On white, tooth can only take light away, so it is built as depth: a height field shaded by flat value or a raking light, plus laid fibers and pits, all as an OKLab L offset with an optional tint in the pits.',
  recipe:[
    'Height field = fbm at the tooth scale; octaves and persistence set the spectrum (how fast detail drops off).',
    'Distribution curve reshapes height (more valleys, or more peaks). Rake mixes flat value with relief lit from the light angle (finite-difference gradient).',
    'Fibers: curved strokes at a count per 100 × 100 px, laid near the grain angle with spread; pits: small dots. Both rasterized into separate coverage channels.',
    'Depth = amplitude × shade (+ fibers, pits), optionally stronger toward the plate edges by the falloff curve.',
    'Shade: L −= depth in OKLab (a/b pulled toward the tint by depth) — or multiply in linear / sRGB, for comparison.'],
  limits:[['amplitude','> .06 L','reads as dirt, not stock'],['tooth scale','< 1 px','collapses into per-pixel noise — digital grain, not paper'],['fibers','> 30 / 100 px²','felt, not paper'],['shade in sRGB','—','the same depth looks ~2× stronger than in linear; keep oklab for predictable steps']],
  params:[
    {key:'scale',label:'Tooth scale',group:'density',type:'range',min:.6,max:24,step:.1,unit:'px',value:2.6,note:'feature size of the tooth (noise wavelength), not a tile zoom',limits:[[.6,1,'per-pixel noise']]},
    {key:'oct',label:'Octaves',group:'density',type:'range',min:1,max:6,step:1,unit:'oct',value:3,note:'layers of finer detail'},
    {key:'fibers',label:'Fibers',group:'density',type:'range',min:0,max:40,step:.5,unit:'/100px²',value:9,note:'laid fibers per 100 × 100 CSS px',limits:[[30,40,'felt']]},
    {key:'fLen',label:'Fiber length',group:'density',type:'range',min:2,max:80,step:.5,unit:'px',value:18,note:'mean fiber length'},
    {key:'pits',label:'Pits',group:'density',type:'range',min:0,max:40,step:.5,unit:'/100px²',value:3,note:'dark specks per 100 × 100 CSS px'},
    {key:'pers',label:'Persistence',group:'dropoff',type:'range',min:.15,max:.85,step:.01,value:.48,note:'amplitude kept per octave — the spectral dropoff of the tooth'},
    FX.EASE_PARAM('ease','Distribution',['in',1.4],'reshapes height: power in = sparse deep valleys; out = broad shallow tooth'),
    {key:'rake',label:'Rake',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.55,note:'0 = flat value; 1 = relief under a raking light'},
    {key:'light',label:'Light angle',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:225,note:'direction the raking light comes from'},
    {key:'fAngle',label:'Grain angle',group:'dropoff',type:'range',min:0,max:180,step:1,unit:'°',value:12,note:'machine direction of the fibers'},
    {key:'fSpread',label:'Grain spread',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.45,note:'0 = all fibers on the grain; 1 = any direction'},
    {key:'falloff',label:'Edge falloff',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.25,note:'how much the tooth concentrates toward the plate edges (handling, wear)'},
    FX.EASE_PARAM('fEase','Falloff curve',['in',2],'center → edge profile of the falloff'),
    {key:'amp',label:'Amplitude',group:'color',type:'range',min:0,max:.1,step:.001,unit:'ΔL',value:.04,note:'maximum OKLab L the tooth takes away',limits:[[.06,.1,'reads as dirt']]},
    {key:'fDark',label:'Fiber depth',group:'color',type:'range',min:0,max:.2,step:.002,unit:'ΔL',value:.035,note:'L a fiber takes away'},
    {key:'pDark',label:'Pit depth',group:'color',type:'range',min:0,max:.4,step:.005,unit:'ΔL',value:.12,note:'L a pit takes away'},
    ...FX.INK_PARAMS('t','Pit tint',.55,0,85),
    {key:'space',label:'Shade in',group:'mixing',type:'select',options:['oklab','linear','srgb'],value:'oklab',note:'oklab: L offset, a/b → tint by depth; linear / srgb: multiply light, for comparison'},
    ...FX.MASK_PARAMS({mShape:'none',mInset:16,mAmp:4,mScale:60,mFeather:8,mMode:'tone',mBite:0}),
    FX.SEED_PARAM(21)],
  run(o,W,H,dpr,x={}){ const w=W/dpr,h=H/dpr,s=o.seed|0; const M=clipInto(FX.mask(o,W,H,dpr,s),x); const tint=FX.inkOf(o,'t'); const R=FX.rng(s+77);
    const Hm=new Float32Array(W*H); for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const t=FX.fbm(X/dpr/o.scale,v/o.scale,s,o.oct|0,o.pers); Hm[y*W+X]=clamp((t-.5)*2.4+.5,0,1); } }
    // fibers (red) + pits (green), added
    const cc=FX.coverCanvas(W,H), g=cc.x; g.setTransform(dpr,0,0,dpr,0,0); g.globalCompositeOperation='lighter'; let marks=0;
    const nF=Math.round(o.fibers*w*h/1e4), nP=Math.round(o.pits*w*h/1e4); g.strokeStyle='rgba(255,0,0,.85)'; g.lineCap='round';
    for(let n=0;n<nF;n++){ const x0=R()*w, y0=R()*h, a=(o.fAngle+(R()-.5)*180*o.fSpread)*PI/180, L=o.fLen*(.4+R()*1.2), bend=(R()-.5)*L*.6; const x1=x0+Math.cos(a)*L, y1=y0+Math.sin(a)*L;
      g.lineWidth=.35+R()*.55; g.beginPath(); g.moveTo(x0,y0); g.quadraticCurveTo((x0+x1)/2-Math.sin(a)*bend,(y0+y1)/2+Math.cos(a)*bend,x1,y1); g.stroke(); marks++; }
    g.fillStyle='#0f0'; g.beginPath(); for(let n=0;n<nP;n++){ const X=R()*w, Y=R()*h, r=.3+Math.pow(R(),3)*1.1; g.moveTo(X+r,Y); g.arc(X,Y,r,0,TAU); marks++; } g.fill();
    const fd=g.getImageData(0,0,W,H).data;
    const la=(o.light+180)*PI/180, lx=Math.cos(la), ly=Math.sin(la), lin=compose(W,H,x), cov=new Float32Array(W*H), px=[0,0,0], k2=dpr*3.2;
    const shadeOne=(px,depth)=>{ if(o.space==='oklab') FX.shadeInto(px,-depth,tint,clamp(depth/Math.max(.02,o.amp*2),0,1)); else if(o.space==='linear'){ const f=1-depth*2.2; px[0]*=f;px[1]*=f;px[2]*=f; } else { for(let c=0;c<3;c++){ const e=FX.enc(px[c])/255*(1-depth*1.1); px[c]=e<=.04045?e/12.92:Math.pow((e+.055)/1.055,2.4); } } };
    const dMax=o.amp+o.fDark+o.pDark+1e-4, TN=2048, TL=x.base?null:new Float32Array((TN+1)*3); if(TL) for(let j=0;j<=TN;j++){ px[0]=px[1]=px[2]=1; shadeOne(px,j/TN*dMax); TL[j*3]=px[0];TL[j*3+1]=px[1];TL[j*3+2]=px[2]; }
    for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X, m=M[i]; if(m<=0) continue;
      const hn=Hm[i], gx=Hm[y*W+Math.min(W-1,X+1)]-Hm[y*W+Math.max(0,X-1)], gy=Hm[Math.min(H-1,y+1)*W+X]-Hm[Math.max(0,y-1)*W+X];
      const relief=clamp(.5+(gx*lx+gy*ly)*k2*o.scale*.5,0,1), sh=(1-o.rake)*FX.ease(o.ease,hn)+o.rake*FX.ease(o.ease,relief);
      const r=Math.hypot(X/W-.5,y/H-.5)/.7071, ampE=o.amp*(1-o.falloff*(1-FX.ease(o.fEase,r)));
      const depth=(ampE*sh+o.fDark*fd[i*4]/255+o.pDark*fd[i*4+1]/255)*m; cov[i]=clamp(depth/.1,0,1); if(depth<=0) continue;
      const k=i*3; px[0]=lin[k];px[1]=lin[k+1];px[2]=lin[k+2];
      if(TL){ const j=((depth>=dMax?TN:depth/dMax*TN+.5)|0)*3; lin[k]=TL[j];lin[k+1]=TL[j+1];lin[k+2]=TL[j+2]; continue; }
      if(o.space==='oklab') FX.shadeInto(px,-depth,tint,clamp(depth/Math.max(.02,o.amp*2),0,1));
      else if(o.space==='linear'){ const f=1-depth*2.2; px[0]*=f;px[1]*=f;px[2]*=f; }
      else { for(let c=0;c<3;c++){ const e=FX.enc(px[c])/255*(1-depth*1.1); px[c]=e<=.04045?e/12.92:Math.pow((e+.055)/1.055,2.4); } }
      lin[k]=px[0];lin[k+1]=px[1];lin[k+2]=px[2]; }
    return {lin,cov,mask:M,marks,inks:[tint],markUnit:'fibers + pits'}; } };

/* ══════════ FX-04 · Weave ══════════ */
const PATTERNS={ plain:(i,j)=>((i+j)&1)===0, 'twill 2/1':(i,j)=>(((i+j)%3)+3)%3!==0, 'twill 2/2':(i,j)=>(((i+j)%4)+4)%4<2, basket:(i,j)=>(((i>>1)+(j>>1))&1)===0, 'satin 5':(i,j)=>(((i*2-j)%5)+5)%5!==0 };
const weave={ id:'fx-04-weave', code:'FX-04', name:'Weave', sub:'Cloth, built as cloth: warp and weft threads with their own counts, a real interlacing pattern, slubbed thread width, cylindrical shading along every float, under-threads in shadow, whole accent threads and worn floats.',
  recipe:[
    'Warp columns and weft rows at their own counts (threads per 100 CSS px); each thread gets a jittered center, a thickness, a dye-lot L offset, and accent membership.',
    'Interlacing pattern decides which thread is on top at each crossing; a float is the run of crossings where it stays on top.',
    'Thread half-width = fill × pitch / 2, modulated along its length by slub noise. AA coverage from distance to the centerline.',
    'Shading in OKLab L: across the thread (cylinder) and along the float (dives under at both ends); the under-thread sits in shadow.',
    'Wear thins and fades floats with a probability that rises along the wear direction by its curve; a worn float shows more of the thread beneath and the ground through the gap.'],
  limits:[['count','> 40 /100 px at 1×','threads under 2.5 px alias against the display — moiré'],['fill','< .5','reads as a grid of strokes, not cloth'],['fill','> .97','gutters close; the weave flattens to a check'],['accent rate','> .15','accents stop being accents — a plaid']],
  params:[
    {key:'warp',label:'Warp count',group:'density',type:'range',min:3,max:60,step:.5,unit:'/100px',value:15,note:'vertical threads per 100 CSS px',limits:[[40,60,'aliases at 1×']]},
    {key:'weft',label:'Weft count',group:'density',type:'range',min:3,max:60,step:.5,unit:'/100px',value:15,note:'horizontal threads per 100 CSS px — set apart from warp for an unbalanced cloth'},
    {key:'fill',label:'Fill',group:'density',type:'range',min:.35,max:1,step:.01,value:.88,note:'thread width ÷ pitch — the gutters',limits:[[.35,.5,'a grid of strokes'],[.97,1,'gutters close']]},
    {key:'pattern',label:'Interlacing',group:'density',type:'select',options:Object.keys(PATTERNS),value:'plain',note:'over/under rule; twills and satin make floats longer than one crossing'},
    {key:'slub',label:'Slub',group:'density',type:'range',min:0,max:1,step:.01,value:.35,note:'thread width variation along its length'},
    {key:'slubScale',label:'Slub length',group:'density',type:'range',min:3,max:90,step:.5,unit:'px',value:16,note:'distance between thick and thin'},
    {key:'irregular',label:'Irregularity',group:'density',type:'range',min:0,max:1,step:.01,value:.3,note:'thread spacing and thickness jitter'},
    {key:'round',label:'Roundness',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.5,note:'depth of the cylinder + float shading'},
    {key:'under',label:'Under-shadow',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.3,note:'how much darker a thread is where it passes beneath'},
    {key:'wear',label:'Wear',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.35,note:'probability a float is worn (thinned and faded) at the worn end'},
    FX.EASE_PARAM('wEase','Wear curve',['in',2.2],'how wear grows along its direction'),
    {key:'wAngle',label:'Wear direction',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:90,note:'wear increases toward this direction'},
    ...FX.INK_PARAMS('w','Warp',.36,.006,265),
    ...FX.INK_PARAMS('f','Weft',.58,.014,82),
    ...FX.INK_PARAMS('c','Accent',.5,.075,186),
    {key:'accent',label:'Accent rate',group:'color',type:'range',min:0,max:.3,step:.005,value:.03,note:'share of whole threads (warp and weft) dyed the accent',limits:[[.15,.3,'plaid']]},
    {key:'dye',label:'Dye lot',group:'color',type:'range',min:0,max:.12,step:.002,unit:'ΔL',value:.03,note:'per-thread lightness spread'},
    FX.MIX_PARAM('oklab'),
    ...FX.MASK_PARAMS({mShape:'rect',mInset:16,mAmp:3,mScale:40,mFeather:5,mMode:'speckle',mBite:.1}),
    FX.SEED_PARAM(33)],
  run(o,W,H,dpr,x={}){ const w=W/dpr,h=H/dpr,s=o.seed|0; const M=clipInto(FX.mask(o,W,H,dpr,s),x); const pat=PATTERNS[o.pattern]||PATTERNS.plain;
    const pw=100/o.warp, ph=100/o.weft, NI=Math.ceil(w/pw)+3, NJ=Math.ceil(h/ph)+3;
    const mk=(N,p,salt,inks,base)=>{ const c=new Float32Array(N), t=new Float32Array(N), d=new Float32Array(N), ink=new Array(N); for(let i=0;i<N;i++){ c[i]=(i-1+.5)*p+(hash(i,salt,s)-.5)*o.irregular*p*.35; t[i]=1+(hash(i,salt+1,s)-.5)*o.irregular*.5; d[i]=(hash(i,salt+2,s)-.5)*2*o.dye; ink[i]=hash(i,salt+3,s)<o.accent?inks[1]:inks[0]; } return {c,t,d,ink}; };
    const acc=FX.inkOf(o,'c'), Wp=mk(NI,pw,11,[FX.inkOf(o,'w'),acc]), Fp=mk(NJ,ph,23,[FX.inkOf(o,'f'),acc]);
    const P=proj(w,h,o.wAngle), lin=compose(W,H,x), cov=new Float32Array(W*H), px=[0,0,0]; const floats=new Set();
    const near=(C,p,q,N)=>{ let i=clamp(Math.floor(q/p)+1,0,N-1); let best=i, bd=Math.abs(q-C[i]); for(const k of [i-1,i+1]) if(k>=0&&k<N){ const dd=Math.abs(q-C[k]); if(dd<bd){bd=dd;best=k;} } return best; };
    const run=(i,j,warpTop)=>{ let a=0,b=0; if(warpTop){ while(a<8&&pat(i,j-a-1))a++; while(b<8&&pat(i,j+b+1))b++; } else { while(a<8&&!pat(i-a-1,j))a++; while(b<8&&!pat(i+b+1,j))b++; } return [a,b]; };
    for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const id=y*W+X, m=M[id]; if(m<=0) continue; const u=X/dpr;
      const i=near(Wp.c,pw,u,NI), j=near(Fp.c,ph,v,NJ), dx=u-Wp.c[i], dy=v-Fp.c[j];
      const hwW=o.fill*pw/2*Wp.t[i]*(1+o.slub*(FX.vnoise(v/o.slubScale,i*13.1,s)*2-1)*.45), hwF=o.fill*ph/2*Fp.t[j]*(1+o.slub*(FX.vnoise(u/o.slubScale,j*7.7+100,s+1)*2-1)*.45);
      const ti=i-1, tj=j-1, warpTop=pat(ti,tj), sw=clamp(((u-w/2)*P.c+(v-h/2)*P.s)/P.ext+.5,0,1), pw_=o.wear*FX.ease(o.wEase,sw);
      const worn=hash(ti,tj,s+9)<pw_, wk=worn?.3+.45*hash(ti,tj,s+19):1; // a worn float thins and fades; it does not vanish
      const hwW2=warpTop?hwW*wk:hwW, hwF2=warpTop?hwF:hwF*wk;
      const cW=clamp((hwW2-Math.abs(dx))*dpr+.5,0,1), cF=clamp((hwF2-Math.abs(dy))*dpr+.5,0,1); if(cW<=0&&cF<=0) continue;
      const k=id*3; px[0]=lin[k];px[1]=lin[k+1];px[2]=lin[k+2]; let cc=0;
      const lay=(isWarp,c,under)=>{ if(c<=0) return; const T=isWarp?Wp:Fp, n=isWarp?i:j, across=isWarp?dx/hwW2:dy/hwF2; const cyl=Math.sqrt(Math.max(0,1-across*across));
        let along=1; if(!under){ const [a,b]=run(ti,tj,isWarp), span=a+b+1, pos=isWarp?(v-(Fp.c[j]-ph/2))/ph+a:(u-(Wp.c[i]-pw/2))/pw+a; along=Math.pow(Math.max(0,Math.sin(PI*clamp(pos/span,0,1))),.55); }
        const dL=o.round*.3*(Math.pow(cyl,.7)*.5+along*.5-1)+T.d[n]-(under?o.under*.16:0)+(!under&&worn?.09*(1-wk):0); FX.mixShaded(px,T.ink[n],dL,c*m,o.mix); cc=Math.max(cc,c*m); };
      lay(!warpTop, warpTop?cF:cW, true); lay(warpTop, warpTop?cW:cF, false);
      floats.add(ti*4096+tj);
      cov[id]=cc; lin[k]=px[0];lin[k+1]=px[1];lin[k+2]=px[2]; } }
    return {lin,cov,mask:M,marks:floats.size,inks:[Wp.ink[0],Fp.ink[0],acc],markUnit:'floats'}; } };

/* ══════════ usages · each reads the live dials, merged with its own overrides ══════════ */
const textClip=(W,H,dpr,draw)=>{ const cc=FX.coverCanvas(W,H); cc.x.setTransform(dpr,0,0,dpr,0,0); draw(cc.x,W/dpr,H/dpr); return FX.readCover(cc,W,H); };
const usages=[
  { id:'u-meter', title:'Meter · counted marks', sub:'Three readings as stipple fields. Value is the share of the bar that prints; the bar\'s end runs out by the dropoff curve instead of a hard cap.', uses:['fx-01-stipple'], aspect:'16/9',
    overrides:{'fx-01-stipple':{mShape:'none',source:'linear',duo:'off'}},
    labels:[['Field','.62'],['Respiration','.38'],['Helix','.81']],
    run(ctx,W,H,dpr,P){ const o=P('fx-01-stipple'), w=W/dpr,h=H/dpr, vals=[.62,.38,.81], rows=vals.length, top=h*.16, bh=h*.17, gap=h*.1, x0=w*.3, x1=w*.94;
      const clip=textClip(W,H,dpr,(g)=>{ vals.forEach((_,r)=>g.fillRect(x0,top+r*(bh+gap),x1-x0,bh)); });
      const field=(u,v)=>{ const r=Math.floor((v-top)/(bh+gap)); if(r<0||r>=rows) return 0; const end=x0+(x1-x0)*vals[r], run=Math.max(8,(x1-x0)*.16); return u<end-run?o.to:lerp(o.to,o.from,FX.ease(o.ease,(u-(end-run))/run)); };
      const R=stipple.run(o,W,H,dpr,{clip,field}); return R; } },
  { id:'u-ticket', title:'Ticket · ink over tooth', sub:'Paper tooth as the ground, then the ink edge printed over it in a band: the solid gives out into speckle before the stub line.', uses:['fx-03-paper-tooth','fx-02-ink-edge'], aspect:'16/9',
    overrides:{'fx-03-paper-tooth':{mShape:'none'},'fx-02-ink-edge':{mShape:'band',mInset:10,edge:.58,width:110,angle:0}},
    labels:[['Admit one','№ 0612']],
    run(ctx,W,H,dpr,P){ const base=tooth.run(P('fx-03-paper-tooth'),W,H,dpr).lin; return inkEdge.run(P('fx-02-ink-edge'),W,H,dpr,{base}); } },
  { id:'u-swatch', title:'Swatch · frayed patch', sub:'Weave inside a blob mask with a wide speckle feather and bite: the cut edge frays instead of ending on a vector line. Tooth underneath.', uses:['fx-03-paper-tooth','fx-04-weave'], aspect:'16/9',
    overrides:{'fx-03-paper-tooth':{mShape:'none',amp:.025},'fx-04-weave':{mShape:'blob',mInset:22,mAmp:9,mScale:46,mFeather:4,mMode:'speckle',mBite:.15}},
    labels:[['Linen · plain','15 × 15']],
    run(ctx,W,H,dpr,P){ const base=tooth.run(P('fx-03-paper-tooth'),W,H,dpr).lin; return weave.run(P('fx-04-weave'),W,H,dpr,{base}); } },
  { id:'u-headline', title:'Headline · ink runs out of the word', sub:'Type rasterized as a clip; the ink edge crosses it, so the last letters print starved. Type is a mask, never a gradient fill.', uses:['fx-02-ink-edge'], aspect:'16/9',
    overrides:{'fx-02-ink-edge':{mShape:'none',edge:.7,width:220,angle:0,starve:.22}},
    labels:[],
    run(ctx,W,H,dpr,P){ const clip=textClip(W,H,dpr,(g,w,h)=>{ let fs=h*.5; g.font=`800 ${fs}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.fontStretch='normal'; let tw=g.measureText('Counted').width; fs*=Math.min(1,(w*.86)/tw); g.font=`800 ${fs}px Archivo, "Helvetica Neue", Arial, sans-serif`; tw=g.measureText('Counted').width; g.textBaseline='alphabetic'; g.fillText('Counted',(w-tw)/2,h*.5+fs*.36); });
      return inkEdge.run(P('fx-02-ink-edge'),W,H,dpr,{clip}); } },
  { id:'u-overprint', title:'Overprint · two inks, one rule', sub:'Two stipple ramps crossing on a radial field. Where they meet, the overprint rule and the mix space decide the third color — switch them on FX-01 and watch this card.', uses:['fx-01-stipple'], aspect:'16/9',
    overrides:{'fx-01-stipple':{duo:'on',source:'linear',angle:20,mShape:'ellipse',mInset:14,mFeather:16}},
    labels:[],
    run(ctx,W,H,dpr,P){ return stipple.run(P('fx-01-stipple'),W,H,dpr); } },
  { id:'u-slot', title:'Image slot · placeholder', sub:'A generated slot for a layout: noise-driven stipple inside a rounded rect, so a template never ships a gray box. Replace with a real image.', uses:['fx-01-stipple','fx-03-paper-tooth'], aspect:'16/9',
    overrides:{'fx-03-paper-tooth':{mShape:'none',amp:.02,fibers:3},'fx-01-stipple':{source:'noise',fScale:90,from:.04,to:.7,mShape:'rect',mInset:12,mAmp:1.5,mFeather:3,mMode:'tone',mBite:0}},
    labels:[['slot · 16:9','replace']],
    run(ctx,W,H,dpr,P){ const base=tooth.run(P('fx-03-paper-tooth'),W,H,dpr).lin; return stipple.run(P('fx-01-stipple'),W,H,dpr,{base}); } }
];

G.FXSET={ code:'T-04', title:'Effect set · Four surfaces', short:'Four surfaces', set:'Set 01',
  premise:'Four textures, each a counted mark. None of them a gradient. Rebuilt on white with the dials that change how the marks are made — count, dropoff, color rule, edge — never the zoom of a tile.',
  source:'Mindgut · Technique & Front-End Study V01 §08 (texture recipes) · ø co. · 2026-10-23',
  effects:[stipple,inkEdge,tooth,weave], usages };
})(window);
