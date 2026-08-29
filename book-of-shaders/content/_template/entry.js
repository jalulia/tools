/* ============================================================================
   content/_template/entry.js — the authoring unit. Copy the folder, edit this
   file, add one line to ../../manifest.js. That is the whole workflow:

       cp -r content/_template content/22-truchet
       $EDITOR content/22-truchet/entry.js
       $EDITOR manifest.js                       # add '22-truchet',
       node scripts/index-tools.mjs              # check, diff, thumbs, mirror
       open index.html                           # double-click. No server.

   Folders beginning with `_` are exempt from the "every folder must be in the
   manifest" rule, which is why this one can sit here unlisted.

   HOW THIS FILE IS LOADED. It is a classic script. manifest.js names the
   folder; the shell injects <script src="content/<id>/entry.js"> at boot with
   async=false, so registration order is manifest order. There is no fetch, no
   import(), no type="module" and no CDN anywhere in this tool — under file://
   a classic <script src> is the only thing that loads external data, and this
   tool has to open from a double-click on Julia's machine.

   WHAT IS REQUIRED. Four fields: id, title, section, status. Everything else
   is optional and everything else is a decision. `additionalProperties` is
   false throughout learn/manifest.schema.json, so a typo'd field name is a
   hard build failure, not a silently ignored one. Run
   `node scripts/build-site.mjs` and it will tell you the property and the path.

   HOW TO DELETE FROM THIS TEMPLATE. Delete whole blocks. An empty array or an
   empty string is not the same as an absent field: `reference: null` prints
   "No decomposition on file for this entry" on the page, on purpose, because a
   missing decomposition should be visible rather than blank.
   ============================================================================ */

