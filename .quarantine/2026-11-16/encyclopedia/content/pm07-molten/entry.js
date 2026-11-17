/* PM7 · Molten — PM-07, written for this library.

   The striking artefact the set lacked. Twenty-seven lenses and not one of
   them is loud; this one is, and it earns it by being a press fact rather than
   an effect — the letters run because a per-column decayed maximum drags them,
   and everything else on the plate is that same field read again. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  instance_of: ["oklab-ramp-driver"],
  uses: ["paper-tooth","oklab-ramp"],
  governed_by: ["components-craft"],
  id: 'pm07-molten',
  index: 'PM7',
  order: 65,
  title: 'Molten',
  section: 'print-reproduction',
  style: 'riso-xerox',
  status: 'canonical',
  tags: ['Extruded type', 'Riso/Xerox', 'Halftone', 'Hot ramp'],

  source: {
    kind: 'original',
    title: 'PM-07 — printed matter studies, ST.13 MOLTEN',
    author: 'Julia Compton',
    date: '2026',
    note: 'Written for this library. The melt engine — the per-column decayed ' +
          'maximum, the depth-growing horizontal wander, the seven-stop hot ramp ' +
          'and the rotated screen — is ported from her own ' +
          'corpus/downloads/printed-matter-studies_6.html:1536–1630, constants ' +
          'included. The seeding, the glow, the second drum, the paper and the ' +
          'poster around it are this build.'
  },

  frame: { designWidth: 1100, aspect: '1100/1240', previewHeight: 1240 },
  thumb: { file: 'thumb.png', crop: [1, 0] },

  text: `
    <p>A word is set white-hot at the top of a buffer and then dragged
    downwards by a <strong>per-column decayed maximum</strong>:
    <code>acc = max(source, acc × decay)</code>, once per row, with every
    column carrying its own decay length from a 1-D noise. That single line is
    why the letters <em>run</em> instead of blurring. A blur is symmetric; this
    is not, and the asymmetry is the direction gravity is pulling in.</p>

    <p>Everything else on the plate is that same buffer read again. The colour
    is the buffer through a seven-stop ramp. The glow is the buffer averaged
    down to a ninth of its size and drawn back up — the upscale <em>is</em> the
    blur, so the light is necessarily the shape of the thing emitting it. The
    second drum is the buffer again, inked brick, offset five pixels and turned
    a third of a degree, alive only in the mid-tones where the black is thin.
    The screen bites hardest in the darks. The pinholes only open where there
    is enough ink to fail.</p>

    <p>The reproduction is this library's rather than the study's. The original
    is a screen piece on a black ground; this is a two-drum riso on bone stock,
    because a poster that is <em>about</em> ink running out has to be printed
    to mean anything.</p>`,

  reference: {
    title: 'PM-07 — printed matter studies, ST.13 MOLTEN',
    cells: [
      { k: 'The melt',
        v: 'Per-column decayed maximum down the buffer, each column with its own decay length from a 1-D value noise; then a horizontal wander whose amplitude grows below 30% depth. → verbatim, constants included.' },
      { k: 'Colour',
        v: 'A seven-stop ramp from the deep ground to a white core, applied to the melt raised to the 1.25. → verbatim, and read here as the black drum\'s tone curve rather than as a palette.' },
      { k: 'The glow',
        v: 'Two blur(16px) / blur(48px) passes of the finished image, screened back at .55 and .35. → replaced. A ninth-scale box average of the melt buffer, upscaled and screened at .28 / .13: same light, no filter, and it comes from the field rather than from the picture of it.' },
      { k: 'The screen',
        v: 'A rotated dot lattice at pitch 5, radius following 1 − luminance, darkening what it touches — strongest in the darks. → kept, angle moved 21° → 12° so it does not beat against the type\'s own −0.16 rad tilt.' },
      { k: 'Edge',
        v: 'A radial gradient darkening the corners: "dark edges hold the light". → kept.' },
      { k: 'Seeding',
        v: 'Both noise tables are filled from Math.random(), so every load is a different plate. → Comp.mulberry32(1307), and the seed is printed in the colophon.' }
    ]
  },

  pass0: [
    { k: 'Substrate', v: 'bone 140 gsm uncoated, per-pixel tooth from a 180 px tile with fibres, multiplied under everything' },
    { k: 'Process', v: 'two-drum riso: drum 01 black through a 12° dot screen, drum 02 brick at +5 px and −0.35°, surviving only where the black is thin; coverage fails as pinholes where the field is heaviest; the block edge burns to paper rather than ending on a rule' },
    { k: 'Type', v: 'Archivo Black for the melted word, set inside the canvas so it is genuinely rasterised before it runs; Anton for the MOLTEN wordmark, printed twice out of register; Saira Condensed 700 for the subhead; EB Garamond for the one paragraph; JetBrains Mono for the drum legend and the colophon' },
    { k: 'Hardware', v: 'none. The only non-printed mark is the pencil edition number, applied after the run, which takes the paper but never the ink' },
    { k: 'Skeleton', v: 'a 56cqw image block down the left two thirds; a right column carrying the wordmark, a rule, the subhead, one paragraph, the drum legend and the edition mark; a colophon on a hairline across the foot.' }
  ],

  critique: {
    reads_as: 'A riso poster of a word that was still hot when it went through the press — not an image with a melt filter on it.',
    coupling: 'One field, six consequences. The melt buffer decides the colour, the glow, the second drum\'s alpha, where the screen darkens, where the pinholes may open and how far the run reaches — and none of them is computed from anything else. The glow in particular cannot drift from the letters, because it is a box average of the same numbers rather than a blur of the picture they made.',
    pass_order: 'word → melt → wander → ramp → glow → second drum → screen → pinholes → edge. The glow is before the screen because a screened image blurred is a picture of dots, not of light. The second drum is before the screen because one screen prints both drums — a duplicator has one drum angle per run and this plate declares 12° once. The pinholes are after the screen because starvation is a coverage failure of the ink that is actually on the sheet, and the screen is what decides how much that is.',
    operators: ['column decay', 'depth-scaled wander', 'hot ramp', 'upscale glow', 'misregistration', 'dot screen', 'toner starve'],
    why_it_survives: 'Remove the wander and the drips fall in straight lines and the plate looks extruded rather than molten. Remove the decay variation and every column falls the same distance, which is a gradient. Remove the second drum and the mid-tones go dead, because the brick is the only thing living in them.',
    faults: [
      'The source seeds both noise tables from Math.random(), so the melt is different on every load and the poster has no identity — the same defect the inventory grades a known failure in MIR-19. It is Comp.mulberry32(1307) here and the seed is printed on the sheet, which is the only way anyone can tell whether they are looking at the same plate twice.',
      'The source\'s bloom is two blur() passes over the finished image. A blur standing in for light is the same move as a gradient standing in for a photograph, and it is the one pass in the study with no cause. Rebuilt as a ninth-scale average of the melt buffer, upscaled.',
      'The word is barely a word by the time the run reaches the foot of the plate, and at contact-sheet size the whole image reads as a flame rather than as type. The crop is authored to open on the letters for that reason, which is a presentation fix for a composition problem.',
      'The image block is one canvas at ×1.25 with four full-buffer passes over it — the word, the melt, the wander and the ramp — plus a screen pass and a pinhole pass. 3.72 MB at 1440, which is mid-pack, but the work is O(W·H) six times and the plate cannot be re-seeded interactively without a visible pause.',
      'The right column empties between the paragraph and the drum legend. A poster margin is allowed to be empty; this one is empty by 100 px more than it was designed to be, and the honest fix is a second element rather than more leading.'
    ]
  },

  ruling: {
    // CK8 · AUDIT. This was written during the build and signed 'julia'. It
    // does not trace to any comment in her repositories (grep of
    // /home/claude/corpus finds nothing for it), so it is a PROPOSAL until she
    // makes it. The argument stands; the attribution did not.
    text: 'The glow comes out of the field or it does not go on the sheet. No blur passes.',
    by: 'proposed',
    date: '2026-08-29'
  },

  related: [
    { entry: 'c1-heavy-ink', relation: 'technique-of' },
    { entry: 'b1-photocopy-collage', relation: 'variant-of' },
    { tool: 'book-of-shaders', entry: '00-introduction', relation: 'shader-behind',
      label: 'The Book of Shaders — 00 Introduction' },
    { tool: 'book-of-shaders', entry: '06-colors', relation: 'technique-of',
      label: 'The Book of Shaders — 06 Colors' }
  ]
});
