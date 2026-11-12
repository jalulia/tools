/* Mindgut slice v1 · shared dataset.
   FICTIONAL SCENARIO. Dana Okafor, two-person packaging studio, eleven weeks on
   a tea client ("Hollis & Vane"). Every strand, date and quote below is invented
   to demonstrate behaviour. Nothing here is a record of a real session.
   One dataset drives: the Field, the product screen, Ledger, Trace. */
window.MG = (function(){
  const models = {
    A: { id:'A', name:'Claude Sonnet 4.5', short:'Claude' },
    B: { id:'B', name:'GPT-5',             short:'GPT' },
    C: { id:'C', name:'Gemini 2.5 Pro',    short:'Gemini' }
  };
  // Strands: id, seq, date (ISO), week, model, who ('user'|'mir'), text,
  // tags (topic), returns (how often later strands cite it; drives Field weight)
  const S = [];
  let n = 0;
  const add = (date, week, model, who, text, tags, extra={}) => {
    n++; S.push(Object.assign({ id:'s'+n, seq:2000+n*7, date, week, model, who, text, tags, returns:0 }, extra));
    return 's'+n;
  };
  // Week 1
  add('2026-02-23', 1, 'A','user',"New client: Hollis & Vane, loose-leaf tea. Four SKUs. Brief is 'premium but not precious'. Shelf is Whole Foods and their own site.", ['brief']);
  add('2026-02-23', 1, 'A','mir',"Four SKUs and two shelves means the system has to survive a 40mm face and a 1200px hero. I'd set that as the first test for any route.", ['brief','system']);
  add('2026-02-25', 1, 'A','user',"Three routes to start: botanical illustration, typographic, and a pattern route.", ['routes']);
  // Week 2
  add('2026-03-02', 2, 'A','user',"Call notes. Botanical route is out. The CEO, Marguerite, said she 'has never liked florals on tea, it reads like a gift shop.' Said it twice.", ['florals','decision']);
  add('2026-03-02', 2, 'A','mir',"Noted as a decision with a reason, not a taste. Scope: the core range, since that's what was on the table. If a seasonal brief comes later it will need its own call.", ['florals','decision','scope']);
  add('2026-03-04', 2, 'A','user',"Agreed. Kill botanical. Keep typographic and pattern.", ['florals','decision','routes']);
  add('2026-03-06', 2, 'A','mir',"One thing worth keeping from the botanical route: the leaf-vein linework had a rhythm the pattern route lacks. Not flowers, structure. Worth parking, not deleting.", ['florals','pattern','parked'], { stance:'suggestion' });
  // Week 3
  add('2026-03-11', 3, 'A','user',"Shelf audit. Fan out: what do the eleven premium tea brands in the Whole Foods set do at 40mm?", ['audit']);
  add('2026-03-11', 3, 'A','mir',"Nine workers back. Eight of eleven use a serif wordmark. Seven use cream. Four use botanical art. Nobody uses a hard geometric pattern. That's the gap, and it's consistent with the no-florals call.", ['audit','pattern','florals']);
  // Week 4
  add('2026-03-18', 4, 'A','user',"Pattern route it is. Marguerite liked the 'tea tile' idea: one repeating unit per SKU.", ['pattern','decision']);
  add('2026-03-20', 4, 'A','mir',"If each SKU is a tile, the tiles should share a grid so the four boxes line up on shelf. 6-unit module, rotated 45° for the oolong so it breaks the row on purpose.", ['pattern','system']);
  // Week 5
  add('2026-03-27', 5, 'A','user',"Typography. Marguerite wants a serif. I don't.", ['type']);
  add('2026-03-27', 5, 'A','mir',"The audit says eight of eleven competitors are serif. Her instinct is category-correct and shelf-wrong. Offer one serif that doesn't look like tea: a wide, low-contrast face at small size only, grotesk for the SKU names.", ['type','audit'], { stance:'proposal' });
  // Week 6: credits out on model A mid-week. Switch to B.
  add('2026-04-07', 6, 'A','user',"Sampler box. Six tiny tins in a sleeve. Marguerite wants it to 'feel like a garden'.", ['sampler']);
  add('2026-04-07', 6, 'A','mir',"'Garden' is close to the thing she ruled out. Before I propose anything: the no-florals decision was scoped to the core range. The sampler is new. Worth checking whether she means flowers or means abundance.", ['sampler','florals','scope']);
  add('2026-04-08', 6, 'B','user',"Switched model, credits ran out. Where were we on the sampler?", ['sampler','switch'], { switch:true });
  add('2026-04-08', 6, 'B','mir',"Sampler sleeve for six tins. Marguerite asked for 'garden'. Open question from yesterday: flowers or abundance. Also parked since 6 March: the leaf-vein linework from the botanical route. If 'garden' means abundance, that linework is the bridge, and it stays inside the no-florals decision.", ['sampler','florals','parked','scope']);
  // Week 7
  add('2026-04-15', 7, 'B','user',"Asked her. 'Abundance, not flowers. Like a peel pattern, dense.' She approved the leaf-vein peel pattern for the sampler sleeve.", ['sampler','pattern','decision']);
  add('2026-04-15', 7, 'B','mir',"Logged: peel pattern approved for the sampler, 15 April. Botanical structure without florals. That's the first time the parked linework has shipped.", ['sampler','pattern','decision','parked']);
  // Week 8
  add('2026-04-24', 8, 'B','user',"Print test back. The 45° oolong tile moirés at 40mm.", ['pattern','print']);
  add('2026-04-24', 8, 'B','mir',"Rotate to 30°, or thicken the rule to 0.35pt. 30° keeps the row-break idea.", ['pattern','print'], { stance:'offer' });
  // Week 9: a correction. Mir is wrong and is struck.
  add('2026-05-01', 9, 'B','user',"Marguerite asked if we can use the sampler peel pattern on the core range too.", ['pattern','core']);
  add('2026-05-01', 9, 'B','mir',"That would fold the sampler into the core system. It also means the core range now carries a botanical-derived pattern, which contradicts the 2 March decision.", ['pattern','core','florals'], { struck:true, struckBy:'s24', struckNote:'Wrong scope reading. The 2 March decision was about florals, not botanical structure. Peel pattern is not florals.' });
  add('2026-05-01', 9, 'B','user',"No. The 2 March call was florals. The peel pattern isn't florals, she approved it herself. Different thing.", ['pattern','core','florals','correction']);
  add('2026-05-01', 9, 'B','mir',"Correct, struck. The decision is 'no florals', scoped to the core range; the peel pattern is botanical structure and was approved 15 April. Carrying it onto the core range would be consistent with both. That's for Marguerite to approve.", ['pattern','core','florals','correction'], { stance:'suggestion' });
  // Week 10: the question of the demo.
  add('2026-05-08', 10, 'B','user',"Holiday edition. They want a winter tin. Marguerite's note: 'maybe something festive, even floral?'", ['holiday','florals']);

  // Decisions: the Ledger. scope is explicit. status: made | rescoped | reopened | closed.
  const D = [
    { id:'d1', title:'No florals', scope:'Core range', made:'2026-03-02', status:'held',
      reason:"Marguerite: 'has never liked florals on tea, it reads like a gift shop.' Said twice on the call.",
      from:['s4','s5','s6'], history:[
        { date:'2026-03-02', what:'Made on the call. Mir logged the scope: core range.', by:'s5', kind:'made' },
        { date:'2026-04-07', what:'Scope checked when the sampler brief arrived. Held.', by:'s15', kind:'check' },
        { date:'2026-05-01', what:"Mir misread the scope as 'no botanical structure'. Struck by Dana.", by:'s24', kind:'correction' } ] },
    { id:'d2', title:'Botanical route killed; leaf-vein linework parked', scope:'Core range', made:'2026-03-06', status:'closed',
      reason:'Route out with the florals call. The vein linework kept as structure, not flowers.',
      from:['s6','s7'], history:[
        { date:'2026-03-04', what:'Route killed by Dana.', by:'s6', kind:'made' },
        { date:'2026-03-06', what:'Mir suggested parking the vein linework. Kept.', by:'s7', kind:'suggestion' },
        { date:'2026-04-08', what:'Recalled across a model switch as the bridge for the sampler.', by:'s17', kind:'check' },
        { date:'2026-04-15', what:'Approved as the sampler peel pattern. Closed.', by:'s18', kind:'made' } ] },
    { id:'d3', title:'Pattern route; one tile per SKU, shared 6-unit grid', scope:'Core range', made:'2026-03-18', status:'held',
      reason:'Shelf audit: nobody in the set uses a hard geometric pattern.', from:['s9','s10','s11'], history:[
        { date:'2026-03-18', what:'Made by Dana after Marguerite liked the tile idea.', by:'s10', kind:'made' },
        { date:'2026-04-24', what:'Print test: the 45° oolong tile moirés at 40mm.', by:'s20', kind:'issue' },
        { date:'2026-04-24', what:'Mir offered two fixes: rotate to 30°, or thicken the rule to 0.35pt. Neither confirmed.', by:'s21', kind:'offer' } ],
      open:[ { what:'Oolong tile at 40mm: 30° rotation or 0.35pt rule', state:'offered', by:'s21', since:'2026-04-24' } ] },
    { id:'d4', title:'Peel pattern approved for the sampler', scope:'Sampler', made:'2026-04-15', status:'held',
      reason:"Marguerite: 'Abundance, not flowers. Like a peel pattern, dense.'", from:['s17','s18','s19'], history:[
        { date:'2026-04-15', what:'Approved by Marguerite for the sampler sleeve.', by:'s18', kind:'made' },
        { date:'2026-05-01', what:'Marguerite asked whether it could go on the core range too.', by:'s22', kind:'question' },
        { date:'2026-05-01', what:'Mir suggested the extension is consistent with d1. Not approved.', by:'s25', kind:'suggestion' } ],
      open:[ { what:'Peel pattern on the core range', state:'asked', by:'s22', since:'2026-05-01', note:'Question from the client plus a suggestion from Mir. Nobody has approved it.' } ] },
    { id:'d5', title:'Typography: serif or not', scope:'Core range', made:null, raised:'2026-03-27', status:'open',
      reason:"Marguerite wants a serif. Dana doesn't. Unresolved.", from:['s12','s13'], history:[
        { date:'2026-03-27', what:'Raised by Dana: Marguerite wants a serif, Dana does not.', by:'s12', kind:'question' },
        { date:'2026-03-27', what:'Mir proposed a wide low-contrast serif at small size only, grotesk for SKU names. A proposal, not approved.', by:'s13', kind:'proposal' } ],
      open:[ { what:'Serif wordmark at small size, grotesk SKU names', state:'proposed', by:'s13', since:'2026-03-27' } ] }
  ];

  // Reference graph: which earlier strands each strand draws on. Drives Trace and Field weight.
  const REFS = { s2:['s1'], s4:['s3'], s5:['s4'], s6:['s4','s5'], s7:['s3','s6'], s9:['s8','s4'], s10:['s9'], s11:['s10','s2'],
    s13:['s12','s9'], s15:['s14','s5'], s16:['s14'], s17:['s14','s15','s7'], s18:['s17'], s19:['s18','s7'],
    s21:['s20','s11'], s23:['s22','s4'], s24:['s23','s4','s18'], s25:['s24','s5','s19'], s26:['s4'] };
  S.forEach(s => { s.refs = REFS[s.id] || []; });
  S.forEach(s => s.refs.forEach(r => { const t = S.find(x=>x.id===r); if (t) t.returns++; }));
  D.forEach(d => d.from.forEach(r => { const t = S.find(x=>x.id===r); if (t) t.returns++; }));
  // Decision states. held = made by a person. open = unresolved. closed = done.
  // Open items carry their own state: offered | asked | proposed. None of those is a decision.
  const STATE = { held:'Held', open:'Open', closed:'Closed', reopened:'Reopened' };
  const ITEM  = { offered:'Offered, not confirmed', asked:'Asked, not approved', proposed:'Proposed, not approved' };

  const byId = Object.fromEntries(S.map(s=>[s.id,s]));
  const weeks = Array.from(new Set(S.map(s=>s.week))).sort((a,b)=>a-b);
  const weekDates = {}; S.forEach(s => { if (!weekDates[s.week]) weekDates[s.week] = s.date; });

  const fmt = (iso) => { const d = new Date(iso+'T12:00:00'); return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); };

  return { models, strands:S, decisions:D, byId, weeks, weekDates, fmt, STATE, ITEM };
})();

