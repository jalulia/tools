/* ============================================================================
   components/manifest.js — the ONE source of truth for this tool.

   Before this file there were three hand-maintained indexes — 27 <section>s,
   27 nav links, 26 gallery cards — plus a hero, a footer and a tool.json
   giving three different counts. They had already drifted: E5·ALT was in the
   document and in the nav and had no gallery card, so the discovery surface
   the hero told you to use could not reach it. Every count on every surface
   now derives from entries.length, and scripts/build-site.mjs fails the
   deploy if any string states a number that does not.

   A lens is a folder plus one line here. Adding one is:
     cp -r content/_template-lens content/e7-new-thing
     $EDITOR content/e7-new-thing/{fragment.html,entry.js}
     add 'e7-new-thing' to entries[] below
   ============================================================================ */
Shell.registerManifest({
  schemaVersion: 1,
  id: 'components',
  title: 'Components',
  subtitle: 'the lens library',
  mode: 'catalogue',
  stage: { adapter: 'fragment', aspect: '1100/900', isolation: 'iframe' },
  siblings: [
    { id: 'book-of-shaders', title: 'Shaders',    href: '../book-of-shaders/' },
    { id: 'components',      title: 'Components', href: './' }
  ],
  vocabulary: {
    status: {
      canonical: 'Work that is presented as correct and finished.',
      exploration: 'Kept because it asks a question, not because it answers one.',
      historical: 'Superseded, kept for the record.',
      'known-failure': 'Shown because it fails, and the failure is the lesson.'
    }
  },
  /* Six sections. The old B/T/C/D/E letter families described nothing — T2,
     T3, T4, T6 and T7 never existed and E6 sat before E2 before E1 in the
     document — so the letters survive only as the display index. */
  sections: [
    { id: "print-reproduction", title: "Print & reproduction", order: 1 },
    { id: "type-specimen", title: "Type & specimen", order: 2 },
    { id: "document-system", title: "Document & system", order: 3 },
    { id: "motion-kinetic", title: "Motion & kinetic", order: 4 },
    { id: "layout-systems", title: "Layout systems", order: 5 },
    { id: "in-situ", title: "In situ", order: 6 }
  ],
  /* Six styles. Each one is load-bearing rather than descriptive: its
     content/_styles/<id>.css is what every fragment in it links, and the
     palette / three type roles / texture vocabulary / engines / rules below
     are what the style page prints beside the work they govern. */
  styles: [
    { id: "riso-xerox", title: "Riso / Xerox",
      summary: "Duplicator and copier reproduction. A field is screened, a second drum misses register, and coverage fails as pinholes. The failures are press facts, never filters.",
      palette: ["#e8531f", "#4a54cf", "#141210", "#e4e0d6", "#c2452c"],
      type: { display: "Anton", text: "EB Garamond", mono: "JetBrains Mono", script: "Caveat" },
      texture: ["dot-screen", "toner-starve", "misregistration", "paper-tooth", "edge-burn", "feed-jitter"],
      // the shared code every fragment in this style loads, relative to content/
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
      // the shared code every fragment in this style loads, relative to content/
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
      // the shared code every fragment in this style loads, relative to content/
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
      // the shared code every fragment in this style loads, relative to content/
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
      // the shared code every fragment in this style loads, relative to content/
      engines: [],   // none: no lens in this style allocates a canvas
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
      // the shared code every fragment in this style loads, relative to content/
      engines: ["_engines/raster.js", "_engines/rng.js", "_engines/field.js", "_engines/halftone.js", "_engines/paper.js", "_engines/scene.js"],
      rules: [
        "Bodies are belts, not blobs. A chain of radial gradients is the AI-gradient tell and it has no field underneath.",
        "The blur IS the upscale. A separate blur pass is an effect looking for a cause.",
        "The film layer sits ABOVE the type, so the words are in the picture rather than on it."
      ],
      entries: ["e4-masonry-cards", "e5-case-card", "kls01-ki-landscape"] }
  ],
  entries: [
    /* Print & reproduction — 8 */
    "b1-photocopy-collage",   // B1 · riso-xerox
    "b2-riso-brush",          // B2 · riso-xerox
    "c1-heavy-ink",           // C1 · riso-xerox
    "d4-riso-print-set",      // D4 · riso-xerox
    "b3-wristband",           // B3 · riso-xerox
    "d6-social-tiles",        // D6 · riso-xerox
    "pm07-molten",            // PM7 · riso-xerox · original
    "kls01-ki-landscape",     // KL1 · atmospheric · original
    /* Type & specimen — 7 */
    "e1-type-stack",          // E1 · editorial-serif
    "d3-interlocking-stack",  // D3 · display-specimen
    "b4-program-spread",      // B4 · display-specimen
    "d1-inline-annotation",   // D1 · display-specimen
    "t1-type-specimen",       // T1 · display-specimen
    "t8-blobby-display",      // T8 · display-specimen
    "d2-circled-glyphs",      // D2 · display-specimen
    /* Document & system — 5 */
    "c5-spec-sheet",          // C5 · technical-doc
    "c6-dossier",             // C6 · editorial-serif
    "c2-style-guide",         // C2 · editorial-serif
    "b5-brand-guide-grid",    // B5 · swiss-modular
    "crx01-instrument-typology", // CX1 · technical-doc · original
    /* Motion & kinetic — 2 */
    "c3-kinetic-type",        // C3 · display-specimen
    "c4-ribbon-type",         // C4 · display-specimen
    /* Layout systems — 6 */
    "e2-modular-grid",        // E2 · swiss-modular
    "e3-bento-grid",          // E3 · swiss-modular
    "e4-masonry-cards",       // E4 · atmospheric
    "e5-case-card",           // E5 · atmospheric
    "e5-case-card-alts",      // E5·ALT · riso-xerox
    "t5-brutalist-grid",      // T5 · display-specimen
    /* In situ — 2 */
    "d5-story-triptych",      // D5 · editorial-serif
    "e6-device-mockups",      // E6 · swiss-modular
  ]
});
