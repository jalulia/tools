/* A5 · Birefringent ray-bench — written for this library (Gardener, staged proposed).
   The reflexive counter to the reproduction lenses: like CRX-01 it draws rather
   than reproduces, but where CRX-01 measures an object this one draws the APPARATUS —
   the crossed-polariser bench under which interference colour exists at all. Zero
   raster, zero grain; the drafting language carries it. Proposed until Julia rules. */
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
          'no raster or grain. A persistent chromatic key distinguishes the two phase paths; ' +
          'selection changes weight and opacity rather than inventing a second colour system.'
  },

  frame: { designWidth: 1100, aspect: '1100/705', previewHeight: 705 },
  thumb: { file: 'thumb.png', crop: [1.32, 0] },

  text: `
    <p>An apparatus for seeing seeing. Source, polarizer, calcite, crossed analyzer,
    image plane — the bench that every polarised-light photomicrograph is taken through,
    drawn once at millimetre logic. The crystal splits the incoming ray into an
    <em>ordinary</em> ray (n<sub>o</sub>&nbsp;1.658, its field perpendicular to the
    principal plane) and an <em>extraordinary</em> ray (n<sub>e</sub>&nbsp;1.486, walked
    off by ρ), and the two carry a retardation Γ&nbsp;=&nbsp;d·Δn to the analyzer.</p>

    <p>The argument is the same one CRX-01 makes and the opposite subject. Every other
    lens in the archive imposes a reproduction — a field is screened, a drum misses
    register — and makes matter <em>appear</em> a way. Here the framing <em>is</em> the
    specimen: the interference colour of the crossed-polariser plate exists only between
    crossed polarizers. The image is in the crossing, not the crystal. Cyan and magenta
    encode the ordinary and extraordinary phase paths diagrammatically — they are not
    coloured beams inside the crystal. Trace one ray or both; selection changes weight
    while the recombined spectrum remains tied to the image plane.</p>`,

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