Shell.registerEntry({

  /* ---------------------------------------------------------------- identity
     id       REQUIRED. Lowercase slug, hyphens only. It is three things at
              once: the folder name, the URL (#/<id>) and the key every
              `related` link resolves against. It MUST equal the folder name —
              build-site.mjs checks. Chapters are numbered onto the upstream
              book's own 00-18, so an upstream .frag is a `cp`.
     index    What the rail and the kicker print ("07"). Editorial, not a sort
              key — you can print "B1" or "07a" here.
     order    The sort key. Sparse (ten per chapter) so a chapter can be
              inserted between two others without renumbering anything.
     title    Sentence case. It is a title, not a label.
     section  REQUIRED. Must be one of the section ids in manifest.js:
              getting-started · algorithmic-drawing · generative ·
              image-processing. An unknown section fails the build.  */
  id:      '_template',
  index:   '99',
  order:   990,
  title:   'A chapter that has not been written yet',
  section: 'getting-started',

  /* ------------------------------------------------------------- standing
     status   REQUIRED. Editorial standing, not build state:
                canonical      presented as correct and finished. The default.
                exploration    kept because it asks a question.
                historical     superseded, kept for the record.
                known-failure  shown BECAUSE it fails, and the failure is the
                               lesson. Exempt from the "every chapter compiles"
                               assertion, and asserted to fail in exactly the
                               way its own prose says it will.
     stub     A boolean FLAG, not a status — a chapter can be canonical and
              unfinished at the same time, and the chip row stays one line.
     lane     Which stage adapter runs this. 'glsl' | 'canvas2d' | 'svg' |
              'fragment'. Set per entry AND per example: the lane is a property
              of the work, not of the tool (PLAN §5.2). 'svg' has no adapter
              yet and will give you an empty stage and a console warning.
     tags     Free text, printed under the title, searched by the rail.
     note     One sentence the Notes pane prints. Use it for what is true about
              this chapter that the prose should not have to carry — e.g. what
              a later checkpoint is going to change.  */
  status: 'exploration',
  stub:   true,
  lane:   'glsl',
  tags:   ['placeholder', 'copy me'],
  note:   'This is the template. If you are reading it on a page, something is wrong.',

  /* ---------------------------------------------------------------- files
     path     Defaults to content/<id>/. Set it only if the folder is not named
              after the id. It may never be named dist/, _site/ or
              node_modules/ — build-site.mjs filters those basenames out of the
              deploy at any depth and your chapter would silently vanish.
     entry    Defaults to entry.js.
     thumb    A filename, or { file, crop: [scale, offsetY] }. Rendered by
              `node scripts/index-tools.mjs --shots`, which only fills a thumb
              that is declared and missing. A declared thumb that does not
              exist on disk fails the build. It is what the contact sheet
              (#/index) shows; a course chapter has a live stage the moment you
              open it, so this is a still, not a second canvas.  */
  path:  'content/_template/',
  entry: 'entry.js',
  thumb: 'thumb.png',

  /* -------------------------------------------------------------- provenance
     source   REQUIRED on anything not written here from scratch, and the
              honesty field of this whole tool. kind is one of:
                original         written for this tool
                adapted          derived from a named source
                reference-study  a rebuild of someone else's designed artefact
                own-work         a shipped ø / client piece
                quoted           reproduced verbatim under licence
              Four chapters here are `original` because upstream 14, 16, 17 and
              18 are stubs; saying so is the point. An example may carry its
              own `source` that overrides this one — chapter 00 does, because
              its two shaders are by two other people.  */
  source: {
    kind:    'adapted',
    title:   'The Book of Shaders — chapter NN',
    author:  'Patricio Gonzalez Vivo & Jen Lowe',
    url:     'https://thebookofshaders.com/NN/',
    license: 'CC BY-NC-SA 4.0',
    note:    'What you changed, if you changed anything.'
  },

  /* ------------------------------------------------------------------ stage
     Per-chapter overrides of the tool's default stage.
       texture   this chapter needs a source image. The GLSL adapter binds an
                 authored procedural scene — hard edges on purpose, no asset
                 ships — to u_tex0, with u_tex kept as an alias so a shader
                 written for either convention runs unchanged.
       mouse     this chapter reads u_mouse. Mapped to gl_FragCoord
                 conventions: drawing-buffer pixels, origin bottom left.
       controls  ['texture-upload' | 'pause' | 'fullbleed' | 'reset']  */
  stage: { texture: false, mouse: false },

  /* ------------------------------------------------------------------ prose
     text   An HTML string. There is no fetch, so a prose FILE would need a
            second transport; a template literal next to the code it explains
            is the right authoring unit anyway.

            The column is 66ch. What is styled: <p>, <h2> (which draws its own
            rule), <em>, <code>, <a>, <ul>, <ol>, <blockquote>, and
            <div class="note"> — a marginal note that floats into the right
            margin above 940px and folds into the measure below it. A note is
            for the aside that would break the paragraph. Do not use <h1>: the
            title is the h1.

            Say what the field IS before naming the technique.  */
  text: `
    <p>Two or three short paragraphs. The first one should be able to stand
    alone if someone reads nothing else — say what the thing is, not what it is
    called.</p>

    <div class="note"><span class="lab">A marginal note</span>
      <p>The aside that would otherwise break the paragraph. It floats right at
      wide widths and folds into the measure on a phone.</p></div>

    <h2>A second movement, if the chapter needs one</h2>
    <p>Reach for <code>inline code</code> for anything the reader will type, and
    <em>emphasis</em> for the word the sentence turns on.</p>`,

  /* --------------------------------------------------------------- examples
     Level 3 of the navigation. Examples live in a strip under the stage, never
     in the rail — which is what lets one chapter carry the 23 .frag files that
     upstream chapter 09 has without wrecking the index. One example means no
     strip. Deep-linkable as #/<id>/<example-id>.

       file  the file of record beside this entry.js, e.g. main.frag. It is NOT
             loaded at runtime — file:// forbids that — but the apparatus
             prints it as the path, and `index-tools.mjs --mirror` copies it
             into the `code` literal below so the two cannot drift. Keep both:
             the .frag is what you open in an editor, `code` is what runs.
       lane  overrides the entry's lane for this example alone.

     The shader below runs. It is deliberately the least interesting thing this
     stage can draw, so that a chapter copied from this template and left
     unfinished LOOKS unfinished.  */
  examples: [
    {
      id: 'placeholder',
      title: 'Placeholder',
      lane: 'glsl',
      file: 'main.frag',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // A diagonal ramp with one hard step in it, so that both halves of the
    // stage's job — a continuous value and a decision made about it — are
    // visible before anything real is written here.
    float v = (st.x + st.y) * 0.5;
    float band = step(0.5, fract(v * 3.0 + u_time * 0.05));

    vec3 paper = vec3(0.906, 0.890, 0.851);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    gl_FragColor = vec4(mix(ink, paper, mix(v, band, 0.35)), 1.0);
}`
    }
  ],

  /* --------------------------------------------------------------- exercises
     The four-rung ladder. The book's exercises escalate and the playground
     kept only the bottom rung (research/04 §2d), which is the difference
     between a demo and a composition:

       tune        change a number.        "Try exponents 20.0, 2.0, 0.2."
       substitute  change a function.      "Replace pow() with exp(), log()."
       generalise  make it reusable.       "Write it as a function whose
                                            offset is an argument."
       compose     make something with it. "Three compositions in which the
                                            warp is driven by something else."

     Rungs are labelled by kind so the page can print the kind. Text may carry
     inline HTML. Two good rungs beat five weak ones.  */
  exercises: [
    { rung: 'tune',       text: 'Change one number and say what it did.' },
    { rung: 'substitute', text: 'Replace <code>step</code> with <code>smoothstep</code> and decide which one this chapter is about.' },
    { rung: 'generalise', text: 'Lift the two lines that matter into a function you would use again.' },
    { rung: 'compose',    text: 'Make three pictures with it in which the same value drives two different things.' }
  ],

  /* ----------------------------------------------------------------- links
     Elsewhere. Printed as a row at the foot of the chapter, opened in a new
     tab. The upstream chapter belongs here even — especially — when this
     chapter is original and upstream is a stub.  */
  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/NN/' }
  ],

  /* ==========================================================================
     EVERYTHING BELOW IS OPTIONAL AND MOST CHAPTERS WILL NOT USE IT.
     Delete what you do not need. These are the fields that restore the three
     teaching moves the playground dropped, plus the editorial layer.
     ========================================================================== */

  /* --- stages[] : the build-up ---------------------------------------------
     codeAndCanvas used as a SEQUENCE. Upstream chapter 05 puts four editors in
     a row — linear, expo, step, smoothstep — so you watch one idea deform into
     the next; the playground gave every chapter one editor and flattened every
     build-up into a destination. Each stage is a complete shader. At most one
     carries `default: true` — the stage the chapter opens on. A shared edit in
     the URL (?src=) beats the default, so opening someone's link does not
     silently discard their code.  */
  stages: [
    { label: 'one wave',  note: 'amplitude and frequency, and nothing else', code: '/* … */' },
    { label: 'the loop',  note: 'the same move, written so the knobs exist',  code: '/* … */', default: true }
  ],

  /* --- params[] : named knobs ----------------------------------------------
     Bound as uniforms (glsl) or as keys of `p` (canvas2d), and reported in the
     drawdown strip under the stage. Capped at three: a knob is an editorial
     decision and the correct default is zero knobs. `uniform` defaults to
     u_<name>. Name the thing the knob IS — the old chapter 13 hard-coded
     `st *= 2.0; amp *= 0.5;` and exposed neither lacunarity nor gain by name,
     which is why it read as a recipe instead of as a field.  */
  params: [
    { name: 'lacunarity', uniform: 'u_lacunarity', min: 1.2, max: 4, step: 0.01, value: 2.03,
      note: 'the gap in frequency between one octave and the next' }
  ],

  /* --- plots[] : the 1-D function plotter ----------------------------------
     simpleFunction, restored. The only thing on screen is y = f(x), so the
     SHAPE of a value is isolated from everything else — the purest statement
     of "control comes from shaping values, not selecting effects". `expr` is
     parsed by learn/plot.js: scalar GLSL-ish syntax over x and t, the usual
     scalar builtins, PI / TAU / E. No eval, no new Function. `t` is a slider,
     not a clock: a plot has no animation, on purpose, and a course page
     therefore has zero pending rAF callbacks.  */
  plots: [
    { title: 'One wave', expr: '0.5 + 0.5*sin(x*6.2831 + t)', domain: [0, 1], range: [0, 1],
      note: 'Amplitude is the multiplier; frequency is what multiplies <code>x</code>.' }
  ],

  /* --- gallery[] : variants ------------------------------------------------
     glslGallery, restored: a family shown side by side, one click to load into
     the stage. Upstream chapter 05 ends with six Quilez shaping functions and
     all six .frag files are in the corpus. The move being taught is "here is a
     family, compare them", which is a design lesson rather than a coding one.  */
  gallery: [
    { label: 'turbulence', code: '/* … */', thumb: 'turbulence.png', note: 'abs() of the same sum' }
  ],

  /* --- critique{} : the editorial gate -------------------------------------
     Required IN FULL on any entry that is `canonical` and carries a critique
     block: build-site.mjs fails the deploy if reads_as, coupling or pass_order
     is missing. It is a gate made of a JSON field, which is the cheapest kind.
     Do not open this block unless you intend to finish it.

       reads_as         what the picture is, said as a thing rather than as a
                        technique. "A dithered contour map printed in two inks
                        on a bone stock" — not "fBm with a Bayer dither".
       coupling         what drives what. If two operators do not touch, say so
                        and expect the question of why they are both here.
       pass_order       the order of operations, AND why a different order is a
                        different picture. Dither after quantization is noise;
                        dither before it IS the quantization.
       operators        the list, so it can be counted.
       why_it_survives  the removal test, run in public: take each pass out and
                        say what is lost.
       faults           FAULTS (pre-refine). Rendered behind the hatched rule —
                        the one ornamental mark in the system, which earns its
                        place by marking the one block that is an admission.  */
  critique: {
    reads_as:        '',
    coupling:        '',
    pass_order:      '',
    operators:       [],
    why_it_survives: '',
    faults:          []
  },

  /* --- ruling{} : a dated, attributed decision -----------------------------
     Ki-Landscapes/index.html:252 carries one today, in a CSS comment:
     "// crisp edge (solid to 94%) — CANON, do not soften (julia 2026-06-10)".
     A decision with a date and a name on it belongs in data, not in a comment
     nobody outside the file will ever read.  */
  ruling: { text: '', by: 'julia', date: '2026-08-29' },

  /* --- reference{} and pass0[] : the catalogue furniture -------------------
     Mostly for Components. `reference: null` is meaningful and prints "No
     decomposition on file for this entry" — a missing decomposition should be
     visible, not blank. In a reference cell, the arrow splits the cell:
     what the source does → what this does.  */
  reference: null,
  pass0: [
    { k: 'substrate', v: '' },
    { k: 'process',   v: '' }
  ],

  /* --- related[] : cross-links --------------------------------------------
     Declared on ONE side only; `index-tools.mjs --mirror` writes the back-link,
     so a broken back-link is not something a human can create by hand. Omit
     `tool` for a link inside this tool. relation is one of shader-behind,
     technique-of, variant-of, source-of, answers. Every related link must
     resolve or the build fails.  */
  related: [
    { entry: '13-fractal-brownian-motion', relation: 'variant-of' },
    { tool: 'components', entry: 'b2-riso-brush', relation: 'technique-of',
      href: '../components/#/b2-riso-brush', label: 'B2 Riso brush poster' }
  ],

  /* --- frame{} and isolation : the fragment lane only ----------------------
     Only for lane: 'fragment', where the specimen is a complete standalone
     HTML document in an iframe (src=, never srcdoc). designWidth is the width
     the piece was composed at: the entry view shows it at that width and the
     page scrolls, because a poster reflowed into a 240px card is a different
     composition, not a thumbnail. Nothing anywhere may read
     contentDocument — the child is opaque-origin under file:// and it would
     fail silently on Julia's machine. postMessage only.  */
  isolation: 'iframe',
  frame: { aspect: '3/2', designWidth: 1100, height: 'auto', previewHeight: 420 }
});
