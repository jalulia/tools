/* MM-03 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/artifacts/modemode-about-iso-field.html:104, 157-180
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mm-03',
  index: 'MM-03',
  title: `Isometric projection + painter's-algorithm depth sort`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/artifacts/modemode-about-iso-field.html:104, 157-180`,
    author: 'Julia Compton',
    note: `The sort key is the whole trick and is one line. Good 'matrices' successor chapter.`
  },
  thumb: 'thumb.png',
  text: `<p>proj(gx,gy,z) maps grid+height to screen; box() draws a 3-face iso cube; drawCrossAt sorts cells by (i+k)*128+j before painting.</p>
    <p><b>Note.</b> The sort key is the whole trick and is one line. Good 'matrices' successor chapter.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/artifacts/modemode-about-iso-field.html:104, 157-180</code> · Canvas2D · 8 (matrices) extended to 3D
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
