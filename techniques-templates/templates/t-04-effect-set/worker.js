/* T-04 · Effect set · render worker · Techniques & Templates
   Loads the same fx.js + set.js as the page and renders one job at a time off the main thread, so dials stay
   responsive on any device. Job in: { key, token, kind:'fx'|'u', id, W, H, dpr, S, light, view, clips, outputs? }.
   Out: { key, token, W, H, rgba (transferred), stats } — or, for an export (outputs = ['image','ink','stock']),
   { key, token, W, H, outs:{ image, ink, stock } } with one RGBA buffer per output. Stock fields are cached per worker. */
self.importScripts('fx.js'+(self.location&&self.location.search||''),'set.js'+(self.location&&self.location.search||'')); // same cache stamp as the page
const toRGBA=FX.toRGBA;
self.compute=(j)=>{ FX.LIGHT=j.light||FX.LIGHT; let R;
  if(j.kind==='fx'){ const e=FXSET.effects.find(e=>e.id===j.id); R=e.run(j.S[j.id],j.W,j.H,j.dpr,{S:j.S,clips:j.clips||{},proof:!!j.proof}); }
  else { const u=FXSET.usages.find(u=>u.id===j.id); FX.LIGHT=FXSET.lightFor(u,FX.LIGHT); const S={}; for(const id in j.S) S[id]=Object.assign({},j.S[id],(u.overrides||{})[id]||{}); R=u.run(id=>S[id],j.W,j.H,j.dpr,{S,clips:j.clips||{}}); }
  return R; };
self.render=(j)=>{ const t0=performance.now(), R=self.compute(j); return { rgba:toRGBA(R,j.view,j.W,j.H), stats:{ms:performance.now()-t0,marks:R.marks,unit:R.markUnit||'',W:j.W,H:j.H} }; };
self.onmessage=({data:j})=>{ try{
    if(j.outputs){ const t0=performance.now(), R=self.compute(j), outs={}, tr=[]; for(const v of j.outputs){ outs[v]=toRGBA(R,v,j.W,j.H); tr.push(outs[v].buffer); }
      self.postMessage({key:j.key,token:j.token,W:j.W,H:j.H,outs,stats:{ms:performance.now()-t0,marks:R.marks,unit:R.markUnit||''}},tr); return; }
    const r=self.render(j); self.postMessage({key:j.key,token:j.token,W:j.W,H:j.H,dpr:j.pdpr||j.dpr,scale:j.scale,rgba:r.rgba,stats:r.stats},[r.rgba.buffer]); }
  catch(err){ self.postMessage({key:j.key,token:j.token,error:String(err&&err.stack||err)}); } };
