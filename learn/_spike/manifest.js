/* ============================================================================
   _spike/manifest.js — the transport spike's manifest.
   A manifest is a classic script that self-registers. Its `entries` array
   names ids in order; each id is loaded from content/<id>/entry.js by an
   injected classic <script src>. Nothing here is fetched.

   This tool is a fixture, not a product: it lives inside learn/ (which is
   {"hidden":true}) and is not a root folder, so build-site.mjs's
   discoverTools() never sees it and it can never reach the landing page.
   ============================================================================ */
Shell.registerManifest({
  schemaVersion: 1,
  id: 'spike',
  title: 'Transport spike',
  mode: 'catalogue',
  stage: { adapter: 'fragment', aspect: '3/2' },
  sections: [
    { id: 'lanes',  title: 'Lanes',  order: 1 },
    { id: 'lenses', title: 'Lenses', order: 2 }
  ],
  styles: [
    { id: 'spike', title: 'Spike', summary: 'One style, so the fragments have a type file to link.' }
  ],
  entries: [
    'g-glsl',
    'c-canvas',
    'f1-lens', 'f2-lens', 'f3-lens', 'f4-lens', 'f5-lens', 'f6-lens', 'f7-lens'
  ]
});
