/* KLS-06 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/Ki-Landscapes/index.html:77-100
   The researcher's grade (A) and editorial_status
   (technical_reference) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'kls-06',
  index: 'KLS-06',
  title: `OKLab / OKLCh conversion, hue rotation and Lab-space ramp interpolation`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · technical_reference',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/Ki-Landscapes/index.html:77-100`,
    author: 'Julia Compton',
    note: `Duplicate of KI-04 (tools-repo/ki-landscapes:192-210) but this copy adds okToLab / biomeLab / labStr. Merge into lib/ once; prefer this version's API.`
  },
  thumb: 'thumb.png',
  text: `<p>sRGB->linear->OKLab->OKLCh and back, plus okToLab, lerpLab, biomeLab (piecewise ramp sampling) and labStr.</p>
    <p><b>Note.</b> Duplicate of KI-04 (tools-repo/ki-landscapes:192-210) but this copy adds okToLab / biomeLab / labStr. Merge into lib/ once; prefer this version's API.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/Ki-Landscapes/index.html:77-100</code> · Canvas2D / colour · 06 (colour)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
