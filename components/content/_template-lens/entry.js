/* ============================================================================
   content/_template-lens/entry.js — the authoring template for a lens record.

   The shell injects this as a classic <script src> the first time the entry is
   routed to. It is data, not a module: no exports, no fetch, one call.

   Everything here is checked by scripts/build-site.mjs before a deploy, against
   learn/manifest.schema.json, which is additionalProperties:false everywhere —
   so a typo'd key is a hard failure rather than a field that silently does
   nothing. Run `node scripts/index-tools.mjs` to check without deploying.

   The editorial fields are not decoration. PLAN §1: an entry cannot be
   presented as canonical work without stating its read, its coupling and its
   pass order. verifyManifests() enforces exactly that.
   ============================================================================ */
Shell.registerEntry({

  /* -- identity ---------------------------------------------------------- */
  id: 'e7-my-lens',          // MUST equal the folder name. Also the URL: #/e7-my-lens
  index: 'E7',               // the display index the rail prints. Editorial, not a sort key.
  order: 280,                // the sort key. Sparse (10, 20, 30…) so you can insert.
  title: 'My lens',

  /* -- where it belongs -------------------------------------------------- */
  // one of the six sections in manifest.js. An unknown id fails the build.
  section: 'print-reproduction',
  // one of the six styles. This MUST match the stylesheet fragment.html links,
  // or the lens is in one style and dressed as another.
  style: 'riso-xerox',

  /* -- editorial status --------------------------------------------------- */
  //   canonical      presented as correct and finished
  //   exploration    kept because it asks a question, not because it answers one
  //   historical     superseded, kept for the record
  //   known-failure  shown BECAUSE it fails, and the failure is the lesson
  status: 'canonical',
  // stub is a FLAG, not a status: a lens can be canonical and unfinished.
  // stub: true,

  tags: ['Riso', 'Halftone', 'Paper tooth'],

  /* -- provenance --------------------------------------------------------- */
  // kind: 'original' | 'adapted' | 'reference-study'
  // A lens built by decomposing someone else's printed piece is a
  // reference-study and should say whose.
  source: { kind: 'reference-study', title: 'The reference this decomposes' },

  /* -- geometry ----------------------------------------------------------- */
  frame: {
    designWidth: 1100,       // the same number as `body { width }` in fragment.html
    aspect: '1100/780',      // used to size the frame without reading into it
    previewHeight: 780       // the contact-sheet card renders this many design px
    // height: 'auto'        // instead of aspect, if the plate's height is content-driven;
                             // fragment-boot.js then reports it over postMessage
  },
  thumb: {
    file: 'thumb.png',       // rendered by `node scripts/index-tools.mjs --shots`
    // [scale, offsetY] — a picture editor's decision, not a computed one.
    //   scale   a MULTIPLE of fit-to-card. 1 shows the whole plate width;
    //           1.4 is a 1.4× detail. Relative, so the crop means the same
    //           thing when the rail closes and the card gets wider.
    //   offsetY the design-pixel row that lands at the top of the card.
    // The rectangle this cuts must be the CARD's ratio, 232:196 — the build
    // checks it. So scale is at least  designWidth*196/232 / (height-offsetY):
    // a plate shorter than 929 design px has to be cropped INTO, or the card
    // would silently trim the sides of what you authored.
    crop: [1.25, 0]
  },

  /* -- the copy ----------------------------------------------------------- */
  // An HTML string. Two short paragraphs: what the plate IS, then the one
  // thing to look at. Not a caption and not a changelog.
  text: '<p>What this plate is, in one sentence that names the substrate and ' +
        'the process.</p><p>The one move worth pointing at — usually a coupling: ' +
        'the thing that decides two other things, and would be a lie if it ' +
        'decided only one.</p>',

  /* -- REFERENCE STUDY ---------------------------------------------------- */
  // What the source does → what the lens does. Eight of the original 27 had
  // one; the other nineteen carry `reference: null` and the page says
  // "No decomposition on file for this entry" out loud, because a missing
  // decomposition should be VISIBLE rather than blank. If you have not done
  // the decomposition, write null — do not write a thin one.
  reference: {
    title: 'The source piece — what it is',
    cells: [
      { k: 'Ground',  v: 'what the source does → what the lens does' },
      { k: 'Drum 01', v: 'what the source does → what the lens does' }
    ]
  },
  // reference: null,

  /* -- PASS 0 · DECOMPOSITION --------------------------------------------- */
  // Promoted out of the CSS comment it used to live in. Five cells, always in
  // this order. Write it BEFORE you write the CSS: it is the pass that decides
  // what the piece is made of, and skipping it is how a plate ends up as a
  // stack of effects.
  pass0: [
    { k: 'Substrate', v: 'the physical stock, or "none — a screen", and how it is lit' },
    { k: 'Process',   v: 'the reproduction: which press, which failures are allowed' },
    { k: 'Type',      v: 'the families and the job each one does' },
    { k: 'Hardware',  v: 'the objects — tape, punches, stickers, binding — or "none"' },
    { k: 'Skeleton',  v: 'the layout in one line: what sits where, and on what grid' }
  ],

  /* -- the critique ------------------------------------------------------- */
  // REQUIRED IN FULL on anything status:'canonical'. The build fails without
  // reads_as, coupling and pass_order. This is a gate made of a JSON field,
  // which is the cheapest kind of gate there is.
  critique: {
    // What a stranger sees in one glance. If the honest answer is "a rectangle
    // with textures on it", the plate is not finished.
    reads_as: 'One printed sheet, not a rectangle with filters applied.',
    // WHAT DRIVES WHAT. The test that does the most work in the framework:
    // name the one value that decides two or more visible things, and say why
    // they cannot disagree.
    coupling: 'The starve field decides both where the ink thins AND where the ' +
              'second drum shows through, so the two inks cannot disagree about ' +
              'where the ink ran out.',
    // The order of operations, and why a different order is a different
    // picture. If swapping two passes makes no difference, one of them is
    // doing no work.
    pass_order: 'paper → drum 01 → starve → drum 02 under it → grain. ' +
                'Starving after the second drum would punch holes in it too, ' +
                'which a press does not do.',
    operators: ['dot screen', 'toner starve', 'misregistration', 'paper tooth'],
    // The removal test, run in public: take one operator out and say what dies.
    why_it_survives: 'Remove the starve and the misregistration has nothing to ' +
                     'be visible through; remove the tooth and the starve reads as noise.',
    // FAULTS (pre-refine) — what was wrong in the previous build and how it was
    // fixed. Rendered behind the hatched rule, which is the one ornamental mark
    // in the system and earns its place by marking the block that is an
    // admission. Do not sand these down; they are the most useful lines here.
    faults: [
      'The starve ran at the same frequency as the paper tooth, so the pinholes moiréd. Separated by an octave.',
      'The second drum was drawn as a stroke, which made the misregistration a decision rather than a consequence.'
    ]
  },

  /* -- a dated, attributed decision ---------------------------------------- */
  // Optional. Use it when someone will otherwise "fix" the thing on purpose.
  // ruling: {
  //   text: 'The knockout stays crisp — solid to 94% and then nothing. The softness ' +
  //         'in this plate belongs to the ink; giving it to the letterform as well ' +
  //         'is one job done twice.',
  //   by: 'julia', date: '2026-06-10'
  // },

  /* -- links --------------------------------------------------------------- */
  // Every link is resolved at build time, in this tool or in the named sibling.
  // A dead one fails the deploy.
  related: [
    { entry: 'c1-heavy-ink', relation: 'same-process' }
    // { tool: 'book-of-shaders', entry: '13-fbm', relation: 'shader-behind',
    //   href: '../book-of-shaders/#/13-fbm', label: '13 Fractal Brownian Motion' }
  ]
});
