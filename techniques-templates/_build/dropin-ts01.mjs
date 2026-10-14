// Drop-in test: compose the five lifted TS-01 modules outside the site, no canvas, no shell, no art.js.
// node _build/dropin-ts01.mjs > out.ppm  — reuse proof: the five lifted TS-01 modules composed outside the site, no canvas, no shell, no art.js.
const L=new URL('../techniques/ts-01-moire-ring-screens/lib/',import.meta.url).href;
const margin=await import(L+'paper-margin.js'), ring=await import(L+'ring-screen.js'), moire=await import(L+'moire-product.js'), heat=await import(L+'radial-heat.js'), screen=await import(L+'stochastic-grain.js');
const W=400,H=520,u=W/1000; const V={ overCore:'#F58A80', overFar:'#7A3A6A' }; const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const paper=hex('#F0EBE7'), field=hex('#DCD8DC'), inkA=hex('#3670B8'), inkB=hex('#F2381C');
const P={...ring.params, B:{...ring.params.B, pitch_u:96}};           // override one parameter: grating B pitch 60 → 96
const m=margin.make(margin.params,u), r=ring.make(P,u), mo=moire.make(moire.params,moire.A), h=heat.make(heat.params,u), sc=screen.make(screen.params,screen.A,V);
const out=Buffer.alloc(W*H*3); for(let y=0;y<H;y++)for(let x=0;x<W;x++){ let c=paper; if(m.inside(x,y,W,H)){ const dA=Math.hypot(x-r.A.cx,y-r.A.cy), dB=Math.hypot(x-r.B.cx,y-r.B.cy); const prod=mo.prod(r.g(dA,r.A.pitch),r.g(dB,r.B.pitch)); c=sc.ink(mo.coverage(prod,r.floor),h.cov(Math.hypot(x-h.cx,y-h.cy)),prod,h.cutoff,inkA,inkB,field); } const i=(y*W+x)*3; out[i]=c[0]; out[i+1]=c[1]; out[i+2]=c[2]; }
process.stdout.write(`P6 ${W} ${H} 255\n`); process.stdout.write(out);
