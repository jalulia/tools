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
  for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const u=X/dpr, i=y*W+X;
    let n=FX.fbm((u*gc+v*gs)/sa,(-u*gs+v*gc)/sb,s,t.oct|0,t.pers); n=FX.ease(t.ease,clamp((n-.5)*2.4+.5,0,1));
    const f=FX.fbm(u/t.formScale,v/t.formScale,s+101,3,.5); form[i]=f; h[i]=lerp(n,n*.55+(f-.25)*.9,t.form); } }
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
  for(let i=0,k=0;i<W*H;i++,k+=3){ const Lp=clamp(t.paperL-t.fDark*P.fib[i]-t.pDark*P.pit[i],0,1), a=Lp*Lp*Lp; alb[k]=alb[k+1]=alb[k+2]=a;
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
    if(cW<=0&&cF<=0) continue;
    const top=warpTop?cW:cF, und=warpTop?cF:cW, T=warpTop?Wp:Fp, U=warpTop?Fp:Wp, nT=warpTop?i:j, nU=warpTop?j:i;
    const acrT=warpTop?dx/hwW:dy/hwF, acrU=warpTop?dy/(hwF||1):dx/(hwW||1), cylT=Math.sqrt(Math.max(0,1-acrT*acrT)), cylU=Math.sqrt(Math.max(0,1-acrU*acrU));
    const [ra,rb]=run(ti,tj,warpTop), span=ra+rb+1, pos=warpTop?(v-(Fp.c[j]-ph/2))/ph+ra:(u-(Wp.c[i]-pw/2))/pw+ra, along=Math.pow(Math.max(0,Math.sin(PI*clamp(pos/span,0,1))),.5);
    const pp=Math.min(pw,ph), al=warpTop?v:u, ac=warpTop?u:v, hr=o.hair*(FX.vnoise(al/(pp*.45)+nT*3.1,ac/Math.max(.35,pp*.09),s+31)-.5);
    const hT=(.42+.58*Math.pow(cylT,.75)*(.3+.7*along))*(worn?.82:1)+hr*.35, hU=.08+.3*cylU;
    h[id]=und*hU*(1-top)+top*hT; a[id]=Math.max(top,und); hair[id]=top*clamp(hr*2+.5,0,1)*o.hair;
    const k=id*3; px[0]=alb[k];px[1]=alb[k+1];px[2]=alb[k+2];
    const fleck=o.aMode!=='threads'&&hash(ti,tj,s+41)<o.accent, inkT=(T.acc[nT]||fleck)?acc:T.base, inkU=U.acc[nU]?acc:U.base;
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
function inkChain(Pb,st,o,ink,alb,A,W,H,dpr,seed,rule,ang=0,streak=1,tauMap=null){
  const film=rule==='film', LUT=film?FX.filmLUT(ink):null, ca=Math.cos(ang*PI/180), sa=Math.sin(ang*PI/180), g=o.split, b=.05, px=[0,0,0]; let n=0;
  // pass 1 · the effective surface height under the inked area (stock height + film-splitting noise)
  const E=new Float32Array(W*H), hist=new Uint32Array(512); let cnt=0;
  for(let y=0;y<H;y++){ const v=y/dpr; for(let X=0;X<W;X++){ const i=y*W+X; if(Pb[i]<=.002) continue; const u=X/dpr;
    const al=u*ca+v*sa, ac=-u*sa+v*ca, fs=.6*FX.fbm(al/(g*streak),ac/g,seed+3,2,.5)+.4*FX.blue.at(X,y);
    const e=st?lerp(fs,st.h[i]*.8+fs*.2,o.bite):fs; E[i]=e; hist[clamp((e*400)|0,0,511)]++; cnt++; } }
  // pass 2 · height → percentile, so pressure P inks exactly the top P of the surface (and starve = the lowest share)
  const cdf=new Float32Array(512); let acc_=0; for(let k=0;k<512;k++){ acc_+=hist[k]; cdf[k]=cnt?acc_/cnt:0; }
  for(let i=0;i<W*H;i++){ const P=Pb[i]; if(P<=.002) continue; const q=cdf[clamp((E[i]*400)|0,0,511)], th=1-P;
    let acc=sstep(th-b,th+b,q)*sstep(o.starve-b*.5,o.starve+b*.5,q);
    if(st&&o.wick>0&&st.fib) acc=Math.max(acc,o.wick*st.fib[i]*sstep(.04,.55,P));
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
    const hh=st?st.h[i]:FX.fbm(X/dpr/1.1,y/dpr/1.1,seed+7,2,.5)+(FX.blue.at(X,y)-.5)*.25, P=D.pr[i];
    let c=clamp(sd+rag*(hh-hm)+.5,0,1);
    if(c>0&&o.starve>0&&hh<hm-.5+o.starve*(1.6-P)*1.4) c*=.0;
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
    const layers=o.duo==='on'?2:1, alb=baseAlb(st,x,W,H), A=new Float32Array(W*H); let marks=0; const p=o.pitch, nx=Math.ceil(w/p)+1, ny=Math.ceil(h/p)+1, rad=new Array(7);
    for(let L=0;L<layers;L++){ const D=FX.DotSD(W,H), sL=s*31+L*977;
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
        const sx=(i+.5+(hash(i,j,sL+1)-.5)*o.jitter)*p, sy=(j+.5+(hash(i,j,sL+2)-.5)*o.jitter)*p; if(sx<0||sy<0||sx>=w||sy>=h) continue;
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
    {key:'aniso',label:'Anisotropy',group:'dropoff',type:'range',min:1,max:6,step:.05,value:2.2,note:'tooth stretched along the grain angle — machine-made paper is never isotropic; 1 = the 1999 "paper" filter look',limits:[[1,1.3,'reads as a stock emboss filter']]},
    {key:'form',label:'Formation',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.3,note:'low-frequency cloudiness of the sheet (fiber flocs); also mottles any ink printed on it'},
    {key:'formScale',label:'Formation scale',group:'dropoff',type:'range',min:10,max:200,step:1,unit:'px',value:60,note:'size of the flocs'},
    {key:'fAngle',label:'Grain angle',group:'dropoff',type:'range',min:0,max:180,step:1,unit:'°',value:6,note:'machine direction of the fibers and the tooth'},
    {key:'fSpread',label:'Grain spread',group:'dropoff',type:'range',min:0,max:1,step:.01,value:.4,note:'0 = all fibers on the grain; 1 = any direction'},
    {key:'depth',label:'Relief',group:'relief',type:'range',min:0,max:1.6,step:.005,unit:'px',value:.12,curve:2.5,note:'height of the tooth in CSS px — how hard the light can rake it. The slider is weighted to the subtle end.',limits:[[.6,1.6,'stucco — the 1999 emboss look']]},
    {key:'diffuse',label:'Diffuse share',group:'relief',type:'range',min:0,max:1,step:.01,value:.45,note:'share of light from the sheet light vs flat ambient fill'},
    {key:'fRaise',label:'Fiber raise',group:'relief',type:'range',min:0,max:1,step:.01,value:.45,note:'how far fibers stand proud of the sheet'},
    {key:'pDepth',label:'Pit depth',group:'relief',type:'range',min:0,max:1,step:.01,value:.35,note:'how deep pits go'},
    {key:'paperL',label:'Paper L',group:'color',type:'range',min:.85,max:1,step:.001,value:1,note:'OKLab lightness of the stock — 1 = the white of the page'},
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
const weave={ presets:[['source · linen',{}],['natural linen',{wL:.78,wC:.022,wh:82,fL:.84,fC:.02,fh:86,accent:.006,warp:34,weft:32}],['fine shirting',{warp:60,weft:56,fill:.94,slub:.12,hair:.12,depth:.9,wL:.9,wC:.01,wh:250,fL:.95,fC:.004,fh:250,accent:0}],['denim 2/1',{pattern:'twill 2/1',warp:48,weft:40,fill:.97,wL:.36,wC:.075,wh:262,fL:.8,fC:.015,fh:85,accent:0,dye:.04,slub:.55,hair:.4,depth:1}],['canvas duck',{pattern:'basket',warp:14,weft:14,fill:.95,wL:.85,wC:.03,wh:85,fL:.82,fC:.03,fh:82,accent:0,hair:.5,depth:1.6}]], id:WEAVE, code:'FX-04', name:'Weave', role:'stock · cloth',
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
    {key:'accent',label:'Accent rate',group:'color',type:'range',min:0,max:.3,step:.005,value:.035,note:'share of floats (flecks) or threads dyed the accent',limits:[[.15,.3,'stops being an accent']]},
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
  {key:'shape',label:'Die',group:'density',type:'select',options:['ø mark','word','seal'],value:d.shape||'ø mark',note:'what the die (or type) is: the ø co. brandmark, a word, or a ring seal'},
  {key:'text',label:'Text',group:'density',type:'text',value:d.text||'Four surfaces',maxlength:40,note:'set in Archivo 800 for word and seal',when:{shape:['word','seal']}},
  {key:'size',label:'Size',group:'density',type:'range',min:.15,max:1,step:.01,value:d.size??.62,note:'die height as a share of the plate'}];
const drawShape=(g,w,h,o)=>{ const S_=Math.min(w,h)*o.size, cx=w/2, cy=h/2; g.save();
  if(o.shape==='word'){ let fs=S_*.42; const f=x=>`800 ${x}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.font=f(fs); const tw=g.measureText(o.text||' ').width; fs*=Math.min(1,(w*.84)/Math.max(1,tw)); g.font=f(fs); const t2=g.measureText(o.text||' ').width; g.textBaseline='alphabetic'; g.fillText(o.text||'',cx-t2/2,cy+fs*.36); }
  else if(o.shape==='seal'){ const R0=S_*.5; g.beginPath(); g.arc(cx,cy,R0,0,TAU); g.arc(cx,cy,R0*.93,0,TAU,true); g.fill('evenodd'); g.beginPath(); g.arc(cx,cy,R0*.66,0,TAU); g.arc(cx,cy,R0*.62,0,TAU,true); g.fill('evenodd');
    const t=((o.text||'')+' · ').toUpperCase(), fs=R0*.13; g.font=`800 ${fs}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.textBaseline='middle'; const n=t.length, rr=R0*.79; for(let k=0;k<n;k++){ g.save(); const a=-PI/2+k/n*TAU; g.translate(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); g.rotate(a+PI/2); g.fillText(t[k],-g.measureText(t[k]).width/2,0); g.restore(); }
    g.translate(cx,cy); const k=R0*.6/103.65; g.scale(k,k); g.translate(-682.33,-139.46); MARKP(g); }
  else { g.translate(cx,cy); const k=S_*.5/103.65; g.scale(k,k); g.translate(-682.33,-139.46); MARKP(g); }
  g.restore(); };
/* the ø co. brandmark (TT.mark geometry): thick ring + 45° bar */
const MARKP=(g)=>{ g.beginPath(); g.arc(682.33,139.46,103.65,0,TAU); g.arc(682.33,139.46,48.29,0,TAU,true); g.fill('evenodd'); g.save(); g.translate(682.33,139.46); g.rotate(PI/4); g.fillRect(-16.145,-144.915,32.29,289.83); g.restore(); };
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
    ...STOCK_PARAMS({bite:.6,breakup:.9,starve:.02,wick:0,mottle:.1,split:.7}).filter(p=>p.key!=='wick'),
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
    const g=FX.inkOf(o,'g'), alb=baseAlb(st,x,W,H), A=new Float32Array(W*H); inkChain(Pb,st,o,g,alb,A,W,H,dpr,s,'oklab');
    const hs=stockH(st,x.S), hpx=new Float32Array(W*H); for(let i=0;i<W*H;i++){ const base=st?st.h[i]*hs:0; hpx[i]=base+(A[i]>0?A[i]*o.burnish*(FX.vnoise(i%W/dpr*.9*Math.cos(dir[i])+((i/W)|0)/dpr*.9*Math.sin(dir[i]),(-(i%W)/dpr*Math.sin(dir[i])+((i/W)|0)/dpr*Math.cos(dir[i]))*.12,s+9)):0); }
    const N=FX.normals(hpx,W,H,dpr), [hx,hy,hz]=FX.halfVec(), lf=x.lf||(st?st.lf:null), lin=light(alb,lf,W,H);
    for(let i=0,k=0;i<W*H;i++,k+=3){ const a=A[i]; if(a<=0) continue; const nh=Math.max(0,N.nx[i]*hx+N.ny[i]*hy+N.nz[i]*hz), sp=o.sheen*Math.min(1,a)*Math.pow(nh,o.shin)*.9; lin[k]+=sp; lin[k+1]+=sp; lin[k+2]+=sp*1.02; }
    return {alb,lf,lin,ink:A,stock:hpx.map?hpx:null,mask:M,marks:strokes,markUnit:'strokes'}; } };

/* FX-06 · Blind deboss — no ink at all: a die pressed into the stock; the sheet light draws it */
const deboss={ id:'fx-06-deboss', code:'FX-06', name:'Blind deboss', role:'mark · die', section:'surprise', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  clips:{ die:(g,w,h,o)=>drawShape(g,w,h,o) },
  presets:[['blind ø',{}],['seal',{shape:'seal',text:'Impøssible Outcomes',size:.8,depth:.7}],['letterpress word',{shape:'word',text:'Counted',ink:1,depth:.55,size:.5}],['emboss',{depth:-.6,lip:0}]],
  sub:'A mark with no ink. A die presses into the stock: the floor crushes the tooth flat, the walls take the light or the shadow, a lip rises at the edge. Move the light and the mark appears, flips, or disappears. Ink it to get letterpress.',
  recipe:['Die = the ø co. brandmark, a word, or a ring seal, rasterized as an AA clip on the main thread (fonts).','Plate profile = the clip blurred by the die softness; lip = a wider blur minus the plate (only outside the edge).','Height (CSS px) = stock height × (1 − crush · plate) − depth · plate + lip — the tooth flattens on the floor.','Light: Lambert from the combined height + a height-field shadow toward the sheet light (the wall on the light side falls in shadow).','Optional ink on the floor (film), so blind → letterpress is one dial.'],
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
  run(o,W,H,dpr,x={}){ const st=stockFor(o,x,W,H,dpr), clip=(x.clips&&x.clips.die)||new Float32Array(W*H), P=FX.blur(clip,W,H,o.soft*dpr*.5), P2=FX.blur(clip,W,H,o.soft*dpr*1.6+2*dpr);
    const hs=stockH(st,x.S), hpx=new Float32Array(W*H); for(let i=0;i<W*H;i++){ const base=st?st.h[i]*hs:0, lip=Math.max(0,P2[i]-P[i])*o.lip*2; hpx[i]=base*(1-o.crush*P[i])-o.depth*P[i]+lip*(o.depth>=0?1:-1); }
    const lf=litFrom(hpx,W,H,dpr,o.diffuse,o.shadow), alb=baseAlb(st,x,W,H), A=new Float32Array(W*H);
    if(o.burnish>0) for(let i=0,k=0;i<W*H;i++,k+=3){ const f=1-o.burnish*3*P[i]; alb[k]*=f; alb[k+1]*=f; alb[k+2]*=f; }
    if(o.ink>0){ const ink=FX.inkOf(o,'i'), LUT=FX.filmLUT(ink), px=[0,0,0]; for(let i=0,k=0;i<W*H;i++,k+=3){ const a=clip[i]*o.ink*1.2; if(a<=0) continue; A[i]=a; if(o.mix==='film'){ const j=((a>=2?1024:a*512+.5)|0)*3; alb[k]*=LUT[j]; alb[k+1]*=LUT[j+1]; alb[k+2]*=LUT[j+2]; } else { px[0]=alb[k];px[1]=alb[k+1];px[2]=alb[k+2]; FX.mixInto(px,ink,Math.min(1,a),o.mix); alb[k]=px[0];alb[k+1]=px[1];alb[k+2]=px[2]; } } }
    if(st&&st.lf){ for(let k=0;k<lf.length;k++) lf[k]*=lerp(1,st.lf[k],.25); }
    carryLF(lf,x.lf,st);
    const M=new Float32Array(W*H); for(let i=0;i<W*H;i++) M[i]=P[i];
    return {alb,lf,lin:light(alb,lf,W,H),ink:A,stock:hpx,mask:M,marks:0,markUnit:'inks · light only'}; } };

/* FX-07 · Typewriter strike — glyphs struck through a woven ribbon, each with its own pressure, impressed into the stock */
const typewriter={ id:'fx-07-typewriter', code:'FX-07', name:'Typewriter strike', role:'mark · type bar', section:'surprise', stockOf:o=>o.stock==='paper'?TOOTH:o.stock==='cloth'?WEAVE:null,
  clips:{ strikes:(g,w,h,o)=>{ const R_=FX.rng((o.seed|0)+5), lines=String(o.text||'').split('/').map(t=>t.trim()); let fs=o.fsize; g.font=`500 ${fs}px "JetBrains Mono", ui-monospace, monospace`; const mw0=Math.max(...lines.map(l=>l.length))*g.measureText('M').width; if(mw0>w*.86) fs*=w*.86/mw0; const lh=fs*o.lead; g.font=`500 ${fs}px "JetBrains Mono", ui-monospace, monospace`; const x0=o.align==='left'?2:Math.max(2,(w-Math.max(...lines.map(l=>l.length))*g.measureText('M').width)/2); let y=h*.5-((lines.length-1)*lh)/2+fs*.32, n=0, tot=lines.join('').length||1;
      g.font=`500 ${fs}px "JetBrains Mono", ui-monospace, monospace`; g.textBaseline='alphabetic'; const cw=g.measureText('M').width;
      for(const ln of lines){ let xx=x0; for(const ch of ln){ n++; if(ch!==' '){ const life=1-o.exhaust*FX.ease(['in',1.6],n/tot), p=clamp(life*(1-o.vari*R_()),.12,1), half=R_()<o.half;
          g.save(); g.translate(xx+(R_()-.5)*o.jx,y+(R_()-.5)*o.jy+(R_()<.08?o.jy*.8:0)); g.rotate((R_()-.5)*o.rot*PI/180);
          if(half){ const gr=g.createLinearGradient(0,-fs*.8,0,fs*.1), top=R_()<.5; gr.addColorStop(0,`rgba(255,255,255,${top?p:p*.25})`); gr.addColorStop(1,`rgba(255,255,255,${top?p*.25:p})`); g.fillStyle=gr; } else g.fillStyle=`rgba(255,255,255,${p})`;
          g.fillText(ch,0,0); g.restore(); } xx+=cw; } y+=lh; } } },
  presets:[['office ribbon',{}],['worn ribbon',{exhaust:.75,vari:.5,half:.12,ribbon:.9}],['carbon copy',{ribbon:.15,iL:.45,iC:.12,ih:265,bite:.4,impress:.2,vari:.35}],['bichrome red',{iL:.5,iC:.19,ih:28}],['on linen',{stock:'cloth',fsize:20,impress:0}]],
  sub:'Each glyph is a separate strike: its own pressure, a slight offset and rotation, sometimes only half the face lands. Ink passes through a woven ribbon, so letters carry the ribbon\'s weave; the type bar also dents the paper — visible under a low light.',
  recipe:['Text in JetBrains Mono, one strike per glyph on the main thread: pressure = ribbon life (exhausting along the page) × key variance; offset, rotation, an occasional dropped baseline; half-strikes fade top or bottom.','Ribbon: a plain weave at the ribbon count — ink transfers through thread crossings, less through the gaps.','Ink chain: pressure × ribbon vs stock-height percentile; ink squash pools film at the glyph edge.','Impression: the strike dents the stock (blurred glyph × pressure); light from the combined height.','Color: Beer–Lambert film.'],
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
    for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X, base=sh[i]*hs; hpx[i]=base*(1-o.crush*dent[i])+dent[i]*(o.grain*(FX.fbm(X/dpr/1.3,y/dpr/1.3,s+4,3,.55)-.5)*2)-o.dent*dent[i]; }
    const N=FX.normals(hpx,W,H,dpr), [lx,ly,lz]=FX.lightVec(), fl=FX.inkOf(o,'f'), w2=W/dpr/2, h2=H/dpr/2, camZ=o.cam*Math.max(w2,h2)*2;
    const alb=baseAlb(st,x,W,H), lfb=x.lf||(st?st.lf:null), lin=light(alb,lfb,W,H), cov=new Float32Array(W*H), o3=[0,0,0]; let n=0;
    for(let y=0;y<H;y++) for(let X=0;X<W;X++){ const i=y*W+X; let c=clip[i]; if(c<=0) continue;
      if(st&&hp[i]<q) c=0; if(c>0&&c<1&&o.flash>0) c=FX.blue.at(X,y)<lerp(c,c*c,o.flash)?1:lerp(0,c,1-o.flash); if(c<=0) continue; cov[i]=c; n++;
      // perspective viewer above the plate center: the soft-box reflection sweeps across the foil — the cue that reads as metal
      const px_=X/dpr-w2, py_=y/dpr-h2; let vx=-px_, vy=-py_, vz=camZ; const vl=Math.hypot(vx,vy,vz); vx/=vl; vy/=vl; vz/=vl;
      const nx=N.nx[i], ny=N.ny[i], nz=N.nz[i], nv=nx*vx+ny*vy+nz*vz, rx=2*nv*nx-vx, ry=2*nv*ny-vy, rz=2*nv*nz-vz;
      const rl=Math.max(0,rx*lx+ry*ly+rz*lz), env=(Math.pow(rl,o.box)+.35*Math.pow(Math.max(0,rx*-lx+ry*-ly+rz*lz),o.box*2))*o.mirror;
      let hx2=lx+vx, hy2=ly+vy, hz2=lz+vz; const hl=Math.hypot(hx2,hy2,hz2); const glint=Math.pow(Math.max(0,(nx*hx2+ny*hy2+nz*hz2)/hl),o.shin);
      let base=fl.lin; if(o.finish==='holo'){ const ang=Math.atan2(ny,nx)+(rl*2), hh=fl.h*PI/180+o.holo*ang*1.6, C=Math.max(fl.C,.09); FX.lab2lin(fl.L,C*Math.cos(hh),C*Math.sin(hh),o3); base=[clamp(o3[0],0,1),clamp(o3[1],0,1),clamp(o3[2],0,1)]; }
      const k=i*3; for(let ch=0;ch<3;ch++){ const m=base[ch]*(.1+1.8*env)+glint*(.35+.65*base[ch]); lin[k+ch]=lin[k+ch]*(1-c)+m*c; } }
    return {alb,lf:lfb,lin,ink:cov,stock:hpx,mask:clip,marks:n,markUnit:'foiled px'}; } };

