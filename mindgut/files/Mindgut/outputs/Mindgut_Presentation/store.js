/* Shared runtime state over MG. Product and HELIX both read and write here,
   so a strike on the product screen shows up in the Ledger and Trace. */
window.Store = (function(){
  const M = window.MG;
  const subs = [];
  const st = {
    model: 'B',              // current model in the product screen
    struck: {},              // moveIndex -> note (corrections the viewer made)
    showWrong: false,
    accepted: null,          // option the viewer chose in move 4, or null
    added: [],               // runtime strands written by the viewer's actions
    decisionState: {},       // id -> overridden status ('closed' | 'held' | 'reopened')
    pinned: {},
    focus: null              // strand id highlighted across views
  };
  const emit = (what) => subs.forEach(f => f(what, st));
  let seq = M.strands.length;
  function addStrand(o){
    seq++;
    const s = Object.assign({ id:'s'+seq, seq:2000+seq*7, date:'2026-05-08', week:10, model:st.model, refs:[], returns:0, tags:[], live:true }, o);
    st.added.push(s); M.strands.push(s); M.byId[s.id] = s;
    s.refs.forEach(r => { if (M.byId[r]) M.byId[r].returns++; });
    return s;
  }
  return {
    get: () => st,
    on: (f) => subs.push(f),
    set(k, v, why){ st[k] = v; emit(why || k); },
    strike(i, note, cites){
      st.struck[i] = note;
      addStrand({ who:'user', text:'Struck: ' + note, tags:['correction'], refs:cites || [], kind:'correction' });
      emit('strike');
    },
    unstrike(i){ delete st.struck[i]; emit('strike'); },
    decide(opt, text, refs){
      st.accepted = opt;
      const s = addStrand({ who:'user', text, tags:['holiday','decision'], refs, kind:'decision' });
      emit('decide'); return s;
    },
    setDecision(id, status){ st.decisionState[id] = status; emit('decision'); },
    status(d){ return st.decisionState[d.id] || d.status; },
    focus(id){ st.focus = id; emit('focus'); },
    addStrand
  };
})();
