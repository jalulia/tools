/* ============================================================================
   Course-mode stub manifest.

   A fixture, not a product: it exercises every course-mode surface the shell
   draws — the staged build-up, named parameters, the four-rung ladder, the
   variant gallery, the 1-D plotter, an example strip at length, a
   known-failure entry, a stub entry, both lanes, and a critique block — so the
   design can be looked at before the real content migrates at checkpoints 3-4.

   It lives inside learn/, which is {"hidden": true}, and it is not a root
   folder, so build-site.mjs's discoverTools() never sees it.
   ============================================================================ */
Shell.registerManifest({
  schemaVersion: 1,
  id: 'course-stub',
  title: 'The Book of Shaders',
  subtitle: 'course-mode stub',
  mode: 'course',
  stage: { adapter: 'glsl', aspect: '3/2' },
  siblings: [
    { id: 'course-stub',    title: 'Shaders',    href: '../course/' },
    { id: 'catalogue-stub', title: 'Components', href: '../catalogue/' }
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
    { id: 'getting-started',     title: 'Getting started',     order: 1 },
    { id: 'algorithmic-drawing', title: 'Algorithmic drawing', order: 2 },
    { id: 'generative',          title: 'Generative designs',  order: 3 },
    { id: 'image-processing',    title: 'Image processing',    order: 4 }
  ],
  entries: [
    '01-hello',
    '05-shaping',
    '07-shapes',
    '13-fbm',
    '20-ridge-paint',
    '17-kernel'
  ]
});
