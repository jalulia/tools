/* MM-02 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/artifacts/modemode-about-iso-field.html:121-146
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mm-02',
  index: 'MM-02',
  title: `Marching-squares iso-contour extraction`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/artifacts/modemode-about-iso-field.html:121-146`,
    author: 'Julia Compton',
    note: `The book never teaches contour extraction. This is a genuine addition, not a condensation. Also at the-field.html:125-138 (msFlat) and five-ways.html:490-503 (msContour) — three copies, so extract once.`
  },
  thumb: 'thumb.png',
  text: `<p>Full 16-case marching-squares with linear edge interpolation; extracts iso-lines from an arbitrary scalar field at N levels.</p>
    <p><b>Note.</b> The book never teaches contour extraction. This is a genuine addition, not a condensation. Also at the-field.html:125-138 (msFlat) and five-ways.html:490-503 (msContour) — three copies, so extract once.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/artifacts/modemode-about-iso-field.html:121-146</code> · Canvas2D · no BoS equivalent — new chapter
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
