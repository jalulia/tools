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
function clothField(o,W,H,dpr){ const key=keyOf(o,CLOTH_KEYS)+'|'+W+'|'+H+'|'+dpr; const hit=CLOTH.get(key); if(hit) return hit;
  const w=W/dpr,hh=H/dpr,s=o.seed|0, pat=PATTERNS[o.pattern]||PATTERNS.plain, MF=FX.maskField(Object.assign({},o,{mFeather:1,mBite:0,mMode:'tone'}),W,H,dpr,s), D=MF.d;
  const pw=100/o.warp, ph=100/o.weft, NI=Math.ceil(w/pw)+3, NJ=Math.ceil(hh/ph)+3;
  const mk=(N,p,salt,base)=>{ const c=new Float32Array(N), t=new Float32Array(N), d=new Float32Array(N), acc=new Uint8Array(N), fr=new Float32Array(N); for(let i=0;i<N;i++){ c[i]=(i-1+.5)*p+(hash(i,salt,s)-.5)*o.irregular*p*.35; t[i]=1+(hash(i,salt+1,s)-.5)*o.irregular*.5; d[i]=(hash(i,salt+2,s)-.5)*2*o.dye; acc[i]=o.aMode==='threads'&&hash(i,salt+3,s)<o.accent?1:0; fr[i]=Math.pow(hash(i,salt+4,s),1.6); } return {c,t,d,acc,fr,base}; };
  const acc=FX.inkOf(o,'c'), Wp=mk(NI,pw,11,FX.inkOf(o,'w')), Fp=mk(NJ,ph,23,FX.inkOf(o,'f')), P=proj(w,hh,o.wAngle);
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
    if(und>0){ const ua=U.acc[nU]?1:0, cu=colOf(nU*8+(warpTop?4:0)+ua*2,inkU,U.d[nU]-.06); if(und>=1){ px[0]=cu[0];px[1]=cu[1];px[2]=cu[2]; } else { px[0]+=(cu[0]-px[0])*und; px[1]+=(cu[1]-px[1])*und; px[2]+=(cu[2]-px[2])*und; } }
    if(top>0){ const ta=(T.acc[nT]||fleck)?1:0, ct=colOf(nT*8+(warpTop?0:4)+ta*2+(worn?1:0),inkT,T.d[nT]+(worn?.05:0)); if(top>=1){ px[0]=ct[0];px[1]=ct[1];px[2]=ct[2]; } else { px[0]+=(ct[0]-px[0])*top; px[1]+=(ct[1]-px[1])*top; px[2]+=(ct[2]-px[2])*top; } }
    alb[k]=px[0];alb[k+1]=px[1];alb[k+2]=px[2]; floats.add(ti*4096+tj); } }
  return lruSet(CLOTH,key,{h,alb,a,hair,marks:floats.size,D}); }
