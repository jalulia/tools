/* ============================================================================
   Catalogue-mode stub manifest.

   A fixture. It exercises every catalogue surface: the contact sheet with
   authored crops and live frames mounted on approach, the entry view at 1:1
   with the fit toggle, the six-section vocabulary, six styles and their
   declaration pages, and the REFERENCE STUDY / PASS 0 / FAULTS / ruling
   furniture — including a lens that declares reference: null so the missing
   decomposition is visible rather than blank.
   ============================================================================ */
Shell.registerManifest({
  schemaVersion: 1,
  id: 'catalogue-stub',
  title: 'Components',
  subtitle: 'design-system library',
  mode: 'catalogue',
  stage: { adapter: 'fragment', aspect: '1100/900', isolation: 'iframe' },
  siblings: [
    { id: 'course-stub',    title: 'Shaders',    href: '../course/' },
    { id: 'catalogue-stub', title: 'Components', href: '../catalogue/' }
  ],
  vocabulary: {
    status: {
      canonical: 'Work that is presented as correct and finished.',
      exploration: 'Kept because it asks a question, not because it answers one.',
      historical: 'Superseded, kept for the record.',
      'known-failure': 'Shown because it fails, and the failure is the lesson.'
    }
  },
  sections: [
    { id: 'print-reproduction', title: 'Print & reproduction', order: 1 },
    { id: 'type-specimen',      title: 'Type & specimen',      order: 2 },
    { id: 'document-system',    title: 'Document & system',    order: 3 },
    { id: 'motion-kinetic',     title: 'Motion & kinetic',     order: 4 },
    { id: 'layout-systems',     title: 'Layout systems',       order: 5 },
    { id: 'in-situ',            title: 'In situ',              order: 6 }
  ],
  styles: [
    { id: 'riso-xerox', title: 'Riso / Xerox',
      summary: 'Two-ink duplicator reproduction. One toner field punches every ink; misregistration is a press fact, not a filter.',
      palette: ['#e8531f', '#1f3fd6', '#141210', '#e7e3d9'],
      type: { display: 'Anton', text: 'Charter', mono: 'DejaVu Sans Mono' },
      texture: ['halftone-dot', 'toner-starve', 'misregistration', 'paper-tooth'],
      engines: ['_engines/halftone.js', '_engines/paper.js'],
      rules: [
        'Photographs are generated greyscale scenes reproduced through the screen — never a gradient.',
        'The hand layer (marker, arrows) sits OUTSIDE the press filters.',
        'Misregistration is a consequence of two drums, never a drawn stroke.'
      ] },
    { id: 'display-specimen', title: 'Display specimen',
      summary: 'One family, several optical sizes, nothing else on the sheet.',
      palette: ['#141210', '#7a7268', '#f4f1ea'],
      type: { display: 'Playfair Display', text: 'Charter', mono: 'DejaVu Sans Mono' },
      texture: ['none'],
      rules: ['No second family. A contrast of size is not a contrast of voice.'] },
    { id: 'document-system', title: 'Document & system',
      summary: 'A document that looks like the machine that made it.',
      palette: ['#141210', '#5a5a5a', '#ffffff'],
      type: { display: 'DejaVu Sans Mono', text: 'Charter', mono: 'DejaVu Sans Mono' },
      texture: ['hatch'],
      rules: ['The only non-text mark is a legend. Ornament is not allowed on a spec sheet.'] },
    { id: 'motion-kinetic', title: 'Motion & kinetic',
      summary: 'Repetition until a phrase becomes a texture. One loop length for the whole plate.',
      palette: ['#f0b400', '#141210', '#f2f0ea'],
      type: { display: 'Archivo Black', text: 'Charter', mono: 'DejaVu Sans Mono' },
      texture: ['marquee'],
      rules: ['Content speed is the specimen’s own. The chrome never cross-fades or scales it.'] },
    { id: 'layout-systems', title: 'Layout systems',
      summary: 'Grids, and the arguments against them.',
      palette: ['#1f3fd6', '#e8531f', '#e7e3d9'],
      type: { display: 'Archivo', text: 'Charter', mono: 'DejaVu Sans Mono' },
      texture: ['none'] },
    { id: 'instrument-drawing', title: 'Instrument drawing',
      summary: 'Zero raster, zero noise, dimensioned in millimetres.',
      palette: ['#141210', '#faf8f3'],
      type: { display: 'DejaVu Sans Mono', text: 'Charter', mono: 'DejaVu Sans Mono' },
      texture: ['none'],
      rules: ['Line weight carries the hierarchy. There is no fill anywhere on the plate.'] }
  ],
  entries: [
    'b1-photocopy-collage',
    'b2-riso-brush',
    'c1-heavy-ink',
    'e1-editorial-stack',
    'c5-brutalist-spec',
    'c3-kinetic-type',
    'e3-bento-grid',
    'crx-01-typology'
  ]
});
