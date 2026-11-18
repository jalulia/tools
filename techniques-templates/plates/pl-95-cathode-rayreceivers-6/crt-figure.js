/* PL-95 · Cathode-ray receivers · 6 · 06 POCKET, 1989. The set as the sheet draws it: plates/_src/cathode-ray-receivers.html,
   section 6 (viewBox 900 × 420, cabinet at 285, 110). Every number is the sheet's, in its px, measured from its code; x and y
   are from the cabinet's top left, ['R', d] from its right edge, ['C', d] from its center, ['B', d] from its bottom.
   Read by _build/engines/crt.js. */
window.CRT_FIG = {
  no: '06', name: 'POCKET', year: 1989, section: 6, sheet: [900, 420], at: [285, 110],
  lede: '06 POCKET, 1989: a flat landscape set with push buttons, in one line.',
  body: '06 POCKET, 1989, from the sheet Cathode-Ray Receivers (TD·2608, rev B): a flat landscape set with no mask, three push buttons over a dot grille and its antenna stowed along the top, drawn front-on in one ink at two weights, with no fill.',
  cab: { w: 330, h: 200, r: 13 },
  prop: [1.35, 2.1],
  bezel: null,
  screen: { l: 22, t: 20, r: 94, b: 20, bulge: 0.05, rad: 12 },
  feet: null,
  fits: { value: 2, say: 'a column beside the tube', sets: [
    [ { k: 'knob', x: ['R', -50], y: 32, r: 9, a: -45 }, { k: 'knob', x: ['R', -50], y: 58, r: 9, a: 20 }, { k: 'knob', x: ['R', -50], y: 84, r: 9, a: -75 } ],
    [ { k: 'dial', x: ['R', -50], y: 58, r: 28 } ],
    [ { k: 'button', x: ['R', -70], y: 26, w: 40, h: 12, r: 2 }, { k: 'button', x: ['R', -70], y: 52, w: 40, h: 12, r: 2 }, { k: 'button', x: ['R', -70], y: 78, w: 40, h: 12, r: 2 } ]
  ] },
  grilles: { value: 1, mark: [['R', -47], 141], sets: [
    { k: 'slots', x: ['R', -70], y: 126, n: 4, len: 40, gap: 9 },
    { k: 'dots', x: ['R', -64], y: 124, cols: 5, rows: 5, gap: 8.5 },
    null
  ] },
  antenna: { value: 1, mark: [45, -6], options: [{ label: 'None' }, { label: 'Stowed', k: 'stowed' }, { label: 'Whip', k: 'whip' }],
    stowed: { x0: 26, x1: 64, y: -6, op: 0.6 },
    whip: { x: ['L', 22], from: 'L', base: [22, 7, 3], v1: [-62, -42], v2: [-42, -28], solid: true } },
  notes: {
    corner: 'the sheet’s is 13 px on a 200 px cabinet (6.5%).',
    prop: 'Proportion: the tube takes the change in width; the column of controls keeps its width at the right.',
    propLimit: 'Proportion stays where the tube runs between square and about 1.9 : 1 and the column keeps its width.',
    antenna: 'The telescopic rod: none, stowed along the top (the sheet’s), or raised as a whip.',
    antennaLong: 'Antenna: Stowed is the sheet’s, the rod lying along the top; Whip raises it, a solid mast and a phantom extension leaning out to the left; None leaves the top bare.',
    fit: 'Three Knobs, one tuner Dial, or three push Buttons (the sheet’s).',
    fits: 'Control sets, in the column beside the tube. Buttons: three push buttons, the sheet’s. Knobs: three pointer knobs at the same pitch. Dials: one tuner dial.',
    grille: 'The speaker grille under the controls: a Dots checkerboard (the sheet’s), Slots, or None.'
  }
};
