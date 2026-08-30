/* BOS-06 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/book-of-shaders/index.html:860-880
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'bos-06',
  index: 'BOS-06',
  title: `Default procedural texture (Canvas2D landscape)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/book-of-shaders/index.html:860-880`,
    author: 'Julia Compton',
    note: `Quietly excellent: no asset, deliberately authored for the convolution chapters. Keep and extend.`
  },
  thumb: 'thumb.png',
  text: `<p>A high-contrast scene (gradient sky, sun, two hill bands, hard-edged geometric accents) drawn in Canvas2D so the image-processing chapters have a source with real edges without shipping a JPEG.</p>
    <p><b>Note.</b> Quietly excellent: no asset, deliberately authored for the convolution chapters. Keep and extend.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/book-of-shaders/index.html:860-880</code> · Canvas2D · 15-19 support
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
