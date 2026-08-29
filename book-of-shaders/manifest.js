/* ============================================================================
   book-of-shaders/manifest.js

   The roster, and nothing else. Every chapter's title, prose, shader,
   exercises and provenance live in content/<id>/entry.js — one folder, one
   self-registering classic script — so that adding a chapter is a folder drop
   plus one line here, and so that two people can add two chapters without
   touching the same bytes. That is the whole point of the migration: the tool
   this replaces held all nineteen chapters in one 512-line array literal
   inside a 45 KB HTML file.

   NUMBERING (PLAN §5.4). The chapters are numbered onto the upstream book's
   own 00-18, so the book's 131 .frag files are a `cp` rather than a
   translation. The tool's old 01-19 already lined up with 01-18; what was
   missing was 00, which is written here, and what was never said out loud is
   that four of these chapters are not the book's at all:

     14 Fractals             upstream 14 is "Coming soon ..." and ten links
     16 Image operations     upstream 16 is 504 bytes of README
     17 Kernel convolutions  upstream 17 is the string "## Kernel convolutions"
     18 Filters              upstream 18 is the string "## Filters"

   Those four carry source.kind: 'original'. 19 Other effects is listed in the
   book's contents and was never given a chapter at all; it is kept, marked
   'original', and filed as an exploration rather than as canon.

   CHECKPOINT 4 adds two more chapters and four worked examples.

     20 Dithering and quantization   the book has no chapter on it at all
     21 Domain warping               the chapter the book's own 13 promises

   Both are 'original' and both sit in a fifth section, BEYOND THE BOOK, rather
   than being filed into one of the book's four groups — because they are not
   condensations of anything and the rail should say so without a footnote.

   The sixth section, WORKED EXAMPLES, is a different kind of entry: four
   finished pieces out of Julia's own repositories, ported to this stage, each
   carrying the critique block it had to survive to be shown as canon. One is
   status 'known-failure' and is asserted to fail.

   LICENCE (2026-08-29). The upstream book is all-rights-reserved; it permits
   linking and citation and not redistribution. No upstream .frag file exists
   anywhere in this repository. Every shader here is written here, and the book
   is credited as the source of the IDEA via source.kind 'adapted' plus a link.

   SECTIONS are the book's own four groups, in the book's order, then two of
   ours.

   COUNTS. entries.length is the only source of a count anywhere on any page —
   the masthead's "3 / 20", the rail, the contact sheet heading. Nothing
   restates it, and scripts/build-site.mjs fails the deploy if index.html,
   tool.json or README.md states a number that does not derive from it.
   ============================================================================ */
Shell.registerManifest({
  schemaVersion: 1,
  id: 'book-of-shaders',
  title: 'The Book of Shaders',
  subtitle: 'adapted, and extended where the book stops',
  mode: 'course',
  stage: { adapter: 'glsl', runtime: '../learn/adapters/glsl.js', aspect: '3/2' },

  siblings: [
    { id: 'book-of-shaders', title: 'Shaders',    href: '../book-of-shaders/' },
    { id: 'components',      title: 'Components', href: '../components/' }
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
    { id: 'getting-started',     title: 'Getting started',     order: 1,
      note: 'What a fragment shader is, and the four values it is given.' },
    { id: 'algorithmic-drawing', title: 'Algorithmic drawing', order: 2,
      note: 'Turning a position into a value, and a value into a picture.' },
    { id: 'generative',          title: 'Generative designs',  order: 3,
      note: 'Controlled disorder: hashes, noise, cells, octaves.' },
    { id: 'image-processing',    title: 'Image processing',    order: 4,
      note: 'A shader with an image to read. Four of these five are ours.' },
    { id: 'beyond',              title: 'Beyond the book',     order: 5,
      note: 'Two chapters the book does not have: what happens when a value runs out of levels, and what happens when a field warps its own input.' },
    { id: 'worked-examples',     title: 'Worked examples',     order: 6,
      note: 'Finished pieces with their reasoning attached — the read, the coupling, the pass order, and what would collapse if a pass were removed. One of them does not work, on purpose.' }
  ],

  entries: [
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

    'w1-seven-pass-band-chain',
    'w2-depth-aware-dither',
    'w3-hillshade-and-flow',
    'w4-a-shader-that-does-not-link'
  ]
});
