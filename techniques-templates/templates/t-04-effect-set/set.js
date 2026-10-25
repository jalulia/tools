/* T-04 · Effect set · the SET file · ø co. Techniques & Templates
   This is the only file a new set replaces. Shape (also in template.json):
     self.FXSET = { code, title, short, set, premise, source, system, effects:[Effect], usages:[Usage] }
     Effect = { id, code, name, sub, role, recipe:[str], limits:[[param, range, what happens]], params:[Param],
                stockOf?(o) → effect id it prints on (drives re-render coupling),
                run(o, W, H, dpr, x) → { lin, alb, lf, ink, stock, mask, marks, markUnit } }
       lin  = Float32 W·H·3 linear RGB, lit · alb = unlit albedo (for a second ink pass) · lf = light factor per px
       ink  = absorbance (film thickness × acceptance) · stock = height field · mask = coverage
       x    = { S: params of every effect (stock coupling), alb: albedo to print over, clip: Float32 pressure/coverage clip, field:(u,v,layer)→0..1 }
     Param  = { key, label, group: density|dropoff|stock|relief|color|mixing|mask|seed, type: range|select|ease, value, min,max,step,unit, options, note, limits, when }
     Usage  = { id, title, sub, uses:[ids], aspect, overrides:{id:{…}}, labels, clips?:{name:(g,w,h)=>draw}, run(P, W, H, dpr, x) }
   Set 01 · "Four surfaces" — the texture recipes from Mindgut Technique Study V01 §08, rebuilt as ONE material system:
   two stocks (paper, cloth) and two marks (pen stipple, roller ink). Every mark prints INTO a stock; one light rakes all of it. */
(function(G){
'use strict';
const FX=G.FX, PI=Math.PI, TAU=FX.TAU, clamp=FX.clamp, lerp=FX.lerp, hash=FX.hash;
const sstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const TOOTH='fx-03-paper-tooth', WEAVE='fx-04-weave';

/* ── shared pieces ── */
const proj=(w,h,deg)=>{ const a=deg*PI/180, c=Math.cos(a), s=Math.sin(a); return {c,s,ext:Math.abs(w*c)+Math.abs(h*s)}; };
const BAYER=(()=>{ let m=[[0]]; for(let n=1;n<8;n*=2){ const z=[]; for(let y=0;y<n*2;y++){ z[y]=[]; for(let x=0;x<n*2;x++){ const q=m[y%n][x%n]*4; z[y][x]=q+(y<n?(x<n?0:2):(x<n?3:1)); } } m=z; } const N=m.length; return (x,y)=>(m[((y%N)+N)%N][((x%N)+N)%N]+.5)/(N*N); })();
const rankOf=(order,i,j,s)=>order==='white'?hash(i,j,s):order==='ordered'?BAYER(i,j):FX.blue.at(i+s%41,j+s%29);
const ORDER={key:'order',label:'Selection',group:'density',type:'select',options:['blue','white','ordered'],note:'which sites survive at a given density — blue: even thinning (void-and-cluster rank); white: hash, clumps; ordered: 8×8 Bayer, reads as a screen'};
const lruSet=(m,k,v,n=4)=>{ m.set(k,v); if(m.size>n) m.delete(m.keys().next().value); return v; };
const keyOf=(o,keys)=>keys.map(k=>JSON.stringify(o[k])).join('|');

/* ══════════ STOCK 1 · paper — a height field: tooth + formation + laid fibers + pits ══════════ */
const PAPER_KEYS=['scale','oct','pers','ease','aniso','fibers','fLen','fWidth','fAngle','fSpread','fRaise','pits','pDepth','form','formScale','seed'];
const PAPER=new Map();
function paperField(t,W,H,dpr){ const key=keyOf(t,PAPER_KEYS)+'|'+W+'|'+H+'|'+dpr; const hit=PAPER.get(key); if(hit) return hit;
  const w=W/dpr, hh=H/dpr, s=t.seed|0, R=FX.rng(s+77), h=new Float32Array(W*H), form=new Float32Array(W*H), ga=t.fAngle*PI/180, gc=Math.cos(ga), gs=Math.sin(ga), an=Math.max(1,t.aniso||1), sa=t.scale*Math.sqrt(an), sb=t.scale/Math.sqrt(an);
  // three scales, three roles: TOOTH (lit, gradient noise; the grain direction drifts by region, so no single-angle worms),
  // FORMATION (fiber flocs: albedo + ink mottle, barely in the height), FIBERS + PITS (own albedo, lit)
  const sp=(t.fSpread||0)*.35; // a slight regional drift only — more than this swirls the grain into wood figure
  // band-limited tooth: each octave fades out as its wavelength nears 1 device px, so the height field never carries
  // sub-pixel noise (which thresholds into single-pixel salt) — on a denser screen or a macro the finer octaves come back
  const NO=t.oct|0, OW=[], OC=[], OS=[]; { let lam=t.scale/Math.sqrt(an); for(let k=0;k<NO;k++){ OW.push(Math.pow(t.pers,k)*clamp((lam*dpr-1.1)/1.6,0,1)); OC.push(Math.cos(k*.9)); OS.push(Math.sin(k*.9)); lam/=2.03; } if(!OW.some(x=>x>0)) OW[0]=1; }
  const toothN=(x,y)=>{ let v=0,n=0,f=1; for(let k=0;k<NO;k++){ const w=OW[k]; if(w>0){ v+=w*FX.gnoise((x*OC[k]-y*OS[k])*f,(x*OS[k]+y*OC[k])*f,s+k*17); n+=w; } f*=2.03; } return n?v/n:.5; };
  for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const u=X/dpr, i=y*W+X;
    const da=sp*(FX.gnoise(u/34,v/34,s+55)-.5)*2, c_=Math.cos(ga+da), s_=Math.sin(ga+da);
    let n=toothN((u*c_+v*s_)/sa,(-u*s_+v*c_)/sb); n=FX.ease(t.ease,.5+.5*Math.tanh((n-.5)*3.2)); // soft compression: a hard clamp leaves plateaus whose creases light up as contour lines
    const f=FX.fbm(u/t.formScale,v/t.formScale,s+101,3,.5); form[i]=f; h[i]=n+(f-.5)*.25*t.form; } }
  const FL=FX.LineRaster(W,H), nF=Math.round(t.fibers*w*hh/1e4);
  for(let n=0;n<nF;n++){ const x0=R()*w, y0=R()*hh, a=(t.fAngle+(R()-.5)*180*t.fSpread)*PI/180, L=t.fLen*(.35+R()*1.3), bend=(R()-.5)*L*.7, x1=x0+Math.cos(a)*L, y1=y0+Math.sin(a)*L;
    FL.curve(x0*dpr,y0*dpr,((x0+x1)/2-Math.sin(a)*bend)*dpr,((y0+y1)/2+Math.cos(a)*bend)*dpr,x1*dpr,y1*dpr,Math.max(.6,t.fWidth*(.55+R()*.9)*dpr),.55+R()*.45); }
  const PD=FX.DotRaster(W,H), nP=Math.round(t.pits*w*hh/1e4);
  for(let n=0;n<nP;n++){ const r=(.3+Math.pow(R(),2.5)*1.1)*dpr; PD.add(R()*W,R()*H,r,null,Math.max(1,r*.6),1); }
  for(let i=0;i<W*H;i++) h[i]=clamp(h[i]+t.fRaise*FL.cov[i]*.55-t.pDepth*PD.cov[i],0,1.2);
  return lruSet(PAPER,key,{h,fib:FL.cov,pit:PD.cov,form,marks:nF+nP}); }
const PAPER_LIT=new Map();
function paperLit(t,W,H,dpr,L){ const P=paperField(t,W,H,dpr); const key=keyOf(t,PAPER_KEYS.concat(['depth','diffuse','paperL','fDark','pDark','tL','tC','th','tAmt']))+'|'+W+'|'+H+'|'+dpr+'|'+L.az+'|'+L.el; const hit=PAPER_LIT.get(key); if(hit) return hit;
  const sh=FX.shade(P.h,W,H,dpr,t.depth,L), tint=FX.inkOf(t,'t'), Y=tint.lin[0]*.2126+tint.lin[1]*.7152+tint.lin[2]*.0722||1e-3;
  const amb=[0,1,2].map(c=>lerp(1,tint.lin[c]/Y,t.tAmt)), lf=new Float32Array(W*H*3), alb=new Float32Array(W*H*3), d=t.diffuse;
  for(let i=0,k=0;i<W*H;i++,k+=3){ const Lp=clamp(t.paperL-t.fDark*P.fib[i]-t.pDark*P.pit[i]-t.form*.022*(P.form[i]-.5)*2,0,1), a=Lp*Lp*Lp; alb[k]=alb[k+1]=alb[k+2]=a;
    const dif=d*sh[i]; lf[k]=(1-d)*amb[0]+dif; lf[k+1]=(1-d)*amb[1]+dif; lf[k+2]=(1-d)*amb[2]+dif; }
  return lruSet(PAPER_LIT,key,{kind:'paper',h:P.h,fib:P.fib,form:P.form,alb,lf,marks:P.marks}); }

/* ══════════ STOCK 2 · cloth — woven threads as a height field with dyed albedo ══════════ */
const PATTERNS={ plain:(i,j)=>((i+j)&1)===0, 'twill 2/1':(i,j)=>(((i+j)%3)+3)%3!==0, 'twill 2/2':(i,j)=>(((i+j)%4)+4)%4<2, basket:(i,j)=>(((i>>1)+(j>>1))&1)===0, 'satin 5':(i,j)=>(((i*2-j)%5)+5)%5!==0 };
const CLOTH_KEYS=['warp','weft','fill','pattern','slub','slubScale','hair','irregular','wear','wEase','wAngle','wL','wC','wh','fL','fC','fh','cL','cC','ch','accent','aMode','dye','mix','mShape','mInset','mAmp','mScale','mRough','fray','seed'];
const CLOTH=new Map();
function clothField(o,W,H,dpr,jq){ const key=keyOf(o,CLOTH_KEYS)+'|'+W+'|'+H+'|'+dpr+'|'+(jq?jq.__id||(jq.__id=Math.random().toString(36).slice(2)):''); const hit=CLOTH.get(key); if(hit) return hit;
  const w=W/dpr,hh=H/dpr,s=o.seed|0, pat0=PATTERNS[o.pattern]||PATTERNS.plain, MF=FX.maskField(Object.assign({},o,{mFeather:1,mBite:0,mMode:'tone'}),W,H,dpr,s), D=MF.d;
  const pw=100/o.warp, ph=100/o.weft, NI=Math.ceil(w/pw)+3, NJ=Math.ceil(hh/ph)+3;
  const mk=(N,p,salt,base)=>{ const c=new Float32Array(N), t=new Float32Array(N), d=new Float32Array(N), acc=new Uint8Array(N), fr=new Float32Array(N); for(let i=0;i<N;i++){ c[i]=(i-1+.5)*p+(hash(i,salt,s)-.5)*o.irregular*p*.35; t[i]=1+(hash(i,salt+1,s)-.5)*o.irregular*.5; d[i]=(hash(i,salt+2,s)-.5)*2*o.dye; acc[i]=o.aMode==='threads'&&hash(i,salt+3,s)<o.accent?1:0; fr[i]=Math.pow(hash(i,salt+4,s),1.6); } return {c,t,d,acc,fr,base}; };
  const acc=FX.inkOf(o,'c'), Wp=mk(NI,pw,11,FX.inkOf(o,'w')), Fp=mk(NJ,ph,23,FX.inkOf(o,'f')), P=proj(w,hh,o.wAngle);
  // jacquard figure: sampled at each crossing's center, so a crossing is wholly ground or wholly figure
  const figAt=(i,j)=>{ const ii=clamp(i+1,0,NI-1), jj=clamp(j+1,0,NJ-1), X=clamp(Math.round(Wp.c[ii]*dpr),0,W-1), Y=clamp(Math.round(Fp.c[jj]*dpr),0,H-1); return jq[Y*W+X]>.5; };
  const pat=jq?((i,j)=>figAt(i,j)?!pat0(i,j):pat0(i,j)):pat0;
  // two-weft damask: inside the figure the weft is the figure color; in the ground a second weft matches the warp
  const CG=[], gw=(slot,ink,dL)=>{ let c=CG[slot]; if(!c){ c=[1,1,1]; FX.mixShaded(c,ink,dL,1,'oklab'); CG[slot]=c; } return c; };
  const GAP=[0,1,2].map(c=>(Wp.base.lin[c]+Fp.base.lin[c])*.5*.42); // the shadowed under-layer seen through a gap: darker than the threads, never a black screen
  const h=new Float32Array(W*H), alb=FX.ground(W,H,FX.WHITE), a=new Float32Array(W*H), hair=new Float32Array(W*H), px=[0,0,0], floats=new Set();
  // per-thread colors, computed once: slot = thread·8 + (warp?0:4) + (accent?2:0) + (worn?1:0)
  const CW=new Array(Math.max(NI,NJ)*8+8), colOf=(slot,ink,dL)=>{ let c=CW[slot]; if(!c){ c=[1,1,1]; FX.mixShaded(c,ink,dL,1,'oklab'); CW[slot]=c; } return c; };
  const near=(C,p,q,N)=>{ let i=clamp(Math.floor(q/p)+1,0,N-1); let best=i, bd=Math.abs(q-C[i]); for(const k of [i-1,i+1]) if(k>=0&&k<N){ const dd=Math.abs(q-C[k]); if(dd<bd){bd=dd;best=k;} } return best; };
  const run=(i,j,warpTop)=>{ let a=0,b=0; if(warpTop){ while(a<8&&pat(i,j-a-1))a++; while(b<8&&pat(i,j+b+1))b++; } else { while(a<8&&!pat(i-a-1,j))a++; while(b<8&&!pat(i+b+1,j))b++; } return [a,b]; };
  for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const id=y*W+X, u=X/dpr;
    const i=near(Wp.c,pw,u,NI), j=near(Fp.c,ph,v,NJ), dx=u-Wp.c[i], dy=v-Fp.c[j], ti=i-1, tj=j-1, warpTop=pat(ti,tj);
    const sw=clamp(((u-w/2)*P.c+(v-hh/2)*P.s)/P.ext+.5,0,1), worn=hash(ti,tj,s+9)<o.wear*FX.ease(o.wEase,sw), wk=worn?.35+.4*hash(ti,tj,s+19):1;
    let hwW=o.fill*pw/2*Wp.t[i]*(1+o.slub*(FX.vnoise(v/o.slubScale,i*13.1,s)*2-1)*.45), hwF=o.fill*ph/2*Fp.t[j]*(1+o.slub*(FX.vnoise(u/o.slubScale,j*7.7+100,s+1)*2-1)*.45);
    if(warpTop) hwW*=wk; else hwF*=wk;
    let cW=clamp((hwW-Math.abs(dx))*dpr+.5,0,1), cF=clamp((hwF-Math.abs(dy))*dpr+.5,0,1);
    if(D){ const xc=clamp(Math.round(Wp.c[i]*dpr),0,W-1), yc=clamp(Math.round(Fp.c[j]*dpr),0,H-1); cW*=clamp((D[y*W+xc]+o.fray*Wp.fr[i])*dpr+.5,0,1); cF*=clamp((D[yc*W+X]+o.fray*Fp.fr[j])*dpr+.5,0,1); } // fray: the cut is read at each thread's centerline, so threads are whole or gone across their width and each ends at its own length
    if(cW<=0&&cF<=0){ if(!D||D[id]>0){ const k=id*3; alb[k]=GAP[0]; alb[k+1]=GAP[1]; alb[k+2]=GAP[2]; } continue; } // a gap inside the cloth shows the dark behind it, not the page
    const top=warpTop?cW:cF, und=warpTop?cF:cW, T=warpTop?Wp:Fp, U=warpTop?Fp:Wp, nT=warpTop?i:j, nU=warpTop?j:i;
    const acrT=warpTop?dx/hwW:dy/hwF, acrU=warpTop?dy/(hwF||1):dx/(hwW||1), cylT=Math.sqrt(Math.max(0,1-acrT*acrT)), cylU=Math.sqrt(Math.max(0,1-acrU*acrU));
    const [ra,rb]=run(ti,tj,warpTop), span=ra+rb+1, pos=warpTop?(v-(Fp.c[j]-ph/2))/ph+ra:(u-(Wp.c[i]-pw/2))/pw+ra, along=Math.pow(Math.max(0,Math.sin(PI*clamp(pos/span,0,1))),.5);
    const pp=Math.min(pw,ph), al=warpTop?v:u, ac=warpTop?u:v, hr=o.hair*(FX.vnoise(al/(pp*.45)+nT*3.1,ac/Math.max(.35,pp*.09),s+31)-.5);
    // ply twist: each float carries an S-twist ridge (an angled sinusoid along the thread), faded in only once a thread is
    // wide enough on screen to show it (≥ ~5 device px) — at small scale the cloth stays clean
    const tpx=(warpTop?pw:ph)*dpr, twA=.11*clamp((tpx-4.5)/6,0,1), twist=twA?twA*Math.sin(TAU*((warpTop?v:u)/((warpTop?pw:ph)*.62)+acrT*.9)+nT*1.7):0;
    const hT=(.42+.58*cylT*(.3+.7*along))*(worn?.82:1)+hr*.35+twist*cylT, hU=.2+.26*cylU;
    h[id]=und*hU*(1-top)+top*hT; a[id]=Math.max(top,und); hair[id]=top*clamp(hr*2+.5,0,1)*o.hair;
    const k=id*3; if(!D||D[id]>0){ px[0]=GAP[0];px[1]=GAP[1];px[2]=GAP[2]; } else { px[0]=alb[k];px[1]=alb[k+1];px[2]=alb[k+2]; } // partial thread coverage blends over the dark behind the cloth, not the page (no bright dots at thread corners)
    const fleck=o.aMode!=='threads'&&(warpTop?hash(ti,tj-ra,s+41):hash(ti-ra,tj,s+43))<o.accent, inkT=(T.acc[nT]||fleck)?acc:T.base, inkU=U.acc[nU]?acc:U.base;
    // per-thread color is constant (dye lot, wear) → cached; AA edges blend in linear light (optical, 1 device px)
    const ground=jq&&!figAt(ti,tj);
    if(und>0){ const ua=U.acc[nU]?1:0, cu=(ground&&warpTop)?gw(nU,Wp.base,U.d[nU]-.06):colOf(nU*8+(warpTop?4:0)+ua*2,inkU,U.d[nU]-.06); if(und>=1){ px[0]=cu[0];px[1]=cu[1];px[2]=cu[2]; } else { px[0]+=(cu[0]-px[0])*und; px[1]+=(cu[1]-px[1])*und; px[2]+=(cu[2]-px[2])*und; } }
    if(top>0){ const ta=(T.acc[nT]||fleck)?1:0, ct=(ground&&!warpTop)?gw(nT+4096,Wp.base,T.d[nT]):colOf(nT*8+(warpTop?0:4)+ta*2+(worn?1:0),inkT,T.d[nT]+(worn?.05:0)); if(top>=1){ px[0]=ct[0];px[1]=ct[1];px[2]=ct[2]; } else { px[0]+=(ct[0]-px[0])*top; px[1]+=(ct[1]-px[1])*top; px[2]+=(ct[2]-px[2])*top; } }
    alb[k]=px[0];alb[k+1]=px[1];alb[k+2]=px[2]; floats.add(ti*4096+tj); } }
  return lruSet(CLOTH,key,{h,alb,a,hair,marks:floats.size,D}); }
const CLOTH_LIT=new Map();
function clothLit(o,W,H,dpr,L,jq){ const C=clothField(o,W,H,dpr,jq); const key=keyOf(o,CLOTH_KEYS.concat(['depth','diffuse','shadow','lift']))+'|'+W+'|'+H+'|'+dpr+'|'+(jq?jq.__id:'')+'|'+L.az+'|'+L.el; const hit=CLOTH_LIT.get(key); if(hit) return hit;
  const pitch=100/Math.max(o.warp,o.weft), depth=o.depth*pitch*.3, sh=FX.shade(C.h,W,H,dpr,depth,L), hs=FX.hshadow(C.h,W,H,dpr,depth,L,depth*2.6,.35), cs=o.lift>0&&o.mShape!=='none'?FX.castShadow(C.a,W,H,dpr,L,o.lift):null, near=FX.blur(C.a,W,H,pitch*.35*dpr);
  const lf=new Float32Array(W*H*3), d=o.diffuse;
  for(let i=0,k=0;i<W*H;i++,k+=3){ const occ=lerp(1,hs[i],o.shadow), ao=1-o.shadow*.4*(1-clamp(C.h[i]*2.2,0,1))*clamp(near[i]*1.6,0,1);
    let f=((1-d)*ao+d*sh[i]*occ); if(cs) f*=1-cs[i]*1.1; lf[k]=lf[k+1]=lf[k+2]=f; }
  return lruSet(CLOTH_LIT,key,{kind:'cloth',h:C.h,fib:C.hair,form:null,alb:C.alb,lf,marks:C.marks,a:C.a}); }

/* the stock an ink prints on: paper (FX-03 live params), cloth (FX-04 live params), or smooth (none) */
const stockFor=(o,x,W,H,dpr)=>{ if(x&&x.stockLit) return x.stockLit; const S=(x&&x.S)||{}; if(o.stock==='paper'&&S[TOOTH]) return paperLit(Object.assign({},S[TOOTH],{mShape:'none'}),W,H,dpr,FX.LIGHT); if(o.stock==='cloth'&&S[WEAVE]) return clothLit(Object.assign({},S[WEAVE],{mShape:'none',lift:0}),W,H,dpr,FX.LIGHT); return null; };

/* ══════════ THE INK CHAIN · one machine, used by every mark ══════════
   pressure P (0..1) → acceptance against the stock height: ink lands where the surface stands above 1 − P
   (as pressure falls, only peaks still touch the roller/nib); film-splitting noise covers what the stock does not decide.
   starve: the deepest valleys and pits never take ink (pinholes come from the paper, not from a separate noise).
   wick: ink travels along fibers into the run-out. thickness τ: thins with pressure unless it breaks up; formation mottles it.
   absorbance A = acceptance × τ; color = film (Beer–Lambert, LUT) or a coverage mix; light is applied after, once. */
const STOCK_PARAMS=(d={})=>[
  {key:'stock',label:'Prints on',group:'stock',type:'select',options:['paper','cloth','smooth'],value:d.stock||'paper',note:'paper = FX-03 live, cloth = FX-04 live, smooth = no substrate (film-splitting noise only). Tune the stock and this plate redraws.'},
  {key:'bite',label:'Stock bite',group:'stock',type:'range',min:0,max:1,step:.01,value:d.bite??.75,note:'how much the stock height (vs film-splitting noise) decides where ink lands',when:{stock:['paper','cloth']}},
  {key:'breakup',label:'Break-up ↔ thin',group:'stock',type:'range',min:0,max:1,step:.01,value:d.breakup??.9,note:'1 = ink film breaks into marks on the peaks as pressure falls; 0 = the film stays whole and thins to tone',limits:[[0,.3,'reads as a gradient']]},
  {key:'starve',label:'Starve',group:'stock',type:'range',min:0,max:.3,step:.002,value:d.starve??.02,note:'the lowest share of the surface never takes ink — pinholes in the solid, placed by the paper\'s valleys and pits'},
  {key:'wick',label:'Wick',group:'stock',type:'range',min:0,max:1,step:.01,value:d.wick??.35,note:'ink carried along fibers into the run-out (hairline feathering)',when:{stock:['paper','cloth']}},
  {key:'mottle',label:'Mottle',group:'stock',type:'range',min:0,max:1,step:.01,value:d.mottle??.3,note:'paper formation (its low-frequency cloudiness) varying the film thickness',when:{stock:['paper']}},
  {key:'split',label:'Film split',group:'stock',type:'range',min:.5,max:10,step:.1,unit:'px',value:d.split??1.8,note:'clump size of the film-splitting noise (the roller\'s own speckle)'}];
function inkChain(Pb,st,o,ink,alb,A,W,H,dpr,seed,rule,ang=0,streak=1,tauMap=null,opt={}){ const COV=opt.cov||null, BAND=opt.band||0;
  const film=rule==='film', LUT=film?FX.filmLUT(ink):null, ca=Math.cos(ang*PI/180), sa=Math.sin(ang*PI/180), g=o.split, b=.05, px=[0,0,0]; let n=0;
  // pass 1 · the effective surface height under the inked area (stock height + film-splitting noise)
  const E=new Float32Array(W*H), hist=new Uint32Array(512); let cnt=0;
  for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const i=y*W+X; if(Pb[i]<=.002) continue; const u=X/dpr;
    const al=u*ca+v*sa, ac=-u*sa+v*ca, fs=.6*FX.fbm(al/(g*streak),ac/g,seed+3,2,.5)+.4*FX.grain(u,v,seed+9,.55,dpr);
    const e=st?lerp(fs,st.h[i]*.8+fs*.2,o.bite):fs; E[i]=e; hist[clamp((e*400)|0,0,511)]++; cnt++; } }
  // the surface the roller meets is band-limited to ~.7 CSS px (a film cannot resolve finer than that): marks and pinholes
  // are at least that size on any screen, never single device pixels
  { const Eb=FX.blur(E,W,H,Math.max(1,Math.round(.3*dpr))); hist.fill(0); for(let i=0;i<W*H;i++){ if(Pb[i]<=.002) continue; E[i]=Eb[i]; hist[clamp((Eb[i]*400)|0,0,511)]++; } }
  // pass 2 · height → percentile, so pressure P inks exactly the top P of the surface (and starve = the lowest share)
  const cdf=new Float32Array(512); let acc_=0; for(let k=0;k<512;k++){ acc_+=hist[k]; cdf[k]=cnt?acc_/cnt:0; }
  // q is interpolated in the CDF (no 1/512 steps); the threshold is anti-aliased by q's own gradient, so a mark's edge is
  // ~1 device px wide whatever the noise or pressure — coverage, not on/off pixels
  const Q=new Float32Array(W*H); for(let i=0;i<W*H;i++){ if(Pb[i]<=.002) continue; const e=clamp(E[i]*400,0,510.999), k0=e|0, f=e-k0; Q[i]=cdf[k0]+(cdf[k0+1]-cdf[k0])*f; }
  for(let i=0;i<W*H;i++){ const P=Pb[i]; if(P<=.002) continue; const q=Q[i], th=1-P, X=i%W;
    const gx=Q[X<W-1?i+1:i]-Q[X>0?i-1:i], gy=Q[i+W<W*H?i+W:i]-Q[i-W>=0?i-W:i], bw=Math.max(BAND||.003,Math.min(.25,.5*Math.hypot(gx,gy)*.6));
    let acc=sstep(th-bw,th+bw,q)*sstep(o.starve-bw,o.starve+bw,q);
    if(st&&o.wick>0&&st.fib) acc=Math.max(acc,o.wick*st.fib[i]*sstep(.04,.55,P));
    if(COV) acc*=COV[i]; // a drawn mark (pencil line): the stroke's own AA coverage is the edge; the stock only modulates it
    // break-up share prints binary marks at full film; the rest is a whole film that thins as P² (vanishes fast, no haze)
    let tau=o.density*(tauMap?tauMap[i]:1); if(st&&st.form&&o.mottle) tau*=1-o.mottle*(st.form[i]-.5)*1.4;
    const a=(o.breakup*acc+(1-o.breakup)*P*P)*tau; if(a<=0) continue; A[i]=Math.max(A[i],a); if(a>.35) n++; const k=i*3;
    if(film){ const j=((a>=2?1024:a*512+.5)|0)*3; alb[k]*=LUT[j]; alb[k+1]*=LUT[j+1]; alb[k+2]*=LUT[j+2]; }
    else { px[0]=alb[k];px[1]=alb[k+1];px[2]=alb[k+2]; if(rule==='darken') FX.overInto(px,ink,Math.min(1,a),'darken'); else FX.mixInto(px,ink,Math.min(1,a),rule); alb[k]=px[0];alb[k+1]=px[1];alb[k+2]=px[2]; } }
  return n; }
/* pen chain · a dot is geometry, the stock edits its edge: coverage = AA(sd + rag · (h − h̄)), 1 device px wide.
   Pinholes: valleys below the starve height inside the dot; wick: fibers carry ink a short way out; τ = film × pressure. */
const meanH=(h)=>{ if(!h) return .5; let m=0, n=0; for(let i=0;i<h.length;i+=97){ m+=h[i]; n++; } return m/n; };
function penChain(D,st,o,ink,alb,A,W,H,dpr,seed,rule){
  const film=rule==='film', LUT=film?FX.filmLUT(ink):null, px=[0,0,0], hm=meanH(st&&st.h), rag=o.rag*dpr*2, wr=Math.max(.01,o.wick*3*dpr); let n=0;
  for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X, sd=D.sd[i]; if(sd<-8.5) continue;
    const hh=st?st.h[i]:FX.fbm(X/dpr/1.1,y/dpr/1.1,seed+7,2,.5)+(FX.grain(X/dpr,y/dpr,seed+8,.5,dpr)-.5)*.25, P=D.pr[i];
    let c=clamp(sd+rag*(hh-hm)+.5,0,1);
    if(c>0&&o.starve>0){ const t=hm-.5+o.starve*(1.6-P)*1.4; c*=sstep(t-.03,t+.03,hh); } // pinholes AA-edged, not cut
    if(st&&st.fib&&o.wick>0&&sd>-wr) c=Math.max(c,sstep(.35,.75,st.fib[i])*clamp(1+sd/wr,0,1));
    if(c<=0) continue;
    let tau=o.density*(.55+.45*P); if(st&&st.form&&o.mottle) tau*=1-o.mottle*(st.form[i]-.5)*1.4;
    const a=c*tau; A[i]=Math.max(A[i],a); if(c>.5&&sd>0) n++; const k=i*3;
    if(film){ const j=((a>=2?1024:a*512+.5)|0)*3; alb[k]*=LUT[j]; alb[k+1]*=LUT[j+1]; alb[k+2]*=LUT[j+2]; }
    else { px[0]=alb[k];px[1]=alb[k+1];px[2]=alb[k+2]; if(rule==='darken') FX.overInto(px,ink,Math.min(1,a),'darken'); else FX.mixInto(px,ink,Math.min(1,a),rule); alb[k]=px[0];alb[k+1]=px[1];alb[k+2]=px[2]; } }
  return n; }
const PEN_STOCK=(d={})=>[
  {key:'stock',label:'Prints on',group:'stock',type:'select',options:['paper','cloth','smooth'],value:d.stock||'paper',note:'paper = FX-03 live, cloth = FX-04 live, smooth = no substrate. Tune the stock and this plate redraws.'},
  {key:'rag',label:'Edge rag',group:'stock',type:'range',min:0,max:1.5,step:.01,unit:'px',value:d.rag??.07,curve:2,note:'how far the stock\'s tooth pushes each dot edge in and out — 0 = perfect discs',limits:[[.9,1.5,'dots read as fuzz']]},
  {key:'starve',label:'Starve',group:'stock',type:'range',min:0,max:.3,step:.002,value:d.starve??.0,curve:2,note:'valleys inside a dot that the nib skips — single-pixel pinholes, more as pressure drops'},
  {key:'wick',label:'Wick',group:'stock',type:'range',min:0,max:1,step:.01,value:d.wick??.08,curve:2,note:'ink carried a short way out along fibers',when:{stock:['paper','cloth']}},
  {key:'mottle',label:'Mottle',group:'stock',type:'range',min:0,max:1,step:.01,value:d.mottle??.1,curve:2,note:'paper formation varying the film',when:{stock:['paper']}}];
const light=(alb,lf,W,H)=>{ const lin=Float32Array.from(alb); if(lf) for(let k=0;k<lin.length;k++) lin[k]*=lf[k]; return lin; };
const baseAlb=(st,x,W,H)=>x&&x.alb?Float32Array.from(x.alb):st?Float32Array.from(st.alb):FX.ground(W,H,FX.WHITE);
const applyClip=(M,x)=>{ if(x&&x.clip) for(let i=0;i<M.length;i++) M[i]*=x.clip[i]; const um=x&&x.clips&&x.clips.umask; if(um) for(let i=0;i<M.length;i++) M[i]*=um[i]; return M; };

/* proof strip · a stock is only legible through ink: print the source marks (FX-02 roller, FX-01 stipple, at their defaults)
   across the right half of a stock plate, into this exact stock, under the same light. Seamless: same albedo × same light. */
const defaultsOf=e=>Object.fromEntries(e.params.map(p=>[p.key,JSON.parse(JSON.stringify(p.value))]));
function proofStrip(lin,o,stockId,W,H,dpr,x,cover,stockLit){ const S2=Object.assign({},x.S||{},{[stockId]:Object.assign({},o,{mShape:'none'})}), stock=stockId===TOOTH?'paper':'cloth';
  const band=(y0,y1)=>{ const c=new Float32Array(W*H), a=Math.round(W*.5), b0=Math.round(H*y0), b1=Math.round(H*y1); for(let y=b0;y<b1;y++) for(let X=a;X<W;X++) c[y*W+X]=cover?cover[y*W+X]:1; return c; };
  const white=stock==='cloth'?{mix:'oklab',iL:.96,iC:.012,ih:85,aL:.96,aC:.012,ah:85,density:1}:{}; // on dark cloth: opaque white plastisol, as a screenprinter would proof it
  const r1=inkEdge.run(Object.assign(defaultsOf(inkEdge),{stock,mShape:'none',edge:.8,width:Math.max(60,W/dpr*.22),angle:0},white),W,H,dpr,{S:S2,stockLit,clip:band(.2,.47)});
  const r2=stipple.run(Object.assign(defaultsOf(stipple),{stock,mShape:'none',angle:0,from:0,to:1,ease:['in',1.4]},white,stock==='cloth'?{dotR:.7,pitch:2}:{}),W,H,dpr,{S:S2,stockLit,clip:band(.53,.8),field:(u,v)=>{ const t=clamp((u-W/dpr*.5)/(W/dpr*.5),0,1); return FX.ease(['in',1.4],1-t); }});
  const out=Float32Array.from(lin); for(let i=0,k=0;i<W*H;i++,k+=3){ if(r1.ink[i]>0){ out[k]=r1.lin[k]; out[k+1]=r1.lin[k+1]; out[k+2]=r1.lin[k+2]; } if(r2.ink[i]>0){ out[k]=r2.lin[k]; out[k+1]=r2.lin[k+1]; out[k+2]=r2.lin[k+2]; } }
  return out; }

/* ══════════ FX-01 · Stipple ramp — pen dots, pressed into the stock ══════════ */
const stipple={ presets:[['fine pen',{}],['technical .1',{pitch:1.2,dotR:.36,jitter:.95,sizeVar:.1,irregular:.08,rag:.03}],['source · coarse',{pitch:2.7,dotR:.95,sizeVar:.35,irregular:.3,rag:.2,ease:['in',1.5]}],['AM screen',{screen:1,order:'ordered',pitch:2.4,dotR:1.1,jitter:0,sizeVar:0,irregular:.05}],['radial burst',{source:'radial',ease:['out',2],from:0,to:.9}]], id:'fx-01-stipple', code:'FX-01', name:'Stipple ramp', role:'mark · pen', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  sub:'Tone made of whole pen dots. Value sets how many sites print (FM) or how big each dot is (AM); a blue-noise rank picks the sites. Each dot is crisp geometry whose edge the stock\'s tooth nudges — never softened.',
  recipe:[
    'Site lattice at the pitch (CSS px), jittered. Value field (linear · radial · noise) eased from → to.',
    'Screen: FM keeps a site when its blue-noise rank < value; AM keeps every site with radius ∝ √value; the dial interpolates. The mask is sampled at the site — dots are whole or absent.',
    'Each dot is geometry: a signed distance to an irregular nib outline (7 vertex radii), so its edge is always 1 device px of anti-aliasing — never a blur.',
    'The stock edits the edge: the distance is displaced by the stock height (edge rag), valleys inside the dot can starve, fibers wick a short way out. Film τ = thickness × pressure.',
    'Color: Beer–Lambert film in linear light (or a coverage mix). Ink B overprints by the same film product.',
    'Light last: × the stock\'s shading under the sheet light.'],
  limits:[['pitch','< 1.2 px','sites merge into flat tone at 1× — the stipple stops reading as marks'],['dot radius','< .3 px','below ~½ device px at 1× a dot is a gray pixel, not a mark'],['dot radius','> ½ pitch','dots fuse into a solid; FM loses its range'],['edge rag','> .9 px','dots read as fuzz, not ink'],['selection','white','clumps and voids at low density']],
  params:[
    {key:'pitch',label:'Pitch',group:'density',type:'range',min:.8,max:16,step:.05,unit:'px',value:1.55,curve:2,note:'distance between dot sites — sets the COUNT of dots, not their size',limits:[[.8,1.2,'sites merge into tone at 1×']]},
    {key:'dotR',label:'Dot radius',group:'density',type:'range',min:.2,max:4,step:.01,unit:'px',value:.48,curve:2,note:'radius of a full-value dot, independent of pitch',limits:[[2.4,4,'past ~½ pitch dots fuse']]},
    {key:'screen',label:'Screen · FM ↔ AM',group:'density',type:'range',min:0,max:1,step:.01,value:0,note:'0 = value changes how many dots print; 1 = how big they are'},
    {key:'sAngle',label:'Screen angle',group:'density',type:'range',min:0,max:90,step:.5,unit:'°',value:0,note:'rotates the dot lattice — 45° is the classic single-ink angle: the eye reads the rows least, and they never beat against the pixel grid'},
    Object.assign({value:'blue'},ORDER),
    {key:'jitter',label:'Jitter',group:'density',type:'range',min:0,max:1,step:.01,value:.85,note:'site offset inside its cell (0 = lattice)',limits:[[0,.2,'lattice shows through as a grid']]},
    {key:'sizeVar',label:'Size variance',group:'density',type:'range',min:0,max:1,step:.01,value:.22,note:'per-dot radius spread'},
    {key:'irregular',label:'Nib irregularity',group:'density',type:'range',min:0,max:1,step:.01,value:.16,note:'vertex wobble of each footprint — nib, not disc'},
    {key:'pressure',label:'Pen pressure',group:'density',type:'range',min:.3,max:1,step:.01,value:1,note:'film per dot and how many valleys it skips (with Starve)',limits:[[.3,.5,'dots print pale and pitted']]},
    {key:'source',label:'Value field',group:'dropoff',type:'select',options:['linear','radial','noise'],value:'linear',note:'what drives value across the plate'},
    {key:'angle',label:'Ramp angle',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:0,note:'direction of the linear ramp',when:{source:['linear']}},
    FX.EASE_PARAM('ease','Dropoff curve',['in',1.25],'how value travels from → to across the field'),
    {key:'from',label:'From',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.02,note:'value at the start of the field'},
    {key:'to',label:'To',group:'dropoff',type:'range',min:0,max:1,step:.01,value:1,note:'value at the end of the field'},
    {key:'fScale',label:'Field scale',group:'dropoff',type:'range',min:20,max:500,step:1,unit:'px',value:140,note:'noise field wavelength',when:{source:['noise']}},
    ...PEN_STOCK({}),
    ...FX.INK_PARAMS('a','Ink A',.22,.004,285),
    {key:'duo',label:'Ink B',group:'color',type:'select',options:['off','on'],value:'off',note:'a second stipple ramp running the opposite way, overprinted'},
    ...FX.INK_PARAMS('b','Ink B',.64,.19,36).map(p=>Object.assign(p,{when:{duo:['on']}})),
    {key:'density',label:'Film thickness',group:'mixing',type:'range',min:.2,max:2,step:.01,value:1.3,note:'ink film at full pressure; with the film rule, thicker = deeper and more saturated (Beer–Lambert)'},
    FX.MIX_PARAM('film'),
    {key:'over',label:'Overprint',group:'mixing',type:'select',options:['multiply','mix','darken'],value:'multiply',when:{duo:['on']},note:'ink B over ink A when the rule is a coverage mix (film always multiplies)'},
    ...FX.MASK_PARAMS({mShape:'rect',mInset:14,mAmp:4,mScale:70,mFeather:10,mBite:.15},{mode:false}),
    FX.SEED_PARAM(5)],
  run(o,W,H,dpr,x={}){ const w=W/dpr,h=H/dpr,s=o.seed|0; const M=applyClip(FX.mask(o,W,H,dpr,s),x); const P=proj(w,h,o.angle); const st=stockFor(o,x,W,H,dpr);
    const field=x.field||((u,v,L)=>{ let t; if(o.source==='radial') t=1-Math.hypot(u-w/2,v-h/2)/(Math.hypot(w,h)*.5); else if(o.source==='noise') t=(FX.fbm(u/o.fScale,v/o.fScale,s+5,3,.5)-.25)/.5; else t=((u-w/2)*P.c+(v-h/2)*P.s)/P.ext+.5; if(L) t=1-t; return lerp(o.from,o.to,FX.ease(o.ease,t)); });
    const layers=o.duo==='on'?2:1, alb=baseAlb(st,x,W,H), A=new Float32Array(W*H); let marks=0; const p=o.pitch, rad=new Array(7);
    const sa_=(o.sAngle||0)*PI/180, sc=Math.cos(sa_), ss=Math.sin(sa_), ext=sa_?Math.hypot(w,h):0, nx=Math.ceil((sa_?ext:w)/p)+1, ny=Math.ceil((sa_?ext:h)/p)+1;
    for(let L=0;L<layers;L++){ const D=FX.DotSD(W,H), sL=s*31+L*977;
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        let sx=(i+.5+(hash(i,j,sL+1)-.5)*o.jitter)*p, sy=(j+.5+(hash(i,j,sL+2)-.5)*o.jitter)*p;
        if(sa_){ const qx=sx-ext/2, qy=sy-ext/2; sx=w/2+qx*sc-qy*ss; sy=h/2+qx*ss+qy*sc; } if(sx<0||sy<0||sx>=w||sy>=h) continue;
        const val=clamp(field(sx,sy,L),0,1); if(val<=0) continue;
        if(rankOf(o.order,i,j,sL+3)>=val*(1-o.screen)+o.screen) continue;
        if(hash(i,j,sL+4)>=M[((sy*dpr)|0)*W+((sx*dpr)|0)]) continue;
        const r=o.dotR*((1-o.screen)+o.screen*Math.sqrt(val))*(1+o.sizeVar*(hash(i,j,sL+5)-.5)*1.6); if(r*dpr<.3) continue;
        for(let k=0;k<7;k++) rad[k]=1+o.irregular*(hash(i*7+k,j,sL+7)-.5);
        D.add(sx*dpr,sy*dpr,r*dpr,rad,o.pressure*(.9+.1*hash(i,j,sL+8)),2+o.rag*dpr*2+o.wick*3*dpr); marks++; }
      const ink=FX.inkOf(o,L?'b':'a'), rule=o.mix==='film'?'film':L&&o.over==='multiply'?'film':L&&o.over==='darken'?'darken':o.mix;
      penChain(D,st,o,ink,alb,A,W,H,dpr,sL,rule); }
    const LF=x.lf||(st?st.lf:null); return {alb,lf:LF,lin:light(alb,LF,W,H),ink:A,stock:st?st.h:null,mask:M,marks,markUnit:'dots'}; } };

/* ══════════ FX-02 · Ink leaving paper — a roller running out of ink across the stock ══════════ */
const inkEdge={ presets:[['roller',{}],['dry brush',{streak:7,width:240,breakup:1,split:2.2,bite:.35,wAmp:6,ease:['out',1.6]}],['letterpress',{width:3,pressure:.86,starve:.05,mottle:.4,wAmp:1,density:1.1}],['riso',{iL:.66,iC:.2,ih:2,density:.85,mottle:.55,width:60,split:.9}],['vertical',{angle:90,edge:.5,width:180}]], id:'fx-02-ink-edge', code:'FX-02', name:'Ink leaving paper', role:'mark · roller', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  sub:'A solid that runs out. Roller pressure eases off across a warped edge; as it falls, only the peaks of the stock still touch the ink, so the run-out speckle is the paper\'s own tooth — with pinholes in its valleys and hairlines wicked along its fibers.',
  recipe:[
    'Pressure = dropoff curve of the signed distance to a warped edge line (stroke direction, transition width), × the mask.',
    'Ink chain: the stock height under the inked area (blended with film-splitting noise, clumped and streaked along the stroke) is ranked to percentiles; pressure P inks exactly the top P of the surface — peaks first.',
    'Starve: valleys below the threshold never take ink. Wick: fibers carry ink past the edge. Mottle: paper formation thins the film.',
    'Film thickness thins with pressure unless the film breaks up; color = Beer–Lambert film in linear light.',
    'Light last: × the stock\'s shading — the ink sits in the tooth, not on top of it.'],
  limits:[['transition','< 4 px','reads as a hard vector edge — no run-out to see'],['break-up','< .3','the edge becomes a gradient — the "AI gradient" failure'],['stock bite','< .3','speckle stops following the paper — reads as digital dither'],['streak','> 6','marks read as scanlines unless the angle is off-axis']],
  params:[
    {key:'streak',label:'Streak',group:'density',type:'range',min:1,max:10,step:.1,value:1.25,note:'film-split clumps stretched along the stroke — dry roller, dragged brush',limits:[[6,10,'scanlines on-axis']]},
    {key:'pressure',label:'Roller pressure',group:'density',type:'range',min:.4,max:1,step:.01,value:1,note:'pressure in the solid; below 1 the body starts to open up'},
    {key:'angle',label:'Stroke angle',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:0,note:'direction the roller travels (it runs out along this vector)'},
    {key:'edge',label:'Edge position',group:'dropoff',type:'range',min:0,max:1,step:.005,value:.58,note:'where the run-out is centered across the plate'},
    {key:'width',label:'Transition',group:'dropoff',type:'range',min:1,max:420,step:1,unit:'px',value:130,note:'width of the run-out band',limits:[[1,4,'hard vector edge']]},
    FX.EASE_PARAM('ease','Dropoff curve',['smooth',2],'pressure across the band — how fast the ink gives out'),
    {key:'wAmp',label:'Edge warp',group:'dropoff',type:'range',min:0,max:90,step:.5,unit:'px',value:18,note:'how far the edge line wanders'},
    {key:'wScale',label:'Warp scale',group:'dropoff',type:'range',min:8,max:400,step:1,unit:'px',value:90,note:'wavelength of the wander'},
    {key:'wOct',label:'Warp octaves',group:'dropoff',type:'range',min:1,max:5,step:1,unit:'oct',value:3,note:'detail in the wander'},
    ...STOCK_PARAMS({bite:.5,breakup:.94,starve:.018,wick:.35,mottle:.15,split:1.1}),
    ...FX.INK_PARAMS('i','Ink',.4,.155,300),
    {key:'density',label:'Film thickness',group:'mixing',type:'range',min:.2,max:2,step:.01,value:1.2,note:'ink film at full pressure (Beer–Lambert: thicker = deeper, more saturated)'},
    FX.MIX_PARAM('film'),
    ...FX.MASK_PARAMS({mShape:'rect',mInset:14,mAmp:5,mScale:60,mFeather:14,mBite:.2},{mode:false}),
    FX.SEED_PARAM(9)],
  run(o,W,H,dpr,x={}){ const w=W/dpr,h=H/dpr,s=o.seed|0; const M=applyClip(FX.mask(o,W,H,dpr,s),x); const P=proj(w,h,o.angle); const st=stockFor(o,x,W,H,dpr), ink=FX.inkOf(o,'i');
    const Pb=new Float32Array(W*H), edgePx=(o.edge-.5)*P.ext;
    for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const i=y*W+X; if(M[i]<=0) continue; const u=X/dpr;
      const d=edgePx-((u-w/2)*P.c+(v-h/2)*P.s)+o.wAmp*(FX.fbm(u/o.wScale,v/o.wScale,s,o.wOct,.5)*2-1)*1.5;
      Pb[i]=FX.ease(o.ease,clamp(d/o.width+.5,0,1))*o.pressure*M[i]; } }
    const alb=baseAlb(st,x,W,H), A=new Float32Array(W*H); const marks=inkChain(Pb,st,o,ink,alb,A,W,H,dpr,s,o.mix,o.angle,o.streak);
    const LF=x.lf||(st?st.lf:null); return {alb,lf:LF,lin:light(alb,LF,W,H),ink:A,stock:st?st.h:null,mask:M,marks,markUnit:'inked px'}; } };

/* ══════════ FX-03 · Paper tooth — the paper stock, bare, under the sheet light ══════════ */
const tooth={ presets:[['bond',{}],['vellum',{depth:.05,fibers:.75,pits:.25,form:.15,aniso:3}],['cold press',{scale:4,oct:4,depth:.38,ease:['out',1.4],aniso:1.4,fibers:2,diffuse:.55}],['newsprint',{paperL:.955,tL:.72,tC:.03,th:85,tAmt:.8,fibers:16,fDark:.05,fWidth:.5,pits:6,pDark:.06,depth:.1}],['deckle sheet',{mShape:'rect',mInset:20,mAmp:4,mScale:18,mRough:6,lift:1.4}]], id:TOOTH, code:'FX-03', name:'Paper tooth', role:'stock · paper',
  sub:'White stock that is not a screen. A height field — tooth, formation, laid fibers, pits — lit by the one sheet light. On white the relief can only take light away, so the paper reads through its shadows. FX-01 and FX-02 print into this exact field.',
  recipe:[
    'Height = fbm at the tooth scale (octaves, persistence = how fast detail drops off), reshaped by the distribution curve; blended with low-frequency formation.',
    'Fibers: curved capsules at a count per 100 × 100 px near the grain angle, raised into the height; pits: small depressions. Both also darken the albedo slightly.',
    'Normal from the height gradient → Lambert under the sheet light (azimuth + elevation from the light puck). Diffuse share vs ambient fill; the fill can be tinted.',
    'The same field is the stock for FX-01 and FX-02: its peaks take ink first, its valleys starve, its fibers wick.',
    'Mask = the sheet\'s cut or deckle edge; the sheet casts a contact + ambient shadow onto the page by the same light.'],
  limits:[['relief','> .6 px','reads as stucco — the stock-filter emboss look'],['anisotropy','< 1.3','isotropic tooth reads as a 1999 paper filter'],['tooth scale','< .8 px','collapses into per-pixel noise — digital grain'],['fibers','> 30 / 100 px²','felt, not paper'],['light elevation','< 15°','every fiber becomes a hard ridge; ok for a raking-light study, not for a page']],
  params:[
    {key:'scale',label:'Tooth scale',group:'density',type:'range',min:.5,max:24,step:.05,unit:'px',value:1.1,curve:2,note:'feature size of the tooth (noise wavelength), not a tile zoom',limits:[[.5,.8,'per-pixel noise']]},
    {key:'oct',label:'Octaves',group:'density',type:'range',min:1,max:6,step:1,unit:'oct',value:3,note:'layers of finer detail'},
    {key:'fibers',label:'Fibers',group:'density',type:'range',min:0,max:40,step:.25,unit:'/100px²',value:3,curve:2,note:'laid fibers per 100 × 100 CSS px',limits:[[30,40,'felt']]},
    {key:'fLen',label:'Fiber length',group:'density',type:'range',min:2,max:80,step:.5,unit:'px',value:14,note:'mean fiber length'},
    {key:'fWidth',label:'Fiber width',group:'density',type:'range',min:.2,max:3,step:.02,unit:'px',value:.4,curve:2,note:'mean fiber width'},
    {key:'pits',label:'Pits',group:'density',type:'range',min:0,max:40,step:.25,unit:'/100px²',value:1,curve:2,note:'depressions per 100 × 100 CSS px'},
    {key:'pers',label:'Persistence',group:'dropoff',type:'range',min:.15,max:.85,step:.01,value:.42,note:'amplitude kept per octave — the spectral dropoff of the tooth'},
    FX.EASE_PARAM('ease','Distribution',['in',2.4],'reshapes height: power in = mostly flat with sparse valleys (smooth stock); out = broad tooth (cold press)'),
    {key:'aniso',label:'Anisotropy',group:'dropoff',type:'range',min:1,max:6,step:.05,value:1.6,note:'tooth stretched along the grain angle — machine-made paper is never isotropic; 1 = the 1999 "paper" filter look',limits:[[1,1.3,'reads as a stock emboss filter']]},
    {key:'form',label:'Formation',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.3,note:'low-frequency cloudiness of the sheet (fiber flocs); also mottles any ink printed on it'},
    {key:'formScale',label:'Formation scale',group:'dropoff',type:'range',min:10,max:200,step:1,unit:'px',value:60,note:'size of the flocs'},
    {key:'fAngle',label:'Grain angle',group:'dropoff',type:'range',min:0,max:180,step:1,unit:'°',value:6,note:'machine direction of the fibers and the tooth'},
    {key:'fSpread',label:'Grain spread',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.4,note:'0 = all fibers on the grain; 1 = any direction'},
    {key:'depth',label:'Relief',group:'relief',type:'range',min:0,max:1.6,step:.005,unit:'px',value:.12,curve:2.5,note:'height of the tooth in CSS px — how hard the light can rake it. The slider is weighted to the subtle end.',limits:[[.6,1.6,'stucco — the 1999 emboss look']]},
    {key:'diffuse',label:'Diffuse share',group:'relief',type:'range',min:0,max:1,step:.01,value:.45,note:'share of light from the sheet light vs flat ambient fill'},
    {key:'fRaise',label:'Fiber raise',group:'relief',type:'range',min:0,max:1,step:.01,value:.45,note:'how far fibers stand proud of the sheet'},
    {key:'pDepth',label:'Pit depth',group:'relief',type:'range',min:0,max:1,step:.01,value:.35,note:'how deep pits go'},
    {key:'paperL',label:'Paper L',group:'color',type:'range',min:.85,max:1,step:.001,value:.968,note:'OKLab lightness of the stock under the sheet light. Below 1 so lit walls, foil and sheen have headroom to brighten; 1 = the white of the page (highlights clip)'},
    {key:'fDark',label:'Fiber tone',group:'color',type:'range',min:0,max:.15,step:.001,unit:'ΔL',value:.014,curve:2,note:'albedo darkening of fibers'},
    {key:'pDark',label:'Pit tone',group:'color',type:'range',min:0,max:.3,step:.001,unit:'ΔL',value:.02,curve:2,note:'albedo darkening in pits'},
    ...FX.INK_PARAMS('t','Fill tint',.7,0,250),
    {key:'tAmt',label:'Fill tint amount',group:'color',type:'range',min:0,max:1,step:.01,value:.5,note:'how much the ambient fill takes the tint (shadows go cool / warm)'},
    ...FX.MASK_PARAMS({mShape:'rect',mInset:22,mAmp:2.5,mScale:28,mRough:5,mFeather:1.2,mMode:'speckle',mBite:0},{extra:[{key:'lift',label:'Sheet lift',group:'mask',type:'range',min:0,max:4,step:.05,unit:'px',value:1,note:'thickness / curl of the sheet — sizes its shadow on the page',when:{mShape:['rect','ellipse','band','blob']}}]}),
    FX.SEED_PARAM(21)],
  run(o,W,H,dpr,x={}){ const s=o.seed|0, st=paperLit(o,W,H,dpr,FX.LIGHT), MF=FX.maskField(o,W,H,dpr,s), M=applyClip(Float32Array.from(MF.m),x);
    let lin=light(st.alb,st.lf,W,H);
    if(o.mShape!=='none'){ const cs=FX.castShadow(M,W,H,dpr,FX.LIGHT,o.lift); for(let i=0,k=0;i<W*H;i++,k+=3){ const a=M[i], pg=1-cs[i]; lin[k]=lin[k]*a+pg*(1-a); lin[k+1]=lin[k+1]*a+pg*(1-a); lin[k+2]=lin[k+2]*a+pg*(1-a); } }
    const ink=new Float32Array(W*H); for(let i=0;i<W*H;i++) ink[i]=1-st.lf[i*3];
    if(x.proof) lin=proofStrip(lin,o,TOOTH,W,H,dpr,x,M,st);
    return {alb:st.alb,lf:st.lf,lin,ink,stock:st.h,mask:M,marks:st.marks,markUnit:'fibers + pits'}; } };

/* ══════════ FX-04 · Weave — the cloth stock: threads as relief, cast shadows, frayed cut ══════════ */
const weave={ presets:[['source · linen',{}],['gray linen',{wL:.7,wC:.006,wh:250,fL:.77,fC:.005,fh:250,accent:.006,warp:34,weft:32}],['fine shirting',{warp:60,weft:56,fill:.94,slub:.12,hair:.12,depth:.9,wL:.9,wC:.01,wh:250,fL:.95,fC:.004,fh:250,accent:0}],['denim 2/1',{pattern:'twill 2/1',warp:48,weft:40,fill:.97,wL:.36,wC:.075,wh:262,fL:.8,fC:.015,fh:85,accent:0,dye:.04,slub:.55,hair:.4,depth:1}],['canvas duck',{pattern:'basket',warp:14,weft:14,fill:.95,wL:.85,wC:.03,wh:85,fL:.82,fC:.03,fh:82,accent:0,hair:.5,depth:1.6}]], id:WEAVE, code:'FX-04', name:'Weave', role:'stock · cloth',
  sub:'Cloth built as cloth: warp and weft at their own counts, a real interlacing, slubbed and hairy threads, every float a raised body lit by the sheet light and casting into the gaps. A cut edge frays thread by thread. FX-01 and FX-02 can print onto it.',
  recipe:[
    'Warp columns and weft rows at their own counts (threads / 100 CSS px); each thread: jittered center, thickness, dye-lot L, fray length, accent.',
    'Interlacing decides the top thread per crossing; a float is the run where it stays on top. Height = cylinder across the thread × arch along the float; under-threads sit low; hair = fine noise along the thread.',
    'Albedo in OKLab: under-thread, then top thread by AA coverage; accent as flecks (single floats, as in the source) or whole threads.',
    'Light: Lambert from the height gradient + a height-field shadow march toward the sheet light, so floats shade into the gaps; ambient occlusion darkens the gaps.',
    'Cut: the mask\'s signed distance plus each thread\'s own fray length — threads end raggedly, not on a line. The swatch casts onto the page.'],
  limits:[['count','> 50 /100 px at 1×','threads under 2 CSS px alias against a 1× display — moiré (fine on 2×/3×)'],['count','< 18 /100 px','threads over ~5 px read as a woven-texture graphic, not cloth'],['fill','< .5','reads as a grid of strokes, not cloth'],['fill','> .97','gutters close; the weave flattens to a check'],['accent rate','> .15','accents stop being accents']],
  params:[
    {key:'warp',label:'Warp count',group:'density',type:'range',min:3,max:80,step:.5,unit:'/100px',value:32,note:'vertical threads per 100 CSS px',limits:[[50,80,'threads under 2 px alias at 1× (fine at 2×+)']]},
    {key:'weft',label:'Weft count',group:'density',type:'range',min:3,max:80,step:.5,unit:'/100px',value:30,note:'horizontal threads per 100 CSS px — set apart from warp for an unbalanced cloth'},
    {key:'fill',label:'Fill',group:'density',type:'range',min:.35,max:1,step:.01,value:.92,note:'thread width ÷ pitch — the gutters',limits:[[.35,.5,'a grid of strokes'],[.97,1,'gutters close']]},
    {key:'pattern',label:'Interlacing',group:'density',type:'select',options:Object.keys(PATTERNS),value:'plain',note:'over/under rule; twills and satin make floats longer than one crossing'},
    {key:'slub',label:'Slub',group:'density',type:'range',min:0,max:1,step:.01,value:.35,note:'thread width variation along its length'},
    {key:'slubScale',label:'Slub length',group:'density',type:'range',min:3,max:90,step:.5,unit:'px',value:11,note:'distance between thick and thin'},
    {key:'hair',label:'Hair',group:'density',type:'range',min:0,max:1,step:.01,value:.3,note:'fine fiber texture along each thread (linen is hairy)'},
    {key:'irregular',label:'Irregularity',group:'density',type:'range',min:0,max:1,step:.01,value:.3,note:'thread spacing and thickness jitter'},
    {key:'wear',label:'Wear',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.15,note:'probability a float is worn (thinned, flattened, faded) at the worn end'},
    FX.EASE_PARAM('wEase','Wear curve',['in',2.2],'how wear grows along its direction'),
    {key:'wAngle',label:'Wear direction',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:90,note:'wear increases toward this direction'},
    {key:'depth',label:'Relief',group:'relief',type:'range',min:0,max:3,step:.01,value:1.2,note:'thread relief relative to pitch — how much the light models each float'},
    {key:'diffuse',label:'Diffuse share',group:'relief',type:'range',min:0,max:1,step:.01,value:.85,note:'share of light from the sheet light vs flat ambient fill'},
    {key:'shadow',label:'Cast shadow',group:'relief',type:'range',min:0,max:1,step:.01,value:.6,note:'floats shading into gaps and onto under-threads, plus occlusion in the gaps'},
    ...FX.INK_PARAMS('w','Warp',.3,.004,265),
    ...FX.INK_PARAMS('f','Weft',.53,.016,84),
    ...FX.INK_PARAMS('c','Accent',.5,.075,186),
    {key:'aMode',label:'Accent as',group:'color',type:'select',options:['flecks','threads'],value:'flecks',note:'flecks = single floats dyed (the source plate); threads = whole warp and weft threads'},
    {key:'accent',label:'Accent rate',group:'color',type:'range',min:0,max:.3,step:.005,value:.014,note:'share of floats (flecks) or threads dyed the accent',limits:[[.15,.3,'stops being an accent']]},
    {key:'dye',label:'Dye lot',group:'color',type:'range',min:0,max:.12,step:.002,unit:'ΔL',value:.035,note:'per-thread lightness spread'},
    ...FX.MASK_PARAMS({mShape:'rect',mInset:22,mAmp:3,mScale:40,mFeather:1,mBite:0},{mode:false,extra:[
      {key:'fray',label:'Fray',group:'mask',type:'range',min:0,max:40,step:.5,unit:'px',value:6,note:'how far individual threads run past the cut',when:{mShape:['rect','ellipse','band','blob']}},
      {key:'lift',label:'Swatch lift',group:'mask',type:'range',min:0,max:4,step:.05,unit:'px',value:.8,note:'cloth thickness — sizes its shadow on the page',when:{mShape:['rect','ellipse','band','blob']}}]}),
    FX.SEED_PARAM(33)],
  run(o,W,H,dpr,x={}){ const um=x.clips&&x.clips.umask, jq=x.clips&&x.clips.jq; let st=clothLit(um?Object.assign({},o,{lift:0}):o,W,H,dpr,FX.LIGHT,jq); let lin=light(st.alb,st.lf,W,H), a=st.a;
    if(um){ a=new Float32Array(W*H); for(let i=0;i<W*H;i++) a[i]=st.a[i]*um[i]; const cs=FX.castShadow(a,W,H,dpr,FX.LIGHT,o.lift); for(let i=0,k=0;i<W*H;i++,k+=3){ const m=um[i], pg=1-cs[i]; lin[k]=lin[k]*m+pg*(1-m); lin[k+1]=lin[k+1]*m+pg*(1-m); lin[k+2]=lin[k+2]*m+pg*(1-m); } }
    if(x.proof) lin=proofStrip(lin,o,WEAVE,W,H,dpr,x,a,st);
    return {alb:st.alb,lf:st.lf,lin,ink:a,stock:st.h,mask:a,marks:st.marks,markUnit:'floats'}; } };


/* ══════════ SURPRISE MARKS · four marks that only make sense on a material system ══════════ */
const SHAPE_PARAMS=(d={})=>[
  {key:'shape',label:'Die',group:'density',type:'select',options:['compass','sun','crescent','knot','monogram','word','seal'],value:d.shape||'compass',note:'what the die (or type) is: an invented mark (compass, sun, crescent, knot, a monogram from the text), a word, or a ring seal'},
  {key:'text',label:'Text',group:'density',type:'text',value:d.text||'Four surfaces',maxlength:40,note:'set in Archivo 800 for word, seal and monogram (its first letter)',when:{shape:['word','seal','monogram']}},
  {key:'size',label:'Size',group:'density',type:'range',min:.15,max:1,step:.01,value:d.size??.62,note:'die height as a share of the plate'}];
const drawShape=(g,w,h,o)=>{ const S_=Math.min(w,h)*o.size, cx=w/2, cy=h/2; g.save();
  if(o.shape==='word'){ let fs=S_*.42; const f=x=>`800 ${x}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.font=f(fs); const tw=g.measureText(o.text||' ').width; fs*=Math.min(1,(w*.84)/Math.max(1,tw)); g.font=f(fs); const t2=g.measureText(o.text||' ').width; g.textBaseline='alphabetic'; g.fillText(o.text||'',cx-t2/2,cy+fs*.36); }
  else if(o.shape==='seal'){ const R0=S_*.5; g.beginPath(); g.arc(cx,cy,R0,0,TAU); g.arc(cx,cy,R0*.93,0,TAU,true); g.fill('evenodd'); g.beginPath(); g.arc(cx,cy,R0*.66,0,TAU); g.arc(cx,cy,R0*.62,0,TAU,true); g.fill('evenodd');
    // ring text set as two arcs, both upright: the first phrase over the top (clockwise), the rest under the bottom (counter-clockwise)
    const parts=String(o.text||'').toUpperCase().split('·').map(x=>x.trim()).filter(Boolean), fs=R0*.13, rr=R0*.79, trk=fs*.12; g.font=`800 ${fs}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.textBaseline='middle';
    const arc=(str,mid,dir)=>{ const ws=[...str].map(ch=>g.measureText(ch).width+trk), tot=ws.reduce((a,b)=>a+b,0)-trk; let a=mid-dir*tot/2/rr;
      [...str].forEach((ch,k)=>{ const da=ws[k]/rr, ac=a+dir*(ws[k]-trk)/2/rr; g.save(); g.translate(cx+Math.cos(ac)*rr,cy+Math.sin(ac)*rr); g.rotate(ac+dir*PI/2); g.fillText(ch,-(ws[k]-trk)/2,0); g.restore(); a+=dir*da; }); };
    if(parts[0]) arc(parts[0],-PI/2,1); if(parts.length>1) arc(parts.slice(1).join(' · '),PI/2,-1);
    [-1,1].forEach(sd=>{ g.beginPath(); g.arc(cx+sd*rr,cy,fs*.11,0,TAU); g.fill(); }); // two dots part the phrases
    g.translate(cx,cy); g.scale(R0*.5,R0*.5); MARKS.compass(g); } // the inner mark sits well inside the ring, never into the text
  else { g.translate(cx,cy); g.scale(S_*.5,S_*.5); (MARKS[o.shape]||MARKS.compass)(g,o); }
  g.restore(); };
/* invented marks for dies and usages (no real brand): each fills the unit circle around (0,0) */
const MARKS={
  compass:(g)=>{ g.beginPath(); for(let k=0;k<16;k++){ const a=-PI/2+k*PI/8, r=k%2?.34:(k%4?.74:1); k?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r); } g.closePath(); g.moveTo(.13,0); g.arc(0,0,.13,0,TAU,true); g.fill('evenodd'); },
  sun:(g)=>{ g.beginPath(); g.arc(0,0,.44,0,TAU); g.fill(); for(let k=0;k<18;k++){ const a=k*TAU/18, w=.07; g.beginPath(); g.moveTo(Math.cos(a-w)*.55,Math.sin(a-w)*.55); g.lineTo(Math.cos(a)*1,Math.sin(a)*1); g.lineTo(Math.cos(a+w)*.55,Math.sin(a+w)*.55); g.closePath(); g.fill(); } },
  crescent:(g)=>{ g.beginPath(); g.arc(0,0,1,0,TAU); g.arc(.36,-.18,.8,0,TAU,true); g.fill('evenodd'); },
  knot:(g)=>{ for(const x of [-.36,.36]){ g.beginPath(); g.arc(x,0,.62,0,TAU); g.arc(x,0,.42,0,TAU,true); g.fill('evenodd'); } },
  monogram:(g,o={})=>{ g.beginPath(); g.arc(0,0,1,0,TAU); g.arc(0,0,.9,0,TAU,true); g.fill('evenodd'); const ch=String(o.text||'A').trim().charAt(0).toUpperCase()||'A', k=Math.hypot(g.getTransform().a,g.getTransform().b)||1; g.save(); g.scale(1/k,1/k); g.font=`800 ${1.2*k}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.textBaseline='alphabetic'; const tw=g.measureText(ch).width; g.fillText(ch,-tw/2,.43*k); g.restore(); } };
const stockH=(st,S)=>st&&st.kind==='paper'?(S&&S[TOOTH]?S[TOOTH].depth:.12):st&&st.kind==='cloth'?(S&&S[WEAVE]?S[WEAVE].depth*100/Math.max(S[WEAVE].warp,S[WEAVE].weft)*.3:.5):0;
/* an earlier layer's light (x.lf) carries its own relief: keep it, relative to the bare stock, under this layer's relief */
const carryLF=(lf,prev,st)=>{ if(!lf||!prev) return lf; const base=st&&st.lf; for(let k=0;k<lf.length;k++) lf[k]*=base?prev[k]/Math.max(.05,base[k]):prev[k]; return lf; };
const litFrom=(hpx,W,H,dpr,diffuse,shadow)=>{ let mx=1e-4,mn=1e9; for(let i=0;i<hpx.length;i++){ if(hpx[i]>mx) mx=hpx[i]; if(hpx[i]<mn) mn=hpx[i]; } const span=Math.max(1e-4,mx-mn), hn=new Float32Array(hpx.length); for(let i=0;i<hn.length;i++) hn[i]=(hpx[i]-mn)/span;
  const sh=FX.shade(hn,W,H,dpr,span,FX.LIGHT), hs=shadow>0?FX.hshadow(hn,W,H,dpr,span,FX.LIGHT,Math.max(1,span*4),.25):null, lf=new Float32Array(W*H*3);
  for(let i=0,k=0;i<W*H;i++,k+=3){ const f=((1-diffuse)+diffuse*sh[i])*(hs?lerp(1,hs[i],shadow):1); lf[k]=lf[k+1]=lf[k+2]=f; } return lf; };

/* FX-05 · Graphite — pencil hatching that only catches the peaks of the tooth, and gleams under the light */
const graphite={ id:'fx-05-graphite', code:'FX-05', name:'Graphite', role:'mark · pencil', section:'surprise', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  presets:[['HB hatch',{}],['6B cross',{layers:3,lead:1.1,pressure:1,gL:.3,sheen:.85,spacing:2.2}],['2H technical',{lead:.45,spacing:1.4,wobble:.05,gL:.5,sheen:.35,layers:1,jit:.05}],['scribble',{layers:2,cross:63,len:26,wobble:.8,spacing:2.6,angle:-20}]],
  sub:'Pencil hatching laid in strokes with tapered pressure. Graphite only lands on the tooth peaks the lead touches — and graphite is a metal: burnished, it gleams. Drag the light and the dark strokes turn silver.',
  recipe:['Hatch strokes along an angle at a spacing; extra layers cross at an offset angle and only print where the value field asks for more tone.','Each stroke is a wobbling polyline with pressure tapering at both ends, rasterized as AA capsules (lead width).','Ink chain: pressure vs stock-height percentile — the lead touches peaks first; valleys stay white. Graphite is an opaque OKLab mix, not a film.','Sheen: normals from the stock relief plus the graphite deposit\'s own burnish texture; Blinn specular toward the sheet light, gated by how much graphite is there.','Light last: diffuse × stock shading, + specular.'],
  limits:[['spacing','< 1.2 px','strokes merge into flat gray'],['sheen','> .8 at low light','strokes read as wet ink, not graphite'],['lead','> 1.6 px','reads as charcoal / marker']],
  params:[
    {key:'angle',label:'Hatch angle',group:'density',type:'range',min:-90,max:90,step:1,unit:'°',value:38,note:'direction of the first layer'},
    {key:'spacing',label:'Spacing',group:'density',type:'range',min:.8,max:10,step:.05,unit:'px',value:1.9,curve:2,note:'distance between strokes',limits:[[.8,1.2,'merges to gray']]},
    {key:'layers',label:'Layers',group:'density',type:'range',min:1,max:4,step:1,value:2,note:'cross-hatch layers; layer k prints only where value > k / layers'},
    {key:'cross',label:'Cross angle',group:'density',type:'range',min:10,max:90,step:1,unit:'°',value:78,note:'offset between layers'},
    {key:'len',label:'Stroke length',group:'density',type:'range',min:6,max:300,step:1,unit:'px',value:70,curve:2,note:'mean stroke length'},
    {key:'jit',label:'Jitter',group:'density',type:'range',min:0,max:1,step:.01,value:.35,note:'spacing and length irregularity'},
    {key:'wobble',label:'Wobble',group:'density',type:'range',min:0,max:1.5,step:.01,unit:'px',value:.25,curve:2,note:'hand tremor across the stroke'},
    {key:'lead',label:'Lead width',group:'density',type:'range',min:.3,max:2.5,step:.01,unit:'px',value:.75,curve:2,limits:[[1.6,2.5,'charcoal']]},
    {key:'pressure',label:'Pressure',group:'density',type:'range',min:.3,max:1,step:.01,value:.95,note:'peak pressure in a stroke'},
    {key:'taper',label:'Taper',group:'density',type:'range',min:0,max:1,step:.01,value:.6,note:'pressure lift at both ends'},
    {key:'source',label:'Value field',group:'dropoff',type:'select',options:['linear','radial','noise'],value:'linear'},
    {key:'vAngle',label:'Ramp angle',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:0,when:{source:['linear']}},
    FX.EASE_PARAM('ease','Dropoff curve',['smooth',2],'value from → to across the field'),
    {key:'from',label:'From',group:'dropoff',type:'range',min:0,max:1,step:.01,value:0},
    {key:'to',label:'To',group:'dropoff',type:'range',min:0,max:1,step:.01,value:1},
    {key:'fScale',label:'Field scale',group:'dropoff',type:'range',min:20,max:500,step:1,unit:'px',value:160,when:{source:['noise']}},
    ...STOCK_PARAMS({bite:.5,breakup:.55,starve:.01,wick:0,mottle:.1,split:.9}).filter(p=>p.key!=='wick'),
    ...FX.INK_PARAMS('g','Graphite',.3,.004,260),
    {key:'density',label:'Deposit',group:'mixing',type:'range',min:.2,max:1,step:.01,value:1,note:'how opaque a full-pressure pass is'},
    {key:'sheen',label:'Sheen',group:'relief',type:'range',min:0,max:1,step:.01,value:.55,note:'specular strength of burnished graphite',limits:[[.8,1,'wet ink']]},
    {key:'shin',label:'Gloss',group:'relief',type:'range',min:2,max:120,step:1,value:22,curve:2,note:'specular exponent — tight = burnished, broad = matte'},
    {key:'burnish',label:'Burnish texture',group:'relief',type:'range',min:0,max:1.5,step:.01,unit:'px',value:.35,curve:2,note:'micro-relief of the graphite deposit along the stroke (what catches the glints)'},
    ...FX.MASK_PARAMS({mShape:'rect',mInset:26,mAmp:8,mScale:60,mFeather:14,mBite:0},{mode:false}),
    FX.SEED_PARAM(41)],
  run(o,W,H,dpr,x={}){ const w=W/dpr,h=H/dpr,s=o.seed|0, R_=FX.rng(s), M=applyClip(FX.mask(o,W,H,dpr,s),x), st=stockFor(o,x,W,H,dpr), P_=proj(w,h,o.vAngle);
    const field=x.field||((u,v)=>{ let t; if(o.source==='radial') t=1-Math.hypot(u-w/2,v-h/2)/(Math.min(w,h)*.62); else if(o.source==='noise') t=(FX.fbm(u/o.fScale,v/o.fScale,s+5,3,.5)-.25)/.5; else t=((u-w/2)*P_.c+(v-h/2)*P_.s)/P_.ext+.5; return lerp(o.from,o.to,FX.ease(o.ease,clamp(t,0,1))); });
    const Pb=new Float32Array(W*H), dir=new Float32Array(W*H); let strokes=0; const L=Math.hypot(w,h);
    for(let k=0;k<(o.layers|0);k++){ const LR=FX.LineRaster(W,H), a=(o.angle+k*o.cross)*PI/180, ca=Math.cos(a), sa=Math.sin(a), thr=k/(o.layers|0);
      for(let off=-L/2;off<L/2;off+=o.spacing*(1+(R_()-.5)*o.jit)){ let t0=-L/2+R_()*o.len;
        while(t0<L/2){ const len=o.len*(1+(R_()-.5)*o.jit*1.4), gap=o.len*.08*(.5+R_()); const mx=w/2+ca*(t0+len/2)-sa*off, my=h/2+sa*(t0+len/2)+ca*off;
          if(mx>-len&&my>-len&&mx<w+len&&my<h+len){ const n=Math.max(2,Math.ceil(len/2.5)); let px_=null,py_=null; const ph=R_()*100;
            for(let q=0;q<=n;q++){ const tt=q/n, along=t0+len*tt, wob=o.wobble*(FX.vnoise(ph+along*.08,k*7.3,s+3)*2-1), X=w/2+ca*along-sa*(off+wob), Y=h/2+sa*along+ca*(off+wob);
              const val=field(X,Y), need=val-thr; if(px_!==null&&need>0){ const pk=o.pressure*sstep(0,.5/(o.layers|0),need)*(1-o.taper*Math.pow(Math.abs(tt*2-1),3)); LR.add(px_*dpr,py_*dpr,X*dpr,Y*dpr,Math.max(.6,o.lead*dpr*(.75+.25*pk)),pk); }
              px_=X; py_=Y; } strokes++; }
          t0+=len+gap; } }
      for(let i=0;i<W*H;i++){ const c=LR.cov[i]; if(c>0){ Pb[i]=1-(1-Pb[i])*(1-c*M[i]); dir[i]=a; } } }
    // graphite is a soft solid rubbed onto the tooth: the line's AA coverage sets the edge, local pressure (the line field
    // spread ~a stroke width) decides how deep into the tooth it reaches, with a wide soft band — tone, not 1-bit pixels
    const Pp=FX.blur(Pb,W,H,Math.max(1,Math.round(o.lead*dpr*.8))); for(let i=0;i<W*H;i++) Pp[i]=Math.min(1,Pp[i]*1.8);
    const g=FX.inkOf(o,'g'), alb=baseAlb(st,x,W,H), A=new Float32Array(W*H); inkChain(Pp,st,o,g,alb,A,W,H,dpr,s,'oklab',0,1,null,{cov:Pb,band:.16});
    const hs=stockH(st,x.S), hpx=new Float32Array(W*H); for(let i=0;i<W*H;i++){ const base=st?st.h[i]*hs:0; hpx[i]=base+(A[i]>0?A[i]*o.burnish*(FX.vnoise(i%W/dpr*.9*Math.cos(dir[i])+((i/W)|0)/dpr*.9*Math.sin(dir[i]),(-(i%W)/dpr*Math.sin(dir[i])+((i/W)|0)/dpr*Math.cos(dir[i]))*.12,s+9)):0); }
    const N=FX.normals(hpx,W,H,dpr), [hx,hy,hz]=FX.halfVec(), lz_=FX.lightVec()[2], lf=x.lf||(st?st.lf:null), lin=light(alb,lf,W,H);
    for(let i=0,k=0;i<W*H;i++,k+=3){ const a=A[i]; if(a<=0) continue; const nh=Math.max(0,N.nx[i]*hx+N.ny[i]*hy+N.nz[i]*hz), sp=o.sheen*Math.min(1,a)*(.16*(1-lz_)+.9*Math.pow(nh,o.shin)); /* broad silvering toward a low light + tight glints off burnished strokes */ lin[k]+=sp; lin[k+1]+=sp; lin[k+2]+=sp*1.02; }
    return {alb,lf,lin,ink:A,stock:hpx.map?hpx:null,mask:M,marks:strokes,markUnit:'strokes'}; } };

/* FX-06 · Blind deboss — no ink at all: a die pressed into the stock; the sheet light draws it */
const deboss={ id:'fx-06-deboss', code:'FX-06', name:'Blind deboss', role:'mark · die', section:'surprise', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  clips:{ die:(g,w,h,o)=>drawShape(g,w,h,o) },
  presets:[['blind compass',{}],['seal',{shape:'seal',text:'Oriel & Vane · Printers',size:.8,depth:.7}],['letterpress word',{shape:'word',text:'Counted',ink:1,depth:.55,size:.5}],['emboss',{depth:-.6,lip:0}]],
  sub:'A mark with no ink. A die presses into the stock: the floor crushes the tooth flat, the walls take the light or the shadow, a lip rises at the edge. Move the light and the mark appears, flips, or disappears. Ink it to get letterpress.',
  recipe:['Die = an invented mark (compass, sun, crescent, knot, monogram), a word, or a ring seal, rasterized as an AA clip on the main thread (fonts).','Plate profile from the signed distance to the die edge (exact distance transform): a crisp shoulder, a straight wall over the die softness, a flat floor; lip = a narrow ridge just outside the edge.','Height (CSS px) = stock height × (1 − crush · plate) − depth · plate + lip — the tooth flattens on the floor.','Light: Lambert from the combined height + a height-field shadow toward the sheet light (the wall on the light side falls in shadow).','Optional ink on the floor (film), so blind → letterpress is one dial.'],
  limits:[['depth','> 2 px','reads as a carved gouge, not a deboss'],['die softness','< .3 px','walls alias; > 3 px the edge goes mushy'],['light elevation','> 70°','a blind deboss vanishes under overhead light — by design']],
  params:[...SHAPE_PARAMS({}),
    {key:'depth',label:'Depth',group:'relief',type:'range',min:-2.5,max:2.5,step:.01,unit:'px',value:1.2,note:'press depth; negative = emboss (raised)',limits:[[2,2.5,'gouge']]},
    {key:'soft',label:'Die softness',group:'relief',type:'range',min:.2,max:8,step:.05,unit:'px',value:3,curve:2,note:'wall width — how sharp the die edge is'},
    {key:'lip',label:'Lip',group:'relief',type:'range',min:0,max:.6,step:.01,unit:'px',value:.15,note:'paper pushed up just outside the edge'},
    {key:'crush',label:'Crush',group:'relief',type:'range',min:0,max:1,step:.01,value:.7,note:'how flat the tooth is pressed on the floor'},
    {key:'diffuse',label:'Diffuse share',group:'relief',type:'range',min:0,max:1,step:.01,value:.95},
    {key:'shadow',label:'Wall shadow',group:'relief',type:'range',min:0,max:1,step:.01,value:.7},
    {key:'burnish',label:'Floor burnish',group:'relief',type:'range',min:0,max:.08,step:.001,unit:'ΔL',value:.012,curve:2,note:'pressed fibers read a touch darker on the floor'},
    {key:'stock',label:'Prints on',group:'stock',type:'select',options:['paper','cloth','smooth'],value:'paper'},
    {key:'ink',label:'Ink on floor',group:'color',type:'range',min:0,max:1,step:.01,value:0,note:'0 = blind; 1 = full letterpress'},
    ...FX.INK_PARAMS('i','Ink',.32,.09,25).map(p=>Object.assign(p,{when:{}})),
    FX.MIX_PARAM('film'),
    FX.SEED_PARAM(3)],
  run(o,W,H,dpr,x={}){ const st=stockFor(o,x,W,H,dpr), clip=(x.clips&&x.clips.die)||new Float32Array(W*H);
    // die profile from the signed distance to the die edge (not a blur): a crisp shoulder where the sheet breaks (~.3 px
    // radius), a straight wall over the die softness, a flat floor; the lip is a narrow ridge just outside the edge
    const SD=FX.sdf(clip,W,H), wW=Math.max(.2,o.soft*.55), r0=Math.max(.5,.3*dpr), lw=wW*1.4+.8, P0=new Float32Array(W*H), L0=new Float32Array(W*H);
    for(let i=0;i<W*H;i++){ const d=SD[i]/dpr; P0[i]=clamp(d/wW,0,1); const xo=-d; L0[i]=xo>0&&xo<lw?Math.sin(PI*xo/lw):0; }
    const P=FX.blur(P0,W,H,Math.round(r0)), LP=FX.blur(L0,W,H,Math.round(r0));
    const hs=stockH(st,x.S), hpx=new Float32Array(W*H); for(let i=0;i<W*H;i++){ const base=st?st.h[i]*hs:0, lip=LP[i]*o.lip; hpx[i]=base*(1-o.crush*P[i])-o.depth*P[i]+lip*(o.depth>=0?1:-1); }
    const lf=litFrom(hpx,W,H,dpr,o.diffuse,o.shadow), alb=baseAlb(st,x,W,H), A=new Float32Array(W*H);
    if(o.burnish>0) for(let i=0,k=0;i<W*H;i++,k+=3){ const f=1-o.burnish*3*P[i]; alb[k]*=f; alb[k+1]*=f; alb[k+2]*=f; }
    if(o.ink>0){ const ink=FX.inkOf(o,'i'), LUT=FX.filmLUT(ink), px=[0,0,0]; for(let i=0,k=0;i<W*H;i++,k+=3){ const a=clip[i]*o.ink*1.2; if(a<=0) continue; A[i]=a; if(o.mix==='film'){ const j=((a>=2?1024:a*512+.5)|0)*3; alb[k]*=LUT[j]; alb[k+1]*=LUT[j+1]; alb[k+2]*=LUT[j+2]; } else { px[0]=alb[k];px[1]=alb[k+1];px[2]=alb[k+2]; FX.mixInto(px,ink,Math.min(1,a),o.mix); alb[k]=px[0];alb[k+1]=px[1];alb[k+2]=px[2]; } } }
    if(st&&st.lf){ for(let k=0;k<lf.length;k++) lf[k]*=lerp(1,st.lf[k],.25); }
    carryLF(lf,x.lf,st);
    const M=new Float32Array(W*H); for(let i=0;i<W*H;i++) M[i]=P[i];
    return {alb,lf,lin:light(alb,lf,W,H),ink:A,stock:hpx,mask:M,marks:0,markUnit:'inks · light only'}; } };

/* FX-07 · Typewriter strike — glyphs struck through a woven ribbon, each with its own pressure, impressed into the stock */
const typewriter={ id:'fx-07-typewriter', code:'FX-07', name:'Typewriter strike', role:'mark · type bar', section:'surprise', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  clips:{ strikes:(g,w,h,o)=>{ const R_=FX.rng((o.seed|0)+5), lines=String(o.text||'').split('/').map(t=>t.trim()); let fs=o.fsize; g.font=`${fs<15?700:400} ${fs}px "Courier Prime", "JetBrains Mono", monospace`; const mw0=Math.max(...lines.map(l=>l.length))*g.measureText('M').width; if(mw0>w*.86) fs*=w*.86/mw0; const lh=fs*o.lead; g.font=`${fs<15?700:400} ${fs}px "Courier Prime", "JetBrains Mono", monospace`; const x0=o.align==='left'?2:Math.max(2,(w-Math.max(...lines.map(l=>l.length))*g.measureText('M').width)/2); let y=h*.5-((lines.length-1)*lh)/2+fs*.32, n=0, tot=lines.join('').length||1;
      g.font=`${fs<15?700:400} ${fs}px "Courier Prime", "JetBrains Mono", monospace`; g.textBaseline='alphabetic'; const cw=g.measureText('M').width;
      for(const ln of lines){ let xx=x0; for(const ch of ln){ n++; if(ch!==' '){ const life=1-o.exhaust*FX.ease(['in',1.6],n/tot), p=clamp(life*(1-o.vari*R_()),.12,1), half=R_()<o.half;
          g.save(); g.translate(xx+(R_()-.5)*o.jx,y+(R_()-.5)*o.jy+(R_()<.08?o.jy*.8:0)); g.rotate((R_()-.5)*o.rot*PI/180);
          if(half){ const gr=g.createLinearGradient(0,-fs*.8,0,fs*.1), top=R_()<.5; gr.addColorStop(0,`rgba(255,255,255,${top?p:p*.25})`); gr.addColorStop(1,`rgba(255,255,255,${top?p*.25:p})`); g.fillStyle=gr; } else g.fillStyle=`rgba(255,255,255,${p})`;
          g.fillText(ch,0,0); g.restore(); } xx+=cw; } y+=lh; } } },
  presets:[['office ribbon',{}],['worn ribbon',{exhaust:.75,vari:.5,half:.12,ribbon:.9}],['carbon copy',{ribbon:.15,iL:.45,iC:.12,ih:265,bite:.4,impress:.2,vari:.35}],['bichrome red',{iL:.5,iC:.19,ih:28}],['on linen',{stock:'cloth',fsize:20,impress:0}]],
  sub:'Each glyph is a separate strike: its own pressure, a slight offset and rotation, sometimes only half the face lands. Ink passes through a woven ribbon, so letters carry the ribbon\'s weave; the type bar also dents the paper — visible under a low light.',
  recipe:['Text in Courier Prime (a typewriter slab; bold below 15 px, as a light strike loses thin strokes), one strike per glyph on the main thread: pressure = ribbon life (exhausting along the page) × key variance; offset, rotation, an occasional dropped baseline; half-strikes fade top or bottom.','Ribbon: a plain weave at the ribbon count — ink transfers through thread crossings, less through the gaps.','Ink chain: pressure × ribbon vs stock-height percentile; ink squash pools film at the glyph edge.','Impression: the strike dents the stock (blurred glyph × pressure); light from the combined height.','Color: Beer–Lambert film.'],
  limits:[['ribbon count','< 30 /100 px','weave reads as a screen pattern on the type'],['jitter','> 1.5 px','reads as broken font rendering'],['size','< 9 px','glyphs fall below the tooth scale and break up']],
  params:[
    {key:'text',label:'Text',group:'density',type:'text',value:'Four surfaces, one light. / Ink on real stock — counted, / never a gradient. Set 01.',maxlength:180,note:'"/" starts a new line'},
    {key:'fsize',label:'Size',group:'density',type:'range',min:8,max:48,step:.5,unit:'px',value:24},
    {key:'lead',label:'Leading',group:'density',type:'range',min:1,max:2.4,step:.01,value:1.5},
    {key:'vari',label:'Key variance',group:'density',type:'range',min:0,max:1,step:.01,value:.3,note:'how unevenly keys strike'},
    {key:'half',label:'Half strikes',group:'density',type:'range',min:0,max:.4,step:.005,value:.05,note:'share of glyphs where only the top or bottom lands'},
    {key:'jx',label:'Jitter x',group:'density',type:'range',min:0,max:2,step:.01,unit:'px',value:.35,curve:2},
    {key:'jy',label:'Jitter y',group:'density',type:'range',min:0,max:2,step:.01,unit:'px',value:.4,curve:2},
    {key:'rot',label:'Rotation',group:'density',type:'range',min:0,max:4,step:.05,unit:'°',value:.7},
    {key:'exhaust',label:'Ribbon wear',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.25,note:'ink fading along the text'},
    {key:'ribbon',label:'Ribbon texture',group:'stock',type:'range',min:0,max:1,step:.01,value:.5,note:'how much the ribbon weave shows in the glyphs'},
    {key:'rcount',label:'Ribbon count',group:'stock',type:'range',min:20,max:200,step:1,unit:'/100px',value:95,note:'ribbon threads per 100 CSS px',limits:[[20,30,'screen pattern']]},
    {key:'squash',label:'Ink squash',group:'stock',type:'range',min:0,max:1,step:.01,value:.35,note:'film pooling at the glyph edge'},
    {key:'impress',label:'Impression',group:'relief',type:'range',min:0,max:1,step:.01,unit:'px',value:.3,note:'how deep each strike dents the stock'},
    {key:'diffuse',label:'Diffuse share',group:'relief',type:'range',min:0,max:1,step:.01,value:.7},
    ...STOCK_PARAMS({bite:.55,breakup:.85,starve:.03,wick:.12,mottle:.2,split:.8}),
    ...FX.INK_PARAMS('i','Ink',.2,.006,280),
    {key:'density',label:'Film thickness',group:'mixing',type:'range',min:.2,max:2,step:.01,value:1.15},
    FX.MIX_PARAM('film'),
    FX.SEED_PARAM(7)],
  run(o,W,H,dpr,x={}){ const st=stockFor(o,x,W,H,dpr), clip=(x.clips&&x.clips.strikes)||new Float32Array(W*H), pr=100/o.rcount, s=o.seed|0, Pb=new Float32Array(W*H);
    // legibility: mean stroke width = 2·area / perimeter (CSS px). Thin strokes (small type) keep their ink — the ribbon,
    // starve and stock bite fade out below ~1.6 px strokes, so 7–10 px type reads instead of breaking into confetti.
    { let Ar=0, Pm=0; for(let y=1;y<H-1;y+=2) for(let X=1;X<W-1;X+=2){ const i=y*W+X, c=clip[i]>.5?1:0; Ar+=c; Pm+=Math.abs((clip[i+1]>.5)-(clip[i-1]>.5))*.5+Math.abs((clip[i+W]>.5)-(clip[i-W]>.5))*.5; } /* on the thresholded glyph shape: clip texture must not inflate the perimeter */
      const sw=Pm>0?2*Ar/Pm/dpr:9, k=clamp((sw-.6)/1.2,0,1); if(k<1) o=Object.assign({},o,{ribbon:o.ribbon*(.3+.7*k),starve:o.starve*k,bite:o.bite*(.35+.65*k),breakup:o.breakup*(.4+.6*k),mottle:o.mottle*k}); }
    const edge=FX.blur(clip,W,H,.8*dpr), tm=new Float32Array(W*H);
    for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const i=y*W+X, c=clip[i]; if(c<=0) continue; const u=X/dpr;
      const fu=u/pr, fv=v/pr, iu=Math.floor(fu), iv=Math.floor(fv), du=Math.abs(fu-iu-.5)*2, dv=Math.abs(fv-iv-.5)*2, top=((iu+iv)&1)?1-dv:1-du, rib=clamp(.25+.85*Math.pow(clamp(top,0,1),.6)+(FX.vnoise(fu*.3,fv*2,s)-.5)*.3,0,1);
      Pb[i]=c*lerp(1,rib,o.ribbon); tm[i]=1+o.squash*clamp((c-edge[i])*3,0,1); } }
    const ink=FX.inkOf(o,'i'), alb=baseAlb(st,x,W,H), A=new Float32Array(W*H); const n=inkChain(Pb,st,o,ink,alb,A,W,H,dpr,s,o.mix,0,1,tm);
    const hs=stockH(st,x.S), dent=FX.blur(clip,W,H,.7*dpr), hpx=new Float32Array(W*H); for(let i=0;i<W*H;i++) hpx[i]=(st?st.h[i]*hs:0)-o.impress*dent[i];
    const lf=o.impress>0?litFrom(hpx,W,H,dpr,o.diffuse,.4):(st?st.lf:null); if(lf&&st&&st.lf&&o.impress>0) for(let k=0;k<lf.length;k++) lf[k]*=lerp(1,st.lf[k],.5);
    const LFt=o.impress>0?carryLF(lf,x.lf,st):(x.lf||lf);
    const glyphs=String(o.text||'').replace(/[\s/]/g,'').length;
    return {alb,lf:LFt,lin:light(alb,LFt,W,H),ink:A,stock:hpx,mask:clip,marks:glyphs,markUnit:'strikes'}; } };

/* FX-08 · Hot foil — a metallic film stamped onto the stock: it mirrors the sheet light and takes the tooth */
const foil={ id:'fx-08-foil', code:'FX-08', name:'Hot foil', role:'mark · foil', section:'surprise', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  clips:{ die:(g,w,h,o)=>drawShape(g,w,h,o) },
  presets:[['gold',{}],['silver',{fL:.82,fC:.006,fh:250,warm:0}],['copper',{fL:.66,fC:.12,fh:48}],['holographic',{finish:'holo',fL:.8,fC:.05,fh:250,holo:1}],['matte black foil',{fL:.18,fC:.004,fh:260,shin:6,mirror:.25}]],
  sub:'A metallic film, not a color. It conforms to the tooth, skips the deepest valleys, and its brightness is the light: a broad studio reflection plus tight glints off every facet. Holographic foil shifts hue with each facet\'s angle.',
  recipe:['Die = the same shapes as FX-06; foil lands on the AA die × the stock: valleys below the starve height release no foil (pinholes), edge flash breaks the boundary at the film-split scale.','Height = stock relief × (1 − crush) + foil grain (fine crumple) − a slight deboss; normals from it.','Metal: a perspective viewer above the plate; the mirror vector per pixel samples a soft box at the sheet light (and a weak fill opposite), so the reflection sweeps across the foil; + tight Blinn glints; holo rotates the hue by facet orientation.','Off-foil paper keeps its own light.'],
  limits:[['gloss','< 6','reads as metallic paint, not foil'],['foil grain','> .6 px','crinkled, like a chocolate wrapper'],['light elevation','> 75°','foil goes dark — metal reflects away from an overhead light']],
  params:[...SHAPE_PARAMS({shape:'word',text:'Four surfaces',size:.5}),
    {key:'finish',label:'Finish',group:'color',type:'select',options:['metal','holo'],value:'metal'},
    ...FX.INK_PARAMS('f','Foil',.8,.13,84),
    {key:'holo',label:'Holo spread',group:'color',type:'range',min:0,max:1,step:.01,value:.6,when:{finish:['holo']},note:'hue rotation per facet angle'},
    {key:'mirror',label:'Reflection',group:'relief',type:'range',min:0,max:1.5,step:.01,value:1,note:'strength of the soft-box reflection'},
    {key:'box',label:'Soft-box size',group:'relief',type:'range',min:1,max:60,step:.5,value:3,curve:2,note:'small exponent = big soft box (broad sweep); large = small hard light'},
    {key:'cam',label:'Camera distance',group:'relief',type:'range',min:.5,max:6,step:.05,value:1.2,note:'viewer height in plate widths — closer = a stronger sweep of the reflection across the foil'},
    {key:'shin',label:'Gloss',group:'relief',type:'range',min:2,max:400,step:1,value:90,curve:2,note:'glint tightness',limits:[[2,6,'metallic paint']]},
    {key:'grain',label:'Foil grain',group:'relief',type:'range',min:0,max:1,step:.01,unit:'px',value:.12,curve:2,note:'fine crumple of the film',limits:[[.6,1,'chocolate wrapper']]},
    {key:'crush',label:'Crush',group:'relief',type:'range',min:0,max:1,step:.01,value:.55,note:'how much the heated die flattens the tooth under the foil'},
    {key:'dent',label:'Deboss',group:'relief',type:'range',min:0,max:1,step:.01,unit:'px',value:.18},
    {key:'stock',label:'Prints on',group:'stock',type:'select',options:['paper','cloth','smooth'],value:'paper'},
    {key:'starve',label:'Release',group:'stock',type:'range',min:0,max:.4,step:.002,value:.025,curve:2,note:'lowest share of the surface that the foil never touches (pinholes)'},
    {key:'flash',label:'Edge flash',group:'stock',type:'range',min:0,max:1,step:.01,value:.2,note:'foil breaking at the die edge'},
    FX.SEED_PARAM(11)],
  run(o,W,H,dpr,x={}){ const st=stockFor(o,x,W,H,dpr), clip=(x.clips&&x.clips.die)||new Float32Array(W*H), s=o.seed|0, hs=stockH(st,x.S);
    const sh=new Float32Array(W*H); for(let i=0;i<W*H;i++) sh[i]=st?st.h[i]:.5; const loc=FX.blur(sh,W,H,6*dpr), hp=new Float32Array(W*H); for(let i=0;i<W*H;i++) hp[i]=sh[i]-loc[i]; // high-pass: pinholes follow the tooth, not the formation
    const hist=new Float32Array(hp).sort(), q=hist[Math.floor(clamp(o.starve,0,.99)*(hist.length-1))];
    const dent=FX.blur(clip,W,H,.6*dpr), hpx=new Float32Array(W*H);
    for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X, base=sh[i]*hs; const u_=X/dpr, v_=y/dpr, fac=.75*FX.gnoise(u_/4.5,v_/4.5,s+4)+.25*FX.gnoise(u_/1.6+9.1,v_/1.6-3.3,s+5); hpx[i]=base*(1-o.crush*dent[i])+dent[i]*(o.grain*(fac-.5)*2.4)-o.dent*dent[i]; } // foil grain: broad facets (4.5 px) + a fainter crinkle, never per-pixel sand
    // the key is a large soft box at the light's azimuth, spanning from the light up toward the zenith (center at ~55% of the way)
    const LL=FX.LIGHT, ec=(LL.el+(90-LL.el)*.55)*PI/180, ea=LL.az*PI/180, cx_=Math.cos(ea)*Math.cos(ec), cy_=Math.sin(ea)*Math.cos(ec), cz_=Math.sin(ec), bw=1/(1+o.box*.18);
    const N=FX.normals(hpx,W,H,dpr), [lx,ly,lz]=FX.lightVec(), fl=FX.inkOf(o,'f'), w2=W/dpr*(o.camX??.5), h2=H/dpr*(o.camY??.5), camZ=o.cam*Math.max(w2,h2)*2;
    const alb=baseAlb(st,x,W,H), lfb=x.lf||(st?st.lf:null), lin=light(alb,lfb,W,H), cov=new Float32Array(W*H), o3=[0,0,0]; let n=0;
    for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X; let c=clip[i]; if(c<=0) continue;
      if(st) c*=clamp((hp[i]-q)*dpr*40+.5,0,1); if(c>0&&c<1&&o.flash>0){ const t=lerp(c,c*c,o.flash), gn=FX.grain(X/dpr,y/dpr,s+12,.6,dpr); c=lerp(c,clamp((t-gn)*6+.5,0,1),o.flash); } if(c<=.001) continue; cov[i]=c; n++;
      // perspective viewer above the plate center: the soft-box reflection sweeps across the foil — the cue that reads as metal
      const px_=X/dpr-w2, py_=y/dpr-h2; let vx=-px_, vy=-py_, vz=camZ; const vl=Math.hypot(vx,vy,vz); vx/=vl; vy/=vl; vz/=vl;
      const nx=N.nx[i], ny=N.ny[i], nz=N.nz[i], nv=nx*vx+ny*vy+nz*vz, rx=2*nv*nx-vx, ry=2*nv*ny-vy, rz=2*nv*nz-vz;
      // studio environment seen in the mirror: a soft box at the sheet light (size = box), a dim ceiling, a dark room toward
      // the horizon. Metal is its reflection — the contrast between box and room is what reads as foil, not a tint.
      const rl=rx*cx_+ry*cy_+rz*cz_, sb=sstep(1-bw*.3,1-bw*.05,rl), fill=.14*Math.pow(clamp(rz,0,1),3), room=.02;
      const env=(sb*1.3+fill+room)*o.mirror;
      let hx2=lx+vx, hy2=ly+vy, hz2=lz+vz; const hl=Math.hypot(hx2,hy2,hz2); const glint=Math.pow(Math.max(0,(nx*hx2+ny*hy2+nz*hz2)/hl),o.shin)*.8;
      let base=fl.lin; if(o.finish==='holo'){ // diffraction: hue follows the REFLECTION direction (smooth bands sweeping with the view), not per-pixel normals
        const hh=fl.h*PI/180+o.holo*(Math.atan2(ry,rx)*1.2+rz*9), C=Math.max(fl.C,.11); FX.lab2lin(Math.min(.86,fl.L+.04),C*Math.cos(hh),C*Math.sin(hh),o3); base=[clamp(o3[0],0,1),clamp(o3[1],0,1),clamp(o3[2],0,1)]; }
      const k=i*3; for(let ch=0;ch<3;ch++){ const m=base[ch]*env+glint*(.3+.7*base[ch]); lin[k+ch]=lin[k+ch]*(1-c)+m*c; } }
    return {alb,lf:lfb,lin,ink:cov,stock:hpx,mask:clip,marks:n,markUnit:'foiled px'}; } };

/* ── new marks · e ── */
/* shared helpers: bilinear sample (zero outside the plate), 1-D tables for per-stroke noise, pixel-integrated gaussian */
const e_bil=(A,W,H,x,y)=>{ x-=.5; y-=.5; const x0=Math.floor(x), y0=Math.floor(y), fx=x-x0, fy=y-y0, at=(X,Y)=>X<0||Y<0||X>=W||Y>=H?0:A[Y*W+X];
  const a=at(x0,y0), b=at(x0+1,y0), c=at(x0,y0+1), d=at(x0+1,y0+1); return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy; };
const e_erf=x=>{ const a=x<0?-x:x, t=1/(1+.3275911*a), y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-a*a); return x<0?-y:y; };
const e_tab=(a,b,step,fn)=>{ const n=Math.ceil((b-a)/step)+2, T=new Float32Array(n); for(let i=0;i<n;i++) T[i]=fn(a+i*step); return {a,step,T,n,at(x){ let f=(x-this.a)/this.step; if(f<0) f=0; if(f>this.n-1.001) f=this.n-1.001; const i=f|0; return this.T[i]+(this.T[i+1]-this.T[i])*(f-i); }, d(x){ let f=(x-this.a)/this.step; if(f<0) f=0; if(f>this.n-1.001) f=this.n-1.001; const i=f|0; return (this.T[i+1]-this.T[i])/this.step; }}; };
/* botany for the sun print: tapered ribbons along quadratics (stems, rachis, blades), ellipse pinnules, spikelets */
const e_q=(a,c,b,t)=>{ const m=1-t; return [m*m*a[0]+2*m*t*c[0]+t*t*b[0], m*m*a[1]+2*m*t*c[1]+t*t*b[1]]; };
const e_qt=(a,c,b,t)=>{ const m=1-t, x=2*m*(c[0]-a[0])+2*t*(b[0]-c[0]), y=2*m*(c[1]-a[1])+2*t*(b[1]-c[1]), l=Math.hypot(x,y)||1; return [x/l,y/l]; };
const e_ribbon=(g,a,c,b,w0,w1,n=40,pw=1)=>{ const Lf=[],Rt=[]; for(let i=0;i<=n;i++){ const t=i/n, p=e_q(a,c,b,t), d=e_qt(a,c,b,t), hw=(w0+(w1-w0)*Math.pow(t,pw))/2; Lf.push([p[0]-d[1]*hw,p[1]+d[0]*hw]); Rt.push([p[0]+d[1]*hw,p[1]-d[0]*hw]); }
  g.beginPath(); Lf.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); for(let i=Rt.length-1;i>=0;i--) g.lineTo(Rt[i][0],Rt[i][1]); g.closePath(); g.fill(); };
/* a fern frond: a tapering rachis; alternate pinnae, each one closed outline with lobed (pinnatifid) margins — one leaflet, not beads */
const e_pinna=(g,p,pc,q,wd,m,ph)=>{ const N=Math.max(24,m*8), Lf=[], Rt=[];
  for(let i=0;i<=N;i++){ const t=i/N, c=e_q(p,pc,q,t), d=e_qt(p,pc,q,t), env=Math.sqrt(Math.max(0,1-t))*sstep(0,.1,t)*(1-.25*t)+.012;
    for(const sd of [-1,1]){ const ph2=m*t+(sd>0?ph:ph+.5), lobe=Math.pow(Math.abs(Math.sin(PI*ph2)),.55)*(.75+.5*hash(Math.floor(ph2),sd+3,(ph*1e4)|0)), r=wd*env*(.48+.52*lobe)+.35, pt=[c[0]-d[1]*r*sd,c[1]+d[0]*r*sd]; (sd<0?Lf:Rt).push(pt); } }
  g.beginPath(); Lf.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); for(let i=Rt.length-1;i>=0;i--) g.lineTo(Rt[i][0],Rt[i][1]); g.closePath(); g.fill(); };
const e_frond=(g,base,tip,bend,R,np=40)=>{ const dx=tip[0]-base[0], dy=tip[1]-base[1], L=Math.hypot(dx,dy), c=[(base[0]+tip[0])/2-dy*bend,(base[1]+tip[1])/2+dx*bend];
  e_ribbon(g,base,c,tip,L*.012,L*.002,60,.8);
  for(let k=0;k<np;k++){ const side=k%2?1:-1, t=.09+.89*Math.pow(k/(np-1),.92), p=e_q(base,c,tip,t), d=e_qt(base,c,tip,t);
    const env=t<.24?.55+.45*sstep(0,.24,t):1-.86*Math.pow((t-.24)/.76,1.05), Lp=L*.25*env*(.94+.12*R()), ang=side*(72-24*t+(R()-.5)*6)*PI/180, ca=Math.cos(ang), sa=Math.sin(ang), pd=[d[0]*ca-d[1]*sa,d[0]*sa+d[1]*ca];
    const q=[p[0]+pd[0]*Lp,p[1]+pd[1]*Lp], pc=[p[0]+pd[0]*Lp*.5+d[0]*Lp*.16,p[1]+pd[1]*Lp*.5+d[1]*Lp*.16], wd=L*.021*(.6+.4*env), m=Math.max(2,Math.round(Lp/(L*.019)));
    e_pinna(g,p,pc,q,wd,m,R()*.3); }
  e_pinna(g,e_q(base,c,tip,.95),e_q(base,c,tip,.98),[tip[0]+dx/L*L*.025,tip[1]+dy/L*L*.025],L*.012,2,0); };
const e_grass=(g,w,h,R)=>{ const B=13;
  for(let k=0;k<B;k++){ const bx=w*(.16+.68*(k+R()*.8)/B), by=h*1.03, ht=h*(.5+.38*R()), lean=(R()-.5)*w*.36, wd=8+9*R();
    if(R()<.3){ const tip=[bx+lean*1.5+(lean>0?w*.08:-w*.08),by-ht*.62], c=[bx+lean*.55,by-ht*1.12]; e_ribbon(g,[bx,by],c,tip,wd,.35,60,2.2); } // a blade folded over
    else { const tip=[bx+lean,by-ht], c=[bx+lean*.15+(R()-.5)*w*.08,by-ht*.62]; e_ribbon(g,[bx,by],c,tip,wd,.35,60,2.2); } }
  for(let k=0;k<3;k++){ const bx=w*(.3+.2*k+(R()-.5)*.08), by=h*1.03, ht=h*(.72+.14*R()), lean=(R()-.5)*w*.22, tip=[bx+lean,by-ht], c=[bx+lean*.2,by-ht*.6];
    e_ribbon(g,[bx,by],c,tip,1.9,1,50);
    const n=14; for(let j=0;j<n;j++){ const t=.56+.44*j/(n-1), p=e_q([bx,by],c,tip,t), d=e_qt([bx,by],c,tip,t), side=j%2?1:-1, a=Math.atan2(d[1],d[0])+side*26*PI/180, len=(9.5-3.5*(j/(n-1)))*(.9+.2*R());
      const e=[p[0]+Math.cos(a)*len,p[1]+Math.sin(a)*len]; g.beginPath(); g.ellipse((p[0]+e[0])/2,(p[1]+e[1])/2,len*.55,len*.17+.6,a,0,TAU); g.fill();
      const aw=[e[0]+Math.cos(a-side*.08)*len*1.3,e[1]+Math.sin(a-side*.08)*len*1.3]; e_ribbon(g,e,[(e[0]+aw[0])/2,(e[1]+aw[1])/2],aw,.9,.45,8); } } };
const e_botany=(g,w,h,o)=>{ const R=FX.rng((o.seed|0)+101);
  if(o.subject==='grass') return e_grass(g,w,h,R);
  e_frond(g,[w*.14,h*.98],[w*.8,h*.08],.06,R,38); e_frond(g,[w*.97,h*.9],[w*.62,h*.42],-.1,R,22); };
const E_TONES={fresh:[.56,.092,224],classic:[.42,.122,257],peroxide:[.34,.13,263],tea:[.5,.032,58]};

/* FX-11 · Cyanotype — a sun print: brushed sensitizer, objects shading the UV, Prussian blue where the sun reached */
const cyanotype={ id:'fx-11-cyanotype', code:'FX-11', name:'Cyanotype', role:'mark · sun print', section:'new', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  clips:{ obj:(g,w,h,o)=>{ if(o.subject==='die') drawShape(g,w,h,{shape:o.dieShape,text:o.text,size:o.dieSize}); else e_botany(g,w,h,o); } },
  presets:[['classic fern',{}],['die print',{subject:'die',dieShape:'sun',lift:2.5,contact:.62,trans:0,expo:1.15,strokes:3,dry:.35}],['overexposed',{expo:2.8,bleed:.7,lift:10,contact:.42,trans:.06,depth:1.55}],['peroxide grass',{subject:'grass',tone:'peroxide',lift:4,contact:.6,strokes:4,bAngle:-5,trans:.01}],['tea-toned',{tone:'tea',depth:1.25,bleed:.25}]],
  sub:'A sun print. Sensitizer is brushed on in ragged strokes that pool where the brush lands and run dry where it lifts; a fern, grass or a die sits on top and the sun does the rest. Where light reached, Prussian blue; under the object, paper. Lifted parts throw soft, offset shadows away from the sheet light — pressed parts stay sharp.',
  recipe:[
    'Coating = brush strokes in stroke space (along s, across t): a load that runs out along the stroke; edges displaced by per-side noise (raggedness); a set-down pool and a drying rim; bristle streaks × the stock height decide where a dry brush still deposits.',
    'Thickness τ = load × unevenness (streaks + low-frequency drag) + pools; overlapping strokes add (a double coat prints deeper); paper valleys hold more sensitizer.',
    'Objects (procedural fern frond, grass with spikelets, or a die) are an AA clip. Lift = a smooth field × the lift dial; contact sets how much lies flat.',
    'Shadow: for each lift level z the clip is sampled toward the sheet light at z · cot(elevation) (smeared ±20 % along the light) and blurred by z × sky scatter; each pixel blends the two levels around its lift.',
    'Exposure E = 1 − shadow × (1 − translucency); density = τ × (1 − e^(−k·exposure·E)) — overexposure fills the penumbra in.',
    'Wash: unexposed coating rinses away; Prussian blue bleeds a little downhill into the whites, in streaks. Color = Beer–Lambert film of the tone (fresh, classic, peroxide-oxidized, tea-toned).',
    'Light last: × the stock\'s shading under the sheet light.'],
  limits:[['object lift','> 18 px','penumbra wider than the leaflets — the fern dissolves into a cloud'],['exposure','> 2.5','penumbra fills in; fine pinnules and awns vanish'],['exposure','< .5','pale, greenish print — read as underexposed'],['raggedness','> .8','stroke edges tear into islands'],['strokes','> 6','brush marks shrink into stripes']],
  params:[
    {key:'subject',label:'Subject',group:'density',type:'select',options:['fern','grass','die'],value:'fern',note:'what lies on the sheet: a procedural fern frond, grass with seed heads, or a die mark'},
    {key:'dieShape',label:'Die',group:'density',type:'select',options:['compass','sun','crescent','knot','monogram'],value:'compass',when:{subject:['die']},note:'an invented mark cut from card'},
    {key:'text',label:'Monogram',group:'density',type:'text',value:'Q',maxlength:4,when:{subject:['die'],dieShape:['monogram']}},
    {key:'dieSize',label:'Die size',group:'density',type:'range',min:.2,max:1,step:.01,value:.72,when:{subject:['die']}},
    {key:'strokes',label:'Brush strokes',group:'density',type:'range',min:2,max:8,step:1,value:4,note:'strokes laid top to bottom, alternating direction',limits:[[7,8,'stripes']]},
    {key:'bAngle',label:'Brush angle',group:'density',type:'range',min:-30,max:30,step:.5,unit:'°',value:-3},
    {key:'rag',label:'Brush-edge raggedness',group:'density',type:'range',min:0,max:1,step:.01,value:.45,note:'how far bristles and drag push each stroke edge in and out',limits:[[.8,1,'edges tear']]},
    {key:'uneven',label:'Coating unevenness',group:'density',type:'range',min:0,max:1,step:.01,value:.45,note:'streaks and drag in the sensitizer thickness'},
    {key:'dry',label:'Dry-brush tails',group:'density',type:'range',min:0,max:1,step:.01,value:.6,note:'how far the load runs out before the brush lifts — bristle streaks on the tooth peaks'},
    {key:'pool',label:'Pooling',group:'density',type:'range',min:0,max:1,step:.01,value:.5,note:'sensitizer beading where the brush lands and stops, and the drying rim along each edge'},
    {key:'expo',label:'Exposure',group:'dropoff',type:'range',min:.2,max:3,step:.01,value:1,note:'sun dose; 1 = full development of an unshaded coat',limits:[[2.5,3,'penumbra fills in'],[.2,.5,'pale, underexposed']]},
    {key:'lift',label:'Object lift',group:'relief',type:'range',min:0,max:24,step:.1,unit:'px',value:5.5,curve:1.6,note:'height of the lifted parts above the sheet — sets the penumbra width and its offset away from the sheet light',limits:[[18,24,'the subject dissolves']]},
    {key:'contact',label:'Contact',group:'relief',type:'range',min:0,max:1,step:.01,value:.5,note:'share of the subject pressed flat (sharp); the rest curls up (soft)'},
    {key:'scatter',label:'Sky scatter',group:'relief',type:'range',min:.05,max:1,step:.01,value:.32,note:'penumbra per px of lift — skylight and haze around the sun'},
    {key:'trans',label:'Translucency',group:'relief',type:'range',min:0,max:.3,step:.005,value:.015,note:'UV passing through leaf tissue (cut card: 0)',when:{subject:['fern','grass']}},
    {key:'bleed',label:'Wash bleed',group:'mixing',type:'range',min:0,max:1,step:.01,value:.35,note:'Prussian blue carried downhill into the whites during the wash, in streaks'},
    {key:'stock',label:'Prints on',group:'stock',type:'select',options:['paper','cloth','smooth'],value:'paper',note:'paper = FX-03 live (watercolor-like sheets suit it), cloth = FX-04 live (cyanotype on cotton)'},
    {key:'tone',label:'Tone',group:'color',type:'select',options:['fresh','classic','peroxide','tea','custom'],value:'classic',note:'fresh = before oxidation (greener); classic = air-oxidized Prussian blue; peroxide = hydrogen-peroxide bath (deeper, violet-blue); tea = tannin-toned neutral brown'},
    {key:'depth',label:'Blue depth',group:'color',type:'range',min:.3,max:2,step:.01,value:1.45,note:'film density of a fully exposed coat (Beer–Lambert: deeper and more saturated)'},
    ...FX.INK_PARAMS('c','Custom tone',.4,.12,256).map(p=>Object.assign(p,{when:{tone:['custom']}})),
    FX.SEED_PARAM(19)],
  run(o,W,H,dpr,x={}){ const w=W/dpr,h=H/dpr,s=o.seed|0,R=FX.rng(s+7), st=stockFor(o,x,W,H,dpr), obj=(x.clips&&x.clips.obj)||new Float32Array(W*H);
    // stock height band-limited to ~.35 px: dry-brush thresholds follow the tooth but never cut single device pixels
    const hb=st?FX.blur(st.h,W,H,Math.max(1,Math.round(.3*dpr))):null, hm=meanH(hb), hd=st?FX.blur(st.h,W,H,Math.max(1,Math.round(.9*dpr))):null, hdm=meanH(hd);
    /* 1 · coating */
    const n=o.strokes|0, top=h*.075, bot=h*.925, span=(bot-top)/n, C=new Float32Array(W*H), T=new Float32Array(W*H), Tm=new Float32Array(W*H);
    for(let k=0;k<n;k++){ const bw=span*(1.2+.14*R()), cy=top+(k+.5)*span+(R()-.5)*span*.14, dir=k%2?-1:1, a=(o.bAngle+(R()-.5)*4)*PI/180, ca=Math.cos(a)*dir, sa=Math.sin(a)*dir;
      const xa=w*(.04+.07*R()), xb=w*(.96-.07*R()), L=(xb-xa)/Math.abs(Math.cos(a)), x0=dir>0?xa:xb, y0=cy, bow=(R()-.5)*bw*.28, dK=clamp(o.dry*(.45+.8*R()),0,1), sk=s*13+k*101;
      const S0=-bw*.6, S1=L+bw*1.2, edge=[0,1].map(sd=>e_tab(S0,S1,.25,q=>bw*.035*(FX.gfbm(q/150,sd*9+k*3,sk+1,2,.4)-.5)*4+1.5*(FX.gfbm(q/7,sd*7+k*5,sk+2,2,.5)-.5)*2)), CAP=e_tab(-bw,bw,.25,q=>(FX.gfbm(q/10,k*2.7,sk+12,2,.5)-.5)*2);
      const fine=Math.max(.8,1.6/dpr), BT=e_tab(-bw,bw,.1,q=>.62*FX.gnoise(q/(fine*1.9),3.1,sk+3)+.38*FX.gnoise(q/fine,8.7,sk+4)), BT2=e_tab(-bw,bw,.1,q=>.62*FX.gnoise(q/(fine*1.9),5.3,sk+5)+.38*FX.gnoise(q/fine,1.7,sk+6));
      const TL=e_tab(-bw,bw,.1,q=>Math.pow(FX.gnoise(q/1.3,2.2,sk+7)*.7+FX.gnoise(q/5,4.4,sk+8)*.3,1.6)), MIX=e_tab(S0,S1,1,q=>FX.fbm(q/46,k,sk+9,2)), WOB=e_tab(S0,S1,1,q=>(FX.fbm(q/60,k+2,sk+10,2)-.5)*2.2);
      for(let y=0;y<H;y++){ const v=y/dpr-y0; for(let X=0;X<W;X++){ const u=X/dpr-x0, sA=u*ca+v*sa; if(sA<S0||sA>S1) continue; const t0=-u*sa+v*ca; if(t0>bw*.85||t0<-bw*.85) continue;
        const sc=clamp(sA/L,0,1), t=t0-bow*Math.sin(PI*sc), load=1-dK*Math.pow(sc,1.7);
        const e=edge[t>=0?1:0].at(sA)*o.rag*(1+1.4*(1-load)), hw=bw*.5*(1-.1*(1-load))+e, dE=hw-Math.abs(t); if(dE<-1) continue;
        const tn=clamp(t/Math.max(1,hw),-1,1), dS=sA+bw*.12*Math.sqrt(1-tn*tn)+o.rag*bw*.07*CAP.at(t), dEnd=L+dK*bw*.7*TL.at(t)-sA+(1-dK)*bw*.1*Math.sqrt(1-tn*tn);
        const cov=clamp(dE*dpr+.5,0,1)*clamp(dS*dpr+.5,0,1)*clamp(dEnd*dpr+.5,0,1); if(cov<=0) continue;
        const i=y*W+X, tw=t+WOB.at(sA), m=MIX.at(sA), B=BT.at(tw)*(1-m)+BT2.at(tw)*m, dB=(BT.d(tw)*(1-m)+BT2.d(tw)*m)/dpr;
        const ez=2+11*o.rag, eT=o.rag>0?.92*Math.pow(1-clamp(dE/ez,0,1),1.6):0, sT=o.rag>0?.85*Math.pow(1-clamp(Math.min(dS,dEnd)/ez,0,1),1.6):0;
        let c=cov; const th=Math.max(1.15*(1-load)-.12,eT,sT); if(th>-.05){ const q=.78*B+.22*(hd?clamp((hd[i]-hdm)*3.2+.5,0,1):.5), band=Math.max(.06,.7*Math.abs(.78*dB)); c*=sstep(th-band,th+band,q); } if(c<=0) continue;
        let tau=Math.pow(load,.55)*(1+o.uneven*(.55*(FX.fbm(sA/52,t/15+k*3,sk+11,2,.5)-.5)*2+.4*(B-.5)*2));
        tau+=o.pool*(1.1*Math.exp(-Math.max(0,sA)/(bw*.26))+1.1*(1-dK)*Math.exp(-Math.max(0,dEnd)/(bw*.2))+.4*load*Math.exp(-Math.max(0,dE)/1.1));
        if(hb) tau*=1+.6*(hm-hb[i]);
        const tc=c*Math.max(0,tau); C[i]=1-(1-C[i])*(1-c); T[i]+=tc; if(tc>Tm[i]) Tm[i]=tc; } } }
    /* 2 · exposure: shadow footprints per lift level, offset away from the sheet light and softened by height */
    const [lx,ly,lz]=FX.lightVec(), pl=Math.hypot(lx,ly)||1, ux=lx/pl, uy=ly/pl, cot=Math.min(4,pl/lz), LM=o.lift, K=LM>.05?6:1;
    const lift=new Float32Array(W*H), ra=R()*TAU, rc=Math.cos(ra), rs=Math.sin(ra), rx=.5*Math.hypot(w,h);
    if(K>1) for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const u=X/dpr, nn=.72*FX.fbm(u/115,v/115,s+61,3,.5)+.28*(((u-w/2)*rc+(v-h/2)*rs)/rx*.5+.5); lift[y*W+X]=LM*sstep(o.contact-.06,o.contact+.24,nn); } }
    const S=new Float32Array(W*H);
    for(let j=0;j<K;j++){ const z=K>1?LM*j/(K-1):0, off=z*cot*dpr, Sj=new Float32Array(W*H);
      const r=z*o.scatter*dpr; if(off<.05) Sj.set(obj); else { const nt=clamp(Math.ceil(off*.4/Math.max(.6,r*.5))|1,3,15), fs=Array.from({length:nt},(_,q)=>.8+.4*q/(nt-1)); for(const f of fs){ const dx=ux*off*f, dy=uy*off*f; for(let y=0;y<H;y++) for(let X=0;X<W;X++) Sj[y*W+X]+=e_bil(obj,W,H,X+.5+dx,y+.5+dy)/fs.length; } }
      const Sb=r>=.75?FX.blur(Sj,W,H,r*.75):Sj;
      for(let i=0;i<W*H;i++){ const f=K>1?lift[i]/LM*(K-1):0, wgt=1-Math.abs(f-j); if(wgt>0) S[i]+=wgt*Sb[i]; } }
    /* 3 · develop: Beer–Lambert density from dose; 4 · wash: bleed downhill, streaked */
    const tr=o.subject==='die'?0:o.trans, kk=2.2, nrm=1/(1-Math.exp(-kk)), A=new Float32Array(W*H), stain=.006;
    for(let i=0;i<W*H;i++){ if(T[i]<=0) continue; const E=1-clamp(S[i],0,1)*(1-tr), r=Math.pow(Math.min(1.2,(1-Math.exp(-kk*o.expo*E))*nrm),1.35), Tt=Tm[i]+.45*(T[i]-Tm[i]), Ts=1.3*(1-Math.exp(-Tt/1.3)); A[i]=Ts*(stain+(1-stain)*r)*o.depth; }
    if(o.bleed>0){ const rb=Math.max(1,Math.round(2*dpr)), Ab=FX.blur(A,W,H,rb), Cb=FX.blur(C,W,H,rb*2), dy=1.8*dpr;
      for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const i=y*W+X; if(Cb[i]<=.01) continue; const fl=e_bil(Ab,W,H,X+.5,y+.5-dy), sk=.5+.9*FX.fbm(X/dpr/2.6,v/36,s+91,2,.5), b=o.bleed*.55*fl*sk*Math.min(1,Cb[i]*1.4); if(b>A[i]) A[i]=b; } } }
    /* 5 · color + light */
    const tn=E_TONES[o.tone], ink=tn?FX.ink(tn[0],tn[1],tn[2]):FX.inkOf(o,'c'), LUT=FX.filmLUT(ink), alb=baseAlb(st,x,W,H), tea=o.tone==='tea'?FX.filmLUT(FX.ink(.9,.006,70)):null;
    for(let i=0,k=0;i<W*H;i++,k+=3){ const a=A[i]; if(a>0){ const j=((a>=2?1024:a*512+.5)|0)*3; alb[k]*=LUT[j]; alb[k+1]*=LUT[j+1]; alb[k+2]*=LUT[j+2]; }
      if(tea&&C[i]>0){ const j=((C[i]*.35*512+.5)|0)*3; alb[k]*=tea[j]; alb[k+1]*=tea[j+1]; alb[k+2]*=tea[j+2]; } }
    const LF=x.lf||(st?st.lf:null); return {alb,lf:LF,lin:light(alb,LF,W,H),ink:A,stock:st?st.h:null,mask:C,marks:n,markUnit:'brush strokes'}; } };

/* FX-12 · Laser char — a CO₂ beam rastering a die into card: gaussian scan lines that scorch, sink and smooth the tooth */
const E_CHAR=[[0,.968,0,0],[.12,.83,.036,70],[.34,.6,.052,58],[.6,.37,.042,50],[.84,.2,.018,46],[1,.12,.006,42]];
const e_fill=(clip,W,H)=>{ const out=new Float32Array(W*H).fill(1), seen=new Uint8Array(W*H), st=[]; const push=i=>{ if(!seen[i]&&clip[i]<.5){ seen[i]=1; st.push(i); } };
  for(let x=0;x<W;x++){ push(x); push((H-1)*W+x); } for(let y=0;y<H;y++){ push(y*W); push(y*W+W-1); }
  while(st.length){ const i=st.pop(), x=i%W; out[i]=clip[i]; if(x>0) push(i-1); if(x<W-1) push(i+1); if(i>=W) push(i-W); if(i<W*H-W) push(i+W); }
  for(let i=0;i<W*H;i++) if(!seen[i]&&clip[i]>=.5) out[i]=clip[i]; for(let i=0;i<W*H;i++) if(seen[i]) out[i]=clip[i]; return out; };
const e_charLUT=(()=>{ let T=null; return ()=>{ if(T) return T; T=new Float32Array(257*3); const P=FX.ink(.968,0,0).lin, o=[0,0,0];
  for(let i=0;i<=256;i++){ const c=i/256; let k=0; while(k<E_CHAR.length-2&&c>E_CHAR[k+1][0]) k++; const A=E_CHAR[k], B=E_CHAR[k+1], f=(c-A[0])/(B[0]-A[0]), L=lerp(A[1],B[1],f), Cc=lerp(A[2],B[2],f), hh=lerp(A[3]||B[3],B[3],f)*PI/180;
    FX.lab2lin(L,Cc*Math.cos(hh),Cc*Math.sin(hh),o); for(let ch=0;ch<3;ch++) T[i*3+ch]=clamp(o[ch],0,1)/P[ch]; } return T; }; })();
const laser={ id:'fx-12-laser', code:'FX-12', name:'Laser char', role:'mark · beam', section:'new', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  clips:{ die:(g,w,h,o)=>drawShape(g,w,h,o) },
  presets:[['light etch',{power:.32,pitch:2.6,spot:.55,halo:.15,ablate:.12,overburn:.1}],['deep raster',{power:.85,speed:.85,pitch:1.5,spot:.5,halo:.6,haloR:2.6,ablate:1.1,overburn:.25}],['cut-through with tabs',{cut:'outline',tabs:4,power:.6,pitch:1.5,halo:.5}],['tag cut',{cut:'tag',tabs:2,shape:'monogram',text:'Ferro',size:.5,power:.7,pitch:1.4}],['power ramp',{ramp:1,rampAng:0,power:1,pitch:1.8,halo:.4}],['defocused',{focus:.55,power:.75,pitch:1.6}]],
  sub:'A CO₂ beam rasters a die into card, one scan line at a time. Each line is a gaussian burn: past a threshold the paper scorches tan → brown → black, sinks, and the tooth is burned smooth; heat browns the fibers around it. Vector cuts go through: a charred kerf opening onto the dark bed below.',
  recipe:[
    'Scan lines at the pitch (≥ 2 device px), at the scan angle. Dose at a pixel = Σ over nearby lines of power ÷ speed × the beam\'s gaussian, integrated over the pixel (erf) — anti-aliased lines at any angle.',
    'Firing gate = the die clip sampled at each line\'s centerline, softened by the spot along the scan; the head\'s turnaround adds dose just inside the edges it reverses at.',
    'Defocus widens σ and lowers the peak (same energy, larger spot): paler, softer, lines merging. A power ramp can run across the raster.',
    'Char = 1 − e^(−k·(dose − threshold)) → an OKLab ramp tan → brown → black, multiplied into the stock albedo (fibers char darker). Heat halo = the dose spread a few px, browning fibers first.',
    'Relief: ablation sinks the surface with dose; the tooth is burned smooth; a fine char crust. Lit by the sheet light (grooves catch it on one wall).',
    'Vector cut: a kerf along the die outline (offset) or a tag; tabs leave bridges. The kerf opens onto the ground below, shaded by the card edge toward the light; its walls are charred.'],
  limits:[['line pitch','< 2 device px','clamped — finer lines alias into moiré on screen'],['power ÷ speed','> 1.4','char goes black and ablates; line structure survives only in the relief'],['defocus','> .7','reads as a smudge, not a laser'],['halo reach','> 9 px','reads as a scorch accident rather than a mark'],['kerf','> 3 px','a slot, not a laser cut']],
  params:[...SHAPE_PARAMS({shape:'compass',text:'Ferro & Lume',size:.52}),
    {key:'power',label:'Power',group:'density',type:'range',min:.05,max:1,step:.01,value:.55,note:'beam power in the raster; dose ∝ power ÷ speed ÷ pitch'},
    {key:'speed',label:'Speed',group:'density',type:'range',min:.25,max:3,step:.01,value:1,note:'head speed (relative); faster = less dose per line'},
    {key:'pitch',label:'Line pitch',group:'density',type:'range',min:1,max:6,step:.05,unit:'px',value:1.6,curve:1.5,note:'distance between scan lines; clamped to ≥ 2 device px',limits:[[1,1.2,'clamped to 2 device px at 1×']]},
    {key:'scan',label:'Scan angle',group:'density',type:'range',min:0,max:180,step:1,unit:'°',value:0,note:'direction the head travels'},
    {key:'spot',label:'Spot',group:'density',type:'range',min:.3,max:2,step:.01,unit:'px',value:.42,note:'beam radius σ in focus'},
    {key:'focus',label:'Defocus',group:'density',type:'range',min:0,max:1,step:.01,value:0,note:'0 = in focus; out of focus the spot widens and its peak drops',limits:[[.7,1,'a smudge']]},
    {key:'ramp',label:'Power ramp',group:'dropoff',type:'range',min:0,max:1,step:.01,value:0,note:'power falls across the raster, to 15 % at 1'},
    {key:'rampAng',label:'Ramp angle',group:'dropoff',type:'range',min:0,max:360,step:1,unit:'°',value:0},
    {key:'overburn',label:'Turnaround burn',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.18,note:'extra dose where the head slows to reverse at each line end'},
    {key:'halo',label:'Heat halo',group:'relief',type:'range',min:0,max:1,step:.01,value:.45,note:'fibers browned around the burn'},
    {key:'haloR',label:'Halo reach',group:'relief',type:'range',min:.5,max:12,step:.1,unit:'px',value:2,limits:[[9,12,'scorch accident']]},
    {key:'ablate',label:'Ablation',group:'relief',type:'range',min:0,max:1.5,step:.01,unit:'px',value:.4,note:'how far the surface sinks at full char'},
    {key:'diffuse',label:'Diffuse share',group:'relief',type:'range',min:0,max:1,step:.01,value:.9},
    {key:'cut',label:'Vector cut',group:'stock',type:'select',options:['off','outline','tag'],value:'off',note:'outline = the die cut out at an offset; tag = a rounded tag with a hole'},
    {key:'kerf',label:'Kerf',group:'stock',type:'range',min:.4,max:4,step:.05,unit:'px',value:1.3,when:{cut:['outline','tag']},limits:[[3,4,'a slot']]},
    {key:'cutOff',label:'Cut offset',group:'stock',type:'range',min:2,max:40,step:.5,unit:'px',value:10,when:{cut:['outline']},note:'distance from the die edge to the cut'},
    {key:'tabs',label:'Tabs',group:'stock',type:'range',min:0,max:8,step:1,value:4,when:{cut:['outline','tag']},note:'uncut bridges that hold the part'},
    {key:'tabW',label:'Tab width',group:'stock',type:'range',min:1,max:14,step:.5,unit:'px',value:4,when:{cut:['outline','tag']}},
    {key:'thick',label:'Card thickness',group:'stock',type:'range',min:.2,max:4,step:.05,unit:'px',value:1.4,when:{cut:['outline','tag']},note:'sizes the card edge\'s shadow on the ground in the kerf'},
    {key:'stock',label:'Prints on',group:'stock',type:'select',options:['paper','cloth','smooth'],value:'paper'},
    ...FX.INK_PARAMS('g','Ground below',.17,.006,255).map(p=>Object.assign(p,{when:{cut:['outline','tag']}})),
    FX.SEED_PARAM(12)],
  run(o,W,H,dpr,x={}){ const st=stockFor(o,x,W,H,dpr), die=(x.clips&&x.clips.die)||new Float32Array(W*H), s=o.seed|0, N=W*H;
    const foc=Math.sqrt(1+Math.pow(o.focus*5,2)), sig=Math.max(.5,o.spot*dpr*foc), pd=Math.max(2,o.pitch*dpr), th=o.scan*PI/180, dxs=Math.cos(th), dys=Math.sin(th), nx=-dys, ny=dxs, hwp=.5*(Math.abs(nx)+Math.abs(ny)), inv=1/(Math.SQRT2*sig);
    const gate=sig*.7>.8?FX.blur(die,W,H,sig*.6):die, near=FX.blur(die,W,H,Math.ceil(sig*2.2+pd)), SD=o.overburn>0?FX.sdf(die,W,H):null, SDo=o.cut==='outline'?FX.sdf(e_fill(die,W,H),W,H):null;
    let bx0=W,bx1=0,by0=H,by1=0; for(let y=0;y<H;y+=2) for(let X=0;X<W;X+=2) if(die[y*W+X]>.5){ if(X<bx0)bx0=X; if(X>bx1)bx1=X; if(y<by0)by0=y; if(y>by1)by1=y; } const bcx=(bx0+bx1)/2||W/2, bcy=(by0+by1)/2||H/2;
    const cx=W/2, cy=H/2, RR=Math.ceil(3.2*sig/pd)+1, Pref=2.6*dpr, ra=o.rampAng*PI/180, rc=Math.cos(ra), rs=Math.sin(ra), rext=Math.max(4,(Math.abs((bx1-bx0)*rc)+Math.abs((by1-by0)*rs))/2);
    const D=new Float32Array(N), fired=new Map();
    for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X; if(near[i]<1e-4) continue; const px=X+.5-cx, py=y+.5-cy, t=px*nx+py*ny, al=px*dxs+py*dys, k0=Math.floor(t/pd);
      let e=0; for(let k=k0-RR;k<=k0+RR;k++){ const dist=t-(k+.5)*pd; if(dist>3.4*sig+1||dist<-3.4*sig-1) continue;
        const gx=cx+al*dxs+(k+.5)*pd*nx, gy=cy+al*dys+(k+.5)*pd*ny, gt=e_bil(gate,W,H,gx,gy); if(gt<=.002) continue; if(gt>.5) fired.set(k,1);
        e+=gt*(1+.06*(hash(k,7,s)-.5))*.5*(e_erf((dist+hwp)*inv)-e_erf((dist-hwp)*inv))/(2*hwp); }
      if(e<=0) continue;
      let P=o.power*(1-o.ramp*.85*clamp(((X+.5-bcx)*rc+(y+.5-bcy)*rs)/rext*.5+.5,0,1));
      if(SD&&o.overburn>0&&SD[i]>-1){ const gxs=SD[X<W-1?i+1:i]-SD[X>0?i-1:i], gys=SD[y<H-1?i+W:i]-SD[y>0?i-W:i], gl=Math.hypot(gxs,gys)||1; P*=1+o.overburn*1.6*Math.exp(-Math.max(0,SD[i])/(1.4*dpr))*Math.abs(gxs*dxs+gys*dys)/gl; }
      D[i]=P/o.speed*e*Pref; }
    // vector cut: a kerf along a path, bridged by tabs; the cut's own dose chars the kerf walls
    let V=null; if(o.cut!=='off'){ V=new Float32Array(N); const kh=o.kerf*.5*dpr, sc=Math.max(.6,.5*dpr)*foc, nt=o.tabs|0, tw=o.tabW*.5*dpr, w=W/dpr, h=H/dpr;
      const hx=w*.41*dpr, hy=h*.37*dpr, rr=18*dpr, hcx=-hx+28*dpr, hr=7*dpr;
      for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X, px=X+.5-cx, py=y+.5-cy; let l;
        if(o.cut==='outline') l=Math.abs(SDo[i]+o.cutOff*dpr); else { const qx=Math.abs(px)-(hx-rr), qy=Math.abs(py)-(hy-rr), d=Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-rr; l=Math.min(Math.abs(d),Math.abs(Math.hypot(px-hcx,py)-hr)); }
        if(l>kh+5*sc) continue; let tg=1;
        if(nt>0){ const r=Math.hypot(px,py), f=(Math.atan2(py,px)/TAU+1)*nt+.25, df=Math.abs(f-Math.round(f))*TAU/nt*r; tg=clamp(df-tw+.5,0,1); if(o.cut==='tag'&&Math.hypot(px-hcx,py)<hr*3) tg=1; }
        V[i]=clamp(kh-l+.5,0,1)*tg; const dd=Math.max(0,l-kh); D[i]+=2.4*tg*Math.exp(-dd*dd/(2*sc*sc)); } }
    // material response: char ramp, heat halo, ablation + smoothed tooth + crust, then light
    const LUT=e_charLUT(), alb=baseAlb(st,x,W,H), hs=stockH(st,x.S), Hb=o.halo>0?FX.blur(D,W,H,o.haloR*dpr*.7):null, halo=FX.filmLUT(FX.ink(.64,.055,64)), hpx=new Float32Array(N), CH=new Float32Array(N);
    for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X, k=i*3, d=D[i], c=1-Math.exp(-Math.max(0,d-.3)*1.35); CH[i]=c;
      if(c>0){ const j=((c*256+.5)|0)*3; alb[k]*=LUT[j]; alb[k+1]*=LUT[j+1]; alb[k+2]*=LUT[j+2]; }
      if(Hb){ const hv=o.halo*sstep(.04,.7,Hb[i])*(1-c)*(1+2.2*(st&&st.fib?st.fib[i]:0))*(.45+1.1*FX.gnoise(X/dpr/2.6,y/dpr/2.6,s+5))*(st&&st.form?1+.6*(st.form[i]-.5):1); if(hv>0){ const j=((Math.min(2,hv*.9)*512+.5)|0)*3; alb[k]*=halo[j]; alb[k+1]*=halo[j+1]; alb[k+2]*=halo[j+2]; } }
      const dep=o.ablate*(1-Math.exp(-Math.max(0,d-.55)*.9)), crust=c*c*.1*(FX.grain(X/dpr,y/dpr,s+3,.8,dpr)-.5);
      hpx[i]=(st?st.h[i]*hs:0)*(1-.85*c)-dep+crust-(V?V[i]*.4:0); }
    const lf=litFrom(hpx,W,H,dpr,o.diffuse,.45); if(st&&st.lf) for(let k=0;k<lf.length;k++) lf[k]*=lerp(1,st.lf[k],.25); carryLF(lf,x.lf,st);
    const lin=light(alb,lf,W,H), Nm=FX.normals(hpx,W,H,dpr), [hx,hy,hz]=FX.halfVec();
    for(let i=0,k=0;i<N;i++,k+=3){ const c=CH[i]; if(c<.25) continue; const nh=Math.max(0,Nm.nx[i]*hx+Nm.ny[i]*hy+Nm.nz[i]*hz), sp=.07*(c-.25)*Math.pow(nh,14); lin[k]+=sp; lin[k+1]+=sp; lin[k+2]+=sp*1.04; } // carbon: matte black with a faint graphite sheen on the groove walls
    if(V){ const g=FX.inkOf(o,'g'), [lx,ly,lz]=FX.lightVec(), pl=Math.hypot(lx,ly)||1, cot=Math.min(4,pl/lz), ox=lx/pl*o.thick*cot*dpr, oy=ly/pl*o.thick*cot*dpr, sky=.3;
      for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X, v=V[i]; if(v<=0) continue; const lit=e_bil(V,W,H,X+.5+ox,y+.5+oy), f=(sky+(1-sky)*lit)*(.94+.12*FX.gnoise(X/dpr/3,y/dpr/3,s+21)), k=i*3;
        for(let ch=0;ch<3;ch++) lin[k+ch]=lin[k+ch]*(1-v)+g.lin[ch]*f*v; } }
    const M=V?Float32Array.from(die,(a,i)=>Math.max(a,V[i])):die;
    return {alb,lf,lin,ink:CH,stock:hpx,mask:M,marks:fired.size,markUnit:'scan lines'}; } };
/* ── new marks · d ── */
/* bilinear read of a device-px field at CSS px (u,v) */
const d_at=(F,W,H,dpr,u,v)=>{ const X=clamp(u*dpr-.5,0,W-1.001), Y=clamp(v*dpr-.5,0,H-1.001), x0=X|0, y0=Y|0, fx=X-x0, fy=Y-y0, i=y0*W+x0; return (F[i]*(1-fx)+F[i+1]*fx)*(1-fy)+(F[i+W]*(1-fx)+F[i+W+1]*fx)*fy; };
/* the studio the sheet light lives in, as seen in a gloss surface: a rectangular soft box centered at the light's azimuth,
   ~55% of the way from the light's elevation to the zenith (the same box center FX-08 foil mirrors), a dim ceiling, a dark room.
   soft = edge softness in tangent units (roughness); returns radiance relative to the diffuse white of the sheet. */
const d_studio=(L,bx,by,soft,Lbox)=>{ const ec=(L.el+(90-L.el)*.55)*PI/180, ea=L.az*PI/180, c=[Math.cos(ea)*Math.cos(ec),Math.sin(ea)*Math.cos(ec),Math.sin(ec)], e1=[-Math.sin(ea),Math.cos(ea),0], e2=[c[1]*e1[2]-c[2]*e1[1],c[2]*e1[0]-c[0]*e1[2],c[0]*e1[1]-c[1]*e1[0]];
  return (rx,ry,rz)=>{ const rl=rx*c[0]+ry*c[1]+rz*c[2]; let sb=0; if(rl>.05){ const X=(rx*e1[0]+ry*e1[1]+rz*e1[2])/rl, Y=(rx*e2[0]+ry*e2[1]+rz*e2[2])/rl; sb=sstep(bx+soft,bx-soft,Math.abs(X))*sstep(by+soft,by-soft,Math.abs(Y))*(1.2-.55*Math.min(1,(X*X)/(bx*bx)*.6+(Y*Y)/(by*by))); } /* a soft box is brightest at its center */ return sb*Lbox+.16*Math.pow(rz>0?rz:0,3)+.02+.09*Math.max(0,1-Math.abs(rz)*1.6); }; }; /* + the lit walls of the room, seen at grazing angles */

/* FX-09 · Spot UV varnish — a clear gloss film on a die area of matte board: invisible head-on, it lives in the reflection */
const spotUV={ id:'fx-09-spot-uv', code:'FX-09', name:'Spot UV varnish', role:'mark · clear film', section:'new', stockOf:o=>o.stock==='paper'?TOOTH:null,
  clips:{ die:(g,w,h,o)=>drawShape(g,w,h,o) },
  presets:[['on black board',{}],['tone-on-tone pattern',{shape:'monogram',text:'Marlow',size:.74,area:'die + field',pattern:'lines',pitch:2.6,pSize:.4,pAngle:-45,gap:3,bL:.38,bC:.03,bh:170,wet:.6,build:.14,round:.8,box:.42}],['raised UV',{shape:'word',text:'Nightjar',size:.62,build:1.4,round:3.8,level:1,gloss:.96,wet:.35,box:.5,cam:.85}]],
  sub:'A clear gloss film printed only on the die, over matte board. Head-on it all but disappears; it shows as the sheet light\'s soft box mirrored in a surface flatter than the paper, a crisp sheen boundary at the film edge, and a faint wet darkening of the stock beneath. Drag the light and the reflection slides across the mark.',
  recipe:[
    'Die = an invented mark, a word or a ring seal (AA clip, main thread) → exact signed distance. Coverage pattern: solid, or an analytic line / dot screen intersected with the die (or with the sheet around it), so every line and dot keeps a 1-device-px edge.',
    'Film profile from the signed distance: a rounded shoulder (1 − (1 − d / rounding)²) rising to the film build. The film levels the FX-03 tooth: its top = lerp(tooth, smoothed tooth, leveling × profile) + build × profile.',
    'Stock: FX-03\'s relief and fibers under a board color (OKLCH; dark by default). Matte = Lambert from FX-03 × albedo + a weak, broad rough-dielectric sheen on the tooth facets.',
    'Film: Fresnel (n = 1.5, F₀ = .04) from a perspective viewer above the plate; the mirror vector samples the studio (a rectangular soft box at the sheet light, a dim ceiling, a dark room); gloss sets the box edge softness and the glint exponent. Under the film the matte sheen is gone and the stock is darker and deeper in OKLab (wet tone).',
    'One light: the box center, glint and FX-03 shading all follow FX.LIGHT.'],
  limits:[['film build','> 2 px','a blister or a sticker, not a print finish'],['edge rounding','< .4 px','the sheen boundary aliases on 1× screens'],['pattern pitch','< 2.5 px','lines and dots fall to a pixel checker at 1× (fine at 2×+)'],['gloss','< .35','reads as a matte or satin varnish: the mark stops revealing itself in the reflection'],['light elevation','> 75°','the soft box moves behind the viewer: the film nearly vanishes (as real spot UV does under overhead light)']],
  params:[...SHAPE_PARAMS({shape:'sun',size:.74}),
    {key:'pattern',label:'Coverage',group:'density',type:'select',options:['solid','lines','dots'],value:'solid',note:'a solid film, or a fine line / dot screen of varnish'},
    {key:'area',label:'Varnish on',group:'density',type:'select',options:['die','reverse','die + field'],value:'die',note:'die = the mark is varnished · reverse = the sheet is varnished and the mark stays matte · die + field = a solid mark inside a patterned field'},
    {key:'pitch',label:'Pattern pitch',group:'density',type:'range',min:1.2,max:16,step:.05,unit:'px',value:3,curve:2,when:{pattern:['lines','dots']},limits:[[1.2,2.5,'a pixel checker at 1× (fine at 2×+)']]},
    {key:'pSize',label:'Line / dot share',group:'density',type:'range',min:.15,max:.92,step:.01,value:.45,when:{pattern:['lines','dots']},note:'line width or dot diameter ÷ pitch'},
    {key:'pAngle',label:'Pattern angle',group:'density',type:'range',min:-90,max:90,step:1,unit:'°',value:45,when:{pattern:['lines','dots']}},
    {key:'gap',label:'Keep-out',group:'density',type:'range',min:0,max:12,step:.1,unit:'px',value:2.5,when:{area:['reverse','die + field']},note:'matte ring between the mark and the varnished field'},
    {key:'build',label:'Film build',group:'relief',type:'range',min:.02,max:2.5,step:.01,unit:'px',value:.22,curve:2,note:'film height in CSS px at the plate\'s macro scale (flat UV ≈ .1–.3, raised / tactile UV ≈ 1–2)',limits:[[2,2.5,'blister']]},
    {key:'round',label:'Edge rounding',group:'relief',type:'range',min:.2,max:8,step:.05,unit:'px',value:1.6,curve:2,note:'width of the film\'s rounded shoulder, the meniscus that catches the light at the edge',limits:[[.2,.4,'aliases at 1×']]},
    {key:'level',label:'Leveling',group:'relief',type:'range',min:0,max:1,step:.01,value:.93,note:'how far the film fills the tooth: 1 = a glass-flat top, 0 = the film follows the paper'},
    {key:'gloss',label:'Gloss',group:'relief',type:'range',min:0,max:1,step:.01,value:.9,note:'surface smoothness: a sharp-edged soft-box reflection and a tight glint at 1, satin at .3',limits:[[0,.35,'satin varnish']]},
    {key:'mirror',label:'Reflection',group:'relief',type:'range',min:0,max:2,step:.01,value:1,note:'brightness of the soft box (the sheet light) seen in the film'},
    {key:'box',label:'Soft-box size',group:'relief',type:'range',min:.08,max:1,step:.01,value:.42,note:'half-height of the sheet light\'s soft box as seen from the sheet (tangent units); its reflection is a window of sheen'},
    {key:'cam',label:'Camera distance',group:'relief',type:'range',min:.5,max:6,step:.05,value:1.1,note:'viewer height in plate widths: closer = the reflection sweeps further across the sheet'},
    {key:'wet',label:'Wet tone',group:'color',type:'range',min:0,max:1,step:.01,value:.45,note:'darkening and deepening of the stock under the film (the varnish replaces the air in the tooth)'},
    ...FX.INK_PARAMS('b','Board',.22,.006,265).map(p=>p.key==='bL'?Object.assign(p,{label:'Stock darkness · L',note:'OKLCH lightness of the board (FX-03 relief and fibers, this color)'}):p),
    {key:'stock',label:'Prints on',group:'stock',type:'select',options:['paper','smooth'],value:'paper',note:'paper = FX-03 live (its tooth is what the film levels); smooth = a coated, toothless board'}],
  run(o,W,H,dpr,x={}){ const st=stockFor(o,x,W,H,dpr), clip=(x.clips&&x.clips.die)||new Float32Array(W*H), hs=stockH(st,x.S), w=W/dpr, h=H/dpr, NP=W*H;
    const SD=FX.blur(FX.sdf(clip,W,H),W,H,Math.max(1,Math.round(.6*dpr))), pa=o.pAngle*PI/180, pc=Math.cos(pa), ps=Math.sin(pa), P=o.pitch, half=o.pSize*P*.5, pat=o.pattern, rd=Math.max(.2,o.round);
    // varnish signed distance (CSS px, + inside): die ∩ pattern, or the sheet around the die, or die ∪ patterned field
    const sh=st?st.h:null, smooth=sh?FX.blur(sh,W,H,Math.round(4*dpr)):null, sm=sh?meanH(sh):0, hm=new Float32Array(NP), hf=new Float32Array(NP), hpx=new Float32Array(NP), cov=new Float32Array(NP); let n=0;
    for(let y=0;y<H;y++){ const v=(y+.5)/dpr; for(let X=0;X<W;X++){ const u=(X+.5)/dpr, i=y*W+X, dd=SD[i]/dpr; let dp=1e4;
      if(pat!=='solid'){ const a=u*pc+v*ps, b=-u*ps+v*pc; if(pat==='lines'){ const f=b/P-Math.floor(b/P); dp=half-Math.abs(f-.5)*P; } else { const fa=a/P-Math.floor(a/P)-.5, fb=b/P-Math.floor(b/P)-.5; dp=half-Math.hypot(fa,fb)*P; } }
      const d=o.area==='reverse'?Math.min(dp,-dd-o.gap):o.area==='die + field'?Math.max(dd,Math.min(dp,-dd-o.gap)):Math.min(dd,dp);
      const c=clamp(d*dpr+.5,0,1), t=clamp(d/rd,0,1), pr=1-(1-t)*(1-t); cov[i]=c; if(c>.5) n++;
      // two surfaces: the matte tooth, and the film's own top — a liquid that cured smooth (leveled toward a faint orange peel: 30% of the tooth's mid frequencies), so its edge highlight never picks up the tooth
      const hb=sh?sh[i]*hs:0; hm[i]=hb; hf[i]=(sh?lerp(hb,(sm+(smooth[i]-sm)*.3)*hs,o.level):0)+o.build*pr; hpx[i]=hb+(hf[i]-hb)*c; } }
    // albedo: the board color carrying FX-03's fiber / formation variation (or whatever was printed before, x.alb)
    const brd=FX.inkOf(o,'b'); let alb;
    if(x.alb) alb=Float32Array.from(x.alb); else { alb=new Float32Array(NP*3); let m=0, c_=0; if(st){ for(let i=0;i<NP;i+=7){ m+=st.alb[i*3]; c_++; } m/=c_; } for(let i=0,k=0;i<NP;i++,k+=3){ const r=st?st.alb[k]/m:1; alb[k]=brd.lin[0]*r; alb[k+1]=brd.lin[1]*r; alb[k+2]=brd.lin[2]*r; } }
    const wetA=Float32Array.from(alb), lab=[0,0,0], o3=[0,0,0], wl=1-o.wet*.3, wc=1+o.wet*.45;
    for(let i=0,k=0;i<NP;i++,k+=3){ const c=cov[i]; if(c<=0) continue; FX.lin2lab(alb[k],alb[k+1],alb[k+2],lab); FX.lab2lin(lab[0]*wl,lab[1]*wc,lab[2]*wc,o3); for(let q=0;q<3;q++) wetA[k+q]=alb[k+q]+(clamp(o3[q],0,1)-alb[k+q])*c; }
    // light: perspective viewer above the plate center; Fresnel-weighted mirror of the studio + the sheet light's glint
    const Nm=FX.normals(hm,W,H,dpr), Nf=FX.normals(hf,W,H,dpr), LL=FX.LIGHT, [lx,ly,lz]=FX.lightVec(), rough=1-o.gloss, env=d_studio(LL,o.box*1.35,o.box,.016+rough*rough*.5,9*o.mirror), shin=8+Math.pow(o.gloss,2)*140, gk=2.2*o.mirror*(.35+.65*o.gloss);
    const lfb=x.lf||(st?st.lf:null), lin=new Float32Array(NP*3), F0=.04, w2=w/2, h2=h/2, camZ=o.cam*Math.max(w,h);
    for(let y=0;y<H;y++){ const pv=(y+.5)/dpr-h2; for(let X=0;X<W;X++){ const i=y*W+X, k=i*3, c=cov[i]; let nx=Nm.nx[i], ny=Nm.ny[i], nz=Nm.nz[i];
      let vx=-((X+.5)/dpr-w2), vy=-pv, vz=camZ; const vl=Math.hypot(vx,vy,vz); vx/=vl; vy/=vl; vz/=vl;
      let hx=lx+vx, hy=ly+vy, hz=lz+vz; const hl=Math.hypot(hx,hy,hz); hx/=hl; hy/=hl; hz/=hl; const nh0=Math.max(0,nx*hx+ny*hy+nz*hz);
      const ms=F0*(.16+.18*nh0*nh0); // matte: rough dielectric — a weak broad sheen on the tooth facets
      for(let q=0;q<3;q++){ const lf=lfb?lfb[k+q]:1; lin[k+q]=alb[k+q]*lf+ms; }
      if(c<=0) continue; nx=Nf.nx[i]; ny=Nf.ny[i]; nz=Nf.nz[i]; const nh=Math.max(0,nx*hx+ny*hy+nz*hz);
      const nv=Math.max(0,nx*vx+ny*vy+nz*vz), F=F0+(1-F0)*Math.pow(1-nv,5), rx=2*nv*nx-vx, ry=2*nv*ny-vy, rz=2*nv*nz-vz;
      const spec=F*(env(rx,ry,rz)+gk*Math.pow(nh,shin)), tr=(1-F)*(1-F), lv=o.level;
      for(let q=0;q<3;q++){ const lf=lfb?lfb[k+q]:1, lff=1+(lf-1)*(1-.5*lv), film=wetA[k+q]*lff*tr+spec; lin[k+q]+=(film-lin[k+q])*c; } } }
    const albOut=new Float32Array(NP*3); for(let k=0;k<albOut.length;k++) albOut[k]=wetA[k];
    return {alb:albOut,lf:lfb,lin,ink:cov,stock:hpx,mask:cov,marks:Math.round(n/(dpr*dpr)),markUnit:'px² under film'}; } };

/* FX-10 · Satin embroidery — thread floats laid across a die, stitched into the cloth, gleaming along their length */
const embroidery={ id:'fx-10-embroidery', code:'FX-10', name:'Satin embroidery', role:'mark · thread', section:'new', stockOf:o=>o.stock==='cloth'?WEAVE:o.stock==='paper'?TOOTH:null,
  clips:{ die:(g,w,h,o)=>drawShape(g,w,h,o) },
  presets:[['rayon gloss',{}],['matte cotton floss',{sheen:.14,twist:.55,loft:.85,density:19,yL:.7,yC:.11,yh:72,maxFloat:46}],['chain-stitch outline',{shape:'knot',size:.7,outline:'chain',oLen:6.5,angle:-62,density:26,yL:.6,yC:.1,yh:182,maxFloat:60}]],
  sub:'A satin fill: long thread floats laid side by side across the die at one angle, each a slightly rounded body whose filaments gleam along their length, so the fill lights up or goes dark as the sheet light turns. Long floats split into staggered rows, ends land unevenly at the edge, needle holes dimple the cloth and the ground puckers where the stitches pull.',
  recipe:[
    'Die → exact signed distance. Satin: centerlines across the die at the stitch angle, one per 100 / density px; each centerline is marched against the die to find where the needle goes in and out (concave dies give several floats per row).',
    'Ends stagger (alternating needle points + jitter); floats longer than the max split into rows at brick-staggered points. Each float: a capsule whose cross-section is rounded (flatter when long), sinking into its needle hole at both ends, with an S-twist ridge along it.',
    'Floats are z-buffered by height (neighbors overlap like real satin); an optional split, running or chain stitch is traced along the die edge (marching-squares contour, real arc length) and laid on top.',
    'Cloth (FX-04 live): pucker ridges run along the pull direction at the stitch ends, decaying away from the edge; a crease dimples just outside the satin; needle holes darken it. Its own lighting is kept and multiplied by the pucker\'s Lambert.',
    'Thread light: Lambert on the thread normals + an anisotropic gleam (Kajiya–Kay along the twisted filament direction × a lobe across the cylinder), from the sheet light; a height-field shadow and cavity occlusion from the stitched relief fall onto the cloth and between floats. Color: OKLCH.'],
  limits:[['density','> 45 /100 px','threads under ~2 px: the fill reads as a smooth sheet at 1× (fine at 2×+)'],['density','< 12 /100 px','gaps open between floats'],['max float','> 200 px','floats too long to hold: they would snag; read as a ribbon'],['sheen','> .9 with low twist','reads as plastic'],['pull','> .7','the ground reads crumpled, not stitched']],
  params:[...SHAPE_PARAMS({shape:'crescent',size:.74,text:'Wren'}),
    {key:'density',label:'Stitch density',group:'density',type:'range',min:8,max:60,step:.5,unit:'/100px',value:24,note:'satin threads per 100 CSS px, across the stitch direction',limits:[[45,60,'a smooth sheet at 1×'],[8,12,'gaps open']]},
    {key:'angle',label:'Stitch angle',group:'density',type:'range',min:-90,max:90,step:1,unit:'°',value:-38,note:'direction of the floats; threads gleam most when they run across the light'},
    {key:'maxFloat',label:'Max float',group:'density',type:'range',min:8,max:400,step:1,unit:'px',value:72,curve:2,note:'longest stitch before it splits into rows (split satin); the split points stagger like brickwork',limits:[[200,400,'snags']]},
    {key:'stagger',label:'End stagger',group:'density',type:'range',min:0,max:1,step:.01,value:.45,note:'how unevenly the stitch ends land along the die edge (alternating needle points + jitter)'},
    {key:'outline',label:'Outline',group:'density',type:'select',options:['none','split','running','chain'],value:'none',note:'split stitch (each stitch pierces the last), running stitch, or chain stitch along the die edge'},
    {key:'oLen',label:'Outline stitch',group:'density',type:'range',min:1.5,max:14,step:.1,unit:'px',value:4,when:{outline:['split','running','chain']},note:'stitch (or chain link) length'},
    {key:'loft',label:'Thread loft',group:'relief',type:'range',min:.2,max:1.6,step:.01,value:.55,note:'thread height ÷ thread radius: round (1) or flattened (.4)'},
    {key:'twist',label:'Thread twist',group:'relief',type:'range',min:0,max:1,step:.01,value:.15,note:'ply twist: helical ridges along each float and the angle of the filaments that carry the gleam (rayon low, cotton floss high)'},
    {key:'sheen',label:'Sheen',group:'relief',type:'range',min:0,max:1,step:.01,value:.82,note:'anisotropic gleam along the thread: polyester / rayon ≈ .8, cotton ≈ .15',limits:[[.9,1,'plastic']]},
    {key:'pull',label:'Pull / pucker',group:'relief',type:'range',min:0,max:1,step:.01,value:.35,note:'how hard the stitches draw the ground: ridges along the pull at the stitch ends and a crease at the edge',limits:[[.7,1,'crumpled']]},
    ...FX.INK_PARAMS('y','Thread',.68,.165,52),
    {key:'stock',label:'Stitched into',group:'stock',type:'select',options:['cloth','paper'],value:'cloth',note:'cloth = FX-04 live; paper = FX-03 live (a stitched card)'},
    FX.SEED_PARAM(19)],
  run(o,W,H,dpr,x={}){ const st=stockFor(o,x,W,H,dpr), clip=(x.clips&&x.clips.die)||new Float32Array(W*H), s=o.seed|0, w=W/dpr, h=H/dpr, NP=W*H, hs=stockH(st,x.S);
    const SD=FX.sdf(clip,W,H), pitch=100/o.density, R0=pitch*.66, loft=o.loft, th=o.angle*PI/180, ca=Math.cos(th), sa=Math.sin(th), cx=w/2, cy=h/2, ext=Math.hypot(w,h)/2+pitch*3, NJ=Math.ceil(2*ext/pitch)+1;
    const TB=new Float32Array(NJ), TR=new Float32Array(NJ), SEG=new Array(NJ), holes=[]; let nSt=0;
    // 1 · satin rows: where each centerline enters and leaves the die → floats (split when too long)
    for(let j=0;j<NJ;j++){ const bj=-ext+(j+.5)*pitch+(hash(j,1,s)-.5)*pitch*.14, R=R0*(1+(hash(j,2,s)-.5)*.12); TB[j]=bj; TR[j]=R; const ox=cx-bj*sa, oy=cy+bj*ca, out=[];
      let prev=null, aIn=null; const stp=.5, iv=[];
      for(let a=-ext;a<=ext;a+=stp){ const u=ox+a*ca, v=oy+a*sa, d=(u<1||v<1||u>w-1||v>h-1)?-1:d_at(SD,W,H,dpr,u,v); if(prev!==null){ if(prev<=0&&d>0) aIn=a-stp+stp*(-prev)/(d-prev); else if(prev>0&&d<=0&&aIn!==null){ iv.push([aIn,a-stp+stp*prev/(prev-d)]); aIn=null; } } prev=d; }
      iv.forEach(([a0,a1],q)=>{ const jit=o.stagger*pitch*.55; a0+=jit*(((j&1)?.55:0)+hash(j,q*2+3,s)*.5-.15); a1-=jit*(((j&1)?0:.55)+hash(j,q*2+4,s)*.5-.15);
        const L=a1-a0; if(L<pitch*.7) return; const nn=Math.max(1,Math.ceil(L/o.maxFloat)), cuts=[a0], ph=(hash(j,q+11,s)-.5)*.8;
        for(let k=1;k<nn;k++) cuts.push(a0+L*(k+ph)/nn); cuts.push(a1);
        for(let k=0;k<cuts.length-1;k++){ const s0=cuts[k]+(k?R*.04:0), s1=cuts[k+1]-(k<cuts.length-2?R*.04:0); out.push(s0,s1,k?1:0,k<cuts.length-2?1:0); nSt++;
          holes.push([ox+(s0-R*.35)*ca,oy+(s0-R*.35)*sa,R*.62],[ox+(s1+R*.35)*ca,oy+(s1+R*.35)*sa,R*.62]); } });
      SEG[j]=out; }
    // 2 · thread raster, z-buffered by height (CSS px above the cloth): coverage, tangent, along-coordinate, thread id
    const TH=new Float32Array(NP).fill(-1), A=new Float32Array(NP), TX=new Float32Array(NP), TY=new Float32Array(NP), TID=new Float32Array(NP), tw=o.twist, aa=1/dpr, fs=Math.max(1.2,2.4/dpr);
    const put=(i,hT,cov,tx,ty,id)=>{ if(cov>A[i]) A[i]=cov; if(hT>TH[i]){ TH[i]=hT; TX[i]=tx; TY[i]=ty; TID[i]=id; } };
    const body=(dp,e,R,t,sb,ph,flat,dm)=>{ const d=e>=0?dp:Math.hypot(e,dp); if(d>R+aa) return -1; const q=Math.min(1,d/R), p=Math.sqrt(Math.max(0,1-Math.pow(q,2+flat*3))), dive=sstep(-R*.3,R*1.3,e);
      return loft*R*p*((dm+(1-dm)*dive)+tw*.17*Math.sin(TAU*(t/(R*3.1)+sb*.45)+ph))+loft*R*.14*p*(FX.gnoise(t/9,sb*R/fs,s+ph*13|0)-.5); }; // filament streaks: long along the thread, ≥ 1.2 CSS px across
    for(let y=0;y<H;y++){ const v=(y+.5)/dpr; for(let X=0;X<W;X++){ const i=y*W+X; if(SD[i]<-(pitch*1.2+2)*dpr) continue; const u=(X+.5)/dpr, du=u-cx, dv=v-cy, a=du*ca+dv*sa, b=-du*sa+dv*ca, j0=Math.floor((b+ext)/pitch);
      for(let j=j0-1;j<=j0+1;j++){ if(j<0||j>=NJ) continue; const sg=SEG[j]; if(!sg||!sg.length) continue; const R=TR[j], sbv=b-TB[j], dp=Math.abs(sbv); if(dp>R+aa) continue;
        for(let q=0;q<sg.length;q+=4){ const a0=sg[q], a1=sg[q+1]; if(a<a0-R-aa||a>a1+R+aa) continue; const Ls=a1-a0, t=a-a0, e=Math.min(t,a1-a), flat=.2+sstep(o.maxFloat*.25,o.maxFloat*1.1,Ls)*.5, dm=(t<a1-a?sg[q+2]:sg[q+3])?.8:.25;
          const hT=body(dp,e,R,t,sbv/R,hash(j,q,s)*TAU,flat,dm); if(hT<0) continue; const d=e>=0?dp:Math.hypot(e,dp); put(i,hT,clamp((R-d)*dpr+.5,0,1),ca,sa,j*64+(q>>2)); } } } }
    // 3 · outline along the die edge: split / running / chain stitch, laid over the satin
    let nO=0; if(o.outline!=='none'){ const lines=FX.contours(clip,W,H,.5), Ro=R0*(o.outline==='chain'?.7:.82), Lk=o.oLen, lift=loft*R0*.55;
      const capsule=(x0,y0,x1,y1,R,lf,id)=>{ const dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1e-3, ux=dx/L, uy=dy/L, pad=R+2*aa, X0=Math.max(0,Math.floor((Math.min(x0,x1)-pad)*dpr)), X1=Math.min(W-1,Math.ceil((Math.max(x0,x1)+pad)*dpr)), Y0=Math.max(0,Math.floor((Math.min(y0,y1)-pad)*dpr)), Y1=Math.min(H-1,Math.ceil((Math.max(y0,y1)+pad)*dpr));
        for(let Y=Y0;Y<=Y1;Y++) for(let X=X0;X<=X1;X++){ const u=(X+.5)/dpr-x0, v=(Y+.5)/dpr-y0, t=u*ux+v*uy, sp=-u*uy+v*ux, e=Math.min(t,L-t), hT=body(Math.abs(sp),e,R,t,sp/R,id*.7,0,.25); if(hT<0) continue; const d=e>=0?Math.abs(sp):Math.hypot(e,sp); put(Y*W+X,lf+hT,clamp((R-d)*dpr+.5,0,1),ux,uy,id); }
        holes.push([x0-ux*R*.3,y0-uy*R*.3,R*.6],[x1+ux*R*.3,y1+uy*R*.3,R*.6]); };
      const loop=(x0,y0,x1,y1,R,lf,id)=>{ const dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1e-3, ux=dx/L, uy=dy/L, ea=L*.62, eb=L*.3, mx=x0+ux*L*.5, my=y0+uy*L*.5, pad=ea+R+2*aa, X0=Math.max(0,Math.floor((mx-pad)*dpr)), X1=Math.min(W-1,Math.ceil((mx+pad)*dpr)), Y0=Math.max(0,Math.floor((my-pad)*dpr)), Y1=Math.min(H-1,Math.ceil((my+pad)*dpr));
        for(let Y=Y0;Y<=Y1;Y++) for(let X=X0;X<=X1;X++){ const u=(X+.5)/dpr-mx, v=(Y+.5)/dpr-my, lx_=u*ux+v*uy, ly_=-u*uy+v*ux;
          // teardrop link: the ellipse pinches toward its anchor (the back end), where both strands dive into one needle hole
          const pin=.45+.55*sstep(-ea,ea*.35,lx_), bb=eb*pin, k=Math.hypot(lx_/ea,ly_/bb), gk=Math.hypot(lx_/(ea*ea),ly_/(bb*bb))/Math.max(k,1e-4), d=Math.abs(k-1)/Math.max(gk,1e-4); if(d>R+aa) continue;
          const ph=Math.atan2(ly_/bb,lx_/ea), tlx=-ea*Math.sin(ph), tly=bb*Math.cos(ph), tl=Math.hypot(tlx,tly)||1, tx=(tlx*ux-tly*uy)/tl, ty=(tlx*uy+tly*ux)/tl;
          const q=Math.min(1,d/R), p=Math.sqrt(Math.max(0,1-q*q)), dive=sstep(-ea*.98,-ea*.3,lx_), hT=lf+loft*R*p*(.25+.75*dive)*(1+tw*.15*Math.sin(TAU*ph*3+id));
          put(Y*W+X,hT,clamp((R-d)*dpr+.5,0,1),tx,ty,id); }
        holes.push([x0,y0,R*.75]); };
      for(const ln of lines){ const pts=ln.map(([a,b])=>[a/dpr,b/dpr]), cum=[0]; for(let k=1;k<pts.length;k++) cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1])); const Lt=cum[cum.length-1]; if(Lt<Lk*3) continue;
        let seg=0; const at=(sv)=>{ sv=Math.min(Lt,Math.max(0,sv)); while(seg>0&&cum[seg]>sv) seg--; while(seg<cum.length-2&&cum[seg+1]<sv) seg++; const t=(sv-cum[seg])/Math.max(1e-6,cum[seg+1]-cum[seg]); return [lerp(pts[seg][0],pts[seg+1][0],t),lerp(pts[seg][1],pts[seg+1][1],t)]; };
        const nL=Math.max(3,Math.round(Lt/(o.outline==='split'?Lk*.62:o.outline==='running'?Lk*1.7:Lk))), step=Lt/nL;
        for(let k=0;k<nL;k++){ const s0=k*step, s1=o.outline==='chain'?s0+step:s0+Lk; if(o.outline==='running'&&s1>Lt) break; const P0=at(s0), P1=at(s1>Lt?s1-Lt:s1); seg=0;
          if(o.outline==='chain') loop(P0[0],P0[1],P1[0],P1[1],Ro,lift,4096+nO); else capsule(P0[0],P0[1],P1[0],P1[1],Ro,lift+(o.outline==='split'?(k%2)*.04:0),4096+nO); nO++; } } }
    // 4 · needle holes (cloth dimples where the thread goes through)
    const HOLE=new Float32Array(NP); for(const [hx,hy,hr] of holes){ const X0=Math.max(0,Math.floor((hx-hr)*dpr)), X1=Math.min(W-1,Math.ceil((hx+hr)*dpr)), Y0=Math.max(0,Math.floor((hy-hr)*dpr)), Y1=Math.min(H-1,Math.ceil((hy+hr)*dpr));
      for(let Y=Y0;Y<=Y1;Y++) for(let X=X0;X<=X1;X++){ const d=Math.hypot((X+.5)/dpr-hx,(Y+.5)/dpr-hy)/hr; if(d<1){ const vv=1-d*d, i=Y*W+X; if(vv>HOLE[i]) HOLE[i]=vv; } } }
    // 5 · pucker: ridges along the pull (stitch direction) where floats end at the edge, decaying away from it; a crease just outside
    const PK=new Float32Array(NP), lam=pitch*2+14, dec=8+26*o.pull;
    if(o.pull>0) for(let y=1;y<H-1;y++){ const v=(y+.5)/dpr; for(let X=1;X<W-1;X++){ const i=y*W+X, dOut=-SD[i]/dpr; if(dOut<=0||dOut>dec*5) continue; const u=(X+.5)/dpr, du=u-cx, dv=v-cy, a=du*ca+dv*sa, b=-du*sa+dv*ca;
      let gx=SD[i+1]-SD[i-1], gy=SD[i+W]-SD[i-W]; const gl=Math.hypot(gx,gy)||1; gx/=gl; gy/=gl; const wN=Math.abs(gx*ca+gy*sa);
      const ridge=Math.sin(TAU*(b/lam+.9*FX.gnoise(a/(lam*4),b/(lam*4),s+71))), lobe=sstep(.3,.7,FX.gnoise(a/(lam*3),b/(lam*1.3),s+73));
      PK[i]=o.pull*(5*Math.exp(-dOut/dec)*sstep(0,3,dOut)*(.25+.75*wN)*ridge*lobe-.9*(dOut/1.6)*Math.exp(1-dOut/1.6)); } }
    // 6 · one height field (CSS px): cloth relief + pucker − holes, threads on top → normals, cast shadow, cavity
    const clothH=new Float32Array(NP), Ht=new Float32Array(NP), base=hs*.6; let mx=-1e9, mn=1e9;
    for(let i=0;i<NP;i++){ const ch=(st?st.h[i]*hs:0)+PK[i]-HOLE[i]*R0*.45; clothH[i]=ch; const tH=TH[i]>=0?base+TH[i]:-1e9; const hv=Math.max(ch,tH); Ht[i]=hv; if(hv>mx) mx=hv; if(hv<mn) mn=hv; }
    const span=Math.max(1e-3,mx-mn), hn=new Float32Array(NP); for(let i=0;i<NP;i++) hn[i]=(Ht[i]-mn)/span;
    const occ=FX.hshadow(hn,W,H,dpr,span,FX.LIGHT,loft*R0*3+1,.3), cav=FX.blur(Ht,W,H,Math.max(1,Math.round(R0*.9*dpr))), N=FX.normals(Ht,W,H,dpr), shP=o.pull>0?FX.shade(PK,W,H,dpr,1,FX.LIGHT):null;
    // 7 · color + light
    const [lx,ly,lz]=FX.lightVec(), Hv=FX.halfVec(), sky=FX.sky(), yarn=FX.inkOf(o,'y'), pA=4+o.sheen*o.sheen*110, pC=2+o.sheen*6, Ks=.05+o.sheen*.8, fa=tw*.55, fc=Math.cos(fa), fsn=Math.sin(fa);
    const calb=baseAlb(st,x,W,H), clf=x.lf||(st?st.lf:null), lin=new Float32Array(NP*3), alb=new Float32Array(NP*3), ck=.8/Math.max(.2,loft*R0);
    for(let i=0,k=0;i<NP;i++,k+=3){ const a=A[i], cv=1-clamp((cav[i]-Ht[i])*ck,0,.6), oc=occ[i], hl=1-.5*HOLE[i];
      for(let q=0;q<3;q++){ const f=(clf?clf[k+q]:1)*(shP?shP[i]:1); lin[k+q]=calb[k+q]*hl*f*oc*cv; alb[k+q]=calb[k+q]*hl; }
      if(a<=0) continue;
      const nx=N.nx[i], ny=N.ny[i], nz=N.nz[i], id=TID[i], jt=(hash(id|0,7,s)-.5)*.06, cj=Math.cos(jt), sj=Math.sin(jt), ax=TX[i]*cj-TY[i]*sj, ay=TX[i]*sj+TY[i]*cj;
      // filament direction: the thread axis turned by the twist angle, made tangent to the surface
      let fx=ax*fc-ay*fsn, fy=ax*fsn+ay*fc, fz=0; const fn=fx*nx+fy*ny; fx-=fn*nx; fy-=fn*ny; fz=-fn*nz; const fl=Math.hypot(fx,fy,fz)||1; fx/=fl; fy/=fl; fz/=fl;
      const tH=fx*Hv[0]+fy*Hv[1]+fz*Hv[2], along=Math.pow(Math.max(0,1-tH*tH),pA*.5);
      const hA=Hv[0]*ax+Hv[1]*ay, px=Hv[0]-hA*ax, py=Hv[1]-hA*ay, pz=Hv[2], pl=Math.hypot(px,py,pz)||1, across=Math.pow(Math.max(0,(nx*px+ny*py+nz*pz)/pl),pC);
      const lamb=Math.max(0,nx*lx+ny*ly+nz*lz), dif=Math.min(1.35,(lamb+sky)/(lz+sky)), dl=1+(hash(id|0,9,s)-.5)*.1, sp=Ks*along*across*Math.sqrt(oc);
      for(let q=0;q<3;q++){ const yc=yarn.lin[q]*dl, tl=yc*(.2+.8*dif)*oc*cv+sp*(.3+.7*yc); lin[k+q]+=(tl-lin[k+q])*a; alb[k+q]+=(yc-alb[k+q])*a; } }
    return {alb,lf:clf,lin,ink:A,stock:Ht,mask:A,marks:nSt+nO,markUnit:'stitches'}; } };

/* ══════════ usages · compositions; each reads the live dials merged with its overrides ══════════ */
const onPage=(R,alpha,W,H,dpr,lift)=>{ const cs=FX.castShadow(alpha,W,H,dpr,FX.LIGHT,lift), lin=R.lin; for(let i=0,k=0;i<W*H;i++,k+=3){ const a=alpha[i], pg=1-cs[i]; lin[k]=lin[k]*a+pg*(1-a); lin[k+1]=lin[k+1]*a+pg*(1-a); lin[k+2]=lin[k+2]*a+pg*(1-a); } R.mask=alpha; return R; };
const LINEN={wL:.7,wC:.006,wh:250,fL:.77,fC:.005,fh:250,aMode:'flecks',accent:.006,warp:34,weft:32,mShape:'none',lift:0};

/* ── composition kit for usages ── */
const sub=(g,x0,y0,w,h,fn)=>{ g.save(); g.translate(x0,y0); fn(g,w,h); g.restore(); };
const strikes=(g,w,h,o)=>typewriter.clips.strikes(g,w,h,Object.assign(defaultsOf(typewriter),o));
const dieOf=(g,w,h,o)=>drawShape(g,w,h,Object.assign({shape:'compass',text:'',size:.9},o));
const typeAt=(g,text,x0,y0,size,{font='Archivo',weight=800,align='left',track=0,maxW=0}={})=>{ let fs=size; const f=()=>`${weight} ${fs}px ${font==='mono'?'"JetBrains Mono", ui-monospace, monospace':'Archivo, "Helvetica Neue", Arial, sans-serif'}`; g.font=f(); if(maxW){ const tw=g.measureText(text).width; if(tw>maxW){ fs*=maxW/tw; g.font=f(); } } if('letterSpacing' in g) g.letterSpacing=track+'px'; const tw=g.measureText(text).width; g.textBaseline='alphabetic'; g.fillText(text,align==='center'?x0-tw/2:align==='right'?x0-tw:x0,y0); if('letterSpacing' in g) g.letterSpacing='0px'; return fs; };
/* run steps in print order: each prints into the albedo and light the previous one left. Lin-only layers (foil, graphite sheen) are flagged top and composited last. */
function chain(steps,W,H,dpr,x){ let alb=null, lf=null, R=null; const tops=[];
  for(const s of steps){ const xx=Object.assign({S:x.S},s.x||{}); if(alb){ xx.alb=alb; xx.lf=lf; } R=s.fx.run(s.o,W,H,dpr,xx); if(s.top) tops.push({lin:R.lin,cov:R.ink}); else { alb=R.alb; lf=R.lf; } }
  const lin=alb?light(alb,lf,W,H):R.lin, ink=new Float32Array(W*H);
  for(const t of tops) for(let i=0,k=0;i<W*H;i++,k+=3){ const c=Math.min(1,t.cov[i]); if(c<=0) continue; lin[k]+=(t.lin[k]-lin[k])*c; lin[k+1]+=(t.lin[k+1]-lin[k+1])*c; lin[k+2]+=(t.lin[k+2]-lin[k+2])*c; ink[i]=Math.max(ink[i],c); }
  return Object.assign({},R,{lin,alb,lf,ink:R.ink}); }
const INK={ black:{iL:.2,iC:.006,ih:280}, red:{iL:.52,iC:.17,ih:27}, blue:{iL:.45,iC:.16,ih:262}, ember:{iL:.64,iC:.2,ih:40} };
const COLD={scale:4,oct:4,depth:.38,ease:['out',1.4],aniso:1.4,fibers:2,diffuse:.55,mShape:'none'};
const NEWS={paperL:.955,tL:.72,tC:.004,th:250,tAmt:.8,fibers:16,fDark:.05,fWidth:.5,pits:6,pDark:.06,depth:.1,mShape:'none'};
const DUCK={pattern:'basket',warp:40,weft:40,fill:.95,wL:.92,wC:.003,wh:250,fL:.88,fC:.003,fh:250,accent:0,hair:.5,depth:1.4,mShape:'none',lift:0};
const SHIRT={warp:60,weft:56,fill:.94,slub:.12,hair:.12,depth:.9,wL:.9,wC:.01,wh:250,fL:.95,fC:.004,fh:250,accent:0,mShape:'none',lift:0};
const DIEO={stock:'paper'}, TW={stock:'paper',impress:.35};
/* ── object kit: geometry, sampling, objects on objects ── */
const poly=(g,pts)=>{ g.beginPath(); pts.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b)); g.closePath(); g.fill(); };
const rrect=(g,x0,y0,w,h,r)=>{ g.beginPath(); g.moveTo(x0+r,y0); g.arcTo(x0+w,y0,x0+w,y0+h,r); g.arcTo(x0+w,y0+h,x0,y0+h,r); g.arcTo(x0,y0+h,x0,y0,r); g.arcTo(x0,y0,x0+w,y0,r); g.closePath(); };
const smp=(arr,u,v,W,H,dpr)=>arr[clamp((v*dpr)|0,0,H-1)*W+clamp((u*dpr)|0,0,W-1)];
const inPoly=(P,x,y)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const [xi,yi]=P[i],[xj,yj]=P[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c; };
const hull=(pts)=>{ const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]), cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]), lo=[], up=[];
  for(const q of p){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0) lo.pop(); lo.push(q); } for(let i=p.length-1;i>=0;i--){ const q=p[i]; while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0) up.pop(); up.push(q); } up.pop(); lo.pop(); return lo.concat(up); };
/* an object lying on another: its shadow (by the sheet light) darkens what is under it, outside itself, inside `within` */
const shadowOn=(lin,alpha,within,W,H,dpr,lift)=>{ const cs=FX.castShadow(alpha,W,H,dpr,FX.LIGHT,lift); for(let i=0,k=0;i<W*H;i++,k+=3){ const d=cs[i]*(within?within[i]:1); if(d<=0) continue; const f=1-d; lin[k]*=f; lin[k+1]*=f; lin[k+2]*=f; } };
/* a folded or curled region: a light-facing gradient across it (the surface turns away), crease highlight on the edge */
const foldShade=(lin,mask,W,H,amt)=>{ for(let i=0,k=0;i<W*H;i++,k+=3){ const m=mask[i]; if(m<=0) continue; const f=1-amt*m; lin[k]*=f; lin[k+1]*=f; lin[k+2]*=f; } };
/* objects on a page, bottom to top: each casts on everything already down, then lies on it */
const stack=(layers,W,H,dpr)=>{ const out=FX.ground(W,H,FX.WHITE), ink=new Float32Array(W*H); for(const L of layers){ shadowOn(out,L.alpha,null,W,H,dpr,L.lift||1); for(let i=0,k=0;i<W*H;i++,k+=3){ const a=L.alpha[i]; if(a<=0) continue; out[k]+=(L.lin[k]-out[k])*a; out[k+1]+=(L.lin[k+1]-out[k+1])*a; out[k+2]+=(L.lin[k+2]-out[k+2])*a; ink[i]=Math.max(ink[i],a); } } return {lin:out,ink,mask:ink,stock:null,marks:layers.length,markUnit:'objects'}; };
const SOLID={mShape:'none',edge:1.7,width:4,pressure:1,breakup:1,starve:.004,wick:.03,mottle:.05,bite:.4};
const inFrame=(g,cx,cy,rot,w,h,fn)=>{ g.save(); g.translate(cx,cy); g.rotate(rot); g.translate(-w/2,-h/2); fn(g,w,h); g.restore(); };
const pad=(a,b,n=32)=>{ const sp=Math.max(1,n-a.length-b.length); return a+' '.repeat(sp)+b; };


/* geometry shared by a usage's main-thread clips and its worker run */
const still=(w,h,z=1)=>{ const s=h*.2*z, cx=w*.32-(z-1)*w*.09, cy=h*.7+(z-1)*h*.3, ax=s*.866, ay=s*.5, F=[cx,cy], L=[cx-ax,cy-ay], R=[cx+ax,cy-ay], Ft=[cx,cy-s], Lt=[cx-ax,cy-ay-s], Rt=[cx+ax,cy-ay-s], Bt=[cx,cy-2*ay-s], Bb=[cx,cy-2*ay], sR=h*.17*z, scx=w*.66+(z-1)*w*.08, gy=cy-ay*.55;
  const nz=v=>{ const m=Math.hypot(...v); return v.map(c=>c/m); };
  return {s,F,L,R,Ft,Lt,Rt,Bt,Bb,left:[F,L,Lt,Ft],right:[F,R,Rt,Ft],top:[Ft,Lt,Bt,Rt],sR,scx,scy:gy-sR,gy,nL:nz([-.78,.12,.62]),nR:nz([.78,.12,.62]),nT:nz([0,-.82,.57])}; };
const cher=(a)=>{ const cx=a.x0+a.lw/2, cy=a.y0+a.lw*.6, r=a.lw*.1; return {cs:[[cx-r*1.05,cy+r*.35,r*1.02],[cx+r*.95,cy+r*.55,r*.95],[cx-r*.05,cy-r*.75,r*.92]],bx:cx+r*.3,by:cy-r*2.6,lx:cx+r*1.9,ly:cy-r*1.9,lr:r*1.6,la:-.62}; };
const meterGeo=(w,h)=>{ const x0=w*.06, x1=w*.94; return {x0,x1,bw:(x1-x0)/48,base:h*.8,top:h*.33,now:39,val:i=>clamp(.38+.26*Math.sin(i/48*TAU-1.25)+.14*Math.sin(i*.53+.4)+.07*Math.sin(i*1.7),.06,1)}; };
const BOOK={pattern:'plain',warp:72,weft:64,fill:.97,slub:.14,slubScale:9,hair:.18,irregular:.14,depth:.75,wL:.34,wC:.05,wh:176,fL:.3,fC:.045,fh:186,accent:0,dye:.016,wear:.04,mShape:'none',lift:0};
const WLABEL={pattern:'satin 5',warp:78,weft:60,fill:.98,slub:.04,hair:.06,irregular:.05,depth:.65,shadow:.5,wL:.17,wC:.006,wh:270,fL:.94,fC:.01,fh:85,accent:0,dye:.008,wear:0,mShape:'none',lift:0};

/* ── polish-c helpers ── */
/* a rounded cross-section (CSS px) from a coverage clip: wire, eyelet ring — radius R CSS px, read off the exact distance to the edge */
const c_dome=(clip,W,H,dpr,R)=>{ const d=FX.sdf(clip,W,H), h=new Float32Array(W*H), Rp=R*dpr; for(let i=0;i<W*H;i++){ const t=clamp(d[i]/Rp,0,1); h[i]=R*Math.sqrt(Math.max(0,1-(1-t)*(1-t))); } return h; };
/* polished metal: the sheet light's soft box seen in the mirror of each normal, a dim ceiling, a dark room, + a tight glint */
const c_metal=(hpx,cov,W,H,dpr,base,box=.9,shin=70)=>{ const N=FX.normals(hpx,W,H,dpr), LL=FX.LIGHT, ec=(LL.el+(90-LL.el)*.45)*PI/180, ea=LL.az*PI/180, bx=Math.cos(ea)*Math.cos(ec), by=Math.sin(ea)*Math.cos(ec), bz=Math.sin(ec), [lx,ly,lz]=FX.lightVec(), hl=Math.hypot(lx,ly,lz+1), out=new Float32Array(W*H*3);
  for(let i=0,k=0;i<W*H;i++,k+=3){ if(cov[i]<=0) continue; const nx=N.nx[i], ny=N.ny[i], nz=N.nz[i], rx=2*nz*nx, ry=2*nz*ny, rz=2*nz*nz-1, rl=rx*bx+ry*by+rz*bz;
    const env=sstep(box,box+.08,rl)*1.3+.2*Math.pow(clamp(rz,0,1),4)+.035, gl=Math.pow(Math.max(0,(nx*lx+ny*ly+nz*(lz+1))/hl),shin)*.9;
    for(let c=0;c<3;c++) out[k+c]=base[c]*env+gl*(.3+.7*base[c]); } return out; };
/* sewing thread: capsules [x0,y0,x1,y1] (CSS px) of radius R, with an S-twist ridge, ends diving into the cloth; Lambert under the sheet light.
   Returns lin, alpha and the needle holes (where the thread goes through) for the cloth beneath. */
const c_thread=(segs,W,H,dpr,col,R,tw=.2)=>{ const a=new Float32Array(W*H), hh=new Float32Array(W*H), hole=new Float32Array(W*H);
  for(const [x0,y0,x1,y1] of segs){ const dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1e-3, ux=dx/L, uy=dy/L, pad=R*1.6+2/dpr;
    const X0=Math.max(0,Math.floor((Math.min(x0,x1)-pad)*dpr)), X1=Math.min(W-1,Math.ceil((Math.max(x0,x1)+pad)*dpr)), Y0=Math.max(0,Math.floor((Math.min(y0,y1)-pad)*dpr)), Y1=Math.min(H-1,Math.ceil((Math.max(y0,y1)+pad)*dpr));
    for(let Y=Y0;Y<=Y1;Y++) for(let X=X0;X<=X1;X++){ const u=(X+.5)/dpr-x0, v=(Y+.5)/dpr-y0, t=u*ux+v*uy, s=-u*uy+v*ux, i=Y*W+X;
      for(const e of [0,L]){ const dh=Math.hypot(t-e,s)/(R*1.25); if(dh<1) hole[i]=Math.max(hole[i],1-dh*dh); }
      const tc=clamp(t,0,L), d=Math.hypot(t-tc,s), cov=clamp((R-d)*dpr+.5,0,1); if(cov<=0) continue;
      const pr=Math.sqrt(Math.max(0,1-(d/R)*(d/R))), dive=sstep(-R*.2,R*1.4,Math.min(t,L-t)), h=R*pr*(.25+.75*dive)*(1+tw*Math.sin(TAU*(t/(R*1.55)+s/(R*2.4))));
      if(cov>a[i]){ a[i]=cov; hh[i]=h; } } }
  const N=FX.normals(hh,W,H,dpr), [lx,ly,lz]=FX.lightVec(), lin=new Float32Array(W*H*3);
  for(let i=0,k=0;i<W*H;i++,k+=3){ if(a[i]<=0) continue; const lam=Math.max(0,N.nx[i]*lx+N.ny[i]*ly+N.nz[i]*lz), f=Math.min(1.35,.28+.72*lam/Math.max(.3,lz)); lin[k]=col[0]*f; lin[k+1]=col[1]*f; lin[k+2]=col[2]*f; }
  return {lin,a,hole}; };
/* lay a layer over a base, in place (linear light) */
const c_over=(out,lin,a)=>{ for(let i=0,k=0;i<a.length;i++,k+=3){ const m=a[i]; if(m<=0) continue; out[k]+=(lin[k]-out[k])*m; out[k+1]+=(lin[k+1]-out[k+1])*m; out[k+2]+=(lin[k+2]-out[k+2])*m; } return out; };
/* stock color: multiply a lit grey sheet by a dye (OKLab) — the ink printed on it is multiplied too, as a film on colored stock is */
const c_tint=(lin,L,C,h,ref=1)=>{ const t=FX.ink(L,C,h).lin; for(let k=0;k<lin.length;k+=3){ lin[k]*=t[0]/ref; lin[k+1]*=t[1]/ref; lin[k+2]*=t[2]/ref; } return lin; };
/* swatch card geometry (card-local CSS px; the card is a rotated frame bleeding off the right and bottom of the plate) */
const c_card=(w,h)=>{ const cw=w*1.06, ch=h*1.02; return {cx:w*.555, cy:h*.565, rot:-.016, cw, ch, hx:cw*.05, hy:ch*.115, hr:ch*.022, er:ch*.04,
  sx:i=>cw*(.088+i*.168), sw:cw*.146, sy:ch*.305, sh:ch*.4, ly:ch*.735, lh:ch*.17}; };
const C_DRAFTS=[['DENIM','3H TWILL','52 × 44'],['LINEN','PLAIN','34 × 32'],['SHIRTING','PLAIN','60 × 56'],['DUCK','BASKET','40 × 40'],['BOOKCLOTH','FILLED','72 × 64']];
const c_pinked=(g,x0,y0,w,h,t=3.1,a=2.2)=>{ g.beginPath(); let x=x0, y=y0; g.moveTo(x,y); for(let i=0;x<x0+w;i++){ x=Math.min(x0+w,x+t); g.lineTo(x,y-(i%2?0:a)); } for(let i=0;y<y0+h;i++){ y=Math.min(y0+h,y+t); g.lineTo(x0+w+(i%2?0:a),y); } for(let i=0;x>x0;i++){ x=Math.max(x0,x-t); g.lineTo(x,y0+h+(i%2?0:a)); } for(let i=0;y>y0;i++){ y=Math.max(y0,y-t); g.lineTo(x0-(i%2?0:a),y); } g.closePath(); g.fill(); };
const c_inCard=(g,w,h,fn)=>{ const k=c_card(w,h); inFrame(g,k.cx,k.cy,k.rot,k.cw,k.ch,(g,cw,ch)=>fn(g,cw,ch,k)); };
/* ── polish-b helpers ── */
/* riso poster · the image area of each drum: the sheet is fed a hair crooked, and the pink drum's master sits off the blue one */
const b_DRUM=(w,h,k)=>({x0:w*.05,y0:h*.038,x1:w*.95,y1:h*.9,cx:w*.5,cy:h*.47,rot:k?-.0035:.0025,ox:k?w*.011:0,oy:k?-h*.0055:0});
const b_inDrum=(g,w,h,k,fn,clip=true)=>{ const d=b_DRUM(w,h,k); g.save(); g.translate(d.cx+d.ox,d.cy+d.oy); g.rotate(d.rot); g.translate(-d.cx,-d.cy); if(clip){ g.beginPath(); g.rect(d.x0,d.y0,d.x1-d.x0,d.y1-d.y0); g.clip(); } fn(g,d); g.restore(); };
const b_toDrum=(u,v,d)=>{ const x=u-d.cx-d.ox, y=v-d.cy-d.oy, c=Math.cos(-d.rot), s=Math.sin(-d.rot); return [d.cx+x*c-y*s,d.cy+x*s+y*c]; };
/* the printer's furniture each drum carries: crop marks at the trim corners, register targets in the margins */
const b_marks=(g,d,w,h)=>{ const lw=Math.max(.85,w*.0019), gap=w*.007, L=w*.032; g.strokeStyle='#fff'; g.lineWidth=lw;
  [[d.x0,d.y0,-1,-1],[d.x1,d.y0,1,-1],[d.x0,d.y1,-1,1],[d.x1,d.y1,1,1]].forEach(([x,y,sx,sy])=>{ g.beginPath(); g.moveTo(x+sx*gap,y); g.lineTo(x+sx*(gap+L),y); g.moveTo(x,y+sy*gap); g.lineTo(x,y+sy*(gap+L)); g.stroke(); });
  const tgt=(x,y)=>{ const r=w*.0095, a=w*.018; g.beginPath(); g.arc(x,y,r,0,TAU); g.stroke(); g.beginPath(); g.moveTo(x-a,y); g.lineTo(x+a,y); g.moveTo(x,y-a); g.lineTo(x,y+a); g.stroke(); g.beginPath(); g.arc(x,y,r*.42,0,TAU); g.fill(); };
  tgt(d.x0*.5,d.cy); tgt(w-(w-d.x1)*.5,d.cy); tgt(d.cx,d.y0*.5); };

/* tickets · the fan, shared by the clips and the worker (the punched chad needs to know where the hole is) */
const b_TK=(w,h,k)=>{ const tw=w*.66; return Object.assign([{cx:w*.42,cy:h*.27,rot:-.13},{cx:w*.5,cy:h*.5,rot:.035},{cx:w*.58,cy:h*.74,rot:.15}][k],{w:tw,h:tw*.38}); };
const b_toWorld=(f,a,b)=>{ const x=a-f.w/2, y=b-f.h/2, c=Math.cos(f.rot), s=Math.sin(f.rot); return [f.cx+x*c-y*s,f.cy+x*s+y*c]; };
const b_PUNCH={a:.46,b:.56,r:.07}, b_CHAD={x:.2,y:.9,rot:2.1};

/* typewriter macro · one strike per glyph, laid out from a seed so the die (dent) and the ink (strike) land on the same spot.
   Each strike is a pressure PLANE across the glyph (the slug never meets the platen flat), plus key variance; a bounced key
   leaves a faint ghost; e and a carry gunk in their counters — old type fills in. */
const b_glyph=(()=>{ const cache=new Map(); return (ch,fs,dpr)=>{ const key=ch+'|'+fs.toFixed(3)+'|'+dpr; if(cache.has(key)) return cache.get(key);
  const S=Math.ceil(fs*1.4*dpr), pad=Math.round(fs*.2*dpr), c=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(S,S):Object.assign(document.createElement('canvas'),{width:S,height:S}), g=c.getContext('2d',{willReadFrequently:true});
  g.font=`400 ${fs*dpr}px "Courier Prime", "JetBrains Mono", monospace`; g.textBaseline='alphabetic'; g.fillStyle='#fff'; const by=Math.round(S-fs*.42*dpr); g.fillText(ch,pad,by);
  const d=g.getImageData(0,0,S,S).data, N=S*S, ins=new Uint8Array(N); for(let i=0;i<N;i++) ins[i]=d[i*4+3]>110?1:0;
  // exterior = flood from the border through non-glyph pixels; counters = what is left
  const ext=new Uint8Array(N), q=new Int32Array(N); let qh=0, qt=0; const push=i=>{ if(!ins[i]&&!ext[i]){ ext[i]=1; q[qt++]=i; } };
  for(let x=0;x<S;x++){ push(x); push((S-1)*S+x); } for(let y=0;y<S;y++){ push(y*S); push(y*S+S-1); }
  while(qh<qt){ const i=q[qh++], x=i%S; if(x>0) push(i-1); if(x<S-1) push(i+1); if(i>=S) push(i-S); if(i<N-S) push(i+S); }
  // distance from the glyph wall into the counter (chamfer), in device px
  const dist=new Float32Array(N).fill(1e9); for(let i=0;i<N;i++) if(ins[i]) dist[i]=0;
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const i=y*S+x; if(x>0) dist[i]=Math.min(dist[i],dist[i-1]+1); if(y>0) dist[i]=Math.min(dist[i],dist[i-S]+1); if(x>0&&y>0) dist[i]=Math.min(dist[i],dist[i-S-1]+1.414); if(x<S-1&&y>0) dist[i]=Math.min(dist[i],dist[i-S+1]+1.414); }
  for(let y=S-1;y>=0;y--) for(let x=S-1;x>=0;x--){ const i=y*S+x; if(x<S-1) dist[i]=Math.min(dist[i],dist[i+1]+1); if(y<S-1) dist[i]=Math.min(dist[i],dist[i+S]+1); if(x<S-1&&y<S-1) dist[i]=Math.min(dist[i],dist[i+S+1]+1.414); if(x>0&&y<S-1) dist[i]=Math.min(dist[i],dist[i+S-1]+1.414); }
  const out={S,pad,by,ins,ext,dist}; cache.set(key,out); return out; }; })();
const b_gunk=(ch,fs,dpr,amt,seed)=>{ const G_=b_glyph(ch,fs,dpr), S=G_.S, c=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(S,S):Object.assign(document.createElement('canvas'),{width:S,height:S}), g=c.getContext('2d'), img=g.createImageData(S,S), d=img.data;
  let ymin=S, ymax=0; for(let i=0;i<S*S;i++) if(!G_.ins[i]&&!G_.ext[i]){ const y=(i/S)|0; if(y<ymin) ymin=y; if(y>ymax) ymax=y; }
  for(let i=0;i<S*S;i++){ if(G_.ins[i]||G_.ext[i]) continue; const x=i%S, y=(i/S)|0, t=(y-ymin)/Math.max(1,ymax-ymin);
    // gunk packs into the counter from its walls, deepest at the bottom of the eye and in the corners; its edge is a crisp blob
    const n=FX.fbm(x/(fs*dpr*.07),y/(fs*dpr*.07),seed,3,.55), reach=fs*dpr*amt*(.35+.9*t*t+.9*(n-.5));
    const a=clamp(reach-G_.dist[i]+.5,0,1); d[i*4]=d[i*4+1]=d[i*4+2]=255; d[i*4+3]=Math.round(a*255); }
  g.putImageData(img,0,0); return {c,G:G_}; };
const b_type=(g,w,h,o,mode)=>{ const R=FX.rng(o.seed), fs=o.fs; g.font=`400 ${fs}px "Courier Prime", "JetBrains Mono", monospace`; g.textBaseline='alphabetic'; const cw=g.measureText('M').width, dpr=o.dpr; let y=o.y0;
  for(const ln of o.lines){ let xx=o.x0; for(const ch of ln){ const r=[R(),R(),R(),R(),R(),R(),R()]; if(ch!==' '){
      const dx=(r[0]-.5)*o.jx*fs, dy=(r[1]-.5)*o.jy*fs, rot=(r[2]-.5)*o.rot*PI/180, p=1-o.vari*r[3], ang=(o.tAng+(r[4]-.5)*o.tSpread)*PI/180, ca=Math.cos(ang), sa=Math.sin(ang);
      g.save(); g.translate(xx+dx+cw/2,y+dy-fs*.3); g.rotate(rot); g.translate(-cw/2,fs*.3);
      const fill=(alpha)=>{ if(mode==='die'){ g.fillStyle='#fff'; return; } const gr=g.createLinearGradient(cw/2-ca*fs*.42,-fs*.3-sa*fs*.42,cw/2+ca*fs*.42,-fs*.3+sa*fs*.42); gr.addColorStop(0,`rgba(255,255,255,${(alpha*(1-o.tilt)).toFixed(3)})`); gr.addColorStop(1,`rgba(255,255,255,${alpha.toFixed(3)})`); g.fillStyle=gr; };
      if(o.bounce&&o.bounce.includes(ch)&&mode!=='die'){ fill(p*.42); g.fillText(ch,fs*.085,-fs*.02); }
      fill(p); g.fillText(ch,0,0);
      if(o.gunk&&'ea'.includes(ch)&&r[5]<o.gunk.p){ const Gk=b_gunk(ch,fs,dpr,o.gunk.amt*(ch==='e'?.5:1)*(.7+.5*r[6]),o.seed+ch.charCodeAt(0)+((r[6]*97)|0)); g.globalAlpha=mode==='die'?1:Math.min(1,p*1.1); g.drawImage(Gk.c,-Gk.G.pad/dpr,-Gk.G.by/dpr,Gk.G.S/dpr,Gk.G.S/dpr); g.globalAlpha=1; }
      g.restore(); } xx+=cw; } y+=o.lead*fs; } };
const b_TM=(w,h,dpr)=>({lines:['Dear','reader,'],fs:w*.44,x0:-w*.12,y0:h*.415,lead:1.13,seed:17,dpr,jx:.012,jy:.014,rot:1.4,vari:.24,tilt:.36,tAng:95,tSpread:90,bounce:'D',gunk:{p:.85,amt:.12}});
/* a woven ribbon's transfer: plain-weave threads (crowns carry ink, interstices carry little), laid a few degrees off the line */
const b_ribbon=(u,v,pitch,ang,s)=>{ const c=Math.cos(ang), sn=Math.sin(ang), x=(u*c+v*sn)/pitch, y=(-u*sn+v*c)/pitch, ix=Math.floor(x), iy=Math.floor(y);
  // threads are not a grid: each sits a little off its pitch, has its own width, slubs along its length and carries its own load of ink
  const oy=(hash(iy,3,s)-.5)*.16, ox=(hash(ix,5,s)-.5)*.16, fx=x-ix-.5-ox, fy=y-iy-.5-oy;
  const hwH=.36+.1*hash(iy,7,s)+.06*(FX.vnoise(x*.35,iy*3.1,s)-.5), hwV=.33+.1*hash(ix,11,s)+.06*(FX.vnoise(ix*2.7,y*.35,s+1)-.5), warpTop=((ix+iy)&1)===0, cr=(t,hw)=>{ const k=t/hw; return k*k>=1?0:Math.sqrt(1-k*k); };
  const cH=cr(fy,hwH)*(.5+.5*Math.cos(PI*fx)), cV=cr(fx,hwV)*(.5+.5*Math.cos(PI*fy)), top=warpTop?cH:cV, und=(warpTop?cV:cH)*.5;
  return clamp(Math.max(top,und)*(.75+.5*hash(warpTop?iy:ix,warpTop?13:17,s)),0,1); };
/* the strike itself, from FX-07's chain: pressure map in, film squashed toward the face's edge, printed into the stock by percentile */
const b_strikeFx=(Pk,face)=>({run:(o,W,H,dpr,x)=>{ const st=stockFor(o,x,W,H,dpr), edge=FX.blur(face,W,H,.8*dpr), tm=new Float32Array(W*H).fill(1); for(let i=0;i<W*H;i++) if(face[i]>0) tm[i]=1+o.squash*clamp((face[i]-edge[i])*3,0,1);
  const ink=FX.inkOf(o,'i'), alb=baseAlb(st,x,W,H), A=new Float32Array(W*H), n=inkChain(Pk,st,o,ink,alb,A,W,H,dpr,o.seed|0,o.mix,0,1,tm), lf=x.lf||(st?st.lf:null);
  return {alb,lf,lin:light(alb,lf,W,H),ink:A,stock:st?st.h:null,mask:face,marks:n,markUnit:'inked px'}; }});

/* sketch · ground projection for a sheet-light drawing: screen y = horizon + depth·f − height */
const b_F=.32, b_Z=1.15;
/* FX-05's own chain driven by a drawn line instead of its hatch: the line's AA coverage is the edge, its spread is the pressure,
   the tooth decides where the lead touches, and the deposit gleams toward the light */
const b_pencil=cov=>({run:(o,W,H,dpr,x)=>{ const st=stockFor(o,x,W,H,dpr), Pp=FX.blur(cov,W,H,Math.max(1,Math.round(o.lead*dpr*.8))); for(let i=0;i<W*H;i++) Pp[i]=Math.min(1,Pp[i]*1.8)*o.pressure;
  const gi=FX.inkOf(o,'g'), alb=baseAlb(st,x,W,H), A=new Float32Array(W*H); inkChain(Pp,st,o,gi,alb,A,W,H,dpr,o.seed|0,'oklab',0,1,null,{cov,band:.16});
  const hs=stockH(st,x.S), hpx=new Float32Array(W*H); for(let i=0;i<W*H;i++) hpx[i]=(st?st.h[i]*hs:0)+A[i]*o.burnish*FX.vnoise((i%W)/dpr*.9,((i/W)|0)/dpr*.12,(o.seed|0)+9);
  const N=FX.normals(hpx,W,H,dpr), [hx,hy,hz]=FX.halfVec(), lz_=FX.lightVec()[2], lf=x.lf||(st?st.lf:null), lin=light(alb,lf,W,H);
  for(let i=0,k=0;i<W*H;i++,k+=3){ const a=A[i]; if(a<=0) continue; const nh=Math.max(0,N.nx[i]*hx+N.ny[i]*hy+N.nz[i]*hz), sp=o.sheen*Math.min(1,a)*(.16*(1-lz_)+.9*Math.pow(nh,o.shin)); lin[k]+=sp; lin[k+1]+=sp; lin[k+2]+=sp*1.02; }
  return {alb,lf,lin,ink:A,stock:hpx,mask:cov,marks:0,markUnit:'lines'}; }});
const b_cap=(W,H,dpr,segs,lw)=>{ const out=new Float32Array(W*H), r=lw*dpr/2; for(const [x0,y0,x1,y1,a=1] of segs){ const X0=x0*dpr,Y0=y0*dpr,X1=x1*dpr,Y1=y1*dpr, dx=X1-X0, dy=Y1-Y0, L2=dx*dx+dy*dy||1;
    const bx0=Math.max(0,Math.floor(Math.min(X0,X1)-r-2)), bx1=Math.min(W-1,Math.ceil(Math.max(X0,X1)+r+2)), by0=Math.max(0,Math.floor(Math.min(Y0,Y1)-r-2)), by1=Math.min(H-1,Math.ceil(Math.max(Y0,Y1)+r+2));
    for(let y=by0;y<=by1;y++) for(let x=bx0;x<=bx1;x++){ const t=clamp(((x-X0)*dx+(y-Y0)*dy)/L2,0,1), d=Math.hypot(x-X0-dx*t,y-Y0-dy*t), c=clamp(r-d+.5,0,1)*a; const i=y*W+x; if(c>out[i]) out[i]=c; } } return out; };
/* sun print · the sheet pinned to the shop wall; a ginkgo sprig on it. Leaf tissue lets a little UV through, the veins none */
const b_SP=(w,h)=>({cx:w*.535,cy:h*.545,rot:-.006,sw:w,sh:h*1.03,px:w*.077,py:h*.05,pr:w*.021});
const b_fan=(g,x0,y0,a,r,pl,R)=>{ const bx=x0+Math.cos(a)*pl, by=y0+Math.sin(a)*pl, bend=(R()-.5)*pl*.18;
  g.globalAlpha=1; g.lineCap='round'; g.lineWidth=Math.max(.9,r*.032); g.beginPath(); g.moveTo(x0,y0); g.quadraticCurveTo((x0+bx)/2-Math.sin(a)*bend,(y0+by)/2+Math.cos(a)*bend,bx,by); g.stroke();
  const span=.82+R()*.3, notch=.1+R()*.22, ph=R()*TAU, sk=(R()-.5)*.12, N=120, edge=t=>{ const an=a+sk+t*span, rr=r*(1-notch*Math.exp(-Math.pow(t/.06,2)))*(1+.022*Math.sin(t*27+ph)+.016*Math.sin(t*53+ph*2))*(1-.2*Math.pow(Math.abs(t),3)); return [bx+Math.cos(an)*rr,by+Math.sin(an)*rr,an,rr]; };
  // the blade: a fan wedge whose sides pinch in toward the petiole (cuneate base)
  g.globalAlpha=.9; g.beginPath(); g.moveTo(bx,by); const sideIn=(t)=>{ const [ex,ey]=edge(t), mx=bx+(ex-bx)*.45, my=by+(ey-by)*.45, c=-t*.09*r; return [mx+Math.cos(a+sk+PI/2)*c,my+Math.sin(a+sk+PI/2)*c]; };
  { const [qx,qy]=sideIn(-1), [ex,ey]=edge(-1); g.quadraticCurveTo(qx,qy,ex,ey); } for(let i=1;i<=N;i++){ const [ex,ey]=edge(i/N*2-1); g.lineTo(ex,ey); } { const [qx,qy]=sideIn(1); g.quadraticCurveTo(qx,qy,bx,by); } g.fill();
  // dichotomous veins: they fork as they fan, so the count doubles toward the margin; dense tissue, no UV
  g.globalAlpha=.965; g.lineWidth=Math.max(.42,r*.005); for(let k=0;k<46;k++){ const t=(k+.5)/46*2-1, [ex,ey]=edge(t*.985), st_=k%8===0?.04:k%4===0?.22:k%2===0?.42:.62, x1=bx+(ex-bx)*st_, y1=by+(ey-by)*st_; g.beginPath(); g.moveTo(x1,y1); g.lineTo(bx+(ex-bx)*.965,by+(ey-by)*.965); g.stroke(); } };
const b_ginkgo=(g,w,h)=>{ const R=FX.rng(23), A=[w*.2,h*1.04], Cc=[w*.3,h*.52], B=[w*.74,h*.1];
  g.globalAlpha=1; e_ribbon(g,A,Cc,B,w*.022,w*.006,60);
  // leaves come in clusters on short spurs along the shoot
  [[.16,5,-1],[.38,4,1],[.58,4,-1],[.78,3,1],[.97,3,0]].forEach(([t,n,side])=>{ const p=e_q(A,Cc,B,t), d=e_qt(A,Cc,B,t), na=Math.atan2(d[1],d[0]), sx=p[0]-d[1]*side*w*.025, sy=p[1]+d[0]*side*w*.025;
    g.lineWidth=w*.009; g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(sx,sy); g.stroke();
    for(let k=0;k<n;k++){ const a=na+(side||(k%2?1:-1))*(.5+k*.55)+(R()-.5)*.35-(side?0:.0); b_fan(g,sx,sy,a,w*(.125+R()*.05)*(1-t*.25),w*(.075+R()*.05),R); } }); };
/* pencil lettering: each glyph set by hand — its own tilt, baseline and size, the line drifting a little */
const b_hand=(g,text,x,y,fs,seed)=>{ const R=FX.rng(seed); let xx=x, dy=0; for(const ch of text){ g.font=`500 ${fs*(.94+R()*.12)}px Archivo, "Helvetica Neue", Arial, sans-serif`; const cw=g.measureText(ch).width; dy+=(R()-.5)*fs*.05; g.save(); g.translate(xx,y+dy+(R()-.5)*fs*.06); g.rotate((R()-.5)*.09+.02); g.fillText(ch,0,0); g.restore(); xx+=cw*(1+(R()-.5)*.08)+fs*.02; } };
/* a map pin's head: a lacquered sphere, lit by the sheet light (Lambert + one glint); its contact shadow is the caller's */
const b_pin=(W,H,dpr,cx,cy,r,col)=>{ const a=new Float32Array(W*H), lin=new Float32Array(W*H*3), [lx,ly,lz]=FX.lightVec(), [hx,hy,hz]=FX.halfVec(), sky=FX.sky();
  for(let y=Math.max(0,Math.floor((cy-r-1)*dpr));y<Math.min(H,Math.ceil((cy+r+1)*dpr));y++) for(let X=Math.max(0,Math.floor((cx-r-1)*dpr));X<Math.min(W,Math.ceil((cx+r+1)*dpr));X++){ const i=y*W+X, u=((X+.5)/dpr-cx)/r, v=((y+.5)/dpr-cy)/r, d=Math.hypot(u,v), c=clamp((1-d)*r*dpr+.5,0,1); if(c<=0) continue;
    const q=Math.min(d,.999), nz=Math.sqrt(1-q*q), nx=u, ny=v, lam=Math.max(0,nx*lx+ny*ly+nz*lz), f=(lam+sky*.6)/(lz+sky*.6), sp=Math.pow(Math.max(0,nx*hx+ny*hy+nz*hz),90)*1.6+.04*Math.pow(1-nz,3);
    a[i]=c; for(let k=0;k<3;k++) lin[i*3+k]=col[k]*f*.92+sp; } return {a,lin}; };

/* ex libris · a plate rastered into white board on the laser bed; cut round at an offset, held in the sheet by four tabs */
const b_XL=(w,h)=>{ const pw=w*1.3, ph=h*1.42, x0=w*.09, y0=h*.075; return {x0,y0,pw,ph,u:pw/100,mx:x0+pw*.42,my:y0+ph*.42}; }; // a macro on the plate's top-left: it runs off the right and the bottom
const b_tree=(g,x,y,a,L,wd,dep,R,mw)=>{ const x1=x+Math.cos(a)*L, y1=y+Math.sin(a)*L; e_ribbon(g,[x,y],[(x+x1)/2+(R()-.5)*L*.12,(y+y1)/2+(R()-.5)*L*.12],[x1,y1],wd,wd*.62,12);
  if(dep<=0||wd*.62<mw) return; const n=dep>5?2:R()<.55?2:3; for(let k=0;k<n;k++){ const da=(k/(n-1||1)-.5)*(.95+R()*.35)+(R()-.5)*.25; b_tree(g,x1,y1,a+da,L*(.72+R()*.12),Math.max(mw,wd*.66),dep-1,R,mw); } };
const b_plate=(g,w,h,part)=>{ const q=b_XL(w,h), u=q.u, R=FX.rng(31), mx=q.mx, my=q.my, mr=u*29;
  if(part==='tone'){ g.beginPath(); g.arc(mx,my,mr,0,TAU); g.fill(); return; }
  if(part==='blank'){ g.fillRect(q.x0,q.y0,q.pw,q.ph); return; }
  g.lineWidth=u*1.1; g.strokeRect(q.x0+u*.55,q.y0+u*.55,q.pw-u*1.1,q.ph-u*1.1); g.lineWidth=u*.5; g.strokeRect(q.x0+u*3,q.y0+u*3,q.pw-u*6,q.ph-u*6);
  [[q.x0+u*3,q.y0+u*3]].forEach(([x,y])=>poly(g,[[x,y-u*2],[x+u*2,y],[x,y+u*2],[x-u*2,y]]));
  typeAt(g,'EX LIBRIS',q.x0+u*9.5,q.y0+u*15,u*7,{track:u*1.3});
  typeAt(g,'No. 0147',w*.93,q.y0+u*23.4,u*2.9,{align:'right',font:'mono',weight:700,track:u*.35});
  g.fillRect(q.x0+u*9.5,q.y0+u*18.2,w*.93-q.x0-u*9.5,u*.5);
  // the owner, set up the left margin
  g.save(); g.translate(q.x0+u*8.6,my+mr*1.05); g.rotate(-PI/2); typeAt(g,'LARCHMERE READING ROOM',0,0,u*3,{font:'mono',weight:700,track:u*1.05}); g.restore();
  g.beginPath(); g.arc(mx,my,mr+u*1.5,0,TAU); g.arc(mx,my,mr+u*.9,0,TAU,true); g.fill('evenodd');
  // the ash: a winter tree, every twig tapering and none finer than the beam can hold, rooted on a ground line inside the medallion
  g.save(); g.beginPath(); g.arc(mx,my,mr-u*.2,0,TAU); g.clip(); const gy=my+mr*.6; g.fillRect(mx-mr,gy,mr*2,mr); b_tree(g,mx,gy+u*.5,-PI/2,mr*.34,u*2.9,8,R,1.5);
  for(let k=0;k<44;k++){ const x=mx-mr+mr*2*(k+R()*.8)/44, hh=u*(.45+R()*1); g.beginPath(); g.moveTo(x-u*.3,gy+.2); g.lineTo(x+(R()-.5)*u*.8,gy-hh); g.lineTo(x+u*.3,gy+.2); g.fill(); } g.restore(); };

/* record sleeve · matte black board; the grooves are spot UV, the type is one white ink */
const b_SL=(w,h)=>({cx:w*.565,cy:h*.44,rot:-.028,s:w*1.04});
const b_sleeve=(g,w,h,part)=>{ const q=b_SL(w,h); inFrame(g,q.cx,q.cy,q.rot,q.s,q.s,(g,s)=>{
  if(part==='board'){ g.fillRect(0,0,s,s); return; }
  if(part==='uv'){ const cx=s*.6, cy=s*.44, g0=s*.0028; let r=s*.165; const tracks=[16,24,11,30,19,34,14,26,22]; g.save(); g.beginPath(); g.rect(0,0,s,s); g.clip(); g.lineWidth=g0*.5;
    for(const n of tracks){ for(let k=0;k<n;k++){ g.beginPath(); g.arc(cx,cy,r,0,TAU); g.stroke(); r+=g0; } r+=g0*1.9; }
    g.beginPath(); g.arc(cx,cy,s*.12,0,TAU); g.arc(cx,cy,s*.112,0,TAU,true); g.fill('evenodd'); g.restore(); return; }
  const m=s*.06; typeAt(g,'HARBOR STATIC',m,s*.86,s*.052,{track:s*.002}); typeAt(g,'Night Ferry',m,s*.905,s*.04,{weight:400});
  typeAt(g,'PALE MERIDIAN · PMR 014',s*.88,s*.868,s*.021,{align:'right',font:'mono',weight:600,track:s*.002}); typeAt(g,'33 1/3 RPM · STEREO',s*.88,s*.905,s*.021,{align:'right',font:'mono',weight:600,track:s*.002}); }); };
/* ── polish-a helpers ── */
/* objects stacked on a given ground (a desk cloth, a liner) instead of the white page */
const a_stackOn=(ground,layers,W,H,dpr)=>{ const out=ground, ink=new Float32Array(W*H); for(const L of layers){ shadowOn(out,L.alpha,null,W,H,dpr,L.lift||1); for(let i=0,k=0;i<W*H;i++,k+=3){ const a=L.alpha[i]; if(a<=0) continue; out[k]+=(L.lin[k]-out[k])*a; out[k+1]+=(L.lin[k+1]-out[k+1])*a; out[k+2]+=(L.lin[k+2]-out[k+2])*a; ink[i]=Math.max(ink[i],a); } } return {lin:out,ink,mask:ink,stock:null,marks:layers.length,markUnit:'objects'}; };
/* a dyed stock: the bare paper albedo × a linear-light dye (toned cotton, colored board) */
const a_dyed=(st,rgb)=>{ const a=Float32Array.from(st.alb); for(let k=0;k<a.length;k+=3){ a[k]*=rgb[0]; a[k+1]*=rgb[1]; a[k+2]*=rgb[2]; } return a; };
const a_lab=(L,C,hd)=>{ const o=[0,0,0]; FX.lab2lin(L,C*Math.cos(hd*PI/180),C*Math.sin(hd*PI/180),o); return o.map(v=>clamp(v,0,1)); };
/* the sheet light falls off across the frame, away from the window it comes from (a real raking light is never even) */
const a_falloff=(lin,W,H,dpr,amt,lo=0)=>{ const [lx,ly]=FX.lightVec(), pl=Math.hypot(lx,ly)||1, ux=lx/pl, uy=ly/pl, w=W/dpr, h=H/dpr, ext=Math.abs(w*ux)+Math.abs(h*uy);
  for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const t=clamp(((X/dpr-w/2)*ux+(y/dpr-h/2)*uy)/ext+.5,0,1), f=lerp(1-amt,1,Math.pow(t,1.3))*(1-lo)+lo, k=(y*W+X)*3; lin[k]*=f; lin[k+1]*=f; lin[k+2]*=f; } return lin; };
/* a scalloped notary rosette */
const a_rosette=(g,cx,cy,R,n=32,dep=.07)=>{ g.beginPath(); for(let i=0;i<=n*8;i++){ const a=i/(n*8)*TAU, r=R*(1-dep+dep*Math.abs(Math.cos(a*n/2))); i?g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); } g.closePath(); };
/* sticker sheet geometry: the hero disc, its fold line (normal n through P0), three small dots */
const a_stk=(w,h)=>{ const R=w*.4, cx=w*.47, cy=h*.455, th=38*PI/180, n=[Math.cos(th),Math.sin(th)], d=R*.47; return {R,cx,cy,n,P0:[cx+n[0]*d,cy+n[1]*d],dots:[[w*.12,h*.885,w*.055],[w*.255,h*.885,w*.055],[w*.39,h*.885,w*.055]]}; };
/* 24 h dial: 48 bins from the inner ring r0 to the outer r1, midnight at the top, clockwise */
const a_dial=(w,h)=>{ const cx=w*.29, cy=h*.5, r1=h*.35, r0=h*.11, val=i=>clamp(.52-.34*Math.cos(TAU*(i-6)/48)+.09*Math.sin(i*.9+.4)+.05*Math.sin(i*2.3),.08,.97), V=[...Array(48)].map((_,i)=>val(i)), lo=V.indexOf(Math.min(...V)), hi=V.indexOf(Math.max(...V)), hm=i=>String(i>>1).padStart(2,'0')+(i&1?':30':':00');
  return {cx,cy,r0,r1,now:39,val,lo,hi,hm,fmt:i=>val(i).toFixed(2),ang:i=>i/48*TAU-PI/2}; };
/* figure: café visitors per day, 2025 and 2026 (a terrace opens 12 May) — t ∈ 0..1 across the year */
const a_fig=(w,h)=>{ const x0=w*.1, x1=w*.9, base=h*.86, top=h*.36, sg=(t,c,s_)=>Math.exp(-((t-c)/s_)*((t-c)/s_));
  const d=t=>{ const y25=205+165*sg(t,.56,.2)+16*Math.sin(t*TAU*6.5+.7)+9*Math.sin(t*TAU*17+.3); return [y25,y25+105*sstep(.355,.43,t)*sg(t,.6,.3)+11*Math.sin(t*TAU*9+2)*sstep(.355,.43,t)]; };
  return {x0,x1,base,top,d,t:X=>clamp((X-x0)/(x1-x0),0,1),Y:v=>base-(base-top)*v/600,xa:x0+(x1-x0)*.36}; };
const a_mark=(g,cx,cy,d)=>sub(g,cx-d/2,cy-d/2,d,d,(g,a,b)=>dieOf(g,a,b,{size:1}));

const usages=[
  /* ═══ stationery & brand ═══ */
  { id:'u-suite', job:'brand', title:'Stationery suite · on charcoal linen', sub:'Letterhead, envelope and two cards laid on a dark linen desk under a low window light. The letterhead has a large blind ø and a typed letter. The envelope flaps are separate plies that cast hairline shadows, closed by a red scalloped seal. The card is gold foil, run past the trim.', uses:['fx-06-deboss','fx-07-typewriter','fx-08-foil','fx-03-paper-tooth','fx-04-weave'], aspect:'16/9', span:2, light:{az:48,el:30},
    overrides:{'fx-03-paper-tooth':{depth:.025,aniso:1.5,form:.1,mShape:'none'},'fx-06-deboss':{depth:.85,soft:.8,lip:.12,stock:'paper',shadow:.9},'fx-07-typewriter':{stock:'paper',impress:.32,exhaust:.1,vari:.24},'fx-08-foil':{stock:'paper',crush:.9,grain:.022,box:40,cam:.32,shin:160,mirror:1.15,starve:0,flash:.06,fL:.68,fC:.13,fh:76},
      'fx-04-weave':Object.assign({},LINEN,{pattern:'twill 2/1',warp:36,weft:32,fill:.96,slub:.35,hair:.35,irregular:.2,depth:.6,shadow:.35,wL:.27,wC:.008,wh:250,fL:.235,fC:.01,fh:70,dye:.025,accent:0,wear:0})},
    clips:(()=>{ const LH=(w,h)=>{ const hS=h*1.34; return {cx:w*.265,cy:h*.7,w:hS*.707,h:hS,rot:-.055}; }, EV=(w,h)=>{ const ew=w*.5; return {cx:w*.735,cy:h*.27,w:ew,h:ew*.5,rot:.065}; },
        CD=(w,h)=>{ const cw=w*.3; return {cx:w*.6,cy:h*.7,w:cw,h:cw*.58,rot:-.115}; }, C2=(w,h)=>{ const cw=w*.3; return {cx:w*.632,cy:h*.745,w:cw,h:cw*.58,rot:.035}; };
      const at=(Fr,fn)=>(g,w,h)=>{ const f=Fr(w,h); inFrame(g,f.cx,f.cy,f.rot,f.w,f.h,fn); };
      return {
      lhA:at(LH,(g,a,b)=>g.fillRect(0,0,a,b)), lhDie:at(LH,(g,a,b)=>a_mark(g,a*.8,a*.1,a*.62)),
      lhType:at(LH,(g,a,b)=>sub(g,a*.09,a*.35,a*.86,b*.4,(g,c,d)=>strikes(g,c,d,{text:'24 October 2026 / / Dear printer, / / Proofs approved. Run the letter- / head blind on 300 g cotton, the / seal in red, the cards in gold. / / — ø co., New York',fsize:a*.038,lead:1.55,align:'left',seed:12}))),
      evA:at(EV,(g,a,b)=>g.fillRect(0,0,a,b)),
      evBot:at(EV,(g,a,b)=>poly(g,[[0,b],[a*.5,b*.36],[a,b]])),
      evTop:at(EV,(g,a,b)=>{ g.beginPath(); g.moveTo(0,0); g.lineTo(a,0); g.lineTo(a*.53,b*.6); g.quadraticCurveTo(a*.5,b*.63,a*.47,b*.6); g.closePath(); g.fill(); }),
      evSeal:at(EV,(g,a,b)=>{ const R=b*.2, cx=a*.5, cy=b*.6; a_rosette(g,cx,cy,R,30,.06); g.save(); g.clip(); g.fillRect(0,0,a,b); g.globalCompositeOperation='destination-out'; g.lineWidth=R*.035; g.strokeStyle='#000'; g.beginPath(); g.arc(cx,cy,R*.8,0,TAU); g.stroke(); a_mark(g,cx,cy,R*1.05); g.restore(); }),
      cdA:at(CD,(g,a,b)=>{ rrect(g,0,0,a,b,1); g.fill(); }), c2A:at(C2,(g,a,b)=>{ rrect(g,0,0,a,b,1); g.fill(); }),
      cdFoil:at(CD,(g,a,b)=>a_mark(g,a*.8,b*.62,b*1.12)),
      cdName:at(CD,(g,a,b)=>{ typeAt(g,'Impøssible',a*.075,b*.26,b*.135,{track:-.3}); typeAt(g,'Outcomes',a*.075,b*.41,b*.135,{track:-.3}); }),
      cdLine:at(CD,(g,a,b)=>sub(g,a*.075,b*.7,a*.5,b*.2,(g,c,d)=>strikes(g,c,d,{text:'ø co. / New York',fsize:b*.115,lead:1.45,align:'left',seed:4,exhaust:0}))) }; })(),
    run(P,W,H,dpr,x){ const C=x.clips, D=P('fx-06-deboss'), T=P('fx-07-typewriter'), Fo=P('fx-08-foil'), Sv=k=>Object.assign({},x.S,{[TOOTH]:Object.assign({},x.S[TOOTH],{seed:21+k*13})});
      const desk=weave.run(Object.assign({},P('fx-04-weave'),{mShape:'none',lift:0}),W,H,dpr,{S:x.S}).lin;
      const lh=chain([{fx:deboss,o:Object.assign({},D,{depth:.95,soft:.35,lip:.04,shadow:.5}),x:{S:Sv(0),clips:{die:C.lhDie}}},{fx:typewriter,o:T,x:{S:Sv(0),clips:{strikes:C.lhType}}}],W,H,dpr,{S:Sv(0)});
      const ev=chain([{fx:deboss,o:Object.assign({},D,{shape:'seal',depth:.75,soft:.7,lip:.08,ink:.95,iL:.47,iC:.17,ih:25}),x:{S:Sv(1),clips:{die:C.evSeal}}}],W,H,dpr,{S:Sv(1)});
      const cd=chain([{fx:deboss,o:Object.assign({},D,{depth:.5,soft:.45,lip:.06,ink:1,iL:.19,iC:.006,ih:280}),x:{S:Sv(2),clips:{die:C.cdName}}},{fx:typewriter,o:Object.assign({},T,{impress:.22,exhaust:0}),x:{S:Sv(2),clips:{strikes:C.cdLine}}},{fx:foil,o:Fo,x:{S:Sv(2),clips:{die:C.cdFoil}},top:true}],W,H,dpr,{S:Sv(2)});
      const c2=tooth.run(Object.assign({},Sv(3)[TOOTH],{mShape:'none'}),W,H,dpr,{S:Sv(3)}).lin;
      return a_stackOn(desk,[{lin:lh.lin,alpha:C.lhA,lift:.7},{lin:ev.lin,alpha:C.evA,lift:1.1},{lin:ev.lin,alpha:C.evBot,lift:.22},{lin:ev.lin,alpha:C.evTop,lift:.28},{lin:c2,alpha:C.c2A,lift:1},{lin:cd.lin,alpha:C.cdA,lift:.9}],W,H,dpr); } },
  { id:'u-emboss', job:'brand', title:'Raking light · raised ø, pressed name', sub:'White cotton board under a low sun at 8°. A giant ø is embossed blind and cropped by the frame; the name is pressed small in black ink. The window draws the light: the sun patch ends at the head\'s shadow and a mullion crosses it. In the sun the raised walls flare; in the shade the mark is gone.', uses:['fx-06-deboss','fx-03-paper-tooth'], aspect:'16/9', light:{az:196,el:8},
    overrides:{'fx-03-paper-tooth':{depth:.045,scale:.9,aniso:2,fibers:2.5,fWidth:.25,fLen:9,pits:.5,form:.35,formScale:40,paperL:.93,mShape:'none'},'fx-06-deboss':{depth:-2.4,soft:.9,lip:0,crush:.4,stock:'paper',shadow:.35,diffuse:.97,burnish:0}},
    clips:{ big:(g,w,h)=>a_mark(g,w*.79,h*.47,h*1.7),
      name:(g,w,h)=>{ const X=w*.055, s=h*.052; typeAt(g,'IMPØSSIBLE',X,h*.8,s,{weight:800,track:s*.16}); typeAt(g,'OUTCOMES',X,h*.8+s*1.25,s,{weight:800,track:s*.16}); typeAt(g,'NEW YORK',X,h*.8+s*2.55,s*.74,{font:'mono',weight:700,track:s*.22}); } },
    run(P,W,H,dpr,x){ const D=P('fx-06-deboss'), st=paperLit(Object.assign({},x.S[TOOTH],{mShape:'none'}),W,H,dpr,FX.LIGHT), alb=a_dyed(st,a_lab(.95,0,0));
      const R=chain([{fx:deboss,o:D,x:{alb,clips:{die:x.clips.big}}},{fx:deboss,o:Object.assign({},D,{depth:.4,soft:.35,lip:.05,crush:.85,burnish:0,ink:.85,iL:.22,iC:.004,ih:280,mix:'film'}),x:{clips:{die:x.clips.name}}}],W,H,dpr,x);
      // the window: the patch of sun ends at the head's shadow (an edge across the light) and one mullion crosses it (a stripe along the light)
      const [lx,ly]=FX.lightVec(), pl=Math.hypot(lx,ly)||1, ux=lx/pl, uy=ly/pl, w=W/dpr, h=H/dpr, lin=R.lin;
      for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const u=X/dpr-w*.5, v=y/dpr-h*.5, al=-(u*ux+v*uy), ac=-u*uy+v*ux, pen=1.5+Math.max(0,al+w*.5)*.01;
        const sun=sstep(-pen,pen,w*.3-al)*(1-sstep(-pen,pen,h*.04-Math.abs(ac-h*.3))), i=y*W+X, k=i*3; for(let c=0;c<3;c++) lin[k+c]=R.alb[k+c]*lerp(.36,R.lf[k+c],sun); }
      a_falloff(lin,W,H,dpr,.3); return R; } },
  { id:'u-stickers', job:'brand', title:'Sticker sheet · chrome mirror vinyl, peeling', sub:'One big kiss-cut sticker in mirror-chrome vinyl with the ø knocked out to white, its corner peeled back off a gray liner. The fold shows the white adhesive side, and the bare liner keeps the faint score of the die. The window light becomes one hot patch on the chrome and leaves the rest of the mirror dark. Three small matte stickers sit along the bottom for scale, with crop marks and a typed job line.', uses:['fx-08-foil','fx-06-deboss','fx-07-typewriter','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'4/5', light:{az:226,el:36},
    overrides:{'fx-03-paper-tooth':{depth:.038,aniso:2.4,fibers:6,fLen:10,fWidth:.3,fDark:.03,pits:.6,form:.45,formScale:36,paperL:.95,mShape:'none'},'fx-08-foil':{stock:'smooth',crush:0,dent:0,grain:.025,starve:0,flash:0,box:4,cam:.5,shin:220,mirror:1.0,fL:.84,fC:.008,fh:250},'fx-06-deboss':{depth:.22,soft:.35,lip:0,stock:'paper',shadow:.6},'fx-07-typewriter':{stock:'paper',impress:.18,exhaust:0,vari:.15},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.2,iC:.006,ih:280,density:1.2})},
    clips:(()=>{ const G=a_stk, refl=(g,q)=>{ const k=q.P0[0]*q.n[0]+q.P0[1]*q.n[1]; g.transform(1-2*q.n[0]*q.n[0],-2*q.n[0]*q.n[1],-2*q.n[0]*q.n[1],1-2*q.n[1]*q.n[1],2*k*q.n[0],2*k*q.n[1]); };
      const cap=(g,q,keep)=>{ g.save(); g.beginPath(); g.arc(q.cx,q.cy,q.R,0,TAU); g.clip(); const L=q.R*3, t=[-q.n[1],q.n[0]], s=keep?-1:1, P=q.P0; poly(g,[[P[0]+t[0]*L,P[1]+t[1]*L],[P[0]+t[0]*L+s*q.n[0]*L,P[1]+t[1]*L+s*q.n[1]*L],[P[0]-t[0]*L+s*q.n[0]*L,P[1]-t[1]*L+s*q.n[1]*L],[P[0]-t[0]*L,P[1]-t[1]*L]]); g.restore(); };
      return {
      hero:(g,w,h)=>cap(g,G(w,h),true),
      gold:(g,w,h)=>{ const q=G(w,h); g.beginPath(); g.arc(q.cx,q.cy,q.R,0,TAU); g.fill(); g.globalCompositeOperation='destination-out'; a_mark(g,q.cx,q.cy,q.R*1.22); },
      flap:(g,w,h)=>{ const q=G(w,h); g.save(); refl(g,q); cap(g,q,false); g.restore(); },
      score:(g,w,h)=>{ const q=G(w,h); g.save(); g.beginPath(); g.rect(-w,-h,3*w,3*h); g.clip(); g.strokeStyle='#fff'; g.lineWidth=.6; g.beginPath(); g.arc(q.cx,q.cy,q.R,0,TAU); g.stroke(); g.restore(); },
      dots:(g,w,h)=>G(w,h).dots.forEach(([x0,y0,r])=>{ g.beginPath(); g.arc(x0,y0,r,0,TAU); g.fill(); }),
      dotInk:(g,w,h)=>G(w,h).dots.forEach(([x0,y0,r],k)=>{ g.save(); g.translate(x0,y0); g.rotate([0,.5,-.35][k]); a_mark(g,0,0,r*1.16); g.restore(); }),
      type:(g,w,h)=>{ sub(g,w*.06,h*.025,w*.8,h*.08,(g,a,b)=>strikes(g,a,b,{text:'ø co. — DIE 04 / MIRROR CHROME VINYL · KISS CUT',fsize:h*.021,lead:1.45,align:'left',seed:9,exhaust:0})); sub(g,w*.6,h*.86,w*.36,h*.08,(g,a,b)=>strikes(g,a,b,{text:'SHEET 03 OF 12',fsize:h*.021,align:'left',seed:19,exhaust:0})); },
      crops:(g,w,h)=>{ const m=w*.035, l=w*.05, t=.8; [[m,m,1,1],[w-m,m,-1,1],[m,h-m,1,-1],[w-m,h-m,-1,-1]].forEach(([x0,y0,sx,sy])=>{ g.fillRect(sx>0?x0:x0-l,y0-t/2,l,t); g.fillRect(x0-t/2,sy>0?y0:y0-l,t,l); });
        const rx=w*.5, ry=h*.955, rr=w*.016; g.strokeStyle='#fff'; g.lineWidth=t; g.beginPath(); g.arc(rx,ry,rr,0,TAU); g.stroke(); g.fillRect(rx-rr*1.7,ry-t/2,rr*3.4,t); g.fillRect(rx-t/2,ry-rr*1.7,t,rr*3.4); } }; })(),
    run(P,W,H,dpr,x){ const C=x.clips, w=W/dpr, h=H/dpr, q=a_stk(w,h), F=P('fx-08-foil');
      const st=paperLit(Object.assign({},x.S[TOOTH],{mShape:'none'}),W,H,dpr,FX.LIGHT), kraft=a_dyed(st,a_lab(.9,.003,250));
      const liner=chain([{fx:deboss,o:P('fx-06-deboss'),x:{alb:kraft,clips:{die:C.score}}},{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:C.crops}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.type}}}],W,H,dpr,x);
      const vin=a_lab(.97,0,0), valb=new Float32Array(W*H*3); for(let k=0;k<valb.length;k+=3){ valb[k]=vin[0]*.92; valb[k+1]=vin[1]*.92; valb[k+2]=vin[2]*.92; }
      const gold=foil.run(F,W,H,dpr,{S:x.S,alb:valb,clips:{die:C.gold}}).lin;
      const dots=inkEdge.run(Object.assign({},P('fx-02-ink-edge'),{stock:'smooth',split:.7}),W,H,dpr,{S:x.S,alb:valb,clip:C.dotInk}).lin;
      // the adhesive side of the peeled flap: white vinyl back, rolling over at the fold (a bright crest, then the flat underside)
      const back=new Float32Array(W*H*3), vb=a_lab(.9,.012,85), [lx,ly,lz]=FX.lightVec(), cr=clamp(.55+.6*(lx*q.n[0]+ly*q.n[1]),.2,1.1);
      for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X; if(C.flap[i]<=0) continue; const d=Math.max(0,((q.P0[0]-X/dpr)*q.n[0]+(q.P0[1]-y/dpr)*q.n[1])), f=.78+.1*sstep(0,q.R*.7,d)+.34*cr*Math.exp(-d/(q.R*.025))-.2*Math.exp(-Math.pow((d-q.R*.07)/(q.R*.05),2)), k=i*3; back[k]=vb[0]*f; back[k+1]=vb[1]*f; back[k+2]=vb[2]*f; }
      return a_stackOn(liner.lin,[{lin:gold,alpha:C.hero,lift:.28},{lin:dots,alpha:C.dots,lift:.25},{lin:back,alpha:C.flap,lift:2.2}],W,H,dpr); } },
  { id:'u-halftone', job:'brand', title:'Halftone mark · AM screen, ember', sub:'The mark as a coarse amplitude screen in one ink at 45°: every site prints, the dot grows with tone, dots fuse into solid inside the mark. Cropped hard by the frame — the screen is the image.', uses:['fx-01-stipple','fx-03-paper-tooth'], aspect:'1/1',
    overrides:{'fx-01-stipple':{stock:'paper',mShape:'none',duo:'off',screen:1,sAngle:45,order:'ordered',jitter:0,sizeVar:0,irregular:.04,pitch:3.4,dotR:2.55,rag:.05,aL:.64,aC:.2,ah:38,density:1.2}},
    clips:{ tone:(g,w,h)=>{ g.filter='blur('+(w*.018)+'px)'; sub(g,-w*.18,w*.08,w*1.25,w*1.25,(g,a,b)=>dieOf(g,a,b,{size:1})); g.filter='none'; const gr=g.createRadialGradient(w*.15,h*.15,0,w*.15,h*.15,w*.9); gr.addColorStop(0,'rgba(255,255,255,.32)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); } },
    run(P,W,H,dpr,x){ const C=x.clips; return stipple.run(P('fx-01-stipple'),W,H,dpr,{S:x.S,field:(u,v)=>Math.min(1,smp(C.tone,u,v,W,H,dpr)*1.05)}); } },
  /* ═══ print ═══ */
  { id:'u-poster', job:'print', title:'Two-drum poster · off register', sub:'An untrimmed stencil print. Pink floods down from the top and blue rises from the corner. The headline is printed once per drum and the pink master sits off the blue, so the crop marks, the register targets and the color bar all come out doubled. Where the inks overprint they turn violet. The solids streak lighter along the feed.', uses:['fx-01-stipple','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'3/4',
    overrides:{'fx-03-paper-tooth':{depth:.09,aniso:2.2,fibers:2.5,paperL:.972},'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.76,aC:.21,ah:358,bL:.58,bC:.17,bh:258,pitch:2.05,dotR:.8,density:.85,sizeVar:.15},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.64,iC:.17,ih:250,density:.78,mottle:.45,starve:.012,bite:.6})},
    clips:(()=>{ const HEAD=(g,d,w,h)=>{ typeAt(g,'Slow',d.x0-w*.062,h*.44,h*.27,{track:-6}); typeAt(g,'tide.',d.x0-w*.012,h*.7,h*.27,{track:-6}); };
      const BAR=(g,w,h,which)=>{ const s=h*.02, gp=w*.022, y=h*.932, x=w*.9-s*3-gp*2; which.forEach(k=>g.fillRect(x+k*(s+gp),y,s,s)); };
      return {
      head:(g,w,h)=>b_inDrum(g,w,h,0,(g,d)=>HEAD(g,d,w,h)), headP:(g,w,h)=>b_inDrum(g,w,h,1,(g,d)=>HEAD(g,d,w,h)),
      marks:(g,w,h)=>b_inDrum(g,w,h,0,(g,d)=>b_marks(g,d,w,h),false), marksP:(g,w,h)=>b_inDrum(g,w,h,1,(g,d)=>b_marks(g,d,w,h),false),
      barB:(g,w,h)=>b_inDrum(g,w,h,0,()=>BAR(g,w,h,[1,2]),false), barP:(g,w,h)=>b_inDrum(g,w,h,1,()=>BAR(g,w,h,[0,2]),false),
      foot:(g,w,h)=>b_inDrum(g,w,h,0,()=>{ typeAt(g,'NIGHT SWIM · NORTH LIDO · SAT 14 JUNE · 9 PM',w*.05,h*.944,h*.0165,{font:'mono',weight:600,track:.6,maxW:w*.7}); typeAt(g,'TIDEWORK RISO · 041 / 120 · 12 × 16 IN',w*.05,h*.968,h*.0165,{font:'mono',weight:600,track:.6,maxW:w*.7}); },false) }; })(),
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr, o=P('fx-01-stipple'), C=x.clips, D0=b_DRUM(w,h,0), D1=b_DRUM(w,h,1);
      const inA=(u,v,d)=>{ const [a,b]=b_toDrum(u,v,d); return a>=d.x0&&a<=d.x1&&b>=d.y0&&b<=d.y1; };
      const field=(u,v,L)=>L?(inA(u,v,D0)?FX.ease(['in',1.4],clamp(1-Math.hypot(u-w,v-h)/(Math.hypot(w,h)*.75),0,1))*.9:0):(inA(u,v,D1)?clamp(1.25-v/h*1.4+(FX.fbm(u/90,v/90,4,3,.5)-.5)*.35,0,1)*.95:0);
      // a big solid starves the drum: ink thins along the feed and streaks where the blade loads unevenly — pressure < 1 opens the solid on the paper's valleys
      const streak=(src,s)=>{ const out=new Float32Array(W*H); for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const i=y*W+X, c=src[i]; if(c<=0) continue; const u=X/dpr; out[i]=c*(1-.35*sstep(.45,.8,FX.fbm(u/5.5,v/260,s,3,.55))-.07*v/h); } } return out; };
      const blue=Object.assign({},P('fx-02-ink-edge')), pink=Object.assign({},blue,{iL:.76,iC:.21,ih:358,density:.95,seed:77});
      const B=streak(C.head,31), Pk=streak(C.headP,47); for(let i=0;i<W*H;i++){ B[i]=Math.max(B[i],C.marks[i],C.foot[i],C.barB[i]); Pk[i]=Math.max(Pk[i],C.marksP[i],C.barP[i]); }
      return chain([{fx:stipple,o,x:{field}},{fx:inkEdge,o:pink,x:{clip:Pk}},{fx:inkEdge,o:blue,x:{clip:B}}],W,H,dpr,x); } },
  { id:'u-tickets', job:'print', title:'Tickets · three runs, fanned, one punched', sub:'Three consecutive tickets dealt across the page. Same die, same chain, a different ink on each roller, each running dry at its own point. The numbers are struck in sequence. The top ticket has been punched at the door, and its chad lies on the desk with a fleck of blue ink on it.', uses:['fx-02-ink-edge','fx-07-typewriter','fx-03-paper-tooth'], aspect:'4/3', light:{az:222,el:30},
    overrides:{'fx-03-paper-tooth':{depth:.035,scale:1.3,aniso:1.5,fibers:1.6,pits:.5,form:.1,paperL:.966},'fx-02-ink-edge':{mShape:'none',stock:'paper',angle:0,breakup:.6,split:.5,streak:3.5},'fx-07-typewriter':{stock:'paper',impress:.3,exhaust:0,vari:.2}},
    clips:(()=>{ const shape=(g,a,b,hole)=>{ const sx=a*.74, r=b*.08; g.beginPath(); g.moveTo(0,0); g.lineTo(sx-r,0); g.arc(sx,0,r,PI,0,true); g.lineTo(a,0); g.lineTo(a,b); g.lineTo(sx+r,b); g.arc(sx,b,r,0,PI,true); g.lineTo(0,b); g.closePath(); g.fill(); g.globalCompositeOperation='destination-out'; for(let y=r*1.6;y<b-r*1.4;y+=b*.07){ g.beginPath(); g.arc(sx,y,b*.016,0,TAU); g.fill(); }
        if(hole){ g.beginPath(); g.arc(a*b_PUNCH.a,b*b_PUNCH.b,b*b_PUNCH.r,0,TAU); g.fill(); } g.globalCompositeOperation='source-over'; };
      const o={}; [0,1,2].forEach(k=>{ const at=fn=>(g,w,h)=>{ const f=b_TK(w,h,k); inFrame(g,f.cx,f.cy,f.rot,f.w,f.h,fn); };
        o['t'+k]=at((g,a,b)=>shape(g,a,b,k===2)); o['b'+k]=at((g,a,b)=>g.fillRect(a*.05,b*.3,a*.65,b*.42));
        o['x'+k]=at((g,a,b)=>{ typeAt(g,'ADMIT ONE',a*.05,b*.22,b*.15); sub(g,a*.6,b*.07,b*.17,b*.17,(g,c,d)=>dieOf(g,c,d,{shape:'knot',size:1})); typeAt(g,'HALVARD HALL · ROW F · SEAT '+(11+k),a*.05,b*.88,b*.105,{font:'mono',weight:600,track:.4,maxW:a*.64}); });
        o['n'+k]=at((g,a,b)=>{ g.save(); g.translate(a*.88,b*.52); g.rotate(-PI/2); sub(g,-b*.42,-a*.08,b*.84,a*.16,(g,c,d)=>strikes(g,c,d,{text:'№ 061'+(1+k),fsize:d*.5,seed:30+k,exhaust:0})); g.restore(); }); });
      o.chad=(g,w,h)=>{ const f=b_TK(w,h,2); g.beginPath(); g.arc(w*b_CHAD.x,h*b_CHAD.y,f.h*b_PUNCH.r,0,TAU); g.fill(); };
      return o; })(),
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr, C=x.clips, E=P('fx-02-ink-edge'), inks=[{iL:.4,iC:.155,ih:300},{iL:.64,iC:.2,ih:38},{iL:.45,iC:.16,ih:262}], ends=[.42,.55,.36], layers=[]; let top=null;
      [0,1,2].forEach(k=>{ const S2=Object.assign({},x.S,{[TOOTH]:Object.assign({},x.S[TOOTH],{seed:40+k*7})}), band=Object.assign({},E,inks[k],{edge:ends[k],width:110+k*30,seed:9+k*11}), black=Object.assign({},E,SOLID,{iL:.2,iC:.006,ih:280,seed:5+k});
        const R=chain([{fx:inkEdge,o:band,x:{S:S2,clip:C['b'+k]}},{fx:inkEdge,o:black,x:{S:S2,clip:C['x'+k]}},{fx:typewriter,o:P('fx-07-typewriter'),x:{S:S2,clips:{strikes:C['n'+k]}}}],W,H,dpr,{S:S2});
        layers.push({lin:R.lin,alpha:C['t'+k],lift:.5}); if(k===2) top=R.lin; });
      // the chad: the disc the punch took out of the top ticket, turned over a little and dropped on the desk, carrying what was printed there
      const f=b_TK(w,h,2), [hx,hy]=b_toWorld(f,f.w*b_PUNCH.a,f.h*b_PUNCH.b), cx=w*b_CHAD.x, cy=h*b_CHAD.y, cr=Math.cos(b_CHAD.rot), sr=Math.sin(b_CHAD.rot), lin=new Float32Array(W*H*3);
      for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X; if(C.chad[i]<=0) continue; const u=X/dpr-cx, v=y/dpr-cy, su=(hx+u*cr-v*sr)*dpr, sv=(hy+u*sr+v*cr)*dpr, x0=clamp(su|0,0,W-2), y0=clamp(sv|0,0,H-2), fx=clamp(su-x0,0,1), fy=clamp(sv-y0,0,1);
        for(let c=0;c<3;c++){ const a=top[(y0*W+x0)*3+c], b=top[(y0*W+x0+1)*3+c], d=top[((y0+1)*W+x0)*3+c], e=top[((y0+1)*W+x0+1)*3+c]; lin[i*3+c]=lerp(lerp(a,b,fx),lerp(d,e,fx),fy)*.97; } }
      layers.push({lin,alpha:C.chad,lift:.7});
      return stack(layers,W,H,dpr); } },
  { id:'u-typemacro', job:'print', title:'Typewriter strike · under the loupe', sub:'"Dear reader," at twelve times, cropped through. Each key hits as a tilted plane, so one side of every letter takes more ink than the other. Where it is light you see the ribbon\'s weave, and where it is heavy the film pools at the edge. The type bar presses each letter into the bond. The e and the a print with their counters half full of old ink, and the D bounced.', uses:['fx-07-typewriter','fx-06-deboss','fx-03-paper-tooth'], aspect:'4/5', zoom:12, light:{az:226,el:19},
    overrides:{'fx-03-paper-tooth':{scale:.32,oct:3,pers:.5,depth:.0035,aniso:1.15,fSpread:.6,fibers:260,fLen:3.2,fWidth:.075,fRaise:.12,pits:30,pDepth:.2,form:.4,formScale:5,diffuse:.38,fDark:.012,pDark:.012,paperL:.968,mShape:'none'},
      'fx-07-typewriter':{stock:'paper',impress:0,ribbon:0,squash:.5,density:1.25,bite:.85,mottle:.25,split:.3,breakup:1,starve:.008,wick:.35},
      'fx-06-deboss':{stock:'paper',depth:.05,soft:.3,lip:0,crush:.5,shadow:.6,diffuse:.9,burnish:.004,ink:0}},
    clips:{ ink:(g,w,h)=>b_type(g,w,h,b_TM(w,h,g.getTransform().a),'ink'), die:(g,w,h)=>b_type(g,w,h,b_TM(w,h,g.getTransform().a),'die') },
    run(P,W,H,dpr,x){ const C=x.clips, s=17, pitch=.4, ang=20*PI/180, Sb=FX.blur(C.die,W,H,Math.round(.22*dpr)), Pk=new Float32Array(W*H);
      // pressure = the strike's plane × the ribbon's transfer; just outside the face, ink squeezed off the slug reaches the paper's peaks
      for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const i=y*W+X, c=C.ink[i], halo=Sb[i]*(1-C.die[i]); if(c<=0&&halo<=.02) continue; const u=X/dpr;
        const rib=b_ribbon(u,v,pitch,ang,s), wv=1-sstep(.35,.6,c), p=c*lerp(1,.28+.72*rib,wv); Pk[i]=Math.max(p,halo*.34); } }
      return chain([{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:C.die}}},{fx:b_strikeFx(Pk,C.die),o:P('fx-07-typewriter')}],W,H,dpr,x); } },
  { id:'u-slip', job:'print', title:'Job docket · carbon copy, box stamp, spiked', sub:'A press-room docket on newsprint, torn off the pad. The type is the carbon copy, blue and soft and pressed into the sheet. A PRINTED box stamp is rolled over it at an angle, light enough to break on the tooth. It was spiked on the finished pile, and the carbon left a thumbprint where it was held.', uses:['fx-07-typewriter','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'3/5',
    overrides:{'fx-03-paper-tooth':NEWS,'fx-07-typewriter':{stock:'paper',ribbon:.12,iL:.44,iC:.13,ih:266,impress:.35,vari:.32,exhaust:.2,bite:.45,squash:.2,density:1.05},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.52,iC:.17,ih:26,pressure:.68,bite:.85,starve:.05,density:1})},
    clips:(()=>{ const F=(w,h)=>({cx:w*.5,cy:h*.5,sw:w*.7,sh:h*.92,rot:.022}), at=fn=>(g,w,h)=>{ const f=F(w,h); inFrame(g,f.cx,f.cy,f.rot,f.sw,f.sh,fn); };
      const c=t=>' '.repeat(Math.max(0,(32-t.length)>>1))+t, rule='-'.repeat(32);
      const TXT=[c('PENWICK & DAUGHTER, PRINTERS'),c('PRESS ROOM · DOCKET No. 0612'),'',pad('24 OCT 2026','21:31'),pad('FOR','TIDEWORK RISO'),rule,pad('ITEM       STOCK','QTY'),pad('POSTERS    BOND 90','120'),pad('TICKETS    CARD 300','600'),pad('BOOKPLATES COTTON 400','250'),pad('SLEEVES    BLACK 350','500'),pad('DOCKETS    NEWS 45','2,000'),rule,pad('TOTAL','3,470'),'',c('PROOFS SIGNED · RUN 2 OF 2'),c('KEEP WITH THE JOB')].join(' / ');
      const HOLE=(a,b)=>({x:a*.5,y:b*.085,r:a*.04});
      const holePath=(g,a,b,grow=0)=>{ const H_=HOLE(a,b), R_=FX.rng(19), tears=[.4,1.9,3.3,4.6,5.7]; g.beginPath(); for(let k=0;k<=72;k++){ const t=k/72*TAU, tear=tears.reduce((m,c)=>Math.max(m,Math.max(0,1-Math.abs(((t-c+PI*3)%TAU)-PI)/.07)),0), rr=(H_.r+grow)*(.88+.22*R_())+tear*H_.r*(1.1+grow*.0); k?g.lineTo(H_.x+Math.cos(t)*rr,H_.y+Math.sin(t)*rr):g.moveTo(H_.x+Math.cos(t)*rr,H_.y+Math.sin(t)*rr); } g.closePath(); };
      const outline=(g,a,b)=>{ const R_=FX.rng(77); g.beginPath(); g.moveTo(0,2); for(let x=0;x<=a;x+=1.6) g.lineTo(x,1+R_()*2.2); for(let y=0;y<=b;y+=8) g.lineTo(a,y); for(let x=a;x>=0;x-=1.6) g.lineTo(x,b-1-R_()*2.2); g.closePath(); g.fill(); };
      return {
      slip:at((g,a,b)=>{ outline(g,a,b); g.globalCompositeOperation='destination-out'; holePath(g,a,b); g.fill(); g.globalCompositeOperation='source-over'; }),
      flap:at((g,a,b)=>{ holePath(g,a,b,a*.014); g.fill(); g.globalCompositeOperation='destination-out'; holePath(g,a,b); g.fill(); g.globalCompositeOperation='source-over'; }),
      text:at((g,a,b)=>sub(g,a*.04,b*.04,a*.92,b*.84,(g,c2,d)=>strikes(g,c2,d,{text:TXT,fsize:c2*.05,lead:1.62,seed:14}))),
      thumb:at((g,a,b)=>{ g.save(); g.translate(a*.13,b*.89); g.rotate(-.75); const rx=a*.1, ry=a*.135; g.beginPath(); g.ellipse(0,0,rx,ry,0,0,TAU); g.clip(); g.lineWidth=a*.0036; const R_=FX.rng(3);
        for(let r=a*.004;r<ry*1.6;r+=a*.0074){ const gr=g.createRadialGradient(0,0,0,0,0,ry); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(.7,'rgba(255,255,255,.55)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.strokeStyle=gr; g.beginPath(); g.ellipse(R_()*.4,-r*.18,r*.72,r,0,PI*(.02+R_()*.1),PI*(1.98-R_()*.1)); g.stroke(); } g.restore(); }),
      stamp:at((g,a,b)=>{ g.save(); g.translate(a*.6,b*.83); g.rotate(-.16); const bw=a*.62, bh=a*.25; g.strokeStyle='#fff'; g.lineWidth=1.7; g.strokeRect(-bw/2,-bh/2,bw,bh); g.lineWidth=.7; g.strokeRect(-bw/2+3.5,-bh/2+3.5,bw-7,bh-7);
        typeAt(g,'PRINTED',0,bh*.1,bh*.42,{align:'center',maxW:bw*.82,track:1}); typeAt(g,'24 · 10 · 2026',0,bh*.34,bh*.15,{align:'center',font:'mono',weight:500,track:2}); g.restore(); })}; })(),
    run(P,W,H,dpr,x){ const C=x.clips, E=P('fx-02-ink-edge');
      const R=chain([{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.text}}},{fx:inkEdge,o:Object.assign({},E,{iL:.44,iC:.13,ih:266,pressure:.66,bite:.8,starve:.06,density:.62,seed:23}),x:{clip:C.thumb}},{fx:inkEdge,o:E,x:{clip:C.stamp}}],W,H,dpr,x);
      // the spike burst the sheet from the back: the torn flaps around the hole lean toward the viewer and turn from the light
      const [lx,ly]=FX.lightVec(), f=(()=>{ const w=W/dpr,h=H/dpr; return {cx:w*.5,cy:h*.5,sw:w*.7,sh:h*.92,rot:.022}; })(), hc=b_toWorld({cx:f.cx,cy:f.cy,rot:f.rot,w:f.sw,h:f.sh},f.sw*.5,f.sh*.085);
      for(let i=0,k=0;i<W*H;i++,k+=3){ const m=C.flap[i]; if(m<=0) continue; const u=(i%W)/dpr-hc[0], v=((i/W)|0)/dpr-hc[1], dl=Math.hypot(u,v)||1, face=(u*lx+v*ly)/dl, s=1-m*(.05+.07*face); R.lin[k]*=s; R.lin[k+1]*=s; R.lin[k+2]*=s; }
      return onPage(R,C.slip,W,H,dpr,.9); } },
  { id:'u-sketch', job:'print', title:'Graphite study · cube and sphere, one light', sub:'A drawing, not a texture. Every tone is hatched on one diagonal, the way a right hand draws, and crossed only where it has to go darker. The contours are searched for in several light passes that overshoot their corners, and pressed hard on the shadow side. The highlight on the sphere is lifted out with an eraser. Both cast shadows are projected from the sheet light: the cube\'s is a sheared prism and the sphere\'s is an ellipse. Drag the light and the drawing redraws itself.', uses:['fx-05-graphite','fx-03-paper-tooth'], aspect:'4/3', light:{az:206,el:30},
    overrides:{'fx-03-paper-tooth':{scale:1.25,oct:3,depth:.085,aniso:1.9,fibers:2.2,fLen:10,pits:.6,form:.22,formScale:70,diffuse:.42,paperL:.968,mShape:'none'},'fx-05-graphite':{stock:'paper',mShape:'none',spacing:2,lead:.55,len:40,jit:.35,wobble:.16,pressure:1,taper:.75,sheen:.5,shin:26,layers:2,bite:.14,breakup:.3,starve:0,mottle:0,split:.6}},
    clips:(()=>{ const G=(w,h)=>still(w,h,b_Z), ext=(p,q,e)=>{ const dx=q[0]-p[0], dy=q[1]-p[1]; return [[p[0]-dx*e,p[1]-dy*e],[q[0]+dx*e,q[1]+dy*e]]; }, seg=(g,a,b)=>{ g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); };
      const EDGES=q=>[[q.F,q.L],[q.F,q.R],[q.F,q.Ft],[q.L,q.Lt],[q.R,q.Rt],[q.Ft,q.Lt],[q.Ft,q.Rt],[q.Lt,q.Bt],[q.Rt,q.Bt]];
      return {
      left:(g,w,h)=>poly(g,G(w,h).left), right:(g,w,h)=>poly(g,G(w,h).right), top:(g,w,h)=>poly(g,G(w,h).top),
      // construction: light, searching, overshooting — every edge drawn past its corner, the hidden edges dashed, the sphere found in three passes
      lines:(g,w,h)=>{ const q=G(w,h), R_=FX.rng(8); g.strokeStyle='#fff'; g.lineWidth=.8;
        seg(g,[w*.03,q.gy-q.s*.62],[w*.97,q.gy-q.s*.62]); g.globalCompositeOperation='destination-out'; [q.left,q.right,q.top].forEach(f=>poly(g,f)); g.beginPath(); g.arc(q.scx,q.scy,q.sR,0,TAU); g.fill(); g.globalCompositeOperation='source-over';
        EDGES(q).forEach(([a,b])=>{ const e=.06+R_()*.08, [p,r]=ext(a,b,e); seg(g,p,r); });
        g.setLineDash([2.4,2.6]); [[q.L,q.Bb],[q.R,q.Bb],[q.Bb,q.Bt]].forEach(([a,b])=>seg(g,...ext(a,b,.05))); g.setLineDash([]);
        for(let k=0;k<3;k++){ const a0=-1.9+R_()*.8+k*2.2; g.beginPath(); g.arc(q.scx+(R_()-.5)*1.6,q.scy+(R_()-.5)*1.6,q.sR*(1+(R_()-.5)*.03),a0,a0+TAU*(.55+R_()*.3)); g.stroke(); }
        g.beginPath(); g.ellipse(q.scx,q.scy,q.sR,q.sR*.3,0,0,TAU); g.stroke(); seg(g,[q.scx,q.scy-q.sR*1.2],[q.scx,q.scy+q.sR*1.12]); },
      // the shadow-side contour, pressed: the cube's far edges, the sphere's turning edge away from the light
      accent:(g,w,h)=>{ const q=G(w,h); g.strokeStyle='#fff'; g.lineWidth=1.25; g.lineCap='round'; [[q.F,q.R],[q.R,q.Rt],[q.F,q.Ft]].forEach(([a,b])=>seg(g,a,b)); g.beginPath(); g.arc(q.scx,q.scy,q.sR,-.55,1.95); g.stroke(); },
      erase:(g,w,h)=>{ const q=G(w,h); g.strokeStyle='#fff'; g.lineCap='round'; g.lineWidth=q.sR*.24; g.beginPath(); g.moveTo(q.scx-q.sR*.62,q.scy-q.sR*.12); g.quadraticCurveTo(q.scx-q.sR*.42,q.scy-q.sR*.5,q.scx-q.sR*.08,q.scy-q.sR*.64); g.stroke(); } }; })(),
    run(P,W,H,dpr,x){ const w=W/dpr, h=H/dpr, q=still(w,h,b_Z), C=x.clips, [lx,ly,lz]=FX.lightVec(), pl=Math.hypot(lx,ly)||1, gO=P('fx-05-graphite');
      // one light: value of a plane = 1 − Lambert; a drawing compresses the light (el′) so the shadows stay on the sheet
      const val=n=>{ const m=Math.hypot(...n), lam=Math.max(0,(n[0]*lx+n[1]*ly+n[2]*lz)/m); return clamp(.16+.84*Math.pow(1-lam,1.1),0,1); };
      const el=Math.asin(clamp(lz,.05,1)), elp=Math.atan(Math.tan(el)/.45), cot=1/Math.tan(elp), dxu=-lx/pl, dzu=-ly/pl;
      const fy=(u,v)=>(v-q.Bt[1])/(q.F[1]-q.Bt[1]), jit=(u,v,s)=>(FX.fbm(u/11,v/11,s,2,.5)-.5)*.14;
      const face=(n,grad,s)=>(u,v)=>clamp(val(n)*(.86+.24*grad(u,v))+jit(u,v,s)+.03,0,1);
      const sph=(u,v)=>{ const dx=(u-q.scx)/q.sR, dy=(v-q.scy)/q.sR, r2=dx*dx+dy*dy; if(r2>=1) return 0; const nz=Math.sqrt(1-r2), lam=dx*lx+dy*ly+nz*lz;
        // core shadow just past the terminator, then reflected light from the ground lifting the far rim
        const core=Math.exp(-Math.pow((lam+.08)/.22,2))*.16, refl=Math.max(0,dy)*Math.pow(1-nz,1.5)*.38; return clamp(.2+.8*Math.pow(clamp(1-lam,0,1.4)/1.4,.85)+core-refl+jit(u,v,5),0,1); };
      // cast shadows on the ground plane (screen y = ground + depth · f): the cube's top edge sheared along the light, the sphere's ellipse
      const L=q.s*cot, dX=dxu*L, dY=dzu*L*b_F, base=[q.F,q.L,q.R,q.Bb], tops=base.map(p=>[p[0]+dX,p[1]+dY]), cub=hull(base.concat(tops)), cubC=[(q.F[0]+q.Bb[0])/2,(q.F[1]+q.Bb[1])/2];
      const R=q.sR, sA=R/Math.sin(elp), sB=R, off=R*cot;
      const solid=(u,v)=>inPoly(q.left,u,v)||inPoly(q.right,u,v)||inPoly(q.top,u,v)||Math.hypot(u-q.scx,v-q.scy)<q.sR;
      const shadow=(u,v)=>{ if(solid(u,v)) return 0; let s_=0;
        if(inPoly(cub,u,v)){ const gx=u-cubC[0], gz=(v-cubC[1])/b_F, t=clamp((gx*dxu+gz*dzu)/(L+q.s*.6),0,1); s_=.74-.3*t; }
        const gx=u-q.scx, gz=(v-q.gy)/b_F, a=gx*dxu+gz*dzu-off, b=-gx*dzu+gz*dxu, e2=(a/sA)*(a/sA)+(b/sB)*(b/sB);
        if(e2<1){ const t=clamp((a+sA)/(2*sA),0,1); s_=Math.max(s_,(.78-.3*t)*sstep(1,.82,e2)); }
        const occ=Math.exp(-Math.hypot(gx,gz*.55)/(R*.22))*.3; if(gz>-R*.2) s_=Math.max(s_,occ+s_*.0);
        return clamp(s_+jit(u,v,9),0,1); };
      // the table and the wall behind, laid in lightly and left unfinished toward the edges
      const room=(u,v)=>{ if(solid(u,v)) return 0; const hz=q.gy-q.s*.62, fade=sstep(.98,.55,Math.hypot((u-w*.5)/(w*.58),(v-h*.56)/(h*.62))); return clamp((v<hz?.2:.13)*fade+jit(u,v,13)*.6,0,1); };
      const G_=(o2,xx)=>({fx:graphite,o:Object.assign({},gO,o2),x:xx,top:true}), A=-52;
      const R0=chain([G_({angle:A+4,cross:62,layers:1,spacing:2.4,len:30,pressure:.7,seed:50},{field:room}),
        G_({angle:A,cross:36,layers:3,seed:51},{field:shadow}),
        G_({angle:A,cross:-44,layers:3,seed:52},{clip:C.left,field:face(q.nL,(u,v)=>fy(u,v),1)}),
        G_({angle:A,cross:40,layers:3,seed:53},{clip:C.right,field:face(q.nR,(u,v)=>fy(u,v),2)}),
        G_({angle:A,cross:52,layers:2,seed:54},{clip:C.top,field:face(q.nT,(u,v)=>1-fy(u,v),3)}),
        G_({angle:A,cross:38,layers:3,seed:55,spacing:1.8},{field:sph}),
        {fx:b_pencil(C.lines),o:Object.assign({},gO,{pressure:.62,lead:.45,seed:56}),top:true},
        {fx:b_pencil(C.accent),o:Object.assign({},gO,{pressure:.95,lead:.6,seed:57}),top:true}],W,H,dpr,x);
      // the eraser lifts graphite back to the paper along its stroke — streaked, not airbrushed
      const st=stockFor({stock:'paper'},{S:x.S},W,H,dpr), pap=light(st.alb,st.lf,W,H), [ex,ey]=[Math.cos(-.6),Math.sin(-.6)];
      for(let i=0,k=0;i<W*H;i++,k+=3){ const m=C.erase[i]; if(m<=0) continue; const u=(i%W)/dpr, v=((i/W)|0)/dpr, al=u*ex+v*ey, ac=-u*ey+v*ex, n=FX.fbm(al/9,ac/.9,61,2,.5), t=m*clamp(.8+.5*(n-.5)*2,0,.96);
        R0.lin[k]+=(pap[k]-R0.lin[k])*t; R0.lin[k+1]+=(pap[k+1]-R0.lin[k+1])*t; R0.lin[k+2]+=(pap[k+2]-R0.lin[k+2])*t; }
      return R0; } },
  { id:'u-ginkgo', job:'print', title:'Sun print · ginkgo, pinned to the shop wall', sub:'A cyanotype on cold-press watercolor paper, pinned to a gray wall with one yellow map pin. The sensitizer went on in four brush strokes, and their ragged ends and dry tails show at the margins. A ginkgo sprig lay on the sheet in the sun. Where it was pressed flat the leaves print sharp, where it curled they blur, and the veins stay whiter than the leaf. The edition and title are in pencil, and the studio chop is blind-pressed in the corner.', uses:['fx-11-cyanotype','fx-06-deboss','fx-05-graphite','fx-03-paper-tooth'], aspect:'4/5', light:{az:214,el:38},
    overrides:{'fx-03-paper-tooth':{scale:1.8,oct:3,depth:.1,aniso:1.15,fibers:2.6,fLen:9,pits:.8,form:.24,formScale:60,diffuse:.45,paperL:.972,mShape:'none'},'fx-11-cyanotype':{stock:'paper',subject:'fern',tone:'classic',strokes:4,bAngle:-1.5,lift:4.5,contact:.55,trans:.015,expo:1.1,bleed:.3,depth:1.5,seed:23},
      'fx-06-deboss':{stock:'paper',depth:.5,soft:1.1,lip:.08,crush:.6,shadow:.6,ink:0,burnish:.006},'fx-05-graphite':{stock:'paper',mShape:'none',spacing:2,lead:.5,pressure:.85,sheen:.5,shin:26,bite:.14,breakup:.3,starve:0,mottle:0,split:.6}},
    clips:{ obj:(g,w,h)=>b_ginkgo(g,w,h),
      sheet:(g,w,h)=>{ const q=b_SP(w,h); inFrame(g,q.cx,q.cy,q.rot,q.sw,q.sh,(g,a,b)=>{ // a deckle on the two edges in frame: the pulp thins out, it does not tear
        g.beginPath(); g.moveTo(a,b); g.lineTo(a,0); for(let x=a;x>=0;x-=.7) g.lineTo(x,1.6*(FX.fbm(x/5,.5,7,3,.55)-.5)*2+.9*(FX.vnoise(x*1.3,2,9)-.5)); for(let y=0;y<=b;y+=.7) g.lineTo(1.6*(FX.fbm(y/5,3.5,8,3,.55)-.5)*2+.9*(FX.vnoise(y*1.3,5,10)-.5),y); g.closePath(); g.fill(); }); },
      chop:(g,w,h)=>sub(g,w*.855,h*.936,h*.05,h*.05,(g,a,b)=>dieOf(g,a,b,{shape:'monogram',text:'S',size:1})),
      cap:(g,w,h)=>{ const y=h*.968, fs=h*.022; g.textBaseline='alphabetic'; b_hand(g,'4/12',w*.085,y,fs,3); b_hand(g,'Ginkgo biloba, six minutes in June sun',w*.19,y,fs,7); } },
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr,C=x.clips,q=b_SP(w,h),gO=P('fx-05-graphite'),N=W*H;
      const R=chain([{fx:cyanotype,o:P('fx-11-cyanotype'),x:{clips:{obj:C.obj}}},{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:C.chop}}},{fx:b_pencil(C.cap),o:Object.assign({},gO,{seed:58}),top:true}],W,H,dpr,x);
      // the wall: a gray board with its own fine tooth under the same light
      const wl=paperLit(Object.assign({},x.S[TOOTH],{scale:2.2,oct:4,depth:.06,aniso:1,fibers:.5,pits:2,form:.1,paperL:.6,tAmt:0,seed:91,mShape:'none'}),W,H,dpr,FX.LIGHT), out=light(wl.alb,wl.lf,W,H);
      shadowOn(out,C.sheet,null,W,H,dpr,.6); for(let i=0,k=0;i<N;i++,k+=3){ const a=C.sheet[i]; if(a<=0) continue; for(let c=0;c<3;c++) out[k+c]+=(R.lin[k+c]-out[k+c])*a; }
      const pn=b_pin(W,H,dpr,q.px,q.py,q.pr,FX.ink(.86,.17,95).lin); shadowOn(out,pn.a,null,W,H,dpr,2.4); for(let i=0,k=0;i<N;i++,k+=3){ const a=pn.a[i]; if(a<=0) continue; for(let c=0;c<3;c++) out[k+c]+=(pn.lin[k+c]-out[k+c])*a; }
      return {lin:out,ink:R.ink,mask:C.sheet,stock:R.stock,marks:R.marks,markUnit:R.markUnit}; } },
  { id:'u-exlibris', job:'print', title:'Ex libris · laser-cut, still in the sheet', sub:'The top corner of a bookplate, burned into white board by a laser one scan line at a time. The tree, the frame and the type are a deep pass, charred black and sunk below the paper. The medallion behind the tree is a light pass that only browns it, and every scan line shows. The plate is cut out at an offset and held in the sheet by uncut tabs, and the kerf opens onto the dark bed below.', uses:['fx-12-laser','fx-03-paper-tooth'], aspect:'4/5', zoom:1.4, light:{az:212,el:26},
    overrides:{'fx-03-paper-tooth':{scale:1.4,oct:3,depth:.035,aniso:1.2,fibers:3,fLen:8,pits:.6,form:.2,formScale:60,paperL:.972,mShape:'none'},'fx-12-laser':{stock:'paper',scan:0,power:.72,speed:1,pitch:1,spot:.36,focus:0,ramp:0,halo:.22,haloR:1.1,ablate:.55,overburn:.22,cut:'outline',cutOff:11,kerf:1.1,tabs:4,tabW:3,thick:2.2,gL:.16,gC:.004,gh:250,seed:12}},
    clips:{ tone:(g,w,h)=>b_plate(g,w,h,'tone'), art:(g,w,h)=>{ g.strokeStyle='#fff'; b_plate(g,w,h,'art'); }, blank:(g,w,h)=>b_plate(g,w,h,'blank') },
    run(P,W,H,dpr,x){ const C=x.clips, L=P('fx-12-laser');
      // three passes, as the job runs on the machine: light raster, deep raster, then the vector cut around the blank (no raster: power 0)
      return chain([{fx:laser,o:Object.assign({},L,{cut:'off',power:.2,halo:.08,ablate:.1,overburn:.05,seed:5}),x:{clips:{die:C.tone}}},{fx:laser,o:Object.assign({},L,{cut:'off'}),x:{clips:{die:C.art}}},{fx:laser,o:Object.assign({},L,{power:.0001,overburn:0,halo:.3}),x:{clips:{die:C.blank}}}],W,H,dpr,x); } },
  { id:'u-sleeve', job:'print', title:'Record sleeve · spot UV grooves on black', sub:'The corner of a record sleeve in matte black board on a gray table. The grooves are spot UV: clear gloss rings that vanish head-on and show only where the soft box of the sheet light reflects in them. The band, the title and the catalog line are one white ink. On the side facing the light, the cut edge shows the gray core of the board.', uses:['fx-09-spot-uv','fx-03-paper-tooth'], aspect:'1/1', light:{az:228,el:50},
    overrides:{'fx-03-paper-tooth':{scale:1.4,depth:.05,aniso:1.2,fibers:1.2,pits:.4,form:.12,paperL:.97,mShape:'none'},'fx-09-spot-uv':{stock:'paper',pattern:'solid',area:'die',build:.22,round:.7,level:.92,gloss:.92,mirror:1,box:.2,cam:.6,wet:.5,bL:.2,bC:.004,bh:265}},
    clips:{ board:(g,w,h)=>b_sleeve(g,w,h,'board'), uv:(g,w,h)=>{ g.strokeStyle='#fff'; b_sleeve(g,w,h,'uv'); }, ink:(g,w,h)=>b_sleeve(g,w,h,'ink') },
    run(P,W,H,dpr,x){ const C=x.clips, o=P('fx-09-spot-uv'), st=stockFor(o,x,W,H,dpr), brd=FX.inkOf(o,'b'), wi=FX.ink(.93,.004,250).lin, N=W*H;
      let m=0, n=0; for(let i=0;i<N;i+=7){ m+=st.alb[i*3]; n++; } m/=n;
      const alb=new Float32Array(N*3); for(let i=0,k=0;i<N;i++,k+=3){ const r=st.alb[k]/m, c=C.ink[i]; for(let q=0;q<3;q++) alb[k+q]=brd.lin[q]*r+(wi[q]*(.95+.05*r)-brd.lin[q]*r)*c; }
      const R=spotUV.run(o,W,H,dpr,{S:x.S,alb,lf:st.lf,clips:{die:C.uv}});
      const tb=paperLit(Object.assign({},x.S[TOOTH],{scale:2,depth:.05,fibers:.6,paperL:.8,tAmt:0,seed:63,mShape:'none'}),W,H,dpr,FX.LIGHT), out=light(tb.alb,tb.lf,W,H);
      shadowOn(out,C.board,null,W,H,dpr,.8);
      // the cut edge: black board is black only on its faces; the edge toward the light shows the gray core
      const SD=FX.sdf(C.board,W,H), [lx,ly]=FX.lightVec(), pl=Math.hypot(lx,ly)||1;
      for(let y=1;y<H-1;y++) for(let X=1;X<W-1;X++){ const i=y*W+X, k=i*3, a=C.board[i]; if(a<=0) continue; const d=SD[i]/dpr;
        if(d<1.2){ let gx=SD[i+1]-SD[i-1], gy=SD[i+W]-SD[i-W]; const gl=Math.hypot(gx,gy)||1, face=clamp(-(gx*lx+gy*ly)/(gl*pl),0,1), b=face*sstep(1.2,.35,d)*.85; for(let c=0;c<3;c++) R.lin[k+c]+=(.11-R.lin[k+c])*b; }
        for(let c=0;c<3;c++) out[k+c]+=(R.lin[k+c]-out[k+c])*a; }
      return {lin:out,ink:R.ink,mask:C.board,stock:R.stock,marks:R.marks,markUnit:R.markUnit}; } },
  /* ═══ packaging ═══ */
  { id:'u-bag', job:'packaging', title:'Coffee bag · label and roast stamp', sub:'Tight on an arch-cut label stuck to a matte black bag. The foil name is too big to fit, and the graphite cherries are close enough to show each hatch. The lot line is typed, and the roast date is rubber-stamped in violet, rocked light on one side.', uses:['fx-05-graphite','fx-08-foil','fx-07-typewriter','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'4/5', zoom:1.6, light:{az:214,el:24},
    overrides:{'fx-03-paper-tooth':{scale:1.15,aniso:1.6,fSpread:.06,depth:.025,fibers:3,pits:.25,form:.1,paperL:.972,mShape:'none'},'fx-05-graphite':{stock:'paper',mShape:'none',spacing:1.45,lead:.48,len:40,layers:3,cross:64,sheen:.55,jit:.35,wobble:.1,bite:.22,breakup:.85,starve:0,mottle:0,split:.6},'fx-08-foil':{stock:'paper',crush:.97,starve:0,box:3,cam:1.8,grain:.025,shin:200,flash:.04},'fx-07-typewriter':{stock:'paper',impress:.25,exhaust:0,vari:.18},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.22,iC:.004,ih:280,density:1.15})},
    clips:(()=>{ const A=(w,h)=>({lw:w*1.02,lh:h*1.2,x0:w*.075,y0:-h*.18}), arch=(g,x0,y0,lw,lh)=>{ g.beginPath(); g.moveTo(x0,y0+lw/2); g.arc(x0+lw/2,y0+lw/2,lw/2,PI,0); g.lineTo(x0+lw,y0+lh); g.lineTo(x0,y0+lh); g.closePath(); };
      return {
      label:(g,w,h)=>{ const a=A(w,h); arch(g,a.x0,a.y0,a.lw,a.lh); g.fill(); },
      rule:(g,w,h)=>{ const a=A(w,h), m=a.lw*.045; g.strokeStyle='#fff'; g.lineWidth=.75; arch(g,a.x0+m,a.y0+m,a.lw-2*m,a.lh-2*m); g.stroke(); },
      leaf:(g,w,h)=>{ const a=A(w,h), c=cher(a); g.save(); g.translate(c.lx,c.ly); g.rotate(c.la); g.beginPath(); g.moveTo(-c.lr,0); g.quadraticCurveTo(0,-c.lr*.42,c.lr,0); g.quadraticCurveTo(0,c.lr*.42,-c.lr,0); g.fill(); g.globalCompositeOperation='destination-out'; g.fillRect(-c.lr*.9,-.35,c.lr*1.8,.7); g.restore(); },
      stems:(g,w,h)=>{ const a=A(w,h), c=cher(a); g.strokeStyle='#fff'; g.lineWidth=.6; c.cs.forEach(([cx,cy,r])=>{ g.beginPath(); g.arc(cx,cy,r,0,TAU); g.stroke(); }); g.lineWidth=.9; c.cs.forEach(([cx,cy,r])=>{ g.beginPath(); g.moveTo(cx,cy-r*.9); g.quadraticCurveTo(cx+(c.bx-cx)*.2,cy-r*2,c.bx,c.by); g.stroke(); }); },
      title:(g,w,h)=>{ const a=A(w,h); typeAt(g,'Harvest',a.x0+a.lw*.02,a.y0+a.lh*.83,a.lw*.3,{track:-3}); },
      stamp:(g,w,h)=>inFrame(g,w*.775,h*.54,-.11,w*.3,w*.125,(g,a,b)=>{ g.strokeStyle='#fff'; g.lineWidth=1.4; rrect(g,.7,.7,a-1.4,b-1.4,3.5); g.stroke(); g.lineWidth=.8; rrect(g,3,3,a-6,b-6,2); g.stroke(); typeAt(g,'ROASTED',a*.5,b*.4,b*.2,{align:'center',track:2.4}); typeAt(g,'21 · 10 · 26',a*.5,b*.8,b*.32,{align:'center',track:.5}); }),
      text:(g,w,h)=>{ const a=A(w,h); sub(g,a.x0,a.y0+a.lw*.19,a.lw,a.lw*.1,(g,c,d)=>strikes(g,c,d,{text:'SEASONAL · No. 01',fsize:a.lw*.04,seed:5,exhaust:0}));
        sub(g,a.x0+a.lw*.06,a.y0+a.lh*.875,a.lw*.8,a.lh*.06,(g,c,d)=>strikes(g,c,d,{text:'STONE FRUIT · CACAO · CANE · LOT 0612',fsize:a.lw*.034,seed:6,exhaust:0,align:'left'})); } }; })(),
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr, a={lw:w*1.02,lh:h*1.2,x0:w*.075,y0:-h*.18}, c=cher(a), C=x.clips, [lx,ly,lz]=FX.lightVec(), gO=P('fx-05-graphite');
      const fruit=(u,v)=>{ for(const [cx,cy,r] of c.cs.slice().sort((p,q)=>q[1]-p[1])){ const dx=(u-cx)/r, dy=(v-cy)/r, r2=dx*dx+dy*dy; if(r2<1){ const nz=Math.sqrt(1-r2), lam=Math.max(0,dx*lx+dy*ly+nz*lz); return clamp(Math.pow(1-lam,1.2)*.9+.08-Math.pow(1-nz,5)*.2,0,1); } } return 0; };
      const leafV=(u,v)=>{ const ca=Math.cos(-c.la), sa=Math.sin(-c.la), Y=(u-c.lx)*sa+(v-c.ly)*ca; return Y<0?.52:.34; };
      const G_=(o2,xx)=>({fx:graphite,o:Object.assign({},gO,o2),x:xx,top:true});
      const stampO=Object.assign({},P('fx-02-ink-edge'),{iL:.47,iC:.13,ih:304,density:.95,pressure:.84,edge:.88,width:110,wAmp:4,ease:['smooth',2],bite:.85,starve:.08,mottle:.6,split:.9,seed:31});
      const R=chain([{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:C.rule}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.text}}},{fx:inkEdge,o:stampO,x:{clip:C.stamp}},
        G_({angle:40,seed:61},{field:fruit}),G_({angle:c.la*180/PI+62,cross:40,layers:2,seed:62},{clip:C.leaf,field:leafV}),G_({angle:0,cross:90,layers:1,spacing:.42,lead:.38,len:300,jit:0,wobble:.03,pressure:.85,seed:63},{clip:C.stems,field:()=>.85}),
        {fx:foil,o:P('fx-08-foil'),x:{clips:{die:C.title}},top:true}],W,H,dpr,x);
      // the bag: matte black paper (long fibers, heavy formation), the label lying on it
      const bag=c_tint(tooth.run(Object.assign({},P(TOOTH),{scale:1.1,oct:4,aniso:1.7,fAngle:88,fSpread:.5,fibers:60,fLen:4.5,fWidth:.34,fDark:.11,fRaise:.6,form:1,formScale:12,depth:.09,paperL:.93,pits:6,pDark:.12,seed:47}),W,H,dpr,{}).lin,.3,.004,250,.8);
      shadowOn(bag,C.label,null,W,H,dpr,.9); R.lin=c_over(bag,R.lin,C.label); R.mask=C.label; return R; } },
  { id:'u-bookmacro', job:'packaging', title:'Bookcloth · 5× at the hinge', sub:'Five times into the cover of a clothbound book. The gold foil bridges the green threads and drops out in the gaps between them. The blind hinge groove crushes the weave flat, and past it the spine turns away into shadow. Raked at 17°, so every thread casts.', uses:['fx-04-weave','fx-08-foil','fx-06-deboss'], aspect:'1/1', zoom:5, light:{az:200,el:17},
    overrides:{'fx-04-weave':Object.assign({},BOOK,{warp:120,weft:84,fill:1.08,irregular:.24,slub:.45,slubScale:5,hair:.3,dye:.015,depth:1.3,shadow:.65}),'fx-08-foil':{stock:'cloth',crush:.5,grain:.05,starve:0,flash:.25,mirror:1.15,cam:2,box:2},'fx-06-deboss':{stock:'cloth',depth:3.2,soft:1.2,crush:.9,lip:.12,diffuse:.92,shadow:.9}},
    clips:{ foil:(g,w,h)=>typeAt(g,'Su',-w*.06,h*.86,h*.95,{track:-4}), groove:(g,w,h)=>g.fillRect(w*.86,0,w*.06,h) },
    run(P,W,H,dpr,x){ const C=x.clips, R=chain([{fx:weave,o:P('fx-04-weave')},{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:C.groove}}},{fx:foil,o:P('fx-08-foil'),x:{clips:{die:C.foil}},top:true}],W,H,dpr,x);
      // past the hinge the cloth wraps the rounded spine: it turns away from the light, a soft crest catching it first
      const w=W/dpr, s0=w*.9; for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const u=X/dpr; if(u<s0) continue; const t=(u-s0)/(w-s0), f=(1+.1*Math.exp(-Math.pow((t-.07)/.06,2)))*(1-.42*Math.pow(t,1.25)), k=(y*W+X)*3; R.lin[k]*=f; R.lin[k+1]*=f; R.lin[k+2]*=f; }
      return R; } },
  /* ═══ textile ═══ */
  { id:'u-swatches', job:'textile', title:'Swatch card · five drafts, stapled', sub:'A white mill card, hole punched and eyeleted in brass. Five pinked swatches stapled in a row, each typed underneath with its draft and thread count; one ticked in pencil. Same weave function, five cloths.', uses:['fx-04-weave','fx-03-paper-tooth','fx-07-typewriter','fx-02-ink-edge','fx-05-graphite'], aspect:'3/2', light:{az:225,el:26},
    overrides:{'fx-03-paper-tooth':{scale:1.3,aniso:3,depth:.07,fibers:4,fLen:10,form:.35,formScale:40,paperL:.95,mShape:'none'},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.2,iC:.006,ih:280,density:1.25}),'fx-07-typewriter':{stock:'paper',impress:.3,exhaust:0,vari:.22},
      'fx-05-graphite':{stock:'paper',mShape:'none',angle:0,cross:90,layers:1,spacing:.42,lead:.38,len:300,jit:0,wobble:.03,pressure:1,sheen:.5,bite:.22,breakup:.85,starve:0,mottle:0,split:.6,seed:64}},
    clips:{
      card:(g,w,h)=>c_inCard(g,w,h,(g,cw,ch,k)=>{ g.beginPath(); g.rect(0,0,cw,ch); g.arc(k.hx,k.hy,k.hr,0,TAU); g.fill('evenodd'); }),
      print:(g,w,h)=>c_inCard(g,w,h,(g,cw,ch,k)=>{ typeAt(g,'Cloth library',cw*.1,ch*.145,ch*.1,{track:-1.5}); typeAt(g,'Ø CO. MATERIALS · CUT ON THE GRAIN · KEEP FLAT',cw*.1,ch*.2,ch*.031,{font:'mono',weight:600,track:1.2,maxW:cw*.62});
        g.fillRect(k.sx(0),ch*.235,k.sx(4)+k.sw-k.sx(0),1.15); for(let i=0;i<5;i++) typeAt(g,'0'+(i+1),k.sx(i),ch*.285,ch*.036,{font:'mono',weight:600,track:.5}); }),
      red:(g,w,h)=>c_inCard(g,w,h,(g,cw,ch,k)=>typeAt(g,'No. 07',k.sx(4)+k.sw,ch*.145,ch*.1,{align:'right',track:-1.5})),
      labels:(g,w,h)=>c_inCard(g,w,h,(g,cw,ch,k)=>C_DRAFTS.forEach((d,i)=>sub(g,k.sx(i)-1,k.ly,k.sw+6,k.lh,(g,a,b)=>strikes(g,a,b,{text:d.join(' / '),fsize:ch*.034,lead:1.32,align:'left',seed:80+i,exhaust:0})))),
      pencil:(g,w,h)=>c_inCard(g,w,h,(g,cw,ch,k)=>{ const x0=k.sx(2)+k.sw*.84, y0=k.ly+k.lh*.22; g.strokeStyle='#fff'; g.lineCap='round'; g.lineJoin='round'; g.lineWidth=1.6; g.beginPath(); g.moveTo(x0,y0); g.quadraticCurveTo(x0+3.5,y0+4.5,x0+5.2,y0+8.5); g.quadraticCurveTo(x0+9,y0-3.5,x0+18,y0-11); g.stroke(); }),
      ...Object.fromEntries([0,1,2,3,4].map(i=>['s'+i,(g,w,h)=>c_inCard(g,w,h,(g,cw,ch,k)=>{ const px=k.sx(i)+k.sw/2, py=k.sy+ch*.045; g.translate(px,py); g.rotate([.012,-.007,.004,-.013,.009][i]); g.translate(-px,-py); c_pinked(g,k.sx(i),k.sy,k.sw,k.sh); })])),
      staples:(g,w,h)=>c_inCard(g,w,h,(g,cw,ch,k)=>{ g.strokeStyle='#fff'; g.lineCap='round'; g.lineWidth=2.1; for(let i=0;i<5;i++){ const cx=k.sx(i)+k.sw*.5+(i%2?1.5:-1), y=k.sy+ch*.045+(i-2)*.3; g.beginPath(); g.moveTo(cx-k.sw*.24,y); g.lineTo(cx+k.sw*.24,y+(i%2?.5:-.4)); g.stroke(); } }),
      eyelet:(g,w,h)=>c_inCard(g,w,h,(g,cw,ch,k)=>{ g.beginPath(); g.arc(k.hx,k.hy,k.er,0,TAU); g.arc(k.hx,k.hy,k.hr*.92,0,TAU); g.fill('evenodd'); }) },
    run(P,W,H,dpr,x){ const C=x.clips, base=P('fx-04-weave'), k=c_card(W/dpr,H/dpr), ie=P('fx-02-ink-edge'), drafts=[{pattern:'twill 2/1',warp:52,weft:44,fill:.97,wL:.36,wC:.075,wh:262,fL:.84,fC:.004,fh:250,accent:0,dye:.04,slub:.55,hair:.35,depth:1},Object.assign({},LINEN,{accent:0,slub:.5,dye:.03}),Object.assign({},SHIRT,{wL:.87,fL:.91,depth:1.15,fill:.99}),DUCK,Object.assign({},BOOK,{wL:.38,fL:.34})];
      const card=chain([{fx:inkEdge,o:ie,x:{clip:C.print}},{fx:inkEdge,o:Object.assign({},ie,INK.red,{density:1.05,seed:12}),x:{clip:C.red}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.labels}}},{fx:graphite,o:P('fx-05-graphite'),x:{clip:C.pencil,field:()=>.9},top:true}],W,H,dpr,x);
      c_tint(card.lin,.97,0,0);
      const layers=[{lin:card.lin,alpha:C.card,lift:1.4}].concat(drafts.map((d,i)=>({lin:weave.run(Object.assign({},base,d,{mShape:'none',lift:0,seed:33+i*17}),W,H,dpr,{S:x.S}).lin,alpha:C['s'+i],lift:.75})));
      layers.push({lin:c_metal(c_dome(C.staples,W,H,dpr,1.05),C.staples,W,H,dpr,FX.ink(.9,.008,250).lin,.55,40),alpha:C.staples,lift:.3});
      layers.push({lin:c_metal(c_dome(C.eyelet,W,H,dpr,(k.er-k.hr*.92)*.5),C.eyelet,W,H,dpr,FX.ink(.74,.09,82).lin,.86,50),alpha:C.eyelet,lift:.55});
      return stack(layers,W,H,dpr); } },
  { id:'u-wovenmacro', job:'textile', title:'Woven label · 4× at the fold', sub:'Four times into a damask label sewn into a grey twill. The ø is woven, not printed: white weft floats long over black warp inside the figure. The top end is folded under and stitched through in gray thread, and the side is heat-cut, its threads melted into a bead.', uses:['fx-04-weave'], aspect:'1/1', zoom:4, light:{az:200,el:24},
    overrides:{'fx-04-weave':Object.assign({},WLABEL,{warp:150,weft:240,fill:1.12,depth:1,shadow:.6,wL:.2,fL:.95,fC:.003,fh:250,irregular:.1,slub:.12,slubScale:5,hair:.04})},
    clips:{ jq:(g,w,h)=>sub(g,w*.36-w*.39,h*.73-w*.39,w*.78,w*.78,(g,a,b)=>dieOf(g,a,b,{size:1})), label:(g,w,h)=>g.fillRect(-4,h*.17,w*.8+4,h*.83+4) },
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr,C=x.clips,o=P('fx-04-weave'), x1=w*.8, y0=h*.17, sy=y0+5;
      const bg=weave.run(Object.assign({},o,{pattern:'twill 2/1',warp:130,weft:110,fill:1.08,slub:.3,slubScale:8,hair:.35,irregular:.2,depth:1.1,shadow:.6,wL:.55,wC:.008,wh:250,fL:.6,fC:.006,fh:80,accent:0,dye:.06,wear:0,seed:71}),W,H,dpr,{S:x.S}).lin;
      const lab=weave.run(o,W,H,dpr,{S:x.S,clips:{jq:C.jq}}).lin;
      // satin sheen: the long weft floats of the figure mirror the light in one broad band across their length (the short ground floats do not)
      const cx=.5-.25*Math.cos(FX.LIGHT.az*PI/180); for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X, j=C.jq[i]; if(j<=0) continue; const k=i*3, Y=lab[k]*.2126+lab[k+1]*.7152+lab[k+2]*.0722, sh=.3*j*Math.exp(-Math.pow((X/W-cx-(y/H-.5)*.3)/.2,2))*sstep(.2,.6,Y); lab[k]+=sh; lab[k+1]+=sh*.98; lab[k+2]+=sh*.92; }
      // the end fold rolls over toward the light, then away at its crest; the heat-cut side is a fused, darker bead with one wet highlight
      for(let y=0;y<H;y++){ const dv=y/dpr-y0; for(let X=0;X<W;X++){ const du=x1-X/dpr; let f=1, ad=0;
        if(dv>=0&&dv<4.5){ f*=(1+.25*Math.exp(-Math.pow((dv-2.2)/.8,2)))*(1-.65*sstep(1.5,0,dv)); ad+=.075*Math.exp(-Math.pow((dv-2)/.55,2)); }
        if(du>=0&&du<2.4){ f*=1-.6*sstep(2.4,.4,du); ad+=.1*Math.exp(-Math.pow((du-1.25)/.33,2)); }
        if(f!==1||ad){ const k=(y*W+X)*3; lab[k]=lab[k]*f+ad; lab[k+1]=lab[k+1]*f+ad*.97; lab[k+2]=lab[k+2]*f+ad*.92; } } }
      shadowOn(bg,C.label,null,W,H,dpr,1.15); c_over(bg,lab,C.label);
      const segs=[]; for(let s=1.6;s<x1-5;s+=5.6) segs.push([s,sy+(s%7)*.015,s+4.2,sy+.06]);
      const T=c_thread(segs,W,H,dpr,FX.ink(.8,.004,250).lin,.8);
      for(let i=0,k=0;i<W*H;i++,k+=3){ const d=1-.65*T.hole[i]*(1-T.a[i]); bg[k]*=d; bg[k+1]*=d; bg[k+2]*=d; }
      shadowOn(bg,T.a,null,W,H,dpr,.35); c_over(bg,T.lin,T.a);
      return {lin:bg,ink:C.label,mask:C.label,stock:null,marks:segs.length,markUnit:'stitches'}; } },
  { id:'u-tote', job:'textile', title:'Tote · one pull over the hem', sub:'Canvas duck at the mouth of the bag: the top folded and double-stitched, and the ø pulled once through the screen at a size the bag cannot hold. The screen bridges the hem\'s step and skips just below it. The squeegee runs dry toward the right, so the bar prints only on the tops of the threads.', uses:['fx-02-ink-edge','fx-04-weave'], aspect:'4/5', zoom:1.25, light:{az:214,el:24},
    overrides:{'fx-04-weave':Object.assign({},DUCK,{warp:46,weft:44,depth:1.25,slub:.4,irregular:.25}),'fx-02-ink-edge':{stock:'cloth',mShape:'none',edge:.72,width:90,angle:0,bite:.92,starve:.02,breakup:.95,iL:.27,iC:.012,ih:280,density:1.3,wAmp:10,wScale:70}},
    clips:{ ink:(g,w,h)=>{ const top=h*.035, step=h*.112; g.save(); g.beginPath(); g.rect(0,top+1.2,w,h); g.clip(); sub(g,-w*.18,h*.06,w*1.08,w*1.08,(g,a,b_)=>dieOf(g,a,b_,{size:1})); typeAt(g,'PULLED BY HAND · NEW YORK',w*.07,h*.968,h*.032,{track:2.2}); g.restore();
        // the screen cannot reach down past the hem's step: a skip band, ragged by the squeegee's bounce
        g.globalCompositeOperation='destination-out'; const gr=g.createLinearGradient(0,step,0,step+h*.032); gr.addColorStop(0,'rgba(0,0,0,.8)'); gr.addColorStop(.35,'rgba(0,0,0,.55)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,step,w,h*.032); g.globalCompositeOperation='source-over'; },
      bag:(g,w,h)=>g.fillRect(0,h*.035,w,h), hem:(g,w,h)=>g.fillRect(0,h*.035,w,h*.077) },
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr,C=x.clips, top=h*.035, R=inkEdge.run(P('fx-02-ink-edge'),W,H,dpr,{S:x.S,clip:C.ink}), lin=R.lin;
      // the top fold rolls toward the light then away; the hem's double layer steps down and throws a soft shadow onto the single layer
      for(let y=0;y<H;y++){ const dv=y/dpr-top; if(dv<0||dv>4) continue; const f=(1+.14*Math.exp(-Math.pow((dv-2)/.8,2)))*(1-.5*sstep(1.4,0,dv)); for(let X=0;X<W;X++){ const k=(y*W+X)*3; lin[k]*=f; lin[k+1]*=f; lin[k+2]*=f; } }
      shadowOn(lin,C.hem,C.bag,W,H,dpr,.45);
      const segs=[]; for(const yy of [top+5.8,h*.103]) for(let s=-1;s<w;s+=8.4) segs.push([s,yy,s+5.6,yy+.08]);
      const T=c_thread(segs,W,H,dpr,FX.ink(.32,.004,250).lin,1.05);
      for(let i=0,k=0;i<W*H;i++,k+=3){ const d=1-.55*T.hole[i]*(1-T.a[i]); lin[k]*=d; lin[k+1]*=d; lin[k+2]*=d; }
      shadowOn(lin,T.a,null,W,H,dpr,.35); c_over(lin,T.lin,T.a);
      const out=FX.ground(W,H,FX.WHITE); shadowOn(out,C.bag,null,W,H,dpr,1.2); c_over(out,lin,C.bag);
      return Object.assign({},R,{lin:out,mask:C.bag}); } },
  /* ═══ screen & deck · data ═══ */
  { id:'u-deck', job:'screen', title:'Title slide · a planet in stipple', sub:'A deck title slide on the 16:9 stage. Crisp black type on the left. On the right a stippled planet bleeds off two edges, shaded dot by dot from the sheet light, with a thin ember haze on the lit limb and one small ember moon. Drag the light and the terminator turns.', uses:['fx-01-stipple','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'16/9', span:3, light:{az:212,el:20},
    overrides:{'fx-03-paper-tooth':{depth:.02,aniso:1.5,fibers:1.2,pits:.3,form:.1,mShape:'none'},'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.19,aC:.004,ah:280,bL:.64,bC:.2,bh:38,pitch:1.8,dotR:.6,sizeVar:.12,irregular:.06,density:1.25,rag:.02,over:'multiply'},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.16,iC:.004,ih:280,density:1.4,starve:0,mottle:0,bite:.2})},
    clips:{ type:(g,w,h)=>{ const X=w*.055; typeAt(g,'Q4 FIELD REVIEW · Ø CO.',X,h*.13,h*.036,{font:'mono',weight:600,track:h*.008}); typeAt(g,'Night',X,h*.43,h*.215,{track:-h*.008}); typeAt(g,'Survey.',X,h*.64,h*.215,{track:-h*.008});
        typeAt(g,'What the instruments saw,',X,h*.76,h*.052,{weight:500}); typeAt(g,'October to December.',X,h*.825,h*.052,{weight:500}); typeAt(g,'24.10.2026',X,h*.935,h*.036,{font:'mono',weight:600,track:h*.006}); typeAt(g,'01 / 18',w*.955,h*.13,h*.036,{font:'mono',weight:600,track:h*.006,align:'right'}); },
      sky:(g,w,h)=>g.fillRect(w*.42,0,w*.58,h) },
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr, PX=w*.8, PY=h*.8, PR=h*.68, MX=w*.565, MY=h*.24, MR=h*.045, [lx,ly,lz]=FX.lightVec(), pl=Math.hypot(lx,ly)||1, tl=.42, ct=Math.cos(tl), st_=Math.sin(tl);
      const sph=(u,v,cx,cy,R)=>{ const dx=(u-cx)/R, dy=(v-cy)/R, r2=dx*dx+dy*dy; if(r2>=1) return null; const nz=Math.sqrt(1-r2); return {dx,dy,nz,lam:Math.max(0,dx*lx+dy*ly+nz*lz)}; };
      const field=(u,v,L)=>{ const p=sph(u,v,PX,PY,PR);
        if(!L){ if(!p) return 0; const lat=p.dy*ct-p.dx*st_, band=.06*Math.sin(lat*23+FX.fbm(u/90,v/90,3,3,.5)*2.4)+.035*Math.sin(lat*57+1.3);
          return clamp(.05+Math.pow(1-p.lam,1.2)*.9+band*(.4+.6*(1-p.lam))+Math.pow(1-p.nz,6)*.25,0,.97); }
        const m=sph(u,v,MX,MY,MR); if(m) return clamp(.16+.8*Math.pow(1-m.lam,1.3),0,.96);
        if(p) return 0; const dx=u-PX, dy=v-PY, r=Math.hypot(dx,dy), side=Math.max(0,-(dx*lx+dy*ly)/(r*pl)*-1); const t=(r-PR)/(h*.05); return t<1?.5*Math.pow(1-t,2.2)*Math.pow(side,.8):0; };
      return chain([{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:x.clips.type}},{fx:stipple,o:P('fx-01-stipple'),x:{clip:x.clips.sky,field}}],W,H,dpr,x); } },
  { id:'u-meter', job:'screen', title:'Instrument dial · 24 h in stipple', sub:'A day of readings wound onto a clock face: 48 half-hour bins radiate from a hairline ring, midnight at the top. Each bin is a count of dots, and its tip runs out instead of stopping at a hard cap. The current bin and the needle print in ember, the readout beside them in the same ink, and the hours are struck in type.', uses:['fx-01-stipple','fx-02-ink-edge','fx-07-typewriter','fx-03-paper-tooth'], aspect:'16/9',
    overrides:{'fx-03-paper-tooth':{depth:.02,aniso:1.5,fibers:1.5,pits:.3,form:.1,mShape:'none'},'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.2,aC:.004,ah:280,bL:.64,bC:.2,bh:38,pitch:1.8,dotR:.6,sizeVar:.1,irregular:.06,density:1.25,rag:.02},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.18,iC:.005,ih:280,density:1.3}),'fx-07-typewriter':{stock:'paper',impress:.15,exhaust:0,vari:.15}},
    clips:(()=>{ const D=a_dial; return {
      ink:(g,w,h)=>{ const q=D(w,h), X=w*.6; g.strokeStyle='#fff'; g.lineWidth=.8; g.beginPath(); g.arc(q.cx,q.cy,q.r0-2,0,TAU); g.stroke();
        for(let i=0;i<48;i++){ const a=q.ang(i), L=i%12===0?h*.03:i%2===0?h*.015:0; if(!L) continue; const r1=q.r1+h*.016; g.lineWidth=i%12===0?1:.7; g.beginPath(); g.moveTo(q.cx+Math.cos(a)*r1,q.cy+Math.sin(a)*r1); g.lineTo(q.cx+Math.cos(a)*(r1+L),q.cy+Math.sin(a)*(r1+L)); g.stroke(); }
        typeAt(g,'Respiration',X,h*.2,h*.085,{track:-.4}); typeAt(g,'24 H · HALF-HOUR BINS',X,h*.275,h*.04,{font:'mono',weight:600,track:h*.006}); },
      now:(g,w,h)=>{ const q=D(w,h), X=w*.6, a=q.ang(q.now+.5); typeAt(g,q.fmt(q.now),X-h*.012,h*.66,h*.3,{track:-h*.01}); typeAt(g,'NOW · '+q.hm(q.now),X,h*.75,h*.04,{font:'mono',weight:600,track:h*.006});
        g.save(); g.translate(q.cx,q.cy); g.rotate(a); const e=h*.014; g.beginPath(); g.moveTo(q.r1+e,0); g.lineTo(q.r1+e*3,-e*1.1); g.lineTo(q.r1+e*3,e*1.1); g.closePath(); g.fill(); g.restore(); },
      clock:(g,w,h)=>{ const q=D(w,h); [[0,'00'],[12,'06'],[24,'12'],[36,'18']].forEach(([i,t])=>{ const a=q.ang(i), r=q.r1+h*.09, fs=h*.044; sub(g,q.cx+Math.cos(a)*r-fs*1.2,q.cy+Math.sin(a)*r-fs*.85,fs*2.4,fs*1.7,(g,c,d)=>strikes(g,c,d,{text:t,fsize:fs,seed:70+i,exhaust:0})); });
        sub(g,w*.6,h*.8,w*.38,h*.15,(g,c,d)=>strikes(g,c,d,{text:'LOW  '+q.fmt(q.lo)+'  '+q.hm(q.lo)+' / HIGH '+q.fmt(q.hi)+'  '+q.hm(q.hi),fsize:h*.04,lead:1.5,align:'left',seed:77,exhaust:0})); } }; })(),
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr,q=a_dial(w,h),C=x.clips;
      const field=(u,v,L)=>{ const dx=u-q.cx, dy=v-q.cy, r=Math.hypot(dx,dy); if(r<q.r0||r>q.r1+1) return 0; let a=Math.atan2(dy,dx)+PI/2; a=((a%TAU)+TAU)%TAU; const f=a/TAU*48, i=Math.floor(f), fr=f-i;
        if(!L){ for(const g_ of [.5,1]){ const rg=q.r0+(q.r1-q.r0)*g_; if(Math.abs(r-rg)<.55&&(i!==q.now)) return .32; } }
        if(fr<.13||fr>.87) return 0; if((i===q.now)!==!!L) return 0; const rt=q.r0+(q.r1-q.r0)*q.val(i); if(r>rt) return 0; const t=(rt-r)/Math.min(9,rt-q.r0); return (t<1?FX.ease(['out',1.8],t):1)*.94; };
      return chain([{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:C.ink}},{fx:inkEdge,o:Object.assign({},P('fx-02-ink-edge'),{iL:.64,iC:.2,ih:38}),x:{clip:C.now}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.clock}}},{fx:stipple,o:P('fx-01-stipple'),x:{field}}],W,H,dpr,x); } },
  { id:'u-chart', job:'data', title:'Editorial figure · two years in stipple', sub:'A figure as it would run in print. Visitors per day at a corner café, last year in black and this year in ember. Each area is stipple, densest at its line and thinning to the baseline. This year\'s ember fills only the band above last year\'s line, so the gain the terrace opened reads without a legend. Hairline grid and direct labels; the axis and the note are struck in type.', uses:['fx-01-stipple','fx-02-ink-edge','fx-07-typewriter','fx-03-paper-tooth'], aspect:'16/9', span:3,
    overrides:{'fx-03-paper-tooth':{depth:.02,aniso:1.5,fibers:1.5,pits:.3,form:.1,mShape:'none'},'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.2,aC:.004,ah:280,bL:.66,bC:.2,bh:38,pitch:1.95,dotR:.62,sizeVar:.12,irregular:.06,density:1.15,rag:.02},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.18,iC:.005,ih:280,density:1.3}),'fx-07-typewriter':{stock:'paper',impress:.15,exhaust:0,vari:.18}},
    clips:(()=>{ const Q=a_fig, line=(g,q,k,lw)=>{ g.lineWidth=lw; g.lineJoin='round'; g.beginPath(); for(let X=q.x0;X<=q.x1;X+=1.5){ const Y=q.Y(q.d(q.t(X))[k]); X===q.x0?g.moveTo(X,Y):g.lineTo(X,Y); } g.stroke(); };
      return {
      ink:(g,w,h)=>{ const q=Q(w,h); g.strokeStyle='#fff'; typeAt(g,'Café visitors per day',w*.055,h*.13,h*.07,{track:-.5}); typeAt(g,'A terrace opened in May and the summer grew.',w*.055,h*.195,h*.04,{weight:500});
        g.fillRect(q.x0,q.base,q.x1-q.x0,Math.max(.9,h*.0022)); [200,400,600].forEach(v=>{ const Y=q.Y(v); for(let X=q.x0;X<q.x1;X+=5) g.fillRect(X,Y-.4,2.6,.8); });
        for(let m=0;m<=12;m++){ const X=q.x0+(q.x1-q.x0)*m/12; g.fillRect(X-.35,q.base,.7,m%3?3:5); }
        line(g,q,0,1); const tA=q.t(q.xa); g.setLineDash([3,3]); g.lineWidth=.85; g.beginPath(); g.moveTo(q.xa,q.Y(q.d(tA)[1])-4); g.lineTo(q.xa,q.top+h*.03); g.stroke(); g.setLineDash([]);
        typeAt(g,'2025',q.x1+h*.02,q.Y(q.d(1)[0])+h*.045,h*.045,{weight:700}); },
      ember:(g,w,h)=>{ const q=Q(w,h); g.strokeStyle='#fff'; line(g,q,1,1.3); typeAt(g,'2026',q.x1+h*.02,q.Y(q.d(1)[1])-h*.015,h*.045,{weight:700}); },
      typed:(g,w,h)=>{ const q=Q(w,h), fs=h*.036; 'JFMAMJJASOND'.split('').forEach((c,m)=>{ const X=q.x0+(q.x1-q.x0)*(m+.5)/12; sub(g,X-fs,q.base+h*.02,fs*2,fs*1.8,(g,a,b)=>strikes(g,a,b,{text:c,fsize:fs,seed:40+m,exhaust:0})); });
        [0,200,400,600].forEach((v,k)=>sub(g,q.x0-fs*2.5,q.Y(v)-fs*.82,fs*2.2,fs*1.6,(g,a,b)=>strikes(g,a,b,{text:String(v),fsize:fs,seed:60+k,exhaust:0})));
        sub(g,q.xa-h*.02-fs*8.2,q.top+h*.04,fs*8.2,fs*3.4,(g,a,b)=>strikes(g,a,b,{text:'12 MAY / TERRACE OPENS',fsize:fs,lead:1.4,align:'left',seed:66,exhaust:0}));
        sub(g,w*.62,h*.075,w*.33,fs*2,(g,a,b)=>strikes(g,a,b,{text:'FIG. 3 · DOOR COUNTER',fsize:fs,align:'left',seed:68,exhaust:0})); } }; })(),
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr,q=a_fig(w,h),C=x.clips;
      const field=(u,v,L)=>{ if(u<q.x0||u>q.x1||v>q.base) return 0; const dd=q.d(q.t(u)), c=q.Y(dd[L?1:0]); if(v<c) return 0; if(L&&v>q.Y(dd[0])) return 0; return FX.ease(['in',1.7],clamp(1-(v-c)/(q.base-c),0,1))*.86+.05; };
      return chain([{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:C.ink}},{fx:inkEdge,o:Object.assign({},P('fx-02-ink-edge'),{iL:.62,iC:.2,ih:38}),x:{clip:C.ember}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.typed}}},{fx:stipple,o:P('fx-01-stipple'),x:{field}}],W,H,dpr,x); } }
];

/* clips: anything an effect draws with fonts or paths (dies, typed strikes, a typed mask) is rasterized on the main thread
   and passed in as Float32 alpha. FXSET.clips(id, W, H, dpr, o[, image]) → { name: Float32Array } — usable outside the sheet. */
const umaskDraw=(g,w,h,o,img)=>{ if(o.mShape==='type'){ let fs=h*.6; const f=x=>`800 ${x}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.font=f(fs); const tw=g.measureText(o.mText||' ').width; fs*=Math.min(1,(w*.88)/Math.max(1,tw)); g.font=f(fs); const t2=g.measureText(o.mText||' ').width; g.textBaseline='alphabetic'; g.fillText(o.mText||'',(w-t2)/2,h/2+fs*.36); }
  else if(o.mShape==='image'&&img){ const k=Math.min(w/img.width,h/img.height)*.9, iw=img.width*k, ih=img.height*k; g.drawImage(img,(w-iw)/2,(h-ih)/2,iw,ih); } };
const clipsFor=(e,W,H,dpr,o,img,mk)=>{ const make=mk?((W,H)=>mk(W,H)):((W,H)=>{ const c=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(W,H):Object.assign(document.createElement('canvas'),{width:W,height:H}); return c; });
  const out={}, draw=(name,fn,lumi)=>{ const c=make(W,H), g=c.getContext('2d',{willReadFrequently:true}); g.clearRect(0,0,W,H); g.setTransform(dpr,0,0,dpr,0,0); g.fillStyle='#fff'; fn(g,W/dpr,H/dpr); const d=g.getImageData(0,0,W,H).data, f=new Float32Array(W*H);
    if(lumi){ let opaque=true; for(let j=3;j<d.length;j+=40) if(d[j]<250){ opaque=false; break; } for(let i=0,j=0;i<f.length;i++,j+=4){ const a=d[j+3]/255; f[i]=opaque?1-(d[j]*.2126+d[j+1]*.7152+d[j+2]*.0722)/255:a; } } else for(let i=0,j=3;i<f.length;i++,j+=4) f[i]=d[j]/255; out[name]=f; };
  for(const k in (e.clips||{})) draw(k,(g,w,h)=>e.clips[k](g,w,h,o));
  if(o&&(o.mShape==='type'||(o.mShape==='image'&&img))) draw('umask',(g,w,h)=>{ if(o.mShape==='image'){ g.fillStyle='#fff'; g.fillRect(0,0,w,h); } umaskDraw(g,w,h,o,img); },o.mShape==='image');
  return out; };

/* an art-directed light per usage: its own elevation; azimuth follows the sheet light's turn from default */
const lightFor=(u,L)=>u&&u.light?{az:((u.light.az+(L.az-225))%360+360)%360,el:u.light.el}:L;
G.FXSET={ code:'T-04', lightFor, clips:(id,W,H,dpr,o,img,mk)=>clipsFor(FXSET.effects.find(e=>e.id===id),W,H,dpr,o,img,mk), title:'Effect set · Four surfaces', short:'Four surfaces', set:'Set 01',
  premise:'Two stocks and two marks, one material system. Paper and cloth are height fields; pen dots and a roller print into them through one ink chain; one sheet light rakes all of it. No gradient stands in for anything.',
  system:{ read:'Ink on real stock under one raking light.', sharedCause:['stock height field → relief shading · ink acceptance · starved pinholes · wicking · ink mottle','sheet light → paper relief · thread modeling · thread cast shadows · object shadows on the page'], passOrder:['stock height (tooth · fibers · pits · formation | threads)','albedo (paper L, thread dyes in OKLab)','ink pressure (dot footprints | roller run-out) × mask','acceptance vs height → starve → wick → film thickness','color: Beer–Lambert film in linear light (or coverage mix)','light: × Lambert shade × height shadow (once, last)','page: object cast shadow, sRGB encode'] },
  source:'Mindgut · Technique & Front-End Study V01 §08 (texture recipes) · ø co. · 2026-10-23',
  jobs:[['brand','Stationery & brand'],['print','Print'],['packaging','Packaging'],['textile','Textile'],['screen','Screen & deck'],['data','Data']],
  sections:[{id:'surfaces',title:'Four surfaces',blurb:'The source set: two stocks and two marks.'},{id:'surprise',title:'Surprise marks',blurb:'Marks that only make sense on a material system — one is pure light, one is metal, one is struck through cloth, one gleams.'},{id:'new',title:'New marks',blurb:'Finishes and fibers past ink: each one exists only because the stock and the sheet light do.'}],
  effects:[stipple,inkEdge,tooth,weave,graphite,deboss,typewriter,foil,spotUV,embroidery,cyanotype,laser], usages };
})(typeof window!=='undefined'?window:self);