/* The product-screen exchange. Four moves. Every move cites strands by id.
   Written as data so the screen renders it; the strikes/corrections mutate state at runtime. */
window.MG.exchange = {
  question: "Holiday tin. Marguerite says 'maybe something festive, even floral?' Where does that leave us on florals?",
  moves: [
    { kind:'scope', text:"The no-florals decision was made on 2 March and scoped to the core range. It came from Marguerite herself: florals on tea 'reads like a gift shop'. A holiday tin is a new scope, so it doesn't inherit the ban automatically.", cites:['s4','s5'], decision:'d1' },
    { kind:'reason', text:"The reason still matters more than the rule. Her objection was to a register (gift shop), not to plants. The sampler proved that: 'abundance, not flowers' got approved on 15 April as the peel pattern.", cites:['s18','s19'], decision:'d4' },
    { kind:'connection', text:"Connection worth testing: the parked leaf-vein linework from March became the sampler's peel pattern in April. For a winter tin, the same linework carries bare branches and seed heads without a single flower. Festive by density and colour, not by florals. It stays inside her reason and gives her the 'something more' she's asking for.", cites:['s7','s17','s19'], decision:'d2' },
    { kind:'decide', text:"This needs a fresh call, not an inherited one. Two options to put to her: (1) winter linework, no florals, consistent with every decision on file; (2) a floral exception, scoped to the holiday tin only, logged as its own decision with her name on it. I'd lead with 1. Either way d1 stays as made for the core range.", cites:['s5','s24','s25'], decision:null }
  ],
  // A pre-written wrong move, used if the viewer presses "show a wrong answer":
  wrong: { kind:'scope', text:"Florals are ruled out across the whole project since 2 March, so the holiday tin can't use them.", cites:['s4'], note:"Overreach. The decision was scoped to the core range (s5). A scope error, the same kind Dana struck on 1 May." }
};