/* ══════════ usages · compositions; each reads the live dials merged with its overrides ══════════ */
const onPage=(R,alpha,W,H,dpr,lift)=>{ const cs=FX.castShadow(alpha,W,H,dpr,FX.LIGHT,lift), lin=R.lin; for(let i=0,k=0;i<W*H;i++,k+=3){ const a=alpha[i], pg=1-cs[i]; lin[k]=lin[k]*a+pg*(1-a); lin[k+1]=lin[k+1]*a+pg*(1-a); lin[k+2]=lin[k+2]*a+pg*(1-a); } R.mask=alpha; return R; };
const LINEN={wL:.78,wC:.022,wh:82,fL:.84,fC:.02,fh:86,aMode:'flecks',accent:.006,warp:34,weft:32,mShape:'none',lift:0};

/* ── composition kit for usages ── */
const sub=(g,x0,y0,w,h,fn)=>{ g.save(); g.translate(x0,y0); fn(g,w,h); g.restore(); };
const strikes=(g,w,h,o)=>typewriter.clips.strikes(g,w,h,Object.assign(defaultsOf(typewriter),o));
const dieOf=(g,w,h,o)=>drawShape(g,w,h,Object.assign({shape:'ø mark',text:'',size:.9},o));
const typeAt=(g,text,x0,y0,size,{font='Archivo',weight=800,align='left',track=0,maxW=0}={})=>{ let fs=size; const f=()=>`${weight} ${fs}px ${font==='mono'?'"JetBrains Mono", ui-monospace, monospace':'Archivo, "Helvetica Neue", Arial, sans-serif'}`; g.font=f(); if(maxW){ const tw=g.measureText(text).width; if(tw>maxW){ fs*=maxW/tw; g.font=f(); } } if('letterSpacing' in g) g.letterSpacing=track+'px'; const tw=g.measureText(text).width; g.textBaseline='alphabetic'; g.fillText(text,align==='center'?x0-tw/2:align==='right'?x0-tw:x0,y0); if('letterSpacing' in g) g.letterSpacing='0px'; return fs; };
/* run steps in print order: each prints into the albedo and light the previous one left. Lin-only layers (foil, graphite sheen) are flagged top and composited last. */
function chain(steps,W,H,dpr,x){ let alb=null, lf=null, R=null; const tops=[];
  for(const s of steps){ const xx=Object.assign({S:x.S},s.x||{}); if(alb){ xx.alb=alb; xx.lf=lf; } R=s.fx.run(s.o,W,H,dpr,xx); if(s.top) tops.push({lin:R.lin,cov:R.ink}); else { alb=R.alb; lf=R.lf; } }
  const lin=alb?light(alb,lf,W,H):R.lin, ink=new Float32Array(W*H);
  for(const t of tops) for(let i=0,k=0;i<W*H;i++,k+=3){ const c=Math.min(1,t.cov[i]); if(c<=0) continue; lin[k]+=(t.lin[k]-lin[k])*c; lin[k+1]+=(t.lin[k+1]-lin[k+1])*c; lin[k+2]+=(t.lin[k+2]-lin[k+2])*c; ink[i]=Math.max(ink[i],c); }
  return Object.assign({},R,{lin,alb,lf,ink:R.ink}); }
