/* PL-94 · Cathode-ray receivers · 5 · 05 CUBE, 1986. The set as the sheet draws it: plates/_src/cathode-ray-receivers.html,
   section 5 (viewBox 900 × 600, cabinet at 280, 170). Every number is the sheet's, in its px, measured from its code; x and y
   are from the cabinet's top left, ['R', d] from its right edge, ['C', d] from its center, ['B', d] from its bottom.
   Read by _build/engines/crt.js. */
window.CRT_FIG = {
  no: '05', name: 'CUBE', year: 1986, section: 5, sheet: [900, 600], at: [280, 170],
  lede: '05 CUBE, 1986: a kitchen set with a big tuner and a whip, in one line.',
  body: '05 CUBE, 1986, from the sheet Cathode-Ray Receivers (TD·2608, rev B): a kitchen set with a big tuner dial, two knobs and a telescopic antenna, drawn front-on in one ink at two weights, with no fill.',
  cab: { w: 340, h: 330, r: 14 },
  prop: [0.95, 1.3],
  handle: { on: 0, inset: 100, top: 58, rad: 18, inner: { inset: 112, top: 46, rad: 8, op: 0.6 } },
  bezel: { l: 18, t: 18, r: 100, b: 18, rad: 10, op: 0.75 },
  screen: { l: 31, t: 31, r: 113, b: 31, bulge: 0.045, rad: 14 },
  feet: { inset: 24, w: 40 },
  fits: { value: 1, say: 'a column beside the tube', sets: [
    [ { k: 'knob', x: ['R', -52], y: 62, r: 12, a: -45 }, { k: 'knob', x: ['R', -52], y: 110, r: 12, a: 20 }, { k: 'knob', x: ['R', -52], y: 158, r: 12, a: -75 } ],
    [ { k: 'dial', x: ['R', -52], y: 72, r: 32 }, { k: 'knob', x: ['R', -52], y: 140, r: 10, a: -45 }, { k: 'knob', x: ['R', -52], y: 176, r: 10, a: 20 } ],
    [ { k: 'button', x: ['R', -72], y: 50, w: 40, h: 12, r: 2 }, { k: 'button', x: ['R', -72], y: 76, w: 40, h: 12, r: 2 }, { k: 'button', x: ['R', -72], y: 102, w: 40, h: 12, r: 2 },
      { k: 'button', x: ['R', -72], y: 128, w: 40, h: 12, r: 2 }, { k: 'button', x: ['R', -72], y: 154, w: 40, h: 12, r: 2 } ]
  ] },
  grilles: { value: 0, mark: [['R', -52], 230], sets: [
    { k: 'slots', x: ['R', -82], y: 216, n: 4, len: 60, gap: 9.5 },
    { k: 'dots', x: ['R', -77.5], y: 218, cols: 7, rows: 4, gap: 8.5 },
    null
  ] },
  antenna: { value: 1, mark: ['R', -73], options: [{ label: 'None' }, { label: 'Whip', k: 'whip' }, { label: 'Rabbit ears', k: 'ears' }],
    whip: { x: ['R', -84], base: [22, 7, 3], v1: [81, -89], v2: [54, -52], solid: true },
    ears: { x: ['R', -60], ang: 24, l1: 96, l2: 60 } },
  notes: {
    corner: 'the sheet’s is 14 px on a 330 px cabinet (4.2%).',
    prop: 'Proportion: the tube and its mask take the change in width; the column of controls keeps its width at the right.',
    propLimit: 'Proportion stays where the set still reads as a cube: the tube runs between a tall 0.6 : 1 and about square, and the column keeps its width.',
    antenna: 'What stands on top: nothing, the sheet’s telescopic whip, or rabbit ears.',
    antennaLong: 'Antenna: Whip is the sheet’s, a telescopic mast solid where it leaves the set with a phantom extension above; Rabbit ears are two masts from a dome; None leaves the top bare.',
    fit: 'A tuner Dial over two knobs (the sheet’s), three Knobs, or five push Buttons.',
    fits: 'Control sets, in the column beside the tube. Dials: a big tuner dial over two knobs, the sheet’s. Knobs: three pointer knobs. Buttons: five push buttons, as on the POCKET.',
    grille: 'The speaker grille under the controls: Slots (the sheet’s), a Dots checkerboard, or None.'
  }
};
