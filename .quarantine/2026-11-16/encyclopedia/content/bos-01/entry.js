/* BOS-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/book-of-shaders/index.html:536-544
   The researcher's grade (A-) and editorial_status
   (technical_reference) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'bos-01',
  index: 'BOS-01',
  title: `Value noise (playground implementation)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · technical_reference',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/book-of-shaders/index.html:536-544`,
    author: 'Julia Compton',
    note: `Correct, but uses the smoothstep fade where the book's own chapter argues for the quintic. Compare with KI-02.`
  },
  thumb: 'thumb.png',
  text: `<p>Four-corner hash with smoothstep fade and the expanded bilinear form.</p>
    <p><b>Note.</b> Correct, but uses the smoothstep fade where the book's own chapter argues for the quintic. Compare with KI-02.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/book-of-shaders/index.html:536-544</code> · GLSL · 11
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
