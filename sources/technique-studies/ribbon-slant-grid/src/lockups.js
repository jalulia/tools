/* lockups.js · three ways the ribbon lands on the mindgut wordmark without being bent into letters.
   Every frame is the Mindgut hand (the helix registered to the wordmark's 13 stems). The type is the real wordmark,
   set as a flat plane at z = 0 inside the coil, so the ribbon passes behind it and in front of it. */
"use strict";
const LOCK = (() => {
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const outC = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3), outQ = t => 1 - Math.pow(1 - clamp(t, 0, 1), 4);
  const STEMS = HANDS.MG.map(s => s.x);
  function base(phase, cam) {
    const F = HANDS.frame('mindgut', 'mindgut', 1, phase, cam), L = HANDS.layout(HANDS.byId('mindgut'));
    F.markView = { k: L.k, ox: L.ox, oy: L.oy }; F.stems = STEMS; F.cam.shift = L.ox + 499 * L.k - G.AX.cx; F.cam.zoom = (F.cam.zoom || 1) * 1.04; return F;
  }

  /* 01 · Wrap: the word appears inside the coil; the camera swings to show the ribbon behind and in front of the letters,
     then comes back to the front as the turn lands on the stems. The lockup keeps the ribbon. */
  function wrap(t) {
    const sw = ss(.12, .42, t), back = ss(.68, .9, t);
    const cam = { az: lerp(0, 30, sw) * (1 - back), el: lerp(0, -14, sw) * (1 - back), persp: lerp(.15, .5, sw) * (1 - back) + .15 * back, zoom: 1 };
    const F = base(2 * outC(t / .9), cam);
    F.planeA = ss(.14, .36, t); F.sphA = 1 - ss(.1, .3, t); F.gridA = lerp(.35, .12, ss(.1, .5, t));
    F.lock = { name: 'wrap', turn: 2 * outC(t / .9), reveal: 'whole word', wordmark: F.planeA, ribbon: 1 }; return F;
  }
  /* 02 · Strike: the coil keeps turning like a typewriter ribbon while a strike line moves left to right; the wordmark
     is printed behind the line, letter by letter. Then the ribbon lifts off and the word stays. */
  function strike(t) {
    const F = base(t * 3.2, { az: 0, el: 0, persp: .15, zoom: 1 });
    F.planeA = 1; F.rev = 1; F.head = lerp(-30, 1010, ss(.1, .74, t)); F.sphA = 1 - ss(.05, .2, t); F.gridA = .25;
    const lift = ss(.78, .92, t); F.ribA = 1 - lift; F.markA = ss(.9, .97, t);
    F.lock = { name: 'strike', turn: t * 3.2, reveal: `printed to x ${Math.round(F.head)}`, wordmark: 1, ribbon: F.ribA }; return F;
  }
  /* 03 · Settle: a fast spin slows to land exactly on a whole turn; the stems print under the ribbon's front faces, the
     rest of each letter grows out from its stems, and the ribbon lets go. */
  function settle(t) {
    const turn = 3 * outQ(t / .55), F = base(turn, { az: 0, el: 0, persp: .15, zoom: 1 });
    F.planeA = ss(.5, .56, t); F.rev = 2; F.rad = lerp(0, 22.5, ss(.5, .6, t)) + lerp(0, 120, ss(.62, .84, t));
    F.sphA = 1 - ss(.5, .62, t); F.gridA = .25; F.ribA = 1 - ss(.7, .88, t); F.markA = ss(.88, .95, t);
    F.lock = { name: 'settle', turn, reveal: `${Math.round(F.rad)} units from the stems`, wordmark: F.planeA, ribbon: F.ribA }; return F;
  }
  const LOCKUPS = [
    { id: 'wrap', no: '01', name: 'Wrap', dur: 9, f: wrap, keys: [0, .25, .45, .6, .8, 1], line: 'The word sits inside the coil. The camera swings out to show the ribbon passing behind the letters and in front of them, then comes back as the turn lands on the stems. The lockup keeps the ribbon.' },
    { id: 'strike', no: '02', name: 'Strike', dur: 8, f: strike, keys: [0, .2, .36, .52, .7, 1], line: 'The coil turns like a typewriter ribbon while a strike line crosses left to right, printing the wordmark behind it. Then the ribbon lifts off and the word stays.' },
    { id: 'settle', no: '03', name: 'Settle', dur: 7, f: settle, keys: [0, .3, .56, .66, .78, 1], line: 'A fast spin slows to land exactly on a whole turn. The stems print under the ribbon’s front faces, each letter grows out from its stems, and the ribbon lets go.' }
  ];
  return { LOCKUPS, byId: id => LOCKUPS.find(l => l.id === id), STEMS };
})();
