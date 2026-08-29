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

   SECTIONS are the book's own four groups, in the book's order.

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
      note: 'A shader with an image to read. Four of these five are ours.' }
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
    '19-other-effects'
  ]
});
