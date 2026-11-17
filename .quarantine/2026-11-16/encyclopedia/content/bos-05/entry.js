/* BOS-05 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/book-of-shaders/index.html:711-731
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'bos-05',
  index: 'BOS-05',
  title: `Sobel edge detection`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/book-of-shaders/index.html:711-731`,
    author: 'Julia Compton',
    note: `Fills an empty chapter correctly. Extend to show the kernel as data so other kernels can be swapped in.`
  },
  thumb: 'thumb.png',
  text: `<p>Luminance-space 3x3 Sobel with gradient magnitude.</p>
    <p><b>Note.</b> Fills an empty chapter correctly. Extend to show the kernel as data so other kernels can be swapped in.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/book-of-shaders/index.html:711-731</code> · GLSL · 17 — which the original book leaves as a bare heading
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
