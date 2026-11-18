/* PL-92 · Cathode-ray receivers · 1 · 01 PROFEEL, 1980. The set as the sheet draws it: plates/_src/cathode-ray-receivers.html,
   section 1 (viewBox 900 × 560, cabinet at 235, 70). Every number is the sheet's, in its px, measured from its code; x and y
   are from the cabinet's top left, ['R', d] from its right edge, ['C', d] from its center, ['B', d] from its bottom.
   Read by _build/engines/crt.js. */
window.CRT_FIG = {
  no: '01', name: 'PROFEEL', year: 1980, section: 1, sheet: [900, 560], at: [235, 70],
  lede: '01 PROFEEL, 1980: a cube set with carrying rails, in one ruled line.',
  body: '01 PROFEEL, 1980, from the sheet Cathode-Ray Receivers (TD·2608, rev B): a cube set with a carrying rail on each side and a strip of knobs under the tube, drawn front-on in one ink at two weights, with no fill.',
  cab: { w: 430, h: 370, r: 7 },
  prop: [0.95, 1.5],
  rails: { on: 1, gap: 5, w: 8, inset: 9, r: 4, rule: 13, ruleOp: 0.45 },
  bezel: { l: 18, t: 16, r: 18, b: 80, rad: 6, op: 0.75 },
  screen: { l: 34, t: 30, r: 34, b: 94, bulge: 0.03, rad: 16 },
  divider: { y: 62, inset: 18, op: 0.5 },
  feet: { inset: 34, w: 44 },
  fits: { value: 0, say: 'a strip under the tube', sets: [
    [ { k: 'button', x: ['R', -242], y: ['B', -46], w: 17, h: 9, r: 1.5 }, { k: 'button', x: ['R', -212], y: ['B', -46], w: 17, h: 9, r: 1.5 },
      { k: 'knob', x: ['R', -134], y: ['B', -41], r: 7, a: -30 }, { k: 'knob', x: ['R', -101], y: ['B', -41], r: 7, a: -65 }, { k: 'knob', x: ['R', -68], y: ['B', -41], r: 7, a: -100 } ],
    [ { k: 'button', x: ['R', -242], y: ['B', -38.5], w: 17, h: 9, r: 1.5 }, { k: 'button', x: ['R', -212], y: ['B', -38.5], w: 17, h: 9, r: 1.5 },
      { k: 'dial', x: ['R', -128], y: ['B', -34], r: 20 }, { k: 'dial', x: ['R', -78], y: ['B', -34], r: 20 } ],
    [ { k: 'button', x: ['R', -288], y: ['B', -46.5], w: 14, h: 11, r: 1.5 }, { k: 'button', x: ['R', -266], y: ['B', -46.5], w: 14, h: 11, r: 1.5 }, { k: 'button', x: ['R', -244], y: ['B', -46.5], w: 14, h: 11, r: 1.5 },
      { k: 'button', x: ['R', -222], y: ['B', -46.5], w: 14, h: 11, r: 1.5 }, { k: 'button', x: ['R', -200], y: ['B', -46.5], w: 14, h: 11, r: 1.5 }, { k: 'button', x: ['R', -178], y: ['B', -46.5], w: 14, h: 11, r: 1.5 },
      { k: 'tally', x: ['R', -72], y: ['B', -41] }, { k: 'power', x: ['R', -56], y: ['B', -47.5] } ]
  ] },
  grilles: { value: 2, mark: [90, ['B', -36]], sets: [
    { k: 'slots', vert: true, x: 40, y: ['B', -54], n: 16, len: 36, gap: 7.5, fill: true, clear: 28 },
    { k: 'dots', x: 40, y: ['B', -49], cols: 14, rows: 4, gap: 8.5, fill: true, clear: 28 },
    null
  ] },
  antenna: { value: 0, mark: ['C', 0], options: [{ label: 'None' }, { label: 'Whip', k: 'whip' }, { label: 'Rabbit ears', k: 'ears' }],
    whip: { x: ['R', -84], base: [22, 7, 3], v1: [88, -70], v2: [58, -44], solid: true },
    ears: { x: ['C', 0], ang: 26, l1: 84, l2: 52 } },
  notes: {
    corner: 'the sheet’s is 7 px on a 370 px cabinet (1.9%).',
    prop: 'Proportion: the tube and its mask take the change in width; the strip of controls keeps its place at the right.',
    propLimit: 'Proportion stays where the tube runs between about 1.1 : 1 and 2 : 1 and the strip keeps room for its controls.',
    antenna: 'What stands on top: nothing (the sheet’s), a telescopic whip, or rabbit ears.',
    antennaLong: 'Antenna: None is the sheet’s; Whip is a telescopic mast after the CUBE’s, solid where it leaves the set with a phantom extension above, laid lower here; Rabbit ears are two masts from a dome at the center of the top.',
    fit: 'Knobs and two buttons (the sheet’s), two tuner Dials, or the PVM’s row of Buttons.',
    fits: 'Control sets, in the strip under the tube. Knobs: three pointer knobs and two push buttons, the sheet’s. Dials: two small tuner dials beside the push buttons. Buttons: six push buttons, a tally lamp and a power switch, the PVM’s strip.',
    grille: 'The speaker grille left of the controls: upright Slots, a Dots checkerboard, or None (the sheet’s).'
  }
};