const CLOTH_LIT=new Map();
function clothLit(o,W,H,dpr,L){ const C=clothField(o,W,H,dpr); const key=keyOf(o,CLOTH_KEYS.concat(['depth','diffuse','shadow','lift']))+'|'+W+'|'+H+'|'+dpr+'|'+L.az+'|'+L.el; const hit=CLOTH_LIT.get(key); if(hit) return hit;
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
  run(o,W,H,dpr,x={}){ const um=x.clips&&x.clips.umask; let st=clothLit(um?Object.assign({},o,{lift:0}):o,W,H,dpr,FX.LIGHT); let lin=light(st.alb,st.lf,W,H), a=st.a;
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
  clips:{ strikes:(g,w,h,o)=>{ const R_=FX.rng((o.seed|0)+5), lines=String(o.text||'').split('/').map(t=>t.trim()); let fs=o.fsize; g.font=`500 ${fs}px "JetBrains Mono", ui-monospace, monospace`; const mw0=Math.max(...lines.map(l=>l.length))*g.measureText('M').width; if(mw0>w*.86) fs*=w*.86/mw0; const lh=fs*o.lead; g.font=`500 ${fs}px "JetBrains Mono", ui-monospace, monospace`; const x0=Math.max(2,(w-Math.max(...lines.map(l=>l.length))*g.measureText('M').width)/2); let y=h*.5-((lines.length-1)*lh)/2+fs*.32, n=0, tot=lines.join('').length||1;
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

const usages=[
  { id:'u-meter', job:'screen', title:'Meter · counted marks', sub:'Three readings as stipple printed into paper. Value is the share of the bar that prints; the bar\'s end runs out by the dropoff curve — dots thin out, they never fade.', uses:['fx-01-stipple','fx-03-paper-tooth'], aspect:'16/9',
    overrides:{'fx-01-stipple':{mShape:'none',source:'linear',duo:'off',stock:'paper'}},
    labels:[['Field','.62'],['Respiration','.38'],['Helix','.81']], rows:true,
    clips:{ bars:(g,w,h)=>{ const top=h*.16, bh=h*.17, gap=h*.1; for(let r=0;r<3;r++) g.fillRect(w*.3,top+r*(bh+gap),w*.64,bh); } },
    run(P,W,H,dpr,x){ const o=P('fx-01-stipple'), w=W/dpr,h=H/dpr, vals=[.62,.38,.81], top=h*.16, bh=h*.17, gap=h*.1, x0=w*.3, x1=w*.94;
      const field=(u,v)=>{ const r=Math.floor((v-top+gap/2)/(bh+gap)); if(r<0||r>2) return 0; const end=x0+(x1-x0)*vals[r], run=Math.max(8,(x1-x0)*.18); return u>end?0:u<end-run?o.to:lerp(o.to,0,FX.ease(o.ease,(u-(end-run))/run)); };
      return stipple.run(o,W,H,dpr,{S:x.S,clip:x.clips.bars,field}); } },
  { id:'u-ticket', job:'print', title:'Ticket · two runs on one stock', sub:'A die-cut ticket on the page: a roller band that runs out before the stub, then the text as a second run of black through the same chain — full pressure, so only the paper\'s deepest valleys starve it. Perforation and shadow by the sheet light.', uses:['fx-02-ink-edge','fx-03-paper-tooth'], aspect:'16/9',
    overrides:{'fx-02-ink-edge':{mShape:'rect',mInset:30,mAmp:3,mFeather:10,edge:.5,width:150,angle:0,stock:'paper'}},
    labels:[],
    clips:{
      shape:(g,w,h)=>{ const x0=w*.08,y0=h*.16,x1=w*.92,y1=h*.84, sx=w*.71, r=h*.05; g.beginPath(); g.moveTo(x0,y0); g.lineTo(sx-r,y0); g.arc(sx,y0,r,PI,0,true); g.lineTo(x1,y0); g.lineTo(x1,y1); g.lineTo(sx+r,y1); g.arc(sx,y1,r,0,PI,true); g.lineTo(x0,y1); g.closePath(); g.fill();
        g.globalCompositeOperation='destination-out'; for(let y=y0+r*1.6;y<y1-r*1.4;y+=h*.034){ g.beginPath(); g.arc(sx,y,h*.0075,0,TAU); g.fill(); } },
      band:(g,w,h)=>{ g.fillRect(w*.08,h*.3,w*.63,h*.4); },
      text:(g,w,h)=>{ g.textBaseline='alphabetic'; g.font=`800 ${h*.12}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.fillText('ADMIT ONE',w*.12,h*.27); g.font=`500 ${h*.055}px "JetBrains Mono", ui-monospace, monospace`; g.fillText('SET 01 · SURFACES · ROW F',w*.12,h*.79); g.save(); g.translate(w*.83,h*.5); g.rotate(-PI/2); g.font=`800 ${h*.1}px Archivo, "Helvetica Neue", Arial, sans-serif`; const t='№ 0612', tw=g.measureText(t).width; g.fillText(t,-tw/2,h*.035); g.restore(); } },
    run(P,W,H,dpr,x){ const e=P('fx-02-ink-edge'), R1=inkEdge.run(e,W,H,dpr,{S:x.S,clip:x.clips.band});
      const t=Object.assign({},e,{mShape:'none',edge:1.6,width:4,iL:.2,iC:.01,ih:285,density:1.3,breakup:1,wick:.1,seed:e.seed+3});
      const R2=inkEdge.run(t,W,H,dpr,{S:x.S,clip:x.clips.text,alb:R1.alb}); for(let i=0;i<R2.ink.length;i++) R2.ink[i]=Math.max(R2.ink[i],R1.ink[i]);
      return onPage(R2,x.clips.shape,W,H,dpr,1.1); } },
  { id:'u-swatch', job:'textile', title:'Swatch · frayed linen on the page', sub:'The weave cut by a blob mask: every thread ends at its own length, the swatch lifts off the page and casts by the sheet light. Natural linen dyes; same functions as the dark source plate.', uses:['fx-04-weave'], aspect:'16/9',
    overrides:{'fx-04-weave':Object.assign({},LINEN,{mShape:'blob',mInset:26,mAmp:7,mScale:60,fray:12,lift:1.2})},
    labels:[['Linen · plain','34 × 32']],
    run(P,W,H,dpr,x){ return weave.run(P('fx-04-weave'),W,H,dpr,x); } },
  { id:'u-headline', job:'print', title:'Headline · ink runs out of the word', sub:'Type rasterized as a pressure clip; the roller crosses it and runs out, so the last letters print on the paper\'s peaks only. Type is a mask in the press layer, never a gradient fill.', uses:['fx-02-ink-edge','fx-03-paper-tooth'], aspect:'16/9',
    overrides:{'fx-02-ink-edge':{mShape:'none',edge:.66,width:260,angle:0,starve:.03,stock:'paper'}},
    labels:[],
    clips:{ text:(g,w,h)=>{ let fs=h*.5; const f=s=>`800 ${s}px Archivo, "Helvetica Neue", Arial, sans-serif`; g.font=f(fs); let tw=g.measureText('Counted').width; fs*=Math.min(1,(w*.86)/tw); g.font=f(fs); tw=g.measureText('Counted').width; g.textBaseline='alphabetic'; g.fillText('Counted',(w-tw)/2,h*.5+fs*.36); } },
    run(P,W,H,dpr,x){ return inkEdge.run(P('fx-02-ink-edge'),W,H,dpr,{S:x.S,clip:x.clips.text}); } },
  { id:'u-overprint', job:'print', title:'Overprint · two inks, one film', sub:'Two stipple ramps crossing inside an ellipse. Where dots overlap, Beer–Lambert multiplies the films into a third color; switch the color rule on FX-01 to compare coverage mixes.', uses:['fx-01-stipple','fx-03-paper-tooth'], aspect:'16/9',
    overrides:{'fx-01-stipple':{duo:'on',source:'linear',angle:20,mShape:'ellipse',mInset:14,mFeather:18,stock:'paper',dotR:.5,pitch:1.7}},
    labels:[],
    run(P,W,H,dpr,x){ return stipple.run(P('fx-01-stipple'),W,H,dpr,{S:x.S}); } },
  { id:'u-screenprint', job:'textile', title:'Screenprint · ink on linen', sub:'The roller from FX-02 printed onto the cloth stock instead of paper: ink catches the top floats first, misses the gaps and the low under-threads, and the weave\'s light still models it.', uses:['fx-02-ink-edge','fx-04-weave'], aspect:'16/9',
    overrides:{'fx-02-ink-edge':{stock:'cloth',mShape:'rect',mInset:22,mAmp:6,mFeather:16,edge:.62,width:170,bite:.9,starve:.02,iL:.56,iC:.19,ih:32,density:.95},'fx-04-weave':Object.assign({},LINEN,{accent:0})},
    labels:[],
    run(P,W,H,dpr,x){ return inkEdge.run(P('fx-02-ink-edge'),W,H,dpr,{S:x.S}); } },
  /* ═══ stationery & brand ═══ */
  { id:'u-letterhead', job:'brand', title:'Letterhead · blind mark, struck letter', sub:'The ø mark pressed blind at the head — no ink, the light draws it — then the letter struck on the same sheet. Move the light and the mark comes and goes; the type stays.', uses:['fx-06-deboss','fx-07-typewriter','fx-03-paper-tooth'], aspect:'3/4',
    overrides:{'fx-06-deboss':{depth:.9,soft:2.2,stock:'paper'},'fx-07-typewriter':{stock:'paper',impress:.3,exhaust:.15}},
    clips:{ die:(g,w,h)=>sub(g,w*.07,h*.06,w*.17,w*.17,(g,a,b)=>dieOf(g,a,b,{size:1})),
      letter:(g,w,h)=>sub(g,w*.02,h*.3,w*.96,h*.5,(g,a,b)=>strikes(g,a,b,{text:'24 October 2026 / / Dear reader, / the stock arrives Tuesday; / the mark is blind, the letter / is the ink. Four surfaces, / one light. / / — ø co., New York',fsize:Math.max(9,a*.04),lead:1.55,seed:12})) },
    run(P,W,H,dpr,x){ return chain([{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:x.clips.die}}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:x.clips.letter}}}],W,H,dpr,x); } },
  { id:'u-card', job:'brand', title:'Business card · foil mark, blind name', sub:'Gold foil ø on white board, the name debossed blind beside it, contact struck small. Three processes, one sheet, one light — the foil gleams where the deboss goes quiet.', uses:['fx-08-foil','fx-06-deboss','fx-07-typewriter'], aspect:'85/55',
    overrides:{'fx-08-foil':{stock:'paper',crush:.6},'fx-06-deboss':{depth:.45,soft:.45,lip:.08,stock:'paper',shadow:.8},'fx-07-typewriter':{stock:'paper',impress:.2,exhaust:0,vari:.15}},
    clips:{ foil:(g,w,h)=>sub(g,w*.07,h*.16,h*.36,h*.36,(g,a,b)=>dieOf(g,a,b,{size:1})),
      name:(g,w,h)=>typeAt(g,'The Impøssible Outcomes Company',w*.07,h*.7,h*.085,{maxW:w*.86}),
      lines:(g,w,h)=>sub(g,w*.04,h*.74,w*.6,h*.2,(g,a,b)=>strikes(g,a,b,{text:'Brand · Product · Technology · Content / New York',fsize:Math.max(7,b*.16),lead:1.5,seed:4})) },
    run(P,W,H,dpr,x){ return chain([{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:x.clips.name}}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:x.clips.lines}}},{fx:foil,o:P('fx-08-foil'),x:{clips:{die:x.clips.foil}},top:true}],W,H,dpr,x); } },
  { id:'u-emboss', job:'brand', title:'Blind emboss · wordmark', sub:'The wordmark raised out of the sheet, no ink — negative deboss depth. The light angle is the art direction: low and raking it reads loud, overhead it vanishes.', uses:['fx-06-deboss','fx-03-paper-tooth'], aspect:'16/9',
    overrides:{'fx-06-deboss':{depth:-1,soft:1.1,lip:0,crush:.4,stock:'paper',shadow:.85}},
    clips:{ die:(g,w,h)=>typeAt(g,'Impøssible',w/2,h*.62,h*.34,{align:'center',maxW:w*.84}) },
    run(P,W,H,dpr,x){ return deboss.run(P('fx-06-deboss'),W,H,dpr,{S:x.S,clips:{die:x.clips.die}}); } },
  { id:'u-sticker', job:'brand', title:'Sticker · holographic foil, kiss-cut', sub:'Holo foil ø on smooth vinyl, kiss-cut with a white border, lifted off the page by its own shadow. The facets shift hue as the light moves.', uses:['fx-08-foil'], aspect:'1/1',
    overrides:{'fx-08-foil':{finish:'holo',fL:.78,fC:.15,fh:250,holo:1,stock:'smooth',grain:.55,crush:0,dent:0,mirror:1.3,box:2,shin:60}},
    clips:{ die:(g,w,h)=>sub(g,w*.2,h*.2,w*.6,h*.6,(g,a,b)=>dieOf(g,a,b,{size:.95})), cut:(g,w,h)=>{ g.beginPath(); g.arc(w/2,h/2,Math.min(w,h)*.38,0,TAU); g.fill(); } },
    run(P,W,H,dpr,x){ return onPage(foil.run(P('fx-08-foil'),W,H,dpr,{S:x.S,clips:{die:x.clips.die}}),x.clips.cut,W,H,dpr,1.6); } },
  /* ═══ print ═══ */
  { id:'u-poster', job:'print', title:'Riso poster · two drums, one headline', sub:'Fluorescent pink and blue stipple fields crossing at the head — where they overlap the films multiply to violet, as two riso drums would — and the headline rolled out in blue until the drum runs dry.', uses:['fx-01-stipple','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'3/4',
    overrides:{'fx-01-stipple':{duo:'on',stock:'paper',mShape:'none',aL:.7,aC:.21,ah:358,bL:.55,bC:.17,bh:258,pitch:1.5,dotR:.5,density:1},'fx-02-ink-edge':Object.assign({stock:'paper',mShape:'none',edge:.84,width:200,angle:0},{iL:.5,iC:.17,ih:258,density:1})},
    clips:{ field:(g,w,h)=>g.fillRect(w*.06,h*.05,w*.88,h*.62), head:(g,w,h)=>typeAt(g,'SURFACES',w*.06,h*.86,h*.15,{maxW:w*.88,track:-2}), foot:(g,w,h)=>typeAt(g,'SET 01 · FOUR SURFACES · ONE LIGHT',w*.06,h*.93,h*.022,{font:'mono',weight:500,track:2}) },
    run(P,W,H,dpr,x){ const o=P('fx-01-stipple'), w=W/dpr, h=H/dpr; const field=(u,v,L)=>{ const cx=L?w*.92:w*.08, d=Math.hypot(u-cx,v-h*.08)/(Math.hypot(w,h)*.62); return FX.ease(['in',1.3],clamp(1-d,0,1))*.95; };
      const both=new Float32Array(W*H); for(let i=0;i<both.length;i++) both[i]=Math.max(x.clips.head[i],x.clips.foot[i]);
      return chain([{fx:stipple,o,x:{clip:x.clips.field,field}},{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:both}}],W,H,dpr,x); } },
  { id:'u-envelope', job:'print', title:'Envelope · red seal, struck address', sub:'A ring seal pressed and inked red — letterpress, so the ink sits in the bite — beside a typed address. The seal\'s floor is crushed flat; the tooth around it is not.', uses:['fx-06-deboss','fx-07-typewriter','fx-03-paper-tooth'], aspect:'3/2',
    overrides:{'fx-06-deboss':Object.assign({shape:'seal',depth:.7,soft:1.2,ink:.9,stock:'paper'},{iL:.5,iC:.17,ih:27}),'fx-07-typewriter':{stock:'paper',impress:.3}},
    clips:{ seal:(g,w,h)=>sub(g,w*.66,h*.08,h*.42,h*.42,(g,a,b)=>dieOf(g,a,b,{shape:'seal',text:'Impøssible Outcomes · New York',size:.98})),
      addr:(g,w,h)=>sub(g,w*.08,h*.5,w*.6,h*.42,(g,a,b)=>strikes(g,a,b,{text:'Studio, Fourth Floor / 1 Surface Street / Brooklyn, New York',fsize:Math.max(9,b*.11),lead:1.6,seed:21})) },
    run(P,W,H,dpr,x){ return chain([{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:x.clips.seal}}},{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:x.clips.addr}}}],W,H,dpr,x); } },
  { id:'u-slip', job:'print', title:'Ledger slip · newsprint, stamped', sub:'A typed slip on cheap newsprint — the stock override makes the paper itself warmer, fibrous, pitted — then a rubber PAID stamp at an angle, rolled light so the ring breaks on the tooth.', uses:['fx-07-typewriter','fx-02-ink-edge','fx-03-paper-tooth'], aspect:'2/3',
    overrides:{'fx-03-paper-tooth':NEWS,'fx-07-typewriter':{stock:'paper',exhaust:.55,vari:.4,impress:.25},'fx-02-ink-edge':Object.assign({stock:'paper',mShape:'none',edge:1.7,width:4,pressure:.62,bite:.75,starve:.05,density:.9},{iL:.5,iC:.15,ih:262})},
    clips:{ lines:(g,w,h)=>sub(g,w*.04,h*.06,w*.92,h*.6,(g,a,b)=>strikes(g,a,b,{text:'LEDGER · SET 01 / ------------------------ / 01 STIPPLE RAMP     1.55 / 02 INK LEAVING      0.58 / 03 PAPER TOOTH      1.10 / 04 WEAVE        32 × 30 / 05 GRAPHITE         1.90 / ------------------------ / TOTAL              8 FX',fsize:Math.max(8,a*.042),lead:1.6,seed:30})),
      stamp:(g,w,h)=>{ g.save(); g.translate(w*.6,h*.78); g.rotate(-.22); sub(g,-w*.24,-w*.24,w*.48,w*.48,(g,a,b)=>dieOf(g,a,b,{shape:'seal',text:'PAID · 10 · 24 · PAID',size:.98})); g.restore(); } },
    run(P,W,H,dpr,x){ return chain([{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:x.clips.lines}}},{fx:inkEdge,o:P('fx-02-ink-edge'),x:{clip:x.clips.stamp}}],W,H,dpr,x); } },
  { id:'u-sketch', job:'print', title:'Graphite study · drawn by the light', sub:'A sphere hatched in graphite on cold-press paper. The value field IS the sheet light: drag the light and the drawing re-shades itself — core shadow, cast shadow, the gleam on the dark side.', uses:['fx-05-graphite','fx-03-paper-tooth','fx-07-typewriter'], aspect:'4/3',
    overrides:{'fx-03-paper-tooth':COLD,'fx-05-graphite':{stock:'paper',mShape:'none',layers:3,spacing:1.7,len:46,cross:62,sheen:.6},'fx-07-typewriter':{stock:'paper',impress:.15}},
    clips:{ cap:(g,w,h)=>sub(g,w*.02,h*.86,w*.6,h*.12,(g,a,b)=>strikes(g,a,b,{text:'fig. 1 — sphere under the sheet light',fsize:Math.max(8,b*.3),seed:2})) },
    run(P,W,H,dpr,x){ const w=W/dpr, h=H/dpr, cx=w*.46, cy=h*.44, Rr=h*.29, [lx,ly,lz]=FX.lightVec(), pl=Math.hypot(lx,ly)||1;
      const scx=cx-lx/pl*Rr*1.15, scy=cy+Rr*.95, srx=Rr*1.25, sry=Rr*.3;
      const field=(u,v)=>{ const dx=(u-cx)/Rr, dy=(v-cy)/Rr, r2=dx*dx+dy*dy; if(r2<1){ const nz=Math.sqrt(1-r2), lam=Math.max(0,dx*lx+dy*ly+nz*lz), rim=Math.pow(1-nz,3)*.25; return clamp(Math.pow(1-lam,1.25)*.92-rim,0,1); }
        const ex=(u-scx)/srx, ey=(v-scy)/sry, e2=ex*ex+ey*ey; return e2<1?(1-e2)*.7:0; };
      return chain([{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:x.clips.cap}}},{fx:graphite,o:P('fx-05-graphite'),x:{field},top:true}],W,H,dpr,x); } },
  /* ═══ packaging ═══ */
  { id:'u-label', job:'packaging', title:'Label · graphite, foil, lot number', sub:'A pack label: a hatched graphite panel, a foil title stamped over the white below it, a typed lot line. Graphite and foil are both metals here — tilt the light and both answer, differently.', uses:['fx-05-graphite','fx-08-foil','fx-07-typewriter'], aspect:'4/5',
    overrides:{'fx-05-graphite':{stock:'paper',mShape:'none',layers:2,spacing:1.6,angle:-32,cross:70,source:'linear',vAngle:90,from:.25,to:.9,len:90},'fx-08-foil':{stock:'paper'},'fx-07-typewriter':{stock:'paper',impress:.2,exhaust:0}},
    clips:{ panel:(g,w,h)=>{ g.beginPath(); g.ellipse(w/2,h*.34,w*.38,h*.25,0,0,TAU); g.fill(); }, title:(g,w,h)=>typeAt(g,'Harvest 01',w/2,h*.76,h*.11,{align:'center',maxW:w*.82}),
      lot:(g,w,h)=>sub(g,0,h*.8,w,h*.14,(g,a,b)=>strikes(g,a,b,{text:'LOT 0612 · ROASTED 10.24 · 250 g',fsize:Math.max(8,a*.04),seed:6})) },
    run(P,W,H,dpr,x){ return chain([{fx:typewriter,o:P('fx-07-typewriter'),x:{clips:{strikes:x.clips.lot}}},{fx:graphite,o:P('fx-05-graphite'),x:{clip:x.clips.panel},top:true},{fx:foil,o:P('fx-08-foil'),x:{clips:{die:x.clips.title}},top:true}],W,H,dpr,x); } },
  { id:'u-book', job:'packaging', title:'Cloth-bound cover · blind frame, foil title', sub:'Canvas duck as the binding cloth: a blind frame pressed into the weave (the threads crush flat on the floor), then a copper foil title that takes the cloth\'s texture.', uses:['fx-04-weave','fx-06-deboss','fx-08-foil'], aspect:'2/3',
    overrides:{'fx-04-weave':DUCK,'fx-06-deboss':{stock:'cloth',depth:1.1,soft:1.6,crush:.8,lip:.1,diffuse:.9},'fx-08-foil':{stock:'cloth',fL:.66,fC:.12,fh:48,crush:.75,grain:.08,starve:.04}},
    clips:{ frame:(g,w,h)=>{ const m=w*.1; g.fillRect(m,m,w-2*m,h-2*m); g.globalCompositeOperation='destination-out'; const t=w*.012; g.fillRect(m+t,m+t,w-2*m-2*t,h-2*m-2*t); },
      title:(g,w,h)=>{ typeAt(g,'Four',w/2,h*.4,h*.1,{align:'center',maxW:w*.7}); typeAt(g,'Surfaces',w/2,h*.5,h*.1,{align:'center',maxW:w*.7}); typeAt(g,'SET 01',w/2,h*.8,h*.03,{align:'center',font:'mono',weight:500,track:3}); } },
    run(P,W,H,dpr,x){ return chain([{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:x.clips.frame}}},{fx:foil,o:P('fx-08-foil'),x:{clips:{die:x.clips.title}},top:true}],W,H,dpr,x); } },
  /* ═══ textile ═══ */
  { id:'u-tag', job:'textile', title:'Garment tag · type struck on shirting', sub:'A frayed tag of fine shirting with its care line struck through the ribbon straight onto the cloth — the ink catches the floats and drops into the gaps.', uses:['fx-04-weave','fx-07-typewriter'], aspect:'3/4',
    overrides:{'fx-04-weave':Object.assign({},SHIRT,{mShape:'rect',mInset:30,mAmp:2,mScale:30,fray:5,lift:1}),'fx-07-typewriter':{stock:'cloth',impress:0,ribbon:.3,bite:.75,density:1.4,starve:.01}},
    clips:{ txt:(g,w,h)=>sub(g,w*.1,h*.15,w*.8,h*.7,(g,a,b)=>strikes(g,a,b,{text:'ø co. / / SET 01 / LINEN · 34 × 32 / / COOL WASH / LINE DRY / NO TUMBLE',fsize:Math.max(9,a*.075),lead:1.5,seed:9,exhaust:0})) },
    run(P,W,H,dpr,x){ const S2=Object.assign({},x.S,{[WEAVE]:Object.assign({},x.S[WEAVE],{mShape:'none'})}); return chain([{fx:weave,o:P('fx-04-weave')},{fx:typewriter,o:P('fx-07-typewriter'),x:{S:S2,clips:{strikes:x.clips.txt}}}],W,H,dpr,x); } },
  /* ═══ screen & deck ═══ */
  { id:'u-deck', job:'screen', title:'Deck ground · sparse stipple, cropped emboss', sub:'A slide ground that earns its texture: the faintest stipple gathering in one corner, an oversized ø embossed and cropped off the edge (the crop is real), live type on top.', uses:['fx-01-stipple','fx-06-deboss','fx-03-paper-tooth'], aspect:'16/9', span:2,
    overrides:{'fx-01-stipple':{stock:'paper',mShape:'none',source:'radial',from:.32,to:0,ease:['in',2.2],pitch:1.5,dotR:.4},'fx-06-deboss':{depth:-.7,soft:3,lip:0,crush:.3,stock:'paper'}},
    labels:[['Q4 · Surfaces','ø co.']],
    clips:{ mark:(g,w,h)=>sub(g,w*.58,-h*.25,h*1.3,h*1.3,(g,a,b)=>dieOf(g,a,b,{size:1})) },
    run(P,W,H,dpr,x){ const w=W/dpr,h=H/dpr; const field=(u,v)=>{ const d=Math.hypot(u,v-h)/Math.hypot(w,h); return FX.ease(['in',2.4],clamp(1-d*1.7,0,1))*.42; };
      return chain([{fx:deboss,o:P('fx-06-deboss'),x:{clips:{die:x.clips.mark}}},{fx:stipple,o:P('fx-01-stipple'),x:{field}}],W,H,dpr,x); } },
  /* ═══ data ═══ */
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

G.FXSET={ code:'T-04', clips:(id,W,H,dpr,o,img,mk)=>clipsFor(FXSET.effects.find(e=>e.id===id),W,H,dpr,o,img,mk), title:'Effect set · Four surfaces', short:'Four surfaces', set:'Set 01',
  premise:'Two stocks and two marks, one material system. Paper and cloth are height fields; pen dots and a roller print into them through one ink chain; one sheet light rakes all of it. No gradient stands in for anything.',
  system:{ read:'Ink on real stock under one raking light.', sharedCause:['stock height field → relief shading · ink acceptance · starved pinholes · wicking · ink mottle','sheet light → paper relief · thread modeling · thread cast shadows · object shadows on the page'], passOrder:['stock height (tooth · fibers · pits · formation | threads)','albedo (paper L, thread dyes in OKLab)','ink pressure (dot footprints | roller run-out) × mask','acceptance vs height → starve → wick → film thickness','color: Beer–Lambert film in linear light (or coverage mix)','light: × Lambert shade × height shadow (once, last)','page: object cast shadow, sRGB encode'] },
  source:'Mindgut · Technique & Front-End Study V01 §08 (texture recipes) · ø co. · 2026-10-23',
  jobs:[['brand','Stationery & brand'],['print','Print'],['packaging','Packaging'],['textile','Textile'],['screen','Screen & deck'],['data','Data']],
  sections:[{id:'surfaces',title:'Four surfaces',blurb:'The source set: two stocks and two marks.'},{id:'surprise',title:'Surprise marks',blurb:'Marks that only make sense on a material system — one is pure light, one is metal, one is struck through cloth, one gleams.'}],
  effects:[stipple,inkEdge,tooth,weave,graphite,deboss,typewriter,foil], usages };
})(typeof window!=='undefined'?window:self);
