/* T-04 · Effect set · render worker · ø co. Techniques & Templates
   Loads the same fx.js + set.js as the page and renders one job at a time off the main thread, so dials stay
   responsive on any device. Job in: { key, token, kind:'fx'|'u', id, W, H, dpr, S, light, view, clips }.
   Out: { key, token, W, H, rgba (transferred), stats } — or { error }. Stock fields are cached per worker. */
self.importScripts('fx.js'+(self.location&&self.location.search||''),'set.js'+(self.location&&self.location.search||'')); // same cache stamp as the page
const enc=FX.enc;
const toRGBA=(R,view,W,H)=>{ const out=new Uint8ClampedArray(W*H*4);
  if(view==='image'||!view){ const l=R.lin; for(let i=0,j=0,k=0;i<W*H;i++,j+=4,k+=3){ out[j]=enc(l[k]); out[j+1]=enc(l[k+1]); out[j+2]=enc(l[k+2]); out[j+3]=255; } return out; }
  const f=view==='ink'?R.ink:view==='stock'?R.stock:R.mask, inv=view!=='stock';
  for(let i=0,j=0;i<W*H;i++,j+=4){ let v=f?f[i]:0; if(view==='ink') v=Math.min(1,v); if(view==='stock') v=f?Math.min(1,v):.5; const g=Math.round(255*(inv?1-v:v)); out[j]=out[j+1]=out[j+2]=g; out[j+3]=255; } return out; };
self.render=(j)=>{ FX.LIGHT=j.light||FX.LIGHT; const t0=performance.now(); let R;
  if(j.kind==='fx'){ const e=FXSET.effects.find(e=>e.id===j.id); R=e.run(j.S[j.id],j.W,j.H,j.dpr,{S:j.S}); }
  else { const u=FXSET.usages.find(u=>u.id===j.id); const S={}; for(const id in j.S) S[id]=Object.assign({},j.S[id],(u.overrides||{})[id]||{}); R=u.run(id=>S[id],j.W,j.H,j.dpr,{S,clips:j.clips||{}}); }
  return { rgba:toRGBA(R,j.view,j.W,j.H), stats:{ms:performance.now()-t0,marks:R.marks,unit:R.markUnit||'',W:j.W,H:j.H} }; };
self.onmessage=({data:j})=>{ try{ const r=self.render(j); self.postMessage({key:j.key,token:j.token,W:j.W,H:j.H,dpr:j.dpr,scale:j.scale,rgba:r.rgba,stats:r.stats},[r.rgba.buffer]); }catch(err){ self.postMessage({key:j.key,token:j.token,error:String(err&&err.stack||err)}); } };
