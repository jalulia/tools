/* Product screen. Fictional scenario, proposed UI.
   Thread on the left, sources on the right. Every Mir move cites strands; click a
   citation and its source opens with date, model and what it drew on. Strike any move
   to correct it (kept struck, logged). Swap the model and continue. Move 4 offers a
   fresh decision; choosing one writes it to the record. */
window.Product = (function(){
  const M = window.MG, S = window.Store, X = M.exchange;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const KIND = { scope:'Scope', reason:'Reason', connection:'Connection', decide:'Your call' };
  const STANCE = { proposal:'proposal', offer:'offer', suggestion:'suggestion' };
  let root, srcOpen = null, switched = false;

  const CONT = {
    q: "Switched model. Before I go to Marguerite: what are we holding fixed, and what's actually open?",
    a: (m) => [
      { t:"Held: no florals on the core range, made 2 March, her reason was 'reads like a gift shop'.", c:['s4','s5'] },
      { t:"Open, and not mine to close: the holiday tin needs its own call. Also open from before: the serif question (my proposal from 27 March, never approved), the oolong tile fix (30° or 0.35pt, offered 24 April, not confirmed), and whether the peel pattern goes onto the core range (her question on 1 May, my suggestion, not approved).", c:['s13','s21','s22','s25'] },
      { t:"Nothing about this answer depends on which model is reading the record. I'm " + m + " now; the decisions didn't move.", c:[] }
    ]
  };

  function cite(ids){
    if (!ids || !ids.length) return '';
    return '<span class="cites">' + ids.map(id => {
      const s = M.byId[id]; if (!s) return '';
      return `<button class="cite" data-src="${id}" aria-label="Source ${esc(M.fmt(s.date))}">${esc(M.fmt(s.date))}</button>`;
    }).join('') + '</span>';
  }
  function who(s){ return s.who === 'user' ? 'Dana' : 'Mir · ' + M.models[s.model].short; }

  function sourceCard(id){
    const s = M.byId[id]; if (!s) return '';
    const refs = (s.refs||[]).map(r => M.byId[r]).filter(Boolean);
    const stance = s.stance ? `<span class="stance">${STANCE[s.stance]}, not a decision</span>` : '';
    const dec = M.decisions.filter(d => d.from.includes(id) || d.history.some(h => h.by === id));
    return `<article class="src ${s.who}" data-id="${id}">
      <header><span class="lab">${esc(M.fmt(s.date))} · week ${s.week}</span><span class="lab">${esc(who(s))}</span></header>
      <p class="${s.struck ? 'is-struck' : ''}">${esc(s.text)}</p>
      ${s.struck ? `<p class="src-note">${Marks.svg('strike',{color:'var(--orange)'})} ${esc(s.struckNote)}</p>` : ''}
      ${stance}
      ${refs.length ? `<div class="src-refs"><span class="lab">Drew on</span>${refs.map(r => `<button class="cite sm" data-src="${r.id}">${esc(M.fmt(r.date))} · ${esc(r.who==='user'?'Dana':'Mir')}</button>`).join('')}</div>` : ''}
      ${dec.length ? `<div class="src-refs"><span class="lab">Part of</span>${dec.map(d => `<a class="cite sm dec" href="#helix" data-dec="${d.id}">${esc(d.title)}</a>`).join('')}</div>` : ''}
    </article>`;
  }

  function moveHTML(mv, i){
    const st = S.get(), struck = st.struck[i];
    const isDecide = mv.kind === 'decide';
    let body = `<p class="mv-text">${esc(mv.text)}</p>`;
    if (isDecide){
      const ch = st.accepted;
      body = `<p class="mv-text">This needs a fresh call, not an inherited one. Two ways to put it to her:</p>
      <div class="opts">
        <button class="opt ${ch===1?'on':''}" data-opt="1"><span class="opt-n">1</span><span><b>Winter linework, no florals.</b> Bare branches and seed heads in the March vein linework. Consistent with every decision on file. My lead.</span></button>
        <button class="opt ${ch===2?'on':''}" data-opt="2"><span class="opt-n">2</span><span><b>A floral exception, holiday tin only.</b> Logged as its own decision with her name on it. The core-range rule stays as made.</span></button>
      </div>
      ${ch ? `<p class="opt-done">${Marks.svg('circle',{color:'var(--blue)'})} Logged as a question to put to Marguerite, leading with option ${ch}. Not a decision until she makes it. <button class="link" data-undo-opt>Undo</button></p>` : ''}`;
    }
    return `<div class="mv ${struck ? 'struck' : ''}" data-i="${i}">
      <div class="mv-k"><span class="lab">${KIND[mv.kind]}</span></div>
      <div class="mv-b">${body}${cite(mv.cites)}
        ${struck ? `<p class="mv-note">${Marks.svg('strike',{color:'var(--orange)'})} <span>Struck by you: ${esc(struck)}</span> <button class="link" data-unstrike="${i}">Restore</button></p>` : ''}
      </div>
      ${isDecide ? '' : `<button class="mv-strike" data-strike="${i}" title="Strike this and say why" aria-label="Strike this move">${Marks.svg('strike')}</button>`}
    </div>`;
  }

  function thread(){
    const st = S.get(), m = M.models[st.model];
    const wrong = st.showWrong ? `<div class="mv wrong"><div class="mv-k"><span class="lab">A wrong answer</span></div>
      <div class="mv-b"><p class="mv-text is-struck">${esc(X.wrong.text)}</p>${cite(X.wrong.cites)}
      <p class="mv-note">${Marks.svg('bracket',{color:'var(--orange)'})} <span>${esc(X.wrong.note)}</span></p></div></div>` : '';
    let cont = '';
    if (switched){
      cont = `<div class="switch-rule"><span class="lab">Model switched to ${esc(m.name)} · same record</span></div>
      <div class="msg user"><span class="lab">Dana</span><p>${esc(CONT.q)}</p></div>
      <div class="msg mir"><span class="lab">Mir · ${esc(m.short)}</span>${CONT.a(m.short).map(x => `<p>${esc(x.t)} ${cite(x.c)}</p>`).join('')}</div>`;
    }
    return `<div class="thread">
      <div class="msg user"><span class="lab">Dana · 8 May · week 10</span><p>${esc(X.question)}</p></div>
      <div class="msg mir"><span class="lab">Mir · ${esc(M.models.B.short)}</span>
        <div class="moves">${X.moves.map(moveHTML).join('')}</div>
        ${wrong}
      </div>
      ${cont}
    </div>`;
  }

  function side(){
    const st = S.get();
    const cited = srcOpen ? [srcOpen] : [];
    const inPlay = M.decisions.map(d => {
      const s = S.status(d), items = d.open || [];
      return `<li class="d-row st-${s}"><button data-dec-open="${d.id}"><span class="d-t">${esc(d.title)}</span>
        <span class="d-m"><span class="pill p-${s}">${M.STATE[s]||s}</span><span class="lab">${esc(d.scope)}</span></span>
        ${items.map(o => `<span class="d-o">${Marks.svg('caret',{color:'var(--orange)'})}${esc(o.what)} · <i>${esc(M.ITEM[o.state])}</i></span>`).join('')}
      </button></li>`;
    }).join('');
    return `<aside class="side">
      <div class="side-src">
        <div class="side-h"><span class="lab">${srcOpen ? 'Source' : 'Sources'}</span>${srcOpen ? '<button class="link" data-close-src>Close</button>' : ''}</div>
        ${srcOpen ? sourceCard(srcOpen) : `<p class="side-empty">Every date in Mir's answer is a source. Open one to see what was actually said, by whom, on which model, and what it drew on.</p>`}
      </div>
      <div class="side-dec">
        <div class="side-h"><span class="lab">In play on this project</span></div>
        <ul class="d-list">${inPlay}</ul>
      </div>
    </aside>`;
  }

  function toolbar(){
    const st = S.get();
    return `<div class="ptool">
      <span class="lab">Hollis &amp; Vane · winter tin</span>
      <div class="ptool-r">
        <label class="sel"><span class="lab">Model</span>
          <select id="p-model">${Object.values(M.models).map(m => `<option value="${m.id}" ${st.model===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label>
        <button class="tbtn ${st.showWrong?'on':''}" id="p-wrong">${st.showWrong ? 'Hide' : 'Show'} a wrong answer</button>
      </div>
    </div>`;
  }

  function render(){
    root.innerHTML = `<div class="pwin">${toolbar()}<div class="pbody"><div class="pmain">${thread()}
      <div class="composer"><span>Reply to Mir…</span><span class="lab">Proposed UI</span></div></div>${side()}</div></div>`;
  }

  function strikeFlow(i){
    const mv = X.moves[i];
    const el = root.querySelector(`.mv[data-i="${i}"] .mv-b`);
    if (!el || el.querySelector('.strike-form')) return;
    const presets = {
      scope: "She's said she wants florals for this one. Treat it as already decided.",
      reason: "The gift-shop line was about the core range only; don't stretch it.",
      connection: "The vein linework is the sampler's. Don't reuse it on a second product."
    };
    el.insertAdjacentHTML('beforeend', `<form class="strike-form">
      <label class="lab" for="sf-${i}">Why strike it?</label>
      <input id="sf-${i}" value="${esc(presets[mv.kind] || '')}">
      <div><button type="submit" class="tbtn on">Strike</button><button type="button" class="link" data-cancel>Cancel</button></div>
    </form>`);
    const f = el.querySelector('.strike-form'); f.querySelector('input').focus();
    f.onsubmit = (e) => { e.preventDefault(); const v = f.querySelector('input').value.trim() || 'Not right.'; S.strike(i, v, mv.cites); };
    f.querySelector('[data-cancel]').onclick = () => f.remove();
  }

  function onClick(e){
    const t = e.target.closest('button,a'); if (!t || !root.contains(t)) return;
    if (t.dataset.src){ srcOpen = t.dataset.src; S.focus(srcOpen); render(); return; }
    if (t.hasAttribute('data-close-src')){ srcOpen = null; render(); return; }
    if (t.dataset.strike){ strikeFlow(+t.dataset.strike); return; }
    if (t.dataset.unstrike){ S.unstrike(+t.dataset.unstrike); return; }
    if (t.dataset.opt){
      const o = +t.dataset.opt;
      S.decide(o, o===1 ? 'To put to Marguerite: winter linework, no florals (lead).' : 'To put to Marguerite: floral exception scoped to the holiday tin.', ['s5','s19','s7']);
      return;
    }
    if (t.hasAttribute('data-undo-opt')){ S.set('accepted', null, 'decide'); return; }
    if (t.id === 'p-wrong'){ S.set('showWrong', !S.get().showWrong); return; }
    if (t.dataset.decOpen || t.dataset.dec){
      const id = t.dataset.decOpen || t.dataset.dec;
      if (window.Helix) Helix.openDecision(id);
      document.getElementById('helix').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      e.preventDefault();
    }
  }

  function mount(el){
    root = el;
    root.addEventListener('click', onClick);
    root.addEventListener('change', (e) => {
      if (e.target.id === 'p-model'){ switched = e.target.value !== 'B'; S.set('model', e.target.value, 'model'); }
    });
    S.on((why) => { if (['strike','decide','showWrong','model','decision'].includes(why)) render(); });
    render();
  }
  return { mount };
})();
