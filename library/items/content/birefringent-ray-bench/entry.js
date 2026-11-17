/* A5 · Birefringent ray-bench — written for this library (Gardener, staged proposed).
   The reflexive counter to the reproduction lenses: like CRX-01 it draws rather
   than reproduces, but where CRX-01 measures an object this one draws the APPARATUS —
   the crossed-polariser bench under which interference colour exists at all. Zero
   raster, zero grain; the drafting language carries it.

   ck-e10 · extended into the plate template: body[], plate{svg,…}, spec{techniques[]},
   points[]. The two-key chromatic system carries in ink (solid vs dashed) per the
   spec note; the shell's no-hue chrome rule holds. Julia has reviewed the proof
   (E10 v5) — status stays `proposed` until she rules it canonical alongside the
   rest of the optics territory. */
Shell.registerEntry({
  entity: "exploration",
  governed_by: ["composing-computational-material-systems"],
  id: 'birefringent-ray-bench',
  index: 'A5',
  order: 166,
  title: 'Birefringent ray-bench',
  section: 'document-system',
  style: 'technical-doc',
  status: 'proposed',
  tags: ['Optics', 'Drafting', 'SVG', 'No raster', 'Polarization'],

  source: {
    kind: 'original',
    title: 'A5 — Birefringent ray-bench',
    date: '2026',
    note: 'Written for this library by the Gardener as the reflexive keystone of the ' +
          'proposed Optics territory (see the optics convening). A uniaxial crystal ' +
          'splits one polarised ray into an ordinary and an extraordinary ray; crossed ' +
          'polarizers recombine their components. Drawn in the technical-doc language — ' +
          'no raster or grain. Two-key ink encoding: solid for the ordinary path, ' +
          'dashed for the extraordinary. Selection changes weight and opacity rather ' +
          'than inventing colour where none exists inside the crystal.'
  },

  frame: { designWidth: 1100, aspect: '1100/705', previewHeight: 705 },
  thumb: { file: 'thumb.png', crop: [1.32, 0] },

  body: [
    'A uniaxial calcite crystal splits one polarised ray into an ordinary ray and an ' +
      'extraordinary ray; the crossed analyser recombines their components. The plate ' +
      'draws the CONDITIONS under which interference colour exists at all — the framing ' +
      'is the specimen. Drawn, not reproduced. A persistent two-key ink encoding ' +
      '(solid vs dashed) distinguishes the two phase paths without inventing colour ' +
      'where none exists inside the crystal.'
  ],

  plate: {
    fig:     '2.5',
    series:  'EXPLORATIONS · OPTICS',
    sheet:   5,
    of:      173,
    viewBox: '0 205 1040 315',
    svg:
      /* Optical axis */
      '<line class="axis" x1="30" y1="300" x2="1010" y2="300"/>' +
      /* SOURCE */
      '<g>' +
        '<circle class="glass" cx="72" cy="300" r="15"/>' +
        '<g class="hatch">' +
          '<line x1="72" y1="277" x2="72" y2="270"/><line x1="72" y1="330" x2="72" y2="323"/>' +
          '<line x1="49" y1="300" x2="42" y2="300"/>' +
          '<line x1="56" y1="284" x2="51" y2="279"/><line x1="88" y1="284" x2="93" y2="279"/>' +
          '<line x1="56" y1="316" x2="51" y2="321"/><line x1="88" y1="316" x2="93" y2="321"/>' +
        '</g>' +
        '<text class="t-mono" x="72" y="248" text-anchor="middle">SOURCE</text>' +
        '<text class="t-mono" x="72" y="262" text-anchor="middle">unpolarized</text>' +
      '</g>' +
      '<line class="ray-inline" x1="88" y1="300" x2="210" y2="300"/>' +
      /* POLARIZER P */
      '<g>' +
        '<rect class="glass-fill" x="210" y="238" width="13" height="124" rx="1.5"/>' +
        '<g class="hatch"><line x1="216.5" y1="246" x2="216.5" y2="354"/></g>' +
        '<text class="t-mono-k" x="216" y="228" text-anchor="middle">P</text>' +
        '<text class="t-mono" x="216" y="382" text-anchor="middle">POLARIZER</text>' +
        '<text class="t-mono" x="216" y="395" text-anchor="middle">axis ‖ 0°</text>' +
        '<g transform="translate(283,300)">' +
          '<line class="pol-e" x1="0" y1="-16" x2="0" y2="16"/>' +
          '<path class="pol-e" d="M -4 -12 L 0 -17 L 4 -12"/>' +
          '<path class="pol-e" d="M -4 12 L 0 17 L 4 12"/>' +
          '<text class="t-mono" x="0" y="34" text-anchor="middle">E</text>' +
        '</g>' +
      '</g>' +
      '<line class="ray-inline" x1="223" y1="300" x2="372" y2="300"/>' +
      /* CALCITE */
      '<g>' +
        '<path class="glass-fill" d="M 372 246 L 560 246 L 528 356 L 340 356 Z"/>' +
        '<line class="constr-d" x1="392" y1="345" x2="512" y2="258"/>' +
        '<text class="t-serif-i" x="516" y="256">c</text>' +
        '<text class="t-mono-k" x="450" y="234" text-anchor="middle">CALCITE</text>' +
        '<text class="t-mono" x="450" y="376" text-anchor="middle">uniaxial (−) · optic axis c</text>' +
      '</g>' +
      /* Rays — ordinary solid, extraordinary dashed */
      '<path class="ray-o" d="M 372 300 L 528 300 L 720 300"/>' +
      '<path class="ray-e" d="M 372 300 L 528 268 L 720 268"/>' +
      /* Polarization-state glyphs */
      '<g transform="translate(628,300)">' +
        '<circle class="pol-e" cx="0" cy="0" r="9"/><circle class="pol-dot" cx="0" cy="0" r="2.1"/>' +
        '<text class="t-mono ray-o-txt" x="0" y="26" text-anchor="middle">o · nₒ 1.658</text>' +
      '</g>' +
      '<g transform="translate(628,268)">' +
        '<line class="pol-e" x1="-11" y1="6" x2="11" y2="-6"/>' +
        '<path class="pol-e" d="M 6 -9 L 12 -7 L 9 -1"/>' +
        '<path class="pol-e" d="M -6 9 L -12 7 L -9 1"/>' +
        '<text class="t-mono ray-e-txt" x="0" y="-16" text-anchor="middle">e · nₑ 1.486</text>' +
      '</g>' +
      /* Walk-off marker */
      '<path class="walk-marker constr" d="M 562 300 A 30 30 0 0 0 560 290"/>' +
      '<text class="t-mono" x="566" y="284" text-anchor="middle">ρ ≈ 6.2°</text>' +
      /* ANALYZER A */
      '<g>' +
        '<rect class="glass-fill" x="720" y="238" width="13" height="124" rx="1.5"/>' +
        '<g class="hatch">' +
          '<line x1="724" y1="284" x2="729" y2="284"/>' +
          '<line x1="722" y1="300" x2="731" y2="300"/>' +
          '<line x1="724" y1="316" x2="729" y2="316"/>' +
        '</g>' +
        '<text class="t-mono-k" x="726" y="228" text-anchor="middle">A</text>' +
        '<text class="t-mono" x="726" y="382" text-anchor="middle">ANALYZER</text>' +
        '<text class="t-mono" x="726" y="395" text-anchor="middle">axis ⊥ P · 90°</text>' +
      '</g>' +
      /* Recombined output */
      '<line class="ray-out" x1="733" y1="284" x2="898" y2="284"/>' +
      /* IMAGE PLANE — ink stripe, no colour gradient (spec §palette calls for two-key
         encoding in ink; the reader learns the phase paths from solid/dashed above). */
      '<g>' +
        '<rect x="896" y="240" width="9" height="120" fill="currentColor" opacity=".55" style="color:var(--ink)"/>' +
        '<line class="glass" x1="900" y1="240" x2="900" y2="360"/>' +
        '<g class="constr">' +
          '<line x1="900" y1="240" x2="912" y2="228"/>' +
          '<line x1="900" y1="300" x2="912" y2="288"/>' +
          '<line x1="900" y1="360" x2="912" y2="348"/>' +
        '</g>' +
        '<text class="t-mono" x="900" y="382" text-anchor="middle">IMAGE PLANE</text>' +
        '<text class="t-mono-k" x="900" y="220" text-anchor="middle">Γ = d·Δn</text>' +
      '</g>' +
      /* dimension band d */
      '<g class="dim-group">' +
        '<line class="constr-d" x1="372" y1="356" x2="372" y2="430"/>' +
        '<line class="constr-d" x1="528" y1="356" x2="528" y2="430"/>' +
        '<line class="dim" x1="372" y1="422" x2="528" y2="422"/>' +
        '<path class="arrowfill" d="M 372 422 l 9 -3.4 v 6.8 z"/>' +
        '<path class="arrowfill" d="M 528 422 l -9 -3.4 v 6.8 z"/>' +
        '<text class="t-serif-i" x="450" y="416" text-anchor="middle">d</text>' +
        '<text class="t-mono" x="450" y="444" text-anchor="middle">retardation Γ = d (nₑ − nₒ)</text>' +
      '</g>' +
      /* Delta */
      '<g class="dim-group">' +
        '<line class="constr-d" x1="700" y1="300" x2="762" y2="300"/>' +
        '<line class="constr-d" x1="700" y1="268" x2="762" y2="268"/>' +
        '<line class="dim" x1="752" y1="300" x2="752" y2="268"/>' +
        '<path class="arrowfill" d="M 752 300 l -3.4 -9 h 6.8 z"/>' +
        '<path class="arrowfill" d="M 752 268 l -3.4 9 h 6.8 z"/>' +
        '<text class="t-serif-i" x="770" y="288">Δ</text>' +
        '<text class="t-mono" x="806" y="256">Δ exaggerated</text>' +
      '</g>' +
      /* Stage rule */
      '<line class="stage-rule constr" x1="30" y1="486" x2="1010" y2="486"/>' +
      '<g text-anchor="middle">' +
        '<text class="t-mono stage" x="72"  y="506">I · EMIT</text>' +
        '<text class="t-mono stage" x="216" y="506">II · POLARIZE</text>' +
        '<text class="t-mono stage" x="450" y="506">III · SPLIT</text>' +
        '<text class="t-mono stage" x="726" y="506">IV · CROSS</text>' +
        '<text class="t-mono stage" x="900" y="506">V · IMAGE</text>' +
      '</g>'
  },

  method: null,

  spec: {
    id: 'birefringent-ray-bench',
    palette: {
      encoding: 'two-key INK: solid for ordinary, dashed for extraordinary. The chromatic reference used in the plate-proof (cyan/magenta) is retired for the shell port; the dash carries the encoding without hue and survives print.'
    },
    ground: { colour: 'paper', tooth: 'none — technical-doc, no raster, no grain', area_ref: 1.00 },
    units: 'SVG viewBox units, 0 205 1040 315 (1 u ≈ 1 CSS pixel at native render)',
    techniques: [
      {
        id: 'hairline-construction', short: 'GRND', name: 'Hairline construction',
        layer: 'GRAPHIC COMPOSITION', pass: 1,
        params: {
          axis:                { colour: 'ink-4', width: 1, dash: '2 5', use: 'optical axis, no arrowheads' },
          construction_solid:  { colour: 'ink-4', width: 1, dash: 'none',  use: 'short connectors, image-plate ticks' },
          construction_dashed: { colour: 'ink-4', width: 1, dash: '3 3',   use: 'invisible geometry — optic axis c, dimension extensions' }
        },
        implementation: 'Every geometric relationship the picture needs but the object does not embody is drawn once as a hairline in the low-contrast neutral. The optical axis runs the full plate width at 1 pt and a 2-5 pitch dash so it disappears against the eye and reappears at the read head.',
        atoms: ['hairline', 'construction'],
        produces: ['drafting silence — geometry present but never louder than the object']
      },
      {
        id: 'glass-body', short: 'FORM', name: 'Optical glass body',
        layer: 'GRAPHIC COMPOSITION', pass: 2,
        params: {
          fill: 'bench-2',
          stroke: 'ink',
          stroke_width: 1.4,
          corner_radius: 1.5,
          polarizer_chamber: { rect: [210, 238, 13, 124], transmission_hatch: 'vertical line at midpoint x, from y+8 to y+8+108' },
          analyzer_chamber:  { rect: [720, 238, 13, 124], transmission_hatch: 'three horizontal ticks at y=284, 300, 316; x from ±5 of midpoint' },
          calcite_rhomb:     { path: 'M 372 246 L 560 246 L 528 356 L 340 356 Z', shear_deg: -16.3, shows_optic_axis: true },
          source_ring:       { cx: 72, cy: 300, r: 15, radiating_ticks: 6, tick_len: 7 }
        },
        implementation: 'Each apparatus chamber is a filled rectangle or shear rhomb in the neutral bench fill with a 1.4 pt ink stroke. The transmission axis of each polarizer is hatched inside the chamber — vertical for P, horizontal for A. Nothing else lives inside a chamber; every notation about a chamber sits outside it.',
        atoms: ['glass', 'filled-body', 'transmission-hatch'],
        produces: ['apparatus reads as physical', 'crossed-polariser identity is visible from the hatch pattern alone']
      },
      {
        id: 'phase-key-ray', short: 'MARK', name: 'Phase-key ray',
        layer: 'GRAPHIC COMPOSITION', pass: 3,
        params: {
          ordinary:      { colour: 'ink', width: 2.2, dash: 'none' },
          extraordinary: { colour: 'ink', width: 2.2, dash: '7 4' },
          recombined:    { colour: 'ink', width: 3,   dash: 'none' },
          image_plate:   { colour: 'ink', width: 9,   opacity: 0.55 },
          encoding_rule: 'DASH encodes phase path — solid for the ordinary ray, dashed for the extraordinary. Selection changes weight and opacity, never adds a colour. The two-key ink encoding survives print by construction.'
        },
        implementation: 'Two rays leave the crystal in a persistent two-key encoding: ink solid for the ordinary path, ink dashed for the extraordinary. Where the analyser recombines their components, the stroke thickens to 3 pt as a single ink line to the image plane. The plate is legible under any print or paper condition; no hue is asserted where none exists inside the crystal.',
        atoms: ['dash-encoding', 'weight-emphasis'],
        produces: ['two invisible phase paths become legible without inventing coloured beams']
      },
      {
        id: 'walk-off-geometry', short: 'TEX', name: 'Walk-off geometry',
        layer: 'STRUCTURE', pass: 3,
        params: {
          entry: [372, 300],
          inside_turn: [528, 268],
          exit: [720, 268],
          walk_off_angle_deg: 6.2,
          angle_marker: { arc_start: [562, 300], radius: 30, arc_end: [560, 290], label: 'ρ ≈ 6.2°', label_offset: [6, -16] },
          exaggeration_note: 'Δ (lateral displacement) is exaggerated for legibility; every plate that shows walk-off must annotate this beside the dimension arrow.'
        },
        implementation: 'The extraordinary ray enters the calcite at the same point as the ordinary but bends inside toward the optic axis, then leaves parallel to the entrance ray and displaced by Δ. The angle marker is a short arc at the exit; its numeric label sits above the arc. The diagram never lets the reader forget Δ is drawn larger than physical.',
        atoms: ['angle-marker', 'annotated-exaggeration'],
        produces: ['double refraction is diagrammatic and honest at once']
      },
      {
        id: 'dimension-band', short: 'FLD', name: 'Dimension band',
        layer: 'GRAPHIC COMPOSITION', pass: 4,
        params: {
          extension_line: { colour: 'ink-4', width: 1, dash: '3 3', length: 74 },
          dim_line:       { colour: 'ink-2', width: 1, dash: 'none' },
          arrowhead:      { fill: 'ink-2', size_x: 9, size_y: 6.8, style: 'filled triangle, pointing outward at each end' },
          label:          { font: 'serif italic', size: 15, colour: 'ink', pos: 'above the dim line at midpoint' },
          caption:        { font: 'mono', size: 10.5, colour: 'ink-4', pos: '22 below the dim line' }
        },
        implementation: 'Two dashed hairline extensions drop from the object being dimensioned. A solid dimension line runs between them with a filled triangle at each end. The dimension letter (italic serif, single character) sits at the middle above the line; the formula or note (mono, low contrast) sits below.',
        atoms: ['dashed-extension', 'dimension-arrow', 'serif-italic-letter'],
        produces: ['engineering dimension band — object measured without being covered']
      },
      {
        id: 'polarization-state-glyph', short: 'KEY', name: 'Polarization-state glyph',
        layer: 'GRAPHIC COMPOSITION', pass: 4,
        params: {
          vertical_linear:    { double_arrow_half_len: 16, head: '4x5', label: 'E' },
          out_of_page:        { circle_r: 9, circle_weight: 1.3, dot_r: 2.1 },
          in_principal_plane: { slanted_half_len: 12, dy_dx: -0.55, head: '6x3' },
          colour: 'ink',
          label_offset: 34
        },
        implementation: 'At each stage where the polarization state is knowable, a compact glyph names it — a vertical double-arrow after P, a dot-in-circle on the ordinary ray, a slanted double-arrow on the extraordinary. Each glyph carries a mono E label if the state is not obvious from context.',
        atoms: ['state-glyph', 'mono-e-label'],
        produces: ['every arrow on the plate is a testable claim about the field']
      },
      {
        id: 'stage-rule-legend', short: 'TYPE', name: 'Stage-rule legend',
        layer: 'GRAPHIC COMPOSITION', pass: 5,
        params: {
          rule: { colour: 'ink-4', width: 1, from_x: 30, to_x: 1010, y: 486 },
          labels: {
            font: 'mono', size: 10.5, colour: 'ink-3', y: 506, letter_spacing: '.14em', text_anchor: 'middle',
            stages: [
              { x: 72,  text: 'I · EMIT' },
              { x: 216, text: 'II · POLARIZE' },
              { x: 450, text: 'III · SPLIT' },
              { x: 726, text: 'IV · CROSS' },
              { x: 900, text: 'V · IMAGE' }
            ]
          }
        },
        implementation: 'A single hairline rule sits below the drawing; a mono stage label rides beneath each apparatus centre, roman numeral + name. Reading the rule top-down, the bench and the process become one row.',
        atoms: ['bottom-rule', 'roman-stage-label'],
        produces: ['picture reads as a process, not a still life']
      }
    ],
    pass_order: [
      'optical axis + construction hairlines',
      'chambers + calcite rhomb + source ring',
      'rays + walk-off geometry',
      'polarization state glyphs + dimension bands',
      'stage rule + labels'
    ],
    notes: [
      'All numbers measured in SVG viewBox units.',
      'The two-key encoding MUST survive print: solid vs dashed carries the phase-path distinction without hue.',
      'Δ is exaggerated for legibility; every plate that shows walk-off must annotate this.',
      'No raster, no grain. The apparatus is the subject and the drafting language is the substance.',
      'Chrome contract: the shell forbids hue; the E10 port therefore drops the cyan/magenta gradient rendering used in the plate-proof and encodes phase entirely through the dash.'
    ]
  },

  points: [
    { u: 0.029, v: 0.302, d: 'GRND', label: 'Optical axis · dashed hairline, 2-5 pitch construction', t: 'hairline-construction', dir: [ 1, -1] },
    { u: 0.069, v: 0.302, d: 'FORM', label: 'Source ring · glass body Ø 30, unpolarised radiating ticks', t: 'glass-body', dir: [-1, -1] },
    { u: 0.272, v: 0.270, d: 'KEY',  label: 'E-field after P · vertical double arrow, axis ‖ 0°', t: 'polarization-state-glyph', dir: [ 1, -1] },
    { u: 0.540, v: 0.270, d: 'TEX',  label: 'Walk-off angle ρ ≈ 6.2° · arc marker at crystal exit', t: 'walk-off-geometry', dir: [ 1, -1] },
    { u: 0.596, v: 0.200, d: 'MARK', label: 'Extraordinary path · dashed ink (7-4), nₑ 1.486', t: 'phase-key-ray', dir: [ 1, -1] },
    { u: 0.596, v: 0.302, d: 'MARK', label: 'Ordinary path · solid ink, nₒ 1.658', t: 'phase-key-ray', dir: [ 1,  1] },
    { u: 0.698, v: 0.302, d: 'FORM', label: 'Crossed analyser A · axis ⊥ P, horizontal transmission hatch', t: 'glass-body', dir: [-1,  1] },
    { u: 0.784, v: 0.251, d: 'MARK', label: 'Recombined image · 3 pt ink stroke to image plane', t: 'phase-key-ray', dir: [ 1, -1] },
    { u: 0.433, v: 0.689, d: 'FLD',  label: 'Crystal thickness d · dashed extension, arrow band, italic serif', t: 'dimension-band', dir: [-1,  1] },
    { u: 0.865, v: 0.956, d: 'TYPE', label: 'Stage rule · V · IMAGE mono beneath each apparatus centre', t: 'stage-rule-legend', dir: [-1, -1] }
  ],

  crossover: {
    also_uses: [
      { id: 'hairline-construction', in: ['crx01-instrument-typology'] },
      { id: 'dimension-band',        in: ['crx01-instrument-typology'] }
    ],
    shares_atom: [
      { atom: 'hairline',            count: 12 },
      { atom: 'dimension-arrow',     count: 4 },
      { atom: 'transmission-hatch',  count: 2 }
    ]
  },

  ruling: {
    text: 'Drawn, not reproduced. No raster on an optical-bench sheet; the apparatus is the subject, never the ornament.',
    by: 'proposed',
    date: '2026-09-01'
  },

  related: [
    { entry: 'crx01-instrument-typology', relation: 'variant-of' },
    { entry: 'c5-spec-sheet', relation: 'technique-of' }
  ]
});
