/* ============================================================================
   encyclopedia/manifest.js — one archive, five entity kinds.

   Ships with entries[] empty. ck-e1 folds the Book-of-Shaders chapters,
   worked examples and Components lenses under this manifest, each declared
   with an `entity` kind — technique, atom, style, exploration, coupling —
   and the relations that carry the ladder (uses, instance_of, produces,
   shared-cause, sound-behind, ancestor-of, variant-of, overuses).

   Everything below the styles[] block is empty on purpose: the shell renders
   the technique index as the front door, and the front door of an archive
   with no entries is a page that says so. Adding one entity is a folder drop
   plus one line here, and scripts/build-site.mjs verifyManifests fails the
   deploy on a schema violation, an unresolvable relation, a missing skill or
   any count that does not derive from entries.
   ============================================================================ */
Shell.registerManifest({
  schemaVersion: 1,
  id: 'encyclopedia',
  title: 'Encyclopedia',
  subtitle: 'techniques, atoms, styles, explorations, couplings',
  mode: 'catalogue',
  stage: { adapter: 'fragment', aspect: '1100/900', isolation: 'iframe' },

  siblings: [
    { id: 'encyclopedia',    title: 'Encyclopedia', href: './' },
    { id: 'book-of-shaders', title: 'Shaders',      href: '../book-of-shaders/' },
    { id: 'components',      title: 'Components',   href: '../components/' }
  ],

  vocabulary: {
    status: {
      canonical: 'Work that is presented as correct and finished.',
      exploration: 'Kept because it asks a question, not because it answers one.',
      historical: 'Superseded, kept for the record.',
      'known-failure': 'Shown because it fails, and the failure is the lesson.',
      unsorted: 'Imported from the inventory. No editorial ruling yet.'
    }
  },

  /* Sections here are not the front-door — the front door is #/techniques —
     they exist so an entity that DOES have a section (a chapter, a lens) still
     has a place to sit in the rail. Techniques, atoms and styles get their
     own indexes at their own routes. */
  sections: [
    { id: 'techniques',        title: 'Techniques',        order: 1,
      note: 'A verb with a lesson. Every technique lists its instances.' },
    { id: 'atoms',             title: 'Atoms',             order: 2,
      note: 'A noun with parameters. Substrate, process, texture, colour, type, engine, field, mark, voice, space, bus.' },
    { id: 'styles',            title: 'Styles',            order: 3,
      note: 'A bounded house — palette, three type roles, texture vocabulary, engines, rules.' },
    { id: 'sound',             title: 'Sound',             order: 4,
      note: 'A lane of the same practice. Six pieces doing compound causality before anyone asked.' },
    { id: 'getting-started',   title: 'Getting started',   order: 10,
      note: 'What a fragment shader is, and the four values it is given.' },
    { id: 'algorithmic-drawing', title: 'Algorithmic drawing', order: 11 },
    { id: 'generative',        title: 'Generative designs', order: 12 },
    { id: 'image-processing',  title: 'Image processing',  order: 13 },
    { id: 'beyond',            title: 'Beyond the book',   order: 14 },
    { id: 'worked-examples',   title: 'Worked examples',   order: 15 },
    { id: 'print-reproduction', title: 'Print & reproduction', order: 20 },
    { id: 'type-specimen',     title: 'Type & specimen',   order: 21 },
    { id: 'document-system',   title: 'Document & system', order: 22 },
    { id: 'motion-kinetic',    title: 'Motion & kinetic',  order: 23 },
    { id: 'layout-systems',    title: 'Layout systems',    order: 24 },
    { id: 'in-situ',           title: 'In situ',           order: 25 },
    { id: 'unfiled',           title: 'Unfiled',           order: 99,
      note: 'Imported without a ruling. A visible gap.' }
  ],

  /* Six styles, verbatim from components/manifest.js. Their entries[] lists
     are re-pointed at the new ids at ck-e1 (KL1 folds into W1). */
  styles: [
    { id: "riso-xerox", title: "Riso / Xerox",
      summary: "Duplicator and copier reproduction. A field is screened, a second drum misses register, and coverage fails as pinholes. The failures are press facts, never filters.",
      palette: ["#e8531f", "#4a54cf", "#141210", "#e4e0d6", "#c2452c"],
      type: { display: "Anton", text: "EB Garamond", mono: "JetBrains Mono", script: "Caveat" },
      texture: ["dot-screen", "toner-starve", "misregistration", "paper-tooth", "edge-burn", "feed-jitter"],
      engines: ["_engines/raster.js", "_engines/rng.js", "_engines/field.js", "_engines/halftone.js", "_engines/paper.js", "_engines/scene.js"],
      rules: [
        "A photograph is a generated greyscale SCENE that is then reproduced. Never a gradient standing in for one.",
        "Misregistration is the consequence of a second drum — its own seed, its own offset, its own twist. Never a drawn stroke or a copied layer.",
        "Coverage failure (pinholes, edge burn) belongs to the ink, so it happens where there is enough ink to fail. Small type does not starve.",
        "The hand layer — marker, fineliner, pen — is applied AFTER printing and therefore takes the light but not the ink.",
        "Vinyl is not paper: a kiss-cut sticker gets a white lip, a sheen and a contact shadow, and no print filter at all."
      ] },
    { id: "display-specimen", title: "Display specimen",
      summary: "One family, shown at the sizes it was drawn for. The plate exists to let the letterforms be judged, so anything that is not the type has to justify itself.",
      palette: ["#141210", "#ef5322", "#f4c20d", "#2aa355", "#f2f2f3"],
      type: { display: "Anton", text: "Archivo", mono: "JetBrains Mono", script: "Caveat" },
      texture: ["ink-chain", "overflow-crop", "kiss-cut vinyl", "none"],
      engines: ["_engines/raster.js", "_engines/rng.js", "_engines/field.js", "_engines/halftone.js", "_engines/paper.js", "_engines/scene.js"],
      rules: [
        "No second family as a contrast device. A contrast of size is not a contrast of voice.",
        "Ink-chain amplitude follows type size: a display word may starve, an eight-point label may not.",
        "A crop is a real crop — overflow, not a letter drawn short.",
        "A screen piece gets no grain. Grain on a screen fakes a print that never happened."
      ] },
    { id: "editorial-serif", title: "Editorial serif",
      summary: "A serif set at optical size, hairlines that are exact, and paper that is present but silent. Archival print: the press does not fail here.",
      palette: ["#0b0b0c", "#ede8df", "#6b1f1f", "#d6d1c7", "#141414"],
      type: { display: "Fraunces", text: "EB Garamond", mono: "JetBrains Mono", script: "Caveat" },
      texture: ["paper-tooth", "stage-falloff", "contact-shadow", "hairline"],
      engines: ["_engines/raster.js", "_engines/rng.js", "_engines/scene.js"],
      rules: [
        "Optical size is bound to rendered size. A display cut and a text cut are one family answering one question at two scales.",
        "Paper is under the ink and multiplied through it, so type sits IN the sheet. Grain over the top is an effect without a cause.",
        "One light. Every shadow in the plate falls the same way, including the ones inside objects.",
        "Hairlines are exact. If a rule is blurred the page is not drafted, it is drawn."
      ] },
    { id: "swiss-modular", title: "Swiss modular",
      summary: "Grids, systems and the arguments against them. Digital-clean: one-pixel rules, integer tracks, and no texture anywhere.",
      palette: ["#0f0f11", "#2f5fd6", "#f2f2f3", "#ffffff", "#98989e"],
      type: { display: "Fraunces", text: "Inter", mono: "JetBrains Mono" },
      texture: ["none", "hairline", "tinted-track"],
      engines: ["_engines/raster.js", "_engines/rng.js", "_engines/scene.js"],
      rules: [
        "Track widths are snapped to integers before anything is drawn, so hairlines land on device pixels.",
        "One accent colour on the whole sheet, and it means \"interactive\" or it means nothing.",
        "A photo area holds a generated scene. A CSS gradient standing in for a photograph makes a mockup look finished while proving nothing.",
        "No texture. This is a screen and it says so."
      ] },
    { id: "technical-doc", title: "Technical document",
      summary: "A document that looks like the machine that made it. Punches, ticks, a barcode, a grid — and no ornament of any kind.",
      palette: ["#0a0a0b", "#ffffff", "#9a9aa0", "#eaeaec"],
      type: { display: "Archivo", text: "Fraunces", mono: "JetBrains Mono" },
      texture: ["punched-hole", "hairline-grid", "barcode", "drafting-line", "hatch"],
      engines: [],
      rules: [
        "Every hole is a real hole: the ground shows through, with an inner shadow for the thickness and a lit lip below.",
        "The only non-text mark is a legend. Ornament is not allowed on a spec sheet.",
        "Signatures are fineliner and never starve — a pen is not a press.",
        "No raster on a drawing sheet. If it needs grain to look finished it is not finished."
      ] },
    { id: "atmospheric", title: "Atmospheric field",
      summary: "Colour fields painted small and upscaled, where the upscale is the blur and the grain is the emulsion. The picture and the type share one film.",
      palette: ["#e7e3d9", "#1a1815", "#2b57d6", "#dcd9d1", "#0a0a0a"],
      type: { display: "Fraunces", text: "Archivo", mono: "JetBrains Mono", script: "Caveat" },
      texture: ["grain-gradient", "elliptical-belt", "film-grain", "dot-screen", "watercolour-wash", "granulation", "edge-pooling"],
      engines: ["_engines/raster.js", "_engines/rng.js", "_engines/field.js", "_engines/halftone.js", "_engines/paper.js", "_engines/scene.js"],
      rules: [
        "Bodies are belts, not blobs. A chain of radial gradients is the AI-gradient tell and it has no field underneath.",
        "The blur IS the upscale. A separate blur pass is an effect looking for a cause.",
        "The film layer sits ABOVE the type, so the words are in the picture rather than on it."
      ] }
  ],

  /* The fourteen skills. Only competency rungs get their own pages
     (rendered empty when nothing has been filed under them). Every entity may
     declare `governed_by: [<skill-id>, ...]`. */
  skills: [
    { id: 'composing-computational-material-systems', title: 'Composing computational material systems',
      role: 'critiques', rung: 2 },
    { id: 'components-craft', title: 'Components craft',
      role: 'governs', rung: 1 },
    { id: 'creative-hifi-frontend', title: 'Creative hi-fi frontend',
      role: 'produces', rung: 1 },
    { id: 'algorithmic-art', title: 'Algorithmic art',
      role: 'produces', rung: 1 },
    { id: 'material-systems-direction', title: 'Material systems direction',
      role: 'critiques', rung: 3 },
    { id: 'frontend-design', title: 'Frontend design',
      role: 'produces', rung: 1 },
    { id: 'technical-illustration', title: 'Technical illustration',
      role: 'produces', rung: 1 },
    { id: 'patent-figure-drawing', title: 'Patent-figure drawing',
      role: 'produces', rung: 1 },
    { id: 'canvas-design', title: 'Canvas design',
      role: 'produces', rung: 1 },
    { id: 'dataviz', title: 'Data visualization',
      role: 'produces', rung: 1 },
    { id: 'artifact-diagramming', title: 'Artifact diagramming',
      role: 'produces', rung: 1 },
    { id: 'brand-world', title: 'Brand world',
      role: 'governs', rung: 2 },
    { id: 'composing-computational-sound-systems', title: 'Composing computational sound systems',
      role: 'critiques', rung: 2, note: 'proposed — 45 of 47 inventory rows have no skill; the rung is unbuilt' },
    { id: 'proof-cleanup-upscale', title: 'Proof cleanup & upscale',
      role: 'produces', rung: 1 }
  ],

  /* Empty at ck-e0. ck-e1 folds the two tools' content under this. */
  entries: []
});
