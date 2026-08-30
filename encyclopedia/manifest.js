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
    /* TEXTURE — the surface consequences. Julia's TEXTURE question is answered
       by the SHELF ORDER on #/atoms: TEXTURE, SUBSTRATE, PROCESS sit as three
       side-by-side shelves, so a reader learns that paper-tooth (texture) is a
       sibling of bone-140gsm (substrate) and two-drum-riso (process), not their
       parent — the cause-and-consequence-on-one-shelf error the domain model
       refuses.                                                              */
    { id: 'paper-tooth', title: 'Paper tooth', order: 1010,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration',
      governed_by: ['components-craft', 'composing-computational-material-systems'],
      description: 'Mean-preserving fibre pattern at ~30% depth. The consequence of a substrate, not the substrate itself.',
      params: [
        { name: 'depth', min: 0, max: 60, value: 22, step: 1, note: 'per-pixel amplitude ±' },
        { name: 'seed',  min: 1, max: 9999, value: 4141, step: 1 },
        { name: 'fibres',min: 0, max: 40, value: 16, step: 1, note: 'faint horizontal fibres' }
      ],
      note: 'Multiplied under the sheet — the tooth perturbs BOTH ways rather than only darkening (Ki-Landscapes/index.html:116-131). See W1 for the instance at 180 px / soft-light / mean-preserving true.' },
    { id: 'dot-screen-20', title: 'Dot screen · 20°', order: 1020,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration',
      governed_by: ['components-craft'],
      description: 'The register-tolerant halftone. 65 lpi at 20° — a reproduction, not a filter.',
      params: [
        { name: 'cell',  min: 3,  max: 14, value: 6,  step: 1, note: 'lattice pitch' },
        { name: 'angle', min: 0,  max: 90, value: 20, step: 1, note: 'degrees' },
        { name: 'gain',  min: 0.4,max: 1.2,value: 0.72, step: 0.02, note: 'dot radius multiplier' }
      ],
      note: 'The riso/xerox halftone. Six copies in the corpus (research/05 §7). 20° is the register-tolerant classic; other angles exist.' },
    { id: 'bayer8', title: 'Bayer 8×8 threshold', order: 1030,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems'],
      description: 'The ordered dither matrix. Decides which of two quantized levels a pixel takes.',
      params: [
        { name: 'levels', min: 2, max: 8,  value: 2, step: 1, note: 'quantization steps' },
        { name: 'scale',  min: 1, max: 8,  value: 3, step: 1, note: 'pixels per cell' }
      ],
      note: 'Two copies in the corpus. Chapter 20 (dithering) is the technique that uses it, W2 (depth-aware dither) is the exploration that pins it to depth.' },
    { id: 'ink-chain', title: 'Ink chain (feDisplacementMap)', order: 1035,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration',
      governed_by: ['components-craft', 'composing-computational-material-systems'],
      description: 'feTurbulence + feDisplacementMap, opaque brush edge. Three tools from ONE parameterised generator.',
      params: [
        { name: 'freq',  min: 0.005,max: 0.08, value: 0.02, step: 0.001, note: 'turbulence base freq' },
        { name: 'amp',   min: 1,    max: 24,   value: 8,    step: 1,     note: 'displacement scale' },
        { name: 'seed',  min: 1,    max: 999,  value: 42,   step: 1 }
      ],
      note: 'Three copies in the corpus, differing only in freq and scale. The one thing this atom encodes: the edge stays opaque — a chain is a wobble on ink, not a fade in it.' },
    { id: 'granulation', title: 'Granulation', order: 1040,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems'],
      description: 'Gradient-masked pigment settle. Multiplies against the wash; order is load-bearing.',
      params: [
        { name: 'density', min: 20, max: 400, value: 160, step: 10 },
        { name: 'seed',    min: 1,  max: 999, value: 77,  step: 1 }
      ],
      note: 'Multiplies against the wash — swap the two and the band goes muddy (W1 pass_order).' },
    { id: 'edge-bloom', title: 'Edge bloom', order: 1050,
      lane: 'canvas2d', entity: 'atom', kind: 'texture',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems'],
      description: 'Stamped crest strip that carries the pooling INSIDE it — pooling belongs after, not before.',
      params: [
        { name: 'width', min: 4,  max: 40, value: 14, step: 1 },
        { name: 'seed',  min: 1,  max: 999,value: 33, step: 1 }
      ],
      note: 'W1 pass 4 of 7.' },

    /* SUBSTRATE — what you print ONTO. A substrate is a physical stock with a
       colour, a tooth and a plate-mark, never a texture applied on top.      */
    { id: 'bone-140gsm', title: 'Bone 140 gsm', order: 1200,
      lane: 'canvas2d', entity: 'atom', kind: 'substrate',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems', 'components-craft'],
      description: 'Warm off-white uncoated sheet, 1 px plate mark, no shadow. The stock you print ONTO — not a texture.',
      params: [
        { name: 'warmth', min: 0, max: 30, value: 12, step: 1, note: 'yellow bias 0..30' },
        { name: 'weight', min: 90, max: 300, value: 140, step: 10, note: 'gsm' }
      ],
      note: 'Warm off-white, plate mark 1 px, no drop shadow. A substrate carries its tooth as a consequence of its fibres — the tooth atom is a SIBLING, not a property.' },
    { id: 'tyvek', title: 'Tyvek', order: 1210,
      lane: 'canvas2d', entity: 'atom', kind: 'substrate',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems'],
      description: 'Spun-bonded polyethylene. Fibre-direction sheen banding; no absorption at all.',
      params: [
        { name: 'sheen', min: 0, max: 40, value: 18, step: 1 },
        { name: 'seed',  min: 1, max: 999,value: 91, step: 1 }
      ],
      note: 'Reads as spun-bonded polyethylene rather than paper: fibre direction, no ink soak, no plate mark. A named material with specific physics — the opposite of "noise as texture".' },

    /* PROCESS — the reproduction event. A process is an ACTION applied to a
       field on a substrate; it is not the resulting texture.                */
    { id: 'two-drum-riso', title: 'Two-drum offset', order: 1300,
      lane: 'canvas2d', entity: 'atom', kind: 'process',
      section: 'atoms', status: 'exploration',
      governed_by: ['components-craft', 'composing-computational-material-systems'],
      description: 'Two-colour riso pass. Drum 01 prints, drum 02 misses register by ~2.4 mm.',
      params: [
        { name: 'offset-x', min: 0, max: 6, value: 2.4, step: 0.1, note: 'mm' },
        { name: 'offset-y', min: -3,max: 3, value: 1.1, step: 0.1, note: 'mm' },
        { name: 'twist',    min: -3,max: 3, value: 0.4, step: 0.1, note: 'degrees' }
      ],
      note: 'Misregistration is the consequence of a second drum — its own seed, its own offset, its own twist. Never a drawn stroke or a copied layer (riso-xerox style rule 2).' },
    { id: 'xerox-degradation', title: 'Xerox degradation', order: 1310,
      lane: 'canvas2d', entity: 'atom', kind: 'process',
      section: 'atoms', status: 'exploration',
      governed_by: ['components-craft'],
      description: 'Photocopy generational loss. Toner starve, edge burn, feed jitter — coverage fails where there is enough ink to fail.',
      params: [
        { name: 'generations', min: 1, max: 8,  value: 3,  step: 1 },
        { name: 'starve',      min: 0, max: 60, value: 24, step: 1 },
        { name: 'jitter',      min: 0, max: 6,  value: 1.5,step: 0.1 }
      ],
      note: 'Coverage failure (pinholes, edge burn) belongs to the ink, so it happens where there is enough ink to fail. Small type does not starve.' },
    { id: 'watercolour-wash', title: 'Watercolour wash', order: 1320,
      lane: 'canvas2d', entity: 'atom', kind: 'process',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems'],
      description: 'Soft-light composited fill inside a clip. W1 pass 1 of 7 — always the first pass.',
      params: [
        { name: 'wet',     min: 0.1, max: 1.0, value: 0.55, step: 0.05 },
        { name: 'seed',    min: 1,   max: 999, value: 501,  step: 1 }
      ],
      note: 'Soft-light composited fill inside a clip. W1 pass 1 of 7.' },

    /* COLOUR — ramps only. A lone hex has no parameters and no lesson.     */
    { id: 'oklab-ramp', title: 'OKLab colour ramp', order: 1400,
      lane: 'canvas2d', entity: 'atom', kind: 'colour',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems'],
      description: 'A ramp interpolated in OKLab, never sRGB. Tuned for a downstream chain — she works in ramps, not hexes.',
      params: [
        { name: 'stops',     min: 3, max: 12, value: 7, step: 1, note: 'number of stops' },
        { name: 'lightness', min: 0.2, max: 0.85, value: 0.55, step: 0.01, note: 'midpoint L*' }
      ],
      note: 'A ramp interpolated in OKLab. `colour` holds ramps only. Two copies in the corpus; MIR-21 tunes an ATMOSPHERIC set for the downstream chain.' },

    /* MARK — hand-scale marks that go ON TOP of the plate.                  */
    { id: 'cut-paper-edge', title: 'Cut-paper edge', order: 1500,
      lane: 'canvas2d', entity: 'atom', kind: 'mark',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems'],
      description: 'Ridge stroke, one-pixel accented. W1 pass 3 of 7.',
      params: [
        { name: 'ridge', min: 0.5, max: 3, value: 1.2, step: 0.1, note: 'stroke px' },
        { name: 'seed',  min: 1,   max: 999,value: 88, step: 1 }
      ],
      note: 'W1 pass 3 of 7 — the edge that separates a wash from what is beside it.' },

    /* FIELD — the continuous input a technique consumes.                    */
    { id: 'fbm-noise', title: 'fBm value noise', order: 1600,
      lane: 'canvas2d', entity: 'atom', kind: 'field',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-material-systems'],
      description: 'Fractal-Brownian noise. Chapter 13 as a reusable field — four copies in the corpus.',
      params: [
        { name: 'octaves',    min: 1, max: 8, value: 5, step: 1 },
        { name: 'lacunarity', min: 1.5, max: 3, value: 2, step: 0.1 },
        { name: 'gain',       min: 0.2, max: 0.9, value: 0.5, step: 0.05 }
      ],
      note: 'The output of chapter 13 as a reusable field. Four copies (research/05 §7).' },

    /* ENGINE — the shared implementation, cited by every fragment that uses
       it. Six on disk. Julia asked for these to be entries, not paths.      */
    { id: 'mulberry32', title: 'mulberry32(seed)', order: 1700,
      lane: 'canvas2d', entity: 'atom', kind: 'engine',
      section: 'atoms', status: 'canonical',
      governed_by: ['composing-computational-material-systems'],
      description: 'Seeded PRNG. Fifteen copies in the monolith, one now — the strongest dedup case in the corpus.',
      note: 'The seeded PRNG under every field in the corpus. Fifteen copies in the monolith under fifteen names; the audit at research/05 §7 caught eleven and two more hid inside object literals. content/_engines/rng.js.' },
    { id: 'halftone-js', title: 'halftone.js', order: 1710,
      lane: 'canvas2d', entity: 'atom', kind: 'engine',
      section: 'atoms', status: 'canonical',
      governed_by: ['components-craft'],
      description: 'The dot screen, once. Six copies before it moved here — a halftone is a reproduction, not a texture.',
      note: 'Six copies (anyHalftone, hvHalftone, graceHalftone, t1Halftone, PR.halftone, caHalftone) folded into one dotScreen() call. content/_engines/halftone.js.' },
    { id: 'paper-js', title: 'paper.js', order: 1720,
      lane: 'canvas2d', entity: 'atom', kind: 'engine',
      section: 'atoms', status: 'canonical',
      governed_by: ['components-craft', 'composing-computational-material-systems'],
      description: 'Paper tooth + fibres + tile version. Two lenses painted it from scratch, three more inlined the loop.',
      note: 'B4 stkPaint and B3 festaTooth folded here plus three inlined grain loops. paperTooth() into a full canvas or paperTile() into a data: URL. content/_engines/paper.js.' },
    { id: 'field-js', title: 'field.js', order: 1730,
      lane: 'canvas2d', entity: 'atom', kind: 'engine',
      section: 'atoms', status: 'canonical',
      governed_by: ['composing-computational-material-systems'],
      description: 'The greyscale field a halftone reproduces. B1, C1, E5·ALT and D4 all had a byte-identical buildField.',
      note: 'The stand-in for a photograph: 46 soft radial blobs plus 70 low-alpha streaks, contrast-stretched. Honest only as the thing that is about to be reproduced — as a material on its own it is CMP-03 (B+, promising exploration). content/_engines/field.js.' },

    /* ── Technique stubs (4) — the techniques the worked examples
       declare. Each carries the exploration\'s critique block as its lesson
       at ck-e3; at ck-e1 they are stubs whose canonical instance page IS the
       worked example. ────────────────────────────────────────────────── */
    { id: 'seven-pass-band-chain', title: 'Seven-pass band chain',
      order: 2010, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical', stub: true,
      layer: 'IMAGE FORMATION',
      description: 'Painterly compositing as an ordered chain. The order is the content.',
      produces: ['paper-tooth'],
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'One landscape state (band index, coverage, humidity) drives every pass — colour, tooth, bloom and pooling all read from the same field.',
        distinct_job: 'Each pass has one job: wash (colour), granulation (settle), cut-paper edge (separation), bloom (crest), print (halftone), tooth (substrate), grain (film). Two doing the same job = one is decoration.',
        order: 'Wash → granulation → edge → bloom → print → tooth → grain. Swap wash and granulation and the band goes muddy; put grain before print and the film sits UNDER the ink instead of over it.',
        removal_test: 'Remove the tooth pass: the plate reads as a screen render, not a print. Remove the bloom: the crest goes flat and the whole plate reads as gradient.',
        overuse: 'Adding an eighth pass to "add depth" is the vibe stack — the answer is inside the existing chain (raise the bloom width), not beside it.'
      },
      note: 'The technique W1 instantiates and KL1 used to. Order-dependent painterly compositing, per Ki-Landscapes/index.html:260-332.',
      ruling: {
        text: 'crisp edge (solid to 94%) — CANON, do not soften',
        by: 'julia', date: '2026-06-10',
        source: 'Ki-Landscapes/index.html:252' } },
    { id: 'depth-aware-dither', title: 'Depth-aware dither',
      order: 2020, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical', stub: true,
      layer: 'IMAGE FORMATION',
      description: 'One depth term, four consequences. Bayer-8 threshold biased by scene depth.',
      produces: ['bayer8'],
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'Depth (a single per-pixel scalar) drives BOTH the dither threshold bias AND the two-level quantization step.',
        distinct_job: 'The Bayer matrix decides which of two levels a pixel takes; the depth bias decides which two.',
        order: 'Quantize AFTER the depth bias, or the dither picks between the wrong pair of levels.',
        removal_test: 'MIR-12 is this shader with the depth term deleted — a Bayer plate that never separates foreground from background. Kept as the ancestor.',
        overuse: 'A second dither pass over the result is dither without quantization behind it — noise, not a decision.'
      },
      note: 'One depth term, four consequences. W2 is the canonical instance; MIR-12 is its ancestor.' },
    { id: 'hillshade-and-flow', title: 'Hillshade and flow — one field, two jobs',
      order: 2030, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical', stub: true,
      layer: 'MATERIAL RESPONSE',
      description: 'One heightfield read twice: for shading AND for flow direction. Two consequences, one field.',
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'A single heightfield sample per pixel drives both the shade (dot with light direction) and the flow (gradient direction).',
        distinct_job: 'Shade paints the surface as illuminated; flow decides where a particle would run. Different jobs, one input.',
        order: 'Sample once, derive both. Sampling twice at different resolutions is the same field made two things that never agree.',
        removal_test: 'Turn the shading term to zero: the flow lines still read as valid on the map. Turn the flow off: the plate is a normal hillshade.',
        overuse: 'Adding a third read (curvature) that is not consumed by anything downstream is the field being asked to prove it can do more.'
      },
      note: 'W3 is the canonical instance. One heightfield read for shade AND for flow direction, per MM-04 + MM-05.' },
    { id: 'unlinked-shader', title: 'A shader that does not link',
      order: 2040, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'known-failure', stub: true,
      layer: 'SOURCE',
      description: 'Invisible in the source, total in the output. One missing word.',
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'A missing precision qualifier — a single omitted keyword.',
        distinct_job: 'The failure is the lesson: the QA harness asserts THIS shader fails in exactly this way. That is what makes it teaching material.',
        order: 'The linker runs after the compiler. A compile-clean shader can still not link, which is what makes this class of failure look like nothing.',
        removal_test: 'Add the qualifier back: the shader links and paints. The one thing that had to be there was one word.',
        overuse: 'None. A failure is not overused, it is duplicated in a corpus that does not know it is filed here.'
      },
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
