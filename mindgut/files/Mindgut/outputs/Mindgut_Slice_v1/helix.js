/* HELIX · the record as working memory. Three views over one dataset.
   Ledger: decisions, their scope, who made them, what is still only offered/asked/proposed.
   Field: every strand laid out by week, sized by how often later work draws on it.
   Trace: pick any strand, see what it drew on and what drew on it, across model switches.
   Proposed UI. Fictional data. */
window.Helix = (function(){
  const M = window.MG, S = window.Store;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const KIND = { made:'Decided', question:'Asked', proposal:'Proposed', offer:'Offered', suggestion:'Suggested', correction:'Corrected', check:'Checked', issue:'Problem', reopened:'Reopened', closed:'Closed' };
  const PERSON = { made:true, question:true, correction:true, issue:true, reopened:true, closed:true };
  let root, view = 'ledger', openDec = 'd1', traceId = 's17';

  function decisions(){
    const list = M.decisions.slice();
    const st = S.get();
    if (st.accepted){
      list.push({ id:'d6', title:'Holiday tin: florals or not', scope:'Holiday tin', raised:'2026-05-08', status:'open', live:true,
        reason:"Marguerite: 'maybe something festive, even floral?' The core-range rule doesn't carry over automatically.",
        from:['s26'], history:[
          { date:'2026-05-08', what:"Marguerite's note arrived.", by:'s26', kind:'question' },
          { date:'2026-05-08', what:'Mir laid out two options and led with winter linework.', by:null, kind:'suggestion' },
          { date:'2026-05-08', what:`Dana chose to put option ${st.accepted} to Marguerite first.`, by:st.added.filter(s=>s.kind==='decision').slice(-1)[0]?.id, kind:'question' } ],
        open:[ { what: st.accepted===1 ? 'Winter linework, no florals' : 'Floral exception, holiday tin only', state:'asked', since:'2026-05-08' } ] });
    }
    return list;
  }
  const status = d => S.status(d);

  function tabs(){
    const T = [['ledger','Ledger','Decisions and what is still open'],['field','Field','Every strand, by week'],['trace','Trace','Where any answer came from']];
    return `<div class="htabs" role="tablist">${T.map(([k,n,d]) => `<button role="tab" aria-selected="${view===k}" class="htab ${view===k?'on':''}" data-view="${k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`;
  }

  /* ---------------- Ledger ---------------- */
  function ledger(){
    const ds = decisions();
    const live = ds.filter(d => status(d) !== 'closed'), done = ds.filter(d => status(d) === 'closed');
    const row = d => {
      const s = status(d), on = openDec === d.id;
      return `<li class="lg-row st-${s} ${on?'on':''}"><button class="lg-head" data-dec="${d.id}" aria-expanded="${on}">
        <span class="lg-t">${esc(d.title)}</span><span class="lab">${esc(d.scope)}</span><span class="pill p-${s}">${M.STATE[s]||s}</span></button></li>`;
    };
    const d = ds.find(x => x.id === openDec) || ds[0];
    return `<div class="lg">
      <div class="lg-list">
        <ul>${live.map(row).join('')}</ul>
        ${done.length ? `<div class="lg-rest"><span class="lab">Closed · kept, out of the way</span><ul>${done.map(row).join('')}</ul></div>` : ''}
      </div>
      <div class="lg-detail">${detail(d)}</div>
    </div>`;
  }
  function detail(d){
    const s = status(d);
    const when = d.made ? `Decided ${M.fmt(d.made)}` : `Raised ${M.fmt(d.raised)} · not decided`;
    const hist = d.history.slice();
    S.get().added.filter(a => a.decision === d.id).forEach(a => hist.push({ date:a.date, what:a.text, by:a.id, kind:a.kind }));
    return `<article class="dd">
      <header><span class="lab">${esc(d.scope)} · ${esc(when)}</span><h3>${esc(d.title)}</h3></header>
      <p class="dd-why"><span class="lab">Reason on file</span>${esc(d.reason)}</p>
      ${(d.open||[]).length ? `<div class="dd-open"><span class="lab">Not decided</span>${d.open.map(o => `<div class="dd-o">${Marks.svg('caret',{color:'var(--orange)'})}<div><b>${esc(o.what)}</b><span>${esc(M.ITEM[o.state])} · since ${esc(M.fmt(o.since))}</span>${o.note?`<span>${esc(o.note)}</span>`:''}</div></div>`).join('')}</div>` : ''}
      <ol class="dd-h">${hist.map(h => `<li class="k-${h.kind} ${PERSON[h.kind]?'person':'mir'}">
        <span class="dd-date mono">${esc(M.fmt(h.date))}</span>
        <span class="dd-kind">${KIND[h.kind]||''}</span>
        <span class="dd-what">${esc(h.what)}</span>
        ${h.by && M.byId[h.by] ? `<button class="cite sm" data-trace="${h.by}">Trace</button>` : ''}</li>`).join('')}</ol>
      <div class="dd-act">
        ${s==='closed' ? `<button class="tbtn" data-set="${d.id}:reopened">Reopen</button>` : `<button class="tbtn" data-set="${d.id}:closed">Close</button>`}
        ${s==='open' && !d.live ? `<button class="tbtn" data-set="${d.id}:held">Mark decided</button>` : ''}
        <span class="dd-hint">Changes are written to the record with today's date.</span>
      </div>
    </article>`;
  }

  /* ---------------- Field ---------------- */
  let topic = null;
  const TOPICS = [['florals','Florals'],['pattern','Pattern'],['sampler','Sampler'],['type','Type'],['holiday','Holiday']];
  function snippet(t, n){ t = t.replace(/^Struck: /,''); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/,'') + '…' : t; }
  function field(){
    const max = Math.max(...M.strands.map(s => s.returns));
    const weeks = Array.from(new Set(M.strands.map(s => s.week))).sort((a,b)=>a-b);
    const cols = weeks.map(w => {
      const ss = M.strands.filter(s => s.week === w);
      const sw = ss.find(s => s.switch);
      return `<div class="fc ${sw?'has-switch':''}">
        <div class="fc-h"><span class="mono">W${w}</span><span class="lab">${esc(M.fmt(ss[0].date))}</span></div>
        ${sw ? `<div class="fc-switch lab">${esc(M.models.A.short)} → ${esc(M.models[sw.model].short)}</div>` : ''}
        ${ss.map(s => {
          const wgt = s.returns / max, size = 12 + Math.round(wgt*15);
          const dim = topic && !(s.tags||[]).includes(topic);
          const cls = [s.who, s.stance ? 'stance' : '', s.struck ? 'struck' : '', s.live ? 'live' : '', dim ? 'dim' : '', S.get().focus===s.id ? 'focus':''].join(' ');
          return `<button class="fs ${cls}" data-trace="${s.id}" style="--fs:${size}px;--fw:${380+Math.round(wgt*300)}" title="${esc(M.fmt(s.date))} · ${s.who==='user'?'Dana':'Mir'}">
            ${s.returns>2 ? `<span class="fs-n mono">${s.returns}</span>` : ''}${esc(snippet(s.text, s.returns > 3 ? 120 : 70))}${s.stance ? `<em>${s.stance}</em>` : ''}</button>`;
        }).join('')}
      </div>`;
    }).join('');
    return `<div class="fld">
      <div class="fld-bar"><span class="lab">Size: how often later work draws on it</span>
        <div class="chips"><button class="chip ${!topic?'on':''}" data-topic="">All</button>${TOPICS.map(([k,n]) => `<button class="chip ${topic===k?'on':''}" data-topic="${k}">${n}</button>`).join('')}</div>
        <span class="fld-key"><i class="k user"></i>Dana <i class="k mir"></i>Mir <i class="k stance"></i>Offer or proposal <i class="k struck"></i>Struck</span>
      </div>
      <div class="fld-grid">${cols}</div>
    </div>`;
  }

  /* ---------------- Trace ---------------- */
  function upstream(id, depth, seen){
    const s = M.byId[id]; if (!s || depth > 2) return [];
    return (s.refs||[]).filter(r => !seen.has(r) && seen.add(r)).map(r => ({ s:M.byId[r], d:depth, kids:upstream(r, depth+1, seen) }));
  }
  function card(s, cls=''){
    const m = M.models[s.model];
    return `<button class="tc ${s.who} ${cls} ${s.struck?'struck':''}" data-trace="${s.id}">
      <span class="tc-m"><span class="mono">${esc(M.fmt(s.date))}</span><span class="lab">${s.who==='user'?'Dana':'Mir · '+esc(m.short)}</span>${s.stance?`<span class="stance">${s.stance}</span>`:''}</span>
      <span class="tc-t">${esc(snippet(s.text, cls==='hero' ? 400 : 140))}</span></button>`;
  }
  function tree(nodes){
    if (!nodes.length) return '';
    return `<ul class="tt">${nodes.map(n => `<li>${card(n.s)}${tree(n.kids)}</li>`).join('')}</ul>`;
  }
  function trace(){
    const s = M.byId[traceId] || M.byId.s17;
    const up = upstream(s.id, 0, new Set());
    const down = M.strands.filter(x => (x.refs||[]).includes(s.id));
    const decs = M.decisions.filter(d => d.from.includes(s.id) || d.history.some(h => h.by === s.id));
    const models = new Set([s, ...up.flatMap(function f(n){ return [n.s, ...n.kids.flatMap(f)]; })].map(x => x.model));
    const picks = ['s17','s25','s19','s13','s21'];
    return `<div class="tr">
      <div class="tr-bar"><span class="lab">Try</span>${picks.map(p => `<button class="chip ${p===s.id?'on':''}" data-trace="${p}">${esc(M.fmt(M.byId[p].date))} · ${esc(snippet(M.byId[p].text, 34))}</button>`).join('')}</div>
      <div class="tr-cols">
        <div class="tr-up"><span class="lab">Drew on</span>${up.length ? tree(up) : '<p class="empty">Nothing earlier. This is where it starts.</p>'}</div>
        <div class="tr-mid"><span class="lab">Selected</span>${card(s,'hero')}
          ${models.size > 1 ? `<p class="tr-note">${Marks.svg('arrow',{color:'var(--blue)'})} This chain crosses a model switch: ${[...models].map(k => esc(M.models[k].short)).join(' → ')}.</p>` : ''}
          ${s.struck ? `<p class="tr-note o">${Marks.svg('strike',{color:'var(--orange)'})} ${esc(s.struckNote)}</p>` : ''}
          ${decs.length ? `<div class="tr-dec"><span class="lab">Part of</span>${decs.map(d => `<button class="cite sm" data-dec="${d.id}" data-go="ledger">${esc(d.title)}</button>`).join('')}</div>` : ''}
        </div>
        <div class="tr-down"><span class="lab">Later work that drew on it</span>${down.length ? `<ul class="tt">${down.map(x => `<li>${card(x)}</li>`).join('')}</ul>` : '<p class="empty">Nothing yet.</p>'}</div>
      </div>
    </div>`;
  }

  function render(){
    const body = view === 'ledger' ? ledger() : view === 'field' ? field() : trace();
    root.innerHTML = `<div class="hwin">${tabs()}<div class="hbody v-${view}">${body}</div></div>`;
  }
  function onClick(e){
    const t = e.target.closest('button'); if (!t || !root.contains(t)) return;
    if (t.dataset.view){ view = t.dataset.view; render(); return; }
    if (t.dataset.trace){ traceId = t.dataset.trace; S.focus(traceId); view = 'trace'; render(); return; }
    if (t.dataset.dec){ openDec = t.dataset.dec; view = 'ledger'; render(); return; }
    if (t.dataset.topic !== undefined){ topic = t.dataset.topic || null; render(); return; }
    if (t.dataset.set){
      const [id, st] = t.dataset.set.split(':');
      const d = decisions().find(x => x.id === id);
      S.addStrand({ who:'user', text: (st==='closed'?'Closed: ':st==='reopened'?'Reopened: ':'Marked decided: ') + d.title, tags:['decision'], refs:d.from.slice(-1), kind:st==='held'?'made':st, decision:id });
      S.setDecision(id, st); return;
    }
  }
  function mount(el){
    root = el; root.addEventListener('click', onClick);
    S.on((why) => { if (['strike','decide','decision','model'].includes(why)) render(); });
    render();
  }
  function openDecision(id){ openDec = id; view = 'ledger'; if (root) render(); }
  return { mount, openDecision };
})();
