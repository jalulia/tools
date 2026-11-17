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
      unsorted: 'Imported from the inventory. No editorial ruling yet.',
      proposed: 'Written by the tool (ck-e6 candidate-technique detector). Julia rules by editing the stub.'
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
    { id: 'excluded-terms',     title: 'Excluded terms',     order: 16,
      note: 'Effects a field is assumed to forbid. Each entry builds the excluded term by hand and grades it: allowed after all, genuinely forbidden, or merely speculative.' },
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
      entries: ["c5-spec-sheet", "crx01-instrument-typology", "birefringent-ray-bench", "fidelity-lotus-tinytv"] },
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

  /* ck-e8 · Skills grouped into two shelves at #/skills:
     - Competency RUNGS (rung >= 2): two real rungs at the top, plus four
       LATER RUNGS (rung: 3, stub:true) named but visibly empty per the
       creative-competencies-suite.md §"Later rungs" list. Only rungs get
       their own #/skill/<id> page. Later rungs render as STUB.
     - Format/craft skills (rung: 1): the 12 producers/governors of pieces
       that make up the archive today. Each has a page listing every entry
       it governs. Ships EMPTY on purpose if the rule below tags nothing. */
  skills: [
    /* -- competency rungs -- */
    { id: 'composing-computational-material-systems', title: 'Composing computational material systems',
      role: 'critiques', rung: 2,
      note: 'The material-systems rung: one source, several consequences, one read; the five tests (shared cause, distinct jobs, order dependence, single read, removal test) and the six anti-patterns.' },
    { id: 'composing-computational-sound-systems', title: 'Composing computational sound systems',
      role: 'critiques', rung: 2,
      note: 'The sound-systems rung: parallels the material-systems rung for audio. Its five tests are the visual ones translated (shared cause · distinct voices · signal path order · single listen · the MUTE TEST). REVIEW-SOUND §1: 34 of 47 inventory rows have no governing skill; the rung is unbuilt on the skill side, filed against on the entry side.' },
    { id: 'body-of-work-variation', title: 'Body-of-work variation',
      role: 'critiques', rung: 3, stub: true,
      note: 'LATER RUNG · unbuilt. A brand of work carries a shape across pieces, not inside one. This rung is empty on purpose — it calls DOWN into the two rung-2 skills for per-piece coherence.' },
    { id: 'type-as-material', title: 'Type as material · editorial motion',
      role: 'critiques', rung: 3, stub: true,
      note: 'LATER RUNG · unbuilt. Type as a material governed by the same tests as the field around it, and editorial motion that has a metre. Calls DOWN into material-systems.' },
    { id: 'art-direct-to-supplied-canon', title: 'Art-direct to a supplied canon',
      role: 'critiques', rung: 3, stub: true,
      note: 'LATER RUNG · unbuilt. Reading a canon file (a brand, a client, an established body) and enforcing it as a hard constraint, not an inspiration. Calls DOWN into material-systems.' },
    { id: 'production-and-handoff', title: 'Production and handoff',
      role: 'governs', rung: 3, stub: true,
      note: 'LATER RUNG · unbuilt. From critique to shipped artefact — colour management, DPI, print pass, engineering handoff, version discipline. Calls DOWN into all rung-1 skills.' },
    /* -- format / craft (rung 1) -- */
    { id: 'canvas-design', title: 'Canvas design', role: 'produces', rung: 1 },
    { id: 'frontend-design', title: 'Frontend design', role: 'produces', rung: 1 },
    { id: 'creative-hifi-frontend', title: 'Creative hi-fi frontend', role: 'produces', rung: 1 },
    { id: 'technical-illustration', title: 'Technical illustration', role: 'produces', rung: 1 },
    { id: 'patent-figure-drawing', title: 'Patent-figure drawing', role: 'produces', rung: 1 },
    { id: 'technical-svg-diagrams', title: 'Technical SVG diagrams', role: 'produces', rung: 1 },
    { id: 'headless-render', title: 'Headless render', role: 'governs', rung: 1 },
    { id: 'algorithmic-art', title: 'Algorithmic art', role: 'produces', rung: 1 },
    { id: 'brand-world', title: 'Brand world', role: 'governs', rung: 2 },
    { id: 'dataviz', title: 'Data visualization', role: 'produces', rung: 1 },
    { id: 'sell-sheet', title: 'Sell sheet', role: 'produces', rung: 1 },
    { id: 'ki-brief', title: 'Ki brief', role: 'produces', rung: 1 },
    /* -- carried from ck-e0/e1 for entries that already declare them -- */
    { id: 'components-craft', title: 'Components craft', role: 'governs', rung: 1 },
    { id: 'material-systems-direction', title: 'Material systems direction', role: 'critiques', rung: 3 },
    { id: 'artifact-diagramming', title: 'Artifact diagramming', role: 'produces', rung: 1 },
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

    /* ── Audio atoms (6) — kinds voice/space/bus. Sound side of the same
       shelf. Their swatches are ASCII/canvas signal-flow diagrams, not
       colour, because a filter or an envelope has no paintable "look" —
       what you paint is the graph. ────────────────────────────────────── */
    { id: 'freeverb-comb', title: 'Freeverb comb filter', order: 1800,
      lane: 'audio', entity: 'atom', kind: 'space',
      section: 'atoms', status: 'canonical',
      governed_by: ['composing-computational-sound-systems'],
      description: 'A delay in a feedback loop, damped by a lowpass inside the loop. Six copies for parallel comb bank.',
      params: [
        { name: 'delay',    min: 0.020, max: 0.060, value: 0.037, step: 0.001, note: 'seconds' },
        { name: 'feedback', min: 0.50,  max: 0.86,  value: 0.84,  step: 0.01,  note: 'gain around the loop; cap 0.86 (see P1 fault)' },
        { name: 'damping',  min: 800,   max: 12000, value: 4500,  step: 100,   note: 'in-loop lowpass Hz' }
      ],
      note: 'One delay line + a gain node + a lowpass IN the feedback path. Eight of these summed at 1/8 is the Freeverb comb bank. reliquary-synth/src/audio/CathedralReverb.ts:58-84.' },
    { id: 'allpass-diffuser', title: 'Allpass diffuser', order: 1810,
      lane: 'audio', entity: 'atom', kind: 'space',
      section: 'atoms', status: 'canonical',
      governed_by: ['composing-computational-sound-systems'],
      description: 'Feed-forward + feed-back at −0.5 / +0.5 around one delay. Smears echo density without shifting spectrum.',
      params: [
        { name: 'delay',    min: 0.003, max: 0.020, value: 0.011, step: 0.001, note: 'seconds' },
        { name: 'feedback', min: 0.30,  max: 0.70,  value: 0.50,  step: 0.01 }
      ],
      note: 'Four in series after the comb bank; the point is to break up individual echoes without recolouring the room. reliquary-synth/src/audio/CathedralReverb.ts:86-111.' },
    { id: 'master-limiter', title: 'Master compressor + limiter', order: 1820,
      lane: 'audio', entity: 'atom', kind: 'bus',
      section: 'atoms', status: 'canonical',
      governed_by: ['composing-computational-sound-systems'],
      description: 'Two DynamicsCompressorNodes as two different devices, by parameters alone.',
      params: [
        { name: 'comp-thresh', min: -36, max: -6, value: -24, step: 1, note: 'compressor threshold dBFS' },
        { name: 'lim-thresh',  min: -12, max: 0,  value: -3,  step: 1, note: 'limiter threshold dBFS' },
        { name: 'trim',        min: 0.5, max: 1,  value: 0.8, step: 0.05, note: 'input trim' }
      ],
      note: 'Broadband glue → hard peak-catcher → destination. The smallest complete master chain in the corpus. reliquary-synth/src/audio/MasterChain.ts:1-33.' },
    { id: 'sidechain-duck', title: 'Sidechain duck', order: 1830,
      lane: 'audio', entity: 'atom', kind: 'bus',
      section: 'atoms', status: 'canonical',
      governed_by: ['composing-computational-sound-systems'],
      description: 'Heavy voices duck the room and the ambience. cancelScheduledValues + setTargetAtTime for click-free release.',
      params: [
        { name: 'depth', min: 0.1, max: 1.0, value: 0.3,   step: 0.05, note: 'gain at fully ducked' },
        { name: 'attack',min: 0.001,max: 0.03,value: 0.005,step: 0.001, note: 'seconds; tau' },
        { name: 'release',min:0.05, max: 0.5, value: 0.15, step: 0.01, note: 'seconds; tau' }
      ],
      note: 'The click-free ducking pattern is `cancelScheduledValues` before `setTargetAtTime`, not before `setValueAtTime` — the release is a curve, not a jump. holy-ops-v2/index.html:2318-2345.' },
    { id: 'banded-burst', title: 'Banded noise burst', order: 1840,
      lane: 'audio', entity: 'atom', kind: 'voice',
      section: 'atoms', status: 'canonical',
      governed_by: ['composing-computational-sound-systems'],
      description: 'The corpus\'s whole percussion section: noise → bandpass → AR envelope. One atom carries every foley hit.',
      params: [
        { name: 'freq',   min: 60,   max: 5000, value: 1400,  step: 10 },
        { name: 'Q',      min: 0.5,  max: 12,   value: 2.2,   step: 0.1 },
        { name: 'duration',min: 0.01,max: 0.3,  value: 0.035, step: 0.005, note: 'seconds' }
      ],
      note: 'src.buffer=whiteNoise → bandpass(freq,Q) → gain envelope (0→peak in 2ms, exp decay). The trailing setValueAtTime(0) at t+dur+0.001 is the fix for exp-never-reaches-zero click, present in her code. pussyphus/.../crowd.js:132-142 + foley.js:39-55.' },
    { id: 'buzz-envelope', title: 'Buzz envelope', order: 1850,
      lane: 'audio', entity: 'atom', kind: 'voice',
      section: 'atoms', status: 'exploration',
      governed_by: ['composing-computational-sound-systems'],
      description: 'Filtered noise + slow envelope. One primitive carries a whole class of insect/electrical drones.',
      params: [
        { name: 'centre', min: 200, max: 4000, value: 800, step: 10, note: 'bandpass centre Hz' },
        { name: 'Q',      min: 1,   max: 20,   value: 8,   step: 0.5, note: 'sharpness' },
        { name: 'rate',   min: 0.1, max: 8,    value: 2.5, step: 0.1, note: 'amplitude LFO Hz' }
      ],
      note: 'Sound INVENTORY §5 addendum: buzz-envelope is one atom that carries a whole percussion section — reliquary-synth/src/audio/BuzzGenerator.ts.' },

    /* ── Techniques proved by worked instances (4). Each carries the
       exploration's critique block as its lesson; the compact technique page
       mounts that canonical instance as its executable evidence. ───────── */
    { id: 'seven-pass-band-chain', title: 'Seven-pass band chain',
      order: 2010, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical',
      layer: 'IMAGE FORMATION',
      description: 'Painterly compositing as an ordered chain. The order is the content.',
      produces: ['watercolour-wash', 'granulation', 'cut-paper-edge', 'edge-bloom', 'paper-tooth'],
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'One landscape state (band index, coverage, humidity) drives every pass — colour, tooth, bloom and pooling all read from the same field.',
        distinct_job: 'Each pass has one job: wash (colour), granulation (settle), cut-paper edge (separation), bloom (crest), print (halftone), tooth (substrate), grain (film). Two doing the same job = one is decoration.',
        order: 'Wash → granulation → edge → bloom → print → tooth → grain. Swap wash and granulation and the band goes muddy; put grain before print and the film sits UNDER the ink instead of over it.',
        removal_test: 'Remove the tooth pass: the plate reads as a screen render, not a print. Remove the bloom: the crest goes flat and the whole plate reads as gradient.',
        overuse: 'Adding an eighth pass to "add depth" is the vibe stack — the answer is inside the existing chain (raise the bloom width), not beside it.'
      },
      critique: {
        reads_as: 'A watercolour landscape in depth bands, printed on a sheet with a tooth — one painting seen at one distance, not a stack of texture layers.',
        coupling: 'Band state drives wash, granulation, pooling and grain; the band midpoint tints its edge, bloom, pooling and catch-light; edge reach controls the soft and hard readings together.',
        pass_order: 'Wash → granulation → edge → bloom → catch-light → pooling → grain. Pigment, separation, light, accumulation and substrate become different pictures when reordered.',
        operators: ['band gradient', 'wash', 'granulation', 'cut-paper edge', 'edge bloom', 'catch-light', 'pooling', 'paper grain'],
        why_it_survives: 'The reduced three-pass instance proves the removals: it remains a valid picture, but can no longer be pale and textured at once or articulate the horizon as seven separate material events.'
      },
      note: 'The technique W1 instantiates and KL1 used to. Order-dependent painterly compositing, per Ki-Landscapes/index.html:260-332.',
      ruling: {
        text: 'crisp edge (solid to 94%) — CANON, do not soften',
        by: 'julia', date: '2026-06-10',
        source: 'Ki-Landscapes/index.html:252' } },
    { id: 'depth-aware-dither', title: 'Depth-aware dither',
      order: 2020, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical',
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
      critique: {
        reads_as: 'One room seen through one screen: a clear near figure and a field that becomes grainier, coarser and foggier with distance.',
        coupling: 'Linear depth drives dither strength, level count, scanline visibility and aerial fog. The ordered threshold is not a texture laid over the room; it is one reading of the room’s depth.',
        pass_order: 'Scene and depth → flow tint → bloom → ordered offset → quantization → scanline → vignette. Bloom and threshold must precede the floor or they spread banding and cease to select levels.',
        operators: ['procedural scene + depth', 'aerial fog', 'bloom', 'Bayer offset', 'quantizer', 'scanline', 'vignette'],
        why_it_survives: 'The ancestor with the depth term removed is already on the page: the treatment becomes uniform, the foreground no longer separates, and the filter loses its relation to the room.'
      },
      note: 'One depth term, four consequences. W2 is the canonical instance; MIR-12 is its ancestor.' },
    { id: 'hillshade-and-flow', title: 'Hillshade and flow — one field, two jobs',
      order: 2030, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'canonical',
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
      critique: {
        reads_as: 'A surveyed terrain: a lit ground with the shape of its contours drawn on it — one place described two ways.',
        coupling: 'One height field and one finite-difference gradient feed both consequences. Hillshade reads gradient against light; flow reads the same gradient’s direction.',
        pass_order: 'Shade, then strokes. The tonal ground establishes relief; the higher-frequency marks articulate its level sets without being covered by the fill.',
        operators: ['scalar height field', 'finite-difference gradient', 'hillshade', 'flow strokes'],
        why_it_survives: 'Remove shade and height/light disappear; remove strokes and the saddles and level-set structure disappear. Each consequence names information the other cannot supply.'
      },
      note: 'W3 is the canonical instance. One heightfield read for shade AND for flow direction, per MM-04 + MM-05.' },
    { id: 'unlinked-shader', title: 'A shader that does not link',
      order: 2040, lane: 'canvas2d', entity: 'technique',
      section: 'techniques', status: 'known-failure',
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
    'birefringent-ray-bench',
    'fidelity-lotus-tinytv',
    'c3-kinetic-type',
    'c4-ribbon-type',
    'e2-modular-grid',
    'e3-bento-grid',
    'e4-masonry-cards',
    'e5-case-card',
    'e5-case-card-alts',
    't5-brutalist-grid',
    'd5-story-triptych',
    'e6-device-mockups',

    /* ── ck-e5 · sound lane entries (4 explorations + 1 coupling) ─────────
       Every audio entry declares `lane: 'audio'` and `section: 'sound'` so
       #/sound (lane==='audio' || section==='sound') lists them. Their build
       functions live in content/<id>/entry.js and are consumed by
       adapters/audio.js. See CHECKPOINT-E5.md. */
    'cathedral-reverb',
    'ki-soundscape-bands',
    'shepard-risset',
    'buzz-generator',
    'crowd-and-dither-shared-cause'
  ,

    /* ── ck-e7 · imported unsorted rows from example-inventory.csv ───────
       Each row lands as entity:exploration, status:unsorted, with the
       researcher grade in proposed_grade. Renders on #/unfiled.
       ─────────────────────────────────────────────────────────────── */
    'mm-01',
    'mm-02',
    'mm-03',
    'mm-04',
    'mm-05',
    'mm-06',
    'mm-07',
    'mm-08',
    'mm-09',
    'mm-10',
    'pm-02',
    'pm-03',
    'pm-04',
    'pm-05',
    'pm-06',
    'pm-08',
    'pm-09',
    'pm-10',
    'pm-13',
    'pm-14',
    'pm-15',
    'cmp-01',
    'cmp-03',
    'cmp-04',
    'cmp-07',
    'cmp-09',
    'cmp-10',
    'ki-02',
    'ki-05',
    'ki-06',
    'tl-01',
    'tl-02',
    'mmd-01',
    'el-01',
    'rs-01',
    'rs-02',
    'cr-01',
    'gs-01',
    'io-01',
    'mmr-01',
    'mmr-02',
    'bos-01',
    'bos-02',
    'bos-03',
    'bos-04',
    'bos-05',
    'bos-06',
    'mir-12',
    'mir-13',
    'mir-14',
    'mir-15',
    'mir-16',
    'mir-17',
    'mir-18',
    'kls-03',
    'kls-04',
    'kls-05',
    'kls-06',
    'kls-08',
    'kls-09',
    'yos-01',
    'yos-02',
    'cap-01',
    'cap-02',
    'crx-01',
    'crx-02',
    'hop-01',
    'hop-02',
    'hop-03',
    'mir-19',
    'gal-01',
    'mir-20',
    'mir-21',
    'mir-22',

    // EXCLUDED TERMS · effects a field is assumed to forbid (X-series)
    'three-rays-not-two',
    'two-poles-never-one',
    'one-sign-never-two',

    // CANDIDATE TECHNIQUES · appended by index-tools.mjs --write
    { id: 'master-limiter-driver', title: 'Master compressor + limiter as driver',
      order: 1680, entity: 'technique', section: 'techniques', status: 'proposed',
      lane: 'audio', layer: 'STRUCTURE',
      description: 'Five different sound systems meet the same ceiling. The compressor shapes density; the limiter catches the peaks the composition is allowed to make.',
      produces: ['master-limiter'],
      governed_by: ['composing-computational-sound-systems'],
      tests: {
        shared_cause: 'Every source reaches one master chain, so threshold, ratio, attack and release determine the audible relation between impacts, layers and tails.',
        distinct_job: 'The compressor is broadband glue; the limiter is a fast peak catcher. Two DynamicsCompressorNodes, two jobs, separated by their settings.',
        order: 'Input trim → compressor → limiter → analyser. Metering before the limiter would report peaks the listener never receives.',
        removal_test: 'Bypass the limiter and stacked transients overshoot; bypass the compressor and the ceiling survives but the shared density between sources disappears.',
        overuse: 'A low threshold and fast release on both stages makes the whole mix pump. If every event announces the bus, the bus has become the instrument.'
      } },
    { id: 'oklab-ramp-driver', title: 'OKLab colour ramp as driver',
      order: 1690, entity: 'technique', section: 'techniques', status: 'proposed',
      lane: 'canvas2d', layer: 'GRAPHIC COMPOSITION',
      description: 'Interpolate colour as perceived lightness plus opponent axes, so a field can cross hue without acquiring a false dark seam or a chalky midpoint.',
      produces: ['oklab-ramp'],
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'One pair of endpoints and one scalar t drive L, a and b together; every consumer reads the same perceptual path.',
        distinct_job: 'Lightness carries value structure while the a/b axes carry hue and chroma. Interpolation keeps those jobs legible instead of mixing them in gamma-encoded RGB.',
        order: 'Convert endpoints to OKLab → interpolate L/a/b → convert once to display RGB → clamp at the output boundary.',
        removal_test: 'Replace the ramp with a direct RGB lerp and the midpoint changes weight: dark seams or greyed colour appear where the field itself is smooth.',
        overuse: 'Independent ramps for every layer destroy the shared value structure. One field needs one colour grammar, with local deviations justified by a different job.'
      } },
    { id: 'mulberry32-driver', title: 'mulberry32(seed) as driver',
      order: 1700, entity: 'technique', section: 'techniques', status: 'proposed',
      lane: 'canvas2d', layer: 'SOURCE',
      description: 'Treat the seed as the plate identity. One repeatable sequence drives every stochastic decision, so a changed parameter produces a changed picture—not an untraceable new draw.',
      produces: ['mulberry32'],
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'One printed seed initializes the plate and feeds grain, placement, coverage failure and registration offsets through named streams.',
        distinct_job: 'The generator supplies a deterministic sequence; each consumer decides what a sample means. Randomness is a source, not a visual layer.',
        order: 'Create or derive each stream once → generate structure → reproduce it. Reseeding inside a loop repeats values instead of producing variation.',
        removal_test: 'Replace mulberry32 with Math.random and two renders with identical settings no longer agree; the plate loses both identity and debuggability.',
        overuse: 'Sharing the same sample between unrelated properties creates visible correlation. Derive stable sub-seeds for independent jobs instead of consuming one stream opportunistically.'
      } },
    { id: 'dot-screen-20-driver', title: 'Dot screen · 20° as driver',
      order: 1710, entity: 'technique', section: 'techniques', status: 'proposed',
      lane: 'canvas2d', layer: 'IMAGE FORMATION',
      description: 'Map image tone to dot area on one lattice turned 20°. Pitch decides detail, angle decides direction, and radius alone carries coverage.',
      produces: ['dot-screen-20'],
      governed_by: ['components-craft'],
      tests: {
        shared_cause: 'One luminance or ink-coverage field drives the radius of every dot on a single 20° lattice.',
        distinct_job: 'Pitch sets the reproduction resolution, angle sets the screen direction, and dot radius encodes tone. Moving one must not impersonate another.',
        order: 'Read coverage → rotate into screen space → locate the lattice cell → compare distance to the tone-driven radius.',
        removal_test: 'Replace the dots with a solid alpha fill and the image keeps its silhouette but loses the declared reproduction process.',
        overuse: 'A second near-angle screen creates moiré. That interference is useful only when it is the subject, not a side effect of adding texture.'
      } },
    { id: 'fbm-noise-driver', title: 'fBm value noise as driver',
      order: 1720, entity: 'technique', section: 'techniques', status: 'proposed',
      lane: 'canvas2d', layer: 'SOURCE',
      description: 'Build one continuous field from weighted octaves, then let depth, shade, flow or atmosphere read that same terrain at different points in the chain.',
      produces: ['fbm-noise'],
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'One seeded value field, sampled at several frequencies, supplies every downstream reading of the terrain.',
        distinct_job: 'Octaves add scale to the field; consumers assign jobs such as height, direction or opacity. The noise does not decide the picture by itself.',
        order: 'Hash lattice values → interpolate each octave → weight and sum → normalize once → derive all downstream consequences.',
        removal_test: 'Give each effect an independent noise call and the image becomes a stack of unrelated textures: shade, flow and depth stop describing the same surface.',
        overuse: 'Octaves smaller than a pixel add aliasing and cost, not detail. Stop when the next frequency cannot survive the output resolution.'
      } },
    { id: 'banded-burst-driver', title: 'Banded noise burst as driver',
      order: 1730, entity: 'technique', section: 'techniques', status: 'proposed',
      lane: 'audio', layer: 'SOURCE',
      description: 'Filter one noise buffer into a spectral body and strike it with one gain envelope. Frequency says what hit; attack and decay say how it happened.',
      produces: ['banded-burst'],
      governed_by: ['composing-computational-sound-systems'],
      tests: {
        shared_cause: 'One noise source feeds both the audible band and the event envelope, so spectrum and duration belong to the same strike.',
        distinct_job: 'The band-pass supplies material identity; the gain envelope supplies onset and decay. Neither can substitute for the other.',
        order: 'Noise buffer → band-pass → gain envelope → destination bus; schedule the envelope before starting the source.',
        removal_test: 'Remove the filter and the event becomes broadband hiss; remove the envelope and it becomes a sustained band. Either deletion destroys the event.',
        overuse: 'Layering several bursts for one cue smears the transient and hides the band choice. Change Q or decay before adding another source.'
      } },

    /* ── Gardener · optics territory. A refracting interface bends a parallel
       sheet of light; brightness on the floor is 1/|det J| of the ray map, so
       rays pile onto the fold set (the caustic web) and starve in the voids.
       This closes the edge-bloom orphan — the atom is the bright refracted edge
       the caustic emits. (fbm-noise coupling is noted here; `couples` is not yet a manifest
       key.) status: proposed — coded evidence is present; Julia still rules on canon. ── */
    { id: 'caustic-refraction-web', title: 'Caustic refraction web',
      order: 2035, lane: 'fragment', entity: 'technique',
      section: 'techniques', status: 'proposed',
      fragment: 'fragment.html', thumb: 'thumb.png',
      frame: { designWidth: 1100, aspect: '1100/760', previewHeight: 760 },
      layer: 'MATERIAL RESPONSE',
      description: 'A wavy interface refracts a sheet of light; where the ray map folds, light piles into the bright caustic web. One height field, all the folds and voids.',
      governed_by: ['composing-computational-material-systems'],
      produces: ['edge-bloom'],
      tests: {
        shared_cause: 'A single seeded height field h(x,y) drives the whole ray map P = (x,y) + κ·∇h; the fold caustics and the divergence voids are both consequences of that one field.',
        distinct_job: 'The folds emit the bright edge (edge-bloom); the voids read as the dark ground. Different consequences, one map.',
        order: 'Refract first (accumulate the ray map), then read intensity as 1/|det J|. Painting bright lines directly, without the map, is decoration with no cause.',
        removal_test: 'Set κ to zero: the map is the identity and the plate is a flat grey — no folds, no web. The caustic exists only because the interface bends the rays.',
        overuse: 'Cranking κ past fold-over stacks so many sheets that the web closes into cells and the singularity is lost in ink — the field asked to prove it can do more.'
      },
      note: 'Optics territory. The physical cause upstream of edge-bloom: a caustic is a refracted brightness edge. The working plate is content/caustic-refraction-web/fragment.html.' },

    /* ── Gardener · Material Studies II, housed in the canonical plate frame (run 4).
       Keyline run separated from per-colour coverage runs; only the ink grammar varies. The
       keyline pass IS the ink-chain atom (feTurbulence -> feDisplacementMap), so this produces
       it and closes that orphan. fragment.html = Julia's engine, verbatim. ── */
    { id: 'keyline-coverage-chain', title: 'Keyline & coverage chain',
      order: 2040, lane: 'fragment', entity: 'technique',
      section: 'techniques', status: 'proposed', fragment: 'fragment.html', thumb: 'thumb.png',
      layer: 'IMAGE FORMATION',
      description: 'Separate the ink run from the per-colour fill runs, then vary only the ink grammar. One keyline (hand-wavered, misregistered), each colour its own coverage plate, grain + tooth to finish.',
      governed_by: ['components-craft', 'composing-computational-material-systems'],
      produces: ['ink-chain'],
      tests: {
        shared_cause: 'One seed drives the whole sheet: keyline hand-waver, every coverage plate, grain and tooth all read from it.',
        distinct_job: 'The ink run carries the drawing (one keyline); coverage runs carry colour (one plate per ink); grain and tooth carry the substrate.',
        order: 'Fills first through their coverage plates, then the ONE keyline shifted off them, then grain, then tooth.',
        removal_test: 'Remove the misregistration + hand-waver and the plate collapses to grammar (a), clean vector clip-art.',
        overuse: 'Stacking two ink grammars on one plate is the vibe stack; the six are alternatives, not layers.'
      },
      note: 'Material Studies II. Produces ink-chain. fragment.html houses the engine in the canonical plate frame.' },

    /* ── Gardener · image-processing / reflexive thread. Two identical line
       gratings of pitch p; the second is a copy of the first turned by a small
       angle theta. Overprint them and ink density is the union
           D(x,y) = 1 - (1 - oA) * (1 - oB).
       Where the rulings coincide the gaps stay open (light); a quarter-beat away
       they interleave and fill to solid (dark). That travelling envelope is the
       moiré, at beat pitch P = p / (2 sin(theta/2)) — a frequency NEITHER grating
       contains. Set theta = 0 and the beat pitch runs to infinity: one ruling, no
       moiré. The reflexive sibling of the archive's own screens (dot-screen-20,
       bayer8): those are periodic rulings this technique beats against a second.
       Atom-free (introduces no swatch); `couples` is not a manifest key, so the
       dot-screen-20 / bayer8 relation is stated in the note, not declared.
       status: proposed — coded evidence is present; Julia still rules on canon. ─ */
    { id: 'moire-aliasing', title: 'Moiré · sampling made visible',
      order: 2045, lane: 'fragment', entity: 'technique',
      section: 'techniques', status: 'proposed',
      fragment: 'fragment.html', thumb: 'thumb.png',
      frame: { designWidth: 1100, aspect: '1100/760', previewHeight: 760 },
      layer: 'IMAGE FORMATION',
      description: 'Overprint a fine ruling with a copy of itself turned a few degrees, and a slow light-and-dark banding appears at a pitch neither ruling contains. One periodic field sampling another — the act of sampling, drawn.',
      governed_by: ['composing-computational-material-systems'],
      tests: {
        shared_cause: 'One ruling pitch p and one angle theta drive everything: grating A at 0 deg and grating B — the same grating — at theta. The bands are the beat of those two, not an overlay painted on top.',
        distinct_job: 'Coincidence bands read light (open gaps); interleave bands read dark (filled gaps). The same two rulings, opposite consequence a quarter-beat apart.',
        order: 'Rule both gratings first, then read their overprint union D = 1 - (1 - oA)(1 - oB). Painting the bands directly, without the two rulings underneath, is decoration with no cause.',
        removal_test: 'Set theta to 0: the two rulings coincide, the beat pitch P = p / 2 sin(theta/2) runs to infinity, and the banding is gone — the surest sign it was never in either grating alone.',
        overuse: 'Turn theta past a few degrees and the beat pitch collapses toward the carrier: the broad envelope dissolves into a rotated cross-hatch texture and the moiré reading is lost.'
      },
      note: 'Image-processing / reflexive thread. Samples the archive\'s own screens — dot-screen-20 and bayer8 are periodic rulings this technique beats against a second ruling. Atom-free (no new swatch). The working plate is content/moire-aliasing/fragment.html.' },
]
});
