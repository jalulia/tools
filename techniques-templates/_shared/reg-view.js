/* Techniques & Templates · "All techniques" view · ø co.
   One renderer for the registry tab, used by index.html at runtime and by _build/build.mjs to bake the static page.
   TT_REGVIEW(REG, { q, fam }) → HTML. REG is window.TT_REG from reg-index.js. */
window.TT_REGVIEW=function(REG,st){
  "use strict";
  st=st||{}; const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const cap=s=>String(s||'').replace(/-/g,' ');
  const words=(st.q||'').toLowerCase().split(/\s+/).filter(Boolean);
  const hay=e=>[e.id,e.name,e.family,...e.studies.map(s=>s.code+' '+s.title),...e.lifts.map(l=>l.code+' '+l.title),...e.recs.map(r=>r.code+' '+r.title),...e.modules].join(' ').toLowerCase();
  const hit=e=>(!st.fam||e.family===st.fam)&&words.every(w=>hay(e).includes(w));
  const shown=REG.entries.filter(hit).length;
  const chips=`<div class="fams"><a href="#all${st.q?'?q='+encodeURIComponent(st.q):''}" class="${st.fam?'':'on'}">all <i>${REG.entries.length}</i></a>${REG.families.map(f=>`<a href="#all?f=${encodeURIComponent(f.id)}${st.q?'&q='+encodeURIComponent(st.q):''}" class="${st.fam===f.id?'on':''}">${esc(cap(f.id))} <i>${f.n}</i></a>`).join('')}</div>`;
  const link=(x,cls)=>`<a href="${esc(x.href)}"${cls?` class="${cls}"`:''} title="${esc(x.title)}">${esc(x.code||x.title)}</a>`;
  const card=e=>{ const on=hit(e); const used=[...e.studies.map(s=>link(s,'st')),...e.lifts.map(l=>link(l)),...e.recs.filter(r=>r.code).map(r=>link(r))].slice(0,9);
    const plates=e.recs.filter(r=>!r.code).length; const mods=e.modules.map(m=>`<a href="${esc(m)}" class="mod">${esc(m.split('/').pop())}</a>`).join('<i>·</i>');
    const meta=[e.n?e.n+(e.n===1?' use':' uses'):'', e.modules.length?e.modules.length+(e.modules.length===1?' module':' modules'):'', e.kind==='read'?'subject read':''].filter(Boolean).join(' · ');
    const pv=e.pic?`<a class="pv" href="${esc(e.href)}"><img src="${esc(e.pic)}" alt="" loading="lazy" onerror="this.parentNode.classList.add('ty');this.remove()"></a>`:`<a class="pv ty" href="${esc(e.href)}"><b>${esc(e.name)}</b></a>`;
    return `<div class="card rc${on?'':' dim'}" id="t-${esc(e.id)}">${pv}<div class="tx"><div class="code"><span>${esc(cap(e.family))}</span><span>${esc(meta)}</span></div><a class="ttl" href="${esc(e.href)}">${esc(e.name)}</a>${used.length||plates?`<div class="tks">${used.join('<i>·</i>')}${plates?`${used.length?'<i>·</i>':''}<a href="${esc(e.lib||e.href)}">${plates} plate${plates===1?'':'s'}</a>`:''}</div>`:''}${mods?`<div class="tks mods"><span>lift</span>${mods}</div>`:''}</div></div>`; };
  const fams=REG.families.filter(f=>!st.fam||f.id===st.fam).map(f=>{ const es=REG.entries.filter(e=>e.family===f.id); if(!es.length)return ''; const n=es.filter(hit).length;
    const pics=es.filter(e=>e.pic), bare=es.filter(e=>!e.pic);
    const row=e=>{ const on=hit(e); const used=[...e.studies.map(s=>link(s,'st')),...e.lifts.map(l=>link(l)),...e.recs.filter(r=>r.code).map(r=>link(r))].slice(0,6); const mods=e.modules.map(m=>`<a href="${esc(m)}" class="mod">${esc(m.split('/').pop())}</a>`).join(' ');
      return `<li class="${on?'':'dim'}" id="t-${esc(e.id)}"><a class="nm" href="${esc(e.href)}">${esc(e.name)}</a><span class="us">${used.join('<i>·</i>')}${mods?`<i>·</i>${mods}`:''}</span></li>`; };
    return `<section class="fam" id="f-${esc(f.id)}"><h2><span>${esc(cap(f.id))}</span><span>${words.length?`${n} of ${es.length}`:`${es.length} techniques`}</span></h2><p class="blurb">${esc(f.blurb)}</p>${pics.length?`<div class="grid">${pics.map(card).join('')}</div>`:''}${bare.length?`<ul class="rbare"><li class="hd">${pics.length?'Also in this family':'In this family'} · no picture of their own yet</li>${bare.map(row).join('')}</ul>`:''}</section>`; }).join('');
  return { html:chips+fams+(words.length&&!shown?`<div class="empty">nothing filed under ${esc(st.q)}</div>`:''), shown, total:REG.entries.length };
};
