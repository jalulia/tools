/* PL-93 · Cathode-ray receivers · 3 · 03 PORTABLE, 1984. The set as the sheet draws it: plates/_src/cathode-ray-receivers.html,
   section 3 (viewBox 900 × 600, cabinet at 215, 170). Every number is the sheet's, in its px, measured from its code; x and y
   are from the cabinet's top left, ['R', d] from its right edge, ['C', d] from its center, ['B', d] from its bottom.
   Read by _build/engines/crt.js. */
window.CRT_FIG = {
  no: '03', name: 'PORTABLE', year: 1984, section: 3, sheet: [900, 600], at: [215, 170],
  lede: '03 PORTABLE, 1984: a carry handle and twin tuner dials, in one line.',
  body: '03 PORTABLE, 1984, from the sheet Cathode-Ray Receivers (TD·2608, rev B): a carry handle over the top and a column of two tuner dials beside the tube, drawn front-on in one ink at two weights, with no fill.',
  cab: { w: 470, h: 330, r: 10 },
  prop: [1.36, 1.85],
  handle: { on: 1, inset: 118, top: 64, rad: 18, inner: { inset: 130, top: 52, rad: 8, op: 0.6 } },
  bezel: { l: 20, t: 18, r: 150, b: 18, rad: 8, op: 0.75 },
  screen: { l: 34, t: 31, r: 164, b: 31, bulge: 0.04, rad: 15 },
  feet: { inset: 30, w: 42 },
  fits: { value: 1, say: 'a column beside the tube', sets: [
    [ { k: 'knob', x: ['R', -70], y: 54, r: 16, a: -45 }, { k: 'knob', x: ['R', -70], y: 104, r: 16, a: 20 }, { k: 'knob', x: ['R', -70], y: 154, r: 16, a: -75 } ],
    [ { k: 'dial', x: ['R', -70], y: 66, r: 34 }, { k: 'dial', x: ['R', -70], y: 150, r: 26 } ],
    [ { k: 'button', x: ['R', -98], y: 42, w: 56, h: 14, r: 2 }, { k: 'button', x: ['R', -98], y: 72, w: 56, h: 14, r: 2 }, { k: 'button', x: ['R', -98], y: 102, w: 56, h: 14, r: 2 },
      { k: 'button', x: ['R', -98], y: 132, w: 56, h: 14, r: 2 }, { k: 'button', x: ['R', -98], y: 162, w: 56, h: 14, r: 2 } ]
  ] },
  grilles: { value: 0, mark: [['R', -70], 224], sets: [
    { k: 'slots', x: ['R', -108], y: 206, n: 5, len: 76, gap: 9 },
    { k: 'dots', x: ['R', -104], y: 207, cols: 9, rows: 5, gap: 8.5 },
    null
  ] },
  antenna: { value: 0, mark: ['R', -73], options: [{ label: 'None' }, { label: 'Whip', k: 'whip' }, { label: 'Rabbit ears', k: 'ears' }],
    whip: { x: ['R', -84], base: [22, 7, 3], v1: [81, -89], v2: [54, -52], solid: true },
    ears: { x: ['R', -62], ang: 24, l1: 96, l2: 60 } },
  notes: {
    corner: 'the sheet’s is 10 px on a 330 px cabinet (3%).',
    prop: 'Proportion: the tube and its mask take the change in width; the column of controls and the handle’s arms keep their places.',
    propLimit: 'Proportion stays where the tube runs between square and about 1.5 : 1 and the column keeps its width.',
    antenna: 'What stands on top, right of the handle: nothing (the sheet’s), a whip, or rabbit ears.',
    antennaLong: 'Antenna: None is the sheet’s; Whip is the CUBE’s telescopic mast with its phantom extension; Rabbit ears are two masts from a dome. Both stand at the right, clear of the handle.',
    fit: 'Two tuner Dials (the sheet’s), three Knobs, or five push Buttons.',
    fits: 'Control sets, in the column beside the tube. Dials: two tuner dials, the sheet’s. Knobs: three pointer knobs. Buttons: five push buttons in a stack, as on the POCKET.',
    grille: 'The speaker grille under the controls: Slots (the sheet’s), a Dots checkerboard, or None.'
  }
};
