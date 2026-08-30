/* ============================================================================
   encyclopedia/manifest.js — one archive, five entity kinds.

   ck-e1 folds book-of-shaders/ and components/ under this manifest:
   22 chapters as TECHNIQUES; 3 worked examples (W1–W4, with KL1 merged
   into W1) as EXPLORATIONS pointing at their technique via instance_of[];
   29 lenses as EXPLORATIONS with uses[] populated where legible. Ten atom
   stubs and four technique stubs are declared inline below so uses[] and
   instance_of[] resolve at ck-e1; ck-e2 fleshes each atom into a page with
   an engine file and a swatch matrix.

   The single dedup: KL1 (kls01-ki-landscape) folded into W1
   (w1-seven-pass-band-chain). The old KL1 lens is gone from disk; the
   redirect below carries any bookmarked URL forward. That is the proof
   this fold was needed — the two records were the same picture.

   scripts/build-site.mjs verifyManifests gates every atom kind, every
   uses[] and instance_of[] target, every governed_by skill id, and every
   count on every surface.
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

  /* Sections carry the chapter + lens groupings. The atom/technique/skill
     landings live at their own routes (#/atoms, #/techniques, #/skills).
     `atoms` is a section too — a place for the atom stubs to sit in the rail. */
  sections: [
    { id: 'atoms',              title: 'Atoms',              order: 1,
      note: 'A noun with parameters. Substrate, process, texture, colour, type, engine, field, mark, voice, space, bus.' },
    { id: 'techniques',         title: 'Techniques (spine)', order: 2,
      note: 'Verbs with lessons. Chapters and worked examples that assert a way to do something.' },
    { id: 'sound',              title: 'Sound',              order: 3 },
    { id: 'getting-started',    title: 'Getting started',    order: 10 },
    { id: 'algorithmic-drawing',title: 'Algorithmic drawing',order: 11 },
    { id: 'generative',         title: 'Generative designs', order: 12 },
    { id: 'image-processing',   title: 'Image processing',   order: 13 },
    { id: 'beyond',             title: 'Beyond the book',    order: 14 },
    { id: 'worked-examples',    title: 'Worked examples',    order: 15 },
    { id: 'print-reproduction', title: 'Print & reproduction', order: 20 },
    { id: 'type-specimen',      title: 'Type & specimen',    order: 21 },
    { id: 'document-system',    title: 'Document & system',  order: 22 },
    { id: 'motion-kinetic',     title: 'Motion & kinetic',   order: 23 },
    { id: 'layout-systems',     title: 'Layout systems',     order: 24 },
    { id: 'in-situ',            title: 'In situ',            order: 25 },
    { id: 'unfiled',            title: 'Unfiled',            order: 99 }
  ],

  redirects: {
    /* KL1's old URL, in both tools, resolves to the merged W1 exploration.
       ck-e1: the panorama is one record now, not two — the point of the fold. */
    'kls01-ki-landscape': '#/entry/w1-seven-pass-band-chain',
    'entry/kls01-ki-landscape': '#/entry/w1-seven-pass-band-chain',
    /* Book-of-Shaders' old #/13-fbm short link (a plan §7.10 shortcut). The
       chapter itself is now the technique. */
    '13-fbm': '#/technique/13-fractal-brownian-motion'
  },

  /* Six styles — palette / type / texture / engines / rules verbatim from
     components/manifest.js. entries[] has KL1 replaced with W1. */
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
      ],
      entries: ["b1-photocopy-collage", "b2-riso-brush", "c1-heavy-ink", "d4-riso-print-set", "b3-wristband", "d6-social-tiles", "pm07-molten", "e5-case-card-alts"] },
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
      ],
      entries: ["d3-interlocking-stack", "b4-program-spread", "d1-inline-annotation", "t1-type-specimen", "t8-blobby-display", "d2-circled-glyphs", "c3-kinetic-type", "c4-ribbon-type", "t5-brutalist-grid"] },
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
      ],
      entries: ["e1-type-stack", "c6-dossier", "c2-style-guide", "d5-story-triptych"] },
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
      ],
      entries: ["b5-brand-guide-grid", "e2-modular-grid", "e3-bento-grid", "e6-device-mockups"] },
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
      ],
      entries: ["c5-spec-sheet", "crx01-instrument-typology"] },
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
      ],
      /* KL1 folded into W1 — one record, not two. */
      entries: ["e4-masonry-cards", "e5-case-card", "w1-seven-pass-band-chain"] }
  ],

  skills: [
    { id: 'composing-computational-material-systems', title: 'Composing computational material systems', role: 'critiques', rung: 2 },
    { id: 'components-craft', title: 'Components craft', role: 'governs', rung: 1 },
    { id: 'creative-hifi-frontend', title: 'Creative hi-fi frontend', role: 'produces', rung: 1 },
    { id: 'algorithmic-art', title: 'Algorithmic art', role: 'produces', rung: 1 },
    { id: 'material-systems-direction', title: 'Material systems direction', role: 'critiques', rung: 3 },
    { id: 'frontend-design', title: 'Frontend design', role: 'produces', rung: 1 },
    { id: 'technical-illustration', title: 'Technical illustration', role: 'produces', rung: 1 },
    { id: 'patent-figure-drawing', title: 'Patent-figure drawing', role: 'produces', rung: 1 },
    { id: 'canvas-design', title: 'Canvas design', role: 'produces', rung: 1 },
    { id: 'dataviz', title: 'Data visualization', role: 'produces', rung: 1 },
    { id: 'artifact-diagramming', title: 'Artifact diagramming', role: 'produces', rung: 1 },
    { id: 'brand-world', title: 'Brand world', role: 'governs', rung: 2 },
    { id: 'composing-computational-sound-systems', title: 'Composing computational sound systems', role: 'critiques', rung: 2, note: 'proposed — REVIEW-SOUND §1: 45 of 47 inventory rows have no skill, the rung is unbuilt' },
    { id: 'proof-cleanup-upscale', title: 'Proof cleanup & upscale', role: 'produces', rung: 1 }
  ],

  entries: [
    /* ── Atom stubs (10) — declared inline so uses[] on lenses and worked
       examples resolves at ck-e1. ck-e2 flesh out each into a swatch page.
       Each carries kind, section 'atoms', status 'exploration' (they are
       proposed atomisations of what the corpus keeps duplicating). ──── */
    { id: 'paper-tooth', title: 'Paper tooth', order: 1010,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['components-craft', 'composing-computational-material-systems'],
      note: 'Mean-preserving tile-based tooth. Multiplied under the sheet — the tooth perturbs both ways rather than only darkening (Ki-Landscapes/index.html:116-131). See W1 for the instance at 180 px / soft-light / mean-preserving true.' },
    { id: 'dot-screen-20', title: 'Rotated dot screen · 20°', order: 1020,
      lane: 'canvas2d', entity: 'atom', kind: 'process',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['components-craft'],
      note: 'The riso/xerox halftone. Six copies in the corpus (research/05 §7). 20° rotation is the register-tolerant classic; other angles exist.' },
    { id: 'mulberry32', title: 'mulberry32(seed)', order: 1030,
      lane: 'canvas2d', entity: 'atom', kind: 'engine',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'The seeded PRNG under every field in the corpus. Eleven copies (research/05 §7) — the strongest atom in the archive by duplication count.' },
    { id: 'oklab-ramp', title: 'OKLab colour ramp', order: 1040,
      lane: 'canvas2d', entity: 'atom', kind: 'colour',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'A ramp interpolated in OKLab, never sRGB. `colour` holds ramps only (never a lone hex, which has no parameters and no lesson). Two copies in the corpus.' },
    { id: 'watercolour-wash', title: 'Watercolour wash', order: 1050,
      lane: 'canvas2d', entity: 'atom', kind: 'process',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'Soft-light composited fill inside a clip. W1 pass 1 of 7.' },
    { id: 'granulation', title: 'Granulation', order: 1060,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'Gradient-masked pigment settle. Multiplies against the wash — swap the two and the band goes muddy (W1 pass_order).' },
    { id: 'cut-paper-edge', title: 'Cut-paper edge', order: 1070,
      lane: 'canvas2d', entity: 'atom', kind: 'mark',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'Ridge stroke, one-pixel accented. W1 pass 3 of 7.' },
    { id: 'edge-bloom', title: 'Edge bloom', order: 1080,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'Stamped crest strip that carries the pooling inside it. W1 pass 4 of 7 — pooling belongs after, not before.' },
    { id: 'bayer8', title: 'Bayer 8×8', order: 1090,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'The threshold matrix. Two copies in the corpus. Chapter 20 (dithering) is the technique that uses it and W2 (depth-aware dither) is the exploration that pins it to depth.' },
    { id: 'fbm-noise', title: 'fBm value noise', order: 1100,
      lane: 'canvas2d', entity: 'atom', kind: 'field',
      section: 'atoms', status: 'exploration', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'The output of chapter 13 as a reusable field. Four copies (research/05 §7).' },

    /* ── Technique stubs (4) — the techniques the worked examples
       declare. Each carries the exploration\'s critique block as its lesson
       at ck-e3; at ck-e1 they are stubs whose canonical instance page IS the
       worked example. ────────────────────────────────────────────────── */
    { id: 'seven-pass-band-chain', title: 'Seven-pass band chain',
      order: 2010, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical', stub: true,
      produces: ['paper-tooth'],
      governed_by: ['composing-computational-material-systems'],
      note: 'The technique W1 instantiates and KL1 used to. Order-dependent painterly compositing, per Ki-Landscapes/index.html:260-332.',
      ruling: {
        text: 'crisp edge (solid to 94%) — CANON, do not soften',
        by: 'julia', date: '2026-06-10',
        source: 'Ki-Landscapes/index.html:252' } },
    { id: 'depth-aware-dither', title: 'Depth-aware dither',
      order: 2020, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical', stub: true,
      produces: ['bayer8'],
      governed_by: ['composing-computational-material-systems'],
      note: 'One depth term, four consequences. W2 is the canonical instance; MIR-12 is its ancestor (the same shader with the depth term deleted).' },
    { id: 'hillshade-and-flow', title: 'Hillshade and flow — one field, two jobs',
      order: 2030, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'W3 is the canonical instance. One heightfield read for shade AND for flow direction, per MM-04 + MM-05.' },
    { id: 'unlinked-shader', title: 'A shader that does not link',
      order: 2040, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'known-failure', stub: true,
      governed_by: ['composing-computational-material-systems'],
      note: 'W4 is the failure. Included because the failure is the lesson — a graded failure from a real repo, not a strawman.' },

    /* ── The 22 chapters, promoted to TECHNIQUES ─────────────────────── */
    '00-introduction',
    '01-what-is-a-shader',
    '02-hello-world',
    '03-uniforms',
    '04-running-your-shader',
    '05-shaping-functions',
    '06-colors',
    '07-shapes',
    '08-matrices',
    '09-patterns',
    '10-random',
    '11-noise',
    '12-cellular-noise',
    '13-fractal-brownian-motion',
    '14-fractals',
    '15-textures',
    '16-image-operations',
    '17-kernel-convolutions',
    '18-filters',
    '19-other-effects',
    '20-dithering-and-quantization',
    '21-domain-warping',

    /* ── The 4 worked examples, promoted to EXPLORATIONS with instance_of ── */
    'w1-seven-pass-band-chain',      /* + KL1 folded in */
    'w2-depth-aware-dither',
    'w3-hillshade-and-flow',
    'w4-a-shader-that-does-not-link',

    /* ── The 29 lenses (KL1 dropped; folded into W1), EXPLORATIONS ─── */
    'b1-photocopy-collage',
    'b2-riso-brush',
    'c1-heavy-ink',
    'd4-riso-print-set',
    'b3-wristband',
    'd6-social-tiles',
    'pm07-molten',
    'e1-type-stack',
    'd3-interlocking-stack',
    'b4-program-spread',
    'd1-inline-annotation',
    't1-type-specimen',
    't8-blobby-display',
    'd2-circled-glyphs',
    'c5-spec-sheet',
    'c6-dossier',
    'c2-style-guide',
    'b5-brand-guide-grid',
    'crx01-instrument-typology',
    'c3-kinetic-type',
    'c4-ribbon-type',
    'e2-modular-grid',
    'e3-bento-grid',
    'e4-masonry-cards',
    'e5-case-card',
    'e5-case-card-alts',
    't5-brutalist-grid',
    'd5-story-triptych',
    'e6-device-mockups'
  ]
});
