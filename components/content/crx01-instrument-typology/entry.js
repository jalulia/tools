/* CX1 · Instrument typology — CRX-01, written for this library.

   The counter-argument the set needed. Twenty-seven lenses reproduce
   something; this one draws. Zero raster, zero noise, dimensioned in
   millimetres — and the one thing it deliberately does NOT carry across from
   its source document is the pinned feTurbulence film, which the inventory
   grades a known failure. That refusal is in FAULTS, where a refusal belongs. */
Shell.registerEntry({
  id: 'crx01-instrument-typology',
  index: 'CX1',
  order: 165,
  title: 'Instrument typology',
  section: 'document-system',
  style: 'technical-doc',
  status: 'canonical',
  tags: ['Parametric', 'SVG', 'Drafting', 'No raster'],

  source: {
    kind: 'original',
    title: 'CRX-01 — Cross instrument typology',
    author: 'Julia Compton',
    date: '2026',
    note: 'Written for this library. The profile sampler radiusAt(), the outline ' +
          'builder, the patent shade-line convention and both pen tables are ported ' +
          'from her own Cross_Instrument_Typology_CRX-TYP-001_1.html ' +
          '(corpus/repos/cross, :420–600 and :729–815); the plate — masthead, two ' +
          'elevations to one scale, the broken detail, the section, the spec table ' +
          'and the legend — is composed here.'
  },

  frame: { designWidth: 1100, aspect: '1100/1666', previewHeight: 1666 },
  thumb: { file: 'thumb.png', crop: [1, 205] },

  text: `
    <p>A pen is thirteen numbers. Each barrel is declared as an array of
    segments in millimetres — <code>{t:'cone'|'arc'|'dome', x0, x1, r0, r1,
    bow}</code> — and one twenty-line sampler, <code>radiusAt(segs, x)</code>,
    turns that declaration into a silhouette, two elevations drawn to the same
    scale, an enlarged detail with drafting break-waves, a hatched section,
    dimension lines and numbered callouts. Drop a data object, get a plate.</p>

    <p>There is no <code>&lt;canvas&gt;</code> in this document. No noise, no
    grain, no screen, no paper, no light. That is not restraint for its own
    sake: it is the argument. Every other lens in the library is about
    <em>reproduction</em> — a field is screened, a second drum misses register,
    coverage fails as pinholes — and a library that only knows how to make
    things look printed has one idea, not a vocabulary. This plate is about
    <em>description</em>, and the only marks on it are the ones a drawing needs
    to be measured from.</p>

    <div class="note"><span class="lab">The one line worth reading</span>
      <p>The <code>arc</code> case picks <code>sin(u·π/2)</code> when the
      radius is growing and <code>1−cos(u·π/2)</code> when it is shrinking, so
      the curve always leaves the barrel <em>tangentially</em>. Without that
      ternary a nose meets its barrel at a visible corner and the whole pen
      reads as a stack of primitives. It is four characters of difference and
      it is the difference between a drawn object and a diagram of one.</p>
    </div>

    <p>The shading follows the same discipline. The longitudinal lines sit at
    <code>y = t·r(x)</code> for eight fixed values of <code>t</code>, crowded
    towards the lower silhouette and thinned to two ghost lines above the axis.
    <strong>Density is curvature, not shadow.</strong> There is one light in
    this library and it is not on this sheet — a patent plate is lit by a
    convention, and pretending otherwise would be the same mistake as a
    gradient standing in for a photograph.</p>`,

  reference: {
    title: 'CRX-TYP-001 — Cross instrument typology, sheet 01',
    cells: [
      { k: 'Declaration',
        v: 'A pen is an array of {t, x0, x1, r0, r1, bow} segments in millimetres, point to crown. → carried verbatim, both pen tables, both barrels.' },
      { k: 'Sampler',
        v: 'radiusAt(segs, x) resolves the declaration to a radius, with the arc case picking its easing by the direction of taper. → verbatim; it is the whole drawing.' },
      { k: 'Ends vs cuts',
        v: 'A true end face closes with a quadratic; a window into the body is left square and covered with a drafting break-wave. → both, and the outline builder is told which it is drawing.' },
      { k: 'Shading',
        v: 'Eight longitudinal lines at fixed fractions of the local radius, dense low, two ghosts high, a clear highlight band above the axis. → verbatim, including the r·S < 1.6 cutoff that stops them near the point.' },
      { k: 'Section',
        v: 'The same r(x) read at one station, drawn as two circles with a 45° hatch pattern. → added here; the source sheet has elevations and details but no section.' },
      { k: 'Substrate',
        v: 'A 22 px dot lattice under the drawing, and a pinned full-bleed feTurbulence film at 2.8% multiply over everything. → the lattice is kept, at a container-relative pitch. The film is not. See faults.' }
    ]
  },

  pass0: [
    { k: 'Substrate', v: 'near-white drafting stock #FCFCFA with a real 22 px dot lattice; no tooth, no fibre, no light' },
    { k: 'Process', v: 'none — nothing on this sheet is reproduced. Vector strokes at three declared weights: outline 0.9, shade 0.55, dimension 0.7' },
    { k: 'Type', v: 'JetBrains Mono for everything the machine reports, tabular figures throughout; Archivo for the one headline; Fraunces for the two sentences of prose and the reference column' },
    { k: 'Hardware', v: 'none. Numbered callouts with leaders and a dot at the touch point, gold dimension lines with tick terminators, long-short-short centre lines, break-waves, A–A section marks, a stroke-weight legend' },
    { k: 'Skeleton', v: 'masthead over a full rule; two elevations to one scale stacked with a hairline between; a two-up row of detail and section; a spec table; the legend; a footer rule.' }
  ],

  critique: {
    reads_as: 'A drafting sheet from a manufacturer, printed once and filed — not an illustration of pens.',
    coupling: 'One declaration drives everything: the silhouette, the shade-line amplitudes, where the break-waves cut, the section diameter and the dimension label are all reads of radiusAt(segs, x) at different stations. Change 5.9 to 6.4 in one segment and the elevation, the detail, the section circle and the printed Ø all move together — because none of them is drawn, and none of them is a number typed twice.',
    pass_order: 'fill → shade → dark trim → outline → bands and seams → centre line → callouts → dimension. The outline goes over the shading because a silhouette is an edge and the shading is a surface; put the shading last and the eight lines cross the profile and the pen stops being solid. The dimension line is last and lowest because it belongs to the sheet, not to the object.',
    operators: ['profile sampler', 'patent shade lines', 'break-wave', 'hatched section', 'dimension line', 'numbered callout'],
    why_it_survives: 'Remove the tangency rule from the arc case and the pen becomes a stack of primitives with corners; remove the shade lines and it becomes a silhouette; remove the dimension lines and it becomes an illustration. Nothing here can be deleted without the plate changing category.',
    faults: [
      'The source document lays a pinned full-bleed feTurbulence film over the whole page at 2.8% multiply. It is stripped, and not because of the byte cost: it is the same mark the inventory grades a known failure four times over (HOP-03), a texture with no cause that sits still while everything under it moves. A drawing sheet that is not reproduced has nothing to be grainy about.',
      'The clip is not drawn on either barrel. The source builds it edge-on as a separate path with its own foot and lift; carrying that across without carrying the third and fourth pens would have made the plate a study of one clip rather than a typology.',
      'Both barrels are drawn in elevation only. A typology wants a plan or an end view beside each one, and this sheet has room for neither at 1100.',
      'The scale statement reads 1 : 1.7, which is true of the plate at its design width and false of it in a contact-sheet card. A drawing that states a scale should state the scale it is shown at, and no lens in this library knows how large it is being displayed.'
    ]
  },

  ruling: {
    text: 'No raster anywhere on this sheet. If it needs grain to look finished it is not finished.',
    by: 'julia',
    date: '2026-08-29'
  },

  related: [
    { entry: 'c5-spec-sheet', relation: 'variant-of' },
    { entry: 'b5-brand-guide-grid', relation: 'technique-of' }
  ]
});