const INK={ black:{iL:.2,iC:.006,ih:280}, red:{iL:.52,iC:.17,ih:27}, blue:{iL:.45,iC:.16,ih:262}, ember:{iL:.64,iC:.2,ih:40} };
const COLD={scale:4,oct:4,depth:.38,ease:['out',1.4],aniso:1.4,fibers:2,diffuse:.55,mShape:'none'};
const NEWS={paperL:.955,tL:.72,tC:.03,th:85,tAmt:.8,fibers:16,fDark:.05,fWidth:.5,pits:6,pDark:.06,depth:.1,mShape:'none'};
const DUCK={pattern:'basket',warp:40,weft:40,fill:.95,wL:.83,wC:.03,wh:84,fL:.8,fC:.032,fh:80,accent:0,hair:.5,depth:1.4,mShape:'none',lift:0};
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

const usages=[
  /* ═══ stationery & brand ═══ */
  { id:'u-suite', job:'brand', title:'Stationery suite · flat-lay', sub:'Three pieces thrown on the desk: a letterhead blind-stamped and typed, an envelope sealed with a red letterpress ring over its flap, a business card in gold foil. Each lies on the one below and shades it by the same low window light.', uses:['fx-06-deboss','fx-07-typewriter','fx-08-foil','fx-03-paper-tooth'], aspect:'16/9', span:2, light:{az:228,el:27},
    overrides:{'fx-06-deboss':{depth:.8,soft:.9,lip:.1,stock:'paper',shadow:.85},'fx-07-typewriter':{stock:'paper',impress:.3,exhaust:.12,vari:.25},'fx-08-foil':{stock:'paper',crush:.6}},
    clips:(()=>{ const LH=(w,h)=>{ const hS=h*1.06; return {cx:w*.28,cy:h*.56,w:hS*.707,h:hS,rot:-.07}; }, EV=(w,h)=>{ const ew=w*.44; return {cx:w*.63,cy:h*.36,w:ew,h:ew*.5,rot:.06}; }, CD=(w,h)=>{ const cw=w*.21; return {cx:w*.72,cy:h*.73,w:cw,h:cw*.647,rot:-.13}; };
      const at=(Fr,fn)=>(g,w,h)=>{ const f=Fr(w,h); inFrame(g,f.cx,f.cy,f.rot,f.w,f.h,fn); };
      return {
      lhA:at(LH,(g,a,b)=>g.fillRect(0,0,a,b)), lhDie:at(LH,(g,a,b)=>sub(g,a*.08,a*.08,a*.11,a*.11,(g,c,d)=>dieOf(g,c,d,{size:1}))),
      lhType:at(LH,(g,a,b)=>sub(g,a*.08,a*.26,a*.84,b*.5,(g,c,d)=>strikes(g,c,d,{text:'24 October 2026 / / Dear reader, / / the stock arrives Tuesday. The / mark is blind; the letter is the / ink. Four surfaces, one light. / / — ø co., New York',fsize:a*.037,lead:1.6,align:'left',seed:12}))),
      evA:at(EV,(g,a,b)=>{ rrect(g,0,0,a,b,1.2); g.fill(); }),
      evCrease:at(EV,(g,a,b)=>{ g.strokeStyle='#fff'; g.lineWidth=.9; g.beginPath(); g.moveTo(0,0); g.lineTo(a/2,b*.62); g.lineTo(a,0); g.stroke(); }),
      evSeal:at(EV,(g,a,b)=>sub(g,a/2-b*.22,b*.62-b*.22,b*.44,b*.44,(g,c,d)=>dieOf(g,c,d,{shape:'seal',text:'Impøssible Outcomes · New York',size:.98}))),
      cdA:at(CD,(g,a,b)=>{ rrect(g,0,0,a,b,1); g.fill(); }), cdFoil:at(CD,(g,a,b)=>sub(g,a*.09,b*.16,b*.34,b*.34,(g,c,d)=>dieOf(g,c,d,{size:1}))),
      cdName:at(CD,(g,a,b)=>typeAt(g,'ø co.',a*.09,b*.8,b*.13)), cdLine:at(CD,(g,a,b)=>sub(g,a*.5,b*.7,a*.44,b*.16,(g,c,d)=>strikes(g,c,d,{text:'Brand · Product / New York',fsize:b*.07,lead:1.5,align:'left',seed:4,exhaust:0}))) }; })(),
    run(P,W,H,dpr,x){ const C=x.clips, D=P('fx-06-deboss'), T=P('fx-07-typewriter'), Fo=P('fx-08-foil'), Sv=k=>Object.assign({},x.S,{[TOOTH]:Object.assign({},x.S[TOOTH],{seed:21+k*13})});
      const lh=chain([{fx:deboss,o:D,x:{S:Sv(0),clips:{die:C.lhDie}}},{fx:typewriter,o:T,x:{S:Sv(0),clips:{strikes:C.lhType}}}],W,H,dpr,{S:Sv(0)});
      const ev=chain([{fx:deboss,o:Object.assign({},D,{depth:.35,soft:.5,lip:0}),x:{S:Sv(1),clips:{die:C.evCrease}}},{fx:deboss,o:Object.assign({},D,{shape:'seal',depth:.7,soft:1,ink:.92,iL:.5,iC:.17,ih:27}),x:{S:Sv(1),clips:{die:C.evSeal}}}],W,H,dpr,{S:Sv(1)});
      const cd=chain([{fx:deboss,o:Object.assign({},D,{depth:.45,soft:.4}),x:{S:Sv(2),clips:{die:C.cdName}}},{fx:typewriter,o:Object.assign({},T,{impress:.2,exhaust:0}),x:{S:Sv(2),clips:{strikes:C.cdLine}}},{fx:foil,o:Fo,x:{S:Sv(2),clips:{die:C.cdFoil}},top:true}],W,H,dpr,{S:Sv(2)});
      // the envelope's flap edge casts a hairline shadow onto its own body
      return stack([{lin:lh.lin,alpha:C.lhA,lift:.9},{lin:ev.lin,alpha:C.evA,lift:1.2},{lin:cd.lin,alpha:C.cdA,lift:1.4}],W,H,dpr); } },
  { id:'u-emboss', job:'brand', title:'Raking light · the mark in the sheet', sub:'No ink anywhere. A giant ø raised out of cotton stock, cropped by the frame, and the name pressed in small — lit from 11° so every wall throws a long shadow. Turn the light overhead and it disappears.', uses:['fx-06-deboss','fx-03-paper-tooth'], aspect:'16/9', light:{az:196,el:11},
    overrides:{'fx-03-paper-tooth':{depth:.04,scale:.8,fibers:4,fWidth:.25,pits:.4,form:.2,paperL:.9,mShape:'none'},'fx-06-deboss':{depth:-2.4,soft:2.2,lip:0,crush:.35,stock:'paper',shadow:.85,diffuse:.97}},
    clips:{ big:(g,w,h)=>sub(g,w*.42,-h*.3,h*1.55,h*1.55,(g,a,b)=>dieOf(g,a,b,{size:1})), name:(g,w,h)=>typeAt(g,'Impøssible Outcomes',w*.06,h*.86,h*.065,{track:-.3}) },
    run(P,W,H,dpr,x){ const D=P('fx-06-deboss'); return chain([{fx:deboss,o:D,x:{clips:{die:x.clips.big}}},{fx:deboss,o:Object.assign({},D,{depth:.38,soft:1,lip:.04,crush:.7}),x:{clips:{die:x.clips.name}}}],W,H,dpr,x); } },
  { id:'u-stickers', job:'brand', title:'Sticker sheet · three foils, one peeled', sub:'A kiss-cut sheet of vinyl stickers in gold, silver and holographic foil, the cut lines pressed into the backing — and one sticker peeled up off the sheet, its shadow long because it is lifted.', uses:['fx-08-foil','fx-06-deboss','fx-07-typewriter'], aspect:'4/5', light:{az:238,el:38},
    overrides:{'fx-08-foil':{stock:'smooth',crush:0,dent:0,grain:.35,starve:0,flash:0},'fx-06-deboss':{depth:.25,soft:.3,lip:0,stock:'paper'},'fx-07-typewriter':{stock:'paper',impress:.15,exhaust:0}},
    clips:(()=>{ const SH=(w,h)=>[ ['c',.37,.3,.2,'gold','ø'],['c',.74,.22,.12,'holo','ø'],['p',.6,.49,[.6,.1],'silver','IMPØSSIBLE'],['c',.25,.62,.1,'holo','ø'],['r',.55,.74,.19,'gold','ø'] ], PE={x:.8,y:.73,r:.12,rot:.5};
      const shape=(g,w,s,grow=0)=>{ const [t,cx,cy,sz]=s, X=cx*w, Y=cy*w*1.25; g.beginPath(); if(t==='c') g.arc(X,Y,sz*w+grow,0,TAU); else if(t==='p'){ const [pw,ph]=sz; rrect(g,X-pw*w/2-grow,Y-ph*w/2-grow,pw*w+2*grow,ph*w+2*grow,ph*w/2+grow); } else rrect(g,X-sz*w/2-grow,Y-sz*w/2-grow,sz*w+2*grow,sz*w+2*grow,sz*w*.18); };
      const mark=(g,w,s)=>{ const [t,cx,cy,sz,,m]=s, X=cx*w, Y=cy*w*1.25; if(m==='ø'){ const r=(t==='c'?sz:sz/2)*w*.72; sub(g,X-r,Y-r,2*r,2*r,(g,a,b)=>dieOf(g,a,b,{size:1})); } else typeAt(g,m,X,Y+sz[1]*w*.17,sz[1]*w*.46,{align:'center',maxW:sz[0]*w*.82,track:1}); };
      const fin=f=>(g,w,h)=>SH(w,h).filter(s=>s[4]===f).forEach(s=>mark(g,w,s));
      return {
      sheet:(g,w,h)=>{ rrect(g,w*.07,h*.05,w*.86,h*.9,2); g.fill(); },
      cuts:(g,w,h)=>{ g.strokeStyle='#fff'; g.lineWidth=.7; SH(w,h).forEach(s=>{ shape(g,w,s); g.stroke(); }); g.beginPath(); g.arc(PE.x*w-w*.02,PE.y*w*1.25+w*.03,PE.r*w,0,TAU); g.stroke(); },
      head:(g,w,h)=>sub(g,w*.1,h*.06,w*.5,h*.06,(g,a,b)=>strikes(g,a,b,{text:'ø co. · STICKER SHEET 01',fsize:b*.34,align:'left',seed:9,exhaust:0})),
      vinyl:(g,w,h)=>SH(w,h).forEach(s=>{ shape(g,w,s); g.fill(); }), gold:fin('gold'), silver:fin('silver'), holo:fin('holo'),
      peel:(g,w,h)=>{ g.beginPath(); g.arc(PE.x*w,PE.y*w*1.25,PE.r*w,0,TAU); g.fill(); }, peelMark:(g,w,h)=>{ const r=PE.r*w*.72; g.save(); g.translate(PE.x*w,PE.y*w*1.25); g.rotate(PE.rot); sub(g,-r,-r,2*r,2*r,(g,a,b)=>dieOf(g,a,b,{size:1})); g.restore(); } }; })(),
    run(P,W,H,dpr,x){ const C=x.clips, F=P('fx-08-foil');
      const back=chain([{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:C.cuts}}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.head}}}],W,H,dpr,x);
      const st=chain([{fx:foil,o:Object.assign({},F,{fL:.8,fC:.13,fh:84}),x:{clips:{die:C.gold}},top:true},{fx:foil,o:Object.assign({},F,{fL:.82,fC:.006,fh:250,shin:140}),x:{clips:{die:C.silver}},top:true},{fx:foil,o:Object.assign({},F,{finish:'holo',fL:.78,fC:.15,fh:250,holo:1,grain:.55,mirror:1.3,box:2}),x:{clips:{die:C.holo}},top:true}],W,H,dpr,x);
      const pe=chain([{fx:foil,o:Object.assign({},F,{finish:'holo',fL:.78,fC:.15,fh:250,holo:1,grain:.55,mirror:1.3,box:2,seed:44}),x:{clips:{die:C.peelMark}},top:true}],W,H,dpr,x);
      return stack([{lin:back.lin,alpha:C.sheet,lift:.9},{lin:st.lin,alpha:C.vinyl,lift:.22},{lin:pe.lin,alpha:C.peel,lift:2.6}],W,H,dpr); } },
  { id:'u-halftone', job:'brand', title:'Halftone mark · AM screen, ember', sub:'The mark as a coarse amplitude screen in one ink: every site prints, the dot grows with tone, dots fuse into solid inside the mark. Cropped hard by the frame — the screen is the image.', uses:['fx-01-stipple','fx-03-paper-tooth'], aspect:'1/1',
    overrides:{'fx-01-stipple':{stock:'paper',mShape:'none',duo:'off',screen:1,order:'ordered',jitter:0,sizeVar:0,irregular:.05,pitch:3.4,dotR:2.15,rag:.05,aL:.64,aC:.2,ah:38,density:1.2}},
    clips:{ tone:(g,w,h)=>{ g.filter='blur('+(w*.018)+'px)'; sub(g,-w*.18,w*.08,w*1.25,w*1.25,(g,a,b)=>dieOf(g,a,b,{size:1})); g.filter='none'; const gr=g.createRadialGradient(w*.15,h*.15,0,w*.15,h*.15,w*.9); gr.addColorStop(0,'rgba(255,255,255,.32)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); } },
    run(P,W,H,dpr,x){ const C=x.clips; return stipple.run(P('fx-01-stipple'),W,H,dpr,{S:x.S,field:(u,v)=>Math.min(1,smp(C.tone,u,v,W,H,dpr)*1.05)}); } },
  /* ═══ print ═══ */
  { id:'u-poster', job:'print', title:'Riso poster · two drums, misregistered', sub:'Full bleed. Fluorescent pink floods down from the top, blue rises from the corner, and the headline is printed twice — pink and blue, one drum slipped — at a size the sheet cannot hold.', uses:['fx-01-stipple','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'3/4',
    overrides:{'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.7,aC:.21,ah:358,bL:.52,bC:.17,bh:258,pitch:1.35,dotR:.52,density:1,sizeVar:.15},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.52,iC:.17,ih:258,density:1,mottle:.4,starve:.015,bite:.6})},
    clips:{ head:(g,w,h)=>{ typeAt(g,'One',-w*.03,h*.44,h*.27,{track:-6}); typeAt(g,'light.',-w*.03,h*.7,h*.27,{track:-6}); }, headP:(g,w,h)=>{ g.translate(w*.012,-h*.006); typeAt(g,'One',-w*.03,h*.44,h*.27,{track:-6}); typeAt(g,'light.',-w*.03,h*.7,h*.27,{track:-6}); },
      foot:(g,w,h)=>typeAt(g,'SET 01 · RISOGRAPH · TWO DRUMS · FOUR SURFACES',w*.05,h*.95,h*.019,{font:'mono',weight:500,track:2}) },
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr, o=P('fx-01-stipple'), C=x.clips; const field=(u,v,L)=>L?FX.ease(['in',1.4],clamp(1-Math.hypot(u-w,v-h)/(Math.hypot(w,h)*.75),0,1))*.9:clamp(.92-v/h*1.05+(FX.fbm(u/90,v/90,4,3,.5)-.5)*.35,0,1)*.95;
      const blue=Object.assign({},P('fx-02-ink-edge')), pink=Object.assign({},blue,{iL:.7,iC:.21,ih:358,seed:77}); const both=new Float32Array(W*H); for(let i=0;i<both.length;i++) both[i]=Math.max(C.head[i],C.foot[i]);
      return chain([{fx:stipple,o,x:{field}},{fx:inkEdge,o:pink,x:{clip:C.headP}},{fx:inkEdge,o:blue,x:{clip:both}}],W,H,dpr,x); } },
  { id:'u-tickets', job:'print', title:'Tickets · three runs, fanned', sub:'Three consecutive tickets dealt across the page, overlapping. Same die, same chain — a different ink on each roller and each one running dry at its own point; the numbers struck in sequence.', uses:['fx-02-ink-edge','fx-07-typewriter','fx-03-paper-tooth'], aspect:'4/3', light:{az:222,el:30},
    overrides:{'fx-02-ink-edge':{mShape:'none',stock:'paper',angle:0,breakup:.94},'fx-07-typewriter':{stock:'paper',impress:.3,exhaust:0,vari:.2}},
    clips:(()=>{ const TK=k=>(w,h)=>{ const tw=w*.66; return [{cx:w*.42,cy:h*.27,rot:-.13},{cx:w*.5,cy:h*.5,rot:.035},{cx:w*.58,cy:h*.74,rot:.15}].map(f=>Object.assign(f,{w:tw,h:tw*.38}))[k]; };
      const shape=(g,a,b)=>{ const sx=a*.74, r=b*.08; g.beginPath(); g.moveTo(0,0); g.lineTo(sx-r,0); g.arc(sx,0,r,PI,0,true); g.lineTo(a,0); g.lineTo(a,b); g.lineTo(sx+r,b); g.arc(sx,b,r,0,PI,true); g.lineTo(0,b); g.closePath(); g.fill(); g.globalCompositeOperation='destination-out'; for(let y=r*1.6;y<b-r*1.4;y+=b*.07){ g.beginPath(); g.arc(sx,y,b*.016,0,TAU); g.fill(); } };
      const o={}; [0,1,2].forEach(k=>{ const at=fn=>(g,w,h)=>{ const f=TK(k)(w,h); inFrame(g,f.cx,f.cy,f.rot,f.w,f.h,fn); };
        o['t'+k]=at(shape); o['b'+k]=at((g,a,b)=>g.fillRect(a*.05,b*.3,a*.65,b*.42));
        o['x'+k]=at((g,a,b)=>{ typeAt(g,'ADMIT ONE',a*.05,b*.22,b*.15); typeAt(g,'SET 01 · SURFACES · ROW F',a*.05,b*.88,b*.065,{font:'mono',weight:500,track:1}); });
        o['n'+k]=at((g,a,b)=>{ g.save(); g.translate(a*.88,b*.5); g.rotate(-PI/2); sub(g,-b*.45,-a*.08,b*.9,a*.16,(g,c,d)=>strikes(g,c,d,{text:'№ 061'+(1+k),fsize:d*.5,seed:30+k,exhaust:0})); g.restore(); }); }); return o; })(),
    run(P,W,H,dpr,x){ const C=x.clips, E=P('fx-02-ink-edge'), inks=[{iL:.4,iC:.155,ih:300},{iL:.64,iC:.2,ih:38},{iL:.45,iC:.16,ih:262}], ends=[.42,.55,.36], layers=[];
      [0,1,2].forEach(k=>{ const S2=Object.assign({},x.S,{[TOOTH]:Object.assign({},x.S[TOOTH],{seed:40+k*7})}), band=Object.assign({},E,inks[k],{edge:ends[k],width:110+k*30,seed:9+k*11}), black=Object.assign({},E,SOLID,{iL:.2,iC:.006,ih:280,seed:5+k});
        const R=chain([{fx:inkEdge,o:band,x:{S:S2,clip:C['b'+k]}},{fx:inkEdge,o:black,x:{S:S2,clip:C['x'+k]}},{fx:typewriter,o:P('fx-07-typewriter'),x:{S:S2,clips:{strikes:C['n'+k]}}}],W,H,dpr,{S:S2});
        layers.push({lin:R.lin,alpha:C['t'+k],lift:1.1}); });
      return stack(layers,W,H,dpr); } },
  { id:'u-typemacro', job:'print', title:'Typewriter · 6× macro', sub:'Six times closer. Every strike lands with its own pressure and angle, ink passes through the ribbon\'s weave, film pools at the glyph edge and the type bar dents the sheet — the struck letter as an object, cropped through.', uses:['fx-07-typewriter','fx-03-paper-tooth'], aspect:'4/5', zoom:6, light:{az:232,el:26},
    overrides:{'fx-03-paper-tooth':{scale:.6,oct:3,depth:.022,aniso:1.5,fibers:12,fLen:8,fWidth:.14,fRaise:.5,pits:1.2,form:.35,formScale:30,diffuse:.32,fDark:.02,mShape:'none'},'fx-07-typewriter':{stock:'paper',impress:.45,ribbon:.34,rcount:150,squash:.6,vari:.22,half:.06,exhaust:0,jx:.3,jy:.3,rot:1.1,density:1.3,bite:.2,mottle:.06,split:2.6,breakup:.45,starve:.006,wick:.1}},
    clips:{ s:(g,w,h)=>sub(g,-w*.12,-h*.02,w*1.3,h*1.04,(g,a,b)=>strikes(g,a,b,{text:'Four / surf / aces',fsize:w*.3,lead:1.18,align:'left',seed:17})) },
    run(P,W,H,dpr,x){ return typewriter.run(P('fx-07-typewriter'),W,H,dpr,{S:x.S,clips:{strikes:x.clips.s}}); } },
  { id:'u-slip', job:'print', title:'Job docket · carbon copy, box stamp', sub:'A press-room docket on newsprint, torn off the pad. The type is the carbon copy — blue, soft, pressed into the sheet — and a PRINTED box stamp is rolled over it at an angle, light enough to break on the tooth.', uses:['fx-07-typewriter','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'3/5',
    overrides:{'fx-03-paper-tooth':NEWS,'fx-07-typewriter':{stock:'paper',ribbon:.12,iL:.44,iC:.13,ih:266,impress:.35,vari:.32,exhaust:.2,bite:.45,squash:.2,density:1.05},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.52,iC:.17,ih:26,pressure:.68,bite:.85,starve:.05,density:1})},
    clips:(()=>{ const F=(w,h)=>({cx:w*.5,cy:h*.5,sw:w*.7,sh:h*.92,rot:.022}), at=fn=>(g,w,h)=>{ const f=F(w,h); inFrame(g,f.cx,f.cy,f.rot,f.sw,f.sh,fn); };
      const c=t=>' '.repeat(Math.max(0,(32-t.length)>>1))+t, rule='-'.repeat(32);
      const TXT=[c('ø co. · PRESS ROOM'),c('JOB DOCKET  No. 0612'),'',pad('24 OCT 2026','21:31'),rule,pad('RUN  PROCESS  STOCK','SHEETS'),'',pad('01  STIPPLE  BOND 90','1,200'),pad('02  ROLLER   BOND 90','1,200'),pad('03  BLIND    COTTON 300','400'),pad('04  FOIL     COTTON 300','400'),pad('05  STRIKE   NEWS 45','2,000'),rule,pad('TOTAL','5,200'),'',c('PROOFED UNDER ONE LIGHT'),c('KEEP WITH THE JOB')].join(' / ');
      return {
      slip:at((g,a,b)=>{ const R_=FX.rng(77); g.beginPath(); g.moveTo(0,2); for(let x=0;x<=a;x+=1.6) g.lineTo(x,1+R_()*2.2); for(let y=0;y<=b;y+=8) g.lineTo(a,y); for(let x=a;x>=0;x-=1.6) g.lineTo(x,b-1-R_()*2.2); g.closePath(); g.fill(); }),
      text:at((g,a,b)=>sub(g,a*.04,b*.04,a*.92,b*.84,(g,c2,d)=>strikes(g,c2,d,{text:TXT,fsize:c2*.05,lead:1.62,seed:14}))),
      stamp:at((g,a,b)=>{ g.save(); g.translate(a*.6,b*.83); g.rotate(-.16); const bw=a*.62, bh=a*.25; g.strokeStyle='#fff'; g.lineWidth=1.7; g.strokeRect(-bw/2,-bh/2,bw,bh); g.lineWidth=.7; g.strokeRect(-bw/2+3.5,-bh/2+3.5,bw-7,bh-7);
        typeAt(g,'PRINTED',0,bh*.1,bh*.42,{align:'center',maxW:bw*.82,track:1}); typeAt(g,'24 · 10 · 2026',0,bh*.34,bh*.15,{align:'center',font:'mono',weight:500,track:2}); g.restore(); })}; })(),
    run(P,W,H,dpr,x){ const C=x.clips; const R=chain([{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.text}}},{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:C.stamp}}],W,H,dpr,x); return onPage(R,C.slip,W,H,dpr,.9); } },
  { id:'u-sketch', job:'print', title:'Graphite still life · cube, sphere, one light', sub:'A drawing, not a texture: each cube face hatched along its own edges, the sphere cross-hatched around its form, construction lines left in, cast shadows thrown across the ground — every value computed from the sheet light. Drag the light and the drawing redraws itself.', uses:['fx-05-graphite','fx-03-paper-tooth','fx-07-typewriter'], aspect:'4/3', light:{az:206,el:17},
    overrides:{'fx-03-paper-tooth':Object.assign({},COLD,{scale:3,depth:.22,diffuse:.5}),'fx-05-graphite':{stock:'paper',mShape:'none',spacing:1.75,lead:.52,len:64,jit:.35,wobble:.12,pressure:1,taper:.55,sheen:.5,layers:2,bite:.22,breakup:.85,starve:0,mottle:0,split:.6},'fx-07-typewriter':{stock:'paper',impress:.15,exhaust:0}},
    clips:(()=>{ const G=(w,h)=>still(w,h,1.28); return {
      left:(g,w,h)=>poly(g,G(w,h).left), right:(g,w,h)=>poly(g,G(w,h).right), top:(g,w,h)=>poly(g,G(w,h).top),
      lines:(g,w,h)=>{ const q=G(w,h); g.strokeStyle='#fff'; g.lineWidth=.8; g.setLineDash([]); g.beginPath(); g.ellipse(q.scx,q.scy,q.sR,q.sR*.28,0,0,TAU); g.stroke(); g.beginPath(); g.moveTo(q.scx,q.scy-q.sR*1.15); g.lineTo(q.scx,q.scy+q.sR*1.15); g.stroke();
        g.lineWidth=.9; g.beginPath(); g.arc(q.scx,q.scy,q.sR,0,TAU); g.stroke(); [q.left,q.right,q.top].forEach(f=>{ g.beginPath(); f.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p)); g.closePath(); g.stroke(); }); g.lineWidth=.8;
        g.setLineDash([3,3]); g.beginPath(); g.moveTo(...q.L); g.lineTo(...q.Bb); g.lineTo(...q.R); g.moveTo(...q.Bb); g.lineTo(...q.Bt); g.stroke(); g.setLineDash([]); g.beginPath(); g.moveTo(w*.06,q.gy); g.lineTo(w*.94,q.gy); g.stroke(); },
      cap:(g,w,h)=>sub(g,w*.5,h*.9,w*.46,h*.07,(g,a,b)=>strikes(g,a,b,{text:'study 03 — cube, sphere, one light',fsize:b*.36,seed:2,exhaust:0})) }; })(),
    run(P,W,H,dpr,x){ const w=W/dpr, h=H/dpr, q=still(w,h,1.28), C=x.clips, [lx,ly,lz]=FX.lightVec(), pl=Math.hypot(lx,ly)||1, gO=P('fx-05-graphite');
      const val=n=>{ const m=Math.hypot(...n), lam=Math.max(0,(n[0]*lx+n[1]*ly+n[2]*lz)/m); return clamp(Math.pow(1-lam,1.15)*.95,0,1); };
      const face=(n,grad)=>(u,v)=>clamp(val(n)*(.82+.3*grad(u,v))+.04,0,1);
      const fy=(u,v)=>(v-q.Bt[1])/(q.F[1]-q.Bt[1]);
      const sph=(u,v)=>{ const dx=(u-q.scx)/q.sR, dy=(v-q.scy)/q.sR, r2=dx*dx+dy*dy; if(r2>=1) return 0; const nz=Math.sqrt(1-r2), lam=Math.max(0,dx*lx+dy*ly+nz*lz), refl=Math.max(0,-dy)*.0+Math.max(0,dy)*.12; return clamp(Math.pow(1-lam,1.3)*.95-refl-Math.pow(1-nz,4)*.15,0,1); };
      // cast shadows on the ground: away from the light, longer as it rakes lower
      const k=clamp(1/Math.tan(Math.max(.18,Math.asin(clamp(lz,0,1))))*.55,.25,2.4), dX=-lx/pl*k*q.s, dY=-ly/pl*k*q.s*.32;
      const base=[q.F,q.L,q.R,q.Bb], tops=[q.Ft,q.Lt,q.Rt,q.Bt].map((p,i)=>[base[i][0]+dX*1.0,base[i][1]+dY]), cub=hull(base.concat(tops));
      const sx=q.scx+dX*.9, sy=q.gy+q.sR*.04+dY*.4, srx=q.sR*(1+Math.abs(dX)/q.s*.35), sry=q.sR*.26;
      const solid=(u,v)=>inPoly(q.left,u,v)||inPoly(q.right,u,v)||inPoly(q.top,u,v)||Math.hypot(u-q.scx,v-q.scy)<q.sR;
      const shadow=(u,v)=>{ if(solid(u,v)) return 0; let s_=0; if(inPoly(cub,u,v)) s_=.62; const ex=(u-sx)/srx, ey=(v-sy)/sry, e2=ex*ex+ey*ey; if(e2<1) s_=Math.max(s_,.66*(1-e2*.6)); return s_; };
      const G_=(o2,xx)=>({fx:graphite,o:Object.assign({},gO,o2),x:xx,top:true});
      return chain([        G_({angle:28,cross:62,layers:2,seed:51},{field:shadow}),
        G_({angle:90,cross:-60,layers:3,seed:52},{clip:C.left,field:face(q.nL,(u,v)=>fy(u,v))}),
        G_({angle:-30,cross:120,layers:3,seed:53},{clip:C.right,field:face(q.nR,(u,v)=>fy(u,v))}),
        G_({angle:30,cross:-60,layers:2,seed:54},{clip:C.top,field:face(q.nT,(u,v)=>1-fy(u,v))}),
        G_({angle:38,cross:64,layers:4,seed:55,spacing:1.6},{field:sph}),
        G_({angle:0,cross:90,layers:1,spacing:.4,lead:.38,len:400,jit:0,wobble:.03,pressure:.8,seed:56},{clip:C.lines,field:()=>.85})],W,H,dpr,x); } },
  /* ═══ packaging ═══ */
  { id:'u-bag', job:'packaging', title:'Coffee label · close on the shelf', sub:'Tight on the arch-cut label, as you meet it on a shelf: the foil name too big to fit, the graphite cherries close enough to see each hatch, the rule running out of frame. Same functions, a committed crop.', uses:['fx-05-graphite','fx-08-foil','fx-07-typewriter','fx-02-ink-edge'], aspect:'4/5', zoom:1.6, light:{az:214,el:24},
    overrides:{'fx-05-graphite':{stock:'paper',mShape:'none',spacing:1.45,lead:.48,len:40,layers:3,cross:64,sheen:.55,jit:.35,wobble:.1,bite:.22,breakup:.85,starve:0,mottle:0,split:.6},'fx-08-foil':{stock:'paper',crush:.6},'fx-07-typewriter':{stock:'paper',impress:.25,exhaust:0,vari:.18},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.3,iC:.05,ih:48,density:1.15})},
    clips:(()=>{ const A=(w,h)=>({lw:w*1.02,lh:h*1.2,x0:w*.05,y0:-h*.18}), arch=(g,x0,y0,lw,lh)=>{ g.beginPath(); g.moveTo(x0,y0+lw/2); g.arc(x0+lw/2,y0+lw/2,lw/2,PI,0); g.lineTo(x0+lw,y0+lh); g.lineTo(x0,y0+lh); g.closePath(); };
      return {
      label:(g,w,h)=>{ const a=A(w,h); arch(g,a.x0,a.y0,a.lw,a.lh); g.fill(); },
      rule:(g,w,h)=>{ const a=A(w,h), m=a.lw*.045; g.strokeStyle='#fff'; g.lineWidth=.75; arch(g,a.x0+m,a.y0+m,a.lw-2*m,a.lh-2*m); g.stroke(); },
      leaf:(g,w,h)=>{ const a=A(w,h), c=cher(a); g.save(); g.translate(c.lx,c.ly); g.rotate(c.la); g.beginPath(); g.moveTo(-c.lr,0); g.quadraticCurveTo(0,-c.lr*.42,c.lr,0); g.quadraticCurveTo(0,c.lr*.42,-c.lr,0); g.fill(); g.globalCompositeOperation='destination-out'; g.fillRect(-c.lr*.9,-.35,c.lr*1.8,.7); g.restore(); },
      stems:(g,w,h)=>{ const a=A(w,h), c=cher(a); g.strokeStyle='#fff'; g.lineWidth=.6; c.cs.forEach(([cx,cy,r])=>{ g.beginPath(); g.arc(cx,cy,r,0,TAU); g.stroke(); }); g.lineWidth=.9; c.cs.forEach(([cx,cy,r])=>{ g.beginPath(); g.moveTo(cx,cy-r*.9); g.quadraticCurveTo(cx+(c.bx-cx)*.2,cy-r*2,c.bx,c.by); g.stroke(); }); },
      title:(g,w,h)=>{ const a=A(w,h); typeAt(g,'Harvest',a.x0+a.lw*.02,a.y0+a.lh*.83,a.lw*.3,{track:-3}); },
      text:(g,w,h)=>{ const a=A(w,h); sub(g,a.x0,a.y0+a.lw*.19,a.lw,a.lw*.1,(g,c,d)=>strikes(g,c,d,{text:'SEASONAL · No. 01',fsize:a.lw*.04,seed:5,exhaust:0}));
        sub(g,a.x0+a.lw*.06,a.y0+a.lh*.875,a.lw*.8,a.lh*.06,(g,c,d)=>strikes(g,c,d,{text:'STONE FRUIT · CACAO · CANE · LOT 0612',fsize:a.lw*.034,seed:6,exhaust:0,align:'left'})); } }; })(),
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr, a={lw:w*1.02,lh:h*1.2,x0:w*.05,y0:-h*.18}, c=cher(a), C=x.clips, [lx,ly,lz]=FX.lightVec(), gO=P('fx-05-graphite');
      const fruit=(u,v)=>{ for(const [cx,cy,r] of c.cs.slice().sort((p,q)=>q[1]-p[1])){ const dx=(u-cx)/r, dy=(v-cy)/r, r2=dx*dx+dy*dy; if(r2<1){ const nz=Math.sqrt(1-r2), lam=Math.max(0,dx*lx+dy*ly+nz*lz); return clamp(Math.pow(1-lam,1.2)*.9+.08-Math.pow(1-nz,5)*.2,0,1); } } return 0; };
      const leafV=(u,v)=>{ const ca=Math.cos(-c.la), sa=Math.sin(-c.la), Y=(u-c.lx)*sa+(v-c.ly)*ca; return Y<0?.52:.34; };
      const G_=(o2,xx)=>({fx:graphite,o:Object.assign({},gO,o2),x:xx,top:true});
      const R=chain([{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:C.rule}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.text}}},
        G_({angle:40,seed:61},{field:fruit}),G_({angle:c.la*180/PI+62,cross:40,layers:2,seed:62},{clip:C.leaf,field:leafV}),G_({angle:0,cross:90,layers:1,spacing:.42,lead:.38,len:300,jit:0,wobble:.03,pressure:.85,seed:63},{clip:C.stems,field:()=>.85}),
        {fx:foil,o:P('fx-08-foil'),x:{clips:{die:C.title}},top:true}],W,H,dpr,x);
      return onPage(R,C.label,W,H,dpr,.8); } },
  { id:'u-bookmacro', job:'packaging', title:'Bookcloth · 5× at the hinge', sub:'Five times into the cover of the clothbound book: gold foil sitting on and sinking between green threads, the blind hinge groove crushing the weave flat, raked at 14° so every thread has a shadow.', uses:['fx-04-weave','fx-08-foil','fx-06-deboss'], aspect:'1/1', zoom:5, light:{az:200,el:14},
    overrides:{'fx-04-weave':Object.assign({},BOOK,{warp:96,weft:84,irregular:.07,depth:1,shadow:.7}),'fx-08-foil':{stock:'cloth',crush:.7,grain:.05,starve:0,flash:.08,mirror:1.15},'fx-06-deboss':{stock:'cloth',depth:2.2,soft:1.2,crush:.9,lip:.12,diffuse:.92,shadow:.9}},
    clips:{ foil:(g,w,h)=>typeAt(g,'Su',-w*.06,h*.86,h*.95,{track:-4}), groove:(g,w,h)=>g.fillRect(w*.86,0,w*.035,h) },
    run(P,W,H,dpr,x){ const C=x.clips; return chain([{fx:weave,o:P('fx-04-weave')},{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:C.groove}}},{fx:foil,o:P('fx-08-foil'),x:{clips:{die:C.foil}},top:true}],W,H,dpr,x); } },
  /* ═══ textile ═══ */
  { id:'u-swatches', job:'textile', title:'Swatch card · five cloths, pinked', sub:'Five cloths cut with pinking shears and laid overlapping: denim twill, natural linen, fine shirting, canvas duck, green bookcloth. Same weave function, five drafts — counts, interlacing, slub, hair and dye.', uses:['fx-04-weave'], aspect:'3/2', light:{az:225,el:26},
    clips:(()=>{ const SW=k=>(w,h)=>({x0:w*(.04+.135*k),y0:h*(.06+.055*k),w:w*.36,h:h*.72}); const pinked=(g,r)=>{ const t=3.2, a=2.4; g.beginPath(); let x=r.x0, y=r.y0; g.moveTo(x,y); for(let i=0;x<r.x0+r.w;i++){ x=Math.min(r.x0+r.w,x+t); g.lineTo(x,y-(i%2?0:a)); } for(let i=0;y<r.y0+r.h;i++){ y=Math.min(r.y0+r.h,y+t); g.lineTo(r.x0+r.w+(i%2?0:a),y); } for(let i=0;x>r.x0;i++){ x=Math.max(r.x0,x-t); g.lineTo(x,r.y0+r.h+(i%2?0:a)); } for(let i=0;y>r.y0;i++){ y=Math.max(r.y0,y-t); g.lineTo(r.x0-(i%2?0:a),y); } g.closePath(); g.fill(); };
      const o={}; for(let k=0;k<5;k++) o['s'+k]=(g,w,h)=>pinked(g,SW(k)(w,h)); return o; })(),
    run(P,W,H,dpr,x){ const C=x.clips, base=P('fx-04-weave'), drafts=[{pattern:'twill 2/1',warp:52,weft:44,fill:.97,wL:.36,wC:.075,wh:262,fL:.82,fC:.015,fh:85,accent:0,dye:.04,slub:.55,hair:.35,depth:1},LINEN,SHIRT,DUCK,BOOK];
      const layers=drafts.map((d,k)=>{ const o=Object.assign({},base,d,{mShape:'none',lift:0,seed:33+k*17}); return {lin:weave.run(o,W,H,dpr,{S:x.S}).lin,alpha:C['s'+k],lift:.9}; });
      return stack(layers,W,H,dpr); } },
  { id:'u-wovenmacro', job:'textile', title:'Woven label · 4× into the ø', sub:'Four times into the damask label: the ø is not printed on the cloth, it is the cloth — white weft floating over black warp inside the figure, the satin interlacing flipping at its edge, thread by thread.', uses:['fx-04-weave'], aspect:'1/1', zoom:4, light:{az:225,el:28},
    overrides:{'fx-04-weave':Object.assign({},WLABEL,{depth:.9,shadow:.6,wL:.22})},
    clips:{ jq:(g,w,h)=>sub(g,-w*.2,-h*.05,w*1.25,w*1.25,(g,a,b)=>dieOf(g,a,b,{size:1})) },
    run(P,W,H,dpr,x){ return weave.run(P('fx-04-weave'),W,H,dpr,{S:x.S,clips:{jq:x.clips.jq}}); } },
  { id:'u-tote', job:'textile', title:'Tote · screenprint on duck, too big to fit', sub:'Canvas duck, full bleed, a headline pulled through the screen at a size the bag cannot hold — the squeegee running dry toward the right, so the last letters print only on the tops of the threads.', uses:['fx-02-ink-edge','fx-04-weave'], aspect:'4/5', zoom:1.25, light:{az:214,el:24},
    overrides:{'fx-04-weave':Object.assign({},DUCK,{warp:36,weft:34,depth:1.3}),'fx-02-ink-edge':{stock:'cloth',mShape:'none',edge:.72,width:90,angle:0,bite:.92,starve:.02,breakup:.95,iL:.2,iC:.006,ih:280,density:1.4,wAmp:10,wScale:70}},
    clips:{ ink:(g,w,h)=>{ typeAt(g,'Four',-w*.04,h*.36,h*.3,{track:-6}); typeAt(g,'surf',-w*.04,h*.63,h*.3,{track:-6}); typeAt(g,'aces',-w*.04,h*.9,h*.3,{track:-6}); } },
    run(P,W,H,dpr,x){ return inkEdge.run(P('fx-02-ink-edge'),W,H,dpr,{S:x.S,clip:x.clips.ink}); } },
  /* ═══ screen & deck · data ═══ */
  { id:'u-deck', job:'screen', title:'Title slide · type left, stippled landscape bleeding right', sub:'A deck title slide composed on the 16:9 stage: crisp black type on the left, a stipple landscape bleeding off three edges on the right — far ridges lighter, a second-ink sun — the crop is the frame.', uses:['fx-01-stipple','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'16/9', span:2,
    overrides:{'fx-03-paper-tooth':{depth:.06,fibers:1,pits:.3,mShape:'none'},'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.2,aC:.004,ah:280,bL:.64,bC:.2,bh:38,pitch:1.1,dotR:.36,sizeVar:.12,irregular:.06,density:1.2,rag:.02},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.16,iC:.004,ih:280,density:1.4,starve:0,mottle:0,bite:.2})},
    clips:{ type:(g,w,h)=>{ const X=w*.06; typeAt(g,'Q4 REVIEW · Ø CO.',X,h*.15,h*.032,{font:'mono',weight:500,track:2.5}); typeAt(g,'Four',X,h*.42,h*.2,{track:-4}); typeAt(g,'surfaces,',X,h*.6,h*.2,{maxW:w*.5,track:-4}); typeAt(g,'one light.',X,h*.73,h*.075,{track:-1.5});
        typeAt(g,'24.10.2026 · 01',X,h*.915,h*.028,{font:'mono',weight:500,track:1.5}); },
      panel:(g,w,h)=>g.fillRect(w*.56,0,w*.44,h) },
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr,s=7, sunX=w*.82, sunY=h*.3, sunR=h*.11;
      const ridge=(k,u)=>h*(.5+.11*k)+h*.07*(FX.fbm(u/(150-k*25)+k*3.1,k*1.7,s+k,4,.5)-.5)*2-h*.03*k*Math.sin(u/90+k);
      const field=(u,v,L)=>{ if(L){ const d=Math.hypot(u-sunX,v-sunY); if(v>ridge(0,u)) return 0; return d<sunR?.62:d<sunR*2.2?.1*(1-(d-sunR)/(sunR*1.2)):0; }
        let val=FX.ease(['in',1.6],clamp(v/ridge(0,u),0,1))*.12; for(let k=0;k<4;k++){ const r=ridge(k,u); if(v>r){ const t=clamp((v-r)/(h*.12),0,1); val=(.26+k*.19)*(1-.35*t)+.06; } } return Math.min(.95,val); };
      return chain([{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:x.clips.type}},{fx:stipple,o:P('fx-01-stipple'),x:{clip:x.clips.panel,field}}],W,H,dpr,x); } },
  { id:'u-meter', job:'screen', title:'Instrument strip · 24 h in stipple', sub:'A day of readings as 48 stippled bins. Each bin is a count of dots; its top runs out by the dropoff curve instead of a hard cap. The current bin prints in a second ink, the readout beside it in the same ink, the clock struck in type.', uses:['fx-01-stipple','fx-02-ink-edge','fx-07-typewriter','fx-03-paper-tooth'], aspect:'16/9',
    overrides:{'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.22,aC:.004,ah:280,bL:.64,bC:.2,bh:38,pitch:1.05,dotR:.34,sizeVar:.1,irregular:.06,density:1.2,rag:.02},'fx-02-ink-edge':Object.assign({},SOLID,{stock:'paper',iL:.2,iC:.006,ih:280,density:1.25}),'fx-07-typewriter':{stock:'paper',impress:.15,exhaust:0,vari:.15}},
    clips:(()=>{ const M=meterGeo; return {
      head:(g,w,h)=>{ const q=M(w,h); typeAt(g,'Respiration',q.x0,h*.15,h*.075,{track:-.5}); typeAt(g,'24 H · HALF-HOUR BINS · SET 01',q.x0,h*.215,h*.03,{font:'mono',weight:500,track:2}); g.fillRect(q.x0,q.base+1,q.x1-q.x0,.8); for(let i=0;i<=48;i+=6){ const X=q.x0+i*q.bw; g.fillRect(X-.4,q.base+1,.8,i%12?3.5:6); } },
      now:(g,w,h)=>{ const q=M(w,h); typeAt(g,'0.81',q.x1,h*.19,h*.15,{align:'right',track:-1}); typeAt(g,'NOW · 19:30',q.x1,h*.245,h*.03,{align:'right',font:'mono',weight:500,track:2}); const X=q.x0+(q.now+.5)*q.bw; g.fillRect(X-.4,q.top-8,.8,6); },
      clock:(g,w,h)=>{ const q=M(w,h); [0,6,12,18,24].forEach(t=>{ const X=q.x0+t*2*q.bw; sub(g,X-20,q.base+9,40,h*.07,(g,a,b)=>strikes(g,a,b,{text:String(t).padStart(2,'0'),fsize:h*.034,seed:70+t,exhaust:0})); }); } }; })(),
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr,q=meterGeo(w,h),C=x.clips, o=P('fx-01-stipple');
      const field=(u,v,L)=>{ const f=(u-q.x0)/q.bw, i=Math.floor(f); if(i<0||i>=48) return 0; if(f-i>.8) return 0; if((i===q.now)!==!!L) return 0; const vt=q.base-(q.base-q.top)*q.val(i); if(v<vt||v>q.base) return 0; const t=(v-vt)/Math.min(16,q.base-vt); return (t<1?FX.ease(['out',1.8],t):1)*.94; };
      return chain([{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:C.head}},{fx:inkEdge,o:Object.assign({},P('fx-02-ink-edge'),{iL:.64,iC:.2,ih:38}),x:{clip:C.now}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:C.clock}}},{fx:stipple,o,x:{field}}],W,H,dpr,x); } },
  { id:'u-chart', job:'data', title:'Area chart · two series in stipple', sub:'Each series is a stipple field under its line, denser at the line and thinning to the baseline. Where they overlap the inks multiply — the overlap reads without a legend. Axis struck in type.', uses:['fx-01-stipple','fx-07-typewriter','fx-03-paper-tooth'], aspect:'16/9', span:2,
    overrides:{'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.22,aC:.004,ah:280,bL:.66,bC:.2,bh:38,pitch:1.35,dotR:.42,density:1.1},'fx-07-typewriter':{stock:'paper',impress:.15,exhaust:0,vari:.2}},
    clips:{ axis:(g,w,h)=>{ g.fillRect(w*.07,h*.8,w*.87,Math.max(.6,h*.003)); const qs=['Q1','Q2','Q3','Q4']; qs.forEach((q,i)=>sub(g,w*.07+i*w*.87/4,h*.82,w*.87/4,h*.1,(g,a,b)=>strikes(g,a,b,{text:q,fsize:Math.max(8,b*.32),seed:40+i,exhaust:0}))); sub(g,w*.04,h*.03,w*.5,h*.1,(g,a,b)=>strikes(g,a,b,{text:'field vs respiration · 2026',fsize:Math.max(8,b*.32),seed:44,exhaust:0})); } },
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr, x0=w*.07, x1=w*.94, base=h*.8; const cur=(u,L)=>{ const t=(u-x0)/(x1-x0); return L? base-h*(.18+.2*Math.sin(t*5.1+1.3)+.12*Math.sin(t*13+.4)) : base-h*(.32+.16*Math.sin(t*3.2)+.08*Math.sin(t*11)); };
      const field=(u,v,L)=>{ if(u<x0||u>x1||v>base) return 0; const c=cur(u,L); if(v<c) return 0; return FX.ease(['in',1.6],clamp(1-(v-c)/(base-c),0,1))*.9+.05; };
      return chain([{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:x.clips.axis}}},{fx:stipple,o:P('fx-01-stipple'),x:{field}}],W,H,dpr,x); } }

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
  sections:[{id:'surfaces',title:'Four surfaces',blurb:'The source set: two stocks and two marks.'},{id:'surprise',title:'Surprise marks',blurb:'Marks that only make sense on a material system — one is pure light, one is metal, one is struck through cloth, one gleams.'}],
  effects:[stipple,inkEdge,tooth,weave,graphite,deboss,typewriter,foil], usages };
})(typeof window!=='undefined'?window:self);
