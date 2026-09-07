/* KL1 · Ki landscape — KLS-01, written for this library.

   The only lens that is about painting. Twenty-eight plates reproduce
   something that was printed; this one reproduces something that was painted,
   and the seven passes that takes are the subject rather than the finish.
   Its worked-example twin lives in the other tool: `related` points at W1 and
   at chapter 13, and the two are meant to be read together. */
Shell.registerEntry({
  id: 'kls01-ki-landscape',
  index: 'KL1',
  order: 68,
  title: 'Ki landscape',
  section: 'print-reproduction',
  style: 'atmospheric',
  status: 'canonical',
  tags: ['Painting', 'Compositing', 'Order dependence', 'OKLab'],

  source: {
    kind: 'original',
    title: 'KLS-01 — Ki-Landscapes, the seven-pass band chain',
    author: 'Julia Compton',
    date: '2026',
    note: 'Written for this library. The seven passes, their order, their blend ' +
          'modes, the per-band drift and the crest lift are ported from her own ' +
          'Ki-Landscapes/index.html:260–332, by way of the Book of Shaders worked ' +
          'example W1 which reduced the same chain to one still frame. The colour ' +
          'is interpolated in OKLab here, which W1 records as a loss it could not ' +
          'repair; the sun\'s 94% edge is KLS-07, carried with its ruling.'
  },

  frame: { designWidth: 1100, aspect: '1100/1050', previewHeight: 1050 },
  thumb: { file: 'thumb.png', crop: [1, 0] },

  text: `
    <p>Eleven depth bands, painted from the back forwards. Each band is a ridge
    line, a fill, and then <strong>seven passes laid one over the other inside
    that band's own silhouette</strong> — a watercolour wash, granulation where
    the pigment settles in the body, a crisp cut-paper edge along the ridge, an
    edge bloom that hugs the crest, a catch-light on the very top of it, edge
    pooling burned inside the bloom, and paper grain.</p>

    <p>Seven is the number at which a piece usually stops being a system and
    becomes a pile. What keeps this one a system is not visible in the picture;
    it is visible in the code. Every pass is clipped to the same path. Every
    pass is offset by the same <code>drift</code> — the scroll converted into
    pixels <em>at that band's own parallax rate</em> — so all seven textures
    travel with the land instead of sitting in front of it. Every pass is
    tinted from the same <code>mid</code> colour, taken from the middle of that
    band's own gradient. Three shared causes, seven consequences.</p>

    <div class="note"><span class="lab">The line the horizon depends on</span>
      <p>The crest catch-light lifts by a <em>fraction of the remaining
      headroom to white</em>, not by a fixed amount. A far band is already pale
      with haze; add a fixed lift and it clips, and the horizon becomes a flat
      white bar across the top of the picture. Multiply the headroom instead
      and the same line serves a hazed far band and a deep near one.</p>
    </div>

    <p>Presented as an edition print rather than as a screen: a plate on bone
    stock with a margin, a drawdown strip recording the seven passes and the
    tint each was taken from, and a pencil mark that was made after the
    printing and so takes the tooth but never the ink.</p>`,

  reference: {
    title: 'KLS-01 — Ki-Landscapes/index.html:260–332',
    cells: [
      { k: 'The chain',
        v: 'Seven passes per band: wash (soft-light), granulation (multiply), cut-paper edge (stroke), edge bloom (stamped strip), crest light (headroom lift), edge pooling (multiply), paper grain (soft-light). → all seven, in that order, with their blend modes and alphas.' },
      { k: 'The drift',
        v: 'gdrift = journey × (0.12 + 0.9t) × W / wavelength(band): the scroll in pixels at that band\'s parallax rate, and every pass offsets by it. → verbatim. It is the reason the textures belong to the land.' },
      { k: 'The tint',
        v: 'Every pass is coloured from midCol, the colour at the middle of that band\'s own horizontal gradient. → verbatim, but read in OKLab: shade() moves L, it does not scale an sRGB triple.' },
      { k: 'The crest',
        v: 'Lifted by a fraction of the remaining headroom to white so hazed far bands never clip. → verbatim, and now doing more work, because the OKLab ramp puts the far bands higher.' },
      { k: 'The sun',
        v: 'A radial gradient solid to 94% and then off — "crisp edge, CANON, do not soften (julia 2026-06-10)". → carried, with the ruling attached to this entry.' },
      { k: 'The film',
        v: 'No pinned global film. Wash, granulation, edge, bloom, crest, pooling and grain are ALL per band; only the vignette sits outside the loop, and it is the frame. → verbatim, and it is the discipline the four known-failure films in the corpus break.' }
    ]
  },

  pass0: [
    { k: 'Substrate', v: 'bone 140 gsm, per-pixel tooth from a 180 px tile, multiplied under the whole sheet; the print itself is inset with a 1 px plate mark and no shadow' },
    { k: 'Process', v: 'not a reproduction — a painting. Eleven clipped bands, seven passes each: two soft-lights, two multiplies, one stroke, two stamped 1 px strips. The paper grain is mean-preserving over mid-grey, so it is a tooth and not a darkening film' },
    { k: 'Type', v: 'Fraunces for the title, roman and italic in one line at one size; Archivo for the two paragraphs and the pass names; JetBrains Mono for the masthead, the drawdown strip and the foot; Caveat for the two pencil marks' },
    { k: 'Hardware', v: 'none. The only object on the sheet is the print, and the only marks not printed are the pencil ones' },
    { k: 'Skeleton', v: 'masthead on a rule; a 99:50 plate inset in the sheet; a two-column title block, 1.35fr against 1fr; a seven-column drawdown strip on a full-ink rule; two pencil marks at the outer corners; a foot on a hairline.' }
  ],

  critique: {
    reads_as: 'An edition print of a watercolour panorama, with the press\'s own record of how it was made printed under it.',
    coupling: 'Three causes, seven consequences, and none of the seven takes a coordinate, an alpha or a colour that is not derived from one of them. The drift decides where every texture sits; the clip path decides where every pass may go; the mid colour decides what every pass is tinted from. That is why swapping any two passes is visibly wrong AND legibly wrong — the picture breaks in a way you can name.',
    pass_order: 'wash → granulation → edge → bloom → crest → pooling → grain. The granulation multiplies and the wash soft-lights: swap them and the wash multiplies against a body that has already been darkened, the hue shifts and the band goes muddy. The pooling burns INSIDE the bloom\'s reach — put it before the bloom and there is no reach to be inside of. The grain is last because it is the paper, and paper is under everything or over everything; it is never in the middle.',
    operators: ['clipped band', 'parallax drift', 'watercolour wash', 'granulation', 'cut-paper edge', 'edge bloom', 'headroom lift', 'edge pooling', 'mean-preserving tooth'],
    why_it_survives: 'Remove the drift and all seven textures pin to the frame while the land moves under them, which is the exact failure the corpus records four times as a pinned film. Remove the crest lift and the far bands lose their edge into the haze. Remove the cut-paper line and the bands stop being cut paper and become fog.',
    faults: [
      'The panorama is one still frame of something that was built to travel. The drift is a constant here, so the parallax is stated rather than shown, and the piece loses the one thing that made the coupling self-evident in the original — that the textures move WITH the land.',
      'The band count is eleven and the ridge fbm has four octaves, which is enough at 1100 px and visibly not enough if the plate were ever printed larger. The far bands read as smooth where they should read as hazed detail.',
      'The scratch buffer for passes 2 and 6 is a second full-size canvas. It is released as soon as the paint finishes, which keeps the measured backing store honest, but during the paint this lens allocates twice what it reports.',
      'The drawdown strip prints seven tints of one mid colour, which is true and which also makes swatches 01 and 07 nearly identical. A strip whose swatches cannot be told apart is a strip doing less work than its space.'
    ]
  },

  ruling: {
    text: 'Crisp edge on the sun — solid to 94%. CANON, do not soften.',
    by: 'julia',
    date: '2026-06-10'
  },

  related: [
    { entry: 'e4-masonry-cards', relation: 'technique-of' },
    { entry: 'e5-case-card', relation: 'variant-of' },
    { tool: 'book-of-shaders', entry: 'w1-seven-pass-band-chain', relation: 'shader-behind',
      label: 'The Book of Shaders — W1 Seven passes on one ridge' },
    { tool: 'book-of-shaders', entry: '13-fractal-brownian-motion', relation: 'technique-of',
      label: 'The Book of Shaders — 13 Fractal Brownian Motion' },
    { tool: 'book-of-shaders', entry: '10-random', relation: 'technique-of',
      label: 'The Book of Shaders — 10 Random' }
  ]
});
